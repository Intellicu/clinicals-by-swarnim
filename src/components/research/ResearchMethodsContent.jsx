import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen, Target, BarChart2, FileText, Download, CheckCircle,
  GraduationCap, Microscope, TrendingUp, Layers, Info, ChevronDown, ChevronUp
} from "lucide-react";

const STUDY_DESIGNS = [
  {
    name: "Randomised Controlled Trial (RCT)",
    level: "Advanced",
    icon: "🎲",
    color: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-800",
    loe: "Level I",
    description: "Gold standard for causality. Participants randomly allocated to intervention or control.",
    strengths: ["Minimises confounding", "Allows causal inference", "Blinding possible"],
    limitations: ["Expensive & time-intensive", "Ethical constraints", "Narrow eligibility criteria"],
    phases: ["Hypothesis & PICO", "Ethics/CTRI registration", "Randomisation", "Blinding", "Outcomes measurement", "ITT analysis"],
    pearls: "Register on CTRI before first enrollment. Use block randomisation for small samples."
  },
  {
    name: "Prospective Cohort Study",
    level: "Intermediate",
    icon: "📈",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    loe: "Level II",
    description: "Follow defined group forward in time to assess incidence of outcomes.",
    strengths: ["Temporal relationship clear", "Can study rare exposures", "Multiple outcomes"],
    limitations: ["Loss to follow-up", "Long duration", "Expensive"],
    phases: ["Cohort definition", "Baseline assessment", "Follow-up protocol", "Outcome ascertainment", "Survival analysis"],
    pearls: "Define primary exposure and outcome before starting. Plan for 20% dropout in sample size."
  },
  {
    name: "Retrospective Cohort / Registry Study",
    level: "Beginner",
    icon: "🗂️",
    color: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-800",
    loe: "Level III",
    description: "Use existing records to study exposure-outcome relationships looking backwards.",
    strengths: ["Quick & inexpensive", "Large sample sizes", "Real-world data"],
    limitations: ["Missing data", "Selection bias", "Recall/information bias"],
    phases: ["Data source identification", "Case ascertainment", "Exposure coding", "Confounder adjustment", "Sensitivity analysis"],
    pearls: "Ideal for rare diseases. Nephrotic syndrome & CKD registries are well-suited for this design."
  },
  {
    name: "Case-Control Study",
    level: "Intermediate",
    icon: "🔎",
    color: "bg-purple-50 border-purple-200",
    badge: "bg-purple-100 text-purple-800",
    loe: "Level III",
    description: "Compare past exposures in cases (disease+) vs matched controls (disease-).",
    strengths: ["Efficient for rare outcomes", "Relatively quick", "Good for hypothesis generation"],
    limitations: ["Recall bias", "Selection of controls difficult", "Cannot calculate incidence"],
    phases: ["Case definition", "Control selection (1:2-4 matching)", "Exposure history", "Odds ratio calculation", "Matched analysis"],
    pearls: "Match controls on age, sex, centre. For SRNS studies, use hospital-based controls from same time period."
  },
  {
    name: "Cross-Sectional Survey",
    level: "Beginner",
    icon: "📊",
    color: "bg-yellow-50 border-yellow-200",
    badge: "bg-yellow-100 text-yellow-800",
    loe: "Level IV",
    description: "Snapshot of exposure and outcome at single point in time. Good for prevalence.",
    strengths: ["Quick & cheap", "Good for prevalence estimation", "Multiple exposures & outcomes"],
    limitations: ["Temporal sequence unclear", "Prevalence-incidence bias", "Cannot establish causality"],
    phases: ["Population definition", "Sampling strategy", "Data collection tool", "Prevalence calculation", "Association testing"],
    pearls: "Calculate sample size using n = Z²pq/d². For 10% prevalence and 5% precision: n ≈ 138."
  },
  {
    name: "Systematic Review & Meta-Analysis",
    level: "Advanced",
    icon: "🔬",
    color: "bg-indigo-50 border-indigo-200",
    badge: "bg-indigo-100 text-indigo-800",
    loe: "Level I",
    description: "Synthesise all available evidence on a focused PICO question using PRISMA methodology.",
    strengths: ["Highest evidence quality", "Increases power", "Reduces random error"],
    limitations: ["Publication bias", "Heterogeneity", "Time-intensive"],
    phases: ["PROSPERO registration", "Search strategy (PubMed, Embase, Cochrane)", "Screening (title/abstract → full-text)", "Data extraction", "Risk of bias (RoB 2 / NOS)", "Meta-analysis (RevMan/R)", "GRADE assessment"],
    pearls: "Register protocol on PROSPERO before searching. Use PRISMA 2020 flow diagram."
  }
];

