import type { AlbumCoverFinish, AlbumOrientation, AlbumTemplate } from "@/types/album";

export interface AlbumSizeOption {
  id: string;
  label: string;
  width: number;
  height: number;
  amount: number;
  orientation: AlbumOrientation;
  tagline: string;
  description: string;
}

export const albumSizes: AlbumSizeOption[] = [
  {
    id: "4x4",
    label: "4 × 4 inches",
    width: 4,
    height: 4,
    amount: 250,
    orientation: "square",
    tagline: "Square Keepsake",
    description: "Compact 1:1 square album, perfect for intimate memories and gift editions.",
  },
  {
    id: "10x4",
    label: "10 × 4 inches",
    width: 10,
    height: 4,
    amount: 350,
    orientation: "landscape",
    tagline: "Wide Landscape",
    description: "Cinematic 2.5:1 panoramic spread, ideal for majestic outdoor and ceremony landscapes.",
  },
  {
    id: "classic",
    label: "8 × 12 inches",
    width: 8,
    height: 12,
    amount: 300,
    orientation: "portrait",
    tagline: "Classic Portrait",
    description: "Timeless editorial portrait format, ideal for bridal portraits and ceremony storytelling.",
  },
  {
    id: "premium",
    label: "10 × 12 inches",
    width: 10,
    height: 12,
    amount: 400,
    orientation: "portrait",
    tagline: "Studio Portrait",
    description: "Substantial editorial volume with balanced white space and generous photo sizing.",
  },
  {
    id: "12x8",
    label: "12 × 8 inches",
    width: 12,
    height: 8,
    amount: 420,
    orientation: "landscape",
    tagline: "Heirloom Landscape",
    description: "Expansive 3:2 landscape format, perfect for double-page spreads and photo collages.",
  },
  {
    id: "grand",
    label: "12 × 18 inches",
    width: 12,
    height: 18,
    amount: 500,
    orientation: "portrait",
    tagline: "Grand Collector",
    description: "Luxury gallery collector album with museum-grade presentation.",
  },
];

export function getAlbumSizeOption(sizeId: string): AlbumSizeOption {
  return (
    albumSizes.find((s) => s.id === sizeId) ??
    albumSizes.find((s) => s.id === "classic") ??
    albumSizes[0]
  );
}

export const albumConfig = {
  currency: "INR",
  locale: "en-IN",

  minPhotos: 1,
  maxPhotos: 200,
  maxFileSizeMB: 25,

  allowedFormats: [
    "image/jpeg",
    "image/png",
    "image/webp",
  ],

  pageCountOptions: [20, 30, 40],

  minimumImageDpi: 150,
  recommendedImageDpi: 300,

  defaultFinish: "linen" as AlbumCoverFinish,

  sizes: albumSizes,

  coverFinishes: [
    {
      id: "linen" as AlbumCoverFinish,
      label: "Premium linen",
      description: "A refined textured fabric finish with tactile elegance.",
    },
    {
      id: "leather" as AlbumCoverFinish,
      label: "Luxury leather",
      description: "A handcrafted leather-style finish with subtle sheen.",
    },
    {
      id: "photo" as AlbumCoverFinish,
      label: "Printed photo cover",
      description: "Personalise your hardcover with a full-bleed wrapped photograph.",
    },
  ],
} as const;

export const albumTemplates: AlbumTemplate[] = [
  {
    id: "classic-single",
    name: "Classic Moments",
    description: "One large photograph with a clean editorial layout.",
    category: "Minimal",
    layout: "single",
    preview: "/images/booking-editorial.png",
  },
  {
    id: "double-story",
    name: "Two Together",
    description: "Two photographs arranged in a balanced composition.",
    category: "Minimal",
    layout: "two-photo",
    preview: "/images/enquiry-editorial.png",
  },
  {
    id: "three-story",
    name: "Triptych Story",
    description: "One vertical hero photograph with two stacked accents.",
    category: "Editorial",
    layout: "three-photo",
    preview: "/mrge_pic/img3.jpg",
  },
  {
    id: "family-grid",
    name: "Family Collection",
    description: "Four photographs arranged in a neat grid.",
    category: "Family",
    layout: "four-grid",
    preview: "/mrge_pic/img4.jpg",
  },
  {
    id: "full-memory",
    name: "Full Memory",
    description: "A full-bleed photograph with an immersive appearance.",
    category: "Editorial",
    layout: "full-bleed",
    preview: "/mrge_pic/img1.jpg",
  },
  {
    id: "creative-collage",
    name: "Creative Story",
    description: "A flexible collage for rich multi-photo combinations.",
    category: "Creative",
    layout: "collage",
    preview: "/mrge_pic/img5.jpg",
  },
];
