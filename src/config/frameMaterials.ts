import type { FrameColorId, FrameMaterialId } from "../types/frame";

/**
 * UI Option descriptor for frame material selector components.
 */
export interface FrameMaterialOption {
  id: FrameMaterialId;
  name: string;
  description: string;
}

/**
 * Distinct craft finish types representing surface treatments, sheen levels,
 * and protective clearcoats applied to frame profiles.
 */
export type FrameFinishType =
  | "natural_wood"
  | "satin_wood"
  | "matte"
  | "satin"
  | "gloss"
  | "brushed_aluminium"
  | "champagne_gold";

/**
 * Surface finish specification defining optical reflectance, clearcoat, and roughness.
 * Kept strictly decoupled from frame profile geometry and substrate material.
 */
export interface FrameSurfaceFinish {
  id: FrameFinishType;
  name: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  reflectivity: number;
  envMapIntensity: number;
  description: string;
}

/**
 * Reusable surface finish presets for luxury frame presentation.
 */
export const FRAME_FINISH_PRESETS: Record<
  FrameFinishType,
  FrameSurfaceFinish
> = {
  natural_wood: {
    id: "natural_wood",
    name: "Natural Wood",
    roughness: 0.58,
    metalness: 0.0,
    clearcoat: 0.06,
    clearcoatRoughness: 0.45,
    reflectivity: 0.35,
    envMapIntensity: 0.55,
    description: "Raw open-pore natural timber with low-sheen organic surface.",
  },
  satin_wood: {
    id: "satin_wood",
    name: "Satin Wood",
    roughness: 0.42,
    metalness: 0.0,
    clearcoat: 0.22,
    clearcoatRoughness: 0.32,
    reflectivity: 0.55,
    envMapIntensity: 0.85,
    description: "Hand-rubbed satin protective finish enhancing grain depth and soft luster.",
  },
  matte: {
    id: "matte",
    name: "Architectural Matte",
    roughness: 0.78,
    metalness: 0.02,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
    reflectivity: 0.25,
    envMapIntensity: 0.35,
    description: "Non-reflective flat architectural lacquer for contemporary gallery presentation.",
  },
  satin: {
    id: "satin",
    name: "Fine Satin",
    roughness: 0.54,
    metalness: 0.04,
    clearcoat: 0.1,
    clearcoatRoughness: 0.38,
    reflectivity: 0.45,
    envMapIntensity: 0.65,
    description: "Even-sheen satin finish with smooth tactile surface.",
  },
  gloss: {
    id: "gloss",
    name: "High Gloss Lacquer",
    roughness: 0.15,
    metalness: 0.05,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
    reflectivity: 0.85,
    envMapIntensity: 1.2,
    description: "Polished piano lacquer with mirror-grade clearcoat reflection.",
  },
  brushed_aluminium: {
    id: "brushed_aluminium",
    name: "Brushed Aluminium",
    roughness: 0.22,
    metalness: 0.9,
    clearcoat: 0.12,
    clearcoatRoughness: 0.15,
    reflectivity: 0.95,
    envMapIntensity: 1.5,
    description: "Precision directional brushed metal with specular anisotropic sheen.",
  },
  champagne_gold: {
    id: "champagne_gold",
    name: "Champagne Gold Leaf",
    roughness: 0.24,
    metalness: 0.86,
    clearcoat: 0.32,
    clearcoatRoughness: 0.2,
    reflectivity: 0.92,
    envMapIntensity: 1.4,
    description: "Exclusive warm metallic champagne gold leaf with rich multi-stage luster.",
  },
};

export const FRAME_FINISHES_LIST = Object.values(FRAME_FINISH_PRESETS);

/**
 * Photorealistic PBR (Physically-Based Rendering) Material Parameters for Three.js
 */
export interface FramePBRMaterialProperties {
  /** Base albedo diffuse color in hex */
  color: string;
  /** Surface roughness: 0 (mirror-smooth) to 1 (diffuse matte) */
  roughness: number;
  /** Metallic reflectance: 0 (dielectric) to 1 (pure metal) */
  metalness: number;
  /** Clearcoat protective lacquer layer intensity (0 to 1) */
  clearcoat?: number;
  /** Clearcoat surface roughness */
  clearcoatRoughness?: number;
  /** Micro-surface bump / grain scale */
  bumpScale?: number;
  /** Default finish preset designation */
  finishPreset?: FrameFinishType;
  /** Human-readable craft finish designation */
  finish: string;
  /** Detailed architectural description of the material */
  description: string;
}

