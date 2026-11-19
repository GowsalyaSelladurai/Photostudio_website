"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";

import { albumPricing } from "@/config/studio.config";
import { getAlbumProject } from "@/lib/album-storage";
import { getAlbumPhoto } from "@/lib/album-photo-storage";
import {
  renderAlbumPageToCanvas,
  type PhotoSourceMap,
} from "@/lib/album-page-canvas";
import { exportAlbumToPdf, isAlbumExporting } from "@/lib/album-pdf-export";
import type { AlbumPage, AlbumProject } from "@/types/album";
import { ClosedBookModel } from "./3d/ClosedBookModel";
import {
  createEmbossedCoverTexture,
  createPlainCoverTexture,
} from "./3d/BookCoverTitle";
import {
  type BookViewState,
  COVER_ANIMATION_DURATION_SECONDS,
  interpolateCameraPose,
  interpolateBookTransform,
} from "./3d/BookHingeMath";
import {
  type FlipControllerState,
  type DragTrackingState,
  createInitialFlipControllerState,
  computeDragProgress,
  shouldCompleteTurn,
  computeTransitionDuration,
  computeEasedTransitionProgress,
  computeScrollDeltaProgress,
  computeDampedProgress,
  shouldSettleScrollTurn,
  DEFAULT_FLIP_DURATION,
  DRAG_SLOP_PIXELS,
  SCROLL_TURN_DISTANCE_PX,
  SCROLL_SETTLE_DELAY_MS,
  SCROLL_MIN_DELTA_THRESHOLD,
  SCROLL_DAMPING_LAMBDA,
  SCROLL_SETTLE_LAMBDA,
} from "./3d/PageTurnInteraction";

export type { BookViewState };

// --------------------------------------------------------------------------
// Physical Proportions & Constants
// --------------------------------------------------------------------------

export interface BookPhysicalDimensions {
  pageWidth: number;
  pageHeight: number;
  spreadWidth: number;
  aspectRatio: number;
  boardThickness: number;
  overhangX: number;
  overhangY: number;
  stackDepth: number;
  spineWidth: number;
  cameraDistance: number;
}

/**
 * Computes physically proportional 3D dimensions for the photobook.
 * Scale: 0.25 Three.js units per inch.
 */
export function computeBookDimensions(
  sizeId: string,
  pageCount: number,
): BookPhysicalDimensions {
  const sizeConfig = albumPricing.sizes.find((s) => s.id === sizeId) ?? {
    id: "classic",
    label: "8 × 12 inches",
    width: 8,
    height: 12,
    amount: 300,
  };

  const scalePerInch = 0.25;
  const pageWidth = sizeConfig.width * scalePerInch;
  const pageHeight = sizeConfig.height * scalePerInch;
  const spreadWidth = pageWidth * 2;
  const aspectRatio = sizeConfig.width / sizeConfig.height;

  // Proportional hardcover thickness and square overhang
  const boardThickness = 0.035;
  const overhangX = 0.05 * (pageWidth / 2.0);
  const overhangY = 0.06 * (pageHeight / 3.0);

  // Stack depth increases naturally with page count (20 to 60 pages)
  const clampedPages = Math.max(20, Math.min(60, pageCount));
  const stackDepth = 0.03 + (clampedPages - 20) * 0.0015;
  const spineWidth = stackDepth * 1.6 + 0.08;

  // Camera framing distance
  const maxDim = Math.max(spreadWidth, pageHeight);
  const cameraDistance = maxDim * 1.48;

  return {
    pageWidth,
    pageHeight,
    spreadWidth,
    aspectRatio,
    boardThickness,
    overhangX,
    overhangY,
    stackDepth,
    spineWidth,
    cameraDistance,
  };
}

/**
 * Computes total number of two-page spreads in an album.
 */
export function getTotalSpreads(pageCount: number): number {
  return Math.max(1, Math.ceil(pageCount / 2));
}

/**
 * Returns the left and right page indices for a given spread index (0-based).
 */
export function getSpreadPageIndices(
  spreadIndex: number,
  totalPages: number,
): { leftIndex: number; rightIndex: number } {
  const leftIndex = spreadIndex * 2;
  const rightIndex = leftIndex + 1 < totalPages ? leftIndex + 1 : -1;
  return { leftIndex, rightIndex };
}

let sharedAngleCache: Float32Array | null = null;

/**
 * In-place deformation of curling page vertex and normal buffers.
 * Zero object or typed array allocations during 60/120 FPS animation loops.
 */
export function computeCurlingPageVerticesInto(
  positions: Float32Array,
  normals: Float32Array,
  progress: number,
  direction: "next" | "previous",
  pageWidth: number,
  pageHeight: number,
  segmentsX = 48,
  segmentsY = 16,
): void {
  const isForward = direction === "next";
  const clampedProg = Math.max(0, Math.min(1, progress));
  const eased = 0.5 - 0.5 * Math.cos(Math.PI * clampedProg);

  const deltaU = 1 / segmentsX;
  const deltaS = pageWidth * deltaU;

  // Profile angle calculation:
  // 1. Base hinge rotation: bound near spine, accelerating gracefully
  const baseAngle = Math.PI * Math.pow(eased, 1.25);
  // 2. Fore-edge tip peel: outer page curls over slightly ahead of base
  const tipAngle = Math.PI * Math.min(1, eased * 1.35);
  // 3. Overall mid-turn arch height
  const archFactor = 0.55 * Math.sin(Math.PI * eased);

  // 4. Physical spine resistance & traveling curl wave
  // Spine resists immediate sharp bending (u in [0, 0.15])
  // Traveling curl wave peak moves smoothly from fore-edge towards spine
  const curlPeak = 1.0 - 0.85 * eased;

  if (!sharedAngleCache || sharedAngleCache.length < segmentsX + 1) {
    sharedAngleCache = new Float32Array(segmentsX + 1);
  }

  for (let k = 0; k <= segmentsX; k++) {
    const u = k * deltaU;

    // Spine boundary resistance: paper leaves binding smoothly
    const spineStiff = Math.min(1, u / 0.14);

    // Traveling bend wave across sheet width
    const curlDist = Math.abs(u - curlPeak);
    const wave = 0.14 * Math.exp(-(curlDist * curlDist) / 0.06) * Math.sin(Math.PI * eased);

    const arch = (archFactor * Math.sin(Math.PI * u) + wave) * (0.35 + 0.65 * spineStiff);
    let angle = (1 - u) * baseAngle + u * tipAngle + arch;

    if (!isForward) {
      angle = Math.PI - angle;
    }
    sharedAngleCache[k] = angle;
  }

  // Populate vertex grid with strict isometric arc-length preservation
  // Three.js PlaneGeometry orders rows from top (+Y) to bottom (-Y)
  let ptr = 0;
  for (let j = 0; j <= segmentsY; j++) {
    const v = 0.5 - j / segmentsY; // +0.5 (top) to -0.5 (bottom) matching PlaneGeometry order
    const y = v * pageHeight;

    // Row-specific corner flex angle (subtle upward curl on bottom corner)
    const cornerAngleFactor = 0.22 * (0.5 - v) * Math.sin(Math.PI * eased);

    // Subtle mid-air gravity drape on unsupported central area of sheet (zero at top and bottom edges)
    const gravitySag = -0.012 * pageHeight * Math.sin(Math.PI * eased) * (1 - 4 * v * v);

    let rowX = 0;
    let rowZ = 0.003;

    for (let k = 0; k <= segmentsX; k++) {
      const u = k * deltaU;
      const angle = isForward
        ? sharedAngleCache[k] + cornerAngleFactor * u
        : sharedAngleCache[k] - cornerAngleFactor * u;

      if (k > 0) {
        rowX += deltaS * Math.cos(angle);
        rowZ += deltaS * Math.sin(angle);
      }

      const vx = rowX;
      const vy = y + (k > 0 ? gravitySag * Math.sin(Math.PI * u) : 0);
      const vz = rowZ;

      positions[ptr] = vx;
      positions[ptr + 1] = vy;
      positions[ptr + 2] = vz;

      // Surface normal from local bending angle
      const nx = -Math.sin(angle);
      const ny = 0;
      const nz = Math.cos(angle);

      normals[ptr] = isForward ? nx : -nx;
      normals[ptr + 1] = ny;
      normals[ptr + 2] = nz;

      ptr += 3;
    }
  }
}

/**
 * Deforms vertex coordinates of a curling sheet of paper.
 * Implements isometric bending: arc-length along width is strictly preserved.
 * Incorporates spine boundary stiffness, traveling curl wave, subtle gravity sag,
 * and dynamic corner lift.
 */
export function computeCurlingPageVertices(
  progress: number,
  direction: "next" | "previous",
  pageWidth: number,
  pageHeight: number,
  segmentsX = 48,
  segmentsY = 16,
): { positions: Float32Array; normals: Float32Array } {
  const vertexCount = (segmentsX + 1) * (segmentsY + 1);
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  computeCurlingPageVerticesInto(
    positions,
    normals,
    progress,
    direction,
    pageWidth,
    pageHeight,
    segmentsX,
    segmentsY,
  );
  return { positions, normals };
}

// --------------------------------------------------------------------------
// Procedural Textures
// --------------------------------------------------------------------------

/**
 * Creates procedural woven linen texture.
 */
