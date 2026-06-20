/**
 * CIEEPathwayExplorer — SRNS demonstration of the Clinical Intelligence
 * Execution Engine, rendered through the shared (smooth, LEILA-style)
 * CIEEEngineRunner so it matches every other CIEE engine.
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cpu } from 'lucide-react';
import CIEEEngineRunner from './CIEEEngineRunner';
import { SRNS_PATHWAY, GUIDELINE_SOURCES } from '@/lib/CIEEEngine';

export default function CIEEPathwayExplorer() {
  return (
    <div className="space-y-4">
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="p-3 flex items-start gap-2">
          <Cpu className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-indigo-800">
            <strong>CIEE — Steroid-Resistant NS pathway (ISPN 2021).</strong> Interactive decision support with
            prescription suppression on pathogenic variants, auto-generated monitoring, and evidence traceability.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <CIEEEngineRunner
            pathway={SRNS_PATHWAY}
            sources={GUIDELINE_SOURCES}
            initialCtx={{}}
            title="SRNS Pathway Engine"
            subtitle="ISPN 2021 · interactive node traversal"
          />
        </CardContent>
      </Card>
    </div>
  );
}
