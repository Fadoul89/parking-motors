import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeListing } from "@/lib/serialize";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (auth.role !== "ADMIN") return NextResponse.json({ error: "Action réservée aux administrateurs" }, { status: 403 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });

  const nextStatus = listing.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";

  const updated = await prisma.listing.update({
    where: { id: params.id },
    data: { status: nextStatus },
    include: { photos: true, seller: { include: { sellerProfile: true } } },
  });

  return NextResponse.json({ listing: serializeListing(updated) });
}
