"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Listing } from "@parking-motors/shared";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  DISABLED: "Désactivée",
  EXPIRED: "Expirée",
  SUSPENDED: "🚫 Suspendue par un administrateur",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const activeCount = listings.filter((l) => l.status === "ACTIVE").length;

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

      <div className="card" style={{ padding: 16, marginTop: 12, marginBottom: 12 }}>
        {user?.sellerProfile?.isPremium ? (
          <p>
            💎 Compte Premium actif
            {user.sellerProfile.premiumExpiresAt &&
              ` jusqu'au ${new Date(user.sellerProfile.premiumExpiresAt).toLocaleDateString("fr-FR")}`}
          </p>
        ) : (
          <p>
            Compte gratuit ({activeCount}/5 annonces actives) —{" "}
            <Link href="/premium" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Passer Premium
            </Link>{" "}
            pour plus d&apos;annonces et une meilleure visibilité
          </p>
        )}
        <p style={{ margin: "8px 0 0", color: "#555", fontSize: "0.9rem" }}>
          Statistiques : {listings.length} annonce{listings.length > 1 ? "s" : ""} au total, {activeCount} active
          {activeCount > 1 ? "s" : ""}
        </p>
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
            {listing.status === "SUSPENDED" ? (
              <p style={{ fontSize: "0.85rem", color: "#555", marginTop: 8 }}>
                Cette annonce a été suspendue par un administrateur et ne peut pas être modifiée.
              </p>
            ) : (
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
