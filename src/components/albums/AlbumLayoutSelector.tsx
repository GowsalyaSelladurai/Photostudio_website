"use client";

import { albumLayouts } from "@/config/album-layouts.config";
import type { AlbumLayoutType } from "@/types/album";

type AlbumLayoutSelectorProps = {
  selectedLayout: AlbumLayoutType;
  photoCount: number;
  onLayoutChange: (layout: AlbumLayoutType) => void;
};

export function AlbumLayoutSelector({
  selectedLayout,
  photoCount,
  onLayoutChange,
}: AlbumLayoutSelectorProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div className="mb-5">
        <h3 className="font-serif text-xl text-[var(--color-ink)]">
          Page layout
        </h3>

        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Choose how your photographs appear on this page.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {albumLayouts.map((layout) => {
          const selected = selectedLayout === layout.id;
          const disabled = photoCount > layout.photoLimit;

          return (
            <button
              key={layout.id}
              type="button"
              onClick={() => onLayoutChange(layout.id)}
              disabled={disabled}
              aria-pressed={selected}
              className={`rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-[var(--studio-champagne-gold)] bg-[var(--studio-warm-beige)]"
                  : "border-[var(--color-line)] hover:border-[var(--studio-champagne-gold)]"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <div className="mb-3 flex aspect-[4/3] items-center justify-center rounded-lg bg-[var(--studio-ivory-white)] p-3">
                <LayoutIcon layout={layout.id} />
              </div>

              <p className="text-xs font-semibold text-[var(--color-ink)]">
                {layout.name}
              </p>

              <p className="mt-1 text-[10px] leading-4 text-[var(--color-muted)]">
                {layout.description}
              </p>

              {disabled && (
                <p className="mt-2 text-[10px] font-medium text-red-600">
                  Too many photos
                </p>
              )}

              {selected && (
                <p className="mt-2 text-[10px] font-semibold text-[var(--studio-deep-charcoal)]">
                  Selected
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function LayoutIcon({ layout }: { layout: AlbumLayoutType }) {
  const photoStyle = "rounded-sm bg-[var(--studio-champagne-gold)]";

  switch (layout) {
    case "single":
    case "full-bleed":
      return (
        <div className={`h-full w-2/3 ${photoStyle}`} />
      );

    case "two-photo":
      return (
        <div className="grid h-full w-full grid-cols-2 gap-1">
          <div className={photoStyle} />
          <div className={photoStyle} />
        </div>
      );

    case "three-photo":
      return (
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1">
          <div className={`row-span-2 ${photoStyle}`} />
          <div className={photoStyle} />
          <div className={photoStyle} />
        </div>
      );

    case "four-grid":
      return (
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={photoStyle} />
          ))}
        </div>
      );

    case "collage":
      return (
        <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-1">
          <div className={`col-span-2 row-span-2 ${photoStyle}`} />
          <div className={photoStyle} />
          <div className={photoStyle} />
        </div>
      );
  }
}