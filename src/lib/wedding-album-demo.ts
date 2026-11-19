/**
 * StudioFrame – Photorealistic Luxury 3D Wedding Photo Album Demo
 *
 * Pre-populates a luxury wedding photo album ("Avery & Jordan — Wedding")
 * with real studio wedding photography, gold foil titling, and romantic captions.
 * Uses only verified local high-resolution project photography assets.
 */

import type { AlbumPage, AlbumProject } from "@/types/album";

export const WEDDING_DEMO_PHOTOS = [
  {
    id: "w-photo-1",
    fileName: "wedding-celebration-editorial.png",
    url: "/images/booking-editorial.png",
    width: 1400,
    height: 933,
    fileSize: 450000,
    uploadedAt: Date.now() - 1000000,
  },
  {
    id: "w-photo-2",
    fileName: "bridal-ceremony-editorial.png",
    url: "/images/enquiry-editorial.png",
    width: 1200,
    height: 1600,
    fileSize: 520000,
    uploadedAt: Date.now() - 900000,
  },
  {
    id: "w-photo-3",
    fileName: "intimate-studio-portrait.jpeg",
    url: "/images/default-frame-photo.jpeg",
    width: 900,
    height: 1200,
    fileSize: 390000,
    uploadedAt: Date.now() - 800000,
  },
  {
    id: "w-photo-4",
    fileName: "golden-hour-landscape.jpg",
    url: "/images/album-hero.jpg",
    width: 1600,
    height: 1067,
    fileSize: 480000,
    uploadedAt: Date.now() - 700000,
  },
];

