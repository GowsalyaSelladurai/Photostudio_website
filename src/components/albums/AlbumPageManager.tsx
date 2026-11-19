
"use client";

import type { AlbumPage } from "@/types/album";

type AlbumPageManagerProps = {
  pages: AlbumPage[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onDuplicatePage: () => void;
  onClearPage: () => void;
  onMovePage: (direction: -1 | 1) => void;
};

export function AlbumPageManager({
  pages,
  currentPageIndex,
  onSelectPage,
  onDuplicatePage,
  onClearPage,
  onMovePage,
}: AlbumPageManagerProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg text-[var(--color-ink)]">
            Page manager
          </h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Select, duplicate and organize your album pages.
          </p>
        </div>

        <span className="text-xs font-medium text-[var(--color-muted)]">
          {pages.length} pages
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-5">
        {pages.map((page, index) => {
          const isSelected = index === currentPageIndex;
          const photoCount = page.photos.length;
          const textCount = page.texts?.length ?? 0;

          return (
            <button
              key={page.id}
              type="button"
              onClick={() => onSelectPage(index)}
              aria-pressed={isSelected}
              className={`rounded-xl border p-2 text-left transition ${
                isSelected
                  ? "border-[var(--studio-champagne-gold)] bg-[var(--studio-warm-beige)]"
                  : "border-[var(--color-line)] hover:border-[var(--studio-champagne-gold)]"
              }`}
            >
              <div
                className="flex aspect-[3/4] flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-black/10 p-2"
                style={{ backgroundColor: page.background || "#F5F0E8" }}
              >
                <span className="text-2xl text-[var(--color-ink)]">
                  {photoCount || "+"}
                </span>

                <span className="text-center text-[10px] font-medium text-[var(--color-ink)]">
                  {photoCount === 0
                    ? "Empty page"
                    : `${photoCount} photo${photoCount === 1 ? "" : "s"}`}
                </span>

                {textCount > 0 && (
                  <span className="text-[9px] text-[var(--color-muted)]">
                    {textCount} text element{textCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              <p className="mt-2 text-center text-xs font-semibold text-[var(--color-ink)]">
                Page {index + 1}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onMovePage(-1)}
          disabled={currentPageIndex === 0}
          className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--studio-champagne-gold)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Move left
        </button>

        <button
          type="button"
          onClick={() => onMovePage(1)}
          disabled={currentPageIndex === pages.length - 1}
          className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--studio-champagne-gold)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Move right
        </button>

        <button
          type="button"
          onClick={onDuplicatePage}
          className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--studio-champagne-gold)]"
        >
          Duplicate page
        </button>

        <button
          type="button"
          onClick={onClearPage}
          className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
        >
          Clear page
        </button>
      </div>
    </section>
  );
}
