/**
 * EmergencyProtocolDrawer
 * Header emergency button → slides in a drawer with the
 * "Emergency Protocol" CustomTool records from the
 * "Pediatric Emergency & Acute Care" specialty.
 * Falls back gracefully if no records exist yet.
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import {
  X, AlertCircle, Activity, Brain, Zap, Wind, Droplet, Heart,
  Beaker, RefreshCw, ChevronRight
} from "lucide-react";

const SPECIALTY_ID = "6a19283dbbb21c16d7549a8e";

const ICON_MAP = { Activity, Brain, Zap, Wind, Droplet, Heart, Beaker, AlertCircle };
const DEFAULT_ICON = AlertCircle;

function getIcon(name) { return ICON_MAP[name] || DEFAULT_ICON; }

// ── Tool execution modal ────────────────────────────────────────────────────
function ToolModal({ tool, onClose }) {
  const [scenario, setScenario] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fields = tool.input_fields || [];

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    try {
      const prompt = `${tool.description}\n\nClinical scenario:\n${scenario}\n\n${tool.calculation_logic || ""}`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: { type: "object", properties: { result: { type: "string" }, interpretation: { type: "string" } } }
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[70] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-3 top-20 bottom-16 z-[70] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-lg mx-auto">
        <div className="bg-red-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-white font-bold text-sm">{tool.name}</p>
            <p className="text-red-200 text-xs">Emergency Protocol</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tool.description && <p className="text-xs text-slate-500">{tool.description}</p>}
          <textarea
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 h-24"
            placeholder="Describe the patient / clinical scenario…"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          />
          {result && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
              <p className="text-xs font-bold text-red-800">Protocol Guidance</p>
              <p className="text-sm text-slate-700">{result.result}</p>
              {result.interpretation && <p className="text-xs text-slate-500 mt-1">{result.interpretation}</p>}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-100">
          <button
            onClick={handleRun}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {loading ? "Running…" : "Get Protocol Guidance"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Drawer ──────────────────────────────────────────────────────────────────
export default function EmergencyProtocolDrawer({ open, onClose }) {
  const [selectedTool, setSelectedTool] = useState(null);

  const { data: tools, isLoading } = useQuery({
    queryKey: ["emergency-protocol-tools", SPECIALTY_ID],
    queryFn: () => base44.entities.CustomTool.filter({ specialty_id: SPECIALTY_ID, category: "Emergency Protocol" }, undefined, 200),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl overflow-hidden"
        style={{ width: "min(92vw, 380px)" }}
      >
        {/* Header */}
        <div className="bg-red-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-white" />
            <div>
              <p className="text-white font-bold text-sm">Emergency Protocols</p>
              <p className="text-red-200 text-xs">AI-powered instant guidance</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tools && tools.length > 0 ? (
            tools.map((tool) => {
              const Icon = getIcon(tool.icon);
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 transition-colors group active:scale-98 text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-red-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{tool.name}</p>
                    {tool.description && (
                      <p className="text-xs text-slate-500 leading-tight line-clamp-1">{tool.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-red-400 flex-shrink-0" />
                </button>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No emergency protocols loaded yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-3 pb-4 pt-2 border-t border-slate-100">
          <a
            href="/EmergencyHub"
            onClick={onClose}
            className="block bg-red-600 rounded-xl px-4 py-3 flex items-center justify-between text-white active:scale-98"
          >
            <span className="text-sm font-bold">Full Emergency Hub</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {selectedTool && (
        <ToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
      )}
    </>
  );
}