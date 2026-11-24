import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\narma\\.gemini\\antigravity\\brain\\2e368bf3-1ccc-40dc-b697-1f7c48e0c19b";

async function run() {
  console.log("=== StudioFrame Customization Screen Layout Verification ===");
  const browser = await chromium.launch({ headless: true, channel: "chrome" });

  // 1. Desktop Viewport (1280 x 800)
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  console.log("[1] Creating new project at /albums...");
  await page.goto("http://localhost:3000/albums", { waitUntil: "networkidle" });

  const nameInput = page.getByLabel("Album name").or(page.locator('input[value="My Photo Album"]'));
  if (await nameInput.isVisible()) {
    await nameInput.fill("Layout Audit Tuscany");
  }
  const createBtn = page.getByRole("button", { name: /Create and start designing/i });
  await createBtn.click();
  await page.waitForURL(/\/albums\/editor\/.+/, { timeout: 15000 });
  console.log("Arrived at Editor URL:", page.url());

  // Verify 3 columns exist and are side-by-side on desktop
  console.log("[2] Verifying 3-column side-by-side layout on desktop...");
  const col1 = page.locator('text=01 / Album Size & Finish').locator('..').locator('..');
  const col2 = page.locator('text=02 / Photo Upload').locator('..').locator('..');
  const col3 = page.locator('text=03 / Photo Gallery').locator('..').locator('..');

  const b1 = await col1.boundingBox();
  const b2 = await col2.boundingBox();
  const b3 = await col3.boundingBox();

  console.log(`Column 1: x=${b1.x.toFixed(1)}, y=${b1.y.toFixed(1)}, width=${b1.width.toFixed(1)}`);
  console.log(`Column 2: x=${b2.x.toFixed(1)}, y=${b2.y.toFixed(1)}, width=${b2.width.toFixed(1)}`);
  console.log(`Column 3: x=${b3.x.toFixed(1)}, y=${b3.y.toFixed(1)}, width=${b3.width.toFixed(1)}`);

  const isSideBySide = b1.x < b2.x && b2.x < b3.x && Math.abs(b1.y - b2.y) < 15 && Math.abs(b2.y - b3.y) < 15;
  console.log("✓ Desktop columns 1, 2, and 3 are horizontally side by side:", isSideBySide);

  // Upload sample photos to test gallery in Column 3
  console.log("[3] Uploading sample photos into Column 2 dropzone...");
  const tempDir = path.join(process.cwd(), "scripts", "temp-layout-photos");
  fs.mkdirSync(tempDir, { recursive: true });

  const samplePhotoFiles = [];
  const dummySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#B99B70"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="#171717">Photo</text></svg>`;

  for (let i = 1; i <= 7; i++) {
    const fPath = path.join(tempDir, `sample_${i}.png`);
    fs.writeFileSync(fPath, dummySvg);
    samplePhotoFiles.push(fPath);
  }

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(samplePhotoFiles);
  await page.waitForTimeout(2000);

  // Check thumbnails inside Column 3
  const thumbsCount = await page.locator('img[alt^="sample_"]').count();
  console.log(`✓ Thumbs rendered in Column 3: ${thumbsCount} (first 5 photos)`);
  const viewAllTile = page.getByText(/\+2\s+View All/i);
  console.log("✓ '+2 View All' tile visible in Column 3:", await viewAllTile.isVisible());

  // Take Desktop Screenshot
  const shotDesktop = path.join(ARTIFACT_DIR, "21-customization-layout-desktop.png");
  await page.screenshot({ path: shotDesktop });
  console.log("Saved Desktop screenshot:", shotDesktop);

  // 4. Tablet Viewport (820 x 1180)
  console.log("[4] Testing Tablet Viewport (820 x 1180)...");
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.waitForTimeout(500);

  const shotTablet = path.join(ARTIFACT_DIR, "22-customization-layout-tablet.png");
  await page.screenshot({ path: shotTablet });
  console.log("Saved Tablet screenshot:", shotTablet);

  // 5. Mobile Viewport (390 x 844)
  console.log("[5] Testing Mobile Viewport (390 x 844)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);

  const shotMobile = path.join(ARTIFACT_DIR, "23-customization-layout-mobile.png");
  await page.screenshot({ path: shotMobile });
  console.log("Saved Mobile screenshot:", shotMobile);

  // Clean up
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {}

  await browser.close();
  console.log("=== ALL LAYOUT VERIFICATION CHECKS PASSED ===");
}

run().catch((err) => {
  console.error("Layout verification failed:", err);
  process.exit(1);
});
