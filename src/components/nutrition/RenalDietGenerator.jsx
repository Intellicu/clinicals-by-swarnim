import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import {
  Apple, Printer, ChevronDown, ChevronRight, AlertTriangle,
  Loader2, Utensils, Droplet, Info, CheckCircle, XCircle
} from "lucide-react";

const DIAGNOSES = [
  "Nephrotic Syndrome (Active Relapse)",
  "Nephrotic Syndrome (Remission)",
  "CKD Stage 1-2",
  "CKD Stage 3",
  "CKD Stage 4-5",
  "AKI (Oliguric)",
  "AKI (Recovering)",
  "Kidney Stones (Calcium Oxalate)",
  "Kidney Stones (Uric Acid)",
  "Hypertension",
  "Post-Transplant",
  "Steroid-Dependent NS",
  "JIA / Rheumatology on Steroids",
  "Obesity + Metabolic",
];

const CKD_STAGES = ["Not applicable", "Stage 1 (GFR >90)", "Stage 2 (GFR 60-89)", "Stage 3 (GFR 30-59)", "Stage 4 (GFR 15-29)", "Stage 5 / Dialysis"];

const QUICK_CARDS = [
  { title: "Low Sodium Diet", color: "bg-blue-50 border-blue-200", icon: "🧂", rules: ["<2g/day sodium for NS/HTN/CKD", "Avoid: papad, pickles, sauces, packaged snacks, namkeen", "Use: rock salt in tiny quantities only", "Prefer: fresh home-cooked dal, sabzi, roti", "Check: bread labels (high hidden sodium)"] },
  { title: "Low Potassium Diet", color: "bg-orange-50 border-orange-200", icon: "⚡", rules: ["For CKD 4-5 or hyperkalemia", "Avoid: banana, orange, coconut water, tomato", "Avoid: spinach, potato skin, dried fruits", "Prefer: rice, white bread, apple, pear", "Leaching: boil vegetables, discard water"] },
  { title: "Low Phosphorus Diet", color: "bg-purple-50 border-purple-200", icon: "🦴", rules: ["For CKD 3+ or elevated phosphate", "Avoid: dairy (milk, curd, paneer) in excess", "Avoid: nuts, seeds, cola drinks, processed cheese", "Prefer: rice over wheat, egg white over yolk", "Take phosphate binders WITH food"] },
  { title: "Stone Prevention", color: "bg-green-50 border-green-200", icon: "💧", rules: ["High fluid intake: 2L/m²/day minimum", "Calcium oxalate: avoid spinach, beet, nuts, chocolate, tea", "Low sodium: reduces urinary calcium", "Adequate calcium: 1000-1200mg/day from diet", "Reduce animal protein (uric acid stones)"] },
  { title: "Anti-Inflammatory (Rheum)", color: "bg-rose-50 border-rose-200", icon: "🌿", rules: ["Omega-3 rich: flaxseeds, walnuts, fatty fish", "Antioxidants: berries, turmeric, ginger, amla", "Avoid: processed food, refined sugar, trans fats", "Mediterranean-style: vegetables, fruits, olive oil", "Vitamin D optimization: sunlight + dietary sources"] },
  { title: "Steroid Diet Counseling", color: "bg-amber-50 border-amber-200", icon: "💊", rules: ["Restrict sodium: prevents steroid-induced edema/HTN", "Calcium + Vitamin D: osteoporosis prevention", "Low simple sugar: prevents steroid diabetes", "High protein foods: reduces muscle wasting", "Calorie monitoring: prevent steroid-related obesity"] },
];

