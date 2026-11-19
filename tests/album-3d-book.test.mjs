import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const bookModulePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/albums/Album3DBook.tsx",
);
const source = readFileSync(bookModulePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.ReactJSX,
  },
});

const bookModule = { exports: {} };
const mockRequire = (id) => {
  if (id === "@/config/studio.config") {
    return {
      albumPricing: {
        sizes: [
          { id: "classic", width: 8, height: 12 },
          { id: "premium", width: 10, height: 12 },
          { id: "grand", width: 12, height: 18 },
        ],
      },
    };
  }
  if (id === "@/lib/album-storage") {
    return { getAlbumProject: () => null };
  }
  if (id === "@/lib/album-photo-storage") {
    return { getAlbumPhoto: async () => null };
  }
  if (id === "@/lib/album-page-canvas") {
    return { renderAlbumPageToCanvas: async () => null };
  }
  if (id === "@/lib/album-pdf-export") {
    return {
      exportAlbumToPdf: async () => ({}),
      isAlbumExporting: () => false,
    };
  }
  if (id === "three") {
    return {
      CanvasTexture: class {
        constructor() {
          this.wrapS = 0;
          this.wrapT = 0;
          this.repeat = { set: () => {} };
        }
        dispose() {}
      },
      RepeatWrapping: 1000,
    };
  }
  if (id === "./3d/ClosedBookModel") {
    return { ClosedBookModel: () => null };
  }
  if (id === "./3d/BookCoverTitle") {
    return {
      createEmbossedCoverTexture: () => ({ dispose: () => {} }),
      createPlainCoverTexture: () => ({ dispose: () => {} }),
    };
  }
  if (id === "./3d/BookHingeMath") {
    return {
      COVER_ANIMATION_DURATION_SECONDS: 1.4,
      easeInOutCosine: (t) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, t))),
      computeCoverHingeAngle: (p) => -(0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, p)))) * Math.PI,
      computeHingeElevation: (p, s, b) => (s / 2 + b / 2) - (0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, p)))) * b,
      interpolateCameraPose: () => ({ position: [0, 0, 0], lookAt: [0, 0, 0] }),
      interpolateBookTransform: () => ({ position: [0, 0, 0], rotation: [0, 0, 0] }),
    };
  }
  if (id === "./3d/PageTurnInteraction") {
    return {
      createInitialFlipControllerState: () => ({
        phase: "idle",
        direction: "next",
        currentProgress: 0.0,
        targetProgress: 0.0,
        velocity: 0.0,
        startProgress: 0.0,
        duration: 0.88,
        elapsed: 0.0,
        lastScrollTime: 0.0,
        isSettling: false,
      }),
      computeDragProgress: () => 0,
      shouldCompleteTurn: () => false,
      computeTransitionDuration: () => 0.88,
      computeEasedTransitionProgress: () => ({ progress: 0, isDone: true }),
      computeScrollDeltaProgress: (deltaY, dir, span = 320) => (dir === "next" ? deltaY : -deltaY) / span,
      computeDampedProgress: (c, t, l, d) => c + (t - c) * (1 - Math.exp(-l * d)),
      shouldSettleScrollTurn: (p) => (p >= 0.5 ? "complete" : "rebound"),
      DEFAULT_FLIP_DURATION: 0.88,
      DRAG_SLOP_PIXELS: 8,
      SCROLL_TURN_DISTANCE_PX: 320,
      SCROLL_SETTLE_DELAY_MS: 140,
      SCROLL_MIN_DELTA_THRESHOLD: 6,
      SCROLL_DAMPING_LAMBDA: 20.0,
      SCROLL_SETTLE_LAMBDA: 14.0,
    };
  }
  if (id === "react" || id === "react/jsx-runtime" || id === "@react-three/fiber" || id === "@react-three/drei" || id === "next/navigation") {
    return {
      useRef: () => ({ current: null }),
      useMemo: (fn) => fn(),
      useCallback: (fn) => fn,
      useState: (initial) => [typeof initial === "function" ? initial() : initial, () => {}],
      useEffect: () => {},
      useFrame: () => {},
      useRouter: () => ({ push: () => {} }),
      jsx: () => null,
      jsxs: () => null,
      Fragment: "Fragment",
    };
  }
  throw new Error(`Unexpected require in test: ${id}`);
};

