
"use client";

import { albumBackgrounds } from "@/config/album-backgrounds.config";
import type {
  AlbumFrameStyle,
  AlbumPhotoSpacing,
} from "@/types/album";

type AlbumPageStyleControlsProps = {
  selectedBackground: string;
  selectedFrameStyle: AlbumFrameStyle;
  selectedPhotoSpacing: AlbumPhotoSpacing;
  onBackgroundChange: (value: string) => void;
  onFrameStyleChange: (value: AlbumFrameStyle) => void;
  onPhotoSpacingChange: (value: AlbumPhotoSpacing) => void;
};

const gradients = [
  {
    name: "Champagne Glow",
    value: "linear-gradient(135deg, #F5F0E8, #D8C3A5)",
  },
  {
    name: "Soft Rose",
    value: "linear-gradient(135deg, #F7E8E5, #E8C9C3)",
  },
  {
    name: "Warm Sunset",
    value: "linear-gradient(135deg, #F8E4CC, #E6BFA1)",
  },
  {
    name: "Silver Mist",
    value: "linear-gradient(135deg, #F5F5F5, #D5D9DE)",
  },
];

const frameOptions: {
  value: AlbumFrameStyle;
  name: string;
  description: string;
}[] = [
  {
    value: "none",
    name: "No frame",
    description: "Clean edge-to-edge photos",
  },
  {
    value: "thin",
    name: "Thin",
    description: "A subtle white border",
  },
  {
    value: "elegant",
    name: "Elegant",
    description: "A refined gold border",
  },
  {
    value: "polaroid",
    name: "Polaroid",
    description: "Classic instant-photo style",
  },
];

const spacingOptions: {
  value: AlbumPhotoSpacing;
  name: string;
  description: string;
}[] = [
  {
    value: "compact",
    name: "Compact",
    description: "Close photo arrangement",
  },
  {
    value: "balanced",
    name: "Balanced",
    description: "Comfortable spacing",
  },
  {
    value: "spacious",
    name: "Spacious",
    description: "More breathing room",
  },
];

export function AlbumPageStyleControls({
  selectedBackground,
  selectedFrameStyle,
  selectedPhotoSpacing,
  onBackgroundChange,
  onFrameStyleChange,
  onPhotoSpacingChange,
}: AlbumPageStyleControlsProps) {
  return (
    <section className="space-y-6 rounded-2xl border border-[var(--color-line)] bg-white p-5">
      {/* Background colors */}
      <div>
        <h3 className="font-serif text-lg text-[var(--color-ink)]">
          Page background
        </h3>

        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Choose a solid color for your page.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {albumBackgrounds.map((background) => {
            const isSelected =
              selectedBackground === background.value;

            return (
              <button
                key={background.value}
                type="button"
                onClick={() => onBackgroundChange(background.value)}
                aria-label={`Select ${background.name} background`}
                aria-pressed={isSelected}
                className={`rounded-xl border p-2 transition ${
                  isSelected
                    ? "border-[#B99B70] bg-[#B99B70]/10"
                    : "border-transparent hover:border-[var(--color-line)]"
                }`}
              >
                <span
                  className="block h-10 w-full rounded-lg border border-black/10"
                  style={{ background: background.value }}
                />

                <span className="mt-2 block text-center text-[10px] font-medium text-[var(--color-ink)]">
                  {background.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gradient backgrounds */}
      <div>
        <h4 className="text-sm font-semibold text-[var(--color-ink)]">
          Gradient backgrounds
        </h4>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {gradients.map((gradient) => {
            const isSelected =
              selectedBackground === gradient.value;

            return (
              <button
                key={gradient.name}
                type="button"
                onClick={() => onBackgroundChange(gradient.value)}
                aria-label={`Select ${gradient.name} background`}
                aria-pressed={isSelected}
                className={`rounded-xl border p-2 transition ${
                  isSelected
                    ? "border-[#B99B70] bg-[#B99B70]/10"
                    : "border-transparent hover:border-[var(--color-line)]"
                }`}
              >
                <span
                  className="block h-12 w-full rounded-lg"
                  style={{ background: gradient.value }}
                />

                <span className="mt-2 block text-center text-[10px] font-medium text-[var(--color-ink)]">
                  {gradient.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo frames */}
      <div>
        <h3 className="font-serif text-lg text-[var(--color-ink)]">
          Photo frames
        </h3>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {frameOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFrameStyleChange(option.value)}
              aria-pressed={selectedFrameStyle === option.value}
              className={`rounded-xl border p-3 text-left transition ${
                selectedFrameStyle === option.value
                  ? "border-[#B99B70] bg-[#B99B70]/10"
                  : "border-[var(--color-line)] hover:border-[#B99B70]"
              }`}
            >
              <span className="block text-sm font-semibold text-[var(--color-ink)]">
                {option.name}
              </span>

              <span className="mt-1 block text-[11px] text-[var(--color-muted)]">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Photo spacing */}
      <div>
        <h3 className="font-serif text-lg text-[var(--color-ink)]">
          Photo spacing
        </h3>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {spacingOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPhotoSpacingChange(option.value)}
              aria-pressed={selectedPhotoSpacing === option.value}
              className={`rounded-xl border p-3 text-center transition ${
                selectedPhotoSpacing === option.value
                  ? "border-[#B99B70] bg-[#B99B70]/10"
                  : "border-[var(--color-line)] hover:border-[#B99B70]"
              }`}
            >
              <span className="block text-xs font-semibold text-[var(--color-ink)]">
                {option.name}
              </span>

              <span className="mt-1 block text-[10px] text-[var(--color-muted)]">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
