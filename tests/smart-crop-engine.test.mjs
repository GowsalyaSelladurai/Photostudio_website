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

const smartCropMod = loadTsModule("@/lib/ai/smart-crop-engine");
const {
  calculateSmartCrop,
  calculateSubjectAnchor,
  computeNormalizedCropWindow,
  evaluateCropWindow,
  checkSpreadGutterConflict,
} = smartCropMod;

const canvasMod = loadTsModule("@/lib/album-page-canvas");
const {
  computeCoverImageDrawRect,
  computeContainedImageDrawRect,
} = canvasMod;

test("1. Bridal portrait close-up: keeps face in upper-third and horizontal center", () => {
  // 1200 x 1600 vertical photo in a 600 x 600 square slot
  const subjects = [
    {
      x: 0.40,
      y: 0.18,
      width: 0.20,
      height: 0.22,
      confidence: 0.98,
      type: "face",
    },
  ];

  const result = calculateSmartCrop(1200, 1600, 600, 600, subjects);

  assert.equal(result.fitMode, "cover");
  assert.equal(result.facesInView, 1);
  assert.equal(result.totalFaces, 1);
  assert.ok(result.preservedRatio >= 0.95, `Preserved ratio should be >= 0.95, got ${result.preservedRatio}`);

  // Check visible window encloses the face
  const win = computeNormalizedCropWindow(600, 600, 1200, 1600, result.cropX, result.cropY);
  assert.ok(subjects[0].x >= win.visX - 0.05, "Face left inside window");
  assert.ok(subjects[0].x + subjects[0].width <= win.visX + win.visW + 0.05, "Face right inside window");
  assert.ok(subjects[0].y >= win.visY, "Face top inside window");
  assert.ok(subjects[0].y + subjects[0].height <= win.visY + win.visH, "Face bottom inside window");
});

test("2. Couple photograph: preserves both faces side-by-side without slicing", () => {
  // 1600 x 1067 landscape photo placed in a 500 x 600 slot (narrower than image)
  const subjects = [
    { x: 0.35, y: 0.28, width: 0.12, height: 0.16, confidence: 0.95, type: "face" },
    { x: 0.53, y: 0.29, width: 0.12, height: 0.16, confidence: 0.93, type: "face" },
  ];

  const result = calculateSmartCrop(1600, 1067, 500, 600, subjects);

  assert.equal(result.facesInView, 2, "Both faces should be in view");
  assert.equal(result.totalFaces, 2);
  assert.ok(result.score > 0.85, "Score should be high for both faces preserved");
});

test("3. Full-body photograph: person detector anchors the body from head to hem", () => {
  const subjects = [
    { x: 0.45, y: 0.15, width: 0.10, height: 0.12, confidence: 0.92, type: "face" },
    { x: 0.35, y: 0.12, width: 0.30, height: 0.82, confidence: 0.88, type: "person" },
  ];

  const anchor = calculateSubjectAnchor(subjects);
  assert.ok(anchor.y >= 0.15 && anchor.y <= 0.40, `Anchor y should center around upper body, got ${anchor.y}`);

  const result = calculateSmartCrop(1200, 1600, 600, 600, subjects);
  assert.equal(result.facesInView, 1);
  assert.ok(result.preservedRatio >= 0.80);
});

test("4. Large family group photograph: 12 persons distributed across the frame", () => {
  const subjects = [];
  for (let i = 0; i < 12; i++) {
    subjects.push({
      x: 0.08 + i * 0.07,
      y: 0.30,
      width: 0.05,
      height: 0.10,
      confidence: 0.85,
      type: "face",
    });
  }

  // Placed into wide landscape slot (e.g. 1000 x 500)
  const result = calculateSmartCrop(2000, 1000, 1000, 500, subjects);
  assert.equal(result.totalFaces, 12);
  assert.equal(result.fitMode, "cover");
  assert.equal(result.facesInView, 12, "All 12 family members should fit into compatible landscape slot");
});

test("5. Aspect ratio mismatch: wide group photo in tall vertical slot automatically recommends Fit Entire Photo (contain)", () => {
  // Wide 16:9 photo (1600 x 900) placed into tall vertical half-column slot (300 x 700)
  const subjects = [
    { x: 0.10, y: 0.35, width: 0.08, height: 0.15, confidence: 0.90, type: "face" },
    { x: 0.48, y: 0.35, width: 0.08, height: 0.15, confidence: 0.92, type: "face" },
    { x: 0.82, y: 0.35, width: 0.08, height: 0.15, confidence: 0.91, type: "face" },
  ];

  const result = calculateSmartCrop(1600, 900, 300, 700, subjects);

  // In a 300x700 slot, cover mode would crop out the subjects on the edges
  assert.equal(result.fitMode, "contain", "Must recommend contain mode to avoid severing group members");
  assert.ok(result.recommendation, "Should provide actionable recommendation message");
});

test("6. Double-page spread gutter protection: shifts cropX away from physical spine crease [46%-54%] when slack exists", () => {
  // Spread width 1600 x 800 (two 800x800 pages). Image is 2400 x 800 (slack = 800px).
  // Face is positioned at image x = 0.50 (dead center).
  const subjects = [
    { x: 0.48, y: 0.30, width: 0.04, height: 0.12, confidence: 0.95, type: "face" },
  ];

  // At cropX = 0, face at 0.50 lands exactly at spread crease (normSpreadX = 0.50)
  const centerCheck = checkSpreadGutterConflict(1600, 800, 2400, 800, 0, subjects);
  assert.equal(centerCheck.conflict, true, "Center face should conflict at cropX = 0");

  // Calculate smart crop for spread
  const result = calculateSmartCrop(2400, 800, 1600, 800, subjects, { isSpread: true });

  assert.equal(result.gutterConflict, false, "Gutter conflict must be resolved by shifting cropX");
  assert.notEqual(result.cropX, 0, "cropX should be shifted away from 0");

  // Verify the shifted position leaves the face safely outside [0.46, 0.54]
  const finalCheck = checkSpreadGutterConflict(1600, 800, 2400, 800, result.cropX, subjects);
  assert.equal(finalCheck.conflict, false, "Final position must not conflict with gutter crease");
});

