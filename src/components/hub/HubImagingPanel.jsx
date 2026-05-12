import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const MODALITIES = [
  { name: "Renal Ultrasound (RBUS)", color: "bg-blue-50 border-blue-200",
    keys: ["First-line for all renal/urological conditions", "Assess: size, echogenicity, corticomedullary differentiation", "Hydronephrosis grading: SFU 0–IV or APRPD in mm", "Increased echogenicity → medical renal disease", "Bladder wall thickness >3mm (full) → outlet obstruction"] },
  { name: "VCUG (Voiding Cystourethrogram)", color: "bg-amber-50 border-amber-200",
    keys: ["VUR grading: I–V (NIDDK criteria)", "Perform after UTI resolves + prophylactic antibiotics", "Fluoroscopic cyclic VCUG: increases grade detection", "Posterior urethral valves: VCUG is diagnostic"] },
  { name: "DMSA Scan", color: "bg-green-50 border-green-200",
    keys: ["99mTc-DMSA: cortical binding — renal scarring + function", "Acute phase (top-down): diagnose pyelonephritis", "Delayed phase (>6 months post-UTI): permanent scarring", "Split function: one kidney <40% = significant asymmetry"] },
  { name: "MAG3 Scan + Diuresis", color: "bg-teal-50 border-teal-200",
    keys: ["Tubular secretion tracer — drainage + differential function", "T½ (drainage half-time): obstructed if >20 min post-diuretic", "Differential function: each kidney's % contribution to total GFR", "Pre and post-pyeloplasty — MAG3 for drainage improvement"] },
  { name: "Renal Biopsy Interpretation", color: "bg-rose-50 border-rose-200",
    keys: ["Light microscopy: H&E, PAS, Masson, Jones' silver", "Immunofluorescence: IgG, IgA, IgM, C3, C1q, fibrinogen", "Electron microscopy: podocyte effacement, deposits location", "Oxford MEST-C score for IgAN", "ISN/RPS classification for Lupus Nephritis (Class I–VI)"] },
];

export default function HubImagingPanel() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <Camera className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Imaging & Diagnostics</h2>
            <p className="text-teal-100 text-sm">RBUS · VCUG · DMSA · MAG3 · Biopsy Interpretation</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {MODALITIES.map((m, i) => (
          <Card key={i} className={`border-2 ${m.color}`}>
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-semibold text-sm text-slate-800">{m.name}</span>
                {open === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {open === i && (
                <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1">
                  {m.keys.map((k, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-teal-500 flex-shrink-0 mt-0.5" />
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