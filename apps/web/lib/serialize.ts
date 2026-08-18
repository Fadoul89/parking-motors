import type { Listing as PrismaListing, ListingPhoto, Offer, SellerProfile, User } from "@prisma/client";
import { isPremiumActive } from "@/lib/premium";

type ListingWithRelations = PrismaListing & {
  photos: ListingPhoto[];
  seller?: (User & { sellerProfile: SellerProfile | null }) | null;
  offers?: (Offer & { buyer: User })[];
};

export function serializeUser(user: User & { sellerProfile: SellerProfile | null }) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt.toISOString(),
    sellerProfile: user.sellerProfile
      ? {
          nom: user.sellerProfile.nom,
          prenom: user.sellerProfile.prenom,
          telephone: user.sellerProfile.telephone,
          isPremium: isPremiumActive(user.sellerProfile.isPremium, user.sellerProfile.premiumExpiresAt),
          premiumExpiresAt: user.sellerProfile.premiumExpiresAt
            ? user.sellerProfile.premiumExpiresAt.toISOString()
            : null,
        }
      : null,
  };
}

export function serializeListing(listing: ListingWithRelations) {
  return {
    id: listing.id,
    sellerId: listing.sellerId,
    title: listing.title,
    brand: listing.brand,
    model: listing.model,
    price: listing.price,
    year: listing.year,
    mileage: listing.mileage,
    fuel: listing.fuel,
    transmission: listing.transmission,
    vehicleType: listing.vehicleType,
    condition: listing.condition,
    saleType: listing.saleType,
    city: listing.city,
    country: listing.country,
    description: listing.description,
    status: listing.status,
    isFlash: listing.isFlash,
    createdAt: listing.createdAt.toISOString(),
    expiresAt: listing.expiresAt ? listing.expiresAt.toISOString() : null,
    photos: listing.photos
      .sort((a, b) => a.order - b.order)
      .map((p) => ({ id: p.id, url: p.url, order: p.order })),
    seller: listing.seller
      ? {
          id: listing.seller.id,
          email: listing.seller.email,
          sellerProfile: listing.seller.sellerProfile
            ? {
                nom: listing.seller.sellerProfile.nom,
                prenom: listing.seller.sellerProfile.prenom,
                telephone: listing.seller.sellerProfile.telephone,
                isPremium: isPremiumActive(
                  listing.seller.sellerProfile.isPremium,
                  listing.seller.sellerProfile.premiumExpiresAt
                ),
              }
            : null,
        }
      : undefined,
    offers: listing.offers
      ? listing.offers
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((o) => ({
            id: o.id,
            amount: o.amount,
            createdAt: o.createdAt.toISOString(),
            buyer: { id: o.buyer.id, email: o.buyer.email },
          }))
      : undefined,
  };
}
