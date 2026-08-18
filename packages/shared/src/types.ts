export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export type VehicleType =
  | "VOITURE_NEUVE"
  | "OCCASION"
  | "ZERO_KM"
  | "SUV"
  | "MINIBUS"
  | "PICKUP"
  | "CAMION"
  | "MOTO"
  | "PRO";

export type Condition = "NEUF" | "OCCASION";
export type SaleType = "VENTE" | "LOCATION";
export type ListingStatus = "ACTIVE" | "DISABLED" | "EXPIRED" | "SUSPENDED";
export type FuelType = "ESSENCE" | "DIESEL" | "HYBRIDE" | "ELECTRIQUE";
export type Transmission = "MANUELLE" | "AUTOMATIQUE";

export interface SellerProfile {
  nom: string;
  prenom: string;
  telephone: string;
  isPremium: boolean;
  premiumExpiresAt?: string | null;
}

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface PremiumPayment {
  id: string;
  status: PaymentStatus;
  amount: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isBlocked?: boolean;
  createdAt: string;
  sellerProfile?: SellerProfile | null;
}

export interface ListingPhoto {
  id: string;
  url: string;
  order: number;
}

export interface Offer {
  id: string;
  amount: number;
  createdAt: string;
  buyer: {
    id: string;
    email: string;
  };
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  brand: string;
  model: string;
  price: number;
  year: number;
  mileage: number;
  fuel: FuelType;
  transmission: Transmission;
  vehicleType: VehicleType;
  condition: Condition;
  saleType: SaleType;
  city: string;
  country: string;
  description: string;
  status: ListingStatus;
  isFlash: boolean;
  createdAt: string;
  expiresAt: string | null;
  photos: ListingPhoto[];
  seller?: {
    id: string;
    email: string;
    sellerProfile: SellerProfile | null;
  };
  offers?: Offer[];
}

export interface ListingFilters {
  brand?: string;
  model?: string;
  city?: string;
  country?: string;
  priceMin?: number;
  priceMax?: number;
  year?: number;
  fuel?: FuelType;
  transmission?: Transmission;
  vehicleType?: VehicleType;
  condition?: Condition;
  saleType?: SaleType;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: UserRole;
  nom?: string;
  prenom?: string;
  telephone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ListingInput {
  title: string;
  brand: string;
  model: string;
  price: number;
  year: number;
  mileage: number;
  fuel: FuelType;
  transmission: Transmission;
  vehicleType: VehicleType;
  condition: Condition;
  saleType: SaleType;
  city: string;
  country?: string;
  description: string;
  flashHours?: 24 | 48;
}
