"use client";

import type {
  AlbumPhoto,
  AlbumPhotoPlacement,
  PhotoFitMode,
  PhotoTransform,
} from "@/types/album";
import { calculateSmartCrop } from "@/lib/ai/smart-crop-engine";

type AlbumPhotoControlsProps = {
  selectedPlacement: AlbumPhotoPlacement | null;
  selectedPhoto?: AlbumPhoto | null;
  slotDimensions?: { width: number; height: number };
  isSpread?: boolean;
  onTransformChange: (transform: PhotoTransform) => void;
};

export function AlbumPhotoControls({
  selectedPlacement,
  selectedPhoto,
  slotDimensions,
  isSpread = false,
  onTransformChange,
}: AlbumPhotoControlsProps) {
  if (!selectedPlacement) {
    return (
      <section className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <h3 className="font-serif text-lg text-[var(--color-ink)]">
          Photo adjustments
        </h3>

        <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
          Select a photograph in the album to adjust framing, AI Smart Fit, zoom and rotation.
        </p>
      </section>
    );
  }

  const transform = selectedPlacement.transform || {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    cropX: 0,
    cropY: 0,
    fitMode: "cover",
  };

  const fitMode: PhotoFitMode = transform.fitMode || "cover";

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
      fitMode: "cover",
    });
  }

  function handleApplySmartFit() {
    if (!selectedPlacement) return;
    const subjects = selectedPhoto?.smartFit?.subjects || [];
    const slotW = slotDimensions?.width || 600;
    const slotH = slotDimensions?.height || 600;
    const photoW = selectedPhoto?.width || 1200;
    const photoH = selectedPhoto?.height || 800;

    const smartResult = calculateSmartCrop(photoW, photoH, slotW, slotH, subjects, {
      isSpread,
    });

    onTransformChange({
      ...transform,
      cropX: smartResult.cropX,
      cropY: smartResult.cropY,
      fitMode: smartResult.fitMode,
      scale: 1,
      rotation: 0,
    });
  }

  const smartFitMeta = selectedPhoto?.smartFit;

  return (
    <section className="rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg text-[var(--color-ink)]">
            Photo adjustments
          </h3>

          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            AI Smart Fit & positioning
          </p>
        </div>

        <span className="rounded-full bg-[#B99B70]/15 px-3 py-1 text-xs font-semibold text-[#8B6E3E]">
          Selected
        </span>
      </div>

      {/* AI Smart Fit Status Pill */}
      {smartFitMeta && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 text-xs text-emerald-900">
          <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
          <div className="flex-1 leading-tight">
            <span className="font-semibold">AI Smart Fit Active: </span>
            {smartFitMeta.faceCount > 0
              ? `${smartFitMeta.faceCount} face(s) identified`
              : "Visual anchor optimized"}
          </div>
        </div>
      )}

      {/* One-Click AI Smart Fit Button */}
      <button
        type="button"
        onClick={handleApplySmartFit}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B99B70] to-[#A08255] px-4 py-2.5 text-xs font-semibold text-[#171717] shadow-sm transition hover:brightness-105"
      >
        <span>✨</span>
        <span>Auto Smart Fit (AI Framing)</span>
      </button>

      {/* Framing Mode Toggle */}
      <div className="mb-5 border-t border-[var(--color-line)] pt-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
          Framing Mode
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateTransform({ fitMode: "cover" })}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
              fitMode === "cover"
                ? "bg-[#B99B70] text-[#171717] font-semibold shadow-sm"
                : "border border-[var(--color-line)] text-[var(--color-ink)] hover:border-[#B99B70]"
            }`}
          >
            Fill Frame
          </button>
          <button
            type="button"
            onClick={() => updateTransform({ fitMode: "contain" })}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
              fitMode === "contain"
                ? "bg-[#B99B70] text-[#171717] font-semibold shadow-sm"
                : "border border-[var(--color-line)] text-[var(--color-ink)] hover:border-[#B99B70]"
            }`}
          >
            Fit Entire Photo
          </button>
        </div>
      </div>

      {/* Horizontal Crop Position */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="album-photo-crop-x"
            className="text-xs font-medium text-[var(--color-ink)]"
          >
            Horizontal Position
          </label>
          <span className="text-xs tabular-nums text-[var(--color-muted)]">
            {transform.cropX > 0 ? `+${transform.cropX}%` : `${transform.cropX}%`}
          </span>
        </div>
        <input
          id="album-photo-crop-x"
          type="range"
          min="-50"
          max="50"
          step="1"
          value={transform.cropX || 0}
          onChange={(e) => updateTransform({ cropX: Number(e.target.value) })}
          className="w-full accent-[#B99B70]"
        />
        <div className="mt-1 flex justify-between text-[10px] text-[var(--color-muted)]">
          <span>Left</span>
          <span>Center</span>
          <span>Right</span>
        </div>
      </div>

      {/* Vertical Crop Position */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="album-photo-crop-y"
            className="text-xs font-medium text-[var(--color-ink)]"
          >
            Vertical Position
          </label>
          <span className="text-xs tabular-nums text-[var(--color-muted)]">
            {transform.cropY > 0 ? `+${transform.cropY}%` : `${transform.cropY}%`}
          </span>
        </div>
        <input
          id="album-photo-crop-y"
          type="range"
          min="-50"
          max="50"
          step="1"
          value={transform.cropY || 0}
          onChange={(e) => updateTransform({ cropY: Number(e.target.value) })}
          className="w-full accent-[#B99B70]"
        />
        <div className="mt-1 flex justify-between text-[10px] text-[var(--color-muted)]">
          <span>Top</span>
          <span>Center</span>
          <span>Bottom</span>
        </div>
      </div>

      {/* Zoom */}
      <div className="mb-5 border-t border-[var(--color-line)] pt-4">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="album-photo-zoom"
            className="text-xs font-medium text-[var(--color-ink)]"
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
          onChange={(e) => updateTransform({ scale: Number(e.target.value) })}
          className="w-full accent-[#B99B70]"
        />
      </div>

      {/* Rotation */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="album-photo-rotation"
            className="text-xs font-medium text-[var(--color-ink)]"
          >
            Rotation
          </label>
          <span className="text-xs tabular-nums text-[var(--color-muted)]">
            {transform.rotation}°
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateTransform({ rotation: transform.rotation - 90 })}
            className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs font-medium text-[var(--color-ink)] transition hover:border-[#B99B70]"
          >
            ↶ Rotate Left
          </button>
          <button
            type="button"
            onClick={() => updateTransform({ rotation: transform.rotation + 90 })}
            className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs font-medium text-[var(--color-ink)] transition hover:border-[#B99B70]"
          >
            ↷ Rotate Right
          </button>
        </div>
      </div>

      {/* Reset Adjustments */}
      <button
        type="button"
        onClick={resetTransform}
        className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--studio-ivory-white)] px-4 py-2.5 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-gray-100"
      >
        Reset Adjustments
      </button>
    </section>
  );
}
