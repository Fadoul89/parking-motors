import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeListing } from "@/lib/serialize";
import { MAX_OFFERS_PER_DAY_PER_LISTING, MIN_OFFER_RATIO, startOfToday } from "@/lib/offers";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (auth.role !== "BUYER") {
    return NextResponse.json({ error: "Seul un acheteur peut faire une offre" }, { status: 403 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const amount = Number(body?.amount);
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Montant d'offre invalide" }, { status: 400 });
  }

  const minAmount = Math.ceil(listing.price * MIN_OFFER_RATIO);
  if (amount < minAmount) {
    return NextResponse.json(
      { error: `Offre trop basse : minimum ${minAmount.toLocaleString()} FCFA (${MIN_OFFER_RATIO * 100}% du prix affiché)` },
      { status: 400 }
    );
  }

  const offersToday = await prisma.offer.count({
    where: { listingId: params.id, buyerId: auth.sub, createdAt: { gte: startOfToday() } },
  });
  if (offersToday >= MAX_OFFERS_PER_DAY_PER_LISTING) {
    return NextResponse.json(
      { error: `Limite de ${MAX_OFFERS_PER_DAY_PER_LISTING} offres par jour atteinte pour cette annonce` },
      { status: 429 }
    );
  }

  await prisma.offer.create({
    data: { listingId: params.id, buyerId: auth.sub, amount },
  });

  const updated = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      photos: true,
      seller: { include: { sellerProfile: true } },
      offers: { include: { buyer: true } },
    },
  });

  return NextResponse.json({ listing: serializeListing(updated!) }, { status: 201 });
}
