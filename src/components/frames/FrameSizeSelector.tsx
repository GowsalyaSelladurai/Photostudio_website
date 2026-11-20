import type { CSSProperties } from "react";
import { CUSTOM_SIZE_LIMITS, FRAME_SIZES } from "../../config/frameOptions";
import type {
  CustomDimensionsInput,
  FrameOrientation,
  FrameSizeId,
} from "../../types/frame";
import SampleArtwork from "./SampleArtwork";

interface FrameSizeSelectorProps {
  value: FrameSizeId;
  orientation: FrameOrientation;
  custom: CustomDimensionsInput;
  customError?: string;
  onChange: (value: FrameSizeId) => void;
  onCustomChange: (value: CustomDimensionsInput) => void;
}

function CheckMark() {
  return (
    <span className="fs-choice__tick" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12">
        <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function FrameSizeSelector({
  value,
  orientation,
  custom,
  customError,
  onChange,
  onCustomChange,
}: FrameSizeSelectorProps) {
  return (
    <fieldset className="fs-fieldset">
      <legend className="fs-section__title">Select frame size</legend>

      <div className="fs-sizes">
        {FRAME_SIZES.map((size) => {
          const isCustom = size.id === "custom";
          const short = size.shortSideIn ?? 0;
          const long = size.longSideIn ?? 0;
          const ratio =
            orientation === "portrait" ? short / long : long / short;

          // Proportional miniature scaling (Large 20" side scales to 66px, Small 10" side to 33px)
          const MAX_MINI_SIDE_PX = 66;
          const REFERENCE_SIDE_IN = 20;
          const miniWidthPx = !isCustom
            ? orientation === "portrait"
              ? Math.round((short / REFERENCE_SIDE_IN) * MAX_MINI_SIDE_PX)
              : Math.round((long / REFERENCE_SIDE_IN) * MAX_MINI_SIDE_PX)
            : 0;
          const miniHeightPx = !isCustom
            ? orientation === "portrait"
              ? Math.round((long / REFERENCE_SIDE_IN) * MAX_MINI_SIDE_PX)
              : Math.round((short / REFERENCE_SIDE_IN) * MAX_MINI_SIDE_PX)
            : 0;

          const miniStyle = !isCustom
            ? ({
                "--mini-w": `${miniWidthPx}px`,
                "--mini-h": `${miniHeightPx}px`,
                "--mini-ratio": ratio,
              } as CSSProperties)
            : undefined;

          return (
            <label key={size.id} className="fs-choice">
              <input
                className="fs-sr-only"
                type="radio"
                name="frame-size"
                value={size.id}
                checked={value === size.id}
                onChange={() => onChange(size.id)}
              />
              <span className="fs-choice__card fs-size">
                <span className="fs-size__visual" aria-hidden="true">
                  {isCustom ? (
                    <span className="fs-size__custom">
                      <svg viewBox="0 0 24 24" width="22" height="22">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="fs-mini" style={miniStyle}>
                      <span className="fs-mini__art">
                        <SampleArtwork />
                      </span>
                    </span>
                  )}
                </span>
                <span className="fs-size__name">{size.label}</span>
                <span className="fs-size__dims">
                  {isCustom ? "Enter dimensions" : `${short} × ${long} in`}
                </span>
                <CheckMark />
              </span>
            </label>
          );
        })}
      </div>

      {value === "custom" && (
        <div className="fs-custom">
          <div className="fs-custom__fields">
            <label className="fs-field">
              <span>Width (in)</span>
              <input
                type="number"
                inputMode="decimal"
                min={CUSTOM_SIZE_LIMITS.minIn}
                max={CUSTOM_SIZE_LIMITS.maxIn}
                step="0.25"
                value={custom.width}
                onChange={(event) =>
                  onCustomChange({ ...custom, width: event.target.value })
                }
                aria-invalid={Boolean(customError)}
              />
            </label>
            <label className="fs-field">
              <span>Height (in)</span>
              <input
                type="number"
                inputMode="decimal"
                min={CUSTOM_SIZE_LIMITS.minIn}
                max={CUSTOM_SIZE_LIMITS.maxIn}
                step="0.25"
                value={custom.height}
                onChange={(event) =>
                  onCustomChange({ ...custom, height: event.target.value })
                }
                aria-invalid={Boolean(customError)}
              />
            </label>
          </div>
          <p className={customError ? "fs-error" : "fs-hint"} role={customError ? "alert" : undefined}>
            {customError ??
              `Between ${CUSTOM_SIZE_LIMITS.minIn} and ${CUSTOM_SIZE_LIMITS.maxIn} inches. Portrait or Landscape follows your width and height.`}
          </p>
        </div>
      )}
    </fieldset>
  );
}