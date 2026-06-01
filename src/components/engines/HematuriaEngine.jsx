import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, ArrowLeft, ChevronRight, Droplet, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// References: KDIGO GN Guidelines · AAP UTI Guidelines · IPNA · ISPN

const STEPS = {
  START: "start",
  CONFIRM: "confirm",
  NEPHRITIC_SIGNS: "nephritic_signs",
  NEPHRITIC_WORKUP: "nephritic_workup",
  LUTS: "luts",
  LUTS_WORKUP: "luts_workup",
  MACRO_MICRO: "macro_micro",
  MACRO_EXCLUDE_EXERCISE: "macro_exclude_exercise",
  PHASE_CONTRAST: "phase_contrast",
  GLOMERULAR: "glomerular",
  NON_GLOMERULAR: "non_glom",
  GLOM_FAMILY: "glom_family",
  GLOM_FAMILY_POSITIVE: "glom_family_pos",
  GLOM_BIOPSY: "glom_biopsy",
  NON_GLOM_CAUSES: "non_glom_causes",
  UTI_WORKUP: "uti_workup",
  STONE_WORKUP: "stone_workup",
  HYPERCALCIURIA_WORKUP: "hypercalciuria_workup",
  MASS_WORKUP: "mass_workup",
  TRAUMA_WORKUP: "trauma_workup",
  ISOLATED_MICRO: "isolated_micro",
};

