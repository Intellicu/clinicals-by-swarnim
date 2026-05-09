import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  calculateJADAS27, interpretJADAS, JADAS_INFO,
  SLEDAI_ITEMS, calculateSLEDAI, interpretSLEDAI,
  BVAS_ITEMS, calculateBVAS, interpretBVAS,
  CMAS_ITEMS, interpretCMAS, CMAS_MAX
} from "@/lib/rheumatology/DiseaseActivityCalculators";

const RESULT_COLORS = {
  green: "bg-green-100 text-green-800 border-green-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  red: "bg-red-100 text-red-800 border-red-200",
};

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-3">
      <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function ScoreResult({ label, score, maxScore, interpretation }) {
  const colorClass = RESULT_COLORS[interpretation?.color] || RESULT_COLORS.green;
  return (
    <div className={`rounded-xl border-2 p-3 ${colorClass}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-2xl font-bold">{score}{maxScore !== undefined ? `/${maxScore}` : ""}</p>
      </div>
      <p className="text-sm font-semibold">{interpretation?.state}</p>
      {interpretation?.management && (
        <p className="text-xs mt-1 leading-relaxed opacity-90">{interpretation.management}</p>
      )}
    </div>
  );
}

// ── JADAS Calculator ────────────────────────────────────────────────────────
function JADASCalculator() {
  const [physician, setPhysician] = useState(0);
  const [patient, setPatient] = useState(0);
  const [esr, setEsr] = useState(20);
  const [joints, setJoints] = useState(0);
  const [subtype, setSubtype] = useState("polyarticular");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const res = calculateJADAS27(physician, patient, esr, joints);
    const interp = interpretJADAS(res.score, subtype);
    setResult({ ...res, ...interp });
  };

  return (
    <div className="space-y-3">
      <SectionHeader title="JADAS-27" subtitle="Juvenile Arthritis Disease Activity Score — 0 to 40" />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Physician Global (0–10)</label>
          <input type="number" min={0} max={10} step={0.5} value={physician}
            onChange={e => setPhysician(+e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Patient/Parent Global (0–10)</label>
          <input type="number" min={0} max={10} step={0.5} value={patient}
            onChange={e => setPatient(+e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">ESR (mm/h)</label>
          <input type="number" min={0} max={150} value={esr}
            onChange={e => setEsr(+e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Active Joints (0–27)</label>
          <input type="number" min={0} max={27} value={joints}
            onChange={e => setJoints(+e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">JIA Subtype (for cutoffs)</label>
        <select value={subtype} onChange={e => setSubtype(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="oligoarticular">Oligoarticular</option>
          <option value="polyarticular">Polyarticular</option>
        </select>
      </div>

      <Button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700">
        <Calculator className="w-4 h-4 mr-2" />Calculate JADAS-27
      </Button>

      {result && (
        <ScoreResult
          label="JADAS-27 Score"
          score={result.score}
          interpretation={result}
        />
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-700">Cutoffs ({subtype})</p>
        {subtype === "oligoarticular" ? (
          <><p>Inactive: ≤1 · Low: 1–2 · Moderate: 2–4.2 · High: &gt;4.2</p></>
        ) : (
          <><p>Inactive: ≤1 · Low: 1–3.8 · Moderate: 3.8–8.5 · High: &gt;8.5</p></>
        )}
        <p className="text-slate-400">ESR normalisation: (ESR − 20) / 10, capped 0–10</p>
      </div>
    </div>
  );
}

// ── SLEDAI Calculator ────────────────────────────────────────────────────────
function SLEDAICalculator() {
  const [checked, setChecked] = useState([]);
  const [result, setResult] = useState(null);

  const toggle = (id) => {
    setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setResult(null);
  };

  const calculate = () => {
    const score = calculateSLEDAI(checked);
    const interp = interpretSLEDAI(score);
    setResult({ score, ...interp });
  };

  const domains = [...new Set(SLEDAI_ITEMS.map(i => i.domain))];

  return (
    <div className="space-y-3">
      <SectionHeader title="SLEDAI-2K" subtitle="Systemic Lupus Erythematosus Disease Activity Index" />

      {domains.map(domain => (
        <div key={domain} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-purple-50 border-b border-purple-100">
            <p className="text-xs font-bold text-purple-800">{domain}</p>
          </div>
          <div className="p-2 space-y-1">
            {SLEDAI_ITEMS.filter(i => i.domain === domain).map(item => (
              <label key={item.id} className="flex items-start gap-2.5 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <input type="checkbox" checked={checked.includes(item.id)} onChange={() => toggle(item.id)}
                  className="mt-0.5 accent-purple-600 w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                    <Badge variant="outline" className="text-xs font-mono">×{item.weight}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 leading-tight mt-0.5">{item.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-3 -mx-3 rounded-t-xl shadow-md">
        <Button onClick={calculate} className="w-full bg-purple-600 hover:bg-purple-700 mb-2">
          <Calculator className="w-4 h-4 mr-2" />Calculate SLEDAI-2K
        </Button>
        {result && (
          <ScoreResult label="SLEDAI-2K Score" score={result.score} interpretation={result} />
        )}
      </div>
    </div>
  );
}

// ── BVAS Calculator ─────────────────────────────────────────────────────────
function BVASCalculator() {
  const [checked, setChecked] = useState([]);
  const [result, setResult] = useState(null);

  const toggle = (id) => {
    setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setResult(null);
  };

  const calculate = () => {
    const score = calculateBVAS(checked);
    const interp = interpretBVAS(score);
    setResult({ score, ...interp });
  };

  const domains = [...new Set(BVAS_ITEMS.map(i => i.domain))];

  return (
    <div className="space-y-3">
      <SectionHeader title="BVAS" subtitle="Birmingham Vasculitis Activity Score v3" />

      {domains.map(domain => (
        <div key={domain} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-red-50 border-b border-red-100">
            <p className="text-xs font-bold text-red-800">{domain}</p>
          </div>
          <div className="p-2 space-y-1">
            {BVAS_ITEMS.filter(i => i.domain === domain).map(item => (
              <label key={item.id} className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <input type="checkbox" checked={checked.includes(item.id)} onChange={() => toggle(item.id)}
                  className="accent-red-600 w-4 h-4 flex-shrink-0" />
                <span className="text-xs text-slate-800 flex-1">{item.label}</span>
                <Badge variant="outline" className="text-xs font-mono">×{item.weight}</Badge>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-3 -mx-3 rounded-t-xl shadow-md">
        <Button onClick={calculate} className="w-full bg-red-600 hover:bg-red-700 mb-2">
          <Calculator className="w-4 h-4 mr-2" />Calculate BVAS
        </Button>
        {result && (
          <ScoreResult label="BVAS Score" score={result.score} interpretation={result} />
        )}
      </div>
    </div>
  );
}

// ── CMAS Calculator ─────────────────────────────────────────────────────────
function CMASCalculator() {
  const [scores, setScores] = useState({});
  const [result, setResult] = useState(null);

  const setScore = (id, val) => {
    setScores(prev => ({ ...prev, [id]: +val }));
    setResult(null);
  };

  const total = CMAS_ITEMS.reduce((sum, i) => sum + (scores[i.id] || 0), 0);

  const calculate = () => {
    const interp = interpretCMAS(total);
    setResult({ score: total, ...interp });
  };

  return (
    <div className="space-y-3">
      <SectionHeader title="CMAS" subtitle="Childhood Myositis Assessment Scale — max 30 (JDM)" />

      <div className="space-y-2">
        {CMAS_ITEMS.map(item => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-800">{item.label}</p>
              <Badge variant="outline" className="text-xs font-mono">{scores[item.id] || 0}/{item.maxScore}</Badge>
            </div>
            <p className="text-xs text-slate-500 mb-2">{item.description}</p>
            <input type="range" min={0} max={item.maxScore} step={1} value={scores[item.id] || 0}
              onChange={e => setScore(item.id, e.target.value)}
              className="w-full accent-orange-500" />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>0</span><span>{item.maxScore}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-3 -mx-3 rounded-t-xl shadow-md">
        <Button onClick={calculate} className="w-full bg-orange-600 hover:bg-orange-700 mb-2">
          <Calculator className="w-4 h-4 mr-2" />Calculate CMAS (Total: {total}/{CMAS_MAX})
        </Button>
        {result && (
          <ScoreResult label="CMAS Score" score={result.score} maxScore={CMAS_MAX} interpretation={result} />
        )}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
const CALC_TABS = [
  { id: "jadas", label: "JADAS-27", subtitle: "JIA activity", color: "text-blue-700" },
  { id: "sledai", label: "SLEDAI-2K", subtitle: "SLE activity", color: "text-purple-700" },
  { id: "bvas", label: "BVAS", subtitle: "Vasculitis", color: "text-red-700" },
  { id: "cmas", label: "CMAS", subtitle: "JDM myositis", color: "text-orange-700" },
];

export default function RheumDiseaseActivityCalculators() {
  const [activeCalc, setActiveCalc] = useState("jadas");

  return (
    <div className="space-y-3">
      {/* Calculator selector */}
      <div className="grid grid-cols-2 gap-2">
        {CALC_TABS.map(c => (
          <button key={c.id} onClick={() => setActiveCalc(c.id)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${activeCalc === c.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"}`}>
            <p className={`text-sm font-bold ${c.color}`}>{c.label}</p>
            <p className="text-xs text-slate-500">{c.subtitle}</p>
          </button>
        ))}
      </div>

      {/* Calculator content */}
      <div className="bg-white border border-slate-200 rounded-xl p-3">
        {activeCalc === "jadas" && <JADASCalculator />}
        {activeCalc === "sledai" && <SLEDAICalculator />}
        {activeCalc === "bvas" && <BVASCalculator />}
        {activeCalc === "cmas" && <CMASCalculator />}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          These calculators are validated disease activity tools. Use alongside full clinical assessment. Source: ACR/EULAR/PRINTO validated instruments.
        </p>
      </div>
    </div>
  );
}