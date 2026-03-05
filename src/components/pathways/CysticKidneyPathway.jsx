import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Info } from "lucide-react";

const cystic_diseases = [
  { name: "ADPKD", gene: "PKD1/PKD2", inheritance: "AD", features: "Bilateral large kidneys, liver cysts, hypertension, berry aneurysms", onset: "Any age (rarely symptomatic in childhood)" },
  { name: "ARPKD", gene: "PKHD1", inheritance: "AR", features: "Bilateral renal enlargement, echogenic kidneys, congenital hepatic fibrosis, oligohydramnios", onset: "Prenatal / neonatal" },
  { name: "NPHP (Nephronophthisis)", gene: "NPHP1-20+", inheritance: "AR", features: "Corticomedullary cysts, polyuria, tubulointerstitial nephritis → ESKD in adolescence", onset: "Childhood" },
  { name: "Bardet-Biedl Syndrome", gene: "BBS1-21", inheritance: "AR", features: "Obesity, retinitis pigmentosa, polydactyly, hypogonadism, renal anomalies", onset: "Early childhood" }
];

export default function CysticKidneyPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Cystic Kidney Diseases in Children:</strong> Wide spectrum from ARPKD (neonatal) to NPHP (adolescent). Genetic diagnosis essential for management and counseling.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle className="text-base">Common Cystic Kidney Diseases Comparison</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cystic_diseases.map((d,i) => (
              <div key={i} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">{d.name}</span>
                  <Badge variant="outline" className="text-xs">{d.gene}</Badge>
                  <Badge className={d.inheritance === "AD" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"} >{d.inheritance}</Badge>
                </div>
                <p className="text-xs text-slate-600">{d.features}</p>
                <p className="text-xs text-slate-500 mt-1">Onset: {d.onset}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {[
        { title: "ADPKD Pediatric Management", color: "bg-blue-50 border-blue-200", items: [
          "Genetic testing: PKD1/PKD2 sequencing (PKD1 = 85%, more severe)",
          "Annual BP monitoring and treatment (<90th centile)",
          "Hydration: encourage high fluid intake to reduce cyst growth",
          "Tolvaptan (V2 receptor antagonist): approved for adults >18 yr with rapid progression",
          "Avoid nephrotoxins, contrast without hydration, caffeine, smoking"
        ]},
        { title: "NPHP (Nephronophthisis) Approach", color: "bg-purple-50 border-purple-200", items: [
          "Triad: polyuria/polydipsia, anemia of CKD, growth retardation in late childhood",
          "Genetic panel: >20 causative genes, NPHP1 (deletion) is most common",
          "Extra-renal: retinitis pigmentosa (Joubert/Senior-Loken), oculomotor apraxia",
          "No disease-modifying therapy; progress to ESKD by age 13 (juvenile) or 20 (adolescent type)"
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