"use client";

import Image from "next/image";
import { useState } from "react";

const beforeImage =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85";
const afterImage =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85&sat=-20&exp=8";

export function BeforeAfterSlider() {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--studio-champagne-gold)_45%,transparent)] bg-[var(--color-sand)] shadow-xl shadow-black/10">
      <Image src={beforeImage} alt="Sample photo before editing" fill sizes="90vw" className="object-cover" />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image src={afterImage} alt="Sample photo after editing" fill sizes="90vw" className="object-cover" />
      </div>
      <span className="absolute left-4 top-4 rounded-full bg-[var(--studio-deep-charcoal)]/90 px-3 py-1 text-xs text-[var(--studio-ivory-white)]">Before · demo</span>
      <span className="absolute right-4 top-4 rounded-full bg-[var(--studio-deep-charcoal)]/90 px-3 py-1 text-xs text-[var(--studio-ivory-white)]">After · demo</span>
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-[var(--studio-champagne-gold)]" style={{ left: `${position}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--studio-champagne-gold)] bg-[var(--studio-ivory-white)] text-sm text-[var(--studio-midnight-black)] shadow">↔</span>
      </div>
      <label className="sr-only" htmlFor="before-after-range">Compare the sample before and after edit</label>
      <input
        id="before-after-range"
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="absolute inset-x-0 bottom-0 h-12 w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
