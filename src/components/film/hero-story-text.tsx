import Link from "next/link";
import { heroBanner } from "@/config/film.config";

/** "We love telling your story" text, shown between the two top banners. */
export function HeroStoryText() {
  return (
    <section
      aria-labelledby="film-story-title"
      className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-clay)]">
        {heroBanner.eyebrow}
      </p>
      <h2
        id="film-story-title"
        className="mt-4 whitespace-pre-line font-serif text-4xl leading-[1.05] tracking-tight text-[var(--color-ink)] sm:text-5xl lg:text-6xl"
      >
        {heroBanner.title}
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
        {heroBanner.description}
      </p>
      <Link
        href="/booking"
        className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[var(--studio-champagne-gold)] px-6 text-sm font-semibold text-[var(--studio-midnight-black)] transition-colors hover:bg-[var(--studio-warm-beige)]"
      >
        {heroBanner.ctaLabel}
      </Link>
    </section>
  );
}
