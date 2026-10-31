import {
  CATEGORIES,
  ESTRADIOL_UNIT_FACTOR,
  MEDICATIONS,
  MEDICATION_LOOKUP,
  REFERENCE_RANGES,
  SOURCES,
  TESTOSTERONE_UNIT_FACTOR,
  getCategoryLabel,
  getMedication,
  getSource,
  sourceItemsForMedication,
} from "../src/data.js";
import {
  DAY_MS,
  buildConcentrationSeries,
  concentrationAtMs,
  expandDoseEvents,
  getFutureDoseMarkers,
} from "../src/model.js";
import { buildClinicalReportData } from "../src/report.js";
import { validateBackup, csvCell, labsCsv } from "../src/backup.js";
import {
  SUPPORTED_LANGUAGES,
  languageDefinition,
  onboardingCopy,
  reportCopy,
  translateEnglish,
} from "../src/i18n.js";
import {
  GUIDE_CATEGORIES,
  GUIDE_TOPICS,
  MTF_WIKI_SOURCE,
  mtfWikiUrl,
} from "../src/guide.js";

const STORAGE_KEY = "mira-hrt-studio-v1";
const VIEW_LABELS = {
  overview: "总览",
  guide: "HRT 指南",
  doses: "用药记录",
  labs: "化验结果",
  library: "药品资料",
  safety: "模型与安全",
};

const state = {
  data: null,
  activeView: "overview",
  selectedCategory: "all",
  guideCategory: "all",
  toastTimer: null,
  chart: null,
  labChart: null,
  traditionalConverter: null,
  onboardingStep: 0,
  onboardingLanguage: "zh-Hans",
  onboardingFirstRun: false,
  onboardingStartChoice: "demo",
  editingDoseId: null,
  els: {},
};

function createId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function shiftDate(days, source = new Date()) {
  return new Date(source.getTime() + days * DAY_MS);
}

function createDemoState(settings = {}) {
  const now = new Date();
  const doseAt = shiftDate(-3, now);
  doseAt.setHours(20, 0, 0, 0);
  const labAt = shiftDate(-2, now);
  labAt.setHours(9, 15, 0, 0);

  return {
    version: 1,
    settings: {
      concentrationUnit: settings.concentrationUnit ?? "pg/mL",
      chartRange: settings.chartRange ?? 14,
      isDemo: true,
      language: settings.language ?? "zh-Hans",
      onboardingCompleted: Boolean(settings.onboardingCompleted),
    },
    doses: [
      {
        id: "demo-dose-estradiol-valerate",
        medicationId: "estradiol-valerate-im",
        dose: 3,
        takenAt: doseAt.toISOString(),
        repeatDays: 7,
        note: "演示数据 · 请勿作为处方",
      },
    ],
    labs: [
      {
        id: "demo-lab-estradiol",
        labAt: labAt.toISOString(),
        estradiolPgMl: 156,
        testosteroneNgDl: 31,
        prolactinNgMl: 12,
        note: "演示化验数据",
      },
    ],
  };
}

function createEmptyState(settings = {}) {
  return {
    version: 1,
    settings: {
      concentrationUnit: settings.concentrationUnit ?? "pg/mL",
      chartRange: settings.chartRange ?? 14,
      isDemo: false,
      language: settings.language ?? "zh-Hans",
      onboardingCompleted: Boolean(settings.onboardingCompleted),
    },
    doses: [],
    labs: [],
  };
}

function normalizeState(input) {
  if (!input || typeof input !== "object") {
    return createDemoState();
  }

  const settings = {
    concentrationUnit:
      input.settings?.concentrationUnit === "pmol/L" ? "pmol/L" : "pg/mL",
    chartRange: [7, 14, 30].includes(Number(input.settings?.chartRange))
      ? Number(input.settings.chartRange)
      : 14,
    isDemo: Boolean(input.settings?.isDemo),
    language: SUPPORTED_LANGUAGES.some(
      (language) => language.id === input.settings?.language,
    )
      ? input.settings.language
      : "zh-Hans",
    onboardingCompleted: Boolean(input.settings?.onboardingCompleted),
  };

  const doses = Array.isArray(input.doses)
    ? input.doses
        .filter(
          (entry) =>
            entry &&
            MEDICATION_LOOKUP.has(entry.medicationId) &&
            Number.isFinite(Number(entry.dose)) &&
            Number(entry.dose) > 0 &&
            Number.isFinite(Date.parse(entry.takenAt)),
        )
        .map((entry) => {
          const repeatDays = Number(entry.repeatDays);
          return {
            id: String(entry.id || createId("dose")),
            medicationId: entry.medicationId,
            dose: Number(entry.dose),
            takenAt: new Date(entry.takenAt).toISOString(),
            repeatDays:
              Number.isFinite(repeatDays) && repeatDays >= 0.25
                ? repeatDays
                : null,
            note: String(entry.note ?? "").slice(0, 200),
            modelExtras: normalizeDoseExtras(entry.modelExtras),
          };
        })
    : [];

  const labs = Array.isArray(input.labs)
    ? input.labs
        .filter((entry) => entry && Number.isFinite(Date.parse(entry.labAt)))
        .map((entry) => ({
          id: String(entry.id || createId("lab")),
          labAt: new Date(entry.labAt).toISOString(),
          estradiolPgMl: finitePositive(entry.estradiolPgMl),
          testosteroneNgDl: finitePositive(entry.testosteroneNgDl),
          prolactinNgMl: finitePositive(entry.prolactinNgMl),
          note: String(entry.note ?? "").slice(0, 200),
        }))
        .filter(
          (entry) =>
            entry.estradiolPgMl !== null ||
            entry.testosteroneNgDl !== null ||
            entry.prolactinNgMl !== null,
        )
    : [];

  return { version: 1, settings, doses, labs };
}

function finitePositive(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function normalizeDoseExtras(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }
  const numberInRange = (value, min, max) => {
    const number = Number(value);
    return Number.isFinite(number) && number >= min && number <= max
      ? number
      : undefined;
  };
  const enumValue = (value, allowed) =>
    typeof value === "string" && allowed.includes(value) ? value : undefined;
  const clean = {
    gelConcentration: numberInRange(input.gelConcentration, 0.01, 10),
    gelAreaCm2: numberInRange(input.gelAreaCm2, 1, 5000),
    gelSite: enumValue(input.gelSite, ["arm", "thigh", "abdomen"]),
    gelWashAfterHours: numberInRange(input.gelWashAfterHours, 0.25, 24),
    sublingualHoldMinutes: numberInRange(
      input.sublingualHoldMinutes,
      1,
      120,
    ),
    sublingualSwallowed:
      typeof input.sublingualSwallowed === "boolean"
        ? input.sublingualSwallowed
        : undefined,
    oralWithFood: enumValue(input.oralWithFood, [
      "unknown",
      "empty",
      "with-food",
    ]),
    injectionCarrierOil: enumValue(input.injectionCarrierOil, [
      "unknown",
      "castor",
      "sesame",
      "tea-seed",
      "other",
    ]),
    injectionSite: enumValue(input.injectionSite, [
      "unknown",
      "gluteal",
      "ventrogluteal",
      "thigh",
      "deltoid",
      "subcutaneous",
    ]),
    patchBrand:
      typeof input.patchBrand === "string"
        ? input.patchBrand.trim().slice(0, 80)
        : undefined,
    patchIntervalDays: numberInRange(input.patchIntervalDays, 0.5, 14),
  };
  return Object.fromEntries(
    Object.entries(clean).filter(([, value]) => value !== undefined),
  );
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDemoState();
    }
    const parsed = JSON.parse(raw);
    const normalized = normalizeState(parsed);
    // Existing records predate onboarding; never force a data reset on upgrade.
    if (parsed.settings?.onboardingCompleted === undefined) {
      normalized.settings.onboardingCompleted = true;
    }
    return normalized;
  } catch {
    return createDemoState();
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  } catch {
    showToast("浏览器未允许本地保存");
  }
}

function getElement(id) {
  return document.getElementById(id);
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function refreshIcons() {
  if (globalThis.lucide?.createIcons) {
    globalThis.lucide.createIcons();
  }
}

function currentLanguage() {
  return state.data?.settings?.language ?? state.onboardingLanguage ?? "zh-Hans";
}

function getTraditionalConverter() {
  if (!state.traditionalConverter && globalThis.OpenCC?.Converter) {
    state.traditionalConverter = globalThis.OpenCC.Converter({
      from: "cn",
      to: "tw",
    });
  }
  return state.traditionalConverter;
}

function translateAppText(source, language = currentLanguage()) {
  const text = String(source);
  if (language === "en") {
    return translateEnglish(text);
  }
  if (language === "zh-Hant") {
    const converter = getTraditionalConverter();
    return converter ? converter(text) : text;
  }
  return text;
}

function translatePreservingWhitespace(value, language = currentLanguage()) {
  const match = String(value).match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match || !match[2]) {
    return value;
  }
  return `${match[1]}${translateAppText(match[2], language)}${match[3]}`;
}

function localizeDocument(root = document.body, language = currentLanguage()) {
  if (!root) {
    return;
  }
  const definition = languageDefinition(language);
  document.documentElement.lang = definition.htmlLang;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (
        !parent ||
        parent.closest("script, style, .notranslate, [data-no-translate]")
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return node.nodeValue.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }
  for (const node of textNodes) {
    node.nodeValue = translatePreservingWhitespace(node.nodeValue, language);
  }

  root.querySelectorAll("[placeholder], [aria-label], [title], [alt]").forEach((element) => {
    for (const attribute of ["placeholder", "aria-label", "title", "alt"]) {
      const value = element.getAttribute(attribute);
      if (value) {
        element.setAttribute(attribute, translateAppText(value, language));
      }
    }
  });

  const title = {
    "zh-Hans": "MIRA · HRT 用药记录与浓度估算",
    "zh-Hant": "MIRA · HRT 用藥紀錄與濃度估算",
    en: "MIRA · HRT Medication Log & Concentration Estimate",
  };
  document.title = title[language];
}

function scheduleLocalization(root = document.body) {
  window.requestAnimationFrame(() => {
    localizeDocument(root);
  });
}

function toCurrentLanguage(text) {
  return translateAppText(text, currentLanguage());
}

function showToast(message) {
  const { toast } = state.els;
  if (!toast) {
    return;
  }
  toast.querySelector("span").textContent = toCurrentLanguage(message);
  toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2400);
}

function renderOnboarding() {
  const { els } = state;
  const copy = onboardingCopy(state.onboardingLanguage);
  document.documentElement.lang =
    languageDefinition(state.onboardingLanguage).htmlLang;
  const totalSteps = 3;
  const currentStep = state.onboardingStep;
  const isFinalStep = currentStep === totalSteps - 1;
  const languageCards = SUPPORTED_LANGUAGES.map((language) => {
    const selected = language.id === state.onboardingLanguage;
    return `
      <button
        class="onboarding-language-card${selected ? " is-selected" : ""}"
        type="button"
        data-onboarding-language="${language.id}"
        aria-pressed="${selected}"
      >
        <span class="onboarding-language-symbol">${language.short}</span>
        <span>
          <strong>${language.label}</strong>
          <small>${language.englishLabel}</small>
        </span>
        <span class="language-check">
          <i data-lucide="check" aria-hidden="true"></i>
        </span>
      </button>
    `;
  }).join("");

  let content = "";
  if (currentStep === 0) {
    content = `
      <h2>${copy.languageTitle}</h2>
      <p class="onboarding-lead">${copy.languageBody}</p>
      <p class="panel-kicker onboarding-content-kicker">${copy.languageChoose}</p>
      <div class="onboarding-language-grid">${languageCards}</div>
      <p class="onboarding-meaning">${copy.meaning}</p>
    `;
  } else if (currentStep === 1) {
    content = `
      <h2>${copy.boundaryTitle}</h2>
      <p class="onboarding-lead">${copy.boundaryBody}</p>
      <div class="onboarding-info-grid">
        <article class="onboarding-info-card">
          <span class="onboarding-info-icon">
            <i data-lucide="chart-line" aria-hidden="true"></i>
          </span>
          <h3>${copy.estimateLabel}</h3>
          <p>${copy.estimateCopy}</p>
        </article>
        <article class="onboarding-info-card">
          <span class="onboarding-info-icon lab">
            <i data-lucide="flask-conical" aria-hidden="true"></i>
          </span>
          <h3>${copy.labLabel}</h3>
          <p>${copy.labCopy}</p>
        </article>
      </div>
      <div class="onboarding-safety">
        <i data-lucide="triangle-alert" aria-hidden="true"></i>
        <div>
          <strong>${copy.safetyTitle}</strong>
          <p>${copy.safetyCopy}</p>
        </div>
      </div>
      <div class="onboarding-privacy-row">
        <i data-lucide="lock-keyhole" aria-hidden="true"></i>
        <div>
          <strong>${copy.privacyLabel}</strong>
          <p>${copy.privacyCopy}</p>
        </div>
      </div>
    `;
  } else if (state.onboardingFirstRun) {
    content = `
      <h2>${copy.startTitle}</h2>
      <p class="onboarding-lead">${copy.startBody}</p>
      <div class="onboarding-choice-grid">
        <button
          class="onboarding-choice-card${state.onboardingStartChoice === "demo" ? " is-selected" : ""}"
          type="button"
          data-onboarding-start="demo"
          aria-pressed="${state.onboardingStartChoice === "demo"}"
        >
          <span class="onboarding-choice-check"></span>
          <span class="onboarding-choice-number">01</span>
          <strong>${copy.demoTitle}</strong>
          <p>${copy.demoCopy}</p>
        </button>
        <button
          class="onboarding-choice-card${state.onboardingStartChoice === "blank" ? " is-selected" : ""}"
          type="button"
          data-onboarding-start="blank"
          aria-pressed="${state.onboardingStartChoice === "blank"}"
        >
          <span class="onboarding-choice-check"></span>
          <span class="onboarding-choice-number">02</span>
          <strong>${copy.blankTitle}</strong>
          <p>${copy.blankCopy}</p>
        </button>
      </div>
    `;
  } else {
    content = `
      <h2>${copy.revisitTitle}</h2>
      <p class="onboarding-lead">${copy.revisitBody}</p>
      <div class="onboarding-revisit-note">
        <i data-lucide="shield-check" aria-hidden="true"></i>
        <div>
          <strong>${copy.privacyLabel}</strong>
          <p>${copy.privacyCopy}</p>
        </div>
      </div>
    `;
  }

  els.onboardingContent.innerHTML = content;
  els.onboardingKicker.textContent = copy.kicker;
  els.onboardingMeaning.textContent = copy.meaning;
  els.onboardingAsideCopy.textContent = copy.asideBody;
  els.onboardingProgress.innerHTML = copy.progress
    .map(
      (label, index) => `
        <span
          data-index="${index + 1}"
          class="${index === currentStep ? "is-active" : index < currentStep ? "is-complete" : ""}"
        >${label}</span>
      `,
    )
    .join("");
  els.onboardingBack.hidden = currentStep === 0;
  els.onboardingBack.querySelector("span").textContent = copy.back;
  els.onboardingNext.querySelector("span").textContent = isFinalStep
    ? state.onboardingFirstRun
      ? copy.finish
      : copy.finishRevisit
    : copy.next;
  els.onboardingStepLabel.textContent = copy.stepLabel(
    currentStep + 1,
    totalSteps,
  );
  els.onboardingClose.hidden = state.onboardingFirstRun;
  els.onboardingClose.setAttribute("aria-label", copy.close);
  els.onboardingLayer.setAttribute(
    "aria-label",
    state.onboardingLanguage === "en"
      ? "MIRA onboarding"
      : state.onboardingLanguage === "zh-Hant"
        ? "MIRA 引導"
        : "MIRA 引导",
  );
  refreshIcons();

  requestAnimationFrame(() => {
    const focusTarget =
      els.onboardingContent.querySelector(
        ".onboarding-language-card.is-selected, .onboarding-choice-card.is-selected",
      ) ?? els.onboardingContent.querySelector("h2");
    focusTarget?.setAttribute("tabindex", "-1");
    focusTarget?.focus({ preventScroll: true });
  });
}

