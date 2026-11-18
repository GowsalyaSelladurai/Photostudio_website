
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { galleryCategories, galleryImages } from "@/config/studio.config";
import { PhotoLightbox } from "@/components/gallery/photo-lightbox";

type Category = (typeof galleryCategories)[number];

export function GalleryGrid() {
  const [category, setCategory] = useState<Category>("All");
  const [selectedImage, setSelectedImage] = useState<
    (typeof galleryImages)[number] | null
  >(null);

  const images = useMemo(
    () =>
      category === "All"
        ? galleryImages
        : galleryImages.filter((image) => image.category === category),
    [category],
  );

  return (
    <>
      {/* CATEGORY FILTERS */}
      <div
        className="mb-8 flex flex-wrap gap-2"
        role="group"
        aria-label="Gallery categories"
      >
        {galleryCategories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
              category === item
                ? "border-[var(--studio-champagne-gold)] bg-[var(--studio-champagne-gold)] font-semibold text-[var(--studio-midnight-black)] shadow-[0_4px_18px_rgba(190,155,95,0.25)]"
                : "border-[var(--color-line)] bg-[var(--studio-ivory-white)] text-[var(--color-muted)] hover:border-[var(--studio-champagne-gold)] hover:shadow-[0_0_14px_rgba(190,155,95,0.16)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* GALLERY GRID */}
      <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedImage(image)}
            onPointerMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();

              const x =
                ((event.clientX - rect.left) / rect.width) * 100;
              const y =
                ((event.clientY - rect.top) / rect.height) * 100;

              event.currentTarget.style.setProperty("--glow-x", `${x}%`);
              event.currentTarget.style.setProperty("--glow-y", `${y}%`);
            }}
            onPointerDown={(event) => {
              event.currentTarget.classList.add("is-touching");
            }}
            onPointerUp={(event) => {
              event.currentTarget.classList.remove("is-touching");
            }}
            onPointerCancel={(event) => {
              event.currentTarget.classList.remove("is-touching");
            }}
            onPointerLeave={(event) => {
              event.currentTarget.classList.remove("is-touching");
            }}
            className="magic-grid-card group text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-clay)]"
          >
            {/* IMAGE FRAME */}
            <span className="magic-grid-frame premium-card relative block aspect-[4/5] overflow-hidden rounded-xl">
              <Image
                src={image.image}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                className="magic-grid-image object-cover transition-transform duration-700"
              />

              {/* INTERACTIVE GLOW */}
              <span className="magic-grid-shine" aria-hidden="true" />
              <span className="magic-grid-border" aria-hidden="true" />

              {/* FOUR GOLDEN CORNERS */}
              <span className="magic-grid-corner magic-corner-tl" aria-hidden="true" />
              <span className="magic-grid-corner magic-corner-tr" aria-hidden="true" />
              <span className="magic-grid-corner magic-corner-bl" aria-hidden="true" />
              <span className="magic-grid-corner magic-corner-br" aria-hidden="true" />
            </span>

            {/* IMAGE DETAILS */}
            <span className="mt-4 block font-serif text-xl text-[var(--color-ink)] transition-colors duration-300 group-hover:text-[#A95E13]">
              {image.title}
            </span>

            <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
              {image.category}
            </span>
          </button>
        ))}
      </div>

      {/* FULLSCREEN LIGHTBOX */}
      <PhotoLightbox
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      {/* MAGIC TOUCH GLOW STYLES */}
      <style jsx global>{`
        .magic-grid-card {
          --glow-x: 50%;
          --glow-y: 50%;

          position: relative;
          display: block;
          width: 100%;
          isolation: isolate;
          border-radius: 14px;
          -webkit-tap-highlight-color: transparent;
          touch-action: pan-y;
        }

        .magic-grid-frame {
          isolation: isolate;
          border: 1px solid rgba(143, 91, 34, 0.32);
          box-shadow:
            0 5px 20px rgba(80, 53, 20, 0.09),
            0 0 0 1px rgba(143, 91, 34, 0.08);

          transition:
            border-color 0.4s ease,
            box-shadow 0.4s ease,
            transform 0.4s ease;
        }

        /* WARM AMBER LIGHT */
        .magic-grid-shine {
          position: absolute;
          z-index: 2;
          inset: 0;
          pointer-events: none;
          opacity: 0;

          background: radial-gradient(
            250px circle at var(--glow-x) var(--glow-y),
            rgba(255, 177, 64, 0.48),
            rgba(190, 119, 35, 0.22) 38%,
            transparent 75%
          );

          transition: opacity 0.3s ease;
        }

        /* GLOWING GOLD BORDER */
        .magic-grid-border {
          position: absolute;
          z-index: 3;
          inset: 0;
          padding: 2px;
          border-radius: inherit;
          pointer-events: none;
          opacity: 0;

          background: radial-gradient(
            180px circle at var(--glow-x) var(--glow-y),
            #a95e13,
            #e6a94e 35%,
            rgba(185, 119, 38, 0.15) 75%
          );

          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);

          -webkit-mask-composite: xor;
          mask-composite: exclude;

          transition: opacity 0.3s ease;
        }

        /* FOUR CORNER LIGHTS */
        .magic-grid-corner {
          position: absolute;
          z-index: 4;
          width: 20px;
          height: 20px;
          pointer-events: none;
          opacity: 0;

          filter: drop-shadow(0 0 4px rgba(169, 94, 19, 0.8));

          transition:
            opacity 0.35s ease,
            transform 0.35s ease;
        }

        .magic-corner-tl {
          top: 9px;
          left: 9px;
          border-top: 2px solid #a95e13;
          border-left: 2px solid #a95e13;
          transform: translate(5px, 5px);
        }

        .magic-corner-tr {
          top: 9px;
          right: 9px;
          border-top: 2px solid #a95e13;
          border-right: 2px solid #a95e13;
          transform: translate(-5px, 5px);
        }

        .magic-corner-bl {
          bottom: 9px;
          left: 9px;
          border-bottom: 2px solid #a95e13;
          border-left: 2px solid #a95e13;
          transform: translate(5px, -5px);
        }

        .magic-corner-br {
          right: 9px;
          bottom: 9px;
          border-right: 2px solid #a95e13;
          border-bottom: 2px solid #a95e13;
          transform: translate(-5px, -5px);
        }

        /* DESKTOP HOVER EFFECT */
        @media (hover: hover) and (pointer: fine) {
          .magic-grid-card:hover .magic-grid-frame {
            transform: translateY(-7px) scale(1.012);
            border-color: #b9782e;

            box-shadow:
              0 15px 35px rgba(102, 62, 19, 0.2),
              0 0 18px rgba(190, 119, 35, 0.35),
              0 0 38px rgba(190, 119, 35, 0.18);
          }

          .magic-grid-card:hover .magic-grid-shine,
          .magic-grid-card:hover .magic-grid-border {
            opacity: 1;
          }

          .magic-grid-card:hover .magic-grid-image {
            transform: scale(1.075);
            filter: saturate(1.12) brightness(1.04);
          }

          .magic-grid-card:hover .magic-grid-corner {
            opacity: 1;
            transform: translate(0, 0);
          }
        }

        /* MOBILE TOUCH EFFECT */
        .magic-grid-card.is-touching .magic-grid-frame {
          transform: scale(0.985);
          border-color: #a95e13;

          box-shadow:
            0 0 16px rgba(169, 94, 19, 0.4),
            0 0 32px rgba(190, 119, 35, 0.24);
        }

        .magic-grid-card.is-touching .magic-grid-shine,
        .magic-grid-card.is-touching .magic-grid-border,
        .magic-grid-card.is-touching .magic-grid-corner {
          opacity: 1;
        }

        .magic-grid-card.is-touching .magic-grid-image {
          transform: scale(1.04);
        }

        /* KEYBOARD ACCESSIBILITY */
        .magic-grid-card:focus-visible .magic-grid-frame {
          border-color: #a95e13;
          box-shadow: 0 0 0 3px rgba(169, 94, 19, 0.3);
        }

        /* REDUCED MOTION */
        @media (prefers-reduced-motion: reduce) {
          .magic-grid-frame,
          .magic-grid-image,
          .magic-grid-shine,
          .magic-grid-border,
          .magic-grid-corner {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
