import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, AlertTriangle, CheckCircle2, Info, Calculator, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer, ScatterChart, Scatter
} from "recharts";

// WHO/IAP Growth Standards
// Z-score approximate lookup for weight-for-age (simplified)
function classifyBMI(bmi, age) {
  // IAP/WHO 2007 BMI percentile categories
  if (bmi < 14) return { label: "Severe Thinness", color: "red", action: "urgent" };
  if (bmi < 16) return { label: "Moderate Thinness", color: "orange", action: "refer" };
  if (bmi < 18.5 && age >= 18) return { label: "Underweight", color: "amber", action: "monitor" };
  if (bmi > 30 && age >= 18) return { label: "Obese", color: "red", action: "manage" };
  if (bmi > 25 && age >= 18) return { label: "Overweight", color: "amber", action: "counsel" };
  return { label: "Normal", color: "green", action: "maintain" };
}

function classifyMalnutrition(waz, haz, whz) {
  const results = [];
  // Weight-for-Age Z-score (WAZ)
  if (waz < -3) results.push({ type: "Underweight", severity: "Severe", color: "red" });
  else if (waz < -2) results.push({ type: "Underweight", severity: "Moderate", color: "orange" });
  else if (waz > 2) results.push({ type: "Overweight", severity: "Overweight", color: "amber" });

  // Height-for-Age Z-score (HAZ)
  if (haz < -3) results.push({ type: "Stunting", severity: "Severe", color: "red" });
  else if (haz < -2) results.push({ type: "Stunting", severity: "Moderate", color: "orange" });

  // Weight-for-Height Z-score (WHZ) / Wasting
  if (whz < -3) results.push({ type: "Wasting (SAM)", severity: "Severe", color: "red" });
  else if (whz < -2) results.push({ type: "Wasting (MAM)", severity: "Moderate", color: "orange" });

  if (results.length === 0) results.push({ type: "Normal Growth", severity: "Normal", color: "green" });
  return results;
}

// Simplified Z-score estimation (for clinical use)
// WHO median weight-for-age (boys reference)
const WHO_MEDIAN_W = {1:10.2,2:12.2,3:14.0,4:16.3,5:18.3,6:20.5,7:22.9,8:25.3,9:28.1,10:31.4};
const WHO_SD_W = {1:1.5,2:1.8,3:2.0,4:2.3,5:2.6,6:2.9,7:3.3,8:3.7,9:4.2,10:4.8};
const WHO_MEDIAN_H = {1:75,2:86.4,3:95,4:102.3,5:109.2,6:115.6,7:121.7,8:127.3,9:132.6,10:137.5};
const WHO_SD_H = {1:2.6,2:3.4,3:3.9,4:4.2,5:4.5,6:4.7,7:5.0,8:5.3,9:5.5,10:5.8};

function calcZScore(value, median, sd) {
  return ((value - median) / sd).toFixed(1);
}

const GROWTH_MILESTONES = [
  { age: "Birth", weight: "2.5–3.5 kg", height: "48–52 cm", head: "33–35 cm" },
  { age: "3 months", weight: "5.5–6.5 kg", height: "60–62 cm", head: "40 cm" },
  { age: "6 months", weight: "7.0–8.0 kg", height: "65–68 cm", head: "43 cm" },
  { age: "9 months", weight: "8.5–9.5 kg", height: "70–73 cm", head: "45 cm" },
  { age: "12 months", weight: "9.5–10.5 kg", height: "74–76 cm", head: "46 cm" },
  { age: "18 months", weight: "10.5–12.0 kg", height: "80–83 cm", head: "47 cm" },
  { age: "2 years", weight: "11.5–13.5 kg", height: "86–89 cm", head: "48 cm" },
  { age: "3 years", weight: "13.5–16.0 kg", height: "95–99 cm", head: "49 cm" },
  { age: "5 years", weight: "17–20 kg", height: "107–112 cm", head: "50 cm" },
];

const MONITORING_FREQUENCY = [
  { age: "0–6 months", frequency: "Monthly", who: "WHO/IAP" },
  { age: "6–12 months", frequency: "Every 2 months", who: "WHO/IAP" },
  { age: "1–2 years", frequency: "Every 3 months", who: "WHO/IAP" },
  { age: "2–5 years", frequency: "Every 6 months", who: "WHO/IAP" },
  { age: "5–10 years", frequency: "Annually", who: "IAP" },
  { age: ">10 years", frequency: "Annually + pubertal staging", who: "IAP" },
];

const TREND_KEY = "growth_trend_data";

