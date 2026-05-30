import React, { useState, useMemo } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Copy, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ── Dose engine (same logic as DrugsDosing) ──────────────────────────────────
function freqFactor(freq = "") {
  const f = freq.toUpperCase();
  if (f.includes("QID") || f.includes("Q6H") || f.includes("4X")) return 4;
  if (f.includes("TID") || f.includes("TDS") || f.includes("Q8H") || f.includes("3X")) return 3;
  if (f.includes("BID") || f.includes("BD") || f.includes("Q12H") || f.includes("TWICE") || f.includes("2X")) return 2;
  return 1;
}

function calcDose(drug, wt) {
  if (!drug) return null;
  const raw = drug.dose_weight_based || "";
  const type = drug.dose_calculation_type || "per_day";
  const freq = drug.frequency || "OD";

  if (type === "TDM") return { type: "TDM", note: `Starting: ${raw}\nTarget: ${drug.monitoring || "see protocol"}`, freq };
  if (type === "fixed" || (!raw.includes("/kg") && !raw.includes("/m²"))) {
    return { type: "fixed", perDose: drug.dose_age_based || raw, daily: "—", freq, note: "Age-based or fixed dose" };
  }

  if (raw.includes("/kg")) {
    const m = raw.match(/([\d.]+)(?:-)?([\d.]+)?\s*(\w+)\/kg/);
    if (m && wt) {
      const minRaw = parseFloat(m[1]);
      const maxRaw = m[2] ? parseFloat(m[2]) : minRaw;
      const unit = m[3];
      const factor = freqFactor(freq);
      if (type === "per_dose") {
        const minD = (minRaw * wt).toFixed(1);
        const maxD = (maxRaw * wt).toFixed(1);
        const label = m[2] ? `${minD}–${maxD} ${unit}` : `${minD} ${unit}`;
        const note = `${minRaw}${m[2] ? `–${maxRaw}` : ""} ${unit}/kg/dose × ${wt} kg = ${label}`;
        const maxCheck = drug.max_dose_per_day ? checkMax(parseFloat(maxD), drug.max_dose_per_day) : null;
        return { type: "weight_per_dose", perDose: label, daily: `${(parseFloat(minD)*factor).toFixed(1)}–${(parseFloat(maxD)*factor).toFixed(1)} ${unit}/day`, freq, note, maxExceeded: maxCheck };
      } else {
        const minD = minRaw * wt;
        const maxD = maxRaw * wt;
        const perMin = (minD / factor).toFixed(1);
        const perMax = (maxD / factor).toFixed(1);
        const label = m[2] ? `${perMin}–${perMax} ${unit}` : `${perMin} ${unit}`;
        const note = `${minRaw}${m[2] ? `–${maxRaw}` : ""} ${unit}/kg/day ÷ ${factor} doses × ${wt} kg = ${label}`;
        const maxCheck = drug.max_dose_per_day ? checkMax(parseFloat(perMax), drug.max_dose_per_day) : null;
        return { type: "weight_per_day", perDose: label, daily: m[2] ? `${minD.toFixed(1)}–${maxD.toFixed(1)} ${unit}/day` : `${minD.toFixed(1)} ${unit}/day`, freq, note, maxExceeded: maxCheck };
      }
    } else if (!wt) {
      // no weight yet — show formula
      const m2 = raw.match(/([\d.]+)(?:-)?([\d.]+)?\s*(\w+)\/kg/);
      if (m2) return { type: "formula", perDose: null, formula: raw, freq };
    }
  }

  return { type: "unknown", perDose: raw, daily: "—", freq, note: "See drug monograph" };
}

function checkMax(calcVal, maxStr) {
  const maxNum = parseFloat(maxStr);
  if (!isNaN(calcVal) && !isNaN(maxNum) && calcVal > maxNum) return { exceeded: true, maxStr };
  return { exceeded: false, maxStr };
}

function Collapsible({ label, children, defaultOpen = false, highlight = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-xl border-2 overflow-hidden ${highlight ? "border-red-300" : "border-slate-200"}`}>
      <button
        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-colors ${open ? "bg-slate-50" : "bg-white hover:bg-slate-50"}`}
        onClick={() => setOpen(v => !v)}
      >
        <span className={highlight ? "text-red-700" : "text-slate-700"}>{label}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && <div className="px-4 py-3 bg-white border-t border-slate-100 text-sm text-slate-700 space-y-1">{children}</div>}
    </div>
  );
}