new Function("exports", "module", "require", compiled.outputText)(
  bookModule.exports,
  bookModule,
  mockRequire,
);

const {
  computeBookDimensions,
  getTotalSpreads,
  getSpreadPageIndices,
  computeCurlingPageVertices,
} = bookModule.exports;

test("computeBookDimensions: physical dimensions for Classic (8x12 in)", () => {
  const dim = computeBookDimensions("classic", 20);
  assert.equal(dim.pageWidth, 2.0); // 8 * 0.25
  assert.equal(dim.pageHeight, 3.0); // 12 * 0.25
  assert.equal(dim.spreadWidth, 4.0);
  assert.equal(dim.aspectRatio, 8 / 12);
  assert.ok(dim.boardThickness > 0);
  assert.ok(dim.overhangX > 0);
  assert.ok(dim.overhangY > 0);
  assert.ok(dim.stackDepth > 0);
  assert.ok(dim.spineWidth > dim.stackDepth);
  assert.ok(dim.cameraDistance > dim.spreadWidth);
});

test("computeBookDimensions: physical dimensions for Premium (10x12 in)", () => {
  const dim = computeBookDimensions("premium", 20);
  assert.equal(dim.pageWidth, 2.5); // 10 * 0.25
  assert.equal(dim.pageHeight, 3.0); // 12 * 0.25
  assert.equal(dim.spreadWidth, 5.0);
  assert.equal(dim.aspectRatio, 10 / 12);
});

test("computeBookDimensions: physical dimensions for Grand (12x18 in)", () => {
  const dim = computeBookDimensions("grand", 20);
  assert.equal(dim.pageWidth, 3.0); // 12 * 0.25
  assert.equal(dim.pageHeight, 4.5); // 18 * 0.25
  assert.equal(dim.spreadWidth, 6.0);
  assert.equal(dim.aspectRatio, 12 / 18);
});

test("computeBookDimensions: stack depth and spine width scale with page counts (20, 30, 40, 60)", () => {
  const d20 = computeBookDimensions("classic", 20);
  const d30 = computeBookDimensions("classic", 30);
  const d40 = computeBookDimensions("classic", 40);
  const d60 = computeBookDimensions("classic", 60);

  assert.ok(d20.stackDepth < d30.stackDepth);
  assert.ok(d30.stackDepth < d40.stackDepth);
  assert.ok(d40.stackDepth < d60.stackDepth);

  assert.ok(d20.spineWidth < d30.spineWidth);
  assert.ok(d30.spineWidth < d40.spineWidth);
  assert.ok(d40.spineWidth < d60.spineWidth);
});

test("getTotalSpreads: calculates correct spread count for 20, 30, 40, 60 pages", () => {
  assert.equal(getTotalSpreads(20), 10);
  assert.equal(getTotalSpreads(30), 15);
  assert.equal(getTotalSpreads(40), 20);
  assert.equal(getTotalSpreads(60), 30);
});

test("getSpreadPageIndices: correctly maps first, middle, and last spreads", () => {
  // 20-page album (10 spreads: 0 to 9)
  const first = getSpreadPageIndices(0, 20);
  assert.equal(first.leftIndex, 0);
  assert.equal(first.rightIndex, 1);

  const mid = getSpreadPageIndices(4, 20);
  assert.equal(mid.leftIndex, 8);
  assert.equal(mid.rightIndex, 9);

  const last = getSpreadPageIndices(9, 20);
  assert.equal(last.leftIndex, 18);
  assert.equal(last.rightIndex, 19);
});

test("computeCurlingPageVertices: forward turn initial state (progress = 0)", () => {
  const { positions } = computeCurlingPageVertices(0, "next", 2.0, 3.0, 48, 16);
  assert.ok(positions.length > 0);

  // At progress 0, page lies flat on the right side: x >= 0, z close to 0
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    assert.ok(x >= -0.001, `x must be >= 0: ${x}`);
    assert.ok(x <= 2.001, `x must be <= pageWidth: ${x}`);
    assert.ok(Math.abs(z) < 0.05, `z must be flat: ${z}`);
  }
});

