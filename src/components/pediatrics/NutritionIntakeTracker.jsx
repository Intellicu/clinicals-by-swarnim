import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, Plus, Trash2, TrendingUp, Apple, Droplets, Activity, Info, BarChart2, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { toast } from "sonner";

const STORAGE_KEY = "peds_nutrition_logs";

// ICMR-NIN 2020 RDA by age (ageMin, ageMax in months)
const RDA_TABLE = [
  { ageMin: 0,  ageMax: 5,   kcal: 92,  proteinGkg: 1.16, fluidMlkg: 150 }, // per kg for <6m
  { ageMin: 6,  ageMax: 11,  kcal: 80,  proteinGkg: 1.5,  fluidMlkg: 120 },
  { ageMin: 12, ageMax: 35,  kcal: 83,  proteinGkg: 1.1,  fluidMlkg: 100 },
  { ageMin: 36, ageMax: 71,  kcal: 75,  proteinGkg: 1.1,  fluidMlkg: 90  },
  { ageMin: 72, ageMax: 107, kcal: 65,  proteinGkg: 1.0,  fluidMlkg: 70  },
  { ageMin: 108,ageMax: 143, kcal: 60,  proteinGkg: 0.95, fluidMlkg: 60  },
  { ageMin: 144,ageMax: 216, kcal: 50,  proteinGkg: 0.85, fluidMlkg: 50  },
];

// Disease modifiers
const DISEASE_MODIFIERS = {
  healthy: { label: "Healthy Child", calorieMultiplier: 1.0, proteinGkg: null, notes: "" },
  nephrotic: { label: "Nephrotic Syndrome", calorieMultiplier: 1.0, proteinGkg: [1.0, 1.5], notes: "Normal calories. Protein 1–1.5 g/kg/day (not restricted). Sodium restriction: <1500 mg/day during relapse. Avoid excess protein (worsens proteinuria)." },
  aki_no_dialysis: { label: "AKI (No Dialysis)", calorieMultiplier: 1.2, proteinGkg: [0.8, 1.2], notes: "High calories (120% normal). Protein 0.8–1.2 g/kg/day to minimize uremia. Fluid restriction per urine output + insensible losses. Potassium and phosphorus restriction." },
  aki_dialysis: { label: "AKI (On Dialysis)", calorieMultiplier: 1.2, proteinGkg: [1.5, 2.0], notes: "High calories. Increased protein 1.5–2.0 g/kg/day to replace dialysis losses. Fluid as prescribed. Monitor electrolytes daily." },
  ckd_1_2: { label: "CKD Stage 1–2", calorieMultiplier: 1.0, proteinGkg: [1.0, 1.5], notes: "Normal calories for age. Protein 100% of RDA (1.0–1.5 g/kg). No restriction at this stage unless proteinuria significant." },
  ckd_3_4: { label: "CKD Stage 3–4", calorieMultiplier: 1.1, proteinGkg: [0.8, 1.0], notes: "Slightly increased calories. Moderate protein restriction: 0.8–1.0 g/kg/day. Phosphorus restriction. Sodium <1.5 g/day." },
  ckd_5_dialysis: { label: "CKD Stage 5 / Dialysis", calorieMultiplier: 1.2, proteinGkg: [1.4, 1.8], notes: "High calories. Increased protein 1.4–1.8 g/kg/day (dialysis losses). Strict fluid, potassium, phosphorus restriction. Refer to dietitian." },
  post_transplant: { label: "Post-Transplant", calorieMultiplier: 1.1, proteinGkg: [1.2, 1.8], notes: "Increased calories and protein early post-transplant. Avoid high potassium foods (tacrolimus hyperkalemia). Steroids cause increased appetite and weight gain risk." },
};

