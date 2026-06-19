import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fetchPublishedPosts } from "@/services/blog-api";

export const Route = createFileRoute("/journal")({
  loader: () => fetchPublishedPosts(),
  component: JournalIndexPage,
  head: () => ({
    meta: [
      { title: "The Journal | Luxeholic" },
      {
        name: "description",
        content:
          "Style guides, trend reports, and care notes from Luxeholic — stories for those who collect, not just shop.",
      },
      { property: "og:title", content: "The Journal | Luxeholic" },
      { property: "og:type", content: "website" },
    ],
  }),
});

function JournalIndexPage() {
  const posts = Route.useLoaderData();

  return (
    <>
      <SiteHeader />

      <section className="bg-ivory py-20 md:py-28">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <p className="eyebrow">The Journal</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <h1 className="font-serif text-5xl md:text-7xl">Stories Worth Keeping</h1>
            <a
              href="/journal/our-story"
              className="text-xs uppercase tracking-[0.3em] hover:text-gold transition"
            >
              Our Story →
            </a>
          </div>
        </div>
      </section>

      <section className="bg-ivory pb-24 md:pb-36">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          {posts.length === 0 ? (
            <p className="text-noir/60">New stories are on their way — check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to="/journal/$slug"
                  params={{ slug: post.slug }}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      loading="lazy"
                      className="hover-zoom-img absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute top-5 left-5 bg-ivory/90 backdrop-blur px-3 py-1.5 text-[10px] tracking-[0.3em] uppercase text-noir">
                      {post.tag}
                    </div>
                  </div>
                  <h3 className="mt-6 font-serif text-2xl md:text-3xl group-hover:text-gold transition leading-snug text-balance">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-noir/60">
                    {post.excerpt}
                  </p>
                  <span className="mt-4 inline-block text-[11px] tracking-[0.3em] uppercase border-b border-noir pb-0.5 group-hover:border-gold group-hover:text-gold transition">
                    Read Story
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
