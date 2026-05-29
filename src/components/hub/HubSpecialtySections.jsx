import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TestTube, Search, Bot, Microscope, Dna, Zap, Brain, Beaker,
  FlaskConical, ChevronRight, ArrowLeft, BookOpen, Filter, Star, AlertTriangle, ExternalLink
} from "lucide-react";
import GuidelineDetailView from "../guidelines/GuidelineDetailView";
import ConsolidatedAIHub from "./ConsolidatedAIHub";

// ─── Icon map for CustomTool icons ───────────────────────────
const ICON_MAP = {
  microscope: Microscope, bot: Bot, dna: Dna, zap: Zap,
  brain: Brain, beaker: Beaker, "flask-conical": FlaskConical,
  "test-tube": TestTube, search: Search, "book-open": BookOpen,
};
function resolveIcon(name) {
  return ICON_MAP[name] || Bot;
}

// ─── Tubular Disorders & RTA Section ─────────────────────────
export function TubularDisordersSection({ onNavigate }) {
  const [selectedGuideline, setSelectedGuideline] = useState(null);
  const [search, setSearch] = useState("");
  const [subFilter, setSubFilter] = useState("All");

  const SUB_FILTERS = ["All", "RTA", "Fanconi/Genetic", "Channelopathy", "Concentration Defect", "Phosphate Wasting", "Dent/Lowe"];
  const SUB_FILTER_MAP = {
    "RTA": ["rta", "renal tubular acidosis", "proximal rta", "distal rta"],
    "Fanconi/Genetic": ["fanconi", "cystinosis", "lowe", "galactosaemia"],
    "Channelopathy": ["bartter", "gitelman", "liddle", "gordon"],
    "Concentration Defect": ["nephrogenic diabetes insipidus", "ndi", "concentration"],
    "Phosphate Wasting": ["hypophosphatemic", "phosphate", "tmp", "trp", "xlh"],
    "Dent/Lowe": ["dent", "lowe", "ocrl"],
  };

  const { data: guidelines = [], isLoading } = useQuery({
    queryKey: ["guidelines_tubular_v2"],
    queryFn: () => base44.entities.Guideline.filter(
      { category: { $in: ["Tubular Disorders", "RTA"] } },
      "-year", 200
    ),
    staleTime: 60000,
  });

  const filtered = guidelines.filter(g => {
    const matchSearch = !search || g.title?.toLowerCase().includes(search.toLowerCase()) ||
      g.keywords?.some(k => k.toLowerCase().includes(search.toLowerCase()));
    if (!matchSearch) return false;
    if (subFilter === "All") return true;
    const terms = SUB_FILTER_MAP[subFilter] || [];
    return terms.some(t => g.title?.toLowerCase().includes(t) || g.summary?.toLowerCase().includes(t));
  });

  if (selectedGuideline) {
    return (
      <div className="p-4 space-y-4">
        <Button variant="outline" size="sm" onClick={() => setSelectedGuideline(null)} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Tubular Disorders
        </Button>
        <GuidelineDetailView guideline={selectedGuideline} defaultMode="detailed" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="p-4 bg-gradient-to-r from-cyan-700 to-teal-700 text-white rounded-xl">
        <div className="flex items-center gap-3 mb-1">
          <TestTube className="w-6 h-6 flex-shrink-0" />
          <h2 className="font-bold text-base">Tubular Disorders & RTA</h2>
          <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">{guidelines.length} conditions</span>
        </div>
        <p className="text-xs text-cyan-100 ml-9">RTA Types 1/2/4 · Bartter · Gitelman · Fanconi · NDI · Dent Disease · Lowe · Hypophosphatemic Rickets · Cystinosis</p>
      </div>

      {/* Sub-filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 px-4" style={{ scrollbarWidth: "none" }}>
        {SUB_FILTERS.map(f => (
          <button key={f} onClick={() => setSubFilter(f)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${subFilter === f ? "bg-cyan-600 text-white border-cyan-600" : "bg-white text-slate-600 border-slate-300 hover:border-cyan-400"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tubular guidelines…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300" />
        </div>

        <p className="text-xs text-slate-500">{filtered.length} condition{filtered.length !== 1 ? "s" : ""} found</p>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <TestTube className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No tubular guidelines found for this filter</p>
            <p className="text-xs mt-1">Try "All" or check the Guidelines Library to add records with category "Tubular Disorders" or "RTA"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(g => (
              <TubularGuidelineCard key={g.id} guideline={g} onClick={() => setSelectedGuideline(g)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TubularGuidelineCard({ guideline: g, onClick }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-cyan-100 rounded-xl overflow-hidden hover:border-cyan-300 hover:shadow-sm transition-all">
      <button onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300 text-xs border">{g.source || "ISPN"}</Badge>
              {g.year && <span className="text-xs text-slate-400">{g.year}</span>}
              <Badge variant="outline" className="text-xs">{g.category}</Badge>
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-snug">{g.title}</p>
            {g.summary && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{g.summary}</p>}
          </div>
          <div className="flex flex-col gap-1 flex-shrink-0">
            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </div>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-cyan-100 p-3 space-y-2 bg-cyan-50/30">
          {g.content?.sections?.map((s, i) => (
            <div key={i} className="bg-white rounded-lg border border-cyan-100 p-3">
              <p className="text-xs font-bold text-cyan-800 mb-1">{s.heading}</p>
              {s.content && <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{s.content}</p>}
              {s.key_points?.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {s.key_points.map((kp, j) => <li key={j} className="text-xs text-slate-600 flex gap-1.5"><span className="text-cyan-500">•</span>{kp}</li>)}
                </ul>
              )}
            </div>
          ))}
          {(!g.content?.sections || g.content.sections.length === 0) && g.key_recommendations?.length > 0 && (
            <ul className="space-y-1">
              {g.key_recommendations.map((r, i) => <li key={i} className="text-xs text-slate-700 flex gap-1.5"><span className="text-cyan-500 font-bold">{i+1}.</span>{r}</li>)}
            </ul>
          )}
          <button onClick={onClick} className="text-xs text-cyan-700 font-semibold hover:underline">View Full Guideline →</button>
        </div>
      )}
    </div>
  );
}

// ─── Clinical AI Agents Hub Section ──────────────────────────
export function ClinicalAIAgentsSection({ onLaunchTool }) {
  return (
    <div className="p-4">
      <ConsolidatedAIHub />
    </div>
  );
}

// ─── Rare Disease Screening Tools Section ────────────────────
export function RareDiseaseScreeningSection() {
  const [selectedGuideline, setSelectedGuideline] = useState(null);
  const [search, setSearch] = useState("");

  const { data: guidelines = [], isLoading } = useQuery({
    queryKey: ["guidelines_rare_disease"],
    queryFn: () => base44.entities.Guideline.filter({ category: "Rare Disease" }, "-year", 50),
    staleTime: 60000,
  });

  const RED_FLAG_TITLE = "Rare Disease Screening — Red Flag Checklist, Cascade Testing and Orphan Drug Access";
  const redFlagGuide = guidelines.find(g => g.title === RED_FLAG_TITLE);
  const otherGuidelines = guidelines.filter(g => g.title !== RED_FLAG_TITLE);

  const filteredOthers = otherGuidelines.filter(g =>
    !search || g.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedGuideline) {
    return (
      <div className="p-4 space-y-4">
        <Button variant="outline" size="sm" onClick={() => setSelectedGuideline(null)} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Rare Disease Screening
        </Button>
        <GuidelineDetailView guideline={selectedGuideline} defaultMode="detailed" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
        <Search className="w-6 h-6 text-rose-700 flex-shrink-0" />
        <div>
          <h2 className="font-bold text-rose-900 text-sm">Rare Disease Screening Tools</h2>
          <p className="text-xs text-rose-700">Red-flag checklists · Cascade testing · Newborn screening · Orphan drug access</p>
        </div>
      </div>

      {/* Highlighted red-flag guideline */}
      {!isLoading && redFlagGuide && (
        <button
          onClick={() => setSelectedGuideline(redFlagGuide)}
          className="w-full text-left bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-300 rounded-xl p-4 hover:shadow-md transition-all active:scale-[0.99]"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <Badge className="bg-rose-600 text-white border-0 text-xs">Featured</Badge>
                <Badge variant="outline" className="text-xs border-rose-300 text-rose-700">Rare Disease</Badge>
                {redFlagGuide.year && <span className="text-xs text-rose-500">{redFlagGuide.year}</span>}
              </div>
              <p className="text-sm font-bold text-rose-900 leading-snug">{redFlagGuide.title}</p>
              {redFlagGuide.summary && (
                <p className="text-xs text-rose-700 mt-1 leading-relaxed line-clamp-2">{redFlagGuide.summary}</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400 flex-shrink-0 mt-1" />
          </div>
        </button>
      )}

      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter rare disease guidelines…"
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filteredOthers.length === 0 && !redFlagGuide ? (
        <div className="text-center py-10 text-slate-400">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No rare disease guidelines found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOthers.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGuideline(g)}
              className="w-full text-left bg-white border border-rose-100 rounded-xl p-3.5 hover:border-rose-300 hover:shadow-sm transition-all active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs border">{g.source}</Badge>
                    {g.year && <span className="text-xs text-slate-400">{g.year}</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{g.title}</p>
                  {g.summary && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{g.summary}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}