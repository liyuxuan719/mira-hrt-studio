export const SUPPORTED_LANGUAGES = [
  {
    id: "zh-Hans",
    label: "简体中文",
    englishLabel: "Chinese (Simplified)",
    short: "简",
    htmlLang: "zh-CN",
  },
  {
    id: "zh-Hant",
    label: "繁體中文",
    englishLabel: "Chinese (Traditional)",
    short: "繁",
    htmlLang: "zh-TW",
  },
  {
    id: "en",
    label: "English",
    englishLabel: "English",
    short: "EN",
    htmlLang: "en",
  },
];

export const ONBOARDING_COPY = {
  "zh-Hans": {
    kicker: "WELCOME TO MIRA",
    progress: ["语言", "边界", "开始"],
    languageTitle: "先选择你阅读界面的语言。",
    languageBody: "之后随时可以从右上角切换。你的记录不会被翻译或上传。",
    languageChoose: "选择语言",
    asideBody: "让用药与化验变得清楚，让决定回到你与临床医生之间。",
    meaning:
      "MIRA 来自西班牙语 mirar，意为“看见”。它提醒你观察趋势，而不是凭感觉猜测。",
    boundaryTitle: "先看清曲线代表什么。",
    boundaryBody: "MIRA 帮你整理记录，但不会替你作医疗判断。",
    estimateLabel: "模型估算",
    estimateCopy: "根据你录入的药物、剂量和时间计算的人群药代曲线。",
    labLabel: "真实化验",
    labCopy: "只有你手动录入的实验室报告数值，才代表真实检测结果。",
    safetyTitle: "不要用估算值自行调整处方。",
    safetyCopy:
      "剂量、停药与补服应由熟悉跨性别医疗的临床医生结合完整病史判断。",
    privacyLabel: "本地优先",
    privacyCopy: "无需账号，不上传用药与化验数据。",
    startTitle: "选择你的起点。",
    startBody: "两者都可以随时切换。演示数据会清晰标注，不会冒充你的真实记录。",
    demoTitle: "载入演示数据",
    demoCopy: "用一组已标记的示例，先体验曲线、化验对照和药品库。",
    blankTitle: "从空白开始",
    blankCopy: "不预置任何剂量或化验，直接记录你实际获得的处方。",
    revisitTitle: "一切都在这里。",
    revisitBody: "你的现有数据不会因重新打开引导而改变。",
    back: "返回",
    next: "继续",
    finish: "进入工作台",
    finishRevisit: "回到工作台",
    close: "关闭引导",
    stepLabel: (step, total) => `第 ${step} 步，共 ${total} 步`,
  },
  "zh-Hant": {
    kicker: "WELCOME TO MIRA",
    progress: ["語言", "邊界", "開始"],
    languageTitle: "先選擇你閱讀介面的語言。",
    languageBody: "之後隨時可以從右上角切換。你的紀錄不會被翻譯或上傳。",
    languageChoose: "選擇語言",
    asideBody: "讓用藥與化驗變得清楚，讓決定回到你與臨床醫生之間。",
    meaning:
      "MIRA 來自西班牙語 mirar，意為「看見」。它提醒你觀察趨勢，而不是憑感覺猜測。",
    boundaryTitle: "先看清曲線代表什麼。",
    boundaryBody: "MIRA 幫你整理紀錄，但不會替你作醫療判斷。",
    estimateLabel: "模型估算",
    estimateCopy: "根據你輸入的藥物、劑量和時間計算的人群藥代曲線。",
    labLabel: "真實化驗",
    labCopy: "只有你手動輸入的實驗室報告數值，才代表真實檢測結果。",
    safetyTitle: "不要用估算值自行調整處方。",
    safetyCopy:
      "劑量、停藥與補服應由熟悉跨性別醫療的臨床醫生結合完整病史判斷。",
    privacyLabel: "本地優先",
    privacyCopy: "無需帳號，不上傳用藥與化驗資料。",
    startTitle: "選擇你的起點。",
    startBody: "兩者都可以隨時切換。演示資料會清楚標註，不會冒充你的真實紀錄。",
    demoTitle: "載入演示資料",
    demoCopy: "用一組已標記的示例，先體驗曲線、化驗對照和藥品庫。",
    blankTitle: "從空白開始",
    blankCopy: "不預置任何劑量或化驗，直接紀錄你實際獲得的處方。",
    revisitTitle: "一切都在這裡。",
    revisitBody: "你的現有資料不會因重新開啟引導而改變。",
    back: "返回",
    next: "繼續",
    finish: "進入工作台",
    finishRevisit: "回到工作台",
    close: "關閉引導",
    stepLabel: (step, total) => `第 ${step} 步，共 ${total} 步`,
  },
  en: {
    kicker: "WELCOME TO MIRA",
    progress: ["Language", "Boundaries", "Start"],
    languageTitle: "Choose the language you want to read.",
    languageBody:
      "You can change this later from the top bar. Your records are never translated or uploaded.",
    languageChoose: "Choose a language",
    asideBody:
      "Make medication and lab data clearer, while keeping every decision between you and your clinician.",
    meaning:
      "MIRA comes from the Spanish mirar, “to look” - a reminder to observe patterns instead of guessing.",
    boundaryTitle: "First, see what the curve really means.",
    boundaryBody:
      "MIRA organizes your records. It does not make medical decisions for you.",
    estimateLabel: "Model estimate",
    estimateCopy:
      "A population pharmacokinetic curve calculated from the medicine, dose, and timing you enter.",
    labLabel: "Real lab result",
    labCopy:
      "Only a laboratory value you enter manually represents an actual measured result.",
    safetyTitle: "Never adjust a prescription from an estimate.",
    safetyCopy:
      "Dose changes, stopping, and missed-dose decisions belong with a qualified clinician who knows your history.",
    privacyLabel: "Local-first",
    privacyCopy:
      "No account required. Medication and lab data are never uploaded.",
    startTitle: "Choose where to begin.",
    startBody:
      "You can switch at any time. Demo entries are clearly labeled and never presented as your real records.",
    demoTitle: "Load demo data",
    demoCopy:
      "Explore the chart, lab comparison, and medication library with clearly marked sample entries.",
    blankTitle: "Start blank",
    blankCopy:
      "Begin with no doses or labs and only record the prescription you actually received.",
    revisitTitle: "Everything is still here.",
    revisitBody:
      "Reopening this guide will not change any of your existing records.",
    back: "Back",
    next: "Continue",
    finish: "Enter workspace",
    finishRevisit: "Back to workspace",
    close: "Close guide",
    stepLabel: (step, total) => `Step ${step} of ${total}`,
  },
};

