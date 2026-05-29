import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, BookOpen, ArrowLeft, ChevronRight, Calendar, Globe,
  GitBranch, Baby
} from "lucide-react";
import AdminEditButton from "../components/admin/AdminEditButton";
import AlgorithmFlowchart from "../components/guidelines/AlgorithmFlowchart";

// ─── Source filter chips ──────────────────────────────────────────────────────
const SOURCES = ["All", "IAP", "WHO", "AAP", "ISPN", "KDIGO", "IPNA", "ERKNet", "EAU/ESPU", "EULAR/ACR", "KDOQI", "ISPD", "ESPN"];

// ─── Category tabs ────────────────────────────────────────────────────────────
const CATEGORY_TABS = [
  { id: "all",         label: "All",                filter: null },
  { id: "gen_peds",   label: "General Pediatrics",  filter: "General Pediatrics" },
  { id: "nephrology", label: "Nephrology",           filter: ["AKI", "CKD", "Nephrotic Syndrome", "Dialysis", "Transplant", "Glomerular Diseases", "Tubular Disorders", "Electrolytes", "Acid-Base", "RTA", "Stones", "Hypertension"] },
  { id: "rheumatology",label: "Rheumatology",        filter: ["Rheumatology"] },
  { id: "endocrine",  label: "Endocrinology",        filter: ["Endocrinology"] },
  { id: "rare",       label: "Rare Disease",         filter: "Rare Disease" },
  { id: "infection",  label: "Infection",            filter: "Infection" },
  { id: "nutrition",  label: "Nutrition & Growth",   filter: "Nutrition & Growth" },
];