function openOnboarding() {
  state.onboardingFirstRun = !state.data.settings.onboardingCompleted;
  state.onboardingStep = 0;
  state.onboardingLanguage = currentLanguage();
  state.onboardingStartChoice = state.data.settings.isDemo ? "demo" : "blank";
  state.els.onboardingLayer.hidden = false;
  state.els.appShell.inert = true;
  document.documentElement.classList.add("modal-open");
  renderOnboarding();
}

function hideOnboarding() {
  state.els.onboardingLayer.hidden = true;
  state.els.appShell.inert = false;
  if (!document.querySelector("dialog[open]")) {
    document.documentElement.classList.remove("modal-open");
  }
}

function finishOnboarding(revisit = false) {
  const selectedLanguage = state.onboardingLanguage;
  const settings = {
    ...state.data.settings,
    language: selectedLanguage,
    onboardingCompleted: true,
  };

  if (state.onboardingFirstRun) {
    state.data =
      state.onboardingStartChoice === "blank"
        ? createEmptyState(settings)
        : createDemoState(settings);
  } else {
    state.data.settings = settings;
  }

  persist();
  hideOnboarding();
  window.location.reload();
}

function closeOnboarding() {
  if (state.onboardingFirstRun) {
    return;
  }
  if (state.onboardingLanguage !== currentLanguage()) {
    state.data.settings.language = state.onboardingLanguage;
    persist();
    window.location.reload();
    return;
  }
  hideOnboarding();
}

function advanceOnboarding() {
  if (state.onboardingStep < 2) {
    state.onboardingStep += 1;
    renderOnboarding();
    return;
  }
  finishOnboarding();
}

function goBackOnboarding() {
  if (state.onboardingStep > 0) {
    state.onboardingStep -= 1;
    renderOnboarding();
  }
}

function formatDateTime(iso) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatFullDateTime(iso) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDateOnly(iso) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function formatRelativeDate(iso) {
  const date = new Date(iso);
  const now = new Date();
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((startNow - startDate) / DAY_MS);

  if (days === 0) {
    return `今天 ${date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  if (days === 1) {
    return `昨天 ${date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  return formatDateTime(iso);
}

function toLocalDateTimeInput(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

function concentrationFactor() {
  return state.data.settings.concentrationUnit === "pmol/L"
    ? ESTRADIOL_UNIT_FACTOR
    : 1;
}

function formatE2(pgMl, withUnit = false) {
  if (!Number.isFinite(pgMl)) {
    return "—";
  }
  const value = pgMl * concentrationFactor();
  const formatted =
    state.data.settings.concentrationUnit === "pmol/L"
      ? Math.round(value).toLocaleString("zh-CN")
      : value.toLocaleString("zh-CN", {
          minimumFractionDigits: value < 10 ? 1 : 0,
          maximumFractionDigits: 1,
        });
  return withUnit
    ? `${formatted} ${state.data.settings.concentrationUnit}`
    : formatted;
}

function safeNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function setFormError(element, message) {
  element.textContent = message ? toCurrentLanguage(message) : "";
}

function updateDateHeader() {
  const now = new Date();
  const english = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
  })
    .format(now)
    .toUpperCase();
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(
    now,
  );
  const month = new Intl.DateTimeFormat("en-US", { month: "short" })
    .format(now)
    .toUpperCase();

  state.els.todayLabel.textContent = english;
  state.els.dateDay.textContent = String(now.getDate()).padStart(2, "0");
  state.els.dateMonth.textContent = month;
  state.els.dateWeekday.textContent = weekday;
}

function populateMedicationOptions() {
  const select = state.els.doseMedication;
  select.replaceChildren(new Option("选择药品", ""));

  for (const category of CATEGORIES.filter((item) => item.id !== "all")) {
    const group = document.createElement("optgroup");
    group.label = category.label;
    for (const medication of MEDICATIONS.filter(
      (item) => item.category === category.id,
    )) {
      group.append(
        new Option(
          `${medication.name} · ${medication.abbreviation}（${medication.routeLabel}）`,
          medication.id,
        ),
      );
    }
    select.append(group);
  }

  const filter = state.els.doseCategoryFilter;
  CATEGORIES.filter((item) => item.id !== "all").forEach((category) => {
    filter.append(new Option(category.label, category.id));
  });
}

function renderCategoryChips() {
  const container = state.els.categoryFilter;
  container.replaceChildren();

  for (const category of CATEGORIES) {
    const button = makeElement("button", "filter-chip", category.label);
    button.type = "button";
    button.dataset.category = category.id;
    button.classList.toggle("is-active", state.selectedCategory === category.id);
    container.append(button);
  }
}

function renderSourceList() {
  const container = state.els.sourceList;
  container.replaceChildren();

  for (const source of SOURCES) {
    const article = makeElement("article", "source-item");
    const text = makeElement("div");
    const title = makeElement("h3", null, source.title);
    const publisher = makeElement("p");
    publisher.append(
      makeElement("span", null, source.publisher),
      document.createTextNode(" · "),
      makeElement("span", null, source.note),
    );
    const license = makeElement(
      "span",
      "source-license",
      `许可 / 状态：${source.license}`,
    );
    text.append(title, publisher, license);

    const link = makeElement("a", "source-link");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `打开来源：${source.title}`);
    link.innerHTML = '<i data-lucide="external-link" aria-hidden="true"></i>';

    article.append(text, link);
    container.append(article);
  }
}

function getLatestLabWith(metric) {
  return [...state.data.labs]
    .filter((lab) => Number.isFinite(lab[metric]))
    .sort((a, b) => Date.parse(b.labAt) - Date.parse(a.labAt))[0];
}

function getCurrentEvents(nowMs = Date.now()) {
  return expandDoseEvents(state.data.doses, nowMs);
}

function getCurrentEstimate() {
  const now = Date.now();
  const events = getCurrentEvents(now);
  return {
    pgMl: concentrationAtMs(now, events),
    hasModeledEvents: events.length > 0,
  };
}

function referenceState(pgMl) {
  const { low, high } = REFERENCE_RANGES.estradiol;
  if (!Number.isFinite(pgMl) || pgMl <= 0) {
    return {
      label: "等待记录",
      detail: "添加可估算的雌二醇药物后显示",
      className: "",
    };
  }
  if (pgMl < low) {
    return {
      label: "低于文献参考带",
      detail: "仅为数值比较，不构成调整建议",
      className: "outside",
    };
  }
  if (pgMl > high) {
    return {
      label: "高于文献参考带",
      detail: "仅为数值比较，不构成调整建议",
      className: "outside",
    };
  }
  return {
    label: "位于文献参考带",
    detail: "模型估算，仍需以真实化验为准",
    className: "",
  };
}

function countDosesSince(ms) {
  return state.data.doses.filter(
    (entry) => Date.parse(entry.takenAt) >= ms,
  ).length;
}

function renderMetrics() {
  const estimate = getCurrentEstimate();
  const latestE2 = getLatestLabWith("estradiolPgMl");
  const status = referenceState(
    estimate.hasModeledEvents ? estimate.pgMl : null,
  );
  const last7 = Date.now() - 7 * DAY_MS;
  const recentDoses = state.data.doses.filter(
    (entry) => Date.parse(entry.takenAt) >= last7,
  );
  const hasOnlyRecordModelEntries =
    !estimate.hasModeledEvents &&
    state.data.doses.some(
      (entry) => !getMedication(entry.medicationId)?.concentration,
    );

  state.els.currentE2.textContent = estimate.hasModeledEvents
    ? formatE2(estimate.pgMl)
    : "—";
  state.els.currentE2Unit.textContent =
    state.data.settings.concentrationUnit;
  state.els.currentE2Status.textContent = hasOnlyRecordModelEntries
    ? "当前记录不参与浓度模型"
    : status.label;
  state.els.latestLabE2.textContent = latestE2
    ? formatE2(latestE2.estradiolPgMl)
    : "—";
  state.els.latestLabUnit.textContent =
    state.data.settings.concentrationUnit;
  state.els.latestLabDate.textContent = latestE2
    ? formatRelativeDate(latestE2.labAt)
    : "尚未录入化验";
  state.els.weekDoseCount.textContent = String(recentDoses.length);
  state.els.weekDoseCaption.textContent = recentDoses.length
    ? `最近一次：${getMedication(recentDoses[0].medicationId)?.name ?? "记录"}`
    : "记录从今天开始";
  state.els.dataHealthLabel.textContent = state.data.settings.isDemo
    ? "演示模式"
    : state.data.doses.length || state.data.labs.length
      ? "已有记录"
      : "仅本机";
}

function renderEmptyList(container, icon, title, copy) {
  const box = makeElement("div", "list-empty");
  box.innerHTML = `<i data-lucide="${icon}" aria-hidden="true"></i>`;
  box.append(makeElement("strong", null, title));
  box.append(makeElement("p", null, copy));
  container.append(box);
}

function renderTodayList() {
  const container = state.els.todayDoseList;
  container.replaceChildren();
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const tomorrow = todayStart + DAY_MS;
  const entries = state.data.doses
    .filter((entry) => {
      const timestamp = Date.parse(entry.takenAt);
      return timestamp >= todayStart && timestamp < tomorrow;
    })
    .sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt));

  if (!entries.length) {
    renderEmptyList(
      container,
      "calendar-plus",
      "今天还没有记录",
      "记录实际用药后，时间与剂量会显示在这里。",
    );
    return;
  }

  for (const entry of entries) {
    const medication = getMedication(entry.medicationId);
    const row = makeElement("div", "today-entry");
    row.append(
      makeElement(
        "span",
        "entry-time",
        new Date(entry.takenAt).toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      ),
    );
    const main = makeElement("div", "entry-main");
    main.append(makeElement("strong", null, medication?.name ?? "未知药品"));
    if (medication) {
      main.append(
        makeElement(
          "span",
          "dose-route-detail",
          formatDoseExtras(medication, entry.modelExtras, entry.repeatDays),
        ),
      );
    }
    if (entry.note) {
      main.append(
        makeElement(
          "span",
          state.data.settings.isDemo ? "user-note" : "user-note notranslate",
          entry.note,
        ),
      );
    }
    const doseValue = makeElement(
      "span",
      "entry-dose",
      `${entry.dose} ${medication?.unit ?? ""}`,
    );
    if (medication && !medication.concentration) {
      doseValue.append(makeElement("small", "model-only-inline", "仅记录"));
    }
    row.append(main, doseValue);
    container.append(row);
  }
}

function renderRoutineList() {
  const container = state.els.routineList;
  container.replaceChildren();
  const idList = [
    ...new Set(
      [...state.data.doses]
        .sort((a, b) => Date.parse(b.takenAt) - Date.parse(a.takenAt))
        .map((entry) => entry.medicationId),
    ),
  ].slice(0, 4);

  if (!idList.length) {
    renderEmptyList(
      container,
      "pill-bottle",
      "还没有常用药品",
      "保存用药记录后，会在这里形成你的常用清单。",
    );
    return;
  }

  for (const id of idList) {
    const medication = getMedication(id);
    if (!medication) {
      continue;
    }
    const row = makeElement("div", "routine-item");
    const icon = makeElement("span", "routine-icon");
    icon.innerHTML = '<i data-lucide="pill" aria-hidden="true"></i>';
    const copy = makeElement("div");
    copy.append(
      makeElement("strong", null, medication.name),
      makeElement("p", null, medication.routeLabel),
    );
    row.append(
      icon,
      copy,
      makeElement(
        "span",
        null,
        medication.concentration ? medication.abbreviation : "仅记录",
      ),
    );
    container.append(row);
  }
}

