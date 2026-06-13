import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CLINICAL_AI_ANALYZERS } from "@/lib/aiAnalyzers";
import { ChevronRight, Activity, BarChart2 } from "lucide-react";
import UroflowAIAnalyzer from "../urology/UroflowAIAnalyzer";
import UDSInterpreter from "../urology/UDSInterpreter";

// Urology-specific tools not in the global registry
const UROLOGY_TOOLS = [
  { id: "uroflow", label: "Uroflow AI", icon: Activity, desc: "AI uroflowmetry interpretation" },
  { id: "urodynamics", label: "Urodynamics AI", icon: BarChart2, desc: "UDS pattern analysis" },
];

export default function HubAILabAnalyzer() {
  const [activeUro, setActiveUro] = useState(null);

  if (activeUro === "uroflow") return (
    <div>
      <button onClick={() => setActiveUro(null)} className="text-xs text-blue-600 mb-3 flex items-center gap-1">← Back to AI Analysers</button>
      <UroflowAIAnalyzer />
    </div>
  );
  if (activeUro === "urodynamics") return (
    <div>
      <button onClick={() => setActiveUro(null)} className="text-xs text-blue-600 mb-3 flex items-center gap-1">← Back to AI Analysers</button>
      <UDSInterpreter />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-700 to-violet-700 p-4 text-white flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">Clinical AI Analyzers</h2>
          <p className="text-indigo-200 text-xs mt-0.5">All analyzers consolidated in Clinical AI Center</p>
        </div>
        <Link to="/ClinicalAIHub"
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
          Open Full Hub <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Global analyzers — link to ClinicalAIHub with correct tab */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Clinical AI Center (8 Analyzers)</p>
        <div className="grid grid-cols-2 gap-2">
          {CLINICAL_AI_ANALYZERS.map(tool => {
            const Icon = tool.icon;
            const href = `/ClinicalAIHub${tool.tab ? `?tab=${tool.tab}` : ""}`;
            const target = tool.tab ? href : `/${tool.page}`;
            return (
              <Link key={tool.id} to={target}>
                <div className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer">
                  <div className={`w-8 h-8 ${tool.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{tool.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{tool.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Urology-specific tools */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Urology-Specific Tools</p>
        <div className="grid grid-cols-2 gap-2">
          {UROLOGY_TOOLS.map(tool => {
            const Icon = tool.icon;
            return (
              <button key={tool.id} onClick={() => setActiveUro(tool.id)}
                className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-left">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{tool.label}</p>
                  <p className="text-[10px] text-slate-400 truncate">{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}