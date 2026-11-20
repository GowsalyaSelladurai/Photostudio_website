import type {
  AlbumLayoutType,
  AlbumPage,
  AlbumPhoto,
  AlbumPhotoPlacement,
  PhotoTransform,
} from "@/types/album";

export type PhotoOrientation = "portrait" | "landscape" | "square";

export interface AutoLayoutOptions {
  /**
   * Background color applied to generated album pages.
   * Defaults to StudioFrame Ivory (#F5F0E8).
   */
  defaultBackground?: string;
  /**
   * Proportion of single landscape photos that may be rendered full-bleed (0.0 to 1.0).
   * 0.0 = no full-bleed (all single pages use 'single').
   * 1.0 = all eligible single landscape pages become 'full-bleed'.
   * Defaults to 0.25 (approx. 1 in 4 landscape solo pages).
   */
  fullBleedRatio?: number;
}

const DEFAULT_BACKGROUND = "#F5F0E8";
const MIN_PAGE_COUNT = 20;
const MAX_PAGE_COUNT = 60;
const MAX_PHOTOS_PER_PAGE = 6;

/**
 * Robust UUID generator working across both modern Node.js and browser environments.
 */
function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Creates a standard zero-offset default photo transform.
 */
function createDefaultTransform(): PhotoTransform {
  return {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    cropX: 0,
    cropY: 0,
  };
}

/**
 * Validates that an individual photo record contains valid, positive finite dimensions.
 * Throws a descriptive error for zero, negative, NaN, infinite, or missing dimensions.
 */
export function validatePhotoDimensions(photo: AlbumPhoto, index: number): void {
  if (!photo || typeof photo !== "object") {
    throw new Error(`Invalid photo at index ${index}: photo object is required.`);
  }
  if (!photo.id || typeof photo.id !== "string") {
    throw new Error(`Invalid photo at index ${index}: photo must have a valid string id.`);
  }

  const { width, height } = photo;

  if (
    typeof width !== "number" ||
    typeof height !== "number" ||
    Number.isNaN(width) ||
    Number.isNaN(height) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error(
      `Invalid photo dimensions for photo "${photo.id}" (index ${index}): width (${width}) and height (${height}) must be positive finite numbers.`,
    );
  }
}

/**
 * Classifies an album photograph by aspect ratio into portrait, landscape, or square.
 */
export function classifyPhotoOrientation(photo: AlbumPhoto): PhotoOrientation {
  const width = photo.width;
  const height = photo.height;
  const aspect = width / height;

  if (aspect < 0.88) {
    return "portrait";
  }
  if (aspect > 1.15) {
    return "landscape";
  }
  return "square";
}

/**
 * Validates the requested page count against StudioFrame physical binding rules.
 * Page counts must be an even integer between 20 and 60 inclusive.
 */
export function validateAlbumPageCount(pageCount: number): void {
  if (
    typeof pageCount !== "number" ||
    !Number.isInteger(pageCount) ||
    pageCount < MIN_PAGE_COUNT ||
    pageCount > MAX_PAGE_COUNT ||
    pageCount % 2 !== 0
  ) {
    throw new Error(
      `Invalid page count: ${pageCount}. Album page count must be an even integer between ${MIN_PAGE_COUNT} and ${MAX_PAGE_COUNT}.`,
    );
  }
}

/**
 * Validates that the number of photos does not exceed the maximum physical capacity
 * of the album (maximum 6 photos per page).
 */
export function validateAlbumPhotoCapacity(photoCount: number, pageCount: number): void {
  const maxCapacity = pageCount * MAX_PHOTOS_PER_PAGE;
  if (photoCount > maxCapacity) {
    throw new Error(
      `Unsupported photo count: ${photoCount} photos cannot be distributed across ${pageCount} pages. Maximum supported capacity is ${maxCapacity} photos (${MAX_PHOTOS_PER_PAGE} photos per page).`,
    );
  }
}

/**
 * Computes evenly distributed page indices across an album for sparse collections (N < P).
 * Ensures photos are spaced throughout the book from opening to closing pages and
 * guarantees that facing two-page spreads each feature content when N >= P / 2.
 */
