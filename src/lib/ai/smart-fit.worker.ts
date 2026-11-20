import {
  FilesetResolver,
  FaceDetector,
  ObjectDetector,
} from "@mediapipe/tasks-vision";
import type {
  PhotoSubjectBox,
  PhotoSmartMetadata,
} from "@/types/album";
import { calculateSubjectAnchor } from "./smart-crop-engine";

// Vision detector singletons in Web Worker scope
let visionFileset: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>> | null = null;
let faceDetector: FaceDetector | null = null;
let objectDetector: ObjectDetector | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

async function ensureDetectorsInitialized(
  wasmPath = "/wasm/mediapipe",
  faceModelPath = "/models/mediapipe/blaze_face_full_range.tflite",
  objectModelPath = "/models/mediapipe/efficientdet_lite0.tflite",
): Promise<void> {
  if (faceDetector && objectDetector) {
    return;
  }
  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      if (!visionFileset) {
        visionFileset = await FilesetResolver.forVisionTasks(wasmPath);
      }

      if (!faceDetector) {
        faceDetector = await FaceDetector.createFromOptions(visionFileset, {
          baseOptions: {
            modelAssetPath: faceModelPath,
            delegate: "CPU", // Universal baseline for web workers
          },
          runningMode: "IMAGE",
          minDetectionConfidence: 0.35,
        });
      }

      if (!objectDetector) {
        objectDetector = await ObjectDetector.createFromOptions(visionFileset, {
          baseOptions: {
            modelAssetPath: objectModelPath,
            delegate: "CPU",
          },
          runningMode: "IMAGE",
          scoreThreshold: 0.35,
          categoryAllowlist: ["person"],
        });
      }
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

/**
 * Checks if a face bounding box is inside or substantially overlapping a person bounding box.
 */
function isFaceInsidePerson(face: PhotoSubjectBox, person: PhotoSubjectBox): boolean {
  const faceCenterX = face.x + face.width / 2;
  const faceCenterY = face.y + face.height / 2;

  const insideX = faceCenterX >= person.x && faceCenterX <= person.x + person.width;
  const insideY = faceCenterY >= person.y && faceCenterY <= person.y + person.height;

  return insideX && insideY;
}

export async function processImageBitmap(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  wasmPath?: string,
): Promise<PhotoSmartMetadata> {
  await ensureDetectorsInitialized(wasmPath);

  const subjects: PhotoSubjectBox[] = [];

  // 1. Primary detector: BlazeFace Full-Range
  if (faceDetector) {
    try {
      const faceResult = faceDetector.detect(bitmap);
      if (faceResult && faceResult.detections) {
        for (const det of faceResult.detections) {
          const bb = det.boundingBox;
          if (bb && width > 0 && height > 0) {
            const score = det.categories?.[0]?.score ?? 0.8;
            subjects.push({
              x: Math.max(0, Math.min(1, bb.originX / width)),
              y: Math.max(0, Math.min(1, bb.originY / height)),
              width: Math.max(0.01, Math.min(1, bb.width / width)),
              height: Math.max(0.01, Math.min(1, bb.height / height)),
              confidence: score,
              type: "face",
              label: "Face",
            });
          }
        }
      }
    } catch (err) {
      console.warn("SmartFit: Face detector inference warning:", err);
    }
  }

  // 2. Complementary detector: EfficientDet-Lite0 for persons / profiles / silhouettes
  if (objectDetector) {
    try {
      const objResult = objectDetector.detect(bitmap);
      if (objResult && objResult.detections) {
        for (const det of objResult.detections) {
          const bb = det.boundingBox;
          if (bb && width > 0 && height > 0) {
            const score = det.categories?.[0]?.score ?? 0.7;
            const personBox: PhotoSubjectBox = {
              x: Math.max(0, Math.min(1, bb.originX / width)),
              y: Math.max(0, Math.min(1, bb.originY / height)),
              width: Math.max(0.01, Math.min(1, bb.width / width)),
              height: Math.max(0.01, Math.min(1, bb.height / height)),
              confidence: score,
              type: "person",
              label: "Person",
            };

            // Check if this person encompasses an already detected face
            const matchingFace = subjects.find(
              (s) => s.type === "face" && isFaceInsidePerson(s, personBox),
            );

            if (!matchingFace) {
              // Silhouette, back view, or face missed by face detector
              subjects.push(personBox);
            } else {
              // Also keep person box as lower-weight secondary anchor
              subjects.push({
                ...personBox,
                confidence: score * 0.7, // Lower weight so face remains primary anchor
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("SmartFit: Object detector inference warning:", err);
    }
  }

  // Calculate primary visual center of gravity
  const primaryAnchor = calculateSubjectAnchor(subjects);
  const faceCount = subjects.filter((s) => s.type === "face").length;
  const personCount = subjects.filter((s) => s.type === "person").length;

  return {
    analyzedAt: Date.now(),
    subjects,
    primaryAnchor,
    aspectRatio: width / Math.max(1, height),
    faceCount,
    personCount,
  };
}

// Web Worker message listener (only active in worker context)
if (typeof self !== "undefined" && typeof (self as unknown as Worker).postMessage === "function") {
  self.addEventListener("message", async (e: MessageEvent) => {
    const { id, type, bitmap, width, height, wasmPath } = e.data || {};

    if (type === "ANALYZE_IMAGE") {
      try {
        const metadata = await processImageBitmap(bitmap, width, height, wasmPath);
        bitmap?.close?.();
        self.postMessage({ id, type: "ANALYZE_SUCCESS", metadata });
      } catch (err: unknown) {
        bitmap?.close?.();
        const message = err instanceof Error ? err.message : String(err);
        self.postMessage({ id, type: "ANALYZE_ERROR", error: message });
      }
    }
  });
}
