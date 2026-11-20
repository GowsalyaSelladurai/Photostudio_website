/**
 * StudioFrame – Photorealistic Luxury 3D Wedding Photo Album Demo
 *
 * Pre-populates a luxury wedding photo album ("Avery & Jordan — Wedding")
 * with real high-resolution studio wedding photography, gold foil titling,
 * romantic typography, and diverse page layouts.
 * Uses only verified local high-resolution project photography assets.
 */

import type { AlbumPage, AlbumPhoto, AlbumProject } from "@/types/album";
import { computePageLayoutSlots } from "./album-page-canvas";
import { calculateSmartCrop } from "./ai/smart-crop-engine";

export const WEDDING_DEMO_PHOTOS: AlbumPhoto[] = [
  {
    id: "w-photo-1",
    fileName: "wedding-celebration-ceremony.jpg",
    url: "/mrge_pic/img1.jpg",
    width: 1600,
    height: 1067,
    fileSize: 1219194,
    uploadedAt: Date.now() - 1000000,
    smartFit: {
      analyzedAt: Date.now() - 1000000,
      aspectRatio: 1600 / 1067,
      faceCount: 2,
      personCount: 2,
      primaryAnchor: { x: 0.5, y: 0.35 },
      subjects: [
        { x: 0.38, y: 0.28, width: 0.12, height: 0.16, confidence: 0.94, type: "face", label: "Face" },
        { x: 0.54, y: 0.29, width: 0.11, height: 0.15, confidence: 0.92, type: "face", label: "Face" },
        { x: 0.30, y: 0.25, width: 0.42, height: 0.70, confidence: 0.88, type: "person", label: "Couple" },
      ],
    },
  },
  {
    id: "w-photo-2",
    fileName: "bridal-ceremony-editorial.png",
    url: "/images/booking-editorial.png",
    width: 1200,
    height: 1600,
    fileSize: 2176930,
    uploadedAt: Date.now() - 900000,
    smartFit: {
      analyzedAt: Date.now() - 900000,
      aspectRatio: 1200 / 1600,
      faceCount: 1,
      personCount: 1,
      primaryAnchor: { x: 0.5, y: 0.28 },
      subjects: [
        { x: 0.42, y: 0.20, width: 0.16, height: 0.18, confidence: 0.97, type: "face", label: "Bride" },
        { x: 0.32, y: 0.18, width: 0.38, height: 0.78, confidence: 0.92, type: "person", label: "Bride" },
      ],
    },
  },
  {
    id: "w-photo-3",
    fileName: "sacred-vows-rituals.jpg",
    url: "/mrge_pic/img2.jpg",
    width: 1600,
    height: 1067,
    fileSize: 1718895,
    uploadedAt: Date.now() - 800000,
    smartFit: {
      analyzedAt: Date.now() - 800000,
      aspectRatio: 1600 / 1067,
      faceCount: 2,
      personCount: 2,
      primaryAnchor: { x: 0.48, y: 0.36 },
      subjects: [
        { x: 0.36, y: 0.30, width: 0.11, height: 0.15, confidence: 0.93, type: "face", label: "Face" },
        { x: 0.52, y: 0.31, width: 0.12, height: 0.15, confidence: 0.91, type: "face", label: "Face" },
      ],
    },
  },
  {
    id: "w-photo-4",
    fileName: "golden-hour-editorial.jpg",
    url: "/mrge_pic/img3.jpg",
    width: 1600,
    height: 1067,
    fileSize: 2308817,
    uploadedAt: Date.now() - 700000,
    smartFit: {
      analyzedAt: Date.now() - 700000,
      aspectRatio: 1600 / 1067,
      faceCount: 2,
      personCount: 2,
      primaryAnchor: { x: 0.52, y: 0.32 },
      subjects: [
        { x: 0.44, y: 0.24, width: 0.10, height: 0.14, confidence: 0.95, type: "face", label: "Face" },
        { x: 0.56, y: 0.26, width: 0.10, height: 0.14, confidence: 0.90, type: "face", label: "Face" },
      ],
    },
  },
  {
    id: "w-photo-5",
    fileName: "garlands-and-smiles.jpg",
    url: "/mrge_pic/img4.jpg",
    width: 1600,
    height: 1067,
    fileSize: 1382824,
    uploadedAt: Date.now() - 600000,
    smartFit: {
      analyzedAt: Date.now() - 600000,
      aspectRatio: 1600 / 1067,
      faceCount: 2,
      personCount: 2,
      primaryAnchor: { x: 0.50, y: 0.34 },
      subjects: [
        { x: 0.40, y: 0.28, width: 0.11, height: 0.15, confidence: 0.94, type: "face", label: "Face" },
        { x: 0.55, y: 0.29, width: 0.11, height: 0.15, confidence: 0.93, type: "face", label: "Face" },
      ],
    },
  },
  {
    id: "w-photo-6",
    fileName: "intimate-candid-portrait.jpg",
    url: "/mrge_pic/img5.jpg",
    width: 1600,
    height: 1067,
    fileSize: 1584082,
    uploadedAt: Date.now() - 500000,
    smartFit: {
      analyzedAt: Date.now() - 500000,
      aspectRatio: 1600 / 1067,
      faceCount: 1,
      personCount: 1,
      primaryAnchor: { x: 0.50, y: 0.30 },
      subjects: [
        { x: 0.44, y: 0.22, width: 0.14, height: 0.18, confidence: 0.96, type: "face", label: "Portrait" },
      ],
    },
  },
  {
    id: "w-photo-7",
    fileName: "evening-reception-lights.jpg",
    url: "/mrge_pic/img6.jpg",
    width: 1600,
    height: 1067,
    fileSize: 1152590,
    uploadedAt: Date.now() - 400000,
    smartFit: {
      analyzedAt: Date.now() - 400000,
      aspectRatio: 1600 / 1067,
      faceCount: 2,
      personCount: 2,
      primaryAnchor: { x: 0.50, y: 0.35 },
      subjects: [
        { x: 0.42, y: 0.27, width: 0.10, height: 0.14, confidence: 0.91, type: "face", label: "Face" },
        { x: 0.54, y: 0.28, width: 0.10, height: 0.14, confidence: 0.89, type: "face", label: "Face" },
      ],
    },
  },
  {
    id: "w-photo-8",
    fileName: "together-under-the-stars.jpg",
    url: "/mrge_pic/img7.jpg",
    width: 1600,
    height: 1067,
    fileSize: 4016399,
    uploadedAt: Date.now() - 300000,
    smartFit: {
      analyzedAt: Date.now() - 300000,
      aspectRatio: 1600 / 1067,
      faceCount: 2,
      personCount: 2,
      primaryAnchor: { x: 0.48, y: 0.33 },
      subjects: [
        { x: 0.42, y: 0.26, width: 0.10, height: 0.14, confidence: 0.92, type: "face", label: "Face" },
        { x: 0.53, y: 0.27, width: 0.10, height: 0.14, confidence: 0.90, type: "face", label: "Face" },
      ],
    },
  },
  {
    id: "w-photo-9",
    fileName: "intimate-studio-portrait.jpeg",
    url: "/images/default-frame-photo.jpeg",
    width: 900,
    height: 1200,
    fileSize: 127215,
    uploadedAt: Date.now() - 200000,
    smartFit: {
      analyzedAt: Date.now() - 200000,
      aspectRatio: 900 / 1200,
      faceCount: 1,
      personCount: 1,
      primaryAnchor: { x: 0.50, y: 0.32 },
      subjects: [
        { x: 0.40, y: 0.22, width: 0.20, height: 0.22, confidence: 0.98, type: "face", label: "Face" },
      ],
    },
  },
  {
    id: "w-photo-10",
    fileName: "celebration-journey.png",
    url: "/images/enquiry-editorial.png",
    width: 1200,
    height: 1600,
    fileSize: 1553723,
    uploadedAt: Date.now() - 100000,
    smartFit: {
      analyzedAt: Date.now() - 100000,
      aspectRatio: 1200 / 1600,
      faceCount: 1,
      personCount: 1,
      primaryAnchor: { x: 0.50, y: 0.30 },
      subjects: [
        { x: 0.42, y: 0.20, width: 0.16, height: 0.20, confidence: 0.96, type: "face", label: "Face" },
      ],
    },
  },
];

