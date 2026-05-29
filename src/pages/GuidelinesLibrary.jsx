import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookOpen, ArrowLeft, ChevronRight, Calendar, Globe, Baby, Filter, GitBranch } from "lucide-react";
import AdminEditButton from "../components/admin/AdminEditButton";
import GuidelineDetailView from "../components/guidelines/GuidelineDetailView";
import { BUILTIN_GUIDELINES } from "@/lib/guidelines/index";

const SOURCES = ["All", "ISPN", "KDIGO", "IPNA", "ERKNet", "EAU/ESPU", "EULAR/ACR", "KDOQI", "ISPD", "IAP", "AAP", "ESPN", "WHO"];

const LIBRARY_TABS = [
  { id: "all", label: "All Guidelines" },
  { id: "general-peds", label: "General Pediatrics (IAP)" },
  { id: "nephrology", label: "Nephrology" },
];

const GENERAL_PEDS_CATEGORIES = ["General Pediatrics", "Neonatology", "Immunisation", "Nutrition & Growth", "Developmental Pediatrics", "Adolescent Health", "Gastroenterology", "Respiratory", "Neurology", "Infection", "Endocrinology"];
const NEPHROLOGY_CATEGORIES = ["AKI", "CKD", "Nephrotic Syndrome", "Hypertension", "Glomerular Diseases", "Tubular Disorders", "Dialysis", "Transplant", "Electrolytes", "Acid-Base", "Stones", "Rare Disease"];

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
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me(), staleTime: 60000 });
  const isAdmin = user?.role === "admin";

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

function GuidelineCard({ g, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-3.5 hover:border-blue-300 hover:shadow-sm transition-all active:scale-[0.99]">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SOURCE_COLORS[g.source] || "bg-slate-100 text-slate-700 border-slate-300"}`}>
              {g.source}
            </span>
            {g.source === "IAP" && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300">IAP STG</span>
            )}
            {g.year && <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{g.year}</span>}
            {g.category && <Badge variant="outline" className="text-xs">{g.category}</Badge>}
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-snug">{g.title}</p>
          {g.summary && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{g.summary}</p>}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

export default function GuidelinesLibrary() {
  const [search, setSearch] = useState("");
  const [activeSource, setActiveSource] = useState("All");
  const [libraryTab, setLibraryTab] = useState("all");
  const [selected, setSelected] = useState(null);
  const [detailMode, setDetailMode] = useState(false);

  const { data: dbGuidelines = [], isLoading } = useQuery({
    queryKey: ["guidelines_library"],
    queryFn: () => base44.entities.Guideline.list("-year", 200),
    initialData: [],
  });

  const guidelines = useMemo(() => [
    ...BUILTIN_GUIDELINES,
    ...dbGuidelines.map(g => ({ ...g, _db: true }))
  ], [dbGuidelines]);

  const filtered = useMemo(() => {
    return guidelines.filter(g => {
      const matchSource = activeSource === "All" || g.source === activeSource;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        g.title?.toLowerCase().includes(q) ||
        g.category?.toLowerCase().includes(q) ||
        g.summary?.toLowerCase().includes(q) ||
        g.source?.toLowerCase().includes(q);
      const matchTab = libraryTab === "all" ||
        (libraryTab === "general-peds" && GENERAL_PEDS_CATEGORIES.includes(g.category)) ||
        (libraryTab === "nephrology" && NEPHROLOGY_CATEGORIES.includes(g.category));
      return matchSource && matchSearch && matchTab;
    });
  }, [guidelines, activeSource, search, libraryTab]);

  const selected_guideline = selected ? guidelines.find(g => g.id === selected || g.title === selected) : null;

  const handleSelectGuideline = (g) => {
    setSelected(g.id || g.title);
    setDetailMode(true);
  };

  const handleBack = () => {
    setSelected(null);
    setDetailMode(false);
  };

  // Group general peds by category
  const generalPedsGrouped = useMemo(() => {
    if (libraryTab !== "general-peds") return {};
    return GENERAL_PEDS_CATEGORIES.reduce((acc, cat) => {
      const items = filtered.filter(g => g.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    }, {});
  }, [filtered, libraryTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-5">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 flex-shrink-0" />
          <h1 className="text-lg font-bold">Clinical Guidelines</h1>
          <Badge className="bg-white/25 text-white border-0 text-xs ml-auto">{guidelines.length} guidelines · {BUILTIN_GUIDELINES.length} built-in</Badge>
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

      {/* Library tabs */}
      <div className="bg-white border-b border-slate-200 px-3 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {LIBRARY_TABS.map(tab => (
            <button key={tab.id} onClick={() => setLibraryTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${libraryTab === tab.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
              {tab.id === "general-peds" && <Baby className="w-3 h-3" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Source filter chips */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SOURCES.map(src => (
            <button key={src} onClick={() => setActiveSource(src)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${activeSource === src ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300"}`}>
              {src}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {selected_guideline && detailMode ? (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={handleBack} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to Guidelines
            </Button>
            <GuidelineDetailView guideline={selected_guideline} defaultMode="detailed" />
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-3">{filtered.length} guideline{filtered.length !== 1 ? "s" : ""}</p>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl h-20 animate-pulse border border-slate-200" />)}
              </div>
            ) : libraryTab === "general-peds" ? (
              <div className="space-y-5">
                {Object.entries(generalPedsGrouped).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-2">
                      <Baby className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-bold text-slate-800">{cat}</h3>
                      <Badge className="bg-amber-100 text-amber-700 text-xs border-0">{items.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {items.map(g => <GuidelineCard key={g.id} g={g} onClick={() => handleSelectGuideline(g)} />)}
                    </div>
                  </div>
                ))}
                {Object.keys(generalPedsGrouped).length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Baby className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No General Pediatrics guidelines yet</p>
                    <p className="text-xs mt-1">Add guidelines with category "General Pediatrics" or "Immunisation"</p>
                  </div>
                )}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No guidelines found</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map(g => <GuidelineCard key={g.id} g={g} onClick={() => handleSelectGuideline(g)} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}