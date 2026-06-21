/**
 * CIEEPathwayExplorer — launcher for the Clinical Intelligence Execution Engine
 * (CIEE) built-in engines. Lists the guideline-traceable engines (SSNS, SRNS,
 * IgA nephropathy / IgA vasculitis, UTI/VUR) and runs the selected one through
 * the shared, smooth (LEILA-style) CIEEEngineRunner — the same engine that
 * powers every other CIEE pathway. No engine is duplicated: each appears once.
 */
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cpu, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import CIEEEngineRunner from './CIEEEngineRunner';
import { BUILTIN_ENGINES } from '@/lib/builtinEngines';
import { UTI_VUR_ENGINE } from '@/lib/engines/utiVurEngine';

// Curated CIEE engine list — built-ins plus the UTI/VUR reference engine.
// De-duplicated by id so an engine can never appear twice.
const CIEE_ENGINES = (() => {
  const all = [...BUILTIN_ENGINES, UTI_VUR_ENGINE];
  const seen = new Set();
  return all.filter(e => (e && !seen.has(e.id)) && seen.add(e.id));
})();

function EngineCard({ engine, onOpen }) {
  const gs = engine.guideline_source || {};
  return (
    <button
      onClick={() => onOpen(engine)}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-left"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-sm text-slate-900">{engine.label}</p>
          <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded">CIEE built-in</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{engine.desc}</p>
        {(gs.guideline_name || gs.evidence_grade) && (
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <ShieldCheck className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-[10px] text-slate-500">{gs.guideline_name}</span>
            {gs.evidence_grade && (
              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">Grade {gs.evidence_grade}</span>
            )}
            {gs.pmid && <span className="text-[9px] text-slate-400">PMID {gs.pmid}</span>}
          </div>
        )}
      </div>
      <span className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 flex-shrink-0">
        Open <ChevronRight className="w-3 h-3" />
      </span>
    </button>
  );
}

export default function CIEEPathwayExplorer() {
  const [active, setActive] = useState(null);

  if (active) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setActive(null)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft className="w-4 h-4" /> All CIEE engines
        </button>
        <Card>
          <CardContent className="p-4">
            <CIEEEngineRunner
              pathway={active.ciee_pathway}
              sources={active.ciee_sources}
              initialCtx={{}}
              title={active.label}
              subtitle={active.guideline_source?.guideline_name || 'CIEE pathway — interactive node traversal'}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="p-3 flex items-start gap-2">
          <Cpu className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-indigo-800">
            <strong>CIEE — Clinical Intelligence Execution Engine.</strong> Guideline-traceable, interactive
            decision engines with prescription suppression, computed dosing, auto-generated monitoring and
            evidence traceability. Pick an engine to run it.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {CIEE_ENGINES.map(engine => (
          <EngineCard key={engine.id} engine={engine} onOpen={setActive} />
        ))}
      </div>
    </div>
  );
}
