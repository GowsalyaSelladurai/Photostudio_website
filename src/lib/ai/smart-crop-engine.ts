import type {
  PhotoSubjectBox,
  PhotoSubjectType,
  PhotoFitMode,
} from "@/types/album";

export interface SmartCropOptions {
  isSpread?: boolean;
  spreadRole?: "left" | "right";
  minFaceOverlap?: number;
  faceWeight?: number;
  personWeight?: number;
  gutterSafetyMargin?: number;
}

export interface SmartCropResult {
  cropX: number; // [-50, +50]
  cropY: number; // [-50, +50]
  fitMode: PhotoFitMode;
  score: number; // [0, 1]
  preservedRatio: number; // [0, 1]
  facesInView: number;
  totalFaces: number;
  personsInView: number;
  totalPersons: number;
  gutterConflict: boolean;
  gutterWarning?: string;
  recommendation?: string;
}

export interface VisibleCropWindow {
  visX: number; // normalized [0, 1]
  visY: number;
  visW: number;
  visH: number;
}

/**
 * Computes the visible normalized image window [0, 1] inside a layout container
 * for given cropX and cropY offsets [-50, +50].
 */
export function computeNormalizedCropWindow(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
  cropX = 0,
  cropY = 0,
): VisibleCropWindow {
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    imageWidth <= 0 ||
    imageHeight <= 0
  ) {
    return { visX: 0, visY: 0, visW: 1, visH: 1 };
  }

  const coverScale = Math.max(
    containerWidth / imageWidth,
    containerHeight / imageHeight,
  );
  const drawW = imageWidth * coverScale;
  const drawH = imageHeight * coverScale;

  const cropXPercent = Math.max(0, Math.min(100, 50 + cropX)) / 100;
  const cropYPercent = Math.max(0, Math.min(100, 50 + cropY)) / 100;

  const left = (containerWidth - drawW) * cropXPercent;
  const top = (containerHeight - drawH) * cropYPercent;

  const visX = Math.max(0, Math.min(1, -left / drawW));
  const visY = Math.max(0, Math.min(1, -top / drawH));
  const visW = Math.max(0.001, Math.min(1, containerWidth / drawW));
  const visH = Math.max(0.001, Math.min(1, containerHeight / drawH));

  return { visX, visY, visW, visH };
}

/**
 * Calculates weighted visual anchor (center of mass) of detected subjects.
 * Faces are prioritized over full bodies.
 */
export function calculateSubjectAnchor(
  subjects: PhotoSubjectBox[],
  faceWeight = 4.0,
  personWeight = 1.5,
): { x: number; y: number } {
  if (!subjects || subjects.length === 0) {
    return { x: 0.5, y: 0.5 };
  }

  let totalWeight = 0;
  let weightedSumX = 0;
  let weightedSumY = 0;

  for (const s of subjects) {
    const w =
      (s.type === "face" ? faceWeight : personWeight) *
      Math.max(0.2, s.confidence || 0.8);
    const centerX = s.x + s.width / 2;
    const centerY = s.y + s.height / 2;

    weightedSumX += centerX * w;
    weightedSumY += centerY * w;
    totalWeight += w;
  }

  if (totalWeight <= 0) {
    return { x: 0.5, y: 0.5 };
  }

  return {
    x: Math.max(0, Math.min(1, weightedSumX / totalWeight)),
    y: Math.max(0, Math.min(1, weightedSumY / totalWeight)),
  };
}

/**
 * Calculates intersection area between subject box and crop window in normalized space.
 */
function calculateSubjectOverlap(
  subject: PhotoSubjectBox,
  window: VisibleCropWindow,
): number {
  const subArea = subject.width * subject.height;
  if (subArea <= 0) return 0;

  const interLeft = Math.max(subject.x, window.visX);
  const interTop = Math.max(subject.y, window.visY);
  const interRight = Math.min(subject.x + subject.width, window.visX + window.visW);
  const interBottom = Math.min(subject.y + subject.height, window.visY + window.visH);

  const interW = Math.max(0, interRight - interLeft);
  const interH = Math.max(0, interBottom - interTop);
  const interArea = interW * interH;

  return Math.max(0, Math.min(1, interArea / subArea));
}

/**
 * Evaluates a candidate crop window and returns a numerical score [0, 1]
 * with subject preservation statistics.
 */
