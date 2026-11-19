"use client";

import { useState } from "react";
import { FilmBannerCarousel } from "@/components/film/film-banner-carousel";
import { CategoryVideoCard } from "@/components/film/category-video-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { categoryContent, filmContent } from "@/config/film.config";

const banners = filmContent.banners;

/**
 * The existing four-category banner plus the content for each category.
 * Nothing is selected at first, so all four categories are shown; choosing one
 * shows only that category, with no page navigation.
 */
export function FilmCategoryExplorer() {
  const [selected, setSelected] = useState<number | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  function select(index: number) {
    setBannerIndex(index);
    setSelected(index);
  }

  const visible = banners
    .map((banner, index) => ({
      index,
      banner,
      category: categoryContent.items.find((item) => item.bannerId === banner.id),
    }))
    .filter((entry) => entry.category && (selected === null || entry.index === selected));

  return (
    <>
      <FilmBannerCarousel activeIndex={bannerIndex} onActiveChange={select} />

      <section
        aria-label="Film categories"
        data-selected-category={selected === null ? "all" : banners[selected].id}
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow={categoryContent.eyebrow} title={categoryContent.title} />
          <div className="flex flex-wrap items-center gap-3" aria-live="polite">
            <p className="text-sm text-[var(--color-muted)]">
              {selected === null
                ? categoryContent.allStatus
                : `Showing: ${banners[selected].tabLabel}`}
            </p>
            {selected !== null ? (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex min-h-10 items-center rounded-full border border-[var(--studio-champagne-gold)] px-5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--studio-champagne-gold)]"
              >
                {categoryContent.allLabel}
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-10 space-y-16">
          {visible.map(({ index, banner, category }) => {
            if (!category) return null;
            return (
              <article key={banner.id} id={`film-category-${banner.id}`} aria-labelledby={`film-category-title-${banner.id}`}>
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
                      Category 0{index + 1} · {banner.tabLabel}
                    </p>
                    <h3 id={`film-category-title-${banner.id}`} className="mt-3 font-serif text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl">
                      {category.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">{category.description}</p>
                    <ul className="mt-5 space-y-2 text-sm leading-6 text-[var(--color-ink)]">
                      {category.highlights.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--studio-champagne-gold)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid gap-4">
                    <CategoryVideoCard
                      src={banner.videoSrc}
                      poster={banner.poster}
                      category={banner.tabLabel}
                      title={category.videoTitle}
                      caption={category.videoCaption}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
