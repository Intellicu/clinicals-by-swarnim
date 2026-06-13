import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronDown, ChevronRight, FlaskConical, CheckCircle, AlertTriangle,
  Printer, Copy, MessageCircle, ShieldAlert, X
} from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

// ── Indication-specific dosing rules ─────────────────────────────────────────
// Each drug may have multiple indication presets; the selected one drives dose/freq/duration
const INDICATION_PRESETS = {
  amoxicillin: [
    { label: "Acute Otitis Media (high-dose)", dose_mgkg_day: 90, freq: "BD", duration: "5 days", route: "PO", max_mg_day: 3000 },
    { label: "Streptococcal pharyngitis", dose_mgkg_day: 50, freq: "BD", duration: "10 days", route: "PO", max_mg_day: 1000 },
    { label: "UTI prophylaxis", dose_mgkg_day: 10, freq: "OD", duration: "3–6 months", route: "PO", max_mg_day: 250 },
    { label: "Pneumonia (community)", dose_mgkg_day: 80, freq: "TDS", duration: "5–7 days", route: "PO", max_mg_day: 3000 },
  ],
  "amoxicillin-clavulanate": [
    { label: "AOM (treatment failure)", dose_mgkg_day: 90, freq: "BD", duration: "10 days", route: "PO", max_mg_day: 3000, note: "High-dose amoxicillin component" },
    { label: "Skin & soft tissue infection", dose_mgkg_day: 40, freq: "TDS", duration: "5–7 days", route: "PO", max_mg_day: 1500 },
  ],
  prednisolone: [
    { label: "NS — First episode induction", dose_mgkg_day: 2, freq: "OD", duration: "4 weeks", route: "PO", max_mg_day: 60, note: "IPNA 2023: 60 mg/m²/day" },
    { label: "NS — Relapse", dose_mgkg_day: 2, freq: "OD", duration: "Until remission + 3 days", route: "PO", max_mg_day: 60, note: "Continue until PCR <0.2 for 3 days" },
    { label: "NS — Alternate day maintenance", dose_mgkg_day: 1.5, freq: "Alternate days", duration: "4 weeks", route: "PO", max_mg_day: 40, note: "IPNA: 40 mg/m² alternate day" },
    { label: "Croup", dose_mgkg_day: 1, freq: "STAT single dose", duration: "1 dose", route: "PO/IM", max_mg_day: 10 },
    { label: "Asthma exacerbation", dose_mgkg_day: 1, freq: "OD", duration: "3–5 days", route: "PO", max_mg_day: 40 },
    { label: "ITP", dose_mgkg_day: 4, freq: "OD", duration: "4 days", route: "PO", max_mg_day: 160, note: "Dexamethasone protocol alternative" },
    { label: "Acute rheumatic fever (carditis)", dose_mgkg_day: 2, freq: "OD", duration: "4 weeks then taper", route: "PO", max_mg_day: 60 },
  ],
  furosemide: [
    { label: "Edema (NS/CKD)", dose_mgkg_day: 1, freq: "BD", duration: "As needed", route: "PO", max_mg_day: 120, note: "Titrate to response; higher doses in CKD" },
    { label: "Acute pulmonary edema", dose_mgkg_day: 1, freq: "STAT/Q6H", duration: "Until resolved", route: "IV", max_mg_day: 80, note: "0.5–1 mg/kg IV bolus" },
    { label: "Hypertension in CKD", dose_mgkg_day: 2, freq: "BD", duration: "Ongoing", route: "PO", max_mg_day: 160 },
  ],
  tacrolimus: [
    { label: "SRNS induction", dose_mgkg_day: 0.1, freq: "BD", duration: "12 months", route: "PO", note: "Target trough 5–8 ng/mL; TDM-guided", isTDM: true },
    { label: "Transplant — early", dose_mgkg_day: 0.15, freq: "BD", duration: "3 months", route: "PO", note: "Target trough 8–12 ng/mL; adjust by TDM", isTDM: true },
    { label: "Transplant — maintenance", dose_mgkg_day: 0.1, freq: "BD", duration: "Ongoing", route: "PO", note: "Target trough 5–8 ng/mL; TDM-guided", isTDM: true },
  ],
  amlodipine: [
    { label: "Hypertension (CKD/general)", dose_mgkg_day: 0.1, freq: "OD", duration: "Ongoing", route: "PO", max_mg_day: 10, note: "Start low; titrate every 4 weeks" },
    { label: "Hypertensive urgency", dose_mgkg_day: 0.2, freq: "OD", duration: "Ongoing", route: "PO", max_mg_day: 10 },
  ],
  enalapril: [
    { label: "Proteinuria / CKD (RAS blockade)", dose_mgkg_day: 0.1, freq: "OD", duration: "Ongoing", route: "PO", max_mg_day: 40, note: "Monitor K+ and creatinine at 2 weeks" },
    { label: "Hypertension", dose_mgkg_day: 0.2, freq: "OD", duration: "Ongoing", route: "PO", max_mg_day: 40 },
  ],
  cotrimoxazole: [
    { label: "UTI treatment", dose_mgkg_day: 8, freq: "BD", duration: "3–7 days", route: "PO", max_mg_day: 320, note: "TMP component dosing" },
    { label: "UTI prophylaxis", dose_mgkg_day: 2, freq: "OD (evening)", duration: "3–12 months", route: "PO", max_mg_day: 80, note: "TMP component" },
    { label: "PCP prophylaxis (transplant/IS)", dose_mgkg_day: 5, freq: "3×/week", duration: "Ongoing", route: "PO", max_mg_day: 160, note: "TMP component; or 2.5 mg/kg/day" },
  ],
  cyclophosphamide: [
    { label: "Frequently relapsing NS", dose_mgkg_day: 2, freq: "OD", duration: "8–12 weeks", route: "PO", max_mg_day: 60, note: "Max cumulative dose 168 mg/kg. Monitor CBC weekly." },
    { label: "Lupus nephritis (induction)", dose_mgkg_day: null, freq: "Monthly IV pulse", duration: "6 pulses", route: "IV", note: "500–750 mg/m² IV monthly (Euro-Lupus protocol)" },
  ],
  mycophenolate: [
    { label: "SRNS maintenance", dose_mgkg_day: null, freq: "BD", duration: "12–24 months", route: "PO", note: "600 mg/m²/dose BD (max 1g BD). Monitor CBC monthly." },
    { label: "Lupus nephritis (maintenance)", dose_mgkg_day: null, freq: "BD", duration: "Ongoing", route: "PO", note: "600 mg/m²/dose BD. Teratogenic — counsel patients." },
  ],
  cefixime: [
    { label: "Uncomplicated UTI", dose_mgkg_day: 8, freq: "OD", duration: "7–14 days", route: "PO", max_mg_day: 400 },
    { label: "AOM (alternative)", dose_mgkg_day: 8, freq: "OD", duration: "10 days", route: "PO", max_mg_day: 400 },
  ],
  azithromycin: [
    { label: "Atypical pneumonia", dose_mgkg_day: 10, freq: "OD", duration: "5 days", route: "PO", max_mg_day: 500 },
    { label: "Pharyngitis (penicillin-allergic)", dose_mgkg_day: 12, freq: "OD", duration: "5 days", route: "PO", max_mg_day: 500 },
    { label: "Chlamydia (single dose)", dose_mgkg_day: 20, freq: "STAT", duration: "1 dose", route: "PO", max_mg_day: 1000 },
  ],
};

