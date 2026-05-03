import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, Droplets, Activity, Pill, Calculator } from "lucide-react";

// ── AEIOU Criteria ───────────────────────────────────────────────────────────
const AEIOU_CRITERIA = [
  { id: "A_acidosis", label: "A – Acidosis (pH <7.15 or HCO3 <8, refractory)", emergency: true },
  { id: "E_electrolyte", label: "E – Electrolyte (K+ >6.5 refractory, severe hypo-Na)", emergency: true },
  { id: "I_intoxication", label: "I – Intoxication (dialyzable toxin: methanol, lithium, salicylate)", emergency: true },
  { id: "O_overload", label: "O – Fluid Overload (pulmonary oedema refractory to diuretics)", emergency: true },
  { id: "U_uremia", label: "U – Uremia (encephalopathy, pericarditis, bleeding, BUN >200)", emergency: false },
];

// ── Drug Safety Database ─────────────────────────────────────────────────────
const DRUG_SAFETY = [
  { name: "Gentamicin", safety: "nephrotoxic", riskLevel: "critical", note: "Avoid in CKD. If essential, TDM-guided dosing. Accumulates in tubular cells. Single daily dosing preferred." },
  { name: "Amikacin", safety: "nephrotoxic", riskLevel: "critical", note: "Monitor creatinine daily. Trough <5 µg/mL. Avoid in AKI." },
  { name: "Vancomycin", safety: "nephrotoxic", riskLevel: "high", note: "AUC-guided dosing. Target AUC/MIC 400-600. Avoid trough-only monitoring. Nephrotoxic especially with piperacillin-tazobactam." },
  { name: "NSAIDs (Ibuprofen/Diclofenac)", safety: "nephrotoxic", riskLevel: "critical", note: "ABSOLUTE CONTRAINDICATION in NS, CKD, AKI, dehydrated states. Causes afferent vasoconstriction → AKI." },
  { name: "Amphotericin B (conventional)", safety: "nephrotoxic", riskLevel: "critical", note: "Use liposomal formulation (AmBisome) in CKD/AKI. Pre-hydrate. Dose 3-5 mg/kg/day (liposomal)." },
  { name: "Cyclosporin (CsA)", safety: "nephrotoxic", riskLevel: "high", note: "Dose: 3-5 mg/kg/day BD. TDM: C0 100-150 ng/mL. Monitor eGFR, BP, K+. Check HbA1c (PTDM)." },
  { name: "Tacrolimus", safety: "nephrotoxic", riskLevel: "high", note: "TDM: trough 5-10 ng/mL (NS); 10-15 ng/mL early transplant. CNI nephrotoxicity → TMA, arteriolar hyalinosis." },
  { name: "Metformin", safety: "contraindicated", riskLevel: "critical", note: "Hold if eGFR <30 (lactic acidosis risk). Stop before contrast. Re-check eGFR 48h post contrast." },
  { name: "ACE Inhibitor / ARB", safety: "caution", riskLevel: "medium", note: "Avoid in bilateral RAS, volume depletion, K+ >5.5. Monitor Cr+K within 2 weeks of starting. Renal protective otherwise." },
  { name: "Cotrimoxazole (TMP-SMX)", safety: "caution", riskLevel: "medium", note: "TMP component blocks tubular secretion of Cr → false Cr rise. True nephrotoxicity rare at prophylactic dose." },
  { name: "Lithium", safety: "nephrotoxic", riskLevel: "high", note: "Monitor CrCl 6-monthly. Causes chronic tubulointerstitial nephritis + nephrogenic DI (polyuria). Check TFTs." },
  { name: "Radiocontrast (IV)", safety: "caution", riskLevel: "high", note: "Pre-hydrate 1 mL/kg NS for 3-4h before and after. Hold metformin. Use iso-osmolar contrast. Avoid volume depletion." },
  { name: "Furosemide", safety: "safe_adjusted", riskLevel: "low", note: "Dose adjust in renal impairment. IV furosemide 1-2 mg/kg for AKI oliguria. Avoid in pre-renal AKI." },
  { name: "Cefepime", safety: "caution", riskLevel: "medium", note: "Dose adjust for eGFR <50. Risk of neurotoxicity (encephalopathy) in CKD if not adjusted." },
  { name: "Ranitidine / H2 blockers", safety: "safe_adjusted", riskLevel: "low", note: "Reduce by 50% in renal failure. Generally safe." },
];

