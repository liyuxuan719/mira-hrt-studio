import { MEDICATION_LOOKUP } from "./data.js";

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
const numeric = (value) =>
  (typeof value === "number" || typeof value === "string") &&
  String(value).trim() !== "" && Number.isFinite(Number(value));
const timestamp = (value) => typeof value === "string" && Number.isFinite(Date.parse(value));
const extraRanges = {
  gelConcentration: [0.01, 10], gelAreaCm2: [1, 5000], gelWashAfterHours: [0.25, 24],
  sublingualHoldMinutes: [1, 120], patchIntervalDays: [0.5, 14],
};
const extraChoices = {
  gelSite: ["arm", "thigh", "abdomen"], oralWithFood: ["unknown", "empty", "with-food"],
  injectionCarrierOil: ["unknown", "castor", "sesame", "tea-seed", "other"],
  injectionSite: ["unknown", "gluteal", "ventrogluteal", "thigh", "deltoid", "subcutaneous"],
};

function validateExtras(extras) {
  if (extras === undefined) return;
  if (!isObject(extras)) throw new TypeError("Invalid dose details.");
  for (const [key, value] of Object.entries(extras)) {
    const range = extraRanges[key];
    const choices = extraChoices[key];
    const valid = range ? numeric(value) && Number(value) >= range[0] && Number(value) <= range[1]
      : choices ? choices.includes(value)
        : key === "sublingualSwallowed" ? typeof value === "boolean"
          : key === "patchBrand" ? typeof value === "string" && value.length <= 80 : false;
    if (!valid) throw new TypeError("Invalid or unsupported dose details.");
  }
}

/** Validate before normalization so an unrelated or damaged file cannot erase records. */
export function validateBackup(payload) {
  if (!isObject(payload) || (payload.app !== undefined && payload.app !== "MIRA HRT Studio")) {
    throw new TypeError("This is not a MIRA backup.");
  }
  if (payload.version !== undefined && payload.version !== 1) {
    throw new RangeError("Unsupported backup schema version.");
  }
  const data = payload.data === undefined ? payload : payload.data;
  if (!isObject(data) || !Array.isArray(data.doses) || !Array.isArray(data.labs) ||
      (data.version !== undefined && data.version !== 1) ||
      (data.settings !== undefined && !isObject(data.settings))) {
    throw new TypeError("Invalid backup structure.");
  }
  for (const [kind, rows] of [["dose", data.doses], ["lab", data.labs]]) {
    const ids = new Set();
    for (const row of rows) {
      if (!isObject(row)) throw new TypeError(`Invalid ${kind} record.`);
      if (row.note !== undefined && (typeof row.note !== "string" || row.note.length > 200)) {
        throw new TypeError("Invalid or oversized note.");
      }
      if (row.id !== undefined && (typeof row.id !== "string" || !row.id.trim() || ids.has(row.id))) {
        throw new TypeError(`Duplicate or invalid ${kind} ID.`);
      }
      if (row.id) ids.add(row.id);
      if (kind === "dose") {
        validateExtras(row.modelExtras);
        if (!MEDICATION_LOOKUP.has(row.medicationId) || !numeric(row.dose) || Number(row.dose) <= 0 ||
            !timestamp(row.takenAt) ||
            (row.repeatDays !== null && row.repeatDays !== undefined &&
              (!numeric(row.repeatDays) || Number(row.repeatDays) < 0.25))) {
          throw new TypeError("Invalid medication record.");
        }
      } else {
        const values = [row.estradiolPgMl, row.testosteroneNgDl, row.prolactinNgMl];
        const present = values.filter((value) => value !== null && value !== undefined && value !== "");
        if (!timestamp(row.labAt) || !present.length ||
            present.some((value) => !numeric(value) || Number(value) < 0)) {
          throw new TypeError("Invalid laboratory record.");
        }
      }
    }
  }
  return data;
}

export function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s\u0000-\u001f]*[=+\-@]/u.test(text) || /^[\t\r\n]/u.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function labsCsv(labs, isDemo = false) {
  const rows = [["lab_at", "estradiol_pg_ml", "testosterone_ng_dl", "prolactin_ng_ml", "note", "demo"]];
  for (const lab of [...labs].sort((a, b) => Date.parse(a.labAt) - Date.parse(b.labAt))) {
    rows.push([new Date(lab.labAt).toISOString(), lab.estradiolPgMl,
      lab.testosteroneNgDl, lab.prolactinNgMl, lab.note, isDemo ? "yes" : "no"]);
  }
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}
