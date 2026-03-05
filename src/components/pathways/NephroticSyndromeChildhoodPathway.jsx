import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Droplet, AlertTriangle } from "lucide-react";

export default function NephroticSyndromeChildhoodPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Droplet className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Childhood Nephrotic Syndrome (ISKDC/IPNA 2020):</strong> Defined as proteinuria ≥40 mg/m²/hr or PCR ≥200 mg/mmol + hypoalbuminemia &lt;2.5 g/dL. Initial therapy with prednisolone.
        </AlertDescription>
      </Alert>

      {[
        { title: "Initial Therapy (First Presentation)", color: "bg-blue-50 border-blue-200", items: [
          "Prednisolone 60 mg/m²/day (max 60 mg) OD × 4–6 weeks",
          "Then 40 mg/m² on alternate days × 4–6 weeks (total 12 weeks)",
          "Urine dipstick monitoring daily — record in diary",
          "Remission: protein trace/negative for 3 consecutive days"
        ]},
        { title: "Response Definitions", color: "bg-green-50 border-green-200", items: [
          "Complete remission: PCR <20 mg/mmol or dipstick trace/negative",
          "Steroid-sensitive (SSNS): remission within 4 weeks of prednisolone",
          "Steroid-resistant (SRNS): no remission after 4 weeks standard therapy + 3 pulses IV methylpred",
          "Frequent relapse (FRNS): ≥4 relapses in 12 months",
          "Steroid-dependent (SDNS): relapse during taper or within 14 days of stopping steroids"
        ]},
        { title: "Relapse Management", color: "bg-yellow-50 border-yellow-200", items: [
          "Prednisolone 60 mg/m²/day until remission (minimum 3 days of negative protein), then 40 mg/m² alternate day × 4 weeks",
          "If FRNS/SDNS: consider levamisole, mycophenolate, or low-dose alternate-day steroids"
        ]},
        { title: "Steroid-Sparing Agents (FRNS/SDNS)", color: "bg-purple-50 border-purple-200", items: [
          "Levamisole 2.5 mg/kg every alternate day (2 years therapy) — cheapest option",
          "Mycophenolate mofetil (MMF) 600 mg/m²/dose BD — for SDNS",
          "Calcineurin inhibitors (Tacrolimus/Cyclosporine) — for SDNS refractory",
          "Rituximab — for SDNS/FRNS refractory to above; 375 mg/m² IV × 1–4 doses",
          "Cyclophosphamide 2 mg/kg/day × 8–12 weeks (cumulative dose <170 mg/kg)"
        ]},
        { title: "Complications Management", color: "bg-red-50 border-red-200", items: [
          "Severe edema: see severe edema pathway (albumin + furosemide)",
          "Infections: penicillin prophylaxis if persistent hypoalbuminemia, vaccinations (pneumococcal, varicella)",
          "Hypertension: amlodipine or ACE-I (only if proteinuria-driven)",
          "Thrombosis: hydration, mobilization; anticoagulation for high-risk cases (albumin <2 g/dL)",
          "Steroid side effects: bone protection (calcium/vitamin D), BP monitoring, growth monitoring"
        ]},
        { title: "Biopsy Indications", color: "bg-slate-50 border-slate-200", items: [
          "Age <1 year or >12 years at presentation",
          "Persistent hematuria (>6 months), low C3/C4",
          "Suspected secondary causes (lupus, vasculitis)",
          "Steroid resistance (SRNS) — mandatory before second-line therapy"
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