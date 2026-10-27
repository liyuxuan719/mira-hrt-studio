import { MEDICATION_LOOKUP } from "./data.js";

export const DAY_MS = 24 * 60 * 60 * 1000;
export const ESTRADIOL_PMOL_FACTOR = 3.6713;

/*
 * The three-compartment disposition functions and point-estimate parameters
 * below are adapted from estrannaise.js by WHSAH (MIT License).
 * See THIRD_PARTY_NOTICES.md and licenses/estrannaise-LICENSE.
 */
export const PK_PARAMETERS = {
  "EV im": [478.0, 0.236, 4.85, 1.24],
  "EEn im": [191.4, 0.119, 0.601, 0.402],
  "EC im": [246.0, 0.0825, 3.57, 0.669],
  "EB im": [1893.1, 0.67, 61.5, 4.34],
  "EUn im": [471.5, 0.01729, 6.528, 2.285],
  "EUn casubq": [16.15, 0.046, 0.022, 0.101],
  "patch tw": [16.792, 0.283, 5.592, 4.3],
  "patch ow": [59.481, 0.107, 7.842, 5.193],
};

const PATCH_DURATION_DAYS = {
  "patch tw": 3.5,
  "patch ow": 7,
};

/*
 * Oral, sublingual, and transdermal gel model structure follows the MIT-licensed
 * Transmtf HRT Tracker public PK engine, simplified to this app's fixed 70 kg
 * population assumptions. See THIRD_PARTY_NOTICES.md.
 */
const CORE_BODY_WEIGHT_KG = 70;
const CORE_VD_PER_KG_L = 2;
const CORE_CLEARANCE_PER_HOUR = 0.41;
const CORE_VOLUME_ML = CORE_VD_PER_KG_L * CORE_BODY_WEIGHT_KG * 1000;
const ORAL_BIOAVAILABILITY = 0.03;
const ORAL_ABSORPTION_PER_HOUR = 0.32;
const SUBLINGUAL_ABSORPTION_PER_HOUR = 1.8;
const SUBLINGUAL_FAST_FRACTION = 0.11;
const GEL_STANDARD = {
  concentrationMgPerMl: 0.6,
  referenceDoseMg: 1.5,
  defaultAreaCm2: 750,
  kPenBasePerHour: 0.14,
  kLossPerHour: 1.26,
  kReleasePerHour: 0.022,
};

function e2Curve3C(t, dose, d, k1, k2, k3, Ds = 0, D2 = 0) {
  if (t < 0) {
    return 0;
  }

  let result = 0;

  if (D2 > 0) {
    result += D2 * Math.exp(-k3 * t);
  }

  if (Ds > 0) {
    if (k2 === k3) {
      result += Ds * k2 * t * Math.exp(-k2 * t);
    } else {
      result +=
        (Ds * k2 * (Math.exp(-k3 * t) - Math.exp(-k2 * t))) / (k2 - k3);
    }
  }

  if (dose > 0 && d > 0) {
    if (k1 === k2 && k2 === k3) {
      result += (dose * d * k1 * k1 * t * t * Math.exp(-k1 * t)) / 2;
    } else if (k1 === k2 && k2 !== k3) {
      result +=
        (dose *
          d *
          k1 *
          k1 *
          (Math.exp(-k3 * t) - Math.exp(-k1 * t) * (1 + (k1 - k3) * t))) /
        (k1 - k3) /
        (k1 - k3);
    } else if (k1 !== k2 && k1 === k3) {
      result +=
        (dose *
          d *
          k1 *
          k2 *
          (Math.exp(-k2 * t) - Math.exp(-k1 * t) * (1 + (k1 - k2) * t))) /
        (k1 - k2) /
        (k1 - k2);
    } else if (k1 !== k2 && k2 === k3) {
      result +=
        (dose *
          d *
          k1 *
          k2 *
          (Math.exp(-k1 * t) - Math.exp(-k2 * t) * (1 - (k1 - k2) * t))) /
        (k1 - k2) /
        (k1 - k2);
    } else {
      result +=
        dose *
        d *
        k1 *
        k2 *
        (Math.exp(-k1 * t) / (k1 - k2) / (k1 - k3) -
          Math.exp(-k2 * t) / (k1 - k2) / (k2 - k3) +
          Math.exp(-k3 * t) / (k1 - k3) / (k2 - k3));
    }
  }

  return Number.isFinite(result) ? result : 0;
}

