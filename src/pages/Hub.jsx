import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity, Calculator, FileText, Heart, Droplet, Pill, LineChart,
  BookOpen, Stethoscope, TestTube, Baby, Zap, Sparkles, Brain,
  AlertCircle, GraduationCap, TrendingUp, Layers, FlaskConical,
  ClipboardList, Waves, Microscope, GitBranch, Users, Dna,
  ChevronDown, ChevronRight, WifiOff, Wifi, Settings,
  Star, Clock, Search, UtensilsCrossed, Beaker, Wind, Shield
} from "lucide-react";
import { useOnlineStatus } from "../components/OfflineDataManager";

// ── Section definitions ────────────────────────────────────────────────────

const QUICK_ACCESS = [
  { name: "Schwartz GFR", icon: Activity, color: "bg-blue-600", page: "SchwartzGFR" },
  { name: "BP Percentiles", icon: Heart, color: "bg-red-600", page: "BPPercentiles" },
  { name: "Emergency Hub", icon: AlertCircle, color: "bg-red-700", page: "EmergencyHub" },
  { name: "Guidelines", icon: BookOpen, color: "bg-blue-700", page: "Guidelines" },
  { name: "Drugs & Dosing", icon: Pill, color: "bg-purple-600", page: "DrugsDosing" },
  { name: "Differential Dx", icon: Brain, color: "bg-violet-700", page: "DifferentialEngine" },
];

const EMERGENCY_SHORTCUTS = [
  { name: "Hyperkalemia", page: "EmergencyHub", color: "bg-red-600" },
  { name: "HTN Emergency", page: "EmergencyHub", color: "bg-orange-600" },
  { name: "Pulmonary Edema", page: "EmergencyHub", color: "bg-red-700" },
  { name: "AKI Protocol", page: "AKIStager", color: "bg-amber-600" },
  { name: "NS Relapse", page: "ClinicalSupport", color: "bg-purple-600" },
  { name: "TLS Protocol", page: "EmergencyHub", color: "bg-rose-600" },
];

