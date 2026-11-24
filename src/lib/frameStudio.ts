import {
  CUSTOM_SIZE_LIMITS,
  FALLBACK_DIMENSIONS_IN,
  FRAME_SIZES,
} from "../config/frameOptions";
import type {
  CustomDimensionsInput,
  FrameOrientation,
  FrameSizeId,
  ResolvedFrameDimensions,
} from "../types/frame";

export function formatInches(value: number): string {
  return String(Number(value.toFixed(2)));
}

function orient(
  short: number,
  long: number,
  orientation: FrameOrientation,
): { width: number; height: number } {
  return orientation === "portrait"
    ? { width: short, height: long }
    : { width: long, height: short };
}

export function resolveFrameDimensions(
  sizeId: FrameSizeId,
  custom: CustomDimensionsInput,
  orientation: FrameOrientation,
): ResolvedFrameDimensions {
  const preset = FRAME_SIZES.find((size) => size.id === sizeId);

  if (preset?.shortSideIn && preset.longSideIn) {
    return {
      ...orient(preset.shortSideIn, preset.longSideIn, orientation),
      isValid: true,
    };
  }

  const a = Number(custom.width);
  const b = Number(custom.height);
  const { minIn, maxIn } = CUSTOM_SIZE_LIMITS;
  const filled = custom.width.trim() !== "" && custom.height.trim() !== "";
  const inRange = (n: number) => Number.isFinite(n) && n >= minIn && n <= maxIn;

  if (filled && inRange(a) && inRange(b)) {
    // Custom sizes are used exactly as entered: width stays width, height stays height.
    return { width: a, height: b, isValid: true };
  }

  return {
    ...orient(
      FALLBACK_DIMENSIONS_IN.short,
      FALLBACK_DIMENSIONS_IN.long,
      orientation,
    ),
    isValid: false,
    errorMessage: filled
      ? `Enter sizes between ${minIn} and ${maxIn} inches.`
      : "Enter both width and height to preview your size.",
  };
}

/* ------------------------------------------------------------------ */
/* Preview layout: converts physical inches into on-screen pixels.      */
/* Inches never leave this module as CSS values; only pixels do.        */
/* ------------------------------------------------------------------ */

/** Preset frames are drawn at a shared scale so Small looks smaller than Large. */
export const PREVIEW_REFERENCE_SIDE_IN = 22;

const MOULDING_MAX_IN = 0.75;
const MOULDING_SHORT_SIDE_RATIO = 0.07;
const MAT_MAX_IN = 0;
const MAT_SHORT_SIDE_RATIO = 0;
const MIN_BORDER_PX = 1.5;

export interface PreviewLayout {
  /** Rendered frame size in CSS pixels. widthPx / heightPx === widthIn / heightIn. */
  widthPx: number;
  heightPx: number;
  pixelsPerInch: number;
  /** Wood border thickness in CSS pixels, identical on all four sides. */
  mouldingPx: number;
  /** Mat thickness in CSS pixels, identical on all four sides. */
  matPx: number;
}

/**
 * Contain-fit: one uniform pixels-per-inch factor is applied to both axes, so the
 * frame can never be stretched. Border thickness derives from the same factor.
 */
export function computePreviewLayout(
  widthIn: number,
  heightIn: number,
  availableWidthPx: number,
  availableHeightPx: number,
): PreviewLayout | null {
  if (
    !(widthIn > 0) ||
    !(heightIn > 0) ||
    !(availableWidthPx > 0) ||
    !(availableHeightPx > 0)
  ) {
    return null;
  }

  const containPpi = Math.min(availableWidthPx / widthIn, availableHeightPx / heightIn);
  const referencePpi =
    Math.min(availableWidthPx, availableHeightPx) / PREVIEW_REFERENCE_SIDE_IN;
  const pixelsPerInch = Math.min(containPpi, referencePpi);

  const { widthPx, heightPx } = snapToLayoutGrid(
    widthIn,
    heightIn,
    widthIn * pixelsPerInch,
    heightIn * pixelsPerInch,
  );
  const exactPixelsPerInch = widthPx / widthIn;

  const shortSideIn = Math.min(widthIn, heightIn);
  const mouldingIn = Math.min(MOULDING_MAX_IN, shortSideIn * MOULDING_SHORT_SIDE_RATIO);
  const matIn = Math.min(MAT_MAX_IN, shortSideIn * MAT_SHORT_SIDE_RATIO);

  return {
    widthPx,
    heightPx,
    pixelsPerInch: exactPixelsPerInch,
    mouldingPx: Math.max(MIN_BORDER_PX, mouldingIn * exactPixelsPerInch),
    matPx: Math.max(MIN_BORDER_PX, matIn * exactPixelsPerInch),
  };
}

/* Browsers lay boxes out on a 1/64 px grid. Rounding width and height independently
   would nudge the ratio (a 40 x 4 frame can drift by ~0.14 px). Instead we reduce the
   ratio to whole numbers p:q and pick sizes p*m/64 and q*m/64, which sit exactly on the
   grid and keep the ratio exact. If the reduced ratio is too fine to do that within
   1 px, we keep the unsnapped (still uniform) sizes. */
const LAYOUT_UNIT_PX = 1 / 64;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function snapToLayoutGrid(
  widthIn: number,
  heightIn: number,
  targetWidthPx: number,
  targetHeightPx: number,
): { widthPx: number; heightPx: number } {
  const a = Math.round(widthIn * 100);
  const b = Math.round(heightIn * 100);
  const isWhole = Math.abs(a - widthIn * 100) < 1e-6 && Math.abs(b - heightIn * 100) < 1e-6;
  if (!isWhole || a <= 0 || b <= 0) {
    return { widthPx: targetWidthPx, heightPx: targetHeightPx };
  }

  const divisor = gcd(a, b);
  const p = a / divisor;
  const q = b / divisor;
  if (Math.max(p, q) > 64) {
    return { widthPx: targetWidthPx, heightPx: targetHeightPx };
  }

  const steps = Math.floor(
    Math.min(targetWidthPx / (p * LAYOUT_UNIT_PX), targetHeightPx / (q * LAYOUT_UNIT_PX)),
  );
  if (steps < 1) {
    return { widthPx: targetWidthPx, heightPx: targetHeightPx };
  }

  return { widthPx: p * steps * LAYOUT_UNIT_PX, heightPx: q * steps * LAYOUT_UNIT_PX };
}