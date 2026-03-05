import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CKDStagingPathway() {
  const [cr, setCr] = useState(""); const [ht, setHt] = useState(""); const [age, setAge] = useState(""); const [egfr, setEgfr] = useState(null); const [stage, setStage] = useState(null);

  const calculateGFR = () => {
    const crV = parseFloat(cr); const htV = parseFloat(ht); const ageV = parseInt(age);
    if (!crV || !htV || !ageV) return;
    const k = ageV >= 13 ? 0.7 : 0.413;
    const gfr = Math.round((k * htV) / crV);
    setEgfr(gfr);
    if (gfr >= 90) setStage({ g: "G1", label: "Normal/High", color: "bg-green-100 text-green-800" });
    else if (gfr >= 60) setStage({ g: "G2", label: "Mildly Decreased", color: "bg-blue-100 text-blue-800" });
    else if (gfr >= 45) setStage({ g: "G3a", label: "Mild-Moderate Decrease", color: "bg-yellow-100 text-yellow-800" });
    else if (gfr >= 30) setStage({ g: "G3b", label: "Moderate-Severe Decrease", color: "bg-orange-100 text-orange-800" });
    else if (gfr >= 15) setStage({ g: "G4", label: "Severely Decreased", color: "bg-red-100 text-red-800" });
    else setStage({ g: "G5", label: "Kidney Failure", color: "bg-red-800 text-white" });
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>CKD Staging (KDIGO 2012):</strong> GFR + Albumin-Creatinine Ratio (albuminuria) both required for full staging.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle className="text-base">Schwartz eGFR Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div><Label className="text-xs">Creatinine (mg/dL)</Label><Input value={cr} onChange={e=>setCr(e.target.value)} type="number" /></div>
            <div><Label className="text-xs">Height (cm)</Label><Input value={ht} onChange={e=>setHt(e.target.value)} type="number" /></div>
            <div><Label className="text-xs">Age (years)</Label><Input value={age} onChange={e=>setAge(e.target.value)} type="number" /></div>
          </div>
          <button onClick={calculateGFR} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Calculate eGFR</button>
          {egfr !== null && stage && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-blue-50 p-3 rounded-lg text-center"><p className="text-xs text-slate-500">eGFR</p><p className="text-2xl font-bold text-blue-700">{egfr} <span className="text-sm">mL/min/1.73m²</span></p></div>
              <div className={`p-3 rounded-lg text-center ${stage.color}`}><p className="text-xs">CKD Stage</p><p className="text-2xl font-bold">{stage.g}</p><p className="text-xs">{stage.label}</p></div>
            </div>
          )}
        </CardContent>
      </Card>

      {[
        { title: "Management by CKD Stage", color: "bg-blue-50 border-blue-200", items: [
          "G1–G2 (eGFR ≥60): Treat underlying cause, monitor BP/protein/K+ annually",
          "G3a–G3b (eGFR 30–59): Nephrology referral, anemia/CKD-MBD monitoring every 3–6 months",
          "G4 (eGFR 15–29): Prepare for RRT, transplant workup, dietitian input",
          "G5 (eGFR <15): RRT initiation — PD or HD, or preemptive transplant"
        ]},
        { title: "Renoprotective Strategy", color: "bg-green-50 border-green-200", items: [
          "ACE-I/ARB: first-line for proteinuric CKD (reduce progression ~30%)",
          "BP target: <75th centile; in diabetic/proteinuric CKD: <50th centile",
          "Avoid NSAIDs, nephrotoxic medications, contrast dye without precautions",
          "Protein intake: 0.8–1.2 g/kg/day (avoid excess restriction in children)"
        ]},
        { title: "CKD-MBD Targets", color: "bg-purple-50 border-purple-200", items: [
          "Calcium: 2.2–2.6 mmol/L", "Phosphate: age-appropriate normal range",
          "PTH: G3: 35–70 pg/mL; G4: 70–110 pg/mL; G5: 150–300 pg/mL",
          "Vitamin D: 25(OH)D >50 nmol/L"
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