export function getWeddingAlbumDemoProject(projectId = "wedding"): AlbumProject {
  const pages: AlbumPage[] = [
    // ------------------------------------------------------------------------
    // Spread 1: Title & Hero Wedding Portrait (Pages 1 & 2)
    // ------------------------------------------------------------------------
    {
      id: "w-page-1",
      layout: "single",
      photos: [
        {
          id: "p-1",
          photoId: "w-photo-4",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
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
          photoId: "w-photo-2",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
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
    // Spread 2: Two-Photo Story & Three-Photo Collage (Pages 3 & 4)
    // ------------------------------------------------------------------------
    {
      id: "w-page-3",
      layout: "two-photo",
      photos: [
        {
          id: "p-3a",
          photoId: "w-photo-1",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
        {
          id: "p-3b",
          photoId: "w-photo-3",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-4",
          text: "Surrounded by family, traditions, and autumn light",
          x: 50,
          y: 92,
          fontSize: 11,
          rotation: 0,
          fontFamily: "sans",
          fontWeight: "normal",
          color: "#6B6053",
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
      id: "w-page-4",
      layout: "three-photo",
      photos: [
        {
          id: "p-4a",
          photoId: "w-photo-10",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
        {
          id: "p-4b",
          photoId: "w-photo-5",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
        {
          id: "p-4c",
          photoId: "w-photo-6",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-5",
          text: "“I choose you today, and every day that follows.”",
          x: 50,
          y: 92,
          fontSize: 12,
          rotation: 0,
          fontFamily: "serif",
          fontWeight: "normal",
          italic: true,
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
    // Spread 3: Full-Bleed Double-Page Spread (Pages 5 & 6)
    // ------------------------------------------------------------------------
    {
      id: "w-page-5",
      layout: "full-bleed",
      photos: [
        {
          id: "p-5",
          photoId: "w-photo-8",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [],
      background: "#1E1A16",
      frameStyle: "none",
      photoSpacing: "compact",
      cornerRadius: "square",
      photoShadow: "none",
    },
    {
      id: "w-page-6",
      layout: "full-bleed",
      photos: [
        {
          id: "p-6",
          photoId: "w-photo-8",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-6",
          text: "Golden Light Over The Meadows",
          x: 50,
          y: 92,
          fontSize: 12,
          rotation: 0,
          fontFamily: "serif",
          fontWeight: "normal",
          color: "#FAF7F2",
          textAlign: "center",
        },
      ],
      background: "#1E1A16",
      frameStyle: "none",
      photoSpacing: "compact",
      cornerRadius: "square",
      photoShadow: "none",
    },

    // ------------------------------------------------------------------------
    // Spread 4: Four-Photo Grid & Minimalist Editorial (Pages 7 & 8)
    // ------------------------------------------------------------------------
    {
      id: "w-page-7",
      layout: "four-grid",
      photos: [
        {
          id: "p-7a",
          photoId: "w-photo-1",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
        {
          id: "p-7b",
          photoId: "w-photo-3",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
        {
          id: "p-7c",
          photoId: "w-photo-5",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
        {
          id: "p-7d",
          photoId: "w-photo-7",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
        },
      ],
      texts: [
        {
          id: "t-7",
          text: "Joy in every glance, warmth in every word",
          x: 50,
          y: 92,
          fontSize: 11,
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
          photoId: "w-photo-9",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
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
    // Spread 5: Polaroid Heirloom & Closing Reflection (Pages 9 & 10)
    // ------------------------------------------------------------------------
    {
      id: "w-page-9",
      layout: "single",
      photos: [
        {
          id: "p-9",
          photoId: "w-photo-6",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
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
          photoId: "w-photo-7",
          transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 },
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

  const baseW = 1200;
  const baseH = 1800; // classic 8x12
  const enrichedPages = pages.map((page) => {
    const slots = computePageLayoutSlots(
      page.layout,
      page.photos.length,
      baseW,
      baseH,
      page.photoSpacing ?? "balanced",
    );

    const photos = page.photos.map((placement, idx) => {
      const photo = WEDDING_DEMO_PHOTOS.find((p) => p.id === placement.photoId);
      if (photo?.smartFit) {
        const slot = slots[idx] ?? { index: idx, x: 0, y: 0, width: baseW, height: baseH };
        const smartResult = calculateSmartCrop(
          photo.width,
          photo.height,
          slot.width,
          slot.height,
          photo.smartFit.subjects,
        );
        return {
          ...placement,
          transform: {
            ...placement.transform,
            cropX: smartResult.cropX,
            cropY: smartResult.cropY,
            fitMode: smartResult.fitMode,
          },
        };
      }
      return placement;
    });

    return {
      ...page,
      photos,
    };
  });

  return {
    id: projectId || "wedding",
    name: "Avery & Jordan — Wedding",
    sizeId: "classic",
    pageCount: enrichedPages.length,
    orientation: "portrait",
    coverFinish: "leather",
    coverPhotoId: null,
    photos: WEDDING_DEMO_PHOTOS,
    pages: enrichedPages,
    currentPageIndex: 0,
    createdAt: Date.now() - 5000000,
    updatedAt: Date.now(),
  };
}
