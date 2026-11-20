
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { destinations } from "@/data/journeys";

export function JourneysSection() {
  const [selectedSlug, setSelectedSlug] = useState(
    destinations[0]?.slug ?? ""
  );

  const selectedDestination = destinations.find(
    (destination) => destination.slug === selectedSlug
  );

  if (!selectedDestination) return null;

  const galleryImages = selectedDestination.gallery;

  return (
    <section
      id="journeys"
      aria-labelledby="journeys-heading"
      className="scroll-mt-24 overflow-hidden bg-[var(--color-paper)] px-4 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-12 max-w-3xl lg:mb-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--studio-champagne-gold)]">
            Our Photography Stories
          </p>

          <h2
            id="journeys-heading"
            className="font-serif text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl lg:text-6xl"
          >
            Moments captured.
            <span className="block italic text-[var(--studio-champagne-gold)]">
              Memories preserved.
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
            From beautiful weddings to unforgettable celebrations,
            explore the special moments we capture across Salem and
            nearby districts.
          </p>
        </div>

        {/* Location and Gallery */}
        <div className="grid gap-10 lg:grid-cols-[0.75fr_2fr] lg:gap-16">
          {/* Location List */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Explore Locations
              </p>

              <span className="text-xs text-[var(--color-muted)]">
                {String(destinations.length).padStart(2, "0")} Places
              </span>
            </div>

            <div className="border-y border-[var(--color-line)]">
              {destinations.map((destination, index) => {
                const isActive = selectedSlug === destination.slug;

                return (
                  <button
                    key={destination.slug}
                    type="button"
                    onClick={() => setSelectedSlug(destination.slug)}
                    aria-pressed={isActive}
                    className={`group flex w-full items-center justify-between border-b border-[var(--color-line)] py-4 text-left transition-all duration-300 last:border-b-0 ${
                      isActive
                        ? "pl-3 text-[var(--studio-champagne-gold)]"
                        : "text-[var(--color-ink)] hover:pl-3 hover:text-[var(--studio-champagne-gold)]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[10px] text-[var(--color-muted)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span
                        className={`font-serif text-xl sm:text-2xl ${
                          isActive ? "italic" : ""
                        }`}
                      >
                        {destination.name}
                      </span>
                    </span>

                    <span
                      className={`text-lg transition-transform duration-300 ${
                        isActive
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      }`}
                    >
                      →
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-6 text-xs leading-6 text-[var(--color-muted)]">
              Select a location to explore our wedding and event
              photography collections.
            </p>
          </aside>

          {/* Selected Location Gallery */}
          <div className="min-w-0">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--studio-champagne-gold)]">
                  Currently Exploring
                </p>

                <h3
                  key={selectedDestination.slug}
                  className="font-serif text-3xl text-[var(--color-ink)] sm:text-4xl"
                >
                  {selectedDestination.name}
                </h3>

                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {selectedDestination.location}
                </p>
              </div>

              <Link
                href={`/journeys/${selectedDestination.slug}`}
                className="inline-flex w-fit items-center gap-2 border-b border-[var(--studio-champagne-gold)] pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)] transition-colors hover:text-[var(--studio-champagne-gold)]"
              >
                View Full Collection
                <span>↗</span>
              </Link>
            </div>

            {/* Photo Grid */}
            <div
              key={selectedDestination.slug}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              {galleryImages.slice(0, 5).map((image, index) => (
                <Link
                  key={image}
                  href={`/journeys/${selectedDestination.slug}`}
                  className={`group relative block overflow-hidden bg-black/5 ${
                    index === 0
                      ? "col-span-2 aspect-[16/9] sm:col-span-1 sm:row-span-2 sm:aspect-[4/5]"
                      : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${selectedDestination.name} event photography ${index + 1}`}
                    fill
                    sizes={
                      index === 0
                        ? "(max-width: 640px) 100vw, 50vw"
                        : "(max-width: 640px) 50vw, 25vw"
                    }
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-100" />

                  {index === 0 && (
                    <span className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-[0.18em] text-white sm:bottom-6 sm:left-6">
                      {selectedDestination.name} Stories
                    </span>
                  )}

                  <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-black/20 text-sm text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
                    ↗
                  </span>
                </Link>
              ))}
            </div>

            {/* Description */}
            <div className="mt-7 flex flex-col gap-4 border-t border-[var(--color-line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-lg text-sm leading-7 text-[var(--color-muted)]">
                {selectedDestination.shortDescription}
              </p>

              <Link
                href={`/journeys/${selectedDestination.slug}`}
                className="inline-flex shrink-0 items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--studio-champagne-gold)] transition-all hover:gap-5"
              >
                Explore Collection
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}