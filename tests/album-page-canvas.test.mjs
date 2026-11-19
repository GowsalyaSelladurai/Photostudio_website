import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const canvasModulePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/lib/album-page-canvas.ts",
);
const source = readFileSync(canvasModulePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});

const canvasModule = { exports: {} };
const mockRequire = (id) => {
  if (id === "@/lib/album-photo-storage") {
    return {
      getAlbumPhoto: async () => null,
    };
  }
  throw new Error(`Unexpected require: ${id}`);
};

new Function("exports", "module", "require", compiled.outputText)(
  canvasModule.exports,
  canvasModule,
  mockRequire,
);

const {
  validateDimensions,
  resolvePageSpacing,
  computePageLayoutSlots,
  resolveFrameDimensions,
  resolveCornerRadius,
  resolveShadowSettings,
  computeCoverImageDrawRect,
  resolveFontFamily,
  renderAlbumPageToCanvas,
} = canvasModule.exports;

test("validateDimensions: accepts valid positive finite numbers", () => {
  const result = validateDimensions(1200, 1600);
  assert.equal(result.width, 1200);
  assert.equal(result.height, 1600);
});

test("validateDimensions: rejects zero, negative, NaN, and non-finite numbers", () => {
  assert.throws(
    () => validateDimensions(0, 1600),
    /Invalid Canvas width: expected a positive finite number/,
  );
  assert.throws(
    () => validateDimensions(-500, 1600),
    /Invalid Canvas width: expected a positive finite number/,
  );
  assert.throws(
    () => validateDimensions(NaN, 1600),
    /Invalid Canvas width: expected a positive finite number/,
  );
  assert.throws(
    () => validateDimensions(Infinity, 1600),
    /Invalid Canvas width: expected a positive finite number/,
  );
  assert.throws(
    () => validateDimensions(1200, 0),
    /Invalid Canvas height: expected a positive finite number/,
  );
  assert.throws(
    () => validateDimensions(1200, -100),
    /Invalid Canvas height: expected a positive finite number/,
  );
  assert.throws(
    () => validateDimensions(1200, "1600"),
    /Invalid Canvas height: expected a positive finite number/,
  );
});

test("resolvePageSpacing: full-bleed produces zero margin and zero gap", () => {
  const spacing = resolvePageSpacing(1200, 1600, "balanced", "full-bleed");
  assert.equal(spacing.pageMargin, 0);
  assert.equal(spacing.gap, 0);
});

test("resolvePageSpacing: spacing presets scale proportionally (compact < balanced < spacious)", () => {
  const compact = resolvePageSpacing(1200, 1600, "compact", "two-photo");
  const balanced = resolvePageSpacing(1200, 1600, "balanced", "two-photo");
  const spacious = resolvePageSpacing(1200, 1600, "spacious", "two-photo");

  assert.ok(compact.gap > 0);
  assert.ok(compact.gap < balanced.gap);
  assert.ok(balanced.gap < spacious.gap);
  assert.equal(compact.pageMargin, balanced.pageMargin);
});

test("computePageLayoutSlots: single layout creates 1 centered slot within margins", () => {
  const slots = computePageLayoutSlots("single", 1, 1200, 1600);
  assert.equal(slots.length, 1);
  const slot = slots[0];
  assert.equal(slot.index, 0);
  assert.ok(slot.x > 0);
  assert.ok(slot.y > 0);
  assert.equal(slot.x + slot.width, 1200 - slot.x);
  assert.equal(slot.y + slot.height, 1600 - slot.y);
});

test("computePageLayoutSlots: full-bleed layout occupies 100% of canvas area", () => {
  const slots = computePageLayoutSlots("full-bleed", 1, 1200, 1600);
  assert.equal(slots.length, 1);
  const slot = slots[0];
  assert.equal(slot.index, 0);
  assert.equal(slot.x, 0);
  assert.equal(slot.y, 0);
  assert.equal(slot.width, 1200);
  assert.equal(slot.height, 1600);
});

