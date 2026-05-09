import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, AlertTriangle, GitBranch, CheckCircle, ArrowRight } from "lucide-react";

const APPROACHES = [
  {
    id: "fever_rash",
    title: "Approach to Fever with Rash",
    color: "red",
    urgency: "critical",
    overview: "Systematic approach distinguishing infectious, vasculitic, and autoinflammatory causes of fever + rash in children.",
    algorithm: [
      "Assess rash morphology: petechial/purpuric vs maculopapular vs urticarial vs evanescent",
      "Petechial/purpuric: immediate CBC + platelets — is it non-thrombocytopenic? → IgAV/meningococcaemia",
      "Evanescent salmon rash + quotidian fever: sJIA — check ferritin, CBC",
      "Malar rash + photosensitivity: SLE — ANA, anti-dsDNA, C3/C4, urine PCR",
      "Polymorphous rash + conjunctivitis + fever ≥5 days: Kawasaki — echo urgently",
      "Urticarial rash + sensorineural deafness: CAPS — IL-1 inhibitor",
      "Post-infection exanthem (1–3 weeks): reactive arthritis, serum sickness",
    ],
    decision_nodes: [
      { q: "Purpuric rash + normal platelets?", yes: "IgA Vasculitis (HSP) — check urine, blood pressure", no: "If low platelets: ITP, HLH, sepsis-DIC" },
      { q: "Fever + rash + ferritin >500 (rising)?", yes: "MAS alarm — check CBC, LFT, fibrinogen, triglycerides daily", no: "If stable: sJIA, reactive, viral exanthem" },
    ],
    red_flags: ["Petechiae + haemodynamic instability → meningococcaemia ICU", "Erythroderma → toxic shock or severe DRESS", "Periorbital oedema + rash + weakness → JDM"],
  },
  {
    id: "recurrent_fever",
    title: "Approach to Recurrent Fever",
    color: "amber",
    urgency: "medium",
    overview: "Periodic fever syndrome differentiation — FMF, PFAPA, CAPS, TRAPS, HIDS, and secondary causes.",
    algorithm: [
      "Document attack frequency, duration, triggers, complete resolution between attacks",
      "PFAPA: q3–8 weeks, aphthae + pharyngitis + adenitis, responds to single steroid dose",
      "FMF: 12–72h, peritonitis/pleuritis, Mediterranean/Middle Eastern ethnicity — MEFV gene",
      "TRAPS: prolonged >7 days, migratory myalgia, periorbital oedema, dominant family history",
      "HIDS/MKD: q4–6 weeks, GI symptoms, high IgD, MVK gene",
      "CAPS: cold-triggered (FCAS) or chronic (MWS/NOMID), urticarial rash, hearing loss",
      "Cyclic neutropenia: q21 days, severe ANC nadir — CBC during fever mandatory",
    ],
    decision_nodes: [
      { q: "Complete resolution between attacks + normal markers?", yes: "Periodic fever syndrome — differentiate by duration/pattern", no: "Incomplete remission → consider IBD, malignancy, chronic infection" },
      { q: "Responds dramatically to single prednisolone dose?", yes: "PFAPA — consider tonsillectomy for refractory", no: "FMF/TRAPS/CAPS — genetic testing + IL-1 inhibitor" },
    ],
    red_flags: ["Ferritin >500 rising → MAS", "Amyloidosis (proteinuria) in FMF/TRAPS", "Neurological symptoms in CAPS (NOMID)"],
  },
  {
    id: "arthritis",
    title: "Approach to Arthritis in Children",
    color: "blue",
    urgency: "high",
    overview: "Systematic workup from septic arthritis exclusion to JIA classification.",
    algorithm: [
      "URGENT: Is this septic arthritis? — fever + red/hot joint → aspiration + ortho same day",
      "Duration: acute (<6 weeks) vs chronic (≥6 weeks, JIA range)",
      "Pattern: monoarthritis vs oligo vs polyarthritis vs axial",
      "Age/sex: toddler girl + knee = oligoarticular JIA; adolescent boy + back = ERA",
      "Blood: CBC, ESR, CRP, ANA, RF, anti-CCP, uric acid, viral serology",
      "Imaging: X-ray (erosions), ultrasound (effusion), MRI (synovitis/erosion)",
      "Reactive arthritis: post-infection (Strep, Salmonella, Chlamydia) — ASOT, cultures",
    ],
    decision_nodes: [
      { q: "Fever + single hot joint + raised CRP?", yes: "Emergency: exclude septic arthritis — aspiration + cultures before steroids", no: "JIA workup: ANA, RF, anti-CCP, HLA-B27" },
      { q: "HLA-B27 positive + back pain + enthesitis?", yes: "ERA/Juvenile SpA — NSAIDs, MRI SI joints, consider TNFi", no: "Oligoarticular/polyarticular JIA pathway" },
    ],
    red_flags: ["Septic arthritis (fever + single red joint)", "Leukaemia (night pain, bone pain, low WBC)", "Malignancy (LDH elevated, constitutional symptoms)"],
  },
  {
    id: "approach_vasculitis",
    title: "Approach to Vasculitis",
    color: "red",
    urgency: "critical",
    overview: "Size-based vessel approach — small, medium, large vessel vasculitis patterns in children.",
    algorithm: [
      "Classify by vessel size: small (IgAV, ANCA), medium (KD, PAN), large (Takayasu)",
      "Small vessel: palpable purpura, glomerulonephritis, alveolar haemorrhage",
      "Medium vessel: coronary aneurysm (KD), renal infarct (PAN), mononeuritis",
      "Large vessel: limb claudication, BP differential, bruit (Takayasu)",
      "ANCA urgent: anti-PR3, anti-MPO — renal biopsy if GN present",
      "IgAV: palpable purpura + urine monitoring × 6 weeks",
      "KD: echo at diagnosis — Z-score coronary arteries",
    ],
    decision_nodes: [
      { q: "ANCA positive + glomerulonephritis?", yes: "Urgent renal biopsy + ANCA vasculitis protocol (rituximab/CYC)", no: "Consider IgAV, KD, or non-ANCA vasculitis pathway" },
      { q: "Pulseless limb + young female + BP differential?", yes: "Takayasu arteritis — MRI angiography + ESR/CRP + steroids", no: "Medium/small vessel protocol" },
    ],
    red_flags: ["Pulmonary haemorrhage + haematuria (ANCA/anti-GBM — emergency)", "Coronary aneurysm in KD", "Mesenteric ischaemia"],
  },
  {
    id: "approach_mas",
    title: "Approach to MAS / HLH",
    color: "red",
    urgency: "critical",
    overview: "Early recognition and escalation protocol for macrophage activation syndrome.",
    algorithm: [
      "SUSPECT: sJIA/SLE/infection + unremitting fever + rising ferritin",
      "ALARM: falling platelets + falling ESR + rising ferritin → ACTIVATE protocol",
      "Labs: daily ferritin, CBC, LFT, fibrinogen, triglycerides, d-dimer, coagulation",
      "Ferritin >684 + ≥2 of criteria → MAS-sJIA 2016 criteria met",
      "Bone marrow aspirate if primary HLH suspected (infant, no rheumatic trigger)",
      "IV methylprednisolone 30 mg/kg × 3 immediately",
      "IV anakinra escalating (2→4→8 mg/kg) + IV cyclosporin 3–5 mg/kg",
      "Haematology consult: HLH-2004 if non-responding",
    ],
    decision_nodes: [
      { q: "Ferritin >10,000 or multiorgan failure?", yes: "ICU — IV anakinra + cyclosporin + methylprednisolone + haematology", no: "High-dose IV steroids + cyclosporin; monitor daily ferritin" },
      { q: "Infant + no rheumatic trigger + strong family history?", yes: "Primary HLH — HLH gene panel (PRF1, UNC13D, STX11) + HSCT planning", no: "Secondary reactive MAS — treat trigger + immunosuppression" },
    ],
    red_flags: ["Ferritin >10,000 → ICU mandatory", "DIC → haematology emergency", "CNS HLH (seizures, encephalopathy)"],
  },
  {
    id: "proteinuria_overlap",
    title: "Proteinuria + Rheumatology Overlap",
    color: "purple",
    urgency: "high",
    overview: "Approach to renal involvement in rheumatic diseases — lupus nephritis, IgAV nephritis, ANCA GN, amyloidosis.",
    algorithm: [
      "Urine PCR >0.5 in any rheumatic disease patient → nephrology co-management",
      "SLE + haematuria/proteinuria: renal biopsy mandatory (ISN/RPS class drives treatment)",
      "IgAV + PCR >0.5: biopsy if nephrotic/nephritic; ACEi for moderate",
      "ANCA + rapidly rising creatinine: urgent biopsy + ANCA vasculitis protocol",
      "FMF/TRAPS + nephrotic syndrome: Congo red biopsy — amyloidosis (AA)",
      "CNI use (cyclosporin/tacrolimus): monitor creatinine + trough levels",
      "Target: PCR <0.5 on maintenance therapy (SLE/IgAV nephritis)",
    ],
    decision_nodes: [
      { q: "PCR >1.0 in SLE patient?", yes: "Renal biopsy mandatory — class III/IV requires MMF/CYC induction", no: "PCR 0.5–1.0: ACEi + HCQ + close monitoring, consider biopsy" },
      { q: "Nephrotic syndrome in periodic fever patient?", yes: "Biopsy with Congo red — renal amyloidosis → aggressive attack suppression + ACEi", no: "Standard monitoring for respective rheumatic disease" },
    ],
    red_flags: ["Rapidly rising creatinine + haematuria + ANCA (RPGN)", "Nephrotic syndrome in FMF (amyloidosis)", "Urine red cell casts (active glomerulonephritis)"],
  },
  {
    id: "biologic_failure",
    title: "Approach to Biologic Failure",
    color: "slate",
    urgency: "medium",
    overview: "Algorithm for managing insufficient response or intolerance to biologic therapy in pediatric rheumatic disease.",
    algorithm: [
      "Define failure: inadequate response vs intolerance vs loss of response (secondary failure)",
      "Inadequate: check adherence, dose, anti-drug antibodies (ADA)",
      "Immunogenicity: ADA+ → switch within class or add immunomodulator (MTX)",
      "Primary failure (never responded): switch mechanism of action",
      "TNFi failure in JIA: abatacept, tocilizumab, secukinumab (ERA), tofacitinib",
      "IL-1i failure in sJIA: switch to tocilizumab (IL-6i) or abatacept",
      "Consider JAK inhibitor for RF+ poly JIA or refractory uveitis",
      "Before switching: exclude infection, nonadherence, wrong diagnosis",
    ],
    decision_nodes: [
      { q: "Anti-drug antibodies (ADA) positive?", yes: "If ADA+: switch to another biologic in same or different class + consider MTX combination", no: "True primary failure — switch mechanism (e.g., TNFi→abatacept)" },
      { q: "Multiple biologic failures (≥2 mechanisms)?", yes: "JAK inhibitor or clinical trial; multidisciplinary review; check diagnosis accuracy", no: "Switch to next appropriate agent per disease type" },
    ],
    red_flags: ["Opportunistic infection on biologic — hold all immunosuppression", "Tuberculosis reactivation", "Drug-induced lupus (anti-dsDNA positive on TNFi)"],
  },
];

