import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Activity, Droplet, Layers, Dna, TestTube, Brain,
  Settings, X, Plus, Check, GripVertical, AlertTriangle,
  Heart, Zap, Wind, Calculator, Pill, Microscope, BookOpen,
  FlaskConical, Stethoscope, TrendingUp, Star, Beaker, GitBranch
} from "lucide-react";

// ── All available quick-launch apps ──
export const ALL_QUICK_APPS = [
  { id: "rrt",        label: "RRT Assistant",         icon: Droplet,      color: "bg-indigo-600",  page: "RRTAssistant",          desc: "HD · PD · CRRT" },
  { id: "stone",      label: "Stone Analysis",         icon: Beaker,       color: "bg-amber-600",   page: "CalculatorsHub",        desc: "Renal stone risk" },
  { id: "biopsy",     label: "Biopsy AI",              icon: Layers,       color: "bg-violet-700",  page: "ClinicalAIHub",         desc: "Renal biopsy patterns", params: "?tab=biopsy" },
  { id: "genetics",   label: "Genetics AI",            icon: Dna,          color: "bg-violet-600",  page: "GeneticReportAnalyzer", desc: "Genetic report analysis" },
  { id: "uroflow",    label: "Uroflow AI",             icon: Activity,     color: "bg-teal-700",    page: "UrologyNephrologyHub",  desc: "Uroflowmetry analysis", params: "?tab=uroflow" },
  { id: "uds",        label: "Peds UDS",               icon: TestTube,     color: "bg-teal-600",    page: "ClinicalAIHub",         desc: "UDS Interpreter", params: "?tab=uds" },
  { id: "differential", label: "Differential Dx",      icon: Brain,        color: "bg-indigo-700",  page: "DifferentialEngine",    desc: "AI differential" },
  { id: "ai_prescriber", label: "AI Prescriber",       icon: Pill,         color: "bg-purple-600",  page: "AIPrescriber",          desc: "Smart Rx builder" },
  { id: "lab_ai",     label: "Lab AI",                 icon: Microscope,   color: "bg-rose-600",    page: "ClinicalAIHub",         desc: "Interpret labs", params: "?tab=labs" },
  { id: "emergency",  label: "Emergency Hub",          icon: AlertTriangle,color: "bg-red-600",     page: "EmergencyHub",          desc: "Protocols & resus" },
  { id: "bp_pct",     label: "BP Percentiles",         icon: Heart,        color: "bg-red-500",     page: "BPPercentiles",         desc: "AAP 2017 charts" },
  { id: "aki",        label: "AKI Stager",             icon: Zap,          color: "bg-orange-600",  page: "AKIStager",             desc: "KDIGO staging" },
  { id: "abg",        label: "ABG Interpreter",        icon: Wind,         color: "bg-rose-500",    page: "ABGInterpreter",        desc: "Acid-base analysis" },
  { id: "ckd",        label: "CKD Stager",             icon: TrendingUp,   color: "bg-blue-700",    page: "CKDStager",             desc: "KDIGO staging" },
  { id: "drugs",      label: "Drug Dosing",            icon: Pill,         color: "bg-purple-700",  page: "DrugsDosing",           desc: "Weight-based dosing" },
  { id: "guidelines", label: "Guidelines",             icon: BookOpen,     color: "bg-green-700",   page: "GuidelinesLibrary",     desc: "KDIGO · IPNA · IAP" },
  { id: "nutrition",  label: "Nutrition Hub",          icon: FlaskConical, color: "bg-green-600",   page: "NutritionHub",          desc: "Renal diet & growth" },
  { id: "procedures", label: "Procedures",             icon: Stethoscope,  color: "bg-slate-700",   page: "ProcedureHub",          desc: "Clinical procedures" },
  { id: "research",   label: "Research OS",            icon: Layers,       color: "bg-slate-600",   page: "ResearchOS",            desc: "Research platform" },
  { id: "case_lib",   label: "Case Library",           icon: BookOpen,     color: "bg-emerald-700", page: "CaseLibrary",           desc: "Clinical cases" },
  { id: "schwartz",   label: "Schwartz GFR",           icon: Calculator,   color: "bg-blue-600",    page: "SchwartzGFR",           desc: "Pediatric GFR" },
  { id: "fluids",     label: "Fluid Calculator",       icon: Droplet,      color: "bg-cyan-600",    page: "FluidCalculator",       desc: "Maintenance fluids" },
  { id: "tubular",    label: "Tubular Disorders",      icon: Beaker,       color: "bg-teal-800",    page: "TubularDisordersHub",   desc: "RTA · Tubular" },
  { id: "rare_disease", label: "Rare Disease",         icon: Dna,          color: "bg-indigo-800",  page: "RareDiseaseModule",     desc: "Rare dx module" },
  // ── Intelligence Engines ──
  { id: "eng_ns",       label: "NS Engine",            icon: GitBranch,    color: "bg-violet-600",  page: "ClinicalSupport",       desc: "Nephrotic Syndrome",    params: "?tab=pathways&scenario=ns-engine" },
  { id: "eng_hypo_na",  label: "Hyponatraemia Eng.",   icon: GitBranch,    color: "bg-cyan-600",    page: "ClinicalSupport",       desc: "Hyponatraemia Engine",  params: "?tab=pathways&scenario=hyponatremia-engine" },
  { id: "eng_rpgn",     label: "RPGN Engine",          icon: GitBranch,    color: "bg-red-700",     page: "ClinicalSupport",       desc: "Crescentic GN",         params: "?tab=pathways&scenario=rpgn-deep-engine" },
  { id: "eng_aki",      label: "AKI Engine",           icon: GitBranch,    color: "bg-red-600",     page: "ClinicalSupport",       desc: "AKI Diagnostic Engine", params: "?tab=pathways&scenario=aki-engine" },
  { id: "eng_hk",       label: "Hyperkalaemia Eng.",   icon: GitBranch,    color: "bg-orange-600",  page: "ClinicalSupport",       desc: "Full K+ Engine",        params: "?tab=pathways&scenario=hyperkalemia-deep-engine" },
  { id: "eng_tma",      label: "TMA Engine",           icon: GitBranch,    color: "bg-rose-700",    page: "ClinicalSupport",       desc: "HUS / TMA Decision",    params: "?tab=pathways&scenario=tma-engine" },
  { id: "eng_hematuria",label: "Haematuria Eng.",      icon: GitBranch,    color: "bg-rose-600",    page: "ClinicalSupport",       desc: "Haematuria Engine",     params: "?tab=pathways&scenario=hematuria-engine" },
  { id: "eng_genetic",  label: "Genetic Engine",       icon: GitBranch,    color: "bg-violet-700",  page: "ClinicalSupport",       desc: "Genetic Test Triggers", params: "?tab=pathways&scenario=genetic-engine" },
  { id: "eng_ckdprog",  label: "CKD Progression",      icon: GitBranch,    color: "bg-blue-700",    page: "ClinicalSupport",       desc: "CKD Progression Engine",params: "?tab=pathways&scenario=ckd-progression-engine" },
  { id: "eng_biopsy",   label: "Biopsy Engine",        icon: GitBranch,    color: "bg-amber-700",   page: "ClinicalSupport",       desc: "Biopsy Trigger Engine", params: "?tab=pathways&scenario=biopsy-engine" },
  { id: "eng_ma",       label: "Metabolic Acidosis",   icon: GitBranch,    color: "bg-amber-600",   page: "ClinicalSupport",       desc: "Met. Acidosis Engine",  params: "?tab=pathways&scenario=metabolic-acidosis-engine" },
  { id: "eng_hypokal",  label: "Hypokalaemia Eng.",    icon: GitBranch,    color: "bg-yellow-600",  page: "ClinicalSupport",       desc: "Hypokalemia Engine",    params: "?tab=pathways&scenario=hypokalemia-engine" },
  { id: "eng_polyuria", label: "Polyuria Engine",      icon: GitBranch,    color: "bg-teal-600",    page: "ClinicalSupport",       desc: "Polyuria / DI Engine",  params: "?tab=pathways&scenario=polyuria-engine" },
  { id: "eng_eculizumab",label: "Eculizumab Engine",  icon: GitBranch,    color: "bg-purple-700",  page: "ClinicalSupport",       desc: "Eculizumab Eligibility",params: "?tab=pathways&scenario=eculizumab-engine" },
  { id: "eng_c3g",      label: "C3G Engine",           icon: GitBranch,    color: "bg-cyan-700",    page: "ClinicalSupport",       desc: "C3 Glomerulopathy",     params: "?tab=pathways&scenario=c3g-engine" },
];

