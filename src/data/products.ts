import bag1 from "@/assets/bag-1.jpg";
import bag2 from "@/assets/bag-2.jpg";
import bag3 from "@/assets/bag-3.jpg";
import catMen from "@/assets/cat-men.jpg";
import catShoes from "@/assets/cat-shoes.jpg";
import edit1 from "@/assets/edit-1.jpg";
import edit2 from "@/assets/edit-2.jpg";
import edit3 from "@/assets/edit-3.jpg";

export type LuxeProduct = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  note: string;
  description: string;
  wooProductId?: number;
  categorySlugs?: string[];
  images?: string[];
  type?: "simple" | "variable";
  attributes?: Array<{ name: string; options: string[] }>;
};

export type ProductVariation = {
  id: number;
  price: number;
  image?: string;
  inStock: boolean;
  attributes: Array<{ name: string; option: string }>;
};

export const luxeProducts: LuxeProduct[] = [
  {
    id: 101,
    slug: "maren-top-handle",
    name: "The Maren Top-Handle",
    category: "handbags",
    price: 2480,
    image: bag1,
    note: "Caramel calfskin",
    description:
      "An architectural top-handle in supple calfskin, finished with champagne-gold hardware and a structured day-to-evening profile.",
    wooProductId: 101,
  },
  {
    id: 102,
    slug: "noir-quilted-shoulder",
    name: "Noir Quilted Shoulder",
    category: "handbags",
    price: 3150,
    image: bag2,
    note: "Black lambskin",
    description:
      "Heritage diamond quilting, a soft lambskin body, and a woven chain strap for a polished evening silhouette.",
    wooProductId: 102,
  },
  {
    id: 103,
    slug: "ivoire-mini",
    name: "The Ivoire Mini",
    category: "handbags",
    price: 1890,
    image: bag3,
    note: "Ivory pebble leather",
    description:
      "Compact, considered, and made for daylight styling with a sculptural mini silhouette.",
    wooProductId: 103,
  },
  {
    id: 201,
    slug: "silk-slip-dress",
    name: "Silk Slip Dress",
    category: "women",
    price: 890,
    image: edit2,
    note: "Fluid evening silhouette",
    description:
      "A liquid silk slip dress cut for movement, softness, and restrained occasionwear.",
    wooProductId: 201,
  },
  {
    id: 301,
    slug: "chain-necklace-set",
    name: "Chain Necklace Set",
    category: "accessories",
    price: 420,
    image: edit3,
    note: "Polished gold finish",
    description: "Layered chain necklaces with a warm polished finish for everyday luxury styling.",
    wooProductId: 301,
  },
  {
    id: 302,
    slug: "accessory-edit",
    name: "Accessory Edit",
    category: "accessories",
    price: 340,
    image: edit1,
    note: "Curated finishing details",
    description: "A curated accessory story built around small, sharp finishing pieces.",
    wooProductId: 302,
  },
  {
    id: 401,
    slug: "luxe-court-heel",
    name: "Luxe Court Heel",
    category: "shoes",
    price: 760,
    image: catShoes,
    note: "Patent evening heel",
    description: "A sculpted court heel with a glossy finish and poised evening proportion.",
    wooProductId: 401,
  },
  {
    id: 402,
    slug: "weekend-loafer",
    name: "Weekend Loafer",
    category: "men",
    price: 620,
    image: catMen,
    note: "Structured leather",
    description: "A clean leather loafer shaped for relaxed tailoring and travel days.",
    wooProductId: 402,
  },
];

export function getLocalProducts(category?: string) {
  if (!category || category === "new-arrivals") {
    return luxeProducts;
  }
  return luxeProducts.filter((product) => product.category === category);
}

export function getLocalProduct(slug: string) {
  return luxeProducts.find((product) => product.slug === slug);
}
