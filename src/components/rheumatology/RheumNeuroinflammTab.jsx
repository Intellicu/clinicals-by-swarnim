import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Brain, AlertTriangle, ChevronDown, ChevronUp, Zap } from "lucide-react";

const NEUROINFLAM_CONDITIONS = [
  {
    id: "ai_encephalitis",
    name: "Autoimmune Encephalitis",
    urgency: "critical",
    tags: ["Anti-NMDAR", "Anti-LGI1", "CASPR2", "IVIG", "Rituximab", "ICU"],
    overview: "Antibody-mediated brain inflammation. Anti-NMDAR most common in children. Psychiatric prodrome → seizures → movement disorder → autonomic instability → coma.",
    classification: "Anti-NMDAR (most common in children), Anti-LGI1, Anti-CASPR2, Anti-AMPA, Anti-GABA-B, MOGAD overlap",
    key_points: [
      "Antibody panel: CSF preferred over serum — higher sensitivity for NMDAR-ab",
      "MRI often normal in NMDAR encephalitis — EEG: delta brush pattern pathognomonic",
      "First-line: IVIG 2 g/kg + methylprednisolone IV 30 mg/kg/day × 3–5",
      "Second-line: rituximab 375 mg/m² × 4 if inadequate response at 2–4 weeks",
      "Ovarian teratoma in adolescent females: must exclude — remove teratoma",
      "Mycophenolate or AZA: long-term maintenance after rituximab",
      "Recovery can take months to years — maintain treatment",
    ],
    monitoring: ["EEG (continuous in ICU)", "MRI brain monthly", "Antibody titres (CSF q3–6 months)", "Neuropsychological assessment", "CBC + LFT on immunosuppression"],
    emergency_flags: ["Status epilepticus", "Autonomic instability", "Respiratory failure (ICU)", "Psychosis + acute movement disorder in young female → OVT screen"],
    icuChips: ["🚨 Status epilepticus → ASM escalation → ICU", "🧠 Altered sensorium → CSF, MRI, EEG", "💫 Oculogyric crisis → anti-NMDAR first", "🫁 Respiratory failure → ICU + intubation"],
    gnLink: null,
    drugs: ["IVIG", "IV Methylprednisolone", "Rituximab", "MMF (maintenance)", "Azathioprine"],
    refs: [{ title: "Graus AE Consensus 2016", url: "https://pubmed.ncbi.nlm.nih.gov/27061479/" }],
    evidence_grade: "Moderate",
    last_updated: "2024-06",
  },
  {
    id: "neuro_lupus",
    name: "Neuropsychiatric SLE (NPSLE)",
    urgency: "critical",
    tags: ["Seizures", "Psychosis", "Stroke", "Demyelination", "APS overlap"],
    overview: "SLE CNS involvement — 40–50% pediatric SLE. Spectrum: seizures, psychosis, chorea, cerebritis, TIA/stroke (APS), peripheral neuropathy, myelitis.",
    key_points: [
      "Attribution: is it NPSLE vs CNS infection vs medication toxicity?",
      "APS overlap: antiphospholipid antibodies in 40% pSLE — anticoagulate stroke",
      "Seizures: AED + immunosuppression escalation",
      "Psychosis: high-dose steroids (may worsen → diagnostic dilemma with steroid psychosis)",
      "Cerebritis/myelitis: IV methylprednisolone pulses + CYC induction",
      "Rituximab: refractory NPSLE",
      "MRI with gadolinium + DWI mandatory",
    ],
    monitoring: ["SLEDAI (always document NPSLE component)", "MRI brain q3–6 months (acute), annually (stable)", "APS panel: aCL, aβ2GPI, LA", "CSF if active CNS disease"],
    emergency_flags: ["Acute psychosis (exclude steroid-induced)", "Status epilepticus", "Acute stroke (APS — anticoagulate)", "Optic neuritis (vision loss)"],
    icuChips: ["🚨 Seizures → AED + IV steroids", "🧠 Acute psychosis → R/O steroid vs lupus", "🩸 Stroke in SLE → APS screen → anticoagulate", "👁 Optic neuritis → IV methylprednisolone pulse"],
    gnLink: "lupus-nephritis",
    drugs: ["IV Methylprednisolone", "Cyclophosphamide", "Rituximab", "HCQ (neuroprotective)", "Anticoagulation (APS-stroke)", "AEDs"],
    refs: [{ title: "EULAR NPSLE Recommendations 2023", url: "https://www.eular.org/" }],
    evidence_grade: "Moderate",
    last_updated: "2024-04",
  },
  {
    id: "demyelinating_overlap",
    name: "Demyelinating Overlap (MOGAD / NMOSD)",
    urgency: "high",
    tags: ["MOGAD", "NMOSD", "Anti-MOG", "Anti-AQP4", "Optic Neuritis", "ADEM"],
    overview: "MOG-antibody disease (MOGAD) and neuromyelitis optica spectrum disorder (NMOSD) overlap with pediatric rheumatology. MOGAD: ADEM-like, optic neuritis, cortical encephalitis — favorable prognosis. NMOSD: AQP4-ab, severe myelitis.",
    key_points: [
      "Test both anti-MOG and anti-AQP4 in any demyelinating-like CNS presentation",
      "MOGAD: often monophasic in children; high-dose steroids first-line",
      "NMOSD (AQP4-ab): chronic relapsing — rituximab or satralizumab maintenance",
      "SLE overlap: NMOSD can coexist with SLE — test AQP4 in pSLE with myelitis",
      "Relapsing MOGAD: maintenance with MMF or rituximab",
    ],
    monitoring: ["MRI brain + spine (each episode)", "MOG-ab and AQP4-ab titres", "Visual acuity (optic neuritis)", "EDSS disability scoring"],
    emergency_flags: ["Severe optic neuritis → vision loss", "Longitudinally extensive myelitis → paraplegia", "Area postrema syndrome (intractable vomiting) → NMOSD"],
    icuChips: ["👁 Severe optic neuritis → IV MP urgently", "🦵 Acute myelitis → IV MP + PLEX if no response", "🤢 Intractable vomiting + hiccups → area postrema NMOSD"],
    gnLink: null,
    drugs: ["IV Methylprednisolone (acute)", "PLEX (NMOSD relapse)", "Rituximab (NMOSD maintenance)", "Satralizumab (NMOSD AQP4+)", "MMF (MOGAD relapsing)"],
    refs: [{ title: "ECTRIMS MOGAD Guidelines 2023", url: "https://www.ectrims.eu/" }],
    evidence_grade: "Moderate",
    last_updated: "2024-05",
  },
];

