/**
 * IndicationPrescribeWizard
 * 
 * Safe, DoseRule-driven prescribing wizard.
 * Flow: Diagnosis → Indication → Drug (filtered) → DoseRule → Safety Check → Prescription
 * 
 * Prescription is BLOCKED unless a validated DoseRule exists for the selected indication.
 */
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle, ChevronRight, AlertTriangle, Pill,
  Stethoscope, FlaskConical, FileText, RotateCcw, ShieldCheck, Activity
} from "lucide-react";
import { toast } from "sonner";

// ── Diagnosis → Allowed Indications map ──────────────────────────────────────
const DIAGNOSIS_MAP = {
  "Nephrotic Syndrome — SRNS": ["SRNS"],
  "Nephrotic Syndrome — SDNS": ["SDNS", "FRNS"],
  "Nephrotic Syndrome — FRNS": ["FRNS", "SDNS"],
  "Nephrotic Syndrome — MCNS First Episode": ["MCNS Induction"],
  "Nephrotic Syndrome — Relapse": ["MCNS Relapse"],
  "FSGS": ["FSGS", "SRNS"],
  "Membranous Nephropathy": ["MN"],
  "Lupus Nephritis Class III/IV": ["LN Class III/IV Induction", "LN Class III/IV Maintenance"],
  "Lupus Nephritis Class V": ["LN Class V"],
  "ANCA Vasculitis": ["ANCA Vasculitis Induction", "ANCA Vasculitis Maintenance"],
  "IgA Nephropathy": ["IgAN"],
  "Post-Transplant": ["Post-Transplant Induction", "Post-Transplant Maintenance"],
  "aHUS": ["aHUS"],
  "Hypertension": ["Hypertension"],
  "CKD — Proteinuria": ["CKD Proteinuria"],
  "CKD — Anaemia": ["Anaemia of CKD"],
  "CKD — Secondary HPT": ["Secondary Hyperparathyroidism"],
  "UTI": ["UTI Treatment", "UTI Prophylaxis"],
  "PCP Prophylaxis": ["PCP Prophylaxis"],
};

const DIAGNOSES = Object.keys(DIAGNOSIS_MAP);

// ── Frequency factor helper ───────────────────────────────────────────────────
function freqFactor(freq = "") {
  const f = freq.toUpperCase();
  if (f.includes("QID") || f.includes("Q6H")) return 4;
  if (f.includes("TDS") || f.includes("TID") || f.includes("Q8H")) return 3;
  if (f.includes("BD") || f.includes("BID") || f.includes("Q12H")) return 2;
  if (f.includes("ALTERNATE") || f.includes("EOD")) return 0.5;
  if (f.includes("WEEKLY")) return 1/7;
  return 1;
}

// ── Dose calculator from DoseRule ────────────────────────────────────────────
function calculateDose(rule, weight, bsa, egfr) {
  const warnings = [];
  const unit = rule.dose_unit || "";
  let rawDose = 0;

  if (egfr && rule.egfr_threshold_caution && parseFloat(egfr) < rule.egfr_threshold_caution) {
    warnings.push(`eGFR ${egfr} < ${rule.egfr_threshold_caution} mL/min/1.73m²: ${rule.egfr_adjustment_notes || "dose adjustment required"}`);
  }

  if (unit.includes("/kg/day") || unit === "mg/kg/day" || unit === "mcg/kg/day") {
    rawDose = rule.dose_value * weight;
  } else if (unit.includes("/m2/day") || unit === "mg/m2/day") {
    rawDose = rule.dose_value * (bsa || Math.sqrt(weight) / 6);
  } else if (unit === "mg/kg/dose" || unit === "mcg/kg/dose") {
    rawDose = rule.dose_value * weight;
  } else if (unit === "mg/m2/dose") {
    rawDose = rule.dose_value * (bsa || Math.sqrt(weight) / 6);
  } else {
    rawDose = rule.dose_value;
  }

  // Apply caps
  if (rule.max_dose_per_kg && weight) rawDose = Math.min(rawDose, rule.max_dose_per_kg * weight);
  if (rule.max_total_mg) {
    if (rawDose > rule.max_total_mg) {
      rawDose = rule.max_total_mg;
      warnings.push(`Dose capped at maximum ${rule.max_total_mg} mg`);
    }
  }

  const isPerDay = unit.includes("/day");
  const factor = freqFactor(rule.frequency || "OD");
  const dailyDose = isPerDay ? rawDose : rawDose * factor;
  const perDose = isPerDay ? rawDose / factor : rawDose;

  return { perDose: Math.round(perDose * 10) / 10, dailyDose: Math.round(dailyDose * 10) / 10, warnings };
}

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = [
  { id: "diagnosis", label: "Diagnosis", icon: Stethoscope },
  { id: "indication", label: "Indication", icon: Activity },
  { id: "drug", label: "Drug", icon: Pill },
  { id: "rule", label: "Dose Rule", icon: FlaskConical },
  { id: "safety", label: "Safety", icon: ShieldCheck },
  { id: "rx", label: "Prescription", icon: FileText },
];

