/**
 * Mathematical models and interpolation functions for StudioFrame
 * realistic 3D hardcover opening and closing cinematic animations.
 */

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

  // Closed beauty perspective: slightly right of center, looking at cover
  const closedPos: [number, number, number] = [
    0.15,
    -pageHeight * 0.12,
    cameraDistance * 0.95,
  ];
  const closedLookAt: [number, number, number] = [0, -0.05, 0];

  // Open spread perspective: centered, slightly elevated for spread viewing
  const openPos: [number, number, number] = [
    0,
    -pageHeight * 0.22,
    cameraDistance,
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
 */
export function interpolateBookTransform(
  progress: number,
  pageWidth: number,
): {
  position: [number, number, number];
  rotation: [number, number, number];
} {
  const eased = easeInOutCosine(progress);

  // Closed pose: angled three-quarter view showing cover foil, spine arc, and paper thickness
  const closedRot: [number, number, number] = [0.34, -0.42, 0.14];
  const closedPos: [number, number, number] = [-0.1, -0.05, 0];

  // Open pose: spine shifted to center world X=0, tilted slightly towards camera
  const openRot: [number, number, number] = [0.42, 0, 0];
  const openPos: [number, number, number] = [pageWidth / 2, -0.05, 0];

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
