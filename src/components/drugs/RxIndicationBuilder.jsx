import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronDown, ChevronRight, FlaskConical, CheckCircle, AlertTriangle,
  Copy, ShieldAlert, X, Loader2, ChevronUp, Activity
} from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

// ── Static indication presets ─────────────────────────────────────────────────
const INDICATION_PRESETS = {
  amoxicillin: [
    { label: "Acute Otitis Media (high-dose)", dose_mgkg_day: 90, freq: "BD", duration: "5 days", route: "PO", max_mg_day: 3000 },
    { label: "Streptococcal pharyngitis", dose_mgkg_day: 50, freq: "BD", duration: "10 days", route: "PO", max_mg_day: 1000 },
    { label: "UTI prophylaxis", dose_mgkg_day: 10, freq: "OD", duration: "3–6 months", route: "PO", max_mg_day: 250 },
    { label: "Community-acquired pneumonia", dose_mgkg_day: 80, freq: "TDS", duration: "5–7 days", route: "PO", max_mg_day: 3000 },
  ],
  prednisolone: [
    { label: "NS — First episode induction", dose_mgkg_day: 2, freq: "OD", duration: "4 weeks", route: "PO", max_mg_day: 60, note: "IPNA 2023: 60 mg/m²/day", monitoring: "BP, weight, blood glucose weekly; urine protein daily" },
    { label: "NS — Relapse", dose_mgkg_day: 2, freq: "OD", duration: "Until remission + 3 days", route: "PO", max_mg_day: 60, monitoring: "Urine PCR daily until negative" },
    { label: "NS — Alternate-day maintenance", dose_mgkg_day: 1.5, freq: "Alternate days", duration: "4 weeks", route: "PO", max_mg_day: 40, note: "IPNA: 40 mg/m² alt-day" },
    { label: "Croup", dose_mgkg_day: 1, freq: "Single dose", duration: "1 dose", route: "PO/IM", max_mg_day: 10 },
    { label: "Asthma exacerbation", dose_mgkg_day: 1, freq: "OD", duration: "3–5 days", route: "PO", max_mg_day: 40 },
    { label: "ITP (pulse)", dose_mgkg_day: 4, freq: "OD", duration: "4 days", route: "PO", max_mg_day: 160 },
    { label: "Acute rheumatic fever (carditis)", dose_mgkg_day: 2, freq: "OD", duration: "4 weeks then taper", route: "PO", max_mg_day: 60 },
  ],
  furosemide: [
    { label: "Oedema (NS/CKD)", dose_mgkg_day: 1, freq: "BD", duration: "As needed", route: "PO", max_mg_day: 120, monitoring: "Electrolytes, creatinine weekly" },
    { label: "Acute pulmonary oedema", dose_mgkg_day: 1, freq: "STAT/Q6H", duration: "Until resolved", route: "IV", max_mg_day: 80 },
    { label: "Hypertension in CKD", dose_mgkg_day: 2, freq: "BD", duration: "Ongoing", route: "PO", max_mg_day: 160 },
  ],
  tacrolimus: [
    { label: "SRNS induction", dose_mgkg_day: 0.1, freq: "BD", duration: "12 months", route: "PO", note: "Target trough 5–8 ng/mL", isTDM: true, monitoring: "TDM at 1w, 2w, 1m then monthly; creatinine, BP, glucose monthly" },
    { label: "Transplant — early", dose_mgkg_day: 0.15, freq: "BD", duration: "3 months", route: "PO", note: "Target trough 8–12 ng/mL", isTDM: true, monitoring: "TDM weekly for 3 months" },
    { label: "Transplant — maintenance", dose_mgkg_day: 0.1, freq: "BD", duration: "Ongoing", route: "PO", note: "Target trough 5–8 ng/mL", isTDM: true },
  ],
  amlodipine: [
    { label: "Hypertension (CKD/general)", dose_mgkg_day: 0.1, freq: "OD", duration: "Ongoing", route: "PO", max_mg_day: 10, monitoring: "BP every visit" },
    { label: "Hypertensive urgency", dose_mgkg_day: 0.2, freq: "OD", duration: "Ongoing", route: "PO", max_mg_day: 10 },
  ],
  enalapril: [
    { label: "Proteinuria / CKD (RAS blockade)", dose_mgkg_day: 0.1, freq: "OD", duration: "Ongoing", route: "PO", max_mg_day: 40, monitoring: "K+, creatinine at 2w then monthly" },
    { label: "Hypertension", dose_mgkg_day: 0.2, freq: "OD", duration: "Ongoing", route: "PO", max_mg_day: 40 },
  ],
  cotrimoxazole: [
    { label: "UTI treatment (TMP component)", dose_mgkg_day: 8, freq: "BD", duration: "3–7 days", route: "PO", max_mg_day: 320 },
    { label: "UTI prophylaxis (TMP component)", dose_mgkg_day: 2, freq: "OD (evening)", duration: "3–12 months", route: "PO", max_mg_day: 80 },
    { label: "PCP prophylaxis (transplant/IS)", dose_mgkg_day: 5, freq: "3×/week", duration: "Ongoing", route: "PO", max_mg_day: 160 },
  ],
  cyclophosphamide: [
    { label: "Frequently relapsing NS", dose_mgkg_day: 2, freq: "OD", duration: "8–12 weeks", route: "PO", max_mg_day: 60, note: "Max cumulative dose 168 mg/kg", monitoring: "CBC weekly; cumulative dose tracker" },
    { label: "Lupus nephritis induction (IV pulse)", dose_mgkg_day: null, freq: "Monthly IV pulse", duration: "6 pulses", route: "IV", note: "500–750 mg/m² IV monthly (Euro-Lupus)", monitoring: "CBC at nadir (day 10–14 post-pulse)" },
  ],
  mycophenolate: [
    { label: "SRNS maintenance", dose_mgkg_day: null, freq: "BD", duration: "12–24 months", route: "PO", note: "600 mg/m²/dose BD (max 1g BD)", monitoring: "CBC, LFT monthly" },
    { label: "Lupus nephritis maintenance", dose_mgkg_day: null, freq: "BD", duration: "Ongoing", route: "PO", note: "600 mg/m²/dose BD — teratogenic, counsel patients", monitoring: "CBC, LFT monthly" },
  ],
};

