export const PREMIUM_PRICE_XAF = 5000;
export const PREMIUM_DURATION_DAYS = 30;
export const FREE_SELLER_LISTING_LIMIT = 5;

export function isPremiumActive(isPremium: boolean, premiumExpiresAt: Date | null): boolean {
  if (!isPremium) return false;
  if (!premiumExpiresAt) return false;
  return premiumExpiresAt.getTime() > Date.now();
}