// Best formulation selector based on calculated dose
function selectBestFormulation(formulations, dosePerAdmin_mg) {
  if (!formulations?.length || !dosePerAdmin_mg) return null;
  // Prefer oral suspension for doses <200mg, tablets otherwise
  const oral = formulations.filter(f => f.form?.toLowerCase().includes("oral") || f.form?.toLowerCase().includes("suspension") || f.form?.toLowerCase().includes("tablet") || f.form?.toLowerCase().includes("capsule"));
  if (!oral.length) return formulations[0];
  // Find suspension with reasonable volume
  const susp = oral.filter(f => f.form?.toLowerCase().includes("susp") || f.form?.toLowerCase().includes("syrup") || f.form?.toLowerCase().includes("liquid"));
  if (susp.length && dosePerAdmin_mg < 500) {
    const best = susp.sort((a, b) => {
      const strengthA = parseFloat((a.strength || "0").match(/[\d.]+/)?.[0] || 0);
      const strengthB = parseFloat((b.strength || "0").match(/[\d.]+/)?.[0] || 0);
      return strengthA - strengthB;
    })[0];
    return best;
  }
  // Tablet
  const tabs = oral.filter(f => f.form?.toLowerCase().includes("tab") || f.form?.toLowerCase().includes("cap"));
  if (tabs.length) {
    const best = tabs.sort((a, b) => {
      const strengthA = parseFloat((a.strength || "0").match(/[\d.]+/)?.[0] || 0);
      const strengthB = parseFloat((b.strength || "0").match(/[\d.]+/)?.[0] || 0);
      return strengthA - strengthB;
    })[0];
    return best;
  }
  return oral[0];
}

