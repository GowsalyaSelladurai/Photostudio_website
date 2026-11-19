"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { albumPricing } from "@/config/studio.config";
import { albumConfig } from "@/config/album.config";
import { calculateAlbumPrice, formatAlbumPrice } from "@/lib/album-price";
import { saveAlbumProject } from "@/lib/album-storage";
import type {
  AlbumCoverFinish,
  AlbumOrientation,
  AlbumPage,
  AlbumProject,
} from "@/types/album";

export function AlbumProjectCreator() {
  const router = useRouter();

  const [name, setName] = useState("My Photo Album");
  const [sizeId, setSizeId] = useState(albumPricing.sizes[0].id);
  const [pageCount, setPageCount] = useState<number>(
    albumConfig.pageCountOptions[0],
  );
  const [finish, setFinish] = useState<AlbumCoverFinish>(
    albumConfig.defaultFinish,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedSize = albumPricing.sizes.find((size) => size.id === sizeId);

  const total = calculateAlbumPrice(sizeId, pageCount, finish);

  function createAlbum() {
    if (!name.trim()) {
      setError("Please enter a name for your album.");
      return;
    }

    if (!selectedSize) {
      setError("Please select a valid album size.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const now = Date.now();

      const orientation: AlbumOrientation =
        selectedSize.width === selectedSize.height
          ? "square"
          : selectedSize.width > selectedSize.height
            ? "landscape"
            : "portrait";

      const pages: AlbumPage[] = Array.from({ length: pageCount }, () => ({
        id: crypto.randomUUID(),
        layout: "single",
        photos: [],
        texts: [],
        background: "#F5F0E8",
      }));

      const project: AlbumProject = {
        id: crypto.randomUUID(),
        name: name.trim(),
        sizeId,
        pageCount,
        orientation,
        coverFinish: finish,
        coverPhotoId: null,
        photos: [],
        pages,
        currentPageIndex: 0,
        createdAt: now,
        updatedAt: now,
      };

      saveAlbumProject(project);

      router.push(`/albums/editor/${project.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your album. Please try again.",
      );
      setSaving(false);
    }
  }

  return (
    <section className="premium-card rounded-3xl p-6 sm:p-9">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
          Start your project
        </p>

        <h2 className="mt-3 font-serif text-3xl text-[var(--color-ink)]">
          Create your album
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          Choose your preferred specifications. You can begin designing your
          pages in the next step.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-7">
          <div>
            <label
              htmlFor="album-name"
              className="mb-2 block text-sm font-semibold text-[var(--color-ink)]"
            >
              Album name
            </label>

            <input
              id="album-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              placeholder="For example, Our Wedding Memories"
              className="w-full rounded-xl border border-[var(--color-line)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--studio-champagne-gold)]"
            />
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
              Choose album size
            </legend>

            <div className="grid gap-3 sm:grid-cols-3">
              {albumPricing.sizes.map((size) => {
                const active = sizeId === size.id;

                return (
                  <button
                    key={size.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSizeId(size.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-[var(--studio-champagne-gold)] bg-[var(--studio-warm-beige)]"
                        : "border-[var(--color-line)] hover:border-[var(--studio-champagne-gold)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[var(--color-ink)]">
                      {size.label}
                    </span>

                    <span className="mt-2 block text-xs text-[var(--color-muted)]">
                      {size.width} × {size.height} inches
                    </span>

                    <span className="mt-3 block text-sm font-semibold text-[var(--color-clay)]">
                      {formatAlbumPrice(size.amount)}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
              Number of pages
            </legend>

            <div className="flex flex-wrap gap-3">
              {albumConfig.pageCountOptions.map((count) => (
                <button
                  key={count}
                  type="button"
                  aria-pressed={pageCount === count}
                  onClick={() => setPageCount(count)}
                  className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                    pageCount === count
                      ? "border-[var(--studio-champagne-gold)] bg-[var(--studio-warm-beige)] text-[var(--studio-midnight-black)]"
                      : "border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--studio-champagne-gold)]"
                  }`}
                >
                  {count} pages
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
              Cover finish
            </legend>

            <div className="grid gap-3">
              {albumConfig.coverFinishes.map((option) => {
                const active = finish === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFinish(option.id as AlbumCoverFinish)}
                    className={`rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-[var(--studio-champagne-gold)] bg-[var(--studio-warm-beige)]"
                        : "border-[var(--color-line)] hover:border-[var(--studio-champagne-gold)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[var(--color-ink)]">
                      {option.label}
                    </span>

                    <span className="mt-1 block text-xs text-[var(--color-muted)]">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-2xl border border-[var(--color-line)] p-5 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
            Your selection
          </p>

          <h3 className="mt-4 font-serif text-xl text-[var(--color-ink)]">
            {selectedSize?.label}
          </h3>

          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {pageCount} pages
          </p>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {
              albumConfig.coverFinishes.find((item) => item.id === finish)
                ?.label
            }
          </p>

          <div className="my-5 border-t border-[var(--color-line)]" />

          <p className="text-xs text-[var(--color-muted)]">
            Estimated album price
          </p>

          <p
            aria-live="polite"
            className="mt-2 font-serif text-3xl text-[var(--color-ink)]"
          >
            {formatAlbumPrice(total)}
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
            Illustrative estimate. Final pricing can be confirmed before
            ordering.
          </p>

          <button
            type="button"
            onClick={createAlbum}
            disabled={saving}
            className="mt-6 w-full rounded-full bg-[var(--studio-midnight-black)] px-5 py-3.5 text-sm font-semibold text-[var(--studio-ivory-white)] transition hover:bg-[var(--studio-deep-charcoal)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating album..." : "Create and start designing"}
          </button>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
