"use client";

import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  useTexture,
} from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  LinearFilter,
  MeshPhysicalMaterial,
  Object3D,
  PerspectiveCamera,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  Texture,
  TubeGeometry,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from "three";

import type {
  FrameColorId,
  FrameDesignId,
  FrameMaterialId,
  GlazingTypeId,
  ProfileSlice,
} from "../../types/frame";
import { FRAME_COLORS } from "../../config/frameMaterials";
import {
  FRAME_PROFILE_DESIGNS,
  FRAME_GLAZING_OPTIONS,
} from "../../config/frameOptions";

const STUDIO_LIGHTING = {
  ambient: {
    color: "#F5F0E8",
    intensity: 0.7,
  },
  spotlight: {
    color: "#E5CCA6",
    intensity: 3.2,
    position: [0, 1.8, 4.2] as const,
    angle: 0.65,
    penumbra: 0.8,
    distance: 14,
    decay: 1.8,
    castShadow: true,
  },
  keyLight: {
    color: "#FFF9F0",
    intensity: 2.4,
    position: [3.2, 5.0, 4.5] as const,
    castShadow: true,
    shadowBias: -0.0001,
    shadowMapSize: 2048,
  },
  fillLight: {
    color: "#E8DDCE",
    intensity: 0.95,
    position: [-4.2, 2.0, 3.2] as const,
  },
  rimLight: {
    color: "#B89B70",
    intensity: 0.85,
    position: [0, -3.2, 3.0] as const,
  },
  contactShadows: {
    opacity: 0.68,
    scale: 10,
    blur: 2.6,
    far: 4.5,
    color: "#0B0A09",
  },
} as const;

const MAT_BOARD_CONFIG = {
  name: "Archival Ivory Mat Board",
  color: "#F5F0E8",
  coreColor: "#FFFFFF",
  roughness: 0.88,
  metalness: 0.0,
  bevelWidthIn: 0.0625,
  bevelAngleDeg: 45,
  defaultMarginIn: 2.0,
  minMarginIn: 1.0,
  maxMarginIn: 4.0,
} as const;

export interface Frame3DPreviewProps {
  widthIn: number;
  heightIn: number;
  frameMaterial: FrameMaterialId;
  frameDesign?: FrameDesignId;
  frameColor?: FrameColorId;
  glazingType?: GlazingTypeId;
  artworkUrl: string | null;
  photoZoom: number;
  photoPosition: {
    x: number;
    y: number;
  };
  onPhotoPositionChange?: (position: { x: number; y: number }) => void;
  onRegisterExport?: (
    exportFn: (options?: {
      triggerDownload?: boolean;
    }) => Promise<string | null>,
  ) => void;
}

const INCH_TO_SCENE = 0.12;
const FRAME_BORDER = 0.22;
const CAMERA_FOV = 38;

/**
 * Global texture cache to prevent regenerating procedural textures on every render.
 * Ensures single-generation lifecycle and instant material switching.
 */
const proceduralTextureCache = new Map<string, Texture>();

export type WoodSpecies = "walnut" | "oak" | "mahogany";

/**
 * Procedurally generates natural wood diffuse textures for distinct timber species.
 * Features high-contrast growth rings, porous ducts, and organic fiber waves.
 */
