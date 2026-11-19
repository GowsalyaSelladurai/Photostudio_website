import Image from "next/image";
import type { GalleryImage } from "@/types/studio";

export function GalleryCard({
  image,
  onSelect,
}: {
  image: GalleryImage;
  onSelect: (image: GalleryImage) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(image)}
      aria-label={`View ${image.title}, ${image.category} photograph`}
      className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-clay)]"
    >
      <span className="premium-card relative block aspect-[4/5] overflow-hidden rounded-xl">
        <Image
          src={image.image}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </span>
      <span className="mt-4 flex items-start justify-between gap-3">
        <span>
          <span className="block font-serif text-xl text-[var(--color-ink)]">
            {image.title}
          </span>
          <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
            {image.category}
          </span>
        </span>
        <span aria-hidden="true" className="pt-1 text-[var(--color-clay)]">
          ↗
        </span>
      </span>
    </button>
  );
}
