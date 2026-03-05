import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

const steps = [
  {
    title: "Risk Assessment",
    color: "bg-blue-50 border-blue-200",
    items: [
      "High risk: CKD (eGFR <60), diabetes, heart failure, dehydration, large contrast volume",
      "Very high risk: eGFR <30, myeloma, recent AKI",
      "Low risk: eGFR >60 with no other risk factors — standard pre-hydration usually sufficient"
    ]
  },
  {
    title: "Pre-procedure Hydration",
    color: "bg-green-50 border-green-200",
    items: [
      "IV Normal Saline 1 mL/kg/hr for 6–12 hours before and 6–12 hours after contrast",
      "OR Sodium bicarbonate 1.26%: 3 mL/kg/hr for 1 hr before, then 1 mL/kg/hr for 6 hrs after",
      "Oral hydration acceptable for low-risk patients: 500 mL water before and after"
    ]
  },
  {
    title: "Medications to Hold",
    color: "bg-red-50 border-red-200",
    items: [
      "Metformin: hold 48 hours before and restart only when renal function stable",
      "NSAIDs: hold 24–48 hours before",
      "Nephrotoxic agents (aminoglycosides, vancomycin): avoid or dose adjust"
    ]
  },
  {
    title: "N-Acetylcysteine (NAC)",
    color: "bg-yellow-50 border-yellow-200",
    items: [
      "Evidence conflicting — consider for very high-risk patients",
      "If used: 600 mg PO BD day before and day of procedure (adults)",
      "Pediatric dose: 70 mg/kg/dose BD"
    ]
  },
  {
    title: "Contrast Choice",
    color: "bg-purple-50 border-purple-200",
    items: [
      "Use iso-osmolar or low-osmolar contrast (not high-osmolar)",
      "Minimize total contrast volume",
      "Avoid repeat contrast within 48–72 hours"
    ]
  },
  {
    title: "Post-Procedure Monitoring",
    color: "bg-slate-50 border-slate-200",
    items: [
      "Serum creatinine at 24–48 hours post-procedure in high-risk patients",
      "CI-AKI defined as: creatinine rise ≥0.3 mg/dL or ≥25% above baseline within 48–72 hrs",
      "If AKI develops: manage per AKI protocol, ensure hydration, avoid further nephrotoxins"
    ]
  }
];

export default function ContrastNephropathyPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-orange-50 border-orange-200">
        <AlertTriangle className="w-4 h-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Contrast-Induced AKI Prevention:</strong> Identify risk before every contrast study. Prevention is far easier than treatment.
        </AlertDescription>
      </Alert>
      {steps.map((s, i) => (
        <Card key={i} className={`border-2 ${s.color}`}>
          <CardHeader className="pb-2"><CardTitle className="text-base">Step {i + 1}: {s.title}</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">{s.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span>{item}</span></li>
            ))}</ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}