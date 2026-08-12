import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeListing } from "@/lib/serialize";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const existing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  if (existing.sellerId !== auth.sub) {
    return NextResponse.json({ error: "Action non autorisée" }, { status: 403 });
  }

  const listing = await prisma.listing.update({
    where: { id: params.id },
    data: { status: "ACTIVE", expiresAt: null },
    include: { photos: true, seller: { include: { sellerProfile: true } } },
  });

  return NextResponse.json({ listing: serializeListing(listing) });
}
