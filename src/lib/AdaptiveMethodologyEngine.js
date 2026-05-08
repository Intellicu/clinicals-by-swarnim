/**
 * Adaptive Methodology Engine — Foundation Layer
 * Classifies study type from title/intent and maps framework, stats, reporting guidelines.
 */

export const STUDY_TYPES = {
  descriptive: {
    id: "descriptive",
    label: "Descriptive / Clinicopathological Profile",
    shortLabel: "Descriptive",
    color: "bg-blue-100 text-blue-800",
    border: "border-blue-300",
    framework: "PEO",
    reporting: "STROBE",
    stats: ["Frequencies", "Proportions", "Mean ± SD", "Median (IQR)", "Range", "95% CI"],
    workflow: ["Objectives", "Study Setting", "Study Population", "Variables", "Data Collection", "Descriptive Analysis", "Ethics", "Report (STROBE)"],
    question_template: "What is the clinicopathological spectrum/profile of [CONDITION] in [POPULATION] at [SETTING]?",
    objectives_hint: "To describe the clinical, biochemical, histological, and demographic characteristics of...",
    pico_equivalent: { P: "Population", E: "Exposure/Condition", O: "Outcome/Characteristics" },
    bias_risks: ["Selection bias", "Information bias", "Recall bias"],
    sample_size_note: "Based on expected prevalence or proportion; use single-proportion formula or convenience sampling with justification.",
    keywords: ["spectrum", "profile", "characteristics", "clinicopathological", "clinico-pathological", "experience", "pattern", "presentation", "features", "manifestations", "describe", "descriptive", "single center"],
  },
  crossSectional: {
    id: "crossSectional",
    label: "Cross-Sectional / Epidemiological",
    shortLabel: "Cross-Sectional",
    color: "bg-teal-100 text-teal-800",
    border: "border-teal-300",
    framework: "PEO",
    reporting: "STROBE",
    stats: ["Prevalence", "Frequencies", "Proportions", "Odds Ratio (cross-sectional)", "Chi-square", "Logistic Regression"],
    workflow: ["Research Question (PEO)", "Study Design", "Objectives", "Sampling Strategy", "Sample Size", "Variables", "Data Collection", "Statistical Analysis", "Ethics", "Report (STROBE)"],
    question_template: "What is the prevalence of [CONDITION/EXPOSURE] in [POPULATION] and what are its associated factors?",
    objectives_hint: "To determine the prevalence of... and to identify factors associated with...",
    pico_equivalent: { P: "Population", E: "Exposure", O: "Outcome (prevalence)" },
    bias_risks: ["Sampling bias", "Temporal ambiguity", "Measurement bias"],
    sample_size_note: "Use single-proportion formula: n = Z²·p·(1-p)/d²; use expected prevalence from literature.",
    keywords: ["prevalence", "epidemiology", "cross-sectional", "burden", "distribution", "survey", "screening", "population-based", "incidence", "frequency"],
  },
  retrospective: {
    id: "retrospective",
    label: "Retrospective Chart Review / Cohort",
    shortLabel: "Retrospective Cohort",
    color: "bg-orange-100 text-orange-800",
    border: "border-orange-300",
    framework: "PECO",
    reporting: "STROBE",
    stats: ["Relative Risk", "Odds Ratio", "Kaplan-Meier", "Log-rank test", "Cox Regression", "Chi-square", "Mann-Whitney U"],
    workflow: ["Research Question (PECO)", "Study Design", "Objectives", "Eligibility Criteria", "Data Source", "Variables", "Sample Size", "Statistical Analysis", "Bias Assessment", "Ethics", "Report (STROBE)"],
    question_template: "Among [POPULATION], what is the association between [EXPOSURE] and [OUTCOME]?",
    objectives_hint: "To retrospectively analyze the outcomes of... in patients with...",
    pico_equivalent: { P: "Population", E: "Exposure", C: "Comparison", O: "Outcome" },
    bias_risks: ["Selection bias", "Information/Recall bias", "Confounding", "Missing data bias"],
    sample_size_note: "Based on expected event rate or outcome proportion in historical data; two-proportion or two-means formula.",
    keywords: ["retrospective", "chart review", "records", "case notes", "medical records", "database", "registry", "historical", "past"],
  },
  prospectiveCohort: {
    id: "prospectiveCohort",
    label: "Prospective Cohort Study",
    shortLabel: "Prospective Cohort",
    color: "bg-indigo-100 text-indigo-800",
    border: "border-indigo-300",
    framework: "PECO",
    reporting: "STROBE",
    stats: ["Incidence Rate", "Relative Risk", "Hazard Ratio", "Kaplan-Meier", "Cox Regression", "GEE", "Mixed models"],
    workflow: ["Research Question (PECO)", "Study Design", "Objectives", "Eligibility Criteria", "Follow-up Plan", "Sample Size", "Variables", "Data Collection", "Statistical Analysis", "Ethics", "Report (STROBE)"],
    question_template: "In [POPULATION], does [EXPOSURE] increase the risk of [OUTCOME] over [TIME PERIOD]?",
    objectives_hint: "To prospectively follow [population] and determine the incidence/risk of [outcome]...",
    pico_equivalent: { P: "Population", E: "Exposure", C: "Unexposed comparison", O: "Outcome (incident)" },
    bias_risks: ["Attrition bias", "Confounding", "Information bias", "Hawthorne effect"],
    sample_size_note: "Based on expected incidence rate, relative risk, and follow-up duration; use two-proportion formula with attrition correction.",
    keywords: ["prospective", "follow-up", "cohort", "longitudinal", "incidence", "over time", "months follow", "year follow", "track", "monitor"],
  },
  rct: {
    id: "rct",
    label: "Randomized Controlled Trial (RCT)",
    shortLabel: "RCT",
    color: "bg-purple-100 text-purple-800",
    border: "border-purple-300",
    framework: "PICO",
    reporting: "CONSORT",
    stats: ["Intention-to-treat analysis", "Per-protocol analysis", "Independent t-test / Mann-Whitney U", "Chi-square / Fisher's", "Kaplan-Meier", "ANCOVA (adjusted for baseline)", "Number Needed to Treat"],
    workflow: ["Research Question (PICO)", "Study Design", "CONSORT Flow", "Objectives & Hypothesis", "Randomization Plan", "Sample Size (Power)", "Eligibility Criteria", "Intervention Protocol", "Outcome Measures", "Blinding Strategy", "Statistical Plan", "Ethics & Registration", "Report (CONSORT)"],
    question_template: "In [POPULATION], does [INTERVENTION] compared to [CONTROL] improve [OUTCOME] at [TIMEPOINT]?",
    objectives_hint: "To compare the efficacy of [intervention] versus [control] in reducing/improving [outcome]...",
    pico_equivalent: { P: "Population", I: "Intervention", C: "Control/Comparator", O: "Outcome", T: "Time" },
    bias_risks: ["Performance bias", "Detection bias", "Attrition bias", "Allocation concealment failure", "Contamination"],
    sample_size_note: "Two-proportion or two-means formula; specify primary outcome effect size from literature; add 15-20% dropout.",
    keywords: ["randomized", "rct", "randomised", "placebo", "versus", "vs", "compared to", "intervention", "drug a vs", "treatment vs", "trial", "controlled trial", "double blind", "single blind"],
  },
  caseControl: {
    id: "caseControl",
    label: "Case-Control Study",
    shortLabel: "Case-Control",
    color: "bg-amber-100 text-amber-800",
    border: "border-amber-300",
    framework: "PECO",
    reporting: "STROBE",
    stats: ["Odds Ratio", "Matched OR (McNemar)", "Logistic Regression", "Chi-square", "Fisher's Exact", "Conditional logistic regression"],
    workflow: ["Research Question (PECO)", "Case & Control Definition", "Objectives", "Matching Strategy", "Sample Size (OR-based)", "Eligibility Criteria", "Exposure Assessment", "Variables", "Statistical Analysis", "Bias Assessment", "Ethics", "Report (STROBE)"],
    question_template: "Are [CASES with disease] more likely than [CONTROLS without disease] to have been exposed to [RISK FACTOR]?",
    objectives_hint: "To identify risk factors for [outcome] by comparing cases with [condition] to matched controls...",
    pico_equivalent: { P: "Population", E: "Risk factor/exposure", C: "Controls (without disease)", O: "Disease outcome (case vs control)" },
    bias_risks: ["Selection bias (control selection)", "Recall bias", "Confounding", "Observer bias"],
    sample_size_note: "OR-based formula: specify expected OR, control:case ratio, and exposure prevalence in controls.",
    keywords: ["case control", "case-control", "risk factor", "risk factors for", "determinants", "etiology of", "associated factors", "predisposing", "cases and controls"],
  },
  diagnostic: {
    id: "diagnostic",
    label: "Diagnostic Accuracy Study",
    shortLabel: "Diagnostic",
    color: "bg-rose-100 text-rose-800",
    border: "border-rose-300",
    framework: "PIRO",
    reporting: "STARD",
    stats: ["Sensitivity", "Specificity", "PPV", "NPV", "LR+", "LR-", "AUC-ROC", "Youden Index", "Kappa agreement"],
    workflow: ["Research Question (PIRO)", "Index Test", "Reference Standard", "Objectives", "Study Population", "Sample Size (based on sensitivity)", "Data Collection", "Statistical Analysis (STARD)", "Ethics", "Report (STARD)"],
    question_template: "What is the diagnostic accuracy (sensitivity, specificity) of [INDEX TEST] for detecting [CONDITION] compared to [REFERENCE STANDARD] in [POPULATION]?",
    objectives_hint: "To evaluate the sensitivity, specificity, and predictive values of [test] for diagnosing [condition]...",
    pico_equivalent: { P: "Population", I: "Index test", R: "Reference standard", O: "Diagnostic accuracy measures" },
    bias_risks: ["Spectrum bias", "Verification bias", "Incorporation bias", "Observer variability"],
    sample_size_note: "Based on expected sensitivity/specificity, prevalence of disease, and precision desired; use Wilson CI formula.",
    keywords: ["diagnostic", "sensitivity", "specificity", "accuracy", "roc", "auc", "test performance", "gold standard", "index test", "biomarker", "cutoff", "predictive value", "screening test"],
  },
  prognostic: {
    id: "prognostic",
    label: "Prognostic Study",
    shortLabel: "Prognostic",
    color: "bg-slate-100 text-slate-800",
    border: "border-slate-300",
    framework: "PROGRESS",
    reporting: "TRIPOD",
    stats: ["Logistic Regression", "Cox Proportional Hazards", "Kaplan-Meier", "Log-rank", "C-statistic", "Calibration plot", "Bootstrap validation"],
    workflow: ["Research Question (PROGRESS)", "Outcome Definition", "Predictor Variables", "Sample Size (events)", "Eligibility Criteria", "Data Collection", "Missing Data Plan", "Model Development", "Validation Strategy", "Ethics", "Report (TRIPOD)"],
    question_template: "What factors predict [OUTCOME] in [POPULATION] over [TIME PERIOD]?",
    objectives_hint: "To identify independent predictors of [outcome] and develop a prognostic model for...",
    pico_equivalent: { P: "Population", R: "Prognostic factors", O: "Outcome", G: "Group stratification" },
    bias_risks: ["Overfitting", "Optimism bias", "Selection bias", "Missing data", "Attrition"],
    sample_size_note: "Events Per Variable (EPV) ≥10 rule: minimum n = 10 × number of predictors / event rate.",
    keywords: ["prognosis", "predictor", "outcome prediction", "risk score", "risk model", "prognostic", "predict", "survival", "mortality risk", "progression", "renal survival", "graft survival"],
  },
  qualitative: {
    id: "qualitative",
    label: "Qualitative Study",
    shortLabel: "Qualitative",
    color: "bg-green-100 text-green-800",
    border: "border-green-300",
    framework: "SPIDER",
    reporting: "COREQ / SRQR",
    stats: ["Thematic Analysis", "Content Analysis", "Framework Analysis", "Grounded Theory", "Saturation assessment"],
    workflow: ["Research Question (SPIDER)", "Methodology Choice", "Sampling Strategy (Purposive)", "Data Collection Method", "Interview Guide", "Saturation Plan", "Analysis Framework", "Trustworthiness", "Ethics (ASSENT)", "Report (COREQ)"],
    question_template: "What are the experiences/perceptions of [SAMPLE] regarding [PHENOMENON] in [CONTEXT]?",
    objectives_hint: "To explore the lived experiences/perceptions of [population] regarding [phenomenon]...",
    pico_equivalent: { S: "Sample", P: "Phenomenon", I: "Design (interviews/FGD)", D: "Evaluation", R: "Research type" },
    bias_risks: ["Researcher bias", "Reactivity bias", "Reporting bias", "Transferability concerns"],
    sample_size_note: "Purposive sampling until theoretical saturation; typically 8-20 participants for interviews, 3-6 FGDs.",
    keywords: ["qualitative", "experience", "perception", "perspective", "lived", "thematic", "phenomenolog", "grounded theory", "interview", "focus group", "explore", "understanding", "narrative"],
  },
  systematicReview: {
    id: "systematicReview",
    label: "Systematic Review / Meta-Analysis",
    shortLabel: "Systematic Review",
    color: "bg-violet-100 text-violet-800",
    border: "border-violet-300",
    framework: "PRISMA",
    reporting: "PRISMA 2020",
    stats: ["Pooled proportion/OR/RR", "Heterogeneity (I², Cochran Q)", "Forest plot", "Funnel plot", "Egger's test", "Subgroup analysis", "Sensitivity analysis", "Meta-regression"],
    workflow: ["Research Question (PICO for SR)", "PROSPERO Registration", "Eligibility Criteria (PICOS)", "Search Strategy (MEDLINE, EMBASE, Cochrane)", "Study Selection (PRISMA flow)", "Data Extraction Form", "Risk of Bias (Cochrane RoB / NOS)", "Meta-analysis Plan", "Heterogeneity Plan", "Report (PRISMA 2020)"],
    question_template: "What is the pooled evidence on [OUTCOME] with [INTERVENTION/EXPOSURE] in [POPULATION] based on available studies?",
    objectives_hint: "To systematically review and meta-analyze studies on [topic] to determine pooled [outcome]...",
    pico_equivalent: { P: "Population", I: "Intervention/Exposure", C: "Comparator", O: "Outcome", S: "Study types" },
    bias_risks: ["Publication bias", "Selection bias", "Heterogeneity", "Language bias", "Extraction errors"],
    sample_size_note: "No primary sample size calculation; conduct power analysis for meta-analysis if needed (detect I²≥50%).",
    keywords: ["systematic review", "meta-analysis", "meta analysis", "pooled", "literature review", "evidence synthesis", "cochrane", "prisma", "studies on", "review of"],
  },
  registry: {
    id: "registry",
    label: "Registry / Database Study",
    shortLabel: "Registry Study",
    color: "bg-cyan-100 text-cyan-800",
    border: "border-cyan-300",
    framework: "PEO",
    reporting: "STROBE",
    stats: ["Descriptive statistics", "Trend analysis", "Incidence rates", "Survival analysis", "Regression models"],
    workflow: ["Registry Access", "Data Quality Check", "Variable Mapping", "Eligibility Criteria", "Outcome Definition", "Statistical Plan", "Ethics Waiver", "Report (STROBE)"],
    question_template: "Based on [REGISTRY/DATABASE] data, what are the [OUTCOMES/TRENDS] in [POPULATION] over [PERIOD]?",
    objectives_hint: "To analyze real-world data from [registry] to describe outcomes/trends in...",
    pico_equivalent: { P: "Population (registry)", E: "Exposures recorded", O: "Outcomes" },
    bias_risks: ["Missing data", "Coding errors", "Selection into registry", "Lead-time bias"],
    sample_size_note: "No pre-defined sample size — uses all eligible registry records; report completeness statistics.",
    keywords: ["registry", "database", "register", "national database", "hospital database", "real world", "real-world", "administrative data", "ehr data", "electronic records"],
  },
};

