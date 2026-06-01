import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, ChevronRight, Activity, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// References: KDIGO CKD 2012 · IPNA · ISKDC · ISPN

const STEPS = {
  START: "start",
  DIPSTICK: "dipstick",
  TRACE: "trace",
  ONE_PLUS: "one_plus",
  PCR_RESULT: "pcr_result",
  LOW_PCR: "low_pcr",
  HIGH_PCR_24H: "high_pcr_24h",
  POSTURAL: "postural",
  SIGNIFICANT: "significant",
  HISTORY: "history",
  INVESTIGATIONS: "investigations",
  BIOPSY_INDICATIONS: "biopsy_indications",
  TUBULAR_WORKUP: "tubular_workup",
  TREATMENT: "treatment",
};

const InfoBox = ({ title, color = "blue", items, urgent, referral, children }) => {
  const styles = { blue: "border-blue-300 bg-blue-50", green: "border-green-300 bg-green-50", amber: "border-amber-300 bg-amber-50", red: "border-red-300 bg-red-50", violet: "border-violet-300 bg-violet-50", slate: "border-slate-200 bg-slate-50" };
  const titleC = { blue: "text-blue-900", green: "text-green-900", amber: "text-amber-900", red: "text-red-900", violet: "text-violet-900", slate: "text-slate-800" };
  return (
    <Card className={`border-2 ${styles[color]}`}>
      <CardContent className="p-4 space-y-2">
        {urgent && <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs"><AlertTriangle className="w-3.5 h-3.5" />Urgent</div>}
        <p className={`font-bold text-sm ${titleC[color]}`}>{title}</p>
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
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all text-left">
          <span className="text-sm font-medium text-slate-700 leading-snug">{opt.label}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
        </button>
      ))}
    </div>
  </div>
);

