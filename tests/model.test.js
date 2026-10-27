import test from "node:test";
import assert from "node:assert/strict";

import {
  DAY_MS,
  buildConcentrationSeries,
  concentrationAtMs,
  doseContributionPgMl,
  expandDoseEvents,
} from "../src/model.js";
import {
  ESTRADIOL_UNIT_FACTOR,
  MEDICATIONS,
  MEDICATION_LOOKUP,
  SOURCES,
  TESTOSTERONE_UNIT_FACTOR,
} from "../src/data.js";

test("injection model has no concentration before administration", () => {
  assert.equal(doseContributionPgMl("EV im", 4, -1), 0);
});

test("injection model produces a positive post-dose estimate", () => {
  const level = doseContributionPgMl("EV im", 4, 3);
  assert.ok(level > 0);
  assert.ok(level < 1000);
});

test("patch model includes residual concentration after removal", () => {
  const duringWear = doseContributionPgMl("patch tw", 100, 2);
  const afterRemoval = doseContributionPgMl("patch tw", 100, 5);

  assert.ok(duringWear > 0);
  assert.ok(afterRemoval > 0);
  assert.notEqual(duringWear, afterRemoval);
});

test("oral model produces a delayed estradiol curve", () => {
  const early = doseContributionPgMl("oral E2", 2, 0.02);
  const peakWindow = doseContributionPgMl("oral E2", 2, 0.1);
  const later = doseContributionPgMl("oral E2", 2, 1);

  assert.ok(peakWindow > early);
  assert.ok(peakWindow > later);
  assert.ok(later > 0);
});

test("sublingual model supports the fast mucosal fraction", () => {
  const briefHold = doseContributionPgMl("sublingual E2", 2, 0.08, {
    sublingualHoldMinutes: 2,
    sublingualSwallowed: false,
  });
  const longHold = doseContributionPgMl(
    "sublingual E2",
    2,
    0.08,
    { sublingualHoldMinutes: 15, sublingualSwallowed: false },
  );

  assert.ok(longHold > briefHold);
  const swallowed = doseContributionPgMl("sublingual E2", 2, 0.5, {
    sublingualHoldMinutes: 2,
    sublingualSwallowed: true,
  });
  const notSwallowed = doseContributionPgMl("sublingual E2", 2, 0.5, {
    sublingualHoldMinutes: 2,
    sublingualSwallowed: false,
  });
  assert.ok(swallowed > notSwallowed);
});

test("standardized gel model produces a sustained estradiol curve", () => {
  const early = doseContributionPgMl("gel E2", 2, 0.25);
  const peakWindow = doseContributionPgMl("gel E2", 2, 0.5);
  const sustained = doseContributionPgMl("gel E2", 2, 1);

  assert.ok(peakWindow > early);
  assert.ok(sustained > 0);
  assert.ok(sustained < peakWindow);
});

test("gel model applies area, site, concentration, and wash parameters", () => {
  const standard = doseContributionPgMl("gel E2", 2, 1);
  const washed = doseContributionPgMl("gel E2", 2, 1, {
    gelWashAfterHours: 1,
  });
  const abdominal = doseContributionPgMl("gel E2", 2, 1, {
    gelSite: "abdomen",
  });
  const narrowArea = doseContributionPgMl("gel E2", 2, 1, {
    gelAreaCm2: 200,
  });
  const wideArea = doseContributionPgMl("gel E2", 2, 1, {
    gelAreaCm2: 1500,
  });

  assert.ok(washed < standard);
  assert.ok(abdominal > standard);
  assert.notEqual(narrowArea, wideArea);
});

test("non-modeled medications do not create simulated events", () => {
  const logs = [
    {
      id: "one",
      medicationId: "spironolactone",
      dose: 50,
      takenAt: new Date(Date.now() - DAY_MS).toISOString(),
    },
  ];

  assert.equal(expandDoseEvents(logs, Date.now()).length, 0);
});

test("repeat interval expands into a bounded future event series", () => {
  const now = Date.now();
  const logs = [
    {
      id: "repeat",
      medicationId: "estradiol-valerate-im",
      dose: 4,
      takenAt: new Date(now - 14 * DAY_MS).toISOString(),
      repeatDays: 7,
    },
  ];

  const events = expandDoseEvents(logs, now + 7 * DAY_MS);
  assert.equal(events.length, 4);
  assert.equal(
    events[0].medication.id,
    MEDICATION_LOOKUP.get("estradiol-valerate-im").id,
  );
});

test("concentration series has the requested resolution and non-negative values", () => {
  const now = Date.now();
  const series = buildConcentrationSeries({
    doseLogs: [
      {
        id: "series",
        medicationId: "estradiol-valerate-im",
        dose: 4,
        takenAt: new Date(now - 5 * DAY_MS).toISOString(),
      },
    ],
    startMs: now - 7 * DAY_MS,
    endMs: now + 2 * DAY_MS,
    points: 48,
  });

  assert.equal(series.length, 48);
  assert.ok(series.every((point) => point.pgMl >= 0));
  assert.ok(series.some((point) => point.pgMl > 0));
});

test("concentration at a later time matches the sum of past events", () => {
  const now = Date.now();
  const event = {
    timestampMs: now,
    dose: 4,
    medication: MEDICATION_LOOKUP.get("estradiol-valerate-im"),
  };

  const actual = concentrationAtMs(now + 3 * DAY_MS, [event]);
  const expected = doseContributionPgMl("EV im", 4, 3);
  assert.equal(actual, expected);
});

test("unit conversion constants match expected laboratory conversions", () => {
  assert.equal(ESTRADIOL_UNIT_FACTOR, 3.6713);
  assert.equal(TESTOSTERONE_UNIT_FACTOR, 0.03467);
});

test("medication catalog has unique IDs and valid source references", () => {
  const ids = MEDICATIONS.map((medication) => medication.id);
  const sourceIds = new Set(SOURCES.map((source) => source.id));

  assert.equal(new Set(ids).size, ids.length);
  assert.ok(MEDICATIONS.length >= 16);
  for (const medication of MEDICATIONS) {
    assert.ok(medication.name);
    assert.ok(medication.unit);
    for (const sourceId of medication.sources) {
      assert.ok(sourceIds.has(sourceId), `${medication.id}: ${sourceId}`);
    }
  }
});

test("only medication entries with a known model are marked as estimable", () => {
  for (const medication of MEDICATIONS) {
    if (medication.concentration) {
      assert.ok(
        Object.hasOwn(
          {
            "EV im": true,
            "EEn im": true,
            "EC im": true,
            "EB im": true,
            "EUn im": true,
            "EUn casubq": true,
            "patch tw": true,
            "patch ow": true,
            "oral E2": true,
            "sublingual E2": true,
            "gel E2": true,
          },
          medication.modelKey,
        ),
        medication.id,
      );
    } else {
      assert.equal(medication.modelKey, null);
    }
  }
});

test("all estradiol entries have a sourced route-specific model", () => {
  const estradiolEntries = MEDICATIONS.filter(
    (medication) => medication.category === "estrogen",
  );

  assert.equal(estradiolEntries.length, 10);
  assert.ok(estradiolEntries.every((medication) => medication.concentration));
  assert.ok(estradiolEntries.every((medication) => medication.modelKey));
});
