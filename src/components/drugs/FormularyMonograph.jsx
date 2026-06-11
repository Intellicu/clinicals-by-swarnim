import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronDown, ChevronUp, Clock, Droplets, Pill, Shield,
  Activity, Info, CheckCircle, BookOpen, FlaskConical, Syringe,
  AlertTriangle, Thermometer, Package, Utensils, TestTube
} from "lucide-react";
import DoseSafetyWarning from "./DoseSafetyWarning";
import PrescriptionBuilder from "./PrescriptionBuilder";

const SECTIONS = [
  { key: "mechanism", label: "Mechanism of Action", icon: TestTube, color: "slate" },
  { key: "peds_dose", label: "Paediatric Dose", icon: Pill, color: "purple" },
  { key: "neonatal_dose", label: "Neonatal Dose", icon: Pill, color: "pink" },
  { key: "renal_adjust", label: "Renal Dose Adjustment", icon: Shield, color: "indigo" },
  { key: "hd_adjust", label: "Haemodialysis", icon: Activity, color: "blue" },
  { key: "pd_adjust", label: "Peritoneal Dialysis", icon: Activity, color: "cyan" },
  { key: "crrt_adjust", label: "CRRT", icon: Activity, color: "teal" },
  { key: "contraindications", label: "Contraindications", icon: AlertTriangle, color: "red" },
  { key: "interactions", label: "Key Drug Interactions", icon: AlertTriangle, color: "orange" },
  { key: "monitoring", label: "Monitoring Required", icon: Activity, color: "green" },
  { key: "timing", label: "Timing & Administration", icon: Clock, color: "blue" },
  { key: "food", label: "Food Advice", icon: Utensils, color: "amber" },
  { key: "crush", label: "Crushing / NG Tube", icon: FlaskConical, color: "orange" },
  { key: "storage", label: "Storage", icon: Thermometer, color: "slate" },
  { key: "vaccine_notes", label: "Vaccine Precautions", icon: Syringe, color: "red" },
  { key: "counselling", label: "Patient / Family Counselling", icon: Info, color: "teal" },
  { key: "clinical_pearls", label: "Clinical Pearls", icon: CheckCircle, color: "emerald" },
  { key: "references", label: "References", icon: BookOpen, color: "slate" },
];

const COLOR_MAP = {
  slate: "bg-slate-50 border-slate-200 text-slate-700",
  purple: "bg-purple-50 border-purple-200 text-purple-800",
  pink: "bg-pink-50 border-pink-200 text-pink-800",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  cyan: "bg-cyan-50 border-cyan-200 text-cyan-800",
  teal: "bg-teal-50 border-teal-200 text-teal-800",
  red: "bg-red-50 border-red-200 text-red-800",
  orange: "bg-orange-50 border-orange-200 text-orange-800",
  green: "bg-green-50 border-green-200 text-green-800",
  amber: "bg-amber-50 border-amber-200 text-amber-800",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
};

const ICON_COLOR_MAP = {
  slate: "text-slate-500",
  purple: "text-purple-500",
  pink: "text-pink-500",
  indigo: "text-indigo-500",
  blue: "text-blue-500",
  cyan: "text-cyan-500",
  teal: "text-teal-500",
  red: "text-red-500",
  orange: "text-orange-500",
  green: "text-green-500",
  amber: "text-amber-500",
  emerald: "text-emerald-500",
};

