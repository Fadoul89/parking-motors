import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import type { Listing } from "@parking-motors/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { ListingCard } from "@/components/ListingCard";

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      api
        .listFavorites()
        .then(({ listings }) => setListings(listings))
        .finally(() => setLoading(false));
    }, [user])
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Connectez-vous pour voir vos favoris.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Mes favoris</Text>
      {loading && <ActivityIndicator />}
      {!loading && listings.length === 0 && <Text>Aucun favori pour le moment.</Text>}
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => <ListingCard listing={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#f5f6f8" },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
});
