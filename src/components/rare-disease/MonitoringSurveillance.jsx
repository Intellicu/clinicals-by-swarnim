import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";

const MONITORING_PROTOCOLS = [
  {
    disease: "aHUS / TMA", color: "red",
    items: [
      { test: "LDH", freq: "Before each infusion, monthly", note: "Rising LDH = TMA activity" },
      { test: "Platelets + Hb (blood film)", freq: "Before each infusion", note: "Schistocytes confirm microangiopathy" },
      { test: "Creatinine / eGFR", freq: "Before each infusion", note: "Renal recovery trajectory" },
      { test: "CH50 / AP50", freq: "Monthly", note: "Complete complement inhibition target" },
      { test: "Anti-CFH antibodies", freq: "3-monthly (if initially positive)", note: "Titre correlates with relapse risk" },
      { test: "Meningococcal antibody titres", freq: "Annual", note: "Confirm ongoing vaccine protection" },
      { test: "Urine protein:creatinine", freq: "Before each infusion", note: "Residual proteinuria = ongoing glomerular injury" },
    ]
  },
  {
    disease: "Cystinosis", color: "amber",
    items: [
      { test: "Leucocyte cystine", freq: "Monthly", note: "Target <0.5 nmol/mg protein on cysteamine" },
      { test: "Renal function + electrolytes", freq: "Monthly (under 10 yrs), 3-monthly (older)", note: "Fanconi syndrome monitoring" },
      { test: "Ophthalmology (slit lamp + fundus)", freq: "Annual", note: "Corneal crystals + retinal changes" },
      { test: "Thyroid function", freq: "Annual", note: "Hypothyroidism common in adolescents" },
      { test: "Swallowing assessment", freq: "Annual from age 12", note: "Dysphagia from oropharyngeal deposits" },
      { test: "Pulmonary function tests", freq: "Annual from age 12", note: "Restrictive lung disease" },
      { test: "Muscle strength / myopathy screen", freq: "Annual from age 12", note: "Vacuolar myopathy" },
      { test: "Brain MRI", freq: "Every 2 years from age 10", note: "Encephalopathy, intracranial hypertension" },
      { test: "Growth, nutrition", freq: "Every 3 months", note: "Aggressive nutritional support" },
    ]
  },
  {
    disease: "Fabry Disease", color: "violet",
    items: [
      { test: "eGFR + urine protein (ACR)", freq: "Annual", note: "Primary endpoint of renal damage" },
      { test: "Urine Gb3 and lyso-Gb3", freq: "Annual", note: "Treatment response marker" },
      { test: "Cardiac MRI (LGE)", freq: "Every 2 years", note: "Fibrosis progression — key predictor" },
      { test: "Echocardiogram + ECG/Holter", freq: "Annual", note: "LVH, arrhythmia detection" },
      { test: "Brain MRI (DWI + FLAIR)", freq: "Every 2–3 years from age 10", note: "White matter lesions, posterior fossa" },
      { test: "Ophthalmology", freq: "Annual", note: "Cornea verticillata, posterior cataracts" },
      { test: "Audiometry", freq: "Every 2 years", note: "Progressive SNHL" },
      { test: "Pain assessment + QOL score", freq: "6-monthly", note: "Neuropathic pain is major disability" },
    ]
  },
  {
    disease: "Primary Hyperoxaluria (PH1)", color: "orange",
    items: [
      { test: "24-h urine oxalate (or spot U-ox:Cr)", freq: "3-monthly", note: "Target <0.46 mmol/1.73m²/day on lumasiran" },
      { test: "eGFR", freq: "3-monthly", note: "Rapid decline if plasma oxalate elevated" },
      { test: "Plasma oxalate", freq: "Monthly if eGFR <30", note: ">30 μmol/L = systemic oxalosis risk" },
      { test: "Renal ultrasound (stone burden, NC)", freq: "Every 6 months", note: "Track NC progression + stone load" },
      { test: "Ophthalmology (fundus + OCT)", freq: "Annual", note: "Retinal oxalate deposits (advanced disease)" },
      { test: "Bone scan / skeletal X-ray", freq: "Annual if advanced", note: "Bone oxalate deposition" },
      { test: "Echocardiogram", freq: "Annual if eGFR <30", note: "Oxalate cardiomyopathy" },
    ]
  },
  {
    disease: "Alport Syndrome", color: "indigo",
    items: [
      { test: "Urine ACR / urine PCR", freq: "6-monthly", note: "Proteinuria onset → start RAS blockade immediately" },
      { test: "eGFR", freq: "6-monthly (CKD3+: 3-monthly)", note: "Rate of decline determines transplant planning" },
      { test: "Blood pressure", freq: "Monthly", note: "Hypertension from proteinuria onset" },
      { test: "Audiometry", freq: "Every 2 years from age 5", note: "High-frequency SNHL precedes renal failure in males" },
      { test: "Ophthalmology (slit lamp)", freq: "Every 2–3 years", note: "Anterior lenticonus, macular flecks" },
      { test: "Anti-GBM antibodies post-transplant", freq: "3-monthly for first year", note: "Anti-GBM disease risk 3% after transplant" },
    ]
  },
  {
    disease: "ARPKD", color: "teal",
    items: [
      { test: "Blood pressure", freq: "Monthly", note: "Hypertension common — aggressive management" },
      { test: "Renal function + electrolytes", freq: "3-monthly", note: "Sodium wasting — do not restrict sodium" },
      { test: "LFT + liver USS + portal Doppler", freq: "6-monthly", note: "Portal hypertension, varices" },
      { test: "Upper GI endoscopy (varices)", freq: "From age 2–3 years, every 2 years", note: "Primary prevention of variceal bleed" },
      { test: "Growth and nutrition", freq: "3-monthly", note: "Growth failure common — nutritional support" },
      { test: "Renal USS", freq: "6-monthly", note: "Kidney size, cyst progression" },
      { test: "Urine concentration ability", freq: "Annual", note: "Polyuria = salt wasting" },
    ]
  },
];

