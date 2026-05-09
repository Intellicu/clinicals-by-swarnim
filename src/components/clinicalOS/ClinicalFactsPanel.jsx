/**
 * CLINICAL FACTS PANEL
 * Structured registry viewer with org-specific definitions,
 * evidence grades, comparison links, and mobile-first layout
 */
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen, ChevronDown, ChevronUp, GitCompare, AlertTriangle,
  CheckCircle, Info, ExternalLink, Award, Shield, Zap
} from "lucide-react";
import { CLINICAL_FACTS, getFactsForModule, getEmergencyFacts } from "@/lib/clinicalOS/ClinicalFactsRegistry";
import { OrgBadge } from "./EvidenceAuthorityPanel";

const MODULE_COLORS = {
  "Nephrotic Syndrome": "bg-purple-100 text-purple-800 border-purple-200",
  "AKI": "bg-red-100 text-red-800 border-red-200",
  "CKD": "bg-blue-100 text-blue-800 border-blue-200",
  "Hypertension": "bg-orange-100 text-orange-800 border-orange-200",
  "Dialysis": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Electrolytes": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Glomerular Diseases": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Transplant": "bg-teal-100 text-teal-800 border-teal-200",
};

const GRADE_COLORS = {
  A: "bg-green-100 text-green-800 border-green-300",
  B: "bg-blue-100 text-blue-800 border-blue-300",
  C: "bg-amber-100 text-amber-800 border-amber-300",
  D: "bg-slate-100 text-slate-700 border-slate-300",
};

const MODULES = ["All", "Nephrotic Syndrome", "AKI", "CKD", "Hypertension", "Dialysis", "Electrolytes", "Glomerular Diseases", "Transplant"];

function FactCard({ fact, onCompare }) {
  const [expanded, setExpanded] = useState(false);
  const hasOrgDefs = fact.org_definitions && Object.keys(fact.org_definitions).length > 0;

  return (
    <div className={`border-2 rounded-xl overflow-hidden bg-white ${fact.emergency ? "border-red-300" : "border-slate-200"} hover:shadow-sm transition-shadow`}>
      {/* Header */}
      <button
        className={`w-full text-left px-3 py-2.5 flex items-start gap-2 ${fact.emergency ? "bg-red-50" : "bg-slate-50/60"} hover:brightness-95 transition-all`}
        onClick={() => setExpanded(!expanded)}
      >
        {fact.emergency && <Zap className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <span className="text-sm font-bold text-slate-900 leading-snug">{fact.term}</span>
            {fact.evidence_grade && (
              <span className={`text-xs px-1.5 py-0.5 rounded border font-bold ${GRADE_COLORS[fact.evidence_grade] || GRADE_COLORS.C}`}>
                Grade {fact.evidence_grade}
              </span>
            )}
            {fact.emergency && <Badge className="text-xs bg-red-600 text-white border-0 py-0">Emergency</Badge>}
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{fact.primary_source}</p>
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {/* Definition (always visible condensed) */}
      <div className="px-3 py-2 border-t border-slate-100">
        <p className="text-xs text-slate-700 leading-relaxed">{fact.definition}</p>

        {/* Canonical values */}
        {fact.canonical_value && Object.keys(fact.canonical_value).length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {Object.entries(fact.canonical_value).map(([k, v]) => (
              <span key={k} className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-mono">
                {k.replace(/_/g, " ")}: <strong>{v}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-slate-100 bg-white">

          {/* Source row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-xs text-slate-500 font-semibold">Sources:</span>
            {fact.source?.split(" / ").map((s, i) => {
              const parts = s.trim().split(" ");
              return <OrgBadge key={i} org={parts[0]} year={parts[1]} />;
            })}
          </div>

          {/* Org-specific definitions */}
          {hasOrgDefs && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Organisation-Specific Definitions</p>
              {Object.entries(fact.org_definitions).map(([org, def]) => (
                <div key={org} className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-bold text-slate-700">{org}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{def}</p>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {fact.notes && (
            <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
              <Info className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">{fact.notes}</p>
            </div>
          )}

          {/* Linked modules */}
          {fact.linked_modules?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {fact.linked_modules.map(m => (
                <span key={m} className={`text-xs px-2 py-0.5 rounded-full border ${MODULE_COLORS[m] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {m}
                </span>
              ))}
            </div>
          )}

          {/* Compare button */}
          {fact.comparison_available && onCompare && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              onClick={() => onCompare(fact.comparison_id)}
            >
              <GitCompare className="w-3.5 h-3.5 mr-1.5" />
              Compare Definitions Across Organisations
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClinicalFactsPanel({ onCompare, showEmergencyOnly = false, defaultModule = "All" }) {
  const [selectedModule, setSelectedModule] = useState(defaultModule);
  const [search, setSearch] = useState("");

  const allFacts = Object.values(CLINICAL_FACTS);

  const filtered = allFacts.filter(f => {
    const moduleMatch = selectedModule === "All" || f.linked_modules?.includes(selectedModule);
    const emergencyMatch = !showEmergencyOnly || f.emergency;
    const searchMatch = !search ||
      f.term.toLowerCase().includes(search.toLowerCase()) ||
      f.definition.toLowerCase().includes(search.toLowerCase()) ||
      f.primary_source?.toLowerCase().includes(search.toLowerCase());
    return moduleMatch && emergencyMatch && searchMatch;
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <BookOpen className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-bold text-slate-800">Clinical Facts Registry</span>
        <Badge className="text-xs bg-blue-100 text-blue-800 border-0">{allFacts.length} definitions</Badge>
        <Badge className="text-xs bg-red-100 text-red-800 border-0 ml-auto flex items-center gap-0.5">
          <Zap className="w-2.5 h-2.5" />
          {allFacts.filter(f => f.emergency).length} emergency
        </Badge>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search definitions, terms, sources…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      {/* Module filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {MODULES.map(m => (
          <button
            key={m}
            onClick={() => setSelectedModule(m)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              selectedModule === m ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Facts */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No definitions found for this filter.</p>
        ) : (
          filtered.map(fact => (
            <FactCard key={fact.id} fact={fact} onCompare={onCompare} />
          ))
        )}
      </div>

      <p className="text-xs text-slate-400 text-center pt-1">
        Registry sourced from ISPN 2023 · IPNA 2020 · KDIGO 2021 · AAP 2017 · ISPD 2019
      </p>
    </div>
  );
}