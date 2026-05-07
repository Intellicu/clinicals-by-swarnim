import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  BookOpen, ChevronDown, Search, GraduationCap, BarChart3,
  AlertTriangle, Brain, FileText, Download, Lightbulb, Target
} from "lucide-react";

const KNOWLEDGE = [
  {
    level: "Beginner",
    color: "bg-green-100 text-green-700",
    icon: GraduationCap,
    topics: [
      {
        title: "Study Designs: An Overview",
        category: "Designs",
        content: `**What is a Study Design?**
Study design is the blueprint of a clinical study — it determines how data is collected, how groups are compared, and what conclusions can be drawn.

**Hierarchy of Evidence (Oxford Levels):**
1. Systematic Review / Meta-analysis (highest)
2. RCT
3. Cohort Study
4. Case-Control Study
5. Cross-Sectional Study
6. Case Series / Reports
7. Expert Opinion (lowest)

**Quick Guide:**
- Want to prove causation? → RCT
- Want to measure incidence? → Cohort
- Rare disease with known outcome? → Case-Control
- Prevalence/correlations? → Cross-Sectional
- Describing cases? → Case Series

**Pitfalls:** Choosing design based on data availability rather than research question — always start with the question!

**Viva Points:**
- "Which is the gold standard for causation?" → RCT
- "Which study design is best for rare diseases?" → Case-Control
- "What can cross-sectional studies NOT establish?" → Temporality/causation`,
        keywords: ["RCT", "cohort", "case-control", "cross-sectional", "evidence hierarchy"]
      },
      {
        title: "PICO Framework: Building Your Research Question",
        category: "Research Question",
        content: `**Why PICO?**
PICO structures vague ideas into precise, answerable research questions. Required for systematic reviews, RCTs, and protocol submissions.

**Components:**
- **P** — Population: Who are your participants? (age, condition, setting)
- **I** — Intervention: What are you doing / exposing?
- **C** — Comparison: What are you comparing against?
- **O** — Outcome: What are you measuring?

**Example (Pediatric Nephrology):**
P: Children 1-16 years with FRNS (Frequently Relapsing Nephrotic Syndrome)
I: Levamisole 2.5 mg/kg on alternate days
C: Prednisolone alone
O: Relapse rate at 12 months

**Structured Question:** "In children aged 1-16 with FRNS, does the addition of levamisole to standard prednisolone therapy reduce the relapse rate at 12 months compared to prednisolone alone?"

**Pitfalls:** Making outcome too vague ("better outcome") vs. specific ("relapse-free survival at 12 months").

**Viva Points:**
- PICO helps define inclusion/exclusion criteria and statistical tests
- O must be MEASURABLE and defined a priori`,
        keywords: ["PICO", "research question", "FINER criteria", "outcome"]
      },
      {
        title: "Sample Size: Why It Matters",
        category: "Sample Size",
        content: `**Why Calculate Sample Size?**
Too small → miss true effects (Type II error / false negative)
Too large → waste resources, unethical exposure

**Key Concepts:**
- **Alpha (α)**: Probability of false positive (usually 0.05 = 5%)
- **Power (1-β)**: Probability of detecting true effect (usually 80-90%)
- **Effect size**: Minimum clinically important difference
- **Variance**: Spread of your outcome variable

**Formula (Two Proportions):**
n = (Zα/2 √[2p̄(1-p̄)] + Zβ √[p1(1-p1)+p2(1-p2)])² / (p1-p2)²

**Practical Rule:** Always add 10-20% for dropout/loss to follow-up

**Example:** If 60% relapse with treatment A vs 35% with treatment B, α=0.05, power=80% → n≈65 per group → add 15% → 75 per group

**Viva Points:**
- "What happens if your sample is underpowered?" → Cannot reject H0 even if true effect exists
- "What is Type I vs Type II error?" → α vs β
- "What software for sample size?" → G*Power, OpenEpi, Stata, R (pwr package)`,
        keywords: ["alpha", "power", "Type I error", "Type II error", "G*Power"]
      }
    ]
  },
  {
    level: "Intermediate",
    color: "bg-blue-100 text-blue-700",
    icon: Brain,
    topics: [
      {
        title: "Bias and Confounding in Clinical Research",
        category: "Bias",
        content: `**Types of Bias:**

**Selection Bias:**
- Systematic difference between those who enter study vs. those who don't
- Examples: Berkson's bias (hospital-based), healthy worker effect, survivor bias
- Control: Random sampling, consecutive enrollment

**Information Bias:**
- Systematic error in measuring exposure or outcome
- Recall bias: Cases remember exposures better than controls (Case-Control studies)
- Observer bias: Interviewer knows group allocation
- Control: Blinding, standardized data collection tools

**Confounding:**
- A third variable associated with both exposure and outcome
- Example: Smoking (confounder) between alcohol (exposure) and lung cancer (outcome)
- Control: Randomization (RCT), restriction, matching, stratification, multivariable analysis

**Pitfall:** "Association ≠ Causation" — always consider confounders!

**Bradford Hill Criteria for Causation:**
Strength, Consistency, Specificity, Temporality (must), Biological gradient, Plausibility, Coherence, Experiment, Analogy

**Viva Points:**
- "What bias cannot be controlled by blinding?" → Selection bias
- "What is the only design that fully controls confounding?" → RCT (randomization)
- "Name a study where confounding is a major limitation?" → All observational studies`,
        keywords: ["selection bias", "recall bias", "confounding", "Bradford Hill", "randomization"]
      },
      {
        title: "Statistical Test Selector: A Practical Guide",
        category: "Statistics",
        content: `**Step 1: What is your outcome variable?**
→ Continuous: Use parametric (if normal) or non-parametric tests
→ Categorical: Use chi-square, Fisher's, etc.
→ Survival/time-to-event: Kaplan-Meier, Log-rank, Cox regression

**Step 2: How many groups?**
→ 2 groups: t-test, Mann-Whitney U, Chi-square
→ ≥3 groups: ANOVA, Kruskal-Wallis

**Step 3: Are groups paired/related?**
→ Independent: Independent t-test, Mann-Whitney
→ Paired/repeated: Paired t-test, Wilcoxon signed-rank

**Step 4: Is data normally distributed?**
→ Check: Shapiro-Wilk test (n<50), histogram, Q-Q plot
→ Normal: Parametric tests
→ Non-normal: Non-parametric equivalents

**Quick Reference Table:**
| Outcome | Groups | Normal? | Test |
|---------|--------|---------|------|
| Continuous | 2 indep | Yes | Independent t-test |
| Continuous | 2 indep | No | Mann-Whitney U |
| Continuous | ≥3 | Yes | ANOVA + post-hoc |
| Categorical | 2 | n≥5 | Chi-square |
| Categorical | 2 | n<5 | Fisher's Exact |
| Survival | Any | N/A | Log-rank + KM |

**Viva Points:**
- "When do you use Fisher's Exact over Chi-Square?" → When expected cell count < 5
- "Non-parametric equivalent of ANOVA?" → Kruskal-Wallis
- "Non-parametric equivalent of paired t-test?" → Wilcoxon signed-rank`,
        keywords: ["t-test", "ANOVA", "chi-square", "Mann-Whitney", "Kaplan-Meier", "normality"]
      },
      {
        title: "PRISMA Methodology for Systematic Reviews",
        category: "Systematic Review",
        content: `**PRISMA 2020 Flow:**
1. Identification: Databases searched (PubMed, Embase, Cochrane, Scopus, grey literature)
2. Screening: Remove duplicates → screen titles/abstracts
3. Eligibility: Full-text review
4. Included: Studies for analysis

**Key Steps:**
1. Register protocol (PROSPERO)
2. Define PICO and eligibility criteria
3. Search strategy (MeSH terms + keywords, Boolean operators: AND/OR/NOT)
4. Duplicate removal (Rayyan, Covidence, Zotero)
5. Data extraction (Excel/REDCap)
6. Quality assessment: RCT → Cochrane RoB2, Observational → Newcastle-Ottawa Scale
7. Statistical pooling (if meta-analysis): Fixed vs Random effects model
8. Heterogeneity: I² statistic (>50% = substantial), Forest plot

**Cochrane Risk of Bias (RoB2) Domains:**
- Randomisation process
- Deviations from intended intervention
- Missing outcome data
- Measurement of outcome
- Selection of reported results

**Key Software:** RevMan, R (meta package), Stata (metan)

**Viva Points:**
- "What is I² and what values indicate heterogeneity?" → <25%=low, 25-50%=moderate, >50%=high
- "Fixed vs Random effects?" → Fixed when studies are homogeneous; Random when heterogeneous
- "What is publication bias?" → Tendency to publish positive results; detected by funnel plot asymmetry`,
        keywords: ["PRISMA", "meta-analysis", "forest plot", "I squared", "PROSPERO", "risk of bias"]
      }
    ]
  },
  {
    level: "Advanced",
    color: "bg-red-100 text-red-700",
    icon: BarChart3,
    topics: [
      {
        title: "Regression Analysis: Linear and Logistic",
        category: "Statistics",
        content: `**Linear Regression:**
- Predicts continuous outcome from one or more predictors
- Y = β0 + β1X1 + β2X2 + ε
- Assumptions: Linearity, normality of residuals, homoscedasticity, independence
- Output: Coefficient (β), 95% CI, R², adjusted R², p-value

**Logistic Regression:**
- Predicts binary outcome (yes/no, event/no event)
- log(p/1-p) = β0 + β1X1 + β2X2
- Output: Odds Ratio (OR), 95% CI, p-value, Hosmer-Lemeshow goodness of fit, ROC curve / AUC

**Multivariable vs Multivariate:**
- Multivariable: 1 outcome, multiple predictors (most clinical research)
- Multivariate: Multiple outcomes simultaneously (MANOVA)

**Variable Selection:**
- Enter all a priori confounders
- Stepwise methods (forward, backward) — controversial, avoid for confirmatory analyses
- LASSO regularization for large variable sets

**Reporting:** Always report unadjusted AND adjusted ORs/β. State reference categories for categorical variables.

**Viva Points:**
- "What does an OR of 2.5 mean?" → Cases are 2.5× more likely to have the exposure than controls
- "How do you check model fit for logistic regression?" → ROC-AUC (discrimination), Hosmer-Lemeshow (calibration)
- "Can you use logistic regression for cohort data?" → Use risk ratio (Poisson with robust SE) instead, as OR overestimates RR when outcome is common (>10%)`,
        keywords: ["logistic regression", "odds ratio", "adjusted", "AUC", "ROC", "multivariable"]
      },
      {
        title: "Survival Analysis: Kaplan-Meier and Cox Regression",
        category: "Statistics",
        content: `**When to Use:** Time-to-event outcomes (relapse, death, hospitalization) with censoring.

**Censoring:** Participant leaves study before event occurs — they contribute time observed without outcome.

**Kaplan-Meier (KM) Curves:**
- Non-parametric method
- Survival probability at each time point
- Compare groups with Log-rank test
- Median survival time + 95% CI
- Report: p-value (log-rank), median survival, number at risk table below curve

**Cox Proportional Hazards Model:**
- Semi-parametric
- Hazard Ratio (HR) analogous to RR
- Adjusts for multiple covariates simultaneously
- Assumption: Proportional hazards (check with Schoenfeld residuals or log-log plot)

**Key Output:**
- HR: If HR=0.65 for treatment → 35% reduction in hazard of event at any time point
- 95% CI: Should not cross 1.0 for significance
- p-value for model and individual variables

**Landmark Analysis:** When randomization occurs after a delay — only include participants surviving to landmark time.

**Competing Risks:** When other events preclude the outcome of interest (e.g., death before relapse) — use Fine-Gray model.

**Viva Points:**
- "What is censoring?" → When participant is lost before event — they contribute observed time
- "What does HR=1 mean?" → No difference in hazard between groups
- "When does KM fail?" → When assumptions of proportional hazards are violated`,
        keywords: ["Kaplan-Meier", "Cox regression", "hazard ratio", "censoring", "log-rank", "survival"]
      },
      {
        title: "Meta-Analysis: Pooling and Heterogeneity",
        category: "Meta-analysis",
        content: `**Steps in Meta-Analysis:**
1. Define research question (PICO)
2. Systematic literature search
3. Data extraction: effect size, sample size, variance per study
4. Assess heterogeneity: I² and Q statistic
5. Choose model: Fixed (I²<25%) or Random effects (I²≥25%)
6. Pool effect size: Weighted mean of individual study effects
7. Sensitivity analysis: Remove one study at a time
8. Subgroup analysis: Pre-specified
9. Publication bias: Funnel plot, Egger's test

**Effect Measures:**
- Binary outcomes: OR, RR, Risk Difference
- Continuous outcomes: Mean Difference (MD) or Standardized MD (SMD/Cohen's d)
- Survival: HR

**Forest Plot Reading:**
- Each row = one study
- Box size = study weight (inversely proportional to variance)
- Horizontal line = 95% CI
- Diamond = pooled estimate
- Vertical line = null effect (OR=1, MD=0)
- If diamond crosses null line → not statistically significant

**GRADE System (Quality of Evidence):**
High (RCT) → Moderate → Low → Very Low
Downgraded by: Risk of bias, inconsistency, indirectness, imprecision, publication bias

**Viva Points:**
- "What is the DerSimonian-Laird method?" → Method for random effects meta-analysis
- "What is a funnel plot?" → Plot of effect size vs. precision; asymmetry suggests publication bias
- "What is GRADE?" → Framework for rating quality of evidence in systematic reviews`,
        keywords: ["meta-analysis", "I squared", "heterogeneity", "forest plot", "GRADE", "random effects"]
      }
    ]
  }
];

