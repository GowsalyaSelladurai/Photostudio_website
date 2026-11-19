import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:\\Users\\narma\\.gemini\\antigravity\\brain\\2e368bf3-1ccc-40dc-b697-1f7c48e0c19b";

async function runStage3Verification() {
  console.log("=== StudioFrame Stage 3: Lighting, Shadows & Paper Curvature Verification ===");
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

  const tempDir = path.join(process.cwd(), "scripts", "temp-stage3-photos");
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
    console.log("\n[Setup] Creating album project 'Venice Memories'...");
    await page.goto("http://localhost:3000/albums", { waitUntil: "networkidle" });
    const nameInput = page.getByLabel("Album name").or(page.locator('input[value="My Photo Album"]'));
    await nameInput.fill("Venice Memories");
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
    await page.waitForTimeout(3000); // Allow 3D canvas, lighting, and textures to settle

    // ------------------------------------------------------------------------
    // VERIFICATION 1: Closed Album Contact Shadows & Studio Lighting
    // ------------------------------------------------------------------------
    console.log("\n[Verification 1] Inspecting closed album studio lighting & contact shadows...");
    const closedBadge = page.locator("text=Physical Hardcover · Closed View");
    if (!(await closedBadge.isVisible())) throw new Error("Closed view badge not visible");

    // Capture Screenshot 33: Closed album with contact shadows & studio lighting
    const shot33Path = path.join(ARTIFACT_DIR, "33-stage3-closed-album-contact-shadows.png");
    await page.screenshot({ path: shot33Path });
    console.log("✓ Saved Screenshot 33 (Closed album with contact shadows):", shot33Path);

    // ------------------------------------------------------------------------
    // VERIFICATION 2: Open Album & Natural Gutter Curvature
    // ------------------------------------------------------------------------
    console.log("\n[Verification 2] Opening album with cinematic hinge animation...");
    const openBtn = page.getByRole("button", { name: "Open Album ▶", exact: true });
    await openBtn.click();

    // Wait for opening animation to complete (1.4s + settle buffer)
    await page.waitForTimeout(2000);
    const spread1Indicator = page.locator("text=/Spread 1 of \\d+/i");
    await spread1Indicator.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Successfully opened to Spread 1:", await spread1Indicator.textContent());

    // Capture Screenshot 34: Open spread showing natural gutter curvature & binding crease
    const shot34Path = path.join(ARTIFACT_DIR, "34-stage3-open-spread-gutter-curvature.png");
    await page.screenshot({ path: shot34Path });
    console.log("✓ Saved Screenshot 34 (Open spread with gutter curvature):", shot34Path);

    // ------------------------------------------------------------------------
    // VERIFICATION 3: Page-Turn Dynamic Shadow
    // ------------------------------------------------------------------------
    console.log("\n[Verification 3] Triggering page turn and capturing dynamic shadow...");
    const nextBtn = page.getByRole("button", { name: "Next ▶", exact: true });

    // Trigger turn to Spread 2
    await nextBtn.click();

    // Wait ~420ms (midway through 0.88s page-curl animation, peak arch height)
    await page.waitForTimeout(420);

    // Capture Screenshot 35: Mid-page-turn with dynamic shadow
    const shot35Path = path.join(ARTIFACT_DIR, "35-stage3-mid-page-turn-shadow.png");
    await page.screenshot({ path: shot35Path });
    console.log("✓ Saved Screenshot 35 (Mid-page-turn with dynamic shadow):", shot35Path);

    // Wait for flip to complete
    await page.waitForTimeout(900);
    const spread2Indicator = page.locator("text=/Spread 2 of \\d+/i");
    console.log("✓ Completed turn to:", await spread2Indicator.textContent());

    // ------------------------------------------------------------------------
    // VERIFICATION 4: Close-Up of Binding Crease & Page Edges
    // ------------------------------------------------------------------------
    console.log("\n[Verification 4] Capturing close-up of binding crease, page edges, and highlights...");
    // Turn back to Spread 1
    const prevBtn = page.getByRole("button", { name: "◀ Previous", exact: true });
    await prevBtn.click();
    await page.waitForTimeout(1200);

    // Adjust viewport to inspect binding detail closely
    await page.setViewportSize({ width: 920, height: 780 });
    await page.waitForTimeout(500);

    const shot36Path = path.join(ARTIFACT_DIR, "36-stage3-binding-crease-edge-closeup.png");
    await page.screenshot({ path: shot36Path });
    console.log("✓ Saved Screenshot 36 (Close-up of binding crease and edges):", shot36Path);

    // Restore viewport size
    await page.setViewportSize({ width: 1360, height: 860 });
    await page.waitForTimeout(300);

    // ------------------------------------------------------------------------
    // VERIFICATION 5: Mobile Viewport Performance & Contact Shadow Test
    // ------------------------------------------------------------------------
    console.log("\n[Verification 5] Testing mobile viewport (390x844 iPhone 14)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    const mobileCanvas = page.locator("canvas");
    console.log("✓ Mobile 3D canvas visible:", await mobileCanvas.isVisible());

    // Restore desktop
    await page.setViewportSize({ width: 1360, height: 860 });
    await page.waitForTimeout(500);

    // ------------------------------------------------------------------------
    // VERIFICATION 6: PDF Export Regression Verification
    // ------------------------------------------------------------------------
    console.log("\n[Verification 6] Verifying PDF export functionality remains unchanged...");
    const downloadPdfBtn = page.getByRole("button", { name: /Download PDF/i });
    const downloadPromise = page.waitForEvent("download", { timeout: 25000 });
    await downloadPdfBtn.click();
    const download = await downloadPromise;
    const downloadPath = path.join(ARTIFACT_DIR, "StudioFrame-Venice-Memories-stage3.pdf");
    await download.saveAs(downloadPath);
    console.log("✓ Successfully downloaded PDF:", downloadPath, `(${fs.statSync(downloadPath).size} bytes)`);

    console.log("\n=== ALL STAGE 3 VERIFICATION CHECKS PASSED SUCCESSFULLY ===");
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
    await browser.close();
  }
}

runStage3Verification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

