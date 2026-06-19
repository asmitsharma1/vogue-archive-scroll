import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getLocalProducts, type LuxeProduct, type ProductVariation } from "@/data/products";

const productListInput = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});

const productInput = z.object({
  slug: z.string().min(1),
});

const productsPageInput = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(24),
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
});

const variationsInput = z.object({
  productId: z.number(),
});

const relatedInput = z.object({
  slug: z.string().min(1),
  categorySlugs: z.array(z.string()),
});

const fetchStoreProductsServer = createServerFn({ method: "GET" })
  .validator(productListInput)
  .handler(async ({ data }) => {
    const { fetchStoreProductsFromWoo } = await import("./store-api.server");
    return fetchStoreProductsFromWoo(data.category, data.search);
  });

const fetchStoreProductServer = createServerFn({ method: "GET" })
  .validator(productInput)
  .handler(async ({ data }) => {
    const { fetchStoreProductFromWoo } = await import("./store-api.server");
    return fetchStoreProductFromWoo(data.slug);
  });

const fetchStoreProductsPageServer = createServerFn({ method: "GET" })
  .validator(productsPageInput)
  .handler(async ({ data }) => {
    const { fetchStoreProductsPageFromWoo } = await import("./store-api.server");
    return fetchStoreProductsPageFromWoo(
      data.page,
      data.perPage,
      data.category,
      data.search,
      data.minPrice,
      data.maxPrice,
    );
  });

const fetchProductVariationsServer = createServerFn({ method: "GET" })
  .validator(variationsInput)
  .handler(async ({ data }) => {
    const { fetchProductVariationsFromWoo } = await import("./store-api.server");
    return fetchProductVariationsFromWoo(data.productId);
  });

const fetchRelatedProductsServer = createServerFn({ method: "GET" })
  .validator(relatedInput)
  .handler(async ({ data }) => {
    const { fetchRelatedProductsFromWoo } = await import("./store-api.server");
    return fetchRelatedProductsFromWoo(data.slug, data.categorySlugs);
  });

export async function fetchStoreProducts(
  category?: string,
  search?: string,
): Promise<LuxeProduct[]> {
  return fetchStoreProductsServer({ data: { category, search } });
}

export async function fetchStoreProduct(slug: string): Promise<LuxeProduct | undefined> {
  return fetchStoreProductServer({ data: { slug } });
}

export async function fetchStoreProductsPage(
  page: number,
  perPage: number,
  category?: string,
  search?: string,
  minPrice?: number,
  maxPrice?: number,
): Promise<{ products: LuxeProduct[]; total: number; totalPages: number }> {
  return fetchStoreProductsPageServer({
    data: { page, perPage, category, search, minPrice, maxPrice },
  });
}

export async function fetchProductVariations(productId: number): Promise<ProductVariation[]> {
  return fetchProductVariationsServer({ data: { productId } });
}

export async function fetchRelatedProducts(
  slug: string,
  categorySlugs: string[],
): Promise<LuxeProduct[]> {
  return fetchRelatedProductsServer({ data: { slug, categorySlugs } });
}

export function searchLocalSuggestions(query: string) {
  const lower = query.toLowerCase();
  return getLocalProducts()
    .filter(
      (product) =>
        product.name.toLowerCase().includes(lower) ||
        product.note.toLowerCase().includes(lower) ||
        product.category.toLowerCase().includes(lower),
    )
    .slice(0, 5);
}
