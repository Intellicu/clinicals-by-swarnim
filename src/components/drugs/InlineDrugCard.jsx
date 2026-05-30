import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, Plus, Check, AlertTriangle, Pill, Shield } from "lucide-react";
import { QuickDoseCard } from "./DrugDetailCard";

// ── Max-dose warning helper ───────────────────────────────────────────────────
function MaxDoseWarning({ dose, maxStr }) {
  if (!dose || !maxStr || dose.type === "TDM" || dose.type === "fixed" || dose.type === "unknown") return null;

  const maxNum = parseFloat(maxStr);
  if (isNaN(maxNum)) return null;

  // Get the highest calculated per-dose value to compare
  const perDoseStr = dose.perDose || "";
  // Extract the upper bound of a range like "45.0–90.0 mg" or single "45.0 mg"
  const match = perDoseStr.match(/([\d.]+)\s*\w+$/);
  const calcVal = match ? parseFloat(match[1]) : null;

  // For daily comparisons, check daily total too
  const dailyStr = dose.daily || "";
  const dailyMatch = dailyStr.match(/([\d.]+)\s*\w+/);
  const dailyVal = dailyMatch ? parseFloat(dailyMatch[1]) : null;

  // Max is usually per-day — compare daily total
  const compareVal = dailyVal || calcVal;
  if (!compareVal) return null;

  const exceeded = compareVal > maxNum;
  const approaching = !exceeded && compareVal > maxNum * 0.85;

  if (!exceeded && !approaching) return null;

  return (
    <Alert className={`mt-2 border-2 ${exceeded ? "bg-red-50 border-red-400" : "bg-amber-50 border-amber-300"}`}>
      <AlertTriangle className={`w-4 h-4 ${exceeded ? "text-red-600" : "text-amber-600"}`} />
      <AlertDescription className={`text-xs font-semibold ${exceeded ? "text-red-800" : "text-amber-800"}`}>
        {exceeded
          ? `⛔ MAX DOSE EXCEEDED — Calculated: ${compareVal.toFixed(1)} vs Max: ${maxStr}. Cap at ${maxStr}.`
          : `⚠️ Approaching max dose — Calculated: ${compareVal.toFixed(1)} (>85% of max ${maxStr}). Monitor closely.`}
      </AlertDescription>
    </Alert>
  );
}

