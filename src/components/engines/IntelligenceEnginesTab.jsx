import React from "react";
import { Cpu, ChevronRight } from "lucide-react";

const ENGINES = [
  { label: "🧬 Fabry Disease Engine", desc: "Recognition → Diagnosis → ERT → Family cascade", scenario: "fabry-engine", color: "bg-violet-600" },
  { label: "🧠 NS Engine", desc: "Nephrotic Syndrome full engine", scenario: "ns-engine", color: "bg-violet-600" },
  { label: "🫁 AKI Engine", desc: "KDIGO + RRT triggers", scenario: "aki-engine", color: "bg-red-600" },
  { label: "⚡ Hyperkalaemia Engine", desc: "K+ emergency full engine", scenario: "hyperkalemia-deep-engine", color: "bg-orange-600" },
  { label: "💧 Hyponatraemia Engine", desc: "Na correction engine", scenario: "hyponatremia-engine", color: "bg-cyan-600" },
  { label: "🔬 RPGN Engine", desc: "Crescentic GN + PLEX", scenario: "rpgn-deep-engine", color: "bg-red-700" },
  { label: "🫀 TMA Engine", desc: "HUS / aHUS / TTP", scenario: "tma-engine", color: "bg-rose-700" },
  { label: "🔴 Haematuria Engine", desc: "Glomerular vs urological workup", scenario: "hematuria-engine", color: "bg-rose-600" },
  { label: "🧬 Genetic Testing Engine", desc: "When to test + which panel", scenario: "genetic-engine", color: "bg-violet-700" },
  { label: "📈 CKD Progression Engine", desc: "Risk stratification", scenario: "ckd-progression-engine", color: "bg-blue-700" },
  { label: "🔬 Biopsy Engine", desc: "When to biopsy", scenario: "biopsy-engine", color: "bg-amber-700" },
  { label: "⚗️ Metabolic Acidosis Engine", desc: "AG + RTA classification", scenario: "metabolic-acidosis-engine", color: "bg-amber-600" },
  { label: "💛 Hypokalemia Engine", desc: "K+ deficiency pathway", scenario: "hypokalemia-engine", color: "bg-yellow-600" },
  { label: "🌊 Polyuria / DI Engine", desc: "Central vs Nephrogenic DI", scenario: "polyuria-engine", color: "bg-teal-600" },
  { label: "💊 Eculizumab Engine", desc: "Eligibility + dosing", scenario: "eculizumab-engine", color: "bg-purple-700" },
  { label: "🔵 C3G Engine", desc: "C3 Glomerulopathy", scenario: "c3g-engine", color: "bg-cyan-700" },
  { label: "🚿 Voiding Dysfunction Engine", desc: "BBD + Uroflow + OAB", scenario: "voiding-engine", color: "bg-teal-700" },
  { label: "🟣 Cystic Kidney Engine", desc: "ARPKD/ADPKD/NPHP/BBS", scenario: "cystic-kidney-engine", color: "bg-indigo-600" },
  { label: "🫘 CAKUT Engine", desc: "Antenatal hydro + PUV + VUR (8 sub-modules)", scenario: "cakut-engine", color: "bg-teal-800" },
  { label: "👂 Alport & HNF1B Engine", desc: "COL4 + most missed diagnosis", scenario: "alport-hnf1b-engine", color: "bg-rose-700" },
  { label: "🪨 Kidney Stone & PH Engine", desc: "Stone types + PH1/cystinuria", scenario: "stone-ph-engine", color: "bg-amber-700" },
  { label: "🧪 Tubular Disorders Engine", desc: "Fanconi + XLH + NDI/SIADH", scenario: "tubular-disorder-engine", color: "bg-emerald-700" },
  { label: "❤️ Pediatric HTN Engine", desc: "AAP 2017 + emergency + secondary workup", scenario: "htn-engine", color: "bg-red-700" },
];

export default function IntelligenceEnginesTab({ onSelectEngine }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gradient-to-r from-violet-700 to-purple-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          <div>
            <h2 className="font-bold text-sm">Intelligence Engines</h2>
            <p className="text-xs text-violet-200">Advanced diagnostic decision engines — {ENGINES.length} engines available</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {ENGINES.map((eng) => (
          <button key={eng.scenario}
            onClick={() => onSelectEngine(eng.scenario)}
            className={`${eng.color} text-white rounded-xl px-4 py-3 flex items-center justify-between hover:opacity-90 active:scale-95 transition-all shadow-sm`}>
            <div className="text-left">
              <p className="font-bold text-sm">{eng.label}</p>
              <p className="text-xs opacity-80">{eng.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}