function renderLatestLabSnapshot() {
  const container = state.els.latestLabSnapshot;
  container.replaceChildren();
  const latestE2 = getLatestLabWith("estradiolPgMl");

  if (!latestE2) {
    renderEmptyList(
      container,
      "flask-conical",
      "还没有真实化验",
      "真实化验会独立显示，不会被模型曲线覆盖。",
    );
    return;
  }

  const status = referenceState(latestE2.estradiolPgMl);
  const valueLine = makeElement("div", "lab-hero-value");
  valueLine.append(
    makeElement("strong", null, formatE2(latestE2.estradiolPgMl)),
    makeElement("span", null, state.data.settings.concentrationUnit),
  );
  const badge = makeElement(
    "div",
    `lab-reference ${status.className}`.trim(),
  );
  badge.innerHTML = '<i class="lab-reference-dot"></i>';
  badge.append(document.createTextNode(status.label));

  const details = makeElement("div", "lab-detail-grid");
  const tDetail = makeElement("div");
  tDetail.append(
    makeElement("span", null, "睾酮 T"),
    makeElement(
      "strong",
      null,
      Number.isFinite(latestE2.testosteroneNgDl)
        ? `${Number(latestE2.testosteroneNgDl.toFixed(1))} ng/dL`
        : "—",
    ),
  );
  const dateDetail = makeElement("div");
  dateDetail.append(
    makeElement("span", null, "采血日期"),
    makeElement("strong", null, formatRelativeDate(latestE2.labAt)),
  );
  details.append(tDetail, dateDetail);
  container.append(valueLine, badge, details);
}

function renderOverviewLists() {
  renderTodayList();
  renderLatestLabSnapshot();
  renderRoutineList();
}

function formatAxisDate(timestampMs, chartRange) {
  const date = new Date(timestampMs);
  if (chartRange <= 7) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function nearestSeriesIndex(series, timestampMs) {
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  series.forEach((point, index) => {
    const distance = Math.abs(point.timestampMs - timestampMs);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex;
}

const referenceBandPlugin = {
  id: "miraReferenceBand",
  beforeDatasetsDraw(chart, _args, options) {
    if (!options || !Number.isFinite(options.low) || !Number.isFinite(options.high)) {
      return;
    }
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) {
      return;
    }
    const top = scales.y.getPixelForValue(options.high);
    const bottom = scales.y.getPixelForValue(options.low);
    const clippedTop = Math.max(chartArea.top, Math.min(top, bottom));
    const clippedBottom = Math.min(chartArea.bottom, Math.max(top, bottom));
    if (clippedBottom <= clippedTop) {
      return;
    }

    ctx.save();
    ctx.fillStyle = "rgba(47, 117, 103, 0.075)";
    ctx.fillRect(chartArea.left, clippedTop, chartArea.right - chartArea.left, clippedBottom - clippedTop);
    ctx.strokeStyle = "rgba(47, 117, 103, 0.24)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(chartArea.left, clippedTop);
    ctx.lineTo(chartArea.right, clippedTop);
    ctx.moveTo(chartArea.left, clippedBottom);
    ctx.lineTo(chartArea.right, clippedBottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "9px Avenir Next, Segoe UI, sans-serif";
    ctx.fillStyle = "rgba(47, 117, 103, 0.9)";
    ctx.textAlign = "right";
    ctx.fillText(options.label || "REFERENCE BAND", chartArea.right - 7, clippedTop + 12);
    ctx.restore();
  },
};

const nowLinePlugin = {
  id: "miraNowLine",
  afterDatasetsDraw(chart, _args, options) {
    if (!options?.visible || !Number.isFinite(options.index)) {
      return;
    }
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) {
      return;
    }
    const x = scales.x.getPixelForValue(options.index);
    if (x < chartArea.left || x > chartArea.right) {
      return;
    }
    ctx.save();
    ctx.strokeStyle = "rgba(45, 22, 36, 0.38)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#2d1624";
    ctx.font = "8px Avenir Next, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NOW", x, chartArea.top + 10);
    ctx.restore();
  },
};

const doseMarkerPlugin = {
  id: "miraDoseMarkers",
  afterDatasetsDraw(chart, _args, options) {
    if (!Array.isArray(options?.markers) || !options.markers.length) {
      return;
    }
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) {
      return;
    }
    ctx.save();
    for (const marker of options.markers.slice(0, 24)) {
      const x = scales.x.getPixelForValue(marker.index);
      if (x < chartArea.left || x > chartArea.right) {
        continue;
      }
      ctx.fillStyle = "#e99b8b";
      ctx.beginPath();
      ctx.arc(x, chartArea.bottom - 6, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
};

function chartFont() {
  return getComputedStyle(document.body).fontFamily;
}

function chartColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    ink: styles.getPropertyValue("--ink").trim(),
    muted: styles.getPropertyValue("--muted").trim(),
    line: styles.getPropertyValue("--line").trim(),
    rose: styles.getPropertyValue("--rose").trim(),
    teal: styles.getPropertyValue("--teal").trim(),
    plum: styles.getPropertyValue("--plum").trim(),
  };
}

function renderOverviewChart() {
  if (!globalThis.Chart) {
    return;
  }
  const canvas = state.els.e2Chart;
  const nowMs = Date.now();
  const rangeDays = state.data.settings.chartRange;
  const startMs = nowMs - rangeDays * DAY_MS;
  const endMs = nowMs + 7 * DAY_MS;
  const points = rangeDays === 7 ? 280 : rangeDays === 14 ? 360 : 440;
  const series = buildConcentrationSeries({
    doseLogs: state.data.doses,
    startMs,
    endMs,
    points,
  });
  const labels = series.map((point) =>
    formatAxisDate(point.timestampMs, rangeDays),
  );
  const factor = concentrationFactor();
  const estimateValues = series.map((point) => point.pgMl * factor);
  const visibleLabs = state.data.labs.filter(
    (lab) =>
      Number.isFinite(lab.estradiolPgMl) &&
      Date.parse(lab.labAt) >= startMs &&
      Date.parse(lab.labAt) <= endMs,
  );
  const labPoints = visibleLabs.map((lab) => {
    const index = nearestSeriesIndex(series, Date.parse(lab.labAt));
    return {
      x: labels[index],
      y: lab.estradiolPgMl * factor,
      timestampMs: Date.parse(lab.labAt),
      testosterone: lab.testosteroneNgDl,
    };
  });
  const nowIndex = nearestSeriesIndex(series, nowMs);
  const futureMarkers = getFutureDoseMarkers({
    doseLogs: state.data.doses,
    nowMs,
    endMs,
  }).map((marker) => ({
    ...marker,
    index: nearestSeriesIndex(series, marker.timestampMs),
  }));
  const modeledEvents = expandDoseEvents(state.data.doses, endMs);
  const hasCurve = modeledEvents.length > 0 && estimateValues.some((value) => value > 0);
  const nonModeledDosesInRange = state.data.doses.filter((entry) => {
    const medication = getMedication(entry.medicationId);
    const timestamp = Date.parse(entry.takenAt);
    return (
      medication &&
      !medication.concentration &&
      timestamp >= startMs &&
      timestamp <= nowMs
    );
  }).length;
  state.els.chartEmpty.hidden = hasCurve;
  canvas.style.opacity = hasCurve ? "1" : labPoints.length ? "0.55" : "0.35";
  if (!hasCurve) {
    state.els.chartEmptyTitle.textContent = nonModeledDosesInRange
      ? "当前记录仅保存，不生成曲线"
      : "还没有可估算的用药记录";
    state.els.chartEmptyCopy.textContent = nonModeledDosesInRange
      ? "这类药物当前不参与雌二醇浓度模型。抗雄药、GnRH 激动剂和孕激素等仍会保存记录；可估算剂型请查看药品库。"
      : "添加带药代模型的雌二醇药物后，这里会生成曲线。";
    state.els.chartEmptyAction.hidden = nonModeledDosesInRange === 0;
  }

  const targetLow = REFERENCE_RANGES.estradiol.low * factor;
  const targetHigh = REFERENCE_RANGES.estradiol.high * factor;
  const maxObserved = Math.max(
    0,
    ...estimateValues,
    ...labPoints.map((point) => point.y),
  );
  const suggestedMax = Math.max(
    targetHigh * 1.25,
    maxObserved * 1.12,
    factor === 1 ? 250 : 900,
  );
  const colors = chartColors();

  if (state.chart) {
    state.chart.destroy();
    state.chart = null;
  }

  const estimateDataset = {
    label: "模型估算",
    data: estimateValues,
    borderColor: colors.rose,
    borderWidth: 2,
    pointRadius: 0,
    pointHitRadius: 14,
    tension: 0.22,
    spanGaps: true,
    fill: "origin",
    backgroundColor(context) {
      const chart = context.chart;
      const area = chart.chartArea;
      if (!area) {
        return "rgba(199, 45, 104, 0.08)";
      }
      const gradient = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
      gradient.addColorStop(0, "rgba(199, 45, 104, 0.17)");
      gradient.addColorStop(1, "rgba(199, 45, 104, 0.005)");
      return gradient;
    },
    segment: {
      borderDash: (context) =>
        context.p1.parsed.x > nowIndex ? [4, 4] : undefined,
      borderColor: (context) =>
        context.p1.parsed.x > nowIndex
          ? "rgba(199, 45, 104, 0.55)"
          : colors.rose,
    },
  };

  const labDataset = {
    type: "scatter",
    label: "真实化验",
    data: labPoints,
    borderColor: colors.teal,
    backgroundColor: colors.teal,
    pointRadius: 4.5,
    pointHoverRadius: 6,
    showLine: false,
  };

  state.chart = new globalThis.Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [estimateDataset, labDataset],
    },
    plugins: [referenceBandPlugin, nowLinePlugin, doseMarkerPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0
          : 420,
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      layout: {
        padding: { top: 12, right: 4, bottom: 0, left: 0 },
      },
      plugins: {
        legend: { display: false },
        miraReferenceBand: {
          low: targetLow,
          high: targetHigh,
          label: `${Math.round(targetLow)}–${Math.round(targetHigh)} ${state.data.settings.concentrationUnit}`,
        },
        miraNowLine: { visible: true, index: nowIndex },
        miraDoseMarkers: { markers: futureMarkers },
        tooltip: {
          backgroundColor: colors.plum,
          titleColor: "#fffdfd",
          bodyColor: "rgba(255,253,253,.76)",
          borderColor: "rgba(255,255,255,.12)",
          borderWidth: 1,
          padding: 10,
          displayColors: true,
          boxWidth: 7,
          boxHeight: 7,
          cornerRadius: 4,
          titleFont: { family: chartFont(), size: 10, weight: "600" },
          bodyFont: { family: chartFont(), size: 9 },
          callbacks: {
            title(items) {
              const item = items[0];
              const raw =
                item?.dataset.label === "真实化验"
                  ? item.raw.timestampMs
                  : series[item?.dataIndex]?.timestampMs;
              return raw ? formatFullDateTime(new Date(raw).toISOString()) : "估算";
            },
            label(context) {
              if (context.dataset.label === "真实化验") {
                return toCurrentLanguage(
                  `真实化验：${formatE2(context.raw.y, true)}`,
                );
              }
              return toCurrentLanguage(
                `模型估算：${formatE2(context.parsed.y, true)}`,
              );
            },
            afterBody(items) {
              if (items[0]?.dataset.label !== "真实化验") {
                return [];
              }
              const testosterone = items[0].raw.testosterone;
              return Number.isFinite(testosterone)
                ? [
                    toCurrentLanguage(
                      `睾酮：${testosterone.toFixed(1)} ng/dL`,
                    ),
                  ]
                : [];
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: colors.muted,
            font: { family: chartFont(), size: 8 },
            maxTicksLimit: 8,
            maxRotation: 0,
            autoSkip: true,
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax,
          border: { display: false },
          grid: {
            color: "rgba(110, 89, 100, 0.1)",
            drawTicks: false,
          },
          ticks: {
            color: colors.muted,
            font: { family: chartFont(), size: 8 },
            padding: 8,
            maxTicksLimit: 6,
          },
          title: {
            display: true,
            text: state.data.settings.concentrationUnit,
            color: colors.muted,
            font: { family: chartFont(), size: 8, weight: "500" },
          },
        },
      },
    },
  });

  const estimate = getCurrentEstimate();
  const status = referenceState(estimate.hasModeledEvents ? estimate.pgMl : null);
  if (!estimate.hasModeledEvents && nonModeledDosesInRange > 0) {
    state.els.curveInsightTitle.textContent =
      "记录已保存，但不在浓度模型范围";
    state.els.curveInsightCopy.textContent =
      "该剂型属于“仅记录”，不会生成曲线。真实化验仍可正常记录并与医生沟通。";
  } else {
    state.els.curveInsightTitle.textContent = status.label;
    state.els.curveInsightCopy.textContent = estimate.hasModeledEvents
      ? currentLanguage() === "en"
        ? `Current model estimate is about ${formatE2(estimate.pgMl, true)}. ${toCurrentLanguage(status.detail)}.`
        : `当前模型估值约 ${formatE2(estimate.pgMl, true)}。${status.detail}。`
      : "添加带药代模型的雌二醇药物后，这里会显示估算范围与未来趋势。";
  }
}

