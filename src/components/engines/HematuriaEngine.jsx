import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Circle, ArrowLeft, ChevronRight, Droplet, AlertTriangle, Microscope, Activity } from "lucide-react";

// Based on Jaypee Brothers algorithm (Fig 1.2, 1.3, 1.4)

const STEP_KEYS = {
  START: "start",
  MACRO_MICRO: "macro_micro",
  MICRO_SYMPTOMATIC: "micro_symptomatic",
  MICRO_ASYMPTOMATIC: "micro_asymptomatic",
  MICRO_ASYM_FAMILY: "micro_asym_family",
  MICRO_ASYM_WORKUP: "micro_asym_workup",
  MACRO_COLOR: "macro_color",
  GLOMERULAR_WORKUP: "glomerular_workup",
  NON_GLOMERULAR_WORKUP: "non_glomerular_workup",
  FAMILY_POSITIVE: "family_positive",
  CRYSTALLURIA_WORKUP: "crystalluria_workup",
  GN_WORKUP: "gn_workup",
  UTI_WORKUP: "uti_workup",
  RENAL_MASS_WORKUP: "renal_mass_workup",
  UROLITHIASIS_WORKUP: "urolithiasis_workup",
  HYPERCALCIURIA_WORKUP: "hypercalciuria_workup",
  TRAUMA_WORKUP: "trauma_workup",
  RESULT: "result",
};

