import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeListing } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { buyerId: auth.sub },
    include: {
      listing: { include: { photos: true, seller: { include: { sellerProfile: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings: favorites.map((f) => serializeListing(f.listing)) });
}

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.listingId) {
    return NextResponse.json({ error: "listingId requis" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: body.listingId } });
  if (!listing) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });

  await prisma.favorite.upsert({
    where: { buyerId_listingId: { buyerId: auth.sub, listingId: body.listingId } },
    create: { buyerId: auth.sub, listingId: body.listingId },
    update: {},
  });

  return new NextResponse(null, { status: 204 });
}
