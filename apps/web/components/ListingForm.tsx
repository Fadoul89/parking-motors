"use client";

import { useState } from "react";
import type { ListingInput } from "@parking-motors/shared";

const emptyForm: ListingInput = {
  title: "",
  brand: "",
  model: "",
  price: 0,
  year: new Date().getFullYear(),
  mileage: 0,
  fuel: "ESSENCE",
  transmission: "MANUELLE",
  vehicleType: "OCCASION",
  condition: "OCCASION",
  saleType: "VENTE",
  city: "",
  description: "",
};

export function ListingForm({
  initial,
  submitLabel,
  onSubmit,
  showFlashOption = false,
}: {
  initial?: Partial<ListingInput>;
  submitLabel: string;
  onSubmit: (input: ListingInput) => Promise<void>;
  showFlashOption?: boolean;
}) {
  const [form, setForm] = useState<ListingInput>({ ...emptyForm, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof ListingInput>(key: K, value: ListingInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <label>
        Titre
        <input required value={form.title} onChange={(e) => set("title", e.target.value)} />
      </label>
      <label>
        Marque
        <input required value={form.brand} onChange={(e) => set("brand", e.target.value)} />
      </label>
      <label>
        Modèle
        <input required value={form.model} onChange={(e) => set("model", e.target.value)} />
      </label>
      <label>
        Prix (FCFA)
        <input
          required
          type="number"
          min={0}
          value={form.price}
          onChange={(e) => set("price", Number(e.target.value))}
        />
      </label>
      <label>
        Année
        <input
          required
          type="number"
          value={form.year}
          onChange={(e) => set("year", Number(e.target.value))}
        />
      </label>
      <label>
        Kilométrage
        <input
          required
          type="number"
          min={0}
          value={form.mileage}
          onChange={(e) => set("mileage", Number(e.target.value))}
        />
      </label>
      <label>
        Carburant
        <select value={form.fuel} onChange={(e) => set("fuel", e.target.value as ListingInput["fuel"])}>
          <option value="ESSENCE">Essence</option>
          <option value="DIESEL">Diesel</option>
          <option value="HYBRIDE">Hybride</option>
          <option value="ELECTRIQUE">Électrique</option>
        </select>
      </label>
      <label>
        Boîte de vitesse
        <select
          value={form.transmission}
          onChange={(e) => set("transmission", e.target.value as ListingInput["transmission"])}
        >
          <option value="MANUELLE">Manuelle</option>
          <option value="AUTOMATIQUE">Automatique</option>
        </select>
      </label>
      <label>
        Type de véhicule
        <select
          value={form.vehicleType}
          onChange={(e) => set("vehicleType", e.target.value as ListingInput["vehicleType"])}
        >
          <option value="VOITURE_NEUVE">Voiture neuve</option>
          <option value="OCCASION">Voiture d&apos;occasion</option>
          <option value="ZERO_KM">0 km</option>
          <option value="SUV">SUV / 4x4</option>
          <option value="MINIBUS">Minibus</option>
          <option value="PICKUP">Pick-up</option>
          <option value="CAMION">Camion</option>
          <option value="MOTO">Moto</option>
          <option value="PRO">Véhicule professionnel</option>
        </select>
      </label>
      <label>
        État
        <select
          value={form.condition}
          onChange={(e) => set("condition", e.target.value as ListingInput["condition"])}
        >
          <option value="NEUF">Neuf</option>
          <option value="OCCASION">Occasion</option>
        </select>
      </label>
      <label>
        Vente ou location
        <select
          value={form.saleType}
          onChange={(e) => set("saleType", e.target.value as ListingInput["saleType"])}
        >
          <option value="VENTE">Vente</option>
          <option value="LOCATION">Location</option>
        </select>
      </label>
      <label>
        Ville
        <input required value={form.city} onChange={(e) => set("city", e.target.value)} />
      </label>
      <label>
        Description
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>
      {showFlashOption && (
        <label>
          ⚡ Vente Flash (optionnel)
          <select
            value={form.flashHours ?? ""}
            onChange={(e) =>
              set(
                "flashHours",
                e.target.value ? (Number(e.target.value) as ListingInput["flashHours"]) : undefined
              )
            }
          >
            <option value="">Aucune (annonce normale)</option>
            <option value="24">24 heures</option>
            <option value="48">48 heures</option>
          </select>
        </label>
      )}
      {error && <p className="error-text">{error}</p>}
      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
