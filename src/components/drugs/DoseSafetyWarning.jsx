import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, AlertTriangle, Info } from "lucide-react";

// Comprehensive pediatric dose safety ceilings
const SAFETY_CEILINGS = {
  "prednisolone": [
    { context: "NS Induction", maxPerDay: 60, unit: "mg/day", severity: "critical", ref: "IPNA 2023" },
    { context: "Maintenance (alternate day)", maxPerDay: 40, unit: "mg/day alt-day", severity: "warning", ref: "IPNA 2023" },
  ],
  "methylprednisolone": [
    { context: "IV Pulse", maxPerDose: 1000, unit: "mg/dose", severity: "critical", ref: "KDIGO: 30 mg/kg max 1g" },
  ],
  "dexamethasone": [
    { context: "Croup", maxPerDose: 10, unit: "mg/dose", severity: "critical", ref: "AAP" },
    { context: "General", maxPerDay: 20, unit: "mg/day", severity: "warning", ref: "BNFc" },
  ],
  "furosemide": [
    { context: "Oral", maxPerKgDose: 6, unit: "mg/kg/dose", severity: "critical", ref: "BNFc" },
    { context: "IV", maxPerKgDose: 1, unit: "mg/kg/dose IV", severity: "warning", ref: "BNFc" },
    { context: "Continuous infusion", maxPerKgHr: 0.4, unit: "mg/kg/hr", severity: "critical", ref: "BNFc" },
  ],
  "amlodipine": [
    { context: "Pediatric HTN", maxPerDay: 10, unit: "mg/day", severity: "critical", ref: "AAP HTN 2017" },
  ],
  "enalapril": [
    { context: "Pediatric", maxPerDay: 40, unit: "mg/day", severity: "critical", ref: "AAP" },
    { context: "Neonatal", maxPerDose: 0.05, unit: "mg/kg/dose", severity: "critical", ref: "BNFc — neonatal hypotension risk" },
  ],
  "losartan": [
    { context: "Pediatric", maxPerDay: 100, unit: "mg/day", severity: "critical", ref: "AAP" },
  ],
  "labetalol": [
    { context: "IV bolus", maxPerDose: 40, unit: "mg/dose IV", severity: "critical", ref: "PALS" },
    { context: "IV infusion", maxPerKgHr: 3, unit: "mg/kg/hr", severity: "critical", ref: "BNFc" },
  ],
  "nifedipine": [
    { context: "Acute dosing", maxPerDose: 10, unit: "mg/dose", severity: "critical", ref: "PALS — hypotension risk" },
    { context: "Daily", maxPerDay: 30, unit: "mg/day", severity: "warning", ref: "BNFc" },
  ],
  "vancomycin": [
    { context: "Daily", maxPerKgDay: 60, unit: "mg/kg/day (AUC-guided preferred)", severity: "warning", ref: "ASHP 2020" },
  ],
  "cyclophosphamide": [
    { context: "IV pulse", maxPerM2Dose: 750, unit: "mg/m²/pulse", severity: "critical", ref: "IPNA" },
    { context: "Cumulative", maxCumulativeMgKg: 168, unit: "mg/kg cumulative total", severity: "critical", ref: "IPNA — gonadotoxicity threshold" },
  ],
  "cyclosporine": [
    { context: "SRNS", maxPerKgDay: 5, unit: "mg/kg/day", severity: "critical", ref: "IPNA 2023 — nephrotoxicity above 5 mg/kg" },
  ],
  "sodium nitroprusside": [
    { context: "Infusion rate", maxPerKgMin: 8, unit: "mcg/kg/min", severity: "critical", ref: "PALS — cyanide toxicity" },
    { context: "Duration", maxDurationHrs: 72, unit: "hours total", severity: "critical", ref: "Cyanide/thiocyanate accumulation" },
  ],
  "levamisole": [
    { context: "Alt-day dose", maxPerDose: 150, unit: "mg/dose", severity: "critical", ref: "IPNA 2023" },
  ],
  "spironolactone": [
    { context: "Daily", maxPerDay: 200, unit: "mg/day", severity: "warning", ref: "BNFc" },
  ],
  "metoprolol": [
    { context: "Daily", maxPerDay: 200, unit: "mg/day", severity: "warning", ref: "BNFc" },
  ],
  "eculizumab": [
    { context: "High-flux HD supplement", note: "Supplement 300 mg per PE/HD session (drug removed)", severity: "info" },
  ],
};

