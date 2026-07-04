import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Apple, AlertTriangle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/client";
import GuidelineTag from "./GuidelineTag";

const FOOD_DB = [
  // High K
  { name: "Banana", k: "high", p: "moderate", fluid: "low", kcal: 89, protein: 1.1, group: "Fruit" },
  { name: "Potato (boiled)", k: "high", p: "moderate", fluid: "moderate", kcal: 77, protein: 2.0, group: "Vegetable" },
  { name: "Tomato", k: "high", p: "low", fluid: "high", kcal: 18, protein: 0.9, group: "Vegetable" },
  { name: "Orange", k: "high", p: "low", fluid: "high", kcal: 47, protein: 0.9, group: "Fruit" },
  { name: "Spinach", k: "high", p: "moderate", fluid: "moderate", kcal: 23, protein: 2.9, group: "Vegetable" },
  { name: "Avocado", k: "high", p: "low", fluid: "low", kcal: 160, protein: 2.0, group: "Fruit" },
  // Low K
  { name: "Apple", k: "low", p: "low", fluid: "moderate", kcal: 52, protein: 0.3, group: "Fruit" },
  { name: "Grapes", k: "low", p: "low", fluid: "moderate", kcal: 69, protein: 0.7, group: "Fruit" },
  { name: "Cabbage (leached)", k: "low", p: "low", fluid: "moderate", kcal: 25, protein: 1.3, group: "Vegetable" },
  { name: "Cauliflower (leached)", k: "low", p: "low", fluid: "moderate", kcal: 25, protein: 2.0, group: "Vegetable" },
  { name: "White rice", k: "low", p: "low", fluid: "moderate", kcal: 130, protein: 2.7, group: "Cereal" },
  { name: "Bread (white)", k: "low", p: "low", fluid: "low", kcal: 265, protein: 9.0, group: "Cereal" },
  // High Phosphate
  { name: "Milk (200ml)", k: "moderate", p: "high", fluid: "high", kcal: 122, protein: 6.4, group: "Dairy" },
  { name: "Cheese (30g)", k: "low", p: "high", fluid: "low", kcal: 113, protein: 7.0, group: "Dairy" },
  { name: "Nuts (30g)", k: "moderate", p: "high", fluid: "low", kcal: 170, protein: 5.0, group: "Nuts" },
  { name: "Cola/Soda (250ml)", k: "low", p: "high", fluid: "high", kcal: 105, protein: 0, group: "Drink" },
  // Low Phosphate
  { name: "Egg white (1)", k: "low", p: "low", fluid: "low", kcal: 17, protein: 3.6, group: "Protein" },
  { name: "Chapati (1)", k: "low", p: "low", fluid: "low", kcal: 70, protein: 2.5, group: "Cereal" },
  { name: "Dal (lentils, 100g)", k: "moderate", p: "moderate", fluid: "moderate", kcal: 116, protein: 9.0, group: "Legume" },
  // Fluid dense
  { name: "Watermelon (slice)", k: "low", p: "low", fluid: "high", kcal: 30, protein: 0.6, group: "Fruit" },
  { name: "Cucumber", k: "low", p: "low", fluid: "high", kcal: 16, protein: 0.7, group: "Vegetable" },
  { name: "Curd/Yogurt (100g)", k: "moderate", p: "moderate", fluid: "high", kcal: 61, protein: 3.5, group: "Dairy" },
];

const CONDITION_RESTRICTIONS = {
  AKI: { avoid_k: "high", avoid_p: "high", fluid_restrict: true, notes: ["Leach vegetables to reduce K", "Avoid phosphate-rich dairy in oliguric AKI", "Fluid restrict to urine output + insensible losses"] },
  CKD: { avoid_k: form => form.stage >= 4 ? "high" : null, avoid_p: "high", fluid_restrict: false, notes: ["Phosphate binders with meals for CKD ≥ Stage 3", "Leach high-K vegetables if hyperkalemic", "Encourage adequate calories to prevent catabolism"] },
  Dialysis: { avoid_k: "high", avoid_p: "high", fluid_restrict: true, notes: ["HD: Restrict fluid to prevent excess interdialytic weight gain", "Use phosphate binders with all meals", "High-protein foods needed but choose low-phosphate sources"] },
  Hyperkalemia: { avoid_k: "high", avoid_p: null, fluid_restrict: false, notes: ["Avoid raw vegetables — leach or boil to reduce K by 30-50%", "Avoid K supplements, salt substitutes", "Avoid dried fruits, coconut, nuts"] },
  Hyperphosphatemia: { avoid_k: null, avoid_p: "high", fluid_restrict: false, notes: ["Avoid cola drinks (high inorganic phosphate — 80% absorbed)", "Prefer egg white over yolk", "Limit dairy; use phosphate-free formula if needed"] },
  Other: { avoid_k: null, avoid_p: null, fluid_restrict: false, notes: ["Standard balanced diet"] },
};

