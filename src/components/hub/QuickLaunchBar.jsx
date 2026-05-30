import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Activity, Layers, Dna, TestTube, Droplet, Waves,
  Settings2, X, Check, GripVertical, Sparkles, Brain,
  FlaskConical, Microscope, Heart, AlertCircle, Pill,
  Calculator, BookOpen, Wind, Beaker, TrendingUp, Zap,
  ClipboardList, Camera, Star, GitBranch, Shield, Baby,
  Stethoscope, BarChart2, Thermometer
} from "lucide-react";

// Full catalogue of available quick-launch apps
export const ALL_QUICK_APPS = [
  { id: "rrt", label: "RRT Assistant", icon: Droplet, color: "bg-indigo-700", page: "RRTAssistant", desc: "HD / PD / CRRT" },
  { id: "stone", label: "Stone Analysis", icon: Waves, color: "bg-cyan-700", page: "ClinicalAIHub", desc: "Renal stone workup" },
  { id: "biopsy", label: "Biopsy AI", icon: Layers, color: "bg-violet-700", page: "ClinicalAIHub", desc: "Renal biopsy AI" },
  { id: "genetics", label: "Genetic Analysis", icon: Dna, color: "bg-purple-700", page: "GeneticReportAnalyzer", desc: "Genetic report AI" },
  { id: "uroflow", label: "Uroflow AI", icon: Activity, color: "bg-teal-700", page: "UrologyNephrologyHub", desc: "Uroflowmetry AI" },
  { id: "uds", label: "Paediatric UDS", icon: TestTube, color: "bg-teal-600", page: "ClinicalAIHub", desc: "UDS interpreter" },
  { id: "labs", label: "Lab Analyzer", icon: Microscope, color: "bg-rose-600", page: "ClinicalAIHub", desc: "AI lab interpretation" },
  { id: "differential", label: "Differential Dx", icon: Brain, color: "bg-indigo-600", page: "DifferentialEngine", desc: "AI differential Dx" },
  { id: "prescriber", label: "AI Prescriber", icon: Sparkles, color: "bg-blue-700", page: "AIPrescriber", desc: "Smart prescriptions" },
  { id: "case", label: "Case Analyzer", icon: BookOpen, color: "bg-emerald-700", page: "ClinicalAIHub", desc: "Full case AI" },
  { id: "drugs", label: "Drug Dosing", icon: Pill, color: "bg-purple-600", page: "DrugsDosing", desc: "Drug dosing calculator" },
  { id: "emergency", label: "Emergency Hub", icon: AlertCircle, color: "bg-red-600", page: "EmergencyHub", desc: "Emergency protocols" },
  { id: "bp", label: "BP Percentiles", icon: Heart, color: "bg-red-500", page: "BPPercentiles", desc: "BP centile chart" },
  { id: "gfr", label: "Schwartz GFR", icon: Activity, color: "bg-blue-600", page: "SchwartzGFR", desc: "eGFR calculator" },
  { id: "aki", label: "AKI Stager", icon: AlertCircle, color: "bg-red-700", page: "AKIStager", desc: "AKI staging (KDIGO)" },
  { id: "abg", label: "ABG Interpreter", icon: Wind, color: "bg-rose-600", page: "ABGInterpreter", desc: "Acid-base analysis" },
  { id: "ckd", label: "CKD Stager", icon: TrendingUp, color: "bg-blue-700", page: "CKDStager", desc: "CKD staging" },
  { id: "nutrition", label: "Nutrition Hub", icon: Beaker, color: "bg-green-600", page: "NutritionHub", desc: "Renal diet & nutrition" },
  { id: "procedures", label: "Procedure Hub", icon: ClipboardList, color: "bg-slate-700", page: "ProcedureHub", desc: "Procedure guides" },
  { id: "imaging", label: "Imaging Viewer", icon: Camera, color: "bg-blue-600", page: "ImagingViewer", desc: "USS / DMSA / CT" },
  { id: "guidelines", label: "Guidelines Lib", icon: BookOpen, color: "bg-green-700", page: "GuidelinesLibrary", desc: "KDIGO/IPNA/IAP" },
  { id: "rheumatology", label: "Rheumatology", icon: Shield, color: "bg-rose-700", page: "PediatricRheumatology", desc: "JIA / SLE / Vasculitis" },
  { id: "endocrine", label: "Endocrinology", icon: Thermometer, color: "bg-orange-600", page: "PediatricEndocrinology", desc: "DKA, thyroid, growth" },
  { id: "fluids", label: "Fluids Calc", icon: Waves, color: "bg-cyan-600", page: "FluidCalculator", desc: "Maintenance fluids" },
  { id: "tubular", label: "Tubular Disorders", icon: FlaskConical, color: "bg-teal-700", page: "TubularDisordersHub", desc: "RTA, cystinuria" },
  { id: "transplant", label: "Transplant", icon: Shield, color: "bg-green-700", page: "ClinicalSupport", desc: "Tx pathways" },
  { id: "calcHub", label: "All Calculators", icon: Calculator, color: "bg-slate-600", page: "CalculatorsHub", desc: "Full calculator hub" },
];

