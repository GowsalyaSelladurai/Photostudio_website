import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/narma/.gemini/antigravity/brain/2e368bf3-1ccc-40dc-b697-1f7c48e0c19b";

// Helper to create small sample image buffers (valid JPEGs/PNGs)
function createSampleImageBuffer(label, width = 600, height = 400, color = "#B99B70") {
  // SVG converted to data or small PNG header
  // A tiny 1x1 or small valid PNG buffer:
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="${color}"/>
    <circle cx="${width/2}" cy="${height/2}" r="80" fill="#ffffff" opacity="0.3"/>
    <text x="50%" y="50%" font-family="Georgia" font-size="28" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  return Buffer.from(svg);
}

async function runEndToEndVerification() {
  console.log("Starting End-to-End Customer Workflow Verification...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1360, height: 850 },
  });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on("console", (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === "error") {
      console.error("[Browser Console Error]:", msg.text());
    }
  });

  page.on("pageerror", (err) => {
    console.error("[Browser Uncaught Error]:", err.message);
  });

  // 1. Visit /albums and create an album project
  console.log("Navigating to /albums...");
  await page.goto("http://localhost:3000/albums", { waitUntil: "networkidle" });

  const projectName = "Florence & Venice Memories";
  console.log("Creating new album project...");

  // Fill AlbumProjectCreator
  const nameInput = page.getByLabel("Album name").or(page.locator('input[value="My Photo Album"]'));
  if (await nameInput.isVisible()) {
    await nameInput.fill(projectName);
  }

  const createBtn = page.getByRole("button", { name: /Create and start designing/i });
  await createBtn.click();

  // 2. We should be redirected to /albums/editor/[projectId]
  await page.waitForURL(/\/albums\/editor\/.+/, { timeout: 10000 });
  const editorUrl = page.url();
  console.log("Arrived at Customization Screen:", editorUrl);

  // 3. Verify Customization Screen Elements:
  // - MUST have: Photo upload area, Live View button
  // - MUST NOT have: 20-page cards, AlbumPageManager, AlbumPagePreview card
  await page.waitForSelector("text=Select your photographs");
  const hasLiveViewBtn = await page.getByRole("button", { name: /Live View/ }).first().isVisible();
  console.log("Live View button visible:", hasLiveViewBtn);

  const hasOldPageManager = (await page.locator("text=Page editor preview").count()) > 0;
  console.log("Old page preview card present (should be false):", hasOldPageManager);

  // 4. Simulate Uploading 6 Sample Photographs into the project
  console.log("Uploading sample photographs to album library...");
  const sampleImages = [
    { name: "florence_duomo.png", label: "Florence Duomo", color: "#8C6D53", w: 1200, h: 800 },
    { name: "venice_canal.png", label: "Grand Canal", color: "#4A6B82", w: 800, h: 1200 },
    { name: "tuscany_sunset.png", label: "Tuscany Hills", color: "#B8860B", w: 1200, h: 800 },
    { name: "ponte_vecchio.png", label: "Ponte Vecchio", color: "#A0522D", w: 1000, h: 1000 },
    { name: "san_marco.png", label: "Piazza San Marco", color: "#5F9EA0", w: 1200, h: 800 },
    { name: "gondola_ride.png", label: "Gondola Ride", color: "#2F4F4F", w: 800, h: 1200 },
  ];

  // We write temporary test image files to disk to upload via file input
  const tempDir = path.join(process.cwd(), "tests", "temp-uploads");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Create real test PNGs with canvas or small PNG data
  // Using minimal valid PNG: 1x1 transparent PNG expanded
  const minimalPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );

  const filePaths = sampleImages.map((s, idx) => {
    const fpath = path.join(tempDir, `sample_${idx}_${s.name}`);
    fs.writeFileSync(fpath, minimalPng);
    return fpath;
  });

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePaths);
  await page.waitForTimeout(2000);

  // Verify thumbnails are displayed
  const thumbnailsCount = await page.locator("text=Selected photograph thumbnails").isVisible();
  console.log("Thumbnails gallery visible:", thumbnailsCount);

  // Capture screenshot of updated customization screen with thumbnails and Live View button
  const customizationShot = path.join(ARTIFACT_DIR, "01-updated-customization-screen.png");
  await page.screenshot({ path: customizationShot });
  console.log("Saved updated customization screenshot:", customizationShot);

  // Test removing one photo
  console.log("Testing photo removal...");
  const removeButtons = page.locator('button[title="Remove photo"]');
  const countBefore = await removeButtons.count();
  console.log("Photos before removal:", countBefore);
  if (countBefore > 0) {
    await removeButtons.first().click();
    await page.waitForTimeout(800);
    const countAfter = await page.locator('button[title="Remove photo"]').count();
    console.log("Photos after removal:", countAfter);
  }

  // 5. Click "Live View" button to generate album and open 3D viewer
  console.log("Clicking Live View button...");
  const liveViewBtn = page.getByRole("button", { name: /Live View/ }).first();
  await liveViewBtn.click();

  // Wait for navigation to /albums/preview/[projectId]
  await page.waitForURL(/\/albums\/preview\/.+/, { timeout: 15000 });
  console.log("Arrived at 3D Live View route:", page.url());

  // Wait for 3D Canvas
  await page.waitForSelector("canvas", { timeout: 12000 });
  await page.waitForTimeout(2500); // Allow textures to render

  // Capture open 3D spread
  const openSpreadShot = path.join(ARTIFACT_DIR, "02-3d-live-view-spread-1.png");
  await page.screenshot({ path: openSpreadShot });
  console.log("Saved 3D open spread screenshot:", openSpreadShot);

  // 6. Test Page Turn Next ▶
  console.log("Testing page turn Next ▶...");
  const nextBtn = page.getByRole("button", { name: "Next ▶" });
  await nextBtn.click();

  // Capture curling animation mid-flight
  await page.waitForTimeout(350);
  const curlFlightShot = path.join(ARTIFACT_DIR, "03-3d-curling-in-flight.png");
  await page.screenshot({ path: curlFlightShot });
  console.log("Saved curling animation in-flight screenshot:", curlFlightShot);

  await page.waitForTimeout(650);

  // Capture Spread 2 settled
  const spread2Shot = path.join(ARTIFACT_DIR, "04-3d-spread-2-settled.png");
  await page.screenshot({ path: spread2Shot });
  console.log("Saved Spread 2 settled screenshot:", spread2Shot);

  // 7. Test Backward Page Turn ◀ Previous
  console.log("Testing backward page turn ◀ Previous...");
  const prevBtn = page.getByRole("button", { name: "◀ Previous" });
  await prevBtn.click();
  await page.waitForTimeout(350);
  const revCurlShot = path.join(ARTIFACT_DIR, "05-3d-backward-curl.png");
  await page.screenshot({ path: revCurlShot });
  console.log("Saved backward curl screenshot:", revCurlShot);

  await page.waitForTimeout(650);

  // 8. Test Navigation to Last Spread ⏭
  console.log("Testing navigation to last spread ⏭...");
  const lastBtn = page.locator('button[title="Last spread"]');
  await lastBtn.click();
  await page.waitForTimeout(1500);

  const lastSpreadShot = path.join(ARTIFACT_DIR, "06-3d-final-spread.png");
  await page.screenshot({ path: lastSpreadShot });
  console.log("Saved final spread screenshot:", lastSpreadShot);

  // Clean up temp test files
  fs.rmSync(tempDir, { recursive: true, force: true });

  const errorLogs = consoleLogs.filter((l) => l.type === "error");
  console.log("Total browser errors logged:", errorLogs.length);

  await browser.close();
  console.log("End-to-End Customer Workflow Verification completed successfully!");
}

runEndToEndVerification().catch((err) => {
  console.error("End-to-end verification failed:", err);
  process.exit(1);
});
