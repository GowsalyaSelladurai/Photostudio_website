"use client";

import type { FrameColorId } from "../../types/frame";
import { FRAME_COLORS_LIST } from "../../config/frameMaterials";

interface FrameColorSelectorProps {
  value: FrameColorId;
  onChange: (color: FrameColorId) => void;
}

export default function FrameColorSelector({
  value,
  onChange,
}: FrameColorSelectorProps) {
  return (
    <section className="fs-section" aria-labelledby="fs-color-title">
      <div className="fs-section__header">
        <h2 className="fs-section__title" id="fs-color-title">
          Choose your frame colour
        </h2>
        <p className="fs-section__subtitle">
          Select from our curated architectural palette. Colours apply consistently across all profiles and materials.
        </p>
      </div>

      <div className="fs-color-grid">
        {FRAME_COLORS_LIST.map((color) => {
          const selected = value === color.id;

          return (
            <button
              key={color.id}
              type="button"
              className="fs-color-card"
              data-selected={selected}
              aria-pressed={selected}
              onClick={() => onChange(color.id)}
            >
              <div
                className="fs-color-card__swatch"
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              >
                {selected && (
                  <span className="fs-color-card__icon" aria-hidden="true">
                    ✓
                  </span>
                )}
              </div>

              <div className="fs-color-card__info">
                <strong className="fs-color-card__name">{color.name}</strong>
                <span className="fs-color-card__tagline">{color.tagline}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

