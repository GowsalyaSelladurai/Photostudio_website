import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const ARTIFACT_DIR = "C:/Users/narma/.gemini/antigravity/brain/2e368bf3-1ccc-40dc-b697-1f7c48e0c19b";

// Helper to transpile TS file to CommonJS string
function transpileTs(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  return ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
}

// Build a self-contained bundle for the browser
function buildBrowserBundle() {
  const studioConfigCode = transpileTs("src/config/studio.config.ts");
  const photoStorageCode = transpileTs("src/lib/album-photo-storage.ts");
  const canvasRendererCode = transpileTs("src/lib/album-page-canvas.ts");
  const pdfExportCode = transpileTs("src/lib/album-pdf-export.ts");

  return `
    (function() {
      const modules = {};
      function define(id, fn) {
        modules[id] = { exports: {} };
        fn(modules[id].exports, modules[id]);
      }
      function req(id) {
        if (modules[id]) return modules[id].exports;
        throw new Error("Cannot find module: " + id);
      }

      // 1. studio.config
      define("@/config/studio.config", function(exports, module) {
        ${studioConfigCode}
      });

      // 2. album-photo-storage
      define("@/lib/album-photo-storage", function(exports, module) {
        ${photoStorageCode}
      });

      // 3. album-page-canvas
      define("@/lib/album-page-canvas", function(exports, module) {
        const require = req;
        ${canvasRendererCode}
      });

      // 4. album-pdf-export
      define("@/lib/album-pdf-export", function(exports, module) {
        const require = req;
        ${pdfExportCode}
      });

      // Expose globally
      window.__PDF_EXPORT__ = req("@/lib/album-pdf-export");
      window.__CANVAS_RENDERER__ = req("@/lib/album-page-canvas");
      window.__PHOTO_STORAGE__ = req("@/lib/album-photo-storage");
      console.log("[Bundle]: StudioFrame PDF Exporter & Canvas Renderer injected successfully.");
    })();
  `;
}