const BIAS_TOOLS = [
  { name: "RoB 2", use: "RCT risk of bias assessment", domains: ["Randomisation", "Deviations from intended intervention", "Missing outcome data", "Outcome measurement", "Selection of reported result"] },
  { name: "ROBINS-I", use: "Non-randomised studies", domains: ["Confounding", "Selection of participants", "Classification of interventions", "Deviations", "Missing data", "Outcome measurement", "Reporting"] },
  { name: "Newcastle-Ottawa Scale", use: "Cohort & case-control studies", domains: ["Selection (4 stars)", "Comparability (2 stars)", "Outcome (3 stars)"] },
  { name: "GRADE", use: "Certainty of evidence", domains: ["Risk of bias", "Inconsistency", "Indirectness", "Imprecision", "Publication bias"] }
];

const STAT_GUIDE = [
  { question: "Compare two groups (continuous data)", test: "Independent t-test (normal) / Mann-Whitney U (non-normal)", note: "Check normality with Shapiro-Wilk" },
  { question: "Compare >2 groups (continuous)", test: "One-way ANOVA / Kruskal-Wallis", note: "Post-hoc: Tukey HSD / Dunn's" },
  { question: "Compare proportions between 2 groups", test: "Chi-square test / Fisher's exact", note: "Fisher's if expected cell count <5" },
  { question: "Paired/repeated measures", test: "Paired t-test / Wilcoxon signed rank", note: "For pre-post treatment studies" },
  { question: "Time-to-event / Survival", test: "Kaplan-Meier + Log-rank / Cox regression", note: "Essential for CKD progression studies" },
  { question: "Identify risk factors (binary outcome)", test: "Logistic regression", note: "Report adjusted OR with 95% CI" },
  { question: "Identify risk factors (continuous outcome)", test: "Linear regression / Multivariable regression", note: "Check for multicollinearity (VIF <5)" },
  { question: "Agreement between two methods", test: "Bland-Altman analysis / ICC", note: "ICC >0.75 = good agreement" },
  { question: "Diagnostic accuracy", test: "ROC curve, sensitivity, specificity, AUC", note: "AUC >0.8 = good discriminating power" },
  { question: "Correlation between two variables", test: "Pearson r (normal) / Spearman rho (non-normal)", note: "Correlation ≠ causation" }
];

const SAMPLE_SIZE_FORMULAS = [
  { design: "Two-group comparison (means)", formula: "n = 2(Zα/2 + Zβ)² σ² / δ²", note: "δ = minimum detectable difference; σ = SD" },
  { design: "Two-group comparison (proportions)", formula: "n = (Zα/2√2P̄Q̄ + Zβ√P₁Q₁+P₂Q₂)² / (P₁-P₂)²", note: "Use P̄ = (P₁+P₂)/2" },
  { design: "Cross-sectional (prevalence)", formula: "n = Z²pq / d²", note: "Z=1.96, p=prevalence, d=precision" },
  { design: "Case-control (1:1 matching)", formula: "n = (Zα/2 + Zβ)² / [p(1-p)] × [OR/(1+OR)]⁻²", note: "OR = expected odds ratio" },
  { design: "Survival study (event-driven)", formula: "Events = 4(Zα/2 + Zβ)² / [ln(HR)]²", note: "HR = hazard ratio" }
];

