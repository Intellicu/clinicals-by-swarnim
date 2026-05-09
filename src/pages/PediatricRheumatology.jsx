import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, X, AlertTriangle, ChevronDown, ChevronUp, Activity,
  Stethoscope, Shield, Zap, BookOpen, Calculator, FlaskConical,
  Info, ArrowRight, Heart
} from "lucide-react";
import { RHEUM_DISEASES, RHEUM_CATEGORIES, NEPHROLOGY_OVERLAPS } from "@/lib/rheumatology/RheumatologyData";
import RheumDiseaseActivityCalculators from "@/components/rheumatology/RheumDiseaseActivityCalculators";
import RheumNephrologyOverlap from "@/components/rheumatology/RheumNephrologyOverlap";

const CAT_COLORS = {
  JIA: "bg-blue-100 text-blue-800 border-blue-200",
  SLE: "bg-purple-100 text-purple-800 border-purple-200",
  Vasculitis: "bg-red-100 text-red-800 border-red-200",
  Myositis: "bg-orange-100 text-orange-800 border-orange-200",
  Autoinflammatory: "bg-amber-100 text-amber-800 border-amber-200",
  Uveitis: "bg-teal-100 text-teal-800 border-teal-200",
};

const RISK_COLORS = {
  "Very High": "bg-red-100 text-red-800 border-red-200",
  "High": "bg-orange-100 text-orange-800 border-orange-200",
  "Moderate-High": "bg-amber-100 text-amber-800 border-amber-200",
  "Moderate": "bg-yellow-100 text-yellow-800 border-yellow-200",
};

function DiseaseCard({ disease, onSelect }) {
  const catColor = CAT_COLORS[disease.category] || "bg-slate-100 text-slate-700";
  return (
    <div
      className="bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all active:scale-[0.99] p-3"
      onClick={() => onSelect(disease)}
    >
      <div className="flex items-start gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-1">
            <Badge className={`text-xs border ${catColor}`}>{disease.category}</Badge>
            {disease.icd && <Badge variant="outline" className="text-xs font-mono">{disease.icd}</Badge>}
          </div>
          <p className="font-semibold text-slate-900 text-sm leading-snug">{disease.name}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
      </div>
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{disease.summary}</p>
      {disease.emergency_flags?.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          <span className="line-clamp-1">{disease.emergency_flags[0]}</span>
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false, badgeCount }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(o => !o)}>
        <span className="font-semibold text-sm text-slate-800 flex items-center gap-2">
          {title}
          {badgeCount !== undefined && <Badge variant="outline" className="text-xs">{badgeCount}</Badge>}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="p-3 pt-0 border-t border-slate-100">{children}</div>}
    </div>
  );
}

