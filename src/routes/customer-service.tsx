import { createFileRoute, Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router";

import { serviceNav } from "@/lib/customer-service";

export const Route = createFileRoute("/customer-service")({
  component: CustomerServiceIndex,
  head: () => ({
    meta: [
      { title: "Customer Service | Luxeholic" },
      {
        name: "description",
        content:
          "Luxeholic customer service hub for shipping, payment methods, returns, FAQs, terms, and privacy policy.",
      },
      { property: "og:title", content: "Customer Service | Luxeholic" },
      {
        property: "og:description",
        content:
          "Find Luxeholic customer care policies, shipping information, and support details.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function CustomerServiceIndex() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname === "/customer-service") {
    return (
      <Navigate to="/customer-service/$slug" params={{ slug: "shipping-information" }} replace />
    );
  }

  return <Outlet />;
}

export function ServiceSidebar({ activeHref }: { activeHref: string }) {
  return (
    <aside className="md:sticky md:top-28 md:self-start">
      <h2 className="text-2xl">Customer Service</h2>
      <nav className="mt-12 flex flex-row gap-5 overflow-x-auto pb-3 text-sm text-noir/45 md:flex-col md:gap-8 md:overflow-visible md:pb-0 md:text-base">
        {serviceNav.map((item) => {
          const active = item.href === activeHref;
          return item.href.startsWith("/customer-service/") ? (
            <Link
              key={item.href}
              to="/customer-service/$slug"
              params={{ slug: item.href.split("/").pop() ?? "" }}
              className={`whitespace-nowrap transition hover:text-noir ${active ? "text-noir" : ""}`}
            >
              {item.label}
            </Link>
          ) : (
            <a
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap transition hover:text-noir ${active ? "text-noir" : ""}`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