function computeDistributedIndices(photoCount: number, pageCount: number): number[] {
  if (photoCount <= 0) return [];
  if (photoCount === 1) return [0];

  const indices: number[] = [];
  const span = pageCount - 1;
  const steps = photoCount - 1;

  for (let i = 0; i < photoCount; i++) {
    const target = Math.round((i * span) / steps);
    indices.push(target);
  }

  // Guarantee strictly increasing unique indices
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] <= indices[i - 1]) {
      indices[i] = indices[i - 1] + 1;
    }
  }

  // Ensure last index does not exceed pageCount - 1
  if (indices[indices.length - 1] >= pageCount) {
    let overflow = indices[indices.length - 1] - (pageCount - 1);
    for (let i = indices.length - 1; i >= 0 && overflow > 0; i--) {
      indices[i] -= overflow;
      if (i > 0 && indices[i] <= indices[i - 1]) {
        overflow = indices[i - 1] - indices[i] + 1;
      } else {
        overflow = 0;
      }
    }
  }

  return indices;
}

/**
 * Determines the most visually suitable AlbumLayoutType for a given bucket of photographs.
 */
function resolveLayoutForBucket(
  bucket: AlbumPhoto[],
  isFullBleed: boolean,
): AlbumLayoutType {
  const count = bucket.length;

  if (count <= 0) {
    return "single";
  }

  if (count === 1) {
    return isFullBleed ? "full-bleed" : "single";
  }

  if (count === 2) {
    return "two-photo";
  }

  if (count === 3) {
    return "three-photo";
  }

  if (count === 4) {
    return "four-grid";
  }

  // 5 or 6 photos (strictly capped at MAX_PHOTOS_PER_PAGE)
  return "collage";
}

/**
 * Creates an AlbumPage with proper placements and default parameters.
 * Preserves the input photo order without mutation.
 */
function buildAlbumPage(
  photos: AlbumPhoto[],
  layout: AlbumLayoutType,
  background: string,
): AlbumPage {
  const placements: AlbumPhotoPlacement[] = photos.map((photo) => ({
    id: generateUuid(),
    photoId: photo.id,
    transform: createDefaultTransform(),
  }));

  return {
    id: generateUuid(),
    layout,
    photos: placements,
    texts: [],
    background,
    frameStyle: "none",
    photoSpacing: "balanced",
    cornerRadius: "subtle",
    photoShadow: "soft",
  };
}

/**
 * Plans the photo bucket sizes for each page when N > P.
 * Strictly guarantees that:
 * 1. Every page gets at least 1 photo.
 * 2. No page ever exceeds MAX_PHOTOS_PER_PAGE (6).
 * 3. The sum of bucket sizes equals N exactly.
 * 4. Two-page spreads maintain visual harmony (e.g. dense left balanced by calmer right).
 */