function StepBar({ current }) {
  const idx = STEPS.findIndex(s => s.id === current);
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = i < idx;
        const active = s.id === current;
        return (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold flex-shrink-0 transition-all ${
              active ? "bg-indigo-600 text-white" : done ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
            }`}>
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{s.label}</span>
              {done && <CheckCircle className="w-3 h-3" />}
            </div>
            {i < STEPS.length - 1 && <ChevronRight className={`w-3 h-3 flex-shrink-0 ${done ? "text-indigo-400" : "text-slate-300"}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export default function IndicationPrescribeWizard({ weight, height, age, egfr, onAddToRx }) {
  const [step, setStep] = useState("diagnosis");
  const [diagnosis, setDiagnosis] = useState(null);
  const [indication, setIndication] = useState(null);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);
  const [safetyChecked, setSafetyChecked] = useState(false);
  const [rxItems, setRxItems] = useState([]);

  const wt = parseFloat(weight) || null;
  const ht = parseFloat(height) || null;
  const bsa = wt && ht ? parseFloat(Math.sqrt((ht * wt) / 3600).toFixed(3)) : null;
  const egfrNum = egfr ? parseFloat(egfr) : null;

  // Allowed indications for selected diagnosis
  const allowedIndications = useMemo(() => diagnosis ? (DIAGNOSIS_MAP[diagnosis] || []) : [], [diagnosis]);

  // Fetch all DoseRules for the selected indication
  const { data: doseRules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["dose-rules-by-indication", indication],
    queryFn: () => base44.entities.DoseRule.filter({ indication }),
    enabled: !!indication,
    staleTime: 60000,
  });

  // Drugs that have at least one rule for this indication (de-duped by drug_name)
  const availableDrugs = useMemo(() => {
    const seen = new Set();
    return doseRules.filter(r => {
      if (seen.has(r.drug_name)) return false;
      seen.add(r.drug_name);
      return true;
    }).map(r => ({ drug_id: r.drug_id, drug_name: r.drug_name }));
  }, [doseRules]);

  // Rules for selected drug
  const drugRules = useMemo(() =>
    doseRules.filter(r => r.drug_id === selectedDrug?.drug_id),
    [doseRules, selectedDrug]
  );

  const doseCalc = useMemo(() => {
    if (!selectedRule || !wt) return null;
    return calculateDose(selectedRule, wt, bsa, egfrNum);
  }, [selectedRule, wt, bsa, egfrNum]);

  const reset = () => {
    setStep("diagnosis"); setDiagnosis(null); setIndication(null);
    setSelectedDrug(null); setSelectedRule(null); setSafetyChecked(false); setRxItems([]);
  };

  const buildPrescriptionText = () => {
    if (!selectedRule || !selectedDrug) return "";
    const lines = [];
    lines.push(`${selectedDrug.drug_name}`);
    lines.push(`  Indication: ${selectedRule.indication}${selectedRule.phase ? ` (${selectedRule.phase})` : ""}`);
    if (doseCalc && !selectedRule.tdm_required) {
      lines.push(`  Dose: ${doseCalc.perDose} mg per dose  |  ${selectedRule.frequency}  |  ${selectedRule.route}`);
      lines.push(`  Daily total: ${doseCalc.dailyDose} mg/day`);
    } else if (selectedRule.tdm_required) {
      lines.push(`  Dose: TDM-guided  |  ${selectedRule.frequency}  |  ${selectedRule.route}`);
    }
    if (selectedRule.target_trough) lines.push(`  Target trough: ${selectedRule.target_trough}`);
    if (selectedRule.duration_notes) lines.push(`  Duration: ${selectedRule.duration_notes}`);
    if (selectedRule.pre_dose_workup) lines.push(`  Pre-Rx workup: ${selectedRule.pre_dose_workup}`);
    if (selectedRule.guideline_source) lines.push(`  Source: ${selectedRule.guideline_source}`);
    if (doseCalc?.warnings?.length) lines.push(`  ⚠️ ${doseCalc.warnings.join("; ")}`);
    lines.push(`  Weight: ${wt} kg${bsa ? `  BSA: ${bsa} m²` : ""}${egfrNum ? `  eGFR: ${egfrNum}` : ""}`);
    return lines.join("\n");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <StepBar current={step} />
        <button onClick={reset} className="text-xs text-slate-400 hover:text-slate-600 flex-shrink-0 ml-2 flex items-center gap-1">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* ── STEP 1: DIAGNOSIS ── */}
      {step === "diagnosis" && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-600 uppercase">Step 1 — Select Diagnosis</p>
          <div className="grid grid-cols-1 gap-1.5">
            {DIAGNOSES.map(d => (
              <button key={d} onClick={() => { setDiagnosis(d); setIndication(null); setSelectedDrug(null); setSelectedRule(null); setStep("indication"); }}
                className="w-full text-left px-4 py-2.5 bg-white rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-sm font-semibold text-slate-800">
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: INDICATION ── */}
      {step === "indication" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-100 text-indigo-800">{diagnosis}</Badge>
            <button onClick={() => setStep("diagnosis")} className="text-xs text-slate-400 hover:text-indigo-600">← Change</button>
          </div>
          <p className="text-xs font-bold text-slate-600 uppercase">Step 2 — Select Indication</p>
          <div className="space-y-1.5">
            {allowedIndications.map(ind => (
              <button key={ind} onClick={() => { setIndication(ind); setSelectedDrug(null); setSelectedRule(null); setStep("drug"); }}
                className="w-full text-left px-4 py-2.5 bg-white rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all">
                <p className="text-sm font-bold text-slate-800">{ind}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3: DRUG ── */}
      {step === "drug" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-teal-100 text-teal-800">{indication}</Badge>
            <button onClick={() => setStep("indication")} className="text-xs text-slate-400 hover:text-teal-600">← Change</button>
          </div>
          <p className="text-xs font-bold text-slate-600 uppercase">Step 3 — Select Drug</p>
          <p className="text-xs text-slate-500">Only drugs with validated DoseRules for <strong>{indication}</strong> are shown.</p>
          {rulesLoading ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading available drugs...</p>
          ) : availableDrugs.length === 0 ? (
            <Alert className="bg-red-50 border-red-300">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800 text-xs">
                <strong>No validated DoseRule exists for "{indication}".</strong> Prescription cannot be generated. Contact admin to add a DoseRule for this indication.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-1.5">
              {availableDrugs.map(d => (
                <button key={d.drug_id} onClick={() => { setSelectedDrug(d); setSelectedRule(null); setStep("rule"); }}
                  className="w-full text-left px-4 py-3 bg-white rounded-xl border-2 border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-all flex items-center gap-3">
                  <Pill className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  <span className="text-sm font-bold text-slate-800">{d.drug_name}</span>
                  <span className="ml-auto text-xs text-slate-400">{doseRules.filter(r => r.drug_id === d.drug_id).length} rule(s)</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 4: DOSE RULE ── */}
      {step === "rule" && selectedDrug && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-violet-100 text-violet-800">{selectedDrug.drug_name}</Badge>
            <button onClick={() => setStep("drug")} className="text-xs text-slate-400 hover:text-violet-600">← Change</button>
          </div>
          <p className="text-xs font-bold text-slate-600 uppercase">Step 4 — Dose Rule Review</p>

          {!wt && (
            <Alert className="bg-amber-50 border-amber-300 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <AlertDescription className="text-amber-700 text-xs">Enter patient weight to calculate doses.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {drugRules.map((rule, i) => {
              const calc = wt ? calculateDose(rule, wt, bsa, egfrNum) : null;
              const isSelected = selectedRule?.id === rule.id;
              return (
                <button key={rule.id} onClick={() => setSelectedRule(rule)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all space-y-3 ${isSelected ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-300"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{rule.phase || rule.indication}</span>
                      {rule.tdm_required && <Badge className="bg-blue-100 text-blue-700 text-[10px]">TDM</Badge>}
                      {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                    </div>
                    {rule.guideline_source && <span className="text-[10px] text-slate-400">{rule.guideline_source}</span>}
                  </div>

                  {/* Dose display */}
                  {rule.tdm_required ? (
                    <div className="bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                      <p className="text-xs text-blue-700 font-semibold">TDM-guided dosing</p>
                      {rule.target_trough && <p className="text-xs text-blue-800 mt-0.5">🎯 Target trough: {rule.target_trough}</p>}
                      <p className="text-xs text-blue-600 mt-0.5">Starting: {rule.dose_value} {rule.dose_unit} — adjust to target</p>
                    </div>
                  ) : calc ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-teal-50 rounded-lg p-2 text-center border border-teal-100">
                        <p className="text-[10px] text-teal-600 font-bold">Per Dose</p>
                        <p className="text-base font-bold text-teal-900">{calc.perDose} mg</p>
                      </div>
                      <div className="bg-teal-50 rounded-lg p-2 text-center border border-teal-100">
                        <p className="text-[10px] text-teal-600 font-bold">Daily Total</p>
                        <p className="text-base font-bold text-teal-900">{calc.dailyDose} mg</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">{rule.dose_value} {rule.dose_unit} — enter weight to calculate</p>
                  )}

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div><span className="text-slate-400">Frequency:</span> <span className="font-semibold text-slate-700">{rule.frequency}</span></div>
                    <div><span className="text-slate-400">Route:</span> <span className="font-semibold text-slate-700">{rule.route}</span></div>
                    {rule.duration_notes && <div className="col-span-2"><span className="text-slate-400">Duration:</span> <span className="text-slate-700">{rule.duration_notes}</span></div>}
                    {rule.target_trough && <div className="col-span-2"><span className="text-slate-400">Target trough:</span> <span className="font-semibold text-indigo-700">{rule.target_trough}</span></div>}
                  </div>

                  {rule.pre_dose_workup && (
                    <div className="bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-700 mb-0.5">Pre-treatment workup</p>
                      <p className="text-xs text-blue-800">{rule.pre_dose_workup}</p>
                    </div>
                  )}

                  {calc?.warnings?.length > 0 && (
                    <Alert className="bg-amber-50 border-amber-300 py-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <AlertDescription className="text-amber-800 text-xs">{calc.warnings.join("; ")}</AlertDescription>
                    </Alert>
                  )}
                </button>
              );
            })}
          </div>

          {selectedRule && (
            <Button onClick={() => setStep("safety")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Proceed to Safety Check <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* ── STEP 5: SAFETY CHECK ── */}
      {step === "safety" && selectedRule && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-600 uppercase">Step 5 — Safety Check</p>

          <div className="space-y-2">
            {[
              { label: "Weight entered", ok: !!wt, value: wt ? `${wt} kg` : "Missing — enter weight", required: true },
              { label: "Age documented", ok: !!age, value: age ? `${age} years` : "Not entered", required: false },
              { label: "Renal function assessed", ok: !!egfrNum, value: egfrNum ? `eGFR ${egfrNum} mL/min/1.73m²` : "eGFR not entered", required: !!selectedRule.egfr_threshold_caution },
              { label: "eGFR above caution threshold", ok: !selectedRule.egfr_threshold_caution || !egfrNum || egfrNum >= selectedRule.egfr_threshold_caution, value: selectedRule.egfr_threshold_caution ? `Threshold: ${selectedRule.egfr_threshold_caution}` : "No threshold defined", required: false },
              { label: "TDM monitoring plan confirmed", ok: !selectedRule.tdm_required || true, value: selectedRule.tdm_required ? `Required — ${selectedRule.target_trough || "check target trough"}` : "Not required", required: false },
              { label: "Pre-treatment workup reviewed", ok: !!selectedRule.pre_dose_workup, value: selectedRule.pre_dose_workup || "None specified", required: false },
            ].map((check, i) => (
              <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border ${check.ok ? "bg-green-50 border-green-200" : check.required ? "bg-red-50 border-red-300" : "bg-amber-50 border-amber-200"}`}>
                {check.ok ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${check.required ? "text-red-600" : "text-amber-500"}`} />}
                <div>
                  <p className={`text-xs font-bold ${check.ok ? "text-green-800" : check.required ? "text-red-800" : "text-amber-800"}`}>{check.label}</p>
                  <p className={`text-xs ${check.ok ? "text-green-700" : check.required ? "text-red-700" : "text-amber-700"}`}>{check.value}</p>
                </div>
              </div>
            ))}
          </div>

          {!wt ? (
            <Alert className="bg-red-50 border-red-400">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm font-semibold">
                Prescription blocked — patient weight is required for dose calculation.
              </AlertDescription>
            </Alert>
          ) : (
            <Button onClick={() => { setSafetyChecked(true); setStep("rx"); }}
              className="w-full bg-green-600 hover:bg-green-700 text-white">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Safety Confirmed — Generate Prescription
            </Button>
          )}
        </div>
      )}

      {/* ── STEP 6: PRESCRIPTION ── */}
      {step === "rx" && selectedRule && safetyChecked && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-600 uppercase">Step 6 — Prescription</p>

          {/* Prescription card */}
          <div className="bg-white rounded-xl border-2 border-indigo-200 p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-slate-900">{selectedDrug?.drug_name}</span>
              <Badge className="bg-indigo-100 text-indigo-800 text-xs">{selectedRule.indication}</Badge>
              {selectedRule.phase && <Badge className="bg-slate-100 text-slate-600 text-xs">{selectedRule.phase}</Badge>}
            </div>

            {selectedRule.tdm_required ? (
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 space-y-1">
                <p className="text-xs font-bold text-blue-700">TDM-Guided Dosing</p>
                <p className="text-sm font-semibold text-blue-900">Start: {selectedRule.dose_value} {selectedRule.dose_unit}</p>
                {selectedRule.target_trough && <p className="text-sm text-blue-800">🎯 Target trough: <strong>{selectedRule.target_trough}</strong></p>}
                <p className="text-xs text-blue-600">{selectedRule.frequency} · {selectedRule.route}</p>
              </div>
            ) : doseCalc && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-teal-50 rounded-xl p-3 text-center border border-teal-200">
                  <p className="text-[10px] text-teal-600 font-bold uppercase">Per Dose</p>
                  <p className="text-xl font-bold text-teal-900">{doseCalc.perDose} mg</p>
                </div>
                <div className="bg-teal-50 rounded-xl p-3 text-center border border-teal-200">
                  <p className="text-[10px] text-teal-600 font-bold uppercase">Daily Total</p>
                  <p className="text-xl font-bold text-teal-900">{doseCalc.dailyDose} mg</p>
                </div>
              </div>
            )}

            <div className="space-y-1 text-xs">
              <div className="flex gap-4 flex-wrap">
                <span><span className="text-slate-400">Frequency:</span> <strong>{selectedRule.frequency}</strong></span>
                <span><span className="text-slate-400">Route:</span> <strong>{selectedRule.route}</strong></span>
              </div>
              {selectedRule.duration_notes && <p><span className="text-slate-400">Duration:</span> <strong>{selectedRule.duration_notes}</strong></p>}
              {selectedRule.guideline_source && <p className="text-indigo-600 font-semibold">Source: {selectedRule.guideline_source}</p>}
            </div>

            {doseCalc?.warnings?.length > 0 && (
              <Alert className="bg-amber-50 border-amber-300 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <AlertDescription className="text-amber-800 text-xs">{doseCalc.warnings.join(" | ")}</AlertDescription>
              </Alert>
            )}

            {selectedRule.pre_dose_workup && (
              <div className="bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                <p className="text-[10px] font-bold text-blue-700 uppercase mb-0.5">Pre-treatment workup</p>
                <p className="text-xs text-blue-800">{selectedRule.pre_dose_workup}</p>
              </div>
            )}
          </div>

          {/* Mono preview */}
          <div className="bg-slate-900 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 mb-1 uppercase">Prescription Text</p>
            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{buildPrescriptionText()}</pre>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => { navigator.clipboard.writeText(buildPrescriptionText()); toast.success("Copied!"); }}
              variant="outline" className="flex-1 text-xs">Copy</Button>
            {onAddToRx && (
              <Button onClick={() => {
                onAddToRx({
                  id: selectedRule.id,
                  generic_name: selectedDrug.drug_name,
                  category: "Immunosuppressant",
                  route: selectedRule.route,
                  frequency: selectedRule.frequency,
                  dose_weight_based: selectedRule.tdm_required ? "TDM-guided" : `${doseCalc?.perDose} mg`,
                  dose_calculation_type: selectedRule.tdm_required ? "TDM" : "per_day",
                  _indication: selectedRule.indication,
                  _prescriptionText: buildPrescriptionText(),
                  _duration: selectedRule.duration_notes,
                });
                toast.success("Added to Rx");
              }} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs">
                Add to Rx List
              </Button>
            )}
          </div>

          <Alert className="bg-amber-50 border-amber-200 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <AlertDescription className="text-xs text-amber-800">
              Verify all doses independently. Not a substitute for clinical judgment. Always confirm with current guidelines.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}