function FormulationCard({ formulations = [] }) {
  if (!formulations.length) return null;
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Package className="w-4 h-4 text-purple-600" />
        <span className="font-semibold text-xs uppercase tracking-wide text-purple-800">Available Formulations (India)</span>
      </div>
      <div className="space-y-2">
        {formulations.map((f, i) => (
          <div key={i} className="bg-white rounded-lg border border-purple-100 px-3 py-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-700">{f.form}</span>
                <span className="text-xs text-purple-700 font-semibold ml-2">{f.strength}</span>
                {f.note && <span className="text-xs text-amber-600 ml-2 italic">({f.note})</span>}
              </div>
            </div>
            {f.brands && (
              <p className="text-xs text-slate-500 mt-0.5">{f.brands}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DoseCalculatorPanel({ drug, weight, bsa, egfr }) {
  if (!weight || !drug?.peds_dose) return null;

  const wt = parseFloat(weight);
  const computedDose = (() => {
    const raw = drug.peds_dose;
    if (!raw) return null;
    // Extract mg/kg pattern
    const perKg = raw.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mg\/kg/);
    if (perKg && wt) {
      const lo = parseFloat(perKg[1]) * wt;
      const hi = perKg[2] ? parseFloat(perKg[2]) * wt : null;
      return hi ? `${lo.toFixed(1)}–${hi.toFixed(1)} mg` : `${lo.toFixed(1)} mg`;
    }
    // Extract mcg/kg
    const perKgMcg = raw.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mcg\/kg/);
    if (perKgMcg && wt) {
      const lo = parseFloat(perKgMcg[1]) * wt;
      const hi = perKgMcg[2] ? parseFloat(perKgMcg[2]) * wt : null;
      return hi ? `${lo.toFixed(2)}–${hi.toFixed(2)} mcg` : `${lo.toFixed(2)} mcg`;
    }
    return null;
  })();

  if (!computedDose) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Pill className="w-4 h-4" />
        <span className="font-bold text-sm">Estimated Dose for {wt} kg</span>
      </div>
      <p className="text-2xl font-black">{computedDose}</p>
      <p className="text-purple-200 text-xs mt-1">Verify against max dose and indication in monograph below</p>
    </div>
  );
}

export default function FormularyMonograph({ drug, weight, bsa, egfr, patientName, patientId, encounterId, onPrescriptionSaved }) {
  const [expanded, setExpanded] = useState(false);

  if (!drug) return null;

  const hasRenalWarning = egfr && parseFloat(egfr) < 30 &&
    drug.renal_adjust &&
    (drug.renal_adjust.toLowerCase().includes("avoid") ||
      drug.renal_adjust.toLowerCase().includes("contraindicated") ||
      drug.renal_adjust.toLowerCase().includes("reduce"));

  return (
    <div className="space-y-3">
      {/* High-priority eculizumab warning */}
      {drug.generic?.toLowerCase().includes("eculizumab") && (
        <Alert className="bg-red-50 border-2 border-red-400">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription>
            <strong className="text-red-900 block">⚠️ MENINGOCOCCAL INFECTION EMERGENCY — Eculizumab</strong>
            <span className="text-red-800 text-sm">
              ANY fever ≥38°C = medical emergency. Carry patient emergency card. Ceftriaxone IV is empiric therapy. Meningococcal vaccination MANDATORY before first dose.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Renal flag */}
      {hasRenalWarning && (
        <Alert className="bg-amber-50 border-amber-400 border-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            <strong>Renal Dose Adjustment Required (eGFR {egfr}):</strong> {drug.renal_adjust}
          </AlertDescription>
        </Alert>
      )}

      {/* Formulations */}
      <FormulationCard formulations={drug.formulations} />

      {/* Dose calculator */}
      <DoseCalculatorPanel drug={drug} weight={weight} bsa={bsa} egfr={egfr} />

      {/* Safety warnings */}
      {weight && <DoseSafetyWarning drug={drug} weight={weight} bsa={bsa} />}

      {/* Prescription builder */}
      <PrescriptionBuilder
        drug={drug}
        weight={weight}
        bsa={bsa}
        patientName={patientName}
        patientId={patientId}
        encounterId={encounterId}
        onPrescriptionSaved={onPrescriptionSaved}
      />

      {/* Full monograph toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="w-full justify-between border-indigo-300 text-indigo-700 hover:bg-indigo-50"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          {expanded ? "Hide" : "Show"} Full Monograph
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {expanded && (
        <div className="space-y-2">
          {SECTIONS.map(({ key, label, icon: SectionIcon, color }) => {
            const val = drug[key];
            if (!val) return null;
            return (
              <div key={key} className={`rounded-lg border p-3 ${COLOR_MAP[color]}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <SectionIcon className={`w-4 h-4 flex-shrink-0 ${ICON_COLOR_MAP[color]}`} />
                  <span className="font-semibold text-xs uppercase tracking-wide">{label}</span>
                </div>
                {Array.isArray(val) ? (
                  <ul className="space-y-0.5">
                    {val.map((item, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5">
                        <span className="mt-0.5 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs leading-relaxed">{val}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}