// Food composition (approximate per common serving)
const FOOD_ITEMS = {
  milk: [
    { name: "Breast Milk", unit: "ml", kcalPer100: 67, proteinPer100: 1.0 },
    { name: "Formula Milk (standard)", unit: "ml", kcalPer100: 68, proteinPer100: 1.4 },
    { name: "Cow's Milk (full fat)", unit: "ml", kcalPer100: 61, proteinPer100: 3.2 },
    { name: "Buffalo Milk", unit: "ml", kcalPer100: 110, proteinPer100: 4.3 },
  ],
  cereals: [
    { name: "Rice (cooked)", unit: "g", kcalPer100: 130, proteinPer100: 2.7 },
    { name: "Khichdi (rice+dal)", unit: "g", kcalPer100: 120, proteinPer100: 4.5 },
    { name: "Roti/Chapati", unit: "g", kcalPer100: 297, proteinPer100: 9.7 },
    { name: "Suji/Semolina porridge", unit: "g", kcalPer100: 145, proteinPer100: 4.0 },
    { name: "Ragi (finger millet) porridge", unit: "g", kcalPer100: 133, proteinPer100: 3.5 },
    { name: "Oats porridge", unit: "g", kcalPer100: 71, proteinPer100: 2.5 },
    { name: "Idli (steamed)", unit: "g", kcalPer100: 149, proteinPer100: 3.9 },
    { name: "Dosa", unit: "g", kcalPer100: 168, proteinPer100: 3.8 },
  ],
  pulses: [
    { name: "Dal (cooked)", unit: "g", kcalPer100: 116, proteinPer100: 7.5 },
    { name: "Rajma (cooked)", unit: "g", kcalPer100: 127, proteinPer100: 8.7 },
    { name: "Chana (cooked)", unit: "g", kcalPer100: 164, proteinPer100: 8.9 },
    { name: "Moong dal (cooked)", unit: "g", kcalPer100: 105, proteinPer100: 7.2 },
  ],
  protein: [
    { name: "Egg (whole, boiled)", unit: "g", kcalPer100: 155, proteinPer100: 13.0 },
    { name: "Chicken (cooked)", unit: "g", kcalPer100: 165, proteinPer100: 25.0 },
    { name: "Fish (cooked, avg)", unit: "g", kcalPer100: 150, proteinPer100: 22.0 },
    { name: "Paneer", unit: "g", kcalPer100: 265, proteinPer100: 18.0 },
    { name: "Curd/Yogurt", unit: "g", kcalPer100: 58, proteinPer100: 3.1 },
    { name: "Soya chunks (cooked)", unit: "g", kcalPer100: 100, proteinPer100: 14.0 },
  ],
  vegetables: [
    { name: "Potato (cooked)", unit: "g", kcalPer100: 87, proteinPer100: 1.9 },
    { name: "Lauki / Bottle gourd", unit: "g", kcalPer100: 14, proteinPer100: 0.6 },
    { name: "Carrot (cooked)", unit: "g", kcalPer100: 35, proteinPer100: 0.8 },
    { name: "Spinach/Palak (cooked)", unit: "g", kcalPer100: 23, proteinPer100: 2.9 },
    { name: "Mixed sabzi", unit: "g", kcalPer100: 55, proteinPer100: 2.0 },
  ],
  fruits: [
    { name: "Banana (medium ~80g)", unit: "g", kcalPer100: 89, proteinPer100: 1.1 },
    { name: "Apple", unit: "g", kcalPer100: 52, proteinPer100: 0.3 },
    { name: "Mango", unit: "g", kcalPer100: 60, proteinPer100: 0.8 },
    { name: "Papaya", unit: "g", kcalPer100: 43, proteinPer100: 0.5 },
    { name: "Guava", unit: "g", kcalPer100: 68, proteinPer100: 2.6 },
  ],
  fluids: [
    { name: "Water/ORS", unit: "ml", kcalPer100: 0, proteinPer100: 0 },
    { name: "Coconut water", unit: "ml", kcalPer100: 19, proteinPer100: 0.7 },
    { name: "Fruit juice (diluted)", unit: "ml", kcalPer100: 45, proteinPer100: 0.3 },
    { name: "IV Fluids (NS/RL/DNS)", unit: "ml", kcalPer100: 5, proteinPer100: 0 },
  ],
};

const CAT_COLORS = { milk: "bg-blue-100 text-blue-800 border-blue-300", cereals: "bg-amber-100 text-amber-800 border-amber-300", pulses: "bg-orange-100 text-orange-800 border-orange-300", protein: "bg-red-100 text-red-800 border-red-300", vegetables: "bg-green-100 text-green-800 border-green-300", fruits: "bg-purple-100 text-purple-800 border-purple-300", fluids: "bg-cyan-100 text-cyan-800 border-cyan-300" };

