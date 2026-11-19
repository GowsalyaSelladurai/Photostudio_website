"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_FRAME_DESIGN,
  DEFAULT_GLAZING_TYPE,
  DEFAULT_ORIENTATION,
  DEFAULT_SIZE_ID,
  FRAME_PROFILE_DESIGNS,
} from "../../config/frameOptions";

import {
  DEFAULT_FRAME_MATERIAL,
  DEFAULT_FRAME_COLOR,
} from "../../config/frameMaterials";

import { resolveFrameDimensions } from "../../lib/frameStudio";
import { calculateFramePrice } from "../../config/framePricing";

import type {
  CustomDimensionsInput,
  FrameColorId,
  FrameDesignId,
  FrameMaterialId,
  FrameOrientation,
  FrameSelection,
  FrameSizeId,
  GlazingTypeId,
} from "../../types/frame";

import Frame3DPreview from "./Frame3DPreview";
import FrameVariantSelector, { type FrameVariant } from "./FrameVariantSelector";
import FrameSizeSelector from "./FrameSizeSelector";
import OrientationSelector from "./OrientationSelector";
import FrameProfileSelector from "./FrameProfileSelector";
import FrameMaterialSelector from "./FrameMaterialSelector";
import FrameColorSelector from "./FrameColorSelector";
import ArtworkUpload from "./ArtworkUpload";
import { downloadFramePreviewPdf } from "../../lib/framePdfExport";
import {
  FRAME_MATERIALS,
  FRAME_COLORS,
} from "../../config/frameMaterials";

interface FrameStudioProps {
  onContinue?: (selection: FrameSelection) => void;
}

