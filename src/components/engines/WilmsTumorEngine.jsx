/**
 * Wilms Tumor (Nephroblastoma) Diagnostic & Management Engine
 * Based on: COG (Children's Oncology Group), SIOP 2016, NWTS-5, AREN protocols
 * References: Pediatric Nephrology 2021, SIOP-RTSG, COG AREN0532/0533
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, AlertTriangle, CheckCircle, Info, Activity, Shield } from "lucide-react";

const InfoBox = ({ title, color = "blue", items, children }) => {
  const styles = {
    blue: "border-blue-300 bg-blue-50", green: "border-green-300 bg-green-50",
    amber: "border-amber-300 bg-amber-50", red: "border-red-300 bg-red-50",
    violet: "border-violet-300 bg-violet-50", orange: "border-orange-300 bg-orange-50",
    teal: "border-teal-300 bg-teal-50", indigo: "border-indigo-300 bg-indigo-50",
  };
  const titleColors = {
    blue: "text-blue-900", green: "text-green-900", amber: "text-amber-900",
    red: "text-red-900", violet: "text-violet-900", orange: "text-orange-900",
    teal: "text-teal-900", indigo: "text-indigo-900",
  };
  return (
    <div className={`rounded-xl border-2 p-3 ${styles[color]}`}>
      {title && <p className={`font-bold text-sm mb-2 ${titleColors[color]}`}>{title}</p>}
      {items && <ul className="space-y-1">{items.map((it, i) => <li key={i} className="text-xs text-slate-700 flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">→</span><span>{it}</span></li>)}</ul>}
      {children}
    </div>
  );
};

const Q = ({ question, note, explanation, options, onSelect }) => (
  <div className="space-y-2">
    <p className="font-semibold text-sm text-slate-800">{question}</p>
    {explanation && <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-600 italic">{explanation}</div>}
    {note && <p className="text-xs text-slate-500 italic">{note}</p>}
    {options.map(opt => (
      <button key={opt.label} onClick={() => onSelect(opt.next)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all text-left">
        <div>
          <span className="text-sm font-medium text-slate-700">{opt.label}</span>
          {opt.reason && <p className="text-xs text-slate-500 mt-0.5">{opt.reason}</p>}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
      </button>
    ))}
  </div>
);

const STEPS = {
  START: "start",
  IMAGING: "imaging",
  BILATERAL: "bilateral",
  UNILATERAL: "unilateral",
  STAGING: "staging",
  HISTOLOGY: "histology",
  FAVORABLE: "favorable_hist",
  ANAPLASTIC: "anaplastic",
  STAGE_I_II_FH: "stage_i_ii_fh",
  STAGE_III_IV_FH: "stage_iii_iv_fh",
  STAGE_V: "stage_v",
  GENETICS: "genetics",
  SURVEILLANCE: "surveillance",
  PREDISPOSITION: "predisposition",
};

export default function WilmsTumorEngine() {
  const [step, setStep] = useState(STEPS.START);
  const [history, setHistory] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);

  const go = (next) => { setHistory(h => [...h, step]); setStep(next); };
  const back = () => {
    const prev = history[history.length - 1];
    if (prev) { setHistory(h => h.slice(0, -1)); setStep(prev); }
  };
  const reset = () => { setStep(STEPS.START); setHistory([]); setSelectedStage(null); };

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
          <div className="space-y-3">
            <InfoBox title="Wilms Tumor (Nephroblastoma) — Recognition" color="blue">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-blue-900">Clinical Presentation (suspect when):</p>
                {[
                  "Abdominal mass — most common presentation (>80%); typically unilateral, smooth, does not cross midline",
                  "Age: peak 3–4 years; rare after age 10. Most cases are sporadic.",
                  "Associated symptoms: abdominal pain, haematuria (20%), fever, hypertension (25%), anorexia",
                  "Congenital anomalies: aniridia (WAGR syndrome), hemihypertrophy, cryptorchidism, hypospadias — URGENT genetic workup",
                  "DO NOT palpate mass vigorously — risk of tumour rupture and upstaging",
                  "Nephroblastomatosis: precursor lesion — perilobar or intralobar nephrogenic rests",
                ].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
                <div className="mt-2 p-2 bg-blue-100 rounded-lg">
                  <p className="font-bold text-blue-900">⚠ Differential Diagnosis of Abdominal Mass in Children:</p>
                  <p className="text-blue-800">Neuroblastoma (crosses midline, calcifications), hepatoblastoma, mesoblastic nephroma (&lt;6 months), CCSK (clear cell sarcoma), rhabdoid tumour (most aggressive)</p>
                </div>
              </div>
            </InfoBox>
            <InfoBox color="amber" title="EMERGENCY: Hypertensive Crisis">
              <div className="mt-1 text-xs">
                <p className="text-amber-800">• 25% have hypertension (renin-secreting tumour) — treat urgently before surgery</p>
                <p className="text-amber-800">• Screen: BP both arms, renal function, urine catecholamines (exclude neuroblastoma)</p>
              </div>
            </InfoBox>
            <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white" onClick={() => go(STEPS.IMAGING)}>Start Diagnostic Algorithm →</Button>
          </div>
        );

      case STEPS.IMAGING:
        return (
          <div className="space-y-3">
            <InfoBox color="blue" title="Initial Imaging Workup (SIOP/COG Protocol)">
              <div className="mt-1 text-xs space-y-1">
                {[
                  "Abdominal USS (first-line): assess renal origin, vascularity (Doppler), IVC extension, bilateral involvement",
                  "CT Abdomen + Chest (with contrast): tumour size, lymph nodes, IVC thrombus, lung metastases, contralateral kidney",
                  "MRI preferred for: IVC thrombus extent (into right atrium?), bilateral tumours, spinal dysraphism (predisposition syndromes)",
                  "Chest CT: pulmonary nodules (>3mm = consider metastasis) — mandatory pre-nephrectomy",
                  "AVOID percutaneous biopsy (risk of tumour spillage + upstaging to Stage III) unless: bilateral, unresectable, or exclude neuroblastoma",
                ].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
              </div>
            </InfoBox>
            <Q question="Is the tumour unilateral or bilateral?"
              explanation="Bilateral Wilms (Stage V) occurs in 5–7% of cases — linked to WT1/WT2 mutations, predisposition syndromes, and younger age. Requires nephron-sparing approach."
              onSelect={go}
              options={[
                { label: "UNILATERAL Wilms tumor", next: STEPS.UNILATERAL, reason: "→ Proceed to staging and histology" },
                { label: "BILATERAL tumors (Stage V)", next: STEPS.BILATERAL, reason: "→ Requires nephron-sparing + neoadjuvant chemotherapy" },
                { label: "Uncertain — requires further imaging", next: STEPS.GENETICS, reason: "→ Consider predisposition syndrome workup first" },
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.UNILATERAL:
        return (
          <div className="space-y-3">
            <InfoBox color="green" title="Unilateral Wilms — Treatment Approach">
              <div className="mt-1 text-xs space-y-1">
                <p className="font-bold text-green-900">COG Approach (North America):</p>
                {["Primary nephrectomy (upfront surgery) → then chemotherapy based on histology + stage", "Avoids delay, provides definitive staging and histology immediately", "Pre-op chemo only if: IVC thrombus above hepatic veins, unresectable tumour, or single kidney"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                <p className="font-bold text-green-900 mt-2">SIOP Approach (Europe/India preferred):</p>
                {["Pre-operative chemotherapy × 4–6 weeks (without biopsy) → then nephrectomy", "Reduces tumour size, facilitates surgery, reduces rupture risk", "Recommended in India (SIOP protocol preferred at most paediatric oncology centres)"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
              </div>
            </InfoBox>
            <Q question="What is the NWTS/COG staging (post-surgical)?"
              explanation="Staging is based on surgical/pathological findings. Determines chemotherapy intensity and radiotherapy need."
              onSelect={(next) => { setSelectedStage(next); go(STEPS.STAGING); }}
              options={[
                { label: "Stage I — Tumour confined to kidney, completely excised", next: "I", reason: "No penetration of renal capsule, no vascular invasion" },
                { label: "Stage II — Extended beyond kidney but completely excised", next: "II", reason: "Penetration of renal capsule, renal sinus involvement" },
                { label: "Stage III — Residual non-haematogenous tumour in abdomen", next: "III", reason: "Positive lymph nodes, peritoneal spillage, positive margins" },
                { label: "Stage IV — Haematogenous metastases (lung, liver, bone, brain)", next: "IV", reason: "Lung most common metastatic site" },
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.STAGING:
        return (
          <div className="space-y-3">
            <InfoBox color="indigo" title={`Stage ${selectedStage} Confirmed — Now Assess Histology`}>
              <div className="mt-1 text-xs">
                <p className="text-indigo-800">Histological classification is critical — determines chemotherapy regimen</p>
                <p className="text-indigo-800 mt-1">Wilms tumour histology has two main groups affecting prognosis and treatment intensity</p>
              </div>
            </InfoBox>
            <Q question="What is the histological type?"
              explanation="Histology is assessed on nephrectomy specimen. Anaplasia (nuclear atypia) = unfavourable prognosis and requires intensified therapy."
              onSelect={go}
              options={[
                { label: "Favourable Histology (FH) — blastemal, stromal, or mixed", next: STEPS.FAVORABLE, reason: "No anaplasia — standard-risk protocol" },
                { label: "Diffuse Anaplasia (DA) — focal or diffuse", next: STEPS.ANAPLASTIC, reason: "→ High-risk unfavourable histology — intensified regimen required" },
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.FAVORABLE:
        return (
          <div className="space-y-3">
            <InfoBox title={`Stage ${selectedStage} — Favourable Histology — Treatment`} color="green">
              <div className="mt-2 text-xs space-y-1">
                {selectedStage === "I" || selectedStage === "II" ? (
                  <>
                    <p className="font-bold text-green-900">Stage I–II FH (Low Risk):</p>
                    {[
                      "Regimen DD4A: Actinomycin D + Vincristine × 18 weeks (NO radiotherapy)",
                      "Actinomycin D: 45 µg/kg IV day 1 (max 2.3 mg/dose) — Day 0 of each cycle",
                      "Vincristine: 1.5 mg/m² IV weekly × 10 weeks (max 2 mg/dose)",
                      "Total duration: 18 weeks (COG AREN0532 protocol)",
                      "5-year OS: >95% for Stage I; 90–95% Stage II FH",
                      "No radiotherapy for Stage I–II FH (NWTS-5 data: RT not beneficial)"
                    ].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                  </>
                ) : selectedStage === "III" ? (
                  <>
                    <p className="font-bold text-green-900">Stage III FH (Intermediate Risk):</p>
                    {[
                      "Regimen DD4A: Actinomycin D + Vincristine + Doxorubicin × 24 weeks",
                      "Doxorubicin: 45 mg/m² IV every 6 weeks (cardiac monitoring ECHO q 3 cycles)",
                      "Flank radiotherapy: 10.8 Gy (whole abdomen if peritoneal spillage at surgery)",
                      "Lung RT: 12 Gy whole lung (if lung metastases present — Stage IV overlap)",
                      "5-year OS: ~85% Stage III FH"
                    ].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                  </>
                ) : (
                  <>
                    <p className="font-bold text-green-900">Stage IV FH (High Risk — Metastatic):</p>
                    {[
                      "Regimen DD4A: Actinomycin D + Vincristine + Doxorubicin × 24 weeks",
                      "Whole lung radiotherapy: 12 Gy if lung nodules persistent after 6 weeks chemo",
                      "Reassess lung nodules at 6 weeks: CR = no lung RT; PR/SD = proceed with lung RT",
                      "Flank RT: 10.8 Gy if local Stage III features",
                      "5-year OS: ~75–80% Stage IV FH"
                    ].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                  </>
                )}
                <div className="mt-2 p-2 bg-green-100 rounded-lg">
                  <p className="font-bold text-green-900">Key Monitoring (All Stages):</p>
                  <p className="text-green-800">• Monthly: CBC, LFT, renal function</p>
                  <p className="text-green-800">• Imaging: USS abdomen every 3 months × 2 years, then 6-monthly × 3 years</p>
                  <p className="text-green-800">• Chest CT: every 3 months × 1 year, then every 6 months × 2 years</p>
                  <p className="text-green-800">• ECHO: before doxorubicin, 1 year post-therapy, then 3–5 yearly (late cardiotoxicity)</p>
                </div>
              </div>
            </InfoBox>
            <Button size="sm" variant="outline" className="w-full" onClick={() => go(STEPS.GENETICS)}>Genetic Predisposition Workup →</Button>
            <NavBtns />
          </div>
        );

      case STEPS.ANAPLASTIC:
        return (
          <div className="space-y-3">
            <InfoBox title="Anaplastic Wilms — Unfavourable Histology" color="red">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-red-900">Focal vs Diffuse Anaplasia:</p>
                {[
                  "Focal Anaplasia: nuclear atypia restricted to one focus — Stage I = DD4A (same as FH); Stage II–IV = UH regimen",
                  "Diffuse Anaplasia (DA): anaplastic cells throughout tumour — always UH regimen regardless of stage",
                  "DA associated with TP53 mutations (>75% of anaplastic Wilms)",
                ].map((c, i) => <p key={i} className="text-red-800">• {c}</p>)}
                <p className="font-bold text-red-900 mt-2">UH Regimen (Unfavourable Histology):</p>
                {[
                  "Vincristine + Doxorubicin + Cyclophosphamide + Etoposide × 30 weeks (VDCE)",
                  "OR: Vincristine + Actinomycin D + Carboplatin + Etoposide (VACE) — Stage IV DA",
                  "Flank/Abdominal radiotherapy for Stage III–IV (14.4 Gy flank; whole abdomen if peritoneal involvement)",
                  "Whole lung RT (12 Gy) if pulmonary metastases present",
                  "5-year OS: Stage I DA ~90%; Stage II–IV DA ~30–50%",
                ].map((c, i) => <p key={i} className="text-red-800">• {c}</p>)}
                <div className="p-2 bg-red-100 rounded-lg mt-2">
                  <p className="font-bold text-red-900">TP53 Testing:</p>
                  <p className="text-red-800">• All diffuse anaplastic Wilms should undergo TP53 germline + somatic testing</p>
                  <p className="text-red-800">• Germline TP53 = Li-Fraumeni syndrome → lifelong surveillance protocol</p>
                </div>
              </div>
            </InfoBox>
            <Button size="sm" variant="outline" className="w-full" onClick={() => go(STEPS.GENETICS)}>Genetic Predisposition Workup →</Button>
            <NavBtns />
          </div>
        );

      case STEPS.BILATERAL:
        return (
          <div className="space-y-3">
            <InfoBox title="Bilateral Wilms Tumor (Stage V) — Nephron-Sparing Approach" color="orange">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-orange-900">Principles — AREN0534 Protocol (COG):</p>
                {[
                  "DO NOT perform upfront bilateral nephrectomy — nephron-sparing surgery is GOAL",
                  "Pre-operative chemotherapy (Actinomycin D + Vincristine) × 6–12 weeks → reassess by CT",
                  "Reassess: if adequate response → bilateral partial nephrectomies",
                  "If inadequate response → biopsy one tumour → adjust chemo (add doxorubicin/more cycles)",
                  "Avoid radical nephrectomy if ≥2/3 of one kidney can be preserved",
                  "Goal: achieve normal/near-normal renal function post-treatment",
                ].map((c, i) => <p key={i} className="text-orange-800">• {c}</p>)}
                <p className="font-bold text-orange-900 mt-2">Genetic Workup (MANDATORY for Stage V):</p>
                {[
                  "WT1 germline mutation: WAGR (11p13 deletion), Denys-Drash syndrome — Wilms + DSD + nephropathy",
                  "WT2/11p15 (IGF2/H19 methylation): Beckwith-Wiedemann syndrome — hemihypertrophy + macroglossia",
                  "WTX mutation, CTNNB1, SIX1/2, Q177R mutations",
                  "Genetic counseling mandatory — first-degree relatives screening",
                ].map((c, i) => <p key={i} className="text-orange-800">• {c}</p>)}
                <div className="p-2 bg-orange-100 rounded-lg mt-2">
                  <p className="font-bold text-orange-900">Long-term Renal Follow-up:</p>
                  <p className="text-orange-800">• Annual GFR, BP, proteinuria — lifelong</p>
                  <p className="text-orange-800">• CKD risk significantly elevated (25–50% develop CKD G3+ by adult life)</p>
                  <p className="text-orange-800">• Renal transplant may be required for bilateral surgical resections</p>
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.GENETICS:
        return (
          <div className="space-y-3">
            <InfoBox title="Genetic Predisposition — Wilms Tumor Syndromes" color="violet">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-violet-900">High-Risk Syndromes (Wilms Risk &gt;5%):</p>
                {[
                  "WAGR syndrome (WT1 deletion 11p13): Wilms + Aniridia + Genitourinary anomaly + cognitive disability → Annual USS from birth to age 7",
                  "Denys-Drash syndrome (WT1 missense): Wilms + diffuse mesangial sclerosis + DSD → Bilateral nephrectomy risk; transplant",
                  "Beckwith-Wiedemann syndrome (11p15): Wilms + hepatoblastoma risk; hemihypertrophy; macroglossia → USS every 3 months to age 7",
                  "Isolated hemihypertrophy/hemihyperplasia → USS every 3 months to age 5",
                  "Frasier syndrome (WT1 IVS9+4): FSGS + gonadoblastoma + Wilms (rare)",
                ].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
                <p className="font-bold text-violet-900 mt-2">Surveillance Protocol (High-Risk):</p>
                {[
                  "Renal USS every 3 months from birth to age 7 (or until 8 years)",
                  "AFP monitoring if BWS (hepatoblastoma screen)",
                  "Annual ophthalmology (aniridia → glaucoma risk)",
                  "Referral to genetics clinic for genetic counselling",
                ].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
              </div>
            </InfoBox>
            <Button size="sm" variant="outline" className="w-full" onClick={() => go(STEPS.SURVEILLANCE)}>Survivorship & Late Effects →</Button>
            <NavBtns />
          </div>
        );

      case STEPS.SURVEILLANCE:
        return (
          <div className="space-y-3">
            <InfoBox title="Wilms Tumor Survivorship & Late Effects Surveillance" color="teal">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-teal-900">Relapse Surveillance:</p>
                {[
                  "USS abdomen: every 3 months × 2 years, then every 6 months × 3 years, then annually",
                  "Chest CT: every 3 months × 1 year, then 6 months × 1 year, then annually",
                  "AFP not useful for Wilms surveillance (used for hepatoblastoma)",
                ].map((c, i) => <p key={i} className="text-teal-800">• {c}</p>)}
                <p className="font-bold text-teal-900 mt-2">Late Effects Screening (COG LTFU Guidelines):</p>
                {[
                  "Cardiac: ECHO every 5 years if received doxorubicin / mediastinal RT (cardiotoxicity)",
                  "Renal: Annual GFR, BP, UPCR — lifelong. CKD risk particularly if bilateral or UH",
                  "Musculoskeletal: if received abdominal/flank RT — scoliosis, leg length discrepancy, soft tissue hypoplasia",
                  "Fertility: Cyclophosphamide-associated gonadotoxicity — male: semen analysis at adulthood; female: ovarian reserve testing",
                  "Second malignancy: Abdominal RT increases risk of bowel malignancies; radiation-induced secondary sarcoma (rare)",
                  "Hepatic: Actinomycin D — hepatopathy (VOD), liver function monitoring",
                ].map((c, i) => <p key={i} className="text-teal-800">• {c}</p>)}
                <div className="p-2 bg-teal-100 rounded-lg mt-2">
                  <p className="font-bold text-teal-900">Relapse Treatment Options:</p>
                  <p className="text-teal-800">• Standard-risk relapse (off chemo &gt;6 months): Vincristine + Actinomycin + Dox + Cyclophosphamide + Etoposide (VDCE)</p>
                  <p className="text-teal-800">• High-risk/early relapse: Carboplatin-based regimens + High-dose chemo + Auto-SCT</p>
                  <p className="text-teal-800">• Bilateral relapse / refractory: Clinical trial — consider irinotecan, temozolomide, anti-GD2</p>
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      default:
        return <Button onClick={reset}>Restart</Button>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-800 to-indigo-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Wilms Tumor (Nephroblastoma) Engine</h3>
            <p className="text-xs text-blue-200">COG AREN · SIOP 2016 · NWTS-5 · AREN0532/0534 · Pediatric Nephrology 2021</p>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Step {history.length + 1}</Badge>
          <div className="flex gap-1 flex-wrap">
            {["Recognition", "Imaging", "Laterality", "Staging", "Histology", "Treatment", "Genetics"]
              .slice(0, Math.min(history.length + 1, 7))
              .map((s, i) => <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${i === Math.min(history.length, 6) ? "bg-blue-100 text-blue-800 font-semibold" : "text-slate-400"}`}>{s}</span>)}
          </div>
        </div>
      )}

      <Card><CardContent className="p-4">{renderStep()}</CardContent></Card>

      <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 space-y-1">
        <p className="font-bold">Quick Reference — Wilms Tumor Staging (NWTS/COG):</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-blue-100">{["Stage", "Definition", "Chemo", "RT", "5-yr OS"].map(h => <th key={h} className="border border-blue-200 px-1.5 py-1 text-left font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {[
                ["I FH", "Confined to kidney, completely excised", "EE4A (AV × 18w)", "No", ">95%"],
                ["II FH", "Beyond kidney, completely excised", "EE4A", "No", "~90%"],
                ["III FH", "Residual tumour/positive LN", "DD4A + Dox", "Flank 10.8 Gy", "~85%"],
                ["IV FH", "Distant metastases (lung/liver)", "DD4A + Dox", "Flank ± Lung", "~75%"],
                ["V", "Bilateral Wilms", "Neoadjuvant AV ×6w", "Individualized", "~70%"],
                ["DA (any)", "Diffuse Anaplasia", "VDCE/VACE ×30w", "Mandatory III+", "30–90%"],
              ].map((row, i) => <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>{row.map((cell, j) => <td key={j} className="border border-blue-200 px-1.5 py-1">{cell}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-blue-700 mt-1">AV=Actinomycin D+Vincristine; DD4A=AV+Doxorubicin; VDCE=Vincristine+Dox+Cyclophos+Etoposide; DA=Diffuse Anaplasia</p>
      </div>
    </div>
  );
}