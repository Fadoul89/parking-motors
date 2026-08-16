import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE, hashPassword, signToken } from "@/lib/auth";
import { serializeUser } from "@/lib/serialize";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { email, password, role, nom, prenom, telephone } = body as {
    email?: string;
    password?: string;
    role?: "BUYER" | "SELLER";
    nom?: string;
    prenom?: string;
    telephone?: string;
  };

  if (!email || !password || !role) {
    return NextResponse.json({ error: "Email, mot de passe et rôle sont requis" }, { status: 400 });
  }
  if (role !== "BUYER" && role !== "SELLER") {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  if (role === "SELLER" && (!nom || !prenom || !telephone)) {
    return NextResponse.json(
      { error: "Nom, prénom et numéro de téléphone sont obligatoires pour un compte vendeur" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      sellerProfile:
        role === "SELLER"
          ? { create: { nom: nom!, prenom: prenom!, telephone: telephone! } }
          : undefined,
    },
    include: { sellerProfile: true },
  });

  const token = await signToken({ sub: user.id, role: user.role });
  const res = NextResponse.json({ user: serializeUser(user), token });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
