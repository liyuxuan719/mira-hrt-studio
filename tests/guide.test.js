import test from "node:test";
import assert from "node:assert/strict";

import {
  GUIDE_CATEGORIES,
  GUIDE_TOPICS,
  MTF_WIKI_SOURCE,
  mtfWikiUrl,
} from "../src/guide.js";

test("MTF Wiki guide has complete localized topic metadata", () => {
  assert.equal(MTF_WIKI_SOURCE.license, "CC BY-SA 4.0");
  assert.ok(GUIDE_TOPICS.length >= 12);
  assert.equal(new Set(GUIDE_TOPICS.map((topic) => topic.id)).size, GUIDE_TOPICS.length);
  assert.ok(
    GUIDE_TOPICS.every(
      (topic) =>
        topic.title &&
        topic.titleEn &&
        topic.summary &&
        topic.summaryEn &&
        GUIDE_CATEGORIES.some((category) => category.id === topic.category),
    ),
  );
});

test("guide links resolve to the matching MTF Wiki locale", () => {
  const traditionalTopic = GUIDE_TOPICS.find((topic) => topic.traditional);
  assert.match(
    mtfWikiUrl(traditionalTopic, "zh-Hant"),
    /^https:\/\/mtf\.wiki\/zh-hant\//,
  );
  assert.match(
    mtfWikiUrl(traditionalTopic, "zh-Hans"),
    /^https:\/\/mtf\.wiki\/zh-cn\//,
  );
});
