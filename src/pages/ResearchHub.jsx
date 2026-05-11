import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database, Brain, FileText, Layers, Sparkles, BookOpen,
  BarChart3, Users, Calculator, FlaskConical, Target, Shield,
  GitBranch, Download, TrendingUp, Microscope, FileBarChart, Upload, Crown, Lock
} from "lucide-react";
import { usePremiumGate } from "@/lib/usePremiumGate";

import ResearchMethodsContent from "../components/research/ResearchMethodsContent";
import KnowledgeBase from "../components/research/KnowledgeBase";
import ResearchOSWorkspace from "../components/research/ResearchOSWorkspace";
import LiteratureSearch from "../components/research/LiteratureSearch";
import StatisticalAnalysis from "../components/research/StatisticalAnalysis";
import ResearchContinuationWorkspace from "../components/research/ResearchContinuationWorkspace";
import BiostatisticsAcademy from "../components/research/BiostatisticsAcademy";

// ─── Quick Reference Tools ─────────────────────────────────────────────────
function QuickToolsPanel() {
  const tools = [
    {
      title: "Study Design Guide",
      desc: "RCT, Cohort, Cross-sectional — when to use each",
      icon: GitBranch,
      color: "bg-indigo-50 border-indigo-200",
      iconColor: "text-indigo-600",
      link: null
    },
    {
      title: "Sample Size Calculator",
      desc: "Two proportions, two means — built into Study Builder",
      icon: Calculator,
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
      link: null
    },
    {
      title: "Statistical Test Selector",
      desc: "Chi-square, t-test, ANOVA, regression — pick the right test",
      icon: BarChart3,
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
      link: null
    },
    {
      title: "STROBE Checklist",
      desc: "Observational study reporting checklist — 22 items",
      icon: FileText,
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      link: null
    },
    {
      title: "CONSORT Checklist",
      desc: "RCT reporting checklist — CONSORT 2010 extension",
      icon: Shield,
      color: "bg-teal-50 border-teal-200",
      iconColor: "text-teal-600",
      link: null
    },
    {
      title: "PRISMA Checklist",
      desc: "Systematic review/meta-analysis reporting — PRISMA 2020",
      icon: Layers,
      color: "bg-rose-50 border-rose-200",
      iconColor: "text-rose-600",
      link: null
    },
    {
      title: "Journal Impact Factors",
      desc: "Top nephrology + pediatrics journals ranked by IF",
      icon: TrendingUp,
      color: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-600",
      link: null
    },
    {
      title: "Bias Assessment Tools",
      desc: "Cochrane RoB, NOS, GRADE — built into protocol builder",
      icon: Microscope,
      color: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600",
      link: null
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {tools.map(t => {
          const Icon = t.icon;
          return (
            <Card key={t.title} className={`border-2 ${t.color} hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <Icon className={`w-6 h-6 ${t.iconColor} mb-2`} />
                <h3 className="font-semibold text-sm text-slate-900 mb-1">{t.title}</h3>
                <p className="text-xs text-slate-600">{t.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
        <p className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> All tools are available inside Research OS
        </p>
        <p className="text-xs text-indigo-700">
          Go to the <strong>Research OS</strong> tab → select a project → access study builder, eligibility engine, CRF, analytics, and manuscript studio in a unified workspace.
        </p>
      </div>
    </div>
  );
}

// ─── Reporting Guidelines Panel ────────────────────────────────────────────
function ReportingGuidelinesPanel() {
  const GUIDELINES = [
    {
      name: "STROBE", full: "Strengthening the Reporting of Observational Studies in Epidemiology",
      year: 2007, items: 22, type: "Observational",
      link: "https://www.strobe-statement.org",
      sections: ["Title & Abstract", "Introduction", "Methods (Study design, Setting, Participants, Variables, Data sources, Bias, Study size, Statistical methods)", "Results (Participants, Descriptive data, Outcome data, Main results, Other analyses)", "Discussion (Key results, Limitations, Interpretation, Generalisability)", "Funding"],
      key: "Exposure, confounders, effect modifiers must be clearly defined"
    },
    {
      name: "CONSORT", full: "Consolidated Standards of Reporting Trials",
      year: 2010, items: 25, type: "RCT",
      link: "https://www.consort-statement.org",
      sections: ["Title & Abstract", "Introduction (Background)", "Methods (Participants, Interventions, Outcomes, Randomisation, Blinding, Statistical methods)", "Results (Participant flow, Recruitment, Baseline data, Numbers analysed, Outcomes, Ancillary analyses, Harms)", "Discussion", "Other information (Registration, Protocol, Funding)"],
      key: "CONSORT flow diagram mandatory — show screening, randomization, follow-up, analysis numbers"
    },
    {
      name: "PRISMA", full: "Preferred Reporting Items for Systematic Reviews and Meta-Analyses",
      year: 2020, items: 27, type: "Systematic Review / Meta-analysis",
      link: "https://www.prisma-statement.org",
      sections: ["Title", "Abstract", "Introduction", "Methods (Eligibility, Sources, Search, Selection, Data collection, Data items, Risk of bias, Effect measures, Synthesis methods, Reporting bias, Certainty assessment)", "Results (Study selection, Study characteristics, Risk of bias, Individual studies, Synthesis, Reporting biases, Certainty of evidence)", "Discussion", "Other"],
      key: "PRISMA flow diagram mandatory — records identified, screened, eligible, included"
    },
    {
      name: "STARD", full: "Standards for Reporting Diagnostic Accuracy Studies",
      year: 2015, items: 30, type: "Diagnostic Accuracy",
      link: "https://www.stard-statement.org",
      sections: ["Title, abstract", "Introduction", "Methods (Study design, Participants, Test methods, Analysis)", "Results", "Discussion"],
      key: "Report sensitivity, specificity, PPV, NPV, AUC with 95% CI"
    },
    {
      name: "CARE", full: "Case Reports",
      year: 2013, items: 13, type: "Case Report / Series",
      link: "https://www.care-statement.org",
      sections: ["Title", "Abstract", "Introduction", "Patient information", "Clinical findings", "Timeline", "Diagnostic assessment", "Therapeutic interventions", "Follow-up and outcomes", "Discussion", "Patient perspective", "Informed consent"],
      key: "Patient consent and anonymization mandatory"
    },
  ];

  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
        {GUIDELINES.map(g => (
          <button key={g.name} onClick={() => setSelected(selected?.name === g.name ? null : g)}
            className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${selected?.name === g.name ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-300"}`}>
            <div className="font-bold text-lg text-indigo-700 mb-1">{g.name}</div>
            <Badge variant="outline" className="text-xs mb-2">{g.type}</Badge>
            <div className="text-xs text-slate-600">{g.items} items · {g.year}</div>
          </button>
        ))}
      </div>

      {selected && (
        <Card className="border-2 border-indigo-200">
          <CardHeader className="pb-2 bg-indigo-50">
            <CardTitle className="text-base text-indigo-900">{selected.name} — {selected.full}</CardTitle>
            <div className="flex gap-2">
              <Badge>{selected.type}</Badge>
              <Badge variant="outline">{selected.items} checklist items</Badge>
              <a href={selected.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Official website →</a>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs font-bold text-amber-700 mb-3 p-2 bg-amber-50 rounded-lg">⭐ Key Point: {selected.key}</p>
            <div className="grid md:grid-cols-2 gap-2">
              {selected.sections.map((s, i) => (
                <div key={i} className="flex gap-2 text-xs p-2 bg-slate-50 rounded-lg">
                  <span className="text-indigo-500 font-bold shrink-0">{i + 1}.</span>
                  <span className="text-slate-700">{s}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Pediatric Nephrology Templates ────────────────────────────────────────
function TemplatesPanel() {
  const TEMPLATES = [
    { condition: "AKI", type: "Cohort", title: "Acute Kidney Injury in Critically Ill Children — Incidence & Outcomes", pico: { population: "Children 1-18y admitted to PICU", intervention: "AKI (KDIGO staging)", comparison: "No AKI", outcome: "28-day mortality, RRT requirement, hospital stay" } },
    { condition: "CKD", type: "CrossSectional", title: "Prevalence of Malnutrition in Children with CKD — A Cross-Sectional Study", pico: { population: "Children 1-18y with CKD Stage 2-5", intervention: "Nutritional assessment (PYMS, anthropometry)", comparison: "Age-matched healthy controls", outcome: "Prevalence of malnutrition, growth stunting" } },
    { condition: "Nephrotic", type: "RCT", title: "Levamisole vs Mycophenolate in FRNS — A Randomized Controlled Trial", pico: { population: "Children 1-12y with frequently relapsing nephrotic syndrome", intervention: "Levamisole 2.5 mg/kg alternate days", comparison: "Mycophenolate mofetil 600 mg/m²/day", outcome: "Relapse rate at 12 months" } },
    { condition: "Dialysis", type: "Cohort", title: "Peritoneal Dialysis Outcomes in Pediatric ESRD — A Single-Center Experience", pico: { population: "Children <18y on chronic PD", intervention: "PD therapy (CCPD/CAPD)", comparison: "HD (if comparative)", outcome: "Technique survival, growth, peritonitis episodes" } },
    { condition: "Hypertension", type: "CaseControl", title: "Risk Factors for Hypertension in CKD Children — A Case-Control Study", pico: { population: "Children 1-18y with CKD", intervention: "Hypertension (BP >95th percentile)", comparison: "Normotensive CKD children", outcome: "Risk factors: GFR, proteinuria, anemia, obesity" } },
    { condition: "Electrolytes", type: "CrossSectional", title: "Prevalence of Hyponatremia in Hospitalized Children — A Tertiary Care Study", pico: { population: "Hospitalized children 1-18y", intervention: "Serum sodium <135 mEq/L", comparison: "Normonatremic children", outcome: "Prevalence, etiology, outcomes" } },
  ];

  const [applying, setApplying] = useState(null);

  const applyTemplate = async (tpl) => {
    setApplying(tpl.condition);
    try {
      const user = await base44.auth.me();
      await base44.entities.ResearchProject.create({
        title: tpl.title,
        study_type: tpl.type,
        pico: tpl.pico,
        owner_email: user.email,
        status: "Draft",
        current_step: 0,
        completed_steps: [],
        total_enrolled: 0,
        included_patients: [],
        tags: [tpl.condition, "Pediatric Nephrology"],
      });
      window.location.reload();
    } catch {
      alert("Failed to create from template");
    } finally {
      setApplying(null);
    }
  };

  const COND_COLORS = {
    AKI: "bg-red-50 border-red-200",
    CKD: "bg-blue-50 border-blue-200",
    Nephrotic: "bg-purple-50 border-purple-200",
    Dialysis: "bg-cyan-50 border-cyan-200",
    Hypertension: "bg-orange-50 border-orange-200",
    Electrolytes: "bg-green-50 border-green-200",
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Pre-built pediatric nephrology study templates. Click "Use Template" to create a project with pre-filled PICO, design, and objectives.</p>
      <div className="grid md:grid-cols-2 gap-3">
        {TEMPLATES.map(tpl => (
          <Card key={tpl.condition} className={`border-2 ${COND_COLORS[tpl.condition]} hover:shadow-md transition-shadow`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <Badge variant="outline" className="text-xs mb-1">{tpl.condition} · {tpl.type}</Badge>
                  <h3 className="font-semibold text-sm text-slate-900">{tpl.title}</h3>
                </div>
              </div>
              <div className="space-y-1 mb-3 text-xs text-slate-600">
                <div><span className="font-semibold text-slate-700">P:</span> {tpl.pico.population}</div>
                <div><span className="font-semibold text-slate-700">O:</span> {tpl.pico.outcome}</div>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => applyTemplate(tpl)} disabled={applying === tpl.condition}>
                {applying === tpl.condition ? "Creating..." : "Use Template → Open in Research OS"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ResearchHub() {
  const { data: projects = [] } = useQuery({
    queryKey: ["hub-projects-count"],
    queryFn: () => base44.entities.ResearchProject.list("-created_date", 50)
  });

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const gate = usePremiumGate(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 px-6 py-8 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Database className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Research Hub</h1>
              <p className="text-purple-100">Integrated Clinical Research Ecosystem — Pediatric Nephrology</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Badge className="bg-white/20 backdrop-blur text-white">Adaptive Methodology Engine</Badge>
            <Badge className="bg-white/20 backdrop-blur text-white">Import & Continue</Badge>
            <Badge className="bg-white/20 backdrop-blur text-white">11 Study Classifiers</Badge>
            <Badge className="bg-white/20 backdrop-blur text-white">Reporting Tracker</Badge>
            <Badge className="bg-white/20 backdrop-blur text-white">Live DB Sync</Badge>
            <Badge className="bg-white/20 backdrop-blur text-white">{projects.length} Projects</Badge>
            {gate.isAdmin ? (
              <Badge className="bg-amber-400/90 text-amber-900 gap-1 font-semibold">
                <Crown className="w-3 h-3" />Premium Unlocked
              </Badge>
            ) : (
              <Badge className="bg-white/10 text-white/70 gap-1 border border-white/20">
                <Lock className="w-3 h-3" />Premium features locked
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="os" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 text-xs">
            <TabsTrigger value="os" className="gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" />Research OS
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-1.5">
              <Upload className="w-3.5 h-3.5" />Import & Continue
            </TabsTrigger>
            <TabsTrigger value="methods" className="gap-1.5">
              <Brain className="w-3.5 h-3.5" />Methods
            </TabsTrigger>
            <TabsTrigger value="biostat" className="gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />Biostatistics
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-1.5">
              <Calculator className="w-3.5 h-3.5" />Tools
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" />Templates
            </TabsTrigger>
            <TabsTrigger value="reporting" className="gap-1.5">
              <FileBarChart className="w-3.5 h-3.5" />Reporting
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />Knowledge
            </TabsTrigger>
          </TabsList>

          {/* ── Research OS ── */}
          <TabsContent value="os">
            <Card className="shadow-xl border-2 border-indigo-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b py-3 px-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FlaskConical className="w-5 h-5 text-indigo-600" />
                  Research OS — Advanced Workflow Engine
                  <Badge className="bg-indigo-100 text-indigo-700 ml-auto">Live DB Sync</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ResearchOSWorkspace />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Import & Continue ── */}
          <TabsContent value="import">
            <Card className="shadow-xl border-2 border-purple-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b py-3 px-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Upload className="w-5 h-5 text-purple-600" />
                  Import & Continue Research
                  <Badge className="bg-purple-100 text-purple-700 ml-auto">AI Document Understanding</Badge>
                </CardTitle>
                <p className="text-xs text-slate-500">Upload an existing protocol, manuscript, or thesis — AI will analyze it and help you continue from where you left off.</p>
              </CardHeader>
              <CardContent className="p-4">
                <ResearchContinuationWorkspace />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Methods Guide ── */}
          <TabsContent value="methods">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />Study Design & Methods Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResearchMethodsContent />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Biostatistics Academy ── */}
          <TabsContent value="biostat">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />Biostatistics Visual Academy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <BiostatisticsAcademy />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Quick Tools ── */}
          <TabsContent value="tools">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />Quick Research Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <QuickToolsPanel />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Templates ── */}
          <TabsContent value="templates">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />Pediatric Nephrology Study Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <TemplatesPanel />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Reporting Guidelines ── */}
          <TabsContent value="reporting">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="w-5 h-5 text-green-600" />Reporting Guidelines (STROBE / CONSORT / PRISMA / STARD / CARE)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ReportingGuidelinesPanel />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Knowledge Base ── */}
          <TabsContent value="knowledge">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />Research Knowledge Base
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <KnowledgeBase />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}