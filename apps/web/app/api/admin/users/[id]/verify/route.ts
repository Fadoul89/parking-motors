import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeUser } from "@/lib/serialize";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (auth.role !== "ADMIN") return NextResponse.json({ error: "Action réservée aux administrateurs" }, { status: 403 });

  const target = await prisma.user.findUnique({ where: { id: params.id }, include: { sellerProfile: true } });
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  if (!target.sellerProfile) {
    return NextResponse.json({ error: "Cet utilisateur n'a pas de profil vendeur" }, { status: 400 });
  }

  await prisma.sellerProfile.update({
    where: { userId: params.id },
    data: { isVerified: !target.sellerProfile.isVerified },
  });

  const updated = await prisma.user.findUnique({ where: { id: params.id }, include: { sellerProfile: true } });
  return NextResponse.json({ user: serializeUser(updated!) });
}
