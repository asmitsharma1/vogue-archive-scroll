import { storeConfig } from "@/config/storeConfig";
import type { CartItem } from "@/context/CartContext";

export type CheckoutItem = {
  product_id: number;
  variation_id?: number;
  quantity: number;
};

export function buildWooCheckoutUrl(items: CheckoutItem[]) {
  const cartParam = encodeURIComponent(JSON.stringify(items));
  return `${storeConfig.checkoutBaseUrl}/?lux_cart=${cartParam}`;
}

export function redirectToWooCheckout(items: CheckoutItem[]) {
  window.location.href = buildWooCheckoutUrl(items);
}

export function cartItemsToCheckoutItems(items: CartItem[]): CheckoutItem[] {
  return items.map((item) => ({
    product_id: item.productId,
    variation_id: item.variationId,
    quantity: item.quantity,
  }));
}