export default function HematuriaEngine() {
  const [step, setStep] = useState(STEP_KEYS.START);
  const [history, setHistory] = useState([]);
  const [answers, setAnswers] = useState({});

  const go = (nextStep, key, value) => {
    setHistory(h => [...h, step]);
    if (key) setAnswers(a => ({ ...a, [key]: value }));
    setStep(nextStep);
  };

  const back = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory(h => h.slice(0, -1));
      setStep(prev);
    }
  };

  const reset = () => { setStep(STEP_KEYS.START); setHistory([]); setAnswers({}); };

  const Q = ({ question, options }) => (
    <div className="space-y-2">
      <p className="font-semibold text-sm text-slate-800 mb-3">{question}</p>
      {options.map(opt => (
        <button key={opt.label} onClick={() => go(opt.next, opt.key, opt.value)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 active:scale-[0.99] transition-all text-left">
          <span className="text-sm font-medium text-slate-700">{opt.label}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </button>
      ))}
    </div>
  );

  const Result = ({ title, color = "blue", items, urgent = false, referral }) => (
    <div className="space-y-3">
      {urgent && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800 text-xs font-semibold">Urgent nephrology referral required</AlertDescription>
        </Alert>
      )}
      <Card className={`border-2 ${urgent ? "border-red-300 bg-red-50" : color === "green" ? "border-green-300 bg-green-50" : color === "amber" ? "border-amber-300 bg-amber-50" : "border-blue-300 bg-blue-50"}`}>
        <CardContent className="p-4">
          <p className={`font-bold text-sm mb-3 ${urgent ? "text-red-900" : color === "green" ? "text-green-900" : color === "amber" ? "text-amber-900" : "text-blue-900"}`}>{title}</p>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${urgent ? "text-red-600" : color === "green" ? "text-green-600" : "text-blue-600"}`} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {referral && (
        <Card className="border-violet-300 bg-violet-50">
          <CardContent className="p-3">
            <p className="text-xs font-bold text-violet-900 mb-1">Referral</p>
            <p className="text-xs text-violet-800">{referral}</p>
          </CardContent>
        </Card>
      )}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back</Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={reset}>Restart</Button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case STEP_KEYS.START:
        return (
          <Q question="Type of hematuria confirmed on urinalysis?" options={[
            { label: "Microscopic hematuria (≥5 RBC/HPF, urine looks normal)", next: STEP_KEYS.MACRO_MICRO, key: "type", value: "microscopic" },
            { label: "Macroscopic / gross hematuria (visibly red/cola/tea urine)", next: STEP_KEYS.MACRO_COLOR, key: "type", value: "macroscopic" },
          ]} />
        );

      // ──────── MICROSCOPIC BRANCH ────────
      case STEP_KEYS.MACRO_MICRO:
        return (
          <Q question="Is the child symptomatic?" options={[
            { label: "Yes — has symptoms (UTI sx, loin pain, dysuria, stones hx, recent pharyngitis, rash/joint pain)", next: STEP_KEYS.MICRO_SYMPTOMATIC, key: "micro_sx", value: "yes" },
            { label: "No — completely asymptomatic", next: STEP_KEYS.MICRO_ASYMPTOMATIC, key: "micro_sx", value: "no" },
          ]} />
        );

      case STEP_KEYS.MICRO_ASYMPTOMATIC:
        return (
          <Q question="Risk features present?" options={[
            { label: "None — no proteinuria, normal BP, no family hx CKD/deafness, -ve urine culture", next: STEP_KEYS.MICRO_ASYM_FAMILY, key: "micro_risk", value: "none" },
            { label: "Proteinuria and/or hypertension and/or abnormal renal function", next: STEP_KEYS.GN_WORKUP, key: "micro_risk", value: "gn_features" },
            { label: "Family history of renal failure / GN / deafness", next: STEP_KEYS.FAMILY_POSITIVE, key: "micro_risk", value: "family" },
          ]} />
        );

      case STEP_KEYS.MICRO_ASYM_FAMILY:
        return (
          <Q question="Test parents/siblings for hematuria:" options={[
            { label: "Positive — family members also have hematuria", next: STEP_KEYS.FAMILY_POSITIVE, key: "family_test", value: "positive" },
            { label: "Negative — no family hematuria", next: STEP_KEYS.MICRO_ASYM_WORKUP, key: "family_test", value: "negative" },
          ]} />
        );

      case STEP_KEYS.FAMILY_POSITIVE:
        return (
          <Result title="Benign Familial Hematuria / Alport Syndrome Evaluation" color="amber"
            items={[
              "COL4A3 / COL4A4 / COL4A5 gene panel (Alport syndrome)",
              "Audiometry (sensorineural hearing loss — Alport)",
              "Slit-lamp eye examination (anterior lenticonus — Alport)",
              "Skin biopsy for type IV collagen (if gene panel unavailable)",
              "Renal biopsy: electron microscopy — GBM thinning / lamellation",
              "If COL4A3/A4 heterozygous: Thin Basement Membrane Nephropathy (TBMN)",
              "Annual urine PCR, BP, eGFR — watch for proteinuria progression",
            ]}
            referral="Paediatric nephrology for Alport/TBMN workup and genetic counselling"
          />
        );

      case STEP_KEYS.MICRO_ASYM_WORKUP:
        return (
          <Q question="Calcium/crystalluria workup result?" options={[
            { label: "Abnormal calcium:creatinine ratio or crystalluria", next: STEP_KEYS.CRYSTALLURIA_WORKUP, key: "ca_workup", value: "abnormal" },
            { label: "Normal urine calcium — but abnormal renal USS", next: STEP_KEYS.RESULT, key: "ca_workup", value: "normal_usg_abnormal" },
            { label: "All normal — isolated microscopic hematuria", next: STEP_KEYS.RESULT, key: "ca_workup", value: "all_normal" },
          ]} />
        );

      case STEP_KEYS.CRYSTALLURIA_WORKUP:
        return (
          <Result title="Crystalluria / Hypercalciuria Workup" color="amber"
            items={[
              "Spot urine Ca:Cr ratio (normal <0.2 in >5y, <0.4 in <2y)",
              "24h urine: calcium, uric acid, oxalate, citrate, phosphate",
              "Serum calcium, phosphate, PTH, vitamin D",
              "Renal USS (nephrocalcinosis, renal stones)",
              "If hypercalciuria confirmed: low calcium diet, increase fluid, potassium citrate",
              "If nephrocalcinosis: check dRTA (urine pH, serum HCO3)",
            ]}
            referral="Paediatric nephrology / metabolic stone clinic"
          />
        );

      case STEP_KEYS.MICRO_SYMPTOMATIC:
        return (
          <Q question="Predominant symptom pattern?" options={[
            { label: "LUTS — dysuria, frequency, urgency (UTI symptoms)", next: STEP_KEYS.UTI_WORKUP, key: "micro_sym_type", value: "uti" },
            { label: "History of hematuria with stone passage / loin-to-groin pain", next: STEP_KEYS.UROLITHIASIS_WORKUP, key: "micro_sym_type", value: "stones" },
            { label: "Proteinuria + hypertension + abnormal renal function / family hx deafness", next: STEP_KEYS.GN_WORKUP, key: "micro_sym_type", value: "gn" },
          ]} />
        );

      case STEP_KEYS.GN_WORKUP:
        return (
          <Result title="Glomerulonephritis / Alport Syndrome Workup" color="blue" urgent
            items={[
              "Urine protein:creatinine ratio (PCR), 24h urine protein",
              "Phase-contrast microscopy: dysmorphic RBCs (>80%) / acanthocytes",
              "Blood: Cr, BUN, eGFR, albumin, CBC, electrolytes",
              "Complement: C3, C4 (low in PSGN, SLE, MPGN)",
              "Serology: ANA, anti-dsDNA, ANCA (pANCA/cANCA), anti-GBM",
              "ASO titer / anti-DNase B (if recent sore throat/impetigo)",
              "HBsAg, anti-HCV (secondary GN)",
              "Renal USS: size, echogenicity, doppler",
              "Audiometry + slit-lamp (if Alport suspected)",
              "Renal biopsy if: persistent, progressive, or severe proteinuria",
            ]}
            referral="Urgent paediatric nephrology referral — biopsy decision within 1–2 weeks"
          />
        );

      // ──────── MACROSCOPIC BRANCH ────────
      case STEP_KEYS.MACRO_COLOR:
        return (
          <Q question="Urine colour and urinalysis features?" options={[
            { label: "Bright red / pink — no dysmorphic RBCs, no casts, non-significant proteinuria", next: STEP_KEYS.NON_GLOMERULAR_WORKUP, key: "macro_color", value: "non_glom" },
            { label: "Cola / tea / brown — dysmorphic RBCs >15%, cellular/RBC casts, significant proteinuria", next: STEP_KEYS.GLOMERULAR_WORKUP, key: "macro_color", value: "glom" },
          ]} />
        );

      case STEP_KEYS.NON_GLOMERULAR_WORKUP:
        return (
          <Q question="Non-glomerular hematuria — associated features?" options={[
            { label: "Dysuria / abdominal pain → suspect UTI", next: STEP_KEYS.UTI_WORKUP, key: "non_glom_cause", value: "uti" },
            { label: "Loin-to-groin pain / stone passage → suspect urolithiasis", next: STEP_KEYS.UROLITHIASIS_WORKUP, key: "non_glom_cause", value: "stones" },
            { label: "Hypercalciuria features (recurrent painless hematuria)", next: STEP_KEYS.HYPERCALCIURIA_WORKUP, key: "non_glom_cause", value: "hypercalciuria" },
            { label: "Abdominal mass / flank mass → suspect renal tumour", next: STEP_KEYS.RENAL_MASS_WORKUP, key: "non_glom_cause", value: "mass" },
            { label: "Recent trauma / sport injury", next: STEP_KEYS.TRAUMA_WORKUP, key: "non_glom_cause", value: "trauma" },
          ]} />
        );

      case STEP_KEYS.GLOMERULAR_WORKUP:
        return (
          <Q question="Family history in 1st degree relatives?" options={[
            { label: "Positive — family history of renal failure / GN / deafness", next: STEP_KEYS.FAMILY_POSITIVE, key: "glom_family", value: "positive" },
            { label: "Negative — no family history", next: STEP_KEYS.RESULT, key: "glom_family", value: "negative" },
          ]} />
        );

      case STEP_KEYS.UTI_WORKUP:
        return (
          <Result title="UTI Workup" color="green"
            items={[
              "Urine culture and sensitivity (mid-stream clean catch)",
              "Urine dipstick: nitrites, leucocytes, blood",
              "Renal-bladder USS (if febrile UTI or first UTI in child <2y)",
              "DMSA scan at 4–6 weeks (if febrile UTI, renal scarring suspected)",
              "VCUG / MCU if: recurrent UTIs, grade III–V on DMSA, structural anomaly on USS",
              "X-ray KUB: if calculi or radio-opaque stones suspected",
              "Treat with culture-directed antibiotics; review VUR status post-treatment",
            ]}
            referral="Paediatric nephrology / urology if recurrent, structural anomaly or VUR grade III+"
          />
        );

      case STEP_KEYS.UROLITHIASIS_WORKUP:
        return (
          <Result title="Urolithiasis / Renal Stones Workup" color="amber"
            items={[
              "Serum: calcium, phosphate, uric acid, bicarbonate, creatinine",
              "Spot urine Ca:Cr ratio; 24h urine calcium, uric acid, oxalate, citrate",
              "Serum albumin and protein (rule out hypercalcaemia of malignancy)",
              "Renal USS (first-line — stone, hydronephrosis, nephrocalcinosis)",
              "Non-contrast CT KUB (if USS inconclusive, for accurate stone sizing)",
              "Stone analysis (if stone passed/retrieved)",
              "If cystinuria suspected: urinary cystine, ornithine, arginine, lysine (COAL)",
              "If PH1 suspected: urine oxalate, AGXT gene mutation",
            ]}
            referral="Paediatric nephrology + urology for stone removal if obstructive; metabolic stone clinic"
          />
        );

      case STEP_KEYS.HYPERCALCIURIA_WORKUP:
        return (
          <Result title="Hypercalciuria Workup" color="amber"
            items={[
              "Spot urine Ca:Cr ratio (normal <0.21 mg/mg in children >5y)",
              "24h urine calcium (>4 mg/kg/day = hypercalciuria)",
              "Serum: calcium, phosphate, PTH, 25-OH Vit D, creatinine",
              "Renal USS (nephrocalcinosis, medullary sponge kidney)",
              "If nephrocalcinosis: dRTA workup (urine pH post NH4Cl load, serum HCO3)",
              "Dietary calcium restriction (avoid excess), increase fluid intake",
              "Thiazide diuretics if severe/persistent hypercalciuria",
            ]}
          />
        );

      case STEP_KEYS.RENAL_MASS_WORKUP:
        return (
          <Result title="Renal Mass / Tumour Workup" urgent color="blue"
            items={[
              "Renal-bladder USS (urgent — Wilms tumour most common in <5y)",
              "CECT abdomen: staging, IVC involvement, contralateral kidney",
              "DTPA/MAG3 scan: differential renal function",
              "VCU (if bladder involvement suspected)",
              "Chest CT (staging for Wilms tumour)",
              "Serum: AFP (hepatoblastoma if liver mass coexists), LDH",
              "Refer to paediatric oncology / urology urgently",
            ]}
            referral="Urgent paediatric oncology + urology referral"
          />
        );

      case STEP_KEYS.TRAUMA_WORKUP:
        return (
          <Result title="Renal Trauma Workup" color="blue"
            items={[
              "CECT abdomen (gold standard for renal trauma grading — AAST scale)",
              "USS Abdomen: quick bedside screening",
              "Angiography if vascular injury suspected (renal artery/vein)",
              "Grade I–II: conservative management, bed rest, serial USS",
              "Grade III–V: urology/interventional radiology consultation",
              "Monitor BP, urine output, serial haematocrit, renal function",
            ]}
            referral="Paediatric surgery / urology for grade III+ renal trauma"
          />
        );

      case STEP_KEYS.RESULT:
        if (answers.ca_workup === "all_normal") {
          return (
            <Result title="Isolated Asymptomatic Microscopic Hematuria — Monitoring" color="green"
              items={[
                "Reassure parents — most resolve spontaneously",
                "Repeat urine dipstick + microscopy at 3–6 months",
                "Annual BP, urine PCR, eGFR check",
                "No activity restriction required",
                "Refer nephrology if: persists >12 months, proteinuria develops, BP rises, family hx CKD/deafness",
                "No imaging required unless structural anomaly suspected",
              ]}
            />
          );
        }
        if (answers.ca_workup === "normal_usg_abnormal") {
          return (
            <Result title="Abnormal Renal USS — Urological Hematuria / Anatomic Disease" color="amber"
              items={[
                "Evaluate for: ureteropelvic junction obstruction, MCDK, renal cyst, structural anomaly",
                "DTPA / MAG3 scan: differential function + drainage",
                "VCUG if VUR suspected",
                "Refer to paediatric urology for anatomic cause management",
              ]}
              referral="Paediatric urology + nephrology co-referral"
            />
          );
        }
        // glom_family negative
        return (
          <Result title="Glomerular Hematuria — Investigate for GN" color="blue" urgent
            items={[
              "Check for: Post-streptococcal GN (High ASO, low C3) — most common",
              "IgA Nephropathy: serum IgA (not sensitive); confirm by biopsy",
              "Non-PSGN IgA nephropathy: RFT, serology (ANA, ANCA, anti-GBM)",
              "Natural history: PSGN usually resolves; IgA may progress",
              "Biopsy if: proteinuria persists >3 months, eGFR declining, natural course not followed",
              "If PSGN: supportive — antihypertensives, diuretics; follow up 6 months",
              "If biopsy shows IgA: KDIGO-based therapy (RAS blockade ± steroids)",
            ]}
            referral="Paediatric nephrology — biopsy decision and long-term follow-up"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-rose-700 to-red-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Hematuria Decision Engine</h3>
            <p className="text-xs text-rose-200">Jaypee Figs 1.2–1.4 · Microscopic & Macroscopic · Glomerular vs Non-Glomerular</p>
          </div>
        </div>
      </div>

      {/* Progress breadcrumb */}
      {history.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {history.map((h, i) => (
            <span key={i} className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs px-2 py-0.5 text-slate-500">{h.replace(/_/g, " ").slice(0, 20)}</Badge>
              {i < history.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300" />}
            </span>
          ))}
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Badge className="text-xs px-2 py-0.5 bg-rose-600">{step.replace(/_/g, " ").slice(0, 20)}</Badge>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          {renderStep()}
        </CardContent>
      </Card>

      {history.length > 0 && step !== STEP_KEYS.RESULT && (
        <Button variant="outline" size="sm" className="w-full" onClick={back}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Button>
      )}

      {/* Reference note */}
      <div className="text-xs text-slate-400 text-center px-2">
        Ref: Jaypee Pediatric Nephrology, Fig 1.2–1.4 · ISKDC · KDIGO · AAP UTI Guidelines
      </div>
    </div>
  );
}