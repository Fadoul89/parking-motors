import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeListing, serializeUser } from "@/lib/serialize";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (auth.role !== "ADMIN") return NextResponse.json({ error: "Action réservée aux administrateurs" }, { status: 403 });

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { sellerProfile: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const listings = await prisma.listing.findMany({
    where: { sellerId: params.id },
    include: { photos: true, seller: { include: { sellerProfile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    user: serializeUser(user),
    listings: listings.map(serializeListing),
  });
}
