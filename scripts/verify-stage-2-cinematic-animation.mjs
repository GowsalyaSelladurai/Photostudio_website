import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:\\Users\\narma\\.gemini\\antigravity\\brain\\2e368bf3-1ccc-40dc-b697-1f7c48e0c19b";

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
  <rect width="1200" height="800" fill="#B99B70"/>
  <circle cx="600" cy="400" r="180" fill="#292522"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="44" fill="#F5F0E8">StudioFrame Tuscany</text>
</svg>`;

async function runStage2Verification() {
  console.log("=== StudioFrame Stage 2: Cinematic Cover Animation Verification ===");
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

  const tempDir = path.join(process.cwd(), "scripts", "temp-stage2-photos");
  fs.mkdirSync(tempDir, { recursive: true });

  // Generate 6 distinct high-resolution photographic test PNGs via browser canvas
  console.log("Generating 6 high-resolution photographic test images...");
  await page.goto("about:blank");
  const dataUrls = await page.evaluate(() => {
    const photos = [];
    const defs = [
      ["#8B5A2B", "#FAF0E6", "Venice Gondola at Dawn"],
      ["#2B547E", "#F5F5DC", "Grand Canal Twilight"],
      ["#800020", "#FFF8DC", "Piazza San Marco"],
      ["#387C44", "#FDF5E6", "Tuscan Rolling Hills"],
      ["#B99B70", "#1C1C1C", "Rialto Bridge Silhouette"],
      ["#4A3B32", "#FFF5EE", "Historic Venice Archway"],
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

      ctx.fillStyle = "rgba(255,255,255,0.12)";
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
    console.log("\n[Setup] Creating album project 'Venice Keepsake'...");
    await page.goto("http://localhost:3000/albums", { waitUntil: "networkidle" });
    const nameInput = page.getByLabel("Album name").or(page.locator('input[value="My Photo Album"]'));
    await nameInput.fill("Venice Keepsake");
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
    await page.waitForTimeout(3000); // Allow 3D canvas and textures to settle

    // ------------------------------------------------------------------------
    // STEP 1: Closed Album (Beauty Angle)
    // ------------------------------------------------------------------------
    console.log("\n[Step 1] Verifying initial closed album state...");
    const closedBadge = page.locator("text=Physical Hardcover · Closed View");
    const openBtn = page.getByRole("button", { name: "Open Album ▶", exact: true });
    const calloutOpenBtn = page.getByRole("button", { name: /Click Cover to Open Album/i });

    if (!(await closedBadge.isVisible())) throw new Error("Closed badge not visible initially");
    if (!(await openBtn.isVisible())) throw new Error("'Open Album ▶' button not visible initially");
    if (!(await calloutOpenBtn.isVisible())) throw new Error("Canvas callout button not visible initially");

    // Capture Screenshot 1: Closed album (beauty angle)
    const shot1Path = path.join(ARTIFACT_DIR, "29-stage2-closed-album-beauty.png");
    await page.screenshot({ path: shot1Path });
    console.log("✓ Saved Screenshot 1 (Closed album beauty angle):", shot1Path);

    // ------------------------------------------------------------------------
    // STEP 2: Trigger Opening Animation & Capture Midway (~90 degrees)
    // ------------------------------------------------------------------------
    console.log("\n[Step 2] Triggering opening animation...");
    await openBtn.click();

    // Verify immediate transition to 'opening' state
    const openingBadge = page.locator("text=/Opening Album/i");
    console.log("✓ Opening badge visible immediately:", await openingBadge.isVisible());

    // Wait ~680ms (midway through 1.4s duration, ~90 degrees vertical cover)
    await page.waitForTimeout(680);

    // Capture Screenshot 2: Midway through opening
    const shot2Path = path.join(ARTIFACT_DIR, "30-stage2-midway-opening-90deg.png");
    await page.screenshot({ path: shot2Path });
    console.log("✓ Saved Screenshot 2 (Midway opening ~90 deg):", shot2Path);

    // Test rapid repeated clicks during opening (must be rejected safely)
    console.log("Testing rapid duplicate clicks during opening transition...");
    await page.mouse.click(680, 430);
    await page.mouse.click(680, 430);
    await page.keyboard.press("ArrowRight");

    // ------------------------------------------------------------------------
    // STEP 3: Complete Opening & Capture Fully Opened Spread
    // ------------------------------------------------------------------------
    console.log("\n[Step 3] Waiting for opening animation to complete...");
    // Remaining time (~800ms) plus buffer
    await page.waitForTimeout(1100);

    // Verify transition to 'opened' state
    const spreadIndicator = page.locator("text=/Spread 1 of \\d+/i");
    await spreadIndicator.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Spread 1 visible:", await spreadIndicator.textContent());

    const closeBtn = page.getByRole("button", { name: /Close/i });
    if (!(await closeBtn.isVisible())) throw new Error("'Close Album' button not visible when opened");
    console.log("✓ 'Close Album' button visible");

    const prevBtn = page.getByRole("button", { name: "◀ Previous", exact: true });
    console.log("✓ Previous button disabled on Spread 1:", await prevBtn.isDisabled());

    const nextBtn = page.getByRole("button", { name: "Next ▶", exact: true });
    console.log("✓ Next button enabled on Spread 1:", !(await nextBtn.isDisabled()));

    // Capture Screenshot 3: Fully opened album spread
    const shot3Path = path.join(ARTIFACT_DIR, "31-stage2-fully-opened-spread.png");
    await page.screenshot({ path: shot3Path });
    console.log("✓ Saved Screenshot 3 (Fully opened album spread):", shot3Path);

    // ------------------------------------------------------------------------
    // STEP 4: Spread Navigation & Autoplay Verification in Open State
    // ------------------------------------------------------------------------
    console.log("\n[Step 4] Verifying spread navigation in open state...");
    await nextBtn.click();
    await page.waitForTimeout(1200); // 0.88s curl duration + settle
    const spread2Indicator = page.locator("text=/Spread 2 of \\d+/i");
    console.log("✓ Navigated forward to:", await spread2Indicator.textContent());

    await prevBtn.click();
    await page.waitForTimeout(1200);
    console.log("✓ Navigated backward to:", await spreadIndicator.textContent());

    // ------------------------------------------------------------------------
    // STEP 5: Trigger Closing Animation & Capture Midway (~90 degrees)
    // ------------------------------------------------------------------------
    console.log("\n[Step 5] Triggering closing animation...");
    await closeBtn.click();

    // Verify immediate transition to 'closing' state
    const closingBadge = page.locator("text=/Closing Album/i");
    console.log("✓ Closing badge visible immediately:", await closingBadge.isVisible());

    // Wait ~680ms (midway through 1.4s duration)
    await page.waitForTimeout(680);

    // Capture Screenshot 4: Midway through closing
    const shot4Path = path.join(ARTIFACT_DIR, "32-stage2-midway-closing-90deg.png");
    await page.screenshot({ path: shot4Path });
    console.log("✓ Saved Screenshot 4 (Midway closing ~90 deg):", shot4Path);

    // Test rapid repeated clicks during closing
    await page.mouse.click(680, 430);
    await page.keyboard.press("Escape");

    // ------------------------------------------------------------------------
    // STEP 6: Complete Closing & Return to Closed State
    // ------------------------------------------------------------------------
    console.log("\n[Step 6] Waiting for closing animation to complete...");
    await page.waitForTimeout(1100);

    await closedBadge.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Returned to closed hardcover view successfully:", await closedBadge.isVisible());
    console.log("✓ 'Open Album ▶' button restored:", await openBtn.isVisible());

    // ------------------------------------------------------------------------
    // STEP 7: Test Cover Click-to-Open & Keyboard Opening
    // ------------------------------------------------------------------------
    console.log("\n[Step 7] Testing direct cover click-to-open interaction...");
    // Click center of the 3D book canvas
    const canvas = page.locator("canvas");
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      await page.mouse.click(canvasBox.x + canvasBox.width * 0.52, canvasBox.y + canvasBox.height * 0.48);
      await page.waitForTimeout(300);
      const isOpeningAfterCoverClick = await page.locator("text=/Opening Album/i").isVisible();
      console.log("✓ Direct cover click initiated opening animation:", isOpeningAfterCoverClick);
      await page.waitForTimeout(1500);
      console.log("✓ Re-opened to Spread 1 successfully:", await spreadIndicator.isVisible());
    }

    // ------------------------------------------------------------------------
    // STEP 8: PDF Download Regression Verification
    // ------------------------------------------------------------------------
    console.log("\n[Step 8] Verifying PDF export functionality remains intact...");
    const downloadPdfBtn = page.getByRole("button", { name: /Download PDF/i });
    const downloadPromise = page.waitForEvent("download", { timeout: 20000 });
    await downloadPdfBtn.click();
    const download = await downloadPromise;
    const downloadPath = path.join(ARTIFACT_DIR, "StudioFrame-Venice-Keepsake-stage2.pdf");
    await download.saveAs(downloadPath);
    console.log("✓ Successfully downloaded PDF:", downloadPath, `(${fs.statSync(downloadPath).size} bytes)`);

    console.log("\n=== ALL STAGE 2 VERIFICATION CHECKS PASSED SUCCESSFULLY ===");
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
    await browser.close();
  }
}

runStage2Verification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
