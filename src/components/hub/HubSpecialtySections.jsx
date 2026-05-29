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

  const { data: guidelines = [], isLoading } = useQuery({
    queryKey: ["guidelines_tubular"],
    queryFn: () => base44.entities.Guideline.filter(
      { $or: [{ category: "Tubular Disorders" }, { category: "RTA" }] },
      "-year", 50
    ),
    staleTime: 60000,
  });

  const filtered = guidelines.filter(g =>
    !search || g.title?.toLowerCase().includes(search.toLowerCase())
  );

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
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 p-3 bg-cyan-50 border border-cyan-200 rounded-xl">
        <TestTube className="w-6 h-6 text-cyan-700 flex-shrink-0" />
        <div>
          <h2 className="font-bold text-cyan-900 text-sm">Tubular Disorders and RTA</h2>
          <p className="text-xs text-cyan-700">RTA Types 1/2/4 · Bartter · Gitelman · Fanconi · NDI · Dent Disease · Lowe · Hypophosphatemic Rickets</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tubular guidelines…"
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <TestTube className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No tubular guidelines found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGuideline(g)}
              className="w-full text-left bg-white border border-cyan-100 rounded-xl p-3.5 hover:border-cyan-300 hover:shadow-sm transition-all active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300 text-xs border">{g.source}</Badge>
                    {g.year && <span className="text-xs text-slate-400">{g.year}</span>}
                    <Badge variant="outline" className="text-xs">{g.category}</Badge>
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

// ─── Clinical AI Agents Hub Section ──────────────────────────
const AI_AGENT_TOOL_IDS = [
  "69da8d6ff7a5b0b5f5ffd618",
  "6a18de5a7b492cc13541c2ff",
  "6a18de82d78ca287ca28400c",
  "6a18deb5e408969f53f975aa",
  "6a18deea0030b96f4acce726",
  "69da8d6ff7a5b0b5f5ffd619",
  "69da8d6ff7a5b0b5f5ffd61a",
];

export function ClinicalAIAgentsSection({ onLaunchTool }) {
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ["ai_agent_tools"],
    queryFn: async () => {
      const allTools = await base44.entities.CustomTool.list("-created_date", 50);
      return allTools.filter(t => AI_AGENT_TOOL_IDS.includes(t.id));
    },
    staleTime: 120000,
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-200 rounded-xl">
        <Bot className="w-6 h-6 text-violet-700 flex-shrink-0" />
        <div>
          <h2 className="font-bold text-violet-900 text-sm">Clinical AI Agents Hub</h2>
          <p className="text-xs text-violet-700">All AI-powered clinical decision support tools in one place</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tools.map(tool => {
            const Icon = resolveIcon(tool.icon);
            return (
              <Card key={tool.id} className="border border-violet-100 hover:border-violet-300 hover:shadow-sm transition-all">
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 leading-snug">{tool.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                      {tool.description?.slice(0, 100)}{tool.description?.length > 100 ? "…" : ""}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 h-7 px-3 text-xs bg-violet-600 hover:bg-violet-700 text-white"
                      onClick={() => onLaunchTool && onLaunchTool(tool)}
                    >
                      <Zap className="w-3 h-3 mr-1" /> Launch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
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