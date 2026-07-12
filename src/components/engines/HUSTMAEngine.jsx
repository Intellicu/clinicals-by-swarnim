import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ChevronRight, AlertCircle, Droplet, RotateCcw } from "lucide-react";

/**
 * HUS / TMA Diagnostic & Management Engine.
 * Sources: KDIGO aHUS 2021; IPNA HUS consensus (Loirat 2016); ISPN.
 * Pure frontend — offline-capable (PRD 4.2).
 */
const FEATURES = [
  { id: "mahb", label: "Microangiopathic haemolytic anaemia (schistocytes, ↑LDH, ↓haptoglobin, Coombs-negative)" },
  { id: "thrombocytopenia", label: "Thrombocytopenia (platelets <150,000/µL)" },
  { id: "aki", label: "Acute kidney injury (↑creatinine, oliguria, haematuria/proteinuria)" },
  { id: "diarrhoea", label: "Preceding diarrhoea, esp. bloody (7–10 days prior)" },
  { id: "neuro", label: "Neurological features (seizures, altered sensorium)" },
  { id: "age_under_6mo", label: "Age <6 months or >5 years at onset" },
  { id: "relapse_fh", label: "Relapsing course or family history of HUS" },
  { id: "no_diarrhoea", label: "No diarrhoeal prodrome" },
];

