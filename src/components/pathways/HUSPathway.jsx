/**
 * HUS / TMA Pathway — Full branching decision engine
 * ADAMTS13 → Stx → TMA type → Protocol
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, ArrowRight, ChevronRight, ArrowLeft, XCircle } from "lucide-react";
import { EculizumabEngine } from "./DecisionEngines";

const INITIAL = { step: 0, answers: {}, trail: [] };

const TrailBar = ({ trail }) => {
  if (!trail.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {trail.map((t, i) => (
        <span key={i} className="text-xs bg-red-50 border border-red-200 text-red-800 px-2 py-0.5 rounded-full">
          {i > 0 && <ArrowRight className="inline w-2.5 h-2.5 mx-0.5" />}{t}
        </span>
      ))}
    </div>
  );
};

const InfoCard = ({ title, color, items, icon }) => (
  <div className={`rounded-xl border-2 p-3 ${color}`}>
    <p className="text-xs font-bold text-slate-800 mb-2">{title}</p>
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-1.5 text-xs text-slate-800">
          {icon === "check" ? <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" /> :
           icon === "x" ? <XCircle className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" /> :
           <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />}
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const ChoiceBtn = ({ label, sub, color = "slate", onClick }) => {
  const colors = {
    red: "border-red-300 bg-red-50 hover:border-red-500 text-red-900",
    green: "border-green-300 bg-green-50 hover:border-green-500 text-green-900",
    amber: "border-amber-300 bg-amber-50 hover:border-amber-500 text-amber-900",
    blue: "border-blue-300 bg-blue-50 hover:border-blue-500 text-blue-900",
    slate: "border-slate-200 bg-white hover:border-slate-400 text-slate-800",
  };
  return (
    <button onClick={onClick} className={`w-full flex items-start justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${colors[color]}`}>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {sub && <p className="text-xs opacity-75 mt-0.5">{sub}</p>}
      </div>
      <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-50" />
    </button>
  );
};

export default function HUSPathway() {
  const [state, setState] = useState(INITIAL);
  const [viewRef, setViewRef] = useState(null); // null | "stec_protocol" | "ahus_plex" | "eculizumab"

  const { step, answers, trail } = state;

  const ans = (key, val, label) => setState(s => ({
    step: s.step + 1,
    answers: { ...s.answers, [key]: val },
    trail: [...s.trail, label]
  }));

  const reset = () => { setState(INITIAL); setViewRef(null); };
  const back = () => {
    if (viewRef) { setViewRef(null); return; }
    setState(s => {
      const newTrail = s.trail.slice(0, -1);
      const newAnswers = { ...s.answers };
      const keys = Object.keys(newAnswers);
      if (keys.length) delete newAnswers[keys[keys.length - 1]];
      return { step: Math.max(0, s.step - 1), answers: newAnswers, trail: newTrail };
    });
  };

  // Reference views
  if (viewRef === "stec_protocol") return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setViewRef(null)}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <h3 className="font-bold text-sm">STEC-HUS Management Protocol</h3>
      </div>
      <InfoCard title="Key DO NOTs" color="bg-red-50 border-red-200" icon="x" items={[
        "NO antibiotics — increases Shiga-toxin release by lysing bacteria",
        "NO anti-motility agents (loperamide, opioids) — prolong toxin exposure",
        "NO plasma exchange for STEC-HUS (does not help)",
        "NO eculizumab routine use (ECUSTEC trial: not beneficial)",
        "NO NSAIDs — nephrotoxic in AKI",
      ]} />
      <InfoCard title="Supportive Management" color="bg-green-50 border-green-200" icon="check" items={[
        "IV fluids: early isotonic NS from prodromal diarrhoea onset",
        "Strict fluid balance — avoid overload (worsens cerebral oedema + pulmonary oedema in AKI)",
        "Transfuse pRBC if Hb <7 g/dL (aim 8–9 g/dL)",
        "Platelets ONLY if active bleeding or pre-procedure — avoid otherwise (worsens TMA)",
        "Antihypertensives: amlodipine or labetalol for severe HTN",
        "Dialysis: initiate early per KDIGO AKI criteria (AEIOU)",
      ]} />
      <InfoCard title="Neurological HUS (severe)" color="bg-purple-50 border-purple-200" icon="arrow" items={[
        "Seizures/encephalopathy in 20–50% STEC-HUS — high-risk marker",
        "MRI brain: basal ganglia + white matter lesions (PRES, direct toxin effect)",
        "Eculizumab: CONSIDER in neuro-HUS with deterioration (NOT routine) — case-by-case",
        "Maintain MAP to prevent cerebral hypoperfusion",
        "Levetiracetam for seizures (avoid enzyme-inducing AEDs)",
      ]} />
    </div>
  );

  if (viewRef === "ahus_plex") return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setViewRef(null)}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <h3 className="font-bold text-sm">aHUS — Plasma Exchange Protocol</h3>
      </div>
      <InfoCard title="PEX Protocol (Bridge to Eculizumab)" color="bg-slate-50 border-slate-200" icon="arrow" items={[
        "Initiate PEX if eculizumab unavailable — NOT definitive treatment",
        "Volume: 1–1.5× plasma volume (40–60 mL/kg); replacement with FFP",
        "Daily × 5 sessions, then every 48h × 2 weeks, then 3× weekly",
        "Central access: large-bore CVC or Permcath required",
        "Monitor: platelets, LDH, haptoglobin, creatinine after each session",
        "Transition to eculizumab as soon as available",
      ]} />
      <InfoCard title="Anti-CFH Ab–Mediated aHUS (Special Protocol)" color="bg-purple-50 border-purple-200" icon="arrow" items={[
        "Anti-CFH Ab titre >150 AU/mL: aggressive immune suppression + PEX",
        "PEX daily × 5–7 days to remove Ab; taper over 4–6 weeks",
        "Prednisolone 1–2 mg/kg/day × 1 month → alternate day taper",
        "IV Cyclophosphamide 500 mg/m² q3-4w × 3–5 doses (or Rituximab 375 mg/m² × 2)",
        "Monitor Ab titres: target <150 AU/mL",
        "India: anti-CFH Ab test at AIIMS-New Delhi, PGIMER Chandigarh",
      ]} />
    </div>
  );

  if (viewRef === "eculizumab") return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={() => setViewRef(null)}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
      <EculizumabEngine />
    </div>
  );

  // ── STEP 0: TMA Triad Confirmation ────────────────────────────────────────
  if (step === 0) return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gradient-to-r from-red-800 to-rose-700 p-4 text-white">
        <h3 className="font-bold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />HUS / TMA Decision Engine</h3>
        <p className="text-xs text-red-100 mt-0.5">STEC-HUS · aHUS · TTP · TMA differentiation — KDIGO 2022 · ISPN</p>
      </div>
      <Alert className="bg-red-50 border-red-300">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-xs text-red-900">
          <strong>MEDICAL EMERGENCY:</strong> TMA is life-threatening. Differentiate STEC-HUS from aHUS/TTP before treatment. Do NOT give eculizumab without diagnosis. Do NOT start PEX without ADAMTS13 sample stored.
        </AlertDescription>
      </Alert>
      <p className="text-sm font-bold text-slate-800">Is the TMA triad confirmed?</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
        <p className="font-semibold text-slate-700">TMA triad requires ALL THREE:</p>
        <p>① <strong>MAHA</strong> — Hb &lt;10 + schistocytes ≥2% on peripheral smear (STAT)</p>
        <p>② <strong>Thrombocytopenia</strong> — Platelets &lt;150,000/µL</p>
        <p>③ <strong>Organ injury</strong> — AKI (↑Cr) or neurological or cardiac</p>
      </div>
      <ChoiceBtn label="Yes — TMA triad confirmed" sub="All 3 criteria met" color="red" onClick={() => ans("triad", "yes", "TMA Confirmed")} />
      <ChoiceBtn label="Incomplete triad" sub="Only 1–2 criteria met" color="slate" onClick={() => ans("triad", "incomplete", "Triad Incomplete")} />
    </div>
  );

  // Incomplete triad
  if (step === 1 && answers.triad === "incomplete") return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <InfoCard title="Incomplete TMA Triad — Differential" color="bg-amber-50 border-amber-300" icon="arrow" items={[
        "MAHA alone (no thrombocytopenia): Consider microangiopathy from malignancy, DIC, severe HTN",
        "Thrombocytopenia alone: ITP, drug-induced, HIT, bone marrow failure",
        "AKI + no MAHA: Pre-renal, intrinsic renal disease, ATN",
        "Review peripheral smear urgently — schistocyte count must be ≥2% for MAHA",
        "DIC: PT + APTT elevated, fibrinogen low (contrast to TMA — normal PT/APTT)",
      ]} />
      <Button className="w-full bg-red-600 hover:bg-red-700" onClick={reset}>Start Over</Button>
    </div>
  );

  // ── STEP 1: CRITICAL — Store ADAMTS13 sample FIRST ────────────────────────
  if (step === 1) return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <div className="rounded-xl bg-amber-600 p-3 text-white">
        <p className="text-sm font-bold">⚠️ CRITICAL FIRST ACTION — Before ANYTHING Else</p>
        <p className="text-xs mt-1">Store 10 mL FROZEN CITRATED PLASMA for ADAMTS13 activity BEFORE any plasma exchange or eculizumab. If PEX given first, ADAMTS13 will be falsely normalised.</p>
      </div>
      <InfoCard title="STAT Investigations (Order Simultaneously)" color="bg-blue-50 border-blue-200" icon="arrow" items={[
        "Peripheral blood smear STAT — schistocyte % (must be ≥2% for MAHA)",
        "ADAMTS13 activity + inhibitor (citrate plasma, FROZEN, before PEX)",
        "Stool PCR stx1/stx2 + Shiga-toxin ELISA + E. coli O157:H7 culture",
        "Complement: C3, C4, CH50, AH50, CFH level, anti-CFH antibody",
        "LDH, haptoglobin (undetectable = MAHA), reticulocyte count",
        "FBC, creatinine, urinalysis, LFT, coagulation",
      ]} />
      <p className="text-sm font-semibold text-slate-800">ADAMTS13 activity result:</p>
      <ChoiceBtn label="ADAMTS13 <10% (severely deficient)" sub="→ TTP — immediate plasma exchange + rituximab" color="red" onClick={() => ans("adamts13", "low", "ADAMTS13 <10%")} />
      <ChoiceBtn label="ADAMTS13 ≥10%" sub="→ Not TTP — proceed to Stx discrimination" color="green" onClick={() => ans("adamts13", "normal", "ADAMTS13 ≥10%")} />
      <ChoiceBtn label="Result pending (not yet available)" sub="→ Supportive care only; hold PEX/eculizumab" color="amber" onClick={() => ans("adamts13", "pending", "ADAMTS13 Pending")} />
    </div>
  );

  // TTP branch
  if (step === 2 && answers.adamts13 === "low") return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <div className="rounded-xl bg-red-700 p-4 text-white">
        <p className="font-bold text-sm">TTP — Thrombotic Thrombocytopenic Purpura</p>
        <p className="text-xs text-red-100 mt-0.5">ADAMTS13 &lt;10% = TTP. Immediate PEX + rituximab. Do NOT use eculizumab.</p>
      </div>
      <InfoCard title="TTP Management — URGENT" color="bg-red-50 border-red-300" icon="arrow" items={[
        "IMMEDIATE plasma exchange (PEX): 1–1.5× plasma volume with FFP — start within 4–8h",
        "PEX daily until platelet count >150,000 for 2 consecutive days",
        "Rituximab 375 mg/m²/week × 4 doses (add from day 1 in refractory/relapsing TTP)",
        "Prednisolone 1–2 mg/kg/day during acute phase",
        "Do NOT give eculizumab — not indicated in TTP",
        "Anti-ADAMTS13 antibody titre: Confirm acquired (antibody-mediated) vs congenital (Upshaw-Schulman)",
        "Caplacizumab (anti-vWF nanobody): if available — significantly faster platelet recovery",
      ]} />
      <InfoCard title="Monitoring During PEX" color="bg-blue-50 border-blue-200" icon="check" items={[
        "Platelets + LDH after each PEX session",
        "ADAMTS13 level after 5 PEX sessions and after rituximab",
        "Neurological exam daily (focal deficits, confusion, seizures)",
        "Troponin (cardiac TMA) if chest pain",
      ]} />
      <Button className="w-full bg-red-600 hover:bg-red-700" onClick={reset}>New Patient</Button>
    </div>
  );

  // ADAMTS13 pending
  if (step === 2 && answers.adamts13 === "pending") return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <InfoCard title="ADAMTS13 Pending — Management" color="bg-amber-50 border-amber-300" icon="arrow" items={[
        "Supportive care only until ADAMTS13 result returns",
        "Do NOT start PEX or eculizumab before ADAMTS13 result (PEX invalidates the test)",
        "Ensure frozen citrated plasma sample has been stored BEFORE any intervention",
        "Continue investigation: stool Stx PCR result, complement panel",
        "If rapid clinical deterioration (neuro/cardiac): multidisciplinary decision — risk-benefit of empirical PEX",
        "Re-assess when result available — return to this decision engine",
      ]} />
      <Button className="w-full" variant="outline" onClick={reset}>Start Over</Button>
    </div>
  );

  // ── STEP 2: Stx / Diarrhoeal prodrome ────────────────────────────────────
  if (step === 2) return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <p className="text-sm font-bold text-slate-800">Stool Shiga-toxin result + diarrhoeal prodrome:</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
        <p className="font-semibold">Stool PCR stx1/stx2 + Shiga-toxin ELISA + E. coli O157:H7 culture</p>
        <p>Typical prodrome: bloody diarrhoea 5–7 days before HUS onset, often in young child (&lt;5y)</p>
      </div>
      <ChoiceBtn label="Stx POSITIVE + diarrhoeal prodrome" sub="→ STEC-HUS — supportive protocol" color="amber" onClick={() => ans("stx", "positive", "Stx Positive")} />
      <ChoiceBtn label="Stx NEGATIVE — non-diarrhoeal" sub="→ Proceed to aHUS/secondary TMA workup" color="blue" onClick={() => ans("stx", "negative", "Stx Negative")} />
      <ChoiceBtn label="Stx result PENDING" sub="→ Treat as STEC-HUS supportively; hold eculizumab" color="slate" onClick={() => ans("stx", "pending", "Stx Pending")} />
    </div>
  );

  // STEC-HUS branch
  if (step === 3 && answers.stx === "positive") return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <div className="rounded-xl bg-gradient-to-r from-orange-700 to-red-700 p-4 text-white">
        <p className="font-bold text-sm">STEC-HUS Confirmed</p>
        <p className="text-xs text-orange-100 mt-0.5">Shiga-toxin E. coli · Supportive management only · No eculizumab</p>
      </div>
      <InfoCard title="Key DO NOTs (Critical)" color="bg-red-50 border-red-300" icon="x" items={[
        "NO antibiotics — increases Shiga-toxin release by lysing bacteria → worsens HUS",
        "NO anti-motility agents — prolong toxin exposure",
        "NO plasma exchange — not beneficial for STEC-HUS",
        "NO eculizumab routine use — ECUSTEC trial showed no benefit",
        "NO NSAIDs — nephrotoxic in AKI",
      ]} />
      <InfoCard title="Supportive Management" color="bg-green-50 border-green-200" icon="check" items={[
        "IV fluids: early isotonic NS — prevents severe AKI",
        "Fluid balance strictly — avoid overload",
        "pRBC if Hb <7 g/dL; avoid platelets unless active bleeding",
        "Antihypertensives: amlodipine or labetalol for severe HTN",
        "Dialysis early per KDIGO AKI criteria (AEIOU)",
      ]} />
      <p className="text-sm font-bold text-slate-800">Neurological features present (seizures/encephalopathy)?</p>
      <ChoiceBtn label="Yes — neurological deterioration" sub="→ Specialist decision: consider eculizumab" color="red" onClick={() => ans("neuro", "yes", "Neuro HUS")} />
      <ChoiceBtn label="No neurological features" sub="→ Continue supportive management" color="green" onClick={() => ans("neuro", "no", "No Neuro")} />
      <Button variant="outline" size="sm" onClick={() => setViewRef("stec_protocol")} className="w-full">Full STEC Protocol Reference →</Button>
    </div>
  );

  if (step === 4 && answers.stx === "positive" && answers.neuro === "yes") return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <div className="rounded-xl bg-purple-700 p-3 text-white">
        <p className="font-bold text-sm">Neurological STEC-HUS — Specialist Input Required</p>
      </div>
      <InfoCard title="Neurological HUS Management" color="bg-purple-50 border-purple-200" icon="arrow" items={[
        "Seizures/encephalopathy in 20–50% STEC-HUS — high-risk marker",
        "MRI brain: basal ganglia + white matter lesions (PRES, direct toxin effect)",
        "Eculizumab: CONSIDER in neurological STEC-HUS with deterioration — case-by-case with specialist",
        "Maintain MAP to prevent cerebral hypoperfusion — target MAP ≥60 mmHg",
        "Levetiracetam for seizures (avoid enzyme-inducing AEDs)",
        "ICU admission — neurology + nephrology multidisciplinary",
      ]} />
      <Button className="w-full" variant="outline" onClick={reset}>New Patient</Button>
    </div>
  );

  if ((step === 4 && answers.stx === "positive" && answers.neuro === "no") ||
      (step === 3 && answers.stx === "pending")) return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <InfoCard title="Monitoring — STEC-HUS" color="bg-blue-50 border-blue-200" icon="check" items={[
        "Daily: CBC, reticulocytes, LDH, haptoglobin, Cr, K+, fluid balance",
        "Blood pressure 4-hourly",
        "Urine output hourly if oliguric",
        "Stool culture follow-up until Stx negative",
        "Neurological observation daily — escalate if neuro features develop",
        "Renal recovery: most STEC-HUS recovers in 1–3 weeks; dialysis weaned as UO improves",
      ]} />
      <Button className="w-full" variant="outline" onClick={reset}>New Patient</Button>
    </div>
  );

  // ── STEP 3: aHUS — Secondary causes ──────────────────────────────────────
  if (step === 3 && answers.stx === "negative") return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <p className="text-sm font-bold text-slate-800">Secondary TMA Causes — Must Exclude:</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
        <p className="font-semibold">Check BEFORE diagnosing primary aHUS:</p>
        <p>ANA/anti-dsDNA (SLE-TMA) · Drug history (calcineurin inhibitors, sirolimus, anti-VEGF) · HSCT · HIV · Pregnancy/HELLP · Plasma amino acids + organic acids (Cobalamin C defect in infants)</p>
      </div>
      <ChoiceBtn label="Secondary cause identified" sub="SLE, drug-induced, HSCT, Cobalamin C, etc." color="amber" onClick={() => ans("secondary", "yes", "Secondary TMA")} />
      <ChoiceBtn label="No secondary cause found" sub="→ Primary complement-mediated aHUS" color="blue" onClick={() => ans("secondary", "no", "Primary aHUS")} />
    </div>
  );

  // Secondary TMA
  if (step === 4 && answers.secondary === "yes") return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <InfoCard title="Secondary TMA — Cause-Directed Treatment" color="bg-amber-50 border-amber-300" icon="arrow" items={[
        "SLE-TMA: ANA/anti-dsDNA positive → hydroxychloroquine + IS (methylprednisolone + MMF)",
        "Drug-induced (CNI/sirolimus): Stop offending drug immediately → switch IS regimen",
        "Cobalamin C defect (infants): Plasma amino acids + organic acids → hydroxycobalamin SC",
        "HSCT-TMA: Reduce CNI dose; consider eculizumab if non-responsive; defibrotide for VOD-TMA",
        "Anti-VEGF (bevacizumab): Stop drug; supportive care; eculizumab if severe",
        "HELLP (pregnancy): Deliver fetus; FFP; supportive",
      ]} />
      <Button className="w-full" variant="outline" onClick={reset}>New Patient</Button>
    </div>
  );

  // ── STEP 4: Primary aHUS — Complement panel ───────────────────────────────
  if (step === 4 && answers.secondary === "no") return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <div className="rounded-xl bg-red-800 p-4 text-white">
        <p className="font-bold text-sm">Primary aHUS — Complement-Mediated TMA</p>
        <p className="text-xs text-red-100 mt-0.5">Genetic complement dysregulation · Eculizumab life-saving</p>
      </div>
      <InfoCard title="Pre-Treatment Checklist (Do BEFORE eculizumab)" color="bg-amber-50 border-amber-200" icon="check" items={[
        "MenACWY + MenB vaccines BEFORE eculizumab (or co-prescribe penicillin V 250mg BD if urgent)",
        "Store 10 mL frozen EDTA plasma BEFORE any PEX or eculizumab",
        "Genetic panel: CFH, CFI, MCP/CD46, C3, CFB, THBD, CFHR1/3 (AIIMS/Medgenome)",
        "Anti-CFH antibody titre (ELISA) — if >150 AU/mL: anti-CFH–mediated aHUS protocol",
        "Baseline: C3, C4, CH50, AH50, Factor H, Factor I, sC5b-9",
      ]} />
      <p className="text-sm font-bold text-slate-800">Anti-CFH antibody result:</p>
      <ChoiceBtn label="Anti-CFH Ab >150 AU/mL" sub="→ Antibody-mediated aHUS — IS + PEX protocol" color="red" onClick={() => ans("anti_cfh", "high", "Anti-CFH Ab >150")} />
      <ChoiceBtn label="Anti-CFH Ab normal / genetic mutation" sub="→ Primary complement dysregulation — eculizumab" color="blue" onClick={() => ans("anti_cfh", "genetic", "Genetic aHUS")} />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewRef("ahus_plex")}>PEX Protocol →</Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewRef("eculizumab")}>Eculizumab Dosing →</Button>
      </div>
    </div>
  );

  // Anti-CFH high
  if (step === 5 && answers.anti_cfh === "high") return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <InfoCard title="Anti-CFH Antibody–Mediated aHUS Protocol" color="bg-purple-50 border-purple-200" icon="arrow" items={[
        "PEX daily × 5–7 days to remove antibody; taper over 4–6 weeks",
        "Prednisolone 1–2 mg/kg/day × 1 month → alternate day taper",
        "IV Cyclophosphamide 500 mg/m² q3-4w × 3–5 doses OR Rituximab 375 mg/m² × 2",
        "Monitor anti-CFH Ab titres: target <150 AU/mL before stopping PEX",
        "Eculizumab if PEX/IS fails or unavailable",
        "India: anti-CFH Ab test at AIIMS-New Delhi, PGIMER Chandigarh",
      ]} />
      <InfoCard title="Monitoring" color="bg-blue-50 border-blue-200" icon="check" items={[
        "Anti-CFH Ab titre: weekly × 4, then monthly",
        "Complement: C3, CH50, AH50 weekly during PEX",
        "Platelets + LDH after each PEX session",
        "eGFR monthly × 6 months, then 3-monthly × 2 years",
      ]} />
      <Button className="w-full" variant="outline" onClick={reset}>New Patient</Button>
    </div>
  );

  // Genetic aHUS
  if (step === 5 && answers.anti_cfh === "genetic") return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      <InfoCard title="Primary aHUS — Eculizumab Protocol" color="bg-blue-50 border-blue-200" icon="check" items={[
        "Eculizumab is first-line — switch from PEX to eculizumab as soon as available",
        "Continue PEX as bridge until eculizumab reaches therapeutic levels",
        "Genetic panel guides duration: MCP/CD46 mutations may allow eculizumab discontinuation after 6 months",
        "CFH/CFI/C3/CFB/THBD mutations: may require lifelong eculizumab",
        "Ravulizumab: longer-acting alternative (8-weekly dosing) — not yet widely available in India",
      ]} />
      <Button variant="outline" className="w-full" onClick={() => setViewRef("eculizumab")}>Eculizumab Dosing Reference →</Button>
      <InfoCard title="Long-Term Monitoring" color="bg-green-50 border-green-200" icon="check" items={[
        "Complement: C3, CH50, AH50 every 3 months on eculizumab",
        "eGFR + UPCR: monthly × 6m, then 3-monthly",
        "Anti-meningococcal prophylaxis (penicillin V) while on eculizumab",
        "Transplant: discuss — CFHI/THBD mutations → consider combined liver-kidney transplant",
      ]} />
      <Button className="w-full" variant="outline" onClick={reset}>New Patient</Button>
    </div>
  );

  return (
    <div className="space-y-3">
      <TrailBar trail={trail} />
      {step > 0 && <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>}
      <p className="text-sm text-slate-500 text-center py-4">Continue answering questions to reach a diagnosis.</p>
    </div>
  );
}