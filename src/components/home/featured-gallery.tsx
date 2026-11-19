"use client";

import { useState } from "react";
import { PhotoLightbox } from "@/components/gallery/photo-lightbox";
import { GalleryCard } from "@/components/ui/gallery-card";
import type { GalleryImage } from "@/types/studio";

export function FeaturedGallery({ images }: { images: GalleryImage[] }) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <GalleryCard
            key={image.id}
            image={image}
            onSelect={setSelectedImage}
          />
        ))}
      </div>
      <PhotoLightbox
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}
