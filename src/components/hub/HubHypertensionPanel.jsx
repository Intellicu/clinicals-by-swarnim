import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const TOPICS = [
  { name: "Pediatric HTN Classification (2017 AAP)", color: "bg-orange-50 border-orange-200",
    keys: ["Normal: <90th percentile", "Elevated: 90–95th", "Stage 1 HTN: 95th–95th+12 mmHg or 130/80–139/89", "Stage 2 HTN: >95th+12 or ≥140/90 (whichever lower)", "3 separate readings required for diagnosis"] },
  { name: "Neonatal Hypertension", color: "bg-red-50 border-red-200",
    keys: ["Systolic >p95 for gestational age + postnatal age", "Most common cause: renovascular (RAS, thrombus)", "Term neonate: >90 mmHg systolic is abnormal", "Amlodipine: 0.1 mg/kg OD — preferred oral", "Hydralazine/labetalol IV in hypertensive crisis"] },
  { name: "ABPM (Ambulatory BP Monitoring)", color: "bg-blue-50 border-blue-200",
    keys: ["24h monitoring: confirms white-coat vs true HTN", "Nocturnal dipping <10% → non-dipping → CKD risk", "Masked HTN: normal clinic but elevated ABPM", "Load >25% = abnormal", "Essential in CKD, renal transplant, adrenal conditions"] },
  { name: "Monogenic Hypertension", color: "bg-green-50 border-green-200",
    keys: ["Low renin + hypokalemia → suspect: GRA, Liddle, AME", "GRA: dexamethasone suppression test + genetic panel", "Liddle syndrome: ENAC mutation → amiloride responsive", "Gordon syndrome (PHA2): WNK kinase mutation → thiazide-responsive"] },
  { name: "Hypertensive Emergency Management", color: "bg-rose-50 border-rose-200",
    keys: ["Target: reduce MAP by no more than 25% in first 8h", "IV labetalol: 0.25–1 mg/kg/hr infusion", "IV nicardipine: 0.5–3 mcg/kg/min (preferred)", "Avoid sudden drops — risk of hypoperfusion/stroke"] },
];

export default function HubHypertensionPanel() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-orange-600 to-red-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Hypertension — Pediatric</h2>
            <p className="text-orange-100 text-sm">Classification · Neonatal HTN · ABPM · Monogenic · Emergency</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {TOPICS.map((t, i) => (
          <Card key={i} className={`border-2 ${t.color}`}>
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-semibold text-sm text-slate-800">{t.name}</span>
                {open === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {open === i && (
                <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1">
                  {t.keys.map((k, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{k}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}