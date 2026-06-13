
# Luxeholic — End-to-end Build Plan

I'll build this in 6 phases. Each phase ships working, testable software before the next starts. The cinematic homepage you already have stays as the landing page; commerce surfaces are added around it.

## Phase 1 — Backend foundation
- Enable Lovable Cloud (Postgres + Auth + Storage).
- Schema: `profiles`, `user_roles` (app_role enum: admin/customer) + `has_role()` security-definer, `categories`, `products` (with sizes/colors/images/variants/sale_price/stock/sku/tags/featured/slug), `product_images`, `cart_items`, `orders`, `order_items`, `addresses`, `coupons`.
- RLS on every table + explicit GRANTs.
- Storage bucket `product-images` (public read, admin write).
- Seed: 1 demo admin (`admin@luxeholic.com` / temp password I'll share), ~12 sample products across Handbags / Dresses / Shoes / Accessories with placeholder imagery.

## Phase 2 — Auth + account
- `/auth` (email/password + Google) using Lovable Cloud auth.
- Integration-managed `_authenticated` gate; `/account`, `/account/orders`, `/account/addresses`.
- Password reset flow at `/reset-password`.

## Phase 3 — Storefront (catalog + PDP)
- `/shop`, `/shop/$category` (women, men, handbags, shoes, accessories) with filters (size, color, price, brand) + sort.
- `/product/$slug` PDP: gallery, variants, size selector, qty, add to bag, buy now, related products.
- Editorial section components match the existing luxe aesthetic (serif headlines, ivory/champagne palette, motion).

## Phase 4 — Cart + checkout
- Persistent cart (DB for logged-in, localStorage for guests, merge on login).
- `/cart`, `/checkout` (address → review → pay).
- Coupons, tax/shipping calc, inventory check on checkout.

## Phase 5 — Razorpay payments
- You'll provide `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (I'll request them via secrets when this phase starts).
- Server fn: create Razorpay order; client Razorpay Checkout; server route `/api/public/razorpay/webhook` with signature verification → finalize order, decrement stock.
- Order confirmation email (Resend — I'll request `RESEND_API_KEY`).

## Phase 6 — Admin + SEO
- `/admin` gated by `admin` role: products CRUD (with image upload), orders list + status updates, customers, low-stock alerts, revenue overview.
- SEO: per-route `head()` titles/descriptions, OG/Twitter tags, JSON-LD `Product` schema on PDPs, `Organization` on root, `BreadcrumbList`, dynamic `/sitemap.xml`, `/robots.txt`.
- Google Merchant feed: `/feed.xml` (Google Shopping product feed) + Pinterest-compatible product-rich pins via the same Product JSON-LD and OG product tags.

## Tech details
- Backend: TanStack Start server functions (`createServerFn`) + server routes for webhooks; Lovable Cloud (Supabase) for DB/Auth/Storage. No separate Node server, no MongoDB.
- Roles via `user_roles` table + `has_role()` (per security best practice).
- Validation with Zod on every server fn input.
- Razorpay over Stripe per your choice (BYOK, India-friendly).

## Starting now
Phase 1 only this turn: enable Cloud, ship migrations, seed data. I'll report back with the demo admin credentials and a preview of the seeded catalog, then ask you to greenlight Phase 2.
