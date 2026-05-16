import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Zap, LayoutGrid, ChevronRight } from "lucide-react";

const DEFAULT_TOOLS = [
  { label: "AKI", page: "AKIStager" },
  { label: "HyperK", page: "EmergencyHub" },
  { label: "NS", page: "ClinicalSupport" },
  { label: "Dialysis", page: "RRTAssistant" },
  { label: "BP", page: "BPPercentiles" },
  { label: "Growth", page: "Anthropometry" },
  { label: "UDS", page: "UrologyNephrologyHub" },
  { label: "RPGN", page: "EmergencyHub" },
  { label: "Discharge", page: "DischargeSummary" },
  { label: "Schwartz GFR", page: "SchwartzGFR" },
  { label: "FENa", page: "FENaCalculator" },
  { label: "ABG", page: "ABGInterpreter" },
];

const CHIP_COLORS = [
  "bg-red-100 text-red-700 border-red-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-teal-100 text-teal-700 border-teal-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-slate-100 text-slate-700 border-slate-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-sky-100 text-sky-700 border-sky-200",
];

function getFrequency() {
  try { return JSON.parse(localStorage.getItem("tool_frequency") || "{}"); } catch { return {}; }
}

function trackClick(page) {
  const freq = getFrequency();
  freq[page] = (freq[page] || 0) + 1;
  localStorage.setItem("tool_frequency", JSON.stringify(freq));
}

export default function FrequencyQuickAccess() {
  const [freq, setFreq] = useState(getFrequency);

  // Sort by frequency descending, fall back to default order
  const sorted = [...DEFAULT_TOOLS].sort((a, b) => (freq[b.page] || 0) - (freq[a.page] || 0));
  // Show top 8 + always show Workspace
  const visible = sorted.slice(0, 8);

  return (
    <div className="space-y-3">
      {/* Quick access chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-slate-700">Quick Access</span>
            <span className="text-xs text-slate-400">· based on usage</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {visible.map((chip, i) => (
            <Link key={chip.label} to={createPageUrl(chip.page)} onClick={() => { trackClick(chip.page); setFreq(getFrequency()); }}>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${CHIP_COLORS[i % CHIP_COLORS.length]} active:scale-95 transition-transform`}>
                {chip.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Clinical Workspace entry */}
      <Link to={createPageUrl("ClinicalWorkspace")}>
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl px-4 py-3 active:scale-95 transition-transform shadow-sm">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 text-slate-300" />
            <div>
              <p className="text-white font-bold text-sm">Clinical Workspace</p>
              <p className="text-slate-300 text-xs">AI · Scan · Monitoring · Docs · Calculators · Pathways</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </Link>
    </div>
  );
}