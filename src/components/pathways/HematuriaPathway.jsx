import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Droplet } from "lucide-react";

export default function HematuriaPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-red-50 border-red-200">
        <Droplet className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Approach to Hematuria in Children:</strong> Microscopic hematuria: ≥5 RBC/HPF. Always confirm with microscopy before imaging. Glomerular vs non-glomerular distinction is key.
        </AlertDescription>
      </Alert>

      {[
        { title: "Glomerular vs Non-Glomerular Hematuria", color: "bg-blue-50 border-blue-200", items: [
          "Glomerular: dysmorphic RBCs, RBC casts, brown/tea-colored urine, proteinuria present",
          "Non-glomerular: isomorphic RBCs, bright red blood, pain, clots possible",
          "Phase-contrast microscopy: >80% dysmorphic RBCs = glomerular origin",
          "Acanthocytes (ring-form RBCs): pathognomonic for glomerular bleeding"
        ]},
        { title: "Initial Workup", color: "bg-green-50 border-green-200", items: [
          "Urine: microscopy, culture, protein:creatinine ratio",
          "Blood: BMP (Cr, BUN, Ca, PO4), CBC, C3, C4, ANA, anti-dsDNA",
          "ASO titer: if recent pharyngitis/impetigo (post-strep GN)",
          "Renal ultrasound: all patients (stones, structural anomalies, tumors)",
          "Family history: Alport syndrome (sensorineural deafness, eye anomalies)"
        ]},
        { title: "Cause-Specific Investigation", color: "bg-purple-50 border-purple-200", items: [
          "Alport syndrome: COL4A3/A4/A5 gene panel, skin biopsy for type IV collagen",
          "IgA nephropathy: IgA levels (not sensitive); biopsy for diagnosis",
          "Thin basement membrane nephropathy (TBMN): COL4A3/A4 heterozygous mutation",
          "Hypercalciuria: 24hr urinary calcium, calcium:creatinine ratio",
          "Renal stone: non-contrast CT KUB or renal USS"
        ]},
        { title: "Isolated Microscopic Hematuria — Monitoring", color: "bg-slate-50 border-slate-200", items: [
          "No proteinuria, normal GFR, normal BP: reassure parents, annual monitoring",
          "Repeat urine in 3–6 months — often resolves",
          "Consider nephrology referral if: persistent >12 months, proteinuria develops, family history CKD/deafness"
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