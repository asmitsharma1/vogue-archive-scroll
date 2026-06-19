import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { cartItemsToCheckoutItems, redirectToWooCheckout } from "@/lib/woo-checkout";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Your Bag | Luxeholic" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const { formatPrice } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory text-noir">
        <SiteHeader />
        <main className="mx-auto flex max-w-[1600px] flex-col items-center px-6 py-32 text-center md:px-10">
          <p className="eyebrow text-gold">Your Bag</p>
          <h1 className="mt-5 font-serif text-4xl md:text-6xl">Your bag is empty</h1>
          <p className="mt-4 max-w-md text-noir/60">
            Discover the full Luxeholic collection and add a piece you love.
          </p>
          <Link
            to="/shop"
            className="mt-10 border border-noir px-8 py-4 text-[11px] uppercase tracking-[0.3em] transition hover:bg-noir hover:text-ivory"
          >
            Continue Shopping
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory text-noir">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 py-16 md:px-10 md:py-24">
        <p className="eyebrow text-gold">Your Bag</p>
        <h1 className="mt-5 font-serif text-4xl md:text-6xl">
          {totalItems} Piece{totalItems === 1 ? "" : "s"}
        </h1>

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-[1fr_360px]">
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="flex gap-6 py-8 first:pt-0">
                <div className="relative isolate h-32 w-24 flex-shrink-0 overflow-hidden bg-stone/40 sm:h-40 sm:w-32">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full mix-blend-multiply object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      to="/product/$slug"
                      params={{ slug: item.slug }}
                      className="font-serif text-xl leading-tight transition hover:text-gold sm:text-2xl"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-2 font-serif text-lg text-noir/70">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1.5 transition hover:bg-stone"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 transition hover:bg-stone"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[11px] uppercase tracking-[0.3em] text-noir/50 transition hover:text-burgundy"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit border border-border p-8">
            <h2 className="eyebrow">Order Summary</h2>
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-noir/60">Subtotal</span>
              <span className="font-serif text-lg">{formatPrice(totalPrice)}</span>
            </div>
            <p className="mt-3 text-xs text-noir/50">Shipping & duties calculated at checkout.</p>
            <button
              onClick={() => redirectToWooCheckout(cartItemsToCheckoutItems(items))}
              className="mt-8 w-full bg-noir px-8 py-4 text-[11px] uppercase tracking-[0.3em] text-ivory transition hover:bg-burgundy"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/shop"
              className="mt-4 block text-center text-[11px] uppercase tracking-[0.3em] text-noir/50 transition hover:text-gold"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