function QuickCounselingCards() {
  const [open, setOpen] = useState(null);
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {QUICK_CARDS.map((card, i) => (
        <div key={i} className={`border-2 rounded-xl overflow-hidden ${card.color}`}>
          <button
            className="w-full flex items-center justify-between p-3"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{card.icon}</span>
              <span className="font-semibold text-sm text-slate-800">{card.title}</span>
            </div>
            {open === i ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          </button>
          {open === i && (
            <div className="px-3 pb-3 space-y-1.5">
              {card.rules.map((r, j) => (
                <div key={j} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function RenalDietGenerator() {
  const [form, setForm] = useState({
    age: "", weight: "", diagnosis: DIAGNOSES[0], ckd_stage: CKD_STAGES[0],
    potassium_high: false, phosphorus_high: false, edema: false,
    steroid_use: false, obesity: false, vegetarian: true
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("generator");

  const handleGenerate = async () => {
    if (!form.age || !form.weight) return;
    setLoading(true);
    try {
      const prompt = `You are a pediatric renal dietitian. Generate a detailed, practical renal diet plan for a child.

Patient Details:
- Age: ${form.age} years
- Weight: ${form.weight} kg
- Diagnosis: ${form.diagnosis}
- CKD Stage: ${form.ckd_stage}
- Elevated Potassium: ${form.potassium_high}
- Elevated Phosphorus: ${form.phosphorus_high}
- Edema present: ${form.edema}
- On Steroids: ${form.steroid_use}
- Obesity risk: ${form.obesity}
- Diet type: ${form.vegetarian ? "Vegetarian (Indian)" : "Non-vegetarian (Indian)"}

Generate a comprehensive diet plan with these sections:
1. CALORIC TARGETS - Total calories/day, protein (g/kg/day), fluid (mL/day), sodium (mg/day)
2. DAILY MEAL PLAN - Breakfast, Mid-morning, Lunch, Afternoon snack, Dinner (with Indian food examples)
3. FOODS TO AVOID - Specific list with reasons
4. FOODS ALLOWED FREELY - Safe options
5. FLUID ADVICE - Daily target, tips for compliance
6. SALT RESTRICTION - Practical tips for Indian kitchen
7. PARENT COUNSELING POINTS - 5 simple points for parents
8. MONITORING PARAMETERS - What to track at home

Make all food examples culturally appropriate for Indian families. Use practical quantities (e.g., "1 katori", "2 rotis"). For NS/steroid patients emphasize sodium restriction. For CKD, modify protein. Keep language parent-friendly.

Return as structured JSON with these exact keys: caloric_targets, daily_meal_plan, foods_avoid, foods_allowed, fluid_advice, salt_tips, parent_counseling, monitoring`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            caloric_targets: { type: "object", additionalProperties: true },
            daily_meal_plan: { type: "object", additionalProperties: true },
            foods_avoid: { type: "array", items: { type: "string" } },
            foods_allowed: { type: "array", items: { type: "string" } },
            fluid_advice: { type: "string" },
            salt_tips: { type: "array", items: { type: "string" } },
            parent_counseling: { type: "array", items: { type: "string" } },
            monitoring: { type: "array", items: { type: "string" } }
          }
        }
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-2 bg-white rounded-xl border p-1 shadow-sm">
        {[
          { id: "generator", label: "Diet Generator", icon: "🔬" },
          { id: "quick", label: "Quick Counseling Cards", icon: "📋" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? "bg-teal-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"}`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === "quick" ? (
        <QuickCounselingCards />
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Input form */}
          <div className="lg:col-span-2 space-y-3">
            <Card className="border-2 border-teal-200">
              <CardHeader className="pb-2 bg-teal-50">
                <CardTitle className="text-sm flex items-center gap-2 text-teal-800">
                  <Apple className="w-4 h-4" /> Patient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Age (years)</Label>
                    <Input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="e.g. 8" className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Weight (kg)</Label>
                    <Input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 25" className="h-8 text-sm" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Diagnosis</Label>
                  <select className="w-full border rounded-md h-8 text-xs px-2 bg-white" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })}>
                    {DIAGNOSES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">CKD Stage</Label>
                  <select className="w-full border rounded-md h-8 text-xs px-2 bg-white" value={form.ckd_stage} onChange={e => setForm({ ...form, ckd_stage: e.target.value })}>
                    {CKD_STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "potassium_high", label: "High Potassium" },
                    { key: "phosphorus_high", label: "High Phosphorus" },
                    { key: "edema", label: "Edema Present" },
                    { key: "steroid_use", label: "On Steroids" },
                    { key: "obesity", label: "Obesity Risk" },
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" checked={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.checked })} className="rounded" />
                      {f.label}
                    </label>
                  ))}
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={form.vegetarian} onChange={e => setForm({ ...form, vegetarian: e.target.checked })} className="rounded" />
                    Vegetarian
                  </label>
                </div>
                <Button onClick={handleGenerate} disabled={loading || !form.age || !form.weight} className="w-full bg-teal-600 hover:bg-teal-700">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Apple className="w-4 h-4 mr-2" /> Generate Diet Plan</>}
                </Button>
              </CardContent>
            </Card>

            {/* References */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-blue-800 mb-2">📚 References</p>
                {["KDOQI Pediatric Nutrition 2009", "PRNT (Pediatric Renal Nutrition Taskforce) 2020", "ISPN Nephrotic Syndrome Guidelines", "WHO Growth Standards", "AIIMS Pediatric Nephrology Protocols"].map(r => (
                  <p key={r} className="text-xs text-blue-700">• {r}</p>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Result */}
          <div className="lg:col-span-3">
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-xl border-2 border-dashed">
                <Utensils className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-medium">Enter patient details and generate a personalized renal diet plan</p>
                <p className="text-sm mt-1">Includes Indian food examples, meal plans, and parent counseling</p>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border-2">
                <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-3" />
                <p className="text-slate-600 font-medium">Generating personalized diet plan...</p>
              </div>
            )}
            {result && !loading && (
              <div className="space-y-3">
                {/* Caloric targets */}
                <Card className="border-2 border-teal-300 bg-teal-50">
                  <CardContent className="p-4">
                    <p className="font-bold text-teal-800 text-sm mb-2">🎯 Caloric & Nutrient Targets</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.caloric_targets || {}).map(([k, v]) => (
                        <div key={k} className="bg-white rounded-lg p-2 text-center border border-teal-200">
                          <p className="text-xs text-slate-500 capitalize">{k.replace(/_/g, ' ')}</p>
                          <p className="font-bold text-sm text-teal-700">{String(v)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Meal plan */}
                {result.daily_meal_plan && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-bold text-slate-800 text-sm mb-3">🍽️ Daily Meal Plan</p>
                      <div className="space-y-2">
                        {Object.entries(result.daily_meal_plan).map(([meal, items]) => (
                          <div key={meal} className="border rounded-lg p-3 bg-amber-50 border-amber-200">
                            <p className="text-xs font-bold text-amber-800 mb-1 capitalize">{meal.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-slate-700">{Array.isArray(items) ? items.join(", ") : String(items)}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Foods avoid + allowed */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <p className="font-bold text-red-800 text-xs mb-2">🚫 Foods to AVOID</p>
                      {(result.foods_avoid || []).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-red-800 mb-1">
                          <XCircle className="w-3 h-3 flex-shrink-0" /> {f}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <p className="font-bold text-green-800 text-xs mb-2">✅ ALLOWED Freely</p>
                      {(result.foods_allowed || []).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-green-800 mb-1">
                          <CheckCircle className="w-3 h-3 flex-shrink-0" /> {f}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Fluid + salt + counseling */}
                {result.fluid_advice && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <p className="font-bold text-blue-800 text-xs mb-1"><Droplet className="w-3 h-3 inline mr-1" />Fluid Advice</p>
                      <p className="text-xs text-blue-800">{result.fluid_advice}</p>
                    </CardContent>
                  </Card>
                )}

                {result.parent_counseling && (
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <p className="font-bold text-purple-800 text-xs mb-2">👨‍👩‍👧 Parent Counseling Points</p>
                      {result.parent_counseling.map((p, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-purple-800 mb-1.5">
                          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {result.monitoring && (
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4">
                      <p className="font-bold text-slate-700 text-xs mb-2">📊 Home Monitoring</p>
                      {result.monitoring.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700 mb-1">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600" /> {m}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <Button onClick={() => window.print()} variant="outline" className="w-full gap-2">
                  <Printer className="w-4 h-4" /> Print Diet Counseling Sheet
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}