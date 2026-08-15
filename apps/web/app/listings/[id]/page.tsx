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

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, name.length - 2))}@${domain}`;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerError, setOfferError] = useState<string | null>(null);
  const [offerLoading, setOfferLoading] = useState(false);

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

  async function handleMakeOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!listing) return;
    setOfferLoading(true);
    setOfferError(null);
    try {
      const { listing: updated } = await api.makeOffer(listing.id, Number(offerAmount));
      setListing(updated);
      setOfferAmount("");
    } catch (err) {
      setOfferError((err as Error).message);
    } finally {
      setOfferLoading(false);
    }
  }

  if (error) return <div className="container error-text">{error}</div>;
  if (!listing) return <div className="container">Chargement…</div>;

  const minOffer = Math.ceil(listing.price * 0.6);

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

      <div className="card" style={{ padding: 16, marginTop: 20 }}>
        <h3>Faire une offre</h3>
        <p style={{ fontSize: "0.85rem", color: "#555" }}>
          Offre minimum : {minOffer.toLocaleString()} FCFA (60% du prix affiché) — 3 offres max par jour sur cette
          annonce.
        </p>

        {user?.role === "BUYER" ? (
          <form className="stack" onSubmit={handleMakeOffer}>
            <label>
              Montant de votre offre (FCFA)
              <input
                required
                type="number"
                min={minOffer}
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
              />
            </label>
            {offerError && <p className="error-text">{offerError}</p>}
            <button className="btn" type="submit" disabled={offerLoading}>
              {offerLoading ? "Envoi…" : "Envoyer l'offre"}
            </button>
          </form>
        ) : (
          <p style={{ color: "#555" }}>Connectez-vous avec un compte acheteur pour faire une offre.</p>
        )}

        {listing.offers && listing.offers.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4>Offres reçues</h4>
            <ul>
              {listing.offers.map((offer) => (
                <li key={offer.id}>
                  {offer.amount.toLocaleString()} FCFA — {maskEmail(offer.buyer.email)} ·{" "}
                  {new Date(offer.createdAt).toLocaleString("fr-FR")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
