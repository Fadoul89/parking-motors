-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offer_listingId_idx" ON "Offer"("listingId");

-- CreateIndex
CREATE INDEX "Offer_buyerId_createdAt_idx" ON "Offer"("buyerId", "createdAt");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
