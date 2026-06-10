import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Apple, Activity, FlaskConical, Settings, Utensils,
  Loader2, Printer, ChevronDown, ChevronRight, ChevronUp,
  AlertTriangle, CheckCircle, XCircle, Droplet, Info
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import NutritionAssessment from "../components/nutrition/NutritionAssessment";
import NutritionPrescription from "../components/nutrition/NutritionPrescription";
import NutritionAdvancedTools from "../components/nutrition/NutritionAdvancedTools";

// ─── Data ────────────────────────────────────────────────────────────────────

const DIAGNOSES = [
  "Nephrotic Syndrome (Active Relapse)",
  "Nephrotic Syndrome (Remission)",
  "CKD Stage 1-2", "CKD Stage 3", "CKD Stage 4-5",
  "AKI (Oliguric)", "AKI (Recovering)",
  "Kidney Stones (Calcium Oxalate)", "Kidney Stones (Uric Acid)",
  "Hypertension", "Post-Transplant", "Steroid-Dependent NS",
  "JIA / Rheumatology on Steroids", "Obesity + Metabolic",
];
const CKD_STAGES = ["Not applicable","Stage 1 (GFR >90)","Stage 2 (GFR 60-89)","Stage 3 (GFR 30-59)","Stage 4 (GFR 15-29)","Stage 5 / Dialysis"];

const FOOD_DB = [
  { name:"Banana", k:"high", p:"moderate", fluid:"low", kcal:89, protein:1.1, group:"Fruit" },
  { name:"Potato (boiled)", k:"high", p:"moderate", fluid:"moderate", kcal:77, protein:2.0, group:"Vegetable" },
  { name:"Tomato", k:"high", p:"low", fluid:"high", kcal:18, protein:0.9, group:"Vegetable" },
  { name:"Orange", k:"high", p:"low", fluid:"high", kcal:47, protein:0.9, group:"Fruit" },
  { name:"Spinach", k:"high", p:"moderate", fluid:"moderate", kcal:23, protein:2.9, group:"Vegetable" },
  { name:"Apple", k:"low", p:"low", fluid:"moderate", kcal:52, protein:0.3, group:"Fruit" },
  { name:"Grapes", k:"low", p:"low", fluid:"moderate", kcal:69, protein:0.7, group:"Fruit" },
  { name:"Cabbage (leached)", k:"low", p:"low", fluid:"moderate", kcal:25, protein:1.3, group:"Vegetable" },
  { name:"Cauliflower (leached)", k:"low", p:"low", fluid:"moderate", kcal:25, protein:2.0, group:"Vegetable" },
  { name:"White rice", k:"low", p:"low", fluid:"moderate", kcal:130, protein:2.7, group:"Cereal" },
  { name:"Chapati (1)", k:"low", p:"low", fluid:"low", kcal:70, protein:2.5, group:"Cereal" },
  { name:"Milk (200ml)", k:"moderate", p:"high", fluid:"high", kcal:122, protein:6.4, group:"Dairy" },
  { name:"Cheese (30g)", k:"low", p:"high", fluid:"low", kcal:113, protein:7.0, group:"Dairy" },
  { name:"Nuts (30g)", k:"moderate", p:"high", fluid:"low", kcal:170, protein:5.0, group:"Nuts" },
  { name:"Cola/Soda (250ml)", k:"low", p:"high", fluid:"high", kcal:105, protein:0, group:"Drink" },
  { name:"Egg white (1)", k:"low", p:"low", fluid:"low", kcal:17, protein:3.6, group:"Protein" },
  { name:"Dal (lentils, 100g)", k:"moderate", p:"moderate", fluid:"moderate", kcal:116, protein:9.0, group:"Legume" },
  { name:"Watermelon (slice)", k:"low", p:"low", fluid:"high", kcal:30, protein:0.6, group:"Fruit" },
  { name:"Cucumber", k:"low", p:"low", fluid:"high", kcal:16, protein:0.7, group:"Vegetable" },
  { name:"Curd/Yogurt (100g)", k:"moderate", p:"moderate", fluid:"high", kcal:61, protein:3.5, group:"Dairy" },
];

