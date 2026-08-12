import Link from "next/link";
import type { Listing } from "@parking-motors/shared";

const SALE_LABEL: Record<string, string> = { VENTE: "Vente", LOCATION: "Location" };
const TRANSMISSION_LABEL: Record<string, string> = {
  MANUELLE: "Manuelle",
  AUTOMATIQUE: "Automatique",
};
const FUEL_LABEL: Record<string, string> = {
  ESSENCE: "Essence",
  DIESEL: "Diesel",
  HYBRIDE: "Hybride",
  ELECTRIQUE: "Électrique",
};

function formatRemaining(expiresAt: string): string | null {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours >= 1) return `${hours} h restantes`;
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  return `${minutes} min restantes`;
}

export function ListingCard({ listing }: { listing: Listing }) {
  const thumb = listing.photos[0]?.url;
  const remaining = listing.isFlash && listing.expiresAt ? formatRemaining(listing.expiresAt) : null;

  return (
    <Link href={`/listings/${listing.id}`} className="card listing-card">
      <div className="listing-thumb-wrap">
        {thumb ? (
          <img className="listing-thumb" src={thumb} alt={listing.title} />
        ) : (
          <div className="listing-thumb" />
        )}
        <span className="listing-sale-badge">{SALE_LABEL[listing.saleType] ?? listing.saleType}</span>
        {remaining && <span className="listing-flash-badge">⚡ {remaining}</span>}
        <span className="listing-view-cta">Voir l&apos;annonce</span>
      </div>
      <div className="listing-body">
        <span className="listing-brand">{listing.brand}</span>
        <span className="listing-model">{listing.model}</span>
        <span className="listing-specs">
          {TRANSMISSION_LABEL[listing.transmission] ?? listing.transmission} · {FUEL_LABEL[listing.fuel] ?? listing.fuel}
        </span>
        <span className="listing-specs">
          {listing.year} · {listing.mileage.toLocaleString()} km · {listing.city}
        </span>
        <div className="listing-footer">
          <span className="listing-price">
            {listing.price.toLocaleString()} FCFA
            {listing.saleType === "LOCATION" && <span className="listing-price-suffix">/mois</span>}
          </span>
        </div>
      </div>
    </Link>
  );
}
