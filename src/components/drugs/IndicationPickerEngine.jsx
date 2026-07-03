/**
 * IndicationPickerEngine
 * 
 * Drives indication-first prescribing for ALL drugs by reading DoseRules from DB.
 * Flow:
 *   1. Load DoseRules for drug (by drug_id or drug_name fallback)
 *   2a. Rules found → show grouped specialty picker → calculate from rule
 *   2b. No rules found → show monograph-only state with manual entry
 */
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle, AlertTriangle, Loader2, FileText, ChevronDown,
  ChevronUp, Info, ClipboardList, BookOpen, Pencil
} from "lucide-react";
import { toast } from "sonner";

// ── Dose calculation from a DoseRule ────────────────────────────────────────
function dosesPerDayFromFreq(freq = "") {
  const f = freq.toUpperCase();
  if (f.includes("QID") || f.includes("Q6H")) return 4;
  if (f.includes("TID") || f.includes("TDS") || f.includes("Q8H")) return 3;
  if (f.includes("BID") || f.includes("BD") || f.includes("Q12H") || f.includes("TWICE")) return 2;
  if (f.includes("ALT") || f.includes("EOD") || f.includes("WEEK")) return 0; // non-daily — can't split a daily total
  return 1; // OD / STAT / unknown
}

// The measured unit ("mg", "mcg", "g", "units"…) — never assume mg
function unitLabelOf(doseUnit = "") {
  const m = doseUnit.match(/^([a-zA-Zμ]+)/);
  return m ? m[1] : "mg";
}

function calcFromRule(rule, weightKg, bsaM2) {
  const wt = parseFloat(weightKg) || 0;
  const bsa = parseFloat(bsaM2) || 0;
  const val = rule.dose_value;
  const unit = rule.dose_unit || "";
  const unitLabel = unitLabelOf(unit);
  const maxTotalMg = rule.max_total_mg;
  const roundStrat = rule.rounding_strategy || "exact";

  let rawDose = null;
  let basisLabel = "";

  if (unit.includes("kg") && wt) {
    rawDose = val * wt;
    basisLabel = `${wt} kg × ${val} ${unit}`;
  } else if (unit.includes("m2") || unit.includes("m²")) {
    if (bsa) {
      rawDose = val * bsa;
      basisLabel = `${bsa} m² × ${val} ${unit}`;
    }
  } else if (unit.includes("dose") || unit.includes("day")) {
    rawDose = val;
    basisLabel = `Fixed: ${val} ${unit}`;
  }

  if (rawDose === null) return null;

  // Apply max cap
  let capped = false;
  let capVal = null;
  if (maxTotalMg && rawDose > maxTotalMg) {
    capped = true;
    capVal = maxTotalMg;
    rawDose = maxTotalMg;
  }

  // Per-day units must be divided across the day's administrations;
  // per-dose (or unspecified) units are already a single administration.
  const isPerDay = /\/\s*day\b/i.test(unit) || unit.toLowerCase().endsWith("day");
  const dosesPerDay = dosesPerDayFromFreq(rule.frequency);
  let perAdminRaw = rawDose;
  let dailyTotal = null;
  let scheduleWarning = null;
  if (isPerDay) {
    dailyTotal = rawDose;
    if (dosesPerDay >= 1) {
      perAdminRaw = rawDose / dosesPerDay;
    } else {
      scheduleWarning = `Rule is per-day but frequency is "${rule.frequency}" (non-daily) — verify schedule manually`;
    }
  } else if (dosesPerDay >= 1) {
    dailyTotal = rawDose * dosesPerDay;
  }

  // Rounding — applied to the per-administration dose
  const applyRound = (x) => {
    if (roundStrat === "nearest_5") return x < 5 ? parseFloat(x.toFixed(2)) : Math.round(x / 5) * 5;
    if (roundStrat === "nearest_10") return x < 10 ? parseFloat(x.toFixed(2)) : Math.round(x / 10) * 10;
    if (roundStrat === "round_up") return x < 2 ? parseFloat(x.toFixed(2)) : Math.ceil(x);
    if (roundStrat === "round_down") return x < 2 ? parseFloat(x.toFixed(2)) : Math.floor(x);
    return parseFloat(x.toFixed(2));
  };
  const finalDose = applyRound(perAdminRaw);
  if (dailyTotal !== null) dailyTotal = parseFloat(dailyTotal.toFixed(2));

  // Sanity check against min/max per kg (on the daily amount when the rule is per-day)
  let rangeWarning = null;
  const checkAmount = isPerDay && dailyTotal !== null ? dailyTotal : finalDose;
  if (rule.min_dose_per_kg && wt && (checkAmount / wt) < rule.min_dose_per_kg) {
    rangeWarning = `Dose ${checkAmount} falls below minimum ${rule.min_dose_per_kg} ${unitLabel}/kg`;
  }
  if (rule.max_dose_per_kg && wt && (checkAmount / wt) > rule.max_dose_per_kg) {
    rangeWarning = `Dose ${checkAmount} exceeds maximum ${rule.max_dose_per_kg} ${unitLabel}/kg`;
  }

  return { finalDose, dailyTotal, isPerDay, dosesPerDay, unitLabel, basisLabel, capped, capVal, rangeWarning, scheduleWarning, unit };
}