export function createLinenTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#B7A58B";
    ctx.fillRect(0, 0, size, size);

    for (let x = 0; x < size; x += 3) {
      const alpha = 0.08 + Math.random() * 0.12;
      ctx.strokeStyle =
        Math.random() > 0.5
          ? `rgba(255,255,255,${alpha})`
          : `rgba(40,30,20,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y < size; y += 3) {
      const alpha = 0.08 + Math.random() * 0.12;
      ctx.strokeStyle =
        Math.random() > 0.5
          ? `rgba(255,255,255,${alpha})`
          : `rgba(40,30,20,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Creates procedural fine leather grain texture.
 */
export function createLeatherTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#3E2D22";
    ctx.fillRect(0, 0, size, size);

    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 26;
      data[i] = Math.min(255, Math.max(0, data[i] + grain));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain * 0.8));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain * 0.6));
    }
    ctx.putImageData(imgData, 0, 0);

    for (let i = 0; i < 350; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 2 + Math.random() * 4;
      ctx.fillStyle =
        Math.random() > 0.5
          ? "rgba(0,0,0,0.06)"
          : "rgba(255,255,255,0.04)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/**
 * Creates procedural stacked paper edge lines texture.
 */
export function createPaperEdgeTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const width = 256;
  const height = 64;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#F6F1E8";
    ctx.fillRect(0, 0, width, height);

    for (let y = 0; y < height; y += 2) {
      const shade =
        Math.random() > 0.4
          ? "rgba(180, 165, 145, 0.22)"
          : "rgba(120, 105, 85, 0.15)";
      ctx.fillStyle = shade;
      ctx.fillRect(0, y, width, 1);
    }
  }

  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates a blank fallback warm ivory page texture.
 */
export function createBlankPageTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#F5F0E8";
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

// --------------------------------------------------------------------------
// Sub-components: 3D Book Construction
// --------------------------------------------------------------------------

interface HardcoverShellProps {
  dim: BookPhysicalDimensions;
  coverTexture: THREE.Texture;
  coverFinish: "linen" | "leather" | "photo";
  projectTitle: string;
}

function HardcoverShell({
  dim,
  coverTexture,
  coverFinish,
}: HardcoverShellProps) {
  const {
    pageWidth,
    pageHeight,
    boardThickness,
    overhangX,
    overhangY,
    stackDepth,
    spineWidth,
  } = dim;

  const boardW = pageWidth + overhangX;
  const boardH = pageHeight + overhangY * 2;
  const zBoard = -stackDepth - boardThickness / 2;

  const materialProps = useMemo(() => {
    return {
      map: coverTexture,
      roughness: coverFinish === "leather" ? 0.65 : coverFinish === "photo" ? 0.35 : 0.88,
      metalness: coverFinish === "leather" ? 0.15 : 0.05,
    };
  }, [coverTexture, coverFinish]);

  return (
    <group>
      {/* Left Cover Board */}
      <mesh position={[-boardW / 2 - 0.02, 0, zBoard]}>
        <boxGeometry args={[boardW, boardH, boardThickness]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Right Cover Board */}
      <mesh position={[boardW / 2 + 0.02, 0, zBoard]}>
        <boxGeometry args={[boardW, boardH, boardThickness]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Spine Wrap */}
      <mesh position={[0, 0, zBoard - boardThickness * 0.4]}>
        <boxGeometry args={[spineWidth, boardH, boardThickness * 1.6]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Subtle Spine Hinge Grooves */}
      <mesh position={[-spineWidth / 2 - 0.015, 0, zBoard + boardThickness / 2]}>
        <cylinderGeometry args={[0.012, 0.012, boardH, 12]} />
        <meshStandardMaterial color="#1A1512" roughness={0.9} />
      </mesh>
      <mesh position={[spineWidth / 2 + 0.015, 0, zBoard + boardThickness / 2]}>
        <cylinderGeometry args={[0.012, 0.012, boardH, 12]} />
        <meshStandardMaterial color="#1A1512" roughness={0.9} />
      </mesh>
    </group>
  );
}

interface PaperStackBlockProps {
  dim: BookPhysicalDimensions;
  edgeTexture: THREE.Texture;
}

function PaperStackBlock({ dim, edgeTexture }: PaperStackBlockProps) {
  const { pageWidth, pageHeight, stackDepth } = dim;

  return (
    <group>
      {/* Left Paper Stack */}
      <mesh position={[-pageWidth / 2, 0, -stackDepth / 2]}>
        <boxGeometry args={[pageWidth, pageHeight, stackDepth]} />
        <meshStandardMaterial map={edgeTexture} roughness={0.92} />
      </mesh>

      {/* Right Paper Stack */}
      <mesh position={[pageWidth / 2, 0, -stackDepth / 2]}>
        <boxGeometry args={[pageWidth, pageHeight, stackDepth]} />
        <meshStandardMaterial map={edgeTexture} roughness={0.92} />
      </mesh>
    </group>
  );
}

// --------------------------------------------------------------------------
// Curling Turning Page Mesh
// --------------------------------------------------------------------------

interface CurlingPageMeshProps {
  dim: BookPhysicalDimensions;
  direction: "next" | "previous";
  frontTexture: THREE.Texture;
  backTexture: THREE.Texture;
  controllerRef: React.MutableRefObject<FlipControllerState>;
  onComplete: () => void;
  onCancel: () => void;
}

const SEGMENTS_X = 48;
const SEGMENTS_Y = 16;
// Smooth natural page-turn animation duration targeting ~0.88 seconds
const FLIP_DURATION_SECONDS = DEFAULT_FLIP_DURATION;

