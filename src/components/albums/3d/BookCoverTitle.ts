"use client";

import * as THREE from "three";
import type { AlbumCoverFinish } from "@/types/album";

export interface EmbossedCoverOptions {
  finish: AlbumCoverFinish;
  title?: string;
  coverImage?: HTMLImageElement | null;
  aspectRatio?: number; // width / height
  width?: number;
  height?: number;
}

/**
 * Generates procedural linen weave pattern onto canvas context.
 */
function drawLinenBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = "#B7A58B";
  ctx.fillRect(0, 0, width, height);

  // Cross-hatching for tactile weave effect
  for (let x = 0; x < width; x += 3) {
    const alpha = 0.08 + Math.random() * 0.12;
    ctx.strokeStyle =
      Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(40,30,20,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 3) {
    const alpha = 0.08 + Math.random() * 0.12;
    ctx.strokeStyle =
      Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(40,30,20,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Generates procedural leather grain pattern onto canvas context.
 */
function drawLeatherBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = "#3E2D22";
  ctx.fillRect(0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 26;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain * 0.8));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain * 0.6));
  }
  ctx.putImageData(imgData, 0, 0);

  // Stippled leather pores
  for (let i = 0; i < (width * height) / 800; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 1.5 + Math.random() * 3.5;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws the luxury embossed/debossed Champagne Gold foil title.
 */
function drawEmbossedTitle(
  ctx: CanvasRenderingContext2D,
  title: string,
  width: number,
  height: number,
  finish: AlbumCoverFinish,
) {
  const cleanTitle = title.trim();
  if (!cleanTitle) return;

  ctx.save();

  // Position title in upper-middle luxury focal area (approx 38% down)
  const centerY = height * 0.38;

  // Scale typography to cover width
  const baseFontSize = Math.round(width * 0.052);
  const fontSize = Math.max(24, Math.min(52, baseFontSize));

  ctx.font = `600 ${fontSize}px "Playfair Display", "Cinzel", "Times New Roman", Garamond, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const upperTitle = cleanTitle.toUpperCase();

  // Draw optional soft backdrop pill for photo finish to guarantee legibility
  if (finish === "photo") {
    const metrics = ctx.measureText(upperTitle);
    const boxW = metrics.width + 60;
    const boxH = fontSize * 2.8;
    ctx.fillStyle = "rgba(23, 23, 23, 0.45)";
    ctx.beginPath();
    ctx.roundRect(width / 2 - boxW / 2, centerY - boxH / 2, boxW, boxH, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(185, 155, 112, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 1. Deboss Top-Left Shadow (creates physical indented depth)
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillText(upperTitle, width / 2 - 1.5, centerY - 1.5);

  // 2. Deboss Bottom-Right Light Catcher (catches specular light in groove)
  ctx.fillStyle = "rgba(255, 245, 225, 0.4)";
  ctx.fillText(upperTitle, width / 2 + 1.5, centerY + 1.5);

  // 3. Metallic Champagne Gold Foil Gradient
  const gradient = ctx.createLinearGradient(
    width / 2 - 100,
    centerY - fontSize / 2,
    width / 2 + 100,
    centerY + fontSize / 2,
  );
  gradient.addColorStop(0, "#C8AC7E");
  gradient.addColorStop(0.3, "#EADBC3");
  gradient.addColorStop(0.5, "#B99B70");
  gradient.addColorStop(0.7, "#D8C3A5");
  gradient.addColorStop(1, "#A7885D");

  ctx.fillStyle = gradient;
  ctx.fillText(upperTitle, width / 2, centerY);

  // 4. Subtle Gold Foil Divider Rule
  const ruleWidth = Math.min(180, width * 0.35);
  const ruleY = centerY + fontSize * 1.1;

  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - ruleWidth / 2 - 0.5, ruleY - 0.5);
  ctx.lineTo(width / 2 + ruleWidth / 2 - 0.5, ruleY - 0.5);
  ctx.stroke();

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - ruleWidth / 2, ruleY);
  ctx.lineTo(width / 2 + ruleWidth / 2, ruleY);
  ctx.stroke();

  // 5. Studio Hallmark in Tiny Uppercase Foil
  const hallmarkY = ruleY + fontSize * 0.65;
  const hallmarkSize = Math.max(9, Math.round(fontSize * 0.28));
  ctx.font = `500 ${hallmarkSize}px "Playfair Display", "Times New Roman", serif`;
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillText("STUDIOFRAME KEEPSAKE", width / 2 - 0.5, hallmarkY - 0.5);
  ctx.fillStyle = "#D8C3A5";
  ctx.fillText("STUDIOFRAME KEEPSAKE", width / 2, hallmarkY);

  ctx.restore();
}

/**
 * Creates high-resolution front cover texture with embossed foil title.
 */
export function createEmbossedCoverTexture(options: EmbossedCoverOptions): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const {
    finish,
    title = "",
    coverImage = null,
    width = 1024,
    height = 1536,
  } = options;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // 1. Draw Base Finish Material
    if (finish === "photo" && coverImage) {
      // Draw cover photo image scaled to cover canvas
      const imgAspect = coverImage.naturalWidth / coverImage.naturalHeight;
      const canvasAspect = width / height;

      let drawW = width;
      let drawH = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > canvasAspect) {
        drawW = height * imgAspect;
        offsetX = -(drawW - width) / 2;
      } else {
        drawH = width / imgAspect;
        offsetY = -(drawH - height) / 2;
      }

      ctx.drawImage(coverImage, offsetX, offsetY, drawW, drawH);
    } else if (finish === "leather") {
      drawLeatherBackground(ctx, width, height);
    } else {
      // Linen (also safe fallback for photo finish when image is missing)
      drawLinenBackground(ctx, width, height);
    }

    // 2. Draw Embossed Title if provided
    if (title && title.trim().length > 0) {
      drawEmbossedTitle(ctx, title, width, height, finish);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

/**
 * Creates plain back cover or spine texture matching the finish without title.
 */
export function createPlainCoverTexture(options: {
  finish: AlbumCoverFinish;
  coverImage?: HTMLImageElement | null;
  width?: number;
  height?: number;
}): THREE.CanvasTexture {
  return createEmbossedCoverTexture({
    ...options,
    title: "", // No title on back or raw spine
  });
}

