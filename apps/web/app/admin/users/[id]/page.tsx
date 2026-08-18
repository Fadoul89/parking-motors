"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Listing, User } from "@parking-motors/shared";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { ListingCard } from "@/components/ListingCard";

const ROLE_LABEL: Record<string, string> = { BUYER: "Acheteur", SELLER: "Vendeur", ADMIN: "Admin" };

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { user, listings } = await api.adminGetUser(id);
      setProfile(user);
      setListings(listings);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentUser?.role === "ADMIN") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, id]);

  async function handleToggleBlock() {
    await api.adminToggleBlock(id);
    load();
  }

  async function handleToggleVerify() {
    await api.adminToggleVerify(id);
    load();
  }

  if (authLoading) return <div className="container">Chargement…</div>;

  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="container">
        <h1>Accès réservé</h1>
        <p>Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  if (loading) return <div className="container">Chargement…</div>;
  if (error) return <div className="container error-text">{error}</div>;
  if (!profile) return null;

  return (
    <div className="container wide">
      <button className="btn secondary" onClick={() => router.push("/admin")} style={{ marginBottom: 16 }}>
        ← Retour à l&apos;admin
      </button>

      <h1>
        {profile.email}
        {profile.sellerProfile?.isVerified && <span title="Vendeur vérifié"> 🔵</span>}
        {profile.sellerProfile?.isPremium && <span title="Vendeur Premium"> 💎</span>}
      </h1>

      <div className="card" style={{ padding: 16, marginTop: 12 }}>
        <p>Rôle : {ROLE_LABEL[profile.role] ?? profile.role}</p>
        <p>Statut : {profile.isBlocked ? "🚫 Bloqué" : "Actif"}</p>
        <p>Inscrit le : {new Date(profile.createdAt).toLocaleDateString("fr-FR")}</p>
        {profile.sellerProfile && (
          <>
            <p>
              Nom : {profile.sellerProfile.prenom} {profile.sellerProfile.nom}
            </p>
            <p>Téléphone : {profile.sellerProfile.telephone}</p>
            <p>
              Premium :{" "}
              {profile.sellerProfile.isPremium
                ? `Actif${
                    profile.sellerProfile.premiumExpiresAt
                      ? ` jusqu'au ${new Date(profile.sellerProfile.premiumExpiresAt).toLocaleDateString("fr-FR")}`
                      : ""
                  }`
                : "Non"}
            </p>
            <p>Vendeur vérifié : {profile.sellerProfile.isVerified ? "Oui" : "Non"}</p>
          </>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {profile.role !== "ADMIN" && (
            <button className={profile.isBlocked ? "btn secondary" : "btn danger"} onClick={handleToggleBlock}>
              {profile.isBlocked ? "Débloquer" : "Bloquer"}
            </button>
          )}
          {profile.sellerProfile && (
            <button className="btn secondary" onClick={handleToggleVerify}>
              {profile.sellerProfile.isVerified ? "Retirer la vérification" : "🔵 Vérifier ce vendeur"}
            </button>
          )}
        </div>
      </div>

      <h2 style={{ marginTop: 32 }}>Annonces ({listings.length})</h2>
      {listings.length === 0 && <p>Aucune annonce.</p>}
      <div className="listing-grid">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </div>
  );
}