// ── DB DoseRule → preset ──────────────────────────────────────────────────────
function doseRuleToPreset(rule) {
  const unit = (rule.dose_unit || "").toLowerCase();
  // Determine basis
  const isPerKgDay  = unit.includes("kg/day") || (unit.includes("kg") && !unit.includes("dose") && !unit.includes("min") && !unit.includes("hour"));
  const isPerKgDose = unit.includes("kg/dose");
  const isPerKgMin  = unit.includes("kg/min") || unit.includes("kg/hour");
  const isBSA       = unit.includes("m2") || unit.includes("m²");
  const isFixed     = !isPerKgDay && !isPerKgDose && !isPerKgMin && !isBSA;

  // Frequency → doses/day multiplier
  const freqDivisor = (freq) => {
    if (!freq) return 1;
    const f = freq.toUpperCase();
    if (f.includes("QID") || f.includes("Q6H") || f.includes("4X") || f.includes("FOUR TIME")) return 4;
    if (f.includes("TDS") || f.includes("TID") || f.includes("Q8H") || f.includes("3X") || f.includes("THREE TIME") || f.includes("3 TIME")) return 3;
    if (f.includes("BD") || f.includes("BID") || f.includes("Q12H") || f.includes("2X") || f.includes("TWICE") || f.includes("TWO TIME")) return 2;
    if (f.includes("ALT") || f.includes("ALTERNATE") || f.includes("EOD")) return 0.5;
    if (f.includes("WEEKLY") || f.includes("1/WEEK")) return 1 / 7;
    if (f.includes("3") && f.includes("WEEK")) return 3 / 7;
    return 1; // OD
  };

  const dosePerDay = isPerKgDose
    ? rule.dose_value * freqDivisor(rule.frequency)  // convert per-dose to per-day
    : rule.dose_value;                                 // already per-day (or BSA/fixed)

  return {
    label: rule.indication + (rule.phase ? ` (${rule.phase})` : ""),
    dose_mgkg_day:    (isPerKgDay || isPerKgDose) ? dosePerDay : null,
    dose_mgkg_dose:   isPerKgDose ? rule.dose_value : null, // raw per-dose value for display
    dose_bsa:         isBSA ? rule.dose_value : null,
    dose_infusion:    isPerKgMin ? rule.dose_value : null,
    dose_unit_raw:    rule.dose_unit,
    fixedDose:        isFixed ? `${rule.dose_value} ${rule.dose_unit}` : null,
    freq:             rule.frequency || "OD",
    duration:         rule.duration_days > 0 ? `${rule.duration_days} days` : (rule.duration_notes || "As indicated"),
    route:            rule.route || "PO",
    max_mg_day:       rule.max_total_mg || null,
    max_mg_dose:      rule.max_dose_per_kg ? rule.max_dose_per_kg * 999 : null, // placeholder
    note:             [rule.guideline_source, rule.duration_notes].filter(Boolean).join(" · ") || null,
    isTDM:            !!rule.tdm_required,
    monitoring:       [rule.pre_dose_workup, rule.target_trough ? `Target trough: ${rule.target_trough}` : null].filter(Boolean).join("; ") || null,
    specialty:        rule.specialty || null,
    fromDB:           true,
    _rule:            rule,
  };
}

