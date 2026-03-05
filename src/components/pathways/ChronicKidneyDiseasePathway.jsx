import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';

const CKD_STAGES = [
  { stage: 'G1', egfr: '≥ 90', color: '#22c55e', action: 'Diagnosis + risk factor management' },
  { stage: 'G2', egfr: '60–89', color: '#84cc16', action: 'Slowing progression, BP control' },
  { stage: 'G3a', egfr: '45–59', color: '#eab308', action: 'Referral nephrology, complications' },
  { stage: 'G3b', egfr: '30–44', color: '#f97316', action: 'CKD-MBD, anemia, growth' },
  { stage: 'G4', egfr: '15–29', color: '#ef4444', action: 'RRT preparation, transplant workup' },
  { stage: 'G5', egfr: '< 15', color: '#7c3aed', action: 'Dialysis or transplant' },
];

const STEPS = [
  { id: 1, phase: 'Diagnosis', title: 'Confirm & Stage CKD', color: '#3b82f6',
    content: 'CKD = Kidney damage or GFR < 60 for ≥ 3 months. Stage using eGFR (Schwartz/CKiD formula)',
    alerts: ['Cause matters: CAKUT most common in children', 'Exclude AKI superimposed on CKD'],
    actions: ['Schwartz: eGFR = k × height/Cr (k=0.41 child, 0.7 older male)', 'Urine PCR, spot albumin:Cr', 'Renal ultrasound (size, echogenicity, obstruction)', 'MCU if recurrent UTI or VUR suspected', 'DMSA scan if renal scarring'] },
  { id: 2, phase: 'BP & Proteinuria', title: 'Treat Hypertension & Proteinuria', color: '#ef4444',
    content: 'Target BP < 50th percentile. ACE-I/ARB for all proteinuric CKD regardless of BP',
    alerts: ['Do not use ACE-I + ARB together (↑ hyperkalemia risk)', 'Monitor K+ and Cr 1-2 weeks after starting'],
    actions: ['RAAS blockade: Enalapril 0.1 mg/kg BD or Losartan 0.7 mg/kg/day', 'Add amlodipine 0.1 mg/kg/day if BP not controlled', 'Target urine PCR < 0.2 (or ACR < 30)', 'Low-salt diet (< 2g NaCl/day)'] },
  { id: 3, phase: 'CKD-MBD', title: 'CKD-Mineral Bone Disease', color: '#8b5cf6',
    content: 'PTH, Ca, PO4 disturbances begin in G3. Treat early to prevent vascular calcification',
    alerts: ['Avoid calcium-based binders if Ca > 10 mg/dL', 'Target PTH: 2-9× ULN based on stage'],
    actions: ['Restrict dietary phosphate (< 40 mg/kg/day)', 'Sevelamer 400-800 mg TID with meals (PO4 binder)', 'Calcitriol 0.01-0.05 mcg/kg/day if ↑ PTH', 'Cholecalciferol if 25-OHD < 30 ng/mL', 'Target: Ca 8.5-10, PO4 normal, PTH G3-4: 35-70 pg/mL'] },
  { id: 4, phase: 'Anemia', title: 'Manage CKD Anemia', color: '#f97316',
    content: 'Anemia of CKD: Target Hb 10-12 g/dL. Iron deficiency first before ESA',
    alerts: ['Do not target Hb > 12 g/dL with ESA (↑ CV events)', 'IV iron preferred if ferritin < 200 or TSAT < 20%'],
    actions: ['Iron studies: ferritin, TSAT', 'Oral iron: 3-6 mg elemental Fe/kg/day', 'IV iron sucrose if TSAT < 20%: 3 mg/kg (max 200 mg) × 3 doses', 'Epoetin alfa: 50-100 IU/kg 3×/week SC or Darbepoetin 0.45 mcg/kg weekly'] },
  { id: 5, phase: 'Growth & Nutrition', title: 'Growth & Nutritional Support', color: '#10b981',
    content: 'CKD impairs linear growth. GH therapy and optimizing nutrition are critical',
    alerts: ['Protein restriction is controversial in children — ensure adequate intake', 'Acidosis worsens growth — target HCO3 > 22'],
    actions: ['Protein: 100-140% RDA for age', 'Correct metabolic acidosis: NaHCO3/Na citrate to keep HCO3 22-26', 'Recombinant GH: 0.05 mg/kg/day SC if height < -2 SD', 'Enteral tube feeding if inadequate oral intake', 'Renal dietitian referral mandatory G3+'] },
  { id: 6, phase: 'RRT Prep', title: 'Plan Renal Replacement Therapy', color: '#7c3aed',
    content: 'When eGFR < 20 or symptoms, initiate RRT planning. Transplant is preferred modality in children',
    alerts: ['Pre-emptive transplant if suitable donor available (avoid dialysis)', 'PD preferred over HD in young children'],
    actions: ['Transplant workup (G4): tissue typing, serology, imaging', 'PD catheter placement (G4/5): 6-8 weeks pre-start', 'Live donor evaluation and workup', 'Hepatitis B vaccination early (response better at higher GFR)', 'Access creation HD: AVF 3-6 months before dialysis'] },
];

export default function ChronicKidneyDiseasePathway() {
  const [expanded, setExpanded] = useState(1);
  return (
    <div className="space-y-3">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-2">
        <p className="text-sm font-bold text-slate-800 mb-2">CKD Stages (KDIGO)</p>
        <div className="flex gap-1 flex-wrap">
          {CKD_STAGES.map(s => (
            <div key={s.stage} className="text-xs rounded-lg px-2 py-1 text-white" style={{ background: s.color }}>
              {s.stage} (eGFR {s.egfr})
            </div>
          ))}
        </div>
      </div>
      {STEPS.map(step => (
        <Card key={step.id} className="border-l-4" style={{ borderLeftColor: step.color }}>
          <button className="w-full text-left" onClick={() => setExpanded(expanded === step.id ? null : step.id)}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold shrink-0" style={{ background: step.color }}>{step.id}</div>
                <div><Badge className="text-xs mb-1 bg-slate-100 text-slate-600">{step.phase}</Badge><CardTitle className="text-sm">{step.title}</CardTitle></div>
              </div>
              {expanded === step.id ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
            </CardHeader>
          </button>
          {expanded === step.id && (
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm text-slate-700">{step.content}</p>
              {step.alerts.map((a, i) => <div key={i} className="flex items-start gap-2 bg-amber-50 p-2 rounded-lg"><AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" /><p className="text-xs text-amber-800">{a}</p></div>)}
              <div className="space-y-1.5">{step.actions.map((a, i) => <div key={i} className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" /><p className="text-xs text-slate-700">{a}</p></div>)}</div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}