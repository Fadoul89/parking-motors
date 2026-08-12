"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@parking-motors/shared";

export default function RegisterPage() {
  const [role, setRole] = useState<UserRole>("BUYER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.register({
        email,
        password,
        role,
        ...(role === "SELLER" ? { nom, prenom, telephone } : {}),
      });
      await refresh();
      router.push(role === "SELLER" ? "/dashboard" : "/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>Créer un compte</h1>
      <form className="stack" onSubmit={onSubmit}>
        <label>
          Type de compte
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="BUYER">Acheteur (gratuit)</option>
            <option value="SELLER">Vendeur</option>
          </select>
        </label>
        <label>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {role === "SELLER" && (
          <>
            <label>
              Nom *
              <input required value={nom} onChange={(e) => setNom(e.target.value)} />
            </label>
            <label>
              Prénom *
              <input required value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </label>
            <label>
              Numéro de téléphone *
              <input required value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            </label>
            <p style={{ fontSize: "0.85rem", color: "#555" }}>
              ⚠️ Sans nom, prénom et numéro de téléphone, vous ne pourrez pas publier d&apos;annonce.
            </p>
          </>
        )}
        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Création…" : "Créer mon compte"}
        </button>
      </form>
    </div>
  );
}