const safetyColors = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  low: "bg-green-100 text-green-800 border-green-300",
};

const safetyIcons = {
  nephrotoxic: "☠️",
  contraindicated: "🚫",
  caution: "⚠️",
  safe_adjusted: "✅",
};

export default function DialysisDecisionSupport() {
  const [activeSection, setActiveSection] = useState("aeiou");
  const [criteria, setCriteria] = useState({});
  const [bp, setBp] = useState("");
  const [weight, setWeight] = useState("");
  const [egfr, setEgfr] = useState("");
  const [drugSearch, setDrugSearch] = useState("");

  // AEIOU count
  const checkedCount = AEIOU_CRITERIA.filter(c => criteria[c.id]).length;
  const emergencyChecked = AEIOU_CRITERIA.filter(c => c.emergency && criteria[c.id]).length;

  // Modality suggestion
  const suggestModality = () => {
    const egfrN = parseFloat(egfr);
    const wtN = parseFloat(weight);
    const suggestions = [];

    if (criteria.E_electrolyte && criteria.A_acidosis) {
      suggestions.push({ modality: "CRRT preferred", reason: "Hemodynamically unstable with multiple emergencies. CRRT provides continuous, gentle solute removal.", color: "bg-red-600" });
    } else if (criteria.I_intoxication) {
      suggestions.push({ modality: "HD (Intermittent) STAT", reason: "For dialyzable toxins (methanol, lithium, salicylate) — intermittent HD provides fastest clearance.", color: "bg-red-600" });
    } else if (wtN > 0 && wtN < 15) {
      suggestions.push({ modality: "PD (Peritoneal Dialysis)", reason: `Weight ${wtN} kg — PD preferred in small children (<15kg). No vascular access required. Continuous gentle ultrafiltration.`, color: "bg-blue-600" });
    } else if (egfrN > 0 && egfrN < 10) {
      suggestions.push({ modality: "PD or HD", reason: "ESKD stage — elective choice based on family preference, comorbidities, vascular access.", color: "bg-indigo-600" });
    } else if (criteria.O_overload) {
      suggestions.push({ modality: "Consider CRRT or HD", reason: "Fluid overload with hemodynamic instability — CRRT preferred. If stable, HD acceptable.", color: "bg-orange-600" });
    }

    if (suggestions.length === 0 && checkedCount >= 1) {
      suggestions.push({ modality: "HD (Intermittent)", reason: "For hemodynamically stable patients with standard indications.", color: "bg-purple-600" });
    }
    return suggestions;
  };

  const modalitySuggestions = suggestModality();
  const filteredDrugs = DRUG_SAFETY.filter(d => d.name.toLowerCase().includes(drugSearch.toLowerCase()) || d.note.toLowerCase().includes(drugSearch.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { id: "aeiou", label: "AEIOU Criteria", IconEl: Activity },
          { id: "modality", label: "Modality Selection", IconEl: Droplets },
          { id: "drugs", label: "Drug Safety", IconEl: Pill },
          { id: "fluid", label: "Fluid Calculator", IconEl: Calculator },
        ].map(({ id, label, IconEl }) => (
          <Button key={id} size="sm" onClick={() => setActiveSection(id)}
            className={`text-xs h-8 ${activeSection === id ? "bg-slate-800 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
            <IconEl className="w-3 h-3 mr-1" />{label}
          </Button>
        ))}
      </div>

      {/* ── AEIOU ── */}
      {activeSection === "aeiou" && (
        <Card className="bg-white border-2 border-red-200">
          <CardHeader className="bg-red-50 border-b py-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />AEIOU — Emergent Dialysis Indications (Pediatric)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {AEIOU_CRITERIA.map(item => (
              <div key={item.id} onClick={() => setCriteria(p => ({ ...p, [item.id]: !p[item.id] }))}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${criteria[item.id] ? (item.emergency ? "bg-red-100 border-red-500 shadow-md" : "bg-orange-100 border-orange-400") : "bg-white border-slate-200 hover:border-slate-400"}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${criteria[item.id] ? "bg-red-600 border-red-600" : "border-slate-300"}`}>
                  {criteria[item.id] && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${criteria[item.id] ? "text-red-900" : "text-slate-700"}`}>{item.label}</p>
                  {item.emergency && <Badge className="bg-red-600 text-white text-[10px] mt-1">Absolute Emergency Indication</Badge>}
                </div>
              </div>
            ))}

            {/* Result */}
            {checkedCount > 0 && (
              <div className={`rounded-xl p-4 ${emergencyChecked >= 1 ? "bg-red-600 text-white" : checkedCount >= 2 ? "bg-orange-500 text-white" : "bg-amber-400 text-slate-900"} shadow-lg`}>
                <p className="font-black text-lg">{emergencyChecked >= 1 ? "🔴 URGENT — IMMEDIATE DIALYSIS" : checkedCount >= 2 ? "🟠 URGENT — Dialysis likely needed" : "🟡 1 criteria — consider dialysis"}</p>
                <p className="text-sm mt-1 opacity-90">{checkedCount}/{AEIOU_CRITERIA.length} criteria met ({emergencyChecked} absolute emergency). Consult nephrology immediately.</p>
              </div>
            )}
            {checkedCount === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Check criteria above to assess dialysis urgency</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Modality ── */}
      {activeSection === "modality" && (
        <Card className="bg-white border-2 border-blue-200">
          <CardHeader className="bg-blue-50 border-b py-3">
            <CardTitle className="text-sm font-bold">Dialysis Modality Selection</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="mt-1 h-8 text-xs" placeholder="e.g. 12" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">eGFR (ml/min/1.73m²)</label>
                <Input type="number" value={egfr} onChange={e => setEgfr(e.target.value)} className="mt-1 h-8 text-xs" placeholder="e.g. 8" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">AEIOU criteria met</label>
                <div className="mt-1 h-8 flex items-center">
                  <Badge className={`text-xs ${checkedCount >= 1 ? "bg-red-600 text-white" : "bg-slate-200 text-slate-600"}`}>{checkedCount} criteria</Badge>
                </div>
              </div>
            </div>

            {modalitySuggestions.map((s, i) => (
              <div key={i} className={`${s.color} text-white rounded-xl p-4 shadow`}>
                <p className="font-black text-lg">{s.modality}</p>
                <p className="text-sm mt-1 text-white/90">{s.reason}</p>
              </div>
            ))}

            {modalitySuggestions.length === 0 && (
              <Alert className="bg-blue-50 border-blue-200">
                <Activity className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-xs text-blue-900">Enter patient details and check AEIOU criteria for modality suggestion.</AlertDescription>
              </Alert>
            )}

            {/* Comparison table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-2 border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    {["Feature", "PD", "IHD (HD)", "CRRT"].map(h => (
                      <th key={h} className="px-2 py-2 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-800">
                  {[
                    ["Age/Weight", "All ages, <15kg preferred", ">15kg; vascular access", "ICU patients, any age"],
                    ["Hemodynamics", "Tolerated well", "Needs stability", "Best for unstable"],
                    ["Toxin clearance", "Slow but continuous", "Fast (dialyzable toxins)", "Continuous moderate"],
                    ["Fluid removal", "Gentle, continuous", "3-5h session UF", "Continuous, precise"],
                    ["Access", "PD catheter", "CVC / AVF", "CVC (arterial/venous)"],
                    ["Anticoagulation", "None needed", "Heparin / no-hep", "Citrate preferred"],
                    ["Home suitability", "Yes (CAPD/APD)", "Centre-based", "ICU only"],
                  ].map(([feat, ...vals], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-2 py-1.5 font-semibold text-slate-700 border-r border-slate-200">{feat}</td>
                      {vals.map((v, j) => <td key={j} className="px-2 py-1.5 border-r border-slate-100">{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Drug Safety ── */}
      {activeSection === "drugs" && (
        <Card className="bg-white border-2 border-amber-200">
          <CardHeader className="bg-amber-50 border-b py-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Pill className="w-4 h-4 text-amber-600" />Drug Safety — Nephrotoxicity & Renal Dose Adjustments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Input value={drugSearch} onChange={e => setDrugSearch(e.target.value)} placeholder="Search drug name..." className="h-8 text-xs" />
            <div className="flex gap-1.5 flex-wrap">
              {[
                { label: "☠️ Nephrotoxic", color: "bg-red-100 text-red-800" },
                { label: "🚫 Contraindicated", color: "bg-orange-100 text-orange-800" },
                { label: "⚠️ Caution", color: "bg-amber-100 text-amber-800" },
                { label: "✅ Adjust dose", color: "bg-green-100 text-green-800" },
              ].map(b => <Badge key={b.label} className={`text-xs ${b.color}`}>{b.label}</Badge>)}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredDrugs.map((drug, i) => (
                <div key={i} className={`border-2 rounded-lg p-3 ${safetyColors[drug.riskLevel]}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{safetyIcons[drug.safety]}</span>
                    <span className="font-bold text-sm">{drug.name}</span>
                    <Badge className={`text-[10px] ${safetyColors[drug.riskLevel]}`}>{drug.riskLevel.toUpperCase()}</Badge>
                    <Badge className="text-[10px] bg-slate-200 text-slate-700">{drug.safety.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-xs opacity-90">{drug.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Fluid Calculator ── */}
      {activeSection === "fluid" && (
        <FluidCalculatorSection />
      )}
    </div>
  );
}

function FluidCalculatorSection() {
  const [wt, setWt] = useState("");
  const [na, setNa] = useState("");
  const [targetNa, setTargetNa] = useState("135");
  const [deficit, setDeficit] = useState("");
  const [deficitType, setDeficitType] = useState("5");

  const wtN = parseFloat(wt);
  const naN = parseFloat(na);
  const targetN = parseFloat(targetNa);
  const defN = parseFloat(deficit);

  // Holliday-Segar maintenance
  let maintenance = 0;
  if (wtN > 0) {
    if (wtN <= 10) maintenance = 100 * wtN;
    else if (wtN <= 20) maintenance = 1000 + 50 * (wtN - 10);
    else maintenance = 1500 + 20 * (wtN - 20);
  }
  const maintenanceHr = Math.round(maintenance / 24);

  // Deficit calculation
  const deficitVolume = !isNaN(wtN) && !isNaN(defN) ? Math.round(wtN * 10 * defN) : null; // 10mL/kg per 1%
  const totalRehydration = deficitVolume ? deficitVolume + maintenance : null;
  const first8hrVolume = totalRehydration ? Math.round(totalRehydration / 2) : null;
  const next16hrVolume = totalRehydration ? Math.round(totalRehydration / 2) : null;
  const first8hrRate = first8hrVolume ? Math.round(first8hrVolume / 8) : null;
  const next16hrRate = next16hrVolume ? Math.round(next16hrVolume / 16) : null;

  // Sodium correction
  const naDeficit = !isNaN(naN) && !isNaN(targetN) && !isNaN(wtN) ? Math.round(0.6 * wtN * (targetN - naN)) : null;
  const maxCorrectionPer24h = 10;
  const mmolToMeq = 1;
  const sodiumAlert = naN < 120;
  const tooFastAlert = naDeficit && (naDeficit / (0.6 * wtN)) > maxCorrectionPer24h;

  return (
    <Card className="bg-white border-2 border-cyan-200">
      <CardHeader className="bg-cyan-50 border-b py-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Calculator className="w-4 h-4 text-cyan-600" />Fluid & Sodium Calculator (Holliday-Segar)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
            <Input type="number" value={wt} onChange={e => setWt(e.target.value)} className="mt-1 h-8 text-xs" placeholder="e.g. 20" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">% Dehydration</label>
            <Select value={deficitType} onValueChange={setDeficitType}>
              <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["3", "5", "7", "10"].map(v => <SelectItem key={v} value={v} className="text-xs">{v}% dehydration</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Current Na+ (mEq/L)</label>
            <Input type="number" value={na} onChange={e => setNa(e.target.value)} className="mt-1 h-8 text-xs" placeholder="e.g. 128" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Target Na+ (mEq/L)</label>
            <Input type="number" value={targetNa} onChange={e => setTargetNa(e.target.value)} className="mt-1 h-8 text-xs" />
          </div>
        </div>

        {wtN > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Maintenance/24h", val: `${maintenance} ml (${maintenanceHr} ml/hr)`, color: "bg-blue-50 border-blue-200" },
              deficitVolume && { label: `${deficitType}% Deficit Volume`, val: `${deficitVolume} ml`, color: "bg-orange-50 border-orange-200" },
              totalRehydration && { label: "Total First 24h Volume", val: `${totalRehydration} ml`, color: "bg-purple-50 border-purple-200" },
              first8hrRate && { label: "First 8h Rate", val: `${first8hrRate} ml/hr (${first8hrVolume} ml)`, color: "bg-red-50 border-red-200" },
              next16hrRate && { label: "Next 16h Rate", val: `${next16hrRate} ml/hr (${next16hrVolume} ml)`, color: "bg-green-50 border-green-200" },
            ].filter(Boolean).map((item, i) => (
              <div key={i} className={`${item.color} border-2 rounded-lg p-3`}>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="font-black text-slate-800 text-sm mt-0.5">{item.val}</p>
              </div>
            ))}
          </div>
        )}

        {naDeficit !== null && (
          <div className="space-y-2">
            {sodiumAlert && (
              <Alert className="bg-red-50 border-red-400 border-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-xs text-red-900 font-bold">
                  🔴 Severe hyponatremia Na+ {naN} — risk of cerebral oedema. Correct at max 0.5–1 mEq/L/hour. 3% saline for symptomatic (seizures, obtundation).
                </AlertDescription>
              </Alert>
            )}
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-lg p-3">
              <p className="text-xs text-slate-500">Na+ Deficit (0.6 × wt × target-current)</p>
              <p className="font-black text-cyan-800 text-lg">{naDeficit} mEq needed</p>
              <p className="text-xs text-slate-500 mt-1">Max correction: 10 mEq/L per 24 hours (chronic hyponatremia — ODS risk)</p>
              {naDeficit > 0 && <p className="text-xs text-cyan-700 mt-1">Volume of 3% saline (0.513 mEq/mL) needed: ~{Math.round(naDeficit / 0.513)} ml (give slowly over 24h)</p>}
            </div>
          </div>
        )}

        {/* Safety warnings */}
        <Card className="bg-amber-50 border-2 border-amber-200">
          <CardHeader className="py-2 px-3 border-b bg-amber-100">
            <CardTitle className="text-xs font-bold text-amber-900">⚠️ Sodium Correction Safety Warnings</CardTitle>
          </CardHeader>
          <CardContent className="p-3 text-xs text-amber-900 space-y-1">
            {[
              "Chronic hyponatremia: correct max 10 mEq/L/day — rapid correction → Osmotic Demyelination Syndrome (ODS)",
              "Acute symptomatic (seizures/coma): 3% saline 2-4 ml/kg IV stat to raise Na by 5 mEq/L",
              "Hypernatremia: correct max 10-12 mEq/L/day — rapid correction → cerebral oedema",
              "Always reassess Na+ every 4-6 hours and adjust rate accordingly",
              "In NS: restrict free water, not sodium — dilutional hyponatremia is common",
            ].map((w, i) => <div key={i} className="flex items-start gap-1.5 p-1 bg-amber-100 rounded"><span className="flex-shrink-0">⚠️</span>{w}</div>)}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}