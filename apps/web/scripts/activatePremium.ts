import { prisma } from "../lib/prisma";
import { PREMIUM_DURATION_DAYS } from "../lib/premium";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run premium:activate -- <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email }, include: { sellerProfile: true } });
  if (!user || !user.sellerProfile) {
    console.error(`Aucun compte vendeur trouvé pour ${email}`);
    process.exit(1);
  }

  await prisma.sellerProfile.update({
    where: { userId: user.id },
    data: {
      isPremium: true,
      premiumExpiresAt: new Date(Date.now() + PREMIUM_DURATION_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Premium activé pour ${email} (${PREMIUM_DURATION_DAYS} jours)`);
  process.exit(0);
}

main();