test("computeCurlingPageVertices: forward turn final state (progress = 1)", () => {
  const { positions } = computeCurlingPageVertices(1, "next", 2.0, 3.0, 48, 16);

  // At progress 1, page lies flat on the left side: x <= 0, z close to 0
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    assert.ok(x <= 0.001, `x must be <= 0: ${x}`);
    assert.ok(x >= -2.001, `x must be >= -pageWidth: ${x}`);
    assert.ok(Math.abs(z) < 0.05, `z must be flat: ${z}`);
  }
});

test("computeCurlingPageVertices: midpoint arch (progress = 0.5) rises above book surface without penetration", () => {
  const { positions } = computeCurlingPageVertices(0.5, "next", 2.0, 3.0, 48, 16);

  let maxZ = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const z = positions[i + 2];
    assert.ok(z >= 0, `z must never penetrate below book surface: ${z}`);
    if (z > maxZ) maxZ = z;
  }

  // Page arch must rise significantly in Z (at least 0.3 * pageWidth)
  assert.ok(maxZ > 2.0 * 0.3, `Max arch height must be > 0.6: ${maxZ}`);
});

test("computeCurlingPageVertices: preserves physical sheet width (zero stretching) across turn lifecycle", () => {
  const pageWidth = 2.5; // Premium width
  const segmentsX = 48;
  const segmentsY = 16;

  for (const progress of [0.0, 0.2, 0.4, 0.5, 0.6, 0.8, 1.0]) {
    const { positions } = computeCurlingPageVertices(
      progress,
      "next",
      pageWidth,
      3.0,
      segmentsX,
      segmentsY,
    );

    // Row 0 is the top edge (where corner lift is 0, strictly preserving exact width)
    let topArcLength = 0;
    for (let k = 1; k <= segmentsX; k++) {
      const prevIdx = (k - 1) * 3;
      const currIdx = k * 3;

      const dx = positions[currIdx] - positions[prevIdx];
      const dz = positions[currIdx + 2] - positions[prevIdx + 2];
      const segLength = Math.sqrt(dx * dx + dz * dz);
      topArcLength += segLength;
    }

    assert.ok(
      Math.abs(topArcLength - pageWidth) < 0.001,
      `Top edge arc length must strictly equal pageWidth (${pageWidth}) at progress ${progress}, got ${topArcLength}`,
    );

    // Bottom edge (last row) with organic corner curl flex within 2% physical tolerance
    let bottomArcLength = 0;
    const bottomRowOffset = segmentsY * (segmentsX + 1) * 3;
    for (let k = 1; k <= segmentsX; k++) {
      const prevIdx = bottomRowOffset + (k - 1) * 3;
      const currIdx = bottomRowOffset + k * 3;

      const dx = positions[currIdx] - positions[prevIdx];
      const dz = positions[currIdx + 2] - positions[prevIdx + 2];
      const segLength = Math.sqrt(dx * dx + dz * dz);
      bottomArcLength += segLength;
    }

    assert.ok(
      Math.abs(bottomArcLength - pageWidth) < 0.05,
      `Bottom edge arc length within physical tolerance of pageWidth (${pageWidth}) at progress ${progress}, got ${bottomArcLength}`,
    );
  }
});

test("computeCurlingPageVertices: reverse turn symmetry with forward turn", () => {
  const fwd = computeCurlingPageVertices(0.5, "next", 2.0, 3.0, 48, 16);
  const rev = computeCurlingPageVertices(0.5, "previous", 2.0, 3.0, 48, 16);

  // Compare midpoint coordinates: rev should be mirror x of fwd, matching z
  for (let i = 0; i < fwd.positions.length; i += 3) {
    const fwdX = fwd.positions[i];
    const fwdZ = fwd.positions[i + 2];
    const revX = rev.positions[i];
    const revZ = rev.positions[i + 2];

    assert.ok(
      Math.abs(revX - -fwdX) < 0.02,
      `X coordinate must be mirrored: ${revX} vs ${-fwdX}`,
    );
    assert.ok(
      Math.abs(revZ - fwdZ) < 0.02,
      `Z coordinate must match: ${revZ} vs ${fwdZ}`,
    );
  }
});

