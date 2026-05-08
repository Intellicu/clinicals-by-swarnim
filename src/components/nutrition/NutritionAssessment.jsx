import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Activity, TrendingDown, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GuidelineTag from "./GuidelineTag";

const MALNUTRITION_LEVELS = [
  { label: "At Risk", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: AlertTriangle },
  { label: "Moderate Malnutrition", color: "bg-orange-100 text-orange-800 border-orange-300", icon: TrendingDown },
  { label: "Severe Malnutrition", color: "bg-red-100 text-red-800 border-red-300", icon: AlertTriangle },
  { label: "Well Nourished", color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle },
];

function calcZScore(actual, median) {
  if (!actual || !median) return null;
  return ((actual - median) / (median * 0.12)).toFixed(1);
}

function classifyWFH(zScore) {
  const z = parseFloat(zScore);
  if (z < -3) return { level: "Severe Malnutrition", alert: true };
  if (z < -2) return { level: "Moderate Malnutrition", alert: true };
  if (z < -1) return { level: "At Risk", alert: false };
  return { level: "Well Nourished", alert: false };
}

function pymsScore(intake, weight, bmi, surgery) {
  let score = 0;
  if (intake === "reduced") score += 1;
  if (intake === "none") score += 2;
  if (weight === "loss") score += 1;
  if (bmi === "low") score += 1;
  if (surgery) score += 2;
  return score;
}

