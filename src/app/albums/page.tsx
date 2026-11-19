import type { Metadata } from "next";
import { PricingConfigurator } from "@/components/pricing/pricing-configurator";
import { SectionHeading } from "@/components/ui/section-heading";

import { AlbumProjectCreator } from "@/components/albums/AlbumProjectCreator";
import { AlbumHeroVideoSlideshow } from "@/components/albums/AlbumHeroVideoSlideshow";

export const metadata: Metadata = {
  title: "Create Your Album",
  description:
    "Create a personalised photo album with premium sizes, beautiful finishes and custom layouts.",
};

export default function AlbumsPage() {
  return (
    <>
      {/* Album introduction */}
      <section className="relative overflow-hidden border-b border-[var(--color-line)] bg-[var(--studio-ivory-white)]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2">
          <div className="max-w-xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--studio-champagne-gold)]">
              Designed around your memories
            </p>

            <h1 className="font-serif text-4xl leading-tight text-[var(--studio-deep-charcoal)] sm:text-5xl lg:text-6xl">
              Your memories deserve more than a screen.
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-[var(--studio-deep-charcoal)]/75 sm:text-base">
              Turn your favourite photographs into a beautifully designed album.
              Choose your style, arrange your memories and create a book worth
              keeping.
            </p>

            <div className="mt-9">
              <a
                href="#album-pricing"
                className="inline-flex items-center rounded-full bg-[var(--studio-midnight-black)] px-7 py-3.5 text-sm font-semibold text-[var(--studio-ivory-white)] transition-transform hover:-translate-y-1 hover:bg-[var(--studio-deep-charcoal)] shadow-lg"
              >
                Configure your album
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-full bg-[var(--studio-champagne-gold)]/15 blur-3xl" />

            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white/70 p-3 shadow-xl">
              <AlbumHeroVideoSlideshow />
            </div>
          </div>
        </div>
      </section>

      {/* Album pricing */}
      <section
        id="album-pricing"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mb-10">
          <SectionHeading
            eyebrow="Create something timeless"
            title="Configure your album."
            description="Choose the album size, number of pages and cover finish to calculate your estimated price."
          />

          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Prices are illustrative INR demo estimates and are subject to
            confirmation.
          </p>
        </div>

        <AlbumProjectCreator />
      </section>

      {/* Album creation introduction */}
      <section className="border-t border-[var(--color-line)] bg-[var(--studio-ivory-white)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
              Your creative space
            </p>

            <h2 className="mt-4 font-serif text-3xl text-[var(--color-ink)] sm:text-4xl">
              Every page tells your story.
            </h2>

            <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
              Choose from professionally designed templates or build your own
              layouts. Add photographs, arrange pages and preview your album as
              a realistic three-dimensional book.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
