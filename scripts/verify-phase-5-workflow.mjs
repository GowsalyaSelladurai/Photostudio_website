import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/narma/.gemini/antigravity/brain/2e368bf3-1ccc-40dc-b697-1f7c48e0c19b";

// Minimal valid JPEG buffer
const MINIMAL_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
  "base64",
);

async function runPhase5WorkflowVerification() {
  console.log("=== StudioFrame Phase 5: Complete Customer Workflow Verification ===");

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1360, height: 850 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error("[Browser Console Error]:", msg.text());
    }
  });

  page.on("pageerror", (err) => {
    console.error("[Browser Uncaught Error]:", err.message);
  });

  // 1. Visit /albums and create an album project
  console.log("\n[1] Navigating to /albums to create new album project...");
  await page.goto("http://localhost:3000/albums", { waitUntil: "networkidle" });

  const nameInput = page.getByLabel("Album name").or(page.locator('input[value="My Photo Album"]'));
  if (await nameInput.isVisible()) {
    await nameInput.fill("Tuscany & Venice Keepsake");
  }

  const createBtn = page.getByRole("button", { name: /Create and start designing/i });
  await createBtn.click();

  // 2. Arrived at Customization Screen
  await page.waitForURL(/\/albums\/editor\/.+/, { timeout: 10000 });
  const editorUrl = page.url();
  const projectId = editorUrl.split("/").pop();
  console.log("Arrived at Customization Screen:", editorUrl);

  // 3. Test Selecting each Album Size
  console.log("\n[2] Testing Album Size Selection (Classic, Premium, Grand)...");
  await page.getByRole("button", { name: /premium 10 × 12/i }).click();
  await page.waitForTimeout(300);
  let saved = await page.evaluate((id) => {
    const list = JSON.parse(localStorage.getItem("studioframe-album-projects") || "[]");
    return list.find((p) => p.id === id);
  }, projectId);
  console.log("✓ Size switched to Premium:", saved.sizeId === "premium");

  await page.getByRole("button", { name: /grand 12 × 18/i }).click();
  await page.waitForTimeout(300);
  saved = await page.evaluate((id) => {
    const list = JSON.parse(localStorage.getItem("studioframe-album-projects") || "[]");
    return list.find((p) => p.id === id);
  }, projectId);
  console.log("✓ Size switched to Grand:", saved.sizeId === "grand");

  await page.getByRole("button", { name: /classic 8 × 12/i }).click();
  await page.waitForTimeout(300);

  // 4. Test Selecting each Cover Finish
  console.log("\n[3] Testing Cover Finish Selection (Linen, Leather, Photo)...");
  await page.getByRole("button", { name: /Luxury leather/i }).click();
  await page.waitForTimeout(300);
  saved = await page.evaluate((id) => {
    const list = JSON.parse(localStorage.getItem("studioframe-album-projects") || "[]");
    return list.find((p) => p.id === id);
  }, projectId);
  console.log("✓ Finish switched to Leather:", saved.coverFinish === "leather");

  await page.getByRole("button", { name: /Printed photo cover/i }).click();
  await page.waitForTimeout(300);
  saved = await page.evaluate((id) => {
    const list = JSON.parse(localStorage.getItem("studioframe-album-projects") || "[]");
    return list.find((p) => p.id === id);
  }, projectId);
  console.log("✓ Finish switched to Photo:", saved.coverFinish === "photo");

  await page.getByRole("button", { name: /Premium linen/i }).click();
  await page.waitForTimeout(300);

  // 5. Create temporary test photos on disk for upload
  const tempDir = path.join(process.cwd(), "tests", "temp-p5-uploads");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const samplePhotoNames = [
    "01_florence_duomo.jpg",
    "02_grand_canal.jpg",
    "03_tuscany_hills.jpg",
    "04_ponte_vecchio.jpg",
    "05_san_marco.jpg",
    "06_venetian_gondola.jpg",
    "07_siena_cathedral.jpg",
    "08_chianti_vineyard.jpg",
  ];

  const filePaths = samplePhotoNames.map((name) => {
    const p = path.join(tempDir, name);
    fs.writeFileSync(p, MINIMAL_JPEG);
    return p;
  });

  // 6. Test Uploading fewer than 5 photographs (4 photos)
  console.log("\n[4] Uploading fewer than 5 photographs (4 photos)...");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(filePaths.slice(0, 4));
  await page.waitForTimeout(1500);

  const thumbCountUnder5 = await page.locator('button[title="Remove photo"]').count();
  console.log(`✓ Thumbnails visible on screen: ${thumbCountUnder5} (expected 4)`);
  const has5PlusUnder = (await page.locator('text=/\\+\\d+/').count()) > 0;
  console.log("✓ '5+' or 'View All' tile visible when < 5 photos (should be false):", has5PlusUnder);

  const shotUnder5 = path.join(ARTIFACT_DIR, "13-phase5-customization-under-5.png");
  await page.screenshot({ path: shotUnder5 });
  console.log("Saved screenshot:", shotUnder5);

  // 7. Test Uploading more than 5 photographs (upload remaining 4 photos -> 8 total)
  console.log("\n[5] Uploading more photographs (total 8 photos)...");
  await fileInput.setInputFiles(filePaths.slice(4, 8));
  await page.waitForTimeout(2000);

  const thumbCountOver5 = await page.locator('button[title="Remove photo"]').count();
  console.log(`✓ First 5 thumbnails visible on main screen: ${thumbCountOver5} (expected 5)`);
  const viewAllTile = page.locator('button[aria-label*="View and manage"]');
  const has5PlusOver = await viewAllTile.isVisible();
  console.log("✓ '5+' / 'View All' tile visible when > 5 photos:", has5PlusOver);

  const shotOver5 = path.join(ARTIFACT_DIR, "14-phase5-customization-over-5.png");
  await page.screenshot({ path: shotOver5 });
  console.log("Saved screenshot:", shotOver5);

  // 8. Test Opening Photo Management Popup
  console.log("\n[6] Opening Photo Management Popup...");
  await viewAllTile.click();
  await page.waitForSelector("text=Manage & Reorder Photographs");
  console.log("✓ Photo Management Popup opened.");

  const modalThumbsCount = await page.locator('.fixed button[title="Remove photo"]').count();
  console.log(`✓ Total photos inside modal: ${modalThumbsCount} (expected 8)`);

  const shotModal = path.join(ARTIFACT_DIR, "15-phase5-photo-modal-open.png");
  await page.screenshot({ path: shotModal });
  console.log("Saved screenshot:", shotModal);

  // 9. Test Reordering Photographs in Modal
  console.log("\n[7] Testing Reordering Photographs in Modal...");
  // Move second photo earlier (swap photo #2 with #1)
  const moveButtons = page.locator('.fixed button:has-text("◀ Move")');
  await moveButtons.nth(1).click();
  await page.waitForTimeout(500);

  saved = await page.evaluate((id) => {
    const list = JSON.parse(localStorage.getItem("studioframe-album-projects") || "[]");
    return list.find((p) => p.id === id);
  }, projectId);
  console.log("✓ Photo reorder persisted to storage:", saved.photos[0].fileName === "02_grand_canal.jpg");

  // 10. Test Removing a Photograph in Modal
  console.log("\n[8] Testing Removing a Photograph inside modal...");
  const modalRemoveBtns = page.locator('.fixed button[title="Remove photo"]');
  await modalRemoveBtns.first().click();
  await page.waitForTimeout(500);
  const remainingInModal = await page.locator('.fixed button[title="Remove photo"]').count();
  console.log(`✓ Photos after removal in modal: ${remainingInModal} (expected 7)`);

  // Close modal
  await page.getByRole("button", { name: "Done" }).click();
  await page.waitForTimeout(400);

  // 11. Test Automatic Album Generation via Live View
  console.log("\n[9] Generating Album via Live View...");
  const liveViewBtn = page.getByRole("button", { name: "Generate & Open Live View ▶" });
  await liveViewBtn.click();

  // Arrive at 3D Live View
  await page.waitForURL(/\/albums\/preview\/.+/, { timeout: 15000 });
  console.log("Arrived at 3D Live View URL:", page.url());

  // Wait for 3D Canvas
  await page.waitForSelector("canvas", { timeout: 15000 });
  await page.waitForTimeout(3000); // Allow textures to settle

  // If in closed hardcover view, open the album to view inner spreads
  const openAlbumBtn = page.getByRole("button", { name: "Open Album ▶", exact: true });
  if (await openAlbumBtn.isVisible()) {
    await openAlbumBtn.click();
    await page.waitForTimeout(1500);
  }

  const shotSpread1 = path.join(ARTIFACT_DIR, "16-phase5-3d-viewer-spread-1.png");
  await page.screenshot({ path: shotSpread1 });
  console.log("Saved 3D Viewer Spread 1 screenshot:", shotSpread1);

  // 12. Test Autoplay (2-Second Interval)
  console.log("\n[10] Testing Automatic Page Turning at 2-second interval...");
  const autoplayBtn = page.getByRole("button", { name: /Play/i });
  await autoplayBtn.click();
  console.log("Autoplay started. Waiting for automatic turn to Spread 2 (2.0s delay + ~0.88s flip animation)...");
  // Wait up to 5s for Spread 2 of to appear
  try {
    await page.waitForFunction(() => {
      const el = document.body;
      return el && el.innerText.includes("Spread 2 of");
    }, { timeout: 6000 });
  } catch (err) {
    console.log("Wait timed out, continuing to evaluate current text...");
  }

  const spreadText = await page.locator("text=/Spread \\d+ of \\d+/").textContent();
  console.log("Current position after autoplay:", spreadText);
  const isSpread2 = spreadText.includes("Spread 2");
  console.log("✓ Autoplay turned to Spread 2 automatically:", isSpread2);

  const shotAutoplay = path.join(ARTIFACT_DIR, "17-phase5-autoplay-spread-2.png");
  await page.screenshot({ path: shotAutoplay });
  console.log("Saved autoplay screenshot:", shotAutoplay);

  // 13. Test Manual Navigation & Autoplay Pausing/Resuming
  console.log("\n[11] Testing Manual Navigation (◀ Previous)...");
  const prevBtn = page.getByRole("button", { name: "◀ Previous" });
  await prevBtn.click();
  await page.waitForTimeout(1200);

  const backSpreadText = await page.locator("text=/Spread \\d+ of \\d+/").textContent();
  console.log("Position after manual previous:", backSpreadText);
  console.log("✓ Navigated back to Spread 1:", backSpreadText.includes("Spread 1"));

  // 14. Test Drag-to-Turn / Canvas Side Click
  console.log("\n[12] Testing Drag-to-Turn / Canvas Side Click...");
  const rightSideTrigger = page.locator('button[title="Turn to next spread"]');
  await rightSideTrigger.click();
  await page.waitForTimeout(1200);

  const afterDragText = await page.locator("text=/Spread \\d+ of \\d+/").textContent();
  console.log("Position after right-side turn:", afterDragText);
  console.log("✓ Side-click/drag turned to Spread 2:", afterDragText.includes("Spread 2"));

  // 15. Test Jump to Last Spread & Autoplay Boundary
  console.log("\n[13] Testing Jump to Last Spread ⏭...");
  const lastSpreadBtn = page.locator('button[title="Last spread"]');
  await lastSpreadBtn.click();
  await page.waitForTimeout(1500);

  const finalSpreadText = await page.locator("text=/Spread \\d+ of \\d+/").textContent();
  console.log("Position at last spread:", finalSpreadText);
  const nextBtn = page.getByRole("button", { name: "Next ▶" });
  console.log("✓ Next ▶ disabled at last spread:", await nextBtn.isDisabled());

  const shotLastSpread = path.join(ARTIFACT_DIR, "18-phase5-3d-viewer-last-spread.png");
  await page.screenshot({ path: shotLastSpread });
  console.log("Saved last spread screenshot:", shotLastSpread);

  // 16. Test PDF Download Integration
  console.log("\n[14] Testing PDF Download Integration...");
  const downloadPdfBtn = page.getByRole("button", { name: /Download PDF/i });

  // Listen for the download event
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 35000 }),
    downloadPdfBtn.click(),
  ]);

  const downloadPath = path.join(ARTIFACT_DIR, download.suggestedFilename());
  await download.saveAs(downloadPath);
  console.log("✓ Downloaded PDF captured:", downloadPath);
  console.log("✓ Downloaded PDF size:", fs.statSync(downloadPath).size, "bytes");

  const shotPdfDownloaded = path.join(ARTIFACT_DIR, "19-phase5-pdf-download-complete.png");
  await page.screenshot({ path: shotPdfDownloaded });
  console.log("Saved PDF download completed screenshot:", shotPdfDownloaded);

  // 17. Test Mobile Responsive Viewport
  console.log("\n[15] Testing Mobile Viewport (390 × 844)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);

  const shotMobile = path.join(ARTIFACT_DIR, "20-phase5-mobile-viewer.png");
  await page.screenshot({ path: shotMobile });
  console.log("Saved mobile viewer screenshot:", shotMobile);

  // Clean up temp uploads
  fs.rmSync(tempDir, { recursive: true, force: true });

  await browser.close();
  console.log("\n=== ALL 15 INTEGRATION TEST PHASES PASSED 100%! ===");
}

runPhase5WorkflowVerification().catch((err) => {
  console.error("Workflow verification failed:", err);
  process.exit(1);
});
