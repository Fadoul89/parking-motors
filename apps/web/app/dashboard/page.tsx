"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Listing } from "@parking-motors/shared";
import { api } from "@/lib/apiClient";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  DISABLED: "Désactivée",
  EXPIRED: "Expirée",
};

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { listings } = await api.mySellerListings();
    setListings(listings);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette annonce ?")) return;
    await api.deleteListing(id);
    load();
  }

  async function handleToggle(listing: Listing) {
    await api.updateListing(listing.id, {
      status: listing.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
    });
    load();
  }

  async function handleRenew(id: string) {
    await api.renewListing(id);
    load();
  }

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Mes annonces</h1>
        <Link href="/dashboard/new" className="btn">
          + Nouvelle annonce
        </Link>
      </div>

      {loading && <p>Chargement…</p>}
      {!loading && listings.length === 0 && <p>Vous n&apos;avez pas encore publié d&apos;annonce.</p>}

      <div className="listing-grid">
        {listings.map((listing) => (
          <div key={listing.id} className="card" style={{ padding: 12 }}>
            <strong>{listing.title}</strong>
            <p>{listing.price.toLocaleString()} FCFA · {listing.city}</p>
            <span className="badge">{STATUS_LABEL[listing.status] ?? listing.status}</span>
            {listing.isFlash && (
              <span className="badge" style={{ background: "#fef3c7", color: "#b45309", marginLeft: 6 }}>
                ⚡ Vente Flash{listing.status === "ACTIVE" && listing.expiresAt ? ` · jusqu'au ${new Date(listing.expiresAt).toLocaleString("fr-FR")}` : ""}
              </span>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <Link href={`/dashboard/${listing.id}/edit`} className="btn secondary">
                Modifier
              </Link>
              <button className="btn secondary" onClick={() => handleToggle(listing)}>
                {listing.status === "ACTIVE" ? "Désactiver" : "Réactiver"}
              </button>
              {listing.status === "EXPIRED" && (
                <button className="btn secondary" onClick={() => handleRenew(listing.id)}>
                  Renouveler
                </button>
              )}
              <button className="btn danger" onClick={() => handleDelete(listing.id)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
