/**
 * StudioFrame Album PDF Exporter
 * Zero-dependency, pure client-side PDF 1.4 document builder for high-resolution individual album pages.
 *
 * Requirements:
 * - Exports the complete automatically generated album.
 * - Every album page becomes an individual PDF page (no spreads).
 * - Preserves exact page order and uploaded photographs.
 * - Uses the Phase 2 canvas renderer (renderAlbumPageToCanvas).
 * - Physical dimensions: Classic (8x12 in), Premium (10x12 in), Grand (12x18 in).
 * - Target 300 DPI print quality (with supported 150-300 DPI range).
 * - Supports linen, leather, and photo covers with title typography.
 * - Does not auto-select first photo as cover.
 * - Thread-safe concurrency lock and comprehensive resource cleanup.
 */

import type {
  AlbumProject,
  AlbumPage,
  AlbumOrientation,
  AlbumCoverFinish,
} from "@/types/album";
import { albumPricing } from "@/config/studio.config";
import { getAlbumPhoto } from "@/lib/album-photo-storage";
import {
  renderAlbumPageToCanvas,
  computeCoverImageDrawRect,
  type PhotoSourceMap,
} from "@/lib/album-page-canvas";

// --------------------------------------------------------------------------
// Types and Interfaces
// --------------------------------------------------------------------------

export interface AlbumPhysicalSize {
  sizeId: string;
  widthInches: number;
  heightInches: number;
  widthPt: number; // 72 PDF points per inch
  heightPt: number;
  orientation: AlbumOrientation;
}

export interface RenderCoverCanvasOptions {
  width?: number;
  height?: number;
  photoSources?: PhotoSourceMap;
  canvas?: HTMLCanvasElement;
}

export interface RenderedPdfPage {
  jpegBytes: Uint8Array;
  pixelWidth: number;
  pixelHeight: number;
  pageWidthPt: number;
  pageHeightPt: number;
  label?: string;
}

export interface BuildPdfOptions {
  pages: RenderedPdfPage[];
  title?: string;
  author?: string;
}

export interface ExportAlbumPdfOptions {
  /** Target print DPI: 150 (draft/fast) to 300 (print-ready). Defaults to 300. */
  dpi?: number;
  /** JPEG compression quality: 0.85 to 0.98. Defaults to 0.94. */
  jpegQuality?: number;
  /** Pre-resolved photo sources map (photoId -> CanvasImageSource | Blob | string). */
  photoSources?: PhotoSourceMap;
  /** Whether to include the front cover as page 1. Defaults to true. */
  includeCover?: boolean;
  /** Custom output filename. If omitted, uses generateAlbumPdfFilename(project). */
  filename?: string;
  /** Progress notification callback (progress: 0 to 100, status: string). */
  onProgress?: (progress: number, status: string) => void;
  /** Automatically trigger browser file download. Defaults to true in browser. */
  autoDownload?: boolean;
}

export interface ExportAlbumPdfResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  pdfBytes: Uint8Array;
  dimensions: AlbumPhysicalSize;
  dpi: number;
}

// Global export lock to prevent overlapping simultaneous exports
let isExportActive = false;

/**
 * Returns whether an album export is currently running.
 */
export function isAlbumExporting(): boolean {
  return isExportActive;
}

// --------------------------------------------------------------------------
// 1. Physical Dimensions & Resolution Resolution
// --------------------------------------------------------------------------

/**
 * Resolves the physical dimensions (in inches and 72-pt PDF points) for an album project.
 * Uses the configured sizes from studio.config.ts:
 * - Classic: 8 × 12 in
 * - Premium: 10 × 12 in
 * - Grand: 12 × 18 in
 */
export function resolveAlbumPhysicalDimensions(
  sizeId: string,
  orientation: AlbumOrientation = "portrait",
): AlbumPhysicalSize {
  const sizeConfig = albumPricing.sizes.find((s) => s.id === sizeId) ?? {
    id: sizeId || "classic",
    width: 8,
    height: 12,
  };

  const rawW = sizeConfig.width;
  const rawH = sizeConfig.height;

  let widthInches: number;
  let heightInches: number;

  if (orientation === "landscape") {
    widthInches = Math.max(rawW, rawH);
    heightInches = Math.min(rawW, rawH);
  } else if (orientation === "square") {
    const side = Math.min(rawW, rawH);
    widthInches = side;
    heightInches = side;
  } else {
    // Default portrait
    widthInches = Math.min(rawW, rawH);
    heightInches = Math.max(rawW, rawH);
  }

  // 72 PDF points per inch
  const widthPt = Number((widthInches * 72).toFixed(2));
  const heightPt = Number((heightInches * 72).toFixed(2));

  return {
    sizeId: sizeConfig.id,
    widthInches,
    heightInches,
    widthPt,
    heightPt,
    orientation,
  };
}