export const REPORT_COPY = {
  "zh-Hans": {
    title: "临床沟通摘要",
    subtitle: "用药、化验与模型对照",
    generatedAt: "生成时间",
    range: "报告范围",
    source: "数据来源",
    unit: "浓度单位",
    localSource: "本机手动记录",
    summary: "周期摘要",
    medicationCount: "种药品",
    doseCount: "条用药记录",
    labCount: "条真实化验",
    residualCount: "条可对照残差",
    medicationSummary: "期间药品",
    actualDoses: "实际给药记录",
    labs: "真实化验结果",
    residuals: "模型对照残差",
    dateTime: "日期 / 时间",
    medication: "药品",
    dose: "剂量 / 途径",
    notes: "备注",
    labDate: "采血时间",
    measuredE2: "E2",
    testosterone: "睾酮",
    prolactin: "催乳素",
    estimate: "模型估算",
    observedResidual: "观察残差",
    residualPercent: "偏差比例",
    residualDefinition:
      "观察残差 = 同时间点真实化验 E2 − 模型估算值。负值表示化验低于模型估算。",
    noDoses: "所选日期范围内没有用药记录。",
    noLabs: "所选日期范围内没有真实化验。",
    noResiduals: "没有可与模型对照的真实 E2 化验。",
    showingDoses: "显示最近 {shown} 条，共 {total} 条。完整记录可另存为 CSV。",
    showingLabs: "显示最近 {shown} 条，共 {total} 条。",
    safetyTitle: "重要说明",
    safetyBody:
      "本摘要由用户从本机记录手动生成，不是医院病历、处方或实验室报告。模型曲线是公开人群参数的数学估算，观察残差也不等于个体模型误差或临床误差。不得根据本摘要自行开始、停止或调整用药；所有解释与医疗决定应由合格临床医生结合完整病史作出。",
    footer:
      "本页由 MIRA 在用户浏览器本地生成。不得单独用于诊断或处方。",
    page: "第 1 页 / 共 1 页",
    reportNote: "一页摘要仅展示最近记录，完整数据请使用 CSV 或 JSON 导出。",
  },
  "zh-Hant": {
    title: "臨床溝通摘要",
    subtitle: "用藥、化驗與模型對照",
    generatedAt: "生成時間",
    range: "報告範圍",
    source: "資料來源",
    unit: "濃度單位",
    localSource: "本機手動紀錄",
    summary: "週期摘要",
    medicationCount: "種藥品",
    doseCount: "筆用藥紀錄",
    labCount: "筆真實化驗",
    residualCount: "筆可對照殘差",
    medicationSummary: "期間藥品",
    actualDoses: "實際給藥紀錄",
    labs: "真實化驗結果",
    residuals: "模型對照殘差",
    dateTime: "日期 / 時間",
    medication: "藥品",
    dose: "劑量 / 途徑",
    notes: "備註",
    labDate: "採血時間",
    measuredE2: "E2",
    testosterone: "睪固酮",
    prolactin: "泌乳素",
    estimate: "模型估算",
    observedResidual: "觀察殘差",
    residualPercent: "偏差比例",
    residualDefinition:
      "觀察殘差 = 同一時間點真實化驗 E2 − 模型估算值。負值表示化驗低於模型估算。",
    noDoses: "所選日期範圍內沒有用藥紀錄。",
    noLabs: "所選日期範圍內沒有真實化驗。",
    noResiduals: "沒有可與模型對照的真實 E2 化驗。",
    showingDoses: "顯示最近 {shown} 筆，共 {total} 筆。完整紀錄可另存為 CSV。",
    showingLabs: "顯示最近 {shown} 筆，共 {total} 筆。",
    safetyTitle: "重要說明",
    safetyBody:
      "本摘要由使用者從本機紀錄手動生成，不是醫院病歷、處方或實驗室報告。模型曲線是公開人群參數的數學估算，觀察殘差也不等於個體模型誤差或臨床誤差。不得根據本摘要自行開始、停止或調整用藥；所有解釋與醫療決定應由合格臨床醫生結合完整病史作出。",
    footer:
      "本頁由 MIRA 在使用者瀏覽器本地生成。不得單獨用於診斷或處方。",
    page: "第 1 頁 / 共 1 頁",
    reportNote: "一頁摘要僅顯示最近紀錄，完整資料請使用 CSV 或 JSON 匯出。",
  },
  en: {
    title: "Clinical Communication Summary",
    subtitle: "Medication, laboratory, and model comparison",
    generatedAt: "Generated",
    range: "Date range",
    source: "Data source",
    unit: "Concentration unit",
    localSource: "Manually entered locally",
    summary: "Period summary",
    medicationCount: "medications",
    doseCount: "dose entries",
    labCount: "lab results",
    residualCount: "model comparisons",
    medicationSummary: "Medications in period",
    actualDoses: "Actual dose entries",
    labs: "Measured laboratory results",
    residuals: "Observed model residuals",
    dateTime: "Date / time",
    medication: "Medication",
    dose: "Dose / route",
    notes: "Notes",
    labDate: "Sample time",
    measuredE2: "E2",
    testosterone: "Testosterone",
    prolactin: "Prolactin",
    estimate: "Model estimate",
    observedResidual: "Observed residual",
    residualPercent: "Difference",
    residualDefinition:
      "Observed residual = measured E2 at the same timestamp minus the model estimate. A negative value means the lab was below the model.",
    noDoses: "No medication entries in the selected date range.",
    noLabs: "No laboratory results in the selected date range.",
    noResiduals: "No measured E2 results can be compared with the model.",
    showingDoses:
      "Showing the latest {shown} of {total} entries. Export CSV for the full record.",
    showingLabs: "Showing the latest {shown} of {total} results.",
    safetyTitle: "Important information",
    safetyBody:
      "This summary was generated by the user from locally entered data. It is not a hospital record, prescription, or laboratory report. Model curves are mathematical estimates from public population parameters, and observed residuals are not individual model error or clinical error. Do not start, stop, or adjust medication based on this summary. A qualified clinician should interpret it with the full medical history.",
    footer:
      "Generated locally in the user's browser by MIRA. Not for diagnosis or prescribing.",
    page: "Page 1 of 1",
    reportNote:
      "This one-page summary displays recent entries only. Use the CSV or JSON export for the complete dataset.",
  },
};

export function reportCopy(languageId) {
  return REPORT_COPY[languageId] ?? REPORT_COPY["zh-Hans"];
}

