import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { Listing } from "@parking-motors/shared";
import { API_BASE_URL } from "@/lib/config";

const SALE_LABEL: Record<string, string> = { VENTE: "Vente", LOCATION: "Location" };

function formatRemaining(expiresAt: string): string | null {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours >= 1) return `${hours} h restantes`;
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  return `${minutes} min restantes`;
}

export function ListingCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const thumb = listing.photos[0]?.url;
  const remaining = listing.isFlash && listing.expiresAt ? formatRemaining(listing.expiresAt) : null;
  const isPremiumSeller = listing.seller?.sellerProfile?.isPremium;

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/listing/${listing.id}`)}>
      <View>
        {thumb ? (
          <Image source={{ uri: `${API_BASE_URL}${thumb}` }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]} />
        )}
        {remaining && (
          <View style={styles.flashBadge}>
            <Text style={styles.flashBadgeText}>⚡ {remaining}</Text>
          </View>
        )}
        {isPremiumSeller && (
          <View style={styles.premiumBadge}>
            <Text style={styles.flashBadgeText}>💎 Premium</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.badge}>{SALE_LABEL[listing.saleType] ?? listing.saleType}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={styles.subtitle}>
          {listing.brand} {listing.model} · {listing.year}
        </Text>
        <Text style={styles.subtitle}>{listing.city}</Text>
        <Text style={styles.price}>{listing.price.toLocaleString()} FCFA</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  thumb: { width: "100%", height: 120 },
  thumbPlaceholder: { backgroundColor: "#eee" },
  body: { padding: 8, gap: 2 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  title: { fontWeight: "700" },
  subtitle: { color: "#555", fontSize: 12 },
  price: { fontWeight: "700", color: "#1e40af", marginTop: 2 },
  flashBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#f59e0b",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  flashBadgeText: { color: "white", fontSize: 10, fontWeight: "800" },
  premiumBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#7c3aed",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