export function evaluateCropWindow(
  window: VisibleCropWindow,
  subjects: PhotoSubjectBox[],
  options: SmartCropOptions = {},
): {
  score: number;
  preservedRatio: number;
  facesInView: number;
  totalFaces: number;
  personsInView: number;
  totalPersons: number;
} {
  const {
    faceWeight = 4.0,
    personWeight = 1.5,
    minFaceOverlap = 0.85,
  } = options;

  let totalFaces = 0;
  let facesInView = 0;
  let totalPersons = 0;
  let personsInView = 0;

  if (!subjects || subjects.length === 0) {
    // If no subjects, prefer centered framing
    const distCenterX = Math.abs(window.visX + window.visW / 2 - 0.5);
    const distCenterY = Math.abs(window.visY + window.visH / 2 - 0.5);
    const centerScore = Math.max(0, 1 - (distCenterX + distCenterY));
    return {
      score: centerScore,
      preservedRatio: 1.0,
      facesInView: 0,
      totalFaces: 0,
      personsInView: 0,
      totalPersons: 0,
    };
  }

  let totalWeight = 0;
  let scoreSum = 0;
  let preservedWeight = 0;

  for (const s of subjects) {
    const isFace = s.type === "face";
    const baseWeight = (isFace ? faceWeight : personWeight) * Math.max(0.1, s.confidence || 0.8);
    totalWeight += baseWeight;

    if (isFace) totalFaces++;
    else totalPersons++;

    const overlap = calculateSubjectOverlap(s, window);

    if (overlap >= minFaceOverlap) {
      if (isFace) facesInView++;
      else personsInView++;
    }

    preservedWeight += overlap * baseWeight;

    // Non-linear penalty for partially cut faces: cutting forehead or chin is harsh
    let subScore: number;
    if (isFace) {
      if (overlap >= 0.95) {
        subScore = 1.0;
      } else if (overlap >= minFaceOverlap) {
        subScore = 0.85 * (overlap / minFaceOverlap);
      } else {
        // Severe penalty for cut faces
        subScore = Math.pow(overlap, 2.5);
      }
    } else {
      subScore = Math.pow(overlap, 1.5);
    }

    scoreSum += subScore * baseWeight;
  }

  const basePreservationScore = totalWeight > 0 ? scoreSum / totalWeight : 1.0;
  const preservedRatio = totalWeight > 0 ? preservedWeight / totalWeight : 1.0;

  // Aesthetic composition score: slight bonus for pleasing vertical placement of faces
  let compositionBonus = 0;
  if (totalFaces > 0) {
    const anchor = calculateSubjectAnchor(subjects.filter((s) => s.type === "face"));
    const anchorInWindowY = (anchor.y - window.visY) / window.visH;
    // Upper third: sweet spot is y in [0.25, 0.42] of the crop frame
    if (anchorInWindowY >= 0.2 && anchorInWindowY <= 0.45) {
      compositionBonus = 0.05;
    }
  }

  const finalScore = Math.max(0, Math.min(1, basePreservationScore + compositionBonus));

  return {
    score: finalScore,
    preservedRatio,
    facesInView,
    totalFaces,
    personsInView,
    totalPersons,
  };
}

/**
 * Checks whether any face or person intersects the double-page spread gutter zone [0.46, 0.54].
 */
export function checkSpreadGutterConflict(
  spreadWidth: number,
  spreadHeight: number,
  imageWidth: number,
  imageHeight: number,
  cropX: number,
  subjects: PhotoSubjectBox[],
  safetyMargin = 0.04, // gutter zone: 0.50 +/- 0.04 -> [0.46, 0.54]
): {
  conflict: boolean;
  conflictingSubjects: PhotoSubjectBox[];
  slack: number;
} {
  const spreadScale = Math.max(spreadWidth / imageWidth, spreadHeight / imageHeight);
  const drawW = imageWidth * spreadScale;
  const slack = Math.max(0, drawW - spreadWidth);

  const cropXPercent = Math.max(0, Math.min(100, 50 + cropX)) / 100;
  const spreadLeft = (spreadWidth - drawW) * cropXPercent;

  const gutterMin = 0.5 - safetyMargin;
  const gutterMax = 0.5 + safetyMargin;

  const conflicting: PhotoSubjectBox[] = [];

  for (const s of subjects) {
    // Only check faces and key persons
    const subjSpreadLeft = spreadLeft + s.x * drawW;
    const subjSpreadRight = spreadLeft + (s.x + s.width) * drawW;

    const normLeft = subjSpreadLeft / spreadWidth;
    const normRight = subjSpreadRight / spreadWidth;

    const interMin = Math.max(normLeft, gutterMin);
    const interMax = Math.min(normRight, gutterMax);

    if (interMax > interMin) {
      conflicting.push(s);
    }
  }

  return {
    conflict: conflicting.length > 0,
    conflictingSubjects: conflicting,
    slack,
  };
}

