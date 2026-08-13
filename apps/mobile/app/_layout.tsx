import { Stack } from "expo-router";
import { AuthProvider } from "@/lib/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerTitle: "PARKING MOTORS" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[id]" options={{ headerTitle: "Annonce" }} />
        <Stack.Screen name="auth/login" options={{ headerTitle: "Connexion" }} />
        <Stack.Screen name="auth/register" options={{ headerTitle: "Créer un compte" }} />
        <Stack.Screen name="dashboard/new" options={{ headerTitle: "Nouvelle annonce" }} />
        <Stack.Screen name="dashboard/[id]" options={{ headerTitle: "Modifier l'annonce" }} />
        <Stack.Screen name="premium" options={{ headerTitle: "Premium" }} />
      </Stack>
    </AuthProvider>
  );
}
