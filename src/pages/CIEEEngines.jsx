/**
 * CIEE Engines — dedicated hub listing all saved decision engines built from
 * guidelines by the Engine Generator. Each is runnable by the shared
 * PathwayExecutionEngine (CIEEEngineRunner).
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FlaskConical, Search, Loader2, X, ShieldCheck, Cpu, ArrowRight, BookOpen,
} from "lucide-react";
import CIEEEngineRunner from "@/components/clinical-ai/CIEEEngineRunner";

function engineFromRecord(rec) {
  const c = rec.content || {};
  return {
    id: rec.id,
    label: c.label || rec.title || "Untitled Engine",
    desc: c.desc || rec.description || "",
    group: c.group || "General",
    scenario: c.scenario || "",
    references: c.references || "",
    ciee_pathway: c.ciee_pathway || null,
    ciee_sources: c.ciee_sources || null,
    guideline_source: c.guideline_source || null,
  };
}

export default function CIEEEngines() {
  const [search, setSearch] = useState("");
  const [runner, setRunner] = useState(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["ciee_engines_public"],
    queryFn: () => base44.entities.CustomSection.filter({ section_type: "tool", status: "published" }),
  });

  const engines = records
    .map(engineFromRecord)
    .filter(e => e.ciee_pathway && e.ciee_pathway.nodes);

  const filtered = engines.filter(e =>
    !search ||
    e.label.toLowerCase().includes(search.toLowerCase()) ||
    e.desc.toLowerCase().includes(search.toLowerCase()) ||
    (e.guideline_source?.guideline_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-violet-700 px-4 py-5 text-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6" />
            <h1 className="text-xl font-bold">CIEE Engines</h1>
          </div>
          <p className="text-indigo-200 text-xs mt-1">
            Guideline-derived decision engines · interactive node traversal · prescription suppression · evidence-traceable
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search decision engines…" className="pl-9 bg-white" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="p-8 text-center">
              <Cpu className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No decision engines yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Build one in the Engine Generator → "Build Decision Engine (CIEE)" from an uploaded guideline.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map(eng => {
              const gs = eng.guideline_source;
              const nodeCount = Object.keys(eng.ciee_pathway.nodes || {}).length;
              return (
                <Card key={eng.id} className="border-indigo-100 hover:border-indigo-300 transition-colors">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FlaskConical className="w-4 h-4 text-indigo-600 shrink-0" />
                        <p className="font-semibold text-sm text-slate-800 truncate">{eng.label}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] shrink-0">{nodeCount} nodes</Badge>
                    </div>
                    {eng.desc && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{eng.desc}</p>}

                    {gs && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <ShieldCheck className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-500 truncate">{gs.guideline_name}</span>
                        {gs.evidence_grade && <Badge variant="outline" className="text-[9px] py-0">Grade {gs.evidence_grade}</Badge>}
                      </div>
                    )}

                    <div className="flex-1" />
                    <Button onClick={() => setRunner(eng)} size="sm"
                      className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5">
                      Run Engine <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info */}
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-3 flex gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-800">
              These engines are generated from clinical guidelines and executed by the Clinical Intelligence Execution Engine.
              Output is decision support only — generated logic should be clinically reviewed before use.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Runner Modal */}
      {runner && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-3 pb-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-indigo-600" /> {runner.label}
              </h3>
              <button onClick={() => setRunner(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
              <CIEEEngineRunner
                pathway={runner.ciee_pathway}
                sources={runner.ciee_sources || {}}
                initialCtx={{}}
                title={runner.label}
                subtitle={runner.guideline_source?.guideline_name}
                onReset={() => setRunner({ ...runner })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
