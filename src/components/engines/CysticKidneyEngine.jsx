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
    features: "Bilateral enlarged echogenic kidneys; medullary tubular ectasia; hepatic fibrosis (Caroli disease); portal hypertension; neonatal/fetal presentation (Potter sequence if severe); oligohydramnios; pulmonary hypoplasia",
    imaging: ["Prenatal USS: massively enlarged bilateral echogenic kidneys (longest axis > 2 SD); oligohydramnios in severe cases", "Postnatal: bilateral enlarged kidneys with loss of corticomedullary differentiation; radial striations", "Liver USS: periportal fibrosis pattern; portal Doppler for portal hypertension (splenomegaly, varices)", "MRCP/MRI: Caroli disease — bile duct dilation; ductal plate malformation"],
    monitoring: ["eGFR + UPCR every 3 months (first year) then 6 monthly", "Hepatic fibrosis: Annual liver USS + portal Doppler", "Portal HTN: Gastroscopy for varices at age 5y or if splenomegaly", "BP: ACEi/ARB (enalapril 0.1 mg/kg/day) — target <50th percentile", "Growth: height, weight, OFC (head circumference in infants) every 3 months", "Respiratory: monitor pulmonary function in neonates (pulmonary hypoplasia risk)"],
    genetics: "PKHD1 — autosomal recessive; both parents are obligate carriers; 25% recurrence risk per pregnancy; prenatal diagnosis possible if family variant known",
    treatment: "Supportive — no disease-modifying therapy. Terlipressin for variceal bleed; beta-blocker prophylaxis; combined liver-kidney transplant for severe hepatic disease + ESRD; early dialysis may be needed in neonates.",
  },
  ADPKD: {
    label: "ADPKD (Autosomal Dominant PKD)",
    gene: "PKD1 (85%), PKD2 (15%)",
    color: "bg-blue-50 border-blue-300",
    features: "Progressive bilateral cysts from birth (silent in children); family history essential (usually one parent affected); liver cysts (50% by 30y); intracranial aneurysms (5–10%); mitral valve prolapse; early hypertension; haematuria episodes",
    imaging: ["USS: bilateral cysts of varying size (may be normal or few cysts in childhood)", "Unified criteria for ADPKD: age 15–39y = ≥3 cysts; 40–59y = ≥2 per kidney; >60y = ≥4 per kidney (for PKD1)", "MRI TKV (total kidney volume): use for Tolvaptan eligibility (TEMPO trial) — MRI preferred for volumetry", "MRA brain: screen for intracranial aneurysm (ICA) at age 20–25y if family history of ICA/rupture"],
    monitoring: ["BP annually (early HTN most common — ACEi/ARB when detected)", "eGFR + UPCR annually (eGFR declines ~5 mL/min/year from age 30s)", "MRI TKV every 2–3 years when eGFR declining — Mayo classification (1A–1E) for Tolvaptan decision", "UPCR: <0.2 g/g in childhood usually", "Liver USS every 5 years (liver cysts; PLD)", "Ophthalmology: not routine unless symptomatic"],
    genetics: "PKD1/PKD2 — autosomal dominant; 50% risk to each child; de novo in 5–10%; genetic testing (NGS PKD1+PKD2) when family variant unknown or pre-symptomatic testing in children (controversial — after age 18 unless medically indicated)",
    treatment: "Tolvaptan (V2R antagonist): for rapidly progressing ADPKD (Mayo class 1C–1E, eGFR decline >5 mL/min/year, age >18y); liver toxicity monitoring required; ACEi/ARB for HTN/proteinuria; avoid nephrotoxic drugs, encourage hydration.",
  },
  NPHP: {
    label: "Nephronophthisis (NPHP)",
    gene: "NPHP1 deletion (45%), NPHP3/4/5/6/...",
    color: "bg-amber-50 border-amber-300",
    features: "Classic triad: polyuria (NDI-like), polydipsia, growth failure — in school-age child; small kidneys with loss of CMD; corticomedullary cysts (1–2 cm, not always present); progressive tubulointerstitial nephritis; no hypertension until near-ESRD; ESRD median age 13y (NPHP1), variable others",
    imaging: ["USS: normal to small kidneys; increased echogenicity; corticomedullary cysts (may be absent in early disease)", "MRI: corticomedullary microcysts (better seen on 3T MRI); loss of CMD", "MRI brain: Joubert syndrome — 'molar tooth sign' (cerebellar vermis aplasia + superior cerebellar peduncle elongation)", "Ophthalmology: Senior-Løken syndrome — tapetoretinal dystrophy (ERG essential if NPHP suspected)"],
    monitoring: ["eGFR every 3–6 months (progression to ESRD median 13y NPHP1; varies by gene)", "Retinal exam + ERG annually (Senior-Løken syndrome)", "MRI brain if cerebellar signs/Joubert suspected", "Height/weight/nutrition — rickets screen (FEPi, Vit D) in proximal tubular injury", "Liver USS: hepatic fibrosis in NPHP3/NPHP11 — annual"],
    genetics: "NPHP1 deletion (45%): MLPA first; if negative → ciliopathy panel (NPHP1–20+ genes; TMEM67, CEP290, RPGRIP1L); WES if panel negative; AR inheritance",
    treatment: "No disease-modifying therapy. Manage polyuria (adequate hydration), growth support (rhGH if GH deficient), RRT planning (PD often first choice in children < 20 kg); kidney transplant — no recurrence.",
  },
  BBS: {
    label: "Bardet-Biedl Syndrome (BBS)",
    gene: "BBS1, BBS10, BBS12 most common",
    color: "bg-purple-50 border-purple-300",
    features: "Primary features (4 present = diagnosis): Rod-cone dystrophy (night blindness by 8y — ERG abnormal), postaxial polydactyly (extra digits), obesity (hyperphagia from birth), learning disability, genitourinary anomalies (hypogonadism, VUR), renal anomalies (dysplastic kidneys, calyceal clubbing, fetal lobulation)",
    imaging: ["Renal USS: dysplastic kidneys, calyceal clubbing, fetal lobulation pattern, VUR on VCUG", "MRI brain: not diagnostic; cerebellar changes variable", "ERG (electroretinography): essential — diagnostic for rod-cone dystrophy even before visual symptoms"],
    monitoring: ["Annual ophthalmic review + ERG (vision loss is progressive — low vision aids, Braille)", "Metabolic: BMI, OGTT, fasting lipids, HbA1c (obesity → insulin resistance)", "Setmelanotide (Imcivree — MC4R agonist): approved for obesity in BBS (RHYTHM trials) — significant weight loss", "Renal: eGFR + UPCR annually; USS + VCUG if UTI; DMSA for scarring", "Hearing assessment; dental (crowding); cardiac echo (CHD in some)"],
    genetics: "BBS gene panel (20+ genes; BBS1, BBS2, BBS4, BBS7, BBS10, BBS12 most common); autosomal recessive; genetic counselling for siblings",
    treatment: "Setmelanotide (obesity); vision aids; low-fat calorie-restricted diet; ACEi/ARB for renal disease; renal transplant for ESRD (outcomes good — no recurrence).",
  },
  HNF1B: {
    label: "HNF1B-associated Renal Disease (17q12)",
    gene: "HNF1B (17q12) — deletion or point mutation",
    color: "bg-green-50 border-green-300",
    features: "Renal cysts (small, bilateral, medullary/cortical); MODY5 diabetes (maturity-onset diabetes of the young — type 5); hypomagnesemia (renal Mg wasting); uterine/genital anomalies in females (aplasia, bicornuate); hyperuricemia; elevated LFTs; pancreatic hypoplasia; developmental delay possible",
    imaging: ["USS: small bilateral medullary cysts; renal hypoplasia; echogenic kidneys", "Pelvic USS in females: uterine anomalies (aplasia, duplex, bicornuate uterus)", "MRI pancreas: pancreatic body/tail hypoplasia or aplasia", "Liver: hepatic steatosis in some; ductal anomalies"],
    monitoring: ["OGTT annually from age 10y (MODY5 — often non-obese, early onset diabetes)", "Magnesium: serum + urine Mg; supplementation if low (Mg oxide/citrate)", "eGFR + UPCR: progress to CKD by 4th–5th decade", "Genital/pelvic USS in females at adolescence", "HbA1c annually once MODY5 established; insulin often needed"],
    genetics: "Autosomal dominant (50% risk to children); de novo in 50%; 17q12 deletion on MLPA first (microarray); if negative → HNF1B sequencing; prenatal diagnosis available",
    treatment: "Insulin for MODY5 (sulphonylureas partially effective); Mg supplementation; ACEi/ARB for renal disease; urological surveillance for VUR/malformations; fertility counselling (genital anomalies in females).",
  },
  MCDK: {
    label: "Multicystic Dysplastic Kidney (MCDK)",
    gene: "Usually sporadic; CAKUT genes if bilateral",
    color: "bg-teal-50 border-teal-300",
    features: "Non-communicating cysts of variable size replacing normal renal parenchyma; no normal functioning parenchyma; no central sinus; involutes spontaneously (70% by age 5y); unilateral common (bilateral = lethal); compensatory hypertrophy of contralateral kidney; 10–18% have VUR in contralateral kidney",
    imaging: ["USS: cluster of non-communicating cysts, no normal parenchyma, no central echos (distinguished from hydronephrosis by no pelvis)", "VCUG: assess contralateral VUR (10–18%)", "MAG3: confirm absent function on affected side (if diagnostic doubt)", "DMSA: not routinely needed if USS classic; use for contralateral scarring if recurrent UTI"],
    monitoring: ["USS: every 6–12 months until involution confirmed; then annual until 5y", "VCUG: 6 months of age if USS shows dilated contralateral collecting system OR first febrile UTI", "BP + eGFR: annual long-term (solitary functional kidney — lifetime CKD risk ~25%)", "Nephrectomy: Only if hypertensive, rapidly enlarging, symptomatic, or not involuated by age 5y (no role in routine asymptomatic MCDK)"],
    genetics: "Mostly sporadic; bilateral MCDK = invariably lethal (anhydramnios + pulmonary hypoplasia); NGS if family history, bilateral, or syndromic features; CAKUT genes panel (HNF1B, PAX2, EYA1, SIX1, GATA3, CHD7)",
    treatment: "Conservative (expectant) for unilateral MCDK. Monitor contralateral kidney. Manage VUR if present. Patient/family education: avoid nephrotoxic drugs; annual BP + urine check lifelong (risk of late hypertension and proteinuria from single kidney hyperfiltration).",
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
  const [activeTab, setActiveTab] = useState("features");

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
        const tabs = [
          { id: "features", label: "Key Features" },
          { id: "imaging", label: "Imaging" },
          { id: "monitoring", label: "Monitoring" },
          { id: "genetics", label: "Genetics" },
          { id: "treatment", label: "Treatment" },
        ];
        return (
          <div className="space-y-3">
            <div className={`rounded-xl border-2 p-4 ${dx.color}`}>
              <p className="text-base font-bold text-slate-900">Most Likely: {dx.label}</p>
              <p className="text-xs text-slate-600 mt-1">Gene(s): {dx.gene}</p>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${activeTab === t.id ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            {activeTab === "features" && (
              <Card className="border-slate-200"><CardContent className="p-3">
                <p className="text-xs font-bold text-slate-700 mb-1">Key Features:</p>
                <p className="text-xs text-slate-700 leading-relaxed">{dx.features}</p>
              </CardContent></Card>
            )}
            {activeTab === "imaging" && (
              <Card className="border-blue-200 bg-blue-50"><CardContent className="p-3 space-y-1">
                <p className="text-xs font-bold text-blue-900 mb-1">Imaging:</p>
                {(dx.imaging || []).map((m, i) => <div key={i} className="flex items-start gap-1.5 text-xs text-blue-800"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-600" />{m}</div>)}
              </CardContent></Card>
            )}
            {activeTab === "monitoring" && (
              <Card className="border-green-200 bg-green-50"><CardContent className="p-3 space-y-1">
                <p className="text-xs font-bold text-green-900 mb-1">Monitoring Protocol:</p>
                {dx.monitoring.map((m, i) => <div key={i} className="flex items-start gap-1.5 text-xs text-green-800"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-600" />{m}</div>)}
              </CardContent></Card>
            )}
            {activeTab === "genetics" && (
              <div className="rounded-xl bg-violet-50 border border-violet-200 p-3 text-xs text-violet-900">
                <p className="font-bold mb-1">Genetics</p><p className="leading-relaxed">{dx.genetics}</p>
              </div>
            )}
            {activeTab === "treatment" && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                <p className="font-bold mb-1">Treatment</p><p className="leading-relaxed">{dx.treatment}</p>
              </div>
            )}
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { setStep(0); setAge(""); setLaterality(""); setFamHx(null); setExtrarenal({}); setDiagnosis(""); setActiveTab("features"); }}>New Case</Button>
          </div>
        );
      })()}
    </div>
  );
}