export function getWeddingAlbumDemoProject(projectId = "wedding"): AlbumProject {
  const pages: AlbumPage[] = [
    // ------------------------------------------------------------------------
    // Spread 1: Title & Hero Wedding Portrait
    // ------------------------------------------------------------------------
    {
      id: "w-page-1",
      layout: "single",
      photos: [
        {
          id: "p-1",
          photoId: "w-photo-4",
          transform: { x: 50, y: 44, scale: 0.9, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-1",
          text: "A & J",
          x: 50,
          y: 84,
          fontSize: 22,
          rotation: 0,
          fontFamily: "serif",
          fontWeight: "normal",
          color: "#B99B70",
          textAlign: "center",
        },
        {
          id: "t-2",
          text: "The Celebration of Love · October 2026",
          x: 50,
          y: 91,
          fontSize: 11,
          rotation: 0,
          fontFamily: "sans",
          fontWeight: "normal",
          color: "#7D7063",
          textAlign: "center",
        },
      ],
      background: "#FAF7F2",
      frameStyle: "thin",
      photoSpacing: "balanced",
      cornerRadius: "subtle",
      photoShadow: "soft",
    },
    {
      id: "w-page-2",
      layout: "single",
      photos: [
        {
          id: "p-2",
          photoId: "w-photo-1",
          transform: { x: 50, y: 48, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-3",
          text: "Avery & Jordan · Our Wedding Day",
          x: 50,
          y: 91,
          fontSize: 13,
          rotation: 0,
          fontFamily: "serif",
          fontWeight: "normal",
          color: "#4A4238",
          textAlign: "center",
        },
      ],
      background: "#FFFFFF",
      frameStyle: "elegant",
      photoSpacing: "balanced",
      cornerRadius: "subtle",
      photoShadow: "soft",
    },

    // ------------------------------------------------------------------------
    // Spread 2: Vows, Ceremony & Intimate Portraits
    // ------------------------------------------------------------------------
    {
      id: "w-page-3",
      layout: "single",
      photos: [
        {
          id: "p-3",
          photoId: "w-photo-2",
          transform: { x: 50, y: 48, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-4",
          text: "Surrounded by family, friends, and autumn light",
          x: 50,
          y: 91,
          fontSize: 12,
          rotation: 0,
          fontFamily: "sans",
          fontWeight: "normal",
          color: "#6B6053",
          textAlign: "center",
        },
      ],
      background: "#FFFFFF",
      frameStyle: "thin",
      photoSpacing: "balanced",
      cornerRadius: "subtle",
      photoShadow: "soft",
    },
    {
      id: "w-page-4",
      layout: "single",
      photos: [
        {
          id: "p-4",
          photoId: "w-photo-3",
          transform: { x: 50, y: 48, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-5",
          text: "“I choose you today, and every day that follows.”",
          x: 50,
          y: 91,
          fontSize: 12,
          rotation: 0,
          fontFamily: "serif",
          fontWeight: "normal",
          italic: true,
          color: "#4A4238",
          textAlign: "center",
        },
      ],
      background: "#FAF7F2",
      frameStyle: "elegant",
      photoSpacing: "balanced",
      cornerRadius: "rounded",
      photoShadow: "soft",
    },

    // ------------------------------------------------------------------------
    // Spread 3: Golden Hour Editorial & Walking Home
    // ------------------------------------------------------------------------
    {
      id: "w-page-5",
      layout: "full-bleed",
      photos: [
        {
          id: "p-5",
          photoId: "w-photo-4",
          transform: { x: 50, y: 50, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-5b",
          text: "Golden Light Over The Meadows",
          x: 50,
          y: 93,
          fontSize: 12,
          rotation: 0,
          fontFamily: "serif",
          fontWeight: "normal",
          color: "#FFFFFF",
          textAlign: "center",
        },
      ],
      background: "#FFFFFF",
      frameStyle: "none",
      photoSpacing: "compact",
      cornerRadius: "square",
      photoShadow: "none",
    },
    {
      id: "w-page-6",
      layout: "single",
      photos: [
        {
          id: "p-6",
          photoId: "w-photo-1",
          transform: { x: 50, y: 48, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-6",
          text: "Where the light lands on the long way home",
          x: 50,
          y: 91,
          fontSize: 12,
          rotation: 0,
          fontFamily: "serif",
          fontWeight: "normal",
          color: "#4A4238",
          textAlign: "center",
        },
      ],
      background: "#FFFFFF",
      frameStyle: "elegant",
      photoSpacing: "balanced",
      cornerRadius: "subtle",
      photoShadow: "soft",
    },

    // ------------------------------------------------------------------------
    // Spread 4: The Reception, Vows & Warm Togetherness
    // ------------------------------------------------------------------------
    {
      id: "w-page-7",
      layout: "single",
      photos: [
        {
          id: "p-7",
          photoId: "w-photo-2",
          transform: { x: 50, y: 48, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-7",
          text: "Joy in every glance, warmth in every word",
          x: 50,
          y: 91,
          fontSize: 12,
          rotation: 0,
          fontFamily: "serif",
          fontWeight: "normal",
          color: "#4A4238",
          textAlign: "center",
        },
      ],
      background: "#FAF7F2",
      frameStyle: "thin",
      photoSpacing: "balanced",
      cornerRadius: "subtle",
      photoShadow: "soft",
    },
    {
      id: "w-page-8",
      layout: "single",
      photos: [
        {
          id: "p-8",
          photoId: "w-photo-3",
          transform: { x: 50, y: 48, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-8",
          text: "Together under the evening arbor",
          x: 50,
          y: 91,
          fontSize: 12,
          rotation: 0,
          fontFamily: "sans",
          fontWeight: "normal",
          color: "#6B6053",
          textAlign: "center",
        },
      ],
      background: "#FFFFFF",
      frameStyle: "elegant",
      photoSpacing: "balanced",
      cornerRadius: "subtle",
      photoShadow: "soft",
    },

    // ------------------------------------------------------------------------
    // Spread 5: Closing Reflection & Heirloom Colophon
    // ------------------------------------------------------------------------
    {
      id: "w-page-9",
      layout: "single",
      photos: [
        {
          id: "p-9",
          photoId: "w-photo-1",
          transform: { x: 50, y: 48, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-9",
          text: "The beginning of forever",
          x: 50,
          y: 91,
          fontSize: 13,
          rotation: 0,
          fontFamily: "serif",
          fontWeight: "normal",
          color: "#4A4238",
          textAlign: "center",
        },
      ],
      background: "#FFFFFF",
      frameStyle: "polaroid",
      photoSpacing: "balanced",
      cornerRadius: "subtle",
      photoShadow: "soft",
    },
    {
      id: "w-page-10",
      layout: "single",
      photos: [
        {
          id: "p-10",
          photoId: "w-photo-4",
          transform: { x: 50, y: 42, scale: 0.88, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-10",
          text: "To Love & Be Loved",
          x: 50,
          y: 84,
          fontSize: 20,
          rotation: 0,
          fontFamily: "serif",
          fontWeight: "normal",
          color: "#B99B70",
          textAlign: "center",
        },
        {
          id: "t-11",
          text: "Avery & Jordan · Handcrafted Heirloom Edition",
          x: 50,
          y: 91,
          fontSize: 11,
          rotation: 0,
          fontFamily: "sans",
          fontWeight: "normal",
          color: "#7D7063",
          textAlign: "center",
        },
      ],
      background: "#FAF7F2",
      frameStyle: "elegant",
      photoSpacing: "balanced",
      cornerRadius: "subtle",
      photoShadow: "soft",
    },
  ];

  return {
    id: projectId || "wedding",
    name: "Avery & Jordan — Wedding",
    sizeId: "classic",
    pageCount: pages.length,
    orientation: "portrait",
    coverFinish: "leather",
    coverPhotoId: null,
    photos: WEDDING_DEMO_PHOTOS,
    pages,
    currentPageIndex: 0,
    createdAt: Date.now() - 5000000,
    updatedAt: Date.now(),
  };
}