test("Closed Hardcover: board dimensions and overhangs scale with album size", () => {
  // Classic 8x12
  const classic = computeBookDimensions("classic", 20);
  const classicBoardW = classic.pageWidth + classic.overhangX;
  const classicBoardH = classic.pageHeight + classic.overhangY * 2;
  assert.ok(classicBoardW > classic.pageWidth);
  assert.ok(classicBoardH > classic.pageHeight);
  assert.equal(classic.boardThickness, 0.035);

  // Premium 10x12
  const premium = computeBookDimensions("premium", 30);
  const premiumBoardW = premium.pageWidth + premium.overhangX;
  const premiumBoardH = premium.pageHeight + premium.overhangY * 2;
  assert.ok(premiumBoardW > premium.pageWidth);
  assert.ok(premiumBoardH > premium.pageHeight);

  // Grand 12x18
  const grand = computeBookDimensions("grand", 40);
  const grandBoardW = grand.pageWidth + grand.overhangX;
  const grandBoardH = grand.pageHeight + grand.overhangY * 2;
  assert.ok(grandBoardW > grand.pageWidth);
  assert.ok(grandBoardH > grand.pageHeight);
  assert.ok(grandBoardW > premiumBoardW);
  assert.ok(grandBoardH > premiumBoardH);
});

test("Closed Hardcover: total closed book thickness includes paper stack plus both cover boards", () => {
  for (const pageCount of [20, 30, 40, 60]) {
    const dim = computeBookDimensions("classic", pageCount);
    const totalThickness = dim.stackDepth + dim.boardThickness * 2;
    assert.ok(totalThickness > dim.stackDepth);
    assert.ok(dim.spineWidth >= totalThickness * 0.9);
  }
});

test("Stage 2 Cinematic Animation: easeInOutCosine acceleration and deceleration profile", async () => {
  const hingeMathSource = readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/components/albums/3d/BookHingeMath.ts"),
    "utf8",
  );
  const hingeMathCompiled = ts.transpileModule(hingeMathSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const hingeModule = { exports: {} };
  new Function("exports", "module", hingeMathCompiled.outputText)(hingeModule.exports, hingeModule);
  const { easeInOutCosine, computeCoverHingeAngle, computeHingeElevation, interpolateCameraPose, interpolateBookTransform } = hingeModule.exports;

  // Endpoint boundaries
  assert.equal(easeInOutCosine(0), 0);
  assert.equal(easeInOutCosine(1), 1);
  assert.equal(easeInOutCosine(0.5), 0.5);

  // Smooth acceleration: slope increases from 0
  const v01 = easeInOutCosine(0.1);
  const v02 = easeInOutCosine(0.2);
  assert.ok(v01 < 0.1, "Acceleration starts gentle (eased < linear)");
  assert.ok(v02 - v01 > v01, "Acceleration is positive in first half");

  // Smooth deceleration: slope decreases to 0
  const v08 = easeInOutCosine(0.8);
  const v09 = easeInOutCosine(0.9);
  assert.ok(v09 > 0.9, "Deceleration eases into rest (eased > linear)");
  assert.ok(1 - v09 < v09 - v08, "Velocity smoothly approaches zero at end");
});

test("Stage 2 Cinematic Animation: computeCoverHingeAngle rotates strictly from 0 to -PI", async () => {
  const hingeMathSource = readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/components/albums/3d/BookHingeMath.ts"),
    "utf8",
  );
  const hingeMathCompiled = ts.transpileModule(hingeMathSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const hingeModule = { exports: {} };
  new Function("exports", "module", hingeMathCompiled.outputText)(hingeModule.exports, hingeModule);
  const { computeCoverHingeAngle } = hingeModule.exports;

  // Closed: exactly 0 radians (0 degrees)
  assert.equal(computeCoverHingeAngle(0), 0);

  // Midway: -Math.PI / 2 (-90 degrees vertical)
  assert.ok(Math.abs(computeCoverHingeAngle(0.5) - (-Math.PI / 2)) < 0.0001);

  // Fully opened: -Math.PI radians (-180 degrees flat)
  assert.ok(Math.abs(computeCoverHingeAngle(1) - (-Math.PI)) < 0.0001);

  // Monotonic: angle decreases continuously without jumps or reversal
  let lastAngle = 0;
  for (let p = 0.05; p <= 1.0; p += 0.05) {
    const angle = computeCoverHingeAngle(p);
    assert.ok(angle < lastAngle, `Angle must decrease monotonically: ${angle} < ${lastAngle}`);
    assert.ok(angle >= -Math.PI - 0.0001, `Angle must stay within bounds: ${angle}`);
    lastAngle = angle;
  }
});

