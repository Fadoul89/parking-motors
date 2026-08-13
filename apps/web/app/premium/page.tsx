"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

const PREMIUM_PRICE_XAF = 5000;

export default function PremiumPage() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [status, setStatus] = useState<"IDLE" | "PENDING" | "SUCCESS" | "FAILED">("IDLE");
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { paymentId } = await api.subscribePremium(phone);
      setPaymentId(paymentId);
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
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!user || user.role !== "SELLER") {
    return (
      <div className="container">
        <h1>Compte Premium</h1>
        <p>Connectez-vous avec un compte vendeur pour souscrire au Premium.</p>
      </div>
    );
  }

  if (user.sellerProfile?.isPremium) {
    return (
      <div className="container">
        <h1>💎 Vous êtes Premium</h1>
        <p>
          Votre abonnement est actif
          {user.sellerProfile.premiumExpiresAt &&
            ` jusqu'au ${new Date(user.sellerProfile.premiumExpiresAt).toLocaleDateString("fr-FR")}`}
          .
        </p>
        <button className="btn" onClick={() => router.push("/dashboard")}>
          Aller au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>💎 Passer Premium</h1>
      <ul>
        <li>Plus d&apos;annonces publiables (au-delà de 5 pour un compte gratuit)</li>
        <li>Annonces en première position dans les résultats de recherche</li>
        <li>Meilleure visibilité et badge Premium</li>
        <li>Statistiques vendeur</li>
      </ul>
      <p className="listing-price">{PREMIUM_PRICE_XAF.toLocaleString()} FCFA / mois</p>

      {status === "IDLE" && (
        <form className="stack" onSubmit={handleSubscribe}>
          <label>
            Numéro Airtel Money
            <input
              required
              placeholder="ex: 07XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit">
            Souscrire — {PREMIUM_PRICE_XAF.toLocaleString()} FCFA
          </button>
        </form>
      )}

      {status === "PENDING" && (
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <p>
            ⏳ Confirmez le paiement sur votre téléphone Airtel Money ({phone})…
          </p>
        </div>
      )}

      {status === "SUCCESS" && (
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <p>✅ Paiement confirmé ! Votre compte est maintenant Premium.</p>
          <button className="btn" onClick={() => router.push("/dashboard")}>
            Aller au tableau de bord
          </button>
        </div>
      )}

      {status === "FAILED" && (
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <p className="error-text">❌ Le paiement a échoué.</p>
          <button className="btn secondary" onClick={() => setStatus("IDLE")}>
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
}
