import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const grades = [
  { grade: "I", desc: "Reflux into ureter only", treatment: "Observation/CAP" },
  { grade: "II", desc: "Reflux to renal pelvis, no dilation", treatment: "CAP or observation" },
  { grade: "III", desc: "Mild-moderate dilation, no calyceal blunting", treatment: "CAP or endoscopic" },
  { grade: "IV", desc: "Moderate dilation, calyceal blunting", treatment: "CAP or surgical" },
  { grade: "V", desc: "Severe dilation, intrarenal reflux", treatment: "Surgical correction" }
];

export default function VURPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertTriangle className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Primary VUR:</strong> Most common in children, often resolves spontaneously. Goal: prevent pyelonephritis and renal scarring. Use DMSA and VCUG for diagnosis.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle className="text-base">VUR Grading (International Classification)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {grades.map((g,i) => (
              <div key={i} className="flex items-start gap-3 p-2 border rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${['bg-green-500','bg-blue-500','bg-yellow-500','bg-orange-500','bg-red-500'][i]}`}>
                  {g.grade}
                </div>
                <div>
                  <p className="text-sm font-medium">{g.desc}</p>
                  <Badge variant="outline" className="text-xs mt-1">{g.treatment}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {[
        { title: "Diagnosis", color: "bg-blue-50 border-blue-200", items: [
          "VCUG (voiding cystourethrogram): gold standard for grading",
          "DMSA scan: detects renal scarring (wait 3–6 months after UTI)",
          "Renal ultrasound: initial screening but poor sensitivity for VUR",
          "Urodynamics: if bladder dysfunction suspected"
        ]},
        { title: "Continuous Antibiotic Prophylaxis (CAP)", color: "bg-green-50 border-green-200", items: [
          "Indication: recurrent UTIs, bilateral VUR, solitary kidney, age <1 year",
          "Trimethoprim 1–2 mg/kg/day OD at night",
          "Nitrofurantoin 1–2 mg/kg/day OD (not <3 months)",
          "Review at 12–24 monthly intervals",
          "Prophylaxis not universally recommended (AUA 2010): individualize decision"
        ]},
        { title: "Endoscopic Correction (STING/HIT)", color: "bg-purple-50 border-purple-200", items: [
          "Subureteral injection of dextranomer/HA (Deflux)",
          "Success rate: grade I-III ~85%, grade IV ~60%",
          "Outpatient procedure, minimal morbidity",
          "Consider for failed prophylaxis or parental preference"
        ]},
        { title: "Surgical Ureteral Reimplantation", color: "bg-red-50 border-red-200", items: [
          "Cohen or Politano-Leadbetter techniques",
          "Success rate >95% for grades III-V",
          "Indicated: recurrent febrile UTIs on CAP, worsening scarring, bilateral grade IV-V",
          "Robotic/laparoscopic options increasingly available"
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