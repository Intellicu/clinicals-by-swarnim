/**
 * PrescriptionBuilder — Clinical Dosing Assistant + Prescription Draft Generator
 *
 * Philosophy: For multi-indication drugs (Tacrolimus, Rituximab, Acyclovir, etc.)
 * we NEVER generate a single authoritative dose. Instead we show:
 *  1. Weight/BSA-based dose range across all indications
 *  2. Table of indications with dose/frequency/route/duration
 *  3. Calculated patient-specific dose for each indication
 *  4. Target trough where applicable
 *  5. Renal adjustment notes
 *  6. Final draft only after clinician SELECTS an indication
 *
 * For single-indication drugs (simple antihypertensives, diuretics etc.)
 * we retain the direct Rx builder.
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText, Printer, Copy, CheckCircle, AlertTriangle,
  ShieldAlert, X, Plus, ChevronDown, ChevronUp, Info, Layers, TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { TreatmentTemplatePanel } from "./TreatmentTemplates";

// ── Multi-indication drugs: show dosing table, require indication selection ──
const MULTI_INDICATION_DRUGS = {
  tacrolimus: {
    note: "TDM-guided drug. Dose depends on indication and target trough. Do NOT prescribe without selecting indication.",
    monitoring: ["Tacrolimus trough (C0)", "Serum creatinine", "Potassium", "Blood pressure", "Fasting glucose"],
    indications: [
      { name: "SRNS", dose: "0.1–0.2 mg/kg/day", freq: "BD", route: "PO", duration: "12–24 months", trough: "4–8 ng/mL", notes: "Divide equally 12h apart" },
      { name: "SDNS/FRNS", dose: "0.1–0.15 mg/kg/day", freq: "BD", route: "PO", duration: "12–24 months", trough: "4–8 ng/mL", notes: "Monitor monthly TDM" },
      { name: "Renal Transplant (induction)", dose: "0.15–0.2 mg/kg/day", freq: "BD", route: "PO", duration: "Lifelong", trough: "8–12 ng/mL (0–3m)", notes: "Higher target early post-Tx" },
      { name: "Renal Transplant (maintenance)", dose: "0.1–0.15 mg/kg/day", freq: "BD", route: "PO", duration: "Lifelong", trough: "5–10 ng/mL", notes: "Reduce target after 6–12 months" },
      { name: "Lupus Nephritis", dose: "Protocol-based", freq: "BD", route: "PO", duration: "Per protocol", trough: "4–8 ng/mL", notes: "Use with MMF for LN Class V" },
    ]
  },
  cyclosporine: {
    note: "TDM-guided (C0 or C2). Indication-specific targets. Grapefruit interaction — avoid.",
    monitoring: ["Cyclosporine C0/C2 trough", "Serum creatinine", "BP", "Potassium", "Lipids"],
    indications: [
      { name: "SRNS", dose: "4–6 mg/kg/day", freq: "BD", route: "PO", duration: "12–24 months", trough: "C0: 80–120 ng/mL", notes: "Divide equally 12h apart" },
      { name: "SDNS/FRNS", dose: "3–5 mg/kg/day", freq: "BD", route: "PO", duration: "12–24 months", trough: "C0: 80–120 ng/mL", notes: "Start low; titrate" },
      { name: "Renal Transplant (maintenance)", dose: "3–5 mg/kg/day", freq: "BD", route: "PO", duration: "Lifelong", trough: "C2: 800–1200 ng/mL (0–3m)", notes: "C2 monitoring preferred" },
      { name: "MN / LN", dose: "3–5 mg/kg/day", freq: "BD", route: "PO", duration: "12–24 months", trough: "C0: 100–150 ng/mL", notes: "Combine with corticosteroids" },
    ]
  },
  rituximab: {
    note: "Biologic agent. BSA-based dosing. Pre-treatment workup mandatory before first dose.",
    preWorkup: ["CBC + differential", "Liver transaminases (ALT/AST)", "HBsAg", "Anti-HBc", "HIV serology", "Serum IgG"],
    monitoring: ["CD19 count at 4 weeks (target <1%)", "Serum IgG at 3/6/9/12 months", "CBC monthly"],
    indications: [
      { name: "FRNS", dose: "375 mg/m²", freq: "Weekly × 2 doses", route: "IV", duration: "1 course (2 doses)", trough: "CD19 <1%", notes: "Redose if CD19 >5 cells/µL" },
      { name: "SDNS", dose: "375 mg/m²", freq: "Weekly × 2 doses", route: "IV", duration: "1 course (2 doses)", trough: "CD19 <1%", notes: "ISPN 2022 first-line for SDNS" },
      { name: "SRNS", dose: "375 mg/m²", freq: "Weekly × 4 doses", route: "IV", duration: "1 course (4 doses)", trough: "CD19 <1%", notes: "Combine with CNI or steroids" },
      { name: "Lupus Nephritis (LN)", dose: "375 mg/m² OR 750 mg/m²", freq: "Weekly × 4 OR per protocol", route: "IV", duration: "Per protocol", trough: "CD19 <1%", notes: "Protocol-dependent — confirm with center" },
      { name: "Transplant ABMR", dose: "Center protocol", freq: "Per protocol", route: "IV", duration: "Per protocol", trough: "N/A", notes: "Combine with IVIG/plasmapheresis" },
    ]
  },
  acyclovir: {
    note: "Dose varies substantially by indication. IV for encephalitis/severe disease.",
    monitoring: ["Renal function (creatinine, urine output)", "Hydration status"],
    indications: [
      { name: "HSV Gingivostomatitis", dose: "20 mg/kg/dose (max 800 mg)", freq: "QID", route: "PO", duration: "5–7 days", trough: "N/A", notes: "Start within 72h of onset" },
      { name: "Varicella (chickenpox)", dose: "20 mg/kg/dose (max 800 mg)", freq: "QID", route: "PO", duration: "5 days", trough: "N/A", notes: "Start within 24h of rash; >1 year age" },
      { name: "HSV Encephalitis", dose: "10–15 mg/kg/dose IV", freq: "Q8H", route: "IV", duration: "14–21 days", trough: "N/A", notes: "Dilute slowly over 1h. Monitor renal function." },
      { name: "Neonatal HSV", dose: "20 mg/kg/dose IV", freq: "Q8H", route: "IV", duration: "14–21 days (CNS disease)", trough: "N/A", notes: "Ensure adequate hydration" },
      { name: "HSV Prophylaxis (immunocompromised)", dose: "10–20 mg/kg/dose (max 400 mg)", freq: "BD", route: "PO", duration: "Duration of immunosuppression", trough: "N/A", notes: "Common after transplant or cyclophosphamide" },
    ]
  },
  adrenaline: {
    note: "Route and dose CRITICAL — depends entirely on indication. Confirm before administration.",
    monitoring: ["Heart rate", "BP", "O2 saturation", "ECG"],
    indications: [
      { name: "Anaphylaxis (IM)", dose: "0.01 mg/kg (1:1000)", freq: "STAT; repeat at 5 min PRN", route: "IM (anterolateral thigh)", duration: "PRN", trough: "N/A", notes: "MAX 0.5 mg/dose. IM only — never IV push for anaphylaxis." },
      { name: "Cardiac Arrest (IV)", dose: "0.01 mg/kg (1:10,000)", freq: "Q3-5 min", route: "IV / IO", duration: "During arrest", trough: "N/A", notes: "PALS: 0.1 mL/kg of 1:10,000. MAX 1 mg." },
      { name: "Croup (Nebulised)", dose: "0.5 mL/kg (max 5 mL) of 1:1000", freq: "Q20 min PRN", route: "Nebulised", duration: "PRN", trough: "N/A", notes: "Monitor for rebound — observe ≥4h post-last dose." },
      { name: "Septic Shock (infusion)", dose: "0.05–2 mcg/kg/min", freq: "Continuous infusion", route: "IV (central preferred)", duration: "Until haemodynamically stable", trough: "N/A", notes: "Titrate to MAP target. Arterial line preferred." },
    ]
  },
  cyclophosphamide: {
    note: "Alkylating agent. Dose is per-pulse. Mesna uroprotection mandatory for IV pulses.",
    monitoring: ["CBC (Day 10-14 nadir check)", "Urinalysis (haematuria)", "LFTs"],
    indications: [
      { name: "FRNS/SDNS", dose: "2–2.5 mg/kg/day PO OR 500 mg/m² IV monthly", freq: "OD (oral) or Monthly IV pulse", route: "PO or IV", duration: "8–12 weeks (oral) or 6 monthly pulses", trough: "N/A", notes: "Max cumulative dose 168 mg/kg (oral)" },
      { name: "SRNS (biopsy-guided)", dose: "500–750 mg/m² per pulse", freq: "Monthly × 6", route: "IV", duration: "6 months", trough: "N/A", notes: "Mesna + hyperhydration mandatory" },
      { name: "ANCA Vasculitis Induction", dose: "500 mg/m² per pulse (EUVAS protocol)", freq: "Every 2 weeks × 3 then monthly", route: "IV", duration: "3–6 months", trough: "N/A", notes: "Fixed low-dose EUVAS or standard BFM" },
      { name: "Lupus Nephritis (NIH/Euro Lupus)", dose: "Euro Lupus: 500 mg IV q2w × 6 or NIH: 500–1000 mg/m² monthly", freq: "Per protocol", route: "IV", duration: "6 months (induction)", trough: "N/A", notes: "Euro Lupus preferred in children" },
    ]
  },
  mmf: {
    note: "Mycophenolate mofetil. Dose varies by indication. Teratogenic — ensure contraception in adolescent females.",
    monitoring: ["CBC", "LFTs", "Serum creatinine"],
    indications: [
      { name: "FRNS/SDNS", dose: "25–36 mg/kg/day OR 1200 mg/m²/day", freq: "BD", route: "PO", duration: "12–24 months", trough: "N/A", notes: "Max 3 g/day. Take on empty stomach." },
      { name: "Lupus Nephritis (maintenance)", dose: "600 mg/m²/dose BD (max 1 g BD)", freq: "BD", route: "PO", duration: "≥3 years", trough: "N/A", notes: "KDIGO preferred maintenance after LN induction" },
      { name: "Renal Transplant (maintenance)", dose: "1200 mg/m²/day", freq: "BD", route: "PO", duration: "Lifelong", trough: "N/A", notes: "Dose reduce if MPA AUC-guided monitoring used" },
      { name: "IgA Nephropathy", dose: "25–36 mg/kg/day", freq: "BD", route: "PO", duration: "12–18 months", trough: "N/A", notes: "Used with ACEi in proteinuric IgAN" },
    ]
  }
};

// Drugs that should block direct prescribing entirely
const BLOCK_DIRECT_RX = ["rituximab", "eculizumab", "ravulizumab", "belimumab", "daratumumab", "abatacept"];

// ── Safety ceiling database ───────────────────────────────────────────────────
const DOSE_CEILINGS = {
  prednisolone: { maxPerDose: 60, maxPerDay: 60, unit: "mg", ref: "IPNA 2023: max 60 mg/day induction" },
  methylprednisolone: { maxPerDose: 1000, maxPerDay: 1000, unit: "mg", ref: "KDIGO: 30 mg/kg max 1g IV pulse" },
  furosemide: { maxPerDose: 6, maxPerDay: 6, isPerKg: true, unit: "mg/kg", ref: "BNFc: max 6 mg/kg/dose oral" },
  amlodipine: { maxPerDose: 10, maxPerDay: 10, unit: "mg", ref: "AAP HTN: max 10 mg/day" },
  enalapril: { maxPerDose: 40, maxPerDay: 40, unit: "mg", ref: "AAP: max 40 mg/day" },
  losartan: { maxPerDose: 100, maxPerDay: 100, unit: "mg", ref: "AAP: max 100 mg/day" },
};

function getSafetyCeiling(generic) {
  if (!generic) return null;
  const key = generic.toLowerCase().replace(/[^a-z]/g, "");
  return DOSE_CEILINGS[key] || null;
}

function getMultiIndicationKey(generic) {
  if (!generic) return null;
  const key = generic.toLowerCase().replace(/[^a-z]/g, "");
  const map = { tacrolimus: "tacrolimus", cyclosporine: "cyclosporine", ciclosporin: "cyclosporine",
    rituximab: "rituximab", acyclovir: "acyclovir", aciclovir: "acyclovir",
    adrenaline: "adrenaline", epinephrine: "adrenaline", cyclophosphamide: "cyclophosphamide",
    mycophenolate: "mmf", mmf: "mmf" };
  return map[key] || null;
}

function isBlockedBiologic(generic) {
  if (!generic) return false;
  return BLOCK_DIRECT_RX.some(b => generic.toLowerCase().includes(b));
}

// ── Weight-based dose calculation ─────────────────────────────────────────────
function computeDoseRange(drug, weight, bsa) {
  const wt = parseFloat(weight);
  if (!wt || !drug?.peds_dose) return null;
  const raw = drug.peds_dose;
  const results = [];
  const perKgDay = raw.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mg\/kg\/day/);
  if (perKgDay) {
    const lo = parseFloat(perKgDay[1]) * wt;
    const hi = perKgDay[2] ? parseFloat(perKgDay[2]) * wt : null;
    results.push({ label: "mg/kg/day", lo: +lo.toFixed(1), hi: hi ? +hi.toFixed(1) : null });
  }
  const perKgDose = raw.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mg\/kg\/dose/);
  if (perKgDose) {
    const lo = parseFloat(perKgDose[1]) * wt;
    const hi = perKgDose[2] ? parseFloat(perKgDose[2]) * wt : null;
    results.push({ label: "mg/kg/dose", lo: +lo.toFixed(1), hi: hi ? +hi.toFixed(1) : null });
  }
  if (!perKgDay && !perKgDose) {
    const perKg = raw.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mg\/kg/);
    if (perKg) {
      const lo = parseFloat(perKg[1]) * wt;
      const hi = perKg[2] ? parseFloat(perKg[2]) * wt : null;
      results.push({ label: "mg/kg", lo: +lo.toFixed(1), hi: hi ? +hi.toFixed(1) : null });
    }
  }
  if (bsa) {
    const perM2 = raw.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mg\/m[²2]/);
    if (perM2) {
      const lo = parseFloat(perM2[1]) * bsa;
      const hi = perM2[2] ? parseFloat(perM2[2]) * bsa : null;
      results.push({ label: "mg/m²", lo: +lo.toFixed(1), hi: hi ? +hi.toFixed(1) : null });
    }
  }
  return results.length ? results : null;
}

function calcForIndication(indication, weight, bsa) {
  const wt = parseFloat(weight);
  const doseStr = indication.dose;
  if (!doseStr || doseStr === "Protocol-based" || doseStr === "Center protocol" || doseStr.includes("protocol")) return null;

  // mg/kg pattern
  const mkgMatch = doseStr.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mg\/kg/);
  if (mkgMatch && wt) {
    const lo = parseFloat(mkgMatch[1]) * wt;
    const hi = mkgMatch[2] ? parseFloat(mkgMatch[2]) * wt : null;
    const maxCapMatch = doseStr.match(/max\s*([\d.]+)\s*mg/i);
    const cap = maxCapMatch ? parseFloat(maxCapMatch[1]) : null;
    return { lo: +(cap ? Math.min(lo, cap) : lo).toFixed(1), hi: hi ? +(cap ? Math.min(hi, cap) : hi).toFixed(1) : null, unit: "mg", capped: cap && (lo > cap || (hi && hi > cap)), capVal: cap };
  }
  // mg/m² pattern
  const mm2Match = doseStr.match(/([\d.]+)\s*mg\/m[²2]/);
  if (mm2Match && bsa) {
    const lo = parseFloat(mm2Match[1]) * bsa;
    return { lo: +lo.toFixed(0), hi: null, unit: "mg", capped: false };
  }
  // mcg/kg pattern
  const mcgMatch = doseStr.match(/([\d.]+)(?:–|-)([\d.]+)?\s*mcg\/kg\/min/);
  if (mcgMatch && wt) {
    const lo = parseFloat(mcgMatch[1]) * wt;
    const hi = mcgMatch[2] ? parseFloat(mcgMatch[2]) * wt : null;
    return { lo: +lo.toFixed(2), hi: hi ? +hi.toFixed(2) : null, unit: "mcg/min", capped: false };
  }
  return null;
}

// ── Min/Max dose range banner ─────────────────────────────────────────────────
function DoseRangeBanner({ drug, weight, bsa }) {
  const ranges = computeDoseRange(drug, weight, bsa);
  const ceiling = getSafetyCeiling(drug?.generic_name || drug?.generic);
  if (!ranges?.length && !ceiling) return null;
  return (
    <div className="bg-blue-50 border border-blue-300 rounded-xl px-3 py-2.5 space-y-1">
      <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Patient-Specific Dose Range</p>
      {ranges?.map((r, i) => (
        <div key={i} className="flex items-center justify-between text-xs">
          <span className="text-blue-700">{r.label}:</span>
          <span className="font-bold text-blue-900 text-sm">
            {r.hi ? `${r.lo} – ${r.hi} mg` : `${r.lo} mg`}
          </span>
        </div>
      ))}
      {ceiling && (
        <div className="flex items-center justify-between text-xs border-t border-blue-200 pt-1 mt-1">
          <span className="text-red-700 font-semibold">🔴 Safety ceiling:</span>
          <span className="font-bold text-red-800">{ceiling.isPerKg ? `${ceiling.maxPerDay} ${ceiling.unit}` : `${ceiling.maxPerDay} mg/day`}</span>
        </div>
      )}
      {ceiling && <p className="text-xs text-slate-500 italic">{ceiling.ref}</p>}
    </div>
  );
}

// ── Multi-Indication Dosing Display ──────────────────────────────────────────
function MultiIndicationDosingPanel({ drugKey, drug, weight, bsa, onSelectIndication }) {
  const config = MULTI_INDICATION_DRUGS[drugKey];
  const [selectedIdx, setSelectedIdx] = useState(null);
  const wt = parseFloat(weight);
  const bsaNum = parseFloat(bsa);

  const calcForInd = (ind) => calcForIndication(ind, wt, bsaNum);

  return (
    <div className="space-y-4">
      {/* Header note */}
      <Alert className="bg-amber-50 border-amber-400 py-2">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <AlertDescription className="text-amber-800 text-xs font-semibold">{config.note}</AlertDescription>
      </Alert>

      {/* Patient-specific dose range banner */}
      <DoseRangeBanner drug={drug} weight={weight} bsa={bsa} />

      {/* Patient context */}
      {(wt || bsaNum) && (
        <div className="flex gap-2 flex-wrap">
          {wt && <Badge className="bg-blue-100 text-blue-800">Weight: {wt} kg</Badge>}
          {bsaNum && <Badge className="bg-indigo-100 text-indigo-800">BSA: {bsaNum} m²</Badge>}
        </div>
      )}

      {/* Pre-treatment workup */}
      {config.preWorkup && (
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
          <p className="text-xs font-bold text-blue-800 mb-1.5">Pre-treatment Workup Required</p>
          <div className="flex flex-wrap gap-1.5">
            {config.preWorkup.map(w => (
              <span key={w} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{w}</span>
            ))}
          </div>
        </div>
      )}

      {/* Indication table */}
      <div>
        <p className="text-xs font-bold text-slate-700 uppercase mb-2">Common Indications — Select before prescribing</p>
        <div className="space-y-2">
          {config.indications.map((ind, i) => {
            const calc = calcForInd(ind);
            const isSelected = selectedIdx === i;
            return (
              <button key={i} onClick={() => setSelectedIdx(isSelected ? null : i)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all space-y-2 ${isSelected ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-300"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{ind.name}</span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span><span className="text-slate-400">Dose: </span><strong>{ind.dose}</strong></span>
                  <span><span className="text-slate-400">Freq: </span><strong>{ind.freq}</strong></span>
                  <span><span className="text-slate-400">Route: </span><strong>{ind.route}</strong></span>
                  <span><span className="text-slate-400">Duration: </span><strong>{ind.duration}</strong></span>
                  {ind.trough && ind.trough !== "N/A" && (
                    <span className="col-span-2"><span className="text-slate-400">Target: </span><strong className="text-indigo-700">{ind.trough}</strong></span>
                  )}
                </div>

                {/* Patient-specific calculated dose */}
                {calc && (wt || bsaNum) && (
                  <div className="bg-teal-50 rounded-lg px-3 py-1.5 border border-teal-100 flex items-center justify-between">
                    <span className="text-xs text-teal-700 font-semibold">For this patient:</span>
                    <span className="text-sm font-bold text-teal-900">
                      {calc.hi ? `${calc.lo}–${calc.hi}` : calc.lo} {calc.unit}
                      {calc.capped && <span className="ml-1 text-amber-600 text-xs">(capped at {calc.capVal} mg)</span>}
                    </span>
                  </div>
                )}

                {ind.notes && (
                  <p className="text-xs text-slate-500 italic">{ind.notes}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monitoring */}
      {config.monitoring && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <p className="text-xs font-bold text-slate-700 mb-1.5">Monitoring Required</p>
          <div className="flex flex-wrap gap-1.5">
            {config.monitoring.map(m => (
              <span key={m} className="text-xs bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      {selectedIdx !== null ? (
        <div className="space-y-2">
          <Alert className="bg-green-50 border-green-300 py-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800 text-xs font-semibold">
              Indication selected: <strong>{config.indications[selectedIdx].name}</strong> — you can now generate a draft prescription.
            </AlertDescription>
          </Alert>
          <Button onClick={() => onSelectIndication(config.indications[selectedIdx])}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-sm">
            <FileText className="w-4 h-4" /> Generate Draft for {config.indications[selectedIdx].name}
          </Button>
        </div>
      ) : (
        <Alert className="bg-slate-50 border-slate-300 py-2">
          <AlertTriangle className="w-4 h-4 text-slate-500" />
          <AlertDescription className="text-slate-700 text-xs">
            <strong>Indication not selected.</strong> Drug information shown for reference only. Select an indication above before generating a prescription.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// ── Simple Rx Draft Panel (after indication selected, or simple drug) ─────────
function RxDraftPanel({ drug, weight, indication, bsa, patientName, patientId, encounterId, onPrescriptionSaved, onBack }) {
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [overrides, setOverrides] = useState({
    dose: indication ? (() => {
      const calc = calcForIndication(indication, weight, bsa);
      if (calc) return calc.hi ? `${calc.lo}–${calc.hi}` : String(calc.lo);
      return indication.dose || "";
    })() : "",
    unit: "mg",
    frequency: indication?.freq || drug?.frequency || "",
    route: indication?.route || "PO",
    duration: indication?.duration || "",
    instructions: indication?.notes || "",
    indicationName: indication?.name || "",
  });

  const prescriptionText = [
    drug?.generic_name || drug?.generic,
    `${overrides.dose} ${overrides.unit}`,
    overrides.frequency,
    overrides.route,
    overrides.duration ? `× ${overrides.duration}` : "",
    overrides.indicationName ? `[${overrides.indicationName}]` : "",
    overrides.instructions ? `(${overrides.instructions})` : "",
  ].filter(Boolean).join(" ");

  const handleCopy = () => {
    navigator.clipboard.writeText(prescriptionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  const handleSave = async () => {
    if (!patientId) { toast.info("Open from a patient encounter to save Rx."); return; }
    setSaving(true);
    try {
      await base44.entities.Prescription.create({
        patient_id: patientId,
        prescription_date: new Date().toISOString().split("T")[0],
        diagnosis: overrides.indicationName || drug?.indications?.split(",")[0]?.trim() || "",
        medications: [{
          drug_name: drug?.generic_name || drug?.generic,
          dose: overrides.dose,
          unit: overrides.unit,
          frequency: overrides.frequency,
          route: overrides.route,
          duration: overrides.duration,
          instructions: overrides.instructions,
        }],
        notes: `Indication: ${overrides.indicationName}. Weight: ${weight} kg.`,
      });
      toast.success("Saved to patient record");
      onPrescriptionSaved?.();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      {onBack && (
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1">
          ← Back to indication list
        </button>
      )}

      {indication && (
        <div className="bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-200">
          <p className="text-xs text-emerald-700 font-bold">Draft Prescription — {indication.name}</p>
          {indication.trough && indication.trough !== "N/A" && (
            <p className="text-xs text-indigo-700 font-semibold mt-0.5">🎯 Target: {indication.trough}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Dose</label>
          <div className="flex gap-1">
            <Input value={overrides.dose} onChange={e => setOverrides(p => ({ ...p, dose: e.target.value }))} placeholder="e.g. 1" className="text-sm h-8" />
            <select value={overrides.unit} onChange={e => setOverrides(p => ({ ...p, unit: e.target.value }))}
              className="text-xs border border-slate-200 rounded px-1 h-8 bg-white">
              {["mg", "mcg", "mL", "units", "g"].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Frequency</label>
          <select value={overrides.frequency} onChange={e => setOverrides(p => ({ ...p, frequency: e.target.value }))}
            className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white">
            {["", "OD", "BD", "TDS", "QID", "Q6H", "Q8H", "Q12H", "PRN", "STAT", "Weekly", "Alt day"].map(f => <option key={f} value={f}>{f || "Select..."}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Route</label>
          <select value={overrides.route} onChange={e => setOverrides(p => ({ ...p, route: e.target.value }))}
            className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white">
            {["PO", "IV", "IM", "SC", "SL", "Inhaled", "Topical", "PR", "Nebulised"].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Duration</label>
          <Input value={overrides.duration} onChange={e => setOverrides(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 5 days" className="text-sm h-8" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1">Instructions</label>
        <Input value={overrides.instructions} onChange={e => setOverrides(p => ({ ...p, instructions: e.target.value }))} placeholder="With food, after meals, etc." className="text-sm h-8" />
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
        <p className="text-xs text-slate-400 mb-0.5">DRAFT prescription — verify before issuing</p>
        <p className="text-sm font-mono text-slate-800 leading-snug">{prescriptionText}</p>
      </div>

      <Alert className="bg-amber-50 border-amber-300 py-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <AlertDescription className="text-amber-800 text-xs">This is a <strong>clinical draft only</strong>. Verify weight, indication, renal function, and drug interactions before issuing.</AlertDescription>
      </Alert>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 gap-1.5 text-xs">
          {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Draft"}
        </Button>
        {patientId ? (
          <Button size="sm" onClick={handleSave} disabled={saving}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs">
            {saving ? "Saving..." : <><Plus className="w-3.5 h-3.5" /> Save to Patient</>}
          </Button>
        ) : (
          <Button size="sm" onClick={handleCopy} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs">
            <Printer className="w-3.5 h-3.5" /> Copy / Print
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function PrescriptionBuilder({ drug, weight, bsa, patientName, patientId, encounterId, onPrescriptionSaved }) {
  const [open, setOpen] = useState(false);
  const [selectedIndication, setSelectedIndication] = useState(null);

  if (!drug) return null;

  const generic = drug.generic_name || drug.generic || "";
  const multiKey = getMultiIndicationKey(generic);
  const blocked = isBlockedBiologic(generic);
  const isSimpleDrug = !multiKey && !blocked;

  const handleClose = () => { setOpen(false); setSelectedIndication(null); };

  return (
    <div className="mt-3">
      {!open ? (
        <Button onClick={() => setOpen(true)} size="sm"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <FileText className="w-4 h-4" />
          {multiKey || blocked ? "View Dosing Guide" : "Add to Prescription"}
        </Button>
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-sm text-emerald-800">Clinical Dosing Assistant</span>
              {weight && <Badge className="bg-emerald-100 text-emerald-800 text-xs">{weight} kg</Badge>}
              {bsa && <Badge className="bg-indigo-100 text-indigo-800 text-xs">BSA {bsa} m²</Badge>}
            </div>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Biologic blocked */}
          {blocked && !multiKey && (
            <Alert className="bg-red-50 border-red-400">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                <strong>{generic}</strong> requires a validated indication-specific DoseRule. Use the <strong>Prescriber Wizard</strong> tab for guideline-driven prescribing.
              </AlertDescription>
            </Alert>
          )}

          {/* Multi-indication drug */}
          {multiKey && !selectedIndication && (
            <MultiIndicationDosingPanel
              drugKey={multiKey}
              drug={drug}
              weight={weight}
              bsa={bsa}
              onSelectIndication={setSelectedIndication}
            />
          )}

          {/* Draft mode: after indication selected or simple drug */}
          {(selectedIndication || isSimpleDrug) && (
            <RxDraftPanel
              drug={drug}
              weight={weight}
              bsa={bsa}
              indication={selectedIndication}
              patientName={patientName}
              patientId={patientId}
              encounterId={encounterId}
              onPrescriptionSaved={() => { onPrescriptionSaved?.(); handleClose(); }}
              onBack={selectedIndication ? () => setSelectedIndication(null) : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}