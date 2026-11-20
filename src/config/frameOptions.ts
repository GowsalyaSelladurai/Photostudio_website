import type {
  FrameDesignId,
  FrameProfileDesign,
  FrameSizeOption,
  GlazingProperties,
  GlazingTypeId,
  ProfileSlice,
} from "../types/frame";

export const FRAME_SIZES: FrameSizeOption[] = [
  { id: "small", label: "Small", shortSideIn: 8, longSideIn: 10 },
  { id: "medium", label: "Medium", shortSideIn: 12, longSideIn: 16 },
  { id: "large", label: "Large", shortSideIn: 16, longSideIn: 20 },
  { id: "custom", label: "Custom Size" },
];

export const DEFAULT_SIZE_ID = "small" as const;
export const DEFAULT_ORIENTATION = "portrait" as const;

export const CUSTOM_SIZE_LIMITS = { minIn: 4, maxIn: 40 } as const;

/** Dimensions used by the preview while a custom size is incomplete or invalid. */
export const FALLBACK_DIMENSIONS_IN = { short: 12, long: 16 } as const;

export const ARTWORK_UPLOAD = {
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  acceptAttribute: "image/jpeg,image/png,image/webp",
  maxSizeMb: 15,
} as const;

/* ----------------------------------------------------------------------------
 * Parametric Moulding Profiles
 * ---------------------------------------------------------------------------- */

const MODERN_FLAT_SLICES: ProfileSlice[] = [
  { t: 0.0, z: -0.1 },
  { t: 0.0, z: 0.045 },
  { t: 0.04, z: 0.05 },
  { t: 0.96, z: 0.05 },
  { t: 1.0, z: 0.045 },
  { t: 1.0, z: -0.01 },
  { t: 0.85, z: -0.01 },
  { t: 0.85, z: -0.1 },
  { t: 0.0, z: -0.1 },
];

const CLASSIC_BEVEL_SLICES: ProfileSlice[] = [
  { t: 0.0, z: -0.11 },
  { t: 0.0, z: 0.075 },
  { t: 0.08, z: 0.078 },
  { t: 0.25, z: 0.072 },
  { t: 0.88, z: 0.026 },
  { t: 1.0, z: 0.022 },
  { t: 1.0, z: -0.01 },
  { t: 0.85, z: -0.01 },
  { t: 0.85, z: -0.11 },
  { t: 0.0, z: -0.11 },
];

const GALLERY_STYLE_SLICES: ProfileSlice[] = [
  { t: 0.0, z: -0.13 },
  { t: 0.0, z: 0.065 },
  { t: 0.05, z: 0.07 },
  { t: 0.95, z: 0.07 },
  { t: 1.0, z: 0.065 },
  { t: 1.0, z: -0.01 },
  { t: 0.82, z: -0.01 },
  { t: 0.82, z: -0.13 },
  { t: 0.0, z: -0.13 },
];

const ORNATE_DECORATIVE_SLICES: ProfileSlice[] = [
  { t: 0.0, z: -0.11 },
  { t: 0.0, z: 0.05 },
  { t: 0.04, z: 0.072 },
  { t: 0.08, z: 0.082 },
  { t: 0.13, z: 0.08 },
  { t: 0.17, z: 0.076 },
  { t: 0.52, z: 0.062 },
  { t: 0.58, z: 0.085 },
  { t: 0.65, z: 0.083 },
  { t: 0.7, z: 0.058 },
  { t: 0.92, z: 0.032 },
  { t: 1.0, z: 0.028 },
  { t: 1.0, z: -0.01 },
  { t: 0.82, z: -0.01 },
  { t: 0.82, z: -0.11 },
  { t: 0.0, z: -0.11 },
];

