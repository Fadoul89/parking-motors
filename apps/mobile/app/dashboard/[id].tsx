import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Listing, ListingInput } from "@parking-motors/shared";
import { api } from "@/lib/api";
import { ListingForm } from "@/components/ListingForm";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/AuthContext";

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function load() {
    const { listing } = await api.getListing(id);
    setListing(listing);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(input: ListingInput) {
    await api.updateListing(id, input);
    router.replace("/(tabs)/dashboard");
  }

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("photo", {
        uri: asset.uri,
        name: asset.fileName || "photo.jpg",
        type: asset.mimeType || "image/jpeg",
      } as unknown as Blob);
      await api.uploadListingPhoto(id, formData);
      await load();
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  if (!listing) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Photos</Text>
      <ScrollView horizontal style={{ marginBottom: 8 }}>
        {listing.photos.map((p) => (
          <Image key={p.id} source={{ uri: `${API_BASE_URL}${p.url}` }} style={styles.photo} />
        ))}
      </ScrollView>
      <Pressable style={styles.btnSecondary} onPress={handlePickPhoto} disabled={uploading}>
        <Text style={styles.btnSecondaryText}>{uploading ? "Envoi…" : "+ Ajouter une photo"}</Text>
      </Pressable>
      {uploadError && <Text style={{ color: "#d93025" }}>{uploadError}</Text>}

      <View style={{ height: 16 }} />
      <Text style={styles.sectionTitle}>Détails de l&apos;annonce</Text>
      <ListingForm
        initial={listing}
        submitLabel="Enregistrer"
        onSubmit={handleSubmit}
        isPremiumSeller={!!user?.sellerProfile?.isPremium}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "white" },
  sectionTitle: { fontWeight: "700", marginBottom: 8 },
  photo: { width: 100, height: 80, borderRadius: 6, marginRight: 8 },
  btnSecondary: { borderWidth: 1, borderColor: "#2563eb", padding: 10, borderRadius: 8, alignItems: "center" },
  btnSecondaryText: { color: "#2563eb", fontWeight: "600" },
});
