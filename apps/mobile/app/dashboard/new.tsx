import { useRouter } from "expo-router";
import { ScrollView } from "react-native";
import type { ListingInput } from "@parking-motors/shared";
import { api } from "@/lib/api";
import { ListingForm } from "@/components/ListingForm";
import { useAuth } from "@/lib/AuthContext";

export default function NewListingScreen() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleSubmit(input: ListingInput) {
    const { listing } = await api.createListing(input);
    router.replace(`/dashboard/${listing.id}`);
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "white" }}>
      <ListingForm
        submitLabel="Publier l'annonce"
        onSubmit={handleSubmit}
        showFlashOption
        isPremiumSeller={!!user?.sellerProfile?.isPremium}
      />
    </ScrollView>
  );
}
