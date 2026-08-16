import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeUser } from "@/lib/serialize";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (auth.role !== "ADMIN") return NextResponse.json({ error: "Action réservée aux administrateurs" }, { status: 403 });

  if (params.id === auth.sub) {
    return NextResponse.json({ error: "Vous ne pouvez pas vous bloquer vous-même" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { isBlocked: !target.isBlocked },
    include: { sellerProfile: true },
  });

  return NextResponse.json({ user: serializeUser(updated) });
}
