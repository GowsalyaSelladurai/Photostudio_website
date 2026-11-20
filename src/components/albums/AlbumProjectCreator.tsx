"use client";

import { useMemo, useState } from "react";
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

/**
 * Realistic 3D Mini Album Book Icon tailored to each size's exact physical aspect ratio
 */
function MiniAlbumBookPreview({
  sizeId,
}: {
  sizeId: string;
}) {
  // Proportions tailored to the 6 sizes
  let w = 44;
  let h = 44;

  if (sizeId === "4x4") {
    w = 42;
    h = 42;
  } else if (sizeId === "10x4") {
    w = 56;
    h = 30;
  } else if (sizeId === "classic") {
    // 8x12
    w = 34;
    h = 48;
  } else if (sizeId === "premium") {
    // 10x12
    w = 38;
    h = 46;
  } else if (sizeId === "12x8") {
    w = 50;
    h = 36;
  } else if (sizeId === "grand") {
    // 12x18
    w = 34;
    h = 50;
  }

  return (
    <div className="relative flex h-14 w-16 items-center justify-center">
      {/* Soft floor shadow */}
      <div
        className="absolute -bottom-0.5 rounded-full bg-[#3D352E]/15 blur-[3px]"
        style={{
          width: `${w + 6}px`,
          height: "8px",
          transform: "translateY(1px)",
        }}
      />

      {/* Book 3D Vector */}
      <svg
        width={w + 8}
        height={h + 6}
        viewBox={`0 0 ${w + 8} ${h + 6}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          {/* Cover gradient */}
          <linearGradient
            id={`cover-grad-${sizeId}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#DFD7CB" />
            <stop offset="60%" stopColor="#C9BFAF" />
            <stop offset="100%" stopColor="#B3A796" />
          </linearGradient>

          {/* Spine gradient */}
          <linearGradient
            id={`spine-grad-${sizeId}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#9C8F7E" />
            <stop offset="40%" stopColor="#C4B9A9" />
            <stop offset="100%" stopColor="#9E9180" />
          </linearGradient>

          {/* Page block edge gradient */}
          <linearGradient
            id={`pages-grad-${sizeId}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#F9F6F0" />
            <stop offset="100%" stopColor="#ECE5D8" />
          </linearGradient>
        </defs>

        {/* Back cover corner */}
        <rect
          x="3"
          y="4"
          width={w}
          height={h}
          rx="2"
          fill="#A89A88"
          opacity="0.8"
        />

        {/* Paper block right & top edges */}
        <path
          d={`M ${w + 1} 5 L ${w + 4} 3 L ${w + 4} ${h + 1} L ${w + 1} ${h + 3} Z`}
          fill={`url(#pages-grad-${sizeId})`}
          stroke="#D4CAB9"
          strokeWidth="0.5"
        />
        <path
          d={`M 5 3 L 8 1 L ${w + 4} 1 L ${w + 1} 3 Z`}
          fill={`url(#pages-grad-${sizeId})`}
          stroke="#D4CAB9"
          strokeWidth="0.5"
        />

        {/* Main front cover */}
        <rect
          x="2"
          y="3"
          width={w - 1}
          height={h}
          rx="2"
          fill={`url(#cover-grad-${sizeId})`}
          stroke="#B5A897"
          strokeWidth="0.75"
        />

        {/* Curved spine on left */}
        <rect
          x="2"
          y="3"
          width="4.5"
          height={h}
          rx="1.5"
          fill={`url(#spine-grad-${sizeId})`}
        />

        {/* Subtle cover deboss aperture window */}
        <rect
          x={w * 0.32}
          y={h * 0.28}
          width={w * 0.44}
          height={h * 0.44}
          rx="1"
          fill="#FAF7F2"
          stroke="#BDB09E"
          strokeWidth="0.5"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

/**
 * Cover Finish Visual Swatch subcomponent
 */
function CoverFinishSwatch({ finish }: { finish: AlbumCoverFinish }) {
  if (finish === "linen") {
    return (
      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-[#D5CAA8] bg-[#E8E0D2] shadow-sm">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(#C4B59D 1px, transparent 1px), radial-gradient(#C4B59D 1px, #E8E0D2 1px)",
            backgroundSize: "4px 4px",
            backgroundPosition: "0 0, 2px 2px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#BFAEA0]/30 to-transparent" />
      </div>
    );
  }

  if (finish === "leather") {
    return (
      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-[#946237] bg-[#7A4B23] shadow-sm">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #5C3214 25%, transparent 25%), linear-gradient(-45deg, #5C3214 25%, transparent 25%)",
            backgroundSize: "6px 6px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/15" />
      </div>
    );
  }

  // Printed Photo Cover
  return (
    <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-[#CFC5B4] bg-[#F5EFE6] shadow-sm">
      <div className="absolute inset-1 overflow-hidden rounded border border-[#DFD7CB] bg-[#EAE2D5]">
        <img
          src="/images/booking-editorial.png"
          alt="Printed photo cover sample"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
    </div>
  );
}

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

  const selectedSize = useMemo(
    () =>
      albumConfig.sizes.find((size) => size.id === sizeId) ??
      albumPricing.sizes.find((size) => size.id === sizeId),
    [sizeId],
  );

  const selectedFinish = useMemo(
    () => albumConfig.coverFinishes.find((item) => item.id === finish),
    [finish],
  );

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
    <div className="overflow-hidden rounded-[28px] border border-[#E4D9C8] bg-[#FAF7F2] p-6 shadow-[0_12px_44px_rgba(41,37,34,0.06)] sm:p-9 lg:p-11">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_390px] xl:gap-11">
        {/* Left Column: Form & Specifications */}
        <div className="space-y-8">
          {/* Section Header */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--studio-champagne-gold)]">
              Start your project
            </p>
            <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--studio-deep-charcoal)] sm:text-4xl">
              Create your album
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Choose your preferred specifications. You can begin designing your
              pages in the next step.
            </p>
          </div>

          {/* 1. Album Name Input */}
          <div>
            <label
              htmlFor="album-name"
              className="mb-2 block text-sm font-medium text-[var(--studio-deep-charcoal)]"
            >
              Album name
            </label>
            <div className="relative flex items-center">
              <input
                id="album-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                placeholder="My Photo Album"
                className="w-full rounded-xl border border-[#DED4C5] bg-[#FCFAF7] px-4 py-3.5 pr-11 text-sm font-medium text-[var(--studio-deep-charcoal)] outline-none transition placeholder:text-[#8C8075] focus:border-[var(--studio-champagne-gold)] focus:bg-white focus:ring-1 focus:ring-[var(--studio-champagne-gold)]"
              />
              <span
                className="pointer-events-none absolute right-3.5 text-[#8C8075]"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </span>
            </div>
          </div>

          {/* 2. Choose Album Size (3x2 Grid) */}
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-[var(--studio-deep-charcoal)]">
              Choose album size
            </legend>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {albumConfig.sizes.map((size) => {
                const active = sizeId === size.id;
                const orientationLabel =
                  size.width === size.height
                    ? "SQUARE"
                    : size.width > size.height
                      ? "LANDSCAPE"
                      : "PORTRAIT";

                return (
                  <button
                    key={size.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSizeId(size.id)}
                    className={`group relative flex items-center gap-3.5 rounded-xl p-3.5 text-left transition-all duration-200 ${
                      active
                        ? "border-[1.5px] border-[var(--studio-champagne-gold)] bg-[#F5EFE6] shadow-sm"
                        : "border border-[#E4D9C8] bg-[#FCFAF7] hover:border-[var(--studio-champagne-gold)]/60 hover:bg-[#FDFBF7]"
                    }`}
                  >
                    {/* Active Checkmark Pill in Top Right Corner */}
                    {active && (
                      <span
                        className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#A67C4A] text-white shadow-sm"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          width="10"
                          height="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m3.5 8.5 3 3 6-7" />
                        </svg>
                      </span>
                    )}

                    {/* Miniature 3D Book Visual */}
                    <div className="flex-shrink-0">
                      <MiniAlbumBookPreview sizeId={size.id} />
                    </div>

                    {/* Size Typography & Orientation */}
                    <div className="min-w-0 flex-1 pr-4">
                      <span className="block truncate text-sm font-semibold tracking-tight text-[var(--studio-deep-charcoal)]">
                        {size.label}
                      </span>

                      <span className="mt-0.5 block text-[10px] font-semibold tracking-wider text-[#8C8075] uppercase">
                        {orientationLabel}
                      </span>

                      <span className="mt-2 block text-sm font-bold text-[var(--studio-deep-charcoal)]">
                        {formatAlbumPrice(size.amount)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* 3. Number of Pages */}
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-[var(--studio-deep-charcoal)]">
              Number of pages
            </legend>

            <div className="flex flex-wrap gap-3">
              {albumConfig.pageCountOptions.map((count) => {
                const active = pageCount === count;

                return (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPageCount(count)}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "border-[1.5px] border-[var(--studio-champagne-gold)] bg-[#F5EFE6] font-semibold text-[var(--studio-midnight-black)] shadow-sm"
                        : "border border-[#E4D9C8] bg-[#FCFAF7] text-[var(--studio-deep-charcoal)] hover:border-[var(--studio-champagne-gold)]/60"
                    }`}
                  >
                    <span>{count} pages</span>
                    {active && (
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded-full bg-[#A67C4A] text-white shadow-sm"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          width="9"
                          height="9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m3.5 8.5 3 3 6-7" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* 4. Cover Finish (3 Stacked Horizontal Cards) */}
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-[var(--studio-deep-charcoal)]">
              Cover finish
            </legend>

            <div className="space-y-2.5">
              {albumConfig.coverFinishes.map((option) => {
                const active = finish === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFinish(option.id as AlbumCoverFinish)}
                    className={`group relative flex w-full items-center gap-4 rounded-xl p-3.5 text-left transition-all duration-200 ${
                      active
                        ? "border-[1.5px] border-[var(--studio-champagne-gold)] bg-[#F5EFE6] shadow-sm"
                        : "border border-[#E4D9C8] bg-[#FCFAF7] hover:border-[var(--studio-champagne-gold)]/60 hover:bg-[#FDFBF7]"
                    }`}
                  >
                    {/* Swatch Icon */}
                    <CoverFinishSwatch
                      finish={option.id as AlbumCoverFinish}
                    />

                    {/* Text Details */}
                    <div className="min-w-0 flex-1 pr-7">
                      <span className="block text-sm font-semibold text-[var(--studio-deep-charcoal)]">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--color-muted)] leading-relaxed">
                        {option.description}
                      </span>
                    </div>

                    {/* Active Checkmark Pill on Right */}
                    {active && (
                      <span
                        className="absolute right-3.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#A67C4A] text-white shadow-sm"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          width="10"
                          height="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m3.5 8.5 3 3 6-7" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Right Column: Selection Summary Card */}
        <aside className="h-fit rounded-2xl border border-[#E4D9C8] bg-[#FCFAF7] p-5 shadow-[0_6px_24px_rgba(41,37,34,0.04)] sm:p-6 lg:sticky lg:top-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C8075]">
            Your selection
          </p>

          {/* Album Cover Visual Mockup */}
          <div className="relative mt-4 flex aspect-[1.18/1] w-full items-center justify-center overflow-hidden rounded-xl border border-[#E8DDCE] bg-[#F2EDE4] p-4 shadow-inner">
            {/* Soft decorative flower sprig on the left */}
            <div className="absolute left-2.5 top-3 bottom-3 w-16 opacity-45 pointer-events-none">
              <svg viewBox="0 0 60 100" fill="none" className="h-full w-full">
                <path
                  d="M15 95 C25 70, 35 45, 40 10"
                  stroke="#8C7E6C"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle cx="40" cy="10" r="3.5" fill="#B3A28B" />
                <circle cx="33" cy="24" r="3" fill="#B3A28B" />
                <circle cx="44" cy="32" r="3" fill="#B3A28B" />
                <circle cx="26" cy="42" r="2.5" fill="#B3A28B" />
                <circle cx="36" cy="54" r="2.5" fill="#B3A28B" />
                <circle cx="21" cy="68" r="2" fill="#B3A28B" />
              </svg>
            </div>

            {/* Closed Album Front Cover */}
            <div className="relative z-10 flex h-36 w-36 items-center justify-center rounded-md border border-[#C9BEAE] bg-[#DDD4C5] p-2.5 shadow-[0_12px_24px_rgba(41,37,34,0.18)]">
              {/* Embossed photo frame aperture on cover */}
              <div className="relative h-24 w-24 overflow-hidden rounded border border-[#BCB0A0] bg-[#FAF7F2] p-1 shadow-inner">
                <img
                  src="/images/booking-editorial.png"
                  alt="Album cover artwork preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Specification details with clean icons */}
          <div className="mt-6 space-y-4">
            {/* Size */}
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-[#8C8075]" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 3H3v18h18V3Z" />
                  <path d="M9 3v18M3 9h18" />
                </svg>
              </span>
              <div>
                <span className="block text-xs text-[#8C8075]">Album size</span>
                <span className="block text-sm font-semibold text-[var(--studio-deep-charcoal)]">
                  {selectedSize?.label}
                </span>
                <span className="block text-xs capitalize text-[#8C8075]">
                  {selectedSize
                    ? selectedSize.width === selectedSize.height
                      ? "Square"
                      : selectedSize.width > selectedSize.height
                        ? "Landscape"
                        : "Portrait"
                    : "Square"}
                </span>
              </div>
            </div>

            {/* Pages */}
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-[#8C8075]" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M7 7h10M7 12h10M7 17h6" />
                </svg>
              </span>
              <div>
                <span className="block text-xs text-[#8C8075]">Pages</span>
                <span className="block text-sm font-semibold text-[var(--studio-deep-charcoal)]">
                  {pageCount} pages
                </span>
              </div>
            </div>

            {/* Finish */}
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-[#8C8075]" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="m4.93 4.93 14.14 14.14M12 3v18M3 12h18" />
                </svg>
              </span>
              <div>
                <span className="block text-xs text-[#8C8075]">Cover finish</span>
                <span className="block text-sm font-semibold text-[var(--studio-deep-charcoal)]">
                  {selectedFinish?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-[#E8DDCE]" />

          {/* Pricing */}
          <div>
            <span className="block text-xs text-[#8C8075]">Estimated price</span>
            <span
              aria-live="polite"
              className="mt-1 block font-sans text-3xl font-bold tracking-tight text-[var(--studio-midnight-black)] sm:text-4xl"
            >
              {formatAlbumPrice(total)}
            </span>
          </div>

          {/* Primary CTA Button */}
          <button
            type="button"
            onClick={createAlbum}
            disabled={saving}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--studio-midnight-black)] py-3.5 px-6 text-sm font-semibold text-[var(--studio-ivory-white)] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--studio-deep-charcoal)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {saving ? "Creating album..." : "Create and start designing"}
            </span>
            <span aria-hidden="true" className="text-base leading-none">
              &gt;
            </span>
          </button>

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-600"
            >
              {error}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
