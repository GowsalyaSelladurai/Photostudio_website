"use client";

import Image from "next/image";
import { useState } from "react";
import { filmContent } from "@/config/film.config";

const banners = filmContent.banners;

type FilmBannerCarouselProps = {
  /** Optional: lets a parent follow (and drive) the selected banner/category. */
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
};

export function FilmBannerCarousel({
  activeIndex: controlledIndex,
  onActiveChange,
}: FilmBannerCarouselProps = {}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const activeIndex = controlledIndex ?? internalIndex;

  function showBanner(index: number) {
    const next = (index + banners.length) % banners.length;
    setPlayingId(null);
    setInternalIndex(next);
    onActiveChange?.(next);
  }

  return (
    <section
      aria-label="Featured film banners"
      aria-roledescription="carousel"
      className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8"
    >
      <div className="isolate flex h-[260px] flex-col overflow-hidden rounded-2xl bg-[var(--color-ink)] text-white shadow-xl shadow-black/15 ring-1 ring-black/10 sm:h-[360px] sm:rounded-3xl lg:h-[440px]">
        <div className="relative isolate min-h-0 flex-1 overflow-hidden">
          {banners.map((banner, index) => {
            const active = index === activeIndex;
            const playing = active && playingId === banner.id;

            return (
              <div
                key={banner.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${banners.length}: ${banner.tabLabel}`}
                aria-hidden={!active}
                inert={!active}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  active ? "z-10 opacity-100" : "z-0 opacity-0"
                }`}
              >
                <Image
                  src={banner.poster}
                  alt={banner.posterAlt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />

                <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-5 py-3 sm:px-8 sm:py-6">
                  <div className="max-w-3xl">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/75 sm:text-xs">
                      {banner.eyebrow}
                    </p>
                    {index === 0 ? (
                      <h1 className="mt-2 whitespace-pre-line font-serif text-2xl leading-[1] tracking-tight sm:mt-4 sm:text-4xl lg:text-5xl">
                        {banner.title}
                      </h1>
                    ) : (
                      <p className="mt-2 whitespace-pre-line font-serif text-2xl leading-[1] tracking-tight sm:mt-4 sm:text-4xl lg:text-5xl">
                        {banner.title}
                      </p>
                    )}
                    <p className="mt-2 max-w-lg text-xs leading-5 text-white/80 sm:mt-4 sm:text-base sm:leading-7 lg:text-lg">
                      {banner.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 sm:mt-6">
                      <button
                        type="button"
                        onClick={() => setPlayingId(banner.id)}
                        aria-label={`Play video: ${banner.tabLabel}`}
                        className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[var(--studio-champagne-gold)] px-5 text-sm sm:min-h-12 sm:px-6 font-semibold text-[var(--studio-midnight-black)] transition-colors hover:bg-[var(--studio-warm-beige)]"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="currentColor"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Play film
                      </button>
                    </div>
                  </div>
                </div>

                {playing ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
                    <video
                      src={banner.videoSrc}
                      poster={banner.poster}
                      aria-label={`${banner.tabLabel} video`}
                      controls
                      autoPlay
                      playsInline
                      className="h-full w-full bg-black object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setPlayingId(null)}
                      aria-label="Close video and return to banner"
                      className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--studio-champagne-gold)] bg-black/60 text-white transition-colors hover:bg-[var(--studio-champagne-gold)] hover:text-[var(--studio-midnight-black)] sm:right-8"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="m6 6 12 12M18 6 6 18" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="shrink-0 border-t border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-1.5 sm:px-8 sm:py-3 sm:pr-24">
            <ul
              aria-label="Choose a banner"
              className="flex min-w-0 gap-2 overflow-x-auto py-1"
            >
              {banners.map((banner, index) => {
                const active = index === activeIndex;
                return (
                  <li key={banner.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => showBanner(index)}
                      aria-current={active ? "true" : undefined}
                      className={`min-h-9 rounded-full border px-4 sm:min-h-11 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                        active
                          ? "border-[var(--studio-champagne-gold)] bg-[var(--studio-champagne-gold)] text-[var(--studio-midnight-black)]"
                          : "border-white/40 bg-black/30 text-white/85 hover:border-[var(--studio-champagne-gold)] hover:text-white"
                      }`}
                    >
                      {banner.tabLabel}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex shrink-0 items-center gap-3">
              <span
                aria-live="polite"
                className="mr-1 hidden text-xs tracking-[0.15em] text-white/70 sm:inline"
              >
                0{activeIndex + 1} / 0{banners.length}
              </span>
              <button
                type="button"
                onClick={() => showBanner(activeIndex - 1)}
                aria-label="Previous banner"
                className="h-9 w-9 rounded-full border border-[var(--studio-champagne-gold)] bg-black/30 text-lg sm:h-11 sm:w-11 transition-colors hover:bg-[var(--studio-champagne-gold)] hover:text-[var(--studio-midnight-black)]"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => showBanner(activeIndex + 1)}
                aria-label="Next banner"
                className="h-9 w-9 rounded-full border border-[var(--studio-champagne-gold)] bg-black/30 text-lg sm:h-11 sm:w-11 transition-colors hover:bg-[var(--studio-champagne-gold)] hover:text-[var(--studio-midnight-black)]"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}