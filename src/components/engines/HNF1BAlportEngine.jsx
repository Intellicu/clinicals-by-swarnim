import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, Dna, Microscope, AlertCircle } from "lucide-react";

const HNF1B_FEATURES = [
  { id: "renal_cysts", label: "Renal cysts (bilateral, medullary predominant)" },
  { id: "hypomagnesemia", label: "Hypomagnesemia (<0.6 mmol/L)" },
  { id: "diabetes", label: "MODY diabetes / impaired fasting glucose" },
  { id: "genital_anomaly", label: "Uterine / genital anomalies (females)" },
  { id: "hyperuricemia", label: "Hyperuricemia / elevated uric acid" },
  { id: "elevated_lft", label: "Elevated liver enzymes (cholestasis)" },
  { id: "fam_hx_hnf1b", label: "Family history of cystic kidney + diabetes" },
];

const ALPORT_FEATURES = [
  { id: "hematuria_persistent", label: "Persistent microscopic hematuria (from infancy)" },
  { id: "family_hematuria", label: "Family history of hematuria or CKD" },
  { id: "hearing_loss", label: "Sensorineural hearing loss (bilateral)" },
  { id: "ocular", label: "Anterior lenticonus / macular fleck (ophthalmology)" },
  { id: "proteinuria_progression", label: "Proteinuria (progresses with age)" },
  { id: "male_early_ckd", label: "Male with early CKD (< 30 years)" },
];

function calcHNF1BProb(answers) {
  const count = Object.values(answers).filter(Boolean).length;
  if (count >= 3) return "High";
  if (count >= 2) return "Moderate";
  if (count >= 1) return "Low";
  return "Unlikely";
}

function calcAlportType(answers) {
  if (answers.male_early_ckd && answers.hearing_loss) return "X-linked Alport (XLAS) — most likely";
  if (answers.family_hematuria && answers.hearing_loss) return "AR or AD Alport — confirm with COL4A3/A4";
  if (answers.hematuria_persistent && !answers.hearing_loss && !answers.ocular) return "TBMD (Thin Basement Membrane Disease) — consider";
  return "Alport Syndrome — genetic testing required";
}

const PROB_COLORS = { High: "bg-orange-500 text-white", Moderate: "bg-amber-400 text-black", Low: "bg-slate-300 text-slate-800", Unlikely: "bg-slate-100 text-slate-500" };

