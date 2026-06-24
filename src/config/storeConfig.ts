export type StoreCountry = "IN" | "AU" | "NZ";

export type StoreConfig = {
  currency: "INR" | "AUD" | "NZD";
  symbol: string;
  country: StoreCountry;
  label: string;
  apiUrl: string;
  checkoutBaseUrl: string;
};

// One shared WooCommerce catalog lives at store.luxeholic.com.au (the only
// hostname with the wc/v3 REST API actually registered — store.luxeholic.in
// is plain WordPress with no WooCommerce installed). All three regions read
// from the same apiUrl; checkoutBaseUrl stays per-region for redirects.
const CATALOG_API_URL = "https://store.luxeholic.com.au/wp-json/wc/v3";

const INDIA_STORE: StoreConfig = {
  currency: "INR",
  symbol: "₹",
  country: "IN",
  label: "India",
  apiUrl: CATALOG_API_URL,
  checkoutBaseUrl: "https://store.luxeholic.in",
};

const AUSTRALIA_STORE: StoreConfig = {
  currency: "AUD",
  symbol: "A$",
  country: "AU",
  label: "Australia",
  apiUrl: CATALOG_API_URL,
  checkoutBaseUrl: "https://au.luxeholic.in",
};

const NEW_ZEALAND_STORE: StoreConfig = {
  currency: "NZD",
  symbol: "NZ$",
  country: "NZ",
  label: "New Zealand",
  apiUrl: CATALOG_API_URL,
  checkoutBaseUrl: "https://nz.luxeholic.in",
};

export const STORE_CONFIG: Record<string, StoreConfig> = {
  "luxeholic.in": INDIA_STORE,
  "www.luxeholic.in": INDIA_STORE,
  "store.luxeholic.in": INDIA_STORE,
  localhost: INDIA_STORE,
  "127.0.0.1": INDIA_STORE,

  "luxeholic.com.au": AUSTRALIA_STORE,
  "www.luxeholic.com.au": AUSTRALIA_STORE,
  "au.luxeholic.in": AUSTRALIA_STORE,
  "aus-au.luxeholic.in": AUSTRALIA_STORE,

  "luxeholic.co.nz": NEW_ZEALAND_STORE,
  "www.luxeholic.co.nz": NEW_ZEALAND_STORE,
  "nz.luxeholic.in": NEW_ZEALAND_STORE,
  "nz-nz.luxeholic.in": NEW_ZEALAND_STORE,
};

export function getStoreConfig(hostname = "luxeholic.in") {
  return STORE_CONFIG[hostname] ?? STORE_CONFIG["luxeholic.in"];
}

const hostname = typeof window !== "undefined" ? window.location.hostname : "luxeholic.in";

export const storeConfig = getStoreConfig(hostname);
export const API_URL = storeConfig.apiUrl;
