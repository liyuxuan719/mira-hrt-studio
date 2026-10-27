import test from "node:test";
import assert from "node:assert/strict";

import {
  ONBOARDING_COPY,
  REPORT_COPY,
  SUPPORTED_LANGUAGES,
  onboardingCopy,
  translateEnglish,
} from "../src/i18n.js";

test("supports Simplified Chinese, Traditional Chinese, and English", () => {
  assert.deepEqual(
    SUPPORTED_LANGUAGES.map((language) => language.id),
    ["zh-Hans", "zh-Hant", "en"],
  );
});

test("each onboarding locale includes every core step", () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const copy = onboardingCopy(language.id);
    assert.ok(copy.languageTitle);
    assert.ok(copy.boundaryTitle);
    assert.ok(copy.startTitle);
    assert.equal(copy.progress.length, 3);
  }
});

test("English onboarding includes the safety boundary and data choice", () => {
  assert.match(ONBOARDING_COPY.en.safetyCopy, /clinician/i);
  assert.match(ONBOARDING_COPY.en.demoCopy, /sample/i);
  assert.match(ONBOARDING_COPY.en.blankCopy, /record/i);
});

test("English UI dictionary covers navigation, actions, and medication data", () => {
  assert.equal(translateEnglish("总览"), "Overview");
  assert.equal(translateEnglish("记录用药"), "Log dose");
  assert.equal(translateEnglish("雌二醇戊酸酯"), "Estradiol valerate");
  assert.equal(
    translateEnglish("三室药代模型"),
    "Three-compartment PK model",
  );
});

test("clinical report copy is complete in every supported language", () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const copy = REPORT_COPY[language.id];
    assert.ok(copy.title);
    assert.ok(copy.safetyBody);
    assert.ok(copy.residualDefinition);
    assert.match(copy.page, /1/);
  }
});