const Chip = ({ children, color = "slate" }) => {
  const map = { red: "bg-red-100 text-red-800", blue: "bg-blue-100 text-blue-800", green: "bg-green-100 text-green-800", amber: "bg-amber-100 text-amber-800", violet: "bg-violet-100 text-violet-800", slate: "bg-slate-100 text-slate-700" };
  return <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${map[color]}`}>{children}</span>;
};

const InfoBox = ({ title, color = "blue", items, urgent, referral, children }) => {
  const styles = { blue: "border-blue-300 bg-blue-50", green: "border-green-300 bg-green-50", amber: "border-amber-300 bg-amber-50", red: "border-red-300 bg-red-50", violet: "border-violet-300 bg-violet-50" };
  const titleColor = { blue: "text-blue-900", green: "text-green-900", amber: "text-amber-900", red: "text-red-900", violet: "text-violet-900" };
  return (
    <Card className={`border-2 ${styles[color]}`}>
      <CardContent className="p-4 space-y-2">
        {urgent && <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs"><AlertTriangle className="w-3.5 h-3.5" /> Urgent referral required</div>}
        <p className={`font-bold text-sm ${titleColor[color]}`}>{title}</p>
        {items && <ul className="space-y-1.5">{items.map((it, i) => <li key={i} className="flex items-start gap-2 text-xs text-slate-700"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" /><span>{it}</span></li>)}</ul>}
        {children}
        {referral && <div className="mt-2 p-2 bg-violet-50 border border-violet-200 rounded-lg text-xs text-violet-800 font-medium">📋 {referral}</div>}
      </CardContent>
    </Card>
  );
};

const Q = ({ question, note, options, onSelect }) => (
  <div className="space-y-3">
    <p className="font-semibold text-sm text-slate-800">{question}</p>
    {note && <p className="text-xs text-slate-500 italic">{note}</p>}
    <div className="space-y-2">
      {options.map(opt => (
        <button key={opt.label} onClick={() => onSelect(opt.next, opt.key, opt.value)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 active:scale-[0.99] transition-all text-left">
          <span className="text-sm font-medium text-slate-700 leading-snug">{opt.label}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
        </button>
      ))}
    </div>
  </div>
);

export default function HematuriaEngine() {
  const [step, setStep] = useState(STEPS.START);
  const [history, setHistory] = useState([]);
  const [answers, setAnswers] = useState({});

  const go = (next, key, value) => {
    setHistory(h => [...h, step]);
    if (key) setAnswers(a => ({ ...a, [key]: value }));
    setStep(next);
  };
  const back = () => { const prev = history[history.length - 1]; if (prev) { setHistory(h => h.slice(0, -1)); setStep(prev); } };
  const reset = () => { setStep(STEPS.START); setHistory([]); setAnswers({}); };

  const NavBtns = () => (
    <div className="flex gap-2 pt-2">
      {history.length > 0 && <Button variant="outline" size="sm" className="flex-1" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>}
      <Button variant="outline" size="sm" className="flex-1" onClick={reset}>Restart</Button>
    </div>
  );

  const renderStep = () => {
    switch (step) {

      // ── STEP 1: Confirm hematuria ──
      case STEPS.START:
        return (
          <div className="space-y-4">
            <InfoBox title="Step 1: Confirm Hematuria" color="slate"
              items={["Urine dipstick (stick): positive for blood", "Urine microscopy: ≥5 RBC/HPF on fresh mid-stream urine", "Dipstick positive but NO RBC → evaluate for myoglobinuria, haemoglobinuria (pigmenturia)"]}
            />
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
              <p className="font-bold text-amber-900">Causes of dipstick-positive without RBC:</p>
              {["Haemoglobinuria (haemolysis)", "Myoglobinuria (rhabdomyolysis)", "Porphyria", "Foods: beets, blackberries, rifampicin"].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
            </div>
            <Q question="What does urine microscopy show?" onSelect={go} options={[
              { label: "Significant RBC seen (≥5/HPF) — true hematuria", next: STEPS.NEPHRITIC_SIGNS, key: "confirmed", value: true },
              { label: "No RBC — dipstick positive only", next: "pigment", key: "confirmed", value: false },
            ]} />
          </div>
        );

      case "pigment":
        return (
          <div className="space-y-3">
            <InfoBox title="Pigmenturia Workup" color="amber"
              items={["Serum LDH, haptoglobin, free haemoglobin (haemolysis)", "Serum CK, urine myoglobin (rhabdomyolysis)", "Urine porphyrins if porphyria suspected", "Review medications (rifampicin, nitrofurantoin, deferoxamine)"]}
            />
            <NavBtns />
          </div>
        );

      // ── STEP 2: Nephritic syndrome signs ──
      case STEPS.NEPHRITIC_SIGNS:
        return (
          <Q question="Symptoms/signs of acute nephritic syndrome?" note="Oedema + hypertension + oliguria ± haematuria ± azotaemia"
            onSelect={go} options={[
              { label: "YES — oedema, hypertension, oliguria present", next: STEPS.NEPHRITIC_WORKUP, key: "nephritic", value: true },
              { label: "NO — none of these features", next: STEPS.LUTS, key: "nephritic", value: false },
            ]} />
        );

      case STEPS.NEPHRITIC_WORKUP:
        return (
          <div className="space-y-3">
            <Alert className="border-red-300 bg-red-50"><AlertTriangle className="w-4 h-4 text-red-600" /><AlertDescription className="text-red-800 text-xs font-bold">Acute nephritic syndrome — urgent evaluation</AlertDescription></Alert>
            <InfoBox title="Nephritic Syndrome Workup" color="red" urgent
              items={[
                "Urine protein:creatinine ratio (PCR) + 24h urine protein",
                "Serum urea, creatinine, electrolytes, albumin — STAT",
                "Complete blood count (CBC) with differential",
                "Serum complement C3 and C4",
                "ASO titre or anti-DNase B (post-streptococcal)",
                "ANA + anti-dsDNA antibody (lupus nephritis)",
                "ANCA — pANCA (MPO) + cANCA (PR3) (ANCA vasculitis)",
                "Anti-GBM antibody if pulmonary haemorrhage (Goodpasture)",
                "HBsAg, HCV Ab (secondary GN)",
                "Renal USS: size, echogenicity, Doppler",
              ]}
              referral="Urgent paediatric nephrology — biopsy decision within 24–48h"
            />
            <NavBtns />
          </div>
        );

      // ── STEP 3: LUTS ──
      case STEPS.LUTS:
        return (
          <Q question="Lower urinary tract symptoms (LUTS)?" note="Dysuria, frequency, urgency, suprapubic/flank/abdominal pain"
            onSelect={go} options={[
              { label: "YES — dysuria, frequency, urgency, pain", next: STEPS.LUTS_WORKUP, key: "luts", value: true },
              { label: "NO — no LUTS", next: STEPS.MACRO_MICRO, key: "luts", value: false },
            ]} />
        );

      case STEPS.LUTS_WORKUP:
        return (
          <div className="space-y-3">
            <InfoBox title="LUTS Workup — Suspect UTI / Stones / Bladder" color="green"
              items={[
                "Urine microscopy + culture and sensitivity",
                "Urine dipstick: nitrites, leucocytes",
                "Renal-bladder USS (first episode UTI in child <2y, febrile UTI)",
                "X-ray KUB if renal calculi suspected",
                "Serum creatinine, electrolytes",
                "Spot urine Ca:Cr ratio (exclude hypercalciuria)",
                "24h urine Ca, oxalate, uric acid, citrate if calculi suspected",
                "Urine culture for adenovirus (haemorrhagic cystitis)",
              ]}
              referral="Paediatric nephrology/urology if recurrent or structural abnormality"
            />
            <NavBtns />
          </div>
        );

      // ── STEP 4: Macro vs Micro ──
      case STEPS.MACRO_MICRO:
        return (
          <Q question="Type of hematuria?" onSelect={go} options={[
            { label: "Macroscopic — visible red/brown/cola urine", next: STEPS.MACRO_EXCLUDE_EXERCISE, key: "type", value: "macro" },
            { label: "Microscopic — urine appears normal, RBC on microscopy only", next: STEPS.PHASE_CONTRAST, key: "type", value: "micro" },
          ]} />
        );

      // ── STEP 4 (Macro): exclude exercise ──
      case STEPS.MACRO_EXCLUDE_EXERCISE:
        return (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <p className="font-bold text-slate-800">Step 4: Macroscopic Hematuria Considerations</p>
              <p className="text-slate-700">• Glomerular origin: usually brown/tea/cola-coloured</p>
              <p className="text-slate-700">• Lower urinary tract origin: usually pink or bright red</p>
              <p className="text-slate-700">• Initial hematuria → urethral origin; Terminal → bladder cause</p>
              <p className="text-slate-700">• Preceding exercise can cause transient macroscopic haematuria</p>
            </div>
            <Q question="Was macroscopic haematuria preceded by vigorous exercise?" onSelect={go} options={[
              { label: "YES — exercise-induced (repeat urinalysis in 48–72h without exercise)", next: "exercise_f", key: "exercise", value: true },
              { label: "NO — not exercise-related", next: STEPS.PHASE_CONTRAST, key: "exercise", value: false },
            ]} />
          </div>
        );

      case "exercise_f":
        return (
          <div className="space-y-3">
            <InfoBox title="Exercise-Induced Haematuria" color="green"
              items={["Repeat urinalysis weekly × 2 without exercise", "If clears: reassure — no further workup needed", "If persists after 2 weeks rest: proceed to full evaluation", "Exclude trauma, renal contusion if heavy contact sport"]}
            />
            <NavBtns />
          </div>
        );

      // ── STEP 5: Phase-contrast microscopy ──
      case STEPS.PHASE_CONTRAST:
        return (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1.5">
              <p className="font-bold text-blue-900">Step 5: Phase-Contrast Microscopy + UPCR</p>
              <p className="text-blue-800">• Perform on freshly voided urine (RBC casts disintegrate in alkaline/stored urine)</p>
              <p className="text-blue-800">• Urine protein:creatinine ratio (UPCR) on early morning specimen</p>
              <p className="font-semibold text-blue-900 mt-1">{"Glomerular pattern: dysmorphic RBC >30%, acanthocytes, RBC casts, proteinuria"}</p>
              <p className="font-semibold text-blue-900">{"Non-glomerular: >90% isomorphic RBC, no casts, minimal/no proteinuria"}</p>
            </div>
            <Q question="Phase-contrast microscopy result?" onSelect={go} options={[
              { label: "GLOMERULAR — dysmorphic RBC >30%, RBC casts, or significant proteinuria", next: STEPS.GLOMERULAR, key: "phase", value: "glom" },
              { label: "NON-GLOMERULAR — isomorphic RBC, no casts, no/minimal proteinuria", next: STEPS.NON_GLOMERULAR, key: "phase", value: "nonglom" },
            ]} />
          </div>
        );

      // ── STEP 6A: Glomerular hematuria ──
      case STEPS.GLOMERULAR:
        return (
          <Q question="Glomerular hematuria — family history?" note="Test parents and siblings for haematuria first"
            onSelect={go} options={[
              { label: "Family members also have haematuria / renal failure / deafness", next: STEPS.GLOM_FAMILY_POSITIVE, key: "glom_family", value: "positive" },
              { label: "Family screen negative — no family haematuria", next: STEPS.GLOM_BIOPSY, key: "glom_family", value: "negative" },
            ]} />
        );

      case STEPS.GLOM_FAMILY_POSITIVE:
        return (
          <div className="space-y-3">
            <InfoBox title="Familial Haematuria — Alport / TBMN Workup" color="violet"
              items={[
                "Audiometry for sensorineural hearing loss (high-tone)",
                "Ophthalmologic assessment: anterior lenticonus, sub-capsular cataracts, retinal/corneal changes",
                "COL4A3 / COL4A4 / COL4A5 gene panel",
                "Skin biopsy with immunostaining for α5(IV) collagen (X-linked Alport)",
                "Peripheral blood smear: macrothrobocytopenia + Döhle-like bodies → MYH9 syndrome",
                "Renal biopsy EM: GBM thinning (TBMN) or lamellation/basket-weave (Alport)",
                "Annual urine PCR, eGFR, BP monitoring — watch for proteinuria progression",
              ]}
              referral="Paediatric nephrology — genetic counselling + COL4A panel + family surveillance"
            >
              <div className="mt-2 p-2 bg-violet-50 rounded-lg">
                <p className="text-xs font-bold text-violet-900 mb-1">Genetic causes of familial haematuria:</p>
                {[
                  ["AD Alport / TBMN", "COL4A3/A4 heterozygous", "α3/α4(IV)"],
                  ["X-linked Alport (males)", "COL4A5 hemizygous", "α5(IV)"],
                  ["X-linked Alport (females)", "COL4A5 heterozygous", "α5(IV)"],
                  ["AR Alport", "COL4A3/A4 biallelic", "α3/α4(IV)"],
                  ["MYH9 syndrome", "MYH9 heterozygous", "NMHC-IIA"],
                  ["CFHR5 nephropathy", "CFHR5 heterozygous", "Factor H-related 5"],
                ].map(([d, g, p], i) => (
                  <div key={i} className="grid grid-cols-3 gap-1 text-xs py-0.5 border-b border-violet-100 last:border-0">
                    <span className="text-violet-800 font-medium">{d}</span>
                    <span className="text-slate-600">{g}</span>
                    <span className="text-slate-500 italic">{p}</span>
                  </div>
                ))}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.GLOM_BIOPSY:
        return (
          <div className="space-y-3">
            <InfoBox title="Glomerular Haematuria — Full Investigation + Biopsy Indications" color="blue" urgent
              items={[
                "Serum urea, creatinine, electrolytes, eGFR",
                "CBC, albumin, total cholesterol",
                "24h urine protein and creatinine clearance",
                "Serum complement C3, C4 (low in PSGN, SLE, MPGN, C3G)",
                "Serum IgA (elevated in IgA nephropathy — not sensitive)",
                "ANA + anti-dsDNA antibody",
                "ANCA (pANCA/cANCA), Anti-GBM antibody",
                "ASO titre + anti-DNase B (post-streptococcal GN)",
                "HBsAg, HCV Ab (secondary GN)",
                "Renal USS: size, echogenicity, cystic disease",
                "Audiometry + slit-lamp (exclude Alport if not done)",
                "Urine microscopy for family members",
              ]}
              referral="Paediatric nephrology — decide on renal biopsy"
            >
              <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                <p className="text-xs font-bold text-slate-800 mb-1">Indications for Kidney Biopsy:</p>
                {[
                  "Significant proteinuria >1 g/1.73m²/day",
                  "Persistently low C3 >3 months",
                  "Unexplained azotaemia / declining eGFR",
                  "Systemic disease (SLE, IgA vasculitis, ANCA vasculitis)",
                  "Family history significant kidney disease (Alport)",
                  "Recurrent gross haematuria of unknown aetiology",
                  "Persistent glomerular haematuria + parental anxiety",
                  "NOTE: Biopsy usually NOT indicated in isolated glomerular haematuria",
                ].map((b, i) => <p key={i} className="text-xs text-slate-700">• {b}</p>)}
              </div>
            </InfoBox>
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-xs font-bold text-green-900">If investigations normal — isolated/intermittent haematuria:</p>
              <p className="text-xs text-green-800 mt-1">Follow-up with yearly urinalysis (urine dipstick + microscopy + BP + eGFR)</p>
            </div>
            <NavBtns />
          </div>
        );

      // ── STEP 6B: Non-glomerular hematuria ──
      case STEPS.NON_GLOMERULAR:
        return (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-bold text-amber-900 mb-2">Non-Glomerular Causes — Common:</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-amber-800">
                {["UTI (including adenovirus)", "Urolithiasis / nephrocalcinosis", "Hypercalciuria", "Trauma", "Renal tumour (Wilms, RCC)", "Nutcracker syndrome", "Cystic kidney disease", "Bleeding disorder", "Schistosoma (endemic)", "Menstrual contamination"].map((c, i) => <span key={i}>• {c}</span>)}
              </div>
            </div>
            <Q question="Most likely non-glomerular cause based on history?" onSelect={go} options={[
              { label: "UTI — dysuria, fever, pyuria, positive culture", next: STEPS.UTI_WORKUP },
              { label: "Stones / urolithiasis — loin-to-groin pain, stone passage", next: STEPS.STONE_WORKUP },
              { label: "Hypercalciuria — recurrent painless haematuria, no infection", next: STEPS.HYPERCALCIURIA_WORKUP },
              { label: "Renal mass — abdominal mass on examination", next: STEPS.MASS_WORKUP },
              { label: "Trauma — history of injury or contact sport", next: STEPS.TRAUMA_WORKUP },
              { label: "No obvious cause — asymptomatic microscopic", next: STEPS.ISOLATED_MICRO },
            ]} />
          </div>
        );

      case STEPS.UTI_WORKUP:
        return (
          <div className="space-y-3">
            <InfoBox title="UTI Workup" color="green"
              items={[
                "Urine culture + sensitivity (mid-stream clean catch)",
                "Urine microscopy: WBC, organisms",
                "Urine adenovirus culture if haemorrhagic cystitis (sterile pyuria + haematuria)",
                "Renal-bladder USS (first UTI <2y, febrile UTI, recurrent UTI)",
                "DMSA scan at 4–6 months (cortical scarring after febrile UTI)",
                "VCUG / MCU if: <2y age, recurrent febrile UTIs, USS abnormal, DMSA scar",
                "Screen for bleeding disorder if: FBC, PT, aPTT",
                "Treat with culture-directed antibiotics; prophylaxis if VUR grade III+",
              ]}
              referral="Nephrology/urology if VUR ≥ grade III, recurrent febrile UTI, structural anomaly"
            />
            <NavBtns />
          </div>
        );

      case STEPS.STONE_WORKUP:
        return (
          <div className="space-y-3">
            <InfoBox title="Urolithiasis Workup" color="amber"
              items={[
                "Renal-bladder USS (first-line: stones, hydronephrosis, nephrocalcinosis)",
                "Plain abdominal X-ray (KUB) if radio-opaque stones suspected",
                "Non-contrast CT KUB (most sensitive: ureteral stones, radiolucent)",
                "Stone analysis if stone retrieved (chemical + infrared spectroscopy + XRD)",
                "Serum: creatinine, calcium, phosphate, uric acid, bicarbonate, magnesium, potassium",
                "Spot urine molar Ca, oxalate, uric acid, citrate:creatinine ratios",
                "Spot urine Ca:Cr ratio (normal <0.21 mg/mg >5y, <0.4 <2y)",
                "24h urine: Ca, oxalate, uric acid, citrate, cystine, creatinine",
                "PTH + 25-OHVitD if hypercalcaemia",
                "Urine cystine screen (nitroprusside test) → quantitative if positive",
                "Cystoscopy if bladder/urethral pathology suspected",
              ]}
              referral="Paediatric urology + metabolic stone clinic (nephrology)"
            />
            <NavBtns />
          </div>
        );

      case STEPS.HYPERCALCIURIA_WORKUP:
        return (
          <div className="space-y-3">
            <InfoBox title="Hypercalciuria Workup" color="amber"
              items={[
                "Spot urine Ca:Cr ratio (normal <0.21 in >5y; <0.4 in <2y)",
                "24h urine calcium >4 mg/kg/day = hypercalciuria",
                "Serum calcium, phosphate, PTH, 25-OH vitamin D, creatinine",
                "Renal USS (nephrocalcinosis, medullary sponge kidney)",
                "If nephrocalcinosis: dRTA workup (urine pH, serum HCO3, NH4Cl load test)",
                "Distinguish types: absorptive, renal, resorptive hypercalciuria",
                "Repeat 24h urine Ca after 7-day low-calcium diet (400 mg/day)",
              ]}
            >
              <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                <p className="text-xs font-bold text-amber-900">Doppler USS for Nutcracker Syndrome (if asthenic habitus + orthostatic haematuria):</p>
                {["AP diameter ratio distended:narrowed left renal vein >4.0", "Peak velocity ratio narrowed:distended left renal vein >4.2", "Hilar to aortomesenteric diameter ratio >4.9", "SMA-aorta angle <35°"].map((c, i) => <p key={i} className="text-xs text-amber-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.MASS_WORKUP:
        return (
          <div className="space-y-3">
            <InfoBox title="Renal Mass Workup" color="red" urgent
              items={[
                "Renal-bladder USS (urgent — Wilms tumour most common <5y)",
                "CECT abdomen: tumour staging, IVC extension, contralateral kidney",
                "Chest CT for staging (Wilms tumour metastasis)",
                "DTPA/MAG3: differential renal function",
                "AFP (if hepatoblastoma), LDH, CBC, coagulation",
                "Urine catecholamines / VMA (if phaeochromocytoma/neuroblastoma)",
              ]}
              referral="URGENT — paediatric oncology + urology"
            />
            <NavBtns />
          </div>
        );

      case STEPS.TRAUMA_WORKUP:
        return (
          <div className="space-y-3">
            <InfoBox title="Renal Trauma Workup" color="blue"
              items={[
                "CECT abdomen (gold standard — AAST renal trauma grading I–V)",
                "USS abdomen (bedside screening, less sensitive for Grade I)",
                "Grade I–II: conservative management, bed rest, serial USS",
                "Grade III–V: urology/interventional radiology consultation",
                "Monitor BP, urine output, serial haematocrit",
                "Angiography + embolisation if vascular injury",
              ]}
              referral="Paediatric surgery/urology for Grade III+ renal trauma"
            />
            <NavBtns />
          </div>
        );

      case STEPS.ISOLATED_MICRO:
        return (
          <div className="space-y-3">
            <InfoBox title="Isolated Asymptomatic Microscopic Haematuria" color="green"
              items={[
                "Non-glomerular: isomorphic RBC, no casts, no proteinuria, no hypertension",
                "Urine Ca:Cr ratio + 24h urine calcium (exclude hypercalciuria)",
                "Urine culture (exclude UTI, adenovirus)",
                "Urine adenovirus culture (endemic areas)",
                "Screen for bleeding disorder: FBC, PT, aPTT",
                "Spot urine: Ca, uric acid, oxalate, cystine:Cr ratios",
                "Renal USS (exclude structural abnormality, tumour)",
                "If USS abnormal: consider DTPA/MAG3, VCUG",
                "Abdominal X-ray KUB if ureteric calculi suspected",
                "Computed tomography abdomen (trauma or tumour suspected)",
                "Doppler USS left renal vein if nutcracker syndrome suspected",
                "Genetic testing: familial haematuria syndromes (COL4A, MYH9)",
                "Cystoscopy if bladder/urethral pathology suspected",
              ]}
              referral="Nephrology if persists >12 months, proteinuria develops, BP rises"
            >
              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                <p className="text-xs font-bold text-green-900">Monitoring (if isolated, all investigations normal):</p>
                <p className="text-xs text-green-800">Repeat urinalysis + BP + eGFR annually. Reassure — most resolve spontaneously. No activity restriction.</p>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      default:
        return <div className="text-center py-8"><Button onClick={reset}>Restart</Button></div>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-rose-700 to-red-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Hematuria Decision Engine</h3>
            <p className="text-xs text-rose-200">KDIGO · AAP · IPNA · 6-Step Algorithm</p>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant="outline" className="text-xs">Step {history.length + 1}</Badge>
          <Badge className="text-xs bg-rose-600 text-white">{step.replace(/_/g, " ")}</Badge>
        </div>
      )}

      <Card><CardContent className="p-4">{renderStep()}</CardContent></Card>

      <div className="text-xs text-slate-400 text-center">
        KDIGO GN Guidelines · AAP UTI Guidelines · IPNA · ISPN
      </div>
    </div>
  );
}