export default function ProteinuriaEngine() {
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

      case STEPS.START:
        return (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p className="font-bold text-slate-800 text-sm">Proteinuria — Key Definitions</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Normal", "<4 mg/m²/hr or UPCR <0.02 g/mmol (0.2 mg/mg)"],
                  ["Significant", ">40 mg/m²/hr or UPCR >0.02 g/mmol"],
                  ["Nephrotic range", ">1 g/1.73m²/day or UPCR >0.2 g/mmol (2 mg/mg)"],
                  ["Dipstick ≥2+", "Suggestive of glomerular proteinuria"],
                ].map(([k, v], i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg p-2">
                    <p className="font-bold text-xs text-slate-800">{k}</p>
                    <p className="text-xs text-slate-600">{v}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">Always use early morning urine to exclude orthostatic proteinuria</p>
            </div>
            <Q question="Urine dipstick result?" onSelect={go} options={[
              { label: "Trace", next: STEPS.TRACE, key: "dipstick", value: "trace" },
              { label: "1+ or more (≥1+)", next: STEPS.ONE_PLUS, key: "dipstick", value: "1+" },
            ]} />
          </div>
        );

      case STEPS.TRACE:
        return (
          <div className="space-y-3">
            <InfoBox title="Dipstick Trace — Management" color="green"
              items={[
                "Repeat urine dipstick protein (fresh early morning specimen)",
                "If still trace: reassure",
                "Repeat urine dipstick at 6 months to 1 year",
                "Consider discharge if urine dipstick protein negative or trace on repeat",
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.ONE_PLUS:
        return (
          <div className="space-y-3">
            <InfoBox title="Dipstick ≥1+ — Next Step" color="blue"
              items={[
                "Obtain first morning urine sample",
                "Urine protein:creatinine ratio (PCR) — early morning to exclude orthostatic",
                "Urine microscopy (haematuria, casts, cells)",
                "If repeat dipstick also ≥1+, proceed to full evaluation",
              ]}
            />
            <Q question="Early morning urine PCR result?" onSelect={go} options={[
              { label: "UPCR >0.02 g/mmol (>0.2 mg/mg) ± microscopic haematuria", next: STEPS.HIGH_PCR_24H, key: "pcr", value: "high" },
              { label: "UPCR ≤0.02 g/mmol AND no microscopic haematuria", next: STEPS.LOW_PCR, key: "pcr", value: "low" },
            ]} />
          </div>
        );

      case STEPS.LOW_PCR:
        return (
          <div className="space-y-3">
            <Q question="Urine dipstick protein on repeat (same specimen)?" onSelect={go} options={[
              { label: "Repeat ≥1+ on early morning urine", next: STEPS.HIGH_PCR_24H },
              { label: "Negative or trace — likely false positive or transient", next: "transient" },
            ]} />
          </div>
        );

      case "transient":
        return (
          <div className="space-y-3">
            <InfoBox title="Transient / Functional Proteinuria" color="green"
              items={[
                "Causes: fever, exercise, dehydration, emotional stress, seizures",
                "Clears when precipitating factor resolves",
                "No further workup needed if single occurrence",
                "Consider orthostatic proteinuria if only present in upright posture",
              ]}
            >
              <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                <p className="text-xs font-bold text-amber-900">Orthostatic (Postural) Proteinuria:</p>
                {["24h urine total protein (split: 4h supine + 20h upright)", "Kidney Doppler USS (exclude nutcracker syndrome)", "Diagnosis: protein absent/minimal in supine sample", "Excellent prognosis — no specific treatment"].map((c, i) => <p key={i} className="text-xs text-amber-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.HIGH_PCR_24H:
        return (
          <div className="space-y-3">
            <Q question="24-hour urine total protein?" onSelect={go} options={[
              { label: "≤0.3 g/1.73m²/day — mild/borderline", next: "mild_24h", key: "24h", value: "low" },
              { label: ">0.3 g/1.73m²/day — significant proteinuria", next: STEPS.SIGNIFICANT, key: "24h", value: "high" },
            ]} />
          </div>
        );

      case "mild_24h":
        return (
          <div className="space-y-3">
            <InfoBox title="Mild Proteinuria — Monitoring" color="green"
              items={[
                "Repeat urine tests every 6–12 months",
                "Monitor BP, eGFR",
                "Dietary protein: avoid excess; follow age-appropriate recommended intake",
                "Reassess if UPCR increases or haematuria develops",
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.SIGNIFICANT:
        return (
          <div className="space-y-3">
            <Alert className="border-orange-300 bg-orange-50"><AlertTriangle className="w-4 h-4 text-orange-600" /><AlertDescription className="text-orange-800 text-xs font-bold">{"Significant proteinuria >0.3 g/1.73m²/day — detailed evaluation required"}</AlertDescription></Alert>
            <Q question="Is this nephrotic syndrome?" note="Nephrotic: heavy proteinuria + hypoalbuminaemia + oedema ± hyperlipidaemia"
              onSelect={go} options={[
                { label: "YES — nephrotic range (>1 g/1.73m²/day, oedema, low albumin)", next: "nephrotic_refer" },
                { label: "NO — significant but sub-nephrotic proteinuria", next: STEPS.HISTORY },
              ]} />
          </div>
        );

      case "nephrotic_refer":
        return (
          <div className="space-y-3">
            <InfoBox title="Nephrotic Syndrome — Management" color="red" urgent
              items={[
                "Serum albumin, cholesterol, triglycerides, creatinine, electrolytes",
                "24h urine protein or UPCR", "CBC, coagulation screen (thrombosis risk)",
                "Urine microscopy (haematuria pattern — SRNS vs SSNS)",
                "Renal USS",
                "Blood pressure",
                "If typical SSNS (age 1–12y, no haematuria, normal C3, no HTN): trial prednisolone — NO biopsy",
                "If atypical features: biopsy before or after failed steroid trial",
              ]}
              referral="Paediatric nephrology — ISKDC/IPNA Nephrotic Syndrome protocol"
            />
            <NavBtns />
          </div>
        );

      case STEPS.HISTORY:
        return (
          <div className="space-y-3">
            <InfoBox title="Focused History for Significant Proteinuria" color="slate"
              items={[
                "GN symptoms: oedema, haematuria, polyuria, nocturia",
                "Connective tissue disease: rashes, joint pain, arthritis, fever",
                "Congenital kidney abnormalities or recurrent UTIs",
                "Drug history: NSAIDs, traditional medicines, lithium, aminoglycosides",
                "Family history: PKD, CKD, deafness, nephrotic syndrome",
                "Growth: poor weight gain, short stature → CKD or tubular disorder",
                "Physical: BP, oedema sites, rickets signs, dysmorphic features",
              ]}
            />
            <Button className="w-full" onClick={() => go(STEPS.INVESTIGATIONS)}>Proceed to Investigations →</Button>
            <NavBtns />
          </div>
        );

      case STEPS.INVESTIGATIONS:
        return (
          <div className="space-y-3">
            <InfoBox title="Investigations for Significant Proteinuria" color="blue"
              items={[
                "Serum: urea, creatinine, electrolytes, eGFR",
                "Serum albumin, total cholesterol",
                "Serum complement C3 and C4",
                "Serum IgA (IgA nephropathy)",
                "ANA + anti-dsDNA antibodies (if indicated — SLE)",
                "ANCA (vasculitis), anti-GBM (Goodpasture)",
                "Hepatitis B + C, HIV serology (secondary GN)",
                "Urine LMW protein:creatinine (if tubulopathy suspected):",
                "— β₂-microglobulin:Cr >0.04 mg/mmol; α1-microglobulin:Cr >2.2 mg/mmol",
                "— Retinol-binding protein >0.024 mg/mmol",
                "Genetic mutation screen (if indicated)",
                "Audiometry (if sensorineural hearing loss suspected)",
                "Kidney USS (scarring, CAKUT, cysts, medullary nephrocalcinosis)",
                "Kidney Doppler USS (exclude nutcracker if orthostatic proteinuria)",
              ]}
            />
            <Button className="w-full" onClick={() => go(STEPS.BIOPSY_INDICATIONS)}>Check Biopsy Indications →</Button>
            <NavBtns />
          </div>
        );

      case STEPS.BIOPSY_INDICATIONS:
        return (
          <div className="space-y-3">
            <InfoBox title="Indications for Kidney Biopsy" color="violet" urgent
              items={[
                "1. Persistent significant proteinuria >1 g/1.73m²/day OR UPCR >0.05 g/mmol in child >2y",
                "   Exception: Typical SSNS (no biopsy before steroid trial)",
                "2. Proteinuria with urinary sediment abnormalities (haematuria, casts)",
                "3. Decreased GFR <60 ml/1.73m²/min",
                "   Exception: Recovering from acute GN — biopsy if GFR remains low at 1 month",
                "4. Persistently low serum C3 >3 months",
                "5. Collagen vascular disease / vasculitis (SLE, IgA vasculitis, ANCA) serologically or clinically",
              ]}
              referral="Paediatric nephrology for biopsy decision"
            />
            <Button className="w-full" onClick={() => go(STEPS.TREATMENT)}>Treatment Options →</Button>
            <NavBtns />
          </div>
        );

      case STEPS.TREATMENT:
        return (
          <div className="space-y-3">
            <InfoBox title="Treatment for Significant Non-Nephrotic Proteinuria" color="green"
              items={[
                "Dietary protein: avoid excess protein; follow age-specific SDI",
                "RAAS blockade (ACEi/ARB): first-line antiproteinuric therapy",
                "— Enalapril 0.1–0.5 mg/kg/day; Losartan 0.7–1.4 mg/kg/day",
                "High-dose CoQ10 if genetic defect in CoQ10 biosynthesis (COQ2, PDSS2, COQ6, ADCK4):",
                "— Start 30 mg/kg/day in 3 divided doses → 50 mg/kg/day (max 2400 mg/day adults)",
                "— Decrease in proteinuria expected in 4–6 weeks",
                "Immunosuppression: only after biopsy confirms immune-mediated GN",
                "Treat underlying cause (SLE, vasculitis, infection-related GN)",
                "Monitor: UPCR every 1–3 months, BP, eGFR, serum albumin, electrolytes",
              ]}
            />
            <NavBtns />
          </div>
        );

      default:
        return <Button onClick={reset}>Restart</Button>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Proteinuria Approach Engine</h3>
            <p className="text-xs text-blue-200">KDIGO CKD 2012 · IPNA · ISKDC · ISPN</p>
          </div>
        </div>
      </div>
      {history.length > 0 && <Badge variant="outline" className="text-xs">Step {history.length + 1}</Badge>}
      <Card><CardContent className="p-4">{renderStep()}</CardContent></Card>
      <div className="text-xs text-slate-400 text-center">KDIGO CKD 2012 · IPNA Clinical Practice Recommendations · ISKDC · ISPN Guidelines</div>
    </div>
  );
}