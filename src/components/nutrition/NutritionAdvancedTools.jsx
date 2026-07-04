import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertTriangle, Loader2, FlaskConical, Droplet, Settings } from "lucide-react";
import { base44 } from "@/api/client";
import GuidelineTag from "./GuidelineTag";

// ─── Tube Feeding Planner ────────────────────────────────────────────────────
function TubeFeedingPlanner({ patientData }) {
  const [form, setForm] = useState({ weight: patientData?.euvolemic_weight || "", age: patientData?.age || "", formula: "standard", access: "NG", rate_type: "continuous", condition: "AKI" });
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const FORMULAS = {
    standard: { name: "Standard Pediatric (e.g. PediaSure)", kcal_per_ml: 1.0, protein_per_ml: 0.03, notes: "Use as first-line; standard osmolarity" },
    renal: { name: "Renal Formula (e.g. Nepro, Rena-Soy)", kcal_per_ml: 1.8, protein_per_ml: 0.07, notes: "High-energy, low K/P/fluid; for CKD/dialysis" },
    high_protein: { name: "High Protein (e.g. Ensure High Protein)", kcal_per_ml: 1.0, protein_per_ml: 0.06, notes: "Use in dialysis for increased protein losses" },
    whey: { name: "Whey-based (low phosphate)", kcal_per_ml: 1.0, protein_per_ml: 0.04, notes: "Lower phosphate per protein — preferred in hyperphosphatemia" },
    modular: { name: "Modular (glucose polymer + protein isolate)", kcal_per_ml: 1.0, protein_per_ml: 0.03, notes: "Custom energy/protein ratio; flexible for strict K/P limits" },
  };

  const calculate = () => {
    const wt = parseFloat(form.weight);
    const formula = FORMULAS[form.formula];
    // Energy needs (simplified by condition)
    const energyNeeds = form.condition === "AKI" ? wt * 30 : form.condition === "Dialysis" ? wt * 33 : wt * 100 * 0.8;
    const volumePerDay = Math.round(energyNeeds / formula.kcal_per_ml);
    const proteinPerDay = (volumePerDay * formula.protein_per_ml).toFixed(1);
    const ratePerHour = form.rate_type === "continuous" ? Math.round(volumePerDay / 24) : null;
    const bolus = form.rate_type === "bolus" ? Math.round(volumePerDay / 4) : null;
    setResult({ energyNeeds: Math.round(energyNeeds), volumePerDay, proteinPerDay, ratePerHour, bolus, formula });
  };

  return (
    <div className="space-y-3">
      <GuidelineTag sources={["PRNT 2020", "ESPGHAN 2018", "AIIMS PICU"]} module="Tube Feeding" compact />
      <Card>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {[{ k: "weight", l: "Weight (kg)" }, { k: "age", l: "Age (years)" }].map(f => (
            <div key={f.k}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{f.l}</label>
              <Input type="number" value={form[f.k]} onChange={e => set(f.k, e.target.value)} className="text-sm" />
            </div>
          ))}
          {[
            { k: "condition", l: "Condition", opts: [["AKI","AKI"],["CKD","CKD"],["Dialysis","Dialysis"]] },
            { k: "formula", l: "Formula Type", opts: Object.entries(FORMULAS).map(([v,f]) => [v, f.name.split("(")[0].trim()]) },
            { k: "access", l: "Access Route", opts: [["NG","NG Tube"],["NJ","NJ Tube"],["G-tube","G-Tube (PEG)"]] },
            { k: "rate_type", l: "Feeding Rate", opts: [["continuous","Continuous"],["bolus","Bolus (4x/day)"]] },
          ].map(f => (
            <div key={f.k}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{f.l}</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={form[f.k]} onChange={e => set(f.k, e.target.value)}>
                {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
        </CardContent>
      </Card>
      <Button onClick={calculate} className="bg-teal-600 hover:bg-teal-700 w-full">Calculate Tube Feeding Plan</Button>
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "Energy Needs", v: `${result.energyNeeds} kcal/day`, c: "teal" },
            { l: "Total Volume", v: `${result.volumePerDay} mL/day`, c: "blue" },
            { l: "Protein Delivered", v: `${result.proteinPerDay} g/day`, c: "indigo" },
            result.ratePerHour ? { l: "Rate (continuous)", v: `${result.ratePerHour} mL/hr`, c: "purple" } : { l: "Bolus Volume", v: `${result.bolus} mL x4/day`, c: "purple" },
          ].map(s => (
            <Card key={s.l} className={`border-${s.c}-200 bg-${s.c}-50`}>
              <CardContent className="p-3 text-center">
                <div className={`text-lg font-bold text-${s.c}-700`}>{s.v}</div>
                <div className="text-xs text-slate-500">{s.l}</div>
              </CardContent>
            </Card>
          ))}
          <div className="col-span-2 md:col-span-4">
            <Alert className="border-teal-200 bg-teal-50">
              <AlertDescription className="text-xs">
                <strong>Formula: {result.formula.name}</strong> — {result.formula.notes}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Parenteral Nutrition Planner ────────────────────────────────────────────
function ParenteralNutritionPlanner() {
  const [form, setForm] = useState({ weight: "", age: "", indication: "gut_failure", duration_days: "3" });
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calculate = () => {
    const wt = parseFloat(form.weight);
    // PN targets per ESPGHAN/PRNT — cautious approach
    const glucose_gkg = 10; // start at 10 g/kg/day
    const aa_gkg = 2.0;     // amino acids
    const lipid_gkg = 2.0;  // lipid emulsion
    const kcal_from_glucose = wt * glucose_gkg * 3.4;
    const kcal_from_lipid = wt * lipid_gkg * 9;
    const total_kcal = Math.round(kcal_from_glucose + kcal_from_lipid);
    const aa_g = (wt * aa_gkg).toFixed(1);
    // Volume estimation
    const dextrose_vol = Math.round(wt * glucose_gkg / 0.1); // 10% dextrose
    const lipid_vol = Math.round(wt * lipid_gkg / 0.2); // 20% lipid
    const aa_vol = Math.round(wt * aa_gkg / 0.1); // 10% amino acid
    const total_vol = dextrose_vol + lipid_vol + aa_vol;
    setResult({ glucose_gkg, aa_gkg, lipid_gkg, kcal_from_glucose: Math.round(kcal_from_glucose), kcal_from_lipid: Math.round(kcal_from_lipid), total_kcal, aa_g, dextrose_vol, lipid_vol, aa_vol, total_vol, wt });
  };

  return (
    <div className="space-y-3">
      <Alert className="border-orange-300 bg-orange-50">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription className="text-xs">
          <strong>KDIGO / PRNT:</strong> Use PN only when EN is contraindicated or insufficient after ≥5 days. 
          Prefer EN even at trophic rates. PN in AKI requires careful monitoring of electrolytes and glucose.
        </AlertDescription>
      </Alert>
      <GuidelineTag sources={["ESPGHAN 2018", "KDIGO AKI 2012", "AIIMS PICU"]} module="Parenteral Nutrition" compact />
      <Card>
        <CardContent className="p-4 grid grid-cols-2 gap-3">
          {[{ k: "weight", l: "Weight (kg)" }, { k: "age", l: "Age (years)" }, { k: "duration_days", l: "Expected PN Duration (days)" }].map(f => (
            <div key={f.k}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{f.l}</label>
              <Input type="number" value={form[f.k]} onChange={e => set(f.k, e.target.value)} className="text-sm" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Indication</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.indication} onChange={e => set("indication", e.target.value)}>
              <option value="gut_failure">GI Failure / Short Bowel</option>
              <option value="ileus">Post-operative Ileus</option>
              <option value="intolerance">EN Intolerance</option>
              <option value="aki_severe">Severe AKI — EN not tolerated</option>
            </select>
          </div>
        </CardContent>
      </Card>
      <Button onClick={calculate} className="bg-indigo-600 hover:bg-indigo-700 w-full">Calculate PN Requirements</Button>
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
            {[
              { l: "Glucose", v: `${result.glucose_gkg} g/kg/day`, sub: `(${result.kcal_from_glucose} kcal)`, c: "yellow" },
              { l: "Amino Acids", v: `${result.aa_gkg} g/kg/day`, sub: `(${result.aa_g} g total)`, c: "indigo" },
              { l: "Lipid Emulsion", v: `${result.lipid_gkg} g/kg/day`, sub: `(${result.kcal_from_lipid} kcal)`, c: "orange" },
              { l: "Total Energy", v: `${result.total_kcal} kcal`, sub: "Non-protein: adjust", c: "teal" },
            ].map(s => (
              <Card key={s.l} className={`border-${s.c}-200 bg-${s.c}-50`}>
                <CardContent className="p-3">
                  <div className={`font-bold text-${s.c}-700`}>{s.v}</div>
                  <div className="text-slate-400">{s.sub}</div>
                  <div className="text-slate-500 mt-0.5">{s.l}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">PN Component Volumes</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-1">
              <div className="flex justify-between p-2 bg-yellow-50 rounded">
                <span>10% Dextrose</span><span className="font-semibold">{result.dextrose_vol} mL</span>
              </div>
              <div className="flex justify-between p-2 bg-indigo-50 rounded">
                <span>10% Amino Acids</span><span className="font-semibold">{result.aa_vol} mL</span>
              </div>
              <div className="flex justify-between p-2 bg-orange-50 rounded">
                <span>20% Lipid Emulsion</span><span className="font-semibold">{result.lipid_vol} mL</span>
              </div>
              <div className="flex justify-between p-2 bg-teal-50 rounded font-semibold">
                <span>Total Daily Volume</span><span>{result.total_vol} mL/day ({Math.round(result.total_vol/24)} mL/hr)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── AI Nutrition Assistant ────────────────────────────────────────────────
function AIAssistant({ patientData }) {
  const [labs, setLabs] = useState({ k: "", po4: "", urea: "", albumin: "", hb: "" });
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setLabs(l => ({ ...l, [k]: v }));

  const getAdvice = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Pediatric nephrology nutrition AI assistant. Labs: K=${labs.k} mEq/L, PO4=${labs.po4} mg/dL, Urea=${labs.urea} mg/dL, Albumin=${labs.albumin} g/dL, Hb=${labs.hb} g/dL. Condition: ${patientData?.condition || "CKD"}, Weight: ${patientData?.euvolemic_weight || "unknown"}kg.
        
        Based on PRNT 2020 and KDIGO guidelines, provide:
        1. Dietary modifications based on these labs
        2. Red flag alerts (if any critical values)
        3. Specific foods to avoid/include
        4. Supplement recommendations
        
        Output JSON with: diet_modifications (array), red_flags (array), foods_to_avoid (array), foods_to_include (array), supplements (array)`,
        response_json_schema: {
          type: "object",
          properties: {
            diet_modifications: { type: "array", items: { type: "string" } },
            red_flags: { type: "array", items: { type: "string" } },
            foods_to_avoid: { type: "array", items: { type: "string" } },
            foods_to_include: { type: "array", items: { type: "string" } },
            supplements: { type: "array", items: { type: "string" } }
          }
        }
      });
      setAdvice(res);
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <GuidelineTag sources={["PRNT 2020", "KDIGO AKI 2012"]} module="AI Nutrition Assistant" compact />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-teal-600" /> Lab → Diet Converter (AI)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
            {[["k","K (mEq/L)"],["po4","PO4 (mg/dL)"],["urea","Urea (mg/dL)"],["albumin","Albumin (g/dL)"],["hb","Hb (g/dL)"]].map(([k,l]) => (
              <div key={k}>
                <label className="text-xs text-slate-500 mb-1 block">{l}</label>
                <Input type="number" value={labs[k]} onChange={e => set(k, e.target.value)} className="text-sm" placeholder="—" />
              </div>
            ))}
          </div>
          <Button onClick={getAdvice} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing...</> : "Get AI Dietary Advice"}
          </Button>
        </CardContent>
      </Card>
      {advice && (
        <div className="grid md:grid-cols-2 gap-3">
          {advice.red_flags?.length > 0 && (
            <Alert className="border-red-300 bg-red-50 md:col-span-2">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong className="text-red-700">Red Flag Alerts:</strong>
                {advice.red_flags.map((f,i) => <p key={i} className="text-xs text-red-700 mt-0.5">⚠️ {f}</p>)}
              </AlertDescription>
            </Alert>
          )}
          {[
            { title: "Dietary Modifications", key: "diet_modifications", color: "teal" },
            { title: "Foods to Avoid", key: "foods_to_avoid", color: "red" },
            { title: "Foods to Include", key: "foods_to_include", color: "green" },
            { title: "Supplements", key: "supplements", color: "blue" },
          ].map(section => (
            <Card key={section.key} className={`border-${section.color}-200 bg-${section.color}-50`}>
              <CardContent className="p-3">
                <p className={`text-xs font-semibold text-${section.color}-700 mb-2`}>{section.title}</p>
                {advice[section.key]?.map((item, i) => (
                  <p key={i} className={`text-xs text-${section.color}-800 mb-0.5`}>• {item}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function NutritionAdvancedTools({ patientData }) {
  return (
    <div className="mt-4">
      <Tabs defaultValue="tube">
        <TabsList className="grid grid-cols-3 mb-4 w-full">
          <TabsTrigger value="tube" className="text-xs">Tube Feeding</TabsTrigger>
          <TabsTrigger value="pn" className="text-xs">Parenteral Nutrition</TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">AI Lab Advisor</TabsTrigger>
        </TabsList>
        <TabsContent value="tube"><TubeFeedingPlanner patientData={patientData} /></TabsContent>
        <TabsContent value="pn"><ParenteralNutritionPlanner /></TabsContent>
        <TabsContent value="ai"><AIAssistant patientData={patientData} /></TabsContent>
      </Tabs>
    </div>
  );
}