const MEAL_TEMPLATES = {
  AKI: {
    breakfast: ["White rice porridge (1 cup)", "Egg white omelette (2)", "Apple (small, 100g)", "Water 100mL"],
    lunch: ["Chapati x2", "Leached cauliflower sabzi", "Dal (small portion, low K)", "Cucumber salad"],
    dinner: ["White rice (1 cup)", "Boiled chicken (100g, no skin)", "Leached cabbage", "Clear soup (low K)"],
    snacks: ["Apple slices", "Grapes (small bunch)"]
  },
  CKD: {
    breakfast: ["Semolina upma (1 cup)", "Egg white (2)", "Grapes", "Milk (restricted 100mL)"],
    lunch: ["Chapati x2", "Mixed leached sabzi", "Small portion of dal", "Rice (1 cup)"],
    dinner: ["Chapati x2", "Paneer (small, low-P variety)", "Leached greens", "Curd 50g (limited)"],
    snacks: ["Apple", "Plain biscuits (low-P)"]
  },
  Dialysis: {
    breakfast: ["White bread x2 slices", "Egg white omelette (3)", "Apple", "Water 150mL"],
    lunch: ["Rice (1.5 cups)", "Chicken/fish (150g, boiled)", "Leached vegetables", "Limited fluids"],
    dinner: ["Chapati x2", "Dal (100g)", "Leached sabzi", "Small portion curd"],
    snacks: ["Grapes", "Plain crackers (low-phosphate)"]
  },
};