/**
 * Generates an executive, sanitized filename for the exported album PDF.
 * e.g., "StudioFrame-Florence-and-Venice-classic-20p.pdf"
 */
export function generateAlbumPdfFilename(project: AlbumProject): string {
  const safeName = (project.name || "Album")
    .replace(/[^a-zA-Z0-9_\- ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const size = project.sizeId || "classic";
  const pages = project.pages?.length ?? project.pageCount ?? 20;
  return `StudioFrame-${safeName || "Album"}-${size}-${pages}p.pdf`;
}

// --------------------------------------------------------------------------
// 2. Cover Rendering
// --------------------------------------------------------------------------

function drawCoverTypography(
  ctx: CanvasRenderingContext2D,
  title: string,
  width: number,
  height: number,
  mode: "linen" | "leather" | "photo",
) {
  ctx.save();

  const isDark = mode === "leather" || mode === "photo";
  const primaryColor = isDark ? "#FAF7F2" : "#292522";
  const goldColor = isDark ? "#D4AF37" : "#A67C43";

  // Brand Header
  const brandSize = Math.max(14, Math.round(width * 0.024));
  ctx.font = `600 ${brandSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = goldColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const brandY = mode === "photo" ? height * 0.65 : height * 0.28;
  ctx.fillText("S T U D I O F R A M E", width / 2, brandY);

  // Subtitle rule
  const ruleW = Math.max(40, width * 0.12);
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = Math.max(1, width * 0.0015);
  ctx.beginPath();
  ctx.moveTo(width / 2 - ruleW, brandY + brandSize * 1.3);
  ctx.lineTo(width / 2 + ruleW, brandY + brandSize * 1.3);
  ctx.stroke();

  // Album Title
  const titleSize = Math.max(24, Math.round(width * 0.055));
  ctx.font = `italic 700 ${titleSize}px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = primaryColor;

  const titleY = mode === "photo" ? height * 0.76 : height * 0.44;

  // Split title if long
  const words = title.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = `${currentLine} ${word}`;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width * 0.75) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);

  const lineHeight = titleSize * 1.25;
  const totalH = lines.length * lineHeight;
  const startY = titleY - totalH / 2 + lineHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], width / 2, startY + i * lineHeight);
  }

  // Footer Tagline
  const footerSize = Math.max(11, Math.round(width * 0.018));
  ctx.font = `500 ${footerSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = isDark ? "rgba(250, 247, 242, 0.7)" : "rgba(41, 37, 34, 0.65)";
  const footerLabel =
    mode === "leather"
      ? "LUXURY LEATHER HARDCOVER"
      : mode === "photo"
        ? "BESPOKE HARDCOVER PHOTOBOOK"
        : "ARCHIVAL LINEN COLLECTION";
  ctx.fillText(footerLabel, width / 2, mode === "photo" ? height * 0.88 : height * 0.78);

  ctx.restore();
}

function drawLinenCover(
  ctx: CanvasRenderingContext2D,
  title: string,
  width: number,
  height: number,
) {
  // Base linen warm tone
  ctx.fillStyle = "#B7A58B";
  ctx.fillRect(0, 0, width, height);

  // Procedural linen weave
  ctx.save();
  const step = Math.max(3, Math.round(width / 320));

  for (let x = 0; x < width; x += step) {
    const alpha = 0.04 + (Math.sin(x * 0.05) + 1) * 0.04;
    ctx.strokeStyle = x % (step * 2) === 0 ? `rgba(255,255,255,${alpha})` : `rgba(45,35,25,${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += step) {
    const alpha = 0.04 + (Math.cos(y * 0.05) + 1) * 0.04;
    ctx.strokeStyle = y % (step * 2) === 0 ? `rgba(255,255,255,${alpha})` : `rgba(45,35,25,${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // Luxury Double Hairline Inset Border
  ctx.save();
  const marginOuter = Math.round(width * 0.06);
  const marginInner = marginOuter + Math.round(width * 0.012);

  ctx.strokeStyle = "rgba(197, 160, 89, 0.75)"; // Champagne Gold
  ctx.lineWidth = Math.max(1.5, Math.round(width * 0.002));
  ctx.strokeRect(marginOuter, marginOuter, width - marginOuter * 2, height - marginOuter * 2);

  ctx.strokeStyle = "rgba(197, 160, 89, 0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(marginInner, marginInner, width - marginInner * 2, height - marginInner * 2);
  ctx.restore();

  // Debossed Gold/Charcoal Typography
  drawCoverTypography(ctx, title, width, height, "linen");
}

function drawLeatherCover(
  ctx: CanvasRenderingContext2D,
  title: string,
  width: number,
  height: number,
) {
  // Deep Saddle Leather Base
  ctx.fillStyle = "#3E2D22";
  ctx.fillRect(0, 0, width, height);

  // Procedural Leather Grain Stippling
  ctx.save();
  const dotCount = Math.round((width * height) / 1800);
  for (let i = 0; i < dotCount; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    const r = Math.random() * 2.5 + 0.5;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.arc(rx, ry, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Luxury Gold Foil Embossed Border with Corner Accents
  ctx.save();
  const margin = Math.round(width * 0.07);
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = Math.max(2, Math.round(width * 0.0025));
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // Corner Accent Flourishes
  const cLen = Math.round(width * 0.035);
  ctx.lineWidth = Math.max(3, Math.round(width * 0.004));
  // Top-left
  ctx.beginPath();
  ctx.moveTo(margin - 4, margin + cLen);
  ctx.lineTo(margin - 4, margin - 4);
  ctx.lineTo(margin + cLen, margin - 4);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - margin + 4 - cLen, margin - 4);
  ctx.lineTo(width - margin + 4, margin - 4);
  ctx.lineTo(width - margin + 4, margin + cLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(margin - 4, height - margin - cLen);
  ctx.lineTo(margin - 4, height - margin + 4);
  ctx.lineTo(margin + cLen, height - margin + 4);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - margin + 4 - cLen, height - margin + 4);
  ctx.lineTo(width - margin + 4, height - margin + 4);
  ctx.lineTo(width - margin + 4, height - margin - cLen);
  ctx.stroke();
  ctx.restore();

  // Gold Foil Debossed Typography
  drawCoverTypography(ctx, title, width, height, "leather");
}

/**
 * Renders the Cover page of an album to an HTMLCanvasElement.
 * Respects linen, leather, and photo finishes.
 * If photo finish has no cover photo selected, falls back to linen (does not auto-select photo 0).
 */
export async function renderCoverPageToCanvas(
  project: AlbumProject,
  options: RenderCoverCanvasOptions = {},
): Promise<HTMLCanvasElement> {
  if (!project) {
    throw new Error("Cannot render cover: project is undefined.");
  }

  const dims = resolveAlbumPhysicalDimensions(project.sizeId, project.orientation);
  const width = options.width ?? Math.round(dims.widthInches * 300);
  const height = options.height ?? Math.round(dims.heightInches * 300);

  const canvas = options.canvas || (typeof document !== "undefined" ? document.createElement("canvas") : null);
  if (!canvas) {
    throw new Error("renderCoverPageToCanvas requires a DOM canvas environment.");
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to obtain 2D rendering context for album cover.");
  }

  const finish = project.coverFinish || "linen";
  const title = project.name?.trim() || "Photo Album";

  if (finish === "photo") {
    let photoRendered = false;

    // Only attempt photo cover if coverPhotoId is explicitly assigned
    if (project.coverPhotoId) {
      try {
        let photoSource = options.photoSources?.[project.coverPhotoId] ?? null;

        if (!photoSource) {
          photoSource = await getAlbumPhoto(project.id, project.coverPhotoId);
        }

        if (photoSource) {
          let img: HTMLImageElement | ImageBitmap | null = null;
          let cleanup: (() => void) | undefined;

          if (photoSource instanceof Blob) {
            if (typeof createImageBitmap === "function") {
              img = await createImageBitmap(photoSource);
              cleanup = () => (img as ImageBitmap).close?.();
            } else {
              const url = URL.createObjectURL(photoSource);
              img = await new Promise<HTMLImageElement>((res, rej) => {
                const el = new Image();
                el.crossOrigin = "anonymous";
                el.onload = () => res(el);
                el.onerror = () => rej(new Error("Cover photo decode error"));
                el.src = url;
              });
              cleanup = () => URL.revokeObjectURL(url);
            }
          } else if (typeof photoSource === "string") {
            img = await new Promise<HTMLImageElement>((res, rej) => {
              const el = new Image();
              el.crossOrigin = "anonymous";
              el.onload = () => res(el);
              el.onerror = () => rej(new Error("Cover photo decode error"));
              el.src = photoSource as string;
            });
          } else if (photoSource && "width" in photoSource && "height" in photoSource) {
            img = photoSource as HTMLImageElement;
          }

          if (img) {
            try {
              const imgW = "naturalWidth" in img ? img.naturalWidth : img.width;
              const imgH = "naturalHeight" in img ? img.naturalHeight : img.height;

              const { drawX, drawY, drawW, drawH } = computeCoverImageDrawRect(
                imgW,
                imgH,
                width,
                height,
                0,
                0,
              );

              ctx.drawImage(img, drawX, drawY, drawW, drawH);

              // Elegant lower-third gradient overlay
              const grad = ctx.createLinearGradient(0, height * 0.45, 0, height);
              grad.addColorStop(0, "rgba(23, 23, 23, 0)");
              grad.addColorStop(0.45, "rgba(23, 23, 23, 0.55)");
              grad.addColorStop(1, "rgba(23, 23, 23, 0.90)");
              ctx.fillStyle = grad;
              ctx.fillRect(0, height * 0.45, width, height * 0.55);

              // Inset fine white/gold hairline frame
              const pad = Math.round(width * 0.04);
              ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
              ctx.lineWidth = 1;
              ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

              drawCoverTypography(ctx, title, width, height, "photo");
              photoRendered = true;
            } finally {
              cleanup?.();
            }
          }
        }
      } catch (err) {
        console.warn("Cover photo rendering failed, falling back to linen:", err);
      }
    }

    if (!photoRendered) {
      // Graceful fallback to linen finish without guessing or picking photo 0
      drawLinenCover(ctx, title, width, height);
    }
  } else if (finish === "leather") {
    drawLeatherCover(ctx, title, width, height);
  } else {
    // Linen
    drawLinenCover(ctx, title, width, height);
  }

  return canvas;
}

// --------------------------------------------------------------------------
// 3. Canvas to JPEG Conversion
// --------------------------------------------------------------------------

/**
 * Converts an HTMLCanvasElement into clean JPEG bytes (Uint8Array).
 */
export async function canvasToJpegBytes(
  canvas: HTMLCanvasElement,
  quality = 0.94,
): Promise<{ jpegBytes: Uint8Array; width: number; height: number }> {
  if (canvas.toBlob) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
    );
    if (blob) {
      const buffer = await blob.arrayBuffer();
      return {
        jpegBytes: new Uint8Array(buffer),
        width: canvas.width,
        height: canvas.height,
      };
    }
  }

  // Fallback to dataURL
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const base64Index = dataUrl.indexOf(",");
  if (base64Index === -1) {
    throw new Error("Failed to encode canvas to JPEG format.");
  }
  const binaryStr = atob(dataUrl.slice(base64Index + 1));
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  return {
    jpegBytes: bytes,
    width: canvas.width,
    height: canvas.height,
  };
}

// --------------------------------------------------------------------------
// 4. Multi-Page PDF 1.4 Binary Builder
// --------------------------------------------------------------------------

/**
 * Zero-dependency, standards-compliant PDF 1.4 multi-page document builder.
 * Every page is an individual PDF page with its own MediaBox, Contents stream, and DCTDecode XObject.
 */
export function buildMultiPagePdfBinary(options: BuildPdfOptions): Uint8Array {
  const { pages, title = "StudioFrame Photo Album", author = "StudioFrame" } = options;

  if (!pages || pages.length === 0) {
    throw new Error("Cannot build PDF binary: no pages provided.");
  }

  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];

  function writeAscii(str: string) {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i) & 0xff;
    }
    chunks.push(buf);
  }

  function writeBytes(bytes: Uint8Array) {
    chunks.push(bytes);
  }

  function currentPosition(): number {
    return chunks.reduce((total, c) => total + c.length, 0);
  }

  // 1. PDF Header (with 4 binary bytes to ensure 8-bit clean transfer)
  writeAscii("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  // 2. Catalog (Object 1)
  offsets.push(currentPosition());
  writeAscii("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // Prepare Kids references: Object 3, 6, 9, ... for each page
  const kids: string[] = [];
  for (let i = 0; i < pages.length; i++) {
    kids.push(`${3 + i * 3} 0 R`);
  }

  // 3. Pages Collection (Object 2)
  offsets.push(currentPosition());
  writeAscii(
    `2 0 obj\n<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pages.length} >>\nendobj\n`,
  );

  // 4. For each page: Page Object, Contents Stream, Image XObject
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const pageObjNum = 3 + i * 3;
    const contentObjNum = 4 + i * 3;
    const imageObjNum = 5 + i * 3;

    const wPt = p.pageWidthPt.toFixed(2);
    const hPt = p.pageHeightPt.toFixed(2);

    // Page Object
    offsets.push(currentPosition());
    writeAscii(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wPt} ${hPt}] /Contents ${contentObjNum} 0 R /Resources << /XObject << /Im${i} ${imageObjNum} 0 R >> >> >>\nendobj\n`,
    );

    // Content Stream
    const streamContent = `q\n${wPt} 0 0 ${hPt} 0 0 cm\n/Im${i} Do\nQ\n`;
    const streamBuf = new Uint8Array(streamContent.length);
    for (let j = 0; j < streamContent.length; j++) {
      streamBuf[j] = streamContent.charCodeAt(j) & 0xff;
    }

    offsets.push(currentPosition());
    writeAscii(
      `${contentObjNum} 0 obj\n<< /Length ${streamBuf.length} >>\nstream\n`,
    );
    writeBytes(streamBuf);
    writeAscii("\nendstream\nendobj\n");

    // Image XObject (JPEG byte stream)
    offsets.push(currentPosition());
    writeAscii(
      `${imageObjNum} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.pixelWidth} /Height ${p.pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpegBytes.length} >>\nstream\n`,
    );
    writeBytes(p.jpegBytes);
    writeAscii("\nendstream\nendobj\n");
  }

  // 5. Document Info Object
  const infoObjNum = 3 + pages.length * 3;
  offsets.push(currentPosition());
  const cleanTitle = title.replace(/[()\\]/g, "");
  const cleanAuthor = author.replace(/[()\\]/g, "");
  writeAscii(
    `${infoObjNum} 0 obj\n<< /Title (${cleanTitle}) /Author (${cleanAuthor}) /Creator (StudioFrame Engine) /Producer (StudioFrame PDF 1.4 Exporter) >>\nendobj\n`,
  );

  // 6. Cross-reference Table (xref)
  const totalObjs = infoObjNum;
  const startXref = currentPosition();
  writeAscii(`xref\n0 ${totalObjs + 1}\n`);
  writeAscii("0000000000 65535 f \n");
  for (const off of offsets) {
    writeAscii(String(off).padStart(10, "0") + " 00000 n \n");
  }

  // 7. Trailer
  writeAscii(
    `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R /Info ${infoObjNum} 0 R >>\nstartxref\n${startXref}\n%%EOF\n`,
  );

  // Concatenate all chunks
  const totalLength = chunks.reduce((total, c) => total + c.length, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }

  return result;
}

