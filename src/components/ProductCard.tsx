import { Link } from "@tanstack/react-router";

import { useCurrency } from "@/context/CurrencyContext";
import type { LuxeProduct } from "@/data/products";

export function ProductCard({ product, badge }: { product: LuxeProduct; badge?: string }) {
  const { formatPrice } = useCurrency();

  return (
    <article className="group">
      <div className="relative isolate aspect-[4/5] overflow-hidden">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="absolute inset-0 block">
          <img
            src={product.image}
            alt={product.name}
            className="hover-zoom-img absolute inset-0 h-full w-full mix-blend-multiply object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-noir/65 p-4 text-ivory opacity-100 backdrop-blur transition md:p-5 md:opacity-0 md:group-hover:opacity-100">
            <span className="text-[11px] uppercase tracking-[0.3em]">Quick View</span>
          </div>
        </Link>
        {badge && (
          <span className="absolute left-3 top-3 z-10 bg-gold px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-noir">
            {badge}
          </span>
        )}
        <a
          href={`https://www.pinterest.com/pin/create/button/?description=${encodeURIComponent(product.name)}`}
          target="_blank"
          rel="noreferrer"
          className="absolute right-3 top-3 z-10 text-[10px] uppercase tracking-[0.3em] text-noir opacity-100 transition md:text-ivory md:opacity-0 md:group-hover:opacity-100"
        >
          Pin
        </a>
      </div>
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <p className="mt-3 text-[9px] uppercase tracking-[0.25em] text-gold">{product.note}</p>
        <h3 className="mt-1.5 line-clamp-2 font-serif text-sm leading-snug md:text-base">
          {product.name}
        </h3>
        <p className="mt-1.5 font-serif text-sm text-noir/70 md:text-base">
          {formatPrice(product.price)}
        </p>
      </Link>
    </article>
  );
}
