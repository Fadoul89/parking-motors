import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error("Usage: npm run admin:create -- <email> <password>");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: "ADMIN", passwordHash } });
    console.log(`✅ ${email} promu administrateur`);
  } else {
    await prisma.user.create({ data: { email, passwordHash, role: "ADMIN" } });
    console.log(`✅ Compte administrateur créé pour ${email}`);
  }

  process.exit(0);
}

main();
