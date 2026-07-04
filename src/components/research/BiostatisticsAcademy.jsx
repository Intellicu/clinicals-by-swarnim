import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Brain, Loader2, BarChart2, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/client";

const BIOSTAT_CONCEPTS = [
  {
    id: "pvalue",
    title: "P-value",
    icon: "📊",
    color: "bg-blue-50 border-blue-200",
    simple: "The probability of observing your result (or more extreme) if the null hypothesis were true.",
    deep: "P<0.05 does NOT mean the null hypothesis is false, nor that the effect is clinically meaningful. It only indicates statistical significance at a chosen alpha level. Avoid p-value worship — effect size and confidence interval matter more.",
    exam_pearl: "A p-value of 0.049 and 0.051 are essentially equivalent despite one crossing 0.05. Always report effect size alongside.",
    formula: "P(data | H₀) — conditional probability",
    pitfall: "P-value does not indicate clinical significance, magnitude of effect, or probability that H₀ is true.",
  },
  {
    id: "ci",
    title: "Confidence Interval (CI)",
    icon: "📏",
    color: "bg-cyan-50 border-cyan-200",
    simple: "Range of values within which the true population parameter likely falls, with specified certainty (usually 95%).",
    deep: "95% CI means: if you repeated the study 100 times, 95 of those intervals would contain the true effect. Narrow CI = precise estimate. Wide CI = imprecise (small sample). If 95% CI for RR excludes 1.0 → statistically significant.",
    exam_pearl: "A CI that crosses the null (0 for differences, 1 for ratios) = non-significant result regardless of p-value.",
    formula: "x̄ ± Z × SE (for mean). Different formula for proportion, RR, OR.",
    pitfall: "Often confused as '95% probability the true value is in this range' — incorrect. It's a property of the method, not this specific interval.",
  },
  {
    id: "or_rr",
    title: "Odds Ratio vs Relative Risk",
    icon: "⚖️",
    color: "bg-amber-50 border-amber-200",
    simple: "RR = risk in exposed / risk in unexposed. OR = odds in exposed / odds in unexposed.",
    deep: "RR is more intuitive. OR approximates RR when outcome is rare (<10%). In case-control studies, only OR can be calculated (denominator unknown). OR always overestimates RR for common outcomes. Logistic regression produces OR, not RR.",
    exam_pearl: "For a common outcome (prevalence >10%), OR will exaggerate association compared to RR. Use prevalence ratio instead.",
    formula: "RR = [a/(a+b)] / [c/(c+d)]. OR = (a/b) / (c/d) = ad/bc",
    pitfall: "Do not say 'odds ratio of 3 means 3x more likely' — only approximately true for rare outcomes.",
  },
  {
    id: "hr",
    title: "Hazard Ratio (HR)",
    icon: "📈",
    color: "bg-rose-50 border-rose-200",
    simple: "Instantaneous event rate in treatment group vs control — used in survival analysis.",
    deep: "HR = 1 → same rate. HR < 1 → treatment reduces event rate. HR > 1 → treatment increases rate. Assumes proportional hazards (constant HR over time). Check Schoenfeld residuals for assumption. Used in Cox regression.",
    exam_pearl: "HR 0.7 = 30% reduction in instantaneous event rate — NOT a 30% absolute risk reduction.",
    formula: "HR = h₁(t)/h₀(t) — ratio of hazard functions",
    pitfall: "HR ≠ RR at a specific time point. HR is an average over the study period.",
  },
  {
    id: "roc",
    title: "ROC Curve & AUC",
    icon: "🎯",
    color: "bg-green-50 border-green-200",
    simple: "ROC (Receiver Operating Characteristic): plot of sensitivity vs (1-specificity) across thresholds. AUC = area under this curve.",
    deep: "AUC 0.5 = no better than chance. AUC 0.7–0.8 = acceptable. AUC 0.8–0.9 = excellent. AUC >0.9 = outstanding. Youden index = sensitivity + specificity – 1 → optimal cutoff. DeLong's test compares AUC between biomarkers.",
    exam_pearl: "AUC of 0.85 means: if you randomly pick one case and one control, there's 85% probability the case will have a higher biomarker value.",
    formula: "AUC = ∫ROC(t)dt",
    pitfall: "AUC doesn't tell you the optimal cutoff. Interpret AUC with clinical context (preferred sensitivity vs specificity).",
  },
  {
    id: "km",
    title: "Kaplan-Meier Survival Curves",
    icon: "📉",
    color: "bg-violet-50 border-violet-200",
    simple: "Step-down curves showing probability of surviving (or event-free) over time, accounting for censoring.",
    deep: "Censoring: patients lost to follow-up or event not yet occurred. KM handles this without bias. Log-rank test compares two KM curves. HR from Cox regression is the overall comparison. Restricted mean survival time (RMST) as alternative to HR.",
    exam_pearl: "At 5 years: if survival is 60%, median survival > 5 years (median requires 50% events).",
    formula: "S(t) = Π[1 - (d_i/n_i)] for all time points t_i ≤ t",
    pitfall: "Proportional hazards assumption: curves should not cross. If they do, HR is misleading.",
  },
  {
    id: "forest",
    title: "Forest Plot (Meta-Analysis)",
    icon: "🌲",
    color: "bg-emerald-50 border-emerald-200",
    simple: "Visual display of effect estimates from multiple studies. Diamond = pooled estimate.",
    deep: "Each study shown as a box (size = weight) with CI bars. Line of no effect (null line): 0 for MD, 1 for OR/RR. Heterogeneity measured by I² (0–100%). I²>50% = substantial heterogeneity → use random-effects model. Funnel plot asymmetry → publication bias.",
    exam_pearl: "I² = 0% doesn't mean no heterogeneity, just low statistical heterogeneity. Clinical heterogeneity still matters.",
    formula: "Fixed effects: 1/variance weights. Random effects: DerSimonian-Laird method.",
    pitfall: "Diamond crossing null line ≠ no effect in all subgroups. Always look for heterogeneity.",
  },
];

