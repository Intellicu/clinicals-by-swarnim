import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function PeritonealDialysisPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertTriangle className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Peritoneal Dialysis (PD):</strong> Preferred modality for children with ESKD. Continuous home therapy, less cardiovascular stress, residual renal function preserved longer.
        </AlertDescription>
      </Alert>

      {[
        { title: "Tenckhoff Catheter & Initial Prescription", color: "bg-blue-50 border-blue-200", items: [
          "Catheter insertion: surgically placed, allow 2–4 weeks healing before use (ideally)",
          "Initial fill volume: 10–15 mL/kg/exchange (increase to 35–40 mL/kg over weeks)",
          "Standard glucose concentrations: 1.36%, 2.27%, 3.86%",
          "Dwell time: CAPD 4–6 hrs/exchange; APD overnight 8–10 hrs"
        ]},
        { title: "Adequacy Targets", color: "bg-green-50 border-green-200", items: [
          "Weekly Kt/V urea target: ≥1.8 for anuric patients",
          "Include residual renal function in calculations",
          "Peritoneal equilibration test (PET): classify transport as high/low",
          "High transporters: benefit from short dwell APD",
          "Low transporters: benefit from long dwell CAPD"
        ]},
        { title: "Peritonitis Recognition & Management", color: "bg-red-50 border-red-200", items: [
          "Definition: cloudy dialysate + ≥100 WBC/mm³ (>50% neutrophils)",
          "Empiric: vancomycin IP (15–30 mg/kg q5-7 days) + 3rd gen cephalosporin or aminoglycoside",
          "Duration: minimum 2 weeks (minimum 3 weeks for S. aureus, fungi)",
          "Catheter removal: if no improvement at 5 days, fungal peritonitis, or recurrent same organism",
          "Relapse: same organism within 4 weeks of completing treatment — catheter removal recommended"
        ]},
        { title: "Exit Site Infection", color: "bg-orange-50 border-orange-200", items: [
          "Diagnosis: purulent discharge ± erythema/swelling/pain at exit site",
          "Empiric: oral penicillinase-resistant antibiotic (flucloxacillin) pending culture",
          "S. aureus ESI: oral rifampicin may be added",
          "Pseudomonas ESI: ciprofloxacin; high risk of tunnel infection and peritonitis"
        ]},
        { title: "Non-infectious Complications", color: "bg-slate-50 border-slate-200", items: [
          "Hernias: umbilical/inguinal (reduce fill volumes, surgical repair during catheter downtime)",
          "Hydrothorax: reduce PD volumes, talc pleurodesis",
          "Ultrafiltration failure: consider icodextrin for long dwells",
          "Encapsulating peritoneal sclerosis: rare but severe — calcifications, bowel obstruction"
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