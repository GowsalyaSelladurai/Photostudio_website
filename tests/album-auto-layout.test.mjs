import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const autoLayoutPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/lib/album-auto-layout.ts",
);
const source = readFileSync(autoLayoutPath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const layoutModule = { exports: {} };
new Function("exports", "module", compiled.outputText)(
  layoutModule.exports,
  layoutModule,
);
const {
  distributePhotosAcrossAlbum,
  classifyPhotoOrientation,
  validateAlbumPageCount,
  validatePhotoDimensions,
  validateAlbumPhotoCapacity,
} = layoutModule.exports;

// Helper to generate mock photos with specific dimensions
function createMockPhotos(
  count,
  options = { orientation: "mixed" },
) {
  const photos = [];
  for (let i = 0; i < count; i++) {
    let width = 1200;
    let height = 800; // landscape default

    if (options.orientation === "portrait") {
      width = 800;
      height = 1200;
    } else if (options.orientation === "square") {
      width = 1000;
      height = 1000;
    } else if (options.orientation === "landscape") {
      width = 1200;
      height = 800;
    } else if (options.orientation === "mixed") {
      const mode = i % 3;
      if (mode === 0) {
        width = 800;
        height = 1200; // portrait
      } else if (mode === 1) {
        width = 1400;
        height = 800; // landscape
      } else {
        width = 1000;
        height = 1000; // square
      }
    }

    photos.push({
      id: `photo-${i + 1}-${crypto.randomUUID()}`,
      fileName: `photo_${i + 1}.jpg`,
      url: `https://demo.example.com/photo_${i + 1}.jpg`,
      width,
      height,
      fileSize: 2048576,
      uploadedAt: Date.now() + i * 10,
    });
  }
  return photos;
}

// Validation helper for all tests
function assertValidAlbumPages(pages, expectedPageCount, sourcePhotos) {
  assert.equal(pages.length, expectedPageCount, "Page count must match requested count exactly");

  const pageIds = new Set();
  const placementIds = new Set();
  const assignedPhotoIds = [];

  const validLayouts = new Set([
    "single",
    "two-photo",
    "three-photo",
    "four-grid",
    "collage",
    "full-bleed",
  ]);

  const sourcePhotoIdSet = new Set(sourcePhotos.map((p) => p.id));

  pages.forEach((page, pIdx) => {
    // Unique page ID
    assert.ok(page.id, `Page ${pIdx} must have an ID`);
    assert.ok(!pageIds.has(page.id), `Page ID ${page.id} must be unique`);
    pageIds.add(page.id);

    // Valid layout
    assert.ok(
      validLayouts.has(page.layout),
      `Page ${pIdx} has invalid layout: ${page.layout}`,
    );

    // Enforce maximum 6 photos per page
    assert.ok(
      page.photos.length <= 6,
      `Page ${pIdx} has ${page.photos.length} photos, which exceeds the maximum of 6 photos per page`,
    );

    // Background
    assert.equal(page.background, "#F5F0E8", "Default background should be Ivory #F5F0E8");
    assert.ok(Array.isArray(page.texts), "Texts must be an array");

    // Photo placements
    assert.ok(Array.isArray(page.photos), `Page ${pIdx} photos must be an array`);

    page.photos.forEach((placement, plIdx) => {
      // Unique placement ID
      assert.ok(placement.id, `Placement ${plIdx} on page ${pIdx} must have an ID`);
      assert.ok(
        !placementIds.has(placement.id),
        `Placement ID ${placement.id} must be unique across the entire album`,
      );
      placementIds.add(placement.id);

      // Photo reference
      assert.ok(
        sourcePhotoIdSet.has(placement.photoId),
        `Placement photoId ${placement.photoId} must exist in source photos`,
      );
      assignedPhotoIds.push(placement.photoId);

      // Valid transforms
      const t = placement.transform;
      assert.ok(t, "Transform must exist");
      assert.equal(typeof t.x, "number");
      assert.equal(typeof t.y, "number");
      assert.equal(typeof t.scale, "number");
      assert.equal(typeof t.rotation, "number");
      assert.equal(typeof t.cropX, "number");
      assert.equal(typeof t.cropY, "number");
      assert.equal(t.scale, 1);
      assert.equal(t.rotation, 0);
    });
  });

  // Verify no duplicate photo assignments
  const assignedSet = new Set(assignedPhotoIds);
  assert.equal(
    assignedPhotoIds.length,
    assignedSet.size,
    "No photo should ever be duplicated across pages",
  );

  // If source photos exist, all source photos must be placed
  if (sourcePhotos.length > 0) {
    assert.equal(
      assignedPhotoIds.length,
      sourcePhotos.length,
      `All ${sourcePhotos.length} photos must be assigned (found ${assignedPhotoIds.length})`,
    );

    // Verify ordering matches source photos exactly
    for (let i = 0; i < sourcePhotos.length; i++) {
      assert.equal(
        assignedPhotoIds[i],
        sourcePhotos[i].id,
        `Photo at index ${i} must preserve upload order`,
      );
    }
  }
}

// --------------------------------------------------------------------------
// Phase 1 Corrected Test Suite
// --------------------------------------------------------------------------

test("Scenario 1: 14 photos / 20 pages (sparse collection & spread distribution)", () => {
  const photos = createMockPhotos(14, { orientation: "mixed" });
  const pages = distributePhotosAcrossAlbum(photos, 20);

  assertValidAlbumPages(pages, 20, photos);

  // Opening & closing heroes
  assert.equal(pages[0].photos.length, 1, "Page 0 should have the opening hero photo");
  assert.equal(pages[19].photos.length, 1, "Page 19 should have the closing hero photo");

  // Exactly 6 intentional breathing pages
  const emptyPages = pages.filter((p) => p.photos.length === 0);
  assert.equal(emptyPages.length, 6, "There should be exactly 6 intentional breathing pages");

  // Verify spread distribution: since N = 14 >= P / 2 = 10, EVERY spread (facing pair) has at least 1 photo!
  const spreadCount = 20 / 2;
  for (let s = 0; s < spreadCount; s++) {
    const leftPhotos = pages[s * 2].photos.length;
    const rightPhotos = pages[s * 2 + 1].photos.length;
    assert.ok(
      leftPhotos + rightPhotos >= 1,
      `Spread ${s} (Pages ${s * 2} and ${s * 2 + 1}) must feature at least one photo`,
    );
  }
});

test("Scenario 2: 20 photos / 20 pages (exact 1:1 match)", () => {
  const photos = createMockPhotos(20, { orientation: "mixed" });
  const pages = distributePhotosAcrossAlbum(photos, 20);

  assertValidAlbumPages(pages, 20, photos);

  pages.forEach((page, idx) => {
    assert.equal(page.photos.length, 1, `Page ${idx} should have exactly 1 photo`);
  });
});

test("Scenario 3: 55 photos / 20 pages (dense collection, capacity planning)", () => {
  const photos = createMockPhotos(55, { orientation: "mixed" });
  const pages = distributePhotosAcrossAlbum(photos, 20);

  assertValidAlbumPages(pages, 20, photos);

  pages.forEach((page, idx) => {
    assert.ok(page.photos.length >= 1, `Page ${idx} should not be empty`);
    assert.ok(page.photos.length <= 6, `Page ${idx} must not exceed 6 photos`);
  });

  const layoutsUsed = new Set(pages.map((p) => p.layout));
  assert.ok(layoutsUsed.has("two-photo") || layoutsUsed.has("three-photo") || layoutsUsed.has("four-grid"));
});

test("Scenario 4: 40 photos / 40 pages (exact match on 40-page preset)", () => {
  const photos = createMockPhotos(40, { orientation: "mixed" });
  const pages = distributePhotosAcrossAlbum(photos, 40);

  assertValidAlbumPages(pages, 40, photos);

  pages.forEach((page, idx) => {
    assert.equal(page.photos.length, 1, `Page ${idx} should have exactly 1 photo`);
  });
});

test("Scenario 5: 100 photos / 60 pages (large album capacity)", () => {
  const photos = createMockPhotos(100, { orientation: "mixed" });
  const pages = distributePhotosAcrossAlbum(photos, 60);

  assertValidAlbumPages(pages, 60, photos);

  pages.forEach((page, idx) => {
    assert.ok(page.photos.length >= 1, `Page ${idx} must have at least 1 photo`);
    assert.ok(page.photos.length <= 6, `Page ${idx} must not exceed 6 photos`);
  });
});

test("Scenario 6: 120 photos / 20 pages (maximum capacity boundary for 20 pages)", () => {
  const photos = createMockPhotos(120, { orientation: "mixed" });
  const pages = distributePhotosAcrossAlbum(photos, 20);

  assertValidAlbumPages(pages, 20, photos);

  // Every page must have exactly 6 photos (20 * 6 = 120)
  pages.forEach((page, idx) => {
    assert.equal(page.photos.length, 6, `Page ${idx} should have exactly 6 photos at maximum capacity`);
    assert.equal(page.layout, "collage", "6 photos must use collage layout");
  });
});

test("Scenario 7: 121 photos / 20 pages (exceeds capacity, must reject with clear error)", () => {
  const photos = createMockPhotos(121, { orientation: "mixed" });
  assert.throws(
    () => distributePhotosAcrossAlbum(photos, 20),
    /Unsupported photo count: 121 photos cannot be distributed across 20 pages. Maximum supported capacity is 120 photos/,
  );
});

test("Scenario 8: 200 photos / 20 pages (exceeds capacity, must reject with clear error)", () => {
  const photos = createMockPhotos(200, { orientation: "mixed" });
  assert.throws(
    () => distributePhotosAcrossAlbum(photos, 20),
    /Unsupported photo count: 200 photos cannot be distributed across 20 pages. Maximum supported capacity is 120 photos/,
  );
});

test("Scenario 9: 200 photos / 40 pages (high capacity supported: 40 * 6 = 240)", () => {
  const photos = createMockPhotos(200, { orientation: "mixed" });
  const pages = distributePhotosAcrossAlbum(photos, 40);

  assertValidAlbumPages(pages, 40, photos);

  pages.forEach((page, idx) => {
    assert.ok(page.photos.length >= 1);
    assert.ok(page.photos.length <= 6, `Page ${idx} must not exceed 6 photos`);
  });
});

test("Scenario 10: 200 photos / 60 pages (high capacity supported: 60 * 6 = 360)", () => {
  const photos = createMockPhotos(200, { orientation: "mixed" });
  const pages = distributePhotosAcrossAlbum(photos, 60);

  assertValidAlbumPages(pages, 60, photos);

  pages.forEach((page, idx) => {
    assert.ok(page.photos.length >= 1);
    assert.ok(page.photos.length <= 6, `Page ${idx} must not exceed 6 photos`);
  });
});

test("Scenario 11: Invalid photo dimensions validation (zero, negative, NaN, Infinity, missing)", () => {
  // Zero width
  assert.throws(
    () => distributePhotosAcrossAlbum([{ id: "bad-1", width: 0, height: 800 }], 20),
    /Invalid photo dimensions/,
  );
  // Negative height
  assert.throws(
    () => distributePhotosAcrossAlbum([{ id: "bad-2", width: 1200, height: -500 }], 20),
    /Invalid photo dimensions/,
  );
  // NaN width
  assert.throws(
    () => distributePhotosAcrossAlbum([{ id: "bad-3", width: NaN, height: 800 }], 20),
    /Invalid photo dimensions/,
  );
  // Infinite height
  assert.throws(
    () => distributePhotosAcrossAlbum([{ id: "bad-4", width: 1200, height: Infinity }], 20),
    /Invalid photo dimensions/,
  );
  // Missing width
  assert.throws(
    () => distributePhotosAcrossAlbum([{ id: "bad-5", height: 800 }], 20),
    /Invalid photo dimensions/,
  );
});

test("Scenario 12: Full-bleed option boundaries (ratio 0.0 vs ratio 1.0)", () => {
  const photos = createMockPhotos(20, { orientation: "landscape" });

  // Ratio 0.0: Exactly ZERO full-bleed pages
  const pagesNoBleed = distributePhotosAcrossAlbum(photos, 20, { fullBleedRatio: 0 });
  const fullBleedCount0 = pagesNoBleed.filter((p) => p.layout === "full-bleed").length;
  assert.equal(fullBleedCount0, 0, "fullBleedRatio: 0 must generate 0 full-bleed pages");

  // Ratio 1.0: ALL eligible single-landscape pages become full-bleed (pages 1..19)
  const pagesAllBleed = distributePhotosAcrossAlbum(photos, 20, { fullBleedRatio: 1 });
  const fullBleedCount1 = pagesAllBleed.filter((p) => p.layout === "full-bleed").length;
  assert.ok(
    fullBleedCount1 >= 18,
    `fullBleedRatio: 1 should make all eligible single-landscape pages full-bleed (found ${fullBleedCount1})`,
  );
});

test("Scenario 13: Input immutability check", () => {
  const photos = createMockPhotos(15, { orientation: "mixed" });
  const originalSnapshot = JSON.stringify(photos);

  const pages = distributePhotosAcrossAlbum(photos, 20);
  assert.equal(pages.length, 20);

  const afterSnapshot = JSON.stringify(photos);
  assert.equal(
    afterSnapshot,
    originalSnapshot,
    "The distributePhotosAcrossAlbum function must never mutate the input photos array or photo objects",
  );
});

test("Scenario 14: Portrait-only collection (24 portraits / 20 pages)", () => {
  const photos = createMockPhotos(24, { orientation: "portrait" });
  const pages = distributePhotosAcrossAlbum(photos, 20);

  assertValidAlbumPages(pages, 20, photos);
  const twoPhotoPages = pages.filter((p) => p.layout === "two-photo");
  assert.ok(twoPhotoPages.length >= 2, "Portrait photos should be paired into two-photo layouts");
});

test("Scenario 15: Landscape-only collection (24 landscapes / 20 pages)", () => {
  const photos = createMockPhotos(24, { orientation: "landscape" });
  const pages = distributePhotosAcrossAlbum(photos, 20);

  assertValidAlbumPages(pages, 20, photos);
  const layouts = new Set(pages.map((p) => p.layout));
  assert.ok(layouts.has("single") || layouts.has("full-bleed"));
});

test("Scenario 16: Square-only collection (24 squares / 20 pages)", () => {
  const photos = createMockPhotos(24, { orientation: "square" });
  const pages = distributePhotosAcrossAlbum(photos, 20);

  assertValidAlbumPages(pages, 20, photos);
  pages.forEach((p) => assert.ok(p.photos.length >= 1));
});

test("Scenario 17: Empty photo collection (0 photos / 20 pages)", () => {
  const photos = [];
  const pages = distributePhotosAcrossAlbum(photos, 20);

  assert.equal(pages.length, 20);
  pages.forEach((page, idx) => {
    assert.equal(page.photos.length, 0);
    assert.equal(page.layout, "single");
    assert.equal(page.background, "#F5F0E8");
  });
});

test("Scenario 18: Invalid odd page count rejection", () => {
  const photos = createMockPhotos(10);
  assert.throws(
    () => distributePhotosAcrossAlbum(photos, 21),
    /Invalid page count: 21/,
  );
  assert.throws(
    () => distributePhotosAcrossAlbum(photos, 35),
    /Invalid page count: 35/,
  );
});

test("Scenario 19: Invalid page count below 20 or above 60 rejection", () => {
  const photos = createMockPhotos(10);
  assert.throws(
    () => distributePhotosAcrossAlbum(photos, 18),
    /Invalid page count: 18/,
  );
  assert.throws(
    () => distributePhotosAcrossAlbum(photos, 62),
    /Invalid page count: 62/,
  );
});
