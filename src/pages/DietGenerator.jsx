import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, UtensilsCrossed, Calculator, Download, Copy, Info, Sparkles, Plus, Trash2, Edit2, Save, WifiOff, Wifi, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "diet_plans_cache";

// Curated references
const REFERENCES = {
  nephrotic: [
    { title: "IPNA Nephrotic Syndrome Guidelines 2021", url: "https://www.theisn.org/ipna/" },
    { title: "KDIGO Glomerular Disease Guidelines 2024", url: "https://kdigo.org/guidelines/" },
    { title: "IAP Nutrition Chapter Recommendations", url: "https://www.iapindia.org" },
  ],
  ckd: [
    { title: "KDIGO CKD Guidelines 2024", url: "https://kdigo.org/guidelines/ckd-evaluation-and-management/" },
    { title: "KDOQI Pediatric CKD Nutrition 2020", url: "https://www.kidney.org/professionals/guidelines" },
    { title: "IPNA Clinical Practice Recommendations on Nutrition in CKD", url: "https://www.theisn.org/ipna/" },
  ],
  iap: [
    { title: "ICMR Nutrient Requirements 2020", url: "https://www.nin.res.in/nutrition2020.html" },
    { title: "IAP Nutrition Chapter Guidelines", url: "https://www.iapindia.org" },
    { title: "WHO Child Growth Standards", url: "https://www.who.int/tools/child-growth-standards" },
  ],
};

