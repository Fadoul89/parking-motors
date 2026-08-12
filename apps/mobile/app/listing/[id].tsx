import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Listing } from "@parking-motors/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { API_BASE_URL } from "@/lib/config";

const FUEL_LABEL: Record<string, string> = {
  ESSENCE: "Essence",
  DIESEL: "Diesel",
  HYBRIDE: "Hybride",
  ELECTRIQUE: "Électrique",
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    api.getListing(id).then(({ listing }) => setListing(listing));
  }, [id]);

  useEffect(() => {
    if (user?.role === "BUYER") {
      api.listFavorites().then(({ listings }) => setIsFavorite(listings.some((l) => l.id === id)));
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

  if (!listing) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{listing.title}</Text>
      <ScrollView horizontal style={{ marginBottom: 12 }}>
        {listing.photos.length === 0 && <View style={[styles.photo, { backgroundColor: "#eee" }]} />}
        {listing.photos.map((p) => (
          <Image key={p.id} source={{ uri: `${API_BASE_URL}${p.url}` }} style={styles.photo} />
        ))}
      </ScrollView>
      <Text style={styles.price}>{listing.price.toLocaleString()} FCFA</Text>
      <Text>Marque / modèle : {listing.brand} {listing.model}</Text>
      <Text>Année : {listing.year}</Text>
      <Text>Kilométrage : {listing.mileage.toLocaleString()} km</Text>
      <Text>Carburant : {FUEL_LABEL[listing.fuel] ?? listing.fuel}</Text>
      <Text>Ville : {listing.city}</Text>
      <Text style={{ marginTop: 8 }}>{listing.description}</Text>

      {user?.role === "BUYER" && (
        <Pressable style={styles.btnSecondary} onPress={toggleFavorite}>
          <Text style={styles.btnSecondaryText}>
            {isFavorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
          </Text>
        </Pressable>
      )}

      {listing.seller?.sellerProfile && (
        <View style={styles.sellerCard}>
          <Text style={{ fontWeight: "700" }}>Vendeur</Text>
          <Text>
            {listing.seller.sellerProfile.prenom} {listing.seller.sellerProfile.nom}
          </Text>
          {showPhone ? (
            <Pressable onPress={() => Linking.openURL(`tel:${listing.seller!.sellerProfile!.telephone}`)}>
              <Text style={{ color: "#2563eb" }}>📞 {listing.seller.sellerProfile.telephone}</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.btn} onPress={() => setShowPhone(true)}>
              <Text style={styles.btnText}>Afficher le numéro</Text>
            </Pressable>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "white" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  photo: { width: 220, height: 160, borderRadius: 8, marginRight: 8 },
  price: { fontSize: 18, fontWeight: "700", color: "#1e40af", marginVertical: 8 },
  btn: { backgroundColor: "#2563eb", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 8 },
  btnText: { color: "white", fontWeight: "600" },
  btnSecondary: { borderWidth: 1, borderColor: "#2563eb", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 12 },
  btnSecondaryText: { color: "#2563eb", fontWeight: "600" },
  sellerCard: { marginTop: 16, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e0e0e0" },
});
