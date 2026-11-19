import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const pricingPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/config/framePricing.ts",
);
const source = readFileSync(pricingPath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const pricingModule = { exports: {} };
new Function("exports", "module", compiled.outputText)(
  pricingModule.exports,
  pricingModule,
);
const { calculateFramePrice, FRAME_PRICING } = pricingModule.exports;

test("calculates Total Price = Selected Frame Base Price + Selected Material Extra Charge", () => {
  // Classic Bevel (base 200) + Solid Wood (extra 50) = 250
  const result = calculateFramePrice("classic_bevel", "wood");
  assert.equal(result.basePrice, 200);
  assert.equal(result.materialExtra, 50);
  assert.equal(result.totalPrice, 250);
  assert.equal(result.formattedBasePrice, "₹200");
  assert.equal(result.formattedMaterialExtra, "+₹50");
  assert.equal(result.formattedTotalPrice, "₹250");
});

test("calculates pricing for MDF with zero additional charge", () => {
  // Modern Flat (base 180) + MDF (extra 0) = 180
  const result = calculateFramePrice("modern_flat", "mdf");
  assert.equal(result.basePrice, 180);
  assert.equal(result.materialExtra, 0);
  assert.equal(result.totalPrice, 180);
  assert.equal(result.formattedBasePrice, "₹180");
  assert.equal(result.formattedMaterialExtra, "₹0 (Included)");
  assert.equal(result.formattedTotalPrice, "₹180");
});

test("calculates pricing for Aluminium metallic surcharge", () => {
  // Gallery Style (base 220) + Aluminium (extra 70) = 290
  const result = calculateFramePrice("gallery_style", "aluminium");
  assert.equal(result.basePrice, 220);
  assert.equal(result.materialExtra, 70);
  assert.equal(result.totalPrice, 290);
  assert.equal(result.formattedBasePrice, "₹220");
  assert.equal(result.formattedMaterialExtra, "+₹70");
  assert.equal(result.formattedTotalPrice, "₹290");
});

test("verifies all frame profile designs have configurable base prices", () => {
  const expectedProfiles = [
    "modern_flat",
    "classic_bevel",
    "gallery_style",
    "ornate_decorative",
    "shadow_box",
    "rounded_edge",
  ];

  for (const id of expectedProfiles) {
    assert.ok(FRAME_PRICING.profiles[id], `Profile ${id} should exist in FRAME_PRICING`);
    assert.ok(typeof FRAME_PRICING.profiles[id].basePrice === "number", `Profile ${id} should have numeric basePrice`);
    assert.ok(FRAME_PRICING.profiles[id].basePrice > 0, `Profile ${id} basePrice should be > 0`);
  }
});

test("verifies all 3 materials have configurable surcharges", () => {
  const expectedMaterials = ["wood", "aluminium", "mdf"];

  for (const mat of expectedMaterials) {
    assert.ok(FRAME_PRICING.materials[mat], `Material ${mat} should exist in FRAME_PRICING`);
    assert.ok(typeof FRAME_PRICING.materials[mat].extraCharge === "number");
  }
});