const DEFAULT_IDS = ["rrt", "biopsy", "genetics", "emergency", "drugs", "lab_ai", "aki", "bp_pct", "ckd", "differential"];
const STORAGE_KEY = "hub_quick_launch_ids";

function loadIds() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_IDS; } catch { return DEFAULT_IDS; }
}
function saveIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export default function HubQuickLaunch() {
  const [activeIds, setActiveIds] = useState(loadIds);
  const [editing, setEditing] = useState(false);

  const activeApps = activeIds.map(id => ALL_QUICK_APPS.find(a => a.id === id)).filter(Boolean);

  const toggle = (id) => {
    setActiveIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      saveIds(next);
      return next;
    });
  };

  const reset = () => { setActiveIds(DEFAULT_IDS); saveIds(DEFAULT_IDS); };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-slate-800">Quick Launch</span>
          <span className="text-xs text-slate-400">({activeApps.length} apps)</span>
        </div>
        <div className="flex items-center gap-1.5">
          {editing && (
            <button
              onClick={reset}
              className="text-xs text-slate-500 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Reset
            </button>
          )}
          <button
            onClick={() => setEditing(e => !e)}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
              editing
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {editing ? <Check className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
            {editing ? "Done" : "Customise"}
          </button>
        </div>
      </div>

      {/* Active apps grid */}
      {!editing && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-0 divide-x divide-y divide-slate-100">
          {activeApps.map(app => {
            const Icon = app.icon;
            return (
              <Link
                key={app.id}
                to={createPageUrl(app.page) + (app.params || "")}
                className="flex flex-col items-center gap-1.5 p-3 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <div className={`w-10 h-10 ${app.color} rounded-xl flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{app.label}</span>
                <span className="text-xs text-slate-400 text-center leading-tight hidden sm:block">{app.desc}</span>
              </Link>
            );
          })}
          {activeApps.length === 0 && (
            <div className="col-span-3 sm:col-span-6 py-6 text-center text-xs text-slate-400">
              No apps selected. Tap <strong>Customise</strong> to add.
            </div>
          )}
        </div>
      )}

      {/* Edit mode — full catalogue */}
      {editing && (
        <div className="p-3">
          <p className="text-xs text-slate-500 mb-3">Tap to add or remove from your Quick Launch bar.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_QUICK_APPS.map(app => {
              const Icon = app.icon;
              const isActive = activeIds.includes(app.id);
              return (
                <button
                  key={app.id}
                  onClick={() => toggle(app.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                    isActive
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className={`w-8 h-8 ${app.color} rounded-lg flex items-center justify-center flex-shrink-0 ${!isActive && "opacity-60"}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold leading-tight ${isActive ? "text-indigo-800" : "text-slate-700"}`}>
                      {app.label}
                    </p>
                    <p className="text-xs text-slate-400 leading-tight truncate">{app.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive ? "bg-indigo-600" : "bg-slate-200"
                  }`}>
                    {isActive
                      ? <Check className="w-3 h-3 text-white" />
                      : <Plus className="w-3 h-3 text-slate-400" />
                    }
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}