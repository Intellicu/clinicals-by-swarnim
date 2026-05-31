import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, ChevronRight, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

// Reference: Yap HK (2008) Comprehensive Pediatric Nephrology; Hoppe B et al. Pediatr Nephrol

const STEPS = {
  START: "start",
  PRESENTATION: "presentation",
  IMAGING: "imaging",
  STONE_FOUND: "stone_found",
  STONE_ANALYSIS: "stone_analysis",
  METABOLIC_EVAL: "metabolic_eval",
  CALCIUM_STONE: "calcium_stone",
  HYPERCALCIURIA: "hypercalciuria",
  HYPEROXALURIA: "hyperoxaluria",
  STRUVITE: "struvite",
  CYSTINE: "cystine",
  URIC_ACID: "uric_acid",
  NEPHROCALCINOSIS: "nephrocalcinosis",
  ACUTE_MANAGEMENT: "acute_management",
  PREVENTION: "prevention",
  INTERVENTIONAL: "interventional",
};

const InfoBox = ({ title, color = "blue", items, children, referral }) => {
  const styles = { blue: "border-blue-300 bg-blue-50", green: "border-green-300 bg-green-50", amber: "border-amber-300 bg-amber-50", red: "border-red-300 bg-red-50", violet: "border-violet-300 bg-violet-50", slate: "border-slate-200 bg-slate-50" };
  const titleC = { blue: "text-blue-900", green: "text-green-900", amber: "text-amber-900", red: "text-red-900", violet: "text-violet-900", slate: "text-slate-800" };
  return (
    <Card className={`border-2 ${styles[color]}`}>
      <CardContent className="p-4 space-y-2">
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
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 transition-all text-left">
          <span className="text-sm font-medium text-slate-700 leading-snug">{opt.label}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
        </button>
      ))}
    </div>
  </div>
);

