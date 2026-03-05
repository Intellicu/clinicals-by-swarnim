import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, ChevronRight, ChevronDown, Info } from 'lucide-react';

const STEPS = [
  {
    id: 1, phase: 'Diagnosis',
    title: 'Confirm Steroid-Resistant NS',
    color: 'bg-red-500',
    content: 'No remission after 8 weeks of standard prednisolone (2 mg/kg/day for 4 wks, then 1.5 mg/kg/altday for 4 wks)',
    alerts: ['Check compliance before labelling SR', 'Exclude secondary causes: lupus, infection'],
    actions: ['Urine PCR > 2 mg/mg × 4 wks', 'Serum albumin, lipids, kidney function', 'Complement (C3/C4), ANA, dsDNA', 'BP monitoring & ophthalmic review']
  },
  {
    id: 2, phase: 'Workup',
    title: 'Pre-Biopsy Evaluation',
    color: 'bg-orange-500',
    content: 'Renal biopsy is recommended in all steroid-resistant NS to guide therapy',
    alerts: ['Ensure BP <130/80 before biopsy', 'Correct coagulopathy (platelets >80K, INR <1.5)'],
    actions: ['Renal biopsy (percutaneous/open)', 'LM, IF, EM', 'Genetic panel if age <1yr, family Hx, or SR in first episode', 'NPHS1, NPHS2, WT1, PLCE1']
  },
  {
    id: 3, phase: 'Initial Therapy',
    title: 'Calcineurin Inhibitor (CNI) Therapy',
    color: 'bg-blue-500',
    content: 'Cyclosporin A (CsA) 4-5 mg/kg/day or Tacrolimus 0.1-0.2 mg/kg/day + low-dose steroids',
    alerts: ['Monitor drug levels (CsA trough 100-200 ng/mL, FK506 5-10 ng/mL)', 'Renal toxicity — monitor Cr q3m'],
    actions: ['CsA: 4–5 mg/kg/day BD, target C2 800–1200 ng/mL', 'Tacrolimus: 0.1–0.2 mg/kg/day BD', 'Continue pred 0.5 mg/kg/altday', 'Trial minimum 6 months before declaring failure']
  },
  {
    id: 4, phase: 'Add-On/Alternative',
    title: 'Mycophenolate / Rituximab',
    color: 'bg-purple-500',
    content: 'For CNI-failure or CNI-toxicity, consider MMF or Rituximab',
    alerts: ['Rituximab: Pre-check immunizations, CD19 count', 'MMF: Monitor CBC, LFT every 3 months'],
    actions: ['MMF: 600–900 mg/m²/day in 2 divided doses', 'Rituximab: 375 mg/m² IV (max 2 doses, 1 week apart)', 'Consider ACTH for MCD unresponsive to CNI', 'Adcetazone (obinutuzumab) in refractory cases']
  },
  {
    id: 5, phase: 'Supportive',
    title: 'Supportive & Monitoring',
    color: 'bg-teal-500',
    content: 'RAAS blockade mandatory for all proteinuric patients, regardless of BP',
    alerts: ['Monitor GFR 3-monthly', 'Annual bone density if prolonged steroids'],
    actions: ['ACE-I/ARB (enalapril 0.1 mg/kg BD or losartan 0.7 mg/kg/day)', 'Low-salt diet, fluid restriction if edema', 'Albumin 0.5–1 g/kg + furosemide for severe edema', 'Prophylactic penicillin/cotrimoxazole', 'Pneumococcal & influenza vaccination']
  },
];

export default function SteroidResistantNSPathway() {
  const [expanded, setExpanded] = useState(1);
  return (
    <div className="space-y-3">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
        <p className="text-sm font-bold text-red-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Steroid-Resistant Nephrotic Syndrome</p>
        <p className="text-xs text-red-700 mt-1">Failure to achieve remission after 8 weeks of standard prednisolone therapy. Biopsy-guided immunosuppression required.</p>
      </div>
      {STEPS.map(step => (
        <Card key={step.id} className={`border-l-4 ${expanded === step.id ? 'shadow-md' : ''}`} style={{ borderLeftColor: step.color.replace('bg-', '').replace('-500', '') }}>
          <button className="w-full text-left" onClick={() => setExpanded(expanded === step.id ? null : step.id)}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${step.color} text-white flex items-center justify-center text-sm font-bold shrink-0`}>{step.id}</div>
                <div>
                  <Badge className="text-xs mb-1 bg-slate-100 text-slate-600">{step.phase}</Badge>
                  <CardTitle className="text-sm">{step.title}</CardTitle>
                </div>
              </div>
              {expanded === step.id ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
            </CardHeader>
          </button>
          {expanded === step.id && (
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm text-slate-700">{step.content}</p>
              {step.alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-2 bg-amber-50 p-2 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800">{a}</p>
                </div>
              ))}
              <div className="space-y-1.5">
                {step.actions.map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-700">{a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}