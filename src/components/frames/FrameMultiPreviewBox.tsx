"use client";

import { useEffect, useState } from "react";

interface FrameMultiPreviewBoxProps {
  frameNumber: 2 | 3;
  title: string;
  dimensionLabel: string;
  orientationLabel: string;
  widthIn: number;
  heightIn: number;
  aspectRatio: string;
  imageSrc: string;
  imageAlt: string;
  expectedFilePath: string;
  onApply?: () => void;
}

export default function FrameMultiPreviewBox({
  frameNumber,
  title,
  dimensionLabel,
  orientationLabel,
  widthIn,
  heightIn,
  aspectRatio,
  imageSrc,
  imageAlt,
  expectedFilePath,
  onApply,
}: FrameMultiPreviewBoxProps) {
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

    probe.src = imageSrc;

    return () => {
      active = false;
    };
  }, [imageSrc]);

  return (
    <div className="fs-companion-card" data-frame-num={frameNumber}>
      {/* Header */}
      <div className="fs-companion-card__header">
        <div className="fs-companion-card__title-group">
          <span className="fs-companion-card__pill">Frame {frameNumber}</span>
          <span className="fs-companion-card__title">{title}</span>
        </div>
        <span className="fs-companion-card__dimension-badge">
          {dimensionLabel} • {orientationLabel}
        </span>
      </div>

      {/* Frame Visual Stage */}
      <div className="fs-companion-card__stage">
        <div
          className="fs-companion-frame"
          style={{ aspectRatio }}
        >
          {/* Moulding Outer Bevel */}
          <div className="fs-companion-frame__moulding">
            {/* Mat Board */}
            <div className="fs-companion-frame__mat">
              {/* Artwork Aperture */}
              <div className="fs-companion-frame__art">
                {!hasError ? (
                  <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="fs-companion-frame__img"
                    style={{
                      opacity: isLoaded ? 1 : 0,
                      transition: "opacity 0.3s ease",
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
                    ref={(el) => {
                      if (el && el.complete && (el.naturalWidth === 0 || el.naturalHeight === 0)) {
                        setHasError(true);
                      }
                    }}
                  />
                ) : (
                  <div
                    className="fs-companion-fallback"
                    role="note"
                    aria-label={`Sample image pending for Frame ${frameNumber}`}
                  >
                    <div className="fs-companion-fallback__icon" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <span className="fs-companion-fallback__title">
                      Sample Image Pending
                    </span>
                    <span className="fs-companion-fallback__path">
                      {expectedFilePath}
                    </span>
                    <span className="fs-companion-fallback__dim">
                      {widthIn} × {heightIn} in ({orientationLabel})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="fs-companion-card__footer">
        <div className="fs-companion-card__meta">
          <span className="fs-companion-card__ratio">
            Aspect Ratio: {aspectRatio.replace(" / ", ":")}
          </span>
          <span className="fs-companion-card__hint">
            {expectedFilePath.split("/").pop()}
          </span>
        </div>

        {onApply && (
          <button
            type="button"
            className="fs-companion-card__action-btn"
            onClick={onApply}
            title={`Load ${dimensionLabel} into interactive 3D studio`}
          >
            <span>Preview in 3D</span>
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