test("Stage 2 Cinematic Animation: computeHingeElevation settles smoothly to paper block plane", async () => {
  const hingeMathSource = readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/components/albums/3d/BookHingeMath.ts"),
    "utf8",
  );
  const hingeMathCompiled = ts.transpileModule(hingeMathSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const hingeModule = { exports: {} };
  new Function("exports", "module", hingeMathCompiled.outputText)(hingeModule.exports, hingeModule);
  const { computeHingeElevation } = hingeModule.exports;

  const stackDepth = 0.03;
  const boardThickness = 0.035;

  const closedZ = computeHingeElevation(0, stackDepth, boardThickness);
  const openedZ = computeHingeElevation(1, stackDepth, boardThickness);

  assert.equal(closedZ, stackDepth / 2 + boardThickness / 2);
  assert.equal(openedZ, stackDepth / 2 - boardThickness / 2);
  assert.ok(closedZ > openedZ);
});

test("Stage 2 Cinematic Animation: interpolateCameraPose and interpolateBookTransform endpoints", async () => {
  const hingeMathSource = readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/components/albums/3d/BookHingeMath.ts"),
    "utf8",
  );
  const hingeMathCompiled = ts.transpileModule(hingeMathSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const hingeModule = { exports: {} };
  new Function("exports", "module", hingeMathCompiled.outputText)(hingeModule.exports, hingeModule);
  const { interpolateCameraPose, interpolateBookTransform } = hingeModule.exports;

  const cam0 = interpolateCameraPose(0, 3.0, 5.0);
  const cam1 = interpolateCameraPose(1, 3.0, 5.0);

  // Closed camera is angled and slightly closer
  assert.ok(cam0.position[0] > 0);
  assert.ok(cam0.position[2] < cam1.position[2]);
  // Open camera is centered on X
  assert.equal(cam1.position[0], 0);

  const book0 = interpolateBookTransform(0, 2.0);
  const book1 = interpolateBookTransform(1, 2.0);

  // Closed book is angled three-quarter view
  assert.ok(Math.abs(book0.rotation[1]) > 0.3);
  // Open book is centered and flat with only front tilt
  assert.equal(book1.rotation[1], 0);
  assert.equal(book1.rotation[2], 0);
  assert.equal(book1.position[0], 1.0); // pageWidth / 2 = 2.0 / 2 = 1.0
});

test("Stage 3 Paper Curvature: computePageCurvatureElevation physical profile", () => {
  const curvedMathSource = readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/components/albums/3d/CurvedPageGeometry.ts"),
    "utf8",
  );
  const curvedCompiled = ts.transpileModule(curvedMathSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const curvedModule = { exports: {} };
  new Function("exports", "module", "require", curvedCompiled.outputText)(
    curvedModule.exports,
    curvedModule,
    () => ({ BufferGeometry: class {}, Float32BufferAttribute: class {} }),
  );
  const { computePageCurvatureElevation } = curvedModule.exports;

  // At gutter (u = 0), page dips into central binding
  const zGutter = computePageCurvatureElevation(0, 0, 3.0);
  assert.equal(zGutter, -0.010);

  // At flat body (u = 0.5), page is completely planar (z = 0)
  const zBody = computePageCurvatureElevation(0.5, 0, 3.0);
  assert.equal(zBody, 0);

  // Across flat body region (u in [0.25, 0.75]), elevation is 0
  for (const u of [0.25, 0.35, 0.5, 0.65, 0.75]) {
    assert.equal(computePageCurvatureElevation(u, 0, 3.0), 0);
  }

  // At outer fore-edge (u = 1.0), page has subtle positive organic lift
  const zEdge = computePageCurvatureElevation(1.0, 0, 3.0);
  assert.ok(zEdge > 0, `Outer edge lift must be positive: ${zEdge}`);
  assert.ok(Math.abs(zEdge - 0.0035) < 0.0001);

  // Continuous curve with zero abrupt steps
  let lastZ = computePageCurvatureElevation(0, 0, 3.0);
  for (let u = 0.02; u <= 1.0; u += 0.02) {
    const z = computePageCurvatureElevation(u, 0, 3.0);
    const dz = Math.abs(z - lastZ);
    assert.ok(dz < 0.003, `No sharp steps across page profile: dz=${dz} at u=${u}`);
    lastZ = z;
  }
});

