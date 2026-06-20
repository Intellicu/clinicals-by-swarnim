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
          <strong>IgA Vasculitis Nephritis (IgAVN / HSPN) — IPNA 2024:</strong> Renal involvement in IgA vasculitis. Do NOT use glucocorticoids (or heparin/antiplatelets) to <em>prevent</em> nephritis. RASB for proteinuria UPCR ≥0.2 mg/mg (20 mg/mmol); glucocorticoids reserved for nephrotic-range proteinuria or RPGN with ISKDC ≥ II.
        </AlertDescription>
      </Alert>

      {[
        { title: "ISKDC Classification of HSPN", color: "bg-blue-50 border-blue-200", items: [
          "Grade I: Minimal changes", "Grade II: Pure mesangial proliferation",
          "Grade III: Mesangial proliferation with <50% crescents",
          "Grade IV: Mesangial proliferation with 50-75% crescents",
          "Grade V: >75% crescents", "Grade VI: Membranoproliferative pattern"
        ]},
        { title: "Indications for Kidney Biopsy (IPNA 2024)", color: "bg-yellow-50 border-yellow-200", items: [
          "Nephrotic-range proteinuria (UPCR >2 mg/mg / 200 mg/mmol) — recommend",
          "eGFR <90 mL/min/1.73m² irrespective of proteinuria level — recommend",
          "Moderate proteinuria (UPCR 1–2 / 100–200 mg/mmol) persisting 2–4 weeks — suggest",
          "Mild proteinuria (UPCR 0.2–0.5 / 20–50 mg/mmol) persisting >4 weeks — suggest"
        ]},
        { title: "Treatment by Severity (IPNA 2024)", color: "bg-green-50 border-green-200", items: [
          "Isolated haematuria, no proteinuria (UPCR <0.2): NO glucocorticoids — monitor urine + BP",
          "Proteinuria UPCR ≥0.2 without nephrotic-range/RPGN: RASB (ACEi/ARB); BP <90th percentile",
          "Nephrotic-range proteinuria or RPGN with ISKDC ≥ II: 3–6 month glucocorticoid course (IV pulses → tapering oral, or oral)",
          "Add immunosuppressant (CNI, cyclophosphamide, MMF, or mizoribine) if UPCR >2, to reduce steroid dose, or insufficient response",
          "Repeat kidney biopsy if proteinuria persists >4 weeks on treatment"
        ]},
        { title: "Follow-up & Discontinuation (IPNA 2024)", color: "bg-slate-50 border-slate-200", items: [
          "Monitor for nephritis ≥12 months even if no kidney involvement at presentation",
          "With kidney involvement: monthly ×6 months, then 3-monthly ×6 months, then 6-monthly for ≥5 years",
          "Yearly lifelong BP + urinalysis; target UPCR <0.2",
          "Min 8–12 weeks immunosuppression; discontinue after ≥4 weeks remission (UPCR <0.2, no gross haematuria, eGFR >90)"
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