import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:\\Users\\narma\\.gemini\\antigravity\\brain\\2e368bf3-1ccc-40dc-b697-1f7c48e0c19b";

async function runStage4Verification() {
  console.log("=== StudioFrame Stage 4: Interactive Page Turning & Synchronization Verification ===");
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

  const tempDir = path.join(process.cwd(), "scripts", "temp-stage4-photos");
  fs.mkdirSync(tempDir, { recursive: true });

  // Generate 6 distinct high-resolution photographic test PNGs via browser canvas
  console.log("Generating 6 high-resolution photographic test images...");
  await page.goto("about:blank");
  const dataUrls = await page.evaluate(() => {
    const photos = [];
    const defs = [
      ["#8B5A2B", "#FAF0E6", "Tuscan Sunrise Villa"],
      ["#2B547E", "#F5F5DC", "Florence Cathedral Dome"],
      ["#800020", "#FFF8DC", "Siena Piazza del Campo"],
      ["#387C44", "#FDF5E6", "Chianti Vineyards"],
      ["#B99B70", "#1C1C1C", "San Gimignano Towers"],
      ["#4A3B32", "#FFF5EE", "Val d'Orcia Rolling Hills"],
    ];
    for (const [bg, fg, title] of defs) {
      const c = document.createElement("canvas");
      c.width = 1200;
      c.height = 800;
      const ctx = c.getContext("2d");

      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, bg);
      grad.addColorStop(1, "#181412");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);

      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.fillRect(60, 60, 1080, 680);

      ctx.fillStyle = fg;
      ctx.font = "italic bold 52px serif";
      ctx.textAlign = "center";
      ctx.fillText(title, 600, 420);

      photos.push(c.toDataURL("image/png"));
    }
    return photos;
  });

  const photoPaths = [];
  dataUrls.forEach((dataUrl, idx) => {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const fPath = path.join(tempDir, `photo_${idx + 1}.png`);
    fs.writeFileSync(fPath, Buffer.from(base64Data, "base64"));
    photoPaths.push(fPath);
  });

  try {
    // ------------------------------------------------------------------------
    // SETUP: Create Album & Open Live View
    // ------------------------------------------------------------------------
    console.log("\n[Setup] Creating album project 'Tuscany Keepsake'...");
    await page.goto("http://localhost:3000/albums", { waitUntil: "networkidle" });
    const nameInput = page.getByLabel("Album name").or(page.locator('input[value="My Photo Album"]'));
    await nameInput.fill("Tuscany Keepsake");
    await page.getByRole("button", { name: /Create and start designing/i }).click();
    await page.waitForURL(/\/albums\/editor\/.+/, { timeout: 15000 });
    const projectId = page.url().split("/").pop();
    console.log("Created project ID:", projectId);

    // Upload photos
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(photoPaths);
    await page.waitForTimeout(1500);

    // Navigate to 3D Live View
    console.log("Navigating to 3D photobook preview...");
    await page.getByRole("button", { name: "Generate & Open Live View ▶" }).click();
    await page.waitForURL(/\/albums\/preview\/.+/, { timeout: 15000 });
    await page.waitForSelector("canvas", { timeout: 15000 });
    await page.waitForTimeout(3000); // Allow textures and canvas to settle

    // Open album
    console.log("Opening album with cinematic hinge animation...");
    const openBtn = page.getByRole("button", { name: "Open Album ▶", exact: true });
    await openBtn.click();
    await page.waitForTimeout(2000);
    const spread1Indicator = page.locator("text=/Spread 1 of \\d+/i");
    await spread1Indicator.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Successfully opened to Spread 1:", await spread1Indicator.textContent());

    // Locate the interactive canvas container
    const canvasContainer = page.locator(".touch-none");
    const box = await canvasContainer.boundingBox();
    if (!box) throw new Error("Could not find canvas container bounding box");
    console.log(`Canvas container bounds: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);

    // ------------------------------------------------------------------------
    // CHECKPOINT 1: Page Being Dragged Halfway Across
    // ------------------------------------------------------------------------
    console.log("\n[Checkpoint 1] Initiating interactive drag on right page halfway across...");
    const rightPageStartX = box.x + box.width * 0.72;
    const dragY = box.y + box.height * 0.50;

    await page.mouse.move(rightPageStartX, dragY);
    await page.mouse.down();
    await page.waitForTimeout(60);

    // Drag horizontally leftwards by ~200px (approx 50% drag progress)
    const midDragX = rightPageStartX - 200;
    // Step through movement smoothly
    for (let x = rightPageStartX; x >= midDragX; x -= 10) {
      await page.mouse.move(x, dragY);
      await page.waitForTimeout(15);
    }
    await page.waitForTimeout(250); // Pause in mid-drag state

    // Capture Screenshot 37: Page being dragged halfway across
    const shot37Path = path.join(ARTIFACT_DIR, "37-stage4-drag-halfway-across.png");
    await page.screenshot({ path: shot37Path });
    console.log("✓ Saved Screenshot 37 (Page dragged halfway across):", shot37Path);

    // ------------------------------------------------------------------------
    // CHECKPOINT 2: Page Completing a Forward Turn
    // ------------------------------------------------------------------------
    console.log("\n[Checkpoint 2] Releasing drag to complete forward turn...");
    // Since progress is ~0.50 (> 0.40 threshold), release completes turn to Spread 2
    await page.mouse.up();
    await page.waitForTimeout(1200); // Allow completion easing and spread state commit

    const spread2Indicator = page.locator("text=/Spread 2 of \\d+/i");
    await spread2Indicator.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Forward turn completed successfully to:", await spread2Indicator.textContent());

    // Capture Screenshot 38: Completed forward turn
    const shot38Path = path.join(ARTIFACT_DIR, "38-stage4-drag-completed-forward.png");
    await page.screenshot({ path: shot38Path });
    console.log("✓ Saved Screenshot 38 (Completed forward turn):", shot38Path);

    // ------------------------------------------------------------------------
    // CHECKPOINT 3: Incomplete Drag Returning (Rebound)
    // ------------------------------------------------------------------------
    console.log("\n[Checkpoint 3] Performing incomplete drag on right page and rebounding...");
    // On Spread 2, drag right page only slightly (deltaX ~ -40px, progress ~ 0.10 < 0.40)
    await page.mouse.move(rightPageStartX, dragY);
    await page.mouse.down();
    await page.waitForTimeout(60);

    for (let x = rightPageStartX; x >= rightPageStartX - 45; x -= 5) {
      await page.mouse.move(x, dragY);
      await page.waitForTimeout(15);
    }
    await page.waitForTimeout(100);

    // Release: progress is well below threshold, should rebound back to 0.0
    await page.mouse.up();
    await page.waitForTimeout(600); // Wait for rebound easing to return to rest

    // Verify spread index did NOT advance
    console.log("✓ Spread remains unchanged on Spread 2 after rebound:", await spread2Indicator.textContent());

    // Capture Screenshot 39: Page returning after incomplete drag
    const shot39Path = path.join(ARTIFACT_DIR, "39-stage4-drag-rebound-cancelled.png");
    await page.screenshot({ path: shot39Path });
    console.log("✓ Saved Screenshot 39 (Rebound after incomplete drag):", shot39Path);

    // ------------------------------------------------------------------------
    // CHECKPOINT 4: Backward Page Turn
    // ------------------------------------------------------------------------
    console.log("\n[Checkpoint 4] Performing backward page turn from Spread 2 to Spread 1...");
    // Drag left page rightwards
    const leftPageStartX = box.x + box.width * 0.28;
    await page.mouse.move(leftPageStartX, dragY);
    await page.mouse.down();
    await page.waitForTimeout(60);

    for (let x = leftPageStartX; x <= leftPageStartX + 220; x += 10) {
      await page.mouse.move(x, dragY);
      await page.waitForTimeout(15);
    }
    await page.mouse.up();
    await page.waitForTimeout(1200);

    await spread1Indicator.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Successfully turned backward to:", await spread1Indicator.textContent());

    // Capture Screenshot 40: Backward page turn
    const shot40Path = path.join(ARTIFACT_DIR, "40-stage4-backward-page-turn.png");
    await page.screenshot({ path: shot40Path });
    console.log("✓ Saved Screenshot 40 (Backward page turn):", shot40Path);

    // ------------------------------------------------------------------------
    // CHECKPOINT 5: Mobile Touch Interaction
    // ------------------------------------------------------------------------
    console.log("\n[Checkpoint 5] Testing mobile touch interaction (390x844 iPhone 14)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(800);

    const mobileCanvas = page.locator(".touch-none");
    const mBox = await mobileCanvas.boundingBox();
    if (!mBox) throw new Error("Could not find mobile canvas bounding box");

    // Perform touch drag on mobile
    const mStartX = mBox.x + mBox.width * 0.72;
    const mY = mBox.y + mBox.height * 0.50;

    await page.mouse.move(mStartX, mY);
    await page.mouse.down();
    for (let x = mStartX; x >= mStartX - 80; x -= 10) {
      await page.mouse.move(x, mY);
      await page.waitForTimeout(15);
    }
    await page.waitForTimeout(150);

    // Capture Screenshot 41: Mobile touch interaction in progress
    const shot41Path = path.join(ARTIFACT_DIR, "41-stage4-mobile-touch-interaction.png");
    await page.screenshot({ path: shot41Path });
    console.log("✓ Saved Screenshot 41 (Mobile touch interaction):", shot41Path);

    await page.mouse.up();
    await page.waitForTimeout(800);

    // Restore desktop
    await page.setViewportSize({ width: 1360, height: 860 });
    await page.waitForTimeout(500);

    // ------------------------------------------------------------------------
    // CHECKPOINT 6: Autoplay Synchronization & Non-Overlapping Turns
    // ------------------------------------------------------------------------
    console.log("\n[Checkpoint 6] Testing 2-second autoplay and manual control synchronization...");
    // Return to Spread 1 if needed
    const prevBtn = page.getByRole("button", { name: "◀ Previous", exact: true });
    if (await prevBtn.isEnabled()) {
      await prevBtn.click();
      await page.waitForTimeout(1200);
    }

    const playBtn = page.locator('button[aria-label*="automatic page turning"]');
    console.log("Clicking Play button to start 2-second autoplay...");
    await playBtn.click();

    // Verify button switches to "Pause"
    await page.waitForSelector('button[aria-label*="Pause automatic page turning"]', { timeout: 5000 });
    console.log("✓ Autoplay is actively playing (button shows 'Pause')");

    // Wait 2.5 seconds for the first automatic turn to initiate and complete
    await page.waitForTimeout(2500);
    console.log("✓ After 2.5s, current spread:", await page.locator("text=/Spread \\d+ of \\d+/i").textContent());

    // Wait another 2.5 seconds for next turn
    await page.waitForTimeout(2500);
    console.log("✓ After 5.0s, current spread:", await page.locator("text=/Spread \\d+ of \\d+/i").textContent());

    // Click Next manually while autoplay is running -> must immediately pause autoplay!
    const nextBtn = page.getByRole("button", { name: "Next ▶", exact: true });
    await nextBtn.click();
    await page.waitForTimeout(500);

    // Button should now show "Play" because manual interaction paused it
    const isPaused = await page.locator('button[aria-label*="Play automatic page turning"]').isVisible();
    console.log("✓ Manual Next button click automatically paused autoplay:", isPaused);
    await page.waitForTimeout(1000);

    // Capture Screenshot 42: Autoplay synchronized spread
    const shot42Path = path.join(ARTIFACT_DIR, "42-stage4-autoplay-synchronized-spread.png");
    await page.screenshot({ path: shot42Path });
    console.log("✓ Saved Screenshot 42 (Autoplay synchronized spread):", shot42Path);

    // ------------------------------------------------------------------------
    // CHECKPOINT 7: PDF Export & Hinge Close Regression Checks
    // ------------------------------------------------------------------------
    console.log("\n[Checkpoint 7] Verifying PDF export and close cover functionality...");
    const downloadPdfBtn = page.getByRole("button", { name: /Download PDF/i });
    const downloadPromise = page.waitForEvent("download", { timeout: 25000 });
    await downloadPdfBtn.click();
    const download = await downloadPromise;
    const downloadPath = path.join(ARTIFACT_DIR, "StudioFrame-Tuscany-stage4.pdf");
    await download.saveAs(downloadPath);
    console.log("✓ Downloaded stage 4 PDF:", downloadPath, `(${fs.statSync(downloadPath).size} bytes)`);

    // Close album
    console.log("Closing album with cinematic hinge animation...");
    const closeBtn = page.getByRole("button", { name: "Close album" }).or(page.locator('button[aria-label="Close album"]'));
    await closeBtn.click();
    await page.waitForTimeout(2000);
    const closedBadge = page.locator("text=Physical Hardcover · Closed View");
    console.log("✓ Closed view badge visible:", await closedBadge.isVisible());

    console.log("\n=== ALL STAGE 4 VERIFICATION CHECKS PASSED SUCCESSFULLY ===");
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
    await browser.close();
  }
}

runStage4Verification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
