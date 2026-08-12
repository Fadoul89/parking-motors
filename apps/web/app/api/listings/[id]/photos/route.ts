import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeListing } from "@/lib/serialize";
import { uploadListingPhoto } from "@/lib/cloudinary";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  if (listing.sellerId !== auth.sub) {
    return NextResponse.json({ error: "Action non autorisée" }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("photo");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Fichier photo manquant" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Format d'image non supporté (jpg, png, webp)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image trop volumineuse (max 5 Mo)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadListingPhoto(buffer, file.type);

  const photoCount = await prisma.listingPhoto.count({ where: { listingId: params.id } });
  await prisma.listingPhoto.create({
    data: { listingId: params.id, url, order: photoCount },
  });

  const updated = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { photos: true, seller: { include: { sellerProfile: true } } },
  });

  return NextResponse.json({ listing: serializeListing(updated!) }, { status: 201 });
}
