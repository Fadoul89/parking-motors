import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/lib/AuthContext";

export default function ProfileScreen() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Vous n&apos;êtes pas connecté</Text>
        <Pressable style={styles.btn} onPress={() => router.push("/auth/login")}>
          <Text style={styles.btnText}>Connexion</Text>
        </Pressable>
        <Pressable style={styles.btnSecondary} onPress={() => router.push("/auth/register")}>
          <Text style={styles.btnSecondaryText}>Créer un compte</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{user.email}</Text>
      <Text>Type de compte : {user.role === "SELLER" ? "Vendeur" : "Acheteur"}</Text>
      {user.sellerProfile && (
        <Text>
          {user.sellerProfile.prenom} {user.sellerProfile.nom} · {user.sellerProfile.telephone}
        </Text>
      )}
      <Pressable style={styles.btnDanger} onPress={logout}>
        <Text style={styles.btnText}>Déconnexion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: "#f5f6f8" },
  heading: { fontSize: 20, fontWeight: "700" },
  btn: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: "white", fontWeight: "600" },
  btnSecondary: { borderWidth: 1, borderColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center" },
  btnSecondaryText: { color: "#2563eb", fontWeight: "600" },
  btnDanger: { backgroundColor: "#d93025", padding: 12, borderRadius: 8, alignItems: "center" },
});
