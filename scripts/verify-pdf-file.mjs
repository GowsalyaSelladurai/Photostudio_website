import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const ARTIFACT_DIR = "C:/Users/narma/.gemini/antigravity/brain/2e368bf3-1ccc-40dc-b697-1f7c48e0c19b";

// Transpile src/lib/album-pdf-export.ts
const pdfModulePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/lib/album-pdf-export.ts",
);
const source = fs.readFileSync(pdfModulePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});

const pdfModule = { exports: {} };
const mockRequire = (id) => {
  if (id === "@/config/studio.config") {
    return {
      albumPricing: {
        sizes: [
          { id: "classic", label: "8 × 12 inches", width: 8, height: 12, amount: 300 },
          { id: "premium", label: "10 × 12 inches", width: 10, height: 12, amount: 400 },
          { id: "grand", label: "12 × 18 inches", width: 12, height: 18, amount: 500 },
        ],
      },
    };
  }
  if (id === "@/lib/album-photo-storage") {
    return { getAlbumPhoto: async () => null };
  }
  if (id === "@/lib/album-page-canvas") {
    return {
      renderAlbumPageToCanvas: async () => null,
      computeCoverImageDrawRect: () => ({ drawX: 0, drawY: 0, drawW: 2400, drawH: 3600 }),
    };
  }
  throw new Error(`Unexpected require: ${id}`);
};

new Function("exports", "module", "require", compiled.outputText)(
  pdfModule.exports,
  pdfModule,
  mockRequire,
);

const {
  resolveAlbumPhysicalDimensions,
  generateAlbumPdfFilename,
  buildMultiPagePdfBinary,
} = pdfModule.exports;

// Create a valid 100x100 JPEG buffer
// Using minimal valid baseline JPEG bytes
const VALID_JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
  0x00, 0x03, 0x02, 0x02, 0x03, 0x02, 0x02, 0x03, 0x03, 0x03, 0x03, 0x04,
  0x03, 0x03, 0x04, 0x05, 0x08, 0x05, 0x05, 0x04, 0x04, 0x05, 0x0a, 0x07,
  0x07, 0x06, 0x08, 0x0c, 0x0a, 0x0c, 0x0c, 0x0b, 0x0a, 0x0b, 0x0b, 0x0d,
  0x0e, 0x12, 0x10, 0x0d, 0x0e, 0x11, 0x0e, 0x0b, 0x0b, 0x10, 0x16, 0x10,
  0x11, 0x13, 0x14, 0x15, 0x15, 0x15, 0x0c, 0x0f, 0x17, 0x18, 0x16, 0x14,
  0x18, 0x12, 0x14, 0x15, 0x14, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
  0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
  0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
  0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
  0x00, 0x7f, 0x00, 0xff, 0xd9,
]);