/**
 * Calculates the optimal cropX, cropY, and fitMode for an image placed inside a layout slot.
 * Pure mathematical optimization independent of React or DOM.
 */
export function calculateSmartCrop(
  imageWidth: number,
  imageHeight: number,
  slotWidth: number,
  slotHeight: number,
  subjects: PhotoSubjectBox[] = [],
  options: SmartCropOptions = {},
): SmartCropResult {
  if (
    imageWidth <= 0 ||
    imageHeight <= 0 ||
    slotWidth <= 0 ||
    slotHeight <= 0
  ) {
    return {
      cropX: 0,
      cropY: 0,
      fitMode: "cover",
      score: 1.0,
      preservedRatio: 1.0,
      facesInView: 0,
      totalFaces: 0,
      personsInView: 0,
      totalPersons: 0,
      gutterConflict: false,
    };
  }

  const { isSpread = false, gutterSafetyMargin = 0.04 } = options;

  // Double-page spread gutter protection
  if (isSpread) {
    return calculateSmartCropForSpread(
      imageWidth,
      imageHeight,
      slotWidth,
      slotHeight,
      subjects,
      options,
    );
  }

  // 1. Analytical ideal crop from primary anchor point
  const anchor = calculateSubjectAnchor(subjects, options.faceWeight, options.personWeight);

  // Determine cover dimensions and slack
  const coverScale = Math.max(slotWidth / imageWidth, slotHeight / imageHeight);
  const drawW = imageWidth * coverScale;
  const drawH = imageHeight * coverScale;

  const horizontalSlack = drawW - slotWidth;
  const verticalSlack = drawH - slotHeight;

  let idealCropX = 0;
  if (horizontalSlack > 1) {
    const visW = slotWidth / drawW;
    // Ideal: center crop window on anchor.x
    const idealLeftNorm = anchor.x - visW / 2;
    const cropXPercent = idealLeftNorm / (1 - visW);
    idealCropX = Math.round(Math.max(-50, Math.min(50, cropXPercent * 100 - 50)));
  }

  let idealCropY = 0;
  if (verticalSlack > 1) {
    const visH = slotHeight / drawH;
    // Ideal: position anchor.y in upper third (e.g. 0.35 from top of slot)
    const targetYOffset = subjects.some((s) => s.type === "face") ? 0.35 : 0.5;
    const idealTopNorm = anchor.y - targetYOffset * visH;
    const cropYPercent = idealTopNorm / (1 - visH);
    idealCropY = Math.round(Math.max(-50, Math.min(50, cropYPercent * 100 - 50)));
  }

  // 2. Candidate evaluation: evaluate analytical candidate and stepped search
  const candidateOffsetsX: number[] = [idealCropX, 0];
  const candidateOffsetsY: number[] = [idealCropY, 0];

  if (horizontalSlack > 1) {
    for (let cx = -50; cx <= 50; cx += 10) {
      if (!candidateOffsetsX.includes(cx)) candidateOffsetsX.push(cx);
    }
  }

  if (verticalSlack > 1) {
    for (let cy = -50; cy <= 50; cy += 10) {
      if (!candidateOffsetsY.includes(cy)) candidateOffsetsY.push(cy);
    }
  }

  let bestResult: {
    cropX: number;
    cropY: number;
    score: number;
    preservedRatio: number;
    facesInView: number;
    totalFaces: number;
    personsInView: number;
    totalPersons: number;
  } | null = null;

  for (const cx of candidateOffsetsX) {
    for (const cy of candidateOffsetsY) {
      const win = computeNormalizedCropWindow(
        slotWidth,
        slotHeight,
        imageWidth,
        imageHeight,
        cx,
        cy,
      );
      const evalResult = evaluateCropWindow(win, subjects, options);

      if (!bestResult || evalResult.score > bestResult.score) {
        bestResult = {
          cropX: cx,
          cropY: cy,
          ...evalResult,
        };
      }
    }
  }

  const finalBest = bestResult || {
    cropX: idealCropX,
    cropY: idealCropY,
    score: 1.0,
    preservedRatio: 1.0,
    facesInView: 0,
    totalFaces: 0,
    personsInView: 0,
    totalPersons: 0,
  };

  // 3. Aspect ratio impossibility check:
  // If despite optimal cropping, faces are clipped (< 80% preserved), recommend contain
  const hasFaceClipped =
    finalBest.totalFaces > 0 && finalBest.facesInView < finalBest.totalFaces;
  const isSeverelyClipped = finalBest.preservedRatio < 0.75 || hasFaceClipped;

  const fitMode: PhotoFitMode = isSeverelyClipped ? "contain" : "cover";
  const recommendation = isSeverelyClipped
    ? `Aspect ratio mismatch: ${finalBest.totalFaces - finalBest.facesInView} subject(s) would be clipped in Cover mode. Fitted entire photo to preserve all subjects.`
    : undefined;

  return {
    cropX: finalBest.cropX,
    cropY: finalBest.cropY,
    fitMode,
    score: finalBest.score,
    preservedRatio: finalBest.preservedRatio,
    facesInView: finalBest.facesInView,
    totalFaces: finalBest.totalFaces,
    personsInView: finalBest.personsInView,
    totalPersons: finalBest.totalPersons,
    gutterConflict: false,
    recommendation,
  };
}

