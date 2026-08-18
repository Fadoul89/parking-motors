"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Listing, User } from "@parking-motors/shared";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

const ROLE_LABEL: Record<string, string> = { BUYER: "Acheteur", SELLER: "Vendeur", ADMIN: "Admin" };
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  DISABLED: "Désactivée",
  EXPIRED: "Expirée",
  SUSPENDED: "🚫 Suspendue",
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, listingsRes] = await Promise.all([api.adminListUsers(), api.adminListListings()]);
      setUsers(usersRes.users);
      setListings(listingsRes.listings);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "ADMIN") load();
  }, [user]);

  async function handleToggleBlock(id: string) {
    await api.adminToggleBlock(id);
    load();
  }

  async function handleDeleteListing(id: string) {
    if (!confirm("Supprimer cette annonce ?")) return;
    await api.adminDeleteListing(id);
    load();
  }

  async function handleToggleSuspend(id: string) {
    await api.adminToggleSuspend(id);
    load();
  }

  if (authLoading) return <div className="container">Chargement…</div>;

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="container">
        <h1>Accès réservé</h1>
        <p>Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="container wide">
      <h1>Back-office admin</h1>
      {error && <p className="error-text">{error}</p>}
      {loading && <p>Chargement…</p>}

      <h2>Utilisateurs ({users.length})</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}>Rôle</th>
              <th style={{ padding: 8 }}>Statut</th>
              <th style={{ padding: 8 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 8 }}>
                  <Link href={`/admin/users/${u.id}`} style={{ color: "var(--primary)", fontWeight: 600 }}>
                    {u.email}
                  </Link>
                  {u.sellerProfile?.isVerified && <span title="Vendeur vérifié"> 🔵</span>}
                  {u.sellerProfile?.isPremium && <span title="Vendeur Premium"> 💎</span>}
                </td>
                <td style={{ padding: 8 }}>{ROLE_LABEL[u.role] ?? u.role}</td>
                <td style={{ padding: 8 }}>{u.isBlocked ? "🚫 Bloqué" : "Actif"}</td>
                <td style={{ padding: 8 }}>
                  {u.role !== "ADMIN" && (
                    <button
                      className={u.isBlocked ? "btn secondary" : "btn danger"}
                      onClick={() => handleToggleBlock(u.id)}
                    >
                      {u.isBlocked ? "Débloquer" : "Bloquer"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: 32 }}>Annonces ({listings.length})</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: 8 }}>Titre</th>
              <th style={{ padding: 8 }}>Vendeur</th>
              <th style={{ padding: 8 }}>Statut</th>
              <th style={{ padding: 8 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 8 }}>{l.title}</td>
                <td style={{ padding: 8 }}>{l.seller?.email}</td>
                <td style={{ padding: 8 }}>{STATUS_LABEL[l.status] ?? l.status}</td>
                <td style={{ padding: 8, display: "flex", gap: 8 }}>
                  <button className="btn secondary" onClick={() => handleToggleSuspend(l.id)}>
                    {l.status === "SUSPENDED" ? "Réactiver" : "Suspendre"}
                  </button>
                  <button className="btn danger" onClick={() => handleDeleteListing(l.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
