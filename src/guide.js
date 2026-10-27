/*
 * Curated MTF Wiki guide metadata and original short summaries.
 * Guide content is provided under CC BY-SA 4.0 with attribution to
 * Project Trans and MtF Wiki contributors. See THIRD_PARTY_NOTICES.md.
 */
export const MTF_WIKI_SOURCE = {
  name: "MtF.wiki",
  url: "https://mtf.wiki/",
  repository: "https://github.com/project-trans/MtF-wiki",
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  checkedAt: "2026-10-27",
};

export const GUIDE_CATEGORIES = [
  {
    id: "start",
    title: "快速开始",
    titleEn: "Getting started",
  },
  {
    id: "medicine",
    title: "药物专题",
    titleEn: "Medication topics",
  },
  {
    id: "resources",
    title: "就医资源",
    titleEn: "Care resources",
  },
];

export const GUIDE_TOPICS = [
  {
    id: "zero-to-hrt",
    category: "start",
    title: "HRT 简明指南",
    titleEn: "A concise guide to HRT",
    summary: "从基本概念和就医准备开始，快速了解 HRT 常见主题。",
    summaryEn:
      "Start with core concepts and care preparation for an accessible introduction to common HRT topics.",
    path: "/docs/medicine/zero-to-hrt",
    traditional: false,
    tag: "入门",
    tagEn: "Start here",
  },
  {
    id: "hrt-overview",
    category: "start",
    title: "HRT 全面指南",
    titleEn: "Comprehensive HRT guide",
    summary: "面向成年读者的系统性 HRT 资料索引，覆盖药物与监测等主题。",
    summaryEn:
      "A broader index for adult readers covering medication, monitoring, and related HRT topics.",
    path: "/docs/medicine/overview",
    traditional: false,
    tag: "深入",
    tagEn: "In depth",
  },
  {
    id: "monitoring",
    category: "start",
    title: "治疗期间的监测",
    titleEn: "Monitoring during treatment",
    summary: "了解复查、化验与用药安全监测的公开资料框架。",
    summaryEn:
      "Explore the public framework for follow-up visits, laboratory checks, and medication safety monitoring.",
    path: "/docs/medicine/monitoring",
    traditional: true,
    tag: "化验",
    tagEn: "Labs",
  },
  {
    id: "estradiol-tablet",
    category: "medicine",
    title: "雌二醇片",
    titleEn: "Estradiol tablets",
    summary: "雌二醇片剂的剂型区别、使用资料与注意事项。",
    summaryEn:
      "Formulation differences, public product information, and cautions for estradiol tablets.",
    path: "/docs/medicine/estrogen/estradiol",
    traditional: true,
    tag: "口服 / 舌下",
    tagEn: "Oral / sublingual",
  },
  {
    id: "estradiol-valerate",
    category: "medicine",
    title: "戊酸雌二醇片",
    titleEn: "Estradiol valerate tablets",
    summary: "戊酸雌二醇的药理背景、产品信息与使用注意事项。",
    summaryEn:
      "Pharmacology background, product information, and cautions for estradiol valerate tablets.",
    path: "/docs/medicine/estrogen/estradiol-valerate",
    traditional: true,
    tag: "口服",
    tagEn: "Oral",
  },
  {
    id: "estradiol-patch",
    category: "medicine",
    title: "雌二醇贴片",
    titleEn: "Estradiol patches",
    summary: "外用雌二醇贴片的剂型信息与使用资料。",
    summaryEn:
      "Public information and usage material for transdermal estradiol patches.",
    path: "/docs/medicine/estrogen/estradiol-patch",
    traditional: true,
    tag: "透皮",
    tagEn: "Transdermal",
  },
  {
    id: "estradiol-injection",
    category: "medicine",
    title: "雌二醇注射剂",
    titleEn: "Estradiol injections",
    summary: "雌二醇注射剂型、给药背景与相关安全资料。",
    summaryEn:
      "Injection formulations, administration background, and related safety information.",
    path: "/docs/medicine/estrogen/injection/estrogen-injection",
    traditional: false,
    tag: "注射",
    tagEn: "Injection",
  },
  {
    id: "antiandrogen",
    category: "medicine",
    title: "抗雄激素药物",
    titleEn: "Antiandrogens",
    summary: "抗雄激素药物的公开专题索引。",
    summaryEn: "The public MTF Wiki index for antiandrogen medication topics.",
    path: "/docs/medicine/antiandrogen",
    traditional: false,
    tag: "专题",
    tagEn: "Collection",
  },
  {
    id: "cyproterone",
    category: "medicine",
    title: "醋酸环丙孕酮",
    titleEn: "Cyproterone acetate",
    summary: "醋酸环丙孕酮的公开药品资料与安全注意事项。",
    summaryEn:
      "Public medication information and safety cautions for cyproterone acetate.",
    path: "/docs/medicine/antiandrogen/cyproterone",
    traditional: true,
    tag: "抗雄激素",
    tagEn: "Antiandrogen",
  },
  {
    id: "bicalutamide",
    category: "medicine",
    title: "比卡鲁胺",
    titleEn: "Bicalutamide",
    summary: "比卡鲁胺的公开药品资料与使用注意事项。",
    summaryEn:
      "Public medication information and cautions for bicalutamide.",
    path: "/docs/medicine/antiandrogen/bicalutamide",
    traditional: true,
    tag: "抗雄激素",
    tagEn: "Antiandrogen",
  },
  {
    id: "spironolactone",
    category: "medicine",
    title: "螺内酯",
    titleEn: "Spironolactone",
    summary: "螺内酯在激素治疗中的公开资料与监测注意事项。",
    summaryEn:
      "Public information and monitoring considerations for spironolactone in hormone therapy.",
    path: "/docs/medicine/antiandrogen/spironolactone",
    traditional: true,
    tag: "抗雄激素",
    tagEn: "Antiandrogen",
  },
  {
    id: "gnrha",
    category: "medicine",
    title: "GnRH 类似物",
    titleEn: "GnRH analogues",
    summary: "GnRH 激动剂与拮抗剂的公开介绍和临床监测背景。",
    summaryEn:
      "Public information and clinical monitoring context for GnRH agonists and antagonists.",
    path: "/docs/medicine/antiandrogen/gnrha",
    traditional: true,
    tag: "性腺轴",
    tagEn: "Gonadal axis",
  },
  {
    id: "hrt-resources",
    category: "resources",
    title: "大陆 HRT 医疗资源",
    titleEn: "Mainland China HRT resources",
    summary: "按医疗资源类型整理的公开就医与处方获取信息。",
    summaryEn:
      "Public care and prescription-access information organized by resource type.",
    path: "/docs/hrt/overview",
    traditional: false,
    tag: "中国大陆",
    tagEn: "Mainland China",
  },
  {
    id: "other-resources",
    category: "resources",
    title: "其他地区资源列表",
    titleEn: "Other regional resources",
    summary: "中国大陆其他可查询的 HRT 医疗资源记录。",
    summaryEn:
      "Additional recorded HRT care resources across mainland China.",
    path: "/docs/hrt/other-chinamainland-hrt-res-list",
    traditional: false,
    tag: "地区",
    tagEn: "Regions",
  },
  {
    id: "shanghai-9",
    category: "resources",
    title: "上海九院 HRT",
    titleEn: "Shanghai Ninth Hospital HRT",
    summary: "公开记录的就诊流程、检查与随访信息。",
    summaryEn:
      "Publicly recorded consultation, assessment, and follow-up information.",
    path: "/docs/hrt/shanghai/sh9-hrt",
    traditional: false,
    tag: "上海",
    tagEn: "Shanghai",
  },
  {
    id: "peking-third",
    category: "resources",
    title: "北医三院 HRT",
    titleEn: "Peking University Third Hospital HRT",
    summary: "公开记录的就诊流程与医疗资源资料。",
    summaryEn:
      "Publicly recorded care pathway and medical resource information.",
    path: "/docs/hrt/puth",
    traditional: false,
    tag: "北京",
    tagEn: "Beijing",
  },
  {
    id: "jinan-first",
    category: "resources",
    title: "广州暨南一院 HRT",
    titleEn: "Jinan University First Hospital HRT",
    summary: "公开记录的就诊与激素治疗医疗资源。",
    summaryEn:
      "Publicly recorded care and hormone-therapy resource information.",
    path: "/docs/hrt/jnuh1",
    traditional: false,
    tag: "广州",
    tagEn: "Guangzhou",
  },
];

export function mtfWikiUrl(topic, language) {
  const locale =
    language === "zh-Hant" && topic.traditional ? "zh-hant" : "zh-cn";
  return `${MTF_WIKI_SOURCE.url}${locale}${topic.path}`;
}
