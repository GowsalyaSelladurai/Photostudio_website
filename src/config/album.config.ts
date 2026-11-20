
import type { AlbumTemplate } from "@/types/album";

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

  defaultFinish: "linen" as const,

  coverFinishes: [
    {
      id: "linen",
      label: "Premium linen",
      description: "A refined textured fabric finish.",
    },
    {
      id: "leather",
      label: "Luxury leather",
      description: "A sophisticated leather-style finish.",
    },
    {
      id: "photo",
      label: "Printed photo cover",
      description: "Personalize your hardcover with a photograph.",
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
    preview: "/images/album-templates/classic-single.jpg",
  },
  {
    id: "double-story",
    name: "Two Together",
    description: "Two photographs arranged in a balanced composition.",
    category: "Minimal",
    layout: "two-photo",
    preview: "/images/album-templates/double-story.jpg",
  },
  {
    id: "family-grid",
    name: "Family Collection",
    description: "Four photographs arranged in a neat grid.",
    category: "Family",
    layout: "four-grid",
    preview: "/images/album-templates/family-grid.jpg",
  },
  {
    id: "full-memory",
    name: "Full Memory",
    description: "A full-page photograph with an immersive appearance.",
    category: "Editorial",
    layout: "full-bleed",
    preview: "/images/album-templates/full-memory.jpg",
  },
  {
    id: "creative-collage",
    name: "Creative Story",
    description: "A flexible collage for different photo combinations.",
    category: "Creative",
    layout: "collage",
    preview: "/images/album-templates/creative-collage.jpg",
  },
];