import test from "node:test";
import assert from "node:assert/strict";

import { DAY_MS } from "../src/model.js";
import { buildClinicalReportData } from "../src/report.js";

const now = Date.now();

const doses = [
  {
    id: "ev-1",
    medicationId: "estradiol-valerate-im",
    dose: 4,
    takenAt: new Date(now - 5 * DAY_MS).toISOString(),
    note: "",
  },
  {
    id: "spiro-1",
    medicationId: "spironolactone",
    dose: 50,
    takenAt: new Date(now - 4 * DAY_MS).toISOString(),
    note: "",
  },
  {
    id: "outside",
    medicationId: "estradiol-valerate-im",
    dose: 4,
    takenAt: new Date(now - 50 * DAY_MS).toISOString(),
    note: "",
  },
];

const labs = [
  {
    id: "lab-1",
    labAt: new Date(now - 3 * DAY_MS).toISOString(),
    estradiolPgMl: 180,
    testosteroneNgDl: 30,
    prolactinNgMl: 12,
    note: "",
  },
  {
    id: "outside-lab",
    labAt: new Date(now - 70 * DAY_MS).toISOString(),
    estradiolPgMl: 120,
    testosteroneNgDl: 35,
    prolactinNgMl: 10,
    note: "",
  },
];

test("filters doses and labs to the selected date range", () => {
  const report = buildClinicalReportData({
    doses,
    labs,
    startMs: now - 10 * DAY_MS,
    endMs: now,
  });

  assert.equal(report.doseCount, 2);
  assert.equal(report.labCount, 1);
  assert.equal(report.uniqueMedications.length, 2);
});

test("computes observed model residual only when a modeled dose precedes the lab", () => {
  const report = buildClinicalReportData({
    doses,
    labs,
    startMs: now - 10 * DAY_MS,
    endMs: now,
  });

  assert.equal(report.residuals.length, 1);
  assert.ok(report.residuals[0].estimatedPgMl > 0);
  assert.equal(
    report.residuals[0].residualPgMl,
    report.residuals[0].estradiolPgMl -
      report.residuals[0].estimatedPgMl,
  );
});

test("caps detailed report rows for a one-page summary", () => {
  const manyDoses = Array.from({ length: 15 }, (_, index) => ({
    id: `dose-${index}`,
    medicationId: "estradiol-valerate-im",
    dose: 4,
    takenAt: new Date(now - index * DAY_MS).toISOString(),
    note: "",
  }));
  const report = buildClinicalReportData({
    doses: manyDoses,
    labs,
    startMs: now - 20 * DAY_MS,
    endMs: now,
    maxDoses: 8,
  });

  assert.equal(report.doseCount, 15);
  assert.equal(report.displayedDoses.length, 8);
});

test("rejects an inverted report range", () => {
  assert.throws(
    () =>
      buildClinicalReportData({
        doses,
        labs,
        startMs: now,
        endMs: now - DAY_MS,
      }),
    /Invalid report date range/,
  );
});
