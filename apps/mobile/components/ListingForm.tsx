import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
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
  country: "Tchad",
  description: "",
};

export function ListingForm({
  initial,
  submitLabel,
  onSubmit,
  showFlashOption = false,
  isPremiumSeller = false,
}: {
  initial?: Partial<ListingInput>;
  submitLabel: string;
  onSubmit: (input: ListingInput) => Promise<void>;
  showFlashOption?: boolean;
  isPremiumSeller?: boolean;
}) {
  const [form, setForm] = useState<ListingInput>({ ...emptyForm, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof ListingInput>(key: K, value: ListingInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ gap: 10 }}>
      <TextInput style={styles.input} placeholder="Titre" value={form.title} onChangeText={(v) => set("title", v)} />
      <TextInput style={styles.input} placeholder="Marque" value={form.brand} onChangeText={(v) => set("brand", v)} />
      <TextInput style={styles.input} placeholder="Modèle" value={form.model} onChangeText={(v) => set("model", v)} />
      <TextInput
        style={styles.input}
        placeholder="Prix (FCFA)"
        keyboardType="numeric"
        value={String(form.price)}
        onChangeText={(v) => set("price", Number(v) || 0)}
      />
      <TextInput
        style={styles.input}
        placeholder="Année"
        keyboardType="numeric"
        value={String(form.year)}
        onChangeText={(v) => set("year", Number(v) || 0)}
      />
      <TextInput
        style={styles.input}
        placeholder="Kilométrage"
        keyboardType="numeric"
        value={String(form.mileage)}
        onChangeText={(v) => set("mileage", Number(v) || 0)}
      />
      <TextInput style={styles.input} placeholder="Ville" value={form.city} onChangeText={(v) => set("city", v)} />
      {isPremiumSeller ? (
        <TextInput
          style={styles.input}
          placeholder="Pays (ex: Tchad, Cameroun…)"
          value={form.country}
          onChangeText={(v) => set("country", v)}
        />
      ) : (
        <Text style={{ fontSize: 12, color: "#555" }}>
          Pays : Tchad · 💎 Passez Premium pour publier depuis un autre pays.
        </Text>
      )}

      <Chips
        label="Vente ou location"
        value={form.saleType}
        options={[
          ["VENTE", "Vente"],
          ["LOCATION", "Location"],
        ]}
        onChange={(v) => set("saleType", v as ListingInput["saleType"])}
      />
      <Chips
        label="État"
        value={form.condition}
        options={[
          ["NEUF", "Neuf"],
          ["OCCASION", "Occasion"],
        ]}
        onChange={(v) => set("condition", v as ListingInput["condition"])}
      />
      <Chips
        label="Carburant"
        value={form.fuel}
        options={[
          ["ESSENCE", "Essence"],
          ["DIESEL", "Diesel"],
          ["HYBRIDE", "Hybride"],
          ["ELECTRIQUE", "Électrique"],
        ]}
        onChange={(v) => set("fuel", v as ListingInput["fuel"])}
      />
      <Chips
        label="Boîte de vitesse"
        value={form.transmission}
        options={[
          ["MANUELLE", "Manuelle"],
          ["AUTOMATIQUE", "Automatique"],
        ]}
        onChange={(v) => set("transmission", v as ListingInput["transmission"])}
      />
      <Chips
        label="Type de véhicule"
        value={form.vehicleType}
        options={[
          ["VOITURE_NEUVE", "Voiture neuve"],
          ["OCCASION", "Occasion"],
          ["ZERO_KM", "0 km"],
          ["SUV", "SUV / 4x4"],
          ["MINIBUS", "Minibus"],
          ["PICKUP", "Pick-up"],
          ["CAMION", "Camion"],
          ["MOTO", "Moto"],
          ["PRO", "Professionnel"],
        ]}
        onChange={(v) => set("vehicleType", v as ListingInput["vehicleType"])}
      />

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Description"
        multiline
        value={form.description}
        onChangeText={(v) => set("description", v)}
      />

      {showFlashOption && (
        <Chips
          label="⚡ Vente Flash (optionnel)"
          value={form.flashHours ? String(form.flashHours) : ""}
          options={[
            ["", "Aucune"],
            ["24", "24 heures"],
            ["48", "48 heures"],
          ]}
          onChange={(v) => set("flashHours", v ? (Number(v) as ListingInput["flashHours"]) : undefined)}
        />
      )}

      {error && <Text style={{ color: "#d93025" }}>{error}</Text>}
      <Pressable style={styles.btn} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Enregistrement…" : submitLabel}</Text>
      </Pressable>
    </View>
  );
}

function Chips({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <View>
      <Text style={styles.chipsLabel}>{label}</Text>
      <View style={styles.chipsRow}>
        {options.map(([val, text]) => (
          <Pressable
            key={val}
            style={[styles.chip, value === val && styles.chipActive]}
            onPress={() => onChange(val)}
          >
            <Text style={value === val ? styles.chipTextActive : styles.chipText}>{text}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 8, padding: 10, backgroundColor: "white" },
  btn: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: "white", fontWeight: "600" },
  chipsLabel: { fontSize: 12, color: "#555", marginBottom: 4 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipActive: { borderColor: "#2563eb", backgroundColor: "#dbeafe" },
  chipText: { color: "#333", fontSize: 12 },
  chipTextActive: { color: "#1e40af", fontSize: 12, fontWeight: "600" },
});
