import test from "node:test";
import assert from "node:assert/strict";
import { validateBackup, labsCsv, csvCell } from "../src/backup.js";

const backup = () => ({ app: "MIRA HRT Studio", version: 1, data: {
  version: 1, settings: { isDemo: true },
  doses: [{ id: "d1", medicationId: "estradiol-valerate-im", dose: 3,
    takenAt: "2026-01-01T08:00:00Z", repeatDays: null }],
  labs: [{ id: "l1", labAt: "2026-01-02T08:00:00Z", estradiolPgMl: 0 }],
} });

test("wrapped and legacy backups preserve counts, zero results and demo provenance", () => {
  const input = backup();
  assert.equal(validateBackup(input).labs[0].estradiolPgMl, 0);
  assert.equal(validateBackup(input.data).settings.isDemo, true);
  assert.equal(validateBackup(input).doses.length, 1);
});

test("unrelated, future and damaged backups are rejected before normalization", () => {
  for (const payload of [{}, [], null, { data: {} }, { ...backup(), app: "other" },
    { ...backup(), version: 2 }]) assert.throws(() => validateBackup(payload));
  for (const change of [
    (d) => d.doses[0].medicationId = "unknown",
    (d) => d.doses[0].dose = true,
    (d) => d.doses[0].repeatDays = -1,
    (d) => d.doses[0].takenAt = null,
    (d) => d.doses.push({ ...d.doses[0] }),
    (d) => d.labs[0].estradiolPgMl = "bad",
    (d) => d.labs[0].labAt = "invalid",
    (d) => d.version = 2,
    (d) => d.doses[0].modelExtras = { gelAreaCm2: -1 },
    (d) => d.doses[0].modelExtras = { unsupported: 1 },
    (d) => d.doses[0].note = "x".repeat(201),
  ]) { const value = backup(); change(value.data); assert.throws(() => validateBackup(value)); }
});

test("lab CSV preserves full rows, null cells, notes and provenance in time order", () => {
  const csv = labsCsv([
    { labAt: "2026-02-02T00:00:00Z", estradiolPgMl: 123, note: 'line,"two"\nnext' },
    { labAt: "2026-02-01T00:00:00Z", testosteroneNgDl: 0, note: " =SUM(A1)" },
  ], true);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.indexOf("2026-02-01") < csv.indexOf("2026-02-02"));
  assert.ok(csv.includes('"","0",""'));
  assert.ok(csv.includes('"\' =SUM(A1)"'));
  assert.ok(csv.includes('line,""two""\nnext'));
  assert.ok(csv.endsWith('"yes"'));
});

test("CSV protects spreadsheet formulas after leading whitespace and control characters", () => {
  for (const input of ["=1+1", " +1", "\t@sum(A1)", "\nhello", "\u0000-1"]) {
    assert.ok(csvCell(input).startsWith('"\''));
  }
  assert.equal(csvCell('ordinary "note"'), '"ordinary ""note"""');
});