const STAT_TEST_DECISION = [
  { scenario: "Compare means: 2 groups, normal, unpaired", test: "Independent t-test", note: "Parametric. Assumes normality + equal variance (Levene's test)." },
  { scenario: "Compare means: 2 groups, non-normal, unpaired", test: "Mann-Whitney U", note: "Non-parametric equivalent of t-test. Compare medians." },
  { scenario: "Compare means: 2 groups, paired/matched", test: "Paired t-test / Wilcoxon signed-rank", note: "Before-after data. Paired t for normal; Wilcoxon for non-normal." },
  { scenario: "Compare means: ≥3 groups, normal", test: "One-way ANOVA + post-hoc (Tukey/Bonferroni)", note: "Post-hoc test required to identify which groups differ." },
  { scenario: "Compare means: ≥3 groups, non-normal", test: "Kruskal-Wallis + Dunn's post-hoc", note: "Non-parametric ANOVA equivalent." },
  { scenario: "Compare proportions: 2 groups, large n", test: "Chi-square test", note: "Expected cell count ≥5. Continuity correction for 2×2." },
  { scenario: "Compare proportions: small n or expected <5", test: "Fisher's exact test", note: "Used when chi-square assumptions violated." },
  { scenario: "Correlation: 2 continuous variables, normal", test: "Pearson correlation (r)", note: "Measures linear relationship. r range: -1 to +1." },
  { scenario: "Correlation: ordinal/non-normal", test: "Spearman rank correlation (ρ)", note: "Non-parametric. Ranks before correlating." },
  { scenario: "Predict outcome: continuous dependent variable", test: "Linear regression", note: "Multiple: adjust for confounders. Check residuals normality." },
  { scenario: "Predict outcome: binary (yes/no)", test: "Logistic regression → OR", note: "Multiple logistic: adjust confounders. Output: adjusted OR." },
  { scenario: "Time-to-event data", test: "Cox proportional hazards regression → HR", note: "Check proportional hazards assumption." },
  { scenario: "Diagnostic test accuracy", test: "Sensitivity/Specificity/ROC AUC", note: "Use LR+ and LR– for clinical utility." },
];

