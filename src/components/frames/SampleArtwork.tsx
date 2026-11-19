import { useId } from "react";

/** Lakeside placeholder shown until the customer uploads their own photograph. */
export default function SampleArtwork() {
  const uid = useId().replace(/:/g, "");
  const sky = `${uid}-sky`;
  const lake = `${uid}-lake`;
  const glow = `${uid}-glow`;

  return (
    <svg
      className="fs-sample-art"
      viewBox="0 0 400 500"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fb0cf" />
          <stop offset="0.55" stopColor="#efc7a3" />
          <stop offset="1" stopColor="#f6d9b4" />
        </linearGradient>
        <linearGradient id={lake} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9b595" />
          <stop offset="1" stopColor="#6f8aa3" />
        </linearGradient>
        <radialGradient id={glow} cx="0.62" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3dc" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff3dc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#${sky})`} />
      <ellipse cx="250" cy="250" rx="190" ry="120" fill={`url(#${glow})`} />
      <path
        d="M0 262 C60 232 110 246 170 236 C230 226 300 244 400 224 V300 H0Z"
        fill="#9aa58f"
        opacity="0.75"
      />
      <path
        d="M0 284 C70 262 130 280 210 266 C290 252 340 270 400 258 V312 H0Z"
        fill="#5f7455"
      />
      <rect y="300" width="400" height="200" fill={`url(#${lake})`} />
      <path
        d="M30 330 H370 M70 352 H330 M110 376 H290"
        stroke="#fff3dc"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M60 410 H340 M100 434 H300 M140 458 H260"
        stroke="#fff3dc"
        strokeOpacity="0.22"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}