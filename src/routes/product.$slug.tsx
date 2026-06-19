import { useMemo, useState } from "react";

import { createFileRoute, notFound } from "@tanstack/react-router";

import { ProductCard } from "@/components/ProductCard";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { storeConfig } from "@/config/storeConfig";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { redirectToWooCheckout } from "@/lib/woo-checkout";
import {
  fetchProductVariations,
  fetchRelatedProducts,
  fetchStoreProduct,
} from "@/services/store-api";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await fetchStoreProduct(params.slug);
    if (!product) {
      throw notFound();
    }
    const [variations, related] = await Promise.all([
      product.type === "variable" && product.wooProductId
        ? fetchProductVariations(product.wooProductId)
        : Promise.resolve([]),
      fetchRelatedProducts(product.slug, product.categorySlugs ?? []),
    ]);
    return { product, variations, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} | Luxeholic` },
        { name: "description", content: product.description },
        { property: "og:title", content: `${product.name} | Luxeholic` },
        { property: "og:description", content: product.description },
        { property: "og:image", content: product.image },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "pinterest-rich-pin", content: "true" },
        {
          "script:ld+json": {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images?.length ? product.images : [product.image],
            brand: { "@type": "Brand", name: product.note },
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: storeConfig.currency,
              availability: "https://schema.org/InStock",
            },
          },
        },
      ],
    };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { product, variations, related } = Route.useLoaderData();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  const gallery = product.images?.length ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [quantity, setQuantity] = useState(1);

  const sizeAttribute = product.attributes?.[0];
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);

  const selectedVariation = useMemo(() => {
    if (!sizeAttribute || !selectedOption) return undefined;
    return variations.find((variation) =>
      variation.attributes.some(
        (attribute) => attribute.name === sizeAttribute.name && attribute.option === selectedOption,
      ),
    );
  }, [sizeAttribute, selectedOption, variations]);

  const availableOptions = useMemo(
    () => new Set(variations.flatMap((variation) => variation.attributes.map((a) => a.option))),
    [variations],
  );

  const requiresSelection = Boolean(sizeAttribute) && variations.length > 0;
  const canAddToBag = !requiresSelection || Boolean(selectedVariation);
  const activePrice = selectedVariation?.price ?? product.price;

  const cartItem = {
    id: `${product.id}-${product.slug}-${selectedVariation?.id ?? "default"}`,
    productId: product.wooProductId ?? product.id,
    variationId: selectedVariation?.id,
    name: product.name,
    price: activePrice,
    image: selectedVariation?.image ?? product.image,
    quantity,
    slug: product.slug,
  };

  return (
    <div className="min-h-screen bg-ivory text-noir">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-10 px-6 py-16 md:grid-cols-2 md:px-10 md:py-24">
        <section>
          <div className="relative isolate min-h-[360px] overflow-hidden md:min-h-[520px]">
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full mix-blend-multiply object-cover"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {gallery.map((src) => (
                <button
                  key={src}
                  onClick={() => setActiveImage(src)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden border ${
                    activeImage === src ? "border-gold" : "border-border"
                  }`}
                >
                  <img
                    src={src}
                    alt={product.name}
                    className="h-full w-full mix-blend-multiply object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </section>
        <section className="flex flex-col justify-center">
          <p className="eyebrow">{product.note}</p>
          <h1 className="mt-5 font-serif text-4xl leading-[0.95] sm:text-6xl md:text-8xl">
            {product.name}
          </h1>
          <p className="mt-8 font-serif text-3xl text-gold md:text-4xl">
            {formatPrice(activePrice)}
          </p>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-noir/65">
            {product.description}
          </p>

          {sizeAttribute && (
            <div className="mt-8">
              <p className="eyebrow">{sizeAttribute.name}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {sizeAttribute.options.map((option) => {
                  const isAvailable = availableOptions.has(option);
                  return (
                    <button
                      key={option}
                      disabled={!isAvailable}
                      onClick={() => setSelectedOption(option)}
                      className={`inline-flex h-8 items-center justify-center border px-2.5 text-[10px] uppercase tracking-wider transition ${
                        selectedOption === option
                          ? "border-noir bg-noir text-ivory"
                          : "border-border text-noir/70"
                      } ${!isAvailable ? "cursor-not-allowed opacity-30" : "hover:border-noir hover:text-noir"}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {requiresSelection && !selectedVariation && (
                <p className="mt-2 text-xs text-noir/50">
                  Select a {sizeAttribute.name.toLowerCase()} to continue.
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <p className="eyebrow">Quantity</p>
            <div className="flex items-center border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 transition hover:bg-stone"
              >
                −
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 transition hover:bg-stone"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => addItem(cartItem)}
              disabled={!canAddToBag}
              className="border border-noir px-8 py-4 text-[11px] uppercase tracking-[0.3em] transition hover:bg-noir hover:text-ivory disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add to Bag
            </button>
            <button
              onClick={() =>
                redirectToWooCheckout([
                  {
                    product_id: product.wooProductId ?? product.id,
                    variation_id: selectedVariation?.id,
                    quantity,
                  },
                ])
              }
              disabled={!canAddToBag}
              className="bg-noir px-8 py-4 text-[11px] uppercase tracking-[0.3em] text-ivory transition hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy Now
            </button>
          </div>
          <a
            href="/customer-service/shipping-information"
            className="mt-8 text-[11px] uppercase tracking-[0.3em] text-noir/50 transition hover:text-gold"
          >
            Shipping & Returns
          </a>
        </section>
      </main>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-6 py-16 md:px-10 md:py-24">
          <p className="eyebrow">You May Also Like</p>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl">Related Pieces</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