const QUICK_CARDS = [
  { title:"Low Sodium Diet", color:"bg-blue-50 border-blue-200", icon:"🧂", rules:["<2g/day sodium for NS/HTN/CKD","Avoid: papad, pickles, sauces, packaged snacks","Use: rock salt in tiny quantities only","Prefer: fresh home-cooked dal, sabzi, roti","Check: bread labels (high hidden sodium)"] },
  { title:"Low Potassium Diet", color:"bg-orange-50 border-orange-200", icon:"⚡", rules:["For CKD 4-5 or hyperkalemia","Avoid: banana, orange, coconut water, tomato","Avoid: spinach, potato skin, dried fruits","Prefer: rice, white bread, apple, pear","Leaching: boil vegetables, discard water"] },
  { title:"Low Phosphorus Diet", color:"bg-purple-50 border-purple-200", icon:"🦴", rules:["For CKD 3+ or elevated phosphate","Avoid: dairy (milk, curd, paneer) in excess","Avoid: nuts, seeds, cola drinks, processed cheese","Prefer: rice over wheat, egg white over yolk","Take phosphate binders WITH food"] },
  { title:"Stone Prevention", color:"bg-green-50 border-green-200", icon:"💧", rules:["High fluid intake: 2L/m²/day minimum","Calcium oxalate: avoid spinach, beet, nuts, chocolate","Low sodium: reduces urinary calcium","Adequate calcium: 1000-1200mg/day from diet","Reduce animal protein (uric acid stones)"] },
  { title:"Anti-Inflammatory (Rheum)", color:"bg-rose-50 border-rose-200", icon:"🌿", rules:["Omega-3 rich: flaxseeds, walnuts, fatty fish","Antioxidants: berries, turmeric, ginger, amla","Avoid: processed food, refined sugar, trans fats","Mediterranean-style: vegetables, fruits, olive oil","Vitamin D optimization: sunlight + dietary sources"] },
  { title:"Steroid Diet Counseling", color:"bg-amber-50 border-amber-200", icon:"💊", rules:["Restrict sodium: prevents steroid-induced edema/HTN","Calcium + Vitamin D: osteoporosis prevention","Low simple sugar: prevents steroid diabetes","High protein foods: reduces muscle wasting","Calorie monitoring: prevent steroid-related obesity"] },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuickCounselingCards() {
  const [open, setOpen] = useState(null);
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {QUICK_CARDS.map((card, i) => (
        <div key={i} className={`border-2 rounded-xl overflow-hidden ${card.color}`}>
          <button className="w-full flex items-center justify-between p-3" onClick={() => setOpen(open === i ? null : i)}>
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
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" /><span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FoodReferenceDB() {
  const [filterK, setFilterK] = useState("all");
  const [filterP, setFilterP] = useState("all");
  const filtered = FOOD_DB.filter(f => {
    if (filterK !== "all" && f.k !== filterK) return false;
    if (filterP !== "all" && f.p !== filterP) return false;
    return true;
  });
  const BADGE_K = { high:"bg-red-100 text-red-700", moderate:"bg-yellow-100 text-yellow-700", low:"bg-green-100 text-green-700" };
  const BADGE_P = { high:"bg-orange-100 text-orange-700", moderate:"bg-yellow-100 text-yellow-700", low:"bg-green-100 text-green-700" };
  return (
    <div>
      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <span className="text-xs font-semibold text-slate-500">Filter K:</span>
        {[["all","All"],["low","Low K"],["high","High K"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilterK(v)} className={`px-2.5 py-1 text-xs rounded-full border font-medium ${filterK===v ? "bg-green-600 text-white border-green-600" : "bg-white text-slate-600 border-slate-300"}`}>{l}</button>
        ))}
        <span className="text-slate-300 mx-1">|</span>
        <span className="text-xs font-semibold text-slate-500">Filter P:</span>
        {[["all","All"],["low","Low P"],["high","High P"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilterP(v)} className={`px-2.5 py-1 text-xs rounded-full border font-medium ${filterP===v ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-300"}`}>{l}</button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100 border-b">
              <th className="text-left p-2 font-semibold">Food</th>
              <th className="text-center p-2 font-semibold">Group</th>
              <th className="text-center p-2 font-semibold">K</th>
              <th className="text-center p-2 font-semibold">Phosphate</th>
              <th className="text-center p-2 font-semibold">Fluid</th>
              <th className="text-center p-2 font-semibold">kcal</th>
              <th className="text-center p-2 font-semibold">Protein(g)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => (
              <tr key={i} className="border-b hover:bg-slate-50">
                <td className="p-2 font-medium">{f.name}</td>
                <td className="p-2 text-center text-slate-500">{f.group}</td>
                <td className="p-2 text-center"><Badge className={`text-xs border-0 ${BADGE_K[f.k]}`}>{f.k}</Badge></td>
                <td className="p-2 text-center"><Badge className={`text-xs border-0 ${BADGE_P[f.p]}`}>{f.p}</Badge></td>
                <td className="p-2 text-center"><Badge className={`text-xs border-0 ${f.fluid==="high" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{f.fluid}</Badge></td>
                <td className="p-2 text-center">{f.kcal}</td>
                <td className="p-2 text-center">{f.protein}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Diet Tool (unified AI generator + condition planner + food DB) ──────

function DietTool({ patientData }) {
  const [form, setForm] = useState({
    age: patientData?.age || "", weight: patientData?.euvolemic_weight || "",
    diagnosis: DIAGNOSES[0], ckd_stage: CKD_STAGES[0],
    potassium_high: false, phosphorus_high: false, edema: false,
    steroid_use: false, obesity: false, vegetarian: true
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState("generator"); // generator | planner | cards | fooddb

  const handleGenerate = async () => {
    if (!form.age || !form.weight) return;
    setLoading(true);
    try {
      const prompt = `You are a pediatric renal dietitian. Generate a detailed, practical diet plan for a child.

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
1. CALORIC TARGETS - Total calories/day, protein (g/kg/day), fluid (mL/day), sodium (mg/day), potassium target, phosphorus target
2. DAILY MEAL PLAN - Breakfast, Mid-morning, Lunch, Afternoon snack, Dinner (with Indian food examples and specific portions)
3. FOODS TO AVOID - Specific list with reasons
4. FOODS ALLOWED FREELY - Safe options
5. FLUID ADVICE - Daily target and practical compliance tips
6. SALT RESTRICTION - Practical tips for Indian kitchen
7. PARENT COUNSELING POINTS - 5 actionable points
8. HOME MONITORING - Parameters to track

Make all food examples culturally appropriate for Indian families. Use practical quantities. 
Return as structured JSON with keys: caloric_targets, daily_meal_plan, foods_avoid, foods_allowed, fluid_advice, salt_tips, parent_counseling, monitoring`;

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
      {/* Section switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id:"generator", label:"AI Diet Generator", icon:"🤖" },
          { id:"planner", label:"Diet Planner", icon:"📋" },
          { id:"cards", label:"Counseling Cards", icon:"💡" },
          { id:"fooddb", label:"Food Reference DB", icon:"🥗" },
        ].map(t => (
          <button key={t.id} onClick={() => setSection(t.id)}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${section === t.id ? "bg-teal-600 text-white border-teal-600 shadow" : "bg-white text-slate-700 border-slate-200 hover:border-teal-400"}`}>
            <span>{t.icon}</span><span className="hidden sm:inline">{t.label}</span><span className="sm:hidden">{t.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* AI Diet Generator */}
      {section === "generator" && (
        <div className="grid lg:grid-cols-5 gap-4">
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
                    { key:"potassium_high", label:"High Potassium" },
                    { key:"phosphorus_high", label:"High Phosphorus" },
                    { key:"edema", label:"Edema Present" },
                    { key:"steroid_use", label:"On Steroids" },
                    { key:"obesity", label:"Obesity Risk" },
                    { key:"vegetarian", label:"Vegetarian" },
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" checked={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.checked })} className="rounded" />
                      {f.label}
                    </label>
                  ))}
                </div>
                <Button onClick={handleGenerate} disabled={loading || !form.age || !form.weight} className="w-full bg-teal-600 hover:bg-teal-700">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Apple className="w-4 h-4 mr-2" />Generate AI Diet Plan</>}
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-blue-800 mb-2">📚 Evidence Base</p>
                {["KDOQI Pediatric Nutrition 2009","PRNT (Pediatric Renal Nutrition Taskforce) 2020","ISPN Nephrotic Syndrome Guidelines","WHO Growth Standards","AIIMS Pediatric Nephrology Protocols"].map(r => (
                  <p key={r} className="text-xs text-blue-700">• {r}</p>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-xl border-2 border-dashed">
                <Utensils className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-medium text-sm">Enter patient details and generate a personalized diet plan</p>
                <p className="text-xs mt-1 text-slate-400">Includes Indian food examples, meal plans & parent counseling</p>
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
                <Card className="border-2 border-teal-300 bg-teal-50">
                  <CardContent className="p-4">
                    <p className="font-bold text-teal-800 text-sm mb-2">🎯 Caloric & Nutrient Targets</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(result.caloric_targets || {}).map(([k, v]) => (
                        <div key={k} className="bg-white rounded-lg p-2 text-center border border-teal-200">
                          <p className="text-xs text-slate-500 capitalize">{k.replace(/_/g, ' ')}</p>
                          <p className="font-bold text-sm text-teal-700">{String(v)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

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

                {result.fluid_advice && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <p className="font-bold text-blue-800 text-xs mb-1"><Droplet className="w-3 h-3 inline mr-1" />Fluid Advice</p>
                      <p className="text-xs text-blue-800">{result.fluid_advice}</p>
                    </CardContent>
                  </Card>
                )}

                {result.salt_tips && result.salt_tips.length > 0 && (
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4">
                      <p className="font-bold text-slate-700 text-xs mb-2">🧂 Salt Restriction Tips</p>
                      {result.salt_tips.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700 mb-1">
                          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" /><span>{t}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {result.parent_counseling && (
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <p className="font-bold text-purple-800 text-xs mb-2">👨‍👩‍👧 Parent Counseling Points</p>
                      {result.parent_counseling.map((p, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-purple-800 mb-1.5">
                          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><span>{p}</span>
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

      {/* Condition-based Diet Planner */}
      {section === "planner" && <ConditionDietPlanner patientData={patientData} />}

      {/* Quick Counseling Cards */}
      {section === "cards" && <QuickCounselingCards />}

      {/* Food Reference DB */}
      {section === "fooddb" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">🥗 Food Reference Database — K / Phosphate / Fluid Tagging</CardTitle>
          </CardHeader>
          <CardContent><FoodReferenceDB /></CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Condition-based planner (from NutritionDietPlanner) ────────────────────

const CONDITION_RESTRICTIONS = {
  AKI: { avoid_k:"high", avoid_p:"high", fluid_restrict:true, notes:["Leach vegetables to reduce K","Avoid phosphate-rich dairy in oliguric AKI","Fluid restrict to urine output + insensible losses"] },
  CKD: { avoid_k:null, avoid_p:"high", fluid_restrict:false, notes:["Phosphate binders with meals for CKD ≥ Stage 3","Leach high-K vegetables if hyperkalemic","Encourage adequate calories to prevent catabolism"] },
  Dialysis: { avoid_k:"high", avoid_p:"high", fluid_restrict:true, notes:["HD: Restrict fluid to prevent excess interdialytic weight gain","Use phosphate binders with all meals","High-protein needed but choose low-phosphate sources"] },
  Hyperkalemia: { avoid_k:"high", avoid_p:null, fluid_restrict:false, notes:["Avoid raw vegetables — leach or boil to reduce K by 30-50%","Avoid K supplements, salt substitutes","Avoid dried fruits, coconut, nuts"] },
  Hyperphosphatemia: { avoid_k:null, avoid_p:"high", fluid_restrict:false, notes:["Avoid cola drinks (80% inorganic phosphate absorbed)","Prefer egg white over yolk","Limit dairy; use phosphate-free formula if needed"] },
  NS: { avoid_k:null, avoid_p:null, fluid_restrict:false, notes:["Strict sodium restriction <1-2g/day","Normal protein unless CKD co-exists","High calcium + Vitamin D during steroid use"] },
  Other: { avoid_k:null, avoid_p:null, fluid_restrict:false, notes:["Standard balanced diet"] },
};

const MEAL_TEMPLATES = {
  AKI: { breakfast:["White rice porridge (1 cup)","Egg white omelette (2)","Apple (small, 100g)","Water 100mL"], lunch:["Chapati x2","Leached cauliflower sabzi","Dal (small portion, low K)","Cucumber salad"], dinner:["White rice (1 cup)","Boiled chicken (100g, no skin)","Leached cabbage","Clear soup (low K)"], snacks:["Apple slices","Grapes (small bunch)"] },
  CKD: { breakfast:["Semolina upma (1 cup)","Egg white (2)","Grapes","Milk (restricted 100mL)"], lunch:["Chapati x2","Mixed leached sabzi","Small portion of dal","Rice (1 cup)"], dinner:["Chapati x2","Paneer (small, low-P)","Leached greens","Curd 50g (limited)"], snacks:["Apple","Plain biscuits (low-P)"] },
  Dialysis: { breakfast:["White bread x2 slices","Egg white omelette (3)","Apple","Water 150mL"], lunch:["Rice (1.5 cups)","Chicken/fish (150g, boiled)","Leached vegetables","Limited fluids"], dinner:["Chapati x2","Dal (100g)","Leached sabzi","Small portion curd"], snacks:["Grapes","Plain crackers (low-phosphate)"] },
  NS: { breakfast:["Oats (unsalted, 1 cup)","Egg white (2)","Apple","No added salt"], lunch:["Chapati x2 (no salt)","Dal","Low-salt sabzi","Curd (small)"], dinner:["Rice (1 cup)","Chicken/paneer (plain)","Steamed vegetables","No pickles or papad"], snacks:["Banana (if non-edematous)","Unsalted crackers"] },
};

function ConditionDietPlanner({ patientData }) {
  const [condition, setCondition] = useState("AKI");
  const [loading, setLoading] = useState(false);
  const [aiMealPlan, setAiMealPlan] = useState(null);

  const restrictions = CONDITION_RESTRICTIONS[condition] || CONDITION_RESTRICTIONS.Other;
  const template = MEAL_TEMPLATES[condition] || MEAL_TEMPLATES.AKI;

  const generateAIPlan = async () => {
    setLoading(true);
    const wt = patientData?.euvolemic_weight || 20;
    const age = patientData?.age || 8;
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a detailed 1-day meal plan for a ${age}-year-old child (${wt}kg) with ${condition}. 
Guidelines: PRNT 2020, KDIGO, KDOQI. Indian food context.
3 main meals + 2 snacks. Include specific portions.
Output JSON: breakfast, midmorning_snack, lunch, evening_snack, dinner (each with items array, total_kcal, total_protein_g), special_notes array.`,
        response_json_schema: {
          type: "object",
          properties: {
            breakfast: { type: "object", properties: { items: { type: "array", items: { type: "string" } }, total_kcal: { type: "number" }, total_protein_g: { type: "number" } } },
            midmorning_snack: { type: "object", properties: { items: { type: "array", items: { type: "string" } }, total_kcal: { type: "number" }, total_protein_g: { type: "number" } } },
            lunch: { type: "object", properties: { items: { type: "array", items: { type: "string" } }, total_kcal: { type: "number" }, total_protein_g: { type: "number" } } },
            evening_snack: { type: "object", properties: { items: { type: "array", items: { type: "string" } }, total_kcal: { type: "number" }, total_protein_g: { type: "number" } } },
            dinner: { type: "object", properties: { items: { type: "array", items: { type: "string" } }, total_kcal: { type: "number" }, total_protein_g: { type: "number" } } },
            special_notes: { type: "array", items: { type: "string" } }
          }
        }
      });
      setAiMealPlan(res);
    } catch {}
    setLoading(false);
  };

  const totalKcal = aiMealPlan ? ["breakfast","midmorning_snack","lunch","evening_snack","dinner"].reduce((s, m) => s + (aiMealPlan[m]?.total_kcal || 0), 0) : null;
  const totalProt = aiMealPlan ? ["breakfast","midmorning_snack","lunch","evening_snack","dinner"].reduce((s, m) => s + (aiMealPlan[m]?.total_protein_g || 0), 0) : null;

  return (
    <div className="space-y-4">
      {/* Condition selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-slate-600">Condition:</span>
            {["AKI","CKD","Dialysis","Hyperkalemia","Hyperphosphatemia","NS","Other"].map(c => (
              <button key={c} onClick={() => { setCondition(c); setAiMealPlan(null); }}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${condition === c ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-700 border-slate-300 hover:border-teal-400"}`}>
                {c}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Restrictions + Template */}
      <div className="grid md:grid-cols-2 gap-3">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Dietary Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {restrictions.notes?.map((n, i) => (
              <div key={i} className="flex gap-2 text-xs text-red-800"><span>•</span><span>{n}</span></div>
            ))}
            <div className="flex flex-wrap gap-1 mt-2">
              {restrictions.avoid_k === "high" && <Badge className="bg-red-200 text-red-800 border-0 text-xs">Restrict High-K Foods</Badge>}
              {restrictions.avoid_p === "high" && <Badge className="bg-orange-200 text-orange-800 border-0 text-xs">Restrict High-Phosphate Foods</Badge>}
              {restrictions.fluid_restrict && <Badge className="bg-blue-200 text-blue-800 border-0 text-xs">Fluid Restriction</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sample Day Template — {condition}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            {Object.entries(template).map(([meal, items]) => (
              <div key={meal}>
                <span className="font-semibold text-slate-700 capitalize">{meal.replace("_"," ")}:</span>
                <span className="text-slate-600 ml-1">{items.join(", ")}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Meal Plan */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Apple className="w-4 h-4 text-teal-600" /> AI Personalized Meal Plan — {condition} (PRNT/KDIGO aligned)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={generateAIPlan} disabled={loading} className="bg-teal-600 hover:bg-teal-700 w-full mb-4">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</> : `Generate AI Meal Plan for ${condition}`}
          </Button>
          {aiMealPlan && (
            <div className="space-y-3">
              {totalKcal && (
                <div className="flex gap-3 text-sm text-center mb-3">
                  <div className="flex-1 bg-teal-50 rounded-lg p-2 border border-teal-200">
                    <div className="font-bold text-teal-700">{Math.round(totalKcal)} kcal</div>
                    <div className="text-xs text-slate-500">Total Energy</div>
                  </div>
                  <div className="flex-1 bg-indigo-50 rounded-lg p-2 border border-indigo-200">
                    <div className="font-bold text-indigo-700">{Math.round(totalProt)}g</div>
                    <div className="text-xs text-slate-500">Total Protein</div>
                  </div>
                </div>
              )}
              {["breakfast","midmorning_snack","lunch","evening_snack","dinner"].map(meal => {
                const m = aiMealPlan[meal];
                if (!m) return null;
                return (
                  <div key={meal} className="p-3 bg-slate-50 rounded-lg border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm capitalize text-slate-700">{meal.replace(/_/g," ")}</span>
                      <span className="text-xs text-slate-500">{m.total_kcal} kcal · {m.total_protein_g}g protein</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-0.5">
                      {m.items?.map((item, i) => <li key={i}>• {item}</li>)}
                    </ul>
                  </div>
                );
              })}
              {aiMealPlan.special_notes?.length > 0 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-xs">
                    <strong>Special Notes:</strong>
                    {aiMealPlan.special_notes.map((n, i) => <span key={i} className="block mt-0.5">• {n}</span>)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NutritionHub() {
  const [patientData, setPatientData] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-green-600 p-5 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Apple className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Clinical Nutrition Hub</h1>
              <p className="text-teal-100 text-xs">Pediatric Nephrology & General Nutrition — PRNT / KDIGO / KDOQI Aligned</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {["PRNT 2020","KDIGO AKI 2012","KDOQI Pediatric 2009","WHO Growth Standards","AIIMS PICU"].map(g => (
              <Badge key={g} className="bg-white/20 text-white border-white/30 text-xs">{g}</Badge>
            ))}
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="diet">
          <TabsList className="flex w-full bg-white border shadow-sm overflow-x-auto h-auto flex-wrap">
            <TabsTrigger value="diet" className="flex items-center gap-1.5 text-xs md:text-sm flex-shrink-0">
              <Utensils className="w-4 h-4" /> Diet Tools
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-1.5 text-xs md:text-sm flex-shrink-0">
              <Activity className="w-4 h-4" /> Assessment
            </TabsTrigger>
            <TabsTrigger value="prescription" className="flex items-center gap-1.5 text-xs md:text-sm flex-shrink-0">
              <FlaskConical className="w-4 h-4" /> Prescription
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1.5 text-xs md:text-sm flex-shrink-0">
              <Settings className="w-4 h-4" /> Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diet" className="mt-4">
            <DietTool patientData={patientData} />
          </TabsContent>
          <TabsContent value="assessment" className="mt-4">
            <NutritionAssessment onPatientData={setPatientData} />
          </TabsContent>
          <TabsContent value="prescription" className="mt-4">
            <NutritionPrescription patientData={patientData} />
          </TabsContent>
          <TabsContent value="advanced" className="mt-4">
            <NutritionAdvancedTools patientData={patientData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}