const SOURCE_COLORS = {
  ISPN: "bg-green-100 text-green-800 border-green-300",
  KDIGO: "bg-blue-100 text-blue-800 border-blue-300",
  IPNA: "bg-purple-100 text-purple-800 border-purple-300",
  ERKNet: "bg-teal-100 text-teal-800 border-teal-300",
  "EAU/ESPU": "bg-orange-100 text-orange-800 border-orange-300",
  "EULAR/ACR": "bg-rose-100 text-rose-800 border-rose-300",
  KDOQI: "bg-cyan-100 text-cyan-800 border-cyan-300",
  ISPD: "bg-indigo-100 text-indigo-800 border-indigo-300",
  IAP: "bg-amber-100 text-amber-800 border-amber-300",
  AAP: "bg-sky-100 text-sky-800 border-sky-300",
  ESPN: "bg-violet-100 text-violet-800 border-violet-300",
  WHO: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

// ─── GuidelineDetail — detail view with algorithm flowchart ──────────────────
function GuidelineDetail({ guideline, onBack }) {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me(), staleTime: 60000 });
  const isAdmin = user?.role === "admin";
  const hasAlgo = guideline.algorithm && guideline.algorithm.nodes?.length > 0;

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5 h-9 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      {/* Header banner */}
      <div className={`rounded-xl p-4 ${guideline.source === "ISPN" ? "bg-green-700" : guideline.source === "IAP" ? "bg-amber-700" : "bg-blue-700"} text-white`}>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge className="bg-white/25 text-white text-xs border-0">{guideline.source}</Badge>
          {guideline.source === "ISPN" && <Badge className="bg-green-400/30 text-white text-xs border border-green-300/50">Primary — India</Badge>}
          {guideline.source === "IAP" && <Badge className="bg-amber-400/30 text-white text-xs border border-amber-300/50">IAP — India</Badge>}
          {guideline.year && <Badge className="bg-white/20 text-white text-xs border-0">{guideline.year}</Badge>}
          {guideline.region && <Badge className="bg-white/20 text-white text-xs border-0 flex items-center gap-1"><Globe className="w-3 h-3" />{guideline.region}</Badge>}
          {hasAlgo && <Badge className="bg-white/20 text-white text-xs border-0 flex items-center gap-1"><GitBranch className="w-3 h-3" />Has Algorithm</Badge>}
        </div>
        <h1 className="text-lg font-bold leading-snug">{guideline.title}</h1>
        {guideline.organization && <p className="text-sm text-white/80 mt-1">{guideline.organization}</p>}
      </div>

      {/* Algorithm ABOVE key recommendations */}
      {hasAlgo && <AlgorithmFlowchart algorithm={guideline.algorithm} />}

      {guideline.scope_and_population && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Scope & Population</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{guideline.scope_and_population}</p>
          </CardContent>
        </Card>
      )}

      {guideline.summary && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Summary</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{guideline.summary}</p>
          </CardContent>
        </Card>
      )}

      {guideline.key_recommendations?.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Key Recommendations</h2>
            <ol className="space-y-2">
              {guideline.key_recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <p className="text-sm text-slate-700 leading-relaxed">{rec}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {guideline.practice_pearls?.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Practice Pearls</h2>
            <ul className="space-y-2">
              {guideline.practice_pearls.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="text-amber-500 flex-shrink-0">◆</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {guideline.category && (
        <div className="flex flex-wrap gap-2 pb-4 items-center">
          <Badge variant="outline" className="text-xs">{guideline.category}</Badge>
          {guideline.evidence_level && <Badge variant="outline" className="text-xs">Evidence: {guideline.evidence_level}</Badge>}
          {isAdmin && (
            <AdminEditButton
              label="Edit Guideline"
              content={JSON.stringify({ summary: guideline.summary, key_recommendations: guideline.key_recommendations }, null, 2)}
              onSave={async (val) => {
                const parsed = JSON.parse(val);
                await base44.entities.Guideline.update(guideline.id, parsed);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Guideline card in list ───────────────────────────────────────────────────
function GuidelineCard({ g, onSelect }) {
  const hasAlgo = g.algorithm && g.algorithm.nodes?.length > 0;
  return (
    <button
      onClick={() => onSelect(g.id)}
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-3.5 hover:border-blue-300 hover:shadow-sm transition-all active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SOURCE_COLORS[g.source] || "bg-slate-100 text-slate-700 border-slate-300"}`}>
              {g.source}
            </span>
            {g.source === "ISPN" && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">Primary — India</span>
            )}
            {g.year && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />{g.year}
              </span>
            )}
            {hasAlgo && (
              <span className="text-xs text-blue-600 flex items-center gap-1 font-semibold">
                <GitBranch className="w-3 h-3" />Algorithm
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-snug">{g.title}</p>
          {g.summary && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{g.summary}</p>
          )}
          {g.category && (
            <span className="text-xs text-slate-400 mt-0.5 inline-block">{g.category}</span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

// ─── General Pediatrics tab with algorithm-first card view ───────────────────
function GenPedsTab({ guidelines, onSelect }) {
  const items = useMemo(() => guidelines.filter(g => g.category === "General Pediatrics"), [guidelines]);

  if (items.length === 0) return (
    <div className="text-center py-16 text-slate-400">
      <Baby className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm">No General Pediatrics guidelines found</p>
      <p className="text-xs mt-1 text-slate-300">Add guidelines with category = "General Pediatrics" to see them here</p>
    </div>
  );

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map(g => {
        const hasAlgo = g.algorithm && g.algorithm.nodes?.length > 0;
        return (
          <div key={g.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:shadow-md transition-all flex flex-col gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SOURCE_COLORS[g.source] || "bg-slate-100 text-slate-700 border-slate-300"}`}>
                  {g.source}
                </span>
                {g.year && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{g.year}
                  </span>
                )}
                {hasAlgo && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs flex items-center gap-1">
                    <GitBranch className="w-2.5 h-2.5" />Algorithm
                  </Badge>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1">{g.title}</h3>
              {g.summary && (
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{g.summary}</p>
              )}
            </div>

            {/* Inline mini algorithm preview for cards with algorithm */}
            {hasAlgo && (
              <AlgorithmFlowchart algorithm={g.algorithm} compact />
            )}

            <Button
              size="sm"
              onClick={() => onSelect(g.id)}
              className="bg-teal-600 hover:bg-teal-700 text-white h-8 text-xs mt-auto"
            >
              View Full Guideline <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GuidelinesLibrary() {
  const [search, setSearch] = useState("");
  const [activeSource, setActiveSource] = useState("All");
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState(null);

  // ── Fetch ALL guidelines at once (200 limit), show full skeleton until ready ──
  const { data: guidelines = [], isLoading } = useQuery({
    queryKey: ["guidelines_library_v2"],
    queryFn: () => base44.entities.Guideline.list("-year", 200),
    staleTime: 120000,
  });

  // ── Client-side filtering ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const tab = CATEGORY_TABS.find(t => t.id === activeTab);
    return guidelines.filter(g => {
      // Tab filter
      if (tab?.filter) {
        if (Array.isArray(tab.filter)) {
          if (!tab.filter.includes(g.category)) return false;
        } else {
          if (g.category !== tab.filter) return false;
        }
      }
      // Source filter
      if (activeSource !== "All" && g.source !== activeSource) return false;
      // Search filter
      const q = search.toLowerCase();
      if (q) {
        return (
          g.title?.toLowerCase().includes(q) ||
          g.category?.toLowerCase().includes(q) ||
          g.summary?.toLowerCase().includes(q) ||
          g.source?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [guidelines, activeTab, activeSource, search]);

  const selected_guideline = selected ? guidelines.find(g => g.id === selected) : null;

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl h-20 animate-pulse border border-slate-200" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-x-hidden">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-5">
        <div className="flex items-center gap-3 mb-4">
          {selected_guideline && (
            <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <BookOpen className="w-6 h-6 flex-shrink-0" />
          <h1 className="text-lg font-bold">
            {selected_guideline ? selected_guideline.title : "Clinical Guidelines"}
          </h1>
          {!selected_guideline && (
            <Badge className="bg-white/20 text-white border-0 text-xs ml-auto">
              {isLoading ? "Loading…" : `${guidelines.length} guidelines`}
            </Badge>
          )}
        </div>
        {!selected_guideline && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search guidelines, categories, sources…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/20 text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/30 border border-white/20"
            />
          </div>
        )}
      </div>

      {/* ── Category tabs ── */}
      {!selected_guideline && (
        <div className="bg-white border-b border-slate-200 px-3 pt-2">
          <div className="flex gap-1 overflow-x-auto pb-0" style={{ scrollbarWidth: "none" }}>
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.id === "gen_peds" && <Baby className="w-3 h-3 inline mr-1" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Source filter chips ── */}
      {!selected_guideline && activeTab !== "gen_peds" && (
        <div className="bg-white border-b border-slate-200 px-3 py-2">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {SOURCES.map(src => (
              <button
                key={src}
                onClick={() => setActiveSource(src)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  activeSource === src
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-4 py-4">
        {selected_guideline ? (
          <GuidelineDetail guideline={selected_guideline} onBack={() => setSelected(null)} />
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : activeTab === "gen_peds" ? (
          /* General Pediatrics grid view */
          <GenPedsTab guidelines={guidelines} onSelect={setSelected} />
        ) : (
          /* All other tabs — standard list */
          <>
            <p className="text-xs text-slate-500 mb-3">
              {filtered.length} guideline{filtered.length !== 1 ? "s" : ""}
              {activeSource !== "All" ? ` · ${activeSource}` : ""}
            </p>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No guidelines found</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map(g => (
                  <GuidelineCard key={g.id} g={g} onSelect={setSelected} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}