const COLOR_MAP = {
  red: "border-red-200 bg-red-50 text-red-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  violet: "border-violet-200 bg-violet-50 text-violet-800",
  orange: "border-orange-200 bg-orange-50 text-orange-800",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-800",
  teal: "border-teal-200 bg-teal-50 text-teal-800",
};

const BADGE_COLOR = {
  red: "bg-red-100 text-red-800",
  amber: "bg-amber-100 text-amber-800",
  violet: "bg-violet-100 text-violet-800",
  orange: "bg-orange-100 text-orange-800",
  indigo: "bg-indigo-100 text-indigo-800",
  teal: "bg-teal-100 text-teal-800",
};

function ProtocolCard({ protocol }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <Badge className={`text-xs ${BADGE_COLOR[protocol.color]}`}>{protocol.disease}</Badge>
          <span className="text-sm text-slate-500">{protocol.items.length} monitoring parameters</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="border-t border-slate-100 p-0">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className={`border-b ${COLOR_MAP[protocol.color]}`}>
                <th className="text-left px-4 py-2 font-semibold w-1/3">Test / Investigation</th>
                <th className="text-left px-3 py-2 font-semibold w-1/4">Frequency</th>
                <th className="text-left px-3 py-2 font-semibold">Clinical Note</th>
              </tr>
            </thead>
            <tbody>
              {protocol.items.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-2 font-medium text-slate-900">{item.test}</td>
                  <td className="px-3 py-2 text-slate-600">{item.freq}</td>
                  <td className="px-3 py-2 text-slate-500 italic">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default function MonitoringSurveillance({ isAdmin }) {
  return (
    <div className="space-y-3">
      <Alert className="bg-violet-50 border-violet-200">
        <Activity className="w-4 h-4 text-violet-600" />
        <AlertDescription className="text-violet-800 text-xs">
          Disease-specific monitoring protocols for major rare renal diseases. Tap each disease to expand monitoring table. All protocols aligned with current evidence-based guidelines (2024).
        </AlertDescription>
      </Alert>
      {MONITORING_PROTOCOLS.map(p => <ProtocolCard key={p.disease} protocol={p} />)}
    </div>
  );
}