const test = require("node:test");
const assert = require("node:assert");

/**
 * Conditional logic rules according to PRD Section 8.3:
 */

// 1. Section 6 trigger: 1.10 includes "Craft-based production" OR "We combine more than one of the above"
function shouldShowSection6(enterpriseTypes) {
  if (!Array.isArray(enterpriseTypes)) return false;
  return enterpriseTypes.some(
    (t) =>
      t.toLowerCase().includes("craft-based production") ||
      t.toLowerCase().includes("we combine more than one of the above")
  );
}

// 2. Cooperative details 1.13: shown only when 1.12 = Yes
function shouldShowCoopDetails(isCooperative) {
  return isCooperative === "Yes";
}

// 3. Water reduction details 3.2a: shown when 3.2 is any "Yes" or "small informal changes"
function shouldShowWaterReductionDetails(waterAction) {
  if (!waterAction) return false;
  return (
    waterAction.includes("Yes:") ||
    waterAction.includes("small informal changes")
  );
}

// 4. Water measurement details 3.2c, 3.2d, 3.2e: shown when 3.2b is either "Yes"
function shouldShowWaterMeasurementDetails(measuredWater) {
  if (!measuredWater) return false;
  return measuredWater.startsWith("Yes:");
}

// 5. Carbon footprint details 3.2g, 3.2h, 3.2i: shown when 3.2f is either "Yes"
function shouldShowCarbonDetails(measuredCarbon) {
  if (!measuredCarbon) return false;
  return measuredCarbon.startsWith("Yes:");
}

// 6. Chemicals list 3.4: shown when 3.3 = Yes
function shouldShowChemicalsList(usesChemicals) {
  return usesChemicals === "Yes";
}

// 7. LCA report 3.6c: shown when 3.6a is either "Yes"
function shouldShowLcaUpload(hasLca) {
  if (!hasLca) return false;
  return hasLca.startsWith("Yes:");
}

// 8. Legal proceedings 5.3a: shown when 5.3 = Yes
function shouldShowLegalDetails(hasLegalCases) {
  return hasLegalCases === "Yes";
}

// 9. Product safety recall 5.4a: shown when 5.4 = Yes
function shouldShowSafetyDetails(hasSafetyComplaints) {
  return hasSafetyComplaints === "Yes";
}

// 10. GI tag name 6.5: shown when 6.4 = Yes
function shouldShowGiTagName(hasGiTag) {
  return typeof hasGiTag === "string" && hasGiTag.startsWith("Yes:");
}

// 11. Pehchaan card 6.7: shown when 6.6 = Yes
function shouldShowPehchaanNumber(hasPehchaan) {
  return typeof hasPehchaan === "string" && hasPehchaan.startsWith("Yes:");
}

// 12. Energy reduction details 7.2a: shown when 7.2 is not "No specific changes yet"
function shouldShowEnergyDetails(energyChanges) {
  if (!energyChanges) return false;
  return energyChanges !== "No specific changes yet";
}

test("Section 6 conditional trigger - craft enterprise types", () => {
  assert.strictEqual(shouldShowSection6(["Craft-based production: we make products by hand"]), true);
  assert.strictEqual(shouldShowSection6(["Sustainable materials", "We combine more than one of the above"]), true);
  assert.strictEqual(shouldShowSection6(["Sustainable materials: our products are made from natural"]), false);
  assert.strictEqual(shouldShowSection6([]), false);
  assert.strictEqual(shouldShowSection6(null), false);
});

test("Section 1.13 conditional - cooperative structure", () => {
  assert.strictEqual(shouldShowCoopDetails("Yes"), true);
  assert.strictEqual(shouldShowCoopDetails("No"), false);
  assert.strictEqual(shouldShowCoopDetails(undefined), false);
});

test("Section 3.2a water reduction details condition", () => {
  assert.strictEqual(shouldShowWaterReductionDetails("We have made some small informal changes"), true);
  assert.strictEqual(shouldShowWaterReductionDetails("Yes: we have specific practices that reduce our water use"), true);
  assert.strictEqual(shouldShowWaterReductionDetails("No: we have not focused on this yet"), false);
});

test("Section 3.2c/d/e water measurement details condition", () => {
  assert.strictEqual(shouldShowWaterMeasurementDetails("Yes: a third party measured or audited our water use"), true);
  assert.strictEqual(shouldShowWaterMeasurementDetails("Yes: we measure it ourselves regularly"), true);
  assert.strictEqual(shouldShowWaterMeasurementDetails("No: we have not formally measured this"), false);
  assert.strictEqual(shouldShowWaterMeasurementDetails("We are in the process of measuring this now"), false);
});

test("Section 3.2g/h/i carbon calculation details condition", () => {
  assert.strictEqual(shouldShowCarbonDetails("Yes: a third-party consultant or certification body calculated it for us"), true);
  assert.strictEqual(shouldShowCarbonDetails("Yes: we calculated it ourselves using a recognised methodology"), true);
  assert.strictEqual(shouldShowCarbonDetails("No: we have not done this yet"), false);
});

test("Section 3.4 chemicals list condition", () => {
  assert.strictEqual(shouldShowChemicalsList("Yes"), true);
  assert.strictEqual(shouldShowChemicalsList("No"), false);
});

test("Section 3.6c LCA upload condition", () => {
  assert.strictEqual(shouldShowLcaUpload("Yes: a full LCA has been completed by a third-party firm"), true);
  assert.strictEqual(shouldShowLcaUpload("No: we have not done an LCA"), false);
});

test("Section 5.3a legal proceedings condition", () => {
  assert.strictEqual(shouldShowLegalDetails("Yes"), true);
  assert.strictEqual(shouldShowLegalDetails("No"), false);
});

test("Section 6.5 GI tag and 6.7 Pehchaan card conditions", () => {
  assert.strictEqual(shouldShowGiTagName("Yes: our craft has a GI tag"), true);
  assert.strictEqual(shouldShowGiTagName("No: our craft does not have a GI tag"), false);
  assert.strictEqual(shouldShowPehchaanNumber("Yes: I or some of our artisans hold a Pehchaan Card"), true);
  assert.strictEqual(shouldShowPehchaanNumber("No: we do not hold one"), false);
});

test("Section 7.2a energy reduction description condition", () => {
  assert.strictEqual(shouldShowEnergyDetails("Yes: we have specific practices in place that we follow consistently"), true);
  assert.strictEqual(shouldShowEnergyDetails("We have made some changes informally but have not written them down"), true);
  assert.strictEqual(shouldShowEnergyDetails("No specific changes yet"), false);
});

