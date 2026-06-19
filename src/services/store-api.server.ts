import process from "node:process";

import { getRequestHeader } from "@tanstack/react-start/server";

import { getStoreConfig, type StoreConfig } from "@/config/storeConfig";
import { getLocalProduct, getLocalProducts, type LuxeProduct } from "@/data/products";

type WooProduct = {
  id: number | string;
  slug: string;
  name: string;
  type?: string;
  price?: string;
  regular_price?: string;
  images?: Array<{ src?: string }>;
  categories?: Array<{ id?: number; slug?: string; name?: string }>;
  brands?: Array<{ name?: string }>;
  attributes?: Array<{ name?: string; options?: string[]; variation?: boolean }>;
  short_description?: string;
  description?: string;
};

type WooVariation = {
  id: number;
  price?: string;
  regular_price?: string;
  image?: { src?: string };
  attributes?: Array<{ name?: string; option?: string }>;
  stock_status?: string;
};

type WooCategory = {
  id: number;
  slug: string;
  parent: number;
};

type StoreCredentials = {
  key: string;
  secret: string;
};

// The Luxeholic nav uses flat shopping slugs, but the WooCommerce store nests
// categories under gender (e.g. mid-heels -> pumps -> shoes -> women). Map
// each nav slug to the WooCommerce category slug it should resolve against.
const NAV_TO_WOO_CATEGORY: Record<string, string> = {
  women: "women",
  men: "men",
  handbags: "bags",
  shoes: "shoes",
  accessories: "accessories",
};

const categoryMapCache = new Map<string, { map: Map<number, WooCategory>; expiresAt: number }>();
const CATEGORY_CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchWooCategoryMap(
  config: StoreConfig,
  credentials: StoreCredentials,
): Promise<Map<number, WooCategory>> {
  const cached = categoryMapCache.get(config.apiUrl);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.map;
  }

  const response = await fetch(`${config.apiUrl}/products/categories?per_page=100`, {
    headers: { Authorization: makeAuthHeader(credentials) },
  });
  if (!response.ok) {
    throw new Error(`WooCommerce error: ${response.status}`);
  }
  const data: WooCategory[] = await response.json();
  const map = new Map(data.map((category) => [category.id, category]));
  categoryMapCache.set(config.apiUrl, { map, expiresAt: Date.now() + CATEGORY_CACHE_TTL_MS });
  return map;
}

function resolveCategorySlugs(
  categories: WooProduct["categories"],
  categoryMap: Map<number, WooCategory>,
): string[] {
  const slugs = new Set<string>();
  for (const category of categories ?? []) {
    let current = category.id != null ? categoryMap.get(category.id) : undefined;
    if (!current && category.slug) {
      slugs.add(category.slug);
    }
    while (current) {
      slugs.add(current.slug);
      current = categoryMap.get(current.parent);
    }
  }
  return Array.from(slugs);
}

// Woo's REST API only filters by exact category id, not descendants, so to
// page through e.g. "shoes" (which nests pumps/mid-heels/high-heels/platforms
// underneath it) we resolve the full descendant id set and pass it as an
// OR-filter (comma-separated ids) to the `category` query param.
function getDescendantCategoryIds(navCategory: string, categoryMap: Map<number, WooCategory>) {
  const wooSlug = NAV_TO_WOO_CATEGORY[navCategory];
  if (!wooSlug) return [];
  const root = Array.from(categoryMap.values()).find((category) => category.slug === wooSlug);
  if (!root) return [];

  const ids = [root.id];
  const queue = [root.id];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const category of categoryMap.values()) {
      if (category.parent === currentId) {
        ids.push(category.id);
        queue.push(category.id);
      }
    }
  }
  return ids;
}

function getRequestHostname() {
  const forwardedHost = getRequestHeader("x-forwarded-host");
  const host = forwardedHost || getRequestHeader("host") || "luxeholic.in";
  return host.split(",")[0]?.trim().split(":")[0] || "luxeholic.in";
}

function readEnv(primary: string, fallback: string) {
  return process.env[primary] || process.env[fallback] || "";
}

function getStoreCredentials(config: StoreConfig): StoreCredentials {
  switch (config.country) {
    case "AU":
      return {
        key: readEnv("WOOCOMMERCE_KEY_AUSTRALIA", "VITE_WOOCOMMERCE_KEY_AUSTRALIA"),
        secret: readEnv("WOOCOMMERCE_SECRET_AUSTRALIA", "VITE_WOOCOMMERCE_SECRET_AUSTRALIA"),
      };
    case "NZ":
      return {
        key: readEnv("WOOCOMMERCE_KEY_NEWZEALAND", "VITE_WOOCOMMERCE_KEY_NEWZEALAND"),
        secret: readEnv("WOOCOMMERCE_SECRET_NEWZEALAND", "VITE_WOOCOMMERCE_SECRET_NEWZEALAND"),
      };
    case "IN":
    default:
      return {
        key: readEnv("WOOCOMMERCE_KEY_INDIA", "VITE_WOOCOMMERCE_KEY_INDIA"),
        secret: readEnv("WOOCOMMERCE_SECRET_INDIA", "VITE_WOOCOMMERCE_SECRET_INDIA"),
      };
  }
}

