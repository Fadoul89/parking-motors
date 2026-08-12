"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Listing } from "@parking-motors/shared";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

const FUEL_LABEL: Record<string, string> = {
  ESSENCE: "Essence",
  DIESEL: "Diesel",
  HYBRIDE: "Hybride",
  ELECTRIQUE: "Électrique",
};
const TRANSMISSION_LABEL: Record<string, string> = {
  MANUELLE: "Manuelle",
  AUTOMATIQUE: "Automatique",
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    api
      .getListing(id)
      .then(({ listing }) => setListing(listing))
      .catch((e) => setError((e as Error).message));
  }, [id]);

  useEffect(() => {
    if (user?.role === "BUYER") {
      api
        .listFavorites()
        .then(({ listings }) => setIsFavorite(listings.some((l) => l.id === id)))
        .catch(() => {});
    }
  }, [user, id]);

  async function toggleFavorite() {
    if (!listing) return;
    if (isFavorite) {
      await api.removeFavorite(listing.id);
      setIsFavorite(false);
    } else {
      await api.addFavorite(listing.id);
      setIsFavorite(true);
    }
  }

  if (error) return <div className="container error-text">{error}</div>;
  if (!listing) return <div className="container">Chargement…</div>;

  return (
    <div className="container">
      <h1>{listing.title}</h1>
      {listing.isFlash && listing.expiresAt && new Date(listing.expiresAt).getTime() > Date.now() && (
        <p style={{ color: "#f59e0b", fontWeight: 700 }}>
          ⚡ Vente Flash — se termine le {new Date(listing.expiresAt).toLocaleString("fr-FR")}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
        {listing.photos.length === 0 && <div className="listing-thumb" style={{ width: 240 }} />}
        {listing.photos.map((p) => (
          <img
            key={p.id}
            src={p.url}
            alt={listing.title}
            style={{ width: 240, height: 180, objectFit: "cover", borderRadius: 8 }}
          />
        ))}
      </div>

      <p className="listing-price">{listing.price.toLocaleString()} FCFA</p>
      <ul>
        <li>Marque / modèle : {listing.brand} {listing.model}</li>
        <li>Année : {listing.year}</li>
        <li>Kilométrage : {listing.mileage.toLocaleString()} km</li>
        <li>Carburant : {FUEL_LABEL[listing.fuel] ?? listing.fuel}</li>
        <li>Boîte de vitesse : {TRANSMISSION_LABEL[listing.transmission] ?? listing.transmission}</li>
        <li>État : {listing.condition === "NEUF" ? "Neuf" : "Occasion"}</li>
        <li>Ville : {listing.city}</li>
        <li>Type : {listing.saleType === "VENTE" ? "Vente" : "Location"}</li>
      </ul>
      <p>{listing.description}</p>

      {user?.role === "BUYER" && (
        <button className="btn secondary" onClick={toggleFavorite}>
          {isFavorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
        </button>
      )}

      {listing.seller?.sellerProfile && (
        <div className="card" style={{ padding: 16, marginTop: 20 }}>
          <h3>Vendeur</h3>
          <p>
            {listing.seller.sellerProfile.prenom} {listing.seller.sellerProfile.nom}
          </p>
          {showPhone ? (
            <p>
              📞 <a href={`tel:${listing.seller.sellerProfile.telephone}`}>
                {listing.seller.sellerProfile.telephone}
              </a>
            </p>
          ) : (
            <button className="btn" onClick={() => setShowPhone(true)}>
              Afficher le numéro
            </button>
          )}
        </div>
      )}
    </div>
  );
}