// ── Inline expandable drug card (matches previous UI from screenshots) ────────
export default function InlineDrugCard({ drug, weight, bsa, egfr, isOpen, onToggle, onAddRx, inRx, calcDose, getRenalFlag }) {
  const dose = weight ? calcDose(drug, weight, bsa, egfr) : null;
  const renalFlag = egfr ? getRenalFlag(drug, egfr) : null;

  return (
    <div className={`rounded-2xl border-2 bg-white transition-all ${isOpen ? "border-purple-400 shadow-md" : "border-slate-200 hover:border-purple-200"}`}>
      {/* Header row — always visible */}
      <button
        className="w-full text-left flex items-center gap-3 px-4 py-3 min-h-[56px]"
        onClick={onToggle}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isOpen ? "bg-purple-600" : "bg-purple-100"}`}>
          <Pill className={`w-4 h-4 ${isOpen ? "text-white" : "text-purple-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm leading-tight">{drug.generic_name}</p>
          <p className="text-xs text-slate-400 truncate">
            {drug.therapeutic_class || drug.category}
            {drug.brands_indian ? ` · ${drug.brands_indian.split(",").slice(0, 2).join(", ")}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {drug.category && <Badge className="text-xs bg-purple-50 text-purple-700 border-0 hidden sm:flex">{drug.category}</Badge>}
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Expanded detail */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
          {/* +Add Rx button */}
          <div className="flex justify-end pt-3">
            <Button
              size="sm"
              onClick={e => { e.stopPropagation(); onAddRx(); }}
              className={inRx ? "bg-green-600 hover:bg-green-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}
            >
              {inRx ? <><Check className="w-3 h-3 mr-1" /> In Rx</> : <><Plus className="w-3 h-3 mr-1" /> Add Rx</>}
            </Button>
          </div>

          {/* Renal flag */}
          {renalFlag && (
            <Alert className={`border-2 ${renalFlag.level === "critical" ? "bg-red-50 border-red-400" : renalFlag.level === "warning" ? "bg-amber-50 border-amber-400" : "bg-blue-50 border-blue-300"}`}>
              <Shield className="w-4 h-4" />
              <AlertDescription className="text-xs font-semibold">{renalFlag.msg}</AlertDescription>
            </Alert>
          )}

          {/* Calculated dose boxes */}
          {dose && dose.type !== "TDM" && dose.type !== "unknown" && weight ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Per Dose", value: dose.perDose, highlight: true },
                { label: "Daily Total", value: dose.daily },
                { label: "Frequency", value: dose.freq },
                { label: "Route", value: drug.route || "PO" },
              ].map(({ label, value, highlight }) => (
                <div key={label} className={`rounded-xl p-2.5 text-center border ${highlight ? "bg-purple-50 border-purple-200" : "bg-slate-50 border-slate-200"}`}>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                  <p className={`font-bold mt-0.5 text-sm ${highlight ? "text-purple-800" : "text-slate-800"}`}>{value || "—"}</p>
                </div>
              ))}
            </div>
          ) : dose?.type === "TDM" ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <strong>TDM-guided dosing.</strong> {dose.note}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic px-1">Enter weight in the patient parameters above to calculate dose.</div>
          )}

          {/* ⚠️ Max dose warning */}
          {dose && drug.max_dose_per_day && (
            <MaxDoseWarning dose={dose} maxStr={drug.max_dose_per_day} />
          )}

          {dose?.note && <p className="text-xs text-slate-500 bg-slate-50 rounded p-2">{dose.note}</p>}

          {/* Quick bedside card */}
          <QuickDoseCard drug={drug} weight={weight} egfr={egfr} />

          {/* Key info grid */}
          <div className="grid md:grid-cols-2 gap-2">
            {drug.indications && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Indications</p>
                <p className="text-xs text-slate-700">{drug.indications}</p>
              </div>
            )}
            {drug.monitoring && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-bold text-green-700 uppercase mb-1">Monitoring</p>
                <p className="text-xs text-green-800">{drug.monitoring}</p>
              </div>
            )}
            {drug.adverse_effects && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-bold text-amber-700 uppercase mb-1">Adverse Effects</p>
                <p className="text-xs text-amber-800">{drug.adverse_effects}</p>
              </div>
            )}
            {drug.contraindications && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-bold text-red-700 uppercase mb-1">Contraindications</p>
                <p className="text-xs text-red-800">{drug.contraindications}</p>
              </div>
            )}
            {drug.renal_adjust && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 md:col-span-2">
                <p className="text-xs font-bold text-indigo-700 uppercase mb-1">Renal Dose Adjustment</p>
                <p className="text-xs text-indigo-800">{drug.renal_adjust}</p>
                {drug.hd_adjust && <p className="text-xs text-indigo-700 mt-1"><strong>HD:</strong> {drug.hd_adjust}</p>}
                {drug.pd_adjust && <p className="text-xs text-indigo-700 mt-1"><strong>PD:</strong> {drug.pd_adjust}</p>}
                {drug.crrt_dose && <p className="text-xs text-indigo-700 mt-1"><strong>CRRT:</strong> {drug.crrt_dose}</p>}
              </div>
            )}
            {drug.clinical_pearls && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 md:col-span-2">
                <p className="text-xs font-bold text-emerald-700 uppercase mb-1">💡 Clinical Pearls</p>
                <p className="text-xs text-emerald-800">{drug.clinical_pearls}</p>
              </div>
            )}
          </div>

          {/* Formulations */}
          {drug.formulations?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Available Formulations (India)</p>
              <div className="flex flex-wrap gap-1.5">
                {drug.formulations.map((f, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {f.form}: <strong className="ml-1">{f.strength}</strong> {f.pack_info && `(${f.pack_info})`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Cost info */}
          {(drug.jan_aushadhi_available || drug.pmjay_covered || drug.approx_cost_per_unit_inr) && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
              <p className="text-xs font-bold text-teal-700 uppercase mb-2">Accessibility (India)</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {drug.jan_aushadhi_available && <Badge className="bg-teal-100 text-teal-800">✓ Jan Aushadhi</Badge>}
                {drug.pmjay_covered && <Badge className="bg-blue-100 text-blue-800">✓ PMJAY Covered</Badge>}
                {drug.biosimilar_available && <Badge className="bg-purple-100 text-purple-800">✓ Biosimilar Available</Badge>}
                {drug.approx_cost_per_unit_inr && <span className="text-teal-700">≈ ₹{drug.approx_cost_per_unit_inr}/unit</span>}
              </div>
              {drug.biosimilar_brands && <p className="text-xs text-teal-700 mt-1">Biosimilars: {drug.biosimilar_brands}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}