function getKey(generic) {
  if (!generic) return "";
  return generic.toLowerCase().replace(/\s+/g, " ").trim();
}

export default function DoseSafetyWarning({ drug, weight, bsa, calculatedDoses }) {
  if (!drug?.generic) return null;

  const key = getKey(drug.generic);
  const ceilings = SAFETY_CEILINGS[key];

  if (!ceilings?.length) return null;

  const wt = parseFloat(weight) || 0;

  // Compute calculated value for comparison
  const calcMg = (() => {
    if (!calculatedDoses?.length) return null;
    return calculatedDoses[0]?.numericHi || calculatedDoses[0]?.numericLo || null;
  })();

  const warnings = ceilings.map(c => {
    let exceeded = false;
    let calcText = null;

    if (c.maxPerDay && calcMg) {
      exceeded = calcMg > c.maxPerDay;
      calcText = `Calculated: ${calcMg.toFixed(1)} mg`;
    } else if (c.maxPerDose && calcMg) {
      exceeded = calcMg > c.maxPerDose;
      calcText = `Calculated: ${calcMg.toFixed(1)} mg`;
    } else if (c.maxPerKgDay && wt) {
      const calcVal = calcMg || 0;
      exceeded = calcVal > c.maxPerKgDay * wt;
    }

    return { ...c, exceeded, calcText };
  });

  const criticalExceeded = warnings.filter(w => w.exceeded && w.severity === "critical");
  const warningsTriggered = warnings.filter(w => w.exceeded && w.severity === "warning");
  const infoOnly = warnings.filter(w => !w.exceeded && w.severity === "info");

  return (
    <div className="space-y-2">
      {criticalExceeded.map((w, i) => (
        <Alert key={i} className="bg-red-50 border-2 border-red-500">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
          <AlertDescription>
            <strong className="text-red-900 block text-sm">
              🚨 DOSE EXCEEDS SAFETY CEILING — {w.context}
            </strong>
            <span className="text-red-800 text-xs block mt-0.5">
              Maximum: <strong>{w.maxPerDose || w.maxPerDay || w.maxPerKgDay} {w.unit}</strong>
              {w.calcText && ` · ${w.calcText}`}
            </span>
            {w.ref && <span className="text-red-600 text-xs italic">Reference: {w.ref}</span>}
          </AlertDescription>
        </Alert>
      ))}

      {warningsTriggered.map((w, i) => (
        <Alert key={i} className="bg-amber-50 border-2 border-amber-400">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <AlertDescription>
            <strong className="text-amber-900 text-sm block">
              ⚠️ Near Safety Limit — {w.context}
            </strong>
            <span className="text-amber-800 text-xs block">
              Max {w.maxPerDay || w.maxPerDose} {w.unit}
              {w.calcText && ` · ${w.calcText}`}
            </span>
            {w.ref && <span className="text-amber-600 text-xs italic">{w.ref}</span>}
          </AlertDescription>
        </Alert>
      ))}

      {/* Always show ceilings as info even if not exceeded */}
      {!criticalExceeded.length && !warningsTriggered.length && ceilings.filter(c => c.severity !== "info").length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600">SAFETY CEILINGS FOR {drug.generic.toUpperCase()}</span>
          </div>
          {ceilings.filter(c => c.severity !== "info").map((c, i) => (
            <div key={i} className="text-xs text-slate-600 flex justify-between">
              <span>{c.context}:</span>
              <span className="font-bold text-slate-800">Max {c.maxPerDose || c.maxPerDay || c.maxPerKgDay} {c.unit}</span>
            </div>
          ))}
        </div>
      )}

      {infoOnly.map((w, i) => (
        <Alert key={i} className="bg-blue-50 border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-xs">{w.note}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}