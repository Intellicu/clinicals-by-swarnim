import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, Activity, Zap, Heart, Wind, TestTube, Droplet, Brain, Star, Pill, GitBranch, BookOpen, TrendingUp } from "lucide-react";

const SUGGESTIONS = [
  { id: "gfr", check: (d) => d.serumCreatinine && parseFloat(d.serumCreatinine) > 0 && d.height && d.weight, label: "Calculate GFR", icon: Activity, color: "bg-blue-600", page: "SchwartzGFR", reason: (d) => `Cr ${d.serumCreatinine} mg/dL entered` },
  { id: "aki", check: (d) => d.serumCreatinine && parseFloat(d.serumCreatinine) > 1.2, label: "AKI Staging", icon: AlertTriangle, color: "bg-red-600", page: "AKIStager", reason: (d) => `Cr ${d.serumCreatinine} — check AKI` },
  { id: "bp", check: (d) => d.systolicBP && d.diastolicBP && d.age && d.height, label: "BP Percentile", icon: Heart, color: "bg-rose-600", page: "BPPercentiles", reason: (d) => `BP ${d.systolicBP}/${d.diastolicBP} entered` },
  { id: "htn_emergency", check: (d) => d.systolicBP && parseFloat(d.systolicBP) > 160, label: "HTN Emergency", icon: AlertTriangle, color: "bg-red-700", page: "EmergencyHub", reason: (d) => `SBP ${d.systolicBP} mmHg — emergency` },
  { id: "hyperk", check: (d) => d.serumPotassium && parseFloat(d.serumPotassium) >= 5.5, label: "Hyperkalemia", icon: Zap, color: "bg-orange-600", page: "EmergencyHub", reason: (d) => `K ${d.serumPotassium} mEq/L — critical` },
  { id: "sodium", check: (d) => d.serumSodium && (parseFloat(d.serumSodium) < 130 || parseFloat(d.serumSodium) > 150), label: "Sodium Correction", icon: Droplet, color: "bg-blue-500", page: "SodiumCalculator", reason: (d) => `Na ${d.serumSodium} — dysnatremia` },
  { id: "proteinuria", check: (d) => d.urineProtein && d.urineCreatinine, label: "Proteinuria (UPCR)", icon: TestTube, color: "bg-cyan-600", page: "Proteinuria", reason: () => `Urine protein/Cr entered` },
  { id: "growth", check: (d) => d.weight && d.height && d.age, label: "Growth Z-Score", icon: Activity, color: "bg-green-600", page: "Anthropometry", reason: (d) => `Wt ${d.weight} kg, Ht ${d.height} cm` },
];

// Fixed pinned protocols — always visible in suggestions
const PINNED_PROTOCOLS = [
  { id: "ns_protocol", label: "Nephrotic Protocol", icon: Droplet, color: "bg-indigo-600", page: "ClinicalSupport", pinned: true },
  { id: "aki_protocol", label: "AKI Protocol", icon: AlertTriangle, color: "bg-red-600", page: "AKIStager", pinned: true },
  { id: "drugs_dosing", label: "Drug Dosing", icon: Pill, color: "bg-purple-600", page: "DrugsDosing", pinned: true },
];

