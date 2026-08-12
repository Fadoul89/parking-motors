"use client";

import { useRouter } from "next/navigation";
import type { ListingInput } from "@parking-motors/shared";
import { api } from "@/lib/apiClient";
import { ListingForm } from "@/components/ListingForm";

export default function NewListingPage() {
  const router = useRouter();

  async function handleSubmit(input: ListingInput) {
    const { listing } = await api.createListing(input);
    router.push(`/dashboard/${listing.id}/edit`);
  }

  return (
    <div className="container">
      <h1>Nouvelle annonce</h1>
      <ListingForm submitLabel="Publier l'annonce" onSubmit={handleSubmit} showFlashOption />
    </div>
  );
}
