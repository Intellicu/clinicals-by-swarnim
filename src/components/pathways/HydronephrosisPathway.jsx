import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Baby } from "lucide-react";

const sfu_grades = [
  { g: "I", desc: "Mild splitting of central renal sinus complex", action: "Observe, repeat USS at 1 month postnatal" },
  { g: "II", desc: "Further splitting with visible pelvis", action: "Observe, USS at 1–3 months" },
  { g: "III", desc: "Pelvis dilated, calyces visible, normal parenchyma", action: "USS 1–3 months, consider VCUG, MAG3" },
  { g: "IV", desc: "Thinning of renal parenchyma", action: "Urgent pediatric urology referral, DTPA/MAG3, VCUG" }
];

export default function HydronephrosisPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Baby className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Antenatally Diagnosed Hydronephrosis:</strong> Most (70–80%) resolves spontaneously. Management based on SFU grade, laterality, and APD (anteroposterior pelvic diameter).
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle className="text-base">SFU Grading System</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sfu_grades.map((g,i) => (
              <div key={i} className="flex items-start gap-3 p-2 border rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${['bg-green-500','bg-blue-500','bg-yellow-500','bg-red-500'][i]}`}>
                  {g.g}
                </div>
                <div>
                  <p className="text-sm font-medium">{g.desc}</p>
                  <p className="text-xs text-slate-600 mt-1">{g.action}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {[
        { title: "Postnatal Management Algorithm", color: "bg-green-50 border-green-200", items: [
          "Mild (APD <10 mm): USS at 1 month; if stable — serial USS and watchful waiting",
          "Moderate (APD 10–15 mm): USS + VCUG (if febrile UTI), MAG3 renogram",
          "Severe (APD >15 mm): USS + VCUG + MAG3 within first month; urology referral",
          "All bilateral or single functioning kidney: urgent evaluation"
        ]},
        { title: "Antibiotic Prophylaxis", color: "bg-yellow-50 border-yellow-200", items: [
          "Recommended for SFU Grade III-IV until workup completed",
          "Trimethoprim 1 mg/kg/day OD (if >3 months)",
          "Amoxicillin 10 mg/kg/day OD (for neonates <3 months)"
        ]},
        { title: "Surgical Indications (Pyeloplasty)", color: "bg-red-50 border-red-200", items: [
          "Differential function <40% on MAG3/DTPA",
          "Progressive worsening in differential function or APD",
          "T1/2 > 20 min on diuretic renogram",
          "Recurrent UTI or pain episodes",
          "SFU grade IV with parenchymal thinning"
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