import process from "node:process";

import { getRequestHeader } from "@tanstack/react-start/server";

import { REGION_RATES, convertPrice } from "@/config/regions";
import { getStoreConfig, type StoreConfig, type StoreCountry } from "@/config/storeConfig";
import { getLocalProduct, getLocalProducts, type LuxeProduct } from "@/data/products";
import { getSupabaseClient } from "@/lib/supabase.server";

type WooVariation = {
  id: number;
  price?: string;
  regular_price?: string;
  image?: { src?: string };
  attributes?: Array<{ name?: string; option?: string }>;
  stock_status?: string;
};

type StoreCredentials = {
  key: string;
  secret: string;
};

type ProductRow = {
  id: string;
  woo_product_id: number;
  slug: string;
  name: string;
  brand: string | null;
  category_slugs: string[] | null;
  description: string | null;
  price: number | string;
  type: string | null;
  attributes: Array<{ name: string; options: string[] }> | null;
  cover_image: string | null;
};

// The Luxeholic nav uses flat shopping slugs, but the WooCommerce store nests
// categories under gender (e.g. mid-heels -> pumps -> shoes -> women). The
// products cache stores each product's full resolved category-slug ancestry
// (computed once at sync time), so nav filtering here is just an array check.
const NAV_TO_WOO_CATEGORY: Record<string, string> = {
  women: "women",
  men: "men",
  handbags: "bags",
  shoes: "shoes",
  accessories: "accessories",
};

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

function mapRowToProduct(row: ProductRow, country: StoreCountry, images?: string[]): LuxeProduct {
  return {
    id: row.woo_product_id,
    slug: row.slug,
    name: row.name,
    category: row.category_slugs?.[0] ?? "new-arrivals",
    categorySlugs: row.category_slugs ?? [],
    price: convertPrice(Number(row.price), country),
    image: row.cover_image ?? "",
    images: images ?? (row.cover_image ? [row.cover_image] : []),
    type: row.type === "variable" ? "variable" : "simple",
    attributes: row.attributes ?? [],
    note: row.brand ?? "Luxeholic",
    description: row.description ?? "",
    wooProductId: row.woo_product_id,
  };
}

function resolveNavCategoryFromSlugs(categorySlugs: string[]): string | undefined {
  return Object.entries(NAV_TO_WOO_CATEGORY).find(([, wooSlug]) =>
    categorySlugs.includes(wooSlug),
  )?.[0];
}

export async function fetchStoreProductsFromWoo(
  category?: string,
  search?: string,
): Promise<LuxeProduct[]> {
  const config = getStoreConfig(getRequestHostname());
  const supabase = getSupabaseClient();
  if (!supabase) {
    return filterLocalProducts(category, search);
  }

  try {
    let query = supabase.from("products").select("*").eq("is_active", true);
    const wooCategory =
      category && category !== "new-arrivals" ? NAV_TO_WOO_CATEGORY[category] : undefined;
    if (wooCategory) {
      query = query.contains("category_slugs", [wooCategory]);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
    }
    const { data, error } = await query.limit(100);
    if (error) throw error;
    return (data ?? []).map((row) => mapRowToProduct(row as ProductRow, config.country));
  } catch (error) {
    console.warn("Supabase product cache unavailable, using local Luxeholic cache", error);
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
  const supabase = getSupabaseClient();
  if (!supabase) {
    return paginateLocalProducts(page, perPage, category, search, minPrice, maxPrice);
  }

  try {
    const rate = REGION_RATES[config.country];
    let query = supabase.from("products").select("*", { count: "exact" }).eq("is_active", true);

    const wooCategory =
      category && category !== "new-arrivals" ? NAV_TO_WOO_CATEGORY[category] : undefined;
    if (wooCategory) {
      query = query.contains("category_slugs", [wooCategory]);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
    }
    if (minPrice != null) {
      query = query.gte("price", minPrice / rate);
    }
    if (maxPrice != null) {
      query = query.lte("price", maxPrice / rate);
    }

    const from = (page - 1) * perPage;
    const { data, count, error } = await query.range(from, from + perPage - 1);
    if (error) throw error;

    return {
      products: (data ?? []).map((row) => mapRowToProduct(row as ProductRow, config.country)),
      total: count ?? data?.length ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? data?.length ?? 0) / perPage)),
    };
  } catch (error) {
    console.warn("Supabase product cache unavailable, using local Luxeholic cache", error);
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
    const response = await fetch(`${config.apiUrl}/products/${productId}/variations?per_page=100`, {
      headers: { Authorization: makeAuthHeader(credentials) },
    });
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

export async function fetchRelatedProductsFromWoo(slug: string, categorySlugs: string[]) {
  const config = getStoreConfig(getRequestHostname());
  const supabase = getSupabaseClient();
  if (!supabase || categorySlugs.length === 0) {
    return fallbackRelatedProducts(slug, categorySlugs);
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .overlaps("category_slugs", categorySlugs)
      .neq("slug", slug)
      .limit(4);
    if (error) throw error;
    return (data ?? []).map((row) => mapRowToProduct(row as ProductRow, config.country));
  } catch (error) {
    console.warn("Supabase related products unavailable, using local Luxeholic cache", error);
    return fallbackRelatedProducts(slug, categorySlugs);
  }
}

async function fallbackRelatedProducts(slug: string, categorySlugs: string[]) {
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
  const supabase = getSupabaseClient();
  if (!supabase) {
    return getLocalProduct(slug);
  }

  try {
    const { data: row, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    if (!row) return getLocalProduct(slug);

    const { data: imageRows } = await supabase
      .from("product_images")
      .select("url")
      .eq("product_id", row.id)
      .order("sort_order", { ascending: true });

    return mapRowToProduct(
      row as ProductRow,
      config.country,
      (imageRows ?? []).map((image) => image.url),
    );
  } catch (error) {
    console.warn("Supabase product cache unavailable, using local Luxeholic cache", error);
    return getLocalProduct(slug);
  }
}

function filterLocalProducts(category?: string, search?: string) {
  return filterProducts(getLocalProducts(category), category, search);
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
