import atelierImage from "@/assets/atelier.jpg";
import bagImage from "@/assets/cat-bags.jpg";
import shoesImage from "@/assets/cat-shoes.jpg";
import heroImage from "@/assets/hero.jpg";
import { getPolicyDocument } from "./policy-documents";

export type ServiceSection = {
  heading: string;
  body?: string[];
  bullets?: string[];
};

export type ServicePage = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  image: string;
  sections?: ServiceSection[];
  documentText?: string;
};

export const servicePages: ServicePage[] = [
  {
    slug: "contact-us",
    title: "Contact Us",
    kicker: "Support Desk",
    summary:
      "Reach Luxeholic Customer Support for order assistance, returns, payments, shipping updates, and account requests.",
    image: heroImage,
    sections: [
      {
        heading: "Before You Contact Us",
        body: [
          "For faster support, include your order number, registered email address, product name, and a short description of the issue.",
          "For damaged, defective, missing, tampered, or incorrect products, include product photographs, packaging photographs, and an unboxing video where available.",
        ],
      },
      {
        heading: "Support Topics",
        bullets: [
          "Order status and tracking assistance",
          "Shipping timeline questions",
          "Return, refund, and exchange requests",
          "Payment verification and failed payment support",
          "Account deletion or privacy requests",
        ],
      },
      {
        heading: "Response Times",
        body: [
          "Customer support requests are reviewed in the order received. Order-sensitive claims, including damaged or incorrect products, should be raised within the timelines stated in Luxeholic policies.",
        ],
      },
    ],
  },
  {
    slug: "careers",
    title: "Careers",
    kicker: "Join Luxeholic",
    summary:
      "Luxeholic is building a modern luxury commerce experience across product discovery, sourcing, logistics, and customer care.",
    image: atelierImage,
    sections: [
      {
        heading: "What We Build",
        body: [
          "Our work spans luxury fashion sourcing, boutique partnerships, product storytelling, digital commerce, customer support, logistics coordination, and trust operations.",
        ],
      },
      {
        heading: "Teams",
        bullets: [
          "Customer experience and concierge care",
          "Luxury sourcing and boutique operations",
          "Content, editorial, and brand storytelling",
          "Technology, product, and data",
          "Logistics, verification, and quality control",
        ],
      },
      {
        heading: "How To Apply",
        body: [
          "Share your profile, portfolio where relevant, and a short note on the function you would like to contribute to. Luxeholic will contact shortlisted candidates when suitable roles are available.",
        ],
      },
    ],
  },
  {
    slug: "shipping-information",
    title: "Shipping Information",
    kicker: "Delivery & Sourcing",
    summary:
      "Orders are routed through Luxeholic's curated global luxury supply chain, verified for authenticity, and delivered through trusted logistics partners.",
    image: heroImage,
    sections: [
      {
        heading: "How Luxeholic Ships",
        body: [
          "All products ordered on Luxeholic are shipped directly from authorized partner luxury fashion boutiques and verified global high-end supply channels across Europe and the United States.",
          "Each order is first routed through regional verification hubs for quality assurance and authenticity checks before final doorstep delivery.",
          "The exact delivery timeline for each item is displayed on the respective product page under Shipping Estimation.",
        ],
      },
      {
        heading: "Delivery Timelines & Processing",
        bullets: [
          "1-2 business days: Domestic Priority Dispatch",
          "5-10 business days: Express International Shipping",
          "12-18 business days: Standard Global Sourcing",
          "18-25 business days: Limited Edition / Elite Custom Sourcing",
          "Partner boutiques typically require 1-3 business days for verification, inspection, and dispatch allocation.",
        ],
      },
      {
        heading: "Authentication Flow",
        bullets: [
          "Boutique-level authenticity verification",
          "Quality inspection and packaging validation",
          "International transit warehouse dispatch",
          "Final domestic courier delivery",
        ],
      },
      {
        heading: "Tracking & Exceptions",
        body: [
          "Customers can track orders through the My Account dashboard or Track Your Order section. Guest users may access order status using their order ID and registered email.",
          "Delivery estimates may vary due to customs clearance, freight disruptions, seasonal congestion, or regional courier limitations.",
        ],
      },
      {
        heading: "Delay-Related Cancellations & Returns",
        body: [
          "If a cancellation or return is initiated due to customs or international transit delays, customers may be responsible for international return shipping charges, handling fees, logistics fees, and processing costs as per policy terms.",
        ],
      },
    ],
  },
  {
    slug: "payment-methods",
    title: "Payment Methods",
    kicker: "Secure Checkout",
    summary:
      "Luxeholic supports secure payment options across India, Australia, and New Zealand through trusted payment partners.",
    image: bagImage,
    sections: [
      {
        heading: "Accepted Payment Methods",
        bullets: [
          "UPI payments through Google Pay, PhonePe, and other supported UPI-enabled applications",
          "Credit and debit cards including Visa, Mastercard, and American Express",
          "Net Banking through supported banking institutions",
          "Direct bank transfer for eligible orders where available",
        ],
      },
      {
        heading: "Payment Security",
        body: [
          "Transactions are processed through trusted payment service providers, including PayU and other authorized partners.",
          "Sensitive payment information such as card numbers, CVV details, internet banking credentials, and UPI PINs are processed through encrypted channels and are not stored on Luxeholic servers.",
        ],
      },
      {
        heading: "Verification, Currency & Availability",
        body: [
          "Certain orders may be subject to additional payment verification. Luxeholic may delay, cancel, or refuse orders where authorization cannot be completed.",
          "Available payment methods may vary by customer location, order value, product category, payment gateway availability, and regulatory requirements.",
        ],
      },
    ],
  },
  {
    slug: "return-exchange",
    title: "Return & Exchange",
    kicker: "Returns, Refunds & Exchanges",
    summary:
      "Eligible items may be returned or exchanged when they are damaged, defective, incorrect, or otherwise qualify under Luxeholic policy.",
    image: atelierImage,
    sections: [
      {
        heading: "Return Eligibility",
        bullets: [
          "The product was damaged during transit",
          "The product received is defective",
          "The wrong item was delivered",
          "The product materially differs from the order placed",
          "The request is submitted within 7 calendar days from delivery",
        ],
      },
      {
        heading: "Damaged, Defective, or Incorrect Products",
        body: [
          "Customers must notify Luxeholic within 48 hours of delivery and may be required to provide order number, product details, product photographs, packaging photographs, and an unboxing video where requested.",
        ],
      },
      {
        heading: "Non-Returnable Items",
        bullets: [
          "Final sale, clearance, or promotional sale items",
          "Customized or personalized products",
          "Gift cards and store credits",
          "Products without original tags, packaging, authenticity cards, dust bags, manuals, certificates, or accessories",
          "Products showing signs of wear, use, washing, alteration, or damage after delivery",
        ],
      },
      {
        heading: "Return Shipping & Refunds",
        body: [
          "Customers may be responsible for return shipping costs when the wrong size was selected, the customer changes their mind, or the item is no longer wanted.",
          "Luxeholic may arrange return shipping or reimburse reasonable costs where the item was damaged, defective, incorrect, or the error was caused by Luxeholic.",
          "Approved refunds are generally initiated within 5-10 business days to the original payment method, subject to payment provider and banking timelines.",
        ],
      },
      {
        heading: "International Orders",
        body: [
          "Luxeholic currently serves India, Australia, and New Zealand. International returns may require additional processing due to customs procedures, import regulations, and cross-border logistics requirements.",
        ],
      },
    ],
  },
  {
    slug: "faqs",
    title: "FAQs",
    kicker: "Customer Questions",
    summary:
      "Answers to common questions about authenticity, countries served, payment, shipping, returns, refunds, gifting, and account deletion.",
    image: shoesImage,
    sections: [
      {
        heading: "Products & Authenticity",
        body: [
          "All products on Luxeholic are sourced through trusted suppliers, authorized distributors, boutiques, and verified sourcing channels. Products undergo quality verification before being made available for purchase.",
          "Product color may vary slightly due to device display settings, screen brightness, photography lighting, or manufacturer updates.",
        ],
      },
      {
        heading: "Countries & Shipping",
        body: [
          "Luxeholic currently serves India, Australia, and New Zealand. Delivery availability may vary by product category, shipping restrictions, and serviceable locations.",
          "Estimated delivery dates are displayed during checkout and included in order confirmation communications.",
        ],
      },
      {
        heading: "Payments & Taxes",
        body: [
          "Supported methods include credit cards, debit cards, UPI, net banking, digital wallets, and other approved methods available during checkout.",
          "Customs duties, GST, VAT, import taxes, and government-imposed charges may vary by destination and may be the responsibility of the customer unless otherwise stated during checkout.",
        ],
      },
      {
        heading: "Orders, Returns & Refunds",
        body: [
          "Orders may be cancelled before they are processed or dispatched. Once an order enters the shipping process, cancellation requests may not be accepted.",
          "Approved refunds are processed according to the Return & Refund Policy, with actual credit timelines varying by payment provider, banking institution, and country-specific requirements.",
        ],
      },
      {
        heading: "Accounts & Support",
        body: [
          "Creating an account lets customers track orders, save addresses, manage wishlists, access order history, and enjoy faster checkout.",
          "Users may request account deletion by contacting customer support. Certain information may be retained where required by law, fraud-prevention obligations, or regulatory requirements.",
        ],
      },
    ],
  },
  {
    slug: "terms-conditions",
    title: "Terms & Conditions",
    kicker: "Legal Terms",
    summary:
      "These terms govern access, browsing, registration, purchases, payments, shipping, returns, intellectual property, and platform use.",
    image: heroImage,
    sections: [
      {
        heading: "Acceptance & Eligibility",
        body: [
          "By accessing, browsing, registering, or purchasing through Luxeholic, you agree to the Terms & Conditions, Privacy Policy, Return & Refund Policy, Shipping Policy, and other policies published on the website.",
          "Users must be legally capable of entering binding contracts, provide accurate information, and comply with applicable laws and regulations.",
        ],
      },
      {
        heading: "Products, Orders & Payments",
        body: [
          "Luxeholic offers premium fashion products, accessories, footwear, apparel, and related merchandise sourced through authorized suppliers, boutiques, distributors, and business partners.",
          "Orders are subject to product availability, payment authorization, fraud verification, pricing validation, and compliance checks.",
          "Payments may be processed through authorized payment providers, and applicable taxes, shipping charges, duties, and service fees may be charged separately.",
        ],
      },
      {
        heading: "Shipping, Returns & Refunds",
        body: [
          "Estimated delivery timelines are provided for convenience and may vary due to customs clearance, transportation disruptions, government restrictions, weather, or operational delays.",
          "Returns, refunds, exchanges, and cancellations are governed by Luxeholic's Return & Refund Policy.",
        ],
      },
      {
        heading: "Intellectual Property & Prohibited Use",
        body: [
          "All logos, trademarks, product descriptions, images, graphics, videos, software, and website design are owned by or licensed to Luxeholic.",
          "Users may not engage in fraudulent transactions, upload malicious software, attempt unauthorized access, scrape website data, interfere with website operations, or violate intellectual property rights.",
        ],
      },
      {
        heading: "Law, Liability & Updates",
        body: [
          "These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of competent courts located in India.",
          "Luxeholic may update these Terms at any time, and continued use after changes constitutes acceptance of the revised Terms.",
        ],
      },
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    kicker: "Data & Privacy",
    summary:
      "Luxeholic explains how it collects, uses, stores, processes, discloses, and protects customer information across its website and services.",
    image: atelierImage,
    sections: [
      {
        heading: "Information We Collect",
        body: [
          "We may collect personal information including name, email address, mobile number, billing address, shipping address, account credentials, purchase history, product preferences, communication records, and information voluntarily provided.",
          "We may also collect technical information such as IP address, browser type, device information, operating system, referral URLs, and website interaction data.",
        ],
      },
      {
        heading: "Profiling, Usage & Logs",
        body: [
          "Luxeholic may analyze browsing behavior, wishlist activity, purchase history, search preferences, and engagement with products and promotions to personalize shopping and improve discovery.",
          "Server logs may include IP address, browser type, operating system, language preferences, access time, referring pages, device identifiers, and system activity.",
        ],
      },
      {
        heading: "Payments, Cookies & Communications",
        body: [
          "Sensitive payment information is processed by authorized payment providers and is not stored on Luxeholic servers.",
          "Cookies, web beacons, tracking pixels, and similar technologies help us remember preferences, maintain sessions, analyze traffic, measure marketing performance, and personalize content.",
          "Users may opt out of marketing communications through unsubscribe links or by contacting customer support.",
        ],
      },
      {
        heading: "Data Sharing, Security & Retention",
        body: [
          "Personal information may be shared with payment processors, logistics providers, technology vendors, analytics providers, fraud prevention partners, customer support providers, and professional advisors where necessary to operate the business.",
          "Luxeholic does not sell personal information to third parties.",
          "Information is retained only as long as necessary to provide services, comply with legal obligations, resolve disputes, prevent fraud, and maintain business records.",
        ],
      },
      {
        heading: "User Rights & Account Deletion",
        body: [
          "Subject to applicable laws, users may request access, correction, updates, deletion of eligible information, restriction of certain processing, or withdrawal of consent.",
          "Users may request account deletion through official support channels. Certain information may be retained for law, taxation, dispute resolution, fraud prevention, or legitimate business purposes.",
        ],
      },
    ],
  },
  {
    slug: "order-tracking",
    title: "Order Tracking",
    kicker: "Track Your Order",
    summary:
      "Use your Luxeholic account or order reference details to follow dispatch status, carrier assignment, transit milestones, and estimated delivery.",
    image: bagImage,
    sections: [
      {
        heading: "Tracking Options",
        bullets: [
          "My Account dashboard on luxeholic.com",
          "Track Your Order link in the website footer",
          "Guest tracking using order ID and registered email",
          "Email or SMS tracking updates after dispatch",
        ],
      },
      {
        heading: "What You Can See",
        bullets: [
          "Dispatch status",
          "Carrier assignment",
          "Transit milestones",
          "Estimated delivery date",
          "Logistics exceptions where applicable",
        ],
      },
      {
        heading: "Tracking Delays",
        body: [
          "Tracking links may take time to become active after dispatch. International orders may also pause during customs clearance, air freight movement, or regional courier handoff.",
        ],
      },
    ],
  },
  {
    slug: "size-guide",
    title: "Size Guide",
    kicker: "Fit & Measurements",
    summary:
      "Use product measurements, brand sizing notes, and category-specific fit guidance before placing your Luxeholic order.",
    image: shoesImage,
    sections: [
      {
        heading: "Before You Buy",
        body: [
          "Luxury sizing may vary by designer, product category, construction, region, and seasonal fit updates. Review product-specific measurements wherever provided.",
        ],
      },
      {
        heading: "Footwear",
        bullets: [
          "Compare EU, UK, US, and local sizing before checkout",
          "Consider heel height, toe shape, and material stretch",
          "For narrow or wide feet, review product notes carefully",
        ],
      },
      {
        heading: "Apparel & Accessories",
        bullets: [
          "Check bust, waist, hip, shoulder, and length measurements for apparel",
          "For handbags, review dimensions, strap drop, handle drop, and capacity",
          "For belts and small accessories, confirm exact measurements before ordering",
        ],
      },
    ],
  },
  {
    slug: "cookie-settings",
    title: "Cookie Settings",
    kicker: "Privacy Controls",
    summary:
      "Learn how Luxeholic uses cookies and similar technologies to improve functionality, analytics, personalization, and marketing performance.",
    image: heroImage,
    sections: [
      {
        heading: "How Cookies Help",
        body: [
          "Cookies help remember user preferences, maintain login sessions, understand visitor behavior, analyze website traffic, measure marketing performance, and personalize content.",
        ],
      },
      {
        heading: "Managing Preferences",
        body: [
          "Users may manage cookie preferences through browser settings. Disabling cookies may affect certain website features, including saved preferences, account sessions, product recommendations, or checkout continuity.",
        ],
      },
      {
        heading: "Related Privacy Information",
        body: [
          "For more detail about data collection, tracking technologies, user rights, and account deletion, review Luxeholic's Privacy Policy.",
        ],
      },
    ],
  },
];

export const serviceNav = [
  { label: "About Luxeholic", href: "/#world" },
  { label: "Contact Us", href: "/customer-service/contact-us" },
  { label: "Careers", href: "/customer-service/careers" },
  { label: "Terms & Conditions", href: "/customer-service/terms-conditions" },
  { label: "FAQs", href: "/customer-service/faqs" },
  { label: "Shipping Information", href: "/customer-service/shipping-information" },
  { label: "Payment Method", href: "/customer-service/payment-methods" },
  { label: "Privacy Policy", href: "/customer-service/privacy-policy" },
  { label: "Return & Exchange", href: "/customer-service/return-exchange" },
  { label: "Testimonials", href: "/#testimonials" },
];

const originalDocumentSlugs = new Set([
  "shipping-information",
  "payment-methods",
  "return-exchange",
  "faqs",
  "terms-conditions",
  "privacy-policy",
]);

export function getServicePage(slug: string) {
  const page = servicePages.find((item) => item.slug === slug);
  if (!page) {
    return undefined;
  }
  if (originalDocumentSlugs.has(slug)) {
    const { sections: _sections, ...documentPage } = page;
    return { ...documentPage, documentText: getPolicyDocument(slug) };
  }
  return page;
}
