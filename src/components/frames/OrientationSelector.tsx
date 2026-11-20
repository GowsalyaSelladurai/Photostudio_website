import type { FrameOrientation } from "../../types/frame";

interface OrientationSelectorProps {
  value: FrameOrientation;
  onChange: (value: FrameOrientation) => void;
}

const OPTIONS: { id: FrameOrientation; label: string; subtitle: string }[] = [
  { id: "portrait", label: "Portrait", subtitle: "Vertical 4:5" },
  { id: "landscape", label: "Landscape", subtitle: "Horizontal 5:4" },
];

function CheckMark() {
  return (
    <span className="fs-choice__tick" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12">
        <path
          d="m3.5 8.5 3 3 6-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function OrientationSelector({
  value,
  onChange,
}: OrientationSelectorProps) {
  return (
    <fieldset className="fs-fieldset">
      <legend className="fs-section__title">Choose orientation</legend>
      <div className="fs-orientation">
        {OPTIONS.map((option) => {
          const isSelected = value === option.id;
          return (
            <label key={option.id} className="fs-choice">
              <input
                className="fs-sr-only"
                type="radio"
                name="frame-orientation"
                value={option.id}
                checked={isSelected}
                onChange={() => onChange(option.id)}
              />
              <span
                className={`fs-choice__card fs-orientation__card ${
                  isSelected ? "fs-choice__card--selected fs-orientation__card--selected" : ""
                }`}
              >
                <span
                  className="fs-orientation__glyph"
                  data-orientation={option.id}
                  aria-hidden="true"
                >
                  <span className="fs-orientation__glyph-inner" />
                </span>
                <div className="fs-orientation__text">
                  <span className="fs-orientation__label">{option.label}</span>
                  <span className="fs-orientation__subtitle">
                    {option.subtitle}
                  </span>
                </div>
                <CheckMark />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}