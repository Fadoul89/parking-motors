import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeListing } from "@/lib/serialize";
import { syncExpiredListings } from "@/lib/expireListings";
import { isPremiumActive } from "@/lib/premium";
import type { Prisma } from "@prisma/client";

const LISTING_INCLUDE = {
  photos: true,
  seller: { include: { sellerProfile: true } },
} satisfies Prisma.ListingInclude;

const LISTING_DETAIL_INCLUDE = {
  photos: true,
  seller: { include: { sellerProfile: true } },
  offers: { include: { buyer: true } },
} satisfies Prisma.ListingInclude;

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await syncExpiredListings();

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: LISTING_DETAIL_INCLUDE,
  });
  if (!listing) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  return NextResponse.json({ listing: serializeListing(listing) });
}

async function requireOwner(req: NextRequest, id: string) {
  const auth = await getAuth(req);
  if (!auth) return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return { error: NextResponse.json({ error: "Annonce introuvable" }, { status: 404 }) };
  if (listing.sellerId !== auth.sub) {
    return { error: NextResponse.json({ error: "Action non autorisée" }, { status: 403 }) };
  }
  return { listing };
}

const UPDATABLE_FIELDS = [
  "title",
  "brand",
  "model",
  "price",
  "year",
  "mileage",
  "fuel",
  "transmission",
  "vehicleType",
  "condition",
  "saleType",
  "city",
  "country",
  "description",
  "status",
] as const;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, listing: existing } = await requireOwner(req, params.id);
  if (error) return error;
  if (existing!.status === "SUSPENDED") {
    return NextResponse.json(
      { error: "Cette annonce a été suspendue par un administrateur et ne peut pas être modifiée" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });

  const data: Record<string, unknown> = {};
  for (const field of UPDATABLE_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (data.price !== undefined) data.price = Number(data.price);
  if (data.year !== undefined) data.year = Number(data.year);
  if (data.mileage !== undefined) data.mileage = Number(data.mileage);

  if (typeof data.country === "string" && data.country !== "Tchad") {
    const seller = await prisma.user.findUnique({
      where: { id: existing!.sellerId },
      include: { sellerProfile: true },
    });
    const isPremium = isPremiumActive(
      !!seller?.sellerProfile?.isPremium,
      seller?.sellerProfile?.premiumExpiresAt ?? null
    );
    if (!isPremium) {
      return NextResponse.json(
        { error: "Publier une annonce depuis un autre pays est réservé aux vendeurs Premium" },
        { status: 403 }
      );
    }
  }

  const listing = await prisma.listing.update({
    where: { id: params.id },
    data,
    include: LISTING_INCLUDE,
  });

  return NextResponse.json({ listing: serializeListing(listing) });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireOwner(req, params.id);
  if (error) return error;

  await prisma.listing.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