const SECTIONS = [
  {
    id: "knowledge",
    label: "Clinical Knowledge",
    icon: BookOpen,
    color: "blue",
    tools: [
      { name: "Guidelines Library", icon: BookOpen, page: "Guidelines", desc: "KDIGO, IPNA, ESPN, AAP, ISKDC" },
      { name: "Clinical Pathways", icon: GitBranch, page: "ClinicalSupport", desc: "25+ evidence-based protocols" },
      { name: "Clinical Approaches", icon: Stethoscope, page: "ClinicalApproaches", desc: "Structured diagnostic algorithms" },
      { name: "Differential Engine", icon: Brain, page: "DifferentialEngine", desc: "AI-ranked differentials" },
      { name: "Lab Pathways", icon: FlaskConical, page: "LabPathways", desc: "Water deprivation, UDS, acid-base" },
      { name: "Case Library", icon: BookOpen, page: "CaseLibrary", desc: "Interactive teaching cases" },
    ],
  },
  {
    id: "prescribing",
    label: "Prescribing & Monitoring",
    icon: Pill,
    color: "purple",
    tools: [
      { name: "AI Prescriber", icon: Sparkles, page: "AIPrescriber", desc: "AI-powered prescription with OCR" },
      { name: "Drugs & Dosing", icon: Pill, page: "DrugsDosing", desc: "Dose calc, renal adjust & Rx builder" },
      { name: "Monitoring Hub", icon: ClipboardList, page: "MonitoringHub", desc: "8+ clinical monitoring charts" },
      { name: "Admission Orders", icon: ClipboardList, page: "AdmissionOrders", desc: "AKI, NS, CKD, UTI order sets" },
      { name: "Discharge Summary", icon: FileText, page: "DischargeSummary", desc: "AI-generated summaries" },
      { name: "Prediction Tools", icon: LineChart, page: "PredictionTools", desc: "IgAN, CKiD, SRNS risk scores" },
    ],
  },
  {
    id: "calculators",
    label: "Calculators & Tools",
    icon: Calculator,
    color: "green",
    tools: [
      { name: "Schwartz GFR", icon: Activity, page: "SchwartzGFR", desc: "Height + creatinine GFR" },
      { name: "BP Percentiles", icon: Heart, page: "BPPercentiles", desc: "AAP 2017 pediatric BP charts" },
      { name: "Anthropometry", icon: Baby, page: "Anthropometry", desc: "Growth & nutrition assessment" },
      { name: "AKI Staging", icon: AlertCircle, page: "AKIStager", desc: "KDIGO AKI classification" },
      { name: "CKD Staging", icon: TrendingUp, page: "CKDStager", desc: "Classify chronic kidney disease" },
      { name: "Fluid Calculator", icon: Waves, page: "FluidCalculator", desc: "IV fluid prescriptions" },
      { name: "Sodium Calculator", icon: Droplet, page: "SodiumCalculator", desc: "Dysnatremia management" },
      { name: "Potassium Calc", icon: Zap, page: "PotassiumCalculator", desc: "K+ disorder management" },
      { name: "ABG Interpreter", icon: Wind, page: "ABGInterpreter", desc: "Blood gas analysis" },
      { name: "Anion Gap", icon: Calculator, page: "AnionGap", desc: "Acid-base analysis" },
      { name: "FENa Calculator", icon: TestTube, page: "FENaCalculator", desc: "Fractional excretion of sodium" },
      { name: "RRT Assistant", icon: Droplet, page: "RRTAssistant", desc: "HD & PD prescriptions" },
      { name: "Kt/V Calculator", icon: Calculator, page: "KtVCalculator", desc: "Dialysis adequacy" },
      { name: "Stone Risk", icon: Shield, page: "StoneRisk", desc: "Kidney stone evaluation" },
      { name: "Proteinuria", icon: TestTube, page: "Proteinuria", desc: "Protein assessment" },
    ],
  },
  {
    id: "academic",
    label: "Academic & Research",
    icon: GraduationCap,
    color: "indigo",
    tools: [
      { name: "Teaching Hub", icon: GraduationCap, page: "TeachingHub", desc: "Interactive learning with AI teacher" },
      { name: "Research Hub", icon: Layers, page: "ResearchHub", desc: "REDCap-style research platform" },
      { name: "AI Assistant", icon: Sparkles, page: "AIAssistant", desc: "AI clinical decision support" },
      { name: "Nutrition Hub", icon: UtensilsCrossed, page: "NutritionHub", desc: "Nephrotic & CKD diet plans" },
      { name: "General Pediatrics", icon: Baby, page: "PediatricsHub", desc: "Growth, Vaccination, IAP" },
      { name: "Genetic Analyzer", icon: Dna, page: "GeneticReportAnalyzer", desc: "AI genetic report analysis" },
      { name: "AI Lab Analyzer", icon: Microscope, page: "ClinicalAIHub", desc: "Lab result interpretation" },
      { name: "Patient Education", icon: BookOpen, page: "PatientEducation", desc: "Patient resources" },
    ],
  },
];

// ── Color map ──────────────────────────────────────────────────────────────
const COLORS = {
  blue:   { header: "from-blue-50 to-blue-100 border-blue-200", icon: "text-blue-600", badge: "bg-blue-100 text-blue-800", pill: "bg-blue-600" },
  purple: { header: "from-purple-50 to-purple-100 border-purple-200", icon: "text-purple-600", badge: "bg-purple-100 text-purple-800", pill: "bg-purple-600" },
  green:  { header: "from-green-50 to-green-100 border-green-200", icon: "text-green-700", badge: "bg-green-100 text-green-800", pill: "bg-green-600" },
  indigo: { header: "from-indigo-50 to-indigo-100 border-indigo-200", icon: "text-indigo-600", badge: "bg-indigo-100 text-indigo-800", pill: "bg-indigo-600" },
};

