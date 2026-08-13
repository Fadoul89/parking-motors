import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

const PREMIUM_PRICE_XAF = 5000;

export default function PremiumScreen() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"IDLE" | "PENDING" | "SUCCESS" | "FAILED">("IDLE");
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleSubscribe() {
    setError(null);
    try {
      const { paymentId } = await api.subscribePremium(phone);
      setStatus("PENDING");

      pollRef.current = setInterval(async () => {
        try {
          const { payment } = await api.getPremiumPayment(paymentId);
          if (payment.status === "SUCCESS") {
            setStatus("SUCCESS");
            if (pollRef.current) clearInterval(pollRef.current);
            await refresh();
          } else if (payment.status === "FAILED") {
            setStatus("FAILED");
            if (pollRef.current) clearInterval(pollRef.current);
          }
        } catch {
          // ignore transient polling errors
        }
      }, 2000);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!user || user.role !== "SELLER") {
    return (
      <View style={styles.container}>
        <Text>Connectez-vous avec un compte vendeur pour souscrire au Premium.</Text>
      </View>
    );
  }

  if (user.sellerProfile?.isPremium) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>💎 Vous êtes Premium</Text>
        <Text>
          Actif
          {user.sellerProfile.premiumExpiresAt &&
            ` jusqu'au ${new Date(user.sellerProfile.premiumExpiresAt).toLocaleDateString("fr-FR")}`}
        </Text>
        <Pressable style={styles.btn} onPress={() => router.push("/(tabs)/dashboard")}>
          <Text style={styles.btnText}>Aller au tableau de bord</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>💎 Passer Premium</Text>
      <Text>• Plus d&apos;annonces publiables</Text>
      <Text>• Annonces en première position</Text>
      <Text>• Meilleure visibilité + badge Premium</Text>
      <Text>• Statistiques vendeur</Text>
      <Text style={styles.price}>{PREMIUM_PRICE_XAF.toLocaleString()} FCFA / mois</Text>

      {status === "IDLE" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Numéro Airtel Money (ex: 07XXXXXXX)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          {error && <Text style={{ color: "#d93025" }}>{error}</Text>}
          <Pressable style={styles.btn} onPress={handleSubscribe}>
            <Text style={styles.btnText}>Souscrire — {PREMIUM_PRICE_XAF.toLocaleString()} FCFA</Text>
          </Pressable>
        </>
      )}

      {status === "PENDING" && (
        <View style={styles.card}>
          <ActivityIndicator />
          <Text>Confirmez le paiement sur votre téléphone Airtel Money ({phone})…</Text>
        </View>
      )}

      {status === "SUCCESS" && (
        <View style={styles.card}>
          <Text>✅ Paiement confirmé ! Votre compte est maintenant Premium.</Text>
          <Pressable style={styles.btn} onPress={() => router.push("/(tabs)/dashboard")}>
            <Text style={styles.btnText}>Aller au tableau de bord</Text>
          </Pressable>
        </View>
      )}

      {status === "FAILED" && (
        <View style={styles.card}>
          <Text style={{ color: "#d93025" }}>❌ Le paiement a échoué.</Text>
          <Pressable style={styles.btnSecondary} onPress={() => setStatus("IDLE")}>
            <Text style={styles.btnSecondaryText}>Réessayer</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8, backgroundColor: "white" },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  price: { fontSize: 18, fontWeight: "800", color: "#1e40af", marginVertical: 8 },
  input: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 8, padding: 10, marginTop: 8 },
  btn: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 12 },
  btnText: { color: "white", fontWeight: "600" },
  btnSecondary: { borderWidth: 1, borderColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
  btnSecondaryText: { color: "#2563eb", fontWeight: "600" },
  card: { marginTop: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e0e0e0", gap: 8 },
});
