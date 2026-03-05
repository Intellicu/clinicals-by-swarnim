import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';

const STEPS = [
  { id: 1, phase: 'Recognition', title: 'Identify Hypocalcemia', color: '#ef4444',
    content: 'Total Ca < 8.8 mg/dL (corrected for albumin) or ionized Ca < 1.0 mmol/L',
    alerts: ['Correct for albumin: Ca + 0.8 × (4 − albumin)', 'Ionized Ca is gold standard'],
    actions: ['Check ECG (prolonged QT)', 'Serum Mg, PO4, PTH, 25-OHD', 'Renal function', 'Check if symptomatic: tetany, seizures, Chvostek/Trousseau'] },
  { id: 2, phase: 'Severity', title: 'Assess Severity & Urgency', color: '#f97316',
    content: 'Symptomatic or severe hypocalcemia (iCa < 0.8) = Emergency',
    alerts: ['Seizures/tetany/arrhythmia = IMMEDIATE IV Ca', 'Always correct Mg first if hypomagnesemia'],
    actions: ['Mild (Ca 7.5-8.5): Oral Rx', 'Moderate (Ca 6.5-7.5): Close monitoring ± IV', 'Severe (Ca < 6.5 or symptomatic): IV therapy'] },
  { id: 3, phase: 'Acute Tx', title: 'Emergency IV Calcium', color: '#3b82f6',
    content: 'IV calcium gluconate 10% for symptomatic or severe cases',
    alerts: ['Never give IV Ca in same line as bicarbonate or phosphate', 'Extravasation causes severe tissue necrosis'],
    actions: ['Ca gluconate 10%: 0.5–1 mL/kg (max 20 mL) IV over 10 min', 'Repeat if symptoms persist in 10 min', 'Maintenance infusion: 0.3–0.5 mmol/kg/h', 'Monitor ECG during infusion', 'Check iCa every 1-2 hours'] },
  { id: 4, phase: 'Aetiology', title: 'Find & Treat Cause', color: '#8b5cf6',
    content: 'Most common in pediatric nephrology: CKD-MBD, vitamin D deficiency, hypoparathyroidism, hypomagnesemia',
    alerts: ['PTH low + Ca low = Hypoparathyroidism', 'PTH high + Ca low = CKD or vitamin D deficiency'],
    actions: ['Vitamin D deficiency: Cholecalciferol 60,000 IU weekly × 8-12 wks', 'CKD-MBD: Calcitriol 0.01-0.05 mcg/kg/day', 'Hypoparathyroidism: Calcitriol + Ca supplements', 'Hypomagnesemia: IV/oral Mg replacement'] },
  { id: 5, phase: 'Chronic Mx', title: 'Oral Calcium & Monitoring', color: '#10b981',
    content: 'Oral calcium carbonate or citrate + active vitamin D as maintenance',
    alerts: ['Avoid hypercalciuria (urine Ca:Cr > 0.8)', 'Monitor renal function if on calcitriol'],
    actions: ['Ca carbonate: 25-50 mg/kg/day elemental Ca in 3 doses', 'Calcitriol: 0.01-0.05 mcg/kg/day (max 0.5 mcg/day)', 'Target Ca 8.5-9.5 mg/dL, avoid hypercalcemia', 'Quarterly: Ca, PO4, Mg, PTH, urine Ca:Cr', 'Annual: Renal US for nephrocalcinosis'] },
];

export default function HypocalcemiaPathway() {
  const [expanded, setExpanded] = useState(1);
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-2">
        <p className="text-sm font-bold text-blue-800">Hypocalcemia Management Pathway</p>
        <p className="text-xs text-blue-700 mt-1">Pediatric: iCa &lt; 1.0 mmol/L or total Ca &lt; 8.8 mg/dL (corrected)</p>
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