import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { fileURLToPath } from "node:url";

// Transpile src/lib/album-pdf-export.ts for Node test runner
const pdfModulePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/lib/album-pdf-export.ts",
);
const source = readFileSync(pdfModulePath, "utf8");
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
    return {
      getAlbumPhoto: async () => null,
    };
  }
  if (id === "@/lib/album-page-canvas") {
    return {
      renderAlbumPageToCanvas: async () => ({
        width: 2400,
        height: 3600,
        getContext: () => null,
      }),
      computeCoverImageDrawRect: () => ({
        drawX: 0,
        drawY: 0,
        drawW: 2400,
        drawH: 3600,
      }),
    };
  }
  throw new Error(`Unexpected require in album-pdf-export test: ${id}`);
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
  isAlbumExporting,
  exportAlbumToPdf,
} = pdfModule.exports;

// Minimal valid 1x1 JPEG byte sequence
const MINIMAL_JPEG = new Uint8Array([
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

// Helper to convert PDF bytes to string
function pdfToString(bytes) {
  return Buffer.from(bytes).toString("latin1");
}

// --------------------------------------------------------------------------
// 1. Physical Dimensions Tests
// --------------------------------------------------------------------------

test("resolveAlbumPhysicalDimensions: Classic size (8 × 12 in) portrait", () => {
  const dims = resolveAlbumPhysicalDimensions("classic", "portrait");
  assert.equal(dims.widthInches, 8);
  assert.equal(dims.heightInches, 12);
  assert.equal(dims.widthPt, 576); // 8 * 72
  assert.equal(dims.heightPt, 864); // 12 * 72
  assert.equal(dims.orientation, "portrait");
});

test("resolveAlbumPhysicalDimensions: Classic size (8 × 12 in) landscape", () => {
  const dims = resolveAlbumPhysicalDimensions("classic", "landscape");
  assert.equal(dims.widthInches, 12);
  assert.equal(dims.heightInches, 8);
  assert.equal(dims.widthPt, 864);
  assert.equal(dims.heightPt, 576);
  assert.equal(dims.orientation, "landscape");
});

test("resolveAlbumPhysicalDimensions: Premium size (10 × 12 in) portrait", () => {
  const dims = resolveAlbumPhysicalDimensions("premium", "portrait");
  assert.equal(dims.widthInches, 10);
  assert.equal(dims.heightInches, 12);
  assert.equal(dims.widthPt, 720); // 10 * 72
  assert.equal(dims.heightPt, 864); // 12 * 72
});

test("resolveAlbumPhysicalDimensions: Premium size (10 × 12 in) landscape", () => {
  const dims = resolveAlbumPhysicalDimensions("premium", "landscape");
  assert.equal(dims.widthInches, 12);
  assert.equal(dims.heightInches, 10);
  assert.equal(dims.widthPt, 864);
  assert.equal(dims.heightPt, 720);
});

test("resolveAlbumPhysicalDimensions: Grand size (12 × 18 in) portrait", () => {
  const dims = resolveAlbumPhysicalDimensions("grand", "portrait");
  assert.equal(dims.widthInches, 12);
  assert.equal(dims.heightInches, 18);
  assert.equal(dims.widthPt, 864); // 12 * 72
  assert.equal(dims.heightPt, 1296); // 18 * 72
});

test("resolveAlbumPhysicalDimensions: Grand size (12 × 18 in) landscape", () => {
  const dims = resolveAlbumPhysicalDimensions("grand", "landscape");
  assert.equal(dims.widthInches, 18);
  assert.equal(dims.heightInches, 12);
  assert.equal(dims.widthPt, 1296);
  assert.equal(dims.heightPt, 864);
});

test("resolveAlbumPhysicalDimensions: Square orientation uses minimum side", () => {
  const dims = resolveAlbumPhysicalDimensions("classic", "square");
  assert.equal(dims.widthInches, 8);
  assert.equal(dims.heightInches, 8);
  assert.equal(dims.widthPt, 576);
  assert.equal(dims.heightPt, 576);
});

test("resolveAlbumPhysicalDimensions: Unknown size gracefully falls back to classic", () => {
  const dims = resolveAlbumPhysicalDimensions("unknown-size", "portrait");
  assert.equal(dims.widthInches, 8);
  assert.equal(dims.heightInches, 12);
  assert.equal(dims.widthPt, 576);
  assert.equal(dims.heightPt, 864);
});

// --------------------------------------------------------------------------
// 2. Filename Generation Tests
// --------------------------------------------------------------------------

test("generateAlbumPdfFilename: produces clean sanitized filename with size and page count", () => {
  const project = {
    name: "Tuscany & Florence Trip / 2026!",
    sizeId: "grand",
    pages: new Array(20),
  };
  const filename = generateAlbumPdfFilename(project);
  assert.equal(filename, "StudioFrame-Tuscany-Florence-Trip-2026-grand-20p.pdf");
});

test("generateAlbumPdfFilename: handles empty or missing name gracefully", () => {
  const project = {
    name: "",
    sizeId: "classic",
    pages: new Array(30),
  };
  const filename = generateAlbumPdfFilename(project);
  assert.equal(filename, "StudioFrame-Album-classic-30p.pdf");
});

// --------------------------------------------------------------------------
// 3. Multi-Page PDF Binary Construction Tests
// --------------------------------------------------------------------------

test("buildMultiPagePdfBinary: rejects empty pages array", () => {
  assert.throws(
    () => buildMultiPagePdfBinary({ pages: [] }),
    /no pages provided/i,
  );
});

test("buildMultiPagePdfBinary: generates valid PDF 1.4 header and trailer", () => {
  const singlePage = [
    {
      jpegBytes: MINIMAL_JPEG,
      pixelWidth: 2400,
      pixelHeight: 3600,
      pageWidthPt: 576,
      pageHeightPt: 864,
      label: "Cover",
    },
  ];

  const pdfBytes = buildMultiPagePdfBinary({
    pages: singlePage,
    title: "Test Single Page",
  });

  assert.ok(pdfBytes instanceof Uint8Array);
  const pdfStr = pdfToString(pdfBytes);

  // Check PDF Header
  assert.ok(pdfStr.startsWith("%PDF-1.4"));
  // Check Catalog Object
  assert.ok(pdfStr.includes("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>"));
  // Check Pages Object
  assert.ok(pdfStr.includes("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>"));
  // Check MediaBox on Page 1
  assert.ok(pdfStr.includes("/MediaBox [0 0 576.00 864.00]"));
  // Check Image XObject
  assert.ok(pdfStr.includes("/Type /XObject /Subtype /Image /Width 2400 /Height 3600"));
  // Check Trailer and EOF (Catalog, Pages, Page, Contents, Image, Info -> 6 objects, Size 7)
  assert.ok(pdfStr.includes("trailer\n<< /Size 7 /Root 1 0 R"));
  assert.ok(pdfStr.trim().endsWith("%%EOF"));
});

test("buildMultiPagePdfBinary: exports exact individual page count for 20-page album (1 cover + 20 pages = 21 pages)", () => {
  const pageCount = 20;
  const testPages = [];

  // Cover
  testPages.push({
    jpegBytes: MINIMAL_JPEG,
    pixelWidth: 2400,
    pixelHeight: 3600,
    pageWidthPt: 576,
    pageHeightPt: 864,
    label: "Cover",
  });

  // 20 inner pages
  for (let i = 0; i < pageCount; i++) {
    testPages.push({
      jpegBytes: MINIMAL_JPEG,
      pixelWidth: 2400,
      pixelHeight: 3600,
      pageWidthPt: 576,
      pageHeightPt: 864,
      label: `Page ${i + 1}`,
    });
  }

  assert.equal(testPages.length, 21);

  const pdfBytes = buildMultiPagePdfBinary({
    pages: testPages,
    title: "Florence Memories",
  });

  const pdfStr = pdfToString(pdfBytes);

  // Check Pages count attribute
  assert.ok(pdfStr.includes("<< /Type /Pages /Kids ["), "Pages dictionary has Kids array");
  assert.ok(pdfStr.includes("/Count 21 >>"), "Count attribute is exactly 21");

  // Check that every single page object from 0 to 20 exists as an individual Page
  for (let i = 0; i < 21; i++) {
    const pageObjNum = 3 + i * 3;
    assert.ok(
      pdfStr.includes(`${pageObjNum} 0 obj\n<< /Type /Page`),
      `Page object ${pageObjNum} exists as /Type /Page`,
    );
  }

  // Verify there are NO spread references or spread dimensions
  assert.ok(!pdfStr.includes("/MediaBox [0 0 1152"), "Does not export two-page spreads");
});

test("buildMultiPagePdfBinary: supports different album physical dimensions per page (Grand 12x18 in)", () => {
  const grandPages = [
    {
      jpegBytes: MINIMAL_JPEG,
      pixelWidth: 3600,
      pixelHeight: 5400,
      pageWidthPt: 864,
      pageHeightPt: 1296,
      label: "Cover",
    },
    {
      jpegBytes: MINIMAL_JPEG,
      pixelWidth: 3600,
      pixelHeight: 5400,
      pageWidthPt: 864,
      pageHeightPt: 1296,
      label: "Page 1",
    },
  ];

  const pdfBytes = buildMultiPagePdfBinary({
    pages: grandPages,
    title: "Grand Album",
  });

  const pdfStr = pdfToString(pdfBytes);
  assert.ok(pdfStr.includes("/MediaBox [0 0 864.00 1296.00]"));
  assert.ok(pdfStr.includes("/Width 3600 /Height 5400"));
});

test("buildMultiPagePdfBinary: cross-reference offsets and trailer validity", () => {
  const pages = [
    {
      jpegBytes: MINIMAL_JPEG,
      pixelWidth: 1200,
      pixelHeight: 1800,
      pageWidthPt: 576,
      pageHeightPt: 864,
    },
  ];

  const pdfBytes = buildMultiPagePdfBinary({ pages });
  const pdfStr = pdfToString(pdfBytes);

  // Parse startxref
  const startXrefMatch = pdfStr.match(/startxref\s+(\d+)\s+%%EOF/);
  assert.ok(startXrefMatch, "startxref position must be present");
  const xrefOffset = parseInt(startXrefMatch[1], 10);

  // Check xref header
  const xrefSlice = pdfStr.slice(xrefOffset);
  assert.ok(xrefSlice.startsWith("xref"), "Offset points directly to xref");
});

// --------------------------------------------------------------------------
// 4. Concurrency Lock & Validation Tests
// --------------------------------------------------------------------------

test("isAlbumExporting: initially false", () => {
  assert.equal(isAlbumExporting(), false);
});

test("exportAlbumToPdf: throws clear error if project is undefined or has no pages", async () => {
  await assert.rejects(
    () => exportAlbumToPdf(null),
    /project is undefined/i,
  );

  await assert.rejects(
    () => exportAlbumToPdf({ pages: [] }),
    /contains no pages/i,
  );
});