function esSingleDose3C(t, dose, d, k1, k2) {
  if (t < 0) {
    return 0;
  }

  if (dose <= 0 || d <= 0) {
    return 0;
  }

  if (k1 === k2) {
    return dose * d * k1 * t * Math.exp(-k1 * t);
  }

  return (dose * d * k1 * (Math.exp(-k2 * t) - Math.exp(-k1 * t))) / (k1 - k2);
}

function e2Patch3C(t, dose, d, k1, k2, k3, wearDays) {
  if (t < 0) {
    return 0;
  }

  if (t <= wearDays) {
    return e2Curve3C(t, dose, d, k1, k2, k3);
  }

  const elapsed = t - wearDays;
  const depotAtRemoval = esSingleDose3C(wearDays, dose, d, k1, k2);
  const estradiolAtRemoval = e2Curve3C(
    wearDays,
    dose,
    d,
    k1,
    k2,
    k3,
  );

  return e2Curve3C(
    elapsed,
    0,
    d,
    k1,
    k2,
    k3,
    depotAtRemoval,
    estradiolAtRemoval,
  );
}

function oneCompCentralAmount(dose, tHours, bioavailability, ka, ke) {
  if (tHours <= 0 || dose <= 0) {
    return 0;
  }
  if (Math.abs(ka - ke) < 1e-9) {
    return dose * bioavailability * ka * tHours * Math.exp(-ke * tHours);
  }
  return (
    (dose * bioavailability * ka * (Math.exp(-ke * tHours) - Math.exp(-ka * tHours))) /
    (ka - ke)
  );
}

function separateEigenvalues(a, b, c) {
  const epsilon = 1e-6;
  let x = a;
  let y = b;
  let z = c;
  if (Math.abs(x - y) < epsilon) y += epsilon;
  if (Math.abs(x - z) < epsilon) z += epsilon;
  if (Math.abs(y - z) < epsilon) z += epsilon;
  return [x, y, z];
}

function gelCentralAmount(
  doseMg,
  tHours,
  kPenPerHour,
  kLossPerHour,
  kReleasePerHour,
  eliminationPerHour,
) {
  if (
    doseMg <= 0 ||
    tHours <= 0 ||
    kPenPerHour <= 0 ||
    kLossPerHour < 0 ||
    kReleasePerHour <= 0 ||
    eliminationPerHour <= 0
  ) {
    return 0;
  }
  const [a, b, c] = separateEigenvalues(
    kPenPerHour + kLossPerHour,
    kReleasePerHour,
    eliminationPerHour,
  );
  const expA = Math.exp(-a * tHours) / ((b - a) * (c - a));
  const expB = Math.exp(-b * tHours) / ((a - b) * (c - b));
  const expC = Math.exp(-c * tHours) / ((a - c) * (b - c));
  return Math.max(
    0,
    doseMg * kPenPerHour * kReleasePerHour * (expA + expB + expC),
  );
}

function gelSkinAmount(doseMg, tHours, kPenPerHour, kLossPerHour, kReleasePerHour) {
  if (doseMg <= 0 || tHours <= 0) {
    return 0;
  }
  const surfaceRate = kPenPerHour + kLossPerHour;
  const releaseRate =
    Math.abs(surfaceRate - kReleasePerHour) < 1e-6
      ? kReleasePerHour + 1e-6
      : kReleasePerHour;
  return Math.max(
    0,
    (doseMg *
      kPenPerHour *
      (Math.exp(-surfaceRate * tHours) -
        Math.exp(-releaseRate * tHours))) /
      (releaseRate - surfaceRate),
  );
}