function renderLabChart() {
  if (!globalThis.Chart) {
    return;
  }
  const labs = state.data.labs
    .filter((lab) => Number.isFinite(lab.estradiolPgMl))
    .sort((a, b) => Date.parse(a.labAt) - Date.parse(b.labAt));
  const empty = state.els.labChartEmpty;
  empty.hidden = labs.length > 0;

  if (state.labChart) {
    state.labChart.destroy();
    state.labChart = null;
  }
  if (!labs.length) {
    return;
  }

  const factor = concentrationFactor();
  const colors = chartColors();
  const values = labs.map((lab) => lab.estradiolPgMl * factor);
  const labels = labs.map((lab) => formatDateOnly(lab.labAt));
  const targetLow = REFERENCE_RANGES.estradiol.low * factor;
  const targetHigh = REFERENCE_RANGES.estradiol.high * factor;
  const suggestedMax = Math.max(
    targetHigh * 1.25,
    Math.max(...values) * 1.15,
    factor === 1 ? 250 : 900,
  );

  state.labChart = new globalThis.Chart(state.els.labChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "真实 E2",
          data: values,
          borderColor: colors.teal,
          backgroundColor: "rgba(47, 117, 103, 0.1)",
          fill: "origin",
          tension: 0.18,
          borderWidth: 2,
          pointRadius: 4.5,
          pointHoverRadius: 6,
          pointBackgroundColor: colors.teal,
          pointBorderColor: "#fffafc",
          pointBorderWidth: 2,
        },
      ],
    },
    plugins: [referenceBandPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0
          : 350,
      },
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: false },
        miraReferenceBand: {
          low: targetLow,
          high: targetHigh,
          label: `${Math.round(targetLow)}–${Math.round(targetHigh)} ${state.data.settings.concentrationUnit}`,
        },
        miraNowLine: { visible: false },
        miraDoseMarkers: { markers: [] },
        tooltip: {
          backgroundColor: colors.plum,
          titleColor: "#fffdfd",
          bodyColor: "rgba(255,253,253,.76)",
          padding: 10,
          cornerRadius: 4,
          displayColors: false,
          titleFont: { family: chartFont(), size: 10 },
          bodyFont: { family: chartFont(), size: 9 },
          callbacks: {
            label(context) {
              return toCurrentLanguage(
                `真实雌二醇：${formatE2(labs[context.dataIndex].estradiolPgMl, true)}`,
              );
            },
            afterBody(context) {
              const lab = labs[context[0].dataIndex];
              return [
                Number.isFinite(lab.testosteroneNgDl)
                  ? toCurrentLanguage(
                      `睾酮：${lab.testosteroneNgDl.toFixed(1)} ng/dL`,
                    )
                  : "",
                lab.note || "",
              ].filter(Boolean);
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: colors.muted,
            font: { family: chartFont(), size: 8 },
            maxRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax,
          border: { display: false },
          grid: { color: "rgba(110,89,100,.1)", drawTicks: false },
          ticks: {
            color: colors.muted,
            font: { family: chartFont(), size: 8 },
            padding: 8,
            maxTicksLimit: 6,
          },
        },
      },
    },
  });
}

function renderDoseTable() {
  const body = state.els.doseTableBody;
  body.replaceChildren();
  const query = state.els.doseSearch.value.trim().toLowerCase();
  const category = state.els.doseCategoryFilter.value;

  const entries = [...state.data.doses]
    .sort((a, b) => Date.parse(b.takenAt) - Date.parse(a.takenAt))
    .filter((entry) => {
      const medication = getMedication(entry.medicationId);
      if (!medication) {
        return false;
      }
      const categoryMatches =
        category === "all" || medication.category === category;
      const haystack =
        `${medication.name} ${medication.nameEn} ${medication.abbreviation} ${entry.note}`.toLowerCase();
      return categoryMatches && (!query || haystack.includes(query));
    });

  state.els.doseTableEmpty.hidden = entries.length > 0;
  state.els.doseTableEmpty.querySelector("strong").textContent = entries.length
    ? ""
    : state.data.doses.length
      ? "没有符合条件的记录"
      : "还没有用药记录";

  for (const entry of entries) {
    const medication = getMedication(entry.medicationId);
    const row = document.createElement("tr");

    const dateCell = document.createElement("td");
    dateCell.append(makeElement("strong", null, formatDateTime(entry.takenAt)));
    if (state.data.settings.isDemo) {
      dateCell.append(makeElement("span", "demo-chip", "DEMO"));
    }

    const medCell = document.createElement("td");
    const medWrap = makeElement("div", "table-med-name");
    const letter = makeElement("i", "med-letter", medication.abbreviation.slice(0, 3));
    const medText = makeElement("div");
    medText.append(
      makeElement("strong", null, medication.name),
      makeElement("span", null, medication.nameEn),
    );
    if (!medication.concentration) {
      medText.append(
        makeElement("span", "table-model-badge", "仅记录"),
      );
    }
    medWrap.append(letter, medText);
    medCell.append(medWrap);

    const doseCell = document.createElement("td");
    doseCell.append(
      makeElement("strong", null, `${entry.dose} ${medication.unit}`),
    );

    const routeCell = makeElement("td", null, medication.routeLabel);
    const repeatCell = makeElement(
      "td",
      null,
      entry.repeatDays ? `每 ${entry.repeatDays} 天` : "单次",
    );
    const noteCell = document.createElement("td");
    const routeDetails = formatDoseExtras(
      medication,
      entry.modelExtras,
      entry.repeatDays,
    );
    if (routeDetails) {
      noteCell.append(
        makeElement("span", "dose-route-detail", routeDetails),
      );
    }
    if (entry.note) {
      noteCell.append(
        makeElement(
          "span",
          state.data.settings.isDemo ? "user-note" : "user-note notranslate",
          entry.note,
        ),
      );
    }
    if (!noteCell.childElementCount) {
      noteCell.textContent = "—";
    }

    const actionCell = document.createElement("td");
    const actionWrap = makeElement("div", "row-actions");
    const editButton = makeElement("button", "edit-row-button");
    editButton.type = "button";
    editButton.dataset.editDose = entry.id;
    editButton.setAttribute("aria-label", `编辑 ${medication.name} 记录`);
    editButton.innerHTML = '<i data-lucide="pencil" aria-hidden="true"></i>';
    const deleteButton = makeElement("button", "delete-row-button");
    deleteButton.type = "button";
    deleteButton.dataset.deleteDose = entry.id;
    deleteButton.setAttribute("aria-label", `删除 ${medication.name} 记录`);
    deleteButton.innerHTML = '<i data-lucide="trash-2" aria-hidden="true"></i>';
    actionWrap.append(editButton, deleteButton);
    actionCell.append(actionWrap);

    row.append(
      dateCell,
      medCell,
      doseCell,
      routeCell,
      repeatCell,
      noteCell,
      actionCell,
    );
    body.append(row);
  }
}

function renderLabSummary() {
  const latestE2 = getLatestLabWith("estradiolPgMl");
  const latestT = getLatestLabWith("testosteroneNgDl");
  const latestPrl = getLatestLabWith("prolactinNgMl");

  state.els.labSummaryE2.textContent = latestE2
    ? formatE2(latestE2.estradiolPgMl, true)
    : "—";
  state.els.labSummaryE2Date.textContent = latestE2
    ? formatRelativeDate(latestE2.labAt)
    : "暂无化验";
  state.els.labSummaryT.textContent = latestT
    ? `${latestT.testosteroneNgDl.toFixed(1)} ng/dL`
    : "—";
  state.els.labSummaryTDate.textContent = latestT
    ? formatRelativeDate(latestT.labAt)
    : "暂无化验";
  state.els.labSummaryPrl.textContent = latestPrl
    ? `${latestPrl.prolactinNgMl.toFixed(1)} ng/mL`
    : "—";
  state.els.labSummaryPrlDate.textContent = latestPrl
    ? formatRelativeDate(latestPrl.labAt)
    : "暂无化验";
  state.els.referencePill.textContent =
    `参考带 ${Math.round(REFERENCE_RANGES.estradiol.low * concentrationFactor())}–` +
    `${Math.round(REFERENCE_RANGES.estradiol.high * concentrationFactor())} ` +
    state.data.settings.concentrationUnit;
}

function renderLabTable() {
  const body = state.els.labTableBody;
  body.replaceChildren();
  const labs = [...state.data.labs].sort(
    (a, b) => Date.parse(b.labAt) - Date.parse(a.labAt),
  );
  state.els.labTableEmpty.hidden = labs.length > 0;

  for (const lab of labs) {
    const row = document.createElement("tr");
    row.append(makeElement("td", null, formatFullDateTime(lab.labAt)));
    row.append(
      makeElement(
        "td",
        null,
        Number.isFinite(lab.estradiolPgMl)
          ? formatE2(lab.estradiolPgMl, true)
          : "—",
      ),
    );
    row.append(
      makeElement(
        "td",
        null,
        Number.isFinite(lab.testosteroneNgDl)
          ? `${lab.testosteroneNgDl.toFixed(1)} ng/dL`
          : "—",
      ),
    );
    row.append(
      makeElement(
        "td",
        null,
        Number.isFinite(lab.prolactinNgMl)
          ? `${lab.prolactinNgMl.toFixed(1)} ng/mL`
          : "—",
      ),
    );
    row.append(
      makeElement(
        "td",
        lab.note && !state.data.settings.isDemo
          ? "user-note notranslate"
          : undefined,
        lab.note || "—",
      ),
    );

    const actionCell = document.createElement("td");
    const deleteButton = makeElement("button", "delete-row-button");
    deleteButton.type = "button";
    deleteButton.dataset.deleteLab = lab.id;
    deleteButton.setAttribute("aria-label", "删除这条化验记录");
    deleteButton.innerHTML = '<i data-lucide="trash-2" aria-hidden="true"></i>';
    actionCell.append(deleteButton);
    row.append(actionCell);
    body.append(row);
  }
}

function guideText(zhHans, english) {
  return currentLanguage() === "en"
    ? english
    : toCurrentLanguage(zhHans);
}

function renderGuide() {
  const language = currentLanguage();
  const localeBase =
    language === "zh-Hant"
      ? "zh-hant"
      : language === "en"
        ? "en"
        : "zh-cn";
  state.els.mtfWikiHomeLink.href =
    language === "en"
      ? MTF_WIKI_SOURCE.url
      : `${MTF_WIKI_SOURCE.url}${localeBase}`;
  state.els.mtfWikiSourceLink.href = MTF_WIKI_SOURCE.repository;
  state.els.mtfWikiLicenseLink.href = MTF_WIKI_SOURCE.licenseUrl;
  state.els.mtfWikiEditLink.href = MTF_WIKI_SOURCE.repository;
  state.els.guideCheckedDate.textContent = MTF_WIKI_SOURCE.checkedAt;

  const query = state.els.guideSearch.value.trim().toLowerCase();
  const topics = GUIDE_TOPICS.filter((topic) => {
    const categoryMatches =
      state.guideCategory === "all" ||
      topic.category === state.guideCategory;
    const haystack = [
      topic.title,
      topic.titleEn,
      topic.summary,
      topic.summaryEn,
      topic.tag,
      topic.tagEn,
    ]
      .join(" ")
      .toLowerCase();
    return categoryMatches && (!query || haystack.includes(query));
  });

  state.els.guideCategoryFilter
    .querySelectorAll("[data-guide-category]")
    .forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.guideCategory === state.guideCategory,
      );
    });
  state.els.guideResultCount.textContent =
    language === "en"
      ? `${topics.length} guide entries`
      : language === "zh-Hant"
        ? `${topics.length} 個指南入口`
        : `${topics.length} 个指南入口`;

  const content = state.els.guideContent;
  content.replaceChildren();
  state.els.guideEmpty.hidden = topics.length > 0;
  content.hidden = topics.length === 0;

  for (const category of GUIDE_CATEGORIES) {
    const categoryTopics = topics.filter(
      (topic) => topic.category === category.id,
    );
    if (!categoryTopics.length) {
      continue;
    }
    const section = makeElement("section", "guide-category-section");
    const heading = makeElement("div", "guide-category-heading");
    heading.append(
      makeElement(
        "h2",
        null,
        guideText(category.title, category.titleEn),
      ),
      makeElement(
        "span",
        null,
        language === "en"
          ? `${categoryTopics.length} entries`
          : `${categoryTopics.length} 条`,
      ),
    );
    const grid = makeElement("div", "guide-topic-grid");

    for (const topic of categoryTopics) {
      const card = makeElement("a", "guide-topic-card");
      card.href = mtfWikiUrl(topic, language);
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.setAttribute(
        "aria-label",
        `${guideText(topic.title, topic.titleEn)} - MTF Wiki`,
      );

      const top = makeElement("span", "guide-topic-top");
      top.append(
        makeElement(
          "span",
          "guide-topic-tag",
          guideText(topic.tag, topic.tagEn),
        ),
      );
      top.innerHTML += '<i data-lucide="external-link" aria-hidden="true"></i>';

      const source = makeElement("span", "guide-topic-source");
      source.innerHTML = '<i data-lucide="book-open" aria-hidden="true"></i>';
      source.append(
        document.createTextNode(
          language === "en"
            ? "MTF.WIKI · SOURCE ARTICLE"
            : "MTF.WIKI · 原文",
        ),
      );

      card.append(
        top,
        makeElement(
          "h3",
          null,
          guideText(topic.title, topic.titleEn),
        ),
        makeElement(
          "p",
          null,
          guideText(topic.summary, topic.summaryEn),
        ),
        source,
      );
      grid.append(card);
    }
    section.append(heading, grid);
    content.append(section);
  }

  refreshIcons();
}