const EN_TEXT = {
  "导出化验 CSV": "Export lab CSV",
  "化验 CSV 已导出": "Laboratory CSV exported",
  "跳到主要内容": "Skip to main content",
  总览: "Overview",
  "HRT 指南": "HRT Guide",
  用药记录: "Medication Log",
  化验结果: "Lab Results",
  药品资料: "Medication Library",
  模型与安全: "Model & Safety",
  "MTF WIKI · CURATED GUIDE": "MTF WIKI · CURATED GUIDE",
  "将 MTF Wiki 的公开 HRT 资料整理成可快速浏览的专题索引，完整内容请前往原文阅读。":
    "A quick index of public HRT material from MTF Wiki. Open the source article for the complete text.",
  "打开 MTF Wiki": "Open MTF Wiki",
  "以原文为准，不让导航替代医学判断。":
    "Trust the source article, and never let navigation replace medical judgment.",
  "本栏目是 MIRA 对 MTF Wiki 公开页面的人工整理索引。下文摘要由 MIRA 编写，不复制原站全文；打开专题后，可查看 MTF Wiki 的最新版本与修订记录。":
    "This is a manually curated index of public MTF Wiki pages. The summaries below were written for MIRA rather than copied from the full source. Open a topic to see the latest article and revision history.",
  "部分专题目前仅提供简体中文原文。":
    "Some source articles are currently available in Simplified Chinese only.",
  "来源：Project Trans": "Source: Project Trans",
  "链接核对：": "Links checked: ",
  "GitHub 源仓库": "GitHub repository",
  "指南是阅读材料，不是个体处方。":
    "This guide is reading material, not an individual prescription.",
  "药物选择、剂量调整、停药和检查频率应由熟悉跨性别医疗的临床医生结合病史决定。若出现严重不适，请联系当地急救或医疗机构。":
    "Medication choice, dose changes, stopping treatment, and testing frequency should be decided by a clinician experienced in transgender care with your full history. Seek local emergency care for severe symptoms.",
  "搜索药物、监测或就医资源":
    "Search medications, monitoring, or care resources",
  指南类别: "Guide categories",
  快速开始: "Getting started",
  药物专题: "Medication topics",
  就医资源: "Care resources",
  "没有匹配的指南条目": "No matching guide entries",
  "尝试搜索药物名、检查主题或地区。":
    "Try a medication name, monitoring topic, or region.",
  "先阅读，再记录。": "Read first, then record.",
  "MIRA 只负责整理你实际获得的用药和化验记录，不会从指南自动生成剂量方案。":
    "MIRA only organizes the medication and lab records you enter. It does not generate a dosing plan from this guide.",
  "在 MTF Wiki 阅读完整专题。":
    "Read the full topic on MTF Wiki.",
  "与医生确认实际处方和检查计划。":
    "Confirm the actual prescription and monitoring plan with your clinician.",
  "在 MIRA 记录真实剂量、时间与化验。":
    "Record the actual dose, time, and laboratory result in MIRA.",
  来源与许可证: "Sources and license",
  "MtF.wiki 内容由 Project Trans 及社区贡献者维护，除特别注明外采用 CC BY-SA 4.0。MIRA 的指南索引与摘要已注明来源；引用和改编内容按相同许可证共享。":
    "MtF.wiki content is maintained by Project Trans and community contributors and is generally licensed under CC BY-SA 4.0. MIRA's guide index and summaries retain attribution; quoted or adapted content is shared under the same license.",
  "查看项目与贡献": "View project and contribute",
  "只记录在你的浏览器里": "Only stored in your browser",
  "无需账号，不上传用药与化验数据。":
    "No account. Medication and lab data are never uploaded.",
  "已保存到本机": "Saved locally",
  记录化验: "Log lab",
  记录用药: "Log dose",
  "正在查看演示数据": "Viewing demo data",
  "用于体验曲线和功能，不代表任何用药建议。":
    "For exploring the chart and features. Not a dosing recommendation.",
  重置示例: "Reset demo",
  清空并开始记录: "Clear and start fresh",
  "你的 HRT 记录，清楚一点。": "See your HRT record more clearly.",
  "对照真实化验与外源雌二醇估算，留意变化，而不是猜测。":
    "Compare real labs with modeled exogenous estradiol and notice change instead of guessing.",
  星期二: "Tuesday",
  星期三: "Wednesday",
  星期四: "Thursday",
  星期五: "Friday",
  星期六: "Saturday",
  星期日: "Sunday",
  星期一: "Monday",
  "当前外源 E2 估算": "Current exogenous E2 estimate",
  位于文献参考带: "Inside literature reference band",
  低于文献参考带: "Below literature reference band",
  高于文献参考带: "Above literature reference band",
  等待记录: "Waiting for records",
  "仅为数值比较，不构成调整建议":
    "Numeric comparison only; not a recommendation to adjust",
  "模型估算，仍需以真实化验为准":
    "Model estimate; always verify with a real lab result",
  "当前记录不参与浓度模型": "Current entries are not in the concentration model",
  最近真实化验: "Latest real lab",
  "过去 7 天用药": "Doses in the last 7 days",
  次记录: "entries",
  最近一次: "Latest",
  数据完整性: "Data status",
  演示模式: "Demo mode",
  已有记录: "Records available",
  仅本机: "Local only",
  "未连接任何云端服务": "No cloud service connected",
  雌二醇浓度曲线: "Estradiol concentration curve",
  "外源雌二醇贡献的模型估算，不包含内源分泌与个体代谢差异。":
    "Modeled exogenous estradiol contribution. Endogenous production and individual metabolism are not included.",
  "外源雌二醇贡献的模型估算，不包含内源分泌与个体代谢差异。旧记录缺少剂型参数时采用标准默认值。":
    "Modeled exogenous estradiol contribution. Endogenous production and individual metabolism are not included. Older records without form details use standard defaults.",
  估算曲线: "Estimated curve",
  模型估算: "Model estimate",
  文献常见参考带: "Literature reference band",
  真实化验: "Real lab result",
  雌二醇浓度估算图: "Modeled estradiol concentration chart",
  "还没有可估算的用药记录": "No estimable medication records yet",
  "添加带药代模型的雌二醇药物后，这里会生成曲线。":
    "Add a modeled estradiol medicine to generate a curve.",
  "当前记录仅保存，不生成曲线": "This entry is record-only; no curve is generated",
  "这类药物当前不参与雌二醇浓度模型。抗雄药、GnRH 激动剂和孕激素等仍会保存记录；可估算剂型请查看药品库。":
    "This medication is not included in the estradiol concentration model. Antiandrogen, GnRH agonist, and progestogen entries are still saved as records. View the medication library for estimable formulations.",
  "记录已保存，但不在浓度模型范围":
    "The entry was saved, but it is outside the concentration model",
  "该剂型属于“仅记录”，不会生成曲线。真实化验仍可正常记录并与医生沟通。":
    "This formulation is record-only and does not generate a curve. You can still record real labs and discuss them with your clinician.",
  "查看可估算药品": "View estimable medications",
  "记录已保存；该剂型暂不生成浓度曲线":
    "Entry saved. This formulation does not currently generate a concentration curve.",
  "示例已清除；该剂型仅保存记录，不生成曲线":
    "Demo cleared. This formulation is saved as a record only and does not generate a curve.",
  "当前模型估值约": "Current model estimate is about",
  "模型估算，仍需以真实化验为准":
    "Model estimate; always verify with a real lab result",
  了解模型: "About the model",
  今天的记录: "Today's entries",
  "今天还没有记录": "No entries today",
  "记录实际用药后，时间与剂量会显示在这里。":
    "Record an actual dose to show its time and amount here.",
  最近化验: "Latest lab",
  全部: "All",
  "睾酮 T": "Testosterone T",
  采血日期: "Sample date",
  常用药品: "Your medications",
  药品库: "Library",
  "记录实际使用时间与剂量。这里不会生成或推荐剂量。":
    "Record the dose and time actually used. This app does not generate or recommend a dose.",
  新增记录: "New entry",
  全部类别: "All categories",
  雌激素: "Estrogen",
  抗雄激素: "Antiandrogen",
  "GnRH 激动剂": "GnRH agonist",
  孕激素: "Progestogen",
  "导出 CSV": "Export CSV",
  时间: "Time",
  药品: "Medication",
  剂量: "Dose",
  途径: "Route",
  重复计划: "Repeat schedule",
  备注: "Notes",
  操作: "Actions",
  "尝试更换筛选条件，或添加一条新的用药记录。":
    "Change the filters or add a new medication entry.",
  "没有找到记录": "No entries found",
  "还没有用药记录": "No medication entries yet",
  "没有符合条件的记录": "No entries match these filters",
  "真实化验是判断水平的核心。请同时记录采血时间与末次给药时间。":
    "Real lab results are the primary reference. Record both sample time and the last dose time.",
  "雌二醇 E2": "Estradiol E2",
  "催乳素 PRL": "Prolactin PRL",
  "真实 E2 化验趋势": "Measured E2 trend",
  "仅绘制你手动录入的实验室数值，不做插值预测。":
    "Only lab values you entered are plotted. No values are imputed.",
  "参考带 100–200 pg/mL": "Reference band 100-200 pg/mL",
  "雌二醇真实化验趋势图": "Measured estradiol lab trend chart",
  "还没有化验数据": "No lab data yet",
  "至少录入一条化验，才能绘制真实趋势。":
    "Add at least one lab result to draw a measured trend.",
  全部化验: "All lab results",
  采血时间: "Sample time",
  睾酮: "Testosterone",
  催乳素: "Prolactin",
  "还没有真实化验": "No real lab results yet",
  "真实结果不会被模型估算覆盖。":
    "Measured values are never overwritten by the model.",
  "读化验前先看": "Before interpreting a lab",
  "记录采血时间与末次给药时间。":
    "Record the sample time and the time of the last dose.",
  "不同实验室、单位与检测方法不可直接混用。":
    "Do not directly mix results from different labs, units, or assays.",
  "单次结果不等于整条曲线，趋势更有意义。":
    "A single result is not the whole curve; trends are usually more informative.",
  "参考带不是处方目标，解释与调整交给临床医生。":
    "The reference band is not a prescribing target. Leave interpretation and changes to your clinician.",
  "查看引用与限制": "View references and limits",
  药品资料库: "Medication library",
  药品静物视觉: "Medication still-life visual",
  "用于识别剂型与记录单位，不包含起始、加量或减量建议。":
    "For identifying formulations and record units. It contains no starting, increase, or decrease advice.",
  可估算雌二醇曲线: "Estradiol curve available",
  仅做用药记录: "Record only",
  可估算: "Estimable",
  仅记录: "Record only",
  肌内注射: "Intramuscular injection",
  皮下注射: "Subcutaneous injection",
  "皮下 / 肌内注射": "Subcutaneous / intramuscular injection",
  "肌内 / 皮下注射": "Intramuscular / subcutaneous injection",
  透皮: "Transdermal",
  口服: "Oral",
  "口服 / 阴道": "Oral / vaginal",
  "舌下 / 颊黏膜": "Sublingual / buccal",
  油剂注射液: "Oil-based injection",
  片剂: "Tablet",
  凝胶: "Gel",
  胶囊: "Capsule",
  缓释制剂: "Extended-release formulation",
  三室药代模型: "Three-compartment PK model",
  口服一室模型: "Oral one-compartment model",
  舌下双通路模型: "Sublingual dual-path model",
  透皮三室模型: "Three-compartment transdermal model",
  "雌二醇戊酸酯": "Estradiol valerate",
  "雌二醇环丙酸酯": "Estradiol cypionate",
  "雌二醇庚酸酯": "Estradiol enanthate",
  "雌二醇苯甲酸酯": "Estradiol benzoate",
  "雌二醇十一酸酯": "Estradiol undecylate",
  "雌二醇透皮贴片": "Estradiol transdermal patch",
  "雌二醇片": "Estradiol tablet",
  "雌二醇凝胶": "Estradiol gel",
  螺内酯: "Spironolactone",
  醋酸环丙孕酮: "Cyproterone acetate",
  比卡鲁胺: "Bicalutamide",
  亮丙瑞林: "Leuprorelin",
  曲普瑞林: "Triptorelin",
  微粒化黄体酮: "Micronized progesterone",
  "一项用于识别剂型与记录单位": "For formulation identification and record units",
  "药物资料": "medication information",
  "模型与安全": "Model & Safety",
  临床摘要: "Clinical summary",
  临床沟通摘要: "Clinical communication summary",
  临床沟通单: "Clinician summary",
  "生成一页 A4 报告，在打印窗口选择“另存为 PDF”。":
    "Generate a one-page A4 report, then choose “Save as PDF” in the print dialog.",
  开始日期: "Start date",
  结束日期: "End date",
  报告日期范围: "Report date range",
  "点击导出后会打开系统打印窗口。选择“另存为 PDF / Save as PDF”，纸张建议 A4、纵向、页边距默认。":
    "Export opens the system print dialog. Choose “Save as PDF”, A4 portrait, with default margins.",
  "导出 PDF": "Export PDF",
  "请先清空演示数据，再导出临床摘要":
    "Clear the demo data before exporting a clinical summary.",
  "还没有可导出的真实记录": "There are no real records to export yet.",
  "模型与安全说明": "Model and safety",
  "知道它能做什么，更重要的是知道它不能做什么。":
    "Know what it can do, and more importantly, what it cannot.",
  "这不是血检设备，也不提供处方建议。":
    "This is not a blood-testing device and does not provide prescribing advice.",
  "MIRA 显示的是基于公开人群药代参数的数学估算，不是实际检测结果。它不能用于自行开始、停药、加量、减量、补服或判断是否中毒。任何用药决定都应由熟悉跨性别医疗的合格临床医生作出。":
    "MIRA displays a mathematical estimate based on published population pharmacokinetic parameters, not a measured result. Do not use it to start, stop, increase, reduce, or make up a dose, or to judge toxicity. A qualified clinician experienced in transgender care should make every medication decision.",
  "估算如何生成": "How the estimate is generated",
  "读取你手动录入的剂量、给药时间和可选重复间隔。":
    "Read the dose, administration time, and optional repeat interval that you enter.",
  "对雌激素酯类注射剂与透皮贴片运行三室药代模型。":
    "Run a three-compartment pharmacokinetic model for estradiol ester injections and transdermal patches.",
  "对支持的雌二醇剂型运行相应的一室、双通路或三室药代模型。":
    "Run the appropriate one-compartment, dual-path, or three-compartment model for each supported estradiol formulation.",
  "叠加每次给药的残余贡献，得到外源雌二醇示意曲线。":
    "Add the residual contribution of each dose to produce an exogenous estradiol curve.",
  "将真实化验以独立散点显示，便于观察模型偏差。":
    "Plot measured labs as independent points so model deviations are visible.",
  "为什么会有偏差": "Why estimates can differ",
  "个体吸收、代谢、体重、肝肾功能和 SHBG 均可能不同。":
    "Absorption, metabolism, body weight, liver and kidney function, and SHBG can all differ.",
  "注射部位、针剂载体和贴片黏附会改变实际释放。":
    "Injection site, carrier oil, and patch adhesion can change actual release.",
  "模型点估计不包含内源雌二醇和全部药物相互作用。":
    "The point-estimate model omits endogenous estradiol and all drug interactions.",
  "口服、舌下、凝胶与抗雄药当前不提供浓度估算。":
    "Oral, sublingual, gel, and antiandrogen entries currently have no concentration estimate.",
  "抗雄药、GnRH 激动剂与孕激素不提供雌二醇模型；口服、舌下、凝胶采用固定标准假设。":
    "Antiandrogen, GnRH agonist, and progestogen entries do not have estradiol models; oral, sublingual, and gel estimates rely on fixed standard assumptions.",
  "采样时间错误、单位换算失误会显著影响对照。":
    "Incorrect sample timing or unit conversion can substantially distort a comparison.",
  "公开资料与许可": "Public sources and licenses",
  "只纳入可公开访问的资料，并明确许可证与使用范围。":
    "Only publicly accessible sources with explicit licenses and scope are included.",
  "你的数据，由你带走。": "Your data stays yours.",
  "所有记录保存在当前浏览器的 localStorage 中。导出文件便于备份，也可以随时导入到另一台设备。":
    "All records are stored in this browser's localStorage. Exports let you back up or move data to another device.",
  "导出全部数据": "Export all data",
  "导入备份": "Import backup",
  "清空数据": "Clear data",
  "NEW ENTRY": "NEW ENTRY",
  "记录一次用药": "Log a dose",
  编辑用药记录: "Edit medication entry",
  保存修改: "Save changes",
  "只记录你已经获得的处方或实际使用情况。":
    "Record only a prescription you received or the dose you actually took.",
  关闭: "Close",
  取消: "Cancel",
  保存记录: "Save entry",
  界面语言: "Interface language",
  保存化验: "Save lab",
  "实际剂量": "Actual dose",
  "输入你记录的数字": "Enter the recorded amount",
  "给药时间": "Administration time",
  "重复间隔（天）": "Repeat interval (days)",
  剂型专属信息: "Form-specific details",
  "用于模型或临床记录": "Used for modeling or clinical records",
  "产品浓度（mg/g）": "Product concentration (mg/g)",
  "涂抹面积（cm²）": "Application area (cm²)",
  涂抹部位: "Application site",
  "上臂 / 前臂": "Upper arm / forearm",
  大腿: "Thigh",
  腹部: "Abdomen",
  是否清洗: "Washing",
  "数小时后清洗涂抹部位": "Wash the application site after several hours",
  清洗时间: "Wash time",
  小时后: "hours later",
  "当前模型会使用浓度、面积、部位与清洗时间，但载体假设仍采用 Oestrogel 标准参数。":
    "The model uses concentration, area, site, and wash time, while the vehicle assumptions remain the standard Oestrogel parameters.",
  含服时间: "Hold time",
  "约 2 分钟": "About 2 minutes",
  "约 5 分钟": "About 5 minutes",
  "约 10 分钟": "About 10 minutes",
  "约 15 分钟": "About 15 minutes",
  是否吞咽: "Swallowing",
  "含服后吞下唾液": "Swallow saliva after holding",
  "含服时间会改变快速黏膜吸收比例；未吞咽时不再计入吞咽后的口服部分。":
    "Hold time changes the fast mucosal fraction; if not swallowed, the swallowed oral fraction is excluded.",
  "与食物同服": "Food timing",
  "不确定 / 不记录": "Unknown / do not record",
  空腹服用: "Taken on an empty stomach",
  随餐或餐后服用: "Taken with or after food",
  "饮食信息会写入用药记录和临床摘要；当前模型不施加未经校准的饮食修正。":
    "Food timing is saved in the medication log and clinician summary; the current model does not apply an uncalibrated food correction.",
  载体油: "Carrier oil",
  "未知 / 不记录": "Unknown / do not record",
  蓖麻油: "Castor oil",
  芝麻油: "Sesame oil",
  茶籽油: "Tea-seed oil",
  其他载体: "Other carrier",
  注射部位: "Injection site",
  臀肌: "Gluteal muscle",
  臀中肌: "Ventrogluteal muscle",
  股外侧肌: "Vastus lateralis",
  三角肌: "Deltoid muscle",
  皮下: "Subcutaneous",
  "载体油和注射部位会保存在记录中，但当前公开模型未提供经过验证的校正参数。":
    "Carrier oil and injection site are saved in the record, but the current public model has no validated correction parameters for them.",
  "贴片品牌 / 产品": "Patch brand / product",
  "例如：品牌、规格或包装名称": "e.g. brand, strength, or package name",
  "更换周期（天）": "Replacement interval (days)",
  "更换周期用于未来投影；品牌与产品会写入记录和临床摘要，不自动改变吸收模型。":
    "The replacement interval is used for future projection. Brand and product are saved but do not automatically change the absorption model.",
  可选: "Optional",
  "仅用于延伸你已录入计划的未来估算。":
    "Used only to extend a future estimate from the plan you entered.",
  "例如：左臀、换新品牌": "e.g. left glute, new brand",
  "选择药品后，这里会说明该药是否纳入浓度估算。":
    "After selecting a medication, its estimation status will appear here.",
  "选择药品": "Select medication",
  "LAB ENTRY": "LAB ENTRY",
  "记录真实化验": "Log a real lab result",
  "请按实验室报告原样录入，并核对单位。":
    "Enter results from the lab report and double-check the units.",
  "检测备注": "Lab notes",
  "实验室、末次给药距采血时间":
    "Lab name and time since last dose",
  "采血时点会显著影响结果。建议在备注中写明距末次给药的间隔。":
    "Sample timing strongly affects results. Add the interval since the last dose in the note.",
  "已保存": "Saved",
  "查看总览": "View overview",
  "演示数据 · 请勿作为处方": "Demo data - not a prescription",
  "演示化验数据": "Demo lab data",
  "等待用药记录": "Waiting for dose entries",
  "尚未录入化验": "No lab entered",
  "记录从今天开始": "Start by adding a record",
  "尚未录入化验": "No lab entered",
  "今天": "Today",
  "昨天": "Yesterday",
  "单次": "Single",
  "每": "Every",
  "天": "days",
  "所有记录保存在当前浏览器的 localStorage 中。":
    "All records are stored in this browser's localStorage.",
  "药品说明": "Medication overview",
  "记录与监测提示": "Logging and monitoring",
  "浓度估算状态": "Concentration estimate status",
  "公开来源": "Public sources",
  "记录这种药": "Log this medication",
  "此药当前仅做记录，不生成浓度曲线，避免使用不可靠的模型参数。":
    "This medication is record-only and does not produce a curve, avoiding unreliable model parameters.",
  "曲线是人群模型估算，不是实际血药浓度检测。":
    "The curve is a population-model estimate, not a measured blood level.",
  "数据备份已导出": "Data backup exported",
  "用药 CSV 已导出": "Medication CSV exported",
  "无法读取该备份文件": "Could not read this backup file",
  "备份文件过大": "Backup file is too large",
  "备份已导入": "Backup imported",
  "记录已删除": "Entry deleted",
  "化验记录已删除": "Lab result deleted",
  "演示数据已重置": "Demo data reset",
  "已清空，可开始记录自己的数据":
    "Cleared. You can now start recording your own data.",
  "用药记录已保存": "Medication entry saved",
  "用药记录已更新": "Medication entry updated",
  "找不到要编辑的记录，请刷新后重试。":
    "The entry to edit could not be found. Refresh and try again.",
  "示例已清除，个人记录已保存":
    "Demo data cleared. Your personal entry was saved.",
  "真实化验已保存": "Lab result saved",
  "示例已清除，真实化验已保存":
    "Demo data cleared. Your real lab result was saved.",
  "浏览器未允许本地保存": "Browser storage is unavailable",
  "请输入有效剂量，并核对记录单位。":
    "Enter a valid dose and double-check the recorded unit.",
  "请选择一种药品。": "Select a medication.",
  "请选择有效的给药时间。": "Choose a valid administration time.",
  "给药时间不能晚于当前时间。未来用量可通过重复间隔进行投影。":
    "The administration time cannot be in the future. Future doses can be projected with a repeat interval.",
  "重复间隔应为 0.25–90 天，或留空表示单次记录。":
    "Repeat interval must be 0.25-90 days, or blank for a single entry.",
  "贴片更换周期应为 0.5–14 天。":
    "Patch replacement interval must be 0.5-14 days.",
  "请检查凝胶浓度、涂抹面积和清洗时间。":
    "Check the gel concentration, application area, and wash time.",
  "请选择有效的采血时间。": "Choose a valid sample time.",
  "采血时间不能晚于当前时间。": "Sample time cannot be in the future.",
  "至少填写一项真实化验数值。":
    "Enter at least one measured lab value.",
  "化验数值不能为负数。": "Lab values cannot be negative.",
  "该药将使用公开三室模型估算外源雌二醇贡献。估算不是实际化验。":
    "This medication uses a public three-compartment model to estimate exogenous estradiol contribution. The estimate is not a lab measurement.",
  "当前未将该药纳入浓度模型。记录仍会保存在本机，并出现在用药历史中。":
    "This medication is not currently included in the concentration model. Your entry is still stored locally and appears in the medication history.",
  "初始化图表": "Initialize chart",
  "没有任何云端服务": "No cloud service",
  "今日用药": "Today's doses",
  "最近一次给药": "Latest dose",
  "下一次计划": "Next scheduled",
  "数值仅供参考": "For reference only",
  "只有真实化验能验证模型": "Only real labs can verify the model",
  "打开完整对照表": "Open full reference table",
  "打开导航菜单": "Open navigation",
  "打开语言与引导": "Open language and guide",
  "删除这条化验记录": "Delete this lab result",
  主导航: "Main navigation",
  "MIRA 首页": "MIRA home",
  功能导航: "Feature navigation",
  关键指标: "Key metrics",
  浓度单位: "Concentration unit",
  图表时间范围: "Chart date range",
  "搜索药品或备注": "Search medication or notes",
  "按药品类别筛选": "Filter by medication category",
  全部用药记录: "All medication entries",
  化验记录列表: "Lab result list",
  "搜索中英文名、缩写或标签":
    "Search Chinese or English name, abbreviation, or tag",
  药品类别筛选: "Medication category filter",
  移动端导航: "Mobile navigation",
  雌二醇单位: "Estradiol unit",
  睾酮单位: "Testosterone unit",
  关闭引导: "Close guide",
  "跳到主要内容": "Skip to main content",
  "主内容": "Main content",
  "记录采血": "Record lab",
  "记录用药记录": "Add dose entry",
  "添加用药记录": "Add medication entry",
  "采血时间与末次给药时间": "Sample time and last dose time",
  "隐私": "Privacy",
  "本地计算": "Local calculation",
  "返回顶部": "Back to top",
  "非诊断工具": "Non-diagnostic",
  "历史窗口": "History window",
  "未来 7 天投影": "7-day forecast",
  "仅展示真实录入": "Measured values only",
  "使用本地数据": "Uses local data",
  "记录药品": "Medication entry",
  "分类": "Category",
  "剂型": "Form",
  "单位": "Unit",
  "暂无化验": "No lab yet",
  "数据仅保存在本机": "Data stays on this device",
  "药物库": "Library",
  "测量记录": "Record",
  "每 7 天": "Every 7 days",
  "许可 / 状态": "License / status",
  "模型说明": "Model notes",
  "处方目标": "prescribing target",
  "当前未将该药纳入浓度模型": "not included in the concentration model",
  "记录单位：mg": "Record unit: mg",
  "记录单位：mcg/day": "Record unit: mcg/day",
  用药: "Meds",
  化验: "Labs",
  药品: "Medication",
  安全: "Safety",
  每周更换两次: "Twice weekly",
  每周更换一次: "Once weekly",
  "添加带药代模型的雌二醇药物后，这里会显示估算范围与未来趋势。":
    "Add a modeled estradiol medicine to display an estimated range and future trend.",
  "真实化验会独立显示，不会被模型曲线覆盖。":
    "Real lab results are shown independently and are never overwritten by the model.",
  "还没有常用药品": "No regular medications yet",
  "保存用药记录后，会在这里形成你的常用清单。":
    "Saved medication entries will form your regular list here.",
  "没有匹配的药品": "No matching medications",
  "试试英文名、缩写或更短的搜索词。":
    "Try an English name, abbreviation, or shorter search term.",
  "药品库不是完整处方集，也不代表任何药物在所有地区均已获批。规格、适应证与监管状态请以当地产品标签和医生意见为准。":
    "This library is not a complete formulary and does not imply that every medicine is approved in every region. Check the local product label and your clinician for formulations, indications, and regulatory status.",
  "暂无额外链接": "No additional links",
  每周更换两次: "Twice weekly",
  每周更换一次: "Once weekly",
  未知药品: "Unknown medication",
  "用药记录": "Medication entry",
  "MIRA 来自西班牙语 mirar，意为“看见”。":
    "MIRA comes from the Spanish mirar, meaning “to look.”",
  "让用药与化验变得清楚，让决定回到你与临床医生之间。":
    "Make medication and lab data clearer, while keeping decisions between you and your clinician.",
  返回: "Back",
  继续: "Continue",
  "确定删除这条化验记录吗？此操作无法撤销。":
    "Delete this lab result? This cannot be undone.",
  "导入会替换当前浏览器中的全部用药与化验记录。确定继续吗？":
    "Importing will replace all medication and lab records in this browser. Continue?",
  "确定清空所有本机用药与化验记录吗？建议先导出备份。此操作无法撤销。":
    "Clear all local medication and lab records? Export a backup first. This cannot be undone.",
  "可用于探索给药时间与估算浓度之间的关系，但不同地区产品与监管状态不同。":
    "It can explore the relationship between dosing time and estimated concentration, but products and regulatory status vary by region.",
  "当前模型估值约 167.1 pg/mL。模型估算，仍需以真实化验为准。":
    "Current model estimate is about 167.1 pg/mL. Model estimate; always verify with a real lab.",
  "添加带药代模型的雌二醇药物后，这里会生成曲线。":
    "Add a modeled estradiol medicine to generate a curve.",
  "如果使用下载的压缩包": "If using the downloaded archive",
  "雌二醇的酯化前药，注射后在体内水解为雌二醇。吸收与释放速度受载体油、注射部位和个体差异影响。":
    "An ester prodrug of estradiol that is hydrolyzed after injection. Absorption and release vary with the carrier oil, injection site, and individual factors.",
  "化验时记录距上次给药的间隔。不同注射液、载体和注射部位之间不宜直接互换比较。":
    "Record the interval since the previous dose when getting labs. Different injection products, carriers, and sites should not be compared as if interchangeable.",
  "长效雌二醇酯类注射剂之一。公开资料中的药代参数存在明显个体差异，绘制的是人群近似曲线。":
    "A long-acting estradiol ester injection. Published pharmacokinetic parameters vary substantially between individuals; the chart is a population approximation.",
  "记录产品名称、浓度、注射剂量与日期。曲线不能替代真实雌二醇化验。":
    "Record the product name, concentration, injected dose, and date. The curve cannot replace a measured estradiol level.",
  "长效雌二醇酯类注射剂。公开模型可用于探索给药时间与估算浓度之间的关系，但不同地区产品与监管状态不同。":
    "A long-acting estradiol ester injection. The public model can explore timing versus estimated concentration, but products and regulatory status vary by region.",
  "使用前确认产品真实性、无菌性与当地处方状态。模型不提供用药方案。":
    "Confirm product authenticity, sterility, and local prescription status before use. The model does not provide a treatment regimen.",
  "短效雌二醇酯类注射剂。浓度起伏通常比长酯更明显，公开模型基于有限的人群数据。":
    "A shorter-acting estradiol ester injection. Levels usually fluctuate more than with longer esters, and the public model uses limited population data.",
  "记录给药时间有助于解释峰谷浓度差异；不要仅凭模型曲线改变处方。":
    "Accurate dose timing helps explain peak and trough differences. Never change a prescription based only on the model curve.",
  "超长效雌二醇酯。公开资料有限，产品可及性和监管状态因地区差异很大。":
    "An ultra-long-acting estradiol ester. Public data are limited, and product availability and regulation vary greatly by region.",
  "模型不确定性较高。任何给药或停药决策应由熟悉跨性别医疗的临床医生评估。":
    "Model uncertainty is high. A clinician experienced in transgender care should assess any decision to start or stop treatment.",
  "以标称释放速率记录的透皮贴片。实际吸收受皮肤、部位、温度和贴片黏附情况影响。":
    "A transdermal patch recorded by nominal release rate. Actual absorption varies with skin, application site, temperature, and adhesion.",
  "首次使用、更换频次或产品品牌变化时，化验可比性可能下降。记录贴片释放速率而非整片总药量。":
    "Comparability may decrease with first use, a change in replacement frequency, or a brand change. Record the patch release rate, not the total drug in the whole patch.",
  "每周更换的长效透皮贴片。标称释放速率不等同于实际进入循环的药量。":
    "A long-acting weekly transdermal patch. The nominal release rate is not the same as the amount that actually reaches circulation.",
  "请按产品标签输入标称释放速率。不要将一周贴片的总药量填入每日速率。":
    "Enter the nominal release rate from the product label. Do not enter the total weekly drug amount as a daily rate.",
  "口服雌二醇经过肝脏首过代谢，个体间生物利用度差异较大。本应用暂不提供口服吸收曲线。":
    "Oral estradiol undergoes hepatic first-pass metabolism, with wide individual differences in bioavailability. This app does not provide an oral absorption curve.",
  "口服雌二醇经过肝脏首过代谢。公开模型采用 3% 生物利用度和固定吸收速率，个体差异仍然很大。":
    "Oral estradiol undergoes hepatic first-pass metabolism. The public model uses 3% bioavailability and a fixed absorption rate; individual variation remains substantial.",
  "可按实际处方记录剂量和时间；真实雌二醇水平请以化验结果为准。":
    "Record the prescribed dose and time. Use a real laboratory result for measured estradiol.",
  "模型以 70 kg 人群药代假设估算口服首过后的雌二醇贡献；请以真实化验为准。":
    "The model estimates post-first-pass estradiol contribution using a 70 kg population PK assumption. Verify with real lab results.",
  "舌下或颊黏膜使用的雌二醇片。吸收和峰浓度受产品、含服时间和吞咽量影响，当前没有足够一致的公开模型。":
    "An estradiol tablet used sublingually or buccally. Absorption and peak levels vary with the product, hold time, and amount swallowed; there is not yet a sufficiently consistent public model.",
  "舌下或颊黏膜使用的雌二醇片。模型同时考虑快速黏膜吸收和少量吞咽后的口服吸收。":
    "An estradiol tablet used sublingually or buccally. The model includes both rapid mucosal absorption and a smaller swallowed oral fraction.",
  "请在备注中记录实际使用方式。不要将不同含服方法的数据混在一起比较。":
    "Record the actual method in the note. Do not compare data from different administration methods as if equivalent.",
  "当前采用标准 10 分钟含服假设；实际峰浓度会随含服时间、产品和吞咽量变化。":
    "The current model assumes a standard 10-minute hold. Actual peak levels vary with hold time, product, and amount swallowed.",
  "经皮肤吸收的雌二醇制剂。不同产品的浓度、泵数与涂抹面积不可直接互换。":
    "A transdermal estradiol product. Concentration, pump count, and application area are not directly interchangeable between products.",
  "经皮肤吸收的雌二醇制剂。模型模拟表面残留、皮肤储库和体循环三个环节。":
    "A transdermal estradiol product. The model represents surface residue, a skin reservoir, and systemic circulation.",
  "记录产品标示含量或泵数、涂抹部位及采血前末次使用时间。":
    "Record the labeled strength or pump count, application site, and last use before the blood draw.",
  "当前按 0.6% Oestrogel、750 cm² 上臂标准面积估算；产品、浓度和涂抹面积差异会造成明显偏差。":
    "The current estimate assumes 0.6% Oestrogel over a standard 750 cm² arm area. Product, concentration, and application-area differences can cause substantial deviation.",
  "醛固酮受体拮抗剂，在跨性别激素治疗中有时作为抗雄激素使用。血药浓度通常不用于常规剂量调整。":
    "An aldosterone receptor antagonist sometimes used as an antiandrogen in gender-affirming hormone therapy. Serum levels are not typically used for routine dose adjustment.",
  "临床监测项目可能包括肾功能、电解质和血压；具体检查计划应由处方医生决定。":
    "Clinical monitoring may include kidney function, electrolytes, and blood pressure. The prescribing clinician should determine the monitoring plan.",
  "孕激素类抗雄药物，可及性和监管状态因国家或地区而异。血清药物浓度并非常规剂量调整指标。":
    "A progestogenic antiandrogen whose availability and regulation vary by country or region. Serum levels are not a routine dose-adjustment marker.",
  "长期使用涉及肝功能、催乳素及脑膜瘤风险等临床评估，应由处方医生负责。":
    "Long-term use requires clinical assessment of liver function, prolactin, and meningioma risk, which should be managed by the prescriber.",
  "非甾体雄激素受体拮抗剂。药物水平通常不作为跨性别激素治疗的常规监测项目。":
    "A nonsteroidal androgen receptor antagonist. Drug levels are not usually a routine monitoring target in gender-affirming hormone therapy.",
  "肝功能等安全性监测应遵循处方医生和当地指南。本应用不提供剂量建议。":
    "Follow the prescriber and local guidance for liver and other safety monitoring. This app provides no dosing advice.",
  "GnRH 激动剂，可通过抑制下丘脑-垂体-性腺轴降低性激素。制剂、释放周期和监测流程差异较大。":
    "A GnRH agonist that can lower sex hormones by suppressing the hypothalamic-pituitary-gonadal axis. Formulations, release cycles, and monitoring vary widely.",
  "不模拟该药本身的血清浓度；请记录实际产品、给药日期和医生安排的化验。":
    "The drug's own serum concentration is not modeled. Record the actual product, administration date, and labs ordered by your clinician.",
  "GnRH 激动剂，主要用于抑制性腺轴。缓释剂型的释放行为取决于具体产品和制剂技术。":
    "A GnRH agonist used mainly to suppress the gonadal axis. Release behavior depends on the specific product and delivery technology.",
  "记录产品和给药日期。疗效与安全性评估依赖临床化验，不由模型曲线替代。":
    "Record the product and administration date. Efficacy and safety assessment rely on clinical labs, not a model curve.",
  "微粒化黄体酮制剂。不同给药途径的吸收差异显著；并非所有跨性别激素方案都包括孕激素。":
    "A micronized progesterone product. Absorption differs substantially by route, and not every gender-affirming hormone regimen includes a progestogen.",
  "可按实际处方记录，但本应用不将孕酮纳入当前雌二醇浓度模型。":
    "You can record the actual prescription, but progesterone is not included in the current estradiol concentration model.",
  "本项目采用其公开的三室药代模型结构与点估计参数，用于雌激素酯类注射剂和透皮贴片的外源雌二醇浓度估计。":
    "This project adapts its public three-compartment model and point estimates for exogenous estradiol from estradiol ester injections and transdermal patches.",
  "口服、舌下与透皮凝胶的药代结构及公开人群参数改编自该项目，并按本应用的固定 70 kg 人群假设做了简化。":
    "The oral, sublingual, and transdermal gel PK structures and public population parameters were adapted from this project and simplified to MIRA's fixed 70 kg population assumption.",
  "用于雌激素监测参考带和睾酮监测上限等一般性背景。应用不复制指南中的处方剂量。":
    "Used for general context on estradiol monitoring bands and testosterone upper reference limits. The app does not reproduce prescribing doses from the guideline.",
  "用于激素治疗监测、用药记录与临床共同决策的背景说明。":
    "Used for background on hormone monitoring, record keeping, and shared clinical decision-making.",
  "用于药品剂型、给药途径与安全信息索引。应用内不提供产品-specific 剂量建议。":
    "Used to index formulations, routes, and safety information. The app provides no product-specific dosing advice.",
  "用于临床监测和跨性别医疗背景的补充参考。":
    "Used as supplemental reference for clinical monitoring and transgender care.",
  版权归原作者与出版方: "Copyright held by the original authors and publisher",
  "公共数据库，具体内容版权归各标签持有方":
    "Public database; individual label content is copyrighted by its holders",
  版权归原作者: "Copyright held by the original authors",
  "WHSAH / GitHub": "WHSAH / GitHub",
  "Endocrine Society Clinical Practice Guideline, 2017":
    "Endocrine Society Clinical Practice Guideline, 2017",
  "U.S. National Library of Medicine": "U.S. National Library of Medicine",
  "UCSF Transgender Care": "UCSF Transgender Care",
  "模型不清楚": "Model not available",
  "可用。曲线是人群模型估算，不是实际血药浓度检测。":
    "is available. The curve is a population-model estimate, not a measured blood level.",
  "暂无额外链接": "No additional links",
  "尚未录入化验": "No lab entered",
  "记录单位": "Record unit",
};

