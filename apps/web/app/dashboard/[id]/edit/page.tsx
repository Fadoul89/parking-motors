"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Listing, ListingInput } from "@parking-motors/shared";
import { api } from "@/lib/apiClient";
import { ListingForm } from "@/components/ListingForm";
import { useAuth } from "@/context/AuthContext";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const { listing } = await api.getListing(id);
    setListing(listing);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(input: ListingInput) {
    await api.updateListing(id, input);
    router.push("/dashboard");
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      await api.uploadListingPhoto(id, formData);
      await load();
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (!listing) return <div className="container">Chargement…</div>;

  return (
    <div className="container">
      <h1>Modifier l&apos;annonce</h1>

      <div style={{ marginBottom: 24 }}>
        <h3>Photos</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          {listing.photos.map((p) => (
            <img
              key={p.id}
              src={p.url}
              alt=""
              style={{ width: 100, height: 80, objectFit: "cover", borderRadius: 6 }}
            />
          ))}
        </div>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} disabled={uploading} />
        {uploading && <p>Envoi en cours…</p>}
        {uploadError && <p className="error-text">{uploadError}</p>}
      </div>

      <ListingForm
        initial={listing}
        submitLabel="Enregistrer"
        onSubmit={handleSubmit}
        isPremiumSeller={!!user?.sellerProfile?.isPremium}
      />
    </div>
  );
}