/**
 * Standard selectable material catalogue for StudioFrame UI.
 */
export const FRAME_MATERIALS: FrameMaterialOption[] = [
  {
    id: "wood",
    name: "Solid Wood",
    description: "Natural wood texture and a classic appearance.",
  },
  {
    id: "aluminium",
    name: "Aluminium",
    description: "Lightweight with a clean metallic appearance.",
  },
  {
    id: "mdf",
    name: "MDF",
    description: "Smooth engineered wood with a refined finish.",
  },
];

export const DEFAULT_FRAME_MATERIAL: FrameMaterialId = "wood";

/**
 * Physically-Based Material configurations for Three.js 3D studio preview.
 * Configured specifically for photorealistic response under warm studio spotlights.
 */
export const FRAME_MATERIAL_3D_CONFIG: Record<
  FrameMaterialId,
  FramePBRMaterialProperties
> = {
  wood: {
    color: "#4E2D18",
    roughness: 0.44,
    metalness: 0.0,
    clearcoat: 0.16,
    clearcoatRoughness: 0.35,
    bumpScale: 0.05,
    finishPreset: "satin_wood",
    finish: "Satin Hand-Rubbed Varnish",
    description:
      "Solid hardwood timber with natural open-pore grain, organic warmth, and subtle protective satin sheen.",
  },
  aluminium: {
    color: "#D4AA70",
    roughness: 0.24,
    metalness: 0.92,
    clearcoat: 0.2,
    clearcoatRoughness: 0.15,
    bumpScale: 0.035,
    finishPreset: "brushed_aluminium",
    finish: "Anodized Brushed Metallic",
    description:
      "Precision-extruded architectural aluminium with directional brushed texture and high metallic specular response.",
  },
  mdf: {
    color: "#4E2D18",
    roughness: 0.72,
    metalness: 0.0,
    clearcoat: 0.0,
    bumpScale: 0.012,
    finishPreset: "matte",
    finish: "Architectural Smooth Matte",
    description:
      "High-density engineered substrate coated in a smooth, uniform matte architectural finish.",
  },
};

/**
 * Signature Champagne Gold luxury metallic finish definition.
 * Uses official brand value #B89B70.
 */
export const CHAMPAGNE_GOLD_MATERIAL: FramePBRMaterialProperties = {
  color: "#B89B70",
  roughness: 0.24,
  metalness: 0.86,
  clearcoat: 0.32,
  clearcoatRoughness: 0.2,
  bumpScale: 0.03,
  finishPreset: "champagne_gold",
  finish: "Champagne Gold Metallic Leaf",
  description:
    "Exclusive StudioFrame Champagne Gold leaf finish with radiant metallic reflection and subtle clearcoat depth.",
};

/* ----------------------------------------------------------------------------
 * Architectural Frame Colours & Swatches
 * ---------------------------------------------------------------------------- */

export interface FrameColorOption {
  id: FrameColorId;
  name: string;
  hex: string;
  tagline: string;
  description: string;
}

export const FRAME_COLORS: Record<FrameColorId, FrameColorOption> = {
  natural_oak: {
    id: "natural_oak",
    name: "Natural Oak",
    hex: "#D4AA70",
    tagline: "Light honey-coloured Scandinavian timber",
    description: "Light honey-coloured wood with organic medullary rays and open grain structure.",
  },
  walnut_brown: {
    id: "walnut_brown",
    name: "Heritage Walnut",
    hex: "#4E2D18",
    tagline: "Deep chocolate brown heartwood",
    description: "Luxurious deep chocolate brown heartwood with rich undulating growth rings.",
  },
  mahogany_brown: {
    id: "mahogany_brown",
    name: "Classic Mahogany",
    hex: "#6A2216",
    tagline: "Dark reddish-brown hardwood luster",
    description: "Deep dark reddish-brown fine timber with subtle auburn undertones.",
  },
  antique_gold: {
    id: "antique_gold",
    name: "Antique Gold",
    hex: "#C5A059",
    tagline: "Distinctly warm metallic gold",
    description: "Traditional gilded leaf with warm golden luster and rich vintage depth.",
  },
};

export const DEFAULT_FRAME_COLOR: FrameColorId = "walnut_brown";
export const DEFAULT_FRAME_FINISH: FrameFinishType = "satin";

export const FRAME_COLORS_LIST = Object.values(FRAME_COLORS);
