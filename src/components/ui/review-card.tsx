"use client";

import type { Review } from "@/types/studio";
import { useEffect, useRef, useState } from "react";

export function ReviewCard({ review }: { review: Review }) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean | null>(null);

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={cardRef}
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--studio-champagne-gold)_28%,transparent)] bg-[var(--studio-midnight-black)] p-6 text-[var(--studio-ivory-white)] transition-[opacity,transform,border-color,box-shadow] duration-700 ease-out hover:-translate-y-1 hover:border-[var(--studio-champagne-gold)] hover:shadow-xl hover:shadow-black/20 ${
        isVisible === false ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <span aria-hidden="true" className="absolute right-5 top-1 font-serif text-7xl leading-none text-[var(--studio-champagne-gold)]/20">
        “
      </span>
      <div aria-label="5 out of 5 stars" className="inline-flex w-fit text-sm tracking-[0.2em] text-[var(--studio-champagne-gold)]">
        ★★★★★
      </div>
      <blockquote className="relative mt-5 flex-1 font-serif text-xl leading-8 text-[var(--studio-ivory-white)]">
        “{review.quote}”
      </blockquote>
      <figcaption className="mt-6 border-t border-white/15 pt-4">
        <p className="text-sm font-semibold text-[var(--studio-ivory-white)]">
          {review.author}
        </p>
        <p className="mt-1 text-xs text-[var(--studio-ivory-white)]/65">
          {review.context} · demo review
        </p>
      </figcaption>
    </figure>
  );
}