function gelCentralAmountWithWash(
  doseMg,
  tHours,
  kPenPerHour,
  kLossPerHour,
  kReleasePerHour,
  eliminationPerHour,
  washAfterHours,
) {
  if (!Number.isFinite(washAfterHours) || washAfterHours <= 0 || tHours <= washAfterHours) {
    return gelCentralAmount(
      doseMg,
      tHours,
      kPenPerHour,
      kLossPerHour,
      kReleasePerHour,
      eliminationPerHour,
    );
  }
  const skinAtWash = gelSkinAmount(
    doseMg,
    washAfterHours,
    kPenPerHour,
    kLossPerHour,
    kReleasePerHour,
  );
  const centralAtWash = gelCentralAmount(
    doseMg,
    washAfterHours,
    kPenPerHour,
    kLossPerHour,
    kReleasePerHour,
    eliminationPerHour,
  );
  const elapsed = tHours - washAfterHours;
  const adjustedElimination =
    Math.abs(kReleasePerHour - eliminationPerHour) < 1e-6
      ? eliminationPerHour + 1e-6
      : eliminationPerHour;
  const centralAfterWash =
    centralAtWash * Math.exp(-adjustedElimination * elapsed) +
    (kReleasePerHour *
      skinAtWash *
      (Math.exp(-kReleasePerHour * elapsed) -
        Math.exp(-adjustedElimination * elapsed))) /
      (adjustedElimination - kReleasePerHour);
  return Math.max(0, centralAfterWash);
}

function amountMgToPgMl(amountMg) {
  return (amountMg * 1e9) / CORE_VOLUME_ML;
}

function gelContributionPgMl(doseMg, elapsedDays, extras = {}) {
  const tHours = elapsedDays * 24;
  if (tHours <= 0 || doseMg <= 0) {
    return 0;
  }
  const areaCm2 = Number.isFinite(Number(extras.gelAreaCm2))
    ? Math.min(5000, Math.max(1, Number(extras.gelAreaCm2)))
    : GEL_STANDARD.defaultAreaCm2;
  const concentration = Number.isFinite(Number(extras.gelConcentration))
    ? Math.min(10, Math.max(0.01, Number(extras.gelConcentration)))
    : GEL_STANDARD.concentrationMgPerMl;
  const siteFactors = {
    arm: 1,
    thigh: 1,
    abdomen: 1.1,
  };
  const siteFactor = siteFactors[extras.gelSite] ?? 1;
  const sigma = doseMg / areaCm2;
  const sigmaReference =
    GEL_STANDARD.referenceDoseMg / GEL_STANDARD.defaultAreaCm2;
  const sigmaSaturation =
    0.008 * (concentration / 1.0);
  const densityFactor = Math.min(
    2,
    Math.max(
      0.5,
      (1 + sigmaReference / sigmaSaturation) / (1 + sigma / sigmaSaturation),
    ),
  );
  const amountMg = gelCentralAmount(
    doseMg,
    tHours,
    GEL_STANDARD.kPenBasePerHour * siteFactor * densityFactor,
    GEL_STANDARD.kLossPerHour,
    GEL_STANDARD.kReleasePerHour,
    CORE_CLEARANCE_PER_HOUR,
  );
  const washedAmount =
    extras.gelWashAfterHours !== null &&
    extras.gelWashAfterHours !== undefined &&
    Number.isFinite(Number(extras.gelWashAfterHours)) &&
    Number(extras.gelWashAfterHours) > 0
      ? amountMgToPgMl(
          gelCentralAmountWithWash(
            doseMg,
            tHours,
            GEL_STANDARD.kPenBasePerHour * siteFactor * densityFactor,
            GEL_STANDARD.kLossPerHour,
            GEL_STANDARD.kReleasePerHour,
            CORE_CLEARANCE_PER_HOUR,
            Number(extras.gelWashAfterHours),
          ),
        )
      : null;
  return washedAmount ?? amountMgToPgMl(amountMg);
}