export default function NephrocalcinosisStoneEngine() {
  const [step, setStep] = useState(STEPS.START);
  const [history, setHistory] = useState([]);

  const go = (next) => { setHistory(h => [...h, step]); setStep(next); };
  const back = () => { const prev = history[history.length - 1]; if (prev) { setHistory(h => h.slice(0, -1)); setStep(prev); } };
  const reset = () => { setStep(STEPS.START); setHistory([]); };

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
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="font-bold text-amber-900 text-sm mb-2">Typical Presentations of Stone Disease in Children:</p>
              {["Sudden intense loin pain radiating to lower abdomen or groin (renal colic)", "Gross haematuria with/without abdominal pain", "Dysuria and urgency with/without UTI", "Asymptomatic — incidental on imaging", "Recurrent UTIs or abdominal pain episodes"].map((c, i) => <p key={i} className="text-xs text-amber-800">• {c}</p>)}
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="font-bold text-slate-800 text-xs mb-1">Key History Points:</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
                {["Stone passage / sediments", "Oxalate-rich foods / cola / milk", "Fluid intake habits", "Drug/vitamin intake (Vit D excess)", "GI disorders (fat malabsorption)", "Prolonged immobilisation", "Prematurity / diuretic use", "Hearing loss (Bartter)", "Family history stones (40%)", "Congenital anomalies"].map((c, i) => <span key={i}>• {c}</span>)}
              </div>
            </div>
            <Q question="Starting point:" onSelect={go} options={[
              { label: "Stone identified on imaging — proceed to workup", next: STEPS.STONE_FOUND },
              { label: "Symptoms/signs of stone but no stone on USS — further imaging", next: STEPS.IMAGING },
              { label: "Nephrocalcinosis found on USS", next: STEPS.NEPHROCALCINOSIS },
              { label: "Acute stone colic — management", next: STEPS.ACUTE_MANAGEMENT },
            ]} />
          </div>
        );

      case STEPS.IMAGING:
        return (
          <div className="space-y-3">
            <InfoBox title="Imaging for Suspected Urolithiasis" color="blue"
              items={[
                "Renal-bladder USS: first-line — detects stones >2mm, hydronephrosis",
                "Plain X-ray KUB: radio-opaque stones (calcium oxalate, calcium phosphate, struvite)",
                "Non-contrast CT KUB: GOLD STANDARD — most sensitive, detects all stone types including radiolucent; ureteral stones; 1mm stones",
                "MAG3 diuretic renogram: assess obstruction + differential renal function",
                "Urology consultation if stone >5mm or obstruction",
              ]}
            />
            <Button className="w-full" onClick={() => go(STEPS.STONE_FOUND)}>Stone confirmed — proceed to analysis →</Button>
            <NavBtns />
          </div>
        );

      case STEPS.STONE_FOUND:
        return (
          <div className="space-y-3">
            <Q question="Stone retrieved/passed?" onSelect={go} options={[
              { label: "YES — stone available for analysis", next: STEPS.STONE_ANALYSIS },
              { label: "NO — stone not retrieved", next: STEPS.METABOLIC_EVAL },
            ]} />
          </div>
        );

      case STEPS.STONE_ANALYSIS:
        return (
          <div className="space-y-3">
            <InfoBox title="Stone Analysis Methods" color="amber"
              items={["Chemical analysis — basic composition", "Infrared spectroscopy — preferred (amounts <1mg can be analysed)", "X-ray diffraction — for crystal structure determination"]}
            />
            <Q question="Stone composition?" onSelect={go} options={[
              { label: "Calcium oxalate / Calcium phosphate", next: STEPS.CALCIUM_STONE },
              { label: "Struvite (magnesium ammonium phosphate — infected)", next: STEPS.STRUVITE },
              { label: "Cystine", next: STEPS.CYSTINE },
              { label: "Uric acid / 2,8-dihydroxyadenine", next: STEPS.URIC_ACID },
            ]} />
          </div>
        );

      case STEPS.METABOLIC_EVAL:
        return (
          <div className="space-y-3">
            <InfoBox title="Complete Metabolic Evaluation" color="blue"
              note="Every child with urolithiasis — metabolic abnormality in 42–84%"
              items={[
                "Blood: serum creatinine, calcium, phosphate, bicarbonate, uric acid, potassium, magnesium, PTH, Vit D metabolites",
                "Step 3a — Spot urine molar ratios (Cr-based): Ca, oxalate, uric acid, citrate, magnesium",
                "Spot urine Ca:Cr ratio (normal <0.21 mg/mg in >5y)",
                "Cystine screening: nitroprusside test → quantitative if positive",
                "Step 3b — 24h urine: Ca, oxalate, uric acid, citrate, cystine, creatinine, protein, magnesium",
                "Urine culture (rule out infection-related struvite stones)",
              ]}
            >
              <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                <p className="text-xs font-bold text-slate-800">Metabolic abnormalities to identify:</p>
                {["Hypercalciuria (most common — 40%)", "Hypocitraturia", "Hyperoxaluria (primary or secondary)", "Hyperuricosuria", "Cystinuria", "Xanthinuria", "2,8-Dihydroxyadenine crystalluria"].map((c, i) => <p key={i} className="text-xs text-slate-700">• {c}</p>)}
              </div>
            </InfoBox>
            <Q question="Metabolic finding?" onSelect={go} options={[
              { label: "Hypercalciuria", next: STEPS.HYPERCALCIURIA },
              { label: "Hyperoxaluria", next: STEPS.HYPEROXALURIA },
              { label: "Cystinuria", next: STEPS.CYSTINE },
              { label: "Uric acid / hyperuricosuria", next: STEPS.URIC_ACID },
              { label: "Struvite (infection-related)", next: STEPS.STRUVITE },
            ]} />
          </div>
        );

      case STEPS.CALCIUM_STONE:
      case STEPS.HYPERCALCIURIA:
        return (
          <div className="space-y-3">
            <InfoBox title="Hypercalciuria — Evaluation & Management" color="amber"
              items={[
                "Exclude causes of hypercalcaemia (PTH, Vit D, sarcoidosis, malignancy)",
                "Distinguish types: Absorptive / Renal / Resorptive hypercalciuria",
                "Repeat 24h urine Ca after 7-day low-calcium diet (400 mg/day) — distinguishes absorptive from renal",
              ]}
            >
              <div className="space-y-2 mt-2">
                <p className="text-xs font-bold text-slate-800">Management:</p>
                <div className="p-2 bg-green-50 rounded-lg space-y-1 text-xs">
                  <p className="font-bold text-green-900">Dietary measures:</p>
                  {["Avoid excessive animal protein (increases urinary Ca)", "Low-sodium diet (enhances Ca tubular reabsorption)", "Adequate potassium intake (fruits/vegetables)", "Maintain normal dietary calcium (low Ca → ↑oxalate absorption)", "Avoid Vitamin D supplementation (↑Ca absorption)", "High fluid intake: maintain 24h urine output (Infants ≥750ml; <5y ≥1000ml; 5–10y ≥1500ml; >10y ≥2000ml)"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-blue-50 rounded-lg space-y-1 text-xs">
                  <p className="font-bold text-blue-900">Thiazide diuretics (if dietary measures fail 3–6 months):</p>
                  <p className="text-blue-800">• Hydrochlorothiazide 1–1.5 mg/kg 12–24 hourly (max 50 mg/dose)</p>
                  <p className="text-blue-800">• Addition of amiloride increases Ca reabsorption in collecting tubule</p>
                  <p className="text-blue-800">• Avoid hypokalaemia (intracellular acidosis → ↑citrate metabolism)</p>
                </div>
                <div className="p-2 bg-violet-50 rounded-lg space-y-1 text-xs">
                  <p className="font-bold text-violet-900">If persistent hypercalciuria:</p>
                  <p className="text-violet-800">• Potassium citrate 2–3 mmol/kg/day (adult 30–80 mmol/day)</p>
                  <p className="text-violet-800">• Neutral phosphate (orthophosphate) — reduces Ca excretion, ↑inhibitors</p>
                  <p className="text-violet-800">• AVOID sodium bicarbonate/sodium citrate (↑urinary Ca and citrate loss)</p>
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.HYPEROXALURIA:
        return (
          <div className="space-y-3">
            <InfoBox title="Hyperoxaluria Management" color="amber"
              items={[
                "Primary hyperoxaluria: see dedicated PH1/PH2/PH3 engine (lumasiran, B6, transplant)",
                "Secondary hyperoxaluria management:",
              ]}
            >
              <div className="p-2 bg-amber-50 rounded-lg text-xs space-y-1">
                {["Avoid oxalate-rich foods (spinach, rhubarb, chocolate, nuts, tea)", "Low-fat diet if fat malabsorption (reduces enteric hyperoxaluria)", "Adequate calcium intake (binds intestinal oxalate → reduces absorption)", "Magnesium 6 mg/kg/day (max 200–400 mg/day) — inhibitor of CaOx precipitation", "Potassium citrate / orthophosphate supplementation", "Pyridoxine (Vit B6) — may reduce oxalate in PH1", "Cholestyramine if fat malabsorption — binds bile acids + oxalate"].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.STRUVITE:
        return (
          <div className="space-y-3">
            <InfoBox title="Struvite Stones (Infection-Related)" color="red"
              items={[
                "Associated with urease-producing organisms (Proteus, Klebsiella, Pseudomonas)",
                "Urine culture + sensitivity — targeted antibiotic therapy",
                "Prevention/treat infection — critical to prevent recurrence",
                "Staghorn calculi: urology referral for surgical removal",
                "Repeat USS 3-monthly until stone-free",
                "Prophylactic antibiotics if VUR or structural anomaly",
              ]}
              referral="Urology for staghorn calculi or persistent infection stones"
            />
            <NavBtns />
          </div>
        );

      case STEPS.CYSTINE:
        return (
          <div className="space-y-3">
            <InfoBox title="Cystinuria Management" color="violet"
              items={[
                "Urine cystine:Cr ratio + quantitative cystine excretion",
                "Alkalinisation of urine to pH 7.5–8.0 (increases cystine solubility 4-fold)",
                "Potassium citrate (preferred over sodium bicarbonate — avoid sodium load)",
                "Chelation therapy (d-penicillamine or tiopronin) if alkalinisation insufficient",
                "High fluid intake — maintain 24h urine output ≥2L/1.73m²",
                "Reduced sodium intake — decreases cystine excretion",
                "Monitor urinary cystine, urine pH, urine Ca:citrate ratio",
                "Genetic testing: SLC3A1 (rBAT) + SLC7A9 (b⁰,+AT) — AR inheritance",
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.URIC_ACID:
        return (
          <div className="space-y-3">
            <InfoBox title="Uric Acid / Hyperuricosuria / Xanthinuria Management" color="blue">
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Uric Acid Stones:</p>
                  {["Alkalinise urine to pH 7.0–7.5 (potassium citrate — NOT sodium citrate)", "Restriction of dietary purines", "Dietary sodium restriction (↓uric acid + calcium excretion)", "Allopurinol 5–10 mg/kg/day (max 300–600 mg/day); renal dose-adjust at GFR 10–50ml/min (50% dose)", "Test HLA-B*5801 in Korean/Han Chinese/Thai — Stevens-Johnson risk", "Febuxostat if allopurinol intolerance: 40–120 mg/day (adults)"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-800">Xanthinuria / 2,8-DHA crystalluria:</p>
                  {["High fluid intake", "Low purine diet", "Allopurinol 5–10 mg/kg/day (2,8-DHA: max 600–800 mg/day)"].map((c, i) => <p key={i} className="text-slate-700">• {c}</p>)}
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.NEPHROCALCINOSIS:
        return (
          <div className="space-y-3">
            <InfoBox title="Nephrocalcinosis — Grading & Workup" color="amber">
              <div className="space-y-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead><tr className="bg-amber-100"><th className="border border-amber-300 p-1.5 text-left">Grade</th><th className="border border-amber-300 p-1.5 text-left">USS Appearance</th></tr></thead>
                    <tbody>
                      {[["0", "No abnormal echogenicity of medullary pyramids"], ["I", "Mild increase in echogenicity around border of medullary pyramids"], ["II", "Mild diffuse increase in echogenicity of entire medullary pyramid"], ["III", "Greater, more homogeneous increase in echogenicity of entire medullary pyramid"]].map(([g, d], i) => (
                        <tr key={i} className="border-b border-amber-200"><td className="border border-amber-300 p-1.5 font-bold text-amber-900">{g}</td><td className="border border-amber-300 p-1.5 text-slate-700">{d}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs font-bold text-amber-900 mt-2">Causes to exclude:</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-amber-800">
                  {["Hypercalciuria (most common)", "Hyperoxaluria (PH1, secondary)", "dRTA (type 1 RTA)", "Medullary sponge kidney", "Hyperparathyroidism", "Hypercalcaemia", "Bartter syndrome", "Immobilisation", "Furosemide in preterm", "Williams syndrome"].map((c, i) => <span key={i}>• {c}</span>)}
                </div>
              </div>
            </InfoBox>
            <InfoBox title="Workup for Nephrocalcinosis" color="blue"
              items={[
                "Serum: Ca, phosphate, PTH, 25-OHVitD, creatinine, Mg, uric acid, bicarbonate",
                "Spot urine: Ca:Cr ratio, oxalate:Cr ratio, uric acid:Cr ratio, citrate:Cr ratio",
                "24h urine: Ca, oxalate, citrate, uric acid, cystine, creatinine",
                "Urine pH (fresh): post-void pH >5.5 in context of metabolic acidosis → dRTA",
                "Blood gas (for dRTA evaluation)",
                "Urine β₂-microglobulin:Cr (tubular damage)",
                "Renal USS with Doppler if medullary sponge kidney suspected",
              ]}
              referral="Paediatric nephrology + metabolic stone clinic"
            />
            <NavBtns />
          </div>
        );

      case STEPS.ACUTE_MANAGEMENT:
        return (
          <div className="space-y-3">
            <InfoBox title="Acute Stone Colic Management" color="red"
              items={[
                "Pain relief: NSAIDs (normal renal function) OR IV morphine as needed",
                "IV hydration at 1.5–2× maintenance rate",
                "Most stones <5mm pass spontaneously — even in small children",
                "Medical expulsive therapy — Tamsulosin:",
                "— Children >2y with symptomatic ureterovesical stones",
                "— Dose: 0.01 mg/kg evening (max 0.4 mg); 2–4y: 0.2mg; ≥5y: 0.4mg",
                "— Precautions: orthostatic hypotension, sulfonamide allergy (cross-reaction)",
                "Stone retrieval: urine strainer for several days — stone analysis",
                "Monitor stone movement: repeat kidney USS",
              ]}
            >
              <div className="mt-2 p-2 bg-red-50 rounded-lg">
                <p className="text-xs font-bold text-red-900">Immediate urologic intervention if:</p>
                {["Severe pain despite adequate analgesia (stone >5mm at UVJ)", "Urosepsis in obstructed system", "Anuria with complete obstruction", "AKI secondary to partial obstruction in solitary kidney or bilateral ureteral obstruction"].map((c, i) => <p key={i} className="text-xs text-red-800">• {c}</p>)}
              </div>
            </InfoBox>
            <Button className="w-full" onClick={() => go(STEPS.INTERVENTIONAL)}>Interventional options →</Button>
            <NavBtns />
          </div>
        );

      case STEPS.INTERVENTIONAL:
        return (
          <div className="space-y-3">
            <InfoBox title="Urological Interventions" color="violet"
              items={[
                "ESWL (Extracorporeal Shockwave Lithotripsy): stones <2cm; best for renal pelvis + upper ureter",
                "— CaOx monohydrate, cystine, impacted stones: less amenable (harder)",
                "— CaOx dihydrate, struvite, uric acid: fragment readily",
                "— Stent placement for stones >2cm (prevent obstruction from fragments)",
                "— Stone-free rates 70–90%",
                "Ureteroscopy + lithotomy: lower/middle ureteral stones <1.5cm; if ESWL fails",
                "Percutaneous nephrolithotomy (PCNL): renal pelvic/calyceal stones >2cm; associated calyceal dilatation or UPJ obstruction",
                "Open nephrolithotomy: failed other procedures or complex anatomy/staghorn calculi",
                "Monitoring post-intervention: USS or KUB at 1 year; if negative every 2–4 years",
              ]}
              referral="Elective indications: fails to pass 2 weeks, staghorn calculi, stones >5mm"
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
      <div className="rounded-xl bg-gradient-to-r from-amber-700 to-orange-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Gem className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Nephrocalcinosis & Urolithiasis Engine</h3>
            <p className="text-xs text-amber-200">Yap HK (2008) · Hoppe B Pediatr Nephrol · KDIGO</p>
          </div>
        </div>
      </div>
      {history.length > 0 && <Badge variant="outline" className="text-xs">Step {history.length + 1}</Badge>}
      <Card><CardContent className="p-4">{renderStep()}</CardContent></Card>
      <div className="text-xs text-slate-400 text-center">Ref: Yap HK Comprehensive Pediatric Nephrology 2008 · Hoppe B Pediatr Nephrol · KDIGO</div>
    </div>
  );
}