function hasWooCredentials(credentials: StoreCredentials) {
  return Boolean(credentials.key && credentials.secret);
}

function makeAuthHeader(credentials: StoreCredentials) {
  return `Basic ${Buffer.from(`${credentials.key}:${credentials.secret}`).toString("base64")}`;
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#039;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

// WooCommerce stores product/brand titles with HTML-entity-encoded
// characters (e.g. "Dolce &amp; Gabbana"). Decode before rendering so JSX
// doesn't double-escape them into "&amp;amp;".
function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;|&lt;|&gt;|&quot;|&#039;|&apos;|&nbsp;/g, (entity) => HTML_ENTITIES[entity])
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function normalizeWooProduct(
  product: WooProduct,
  categoryMap: Map<number, WooCategory>,
): LuxeProduct {
  return {
    id: Number(product.id),
    slug: product.slug,
    name: decodeHtmlEntities(product.name),
    category: product.categories?.[0]?.slug ?? "new-arrivals",
    categorySlugs: resolveCategorySlugs(product.categories, categoryMap),
    price: Number.parseFloat(product.price || product.regular_price || "0"),
    image: product.images?.[0]?.src ?? "",
    images: (product.images ?? []).map((image) => image.src).filter((src): src is string => !!src),
    type: product.type === "variable" ? "variable" : "simple",
    attributes: (product.attributes ?? [])
      .filter((attribute) => attribute.name && attribute.options?.length && attribute.variation)
      .map((attribute) => ({ name: attribute.name!, options: attribute.options! })),
    note: decodeHtmlEntities(
      product.brands?.[0]?.name ?? product.categories?.[0]?.name ?? "Luxeholic",
    ),
    description: decodeHtmlEntities(
      product.short_description?.replace(/<[^>]+>/g, "") ||
        product.description?.replace(/<[^>]+>/g, "") ||
        "",
    ),
    wooProductId: Number(product.id),
  };
}

export async function fetchStoreProductsFromWoo(category?: string, search?: string) {
  const config = getStoreConfig(getRequestHostname());
  const credentials = getStoreCredentials(config);

  if (!hasWooCredentials(credentials)) {
    return filterLocalProducts(category, search);
  }

  try {
    const params = new URLSearchParams({
      per_page: "100",
      status: "publish",
    });
    if (search) {
      params.set("search", search);
    }
    const [categoryMap, response] = await Promise.all([
      fetchWooCategoryMap(config, credentials),
      fetch(`${config.apiUrl}/products?${params.toString()}`, {
        headers: { Authorization: makeAuthHeader(credentials) },
      }),
    ]);
    if (!response.ok) {
      throw new Error(`WooCommerce error: ${response.status}`);
    }
    const data = await response.json();
    const normalized: LuxeProduct[] = Array.isArray(data)
      ? data.map((product: WooProduct) => normalizeWooProduct(product, categoryMap))
      : [];
    return filterWooProducts(normalized, category, search);
  } catch (error) {
    console.warn("WooCommerce unavailable, using local Luxeholic cache", error);
    return filterLocalProducts(category, search);
  }
}

export async function fetchStoreProductsPageFromWoo(
  page: number,
  perPage: number,
  category?: string,
  search?: string,
  minPrice?: number,
  maxPrice?: number,
): Promise<{ products: LuxeProduct[]; total: number; totalPages: number }> {
  const config = getStoreConfig(getRequestHostname());
  const credentials = getStoreCredentials(config);

  if (!hasWooCredentials(credentials)) {
    return paginateLocalProducts(page, perPage, category, search, minPrice, maxPrice);
  }

  try {
    const categoryMap = await fetchWooCategoryMap(config, credentials);
    const params = new URLSearchParams({
      per_page: String(perPage),
      page: String(page),
      status: "publish",
    });
    if (search) {
      params.set("search", search);
    }
    if (minPrice != null) {
      params.set("min_price", String(minPrice));
    }
    if (maxPrice != null) {
      params.set("max_price", String(maxPrice));
    }
    if (category && category !== "new-arrivals") {
      const ids = getDescendantCategoryIds(category, categoryMap);
      if (ids.length > 0) {
        params.set("category", ids.join(","));
      }
    }
    const response = await fetch(`${config.apiUrl}/products?${params.toString()}`, {
      headers: { Authorization: makeAuthHeader(credentials) },
    });
    if (!response.ok) {
      throw new Error(`WooCommerce error: ${response.status}`);
    }
    const data = await response.json();
    const products: LuxeProduct[] = Array.isArray(data)
      ? data.map((product: WooProduct) => normalizeWooProduct(product, categoryMap))
      : [];
    const total = Number(response.headers.get("X-WP-Total") ?? products.length);
    const totalPages = Number(response.headers.get("X-WP-TotalPages") ?? 1);
    return { products, total, totalPages };
  } catch (error) {
    console.warn("WooCommerce unavailable, using local Luxeholic cache", error);
    return paginateLocalProducts(page, perPage, category, search, minPrice, maxPrice);
  }
}

export async function fetchProductVariationsFromWoo(productId: number) {
  const config = getStoreConfig(getRequestHostname());
  const credentials = getStoreCredentials(config);
  if (!hasWooCredentials(credentials)) {
    return [];
  }

  try {
    const response = await fetch(
      `${config.apiUrl}/products/${productId}/variations?per_page=100`,
      { headers: { Authorization: makeAuthHeader(credentials) } },
    );
    if (!response.ok) {
      throw new Error(`WooCommerce error: ${response.status}`);
    }
    const data: WooVariation[] = await response.json();
    return data.map((variation) => ({
      id: variation.id,
      price: Number.parseFloat(variation.price || variation.regular_price || "0"),
      image: variation.image?.src,
      inStock: variation.stock_status !== "outofstock",
      attributes: (variation.attributes ?? [])
        .filter((attribute) => attribute.name && attribute.option)
        .map((attribute) => ({ name: attribute.name!, option: attribute.option! })),
    }));
  } catch (error) {
    console.warn("WooCommerce variations unavailable", error);
    return [];
  }
}

function resolveNavCategoryFromSlugs(categorySlugs: string[]): string | undefined {
  return Object.entries(NAV_TO_WOO_CATEGORY).find(([, wooSlug]) =>
    categorySlugs.includes(wooSlug),
  )?.[0];
}

export async function fetchRelatedProductsFromWoo(slug: string, categorySlugs: string[]) {
  const navCategory = resolveNavCategoryFromSlugs(categorySlugs);
  const products = await fetchStoreProductsFromWoo(navCategory);
  return products.filter((product) => product.slug !== slug).slice(0, 4);
}

function paginateLocalProducts(
  page: number,
  perPage: number,
  category?: string,
  search?: string,
  minPrice?: number,
  maxPrice?: number,
) {
  const all = filterLocalProducts(category, search).filter((product) => {
    if (minPrice != null && product.price < minPrice) return false;
    if (maxPrice != null && product.price > maxPrice) return false;
    return true;
  });
  const start = (page - 1) * perPage;
  return {
    products: all.slice(start, start + perPage),
    total: all.length,
    totalPages: Math.max(1, Math.ceil(all.length / perPage)),
  };
}

export async function fetchStoreProductFromWoo(slug: string) {
  const config = getStoreConfig(getRequestHostname());
  const credentials = getStoreCredentials(config);

  if (!hasWooCredentials(credentials)) {
    return getLocalProduct(slug);
  }

  try {
    const [categoryMap, response] = await Promise.all([
      fetchWooCategoryMap(config, credentials),
      fetch(`${config.apiUrl}/products?slug=${encodeURIComponent(slug)}&per_page=1&status=publish`, {
        headers: { Authorization: makeAuthHeader(credentials) },
      }),
    ]);
    if (!response.ok) {
      throw new Error(`WooCommerce error: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) && data[0]
      ? normalizeWooProduct(data[0], categoryMap)
      : getLocalProduct(slug);
  } catch (error) {
    console.warn("WooCommerce product unavailable, using local Luxeholic cache", error);
    return getLocalProduct(slug);
  }
}

function filterLocalProducts(category?: string, search?: string) {
  return filterProducts(getLocalProducts(category), category, search);
}

function filterWooProducts(products: LuxeProduct[], category?: string, search?: string) {
  const wooCategory = category ? NAV_TO_WOO_CATEGORY[category] : undefined;
  const byCategory = wooCategory
    ? products.filter((product) => product.categorySlugs?.includes(wooCategory))
    : products;
  return filterBySearch(byCategory, search);
}

function filterProducts(products: LuxeProduct[], category?: string, search?: string) {
  const byCategory =
    category && category !== "new-arrivals"
      ? products.filter((product) => product.category === category)
      : products;
  return filterBySearch(byCategory, search);
}

function filterBySearch(products: LuxeProduct[], search?: string) {
  if (!search) {
    return products;
  }
  const lower = search.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lower) ||
      product.note.toLowerCase().includes(lower) ||
      product.category.toLowerCase().includes(lower),
  );
}
