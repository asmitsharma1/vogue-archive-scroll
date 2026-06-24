import process from "node:process";

import { createClient } from "@supabase/supabase-js";

import { getStoreConfig } from "@/config/storeConfig";

// Pulls the full WooCommerce catalog (one shared catalog across all regions —
// confirmed by identical credentials per region in .env) and upserts a
// normalized cache into Supabase. Run with: bun run scripts/sync-products.ts

type WooProduct = {
  id: number;
  slug: string;
  name: string;
  sku?: string;
  status?: string;
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

type WooCategory = {
  id: number;
  slug: string;
  name: string;
  parent: number;
};

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#039;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;|&lt;|&gt;|&quot;|&#039;|&apos;|&nbsp;/g, (entity) => HTML_ENTITIES[entity])
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return "";
}

function makeAuthHeader(key: string, secret: string) {
  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
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

async function fetchAllWooCategories(
  apiUrl: string,
  authHeader: string,
): Promise<Map<number, WooCategory>> {
  const response = await fetch(`${apiUrl}/products/categories?per_page=100`, {
    headers: { Authorization: authHeader },
  });
  if (!response.ok) {
    throw new Error(`WooCommerce categories error: ${response.status}`);
  }
  const data: WooCategory[] = await response.json();
  return new Map(data.map((category) => [category.id, category]));
}

async function fetchAllWooProducts(apiUrl: string, authHeader: string): Promise<WooProduct[]> {
  const byId = new Map<number, WooProduct>();
  let page = 1;
  // WooCommerce caps per_page at 100; page through until a short page tells us we're done.
  // orderby=id is required for stable pagination — the default date ordering
  // has ties that shift page boundaries and duplicate/skip rows across pages.
  while (true) {
    const response = await fetch(
      `${apiUrl}/products?per_page=100&page=${page}&status=publish&orderby=id&order=asc`,
      { headers: { Authorization: authHeader } },
    );
    if (!response.ok) {
      throw new Error(`WooCommerce products error: ${response.status} (page ${page})`);
    }
    const batch: WooProduct[] = await response.json();
    for (const product of batch) {
      byId.set(product.id, product);
    }
    if (batch.length < 100) break;
    page += 1;
  }
  return Array.from(byId.values());
}

async function main() {
  // store.luxeholic.com.au is the only host with WooCommerce actually
  // installed (wc/v3 registered); store.luxeholic.in is plain WordPress.
  const config = getStoreConfig("luxeholic.com.au");
  const key = readEnv("WOOCOMMERCE_KEY_AUSTRALIA", "VITE_WOOCOMMERCE_KEY_AUSTRALIA");
  const secret = readEnv("WOOCOMMERCE_SECRET_AUSTRALIA", "VITE_WOOCOMMERCE_SECRET_AUSTRALIA");
  if (!key || !secret) {
    throw new Error(
      "Missing WooCommerce credentials (WOOCOMMERCE_KEY_AUSTRALIA / SECRET_AUSTRALIA)",
    );
  }
  const authHeader = makeAuthHeader(key, secret);

  const supabaseUrl = readEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log("Fetching WooCommerce category map...");
  const categoryMap = await fetchAllWooCategories(config.apiUrl, authHeader);

  console.log("Fetching full WooCommerce product catalog...");
  const wooProducts = await fetchAllWooProducts(config.apiUrl, authHeader);
  console.log(`Fetched ${wooProducts.length} products from WooCommerce.`);

  const categoryRows = Array.from(categoryMap.values()).map((category) => ({
    slug: category.slug,
    name: decodeHtmlEntities(category.name),
  }));
  const { data: upsertedCategories, error: categoryError } = await supabase
    .from("categories")
    .upsert(categoryRows, { onConflict: "slug" })
    .select("id, slug");
  if (categoryError) {
    throw new Error(`Category upsert failed: ${categoryError.message}`);
  }
  const categoryIdBySlug = new Map((upsertedCategories ?? []).map((row) => [row.slug, row.id]));

  const productRows = wooProducts.map((product) => {
    const categorySlugs = resolveCategorySlugs(product.categories, categoryMap);
    const primarySlug = product.categories?.[0]?.slug;
    return {
      woo_product_id: product.id,
      slug: product.slug,
      name: decodeHtmlEntities(product.name),
      brand: product.brands?.[0]?.name ? decodeHtmlEntities(product.brands[0].name!) : null,
      category_id: primarySlug ? (categoryIdBySlug.get(primarySlug) ?? null) : null,
      category_slugs: categorySlugs,
      description: decodeHtmlEntities(
        product.short_description?.replace(/<[^>]+>/g, "") ||
          product.description?.replace(/<[^>]+>/g, "") ||
          "",
      ),
      price: Number.parseFloat(product.price || product.regular_price || "0"),
      type: product.type === "variable" ? "variable" : "simple",
      attributes: (product.attributes ?? [])
        .filter((attribute) => attribute.name && attribute.options?.length && attribute.variation)
        .map((attribute) => ({ name: attribute.name!, options: attribute.options! })),
      sku: product.sku || null,
      cover_image: product.images?.[0]?.src ?? null,
      tags: categorySlugs,
      is_active: product.status === "publish",
      last_synced_at: new Date().toISOString(),
    };
  });

  console.log(`Upserting ${productRows.length} products into Supabase...`);
  const { data: upsertedProducts, error: productError } = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "woo_product_id" })
    .select("id, woo_product_id");
  if (productError) {
    throw new Error(`Product upsert failed: ${productError.message}`);
  }

  const productIdByWooId = new Map(
    (upsertedProducts ?? []).map((row) => [row.woo_product_id, row.id]),
  );
  const imageRows = wooProducts.flatMap((product) => {
    const productId = productIdByWooId.get(product.id);
    if (!productId) return [];
    return (product.images ?? [])
      .map((image) => image.src)
      .filter((src): src is string => !!src)
      .map((url, index) => ({ product_id: productId, url, sort_order: index }));
  });

  if (imageRows.length > 0) {
    // Replace existing images for synced products to avoid accumulating stale rows.
    const { error: deleteError } = await supabase
      .from("product_images")
      .delete()
      .in("product_id", Array.from(productIdByWooId.values()));
    if (deleteError) {
      throw new Error(`Clearing old product images failed: ${deleteError.message}`);
    }
    const { error: imageError } = await supabase.from("product_images").insert(imageRows);
    if (imageError) {
      throw new Error(`Product image insert failed: ${imageError.message}`);
    }
  }

  console.log(
    `Sync complete: ${categoryRows.length} categories, ${productRows.length} products, ${imageRows.length} images.`,
  );
}

main().catch((error) => {
  console.error("Sync failed:", error);
  process.exitCode = 1;
});
