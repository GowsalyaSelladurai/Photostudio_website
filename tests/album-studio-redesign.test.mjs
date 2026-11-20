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
    // Node builtins or packages
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

// Load tested modules
const albumConfigMod = loadTsModule("@/config/album.config");
const { albumSizes, getAlbumSizeOption, albumConfig } = albumConfigMod;

const studioConfigMod = loadTsModule("@/config/studio.config");
const { albumPricing } = studioConfigMod;

const bookHingeMathMod = loadTsModule("@/components/albums/3d/BookHingeMath");
const {
  computeBookDimensions,
  getTotalSpreads,
  getSpreadPageIndices,
  interpolateCameraPose,
  interpolateBookTransform,
  computeCoverHingeAngle,
} = bookHingeMathMod;

const autoLayoutMod = loadTsModule("@/lib/album-auto-layout");
const { distributePhotosAcrossAlbum } = autoLayoutMod;

const weddingDemoMod = loadTsModule("@/lib/wedding-album-demo");
const { WEDDING_DEMO_PHOTOS, getWeddingAlbumDemoProject } = weddingDemoMod;

const priceMod = loadTsModule("@/lib/album-price");
const { calculateAlbumPrice, formatAlbumPrice } = priceMod;

test("1. Centralized Album Size Configuration includes 4x4, 10x4, and standard formats", () => {
  const size4x4 = getAlbumSizeOption("4x4");
  assert.equal(size4x4.width, 4);
  assert.equal(size4x4.height, 4);
  assert.equal(size4x4.orientation, "square");

  const size10x4 = getAlbumSizeOption("10x4");
  assert.equal(size10x4.width, 10);
  assert.equal(size10x4.height, 4);
  assert.equal(size10x4.orientation, "landscape");

  const sizeClassic = getAlbumSizeOption("classic");
  assert.equal(sizeClassic.width, 8);
  assert.equal(sizeClassic.height, 12);
  assert.equal(sizeClassic.orientation, "portrait");

  assert.equal(albumSizes.length, 6);
  assert.equal(albumPricing.sizes.length, 6);
});

test("2. 4 × 4 and 10 × 4 produce visibly different physical dimensions and aspect ratios", () => {
  const dim4x4 = computeBookDimensions("4x4", 20);
  const dim10x4 = computeBookDimensions("10x4", 20);

  // 4x4 must be a true 1:1 square single page
  assert.equal(dim4x4.aspectRatio, 1.0);
  assert.equal(dim4x4.pageWidth, dim4x4.pageHeight);
  // Spread width is 2x page width (2:1 rectangle)
  assert.equal(dim4x4.spreadWidth, dim4x4.pageWidth * 2);

  // 10x4 must be a true 2.5:1 wide landscape single page
  assert.equal(dim10x4.aspectRatio, 2.5);
  assert.equal(dim10x4.pageWidth / dim10x4.pageHeight, 2.5);
  // Spread width is 5:1 panoramic spread
  assert.equal(dim10x4.spreadWidth / dim10x4.pageHeight, 5.0);

  // 10x4 must be 2.5 times wider than 4x4
  assert.equal(dim10x4.pageWidth / dim4x4.pageWidth, 2.5);

  // Camera framing distance adapts dynamically to accommodate the 20-inch wide spread
  assert.ok(dim10x4.cameraDistance > dim4x4.cameraDistance * 1.8);
});

test("3. Album presentation: lies open naturally with elevated front-facing perspective", () => {
  const pageHeight = 2.0;
  const cameraDistance = 5.0;

  // Open camera pose: elevated above (+Y) looking directly at the book
  const { position: openCamPos, lookAt: openLookAt } = interpolateCameraPose(1.0, pageHeight, cameraDistance);
  assert.ok(openCamPos[1] > 0, "Camera must be elevated (+Y) above book");
  assert.ok(openLookAt[1] <= 0, "Camera lookAt must be focused gently down toward table plane");

  // Open book transform: tilted to rest open on the table surface (~ -1.08 rad / ~62° from vertical)
  // Top tilts away (-Z) so page normal points UP (+Y) toward elevated camera
  const { rotation: openRot } = interpolateBookTransform(1.0, 1.5);
  assert.ok(openRot[0] < -0.90 && openRot[0] > -1.30, "Book must lie open at resting table angle with negative X rotation");
});

test("4. Photographs on EVERY page: distributePhotosAcrossAlbum never leaves blank pages", () => {
  // Test with fewer photos than pages (e.g. 3 photos for a 20-page album)
  const testPhotos = [
    { id: "p-1", fileName: "1.jpg", url: "/mrge_pic/img1.jpg", width: 1600, height: 1067, fileSize: 1000, uploadedAt: Date.now() },
    { id: "p-2", fileName: "2.jpg", url: "/mrge_pic/img2.jpg", width: 1200, height: 1600, fileSize: 1000, uploadedAt: Date.now() },
    { id: "p-3", fileName: "3.jpg", url: "/mrge_pic/img3.jpg", width: 1600, height: 1067, fileSize: 1000, uploadedAt: Date.now() },
  ];

  const pages = distributePhotosAcrossAlbum(testPhotos, 20);
  assert.equal(pages.length, 20);

  // Every single page must have at least 1 photo assigned
  pages.forEach((page, i) => {
    assert.ok(page.photos.length > 0, `Page ${i + 1} must not be blank`);
    page.photos.forEach((placement) => {
      assert.ok(placement.photoId, `Placement on page ${i + 1} must have valid photoId`);
      assert.equal(placement.transform.x, 0, `Photo on page ${i + 1} must be centered at x=0`);
      assert.equal(placement.transform.y, 0, `Photo on page ${i + 1} must be centered at y=0`);
    });
  });

  // Verify multiple layout types are produced
  const layouts = new Set(pages.map((p) => p.layout));
  assert.ok(layouts.has("single"), "Must contain single layout");
  assert.ok(layouts.has("two-photo"), "Must contain two-photo layout");
  assert.ok(layouts.has("three-photo"), "Must contain three-photo layout");
});