test("Stage 4 Interactive Page Turning: Drag progress, completion thresholds & synchronization", () => {
  const interactionSrc = readFileSync(
    path.join(process.cwd(), "src/components/albums/3d/PageTurnInteraction.ts"),
    "utf8",
  );
  const interactionCompiled = ts.transpileModule(interactionSrc, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const interactionModule = { exports: {} };
  new Function("exports", "module", "require", interactionCompiled.outputText)(
    interactionModule.exports,
    interactionModule,
    () => ({}),
  );
  const {
    computeDragProgress,
    shouldCompleteTurn,
    computeTransitionDuration,
    computeEasedTransitionProgress,
    DEFAULT_FLIP_DURATION,
    PROGRESS_THRESHOLD,
    FLICK_VELOCITY_THRESHOLD,
  } = interactionModule.exports;

  // 1. Drag Progress Calculation
  // Container width = 1000px, effective turn span ~ 420px
  assert.equal(computeDragProgress(0, 1000, "next"), 0.0);
  assert.equal(computeDragProgress(0, 1000, "previous"), 0.0);

  // Forward turn ('next'): dragging left (deltaX < 0) increases progress
  const pNextHalf = computeDragProgress(-210, 1000, "next");
  assert.ok(Math.abs(pNextHalf - 0.5) < 0.02, `Expected ~0.5 progress for 210px drag on 1000px width: got ${pNextHalf}`);

  // Forward turn: dragging in wrong direction (deltaX > 0) clamps to 0
  assert.equal(computeDragProgress(100, 1000, "next"), 0.0);

  // Backward turn ('previous'): dragging right (deltaX > 0) increases progress
  const pPrevHalf = computeDragProgress(210, 1000, "previous");
  assert.ok(Math.abs(pPrevHalf - 0.5) < 0.02, `Expected ~0.5 progress for 210px drag on 1000px width: got ${pPrevHalf}`);

  // Large drag clamps cleanly to 1.0 without overshoot
  assert.equal(computeDragProgress(-800, 1000, "next"), 1.0);
  assert.equal(computeDragProgress(800, 1000, "previous"), 1.0);

  // 2. Drag Completion vs Rebound Thresholds
  // Progress >= PROGRESS_THRESHOLD (0.40) always completes
  assert.equal(shouldCompleteTurn(0.40, 0, "next"), true);
  assert.equal(shouldCompleteTurn(0.75, -0.2, "next"), true);
  assert.equal(shouldCompleteTurn(0.50, 0.1, "previous"), true);

  // Low progress with fast flick in flip direction (negative velocity for next) completes
  assert.equal(shouldCompleteTurn(0.20, -0.45, "next"), true);
  assert.equal(shouldCompleteTurn(0.20, 0.45, "previous"), true);

  // Low progress with slow velocity rebounds (returns false)
  assert.equal(shouldCompleteTurn(0.25, -0.1, "next"), false);
  assert.equal(shouldCompleteTurn(0.25, 0.1, "previous"), false);

  // Tiny drag below minimum flick threshold (e.g. 0.08) rebounds even with high velocity
  assert.equal(shouldCompleteTurn(0.08, -0.8, "next"), false);

  // Drag in reverse direction rebounds
  assert.equal(shouldCompleteTurn(0.30, 0.5, "next"), false);

  // 3. Transition Durations
  // Completing from 0.5 to 1.0: distance 0.5 * 0.88 = 0.44s
  const durComplete = computeTransitionDuration(0.5, 1.0, false, DEFAULT_FLIP_DURATION);
  assert.ok(Math.abs(durComplete - 0.44) < 0.01);

  // Rebounding from 0.1 to 0.0: distance 0.1 * 0.88 = 0.088 -> clamped to minimum floor 0.18s
  const durReboundMin = computeTransitionDuration(0.1, 0.0, false, DEFAULT_FLIP_DURATION);
  assert.equal(durReboundMin, 0.18);

  // Prefers reduced motion returns snappy 0.05s
  assert.equal(computeTransitionDuration(0.5, 1.0, true), 0.05);

  // 4. Eased Transition Progress
  const stepStart = computeEasedTransitionProgress(0, 0.5, 0.3, 1.0);
  assert.equal(stepStart.progress, 0.3);
  assert.equal(stepStart.isDone, false);

  const stepEnd = computeEasedTransitionProgress(0.5, 0.5, 0.3, 1.0);
  assert.equal(stepEnd.progress, 1.0);
  assert.equal(stepEnd.isDone, true);

  // Midpoint cosine progress at half elapsed time
  const stepMid = computeEasedTransitionProgress(0.25, 0.5, 0.0, 1.0);
  assert.ok(Math.abs(stepMid.progress - 0.5) < 0.001);
  assert.equal(stepMid.isDone, false);
});

test("Scroll-Controlled Page Turning: delta progress, reversals, and settling decisions", () => {
  const ptiPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../src/components/albums/3d/PageTurnInteraction.ts",
  );
  const ptiSource = readFileSync(ptiPath, "utf8");
  const ptiCompiled = ts.transpileModule(ptiSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });

  const ptiModule = { exports: {} };
  new Function("exports", "module", "require", ptiCompiled.outputText)(
    ptiModule.exports,
    ptiModule,
    () => ({}),
  );

  const {
    computeScrollDeltaProgress,
    computeDampedProgress,
    shouldSettleScrollTurn,
    SCROLL_TURN_DISTANCE_PX,
    SCROLL_SETTLE_DELAY_MS,
    SCROLL_MIN_DELTA_THRESHOLD,
    SCROLL_DAMPING_LAMBDA,
    SCROLL_SETTLE_LAMBDA,
  } = ptiModule.exports;

  // Calibrated physical parameters for butter-smooth scrolling
  assert.equal(SCROLL_TURN_DISTANCE_PX, 320);
  assert.equal(SCROLL_SETTLE_DELAY_MS, 140);
  assert.equal(SCROLL_MIN_DELTA_THRESHOLD, 6);
  assert.equal(SCROLL_DAMPING_LAMBDA, 20.0);
  assert.equal(SCROLL_SETTLE_LAMBDA, 14.0);

  // Forward turn ('next'): scroll down (positive delta) advances turn
  const fwdStep = computeScrollDeltaProgress(160, "next", 320);
  assert.equal(fwdStep, 0.5);

  // Forward turn ('next') reversal: scroll up (negative delta) reduces turn progress
  const fwdReverse = computeScrollDeltaProgress(-160, "next", 320);
  assert.equal(fwdReverse, -0.5);

  // Backward turn ('previous'): scroll up (negative delta) advances backward turn
  const prevStep = computeScrollDeltaProgress(-160, "previous", 320);
  assert.equal(prevStep, 0.5);

  // Backward turn ('previous') reversal: scroll down (positive delta) reduces backward turn progress
  const prevReverse = computeScrollDeltaProgress(160, "previous", 320);
  assert.equal(prevReverse, -0.5);

  // Damped spring progress computation: smooth exponential approach without overshoot
  const initialDamp = computeDampedProgress(0.0, 1.0, 20.0, 0.016); // 16ms frame
  assert.ok(initialDamp > 0.25 && initialDamp < 0.30, `initialDamp expected ~0.27, got ${initialDamp}`);
  const restDamp = computeDampedProgress(0.7, 0.7, 20.0, 0.016);
  assert.equal(restDamp, 0.7);

  // Settle decision: >= 50% completes the turn
  assert.equal(shouldSettleScrollTurn(0.50), "complete");
  assert.equal(shouldSettleScrollTurn(0.75), "complete");
  assert.equal(shouldSettleScrollTurn(0.99), "complete");

  // Settle decision: < 50% rebounds back to original spread
  assert.equal(shouldSettleScrollTurn(0.49), "rebound");
  assert.equal(shouldSettleScrollTurn(0.20), "rebound");
  assert.equal(shouldSettleScrollTurn(0.01), "rebound");
});