test("computePageLayoutSlots: two-photo layout creates 2 equal side-by-side columns", () => {
  const slots = computePageLayoutSlots("two-photo", 2, 1200, 1600);
  assert.equal(slots.length, 2);

  const [col0, col1] = slots;
  assert.equal(col0.index, 0);
  assert.equal(col1.index, 1);
  assert.equal(col0.y, col1.y);
  assert.equal(col0.height, col1.height);
  assert.equal(col0.width, col1.width);
  assert.ok(col1.x > col0.x + col0.width); // Positive gap between columns
});

test("computePageLayoutSlots: three-photo layout has left hero column and 2 stacked right cells", () => {
  const slots = computePageLayoutSlots("three-photo", 3, 1200, 1600);
  assert.equal(slots.length, 3);

  const [hero, top, bottom] = slots;
  // Hero spans full inner height
  assert.ok(hero.height > top.height);
  assert.ok(hero.height > bottom.height);

  // Top and bottom share right column x
  assert.equal(top.x, bottom.x);
  assert.equal(top.width, bottom.width);
  assert.ok(bottom.y > top.y + top.height); // Gap between stacked rows
});

test("computePageLayoutSlots: three-photo layout gracefully falls back with 1 photo", () => {
  const slots = computePageLayoutSlots("three-photo", 1, 1200, 1600);
  assert.equal(slots.length, 1);
  assert.ok(slots[0].width > 1000);
  assert.ok(slots[0].height > 1400);
});

test("computePageLayoutSlots: four-grid layout produces 4 symmetrical quadrants", () => {
  const slots = computePageLayoutSlots("four-grid", 4, 1200, 1600);
  assert.equal(slots.length, 4);

  const [tl, tr, bl, br] = slots;
  assert.equal(tl.width, tr.width);
  assert.equal(tl.width, bl.width);
  assert.equal(tl.width, br.width);

  assert.equal(tl.height, tr.height);
  assert.equal(tl.height, bl.height);
  assert.equal(tl.height, br.height);

  assert.equal(tl.x, bl.x);
  assert.equal(tr.x, br.x);
  assert.equal(tl.y, tr.y);
  assert.equal(bl.y, br.y);
});

test("computePageLayoutSlots: collage layout handles 1, 2, 3, and 6 photos", () => {
  // 1 photo
  const c1 = computePageLayoutSlots("collage", 1, 1200, 1600);
  assert.equal(c1.length, 1);

  // 2 photos
  const c2 = computePageLayoutSlots("collage", 2, 1200, 1600);
  assert.equal(c2.length, 2);
  assert.equal(c2[0].width, c2[1].width);

  // 3 photos
  const c3 = computePageLayoutSlots("collage", 3, 1200, 1600);
  assert.equal(c3.length, 3);
  assert.ok(c3[0].width > c3[1].width); // Hero is 2x2 grid units

  // 6 photos
  const c6 = computePageLayoutSlots("collage", 6, 1200, 1600);
  assert.equal(c6.length, 6);
  assert.ok(c6[0].width > c6[1].width);
});

test("computePageLayoutSlots: zero photos returns empty array", () => {
  assert.deepEqual(computePageLayoutSlots("single", 0, 1200, 1600), []);
  assert.deepEqual(computePageLayoutSlots("collage", 0, 1200, 1600), []);
});

test("computePageLayoutSlots: rejects invalid/unsupported layout type", () => {
  assert.throws(
    () => computePageLayoutSlots("nonexistent-layout", 1, 1200, 1600),
    /Unsupported album layout/,
  );
});

test("Slot containment: all slots across all layouts stay strictly inside canvas boundaries", () => {
  const layouts = [
    "single",
    "two-photo",
    "three-photo",
    "four-grid",
    "collage",
    "full-bleed",
  ];
  const testDimensions = [
    { w: 1200, h: 1600 },
    { w: 1600, h: 1200 },
    { w: 1400, h: 1400 },
  ];

  for (const layout of layouts) {
    for (const dim of testDimensions) {
      for (const count of [1, 2, 3, 4, 6]) {
        const slots = computePageLayoutSlots(layout, count, dim.w, dim.h);
        for (const slot of slots) {
          assert.ok(slot.x >= 0, `Slot x must be >= 0: ${slot.x}`);
          assert.ok(slot.y >= 0, `Slot y must be >= 0: ${slot.y}`);
          assert.ok(
            slot.x + slot.width <= dim.w + 0.001,
            `Slot right edge exceeds width: ${slot.x + slot.width} > ${dim.w}`,
          );
          assert.ok(
            slot.y + slot.height <= dim.h + 0.001,
            `Slot bottom edge exceeds height: ${slot.y + slot.height} > ${dim.h}`,
          );
        }
      }
    }
  }
});