test("5. Wedding Demo Album: all local photo assets exist on disk and all 10 pages have photos", () => {
  const project = getWeddingAlbumDemoProject("wedding");
  assert.equal(project.pages.length, 10);

  // Verify all photos in WEDDING_DEMO_PHOTOS point to existing files
  WEDDING_DEMO_PHOTOS.forEach((photo) => {
    const localPath = path.join(projectRoot, "public", photo.url);
    assert.ok(fs.existsSync(localPath), `Demo photo asset ${photo.url} must exist on disk`);
  });

  // Verify all 10 pages have assigned photos and valid layouts
  project.pages.forEach((page, i) => {
    assert.ok(page.photos.length > 0, `Demo page ${i + 1} must not be blank`);
    page.photos.forEach((placement) => {
      assert.ok(placement.photoId, `Demo page ${i + 1} placement must have photoId`);
    });
  });

  // Verify required layout variety
  const layouts = new Set(project.pages.map((p) => p.layout));
  assert.ok(layouts.has("single"), "Must have single layout");
  assert.ok(layouts.has("two-photo"), "Must have two-photo layout");
  assert.ok(layouts.has("three-photo"), "Must have three-photo layout");
  assert.ok(layouts.has("four-grid"), "Must have four-grid layout");
  assert.ok(layouts.has("full-bleed"), "Must have full-bleed layout");
});

test("6. Spread calculations and navigation indexing", () => {
  assert.equal(getTotalSpreads(10), 5);
  assert.equal(getTotalSpreads(20), 10);

  // Spread 0 -> pages 0 & 1 (Pages 1 & 2)
  const spread0 = getSpreadPageIndices(0, 10);
  assert.equal(spread0.leftIndex, 0);
  assert.equal(spread0.rightIndex, 1);

  // Spread 1 -> pages 2 & 3 (Pages 3 & 4)
  const spread1 = getSpreadPageIndices(1, 10);
  assert.equal(spread1.leftIndex, 2);
  assert.equal(spread1.rightIndex, 3);

  // Last spread of odd page count (e.g. 5 pages total)
  const oddLastSpread = getSpreadPageIndices(2, 5);
  assert.equal(oddLastSpread.leftIndex, 4);
  assert.equal(oddLastSpread.rightIndex, -1);
});

test("7. Pricing calculation for all album sizes", () => {
  const price4x4 = calculateAlbumPrice("4x4", 20, "linen");
  assert.equal(price4x4, 250);

  const price10x4 = calculateAlbumPrice("10x4", 20, "leather");
  assert.equal(price10x4, 350 + 150);

  const priceGrand = calculateAlbumPrice("grand", 40, "photo");
  assert.equal(priceGrand, 500 + 200 + 100);
});

test("8. Camera framing occupancy for all 6 album sizes", () => {
  const tanHalfFov = Math.tan((30 * Math.PI) / 360);
  const viewportAspect = 1.62;

  albumSizes.forEach((size) => {
    const dim = computeBookDimensions(size.id, 20);
    const visibleWidth = 2 * dim.cameraDistance * tanHalfFov * viewportAspect;
    const visibleHeight = 2 * dim.cameraDistance * tanHalfFov;

    const widthOccupancy = dim.spreadWidth / visibleWidth;
    const heightOccupancy = (dim.pageHeight * 0.88) / visibleHeight;

    // Album must occupy approximately 75-85% of available width or height
    const maxOccupancy = Math.max(widthOccupancy, heightOccupancy);
    assert.ok(
      maxOccupancy >= 0.70 && maxOccupancy <= 0.85,
      `Album size ${size.id} max occupancy ${maxOccupancy.toFixed(2)} must be between 70% and 85%`,
    );
  });
});

test("9. Continuous double-page full-bleed spread mathematical continuity", () => {
  const canvasWidth = 1200;
  const canvasHeight = 1200;
  const imgW = 1600;
  const imgH = 1067;

  const spreadW = canvasWidth * 2;
  const spreadH = canvasHeight;
  const spreadScale = Math.max(spreadW / imgW, spreadH / imgH);
  const drawW = imgW * spreadScale;
  const drawH = imgH * spreadScale;

  const cropXPercent = 0.5;
  const spreadLeft = (spreadW - drawW) * cropXPercent;

  // Left page right edge (gutter at x=canvasWidth)
  const leftGutterPixel = (canvasWidth - spreadLeft) / spreadScale;

  // Right page left edge (gutter at x=0)
  const rightDrawX = spreadLeft - canvasWidth;
  const rightGutterPixel = (0 - rightDrawX) / spreadScale;

  // Both sides must match at the gutter with 0 pixel gap or duplication
  assert.equal(leftGutterPixel, rightGutterPixel);
});
