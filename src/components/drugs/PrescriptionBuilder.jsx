import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText, Printer, Copy, CheckCircle, AlertTriangle,
  ShieldAlert, X, ChevronDown, Plus, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

// ── Safety ceiling database ───────────────────────────────────────────────
const DOSE_CEILINGS = {
  "prednisolone": { maxPerDose: 60, maxPerDay: 60, unit: "mg", ref: "IPNA 2023: max 60 mg/day induction" },
  "methylprednisolone": { maxPerDose: 1000, maxPerDay: 1000, unit: "mg", ref: "KDIGO: 30 mg/kg max 1g IV pulse" },
  "dexamethasone": { maxPerDose: 10, maxPerDay: 20, unit: "mg", ref: "AAP: max 10 mg/dose croup" },
  "furosemide": { maxPerDose: 6, maxPerDay: 6, isPerKg: true, unit: "mg/kg", ref: "BNFc: max 6 mg/kg/dose oral" },
  "amlodipine": { maxPerDose: 10, maxPerDay: 10, unit: "mg", ref: "AAP HTN: max 10 mg/day" },
  "enalapril": { maxPerDose: 40, maxPerDay: 40, unit: "mg", ref: "AAP: max 40 mg/day" },
  "losartan": { maxPerDose: 100, maxPerDay: 100, unit: "mg", ref: "AAP: max 100 mg/day" },
  "labetalol": { maxPerDose: 40, isIV: true, unit: "mg/dose IV", ref: "PALS: max 40 mg IV bolus" },
  "cyclophosphamide": { maxPerDose: 750, unit: "mg/m²", ref: "IPNA: max 750 mg/m² per pulse" },
  "tacrolimus": { maxTarget: 15, unit: "ng/mL trough", ref: "Transplant TDM target 8-15 ng/mL" },
  "nifedipine": { maxPerDose: 10, maxPerDay: 30, unit: "mg", ref: "PALS: max 10 mg/dose acute" },
  "metoprolol": { maxPerDay: 200, unit: "mg/day", ref: "AAP: max 200 mg/day" },
  "spironolactone": { maxPerDay: 200, unit: "mg/day", ref: "BNFc: max 200 mg/day" },
  "cotrimoxazole": { maxProphylaxis: 2.5, unit: "mg/kg TMP-component", ref: "Standard PCP prophylaxis dose" },
  "vancomycin": { maxPerDose: 60, unit: "mg/kg/day", ref: "ASHP: AUC-guided; typical 60 mg/kg/day" },
};

function getSafetyCeiling(drugGeneric) {
  if (!drugGeneric) return null;
  const key = drugGeneric.toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, "");
  return DOSE_CEILINGS[key] || null;
}

// ── Dose calculation engine ────────────────────────────────────────────────
function computeDoseFromDrug(drug, weight, bsa) {
  const wt = parseFloat(weight);
  if (!wt || !drug?.peds_dose) return null;

  const raw = drug.peds_dose;
  const results = [];

  // mg/kg/day
  const perKgDay = raw.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mg\/kg\/day/);
  if (perKgDay) {
    const lo = parseFloat(perKgDay[1]) * wt;
    const hi = perKgDay[2] ? parseFloat(perKgDay[2]) * wt : null;
    results.push({ label: "mg/kg/day", value: hi ? `${lo.toFixed(1)}–${hi.toFixed(1)} mg/day` : `${lo.toFixed(1)} mg/day`, numericLo: lo, numericHi: hi });
  }

  // mg/kg/dose
  const perKgDose = raw.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mg\/kg\/dose/);
  if (perKgDose) {
    const lo = parseFloat(perKgDose[1]) * wt;
    const hi = perKgDose[2] ? parseFloat(perKgDose[2]) * wt : null;
    results.push({ label: "mg/kg/dose", value: hi ? `${lo.toFixed(1)}–${hi.toFixed(1)} mg/dose` : `${lo.toFixed(1)} mg/dose`, numericLo: lo, numericHi: hi });
  }

  // mg/kg plain
  if (!perKgDay && !perKgDose) {
    const perKg = raw.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mg\/kg/);
    if (perKg) {
      const lo = parseFloat(perKg[1]) * wt;
      const hi = perKg[2] ? parseFloat(perKg[2]) * wt : null;
      results.push({ label: "mg/kg", value: hi ? `${lo.toFixed(1)}–${hi.toFixed(1)} mg` : `${lo.toFixed(1)} mg`, numericLo: lo, numericHi: hi });
    }
  }

  // mcg/kg
  const perKgMcg = raw.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mcg\/kg/);
  if (perKgMcg) {
    const lo = parseFloat(perKgMcg[1]) * wt;
    const hi = perKgMcg[2] ? parseFloat(perKgMcg[2]) * wt : null;
    results.push({ label: "mcg/kg", value: hi ? `${lo.toFixed(2)}–${hi.toFixed(2)} mcg` : `${lo.toFixed(2)} mcg`, numericLo: lo, numericHi: hi });
  }

  // mg/m²
  if (bsa) {
    const perM2 = raw.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mg\/m[²2]/);
    if (perM2) {
      const lo = parseFloat(perM2[1]) * bsa;
      const hi = perM2[2] ? parseFloat(perM2[2]) * bsa : null;
      results.push({ label: "mg/m²", value: hi ? `${lo.toFixed(1)}–${hi.toFixed(1)} mg` : `${lo.toFixed(1)} mg`, numericLo: lo, numericHi: hi });
    }
  }

  return results.length > 0 ? results : null;
}

