"use client";

import { useState } from "react";
import type {
  FrameColorId,
  FrameDesignId,
  FrameMaterialId,
} from "../../types/frame";
import {
  FRAME_MATERIALS,
  FRAME_COLORS,
  FRAME_COLORS_LIST,
} from "../../config/frameMaterials";
import {
  FRAME_PROFILE_DESIGNS,
  FRAME_DESIGNS_LIST,
} from "../../config/frameOptions";

export type DesignSubTab = "profile" | "material" | "color";

interface FrameDesignStepProps {
  frameDesign: FrameDesignId;
  frameMaterial: FrameMaterialId;
  frameColor: FrameColorId;
  onDesignChange: (design: FrameDesignId) => void;
  onMaterialChange: (material: FrameMaterialId) => void;
  onColorChange: (color: FrameColorId) => void;
}

export function FrameDesignStep({
  frameDesign,
  frameMaterial,
  frameColor,
  onDesignChange,
  onMaterialChange,
  onColorChange,
}: FrameDesignStepProps) {
  const [activeSubTab, setActiveSubTab] = useState<DesignSubTab>("profile");

  const currentProfile = FRAME_PROFILE_DESIGNS[frameDesign];
  const currentColor = FRAME_COLORS[frameColor];
  const currentMaterial = FRAME_MATERIALS.find((m) => m.id === frameMaterial);

  return (
    <section className="fs-section" aria-labelledby="fs-design-title">
      <div className="fs-section__header">
        <h2 className="fs-section__title" id="fs-design-title">
          Frame Design & Appearance
        </h2>
        <p className="fs-section__subtitle">
          Curate every detail of your moulding, substrate, and colour.
        </p>
      </div>

      {/* Segmented Sub-Tab Switcher */}
      <div className="fs-subtabs" role="tablist" aria-label="Design options">
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === "profile"}
          className="fs-subtab"
          data-active={activeSubTab === "profile"}
          onClick={() => setActiveSubTab("profile")}
        >
          <span className="fs-subtab__label">1. Profile</span>
          <span className="fs-subtab__pill">{currentProfile?.name ?? "Profile"}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === "material"}
          className="fs-subtab"
          data-active={activeSubTab === "material"}
          onClick={() => setActiveSubTab("material")}
        >
          <span className="fs-subtab__label">2. Material</span>
          <span className="fs-subtab__pill">{currentMaterial?.name ?? "Material"}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === "color"}
          className="fs-subtab"
          data-active={activeSubTab === "color"}
          onClick={() => setActiveSubTab("color")}
        >
          <span className="fs-subtab__label">3. Colour</span>
          <span className="fs-subtab__pill">{currentColor?.name ?? "Colour"}</span>
        </button>
      </div>

      {/* Sub-Tab 1: Profile Selection */}
      {activeSubTab === "profile" && (
        <div className="fs-subtab-panel" role="tabpanel">
          <div className="fs-subtab-panel__header">
            <span className="fs-subtab-panel__tag">Sculpted Moulding Profiles</span>
            <p className="fs-subtab-panel__desc">
              Choose the architectural moulding shape and depth proportion.
            </p>
          </div>

          <div className="fs-profile-grid">
            {FRAME_DESIGNS_LIST.map((design) => {
              const selected = frameDesign === design.id;
              return (
                <button
                  key={design.id}
                  type="button"
                  className="fs-profile-card"
                  data-selected={selected}
                  aria-pressed={selected}
                  onClick={() => onDesignChange(design.id)}
                >
                  <div className="fs-profile-card__silhouette" aria-hidden="true">
                    {/* Architectural Profile Silhouette Diagram */}
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
        </div>
      )}

      {/* Sub-Tab 2: Substrate Material */}
      {activeSubTab === "material" && (
        <div className="fs-subtab-panel" role="tabpanel">
          <div className="fs-subtab-panel__header">
            <span className="fs-subtab-panel__tag">Substrate Material</span>
            <p className="fs-subtab-panel__desc">
              Select the core material crafted for durability and tactile quality.
            </p>
          </div>

          <div className="fs-material-grid">
            {FRAME_MATERIALS.map((material) => {
              const selected = frameMaterial === material.id;
              return (
                <button
                  key={material.id}
                  type="button"
                  className="fs-material-card"
                  data-selected={selected}
                  aria-pressed={selected}
                  onClick={() => onMaterialChange(material.id)}
                >
                  <span
                    className={`fs-material-card__swatch fs-material-card__swatch--${material.id}`}
                    aria-hidden="true"
                  />
                  <div className="fs-material-card__content">
                    <strong>{material.name}</strong>
                    <span>{material.description}</span>
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
        </div>
      )}

      {/* Sub-Tab 3: Frame Colour */}
      {activeSubTab === "color" && (
        <div className="fs-subtab-panel" role="tabpanel">
          <div className="fs-subtab-panel__header">
            <span className="fs-subtab-panel__tag">Heritage Tints & Swatches</span>
            <p className="fs-subtab-panel__desc">
              Select an architectural timber stain or hand-applied leaf tone. No extra charge.
            </p>
          </div>

          <div className="fs-color-grid">
            {FRAME_COLORS_LIST.map((color) => {
              const selected = frameColor === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  className="fs-color-swatch-card"
                  data-selected={selected}
                  aria-pressed={selected}
                  onClick={() => onColorChange(color.id)}
                >
                  <span
                    className="fs-swatch-circle"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <div className="fs-color-info">
                    <strong className="fs-color-name">{color.name}</strong>
                    <span className="fs-color-tagline">{color.tagline}</span>
                    <p className="fs-color-desc">{color.description}</p>
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
        </div>
      )}
    </section>
  );
}
