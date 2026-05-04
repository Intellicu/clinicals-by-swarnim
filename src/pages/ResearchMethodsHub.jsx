import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, BookOpen, FlaskConical, FileText, Layers, Sparkles, Loader2, CheckCircle, Download, ChevronRight, GitBranch } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const STUDY_DESIGNS = [
  {
    name: "Randomised Controlled Trial (RCT)",
    icon: "🎲",
    level: "I",
    strength: "Highest",
    color: "green",
    description: "Participants randomly allocated to intervention vs control. Gold standard for causation.",
    uses: ["Evaluating new treatments", "Drug efficacy", "Intervention effectiveness"],
    limitations: ["Expensive", "Time-consuming", "Ethical constraints", "May lack generalizability"],
    keywords: ["CONSORT", "PICOS", "allocation concealment", "intention-to-treat"],
    phases: ["Conceive research question (PICO)", "Calculate sample size (power = 80%, α = 0.05)", "Ethics approval (IEC/IRB)", "Register trial (CTRI)", "Randomisation + allocation", "Blinding strategy", "Intervention delivery", "Outcome assessment", "Data analysis (ITT + PP)", "Report (CONSORT checklist)"]
  },
  {
    name: "Prospective Cohort Study",
    icon: "👥",
    level: "II",
    strength: "High",
    color: "blue",
    description: "Groups defined by exposure, followed forward in time to measure outcomes.",
    uses: ["Disease incidence", "Risk factors", "Prognosis studies"],
    limitations: ["Loss to follow-up", "Expensive long-term", "Cannot prove causation"],
    keywords: ["hazard ratio", "incidence rate", "Kaplan-Meier", "Cox regression"],
    phases: ["Define exposure and outcome", "Identify cohort at baseline", "Exclude prevalent cases", "Measure and record exposures", "Follow-up at intervals", "Measure outcomes", "Adjust for confounders", "Report (STROBE checklist)"]
  },
  {
    name: "Retrospective Cohort",
    icon: "📂",
    level: "II-III",
    strength: "Moderate-High",
    color: "teal",
    description: "Uses existing records to define cohort and trace outcomes retrospectively.",
    uses: ["Rare outcomes", "Long latency diseases", "Hospital data analysis"],
    limitations: ["Data quality issues", "Incomplete records", "Recall bias"],
    keywords: ["medical records", "historical cohort", "exposure recall"],
    phases: ["Identify historical records/registry", "Define inclusion/exclusion criteria", "Extract exposure data", "Trace outcome occurrence", "Control for confounders", "Report (STROBE)"]
  },
  {
    name: "Case-Control Study",
    icon: "🔍",
    level: "III",
    strength: "Moderate",
    color: "purple",
    description: "Cases (disease +) compared to controls (disease −), looking backwards at exposures.",
    uses: ["Rare diseases", "Multiple risk factors", "Quick & inexpensive"],
    limitations: ["Recall bias", "Selection bias", "Cannot calculate incidence"],
    keywords: ["odds ratio", "matching", "recall bias", "nested case-control"],
    phases: ["Define cases (strict criteria)", "Select controls (matched or population)", "Measure past exposure (interviews/records)", "Calculate odds ratio", "Adjust for confounders", "Report (STROBE)"]
  },
  {
    name: "Cross-Sectional Study",
    icon: "📸",
    level: "IV",
    strength: "Descriptive",
    color: "amber",
    description: "Snapshot of exposure and outcome measured simultaneously in a population.",
    uses: ["Prevalence estimation", "Screening", "Hypothesis generation"],
    limitations: ["No temporality", "Prevalence ≠ incidence", "Survivor bias"],
    keywords: ["prevalence", "point estimate", "representativeness"],
    phases: ["Define population + sampling method", "Determine sample size for prevalence", "Single-time data collection", "Calculate prevalence + 95% CI", "Report (STROBE/CHERRIES)"]
  },
  {
    name: "Systematic Review & Meta-Analysis",
    icon: "📚",
    level: "I",
    strength: "Highest",
    color: "red",
    description: "Comprehensive synthesis of all studies on a topic. Forest plot shows pooled effect.",
    uses: ["Policy decisions", "Clinical guideline development", "Summarizing evidence"],
    limitations: ["Publication bias", "Heterogeneity", "GIGO (garbage in, garbage out)"],
    keywords: ["PRISMA", "forest plot", "heterogeneity", "I²", "funnel plot", "GRADE"],
    phases: ["Frame PICO question", "Register protocol (PROSPERO)", "Search 5+ databases (systematic)", "Screen title/abstract (2 reviewers)", "Full-text eligibility", "Data extraction (standardised form)", "Risk of bias assessment (RoB 2/NOS)", "Statistical pooling (random/fixed effects)", "Assess heterogeneity (I², Cochran Q)", "Funnel plot for publication bias", "GRADE evidence quality", "Report (PRISMA 2020)"]
  }
];

