import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeListing } from "@/lib/serialize";
import { syncExpiredListings } from "@/lib/expireListings";
import { FREE_SELLER_LISTING_LIMIT, isPremiumActive } from "@/lib/premium";
import type { Prisma } from "@prisma/client";

const LISTING_INCLUDE = {
  photos: true,
  seller: { include: { sellerProfile: true } },
} satisfies Prisma.ListingInclude;

export async function GET(req: NextRequest) {
  await syncExpiredListings();

  const sp = req.nextUrl.searchParams;
  const where: Prisma.ListingWhereInput = { status: "ACTIVE" };

  const brand = sp.get("brand");
  const model = sp.get("model");
  const city = sp.get("city");
  const priceMin = sp.get("priceMin");
  const priceMax = sp.get("priceMax");
  const year = sp.get("year");
  const fuel = sp.get("fuel");
  const transmission = sp.get("transmission");
  const vehicleType = sp.get("vehicleType");
  const condition = sp.get("condition");
  const saleType = sp.get("saleType");

  if (brand) where.brand = { contains: brand, mode: "insensitive" };
  if (model) where.model = { contains: model, mode: "insensitive" };
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (year) where.year = Number(year);
  if (fuel) where.fuel = fuel as Prisma.EnumFuelTypeFilter["equals"];
  if (transmission) where.transmission = transmission as Prisma.EnumTransmissionFilter["equals"];
  if (vehicleType) where.vehicleType = vehicleType as Prisma.EnumVehicleTypeFilter["equals"];
  if (condition) where.condition = condition as Prisma.EnumConditionFilter["equals"];
  if (saleType) where.saleType = saleType as Prisma.EnumSaleTypeFilter["equals"];
  if (priceMin || priceMax) {
    where.price = {
      ...(priceMin ? { gte: Number(priceMin) } : {}),
      ...(priceMax ? { lte: Number(priceMax) } : {}),
    };
  }

  const listings = await prisma.listing.findMany({
    where,
    include: LISTING_INCLUDE,
    // Les annonces des vendeurs Premium sont mises en avant en première position.
    orderBy: [{ seller: { sellerProfile: { isPremium: "desc" } } }, { createdAt: "desc" }],
  });

  return NextResponse.json({ listings: listings.map(serializeListing) });
}

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (auth.role !== "SELLER") {
    return NextResponse.json({ error: "Seul un vendeur peut publier une annonce" }, { status: 403 });
  }

  const seller = await prisma.user.findUnique({
    where: { id: auth.sub },
    include: { sellerProfile: true },
  });
  if (!seller?.sellerProfile?.nom || !seller.sellerProfile.prenom || !seller.sellerProfile.telephone) {
    return NextResponse.json(
      { error: "Complétez votre nom, prénom et téléphone avant de publier une annonce" },
      { status: 403 }
    );
  }

  const isPremium = isPremiumActive(seller.sellerProfile.isPremium, seller.sellerProfile.premiumExpiresAt);
  if (!isPremium) {
    const activeListingCount = await prisma.listing.count({
      where: { sellerId: auth.sub, status: "ACTIVE" },
    });
    if (activeListingCount >= FREE_SELLER_LISTING_LIMIT) {
      return NextResponse.json(
        {
          error: `Limite de ${FREE_SELLER_LISTING_LIMIT} annonces atteinte pour un compte gratuit. Passez Premium pour publier davantage.`,
        },
        { status: 403 }
      );
    }
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });

  const required = [
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
    "description",
  ];
  const missing = required.filter((k) => body[k] === undefined || body[k] === null || body[k] === "");
  if (missing.length) {
    return NextResponse.json({ error: `Champs manquants: ${missing.join(", ")}` }, { status: 400 });
  }

  const flashHours = body.flashHours === 24 || body.flashHours === 48 ? body.flashHours : null;

  const listing = await prisma.listing.create({
    data: {
      sellerId: auth.sub,
      title: body.title,
      brand: body.brand,
      model: body.model,
      price: Number(body.price),
      year: Number(body.year),
      mileage: Number(body.mileage),
      fuel: body.fuel,
      transmission: body.transmission,
      vehicleType: body.vehicleType,
      condition: body.condition,
      saleType: body.saleType,
      city: body.city,
      description: body.description,
      isFlash: !!flashHours,
      expiresAt: flashHours ? new Date(Date.now() + flashHours * 60 * 60 * 1000) : null,
    },
    include: LISTING_INCLUDE,
  });

  return NextResponse.json({ listing: serializeListing(listing) }, { status: 201 });
}
