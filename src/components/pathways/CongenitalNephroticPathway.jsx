import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Baby, AlertTriangle } from "lucide-react";

export default function CongenitalNephroticPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-red-50 border-red-200">
        <Baby className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Congenital Nephrotic Syndrome (CNS):</strong> Onset within first 3 months of life. Most are genetic. Finnish type (NPHS1/nephrin) is most common. Steroid-unresponsive — genetic workup mandatory.
        </AlertDescription>
      </Alert>

      {[
        { title: "Genetic Causes of CNS", color: "bg-blue-50 border-blue-200", items: [
          "NPHS1 (nephrin) — Finnish type: massive proteinuria, large placenta, born premature",
          "NPHS2 (podocin) — Diffuse mesangial sclerosis, FSGS on biopsy",
          "WT1 mutations — Denys-Drash, Frasier syndrome; associated with gonadal dysgenesis",
          "LAMB2 (laminin-β2) — Pierson syndrome with ocular anomalies",
          "PLCE1, CD2AP, ACTN4 — Other genetic forms"
        ]},
        { title: "Initial Management", color: "bg-green-50 border-green-200", items: [
          "Genetic panel: NPHS1, NPHS2, WT1, LAMB2 at minimum",
          "Renal biopsy: diffuse mesangial sclerosis (DMS) or FSGS on light microscopy",
          "High-dose albumin infusions (1–2 g/kg) + furosemide to control edema",
          "Protein supplementation via nasogastric tube or PEG",
          "Thyroid supplementation (thyroxine-binding globulin lost in urine)"
        ]},
        { title: "Conservative vs Aggressive Management", color: "bg-yellow-50 border-yellow-200", items: [
          "Conservative: manage complications, support nutrition, wait for appropriate transplant size",
          "Bilateral nephrectomy: if hypoalbuminemia uncontrollable or recurrent life-threatening infections",
          "After nephrectomy: peritoneal dialysis until weight ≥8–10 kg for transplant"
        ]},
        { title: "Transplantation", color: "bg-purple-50 border-purple-200", items: [
          "CNS does not recur post-transplant for most genetic forms",
          "Exception: some NPHS2 mutations may recur post-transplant",
          "Optimal transplant size ≥8–10 kg (preferably adult donor)",
          "Immunosuppression: standard calcineurin inhibitor-based protocol"
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