// --------------------------------------------------------------------------
// 5. Primary Export Function
// --------------------------------------------------------------------------

/**
 * Primary export: Renders the entire album project to an individual-page PDF document.
 *
 * - Every album page becomes an individual PDF page.
 * - Cover page is rendered as Page 1 (if includeCover !== false).
 * - Target 300 DPI print quality.
 * - Graceful fallback slots for missing/corrupted photographs.
 * - Prevents simultaneous duplicate exports via concurrency lock.
 * - Reuses a single canvas and cleans up memory immediately.
 */
export async function exportAlbumToPdf(
  project: AlbumProject,
  options: ExportAlbumPdfOptions = {},
): Promise<ExportAlbumPdfResult> {
  if (!project) {
    throw new Error("Cannot export album: project is undefined.");
  }
  if (!project.pages || project.pages.length === 0) {
    throw new Error("Cannot export album: project contains no pages.");
  }

  if (isExportActive) {
    throw new Error(
      "An album PDF export is already in progress. Please wait for the current export to complete.",
    );
  }

  isExportActive = true;
  const onProgress = options.onProgress ?? (() => {});

  try {
    onProgress(0, "Initializing album PDF export...");

    const dims = resolveAlbumPhysicalDimensions(project.sizeId, project.orientation);
    const targetDpi = Math.max(150, Math.min(300, options.dpi ?? 300));
    const jpegQuality = Math.max(0.8, Math.min(1.0, options.jpegQuality ?? 0.94));

    // Target pixel dimensions matching physical page size at target DPI
    const pixelWidth = Math.round(dims.widthInches * targetDpi);
    const pixelHeight = Math.round(dims.heightInches * targetDpi);

    const renderedPages: RenderedPdfPage[] = [];

    // Reusable single canvas across all pages
    const canvas =
      typeof document !== "undefined" ? document.createElement("canvas") : null;

    if (!canvas) {
      throw new Error(
        "exportAlbumToPdf requires a browser DOM environment to render canvas pages.",
      );
    }

    const includeCover = options.includeCover !== false;
    const totalSteps = (includeCover ? 1 : 0) + project.pages.length + 1;
    let completedSteps = 0;

    // 1. Render Cover Page (Page 1 of PDF)
    if (includeCover) {
      onProgress(
        Math.round((completedSteps / totalSteps) * 90),
        `Rendering album cover (${project.coverFinish || "linen"} finish)...`,
      );

      const coverCanvas = await renderCoverPageToCanvas(project, {
        width: pixelWidth,
        height: pixelHeight,
        photoSources: options.photoSources,
        canvas,
      });

      const coverJpeg = await canvasToJpegBytes(coverCanvas, jpegQuality);
      renderedPages.push({
        jpegBytes: coverJpeg.jpegBytes,
        pixelWidth: coverJpeg.width,
        pixelHeight: coverJpeg.height,
        pageWidthPt: dims.widthPt,
        pageHeightPt: dims.heightPt,
        label: "Cover",
      });

      completedSteps++;
    }

    // 2. Render Each Album Page Sequentially
    for (let i = 0; i < project.pages.length; i++) {
      const page = project.pages[i];
      const pageNum = i + 1;

      onProgress(
        Math.round((completedSteps / totalSteps) * 90),
        `Rendering page ${pageNum} of ${project.pages.length} (${page.layout} layout)...`,
      );

      // Resolve photos needed for this page on-demand
      const pagePhotoSources: PhotoSourceMap = { ...(options.photoSources || {}) };
      for (const placement of page.photos) {
        if (!pagePhotoSources[placement.photoId]) {
          try {
            const blob = await getAlbumPhoto(project.id, placement.photoId);
            if (blob) {
              pagePhotoSources[placement.photoId] = blob;
            }
          } catch (storageErr) {
            console.warn(
              `Could not retrieve photo ${placement.photoId} for page ${pageNum}:`,
              storageErr,
            );
          }
        }
      }

      // Render album page with Phase 2 canvas renderer
      const pageCanvas = await renderAlbumPageToCanvas(page, {
        width: pixelWidth,
        height: pixelHeight,
        projectId: project.id,
        photoSources: pagePhotoSources,
        canvas, // Reuse existing canvas element to avoid memory churn
        strictErrors: false, // Graceful fallback slots for missing/corrupt images
      });

      const pageJpeg = await canvasToJpegBytes(pageCanvas, jpegQuality);
      renderedPages.push({
        jpegBytes: pageJpeg.jpegBytes,
        pixelWidth: pageJpeg.width,
        pixelHeight: pageJpeg.height,
        pageWidthPt: dims.widthPt,
        pageHeightPt: dims.heightPt,
        label: `Page ${pageNum}`,
      });

      completedSteps++;
    }

    // 3. Assemble Multi-Page PDF Binary
    onProgress(92, "Assembling multi-page PDF document...");
    const pdfBytes = buildMultiPagePdfBinary({
      pages: renderedPages,
      title: project.name || "StudioFrame Photo Album",
    });

    const blob = new Blob([pdfBytes as unknown as BlobPart], {
      type: "application/pdf",
    });
    const filename = options.filename || generateAlbumPdfFilename(project);

    // 4. Trigger browser file download if in DOM and not disabled
    if (options.autoDownload !== false && typeof document !== "undefined") {
      onProgress(98, "Preparing download...");
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
    }

    onProgress(100, "Export completed successfully.");

    return {
      blob,
      filename,
      pageCount: renderedPages.length,
      pdfBytes,
      dimensions: dims,
      dpi: targetDpi,
    };
  } finally {
    isExportActive = false;
  }
}