function planMultiPhotoBuckets(
  photos: AlbumPhoto[],
  pageCount: number,
): number[] {
  const totalPhotos = photos.length;
  const desiredSizes: number[] = new Array(pageCount).fill(1);
  let photoPtr = 0;

  for (let p = 0; p < pageCount; p++) {
    const pagesLeft = pageCount - p;
    const photosLeft = totalPhotos - photoPtr;
    const avg = photosLeft / pagesLeft;

    let target = 1;
    // Page 0 (opening) and Page P-1 (closing): prefer 1 (or 2 if very dense)
    if (p === 0 || p === pageCount - 1) {
      target = avg > 3.5 ? 2 : 1;
    } else {
      // Check facing page in spread:
      // If p is odd (right page of spread) and p-1 was heavy (>= 4), balance with calmer right page
      const isRightPage = p % 2 === 1;
      const leftPageSize = isRightPage ? desiredSizes[p - 1] : 0;

      if (isRightPage && leftPageSize >= 4 && avg < 4.5) {
        target = Math.min(2, Math.floor(avg));
      } else if (avg >= 4.8) {
        target = 5;
      } else if (avg >= 3.8) {
        target = 4;
      } else if (avg >= 2.8) {
        target = 3;
      } else if (avg >= 1.8) {
        // Look ahead at upcoming photos: if two consecutive portraits, pair them into two-photo
        const p1 = photos[photoPtr];
        const p2 = photos[photoPtr + 1];
        if (
          p1 &&
          p2 &&
          classifyPhotoOrientation(p1) === "portrait" &&
          classifyPhotoOrientation(p2) === "portrait"
        ) {
          target = 2;
        } else {
          target = avg > 2.2 ? 3 : 2;
        }
      } else {
        target = 1;
      }
    }

    // Mathematical bounds for this page:
    // It must take at least 1, but cannot take so many that remaining pages get < 1
    const minPossible = Math.max(1, photosLeft - (pagesLeft - 1) * MAX_PHOTOS_PER_PAGE);
    const maxPossible = Math.min(MAX_PHOTOS_PER_PAGE, photosLeft - (pagesLeft - 1));

    const size = Math.max(minPossible, Math.min(maxPossible, target));
    desiredSizes[p] = size;
    photoPtr += size;
  }

  // Exact balance adjustment: sum MUST equal totalPhotos
  let sum = desiredSizes.reduce((a, b) => a + b, 0);

  if (sum < totalPhotos) {
    let diff = totalPhotos - sum;
    // Distribute shortfall to interior pages with available capacity (up to MAX_PHOTOS_PER_PAGE)
    for (let p = 1; p < pageCount - 1 && diff > 0; p++) {
      const room = MAX_PHOTOS_PER_PAGE - desiredSizes[p];
      if (room > 0) {
        const add = Math.min(room, diff);
        desiredSizes[p] += add;
        diff -= add;
      }
    }
    // If still remaining, check closing and opening page
    for (let p = 0; p < pageCount && diff > 0; p++) {
      const room = MAX_PHOTOS_PER_PAGE - desiredSizes[p];
      if (room > 0) {
        const add = Math.min(room, diff);
        desiredSizes[p] += add;
        diff -= add;
      }
    }
  } else if (sum > totalPhotos) {
    let diff = sum - totalPhotos;
    for (let p = pageCount - 2; p >= 1 && diff > 0; p--) {
      const excess = desiredSizes[p] - 1;
      if (excess > 0) {
        const sub = Math.min(excess, diff);
        desiredSizes[p] -= sub;
        diff -= sub;
      }
    }
  }

  return desiredSizes;
}

/**
 * Distributes uploaded photographs automatically across a selected number of album pages.
 *
 * Requirements satisfied:
 * 1. Enforces maximum of six photos per page.
 * 2. Rejects unsupported photo/page combinations (e.g. N > P * 6) with clear descriptive errors.
 * 3. Guarantees that every accepted input photo is assigned exactly once.
 * 4. Implements exact fullBleedRatio behavior (0 = zero full bleed; 1 = all eligible single landscape full bleed).
 * 5. Visual layout selection guided by photographic aspect ratios.
 * 6. Spread-aware distribution ensuring balanced two-page facing spreads.
 * 7. Validates missing, zero, negative, NaN and infinite image dimensions.
 * 8. Strictly preserves original upload order.
 * 9. Does not mutate source photo objects or input arrays.
 * 10. Keeps all generated pages strictly compatible with AlbumPage.
 */