const STEPS = [
  "Size & Orientation",
  "Frame Profile",
  "Frame Material",
  "Frame Colour",
  "Artwork & Pricing",
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

const DEFAULT_PORTRAIT_ARTWORK_URL = "/images/default-frame-photo.jpeg";
const DEFAULT_LANDSCAPE_ARTWORK_URL = "/images/booking-editorial.png";
const DEFAULT_ARTWORK_URL = DEFAULT_PORTRAIT_ARTWORK_URL;

export default function FrameStudio({ onContinue }: FrameStudioProps) {
  const [sizeId, setSizeId] = useState<FrameSizeId>(DEFAULT_SIZE_ID);

  const [orientation, setOrientation] =
    useState<FrameOrientation>(DEFAULT_ORIENTATION);

  const [custom, setCustom] = useState<CustomDimensionsInput>({
    width: "",
    height: "",
  });

  const [activeStep, setActiveStep] = useState(0);

  const [frameDesign, setFrameDesign] =
    useState<FrameDesignId>(DEFAULT_FRAME_DESIGN);

  const [frameMaterial, setFrameMaterial] =
    useState<FrameMaterialId>(DEFAULT_FRAME_MATERIAL);

  const [frameColor, setFrameColor] =
    useState<FrameColorId>(DEFAULT_FRAME_COLOR);

  const [glazingType] =
    useState<GlazingTypeId>(DEFAULT_GLAZING_TYPE);

  const [artwork, setArtwork] = useState<{
    url: string;
    name: string;
  }>({
    url: DEFAULT_ARTWORK_URL,
    name: "Sample artwork",
  });

  const [photoZoom, setPhotoZoom] = useState(1);

  const [photoPosition, setPhotoPosition] = useState({
    x: 50,
    y: 50,
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportFrameRef = useRef<
    ((options?: { triggerDownload?: boolean }) => Promise<string | null>) | null
  >(null);

  const dimensions = useMemo(
    () => resolveFrameDimensions(sizeId, custom, orientation),
    [sizeId, custom, orientation],
  );

  const priceBreakdown = useMemo(
    () => calculateFramePrice(frameDesign, frameMaterial),
    [frameDesign, frameMaterial],
  );

  const customDriven =
    sizeId === "custom" &&
    dimensions.isValid &&
    dimensions.width !== dimensions.height;

  const effectiveOrientation: FrameOrientation = customDriven
    ? dimensions.width > dimensions.height
      ? "landscape"
      : "portrait"
    : orientation;

  // Selected variant state: Option 1 is default
  const [selectedVariantId, setSelectedVariantId] = useState<1 | 2 | 3>(1);

  // Exactly three frame variants (Option 1: active customized frame, Option 2: 12x12 square, Option 3: 18x12 landscape)
  const frameVariants: FrameVariant[] = useMemo(() => {
    return [
      {
        id: 1,
        badge: "Option 1",
        title: "Classic Studio Frame",
        dimensionLabel: `${dimensions.width} × ${dimensions.height} in`,
        orientationLabel:
          effectiveOrientation === "portrait" ? "Portrait" : "Landscape",
        widthIn: dimensions.width,
        heightIn: dimensions.height,
        aspectRatio: `${dimensions.width} / ${dimensions.height}`,
        imageSrc: artwork?.url ?? DEFAULT_PORTRAIT_ARTWORK_URL,
        imageAlt: "Option 1 Classic Studio Frame",
      },
      {
        id: 2,
        badge: "Option 2",
        title: "Square Gallery Frame",
        dimensionLabel: "12 × 12 in",
        orientationLabel: "Square",
        widthIn: 12,
        heightIn: 12,
        aspectRatio: "1 / 1",
        imageSrc: "/images/frame-preview-2.jpeg",
        imageAlt: "Option 2 Square Gallery Frame",
      },
      {
        id: 3,
        badge: "Option 3",
        title: "Landscape Editorial Frame",
        dimensionLabel: "18 × 12 in",
        orientationLabel: "Landscape",
        widthIn: 18,
        heightIn: 12,
        aspectRatio: "18 / 12",
        imageSrc: "/images/frame-preview-3.jpeg",
        imageAlt: "Option 3 Landscape Editorial Frame",
      },
    ];
  }, [dimensions, effectiveOrientation, artwork?.url]);

  const activeVariant =
    frameVariants.find((v) => v.id === selectedVariantId) ?? frameVariants[0];

  function handleOrientationChange(next: FrameOrientation) {
    if (customDriven && next !== effectiveOrientation) {
      setCustom({
        width: custom.height,
        height: custom.width,
      });
    }

    setOrientation(next);
    setSelectedVariantId(1);

    // If using default sample artwork, seamlessly adapt between the master portrait and landscape photographs
    setArtwork((previous) => {
      if (previous.name === "Sample artwork") {
        return {
          url:
            next === "landscape"
              ? DEFAULT_LANDSCAPE_ARTWORK_URL
              : DEFAULT_PORTRAIT_ARTWORK_URL,
          name: "Sample artwork",
        };
      }
      return previous;
    });
  }

  function handleSizeChange(next: FrameSizeId) {
    if (sizeId === "custom" && next !== "custom") {
      setOrientation(effectiveOrientation);
    }

    setSizeId(next);
    setSelectedVariantId(1);
  }

  function handleArtworkUpload(file: File) {
    setArtwork((previous) => {
      if (previous.url.startsWith("blob:")) {
        URL.revokeObjectURL(previous.url);
      }

      return {
        url: URL.createObjectURL(file),
        name: file.name,
      };
    });

    setPhotoZoom(1);
    setPhotoPosition({ x: 50, y: 50 });
    setSelectedVariantId(1);
  }

  function handleArtworkRemove() {
    setArtwork((previous) => {
      if (previous.url.startsWith("blob:")) {
        URL.revokeObjectURL(previous.url);
      }

      return {
        url:
          effectiveOrientation === "landscape"
            ? DEFAULT_LANDSCAPE_ARTWORK_URL
            : DEFAULT_PORTRAIT_ARTWORK_URL,
        name: "Sample artwork",
      };
    });

    setPhotoZoom(1);
    setPhotoPosition({ x: 50, y: 50 });
    setSelectedVariantId(1);
  }

  useEffect(() => {
    return () => {
      if (artwork?.url.startsWith("blob:")) {
        URL.revokeObjectURL(artwork.url);
      }
    };
  }, [artwork]);

  const customInvalid = sizeId === "custom" && !dimensions.isValid;

  const customErrorVisible =
    customInvalid && (custom.width !== "" || custom.height !== "");

  async function handleDownloadFramePng() {
    if (!exportFrameRef.current) {
      setExportError(
        "3D preview is still preparing. Please wait a moment and try again.",
      );
      return;
    }

    setIsExportingPng(true);
    setExportError(null);
    try {
      await exportFrameRef.current({ triggerDownload: true });
    } catch (err) {
      console.error("Frame PNG export failed:", err);
      setExportError(
        "Unable to export custom frame image. Please try again.",
      );
    } finally {
      setIsExportingPng(false);
    }
  }

  async function handleDownloadPdf() {
    setIsGeneratingPdf(true);
    setExportError(null);
    try {
      const profile = FRAME_PROFILE_DESIGNS[frameDesign];
      const material = FRAME_MATERIALS.find((m) => m.id === frameMaterial);
      const color = FRAME_COLORS[frameColor];

      let productDataUrl: string | undefined = undefined;
      if (exportFrameRef.current) {
        try {
          const url = await exportFrameRef.current({ triggerDownload: false });
          if (url) productDataUrl = url;
        } catch (captureErr) {
          console.warn("Could not capture product image for PDF:", captureErr);
        }
      }

      await downloadFramePreviewPdf({
        profileName: profile?.name ?? "Custom Profile",
        profileDepth: `${profile?.depthIn ?? 0.85}" depth`,
        materialName: material?.name ?? "Solid Wood",
        materialDescription: material?.description ?? "",
        colorName: color?.name ?? "Frame Colour",
        colorHex: color?.hex ?? "#4E2D18",
        sizeLabel: sizeId.toUpperCase(),
        dimensionsText: `${dimensions.width}" × ${dimensions.height}"`,
        orientation:
          effectiveOrientation === "portrait" ? "Portrait" : "Landscape",
        artworkName: artwork?.name ?? null,
        basePriceText: priceBreakdown.formattedBasePrice,
        materialExtraText: priceBreakdown.formattedMaterialExtra,
        totalPriceText: priceBreakdown.formattedTotalPrice,
        priceText: priceBreakdown.formattedTotalPrice,
        customImageDataUrl: productDataUrl,
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
      setExportError(
        "Unable to generate PDF preview. Please ensure the 3D preview is visible and try again.",
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function handleContinue() {
    if (customInvalid) return;

    if (activeStep < STEPS.length - 1) {
      setActiveStep((current) => current + 1);
      return;
    }

    onContinue?.({
      sizeId,
      orientation: effectiveOrientation,
      dimensions,
      frameMaterial,
      frameDesign,
      frameColor,
      glazingType,
      artworkName: artwork?.name ?? null,
    });
  }

  return (
    <div className="fs-root">
      <div className="fs-shell">
        <header className="fs-intro">
          <span className="fs-intro__kicker">Bespoke Architectural Framing</span>

          <h1 className="fs-intro__title">A frame for your favorite moment.</h1>

          <p className="fs-intro__lead">
            Customize your frame with architectural mouldings, master substrates, and artisanal finishes in real-time.
          </p>
        </header>

        <div className="fs-stage-wrap">
          {/* Frame 1: Primary Interactive 3D Frame Preview (Unchanged behavior & appearance) */}
          <div className="fs-stage-primary">
            <div className="fs-stage-primary__header">
              <div className="fs-stage-primary__title-group">
                <span className="fs-stage-primary__pill">{activeVariant.badge}</span>
                <span className="fs-stage-primary__title">
                  {activeVariant.title}
                </span>
              </div>
              <span className="fs-stage-primary__dimension-badge">
                {activeVariant.dimensionLabel} • {activeVariant.orientationLabel}
              </span>
            </div>

            <Frame3DPreview
              key={`preview-variant-${selectedVariantId}-${activeVariant.widthIn}-${activeVariant.heightIn}`}
              widthIn={activeVariant.widthIn}
              heightIn={activeVariant.heightIn}
              frameMaterial={frameMaterial}
              frameDesign={frameDesign}
              frameColor={frameColor}
              glazingType={glazingType}
              artworkUrl={activeVariant.imageSrc}
              photoZoom={photoZoom}
              photoPosition={photoPosition}
              onPhotoPositionChange={setPhotoPosition}
              onRegisterExport={(fn) => {
                exportFrameRef.current = fn;
              }}
            />
          </div>

          {/* Three Small Frame Option Thumbnails (Variant Selector) */}
          <FrameVariantSelector
            variants={frameVariants}
            selectedId={selectedVariantId}
            onSelect={(id) => setSelectedVariantId(id)}
          />
        </div>

        <section className="fs-panel" aria-labelledby="fs-create-title">
          <div className="fs-panel__header">
            <div className="fs-panel__title-wrap">
              <h2 className="fs-panel__title" id="fs-create-title">
                Create your frame
              </h2>
              <span className="fs-panel__step-badge">
                Step {activeStep + 1} of {STEPS.length}
              </span>
            </div>
          </div>

          <ol className="fs-steps" aria-label="Customization steps">
            {STEPS.map((step, index) => {
              const isCompleted = index < activeStep;
              const isActive = index === activeStep;

              return (
                <li
                  key={step}
                  className="fs-steps__item"
                  aria-current={isActive ? "step" : undefined}
                  data-active={isActive}
                  data-completed={isCompleted}
                  onClick={() => {
                    if (index <= activeStep || !customInvalid) {
                      setActiveStep(index);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <span className="fs-steps__dot">
                    {isCompleted ? "✓" : index + 1}
                  </span>

                  <span className="fs-steps__label">{step}</span>
                </li>
              );
            })}
          </ol>

          {/* Step 0: Size & Orientation */}
          {activeStep === 0 && (
            <>
              <FrameSizeSelector
                value={sizeId}
                orientation={effectiveOrientation}
                custom={custom}
                customError={
                  customErrorVisible ? dimensions.errorMessage : undefined
                }
                onChange={handleSizeChange}
                onCustomChange={setCustom}
              />

              <OrientationSelector
                value={effectiveOrientation}
                onChange={handleOrientationChange}
              />

              <p className="fs-note">High-quality frames, crafted to last.</p>
            </>
          )}

          {/* Step 1: Frame Profile */}
          {activeStep === 1 && (
            <FrameProfileSelector
              value={frameDesign}
              onChange={setFrameDesign}
            />
          )}

          {/* Step 2: Frame Material */}
          {activeStep === 2 && (
            <FrameMaterialSelector
              value={frameMaterial}
              onChange={setFrameMaterial}
            />
          )}

          {/* Step 3: Frame Colour */}
          {activeStep === 3 && (
            <FrameColorSelector
              value={frameColor}
              onChange={setFrameColor}
            />
          )}

          {/* Step 4: Final Page - Artwork, Preview & Final Pricing Breakdown */}
          {activeStep === 4 && (
            <>
              <div className="fs-artwork-section">
                <div className="fs-section__header">
                  <h3 className="fs-section__title">Artwork & Photograph</h3>
                  <p className="fs-section__subtitle">
                    Upload your photograph and adjust its positioning and crop inside the mat.
                  </p>
                </div>

                <ArtworkUpload
                  fileName={artwork?.name ?? null}
                  onSelect={handleArtworkUpload}
                  onClear={handleArtworkRemove}
                />

                <div className="fs-art-controls">
                  <label className="fs-art-controls__zoom">
                    <span>Photo zoom</span>

                    <input
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.05"
                      value={photoZoom}
                      onChange={(event) =>
                        setPhotoZoom(Number(event.target.value))
                      }
                    />
                  </label>

                  <label className="fs-art-controls__zoom">
                    <span>Horizontal position</span>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={photoPosition.x}
                      onChange={(event) =>
                        setPhotoPosition((current) => ({
                          ...current,
                          x: Number(event.target.value),
                        }))
                      }
                    />
                  </label>

                  <label className="fs-art-controls__zoom">
                    <span>Vertical position</span>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={photoPosition.y}
                      onChange={(event) =>
                        setPhotoPosition((current) => ({
                          ...current,
                          y: Number(event.target.value),
                        }))
                      }
                    />
                  </label>

                  <button
                    type="button"
                    className="fs-link-button"
                    onClick={() => {
                      setPhotoZoom(1);
                      setPhotoPosition({ x: 50, y: 50 });
                    }}
                  >
                    Reset photo
                  </button>
                </div>

                <p className="fs-note">
                  Your photograph will appear inside your selected frame. Drag it
                  to adjust its position.
                </p>
              </div>

              {/* Final Pricing Breakdown Card - Displayed Exclusively on Final Page */}
              <div className="fs-pricing-card" aria-label="Custom Frame Pricing Summary">
                <div className="fs-pricing-card__header">
                  <div className="fs-pricing-card__title-group">
                    <span className="fs-pricing-card__title">Investment Summary</span>
                    <span className="fs-pricing-card__subtitle">Artisan handcrafted quotation</span>
                  </div>
                  <span className="fs-pricing-card__total-price">
                    {priceBreakdown.formattedTotalPrice}
                  </span>
                </div>
                <div className="fs-pricing-card__breakdown">
                  <div className="fs-pricing-card__row">
                    <span className="fs-pricing-card__label">Selected Frame Profile</span>
                    <span className="fs-pricing-card__value">
                      {priceBreakdown.profileName}
                    </span>
                  </div>
                  <div className="fs-pricing-card__row">
                    <span className="fs-pricing-card__label">Selected Frame Material</span>
                    <span className="fs-pricing-card__value">
                      {priceBreakdown.materialName}
                    </span>
                  </div>
                  <div className="fs-pricing-card__row">
                    <span className="fs-pricing-card__label">Selected Frame Colour</span>
                    <span className="fs-pricing-card__value">
                      {FRAME_COLORS[frameColor]?.name ?? frameColor}
                    </span>
                  </div>
                  <div className="fs-pricing-card__row">
                    <span className="fs-pricing-card__label">Frame base price</span>
                    <span className="fs-pricing-card__value">
                      {priceBreakdown.formattedBasePrice}
                    </span>
                  </div>
                  <div className="fs-pricing-card__row">
                    <span className="fs-pricing-card__label">Material extra charge</span>
                    <span className="fs-pricing-card__value">
                      {priceBreakdown.formattedMaterialExtra}
                    </span>
                  </div>
                  <div className="fs-pricing-card__row fs-pricing-card__row--total">
                    <span className="fs-pricing-card__label">Total Price</span>
                    <span className="fs-pricing-card__value">
                      {priceBreakdown.formattedTotalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <ul className="fs-trust">
          {TRUST_POINTS.map((point) => (
            <li key={point.label} className="fs-trust__item">
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
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
          {activeStep > 0 && (
            <button
              type="button"
              className="fs-button fs-button--secondary"
              onClick={() => setActiveStep((current) => current - 1)}
            >
              Back
            </button>
          )}

          {activeStep < STEPS.length - 1 ? (
            <button
              type="button"
              className="fs-button fs-button--primary"
              disabled={activeStep === 0 && customInvalid}
              onClick={handleContinue}
            >
              Continue
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                width: "100%",
              }}
            >
              <button
                type="button"
                className="fs-button fs-button--primary"
                disabled={isExportingPng}
                onClick={handleDownloadFramePng}
              >
                {isExportingPng
                  ? "Rendering Custom Frame..."
                  : "Download Custom Frame (PNG)"}
              </button>

              <button
                type="button"
                className="fs-button fs-button--secondary"
                disabled={isGeneratingPdf}
                onClick={handleDownloadPdf}
              >
                {isGeneratingPdf
                  ? "Generating Specification PDF..."
                  : "Download Specification (PDF)"}
              </button>

              {onContinue && (
                <button
                  type="button"
                  className="fs-button fs-button--secondary"
                  onClick={handleContinue}
                >
                  Continue with this frame
                </button>
              )}

              {exportError && (
                <p
                  className="fs-error-banner"
                  role="alert"
                  style={{
                    color: "#A94442",
                    fontSize: "0.85rem",
                    margin: "4px 0 0",
                    background: "#F2DEDE",
                    padding: "8px 12px",
                    borderRadius: "6px",
                  }}
                >
                  {exportError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
