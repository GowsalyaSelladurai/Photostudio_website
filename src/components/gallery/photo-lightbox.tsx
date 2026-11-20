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
      className="fixed inset-0 m-0 flex h-dvh max-h-none w-screen max-w-none items-center justify-center overflow-hidden border-0 bg-[var(--studio-midnight-black)]/95 p-5 text-[var(--studio-ivory-white)] backdrop:bg-[var(--studio-midnight-black)]/95"
    >
      <button
        type="button"
        autoFocus
        aria-label="Close photo"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 rounded-full border border-[var(--studio-champagne-gold)] px-4 py-2 text-sm text-[var(--studio-ivory-white)] transition-colors hover:bg-[var(--studio-champagne-gold)] hover:text-[var(--studio-midnight-black)]"
      >
        Close
      </button>
      <div className="relative h-[80vh] w-full max-w-5xl border border-[color-mix(in_srgb,var(--studio-champagne-gold)_45%,transparent)]">
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