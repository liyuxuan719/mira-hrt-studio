export const ESTRADIOL_UNIT_FACTOR = 3.6713;
export const TESTOSTERONE_UNIT_FACTOR = 0.03467;

export const CATEGORIES = [
  { id: "all", label: "全部" },
  { id: "estrogen", label: "雌激素" },
  { id: "antiandrogen", label: "抗雄激素" },
  { id: "gnrh", label: "GnRH 激动剂" },
  { id: "progestogen", label: "孕激素" },
];

export const MEDICATIONS = [
  {
    id: "estradiol-valerate-im",
    name: "雌二醇戊酸酯",
    abbreviation: "EV",
    nameEn: "Estradiol valerate",
    category: "estrogen",
    categoryLabel: "雌激素",
    routeLabel: "肌内注射",
    formLabel: "油剂注射液",
    unit: "mg",
    concentration: true,
    modelKey: "EV im",
    modelLabel: "三室药代模型",
    description:
      "雌二醇的酯化前药，注射后在体内水解为雌二醇。吸收与释放速度受载体油、注射部位和个体差异影响。",
    monitoring:
      "化验时记录距上次给药的间隔。不同注射液、载体和注射部位之间不宜直接互换比较。",
    tags: ["注射", "雌二醇", "酯类"],
    sources: ["estrannaise", "dailymed"],
  },
  {
    id: "estradiol-cypionate-im",
    name: "雌二醇环丙酸酯",
    abbreviation: "EC",
    category: "estrogen",
    nameEn: "Estradiol cypionate",
    categoryLabel: "雌激素",
    routeLabel: "肌内注射",
    formLabel: "油剂注射液",
    unit: "mg",
    concentration: true,
    modelKey: "EC im",
    modelLabel: "三室药代模型",
    description:
      "长效雌二醇酯类注射剂之一。公开资料中的药代参数存在明显个体差异，绘制的是人群近似曲线。",
    monitoring:
      "记录产品名称、浓度、注射剂量与日期。曲线不能替代真实雌二醇化验。",
    tags: ["注射", "雌二醇", "长效"],
    sources: ["estrannaise", "dailymed"],
  },
  {
    id: "estradiol-enanthate-im",
    name: "雌二醇庚酸酯",
    abbreviation: "EEn",
    category: "estrogen",
    nameEn: "Estradiol enanthate",
    categoryLabel: "雌激素",
    routeLabel: "肌内注射",
    formLabel: "油剂注射液",
    unit: "mg",
    concentration: true,
    modelKey: "EEn im",
    modelLabel: "三室药代模型",
    description:
      "长效雌二醇酯类注射剂。公开模型可用于探索给药时间与估算浓度之间的关系，但不同地区产品与监管状态不同。",
    monitoring:
      "使用前确认产品真实性、无菌性与当地处方状态。模型不提供用药方案。",
    tags: ["注射", "雌二醇", "长效"],
    sources: ["estrannaise"],
  },
  {
    id: "estradiol-benzoate-im",
    name: "雌二醇苯甲酸酯",
    abbreviation: "EB",
    category: "estrogen",
    nameEn: "Estradiol benzoate",
    categoryLabel: "雌激素",
    routeLabel: "肌内注射",
    formLabel: "油剂注射液",
    unit: "mg",
    concentration: true,
    modelKey: "EB im",
    modelLabel: "三室药代模型",
    description:
      "短效雌二醇酯类注射剂。浓度起伏通常比长酯更明显，公开模型基于有限的人群数据。",
    monitoring:
      "记录给药时间有助于解释峰谷浓度差异；不要仅凭模型曲线改变处方。",
    tags: ["注射", "雌二醇", "短效"],
    sources: ["estrannaise"],
  },
  {
    id: "estradiol-undecylate-im",
    name: "雌二醇十一酸酯",
    abbreviation: "EUn",
    category: "estrogen",
    nameEn: "Estradiol undecylate",
    categoryLabel: "雌激素",
    routeLabel: "肌内注射",
    formLabel: "油剂注射液",
    unit: "mg",
    concentration: true,
    modelKey: "EUn im",
    modelLabel: "三室药代模型",
    description:
      "超长效雌二醇酯。公开资料有限，产品可及性和监管状态因地区差异很大。",
    monitoring:
      "模型不确定性较高。任何给药或停药决策应由熟悉跨性别医疗的临床医生评估。",
    tags: ["注射", "雌二醇", "超长效"],
    sources: ["estrannaise"],
  },
  {
    id: "estradiol-patch-twice-weekly",
    name: "雌二醇透皮贴片",
    abbreviation: "Patch 2×",
    nameEn: "Twice-weekly estradiol patch",
    category: "estrogen",
    categoryLabel: "雌激素",
    routeLabel: "透皮",
    formLabel: "每周更换两次",
    unit: "mcg/day",
    concentration: true,
    modelKey: "patch tw",
    modelLabel: "三室药代模型",
    description:
      "以标称释放速率记录的透皮贴片。实际吸收受皮肤、部位、温度和贴片黏附情况影响。",
    monitoring:
      "首次使用、更换频次或产品品牌变化时，化验可比性可能下降。记录贴片释放速率而非整片总药量。",
    tags: ["透皮", "贴片", "雌二醇"],
    sources: ["estrannaise", "dailymed"],
  },
  {
    id: "estradiol-patch-weekly",
    name: "雌二醇透皮贴片",
    abbreviation: "Patch 1×",
    nameEn: "Weekly estradiol patch",
    category: "estrogen",
    categoryLabel: "雌激素",
    routeLabel: "透皮",
    formLabel: "每周更换一次",
    unit: "mcg/day",
    concentration: true,
    modelKey: "patch ow",
    modelLabel: "三室药代模型",
    description:
      "每周更换的长效透皮贴片。标称释放速率不等同于实际进入循环的药量。",
    monitoring:
      "请按产品标签输入标称释放速率。不要将一周贴片的总药量填入每日速率。",
    tags: ["透皮", "贴片", "雌二醇"],
    sources: ["estrannaise", "dailymed"],
  },
  {
    id: "estradiol-oral",
    name: "雌二醇片",
    abbreviation: "Oral E2",
    nameEn: "Oral estradiol tablets",
    category: "estrogen",
    categoryLabel: "雌激素",
    routeLabel: "口服",
    formLabel: "片剂",
    unit: "mg",
    concentration: true,
    modelKey: "oral E2",
    modelLabel: "口服一室模型",
    description:
      "口服雌二醇经过肝脏首过代谢。公开模型采用 3% 生物利用度和固定吸收速率，个体差异仍然很大。",
    monitoring:
      "模型以 70 kg 人群药代假设估算口服首过后的雌二醇贡献；请以真实化验为准。",
    tags: ["口服", "片剂", "雌二醇"],
    sources: ["transmtf", "dailymed", "endocrine"],
  },
  {
    id: "estradiol-sublingual",
    name: "雌二醇片",
    abbreviation: "SL E2",
    nameEn: "Sublingual / buccal estradiol",
    category: "estrogen",
    categoryLabel: "雌激素",
    routeLabel: "舌下 / 颊黏膜",
    formLabel: "片剂",
    unit: "mg",
    concentration: true,
    modelKey: "sublingual E2",
    modelLabel: "舌下双通路模型",
    description:
      "舌下或颊黏膜使用的雌二醇片。模型同时考虑快速黏膜吸收和少量吞咽后的口服吸收。",
    monitoring:
      "当前采用标准 10 分钟含服假设；实际峰浓度会随含服时间、产品和吞咽量变化。",
    tags: ["舌下", "含服", "雌二醇"],
    sources: ["transmtf", "dailymed"],
  },
  {
    id: "estradiol-gel",
    name: "雌二醇凝胶",
    abbreviation: "Gel E2",
    nameEn: "Estradiol transdermal gel",
    category: "estrogen",
    categoryLabel: "雌激素",
    routeLabel: "透皮",
    formLabel: "凝胶",
    unit: "mg",
    concentration: true,
    modelKey: "gel E2",
    modelLabel: "透皮三室模型",
    description:
      "经皮肤吸收的雌二醇制剂。模型模拟表面残留、皮肤储库和体循环三个环节。",
    monitoring:
      "当前按 0.6% Oestrogel、750 cm² 上臂标准面积估算；产品、浓度和涂抹面积差异会造成明显偏差。",
    tags: ["透皮", "凝胶", "雌二醇"],
    sources: ["transmtf", "dailymed", "endocrine"],
  },
  {
    id: "spironolactone",
    name: "螺内酯",
    abbreviation: "SPL",
    nameEn: "Spironolactone",
    category: "antiandrogen",
    categoryLabel: "抗雄激素",
    routeLabel: "口服",
    formLabel: "片剂",
    unit: "mg",
    concentration: false,
    modelKey: null,
    modelLabel: "仅记录",
    description:
      "醛固酮受体拮抗剂，在跨性别激素治疗中有时作为抗雄激素使用。血药浓度通常不用于常规剂量调整。",
    monitoring:
      "临床监测项目可能包括肾功能、电解质和血压；具体检查计划应由处方医生决定。",
    tags: ["口服", "抗雄", "利尿剂"],
    sources: ["wpath", "endocrine", "dailymed"],
  },
  {
    id: "cyproterone-acetate",
    name: "醋酸环丙孕酮",
    abbreviation: "CPA",
    nameEn: "Cyproterone acetate",
    category: "antiandrogen",
    categoryLabel: "抗雄激素",
    routeLabel: "口服",
    formLabel: "片剂",
    unit: "mg",
    concentration: false,
    modelKey: null,
    modelLabel: "仅记录",
    description:
      "孕激素类抗雄药物，可及性和监管状态因国家或地区而异。血清药物浓度并非常规剂量调整指标。",
    monitoring:
      "长期使用涉及肝功能、催乳素及脑膜瘤风险等临床评估，应由处方医生负责。",
    tags: ["口服", "抗雄", "孕激素"],
    sources: ["wpath", "dailymed"],
  },
  {
    id: "bicalutamide",
    name: "比卡鲁胺",
    abbreviation: "BICA",
    nameEn: "Bicalutamide",
    category: "antiandrogen",
    categoryLabel: "抗雄激素",
    routeLabel: "口服",
    formLabel: "片剂",
    unit: "mg",
    concentration: false,
    modelKey: null,
    modelLabel: "仅记录",
    description:
      "非甾体雄激素受体拮抗剂。药物水平通常不作为跨性别激素治疗的常规监测项目。",
    monitoring:
      "肝功能等安全性监测应遵循处方医生和当地指南。本应用不提供剂量建议。",
    tags: ["口服", "抗雄", "AR 拮抗剂"],
    sources: ["wpath", "dailymed"],
  },
  {
    id: "leuprolide",
    name: "亮丙瑞林",
    abbreviation: "GnRH",
    nameEn: "Leuprolide",
    category: "gnrh",
    categoryLabel: "GnRH 激动剂",
    routeLabel: "皮下 / 肌内注射",
    formLabel: "缓释制剂",
    unit: "mg",
    concentration: false,
    modelKey: null,
    modelLabel: "仅记录",
    description:
      "GnRH 激动剂，可通过抑制下丘脑-垂体-性腺轴降低性激素。制剂、释放周期和监测流程差异较大。",
    monitoring:
      "不模拟该药本身的血清浓度；请记录实际产品、给药日期和医生安排的化验。",
    tags: ["注射", "GnRH", "激素抑制"],
    sources: ["wpath", "endocrine"],
  },
  {
    id: "triptorelin",
    name: "曲普瑞林",
    abbreviation: "GnRH",
    nameEn: "Triptorelin",
    category: "gnrh",
    categoryLabel: "GnRH 激动剂",
    routeLabel: "肌内 / 皮下注射",
    formLabel: "缓释制剂",
    unit: "mg",
    concentration: false,
    modelKey: null,
    modelLabel: "仅记录",
    description:
      "GnRH 激动剂，主要用于抑制性腺轴。缓释剂型的释放行为取决于具体产品和制剂技术。",
    monitoring:
      "记录产品和给药日期。疗效与安全性评估依赖临床化验，不由模型曲线替代。",
    tags: ["注射", "GnRH", "缓释"],
    sources: ["wpath", "endocrine"],
  },
  {
    id: "micronized-progesterone",
    name: "微粒化黄体酮",
    abbreviation: "P4",
    nameEn: "Micronized progesterone",
    category: "progestogen",
    categoryLabel: "孕激素",
    routeLabel: "口服 / 阴道",
    formLabel: "胶囊",
    unit: "mg",
    concentration: false,
    modelKey: null,
    modelLabel: "仅记录",
    description:
      "微粒化黄体酮制剂。不同给药途径的吸收差异显著；并非所有跨性别激素方案都包括孕激素。",
    monitoring:
      "可按实际处方记录，但本应用不将孕酮纳入当前雌二醇浓度模型。",
    tags: ["口服", "阴道", "孕激素"],
    sources: ["wpath", "dailymed"],
  },
];

