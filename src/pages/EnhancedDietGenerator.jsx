import React, { useState } from "react";
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
import { ArrowLeft, UtensilsCrossed, Sparkles, Download, Copy, Save, Edit2, Plus, X, Info, AlertTriangle, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function EnhancedDietGenerator() {
  const [scenario, setScenario] = useState("general");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState("");
  const [egfr, setEgfr] = useState("");
  const [onDialysis, setOnDialysis] = useState("no");
  const [hasEdema, setHasEdema] = useState("no");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [dietPlan, setDietPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(null);

  const SCENARIOS = [
    { value: "general", label: "General Pediatrics", icon: "👶", color: "bg-blue-100 text-blue-800" },
    { value: "nephrotic", label: "Nephrotic Syndrome", icon: "💧", color: "bg-indigo-100 text-indigo-800" },
    { value: "ckd", label: "CKD / Dialysis", icon: "🩺", color: "bg-purple-100 text-purple-800" },
    { value: "obesity", label: "Obesity", icon: "⚖️", color: "bg-amber-100 text-amber-800" },
    { value: "diabetes", label: "Diabetes", icon: "🩸", color: "bg-red-100 text-red-800" },
  ];

  const generateDiet = async () => {
    if (!weight || !age) { toast.error("Enter weight and age"); return; }
    setIsGenerating(true);
    try {
      let context = `Generate a detailed, evidence-based diet plan for a ${age}-year-old ${gender} child weighing ${weight} kg`;
      if (height) context += `, height ${height} cm`;
      context += `.\n\nClinical Scenario: ${scenario.toUpperCase()}`;

      if (scenario === "general") {
        context += `\n\nGenerate a balanced IAP/ICMR nutrition plan for a healthy pediatric patient. Activity level: ${activityLevel}. Include macronutrients, micronutrients, and sample Indian meal plan.`;
      } else if (scenario === "nephrotic") {
        context += `\n\nNephrotic Syndrome (IPNA 2021 Guidelines). Edema: ${hasEdema}. Protein 1.0-1.5 g/kg/day. Restrict sodium if edema. Include Indian low-sodium foods.`;
      } else if (scenario === "ckd") {
        context += `\n\nCKD (eGFR ${egfr || "unknown"}) — KDIGO/KDOQI Guidelines. On dialysis: ${onDialysis}. Include protein restriction by stage, phosphorus/potassium limits, fluid restriction for HD. Indian foods.`;
      } else if (scenario === "obesity") {
        context += `\n\nObesity Management (IAP). Energy deficit diet, high protein, high fiber, low glycemic index, portion control.`;
      } else if (scenario === "diabetes") {
        context += `\n\nDiabetes (IAP/ADA). Carb counting, low GI foods, avoid simple sugars, consistent meal timing.`;
      }

      context += `\n\nProvide: 1) Daily nutrient targets 2) Detailed Indian meal plan (breakfast, mid-morning, lunch, evening, dinner) with portions 3) Foods to include and avoid 4) Clinical rationale and guideline reference. Be practical for Indian families.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: context,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            guideline_source: { type: "string" },
            nutrient_targets: { type: "object", additionalProperties: { type: "string" } },
            meal_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  meal: { type: "string" },
                  time: { type: "string" },
                  items: { type: "array", items: { type: "string" } },
                  portions: { type: "string" },
                  rationale: { type: "string" }
                }
              }
            },
            foods_to_eat: { type: "array", items: { type: "string" } },
            foods_to_avoid: { type: "array", items: { type: "string" } },
            clinical_notes: { type: "string" },
            reference_links: { type: "array", items: { type: "object", properties: { title: { type: "string" }, url: { type: "string" } } } }
          }
        }
      });

      const plan = { scenario, patient: { weight, age, gender, height }, ...result, generatedAt: new Date().toLocaleString() };
      setDietPlan(plan);
      setEditedPlan(JSON.parse(JSON.stringify(plan)));
      toast.success("Diet plan generated!");
    } catch (e) {
      toast.error("Failed to generate diet plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPlan = () => {
    const p = isEditing ? editedPlan : dietPlan;
    if (!p) return;
    let text = `DIET PLAN — ${p.scenario?.toUpperCase()}\nGenerated: ${p.generatedAt}\nPatient: ${p.patient?.age}y ${p.patient?.gender}, ${p.patient?.weight} kg\nGuideline: ${p.guideline_source}\n\n${p.summary}\n\n`;
    text += `NUTRIENT TARGETS:\n${Object.entries(p.nutrient_targets || {}).map(([k,v]) => `${k}: ${v}`).join("\n")}\n\n`;
    text += `MEAL PLAN:\n${(p.meal_plan || []).map(m => `${m.meal} (${m.time})\n${m.items.join("\n")}\nPortions: ${m.portions}`).join("\n\n")}\n\n`;
    text += `INCLUDE:\n${(p.foods_to_eat || []).join("\n")}\n\nAVOID:\n${(p.foods_to_avoid || []).join("\n")}\n\nNOTES:\n${p.clinical_notes}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `diet-plan-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };

  const activePlan = isEditing ? editedPlan : dietPlan;

  const updateMealItem = (mealIdx, itemIdx, value) => {
    const updated = { ...editedPlan };
    updated.meal_plan[mealIdx].items[itemIdx] = value;
    setEditedPlan(updated);
  };

  const addMealItem = (mealIdx) => {
    const updated = { ...editedPlan };
    updated.meal_plan[mealIdx].items.push("");
    setEditedPlan(updated);
  };

  const removeMealItem = (mealIdx, itemIdx) => {
    const updated = { ...editedPlan };
    updated.meal_plan[mealIdx].items.splice(itemIdx, 1);
    setEditedPlan(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Link to={createPageUrl("Hub")}><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Hub</Button></Link>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-green-600" />AI Diet & Nutrition Generator
            </h1>
            <p className="text-xs text-slate-500">Explainable · Editable · Evidence-Based — IPNA · KDIGO · IAP · ICMR</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Input Panel */}
          <div className="space-y-4">
            {/* Scenario */}
            <Card className="bg-white shadow-md border-2 border-green-200">
              <CardHeader className="pb-2 bg-green-50 border-b"><CardTitle className="text-sm font-semibold">Clinical Scenario</CardTitle></CardHeader>
              <CardContent className="p-3 grid grid-cols-2 gap-2">
                {SCENARIOS.map(s => (
                  <Button key={s.value} size="sm" variant={scenario === s.value ? "default" : "outline"}
                    onClick={() => { setScenario(s.value); setDietPlan(null); setEditedPlan(null); }}
                    className={scenario === s.value ? "bg-green-600 col-span-1" : `text-xs ${s.color} border col-span-1`}>
                    {s.icon} {s.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Parameters */}
            <Card className="bg-white shadow-md">
              <CardHeader className="pb-2 bg-slate-50 border-b"><CardTitle className="text-sm font-semibold">Patient Parameters</CardTitle></CardHeader>
              <CardContent className="p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs font-semibold">Weight (kg) *</Label><Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 25" className="mt-1" /></div>
                  <div><Label className="text-xs font-semibold">Age (years) *</Label><Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 8" className="mt-1" /></div>
                  <div><Label className="text-xs font-semibold">Height (cm)</Label><Input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="Optional" className="mt-1" /></div>
                  <div><Label className="text-xs font-semibold">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>

                {scenario === "nephrotic" && (
                  <div><Label className="text-xs font-semibold">Edema Present?</Label>
                    <Select value={hasEdema} onValueChange={setHasEdema}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="yes">Yes — Restrict Na/Fluid</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                    </Select>
                  </div>
                )}

                {scenario === "ckd" && (
                  <>
                    <div><Label className="text-xs font-semibold">eGFR (ml/min)</Label><Input type="number" value={egfr} onChange={e => setEgfr(e.target.value)} placeholder="e.g. 25" className="mt-1" /></div>
                    <div><Label className="text-xs font-semibold">On Dialysis?</Label>
                      <Select value={onDialysis} onValueChange={setOnDialysis}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="HD">Hemodialysis</SelectItem><SelectItem value="PD">Peritoneal Dialysis</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {scenario === "general" && (
                  <div><Label className="text-xs font-semibold">Activity Level</Label>
                    <Select value={activityLevel} onValueChange={setActivityLevel}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="sedentary">Sedentary</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="active">Very Active</SelectItem></SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={generateDiet} disabled={isGenerating} className="w-full bg-green-600 hover:bg-green-700">
                  {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate AI Diet Plan</>}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="md:col-span-2 space-y-4">
            {activePlan ? (
              <>
                {/* Header */}
                <Card className="bg-white shadow-md border-2 border-green-300">
                  <CardHeader className="pb-2 bg-green-50 border-b">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <CardTitle className="text-sm font-bold text-green-900">{scenario.toUpperCase()} Diet Plan</CardTitle>
                        <p className="text-xs text-slate-500">{activePlan.generatedAt} · {activePlan.guideline_source}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)} className={isEditing ? "bg-blue-600" : ""}>
                          <Edit2 className="w-3 h-3 mr-1" />{isEditing ? "Editing" : "Edit"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={downloadPlan}><Download className="w-3 h-3 mr-1" />Save</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    <p className="text-sm text-slate-700">{activePlan.summary}</p>
                  </CardContent>
                </Card>

                {/* Nutrient Targets */}
                <Card className="bg-white shadow-md">
                  <CardHeader className="pb-2 bg-blue-50 border-b"><CardTitle className="text-sm font-semibold text-blue-900">Daily Nutrient Targets</CardTitle></CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(activePlan.nutrient_targets || {}).map(([key, val]) => val && (
                        <div key={key} className="bg-slate-50 rounded-lg p-2 border text-center">
                          <div className="text-xs text-slate-500 capitalize">{key.replace(/_/g, " ")}</div>
                          <div className="font-bold text-sm text-slate-900 mt-0.5">{val}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Meal Plan */}
                <Card className="bg-white shadow-md">
                  <CardHeader className="pb-2 bg-amber-50 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-amber-900">Meal Plan</CardTitle>
                      {isEditing && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { const u = {...editedPlan}; u.meal_plan.push({meal:"New Meal",time:"—",items:["Item"],portions:"",rationale:""}); setEditedPlan(u); }}><Plus className="w-3 h-3 mr-1" />Add Meal</Button>}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    {(activePlan.meal_plan || []).map((meal, mIdx) => (
                      <div key={mIdx} className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-amber-900">{meal.meal}</span>
                          <Badge variant="outline" className="text-xs">{meal.time}</Badge>
                        </div>
                        <ul className="space-y-1">
                          {meal.items.map((item, iIdx) => (
                            <li key={iIdx} className="flex items-center gap-1">
                              {isEditing ? (
                                <>
                                  <Input value={item} onChange={e => updateMealItem(mIdx, iIdx, e.target.value)} className="text-xs h-6 flex-1" />
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeMealItem(mIdx, iIdx)}><X className="w-3 h-3 text-red-400" /></Button>
                                </>
                              ) : (
                                <span className="text-xs text-slate-700">• {item}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                        {isEditing && <Button size="sm" variant="ghost" className="text-xs mt-1 h-6" onClick={() => addMealItem(mIdx)}><Plus className="w-3 h-3 mr-1" />Add item</Button>}
                        {meal.portions && <p className="text-xs text-slate-600 mt-1 bg-white/70 p-1.5 rounded"><strong>Portions:</strong> {meal.portions}</p>}
                        {meal.rationale && <p className="text-xs text-blue-700 italic mt-1">{meal.rationale}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Foods */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-white shadow-md border-2 border-green-300">
                    <CardHeader className="pb-2 bg-green-50 border-b"><CardTitle className="text-xs font-semibold text-green-900 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Include</CardTitle></CardHeader>
                    <CardContent className="p-3">
                      <ul className="space-y-0.5">{(activePlan.foods_to_eat || []).map((f,i) => <li key={i} className="text-xs text-slate-700">✓ {f}</li>)}</ul>
                    </CardContent>
                  </Card>
                  <Card className="bg-white shadow-md border-2 border-red-300">
                    <CardHeader className="pb-2 bg-red-50 border-b"><CardTitle className="text-xs font-semibold text-red-900 flex items-center gap-1"><X className="w-3 h-3" />Avoid</CardTitle></CardHeader>
                    <CardContent className="p-3">
                      <ul className="space-y-0.5">{(activePlan.foods_to_avoid || []).map((f,i) => <li key={i} className="text-xs text-slate-700">✗ {f}</li>)}</ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Clinical Notes */}
                <Card className="bg-blue-50 border-blue-300 shadow-md">
                  <CardHeader className="pb-2 border-b border-blue-200"><CardTitle className="text-xs font-semibold text-blue-900 flex items-center gap-1"><Info className="w-3 h-3" />Clinical Rationale</CardTitle></CardHeader>
                  <CardContent className="p-3 space-y-2">
                    <p className="text-xs text-blue-900 whitespace-pre-wrap">{activePlan.clinical_notes}</p>
                    {activePlan.reference_links?.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-blue-200">
                        {activePlan.reference_links.map((ref, i) => (
                          <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />{ref.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button onClick={() => { setDietPlan(editedPlan); setIsEditing(false); toast.success("Edits saved"); }} className="flex-1 bg-green-600"><Save className="w-4 h-4 mr-2" />Save Edits</Button>
                    <Button onClick={() => { setEditedPlan(JSON.parse(JSON.stringify(dietPlan))); setIsEditing(false); }} variant="outline" className="flex-1">Cancel</Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="bg-white shadow-md flex items-center justify-center min-h-[300px]">
                <div className="text-center text-slate-400 p-8">
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-slate-500">Select scenario and enter patient parameters</p>
                  <p className="text-sm mt-1">AI generates an evidence-based, editable Indian diet plan</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}