function DiseaseDetailSheet({ disease, onClose }) {
  const catColor = CAT_COLORS[disease.category] || "bg-slate-100 text-slate-700";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-2xl max-h-[93vh] sm:max-h-[88vh] bg-white rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1 mb-1">
              <Badge className={`text-xs border ${catColor}`}>{disease.category}</Badge>
              {disease.icd && <Badge variant="outline" className="text-xs font-mono">{disease.icd}</Badge>}
            </div>
            <p className="font-bold text-slate-900 text-sm leading-snug">{disease.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Summary */}
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {disease.summary}
          </p>

          {/* Key Features */}
          {disease.key_features && (
            <CollapsibleSection title="Key Clinical Features" defaultOpen badgeCount={disease.key_features.length}>
              <ul className="space-y-1.5 pt-2">
                {disease.key_features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {/* Treatment Ladder */}
          {disease.treatment_ladder && (
            <CollapsibleSection title="Treatment Ladder" defaultOpen>
              <div className="space-y-2 pt-2">
                {disease.treatment_ladder.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-lg p-2">
                    <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-xs text-green-900 leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Treatment (SLE structure) */}
          {disease.treatment && typeof disease.treatment === "object" && !Array.isArray(disease.treatment) && (
            <CollapsibleSection title="Treatment by Severity">
              <div className="space-y-2 pt-2">
                {Object.entries(disease.treatment).map(([level, items]) => (
                  Array.isArray(items) && (
                    <div key={level}>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 capitalize">{level}</p>
                      {items.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-2 mb-1">
                          <p className="text-xs text-blue-900 leading-relaxed">{t}</p>
                        </div>
                      ))}
                    </div>
                  )
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Lupus Nephritis Special Section */}
          {disease.lupus_nephritis && (
            <CollapsibleSection title="Lupus Nephritis — Nephrology Overlap">
              <div className="space-y-2 pt-2">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-red-700 mb-2">ISN/RPS Biopsy Classes</p>
                  <div className="space-y-1">
                    {disease.lupus_nephritis.classes.map((c, i) => (
                      <p key={i} className={`text-xs ${c.includes("MOST SEVERE") ? "font-bold text-red-800" : "text-red-700"}`}>{c}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-1.5">Class III/IV Induction Treatment</p>
                  {disease.lupus_nephritis.treatment_III_IV.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-lg p-2 mb-1">
                      <p className="text-xs text-purple-900 leading-relaxed">{t}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-700 mb-1">Monitoring Targets</p>
                  {disease.lupus_nephritis.monitoring.map((m, i) => (
                    <p key={i} className="text-xs text-amber-800">• {m}</p>
                  ))}
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* MAS Alert (sJIA) */}
          {disease.mas_alert && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-xs font-bold text-red-700">MAS Alert — Life-threatening</p>
              </div>
              <p className="text-xs font-semibold text-red-800 mb-1">Triggers:</p>
              {disease.mas_alert.triggers.map((t, i) => (
                <p key={i} className="text-xs text-red-700">• {t}</p>
              ))}
              <p className="text-xs font-bold text-red-800 mt-2">Action: {disease.mas_alert.action}</p>
            </div>
          )}

          {/* Monitoring */}
          {disease.monitoring && (
            <CollapsibleSection title="Monitoring Parameters">
              <ul className="space-y-1.5 pt-2">
                {disease.monitoring.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <Activity className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {/* Emergency Flags */}
          {disease.emergency_flags?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />Emergency Red Flags
              </p>
              <div className="space-y-1">
                {disease.emergency_flags.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-800 font-medium">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uveitis screening (oligoarticular JIA) */}
          {disease.uveitis_screening && (
            <CollapsibleSection title="Uveitis Screening Protocol">
              <div className="pt-2 space-y-1.5">
                <p className="text-xs"><span className="font-semibold text-teal-800">High Risk:</span> <span className="text-teal-700">{disease.uveitis_screening.frequency}</span></p>
                <p className="text-xs"><span className="font-semibold text-teal-800">Standard:</span> <span className="text-teal-700">{disease.uveitis_screening.alternate}</span></p>
                <p className="text-xs text-teal-600 bg-teal-50 p-2 rounded-lg border border-teal-100">{disease.uveitis_screening.note}</p>
              </div>
            </CollapsibleSection>
          )}

          {/* Evidence notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Evidence sourced from <strong>ACR/EULAR/PRINTO/ILAR/BSR</strong> guidelines. For educational bedside reference — always apply clinical judgment and consult current protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PediatricRheumatology() {
  const [activeTab, setActiveTab] = useState("diseases");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedDisease, setSelectedDisease] = useState(null);

  const filtered = RHEUM_DISEASES.filter(d => {
    const q = search.toLowerCase();
    const text = [d.name, d.category, d.summary, d.icd].join(" ").toLowerCase();
    return (category === "All" || d.category === category) && (!search || text.includes(q));
  });

  const tabs = [
    { id: "diseases", label: "Diseases", icon: BookOpen },
    { id: "calculators", label: "Calculators", icon: Calculator },
    { id: "nephrology", label: "Kidney Overlap", icon: FlaskConical },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 px-4 py-5 shadow-xl">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Pediatric Rheumatology</h1>
              <p className="text-purple-100 text-xs">{RHEUM_DISEASES.length} conditions · ACR/EULAR/PRINTO · Disease activity tools</p>
            </div>
          </div>
          {activeTab === "diseases" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search conditions, drugs, criteria…"
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border-0 bg-white/90 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-400" /></button>}
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="flex max-w-2xl mx-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${activeTab === t.id ? "border-purple-600 text-purple-700 bg-purple-50" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 py-3 space-y-3">

        {/* ── DISEASES TAB ── */}
        {activeTab === "diseases" && (
          <>
            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {RHEUM_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${category === cat ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-purple-300"}`}>
                  {cat}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400">{filtered.length} conditions</p>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "JIA Subtypes", count: RHEUM_DISEASES.filter(d => d.category === "JIA").length, color: "bg-blue-50 border-blue-200 text-blue-700" },
                { label: "Autoinflammatory", count: RHEUM_DISEASES.filter(d => d.category === "Autoinflammatory").length, color: "bg-amber-50 border-amber-200 text-amber-700" },
                { label: "Nephro Overlaps", count: NEPHROLOGY_OVERLAPS.length, color: "bg-purple-50 border-purple-200 text-purple-700" },
              ].map(s => (
                <div key={s.label} className={`p-2.5 rounded-xl border-2 text-center ${s.color}`}>
                  <p className="text-xl font-bold">{s.count}</p>
                  <p className="text-xs font-semibold leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              {filtered.map(d => (
                <DiseaseCard key={d.id} disease={d} onSelect={setSelectedDisease} />
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No conditions match your search
                </div>
              )}
            </div>
          </>
        )}

        {/* ── CALCULATORS TAB ── */}
        {activeTab === "calculators" && <RheumDiseaseActivityCalculators />}

        {/* ── NEPHROLOGY OVERLAP TAB ── */}
        {activeTab === "nephrology" && <RheumNephrologyOverlap overlaps={NEPHROLOGY_OVERLAPS} />}

      </div>

      {/* Disease detail sheet */}
      {selectedDisease && (
        <DiseaseDetailSheet disease={selectedDisease} onClose={() => setSelectedDisease(null)} />
      )}
    </div>
  );
}