test("7. Double-page spread gutter protection: detects conflict when slack is zero", () => {
  // Spread width 1600 x 800. Image is exactly 1600 x 800 (zero horizontal slack).
  // Face at x = 0.50 cannot be moved without showing black void.
  const subjects = [
    { x: 0.48, y: 0.30, width: 0.04, height: 0.12, confidence: 0.95, type: "face" },
  ];

  const result = calculateSmartCrop(1600, 800, 1600, 800, subjects, { isSpread: true });

  assert.equal(result.gutterConflict, true, "Must flag gutterConflict when zero slack exists");
  assert.ok(result.gutterWarning, "Must provide gutter warning message");
});

test("8. No detected subjects: graceful fallback to centered framing", () => {
  const result = calculateSmartCrop(1600, 1200, 600, 600, []);

  assert.equal(result.cropX, 0, "cropX should default to 0 for unconstrained center");
  assert.equal(result.cropY, 0, "cropY should default to 0 for unconstrained center");
  assert.equal(result.fitMode, "cover");
  assert.equal(result.totalFaces, 0);
  assert.equal(result.facesInView, 0);
});

test("9. Low confidence detections: handles low confidence without throwing", () => {
  const lowConfSubjects = [
    { x: 0.4, y: 0.3, width: 0.2, height: 0.2, confidence: 0.15, type: "face" },
  ];

  const result = calculateSmartCrop(1200, 1600, 600, 600, lowConfSubjects);
  assert.ok(Number.isFinite(result.score));
  assert.ok(Number.isFinite(result.cropX));
  assert.ok(Number.isFinite(result.cropY));
});

test("10. Normalized crop window mathematics: satisfies [0, 1] bounds invariant", () => {
  const testCases = [
    { cw: 600, ch: 400, iw: 1200, ih: 1600, cx: -50, cy: -50 },
    { cw: 400, ch: 600, iw: 1600, ih: 1200, cx: 50, cy: 50 },
    { cw: 500, ch: 500, iw: 1000, ih: 1000, cx: 0, cy: 0 },
    { cw: 1200, ch: 600, iw: 1200, ih: 600, cx: 25, cy: -25 },
  ];

  for (const tc of testCases) {
    const win = computeNormalizedCropWindow(tc.cw, tc.ch, tc.iw, tc.ih, tc.cx, tc.cy);
    assert.ok(win.visX >= -0.0001, `visX >= 0 (got ${win.visX})`);
    assert.ok(win.visY >= -0.0001, `visY >= 0 (got ${win.visY})`);
    assert.ok(win.visW > 0 && win.visW <= 1.0001, `visW in (0, 1] (got ${win.visW})`);
    assert.ok(win.visH > 0 && win.visH <= 1.0001, `visH in (0, 1] (got ${win.visH})`);
    assert.ok(win.visX + win.visW <= 1.0001, `visX + visW <= 1 (got ${win.visX + win.visW})`);
    assert.ok(win.visY + win.visH <= 1.0001, `visY + visH <= 1 (got ${win.visY + win.visH})`);
  }
});

test("11. Preserved ratio calculation accuracy", () => {
  const win = { visX: 0.2, visY: 0.2, visW: 0.6, visH: 0.6 };
  const subjects = [
    // Completely inside
    { x: 0.3, y: 0.3, width: 0.1, height: 0.1, confidence: 1.0, type: "face" },
    // Completely outside
    { x: 0.0, y: 0.0, width: 0.1, height: 0.1, confidence: 1.0, type: "face" },
  ];

  const evalRes = evaluateCropWindow(win, subjects);
  assert.equal(evalRes.totalFaces, 2);
  assert.equal(evalRes.facesInView, 1);
  assert.ok(evalRes.preservedRatio > 0.4 && evalRes.preservedRatio < 0.6, "One of two equal weight faces preserved");
});

test("12. Contain vs Cover draw rect calculations: cover fills container completely, contain fits without overflow", () => {
  // Container 500 x 300, Image 1000 x 1000 (aspect 1:1)
  const coverRect = computeCoverImageDrawRect(500, 300, 1000, 1000, 0, 0);
  assert.ok(coverRect.drawW >= 500, `Cover drawW (${coverRect.drawW}) must be >= containerWidth (500)`);
  assert.ok(coverRect.drawH >= 300, `Cover drawH (${coverRect.drawH}) must be >= containerHeight (300)`);

  const containRect = computeContainedImageDrawRect(500, 300, 1000, 1000);
  assert.ok(containRect.drawW <= 500.001, `Contain drawW (${containRect.drawW}) must be <= containerWidth (500)`);
  assert.ok(containRect.drawH <= 300.001, `Contain drawH (${containRect.drawH}) must be <= containerHeight (300)`);
  assert.equal(containRect.drawW, 300, "For 1:1 image in 500x300, contained size is 300x300");
  assert.equal(containRect.drawH, 300);
});
