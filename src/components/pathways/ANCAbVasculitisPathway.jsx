import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function ANCAbVasculitisPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>ANCA-Associated Vasculitis (AAV):</strong> GPA (c-ANCA/PR3) and MPA (p-ANCA/MPO). Rapidly progressive GN requiring urgent induction. Rare in children but life/kidney threatening.
        </AlertDescription>
      </Alert>

      {[
        { title: "Diagnosis", color: "bg-blue-50 border-blue-200", items: [
          "ANCA serology: c-ANCA (PR3-ANCA) — GPA; p-ANCA (MPO-ANCA) — MPA/EGPA",
          "Renal biopsy: pauci-immune crescentic GN (few/no immune deposits on IF)",
          "Pulmonary: HRCT chest (ground glass opacification, nodules, cavitations)",
          "Urine: dysmorphic RBCs, RBC casts, proteinuria"
        ]},
        { title: "Induction Therapy (First-Line)", color: "bg-red-50 border-red-200", items: [
          "IV methylprednisolone 30 mg/kg (max 1 g) × 3 days",
          "Then oral prednisolone 1 mg/kg/day (max 60 mg), taper over 6 months",
          "Cyclophosphamide IV 15 mg/kg/dose every 2–3 weeks × 6 pulses (preferred for severe disease)",
          "OR Rituximab 375 mg/m²/week × 4 doses (non-inferior to CYC, better toxicity profile)"
        ]},
        { title: "Plasma Exchange (PLEX)", color: "bg-orange-50 border-orange-200", items: [
          "Consider for: creatinine >500 μmol/L, dialysis-dependent, or diffuse alveolar hemorrhage",
          "7 sessions over 14 days (1 plasma volume per session with albumin/FFP)",
          "PEXIVAS trial (2020): PLEX did not reduce ESKD/death — now controversial",
          "Still recommended by many centers for DAH and severe renal failure"
        ]},
        { title: "Maintenance Therapy", color: "bg-green-50 border-green-200", items: [
          "Azathioprine 2 mg/kg/day × 24 months (after induction complete)",
          "OR Rituximab 500 mg IV every 6 months × 2 years",
          "Low-dose prednisolone: taper to off by 12–18 months",
          "Monitor ANCA, GFR, urinalysis every 3 months",
          "Relapse: repeat induction (rituximab preferred)"
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