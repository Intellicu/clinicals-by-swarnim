import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Zap, Droplet, FlaskConical, CheckCircle } from "lucide-react";
import GuidelineTag from "./GuidelineTag";

// PRNT/KDIGO/KDOQI aligned targets
const ENERGY_TARGETS = {
  AKI: { min: 25, max: 35, note: "KDIGO: 20-30 kcal/kg/day non-protein; prioritize enteral route", protein_min: 1.5, protein_max: 2.5, protein_note: "KDIGO: 1.5–2.5 g/kg/day; higher with CRRT", avoid_earlyPN: true },
  CKD: { min: 100, max: 100, pct_dri: true, note: "PRNT/KDOQI: 100% of DRI for age; increase if growth faltering", protein_min: 0.8, protein_max: 1.0, protein_note: "KDOQI: 100-140% of DRI (GFR-adjusted)", avoid_earlyPN: false },
  Dialysis: { min: 30, max: 35, note: "PRNT: 30-35 kcal/kg/day accounting for dialysate glucose absorption", protein_min: 1.1, protein_max: 1.5, protein_note: "PRNT HD: ≥1.2 g/kg/day; PD: ≥1.5 g/kg/day (dialysate losses)", avoid_earlyPN: false },
  Nephrotic: { min: 100, max: 100, pct_dri: true, note: "IPNA: 100% DRI; avoid excess protein (may worsen proteinuria)", protein_min: 1.0, protein_max: 1.5, protein_note: "IPNA: 100-140% RDA; high-quality protein preferred", avoid_earlyPN: false },
  Other: { min: 25, max: 35, note: "Standard pediatric targets; adjust for clinical status", protein_min: 1.0, protein_max: 2.0, protein_note: "Adjust based on GFR and clinical condition", avoid_earlyPN: false },
};

const ELECTROLYTE_TARGETS = {
  AKI: {
    Na: "2–3 mEq/kg/day (restrict if oliguria/hyponatremia)",
    K: "1–2 mEq/kg/day (restrict if hyperkalemic; avoid K supplements)",
    Phosphate: "Restrict to 40 mg/kg/day in oliguric AKI; use phosphate binders",
    Ca: "Based on ionized calcium; avoid excess in AKI",
    Fluid: "Insensible losses + urine output (restrict in oliguria)",
    VitA: "⚠️ AVOID Vitamin A supplementation in AKI (accumulation risk)"
  },
  CKD: {
    Na: "Individualized; restrict if hypertensive (2–3 mEq/kg/day)",
    K: "Restrict if hyperkalemic (<3 mEq/kg/day); standard if normokalemic",
    Phosphate: "KDOQI: Restrict to 100% DRI; phosphate binders with meals if needed",
    Ca: "KDOQI: 100% DRI from diet; avoid Ca > 2× DRI from supplements",
    Fluid: "Ad lib unless oliguric or hypertensive",
    VitA: "Restrict — CKD impairs retinol metabolism"
  },
  Dialysis: {
    Na: "1–2 mEq/kg/day (restrict for interdialytic weight gain control)",
    K: "HD: 1–3 mEq/kg/day based on pre-dialysis K; PD: liberal",
    Phosphate: "Restrict; use phosphate binders; PRNT target <1.5 mmol/L",
    Ca: "PRNT: Avoid Ca-based binders if Ca>2.6; monitor closely",
    Fluid: "HD: 1–1.5 L/day + urine output; PD: individualized",
    VitA: "Restrict — dialysis does not remove Vit A"
  },
  Nephrotic: {
    Na: "2 mEq/kg/day during relapse; standard when in remission",
    K: "Standard unless on ACEi/diuretics causing dyskalemia",
    Phosphate: "Standard",
    Ca: "Supplement Vit D if deficient (steroid-induced bone disease)",
    Fluid: "Restrict to 1L/m²/day during relapse with edema",
    VitA: "Standard"
  },
  Other: {
    Na: "Standard (2–4 mEq/kg/day)", K: "Standard (1–3 mEq/kg/day)",
    Phosphate: "Standard", Ca: "Standard", Fluid: "Standard", VitA: "Standard"
  }
};

const DRI_ENERGY_BY_AGE = { 1: 1000, 2: 1000, 3: 1200, 4: 1400, 5: 1400, 6: 1600, 7: 1600, 8: 1800, 9: 1800, 10: 2000, 12: 2200, 14: 2400, 16: 2600 };

function getDRI(age) {
  const ages = Object.keys(DRI_ENERGY_BY_AGE).map(Number).sort((a,b)=>a-b);
  for (let i = ages.length-1; i >= 0; i--) { if (age >= ages[i]) return DRI_ENERGY_BY_AGE[ages[i]]; }
  return 1000;
}

