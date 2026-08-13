import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { initiatePayment } from "@/lib/airtelMoney";
import { PREMIUM_PRICE_XAF } from "@/lib/premium";

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (auth.role !== "SELLER") {
    return NextResponse.json({ error: "Seul un vendeur peut souscrire au Premium" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const phone = body?.phone as string | undefined;
  if (!phone) {
    return NextResponse.json({ error: "Numéro Airtel Money requis" }, { status: 400 });
  }

  const reference = `PM-${randomUUID()}`;

  const payment = await prisma.payment.create({
    data: {
      sellerId: auth.sub,
      amount: PREMIUM_PRICE_XAF,
      phone,
      provider: "AIRTEL_MONEY",
      status: "PENDING",
      reference,
    },
  });

  try {
    await initiatePayment({ phone, amount: PREMIUM_PRICE_XAF, reference });
  } catch (err) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "Échec de l'initiation du paiement" }, { status: 502 });
  }

  return NextResponse.json({ paymentId: payment.id }, { status: 201 });
}
