/**
 * EmergencyProtocolDrawer — mobile-first
 * Red button → vertical list of protocols → tap → weight-based dose card (no sideways scroll)
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import {
  X, AlertCircle, Activity, Brain, Zap, Wind, Droplet, Heart,
  Beaker, RefreshCw, ChevronRight, ArrowLeft, Calculator
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SPECIALTY_ID = "6a19283dbbb21c16d7549a8e";
const ICON_MAP = { Activity, Brain, Zap, Wind, Droplet, Heart, Beaker, AlertCircle };
function getIcon(name) { return ICON_MAP[name] || AlertCircle; }

// ── Weight-based dose card ───────────────────────────────────────────────────
function ProtocolCard({ tool, weight, onBack }) {
  const [scenario, setScenario] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const Icon = getIcon(tool.icon);
  const wt = parseFloat(weight);

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    try {
      const weightLine = wt ? `Patient weight: ${wt} kg. Calculate ALL doses in mg/kg and total mg for this weight.` : "";
      const prompt = `You are a clinical decision support system for a pediatric emergency.
Protocol: ${tool.name}
${weightLine}
Clinical scenario: ${scenario || "Standard presentation"}
${tool.description || ""}
${tool.calculation_logic || ""}

Provide:
1. Immediate actions (numbered)
2. Weight-based drug doses (if weight provided, give exact mg and mL for each drug)
3. Monitoring parameters
4. Escalation triggers
Be concise and actionable.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            immediate_actions: { type: "string" },
            drug_doses: { type: "string" },
            monitoring: { type: "string" },
            escalation: { type: "string" }
          }
        }
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="bg-red-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className="w-4 h-4 text-white flex-shrink-0" />
          <p className="text-white font-bold text-sm leading-tight truncate">{tool.name}</p>
        </div>
      </div>

      {/* Body — single scrollable card, no horizontal scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ overflowX: "hidden" }}>

        {/* Weight input — prominent */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <Label className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1">
            <Calculator className="w-3.5 h-3.5" /> Weight (kg) — for dose calculation
          </Label>
          <Input
            type="number"
            value={weight}
            readOnly
            placeholder="Enter weight above to get exact doses"
            className="h-10 text-sm bg-white border-amber-300 focus:ring-amber-400"
          />
          {wt ? (
            <p className="text-xs text-amber-700 mt-1 font-medium">✓ Weight {wt} kg remembered — doses will be calculated for this child</p>
          ) : (
            <p className="text-xs text-amber-600 mt-1">Enter patient weight in the top patient strip for exact mg doses</p>
          )}
        </div>

        {/* Optional scenario */}
        <div>
          <Label className="text-xs font-semibold text-slate-600 mb-1 block">Additional clinical details (optional)</Label>
          <textarea
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 h-20 resize-none"
            placeholder="e.g. HR 180, BP 60/40, not responding to first bolus…"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          />
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 min-h-[48px]"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {loading ? "Generating protocol…" : `Get ${wt ? `Doses for ${wt} kg` : "Protocol Guidance"}`}
        </button>

        {/* Results — stacked cards, no tables */}
        {result && (
          <div className="space-y-3">
            {result.immediate_actions && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs font-bold text-red-800 mb-1.5">⚡ Immediate Actions</p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{result.immediate_actions}</p>
              </div>
            )}
            {result.drug_doses && (
              <div className="bg-white border-2 border-purple-200 rounded-xl p-3">
                <p className="text-xs font-bold text-purple-800 mb-1.5">💊 Drug Doses{wt ? ` (for ${wt} kg)` : ""}</p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-mono">{result.drug_doses}</p>
              </div>
            )}
            {result.monitoring && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-800 mb-1.5">📊 Monitoring</p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{result.monitoring}</p>
              </div>
            )}
            {result.escalation && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-xs font-bold text-slate-700 mb-1.5">🔺 Escalation Triggers</p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{result.escalation}</p>
              </div>
            )}
          </div>
        )}

        {tool.description && !result && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-xs text-slate-500 leading-relaxed">{tool.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Protocol list ─────────────────────────────────────────────────────────────
function ProtocolList({ tools, isLoading, onSelect }) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
        ))
      ) : tools && tools.length > 0 ? (
        tools.map((tool) => {
          const Icon = getIcon(tool.icon);
          return (
            <button
              key={tool.id}
              onClick={() => onSelect(tool)}
              className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 transition-colors active:scale-[0.98] text-left min-h-[56px]"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-red-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{tool.name}</p>
                {tool.description && (
                  <p className="text-xs text-slate-400 leading-tight mt-0.5 line-clamp-1">{tool.description}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </button>
          );
        })
      ) : (
        <p className="text-xs text-slate-400 text-center py-8">No emergency protocols loaded yet.</p>
      )}
    </div>
  );
}

// ── Main drawer ──────────────────────────────────────────────────────────────
export default function EmergencyProtocolDrawer({ open, onClose, weight = "" }) {
  const [selectedTool, setSelectedTool] = useState(null);

  const { data: tools, isLoading } = useQuery({
    queryKey: ["emergency-protocol-tools", SPECIALTY_ID],
    queryFn: () => base44.entities.CustomTool.filter(
      { specialty_id: SPECIALTY_ID, category: "Emergency Protocol" }, undefined, 200
    ),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl overflow-hidden"
        style={{ width: "min(92vw, 400px)", overflowX: "hidden" }}
      >
        {/* Header */}
        <div className="bg-red-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-white" />
            <div>
              <p className="text-white font-bold text-sm">Emergency Protocols</p>
              <p className="text-red-200 text-xs">
                {selectedTool ? "Tap back to list" : `${tools?.length || "—"} protocols · tap to get doses`}
              </p>
            </div>
          </div>
          <button onClick={() => { setSelectedTool(null); onClose(); }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30">
            <X className="w-4 h-4" />
          </button>
        </div>

        {selectedTool ? (
          <ProtocolCard tool={selectedTool} weight={weight} onBack={() => setSelectedTool(null)} />
        ) : (
          <>
            <ProtocolList tools={tools} isLoading={isLoading} onSelect={setSelectedTool} />
            <div className="flex-shrink-0 px-3 pb-4 pt-2 border-t border-slate-100">
              <a href="/EmergencyHub" onClick={onClose}
                className="flex items-center justify-between bg-red-600 text-white rounded-xl px-4 py-3 min-h-[48px]">
                <span className="text-sm font-bold">Full Emergency Hub</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}