export default function DrugDoseScreen({ drug, onBack }) {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const wt = parseFloat(weight) || null;
  const ageNum = parseFloat(age) || null;

  const dose = useMemo(() => calcDose(drug, wt), [drug, wt]);

  const brands = drug.brands_indian ? drug.brands_indian.split(",").map(s => s.trim()).filter(Boolean) : [];
  const hasRenal = drug.renal_adjust || drug.hd_adjust || drug.pd_adjust || drug.crrt_dose;
  const hasIV = drug.route?.toLowerCase().includes("iv") && drug.iv_preparation_instructions;

  const isNeonatal = (ageNum !== null && ageNum < 0.08) || (wt !== null && wt < 3);

  const copyBrand = (brand) => {
    navigator.clipboard.writeText(brand);
    toast.success(`"${brand}" copied`);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-purple-200 hover:text-white text-sm mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to search
        </button>
        <h1 className="text-xl font-bold text-white leading-tight">{drug.generic_name}</h1>
        <div className="flex gap-2 flex-wrap mt-1.5">
          {drug.category && <Badge className="bg-white/20 text-white text-xs border-0">{drug.category}</Badge>}
          {drug.route && <Badge className="bg-white/10 text-purple-100 text-xs border-0">{drug.route}</Badge>}
          {drug.jan_aushadhi_available && <Badge className="bg-green-500/80 text-white text-xs border-0">Jan Aushadhi</Badge>}
          {drug.pmjay_covered && <Badge className="bg-blue-400/80 text-white text-xs border-0">PMJAY</Badge>}
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">

        {/* Weight input */}
        <div className="bg-white border-2 border-purple-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">Patient Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Weight (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="e.g. 15"
                autoFocus
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-3 text-xl font-bold text-slate-900 focus:border-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Age (years, optional)</label>
              <input
                type="number"
                inputMode="decimal"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="e.g. 5"
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-3 text-xl font-bold text-slate-900 focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Neonatal warning */}
        {isNeonatal && drug.neonatal_dose && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-yellow-800 mb-1">⚠️ Neonatal Dose</p>
            <p className="text-sm text-yellow-900">{drug.neonatal_dose}</p>
          </div>
        )}

        {/* Calculated dose block */}
        <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-4">
          <p className="text-xs font-bold text-purple-600 uppercase mb-3">Calculated Dose</p>

          {dose?.type === "TDM" ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-3 text-sm text-blue-800">
              <strong>TDM-guided dosing.</strong><br />{dose.note}
            </div>
          ) : dose?.type === "formula" || !wt ? (
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">Enter weight above to calculate dose</p>
              {drug.dose_weight_based && (
                <p className="text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2">
                  Formula: {drug.dose_weight_based}
                </p>
              )}
            </div>
          ) : dose ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white border-2 border-purple-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 mb-0.5">Per Dose</p>
                  <p className="text-lg font-black text-purple-800">{dose.perDose || "—"}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 mb-0.5">Daily Total</p>
                  <p className="text-base font-bold text-slate-800">{dose.daily || "—"}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 mb-0.5">Frequency</p>
                  <p className="text-base font-bold text-slate-800">{dose.freq || drug.frequency || "—"}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 mb-0.5">Route</p>
                  <p className="text-base font-bold text-slate-800">{drug.route || "PO"}</p>
                </div>
              </div>
              {dose.note && (
                <p className="text-xs text-slate-500 bg-white border border-slate-100 rounded-xl px-3 py-2">{dose.note}</p>
              )}
              {drug.max_dose_per_day && (
                <p className="text-xs text-slate-500">Max dose: {drug.max_dose_per_day}</p>
              )}
              {dose.maxExceeded?.exceeded && (
                <div className="bg-red-50 border border-red-300 rounded-xl px-3 py-2 text-xs text-red-800">
                  ⚠️ <strong>Calculated dose exceeds maximum.</strong> Cap at {dose.maxExceeded.maxStr}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Indian brands */}
        {brands.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">Indian Brands (tap to copy)</p>
            <div className="flex flex-wrap gap-2">
              {brands.map(b => (
                <button
                  key={b}
                  onClick={() => copyBrand(b)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-medium text-slate-700 transition-colors"
                >
                  {b} <Copy className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Renal adjustment — highlighted */}
        {hasRenal && (
          <Collapsible label="⚠️ Renal / Dialysis Adjustment" highlight={true}>
            {drug.renal_adjust && <p><strong>Renal (eGFR-based):</strong> {drug.renal_adjust}</p>}
            {drug.hd_adjust && <p><strong>Haemodialysis:</strong> {drug.hd_adjust}</p>}
            {drug.pd_adjust && <p><strong>Peritoneal Dialysis:</strong> {drug.pd_adjust}</p>}
            {drug.crrt_dose && <p><strong>CRRT:</strong> {drug.crrt_dose}</p>}
          </Collapsible>
        )}

        {/* Monitoring */}
        {(drug.monitoring || drug.monitoring_frequency) && (
          <Collapsible label="📊 Monitoring">
            {drug.monitoring && <p>{drug.monitoring}</p>}
            {drug.monitoring_frequency && <p className="text-slate-500">Frequency: {drug.monitoring_frequency}</p>}
          </Collapsible>
        )}

        {/* Adverse effects + interactions */}
        {(drug.adverse_effects || drug.key_interactions) && (
          <Collapsible label="⚡ Adverse Effects & Interactions">
            {drug.adverse_effects && <><p className="font-semibold text-slate-600 text-xs uppercase mb-0.5">Adverse Effects</p><p>{drug.adverse_effects}</p></>}
            {drug.key_interactions && <><p className="font-semibold text-slate-600 text-xs uppercase mt-2 mb-0.5">Key Interactions</p><p>{drug.key_interactions}</p></>}
          </Collapsible>
        )}

        {/* IV preparation — only if IV route */}
        {hasIV && (
          <Collapsible label="💉 IV Preparation">
            <p>{drug.iv_preparation_instructions}</p>
          </Collapsible>
        )}

        {/* Clinical pearls */}
        {drug.clinical_pearls && (
          <Collapsible label="💡 Clinical Pearls" defaultOpen={true}>
            <p>{drug.clinical_pearls}</p>
          </Collapsible>
        )}

        {/* Full info link */}
        <p className="text-xs text-center text-slate-400 pb-4">
          For complete monograph including contraindications and references, search the drug in the Dose Calculator tab.
        </p>
      </div>
    </div>
  );
}