// ── Dose calculation ──────────────────────────────────────────────────────────
function calculateDose(ind, wt, bsa, activeFreq) {
  // TDM drugs: still calculate weight-based starting dose, but flag TDM requirement
  if (ind.fixedDose) return { type: "fixed", display: ind.fixedDose };
  if (ind.dose_infusion) return { type: "infusion", display: `${ind.dose_infusion} ${ind.dose_unit_raw}` };

  const freq = activeFreq || ind.freq;
  const fu = (freq || "").toUpperCase();
  let dosesPerDay;
  if (fu.includes("QID") || fu.includes("Q6H") || fu.includes("4X") || fu.includes("FOUR TIME")) dosesPerDay = 4;
  else if (fu.includes("TDS") || fu.includes("TID") || fu.includes("Q8H") || fu.includes("3X") || fu.includes("THREE TIME") || fu.includes("3 TIME")) dosesPerDay = 3;
  else if (fu.includes("BD") || fu.includes("BID") || fu.includes("Q12H") || fu.includes("2X") || fu.includes("TWICE") || fu.includes("TWO TIME")) dosesPerDay = 2;
  else if (fu.includes("ALT") || fu.includes("EOD") || fu.includes("ALTERNATE") || fu.includes("EVERY OTHER")) dosesPerDay = 0.5;
  else if (fu.includes("WEEKLY") || fu.includes("ONCE A WEEK") || fu.includes("1/WEEK")) dosesPerDay = 1 / 7;
  else if (fu.includes("3") && fu.includes("WEEK")) dosesPerDay = 3 / 7;
  else if (fu.includes("SINGLE") || fu.includes("STAT") || fu.includes("ONCE")) dosesPerDay = 1;
  else dosesPerDay = 1; // OD or unknown

  if (ind.dose_mgkg_day && wt) {
    const rawDay = ind.dose_mgkg_day * wt;
    const cappedDay = ind.max_mg_day ? Math.min(rawDay, ind.max_mg_day) : rawDay;
    const perAdmin = dosesPerDay >= 1 ? cappedDay / dosesPerDay : cappedDay;
    const roundedPerAdmin = Math.round(perAdmin / 2.5) * 2.5; // round to nearest 2.5mg
    const roundedDay = Math.round(cappedDay / 5) * 5;

    // Calc trail text
    const isPerDose = ind.dose_mgkg_dose != null;
    const trailBase = isPerDose
      ? `${ind.dose_mgkg_dose} mg/kg/dose × ${wt} kg = ${(ind.dose_mgkg_dose * wt).toFixed(1)} mg/dose`
      : `${ind.dose_mgkg_day} mg/kg/day × ${wt} kg = ${rawDay.toFixed(1)} mg/day ÷ ${dosesPerDay} doses`;

    return {
      type: "weight",
      perAdminMg: roundedPerAdmin,
      dailyMg: roundedDay,
      capped: cappedDay < rawDay,
      cappedAt: ind.max_mg_day,
      trail: trailBase,
    };
  }

  if (ind.dose_bsa && bsa) {
    const rawDay = ind.dose_bsa * bsa;
    const cappedDay = ind.max_mg_day ? Math.min(rawDay, ind.max_mg_day) : rawDay;
    const perAdmin = dosesPerDay >= 1 ? cappedDay / dosesPerDay : cappedDay;
    return {
      type: "bsa",
      perAdminMg: Math.round(perAdmin / 2.5) * 2.5,
      dailyMg: Math.round(cappedDay / 5) * 5,
      capped: cappedDay < rawDay,
      cappedAt: ind.max_mg_day,
      trail: `${ind.dose_bsa} ${ind.dose_unit_raw || "mg/m²/day"} × BSA ${bsa} m² = ${rawDay.toFixed(1)} mg/day ÷ ${dosesPerDay} doses`,
    };
  }

  return { type: "manual" };
}

