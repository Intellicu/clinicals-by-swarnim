import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, Activity, AlertTriangle } from "lucide-react";

const CTD_CONDITIONS = [
  {
    id: "jss",
    name: "Juvenile Systemic Sclerosis (jSSc)",
    urgency: "high",
    icd: "M34.9",
    guideline: "EULAR SSc Recommendations 2017 + LeRoy/Medsger jSSc Criteria",
    tags: ["Raynaud's", "Calcinosis", "ILD", "PAH", "Anti-Scl70", "Anti-centromere"],
    overview: "Rare in children. Fibrosing skin disease + vasculopathy. Raynaud's often first sign (years before diagnosis). Limited vs diffuse cutaneous subtypes. ILD and PAH = main mortality.",
    key_points: [
      "Nailfold capillaroscopy mandatory — scleroderma pattern (giant loops, avascular areas)",
      "Auto-antibody: anti-Scl70 (diffuse SSc, ILD risk), anti-centromere (limited SSc, PAH risk)",
      "Raynaud's: amlodipine first-line; IV iloprost for critical ischaemia",
      "ILD: mycophenolate MMF or nintedanib; tocilizumab emerging",
      "PAH: bosentan (endothelin antagonist) + sildenafil; referral to PAH centre",
      "GI: omeprazole for reflux; prokinetics for dysmotility",
      "Scleroderma renal crisis: ACEi IMMEDIATELY (captopril/enalapril) — can be life-saving",
    ],
    monitoring: ["PFTs q6 months", "Echo annually (PAH screen)", "HRCT chest annually", "Renal function + urine (scleroderma crisis)", "BP monitoring", "Capillaroscopy q6–12 months"],
    emergency_flags: ["Scleroderma renal crisis: rapid hypertension + AKI — ACEi urgently", "Pulmonary hypertensive crisis", "Digital gangrene"],
    drugs: ["Amlodipine (Raynaud's)", "MMF (ILD/skin)", "Methotrexate (early diffuse skin)", "Bosentan/Sildenafil (PAH)", "Iloprost IV (critical ischaemia)", "ACEi (renal crisis)"],
    evidence_grade: "Moderate",
    last_updated: "2024-04",
  },
  {
    id: "mctd",
    name: "Mixed CTD (MCTD)",
    urgency: "medium",
    icd: "M35.1",
    guideline: "Alarcon-Segovia MCTD Criteria + EULAR CTD",
    tags: ["Anti-U1RNP", "Overlap", "Puffy Hands", "Raynaud's", "HCQ"],
    overview: "Overlap syndrome with features of SLE, SSc, myositis, RA. Anti-U1RNP essential. Often treated as per predominant organ involvement. HCQ universally recommended.",
    key_points: [
      "Anti-U1RNP: high titre required (entry criterion)",
      "Treat as predominant feature: if lupus-like → HCQ + prednisolone; myositis → MTX/steroids",
      "PAH in MCTD: significant risk — annual echo screening",
      "HCQ: universal recommendation in MCTD",
      "Monitor for evolution into pure SLE, SSc, or DM over years",
    ],
    monitoring: ["Echo annually (PAH)", "PFTs q1–2 years", "SLEDAI (if SLE features dominant)", "CK, aldolase (myositis surveillance)"],
    emergency_flags: ["PAH crisis", "Myositis flare + respiratory weakness", "Severe SLE nephritis if develops"],
    drugs: ["Hydroxychloroquine", "Prednisolone", "MTX", "MMF", "Sildenafil (PAH)"],
    evidence_grade: "Low-Moderate",
    last_updated: "2024-02",
  },
  {
    id: "sjogrens",
    name: "Juvenile Primary Sjögren Syndrome",
    urgency: "medium",
    icd: "M35.00",
    guideline: "ACR/EULAR Sjögren Criteria 2016",
    tags: ["Anti-SSA", "Anti-SSB", "Dry Eyes", "Parotitis", "Lymphoma Risk"],
    overview: "Rare in children. Exocrine gland inflammation. Parotid swelling more prominent than dry eyes/mouth in children. Anti-SSA/Ro essential. Long-term: lymphoma risk (adults).",
    key_points: [
      "Anti-SSA/Ro: >3.5 U — required for ACR/EULAR classification",
      "Neonatal lupus: maternal anti-SSA/Ro → neonatal CHB — screen maternal antibodies",
      "Hydroxychloroquine: first-line systemic therapy",
      "Sicca symptoms: artificial tears, pilocarpine",
      "Systemic: overlap management with SLE/MCTD features as needed",
      "Lymphoma surveillance in adults — educate regarding signs",
    ],
    monitoring: ["Annual anti-SSA/anti-SSB titres", "CBC (lymphoma surveillance)", "Eye review (keratoconjunctivitis sicca)", "Renal tubular function (pRTA in some patients)"],
    emergency_flags: ["Peripheral neuropathy (vasculitic)", "Lymphoma (in long-standing — educate)", "Cryoglobulinaemia (purpura + renal)"],
    drugs: ["Hydroxychloroquine", "Pilocarpine", "Artificial tears", "Prednisolone (systemic features)", "Rituximab (refractory systemic)"],
    evidence_grade: "Low",
    last_updated: "2024-01",
  },
];

function CTDCard({ cond }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="bg-white border-2 border-teal-200">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-sm text-slate-900">{cond.name}</span>
              <Badge className={`text-xs border ${cond.urgency === "high" ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-blue-100 text-blue-800 border-blue-300"}`}>
                {cond.urgency === "high" ? "🟠 High" : "🔵 Standard"}
              </Badge>
            </div>
            <div className="flex gap-1 flex-wrap">
              {cond.tags?.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">📚 {cond.guideline}</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs bg-slate-50 p-2 rounded border text-slate-700">{cond.overview}</p>
          <div>
            <p className="text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Key Points</p>
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
          <div>
            <p className="text-xs font-bold text-slate-600 mb-1.5">📈 Monitoring</p>
            {cond.monitoring?.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-xs p-1.5 bg-teal-50 border border-teal-100 rounded mb-1">
                <Activity className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />{m}
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400">Evidence: {cond.evidence_grade} · {cond.last_updated}</div>
        </CardContent>
      )}
    </Card>
  );
}

export default function RheumCTDTab() {
  return (
    <div className="space-y-3">
      <Alert className="bg-teal-50 border-teal-200">
        <Activity className="w-4 h-4 text-teal-600" />
        <AlertDescription className="text-xs text-teal-900">
          <strong>CTD / Scleroderma:</strong> Juvenile SSc, MCTD, Sjögren's — capillaroscopy, PAH screening, ILD management, scleroderma renal crisis.
        </AlertDescription>
      </Alert>
      {CTD_CONDITIONS.map(c => <CTDCard key={c.id} cond={c} />)}
    </div>
  );
}