// ─── Framework question templates ──────────────────────────────────────────
export const FRAMEWORK_LABELS = {
  PICO: { P: "Population", I: "Intervention", C: "Comparator", O: "Outcome" },
  PECO: { P: "Population", E: "Exposure", C: "Comparator", O: "Outcome" },
  PEO: { P: "Population", E: "Exposure/Condition", O: "Outcome/Characteristics" },
  SPIDER: { S: "Sample", P: "Phenomenon of Interest", I: "Design", D: "Evaluation", E: "Research type" },
  PIRO: { P: "Population", I: "Index test", R: "Reference standard", O: "Outcome" },
  PROGRESS: { P: "Population", R: "Risk factor", O: "Outcome", G: "Group", R2: "Reporting" },
};

// ─── Core Classification Engine ────────────────────────────────────────────
export function classifyStudyType(titleOrText) {
  if (!titleOrText || titleOrText.trim().length < 3) return null;
  const text = titleOrText.toLowerCase();

  const scores = {};
  for (const [typeId, typeData] of Object.entries(STUDY_TYPES)) {
    let score = 0;
    for (const keyword of typeData.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += keyword.split(" ").length > 1 ? 2 : 1; // multi-word phrases score higher
      }
    }
    if (score > 0) scores[typeId] = score;
  }

  if (Object.keys(scores).length === 0) return null;

  const topType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const topScore = scores[topType];

  return {
    detected: STUDY_TYPES[topType],
    confidence: topScore >= 3 ? "high" : topScore === 2 ? "medium" : "low",
    allScores: scores,
    alternatives: Object.entries(scores)
      .filter(([k]) => k !== topType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([k]) => STUDY_TYPES[k]),
  };
}