function renderMedicationGrid() {
  const grid = state.els.medicationGrid;
  grid.replaceChildren();
  const query = state.els.medicationSearch.value.trim().toLowerCase();
  const filtered = MEDICATIONS.filter((medication) => {
    const categoryMatches =
      state.selectedCategory === "all" ||
      medication.category === state.selectedCategory;
    const haystack = [
      medication.name,
      medication.nameEn,
      medication.abbreviation,
      medication.categoryLabel,
      medication.routeLabel,
      medication.formLabel,
      ...medication.tags,
    ]
      .join(" ")
      .toLowerCase();
    return categoryMatches && (!query || haystack.includes(query));
  });

  state.els.medicationEmpty.hidden = filtered.length > 0;
  const modeledCount = filtered.filter(
    (medication) => medication.concentration,
  ).length;
  state.els.libraryCount.textContent =
    currentLanguage() === "en"
      ? `${filtered.length} entries · ${modeledCount} estimable`
      : `${filtered.length} 条资料 · ${modeledCount} 条可估算`;

  for (const medication of filtered) {
    const card = makeElement("button", "medication-card");
    card.type = "button";
    card.dataset.medId = medication.id;
    card.setAttribute("aria-label", `查看 ${medication.name} 资料`);

    const top = makeElement("span", "med-card-top");
    top.append(
      makeElement("span", "med-card-symbol", medication.abbreviation),
    );
    const tag = makeElement(
      "span",
      `simulation-tag${medication.concentration ? "" : " log-only"}`,
    );
    tag.innerHTML = `<i data-lucide="${medication.concentration ? "chart-line" : "file-text"}" aria-hidden="true"></i>`;
    tag.append(
      document.createTextNode(
        medication.concentration ? "可估算" : "仅记录",
      ),
    );
    top.append(tag);

    card.append(
      top,
      makeElement("span", "medication-title", medication.name),
      makeElement("span", "med-name-en", medication.nameEn),
    );

    const meta = makeElement("span", "med-card-meta");
    meta.append(
      makeElement("span", null, medication.routeLabel),
      makeElement("span", null, medication.formLabel),
      makeElement("span", null, medication.unit),
    );
    card.append(meta);

    const footer = makeElement("span", "med-card-footer");
    footer.append(
      makeElement("span", null, medication.modelLabel),
    );
    footer.innerHTML += '<i data-lucide="chevron-right" aria-hidden="true"></i>';
    card.append(footer);
    grid.append(card);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatReportDate(timestampMs, includeTime = false) {
  const locale = languageDefinition(currentLanguage()).htmlLang;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(new Date(timestampMs));
}

function dateInputValue(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function reportRangeMs() {
  const startValue = state.els.reportStartDate.value;
  const endValue = state.els.reportEndDate.value;
  const startDate = new Date(`${startValue}T00:00:00`);
  const endDate = new Date(`${endValue}T23:59:59.999`);
  if (
    !startValue ||
    !endValue ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate > endDate
  ) {
    return null;
  }
  return { startMs: startDate.getTime(), endMs: endDate.getTime() };
}

function reportRowCount(copy, report) {
  if (currentLanguage() === "en") {
    const label = (count, singular, plural) =>
      `${count} ${count === 1 ? singular : plural}`;
    return [
      label(report.uniqueMedications.length, "medication", "medications"),
      label(report.doseCount, "dose entry", "dose entries"),
      label(report.labCount, "lab result", "lab results"),
      label(
        report.residualCount,
        "model comparison",
        "model comparisons",
      ),
    ].join(" · ");
  }
  return [
    `${report.uniqueMedications.length} ${copy.medicationCount}`,
    `${report.doseCount} ${copy.doseCount}`,
    `${report.labCount} ${copy.labCount}`,
    `${report.residualCount} ${copy.residualCount}`,
  ].join(" · ");
}

function reportTableRows(rows, columnCount) {
  if (!rows.length) {
    return "";
  }
  return rows.join("");
}

function reportTruncation(copy, shown, total, template) {
  if (shown >= total) {
    return "";
  }
  return `<p class="report-truncated">${escapeHtml(
    template.replace("{shown}", String(shown)).replace("{total}", String(total)),
  )}</p>`;
}

function generateClinicalReportHtml(report) {
  const copy = reportCopy(currentLanguage());
  const generatedAt = Date.now();
  const unit = state.data.settings.concentrationUnit;
  const medicationNames =
    report.uniqueMedications
      .map((medication) => toCurrentLanguage(medication.name))
      .join(currentLanguage() === "en" ? ", " : "、") || "—";

  const doseRows = report.displayedDoses.map((entry) => {
    const medication = entry.medication;
    const structuredDetails = formatDoseExtras(
      medication,
      entry.modelExtras ?? {},
      entry.repeatDays,
    );
    const combinedNote = [structuredDetails, entry.note]
      .filter(Boolean)
      .join(" · ");
    const note = combinedNote
      ? combinedNote.length > 90
        ? `${combinedNote.slice(0, 90)}…`
        : combinedNote
      : "—";
    return `
      <tr>
        <td class="report-number">${escapeHtml(formatReportDate(entry.timestampMs, true))}</td>
        <td>${escapeHtml(toCurrentLanguage(medication.name))}</td>
        <td class="report-number">${escapeHtml(`${entry.dose} ${medication.unit}`)}<br>${escapeHtml(toCurrentLanguage(medication.routeLabel))}</td>
        <td class="notranslate">${escapeHtml(note)}</td>
      </tr>
    `;
  });

  const labRows = report.displayedLabs.map(
    (lab) => `
      <tr>
        <td class="report-number">${escapeHtml(formatReportDate(lab.timestampMs, true))}</td>
        <td class="report-number">${escapeHtml(
          Number.isFinite(lab.estradiolPgMl)
            ? formatE2(lab.estradiolPgMl, false)
            : "—",
        )}</td>
        <td class="report-number">${escapeHtml(
          Number.isFinite(lab.testosteroneNgDl)
            ? `${lab.testosteroneNgDl.toFixed(1)} ng/dL`
            : "—",
        )}</td>
        <td class="report-number">${escapeHtml(
          Number.isFinite(lab.prolactinNgMl)
            ? `${lab.prolactinNgMl.toFixed(1)} ng/mL`
            : "—",
        )}</td>
        <td class="notranslate">${escapeHtml(lab.note || "—")}</td>
      </tr>
    `,
  );

  const residualRows = report.residuals.map((entry) => {
    const residualClass =
      entry.residualPgMl >= 0
        ? "report-residual-positive"
        : "report-residual-negative";
    const sign = entry.residualPgMl >= 0 ? "+" : "";
    const percent = Number.isFinite(entry.residualPercent)
      ? `${sign}${entry.residualPercent.toFixed(0)}%`
      : "—";
    return `
      <tr>
        <td class="report-number">${escapeHtml(formatReportDate(entry.timestampMs, true))}</td>
        <td class="report-number">${escapeHtml(formatE2(entry.estradiolPgMl, true))}</td>
        <td class="report-number">${escapeHtml(formatE2(entry.estimatedPgMl, true))}</td>
        <td class="report-number ${residualClass}">${escapeHtml(
          `${sign}${formatE2(entry.residualPgMl, true)}`,
        )}</td>
        <td class="report-number ${residualClass}">${escapeHtml(percent)}</td>
      </tr>
    `;
  });

  return `
    <div class="report-brand-row">
      <div class="report-brand">
        <span class="report-brand-mark">M</span>
        <div>
          <strong>MIRA</strong>
          <span>HRT STUDIO</span>
        </div>
      </div>
      <div class="report-title-block">
        <h1>${escapeHtml(copy.title)}</h1>
        <p>${escapeHtml(copy.subtitle)}</p>
      </div>
    </div>

    <div class="report-meta-grid">
      <div><span>${escapeHtml(copy.generatedAt)}</span><strong>${escapeHtml(formatReportDate(generatedAt, true))}</strong></div>
      <div><span>${escapeHtml(copy.range)}</span><strong>${escapeHtml(`${formatReportDate(report.startMs)} – ${formatReportDate(report.endMs)}`)}</strong></div>
      <div><span>${escapeHtml(copy.source)}</span><strong>${escapeHtml(copy.localSource)}</strong></div>
      <div><span>${escapeHtml(copy.unit)}</span><strong>${escapeHtml(unit)}</strong></div>
    </div>

    <div class="report-summary-strip">
      <span>${escapeHtml(reportRowCount(copy, report))}</span>
      <span>${escapeHtml(`${copy.medicationSummary}: ${medicationNames}`)}</span>
    </div>

    <section class="report-section">
      <h2>${escapeHtml(copy.actualDoses)}</h2>
      <table class="report-table">
        <thead><tr><th>${escapeHtml(copy.dateTime)}</th><th>${escapeHtml(copy.medication)}</th><th>${escapeHtml(copy.dose)}</th><th>${escapeHtml(copy.notes)}</th></tr></thead>
        <tbody>
          ${
            doseRows.length
              ? reportTableRows(doseRows, 4)
              : `<tr><td class="report-empty-row" colspan="4">${escapeHtml(copy.noDoses)}</td></tr>`
          }
        </tbody>
      </table>
      ${reportTruncation(copy, report.displayedDoses.length, report.doseCount, copy.showingDoses)}
    </section>

    <section class="report-section">
      <h2>${escapeHtml(copy.labs)}</h2>
      <table class="report-table">
        <thead><tr><th>${escapeHtml(copy.labDate)}</th><th>${escapeHtml(`${copy.measuredE2} (${unit})`)}</th><th>${escapeHtml(copy.testosterone)} (ng/dL)</th><th>${escapeHtml(copy.prolactin)} (ng/mL)</th><th>${escapeHtml(copy.notes)}</th></tr></thead>
        <tbody>
          ${
            labRows.length
              ? reportTableRows(labRows, 5)
              : `<tr><td class="report-empty-row" colspan="5">${escapeHtml(copy.noLabs)}</td></tr>`
          }
        </tbody>
      </table>
      ${reportTruncation(copy, report.displayedLabs.length, report.labCount, copy.showingLabs)}
    </section>

    <section class="report-section">
      <h2>${escapeHtml(copy.residuals)}</h2>
      <table class="report-table">
        <thead><tr><th>${escapeHtml(copy.labDate)}</th><th>${escapeHtml(copy.measuredE2)}</th><th>${escapeHtml(copy.estimate)}</th><th>${escapeHtml(copy.observedResidual)}</th><th>${escapeHtml(copy.residualPercent)}</th></tr></thead>
        <tbody>
          ${
            residualRows.length
              ? reportTableRows(residualRows, 5)
              : `<tr><td class="report-empty-row" colspan="5">${escapeHtml(copy.noResiduals)}</td></tr>`
          }
        </tbody>
      </table>
      <p class="report-residual-note">${escapeHtml(copy.residualDefinition)}</p>
    </section>

    <div class="report-safety-box">
      <strong>${escapeHtml(copy.safetyTitle)}</strong>
      ${escapeHtml(copy.safetyBody)}
    </div>

    <footer class="report-footer">
      <span><strong>MIRA</strong> · ${escapeHtml(copy.footer)}</span>
      <span>${escapeHtml(copy.page)}</span>
    </footer>
  `;
}

function renderReportPreview() {
  const range = reportRangeMs();
  if (!range) {
    state.els.reportPreviewPage.innerHTML = `<div class="report-empty-row">${escapeHtml(
      reportCopy(currentLanguage()).range,
    )}</div>`;
    state.els.reportEntryCount.textContent =
      currentLanguage() === "en"
        ? "Choose a valid date range."
        : currentLanguage() === "zh-Hant"
          ? "請選擇有效的日期範圍。"
          : "请选择有效的日期范围。";
    state.els.printReportButton.disabled = true;
    return null;
  }

  const report = buildClinicalReportData({
    doses: state.data.doses,
    labs: state.data.labs,
    startMs: range.startMs,
    endMs: range.endMs,
  });
  const html = generateClinicalReportHtml(report);
  const copy = reportCopy(currentLanguage());
  state.els.reportPreviewPage.innerHTML = html;
  state.els.clinicalReport.innerHTML = `<article class="report-page">${html}</article>`;
  state.els.reportEntryCount.textContent = reportRowCount(copy, report);
  state.els.printReportButton.disabled =
    report.doseCount === 0 && report.labCount === 0;
  return report;
}

function setReportRange(days) {
  const end = new Date();
  const start = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate() - (days - 1),
  );
  state.els.reportStartDate.value = dateInputValue(start);
  state.els.reportEndDate.value = dateInputValue(end);
  document.querySelectorAll("[data-report-range]").forEach((button) => {
    button.classList.toggle(
      "is-active",
      Number(button.dataset.reportRange) === days,
    );
  });
  renderReportPreview();
}

function openReportDialog() {
  if (state.data.settings.isDemo) {
    showToast("请先清空演示数据，再导出临床摘要");
    return;
  }
  if (!state.data.doses.length && !state.data.labs.length) {
    showToast("还没有可导出的真实记录");
    return;
  }
  const end = new Date();
  const start = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate() - 89,
  );
  state.els.reportStartDate.value = dateInputValue(start);
  state.els.reportEndDate.value = dateInputValue(end);
  document.querySelectorAll("[data-report-range]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.reportRange === "90");
  });
  openDialog(state.els.reportDialog);
  renderReportPreview();
}

function printClinicalReport() {
  const report = renderReportPreview();
  if (!report || (report.doseCount === 0 && report.labCount === 0)) {
    return;
  }
  const previousTitle = document.title;
  document.body.classList.add("printing-report");
  document.title = `MIRA-clinical-summary-${dateInputValue(new Date())}`;
  const restoreTitle = () => {
    document.body.classList.remove("printing-report");
    document.title = previousTitle;
  };
  window.addEventListener("afterprint", restoreTitle, { once: true });
  window.print();
}

function openDialog(dialog) {
  if (!dialog || typeof dialog.showModal !== "function") {
    return;
  }
  dialog.showModal();
  document.documentElement.classList.add("modal-open");
  refreshIcons();
  localizeDocument(dialog);
}

function closeDialog(dialog) {
  if (!dialog?.open) {
    return;
  }
  dialog.close();
  if (!document.querySelector("dialog[open]")) {
    document.documentElement.classList.remove("modal-open");
  }
}