// ── Indication Picker (DoseRule-based) ───────────────────────────────────────
function DoseRuleIndicationPicker({ rules, drug, weight, bsa, onSelectRule }) {
  const [selectedId, setSelectedId] = useState(null);
  const wt = parseFloat(weight);

  // Group by specialty
  const grouped = rules.reduce((acc, r) => {
    const sp = r.specialty || "Other";
    if (!acc[sp]) acc[sp] = [];
    acc[sp].push(r);
    return acc;
  }, {});

  const selectedRule = rules.find(r => r.id === selectedId);
  const calc = selectedRule ? calcFromRule(selectedRule, weight, bsa) : null;

  return (
    <div className="space-y-3">
      <Alert className="bg-blue-50 border-blue-300 py-2">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <AlertDescription className="text-blue-800 text-xs font-semibold">
          Select an indication to calculate the correct dose. No prescription is generated until you choose.
        </AlertDescription>
      </Alert>

      {/* Patient context */}
      <div className="flex gap-2 flex-wrap">
        {wt > 0 && <Badge className="bg-blue-100 text-blue-800">Weight: {wt} kg</Badge>}
        {bsa && <Badge className="bg-indigo-100 text-indigo-800">BSA: {bsa} m²</Badge>}
      </div>

      {/* Grouped indication list */}
      <div className="space-y-3">
        {Object.entries(grouped).map(([specialty, spRules]) => (
          <div key={specialty}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">{specialty}</p>
            <div className="space-y-1.5">
              {spRules.map(rule => {
                const c = calcFromRule(rule, weight, bsa);
                const isSelected = selectedId === rule.id;
                return (
                  <button
                    key={rule.id}
                    onClick={() => setSelectedId(isSelected ? null : rule.id)}
                    className={`block w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50"}`}
                  >
                    {/* Indication name + phase badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-slate-900 leading-snug pr-2">{rule.indication}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {rule.phase && <Badge className="bg-slate-100 text-slate-600 text-[10px] px-2">{rule.phase}</Badge>}
                        {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      </div>
                    </div>

                    {/* 2-col dose grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-700 mb-1">
                      <span><span className="text-slate-400">Dose: </span><strong>{rule.dose_value} {rule.dose_unit}</strong></span>
                      <span><span className="text-slate-400">Freq: </span><strong>{rule.frequency || "—"}</strong></span>
                      <span><span className="text-slate-400">Route: </span><strong>{rule.route || "—"}</strong></span>
                      {rule.duration_days > 0 && <span><span className="text-slate-400">Duration: </span><strong>{rule.duration_days}d</strong></span>}
                    </div>
                    {rule.duration_notes && (
                      <p className="text-[11px] text-slate-500 italic mb-2">{rule.duration_notes}</p>
                    )}

                    {/* Calculated dose — prominent teal box */}
                    {c && (
                      <div className="mt-2 bg-teal-50 rounded-lg px-3 py-2 border border-teal-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-teal-700">For this patient:</span>
                          <span className="text-xl font-bold text-teal-900 leading-none">
                            {c.finalDose} {c.unitLabel}<span className="text-xs font-semibold"> /dose</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] text-teal-600">{c.basisLabel}</span>
                          {c.capped && <span className="text-[10px] text-amber-600">max {c.capVal} {c.unitLabel}</span>}
                        </div>
                        {c.dailyTotal !== null && c.dosesPerDay > 1 && (
                          <p className="text-[10px] text-teal-700 mt-0.5">Daily total: {c.dailyTotal} {c.unitLabel} ÷ {c.dosesPerDay} doses</p>
                        )}
                        {c.scheduleWarning && <p className="text-[10px] text-amber-600 mt-0.5">⚠ {c.scheduleWarning}</p>}
                        {c.rangeWarning && <p className="text-[10px] text-amber-600 mt-0.5">⚠ {c.rangeWarning}</p>}
                      </div>
                    )}

                    {/* Footer: TDM / guideline */}
                    {(rule.tdm_required || rule.guideline_source) && (
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
                        {rule.tdm_required && <p className="text-[10px] text-indigo-700 font-semibold">🎯 TDM — target: {rule.target_trough || "see guideline"}</p>}
                        {rule.guideline_source && <p className="text-[10px] text-slate-400">📚 {rule.guideline_source}</p>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Calculation trail + action */}
      {selectedRule && calc && (
        <div className="space-y-2 border-t border-slate-200 pt-3 mt-3">
          {/* Full calculation trail */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 font-mono text-xs text-slate-700 space-y-0.5">
            <p className="font-bold text-slate-900 not-italic mb-1">Calculation Trail</p>
            <p>Indication: {selectedRule.indication}</p>
            <p>Rule: {selectedRule.dose_value} {selectedRule.dose_unit} {selectedRule.frequency} {selectedRule.route}</p>
            <p>{calc.basisLabel} = {calc.isPerDay && calc.dailyTotal !== null ? `${calc.dailyTotal} ${calc.unitLabel}/day` : `${calc.finalDose} ${calc.unitLabel}`}</p>
            {calc.isPerDay && calc.dosesPerDay >= 1 && <p>Per administration: {calc.dailyTotal} ÷ {calc.dosesPerDay} = {calc.finalDose} {calc.unitLabel}/dose</p>}
            {calc.capped && <p className="text-amber-700">⚠ Capped at max {calc.capVal} {calc.unitLabel}</p>}
            {calc.scheduleWarning && <p className="text-amber-700">⚠ {calc.scheduleWarning}</p>}
            {selectedRule.duration_days > 0 && <p>Duration: {selectedRule.duration_days} days</p>}
            {selectedRule.duration_notes && <p>({selectedRule.duration_notes})</p>}
          </div>

          {selectedRule.egfr_threshold_caution && (
            <Alert className="bg-amber-50 border-amber-300 py-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <AlertDescription className="text-amber-800 text-xs">
                <strong>Renal caution:</strong> {selectedRule.egfr_adjustment_notes || `Reduce dose if eGFR <${selectedRule.egfr_threshold_caution}`}
              </AlertDescription>
            </Alert>
          )}

          {selectedRule.pre_dose_workup && (
            <Alert className="bg-blue-50 border-blue-300 py-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                <strong>Pre-dose workup:</strong> {selectedRule.pre_dose_workup}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={() => onSelectRule(selectedRule, calc)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-sm"
          >
            <FileText className="w-4 h-4" />
            Build Prescription for: {selectedRule.indication}
          </Button>
        </div>
      )}

      {!selectedRule && (
        <Alert className="bg-slate-50 border-slate-200 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
          <AlertDescription className="text-slate-600 text-xs">
            Select an indication above to see the calculated dose and build the prescription.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// ── Monograph-only fallback (no DoseRules found) ─────────────────────────────
function MonographOnlyState({ drug, weight, bsa, onManualEntry }) {
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ dose: "", unit: "mg", frequency: "", route: "PO", duration: "", indication: "" });

  return (
    <div className="space-y-3">
      <Alert className="bg-amber-50 border-amber-400 py-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <AlertDescription className="text-amber-800 text-xs">
          <strong>No indication-specific dosing rule available for this drug.</strong><br />
          This drug is shown in monograph reference mode only. Use the drug monograph for guidance, then enter the dose manually.
        </AlertDescription>
      </Alert>

      <Button size="sm"
        className="w-full bg-slate-700 hover:bg-slate-800 text-white gap-1"
        onClick={() => setShowManual(v => !v)}>
        <Pencil className="w-3.5 h-3.5" /> Manual Entry {showManual ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </Button>

      {showManual && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
          <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Pencil className="w-3.5 h-3.5" /> Manual Dose Entry</p>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Indication / Diagnosis</label>
            <Input value={manual.indication} onChange={e => setManual(p => ({ ...p, indication: e.target.value }))}
              placeholder="e.g. Periorbital cellulitis, Osteomyelitis..." className="text-sm h-8" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Dose</label>
              <div className="flex gap-1">
                <Input value={manual.dose} onChange={e => setManual(p => ({ ...p, dose: e.target.value }))}
                  placeholder="e.g. 10" className="text-sm h-8" />
                <select value={manual.unit} onChange={e => setManual(p => ({ ...p, unit: e.target.value }))}
                  className="text-xs border border-slate-200 rounded px-1 h-8 bg-white">
                  {["mg", "mcg", "mL", "units", "g"].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Frequency</label>
              <select value={manual.frequency} onChange={e => setManual(p => ({ ...p, frequency: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white">
                {["", "OD", "BD", "TDS", "QID", "Q6H", "Q8H", "Q12H", "PRN", "STAT", "Weekly", "Alt day"].map(f => <option key={f} value={f}>{f || "Select..."}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Route</label>
              <select value={manual.route} onChange={e => setManual(p => ({ ...p, route: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white">
                {["PO", "IV", "IM", "SC", "SL", "Inhaled", "Topical", "PR", "Nebulised"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Duration</label>
              <Input value={manual.duration} onChange={e => setManual(p => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 5 days" className="text-sm h-8" />
            </div>
          </div>

          <Alert className="bg-orange-50 border-orange-300 py-1.5">
            <AlertDescription className="text-orange-800 text-xs">
              ⚠ Manually entered — not system-calculated. Verify dose independently before prescribing.
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => {
              if (!manual.dose || !manual.frequency) { toast.error("Enter dose and frequency"); return; }
              onManualEntry(manual);
            }}
            className="w-full bg-slate-700 hover:bg-slate-800 text-white text-sm gap-2"
          >
            <FileText className="w-4 h-4" /> Use Manual Entry
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function IndicationPickerEngine({ drug, weight, bsa, egfr, onRuleSelected, onManualSelected }) {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!drug?.id && !drug?.generic_name) { setLoading(false); return; }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let found = [];
        // Primary: match by drug_id
        if (drug.id) {
          found = await base44.entities.DoseRule.filter({ drug_id: drug.id });
        }
        // Fallback 1: match by drug_name (denormalised field, exact)
        if (found.length === 0 && drug.generic_name) {
          found = await base44.entities.DoseRule.filter({ drug_name: drug.generic_name });
        }
        // Fallback 2: load all rules and do a client-side case-insensitive match
        if (found.length === 0 && drug.generic_name) {
          const all = await base44.entities.DoseRule.list("indication", 500);
          const nameNorm = drug.generic_name.toLowerCase().replace(/\s+/g,"");
          found = all.filter(r => {
            const rn = (r.drug_name || "").toLowerCase().replace(/\s+/g,"");
            const ri = (r.drug_id || "");
            return rn === nameNorm || rn.includes(nameNorm) || nameNorm.includes(rn) || ri === drug.id;
          });
        }
        if (!cancelled) setRules(found);
      } catch (e) {
        if (!cancelled) setError("Could not load dosing rules.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [drug?.id, drug?.generic_name]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading dosing rules...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-300 py-2">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800 text-xs">{error}</AlertDescription>
      </Alert>
    );
  }

  if (rules.length > 0) {
    return (
      <DoseRuleIndicationPicker
        rules={rules}
        drug={drug}
        weight={weight}
        bsa={bsa}
        egfr={egfr}
        onSelectRule={(rule, calc) => onRuleSelected?.(rule, calc)}
      />
    );
  }

  return (
    <MonographOnlyState
      drug={drug}
      weight={weight}
      bsa={bsa}
      onManualEntry={(manual) => onManualSelected?.(manual)}
    />
  );
}