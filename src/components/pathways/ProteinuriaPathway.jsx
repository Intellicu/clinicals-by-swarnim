import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProteinuriaPathway() {
  const [upr, setUpr] = useState(""); const [ucr, setUcr] = useState(""); const [ratio, setRatio] = useState(null);

  const calc = () => {
    const v = parseFloat(upr) / parseFloat(ucr);
    if (!isNaN(v)) setRatio(v.toFixed(1));
  };

  const getInterpretation = (r) => {
    if (r < 0.2) return { label: "Normal", color: "text-green-700" };
    if (r < 1.0) return { label: "Mild-Moderate Proteinuria", color: "text-yellow-700" };
    if (r < 2.5) return { label: "Heavy Proteinuria", color: "text-orange-700" };
    return { label: "Nephrotic-Range Proteinuria", color: "text-red-700" };
  };

  const interp = ratio ? getInterpretation(parseFloat(ratio)) : null;

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Approach to Proteinuria:</strong> First morning void (PCR) preferred. Nephrotic-range: PCR ≥200 mg/mmol (or ≥2.5 g/g). Dipstick ≥2+ requires formal quantification.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle className="text-base">Urine PCR Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Urine Protein (mg/dL)</Label><Input value={upr} onChange={e=>setUpr(e.target.value)} type="number" /></div>
            <div><Label className="text-xs">Urine Creatinine (mg/dL)</Label><Input value={ucr} onChange={e=>setUcr(e.target.value)} type="number" /></div>
          </div>
          <button onClick={calc} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Calculate PCR</button>
          {ratio && interp && (
            <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between">
              <span className="font-bold text-xl">{ratio}</span>
              <Badge className={interp.color === "text-green-700" ? "bg-green-100 text-green-800" : interp.color === "text-red-700" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>{interp.label}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {[
        { title: "Transient vs Persistent Proteinuria", color: "bg-blue-50 border-blue-200", items: [
          "Transient: fever, exercise, dehydration — recheck after resolution",
          "Orthostatic: PCR normal on first morning void but elevated on random sample — benign",
          "Persistent: abnormal on ≥2 specimens over 2–3 months — requires full workup"
        ]},
        { title: "Workup for Persistent Proteinuria", color: "bg-purple-50 border-purple-200", items: [
          "First morning PCR (twice to confirm)",
          "Blood: Cr, BUN, albumin, cholesterol, C3, C4, ANA, anti-dsDNA",
          "Renal ultrasound",
          "Biopsy if: PCR >2.0, nephrotic syndrome, hematuria + proteinuria, declining GFR"
        ]},
        { title: "Treatment Principles", color: "bg-green-50 border-green-200", items: [
          "ACE-I/ARB: reduce proteinuria 30–40% in CKD/primary nephropathies",
          "Treat underlying cause (lupus, primary NS, IgAN)",
          "Low sodium diet, blood pressure optimization",
          "Follow PCR monthly until stable, then 3-monthly"
        ]}
      ].map((s,i) => (
        <Card key={i} className={`border-2 ${s.color}`}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{s.title}</CardTitle></CardHeader>
          <CardContent><ul className="space-y-1">{s.items.map((item,j) => (
            <li key={j} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span>{item}</span></li>
          ))}</ul></CardContent>
        </Card>
      ))}
    </div>
  );
}