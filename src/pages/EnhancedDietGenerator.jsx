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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, UtensilsCrossed, Sparkles, Download, Copy, Save, Edit2, Plus, X, Info, AlertTriangle, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function EnhancedDietGenerator() {
  const [scenario, setScenario] = useState("general"); // general | nephrotic | ckd | obesity | diabetes
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState("");
  
  // Scenario-specific
  const [egfr, setEgfr] = useState("");
  const [onDialysis, setOnDialysis] = useState("no");
  const [hasEdema, setHasEdema] = useState("no");
  const [activityLevel, setActivityLevel] = useState("moderate");
  
  const [dietPlan, setDietPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(null);

  const generateDiet = async () => {
    if (!weight || !age) { toast.error("Enter weight and age"); return; }
    
    setIsGenerating(true);
    try {
      // Build context-aware prompt
      let context = `Generate a detailed, evidence-based diet plan for a ${age}-year-old ${gender} child weighing ${weight} kg`;
      if (height) context += `, height ${height} cm`;
      context += `.

Clinical Scenario: ${scenario.toUpperCase()}`;

      if (scenario === "general") {
        context += `\n\nGenerate a balanced IAP/ICMR nutrition plan for a healthy pediatric patient. Include macronutrients, micronutrients, and sample Indian meal plan.`;
      } else if (scenario === "nephrotic") {
        context += `\n\nNephrotic Syndrome (IPNA 2021 Guidelines)
- Edema present: ${hasEdema}
- Protein: 1.0-1.5 g/kg/day (NOT high protein!)
- Sodium restriction if edema (1-2 mEq/kg/day)
- Fluid restriction if severe edema
- No added salt diet
Include Indian foods low in sodium.`;
      } else if (scenario === "ckd") {
        context += `\n\nCKD Stage ${egfr ? `(eGFR ${egfr})` : ""} - KDIGO/KDOQI Guidelines
- On dialysis: ${onDialysis}
- Protein restriction based on stage (0.8-1.2 g/kg if not on dialysis, 1.2-1.5 if on dialysis)
- Phosphorus restriction if eGFR <45
- Potassium restriction if eGFR <30 or on HD
- Sodium restriction (1-2 g/day)
Include low potassium and low phosphorus Indian foods.`;
      } else if (scenario === "obesity") {
        context += `\n\nObesity Management (IAP Guidelines)
- Energy deficit diet (reduce 250-500 kcal/day from requirement)
- High protein (1.2-1.5 g/kg) to preserve lean mass
- High fiber, low glycemic index
- Portion control
- Avoid sugar-sweetened beverages and processed foods`;
      } else if (scenario === "diabetes") {
        context += `\n\nType 1 or Type 2 Diabetes (IAP/ADA Guidelines)
- Carbohydrate counting
- Low glycemic index foods
- Balanced meals (50-60% carbs, 15-20% protein, 25-30% fat)
- Avoid simple sugars
- Consistent meal timing`;
      }

      context += `\n\nProvide:
1. Daily nutrient targets (energy, protein, carbs, fat, key micronutrients)
2. Detailed meal plan with portions for Indian foods (breakfast, mid-morning, lunch, evening, dinner)
3. Food recommendations (what to eat, what to avoid)
4. Clinical rationale and guidelines reference
5. Practical Indian meal examples with quantities

Make it practical for Indian families.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: context,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            nutrient_targets: {
              type: "object",
              properties: {
                energy_kcal: { type: "string" },
                protein_g: { type: "string" },
                carbs_g: { type: "string" },
                fat_g: { type: "string" },
                calcium_mg: { type: "string" },
                iron_mg: { type: "string" },
                fiber_g: { type: "string" },
                sodium_restriction: { type: "string" },
                potassium_restriction: { type: "string" },
                phosphorus_restriction: { type: "string" },
                fluid_restriction: { type: "string" },
              }
            },
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
            guideline_source: { type: "string" },
            reference_links: { type: "array", items: { type: "object", properties: { title: { type: "string" }, url: { type: "string" } } } }
          }
        }
      });

      const plan = {
        scenario,
        patient: { weight, age, gender, height },
        ...result,
        generatedAt: new Date().toLocaleString(),
      };

      setDietPlan(plan);
      setEditedPlan(JSON.parse(JSON.stringify(plan))); // Deep copy for editing
      toast.success("Diet plan generated with AI");
    } catch (error) {
      toast.error("Failed to generate diet plan");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = () => {
    const planToSave = isEditing ? editedPlan : dietPlan;
    const filename = `diet-plan-${scenario}-${weight}kg-${age}y-${Date.now()}.json`;
    const blob = new Blob([JSON.stringify(planToSave, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success("Diet plan downloaded");
  };

  const copyPlan = () => {
    const planToUse = isEditing ? editedPlan : dietPlan;
    if (!planToUse) return;
    
    let text = `═══════════════════════════════════════════\nDIET PLAN — ${scenario.toUpperCase()}\n═══════════════════════════════════════════\n\n`;
    text += `Patient: ${planToUse.patient.age}y ${planToUse.patient.gender}, ${planToUse.patient.weight} kg\n`;
    text += `Generated: ${planToUse.generatedAt}\n`;
    text += `Guideline: ${planToUse.guideline_source || "IAP/ICMR/KDIGO/IPNA"}\n\n`;
    text += `${planToUse.summary}\n\n`;
    
    text += `───────────────────────────────────────────\nNUTRIENT TARGETS\n───────────────────────────────────────────\n`;
    Object.entries(planToUse.nutrient_targets || {}).forEach(([k, v]) => {
      if (v) text += `${k.replace(/_/g, " ").toUpperCase()}: ${v}\n`;
    });
    
    text += `\n───────────────────────────────────────────\nMEAL PLAN\n───────────────────────────────────────────\n`;
    (planToUse.meal_plan || []).forEach(m => {
      text += `\n${m.meal.toUpperCase()} (${m.time})\n`;
      text += `${m.items.join("\n")}\n`;
      text += `Portions: ${m.portions}\n`;
    });
    
    text += `\n───────────────────────────────────────────\nFOOD RECOMMENDATIONS\n───────────────────────────────────────────\n`;
    text += `✅ INCLUDE:\n${(planToUse.foods_to_eat || []).join("\n")}\n\n`;
    text += `❌ AVOID:\n${(planToUse.foods_to_avoid || []).join("\n")}\n\n`;
    
    text += `───────────────────────────────────────────\nCLINICAL NOTES\n───────────────────────────────────────────\n${planToUse.clinical_notes}\n\n`;
    text += `Generated by CliniCals AI — For educational purposes. Verify with dietitian.\n`;
    
    navigator.clipboard.writeText(text);
    toast.success("Diet plan copied to clipboard");
  };

  const activePlan = isEditing ? editedPlan : dietPlan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Hub</Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <UtensilsCrossed className="w-7 h-7 text-green-600" />
              AI Diet & Nutrition Generator
            </h1>
            <p className="text-sm text-slate-600">Explainable, Editable, Evidence-Based — IPNA · KDIGO · IAP · ICMR</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Input Panel */}
          <div className="md:col-span-1 space-y-4">
            <Card className="bg-white shadow-lg border-2 border-green-200">
              <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-teal-50 border-b">
                <CardTitle className="text-sm font-semibold text-green-900">Clinical Scenario</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "general", label: "General Pediatrics", icon: "👶", color: "bg-blue-100 text-blue-800" },
                    { value: "nephrotic", label: "Nephrotic Syndrome", icon: "💧", color: "bg-indigo-100 text-indigo-800" },
                    { value: "ckd", label: "CKD / Dialysis", icon: "🩺", color: "bg-purple-100 text-purple-800" },
                    { value: "obesity", label: "Obesity", icon: "⚖️", color: "bg-amber-100 text-amber-800" },
                    { value: "diabetes", label: "Diabetes", icon: "🩸", color: "bg-red-100 text-red-800" },
                  ].map(s => (
                    <Button key={s.value} size="sm" variant={scenario === s.value ? "default" : "outline"} onClick={() => setScenario(s.value)} 
                      className={scenario === s.value ? "bg-green-600" : `text-xs ${s.color} border-2`}>
                      {s.icon} {s.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-2 bg-slate-50 border-b">
                <CardTitle className="text-sm font-semibold">Patient Parameters</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Weight (kg) *</Label>
                    <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 25" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Age (years) *</Label>
                    <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 8" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Height (cm)</Label>
                    <Input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="Optional" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {scenario === "nephrotic" && (
                  <div>
                    <Label className="text-xs font-semibold">Edema Present?</Label>
                    <Select value={hasEdema} onValueChange={setHasEdema}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes — Restrict Na/Fluid</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {scenario === "ckd" && (
                  <>
                    <div>
                      <Label className="text-xs font-semibold">eGFR (ml/min/1.73m²)</Label>
                      <Input type="number" value={egfr} onChange={e => setEgfr(e.target.value)} placeholder="e.g. 25" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">On Dialysis?</Label>
                      <Select value={onDialysis} onValueChange={setOnDialysis}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="HD">Hemodialysis</SelectItem>
                          <SelectItem value="PD">Peritoneal Dialysis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {scenario === "general" && (
                  <div>
                    <Label className="text-xs font-semibold">Activity Level</Label>
                    <Select value={activityLevel} onValueChange={setActivityLevel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={generateDiet} disabled={isGenerating} className="w-full bg-green-600 hover:bg-green-700 mt-2">
                  {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate AI Diet Plan</>}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Result Panel */}
          <div className="md:col-span-2 space-y-4">
            {activePlan ? (
              <>
                {/* Summary */}
                <Card className="bg-white shadow-lg border-2 border-green-300">
                  <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-teal-50 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-green-900 flex items-center gap-2">
                          <UtensilsCrossed className="w-5 h-5" />{scenario.toUpperCase()} Diet Plan
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">{activePlan.generatedAt} · {activePlan.guideline_source}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)}>
                          <Edit2 className="w-3 h-3 mr-1" />{isEditing ? "Editing" : "Edit"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={savePlan}><Download className="w-3 h-3 mr-1" />Save</Button>
                        <Button size="sm" variant="outline" onClick={copyPlan}><Copy className="w-3 h-3 mr-1" />Copy</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {isEditing ? (
                      <Textarea value={editedPlan.summary} onChange={e => setEditedPlan(p => ({ ...p, summary: e.target.value }))} className="h-20 text-sm" />
                    ) : (
                      <p className="text-sm text-slate-700">{activePlan.summary}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Nutrient Targets */}
                <Card className="bg-white shadow-lg">
                  <CardHeader className="pb-2 bg-blue-50 border-b">
                    <CardTitle className="text-sm font-semibold text-blue-900">Daily Nutrient Targets</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(activePlan.nutrient_targets || {}).map(([key, val]) => val && (
                        <div key={key} className="bg-slate-50 rounded-lg p-2 border text-center">
                          <div className="text-xs text-slate-500 mb-0.5 capitalize">{key.replace(/_/g, " ")}</div>
                          {isEditing ? (
                            <Input value={editedPlan.nutrient_targets[key]} onChange={e => setEditedPlan(p => ({ ...p, nutrient_targets: { ...p.nutrient_targets, [key]: e.target.value } }))} className="text-xs h-7 text-center" />
                          ) : (
                            <div className="font-bold text-sm text-slate-900">{val}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Meal Plan */}
                <Card className="bg-white shadow-lg">
                  <CardHeader className="pb-2 bg-amber-50 border-b">
                    <CardTitle className="text-sm font-semibold text-amber-900 flex items-center justify-between">
                      <span>Detailed Meal Plan</span>
                      {isEditing && (
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => {
                          const updated = { ...editedPlan };
                          updated.meal_plan.push({ meal: "New Meal", time: "—", items: ["Item 1"], portions: "TBD", rationale: "" });
                          setEditedPlan(updated);
                        }}>
                          <Plus className="w-3 h-3 mr-1" />Add Meal
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {(isEditing ? editedPlan.meal_plan : activePlan.meal_plan || []).map((meal, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center justify-between mb-1">
                          {isEditing ? (
                            <Input value={meal.meal} onChange={e => {
                              const updated = { ...editedPlan };
                              updated.meal_plan[idx].meal = e.target.value;
                              setEditedPlan(updated);
                            }} className="text-sm font-bold h-7 w-40" />
                          ) : (
                            <span className="font-bold text-sm text-amber-900">{meal.meal}</span>
                          )}
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">{meal.time}</Badge>
                            {isEditing && (
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                                const updated = { ...editedPlan };
                                updated.meal_plan.splice(idx, 1);
                                setEditedPlan(updated);
                              }}>
                                <X className="w-3 h-3 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <ul className="text-xs text-slate-700 space-y-0.5 mb-1">
                          {meal.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-1">
                              {isEditing ? (
                                <Input value={item} onChange={e => {
                                  const updated = { ...editedPlan };
                                  updated.meal_plan[idx].items[i] = e.target.value;
                                  setEditedPlan(updated);
                                }} className="text-xs h-6" />
                              ) : (
                                <><span className="text-green-600">•</span>{item}</>
                              )}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-slate-600 bg-white/60 p-1.5 rounded"><strong>Portions:</strong> {meal.portions}</p>
                        {meal.rationale && <p className="text-xs text-blue-700 mt-1 italic">{meal.rationale}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Foods to Eat/Avoid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-white shadow-lg border-2 border-green-300">
                    <CardHeader className="pb-2 bg-green-50 border-b">
                      <CardTitle className="text-sm font-semibold text-green-900 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />Foods to Include
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ul className="space-y-1">
                        {(activePlan.foods_to_eat || []).map((f, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
                            <span className="text-green-600 font-bold">✓</span>{f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg border-2 border-red-300">
                    <CardHeader className="pb-2 bg-red-50 border-b">
                      <CardTitle className="text-sm font-semibold text-red-900 flex items-center gap-1">
                        <X className="w-4 h-4" />Foods to Avoid
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ul className="space-y-1">
                        {(activePlan.foods_to_avoid || []).map((f, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
                            <span className="text-red-600 font-bold">✗</span>{f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Clinical Notes & References */}
                <Card className="bg-blue-50 border-blue-300 shadow-lg">
                  <CardHeader className="pb-2 border-b border-blue-200">
                    <CardTitle className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                      <Info className="w-4 h-4" />Clinical Rationale & Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    {isEditing ? (
                      <Textarea value={editedPlan.clinical_notes} onChange={e => setEditedPlan(p => ({ ...p, clinical_notes: e.target.value }))} className="h-24 text-xs" />
                    ) : (
                      <p className="text-xs text-blue-900 whitespace-pre-wrap">{activePlan.clinical_notes}</p>
                    )}
                    {activePlan.reference_links?.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-blue-200">
                        <p className="text-xs font-bold text-blue-800">References:</p>
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
                    <Button onClick={() => { setDietPlan(editedPlan); setIsEditing(false); toast.success("Changes saved"); }} className="flex-1 bg-green-600">
                      <Save className="w-4 h-4 mr-2" />Save Edits
                    </Button>
                    <Button onClick={() => { setEditedPlan(JSON.parse(JSON.stringify(dietPlan))); setIsEditing(false); }} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="bg-white shadow-lg h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center text-slate-400 p-8">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30 text-green-500" />
                  <p className="font-semibold text-slate-600">Select scenario and enter patient parameters</p>
                  <p className="text-sm mt-1">AI will generate an evidence-based, editable diet plan</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}