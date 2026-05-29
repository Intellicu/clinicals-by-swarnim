/**
 * DataDrivenToolGroups
 * Renders "Pediatric AI Analysers", "Emergency Protocols", and "Pediatric Procedures"
 * from live CustomTool records. Tiles with no DB record are greyed out with "Coming soon".
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import {
  Brain, AlertCircle, ClipboardList, Activity, Wind, Zap, Baby,
  UtensilsCrossed, Droplet, FlaskConical, Microscope, Heart, Beaker,
  Stethoscope, RefreshCw, ChevronDown, ChevronUp, X
} from "lucide-react";

// Icon map — matches the icon string stored on CustomTool records
const ICON_MAP = {
  Brain, AlertCircle, ClipboardList, Activity, Wind, Zap, Baby,
  UtensilsCrossed, Droplet, FlaskConical, Microscope, Heart, Beaker, Stethoscope,
};

const DEFAULT_ICON = Activity;

function getIcon(name) {
  return ICON_MAP[name] || DEFAULT_ICON;
}

// Default background colours for each category
const CATEGORY_COLOR = {
  "AI Analyser": "bg-violet-600",
  "Emergency Protocol": "bg-red-600",
  "Procedure": "bg-slate-700",
};

const CATEGORY_ICON_COLOR = {
  "AI Analyser": "text-violet-700",
  "Emergency Protocol": "text-red-600",
  "Procedure": "text-slate-600",
};

// ── Tool execution modal ────────────────────────────────────────────────────
function ToolModal({ tool, onClose }) {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fields = tool.input_fields || [];

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    try {
      const prompt = `${tool.description}\n\nPatient data:\n${Object.entries(inputs).map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${tool.calculation_logic || ""}`;
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
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-3 top-16 bottom-16 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-white font-bold text-sm">{tool.name}</p>
            <p className="text-slate-300 text-xs">{tool.category}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tool.description && (
            <p className="text-xs text-slate-500">{tool.description}</p>
          )}

          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {f.label || f.name} {f.unit && <span className="text-slate-400 font-normal">({f.unit})</span>}
                {f.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {f.type === "select" ? (
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={inputs[f.name] || ""}
                  onChange={(e) => setInputs((p) => ({ ...p, [f.name]: e.target.value }))}>
                  <option value="">Select…</option>
                  {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  placeholder={f.reference_range || ""}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={inputs[f.name] || ""}
                  onChange={(e) => setInputs((p) => ({ ...p, [f.name]: e.target.value }))}
                />
              )}
            </div>
          ))}

          {fields.length === 0 && (
            <textarea
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 h-28"
              placeholder="Describe the clinical scenario or paste relevant data…"
              value={inputs["scenario"] || ""}
              onChange={(e) => setInputs({ scenario: e.target.value })}
            />
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1">
              <p className="text-xs font-bold text-green-800">Result</p>
              <p className="text-sm text-slate-700">{result.result}</p>
              {result.interpretation && (
                <p className="text-xs text-slate-500 mt-1">{result.interpretation}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-100">
          <button
            onClick={handleRun}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {loading ? "Analysing…" : "Run AI Analysis"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Single collapsible tool group ──────────────────────────────────────────
function ToolGroup({ title, categoryKey, iconColor, tools, loading, hardcodedNames }) {
  const [open, setOpen] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);

  // Build a name→tool map from DB records
  const toolMap = {};
  (tools || []).forEach((t) => { toolMap[t.name.toLowerCase()] = t; });

  // Merge: hardcoded names drive tile order; DB record activates the tile
  const tiles = hardcodedNames.map((name) => {
    const matched = toolMap[name.toLowerCase()];
    return { name, tool: matched || null };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-3 py-2.5 text-left focus:outline-none"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`text-sm font-bold text-slate-800`}>{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-3 pb-3">
          {loading ? (
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="w-full overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <div className="flex gap-1.5 pb-1 min-w-max">
                {tiles.map(({ name, tool }) => {
                  const isActive = !!tool;
                  const Icon = tool ? getIcon(tool.icon) : Activity;
                  const bgColor = isActive ? (CATEGORY_COLOR[categoryKey] || "bg-slate-600") : "bg-slate-200";

                  if (isActive) {
                    return (
                      <button
                        key={name}
                        onClick={() => setSelectedTool(tool)}
                        className="flex-shrink-0 w-16 flex flex-col items-center gap-1 active:scale-95 transition-transform text-center min-h-[44px] justify-start pt-1"
                      >
                        <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center shadow-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-700 leading-tight line-clamp-2 w-full">{tool.name}</span>
                      </button>
                    );
                  }

                  return (
                    <div key={name} className="flex-shrink-0 w-16 flex flex-col items-center gap-1 opacity-40 cursor-not-allowed text-center pt-1">
                      <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}>
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 leading-tight line-clamp-2 w-full">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTool && (
        <ToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
      )}
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────
const EMERGENCY_PROTOCOL_NAMES = [
  "Status Epilepticus Protocol", "Anaphylaxis Protocol", "Hyperkalemia Emergency",
  "Hypertensive Emergency", "Septic Shock - First Hour", "Fluid Bolus Guidance",
  "PICU Escalation Triggers", "Intubation Quick Guide", "Toxicology Basics",
];

const PROCEDURE_NAMES = [
  "Lumbar Puncture Guide", "Intraosseous Access", "Urinary Catheterization",
  "NG Tube Insertion", "Central Line Basics",
  // extra hardcoded ones that may not yet have DB records:
  "IV Access Pearls", "Airway Checklist", "Fluid Bolus Protocols",
];

const AI_ANALYSER_NAMES = [
  "CBC Analyzer", "ABG Analyzer", "DKA Analyzer", "Sepsis Risk Analyzer",
  "Growth Failure Analyzer", "Nutrition Analyzer", "Dehydration Analyzer",
  "Lab Analyzer (Nephro)",
];

export default function DataDrivenToolGroups() {
  const specialtyId = "6a19283dbbb21c16d7549a8e";

  const { data: aiTools, isLoading: loadingAI } = useQuery({
    queryKey: ["customtools-ai-analyser", specialtyId],
    queryFn: () => base44.entities.CustomTool.filter({ specialty_id: specialtyId, category: "AI Analyser" }, undefined, 200),
    staleTime: 5 * 60 * 1000,
  });

  const { data: emergencyTools, isLoading: loadingEmergency } = useQuery({
    queryKey: ["customtools-emergency", specialtyId],
    queryFn: () => base44.entities.CustomTool.filter({ specialty_id: specialtyId, category: "Emergency Protocol" }, undefined, 200),
    staleTime: 5 * 60 * 1000,
  });

  const { data: procedureTools, isLoading: loadingProcedure } = useQuery({
    queryKey: ["customtools-procedure", specialtyId],
    queryFn: () => base44.entities.CustomTool.filter({ specialty_id: specialtyId, category: "Procedure" }, undefined, 200),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-3">
      <ToolGroup
        title="Pediatric AI Analysers"
        categoryKey="AI Analyser"
        tools={aiTools}
        loading={loadingAI}
        hardcodedNames={AI_ANALYSER_NAMES}
      />
      <ToolGroup
        title="Emergency Protocols"
        categoryKey="Emergency Protocol"
        tools={emergencyTools}
        loading={loadingEmergency}
        hardcodedNames={EMERGENCY_PROTOCOL_NAMES}
      />
      <ToolGroup
        title="Pediatric Procedures"
        categoryKey="Procedure"
        tools={procedureTools}
        loading={loadingProcedure}
        hardcodedNames={PROCEDURE_NAMES}
      />
    </div>
  );
}