"use client";

import type { FrameMaterialId } from "../../types/frame";
import { FRAME_MATERIALS } from "../../config/frameMaterials";

interface FrameMaterialSelectorProps {
  value: FrameMaterialId;
  onChange: (material: FrameMaterialId) => void;
}

export default function FrameMaterialSelector({
  value,
  onChange,
}: FrameMaterialSelectorProps) {
  return (
    <section className="fs-section" aria-labelledby="fs-material-title">
      <div className="fs-section__header">
        <h2 className="fs-section__title" id="fs-material-title">
          Choose your frame material
        </h2>
        <p className="fs-section__subtitle">
          Select from our master framing substrates. Each offers distinct physical weight, surface texture, and optical reflections.
        </p>
      </div>

      <div className="fs-material-grid">
        {FRAME_MATERIALS.map((material) => {
          const selected = value === material.id;

          return (
            <button
              key={material.id}
              type="button"
              className="fs-material-card"
              data-selected={selected}
              aria-pressed={selected}
              onClick={() => onChange(material.id)}
            >
              <div className="fs-material-card__preview">
                <span
                  className={`fs-material-card__swatch fs-material-card__swatch--${material.id}`}
                  aria-hidden="true"
                />
                {selected && (
                  <span className="fs-material-card__check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </div>

              <div className="fs-material-card__content">
                <strong className="fs-material-card__name">{material.name}</strong>
                <span className="fs-material-card__desc">{material.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}