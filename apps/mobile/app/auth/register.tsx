import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { UserRole } from "@parking-motors/shared";
import { useAuth } from "@/lib/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("BUYER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await register({
        email,
        password,
        role,
        ...(role === "SELLER" ? { nom, prenom, telephone } : {}),
      });
      router.replace(role === "SELLER" ? "/(tabs)/dashboard" : "/(tabs)");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.roleRow}>
        <Pressable
          style={[styles.roleBtn, role === "BUYER" && styles.roleBtnActive]}
          onPress={() => setRole("BUYER")}
        >
          <Text>Acheteur</Text>
        </Pressable>
        <Pressable
          style={[styles.roleBtn, role === "SELLER" && styles.roleBtnActive]}
          onPress={() => setRole("SELLER")}
        >
          <Text>Vendeur</Text>
        </Pressable>
      </View>
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />
      {role === "SELLER" && (
        <>
          <TextInput style={styles.input} placeholder="Nom *" value={nom} onChangeText={setNom} />
          <TextInput style={styles.input} placeholder="Prénom *" value={prenom} onChangeText={setPrenom} />
          <TextInput style={styles.input} placeholder="Téléphone *" value={telephone} onChangeText={setTelephone} />
          <Text style={styles.hint}>
            ⚠️ Sans nom, prénom et téléphone, vous ne pourrez pas publier d&apos;annonce.
          </Text>
        </>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.btn} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Création…" : "Créer mon compte"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: "white" },
  roleRow: { flexDirection: "row", gap: 8 },
  roleBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#e0e0e0", alignItems: "center" },
  roleBtnActive: { borderColor: "#2563eb", backgroundColor: "#dbeafe" },
  input: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 8, padding: 10 },
  hint: { fontSize: 12, color: "#555" },
  btn: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: "white", fontWeight: "600" },
  error: { color: "#d93025" },
});
