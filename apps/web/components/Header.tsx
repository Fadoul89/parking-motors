"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <img src="/logo.png" alt="PARKING MOTORS" className="brand-logo" />
        <span className="brand-tagline">
          <strong>Trouvez votre prochain véhicule</strong>
          <span>Achetez, vendez ou louez en toute simplicité.</span>
        </span>
      </Link>
      <nav>
        <Link href="/">Accueil</Link>
        {!loading && user?.role === "BUYER" && <Link href="/favorites">Favoris</Link>}
        {!loading && user?.role === "SELLER" && <Link href="/dashboard">Mes annonces</Link>}
        {!loading && user?.role === "SELLER" && (
          <Link href="/premium">{user.sellerProfile?.isPremium ? "💎 Premium" : "Passer Premium"}</Link>
        )}
        {!loading && user?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
        {!loading && !user && (
          <>
            <Link href="/login">Connexion</Link>
            <Link href="/register" className="btn">
              Créer un compte
            </Link>
          </>
        )}
        {!loading && user && (
          <button
            className="btn secondary"
            onClick={async () => {
              await logout();
              router.push("/");
              router.refresh();
            }}
          >
            Déconnexion
          </button>
        )}
      </nav>
    </header>
  );
}