function getRDA(ageMonths, weightKg) {
  const row = RDA_TABLE.find(r => ageMonths >= r.ageMin && ageMonths <= r.ageMax) || RDA_TABLE[RDA_TABLE.length - 1];
  return {
    kcal: Math.round(row.kcal * weightKg),
    proteinG: parseFloat((row.proteinGkg * weightKg).toFixed(1)),
    fluidMl: Math.round(row.fluidMlkg * weightKg),
    kcalPerKg: row.kcal,
    proteinGkg: row.proteinGkg,
  };
}

export default function NutritionIntakeTracker({ patientId, patientName }) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [ageMonths, setAgeMonths] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [disease, setDisease] = useState("healthy");
  const [logs, setLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
  });
  const [addCategory, setAddCategory] = useState("milk");
  const [addFood, setAddFood] = useState("");
  const [addQty, setAddQty] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const saveLogs = (updated) => {
    setLogs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const dayLog = logs[selectedDate] || { items: [] };

  const addItem = () => {
    if (!addFood || !addQty) { toast.error("Select food and enter quantity"); return; }
    const cat = FOOD_ITEMS[addCategory];
    const foodObj = cat.find(f => f.name === addFood);
    if (!foodObj) return;
    const qty = parseFloat(addQty);
    const kcal = parseFloat(((foodObj.kcalPer100 / 100) * qty).toFixed(1));
    const protein = parseFloat(((foodObj.proteinPer100 / 100) * qty).toFixed(1));
    const updated = {
      ...logs,
      [selectedDate]: {
        items: [...(dayLog.items || []), { category: addCategory, name: foodObj.name, qty, unit: foodObj.unit, kcal, protein }]
      }
    };
    saveLogs(updated);
    setAddFood("");
    setAddQty("");
    toast.success(`${foodObj.name} added`);
  };

  const removeItem = (idx) => {
    const updated = { ...logs, [selectedDate]: { items: dayLog.items.filter((_, i) => i !== idx) } };
    saveLogs(updated);
  };

  // Totals
  const totalKcal = dayLog.items.reduce((s, i) => s + i.kcal, 0);
  const totalProtein = dayLog.items.reduce((s, i) => s + i.protein, 0);
  const totalFluid = dayLog.items.filter(i => i.unit === "ml").reduce((s, i) => s + i.qty, 0);

  // Requirements
  const ageM = parseFloat(ageMonths);
  const wKg = parseFloat(weightKg);
  const hasPatientData = ageM > 0 && wKg > 0;
  const baseRDA = hasPatientData ? getRDA(ageM, wKg) : null;
  const modifier = DISEASE_MODIFIERS[disease];

  const reqKcal = baseRDA ? Math.round(baseRDA.kcal * modifier.calorieMultiplier) : null;
  const reqProteinMin = baseRDA ? (modifier.proteinGkg ? parseFloat((modifier.proteinGkg[0] * wKg).toFixed(1)) : baseRDA.proteinG) : null;
  const reqProteinMax = baseRDA ? (modifier.proteinGkg ? parseFloat((modifier.proteinGkg[1] * wKg).toFixed(1)) : baseRDA.proteinG) : null;
  const reqFluid = baseRDA ? baseRDA.fluidMl : null;

  const kcalPct = reqKcal ? Math.round((totalKcal / reqKcal) * 100) : null;
  const proteinPct = reqProteinMin ? Math.round((totalProtein / reqProteinMin) * 100) : null;
  const fluidPct = reqFluid ? Math.round((totalFluid / reqFluid) * 100) : null;

  // Alerts
  const alerts = [];
  if (kcalPct !== null && kcalPct < 75) alerts.push({ type: "error", msg: `⚠️ Calorie deficit: ${totalKcal} / ${reqKcal} kcal (${kcalPct}%) — Growth risk!` });
  if (kcalPct !== null && kcalPct > 130) alerts.push({ type: "warn", msg: `⚠️ Calorie excess: ${kcalPct}% — Monitor weight gain` });
  if (proteinPct !== null && proteinPct < 75) alerts.push({ type: "error", msg: `⚠️ Protein deficiency: ${totalProtein}g / ${reqProteinMin}g minimum` });
  if (reqProteinMax && totalProtein > reqProteinMax + 5) alerts.push({ type: "warn", msg: `⚠️ Excess protein: ${totalProtein}g > max ${reqProteinMax}g — Risk of uremia (CKD)` });
  if (fluidPct !== null && fluidPct > 120) alerts.push({ type: "error", msg: `⚠️ Fluid overload risk: ${totalFluid}ml / recommended ${reqFluid}ml` });
  if (fluidPct !== null && fluidPct < 60) alerts.push({ type: "warn", msg: `⚠️ Low fluid intake: ${totalFluid}ml / recommended ${reqFluid}ml` });

  // Trend data (last 7 days)
  const trendData = Object.entries(logs)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, data]) => ({
      date: date.slice(5),
      kcal: data.items?.reduce((s, i) => s + i.kcal, 0) || 0,
      protein: parseFloat((data.items?.reduce((s, i) => s + i.protein, 0) || 0).toFixed(1)),
      fluid: data.items?.filter(i => i.unit === "ml").reduce((s, i) => s + i.qty, 0) || 0,
    }));

  const ProgressBar = ({ value, max, color, label }) => {
    const pct = max ? Math.min(Math.round((value / max) * 100), 120) : 0;
    const colorMap = { green: "bg-green-500", orange: "bg-orange-500", blue: "bg-blue-500", red: "bg-red-500" };
    const barColor = pct < 75 ? "bg-red-400" : pct > 115 ? "bg-orange-400" : colorMap[color] || "bg-green-500";
    return (
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium text-slate-700">{label}</span>
          <span className={`font-bold ${pct < 75 ? "text-red-600" : pct > 115 ? "text-orange-600" : "text-green-600"}`}>{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className={`${barColor} h-3 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-0.5">
          <span>{value} {label.includes("kcal") ? "kcal" : label.includes("Protein") ? "g" : "ml"}</span>
          <span>Req: {max} {label.includes("kcal") ? "kcal" : label.includes("Protein") ? "g" : "ml"}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Patient & Disease Setup */}
      <Card className="bg-white border-2 border-orange-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-600" />
              Patient Setup & Requirements
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(!showForm)} className="h-7 w-7 p-0">
              {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Age (months)</label>
                <Input type="number" placeholder="e.g. 24" value={ageMonths} onChange={e => setAgeMonths(e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
                <Input type="number" step="0.1" placeholder="e.g. 10.5" value={weightKg} onChange={e => setWeightKg(e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-600">Clinical Condition</label>
                <Select value={disease} onValueChange={setDisease}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DISEASE_MODIFIERS).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {modifier.notes && (
              <Alert className="bg-blue-50 border-blue-200 py-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <AlertDescription className="text-xs text-blue-900 ml-1">{modifier.notes}</AlertDescription>
              </Alert>
            )}
            {hasPatientData && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Required Calories</p>
                  <p className="font-black text-green-700 text-lg">{reqKcal}</p>
                  <p className="text-xs text-slate-400">kcal/day</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Protein</p>
                  <p className="font-black text-blue-700 text-lg">{reqProteinMin}–{reqProteinMax}</p>
                  <p className="text-xs text-slate-400">g/day</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Fluid</p>
                  <p className="font-black text-cyan-700 text-lg">{reqFluid}</p>
                  <p className="text-xs text-slate-400">ml/day</p>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Date selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-700">Log Date:</label>
        <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-44 h-8 text-sm" />
        <Badge className="bg-slate-100 text-slate-700 border-slate-300">{dayLog.items.length} items logged</Badge>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <Alert key={i} className={a.type === "error" ? "bg-red-50 border-red-300" : "bg-amber-50 border-amber-300"}>
              <AlertTriangle className={`w-4 h-4 ${a.type === "error" ? "text-red-600" : "text-amber-600"}`} />
              <AlertDescription className={`text-xs font-semibold ${a.type === "error" ? "text-red-900" : "text-amber-900"}`}>{a.msg}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Progress summary */}
      {hasPatientData && (
        <Card className="bg-white border-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b py-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Today's Intake vs Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <ProgressBar value={totalKcal} max={reqKcal} color="green" label="Calories (kcal)" />
            <ProgressBar value={parseFloat(totalProtein.toFixed(1))} max={reqProteinMin} color="blue" label="Protein (g) — min target" />
            <ProgressBar value={totalFluid} max={reqFluid} color="blue" label="Fluid (ml)" />
          </CardContent>
        </Card>
      )}

      {/* Add Food */}
      <Card className="bg-white border-2 border-green-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b py-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Apple className="w-4 h-4 text-green-600" />Log Food / Fluid Intake
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Category</label>
              <Select value={addCategory} onValueChange={v => { setAddCategory(v); setAddFood(""); }}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(FOOD_ITEMS).map(k => (
                    <SelectItem key={k} value={k} className="text-xs capitalize">{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600">Food Item</label>
              <Select value={addFood} onValueChange={setAddFood}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select food..." /></SelectTrigger>
                <SelectContent>
                  {FOOD_ITEMS[addCategory].map(f => (
                    <SelectItem key={f.name} value={f.name} className="text-xs">{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Quantity ({FOOD_ITEMS[addCategory].find(f => f.name === addFood)?.unit || (addCategory === "milk" || addCategory === "fluids" ? "ml" : "g")})
              </label>
              <div className="flex gap-1 mt-1">
                <Input type="number" placeholder="qty" value={addQty} onChange={e => setAddQty(e.target.value)} className="h-8 text-xs" />
                <Button size="sm" onClick={addItem} className="bg-green-600 hover:bg-green-700 h-8 px-2">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Today's log */}
          {dayLog.items.length > 0 ? (
            <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto">
              {dayLog.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] px-1.5 py-0 h-4 ${CAT_COLORS[item.category]}`}>{item.category}</Badge>
                    <span className="text-sm font-medium text-slate-800">{item.name}</span>
                    <span className="text-xs text-slate-500">{item.qty}{item.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-orange-600 font-semibold">{item.kcal}kcal</span>
                    <span className="text-xs text-blue-600 font-semibold">{item.protein}g prot</span>
                    <Button size="sm" variant="ghost" onClick={() => removeItem(i)} className="h-6 w-6 p-0 text-red-400 hover:text-red-600">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between p-2 bg-slate-800 rounded-lg text-white text-xs font-bold mt-2">
                <span>Total: {dayLog.items.length} items</span>
                <span>{totalKcal} kcal · {totalProtein.toFixed(1)}g protein · {totalFluid}ml fluid</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
              <Apple className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No items logged for {selectedDate}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trend Charts */}
      {trendData.length > 1 && (
        <Card className="bg-white border-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />7-Day Nutrition Trend
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setShowChart(!showChart)} className="h-7 text-xs">
                {showChart ? "Hide" : "Show"} Chart
              </Button>
            </div>
          </CardHeader>
          {showChart && (
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Calories (kcal/day)</p>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="kcal" fill="#f97316" radius={[4, 4, 0, 0]} />
                    {reqKcal && <Bar dataKey={() => reqKcal} name="Required" fill="#86efac" radius={[4, 4, 0, 0]} />}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Protein & Fluid Trend</p>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="protein" stroke="#3b82f6" strokeWidth={2} name="Protein (g)" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="fluid" stroke="#06b6d4" strokeWidth={2} name="Fluid (ml/10)" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Smart Suggestions */}
      {hasPatientData && (
        <Card className="bg-blue-50 border-2 border-blue-200 shadow-sm">
          <CardHeader className="border-b border-blue-200 py-3">
            <CardTitle className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />Smart Nutrition Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs text-blue-900">
            {kcalPct !== null && kcalPct < 90 && (
              <p>🍚 <strong>Increase calories:</strong> Add ghee/oil to dal-rice, give banana+curd, energy-dense snacks like chikki or groundnut laddoo.</p>
            )}
            {proteinPct !== null && proteinPct < 85 && (
              <p>🥚 <strong>Increase protein:</strong> Add egg/paneer/dal to each meal. 1 egg = 6g protein. 50g paneer = 9g protein.</p>
            )}
            {disease === "nephrotic" && (
              <p>🧂 <strong>Sodium restriction during relapse:</strong> Avoid processed foods, pickles, papads, and added salt. Use herbs for flavor.</p>
            )}
            {disease.includes("ckd") && (
              <p>🟡 <strong>Phosphorus restriction:</strong> Limit dairy, nuts, colas, dark-colored pulses. Use low-phosphorus alternatives.</p>
            )}
            {disease.includes("ckd") && (
              <p>🍌 <strong>Potassium restriction:</strong> Limit banana, mango, potato, tomato, orange juice. Prefer apple, rice, white bread.</p>
            )}
            {fluidPct !== null && fluidPct > 110 && (
              <p>💧 <strong>Fluid restriction:</strong> Monitor oral fluids carefully. Include IV fluid volume in total count.</p>
            )}
            <p className="text-[10px] text-blue-600 border-t border-blue-200 pt-2 mt-2">⚠️ These are general guidelines. Always verify with a pediatric dietitian for clinical cases.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}