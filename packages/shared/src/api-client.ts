import type {
  Listing,
  ListingFilters,
  ListingInput,
  ListingStatus,
  LoginPayload,
  PremiumPayment,
  RegisterPayload,
  User,
} from "./types";

export interface ApiClientOptions {
  baseUrl: string;
  getToken?: () => Promise<string | null> | string | null;
  onUnauthorized?: () => void;
}

function buildQuery(filters?: ListingFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function createApiClient(options: ApiClientOptions) {
  async function request<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<T> {
    const token = options.getToken ? await options.getToken() : null;
    const headers: Record<string, string> = {
      ...(init.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(init.headers as Record<string, string> | undefined),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${options.baseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });

    if (res.status === 401) {
      options.onUnauthorized?.();
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  return {
    register: (payload: RegisterPayload) =>
      request<{ user: User; token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    login: (payload: LoginPayload) =>
      request<{ user: User; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    logout: () => request<void>("/api/auth/logout", { method: "POST" }),
    me: () => request<{ user: User }>("/api/me"),

    listListings: (filters?: ListingFilters) =>
      request<{ listings: Listing[] }>(`/api/listings${buildQuery(filters)}`),
    getListing: (id: string) =>
      request<{ listing: Listing }>(`/api/listings/${id}`),
    createListing: (input: ListingInput) =>
      request<{ listing: Listing }>("/api/listings", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    updateListing: (id: string, input: Partial<ListingInput> & { status?: ListingStatus }) =>
      request<{ listing: Listing }>(`/api/listings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    deleteListing: (id: string) =>
      request<void>(`/api/listings/${id}`, { method: "DELETE" }),
    renewListing: (id: string) =>
      request<{ listing: Listing }>(`/api/listings/${id}/renew`, {
        method: "POST",
      }),
    uploadListingPhoto: (id: string, formData: FormData) =>
      request<{ listing: Listing }>(`/api/listings/${id}/photos`, {
        method: "POST",
        body: formData,
      }),
    mySellerListings: () =>
      request<{ listings: Listing[] }>("/api/listings/mine"),

    subscribePremium: (phone: string) =>
      request<{ paymentId: string }>("/api/premium/subscribe", {
        method: "POST",
        body: JSON.stringify({ phone }),
      }),
    getPremiumPayment: (id: string) =>
      request<{ payment: PremiumPayment; user: User }>(`/api/premium/payments/${id}`),

    listFavorites: () => request<{ listings: Listing[] }>("/api/favorites"),
    addFavorite: (listingId: string) =>
      request<void>("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ listingId }),
      }),
    removeFavorite: (listingId: string) =>
      request<void>(`/api/favorites/${listingId}`, { method: "DELETE" }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