function getOrCreateWoodDiffuseTexture(
  species: WoodSpecies = "walnut",
): Texture {
  if (typeof document === "undefined") {
    return new Texture();
  }

  const cacheKey = `wood_diffuse_v3_${species}`;
  if (proceduralTextureCache.has(cacheKey)) {
    return proceduralTextureCache.get(cacheKey)!;
  }

  const width = 1024;
  const height = 128;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Texture();

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // Grain runs horizontally along x (rail length) with zero random wavy swirls
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Very gentle natural organic drift along the rail (amplitude only ~1.5px over hundreds of px)
      const uDrift = Math.sin(x * 0.005) * 1.5 + Math.sin(x * 0.0018) * 1.0;
      const py = y + uDrift;

      let density = 0.5;

      if (species === "oak") {
        // Oak: broad open growth rings + fine medullary pore ducts
        const ring = Math.sin(py * 0.28) * 0.5 + 0.5;
        const pore = Math.sin(py * 1.6) * 0.5 + 0.5;
        const noise =
          (((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) + 1) * 0.5;
        density = ring * 0.55 + pore * 0.30 + noise * 0.15;
      } else if (species === "mahogany") {
        // Mahogany: interlocked straight fine grain with ribbon figure
        const ring = Math.sin(py * 0.22) * 0.5 + 0.5;
        const fiber = Math.sin(py * 1.4) * 0.5 + 0.5;
        const noise =
          (((Math.sin(x * 15.34 + y * 82.12) * 43758.5453) % 1) + 1) * 0.5;
        density = ring * 0.45 + fiber * 0.40 + noise * 0.15;
      } else {
        // Walnut: smooth parabolic heartwood grain
        const ring = Math.sin(py * 0.18) * 0.5 + 0.5;
        const fiber = Math.sin(py * 1.2) * 0.5 + 0.5;
        const noise =
          (((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) + 1) * 0.5;
        density = ring * 0.50 + fiber * 0.35 + noise * 0.15;
      }

      // High-luminance base so multiplying by activeColor does not muddy or alter the hue
      const lum = Math.min(
        255,
        Math.max(160, Math.round(185 + density * 70)),
      );
      const idx = (y * width + x) * 4;
      data[idx] = lum;
      data[idx + 1] = Math.round(lum * 0.96);
      data[idx + 2] = Math.round(lum * 0.90);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  proceduralTextureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Procedurally generates a matching wood fiber bump map for realistic micro-pore depth.
 */
function getOrCreateWoodBumpTexture(species: WoodSpecies = "walnut"): Texture {
  if (typeof document === "undefined") {
    return new Texture();
  }

  const cacheKey = `wood_bump_v3_${species}`;
  if (proceduralTextureCache.has(cacheKey)) {
    return proceduralTextureCache.get(cacheKey)!;
  }

  const width = 1024;
  const height = 128;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Texture();

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  const freq = species === "oak" ? 1.6 : species === "mahogany" ? 1.4 : 1.2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const uDrift = Math.sin(x * 0.005) * 1.5 + Math.sin(x * 0.0018) * 1.0;
      const py = y + uDrift;

      const fiber = Math.sin(py * freq) * 0.5 + 0.5;
      const noise =
        (((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) + 1) * 0.5;

      const bump = Math.round((fiber * 0.75 + noise * 0.25) * 255);

      const idx = (y * width + x) * 4;
      data[idx] = bump;
      data[idx + 1] = bump;
      data[idx + 2] = bump;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;

  proceduralTextureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Procedurally generates a directional brushed aluminium diffuse texture.
 * Features parallel micro-streaks along the extrusion axis to produce metallic gleam.
 */
function getOrCreateBrushedAluminiumDiffuseTexture(): Texture {
  if (typeof document === "undefined") {
    return new Texture();
  }

  const cacheKey = "brushed_aluminium_diffuse_v2";
  if (proceduralTextureCache.has(cacheKey)) {
    return proceduralTextureCache.get(cacheKey)!;
  }

  const width = 512;
  const height = 128;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Texture();

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // Pre-generate longitudinal streak rows
  for (let y = 0; y < height; y++) {
    const rowSeed = (((Math.sin(y * 431.17) * 43758.5453) % 1) + 1) * 0.5;
    const baseShade = 190 + Math.round(rowSeed * 50);

    for (let x = 0; x < width; x++) {
      const streak = Math.sin(x * 0.08 + rowSeed * 20.0) * 12.0;
      const microNoise =
        (((Math.sin(x * 37.1 + y * 91.3) * 43758.5453) % 1) + 1) * 0.5 * 18.0;
      const val = Math.min(
        255,
        Math.max(140, Math.round(baseShade + streak + microNoise)),
      );

      const idx = (y * width + x) * 4;
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  proceduralTextureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Procedurally generates a directional brushed aluminium bump map.
 */
function getOrCreateBrushedAluminiumBumpTexture(): Texture {
  if (typeof document === "undefined") {
    return new Texture();
  }

  const cacheKey = "brushed_aluminium_bump_v2";
  if (proceduralTextureCache.has(cacheKey)) {
    return proceduralTextureCache.get(cacheKey)!;
  }

  const width = 512;
  const height = 128;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Texture();

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const rowOffset = (((Math.sin(y * 127.1) * 43758.5453) % 1) + 1) * 0.5;

    for (let x = 0; x < width; x++) {
      const streak =
        Math.sin((x * 0.04 + rowOffset * 10.0) * Math.PI * 2) * 0.5 + 0.5;
      const noise =
        (((Math.sin(x * 71.3 + y * 91.7) * 43758.5453) % 1) + 1) * 0.5;
      const bump = Math.round((streak * 0.7 + noise * 0.3) * 255);

      const idx = (y * width + x) * 4;
      data[idx] = bump;
      data[idx + 1] = bump;
      data[idx + 2] = bump;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;

  proceduralTextureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Procedurally generates a uniform, isotropic engineered fiber diffuse texture for MDF.
 * Zero directional grain lines, subtle micro-speckle board texture.
 */
function getOrCreateMDFDiffuseTexture(): Texture {
  if (typeof document === "undefined") {
    return new Texture();
  }

  const cacheKey = "mdf_diffuse_v2";
  if (proceduralTextureCache.has(cacheKey)) {
    return proceduralTextureCache.get(cacheKey)!;
  }

  const width = 256;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Texture();

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const n1 =
        (((Math.sin(x * 21.17 + y * 63.89) * 43758.5453) % 1) + 1) * 0.5;
      const n2 =
        (((Math.sin(x * 87.33 + y * 41.11) * 43758.5453) % 1) + 1) * 0.5;
      const val = Math.round(210 + (n1 * 0.5 + n2 * 0.5) * 35);

      const idx = (y * width + x) * 4;
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  proceduralTextureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Procedurally generates an engineered micro-stipple bump texture for MDF board.
 */
function getOrCreateMDFBumpTexture(): Texture {
  if (typeof document === "undefined") {
    return new Texture();
  }

  const cacheKey = "mdf_engineered_bump_v2";
  if (proceduralTextureCache.has(cacheKey)) {
    return proceduralTextureCache.get(cacheKey)!;
  }

  const width = 256;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Texture();

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const n1 =
        (((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) + 1) * 0.5;
      const n2 =
        (((Math.sin(x * 93.989 + y * 67.345) * 43758.5453) % 1) + 1) * 0.5;
      const val = Math.round((n1 * 0.6 + n2 * 0.4) * 255);
      const idx = (y * width + x) * 4;
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;

  proceduralTextureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Procedural Geometry Generator for Parametric Moulding Profiles.
 * Generates continuous picture frame moulding with miter corners and rail-aligned UV coordinates.
 */
function createSculptedFrameGeometry(
  outerWidth: number,
  outerHeight: number,
  borderWidth: number,
  slices: ProfileSlice[],
): BufferGeometry {
  const halfOuterW = outerWidth / 2;
  const halfOuterH = outerHeight / 2;

  const positions: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i < slices.length - 1; i++) {
    const sA = slices[i];
    const sB = slices[i + 1];

    const wA = halfOuterW - sA.t * borderWidth;
    const hA = halfOuterH - sA.t * borderWidth;
    const zA = sA.z;

    const wB = halfOuterW - sB.t * borderWidth;
    const hB = halfOuterH - sB.t * borderWidth;
    const zB = sB.z;

    // 4 corners of loop A (BL: 0, BR: 1, TR: 2, TL: 3)
    const loopA: [number, number, number][] = [
      [-wA, -hA, zA],
      [wA, -hA, zA],
      [wA, hA, zA],
      [-wA, hA, zA],
    ];

    // 4 corners of loop B (BL: 0, BR: 1, TR: 2, TL: 3)
    const loopB: [number, number, number][] = [
      [-wB, -hB, zB],
      [wB, -hB, zB],
      [wB, hB, zB],
      [-wB, hB, zB],
    ];

    // Connect the 4 rails: Bottom (0), Right (1), Top (2), Left (3)
    for (let side = 0; side < 4; side++) {
      const c1 = side;
      const c2 = (side + 1) % 4;

      const pA = loopA[c1];
      const pB = loopA[c2];
      const pC = loopB[c2];
      const pD = loopB[c1];

      // Rail length in scene units
      const railLength = side % 2 === 0 ? outerWidth : outerHeight;
      const uScale = Math.max(1, railLength * 3.5);

      const miterShiftA = sA.t * borderWidth * (uScale / railLength);
      const miterShiftB = sB.t * borderWidth * (uScale / railLength);

      const uA_1 = miterShiftA;
      const uB_1 = uScale - miterShiftA;
      const uC_1 = uScale - miterShiftB;
      const uD_1 = miterShiftB;

      // Triangle 1: pA, pB, pC
      positions.push(pA[0], pA[1], pA[2]);
      positions.push(pB[0], pB[1], pB[2]);
      positions.push(pC[0], pC[1], pC[2]);

      uvs.push(uA_1, sA.t);
      uvs.push(uB_1, sA.t);
      uvs.push(uC_1, sB.t);

      // Triangle 2: pA, pC, pD
      positions.push(pA[0], pA[1], pA[2]);
      positions.push(pC[0], pC[1], pC[2]);
      positions.push(pD[0], pD[1], pD[2]);

      uvs.push(uA_1, sA.t);
      uvs.push(uC_1, sB.t);
      uvs.push(uD_1, sB.t);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Builds the planar face of the archival ivory mat board.
 */
function createMatBoardFaceGeometry(
  outerW: number,
  outerH: number,
  innerW: number,
  innerH: number,
): BufferGeometry {
  const hw = outerW / 2;
  const hh = outerH / 2;
  const hiw = innerW / 2;
  const hih = innerH / 2;

  const positions: number[] = [];
  const uvs: number[] = [];

  const outerCorners: [number, number][] = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];

  const innerCorners: [number, number][] = [
    [-hiw, -hih],
    [hiw, -hih],
    [hiw, hih],
    [-hiw, hih],
  ];

  for (let i = 0; i < 4; i++) {
    const next = (i + 1) % 4;

    const oA = outerCorners[i];
    const oB = outerCorners[next];
    const iB = innerCorners[next];
    const iA = innerCorners[i];

    positions.push(oA[0], oA[1], 0);
    positions.push(oB[0], oB[1], 0);
    positions.push(iB[0], iB[1], 0);

    uvs.push(oA[0] / outerW + 0.5, oA[1] / outerH + 0.5);
    uvs.push(oB[0] / outerW + 0.5, oB[1] / outerH + 0.5);
    uvs.push(iB[0] / outerW + 0.5, iB[1] / outerH + 0.5);

    positions.push(oA[0], oA[1], 0);
    positions.push(iB[0], iB[1], 0);
    positions.push(iA[0], iA[1], 0);

    uvs.push(oA[0] / outerW + 0.5, oA[1] / outerH + 0.5);
    uvs.push(iB[0] / outerW + 0.5, iB[1] / outerH + 0.5);
    uvs.push(iA[0] / outerW + 0.5, iA[1] / outerH + 0.5);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Builds the 45° beveled core edge of the mat aperture.
 */
function createMatBoardBevelGeometry(
  innerW: number,
  innerH: number,
  depth: number,
): BufferGeometry {
  const hiw = innerW / 2;
  const hih = innerH / 2;
  const bevelOffset = depth;

  const frontCorners: [number, number][] = [
    [-hiw, -hih],
    [hiw, -hih],
    [hiw, hih],
    [-hiw, hih],
  ];

  const backCorners: [number, number][] = [
    [-(hiw - bevelOffset), -(hih - bevelOffset)],
    [hiw - bevelOffset, -(hih - bevelOffset)],
    [hiw - bevelOffset, hih - bevelOffset],
    [-(hiw - bevelOffset), hih - bevelOffset],
  ];

  const positions: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i < 4; i++) {
    const next = (i + 1) % 4;

    const fA = frontCorners[i];
    const fB = frontCorners[next];
    const bB = backCorners[next];
    const bA = backCorners[i];

    positions.push(fA[0], fA[1], 0);
    positions.push(fB[0], fB[1], 0);
    positions.push(bB[0], bB[1], -depth);

    uvs.push(0, 0);
    uvs.push(1, 0);
    uvs.push(1, 1);

    positions.push(fA[0], fA[1], 0);
    positions.push(bB[0], bB[1], -depth);
    positions.push(bA[0], bA[1], -depth);

    uvs.push(0, 0);
    uvs.push(1, 1);
    uvs.push(0, 1);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  geometry.computeVertexNormals();

  return geometry;
}

function MatBoard({
  outerWidth,
  outerHeight,
  innerWidth,
  innerHeight,
  frontZ,
  backZ,
}: {
  outerWidth: number;
  outerHeight: number;
  innerWidth: number;
  innerHeight: number;
  frontZ: number;
  backZ: number;
}) {
  const depth = Math.max(0.01, frontZ - backZ);

  const faceGeometry = useMemo(
    () =>
      createMatBoardFaceGeometry(
        outerWidth,
        outerHeight,
        innerWidth,
        innerHeight,
      ),
    [outerWidth, outerHeight, innerWidth, innerHeight],
  );

  const bevelGeometry = useMemo(
    () => createMatBoardBevelGeometry(innerWidth, innerHeight, depth),
    [innerWidth, innerHeight, depth],
  );

  return (
    <group position={[0, 0, frontZ]}>
      {/* Front Textured Surface */}
      <mesh geometry={faceGeometry} receiveShadow>
        <meshStandardMaterial
          color={MAT_BOARD_CONFIG.color}
          roughness={MAT_BOARD_CONFIG.roughness}
          metalness={MAT_BOARD_CONFIG.metalness}
        />
      </mesh>

      {/* 45° White Bevel Core Edge */}
      <mesh geometry={bevelGeometry}>
        <meshStandardMaterial
          color={MAT_BOARD_CONFIG.coreColor}
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}

function FrameGlazing({
  width,
  height,
  glazingType,
  positionZ,
}: {
  width: number;
  height: number;
  glazingType: GlazingTypeId;
  positionZ: number;
}) {
  const props = FRAME_GLAZING_OPTIONS[glazingType];

  return (
    <mesh position={[0, 0, positionZ]}>
      <planeGeometry args={[width, height]} />
      <meshPhysicalMaterial
        transparent
        transmission={props.transmission}
        roughness={props.roughness}
        ior={props.ior}
        clearcoat={props.clearcoat}
        clearcoatRoughness={props.clearcoatRoughness}
        specularIntensity={props.specularIntensity}
        specularColor={props.specularColor}
        color={props.color}
        opacity={props.opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

function Artwork({
  url,
  width,
  height,
  photoZoom,
  photoPosition,
  onPhotoPositionChange,
  positionZ,
}: {
  url: string;
  width: number;
  height: number;
  photoZoom: number;
  photoPosition: { x: number; y: number };
  onPhotoPositionChange?: (position: { x: number; y: number }) => void;
  positionZ: number;
}) {
  const texture = useTexture(url);

  const { effectiveMeshWidth, effectiveMeshHeight, isMatted } = useMemo(() => {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.colorSpace = SRGBColorSpace;

    const img = texture.image as
      | { width?: number; height?: number }
      | undefined;

    if (!img?.width || !img?.height) {
      return { effectiveMeshWidth: width, effectiveMeshHeight: height, isMatted: false };
    }

    const imageAspect = img.width / img.height;
    const frameAspect = width / height;

    const aspectDiff =
      imageAspect > frameAspect
        ? imageAspect / frameAspect
        : frameAspect / imageAspect;

    // If orientation mismatch or substantial aspect difference (> 1.25) and zoom is at baseline (<= 1.05),
    // present with intentional museum-grade archival ivory matting so the photograph remains completely visible without severe cropping.
    const shouldMat = aspectDiff > 1.25 && photoZoom <= 1.05;

    let meshW = width;
    let meshH = height;
    let repeatX = 1;
    let repeatY = 1;

    if (shouldMat) {
      if (imageAspect > frameAspect) {
        // Landscape photo in portrait frame: fit aperture width, derive height
        meshW = width;
        meshH = width / imageAspect;
      } else {
        // Portrait photo in landscape frame: fit aperture height, derive width
        meshH = height;
        meshW = height * imageAspect;
      }
      repeatX = 1;
      repeatY = 1;
    } else {
      // Proportional aperture fill with customer zoom and pan
      if (imageAspect > frameAspect) {
        repeatX = frameAspect / imageAspect;
      } else {
        repeatY = imageAspect / frameAspect;
      }
      repeatX = Math.min(1, repeatX / photoZoom);
      repeatY = Math.min(1, repeatY / photoZoom);
    }

    texture.repeat.set(repeatX, repeatY);

    texture.offset.set(
      (1 - repeatX) * (photoPosition.x / 100),
      (1 - repeatY) * (1 - photoPosition.y / 100),
    );

    // eslint-disable-next-line react-hooks/immutability
    texture.needsUpdate = true;

    return {
      effectiveMeshWidth: meshW,
      effectiveMeshHeight: meshH,
      isMatted: shouldMat,
    };
  }, [texture, width, height, photoZoom, photoPosition]);

  const dragStart = useRef<Vector2 | null>(null);

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    dragStart.current = new Vector2(event.point.x, event.point.y);
  }

  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    if (!dragStart.current) return;
    event.stopPropagation();

    const deltaX = event.point.x - dragStart.current.x;
    const deltaY = event.point.y - dragStart.current.y;

    dragStart.current = new Vector2(event.point.x, event.point.y);

    if (onPhotoPositionChange) {
      onPhotoPositionChange({
        x: Math.max(0, Math.min(100, photoPosition.x - (deltaX / width) * 75)),
        y: Math.max(0, Math.min(100, photoPosition.y + (deltaY / height) * 75)),
      });
    }
  }

  function handlePointerUp(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    dragStart.current = null;
  }

  return (
    <group position={[0, 0, positionZ]}>
      {/* Intentional Archival Ivory Matting backing board if aspect ratio differs */}
      {isMatted && (
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial color="#FAF7F2" roughness={0.92} />
        </mesh>
      )}

      {/* High-fidelity Artwork Photograph */}
      <mesh
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
      >
        <planeGeometry args={[effectiveMeshWidth, effectiveMeshHeight]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}

function FrameBack({
  width,
  height,
  positionZ,
}: {
  width: number;
  height: number;
  positionZ: number;
}) {
  const hangingWireCurve = useMemo(() => {
    const w = width * 0.72;
    const h = height * 0.22;
    return new CatmullRomCurve3([
      new Vector3(-w / 2, 0, 0.008),
      new Vector3(0, h * 0.45, 0.015),
      new Vector3(w / 2, 0, 0.008),
    ]);
  }, [width, height]);

  const hangingWireGeometry = useMemo(
    () => new TubeGeometry(hangingWireCurve, 32, 0.004, 8, false),
    [hangingWireCurve],
  );

  useEffect(() => {
    return () => {
      hangingWireGeometry.dispose();
    };
  }, [hangingWireGeometry]);

  return (
    <group position={[0, 0, positionZ]}>
      {/* Kraft Paper / MDF Backing Board */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width, height, 0.02]} />
        <meshStandardMaterial
          color="#3A3026"
          roughness={0.88}
          metalness={0.0}
        />
      </mesh>

      {/* Hanging Wire and D-Rings */}
      <group position={[0, height * 0.22, -0.012]}>
        <mesh geometry={hangingWireGeometry}>
          <meshStandardMaterial
            color="#888888"
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>

        <mesh position={[-width * 0.36, 0, 0]}>
          <torusGeometry args={[0.022, 0.005, 8, 16]} />
          <meshStandardMaterial
            color="#D4AA70"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        <mesh position={[width * 0.36, 0, 0]}>
          <torusGeometry args={[0.022, 0.005, 8, 16]} />
          <meshStandardMaterial
            color="#D4AA70"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

function FrameModel({
  widthIn,
  heightIn,
  frameMaterial,
  frameDesign = "ornate_decorative",
  frameColor = "walnut_brown",
  glazingType = "clear_acrylic",
  artworkUrl,
  photoZoom,
  photoPosition,
  onPhotoPositionChange,
}: Frame3DPreviewProps) {
  const activeProfile =
    (frameDesign && FRAME_PROFILE_DESIGNS[frameDesign]) ||
    FRAME_PROFILE_DESIGNS.ornate_decorative;

  const activeColor = frameColor ? FRAME_COLORS[frameColor].hex : "#4E2D18";

  const frameWidth = widthIn * INCH_TO_SCENE;
  const frameHeight = heightIn * INCH_TO_SCENE;

  const borderWidth = Math.min(
    FRAME_BORDER,
    Math.min(frameWidth, frameHeight) * 0.32,
  );
  const outerWidth = frameWidth + borderWidth * 2;
  const outerHeight = frameHeight + borderWidth * 2;

  const frameGeometry = useMemo(
    () =>
      createSculptedFrameGeometry(
        outerWidth,
        outerHeight,
        borderWidth,
        activeProfile.slices,
      ),
    [outerWidth, outerHeight, borderWidth, activeProfile.slices],
  );

  // Clean disposal of replaced geometry
  useEffect(() => {
    return () => {
      frameGeometry.dispose();
    };
  }, [frameGeometry]);

  // Determine wood species for grain pattern
  const woodSpecies: WoodSpecies = useMemo(() => {
    if (frameColor === "natural_oak") return "oak";
    if (frameColor === "mahogany_brown") return "mahogany";
    return "walnut";
  }, [frameColor]);

  // Procedural material textures
  const woodTextures = useMemo(() => {
    if (frameMaterial === "wood") {
      return {
        map: getOrCreateWoodDiffuseTexture(woodSpecies),
        bumpMap: getOrCreateWoodBumpTexture(woodSpecies),
      };
    }
    return null;
  }, [frameMaterial, woodSpecies]);

  const aluminiumTextures = useMemo(() => {
    if (frameMaterial === "aluminium") {
      return {
        map: getOrCreateBrushedAluminiumDiffuseTexture(),
        bumpMap: getOrCreateBrushedAluminiumBumpTexture(),
      };
    }
    return null;
  }, [frameMaterial]);

  const mdfTextures = useMemo(() => {
    if (frameMaterial === "mdf") {
      return {
        map: getOrCreateMDFDiffuseTexture(),
        bumpMap: getOrCreateMDFBumpTexture(),
      };
    }
    return null;
  }, [frameMaterial]);

  // Specific depth calculations for shadow box vs regular profiles
  const isShadowBox = frameDesign === "shadow_box";
  const artZ = isShadowBox ? -0.06 : 0.012;
  const glazingZ = isShadowBox ? 0.065 : 0.026;
  const backZ = isShadowBox ? -0.2 : -0.13;

  // Dedicated physical material instance to guarantee immediate Three.js recompile and disposal
  const frameMaterialInstance = useMemo(() => {
    let roughness = 0.40;
    let metalness = 0.0;
    let clearcoat = 0.18;
    let clearcoatRoughness = 0.35;
    let reflectivity = 0.55;
    let envMapIntensity = 0.9;
    let bumpScale = 0.07;
    let map: Texture | null = null;
    let bumpMap: Texture | null = null;
    let finalColor = activeColor;

    if (frameMaterial === "aluminium") {
      // High-precision brushed metallic aluminium
      metalness = 0.98;
      roughness = 0.22;
      clearcoat = 0.32;
      clearcoatRoughness = 0.14;
      reflectivity = 0.98;
      envMapIntensity = 2.4;
      bumpScale = 0.035;
      map = aluminiumTextures?.map ?? null;
      bumpMap = aluminiumTextures?.bumpMap ?? null;

      // Anodized metallic tint tailored to each selected colour
      if (frameColor === "antique_gold") {
        finalColor = "#E0B742"; // Radiant warm anodized gold
      } else if (frameColor === "natural_oak") {
        finalColor = "#D5C8B4"; // Champagne anodized aluminium
      } else if (frameColor === "mahogany_brown") {
        finalColor = "#783025"; // Anodized bronze burgundy
      } else {
        finalColor = "#4A3B33"; // Anodized dark bronze walnut
      }
    } else if (frameMaterial === "wood") {
      // Natural organic timber with directional longitudinal grain
      metalness = 0.0;
      roughness = 0.40;
      clearcoat = 0.20;
      clearcoatRoughness = 0.35;
      reflectivity = 0.55;
      envMapIntensity = 0.9;
      bumpScale = 0.07;
      map = woodTextures?.map ?? null;
      bumpMap = woodTextures?.bumpMap ?? null;

      if (frameColor === "antique_gold") {
        // Traditional gilded leaf on hardwood: warm metallic gold luster
        finalColor = "#D4AF37";
        metalness = 0.76;
        roughness = 0.26;
        clearcoat = 0.32;
        reflectivity = 0.88;
        envMapIntensity = 1.8;
        bumpScale = 0.04;
      } else if (frameColor === "natural_oak") {
        finalColor = "#D4AA70";
      } else if (frameColor === "mahogany_brown") {
        finalColor = "#6A2216";
      } else {
        finalColor = "#4E2D18";
      }
    } else {
      // MDF: Smooth uniform engineered board, zero wood grain, zero metallic reflection
      metalness = 0.0;
      roughness = 0.88;
      clearcoat = 0.0;
      clearcoatRoughness = 0.5;
      reflectivity = 0.15;
      envMapIntensity = 0.25;
      bumpScale = 0.012;
      map = mdfTextures?.map ?? null;
      bumpMap = mdfTextures?.bumpMap ?? null;

      if (frameColor === "antique_gold") {
        finalColor = "#C5A059"; // Smooth architectural warm antique gold
      } else if (frameColor === "natural_oak") {
        finalColor = "#D4AA70";
      } else if (frameColor === "mahogany_brown") {
        finalColor = "#6A2216";
      } else {
        finalColor = "#4E2D18";
      }
    }

    const mat = new MeshPhysicalMaterial({
      color: new Color(finalColor),
      metalness,
      roughness,
      clearcoat,
      clearcoatRoughness,
      reflectivity,
      envMapIntensity,
      map,
      bumpMap,
      bumpScale,
    });
    mat.needsUpdate = true;
    return mat;
  }, [
    frameMaterial,
    frameColor,
    activeColor,
    woodTextures,
    aluminiumTextures,
    mdfTextures,
  ]);

  useEffect(() => {
    return () => {
      frameMaterialInstance.dispose();
    };
  }, [frameMaterialInstance]);

  // Artwork and glazing dimensions overlap frame rebate sight lip without any white mat border
  const sightOpeningWidth = frameWidth + 0.015;
  const sightOpeningHeight = frameHeight + 0.015;

  return (
    <group name="frame-product-group">
      {/* Artwork mounted cleanly directly into the frame rebate — zero white mat border */}
      {artworkUrl ? (
        <Artwork
          url={artworkUrl}
          width={sightOpeningWidth}
          height={sightOpeningHeight}
          photoZoom={photoZoom}
          photoPosition={photoPosition}
          onPhotoPositionChange={onPhotoPositionChange}
          positionZ={artZ}
        />
      ) : (
        <mesh position={[0, 0, artZ]}>
          <planeGeometry args={[sightOpeningWidth, sightOpeningHeight]} />
          <meshStandardMaterial color="#3A3026" roughness={0.9} />
        </mesh>
      )}

      {/* Optical Transparent Glazing with physical depth & transmission */}
      <FrameGlazing
        width={frameWidth + 0.008}
        height={frameHeight + 0.008}
        glazingType={glazingType}
        positionZ={glazingZ}
      />

      {/* Sculpted Multi-Level Picture Frame Moulding */}
      <mesh
        geometry={frameGeometry}
        material={frameMaterialInstance}
        castShadow
        receiveShadow
      />

      {/* Rear Backing Board and Mounting Hardware */}
      <FrameBack width={frameWidth} height={frameHeight} positionZ={backZ} />
    </group>
  );
}

/**
 * Photorealistic Midnight Luxury Studio Lighting & Environment.
 */
function StudioLightingEnvironment() {
  const lighting = STUDIO_LIGHTING;

  return (
    <>
      <ambientLight
        color={lighting.ambient.color}
        intensity={lighting.ambient.intensity}
      />

      <directionalLight
        position={lighting.keyLight.position}
        intensity={lighting.keyLight.intensity}
        color={lighting.keyLight.color}
        castShadow={lighting.keyLight.castShadow}
        shadow-bias={lighting.keyLight.shadowBias}
        shadow-mapSize-width={lighting.keyLight.shadowMapSize}
        shadow-mapSize-height={lighting.keyLight.shadowMapSize}
      />

      <directionalLight
        position={lighting.fillLight.position}
        intensity={lighting.fillLight.intensity}
        color={lighting.fillLight.color}
      />

      <directionalLight
        position={lighting.rimLight.position}
        intensity={lighting.rimLight.intensity}
        color={lighting.rimLight.color}
      />

      <spotLight
        position={lighting.spotlight.position}
        intensity={lighting.spotlight.intensity}
        color={lighting.spotlight.color}
        angle={lighting.spotlight.angle}
        penumbra={lighting.spotlight.penumbra}
        distance={lighting.spotlight.distance}
        decay={lighting.spotlight.decay}
      />

      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={1.8}
          color="#FFF9F0"
          scale={[10, 4, 1]}
          position={[0, 6, -1]}
          rotation={[-Math.PI / 4, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#F5F0E8"
          scale={[6, 8, 1]}
          position={[6, 2, 3]}
          rotation={[0, -Math.PI / 3, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#B89B70"
          scale={[4, 6, 1]}
          position={[-6, 1, 2]}
          rotation={[0, Math.PI / 3, 0]}
        />
      </Environment>
    </>
  );
}

function CameraFit({
  frameWidth,
  frameHeight,
}: {
  frameWidth: number;
  frameHeight: number;
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!camera || !size.width || !size.height) return;

    const perspectiveCamera = camera as PerspectiveCamera;
    const aspect = size.width / size.height;
    const verticalFov = (perspectiveCamera.fov * Math.PI) / 180;

    const verticalDistance = frameHeight / (2 * Math.tan(verticalFov / 2));
    const horizontalDistance =
      frameWidth / (2 * Math.tan(verticalFov / 2) * aspect);

    const distance =
      Math.max(verticalDistance, horizontalDistance) * 1.45 + 0.35;

    perspectiveCamera.position.set(0, 0, distance);
    perspectiveCamera.lookAt(0, 0, 0);
    // eslint-disable-next-line react-hooks/immutability
    perspectiveCamera.near = 0.01;
    perspectiveCamera.far = distance * 10;
    perspectiveCamera.updateProjectionMatrix();
  }, [camera, size.width, size.height, frameWidth, frameHeight]);

  return null;
}

/**
 * Dedicated Product Export Bridge.
 * Exposes a client-side function that renders exclusively the custom frame on a transparent
 * PNG canvas, without floor shadows, canvas border, or surrounding UI.
 */

function ProductExportBridge({
  onRegisterExport,
  widthIn,
  heightIn,
}: {
  onRegisterExport?: (
    exportFn: (options?: {
      triggerDownload?: boolean;
    }) => Promise<string | null>,
  ) => void;
  widthIn: number;
  heightIn: number;
}) {
  const { gl, scene } = useThree();

  useEffect(() => {
    if (!onRegisterExport) return;

    const exportFn = async (options?: {
      triggerDownload?: boolean;
    }): Promise<string | null> => {
      const frameWidth = widthIn * INCH_TO_SCENE;
      const frameHeight = heightIn * INCH_TO_SCENE;

      const borderWidth = Math.min(
        FRAME_BORDER,
        Math.min(frameWidth, frameHeight) * 0.32,
      );

      const outerWidth = frameWidth + borderWidth * 2;
      const outerHeight = frameHeight + borderWidth * 2;

      // Temporarily hide shadows and non-product helpers.
      const hidden: { obj: Object3D; wasVisible: boolean }[] = [];

      scene.traverse((obj) => {
        if (
          obj.name === "contact-shadows" ||
          obj.type === "OrbitControls" ||
          obj.name === "studio-floor"
        ) {
          hidden.push({
            obj,
            wasVisible: obj.visible,
          });

          obj.visible = false;
        }
      });

      // Create a straight-on camera for the product export with 5% safe margin.
      const fov = 34;
      const aspect = outerWidth / outerHeight;

      const exportCamera = new PerspectiveCamera(fov, aspect, 0.01, 100);

      const margin = 1.05; // 5% safe framing margin
      const vDist =
        (outerHeight * margin) / (2 * Math.tan((fov * Math.PI) / 360));

      const hDist =
        (outerWidth * margin) / (2 * Math.tan((fov * Math.PI) / 360) * aspect);

      const camDist = Math.max(vDist, hDist);

      exportCamera.position.set(0, 0, camDist);
      exportCamera.lookAt(0, 0, 0);
      exportCamera.updateProjectionMatrix();

      // High-resolution export: target 3200px longest dimension
      const maxDimension = 3200;
      let targetWidth = maxDimension;
      let targetHeight = maxDimension;
      if (aspect >= 1) {
        targetWidth = maxDimension;
        targetHeight = Math.max(100, Math.round(maxDimension / aspect));
      } else {
        targetHeight = maxDimension;
        targetWidth = Math.max(100, Math.round(maxDimension * aspect));
      }

      const renderTarget = new WebGLRenderTarget(targetWidth, targetHeight, {
        format: RGBAFormat,
        type: UnsignedByteType,
        colorSpace: SRGBColorSpace,
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        generateMipmaps: false,
        samples: 4, // 4x MSAA hardware antialiasing
      });

      const oldTarget = gl.getRenderTarget();
      const oldColor = gl.getClearColor(new Color());
      const oldAlpha = gl.getClearAlpha();

      try {
        gl.setRenderTarget(renderTarget);
        gl.setClearColor(0x000000, 0);
        gl.clear(true, true, true);
        gl.render(scene, exportCamera);

        const pixels = new Uint8Array(targetWidth * targetHeight * 4);

        gl.readRenderTargetPixels(
          renderTarget,
          0,
          0,
          targetWidth,
          targetHeight,
          pixels,
        );

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");

        if (!ctx) return null;

        const imgData = ctx.createImageData(targetWidth, targetHeight);

        // Flip vertically because WebGL pixels are bottom-to-top.
        for (let y = 0; y < targetHeight; y++) {
          const srcY = targetHeight - 1 - y;
          const srcIdx = srcY * targetWidth * 4;
          const dstIdx = y * targetWidth * 4;

          imgData.data.set(
            pixels.subarray(srcIdx, srcIdx + targetWidth * 4),
            dstIdx,
          );
        }

        ctx.putImageData(imgData, 0, 0);

        const pngUrl = canvas.toDataURL("image/png");

        if (options?.triggerDownload !== false) {
          const link = document.createElement("a");

          link.href = pngUrl;
          link.download = "studioframe-custom-frame.png";

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        return pngUrl;
      } finally {
        // Restore the original renderer state.
        gl.setRenderTarget(oldTarget);
        gl.setClearColor(oldColor, oldAlpha);

        renderTarget.dispose();

        // Restore visibility of all temporarily hidden objects.
        hidden.forEach(({ obj, wasVisible }) => {
          obj.visible = wasVisible;
        });
      }
    };

    onRegisterExport(exportFn);

    return () => {
      onRegisterExport(async () => null);
    };
  }, [gl, scene, widthIn, heightIn, onRegisterExport]);

  return null;
}

export default function Frame3DPreview(props: Frame3DPreviewProps) {
  const lighting = STUDIO_LIGHTING;

  const frameWidth = props.widthIn * INCH_TO_SCENE;
  const frameHeight = props.heightIn * INCH_TO_SCENE;

  const borderWidth = Math.min(
    FRAME_BORDER,
    Math.min(frameWidth, frameHeight) * 0.32,
  );
  const outerWidth = frameWidth + borderWidth * 2;
  const outerHeight = frameHeight + borderWidth * 2;

  const maxDimension = Math.max(outerWidth, outerHeight);
  const cameraDistance = Math.max(5.5, maxDimension * 2.2);
  const shadowPositionY = -(outerHeight / 2 + 0.2);

  return (
    <div className="fs-stage-outer">
      <div className="fs-stage-inner">
        <Canvas
          shadows
          gl={{
            preserveDrawingBuffer: true,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, 2]}
          camera={{
            position: [0, 0, 10],
            fov: CAMERA_FOV,
            near: 0.01,
            far: 100,
          }}
        >
          {/* Studio Lighting & Environment */}
          <StudioLightingEnvironment />

          <FrameModel {...props} />

          <CameraFit
            frameWidth={outerWidth + 0.12}
            frameHeight={outerHeight + 0.12}
          />

          <ContactShadows
            name="contact-shadows"
            position={[0, shadowPositionY, -0.3]}
            opacity={lighting.contactShadows.opacity}
            scale={Math.max(lighting.contactShadows.scale, maxDimension * 2.2)}
            blur={lighting.contactShadows.blur}
            far={lighting.contactShadows.far}
            color={lighting.contactShadows.color}
          />

          <OrbitControls
            enablePan={false}
            enableZoom
            enableRotate
            minDistance={cameraDistance * 0.55}
            maxDistance={cameraDistance * 2.5}
            minPolarAngle={0.5}
            maxPolarAngle={2.5}
            rotateSpeed={0.8}
          />

          <ProductExportBridge
            onRegisterExport={props.onRegisterExport}
            widthIn={props.widthIn}
            heightIn={props.heightIn}
          />
        </Canvas>

        <div className="fs-stage-badge" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span>3D Interactive Studio</span>
        </div>

        <div className="fs-stage-controls" aria-hidden="true">
          <span className="fs-stage-controls__item">
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Rotate frame
          </span>
          <span className="fs-stage-controls__divider">•</span>
          <span className="fs-stage-controls__item">
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="5 9 2 12 5 15" />
              <polyline points="9 5 12 2 15 5" />
              <polyline points="15 19 12 22 9 19" />
              <polyline points="19 9 22 12 19 15" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="12" y1="2" x2="12" y2="22" />
            </svg>
            Reposition photo
          </span>
          <span className="fs-stage-controls__divider">•</span>
          <span className="fs-stage-controls__item">
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            Zoom
          </span>
        </div>
      </div>
    </div>
  );
}
