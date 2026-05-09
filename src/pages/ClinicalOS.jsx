import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity, Brain, Calculator, Shield, GitBranch, TrendingUp,
  BookOpen, Pill, Zap, Heart, ChevronRight, AlertTriangle, CheckCircle, Info, GitCompare, Award,
  Network, History, FileText
} from "lucide-react";
import DoseCalculatorPanel from "@/components/clinicalOS/DoseCalculatorPanel";
import PathwayExecutor from "@/components/clinicalOS/PathwayExecutor";
import BPCalculatorPanel from "@/components/clinicalOS/BPCalculatorPanel";
import LongitudinalTrendPanel from "@/components/clinicalOS/LongitudinalTrendPanel";
import SafetyAlertBanner from "@/components/clinicalOS/SafetyAlertBanner";
import GuidelineComparisonEngine from "@/components/clinicalOS/GuidelineComparisonEngine";
import { checkElectrolytes, getNephrotoxins } from "@/lib/clinicalOS/SafetyEngine";
import { getFactsForModule, getComparableFacts } from "@/lib/clinicalOS/ClinicalFactsRegistry";
import { GUIDELINE_HIERARCHY } from "@/lib/clinicalOS/EvidenceGovernance";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StructuredPrescriptionPanel from "@/components/clinicalOS/StructuredPrescriptionPanel.jsx";
import ClinicalKnowledgeGraphPanel from "@/components/clinicalOS/ClinicalKnowledgeGraphPanel.jsx";
import EvidenceVersioningPanel from "@/components/clinicalOS/EvidenceVersioningPanel.jsx";
import DifferentialDiagnosisPanel from "@/components/clinicalOS/DifferentialDiagnosisPanel.jsx";

const OS_MODULES = [
  { id: "facts", icon: BookOpen, label: "Clinical Facts Registry", color: "bg-blue-600", desc: "Canonical definitions" },
  { id: "dose", icon: Calculator, label: "Dynamic Dose Engine", color: "bg-green-600", desc: "Weight/BSA/renal-adjusted" },
  { id: "pathways", icon: GitBranch, label: "Pathway Executor", color: "bg-indigo-600", desc: "Executable workflows + DDx" },
  { id: "compare", icon: GitCompare, label: "Guideline Comparator", color: "bg-violet-600", desc: "Multi-org definitions" },
  { id: "safety", icon: Shield, label: "Safety Engine", color: "bg-red-600", desc: "Interactions + nephrotoxins" },
  { id: "bp", icon: Activity, label: "BP Percentile", color: "bg-rose-600", desc: "SBP + DBP · AAP 2017" },
  { id: "longitudinal", icon: TrendingUp, label: "Longitudinal Engine", color: "bg-teal-600", desc: "Trends + risk scoring" },
  { id: "hierarchy", icon: Award, label: "Evidence Hierarchy", color: "bg-amber-600", desc: "Primary guidelines by area" },
  { id: "prescriptions", icon: Pill, label: "Rx Templates", color: "bg-blue-500", desc: "Guideline-linked prescriptions" },
  { id: "knowledge", icon: Network, label: "Knowledge Graph", color: "bg-emerald-600", desc: "Disease-drug-gene-pathway" },
  { id: "ddx", icon: GitBranch, label: "DDx Engine", color: "bg-fuchsia-600", desc: "Differential diagnosis" },
  { id: "versioning", icon: History, label: "Evidence Versions", color: "bg-orange-600", desc: "Guideline timelines" },
];

const QUICK_REFS = [
  { icon: Zap, label: "NS Relapse = 3+ × 3 days", color: "text-purple-600", module: "Nephrotic Syndrome" },
  { icon: AlertTriangle, label: "K+ >6.5 = Calcium gluconate STAT", color: "text-red-600", module: "AKI" },
  { icon: Activity, label: "AKI RRT if fluid overload ≥20%", color: "text-orange-600", module: "AKI" },
  { icon: CheckCircle, label: "CKD target HCO₃⁻ ≥22 mmol/L", color: "text-blue-600", module: "CKD" },
  { icon: Heart, label: "CKD BP target <50th %ile (ESCAPE)", color: "text-pink-600", module: "Hypertension" },
  { icon: Pill, label: "Tacrolimus trough: AM blood BEFORE dose", color: "text-amber-600", module: "Transplant" },
];

