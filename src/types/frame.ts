export type FrameOrientation = "portrait" | "landscape";

export type FrameSizeId = "small" | "medium" | "large" | "custom";

export type FrameMaterialId =
  | "wood"
  | "aluminium"
  | "mdf";

export type FrameDesignId =
  | "modern_flat"
  | "classic_bevel"
  | "gallery_style"
  | "ornate_decorative"
  | "shadow_box"
  | "rounded_edge";

export type FrameColorId =
  | "natural_oak"
  | "walnut_brown"
  | "mahogany_brown"
  | "antique_gold";

export type GlazingTypeId =
  | "clear_glass"
  | "anti_reflective_glass"
  | "uv_protective_glass"
  | "museum_glass"
  | "clear_acrylic"
  | "anti_glare_acrylic";

export interface FrameSizeOption {
  id: FrameSizeId;
  label: string;
  /** Short side in inches (portrait width). Undefined for custom. */
  shortSideIn?: number;
  /** Long side in inches (portrait height). Undefined for custom. */
  longSideIn?: number;
}

export interface CustomDimensionsInput {
  /** Raw input values, kept as strings so partial typing is preserved. */
  width: string;
  height: string;
}

export interface ResolvedFrameDimensions {
  /** Final on-screen width in inches, after orientation is applied. */
  width: number;
  /** Final on-screen height in inches, after orientation is applied. */
  height: number;
  isValid: boolean;
  errorMessage?: string;
}

export interface FrameSelection {
  sizeId: FrameSizeId;
  orientation: FrameOrientation;
  dimensions: ResolvedFrameDimensions;
  frameMaterial: FrameMaterialId;
  frameDesign?: FrameDesignId;
  frameColor?: FrameColorId;
  glazingType?: GlazingTypeId;
  artworkName: string | null;
}

export interface ProfileSlice {
  /** Relative offset across moulding width from outer edge (0.0) to inner opening (1.0) */
  t: number;
  /** Height / depth offset along Z axis in scene units */
  z: number;
}

export interface FrameProfileDesign {
  id: FrameDesignId;
  name: string;
  tagline: string;
  description: string;
  borderWidthIn: number;
  depthIn: number;
  /** Front-most Z coordinate */
  frontZ: number;
  /** Mat board and artwork bed Z coordinate */
  artBedZ: number;
  /** Slices forming the parametric moulding contour from outer edge to inner sight lip */
  slices: ProfileSlice[];
}

export interface GlazingProperties {
  id: GlazingTypeId;
  name: string;
  tagline: string;
  description: string;
  material: "glass" | "acrylic";
  color: string;
  transmission: number;
  roughness: number;
  ior: number;
  clearcoat: number;
  clearcoatRoughness: number;
  specularIntensity: number;
  specularColor: string;
  opacity: number;
  thickness: number;
  uvProtection: string;
}