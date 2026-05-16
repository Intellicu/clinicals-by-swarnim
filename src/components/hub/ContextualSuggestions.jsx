import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, Activity, Zap, Heart, Wind, TestTube, Droplet, Brain } from "lucide-react";

const SUGGESTIONS = [
  {
    id: "gfr",
    check: (d) => d.serumCreatinine && parseFloat(d.serumCreatinine) > 0 && d.height && d.weight,
    label: "Calculate GFR",
    icon: Activity,
    color: "bg-blue-600",
    page: "SchwartzGFR",
    reason: (d) => `Cr ${d.serumCreatinine} mg/dL entered`,
  },
  {
    id: "aki",
    check: (d) => d.serumCreatinine && parseFloat(d.serumCreatinine) > 1.2,
    label: "AKI Staging",
    icon: AlertTriangle,
    color: "bg-red-600",
    page: "AKIStager",
    reason: (d) => `Cr ${d.serumCreatinine} — check AKI`,
  },
  {
    id: "bp",
    check: (d) => d.systolicBP && d.diastolicBP && d.age && d.height,
    label: "BP Percentile",
    icon: Heart,
    color: "bg-rose-600",
    page: "BPPercentiles",
    reason: (d) => `BP ${d.systolicBP}/${d.diastolicBP} entered`,
  },
  {
    id: "htn_emergency",
    check: (d) => d.systolicBP && parseFloat(d.systolicBP) > 160,
    label: "HTN Emergency",
    icon: AlertTriangle,
    color: "bg-red-700",
    page: "EmergencyHub",
    reason: (d) => `SBP ${d.systolicBP} mmHg — check emergency protocol`,
  },
  {
    id: "hyperk",
    check: (d) => d.serumPotassium && parseFloat(d.serumPotassium) >= 5.5,
    label: "Hyperkalemia",
    icon: Zap,
    color: "bg-orange-600",
    page: "EmergencyHub",
    reason: (d) => `K ${d.serumPotassium} mEq/L — critical`,
  },
  {
    id: "sodium",
    check: (d) => d.serumSodium && (parseFloat(d.serumSodium) < 130 || parseFloat(d.serumSodium) > 150),
    label: "Sodium Correction",
    icon: Droplet,
    color: "bg-blue-500",
    page: "SodiumCalculator",
    reason: (d) => `Na ${d.serumSodium} mEq/L — dysnatremia`,
  },
  {
    id: "proteinuria",
    check: (d) => d.urineProtein && d.urineCreatinine,
    label: "Proteinuria (UPCR)",
    icon: TestTube,
    color: "bg-cyan-600",
    page: "Proteinuria",
    reason: () => `Urine protein/Cr entered`,
  },
  {
    id: "growth",
    check: (d) => d.weight && d.height && d.age,
    label: "Growth Z-Score",
    icon: Activity,
    color: "bg-green-600",
    page: "Anthropometry",
    reason: (d) => `Wt ${d.weight} kg, Ht ${d.height} cm`,
  },
];

export default function ContextualSuggestions({ patientData }) {
  if (!patientData) return null;

  const active = SUGGESTIONS.filter(s => s.check(patientData));
  if (active.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-bold text-slate-700">Smart Suggestions</span>
        <span className="text-xs text-slate-400">based on entered data</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {active.map(s => {
          const Icon = s.icon;
          return (
            <Link key={s.id} to={createPageUrl(s.page)}>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 hover:border-indigo-300 hover:shadow-sm active:scale-95 transition-all">
                <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{s.label}</p>
                  <p className="text-xs text-slate-500 leading-tight truncate">{s.reason(patientData)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}