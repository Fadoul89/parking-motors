import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE, signToken, verifyPassword } from "@/lib/auth";
import { serializeUser } from "@/lib/serialize";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    include: { sellerProfile: true },
  });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }
  if (user.isBlocked) {
    return NextResponse.json({ error: "Ce compte a été bloqué par un administrateur" }, { status: 403 });
  }

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
