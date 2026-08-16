import { prisma } from "@/lib/prisma";

export async function syncExpiredListings() {
  await prisma.listing.updateMany({
    where: { status: "ACTIVE", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });
}

export async function syncExpiredPremium() {
  await prisma.sellerProfile.updateMany({
    where: { isPremium: true, premiumExpiresAt: { lt: new Date() } },
    data: { isPremium: false },
  });
}
