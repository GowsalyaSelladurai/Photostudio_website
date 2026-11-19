
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { studioConfig } from "@/config/studio.config";

export function HeroCarousel() {
  const slides = studioConfig.hero.slides;
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = slides[activeIndex];

  useEffect(() => {
    if (slides.length < 2) return;

    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [slides.length]);

  function showSlide(direction: -1 | 1) {
    setActiveIndex(
      (index) => (index + direction + slides.length) % slides.length
    );
  }

  return (
    <section
      aria-label="Featured photography"
      aria-roledescription="carousel"
      className="relative isolate min-h-[620px] overflow-hidden bg-[var(--color-ink)] sm:min-h-[690px]"
    >
      <Image
        src={slide.image}
        alt={slide.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover transition-opacity duration-1000"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/5" />

      <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-center px-5 py-20 text-white sm:min-h-[690px] sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/75">
            {slide.eyebrow}
          </p>

          <h1
            aria-live="polite"
            className="mt-6 whitespace-pre-line font-serif text-6xl leading-[0.98] tracking-tight sm:text-7xl lg:text-8xl"
          >
            {slide.title}
          </h1>

          <p className="mt-7 max-w-lg text-base leading-7 text-white/80 sm:text-lg">
            {studioConfig.description}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/booking"
              className="rounded-full bg-[var(--studio-champagne-gold)] px-6 py-3.5 text-sm font-semibold text-[var(--studio-midnight-black)] transition-colors hover:bg-[var(--studio-warm-beige)]"
            >
              {studioConfig.hero.bookingLinkLabel}
            </Link>

            <Link
              href="/gallery"
              className="rounded-full border border-[var(--studio-champagne-gold)] px-6 py-3.5 text-sm font-semibold text-[var(--studio-ivory-white)] transition-colors hover:bg-[var(--studio-champagne-gold)] hover:text-[var(--studio-midnight-black)]"
            >
              {studioConfig.hero.galleryLinkLabel}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 right-5 flex items-center gap-3 sm:right-8">
          <span className="mr-2 text-xs tracking-[0.15em] text-white/70">
            0{activeIndex + 1} / 0{slides.length}
          </span>

          <button
            type="button"
            onClick={() => showSlide(-1)}
            aria-label="Previous featured image"
            className="h-11 w-11 rounded-full border border-[var(--studio-champagne-gold)] text-lg transition-colors hover:bg-[var(--studio-champagne-gold)] hover:text-[var(--studio-midnight-black)]"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => showSlide(1)}
            aria-label="Next featured image"
            className="h-11 w-11 rounded-full border border-[var(--studio-champagne-gold)] text-lg transition-colors hover:bg-[var(--studio-champagne-gold)] hover:text-[var(--studio-midnight-black)]"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