const SHADOW_BOX_SLICES: ProfileSlice[] = [
  { t: 0.0, z: -0.18 },
  { t: 0.0, z: 0.085 },
  { t: 0.06, z: 0.088 },
  { t: 0.22, z: 0.088 },
  { t: 0.28, z: 0.082 },
  { t: 0.35, z: -0.08 },
  { t: 1.0, z: -0.085 },
  { t: 1.0, z: -0.11 },
  { t: 0.8, z: -0.11 },
  { t: 0.8, z: -0.18 },
  { t: 0.0, z: -0.18 },
];

const ROUNDED_EDGE_SLICES: ProfileSlice[] = [
  { t: 0.0, z: -0.1 },
  { t: 0.0, z: 0.02 },
  { t: 0.04, z: 0.048 },
  { t: 0.1, z: 0.068 },
  { t: 0.2, z: 0.075 },
  { t: 0.45, z: 0.072 },
  { t: 0.75, z: 0.055 },
  { t: 0.92, z: 0.035 },
  { t: 1.0, z: 0.025 },
  { t: 1.0, z: -0.01 },
  { t: 0.84, z: -0.01 },
  { t: 0.84, z: -0.1 },
  { t: 0.0, z: -0.1 },
];

export const FRAME_PROFILE_DESIGNS: Record<FrameDesignId, FrameProfileDesign> = {
  modern_flat: {
    id: "modern_flat",
    name: "Modern Flat",
    tagline: "Clean, architectural minimalism",
    description: "Crisp rectangular moulding with sharp modern contours and flat face.",
    borderWidthIn: 1.5,
    depthIn: 1.2,
    frontZ: 0.05,
    artBedZ: -0.01,
    slices: MODERN_FLAT_SLICES,
  },
  classic_bevel: {
    id: "classic_bevel",
    name: "Classic Bevel",
    tagline: "Inward sloping traditional chamfer",
    description: "Elegant inward bevel that draws the gaze smoothly toward the artwork.",
    borderWidthIn: 1.8,
    depthIn: 1.4,
    frontZ: 0.078,
    artBedZ: -0.01,
    slices: CLASSIC_BEVEL_SLICES,
  },
  gallery_style: {
    id: "gallery_style",
    name: "Gallery Box",
    tagline: "Slim front profile with dramatic exhibition depth",
    description: "Contemporary museum gallery frame with a narrow face and deep stance.",
    borderWidthIn: 1.2,
    depthIn: 1.6,
    frontZ: 0.07,
    artBedZ: -0.01,
    slices: GALLERY_STYLE_SLICES,
  },
  ornate_decorative: {
    id: "ornate_decorative",
    name: "Ornate Sculpted",
    tagline: "Multi-tiered heritage moulding",
    description: "Classical craftsmanship featuring stepped beads, cove details, and inner reveal.",
    borderWidthIn: 2.2,
    depthIn: 1.5,
    frontZ: 0.085,
    artBedZ: -0.01,
    slices: ORNATE_DECORATIVE_SLICES,
  },
  shadow_box: {
    id: "shadow_box",
    name: "Deep Shadow Box",
    tagline: "Substantial 3D depth and dimensional recess",
    description: "Dramatic deep-set moulding where art rests recessed inside an architectural chamber.",
    borderWidthIn: 2.4,
    depthIn: 2.5,
    frontZ: 0.088,
    artBedZ: -0.085,
    slices: SHADOW_BOX_SLICES,
  },
  rounded_edge: {
    id: "rounded_edge",
    name: "Soft Bullnose",
    tagline: "Curved organic perimeter contour",
    description: "Smooth, tactile rounded outer profile that softens light across the perimeter.",
    borderWidthIn: 1.75,
    depthIn: 1.3,
    frontZ: 0.075,
    artBedZ: -0.01,
    slices: ROUNDED_EDGE_SLICES,
  },
};

export const DEFAULT_FRAME_DESIGN: FrameDesignId = "ornate_decorative";
export const FRAME_DESIGNS_LIST = Object.values(FRAME_PROFILE_DESIGNS);

/* ----------------------------------------------------------------------------
 * Optical Glazing Specifications & Options
 * ---------------------------------------------------------------------------- */