function calcVolume(formulation, dosePerAdmin_mg) {
  if (!formulation || !dosePerAdmin_mg) return null;
  const str = formulation.strength || "";
  // Liquid: "125 mg/5 mL" or "250 mg/5 mL"
  const mlMatch = str.match(/([\d.]+)\s*mg\s*\/\s*([\d.]+)\s*mL/i);
  if (mlMatch) {
    const mgPerMl = parseFloat(mlMatch[1]) / parseFloat(mlMatch[2]);
    const vol = dosePerAdmin_mg / mgPerMl;
    return parseFloat(vol.toFixed(1)); // numeric, caller adds "mL"
  }
  // Tablet/capsule: "500 mg"
  const tabMatch = str.match(/([\d.]+)\s*mg/i);
  if (tabMatch) {
    const mgPerTab = parseFloat(tabMatch[1]);
    const tabs = dosePerAdmin_mg / mgPerTab;
    return `${tabs % 1 === 0 ? tabs.toFixed(0) : tabs.toFixed(1)} tab${tabs !== 1 ? "s" : ""}`;
  }
  return null;
}

export default function RxIndicationBuilder({ drug, weight, patientAge, patientName, onClose, onAddToRxList }) {
  const drugKey = (drug?.generic_name || drug?.generic || "").toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, "").trim();
  // Try exact key match then partial
  const indications = INDICATION_PRESETS[drugKey]
    || INDICATION_PRESETS[Object.keys(INDICATION_PRESETS).find(k => drugKey.startsWith(k) || k.startsWith(drugKey)) || ""]
    || [];

  const [selectedIndication, setSelectedIndication] = useState(null);
  const [overrideDose, setOverrideDose] = useState("");
  const [overrideFreq, setOverrideFreq] = useState("");
  const [overrideDuration, setOverrideDuration] = useState("");
  const [overrideRoute, setOverrideRoute] = useState("");
  const [copied, setCopied] = useState(false);

  const wt = parseFloat(weight) || null;

  const calcResult = useMemo(() => {
    if (!selectedIndication || !wt) return null;
    const ind = selectedIndication;
    if (ind.isTDM) return { type: "TDM", note: ind.note };

    if (!ind.dose_mgkg_day) return { type: "manual", note: ind.note };

    const rawDay = ind.dose_mgkg_day * wt;
    const cappedDay = ind.max_mg_day ? Math.min(rawDay, ind.max_mg_day) : rawDay;

    // Doses per day
    const freqMap = { "OD": 1, "BD": 2, "TDS": 3, "TID": 3, "QID": 4, "Q6H": 4, "Q8H": 3, "Q12H": 2, "Alternate days": 0.5, "STAT single dose": 1, "3×/week": 3/7 };
    const doseCount = freqMap[overrideFreq || ind.freq] || 1;
    const perAdmin = doseCount >= 1 ? cappedDay / doseCount : cappedDay;

    // Rounded to nearest 5mg for readability
    const roundedPerAdmin = Math.round(perAdmin / 5) * 5;
    const roundedDay = Math.round(cappedDay / 5) * 5;

    // Choose best formulation
    const formulations = drug?.formulations || [];
    const bestForm = selectBestFormulation(formulations, roundedPerAdmin);
    const volumeStr = bestForm ? calcVolume(bestForm, roundedPerAdmin) : null;

    // Build a clean per-dose display string
    let perAdminDisplay = `${roundedPerAdmin} mg`;
    if (bestForm && volumeStr !== null) {
      const isLiquid = typeof volumeStr === "number";
      perAdminDisplay = isLiquid
        ? `${roundedPerAdmin} mg (${volumeStr} mL)`
        : `${roundedPerAdmin} mg (${volumeStr})`;
    }

    return {
      type: "weight",
      dailyMg: roundedDay,
      perAdminMg: roundedPerAdmin,
      perAdminDisplay,
      formulation: bestForm,
      volumeStr,
      note: ind.note,
      capped: cappedDay < rawDay,
      cappedAt: ind.max_mg_day,
    };
  }, [selectedIndication, wt, overrideFreq, drug]);

  const prescriptionText = useMemo(() => {
    if (!selectedIndication) return "";
    const ind = selectedIndication;
    const drugName = drug?.generic_name || drug?.generic || "";
    const freq = overrideFreq || ind.freq;
    const duration = overrideDuration || ind.duration;
    const route = overrideRoute || ind.route;

    let doseStr = "";
    if (overrideDose) {
      doseStr = `${overrideDose} mg`;
    } else if (calcResult?.type === "weight") {
      // Use volume-based dose if liquid formulation, else mg dose
      if (typeof calcResult.volumeStr === "number" && calcResult.volumeStr) {
        doseStr = `${calcResult.volumeStr} mL (${calcResult.perAdminMg} mg)`;
      } else {
        doseStr = calcResult.perAdminDisplay;
      }
    } else if (calcResult?.type === "TDM") {
      doseStr = `(TDM-guided — see note)`;
    } else {
      doseStr = ind.note || "— see monograph";
    }

    const form = calcResult?.formulation;
    const formLine = form
      ? `  Formulation: ${form.form} ${form.strength}${form.brands ? ` (${form.brands})` : ""}`
      : "";
    const quantityLine = (() => {
      if (!form || !calcResult?.volumeStr || !duration) return "";
      // Estimate quantity only for liquid forms
      const durMatch = duration.match(/(\d+)/);
      if (!durMatch) return "";
      const days = parseInt(durMatch[1]);
      const freqMap = { "OD": 1, "BD": 2, "TDS": 3, "TID": 3, "QID": 4 };
      const doses = freqMap[freq] || 1;
      const totalDoses = days * doses;
      const isLiquid = form.strength?.includes("/");
      if (typeof calcResult.volumeStr === "number" && calcResult.volumeStr) {
        const totalMl = (calcResult.volumeStr * totalDoses).toFixed(0);
        return `  Qty: ${totalMl} mL total (${totalDoses} doses × ${calcResult.volumeStr} mL)`;
      }
      return "";
    })();

    return [
      `${drugName}`,
      `  Indication: ${ind.label}`,
      weight ? `  Weight: ${weight} kg` : "",
      `  Dose: ${doseStr} ${route} ${freq}`,
      `  Duration: ${duration}`,
      formLine,
      quantityLine,
      calcResult?.note ? `  Note: ${calcResult.note}` : "",
    ].filter(Boolean).join("\n");
  }, [selectedIndication, calcResult, overrideDose, overrideFreq, overrideDuration, overrideRoute, drug, weight]);

  const handleCopy = () => {
    navigator.clipboard.writeText(prescriptionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Prescription copied");
  };

  const handleAddToRxList = () => {
    if (!selectedIndication) return;
    const ind = selectedIndication;
    const freq = overrideFreq || ind.freq;
    const duration = overrideDuration || ind.duration;
    const route = overrideRoute || ind.route;
    let doseStr = overrideDose || (calcResult?.type === "weight" ? `${calcResult.perAdminMg} mg` : ind.note || "");

    onAddToRxList?.({
      drug,
      indication: ind.label,
      dose: doseStr,
      freq,
      route,
      duration,
      formulation: calcResult?.formulation,
      prescriptionText,
    });
    toast.success(`${drug?.generic_name || drug?.generic} added to Rx`);
    onClose?.();
  };

  const noIndications = indications.length === 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-teal-300 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">{drug?.generic_name || drug?.generic}</p>
          <p className="text-teal-100 text-xs">{drug?.therapeutic_class || drug?.category} · Select indication to calculate dose</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Weight reminder */}
        {!wt && (
          <Alert className="bg-amber-50 border-amber-200 py-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-xs">Enter patient weight at the top to calculate doses automatically.</AlertDescription>
          </Alert>
        )}

        {/* Indication selector */}
        <div>
          <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Select Indication</p>
          {noIndications ? (
            <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-4 text-center">
              No indication presets available for this drug. Use manual entry below or refer to the monograph.
            </p>
          ) : (
            <div className="space-y-1.5">
              {indications.map((ind, i) => {
                const isSelected = selectedIndication?.label === ind.label;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedIndication(ind);
                      setOverrideFreq("");
                      setOverrideDuration("");
                      setOverrideRoute("");
                      setOverrideDose("");
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border-2 transition-all flex items-start justify-between gap-2 ${
                      isSelected ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white hover:border-teal-300"
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isSelected ? "text-teal-800" : "text-slate-700"}`}>{ind.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ind.freq} · {ind.route} · {ind.duration}</p>
                    </div>
                    {isSelected && <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Calculated dose panel */}
        {selectedIndication && (
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-teal-700 uppercase tracking-wide">Calculated Dose{wt ? ` for ${wt} kg` : ""}</p>

            {calcResult?.type === "weight" ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-xl border border-teal-200 p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Per Dose</p>
                    <p className="text-lg font-bold text-teal-800">{calcResult.perAdminDisplay}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-teal-200 p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Daily Total</p>
                    <p className="text-lg font-bold text-teal-800">{calcResult.dailyMg} mg</p>
                  </div>
                </div>

                {calcResult.capped && (
                  <Alert className="bg-amber-50 border-amber-300 py-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <AlertDescription className="text-amber-700 text-xs">
                      Dose capped at max {calcResult.cappedAt} mg/day (adult ceiling).
                    </AlertDescription>
                  </Alert>
                )}

                {calcResult.formulation && (
                  <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5">
                    <p className="text-xs font-bold text-indigo-600 mb-1">Recommended Formulation</p>
                    <p className="text-sm font-semibold text-slate-800">{calcResult.formulation.form} {calcResult.formulation.strength}</p>
                    {calcResult.volumeStr !== null && (
                      <p className="text-xs text-teal-700 mt-0.5">
                        Per dose: <strong>
                          {typeof calcResult.volumeStr === "number" ? `${calcResult.volumeStr} mL` : calcResult.volumeStr}
                        </strong>
                      </p>
                    )}
                    {calcResult.formulation.brands && <p className="text-xs text-slate-400 mt-0.5">Brands: {calcResult.formulation.brands}</p>}
                  </div>
                )}

                {calcResult.note && (
                  <p className="text-xs text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg">ℹ️ {calcResult.note}</p>
                )}
              </div>
            ) : calcResult?.type === "TDM" ? (
              <Alert className="bg-blue-50 border-blue-200 py-2">
                <FlaskConical className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs">
                  <strong>TDM-guided dosing.</strong> {calcResult.note}
                </AlertDescription>
              </Alert>
            ) : (
              <p className="text-xs text-slate-500 bg-white px-3 py-2 rounded-lg border">
                {calcResult?.note || "Refer to drug monograph for specific dosing."}
                {!wt && " Enter patient weight to auto-calculate."}
              </p>
            )}
          </div>
        )}

        {/* Override controls */}
        {selectedIndication && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Override / Confirm</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Dose (mg)</label>
                <Input
                  value={overrideDose}
                  onChange={e => setOverrideDose(e.target.value)}
                  placeholder={calcResult?.type === "weight" ? `${calcResult?.perAdminMg || ""}` : "Enter dose"}
                  className="text-sm h-8"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Frequency</label>
                <select
                  value={overrideFreq || selectedIndication?.freq || ""}
                  onChange={e => setOverrideFreq(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white"
                >
                  {["OD", "BD", "TDS", "QID", "Q6H", "Q8H", "Q12H", "Alternate days", "3×/week", "STAT"].map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Route</label>
                <select
                  value={overrideRoute || selectedIndication?.route || "PO"}
                  onChange={e => setOverrideRoute(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-md px-2 h-8 bg-white"
                >
                  {["PO", "IV", "IM", "SC", "SL", "Inhaled", "PR"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Duration</label>
                <Input
                  value={overrideDuration || selectedIndication?.duration || ""}
                  onChange={e => setOverrideDuration(e.target.value)}
                  placeholder="e.g. 5 days"
                  className="text-sm h-8"
                />
              </div>
            </div>
          </div>
        )}

        {/* Prescription preview */}
        {prescriptionText && (
          <div className="bg-slate-900 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wide">Prescription Preview</p>
            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">{prescriptionText}</pre>
          </div>
        )}

        {/* Actions */}
        {selectedIndication && (
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 gap-1.5 text-xs h-9"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Rx"}
            </Button>
            <Button
              size="sm"
              onClick={handleAddToRxList}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-1.5 text-xs h-9"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Add to Prescription
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}