const DEFAULT_IDS = ["rrt", "stone", "biopsy", "genetics", "uroflow", "uds"];
const STORAGE_KEY = "hub_quick_launch_ids";

function loadIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length > 0) return saved;
  } catch {}
  return DEFAULT_IDS;
}

function saveIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export default function QuickLaunchBar() {
  const [selectedIds, setSelectedIds] = useState(loadIds);
  const [editing, setEditing] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const selectedApps = selectedIds
    .map((id) => ALL_QUICK_APPS.find((a) => a.id === id))
    .filter(Boolean);

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      saveIds(next);
      return next;
    });
  };

  const filtered = searchQ.trim()
    ? ALL_QUICK_APPS.filter(
        (a) =>
          a.label.toLowerCase().includes(searchQ.toLowerCase()) ||
          a.desc.toLowerCase().includes(searchQ.toLowerCase())
      )
    : ALL_QUICK_APPS;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-bold text-slate-700">Quick Launch</span>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
            editing
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {editing ? (
            <>
              <Check className="w-3 h-3" /> Done
            </>
          ) : (
            <>
              <Settings2 className="w-3 h-3" /> Customise
            </>
          )}
        </button>
      </div>

      {/* Quick Launch Buttons */}
      {!editing && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {selectedApps.map((app) => {
            const Icon = app.icon;
            return (
              <Link key={app.id} to={createPageUrl(app.page)}>
                <div className={`${app.color} rounded-xl p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform shadow-sm cursor-pointer`}>
                  <Icon className="w-5 h-5 text-white" />
                  <span className="text-white text-xs font-semibold text-center leading-tight line-clamp-2">{app.label}</span>
                </div>
              </Link>
            );
          })}
          {selectedApps.length === 0 && (
            <div className="col-span-3 sm:col-span-6 text-center py-4 text-xs text-slate-400">
              No apps selected. Tap <strong>Customise</strong> to add.
            </div>
          )}
        </div>
      )}

      {/* Customise Panel */}
      {editing && (
        <div className="bg-white border border-indigo-200 rounded-xl p-3 space-y-3 shadow-sm">
          <p className="text-xs text-slate-500">
            Tap to <strong>toggle</strong> which tools appear in Quick Launch. Selected tools ({selectedIds.length}) are highlighted.
          </p>

          {/* Search */}
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search apps…"
            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />

          {/* App grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filtered.map((app) => {
              const Icon = app.icon;
              const isOn = selectedIds.includes(app.id);
              return (
                <button
                  key={app.id}
                  onClick={() => toggle(app.id)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all ${
                    isOn
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isOn ? app.color : "bg-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold leading-tight ${isOn ? "text-indigo-800" : "text-slate-700"}`}>
                      {app.label}
                    </p>
                    <p className="text-xs text-slate-400 leading-tight truncate">{app.desc}</p>
                  </div>
                  {isOn && <Check className="w-3.5 h-3.5 text-indigo-500 ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setSelectedIds(DEFAULT_IDS);
              saveIds(DEFAULT_IDS);
            }}
            className="text-xs text-slate-500 underline-offset-2 underline hover:text-slate-700"
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
}