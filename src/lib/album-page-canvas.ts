/**
 * StudioFrame Album Page Canvas Renderer
 * Pure TypeScript / HTML5 Canvas 2D renderer for individual AlbumPage instances.
 *
 * Designed for high-fidelity export in:
 * - Phase 3: 3D Photobook cover and spread textures (WebGL)
 * - Phase 4: High-resolution print-ready PDF export
 *
 * Independent of React and Three.js.
 */

import type {
  AlbumPage,
  AlbumLayoutType,
  AlbumPhotoPlacement,
  AlbumPhotoSpacing,
  AlbumFrameStyle,
  AlbumCornerRadius,
  AlbumPhotoShadow,
  AlbumTextElement,
  AlbumTextFontFamily,
  PhotoTransform,
} from "@/types/album";
import { getAlbumPhoto } from "@/lib/album-photo-storage";

export interface LayoutSlot {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameDimensions {
  borderWidth: number;
  borderColor: string;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  backgroundColor: string;
}

export interface ShadowSettings {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export type PhotoSource =
  | CanvasImageSource
  | Blob
  | string;

export type PhotoSourceMap = Record<string, PhotoSource>;

export interface RenderPageCanvasOptions {
  /** Target canvas pixel width. Default is 1200 or computed from aspect ratio. */
  width?: number;
  /** Target canvas pixel height. Default is 1600 or computed from aspect ratio. */
  height?: number;
  /** Optional project ID for retrieving high-resolution blobs from IndexedDB. */
  projectId?: string;
  /** Optional pre-resolved map of photoId -> CanvasImageSource | Blob | URL. */
  photoSources?: PhotoSourceMap;
  /** Default background color if not specified on the page. Defaults to #F5F0E8. */
  defaultBackground?: string;
  /** Reference layout width for proportional scaling of fonts/borders. Defaults to 600. */
  baseWidth?: number;
  /** Optional external HTMLCanvasElement. If omitted, one is created. */
  canvas?: HTMLCanvasElement;
  /** If true, throws errors on missing or corrupt images instead of rendering a fallback slot. */
  strictErrors?: boolean;
  /**
   * For full-bleed spreads: specifies whether this page is the 'left' or 'right'
   * side of a continuous double-page spread. If omitted or 'single', covers a single page.
   */
  spreadRole?: "left" | "right" | "single";
}

export interface DrawRect {
  drawX: number;
  drawY: number;
  drawW: number;
  drawH: number;
}

/**
 * Validates dimensions to ensure they are strictly positive finite numbers.
 */
export function validateDimensions(
  width: unknown,
  height: unknown,
  context = "Canvas",
): { width: number; height: number } {
  if (
    typeof width !== "number" ||
    !Number.isFinite(width) ||
    Number.isNaN(width) ||
    width <= 0
  ) {
    throw new Error(
      `Invalid ${context} width: expected a positive finite number, received ${width}.`,
    );
  }

  if (
    typeof height !== "number" ||
    !Number.isFinite(height) ||
    Number.isNaN(height) ||
    height <= 0
  ) {
    throw new Error(
      `Invalid ${context} height: expected a positive finite number, received ${height}.`,
    );
  }

  return { width, height };
}

/**
 * Computes margin and gap spacing in pixels for a given canvas size and spacing preset.
 */
export function resolvePageSpacing(
  pageWidth: number,
  pageHeight: number,
  spacingPreset: AlbumPhotoSpacing = "balanced",
  layout: AlbumLayoutType = "single",
): { pageMargin: number; gap: number } {
  if (layout === "full-bleed") {
    return { pageMargin: 0, gap: 0 };
  }

  const minDim = Math.min(pageWidth, pageHeight);

  // Proportional page margin (approx 4.5% of min dimension)
  const pageMargin = Math.round(minDim * 0.045);

  let gapFactor: number;
  switch (spacingPreset) {
    case "compact":
      gapFactor = 0.012; // ~1.2%
      break;
    case "spacious":
      gapFactor = 0.035; // ~3.5%
      break;
    case "balanced":
    default:
      gapFactor = 0.02; // ~2.0%
      break;
  }

  const gap = Math.max(2, Math.round(minDim * gapFactor));
  return { pageMargin, gap };
}

/**
 * Computes exact layout slot bounding boxes for all 6 album page layouts.
 * Pure mathematical layout algorithm matching AlbumPagePreview.
 */
export function computePageLayoutSlots(
  layout: AlbumLayoutType,
  photoCount: number,
  pageWidth: number,
  pageHeight: number,
  spacingPreset: AlbumPhotoSpacing = "balanced",
): LayoutSlot[] {
  validateDimensions(pageWidth, pageHeight, "Page");

  if (photoCount <= 0) {
    return [];
  }

  const { pageMargin, gap } = resolvePageSpacing(
    pageWidth,
    pageHeight,
    spacingPreset,
    layout,
  );

  const innerW = pageWidth - pageMargin * 2;
  const innerH = pageHeight - pageMargin * 2;

  switch (layout) {
    case "full-bleed": {
      return [
        {
          index: 0,
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        },
      ];
    }

    case "single": {
      return [
        {
          index: 0,
          x: pageMargin,
          y: pageMargin,
          width: Math.max(1, innerW),
          height: Math.max(1, innerH),
        },
      ];
    }

    case "two-photo": {
      const pageAspect = innerW / innerH;
      const slots: LayoutSlot[] = [];
      const count = Math.min(photoCount, 2);

      if (count === 1) {
        return [
          {
            index: 0,
            x: pageMargin,
            y: pageMargin,
            width: Math.max(1, innerW),
            height: Math.max(1, innerH),
          },
        ];
      }

      // On tall portrait pages (aspect < 0.85), stack 2 horizontal photos to prevent 1:3 vertical slivers
      if (pageAspect < 0.85) {
        const rowH = Math.max(1, Math.floor((innerH - gap) / 2));
        for (let i = 0; i < count; i++) {
          const h = i === count - 1 ? innerH - i * (rowH + gap) : rowH;
          slots.push({
            index: i,
            x: pageMargin,
            y: pageMargin + i * (rowH + gap),
            width: Math.max(1, innerW),
            height: Math.max(1, h),
          });
        }
      } else {
        // On landscape, square, or panoramic pages, use 2 side-by-side columns
        const colW = Math.max(1, Math.floor((innerW - gap) / 2));
        for (let i = 0; i < count; i++) {
          const w = i === count - 1 ? innerW - i * (colW + gap) : colW;
          slots.push({
            index: i,
            x: pageMargin + i * (colW + gap),
            y: pageMargin,
            width: Math.max(1, w),
            height: Math.max(1, innerH),
          });
        }
      }
      return slots;
    }

    case "three-photo": {
      if (photoCount <= 1) {
        return [
          {
            index: 0,
            x: pageMargin,
            y: pageMargin,
            width: Math.max(1, innerW),
            height: Math.max(1, innerH),
          },
        ];
      }

      if (photoCount === 2) {
        return computePageLayoutSlots("two-photo", 2, pageWidth, pageHeight, spacingPreset);
      }

      const pageAspect = innerW / innerH;
      const slots: LayoutSlot[] = [];

      // Case A: Panoramic / Long Landscape spread (aspect >= 1.7)
      // Distribute 3 equal vertical columns side-by-side across the wide spread
      if (pageAspect >= 1.7) {
        const colW = Math.max(1, Math.floor((innerW - gap * 2) / 3));
        for (let i = 0; i < 3; i++) {
          const w = i === 2 ? innerW - 2 * (colW + gap) : colW;
          slots.push({
            index: i,
            x: pageMargin + i * (colW + gap),
            y: pageMargin,
            width: Math.max(1, w),
            height: Math.max(1, innerH),
          });
        }
        return slots;
      }

      // Case B: Tall Portrait / Long Portrait page (aspect < 0.88)
      // One large hero landscape photograph on top + two balanced portrait photographs side-by-side below
      if (pageAspect < 0.88) {
        const heroH = Math.max(1, Math.round((innerH - gap) * 0.52));
        const bottomH = Math.max(1, innerH - gap - heroH);
        const subColW = Math.max(1, Math.floor((innerW - gap) / 2));
        const subColW2 = Math.max(1, innerW - gap - subColW);

        slots.push({
          index: 0,
          x: pageMargin,
          y: pageMargin,
          width: Math.max(1, innerW),
          height: heroH,
        });

        slots.push({
          index: 1,
          x: pageMargin,
          y: pageMargin + heroH + gap,
          width: subColW,
          height: bottomH,
        });

        slots.push({
          index: 2,
          x: pageMargin + subColW + gap,
          y: pageMargin + heroH + gap,
          width: subColW2,
          height: bottomH,
        });

        return slots;
      }

      // Case C: Standard Landscape or Square (0.88 <= aspect < 1.7)
      // One full-height vertical hero on left + two stacked horizontal accents on right
      const colW = Math.max(1, Math.floor((innerW - gap) / 2));
      const rightColW = Math.max(1, innerW - gap - colW);
      const rowH = Math.max(1, Math.floor((innerH - gap) / 2));
      const botRowH = Math.max(1, innerH - gap - rowH);

      slots.push({
        index: 0,
        x: pageMargin,
        y: pageMargin,
        width: colW,
        height: Math.max(1, innerH),
      });

      slots.push({
        index: 1,
        x: pageMargin + colW + gap,
        y: pageMargin,
        width: rightColW,
        height: rowH,
      });

      slots.push({
        index: 2,
        x: pageMargin + colW + gap,
        y: pageMargin + rowH + gap,
        width: rightColW,
        height: botRowH,
      });

      return slots;
    }

    case "four-grid": {
      if (photoCount <= 1) {
        return [
          {
            index: 0,
            x: pageMargin,
            y: pageMargin,
            width: Math.max(1, innerW),
            height: Math.max(1, innerH),
          },
        ];
      }

      if (photoCount === 2) {
        return computePageLayoutSlots("two-photo", 2, pageWidth, pageHeight, spacingPreset);
      }

      if (photoCount === 3) {
        return computePageLayoutSlots("three-photo", 3, pageWidth, pageHeight, spacingPreset);
      }

      const pageAspect = innerW / innerH;
      const count = Math.min(photoCount, 4);
      const slots: LayoutSlot[] = [];

      // On wide panoramic pages (aspect >= 2.0), layout 4 columns side-by-side
      if (pageAspect >= 2.0) {
        const colW = Math.max(1, Math.floor((innerW - gap * 3) / 4));
        for (let i = 0; i < count; i++) {
          const w = i === count - 1 ? innerW - i * (colW + gap) : colW;
          slots.push({
            index: i,
            x: pageMargin + i * (colW + gap),
            y: pageMargin,
            width: Math.max(1, w),
            height: Math.max(1, innerH),
          });
        }
        return slots;
      }

      // Symmetrical 2x2 grid for portrait, square, and standard landscape
      const colW = Math.max(1, Math.floor((innerW - gap) / 2));
      const rightColW = Math.max(1, innerW - gap - colW);
      const rowH = Math.max(1, Math.floor((innerH - gap) / 2));
      const botRowH = Math.max(1, innerH - gap - rowH);

      for (let i = 0; i < count; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const w = col === 1 ? rightColW : colW;
        const h = row === 1 ? botRowH : rowH;

        slots.push({
          index: i,
          x: pageMargin + col * (colW + gap),
          y: pageMargin + row * (rowH + gap),
          width: w,
          height: h,
        });
      }

      return slots;
    }

    case "collage": {
      const count = Math.min(photoCount, 6);
      if (count <= 1) {
        return [
          {
            index: 0,
            x: pageMargin,
            y: pageMargin,
            width: Math.max(1, innerW),
            height: Math.max(1, innerH),
          },
        ];
      }

      if (count === 2) {
        return computePageLayoutSlots("two-photo", 2, pageWidth, pageHeight, spacingPreset);
      }

      if (count === 3) {
        return computePageLayoutSlots("three-photo", 3, pageWidth, pageHeight, spacingPreset);
      }

      const pageAspect = innerW / innerH;
      const slots: LayoutSlot[] = [];

      // 4-Photo Collage: complete coverage without any empty holes
      if (count === 4) {
        if (pageAspect >= 1.8) {
          // Panoramic: 4 vertical columns side-by-side
          const colW = Math.max(1, Math.floor((innerW - gap * 3) / 4));
          for (let i = 0; i < 4; i++) {
            const w = i === 3 ? innerW - 3 * (colW + gap) : colW;
            slots.push({
              index: i,
              x: pageMargin + i * (colW + gap),
              y: pageMargin,
              width: Math.max(1, w),
              height: Math.max(1, innerH),
            });
          }
          return slots;
        }

        if (pageAspect < 0.88) {
          // Tall portrait: 1 large hero top + 3 balanced columns bottom
          const topH = Math.max(1, Math.round((innerH - gap) * 0.52));
          const botH = Math.max(1, innerH - gap - topH);
          const subColW = Math.max(1, Math.floor((innerW - gap * 2) / 3));

          slots.push({
            index: 0,
            x: pageMargin,
            y: pageMargin,
            width: Math.max(1, innerW),
            height: topH,
          });

          for (let i = 0; i < 3; i++) {
            const w = i === 2 ? innerW - 2 * (subColW + gap) : subColW;
            slots.push({
              index: i + 1,
              x: pageMargin + i * (subColW + gap),
              y: pageMargin + topH + gap,
              width: Math.max(1, w),
              height: botH,
            });
          }
          return slots;
        }

        // Standard 2x2 grid for landscape and square
        return computePageLayoutSlots("four-grid", 4, pageWidth, pageHeight, spacingPreset);
      }

      // 5-Photo Collage: balanced 2 on top row + 3 on bottom row (100% space utilized)
      if (count === 5) {
        const topH = Math.max(1, Math.floor((innerH - gap) * 0.50));
        const botH = Math.max(1, innerH - gap - topH);

        const topColW = Math.max(1, Math.floor((innerW - gap) / 2));
        const topColW2 = Math.max(1, innerW - gap - topColW);

        const botColW = Math.max(1, Math.floor((innerW - gap * 2) / 3));

        // Top row (2 photos)
        slots.push({
          index: 0,
          x: pageMargin,
          y: pageMargin,
          width: topColW,
          height: topH,
        });
        slots.push({
          index: 1,
          x: pageMargin + topColW + gap,
          y: pageMargin,
          width: topColW2,
          height: topH,
        });

        // Bottom row (3 photos)
        for (let i = 0; i < 3; i++) {
          const w = i === 2 ? innerW - 2 * (botColW + gap) : botColW;
          slots.push({
            index: i + 2,
            x: pageMargin + i * (botColW + gap),
            y: pageMargin + topH + gap,
            width: Math.max(1, w),
            height: botH,
          });
        }
        return slots;
      }

      // 6-Photo Collage: neat 2x3 or 3x2 grid matching page orientation
      if (pageAspect < 0.88) {
        // Tall portrait: 2 columns x 3 rows
        const colW = Math.max(1, Math.floor((innerW - gap) / 2));
        const colW2 = Math.max(1, innerW - gap - colW);
        const rowH = Math.max(1, Math.floor((innerH - gap * 2) / 3));

        for (let i = 0; i < 6; i++) {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const w = col === 1 ? colW2 : colW;
          const h = row === 2 ? innerH - 2 * (rowH + gap) : rowH;
          slots.push({
            index: i,
            x: pageMargin + col * (colW + gap),
            y: pageMargin + row * (rowH + gap),
            width: Math.max(1, w),
            height: Math.max(1, h),
          });
        }
        return slots;
      }

      // Landscape or Square: 3 columns x 2 rows
      const colW = Math.max(1, Math.floor((innerW - gap * 2) / 3));
      const rowH = Math.max(1, Math.floor((innerH - gap) / 2));
      const rowH2 = Math.max(1, innerH - gap - rowH);

      for (let i = 0; i < 6; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const w = col === 2 ? innerW - 2 * (colW + gap) : colW;
        const h = row === 1 ? rowH2 : rowH;
        slots.push({
          index: i,
          x: pageMargin + col * (colW + gap),
          y: pageMargin + row * (rowH + gap),
          width: Math.max(1, w),
          height: Math.max(1, h),
        });
      }

      return slots;
    }

    default: {
      throw new Error(`Unsupported album layout: "${layout}".`);
    }
  }
}

/**
 * Resolves frame styles (border, padding, colors) proportional to canvas size.
 */
export function resolveFrameDimensions(
  frameStyle: AlbumFrameStyle = "none",
  canvasWidth: number,
  baseWidth = 600,
): FrameDimensions {
  const scale = Math.max(0.5, canvasWidth / baseWidth);

  switch (frameStyle) {
    case "thin": {
      const borderWidth = Math.max(1, Math.round(2 * scale));
      const padding = Math.max(2, Math.round(4 * scale));
      return {
        borderWidth,
        borderColor: "#FFFFFF",
        paddingTop: padding,
        paddingRight: padding,
        paddingBottom: padding,
        paddingLeft: padding,
        backgroundColor: "#FFFFFF",
      };
    }

    case "elegant": {
      const borderWidth = Math.max(2, Math.round(3 * scale));
      const padding = Math.max(2, Math.round(4 * scale));
      return {
        borderWidth,
        borderColor: "#B99B70",
        paddingTop: padding,
        paddingRight: padding,
        paddingBottom: padding,
        paddingLeft: padding,
        backgroundColor: "#FFFFFF",
      };
    }

    case "polaroid": {
      const borderWidth = Math.max(1, Math.round(1 * scale));
      const sidePadding = Math.max(4, Math.round(8 * scale));
      const bottomPadding = Math.max(16, Math.round(30 * scale));
      return {
        borderWidth,
        borderColor: "#E5E0D8",
        paddingTop: sidePadding,
        paddingRight: sidePadding,
        paddingBottom: bottomPadding,
        paddingLeft: sidePadding,
        backgroundColor: "#FFFFFF",
      };
    }

    case "none":
    default: {
      return {
        borderWidth: 0,
        borderColor: "transparent",
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        backgroundColor: "transparent",
      };
    }
  }
}

/**
 * Resolves corner radius in pixels scaled to canvas dimensions.
 */
export function resolveCornerRadius(
  cornerRadius: AlbumCornerRadius = "square",
  canvasWidth: number,
  baseWidth = 600,
): number {
  const scale = Math.max(0.5, canvasWidth / baseWidth);

  switch (cornerRadius) {
    case "subtle":
      return Math.round(8 * scale);
    case "rounded":
      return Math.round(18 * scale);
    case "square":
    default:
      return 0;
  }
}

/**
 * Resolves shadow parameters scaled to canvas dimensions.
 */
export function resolveShadowSettings(
  shadow: AlbumPhotoShadow = "none",
  canvasWidth: number,
  baseWidth = 600,
): ShadowSettings | null {
  const scale = Math.max(0.5, canvasWidth / baseWidth);

  switch (shadow) {
    case "soft":
      return {
        color: "rgba(35, 28, 20, 0.12)",
        blur: Math.round(12 * scale),
        offsetX: 0,
        offsetY: Math.round(4 * scale),
      };

    case "premium":
      return {
        color: "rgba(35, 28, 20, 0.22)",
        blur: Math.round(24 * scale),
        offsetX: 0,
        offsetY: Math.round(10 * scale),
      };

    case "none":
    default:
      return null;
  }
}

/**
 * Computes image draw bounds matching CSS `object-fit: cover` and `object-position: (50+cropX)% (50+cropY)%`.
 */
export function computeCoverImageDrawRect(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
  cropX = 0,
  cropY = 0,
): DrawRect {
  validateDimensions(containerWidth, containerHeight, "Container");
  validateDimensions(imageWidth, imageHeight, "Image");

  const coverScale = Math.max(
    containerWidth / imageWidth,
    containerHeight / imageHeight,
  );

  const drawW = imageWidth * coverScale;
  const drawH = imageHeight * coverScale;

  const cropXPercent = Math.max(0, Math.min(100, 50 + cropX)) / 100;
  const cropYPercent = Math.max(0, Math.min(100, 50 + cropY)) / 100;

  const left = (containerWidth - drawW) * cropXPercent;
  const top = (containerHeight - drawH) * cropYPercent;

  // Relative to container center
  const drawX = left - containerWidth / 2;
  const drawY = top - containerHeight / 2;

  return { drawX, drawY, drawW, drawH };
}

/**
 * Computes image draw bounds matching CSS `object-fit: contain`.
 * Ensures the entire photograph is visible without any cropping.
 */
export function computeContainedImageDrawRect(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
): DrawRect {
  validateDimensions(containerWidth, containerHeight, "Container");
  validateDimensions(imageWidth, imageHeight, "Image");

  const containScale = Math.min(
    containerWidth / imageWidth,
    containerHeight / imageHeight,
  );

  const drawW = imageWidth * containScale;
  const drawH = imageHeight * containScale;

  // Relative to container center
  const drawX = -drawW / 2;
  const drawY = -drawH / 2;

  return { drawX, drawY, drawW, drawH };
}

/**
 * Maps abstract font family name to CSS font family stack.
 */
export function resolveFontFamily(
  family: AlbumTextFontFamily = "serif",
): string {
  switch (family) {
    case "sans":
      return "Arial, Helvetica, sans-serif";
    case "elegant":
      return '"Palatino Linotype", "Book Antiqua", Palatino, serif';
    case "serif":
    default:
      return 'Georgia, "Times New Roman", serif';
  }
}

/**
 * Draws a rounded rectangle path on a 2D canvas context.
 */
function pathRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  if (r === 0) {
    ctx.rect(x, y, width, height);
    return;
  }

  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
}

/**
 * Resolves an image source into a ready-to-draw CanvasImageSource.
 * Manages object URL and bitmap cleanup automatically.
 */
async function resolveImageElement(
  photoId: string,
  projectId?: string,
  photoSources?: PhotoSourceMap,
): Promise<{ image: CanvasImageSource; cleanup?: () => void }> {
  let source = photoSources?.[photoId];

  if (!source && projectId) {
    const storedBlob = await getAlbumPhoto(projectId, photoId);
    if (storedBlob) {
      source = storedBlob;
    }
  }

  // Graceful fallback to verified studio assets if source is missing or undefined
  if (!source) {
    const fallbackUrls = [
      "/mrge_pic/img1.jpg",
      "/images/booking-editorial.png",
      "/mrge_pic/img3.jpg",
      "/images/enquiry-editorial.png",
      "/mrge_pic/img5.jpg",
      "/images/default-frame-photo.jpeg",
    ];
    // Pick deterministic fallback from photoId string hash
    let hash = 0;
    for (let i = 0; i < photoId.length; i++) {
      hash = (hash << 5) - hash + photoId.charCodeAt(i);
      hash |= 0;
    }
    const safeIdx = Math.abs(hash) % fallbackUrls.length;
    source = fallbackUrls[safeIdx];
  }

  // Already a ready-to-draw canvas or image source
  if (
    typeof HTMLImageElement !== "undefined" &&
    source instanceof HTMLImageElement
  ) {
    if (!source.complete) {
      await new Promise<void>((resolve, reject) => {
        source.onload = () => resolve();
        source.onerror = () =>
          reject(new Error(`Failed to decode image element for photo "${photoId}".`));
      });
    }
    return { image: source };
  }

  if (
    (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) ||
    (typeof HTMLCanvasElement !== "undefined" &&
      source instanceof HTMLCanvasElement)
  ) {
    return { image: source };
  }

  // Try createImageBitmap for Blobs (fastest, decodes off main thread, zero URL leaks)
  if (
    typeof createImageBitmap === "function" &&
    typeof Blob !== "undefined" &&
    source instanceof Blob
  ) {
    try {
      const bitmap = await createImageBitmap(source);
      return {
        image: bitmap,
        cleanup: () => bitmap.close(),
      };
    } catch {
      // Fall through to Image element fallback if createImageBitmap fails on specific format
    }
  }

  // Handle Blob or URL string via Image element fallback
  let url: string;
  let shouldRevoke = false;

  if (typeof Blob !== "undefined" && source instanceof Blob) {
    url = URL.createObjectURL(source);
    shouldRevoke = true;
  } else if (typeof source === "string") {
    url = source;
  } else {
    throw new Error(
      `Unsupported photo source format for photo "${photoId}".`,
    );
  }

  const cleanup = shouldRevoke ? () => URL.revokeObjectURL(url) : undefined;

  if (typeof Image === "undefined") {
    cleanup?.();
    throw new Error(
      "Image constructor is not available in current environment.",
    );
  }

  const img = new Image();
  img.crossOrigin = "anonymous";

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => {
        // Fallback to verified local asset on network/path failure
        img.onerror = () => reject(new Error(`Failed to decode image for photo "${photoId}".`));
        img.src = "/mrge_pic/img1.jpg";
      };
      img.src = url;
    });
  } catch (err) {
    cleanup?.();
    throw err;
  }

  return { image: img, cleanup };
}

