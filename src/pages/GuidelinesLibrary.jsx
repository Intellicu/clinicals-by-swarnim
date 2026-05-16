import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookOpen, ArrowLeft, ChevronRight, Calendar, Globe } from "lucide-react";

const SOURCES = ["All", "ISPN", "KDIGO", "IPNA", "ERKNet", "EAU/ESPU", "EULAR/ACR", "KDOQI", "ISPD", "IAP", "AAP", "ESPN", "WHO"];

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

function GuidelineDetail({ guideline, onBack }) {
  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5 h-9 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className={`rounded-xl p-4 ${guideline.source === "ISPN" ? "bg-green-700" : "bg-blue-700"} text-white`}>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge className="bg-white/25 text-white text-xs border-0">{guideline.source}</Badge>
          {guideline.source === "ISPN" && (
            <Badge className="bg-green-400/30 text-white text-xs border border-green-300/50">Primary — India</Badge>
          )}
          {guideline.year && <Badge className="bg-white/20 text-white text-xs border-0">{guideline.year}</Badge>}
          {guideline.region && <Badge className="bg-white/20 text-white text-xs border-0 flex items-center gap-1"><Globe className="w-3 h-3" />{guideline.region}</Badge>}
        </div>
        <h1 className="text-lg font-bold leading-snug">{guideline.title}</h1>
        {guideline.organization && <p className="text-sm text-white/80 mt-1">{guideline.organization}</p>}
      </div>

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
        <div className="flex flex-wrap gap-2 pb-4">
          <Badge variant="outline" className="text-xs">{guideline.category}</Badge>
          {guideline.evidence_level && <Badge variant="outline" className="text-xs">Evidence: {guideline.evidence_level}</Badge>}
        </div>
      )}
    </div>
  );
}

export default function GuidelinesLibrary() {
  const [search, setSearch] = useState("");
  const [activeSource, setActiveSource] = useState("All");
  const [selected, setSelected] = useState(null);

  const { data: guidelines = [], isLoading } = useQuery({
    queryKey: ["guidelines_library"],
    queryFn: () => base44.entities.Guideline.list("-year", 200),
  });

  const filtered = useMemo(() => {
    return guidelines.filter(g => {
      const matchSource = activeSource === "All" || g.source === activeSource;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        g.title?.toLowerCase().includes(q) ||
        g.category?.toLowerCase().includes(q) ||
        g.summary?.toLowerCase().includes(q) ||
        g.source?.toLowerCase().includes(q);
      return matchSource && matchSearch;
    });
  }, [guidelines, activeSource, search]);

  const selected_guideline = selected ? guidelines.find(g => g.id === selected) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-5">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 flex-shrink-0" />
          <h1 className="text-lg font-bold">Clinical Guidelines</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guidelines…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/20 text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/30 border border-white/20"
          />
        </div>
      </div>

      {/* Source filter chips — horizontally scrollable */}
      <div className="bg-white border-b border-slate-200 px-3 py-2.5">
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
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

      <div className="p-4">
        {selected_guideline ? (
          <GuidelineDetail guideline={selected_guideline} onBack={() => setSelected(null)} />
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-3">{filtered.length} guideline{filtered.length !== 1 ? "s" : ""}</p>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-20 animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No guidelines found</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelected(g.id)}
                    className="w-full text-left bg-white rounded-xl border border-slate-200 p-3.5 hover:border-blue-300 hover:shadow-sm transition-all active:scale-[0.99] min-h-[64px]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SOURCE_COLORS[g.source] || "bg-slate-100 text-slate-700 border-slate-300"}`}>
                            {g.source}
                          </span>
                          {g.source === "ISPN" && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                              Primary — India
                            </span>
                          )}
                          {g.year && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />{g.year}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{g.title}</p>
                        {g.category && (
                          <span className="text-xs text-slate-500 mt-0.5 inline-block">{g.category}</span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}