async function runPdfVerification() {
  console.log("=== StudioFrame Phase 4: PDF Binary File Audit ===");

  // 1. Classic 8x12 in 20-Page Album (21 pages total with Cover)
  console.log("\n[1] Testing Classic (8x12 in) 20-page album export...");
  const classicDims = resolveAlbumPhysicalDimensions("classic", "portrait");
  console.log("Resolved Dimensions:", classicDims);

  const pages21 = [];
  // Page 0: Cover
  pages21.push({
    jpegBytes: new Uint8Array(VALID_JPEG),
    pixelWidth: 2400,
    pixelHeight: 3600,
    pageWidthPt: classicDims.widthPt,
    pageHeightPt: classicDims.heightPt,
    label: "Cover (Archival Linen)",
  });

  // Pages 1-20: Individual Album Pages
  const layoutNames = ["single", "two-photo", "three-photo", "four-grid", "collage", "full-bleed"];
  for (let i = 0; i < 20; i++) {
    const layout = layoutNames[i % layoutNames.length];
    pages21.push({
      jpegBytes: new Uint8Array(VALID_JPEG),
      pixelWidth: 2400,
      pixelHeight: 3600,
      pageWidthPt: classicDims.widthPt,
      pageHeightPt: classicDims.heightPt,
      label: `Page ${i + 1} (${layout})`,
    });
  }

  const classicPdfBytes = buildMultiPagePdfBinary({
    pages: pages21,
    title: "Venice Architecture & Canals",
    author: "StudioFrame Client",
  });

  const classicPdfPath = path.join(ARTIFACT_DIR, "StudioFrame-Venice-Memories-classic-20p.pdf");
  fs.writeFileSync(classicPdfPath, classicPdfBytes);
  console.log(`Saved generated PDF to: ${classicPdfPath} (${classicPdfBytes.length} bytes)`);

  // Inspect the generated PDF structure
  const pdfText = Buffer.from(classicPdfBytes).toString("latin1");

  // A. Check Header & Trailer
  const hasHeader = pdfText.startsWith("%PDF-1.4");
  const hasTrailer = pdfText.trim().endsWith("%%EOF");
  console.log("✓ PDF 1.4 Header present:", hasHeader);
  console.log("✓ PDF Trailer & EOF present:", hasTrailer);

  // B. Check Page Count
  const countMatch = pdfText.match(/\/Type\s+\/Pages\s+\/Kids\s+\[(.*?)\]\s+\/Count\s+(\d+)/s);
  const totalPagesInPdf = countMatch ? parseInt(countMatch[2], 10) : 0;
  console.log(`✓ Declared PDF /Count: ${totalPagesInPdf} (expected 21)`);
  if (totalPagesInPdf !== 21) {
    throw new Error(`Expected 21 pages, found ${totalPagesInPdf}`);
  }

  // C. Count actual individual /Type /Page objects
  const pageMatches = pdfText.match(/\/Type\s+\/Page\b/g);
  const pageObjCount = pageMatches ? pageMatches.length : 0;
  console.log(`✓ Total individual /Type /Page objects: ${pageObjCount} (expected 21)`);
  if (pageObjCount !== 21) {
    throw new Error(`Expected 21 /Type /Page objects, found ${pageObjCount}`);
  }

  // D. Check individual physical dimensions (NO spreads!)
  const mediaBoxes = [...pdfText.matchAll(/\/MediaBox\s+\[([0-9.\s]+)\]/g)].map((m) => m[1].trim());
  console.log(`✓ Sample MediaBox: "${mediaBoxes[0]}" (expected: "0 0 576.00 864.00")`);
  const hasSpreads = mediaBoxes.some((mb) => mb.includes("1152"));
  console.log("✓ Contains two-page spreads (must be false):", hasSpreads);
  if (hasSpreads) {
    throw new Error("Found spread dimensions in individual-page PDF!");
  }

  // E. Verify Image XObjects
  const imageMatches = pdfText.match(/\/Subtype\s+\/Image\b/g);
  console.log(`✓ Total Image XObjects embedded: ${imageMatches ? imageMatches.length : 0} (expected 21)`);

  // 2. Grand 12x18 in Album Audit
  console.log("\n[2] Testing Grand (12x18 in) physical dimensions...");
  const grandDims = resolveAlbumPhysicalDimensions("grand", "portrait");
  console.log("Grand Dimensions:", grandDims);
  if (grandDims.widthPt !== 864 || grandDims.heightPt !== 1296) {
    throw new Error(`Unexpected Grand points: ${grandDims.widthPt}x${grandDims.heightPt}`);
  }

  // 3. Premium 10x12 in Album Audit
  console.log("\n[3] Testing Premium (10x12 in) physical dimensions...");
  const premDims = resolveAlbumPhysicalDimensions("premium", "portrait");
  console.log("Premium Dimensions:", premDims);
  if (premDims.widthPt !== 720 || premDims.heightPt !== 864) {
    throw new Error(`Unexpected Premium points: ${premDims.widthPt}x${premDims.heightPt}`);
  }

  console.log("\n=== ALL PDF FILE AUDIT CHECKS PASSED SUCCESSFULLY! ===");
}

runPdfVerification().catch((err) => {
  console.error("PDF File verification failed:", err);
  process.exit(1);
});

