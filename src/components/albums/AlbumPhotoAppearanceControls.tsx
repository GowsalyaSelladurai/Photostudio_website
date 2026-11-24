
"use client";

import type {
  AlbumCornerRadius,
  AlbumPhotoShadow,
} from "@/types/album";

type AlbumPhotoAppearanceControlsProps = {
  selectedCornerRadius: AlbumCornerRadius;
  selectedPhotoShadow: AlbumPhotoShadow;
  onCornerRadiusChange: (value: AlbumCornerRadius) => void;
  onPhotoShadowChange: (value: AlbumPhotoShadow) => void;
};

const radiusOptions: {
  value: AlbumCornerRadius;
  name: string;
  description: string;
}[] = [
  {
    value: "square",
    name: "Square",
    description: "Sharp, clean edges",
  },
  {
    value: "subtle",
    name: "Subtle",
    description: "Soft rounded corners",
  },
  {
    value: "rounded",
    name: "Rounded",
    description: "Smooth rounded edges",
  },
];

const shadowOptions: {
  value: AlbumPhotoShadow;
  name: string;
  description: string;
}[] = [
  {
    value: "none",
    name: "None",
    description: "Flat presentation",
  },
  {
    value: "soft",
    name: "Soft",
    description: "Gentle photo depth",
  },
  {
    value: "premium",
    name: "Premium",
    description: "Deeper elegant shadow",
  },
];

export function AlbumPhotoAppearanceControls({
  selectedCornerRadius,
  selectedPhotoShadow,
  onCornerRadiusChange,
  onPhotoShadowChange,
}: AlbumPhotoAppearanceControlsProps) {
  return (
    <section className="space-y-6 rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div>
        <h3 className="font-serif text-lg text-[var(--color-ink)]">
          Photo corners
        </h3>

        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Choose the shape of your photographs.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {radiusOptions.map((option) => {
            const selected =
              selectedCornerRadius === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onCornerRadiusChange(option.value)
                }
                aria-pressed={selected}
                className={`rounded-xl border p-3 text-left transition ${
                  selected
                    ? "border-[#B99B70] bg-[#B99B70]/10"
                    : "border-[var(--color-line)] hover:border-[#B99B70]"
                }`}
              >
                <span
                  className={`mx-auto block h-10 w-10 border-4 border-[#B99B70] bg-[#F5F0E8] ${
                    option.value === "square"
                      ? "rounded-none"
                      : option.value === "subtle"
                        ? "rounded-md"
                        : "rounded-2xl"
                  }`}
                />

                <span className="mt-3 block text-center text-xs font-semibold text-[var(--color-ink)]">
                  {option.name}
                </span>

                <span className="mt-1 block text-center text-[10px] text-[var(--color-muted)]">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-serif text-lg text-[var(--color-ink)]">
          Photo shadows
        </h3>

        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Add depth to your album photographs.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {shadowOptions.map((option) => {
            const selected =
              selectedPhotoShadow === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onPhotoShadowChange(option.value)
                }
                aria-pressed={selected}
                className={`rounded-xl border p-3 text-center transition ${
                  selected
                    ? "border-[#B99B70] bg-[#B99B70]/10"
                    : "border-[var(--color-line)] hover:border-[#B99B70]"
                }`}
              >
                <span
                  className={`mx-auto block h-10 w-10 rounded-md border border-[#E5DCCF] bg-[#F5F0E8] ${
                    option.value === "soft"
                      ? "shadow-md"
                      : option.value === "premium"
                        ? "shadow-xl"
                        : "shadow-none"
                  }`}
                />

                <span className="mt-3 block text-xs font-semibold text-[var(--color-ink)]">
                  {option.name}
                </span>

                <span className="mt-1 block text-[10px] text-[var(--color-muted)]">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
