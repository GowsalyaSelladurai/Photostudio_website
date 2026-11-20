import type {
  AlbumLayoutOption,
} from "@/types/album";

export const albumLayouts: AlbumLayoutOption[] = [
  {
    id: "single",
    name: "Single Photo",
    description: "One photograph with a clean, elegant presentation.",
    photoLimit: 1,
  },
  {
    id: "two-photo",
    name: "Two Photos",
    description: "Two photographs arranged side by side.",
    photoLimit: 2,
  },
  {
    id: "three-photo",
    name: "Three Photos",
    description: "Three photographs in a balanced composition.",
    photoLimit: 3,
  },
  {
    id: "four-grid",
    name: "Four Grid",
    description: "Four photographs arranged in a symmetrical grid.",
    photoLimit: 4,
  },
  {
    id: "collage",
    name: "Collage",
    description: "A flexible arrangement for multiple photographs.",
    photoLimit: 6,
  },
  {
    id: "full-bleed",
    name: "Full Bleed",
    description: "One photograph covering the entire page.",
    photoLimit: 1,
  },
];