const PRISMA_STEPS = [
  { step: 1, phase: "Identification", title: "Database Search", icon: "🔍", color: "blue",
    desc: "Search PubMed, Embase, Cochrane, Scopus, Web of Science. Also grey literature (ClinicalTrials.gov, WHO ICTRP).",
    tips: ["Use MeSH terms + free text", "Document search string exactly", "Set date range + language filters", "Export to Endnote/Zotero"]
  },
  { step: 2, phase: "Identification", title: "Duplicate Removal", icon: "✂️", color: "blue",
    desc: "Remove duplicates across databases before screening.",
    tips: ["Use Endnote/Zotero auto-deduplication", "Manual check after automated", "Record n removed"]
  },
  { step: 3, phase: "Screening", title: "Title/Abstract Screening", icon: "👁️", color: "amber",
    desc: "Two independent reviewers screen titles and abstracts against inclusion criteria.",
    tips: ["Use Covidence/Rayyan for blinded screening", "Calculate inter-rater reliability (κ)", "Resolve disagreements by consensus or third reviewer"]
  },
  { step: 4, phase: "Eligibility", title: "Full-Text Review", icon: "📄", color: "orange",
    desc: "Retrieve and assess full texts for detailed eligibility. Record exclusion reasons.",
    tips: ["Pre-defined inclusion/exclusion criteria", "Record REASON for each exclusion", "Contact authors for missing data"]
  },
  { step: 5, phase: "Included", title: "Data Extraction", icon: "📊", color: "purple",
    desc: "Extract data using standardised form: study design, population, intervention, outcomes, results.",
    tips: ["Pilot test extraction form on 3-5 papers", "Extract in duplicate (2 reviewers)", "Use Excel/RevMan/Covidence"]
  },
  { step: 6, phase: "Included", title: "Risk of Bias Assessment", icon: "⚖️", color: "purple",
    desc: "Assess methodological quality using validated tools.",
    tips: ["RCTs: Cochrane RoB 2.0", "Cohort/Case-control: Newcastle-Ottawa Scale (NOS)", "Diagnostic: QUADAS-2"]
  },
  { step: 7, phase: "Analysis", title: "Meta-Analysis", icon: "📈", color: "green",
    desc: "Pool results if appropriate. Assess heterogeneity. Choose fixed vs random effects model.",
    tips: ["I² <25% = low, 25-75% = moderate, >75% = high heterogeneity", "Random effects when I²>50%", "Subgroup analysis for heterogeneity sources"]
  },
  { step: 8, phase: "Analysis", title: "GRADE Evidence Quality", icon: "🏆", color: "teal",
    desc: "Rate certainty of evidence for each outcome: High, Moderate, Low, Very Low.",
    tips: ["Start at High for RCTs, Low for observational", "Downgrade for risk of bias, inconsistency, indirectness, imprecision", "Upgrade for large effect, dose-response"]
  }
];