export default function NutritionDietPlanner({ patientData }) {
  const [condition, setCondition] = useState("AKI");
  const [ckdStage, setCkdStage] = useState(3);
  const [loading, setLoading] = useState(false);
  const [aiMealPlan, setAiMealPlan] = useState(null);
  const [showFoodDb, setShowFoodDb] = useState(false);
  const [filterK, setFilterK] = useState("all");
  const [filterP, setFilterP] = useState("all");

  const restrictions = CONDITION_RESTRICTIONS[condition] || CONDITION_RESTRICTIONS.Other;
  const template = MEAL_TEMPLATES[condition] || MEAL_TEMPLATES.AKI;

  const filteredFoods = FOOD_DB.filter(f => {
    if (filterK !== "all" && f.k !== filterK) return false;
    if (filterP !== "all" && f.p !== filterP) return false;
    return true;
  });

  const generateAIPlan = async () => {
    setLoading(true);
    const wt = patientData?.euvolemic_weight || 20;
    const age = patientData?.age || 8;
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a detailed 1-day meal plan for a ${age}-year-old child (${wt}kg) with ${condition}${condition === "CKD" ? ` Stage ${ckdStage}` : ""}. 
Guidelines: PRNT 2020, KDIGO, KDOQI. 
Requirements: 
- Energy: appropriate for ${condition} and weight
- Protein: condition-appropriate (PRNT/KDIGO targets)
- Restrict K and phosphate appropriately
- Indian food context preferred
- Include specific portions in grams or cups
- 3 main meals + 2 snacks
- List approximate kcal and protein per meal
Output JSON with: breakfast, midmorning_snack, lunch, evening_snack, dinner (each with items array, total_kcal, total_protein_g), and special_notes array`,
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
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  const totalKcal = aiMealPlan ? ["breakfast","midmorning_snack","lunch","evening_snack","dinner"].reduce((sum, meal) => sum + (aiMealPlan[meal]?.total_kcal || 0), 0) : null;
  const totalProtein = aiMealPlan ? ["breakfast","midmorning_snack","lunch","evening_snack","dinner"].reduce((sum, meal) => sum + (aiMealPlan[meal]?.total_protein_g || 0), 0) : null;

  return (
    <div className="space-y-4 mt-4">
      <GuidelineTag sources={["PRNT 2020", "KDOQI Pediatric 2009"]} module="Diet Planning" />

      {/* Condition selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-slate-600">Condition:</span>
            {["AKI","CKD","Dialysis","Hyperkalemia","Hyperphosphatemia","Other"].map(c => (
              <button key={c} onClick={() => setCondition(c)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${condition === c ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-700 border-slate-300 hover:border-teal-400"}`}>
                {c}
              </button>
            ))}
            {condition === "CKD" && (
              <select className="border rounded-md px-2 py-1 text-sm" value={ckdStage} onChange={e => setCkdStage(Number(e.target.value))}>
                {[1,2,3,4,5].map(s => <option key={s} value={s}>Stage {s}</option>)}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <div className="grid md:grid-cols-2 gap-3">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Dietary Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {restrictions.notes?.map((n, i) => (
              <div key={i} className="flex gap-2 text-xs text-red-800">
                <span>•</span><span>{n}</span>
              </div>
            ))}
            {restrictions.avoid_k === "high" && <Badge className="bg-red-200 text-red-800 border-0 text-xs">Restrict High-Potassium Foods</Badge>}
            {restrictions.avoid_p === "high" && <Badge className="bg-orange-200 text-orange-800 border-0 text-xs">Restrict High-Phosphate Foods</Badge>}
            {restrictions.fluid_restrict && <Badge className="bg-blue-200 text-blue-800 border-0 text-xs">Fluid Restriction</Badge>}
          </CardContent>
        </Card>

        {/* Sample Template */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sample Day Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {Object.entries(template).map(([meal, items]) => (
              <div key={meal}>
                <span className="font-semibold text-slate-700 capitalize">{meal.replace("_"," ")}:</span>
                <span className="text-slate-600 ml-1">{items.join(", ")}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Meal Plan Generator */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Apple className="w-4 h-4 text-teal-600" /> AI Personalized Meal Plan (PRNT/KDIGO aligned)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={generateAIPlan} disabled={loading} className="bg-teal-600 hover:bg-teal-700 w-full mb-4">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</> : "Generate AI Meal Plan"}
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
                    <div className="font-bold text-indigo-700">{Math.round(totalProtein)}g</div>
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
                    {aiMealPlan.special_notes.map((n,i) => <span key={i} className="block mt-0.5">• {n}</span>)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Food Database */}
      <Card>
        <button className="w-full p-4 flex items-center justify-between" onClick={() => setShowFoodDb(!showFoodDb)}>
          <span className="font-semibold text-sm">Food Reference Database (K / Phosphate / Fluid Tagging)</span>
          {showFoodDb ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showFoodDb && (
          <CardContent className="pt-0">
            <div className="flex gap-2 mb-3 flex-wrap">
              {[["all","All K"],["low","Low K"],["high","High K"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilterK(v)} className={`px-2 py-1 text-xs rounded-full border ${filterK===v ? "bg-green-600 text-white" : "bg-white text-slate-600"}`}>{l}</button>
              ))}
              <span className="text-slate-300">|</span>
              {[["all","All P"],["low","Low P"],["high","High P"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilterP(v)} className={`px-2 py-1 text-xs rounded-full border ${filterP===v ? "bg-orange-500 text-white" : "bg-white text-slate-600"}`}>{l}</button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-2">Food</th>
                    <th className="text-center p-2">Group</th>
                    <th className="text-center p-2">Potassium</th>
                    <th className="text-center p-2">Phosphate</th>
                    <th className="text-center p-2">Fluid</th>
                    <th className="text-center p-2">kcal</th>
                    <th className="text-center p-2">Protein(g)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.map((f, i) => (
                    <tr key={i} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-medium">{f.name}</td>
                      <td className="p-2 text-center text-slate-500">{f.group}</td>
                      <td className="p-2 text-center">
                        <Badge className={`text-xs ${f.k==="high" ? "bg-red-100 text-red-700" : f.k==="moderate" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{f.k}</Badge>
                      </td>
                      <td className="p-2 text-center">
                        <Badge className={`text-xs ${f.p==="high" ? "bg-orange-100 text-orange-700" : f.p==="moderate" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{f.p}</Badge>
                      </td>
                      <td className="p-2 text-center">
                        <Badge className={`text-xs ${f.fluid==="high" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{f.fluid}</Badge>
                      </td>
                      <td className="p-2 text-center">{f.kcal}</td>
                      <td className="p-2 text-center">{f.protein}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}