export default function ClinicalOS() {
  const [activeModule, setActiveModule] = useState("dose");
  const [safetyLabs, setSafetyLabs] = useState({ serum_potassium: "", serum_sodium: "", hco3: "" });
  const [safetyAlerts, setSafetyAlerts] = useState([]);
  const [showNephrotoxins, setShowNephrotoxins] = useState(false);
  const [factsModule, setFactsModule] = useState("Nephrotic Syndrome");

  const nephrotoxins = getNephrotoxins();
  const nsFacts = getFactsForModule(factsModule);

  const runSafetyCheck = () => {
    const labs = {
      serum_potassium: parseFloat(safetyLabs.serum_potassium) || null,
      serum_sodium: parseFloat(safetyLabs.serum_sodium) || null,
      hco3: parseFloat(safetyLabs.hco3) || null,
    };
    const alerts = checkElectrolytes(labs);
    setSafetyAlerts(alerts);
  };

  const FACTS_MODULES = ["Nephrotic Syndrome", "AKI", "CKD", "Hypertension", "Dialysis", "Transplant", "Electrolytes"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-4 py-5 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Pediatric Nephrology Clinical OS</h1>
              <p className="text-blue-200 text-xs">Interconnected clinical intelligence engine · Evidence-grounded · Bedside-ready</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {["ISPN 2023", "IPNA 2021", "AAP 2017", "KDIGO 2012", "ISPD 2019", "ERKNet 2021", "Multi-Org Comparison", "Expert-Governed"].map(l => (
              <Badge key={l} className="bg-white/15 text-white border-0 text-xs">{l}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 py-4 space-y-4">

        {/* Quick Reference Facts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUICK_REFS.map((r, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 flex items-start gap-2 shadow-sm">
              <r.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${r.color}`} />
              <p className="text-xs text-slate-700 leading-snug font-medium">{r.label}</p>
            </div>
          ))}
        </div>

        {/* Module Navigation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">OS Modules</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
            {OS_MODULES.map(m => (
              <button key={m.id} onClick={() => setActiveModule(m.id)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all text-center ${activeModule === m.id ? "bg-slate-900 text-white shadow-lg scale-105" : "hover:bg-slate-50 text-slate-600"}`}>
                <div className={`w-8 h-8 rounded-lg ${activeModule === m.id ? "bg-white/20" : m.color} flex items-center justify-center`}>
                  <m.icon className={`w-4 h-4 ${activeModule === m.id ? "text-white" : "text-white"}`} />
                </div>
                <span className="text-xs font-semibold leading-tight">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Module Content */}
        {activeModule === "dose" && <DoseCalculatorPanel />}
        {activeModule === "pathways" && <PathwayExecutor />}
        {activeModule === "bp" && <BPCalculatorPanel />}
        {activeModule === "longitudinal" && <LongitudinalTrendPanel />}

        {/* Guideline Comparison Engine */}
        {activeModule === "compare" && (
          <Card className="border-2 border-violet-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <GitCompare className="w-5 h-5 text-violet-600" />
                Guideline Comparison Engine
                <Badge className="ml-auto bg-violet-600 text-white text-xs">Multi-Org</Badge>
              </CardTitle>
              <p className="text-xs text-violet-600 mt-0.5">Side-by-side definition comparison — ISPN vs IPNA vs KDIGO</p>
            </CardHeader>
            <CardContent className="p-4">
              <GuidelineComparisonEngine />
            </CardContent>
          </Card>
        )}

        {/* Evidence Hierarchy Panel */}
        {activeModule === "hierarchy" && (
          <Card className="border-2 border-amber-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="w-5 h-5 text-amber-600" />
                Primary Operational Guideline Hierarchy
                <Badge className="ml-auto bg-amber-600 text-white text-xs">Evidence Source</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {Object.entries(GUIDELINE_HIERARCHY).map(([area, h]) => (
                <div key={area} className="bg-white border border-slate-200 rounded-xl p-3">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-700 capitalize">{area.replace(/_/g, " ")}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded font-bold">{h.primary.org} {h.primary.year}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-1.5 italic">{h.rationale}</p>
                  {h.supporting?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-slate-400 font-semibold">Supporting:</span>
                      {h.supporting.map((s, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s.org} {s.year}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Clinical Facts Registry */}
        {activeModule === "facts" && (
          <Card className="border-2 border-blue-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Clinical Facts Registry
                <Badge className="ml-auto bg-blue-600 text-white text-xs">Canonical Definitions</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-1.5 flex-wrap">
                {FACTS_MODULES.map(m => (
                  <button key={m} onClick={() => setFactsModule(m)}
                    className={`px-2.5 py-1 text-xs rounded-full font-semibold border transition-colors ${factsModule === m ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                    {m}
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {nsFacts.map(fact => (
                  <div key={fact.id} className="bg-white border border-slate-200 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">{fact.term}</span>
                      <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                        <Badge className="text-xs bg-blue-600 text-white border-0">{fact.primary_source?.split(" ")[0] || fact.source?.split(" / ")[0]}</Badge>
                        <Badge className="text-xs bg-green-100 text-green-800 border-0">Grade {fact.evidence_grade}</Badge>
                        {fact.emergency && <Badge className="text-xs bg-red-600 text-white border-0">⚡ EMERGENCY</Badge>}
                        {fact.comparison_available && (
                          <button onClick={() => setActiveModule("compare")}
                            className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded hover:bg-violet-200 transition-colors font-medium">
                            Compare ↗
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{fact.definition}</p>
                    {fact.canonical_value && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {Object.entries(fact.canonical_value).map(([k, v]) => (
                          <span key={k} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                            {k.replace(/_/g, " ")}: <strong>{v}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                    {fact.notes && (
                      <p className="text-xs text-amber-700 mt-1.5 italic leading-relaxed border-t border-slate-100 pt-1.5">{fact.notes}</p>
                    )}
                  </div>
                ))}
                {nsFacts.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-6">No facts defined for this module yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Safety Engine */}
        {activeModule === "safety" && (
          <Card className="border-2 border-red-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-5 h-5 text-red-600" />
                Safety Engine — Nephrology
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">

              {/* Electrolyte Safety Check */}
              <div>
                <p className="text-xs font-bold text-slate-600 mb-2">Electrolyte Safety Check</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { key: "serum_potassium", label: "K+ (mmol/L)" },
                    { key: "serum_sodium", label: "Na+ (mmol/L)" },
                    { key: "hco3", label: "HCO₃⁻ (mmol/L)" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-slate-400 block mb-0.5">{f.label}</label>
                      <input type="number" value={safetyLabs[f.key]}
                        onChange={e => setSafetyLabs(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                    </div>
                  ))}
                </div>
                <Button onClick={runSafetyCheck} size="sm" className="bg-red-600 hover:bg-red-700 w-full">
                  <Shield className="w-3.5 h-3.5 mr-1.5" /> Run Safety Check
                </Button>
                {safetyAlerts.length > 0 && (
                  <div className="mt-3">
                    <SafetyAlertBanner alerts={safetyAlerts} onDismiss={i => setSafetyAlerts(prev => prev.filter((_, idx) => idx !== i))} />
                  </div>
                )}
                {safetyAlerts.length === 0 && safetyLabs.serum_potassium && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <CheckCircle className="w-4 h-4" /> No electrolyte alerts — values within safe range
                  </div>
                )}
              </div>

              {/* Nephrotoxin Reference */}
              <div>
                <button onClick={() => setShowNephrotoxins(!showNephrotoxins)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700 w-full">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Nephrotoxin Reference ({nephrotoxins.length} drugs)
                  <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${showNephrotoxins ? "rotate-90" : ""}`} />
                </button>
                {showNephrotoxins && (
                  <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto">
                    {nephrotoxins.map((n, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 bg-white border border-slate-200 rounded-xl text-xs">
                        <Badge className={`flex-shrink-0 text-xs border-0 ${n.risk === "CRITICAL" ? "bg-red-600 text-white" : n.risk === "HIGH" ? "bg-orange-500 text-white" : "bg-amber-400 text-slate-900"}`}>
                          {n.risk}
                        </Badge>
                        <div>
                          <p className="font-bold text-slate-900">{n.drug}</p>
                          <p className="text-slate-500 mt-0.5">{n.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        )}

        {/* Prescription Templates */}
        {activeModule === "prescriptions" && (
          <Card className="border-2 border-blue-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="w-5 h-5 text-blue-600" />Structured Prescription Templates
                <Badge className="ml-auto bg-blue-600 text-white text-xs">Evidence-Linked</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {["Nephrotic Syndrome", "Hypertension", "Dialysis"].map(cat => (
                <div key={cat} className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{cat}</p>
                  <StructuredPrescriptionPanel category={cat} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Knowledge Graph */}
        {activeModule === "knowledge" && (
          <Card className="border-2 border-emerald-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Network className="w-5 h-5 text-emerald-600" />Clinical Knowledge Graph
                <Badge className="ml-auto bg-emerald-600 text-white text-xs">Disease · Drug · Gene · Biopsy</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ClinicalKnowledgeGraphPanel />
            </CardContent>
          </Card>
        )}

        {/* DDx Engine */}
        {activeModule === "ddx" && (
          <Card className="border-2 border-fuchsia-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-fuchsia-50 to-purple-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <GitBranch className="w-5 h-5 text-fuchsia-600" />Differential Diagnosis Engine
                <Badge className="ml-auto bg-fuchsia-600 text-white text-xs">Symptom-Driven</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <DifferentialDiagnosisPanel />
            </CardContent>
          </Card>
        )}

        {/* Evidence Versioning */}
        {activeModule === "versioning" && (
          <Card className="border-2 border-orange-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="w-5 h-5 text-orange-600" />Evidence Versioning
                <Badge className="ml-auto bg-orange-600 text-white text-xs">Guideline Timelines</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <EvidenceVersioningPanel />
            </CardContent>
          </Card>
        )}

        {/* Integration Links */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { to: createPageUrl("Guidelines"), icon: BookOpen, label: "Guidelines Library", color: "bg-blue-50 border-blue-200 text-blue-700" },
            { to: createPageUrl("ClinicalSupport"), icon: GitBranch, label: "Clinical Pathways", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
            { to: createPageUrl("DrugsDosing"), icon: Pill, label: "Drugs & Dosing", color: "bg-green-50 border-green-200 text-green-700" },
            { to: createPageUrl("EmergencyHub"), icon: Zap, label: "Emergency Hub", color: "bg-red-50 border-red-200 text-red-700" },
          ].map(link => (
            <Link key={link.to} to={link.to}>
              <div className={`flex items-center gap-2.5 p-3 rounded-xl border-2 hover:shadow-md transition-all ${link.color}`}>
                <link.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">{link.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
              </div>
            </Link>
          ))}
        </div>

        {/* Architecture Info */}
        <Card className="border border-slate-200 bg-slate-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">Clinical OS Architecture</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                         <strong>Evidence Governance:</strong> Multi-org definitions (ISPN/IPNA/KDIGO) with comparison engine. Primary guideline hierarchy per clinical area. Expert review workflow with audit trail. AI content governance with approval queue. <strong>BP Engine:</strong> Separate SBP + DBP percentiles; overall classification = higher of two (AAP 2017 operational logic). <strong>Facts Registry:</strong> Org-specific definitions with comparison links. All engines importable by any module.
                      </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}