import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeUser } from "@/lib/serialize";
import { PREMIUM_DURATION_OPTIONS, PremiumDurationDays } from "@/lib/premium";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (auth.role !== "ADMIN") return NextResponse.json({ error: "Action réservée aux administrateurs" }, { status: 403 });

  const target = await prisma.user.findUnique({ where: { id: params.id }, include: { sellerProfile: true } });
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  if (!target.sellerProfile) {
    return NextResponse.json({ error: "Cet utilisateur n'a pas de profil vendeur" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const days = Number(body?.days);
  if (!PREMIUM_DURATION_OPTIONS.includes(days as PremiumDurationDays)) {
    return NextResponse.json(
      { error: `Durée invalide. Choisir parmi : ${PREMIUM_DURATION_OPTIONS.join(", ")} jours` },
      { status: 400 }
    );
  }

  await prisma.sellerProfile.update({
    where: { userId: params.id },
    data: {
      isPremium: true,
      premiumExpiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    },
  });

  const updated = await prisma.user.findUnique({ where: { id: params.id }, include: { sellerProfile: true } });
  return NextResponse.json({ user: serializeUser(updated!) });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
    data: { isPremium: false, premiumExpiresAt: null },
  });

  const updated = await prisma.user.findUnique({ where: { id: params.id }, include: { sellerProfile: true } });
  return NextResponse.json({ user: serializeUser(updated!) });
}
