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
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  function showSlide(direction: -1 | 1) {
    setActiveIndex((index) => (index + direction + slides.length) % slides.length);
  }

  return (
    <section aria-label="Featured photography" aria-roledescription="carousel" className="px-4 pb-10 pt-6 sm:px-7 sm:pb-12 sm:pt-8 lg:px-10">
      <div className="relative isolate mx-auto min-h-[480px] max-w-[1200px] overflow-hidden rounded-[1.25rem] border border-[color-mix(in_srgb,var(--studio-champagne-gold)_28%,transparent)] bg-[var(--color-ink)] shadow-[0_24px_70px_rgba(23,23,23,0.14)] sm:min-h-[520px] lg:min-h-[580px]">
        {slides.map((item, index) => (
          <Image
            key={item.image}
            src={item.image}
            alt={item.imageAlt}
            fill
            priority={index === 0}
            sizes="(max-width: 1200px) 92vw, 1200px"
            style={{ objectPosition: item.objectPosition }}
            className={`object-cover transition-opacity duration-700 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        <div className="relative flex min-h-[480px] flex-col justify-center px-6 py-16 text-white sm:min-h-[520px] sm:px-10 lg:min-h-[580px] lg:px-14">
          <div className={`${slide.textAlignment === "right" ? "ml-auto max-w-[16rem] sm:max-w-[25rem]" : "max-w-[25rem]"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80 sm:text-xs">
              {slide.eyebrow}
            </p>
            <h1 aria-live="polite" className="mt-3 whitespace-pre-line font-serif text-4xl leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/85">
              {studioConfig.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/booking" className="inline-flex min-h-11 items-center rounded-full bg-[var(--studio-champagne-gold)] px-5 text-xs font-semibold text-[var(--studio-midnight-black)] transition-colors hover:bg-[var(--studio-warm-beige)] sm:text-sm">
                {studioConfig.hero.bookingLinkLabel}
              </Link>
              <Link href="/gallery" className="inline-flex min-h-11 items-center rounded-full border border-[var(--studio-champagne-gold)] px-5 text-xs font-semibold text-[var(--studio-ivory-white)] transition-colors hover:bg-[var(--studio-champagne-gold)] hover:text-[var(--studio-midnight-black)] sm:text-sm">
                {studioConfig.hero.galleryLinkLabel}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 sm:bottom-6 sm:right-6">
          <span aria-live="polite" className="mr-2 text-xs tracking-[0.15em] text-white/70">
            0{activeIndex + 1} / 0{slides.length}
          </span>
          <button type="button" onClick={() => showSlide(-1)} aria-label="Previous featured image" className="h-11 w-11 rounded-full border border-[var(--studio-champagne-gold)] text-lg transition-colors hover:bg-[var(--studio-champagne-gold)] hover:text-[var(--studio-midnight-black)]">←</button>
          <button type="button" onClick={() => showSlide(1)} aria-label="Next featured image" className="h-11 w-11 rounded-full border border-[var(--studio-champagne-gold)] text-lg transition-colors hover:bg-[var(--studio-champagne-gold)] hover:text-[var(--studio-midnight-black)]">→</button>
        </div>
      </div>
    </section>
  );
}
