import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";

const UVEITIS_CONDITIONS = [
  {
    id: "jia_uveitis",
    name: "JIA-Associated Uveitis",
    urgency: "high",
    guideline: "SUN Criteria 2005 + ACR JIA 2022 + German Uveitis Guidelines",
    tags: ["ANA+", "Silent", "Adalimumab", "Slit-lamp", "Band Keratopathy"],
    overview: "Most common uveitis in children. Chronic anterior, non-granulomatous. Silent — no red eye. ANA+ oligoarticular JIA highest risk. Accounts for 5–10% childhood blindness if undetected.",
    screening: {
      highRisk: "ANA+ AND onset <7y AND disease duration <4y → q3 months slit-lamp",
      moderateRisk: "ANA+ without high-risk → q6 months",
      lowRisk: "ANA− → q12 months",
    },
    key_points: [
      "SILENT anterior uveitis — child will not complain of red eye or pain (unlike acute uveitis in ERA)",
      "Slit-lamp screening MANDATORY — cannot be detected by visual inspection",
      "First-line: topical steroids + cycloplegics (atropine/cyclopentolate)",
      "Systemic steroid-sparing: MTX 10–15 mg/m²/week first-line",
      "Biologic: adalimumab FIRST-LINE over etanercept for JIA-uveitis (ADJUST trial)",
      "Abatacept: second-line after adalimumab failure",
      "Band keratopathy: calcium chelation with EDTA drops",
      "Complications: cataract, glaucoma, macular oedema, band keratopathy",
    ],
    monitoring: ["Slit-lamp as per risk category", "IOP monitoring (glaucoma)", "OCT (macular oedema)", "VA assessment each visit"],
    emergency_flags: ["Sudden vision loss", "Severe band keratopathy (calcium chelation)", "Cataract/glaucoma complications — ophthalmology surgery"],
    drugs: ["Topical steroids (prednisolone acetate drops)", "Cycloplegics", "Methotrexate", "Adalimumab (preferred biologic)", "Abatacept"],
    evidence_grade: "Strong",
    last_updated: "2024-04",
  },
  {
    id: "jia_era_uveitis",
    name: "ERA/SpA Acute Anterior Uveitis",
    urgency: "high",
    guideline: "ACR JIA 2022",
    tags: ["HLA-B27", "Painful", "Red Eye", "Acute", "Unilateral"],
    overview: "Acute anterior uveitis in ERA/SpA — SYMPTOMATIC (pain, red eye, photophobia) — opposite to JIA oligoarticular. HLA-B27 positive in >80%. Self-limiting attacks but recurrent.",
    key_points: [
      "SYMPTOMATIC — painful red eye: different from oligoarticular JIA silent uveitis",
      "Unilateral, acute, self-limiting episodes (weeks)",
      "Topical steroids (prednisolone drops) + cycloplegics first-line",
      "Adalimumab: reduces frequency of acute episodes in HLA-B27+ uveitis",
      "Treat underlying SpA with TNFi — reduces uveitis frequency",
      "NSAIDs: prophylactic benefit for recurrent acute AAU",
    ],
    monitoring: ["Slit-lamp when symptomatic", "Monitor for recurrent attacks", "IOP check"],
    emergency_flags: ["Hypopyon (severe anterior chamber cells/pus)", "Posterior synechiae (pupillary block)", "Raised IOP (angle closure)"],
    drugs: ["Topical steroids + cycloplegics", "Adalimumab (frequency reduction)", "NSAIDs (prophylaxis)"],
    evidence_grade: "Strong",
    last_updated: "2024-02",
  },
  {
    id: "intermediate_uveitis",
    name: "Intermediate / Posterior Uveitis",
    urgency: "medium",
    guideline: "SUN Classification 2005",
    tags: ["Pars Planitis", "Vitreous", "CMO", "Sarcoidosis", "MS overlap"],
    overview: "Involves vitreous, pars plana, or posterior pole. May present with 'floaters', blurred vision. More systemic associations (sarcoidosis, MS, Behçet). Macular oedema (CMO) main cause of visual loss.",
    key_points: [
      "Pars planitis: peripheral vitreous exudates ('snowbanks') — often idiopathic",
      "Investigations: ACE, HRCT (sarcoidosis), MRI brain (MS), ANA, ANCA, HLA-B51",
      "Periocular/sub-Tenon steroid injections for CMO",
      "Systemic: oral prednisolone or immunosuppressives (MTX/MMF) for bilateral/refractory",
      "Vitrectomy: for persistent vitreous opacity unresponsive to medical therapy",
    ],
    monitoring: ["OCT (CMO monitoring)", "FFA (fluorescein angiography — vasculitis)", "VA every visit", "Systemic review for underlying cause"],
    emergency_flags: ["Sudden vision loss (RD, vascular occlusion)", "Hypopyon (infectious endophthalmitis — exclude)", "CMO causing rapid VA decline"],
    drugs: ["Periocular triamcinolone", "Oral prednisolone", "MTX", "MMF", "Adalimumab (refractory)"],
    evidence_grade: "Moderate",
    last_updated: "2024-01",
  },
];

function UveitisCard({ cond }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="bg-white border-2 border-teal-200">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-bold text-sm text-slate-900">{cond.name}</span>
              <Badge className={`text-xs border ${cond.urgency === "high" ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-blue-100 text-blue-800 border-blue-300"}`}>
                {cond.urgency === "high" ? "🟠 High" : "🔵 Standard"}
              </Badge>
            </div>
            <div className="flex gap-1 flex-wrap">
              {cond.tags?.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
            </div>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs bg-slate-50 p-2 rounded border text-slate-700">{cond.overview}</p>
          {cond.screening && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 space-y-1">
              <p className="text-xs font-bold text-blue-800">🔍 Screening Protocol</p>
              <p className="text-xs text-blue-900"><strong>High risk:</strong> {cond.screening.highRisk}</p>
              <p className="text-xs text-blue-900"><strong>Moderate:</strong> {cond.screening.moderateRisk}</p>
              <p className="text-xs text-blue-900"><strong>Low:</strong> {cond.screening.lowRisk}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-1.5">Key Points</p>
            {cond.key_points?.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-xs p-1.5 bg-slate-50 rounded border mb-1">
                <span className="font-bold text-teal-600 flex-shrink-0">{i + 1}.</span>{p}
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <p className="text-xs font-bold text-amber-800 mb-1">⚠️ Emergency Flags</p>
            {cond.emergency_flags?.map((f, i) => <p key={i} className="text-xs text-amber-900">• {f}</p>)}
          </div>
          <div className="text-xs text-slate-400">📚 {cond.guideline} · Evidence: {cond.evidence_grade}</div>
        </CardContent>
      )}
    </Card>
  );
}

export default function RheumUveitisTab() {
  return (
    <div className="space-y-3">
      <Alert className="bg-teal-50 border-teal-200">
        <Eye className="w-4 h-4 text-teal-600" />
        <AlertDescription className="text-xs text-teal-900">
          <strong>Uveitis:</strong> JIA-associated (silent), ERA acute anterior, intermediate/posterior — screening protocols, adalimumab for JIA-uveitis, band keratopathy, macular oedema.
        </AlertDescription>
      </Alert>
      {UVEITIS_CONDITIONS.map(c => <UveitisCard key={c.id} cond={c} />)}
    </div>
  );
}