function defaultDoseTime() {
  state.els.doseTime.value = toLocalDateTimeInput(new Date());
}

function getDoseRouteKind(medication) {
  if (!medication) {
    return null;
  }
  if (medication.id === "estradiol-gel") {
    return "gel";
  }
  if (medication.id === "estradiol-sublingual") {
    return "sublingual";
  }
  if (
    medication.id === "estradiol-patch-weekly" ||
    medication.id === "estradiol-patch-twice-weekly"
  ) {
    return "patch";
  }
  if (medication.routeLabel.includes("注射")) {
    return "injection";
  }
  if (medication.routeLabel.includes("口服")) {
    return "oral";
  }
  return null;
}

function showDoseExtraGroup(kind) {
  const groups = {
    gel: state.els.gelExtraGroup,
    sublingual: state.els.sublingualExtraGroup,
    oral: state.els.oralExtraGroup,
    injection: state.els.injectionExtraGroup,
    patch: state.els.patchExtraGroup,
  };
  Object.entries(groups).forEach(([name, group]) => {
    group.hidden = name !== kind;
  });
  state.els.doseExtraFields.hidden = !kind;
  state.els.doseRepeatField.hidden = kind === "patch";
  state.els.gelWashHoursField.hidden =
    kind !== "gel" || !state.els.gelWash.checked;
}

function collectDoseExtras(medication) {
  const kind = getDoseRouteKind(medication);
  if (kind === "gel") {
    return {
      gelConcentration: Number(state.els.gelConcentration.value),
      gelAreaCm2: Number(state.els.gelArea.value),
      gelSite: state.els.gelSite.value,
      ...(state.els.gelWash.checked
        ? { gelWashAfterHours: Number(state.els.gelWashHours.value) }
        : {}),
    };
  }
  if (kind === "sublingual") {
    return {
      sublingualHoldMinutes: Number(state.els.sublingualHold.value),
      sublingualSwallowed: state.els.sublingualSwallowed.checked,
    };
  }
  if (kind === "oral") {
    return { oralWithFood: state.els.oralFood.value };
  }
  if (kind === "injection") {
    return {
      injectionCarrierOil: state.els.injectionOil.value,
      injectionSite: state.els.injectionSite.value,
    };
  }
  if (kind === "patch") {
    return {
      patchBrand: state.els.patchBrand.value.trim().slice(0, 80),
      patchIntervalDays: Number(state.els.patchInterval.value),
    };
  }
  return {};
}

function populateDoseExtras(medication, extras = {}, repeatDays = null) {
  const kind = getDoseRouteKind(medication);
  if (kind === "gel") {
    if (Number.isFinite(Number(extras.gelConcentration))) {
      state.els.gelConcentration.value = String(extras.gelConcentration);
    }
    if (Number.isFinite(Number(extras.gelAreaCm2))) {
      state.els.gelArea.value = String(extras.gelAreaCm2);
    }
    if (extras.gelSite) {
      state.els.gelSite.value = extras.gelSite;
    }
    state.els.gelWash.checked =
      Number.isFinite(Number(extras.gelWashAfterHours)) &&
      Number(extras.gelWashAfterHours) > 0;
    if (state.els.gelWash.checked) {
      state.els.gelWashHours.value = String(extras.gelWashAfterHours);
    }
  } else if (kind === "sublingual") {
    if (Number.isFinite(Number(extras.sublingualHoldMinutes))) {
      state.els.sublingualHold.value = String(
        extras.sublingualHoldMinutes,
      );
    }
    if (typeof extras.sublingualSwallowed === "boolean") {
      state.els.sublingualSwallowed.checked = extras.sublingualSwallowed;
    }
  } else if (kind === "oral" && extras.oralWithFood) {
    state.els.oralFood.value = extras.oralWithFood;
  } else if (kind === "injection") {
    if (extras.injectionCarrierOil) {
      state.els.injectionOil.value = extras.injectionCarrierOil;
    }
    if (extras.injectionSite) {
      state.els.injectionSite.value = extras.injectionSite;
    }
  } else if (kind === "patch") {
    if (extras.patchBrand) {
      state.els.patchBrand.value = extras.patchBrand;
    }
    const interval = extras.patchIntervalDays ?? repeatDays;
    if (Number.isFinite(Number(interval)) && Number(interval) > 0) {
      state.els.patchInterval.value = String(interval);
    }
  }
  showDoseExtraGroup(kind);
}

function formatDoseExtras(medication, extras = {}, repeatDays = null) {
  const kind = getDoseRouteKind(medication);
  const english = currentLanguage() === "en";
  const siteLabels = {
    arm: ["上臂 / 前臂", "arm / forearm"],
    thigh: ["大腿", "thigh"],
    abdomen: ["腹部", "abdomen"],
    gluteal: ["臀肌", "gluteal"],
    ventrogluteal: ["臀中肌", "ventrogluteal"],
    deltoid: ["三角肌", "deltoid"],
    subcutaneous: ["皮下", "subcutaneous"],
  };
  const oilLabels = {
    unknown: ["未知载体", "unknown carrier"],
    castor: ["蓖麻油", "castor oil"],
    sesame: ["芝麻油", "sesame oil"],
    "tea-seed": ["茶籽油", "tea-seed oil"],
    other: ["其他载体", "other carrier"],
  };
  const foodLabels = {
    unknown: ["饮食未记录", "food timing not recorded"],
    empty: ["空腹", "empty stomach"],
    "with-food": ["随餐 / 餐后", "with / after food"],
  };
  const pick = (labels, key, fallbackZh, fallbackEn) => {
    const value = labels[key];
    return value ? value[english ? 1 : 0] : english ? fallbackEn : fallbackZh;
  };
  let parts = [];

  if (kind === "gel") {
    const hasGelDetails = [
      "gelConcentration",
      "gelAreaCm2",
      "gelSite",
      "gelWashAfterHours",
    ].some((key) => extras[key] !== undefined);
    if (!hasGelDetails) {
      return english
        ? "gel details not recorded; model uses standard defaults"
        : "凝胶参数未记录，模型使用标准默认值";
    }
    const site = pick(siteLabels, extras.gelSite, "上臂", "arm");
    const wash = Number.isFinite(Number(extras.gelWashAfterHours))
      ? english
        ? `wash after ${extras.gelWashAfterHours} h`
        : `${extras.gelWashAfterHours} 小时后清洗`
      : english
        ? "no wash recorded"
        : "未记录清洗";
    parts = [
      Number.isFinite(Number(extras.gelConcentration))
        ? `${Number(extras.gelConcentration).toFixed(2)} mg/g`
        : english
          ? "concentration not recorded"
          : "浓度未记录",
      Number.isFinite(Number(extras.gelAreaCm2))
        ? `${Number(extras.gelAreaCm2)} cm²`
        : english
          ? "area not recorded"
          : "面积未记录",
      site,
      wash,
    ];
  } else if (kind === "sublingual") {
    if (
      extras.sublingualHoldMinutes === undefined &&
      extras.sublingualSwallowed === undefined
    ) {
      return english
        ? "sublingual details not recorded; model uses standard defaults"
        : "含服参数未记录，模型使用标准默认值";
    }
    const held = Number(extras.sublingualHoldMinutes ?? 10);
    parts = [
      english ? `held ${held} min` : `含服 ${held} 分钟`,
      extras.sublingualSwallowed === false
        ? english
          ? "not swallowed"
          : "未吞咽"
        : english
          ? "swallowed"
          : "已吞咽",
    ];
  } else if (kind === "oral") {
    parts = [
      pick(
        foodLabels,
        extras.oralWithFood,
        "饮食未记录",
        "food timing not recorded",
      ),
    ];
  } else if (kind === "injection") {
    parts = [
      pick(
        oilLabels,
        extras.injectionCarrierOil,
        "未知载体",
        "unknown carrier",
      ),
      pick(
        siteLabels,
        extras.injectionSite,
        "注射部位未记录",
        "injection site not recorded",
      ),
    ];
  } else if (kind === "patch") {
    parts = [
      extras.patchBrand
        ? `${english ? "brand" : "品牌"}: ${extras.patchBrand}`
        : english
          ? "brand not recorded"
          : "品牌未记录",
      extras.patchIntervalDays
        ? english
          ? `replace every ${extras.patchIntervalDays} d`
          : `每 ${extras.patchIntervalDays} 天更换`
        : repeatDays
          ? english
            ? `replace every ${repeatDays} d`
            : `每 ${repeatDays} 天更换`
          : "",
    ].filter(Boolean);
  }

  const text = parts.filter(Boolean).join(" · ");
  return english ? text : toCurrentLanguage(text);
}

function updateDoseMedicationPreview(medicationId) {
  const medication = getMedication(medicationId);
  const preview = state.els.selectedMedication;
  const note = state.els.doseModelNote;
  const unit = state.els.doseUnitLabel;

  if (!medication) {
    preview.hidden = true;
    preview.replaceChildren();
    unit.textContent = "mg";
    note.innerHTML =
      '<i data-lucide="info" aria-hidden="true"></i><p>选择药品后，这里会说明该药是否纳入浓度估算。</p>';
    showDoseExtraGroup(null);
    refreshIcons();
    localizeDocument(state.els.doseDialog);
    return;
  }

  preview.hidden = false;
  preview.replaceChildren();
  preview.append(
    makeElement("strong", null, `${medication.name} · ${medication.nameEn}`),
    makeElement(
      "p",
      null,
      `${medication.routeLabel} / ${medication.formLabel} / ${medication.concentration ? medication.modelLabel : "仅做记录"}`,
    ),
  );
  unit.textContent = medication.unit;
  const routeKind = getDoseRouteKind(medication);
  showDoseExtraGroup(routeKind);
  if (routeKind === "patch") {
    state.els.patchInterval.value =
      medication.id === "estradiol-patch-weekly" ? "7" : "3.5";
  }
  note.innerHTML = medication.concentration
    ? '<i data-lucide="chart-line" aria-hidden="true"></i><p>该药将使用公开三室模型估算外源雌二醇贡献。估算不是实际化验。</p>'
    : '<i data-lucide="info" aria-hidden="true"></i><p>当前未将该药纳入浓度模型。记录仍会保存在本机，并出现在用药历史中。</p>';
  refreshIcons();
  localizeDocument(state.els.doseDialog);
}

function openDoseDialog(medicationId = "", editingEntry = null) {
  state.editingDoseId = editingEntry?.id ?? null;
  state.els.doseForm.reset();
  state.els.doseFormError.textContent = "";
  state.els.doseTime.value = editingEntry
    ? toLocalDateTimeInput(new Date(editingEntry.takenAt))
    : toLocalDateTimeInput(new Date());
  state.els.doseMedication.value = medicationId;
  updateDoseMedicationPreview(medicationId);
  const medication = getMedication(medicationId);
  if (editingEntry && medication) {
    state.els.doseAmount.value = String(editingEntry.dose);
    state.els.doseRepeat.value =
      editingEntry.repeatDays !== null &&
      editingEntry.repeatDays !== undefined
        ? String(editingEntry.repeatDays)
        : "";
    state.els.doseNote.value = editingEntry.note ?? "";
    populateDoseExtras(
      medication,
      editingEntry.modelExtras ?? {},
      editingEntry.repeatDays,
    );
  }
  state.els.doseDialogTitle.textContent = editingEntry
    ? "编辑用药记录"
    : "记录一次用药";
  state.els.doseSubmitLabel.textContent = editingEntry
    ? "保存修改"
    : "保存记录";
  openDialog(state.els.doseDialog);
}

function openLabDialog() {
  state.els.labForm.reset();
  state.els.labFormError.textContent = "";
  state.els.labTime.value = toLocalDateTimeInput(new Date());
  openDialog(state.els.labDialog);
}

function closeAllMenus() {
  state.els.sidebar.classList.remove("is-open");
  state.els.sidebarOverlay.classList.remove("is-visible");
  state.els.menuButton.setAttribute("aria-expanded", "false");
}

function switchView(viewName) {
  if (!VIEW_LABELS[viewName] || !state.els.viewPanels.has(viewName)) {
    return;
  }
  state.activeView = viewName;
  for (const [name, panel] of state.els.viewPanels.entries()) {
    panel.hidden = name !== viewName;
    panel.classList.toggle("is-active", name === viewName);
  }
  document.querySelectorAll(".nav-item[data-view], .mobile-nav [data-view]").forEach(
    (button) => {
      button.classList.toggle("is-active", button.dataset.view === viewName);
    },
  );
  state.els.currentViewLabel.textContent = toCurrentLanguage(
    VIEW_LABELS[viewName],
  );
  closeAllMenus();
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });

  requestAnimationFrame(() => {
    if (viewName === "overview" && state.chart) {
      state.chart.resize();
    }
    if (viewName === "labs" && state.labChart) {
      state.labChart.resize();
    }
  });
}

