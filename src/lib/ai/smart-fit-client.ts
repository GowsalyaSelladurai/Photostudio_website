import type {
  AlbumPhoto,
  PhotoSmartMetadata,
  PhotoTransform,
} from "@/types/album";
import { calculateSmartCrop, SmartCropOptions } from "./smart-crop-engine";

interface PendingRequest {
  resolve: (value: PhotoSmartMetadata) => void;
  reject: (reason?: unknown) => void;
  timer: NodeJS.Timeout | number;
}

// In-memory cache for analyzed metadata
const metadataCache = new Map<string, PhotoSmartMetadata>();

let workerInstance: Worker | null = null;
let requestCounter = 0;
const pendingRequests = new Map<string, PendingRequest>();

/**
 * Initializes and retrieves the singleton SmartFit Web Worker.
 */
function getWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return null;
  }

  if (!workerInstance) {
    try {
      workerInstance = new Worker(
        new URL("./smart-fit.worker.ts", import.meta.url),
        { type: "module" },
      );

      workerInstance.onmessage = (e: MessageEvent) => {
        const { id, type, metadata, error } = e.data || {};
        const pending = pendingRequests.get(id);
        if (!pending) return;

        pendingRequests.delete(id);
        clearTimeout(pending as unknown as number);

        if (type === "ANALYZE_SUCCESS" && metadata) {
          pending.resolve(metadata);
        } else {
          pending.reject(new Error(error || "SmartFit analysis failed"));
        }
      };

      workerInstance.onerror = (err) => {
        console.warn("SmartFit: Worker error:", err);
      };
    } catch (err) {
      console.warn("SmartFit: Failed to initialize Web Worker, using fallback:", err);
      workerInstance = null;
    }
  }

  return workerInstance;
}

/**
 * Heuristic fallback when AI models or Web Worker are unavailable.
 */
function createFallbackMetadata(
  width: number,
  height: number,
): PhotoSmartMetadata {
  return {
    analyzedAt: Date.now(),
    subjects: [],
    primaryAnchor: { x: 0.5, y: 0.38 }, // Aesthetic upper-third center for wedding portraits
    aspectRatio: width / Math.max(1, height),
    faceCount: 0,
    personCount: 0,
  };
}

/**
 * Analyzes an image Blob using the SmartFit Web Worker, with safe fallback.
 */
export async function analyzePhotoBlob(
  blob: Blob,
  photoId: string,
): Promise<PhotoSmartMetadata> {
  if (metadataCache.has(photoId)) {
    return metadataCache.get(photoId)!;
  }

  if (typeof window === "undefined") {
    return createFallbackMetadata(1200, 800);
  }

  // Create ImageBitmap from Blob
  let bitmap: ImageBitmap | null = null;
  try {
    if (typeof createImageBitmap === "function") {
      bitmap = await createImageBitmap(blob);
    }
  } catch (err) {
    console.warn("SmartFit: Could not create ImageBitmap from blob:", err);
  }

  if (!bitmap) {
    const fallback = createFallbackMetadata(1200, 800);
    metadataCache.set(photoId, fallback);
    return fallback;
  }

  const { width, height } = bitmap;
  const worker = getWorker();

  if (!worker) {
    bitmap.close();
    const fallback = createFallbackMetadata(width, height);
    metadataCache.set(photoId, fallback);
    return fallback;
  }

  const id = `smartfit_${++requestCounter}_${Date.now()}`;

  return new Promise<PhotoSmartMetadata>((resolve) => {
    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      const fallback = createFallbackMetadata(width, height);
      metadataCache.set(photoId, fallback);
      resolve(fallback);
    }, 15000); // 15 second timeout

    pendingRequests.set(id, {
      resolve: (meta) => {
        metadataCache.set(photoId, meta);
        resolve(meta);
      },
      reject: () => {
        const fallback = createFallbackMetadata(width, height);
        metadataCache.set(photoId, fallback);
        resolve(fallback);
      },
      timer,
    });

    try {
      worker.postMessage(
        {
          id,
          type: "ANALYZE_IMAGE",
          bitmap,
          width,
          height,
        },
        [bitmap],
      );
    } catch {
      pendingRequests.delete(id);
      clearTimeout(timer);
      bitmap.close();
      const fallback = createFallbackMetadata(width, height);
      metadataCache.set(photoId, fallback);
      resolve(fallback);
    }
  });
}

/**
 * Calculates optimal transform for a photo placed inside an album slot,
 * using AI metadata if available or analytical heuristics.
 */
export function getSmartFitTransform(
  photo: AlbumPhoto,
  slotWidth: number,
  slotHeight: number,
  options?: SmartCropOptions,
): PhotoTransform {
  const subjects = photo.smartFit?.subjects || [];
  const result = calculateSmartCrop(
    photo.width,
    photo.height,
    slotWidth,
    slotHeight,
    subjects,
    options,
  );

  return {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    cropX: result.cropX,
    cropY: result.cropY,
    fitMode: result.fitMode,
  };
}