const PROTOCOL_TEMPLATES = [
  {
    id: "cohort",
    name: "Prospective Cohort Protocol",
    description: "Complete protocol template for a pediatric nephrology cohort study",
    sections: ["Background & Rationale", "PICO Question", "Objectives (Primary/Secondary)", "Study Design & Setting", "Eligibility Criteria", "Sample Size Calculation", "Recruitment Strategy", "Data Collection Tools", "Outcome Definitions", "Statistical Analysis Plan", "Ethics Considerations", "Timeline & Budget", "References"]
  },
  {
    id: "sr",
    name: "Systematic Review Protocol (PRISMA-P)",
    description: "PROSPERO-ready systematic review protocol",
    sections: ["Background", "PICO", "Eligibility Criteria (PICOS)", "Information Sources & Search Strategy", "Study Selection Process", "Data Items & Extraction", "Risk of Bias Assessment", "Data Synthesis", "Meta-Analysis Plan (if applicable)", "Confidence in Evidence (GRADE)", "Amendments", "Registration (PROSPERO)"]
  },
  {
    id: "rct",
    name: "RCT Protocol (SPIRIT Checklist)",
    description: "SPIRIT 2013-compliant RCT protocol",
    sections: ["Title, Registration, Protocol version", "Background & Rationale", "PICOS", "Eligibility Criteria", "Interventions (detailed)", "Outcomes (primary/secondary)", "Participant timeline (SPIRIT figure)", "Sample Size & Power", "Recruitment", "Randomisation & Allocation", "Blinding", "Data Management", "Statistical Analysis Plan", "Data Monitoring Committee", "Adverse Event Reporting", "Ethics & Consent", "Trial Oversight"]
  }
];