export const FRAME_GLAZING_OPTIONS: Record<GlazingTypeId, GlazingProperties> = {
  clear_glass: {
    id: "clear_glass",
    name: "Standard Clear Glass",
    tagline: "Crisp traditional optical clarity",
    description: "Premium float glass delivering genuine mineral reflection and clean high transmission.",
    material: "glass",
    color: "#FFFFFF",
    transmission: 0.92,
    roughness: 0.02,
    ior: 1.52,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    specularIntensity: 0.88,
    specularColor: "#FFFFFF",
    opacity: 0.28,
    thickness: 0.025,
    uvProtection: "45%",
  },
  anti_reflective_glass: {
    id: "anti_reflective_glass",
    name: "Anti-Reflective Glass",
    tagline: "Ultra-low reflection with magnetron AR coating",
    description: "Optically coated glass eliminating harsh reflections down to less than 1% for true visual immersion.",
    material: "glass",
    color: "#FAFBFC",
    transmission: 0.96,
    roughness: 0.015,
    ior: 1.51,
    clearcoat: 0.45,
    clearcoatRoughness: 0.015,
    specularIntensity: 0.25,
    specularColor: "#EBF3FF",
    opacity: 0.12,
    thickness: 0.025,
    uvProtection: "78%",
  },
  uv_protective_glass: {
    id: "uv_protective_glass",
    name: "Conservation UV Glass",
    tagline: "99% UV radiation filtration",
    description: "Conservation-grade glass with subtle protective UV blocker preventing artwork fade.",
    material: "glass",
    color: "#FFFDF5",
    transmission: 0.91,
    roughness: 0.022,
    ior: 1.52,
    clearcoat: 0.9,
    clearcoatRoughness: 0.025,
    specularIntensity: 0.78,
    specularColor: "#FFFDF2",
    opacity: 0.26,
    thickness: 0.025,
    uvProtection: "99%",
  },
  museum_glass: {
    id: "museum_glass",
    name: "Museum Glass®",
    tagline: "The gold standard of fine art conservation",
    description: "Virtually invisible museum glazing combining 99% UV filtration with anti-reflective clarity.",
    material: "glass",
    color: "#FFFFFF",
    transmission: 0.98,
    roughness: 0.008,
    ior: 1.515,
    clearcoat: 0.35,
    clearcoatRoughness: 0.01,
    specularIntensity: 0.18,
    specularColor: "#F4F7FF",
    opacity: 0.08,
    thickness: 0.028,
    uvProtection: "99%",
  },
  clear_acrylic: {
    id: "clear_acrylic",
    name: "Optix® Clear Acrylic",
    tagline: "Lightweight, shatter-resistant acrylic",
    description: "Museum-grade clear polymethyl methacrylate offering crystal transparency and impact durability.",
    material: "acrylic",
    color: "#FFFFFF",
    transmission: 0.94,
    roughness: 0.035,
    ior: 1.491,
    clearcoat: 0.95,
    clearcoatRoughness: 0.03,
    specularIntensity: 0.82,
    specularColor: "#FFFFFF",
    opacity: 0.24,
    thickness: 0.024,
    uvProtection: "60%",
  },
  anti_glare_acrylic: {
    id: "anti_glare_acrylic",
    name: "Anti-Glare Frosted Acrylic",
    tagline: "Micro-etched glare diffusing surface",
    description: "Finely etched non-glare acrylic diffusing direct glare and bright light in high-illumination rooms.",
    material: "acrylic",
    color: "#FAF8F5",
    transmission: 0.88,
    roughness: 0.18,
    ior: 1.485,
    clearcoat: 0.15,
    clearcoatRoughness: 0.2,
    specularIntensity: 0.3,
    specularColor: "#F8F6F0",
    opacity: 0.35,
    thickness: 0.024,
    uvProtection: "70%",
  },
};

export const DEFAULT_GLAZING_TYPE: GlazingTypeId = "clear_acrylic";
export const FRAME_GLAZING_LIST = Object.values(FRAME_GLAZING_OPTIONS);
