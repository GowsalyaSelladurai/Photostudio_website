import Image from "next/image";
import { studioConfig, galleryImages } from "@/config/studio.config";
import { SectionHeading } from "@/components/ui/section-heading";

const previewImages = [
  { image: galleryImages[1], src: "/mrge_pic/img1.jpg" },
  { image: galleryImages[3], src: "/mrge_pic/img3.jpg" },
  { image: galleryImages[5], src: "/mrge_pic/img5.jpg" },
  { image: galleryImages[4], src: "/mrge_pic/img6.jpg" },
];

export function InstagramPreview() {
  const content = studioConfig.home.instagram;

  return (
    <section className="bg-[var(--color-sand)] px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
          <a
            href={studioConfig.contact.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="pb-1 text-sm font-semibold text-[var(--color-clay)] underline-offset-4 hover:underline"
          >
            {content.linkLabel} ↗
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previewImages.map(({ image, src }) => (
            <a
              key={image.id}
              href={studioConfig.contact.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${image.title}, sample Instagram preview`}
              className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[var(--color-paper-deep)]"
            >
              <Image
                src={src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 45vw, 30vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
