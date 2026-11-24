import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const validationPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/lib/validation.ts",
);
const source = readFileSync(validationPath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const validationModule = { exports: {} };
new Function("exports", "module", compiled.outputText)(
  validationModule.exports,
  validationModule,
);
const {
  validateBooking,
  validateEnquiry,
  filmShootTypes,
  getServiceCategory,
} = validationModule.exports;

function validBooking(overrides = {}) {
  return {
    name: "Taylor Sample",
    mobile: "+1 (202) 555-0100",
    shootType: "Wedding",
    dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    location: "Studio",
    requirements: "",
    ...overrides,
  };
}

test("accepts a valid future booking and treats blank requirements as optional", () => {
  const result = validateBooking(validBooking());

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.name, "Taylor Sample");
    assert.equal(result.data.requirements, undefined);
  }
});

test("rejects invalid required fields and unknown shoot types", () => {
  const result = validateBooking(
    validBooking({
      name: " ",
      mobile: "-------",
      shootType: "Unknown",
      dateTime: "2026-02-31T12:00:00.000Z",
      location: "",
    }),
  );

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.errors.name);
    assert.ok(result.errors.mobile);
    assert.ok(result.errors.shootType);
    assert.ok(result.errors.dateTime);
    assert.ok(result.errors.location);
  }
});

test("rejects past bookings and oversized requirements", () => {
  const result = validateBooking(
    validBooking({
      dateTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      requirements: "x".repeat(2001),
    }),
  );

  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.errors.dateTime, /future/);
    assert.match(result.errors.requirements, /2,000/);
  }
});

test("accepts an enquiry with either an email or a valid mobile number", () => {
  const withEmail = validateEnquiry({
    name: "Taylor Sample",
    email: "taylor@example.org",
    mobile: "",
    message: "I would like to ask about a portrait session.",
  });
  const withMobile = validateEnquiry({
    name: "Taylor Sample",
    email: "",
    mobile: "+1 (202) 555-0100",
    message: "I would like to ask about a portrait session.",
  });

  assert.equal(withEmail.success, true);
  assert.equal(withMobile.success, true);
});

test("rejects enquiries without contact details or with punctuation-only mobile", () => {
  const withoutContact = validateEnquiry({
    name: "Taylor Sample",
    email: "",
    mobile: "",
    message: "Please contact me.",
  });
  const invalidMobile = validateEnquiry({
    name: "Taylor Sample",
    email: "",
    mobile: "-------",
    message: "Please contact me.",
  });

  assert.equal(withoutContact.success, false);
  if (!withoutContact.success) {
    assert.ok(withoutContact.errors.contact);
  }
  assert.equal(invalidMobile.success, false);
  if (!invalidMobile.success) {
    assert.ok(invalidMobile.errors.mobile);
  }
});

const expectedFilmServices = [
  "Pre-Wedding Films",
  "Post-Wedding Films",
  "Wedding Cinematography",
  "Maternity Photoshoots",
  "Fashion Films",
  "Cinematic Videos",
  "Birthday and Event Films",
  "Couple Photoshoots",
  "Studio Photoshoots",
  "Other Custom Film Services",
];

test("exposes every Film/Video service", () => {
  assert.deepEqual([...filmShootTypes], expectedFilmServices);
});

test("accepts every Film/Video service for bookings and tags it FILM", () => {
  for (const shootType of expectedFilmServices) {
    const result = validateBooking(validBooking({ shootType }));
    assert.equal(result.success, true, shootType);
    if (result.success) {
      assert.equal(result.data.shootType, shootType);
      assert.equal(result.data.serviceCategory, "FILM");
    }
  }
});

test("existing photography services still validate and are tagged PHOTOGRAPHY", () => {
  for (const shootType of ["Wedding", "Pre-Wedding", "Baby", "Passport-Size", "Events", "Video", "Editing", "Portrait"]) {
    const result = validateBooking(validBooking({ shootType }));
    assert.equal(result.success, true, shootType);
    if (result.success) assert.equal(result.data.serviceCategory, "PHOTOGRAPHY");
  }
  assert.equal(getServiceCategory("Wedding"), "PHOTOGRAPHY");
});

test("accepts a Film/Video service on an enquiry and tags it FILM", () => {
  const result = validateEnquiry({
    name: "Taylor Sample",
    email: "taylor@example.org",
    mobile: "",
    serviceType: "Fashion Films",
    message: "Interested in a fashion film.",
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.serviceType, "Fashion Films");
    assert.equal(result.data.serviceCategory, "FILM");
  }
});

test("enquiry service stays optional and rejects unknown services", () => {
  const base = { name: "Taylor Sample", email: "taylor@example.org", message: "Hello" };
  const general = validateEnquiry({ ...base, serviceType: "" });
  const omitted = validateEnquiry(base);
  const unknown = validateEnquiry({ ...base, serviceType: "Skydiving" });

  assert.equal(general.success, true);
  assert.equal(omitted.success, true);
  if (general.success) assert.equal(general.data.serviceCategory, undefined);
  assert.equal(unknown.success, false);
  if (!unknown.success) assert.ok(unknown.errors.serviceType);
});
