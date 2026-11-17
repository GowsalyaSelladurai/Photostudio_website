"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { GalleryImage } from "@/types/studio";

export function PhotoLightbox({
  image,
  onClose,
}: {
  image: GalleryImage | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (image && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [image]);

  if (!image) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Photo: ${image.title}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-0 flex h-dvh max-h-none w-screen max-w-none items-center justify-center overflow-hidden border-0 bg-black/90 p-5 text-white backdrop:bg-black/90"
    >
      <button
        type="button"
        autoFocus
        aria-label="Close photo"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 rounded-full border border-white/50 px-4 py-2 text-sm text-white transition-colors hover:bg-white/15"
      >
        Close
      </button>
      <div className="relative h-[80vh] w-full max-w-5xl">
        <Image
          src={image.image}
          alt={image.alt}
          fill
          sizes="100vw"
          className="object-contain"
        />
        <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12 font-serif text-xl">
          {image.title}
        </p>
      </div>
    </dialog>
  );
}
