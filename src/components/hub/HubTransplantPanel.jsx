import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Syringe, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const TOPICS = [
  { name: "Immunosuppression Protocols", color: "bg-purple-50 border-purple-200",
    keys: ["Induction: Basiliximab (IL-2R antagonist) preferred", "Maintenance: TAC + MMF + prednisolone (triple therapy)", "Tacrolimus: target trough 10–15 ng/mL (1st 3mo) → 5–10 (maintenance)", "MMF: 600 mg/m²/dose BD. Reduce in diarrhea/cytopenias", "Steroid withdrawal: at 3–6 months in low-risk patients"] },
  { name: "BK Virus Nephropathy", color: "bg-amber-50 border-amber-200",
    keys: ["Monitor: plasma BK PCR monthly × 2 years", "BK viremia >10,000 copies → reduce immunosuppression", "Cidofovir: used in refractory (nephrotoxic — monitor)", "Leflunomide: alternative anti-BK + immunosuppressive", "Biopsy: SV40 staining for BK nephropathy confirmation"] },
  { name: "CMV Disease", color: "bg-red-50 border-red-200",
    keys: ["High risk: D+/R− (donor positive, recipient negative)", "Prophylaxis: Valganciclovir 450mg/m² × 3–6 months", "Treatment: IV Ganciclovir 5 mg/kg BD × 2–3 weeks", "Resistant CMV: Foscarnet or Maribavir (newer)"] },
  { name: "Rejection", color: "bg-rose-50 border-rose-200",
    keys: ["T-cell mediated (TCMR): pulse steroids 10 mg/kg × 3 days", "ABMR: PLEX + IVIG + Rituximab", "DSA monitoring: at transplant, 1, 3, 6, 12 months + annually", "Banff 2022 classification for biopsy grading"] },
  { name: "PTLD", color: "bg-slate-50 border-slate-200",
    keys: ["Post-transplant lymphoproliferative disorder — EBV-driven", "Reduce immunosuppression first-line", "Rituximab: for CD20+ PTLD", "CHOP: for aggressive diffuse large B-cell lymphoma"] },
];

export default function HubTransplantPanel() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-violet-700 to-purple-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Syringe className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Transplant Nephrology</h2>
            <p className="text-violet-100 text-sm">Immunosuppression · BK · CMV · Rejection · PTLD</p>
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
                      <ArrowRight className="w-3 h-3 text-violet-500 flex-shrink-0 mt-0.5" />
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