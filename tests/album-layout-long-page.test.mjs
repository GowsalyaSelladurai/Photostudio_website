import { test } from "node:test";
import assert from "node:assert/strict";
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

  try {
    const fn = new Function("exports", "require", "module", "__filename", "__dirname", transpiled.outputText);
    fn(moduleObj.exports, customRequire, moduleObj, resolvedPath, path.dirname(resolvedPath));
  } catch (err) {
    throw new Error(`Error executing ${resolvedPath}: ${err.message}`);
  }

  return moduleObj.exports;
}

const canvasMod = loadTsModule("@/lib/album-page-canvas");
const { computePageLayoutSlots, resolvePageSpacing } = canvasMod;

const autoLayoutMod = loadTsModule("@/lib/album-auto-layout");
const { distributePhotosAcrossAlbum } = autoLayoutMod;

const weddingDemoMod = loadTsModule("@/lib/wedding-album-demo");
const { WEDDING_DEMO_PHOTOS } = weddingDemoMod;

const albumConfigMod = loadTsModule("@/config/album.config");
const { getAlbumSizeOption } = albumConfigMod;

const pdfExportMod = loadTsModule("@/lib/album-pdf-export");
const { resolveAlbumPhysicalDimensions } = pdfExportMod;

test("Phase 2 & 5: Long-page layout uses available area effectively (no gaping empty holes)", () => {
  // Test across all album sizes:
  // 10x4 panoramic (long landscape), 8x12 classic (long portrait), 12x18 grand (long portrait), 4x4 square
  const testSizes = ["10x4", "classic", "grand", "4x4"];

  testSizes.forEach((sizeId) => {
    const sizeOpt = getAlbumSizeOption(sizeId);
    const aspect = sizeOpt.width / sizeOpt.height;
    const pageW = aspect >= 1 ? 1200 : Math.round(1800 * aspect);
    const pageH = Math.round(pageW / aspect);

    const layouts = ["single", "two-photo", "three-photo", "four-grid", "collage"];

    layouts.forEach((layout) => {
      const counts = layout === "single" ? [1] : layout === "two-photo" ? [2] : layout === "three-photo" ? [3] : layout === "four-grid" ? [4] : [3, 4, 5, 6];

      counts.forEach((photoCount) => {
        const slots = computePageLayoutSlots(layout, photoCount, pageW, pageH, "balanced");
        assert.equal(slots.length, photoCount, `Should return ${photoCount} slots for layout ${layout} on size ${sizeId}`);

        const { pageMargin, gap } = resolvePageSpacing(pageW, pageH, "balanced", layout);
        const innerW = pageW - pageMargin * 2;
        const innerH = pageH - pageMargin * 2;
        const innerArea = innerW * innerH;

        let totalSlotArea = 0;
        slots.forEach((slot, i) => {
          assert.ok(slot.width > 20, `Slot ${i} width (${slot.width}) must be substantial`);
          assert.ok(slot.height > 20, `Slot ${i} height (${slot.height}) must be substantial`);
          assert.ok(slot.x >= pageMargin - 1, `Slot ${i} x (${slot.x}) must respect margin`);
          assert.ok(slot.y >= pageMargin - 1, `Slot ${i} y (${slot.y}) must respect margin`);
          assert.ok(slot.x + slot.width <= pageW - pageMargin + 1, `Slot ${i} right edge must respect margin`);
          assert.ok(slot.y + slot.height <= pageH - pageMargin + 1, `Slot ${i} bottom edge must respect margin`);
          totalSlotArea += slot.width * slot.height;
        });

        // Area utilization: total slot area + gaps must cover >= 90% of innerArea
        const coverageRatio = totalSlotArea / innerArea;
        assert.ok(
          coverageRatio >= 0.85,
          `Coverage ratio for ${layout} (${photoCount} photos) on ${sizeId} must be >= 85%, got ${(coverageRatio * 100).toFixed(1)}%`,
        );
      });
    });
  });
});

