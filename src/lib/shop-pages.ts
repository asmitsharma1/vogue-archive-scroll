import catBags from "@/assets/cat-bags.jpg";
import catMen from "@/assets/cat-men.jpg";
import catShoes from "@/assets/cat-shoes.jpg";
import catWomen from "@/assets/cat-women.jpg";
import edit2 from "@/assets/edit-2.jpg";
import edit3 from "@/assets/edit-3.jpg";
import type { LuxeProduct } from "@/data/products";
import { fetchStoreProducts } from "@/services/store-api";

export type ShopPage = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  hero: string;
  products: LuxeProduct[];
};

const pageMeta = {
  women: {
    title: "Women",
    eyebrow: "The Edit",
    description:
      "Refined silhouettes, occasion dressing, handbags, and accessories for modern luxury wardrobes.",
    hero: catWomen,
  },
  men: {
    title: "Men",
    eyebrow: "Tailored Essentials",
    description:
      "Quietly composed pieces, premium accessories, and sharp finishing details for the modern gentleman.",
    hero: catMen,
  },
  handbags: {
    title: "Handbags",
    eyebrow: "Signature Icons",
    description:
      "Architectural top-handles, quilted shoulder bags, and compact icons with lasting presence.",
    hero: catBags,
  },
  shoes: {
    title: "Shoes",
    eyebrow: "Footwear",
    description:
      "Sculpted footwear stories for polished evenings, travel days, and elevated everyday dressing.",
    hero: catShoes,
  },
  accessories: {
    title: "Accessories",
    eyebrow: "Finishing Pieces",
    description:
      "Jewelry, small leather goods, and considered details that complete the Luxeholic silhouette.",
    hero: edit3,
  },
  "new-arrivals": {
    title: "New Arrivals",
    eyebrow: "Just Landed",
    description: "Freshly curated pieces from the Luxeholic seasonal edit, ready for discovery.",
    hero: edit2,
  },
} satisfies Record<string, Omit<ShopPage, "slug" | "products">>;

export async function getShopPage(slug: string): Promise<ShopPage | undefined> {
  const meta = pageMeta[slug as keyof typeof pageMeta];
  if (!meta) {
    return undefined;
  }
  return {
    slug,
    ...meta,
    products: await fetchStoreProducts(slug),
  };
}
