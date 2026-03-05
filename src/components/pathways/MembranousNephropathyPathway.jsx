import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Microscope } from "lucide-react";

export default function MembranousNephropathyPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-purple-50 border-purple-200">
        <Microscope className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>Membranous Nephropathy (MN):</strong> Rare in children; most secondary (lupus, HBV, drugs). Primary: anti-PLA2R antibody positive in ~70%. Initial: conservative for 6 months.
        </AlertDescription>
      </Alert>

      {[
        { title: "Workup", color: "bg-blue-50 border-blue-200", items: [
          "Biopsy: subepithelial deposits (IgG, C3 granular 'spike' pattern on EM)",
          "Anti-PLA2R antibody (serum): positive in primary MN",
          "ANA, anti-dsDNA, C3, C4 (exclude lupus)",
          "HBsAg, HCV (secondary causes), serum protein electrophoresis",
          "Age >12: cancer workup (especially if anti-PLA2R negative)"
        ]},
        { title: "Conservative Phase (6 Months)", color: "bg-green-50 border-green-200", items: [
          "ACE-I/ARB: reduce proteinuria, renoprotective",
          "BP control: target <75th centile",
          "Sodium restriction, diuretics for edema",
          "Statin if hyperlipidemia severe",
          "Anticoagulation: if albumin <2.5 g/dL (high VTE risk)"
        ]},
        { title: "Immunosuppressive Therapy (If No Remission at 6 Months)", color: "bg-red-50 border-red-200", items: [
          "Rituximab: 375 mg/m²/dose × 1–4 doses (now first-line for adults per KDIGO 2021)",
          "Cyclophosphamide + steroids: modified Ponticelli regimen",
          "Calcineurin inhibitors (tacrolimus or cyclosporine): alternative, higher relapse rate"
        ]},
        { title: "Monitoring Response", color: "bg-slate-50 border-slate-200", items: [
          "Complete remission: proteinuria <0.3 g/day",
          "Partial remission: >50% reduction and proteinuria <3.5 g/day",
          "Monitor anti-PLA2R titers: rising suggests relapse",
          "Annual renal function, urine protein"
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