/**
 * Mathematical models and interpolation functions for StudioFrame
 * realistic 3D hardcover opening and closing cinematic animations.
 */

import { getAlbumSizeOption } from "@/config/album.config";

export interface BookPhysicalDimensions {
  pageWidth: number;
  pageHeight: number;
  spreadWidth: number;
  aspectRatio: number;
  boardThickness: number;
  overhangX: number;
  overhangY: number;
  stackDepth: number;
  spineWidth: number;
  cameraDistance: number;
}

export function computeBookDimensions(
  sizeId: string,
  pageCount: number,
): BookPhysicalDimensions {
  const sizeConfig = getAlbumSizeOption(sizeId);

  const scalePerInch = 0.22;
  const pageWidth = sizeConfig.width * scalePerInch;
  const pageHeight = sizeConfig.height * scalePerInch;
  const spreadWidth = pageWidth * 2;
  const aspectRatio = sizeConfig.width / sizeConfig.height;

  // Proportional hardcover thickness and square overhang
  const boardThickness = 0.035;
  const overhangX = 0.05 * (pageWidth / 1.8);
  const overhangY = 0.05 * (pageHeight / 1.8);

  // Stack depth increases naturally with page count (20 to 60 pages)
  const clampedPages = Math.max(20, Math.min(60, pageCount));
  const stackDepth = 0.03 + (clampedPages - 20) * 0.0015;
  const spineWidth = stackDepth * 1.6 + 0.08;

  // Camera framing distance strictly preserving true visual proportions and aspect ratio
  // Field of view is vertical 30 deg. tan(15 deg) = 0.26795.
  const totalW = spreadWidth + overhangX * 2 + 0.12;
  const totalH = pageHeight + overhangY * 2 + 0.12;
  const tanHalfFov = Math.tan((30 * Math.PI) / 360);
  // Target: open book occupies ~78-82% of preview width on standard desktop (~1.62 aspect viewport)
  const distForWidth = totalW / (0.80 * 2 * tanHalfFov * 1.62);
  // Height target: spread occupies ~75-80% of preview height with natural reading tilt
  const distForHeight = (totalH * 0.88) / (0.78 * 2 * tanHalfFov);
  const cameraDistance = Math.max(distForWidth, distForHeight, 2.2);

  return {
    pageWidth,
    pageHeight,
    spreadWidth,
    aspectRatio,
    boardThickness,
    overhangX,
    overhangY,
    stackDepth,
    spineWidth,
    cameraDistance,
  };
}

export function getTotalSpreads(pageCount: number): number {
  return Math.max(1, Math.ceil(pageCount / 2));
}

export function getSpreadPageIndices(
  spreadIndex: number,
  totalPages: number,
): { leftIndex: number; rightIndex: number } {
  const leftIndex = spreadIndex * 2;
  const rightIndex = leftIndex + 1 < totalPages ? leftIndex + 1 : -1;
  return { leftIndex, rightIndex };
}

export type BookViewState = "closed" | "opening" | "opened" | "closing";

export const COVER_ANIMATION_DURATION_SECONDS = 1.4;

/**
 * Natural ease-in / ease-out cosine easing function.
 * Smooth acceleration from rest and gentle deceleration into rest with zero jerk.
 */
export function easeInOutCosine(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (t === 0.5) return 0.5;
  const clamped = Math.max(0, Math.min(1, t));
  return 0.5 - 0.5 * Math.cos(Math.PI * clamped);
}

/**
 * Computes front cover hinge rotation angle in radians around the Y-axis.
 * 0.0 (closed) -> 0 radians (0 degrees)
 * 1.0 (opened) -> -Math.PI radians (-180 degrees)
 */
export function computeCoverHingeAngle(progress: number): number {
  if (progress <= 0) return 0;
  const eased = easeInOutCosine(progress);
  return -eased * Math.PI;
}

/**
 * Computes physical hinge Z elevation during opening.
 * As the cover opens, the spine hinge settles naturally so the inside face
 * rests planar and flush with the inner paper block.
 */
export function computeHingeElevation(
  progress: number,
  stackDepth: number,
  boardThickness: number,
): number {
  const eased = easeInOutCosine(progress);
  const closedHingeZ = stackDepth / 2 + boardThickness / 2;
  const openedHingeZ = stackDepth / 2 - boardThickness / 2;
  return closedHingeZ - eased * (closedHingeZ - openedHingeZ);
}

/**
 * Interpolates camera position and lookAt target between closed beauty angle
 * and open spread reading perspective.
 */
export function interpolateCameraPose(
  progress: number,
  pageHeight: number,
  cameraDistance: number,
): {
  position: [number, number, number];
  lookAt: [number, number, number];
} {
  const eased = easeInOutCosine(progress);

  // Closed beauty perspective: slightly to the right, elevated viewing of cover foil title and spine
  const closedPos: [number, number, number] = [
    cameraDistance * 0.16,
    cameraDistance * 0.44,
    cameraDistance * 0.88,
  ];
  const closedLookAt: [number, number, number] = [-0.05, 0, 0];

  // Open spread perspective: centered, natural elevated front-facing viewing perspective looking directly down at the open pages
  const openPos: [number, number, number] = [
    0,
    cameraDistance * 0.48,
    cameraDistance * 0.88,
  ];
  const openLookAt: [number, number, number] = [0, 0, 0];

  const posX = closedPos[0] + (openPos[0] - closedPos[0]) * eased;
  const posY = closedPos[1] + (openPos[1] - closedPos[1]) * eased;
  const posZ = closedPos[2] + (openPos[2] - closedPos[2]) * eased;

  const lookX = closedLookAt[0] + (openLookAt[0] - closedLookAt[0]) * eased;
  const lookY = closedLookAt[1] + (openLookAt[1] - closedLookAt[1]) * eased;
  const lookZ = closedLookAt[2] + (openLookAt[2] - closedLookAt[2]) * eased;

  return {
    position: [posX, posY, posZ],
    lookAt: [lookX, lookY, lookZ],
  };
}

/**
 * Interpolates whole book group position and rotation from the closed
 * three-quarter product beauty angle to the centered open spread angle.
 * Album lies open naturally on the horizontal table plane rather than appearing
 * standing vertically or facing downward toward the floor.
 */
export function interpolateBookTransform(
  progress: number,
  pageWidth: number,
): {
  position: [number, number, number];
  rotation: [number, number, number];
} {
  const eased = easeInOutCosine(progress);

  // Closed pose: resting on table plane, rotated slightly in Y to reveal front cover foil & spine
  const closedRot: [number, number, number] = [-1.08, -0.38, 0.06];
  const closedPos: [number, number, number] = [-0.06, 0, 0];

  // Open pose: lying open naturally on the table, spine centered at world X=0, top tilted away from camera so pages face directly up toward viewer
  const openRot: [number, number, number] = [-1.08, 0, 0];
  const openPos: [number, number, number] = [pageWidth / 2, 0, 0];

  const rotX = closedRot[0] + (openRot[0] - closedRot[0]) * eased;
  const rotY = closedRot[1] + (openRot[1] - closedRot[1]) * eased;
  const rotZ = closedRot[2] + (openRot[2] - closedRot[2]) * eased;

  const posX = closedPos[0] + (openPos[0] - closedPos[0]) * eased;
  const posY = closedPos[1] + (openPos[1] - closedPos[1]) * eased;
  const posZ = closedPos[2] + (openPos[2] - closedPos[2]) * eased;

  return {
    position: [posX, posY, posZ],
    rotation: [rotX, rotY, rotZ],
  };
}
