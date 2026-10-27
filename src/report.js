import { MEDICATION_LOOKUP } from "./data.js";
import {
  concentrationAtMs,
  expandDoseEvents,
} from "./model.js";

function withinRange(timestamp, startMs, endMs) {
  return timestamp >= startMs && timestamp <= endMs;
}

export function buildClinicalReportData({
  doses,
  labs,
  startMs,
  endMs,
  maxDoses = 8,
  maxLabs = 6,
  maxResiduals = 4,
  lookup = MEDICATION_LOOKUP,
}) {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs > endMs) {
    throw new Error("Invalid report date range.");
  }

  const doseEntries = doses
    .map((entry) => ({
      ...entry,
      medication: lookup.get(entry.medicationId),
      timestampMs: Date.parse(entry.takenAt),
    }))
    .filter(
      (entry) =>
        entry.medication &&
        Number.isFinite(entry.timestampMs) &&
        withinRange(entry.timestampMs, startMs, endMs),
    )
    .sort((a, b) => a.timestampMs - b.timestampMs);

  const labEntries = labs
    .map((entry) => ({
      ...entry,
      timestampMs: Date.parse(entry.labAt),
    }))
    .filter(
      (entry) =>
        Number.isFinite(entry.timestampMs) &&
        withinRange(entry.timestampMs, startMs, endMs),
    )
    .sort((a, b) => a.timestampMs - b.timestampMs);

  const uniqueMedicationIds = [
    ...new Set(doseEntries.map((entry) => entry.medicationId)),
  ];
  const displayedDoses = doseEntries.slice(-Math.max(0, maxDoses));
  const displayedLabs = labEntries.slice(-Math.max(0, maxLabs));

  const residuals = labEntries
    .filter((lab) => Number.isFinite(lab.estradiolPgMl))
    .map((lab) => {
      const modeledEvents = expandDoseEvents(doses, lab.timestampMs, lookup);
      if (!modeledEvents.length) {
        return null;
      }
      const estimatedPgMl = concentrationAtMs(
        lab.timestampMs,
        modeledEvents,
      );
      const residualPgMl = lab.estradiolPgMl - estimatedPgMl;
      return {
        ...lab,
        estimatedPgMl,
        residualPgMl,
        residualPercent:
          estimatedPgMl > 0 ? (residualPgMl / estimatedPgMl) * 100 : null,
      };
    })
    .filter(Boolean)
    .slice(-Math.max(0, maxResiduals));

  return {
    startMs,
    endMs,
    doseEntries,
    labEntries,
    displayedDoses,
    displayedLabs,
    residuals,
    uniqueMedications: uniqueMedicationIds
      .map((id) => lookup.get(id))
      .filter(Boolean),
    doseCount: doseEntries.length,
    labCount: labEntries.length,
    residualCount: residuals.length,
  };
}
