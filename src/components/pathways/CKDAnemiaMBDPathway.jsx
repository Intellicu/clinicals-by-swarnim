import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Info } from "lucide-react";

export default function CKDAnemiaMBDPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-purple-50 border-purple-200">
        <Info className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>CKD — Anemia & Mineral Bone Disease:</strong> Two of the most important complications in CKD. Both start early (G3) and require active management.
        </AlertDescription>
      </Alert>

      {[
        { title: "Anemia of CKD — Evaluation", color: "bg-red-50 border-red-200", items: [
          "Definition: Hb <11 g/dL (children <5 yr), <11.5 g/dL (5–12 yr), <12 g/dL (12–15 yr)",
          "Exclude iron deficiency first: serum ferritin, transferrin saturation",
          "Target iron parameters: ferritin >100 ng/mL, TSAT >20%",
          "Also check B12, folate, hemolysis screen"
        ]},
        { title: "Anemia Treatment", color: "bg-red-50 border-red-200", items: [
          "Iron: IV iron sucrose (non-dialysis) or IV ferric carboxymaltose — preferred over oral for CKD",
          "Erythropoiesis-stimulating agents (ESA): start when Hb <10 g/dL, iron-replete",
          "Epoetin alpha 50–300 units/kg SC 3× weekly OR darbepoetin alfa 0.45–0.75 mcg/kg/week",
          "Target Hb: 10–12 g/dL (avoid >13 g/dL — increased cardiovascular risk)",
          "Hyporesponsiveness: check iron, infection, inflammation, aluminum toxicity, secondary HPT"
        ]},
        { title: "CKD-MBD — Monitoring", color: "bg-purple-50 border-purple-200", items: [
          "Start monitoring from CKD G3a (eGFR <60)",
          "Parameters: Ca, PO4, PTH, alkaline phosphatase, 25-OH Vitamin D",
          "Frequency: G3: 6–12 months; G4: 3–6 months; G5/dialysis: 1–3 months",
          "Bone density: baseline DEXA if high fracture risk"
        ]},
        { title: "CKD-MBD — Treatment", color: "bg-purple-50 border-purple-200", items: [
          "Dietary phosphate restriction: <800 mg/day",
          "Phosphate binders: calcium carbonate (with meals), sevelamer (avoid calcium overload in dialysis)",
          "Vitamin D: native Vit D3 (cholecalciferol) for deficiency; activated (calcitriol/alfacalcidol) for CKD G4-5",
          "Secondary HPT (elevated PTH): calcitriol or paricalcitol IV/oral",
          "Calcimimetics (cinacalcet): for refractory HPT in dialysis patients; rare use in children",
          "Parathyroidectomy: if PTH >1000 pg/mL unresponsive to medical therapy"
        ]},
        { title: "Calciphylaxis", color: "bg-slate-50 border-slate-200", items: [
          "Calcification of small dermal vessels leading to ischemia and necrosis",
          "Risk factors: obesity, diabetes, warfarin, calcium-based binders, high Ca×PO4",
          "Management: sodium thiosulfate IV, wound care, stop calcium-based binders, optimize PTH",
          "Urgent dialysis intensification if on dialysis"
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