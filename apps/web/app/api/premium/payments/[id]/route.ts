import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { getPaymentStatus } from "@/lib/airtelMoney";
import { PREMIUM_DURATION_DAYS } from "@/lib/premium";
import { serializeUser } from "@/lib/serialize";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const payment = await prisma.payment.findUnique({ where: { id: params.id } });
  if (!payment) return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
  if (payment.sellerId !== auth.sub) {
    return NextResponse.json({ error: "Action non autorisée" }, { status: 403 });
  }

  let status = payment.status;

  if (status === "PENDING") {
    const airtelStatus = await getPaymentStatus({
      reference: payment.reference,
      createdAt: payment.createdAt,
    });

    if (airtelStatus !== "PENDING") {
      status = airtelStatus;
      await prisma.payment.update({ where: { id: payment.id }, data: { status } });

      if (status === "SUCCESS") {
        await prisma.sellerProfile.update({
          where: { userId: payment.sellerId },
          data: {
            isPremium: true,
            premiumExpiresAt: new Date(Date.now() + PREMIUM_DURATION_DAYS * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: payment.sellerId },
    include: { sellerProfile: true },
  });

  return NextResponse.json({
    payment: {
      id: payment.id,
      status,
      amount: payment.amount,
      createdAt: payment.createdAt.toISOString(),
    },
    user: serializeUser(user!),
  });
}
