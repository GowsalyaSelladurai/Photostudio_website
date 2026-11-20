"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { BookPhysicalDimensions } from "@/components/albums/Album3DBook";
import type { AlbumCoverFinish } from "@/types/album";
import {
  type BookViewState,
  computeCoverHingeAngle,
  computeHingeElevation,
} from "./BookHingeMath";
import { createCurvedStationaryPageGeometry } from "./CurvedPageGeometry";

interface FlipAnimationProps {
  direction: "next" | "previous";
  frontTexture: THREE.Texture;
  backTexture: THREE.Texture;
  underneathLeftTexture: THREE.Texture;
  underneathRightTexture: THREE.Texture;
}

export interface ClosedBookModelProps {
  dim: BookPhysicalDimensions;
  coverTexture: THREE.Texture;
  plainCoverTexture: THREE.Texture;
  edgeTexture: THREE.Texture;
  coverFinish: AlbumCoverFinish;
  projectTitle: string;
  onOpen: () => void;
  interactive?: boolean;
  viewState?: BookViewState;
  animationProgress?: number; // 0.0 (closed) to 1.0 (opened)
  leftPageTexture?: THREE.Texture | null;
  rightPageTexture?: THREE.Texture | null;
  spreadIndex?: number;
  totalSpreads?: number;
  onTurnLeftPage?: () => void;
  onTurnRightPage?: () => void;
  canTurnLeft?: boolean;
  canTurnRight?: boolean;
  flipState?: FlipAnimationProps | null;
}

/**
 * Creates curved spine geometry joining front and back covers with physical convex arc.
 */
function createCurvedSpineGeometry(
  pageWidth: number,
  totalThickness: number,
  boardHeight: number,
  bulgeAmount = 0.045,
  segments = 16,
): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const spineXCenter = -pageWidth / 2;
  const radiusZ = totalThickness / 2;

  for (let j = 0; j <= 1; j++) {
    const y = (j === 0 ? -1 : 1) * (boardHeight / 2);
    const v = j;

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const phi = -Math.PI / 2 + u * Math.PI;

      const z = Math.sin(phi) * radiusZ;
      const x = spineXCenter - Math.cos(phi) * bulgeAmount;

      vertices.push(x, y, z);

      const nx = -Math.cos(phi);
      const nz = Math.sin(phi);
      normals.push(nx, 0, nz);

      uvs.push(u, v);
    }
  }

  for (let i = 0; i < segments; i++) {
    const p1 = i;
    const p2 = i + 1;
    const p3 = i + segments + 1;
    const p4 = i + segments + 2;

    indices.push(p1, p3, p2);
    indices.push(p2, p3, p4);
  }

  geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);

  return geom;
}

