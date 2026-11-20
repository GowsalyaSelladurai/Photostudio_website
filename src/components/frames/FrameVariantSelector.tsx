"use client";

import React, { useEffect, useState } from "react";

export interface FrameVariant {
  id: 1 | 2 | 3;
  badge: string;
  title: string;
  dimensionLabel: string;
  orientationLabel: string;
  widthIn: number;
  heightIn: number;
  aspectRatio: string;
  imageSrc: string;
  imageAlt: string;
}

interface FrameVariantSelectorProps {
  variants: FrameVariant[];
  selectedId: 1 | 2 | 3;
  onSelect: (id: 1 | 2 | 3) => void;
}

/**
 * Thumbnail image subcomponent with graceful error handling and smooth fade-in
 */
function VariantThumbnailImage({
  src,
  alt,
  aspectRatio,
  dimensionLabel,
}: {
  src: string;
  alt: string;
  aspectRatio: string;
  dimensionLabel: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const probe = new Image();

    probe.onload = () => {
      if (!active) return;
      if (probe.naturalWidth > 0 && probe.naturalHeight > 0) {
        setIsLoaded(true);
        setHasError(false);
      } else {
        setHasError(true);
        setIsLoaded(false);
      }
    };

    probe.onerror = () => {
      if (!active) return;
      setHasError(true);
      setIsLoaded(false);
    };

    probe.src = src;

    return () => {
      // Keep every frame inside the same preview area
      const stageWidth = 120;
      const stageHeight = 145;

      const [ratioWidth, ratioHeight] = aspectRatio
        .split("/")
        .map((value) => Number(value.trim()));

      const ratio =
        ratioWidth > 0 && ratioHeight > 0 ? ratioWidth / ratioHeight : 1;

      const frameWidth = Math.min(stageWidth, stageHeight * ratio);
      const frameHeight = frameWidth / ratio;
      active = false;
    };
  }, [src]);
  // Calculate frame dimensions within a common preview area
  const stageWidth = 120;
  const stageHeight = 145;

  const [ratioWidth, ratioHeight] = aspectRatio
    .split("/")
    .map((value) => Number(value.trim()));

  const ratio =
    ratioWidth > 0 && ratioHeight > 0 ? ratioWidth / ratioHeight : 1;

  const frameWidth = Math.min(stageWidth, stageHeight * ratio);
  const frameHeight = frameWidth / ratio;
  return (
    <div className="fs-variant-thumb__stage">
      <div
        className="fs-variant-thumb__moulding"
        style={{
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
        }}
      >
        <div className="fs-variant-thumb__mat">
          <div className="fs-variant-thumb__aperture">
            {!hasError ? (
              <img
                src={src}
                alt={alt}
                className="fs-variant-thumb__img"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transition: "opacity 0.25s ease",
                }}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                    setIsLoaded(true);
                    setHasError(false);
                  } else {
                    setHasError(true);
                  }
                }}
                onError={() => {
                  setHasError(true);
                  setIsLoaded(false);
                }}
              />
            ) : (
              <div
                className="fs-variant-thumb__fallback"
                title={`Pending photo for ${dimensionLabel}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive Frame Variant Selector
 * Flipkart / Amazon style variant swatch selector allowing customers
 * to toggle between 3 frame configurations in the main 3D viewer.
 */
export default function FrameVariantSelector({
  variants,
  selectedId,
  onSelect,
}: FrameVariantSelectorProps) {
  return (
    <section
      className="fs-variant-selector"
      aria-label="Frame size and aspect ratio variants"
    >
      <div className="fs-variant-selector__header">
        <div className="fs-variant-selector__title-row">
          <span className="fs-variant-selector__eyebrow">
            Frame Variants & Options
          </span>
          <span className="fs-variant-selector__active-tag">
            Option {selectedId} Active
          </span>
        </div>
        <p className="fs-variant-selector__hint">
          Select a frame option to preview dimensions and photograph in 3D:
        </p>
      </div>

      <div
        className="fs-variant-grid"
        role="radiogroup"
        aria-label="Frame options"
      >
        {variants.map((v) => {
          const isSelected = v.id === selectedId;

          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-variant-id={v.id}
              data-selected={isSelected ? "true" : "false"}
              onClick={() => onSelect(v.id)}
              className={`fs-variant-card ${
                isSelected ? "fs-variant-card--selected" : ""
              }`}
              title={`Select ${v.title} (${v.dimensionLabel} ${v.orientationLabel})`}
            >
              {/* Option Badge & Active Checkmark */}
              <div className="fs-variant-card__top">
                <span className="fs-variant-card__badge">{v.badge}</span>
                {isSelected && (
                  <span className="fs-variant-card__check" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </div>

              {/* Miniature Physical Frame Thumbnail */}
              <VariantThumbnailImage
                src={v.imageSrc}
                alt={v.imageAlt}
                aspectRatio={v.aspectRatio}
                dimensionLabel={v.dimensionLabel}
              />

              {/* Dimension & Shape Labels */}
              <div className="fs-variant-card__meta">
                <span className="fs-variant-card__dimensions">
                  {v.dimensionLabel}
                </span>
                <span className="fs-variant-card__shape">
                  {v.orientationLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
