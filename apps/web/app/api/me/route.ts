import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeUser } from "@/lib/serialize";
import { syncExpiredPremium } from "@/lib/expireListings";

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  await syncExpiredPremium();

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    include: { sellerProfile: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  return NextResponse.json({ user: serializeUser(user) });
}
