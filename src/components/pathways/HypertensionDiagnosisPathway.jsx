import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BP_STAGES = [
  { label: "Normal", color: "bg-green-100 text-green-800", range: "<90th percentile" },
  { label: "Elevated", color: "bg-yellow-100 text-yellow-800", range: "90th–<95th percentile" },
  { label: "Stage 1 HTN", color: "bg-orange-100 text-orange-800", range: "95th–99th+5 mmHg" },
  { label: "Stage 2 HTN", color: "bg-red-100 text-red-800", range: ">99th+5 mmHg" }
];

export default function HypertensionDiagnosisPathway() {
  return (
    <div className="space-y-4">
      <Alert className="bg-red-50 border-red-200">
        <Heart className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Pediatric Hypertension:</strong> Diagnosis requires ≥3 separate occasions (except hypertensive urgency/emergency). Use age-, sex-, and height-based BP tables (AAP 2017).
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle className="text-base">BP Classification (AAP 2017)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {BP_STAGES.map((s,i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${s.color.split(' ')[0]} border`}>
                <Badge className={s.color}>{s.label}</Badge>
                <span className="text-sm font-medium">{s.range}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
            <strong>Note:</strong> Use oscillometric device confirmed by auscultatory method. Measure in right arm, seated, after 5 min rest. Use appropriate cuff size (bladder covers 80–100% arm circumference).
          </div>
        </CardContent>
      </Card>

      {[
        { title: "Initial Evaluation", color: "bg-blue-50 border-blue-200", items: [
          "History: family history HTN/CKD, diet (salt, caffeine), medications (steroids, decongestants, OCPs)",
          "Growth: height/weight/BMI centile (obesity-related HTN common)",
          "Urine: urinalysis, spot protein:creatinine ratio",
          "Labs: BMP (Cr, BUN, electrolytes, glucose), CBC",
          "Renal ultrasound for all newly diagnosed pediatric HTN"
        ]},
        { title: "Secondary Causes Workup (If Suspected)", color: "bg-purple-50 border-purple-200", items: [
          "Renal parenchymal disease: DMSA scan, renal biopsy if indicated",
          "Renovascular: Doppler ultrasound, CTA/MRA of renal arteries",
          "Primary aldosteronism: plasma aldosterone:renin ratio (>30)",
          "Pheochromocytoma: 24hr urine catecholamines/metanephrines",
          "Cushing syndrome: morning cortisol, 24hr urinary cortisol",
          "Coarctation of aorta: 4-limb BP, echocardiogram"
        ]},
        { title: "Ambulatory BP Monitoring (ABPM)", color: "bg-green-50 border-green-200", items: [
          "Consider for white-coat HTN, masked HTN, borderline readings",
          "Hypertension on ABPM: mean awake >95th%, mean asleep >95th%",
          "Non-dipping pattern (nocturnal dip <10%): associated with CKD, autonomous HTN"
        ]},
        { title: "End-Organ Assessment", color: "bg-slate-50 border-slate-200", items: [
          "Echocardiogram: LVH (LVMI >51 g/m2.7), diastolic dysfunction",
          "Fundoscopy for grade ≥2 hypertensive retinopathy",
          "eGFR, albumin:creatinine ratio for renal end-organ damage"
        ]}
      ].map((s,i) => (
        <Card key={i} className={`border-2 ${s.color}`}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{s.title}</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2">{s.items.map((item,j) => (
            <li key={j} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /><span>{item}</span></li>
          ))}</ul></CardContent>
        </Card>
      ))}
    </div>
  );
}