import type { FrameOrientation } from "../../types/frame";

interface OrientationSelectorProps {
  value: FrameOrientation;
  onChange: (value: FrameOrientation) => void;
}

const OPTIONS: { id: FrameOrientation; label: string }[] = [
  { id: "portrait", label: "Portrait" },
  { id: "landscape", label: "Landscape" },
];

function CheckMark() {
  return (
    <span className="fs-choice__tick" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12">
        <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function OrientationSelector({ value, onChange }: OrientationSelectorProps) {
  return (
    <fieldset className="fs-fieldset">
      <legend className="fs-section__title">Choose orientation</legend>
      <div className="fs-orientation">
        {OPTIONS.map((option) => (
          <label key={option.id} className="fs-choice">
            <input
              className="fs-sr-only"
              type="radio"
              name="frame-orientation"
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
            />
            <span className="fs-choice__card fs-orientation__card">
              <span
                className="fs-orientation__glyph"
                data-orientation={option.id}
                aria-hidden="true"
              />
              <span className="fs-orientation__label">{option.label}</span>
              <CheckMark />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}