export const SOURCES = [
  {
    id: "estrannaise",
    title: "estrannaise.js — Estradiol pharmacokinetics playground",
    publisher: "WHSAH / GitHub",
    url: "https://github.com/WHSAH/estrannaise.js",
    license: "MIT",
    note:
      "本项目采用其公开的三室药代模型结构与点估计参数，用于雌激素酯类注射剂和透皮贴片的外源雌二醇浓度估计。",
  },
  {
    id: "transmtf",
    title: "Transmtf HRT Tracker — Route-specific estradiol PK engine",
    publisher: "Transmtf Team / GitHub",
    url: "https://github.com/TransmtfTeam/Transmtf-HRT-Tracker",
    license: "MIT",
    note:
      "口服、舌下与透皮凝胶的药代结构及公开人群参数改编自该项目，并按本应用的固定 70 kg 人群假设做了简化。",
  },
  {
    id: "endocrine",
    title: "Endocrine Treatment of Gender-Dysphoric / Gender-Incongruent Persons",
    publisher: "Endocrine Society Clinical Practice Guideline, 2017",
    url: "https://doi.org/10.1210/jc.2017-01658",
    license: "版权归原作者与出版方",
    note:
      "用于雌激素监测参考带和睾酮监测上限等一般性背景。应用不复制指南中的处方剂量。",
  },
  {
    id: "wpath",
    title: "Standards of Care for the Health of Transgender and Gender Diverse People, Version 8",
    publisher: "WPATH, 2022",
    url: "https://doi.org/10.1080/26895269.2022.2100644",
    license: "版权归原作者与出版方",
    note: "用于激素治疗监测、用药记录与临床共同决策的背景说明。",
  },
  {
    id: "dailymed",
    title: "DailyMed — Estradiol and related prescribing information",
    publisher: "U.S. National Library of Medicine",
    url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=estradiol",
    license: "公共数据库，具体内容版权归各标签持有方",
    note: "用于药品剂型、给药途径与安全信息索引。应用内不提供产品-specific 剂量建议。",
  },
  {
    id: "ucsf",
    title: "Guidelines for the Primary and Gender-Affirming Care of Transgender and Gender Nonbinary People",
    publisher: "UCSF Transgender Care",
    url: "https://transcare.ucsf.edu/guidelines",
    license: "版权归原作者",
    note: "用于临床监测和跨性别医疗背景的补充参考。",
  },
];

export const REFERENCE_RANGES = {
  estradiol: {
    low: 100,
    high: 200,
    unit: "pg/mL",
    label: "文献常见监测参考带",
    note:
      "参考带来自公开指南讨论，并非所有个体、给药途径或实验室都适用，也不是处方目标。",
  },
  testosterone: {
    high: 50,
    unit: "ng/dL",
    label: "常见监测上限参考",
    note: "仅作记录提示，实际目标与检测时点应由临床医生解释。",
  },
};

export const MEDICATION_LOOKUP = new Map(
  MEDICATIONS.map((medication) => [medication.id, medication]),
);

export function getMedication(id) {
  return MEDICATION_LOOKUP.get(id) ?? null;
}

export function getSource(id) {
  return SOURCES.find((source) => source.id === id) ?? null;
}

export function sourceItemsForMedication(medication) {
  return (medication?.sources ?? [])
    .map((sourceId) => getSource(sourceId))
    .filter(Boolean);
}

export function getCategoryLabel(categoryId) {
  return (
    CATEGORIES.find((category) => category.id === categoryId)?.label ?? categoryId
  );
}
