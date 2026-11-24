
export type AlbumSize = {
  id: string;
  label: string;
  width: number;
  height: number;
  price: number;
};

export type AlbumCoverFinish = "linen" | "leather" | "photo";

export type AlbumOrientation = "portrait" | "landscape" | "square";

export type PhotoSubjectType = "face" | "person";

export type PhotoSubjectBox = {
  x: number; // normalized [0, 1] relative to image width
  y: number; // normalized [0, 1] relative to image height
  width: number; // normalized [0, 1]
  height: number; // normalized [0, 1]
  confidence: number; // [0, 1]
  type: PhotoSubjectType;
  label?: string;
};

export type PhotoSmartMetadata = {
  analyzedAt: number;
  subjects: PhotoSubjectBox[];
  primaryAnchor: { x: number; y: number }; // normalized [0, 1]
  recommendedFitMode?: "cover" | "contain";
  aspectRatio: number;
  faceCount: number;
  personCount: number;
};

export type AlbumPhoto = {
  id: string;
  fileName: string;
  url: string;
  width: number;
  height: number;
  fileSize: number;
  uploadedAt: number;
  smartFit?: PhotoSmartMetadata;
};

export type PhotoFitMode = "cover" | "contain";

export type PhotoTransform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  cropX: number;
  cropY: number;
  fitMode?: PhotoFitMode;
};

export type AlbumPhotoPlacement = {
  id: string;
  photoId: string;
  transform: PhotoTransform;
};

export type AlbumLayoutType =
  | "single"
  | "two-photo"
  | "three-photo"
  | "four-grid"
  | "collage"
  | "full-bleed";

export type AlbumFrameStyle = "none" | "thin" | "elegant" | "polaroid";

export type AlbumPhotoSpacing = "compact" | "balanced" | "spacious";

export type AlbumCornerRadius = "square" | "subtle" | "rounded";

export type AlbumPhotoShadow = "none" | "soft" | "premium";

export type AlbumTextFontFamily = "serif" | "sans" | "elegant";

export type AlbumTextWeight = "normal" | "bold";

export type AlbumTextAlignment = "left" | "center" | "right";

export type AlbumTextElement = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  rotation: number;

  // Optional typography settings
  fontFamily?: AlbumTextFontFamily;
  color?: string;
  fontWeight?: AlbumTextWeight;
  italic?: boolean;
  textAlign?: AlbumTextAlignment;
};

export type AlbumPage = {
  id: string;
  layout: AlbumLayoutType;
  photos: AlbumPhotoPlacement[];
  texts: AlbumTextElement[];
  background: string;
  frameStyle?: AlbumFrameStyle;
  photoSpacing?: AlbumPhotoSpacing;
  cornerRadius?: AlbumCornerRadius;
  photoShadow?: AlbumPhotoShadow;
};

export type AlbumProject = {
  id: string;
  name: string;
  sizeId: string;
  pageCount: number;
  orientation: AlbumOrientation;
  coverFinish: AlbumCoverFinish;
  coverPhotoId: string | null;
  photos: AlbumPhoto[];
  pages: AlbumPage[];
  currentPageIndex: number;
  createdAt: number;
  updatedAt: number;
};

export type AlbumTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  layout: AlbumLayoutType;
  preview: string;
};

export type AlbumLayoutOption = {
  id: AlbumLayoutType;
  name: string;
  description: string;
  photoLimit: number;
};