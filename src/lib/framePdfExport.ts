/**
 * StudioFrame Luxury Architectural Frame Specification PDF Generator
 * Zero-dependency, pure client-side PDF 1.4 document builder.
 * Generates an executive specification sheet embedding the actual 3D WebGL frame render.
 */

export interface FramePdfSpecs {
  profileName: string;
  profileDepth: string;
  materialName: string;
  materialDescription: string;
  colorName: string;
  colorHex: string;
  sizeLabel: string;
  dimensionsText: string;
  orientation: string;
  artworkName: string | null;
  basePriceText?: string;
  materialExtraText?: string;
  totalPriceText?: string;
  priceText?: string;
  customImageDataUrl?: string;
}

/**
 * Escapes characters for PDF literal text string and sanitizes special characters.
 */
function cleanPdfText(text: string): string {
  if (!text) return "";
  return text
    .replace(/₹/g, "Rs. ")
    .replace(/×/g, "x")
    .replace(/[—–]/g, "-")
    .replace(/[•·]/g, "|")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/**
 * Extracts width and height from JPEG bytes (SOF0/SOF2 marker).
 */
function getJpegDimensions(bytes: Uint8Array): { width: number; height: number } {
  let offset = 2; // Skip 0xFFD8
  while (offset < bytes.length - 8) {
    if (bytes[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = bytes[offset + 1];
    // Baseline SOF0 (0xC0) or Progressive SOF2 (0xC2)
    if (marker === 0xc0 || marker === 0xc2) {
      const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
      const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
      return { width, height };
    }
    // Skip marker segment
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    offset += 2 + length;
  }
  return { width: 800, height: 600 };
}

/**
 * Converts an image data URL (PNG with transparency or JPEG) into clean JPEG bytes
 * rendered against an archival ivory studio background (#FAF7F2).
 */
async function dataUrlToJpegBytes(dataUrl: string): Promise<{
  jpegBytes: Uint8Array;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Cannot convert dataUrl outside browser environment."));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const width = img.naturalWidth || img.width || 800;
      const height = img.naturalHeight || img.height || 600;

      // Limit max resolution to 1800px to ensure crisp display without excessive PDF size
      const maxDim = 1800;
      let targetW = width;
      let targetH = height;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          targetW = maxDim;
          targetH = Math.max(100, Math.round((height * maxDim) / width));
        } else {
          targetH = maxDim;
          targetW = Math.max(100, Math.round((width * maxDim) / height));
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get 2D canvas context for PDF export."));
        return;
      }

      // Archival ivory background ensures transparent areas have a pristine studio appearance
      ctx.fillStyle = "#FAF7F2";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.94);
      const base64Index = jpegDataUrl.indexOf(",");
      if (base64Index === -1) {
        reject(new Error("Failed to encode canvas to JPEG."));
        return;
      }

      const binaryStr = atob(jpegDataUrl.slice(base64Index + 1));
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      resolve({
        jpegBytes: bytes,
        width: targetW,
        height: targetH,
      });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image data URL into Image element."));
    };
    img.src = dataUrl;
  });
}

/**
 * Generates an executive StudioFrame specification and pricing document in PDF 1.4.
 * Features an architectural two-column specification & financial grid, bespoke hero showcase,
 * and double-hairline luxury certification border.
 */
