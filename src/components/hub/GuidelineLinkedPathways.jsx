/**
 * GuidelineLinkedPathways
 * "General Pediatric Pathways" section — each tile is matched against
 * live Guideline records (category = "General Pediatrics"). Matched tiles
 * are active and open a guideline detail sheet; unmatched tiles are greyed out.
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Baby, Brain, Droplet, Waves, AlertCircle,
  Beaker, Heart, GitBranch, ChevronDown, ChevronUp, X, BookOpen,
  CheckSquare, ChevronRight
} from "lucide-react";

const PATHWAY_TILES = [
  { name: "Fever Approach", icon: Activity, keywords: ["fever"] },
  { name: "Failure to Thrive", icon: Baby, keywords: ["failure to thrive", "ftt"] },
  { name: "Developmental Delay", icon: Brain, keywords: ["developmental delay", "developmental"] },
  { name: "Short Stature", icon: Baby, keywords: ["short stature", "growth"] },
  { name: "Obesity & BMI", icon: Baby, keywords: ["obesity", "bmi"] },
  { name: "Anemia Approach", icon: Droplet, keywords: ["anemia", "anaemia"] },
  { name: "Neonatal Jaundice", icon: Baby, keywords: ["jaundice", "neonatal jaundice"] },
  { name: "Dehydration", icon: Waves, keywords: ["dehydration"] },
  { name: "Shock Approach", icon: AlertCircle, keywords: ["shock"] },
  { name: "Seizures Pathway", icon: Brain, keywords: ["seizure", "epilepsy"] },
  { name: "Poisoning Approach", icon: Beaker, keywords: ["poisoning", "toxicology"] },
  { name: "Pediatric HTN Pathway", icon: Heart, keywords: ["hypertension", "htn"] },
];

function matchGuideline(tile, guidelines) {
  if (!guidelines) return null;
  const kws = tile.keywords;
  return guidelines.find((g) => {
    const title = (g.title || "").toLowerCase();
    return kws.some((kw) => title.includes(kw));
  }) || null;
}

// ── Guideline detail sheet ──────────────────────────────────────────────────
function GuidelineSheet({ guideline, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-3 top-12 bottom-8 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight line-clamp-2">{guideline.title}</p>
            <p className="text-sky-200 text-xs mt-0.5">{guideline.source} {guideline.year && `· ${guideline.year}`}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {guideline.summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-800 mb-1">Summary</p>
              <p className="text-xs text-slate-700">{guideline.summary}</p>
            </div>
          )}

          {guideline.scope_and_population && (
            <div>
              <p className="text-xs font-bold text-slate-700 mb-1">Scope & Population</p>
              <p className="text-xs text-slate-600">{guideline.scope_and_population}</p>
            </div>
          )}

          {guideline.key_recommendations?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-green-600" /> Key Recommendations
              </p>
              <ul className="space-y-1.5">
                {guideline.key_recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    <span className="text-xs text-slate-600">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {guideline.practice_pearls?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Practice Pearls</p>
              <ul className="space-y-1">
                {guideline.practice_pearls.map((p, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">★</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Algorithm sections */}
          {guideline.algorithm?.nodes?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Clinical Algorithm</p>
              <div className="space-y-2">
                {guideline.algorithm.nodes.slice(0, 6).map((node) => {
                  const colorMap = {
                    green: "bg-green-50 border-green-200 text-green-800",
                    red: "bg-red-50 border-red-200 text-red-800",
                    orange: "bg-orange-50 border-orange-200 text-orange-800",
                    blue: "bg-blue-50 border-blue-200 text-blue-800",
                    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
                  };
                  const cls = colorMap[node.color] || "bg-slate-50 border-slate-200 text-slate-700";
                  return (
                    <div key={node.id} className={`border rounded-lg px-3 py-2 text-xs ${cls}`}>
                      <span className="font-semibold capitalize">[{node.type}]</span> {node.text}
                      {node.detail && <p className="text-xs opacity-80 mt-0.5">{node.detail}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {guideline.content?.sections?.length > 0 && guideline.content.sections.map((sec, i) => (
            <div key={i}>
              <p className="text-xs font-bold text-slate-700 mb-1">{sec.heading}</p>
              {sec.content && <p className="text-xs text-slate-600">{sec.content}</p>}
              {sec.key_points?.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {sec.key_points.map((kp, j) => (
                    <li key={j} className="text-xs text-slate-600 flex items-start gap-1">
                      <span className="text-blue-400 mt-0.5">•</span>{kp}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {guideline.external_link && (
          <div className="flex-shrink-0 px-4 py-3 border-t border-slate-100">
            <a href={guideline.external_link} target="_blank" rel="noopener noreferrer"
              className="w-full bg-sky-600 text-white font-semibold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" /> View Full Guideline
            </a>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────
export default function GuidelineLinkedPathways() {
  const [open, setOpen] = useState(true);
  const [selectedGuideline, setSelectedGuideline] = useState(null);

  const { data: guidelines, isLoading } = useQuery({
    queryKey: ["guidelines-general-pediatrics"],
    queryFn: () => base44.entities.Guideline.filter({ category: "General Pediatrics" }, undefined, 200),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-3 py-2.5 text-left focus:outline-none"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-sky-600" />
            <span className="text-sm font-bold text-slate-800">General Pediatric Pathways</span>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {open && (
          <div className="px-3 pb-3">
            {isLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => <div key={i} className="flex-shrink-0 w-[140px] h-20 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {PATHWAY_TILES.map((tile) => {
                  const matched = matchGuideline(tile, guidelines);
                  const Icon = tile.icon;

                  if (matched) {
                    return (
                      <button
                        key={tile.name}
                        onClick={() => setSelectedGuideline(matched)}
                        className="flex-shrink-0 min-w-[140px] bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-start gap-1.5 active:scale-95 transition-transform hover:border-sky-300 hover:shadow-sm text-left"
                      >
                        <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 leading-tight line-clamp-2">{tile.name}</span>
                        <span className="text-xs text-sky-500 leading-tight">Guideline →</span>
                      </button>
                    );
                  }

                  return (
                    <div
                      key={tile.name}
                      className="flex-shrink-0 min-w-[140px] bg-white border border-slate-100 rounded-xl p-3 flex flex-col items-start gap-1.5 opacity-50 cursor-not-allowed"
                    >
                      <div className="w-8 h-8 bg-slate-300 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 leading-tight line-clamp-2">{tile.name}</span>
                      <Badge variant="outline" className="text-xs px-1.5 py-0 text-slate-400 border-slate-200">Coming soon</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedGuideline && (
        <GuidelineSheet guideline={selectedGuideline} onClose={() => setSelectedGuideline(null)} />
      )}
    </>
  );
}