export default function NutritionAssessment({ onPatientData }) {
  const [form, setForm] = useState({
    age_years: "", weight: "", height: "", muac: "", head_circ: "",
    actual_weight: "", dry_weight: "", edema: false,
    intake_status: "normal", recent_weight_loss: false, bmi_low: false, planned_surgery: false,
    condition: "AKI", gender: "male"
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const computeEuvolemicWeight = () => {
    const actual = parseFloat(form.actual_weight);
    const dry = parseFloat(form.dry_weight);
    if (!actual || !dry) return parseFloat(form.weight) || null;
    return dry;
  };

  const assess = async () => {
    setLoading(true);
    const euvoWeight = computeEuvolemicWeight() || parseFloat(form.weight);
    const heightM = parseFloat(form.height) / 100;
    const bmi = euvoWeight && heightM ? (euvoWeight / (heightM * heightM)).toFixed(1) : null;

    // Approximate WHO median weights for z-score (simplified)
    const medianWeightForAge = { 1: 9.6, 2: 12.2, 3: 14.3, 4: 16.3, 5: 18.3, 6: 20.5, 7: 22.9, 8: 25.5, 9: 28.5, 10: 31.9 };
    const medW = medianWeightForAge[Math.round(parseFloat(form.age_years))] || null;
    const waz = medW ? calcZScore(euvoWeight, medW) : null;
    const wfhZ = bmi ? ((parseFloat(bmi) - 16) / 2).toFixed(1) : null;
    const classification = waz ? classifyWFH(waz) : { level: "Insufficient Data", alert: false };

    // PYMS score
    const pyms = pymsScore(
      form.intake_status === "none" ? "none" : form.intake_status === "reduced" ? "reduced" : "ok",
      form.recent_weight_loss ? "loss" : "ok",
      form.bmi_low ? "low" : "ok",
      form.planned_surgery
    );

    let pymsRisk = "Low Risk";
    if (pyms >= 4) pymsRisk = "High Risk — Urgent dietitian review";
    else if (pyms >= 2) pymsRisk = "Medium Risk — Weekly monitoring";
    else if (pyms >= 1) pymsRisk = "Low-Medium Risk — Re-screen in 3 days";

    // STRONGkids simplified
    const strongkids = (form.bmi_low ? 1 : 0) + (form.recent_weight_loss ? 1 : 0) + (form.intake_status !== "normal" ? 1 : 0);
    let strongRisk = strongkids === 0 ? "Low" : strongkids <= 2 ? "Medium" : "High";

    const assessmentData = {
      euvolemic_weight: euvoWeight, height: parseFloat(form.height), bmi,
      waz, wfhZ, classification, pyms, pymsRisk, strongkids, strongRisk,
      muac: parseFloat(form.muac), condition: form.condition, age: parseFloat(form.age_years),
      gender: form.gender, has_edema: form.edema
    };

    setResult(assessmentData);
    onPatientData?.(assessmentData);

    // AI enhancement
    try {
      const aiRes = await base44.integrations.Core.InvokeLLM({
        prompt: `Pediatric nephrology nutrition assessment. Age ${form.age_years}y, Weight ${euvoWeight}kg, Height ${form.height}cm, BMI ${bmi}, MUAC ${form.muac}cm, WAZ ${waz}, Condition: ${form.condition}, Edema: ${form.edema}. PYMS score ${pyms} (${pymsRisk}). Per PRNT 2020 and KDIGO guidelines, provide: 1) Nutrition risk summary 2) Key concerns specific to ${form.condition} 3) Immediate action steps. Be concise, 3-4 bullet points each section.`,
        response_json_schema: {
          type: "object",
          properties: {
            risk_summary: { type: "string" },
            key_concerns: { type: "array", items: { type: "string" } },
            action_steps: { type: "array", items: { type: "string" } }
          }
        }
      });
      setResult(r => ({ ...r, ai_insights: aiRes }));
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  return (
    <div className="space-y-4 mt-4">
      <GuidelineTag sources={["PRNT 2020", "WHO 2006", "PYMS Tool"]} module="Nutrition" />

      {/* Anthropometry */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" /> Anthropometry
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Age (years)", key: "age_years", placeholder: "e.g. 5" },
            { label: "Gender", key: "gender", type: "select", opts: [["male", "Male"], ["female", "Female"]] },
            { label: "Condition", key: "condition", type: "select", opts: [["AKI","AKI"],["CKD","CKD"],["Dialysis","Dialysis"],["Nephrotic","Nephrotic"],["Other","Other"]] },
            { label: "Actual Weight (kg)", key: "actual_weight", placeholder: "Current weight" },
            { label: "Dry/Target Weight (kg)", key: "dry_weight", placeholder: "If edematous" },
            { label: "Height (cm)", key: "height", placeholder: "e.g. 110" },
            { label: "MUAC (cm)", key: "muac", placeholder: "Mid-upper arm circ." },
            { label: "Head Circ. (cm)", key: "head_circ", placeholder: "<2 years" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{f.label}</label>
              {f.type === "select" ? (
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={form[f.key]} onChange={e => set(f.key, e.target.value)}>
                  {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ) : (
                <Input type="number" placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)} className="text-sm" />
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 col-span-2 md:col-span-1">
            <input type="checkbox" id="edema" checked={form.edema} onChange={e => set("edema", e.target.checked)} className="w-4 h-4" />
            <label htmlFor="edema" className="text-sm text-slate-700">Edema present</label>
          </div>
        </CardContent>
      </Card>

      {/* Screening Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nutritional Screening (PYMS + STRONGkids)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Dietary intake status</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.intake_status} onChange={e => set("intake_status", e.target.value)}>
              <option value="normal">Normal intake</option>
              <option value="reduced">Reduced (&lt;75% of needs)</option>
              <option value="none">No oral intake</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "recent_weight_loss", label: "Recent weight loss / poor growth" },
              { key: "bmi_low", label: "Low BMI / wasting" },
              { key: "planned_surgery", label: "Major surgery planned" },
            ].map(item => (
              <label key={item.key} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={form[item.key]} onChange={e => set(item.key, e.target.checked)} className="mt-0.5 w-4 h-4" />
                <span className="text-xs text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>
          <Button onClick={assess} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700">
            {loading ? "Assessing..." : "Run Nutritional Assessment"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Euvolemic Weight", value: `${result.euvolemic_weight?.toFixed(1)} kg`, color: "blue" },
              { label: "BMI", value: result.bmi ? `${result.bmi} kg/m²` : "—", color: "indigo" },
              { label: "WAZ", value: result.waz ?? "—", color: "purple" },
              { label: "MUAC", value: result.muac ? `${result.muac} cm` : "—", color: "teal" },
            ].map(s => (
              <Card key={s.label} className={`border-${s.color}-200 bg-${s.color}-50`}>
                <CardContent className="p-3 text-center">
                  <div className={`text-xl font-bold text-${s.color}-700`}>{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Alert className={result.classification.alert ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Nutritional Status:</strong> {result.classification.level}
                <br /><span className="text-xs">PYMS Score: {result.pyms} — {result.pymsRisk}</span>
                <br /><span className="text-xs">STRONGkids: {result.strongkids}/5 — {result.strongRisk} Risk</span>
              </AlertDescription>
            </Alert>
            {result.ai_insights && (
              <Card className="border-teal-200 bg-teal-50">
                <CardContent className="p-3">
                  <p className="text-xs font-semibold text-teal-700 mb-1">AI Nutrition Insights</p>
                  <p className="text-xs text-slate-700">{result.ai_insights.risk_summary}</p>
                  {result.ai_insights.action_steps?.slice(0,2).map((s,i) => (
                    <p key={i} className="text-xs text-slate-600 mt-0.5">• {s}</p>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}