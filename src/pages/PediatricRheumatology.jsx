import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calculator, FlaskConical, GitBranch, Pill, RefreshCw, Stethoscope, Search, X } from "lucide-react";

import { RHEUM_CONDITIONS, RHEUM_CATEGORIES_V2, URGENCY_CONFIG } from "@/lib/rheumatology/RheumConditions";
import RheumPathwayCard from "@/components/rheumatology/RheumPathwayCard";
import RheumDrugCards from "@/components/rheumatology/RheumDrugCards";
import RheumApproaches from "@/components/rheumatology/RheumApproaches";
import RheumEvidenceUpdates from "@/components/rheumatology/RheumEvidenceUpdates";
import RheumDiseaseActivityCalculators from "@/components/rheumatology/RheumDiseaseActivityCalculators";
import RheumNephrologyOverlap from "@/components/rheumatology/RheumNephrologyOverlap";
import UnifiedMonitoringPanel from "@/components/rheumatology/UnifiedMonitoringPanel";
import CrossSpecialtyLinks from "@/components/rheumatology/CrossSpecialtyLinks";
import { NEPHROLOGY_OVERLAPS } from "@/lib/rheumatology/RheumatologyData";

const MAIN_TABS = [
  { id: "diseases", label: "📋 Pathways" },
  { id: "approaches", label: "🔀 Approaches" },
  { id: "drugs", label: "💊 Drugs" },
  { id: "calculators", label: "🧮 Calculators" },
  { id: "nephrology", label: "🫘 Kidney" },
  { id: "monitoring", label: "📊 Monitoring" },
  { id: "updates", label: "📡 Evidence" },
];

export default function PediatricRheumatology() {
  const [mainTab, setMainTab] = useState("diseases");
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [savedUpdates, setSavedUpdates] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rheum_pathway_updates") || "{}"); } catch { return {}; }
  });

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const isAdmin = user?.role === "admin";

  const handleSaveUpdate = (id, content) => {
    const next = { ...savedUpdates, [id]: content };
    setSavedUpdates(next);
    try { localStorage.setItem("rheum_pathway_updates", JSON.stringify(next)); } catch {}
  };

  const filtered = RHEUM_CONDITIONS.filter(c => {
    const q = search.toLowerCase();
    const text = [c.name, c.category, c.overview, c.guideline, c.tags?.join(" ")].join(" ").toLowerCase();
    const catMatch = filterCategory === "All" || c.category === filterCategory;
    return catMatch && (!search || text.includes(q));
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 px-4 py-5 shadow-xl">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">Pediatric Rheumatology</h1>
              <p className="text-purple-100 text-xs">
                {RHEUM_CONDITIONS.length} pathways · ACR/EULAR/PRINTO · Disease activity tools · Drug knowledge
              </p>
            </div>
            {isAdmin && (
              <Badge className="bg-white/20 text-white border-white/30 border text-xs">Admin</Badge>
            )}
          </div>
          {/* Search (diseases tab only) */}
          {mainTab === "diseases" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search conditions, drugs, guidelines…"
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border-0 bg-white/90 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Info banner (mirrors GN) ── */}
      <div className="max-w-3xl mx-auto px-3 pt-3">
        <Alert className="bg-purple-50 border-purple-200">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-xs text-purple-900">
            <strong>Pediatric Rheumatology Clinical Pathways</strong> — ACR 2022 JIA, ACR/EULAR SLE 2019, EULAR pSLE 2023, AHA KD 2017, PRINTO, BSR guidelines. Includes disease activity calculators, drug knowledge, clinical approaches, and live evidence updates.
            {isAdmin && <span className="ml-2 text-purple-700 font-semibold">Admin: edit any pathway using the ✏️ button.</span>}
          </AlertDescription>
        </Alert>
      </div>

      {/* ── Main Tabs (mirrors GN pill layout) ── */}
      <div className="max-w-3xl mx-auto px-3 pt-3">
        <div className="flex gap-1.5 flex-wrap bg-slate-100 p-1 rounded-xl">
          {MAIN_TABS.map(t => (
            <button key={t.id} onClick={() => setMainTab(t.id)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex-shrink-0 ${
                mainTab === t.id ? "bg-purple-600 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-200"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 py-3 space-y-3">

        {/* ── DISEASE PATHWAYS TAB ── */}
        {mainTab === "diseases" && (
          <>
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {RHEUM_CATEGORIES_V2.map(cat => (
                <Button key={cat} size="sm"
                  variant={filterCategory === cat ? "default" : "outline"}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-xs h-7 ${filterCategory === cat ? "bg-purple-600" : ""}`}>
                  {cat}
                </Button>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Total", count: RHEUM_CONDITIONS.length, color: "bg-purple-50 border-purple-200 text-purple-700" },
                { label: "Critical", count: RHEUM_CONDITIONS.filter(c => c.urgency === "critical").length, color: "bg-red-50 border-red-200 text-red-700" },
                { label: "High", count: RHEUM_CONDITIONS.filter(c => c.urgency === "high").length, color: "bg-amber-50 border-amber-200 text-amber-700" },
                { label: "Showing", count: filtered.length, color: "bg-slate-50 border-slate-200 text-slate-700" },
              ].map(s => (
                <div key={s.label} className={`p-2 rounded-xl border-2 text-center ${s.color}`}>
                  <p className="text-lg font-bold">{s.count}</p>
                  <p className="text-xs font-semibold">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Disease cards */}
            {filtered.length > 0 ? (
              filtered.map(condition => (
                <RheumPathwayCard
                  key={condition.id}
                  condition={condition}
                  isAdmin={isAdmin}
                  savedUpdates={savedUpdates}
                  onSaveUpdate={handleSaveUpdate}
                />
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm">
                No conditions match your search
              </div>
            )}

            {/* Cross-specialty navigation chips */}
            {!search && (
              <div className="bg-white border border-slate-200 rounded-xl p-3 mt-2">
                <CrossSpecialtyLinks context="lupus" />
              </div>
            )}
          </>
        )}

        {/* ── APPROACHES TAB ── */}
        {mainTab === "approaches" && <RheumApproaches />}

        {/* ── DRUGS TAB ── */}
        {mainTab === "drugs" && <RheumDrugCards />}

        {/* ── CALCULATORS TAB ── */}
        {mainTab === "calculators" && <RheumDiseaseActivityCalculators />}

        {/* ── NEPHROLOGY OVERLAP TAB ── */}
        {mainTab === "nephrology" && <RheumNephrologyOverlap overlaps={NEPHROLOGY_OVERLAPS} />}

        {/* ── MONITORING TAB ── */}
        {mainTab === "monitoring" && <UnifiedMonitoringPanel />}

        {/* ── EVIDENCE UPDATES TAB ── */}
        {mainTab === "updates" && <RheumEvidenceUpdates isAdmin={isAdmin} />}

      </div>
    </div>
  );
}