export default function HNF1BAlportEngine() {
  const [engine, setEngine] = useState(null);
  const [step, setStep] = useState(0);
  const [hnfAnswers, setHNFAnswers] = useState({});
  const [alportAnswers, setAlportAnswers] = useState({});

  const toggleHNF = (id) => setHNFAnswers(a => ({ ...a, [id]: !a[id] }));
  const toggleAlport = (id) => setAlportAnswers(a => ({ ...a, [id]: !a[id] }));

  if (!engine) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Dna className="w-5 h-5" />
            <h3 className="text-sm font-bold">Rare Hereditary Nephropathy Engines</h3>
          </div>
          <p className="text-xs text-violet-100">Select engine to launch</p>
        </div>
        <div className="grid gap-2">
          {[
            { id: "hnf1b", title: "HNF1B Screening Engine", desc: "Most missed diagnosis — renal cysts + hypomagnesemia + diabetes", color: "border-green-300 bg-green-50" },
            { id: "alport", title: "Alport Syndrome Engine", desc: "COL4 mutations — hematuria + hearing loss + ocular findings", color: "border-blue-300 bg-blue-50" },
          ].map(e => (
            <button key={e.id} onClick={() => { setEngine(e.id); setStep(0); }}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${e.color}`}>
              <Dna className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-800">{e.title}</p>
                <p className="text-xs text-slate-600">{e.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (engine === "hnf1b") {
    const prob = calcHNF1BProb(hnfAnswers);
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-green-700 to-teal-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5" />
            <h3 className="text-sm font-bold">HNF1B Screening Engine</h3>
            <Badge className="bg-white/20 text-white text-xs">17q12 Deletion</Badge>
          </div>
          <p className="text-xs text-green-100">Select ALL features present in this patient:</p>
        </div>
        {HNF1B_FEATURES.map(q => (
          <button key={q.id} onClick={() => toggleHNF(q.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${hnfAnswers[q.id] ? "bg-green-50 border-green-300 text-green-800" : "bg-white border-slate-200 text-slate-700"}`}>
            {hnfAnswers[q.id] ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
            {q.label}
          </button>
        ))}
        <div className={`rounded-xl p-3 text-center ${PROB_COLORS[prob]}`}>
          <p className="font-bold">HNF1B Probability: {prob}</p>
        </div>
        {(prob === "High" || prob === "Moderate") && (
          <div className="space-y-2">
            {[
              { title: "Recommended Testing", color: "bg-blue-50 border-blue-200", items: ["MLPA for 17q12 deletion (most common, ~50% of cases)", "HNF1B gene sequencing (point mutations)", "Maternal and paternal testing (autosomal dominant — may be de novo)"] },
              { title: "Management", color: "bg-green-50 border-green-200", items: ["Oral magnesium supplementation (Mg lactate/citrate)", "OGTT annually from age 10 — MODY5 diabetes (insulin-requiring)", "eGFR + UPCR every 6 months", "Pelvic USS females: Müllerian anomalies", "Avoid NSAIDs / nephrotoxins"] },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
                <p className="text-xs font-bold text-slate-800 mb-2">{s.title}</p>
                {s.items.map((item, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-600" />{item}</div>)}
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" onClick={() => { setEngine(null); setHNFAnswers({}); }} className="w-full"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      </div>
    );
  }

  if (engine === "alport") {
    const alportType = calcAlportType(alportAnswers);
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <Microscope className="w-5 h-5" />
            <h3 className="text-sm font-bold">Alport Syndrome Engine</h3>
            <Badge className="bg-white/20 text-white text-xs">COL4A3/A4/A5</Badge>
          </div>
          <p className="text-xs text-blue-100">Select ALL features present:</p>
        </div>
        {ALPORT_FEATURES.map(q => (
          <button key={q.id} onClick={() => toggleAlport(q.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${alportAnswers[q.id] ? "bg-blue-50 border-blue-300 text-blue-800" : "bg-white border-slate-200 text-slate-700"}`}>
            {alportAnswers[q.id] ? <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
            {q.label}
          </button>
        ))}
        {Object.values(alportAnswers).some(Boolean) && (
          <div className="space-y-2">
            <div className="rounded-xl bg-blue-50 border-2 border-blue-300 p-3">
              <p className="text-sm font-bold text-blue-900">→ {alportType}</p>
            </div>
            {[
              { title: "Genetic Testing", color: "bg-violet-50 border-violet-200", items: ["X-linked (COL4A5): Sanger or panel; females may be symptomatic carriers", "AR Alport (COL4A3/A4): Both alleles mutated; parents are carriers", "AD Alport (COL4A3/A4): Single pathogenic variant; milder phenotype", "TBMD: Heterozygous COL4A3/A4 — GBM thinning only; usually benign"] },
              { title: "Monitoring & Treatment", color: "bg-green-50 border-green-200", items: ["ACEi (Ramipril) as early as age 5 if proteinuria — proven renoprotective in XLAS", "Audiometry annually — SNHL progresses; hearing aids when needed", "Annual ophthalmology — anterior lenticonus, macular fleck", "Avoid nephrotoxins: NSAIDs, aminoglycosides", "Transplant: Excellent outcomes; anti-GBM disease risk if COL4A5 null variant"] },
              { title: "Biopsy Findings (EM)", color: "bg-amber-50 border-amber-200", items: ["EM: GBM thinning + lamellation / splitting (basket-weave pattern)", "LM: Foam cells, non-specific changes; IF usually negative", "Skin biopsy (males): COL4A5 staining absent in X-linked Alport"] },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
                <p className="text-xs font-bold text-slate-800 mb-2">{s.title}</p>
                {s.items.map((item, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" />{item}</div>)}
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" onClick={() => { setEngine(null); setAlportAnswers({}); }} className="w-full"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      </div>
    );
  }

  return null;
}