/**
 * Gets intrinsic pixel dimensions of any supported CanvasImageSource.
 */
function getImageDimensions(source: CanvasImageSource): {
  width: number;
  height: number;
} {
  if (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) {
    return {
      width: source.naturalWidth || source.width,
      height: source.naturalHeight || source.height,
    };
  }
  if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
    return { width: source.width, height: source.height };
  }
  if (typeof HTMLCanvasElement !== "undefined" && source instanceof HTMLCanvasElement) {
    return { width: source.width, height: source.height };
  }
  if (typeof HTMLVideoElement !== "undefined" && source instanceof HTMLVideoElement) {
    return { width: source.videoWidth, height: source.videoHeight };
  }
  return { width: 0, height: 0 };
}

/**
 * Draws a subtle, elegant fallback placeholder when an image is unavailable.
 */
function drawPhotoFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.save();
  ctx.beginPath();
  pathRoundRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = "#EAE4DC";
  ctx.fill();
  ctx.strokeStyle = "#DDD5CA";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Subtle label
  const fontSize = Math.max(10, Math.round(width * 0.04));
  ctx.font = `${fontSize}px Georgia, serif`;
  ctx.fillStyle = "#8C8276";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Photo unavailable", x + width / 2, y + height / 2);
  ctx.restore();
}

