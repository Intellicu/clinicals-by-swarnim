import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Activity, Brain, Calculator, BookOpen, AlertCircle, Camera,
  FileText, Stethoscope, Microscope, Droplet, Zap, Heart,
  Dna, Pill, Users, GraduationCap, Layers, ChevronDown, ChevronUp,
  TestTube, Beaker, Wind, Waves, Baby, Shield, ClipboardList,
  Star, ChevronRight
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Section data
// ─────────────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "ai",
    label: "AI Analysers",
    icon: Brain,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    tools: [
      { name: "Uroflow AI", icon: Activity, page: "UrologyNephrologyHub", color: "bg-teal-600" },
      { name: "UDS AI", icon: Waves, page: "UrologyNephrologyHub", color: "bg-teal-700" },
      { name: "Tubular AI", icon: Beaker, page: "UrologyNephrologyHub", color: "bg-slate-600" },
      { name: "Renal Biopsy AI", icon: Microscope, page: "RareDiseaseModule", color: "bg-violet-700" },
      { name: "Proteinuria AI", icon: TestTube, page: "Proteinuria", color: "bg-cyan-600" },
      { name: "Electrolyte AI", icon: Zap, page: "ClinicalAIHub", color: "bg-amber-600" },
      { name: "AKI AI", icon: AlertCircle, page: "ClinicalAIHub", color: "bg-red-600" },
      { name: "Literature AI", icon: BookOpen, page: "ResearchMethodsHub", color: "bg-emerald-700" },
      { name: "Fabry Screener", icon: Dna, page: "RareDiseaseModule", color: "bg-purple-700" },
      { name: "Rare Disease AI", icon: Brain, page: "RareDiseaseModule", color: "bg-indigo-700" },
    ],
  },
  {
    id: "scan",
    label: "Smart Scan (OCR)",
    icon: Camera,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    tools: [
      { name: "Scan Lab Report", icon: Microscope, page: "Hub", color: "bg-blue-600" },
      { name: "Scan Prescription", icon: Pill, page: "Hub", color: "bg-purple-600" },
      { name: "Scan Urine Report", icon: TestTube, page: "Hub", color: "bg-teal-600" },
      { name: "Scan Histopath", icon: Layers, page: "RareDiseaseModule", color: "bg-rose-700" },
      { name: "Scan Biopsy", icon: Microscope, page: "GlomerularDiseases", color: "bg-pink-700" },
    ],
  },
  {
    id: "monitoring",
    label: "Monitoring Tools",
    icon: Activity,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    tools: [
      { name: "NS Monitoring", icon: Droplet, page: "MonitoringHub", color: "bg-purple-600" },
      { name: "AKI Monitoring", icon: AlertCircle, page: "MonitoringHub", color: "bg-red-600" },
      { name: "CKD Monitoring", icon: Activity, page: "MonitoringHub", color: "bg-blue-600" },
      { name: "BP Monitoring", icon: Heart, page: "BPPercentiles", color: "bg-rose-600" },
      { name: "Growth Monitoring", icon: Baby, page: "Anthropometry", color: "bg-green-600" },
      { name: "Dialysis Monitoring", icon: Waves, page: "RRTAssistant", color: "bg-indigo-600" },
      { name: "Fluid Monitoring", icon: Droplet, page: "FluidCalculator", color: "bg-cyan-600" },
      { name: "Transplant Monitoring", icon: Shield, page: "ClinicalSupport", color: "bg-emerald-700" },
      { name: "Neurogenic Bladder", icon: Brain, page: "UrologyNephrologyHub", color: "bg-teal-700" },
    ],
  },
  {
    id: "docs",
    label: "Documentation",
    icon: FileText,
    color: "text-slate-600",
    bg: "bg-slate-50 border-slate-200",
    tools: [
      { name: "Discharge Summary", icon: FileText, page: "DischargeSummary", color: "bg-slate-700" },
      { name: "Follow-up Notes", icon: ClipboardList, page: "ClinicOPDCockpit", color: "bg-blue-700" },
      { name: "Dialysis Notes", icon: Droplet, page: "RRTAssistant", color: "bg-indigo-700" },
      { name: "Counseling Notes", icon: Users, page: "AIPrescriber", color: "bg-teal-700" },
      { name: "Admission Orders", icon: ClipboardList, page: "AdmissionOrders", color: "bg-amber-700" },
      { name: "Quick Documentation", icon: FileText, page: "ClinicalOS", color: "bg-slate-600" },
    ],
  },
  {
    id: "education",
    label: "Patient & Family Education",
    icon: GraduationCap,
    color: "text-teal-600",
    bg: "bg-teal-50 border-teal-200",
    tools: [
      { name: "Disease Education", icon: BookOpen, page: "PatientEducationHub", color: "bg-teal-600" },
      { name: "Diet Advice", icon: Layers, page: "NutritionHub", color: "bg-green-600" },
      { name: "Medication Counseling", icon: Pill, page: "AIPrescriber", color: "bg-purple-600" },
      { name: "Fluid Restriction", icon: Droplet, page: "NutritionHub", color: "bg-blue-600" },
      { name: "Dialysis Education", icon: Waves, page: "RRTAssistant", color: "bg-indigo-600" },
    ],
  },
  {
    id: "calcs",
    label: "Calculator Hub",
    icon: Calculator,
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    tools: [
      { name: "Schwartz GFR", icon: Activity, page: "SchwartzGFR", color: "bg-blue-600" },
      { name: "BP Percentiles", icon: Heart, page: "BPPercentiles", color: "bg-rose-600" },
      { name: "AKI Stager", icon: AlertCircle, page: "AKIStager", color: "bg-red-600" },
      { name: "ABG / Acid-Base", icon: Wind, page: "ABGInterpreter", color: "bg-sky-600" },
      { name: "FENa", icon: TestTube, page: "FENaCalculator", color: "bg-indigo-600" },
      { name: "Anion Gap", icon: Calculator, page: "AnionGap", color: "bg-slate-700" },
      { name: "Fluid Calc", icon: Waves, page: "FluidCalculator", color: "bg-cyan-600" },
      { name: "Anthropometry", icon: Baby, page: "Anthropometry", color: "bg-green-600" },
      { name: "Sodium Corr.", icon: Droplet, page: "SodiumCalculator", color: "bg-blue-500" },
      { name: "K+ Calc", icon: Zap, page: "PotassiumCalculator", color: "bg-amber-600" },
      { name: "Kt/V", icon: Layers, page: "KtVCalculator", color: "bg-purple-600" },
      { name: "All Calculators →", icon: Calculator, page: "CalculatorsHub", color: "bg-slate-800" },
    ],
  },
  {
    id: "knowledge",
    label: "Knowledge & Pathways",
    icon: BookOpen,
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    tools: [
      { name: "Glomerular Diseases", icon: Microscope, page: "GlomerularDiseases", color: "bg-blue-700" },
      { name: "AKI Pathways", icon: AlertCircle, page: "AKIStager", color: "bg-red-600" },
      { name: "CKD Management", icon: Activity, page: "CKDStager", color: "bg-blue-600" },
      { name: "Tubular Disorders", icon: Beaker, page: "UrologyNephrologyHub", color: "bg-teal-700" },
      { name: "CAKUT & Urology", icon: Droplet, page: "UrologyNephrologyHub", color: "bg-blue-800" },
      { name: "UTI Module", icon: Microscope, page: "UrologyNephrologyHub", color: "bg-teal-600" },
      { name: "Neurogenic Bladder", icon: Brain, page: "UrologyNephrologyHub", color: "bg-indigo-700" },
      { name: "Hypertension", icon: Heart, page: "BPPercentiles", color: "bg-rose-600" },
      { name: "Dialysis Pathways", icon: Waves, page: "RRTAssistant", color: "bg-indigo-600" },
      { name: "Transplant", icon: Shield, page: "ClinicalSupport", color: "bg-green-700" },
      { name: "Electrolytes", icon: Zap, page: "ClinicalApproaches", color: "bg-amber-600" },
      { name: "Rare Diseases", icon: Dna, page: "RareDiseaseModule", color: "bg-violet-700" },
      { name: "Drugs & Dosing", icon: Pill, page: "DrugsDosing", color: "bg-purple-700" },
      { name: "Evidence Updates", icon: Star, page: "GuidelinesLibrary", color: "bg-emerald-700" },
      { name: "All Pathways →", icon: Layers, page: "ClinicalSupport", color: "bg-slate-800" },
    ],
  },
  {
    id: "emergency",
    label: "Emergency Tools",
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    tools: [
      { name: "Hyperkalemia", icon: Zap, page: "EmergencyHub", color: "bg-orange-600" },
      { name: "RPGN Protocol", icon: Microscope, page: "EmergencyHub", color: "bg-red-700" },
      { name: "AKI Emergency", icon: AlertCircle, page: "EmergencyHub", color: "bg-red-600" },
      { name: "Dialysis Triggers", icon: Waves, page: "EmergencyHub", color: "bg-indigo-700" },
      { name: "Pulmonary Edema", icon: Wind, page: "EmergencyHub", color: "bg-blue-700" },
      { name: "HTN Crisis", icon: Heart, page: "EmergencyHub", color: "bg-rose-700" },
      { name: "HUS / TMA", icon: Droplet, page: "EmergencyHub", color: "bg-red-800" },
      { name: "All Emergencies →", icon: AlertCircle, page: "EmergencyHub", color: "bg-slate-800" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
function ToolGrid({ tools }) {
  return (
    <div className="grid grid-cols-4 gap-2 pt-2">
      {tools.map(tool => {
        const Icon = tool.icon;
        return (
          <Link key={tool.name} to={createPageUrl(tool.page)}>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-300 active:scale-95 transition-all">
              <div className={`w-9 h-9 ${tool.color} rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-700 text-center leading-tight line-clamp-2">{tool.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function WorkspaceSection({ section, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = section.icon;
  return (
    <div className={`rounded-xl border ${section.bg} overflow-hidden`}>
      <button
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${section.color}`} />
          <span className={`text-sm font-bold ${section.color}`}>{section.label}</span>
          <span className="text-xs text-slate-400">{section.tools.length}</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400" />
          : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-3 pb-3">
          <ToolGrid tools={section.tools} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ClinicalWorkspace() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden pb-24">
      <div className="max-w-2xl mx-auto px-3 py-3 space-y-3">

        {/* Header */}
        <div className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 px-4 py-3 shadow">
          <h1 className="text-base font-bold text-white">Clinical Workspace</h1>
          <p className="text-slate-300 text-xs">All tools, analyzers & pathways in one place</p>
        </div>

        {/* Quick links row */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {[
            { label: "Home", page: "Hub", color: "bg-blue-600" },
            { label: "Emergency", page: "EmergencyHub", color: "bg-red-600" },
            { label: "Calculators", page: "CalculatorsHub", color: "bg-green-700" },
            { label: "Guidelines", page: "GuidelinesLibrary", color: "bg-amber-600" },
            { label: "Pathways", page: "ClinicalSupport", color: "bg-indigo-600" },
            { label: "Drugs", page: "DrugsDosing", color: "bg-purple-600" },
          ].map(q => (
            <Link key={q.label} to={createPageUrl(q.page)}>
              <span className={`flex-shrink-0 inline-flex px-3 py-1.5 rounded-full text-xs font-semibold text-white ${q.color} shadow-sm`}>
                {q.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Sections */}
        {SECTIONS.map((section, i) => (
          <WorkspaceSection key={section.id} section={section} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}