const TEMPLATES = [
  { name: "Research Protocol Template", type: "Word (.docx)", icon: FileText, size: "~15KB", desc: "Full protocol with all sections, formatted for IEC submission" },
  { name: "IEC / IRB Consent Form", type: "Word (.docx)", icon: FileText, size: "~8KB", desc: "Standard informed consent template (adult + pediatric versions)" },
  { name: "Grant Proposal Outline", type: "Word (.docx)", icon: FileText, size: "~12KB", desc: "ICMR / intramural grant proposal with budget template" },
  { name: "CRF Template — Nephrology", type: "Excel (.xlsx)", icon: FileText, size: "~20KB", desc: "Case Report Form with standard nephrology variables" },
  { name: "Data Extraction Sheet", type: "Excel (.xlsx)", icon: FileText, size: "~10KB", desc: "For systematic reviews — PRISMA-aligned extraction form" },
  { name: "Statistical Analysis Plan", type: "Word (.docx)", icon: FileText, size: "~8KB", desc: "SAP template with all required sections for pre-registration" },
];

export default function KnowledgeHub() {
  const [search, setSearch] = useState("");
  const [openTopics, setOpenTopics] = useState({});
  const [activeLevel, setActiveLevel] = useState("all");
  const [activeTab, setActiveTab] = useState("learn");

  const toggle = (key) => setOpenTopics(p => ({ ...p, [key]: !p[key] }));

  const filteredKnowledge = KNOWLEDGE.map(group => ({
    ...group,
    topics: group.topics.filter(t =>
      (activeLevel === "all" || group.level === activeLevel) &&
      (t.title.toLowerCase().includes(search.toLowerCase()) ||
       t.category.toLowerCase().includes(search.toLowerCase()) ||
       t.keywords.some(k => k.toLowerCase().includes(search.toLowerCase())))
    )
  })).filter(g => g.topics.length > 0);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
        {["learn", "templates"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${activeTab === tab ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}>
            {tab === "learn" ? "📚 Knowledge Modules" : "📄 Templates"}
          </button>
        ))}
      </div>

      {activeTab === "learn" && (
        <>
          {/* Search + filter */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search topics, keywords..." className="pl-9" />
            </div>
            <div className="flex gap-1">
              {["all", "Beginner", "Intermediate", "Advanced"].map(l => (
                <button key={l} onClick={() => setActiveLevel(l)}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${activeLevel === l ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Knowledge groups */}
          {filteredKnowledge.map(group => {
            const GroupIcon = group.icon;
            return (
              <div key={group.level}>
                <div className="flex items-center gap-2 mb-2">
                  <GroupIcon className="w-4 h-4" />
                  <span className="font-semibold text-sm text-slate-700">{group.level}</span>
                  <Badge className={group.color}>{group.topics.length} topics</Badge>
                </div>
                <div className="space-y-2">
                  {group.topics.map(topic => (
                    <Card key={topic.title} className="overflow-hidden">
                      <Collapsible open={openTopics[topic.title]} onOpenChange={() => toggle(topic.title)}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                            <div>
                              <p className="font-semibold text-sm text-slate-900">{topic.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-xs">{topic.category}</Badge>
                                <span className="text-xs text-slate-400">{topic.keywords.slice(0, 3).join(" · ")}</span>
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openTopics[topic.title] ? "rotate-180" : ""}`} />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 border-t bg-slate-50">
                            <div className="pt-3 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                              {topic.content}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-3">
                              {topic.keywords.map(k => <Badge key={k} variant="outline" className="text-xs">{k}</Badge>)}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredKnowledge.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No topics match your search</p>
            </div>
          )}
        </>
      )}

      {activeTab === "templates" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Download ready-to-use research templates. AI generation available in the Study Builder.</p>
          <div className="grid gap-3">
            {TEMPLATES.map(t => (
              <Card key={t.name} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{t.type}</Badge>
                        <span className="text-xs text-slate-400">{t.size}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 shrink-0 border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                    <Download className="w-3 h-3" />Use in Builder
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}