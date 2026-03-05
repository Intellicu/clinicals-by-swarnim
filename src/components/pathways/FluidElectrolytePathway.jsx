import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Info, Droplet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FluidElectrolytePathway() {
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const w = parseFloat(weight);
    if (!w) return;
    let maintenance;
    if (w <= 10) maintenance = w * 100;
    else if (w <= 20) maintenance = 1000 + (w - 10) * 50;
    else maintenance = 1500 + (w - 20) * 20;
    setResult({ maintenance, hourly: Math.round(maintenance / 24) });
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Droplet className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Holliday-Segar Maintenance Fluid Calculator + Clinical Principles</strong>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle className="text-base">Maintenance Fluid Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Weight (kg)</Label>
            <div className="flex gap-2 mt-1">
              <Input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder="e.g. 15" />
              <button onClick={calculate} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Calculate</button>
            </div>
          </div>
          {result && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-blue-50 p-3 rounded-lg text-center"><p className="text-xs text-slate-500">Daily Volume</p><p className="text-2xl font-bold text-blue-700">{result.maintenance} mL</p></div>
              <div className="bg-green-50 p-3 rounded-lg text-center"><p className="text-xs text-slate-500">Hourly Rate</p><p className="text-2xl font-bold text-green-700">{result.hourly} mL/hr</p></div>
            </div>
          )}
        </CardContent>
      </Card>

      {[
        { title: "Fluid Deficit Replacement", color: "bg-red-50 border-red-200", items: [
          "Mild dehydration (3-5%): Increase fluids, oral rehydration",
          "Moderate (6-9%): 20 mL/kg NS bolus, then reassess",
          "Severe (≥10%): Repeat 20 mL/kg boluses, immediate intervention",
          "Deficit = % dehydration × weight (kg) × 10 mL/kg"
        ]},
        { title: "Electrolyte Requirements (Daily)", color: "bg-green-50 border-green-200", items: [
          "Sodium: 2–3 mEq/kg/day",
          "Potassium: 1–2 mEq/kg/day",
          "Glucose: 4–6 mg/kg/min for neonates, 2–4 for older children",
          "Standard solution: 0.9% NaCl + 20 mEq/L KCl (if renal function adequate)"
        ]},
        { title: "Hypernatremic Dehydration", color: "bg-orange-50 border-orange-200", items: [
          "Na > 150 mmol/L: SLOW correction (reduce Na by max 0.5 mmol/L/hr or 10 mmol/L/day)",
          "Use isotonic saline initially then gradually reduce tonicity",
          "Rapid correction causes cerebral edema — AVOID"
        ]},
        { title: "SIADH / Hyponatremic Fluid Management", color: "bg-purple-50 border-purple-200", items: [
          "Fluid restriction to 2/3 maintenance if asymptomatic",
          "Symptomatic (seizures): 3% NaCl 3–5 mL/kg over 15–20 min",
          "Correct Na by no more than 8–10 mmol/L in 24 hours"
        ]}
      ].map((s, i) => (
        <Card key={i} className={`border-2 ${s.color}`}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{s.title}</CardTitle></CardHeader>
          <CardContent><ul className="space-y-1">{s.items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span>{item}</span></li>
          ))}</ul></CardContent>
        </Card>
      ))}
    </div>
  );
}