import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, Brain, Dna, Activity, AlertCircle } from "lucide-react";

const EXTRARENAL = [
  { id: "liver_cysts", label: "Liver cysts / hepatic fibrosis / Caroli disease" },
  { id: "retinal", label: "Retinal dystrophy / visual impairment" },
  { id: "dev_delay", label: "Developmental delay / intellectual disability" },
  { id: "polydactyly", label: "Polydactyly (extra digits)" },
  { id: "obesity", label: "Obesity / metabolic syndrome" },
  { id: "skeletal", label: "Skeletal dysplasia / short stature" },
  { id: "pancreatic_cysts", label: "Pancreatic cysts" },
  { id: "genital_anomaly", label: "Genital / uterine anomalies" },
  { id: "hypomagnesemia", label: "Hypomagnesemia / diabetes" },
];

const DIAGNOSES = {
  ARPKD: {
    label: "ARPKD (Autosomal Recessive PKD)",
    gene: "PKHD1 (6p21)",
    color: "bg-red-50 border-red-300",
    features: "Bilateral enlarged echogenic kidneys; enlarged in utero; hepatic fibrosis (Caroli); portal hypertension; neonatal presentation",
    monitoring: ["eGFR + UPCR every 3 months", "Hepatic fibrosis: Annual liver USS + portal Doppler", "Portal HTN: Gastroscopy for varices", "BP control: ACEi/ARB", "Growth monitoring"],
    genetics: "PKHD1 — autosomal recessive; parents are carriers; 25% recurrence risk",
  },
  ADPKD: {
    label: "ADPKD (Autosomal Dominant PKD)",
    gene: "PKD1 (85%), PKD2 (15%)",
    color: "bg-blue-50 border-blue-300",
    features: "Family history (usually parent affected); progressive cysts; liver cysts; intracranial aneurysms; mitral valve prolapse",
    monitoring: ["eGFR annually", "Annual BP monitoring (early HTN)", "MRI kidney volume (TKV) every 3 years — Tolvaptan indication", "Screen for intracranial aneurysm: MRA at 20 yrs if family history", "Urine: UPCR annually"],
    genetics: "PKD1/PKD2 — autosomal dominant; 50% risk to children; de novo in 5–10%",
  },
  NPHP: {
    label: "Nephronophthisis (NPHP)",
    gene: "NPHP1 deletion (45%), NPHP3/4/5/6/...",
    color: "bg-amber-50 border-amber-300",
    features: "Polyuria, polydipsia, growth failure; small corticomedullary cysts; progressive tubulointerstitial nephritis; no HTN until late; extra-renal (retina in Senior-Løken, liver in Joubert)",
    monitoring: ["eGFR every 3–6 months (progresses to ESKD median 13y)", "Retinal exam annually", "MRI brain if Joubert syndrome (molar tooth sign)", "Height/weight/nutrition"], 
    genetics: "NPHP1 deletion: MLPA first; then ciliopathy panel (NPHP1–20+)",
  },
  BBS: {
    label: "Bardet-Biedl Syndrome (BBS)",
    gene: "BBS1, BBS10, BBS12 most common",
    color: "bg-purple-50 border-purple-300",
    features: "Rod-cone dystrophy (night blindness by 8y), postaxial polydactyly, obesity, intellectual disability, hypogonadism, renal anomalies (dysplastic, VUR)",
    monitoring: ["Annual ophthalmic review", "Metabolic: BMI, OGTT, lipids", "Setmelanotide (MC4R agonist) for obesity — approved", "Renal: eGFR + USG, VCUG if UTI"],
    genetics: "BBS gene panel (20+ genes); autosomal recessive",
  },
  HNF1B: {
    label: "HNF1B-associated Renal Disease",
    gene: "HNF1B (17q12) — deletion or point mutation",
    color: "bg-green-50 border-green-300",
    features: "Renal cysts (small, bilateral medullary); MODY5 diabetes; hypomagnesemia; uterine/genital anomalies; hyperuricemia; elevated LFTs",
    monitoring: ["OGTT annually from age 10 — MODY5", "Magnesium supplementation", "eGFR + UPCR", "Genital/pelvic USS in females"],
    genetics: "Autosomal dominant; 17q12 deletion on MLPA or HNF1B sequencing",
  },
  MCDK: {
    label: "Multicystic Dysplastic Kidney (MCDK)",
    gene: "Usually sporadic; CAKUT genes if bilateral",
    color: "bg-teal-50 border-teal-300",
    features: "Non-communicating cysts of variable size; no normal parenchyma; involutes spontaneously; unilateral common; check contralateral VUR",
    monitoring: ["USG every 6–12 months until involution", "VCUG contralateral kidney (10–18% VUR)", "Nephrectomy: Only if hypertension or non-involution at 5y", "Long-term: Annual BP + eGFR"],
    genetics: "Mostly sporadic; bilateral MCDK is lethal; NGS if bilateral or family history",
  },
};

