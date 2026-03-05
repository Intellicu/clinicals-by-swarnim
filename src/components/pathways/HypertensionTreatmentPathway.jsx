import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Heart } from "lucide-react";

const drugTable = [
  { drug: "Amlodipine", class: "CCB", dose: "0.1 mg/kg/day OD", max: "5–10 mg/day", notes: "First line, well-tolerated in children" },
  { drug: "Enalapril", class: "ACE-I", dose: "0.08 mg/kg/day BD", max: "40 mg/day", notes: "First line in proteinuric CKD; avoid in bilateral RAS" },
  { drug: "Losartan", class: "ARB", dose: "0.7 mg/kg/day OD", max: "100 mg/day", notes: "Alternative to ACE-I; avoid dual RAS blockade" },
  { drug: "Atenolol", class: "Beta-blocker", dose: "0.5–1 mg/kg/day OD", max: "100 mg/day", notes: "Useful in high-output states; avoid in asthma" },
  { drug: "Hydrochlorothiazide", class: "Thiazide", dose: "1 mg/kg/day OD", max: "37.5 mg/day", notes: "Not preferred if GFR <30" },
  { drug: "Furosemide", class: "Loop diuretic", dose: "0.5–2 mg/kg/dose BD", max: "6 mg/kg/day", notes: "For fluid overload / CKD-associated HTN" }
];

export default function HypertensionTreatmentPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-red-50 border-red-200">
        <Heart className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Treatment targets:</strong> Stage 1 HTN without end-organ damage: &lt;90th percentile. With CKD/diabetes: &lt;75th percentile (AAP/KDIGO).
        </AlertDescription>
      </Alert>

      {[
        { title: "Lifestyle Modifications (All Stages)", color: "bg-green-50 border-green-200", items: [
          "Weight reduction: target BMI <85th percentile",
          "DASH diet: reduce sodium to <2.3 g/day, increase fruits/vegetables/whole grains",
          "Aerobic exercise: ≥60 min/day moderate intensity",
          "Screen time restriction <2 hrs/day",
          "Avoid caffeine, energy drinks, tobacco exposure"
        ]},
        { title: "When to Start Medications", color: "bg-blue-50 border-blue-200", items: [
          "Stage 1 HTN: after 6 months of lifestyle modification failure",
          "Stage 1 HTN with CKD, diabetes, LVH, or symptoms: start immediately",
          "Stage 2 HTN: start medications immediately + urgent evaluation",
          "Hypertensive urgency/emergency: see separate emergency pathway"
        ]}
      ].map((s,i) => (
        <Card key={i} className={`border-2 ${s.color}`}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{s.title}</CardTitle></CardHeader>
          <CardContent><ul className="space-y-1">{s.items.map((item,j) => (
            <li key={j} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span>{item}</span></li>
          ))}</ul></CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader><CardTitle className="text-base">Antihypertensive Drug Reference</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-slate-100">{["Drug","Class","Dose","Max","Notes"].map(h => <th key={h} className="p-2 text-left">{h}</th>)}</tr></thead>
              <tbody>{drugTable.map((d,i) => (
                <tr key={i} className={i%2===0?"bg-white":"bg-slate-50"}>
                  <td className="p-2 font-semibold">{d.drug}</td>
                  <td className="p-2"><Badge variant="outline" className="text-xs">{d.class}</Badge></td>
                  <td className="p-2">{d.dose}</td>
                  <td className="p-2">{d.max}</td>
                  <td className="p-2 text-slate-600">{d.notes}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}