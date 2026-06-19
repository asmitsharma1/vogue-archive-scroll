import { useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ProductCard } from "@/components/ProductCard";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { rankBySearch } from "@/lib/smart-search";
import { fetchStoreProductsPage } from "@/services/store-api";

const PER_PAGE = 24;

const CATEGORY_FILTERS = [
  { label: "All", value: undefined },
  { label: "Women", value: "women" },
  { label: "Men", value: "men" },
  { label: "Handbags", value: "handbags" },
  { label: "Shoes", value: "shoes" },
  { label: "Accessories", value: "accessories" },
] as const;

const shopSearchSchema = z.object({
  search: z.string().optional(),
  cat: z.string().optional(),
  page: z.number().min(1).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: shopSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    fetchStoreProductsPage(
      deps.page ?? 1,
      PER_PAGE,
      deps.cat,
      deps.search,
      deps.minPrice,
      deps.maxPrice,
    ),
  head: () => ({
    meta: [
      { title: "Shop All | Luxeholic" },
      {
        name: "description",
        content: "Browse the full Luxeholic catalog — handbags, shoes, accessories, and more.",
      },
    ],
  }),
  component: ShopCatalogPage,
});

function ShopCatalogPage() {
  const { products, total, totalPages } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [searchInput, setSearchInput] = useState(search.search ?? "");
  const [minPriceInput, setMinPriceInput] = useState(search.minPrice?.toString() ?? "");
  const [maxPriceInput, setMaxPriceInput] = useState(search.maxPrice?.toString() ?? "");

  const page = search.page ?? 1;

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput === (search.search ?? "")) return;
      navigate({ search: (prev) => ({ ...prev, search: searchInput || undefined, page: 1 }) });
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const ranked = search.search
    ? rankBySearch(products, search.search, (product) => `${product.name} ${product.note}`)
    : products;

  function setCategory(value: string | undefined) {
    navigate({ search: (prev) => ({ ...prev, cat: value, page: 1 }) });
  }

  function applyPriceRange() {
    const minPrice = minPriceInput ? Number(minPriceInput) : undefined;
    const maxPrice = maxPriceInput ? Number(maxPriceInput) : undefined;
    navigate({ search: (prev) => ({ ...prev, minPrice, maxPrice, page: 1 }) });
  }

  function goToPage(nextPage: number) {
    navigate({ search: (prev) => ({ ...prev, page: nextPage }) });
  }

  return (
    <div className="min-h-screen bg-ivory text-noir">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 py-14 md:px-10">
        <div className="mb-10">
          <p className="eyebrow text-gold">Shop All</p>
          <h1 className="mt-4 font-serif text-4xl md:text-6xl">The Full Collection</h1>
          <p className="mt-3 text-sm text-noir/60">
            {total} piece{total === 1 ? "" : "s"} found
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[240px_1fr]">
          <aside className="space-y-8">
            <div>
              <p className="eyebrow">Search</p>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search the collection"
                className="mt-3 w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </div>

            <div>
              <p className="eyebrow">Category</p>
              <ul className="mt-3 space-y-2 text-sm">
                {CATEGORY_FILTERS.map((filter) => (
                  <li key={filter.label}>
                    <button
                      onClick={() => setCategory(filter.value)}
                      className={`uppercase tracking-[0.2em] transition hover:text-gold ${
                        search.cat === filter.value ? "text-gold" : "text-noir/70"
                      }`}
                    >
                      {filter.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow">Price Range</p>
              <div className="mt-3 flex items-center gap-2">
                <input
                  value={minPriceInput}
                  onChange={(event) => setMinPriceInput(event.target.value)}
                  placeholder="Min"
                  type="number"
                  className="w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <span className="text-noir/40">–</span>
                <input
                  value={maxPriceInput}
                  onChange={(event) => setMaxPriceInput(event.target.value)}
                  placeholder="Max"
                  type="number"
                  className="w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>
              <button
                onClick={applyPriceRange}
                className="mt-3 w-full border border-noir px-4 py-2 text-[11px] uppercase tracking-[0.3em] transition hover:bg-noir hover:text-ivory"
              >
                Apply
              </button>
            </div>
          </aside>

          <div>
            {ranked.length === 0 ? (
              <p className="py-20 text-center text-sm text-noir/60">
                No pieces match your filters yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-6">
                {ranked.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-6 text-[11px] uppercase tracking-[0.3em]">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="transition hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-noir/50">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="transition hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