const TEMPLATES = [
  { name: "IEC/IRB Application Form", desc: "Ethics committee application template (ICMR format)", icon: "📋" },
  { name: "Informed Consent Form (Hindi)", desc: "Bilingual consent form — English + Hindi", icon: "✍️" },
  { name: "Informed Consent Form (English)", desc: "Standard English consent with assent form for minors", icon: "📄" },
  { name: "RCT Protocol (SPIRIT)", desc: "SPIRIT 2013 compliant RCT protocol template", icon: "🎯" },
  { name: "Observational Study Protocol (STROBE)", desc: "STROBE-compliant observational study template", icon: "📐" },
  { name: "ICMR STS Grant Application", desc: "Short-Term Studentship grant outline", icon: "💰" },
  { name: "PRISMA 2020 Checklist", desc: "Systematic review checklist with all 27 items", icon: "🔬" },
  { name: "CONSORT Flow Diagram", desc: "RCT participant flow diagram template", icon: "🔄" },
  { name: "Data Extraction Template", desc: "Standardized data extraction sheet for meta-analysis", icon: "📊" },
  { name: "Statistical Analysis Plan (SAP)", desc: "Pre-specified SAP template with dummy tables", icon: "📈" },
  { name: "Adverse Event Reporting Form", desc: "ICMR-aligned AE reporting template", icon: "⚠️" },
  { name: "Manuscript Submission Checklist", desc: "General checklist for journal submission", icon: "📝" }
];

function CollapsibleSection({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <span>{icon}</span> {title}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="border-t">{children}</div>}
    </div>
  );
}