export default function DietGenerator() {
  const [mode, setMode] = useState("iap");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [edema, setEdema] = useState("no");
  const [egfr, setEgfr] = useState("");
  const [onDialysis, setOnDialysis] = useState("no");
  const [dialysisType, setDialysisType] = useState("HD");
  const [result, setResult] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState(null);

  useEffect(() => {
    const handler = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handler);
    window.addEventListener("offline", handler);
    return () => { window.removeEventListener("online", handler); window.removeEventListener("offline", handler); };
  }, []);

  const calculatePlan = async () => {
    if (!weight || !age) { toast.error("Enter weight and age"); return; }
    setIsGenerating(true);
    const w = +weight, a = +age;
    
    try {
      const prompt = mode === "nephrotic" 
        ? `Generate a detailed Indian diet plan for a child with Nephrotic Syndrome.

Age: ${a} years, Weight: ${w} kg, Gender: ${gender}, Edema: ${edema}

Based on IPNA 2021 guidelines:
- Protein: 1.0-1.5 g/kg/day (normal protein, NOT high)
- Energy: 100-120% RDA
- Sodium: ${edema === "yes" ? "1-2 mEq/kg/day (strict restriction if edema)" : "2-3 mEq/kg/day"}
- ${edema === "yes" ? "Fluid restriction: 20 mL/kg + insensible losses" : "No fluid restriction"}

Provide:
1. Exact macro targets (protein g, energy kcal, sodium mg, fluid mL if needed)
2. Sample 1-day Indian meal plan (breakfast, lunch, snacks, dinner) with portions
3. Foods to encourage (low-sodium Indian options)
4. Foods to strictly avoid
5. Explain the rationale`
        : mode === "ckd"
        ? `Generate a detailed Indian diet plan for a child with CKD.

Age: ${a} years, Weight: ${w} kg, Gender: ${gender}, eGFR: ${egfr} mL/min/1.73m², On Dialysis: ${onDialysis} (${dialysisType})

Based on KDIGO/KDOQI guidelines:
- Protein: varies by stage (0.6-1.5 g/kg/day)
- ${egfr ? `Phosphorus restriction if eGFR <45` : ""}
- ${onDialysis === "yes" && dialysisType === "HD" ? "Strict fluid + potassium restriction for HD" : ""}
- Adequate energy for growth

Provide:
1. Macro/micro targets (protein, phosphorus, potassium, sodium, fluid)
2. Sample Indian meal plan (1 day) with low-potassium/phosphorus options
3. Water-leaching technique for vegetables
4. Foods to avoid
5. Explain the clinical rationale`
        : `Generate a balanced Indian diet plan for a healthy child.

Age: ${a} years, Weight: ${w} kg, Gender: ${gender}

Based on ICMR 2020 RDA and IAP nutrition guidelines:
- Energy: age-appropriate (90-110 kcal/kg for younger children)
- Protein: 0.85-1.5 g/kg/day
- Balanced macros: 55% carbs, 30% fats, 15% protein
- Adequate calcium, iron, vitamin D, zinc

Provide:
1. Nutrient targets (energy, protein, carbs, fat, calcium, iron, Vit D)
2. Sample 1-day balanced Indian meal plan (breakfast, lunch, snacks, dinner)
3. Age-appropriate portion sizes
4. Foods to encourage for growth
5. Foods to limit (junk food, sugar)`;

      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            nutrient_targets: { type: "object", additionalProperties: true },
            meal_plan: {
              type: "object",
              properties: {
                breakfast: { type: "array", items: { type: "object", properties: { item: {type:"string"}, portion: {type:"string"} } } },
                mid_morning: { type: "array", items: { type: "object", properties: { item: {type:"string"}, portion: {type:"string"} } } },
                lunch: { type: "array", items: { type: "object", properties: { item: {type:"string"}, portion: {type:"string"} } } },
                evening: { type: "array", items: { type: "object", properties: { item: {type:"string"}, portion: {type:"string"} } } },
                dinner: { type: "array", items: { type: "object", properties: { item: {type:"string"}, portion: {type:"string"} } } },
              }
            },
            foods_to_encourage: { type: "array", items: { type: "string" } },
            foods_to_avoid: { type: "array", items: { type: "string" } },
            rationale: { type: "string" },
          }
        }
      });

      setResult({ ...aiResult, mode, weight: w, age: a, gender, generatedAt: new Date().toLocaleString() });
      setMealPlan(aiResult.meal_plan);
      toast.success("Diet plan generated!");
    } catch (error) {
      toast.error("Failed to generate plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateMealItem = (meal, idx, field, value) => {
    const updated = { ...mealPlan };
    updated[meal][idx][field] = value;
    setMealPlan(updated);
  };

  const removeMealItem = (meal, idx) => {
    const updated = { ...mealPlan };
    updated[meal] = updated[meal].filter((_, i) => i !== idx);
    setMealPlan(updated);
  };

  const addMealItem = (meal) => {
    const updated = { ...mealPlan };
    if (!updated[meal]) updated[meal] = [];
    updated[meal].push({ item: "", portion: "" });
    setMealPlan(updated);
  };

  const savePlan = () => {
    if (!result) return;
    const updatedResult = { ...result, meal_plan: mealPlan };
    let saved = [];
    try { const p = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); saved = Array.isArray(p) ? p : []; } catch { saved = []; }
    const newSaved = [{ id: Date.now(), ...updatedResult }, ...saved.slice(0, 9)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSaved));
    toast.success("Diet plan saved offline");
  };

  const downloadPlan = () => {
    if (!result) return;
    let text = `=== DIET & NUTRITION PLAN ===\n\nMode: ${result.mode.toUpperCase()}\nGenerated: ${result.generatedAt}\nAge: ${result.age}y | Weight: ${result.weight}kg | Gender: ${result.gender}\n\n`;
    text += `NUTRIENT TARGETS:\n${JSON.stringify(result.nutrient_targets, null, 2)}\n\n`;
    text += `MEAL PLAN:\n`;
    Object.entries(mealPlan || {}).forEach(([meal, items]) => {
      text += `\n${meal.toUpperCase()}:\n`;
      items.forEach(it => text += `  - ${it.item} (${it.portion})\n`);
    });
    text += `\n\nFOODS TO ENCOURAGE:\n${(result.foods_to_encourage || []).map(f => `- ${f}`).join("\n")}\n`;
    text += `\nFOODS TO AVOID:\n${(result.foods_to_avoid || []).map(f => `- ${f}`).join("\n")}\n`;
    text += `\n\nRATIONALE:\n${result.rationale}\n`;
    
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `diet_plan_${Date.now()}.txt`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Plan downloaded");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Link to={createPageUrl("Hub")}><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Hub</Button></Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <UtensilsCrossed className="w-7 h-7 text-green-600" />AI Diet & Nutrition Generator
            </h1>
            <p className="text-sm text-slate-600">IPNA · KDIGO · KDOQI · IAP / ICMR Evidence-Based Guidelines</p>
          </div>
          <Badge className={isOnline ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
            {isOnline ? <><Wifi className="w-3 h-3 mr-1" />Online</> : <><WifiOff className="w-3 h-3 mr-1" />Offline</>}
          </Badge>
        </div>

        <Tabs value={mode} onValueChange={(v) => { setMode(v); setResult(null); setMealPlan(null); }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="iap">General Pediatrics (IAP)</TabsTrigger>
            <TabsTrigger value="nephrotic">Nephrotic Syndrome</TabsTrigger>
            <TabsTrigger value="ckd">CKD / Dialysis</TabsTrigger>
          </TabsList>

          {/* Input Panel */}
          <Card className="mt-4 bg-white shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
              <CardTitle className="flex items-center gap-2 text-sm"><Calculator className="w-4 h-4 text-green-600" />Patient Parameters</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Weight (kg) *</Label>
                  <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 20" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Age (years) *</Label>
                  <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 8" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                  </Select>
                </div>
                {mode === "nephrotic" && (
                  <div>
                    <Label className="text-xs font-semibold">Edema?</Label>
                    <Select value={edema} onValueChange={setEdema}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes (restrict Na/fluid)</SelectItem></SelectContent>
                    </Select>
                  </div>
                )}
                {mode === "ckd" && (
                  <>
                    <div>
                      <Label className="text-xs font-semibold">eGFR (mL/min)</Label>
                      <Input type="number" value={egfr} onChange={e => setEgfr(e.target.value)} placeholder="e.g. 25" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Dialysis?</Label>
                      <Select value={onDialysis} onValueChange={setOnDialysis}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent>
                      </Select>
                    </div>
                    {onDialysis === "yes" && (
                      <div>
                        <Label className="text-xs font-semibold">Dialysis Type</Label>
                        <Select value={dialysisType} onValueChange={setDialysisType}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="HD">Hemodialysis</SelectItem><SelectItem value="PD">Peritoneal Dialysis</SelectItem></SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
              </div>
              <Button onClick={calculatePlan} disabled={isGenerating} className="w-full bg-green-600 hover:bg-green-700">
                {isGenerating ? <><Sparkles className="w-4 h-4 mr-2 animate-pulse" />Generating AI Plan...</> : <><Calculator className="w-4 h-4 mr-2" />Generate AI Diet Plan</>}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <>
              <Card className="bg-white shadow-lg border-2">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-blue-600" />{mode.toUpperCase()} Diet Plan
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">Generated: {result.generatedAt}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setShowEdit(!showEdit)}><Edit2 className="w-3 h-3 mr-1" />Edit</Button>
                      <Button size="sm" variant="outline" onClick={savePlan}><Save className="w-3 h-3 mr-1" />Save</Button>
                      <Button size="sm" variant="outline" onClick={downloadPlan}><Download className="w-3 h-3 mr-1" />Export</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {/* Nutrient Targets */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-bold text-sm text-green-900 mb-2">Nutrient Targets</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {Object.entries(result.nutrient_targets || {}).map(([k, v]) => (
                        <div key={k} className="bg-white p-2 rounded border flex justify-between">
                          <span className="text-slate-600 capitalize">{k.replace(/_/g, " ")}:</span>
                          <span className="font-bold text-slate-900">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meal Plan */}
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 mb-2">Sample Meal Plan</h4>
                    {mealPlan && Object.entries(mealPlan).map(([meal, items]) => (
                      <div key={meal} className="mb-3 p-2 bg-slate-50 rounded border">
                        <div className="font-semibold text-sm text-slate-900 mb-1 capitalize flex items-center justify-between">
                          {meal.replace(/_/g, " ")}
                          {showEdit && <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => addMealItem(meal)}><Plus className="w-3 h-3" /></Button>}
                        </div>
                        <div className="space-y-1">
                          {items.map((it, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              {showEdit ? (
                                <>
                                  <Input value={it.item} onChange={e => updateMealItem(meal, i, "item", e.target.value)} placeholder="Food item" className="flex-1 h-7 text-xs" />
                                  <Input value={it.portion} onChange={e => updateMealItem(meal, i, "portion", e.target.value)} placeholder="Portion" className="w-24 h-7 text-xs" />
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => removeMealItem(meal, i)}><Trash2 className="w-3 h-3" /></Button>
                                </>
                              ) : (
                                <span className="text-slate-700">• {it.item} <span className="text-slate-500">({it.portion})</span></span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Foods Guide */}
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-2 bg-green-50 rounded border border-green-200">
                      <h4 className="font-semibold text-xs text-green-900 mb-1">✅ Foods to Encourage</h4>
                      <ul className="space-y-0.5 text-xs text-green-800">
                        {(result.foods_to_encourage || []).map((f, i) => <li key={i}>• {f}</li>)}
                      </ul>
                    </div>
                    <div className="p-2 bg-red-50 rounded border border-red-200">
                      <h4 className="font-semibold text-xs text-red-900 mb-1">❌ Foods to Avoid</h4>
                      <ul className="space-y-0.5 text-xs text-red-800">
                        {(result.foods_to_avoid || []).map((f, i) => <li key={i}>• {f}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Rationale */}
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-xs text-blue-900">
                      <strong>Clinical Rationale:</strong> {result.rationale}
                    </AlertDescription>
                  </Alert>

                  {/* References */}
                  <div className="border-t pt-2">
                    <p className="text-xs font-semibold text-slate-600 mb-1">📚 Evidence-Based References:</p>
                    <div className="flex flex-wrap gap-2">
                      {REFERENCES[mode]?.map((ref, i) => (
                        <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                          <ExternalLink className="w-3 h-3" />{ref.title}
                        </a>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!result && !isGenerating && (
            <div className="text-center py-16 text-slate-400">
              <UtensilsCrossed className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Enter patient parameters and click Generate</p>
              <p className="text-sm mt-1">AI will create an evidence-based, editable Indian meal plan</p>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}