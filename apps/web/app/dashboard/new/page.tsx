"use client";

import { useRouter } from "next/navigation";
import type { ListingInput } from "@parking-motors/shared";
import { api } from "@/lib/apiClient";
import { ListingForm } from "@/components/ListingForm";
import { useAuth } from "@/context/AuthContext";

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleSubmit(input: ListingInput) {
    const { listing } = await api.createListing(input);
    router.push(`/dashboard/${listing.id}/edit`);
  }

  return (
    <div className="container">
      <h1>Nouvelle annonce</h1>
      <ListingForm
        submitLabel="Publier l'annonce"
        onSubmit={handleSubmit}
        showFlashOption
        isPremiumSeller={!!user?.sellerProfile?.isPremium}
      />
    </div>
  );
}
