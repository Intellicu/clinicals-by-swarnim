/**
 * GUIDELINE COMPARISON ENGINE
 * Side-by-side comparison of clinical definitions across organizations
 * Mobile-first, expandable, with controversy highlights
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitCompare, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, History } from "lucide-react";
import {
  getMultiOrgDefinition, compareDefinitions, getComparisonTopics,
  MULTI_ORG_DEFINITIONS
} from "@/lib/clinicalOS/EvidenceGovernance";
import { OrgBadge } from "./EvidenceAuthorityPanel";

const TOPIC_LABELS = {
  SRNS: "SRNS (Steroid-Resistant NS)",
  FRNS: "FRNS (Frequently Relapsing NS)",
  SDNS: "SDNS (Steroid-Dependent NS)",
  NS_REMISSION: "NS Complete Remission",
  NS_RELAPSE: "NS Relapse",
  AKI_STAGING: "Pediatric AKI Staging",
  PEDIATRIC_HTN: "Pediatric Hypertension",
  PD_ADEQUACY: "PD Adequacy Target",
};

function DefinitionCard({ def, isPrimary = false }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`border-2 rounded-xl overflow-hidden ${isPrimary ? "border-blue-400 bg-blue-50/40" : def.is_historical ? "border-slate-300 bg-slate-50 opacity-75" : "border-slate-200 bg-white"}`}>
      {/* Header */}
      <div className={`px-3 py-2 flex items-center gap-2 ${isPrimary ? "bg-blue-100/60" : def.is_historical ? "bg-slate-100" : "bg-slate-50"}`}>
        <OrgBadge org={def.org} year={def.year} />
        {isPrimary && <Badge className="text-xs bg-blue-600 text-white border-0">Primary</Badge>}
        {def.is_historical && <Badge className="text-xs bg-slate-500 text-white border-0">Historical</Badge>}
        <button className="ml-auto" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>

      {/* Criteria */}
      <div className="p-3">
        <p className="text-xs text-slate-700 leading-relaxed font-medium">{def.criteria}</p>

        {/* Thresholds */}
        {def.thresholds && Object.keys(def.thresholds).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(def.thresholds).map(([k, v]) => (
              <span key={k} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                {k.replace(/_/g, " ")}: <strong>{v}</strong>
              </span>
            ))}
          </div>
        )}

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
            {def.operational_implications && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                <p className="text-xs font-bold text-amber-800 mb-0.5 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Operational Implications
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">{def.operational_implications}</p>
              </div>
            )}
            {def.note && (
              <p className="text-xs text-slate-500 italic leading-relaxed">
                <strong>Note:</strong> {def.note}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuidelineComparisonEngine({ defaultTopic }) {
  const [selectedTopic, setSelectedTopic] = useState(defaultTopic || "SRNS");
  const [showAll, setShowAll] = useState(false);

  const topics = getComparisonTopics();
  const concept = getMultiOrgDefinition(selectedTopic);

  return (
    <div className="space-y-3">
      {/* Topic selector */}
      <div className="flex flex-wrap gap-1.5">
        {topics.map(t => (
          <button key={t.id}
            onClick={() => setSelectedTopic(t.id)}
            className={`px-2.5 py-1 text-xs rounded-full border font-semibold transition-colors flex items-center gap-1 ${selectedTopic === t.id
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}
          >
            {TOPIC_LABELS[t.id] || t.term}
            {t.has_controversy && <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />}
            {t.has_controversy && selectedTopic !== t.id && <span className="text-amber-500" title="Controversy exists">!</span>}
          </button>
        ))}
      </div>

      {concept && (
        <div className="space-y-3">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <GitCompare className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm leading-snug">{concept.term}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{concept.clinical_importance}</p>
              </div>
              <Badge className="text-xs bg-indigo-100 text-indigo-800 border-0 flex-shrink-0">
                {concept.definitions.length} orgs
              </Badge>
            </div>
          </div>

          {/* Controversy banner */}
          {concept.controversy && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">Clinical Controversy</p>
                <p className="text-xs text-amber-700 leading-relaxed mt-0.5">{concept.controversy}</p>
              </div>
            </div>
          )}

          {/* Definitions */}
          <div className="space-y-2.5">
            {concept.definitions
              .filter(d => showAll || !d.is_historical)
              .map((def, i) => (
                <DefinitionCard key={i} def={def} isPrimary={i === 0 && !def.is_historical} />
              ))
            }
          </div>

          {/* Show historical toggle */}
          {concept.definitions.some(d => d.is_historical) && (
            <button onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
              <History className="w-3.5 h-3.5" />
              {showAll ? "Hide historical definitions" : "Show historical definitions"}
            </button>
          )}

          {/* Consensus summary */}
          {concept.consensus_summary && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-green-800">Consensus Summary</p>
                <p className="text-xs text-green-700 leading-relaxed mt-0.5">{concept.consensus_summary}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}