export default function NutritionPrescription({ patientData }) {
  const [form, setForm] = useState({ weight: "", age: "", condition: "AKI", phase: "acute", route: "enteral" });
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (patientData) {
      setForm(f => ({
        ...f,
        weight: patientData.euvolemic_weight?.toFixed(1) || f.weight,
        age: patientData.age || f.age,
        condition: patientData.condition || f.condition
      }));
    }
  }, [patientData]);

  const calculate = () => {
    const wt = parseFloat(form.weight);
    const age = parseFloat(form.age);
    const targets = ENERGY_TARGETS[form.condition] || ENERGY_TARGETS.Other;
    const electrolytes = ELECTROLYTE_TARGETS[form.condition] || ELECTROLYTE_TARGETS.Other;

    let energyMin, energyMax, energyLabel;
    if (targets.pct_dri) {
      const dri = getDRI(age);
      energyMin = dri;
      energyMax = Math.round(dri * 1.2);
      energyLabel = `${dri}–${Math.round(dri * 1.2)} kcal/day (100–120% DRI)`;
    } else {
      energyMin = Math.round(wt * targets.min);
      energyMax = Math.round(wt * targets.max);
      energyLabel = `${energyMin}–${energyMax} kcal/day`;
    }

    const proteinMin = (wt * targets.protein_min).toFixed(1);
    const proteinMax = (wt * targets.protein_max).toFixed(1);

    // Phase adjustment
    let phaseNote = "";
    if (form.phase === "acute") phaseNote = "Acute phase: Start at 60–70% of target energy, advance over 48–72h";
    if (form.phase === "recovery") phaseNote = "Recovery phase: Full target energy + additional 10–20% for catch-up growth";
    if (form.phase === "chronic") phaseNote = "Chronic phase: Sustained targets; monitor growth velocity monthly";

    // Route warnings
    let routeWarning = null;
    if (form.route === "parenteral" && targets.avoid_earlyPN) {
      routeWarning = "⚠️ KDIGO: Avoid early PN in AKI unless enteral route is contraindicated for >5 days. Prefer EN even at low rates.";
    }
    if (form.route === "enteral") {
      routeWarning = "✓ PRNT/KDIGO: Enteral nutrition preferred. Start early (within 24–48h of ICU admission if indicated).";
    }

    setResult({ energyMin, energyMax, energyLabel, proteinMin, proteinMax, phaseNote, routeWarning, targets, electrolytes, wt, age });
  };

  const cond = form.condition;
  const electrolytes = ELECTROLYTE_TARGETS[cond] || ELECTROLYTE_TARGETS.Other;

  return (
    <div className="space-y-4 mt-4">
      <GuidelineTag sources={["PRNT 2020", "KDIGO AKI 2012", "KDOQI Pediatric 2009", "ISPD 2016"]} module="Nutrition Prescription" />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-600" /> Prescription Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Dry/Euvolemic Weight (kg)", key: "weight", placeholder: "e.g. 20" },
            { label: "Age (years)", key: "age", placeholder: "e.g. 7" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{f.label}</label>
              <Input type="number" placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)} className="text-sm" />
            </div>
          ))}
          {[
            { key: "condition", label: "Condition", opts: [["AKI","AKI"],["CKD","CKD"],["Dialysis","Dialysis"],["Nephrotic","Nephrotic"],["Other","Other"]] },
            { key: "phase", label: "Illness Phase", opts: [["acute","Acute"],["recovery","Recovery"],["chronic","Chronic/Stable"]] },
            { key: "route", label: "Feeding Route", opts: [["enteral","Enteral (preferred)"],["parenteral","Parenteral"],["mixed","Mixed EN+PN"]] },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{f.label}</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={form[f.key]} onChange={e => set(f.key, e.target.value)}>
                {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <div className="col-span-2 md:col-span-3">
            <Button onClick={calculate} className="bg-teal-600 hover:bg-teal-700 w-full">Calculate Nutrition Prescription</Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-3">
          {/* Route Alert */}
          {result.routeWarning && (
            <Alert className={result.routeWarning.startsWith("⚠️") ? "border-orange-300 bg-orange-50" : "border-green-300 bg-green-50"}>
              <AlertDescription className="text-sm">{result.routeWarning}</AlertDescription>
            </Alert>
          )}

          {/* Energy + Protein */}
          <div className="grid md:grid-cols-2 gap-3">
            <Card className="border-teal-200 bg-teal-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold text-sm text-teal-800">Energy Target</span>
                </div>
                <p className="text-2xl font-bold text-teal-700">{result.energyLabel}</p>
                <p className="text-xs text-slate-600 mt-1">{result.targets.note}</p>
                <p className="text-xs text-blue-700 mt-1 font-medium">{result.phaseNote}</p>
              </CardContent>
            </Card>
            <Card className="border-indigo-200 bg-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-sm text-indigo-800">Protein Target</span>
                </div>
                <p className="text-2xl font-bold text-indigo-700">{result.proteinMin}–{result.proteinMax} g/day</p>
                <p className="text-xs text-slate-600 mt-1">{result.targets.protein_note}</p>
              </CardContent>
            </Card>
          </div>

          {/* Electrolytes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-600" />
                Electrolyte & Fluid Targets — {cond}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(result.electrolytes).map(([key, value]) => (
                <div key={key} className={`flex gap-2 items-start p-2 rounded-lg ${key === "VitA" && value.includes("⚠️") ? "bg-red-50 border border-red-200" : "bg-slate-50"}`}>
                  <Badge variant="outline" className="shrink-0 text-xs w-20 justify-center">{key}</Badge>
                  <span className={`text-xs ${key === "VitA" && value.includes("⚠️") ? "text-red-700 font-medium" : "text-slate-700"}`}>{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Micronutrients */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Micronutrient Guidance (PRNT/KDOQI)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-2 text-xs">
                {[
                  { n: "Iron", r: "Screen for deficiency; oral iron if ferritin <100; IV if CKD/dialysis" },
                  { n: "Vitamin D", r: "25-OH Vit D target 30–50 ng/mL; active Vit D (calcitriol) for CKD" },
                  { n: "Folate/B12", r: "Supplement routinely in dialysis (losses with HD)" },
                  { n: "Zinc", r: "Supplement if deficient; common in nephrotic syndrome" },
                  { n: "Vitamin C", r: "Limit to 60 mg/day in CKD/ESRD (oxalate accumulation risk)" },
                  { n: "Carnitine", r: "Consider in ESRD/dialysis with carnitine deficiency" },
                ].map(m => (
                  <div key={m.n} className="flex gap-2 p-2 bg-slate-50 rounded-lg">
                    <span className="font-semibold text-teal-700 w-20 shrink-0">{m.n}</span>
                    <span className="text-slate-600">{m.r}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}