export function doseContributionPgMl(modelKey, dose, elapsedDays, extras = {}) {
  if (!Number.isFinite(dose) || dose <= 0) {
    return 0;
  }

  if (modelKey === "oral E2") {
    const amountMg = oneCompCentralAmount(
      dose,
      elapsedDays * 24,
      ORAL_BIOAVAILABILITY,
      ORAL_ABSORPTION_PER_HOUR,
      CORE_CLEARANCE_PER_HOUR,
    );
    return Math.max(0, amountMgToPgMl(amountMg));
  }

  if (modelKey === "sublingual E2") {
    const holdMinutes = Number(extras.sublingualHoldMinutes);
    const tierFraction = Number.isFinite(holdMinutes)
      ? holdMinutes <= 3
        ? 0.01
        : holdMinutes <= 7
          ? 0.04
          : holdMinutes <= 12
            ? 0.11
            : 0.18
      : SUBLINGUAL_FAST_FRACTION;
    const theta = Math.min(1, Math.max(0, tierFraction));
    const tHours = elapsedDays * 24;
    const fastAmount = oneCompCentralAmount(
      dose * theta,
      tHours,
      1,
      SUBLINGUAL_ABSORPTION_PER_HOUR,
      CORE_CLEARANCE_PER_HOUR,
    );
    const swallowedAmount =
      extras.sublingualSwallowed === false
        ? 0
        : oneCompCentralAmount(
            dose * (1 - theta),
            tHours,
            ORAL_BIOAVAILABILITY,
            ORAL_ABSORPTION_PER_HOUR,
            CORE_CLEARANCE_PER_HOUR,
          );
    return Math.max(0, amountMgToPgMl(fastAmount + swallowedAmount));
  }

  if (modelKey === "gel E2") {
    return gelContributionPgMl(dose, elapsedDays, extras);
  }

  const parameters = PK_PARAMETERS[modelKey];
  if (!parameters) {
    return 0;
  }

  const [d, k1, k2, k3] = parameters;
  const wearDays = PATCH_DURATION_DAYS[modelKey];

  if (wearDays) {
    return e2Patch3C(elapsedDays, dose, d, k1, k2, k3, wearDays);
  }

  return e2Curve3C(elapsedDays, dose, d, k1, k2, k3);
}

export function expandDoseEvents(doseLogs, untilMs, lookup = MEDICATION_LOOKUP) {
  const events = [];

  for (const log of doseLogs) {
    const medication = lookup.get(log.medicationId);
    if (!medication?.modelKey || !Number.isFinite(Number(log.dose))) {
      continue;
    }

    const startMs = Date.parse(log.takenAt);
    if (!Number.isFinite(startMs) || startMs > untilMs) {
      continue;
    }

    const repeatDays = Number(log.repeatDays);
    const repeatMs =
      Number.isFinite(repeatDays) && repeatDays >= 0.25
        ? repeatDays * DAY_MS
        : 0;

    let eventTime = startMs;
    let count = 0;

    while (eventTime <= untilMs && count < 1200) {
      events.push({
        ...log,
        medication,
        dose: Number(log.dose),
        modelExtras: log.modelExtras ?? {},
        timestampMs: eventTime,
      });
      count += 1;

      if (!repeatMs) {
        break;
      }

      eventTime += repeatMs;
    }
  }

  return events.sort((a, b) => a.timestampMs - b.timestampMs);
}

export function concentrationAtMs(
  timestampMs,
  doseEvents,
) {
  let total = 0;

  for (const event of doseEvents) {
    if (event.timestampMs > timestampMs) {
      break;
    }

    const elapsedDays = (timestampMs - event.timestampMs) / DAY_MS;
    total += doseContributionPgMl(
      event.medication.modelKey,
      event.dose,
      elapsedDays,
      event.modelExtras,
    );
  }

  return Math.max(0, total);
}

export function buildConcentrationSeries({
  doseLogs,
  startMs,
  endMs,
  points = 240,
  lookup = MEDICATION_LOOKUP,
}) {
  const safePoints = Math.max(2, Math.floor(points));
  const events = expandDoseEvents(doseLogs, endMs, lookup);
  const step = (endMs - startMs) / (safePoints - 1);

  return Array.from({ length: safePoints }, (_, index) => {
    const timestampMs = Math.round(startMs + step * index);
    return {
      timestampMs,
      pgMl: concentrationAtMs(timestampMs, events),
    };
  });
}

export function getFutureDoseMarkers({
  doseLogs,
  nowMs,
  endMs,
  lookup = MEDICATION_LOOKUP,
}) {
  return expandDoseEvents(doseLogs, endMs, lookup)
    .filter((event) => event.timestampMs > nowMs)
    .map((event) => ({
      timestampMs: event.timestampMs,
      medicationId: event.medicationId,
      medicationName: event.medication.name,
      dose: event.dose,
      unit: event.medication.unit,
    }));
}

export function nearestMedicationForDate(dateString) {
  return MEDICATION_LOOKUP.get(dateString) ?? null;
}
