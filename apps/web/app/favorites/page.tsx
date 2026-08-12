"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@parking-motors/shared";
import { api } from "@/lib/apiClient";
import { ListingCard } from "@/components/ListingCard";

export default function FavoritesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listFavorites()
      .then(({ listings }) => setListings(listings))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h1>Mes favoris</h1>
      {loading && <p>Chargement…</p>}
      {!loading && listings.length === 0 && <p>Aucun favori pour le moment.</p>}
      <div className="listing-grid">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
