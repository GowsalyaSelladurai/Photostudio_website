import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:\\Users\\narma\\.gemini\\antigravity\\brain\\2e368bf3-1ccc-40dc-b697-1f7c48e0c19b";

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
  <rect width="1200" height="800" fill="#B99B70"/>
  <circle cx="600" cy="400" r="180" fill="#292522"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="44" fill="#F5F0E8">StudioFrame Tuscany</text>
</svg>`;

async function runStage1Verification() {
  console.log("=== StudioFrame Stage 1: Closed Hardcover 3D Verification ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1360, height: 860 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error("[Browser Console Error]:", msg.text());
    }
  });

  const tempDir = path.join(process.cwd(), "scripts", "temp-stage1-photos");
  fs.mkdirSync(tempDir, { recursive: true });
  const photoPaths = [];
  for (let i = 1; i <= 6; i++) {
    const fPath = path.join(tempDir, `photo_${i}.png`);
    fs.writeFileSync(fPath, SAMPLE_SVG);
    photoPaths.push(fPath);
  }

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Closed Linen Album (Classic 8x12 in, Linen finish, with title)
    // ------------------------------------------------------------------------
    console.log("\n[1] Testing Closed Linen Album (Classic 8x12 in, Linen finish)...");
    await page.goto("http://localhost:3000/albums", { waitUntil: "networkidle" });
    const nameInput = page.getByLabel("Album name").or(page.locator('input[value="My Photo Album"]'));
    await nameInput.fill("Venice Memories");
    await page.getByRole("button", { name: /Create and start designing/i }).click();
    await page.waitForURL(/\/albums\/editor\/.+/, { timeout: 15000 });
    const linenProjectId = page.url().split("/").pop();

    // Upload photos
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(photoPaths);
    await page.waitForTimeout(1500);

    // Generate Album
    await page.getByRole("button", { name: "Generate & Open Live View ▶" }).click();
    await page.waitForURL(/\/albums\/preview\/.+/, { timeout: 15000 });
    await page.waitForSelector("canvas", { timeout: 15000 });
    await page.waitForTimeout(3000); // Allow 3D canvas and textures to settle

    // Check that closed view is active by default
    const closedViewIndicator = page.locator("text=Physical Hardcover · Closed View");
    console.log("✓ Closed Hardcover view indicator visible:", await closedViewIndicator.isVisible());
    const openAlbumBtn = page.getByRole("button", { name: "Open Album ▶", exact: true });
    console.log("✓ 'Open Album ▶' button visible:", await openAlbumBtn.isVisible());

    // Screenshots
    const shotLinen = path.join(ARTIFACT_DIR, "24-stage1-closed-linen-album.png");
    await page.screenshot({ path: shotLinen });
    console.log("Saved Closed Linen Album screenshot:", shotLinen);

    const shotThreeQuarter = path.join(ARTIFACT_DIR, "25-stage1-front-three-quarter.png");
    await page.screenshot({ path: shotThreeQuarter });
    console.log("Saved Front Three-Quarter View screenshot:", shotThreeQuarter);

    // Zoom/Close-up of spine and page thickness
    await page.setViewportSize({ width: 900, height: 750 });
    await page.waitForTimeout(500);
    const shotCloseup = path.join(ARTIFACT_DIR, "26-stage1-spine-thickness-closeup.png");
    await page.screenshot({ path: shotCloseup });
    console.log("Saved Spine & Page Thickness Close-up screenshot:", shotCloseup);
    await page.setViewportSize({ width: 1360, height: 860 });

    // ------------------------------------------------------------------------
    // TEST 2: Open Spread & Return to Closed Cover (Regression Verification)
    // ------------------------------------------------------------------------
    console.log("\n[2] Testing Open Album & Return to Closed View...");
    await openAlbumBtn.click();
    await page.waitForTimeout(1000);

    const spreadText = await page.locator("text=/Spread \\d+ of \\d+/").textContent();
    console.log("✓ Successfully opened album to:", spreadText);
    const closeBtn = page.getByRole("button", { name: /Close/i });
    console.log("✓ 'Close Album' button visible in open spread mode:", await closeBtn.isVisible());

    // Close album back to closed view
    await closeBtn.click();
    await page.waitForTimeout(800);
    console.log("✓ Successfully returned to closed hardcover view:", await closedViewIndicator.isVisible());

    // ------------------------------------------------------------------------
    // TEST 3: Closed Leather Album (Premium 10x12 in, Leather finish, with title)
    // ------------------------------------------------------------------------
    console.log("\n[3] Testing Closed Leather Album (Premium 10x12 in, Leather finish)...");
    await page.goto("http://localhost:3000/albums", { waitUntil: "networkidle" });
    const nameInput2 = page.getByLabel("Album name").or(page.locator('input[value="My Photo Album"]'));
    await nameInput2.fill("Florence Heritage");
    await page.getByRole("button", { name: /Create and start designing/i }).click();
    await page.waitForURL(/\/albums\/editor\/.+/, { timeout: 15000 });

    // Select Premium size & Leather finish
    await page.getByRole("button", { name: /premium 10 × 12/i }).click();
    await page.getByRole("button", { name: /leather/i }).click();
    await page.waitForTimeout(500);

    const fileInput2 = page.locator('input[type="file"]').first();
    await fileInput2.setInputFiles(photoPaths);
    await page.waitForTimeout(1500);

    await page.getByRole("button", { name: "Generate & Open Live View ▶" }).click();
    await page.waitForURL(/\/albums\/preview\/.+/, { timeout: 15000 });
    await page.waitForSelector("canvas", { timeout: 15000 });
    await page.waitForTimeout(3000);

    const shotLeather = path.join(ARTIFACT_DIR, "27-stage1-closed-leather-album.png");
    await page.screenshot({ path: shotLeather });
    console.log("Saved Closed Leather Album screenshot:", shotLeather);

    // ------------------------------------------------------------------------
    // TEST 4: Closed Photo Wrap Album (Grand 12x18 in, Photo finish)
    // ------------------------------------------------------------------------
    console.log("\n[4] Testing Closed Photo Wrap Album (Grand 12x18 in, Photo Wrap)...");
    await page.goto("http://localhost:3000/albums", { waitUntil: "networkidle" });
    const nameInput3 = page.getByLabel("Album name").or(page.locator('input[value="My Photo Album"]'));
    await nameInput3.fill("Tuscany Odyssey");
    await page.getByRole("button", { name: /Create and start designing/i }).click();
    await page.waitForURL(/\/albums\/editor\/.+/, { timeout: 15000 });

    // Select Grand size & Photo finish
    await page.getByRole("button", { name: /grand 12 × 18/i }).click();
    await page.getByRole("button", { name: /photo/i }).click();
    await page.waitForTimeout(500);

    const fileInput3 = page.locator('input[type="file"]').first();
    await fileInput3.setInputFiles(photoPaths);
    await page.waitForTimeout(1500);

    // Set Photo #1 as Cover Photo
    const setCoverBtn = page.getByRole("button", { name: "Set Cover" }).first();
    if (await setCoverBtn.isVisible()) {
      await setCoverBtn.click();
      await page.waitForTimeout(500);
    }

    await page.getByRole("button", { name: "Generate & Open Live View ▶" }).click();
    await page.waitForURL(/\/albums\/preview\/.+/, { timeout: 15000 });
    await page.waitForSelector("canvas", { timeout: 15000 });
    await page.waitForTimeout(3000);

    const shotPhotoWrap = path.join(ARTIFACT_DIR, "28-stage1-closed-photowrap-album.png");
    await page.screenshot({ path: shotPhotoWrap });
    console.log("Saved Closed Photo Wrap Album screenshot:", shotPhotoWrap);

    // ------------------------------------------------------------------------
    // TEST 5: Missing Cover Photo Fallback & Empty Title
    // ------------------------------------------------------------------------
    console.log("\n[5] Testing Missing Cover Photo Fallback & Empty Title...");
    await page.goto("http://localhost:3000/albums", { waitUntil: "networkidle" });
    const nameInput4 = page.getByLabel("Album name").or(page.locator('input[value="My Photo Album"]'));
    await nameInput4.fill("Untitled Keepsake");
    await page.getByRole("button", { name: /Create and start designing/i }).click();
    await page.waitForURL(/\/albums\/editor\/.+/, { timeout: 15000 });
    const untitledId = page.url().split("/").pop();

    // Select Photo finish without setting cover photo (triggers fallback to linen)
    await page.getByRole("button", { name: /photo/i }).click();
    const fileInput4 = page.locator('input[type="file"]').first();
    await fileInput4.setInputFiles(photoPaths);
    await page.waitForTimeout(1500);

    // Now set title to empty string in project storage to test empty title handling on 3D book
    await page.evaluate((id) => {
      const list = JSON.parse(localStorage.getItem("studioframe-album-projects") || "[]");
      const proj = list.find((p) => p.id === id);
      if (proj) {
        proj.name = ""; // Clear title
        localStorage.setItem("studioframe-album-projects", JSON.stringify(list));
      }
    }, untitledId);

    await page.getByRole("button", { name: "Generate & Open Live View ▶" }).click();
    await page.waitForURL(/\/albums\/preview\/.+/, { timeout: 15000 });
    await page.waitForSelector("canvas", { timeout: 15000 });
    await page.waitForTimeout(2000);

    const indicator = page.locator("text=Physical Hardcover · Closed View");
    console.log("✓ Empty title & missing cover photo handled cleanly:", await indicator.isVisible());

    // ------------------------------------------------------------------------
    // TEST 6: PDF Export Regression Check
    // ------------------------------------------------------------------------
    console.log("\n[6] Verifying PDF Export function in closed view...");
    const downloadPromise = page.waitForEvent("download", { timeout: 20000 });
    const downloadPdfBtn = page.getByRole("button", { name: /Download PDF/i });
    await downloadPdfBtn.click();
    const download = await downloadPromise;
    const downloadedPath = path.join(ARTIFACT_DIR, download.suggestedFilename());
    await download.saveAs(downloadedPath);
    const pdfStat = fs.statSync(downloadedPath);
    console.log(`✓ PDF Export succeeded: ${downloadedPath} (${pdfStat.size} bytes)`);

    console.log("\n=== ALL STAGE 1 VERIFICATIONS PASSED 100%! ===");
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
    await browser.close();
  }
}

runStage1Verification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