function assignDiagnosis(data) {
  const { age, laterality, famHx, extrarenal } = data;
  const hasBBS = extrarenal.polydactyly && extrarenal.obesity && extrarenal.retinal;
  const hasHNF1B = extrarenal.hypomagnesemia || extrarenal.genital_anomaly || extrarenal.pancreatic_cysts;
  const hasNPHP = !extrarenal.liver_cysts && !extrarenal.polydactyly && extrarenal.retinal && !extrarenal.obesity;
  const hasARPKD = laterality === "bilateral" && (age === "Prenatal" || age === "Infant") && extrarenal.liver_cysts;
  const hasADPKD = famHx && laterality === "bilateral" && (age === "Child" || age === "Adolescent");
  
  if (hasBBS) return "BBS";
  if (hasHNF1B) return "HNF1B";
  if (hasARPKD) return "ARPKD";
  if (hasADPKD) return "ADPKD";
  if (hasNPHP) return "NPHP";
  if (laterality === "unilateral" && age !== "Prenatal") return "MCDK";
  return famHx ? "ADPKD" : "NPHP";
}

export default function CysticKidneyEngine() {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState("");
  const [laterality, setLaterality] = useState("");
  const [famHx, setFamHx] = useState(null);
  const [extrarenal, setExtrarenal] = useState({});
  const [diagnosis, setDiagnosis] = useState("");

  const toggleEx = (id) => setExtrarenal(e => ({ ...e, [id]: !e[id] }));

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-cyan-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5" />
          <h3 className="text-sm font-bold">Cystic Kidney Disease Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">ADPKD · ARPKD · NPHP · BBS · HNF1B</Badge>
        </div>
        <p className="text-xs text-blue-100">Age → Pattern → Family Hx → Extra-renal features → Diagnosis → Genetics</p>
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Age at presentation:</p>
          <div className="grid grid-cols-2 gap-2">
            {["Prenatal", "Infant (<1y)", "Child (1–10y)", "Adolescent"].map(a => (
              <button key={a} onClick={() => setAge(a)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${age === a ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700"}`}>
                {a}
              </button>
            ))}
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={!age} onClick={() => setStep(1)}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Step 1: Unilateral or bilateral cysts?</p>
          <div className="grid grid-cols-2 gap-2">
            {["unilateral", "bilateral"].map(l => (
              <button key={l} onClick={() => setLaterality(l)}
                className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all capitalize ${laterality === l ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700"}`}>
                {l}
              </button>
            ))}
          </div>
          {laterality === "unilateral" && <Alert className="bg-teal-50 border-teal-200"><AlertCircle className="w-4 h-4 text-teal-600" /><AlertDescription className="text-teal-800 text-xs">Unilateral: Consider MCDK. Check contralateral kidney for VUR and compensatory hypertrophy.</AlertDescription></Alert>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={!laterality} onClick={() => setStep(2)}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Step 2: Family history of cystic kidney disease?</p>
          <div className="grid grid-cols-2 gap-2">
            {["Yes — first degree relative affected", "No family history known"].map((opt, i) => (
              <button key={opt} onClick={() => setFamHx(i === 0)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${famHx === (i === 0) && famHx !== null ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700"}`}>
                {opt}
              </button>
            ))}
          </div>
          {famHx === true && <div className="rounded-xl bg-blue-50 border border-blue-200 p-2 text-xs text-blue-800 font-medium">Family history → ADPKD (autosomal dominant) more likely. Check which parent affected.</div>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={famHx === null} onClick={() => setStep(3)}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Step 3: Extra-renal features? (Check all present)</p>
          <div className="space-y-1.5">
            {EXTRARENAL.map(q => (
              <button key={q.id} onClick={() => toggleEx(q.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${extrarenal[q.id] ? "bg-blue-50 border-blue-300 text-blue-800" : "bg-white border-slate-200 text-slate-700"}`}>
                {extrarenal[q.id] ? <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                {q.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => { setDiagnosis(assignDiagnosis({ age, laterality, famHx, extrarenal })); setStep(4); }}>Generate Diagnosis <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 4 && diagnosis && (() => {
        const dx = DIAGNOSES[diagnosis];
        return (
          <div className="space-y-3">
            <div className={`rounded-xl border-2 p-4 ${dx.color}`}>
              <p className="text-base font-bold text-slate-900">Most Likely: {dx.label}</p>
              <p className="text-xs text-slate-600 mt-1">Gene(s): {dx.gene}</p>
            </div>
            <Card className="border-slate-200">
              <CardContent className="p-3 space-y-1">
                <p className="text-xs font-bold text-slate-700 mb-1">Key Features:</p>
                <p className="text-xs text-slate-700">{dx.features}</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="py-2 px-3 border-b border-green-200"><CardTitle className="text-xs font-bold text-green-900">Monitoring Protocol</CardTitle></CardHeader>
              <CardContent className="p-3 space-y-1">
                {dx.monitoring.map((m, i) => <div key={i} className="flex items-start gap-1.5 text-xs text-green-800"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-600" />{m}</div>)}
              </CardContent>
            </Card>
            <div className="rounded-xl bg-violet-50 border border-violet-200 p-3 text-xs text-violet-900">
              <p className="font-bold mb-1">Genetics</p><p>{dx.genetics}</p>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { setStep(0); setAge(""); setLaterality(""); setFamHx(null); setExtrarenal({}); setDiagnosis(""); }}>New Case</Button>
          </div>
        );
      })()}
    </div>
  );
}