// ─── Get adaptive stats based on study type ────────────────────────────────
export function getAdaptiveStats(studyTypeId) {
  return STUDY_TYPES[studyTypeId]?.stats || STUDY_TYPES.descriptive.stats;
}

// ─── Get reporting guideline checklist items ───────────────────────────────
export const REPORTING_CHECKLISTS = {
  STROBE: {
    name: "STROBE",
    totalItems: 22,
    sections: [
      { section: "Title & Abstract", items: ["Study design stated in title/abstract", "Informative abstract with study design, setting, participants, results"] },
      { section: "Introduction", items: ["Scientific background and rationale explained", "Specific objectives and hypotheses stated"] },
      { section: "Methods — Design", items: ["Study design presented early in paper", "Key design elements explained"] },
      { section: "Methods — Setting", items: ["Setting, locations, dates described", "Relevant dates (recruitment, exposure, follow-up) given"] },
      { section: "Methods — Participants", items: ["Eligibility criteria stated", "Sources and methods of selection described", "Follow-up method described (for cohort)"] },
      { section: "Methods — Variables", items: ["Outcome, exposure, predictors, confounders defined", "Diagnostic criteria given if applicable"] },
      { section: "Methods — Data Sources", items: ["Measurement method for each variable described", "Comparability of measurements addressed"] },
      { section: "Methods — Bias", items: ["Efforts to address potential sources of bias described"] },
      { section: "Methods — Sample Size", items: ["How sample size was determined explained"] },
      { section: "Methods — Statistics", items: ["Statistical methods described", "Subgroups and interactions addressed", "Missing data handling described"] },
      { section: "Results", items: ["Numbers screened/eligible/included reported", "Reasons for non-participation given", "Descriptive data provided", "Outcome data reported", "Main results with 95% CI", "Unadjusted and adjusted estimates"] },
      { section: "Discussion", items: ["Key results summarized", "Limitations discussed", "Interpretation in context of evidence", "Generalisability discussed"] },
      { section: "Funding", items: ["Funding source and role declared"] },
    ]
  },
  CONSORT: {
    name: "CONSORT",
    totalItems: 25,
    sections: [
      { section: "Title & Abstract", items: ["RCT identified in title", "Structured abstract with design, methods, results, conclusions"] },
      { section: "Introduction", items: ["Scientific background and rationale", "Specific objectives and hypotheses"] },
      { section: "Methods — Participants", items: ["Eligibility criteria stated", "Settings and locations described"] },
      { section: "Methods — Interventions", items: ["Interventions for each group described in sufficient detail to allow replication"] },
      { section: "Methods — Outcomes", items: ["Primary and secondary outcomes pre-specified", "Changes to outcomes after trial commencement explained"] },
      { section: "Methods — Sample Size", items: ["How sample size was determined", "Explanation of interim analyses and stopping rules if applicable"] },
      { section: "Methods — Randomisation", items: ["Method of random sequence generation", "Allocation concealment mechanism", "Who generated sequence, enrolled, assigned"] },
      { section: "Methods — Blinding", items: ["Who was blinded", "Similarity of interventions if blinding used"] },
      { section: "Methods — Statistics", items: ["Statistical methods for primary/secondary outcomes", "Methods for additional analyses (subgroup, adjusted)"] },
      { section: "Results — CONSORT Flow", items: ["CONSORT diagram with numbers at each stage", "Dates of recruitment and follow-up periods"] },
      { section: "Results — Baseline Data", items: ["Baseline demographic and clinical characteristics table"] },
      { section: "Results — Numbers Analysed", items: ["For each group: number analysed and whether per-protocol or ITT"] },
      { section: "Results — Outcomes", items: ["Primary and secondary outcomes for each group", "Estimated effect size with precision (CI)"] },
      { section: "Results — Harms", items: ["All important harms or unintended effects in each group"] },
      { section: "Discussion", items: ["Trial limitations addressed", "Generalisability discussed", "Interpretation consistent with results"] },
      { section: "Other", items: ["Trial registration number and registry", "Protocol availability stated", "Funding and role of funders"] },
    ]
  },
  PRISMA: {
    name: "PRISMA 2020",
    totalItems: 27,
    sections: [
      { section: "Title", items: ["Identify as systematic review (and meta-analysis if applicable)"] },
      { section: "Abstract", items: ["Structured abstract with background, methods, results, discussion, registration"] },
      { section: "Introduction", items: ["Rationale for review", "Explicit objectives and questions"] },
      { section: "Methods — Eligibility", items: ["PICOS eligibility criteria", "Information sources (databases, registers)", "Search strategy (at least one database in full)"] },
      { section: "Methods — Selection", items: ["Study selection process", "Data collection process", "List of data items"] },
      { section: "Methods — Risk of Bias", items: ["Risk of bias assessment for each study", "Methods for risk-of-bias synthesis"] },
      { section: "Methods — Effect measures", items: ["Effect measures used (RR, OR, MD)", "Synthesis methods", "Assessment of heterogeneity", "Reporting bias assessment", "Certainty assessment (GRADE)"] },
      { section: "Results — Study Selection", items: ["PRISMA flow diagram", "Reasons for exclusions"] },
      { section: "Results — Synthesis", items: ["Results of each study presented", "Forest plots provided", "Heterogeneity reported (I², Q)", "Publication bias assessment results"] },
      { section: "Discussion", items: ["Limitations (study and review level)", "Certainty of evidence discussed", "Implications for practice and research"] },
      { section: "Registration", items: ["Registration and protocol (PROSPERO)"] },
    ]
  },
  STARD: {
    name: "STARD",
    totalItems: 30,
    sections: [
      { section: "Title/Abstract", items: ["Identified as diagnostic accuracy study", "Key accuracy measures reported in abstract"] },
      { section: "Introduction", items: ["Scientific background", "Study objectives: estimating diagnostic accuracy or comparing accuracy"] },
      { section: "Methods — Participants", items: ["Study design", "Data collection prospective/retrospective", "Eligibility criteria", "Setting and locations", "Recruitment — consecutive/random/convenience"] },
      { section: "Methods — Test Methods", items: ["Index test described in sufficient detail", "Reference standard described", "Rationale for reference standard choice", "Technical specs and training of staff"] },
      { section: "Methods — Analysis", items: ["Methods for calculating accuracy measures", "How indeterminate results handled", "Sample size calculation"] },
      { section: "Results — Participants", items: ["STARD flow diagram", "Baseline characteristics of participants", "Time interval between tests"] },
      { section: "Results — Test Results", items: ["Cross-tabulation (2×2 table)", "Estimates of diagnostic accuracy with CI", "Variability of accuracy estimates"] },
      { section: "Discussion", items: ["Clinical applicability discussed", "Limitations of study"] },
    ]
  },
  "COREQ / SRQR": {
    name: "COREQ",
    totalItems: 32,
    sections: [
      { section: "Research Team", items: ["Researcher characteristics reported", "Relationship with participants considered"] },
      { section: "Study Design", items: ["Theoretical framework described", "Purposive sampling rationale", "Method of approach to participants"] },
      { section: "Data Collection", items: ["Interview/FGD guide described", "Saturation discussed", "Field notes taken"] },
      { section: "Analysis", items: ["Data analysis method named", "Coding process described", "Member checking performed"] },
    ]
  },
  TRIPOD: {
    name: "TRIPOD",
    totalItems: 22,
    sections: [
      { section: "Title/Abstract", items: ["Study identified as prediction model development/validation", "Model type (diagnostic/prognostic) stated"] },
      { section: "Introduction", items: ["Medical context and rationale", "Objectives"] },
      { section: "Methods", items: ["Study design", "Outcome, predictors, sample size", "Missing data approach", "Model building procedure", "Model performance measures", "Internal validation"] },
      { section: "Results", items: ["Participant characteristics", "Model performance with CI", "Validation results"] },
      { section: "Discussion", items: ["Limitations (model and data)", "Implications for practice"] },
    ]
  },
  "PRISMA 2020": {
    name: "PRISMA 2020",
    totalItems: 27,
    sections: [
      { section: "Title", items: ["Identify as systematic review"] },
      { section: "Abstract", items: ["Structured abstract"] },
      { section: "Introduction", items: ["Rationale", "Objectives"] },
      { section: "Methods", items: ["Eligibility criteria", "Information sources", "Search strategy", "Selection process", "Data collection", "Effect measures", "Synthesis methods", "Certainty assessment"] },
      { section: "Results", items: ["PRISMA flow diagram", "Individual study results", "Synthesis results"] },
      { section: "Discussion", items: ["Limitations", "Implications"] },
      { section: "Registration", items: ["PROSPERO registration"] },
    ]
  },
};

