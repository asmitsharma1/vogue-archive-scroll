import { useState } from "react";

import { Link } from "@tanstack/react-router";

import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";

const shopNav = [
  ["Women", "/shop/women"],
  ["Men", "/shop/men"],
  ["Handbags", "/shop/handbags"],
  ["Shoes", "/shop/shoes"],
  ["Accessories", "/shop/accessories"],
  ["New Arrivals", "/shop/new-arrivals"],
] as const;

export function SiteLogo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`font-serif text-2xl tracking-[0.4em] ${className}`}>
      LUXEHOLIC
    </Link>
  );
}

export function SiteHeader() {
  const { totalItems } = useCart();
  const { label, currency } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-ivory/90 text-noir backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10">
        <a
          href="/customer-service/shipping-information"
          className="hidden text-xs uppercase tracking-[0.3em] md:block"
        >
          Menu
        </a>
        <button
          type="button"
          aria-label="Toggle menu"
          className="text-xs uppercase tracking-[0.3em] md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          ☰
        </button>
        <SiteLogo />
        <div className="flex items-center gap-6 text-xs uppercase tracking-[0.25em]">
          <span className="hidden text-noir/50 md:inline">
            {label} / {currency}
          </span>
          <a href="/#newsletter" className="hidden md:inline">
            Account
          </a>
          <Link to="/cart">Bag ({totalItems})</Link>
        </div>
      </div>
      <nav className="hidden border-t border-border md:block">
        <ul className="mx-auto flex max-w-[1600px] items-center justify-center gap-10 px-10 py-3 text-[11px] uppercase tracking-[0.3em]">
          {shopNav.map(([label, href]) => (
            <li key={label}>
              <a href={href} className="group relative">
                {label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {open && (
        <div className="border-t border-border bg-ivory text-noir md:hidden">
          <ul className="flex flex-col px-6 py-4 text-sm uppercase tracking-[0.25em]">
            {shopNav.map(([label, href]) => (
              <li key={label} className="border-b border-border/40 py-3 last:border-0">
                <a href={href} onClick={() => setOpen(false)}>
                  {label}
                </a>
              </li>
            ))}
            <li className="py-3">
              <a href="/#newsletter" onClick={() => setOpen(false)}>
                Account
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const cols = [
    {
      t: "Shop",
      l: [
        ["Women", "/shop/women"],
        ["Men", "/shop/men"],
        ["Handbags", "/shop/handbags"],
        ["Shoes", "/shop/shoes"],
        ["Accessories", "/shop/accessories"],
        ["New Arrivals", "/shop/new-arrivals"],
      ],
    },
    {
      t: "House",
      l: [
        ["About Luxeholic", "/#world"],
        ["The Atelier", "/#world"],
        ["Careers", "/customer-service/careers"],
        ["Press", "/customer-service/contact-us"],
      ],
    },
    {
      t: "Care",
      l: [
        ["Customer Care", "/customer-service/shipping-information"],
        ["Shipping & Returns", "/customer-service/shipping-information"],
        ["Order Tracking", "/customer-service/order-tracking"],
        ["Size Guide", "/customer-service/size-guide"],
        ["Contact", "/customer-service/contact-us"],
      ],
    },
    {
      t: "Legal",
      l: [
        ["Privacy Policy", "/customer-service/privacy-policy"],
        ["Terms of Service", "/customer-service/terms-conditions"],
        ["Cookie Settings", "/customer-service/cookie-settings"],
      ],
    },
  ];

  return (
    <footer className="bg-noir pb-10 pt-24 text-ivory">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-12 border-b border-ivory/10 pb-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <SiteLogo className="text-gold" />
            <p className="mt-6 max-w-xs text-sm font-light leading-relaxed text-ivory/60">
              A modern luxury house composed of handbags, fashion, and objects of lasting beauty.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.t} className="md:col-span-2">
              <h4 className="eyebrow text-gold">{col.t}</h4>
              <ul className="mt-5 space-y-3 text-sm font-light text-ivory/70">
                {col.l.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="transition hover:text-gold">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-[10px] uppercase tracking-[0.3em] text-ivory/40 md:flex-row">
          <p>© {new Date().getFullYear()} Luxeholic Maison. All Rights Reserved.</p>
          <p>Paris · Milan · Tokyo</p>
        </div>
      </div>
    </footer>
  );
}