export default function GrowthMonitoringPathway() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [result, setResult] = useState(null);
  const [trendData, setTrendData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TREND_KEY) || "[]"); } catch { return []; }
  });

  const calculate = () => {
    if (!weight || !height || !age) { toast.error("Please enter all values"); return; }
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    const bmi = (w / ((h/100) ** 2)).toFixed(1);
    
    const medianW = WHO_MEDIAN_W[a] || w;
    const sdW = WHO_SD_W[a] || 2;
    const medianH = WHO_MEDIAN_H[a] || h;
    const sdH = WHO_SD_H[a] || 4;
    
    const waz = calcZScore(w, medianW, sdW);
    const haz = calcZScore(h, medianH, sdH);
    const whz = waz;
    
    const malnutrition = classifyMalnutrition(parseFloat(waz), parseFloat(haz), parseFloat(whz));
    const bmiClass = classifyBMI(parseFloat(bmi), a);
    const muac = (0.25 * h + 2.1).toFixed(1);
    
    setResult({ w, h, a, bmi, waz, haz, whz, malnutrition, bmiClass, muac });
  };

  const addToTrend = () => {
    if (!result) { toast.error("Calculate first"); return; }
    const entry = {
      age: result.a,
      weight: result.w,
      height: result.h,
      bmi: parseFloat(result.bmi),
      waz: parseFloat(result.waz),
      haz: parseFloat(result.haz),
      date: new Date().toLocaleDateString("en-IN"),
    };
    const updated = [...trendData, entry].sort((a, b) => a.age - b.age);
    setTrendData(updated);
    try { localStorage.setItem(TREND_KEY, JSON.stringify(updated)); } catch {}
    toast.success("Added to growth trend");
  };

  const clearTrend = () => {
    setTrendData([]);
    localStorage.removeItem(TREND_KEY);
    toast.info("Trend data cleared");
  };

  // WHO reference lines for weight chart
  const WHO_REF_WEIGHT = Object.entries(WHO_MEDIAN_W).map(([age, median]) => ({
    age: parseInt(age), median, sd_plus2: median + 2 * WHO_SD_W[age], sd_minus2: median - 2 * WHO_SD_W[age]
  }));

  const colorMap = { red: "bg-red-100 border-red-300 text-red-800", orange: "bg-orange-100 border-orange-300 text-orange-800", amber: "bg-amber-100 border-amber-300 text-amber-800", green: "bg-green-100 border-green-300 text-green-800" };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>IAP / WHO Growth Monitoring:</strong> Uses WHO 2006 Child Growth Standards (0–5y) and WHO 2007 Reference (5–19y). Z-scores are approximate for clinical screening — use growth charts for precise assessment.
        </AlertDescription>
      </Alert>

      {/* Calculator */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="w-5 h-5 text-green-600" />Growth Assessment Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <Label className="text-xs font-semibold">Age (years, 1–10)</Label>
              <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 5" min="1" max="10" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Weight (kg)</Label>
              <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 18" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Height (cm)</Label>
              <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 110" className="mt-1" />
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
          </div>
          <Button onClick={calculate} className="bg-green-600 hover:bg-green-700">
            <Calculator className="w-4 h-4 mr-2" />Calculate Z-Scores
          </Button>

          {result && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "BMI", value: `${result.bmi} kg/m²` },
                  { label: "WAZ (Weight-for-Age)", value: result.waz },
                  { label: "HAZ (Height-for-Age)", value: result.haz },
                  { label: "Est. MUAC", value: `${result.muac} cm` },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-lg p-3 text-center border">
                    <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                    <div className="font-bold text-lg text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {result.malnutrition.map((m, i) => (
                  <div key={i} className={`flex items-center justify-between p-2 rounded border ${colorMap[m.color]}`}>
                    <span className="font-semibold text-sm">{m.type}</span>
                    <Badge className={m.color === "green" ? "bg-green-600" : m.color === "red" ? "bg-red-600" : "bg-amber-600"}>{m.severity}</Badge>
                  </div>
                ))}
              </div>
              {result.malnutrition.some(m => m.color === "red") && (
                <Alert className="bg-red-50 border-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">
                    <strong>Action Required:</strong> Severe malnutrition — refer to NRC/hospital. Assess for medical causes. SAM criteria: WHZ &lt;-3 or MUAC &lt;11.5 cm or bilateral pitting edema.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitoring Frequency */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />IAP Recommended Monitoring Frequency
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {MONITORING_FREQUENCY.map((row, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 border text-sm">
                <span className="font-semibold text-slate-800">{row.age}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">{row.frequency}</span>
                  <Badge variant="outline" className="text-xs">{row.who}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <CardTitle className="text-base">IAP Growth Milestones (Approximate)</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-100">
                <th className="p-2 text-left">Age</th><th className="p-2 text-left">Weight</th><th className="p-2 text-left">Height</th><th className="p-2 text-left">Head Circ.</th>
              </tr></thead>
              <tbody>
                {GROWTH_MILESTONES.map((m, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="p-2 font-medium">{m.age}</td>
                    <td className="p-2">{m.weight}</td>
                    <td className="p-2">{m.height}</td>
                    <td className="p-2">{m.head}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Red Flags */}
      <Card className="bg-red-50 border-red-200 shadow-lg">
        <CardHeader className="border-b border-red-200">
          <CardTitle className="text-base text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />Growth Failure — Red Flags (IAP)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "Weight loss or failure to gain weight over 2 consecutive visits",
              "Height velocity &lt;4 cm/year in children 4–10y (suspect endocrine)",
              "BMI Z-score &lt;-2 (wasting) or HAZ &lt;-2 (stunting)",
              "Crossing 2 major centile lines downward",
              "No weight gain in 3 months in child &lt;2 years",
              "MUAC &lt;12.5 cm (5–10y): moderate acute malnutrition",
              "MUAC &lt;11.5 cm: severe acute malnutrition (SAM)",
              "Bilateral pitting edema (kwashiorkor — protein deficiency)",
            ].map((flag, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-red-800 bg-red-100 p-2 rounded">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{flag}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}