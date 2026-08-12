import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { Listing } from "@parking-motors/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  DISABLED: "Désactivée",
  EXPIRED: "Expirée",
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (user?.role !== "SELLER") {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .mySellerListings()
      .then(({ listings }) => setListings(listings))
      .finally(() => setLoading(false));
  }, [user]);

  useFocusEffect(load);

  async function handleDelete(id: string) {
    Alert.alert("Supprimer", "Supprimer cette annonce ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await api.deleteListing(id);
          load();
        },
      },
    ]);
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Connectez-vous en tant que vendeur pour gérer vos annonces.</Text>
      </View>
    );
  }
  if (user.role !== "SELLER") {
    return (
      <View style={styles.container}>
        <Text>Cette section est réservée aux comptes vendeur.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Mes annonces</Text>
        <Pressable style={styles.btn} onPress={() => router.push("/dashboard/new")}>
          <Text style={styles.btnText}>+ Nouvelle</Text>
        </Pressable>
      </View>
      {loading && <ActivityIndicator />}
      {!loading && listings.length === 0 && <Text>Vous n&apos;avez pas encore publié d&apos;annonce.</Text>}
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.price.toLocaleString()} FCFA · {item.city}</Text>
            <Text style={styles.badge}>{STATUS_LABEL[item.status] ?? item.status}</Text>
            <View style={styles.actions}>
              <Pressable style={styles.btnSecondary} onPress={() => router.push(`/dashboard/${item.id}`)}>
                <Text style={styles.btnSecondaryText}>Modifier</Text>
              </Pressable>
              {item.status === "EXPIRED" && (
                <Pressable
                  style={styles.btnSecondary}
                  onPress={async () => {
                    await api.renewListing(item.id);
                    load();
                  }}
                >
                  <Text style={styles.btnSecondaryText}>Renouveler</Text>
                </Pressable>
              )}
              <Pressable style={styles.btnDanger} onPress={() => handleDelete(item.id)}>
                <Text style={styles.btnText}>Supprimer</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#f5f6f8" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  heading: { fontSize: 20, fontWeight: "700" },
  card: { backgroundColor: "white", borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e0e0e0" },
  title: { fontWeight: "700" },
  badge: { alignSelf: "flex-start", backgroundColor: "#dbeafe", color: "#1e40af", fontSize: 11, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, marginTop: 4 },
  actions: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  btn: { backgroundColor: "#2563eb", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  btnText: { color: "white", fontWeight: "600" },
  btnSecondary: { borderWidth: 1, borderColor: "#2563eb", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  btnSecondaryText: { color: "#2563eb", fontWeight: "600" },
  btnDanger: { backgroundColor: "#d93025", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
});
