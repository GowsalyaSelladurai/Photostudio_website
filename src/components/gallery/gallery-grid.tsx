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
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Gallery categories">
        {galleryCategories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              category === item
                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                : "border-[var(--color-line)] bg-white text-[var(--color-muted)] hover:border-[var(--color-ink)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedImage(image)}
            className="group text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-clay)]"
          >
            <span className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-[var(--color-sand)]">
              <Image
                src={image.image}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </span>
            <span className="mt-4 block font-serif text-xl text-[var(--color-ink)]">
              {image.title}
            </span>
            <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
              {image.category}
            </span>
          </button>
        ))}
      </div>
      <PhotoLightbox
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}
