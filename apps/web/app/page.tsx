"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Listing, ListingFilters } from "@parking-motors/shared";
import { api } from "@/lib/apiClient";
import { ListingCard } from "@/components/ListingCard";

const VEHICLE_TYPES = [
  ["", "Tous types"],
  ["VOITURE_NEUVE", "Voiture neuve"],
  ["OCCASION", "Voiture d'occasion"],
  ["ZERO_KM", "0 km"],
  ["SUV", "SUV / 4x4"],
  ["MINIBUS", "Minibus"],
  ["PICKUP", "Pick-up"],
  ["CAMION", "Camion"],
  ["MOTO", "Moto"],
  ["PRO", "Véhicule professionnel"],
];

type SortKey = "recent" | "price_asc" | "price_desc" | "year_desc" | "mileage_asc";

const SORT_OPTIONS: [SortKey, string][] = [
  ["recent", "Plus récentes"],
  ["price_asc", "Prix croissant"],
  ["price_desc", "Prix décroissant"],
  ["year_desc", "Année décroissante"],
  ["mileage_asc", "Kilométrage croissant"],
];

function sortListings(listings: Listing[], sort: SortKey): Listing[] {
  const sorted = [...listings];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "year_desc":
      return sorted.sort((a, b) => b.year - a.year);
    case "mileage_asc":
      return sorted.sort((a, b) => a.mileage - b.mileage);
    default:
      return sorted;
  }
}

export default function HomePage() {
  const [filters, setFilters] = useState<ListingFilters>({});
  const [sort, setSort] = useState<SortKey>("recent");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(f: ListingFilters) {
    setLoading(true);
    setError(null);
    try {
      const { listings } = await api.listListings(f);
      setListings(listings);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof ListingFilters>(key: K, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  }

  const sortedListings = useMemo(() => sortListings(listings, sort), [listings, sort]);

  return (
    <>
      <div className="hero-band">
        <div className="container wide hero-promos" style={{ padding: 0 }}>
          <div className="hero-promo-card">
            <span className="hero-promo-icon">⚡</span>
            <div>
              <strong>Vente Flash 24h / 48h</strong>
              <p>Vendez votre véhicule vite avec une annonce à durée limitée bien visible.</p>
            </div>
          </div>
          <Link href="/premium" className="hero-promo-card hero-promo-card-link">
            <span className="hero-promo-icon">💎</span>
            <div>
              <strong>Devenez vendeur Premium</strong>
              <p>Plus d&apos;annonces, mise en avant en tête de recherche et badge Premium.</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="container wide">
        <div className="search-layout">
          <form
            className="filters-sidebar"
            onSubmit={(e) => {
              e.preventDefault();
              load(filters);
            }}
          >
            <h3>Filtrer par</h3>

            <div className="filters-section">
              <p className="filters-section-title">Véhicule</p>
              <label>
                Marque
                <input placeholder="ex: Toyota" onChange={(e) => update("brand", e.target.value)} />
              </label>
              <label>
                Modèle
                <input placeholder="ex: Corolla" onChange={(e) => update("model", e.target.value)} />
              </label>
              <label>
                Type de véhicule
                <select onChange={(e) => update("vehicleType", e.target.value)}>
                  {VEHICLE_TYPES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                État
                <select onChange={(e) => update("condition", e.target.value)}>
                  <option value="">Neuf / Occasion</option>
                  <option value="NEUF">Neuf</option>
                  <option value="OCCASION">Occasion</option>
                </select>
              </label>
            </div>

            <div className="filters-section">
              <p className="filters-section-title">Localisation</p>
              <label>
                Ville
                <input placeholder="ex: Libreville" onChange={(e) => update("city", e.target.value)} />
              </label>
              <label>
                Pays
                <input placeholder="ex: Tchad" onChange={(e) => update("country", e.target.value)} />
              </label>
            </div>

            <div className="filters-section">
              <p className="filters-section-title">Budget</p>
              <label>
                Prix min
                <input type="number" onChange={(e) => update("priceMin", e.target.value)} />
              </label>
              <label>
                Prix max
                <input type="number" onChange={(e) => update("priceMax", e.target.value)} />
              </label>
            </div>

            <div className="filters-section">
              <p className="filters-section-title">Offre</p>
              <label>
                Vente ou location
                <select onChange={(e) => update("saleType", e.target.value)}>
                  <option value="">Vente / Location</option>
                  <option value="VENTE">Vente</option>
                  <option value="LOCATION">Location</option>
                </select>
              </label>
            </div>

            <button className="btn" type="submit">
              Rechercher
            </button>
          </form>

          <div>
            <div className="results-topbar">
              <span className="results-count">
                {loading ? "Recherche…" : `${sortedListings.length} véhicule${sortedListings.length > 1 ? "s" : ""} trouvé${sortedListings.length > 1 ? "s" : ""}`}
              </span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                {SORT_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="error-text">{error}</p>}
            {!loading && sortedListings.length === 0 && <p>Aucune annonce trouvée.</p>}

            <div className="listing-grid">
              {sortedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
