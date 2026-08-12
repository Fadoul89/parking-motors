import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeListing } from "@/lib/serialize";
import { syncExpiredListings } from "@/lib/expireListings";

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  await syncExpiredListings();

  const listings = await prisma.listing.findMany({
    where: { sellerId: auth.sub },
    include: { photos: true, seller: { include: { sellerProfile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings: listings.map(serializeListing) });
}
