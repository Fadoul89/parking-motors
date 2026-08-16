import { prisma } from "../lib/prisma";
import { PREMIUM_DURATION_DAYS, PREMIUM_DURATION_OPTIONS } from "../lib/premium";

async function main() {
  const email = process.argv[2];
  const durationArg = process.argv[3];
  const duration = durationArg ? Number(durationArg) : PREMIUM_DURATION_DAYS;

  if (!email) {
    console.error(`Usage: npm run premium:activate -- <email> [${PREMIUM_DURATION_OPTIONS.join("|")}]`);
    process.exit(1);
  }
  if (!PREMIUM_DURATION_OPTIONS.includes(duration as (typeof PREMIUM_DURATION_OPTIONS)[number])) {
    console.error(`Durée invalide. Choisir parmi : ${PREMIUM_DURATION_OPTIONS.join(", ")} jours`);
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
      premiumExpiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Premium activé pour ${email} (${duration} jours)`);
  process.exit(0);
}

main();
