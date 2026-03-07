import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, UtensilsCrossed, Calculator, Download, Copy,
  Info, CheckCircle2, AlertTriangle, Leaf, Droplet, Zap,
  Save, WifiOff, Wifi, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "diet_generator_cache";

function saveToLocal(key, data) {
  try {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    store[key] = { data, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) { /* ignore */ }
}

function loadFromLocal(key) {
  try {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return store[key]?.data || null;
  } catch { return null; }
}

// Nephrotic Syndrome Diet Guidelines (IPNA/KDIGO)
function calculateNephroticDiet(weight, age, stage, edema) {
  const ibw = weight; // use actual weight for children
  const isEdematous = edema === "yes";
  
  // Protein: 1.0-1.5 g/kg/day (IPNA 2021)
  const proteinMin = Math.round(ibw * 1.0 * 10) / 10;
  const proteinMax = Math.round(ibw * 1.5 * 10) / 10;
  
  // Energy: 100-120% of RDA
  let energyPerKg = age < 3 ? 100 : age < 10 ? 90 : age < 15 ? 80 : 70;
  const energyMin = Math.round(ibw * energyPerKg);
  const energyMax = Math.round(ibw * energyPerKg * 1.2);
  
  // Sodium: 1-2 mEq/kg/day if edema; 2-3 mEq/kg if no edema
  const sodiumMin = isEdematous ? Math.round(ibw * 1 * 23) : Math.round(ibw * 2 * 23);
  const sodiumMax = isEdematous ? Math.round(ibw * 2 * 23) : Math.round(ibw * 3 * 23);
  
  // Fluid: restrict if edema
  const fluidMl = isEdematous ? Math.round(ibw * 20 + 500) : null;
  
  // Potassium: usually normal, restrict if hyperkalemia
  const potassiumMg = Math.round(ibw * 40); // 40 mg/kg/day
  
  return { proteinMin, proteinMax, energyMin, energyMax, sodiumMin, sodiumMax, fluidMl, potassiumMg };
}

// CKD Diet Guidelines (KDIGO/KDOQI)
function calculateCKDDiet(weight, age, egfr, stage, onDialysis, dialysisType) {
  const isHD = dialysisType === "HD";
  const isPD = dialysisType === "PD";
  
  // Protein: varies by stage
  let proteinMin, proteinMax;
  if (onDialysis === "yes") {
    if (isHD) { proteinMin = Math.round(weight * 1.2 * 10)/10; proteinMax = Math.round(weight * 1.5 * 10)/10; }
    else { proteinMin = Math.round(weight * 1.3 * 10)/10; proteinMax = Math.round(weight * 1.5 * 10)/10; }
  } else if (egfr < 15) {
    proteinMin = Math.round(weight * 0.6 * 10)/10; proteinMax = Math.round(weight * 0.8 * 10)/10;
  } else if (egfr < 30) {
    proteinMin = Math.round(weight * 0.8 * 10)/10; proteinMax = Math.round(weight * 1.0 * 10)/10;
  } else {
    proteinMin = Math.round(weight * 1.0 * 10)/10; proteinMax = Math.round(weight * 1.2 * 10)/10;
  }
  
  // Energy
  let energyPerKg = age < 3 ? 100 : age < 10 ? 90 : age < 15 ? 80 : 70;
  if (onDialysis === "yes") energyPerKg = Math.max(energyPerKg, 35);
  const energyMin = Math.round(weight * energyPerKg);
  const energyMax = Math.round(weight * energyPerKg * 1.1);
  
  // Phosphorus: restrict if eGFR < 45
  const phosphorus = egfr < 45 ? Math.round(weight * 15) : null; // 15 mg/kg/day max
  
  // Potassium: restrict if eGFR < 30 or HD
  const potassium = (egfr < 30 || isHD) ? Math.round(weight * 30) : null; // 30 mg/kg/day max
  
  // Sodium: 1-2 g/day in CKD, 2-3 g in dialysis
  const sodiumGrams = onDialysis === "yes" ? "2-3 g/day" : egfr < 45 ? "1-2 g/day" : "2-3 g/day";
  
  // Fluid: restrict in HD
  const fluidMl = isHD ? 1000 : isPD ? null : egfr < 15 ? Math.round(weight * 20 + 500) : null;
  
  // Calcium: 400-800 mg/day
  const calcium = "400-800 mg/day";
  
  return { proteinMin, proteinMax, energyMin, energyMax, phosphorus, potassium, sodiumGrams, fluidMl, calcium };
}

// IAP Nutrition Guidelines for healthy children
function calculateIAPNutrition(age, weight, gender) {
  // Energy (ICMR/IAP)
  let energy, protein;
  if (age < 1) { energy = 108; protein = 1.5; }
  else if (age < 3) { energy = 102; protein = 1.1; }
  else if (age < 7) { energy = 90; protein = 1.0; }
  else if (age < 10) { energy = 80; protein = 1.0; }
  else if (age < 13) { energy = 70; protein = 1.0; }
  else { energy = gender === "Male" ? 60 : 55; protein = 0.85; }
  
  const totalEnergy = Math.round(weight * energy);
  const totalProtein = Math.round(weight * protein * 10) / 10;
  
  // Macros
  const carbsG = Math.round((totalEnergy * 0.55) / 4);
  const fatG = Math.round((totalEnergy * 0.30) / 9);
  
  // Micronutrients (ICMR 2020)
  const calcium = age < 1 ? 500 : age < 10 ? 600 : 800;
  const iron = age < 1 ? 9 : age < 5 ? 9 : age < 10 ? 13 : gender === "Female" ? 27 : 17;
  const vitD = 600; // IU
  const zinc = age < 3 ? 3 : age < 9 ? 5 : 8;
  
  return { totalEnergy, totalProtein, carbsG, fatG, calcium, iron, vitD, zinc };
}

const INDIAN_FOODS = {
  protein: ["Dhal (arhar/moong/masoor)", "Paneer", "Egg", "Chicken (skinless)", "Fish", "Rajma", "Chana", "Soya chunks", "Curd/Yogurt", "Milk"],
  carbs: ["Rice", "Chapati (atta)", "Ragi", "Jowar roti", "Upma (semolina)", "Poha", "Oats", "Bread (whole wheat)"],
  fats: ["Ghee (sparingly)", "Coconut oil", "Mustard oil", "Nuts (walnut, almond)", "Seeds (flax, sunflower)"],
  lowPotassium: ["Apple", "Grapes", "Rice", "Cabbage", "Cauliflower", "Ash gourd", "Ridge gourd", "Bread"],
  highPotassium: ["Banana", "Orange", "Potato", "Tomato", "Spinach", "Coconut water", "Dates", "Avocado"],
  lowPhosphorus: ["Egg white", "Cabbage", "Apple", "Grapes", "Rice", "Noodles", "Bread"],
  highPhosphorus: ["Dhal/Legumes (if restrict)", "Dairy", "Cola drinks", "Nuts", "Whole grains"],
  lowSodium: ["Fresh vegetables (unprocessed)", "Home-cooked food without added salt", "Fruits", "Rice", "Chapati (without salt)"],
};

export default function DietGenerator() {
  const [mode, setMode] = useState("nephrotic"); // nephrotic | ckd | iap
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Common inputs
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  
  // Nephrotic specific
  const [edema, setEdema] = useState("yes");
  const [nephroticStage, setNephroticStage] = useState("active");
  
  // CKD specific
  const [egfr, setEgfr] = useState("");
  const [ckdStage, setCkdStage] = useState("3");
  const [onDialysis, setOnDialysis] = useState("no");
  const [dialysisType, setDialysisType] = useState("HD");
  
  const [result, setResult] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);

  useEffect(() => {
    const handler = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handler);
    window.addEventListener("offline", handler);
    const saved = loadFromLocal("saved_plans") || [];
    setSavedPlans(saved);
    return () => { window.removeEventListener("online", handler); window.removeEventListener("offline", handler); };
  }, []);

  const calculate = () => {
    if (!weight || !age) { toast.error("Please enter weight and age"); return; }
    const w = parseFloat(weight);
    const a = parseFloat(age);
    
    let res;
    if (mode === "nephrotic") {
      res = { type: "nephrotic", ...calculateNephroticDiet(w, a, nephroticStage, edema) };
    } else if (mode === "ckd") {
      if (!egfr) { toast.error("Please enter eGFR"); return; }
      res = { type: "ckd", ...calculateCKDDiet(w, a, parseFloat(egfr), ckdStage, onDialysis, dialysisType) };
    } else {
      res = { type: "iap", ...calculateIAPNutrition(a, w, gender) };
    }
    res.weight = w; res.age = a; res.gender = gender; res.calculatedAt = new Date().toLocaleString();
    setResult(res);
    // Auto-save to localStorage
    saveToLocal("last_result", res);
    toast.success("Diet plan calculated and saved offline");
  };

  const savePlan = () => {
    if (!result) return;
    const plan = { ...result, id: Date.now(), label: `${mode.toUpperCase()} - ${result.age}y ${result.weight}kg - ${result.calculatedAt}` };
    const updated = [plan, ...savedPlans.slice(0, 9)];
    setSavedPlans(updated);
    saveToLocal("saved_plans", updated);
    toast.success("Plan saved offline");
  };

  const copyPlan = () => {
    if (!result) return;
    let text = `DIET PLAN - ${mode.toUpperCase()}\nGenerated: ${result.calculatedAt}\nAge: ${result.age}y | Weight: ${result.weight}kg\n\n`;
    if (result.type === "nephrotic") {
      text += `Protein: ${result.proteinMin}-${result.proteinMax} g/day\nEnergy: ${result.energyMin}-${result.energyMax} kcal/day\nSodium: ${result.sodiumMin}-${result.sodiumMax} mg/day\n`;
      if (result.fluidMl) text += `Fluid restriction: ${result.fluidMl} mL/day\n`;
    } else if (result.type === "ckd") {
      text += `Protein: ${result.proteinMin}-${result.proteinMax} g/day\nEnergy: ${result.energyMin}-${result.energyMax} kcal/day\nSodium: ${result.sodiumGrams}\n`;
      if (result.phosphorus) text += `Phosphorus: max ${result.phosphorus} mg/day\n`;
      if (result.potassium) text += `Potassium: max ${result.potassium} mg/day\n`;
      if (result.fluidMl) text += `Fluid: ${result.fluidMl} mL/day\n`;
    } else {
      text += `Energy: ${result.totalEnergy} kcal/day\nProtein: ${result.totalProtein} g/day\nCarbs: ${result.carbsG} g/day\nFat: ${result.fatG} g/day\n`;
      text += `Calcium: ${result.calcium} mg/day\nIron: ${result.iron} mg/day\nVitamin D: ${result.vitD} IU/day\n`;
    }
    navigator.clipboard.writeText(text);
    toast.success("Plan copied to clipboard");
  };

  const renderResult = () => {
    if (!result) return null;
    
    if (result.type === "nephrotic") return <NephroticResult result={result} />;
    if (result.type === "ckd") return <CKDResult result={result} />;
    return <IAPResult result={result} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <UtensilsCrossed className="w-7 h-7 text-green-600" />
              Diet & Nutrition Generator
            </h1>
            <p className="text-sm text-slate-600">IPNA · KDIGO · KDOQI · IAP / ICMR Guidelines</p>
          </div>
          <Badge className={isOnline ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
            {isOnline ? <><Wifi className="w-3 h-3 mr-1" />Online</> : <><WifiOff className="w-3 h-3 mr-1" />Offline – Saved data available</>}
          </Badge>
        </div>

        <Tabs value={mode} onValueChange={(v) => { setMode(v); setResult(null); }}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="nephrotic">Nephrotic Syndrome</TabsTrigger>
            <TabsTrigger value="ckd">CKD / Dialysis</TabsTrigger>
            <TabsTrigger value="iap">General Pediatrics (IAP)</TabsTrigger>
          </TabsList>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Panel */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calculator className="w-5 h-5 text-green-600" />
                  Patient Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Weight (kg) *</Label>
                    <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 20" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Age (years) *</Label>
                    <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 8" className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <TabsContent value="nephrotic" className="mt-0 p-0 space-y-3">
                  <div>
                    <Label className="text-xs font-semibold">Disease Activity</Label>
                    <Select value={nephroticStage} onValueChange={setNephroticStage}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active Nephrotic (in relapse)</SelectItem>
                        <SelectItem value="remission">In Remission</SelectItem>
                        <SelectItem value="steroid">On Steroids (long-term)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Edema Present?</Label>
                    <Select value={edema} onValueChange={setEdema}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes – Restrict sodium/fluid</SelectItem>
                        <SelectItem value="no">No – Liberal diet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="ckd" className="mt-0 p-0 space-y-3">
                  <div>
                    <Label className="text-xs font-semibold">eGFR (mL/min/1.73m²)</Label>
                    <Input type="number" value={egfr} onChange={e => setEgfr(e.target.value)} placeholder="e.g. 25" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">On Dialysis?</Label>
                    <Select value={onDialysis} onValueChange={setOnDialysis}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">Not on dialysis</SelectItem>
                        <SelectItem value="yes">Yes – On dialysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {onDialysis === "yes" && (
                    <div>
                      <Label className="text-xs font-semibold">Dialysis Type</Label>
                      <Select value={dialysisType} onValueChange={setDialysisType}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HD">Hemodialysis (HD)</SelectItem>
                          <SelectItem value="PD">Peritoneal Dialysis (PD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>

                <Button onClick={calculate} className="w-full bg-green-600 hover:bg-green-700">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Diet Plan
                </Button>
              </CardContent>
            </Card>

            {/* Result Panel */}
            <div className="space-y-4">
              {result ? (
                <>
                  {renderResult()}
                  <div className="flex gap-2">
                    <Button onClick={savePlan} variant="outline" className="flex-1">
                      <Save className="w-4 h-4 mr-2" />Save Offline
                    </Button>
                    <Button onClick={copyPlan} variant="outline" className="flex-1">
                      <Copy className="w-4 h-4 mr-2" />Copy
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="bg-white shadow-lg h-full flex items-center justify-center min-h-[300px]">
                  <div className="text-center text-slate-400 p-8">
                    <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">Enter parameters and click Calculate</p>
                    <p className="text-sm mt-1">Results saved automatically offline</p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Indian Food Guide */}
          <TabsContent value="nephrotic">
            <NephroticFoodGuide />
          </TabsContent>
          <TabsContent value="ckd">
            <CKDFoodGuide />
          </TabsContent>
          <TabsContent value="iap">
            <IAPFoodGuide />
          </TabsContent>
        </Tabs>

        {/* Saved Plans */}
        {savedPlans.length > 0 && (
          <Card className="mt-6 bg-white shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Save className="w-4 h-4 text-green-600" />
                Saved Plans (Offline – {savedPlans.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {savedPlans.map(plan => (
                  <div key={plan.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border text-sm">
                    <span className="text-slate-700 truncate flex-1">{plan.label}</span>
                    <Button size="sm" variant="ghost" onClick={() => setResult(plan)}>Load</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function NephroticResult({ result }) {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-600" />Nephrotic Syndrome Diet Plan
        </CardTitle>
        <p className="text-xs text-slate-500">{result.calculatedAt} · IPNA 2021</p>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <NutrientRow label="Protein" value={`${result.proteinMin}–${result.proteinMax} g/day`} sub="1.0–1.5 g/kg/day" color="bg-blue-50 border-blue-200" />
        <NutrientRow label="Energy" value={`${result.energyMin}–${result.energyMax} kcal/day`} sub="100–120% RDA" color="bg-green-50 border-green-200" />
        <NutrientRow label="Sodium" value={`${result.sodiumMin}–${result.sodiumMax} mg/day`} sub={result.fluidMl ? "Restricted (edema)" : "Standard restriction"} color="bg-amber-50 border-amber-200" />
        {result.fluidMl && <NutrientRow label="Fluid" value={`${result.fluidMl} mL/day`} sub="Restrict (edema present)" color="bg-red-50 border-red-200" />}
        <NutrientRow label="Potassium" value={`${result.potassiumMg} mg/day`} sub="40 mg/kg/day (usually unrestricted)" color="bg-purple-50 border-purple-200" />
        <Alert className="bg-amber-50 border-amber-200 mt-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800">
            High-protein diet (>2 g/kg) is NOT recommended — it increases proteinuria. Avoid processed foods, pickles, papads, packaged snacks (high sodium).
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function CKDResult({ result }) {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />CKD / Dialysis Diet Plan
        </CardTitle>
        <p className="text-xs text-slate-500">{result.calculatedAt} · KDIGO / KDOQI</p>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <NutrientRow label="Protein" value={`${result.proteinMin}–${result.proteinMax} g/day`} sub="Per KDOQI stage" color="bg-purple-50 border-purple-200" />
        <NutrientRow label="Energy" value={`${result.energyMin}–${result.energyMax} kcal/day`} sub="Adequate for growth" color="bg-green-50 border-green-200" />
        <NutrientRow label="Sodium" value={result.sodiumGrams} sub="Reduce processed food" color="bg-amber-50 border-amber-200" />
        {result.phosphorus && <NutrientRow label="Phosphorus" value={`≤ ${result.phosphorus} mg/day`} sub="15 mg/kg/day limit" color="bg-red-50 border-red-200" />}
        {result.potassium && <NutrientRow label="Potassium" value={`≤ ${result.potassium} mg/day`} sub="Restrict hyperkalemia risk" color="bg-orange-50 border-orange-200" />}
        {result.fluidMl && <NutrientRow label="Fluid" value={`${result.fluidMl} mL/day`} sub="Strict HD restriction" color="bg-blue-50 border-blue-200" />}
        <NutrientRow label="Calcium" value={result.calcium} sub="Avoid over-supplementation" color="bg-teal-50 border-teal-200" />
      </CardContent>
    </Card>
  );
}

function IAPResult({ result }) {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600" />IAP / ICMR Nutrition Plan
        </CardTitle>
        <p className="text-xs text-slate-500">{result.calculatedAt} · ICMR 2020 / IAP</p>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <NutrientRow label="Energy" value={`${result.totalEnergy} kcal/day`} sub="Per ICMR RDA" color="bg-green-50 border-green-200" />
        <NutrientRow label="Protein" value={`${result.totalProtein} g/day`} sub="0.85–1.5 g/kg/day by age" color="bg-blue-50 border-blue-200" />
        <NutrientRow label="Carbohydrates" value={`${result.carbsG} g/day`} sub="55% of energy" color="bg-amber-50 border-amber-200" />
        <NutrientRow label="Fat" value={`${result.fatG} g/day`} sub="30% of energy" color="bg-orange-50 border-orange-200" />
        <NutrientRow label="Calcium" value={`${result.calcium} mg/day`} sub="Milk, paneer, ragi" color="bg-teal-50 border-teal-200" />
        <NutrientRow label="Iron" value={`${result.iron} mg/day`} sub="Green leafy veg, jaggery" color="bg-red-50 border-red-200" />
        <NutrientRow label="Vitamin D" value={`${result.vitD} IU/day`} sub="Sun exposure + fortified foods" color="bg-yellow-50 border-yellow-200" />
        <NutrientRow label="Zinc" value={`${result.zinc} mg/day`} sub="Legumes, nuts, seeds" color="bg-purple-50 border-purple-200" />
      </CardContent>
    </Card>
  );
}

function NutrientRow({ label, value, sub, color }) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg border ${color}`}>
      <div>
        <div className="font-semibold text-sm text-slate-900">{label}</div>
        <div className="text-xs text-slate-500">{sub}</div>
      </div>
      <div className="font-bold text-sm text-slate-800 text-right">{value}</div>
    </div>
  );
}

function NephroticFoodGuide() {
  return (
    <Card className="mt-6 bg-white shadow-lg">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Leaf className="w-5 h-5 text-blue-600" />Indian Food Guide — Nephrotic Syndrome
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <FoodGroup title="✅ Recommended (Low Sodium)" items={["Rice, chapati (without salt)", "Fruits: apple, pear, grapes, papaya", "Vegetables: lauki, tinda, tori, parwal", "Curd (unsalted)", "Homemade food without added salt", "Coconut water (if no edema)"]} color="green" />
          <FoodGroup title="❌ Avoid / Restrict" items={["Papads, pickles, chutneys, achaar", "Namkeen, chips, biscuits, packaged food", "Maida products, instant noodles", "High-sodium bread, processed cheese", "Salty dal preparations", "Restaurant/fast food"]} color="red" />
          <FoodGroup title="🥚 Good Protein Sources" items={["Egg white (avoid yolk if hyperlipidemia)", "Moong dal (low phosphorus)", "Chicken (boiled/grilled, no salt)", "Fish (fresh, not salted)", "Dahi/paneer (unsalted)", "Soya milk / tofu"]} color="blue" />
          <FoodGroup title="⚠️ If Edema: Fluid Restriction" items={["Count ALL fluids: water, soup, dal, rasam", "Use small cups (150 mL)", "Suck ice chips instead of drinking", "Avoid watermelon, oranges (high fluid)", "Weigh daily in morning (track fluid retention)", "Record urine output if oliguria"]} color="amber" />
        </div>
      </CardContent>
    </Card>
  );
}

function CKDFoodGuide() {
  return (
    <Card className="mt-6 bg-white shadow-lg">
      <CardHeader className="bg-purple-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Leaf className="w-5 h-5 text-purple-600" />Indian Food Guide — CKD / Dialysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <FoodGroup title="✅ Low Phosphorus Foods" items={["Rice, maida, suji (semolina)", "Egg white (not yolk)", "Cabbage, cauliflower, beans", "Apple, grapes, papaya (peel)", "White bread, idli, dosa", "Coconut (small amounts)"]} color="green" />
          <FoodGroup title="❌ High Phosphorus — Restrict" items={["Dhal/legumes (soak & discard water)", "Dairy products (milk, paneer)", "Cola drinks (phosphoric acid!)", "Nuts and dry fruits", "Whole wheat/bran products", "Chocolate, cocoa"]} color="red" />
          <FoodGroup title="🍌 High Potassium — Avoid (HD)" items={["Banana, orange, coconut water", "Potato, tomato, spinach (palak)", "Dates, dried fruits, avocado", "Fruit juices", "Mosambi, chiku", "Winter melon (petha)"]} color="orange" />
          <FoodGroup title="✅ Low Potassium Choices" items={["Apple, grapes (peeled)", "Cabbage, cauliflower (boiled, drain water)", "Rice, bread, noodles", "Egg white, chicken (small portions)", "Waterleach vegetables: peel, cut, soak 4h, drain, cook", "Avoid processed tomato sauce"]} color="blue" />
        </div>
        <Alert className="mt-4 bg-amber-50 border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800">
            <strong>Water-leaching technique:</strong> Peel vegetables, cut small, soak in water for 2-4 hours, discard water, then boil in fresh water and discard again. Reduces potassium by 30-50%.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function IAPFoodGuide() {
  return (
    <Card className="mt-6 bg-white shadow-lg">
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600" />IAP Indian Food Guide — Healthy Children
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <FoodGroup title="🌾 Cereals & Grains (55% energy)" items={["Rice, chapati, roti (2-6/day by age)", "Millets: ragi, jowar, bajra (calcium-rich)", "Poha, upma, daliya (breakfast)", "Idli, dosa, uttapam (fermented = better bioavailability)", "Whole wheat bread", "Oats porridge"]} color="amber" />
          <FoodGroup title="🥛 Dairy & Protein (3 servings)" items={["Milk: 300-500 mL/day (age-appropriate)", "Curd/dahi: 1 cup/day (probiotic)", "Paneer: 30-50g (calcium + protein)", "Eggs: 1-2/day (complete protein)", "Dal/legumes: 2 servings (plant protein)", "Fish 2-3x/week (omega-3)"]} color="blue" />
          <FoodGroup title="🥬 Fruits & Vegetables (5 servings)" items={["Green leafy: palak, methi, drumstick (iron)", "Yellow/orange: carrot, pumpkin (Vit A)", "Citrus: amla, orange (Vit C → iron absorption)", "Seasonal local fruits preferred", "Avoid fruit juices — eat whole fruits", "Avoid raw salad if water quality poor"]} color="green" />
          <FoodGroup title="⚠️ IAP — What to Avoid" items={["Sugar-sweetened beverages, cola", "Ultra-processed snacks (chips, biscuits)", "Excessive maida products (white bread, pizza)", "Trans fats (vanaspati, margarine)", "Screen time eating — mindful eating", "Skipping breakfast (impairs cognition)"]} color="red" />
        </div>
        <Alert className="mt-4 bg-teal-50 border-teal-200">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <AlertDescription className="text-xs text-teal-800">
            <strong>IAP 2022 Key Recommendations:</strong> Promote breastfeeding up to 2 years. Introduce complementary foods at 6 months. Encourage millet consumption. Iron supplementation at 6 months for breastfed infants. Vitamin D 400-600 IU from birth. Avoid junk food and sugar-sweetened beverages.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function FoodGroup({ title, items, color }) {
  const colors = {
    green: "bg-green-50 border-green-200",
    red: "bg-red-50 border-red-200",
    blue: "bg-blue-50 border-blue-200",
    amber: "bg-amber-50 border-amber-200",
    orange: "bg-orange-50 border-orange-200",
    teal: "bg-teal-50 border-teal-200",
  };
  return (
    <div className={`p-3 rounded-lg border ${colors[color] || colors.green}`}>
      <h4 className="font-semibold text-sm mb-2">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
            <span className="text-slate-400 mt-0.5">•</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}