// ── Tool Card ──────────────────────────────────────────────────────────────
function ToolCard({ tool }) {
  const Icon = tool.icon;
  return (
    <Link to={createPageUrl(tool.page)}>
      <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all group">
        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
          <Icon className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-800 leading-tight">{tool.name}</p>
          <p className="text-xs text-slate-400 leading-tight truncate mt-0.5">{tool.desc}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
      </div>
    </Link>
  );
}

// ── Collapsible Section ────────────────────────────────────────────────────
function HubSection({ section, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const c = COLORS[section.color];
  const Icon = section.icon;

  return (
    <div className="rounded-2xl border overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${c.header} border-b transition-colors`}
      >
        <div className={`w-8 h-8 ${c.pill} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-800 text-sm flex-1 text-left">{section.label}</span>
        <Badge className={`${c.badge} border-0 text-xs mr-1`}>{section.tools.length}</Badge>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {section.tools.map(t => <ToolCard key={t.name} tool={t} />)}
        </div>
      )}
    </div>
  );
}

// ── Main Hub ───────────────────────────────────────────────────────────────
export default function Hub() {
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* ── Hero Header ── */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-4 pt-5 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">CliniCals Hub</h1>
              <p className="text-blue-200 text-xs mt-0.5">Pediatric Nephrology · Knowledge & Reference</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${isOnline ? "bg-green-400/20 text-green-100 border border-green-300/30" : "bg-amber-400/20 text-amber-100 border border-amber-300/30"}`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* Clinic Mode CTA */}
          <button
            onClick={() => navigate(createPageUrl("ClinicOPDCockpit"))}
            className="w-full flex items-center gap-3 bg-white/15 hover:bg-white/25 border border-white/30 rounded-2xl px-4 py-3 text-left transition-all"
          >
            <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Open Clinic Mode →</p>
              <p className="text-blue-200 text-xs">OPD queue · Patient charts · Prescriptions</p>
            </div>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">

        {/* ── Quick Access ── */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" />Quick Access
          </p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_ACCESS.map(t => {
              const Icon = t.icon;
              return (
                <Link key={t.name} to={createPageUrl(t.page)}>
                  <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className={`w-10 h-10 ${t.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{t.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Emergency Shortcuts ── */}
        <div>
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />Emergency Protocols
          </p>
          <div className="bg-white rounded-2xl border border-red-100 p-3">
            <div className="flex flex-wrap gap-2">
              {EMERGENCY_SHORTCUTS.map(s => (
                <button key={s.name} onClick={() => navigate(createPageUrl(s.page))}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold text-white ${s.color} hover:opacity-90 transition-opacity`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grouped Knowledge Sections ── */}
        {SECTIONS.map((s, i) => (
          <HubSection key={s.id} section={s} defaultOpen={i === 0} />
        ))}

        {/* ── Admin only: Clinical OS ── */}
        {isAdmin && (
          <div className="rounded-2xl border border-rose-200 overflow-hidden bg-white shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-rose-50 to-red-50 border-b border-rose-200">
              <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">Clinical OS</p>
                <p className="text-xs text-rose-600">Admin infrastructure · Governance · Rule engine</p>
              </div>
              <Badge className="bg-rose-100 text-rose-700 border-0 text-xs">Admin</Badge>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { name: "Clinical OS", icon: Brain, page: "ClinicalOS", desc: "Core orchestration engine" },
                { name: "OPD Cockpit", icon: Stethoscope, page: "ClinicOPDCockpit", desc: "Clinic operational hub" },
                { name: "Audit Logs", icon: FileText, page: "AuditLogs", desc: "Calculation history & tracking" },
                { name: "Content Manager", icon: FileText, page: "UserContentManager", desc: "Guidelines & templates" },
              ].map(t => <ToolCard key={t.name} tool={t} />)}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 pb-2">
          CliniCals by Swarnim · KDIGO · IPNA · ESPN · AAP · ISKDC · WHO · Bedside reference only
        </p>
      </div>
    </div>
  );
}