const StatTestInterpreter = () => {
  const [varType, setVarType] = useState("");
  const [paired, setPaired] = useState("");
  const [normal, setNormal] = useState("");
  const [groups, setGroups] = useState("");
  const [suggestion, setSuggestion] = useState(null);

  const getSuggestion = () => {
    if (!varType) return;
    let tests = [], notes = [];
    if (varType === "continuous") {
      if (groups === "2") {
        if (paired === "paired") {
          tests = normal === "yes" ? ["Paired t-test"] : ["Wilcoxon signed-rank test"];
        } else {
          tests = normal === "yes" ? ["Independent t-test"] : ["Mann-Whitney U test"];
        }
      } else if (groups === "3+") {
        tests = normal === "yes" ? ["One-way ANOVA", "Post-hoc: Tukey or Bonferroni"] : ["Kruskal-Wallis", "Post-hoc: Dunn's test"];
      } else if (groups === "correlation") {
        tests = normal === "yes" ? ["Pearson correlation (r)"] : ["Spearman rank correlation (ρ)"];
      } else if (groups === "predict") {
        tests = ["Linear regression (if outcome continuous)", "Logistic regression (if outcome binary → OR)"];
      }
    } else if (varType === "categorical") {
      tests = ["Chi-square test", "Fisher's exact test (if expected cell count <5)"];
    } else if (varType === "survival") {
      tests = ["Kaplan-Meier curves", "Log-rank test (comparison)", "Cox regression (adjusted HR)"];
    } else if (varType === "diagnostic") {
      tests = ["Sensitivity & Specificity", "ROC curve & AUC", "Likelihood ratios (LR+, LR–)"];
    }
    setSuggestion(tests.length ? tests : ["Select more specific options above"]);
  };

  return (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-blue-800 mb-3">Statistical Test Selector</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Outcome/Dependent Variable Type</label>
              <div className="flex flex-wrap gap-2">
                {["continuous", "categorical", "survival", "diagnostic"].map(v => (
                  <button
                    key={v}
                    onClick={() => setVarType(v)}
                    className={`px-3 py-1.5 rounded-full text-xs border-2 capitalize transition-all ${varType === v ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 text-slate-600"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {varType === "continuous" && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Number of groups</label>
                  <div className="flex flex-wrap gap-2">
                    {[["2", "2 groups"], ["3+", "≥3 groups"], ["correlation", "Correlation"], ["predict", "Prediction"]].map(([v, label]) => (
                      <button key={v} onClick={() => setGroups(v)} className={`px-3 py-1.5 rounded-full text-xs border-2 transition-all ${groups === v ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 text-slate-600"}`}>{label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Data distribution (Shapiro-Wilk test)</label>
                  <div className="flex gap-2">
                    {[["yes", "Normal (parametric)"], ["no", "Non-normal (non-parametric)"]].map(([v, label]) => (
                      <button key={v} onClick={() => setNormal(v)} className={`px-3 py-1.5 rounded-full text-xs border-2 transition-all ${normal === v ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 text-slate-600"}`}>{label}</button>
                    ))}
                  </div>
                </div>
                {groups === "2" && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Paired/Matched data?</label>
                    <div className="flex gap-2">
                      {[["paired", "Paired (same patient, before-after)"], ["unpaired", "Unpaired (different patients)"]].map(([v, label]) => (
                        <button key={v} onClick={() => setPaired(v)} className={`px-3 py-1.5 rounded-full text-xs border-2 transition-all ${paired === v ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 text-slate-600"}`}>{label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={getSuggestion} disabled={!varType}>
              Suggest Statistical Test
            </Button>
          </div>

          {suggestion && (
            <Card className="mt-3 border-green-200 bg-green-50">
              <CardContent className="p-3">
                <p className="text-xs font-bold text-green-700 mb-2">Recommended Test(s):</p>
                {suggestion.map((s, i) => (
                  <p key={i} className="text-sm font-semibold text-slate-800">✓ {s}</p>
                ))}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Complete Decision Reference</p>
      {STAT_TEST_DECISION.map((item, i) => (
        <Card key={i} className="border-slate-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-xs text-slate-500">{item.scenario}</p>
                <p className="text-sm font-bold text-blue-700">{item.test}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ConceptCard = ({ concept }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className={`border-2 ${concept.color} cursor-pointer`} onClick={() => setExpanded(!expanded)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{concept.icon}</span>
            <p className="font-bold text-sm text-slate-800">{concept.title}</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
        <p className="text-xs text-slate-600 mt-1">{concept.simple}</p>
        {expanded && (
          <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
            <div className="bg-white rounded-lg p-2 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-1">Deep Explanation</p>
              <p className="text-xs text-slate-700">{concept.deep}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-600 mb-1">Exam Pearl</p>
              <p className="text-xs text-slate-700">{concept.exam_pearl}</p>
            </div>
            {concept.formula && (
              <div className="bg-slate-800 rounded-lg p-2">
                <p className="text-xs font-mono text-green-300">{concept.formula}</p>
              </div>
            )}
            <div className="bg-red-50 rounded-lg p-2 border border-red-100">
              <p className="text-xs font-bold text-red-600 mb-1">Common Pitfall</p>
              <p className="text-xs text-slate-700">{concept.pitfall}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function BiostatisticsAcademy() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-indigo-700 to-violet-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Biostatistics Visual Academy</h2>
            <p className="text-indigo-100 text-sm">Core concepts · Statistical test interpreter · Exam pearls · Pitfall alerts</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="concepts">
        <TabsList className="flex w-full h-auto bg-white border shadow-sm overflow-x-auto">
          <TabsTrigger value="concepts" className="text-xs flex-shrink-0">Core Concepts</TabsTrigger>
          <TabsTrigger value="tests" className="text-xs flex-shrink-0">Test Selector</TabsTrigger>
        </TabsList>
        <TabsContent value="concepts" className="mt-3 space-y-3">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tap any concept to expand full explanation</p>
          {BIOSTAT_CONCEPTS.map(c => <ConceptCard key={c.id} concept={c} />)}
        </TabsContent>
        <TabsContent value="tests" className="mt-3">
          <StatTestInterpreter />
        </TabsContent>
      </Tabs>
    </div>
  );
}