export default function HUSTMAEngine() {
  const [features, setFeatures] = useState({});
  const [stage, setStage] = useState(0);
  const toggle = (id) => setFeatures((f) => ({ ...f, [id]: !f[id] }));

  const triad = ["mahb", "thrombocytopenia", "aki"].filter((k) => features[k]).length;
  const stecLeaning = features.diarrhoea && !features.no_diarrhoea;
  const atypicalLeaning = features.no_diarrhoea || features.relapse_fh || features.age_under_6mo || features.neuro;

  const reset = () => { setFeatures({}); setStage(0); };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-rose-700 to-red-700 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Droplet className="w-5 h-5" />
          <h3 className="text-sm font-bold">HUS / TMA Intelligence Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">KDIGO aHUS 2021 · IPNA</Badge>
        </div>
        <p className="text-xs text-rose-100">Triad recognition → STEC-HUS vs atypical HUS vs TTP → complement workup → management</p>
      </div>

      {stage === 0 && (
        <div className="space-y-3">
          <Alert className="bg-rose-50 border-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <AlertDescription className="text-rose-800 text-xs">
              Thrombotic microangiopathy triad: <strong>MAHA + thrombocytopenia + organ injury (kidney)</strong>.
              90% of childhood HUS is STEC-HUS (Shiga-toxin, post-diarrhoeal); the rest is complement-mediated
              (atypical) HUS or, rarely, TTP (ADAMTS13 deficiency). Distinguishing them changes management urgently.
            </AlertDescription>
          </Alert>
          <p className="text-sm font-semibold text-slate-700">Select ALL features present:</p>
          {FEATURES.map((q) => (
            <button key={q.id} onClick={() => toggle(q.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${features[q.id] ? "bg-rose-50 border-rose-300 text-rose-800" : "bg-white border-slate-200 text-slate-700"}`}>
              {features[q.id] ? <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              {q.label}
            </button>
          ))}
          {triad >= 1 && (
            <div className={`rounded-lg p-3 text-xs ${triad === 3 ? "bg-red-50 border border-red-300 text-red-800" : "bg-amber-50 border border-amber-300 text-amber-800"}`}>
              {triad === 3
                ? "Full TMA triad present — proceed to classification and urgent workup."
                : `${triad}/3 triad features. Complete the triad assessment (MAHA, thrombocytopenia, AKI) before classifying.`}
            </div>
          )}
          <Button className="w-full bg-rose-600 hover:bg-rose-700" disabled={triad < 1} onClick={() => setStage(1)}>
            Classify & Workup <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {stage === 1 && (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-slate-200 p-3">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Leaning</p>
            <div className="flex flex-wrap gap-2">
              <Badge className={stecLeaning ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-500"}>STEC-HUS {stecLeaning ? "likely" : ""}</Badge>
              <Badge className={atypicalLeaning ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"}>Atypical HUS {atypicalLeaning ? "consider" : ""}</Badge>
              <Badge className="bg-slate-100 text-slate-500">TTP if ADAMTS13 &lt;10%</Badge>
            </div>
          </div>

          {[
            { title: "First-line workup (all suspected TMA)", color: "bg-blue-50 border-blue-200", items: [
              "CBC + peripheral smear (schistocytes), reticulocytes",
              "LDH, haptoglobin, indirect bilirubin, direct Coombs (negative in TMA)",
              "Creatinine, electrolytes, urinalysis (haematuria/proteinuria)",
              "Stool culture + Shiga toxin PCR (STEC E. coli O157:H7 and non-O157)",
              "C3, C4 (low C3 with normal C4 suggests alternative-pathway/complement activation)",
            ]},
            { title: "If atypical HUS suspected (no diarrhoea, relapse, <6mo, neuro, normal stool studies)", color: "bg-red-50 border-red-200", items: [
              "ADAMTS13 activity BEFORE plasma therapy — <10% = TTP (different disease/management)",
              "Complement functional + genetics: CFH, CFI, CD46/MCP, C3, CFB, THBD, DGKE; anti-CFH antibodies",
              "Factor H / Factor I levels; sC5b-9 (terminal complement activation marker)",
              "Exclude secondary TMA: pregnancy, malignant HTN, drugs (calcineurin inhibitors), cobalamin C defect (infants), pneumococcal HUS (T-antigen)",
            ]},
            { title: "Pneumococcal HUS red flags (infants/toddlers with pneumonia/empyema/meningitis)", color: "bg-amber-50 border-amber-200", items: [
              "Direct Coombs POSITIVE (T-antigen exposure) — unlike other HUS",
              "AVOID plasma/FFP (contains anti-T antibodies — can worsen haemolysis)",
              "Use washed blood products; treat the pneumococcal infection",
            ]},
          ].map((sec, i) => (
            <div key={i} className={`rounded-xl border ${sec.color} p-3`}>
              <p className="text-xs font-bold text-slate-700 mb-1.5">{sec.title}</p>
              <ul className="space-y-1">
                {sec.items.map((it, j) => (
                  <li key={j} className="text-xs text-slate-700 flex gap-1.5"><span>•</span><span>{it}</span></li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStage(0)}>Back</Button>
            <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={() => setStage(2)}>Management <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {stage === 2 && (
        <div className="space-y-3">
          {[
            { title: "STEC-HUS (typical) — supportive care is the mainstay", color: "bg-orange-50 border-orange-300", items: [
              "Meticulous fluid & electrolyte management; early IV volume expansion may reduce oligoanuric AKI",
              "Manage hypertension, anaemia (transfuse if Hb <6–7 g/dL or symptomatic), and hyperkalaemia",
              "Dialysis (usually acute PD in children) for refractory fluid overload, hyperkalaemia, or uraemia",
              "AVOID antibiotics and anti-motility agents in STEC (may increase toxin release / HUS risk)",
              "Eculizumab NOT routine — consider only for severe CNS involvement (specialist decision)",
            ]},
            { title: "Atypical (complement-mediated) HUS — complement blockade", color: "bg-red-50 border-red-300", items: [
              "Eculizumab is FIRST-LINE — do not wait for genetics. See the Eculizumab module for weight-band dosing, meningococcal vaccination/prophylaxis, and preparation.",
              "Meningococcal vaccination ≥2 weeks before (or antibiotic prophylaxis from day 1) — mandatory before eculizumab",
              "Plasma exchange/infusion only if eculizumab unavailable, or as a bridge; give supplemental eculizumab around plasma therapy",
              "Treat/adjust any identified trigger; monitor LDH, platelets, creatinine, CH50",
            ]},
            { title: "TTP (ADAMTS13 <10%)", color: "bg-purple-50 border-purple-300", items: [
              "Urgent plasma exchange (not just infusion) ± corticosteroids; caplacizumab/rituximab in specialist care",
              "This is a distinct disease — do not treat as HUS",
            ]},
            { title: "Monitor & follow-up (all TMA)", color: "bg-green-50 border-green-300", items: [
              "Daily CBC/smear, LDH, platelets, creatinine until remission (platelets >150k, LDH normalising, no schistocytes)",
              "BP, growth, proteinuria long-term; atypical HUS has high relapse and ESKD risk without complement blockade",
            ]},
          ].map((sec, i) => (
            <div key={i} className={`rounded-xl border-2 ${sec.color} p-3`}>
              <p className="text-xs font-bold text-slate-800 mb-1.5">{sec.title}</p>
              <ul className="space-y-1">
                {sec.items.map((it, j) => (
                  <li key={j} className="text-xs text-slate-700 flex gap-1.5"><span>•</span><span>{it}</span></li>
                ))}
              </ul>
            </div>
          ))}
          <Alert className="bg-slate-50 border-slate-200">
            <AlertDescription className="text-[11px] text-slate-500">
              Sources: KDIGO aHUS Controversies 2021; Loirat C et al., IPNA HUS clinical practice recommendations, Pediatr Nephrol 2016;
              ISPN. Verify against current guidelines and specialist input. Not a substitute for clinical judgment.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStage(1)}>Back</Button>
            <Button variant="outline" className="flex-1 gap-1" onClick={reset}><RotateCcw className="w-3.5 h-3.5" /> Restart</Button>
          </div>
        </div>
      )}
    </div>
  );
}