export function buildPdfBinary(
  jpegBytes: Uint8Array,
  imgWidth: number,
  imgHeight: number,
  specs: FramePdfSpecs,
): Uint8Array {
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];

  function writeAscii(str: string) {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i);
    }
    chunks.push(buf);
  }

  function writeBytes(bytes: Uint8Array) {
    chunks.push(bytes);
  }

  function currentPosition(): number {
    return chunks.reduce((total, c) => total + c.length, 0);
  }

  // PDF Header (binary marker ensures 8-bit clean transfer)
  writeAscii("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  // Object 1: Catalog
  offsets.push(currentPosition());
  writeAscii("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // Object 2: Pages Collection
  offsets.push(currentPosition());
  writeAscii("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  // Object 3: Page (A4 Portrait: 595.28 x 841.89 points)
  offsets.push(currentPosition());
  writeAscii(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> /XObject << /FrameImg 7 0 R >> >> >>\nendobj\n",
  );

  // Geometric layout dimensions (A4 standard: 595.28 x 841.89 pt)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 48;
  const contentWidth = pageWidth - marginX * 2; // 499.28 pt

  // Calculate 3D Preview Image Placement inside Hero Container (preserves aspect ratio)
  // Dedicated container from y = 416 to 726 (height 310 pt)
  const maxImgW = 430;
  const maxImgH = 270;
  const aspect = imgWidth / (imgHeight || 1);
  let displayW = maxImgW;
  let displayH = displayW / aspect;
  if (displayH > maxImgH) {
    displayH = maxImgH;
    displayW = displayH * aspect;
  }
  const imgX = marginX + (contentWidth - displayW) / 2;
  const imgY = 422 + (maxImgH - displayH) / 2;

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const streamOps: string[] = [
    "q",
    // --------------------------------------------------------------------------
    // Subtle Luxury Double-Hairline Border (generous 28pt margin, not crowded)
    // --------------------------------------------------------------------------
    "0.76 0.67 0.53 RG", // Soft Champagne Gold #C2A884
    "0.5 w",
    `28 28 ${pageWidth - 56} ${pageHeight - 56} re S`,
    "0.86 0.80 0.71 RG", // Delicate Gold Inset
    "0.25 w",
    `32 32 ${pageWidth - 64} ${pageHeight - 64} re S`,

    // --------------------------------------------------------------------------
    // Executive Brand Header
    // --------------------------------------------------------------------------
    // Wordmark "S T U D I O F R A M E"
    "BT",
    "/F1 16 Tf",
    "0.09 0.09 0.09 rg", // Midnight Black #171717
    `${marginX} 782 Td`,
    "(S T U D I O F R A M E) Tj",
    "ET",
    // Brand Subtitle
    "BT",
    "/F2 7.5 Tf",
    "0.55 0.45 0.32 rg", // Champagne Gold Tone
    `${marginX} 769 Td`,
    "(BESPOKE CUSTOM FRAMING) Tj",
    "ET",
    // Document Title & Reference
    "BT",
    "/F1 9 Tf",
    "0.09 0.09 0.09 rg",
    `${pageWidth - marginX - 165} 782 Td`,
    "(FRAME SPECIFICATION) Tj",
    "ET",
    "BT",
    "/F2 7.5 Tf",
    "0.43 0.39 0.35 rg", // Muted Charcoal
    `${pageWidth - marginX - 165} 769 Td`,
    `(${cleanPdfText("Document Ref: SF-" + new Date().getFullYear() + "-0428")}) Tj`,
    "ET",
    "BT",
    "/F2 7.5 Tf",
    "0.43 0.39 0.35 rg",
    `${pageWidth - marginX - 165} 757 Td`,
    `(${cleanPdfText("Issue Date: " + dateStr)}) Tj`,
    "ET",

    // Elegant Gold Header Divider Rule
    "0.76 0.67 0.53 RG",
    "0.5 w",
    `${marginX} 744 ${contentWidth} 0 re S`,

    // --------------------------------------------------------------------------
    // Hero 3D Frame Image Showcase (Gallery Pedestal Plinth)
    // --------------------------------------------------------------------------
    // Warm gallery pedestal fill
    "0.98 0.97 0.95 rg",
    `${imgX - 10} ${imgY - 8} ${displayW + 20} ${displayH + 16} re f`,
    // Subtle pedestal border
    "0.89 0.85 0.79 RG",
    "0.5 w",
    `${imgX - 10} ${imgY - 8} ${displayW + 20} ${displayH + 16} re S`,

    // Render 3D Frame Image
    "q",
    `${displayW.toFixed(2)} 0 0 ${displayH.toFixed(2)} ${imgX.toFixed(2)} ${imgY.toFixed(2)} cm`,
    "/FrameImg Do",
    "Q",

    // Showcase Caption below pedestal
    "BT",
    "/F1 8 Tf",
    "0.24 0.20 0.16 rg",
    `${marginX} 402 Td`,
    `(${cleanPdfText(
      specs.profileName +
      " Profile   |   " +
      specs.materialName +
      "   |   " +
      specs.colorName +
      "   |   " +
      specs.dimensionsText +
      "   |   " +
      specs.orientation,
    )}) Tj`,
    "ET",
  ];

  // --------------------------------------------------------------------------
  // Two-Column Architectural Information Grid
  // --------------------------------------------------------------------------
  const gridTopY = 384;
  const colGap = 16;
  const colW = (contentWidth - colGap) / 2; // ~241.64 pt
  const col1X = marginX;
  const col2X = marginX + colW + colGap;
  const gridHeight = 180;

  // --------------------------------------------------------------------------
  // Column 1: Frame Specifications (Confirmed Options Only)
  // --------------------------------------------------------------------------
  const specItems: [string, string][] = [
    ["Frame Profile", `${specs.profileName} (${specs.profileDepth})`],
    ["Frame Material", `${specs.materialName}`],
    ["Frame Colour", `${specs.colorName}`],
    ["Frame Dimensions", `${specs.sizeLabel} (${specs.dimensionsText})`],
    ["Display Orientation", specs.orientation],
    ["Mounted Artwork", specs.artworkName || "Sample Artwork"],
  ];
  const rowH = (gridHeight - 24) / specItems.length; // 26 pt

  // Column 1 Background & Border
  streamOps.push(
    "0.98 0.97 0.95 rg",
    `${col1X} ${gridTopY - gridHeight} ${colW} ${gridHeight} re f`,
    "0.76 0.67 0.53 RG",
    "0.65 w",
    `${col1X} ${gridTopY - gridHeight} ${colW} ${gridHeight} re S`,
    // Header Bar
    "0.16 0.15 0.13 rg", // Deep Charcoal #292522
    `${col1X} ${gridTopY - 24} ${colW} 24 re f`,
    "BT",
    "/F1 8.5 Tf",
    "0.96 0.94 0.91 rg", // Ivory White
    `${col1X + 10} ${gridTopY - 16} Td`,
    "(FRAME SPECIFICATIONS) Tj",
    "ET",
  );

  specItems.forEach(([label, value], idx) => {
    const rowY = gridTopY - 24 - (idx + 1) * rowH;
    // Alternating row background
    if (idx % 2 === 1) {
      streamOps.push(
        "0.95 0.94 0.91 rg",
        `${col1X + 1} ${rowY} ${colW - 2} ${rowH} re f`,
      );
    }
    // Subtle row divider line
    streamOps.push(
      "0.89 0.86 0.82 RG",
      "0.4 w",
      `${col1X + 8} ${rowY} ${colW - 16} 0 re S`,
    );
    // Label
    streamOps.push(
      "BT",
      "/F1 7.5 Tf",
      "0.22 0.19 0.16 rg",
      `${col1X + 10} ${rowY + 8} Td`,
      `(${cleanPdfText(label)}) Tj`,
      "ET",
    );
    // Value
    streamOps.push(
      "BT",
      "/F2 7.5 Tf",
      "0.36 0.32 0.28 rg",
      `${col1X + 96} ${rowY + 8} Td`,
      `(${cleanPdfText(value)}) Tj`,
      "ET",
    );
  });

  // --------------------------------------------------------------------------
  // Column 2: Confirmed Pricing Breakdown
  // --------------------------------------------------------------------------
  const pricingRows: [string, string][] = [
    ["Frame Base Price", specs.basePriceText || "Rs. 200"],
    ["Material Extra Charge", specs.materialExtraText || "Rs. 0 (Included)"],
  ];
  const pRowH = 26;

  // Column 2 Background & Border
  streamOps.push(
    "0.98 0.97 0.95 rg",
    `${col2X} ${gridTopY - gridHeight} ${colW} ${gridHeight} re f`,
    "0.76 0.67 0.53 RG",
    "0.65 w",
    `${col2X} ${gridTopY - gridHeight} ${colW} ${gridHeight} re S`,
    // Header Bar
    "0.16 0.15 0.13 rg", // Deep Charcoal
    `${col2X} ${gridTopY - 24} ${colW} 24 re f`,
    "BT",
    "/F1 8.5 Tf",
    "0.96 0.94 0.91 rg",
    `${col2X + 10} ${gridTopY - 16} Td`,
    "(PRICING BREAKDOWN) Tj",
    "ET",
  );

  pricingRows.forEach(([label, value], idx) => {
    const rowY = gridTopY - 24 - (idx + 1) * pRowH;
    if (idx % 2 === 1) {
      streamOps.push(
        "0.95 0.94 0.91 rg",
        `${col2X + 1} ${rowY} ${colW - 2} ${pRowH} re f`,
      );
    }
    streamOps.push(
      "0.89 0.86 0.82 RG",
      "0.4 w",
      `${col2X + 8} ${rowY} ${colW - 16} 0 re S`,
    );
    // Label
    streamOps.push(
      "BT",
      "/F1 7.5 Tf",
      "0.22 0.19 0.16 rg",
      `${col2X + 10} ${rowY + 8} Td`,
      `(${cleanPdfText(label)}) Tj`,
      "ET",
    );
    // Value
    streamOps.push(
      "BT",
      "/F2 7.5 Tf",
      "0.36 0.32 0.28 rg",
      `${col2X + 150} ${rowY + 8} Td`,
      `(${cleanPdfText(value)}) Tj`,
      "ET",
    );
  });

  // Confirmed note regarding colour pricing
  const noteY = gridTopY - 24 - pricingRows.length * pRowH - 14;
  streamOps.push(
    "BT",
    "/F2 7 Tf",
    "0.48 0.43 0.38 rg",
    `${col2X + 10} ${noteY} Td`,
    `(${cleanPdfText("* Colour selection incurs no additional charge.")}) Tj`,
    "ET",
  );

  // Total Price Summary Card inside Column 2
  const totalBoxY = gridTopY - gridHeight + 12;
  const totalBoxH = 52;
  streamOps.push(
    // Highlight background
    "0.96 0.94 0.90 rg",
    `${col2X + 8} ${totalBoxY} ${colW - 16} ${totalBoxH} re f`,
    // Border
    "0.76 0.67 0.53 RG",
    "0.85 w",
    `${col2X + 8} ${totalBoxY} ${colW - 16} ${totalBoxH} re S`,
    // Total Label
    "BT",
    "/F1 9.5 Tf",
    "0.09 0.09 0.09 rg",
    `${col2X + 16} ${totalBoxY + 30} Td`,
    "(TOTAL PRICE) Tj",
    "ET",
    "BT",
    "/F2 6.8 Tf",
    "0.45 0.40 0.35 rg",
    `${col2X + 16} ${totalBoxY + 16} Td`,
    "(Base price + material surcharge) Tj",
    "ET",
    // Total Price Amount
    "BT",
    "/F1 15 Tf",
    "0.55 0.41 0.16 rg", // Deep Champagne Gold #8C682A
    `${col2X + 148} ${totalBoxY + 20} Td`,
    `(${cleanPdfText(specs.totalPriceText || specs.priceText || "Rs. 200")}) Tj`,
    "ET",
  );

  // --------------------------------------------------------------------------
  // Specification Notes Panel (Factual, Confirmed Details Only)
  // --------------------------------------------------------------------------
  const notesBoxY = 126;
  const notesBoxH = 58;
  streamOps.push(
    "0.98 0.97 0.95 rg",
    `${marginX} ${notesBoxY} ${contentWidth} ${notesBoxH} re f`,
    "0.86 0.82 0.77 RG",
    "0.5 w",
    `${marginX} ${notesBoxY} ${contentWidth} ${notesBoxH} re S`,
    // Notes Header
    "BT",
    "/F1 7.5 Tf",
    "0.24 0.20 0.16 rg",
    `${marginX + 12} ${notesBoxY + 42} Td`,
    "(SPECIFICATION NOTES) Tj",
    "ET",
    // Note 1
    "BT",
    "/F2 7 Tf",
    "0.38 0.34 0.30 rg",
    `${marginX + 12} ${notesBoxY + 29} Td`,
    `(${cleanPdfText("|  Dimensions represent the custom frame's specified interior opening.")}) Tj`,
    "ET",
    // Note 2
    "BT",
    "/F2 7 Tf",
    "0.38 0.34 0.30 rg",
    `${marginX + 12} ${notesBoxY + 17} Td`,
    `(${cleanPdfText("|  3D preview rendering accurately reflects the selected moulding profile and material finish.")}) Tj`,
    "ET",
    // Note 3
    "BT",
    "/F2 7 Tf",
    "0.38 0.34 0.30 rg",
    `${marginX + 12} ${notesBoxY + 5} Td`,
    `(${cleanPdfText("|  Total price reflects published frame profile base pricing and selected material charges.")}) Tj`,
    "ET",
  );

  // --------------------------------------------------------------------------
  // Elegant Atelier Footer
  // --------------------------------------------------------------------------
  streamOps.push(
    "0.76 0.67 0.53 RG",
    "0.5 w",
    `${marginX} 54 ${contentWidth} 0 re S`,
    "BT",
    "/F2 7.5 Tf",
    "0.48 0.43 0.39 rg",
    `${marginX} 42 Td`,
    "(STUDIOFRAME   |   CUSTOM SPECIFICATION SHEET) Tj",
    "ET",
    "BT",
    "/F1 7.5 Tf",
    "0.48 0.43 0.39 rg",
    `${pageWidth - marginX - 60} 42 Td`,
    "(PAGE 1 OF 1) Tj",
    "ET",
    "Q",
  );

  const streamContent = streamOps.join("\n");
  const streamBytes = new TextEncoder().encode(streamContent);

  // Object 4: Page Content Stream
  offsets.push(currentPosition());
  writeAscii(
    `4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n`,
  );
  writeBytes(streamBytes);
  writeAscii("\nendstream\nendobj\n");

  // Object 5: Font F1 (Helvetica-Bold)
  offsets.push(currentPosition());
  writeAscii(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n",
  );

  // Object 6: Font F2 (Helvetica)
  offsets.push(currentPosition());
  writeAscii(
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n",
  );

  // Object 7: Image XObject
  offsets.push(currentPosition());
  writeAscii(
    `7 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
  );
  writeBytes(jpegBytes);
  writeAscii("\nendstream\nendobj\n");

  // Cross-reference table
  const startXref = currentPosition();
  writeAscii(`xref\n0 8\n0000000000 65535 f \n`);
  for (const off of offsets) {
    writeAscii(String(off).padStart(10, "0") + " 00000 n \n");
  }

  // Trailer
  writeAscii(
    `trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`,
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

/**
 * Captures the current Three.js WebGL canvas from the 3D preview container.
 */
export async function captureCurrentFrameCanvas(): Promise<{
  jpegBytes: Uint8Array;
  width: number;
  height: number;
} | null> {
  if (typeof document === "undefined") return null;

  const canvas = document.querySelector(".fs-stage-wrap canvas") as HTMLCanvasElement | null;
  if (!canvas) {
    throw new Error("Frame 3D preview canvas could not be found.");
  }

  const dataUrl = canvas.toDataURL("image/jpeg", 0.94);
  const base64Index = dataUrl.indexOf(",");
  if (base64Index === -1) {
    throw new Error("Failed to encode canvas drawing buffer.");
  }

  const binaryStr = atob(dataUrl.slice(base64Index + 1));
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const dims = getJpegDimensions(bytes);
  return {
    jpegBytes: bytes,
    width: dims.width || canvas.width,
    height: dims.height || canvas.height,
  };
}

/**
 * Generates and triggers the immediate download of the StudioFrame specification PDF.
 */
export async function downloadFramePreviewPdf(specs: FramePdfSpecs): Promise<void> {
  let capture: { jpegBytes: Uint8Array; width: number; height: number } | null = null;
  if (specs.customImageDataUrl) {
    try {
      capture = await dataUrlToJpegBytes(specs.customImageDataUrl);
    } catch (conversionErr) {
      console.warn(
        "Failed to convert custom image dataUrl to JPEG, falling back to canvas capture:",
        conversionErr,
      );
    }
  }
  if (!capture) {
    capture = await captureCurrentFrameCanvas();
  }
  if (!capture) {
    throw new Error("Unable to capture 3D frame canvas.");
  }

  const pdfBytes = buildPdfBinary(
    capture.jpegBytes,
    capture.width,
    capture.height,
    specs,
  );

  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "StudioFrame-Preview.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);
}

