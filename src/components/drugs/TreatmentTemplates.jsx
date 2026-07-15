/**
 * TreatmentTemplates — Standard pediatric treatment templates for common indications.
 * Used inside PrescriptionBuilder to generate multi-drug prescription lists.
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, ChevronDown, ChevronUp, Copy, CheckCircle, AlertTriangle, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const TREATMENT_TEMPLATES = [
  {
    id: "ns_first_episode",
    category: "Nephrotic Syndrome",
    name: "NS — First Episode (MCNS)",
    guideline: "IPNA 2023 / ISKDC",
    drugs: [
      { drug: "Prednisolone", dose_formula: "60 mg/m²/day OR 2 mg/kg/day", max: "60 mg/day", freq: "OD (morning)", route: "PO", duration: "4 weeks (induction)", notes: "Single morning dose with food. Calcium + Vit D supplement." },
      { drug: "Calcium (Carbonate)", dose_formula: "500 mg/day", max: "500 mg/day", freq: "OD", route: "PO", duration: "Throughout steroid therapy", notes: "Bone protection during steroids." },
      { drug: "Vitamin D3 (Cholecalciferol)", dose_formula: "400–800 IU/day", max: "800 IU/day", freq: "OD", route: "PO", duration: "Throughout steroid therapy", notes: "With calcium for bone protection." },
      { drug: "Co-trimoxazole", dose_formula: "5 mg/kg trimethoprim 3×/week", max: "160 mg TMP/dose", freq: "3×/week (Mon/Wed/Fri)", route: "PO", duration: "If on high-dose steroids >4 weeks", notes: "PCP prophylaxis. Only if immunocompromised." },
    ],
    tapering: "After 4 weeks induction: Prednisolone 40 mg/m² alternate day for 4 weeks, then taper by 25% every 2 weeks over 3–6 months.",
    monitoring: ["Urine dipstick daily at home (morning)", "Weekly weight and BP", "Ophthalmology if >3 months steroids"],
    red_flags: ["Rising serum creatinine", "BP >95th centile", "Failure to respond by 4 weeks (SRNS workup)"],
  },
  {
    id: "ns_relapse",
    category: "Nephrotic Syndrome",
    name: "NS — Relapse Protocol",
    guideline: "IPNA 2023",
    drugs: [
      { drug: "Prednisolone", dose_formula: "2 mg/kg/day OR 60 mg/m²/day", max: "60 mg/day", freq: "OD (morning)", route: "PO", duration: "Until remission (urine protein neg × 3 days)", notes: "Resume immediately when 2+ protein on dipstick for 3 consecutive days." },
    ],
    tapering: "After remission: 1.5 mg/kg alternate day for 4 weeks, then taper and stop. Consider steroid-sparing agent if ≥2 relapses/year (FRNS criteria).",
    monitoring: ["Daily dipstick", "BP weekly during active relapse"],
    red_flags: ["No remission in 4 weeks → consider SRNS", "Severe edema / ascites → albumin infusion + IV furosemide"],
  },
  {
    id: "frns_sdns",
    category: "Nephrotic Syndrome",
    name: "FRNS/SDNS — Steroid-sparing Therapy",
    guideline: "IPNA 2023 / ISPN 2022",
    drugs: [
      { drug: "Prednisolone", dose_formula: "0.5 mg/kg", max: "20 mg", freq: "Alternate day", route: "PO", duration: "Maintenance (6–12 months)", notes: "Minimum effective dose on alternate days." },
      { drug: "Levamisole", dose_formula: "2.5 mg/kg", max: "150 mg", freq: "Alternate day", route: "PO", duration: "12–24 months", notes: "ISPN 2022 first-line SSA. Monitor CBC monthly for agranulocytosis." },
    ],
    tapering: "Continue levamisole 12–24 months. Taper prednisolone to lowest effective alternate day dose. If 2 relapses on levamisole, consider MMF or CNI.",
    monitoring: ["CBC monthly (agranulocytosis risk)", "Dipstick daily", "Height and weight every 3 months", "BP at each visit"],
    red_flags: ["Fever → check ANC immediately", "ANC <1500 → hold levamisole immediately"],
  },
  {
    id: "ckd_stage3",
    category: "CKD Management",
    name: "CKD Stage 3 (eGFR 30–59) — Standard Protocol",
    guideline: "KDIGO CKD 2022 / KDOQI",
    drugs: [
      { drug: "Enalapril OR Ramipril", dose_formula: "0.1 mg/kg/dose", max: "10 mg/day", freq: "OD–BD", route: "PO", duration: "Long-term", notes: "ACEi for antiproteinuric effect. Check K+ and creatinine at 1 week." },
      { drug: "Sodium Bicarbonate", dose_formula: "1–3 mEq/kg/day", max: "As needed to HCO3 >22", freq: "BD–TDS", route: "PO", duration: "Long-term if metabolic acidosis", notes: "Target serum HCO3 ≥22 mEq/L. Mix in feed or juice." },
      { drug: "Furosemide", dose_formula: "0.5–2 mg/kg/dose", max: "6 mg/kg/day", freq: "OD–BD", route: "PO", duration: "As needed for fluid overload", notes: "Only if hypertensive or fluid overloaded. Morning dose." },
      { drug: "Calcium Carbonate (phosphate binder)", dose_formula: "25–50 mg/kg/day elemental Ca", max: "Per phosphate level", freq: "WITH meals (TDS)", route: "PO", duration: "If hyperphosphataemia", notes: "Take with meals only — works as phosphate binder." },
    ],
    monitoring: ["eGFR every 3 months", "Creatinine, K+, HCO3, phosphate, Ca, Hb monthly", "BP at each visit", "Annual DEXA if on steroids"],
    red_flags: ["Rapid GFR decline (>5 mL/min/year)", "Uncontrolled hypertension", "Hb <10 g/dL → start ESA"],
  },
  {
    id: "ckd_stage4_5",
    category: "CKD Management",
    name: "CKD Stage 4–5 (eGFR <30) — Pre-dialysis",
    guideline: "KDIGO CKD 2022 / KDOQI Pediatric",
    drugs: [
      { drug: "Amlodipine", dose_formula: "0.1–0.2 mg/kg/day", max: "10 mg/day", freq: "OD", route: "PO", duration: "Long-term", notes: "First-line antihypertensive. Safe in all CKD stages." },
      { drug: "Sodium Bicarbonate", dose_formula: "1–4 mEq/kg/day", max: "As needed", freq: "TDS", route: "PO", duration: "Long-term", notes: "Maintain HCO3 22–26 mEq/L. Critical to slow CKD progression." },
      { drug: "Erythropoietin (Darbepoetin OR EPO)", dose_formula: "Darbepoetin: 0.45 mcg/kg", max: "Per Hb target", freq: "Weekly SC (Darbepoetin)", route: "SC", duration: "Until transplant/dialysis", notes: "Target Hb 10–12 g/dL. With IV/PO iron." },
      { drug: "Calcitriol (1,25-OH Vit D)", dose_formula: "0.01–0.05 mcg/kg/day", max: "0.25–2 mcg/day", freq: "OD", route: "PO", duration: "If PTH elevated", notes: "Monitor Ca, P, PTH monthly. Stop if hypercalcemia." },
    ],
    monitoring: ["Monthly: Hb, creatinine, electrolytes, Ca, P, PTH, albumin", "Fistula/PD referral planning if eGFR <15"],
    red_flags: ["Hb <8 → urgent ESA dose adjustment", "K+ >5.5 → dietary restriction + kayexalate", "PTH >300 pg/mL → intensify MBD management"],
  },
  {
    id: "uti_treatment",
    category: "Infection",
    name: "UTI — First Episode (Child >3 months)",
    guideline: "NICE 2022 / IAP Guidelines",
    drugs: [
      { drug: "Co-trimoxazole (first-line if sensitive)", dose_formula: "4 mg/kg TMP component", max: "160 mg TMP/dose", freq: "BD", route: "PO", duration: "5 days (lower UTI) / 7–10 days (upper UTI / febrile)", notes: "If culture shows sensitivity. Adjust per urine C&S." },
      { drug: "Cefixime (if co-trimoxazole resistant)", dose_formula: "8 mg/kg/day", max: "400 mg/day", freq: "OD or BD", route: "PO", duration: "7–10 days febrile UTI", notes: "Alternative for resistant organisms." },
    ],
    monitoring: ["Repeat MSU after treatment completion", "Renal USS for all first febrile UTI", "MCUG if abnormal USS or recurrent UTI"],
    red_flags: ["Failure to respond in 48h → IV therapy", "Recurrent UTI → imaging workup for VUR"],
  },
  {
    id: "htn_management",
    category: "Hypertension",
    name: "Pediatric Hypertension — Initial Management",
    guideline: "AAP 2017 / ESH 2016",
    drugs: [
      { drug: "Amlodipine", dose_formula: "0.1–0.2 mg/kg/day", max: "10 mg/day", freq: "OD", route: "PO", duration: "Long-term", notes: "First-line in CKD-associated HTN. Peripheral edema is cosmetic." },
      { drug: "Enalapril (if proteinuria present)", dose_formula: "0.1 mg/kg/dose", max: "40 mg/day", freq: "OD–BD", route: "PO", duration: "Long-term", notes: "Add if significant proteinuria. Monitor K+ and creatinine." },
    ],
    monitoring: ["BP at every visit", "Home BP log (if feasible)", "ABPM after treatment initiation", "Echo if Stage 2 HTN"],
    red_flags: ["BP ≥95th centile + 12 mmHg (Stage 2) → hypertensive urgency", "Headache + blurred vision → emergency"],
  },
  {
    id: "aki_mild",
    category: "AKI",
    name: "AKI Stage 1–2 — Initial Management",
    guideline: "KDIGO AKI 2012",
    drugs: [
      { drug: "IV Normal Saline (0.9%)", dose_formula: "10–20 mL/kg bolus if hypovolemic", max: "20 mL/kg × 2", freq: "STAT if hypovolemic", route: "IV", duration: "Until euvolemic", notes: "Fluid challenge ONLY if hypovolemic AKI. Avoid in fluid-overloaded." },
      { drug: "Furosemide (if fluid overloaded)", dose_formula: "1–2 mg/kg/dose", max: "6 mg/kg/dose", freq: "BD–TDS", route: "IV", duration: "Until euvolemic", notes: "Only if fluid overloaded — NOT for prevention. Continuous infusion if resistant." },
      { drug: "Calcium Gluconate 10% (if K+ >6.5)", dose_formula: "0.5–1 mL/kg", max: "20 mL", freq: "STAT IV over 10 min", route: "IV", duration: "Single dose; repeat if needed", notes: "ECG monitoring during infusion. Cardiac membrane stabilizer only — does NOT lower K+." },
    ],
    monitoring: ["Hourly urine output", "4-hourly electrolytes (K+, Na+, creatinine)", "Fluid balance chart", "BP and weight BD"],
    red_flags: ["Oliguria <0.5 mL/kg/hr >12h → RRT referral", "K+ >6.5 + ECG changes → emergency", "Creatinine doubling despite treatment → nephrology review"],
  },
];

export function TreatmentTemplatePanel({ weight, bsa, onSelectTemplate }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const categories = ["All", ...new Set(TREATMENT_TEMPLATES.map(t => t.category))];
  const filtered = selectedCategory === "All"
    ? TREATMENT_TEMPLATES
    : TREATMENT_TEMPLATES.filter(t => t.category === selectedCategory);

  const calcDose = (formula, wt, bsaNum) => {
    if (!formula) return formula;
    if (!wt && !bsaNum) return formula;
    const mkgMatch = formula.match(/([\d.]+)\s*mg\/kg/);
    if (mkgMatch && wt) {
      const calc = parseFloat(mkgMatch[1]) * parseFloat(wt);
      return `${formula} → ~${calc.toFixed(1)} mg`;
    }
    const mm2Match = formula.match(/([\d.]+)\s*mg\/m[²2]/);
    if (mm2Match && bsaNum) {
      const calc = parseFloat(mm2Match[1]) * parseFloat(bsaNum);
      return `${formula} → ~${calc.toFixed(1)} mg`;
    }
    return formula;
  };

  const buildTemplateText = (template) => {
    const lines = [`=== ${template.name} ===`, `Guideline: ${template.guideline}`, ``];
    template.drugs.forEach(d => {
      lines.push(`• ${d.drug}`);
      lines.push(`  Dose: ${calcDose(d.dose_formula, weight, bsa)} (max ${d.max})`);
      lines.push(`  ${d.freq} ${d.route} × ${d.duration}`);
      if (d.notes) lines.push(`  Note: ${d.notes}`);
      lines.push(``);
    });
    if (template.tapering) lines.push(`Tapering: ${template.tapering}`, ``);
    lines.push(`Monitoring: ${template.monitoring.join(" | ")}`);
    return lines.join("\n");
  };

  const handleCopy = (template) => {
    navigator.clipboard.writeText(buildTemplateText(template));
    setCopiedId(template.id);
    toast.success("Template copied to clipboard");
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-3">
      <Alert className="bg-blue-50 border-blue-300 py-2">
        <BookOpen className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-xs font-semibold">
          Standard treatment templates based on IPNA, KDIGO, AAP, and IAP guidelines. Doses auto-calculated for patient weight. Always verify against current guidelines before prescribing.
        </AlertDescription>
      </Alert>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${selectedCategory === cat ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(template => (
          <div key={template.id} className="border-2 border-slate-200 rounded-xl overflow-hidden bg-white">
            {/* Header */}
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{template.name}</p>
                  <p className="text-xs text-slate-500">{template.guideline}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <Badge className="bg-blue-100 text-blue-700 text-xs">{template.category}</Badge>
                {expandedId === template.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {expandedId === template.id && (
              <div className="border-t border-slate-200 p-3 space-y-3 bg-slate-50">
                {/* Drugs table */}
                <div className="space-y-2">
                  {template.drugs.map((d, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-slate-900">{d.drug}</span>
                        <Badge className="text-xs bg-emerald-100 text-emerald-800">{d.route}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-1.5">
                        <span><span className="text-slate-400">Dose: </span><strong className="text-blue-800">{calcDose(d.dose_formula, weight, bsa)}</strong></span>
                        <span><span className="text-slate-400">Max: </span><strong className="text-red-700">{d.max}</strong></span>
                        <span><span className="text-slate-400">Freq: </span><strong>{d.freq}</strong></span>
                        <span><span className="text-slate-400">Duration: </span><strong>{d.duration}</strong></span>
                      </div>
                      {d.notes && <p className="text-xs text-slate-500 italic">{d.notes}</p>}
                    </div>
                  ))}
                </div>

                {/* Tapering */}
                {template.tapering && (
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                    <p className="text-xs font-bold text-amber-800 mb-1">Tapering Schedule</p>
                    <p className="text-xs text-amber-900">{template.tapering}</p>
                  </div>
                )}

                {/* Monitoring */}
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-200">
                  <p className="text-xs font-bold text-indigo-800 mb-1.5">Monitoring Required</p>
                  <div className="flex flex-wrap gap-1.5">
                    {template.monitoring.map((m, i) => (
                      <span key={i} className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Red flags */}
                <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                  <p className="text-xs font-bold text-red-800 mb-1.5">⚠️ Red Flags</p>
                  {template.red_flags.map((f, i) => (
                    <p key={i} className="text-xs text-red-800">• {f}</p>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(template)} className="flex-1 gap-1.5 text-xs">
                    {copiedId === template.id ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === template.id ? "Copied!" : "Copy Template"}
                  </Button>
                  <Button size="sm" onClick={() => onSelectTemplate?.(template)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5" /> Use Template
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Alert className="bg-amber-50 border-amber-300 py-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <AlertDescription className="text-amber-800 text-xs">
          All templates are clinical decision support only. Doses are auto-calculated estimates — verify weight, renal function, and indication before prescribing. Not a substitute for clinical judgment.
        </AlertDescription>
      </Alert>
    </div>
  );
}