function renderAll() {
  updateDateHeader();
  renderMetrics();
  renderOverviewLists();
  renderOverviewChart();
  renderDoseTable();
  renderLabSummary();
  renderLabTable();
  renderGuide();
  renderLabChart();
  renderMedicationGrid();
  state.els.demoBanner.hidden = !state.data.settings.isDemo;
  document.querySelectorAll("[data-concentration-unit]").forEach((button) => {
    const active =
      button.dataset.concentrationUnit ===
      state.data.settings.concentrationUnit;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-chart-range]").forEach((button) => {
    const active =
      Number(button.dataset.chartRange) === state.data.settings.chartRange;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  state.els.languageSelect.value = currentLanguage();
  refreshIcons();
  localizeDocument();
}

function openMedicationDetail(medicationId) {
  const medication = getMedication(medicationId);
  if (!medication) {
    return;
  }
  const sourceLinks = sourceItemsForMedication(medication)
    .map(
      (source) =>
        `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.publisher}</a>`,
    )
    .join("");
  const content = state.els.medicationDialogContent;
  content.innerHTML = `
    <div class="med-detail-hero">
      <div class="med-detail-top">
        <div>
          <p class="panel-kicker">${medication.categoryLabel} · ${medication.abbreviation}</p>
          <h2 id="medication-dialog-title">${medication.name}</h2>
          <p>${medication.nameEn}</p>
        </div>
        <button class="icon-button" type="button" data-dialog-close aria-label="关闭">
          <i data-lucide="x" aria-hidden="true"></i>
        </button>
      </div>
      <div class="med-detail-badges">
        <span>${medication.routeLabel}</span>
        <span>${medication.formLabel}</span>
        <span>记录单位：${medication.unit}</span>
      </div>
    </div>
    <div class="med-detail-body">
      <div class="med-detail-section">
        <h3>药品说明</h3>
        <p>${medication.description}</p>
      </div>
      <div class="med-detail-section">
        <h3>记录与监测提示</h3>
        <p>${medication.monitoring}</p>
      </div>
      <div class="med-detail-section">
        <h3>浓度估算状态</h3>
        <div class="model-status">
          <i data-lucide="${medication.concentration ? "chart-line" : "file-text"}" aria-hidden="true"></i>
          <span>${medication.concentration ? `${medication.modelLabel}可用。曲线是人群模型估算，不是实际血药浓度检测。` : "此药当前仅做记录，不生成浓度曲线，避免使用不可靠的模型参数。"}</span>
        </div>
      </div>
      <div class="med-detail-section">
        <h3>公开来源</h3>
        <div class="med-source-links">${sourceLinks || "<span>暂无额外链接</span>"}</div>
      </div>
    </div>
    <div class="med-detail-actions">
      <button class="ghost-button" type="button" data-dialog-close>关闭</button>
      <button class="primary-button" type="button" data-log-medication="${medication.id}">
        <i data-lucide="plus" aria-hidden="true"></i>
        记录这种药
      </button>
    </div>
  `;
  openDialog(state.els.medicationDialog);
}

function resetDemo() {
  state.data = createDemoState(state.data.settings);
  persist();
  renderAll();
  showToast("演示数据已重置");
}

function clearToEmpty() {
  state.data = createEmptyState(state.data.settings);
  persist();
  renderAll();
  showToast("已清空，可开始记录自己的数据");
}

function handleDoseSubmit(event) {
  event.preventDefault();
  const medicationId = state.els.doseMedication.value;
  const medication = getMedication(medicationId);
  const dose = Number(state.els.doseAmount.value);
  const takenAt = new Date(state.els.doseTime.value);
  const repeatValue = state.els.doseRepeat.value.trim();
  const routeKind = getDoseRouteKind(medication);
  const modelExtras = collectDoseExtras(medication);
  let repeatDays =
    routeKind === "patch"
      ? Number(modelExtras.patchIntervalDays)
      : repeatValue === ""
        ? null
        : Number(repeatValue);
  const error = state.els.doseFormError;
  error.textContent = "";

  if (!medication) {
    setFormError(error, "请选择一种药品。");
    return;
  }
  if (!Number.isFinite(dose) || dose <= 0 || dose > 10000) {
    setFormError(error, "请输入有效剂量，并核对记录单位。");
    return;
  }
  if (Number.isNaN(takenAt.getTime())) {
    setFormError(error, "请选择有效的给药时间。");
    return;
  }
  if (takenAt.getTime() > Date.now() + 5 * 60 * 1000) {
    setFormError(
      error,
      "给药时间不能晚于当前时间。未来用量可通过重复间隔进行投影。",
    );
    return;
  }
  if (
    repeatDays !== null &&
    (!Number.isFinite(repeatDays) ||
      repeatDays < (routeKind === "patch" ? 0.5 : 0.25) ||
      repeatDays > (routeKind === "patch" ? 14 : 90))
  ) {
    setFormError(
      error,
      routeKind === "patch"
        ? "贴片更换周期应为 0.5–14 天。"
        : "重复间隔应为 0.25–90 天，或留空表示单次记录。",
    );
    return;
  }
  if (
    routeKind === "gel" &&
    (!Number.isFinite(modelExtras.gelConcentration) ||
      modelExtras.gelConcentration < 0.01 ||
      modelExtras.gelConcentration > 10 ||
      !Number.isFinite(modelExtras.gelAreaCm2) ||
      modelExtras.gelAreaCm2 < 1 ||
      modelExtras.gelAreaCm2 > 5000 ||
      (state.els.gelWash.checked &&
        (!Number.isFinite(modelExtras.gelWashAfterHours) ||
          modelExtras.gelWashAfterHours < 0.25 ||
          modelExtras.gelWashAfterHours > 24)))
  ) {
    setFormError(error, "请检查凝胶浓度、涂抹面积和清洗时间。");
    return;
  }

  const wasDemo = state.data.settings.isDemo;
  const editingId = state.editingDoseId;
  if (wasDemo && !editingId) {
    state.data = createEmptyState(state.data.settings);
  }
  const doseRecord = {
    id: editingId || createId("dose"),
    medicationId,
    dose,
    takenAt: takenAt.toISOString(),
    repeatDays,
    note: state.els.doseNote.value.trim().slice(0, 200),
    modelExtras,
  };
  if (editingId) {
    const index = state.data.doses.findIndex((entry) => entry.id === editingId);
    if (index === -1) {
      setFormError(error, "找不到要编辑的记录，请刷新后重试。");
      return;
    }
    state.data.doses[index] = doseRecord;
  } else {
    state.data.doses.push(doseRecord);
    state.data.settings.isDemo = false;
  }
  persist();
  closeDialog(state.els.doseDialog);
  renderAll();
  switchView("overview");
  if (editingId) {
    showToast("用药记录已更新");
  } else if (!medication.concentration) {
    showToast(
      wasDemo
        ? "示例已清除；该剂型仅保存记录，不生成曲线"
        : "记录已保存；该剂型暂不生成浓度曲线",
    );
  } else {
    showToast(wasDemo ? "示例已清除，个人记录已保存" : "用药记录已保存");
  }
}

function handleLabSubmit(event) {
  event.preventDefault();
  const labAt = new Date(state.els.labTime.value);
  const e2Raw = safeNumber(state.els.labE2.value);
  const tRaw = safeNumber(state.els.labT.value);
  const prlRaw = safeNumber(state.els.labPrl.value);
  const error = state.els.labFormError;
  error.textContent = "";

  if (Number.isNaN(labAt.getTime())) {
    setFormError(error, "请选择有效的采血时间。");
    return;
  }
  if (labAt.getTime() > Date.now() + 5 * 60 * 1000) {
    setFormError(error, "采血时间不能晚于当前时间。");
    return;
  }
  if (e2Raw === null && tRaw === null && prlRaw === null) {
    setFormError(error, "至少填写一项真实化验数值。");
    return;
  }
  if ([e2Raw, tRaw, prlRaw].some((value) => value !== null && value < 0)) {
    setFormError(error, "化验数值不能为负数。");
    return;
  }

  const e2Unit = state.els.labE2Unit.value;
  const tUnit = state.els.labTUnit.value;
  const estradiolPgMl =
    e2Raw === null
      ? null
      : e2Unit === "pmol/L"
        ? e2Raw / ESTRADIOL_UNIT_FACTOR
        : e2Raw;
  const testosteroneNgDl =
    tRaw === null
      ? null
      : tUnit === "nmol/L"
        ? tRaw / TESTOSTERONE_UNIT_FACTOR
        : tRaw;

  const wasDemo = state.data.settings.isDemo;
  if (wasDemo) {
    state.data = createEmptyState(state.data.settings);
  }
  state.data.labs.push({
    id: createId("lab"),
    labAt: labAt.toISOString(),
    estradiolPgMl,
    testosteroneNgDl,
    prolactinNgMl: prlRaw,
    note: state.els.labNote.value.trim().slice(0, 200),
  });
  state.data.settings.isDemo = false;
  persist();
  closeDialog(state.els.labDialog);
  renderAll();
  switchView("labs");
  showToast(wasDemo ? "示例已清除，真实化验已保存" : "真实化验已保存");
}

function deleteDose(id) {
  const entry = state.data.doses.find((item) => item.id === id);
  if (!entry) {
    return;
  }
  const medication = getMedication(entry.medicationId);
  const confirmed = window.confirm(
    toCurrentLanguage(
      `确定删除这条 ${toCurrentLanguage(medication?.name ?? "用药")} 记录吗？此操作无法撤销。`,
    ),
  );
  if (!confirmed) {
    return;
  }
  state.data.doses = state.data.doses.filter((item) => item.id !== id);
  persist();
  renderAll();
  showToast("记录已删除");
}

function deleteLab(id) {
  const confirmed = window.confirm(
    toCurrentLanguage("确定删除这条化验记录吗？此操作无法撤销。"),
  );
  if (!confirmed) {
    return;
  }
  state.data.labs = state.data.labs.filter((item) => item.id !== id);
  persist();
  renderAll();
  showToast("化验记录已删除");
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function exportJson() {
  const payload = {
    app: "MIRA HRT Studio",
    appVersion: "2.0.0",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state.data,
  };
  downloadBlob(
    `mira-hrt-backup-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(payload, null, 2),
    "application/json",
  );
  showToast("数据备份已导出");
}

function exportLabsCsv() {
  downloadBlob(
    `mira-lab-log-${new Date().toISOString().slice(0, 10)}.csv`,
    labsCsv(state.data.labs, state.data.settings.isDemo),
    "text/csv;charset=utf-8",
  );
  showToast("化验 CSV 已导出");
}

function exportDosesCsv() {
  const header = [
    "taken_at",
    "medication",
    "medication_en",
    "dose",
    "unit",
    "route",
    "repeat_days",
    "note",
    "form_details",
    "model_extras",
    "demo",
  ];
  const rows = [...state.data.doses]
    .sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt))
    .map((entry) => {
      const medication = getMedication(entry.medicationId);
      return [
        new Date(entry.takenAt).toISOString(),
        medication?.name,
        medication?.nameEn,
        entry.dose,
        medication?.unit,
        medication?.routeLabel,
        entry.repeatDays ?? "",
        entry.note,
        formatDoseExtras(
          medication,
          entry.modelExtras ?? {},
          entry.repeatDays,
        ),
        JSON.stringify(entry.modelExtras ?? {}),
        state.data.settings.isDemo ? "yes" : "no",
      ]
        .map(csvCell)
        .join(",");
    });
  downloadBlob(
    `mira-dose-log-${new Date().toISOString().slice(0, 10)}.csv`,
    `\uFEFF${[header.map(csvCell).join(","), ...rows].join("\r\n")}`,
    "text/csv;charset=utf-8",
  );
  showToast("用药 CSV 已导出");
}

async function importBackup(file) {
  if (!file) {
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast("备份文件过大");
    return;
  }
  try {
    const parsed = JSON.parse(await file.text());
    const imported = normalizeState(validateBackup(parsed));
    imported.settings.language = currentLanguage();
    imported.settings.onboardingCompleted = true;
    const counts = currentLanguage() === "en"
      ? `Current: ${state.data.doses.length} medications, ${state.data.labs.length} labs.\nIncoming: ${imported.doses.length} medications, ${imported.labs.length} labs.${imported.settings.isDemo ? "\nDEMO DATA" : ""}`
      : toCurrentLanguage(`当前：${state.data.doses.length} 条用药、${state.data.labs.length} 条化验。\n导入：${imported.doses.length} 条用药、${imported.labs.length} 条化验。${imported.settings.isDemo ? "\n演示数据" : ""}`);
    const confirmed = window.confirm(`${counts}\n\n${toCurrentLanguage(
      "导入会替换当前浏览器中的全部用药与化验记录。确定继续吗？",
    )}`);
    if (!confirmed) {
      return;
    }
    // Save first: a blocked/full browser store must not replace the visible records.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    state.data = imported;
    renderAll();
    switchView("overview");
    showToast("备份已导入");
  } catch {
    showToast("无法读取该备份文件");
  }
}

function clearAllData() {
  const confirmed = window.confirm(
    toCurrentLanguage(
      "确定清空所有本机用药与化验记录吗？建议先导出备份。此操作无法撤销。",
    ),
  );
  if (!confirmed) {
    return;
  }
  clearToEmpty();
}

function setConcentrationUnit(unit) {
  if (!["pg/mL", "pmol/L"].includes(unit)) {
    return;
  }
  state.data.settings.concentrationUnit = unit;
  persist();
  renderAll();
}

function setChartRange(days) {
  if (![7, 14, 30].includes(days)) {
    return;
  }
  state.data.settings.chartRange = days;
  persist();
  renderAll();
}

function collectElements() {
  const els = state.els;
  els.appShell = getElement("app-shell");
  els.sidebar = getElement("sidebar");
  els.sidebarOverlay = getElement("sidebar-overlay");
  els.menuButton = getElement("menu-button");
  els.languageSelect = getElement("language-select");
  els.currentViewLabel = getElement("current-view-label");
  els.demoBanner = getElement("demo-banner");
  els.resetDemoButton = getElement("reset-demo-button");
  els.clearDemoButton = getElement("clear-demo-button");
  els.todayLabel = getElement("today-label");
  els.dateDay = getElement("date-day");
  els.dateMonth = getElement("date-month");
  els.dateWeekday = getElement("date-weekday");
  els.currentE2 = getElement("current-e2");
  els.currentE2Unit = getElement("current-e2-unit");
  els.currentE2Status = getElement("current-e2-status");
  els.latestLabE2 = getElement("latest-lab-e2");
  els.latestLabUnit = getElement("latest-lab-unit");
  els.latestLabDate = getElement("latest-lab-date");
  els.weekDoseCount = getElement("week-dose-count");
  els.weekDoseCaption = getElement("week-dose-caption");
  els.dataHealthLabel = getElement("data-health-label");
  els.e2Chart = getElement("e2-chart");
  els.chartEmpty = getElement("chart-empty");
  els.chartEmptyTitle = getElement("chart-empty-title");
  els.chartEmptyCopy = getElement("chart-empty-copy");
  els.chartEmptyAction = getElement("chart-empty-action");
  els.curveInsightTitle = getElement("curve-insight-title");
  els.curveInsightCopy = getElement("curve-insight-copy");
  els.todayDoseList = getElement("today-dose-list");
  els.latestLabSnapshot = getElement("latest-lab-snapshot");
  els.routineList = getElement("routine-list");
  els.doseSearch = getElement("dose-search");
  els.doseCategoryFilter = getElement("dose-category-filter");
  els.doseTableBody = getElement("dose-table-body");
  els.doseTableEmpty = getElement("dose-table-empty");
  els.labSummaryE2 = getElement("lab-summary-e2");
  els.labSummaryE2Date = getElement("lab-summary-e2-date");
  els.labSummaryT = getElement("lab-summary-t");
  els.labSummaryTDate = getElement("lab-summary-t-date");
  els.labSummaryPrl = getElement("lab-summary-prl");
  els.labSummaryPrlDate = getElement("lab-summary-prl-date");
  els.labChart = getElement("lab-chart");
  els.labChartEmpty = getElement("lab-chart-empty");
  els.referencePill = document.querySelector(".reference-pill");
  els.labTableBody = getElement("lab-table-body");
  els.labTableEmpty = getElement("lab-table-empty");
  els.medicationSearch = getElement("medication-search");
  els.categoryFilter = getElement("category-filter");
  els.medicationGrid = getElement("medication-grid");
  els.medicationEmpty = getElement("medication-empty");
  els.libraryCount = getElement("library-count");
  els.sourceList = getElement("source-list");
  els.guideSearch = getElement("guide-search");
  els.guideCategoryFilter = getElement("guide-category-filter");
  els.guideResultCount = getElement("guide-result-count");
  els.guideContent = getElement("guide-content");
  els.guideEmpty = getElement("guide-empty");
  els.mtfWikiHomeLink = getElement("mtf-wiki-home-link");
  els.mtfWikiSourceLink = getElement("mtf-wiki-source-link");
  els.mtfWikiLicenseLink = getElement("mtf-wiki-license-link");
  els.mtfWikiEditLink = getElement("mtf-wiki-edit-link");
  els.guideCheckedDate = getElement("guide-checked-date");
  els.doseDialog = getElement("dose-dialog");
  els.doseDialogTitle = getElement("dose-dialog-title");
  els.doseSubmitButton = getElement("dose-submit-button");
  els.doseSubmitLabel = els.doseSubmitButton.querySelector("span");
  els.labDialog = getElement("lab-dialog");
  els.medicationDialog = getElement("medication-dialog");
  els.medicationDialogContent = getElement("medication-dialog-content");
  els.reportDialog = getElement("report-dialog");
  els.reportPreviewPage = getElement("report-preview-page");
  els.clinicalReport = getElement("clinical-report");
  els.reportStartDate = getElement("report-start-date");
  els.reportEndDate = getElement("report-end-date");
  els.reportEntryCount = getElement("report-entry-count");
  els.printReportButton = getElement("print-report-button");
  els.doseForm = getElement("dose-form");
  els.labForm = getElement("lab-form");
  els.doseMedication = getElement("dose-medication");
  els.selectedMedication = getElement("selected-medication");
  els.doseAmount = getElement("dose-amount");
  els.doseUnitLabel = getElement("dose-unit-label");
  els.doseTime = getElement("dose-time");
  els.doseRepeat = getElement("dose-repeat");
  els.doseRepeatField = getElement("dose-repeat-field");
  els.doseExtraFields = getElement("dose-extra-fields");
  els.gelExtraGroup = document.querySelector('[data-extra-group="gel"]');
  els.sublingualExtraGroup = document.querySelector(
    '[data-extra-group="sublingual"]',
  );
  els.oralExtraGroup = document.querySelector('[data-extra-group="oral"]');
  els.injectionExtraGroup = document.querySelector(
    '[data-extra-group="injection"]',
  );
  els.patchExtraGroup = document.querySelector('[data-extra-group="patch"]');
  els.gelConcentration = getElement("gel-concentration");
  els.gelArea = getElement("gel-area");
  els.gelSite = getElement("gel-site");
  els.gelWash = getElement("gel-wash");
  els.gelWashHours = getElement("gel-wash-hours");
  els.gelWashHoursField = getElement("gel-wash-hours-field");
  els.sublingualHold = getElement("sublingual-hold");
  els.sublingualSwallowed = getElement("sublingual-swallowed");
  els.oralFood = getElement("oral-food");
  els.injectionOil = getElement("injection-oil");
  els.injectionSite = getElement("injection-site");
  els.patchBrand = getElement("patch-brand");
  els.patchInterval = getElement("patch-interval");
  els.doseNote = getElement("dose-note");
  els.doseModelNote = getElement("dose-model-note");
  els.doseFormError = getElement("dose-form-error");
  els.labTime = getElement("lab-time");
  els.labE2 = getElement("lab-e2");
  els.labE2Unit = getElement("lab-e2-unit");
  els.labT = getElement("lab-t");
  els.labTUnit = getElement("lab-t-unit");
  els.labPrl = getElement("lab-prl");
  els.labNote = getElement("lab-note");
  els.labFormError = getElement("lab-form-error");
  els.toast = getElement("toast");
  els.onboardingLayer = getElement("onboarding-layer");
  els.onboardingKicker = getElement("onboarding-kicker");
  els.onboardingMeaning = getElement("onboarding-meaning");
  els.onboardingAsideCopy = getElement("onboarding-aside-copy");
  els.onboardingProgress = getElement("onboarding-progress");
  els.onboardingContent = getElement("onboarding-content");
  els.onboardingBack = getElement("onboarding-back");
  els.onboardingNext = getElement("onboarding-next");
  els.onboardingStepLabel = getElement("onboarding-step-label");
  els.onboardingClose = getElement("onboarding-close");
  els.viewPanels = new Map(
    [...document.querySelectorAll("[data-view-panel]")].map((panel) => [
      panel.dataset.viewPanel,
      panel,
    ]),
  );
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const onboardingLanguageButton = event.target.closest(
      "[data-onboarding-language]",
    );
    if (onboardingLanguageButton) {
      state.onboardingLanguage =
        onboardingLanguageButton.dataset.onboardingLanguage;
      renderOnboarding();
      return;
    }

    const onboardingStartButton = event.target.closest("[data-onboarding-start]");
    if (onboardingStartButton) {
      state.onboardingStartChoice =
        onboardingStartButton.dataset.onboardingStart;
      renderOnboarding();
      return;
    }

    const onboardingOpenButton = event.target.closest("[data-onboarding-open]");
    if (onboardingOpenButton) {
      openOnboarding();
      return;
    }

    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      event.preventDefault();
      switchView(viewButton.dataset.view);
      return;
    }

    const openButton = event.target.closest("[data-dialog-open]");
    if (openButton) {
      event.preventDefault();
      if (openButton.dataset.dialogOpen === "dose-dialog") {
        openDoseDialog();
      } else if (openButton.dataset.dialogOpen === "lab-dialog") {
        openLabDialog();
      } else if (openButton.dataset.dialogOpen === "report-dialog") {
        openReportDialog();
      }
      return;
    }

    const closeButton = event.target.closest("[data-dialog-close]");
    if (closeButton) {
      closeDialog(closeButton.closest("dialog"));
      return;
    }

    const categoryChip = event.target.closest("[data-category]");
    if (categoryChip) {
      state.selectedCategory = categoryChip.dataset.category;
      renderCategoryChips();
      renderMedicationGrid();
      refreshIcons();
      scheduleLocalization(state.els.viewPanels.get("library"));
      return;
    }

    const guideCategoryChip = event.target.closest("[data-guide-category]");
    if (guideCategoryChip) {
      state.guideCategory = guideCategoryChip.dataset.guideCategory;
      renderGuide();
      scheduleLocalization(state.els.viewPanels.get("guide"));
      return;
    }

    const medicationCard = event.target.closest("[data-med-id]");
    if (medicationCard) {
      openMedicationDetail(medicationCard.dataset.medId);
      return;
    }

    const logMedicationButton = event.target.closest("[data-log-medication]");
    if (logMedicationButton) {
      closeDialog(state.els.medicationDialog);
      openDoseDialog(logMedicationButton.dataset.logMedication);
      return;
    }

    const deleteDoseButton = event.target.closest("[data-delete-dose]");
    if (deleteDoseButton) {
      deleteDose(deleteDoseButton.dataset.deleteDose);
      return;
    }

    const editDoseButton = event.target.closest("[data-edit-dose]");
    if (editDoseButton) {
      const entry = state.data.doses.find(
        (item) => item.id === editDoseButton.dataset.editDose,
      );
      if (entry) {
        openDoseDialog(entry.medicationId, entry);
      }
      return;
    }

    const deleteLabButton = event.target.closest("[data-delete-lab]");
    if (deleteLabButton) {
      deleteLab(deleteLabButton.dataset.deleteLab);
    }
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        closeDialog(dialog);
      }
    });
    dialog.addEventListener("close", () => {
      if (!document.querySelector("dialog[open]")) {
        document.documentElement.classList.remove("modal-open");
      }
    });
  });

  document.querySelectorAll("[data-concentration-unit]").forEach((button) => {
    button.addEventListener("click", () => {
      setConcentrationUnit(button.dataset.concentrationUnit);
    });
  });

  document.querySelectorAll("[data-chart-range]").forEach((button) => {
    button.addEventListener("click", () => {
      setChartRange(Number(button.dataset.chartRange));
    });
  });

  document.querySelectorAll("[data-report-range]").forEach((button) => {
    button.addEventListener("click", () => {
      setReportRange(Number(button.dataset.reportRange));
    });
  });
  [state.els.reportStartDate, state.els.reportEndDate].forEach((input) => {
    input.addEventListener("change", () => {
      document
        .querySelectorAll("[data-report-range]")
        .forEach((button) => button.classList.remove("is-active"));
      renderReportPreview();
    });
  });
  state.els.printReportButton.addEventListener("click", printClinicalReport);

  state.els.doseMedication.addEventListener("change", () => {
    updateDoseMedicationPreview(state.els.doseMedication.value);
  });
  state.els.gelWash.addEventListener("change", () => {
    state.els.gelWashHoursField.hidden =
      !state.els.gelWash.checked ||
      state.els.gelExtraGroup.hidden;
  });
  state.els.doseForm.addEventListener("submit", handleDoseSubmit);
  state.els.labForm.addEventListener("submit", handleLabSubmit);
  state.els.doseSearch.addEventListener("input", () =>
    scheduleLocalization(state.els.viewPanels.get("doses")),
  );
  state.els.doseCategoryFilter.addEventListener("change", () => {
    renderDoseTable();
    scheduleLocalization(state.els.viewPanels.get("doses"));
  });
  state.els.medicationSearch.addEventListener("input", () => {
    renderMedicationGrid();
    refreshIcons();
    scheduleLocalization(state.els.viewPanels.get("library"));
  });
  state.els.guideSearch.addEventListener("input", () => {
    renderGuide();
    scheduleLocalization(state.els.viewPanels.get("guide"));
  });
  state.els.resetDemoButton.addEventListener("click", resetDemo);
  state.els.clearDemoButton.addEventListener("click", clearToEmpty);
  getElement("export-doses-button").addEventListener("click", exportDosesCsv);
  getElement("export-labs-button").addEventListener("click", exportLabsCsv);
  getElement("export-json-button").addEventListener("click", exportJson);
  getElement("clear-data-button").addEventListener("click", clearAllData);
  getElement("import-file").addEventListener("change", (event) => {
    importBackup(event.target.files?.[0]);
    event.target.value = "";
  });

  state.els.menuButton.addEventListener("click", () => {
    const isOpen = state.els.sidebar.classList.toggle("is-open");
    state.els.sidebarOverlay.classList.toggle("is-visible", isOpen);
    state.els.menuButton.setAttribute("aria-expanded", String(isOpen));
  });
  state.els.sidebarOverlay.addEventListener("click", closeAllMenus);

  state.els.onboardingBack.addEventListener("click", goBackOnboarding);
  state.els.onboardingNext.addEventListener("click", advanceOnboarding);
  state.els.onboardingClose.addEventListener("click", closeOnboarding);
  state.els.languageSelect.addEventListener("change", (event) => {
    const language = event.target.value;
    if (
      !SUPPORTED_LANGUAGES.some((item) => item.id === language) ||
      language === currentLanguage()
    ) {
      return;
    }
    state.data.settings.language = language;
    persist();
    window.location.reload();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!state.els.onboardingLayer.hidden) {
        closeOnboarding();
      } else {
        closeAllMenus();
      }
    }
  });

  window.addEventListener("beforeprint", () => {
    if (state.els.reportDialog.open) {
      renderReportPreview();
      document.body.classList.add("printing-report");
    }
  });
  window.addEventListener("afterprint", () => {
    document.body.classList.remove("printing-report");
  });
}

function init() {
  collectElements();
  state.data = loadState();
  state.onboardingLanguage = currentLanguage();
  state.els.languageSelect.value = currentLanguage();
  populateMedicationOptions();
  renderCategoryChips();
  renderSourceList();
  bindEvents();
  renderAll();
  switchView("overview");
  if (!state.data.settings.onboardingCompleted) {
    openOnboarding();
  }
}

window.addEventListener("load", init, { once: true });