export default function ResearchMethodsContent() {
  const [activeLevel, setActiveLevel] = useState("all");
  const filteredDesigns = activeLevel === "all" ? STUDY_DESIGNS : STUDY_DESIGNS.filter(d => d.level === activeLevel);

  const downloadTemplate = (name) => {
    const content = `# ${name}\n\nThis is a template for: ${name}\n\nFill in all required sections as per ICMR / institutional guidelines.\n\nDate: ${new Date().toLocaleDateString()}\n`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name.replace(/\s+/g, "_") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-indigo-50 border-indigo-200">
        <BookOpen className="w-4 h-4 text-indigo-600" />
        <AlertDescription className="text-indigo-800 text-sm">
          <strong>Research Methodology Hub</strong> — Evidence-based guidance for designing, conducting, and publishing clinical research in pediatric nephrology. ICMR guidelines integrated.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="designs">
        <TabsList className="flex w-full h-auto overflow-x-auto p-1 text-xs">
          <TabsTrigger value="designs">Study Designs</TabsTrigger>
          <TabsTrigger value="prisma">PRISMA / SysRev</TabsTrigger>
          <TabsTrigger value="bias">Bias Tools</TabsTrigger>
          <TabsTrigger value="stats">Stats Guide</TabsTrigger>
          <TabsTrigger value="samplesize">Sample Size</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* ─── STUDY DESIGNS ─── */}
        <TabsContent value="designs" className="space-y-4 pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-600">Filter by level:</span>
            {["all", "Beginner", "Intermediate", "Advanced"].map(l => (
              <Button key={l} size="sm" variant={activeLevel === l ? "default" : "outline"}
                onClick={() => setActiveLevel(l)} className="text-xs h-7">
                {l === "all" ? "All" : l}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredDesigns.map(design => (
              <CollapsibleSection key={design.name} title={`${design.icon} ${design.name}`} icon="" defaultOpen={false}>
                <div className="p-4 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={design.badge + " text-xs"}>{design.level}</Badge>
                    <Badge className="bg-slate-100 text-slate-700 text-xs">{design.loe}</Badge>
                  </div>
                  <p className="text-sm text-slate-700">{design.description}</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-bold text-emerald-700 mb-1.5">✅ Strengths</p>
                      <ul className="space-y-0.5">{design.strengths.map((s, i) => <li key={i} className="text-xs text-slate-700">• {s}</li>)}</ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-700 mb-1.5">❌ Limitations</p>
                      <ul className="space-y-0.5">{design.limitations.map((l, i) => <li key={i} className="text-xs text-slate-700">• {l}</li>)}</ul>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-700 mb-1.5">📋 Key Steps</p>
                    <div className="flex flex-wrap gap-1.5">
                      {design.phases.map((phase, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-4 h-4 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                          {phase}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    <p className="text-xs font-bold text-amber-800">💡 Clinical Pearl</p>
                    <p className="text-xs text-amber-700 mt-0.5">{design.pearls}</p>
                  </div>
                </div>
              </CollapsibleSection>
            ))}
          </div>
        </TabsContent>

        {/* ─── PRISMA / SYSTEMATIC REVIEW ─── */}
        <TabsContent value="prisma" className="space-y-4 pt-3">
          <Card className="border-indigo-200">
            <CardHeader className="bg-indigo-50 border-b py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Microscope className="w-4 h-4 text-indigo-600" /> PRISMA 2020 — 8-Step Systematic Review Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { step: 1, title: "PROSPERO Registration", detail: "Register protocol before searching. State PICO, databases, inclusion criteria, outcome measures.", tools: "PROSPERO, OSF" },
                { step: 2, title: "Define Search Strategy", detail: "Use MeSH terms + free text. Apply Boolean operators (AND/OR/NOT). Include synonyms and alternative spellings.", tools: "PubMed, Embase, Cochrane, LILACS, Google Scholar" },
                { step: 3, title: "Title & Abstract Screening", detail: "Two independent reviewers. Use Rayyan or Covidence. Resolve disagreements by consensus or third reviewer.", tools: "Rayyan, Covidence, Rayyan AI" },
                { step: 4, title: "Full-Text Eligibility", detail: "Apply detailed inclusion/exclusion criteria. Document reasons for exclusion. Report PRISMA flow diagram.", tools: "EndNote, Zotero, Mendeley" },
                { step: 5, title: "Data Extraction", detail: "Standardized extraction form. Extract: population, intervention, comparator, outcomes, study design, risk of bias.", tools: "Excel template, REDCap" },
                { step: 6, title: "Risk of Bias Assessment", detail: "RoB 2 for RCTs, ROBINS-I for observational, Newcastle-Ottawa for cohort/case-control.", tools: "Cochrane RoB 2, ROBINS-I tool" },
                { step: 7, title: "Meta-Analysis & Synthesis", detail: "Pool effect sizes using random effects (preferred). Assess heterogeneity (I² >50% = substantial). Funnel plots for publication bias.", tools: "RevMan 5.4, R (meta package), Stata" },
                { step: 8, title: "GRADE & Report", detail: "Assess certainty of evidence: High/Moderate/Low/Very Low. Write using PRISMA 2020 checklist. Submit to PROSPERO on completion.", tools: "GRADEpro, Epistemonikos" }
              ].map(s => (
                <div key={s.step} className="flex gap-3 p-3 bg-slate-50 rounded-lg border">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{s.step}</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{s.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{s.detail}</p>
                    <p className="text-xs text-indigo-600 mt-1">🛠 Tools: {s.tools}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50 border-b py-3">
              <CardTitle className="text-sm">Search Strategy Builder — PubMed Format</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-slate-900 text-emerald-400 rounded-lg p-3 text-xs font-mono space-y-1">
                <p># Example: Nephrotic Syndrome treatment in children</p>
                <p>("nephrotic syndrome"[MeSH] OR "nephrotic syndrome"[tiab] OR "proteinuria"[tiab])</p>
                <p>AND</p>
                <p>("child"[MeSH] OR "pediatric"[tiab] OR "paediatric"[tiab] OR "children"[tiab])</p>
                <p>AND</p>
                <p>("prednisolone"[MeSH] OR "corticosteroid"[tiab] OR "cyclophosphamide"[tiab] OR "rituximab"[tiab])</p>
                <p className="text-yellow-400 mt-2"># Tip: Export to Embase using EMTREE equivalents</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── BIAS TOOLS ─── */}
        <TabsContent value="bias" className="space-y-3 pt-3">
          {BIAS_TOOLS.map(tool => (
            <Card key={tool.name} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{tool.name}</p>
                    <p className="text-xs text-slate-500 mb-2">Use for: {tool.use}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.domains.map((d, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <p className="text-sm font-bold text-amber-800 mb-2">📌 GRADE Evidence Certainty</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { grade: "⊕⊕⊕⊕ High", color: "text-emerald-700", note: "RCT with no serious concerns" },
                  { grade: "⊕⊕⊕○ Moderate", color: "text-blue-700", note: "RCT downgraded or cohort upgraded" },
                  { grade: "⊕⊕○○ Low", color: "text-amber-700", note: "Observational with no upgrading" },
                  { grade: "⊕○○○ Very Low", color: "text-red-700", note: "Observational downgraded" }
                ].map(g => (
                  <div key={g.grade} className="bg-white rounded-lg p-2 border">
                    <p className={`text-xs font-bold ${g.color}`}>{g.grade}</p>
                    <p className="text-xs text-slate-600">{g.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── STATS GUIDE ─── */}
        <TabsContent value="stats" className="pt-3">
          <Card>
            <CardHeader className="bg-slate-50 border-b py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" /> Statistical Test Selection Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {STAT_GUIDE.map((row, i) => (
                  <div key={i} className="p-3 grid grid-cols-1 md:grid-cols-3 gap-2 hover:bg-slate-50 text-sm">
                    <div className="font-medium text-slate-800">{row.question}</div>
                    <div className="font-bold text-blue-700">{row.test}</div>
                    <div className="text-xs text-slate-500 italic">{row.note}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="mt-3 border-purple-200">
            <CardContent className="p-4">
              <p className="text-sm font-bold text-purple-800 mb-3">📝 Reporting Guidelines</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {[
                  { name: "CONSORT", use: "RCTs" }, { name: "STROBE", use: "Observational" }, { name: "PRISMA 2020", use: "Systematic Reviews" },
                  { name: "SPIRIT", use: "Trial protocols" }, { name: "ARRIVE 2.0", use: "Animal studies" }, { name: "STARD", use: "Diagnostic accuracy" },
                  { name: "CARE", use: "Case reports" }, { name: "TRIPOD", use: "Prediction models" }, { name: "CHEERS", use: "Economic evaluations" }
                ].map(g => (
                  <div key={g.name} className="bg-purple-50 rounded px-2 py-1.5 border border-purple-200">
                    <span className="font-bold text-purple-800">{g.name}</span>
                    <span className="text-slate-500 ml-1">— {g.use}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SAMPLE SIZE ─── */}
        <TabsContent value="samplesize" className="space-y-3 pt-3">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Always calculate sample size before starting data collection. Standard assumptions: α=0.05 (two-tailed), power=80% (β=0.20), 10-20% dropout added.
            </AlertDescription>
          </Alert>
          {SAMPLE_SIZE_FORMULAS.map((f, i) => (
            <Card key={i} className="border-teal-200">
              <CardContent className="p-4">
                <p className="text-sm font-bold text-teal-800 mb-2">{f.design}</p>
                <div className="bg-slate-900 text-emerald-400 rounded-lg p-2.5 text-sm font-mono mb-2">{f.formula}</div>
                <p className="text-xs text-slate-500">{f.note}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <p className="text-sm font-bold text-orange-800 mb-2">Z-values Quick Reference</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[["α=0.05 (two-tailed)", "Zα/2 = 1.96"], ["α=0.01", "Zα/2 = 2.576"], ["α=0.10", "Zα/2 = 1.645"],
                  ["80% power", "Zβ = 0.842"], ["90% power", "Zβ = 1.282"], ["95% power", "Zβ = 1.645"]].map(([label, val], i) => (
                  <div key={i} className="bg-white rounded px-2 py-1.5 border border-orange-200">
                    <div className="text-slate-500">{label}</div>
                    <div className="font-bold text-orange-800">{val}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TEMPLATES ─── */}
        <TabsContent value="templates" className="pt-3">
          <div className="grid md:grid-cols-2 gap-3">
            {TEMPLATES.map(t => (
              <Card key={t.name} className="hover:shadow-md transition-shadow border-slate-200">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">{t.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 mb-2">{t.desc}</p>
                    <Button size="sm" variant="outline" onClick={() => downloadTemplate(t.name)}
                      className="h-7 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                      <Download className="w-3 h-3 mr-1" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Alert className="mt-4 bg-amber-50 border-amber-200">
            <AlertDescription className="text-xs text-amber-800">
              These templates are starting points. Customise per your IEC/IRB requirements. Templates comply with ICMR 2023, ICH GCP E6(R2), and SPIRIT/CONSORT guidelines.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}