// ─── Suggest next steps based on completed steps ───────────────────────────
export function suggestNextSteps(project, detectedType) {
  const issues = [];
  const completed = [];

  if (project.pico?.population || project.pico?.outcome) completed.push("Research question defined");
  else issues.push({ severity: "error", msg: "Research question not defined", action: "builder" });

  if (project.study_type) completed.push(`Study design: ${project.study_type}`);
  else issues.push({ severity: "warn", msg: "Study design not selected", action: "builder" });

  if ((project.objectives || []).filter(Boolean).length > 0) completed.push("Objectives defined");
  else issues.push({ severity: "warn", msg: "Objectives not defined", action: "builder" });

  if (project.sample_size?.calculated) completed.push(`Sample size calculated: n=${project.sample_size.calculated}`);
  else issues.push({ severity: "warn", msg: "Sample size not calculated", action: "builder" });

  if ((project.eligibility?.inclusion || []).filter(Boolean).length > 0) completed.push("Eligibility criteria set");
  else issues.push({ severity: "warn", msg: "Eligibility criteria not defined", action: "eligibility" });

  if ((project.variables || []).filter(v => v.name).length > 0) completed.push("Variables defined");
  else issues.push({ severity: "warn", msg: "Study variables not listed", action: "builder" });

  if ((project.statistical_tests || []).length > 0) completed.push("Statistical tests selected");
  else issues.push({ severity: "info", msg: "Statistical analysis plan incomplete", action: "analytics" });

  if (project.ethics_status && project.ethics_status !== "Not Started") completed.push(`Ethics: ${project.ethics_status}`);
  else issues.push({ severity: "info", msg: "Ethics clearance not initiated", action: "builder" });

  if (detectedType && project.study_type && detectedType.id !== project.study_type) {
    issues.push({ severity: "info", msg: `Study type mismatch: title suggests "${detectedType.label}" but project set to "${project.study_type}"`, action: "builder" });
  }

  return { completed, issues };
}

// ─── Pediatric Nephrology context enrichment ──────────────────────────────
export const NEPHRO_CONTEXT = {
  guidelines: "KDIGO 2024, IPNA 2023, ISPD 2022, IAP 2023, ESPN guidelines, ISKDC criteria",
  setting: "Tertiary care pediatric nephrology unit, India",
  populations: ["Children 0-18 years", "Neonates with AKI", "Pediatric CKD Stage 1-5", "Nephrotic syndrome (SSNS/SRNS/FRNS)", "Dialysis-dependent ESRD", "Post-transplant pediatric patients"],
  conditions: ["AKI (KDIGO staging)", "CKD (K/DOQI staging)", "Nephrotic Syndrome (ISKDC criteria)", "Glomerulopathies (IgAN, FSGS, MN)", "Hypertension (AAP 2017 criteria)", "RTA types 1-4", "Electrolyte disorders", "UTI/Vesicoureteral Reflux", "CAKUT", "Genetic/Hereditary nephropathies"],
  common_stats_software: "SPSS v26+, R (v4.0+), MedCalc, Stata",
  ethics: "ICMR guidelines, Helsinki Declaration, institutional IEC (ICMR-registered)",
};