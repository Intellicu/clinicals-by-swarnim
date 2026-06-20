import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const grades = [
  { grade: "I", desc: "Reflux into ureter only", treatment: "Low-grade — no prophylaxis" },
  { grade: "II", desc: "Reflux to renal pelvis, no dilation", treatment: "Low-grade — no prophylaxis" },
  { grade: "III", desc: "Mild-moderate dilation, no calyceal blunting", treatment: "High-grade — prophylaxis + treat BBD" },
  { grade: "IV", desc: "Moderate dilation, calyceal blunting", treatment: "High-grade — prophylaxis + treat BBD" },
  { grade: "V", desc: "Severe dilation, intrarenal reflux", treatment: "High-grade — prophylaxis; surgery if breakthrough" }
];

export default function VURPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertTriangle className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Primary VUR (Revised ISPN 2023):</strong> Often resolves spontaneously. Diagnosed by MCU (VCUG). Conservative approach — antibiotic prophylaxis is first-line and limited to high-grade VUR; surgery only for breakthrough febrile UTI despite prophylaxis + optimal bladder-bowel dysfunction (BBD) care.
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
        { title: "Diagnosis & Imaging (ISPN 2023)", color: "bg-blue-50 border-blue-200", items: [
          "MCU (VCUG): test for diagnosing and grading VUR — perform after the UTI is treated (≈2–3 weeks)",
          "Ultrasound KUB: in ALL children after UTI; monitors kidney growth in persistent high-grade VUR",
          "Late-phase DMSA (4–6 months): only for recurrent UTI or high-grade VUR — AVOID acute-phase DMSA",
          "Evaluate all toilet-trained children for bladder-bowel dysfunction (BBD)",
          "Screen siblings <3 years with ultrasound (MCU only if abnormal US or febrile UTI)"
        ]},
        { title: "Antibiotic Prophylaxis — limited indications (ISPN 2023)", color: "bg-green-50 border-green-200", items: [
          "Indicated: high-grade VUR (grades III–V)",
          "Also: recurrent febrile UTI with BBD (irrespective of VUR); infants with low-grade VUR may be considered",
          "NOT for normal urinary tract or low-grade VUR alone; NOT for antenatal hydronephrosis awaiting evaluation",
          "Agents: cotrimoxazole or nitrofurantoin (>3 months); cephalexin in young infants — avoid amoxicillin-clavulanate",
          "Manage BBD with urotherapy (± laxatives) — strong recommendation",
          "Discontinue if toilet-trained, no BBD, and no febrile UTI in the preceding year"
        ]},
        { title: "Endoscopic Correction (bulking agent)", color: "bg-purple-50 border-purple-200", items: [
          "Subureteral injection of a bulking agent — minimally invasive",
          "Lower success rate than ureteric reimplantation — discuss with caregivers",
          "An option for parental hesitancy to use antibiotics"
        ]},
        { title: "Surgical Ureteral Reimplantation", color: "bg-red-50 border-red-200", items: [
          "Reserved for recurrent breakthrough febrile UTI despite prophylaxis AND optimal BBD management",
          "More effective than prophylaxis at preventing febrile UTI, but neither reduces the risk of kidney scarring",
          "Follow-up for reflux nephropathy: growth, BP, proteinuria, kidney function each visit",
          "Repeat cystography not routine — only after 4–8 years if clinically needed"
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