test("resolveFrameDimensions: correctly configures thin, elegant, polaroid, and none", () => {
  const none = resolveFrameDimensions("none", 1200);
  assert.equal(none.borderWidth, 0);

  const thin = resolveFrameDimensions("thin", 1200);
  assert.ok(thin.borderWidth > 0);
  assert.equal(thin.borderColor, "#FFFFFF");

  const elegant = resolveFrameDimensions("elegant", 1200);
  assert.ok(elegant.borderWidth > 0);
  assert.equal(elegant.borderColor, "#B99B70");

  const polaroid = resolveFrameDimensions("polaroid", 1200);
  assert.ok(polaroid.paddingBottom > polaroid.paddingTop * 2); // Distinct polaroid chin
  assert.equal(polaroid.backgroundColor, "#FFFFFF");
});

test("resolveCornerRadius: scales square, subtle, and rounded correctly", () => {
  assert.equal(resolveCornerRadius("square", 1200), 0);
  const subtle = resolveCornerRadius("subtle", 1200);
  const rounded = resolveCornerRadius("rounded", 1200);
  assert.ok(subtle > 0);
  assert.ok(rounded > subtle);
});

test("resolveShadowSettings: returns null for none, valid settings for soft and premium", () => {
  assert.equal(resolveShadowSettings("none", 1200), null);
  const soft = resolveShadowSettings("soft", 1200);
  const premium = resolveShadowSettings("premium", 1200);

  assert.ok(soft);
  assert.ok(premium);
  assert.ok(premium.blur > soft.blur);
  assert.ok(premium.offsetY > soft.offsetY);
});

test("computeCoverImageDrawRect: centers image with cropX=0 and cropY=0", () => {
  // Container: 400x400 square. Image: 800x400 landscape.
  // Cover scale: max(400/800, 400/400) = 1.0. Draw size = 800x400.
  const rect = computeCoverImageDrawRect(400, 400, 800, 400, 0, 0);
  assert.equal(rect.drawW, 800);
  assert.equal(rect.drawH, 400);
  // Center: drawX = (400 - 800) * 0.5 - 200 = -200 - 200 = -400? Wait:
  // left = (400 - 800) * 0.5 = -200. Relative to center (200, 200): drawX = -200 - 200 = -400.
  // Image span is [-400, 400] relative to center, width = 800, perfectly centered at 0!
  assert.equal(rect.drawX, -400);
  assert.equal(rect.drawY, -200);
});

test("computeCoverImageDrawRect: panning with cropX adjusts draw position predictably", () => {
  const centered = computeCoverImageDrawRect(400, 400, 800, 400, 0, 0);
  const pannedLeft = computeCoverImageDrawRect(400, 400, 800, 400, -50, 0);
  const pannedRight = computeCoverImageDrawRect(400, 400, 800, 400, 50, 0);

  assert.ok(pannedLeft.drawX > centered.drawX);
  assert.ok(pannedRight.drawX < centered.drawX);
});

test("resolveFontFamily: returns valid CSS font family fallbacks", () => {
  assert.ok(resolveFontFamily("serif").includes("Georgia"));
  assert.ok(resolveFontFamily("sans").includes("Arial"));
  assert.ok(resolveFontFamily("elegant").includes("Palatino"));
});

test("renderAlbumPageToCanvas: rejects when called outside DOM environment", async () => {
  const dummyPage = {
    id: "p-1",
    layout: "single",
    photos: [],
    texts: [],
    background: "#F5F0E8",
  };

  await assert.rejects(
    () => renderAlbumPageToCanvas(dummyPage),
    /renderAlbumPageToCanvas requires a DOM\/Canvas environment/,
  );
});

test("renderAlbumPageToCanvas: rejects when page object is undefined", async () => {
  await assert.rejects(
    () => renderAlbumPageToCanvas(undefined),
    /Cannot render album page: page object is undefined/,
  );
});
