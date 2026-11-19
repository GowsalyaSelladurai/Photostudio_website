"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_ORIENTATION,
  DEFAULT_SIZE_ID,
} from "../../config/frameOptions";


import { DEFAULT_FRAME_MATERIAL } from "../../config/frameMaterials";
import { resolveFrameDimensions } from "../../lib/frameStudio";
import type {
  CustomDimensionsInput,
  FrameMaterialId,
  FrameOrientation,
  FrameSelection,
  FrameSizeId,
} from "../../types/frame";
import ArtworkUpload from "../frames/ArtworkUpload";
import FramePreview from "../frames/FramePreview";
import FrameSizeSelector from "../frames/FrameSizeSelector";
import OrientationSelector from "../frames/OrientationSelector";

interface FrameStudioHeroProps {
  /** Hook for the next phase. Receives the current selection when Continue is pressed. */
  onContinue?: (selection: FrameSelection) => void;
}

const STEPS = [
  "Size & Orientation",
  "Material & Colour",
  "Upload & Preview",
];

const TRUST_POINTS = [
  {
    label: "Premium quality frames",
    icon: <path d="M6 4h12l4 6-10 11L2 10l4-6Zm-4 6h20M9 4l3 6 3-6m-3 6v11" />,
  },
  {
    label: "Customizable options",
    icon: <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19c2-4 5-7 9-9" />,
  },
  {
    label: "Reliable delivery",
    icon: (
      <path d="M12 3 4.5 6v5.5c0 4.4 3 7.6 7.5 9.5 4.5-1.9 7.5-5.1 7.5-9.5V6L12 3Zm-3 9 2.2 2.2L15.5 10" />
    ),
  },
];

export default function FrameStudioHero({ onContinue }: FrameStudioHeroProps) {
  const [frameMaterial] = useState<FrameMaterialId>(DEFAULT_FRAME_MATERIAL);
  const [sizeId, setSizeId] = useState<FrameSizeId>(DEFAULT_SIZE_ID);
  const [orientation, setOrientation] =
    useState<FrameOrientation>(DEFAULT_ORIENTATION);
  const [custom, setCustom] = useState<CustomDimensionsInput>({
    width: "",
    height: "",
  });
  const [artwork, setArtwork] = useState<{ url: string; name: string } | null>(
    null,
  );

  const artworkUrlRef = useRef<string | null>(null);

  const dimensions = useMemo(
    () => resolveFrameDimensions(sizeId, custom, orientation),
    [sizeId, custom, orientation],
  );

  const releaseArtworkUrl = useCallback(() => {
    if (artworkUrlRef.current) {
      URL.revokeObjectURL(artworkUrlRef.current);
      artworkUrlRef.current = null;
    }
  }, []);

  useEffect(() => releaseArtworkUrl, [releaseArtworkUrl]);

  const handleArtworkSelect = useCallback(
    (file: File) => {
      releaseArtworkUrl();
      const url = URL.createObjectURL(file);
      artworkUrlRef.current = url;
      setArtwork({ url, name: file.name });
    },
    [releaseArtworkUrl],
  );

  const handleArtworkClear = useCallback(() => {
    releaseArtworkUrl();
    setArtwork(null);
  }, [releaseArtworkUrl]);

  function handleContinue() {
    onContinue?.({
      sizeId,
      orientation,
      dimensions,
      frameMaterial,
      artworkName: artwork?.name ?? null,
    });
  }

  const showCustomError = sizeId === "custom" && !dimensions.isValid;
  const customErrorVisible =
    showCustomError && (custom.width !== "" || custom.height !== "");

  return (
    <div className="fs-root">
      <div className="fs-shell">
        <header className="fs-intro">
          <h1 className="fs-intro__kicker">Made to live with</h1>
          <p className="fs-intro__title">A frame for your favorite moment.</p>
          <p className="fs-intro__lead">
            Customize your frame and see your vision come to life.
          </p>
        </header>

        <div className="fs-stage-wrap">
          <FramePreview
            widthIn={dimensions.width}
            heightIn={dimensions.height}
            orientation={orientation}
            frameMaterial={frameMaterial}
            artworkUrl={artwork?.url ?? null}
            artworkName={artwork?.name ?? null}
          />
        </div>

        <section className="fs-panel" aria-label="Customize your frame">
          <ol className="fs-steps" aria-label="Customization steps">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="fs-steps__item"
                aria-current={index === 0 ? "step" : undefined}
                data-active={index === 0}
              >
                <span className="fs-steps__dot">{index + 1}</span>
                <span className="fs-steps__label">{step}</span>
              </li>
            ))}
          </ol>

          <FrameSizeSelector
            value={sizeId}
            orientation={orientation}
            custom={custom}
            customError={
              customErrorVisible ? dimensions.errorMessage : undefined
            }
            onChange={setSizeId}
            onCustomChange={setCustom}
          />

          <OrientationSelector value={orientation} onChange={setOrientation} />

          <ArtworkUpload
            fileName={artwork?.name ?? null}
            onSelect={handleArtworkSelect}
            onClear={handleArtworkClear}
          />

          <p className="fs-note">High-quality frames, crafted to last.</p>
        </section>

        <ul className="fs-trust">
          {TRUST_POINTS.map((point) => (
            <li key={point.label} className="fs-trust__item">
              <svg
                viewBox="0 0 24 24"
                width="30"
                height="30"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {point.icon}
              </svg>
              <span>{point.label}</span>
            </li>
          ))}
        </ul>

        <div className="fs-cta">
          <button
            type="button"
            className="fs-button"
            onClick={handleContinue}
            disabled={sizeId === "custom" && !dimensions.isValid}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
