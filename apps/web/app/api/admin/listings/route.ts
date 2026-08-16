import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeListing } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (auth.role !== "ADMIN") return NextResponse.json({ error: "Action réservée aux administrateurs" }, { status: 403 });

  const listings = await prisma.listing.findMany({
    include: { photos: true, seller: { include: { sellerProfile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings: listings.map(serializeListing) });
}