export function ClosedBookModel({
  dim,
  coverTexture,
  plainCoverTexture,
  edgeTexture,
  coverFinish,
  onOpen,
  interactive = true,
  viewState = "closed",
  animationProgress = 0,
  leftPageTexture,
  rightPageTexture,
  spreadIndex = 0,
  totalSpreads = 5,
  onTurnLeftPage,
  onTurnRightPage,
  canTurnLeft = false,
  canTurnRight = false,
}: ClosedBookModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frontHingePivotRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const {
    pageWidth,
    pageHeight,
    boardThickness,
    overhangX,
    overhangY,
    stackDepth,
  } = dim;

  const boardW = pageWidth + overhangX;
  const boardH = pageHeight + overhangY * 2;
  const totalThickness = stackDepth + boardThickness * 2;
  const spineBulge = Math.max(0.025, totalThickness * 0.22);

  // Instantaneous cover hinge angle & Z elevation
  const coverAngle = computeCoverHingeAngle(animationProgress);
  const currentHingeZ = computeHingeElevation(
    animationProgress,
    stackDepth,
    boardThickness,
  );

  // Dynamic stack depth calculations based on spread progress
  const numSpreads = Math.max(2, totalSpreads);
  const currSpread = Math.max(0, Math.min(numSpreads - 1, spreadIndex));
  const spreadFraction = currSpread / (numSpreads - 1);

  // Progressive thickness distribution between left & right stacks
  const minLeafDepth = 0.004;
  const usableDepth = Math.max(minLeafDepth * 2, stackDepth - 0.006);

  // When fully open, thickness transfers smoothly across spreads
  const targetLeftDepth = minLeafDepth + spreadFraction * (usableDepth - minLeafDepth);
  const targetRightDepth = minLeafDepth + (1 - spreadFraction) * (usableDepth - minLeafDepth);

  // Interpolate depths according to open/close animation progress
  const openProgress = Math.max(0, Math.min(1, animationProgress));
  const currentLeftDepth = targetLeftDepth * openProgress;
  const currentRightDepth = stackDepth * (1 - openProgress) + targetRightDepth * openProgress;

  // Material parameters matching physical finishes
  const coverMaterialProps = useMemo(() => {
    return {
      roughness: coverFinish === "leather" ? 0.62 : coverFinish === "photo" ? 0.35 : 0.88,
      metalness: coverFinish === "leather" ? 0.12 : 0.04,
    };
  }, [coverFinish]);

  // Front cover materials:
  // Face +Z (Face 4): Outer face with embossed gold foil title
  // Face -Z (Face 5): Inner face with warm ivory endpaper
  // Sides: Plain finish material
  const frontCoverMaterials = useMemo(() => {
    const plainMat = new THREE.MeshStandardMaterial({
      map: plainCoverTexture,
      ...coverMaterialProps,
    });

    const frontFaceMat = new THREE.MeshStandardMaterial({
      map: coverTexture,
      ...coverMaterialProps,
    });

    const insideEndpaperMat = new THREE.MeshStandardMaterial({
      color: "#F5F0E8",
      roughness: 0.92,
      metalness: 0.0,
    });

    return [
      plainMat,
      plainMat,
      plainMat,
      plainMat,
      frontFaceMat,
      insideEndpaperMat,
    ];
  }, [coverTexture, plainCoverTexture, coverMaterialProps]);

  // Back cover materials (Stationary bottom board)
  const backCoverMaterials = useMemo(() => {
    const plainMat = new THREE.MeshStandardMaterial({
      map: plainCoverTexture,
      ...coverMaterialProps,
    });

    const insideEndpaperMat = new THREE.MeshStandardMaterial({
      color: "#F5F0E8",
      roughness: 0.92,
      metalness: 0.0,
    });

    // Order: +X, -X, +Y, -Y, +Z (Inside facing stack), -Z (Outside bottom facing table)
    return [
      plainMat,
      plainMat,
      plainMat,
      plainMat,
      insideEndpaperMat,
      plainMat,
    ];
  }, [plainCoverTexture, coverMaterialProps]);

  // Left cover board (Open state resting flat on the table to the left of spine)
  const leftOpenBoardMaterials = useMemo(() => {
    const plainMat = new THREE.MeshStandardMaterial({
      map: plainCoverTexture,
      ...coverMaterialProps,
    });

    const insideEndpaperMat = new THREE.MeshStandardMaterial({
      color: "#F5F0E8",
      roughness: 0.92,
      metalness: 0.0,
    });

    // Order: +X, -X, +Y, -Y, +Z (Inside facing up towards paper stack), -Z (Outside facing table)
    return [
      plainMat,
      plainMat,
      plainMat,
      plainMat,
      insideEndpaperMat,
      plainMat,
    ];
  }, [plainCoverTexture, coverMaterialProps]);

  // Page edge materials for Left Stack:
  // -X (Fore-edge left), +Y (Head), -Y (Tail) show stratified paper edges
  // +X (Spine bound edge) shows binding cloth/glue
  const leftStackMaterials = useMemo(() => {
    const pageEdgeMat = new THREE.MeshStandardMaterial({
      map: edgeTexture,
      roughness: 0.94,
      metalness: 0.02,
    });

    const spineGlueMat = new THREE.MeshStandardMaterial({
      color: "#352B20",
      roughness: 0.95,
    });

    const paperTopMat = new THREE.MeshStandardMaterial({
      color: "#FAF6F0",
      roughness: 0.9,
    });

    return [
      spineGlueMat, // +X (Spine bound edge)
      pageEdgeMat,  // -X (Fore-edge left)
      pageEdgeMat,  // +Y (Head)
      pageEdgeMat,  // -Y (Tail)
      paperTopMat,  // +Z (Top sheet)
      paperTopMat,  // -Z (Bottom sheet)
    ];
  }, [edgeTexture]);

  // Page edge materials for Right Stack:
  // +X (Fore-edge right), +Y (Head), -Y (Tail) show stratified paper edges
  // -X (Spine bound edge) shows binding cloth/glue
  const rightStackMaterials = useMemo(() => {
    const pageEdgeMat = new THREE.MeshStandardMaterial({
      map: edgeTexture,
      roughness: 0.94,
      metalness: 0.02,
    });

    const spineGlueMat = new THREE.MeshStandardMaterial({
      color: "#352B20",
      roughness: 0.95,
    });

    const paperTopMat = new THREE.MeshStandardMaterial({
      color: "#FAF6F0",
      roughness: 0.9,
    });

    return [
      pageEdgeMat,  // +X (Fore-edge right)
      spineGlueMat, // -X (Spine bound edge)
      pageEdgeMat,  // +Y (Head)
      pageEdgeMat,  // -Y (Tail)
      paperTopMat,  // +Z (Top sheet)
      paperTopMat,  // -Z (Bottom sheet)
    ];
  }, [edgeTexture]);

  // Curved spine geometry joining covers across the spine seam
  const spineGeom = useMemo(() => {
    return createCurvedSpineGeometry(pageWidth, totalThickness, boardH, spineBulge);
  }, [pageWidth, totalThickness, boardH, spineBulge]);

  // Curved stationary open spread pages
  const leftCurvedGeom = useMemo(() => {
    return createCurvedStationaryPageGeometry(pageWidth, pageHeight, "left", 36, 10);
  }, [pageWidth, pageHeight]);

  const rightCurvedGeom = useMemo(() => {
    return createCurvedStationaryPageGeometry(pageWidth, pageHeight, "right", 36, 10);
  }, [pageWidth, pageHeight]);

  // Central gutter crease shadow texture
  const gutterShadowTex = useMemo(() => {
    if (typeof document === "undefined") {
      return new THREE.CanvasTexture({} as HTMLCanvasElement);
    }
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 128, 0);
      grad.addColorStop(0, "rgba(22, 18, 14, 0)");
      grad.addColorStop(0.32, "rgba(22, 18, 14, 0.28)");
      grad.addColorStop(0.5, "rgba(22, 18, 14, 0.62)");
      grad.addColorStop(0.68, "rgba(22, 18, 14, 0.28)");
      grad.addColorStop(1, "rgba(22, 18, 14, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 16);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const leftCurvedMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: leftPageTexture ?? null,
      color: leftPageTexture ? "#FFFFFF" : "#F5F0E8",
      roughness: 0.86,
      metalness: 0.0,
      side: THREE.FrontSide,
    });
  }, [leftPageTexture]);

  const rightCurvedMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: rightPageTexture ?? null,
      color: rightPageTexture ? "#FFFFFF" : "#FAF6F0",
      roughness: 0.86,
      metalness: 0.0,
      side: THREE.FrontSide,
    });
  }, [rightPageTexture]);

  // Gentle hover animation while closed
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const isHoverActive = hovered && viewState === "closed" && interactive;
    const targetScale = isHoverActive ? 1.025 : 1.0;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 8,
    );
  });

  const canClickToOpen = interactive && viewState === "closed";
  const isOpenState = animationProgress >= 0.98;

  return (
    <group ref={groupRef}>
      {/* ------------------------------------------------------------------ */}
      {/* 1. RIGHT SIDE: Stationary Right Paper Stack & Back Cover           */}
      {/* ------------------------------------------------------------------ */}
      {/* Right Paper Stack (Physical sheets with visible layered page edges) */}
      <mesh
        position={[0, 0, currentRightDepth / 2]}
        material={rightStackMaterials}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[pageWidth, pageHeight, Math.max(0.003, currentRightDepth)]} />
      </mesh>

      {/* Back Cover Board (Underneath Right Stack, resting on viewing plane) */}
      <mesh
        position={[overhangX / 2, 0, -boardThickness / 2]}
        material={backCoverMaterials}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[boardW, boardH, boardThickness]} />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* 2. LEFT SIDE: Left Cover Board & Left Paper Stack (When Open)      */}
      {/* ------------------------------------------------------------------ */}
      {animationProgress > 0.05 && (
        <group>
          {/* Left Cover Board (Lies flat on viewing plane to the left of spine) */}
          <mesh
            position={[-pageWidth - overhangX / 2, 0, -boardThickness / 2]}
            material={leftOpenBoardMaterials}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[boardW, boardH, boardThickness]} />
          </mesh>

          {/* Left Paper Stack (Physical sheets accumulating on left cover) */}
          {currentLeftDepth > 0.002 && (
            <mesh
              position={[-pageWidth, 0, currentLeftDepth / 2]}
              material={leftStackMaterials}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[pageWidth, pageHeight, Math.max(0.002, currentLeftDepth)]}
              />
            </mesh>
          )}
        </group>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. FRONT COVER HINGE: Swings 180° around spine to open album       */}
      {/* ------------------------------------------------------------------ */}
      {/* When fully open, the static left board represents the cover;       */}
      {/* during closed or transitioning states, the pivoting mesh renders.  */}
      {!isOpenState && (
        <group
          ref={frontHingePivotRef}
          position={[-pageWidth / 2, 0, currentHingeZ]}
          rotation={[0, coverAngle, 0]}
        >
          <mesh
            position={[boardW / 2, 0, 0]}
            material={frontCoverMaterials}
            castShadow
            receiveShadow
            onClick={(e) => {
              if (!canClickToOpen) return;
              e.stopPropagation();
              onOpen();
            }}
            onPointerOver={(e) => {
              if (!canClickToOpen) return;
              e.stopPropagation();
              setHovered(true);
              if (typeof document !== "undefined") {
                document.body.style.cursor = "pointer";
              }
            }}
            onPointerOut={() => {
              setHovered(false);
              if (typeof document !== "undefined") {
                document.body.style.cursor = "auto";
              }
            }}
          >
            <boxGeometry args={[boardW, boardH, boardThickness]} />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. CENTRAL SPINE BINDING & ARCHITECTURAL JOINTS                   */}
      {/* ------------------------------------------------------------------ */}
      {/* Curved Convex Spine joining front and back covers */}
      <mesh geometry={spineGeom} castShadow receiveShadow>
        <meshStandardMaterial map={plainCoverTexture} {...coverMaterialProps} />
      </mesh>

      {/* Left Spine Joint (French joint indentation along left hinge) */}
      <mesh
        position={[
          -pageWidth / 2 - 0.015,
          0,
          isOpenState ? -boardThickness / 2 + 0.012 : currentHingeZ,
        ]}
        castShadow
      >
        <cylinderGeometry args={[0.012, 0.012, boardH, 12]} />
        <meshStandardMaterial color="#1E1712" roughness={0.92} />
      </mesh>

      {/* Right Spine Joint (French joint indentation along right hinge) */}
      <mesh
        position={[-pageWidth / 2 + 0.015, 0, -boardThickness / 2 + 0.012]}
        castShadow
      >
        <cylinderGeometry args={[0.012, 0.012, boardH, 12]} />
        <meshStandardMaterial color="#1E1712" roughness={0.92} />
      </mesh>

      {/* Headband & Tailband Decorative Ribbons at Spine Ends */}
      <mesh
        position={[
          -pageWidth / 2,
          pageHeight / 2 - 0.008,
          0.005,
        ]}
        castShadow
      >
        <boxGeometry args={[0.045, 0.016, totalThickness * 0.7]} />
        <meshStandardMaterial color="#C5A87D" roughness={0.5} metalness={0.4} />
      </mesh>

      <mesh
        position={[
          -pageWidth / 2,
          -pageHeight / 2 + 0.008,
          0.005,
        ]}
        castShadow
      >
        <boxGeometry args={[0.045, 0.016, totalThickness * 0.7]} />
        <meshStandardMaterial color="#C5A87D" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* 5. STATIONARY OPEN SPREAD PAGES (Revealed when open)               */}
      {/* ------------------------------------------------------------------ */}
      {animationProgress > 0.04 && (
        <group position={[-pageWidth / 2, 0, 0]}>
          {/* Left Curved Page (Verso) - Sits on Left Stack, click turns back */}
          <mesh
            geometry={leftCurvedGeom}
            material={leftCurvedMat}
            position={[0, 0, Math.max(0.003, currentLeftDepth) + 0.0016]}
            receiveShadow
            onClick={(e) => {
              if (viewState !== "opened" || !canTurnLeft) return;
              e.stopPropagation();
              onTurnLeftPage?.();
            }}
            onPointerOver={(e) => {
              if (viewState === "opened" && canTurnLeft && typeof document !== "undefined") {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }
            }}
            onPointerOut={() => {
              if (typeof document !== "undefined") {
                document.body.style.cursor = "auto";
              }
            }}
          />

          {/* Right Curved Page (Recto) - Sits on Right Stack, click turns forward */}
          <mesh
            geometry={rightCurvedGeom}
            material={rightCurvedMat}
            position={[0, 0, Math.max(0.003, currentRightDepth) + 0.0016]}
            receiveShadow
            onClick={(e) => {
              if (viewState !== "opened" || !canTurnRight) return;
              e.stopPropagation();
              onTurnRightPage?.();
            }}
            onPointerOver={(e) => {
              if (viewState === "opened" && canTurnRight && typeof document !== "undefined") {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }
            }}
            onPointerOut={() => {
              if (typeof document !== "undefined") {
                document.body.style.cursor = "auto";
              }
            }}
          />

          {/* Central Binding Crease & Gutter Vignette Shadow */}
          <mesh
            position={[
              0,
              0,
              Math.max(currentLeftDepth, currentRightDepth) + 0.0024,
            ]}
          >
            <planeGeometry args={[0.046, pageHeight]} />
            <meshBasicMaterial
              map={gutterShadowTex}
              transparent
              opacity={0.7}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
