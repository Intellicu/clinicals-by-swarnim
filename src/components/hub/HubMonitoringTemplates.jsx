import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ClipboardList, CheckCircle } from "lucide-react";

const TEMPLATES = [
  {
    name: "CKD Monitoring",
    color: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    items: [
      "eGFR + creatinine: every 3 months (CKD 3-4), monthly (CKD 5)",
      "Urine protein:creatinine ratio: every 3 months",
      "Electrolytes (Na, K, Ca, PO4, Mg, HCO3): every 3 months",
      "PTH + Vitamin D: every 6 months",
      "CBC + iron studies: every 3 months (EPO therapy)",
      "Lipid profile: annually",
      "Growth & nutrition: every visit",
      "Blood pressure: every visit + home diary",
    ],
  },
  {
    name: "Nephrotic Syndrome Relapse Tracker",
    color: "border-purple-200 bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    items: [
      "Urine dipstick: daily during relapse, alternate days in remission",
      "3+ proteinuria for 3 consecutive days = relapse",
      "Document: date of relapse, steroid dose at relapse, trigger",
      "Track steroid cumulative dose per year",
      "Record steroid-free intervals between relapses",
      "Categorise: SSNS / FRNS / SDNS / SRNS",
      "Growth velocity: every 3 months during steroids",
      "Eye exam: annually if long-term steroids",
    ],
  },
  {
    name: "Transplant Follow-up",
    color: "border-green-200 bg-green-50",
    badge: "bg-green-100 text-green-700",
    items: [
      "Tacrolimus trough: twice weekly (month 1) → weekly → monthly",
      "Creatinine + eGFR: at every visit",
      "BK virus PCR: monthly × 24 months",
      "CMV PCR: monthly × 6 months (D+/R-)",
      "DSA (donor-specific antibodies): 1, 3, 6, 12 months + annually",
      "Urine protein: every visit",
      "Blood pressure: every visit + home diary",
      "EBV PCR: every 3 months (PTLD surveillance)",
    ],
  },
  {
    name: "AKI Recovery",
    color: "border-red-200 bg-red-50",
    badge: "bg-red-100 text-red-700",
    items: [
      "Creatinine + eGFR: daily in ICU → weekly → monthly",
      "Urine output: hourly in ICU → daily",
      "Electrolytes: every 6h in acute → daily → weekly",
      "Fluid balance: strict I/O charting",
      "Follow-up: 3 months post-discharge, then 6-monthly × 2 years",
      "Screen for CKD at 3 months: eGFR, proteinuria, BP",
      "KDIGO AKI-to-CKD transition pathway",
    ],
  },
  {
    name: "BP Monitoring",
    color: "border-orange-200 bg-orange-50",
    badge: "bg-orange-100 text-orange-700",
    items: [
      "Home BP: twice daily (morning + evening) for 1 week before visit",
      "Use correct cuff size (bladder covers 80% arm circumference)",
      "Record: seated, after 5min rest, right arm",
      "Plot on age/sex/height percentile charts",
      "ABPM: gold standard — 24h monitoring for diagnosis + medication titration",
      "Target: <90th percentile (general), <75th (CKD/DM/proteinuria)",
    ],
  },
  {
    name: "Dialysis Monitoring",
    color: "border-cyan-200 bg-cyan-50",
    badge: "bg-cyan-100 text-cyan-700",
    items: [
      "HD: Kt/V monthly (target >1.2), URR >65%",
      "PD: weekly Kt/V + creatinine clearance (target >1.7/week)",
      "PD: PET (peritoneal equilibration test) annually",
      "Dry weight assessment: every session (HD) / monthly (PD)",
      "Exit site: daily inspection, chlorhexidine cleaning",
      "Peritonitis: cell count, culture + Gram stain for cloudy effluent",
      "Nutrition: albumin monthly, dietary review 3-monthly",
      "Access: flow assessment, recirculation studies (HD)",
    ],
  },
  {
    name: "CIC Adherence",
    color: "border-teal-200 bg-teal-50",
    badge: "bg-teal-100 text-teal-700",
    items: [
      "Number of CICs per day (target: 4-6)",
      "Volume drained per catheterisation",
      "Catheter-free urine leaks (indicate urgency/overflow)",
      "UTI episodes: frequency, organism, treatment",
      "Catheter changes: type, frequency, any difficulty",
      "Self-catheterisation progress (age >6-7 years)",
      "Skin integrity around urethra",
    ],
  },
  {
    name: "Bladder Diary",
    color: "border-violet-200 bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
    items: [
      "Fluid intake: type + volume + timing",
      "Voiding frequency: time + volume",
      "Urgency episodes: severity scale 1-5",
      "Incontinence episodes: day/night, volume estimate",
      "Uroflow parameters if available: Qmax, pattern",
      "Post-void residual: timing, volume",
      "Duration: minimum 48h diary (3-day preferred)",
    ],
  },
  {
    name: "Bowel Diary",
    color: "border-amber-200 bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    items: [
      "Bristol Stool Chart: type 1-7 per stool",
      "Frequency: daily bowel movements (target: daily type 3-4)",
      "Soiling episodes: frequency + severity",
      "Laxative use: type + dose + timing",
      "Dietary fibre intake: daily estimate",
      "Fluid intake: daily volume",
      "Abdominal pain: frequency + severity",
    ],
  },
  {
    name: "Growth Monitoring",
    color: "border-pink-200 bg-pink-50",
    badge: "bg-pink-100 text-pink-700",
    items: [
      "Weight: every visit — plot on WHO/IAP centile charts",
      "Height: every 3 months — plot growth velocity",
      "BMI: calculate + plot on centile charts",
      "Head circumference: every visit (<2 years)",
      "Tanner staging: annually in CKD + steroid patients",
      "Growth velocity: flag if <25th centile for age",
      "GH assessment: if growth failure persists despite nutrition",
      "Bone age: if growth concern (CKD 3-5, long-term steroids)",
    ],
  },
];

function TemplateCard({ template }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className={`border-2 ${template.color}`}>
      <CardContent className="p-0">
        <button
          className="w-full flex items-center justify-between p-3 text-left"
          onClick={() => setOpen(v => !v)}
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="font-semibold text-sm text-slate-800">{template.name}</span>
            <Badge className={`text-xs ${template.badge}`}>{template.items.length} items</Badge>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {open && (
          <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1.5">
            {template.items.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HubMonitoringTemplates() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Monitoring Templates</h2>
            <p className="text-emerald-100 text-sm">CKD · NS · Transplant · AKI · BP · Dialysis · CIC · Bladder · Bowel · Growth</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {TEMPLATES.map((t, i) => (
          <TemplateCard key={i} template={t} />
        ))}
      </div>
    </div>
  );
}