export function distributePhotosAcrossAlbum(
  photos: AlbumPhoto[],
  pageCount: number,
  options: AutoLayoutOptions = {},
): AlbumPage[] {
  // 1. Validate page count (even integer 20..60)
  validateAlbumPageCount(pageCount);

  const background = options.defaultBackground ?? DEFAULT_BACKGROUND;
  const rawRatio = options.fullBleedRatio ?? 0.25;
  const fullBleedRatio = Math.max(0, Math.min(1, rawRatio));

  // Case A: Empty photo collection
  if (!photos || photos.length === 0) {
    return Array.from({ length: pageCount }, () =>
      buildAlbumPage([], "single", background),
    );
  }

  // 2. Validate all photo dimensions (positive finite numbers)
  for (let i = 0; i < photos.length; i++) {
    validatePhotoDimensions(photos[i], i);
  }

  const totalPhotos = photos.length;

  // 3. Enforce maximum album photo capacity (P * 6)
  validateAlbumPhotoCapacity(totalPhotos, pageCount);

  // Helper to determine full-bleed eligibility
  // Identifies which single landscape pages should be full-bleed according to fullBleedRatio
  function resolveFullBleedFlags(candidatePageIndices: number[]): Set<number> {
    const fullBleedPages = new Set<number>();
    if (fullBleedRatio <= 0 || candidatePageIndices.length === 0) {
      return fullBleedPages;
    }
    if (fullBleedRatio >= 1) {
      candidatePageIndices.forEach((idx) => fullBleedPages.add(idx));
      return fullBleedPages;
    }

    // For 0 < ratio < 1, select proportionally spaced pages
    const countToSelect = Math.max(
      1,
      Math.round(candidatePageIndices.length * fullBleedRatio),
    );
    const step = candidatePageIndices.length / countToSelect;
    for (let i = 0; i < countToSelect; i++) {
      const idx = candidatePageIndices[Math.floor(i * step)];
      fullBleedPages.add(idx);
    }
    return fullBleedPages;
  }

  // Case B: Fewer photos than pages (N < P)
  if (totalPhotos < pageCount) {
    const targetIndices = computeDistributedIndices(totalPhotos, pageCount);
    const targetSet = new Map<number, AlbumPhoto>();

    targetIndices.forEach((pageIdx, photoIdx) => {
      targetSet.set(pageIdx, photos[photoIdx]);
    });

    // Determine eligible single landscape pages (interior pages with landscape photo)
    const eligibleLandscapeIndices: number[] = [];
    targetIndices.forEach((pageIdx) => {
      const photo = targetSet.get(pageIdx);
      if (photo && classifyPhotoOrientation(photo) === "landscape" && pageIdx > 0) {
        eligibleLandscapeIndices.push(pageIdx);
      }
    });

    const fullBleedSet = resolveFullBleedFlags(eligibleLandscapeIndices);
    const pages: AlbumPage[] = [];

    for (let p = 0; p < pageCount; p++) {
      const photo = targetSet.get(p);
      if (photo) {
        const isFullBleed = fullBleedSet.has(p);
        const layout = resolveLayoutForBucket([photo], isFullBleed);
        pages.push(buildAlbumPage([photo], layout, background));
      } else {
        // Deliberate intentional breathing / spacer page
        pages.push(buildAlbumPage([], "single", background));
      }
    }

    return pages;
  }

  // Case C: Exact match (N === P)
  if (totalPhotos === pageCount) {
    const eligibleLandscapeIndices: number[] = [];
    photos.forEach((photo, p) => {
      if (classifyPhotoOrientation(photo) === "landscape" && p > 0) {
        eligibleLandscapeIndices.push(p);
      }
    });

    const fullBleedSet = resolveFullBleedFlags(eligibleLandscapeIndices);

    return photos.map((photo, p) => {
      const isFullBleed = fullBleedSet.has(p);
      const layout = resolveLayoutForBucket([photo], isFullBleed);
      return buildAlbumPage([photo], layout, background);
    });
  }

  // Case D: More photos than pages (N > P)
  const bucketSizes = planMultiPhotoBuckets(photos, pageCount);

  // Identify eligible single landscape pages for full-bleed
  const eligibleLandscapeIndices: number[] = [];
  let tempOffset = 0;
  for (let p = 0; p < pageCount; p++) {
    const size = bucketSizes[p];
    if (size === 1 && p > 0) {
      const photo = photos[tempOffset];
      if (classifyPhotoOrientation(photo) === "landscape") {
        eligibleLandscapeIndices.push(p);
      }
    }
    tempOffset += size;
  }

  const fullBleedSet = resolveFullBleedFlags(eligibleLandscapeIndices);

  const pages: AlbumPage[] = [];
  let photoOffset = 0;

  for (let p = 0; p < pageCount; p++) {
    const size = bucketSizes[p];
    const bucket = photos.slice(photoOffset, photoOffset + size);
    photoOffset += size;

    const isFullBleed = size === 1 && fullBleedSet.has(p);
    const layout = resolveLayoutForBucket(bucket, isFullBleed);

    pages.push(buildAlbumPage(bucket, layout, background));
  }

  return pages;
}
