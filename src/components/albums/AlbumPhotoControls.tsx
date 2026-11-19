
"use client";

import type {
  AlbumPhotoPlacement,
  PhotoTransform,
} from "@/types/album";

type AlbumPhotoControlsProps = {
  selectedPlacement: AlbumPhotoPlacement | null;
  onTransformChange: (transform: PhotoTransform) => void;
};

export function AlbumPhotoControls({
  selectedPlacement,
  onTransformChange,
}: AlbumPhotoControlsProps) {
  if (!selectedPlacement) {
    return (
      <section className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <h3 className="font-serif text-lg text-[var(--color-ink)]">
          Photo adjustments
        </h3>

        <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
          Select a photograph in the preview to adjust its zoom and rotation.
        </p>
      </section>
    );
  }

  const transform = selectedPlacement.transform;

  function updateTransform(changes: Partial<PhotoTransform>) {
    onTransformChange({
      ...transform,
      ...changes,
    });
  }

  function resetTransform() {
    onTransformChange({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      cropX: 0,
      cropY: 0,
    });
  }

  return (
    <section className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg text-[var(--color-ink)]">
            Photo adjustments
          </h3>

          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Customize your selected photograph.
          </p>
        </div>

        <span className="rounded-full bg-[#B99B70]/10 px-3 py-1.5 text-xs font-semibold text-[#9A794F]">
          Selected
        </span>
      </div>

      {/* Zoom */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <label
            htmlFor="album-photo-zoom"
            className="text-sm font-medium text-[var(--color-ink)]"
          >
            Zoom
          </label>

          <span className="text-xs tabular-nums text-[var(--color-muted)]">
            {transform.scale.toFixed(1)}x
          </span>
        </div>

        <input
          id="album-photo-zoom"
          type="range"
          min="0.5"
          max="2.5"
          step="0.1"
          value={transform.scale}
          onChange={(event) =>
            updateTransform({
              scale: Number(event.target.value),
            })
          }
          className="w-full accent-[#B99B70]"
        />

        <div className="mt-2 flex justify-between text-[10px] text-[var(--color-muted)]">
          <span>Zoom out</span>
          <span>Zoom in</span>
        </div>
      </div>

      {/* Rotation */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <label
            htmlFor="album-photo-rotation"
            className="text-sm font-medium text-[var(--color-ink)]"
          >
            Rotation
          </label>

          <span className="text-xs tabular-nums text-[var(--color-muted)]">
            {transform.rotation}°
          </span>
        </div>

        <input
          id="album-photo-rotation"
          type="range"
          min="-180"
          max="180"
          step="5"
          value={transform.rotation}
          onChange={(event) =>
            updateTransform({
              rotation: Number(event.target.value),
            })
          }
          className="w-full accent-[#B99B70]"
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              updateTransform({
                rotation: transform.rotation - 90,
              })
            }
            className="rounded-full border border-[var(--color-line)] px-3 py-2 text-xs font-medium text-[var(--color-ink)] transition hover:border-[#B99B70]"
          >
            ↶ Rotate left
          </button>

          <button
            type="button"
            onClick={() =>
              updateTransform({
                rotation: transform.rotation + 90,
              })
            }
            className="rounded-full border border-[var(--color-line)] px-3 py-2 text-xs font-medium text-[var(--color-ink)] transition hover:border-[#B99B70]"
          >
            ↷ Rotate right
          </button>
        </div>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={resetTransform}
        className="w-full rounded-full bg-[var(--studio-midnight-black)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--studio-deep-charcoal)]"
      >
        Reset adjustments
      </button>
    </section>
  );
}