const COLOR_CLASSES = {
  red: "border-red-200 bg-red-50",
  amber: "border-amber-200 bg-amber-50",
  blue: "border-blue-200 bg-blue-50",
  purple: "border-purple-200 bg-purple-50",
  slate: "border-slate-200 bg-slate-50",
};
const HEADER_COLORS = {
  red: "bg-red-600", amber: "bg-amber-500", blue: "bg-blue-600", purple: "bg-purple-600", slate: "bg-slate-600",
};

function ApproachCard({ approach }) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState("algorithm");

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${COLOR_CLASSES[approach.color] || "border-slate-200 bg-slate-50"}`}>
      <button className="w-full text-left p-3" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-6 rounded-full ${HEADER_COLORS[approach.color]}`} />
            <div>
              <p className="font-bold text-sm text-slate-900">{approach.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{approach.overview}</p>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/50 px-3 pb-3 bg-white">
          <div className="flex gap-1 pt-2 pb-1">
            {["algorithm", "decisions", "red_flags"].map(t => (
              <button key={t}
                onClick={() => setTab(t)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  tab === t ? `${HEADER_COLORS[approach.color]} text-white` : "bg-slate-100 text-slate-600"
                }`}>
                {t === "algorithm" ? "🔀 Algorithm" : t === "decisions" ? "❓ Decisions" : "🔴 Red Flags"}
              </button>
            ))}
          </div>

          {tab === "algorithm" && (
            <div className="space-y-1.5 mt-1">
              {approach.algorithm.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className={`w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${HEADER_COLORS[approach.color]}`}>{i + 1}</span>
                  <span className="text-slate-700">{step}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "decisions" && (
            <div className="space-y-2 mt-1">
              {approach.decision_nodes.map((dn, i) => (
                <div key={i} className="border-2 border-dashed border-amber-400 rounded-lg p-3 bg-amber-50">
                  <p className="text-xs font-bold text-amber-900 text-center mb-2">❓ {dn.q}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-100 border border-green-300 rounded p-2 text-xs text-center">
                      <span className="font-bold text-green-700">YES →</span><br />{dn.yes}
                    </div>
                    <div className="bg-red-100 border border-red-300 rounded p-2 text-xs text-center">
                      <span className="font-bold text-red-700">NO →</span><br />{dn.no}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "red_flags" && (
            <div className="space-y-1.5 mt-1">
              {approach.red_flags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2 text-xs bg-red-50 border border-red-200 rounded-lg p-2">
                  <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-red-800 font-medium">{flag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RheumApproaches() {
  return (
    <div className="space-y-3">
      <Alert className="bg-indigo-50 border-indigo-200">
        <GitBranch className="w-4 h-4 text-indigo-600" />
        <AlertDescription className="text-xs text-indigo-900">
          <strong>Diagnostic Algorithms</strong> — Evidence-based clinical approaches for common rheumatological presentations. ACR/EULAR/PRINTO-aligned.
        </AlertDescription>
      </Alert>
      {APPROACHES.map(a => <ApproachCard key={a.id} approach={a} />)}
    </div>
  );
}