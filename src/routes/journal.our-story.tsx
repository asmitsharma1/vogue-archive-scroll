import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";
import atelier from "@/assets/atelier.jpg";
import catBags from "@/assets/cat-bags.jpg";
import edit1 from "@/assets/edit-1.jpg";
import edit2 from "@/assets/edit-2.jpg";

export const Route = createFileRoute("/journal/our-story")({
  component: JournalPage,
  head: () => ({
    meta: [
      { title: "Our Story | Luxeholic Journal" },
      {
        name: "description",
        content:
          "Style guides, trend reports, and care notes from Luxeholic — stories for those who collect, not just shop.",
      },
      { property: "og:title", content: "Our Story | Luxeholic Journal" },
      { property: "og:type", content: "article" },
    ],
  }),
});

function cover(image: string, tint: string) {
  return {
    backgroundImage: `linear-gradient(${tint}), url(${image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

function JournalPage() {
  return (
    <>
      <SiteHeader />

      <FlowArt aria-label="Luxeholic Journal">
        <FlowSection
          aria-label="The Journal"
          style={{ backgroundColor: "var(--ivory)", color: "var(--noir)" }}
        >
          <p className="eyebrow">01 — The Journal</p>
          <hr className="my-[2vw] border-none border-t border-noir/15" />
          <h1 className="font-serif text-[clamp(3rem,11vw,12rem)] font-light leading-[0.9] tracking-tight">
            Stories
            <br />
            Worth
            <br />
            <span className="italic text-gold">Keeping.</span>
          </h1>
          <hr className="my-[2vw] border-none border-t border-noir/15" />
          <p className="mt-auto max-w-[50ch] text-[clamp(1rem,2.2vw,1.6rem)] font-light leading-relaxed text-noir/70">
            Style guides, trend reports, and the quiet craft behind every piece — Luxeholic Journal
            is for those who collect, not just shop.
          </p>
        </FlowSection>

        <FlowSection
          aria-label="Style Guide"
          style={{ color: "var(--ivory)", ...cover(edit1, "rgba(17,17,17,0.55), rgba(17,17,17,0.85)") }}
        >
          <p className="eyebrow">02 — Style Guide</p>
          <hr className="my-[2vw] border-none border-t border-ivory/25" />
          <h2 className="font-serif text-[clamp(3rem,11vw,12rem)] font-light leading-[0.9] tracking-tight">
            Wear It
            <br />
            <span className="italic text-gold">Well.</span>
          </h2>
          <hr className="my-[2vw] border-none border-t border-ivory/25" />
          <p className="max-w-[50ch] text-[clamp(1rem,2.2vw,1.6rem)] font-light leading-relaxed text-ivory/75">
            How to style the Ivoire Mini for every season — from the morning commute to the
            evening you didn&apos;t plan for.
          </p>
          <hr className="my-[2vw] border-none border-t border-ivory/25" />
          <a
            href="/shop/handbags"
            className="mt-auto inline-flex items-center gap-2 self-start border border-gold/50 px-7 py-3 text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold hover:text-noir"
          >
            Shop The Ivoire Mini <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </FlowSection>

        <FlowSection
          aria-label="Trend Report"
          style={{ color: "var(--noir)", ...cover(edit2, "rgba(248,245,240,0.4), rgba(220,203,180,0.78)") }}
        >
          <p className="eyebrow">03 — Trend</p>
          <hr className="my-[2vw] border-none border-t border-noir/20" />
          <h2 className="font-serif text-[clamp(3rem,11vw,12rem)] font-light leading-[0.9] tracking-tight">
            The Return
            <br />
            Of The
            <br />
            <span className="italic text-gold">Slip Dress.</span>
          </h2>
          <hr className="my-[2vw] border-none border-t border-noir/20" />
          <div className="flex flex-wrap gap-[3vw]">
            <div className="min-w-[180px] flex-1">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider">Then</p>
              <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed text-noir/70">
                A 90s minimalist staple, born from quiet luxury before the term existed.
              </p>
            </div>
            <div className="min-w-[180px] flex-1">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider">Now</p>
              <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed text-noir/70">
                Layered over knits, paired with structured bags — the silhouette of the season.
              </p>
            </div>
            <div className="min-w-[180px] flex-1">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider">Pair With</p>
              <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed text-noir/70">
                A structured top-handle and your sharpest pair of mules.
              </p>
            </div>
          </div>
        </FlowSection>

        <FlowSection
          aria-label="Care Notes"
          style={{ color: "var(--ivory)", ...cover(catBags, "rgba(107,31,42,0.55), rgba(17,17,17,0.85)") }}
        >
          <p className="eyebrow">04 — Care</p>
          <hr className="my-[2vw] border-none border-t border-ivory/25" />
          <h2 className="font-serif text-[clamp(3rem,11vw,12rem)] font-light leading-[0.9] tracking-tight">
            A Lifetime
            <br />
            With Your
            <br />
            <span className="italic text-gold">Leather.</span>
          </h2>
          <hr className="my-[2vw] border-none border-t border-ivory/25" />
          <p className="max-w-[50ch] text-[clamp(1rem,2.2vw,1.6rem)] font-light leading-relaxed text-ivory/75">
            Every Luxeholic piece is built to outlive the season. A little care keeps it that way
            for decades, not years.
          </p>
          <hr className="my-[2vw] border-none border-t border-ivory/25" />
          <div className="flex flex-wrap gap-[3vw]">
            <div className="min-w-[180px] flex-1">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider">Condition</p>
              <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-75">
                Feed the leather every season with a colorless balm — never wax.
              </p>
            </div>
            <div className="min-w-[180px] flex-1">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider">Store</p>
              <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-75">
                Upright, stuffed, and breathing — never flat, never under weight.
              </p>
            </div>
            <div className="min-w-[180px] flex-1">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider">Repair</p>
              <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-75">
                Our ateliers restore hardware and edges for the life of the piece.
              </p>
            </div>
          </div>
        </FlowSection>

        <FlowSection
          aria-label="Read More"
          style={{ color: "var(--ivory)", ...cover(atelier, "rgba(17,17,17,0.6), rgba(17,17,17,0.92)") }}
        >
          <p className="eyebrow">05 — Continue Reading</p>
          <hr className="my-[2vw] border-none border-t border-ivory/20" />
          <h2 className="font-serif text-[clamp(3rem,11vw,12rem)] font-light leading-[0.9] tracking-tight">
            More
            <br />
            <span className="italic text-gold">Stories.</span>
          </h2>
          <hr className="my-[2vw] border-none border-t border-ivory/20" />
          <div className="mt-auto flex flex-wrap gap-4">
            <a
              href="/journal"
              className="inline-flex w-fit items-center gap-3 border border-gold/50 px-8 py-3.5 text-[11px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold hover:text-noir"
            >
              Read The Journal <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href="/shop"
              className="inline-flex w-fit items-center gap-3 border border-ivory/30 px-8 py-3.5 text-[11px] uppercase tracking-[0.3em] text-ivory/80 transition hover:border-ivory hover:text-ivory"
            >
              Shop The Collection <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </FlowSection>
      </FlowArt>

      <SiteFooter />
    </>
  );
}