async function runVisualAudit() {
  console.log("=== Starting StudioFrame Phase 4 PDF Visual Quality Audit ===");

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error("[Browser Console Error]:", msg.text());
    } else {
      console.log("[Browser Console]:", msg.text());
    }
  });

  page.on("pageerror", (err) => {
    console.error("[Browser Uncaught Error]:", err.message);
  });

  console.log("Navigating to http://localhost:3000/albums...");
  await page.goto("http://localhost:3000/albums", { waitUntil: "networkidle" });

  console.log("Injecting bundle into browser page...");
  const bundleCode = buildBrowserBundle();
  await page.addScriptTag({ content: bundleCode });

  console.log("Executing in-browser 300-DPI high-resolution album export...");
  const auditResult = await page.evaluate(async () => {
    const { exportAlbumToPdf, resolveAlbumPhysicalDimensions } = window.__PDF_EXPORT__;
    const { renderAlbumPageToCanvas } = window.__CANVAS_RENDERER__;
    const { saveAlbumPhoto } = window.__PHOTO_STORAGE__;

    const projectId = "audit-project-" + Date.now();

    // 1. Create 6 distinct, rich sample photographs at high resolution (1800x1200 or 1200x1800)
    // with detailed geometric and photographic elements
    async function createRichPhoto(label, w, h, bgGradient, accentColor, motif) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");

      // Draw rich sky/landscape gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, bgGradient[0]);
      grad.addColorStop(0.6, bgGradient[1]);
      grad.addColorStop(1, bgGradient[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Sun or architectural element
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(w * 0.7, h * 0.35, Math.min(w, h) * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Motif / silhouette
      ctx.fillStyle = "rgba(25, 20, 18, 0.85)";
      if (motif === "dome") {
        // Duomo Dome silhouette
        ctx.beginPath();
        ctx.moveTo(w * 0.2, h);
        ctx.lineTo(w * 0.2, h * 0.65);
        ctx.arc(w * 0.5, h * 0.65, w * 0.3, Math.PI, 0);
        ctx.lineTo(w * 0.8, h);
        ctx.fill();
        // Lantern
        ctx.fillRect(w * 0.47, h * 0.28, w * 0.06, h * 0.08);
      } else if (motif === "canal") {
        // Water reflections and canal perspective
        ctx.beginPath();
        ctx.moveTo(0, h * 0.6);
        ctx.lineTo(w, h * 0.6);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();
        // Reflection ripples
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 4;
        for (let y = h * 0.65; y < h; y += 30) {
          ctx.beginPath();
          ctx.moveTo(w * 0.1, y);
          ctx.lineTo(w * 0.9, y);
          ctx.stroke();
        }
      } else if (motif === "hills") {
        // Tuscan rolling hills
        ctx.beginPath();
        ctx.moveTo(0, h * 0.5);
        ctx.bezierCurveTo(w * 0.3, h * 0.4, w * 0.6, h * 0.7, w, h * 0.55);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();
      } else if (motif === "bridge") {
        // Rialto arch
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.85, w * 0.35, Math.PI, 0);
        ctx.stroke();
      }

      // Title & metadata text
      ctx.save();
      ctx.font = "bold 44px Georgia, serif";
      ctx.fillStyle = "#FAF7F2";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 12;
      ctx.fillText(label, 60, h - 80);
      ctx.font = "24px -apple-system, sans-serif";
      ctx.fillText(`StudioFrame Archive · ${w}x${h}px · 300 DPI Verified`, 60, h - 40);
      ctx.restore();

      const blob = await new Promise((res) => c.toBlob(res, "image/jpeg", 0.96));
      return { blob, width: w, height: h };
    }

    console.log("Generating 6 high-resolution photographic test images...");
    const photoDefs = [
      { id: "ph1", name: "florence_duomo.jpg", label: "Santa Maria del Fiore", w: 1800, h: 1200, grad: ["#1F3A52", "#5A7D9A", "#B8860B"], acc: "#FFD700", motif: "dome" },
      { id: "ph2", name: "venice_canal.jpg", label: "Venice Grand Canal", w: 1200, h: 1800, grad: ["#2C3E50", "#4CA1AF", "#2C3E50"], acc: "#E0A96D", motif: "canal" },
      { id: "ph3", name: "tuscany_sunset.jpg", label: "Tuscan Sunset", w: 1800, h: 1200, grad: ["#8A2387", "#E94057", "#F27121"], acc: "#FFF5C0", motif: "hills" },
      { id: "ph4", name: "rialto_bridge.jpg", label: "Ponte di Rialto", w: 1800, h: 1200, grad: ["#1D2671", "#C33764", "#E0A96D"], acc: "#E0A96D", motif: "bridge" },
      { id: "ph5", name: "san_marco.jpg", label: "Piazza San Marco", w: 1200, h: 1800, grad: ["#2E3192", "#1BFFFF", "#2E3192"], acc: "#F6F1E8", motif: "dome" },
      { id: "ph6", name: "gondola_evening.jpg", label: "Venetian Gondola", w: 1800, h: 1200, grad: ["#0F2027", "#203A43", "#2C5364"], acc: "#F9D423", motif: "canal" },
    ];

    const photoBlobs = {};
    for (const p of photoDefs) {
      const { blob, width, height } = await createRichPhoto(p.label, p.w, p.h, p.grad, p.acc, p.motif);
      photoBlobs[p.id] = blob;
      // Also save into IndexedDB for real storage retrieval verification
      const file = new File([blob], p.name, { type: "image/jpeg" });
      await saveAlbumPhoto(projectId, p.id, file);
    }

    // 2. Construct 20 Album Pages covering ALL 6 layout configurations
    const layouts = [
      { layout: "single", photos: [{ id: "s1", photoId: "ph1", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }] },
      { layout: "two-photo", photos: [{ id: "s2", photoId: "ph2", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }, { id: "s3", photoId: "ph3", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }] },
      { layout: "three-photo", photos: [{ id: "s4", photoId: "ph4", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }, { id: "s5", photoId: "ph5", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }, { id: "s6", photoId: "ph6", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }] },
      { layout: "four-grid", photos: [{ id: "s7", photoId: "ph1", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }, { id: "s8", photoId: "ph2", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }, { id: "s9", photoId: "ph3", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }, { id: "s10", photoId: "ph4", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }] },
      { layout: "full-bleed", photos: [{ id: "s11", photoId: "ph5", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }] },
      { layout: "collage", photos: [{ id: "s12", photoId: "ph1", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }, { id: "s13", photoId: "ph2", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }, { id: "s14", photoId: "ph3", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }, { id: "s15", photoId: "ph4", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }, { id: "s16", photoId: "ph5", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }, { id: "s17", photoId: "ph6", transform: { x: 0, y: 0, scale: 1, rotation: 0, cropX: 0, cropY: 0 } }] },
    ];

    const pages = [];
    for (let i = 0; i < 20; i++) {
      const cfg = layouts[i % layouts.length];
      pages.push({
        id: `page-${i + 1}`,
        layout: cfg.layout,
        photos: cfg.photos.map((p, idx) => ({ ...p, id: `slot-${i + 1}-${idx}` })),
        texts: [
          {
            id: `txt-${i + 1}`,
            text: `Chapter ${i + 1} · Architectural Study`,
            x: 50,
            y: 92,
            fontSize: 20,
            rotation: 0,
            color: "#292522",
          },
        ],
        background: i % 2 === 0 ? "#FAF7F2" : "#F5F0E8",
        frameStyle: i % 3 === 0 ? "elegant" : "none",
        photoSpacing: "balanced",
        cornerRadius: "subtle",
        photoShadow: "soft",
      });
    }

    const testProject = {
      id: projectId,
      name: "Venice Architecture & Canals",
      sizeId: "classic", // 8x12 in (576 x 864 pt, 2400 x 3600 px at 300 DPI)
      pageCount: 20,
      orientation: "portrait",
      coverFinish: "linen",
      coverPhotoId: null,
      photos: photoDefs.map((p) => ({
        id: p.id,
        fileName: p.name,
        url: "",
        width: p.w,
        height: p.h,
        fileSize: 150000,
        uploadedAt: Date.now(),
      })),
      pages,
      currentPageIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    console.log("Calling exportAlbumToPdf at 300 DPI...");
    const progressReports = [];
    const result = await exportAlbumToPdf(testProject, {
      dpi: 300,
      jpegQuality: 0.94,
      photoSources: photoBlobs,
      includeCover: true,
      autoDownload: false,
      onProgress: (p, s) => {
        progressReports.push({ progress: p, status: s });
        console.log(`[Export Progress]: ${p}% - ${s}`);
      },
    });

    // Also render individual preview canvases for screenshotting:
    // 1. Cover
    const coverCanvas = await window.__PDF_EXPORT__.renderCoverPageToCanvas(testProject, {
      width: 1200,
      height: 1800,
      photoSources: photoBlobs,
    });
    const coverDataUrl = coverCanvas.toDataURL("image/png");

    // 2. Page 1 (Single Layout)
    const p1Canvas = await renderAlbumPageToCanvas(pages[0], {
      width: 1200,
      height: 1800,
      projectId,
      photoSources: photoBlobs,
    });
    const p1DataUrl = p1Canvas.toDataURL("image/png");

    // 3. Page 10 (Four-grid Layout)
    const p10Canvas = await renderAlbumPageToCanvas(pages[9], {
      width: 1200,
      height: 1800,
      projectId,
      photoSources: photoBlobs,
    });
    const p10DataUrl = p10Canvas.toDataURL("image/png");

    // 4. Page 20 (Collage Layout)
    const p20Canvas = await renderAlbumPageToCanvas(pages[19], {
      width: 1200,
      height: 1800,
      projectId,
      photoSources: photoBlobs,
    });
    const p20DataUrl = p20Canvas.toDataURL("image/png");

    return {
      filename: result.filename,
      pageCount: result.pageCount,
      dpi: result.dpi,
      dimensions: result.dimensions,
      pdfBytesBase64: btoa(
        Array.from(result.pdfBytes, (b) => String.fromCharCode(b)).join(""),
      ),
      pdfByteLength: result.pdfBytes.length,
      progressReportsCount: progressReports.length,
      coverDataUrl,
      p1DataUrl,
      p10DataUrl,
      p20DataUrl,
    };
  });

  console.log(`Exported PDF: ${auditResult.filename}`);
  console.log(`Total Pages: ${auditResult.pageCount}`);
  console.log(`Target DPI: ${auditResult.dpi}`);
  console.log(`PDF Byte Size: ${(auditResult.pdfByteLength / (1024 * 1024)).toFixed(2)} MB (${auditResult.pdfByteLength} bytes)`);

  // Decode binary PDF and save to disk
  const binaryStr = Buffer.from(auditResult.pdfBytesBase64, "base64");
  const pdfFilePath = path.join(ARTIFACT_DIR, "StudioFrame-Venice-Memories-classic-20p.pdf");
  fs.writeFileSync(pdfFilePath, binaryStr);
  console.log(`Successfully saved audited high-res PDF to disk: ${pdfFilePath}`);

  // Helper to save data URL to image file
  function saveDataUrlToImage(dataUrl, outputPath) {
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(outputPath, Buffer.from(base64Data, "base64"));
    console.log(`Saved screenshot: ${outputPath}`);
  }

  // Save the 4 requested audit screenshots
  saveDataUrlToImage(auditResult.coverDataUrl, path.join(ARTIFACT_DIR, "08-pdf-audit-cover.png"));
  saveDataUrlToImage(auditResult.p1DataUrl, path.join(ARTIFACT_DIR, "09-pdf-audit-first-page.png"));
  saveDataUrlToImage(auditResult.p10DataUrl, path.join(ARTIFACT_DIR, "10-pdf-audit-middle-page.png"));
  saveDataUrlToImage(auditResult.p20DataUrl, path.join(ARTIFACT_DIR, "11-pdf-audit-final-page.png"));

  // Check PDF stream internals for 300-DPI verification
  const pdfContent = binaryStr.toString("latin1");

  // 1. Check all embedded Image XObjects have Width 2400 and Height 3600 (8x12 in * 300 DPI)
  const imageXObjects = [...pdfContent.matchAll(/\/Type\s+\/XObject\s+\/Subtype\s+\/Image\s+\/Width\s+(\d+)\s+\/Height\s+(\d+)/g)];
  console.log(`Found ${imageXObjects.length} Image XObjects embedded in PDF:`);
  for (let i = 0; i < imageXObjects.length; i++) {
    const [, w, h] = imageXObjects[i];
    if (i < 3 || i === imageXObjects.length - 1) {
      console.log(`  - Page ${i + 1} Image XObject: ${w} × ${h} px (Genuine 300 DPI: ${w / 8} × ${h / 12} DPI)`);
    }
    if (parseInt(w, 10) !== 2400 || parseInt(h, 10) !== 3600) {
      throw new Error(`Page ${i + 1} resolution mismatch! Expected 2400x3600, found ${w}x${h}`);
    }
  }

  // 2. Check MediaBoxes are all individual pages of 576 x 864 pt
  const mediaBoxes = [...pdfContent.matchAll(/\/MediaBox\s+\[([0-9.\s]+)\]/g)].map((m) => m[1].trim());
  console.log(`Found ${mediaBoxes.length} MediaBoxes:`);
  console.log(`  - Sample MediaBox: [${mediaBoxes[0]}]`);
  for (const mb of mediaBoxes) {
    if (mb !== "0 0 576.00 864.00") {
      throw new Error(`MediaBox mismatch! Expected "0 0 576.00 864.00", found "${mb}"`);
    }
  }

  await browser.close();
  console.log("=== StudioFrame Phase 4 Visual Quality Audit Passed 100% ===");
}

runVisualAudit().catch((err) => {
  console.error("Visual quality audit failed:", err);
  process.exit(1);
});

