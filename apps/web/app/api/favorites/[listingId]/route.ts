import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: { listingId: string } }) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  await prisma.favorite.deleteMany({
    where: { buyerId: auth.sub, listingId: params.listingId },
  });

  return new NextResponse(null, { status: 204 });
}