// AI Protocol Generator component
function ProtocolGenerator() {
  const [question, setQuestion] = useState("");
  const [design, setDesign] = useState("");
  const [population, setPopulation] = useState("");
  const [outcome, setOutcome] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  const generate = async () => {
    if (!question || !design) return;
    setLoading(true);
    toast.info("Generating research protocol...", { id: "proto", duration: 30000 });
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert pediatric nephrology clinical researcher. Generate a STRUCTURED, COMPLETE research protocol based on the following inputs.

RESEARCH QUESTION: ${question}
STUDY DESIGN: ${design}
POPULATION: ${population || "Pediatric patients (0-18 years) with kidney disease"}
PRIMARY OUTCOME: ${outcome || "To be defined by researcher"}

Generate a comprehensive protocol with these sections:
1. BACKGROUND & RATIONALE (3-4 sentences citing need for study)
2. RESEARCH QUESTION (PICO format)
3. OBJECTIVES: Primary + 2-3 Secondary
4. STUDY DESIGN & SETTING
5. ELIGIBILITY CRITERIA (Inclusion / Exclusion)
6. SAMPLE SIZE CALCULATION (with assumptions: α=0.05, power=80%)
7. DATA COLLECTION (key variables to collect)
8. OUTCOME MEASURES (primary + secondary, with definitions)
9. STATISTICAL ANALYSIS PLAN
10. ETHICAL CONSIDERATIONS
11. TIMELINE (phases, months)
12. LIMITATIONS & MITIGATIONS

Format professionally. Be specific to pediatric nephrology context.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            background: { type: "string" },
            pico: { type: "object", properties: { population: { type: "string" }, intervention: { type: "string" }, comparison: { type: "string" }, outcome: { type: "string" } } },
            objectives: { type: "object", properties: { primary: { type: "string" }, secondary: { type: "array", items: { type: "string" } } } },
            design_setting: { type: "string" },
            inclusion_criteria: { type: "array", items: { type: "string" } },
            exclusion_criteria: { type: "array", items: { type: "string" } },
            sample_size: { type: "string" },
            data_variables: { type: "array", items: { type: "string" } },
            outcomes: { type: "object", properties: { primary: { type: "string" }, secondary: { type: "array", items: { type: "string" } } } },
            statistical_plan: { type: "string" },
            ethics: { type: "string" },
            timeline: { type: "array", items: { type: "object", properties: { phase: { type: "string" }, duration: { type: "string" } } } },
            limitations: { type: "array", items: { type: "string" } }
          }
        }
      });
      setGenerated(result);
      toast.success("Protocol generated!", { id: "proto" });
    } catch (e) {
      toast.error("Generation failed", { id: "proto" });
    } finally {
      setLoading(false);
    }
  };

  const copyProtocol = () => {
    if (!generated) return;
    const text = `RESEARCH PROTOCOL: ${generated.title}

BACKGROUND:
${generated.background}

PICO QUESTION:
Population: ${generated.pico?.population}
Intervention: ${generated.pico?.intervention}
Comparison: ${generated.pico?.comparison}
Outcome: ${generated.pico?.outcome}

PRIMARY OBJECTIVE:
${generated.objectives?.primary}

SECONDARY OBJECTIVES:
${generated.objectives?.secondary?.map((s, i) => `${i + 1}. ${s}`).join('\n')}

STUDY DESIGN:
${generated.design_setting}

INCLUSION CRITERIA:
${generated.inclusion_criteria?.map(c => `• ${c}`).join('\n')}

EXCLUSION CRITERIA:
${generated.exclusion_criteria?.map(c => `• ${c}`).join('\n')}

SAMPLE SIZE:
${generated.sample_size}

PRIMARY OUTCOME:
${generated.outcomes?.primary}

STATISTICAL ANALYSIS:
${generated.statistical_plan}

ETHICS:
${generated.ethics}

TIMELINE:
${generated.timeline?.map(t => `${t.phase}: ${t.duration}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    toast.success("Protocol copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-purple-50 border-purple-200">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>AI Protocol Generator</strong> — Describe your research question and AI will generate a complete structured protocol (SPIRIT/STROBE compliant).
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Research Question *</Label>
          <Textarea value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="e.g., Does early ACE inhibitor use reduce proteinuria progression in children with SRNS?" className="mt-1 h-24" />
        </div>
        <div>
          <Label>Study Design *</Label>
          <Select value={design} onValueChange={setDesign}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select design" /></SelectTrigger>
            <SelectContent>
              {["Prospective Cohort", "Retrospective Cohort", "RCT", "Case-Control", "Cross-Sectional", "Systematic Review", "Pilot Study"].map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-3">
            <Label>Study Population</Label>
            <Input value={population} onChange={e => setPopulation(e.target.value)}
              placeholder="e.g., Children 1-18 years with nephrotic syndrome" className="mt-1" />
          </div>
          <div className="mt-3">
            <Label>Primary Outcome</Label>
            <Input value={outcome} onChange={e => setOutcome(e.target.value)}
              placeholder="e.g., Time to complete remission" className="mt-1" />
          </div>
        </div>
      </div>

      <Button onClick={generate} disabled={!question || !design || loading}
        className="w-full bg-purple-600 hover:bg-purple-700">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Protocol...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Full Protocol</>}
      </Button>

      {generated && (
        <Card className="bg-white border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base text-purple-900">{generated.title}</CardTitle>
              <Button size="sm" variant="outline" onClick={copyProtocol}>
                <Download className="w-3 h-3 mr-1" />Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-sm">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="font-bold text-blue-900 mb-2">PICO Framework</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(generated.pico || {}).map(([k, v]) => (
                  <div key={k}><strong className="capitalize text-blue-800">{k}:</strong> <span className="text-blue-700">{v}</span></div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-900 mb-1">Background</p>
              <p className="text-slate-700 text-xs leading-relaxed">{generated.background}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="font-bold text-green-900 text-xs mb-2">✅ Inclusion Criteria</p>
                {generated.inclusion_criteria?.map((c, i) => <p key={i} className="text-xs text-green-800">• {c}</p>)}
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-bold text-red-900 text-xs mb-2">❌ Exclusion Criteria</p>
                {generated.exclusion_criteria?.map((c, i) => <p key={i} className="text-xs text-red-800">• {c}</p>)}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="font-bold text-amber-900 text-xs mb-1">📊 Sample Size</p>
              <p className="text-xs text-amber-800">{generated.sample_size}</p>
            </div>

            <div>
              <p className="font-bold text-slate-900 mb-1">Primary Objective</p>
              <p className="text-xs text-slate-700">{generated.objectives?.primary}</p>
              {generated.objectives?.secondary?.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-slate-700 text-xs">Secondary:</p>
                  {generated.objectives.secondary.map((s, i) => <p key={i} className="text-xs text-slate-600">• {s}</p>)}
                </div>
              )}
            </div>

            {generated.timeline?.length > 0 && (
              <div>
                <p className="font-bold text-slate-900 mb-2">Timeline</p>
                <div className="space-y-1">
                  {generated.timeline.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                      <span className="font-medium text-slate-800">{t.phase}</span>
                      <span className="text-slate-500">({t.duration})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ResearchMethodsHub() {
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [selectedPrismaStep, setSelectedPrismaStep] = useState(null);
  const [activeTab, setActiveTab] = useState("designs");

  const phaseColors = { Identification: "blue", Screening: "amber", Eligibility: "orange", Included: "purple", Analysis: "green", teal: "teal" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl("ResearchHub")}>
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />Back to Research Hub
          </Button>
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <FlaskConical className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Research Methods & Study Design Hub</h1>
            <p className="text-sm text-slate-600">Systematic review workflows · PRISMA · AI protocol generator · Study design guides</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1 bg-slate-100 p-1">
            <TabsTrigger value="designs" className="text-xs">📐 Study Designs</TabsTrigger>
            <TabsTrigger value="prisma" className="text-xs">📋 PRISMA Workflow</TabsTrigger>
            <TabsTrigger value="generator" className="text-xs">🤖 Protocol Generator</TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">📄 Templates</TabsTrigger>
          </TabsList>

          {/* Study Designs */}
          <TabsContent value="designs">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {STUDY_DESIGNS.map(design => (
                <Card key={design.name}
                  className={`cursor-pointer hover:shadow-xl transition-all border-2 ${selectedDesign?.name === design.name ? "border-indigo-500 shadow-lg" : "border-slate-200 hover:border-indigo-300"}`}
                  onClick={() => setSelectedDesign(selectedDesign?.name === design.name ? null : design)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-3xl">{design.icon}</span>
                      <div className="flex gap-1">
                        <Badge className="bg-slate-700 text-white text-xs">Level {design.level}</Badge>
                        <Badge className={`text-xs ${design.strength === 'Highest' ? 'bg-green-600' : design.strength === 'High' ? 'bg-blue-600' : design.strength === 'Moderate-High' ? 'bg-teal-600' : design.strength === 'Moderate' ? 'bg-amber-600' : 'bg-slate-500'} text-white`}>
                          {design.strength}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{design.name}</h3>
                    <p className="text-xs text-slate-600">{design.description}</p>
                    <p className="text-xs text-indigo-600 mt-2 font-semibold">{selectedDesign?.name === design.name ? "▲ Hide details" : "▼ Show details"}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedDesign && (
              <Card className="bg-white border-2 border-indigo-300 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span>{selectedDesign.icon}</span> {selectedDesign.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 text-sm">✅ Best Used For</h4>
                      {selectedDesign.uses.map(u => <p key={u} className="text-xs text-slate-700 mb-1">• {u}</p>)}
                      <h4 className="font-bold text-slate-900 mb-2 text-sm mt-4">⚠️ Limitations</h4>
                      {selectedDesign.limitations.map(l => <p key={l} className="text-xs text-amber-700 mb-1">• {l}</p>)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 text-sm">🔑 Key Statistical Terms</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedDesign.keywords.map(k => <Badge key={k} variant="outline" className="text-xs">{k}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 text-sm">📋 Stepwise Workflow</h4>
                      {selectedDesign.phases.map((p, i) => (
                        <div key={i} className="flex items-start gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0">{i + 1}</div>
                          <p className="text-xs text-slate-700">{p}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* PRISMA Workflow */}
          <TabsContent value="prisma">
            <Alert className="mb-4 bg-red-50 border-red-200">
              <BookOpen className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>PRISMA 2020</strong> — Preferred Reporting Items for Systematic Reviews and Meta-Analyses. Click each step for detailed guidance.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {PRISMA_STEPS.map((step, idx) => (
                <div key={step.step}>
                  <Card className={`cursor-pointer hover:shadow-lg transition-all border-2 ${selectedPrismaStep === step.step ? "border-blue-500 shadow-lg" : "border-slate-200 hover:border-blue-300"}`}
                    onClick={() => setSelectedPrismaStep(selectedPrismaStep === step.step ? null : step.step)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-${step.color}-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs bg-${step.color}-100 text-${step.color}-800 border-${step.color}-300`}>{step.phase}</Badge>
                            <span className="font-bold text-slate-900 text-sm">{step.icon} {step.title}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{step.desc}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${selectedPrismaStep === step.step ? "rotate-90" : ""}`} />
                      </div>
                    </CardContent>
                  </Card>

                  {selectedPrismaStep === step.step && (
                    <Card className="border-2 border-blue-200 bg-blue-50 ml-4">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-blue-900 mb-2 text-sm">💡 Practical Tips</h4>
                        {step.tips.map((t, i) => (
                          <div key={i} className="flex items-start gap-2 mb-1.5">
                            <CheckCircle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-800">{t}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>

            {/* Forest plot explainer */}
            <Card className="mt-6 bg-white border-2 border-green-200 shadow">
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  📊 Understanding the Forest Plot
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-sm text-slate-700 space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-bold mb-2">Key Elements:</p>
                    <div className="space-y-1.5 text-xs">
                      {[
                        ["Diamond", "Overall pooled effect estimate"],
                        ["Horizontal line", "95% Confidence Interval for each study"],
                        ["Square size", "Weight of the study in analysis"],
                        ["Vertical line", "Line of no effect (RR=1 or MD=0)"],
                        ["Left of line", "Favours intervention"],
                        ["Right of line", "Favours control"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex gap-2"><strong className="text-slate-900">{k}:</strong> <span>{v}</span></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold mb-2">Heterogeneity (I²):</p>
                    <div className="space-y-1.5">
                      {[["< 25%", "Low heterogeneity", "green"], ["25–75%", "Moderate heterogeneity", "amber"], ["> 75%", "High heterogeneity", "red"]].map(([range, label, color]) => (
                        <div key={range} className={`flex items-center gap-2 text-xs px-3 py-2 rounded bg-${color}-50 border border-${color}-200`}>
                          <strong className={`text-${color}-800`}>{range}:</strong>
                          <span className={`text-${color}-700`}>{label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-3">When I² &gt;50%: use <strong>random effects</strong> model. Consider subgroup analysis to identify source of heterogeneity.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Protocol Generator */}
          <TabsContent value="generator">
            <ProtocolGenerator />
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates">
            <div className="grid md:grid-cols-3 gap-4">
              {PROTOCOL_TEMPLATES.map(tmpl => (
                <Card key={tmpl.id} className="bg-white border-2 border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b">
                    <CardTitle className="text-base">📄 {tmpl.name}</CardTitle>
                    <p className="text-xs text-slate-600">{tmpl.description}</p>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Sections ({tmpl.sections.length}):</p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {tmpl.sections.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <span className="text-indigo-600 font-bold">{i + 1}.</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-xs" size="sm"
                      onClick={() => {
                        const text = `${tmpl.name}\n\n${tmpl.sections.map((s, i) => `${i + 1}. ${s}\n[Your content here]\n`).join('\n')}`;
                        navigator.clipboard.writeText(text);
                        toast.success("Template copied!");
                      }}>
                      <Download className="w-3 h-3 mr-1" />Copy Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sample size guide */}
            <Card className="mt-6 bg-white border-2 border-amber-200">
              <CardHeader className="bg-amber-50 border-b">
                <CardTitle className="text-base">📐 Sample Size Calculation Guide</CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-sm space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-bold text-slate-900 mb-2">Key Parameters:</p>
                    <div className="space-y-2 text-xs">
                      {[
                        ["α (significance level)", "Usually 0.05 (two-tailed)"],
                        ["Power (1-β)", "Usually 80% or 90%"],
                        ["Effect size", "From pilot data or literature"],
                        ["Expected event rate", "For survival/binary outcomes"],
                        ["Attrition rate", "Add 10-20% for drop-outs"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-slate-100 pb-1">
                          <strong className="text-slate-800">{k}:</strong>
                          <span className="text-slate-600">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-2">Common Formulas:</p>
                    <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg font-mono">
                      <p><strong>Two proportions:</strong></p>
                      <p className="text-indigo-700">n = (Z_α/2 + Z_β)² × (p1(1-p1) + p2(1-p2)) / (p1-p2)²</p>
                      <p className="mt-2"><strong>Two means:</strong></p>
                      <p className="text-indigo-700">n = 2σ²(Z_α/2 + Z_β)² / δ²</p>
                      <p className="mt-2 text-slate-600">Use G*Power, OpenEpi, or PS software</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}