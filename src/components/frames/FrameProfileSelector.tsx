"use client";

import type { FrameDesignId } from "../../types/frame";
import { FRAME_DESIGNS_LIST } from "../../config/frameOptions";

interface FrameProfileSelectorProps {
  value: FrameDesignId;
  onChange: (design: FrameDesignId) => void;
}

export default function FrameProfileSelector({
  value,
  onChange,
}: FrameProfileSelectorProps) {
  return (
    <section className="fs-section" aria-labelledby="fs-profile-title">
      <div className="fs-section__header">
        <h2 className="fs-section__title" id="fs-profile-title">
          Choose your frame profile
        </h2>
        <p className="fs-section__subtitle">
          Select the architectural moulding profile and depth proportion.
        </p>
      </div>

      <div className="fs-profile-grid">
        {FRAME_DESIGNS_LIST.map((design) => {
          const selected = value === design.id;

          return (
            <button
              key={design.id}
              type="button"
              className="fs-profile-card"
              data-selected={selected}
              aria-pressed={selected}
              onClick={() => onChange(design.id)}
            >
              <div className="fs-profile-card__silhouette" aria-hidden="true">
                <svg viewBox="0 0 120 40" fill="none" className="fs-profile-svg">
                  {design.id === "modern_flat" && (
                    <path
                      d="M10 32 V 12 H 110 V 32"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  )}
                  {design.id === "classic_bevel" && (
                    <path
                      d="M10 32 V 10 L 110 24 V 32"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}
                  {design.id === "gallery_style" && (
                    <path
                      d="M25 34 V 8 H 95 V 34"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  )}
                  {design.id === "ornate_decorative" && (
                    <path
                      d="M10 32 V 16 Q 20 8 32 12 Q 50 20 70 14 Q 90 8 110 26 V 32"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                  )}
                  {design.id === "shadow_box" && (
                    <path
                      d="M10 34 V 6 H 35 V 26 H 85 V 6 H 110 V 34"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}
                  {design.id === "rounded_edge" && (
                    <path
                      d="M10 32 C 10 10, 40 8, 60 8 C 80 8, 110 16, 110 32"
                      stroke="currentColor"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </div>

              <div className="fs-profile-card__info">
                <div className="fs-profile-card__head">
                  <strong className="fs-profile-card__name">{design.name}</strong>
                  <span className="fs-profile-card__depth">
                    {design.depthIn}&quot; depth
                  </span>
                </div>
                <span className="fs-profile-card__tagline">{design.tagline}</span>
                <p className="fs-profile-card__desc">{design.description}</p>
              </div>

              {selected && (
                <span className="fs-check-badge" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

