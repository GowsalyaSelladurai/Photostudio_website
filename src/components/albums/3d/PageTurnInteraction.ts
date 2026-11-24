/**
 * StudioFrame 3D Photobook Viewer – Stage 4: Interactive Page Turning & Synchronization
 * 
 * Provides pure mathematical calculations, state management utilities, and physics
 * for realistic pointer-following page curls, drag completion / rebound decisions,
 * and synchronized navigation control.
 */

export interface DragTrackingState {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  lastX: number;
  lastTime: number;
  velocityX: number; // px per millisecond (positive = rightward, negative = leftward)
  direction: "next" | "previous";
  isActiveDrag: boolean;
  containerWidth: number;
}

export type FlipPhase = "idle" | "dragging" | "scrolling" | "completing" | "rebounding" | "auto";

export interface FlipControllerState {
  phase: FlipPhase;
  direction: "next" | "previous";
  currentProgress: number; // 0.0 to 1.0 (actual animated physical page progress)
  targetProgress: number;  // 0.0 to 1.0 (accumulated input target)
  velocity: number;        // velocity in progress units per second
  startProgress: number;   // 0.0 to 1.0 at start of transition
  duration: number;        // total transition duration in seconds
  elapsed: number;         // elapsed transition time in seconds
  lastScrollTime: number;  // performance.now() of last scroll input
  isSettling: boolean;     // whether smooth idle settling is active
}

export const DEFAULT_FLIP_DURATION = 0.88; // Target ~0.88 seconds for realistic physical turn
export const AUTOPLAY_INTERVAL_MS = 2000;  // 2 seconds between turns
export const DRAG_SLOP_PIXELS = 8;         // Minimum movement to distinguish drag from click
export const PROGRESS_THRESHOLD = 0.40;    // Complete turn if dragged >= 40% across
export const FLICK_VELOCITY_THRESHOLD = 0.35; // px/ms flick threshold (equivalent to 350 px/sec)
export const FLICK_MIN_PROGRESS = 0.15;    // Minimum progress needed with flick to complete turn

// Scroll-controlled page turn parameters for butter-smooth animation
export const SCROLL_TURN_DISTANCE_PX = 320;   // Pixels of accumulated scroll for 100% turn progress
export const SCROLL_SETTLE_DELAY_MS = 140;    // Idle period in ms before gentle auto-settle engages
export const SCROLL_MIN_DELTA_THRESHOLD = 6;  // Minimum wheel delta to initiate a new scroll turn
export const SCROLL_DAMPING_LAMBDA = 20.0;    // Damping coefficient for active scrolling (snappy, zero lag)
export const SCROLL_SETTLE_LAMBDA = 14.0;     // Damping coefficient for settling (soft, luxurious deceleration)

/**
 * Creates default initial idle flip controller state.
 */
export function createInitialFlipControllerState(): FlipControllerState {
  return {
    phase: "idle",
    direction: "next",
    currentProgress: 0.0,
    targetProgress: 0.0,
    velocity: 0.0,
    startProgress: 0.0,
    duration: DEFAULT_FLIP_DURATION,
    elapsed: 0.0,
    lastScrollTime: 0.0,
    isSettling: false,
  };
}

/**
 * Computes drag progress (0.0 to 1.0) from horizontal drag delta.
 * Forward ('next'): dragging leftwards (deltaX < 0) increases progress.
 * Backward ('previous'): dragging rightwards (deltaX > 0) increases progress.
 */
export function computeDragProgress(
  deltaX: number,
  containerWidth: number,
  direction: "next" | "previous",
): number {
  // Effective turn span is approximately one page width on screen (~42% of container width)
  const effectiveTurnSpan = Math.max(220, Math.min(520, containerWidth * 0.42));
  const rawProgress =
    direction === "next"
      ? -deltaX / effectiveTurnSpan
      : deltaX / effectiveTurnSpan;

  return Math.max(0.0, Math.min(1.0, rawProgress));
}

/**
 * Determines whether the release of a drag gesture should complete the turn
 * or rebound back to the original page.
 *
 * @param progress Current normalized drag progress [0.0, 1.0]
 * @param velocityX Pointer velocity in px/ms (positive = rightward, negative = leftward)
 * @param direction Turn direction ("next" | "previous")
 */
export function shouldCompleteTurn(
  progress: number,
  velocityX: number,
  direction: "next" | "previous",
): boolean {
  // Velocity in the forward progress direction
  const flipVelocity = direction === "next" ? -velocityX : velocityX;

  // 1. Dragged past threshold distance
  if (progress >= PROGRESS_THRESHOLD) {
    return true;
  }

  // 2. Flick / swipe gesture in the flip direction past minimum progress
  if (progress >= FLICK_MIN_PROGRESS && flipVelocity >= FLICK_VELOCITY_THRESHOLD) {
    return true;
  }

  return false;
}

/**
 * Computes transition duration in seconds for completing or rebounding.
 * Proportional to remaining distance, with smooth minimum easing floor.
 */
export function computeTransitionDuration(
  startProgress: number,
  targetProgress: number,
  prefersReducedMotion = false,
  baseDuration = DEFAULT_FLIP_DURATION,
): number {
  if (prefersReducedMotion) {
    return 0.05;
  }
  const distance = Math.abs(targetProgress - startProgress);
  return Math.max(0.18, distance * baseDuration);
}

/**
 * Computes eased progress along cosine acceleration/deceleration curve.
 */
export function computeEasedTransitionProgress(
  elapsed: number,
  duration: number,
  startProgress: number,
  targetProgress: number,
): { progress: number; isDone: boolean } {
  if (duration <= 0.0001) {
    return { progress: targetProgress, isDone: true };
  }

  const t = Math.min(1.0, Math.max(0.0, elapsed / duration));
  // Smooth cosine easing
  const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
  const progress = startProgress + (targetProgress - startProgress) * ease;
  const isDone = t >= 1.0;

  return { progress, isDone };
}

/**
 * Computes incremental scroll progress change based on vertical wheel delta and flip direction.
 * Positive deltaY (scroll down) advances 'next' and reduces 'previous'.
 * Negative deltaY (scroll up) advances 'previous' and reduces 'next'.
 */
export function computeScrollDeltaProgress(
  deltaY: number,
  direction: "next" | "previous",
  scrollSpan = SCROLL_TURN_DISTANCE_PX,
): number {
  if (scrollSpan <= 0) return 0;
  const signedDelta = direction === "next" ? deltaY : -deltaY;
  return signedDelta / scrollSpan;
}

/**
 * Computes smoothly damped progress (framerate-independent critically damped spring equivalent).
 * Provides continuous velocity with zero jerk and zero overshoot.
 *
 * @param current Current value
 * @param target Target value
 * @param lambda Damping coefficient (higher = faster response)
 * @param delta Elapsed time step in seconds
 */
export function computeDampedProgress(
  current: number,
  target: number,
  lambda: number,
  delta: number,
): number {
  if (delta <= 0) return current;
  const factor = 1 - Math.exp(-lambda * delta);
  return current + (target - current) * factor;
}

/**
 * Determines whether an unfinished scroll turn should complete or rebound back to original spread.
 * If progress >= 50%: complete the turn.
 * If progress < 50%: rebound back to original spread.
 */
export function shouldSettleScrollTurn(progress: number): "complete" | "rebound" {
  return progress >= 0.5 ? "complete" : "rebound";
}