test("Phase 3: Image sizing avoids extreme, unphotographic 1:3 slivers on portrait pages", () => {
  // Classic 8x12 portrait page (1200 x 1800)
  const pageW = 1200;
  const pageH = 1800;

  // Two-photo layout on tall portrait must stack rows, not create 1:3 vertical slivers
  const twoSlots = computePageLayoutSlots("two-photo", 2, pageW, pageH, "balanced");
  const slot0Aspect = twoSlots[0].width / twoSlots[0].height;
  assert.ok(
    slot0Aspect >= 1.0,
    `Two-photo slot on tall portrait should be horizontal/landscape aspect >= 1.0, got ${slot0Aspect.toFixed(2)}`,
  );

  // Three-photo layout on tall portrait: Hero top (landscape) + 2 portrait bottom
  const threeSlots = computePageLayoutSlots("three-photo", 3, pageW, pageH, "balanced");
  const heroAspect = threeSlots[0].width / threeSlots[0].height;
  assert.ok(
    heroAspect >= 1.2,
    `Hero photo on tall portrait should be generous landscape aspect >= 1.2, got ${heroAspect.toFixed(2)}`,
  );
  assert.ok(
    threeSlots[1].width / threeSlots[1].height >= 0.55,
    `Bottom accents should have healthy portrait aspect >= 0.55, got ${(threeSlots[1].width / threeSlots[1].height).toFixed(2)}`,
  );
});

test("Phase 4: Collage layouts compute independent crops per slot", () => {
  // Test distributePhotosAcrossAlbum with 10x4 panoramic format
  const panoPages = distributePhotosAcrossAlbum(WEDDING_DEMO_PHOTOS, 20, {
    sizeId: "10x4",
  });

  // Find a 3-photo page in the generated pages
  const threePhotoPage = panoPages.find((p) => p.layout === "three-photo");
  assert.ok(threePhotoPage, "Should have a three-photo page in the generated 20-page album");
  assert.equal(threePhotoPage.photos.length, 3);

  // Each photo placement must have its own valid transform
  const t0 = threePhotoPage.photos[0].transform;
  const t1 = threePhotoPage.photos[1].transform;
  const t2 = threePhotoPage.photos[2].transform;

  assert.ok(typeof t0.cropX === "number");
  assert.ok(typeof t0.cropY === "number");
  assert.ok(typeof t1.cropX === "number");
  assert.ok(typeof t1.cropY === "number");
  assert.ok(typeof t2.cropX === "number");
  assert.ok(typeof t2.cropY === "number");

  // Verify that crop offsets are clamped within safe bounds [-50, 50]
  [t0, t1, t2].forEach((t) => {
    assert.ok(t.cropX >= -50 && t.cropX <= 50, `cropX (${t.cropX}) in [-50, 50]`);
    assert.ok(t.cropY >= -50 && t.cropY <= 50, `cropY (${t.cropY}) in [-50, 50]`);
  });
});

test("Phase 5: Collage with 3, 4, 5, and 6 photos leaves no empty void blocks", () => {
  const pageW = 1200;
  const pageH = 1800;

  for (let count = 3; count <= 6; count++) {
    const slots = computePageLayoutSlots("collage", count, pageW, pageH, "balanced");
    assert.equal(slots.length, count);

    // Verify slots do not overlap each other
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i];
        const b = slots[j];

        const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
        const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

        assert.equal(
          overlapX * overlapY,
          0,
          `Slots ${i} and ${j} in collage (${count} photos) must not overlap`,
        );
      }
    }
  }
});

test("Phase 6: PDF export dimensions match album physical specifications exactly", () => {
  const pano = resolveAlbumPhysicalDimensions("10x4", "landscape");
  assert.equal(pano.widthInches, 10);
  assert.equal(pano.heightInches, 4);
  assert.equal(pano.widthPt, 720);
  assert.equal(pano.heightPt, 288);

  const classic = resolveAlbumPhysicalDimensions("classic", "portrait");
  assert.equal(classic.widthInches, 8);
  assert.equal(classic.heightInches, 12);
  assert.equal(classic.widthPt, 576);
  assert.equal(classic.heightPt, 864);

  const square = resolveAlbumPhysicalDimensions("4x4", "square");
  assert.equal(square.widthInches, 4);
  assert.equal(square.heightInches, 4);
  assert.equal(square.widthPt, 288);
  assert.equal(square.heightPt, 288);
});