const EN_PATTERNS = [
  [/^(\d+) 条资料$/, "$1 entries"],
  [/^(\d+) 次记录$/, "$1 entries"],
  [/^每 (.+) 天$/, "Every $1 days"],
  [/^最近一次：(.+)$/, (_, value) => `Latest: ${translateEnglish(value)}`],
  [/^参考带 (\d+)–(\d+) (pg\/mL|pmol\/L)$/, "Reference band $1-$2 $3"],
  [/^今天 (.+)$/, "Today $1"],
  [/^昨天 (.+)$/, "Yesterday $1"],
  [/^记录单位：(.+)$/, "Record unit: $1"],
  [/^许可 \/ 状态：(.+)$/, (_, value) => `License / status: ${translateEnglish(value)}`],
  [/^当前模型估值约 (.+)。模型估算，仍需以真实化验为准。$/,
    "Current model estimate is about $1. Model estimate; always verify with a real lab."],
  [/^当前模型估值约 (.+)。$/,
    "Current model estimate is about $1."],
  [/^确定删除这条 (.+) 记录吗？此操作无法撤销。$/, 
    (_, value) => `Delete this ${translateEnglish(value)} entry? This cannot be undone.`],
  [/^请检查测量数值$/, "Check the entered values"],
  [/^第 (\d+) 步，共 (\d+) 步$/, "Step $1 of $2"],
  [/^(.+) · (.+)（(.+)）$/, (_, name, abbreviation, route) => {
    return `${translateEnglish(name)} · ${abbreviation} (${translateEnglish(route)})`;
  }],
  [/^(.+) \/ (.+) \/ (.+)$/, (_, first, second, third) => {
    return `${translateEnglish(first)} / ${translateEnglish(second)} / ${translateEnglish(third)}`;
  }],
  [/^(.+) · (.+)$/, (_, first, second) => {
    return `${translateEnglish(first)} · ${translateEnglish(second)}`;
  }],
  [/^(.+)可用。曲线是人群模型估算，不是实际血药浓度检测。$/, (_, model) => {
    return `${translateEnglish(model)} is available. The curve is a population-model estimate, not a measured blood level.`;
  }],
  [/^真实化验：(.+)$/, "Measured result: $1"],
  [/^模型估算：(.+)$/, "Model estimate: $1"],
  [/^真实雌二醇：(.+)$/, "Measured estradiol: $1"],
  [/^睾酮：(.+)$/, "Testosterone: $1"],
  [/^删除 (.+) 记录$/, (_, value) => `Delete ${translateEnglish(value)} record`],
  [/^编辑 (.+) 记录$/, (_, value) => `Edit ${translateEnglish(value)} entry`],
  [/^查看 (.+) 资料$/, (_, value) => `View ${translateEnglish(value)} information`],
  [/^打开来源：(.+)$/, (_, value) => `Open source: ${value}`],
];

export function languageDefinition(languageId) {
  return (
    SUPPORTED_LANGUAGES.find((language) => language.id === languageId) ??
    SUPPORTED_LANGUAGES[0]
  );
}

export function translateEnglish(source) {
  const normalized = String(source).trim();
  if (!normalized) {
    return source;
  }
  if (EN_TEXT[normalized]) {
    return EN_TEXT[normalized];
  }
  for (const [pattern, replacement] of EN_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      return normalized.replace(pattern, replacement);
    }
  }
  return source;
}

export function onboardingCopy(languageId) {
  return ONBOARDING_COPY[languageId] ?? ONBOARDING_COPY["zh-Hans"];
}