const ICU_ESCALATION = [
  { label: "🚨 Status Epilepticus", action: "AED protocol → IV lorazepam → levetiracetam → ICU + anaesthesia" },
  { label: "🧠 Altered Sensorium", action: "Urgent MRI, EEG, CSF (exclude infection first), IV steroids" },
  { label: "🔬 MRI Red Flags", action: "Ring-enhancing lesion → infection/tumor. Vessel wall enhancement → vasculitis. DWI restriction → stroke/encephalitis" },
  { label: "🌡️ Cytokine Storm", action: "Rising ferritin + cytopenias → MAS protocol: IV CsA + IV anakinra escalation" },
];

function NeuroConditionCard({ cond }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="bg-white border-2 border-purple-200">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-sm text-slate-900">{cond.name}</span>
              <Badge className={`text-xs ${cond.urgency === "critical" ? "bg-red-100 text-red-800 border-red-300" : "bg-amber-100 text-amber-800"} border`}>
                {cond.urgency === "critical" ? "🔴 Critical" : "🟠 High"}
              </Badge>
            </div>
            <div className="flex gap-1 flex-wrap">
              {cond.tags?.slice(0, 5).map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
            </div>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-slate-700 bg-slate-50 rounded p-2 border">{cond.overview}</p>

          {cond.icuChips && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-xs font-bold text-red-700 mb-1.5">🚨 ICU Escalation Chips</p>
              <div className="flex flex-wrap gap-1.5">
                {cond.icuChips.map((chip, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-red-100 border border-red-300 rounded-lg text-red-800 font-medium">{chip}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-slate-700 mb-1.5">Key Management Points</p>
            {cond.key_points?.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-xs p-2 bg-slate-50 rounded border mb-1">
                <span className="font-bold text-purple-600">{i + 1}.</span>{p}
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <p className="text-xs font-bold text-amber-800 mb-1">⚠️ Emergency Flags</p>
            {cond.emergency_flags?.map((f, i) => <p key={i} className="text-xs text-amber-900">• {f}</p>)}
          </div>

          {cond.gnLink && (
            <Link to={createPageUrl("ClinicalSupport")}>
              <Button size="sm" variant="outline" className="text-xs border-purple-200 text-purple-700 w-full">
                🔗 Open Nephrology Overlap: {cond.gnLink}
              </Button>
            </Link>
          )}

          <div className="text-xs text-slate-400">Evidence: {cond.evidence_grade} · Updated: {cond.last_updated}</div>
        </CardContent>
      )}
    </Card>
  );
}

export default function RheumNeuroinflammTab() {
  return (
    <div className="space-y-3">
      <Alert className="bg-purple-50 border-purple-200">
        <Brain className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-xs text-purple-900">
          <strong>Neuroinflammatory:</strong> Autoimmune encephalitis, NPSLE, MOGAD/NMOSD — ICU escalation chips, MRI red flags, cytokine storm protocol.
        </AlertDescription>
      </Alert>

      {/* ICU escalation panel */}
      <Card className="bg-red-50 border-2 border-red-200">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-600" />
            <span className="font-bold text-sm text-red-900">ICU Escalation Triggers</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {ICU_ESCALATION.map((item, i) => (
            <div key={i} className="text-xs p-2 bg-white border border-red-200 rounded-lg">
              <p className="font-bold text-red-800">{item.label}</p>
              <p className="text-slate-700 mt-0.5">{item.action}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {NEUROINFLAM_CONDITIONS.map(c => <NeuroConditionCard key={c.id} cond={c} />)}
    </div>
  );
}