/**
 * Calculates smart crop specifically for double-page spreads with gutter avoidance.
 */
function calculateSmartCropForSpread(
  imageWidth: number,
  imageHeight: number,
  spreadWidth: number,
  spreadHeight: number,
  subjects: PhotoSubjectBox[],
  options: SmartCropOptions,
): SmartCropResult {
  const { gutterSafetyMargin = 0.04 } = options;

  // In double-page spreads, spreadWidth is both pages together (e.g. 2 * canvasWidth)
  const spreadScale = Math.max(spreadWidth / imageWidth, spreadHeight / imageHeight);
  const drawW = imageWidth * spreadScale;
  const slack = drawW - spreadWidth;

  const candidateOffsets: number[] = [0, -25, 25, -45, 45, -15, 15, -35, 35];

  let bestNonConflicting: {
    cropX: number;
    score: number;
    preservedRatio: number;
    facesInView: number;
    totalFaces: number;
    personsInView: number;
    totalPersons: number;
  } | null = null;

  let bestOverall: {
    cropX: number;
    score: number;
    preservedRatio: number;
    facesInView: number;
    totalFaces: number;
    personsInView: number;
    totalPersons: number;
    conflict: boolean;
  } | null = null;

  for (const cx of candidateOffsets) {
    const win = computeNormalizedCropWindow(
      spreadWidth,
      spreadHeight,
      imageWidth,
      imageHeight,
      cx,
      0,
    );
    const evalRes = evaluateCropWindow(win, subjects, options);
    const gutterCheck = checkSpreadGutterConflict(
      spreadWidth,
      spreadHeight,
      imageWidth,
      imageHeight,
      cx,
      subjects,
      gutterSafetyMargin,
    );

    if (!gutterCheck.conflict) {
      if (!bestNonConflicting || evalRes.score > bestNonConflicting.score) {
        bestNonConflicting = { cropX: cx, ...evalRes };
      }
    }

    if (!bestOverall || evalRes.score > bestOverall.score) {
      bestOverall = { cropX: cx, ...evalRes, conflict: gutterCheck.conflict };
    }
  }

  if (bestNonConflicting) {
    return {
      cropX: bestNonConflicting.cropX,
      cropY: 0,
      fitMode: "cover",
      score: bestNonConflicting.score,
      preservedRatio: bestNonConflicting.preservedRatio,
      facesInView: bestNonConflicting.facesInView,
      totalFaces: bestNonConflicting.totalFaces,
      personsInView: bestNonConflicting.personsInView,
      totalPersons: bestNonConflicting.totalPersons,
      gutterConflict: false,
    };
  }

  // If no non-conflicting offset could be found (e.g. zero slack or group across center)
  const conflictChoice = bestOverall || {
    cropX: 0,
    score: 0.5,
    preservedRatio: 0.7,
    facesInView: 0,
    totalFaces: subjects.filter((s) => s.type === "face").length,
    personsInView: 0,
    totalPersons: subjects.filter((s) => s.type === "person").length,
    conflict: true,
  };

  return {
    cropX: conflictChoice.cropX,
    cropY: 0,
    fitMode: slack <= 1 ? "contain" : "cover",
    score: conflictChoice.score,
    preservedRatio: conflictChoice.preservedRatio,
    facesInView: conflictChoice.facesInView,
    totalFaces: conflictChoice.totalFaces,
    personsInView: conflictChoice.personsInView,
    totalPersons: conflictChoice.totalPersons,
    gutterConflict: true,
    gutterWarning:
      "Subject lies in physical book binding crease [46%-54%]. Repositioned or recommend Fit Entire Photo.",
    recommendation: "Use single-page layout or Fit Entire Photo to protect faces from the book binding.",
  };
}
