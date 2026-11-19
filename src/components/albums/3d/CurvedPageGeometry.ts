import * as THREE from "three";

/**
 * Computes the physical elevation (Z-offset) of a stationary album page
 * to simulate the natural curvature of paper bound into a premium hardcover photobook.
 *
 * @param u Normalized distance from the binding gutter (0.0 = gutter / spine, 1.0 = outer fore-edge)
 * @param y Vertical position along page height (-pageHeight/2 to +pageHeight/2)
 * @param pageHeight Full physical height of the page
 * @returns Z elevation offset in Three.js units
 */
export function computePageCurvatureElevation(
  u: number,
  y: number,
  pageHeight: number,
): number {
  const clampedU = Math.max(0, Math.min(1, u));

  // 1. Central binding gutter dip: page dips gently into the spine binding
  // Dips down by 0.010 units at u=0, smoothly leveling off to 0 by u=0.20
  const gutterWidth = 0.20;
  const gutterFactor = Math.max(0, 1 - clampedU / gutterWidth);
  const gutterDip = -0.010 * gutterFactor * gutterFactor;

  // 2. Subtle fore-edge lift: loose outer page relaxes slightly upward (0.0035 units)
  const liftStart = 0.80;
  const liftFactor = Math.max(0, (clampedU - liftStart) / (1 - liftStart));
  const edgeLift = 0.0035 * liftFactor * liftFactor;

  // 3. Subtle organic corner flex at top and bottom margins (max 0.001 units)
  const normY = pageHeight > 0 ? Math.abs(y) / (pageHeight / 2) : 0;
  const cornerFlex = 0.001 * normY * normY * clampedU;

  return gutterDip + edgeLift + cornerFlex;
}

/**
 * Generates an isometric subdivided plane geometry with natural binding gutter
 * curvature and subtle outer edge lift, with strictly uniform UV mapping
 * to guarantee zero photo distortion or stretched typography.
 *
 * @param pageWidth Width of a single page
 * @param pageHeight Height of a single page
 * @param side "left" (Verso: gutter at right x=0) | "right" (Recto: gutter at left x=0)
 * @param segmentsX Subdivisions along width (default 32)
 * @param segmentsY Subdivisions along height (default 8)
 */
export function createCurvedStationaryPageGeometry(
  pageWidth: number,
  pageHeight: number,
  side: "left" | "right",
  segmentsX = 32,
  segmentsY = 8,
): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const vertexCount = (segmentsX + 1) * (segmentsY + 1);
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices: number[] = [];

  const isRight = side === "right";
  let posPtr = 0;
  let uvPtr = 0;

  for (let j = 0; j <= segmentsY; j++) {
    const v = 1 - j / segmentsY; // 1 at top, 0 at bottom
    const y = (v - 0.5) * pageHeight;

    for (let i = 0; i <= segmentsX; i++) {
      const u = i / segmentsX; // 0 at left edge of mesh, 1 at right edge of mesh

      let x: number;
      let distFromGutter: number;
      let uvU: number;

      if (isRight) {
        // Right page (Recto):
        // x goes from 0 (gutter) to +pageWidth (fore-edge)
        x = u * pageWidth;
        distFromGutter = u;
        uvU = u; // UV 0 at gutter (left), 1 at fore-edge (right)
      } else {
        // Left page (Verso):
        // x goes from -pageWidth (fore-edge) to 0 (gutter)
        x = (u - 1) * pageWidth;
        distFromGutter = 1 - u; // 0 at gutter (x=0), 1 at fore-edge (x=-pageWidth)
        uvU = u; // UV 0 at fore-edge (left), 1 at gutter (right)
      }

      const z = computePageCurvatureElevation(distFromGutter, y, pageHeight);

      positions[posPtr] = x;
      positions[posPtr + 1] = y;
      positions[posPtr + 2] = z;
      posPtr += 3;

      uvs[uvPtr] = uvU;
      uvs[uvPtr + 1] = v;
      uvPtr += 2;
    }
  }

  // Generate triangle strip indices
  for (let j = 0; j < segmentsY; j++) {
    for (let i = 0; i < segmentsX; i++) {
      const p1 = j * (segmentsX + 1) + i;
      const p2 = p1 + 1;
      const p3 = (j + 1) * (segmentsX + 1) + i;
      const p4 = p3 + 1;

      // Two triangles per quad
      indices.push(p1, p3, p2);
      indices.push(p2, p3, p4);
    }
  }

  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

