import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { usePatient } from "../PatientContext";
import { Droplets, Calculator, ExternalLink, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Rapid-access fluid calculator that pulls from patient context
// and shows baseline fluid therapy ranges immediately
export default function FluidCalculatorQuickLink({ context = "AKI" }) {
  const { patientData } = usePatient();
  const [localWeight, setLocalWeight] = useState(patientData?.weight ? String(patientData.weight) : "");
  const [expanded, setExpanded] = useState(false);

  const wt = parseFloat(localWeight);

  // Holliday-Segar formula
  const hollidaySegar = () => {
    if (!wt || isNaN(wt)) return null;
    let ml_per_day;
    if (wt <= 10) ml_per_day = wt * 100;
    else if (wt <= 20) ml_per_day = 1000 + (wt - 10) * 50;
    else ml_per_day = 1500 + (wt - 20) * 20;
    return {
      perDay: Math.round(ml_per_day),
      perHour: Math.round(ml_per_day / 24),
      perKg: Math.round(ml_per_day / wt),
    };
  };

  const fluids = hollidaySegar();

  // Context-specific restriction recommendations
  const contextRecs = {
    AKI: [
      { label: "AKI — Oliguric phase", pct: "Insensible + urine output only", note: "Do NOT give maintenance unless fluid depleted. UO + 400 mL/m²/day insensible" },
      { label: "AKI — Pre-renal/dehydrated", pct: "Normal maintenance (Holliday-Segar)", note: "Normal saline 10 mL/kg bolus if dehydrated; reassess after" },
      { label: "AKI — Fluid overload", pct: "Restrict to 60–75% maintenance", note: "Target fluid balance ±5% body weight; consider RRT if >10% overload" },
    ],
    Tubular: [
      { label: "Distal RTA / Bartter", pct: "Polyuria replacement: match urine output", note: "Measure urine Na, K hourly; replace losses volume-for-volume + maintenance" },
      { label: "Nephrogenic DI (NDI)", pct: "Match urine output: 2–10 L/m²/day possible", note: "Free water replacement critical; use hypotonic fluids (0.45% NS or D5W)" },
      { label: "Salt-wasting (Gitelman/Bartter)", pct: "1.5× maintenance + KCl supplements", note: "Oral NaCl + KCl supplementation; monitor electrolytes 6–12 hourly acutely" },
    ],
  };

  const recs = contextRecs[context] || contextRecs.AKI;

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          <span className="text-sm font-bold">Rapid Fluid Calculator — {context}</span>
          {patientData?.weight && <Badge className="bg-white/25 text-xs">Wt: {patientData.weight} kg</Badge>}
        </div>
        <span className="text-xs opacity-75">{expanded ? "▲ Collapse" : "▼ Expand"}</span>
      </button>

      {expanded && (
        <div className="p-4 space-y-3">
          {/* Weight input */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">Patient Weight (kg)</label>
              <input
                value={localWeight}
                onChange={e => setLocalWeight(e.target.value)}
                placeholder={patientData?.weight ? `${patientData.weight} (from profile)` : "Enter weight…"}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            {fluids && (
              <div className="bg-white rounded-lg border border-blue-200 px-3 py-2 text-center min-w-[100px]">
                <p className="text-xs text-slate-500">Maintenance</p>
                <p className="text-lg font-bold text-blue-700">{fluids.perHour} mL/hr</p>
                <p className="text-xs text-slate-400">{fluids.perDay} mL/day</p>
              </div>
            )}
          </div>

          {/* Fluid grid */}
          {fluids && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "100% Maintenance", val: `${fluids.perHour} mL/hr`, color: "bg-green-50 border-green-200 text-green-800" },
                { label: "75% Restriction", val: `${Math.round(fluids.perHour * 0.75)} mL/hr`, color: "bg-amber-50 border-amber-200 text-amber-800" },
                { label: "60% Restriction", val: `${Math.round(fluids.perHour * 0.6)} mL/hr`, color: "bg-red-50 border-red-200 text-red-800" },
              ].map(({ label, val, color }) => (
                <div key={label} className={`rounded-lg border p-2 text-center ${color}`}>
                  <p className="text-xs font-semibold leading-tight">{label}</p>
                  <p className="text-base font-bold mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Context-specific recommendations */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-700">{context}-specific fluid guidance:</p>
            {recs.map((rec, i) => (
              <div key={i} className="rounded-lg bg-white border border-blue-100 p-2.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <p className="text-xs font-semibold text-slate-800">{rec.label}</p>
                </div>
                <p className="text-xs text-blue-700 ml-7"><strong>Rate:</strong> {rec.pct}</p>
                <p className="text-xs text-slate-500 ml-7 mt-0.5">{rec.note}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800"><strong>Always:</strong> Assess fluid status clinically (CVP, oedema, weight trend) before prescribing. Monitor electrolytes 4–6 hourly in AKI.</p>
          </div>

          <Link to={createPageUrl("FluidCalculator")}>
            <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 text-xs gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> Open Full Fluid Calculator
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}