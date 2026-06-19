import { createFileRoute, notFound } from "@tanstack/react-router";

import { ProductCard } from "@/components/ProductCard";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getShopPage } from "@/lib/shop-pages";

export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ params }) => {
    const page = await getShopPage(params.slug);
    if (!page) {
      throw notFound();
    }
    return page;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      meta: [
        { title: `${loaderData.title} | Luxeholic` },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: `${loaderData.title} | Luxeholic` },
        { property: "og:description", content: loaderData.description },
        { property: "og:image", content: loaderData.hero },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "pinterest-rich-pin", content: "true" },
      ],
    };
  },
  component: ShopPage,
});

function ShopPage() {
  const page = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-ivory text-noir">
      <SiteHeader />
      <main>
        <section className="relative h-[70vh] min-h-[520px] overflow-hidden bg-noir text-ivory">
          <img
            src={page.hero}
            alt={page.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noir/30 via-noir/20 to-noir/80" />
          <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-6 pb-16 md:px-10">
            <p className="eyebrow text-gold">{page.eyebrow}</p>
            <h1 className="mt-5 font-serif text-[18vw] leading-[0.85] md:text-[9rem]">
              {page.title}
            </h1>
            <p className="mt-6 max-w-xl text-sm font-light leading-relaxed text-ivory/75 md:text-base">
              {page.description}
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-[1600px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Collection</p>
              <h2 className="mt-4 font-serif text-5xl md:text-7xl">Featured Pieces</h2>
            </div>
            <a
              href="/customer-service/shipping-information"
              className="text-[11px] uppercase tracking-[0.3em] transition hover:text-gold"
            >
              Shipping Details
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-6">
            {page.products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
