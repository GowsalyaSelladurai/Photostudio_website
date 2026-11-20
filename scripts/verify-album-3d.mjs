import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/narma/.gemini/antigravity/brain/2e368bf3-1ccc-40dc-b697-1f7c48e0c19b";

async function verifyAlbum3D() {
  console.log("Launching browser via Playwright (channel: chrome)...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on("console", (msg) => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === "error") {
      console.error("[Browser Console Error]:", text);
    }
  });

  page.on("pageerror", (err) => {
    console.error("[Browser Uncaught Error]:", err.message);
  });

  console.log("Navigating to http://localhost:3000/albums...");
  await page.goto("http://localhost:3000/albums", { waitUntil: "networkidle" });

  // Generate mock project data in localStorage with 20 pages across different layouts
  const projectId = "test-photobook-3d-" + Date.now();
  const mockProject = {
    id: projectId,
    name: "Heritage & Memories",
    sizeId: "classic",
    pageCount: 20,
    orientation: "portrait",
    coverFinish: "linen",
    coverPhotoId: null,
    photos: [],
    pages: Array.from({ length: 20 }, (_, i) => {
      const layouts = ["single", "two-photo", "three-photo", "four-grid", "collage", "full-bleed"];
      return {
        id: `page-${i + 1}`,
        layout: layouts[i % layouts.length],
        photos: [],
        texts: [
          {
            id: `text-${i + 1}`,
            text: `Chapter ${Math.floor(i / 2) + 1} · Page ${i + 1}`,
            x: 50,
            y: 88,
            fontSize: 16,
            rotation: 0,
            fontFamily: "elegant",
            color: "#6E5B4B",
          },
        ],
        background: i % 2 === 0 ? "#F5F0E8" : "#EDE7DD",
        frameStyle: "thin",
        photoSpacing: "balanced",
      };
    }),
    currentPageIndex: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await page.evaluate((proj) => {
    const existing = JSON.parse(localStorage.getItem("studioframe-album-projects") || "[]");
    existing.push(proj);
    localStorage.setItem("studioframe-album-projects", JSON.stringify(existing));
  }, mockProject);

  console.log(`Navigating to preview: http://localhost:3000/albums/preview/${projectId}...`);
  await page.goto(`http://localhost:3000/albums/preview/${projectId}`, { waitUntil: "networkidle" });

  // Wait for canvas to appear
  await page.waitForSelector("canvas", { timeout: 10000 });
  await page.waitForTimeout(2000); // Allow textures to render

  // 1. Initial State Screenshot (Spread 1 of 10)
  const initialShot = path.join(ARTIFACT_DIR, "01-3d-book-spread-1.png");
  await page.screenshot({ path: initialShot });
  console.log("Saved initial spread screenshot:", initialShot);

  // 2. Click "Next ▶" to start curling page turn animation
  console.log("Triggering Next page turn...");
  const nextBtn = page.getByRole("button", { name: "Next ▶" });
  await nextBtn.click();

  // Capture midpoint of curl (approx 350ms into 750ms animation)
  await page.waitForTimeout(350);
  const curlingShot = path.join(ARTIFACT_DIR, "02-3d-book-curling-animation.png");
  await page.screenshot({ path: curlingShot });
  console.log("Saved curling animation screenshot:", curlingShot);

  // Wait for animation to finish
  await page.waitForTimeout(600);
  const spread2Shot = path.join(ARTIFACT_DIR, "03-3d-book-spread-2.png");
  await page.screenshot({ path: spread2Shot });
  console.log("Saved Spread 2 screenshot:", spread2Shot);

  // 3. Click "◀ Previous" to turn back
  console.log("Triggering Previous page turn...");
  const prevBtn = page.getByRole("button", { name: "◀ Previous" });
  await prevBtn.click();
  await page.waitForTimeout(350);
  const revCurlingShot = path.join(ARTIFACT_DIR, "04-3d-book-reverse-curl.png");
  await page.screenshot({ path: revCurlingShot });
  console.log("Saved reverse curling screenshot:", revCurlingShot);

  await page.waitForTimeout(600);

  // 4. Test Last Spread button (⏭)
  console.log("Navigating to last spread via ⏭...");
  const lastBtn = page.getByRole("button", { name: "Last spread" });
  await lastBtn.click();
  await page.waitForTimeout(1500);
  const lastSpreadShot = path.join(ARTIFACT_DIR, "05-3d-book-last-spread.png");
  await page.screenshot({ path: lastSpreadShot });
  console.log("Saved last spread screenshot:", lastSpreadShot);

  // 5. Test First Spread button (⏮)
  console.log("Navigating back to first spread via ⏮...");
  const firstBtn = page.getByRole("button", { name: "First spread" });
  await firstBtn.click();
  await page.waitForTimeout(1500);

  // Verify console errors
  const errors = consoleLogs.filter((l) => l.type === "error");
  console.log("Total browser console errors:", errors.length);

  await browser.close();
  console.log("Verification finished successfully!");
}

verifyAlbum3D().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
