import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function IgAVasculitisPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-purple-50 border-purple-200">
        <AlertTriangle className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>IgA Vasculitis Nephritis (IgAVN / HSPN):</strong> Renal involvement in IgA vasculitis. Classified by ISKDC / EULAR. Proteinuria ≥25 mg/mmol is the threshold for treatment.
        </AlertDescription>
      </Alert>

      {[
        { title: "ISKDC Classification of HSPN", color: "bg-blue-50 border-blue-200", items: [
          "Grade I: Minimal changes", "Grade II: Pure mesangial proliferation",
          "Grade III: Mesangial proliferation with <50% crescents",
          "Grade IV: Mesangial proliferation with 50-75% crescents",
          "Grade V: >75% crescents", "Grade VI: Membranoproliferative pattern"
        ]},
        { title: "Monitoring Indications for Biopsy", color: "bg-yellow-50 border-yellow-200", items: [
          "Nephrotic-range proteinuria (PCR >250 mg/mmol) persisting >4 weeks",
          "Nephritic syndrome (hematuria + hypertension + acute kidney injury)",
          "Declining renal function or severe hypertension"
        ]},
        { title: "Treatment by Severity", color: "bg-green-50 border-green-200", items: [
          "Mild (PCR 25-250 mg/mmol, no HTN, normal GFR): ACE-I/ARB, close monitoring",
          "Moderate (persistent proteinuria, normal GFR): ACE-I/ARB + consider corticosteroids",
          "Severe (nephrotic/nephritic syndrome, grade III-IV): Prednisolone + MMF or azathioprine",
          "Crescentic (>50% crescents): IV methylprednisolone pulses + cyclophosphamide ± rituximab"
        ]},
        { title: "Follow-up & Prognosis", color: "bg-slate-50 border-slate-200", items: [
          "Monthly urine dipstick for 12 months post-episode",
          "Annual BP and urine monitoring for 5 years",
          "50% with nephrotic syndrome → progress to CKD if untreated",
          "Crescentic nephritis: aggressive treatment required to preserve renal function"
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