export const MIN_OFFER_RATIO = 0.6;
export const MAX_OFFERS_PER_DAY_PER_LISTING = 3;

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
