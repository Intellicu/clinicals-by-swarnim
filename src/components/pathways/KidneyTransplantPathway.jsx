import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function KidneyTransplantPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-green-50 border-green-200">
        <AlertTriangle className="w-4 h-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Pediatric Kidney Transplantation:</strong> Preferred treatment for ESKD in children. Preemptive transplant (without dialysis) is ideal. Living donor preferred.
        </AlertDescription>
      </Alert>

      {[
        { title: "Pre-transplant Evaluation", color: "bg-blue-50 border-blue-200", items: [
          "Cardiology: echo, stress test (if >10 years or symptomatic)",
          "Urology: bladder function assessment (VCUG, urodynamics if neuropathic bladder)",
          "Immunology: HLA typing, panel reactive antibodies (PRA), crossmatch",
          "Infections: CMV, EBV, VZV, hepatitis B/C, HIV serology",
          "Vaccination: complete Pneumovax, varicella, flu, HPV, MMR BEFORE transplant"
        ]},
        { title: "Standard Immunosuppression Protocol", color: "bg-purple-50 border-purple-200", items: [
          "Induction: basiliximab 12 mg/m² IV × 2 doses (day 0, day 4) — OR ATG for high-risk",
          "Tacrolimus: target trough 8–12 ng/mL (months 1–3), then 5–8 ng/mL",
          "Mycophenolate mofetil (MMF): 600 mg/m²/dose BD",
          "Prednisolone: 1 mg/kg/day reducing to 0.1–0.2 mg/kg/day by 6 months"
        ]},
        { title: "Acute Rejection Diagnosis & Treatment", color: "bg-red-50 border-red-200", items: [
          "Rising creatinine >20% above baseline: urgent renal biopsy",
          "Banff classification: T-cell mediated (TCMR) vs antibody-mediated (ABMR)",
          "TCMR: IV methylprednisolone 10 mg/kg/day × 3 days",
          "ABMR: IVIG 2 g/kg + plasmapheresis × 5 sessions + rituximab"
        ]},
        { title: "BK Virus Management", color: "bg-orange-50 border-orange-200", items: [
          "Screening: BK PCR monthly for first 12 months, then 3-monthly to 2 years",
          "Significant viremia: >10,000 copies/mL — reduce immunosuppression",
          "BK nephropathy on biopsy: further IS reduction, consider leflunomide/cidofovir",
          "Target BK PCR: undetectable while maintaining graft function"
        ]},
        { title: "FSGS Recurrence Post-Transplant", color: "bg-yellow-50 border-yellow-200", items: [
          "Early recurrence (within days): circulating permeability factor (supra-normal podocyte injury)",
          "Risk factors: FSGS under age 6, rapid progression to ESKD, diffuse mesangial proliferation on biopsy",
          "Treatment: plasmapheresis × 8–10 sessions, rituximab 375 mg/m² × 1–4 doses",
          "IVIG may be combined with PE in severe cases"
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