// ── Group indications by specialty / prefix ───────────────────────────────────
function groupIndications(indications) {
  // Detect common-dose groups: indications with same dose_mgkg_day, route, freq
  // and similar label patterns (e.g. multiple tumour types)
  const groups = {};
  const ungrouped = [];

  indications.forEach((ind) => {
    // Extract group key from label (words before " — " or " (")
    const grpKey = ind.specialty || "General";
    if (!groups[grpKey]) groups[grpKey] = [];
    groups[grpKey].push(ind);
  });

  // Merge indications with IDENTICAL dose into one grouped item
  const mergeIdenticalDoses = (list) => {
    const seen = {};
    const out = [];
    list.forEach((ind) => {
      const key = `${ind.dose_mgkg_day}|${ind.dose_bsa}|${ind.fixedDose}|${ind.freq}|${ind.route}`;
      if (ind.dose_mgkg_day != null || ind.dose_bsa != null || ind.fixedDose) {
        if (seen[key]) {
          seen[key]._aliases = seen[key]._aliases || [seen[key].label];
          seen[key]._aliases.push(ind.label);
        } else {
          seen[key] = { ...ind };
          out.push(seen[key]);
        }
      } else {
        out.push(ind);
      }
    });
    return out;
  };

  // Flatten: if only one specialty group, don't show group headers
  const allSpecialties = Object.keys(groups);
  if (allSpecialties.length === 1) {
    return { "": mergeIdenticalDoses(indications) };
  }
  const result = {};
  allSpecialties.forEach((sp) => {
    result[sp] = mergeIdenticalDoses(groups[sp]);
  });
  return result;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RxIndicationBuilder({ drug, weight, height, onClose, onAddToRxList }) {
  const drugKey = (drug?.generic_name || drug?.generic || "")
    .toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, "").trim();

  const staticIndications = INDICATION_PRESETS[drugKey]
    || INDICATION_PRESETS[Object.keys(INDICATION_PRESETS).find(k => drugKey.startsWith(k) || k.startsWith(drugKey)) || ""]
    || [];

  const [dbIndications, setDbIndications] = useState([]);
  const [dbLoading, setDbLoading] = useState(false);

  useEffect(() => {
    if (staticIndications.length > 0) return;
    if (!drug?.id && !drug?.generic_name) return;
    let cancelled = false;
    setDbLoading(true);
    (async () => {
      try {
        let found = drug?.id ? await base44.entities.DoseRule.filter({ drug_id: drug.id }) : [];
        if (found.length === 0 && drug.generic_name) {
          found = await base44.entities.DoseRule.filter({ drug_name: drug.generic_name });
        }
        if (found.length === 0 && drug.generic_name) {
          const all = await base44.entities.DoseRule.list("indication", 500);
          const nameNorm = drug.generic_name.toLowerCase().replace(/\s+/g, "");
          found = all.filter(r => {
            const rn = (r.drug_name || "").toLowerCase().replace(/\s+/g, "");
            return rn === nameNorm || rn.includes(nameNorm) || nameNorm.includes(rn);
          });
        }
        if (!cancelled) setDbIndications(found.map(doseRuleToPreset));
      } catch { /* ignore */ }
      if (!cancelled) setDbLoading(false);
    })();
    return () => { cancelled = true; };
  }, [drug?.id, drug?.generic_name]);

  const allIndications = staticIndications.length > 0 ? staticIndications : dbIndications;

  const [selectedInd, setSelectedInd] = useState(null);
  const [overrideDose, setOverrideDose] = useState("");
  const [overrideFreq, setOverrideFreq] = useState("");
  const [overrideDuration, setOverrideDuration] = useState("");
  const [overrideRoute, setOverrideRoute] = useState("");
  const [copied, setCopied] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const wt = parseFloat(weight) || null;
  const bsa = useMemo(() => {
    const h = parseFloat(height), w = wt;
    if (h && w) return parseFloat(Math.sqrt((h * w) / 3600).toFixed(3));
    return null;
  }, [height, wt]);

  const calc = useMemo(() => {
    if (!selectedInd) return null;
    return calculateDose(selectedInd, wt, bsa, overrideFreq || null);
  }, [selectedInd, wt, bsa, overrideFreq]);

  const grouped = useMemo(() => groupIndications(allIndications), [allIndications]);

  // Auto-select first indication
  useEffect(() => {
    if (allIndications.length > 0 && !selectedInd) {
      setSelectedInd(allIndications[0]);
    }
  }, [allIndications]);

  const prescriptionText = useMemo(() => {
    if (!selectedInd) return "";
    const drugName = drug?.generic_name || drug?.generic || "";
    const freq = overrideFreq || selectedInd.freq;
    const duration = overrideDuration || selectedInd.duration;
    const route = overrideRoute || selectedInd.route;
    let doseStr = overrideDose || "";
    if (!doseStr) {
      if (calc?.type === "weight" || calc?.type === "bsa") doseStr = `${calc.perAdminMg} mg`;
      else if (calc?.type === "TDM" && calc.perAdminMg) doseStr = `${calc.perAdminMg} mg (starting; adjust by TDM)`;
      else if (calc?.type === "TDM") doseStr = "(TDM-guided — enter dose)";
      else if (calc?.type === "fixed") doseStr = calc.display;
      else doseStr = selectedInd.note || "—see monograph";
    }
    return [
      drugName,
      `  Indication: ${selectedInd._aliases ? selectedInd._aliases.join(" / ") : selectedInd.label}`,
      wt ? `  Weight: ${wt} kg` : "",
      `  Dose: ${doseStr}  |  ${freq}  |  ${route}`,
      `  Duration: ${duration}`,
      calc?.trail ? `  Calc: ${calc.trail}` : "",
      selectedInd.monitoring ? `  Monitor: ${selectedInd.monitoring}` : "",
      selectedInd.note ? `  Note: ${selectedInd.note}` : "",
    ].filter(Boolean).join("\n");
  }, [selectedInd, calc, overrideDose, overrideFreq, overrideDuration, overrideRoute, drug, wt]);

  const handleExportPDF = useCallback(() => {
    const drugName = drug?.generic_name || drug?.generic || "";
    const freq = overrideFreq || selectedInd?.freq;
    const duration = overrideDuration || selectedInd?.duration;
    const route = overrideRoute || selectedInd?.route;
    let doseStr = overrideDose || "";
    if (!doseStr && (calc?.type === "weight" || calc?.type === "bsa")) doseStr = `${calc.perAdminMg} mg`;
    else if (calc?.type === "fixed") doseStr = calc.display;
    else if (calc?.type === "TDM") doseStr = `Starting: ${calc?.perAdminMg ? calc.perAdminMg + " mg" : "—"} (TDM-guided)`;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const lines = [
      "PRESCRIPTION — CliniCals Hub by Swarnim",
      "─────────────────────────────────────────────",
      `Date: ${dateStr}`,
      "",
      "PATIENT DETAILS",
      `Weight: ${wt ? wt + " kg" : "Not entered"}`,
      `BSA: ${bsa ? bsa + " m²" : "Not calculated"}`,
      `Height: ${parseFloat(height) ? parseFloat(height) + " cm" : "Not entered"}`,
      "",
      "PRESCRIPTION",
      `Drug: ${drugName}`,
      `Indication: ${selectedInd?._aliases ? selectedInd._aliases.join(" / ") : selectedInd?.label}`,
      `Dose: ${doseStr}`,
      `Frequency: ${freq}`,
      `Route: ${route}`,
      `Duration: ${duration}`,
      "",
      "DOSE CALCULATION",
      calc?.trail ? `${calc.trail}` : "Manual dose — verify independently",
      calc?.capped ? `⚠ Capped at max ${calc.cappedAt} mg/day` : "",
      selectedInd?.isTDM ? `🎯 TDM required — Target: ${selectedInd.note || "see monograph"}` : "",
      "",
      "MONITORING REQUIREMENTS",
      selectedInd?.monitoring || "As per drug monograph",
      selectedInd?.note ? `Note: ${selectedInd.note}` : "",
      "",
      "─────────────────────────────────────────────",
      "⚠ For decision support only. Verify all doses against institutional protocol.",
      "CliniCals Hub — Pediatric Clinical Intelligence",
    ].filter(l => l !== undefined && l !== null);

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rx_${drugName.replace(/\s+/g,"_")}_${dateStr.replace(/\s/g,"-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Prescription exported");
  }, [selectedInd, calc, overrideDose, overrideFreq, overrideDuration, overrideRoute, drug, wt, bsa, height]);

  const handleAddToRxList = () => {
    if (!selectedInd) return;
    const freq = overrideFreq || selectedInd.freq;
    const duration = overrideDuration || selectedInd.duration;
    const route = overrideRoute || selectedInd.route;
    let doseStr = overrideDose || "";
    if (!doseStr) {
      if (calc?.type === "weight" || calc?.type === "bsa") doseStr = `${calc.perAdminMg} mg`;
      else if (calc?.type === "TDM" && calc.perAdminMg) doseStr = `${calc.perAdminMg} mg (starting; adjust by TDM)`;
    }
    onAddToRxList?.({ drug, indication: selectedInd.label, dose: doseStr, freq, route, duration, prescriptionText, calcTrail: calc?.trail });
    toast.success(`${drug?.generic_name || drug?.generic} added to Rx`);
    onClose?.();
  };

  const noIndications = allIndications.length === 0 && !dbLoading;

  return (
    <div className="bg-white rounded-2xl border-2 border-teal-300 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">{drug?.generic_name || drug?.generic}</p>
          <p className="text-teal-100 text-xs">{drug?.therapeutic_class || drug?.category} · Select indication to calculate dose</p>
        </div>
        {onClose && <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>}
      </div>

      <div className="p-4 space-y-4">
        {!wt && (
          <Alert className="bg-amber-50 border-amber-200 py-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-xs">Enter patient weight to auto-calculate doses.</AlertDescription>
          </Alert>
        )}

        {/* ── Calculated dose for selected indication (top) ── */}
        {selectedInd && (
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wide">
                {selectedInd._aliases ? `${selectedInd._aliases.length} indications (same dose)` : selectedInd.label}
                {wt ? ` — ${wt} kg` : ""}
              </p>
              {selectedInd._aliases && (
                <Badge className="bg-teal-100 text-teal-700 text-[10px]">{selectedInd._aliases.length} merged</Badge>
              )}
            </div>

            {calc?.type === "weight" || calc?.type === "bsa" ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-xl border border-teal-200 p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Per Dose</p>
                    <p className="text-xl font-bold text-teal-800">{calc.perAdminMg} mg</p>
                  </div>
                  <div className="bg-white rounded-xl border border-teal-200 p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Daily Total</p>
                    <p className="text-xl font-bold text-teal-800">{calc.dailyMg} mg</p>
                  </div>
                </div>
                {/* Calculation trail */}
                <div className="bg-slate-800 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-slate-400 mb-0.5">Calculation</p>
                  <p className="text-xs text-green-400 font-mono">{calc.trail}</p>
                </div>
                {calc.capped && (
                  <Alert className="bg-amber-50 border-amber-300 py-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <AlertDescription className="text-amber-700 text-xs">Capped at max {calc.cappedAt} mg/day</AlertDescription>
                  </Alert>
                )}
              </>
            ) : calc?.type === "TDM" && (calc.perAdminMg || calc.dailyMg) ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-xl border border-blue-200 p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Starting Per Dose</p>
                    <p className="text-xl font-bold text-blue-800">{calc.perAdminMg} mg</p>
                  </div>
                  <div className="bg-white rounded-xl border border-blue-200 p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Starting Daily</p>
                    <p className="text-xl font-bold text-blue-800">{calc.dailyMg} mg</p>
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-slate-400 mb-0.5">Calculation</p>
                  <p className="text-xs text-green-400 font-mono">{calc.trail}</p>
                </div>
                <Alert className="bg-blue-50 border-blue-200 py-2">
                  <FlaskConical className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <AlertDescription className="text-blue-800 text-xs"><strong>🎯 TDM required.</strong> Adjust dose to target: {selectedInd.note || "see monograph"}</AlertDescription>
                </Alert>
              </>
            ) : calc?.type === "TDM" ? (
              <Alert className="bg-blue-50 border-blue-200 py-2">
                <FlaskConical className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <AlertDescription className="text-blue-800 text-xs"><strong>🎯 TDM-guided dosing.</strong> {selectedInd.note} — Enter dose manually or refer monograph.</AlertDescription>
              </Alert>
            ) : calc?.type === "fixed" ? (
              <div className="bg-white rounded-xl border border-teal-200 p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Fixed Dose</p>
                <p className="text-lg font-bold text-teal-800">{calc.display}</p>
              </div>
            ) : calc?.type === "infusion" ? (
              <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Infusion Rate</p>
                <p className="text-lg font-bold text-indigo-800">{calc.display}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 bg-white px-3 py-2 rounded-lg border">
                {selectedInd.note || "See monograph for dosing."}{!wt && " Enter weight to calculate."}
              </p>
            )}

            {/* Freq / Route / Duration */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "Frequency", value: overrideFreq || selectedInd.freq },
                { label: "Route", value: overrideRoute || selectedInd.route },
                { label: "Duration", value: overrideDuration || selectedInd.duration },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-lg border border-slate-200 px-2 py-1.5 text-center">
                  <p className="text-[9px] text-slate-400 uppercase">{label}</p>
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{value || "—"}</p>
                </div>
              ))}
            </div>

            {/* Monitoring */}
            {selectedInd.monitoring && (
              <div className="flex items-start gap-1.5 bg-blue-50 rounded-lg px-2.5 py-2">
                <Activity className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800"><strong>Monitor:</strong> {selectedInd.monitoring}</p>
              </div>
            )}

            {selectedInd.note && (
              <p className="text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg">ℹ️ {selectedInd.note}</p>
            )}
          </div>
        )}

        {/* ── Indication selector ── */}
        <div>
          <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
            All Indications {allIndications.length > 0 && <span className="text-slate-400 font-normal normal-case">({allIndications.length} total)</span>}
          </p>

          {dbLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Loading indications...</span>
            </div>
          )}
          {noIndications && (
            <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-4 text-center">
              No indication presets for this drug. Use manual entry below.
            </p>
          )}

          {Object.entries(grouped).map(([specialty, inds]) => {
            const isCollapsed = collapsedGroups[specialty];
            const hasHeader = specialty !== "";
            return (
              <div key={specialty || "all"} className="mb-2">
                {hasHeader && (
                  <button
                    onClick={() => setCollapsedGroups(p => ({ ...p, [specialty]: !p[specialty] }))}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-slate-100 rounded-lg mb-1 hover:bg-slate-200 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-600">{specialty}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">{inds.length}</span>
                      {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </button>
                )}
                {(!hasHeader || !isCollapsed) && (
                  <div className="space-y-1">
                    {inds.map((ind, i) => {
                      const isSelected = selectedInd?.label === ind.label;
                      const quickCalc = calculateDose(ind, wt, bsa, null);
                      const dosePreview = quickCalc?.type === "weight" || quickCalc?.type === "bsa" || quickCalc?.type === "TDM"
                        ? `${quickCalc.perAdminMg} mg${quickCalc?.type === "TDM" ? "*" : ""}` : quickCalc?.type === "fixed"
                        ? quickCalc.display : "—";
                      return (
                        <button key={i}
                          onClick={() => { setSelectedInd(ind); setOverrideFreq(""); setOverrideDuration(""); setOverrideRoute(""); setOverrideDose(""); }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl border-2 transition-all flex items-start justify-between gap-2 ${
                            isSelected ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white hover:border-teal-300"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold leading-tight ${isSelected ? "text-teal-800" : "text-slate-700"}`}>
                              {ind._aliases ? `${ind._aliases[0]} + ${ind._aliases.length - 1} similar` : ind.label}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{ind.freq} · {ind.route}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {wt && dosePreview !== "—" && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-teal-200 text-teal-800" : "bg-slate-100 text-slate-600"}`}>
                                {dosePreview}
                              </span>
                            )}
                            {ind.isTDM && (
                              <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">TDM</span>
                            )}
                            {isSelected && <CheckCircle className="w-4 h-4 text-teal-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Override controls ── */}
        {selectedInd && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Override / Confirm</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Dose (mg)</label>
                <Input value={overrideDose} onChange={e => setOverrideDose(e.target.value)}
                  placeholder={calc?.perAdminMg ? `${calc.perAdminMg}` : "Enter dose"}
                  className="text-sm h-8" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Frequency</label>
                <select value={overrideFreq || selectedInd?.freq || ""}
                  onChange={e => setOverrideFreq(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white">
                  {["OD", "BD", "TDS", "QID", "Q6H", "Q8H", "Q12H", "Alternate days", "3×/week", "Weekly", "STAT"].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Route</label>
                <select value={overrideRoute || selectedInd?.route || "PO"}
                  onChange={e => setOverrideRoute(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white">
                  {["PO", "IV", "IM", "SC", "SL", "Inhaled", "PR", "Nebulised"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Duration</label>
                <Input value={overrideDuration || selectedInd?.duration || ""}
                  onChange={e => setOverrideDuration(e.target.value)}
                  placeholder="e.g. 5 days" className="text-sm h-8" />
              </div>
            </div>
          </div>
        )}

        {/* Prescription preview */}
        {prescriptionText && (
        <div className="bg-slate-900 rounded-xl p-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Prescription Preview</p>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded-full transition-colors"
            title="Export as PDF"
          >
            📄 Export PDF
          </button>
        </div>
        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">{prescriptionText}</pre>
        </div>
        )}

        {/* Actions */}
        {selectedInd && (
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(prescriptionText); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success("Copied"); }}
              className="flex-1 gap-1.5 text-xs h-9">
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Rx"}
            </Button>
            <Button size="sm" onClick={handleAddToRxList}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-1.5 text-xs h-9">
              <CheckCircle className="w-3.5 h-3.5" /> Add to Prescription
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}