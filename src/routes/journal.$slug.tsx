import { createFileRoute, notFound } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fetchPostBySlug } from "@/services/blog-api";

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPostBySlug(params.slug);
    if (!post) {
      throw notFound();
    }
    return post;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      meta: [
        { title: `${loaderData.title} | Luxeholic Journal` },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:image", content: loaderData.coverImage },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: JournalPostPage,
});

function JournalPostPage() {
  const post = Route.useLoaderData();
  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <SiteHeader />

      <article className="bg-ivory pb-24">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone md:aspect-[21/9]">
          <img src={post.coverImage} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
        </div>

        <div className="mx-auto max-w-3xl px-6 pt-14 md:px-0">
          <p className="eyebrow">{post.tag}</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">{post.title}</h1>
          <p className="mt-5 text-xs uppercase tracking-[0.3em] text-noir/50">
            {post.author} · {date}
          </p>
          <div className="mt-10 space-y-6 text-base md:text-lg font-light leading-relaxed text-noir/80">
            {post.body
              .split(/\n{2,}/)
              .filter((paragraph) => paragraph.trim().length > 0)
              .map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
          </div>
          <a
            href="/journal"
            className="mt-14 inline-block text-xs uppercase tracking-[0.3em] hover:text-gold transition"
          >
            ← Back to The Journal
          </a>
        </div>
      </article>

      <SiteFooter />
    </>
  );
}
