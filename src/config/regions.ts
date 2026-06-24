import type { StoreCountry } from "./storeConfig";

// Multiplier applied to the cached base price (INR, the canonical WooCommerce
// catalog currency) to produce each region's displayed price.
//
// PLACEHOLDER VALUES — these are not real FX/markup rates. Replace with the
// actual conversion + margin numbers before relying on this for real pricing.
export const REGION_RATES: Record<StoreCountry, number> = {
  IN: 1,
  AU: 0.018,
  NZ: 0.019,
};

export function convertPrice(basePrice: number, country: StoreCountry): number {
  return basePrice * REGION_RATES[country];
}
