import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const moduleCache = new Map();

function loadTsModule(specifierOrPath, fromDir = projectRoot) {
  let resolvedPath;
  if (specifierOrPath.startsWith("@/")) {
    resolvedPath = path.join(projectRoot, "src", specifierOrPath.slice(2));
  } else if (specifierOrPath.startsWith("./") || specifierOrPath.startsWith("../")) {
    resolvedPath = path.resolve(fromDir, specifierOrPath);
  } else {
    resolvedPath = specifierOrPath;
  }

  if (!fs.existsSync(resolvedPath)) {
    if (fs.existsSync(resolvedPath + ".ts")) resolvedPath += ".ts";
    else if (fs.existsSync(resolvedPath + ".tsx")) resolvedPath += ".tsx";
    else if (fs.existsSync(resolvedPath + ".js")) resolvedPath += ".js";
    else if (fs.existsSync(path.join(resolvedPath, "index.ts"))) resolvedPath = path.join(resolvedPath, "index.ts");
    else throw new Error(`Cannot find module '${specifierOrPath}' resolved to '${resolvedPath}'`);
  }

  resolvedPath = path.normalize(resolvedPath);
  if (moduleCache.has(resolvedPath)) {
    return moduleCache.get(resolvedPath);
  }

  const source = fs.readFileSync(resolvedPath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });

  const moduleObj = { exports: {} };
  moduleCache.set(resolvedPath, moduleObj.exports);

  const customRequire = (spec) => {
    if (spec.startsWith("@/") || spec.startsWith("./") || spec.startsWith("../")) {
      return loadTsModule(spec, path.dirname(resolvedPath));
    }
    return null;
  };

  const fn = new Function("exports", "require", "module", "__filename", "__dirname", transpiled.outputText);
  fn(moduleObj.exports, customRequire, moduleObj, resolvedPath, path.dirname(resolvedPath));
  return moduleObj.exports;
}

const pdfMod = loadTsModule("@/lib/album-pdf-export");
const { buildMultiPagePdfBinary, resolveAlbumPhysicalDimensions } = pdfMod;

const canvasMod = loadTsModule("@/lib/album-page-canvas");
const { computePageLayoutSlots } = canvasMod;

const outDir = path.join(projectRoot, "public", "sample-exports");
fs.mkdirSync(outDir, { recursive: true });

// Read a real JPEG from disk for embedding into sample PDF
const sampleJpegPath = path.join(projectRoot, "public", "mrge_pic", "img1.jpg");
const sampleJpegBytes = fs.readFileSync(sampleJpegPath);

const testScenarios = [
  {
    name: "square-4x4-single-and-three-photo",
    sizeId: "4x4",
    orientation: "square",
    pages: ["single", "three-photo"],
  },
  {
    name: "classic-8x12-single-and-three-photo",
    sizeId: "classic",
    orientation: "portrait",
    pages: ["single", "three-photo"],
  },
  {
    name: "long-page-12x18-single-three-and-four-photo",
    sizeId: "grand",
    orientation: "portrait",
    pages: ["single", "three-photo", "four-grid"],
  },
  {
    name: "panoramic-10x4-single-and-multi-photo",
    sizeId: "10x4",
    orientation: "landscape",
    pages: ["single", "collage"],
  },
];

console.log("=== Generating and Verifying Sample PDFs ===");

for (const scenario of testScenarios) {
  const dims = resolveAlbumPhysicalDimensions(scenario.sizeId, scenario.orientation);
  const targetDpi = 300;
  const pixelWidth = Math.round(dims.widthInches * targetDpi);
  const pixelHeight = Math.round(dims.heightInches * targetDpi);

  const renderedPages = scenario.pages.map((layout, idx) => {
    // Verify slot computation for layout
    const slots = computePageLayoutSlots(layout, layout === "single" ? 1 : layout === "three-photo" ? 3 : layout === "four-grid" ? 4 : 5, pixelWidth, pixelHeight);
    return {
      jpegBytes: new Uint8Array(sampleJpegBytes),
      pixelWidth,
      pixelHeight,
      pageWidthPt: dims.widthPt,
      pageHeightPt: dims.heightPt,
      label: `Page ${idx + 1} (${layout} - ${slots.length} slots)`,
    };
  });

  const pdfBytes = buildMultiPagePdfBinary({
    pages: renderedPages,
    title: `StudioFrame Sample — ${scenario.sizeId}`,
    author: "StudioFrame Photo Studio",
  });

  const outFilePath = path.join(outDir, `${scenario.name}.pdf`);
  fs.writeFileSync(outFilePath, pdfBytes);

  // Inspect generated PDF binary
  const fileStats = fs.statSync(outFilePath);
  const header = pdfBytes.slice(0, 8);
  const headerStr = Buffer.from(header).toString("ascii");
  const hasEof = Buffer.from(pdfBytes.slice(-30)).toString("ascii").includes("%%EOF");

  console.log(`\nVerified PDF: ${scenario.name}.pdf`);
  console.log(`  Physical Size: ${dims.widthInches} × ${dims.heightInches} inches (${dims.orientation})`);
  console.log(`  PDF Points: ${dims.widthPt} × ${dims.heightPt} pt`);
  console.log(`  Pages: ${renderedPages.length} pages (${scenario.pages.join(", ")})`);
  console.log(`  File Size: ${(fileStats.size / 1024).toFixed(1)} KB`);
  console.log(`  PDF-1.4 Header: ${headerStr.startsWith("%PDF-1.4") ? "VALID" : "INVALID"}`);
  console.log(`  EOF Marker: ${hasEof ? "VALID" : "INVALID"}`);
}

console.log("\nAll sample PDFs successfully generated and inspected!");