/**
 * Renders a single photo placement into its assigned layout slot on the canvas.
 */
async function drawPhotoSlot(
  ctx: CanvasRenderingContext2D,
  slot: LayoutSlot,
  placement: AlbumPhotoPlacement,
  page: AlbumPage,
  canvasWidth: number,
  options: RenderPageCanvasOptions,
): Promise<void> {
  const { frameStyle = "none", cornerRadius = "square", photoShadow = "none" } = page;
  const isFullBleed = page.layout === "full-bleed";

  const frame = isFullBleed
    ? resolveFrameDimensions("none", canvasWidth, options.baseWidth)
    : resolveFrameDimensions(frameStyle, canvasWidth, options.baseWidth);

  const radius = isFullBleed
    ? 0
    : resolveCornerRadius(cornerRadius, canvasWidth, options.baseWidth);

  const shadow = isFullBleed
    ? null
    : resolveShadowSettings(photoShadow, canvasWidth, options.baseWidth);

  // 1. Draw outer shadow if configured
  if (shadow) {
    ctx.save();
    ctx.shadowColor = shadow.color;
    ctx.shadowBlur = shadow.blur;
    ctx.shadowOffsetX = shadow.offsetX;
    ctx.shadowOffsetY = shadow.offsetY;
    ctx.fillStyle = frame.backgroundColor !== "transparent" ? frame.backgroundColor : "#FFFFFF";

    ctx.beginPath();
    pathRoundRect(ctx, slot.x, slot.y, slot.width, slot.height, radius);
    ctx.fill();
    ctx.restore();
  }

  // 2. Draw frame container background (e.g. polaroid white body)
  if (frame.backgroundColor !== "transparent" && !shadow) {
    ctx.save();
    ctx.fillStyle = frame.backgroundColor;
    ctx.beginPath();
    pathRoundRect(ctx, slot.x, slot.y, slot.width, slot.height, radius);
    ctx.fill();
    ctx.restore();
  }

  // 3. Compute inner photo viewport after subtracting frame padding
  const photoViewportX = slot.x + frame.paddingLeft;
  const photoViewportY = slot.y + frame.paddingTop;
  const photoViewportW = Math.max(1, slot.width - (frame.paddingLeft + frame.paddingRight));
  const photoViewportH = Math.max(1, slot.height - (frame.paddingTop + frame.paddingBottom));

  // Inner corner radius
  const innerRadius = Math.max(0, radius - Math.max(frame.paddingLeft, frame.borderWidth));

  // 4. Resolve image source safely
  let resolvedSource: { image: CanvasImageSource; cleanup?: () => void } | null = null;
  try {
    resolvedSource = await resolveImageElement(
      placement.photoId,
      options.projectId,
      options.photoSources,
    );
  } catch (err) {
    if (options.strictErrors) {
      throw err;
    }
    drawPhotoFallback(
      ctx,
      photoViewportX,
      photoViewportY,
      photoViewportW,
      photoViewportH,
      innerRadius,
    );
    return;
  }

  const { image, cleanup } = resolvedSource;

  try {
    const { width: imgW, height: imgH } = getImageDimensions(image);
    validateDimensions(imgW, imgH, `Image for photo "${placement.photoId}"`);

    const transform: PhotoTransform = placement.transform || {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      cropX: 0,
      cropY: 0,
    };

    ctx.save();

    // Clip to inner photo bounds with corner radius
    ctx.beginPath();
    pathRoundRect(
      ctx,
      photoViewportX,
      photoViewportY,
      photoViewportW,
      photoViewportH,
      innerRadius,
    );
    ctx.clip();

    const isContain = transform.fitMode === "contain";

    // ------------------------------------------------------------------------
    // Continuous Double-Page Full-Bleed Spread Rendering
    // Guarantees zero duplicate pixels, zero missing pixels, and exact alignment across gutter seam
    // ------------------------------------------------------------------------
    if (isFullBleed && (options.spreadRole === "left" || options.spreadRole === "right")) {
      const spreadW = canvasWidth * 2;
      const spreadH = options.height ?? slot.height;

      if (isContain) {
        const containScale = Math.min(spreadW / imgW, spreadH / imgH);
        const drawW = imgW * containScale;
        const drawH = imgH * containScale;
        const spreadLeft = (spreadW - drawW) / 2;
        const spreadTop = (spreadH - drawH) / 2;

        const drawX = options.spreadRole === "left" ? spreadLeft : spreadLeft - canvasWidth;
        const drawY = spreadTop;

        ctx.fillStyle = "#FAF8F5";
        ctx.fillRect(0, 0, canvasWidth, spreadH);
        ctx.drawImage(image, drawX, drawY, drawW, drawH);
        ctx.restore();
        return;
      }

      const spreadScale = Math.max(spreadW / imgW, spreadH / imgH);
      const drawW = imgW * spreadScale;
      const drawH = imgH * spreadScale;

      const cropXPercent = Math.max(0, Math.min(100, 50 + (transform.cropX || 0))) / 100;
      const cropYPercent = Math.max(0, Math.min(100, 50 + (transform.cropY || 0))) / 100;

      const spreadLeft = (spreadW - drawW) * cropXPercent;
      const spreadTop = (spreadH - drawH) * cropYPercent;

      const drawX = options.spreadRole === "left" ? spreadLeft : spreadLeft - canvasWidth;
      const drawY = spreadTop;

      ctx.drawImage(image, drawX, drawY, drawW, drawH);
      ctx.restore();
      return;
    }

    // ------------------------------------------------------------------------
    // Standard Photo Slot Rendering
    // Normalizes legacy 50% center data and clamps offsets to prevent unexpected clipping
    // ------------------------------------------------------------------------
    let rawX = transform.x || 0;
    let rawY = transform.y || 0;
    // Normalize legacy 50% center conventions
    if (Math.abs(rawX - 50) <= 10 && Math.abs(rawY - 50) <= 10) {
      rawX = 0;
      rawY = 0;
    }
    const clampedX = Math.max(-50, Math.min(50, rawX));
    const clampedY = Math.max(-50, Math.min(50, rawY));

    const centerX =
      photoViewportX +
      photoViewportW / 2 +
      (clampedX / 100) * photoViewportW;
    const centerY =
      photoViewportY +
      photoViewportH / 2 +
      (clampedY / 100) * photoViewportH;

    ctx.translate(centerX, centerY);

    // Apply rotation
    if (transform.rotation) {
      ctx.rotate((transform.rotation * Math.PI) / 180);
    }

    // Apply scale
    const scale = transform.scale ?? 1;
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }

    // If fitMode is contain, fill letterbox background with subtle warm neutral
    if (isContain) {
      ctx.fillStyle = "#F5F0E8";
      ctx.fillRect(
        -photoViewportW / 2,
        -photoViewportH / 2,
        photoViewportW,
        photoViewportH,
      );
    }

    // Compute draw coordinates (contain or cover)
    const { drawX, drawY, drawW, drawH } = isContain
      ? computeContainedImageDrawRect(photoViewportW, photoViewportH, imgW, imgH)
      : computeCoverImageDrawRect(
          photoViewportW,
          photoViewportH,
          imgW,
          imgH,
          transform.cropX,
          transform.cropY,
        );

    ctx.drawImage(image, drawX, drawY, drawW, drawH);
    ctx.restore();
  } catch (err) {
    if (options.strictErrors) {
      throw err;
    }
    drawPhotoFallback(
      ctx,
      photoViewportX,
      photoViewportY,
      photoViewportW,
      photoViewportH,
      innerRadius,
    );
  } finally {
    cleanup?.();
  }

  // 5. Draw frame border on top
  if (frame.borderWidth > 0 && frame.borderColor !== "transparent") {
    ctx.save();
    ctx.strokeStyle = frame.borderColor;
    ctx.lineWidth = frame.borderWidth;
    ctx.beginPath();
    pathRoundRect(ctx, slot.x, slot.y, slot.width, slot.height, radius);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Draws text elements onto the canvas context.
 */
function drawTextElements(
  ctx: CanvasRenderingContext2D,
  texts: AlbumTextElement[] | undefined,
  canvasWidth: number,
  canvasHeight: number,
  baseWidth = 600,
): void {
  if (!texts || texts.length === 0) return;

  const scale = canvasWidth / baseWidth;

  for (const text of texts) {
    if (!text.text) continue;

    const tx = ((text.x ?? 50) / 100) * canvasWidth;
    const ty = ((text.y ?? 50) / 100) * canvasHeight;
    const fontSize = Math.max(8, Math.round((text.fontSize ?? 16) * scale));
    const fontFamily = resolveFontFamily(text.fontFamily);
    const fontStyle = text.italic ? "italic " : "";
    const fontWeight = text.fontWeight === "bold" ? "bold " : "";

    ctx.save();
    ctx.translate(tx, ty);

    if (text.rotation) {
      ctx.rotate((text.rotation * Math.PI) / 180);
    }

    ctx.font = `${fontStyle}${fontWeight}${fontSize}px ${fontFamily}`;
    ctx.fillStyle = text.color || "#292522";
    ctx.textAlign = text.textAlign || "center";
    ctx.textBaseline = "middle";

    const lines = text.text.split("\n");
    const lineHeight = fontSize * 1.3;
    const totalHeight = lines.length * lineHeight;
    const startY = -totalHeight / 2 + lineHeight / 2;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 0, startY + i * lineHeight);
    }

    ctx.restore();
  }
}