function CurlingPageMesh({
  dim,
  direction,
  frontTexture,
  backTexture,
  controllerRef,
  onComplete,
  onCancel,
}: CurlingPageMeshProps) {
  const frontMeshRef = useRef<THREE.Mesh>(null);
  const backMeshRef = useRef<THREE.Mesh>(null);
  const completedRef = useRef(false);

  // Initialize geometries with back UV inverted along X for recto/verso alignment
  const initialGeometries = useMemo(() => {
    const frontGeom = new THREE.PlaneGeometry(
      dim.pageWidth,
      dim.pageHeight,
      SEGMENTS_X,
      SEGMENTS_Y,
    );

    const backGeom = new THREE.PlaneGeometry(
      dim.pageWidth,
      dim.pageHeight,
      SEGMENTS_X,
      SEGMENTS_Y,
    );

    // Invert back page UVs so left-to-right content renders correctly when turned over
    const backUvAttr = backGeom.attributes.uv;
    if (backUvAttr) {
      for (let i = 0; i < backUvAttr.count; i++) {
        const u = backUvAttr.getX(i);
        backUvAttr.setX(i, 1 - u);
      }
      backUvAttr.needsUpdate = true;
    }

    return { frontGeom, backGeom };
  }, [dim.pageWidth, dim.pageHeight]);

  // Reusable scratch buffers for zero-allocation 60/120 FPS geometry deformation
  const scratchBuffers = useMemo(() => {
    const vertexCount = (SEGMENTS_X + 1) * (SEGMENTS_Y + 1);
    return {
      positions: new Float32Array(vertexCount * 3),
      normals: new Float32Array(vertexCount * 3),
    };
  }, []);

  useFrame((_, delta) => {
    if (completedRef.current) return;

    const ctrl = controllerRef.current;
    let progress = ctrl.currentProgress;

    if (ctrl.phase === "auto") {
      ctrl.elapsed += delta;
      const { progress: p, isDone } = computeEasedTransitionProgress(
        ctrl.elapsed,
        ctrl.duration,
        0.0,
        1.0,
      );
      ctrl.currentProgress = p;
      progress = p;

      if (isDone) {
        completedRef.current = true;
        onComplete();
        return;
      }
    } else if (ctrl.phase === "dragging") {
      // Smooth responsive damping tracking pointer target progress
      ctrl.currentProgress = computeDampedProgress(
        ctrl.currentProgress,
        ctrl.targetProgress,
        24.0,
        delta,
      );
      progress = ctrl.currentProgress;
    } else if (ctrl.phase === "scrolling") {
      const now = performance.now();
      const timeSinceScroll = now - ctrl.lastScrollTime;

      // When user stops active scroll (> 140ms idle), engage continuous smooth settle
      if (!ctrl.isSettling && timeSinceScroll > SCROLL_SETTLE_DELAY_MS) {
        ctrl.isSettling = true;
        // Natural threshold: >= 50% settles to 1.0, < 50% rebounds to 0.0
        ctrl.targetProgress = ctrl.targetProgress >= 0.5 ? 1.0 : 0.0;
      }

      // Continuous critically damped spring (lambda 20 for active scroll, 14 for soft settle)
      const lambda = ctrl.isSettling ? SCROLL_SETTLE_LAMBDA : SCROLL_DAMPING_LAMBDA;
      ctrl.currentProgress = computeDampedProgress(
        ctrl.currentProgress,
        ctrl.targetProgress,
        lambda,
        delta,
      );
      progress = ctrl.currentProgress;

      // Completion condition: target was set to >= 1.0 AND page has actually finished turning
      if (ctrl.targetProgress >= 1.0 && ctrl.currentProgress >= 0.990) {
        ctrl.currentProgress = 1.0;
        progress = 1.0;
        completedRef.current = true;
        onComplete();
        return;
      }

      // Cancellation condition: target was set to <= 0.0 AND page has actually returned to flat rest
      if (ctrl.targetProgress <= 0.0 && ctrl.currentProgress <= 0.010) {
        ctrl.currentProgress = 0.0;
        progress = 0.0;
        completedRef.current = true;
        onCancel();
        return;
      }
    } else if (ctrl.phase === "completing") {
      ctrl.elapsed += delta;
      const { progress: p, isDone } = computeEasedTransitionProgress(
        ctrl.elapsed,
        ctrl.duration,
        ctrl.startProgress,
        1.0,
      );
      ctrl.currentProgress = p;
      progress = p;

      if (isDone) {
        completedRef.current = true;
        onComplete();
        return;
      }
    } else if (ctrl.phase === "rebounding") {
      ctrl.elapsed += delta;
      const { progress: p, isDone } = computeEasedTransitionProgress(
        ctrl.elapsed,
        ctrl.duration,
        ctrl.startProgress,
        0.0,
      );
      ctrl.currentProgress = p;
      progress = p;

      if (isDone) {
        completedRef.current = true;
        onCancel();
        return;
      }
    }

    computeCurlingPageVerticesInto(
      scratchBuffers.positions,
      scratchBuffers.normals,
      progress,
      direction,
      dim.pageWidth,
      dim.pageHeight,
      SEGMENTS_X,
      SEGMENTS_Y,
    );

    const frontGeom = frontMeshRef.current?.geometry;
    const backGeom = backMeshRef.current?.geometry;

    if (frontGeom && backGeom) {
      const frontPos = frontGeom.attributes.position;
      const frontNorm = frontGeom.attributes.normal;
      const backPos = backGeom.attributes.position;
      const backNorm = backGeom.attributes.normal;

      if (frontPos && frontNorm && backPos && backNorm) {
        const fPos = frontPos.array as Float32Array;
        const fNorm = frontNorm.array as Float32Array;
        const bPos = backPos.array as Float32Array;
        const bNorm = backNorm.array as Float32Array;
        const pos = scratchBuffers.positions;
        const norm = scratchBuffers.normals;

        const paperThickness = 0.0008;
        const len = pos.length;
        for (let i = 0; i < len; i += 3) {
          const x = pos[i];
          const y = pos[i + 1];
          const z = pos[i + 2];
          const nx = norm[i];
          const ny = norm[i + 1];
          const nz = norm[i + 2];

          fPos[i] = x;
          fPos[i + 1] = y;
          fPos[i + 2] = z;

          fNorm[i] = nx;
          fNorm[i + 1] = ny;
          fNorm[i + 2] = nz;

          bPos[i] = x - nx * paperThickness;
          bPos[i + 1] = y - ny * paperThickness;
          bPos[i + 2] = z - nz * paperThickness;

          bNorm[i] = -nx;
          bNorm[i + 1] = -ny;
          bNorm[i + 2] = -nz;
        }

        frontPos.needsUpdate = true;
        frontNorm.needsUpdate = true;
        backPos.needsUpdate = true;
        backNorm.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Front Surface (Recto - casts dynamic shadow onto underlying page) */}
      <mesh
        geometry={initialGeometries.frontGeom}
        ref={frontMeshRef}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={frontTexture}
          roughness={0.88}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Back Surface (Verso - casts dynamic shadow onto landing page) */}
      <mesh
        geometry={initialGeometries.backGeom}
        ref={backMeshRef}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={backTexture}
          roughness={0.88}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// --------------------------------------------------------------------------
// 3D Scene Root
// --------------------------------------------------------------------------

interface FlipAnimationState {
  direction: "next" | "previous";
  frontTexture: THREE.Texture;
  backTexture: THREE.Texture;
  underneathLeftTexture: THREE.Texture;
  underneathRightTexture: THREE.Texture;
}

interface BookSceneProps {
  project: AlbumProject;
  spreadIndex: number;
  dim: BookPhysicalDimensions;
  textures: Map<number, THREE.CanvasTexture>;
  coverTexture: THREE.Texture;
  embossedCoverTexture: THREE.Texture | null;
  plainCoverTexture: THREE.Texture | null;
  edgeTexture: THREE.Texture;
  blankTexture: THREE.Texture;
  flipState: FlipAnimationState | null;
  flipControllerRef: React.MutableRefObject<FlipControllerState>;
  onFlipComplete: () => void;
  onFlipCancel: () => void;
  isDraggingPage: boolean;
  viewState: BookViewState;
  onOpenComplete: () => void;
  onCloseComplete: () => void;
  onStartOpen: () => void;
  onTurnLeftPage: () => void;
  onTurnRightPage: () => void;
  canTurnLeft: boolean;
  canTurnRight: boolean;
}

function BookScene({
  project,
  spreadIndex,
  dim,
  textures,
  coverTexture,
  embossedCoverTexture,
  plainCoverTexture,
  edgeTexture,
  blankTexture,
  flipState,
  flipControllerRef,
  onFlipComplete,
  onFlipCancel,
  isDraggingPage,
  viewState,
  onOpenComplete,
  onCloseComplete,
  onStartOpen,
  onTurnLeftPage,
  onTurnRightPage,
  canTurnLeft,
  canTurnRight,
}: BookSceneProps) {
  const { pageWidth, pageHeight } = dim;
  const totalPages = project.pages.length;
  const totalSpreads = getTotalSpreads(totalPages);
  const { leftIndex, rightIndex } = getSpreadPageIndices(spreadIndex, totalPages);

  // Active spread flat page textures
  const leftPageTex =
    leftIndex >= 0 && textures.has(leftIndex)
      ? textures.get(leftIndex)!
      : blankTexture;

  const rightPageTex =
    rightIndex >= 0 && textures.has(rightIndex)
      ? textures.get(rightIndex)!
      : blankTexture;

  // Underneath textures during turn animation
  const activeLeftTex = flipState ? flipState.underneathLeftTexture : leftPageTex;
  const activeRightTex = flipState ? flipState.underneathRightTexture : rightPageTex;

  // Animation progress: 0.0 (closed) to 1.0 (opened)
  const progressRef = useRef(viewState === "opened" ? 1.0 : 0.0);
  const [animProgress, setAnimProgress] = useState(viewState === "opened" ? 1.0 : 0.0);
  const bookGroupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<any>(null);
  const entranceProgressRef = useRef(0.0);

  useEffect(() => {
    const isReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      entranceProgressRef.current = 1.0;
    }
  }, []);

  // Keep internal progress synchronized if viewState changes from outside
  useEffect(() => {
    if (viewState === "closed") {
      progressRef.current = 0.0;
      setAnimProgress(0.0);
    } else if (viewState === "opened") {
      progressRef.current = 1.0;
      setAnimProgress(1.0);
    }
  }, [viewState]);

  useFrame((state, delta) => {
    let p = progressRef.current;
    let isTransitioning = false;

    if (viewState === "opening") {
      p += delta / COVER_ANIMATION_DURATION_SECONDS;
      if (p >= 1.0) {
        p = 1.0;
        onOpenComplete();
      }
      progressRef.current = p;
      setAnimProgress(p);
      isTransitioning = true;
    } else if (viewState === "closing") {
      p -= delta / COVER_ANIMATION_DURATION_SECONDS;
      if (p <= 0.0) {
        p = 0.0;
        onCloseComplete();
      }
      progressRef.current = p;
      setAnimProgress(p);
      isTransitioning = true;
    }

    // Camera pose interpolation during transition
    if (isTransitioning) {
      const { position: camPos, lookAt: camLookAt } = interpolateCameraPose(
        p,
        pageHeight,
        dim.cameraDistance,
      );
      state.camera.position.set(camPos[0], camPos[1], camPos[2]);
      state.camera.lookAt(camLookAt[0], camLookAt[1], camLookAt[2]);
      if (orbitRef.current) {
        orbitRef.current.target.set(camLookAt[0], camLookAt[1], camLookAt[2]);
        orbitRef.current.update();
      }
    } else if (viewState === "closed" && !orbitRef.current?.state && orbitRef.current?.target) {
      // Keep target centered on closed book when at rest
      orbitRef.current.target.set(0, -0.05, 0);
    } else if (viewState === "opened" && !orbitRef.current?.state && orbitRef.current?.target) {
      // Keep target centered on open spread when at rest
      orbitRef.current.target.set(0, 0, 0);
    }

    // Book group position & rotation interpolation
    const currentTransformProgress = viewState === "closed" ? 0.0 : viewState === "opened" ? 1.0 : p;
    const { position: bookPos, rotation: bookRot } = interpolateBookTransform(
      currentTransformProgress,
      pageWidth,
    );
    if (bookGroupRef.current) {
      if (entranceProgressRef.current < 1.0 && viewState === "closed") {
        entranceProgressRef.current = Math.min(1.0, entranceProgressRef.current + delta / 1.1);
        const ep = 1 - Math.pow(1 - entranceProgressRef.current, 3);
        const entranceY = (1 - ep) * 0.12;
        const entranceScale = 0.94 + 0.06 * ep;
        bookGroupRef.current.position.set(bookPos[0], bookPos[1] + entranceY, bookPos[2]);
        bookGroupRef.current.scale.set(entranceScale, entranceScale, entranceScale);
      } else {
        bookGroupRef.current.position.set(bookPos[0], bookPos[1], bookPos[2]);
        bookGroupRef.current.scale.set(1.0, 1.0, 1.0);
      }
      bookGroupRef.current.rotation.set(bookRot[0], bookRot[1], bookRot[2]);
    }
  });

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Studio Lighting Environment (Natural Warm-Neutral Studio Rig)     */}
      {/* ------------------------------------------------------------------ */}
      {/* 1. Warm Ambient Base (Rich contrast on warm ivory theme, natural highlights) */}
      <ambientLight intensity={0.65} color="#FAF5EE" />

      {/* 2. Soft Directional Key Light with High-Fidelity Soft Shadows */}
      <directionalLight
        position={[3.5, 6.5, 5.5]}
        intensity={1.25}
        color="#FFF9F2"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-4.5}
        shadow-camera-right={4.5}
        shadow-camera-top={4.5}
        shadow-camera-bottom={-4.5}
        shadow-bias={-0.0003}
        shadow-radius={3.5}
      />

      {/* 3. Subtle Fill Light (Neutral fill softening left-side and spine shadows) */}
      <directionalLight position={[-4.2, 3.2, 3.8]} intensity={0.45} color="#EBE6E0" />

      {/* 4. Rim / Edge Light (Top-rear rim revealing cover edges & Champagne Gold sheen) */}
      <directionalLight position={[0, 6.0, -4.5]} intensity={0.7} color="#F6EADB" />

      {/* 5. Gutter & Crease Bounce Light (Subtle warm accent preventing black crevices) */}
      <pointLight position={[0, -3.2, 3.2]} intensity={0.3} color="#E6D7C2" />

      {/* ------------------------------------------------------------------ */}
      {/* Contact Shadows & Ground Receiver Plane                            */}
      {/* ------------------------------------------------------------------ */}
      {/* Soft Ambient Contact Shadow beneath the Album */}
      <ContactShadows
        position={[0, -dim.pageHeight * 0.52, -0.15]}
        opacity={0.52}
        scale={dim.spreadWidth * 2.2}
        blur={2.4}
        far={4.0}
        resolution={512}
        color="#292522"
      />

      {/* Shadow Receiver Floor for Directional Key Light Shadows */}
      <mesh position={[0, 0, -dim.stackDepth - 0.45]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <shadowMaterial opacity={0.16} />
      </mesh>

      <group ref={bookGroupRef}>
        <ClosedBookModel
          dim={dim}
          coverTexture={embossedCoverTexture ?? coverTexture}
          plainCoverTexture={plainCoverTexture ?? coverTexture}
          edgeTexture={edgeTexture}
          coverFinish={project.coverFinish}
          projectTitle={project.name}
          onOpen={onStartOpen}
          interactive={viewState === "closed"}
          viewState={viewState}
          animationProgress={animProgress}
          leftPageTexture={activeLeftTex}
          rightPageTexture={activeRightTex}
          spreadIndex={spreadIndex}
          totalSpreads={totalSpreads}
          onTurnLeftPage={onTurnLeftPage}
          onTurnRightPage={onTurnRightPage}
          canTurnLeft={canTurnLeft}
          canTurnRight={canTurnRight}
        />

        {/* Dynamic Curved Turning Page Mesh during spread navigation */}
        {flipState && viewState === "opened" && (
          <group position={[-pageWidth / 2, 0, dim.stackDepth / 2 + 0.003]}>
            <CurlingPageMesh
              dim={dim}
              direction={flipState.direction}
              frontTexture={flipState.frontTexture}
              backTexture={flipState.backTexture}
              controllerRef={flipControllerRef}
              onComplete={onFlipComplete}
              onCancel={onFlipCancel}
            />
          </group>
        )}
      </group>

      <OrbitControls
        ref={orbitRef}
        enabled={(viewState === "closed" || viewState === "opened") && !isDraggingPage}
        enableZoom={true}
        enablePan={false}
        minDistance={dim.cameraDistance * 0.65}
        maxDistance={dim.cameraDistance * 1.8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

// --------------------------------------------------------------------------
// Main Viewer Component
// --------------------------------------------------------------------------

interface Album3DBookProps {
  projectId: string;
}

export function Album3DBook({ projectId }: Album3DBookProps) {
  const router = useRouter();

  const [project, setProject] = useState<AlbumProject | null>(null);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [flipState, setFlipState] = useState<FlipAnimationState | null>(null);
  const [isPreparingSpread, setIsPreparingSpread] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // View state machine: "closed" | "opening" | "opened" | "closing"
  // Customer initially sees realistic closed hardcover album
  const [viewState, setViewState] = useState<BookViewState>("closed");
  const [embossedCoverTexture, setEmbossedCoverTexture] = useState<THREE.Texture | null>(null);
  const [plainCoverTexture, setPlainCoverTexture] = useState<THREE.Texture | null>(null);
  const embossedCoverRef = useRef<THREE.Texture | null>(null);
  const plainCoverRef = useRef<THREE.Texture | null>(null);

  // Autoplay State (Automatic turning with user interruption & idle resume)
  const [isAutoplayPlaying, setIsAutoplayPlaying] = useState(false);
  const [isAutoplayPausedByUser, setIsAutoplayPausedByUser] = useState(false);
  const isAutoplayPlayingRef = useRef(false);
  isAutoplayPlayingRef.current = isAutoplayPlaying;
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeAutoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const registerUserInteraction = useCallback(() => {
    if (isAutoplayPlayingRef.current) {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
      if (resumeAutoplayTimerRef.current) {
        clearTimeout(resumeAutoplayTimerRef.current);
      }
      setIsAutoplayPausedByUser(true);
      resumeAutoplayTimerRef.current = setTimeout(() => {
        setIsAutoplayPausedByUser(false);
      }, 3500);
    }
  }, []);

  // PDF Download State
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStatus, setPdfStatus] = useState("");
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Textures and Caching
  const [textures, setTextures] = useState<Map<number, THREE.CanvasTexture>>(new Map());
  const textureCacheRef = useRef<Map<number, THREE.CanvasTexture>>(new Map());
  const photoBlobCacheRef = useRef<Map<string, Blob>>(new Map());
  const customCoverTextureRef = useRef<THREE.Texture | null>(null);

  // Touch and Drag State
  const touchStartRef = useRef<number | null>(null);
  const pointerStartXRef = useRef<number | null>(null);

  // Stage 4: Interactive Page Drag & Synchronized Controller State
  const flipControllerRef = useRef<FlipControllerState>(createInitialFlipControllerState());
  const dragTrackingRef = useRef<DragTrackingState | null>(null);
  const [isDraggingPage, setIsDraggingPage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create base material textures
  const linenTexture = useMemo(() => createLinenTexture(), []);
  const leatherTexture = useMemo(() => createLeatherTexture(), []);
  const edgeTexture = useMemo(() => createPaperEdgeTexture(), []);
  const blankTexture = useMemo(() => createBlankPageTexture(), []);

  const [coverTexture, setCoverTexture] = useState<THREE.Texture>(linenTexture);

  // Fullscreen state listener
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Load project
  useEffect(() => {
    const loaded = getAlbumProject(projectId);
    setProject(loaded);
    setLoading(false);
  }, [projectId]);

  // Compute physical dimensions
  const dim = useMemo(() => {
    const sizeId = project?.sizeId ?? "classic";
    const pages = project?.pages.length ?? 20;
    return computeBookDimensions(sizeId, pages);
  }, [project?.sizeId, project?.pages.length]);

  // Cover Texture Resolver (Front embossed title, back plain finish, and flat open spread)
  useEffect(() => {
    if (!project || typeof document === "undefined") return;

    let cancelled = false;

    async function resolveCoverTextures() {
      const finish = project!.coverFinish;
      const title = project!.name || "";
      const w = 1024;
      const h = Math.round(1024 / dim.aspectRatio);

      // Clean up previous custom textures
      if (embossedCoverRef.current) {
        embossedCoverRef.current.dispose();
        embossedCoverRef.current = null;
      }
      if (plainCoverRef.current) {
        plainCoverRef.current.dispose();
        plainCoverRef.current = null;
      }

      if (finish === "leather") {
        const embossed = createEmbossedCoverTexture({ finish: "leather", title, width: w, height: h });
        const plain = createPlainCoverTexture({ finish: "leather", width: w, height: h });
        embossedCoverRef.current = embossed;
        plainCoverRef.current = plain;

        if (!cancelled) {
          setEmbossedCoverTexture(embossed);
          setPlainCoverTexture(plain);
          setCoverTexture(leatherTexture);
        }
      } else if (finish === "linen") {
        const embossed = createEmbossedCoverTexture({ finish: "linen", title, width: w, height: h });
        const plain = createPlainCoverTexture({ finish: "linen", width: w, height: h });
        embossedCoverRef.current = embossed;
        plainCoverRef.current = plain;

        if (!cancelled) {
          setEmbossedCoverTexture(embossed);
          setPlainCoverTexture(plain);
          setCoverTexture(linenTexture);
        }
      } else if (finish === "photo") {
        if (!project!.coverPhotoId) {
          // Safe fallback to linen if cover photo is missing
          const embossed = createEmbossedCoverTexture({ finish: "linen", title, width: w, height: h });
          const plain = createPlainCoverTexture({ finish: "linen", width: w, height: h });
          embossedCoverRef.current = embossed;
          plainCoverRef.current = plain;

          if (!cancelled) {
            setEmbossedCoverTexture(embossed);
            setPlainCoverTexture(plain);
            setCoverTexture(linenTexture);
          }
          return;
        }

        try {
          let blob = photoBlobCacheRef.current.get(project!.coverPhotoId);
          if (!blob) {
            const fetched = await getAlbumPhoto(project!.id, project!.coverPhotoId);
            if (fetched) {
              blob = fetched;
              photoBlobCacheRef.current.set(project!.coverPhotoId, fetched);
            }
          }

          if (cancelled || !blob) {
            if (!cancelled) {
              const embossed = createEmbossedCoverTexture({ finish: "linen", title, width: w, height: h });
              const plain = createPlainCoverTexture({ finish: "linen", width: w, height: h });
              embossedCoverRef.current = embossed;
              plainCoverRef.current = plain;
              setEmbossedCoverTexture(embossed);
              setPlainCoverTexture(plain);
              setCoverTexture(linenTexture);
            }
            return;
          }

          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.crossOrigin = "anonymous";

          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Cover photo decode failure"));
            img.src = url;
          }).finally(() => {
            URL.revokeObjectURL(url);
          });

          if (cancelled) return;

          const embossed = createEmbossedCoverTexture({ finish: "photo", title, coverImage: img, width: w, height: h });
          const plain = createPlainCoverTexture({ finish: "photo", coverImage: img, width: w, height: h });
          const flatTexture = new THREE.CanvasTexture(img);
          flatTexture.colorSpace = THREE.SRGBColorSpace;
          flatTexture.generateMipmaps = true;

          embossedCoverRef.current = embossed;
          plainCoverRef.current = plain;

          if (customCoverTextureRef.current) {
            customCoverTextureRef.current.dispose();
          }
          customCoverTextureRef.current = flatTexture;

          setEmbossedCoverTexture(embossed);
          setPlainCoverTexture(plain);
          setCoverTexture(flatTexture);
        } catch {
          if (!cancelled) {
            const embossed = createEmbossedCoverTexture({ finish: "linen", title, width: w, height: h });
            const plain = createPlainCoverTexture({ finish: "linen", width: w, height: h });
            embossedCoverRef.current = embossed;
            plainCoverRef.current = plain;
            setEmbossedCoverTexture(embossed);
            setPlainCoverTexture(plain);
            setCoverTexture(linenTexture);
          }
        }
      }
    }

    void resolveCoverTextures();

    return () => {
      cancelled = true;
    };
  }, [project, dim.aspectRatio, linenTexture, leatherTexture]);

  // Helper to resolve photos on-demand for a specific page
  const resolvePagePhotosOnDemand = useCallback(
    async (page: AlbumPage): Promise<PhotoSourceMap> => {
      if (!project) return {};
      const sources: PhotoSourceMap = {};

      for (const placement of (page.photos ?? [])) {
        let blob = photoBlobCacheRef.current.get(placement.photoId);
        if (!blob) {
          const fetched = await getAlbumPhoto(project.id, placement.photoId);
          if (fetched) {
            blob = fetched;
            photoBlobCacheRef.current.set(placement.photoId, fetched);
          }
        }
        if (blob) {
          sources[placement.photoId] = blob;
        } else {
          const matched = project.photos?.find((p) => p.id === placement.photoId);
          if (matched?.url) {
            sources[placement.photoId] = matched.url;
          }
        }
      }

      console.log(`[RESOLVE_PHOTOS] Page ${page.id}: resolved ${Object.keys(sources).length} photo sources`, sources);
      return sources;
    },
    [project],
  );

  // Helper to render a page to canvas texture
  const renderPageTexture = useCallback(
    async (pageIdx: number): Promise<THREE.CanvasTexture | null> => {
      if (!project || typeof document === "undefined") return null;
      const page = project.pages[pageIdx];
      if (!page) return null;

      try {
        console.log(`[RENDER_TEX] Starting page ${pageIdx}`);
        const photoSources = await resolvePagePhotosOnDemand(page);
        const canvasW = 1200;
        const canvasH = Math.round(1200 / dim.aspectRatio);

        const canvas = await renderAlbumPageToCanvas(page, {
          width: canvasW,
          height: canvasH,
          projectId: project.id,
          photoSources,
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.needsUpdate = true;

        console.log(`[RENDER_TEX] Successfully created texture for page ${pageIdx}`);
        return texture;
      } catch (err) {
        console.error(`Error rendering page texture ${pageIdx}:`, err);
        return null;
      }
    },
    [project, dim.aspectRatio, resolvePagePhotosOnDemand],
  );

  // Windowed lazy texture rendering: prepares current, previous, and next spreads
  useEffect(() => {
    if (!project || typeof document === "undefined") return;

    let cancelled = false;
    const totalPages = project.pages.length;
    const totalSpreads = getTotalSpreads(totalPages);

    const targetPages = new Set<number>();
    const spreadsToPrepare = [
      spreadIndex,
      spreadIndex + 1 < totalSpreads ? spreadIndex + 1 : -1,
      spreadIndex - 1 >= 0 ? spreadIndex - 1 : -1,
    ];

    for (const s of spreadsToPrepare) {
      if (s < 0) continue;
      const { leftIndex, rightIndex } = getSpreadPageIndices(s, totalPages);
      if (leftIndex >= 0 && leftIndex < totalPages) targetPages.add(leftIndex);
      if (rightIndex >= 0 && rightIndex < totalPages) targetPages.add(rightIndex);
    }

    async function prepareSpreadTextures() {
      const cache = textureCacheRef.current;
      let stateChanged = false;

      for (const pageIdx of targetPages) {
        if (!cache.has(pageIdx) && !cancelled) {
          const texture = await renderPageTexture(pageIdx);
          if (cancelled) return;

          if (texture) {
            cache.set(pageIdx, texture);
            stateChanged = true;
          }
        }
      }

      // Evict only textures that are far outside the active window (> 2 spreads)
      for (const [key, tex] of cache.entries()) {
        const spreadDist = Math.abs(Math.floor(key / 2) - spreadIndex);
        if (spreadDist > 2) {
          tex.dispose();
          cache.delete(key);
          stateChanged = true;
        }
      }

      if (!cancelled && stateChanged) {
        setTextures(new Map(cache));
      }
    }

    void prepareSpreadTextures();

    return () => {
      cancelled = true;
    };
  }, [project, spreadIndex, renderPageTexture]);

  // Clean up all owned page textures strictly on unmount
  useEffect(() => {
    return () => {
      const cache = textureCacheRef.current;
      cache.forEach((tex) => tex.dispose());
      cache.clear();
      if (customCoverTextureRef.current) {
        customCoverTextureRef.current.dispose();
      }
      if (embossedCoverRef.current) {
        embossedCoverRef.current.dispose();
      }
      if (plainCoverRef.current) {
        plainCoverRef.current.dispose();
      }
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
      if (resumeAutoplayTimerRef.current) {
        clearTimeout(resumeAutoplayTimerRef.current);
      }
    };
  }, []);

  const totalPages = project?.pages.length ?? 0;
  const totalSpreads = getTotalSpreads(totalPages);
  const hasNext = spreadIndex < totalSpreads - 1;
  const hasPrevious = spreadIndex > 0;

  // Cinematic Hinge Action Triggers & State Transitions
  const handleStartOpen = useCallback(() => {
    if (viewState !== "closed") return;
    setViewState("opening");
  }, [viewState]);

  const handleStartClose = useCallback(() => {
    if (viewState !== "opened" || flipState !== null || isPreparingSpread) return;
    setIsAutoplayPlaying(false);
    setIsAutoplayPausedByUser(false);
    if (resumeAutoplayTimerRef.current) {
      clearTimeout(resumeAutoplayTimerRef.current);
      resumeAutoplayTimerRef.current = null;
    }
    setViewState("closing");
  }, [viewState, flipState, isPreparingSpread]);

  const handleOpenComplete = useCallback(() => {
    setViewState("opened");
  }, []);

  const handleCloseComplete = useCallback(() => {
    setSpreadIndex(0);
    setViewState("closed");
  }, []);

  // Turn page action with pre-loading verification
  const turnSpread = useCallback(
    async (direction: "next" | "previous", isManual = false) => {
      // Navigation is strictly guarded: only allowed when fully opened and at rest
      if (viewState !== "opened" || flipState || isPreparingSpread || !project) return;

      if (direction === "next" && !hasNext) return;
      if (direction === "previous" && !hasPrevious) return;

      // If manual interaction occurs during autoplay, pause and schedule auto-resume
      if (isManual) {
        registerUserInteraction();
      }

      const currentIndices = getSpreadPageIndices(spreadIndex, totalPages);
      const cache = textureCacheRef.current;

      // Identify needed pages for this animation
      const neededPages: number[] = [];
      if (direction === "next") {
        const nextIndices = getSpreadPageIndices(spreadIndex + 1, totalPages);
        if (currentIndices.rightIndex >= 0) neededPages.push(currentIndices.rightIndex);
        if (nextIndices.leftIndex >= 0) neededPages.push(nextIndices.leftIndex);
        if (nextIndices.rightIndex >= 0) neededPages.push(nextIndices.rightIndex);
      } else {
        const prevIndices = getSpreadPageIndices(spreadIndex - 1, totalPages);
        if (currentIndices.leftIndex >= 0) neededPages.push(currentIndices.leftIndex);
        if (prevIndices.rightIndex >= 0) neededPages.push(prevIndices.rightIndex);
        if (prevIndices.leftIndex >= 0) neededPages.push(prevIndices.leftIndex);
      }

      // Ensure all required textures are loaded before animating (never show blank pages)
      const missingPages = neededPages.filter((idx) => !cache.has(idx));
      if (missingPages.length > 0) {
        setIsPreparingSpread(true);
        try {
          for (const missingIdx of missingPages) {
            const tex = await renderPageTexture(missingIdx);
            if (tex) {
              cache.set(missingIdx, tex);
            }
          }
          setTextures(new Map(cache));
        } finally {
          setIsPreparingSpread(false);
        }
      }

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      flipControllerRef.current = {
        phase: "auto",
        direction,
        currentProgress: 0.0,
        targetProgress: 1.0,
        velocity: 0.0,
        startProgress: 0.0,
        duration: prefersReducedMotion ? 0.05 : DEFAULT_FLIP_DURATION,
        elapsed: 0.0,
        lastScrollTime: 0.0,
        isSettling: false,
      };

      // Trigger animation with verified textures
      if (direction === "next") {
        const nextIndices = getSpreadPageIndices(spreadIndex + 1, totalPages);

        const frontTex = cache.get(currentIndices.rightIndex) ?? blankTexture;
        const backTex = cache.get(nextIndices.leftIndex) ?? blankTexture;
        const underLeft = cache.get(currentIndices.leftIndex) ?? blankTexture;
        const underRight = cache.get(nextIndices.rightIndex) ?? blankTexture;

        setFlipState({
          direction: "next",
          frontTexture: frontTex,
          backTexture: backTex,
          underneathLeftTexture: underLeft,
          underneathRightTexture: underRight,
        });
      } else {
        const prevIndices = getSpreadPageIndices(spreadIndex - 1, totalPages);

        const frontTex = cache.get(currentIndices.leftIndex) ?? blankTexture;
        const backTex = cache.get(prevIndices.rightIndex) ?? blankTexture;
        const underLeft = cache.get(prevIndices.leftIndex) ?? blankTexture;
        const underRight = cache.get(currentIndices.rightIndex) ?? blankTexture;

        setFlipState({
          direction: "previous",
          frontTexture: frontTex,
          backTexture: backTex,
          underneathLeftTexture: underLeft,
          underneathRightTexture: underRight,
        });
      }
    },
    [
      viewState,
      flipState,
      isPreparingSpread,
      project,
      hasNext,
      hasPrevious,
      spreadIndex,
      totalPages,
      blankTexture,
      renderPageTexture,
    ],
  );

  // Initiates interactive drag-to-turn or scroll-to-turn with verified textures
  const initiateInteractiveFlip = useCallback(
    (
      direction: "next" | "previous",
      phase: "dragging" | "scrolling" = "dragging",
      initialTargetProgress = 0.0,
    ) => {
      if (viewState !== "opened" || isPreparingSpread || !project) return;
      if (flipControllerRef.current.phase !== "idle") return; // Synchronous controller guard
      if (direction === "next" && !hasNext) return;
      if (direction === "previous" && !hasPrevious) return;

      const currentIndices = getSpreadPageIndices(spreadIndex, totalPages);
      const cache = textureCacheRef.current;

      let frontTex: THREE.Texture;
      let backTex: THREE.Texture;
      let underLeft: THREE.Texture;
      let underRight: THREE.Texture;

      if (direction === "next") {
        const nextIndices = getSpreadPageIndices(spreadIndex + 1, totalPages);
        frontTex = cache.get(currentIndices.rightIndex) ?? blankTexture;
        backTex = cache.get(nextIndices.leftIndex) ?? blankTexture;
        underLeft = cache.get(currentIndices.leftIndex) ?? blankTexture;
        underRight = cache.get(nextIndices.rightIndex) ?? blankTexture;
      } else {
        const prevIndices = getSpreadPageIndices(spreadIndex - 1, totalPages);
        frontTex = cache.get(currentIndices.leftIndex) ?? blankTexture;
        backTex = cache.get(prevIndices.rightIndex) ?? blankTexture;
        underLeft = cache.get(prevIndices.leftIndex) ?? blankTexture;
        underRight = cache.get(currentIndices.rightIndex) ?? blankTexture;
      }

      flipControllerRef.current = {
        phase,
        direction,
        currentProgress: 0.0,
        targetProgress: initialTargetProgress,
        velocity: 0.0,
        startProgress: 0.0,
        duration: DEFAULT_FLIP_DURATION,
        elapsed: 0.0,
        lastScrollTime: performance.now(),
        isSettling: false,
      };

      setFlipState({
        direction,
        frontTexture: frontTex,
        backTexture: backTex,
        underneathLeftTexture: underLeft,
        underneathRightTexture: underRight,
      });
    },
    [
      viewState,
      isPreparingSpread,
      project,
      hasNext,
      hasPrevious,
      spreadIndex,
      totalPages,
      blankTexture,
    ],
  );

  const handleFlipComplete = useCallback(() => {
    const dir = flipControllerRef.current.direction;
    setSpreadIndex((curr) =>
      dir === "next"
        ? Math.min(curr + 1, totalSpreads - 1)
        : Math.max(0, curr - 1),
    );
    setFlipState(null);
    setIsDraggingPage(false);
    flipControllerRef.current = createInitialFlipControllerState();
  }, [totalSpreads]);

  const handleFlipCancel = useCallback(() => {
    setFlipState(null);
    setIsDraggingPage(false);
    flipControllerRef.current = createInitialFlipControllerState();
  }, []);

  // Keep a ref to turnSpread so re-renders do not destabilize the 2-second interval
  const turnSpreadRef = useRef(turnSpread);
  useEffect(() => {
    turnSpreadRef.current = turnSpread;
  }, [turnSpread]);

  // Autoplay Logic (Turn interval, pause on interaction, and cinematic ending)
  useEffect(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }

    if (
      viewState !== "opened" ||
      !isAutoplayPlaying ||
      isAutoplayPausedByUser ||
      flipState !== null ||
      isPreparingSpread ||
      !project
    ) {
      return;
    }

    // Ending: When final photograph has been displayed, pause briefly, then physically close hardcover
    if (spreadIndex >= totalSpreads - 1) {
      autoplayTimerRef.current = setTimeout(() => {
        setIsAutoplayPlaying(false);
        setIsAutoplayPausedByUser(false);
        handleStartClose();
      }, 3200);
      return;
    }

    // Schedule next turn with comfortable viewing duration
    autoplayTimerRef.current = setTimeout(() => {
      if (spreadIndex < totalSpreads - 1) {
        void turnSpreadRef.current("next", false);
      }
    }, 4200);

    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [
    viewState,
    isAutoplayPlaying,
    isAutoplayPausedByUser,
    spreadIndex,
    totalSpreads,
    flipState,
    isPreparingSpread,
    project,
    handleStartClose,
  ]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        if (viewState === "closed") {
          handleStartOpen();
        } else if (viewState === "opened") {
          void turnSpread("next", true);
        }
      } else if (event.key === "ArrowLeft") {
        if (viewState === "opened") {
          if (spreadIndex === 0) {
            handleStartClose();
          } else {
            void turnSpread("previous", true);
          }
        }
      } else if (event.key === "Enter" || event.key === "o") {
        if (viewState === "closed") {
          handleStartOpen();
        }
      } else if (event.key === "Escape" || event.key === "c") {
        if (viewState === "opened") {
          handleStartClose();
        }
      } else if (
        event.key === "Home" &&
        viewState === "opened" &&
        !flipState &&
        !isPreparingSpread &&
        spreadIndex > 0
      ) {
        setSpreadIndex(0);
      } else if (
        event.key === "End" &&
        viewState === "opened" &&
        !flipState &&
        !isPreparingSpread &&
        spreadIndex < totalSpreads - 1
      ) {
        setSpreadIndex(totalSpreads - 1);
      } else if (event.key === " " || event.key === "p") {
        event.preventDefault();
        if (viewState === "closed") {
          handleStartOpen();
        } else if (viewState === "opened") {
          setIsAutoplayPlaying((prev) => !prev);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    turnSpread,
    flipState,
    isPreparingSpread,
    spreadIndex,
    totalSpreads,
    viewState,
    handleStartOpen,
    handleStartClose,
  ]);

  // Unified Pointer Drag-to-Turn & Click-to-Turn Handlers (Mouse, Touch, Pen)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (viewState !== "opened" || flipState !== null || isPreparingSpread || !project) return;
      if (e.button !== 0) return; // Only primary button / touch / pen

      // Pause autoplay and schedule idle resumption
      registerUserInteraction();

      const rect = e.currentTarget.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const intendedDirection: "next" | "previous" = relX > 0.5 ? "next" : "previous";

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}

      dragTrackingRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startTime: performance.now(),
        lastX: e.clientX,
        lastTime: performance.now(),
        velocityX: 0,
        direction: intendedDirection,
        isActiveDrag: false,
        containerWidth: rect.width,
      };
    },
    [viewState, flipState, isPreparingSpread, project, isAutoplayPlaying],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const track = dragTrackingRef.current;
      if (!track || track.pointerId !== e.pointerId) return;

      const deltaX = e.clientX - track.startX;
      const now = performance.now();
      const dt = now - track.lastTime;
      if (dt > 8) {
        track.velocityX = (e.clientX - track.lastX) / dt;
        track.lastX = e.clientX;
        track.lastTime = now;
      }

      if (!track.isActiveDrag) {
        if (Math.abs(deltaX) >= DRAG_SLOP_PIXELS) {
          const isForwardMotion = deltaX < -2;
          const isBackwardMotion = deltaX > 2;

          if (isForwardMotion && hasNext) {
            track.isActiveDrag = true;
            track.direction = "next";
            setIsDraggingPage(true);
            initiateInteractiveFlip("next");
          } else if (isBackwardMotion && hasPrevious) {
            track.isActiveDrag = true;
            track.direction = "previous";
            setIsDraggingPage(true);
            initiateInteractiveFlip("previous");
          }
        }
      }

      if (track.isActiveDrag && flipControllerRef.current.phase === "dragging") {
        const progress = computeDragProgress(deltaX, track.containerWidth, track.direction);
        flipControllerRef.current.targetProgress = progress;
      }
    },
    [hasNext, hasPrevious, initiateInteractiveFlip],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const track = dragTrackingRef.current;
      if (!track || track.pointerId !== e.pointerId) return;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}

      dragTrackingRef.current = null;
      setIsDraggingPage(false);

      if (track.isActiveDrag) {
        const ctrl = flipControllerRef.current;
        if (ctrl.phase === "dragging") {
          const currentProg = ctrl.currentProgress;
          const willComplete = shouldCompleteTurn(currentProg, track.velocityX, track.direction);
          const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

          if (willComplete) {
            ctrl.phase = "completing";
            ctrl.startProgress = currentProg;
            ctrl.targetProgress = 1.0;
            ctrl.duration = computeTransitionDuration(currentProg, 1.0, prefersReducedMotion);
            ctrl.elapsed = 0.0;
          } else {
            ctrl.phase = "rebounding";
            ctrl.startProgress = currentProg;
            ctrl.targetProgress = 0.0;
            ctrl.duration = computeTransitionDuration(currentProg, 0.0, prefersReducedMotion);
            ctrl.elapsed = 0.0;
          }
        }
      } else {
        // Fast click or tap without dragging
        const elapsed = performance.now() - track.startTime;
        const totalDist = Math.hypot(e.clientX - track.startX, e.clientY - track.startY);
        if (elapsed < 450 && totalDist < DRAG_SLOP_PIXELS) {
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width;
          if (relX > 0.58 && hasNext) {
            void turnSpread("next", true);
          } else if (relX < 0.42 && hasPrevious) {
            void turnSpread("previous", true);
          }
        }
      }
    },
    [hasNext, hasPrevious, turnSpread],
  );

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const track = dragTrackingRef.current;
      if (!track || track.pointerId !== e.pointerId) return;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}

      dragTrackingRef.current = null;
      setIsDraggingPage(false);

      const ctrl = flipControllerRef.current;
      if (ctrl.phase === "dragging") {
        const currentProg = ctrl.currentProgress;
        ctrl.phase = "rebounding";
        ctrl.startProgress = currentProg;
        ctrl.targetProgress = 0.0;
        ctrl.duration = computeTransitionDuration(currentProg, 0.0);
        ctrl.elapsed = 0.0;
      }
    },
    [],
  );

  // Mutable reference context for zero-render wheel event tracking
  const scrollContextRef = useRef({
    viewState,
    hasNext,
    hasPrevious,
    isPreparingSpread,
    isExportingPdf,
    isAutoplayPlaying,
    stopAutoplay: () => {},
  });

  scrollContextRef.current = {
    viewState,
    hasNext,
    hasPrevious,
    isPreparingSpread,
    isExportingPdf,
    isAutoplayPlaying,
    stopAutoplay: () => {
      registerUserInteraction();
    },
  };

  const flipStateRef = useRef(flipState);
  flipStateRef.current = flipState;

  const initiateInteractiveFlipRef = useRef(initiateInteractiveFlip);
  initiateInteractiveFlipRef.current = initiateInteractiveFlip;

  // Wheel / Trackpad Scroll-Controlled Page Turning (Stable, Framerate-Independent Listener)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleWheel(e: WheelEvent) {
      const ctx = scrollContextRef.current;

      // 1. Only respond when book is opened (allow natural window scroll when closed)
      if (ctx.viewState !== "opened" || ctx.isPreparingSpread || ctx.isExportingPdf) {
        return;
      }

      // Normalize delta across pixel, line, and page modes
      let deltaY = e.deltaY;
      if (e.deltaMode === 1) {
        deltaY *= 20; // DOM_DELTA_LINE
      } else if (e.deltaMode === 2) {
        deltaY *= 500; // DOM_DELTA_PAGE
      }

      // Clamp extreme single-tick spikes from high-acceleration trackpads/wheels
      const clampedDelta = Math.max(-160, Math.min(160, deltaY));

      // Autoplay instantly pauses on any user scroll interaction
      if (ctx.isAutoplayPlaying) {
        ctx.stopAutoplay();
      }

      const ctrl = flipControllerRef.current;

      // If user is actively dragging with pointer or in auto flip, don't interrupt with wheel
      if (ctrl.phase === "dragging" || ctrl.phase === "auto") {
        return;
      }

      // Case A: Idle (no flip active)
      if (ctrl.phase === "idle") {
        // Scroll down (positive delta) -> forward turn
        if (clampedDelta > SCROLL_MIN_DELTA_THRESHOLD) {
          if (ctx.hasNext) {
            e.preventDefault();
            const initialProg = Math.min(0.4, clampedDelta / SCROLL_TURN_DISTANCE_PX);
            initiateInteractiveFlipRef.current("next", "scrolling", initialProg);
          }
          // If on last spread (hasNext === false), do NOT preventDefault! Allow normal page scroll!
        }
        // Scroll up (negative delta) -> backward turn
        else if (clampedDelta < -SCROLL_MIN_DELTA_THRESHOLD) {
          if (ctx.hasPrevious) {
            e.preventDefault();
            const initialProg = Math.min(0.4, -clampedDelta / SCROLL_TURN_DISTANCE_PX);
            initiateInteractiveFlipRef.current("previous", "scrolling", initialProg);
          }
          // If on first spread (hasPrevious === false), do NOT preventDefault! Allow normal page scroll!
        }
        return;
      }

      // Case B: Active scrolling or continuous settling
      if (ctrl.phase === "scrolling") {
        e.preventDefault();

        // User is providing scroll input: wake up from auto-settling immediately
        ctrl.isSettling = false;
        ctrl.lastScrollTime = performance.now();

        // Direction-aware progress increment
        const signedDelta = ctrl.direction === "next" ? clampedDelta : -clampedDelta;
        const deltaProg = signedDelta / SCROLL_TURN_DISTANCE_PX;

        // Smooth target accumulation with gentle boundary headroom [-0.05, 1.05]
        ctrl.targetProgress = Math.max(-0.05, Math.min(1.05, ctrl.targetProgress + deltaProg));
      }
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Fullscreen toggle
  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not supported or permitted
    }
  }

  // PDF Export Trigger
  async function handleDownloadPdf() {
    if (!project || isExportingPdf || isAlbumExporting()) return;
    setIsExportingPdf(true);
    setPdfProgress(0);
    setPdfStatus("Initializing PDF export...");
    setPdfError(null);

    try {
      await exportAlbumToPdf(project, {
        dpi: 300,
        includeCover: true,
        autoDownload: true,
        onProgress: (progress, status) => {
          setPdfProgress(progress);
          setPdfStatus(status);
        },
      });
    } catch (err) {
      console.error("PDF export error:", err);
      setPdfError(
        err instanceof Error ? err.message : "Failed to generate PDF. Please try again.",
      );
    } finally {
      setIsExportingPdf(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F0E8] text-[#292522]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B99B70] border-t-transparent" />
          <p className="font-serif text-lg text-[#292522]">Loading your photobook...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#F5F0E8] text-[#292522]">
        <h1 className="font-serif text-3xl text-[#292522]">Album not found</h1>
        <button
          type="button"
          onClick={() => router.push("/albums")}
          className="rounded-full bg-[#B99B70] px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#D0B48A]"
        >
          Back to albums
        </button>
      </main>
    );
  }

  const { leftIndex, rightIndex } = getSpreadPageIndices(spreadIndex, totalPages);
  const leftPageLabel = leftIndex >= 0 ? `Page ${leftIndex + 1}` : "";
  const rightPageLabel = rightIndex >= 0 ? `Page ${rightIndex + 1}` : "";

  return (
    <main
      className={`flex flex-col overflow-hidden bg-[#F5F0E8] text-[#292522] ${
        isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "min-h-screen"
      }`}
    >
      {/* Header bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#B99B70]/25 bg-white/70 px-5 py-4 backdrop-blur-md sm:px-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B99B70]">
            StudioFrame 3D Photobook
          </p>
          <h1 className="mt-1 font-serif text-xl text-[#292522]">
            {project.name || "Custom Album"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isPreparingSpread && (
            <span className="flex items-center gap-2 rounded-full bg-[#B99B70]/15 px-3.5 py-1.5 text-xs text-[#8C6D3F]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#B99B70]" />
              Preparing spread...
            </span>
          )}

          {/* Download PDF Control */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf || !!flipState}
            className="flex items-center gap-2 rounded-full border border-[#B99B70] bg-white px-4 py-2 text-xs font-semibold text-[#292522] shadow-sm transition hover:bg-[#B99B70] hover:text-[#171717] disabled:opacity-50"
          >
            {isExportingPdf ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                <span>Exporting {pdfProgress}%</span>
              </>
            ) : (
              <>
                <span>📥</span>
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-full border border-[#292522]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#292522] shadow-sm transition hover:border-[#B99B70]"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/albums/editor/${projectId}`)}
            className="rounded-full bg-[#B99B70] px-5 py-2 text-xs font-semibold text-[#171717] shadow-sm transition hover:bg-[#D0B48A]"
          >
            Back to editor
          </button>
        </div>
      </header>

      {/* PDF Export Notification Overlay */}
      {isExportingPdf && (
        <div className="border-b border-[#B99B70]/30 bg-[#F4EDE2] px-6 py-2.5 text-center text-xs text-[#5C5248]">
          <div className="flex items-center justify-center gap-3">
            <span className="h-3 w-3 animate-spin rounded-full border border-[#B99B70] border-t-transparent" />
            <span className="font-medium">
              Generating 300-DPI Print PDF: {pdfStatus} ({pdfProgress}%)
            </span>
          </div>
        </div>
      )}

      {pdfError && (
        <div className="flex items-center justify-between border-b border-red-500/30 bg-red-50 px-6 py-2.5 text-xs text-red-700">
          <span>{pdfError}</span>
          <button
            type="button"
            onClick={() => setPdfError(null)}
            className="rounded px-2 py-0.5 text-xs font-bold text-red-600 hover:bg-red-100"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* 3D Canvas Area (Interactive Book Display with Drag-to-Turn) */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-3 py-4 sm:py-6">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className={`relative h-[62vh] min-h-[400px] w-full max-w-6xl sm:h-[72vh] touch-none select-none ${
            viewState === "opened"
              ? isDraggingPage
                ? "cursor-grabbing"
                : "cursor-grab"
              : ""
          }`}
        >
          {/* Subtle Left Side Drag/Click Target (Visible strictly in opened spread state) */}
          {viewState === "opened" && (
            <button
              type="button"
              onClick={() => void turnSpread("previous", true)}
              disabled={!hasPrevious || !!flipState || isPreparingSpread}
              title="Turn to previous spread"
              aria-label="Previous spread"
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-lg font-bold text-[#292522] border border-[#B99B70]/30 shadow-md backdrop-blur-md transition hover:bg-[#B99B70] hover:text-[#171717] disabled:pointer-events-none disabled:opacity-0"
            >
              ◀
            </button>
          )}

          {/* Subtle Right Side Drag/Click Target (Visible strictly in opened spread state) */}
          {viewState === "opened" && (
            <button
              type="button"
              onClick={() => void turnSpread("next", true)}
              disabled={!hasNext || !!flipState || isPreparingSpread}
              title="Turn to next spread"
              aria-label="Next spread"
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-lg font-bold text-[#292522] border border-[#B99B70]/30 shadow-md backdrop-blur-md transition hover:bg-[#B99B70] hover:text-[#171717] disabled:pointer-events-none disabled:opacity-0"
            >
              ▶
            </button>
          )}

          {/* Canvas Callout Overlays */}
          {viewState === "closed" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center">
              <button
                type="button"
                onClick={handleStartOpen}
                className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#B99B70] bg-white/95 px-6 py-2.5 text-xs font-semibold text-[#292522] shadow-lg backdrop-blur-md transition hover:bg-[#B99B70] hover:text-[#171717]"
              >
                <span>📖</span>
                <span>Click Cover to Open Album ▶</span>
              </button>
            </div>
          )}

          {viewState === "opening" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-[#B99B70]/60 bg-white/95 px-6 py-2.5 text-xs font-semibold text-[#5C5248] shadow-lg backdrop-blur-md">
                <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-[#B99B70] border-t-transparent" />
                <span>Cinematic Cover Opening...</span>
              </div>
            </div>
          )}

          {viewState === "closing" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-[#B99B70]/60 bg-white/95 px-6 py-2.5 text-xs font-semibold text-[#5C5248] shadow-lg backdrop-blur-md">
                <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-[#B99B70] border-t-transparent" />
                <span>Cinematic Cover Closing...</span>
              </div>
            </div>
          )}

          <Canvas
            shadows={{ type: THREE.PCFSoftShadowMap }}
            camera={{
              position: [0.15, -dim.pageHeight * 0.12, dim.cameraDistance * 0.95],
              fov: 38,
            }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          >
            <Suspense fallback={null}>
              <BookScene
                project={project}
                spreadIndex={spreadIndex}
                dim={dim}
                textures={textures}
                coverTexture={coverTexture}
                embossedCoverTexture={embossedCoverTexture}
                plainCoverTexture={plainCoverTexture}
                edgeTexture={edgeTexture}
                blankTexture={blankTexture}
                flipState={flipState}
                flipControllerRef={flipControllerRef}
                onFlipComplete={handleFlipComplete}
                onFlipCancel={handleFlipCancel}
                isDraggingPage={isDraggingPage}
                viewState={viewState}
                onOpenComplete={handleOpenComplete}
                onCloseComplete={handleCloseComplete}
                onStartOpen={handleStartOpen}
                onTurnLeftPage={() => void turnSpread("previous", true)}
                onTurnRightPage={() => void turnSpread("next", true)}
                canTurnLeft={hasPrevious && !flipState && !isPreparingSpread}
                canTurnRight={hasNext && !flipState && !isPreparingSpread}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Navigation & View Controls based on ViewState */}
        {viewState === "closed" ? (
          <div className="mt-4 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/90 border border-[#B99B70]/30 px-4 py-2 text-xs font-semibold text-[#5C5248] shadow-sm">
                Physical Hardcover · Closed View
              </span>
              <span className="text-xs text-[#5C5248]/75">
                {project.name || "Custom Album"} · {dim.pageWidth * 4} × {dim.pageHeight * 4}&quot; ({project.coverFinish.toUpperCase()})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleStartOpen}
                className="flex items-center gap-2 rounded-full bg-[#B99B70] px-7 py-3 text-sm font-semibold text-[#171717] shadow-lg transition hover:bg-[#D0B48A]"
              >
                <span>Open Album</span>
                <span>▶</span>
              </button>
            </div>
          </div>
        ) : viewState === "opening" ? (
          <div className="mt-4 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full bg-[#B99B70]/20 px-4 py-2 text-xs font-semibold text-[#8C6D3F]">
                <span className="h-2 w-2 animate-ping rounded-full bg-[#B99B70]" />
                Opening Album...
              </span>
            </div>
            <button
              type="button"
              disabled
              className="flex items-center gap-2 rounded-full bg-[#B99B70]/50 px-7 py-3 text-sm font-semibold text-[#171717] opacity-60 cursor-not-allowed"
            >
              <span>Opening...</span>
            </button>
          </div>
        ) : viewState === "closing" ? (
          <div className="mt-4 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full bg-[#B99B70]/20 px-4 py-2 text-xs font-semibold text-[#8C6D3F]">
                <span className="h-2 w-2 animate-ping rounded-full bg-[#B99B70]" />
                Closing Album...
              </span>
            </div>
            <button
              type="button"
              disabled
              className="flex items-center gap-2 rounded-full bg-[#B99B70]/50 px-7 py-3 text-sm font-semibold text-[#171717] opacity-60 cursor-not-allowed"
            >
              <span>Closing...</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4">
            {/* Previous / First Controls + Close Album button */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleStartClose}
                disabled={!!flipState || isPreparingSpread}
                title="Close album with cinematic hinge animation"
                aria-label="Close album"
                className="rounded-full border border-[#292522]/20 bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#292522] shadow-sm transition hover:border-[#B99B70] hover:text-[#8C6D3F] disabled:opacity-25"
              >
                📕 Close
              </button>
              <button
                type="button"
                onClick={() => !flipState && !isPreparingSpread && setSpreadIndex(0)}
                disabled={!hasPrevious || !!flipState || isPreparingSpread}
                title="First spread"
                aria-label="First spread"
                className="rounded-full border border-[#292522]/20 bg-white/90 px-3 py-2 text-xs font-semibold text-[#292522] shadow-sm transition hover:border-[#B99B70] disabled:opacity-25"
              >
                ⏮
              </button>
              <button
                type="button"
                onClick={() => void turnSpread("previous", true)}
                disabled={!hasPrevious || !!flipState || isPreparingSpread}
                className="rounded-full border border-[#292522]/20 bg-white/90 px-4 py-2 text-xs font-semibold text-[#292522] shadow-sm transition hover:border-[#B99B70] disabled:opacity-25 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                ◀ Previous
              </button>
            </div>

            {/* Autoplay Play/Pause & Spread Position */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (isAutoplayPlaying) {
                    setIsAutoplayPlaying(false);
                    setIsAutoplayPausedByUser(false);
                    if (resumeAutoplayTimerRef.current) {
                      clearTimeout(resumeAutoplayTimerRef.current);
                      resumeAutoplayTimerRef.current = null;
                    }
                  } else {
                    setIsAutoplayPlaying(true);
                    setIsAutoplayPausedByUser(false);
                  }
                }}
                disabled={!!flipState || isPreparingSpread}
                aria-label={isAutoplayPlaying ? "Pause automatic page turning" : "Play automatic page turning"}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm transition ${
                  isAutoplayPlaying
                    ? "bg-[#B99B70] text-[#171717] ring-2 ring-[#B99B70]/40"
                    : "border border-[#292522]/20 bg-white/90 text-[#292522] hover:border-[#B99B70]"
                }`}
              >
                <span>{isAutoplayPlaying ? (isAutoplayPausedByUser ? "⏳" : "⏸") : "▶"}</span>
                <span>
                  {isAutoplayPlaying
                    ? isAutoplayPausedByUser
                      ? "Auto (paused)"
                      : "Pause Auto"
                    : "Autoplay"}
                </span>
              </button>

              <div className="text-center">
                <p className="text-xs font-medium tracking-wider text-[#8C6D3F]">
                  Spread {spreadIndex + 1} of {totalSpreads}
                </p>
                <p className="text-[11px] text-[#5C5248]/75">
                  {leftPageLabel}
                  {rightPageLabel ? ` · ${rightPageLabel}` : ""}
                </p>
              </div>
            </div>

            {/* Next / Last Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => void turnSpread("next", true)}
                disabled={!hasNext || !!flipState || isPreparingSpread}
                className="rounded-full bg-[#B99B70] px-4 py-2 text-xs font-semibold text-[#171717] shadow-md transition hover:bg-[#D0B48A] disabled:opacity-25 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                Next ▶
              </button>
              <button
                type="button"
                onClick={() =>
                  !flipState && !isPreparingSpread && setSpreadIndex(totalSpreads - 1)
                }
                disabled={!hasNext || !!flipState || isPreparingSpread}
                title="Last spread"
                aria-label="Last spread"
                className="rounded-full border border-[#292522]/20 bg-white/90 px-3 py-2 text-xs font-semibold text-[#292522] shadow-sm transition hover:border-[#B99B70] disabled:opacity-25"
              >
                ⏭
              </button>
            </div>
          </div>
        )}

        <p className="mt-3 text-center text-[11px] text-[#5C5248]/60">
          {viewState === "closed"
            ? "Click the cover or 'Open Album' to view inner spreads. Rotate with mouse to inspect physical hardcover."
            : viewState === "opening" || viewState === "closing"
              ? "Smooth cinematic hardcover animation in progress..."
              : "Click the left page to turn back, or the right page to turn forward. You can also scroll, drag page corners, or press Space for autoplay. Use 'Close Album' or Escape to close."}
        </p>
      </section>
    </main>
  );
}
