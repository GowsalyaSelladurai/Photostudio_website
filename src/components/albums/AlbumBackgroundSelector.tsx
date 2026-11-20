"use client";

import { albumBackgrounds } from "@/config/album-backgrounds.config";

type AlbumBackgroundSelectorProps = {
  selectedBackground: string;
  onBackgroundChange: (background: string) => void;
};

export function AlbumBackgroundSelector({
  selectedBackground,
  onBackgroundChange,
}: AlbumBackgroundSelectorProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div className="mb-4">
        <h3 className="font-serif text-lg text-[var(--color-ink)]">
          Page Background
        </h3>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Choose a background color for your album page.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {albumBackgrounds.map((background) => {
          const isSelected = selectedBackground === background.value;

          return (
            <button
              key={background.value}
              type="button"
              onClick={() => onBackgroundChange(background.value)}
              aria-label={`Select ${background.name} background`}
              aria-pressed={isSelected}
              className={`group flex flex-col items-center gap-2 rounded-xl border p-2 transition ${
                isSelected
                  ? "border-[#B99B70] bg-[#B99B70]/10"
                  : "border-transparent hover:border-[var(--color-line)]"
              }`}
            >
              <span
                className="h-11 w-full rounded-lg border border-black/10 shadow-sm"
                style={{ backgroundColor: background.value }}
              />

              <span className="text-xs font-medium text-[var(--color-ink)]">
                {background.name}
              </span>

              {isSelected && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9A794F]">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