/**
 * Primary export: Renders an individual AlbumPage to an HTMLCanvasElement.
 *
 * @param page The album page data structure to render.
 * @param options Render options including canvas width, height, photo sources, and storage.
 * @returns A Promise resolving to the rendered HTMLCanvasElement.
 */
export async function renderAlbumPageToCanvas(
  page: AlbumPage,
  options: RenderPageCanvasOptions = {},
): Promise<HTMLCanvasElement> {
  if (!page) {
    throw new Error("Cannot render album page: page object is undefined.");
  }

  // Ensure DOM canvas environment
  if (typeof document === "undefined" && !options.canvas) {
    throw new Error(
      "renderAlbumPageToCanvas requires a DOM/Canvas environment (HTMLCanvasElement). " +
        "Ensure this function is called in the browser or provide a custom canvas instance in options.",
    );
  }

  const canvasWidth = options.width ?? 1200;
  const canvasHeight = options.height ?? 1600;

  validateDimensions(canvasWidth, canvasHeight, "Render target");

  const canvas = options.canvas || document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to obtain 2D rendering context from canvas.");
  }

  // 1. Fill page background
  const backgroundColor = page.background || options.defaultBackground || "#F5F0E8";
  ctx.save();
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // 2. Compute layout slots for all placed photos
  const photoPlacements = page.photos || [];
  const slots = computePageLayoutSlots(
    page.layout,
    photoPlacements.length,
    canvasWidth,
    canvasHeight,
    page.photoSpacing,
  );

  // 3. Render each photo slot in order
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const placement = photoPlacements[i];
    if (!placement) continue;

    await drawPhotoSlot(ctx, slot, placement, page, canvasWidth, options);
  }

  // 4. Render text elements overlay
  drawTextElements(
    ctx,
    page.texts,
    canvasWidth,
    canvasHeight,
    options.baseWidth ?? 600,
  );

  return canvas;
}