function DoseSafetyBadge({ drug, doseResults }) {
  const ceiling = getSafetyCeiling(drug?.generic);
  if (!ceiling || !doseResults?.length) return null;

  const exceeded = doseResults.some(r => {
    const val = r.numericHi || r.numericLo;
    return ceiling.maxPerDose && val > ceiling.maxPerDose;
  });

  if (!exceeded) return null;

  return (
    <Alert className="bg-red-50 border-2 border-red-500 mt-2">
      <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
      <AlertDescription>
        <strong className="text-red-800 block text-sm">⚠️ DOSE EXCEEDS SAFETY CEILING</strong>
        <span className="text-red-700 text-xs">
          Max: {ceiling.maxPerDose} {ceiling.unit}. Cap dose at this limit. Ref: {ceiling.ref}
        </span>
      </AlertDescription>
    </Alert>
  );
}

export default function PrescriptionBuilder({ drug, weight, bsa, patientName, patientId, encounterId, onPrescriptionSaved }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [overrides, setOverrides] = useState({
    dose: "",
    unit: "mg",
    frequency: "",
    route: "",
    duration: "",
    instructions: "",
  });

  const doseResults = computeDoseFromDrug(drug, weight, bsa);
  const ceiling = getSafetyCeiling(drug?.generic);

  // Pre-fill frequency and route from drug
  React.useEffect(() => {
    if (drug && open) {
      setOverrides(prev => ({
        ...prev,
        frequency: prev.frequency || drug.frequency || "",
        route: prev.route || drug.formulations?.[0]?.form?.includes("IV") ? "IV" : "PO",
        dose: prev.dose || (doseResults?.[0]?.numericLo ? (() => {
          const raw = doseResults[0].numericLo;
          const ceiling = getSafetyCeiling(drug.generic);
          const capped = ceiling?.maxPerDose ? Math.min(raw, ceiling.maxPerDose) : raw;
          return capped.toFixed(1);
        })() : ""),
      }));
    }
  }, [drug, open]);

  const doseLine = doseResults?.[0];
  const cappedDose = (() => {
    if (!doseLine) return null;
    const raw = parseFloat(overrides.dose) || doseLine.numericLo;
    if (ceiling?.maxPerDose && raw > ceiling.maxPerDose) return ceiling.maxPerDose;
    return null;
  })();

  const prescriptionText = `${drug?.generic || ""} ${overrides.dose}${overrides.unit} ${overrides.frequency} ${overrides.route}${overrides.duration ? ` × ${overrides.duration}` : ""}${overrides.instructions ? ` (${overrides.instructions})` : ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(prescriptionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!patientId) {
      toast.info("Open this from a patient encounter to save the Rx to their record.");
      return;
    }
    setSaving(true);
    try {
      const rx = await base44.entities.Prescription.create({
        patient_id: patientId,
        prescription_date: new Date().toISOString().split("T")[0],
        diagnosis: drug?.indications?.split(",")[0]?.trim() || "",
        medications: [{
          drug_name: drug?.generic,
          dose: overrides.dose,
          unit: overrides.unit,
          frequency: overrides.frequency,
          route: overrides.route,
          duration: overrides.duration,
          instructions: overrides.instructions,
        }],
        notes: `Auto-calculated dose for ${weight} kg patient via formulary.`,
      });
      toast.success("Prescription saved to patient record");
      onPrescriptionSaved?.(rx);
      setOpen(false);
    } catch {
      toast.error("Failed to save prescription");
    } finally {
      setSaving(false);
    }
  };

  if (!drug) return null;

  return (
    <div className="mt-3">
      {!open ? (
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <FileText className="w-4 h-4" />
          Add to Prescription
        </Button>
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-sm text-emerald-800">Prescription Builder</span>
              {weight && <Badge className="bg-emerald-100 text-emerald-800 text-xs">{weight} kg</Badge>}
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Auto-calculated dose display */}
          {doseResults?.length > 0 && (
            <div className="bg-white rounded-lg border border-emerald-200 p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1">AUTO-CALCULATED DOSE</p>
              {doseResults.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-emerald-900">{r.value}</span>
                  <span className="text-xs text-slate-500">({r.label})</span>
                </div>
              ))}
              {ceiling?.maxPerDose && (
                <div className={`mt-1.5 text-xs flex items-center gap-1 font-medium ${
                  doseResults.some(r => (r.numericHi || r.numericLo) > ceiling.maxPerDose)
                    ? "text-red-600" : "text-amber-600"
                }`}>
                  <ShieldAlert className="w-3 h-3" />
                  Ceiling: {ceiling.maxPerDose} {ceiling.unit}
                </div>
              )}
            </div>
          )}

          {/* Exceeds ceiling warning */}
          {doseResults && <DoseSafetyBadge drug={drug} doseResults={doseResults} />}

          {/* Capped dose alert */}
          {cappedDose && (
            <Alert className="bg-amber-50 border-amber-400 py-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-xs">
                Dose capped at <strong>{cappedDose} {overrides.unit}</strong> (safety ceiling)
              </AlertDescription>
            </Alert>
          )}

          {/* Editable fields */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Dose</label>
              <div className="flex gap-1">
                <Input
                  value={overrides.dose}
                  onChange={e => setOverrides(p => ({ ...p, dose: e.target.value }))}
                  placeholder="e.g. 20"
                  className="text-sm h-8"
                />
                <select
                  value={overrides.unit}
                  onChange={e => setOverrides(p => ({ ...p, unit: e.target.value }))}
                  className="text-xs border border-slate-200 rounded px-1 h-8 bg-white"
                >
                  {["mg", "mcg", "mL", "units", "g"].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Frequency</label>
              <select
                value={overrides.frequency}
                onChange={e => setOverrides(p => ({ ...p, frequency: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white"
              >
                {["", "OD", "BD", "TDS", "QID", "Q6H", "Q8H", "Q12H", "PRN", "STAT", "Alt day"].map(f => (
                  <option key={f} value={f}>{f || "Select..."}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Route</label>
              <select
                value={overrides.route}
                onChange={e => setOverrides(p => ({ ...p, route: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white"
              >
                {["PO", "IV", "IM", "SC", "SL", "Inhaled", "Topical", "PR"].map(r => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Duration</label>
              <Input
                value={overrides.duration}
                onChange={e => setOverrides(p => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 4 weeks"
                className="text-sm h-8"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Special Instructions</label>
            <Input
              value={overrides.instructions}
              onChange={e => setOverrides(p => ({ ...p, instructions: e.target.value }))}
              placeholder="With food, after meals, etc."
              className="text-sm h-8"
            />
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
            <p className="text-xs text-slate-400 mb-0.5">Prescription preview</p>
            <p className="text-sm font-mono text-slate-800 leading-snug">{prescriptionText}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 gap-1.5 text-xs"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Rx"}
            </Button>
            {patientId ? (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
              >
                {saving ? "Saving..." : <><Plus className="w-3.5 h-3.5" /> Save to Patient Rx</>}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleCopy}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print Rx
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}