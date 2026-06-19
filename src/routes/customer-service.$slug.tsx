import { createFileRoute, notFound } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getServicePage } from "@/lib/customer-service";
import { ServiceSidebar } from "./customer-service";

export const Route = createFileRoute("/customer-service/$slug")({
  loader: ({ params }) => {
    const page = getServicePage(params.slug);
    if (!page) {
      throw notFound();
    }
    return page;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      meta: [
        { title: `${loaderData.title} | Luxeholic Customer Service` },
        { name: "description", content: loaderData.summary },
        { property: "og:title", content: `${loaderData.title} | Luxeholic` },
        { property: "og:description", content: loaderData.summary },
        { property: "og:type", content: "article" },
        { property: "og:image", content: loaderData.image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "pinterest-rich-pin", content: "true" },
      ],
    };
  },
  component: CustomerServicePage,
});

function CustomerServicePage() {
  const page = Route.useLoaderData();
  const documentText = page.documentText;
  const documentLines = documentText?.split("\n") ?? [];
  const documentTitle = documentLines[0] ?? page.title;
  const documentBody = documentLines.slice(1).join("\n").trim();
  const faqItems = page.slug === "faqs" && documentText ? parseFaqItems(documentText) : [];

  return (
    <div className="min-h-screen bg-ivory text-noir">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-6 py-14 md:grid-cols-[260px_1fr] md:px-10">
        <ServiceSidebar activeHref={`/customer-service/${page.slug}`} />
        <article>
          <img
            src={page.image}
            alt={page.title}
            className="h-[42vh] min-h-80 w-full object-cover"
          />
          <div className="mt-12 border border-border bg-card p-8 md:p-12">
            <div className="flex flex-col gap-6 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">{page.kicker}</p>
                <h1 className="mt-4 font-serif text-5xl md:text-7xl">
                  {documentText ? documentTitle : page.title}
                </h1>
              </div>
              {!documentText && (
                <p className="max-w-xl text-sm leading-relaxed text-noir/60 md:text-base">
                  {page.summary}
                </p>
              )}
            </div>
            {faqItems.length > 0 ? (
              <Accordion type="single" collapsible className="mt-10 border-t border-border">
                {faqItems.map((item, index) => (
                  <AccordionItem key={item.question} value={`faq-${index}`}>
                    <AccordionTrigger className="py-6 font-serif text-2xl font-light leading-snug no-underline hover:text-gold hover:no-underline md:text-3xl">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="whitespace-pre-wrap pb-8 text-sm leading-7 text-noir/70 md:text-base">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : documentText ? (
              <pre className="mt-10 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-noir/75 md:text-base">
                {documentBody}
              </pre>
            ) : (
              <div className="divide-y divide-border">
                {(page.sections ?? []).map((section) => (
                  <section
                    key={section.heading}
                    className="grid gap-6 py-10 md:grid-cols-[280px_1fr]"
                  >
                    <h2 className="font-serif text-3xl">{section.heading}</h2>
                    <div className="space-y-4 text-sm leading-7 text-noir/68 md:text-base">
                      {section.body?.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {section.bullets && (
                        <ul className="space-y-3">
                          {section.bullets.map((bullet) => (
                            <li key={bullet} className="flex gap-3">
                              <span className="mt-3 h-px w-6 shrink-0 bg-gold" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            )}
            <div className="mt-8 bg-ivory p-6 text-sm leading-relaxed text-noir/65">
              Need more help? Contact Luxeholic Customer Support with your order number, registered
              email, and product details for faster assistance.
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

function parseFaqItems(documentText: string) {
  const body = documentText.split("\n").slice(1).join("\n").trim();
  const matches = [
    ...body.matchAll(/(?:^|\n)(\d+)\.\s+([^\n?]+\?)([\s\S]*?)(?=\n\d+\.\s+[^\n?]+\?|$)/g),
  ];

  return matches.map((match) => ({
    question: `${match[1]}. ${match[2].trim()}`,
    answer: match[3].trim(),
  }));
}
