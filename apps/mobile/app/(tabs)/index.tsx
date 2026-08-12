import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import type { Listing, ListingFilters } from "@parking-motors/shared";
import { api } from "@/lib/api";
import { ListingCard } from "@/components/ListingCard";

export default function SearchScreen() {
  const [filters, setFilters] = useState<ListingFilters>({});
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (f: ListingFilters) => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(filters);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Rechercher un véhicule</Text>
      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="Marque"
          onChangeText={(v) => setFilters((p) => ({ ...p, brand: v || undefined }))}
          onSubmitEditing={() => load(filters)}
        />
        <TextInput
          style={styles.input}
          placeholder="Ville"
          onChangeText={(v) => setFilters((p) => ({ ...p, city: v || undefined }))}
          onSubmitEditing={() => load(filters)}
        />
      </View>
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && listings.length === 0 && <Text>Aucune annonce trouvée.</Text>}
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#f5f6f8" },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  filters: { flexDirection: "row", gap: 8, marginBottom: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "white",
  },
  error: { color: "#d93025" },
});