export default function ContextualSuggestions({ patientData }) {
  const [starredPathways, setStarredPathways] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hub_starred_pathways") || "[]"); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState("smart"); // "smart" | "pinned" | "starred"

  const active = patientData ? SUGGESTIONS.filter(s => s.check(patientData)) : [];

  const starredItems = [
    { id: "ns_protocol", label: "Nephrotic Protocol", icon: Droplet, color: "bg-indigo-600", page: "ClinicalSupport" },
    { id: "aki_pathway", label: "AKI Pathway", icon: AlertTriangle, color: "bg-red-600", page: "AKIStager" },
    { id: "dialysis", label: "Dialysis Pathways", icon: Activity, color: "bg-teal-600", page: "RRTAssistant" },
    { id: "ckd", label: "CKD Staging", icon: TrendingUp, color: "bg-blue-700", page: "CKDStager" },
    { id: "hypertension", label: "HTN Pathways", icon: Heart, color: "bg-rose-600", page: "ClinicalSupport" },
    { id: "transplant", label: "Transplant", icon: BookOpen, color: "bg-green-700", page: "ClinicalSupport" },
  ].filter(p => starredPathways.includes(p.id));

  const allPathwayOptions = [
    { id: "ns_protocol", label: "Nephrotic Protocol", icon: Droplet, color: "bg-indigo-600", page: "ClinicalSupport" },
    { id: "aki_pathway", label: "AKI Pathway", icon: AlertTriangle, color: "bg-red-600", page: "AKIStager" },
    { id: "dialysis", label: "Dialysis Pathways", icon: Activity, color: "bg-teal-600", page: "RRTAssistant" },
    { id: "ckd", label: "CKD Staging", icon: Activity, color: "bg-blue-700", page: "CKDStager" },
    { id: "hypertension", label: "HTN Pathways", icon: Heart, color: "bg-rose-600", page: "ClinicalSupport" },
    { id: "transplant", label: "Transplant", icon: BookOpen, color: "bg-green-700", page: "ClinicalSupport" },
    { id: "glomerular", label: "Glomerular Dx", icon: GitBranch, color: "bg-violet-600", page: "GlomerularDiseases" },
    { id: "tubular", label: "Tubular Disorders", icon: Activity, color: "bg-teal-700", page: "TubularDisordersHub" },
  ];

  const togglePathwayStar = (id) => {
    setStarredPathways(prev => {
      const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      localStorage.setItem("hub_starred_pathways", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-bold text-slate-700">Smart Suggestions</span>
        </div>
        <div className="flex gap-1">
          {[
            { key: "smart", label: "Smart" },
            { key: "pinned", label: "Protocols" },
            { key: "starred", label: "⭐ Starred" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`text-xs px-2 py-1 rounded-full font-semibold transition-colors ${activeTab === tab.key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "smart" && (
        <>
          {/* Always-pinned Nephrotic Protocol */}
          <Link to={createPageUrl("ClinicalSupport")} className="block mb-2">
            <div className="flex items-center gap-2 bg-indigo-600 rounded-xl px-3 py-2.5 active:scale-95 transition-all">
              <Droplet className="w-4 h-4 text-white flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight">Nephrotic Syndrome Protocol</p>
                <p className="text-xs text-indigo-200 leading-tight">IPNA · KDIGO · Steroid dosing · SRNS pathway</p>
              </div>
              <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0">Fixed</span>
            </div>
          </Link>
          {active.length > 0 ? (
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
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">Enter patient data above for smart suggestions</p>
          )}
        </>
      )}

      {activeTab === "pinned" && (
        <div className="space-y-1.5">
          {PINNED_PROTOCOLS.map(p => {
            const Icon = p.icon;
            return (
              <Link key={p.id} to={createPageUrl(p.page)}>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 hover:border-indigo-300 active:scale-95 transition-all">
                  <div className={`w-8 h-8 ${p.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 flex-1">{p.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {activeTab === "starred" && (
        <div className="space-y-2">
          {starredItems.length > 0 && (
            <div className="space-y-1">
              {starredItems.map(p => {
                const Icon = p.icon;
                return (
                  <div key={p.id} className="flex items-center gap-2">
                    <Link to={createPageUrl(p.page)} className="flex-1">
                      <div className="flex items-center gap-2 bg-white border border-yellow-200 rounded-xl px-3 py-2.5 hover:border-yellow-400 active:scale-95 transition-all">
                        <div className={`w-8 h-8 ${p.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 flex-1">{p.label}</p>
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-slate-500 font-semibold mt-2 mb-1">All Pathways — tap ⭐ to pin:</p>
          <div className="space-y-1">
            {allPathwayOptions.map(p => {
              const Icon = p.icon;
              const isStarred = starredPathways.includes(p.id);
              return (
                <div key={p.id} className="flex items-center gap-2">
                  <Link to={createPageUrl(p.page)} className="flex-1">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:border-indigo-300 active:scale-95 transition-all">
                      <div className={`w-7 h-7 ${p.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 flex-1">{p.label}</p>
                    </div>
                  </Link>
                  <button onClick={() => togglePathwayStar(p.id)} className="p-2 rounded-xl border border-slate-200 bg-white hover:border-yellow-400">
                    <Star className={`w-3.5 h-3.5 ${isStarred ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}