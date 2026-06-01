import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Activity, ExternalLink } from "lucide-react";

const STEPS = {
  START: "start",
  INDICATIONS: "indications",
  MODALITY: "modality",
  PD_RX: "pd_rx",
  HD_RX: "hd_rx",
  CRRT_RX: "crrt_rx",
  SLED_RX: "sled_rx",
  CATHETER: "catheter",
  MONITORING: "monitoring",
  ADEQUACY: "adequacy",
};

const InfoBox = ({ title, color = "blue", items, children, referral }) => {
  const styles = { blue: "border-blue-300 bg-blue-50", green: "border-green-300 bg-green-50", amber: "border-amber-300 bg-amber-50", red: "border-red-300 bg-red-50", violet: "border-violet-300 bg-violet-50", slate: "border-slate-200 bg-slate-50", indigo: "border-indigo-300 bg-indigo-50" };
  const titleC = { blue: "text-blue-900", green: "text-green-900", amber: "text-amber-900", red: "text-red-900", violet: "text-violet-900", slate: "text-slate-800", indigo: "text-indigo-900" };
  return (
    <div className={`rounded-xl border-2 p-3 ${styles[color]}`}>
      <p className={`font-bold text-sm mb-2 ${titleC[color]}`}>{title}</p>
      {items && <ul className="space-y-1">{items.map((it, i) => <li key={i} className="text-xs text-slate-700 flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">→</span><span>{it}</span></li>)}</ul>}
      {children}
      {referral && <div className="mt-2 p-2 bg-violet-50 border border-violet-200 rounded-lg text-xs text-violet-800 font-medium">📋 {referral}</div>}
    </div>
  );
};

const Q = ({ question, note, options, onSelect }) => (
  <div className="space-y-2">
    <p className="font-semibold text-sm text-slate-800">{question}</p>
    {note && <p className="text-xs text-slate-500 italic">{note}</p>}
    {options.map(opt => (
      <button key={opt.label} onClick={() => onSelect(opt.next)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left">
        <span className="text-sm font-medium text-slate-700">{opt.label}</span>
        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
      </button>
    ))}
  </div>
);

export default function RRTEngine() {
  const [step, setStep] = useState(STEPS.START);
  const [history, setHistory] = useState([]);
  const [modality, setModality] = useState("");

  const go = (next) => { setHistory(h => [...h, step]); setStep(next); };
  const back = () => { const prev = history[history.length - 1]; if (prev) { setHistory(h => h.slice(0, -1)); setStep(prev); } };
  const reset = () => { setStep(STEPS.START); setHistory([]); setModality(""); };
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
          <Q question="What do you need help with?" onSelect={go} options={[
            { label: "RRT Indications — AEIOU criteria + KDIGO triggers", next: STEPS.INDICATIONS },
            { label: "Select RRT Modality — PD / HD / CRRT / SLED", next: STEPS.MODALITY },
            { label: "Write PD Prescription", next: STEPS.PD_RX },
            { label: "Write HD Prescription", next: STEPS.HD_RX },
            { label: "Write CRRT Prescription", next: STEPS.CRRT_RX },
            { label: "Write SLED Prescription", next: STEPS.SLED_RX },
            { label: "Access Selection — Catheter by age/weight", next: STEPS.CATHETER },
            { label: "Monitoring Plan — adequacy + complications", next: STEPS.MONITORING },
          ]} />
        );

      case STEPS.INDICATIONS:
        return (
          <div className="space-y-3">
            <InfoBox title="RRT Indications — AEIOU + KDIGO" color="red"
              items={[
                "A — Acidosis: pH <7.1 refractory to medical management",
                "E — Electrolytes: K⁺ >6.5 mEq/L or rapidly rising, refractory to medical therapy",
                "I — Intoxication / Ingestion: dialysable toxins (methanol, ethylene glycol, lithium, salicylates, aminoglycosides)",
                "O — Overload: fluid overload >10% body weight or pulmonary oedema refractory to diuretics",
                "U — Uraemia: BUN >100 mg/dL with symptoms (encephalopathy, pericarditis, bleeding diathesis), oliguria/anuria >24h",
              ]}
            >
              <div className="mt-2 space-y-1.5">
                <p className="text-xs font-bold text-slate-800">Additional KDIGO AKI indications:</p>
                {[
                  "AKI stage 3 (SCr ×3 from baseline OR urine output <0.3 mL/kg/h ×24h)",
                  "Oliguria/anuria >6h unresponsive to fluid resuscitation",
                  "Hyperphosphataemia refractory to binders (in AKI)",
                  "Hyperthermia refractory to treatment",
                  "Tumour lysis syndrome with refractory electrolyte disturbance",
                ].map((c, i) => <p key={i} className="text-xs text-slate-700 flex gap-1.5"><span className="text-indigo-500">→</span>{c}</p>)}
                <p className="text-xs font-bold text-slate-800 mt-2">Early RRT (consider before AEIOU met):</p>
                {[
                  "Inborn errors of metabolism with severe hyperammonemia (NH₃ >200 µmol/L)",
                  "Drug intoxication with volume overload preventing adequate diuresis",
                  "AKI with multiorgan failure requiring fluid balance for nutrition",
                ].map((c, i) => <p key={i} className="text-xs text-slate-700 flex gap-1.5"><span className="text-amber-500">→</span>{c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.MODALITY:
        return (
          <div className="space-y-3">
            <InfoBox title="RRT Modality Selection" color="indigo">
              <div className="mt-2 space-y-2">
                {[
                  { mod: "PD (Peritoneal Dialysis)", color: "bg-blue-50 border-blue-200", points: ["First choice <20 kg, neonates, infants", "Haemodynamic instability", "No vascular access", "Chronic ESKD in children", "Home dialysis (APD preferred)", "Contraindicated: recent abdominal surgery, peritonitis, diaphragmatic defect, abdominal wall defect"], next: STEPS.PD_RX },
                  { mod: "HD (Haemodialysis)", color: "bg-indigo-50 border-indigo-200", points: [">20–25 kg (stable vascular access needed)", "Rapid electrolyte/solute removal needed", "Dialysable toxins", "Haemodynamically stable", "Adequate vascular access (temporary CVC ≥10Fr)", "Chronic ESKD in older children/adolescents"], next: STEPS.HD_RX },
                  { mod: "CRRT (Continuous RRT)", color: "bg-red-50 border-red-200", points: ["ICU setting — haemodynamic instability", "Multiorgan failure — any weight", "Fluid overload requiring slow continuous removal", "Hyperammonemia (urea cycle defects) — highest clearance", "Preferred: cardiovascular instability, cerebral oedema", "Circuit: CVVH / CVVHD / CVVHDF"], next: STEPS.CRRT_RX },
                  { mod: "SLED (Sustained Low Efficiency Dialysis)", color: "bg-amber-50 border-amber-200", points: ["Bridge between HD and CRRT", "ICU — moderate haemodynamic instability", "8–12h sessions; standard HD machine + modified settings", "Slower blood/dialysate flow than conventional HD", "Lower anticoagulation needs vs CRRT", "Cost-effective alternative to CRRT in stable ICU"], next: STEPS.SLED_RX },
                ].map(({ mod, color, points, next }, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border ${color}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800">{mod}</p>
                      <button onClick={() => { setModality(mod); go(next); }} className="text-xs bg-slate-800 text-white px-2 py-1 rounded-lg flex items-center gap-1">Prescribe <ChevronRight className="w-3 h-3" /></button>
                    </div>
                    {points.map((p, j) => <p key={j} className="text-xs text-slate-700 mt-1">• {p}</p>)}
                  </div>
                ))}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.PD_RX:
        return (
          <div className="space-y-3">
            <InfoBox title="Peritoneal Dialysis Prescription" color="blue">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Fill Volume</p>
                  <p className="text-blue-800">Start: 10 mL/kg per cycle (if post-op/new catheter) → increase to 30–40 mL/kg (max 50 mL/kg or 1100 mL/m²) over 1–2 weeks</p>
                  <p className="text-blue-800 mt-1">Adult: 2000 mL per cycle (standard); reduce if respiratory compromise or early post-op</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">Dwell Time & Cycles</p>
                  <p className="text-green-800">CAPD: 4–6 exchanges per day, dwell 4–6h each</p>
                  <p className="text-green-800">APD: 8–12 cycles overnight (1–2h dwell each); last bag dwell 2–4h during day</p>
                  <p className="text-green-800">Acute PD (AKI): 1h dwell cycles; 12–24h cycler; fill 10–20 mL/kg</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="font-bold text-amber-900">Dialysate Composition</p>
                  <p className="text-amber-800">Standard: 1.36% glucose (low osmolality) → 2.27% → 3.86% (highest UF) based on fluid goals</p>
                  <p className="text-amber-800">Icodextrin 7.5%: long daytime dwell (4–16h); sustained UF; not for APD short cycles</p>
                  <p className="text-amber-800">Lactate buffer (Dianeal): standard | Bicarbonate buffer: preferred if acidosis/peritonitis</p>
                  <p className="text-amber-800">Potassium: standard PD fluid is K⁺-free; add KCl 4 mEq/L if serum K⁺ normal/low</p>
                  <p className="text-amber-800">Heparin 500 U/L: add to each bag if cloudy effluent or fibrin strands</p>
                </div>
                <div className="p-2 bg-violet-50 rounded-lg">
                  <p className="font-bold text-violet-900">Adequacy Target (ISPD 2022)</p>
                  <p className="text-violet-800">Total weekly Kt/V urea ≥1.7 (combined peritoneal + residual renal)</p>
                  <p className="text-violet-800">Measure PET (peritoneal equilibration test) at 4–8 weeks to classify transport</p>
                  <p className="text-violet-800">High transporters: shorter dwell APD | Low transporters: longer dwell CAPD</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <p className="font-bold text-red-900">Peritonitis Protocol</p>
                  <p className="text-red-800">Cloudy effluent + WBC {">"}100/mm³ → empirical IP antibiotics</p>
                  <p className="text-red-800">Gram positive cover: Vancomycin IP 15–30 mg/kg per exchange (max 2g); redose guided by levels</p>
                  <p className="text-red-800">Gram negative cover: Ceftazidime IP 125 mg/L loading; 125 mg/L maintenance per exchange</p>
                </div>
              </div>
            </InfoBox>
            <button onClick={() => go(STEPS.CATHETER)} className="w-full text-xs text-indigo-700 underline text-left">→ Catheter selection by age/weight</button>
            <NavBtns />
          </div>
        );

      case STEPS.HD_RX:
        return (
          <div className="space-y-3">
            <InfoBox title="Haemodialysis Prescription" color="indigo">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <p className="font-bold text-indigo-900">Frequency & Duration</p>
                  <p className="text-indigo-800">Chronic CKD: 3 sessions/week, 4h each (minimum)</p>
                  <p className="text-indigo-800">AKI: daily HD or alternate day depending on catabolism and fluid overload</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Blood Flow Rate (Qb)</p>
                  <p className="text-blue-800">Children: 3–5 mL/kg/min; start at lower end, increase by 0.5 mL/kg/min</p>
                  <p className="text-blue-800">Minimum for adequate HD: Qb ≥5–6 mL/kg/min (older children/adolescents: 200–400 mL/min)</p>
                  <p className="text-blue-800">Neonates/infants: Qb 3–5 mL/kg/min; prime circuit with blood (≤10% body weight)</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">Dialysate Flow Rate (Qd) & Composition</p>
                  <p className="text-green-800">Qd: 500–800 mL/min (adults/older children); maintain Qd:Qb ratio ≥2:1</p>
                  <p className="text-green-800">Dialysate Na: 138–140 mEq/L (profiling allowed for cramps/hypotension)</p>
                  <p className="text-green-800">Dialysate K: 2–3 mEq/L (1 mEq/L if K⁺ very high; 3 mEq/L if normal)</p>
                  <p className="text-green-800">Dialysate Ca: 1.25 mmol/L (2.5 mEq/L) standard</p>
                  <p className="text-green-800">Dialysate temperature: 36.5°C standard; 35.5–36°C for intradialytic hypotension prevention</p>
                  <p className="text-green-800">Bicarbonate buffer: 35–38 mEq/L</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="font-bold text-amber-900">Anticoagulation</p>
                  <p className="text-amber-800">Standard: Unfractionated heparin — bolus 10–50 U/kg (max 5000 U) → infusion 5–50 U/kg/h</p>
                  <p className="text-amber-800">Low bleed risk: LMWH (enoxaparin 0.5–1 mg/kg IV at start)</p>
                  <p className="text-amber-800">High bleed risk: saline flush only (100 mL normal saline q30min); or citrate lock</p>
                  <p className="text-amber-800">HIT suspected: argatroban or bivalirudin (avoid heparin)</p>
                </div>
                <div className="p-2 bg-violet-50 rounded-lg">
                  <p className="font-bold text-violet-900">Dialyser / Filter</p>
                  <p className="text-violet-800">{"<"}10 kg: paediatric dialyser (surface area 0.2–0.4 m²; priming volume ≤10% blood volume)</p>
                  <p className="text-violet-800">10–20 kg: 0.4–0.6 m²; 20–30 kg: 0.6–0.8 m²; {">"}30 kg: adult dialyser 1.2–1.5 m²</p>
                  <p className="text-violet-800">High-flux membrane: preferred for chronic HD; better beta-2-microglobulin clearance</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-800">Ultrafiltration</p>
                  <p className="text-slate-700">Target: remove interdialytic fluid gain (usually 1–3% body weight per session)</p>
                  <p className="text-slate-700">Max UF rate: 10 mL/kg/h (ideal); avoid {">"} 13 mL/kg/h (associated with cardiovascular events)</p>
                  <p className="text-slate-700">Dry weight reassessed monthly (or with clinical changes)</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Adequacy (KDOQI)</p>
                  <p className="text-blue-800">Single-pool Kt/V ≥1.2 per session (minimum); target 1.4</p>
                  <p className="text-blue-800">URR (urea reduction ratio) ≥65%</p>
                  <p className="text-blue-800">Measure monthly (BUN pre + post + timing)</p>
                </div>
              </div>
            </InfoBox>
            <button onClick={() => go(STEPS.CATHETER)} className="w-full text-xs text-indigo-700 underline text-left">→ Vascular access selection by age/weight</button>
            <NavBtns />
          </div>
        );

      case STEPS.CRRT_RX:
        return (
          <div className="space-y-3">
            <InfoBox title="CRRT Prescription" color="red">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-red-50 rounded-lg">
                  <p className="font-bold text-red-900">CRRT Modality Selection</p>
                  <p className="text-red-800">CVVH (haemofiltration): convection only; replacement fluid pre/post-filter; good for fluid removal + solute</p>
                  <p className="text-red-800">CVVHD (haemodiafiltr.): diffusion (dialysate); better small solute clearance (urea, creatinine)</p>
                  <p className="text-red-800">CVVHDF: both convection + diffusion; preferred for highest clearance (hyperammonaemia)</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Dose (Effluent Rate)</p>
                  <p className="text-blue-800">KDIGO 2012: 20–25 mL/kg/h (prescribed); deliver ≥20 mL/kg/h (account for downtime)</p>
                  <p className="text-blue-800">Hyperammonaemia (UCD/OA): 8–10 L/h/1.73m² (higher dose for rapid ammonia removal)</p>
                  <p className="text-blue-800">Sepsis/multiorgan failure: 25–35 mL/kg/h dose trials show no benefit over standard; use 20–25 mL/kg/h</p>
                  <p className="text-blue-800">Monitor filter downtime; increase prescription dose by ~25% to achieve target</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">Blood Flow Rate</p>
                  <p className="text-green-800">{"<"}10 kg: 3–5 mL/kg/min (start 3 mL/kg/min)</p>
                  <p className="text-green-800">10–20 kg: 100–200 mL/min</p>
                  <p className="text-green-800">{">"}20 kg: 200–350 mL/min</p>
                  <p className="text-green-800">Filtration fraction: maintain {"<"}25% (= effluent rate / (blood flow × (1 − haematocrit)))</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="font-bold text-amber-900">Anticoagulation</p>
                  <p className="text-amber-800">Regional citrate anticoagulation (preferred): citrate 4% infusion pre-filter; calcium replacement post-filter</p>
                  <p className="text-amber-800">Target: post-filter ionised Ca 0.25–0.40 mmol/L; systemic ionised Ca 1.0–1.2 mmol/L</p>
                  <p className="text-amber-800">Monitor: total Ca:ionised Ca ratio ({">"} 2.5 = citrate accumulation → reduce citrate or change to heparin)</p>
                  <p className="text-amber-800">Heparin: 10–20 U/kg/h if citrate contraindicated (hepatic failure, severe alkalosis)</p>
                  <p className="text-amber-800">No anticoagulation: prostaglandin E1 0.5–5 ng/kg/min if contraindicated; saline flush q30min</p>
                </div>
                <div className="p-2 bg-violet-50 rounded-lg">
                  <p className="font-bold text-violet-900">Replacement Fluid & Dialysate</p>
                  <p className="text-violet-800">Replacement fluid: bicarbonate-based (lactate-free); Na 140 mEq/L, K 0–4 mEq/L (adjust), Mg 0.75 mEq/L, bicarbonate 32–35 mEq/L</p>
                  <p className="text-violet-800">Pre-dilution: 50–75% of total replacement pre-filter (reduces clotting risk, slightly reduces efficiency)</p>
                  <p className="text-violet-800">Phosphate: add KH₂PO₄ or ready-made phosphate-containing fluid (CRRT removes phosphate rapidly)</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-800">Fluid Balance Targets</p>
                  <p className="text-slate-700">Net removal: set hourly fluid removal goal (e.g. -50 mL/h for overload)</p>
                  <p className="text-slate-700">Account for all infusions (drugs, nutrition, blood products)</p>
                  <p className="text-slate-700">Fluid overload {">"}10%: associated with worse outcomes — target early correction</p>
                </div>
              </div>
            </InfoBox>
            <button onClick={() => go(STEPS.CATHETER)} className="w-full text-xs text-indigo-700 underline text-left">→ Vascular access selection by age/weight</button>
            <NavBtns />
          </div>
        );

      case STEPS.SLED_RX:
        return (
          <div className="space-y-3">
            <InfoBox title="SLED Prescription" color="amber">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="font-bold text-amber-900">Session Parameters</p>
                  <p className="text-amber-800">Duration: 8–12h per session (typically overnight to free up machine for day)</p>
                  <p className="text-amber-800">Blood flow rate: 100–150 mL/min (lower than HD to maintain haemodynamic stability)</p>
                  <p className="text-amber-800">Dialysate flow rate: 100–200 mL/min (lower than HD)</p>
                  <p className="text-amber-800">Frequency: daily or alternate days depending on clinical need</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Dialysate Composition</p>
                  <p className="text-blue-800">Standard HD bicarbonate dialysate used (standard HD machine with modified settings)</p>
                  <p className="text-blue-800">Na 138 mEq/L, K 2–3 mEq/L (adjust to patient K+), HCO₃ 35 mEq/L, Ca 1.25 mmol/L</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">Ultrafiltration</p>
                  <p className="text-green-800">Set UF goal based on net fluid balance target (usually 100–300 mL/h)</p>
                  <p className="text-green-800">Gentler than CRRT hourly rate but over longer session; better haemodynamic tolerance than HD</p>
                </div>
                <div className="p-2 bg-violet-50 rounded-lg">
                  <p className="font-bold text-violet-900">Anticoagulation</p>
                  <p className="text-violet-800">Heparin: 10–20 U/kg loading → 5–10 U/kg/h (less heparin needed than CRRT)</p>
                  <p className="text-violet-800">Saline flush: 100 mL q30–60 min if high bleed risk</p>
                  <p className="text-violet-800">Regional citrate: feasible on some HD machines with SLED protocol</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-800">Advantages over CRRT</p>
                  {["Cost-effective (uses standard HD machine + staff)", "Lower anticoagulant requirements", "Shorter nurse-to-patient intensive period", "Allows mobilisation/procedures during daytime", "Comparable outcomes to CRRT in haemodynamically unstable ICU patients (KDIGO 2012)"].map((c, i) => <p key={i} className="text-slate-700">• {c}</p>)}
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.CATHETER:
        return (
          <div className="space-y-3">
            <InfoBox title="Vascular & Peritoneal Access by Age/Weight" color="violet">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">PD Catheter</p>
                  <p className="text-blue-800">Neonates/{"<"}3 kg: Cook neonatal PD catheter (12–14F) or improvised (8Fr feeding tube — emergency only)</p>
                  <p className="text-blue-800">3–10 kg: Paediatric Tenckhoff coiled-tip (2-cuff); 15F</p>
                  <p className="text-blue-800">10–20 kg: Paediatric Tenckhoff straight/coiled; 15–18F</p>
                  <p className="text-blue-800">{">"}20 kg: Adult Tenckhoff (coiled preferred); 15.5Fr double-cuff</p>
                  <p className="text-blue-800">Swan-neck catheter: preferred for exit-site care; down-pointing exit site</p>
                  <p className="text-blue-800">PD catheter placement: midline below umbilicus (laparoscopic preferred)</p>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <p className="font-bold text-indigo-900">Temporary Haemodialysis / CRRT CVC</p>
                  {[
                    ["Neonate ({"<"}3 kg)", "3–5Fr single/double lumen; femoral vein or umbilical vein (emergency)"],
                    ["3–6 kg", "5Fr double-lumen; femoral or internal jugular"],
                    ["7–15 kg", "7Fr double-lumen; femoral, IJ, or subclavian"],
                    ["15–30 kg", "8–10Fr double-lumen; IJ or femoral"],
                    [">30 kg", "11.5Fr double-lumen; IJ preferred (subclavian: avoid — limits future AVF)"],
                  ].map(([wt, cat], i) => <p key={i} className="text-indigo-800">• <strong>{wt}</strong>: {cat}</p>)}
                </div>
                <div className="p-2 bg-violet-50 rounded-lg">
                  <p className="font-bold text-violet-900">Permcath (Long-term CVC)</p>
                  <p className="text-violet-800">{"<"}20 kg: 8Fr (paediatric permcath)</p>
                  <p className="text-violet-800">20–40 kg: 10Fr permcath</p>
                  <p className="text-violet-800">{">"}40 kg: 14.5Fr adult dual-lumen permcath</p>
                  <p className="text-violet-800">Right IJ preferred → right atrium (tunnelled, cuffed)</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">AVF / AVG (Long-term HD access)</p>
                  <p className="text-green-800">Pre-emptive AVF creation: consider when eGFR 15–20 mL/min/1.73m² (or CKD G4–G5)</p>
                  <p className="text-green-800">AVF feasibility: vessel mapping (duplex USS) — vein diameter ≥2.5 mm</p>
                  <p className="text-green-800">Children {"<"}20 kg: wrist AVF often technically difficult — upper arm AVF or AVG</p>
                  <p className="text-green-800">Maturation: AVF 6–8 weeks; AVG: 2–4 weeks</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-800">CVC Site Preference</p>
                  {["Right IJ → best flow, lowest mechanical complication (preferred)", "Left IJ: longer course → higher malposition risk; acceptable", "Femoral: higher infection/thrombosis risk; use short-term only", "Subclavian: AVOID in CKD (central venous stenosis → jeopardises future arm AVF)"].map((c, i) => <p key={i} className="text-slate-700">• {c}</p>)}
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.MONITORING:
        return (
          <div className="space-y-3">
            <InfoBox title="RRT Monitoring Plan" color="green">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">All RRT Modalities — Core Monitoring</p>
                  {["Daily: urea, creatinine, electrolytes (Na, K, Ca, Mg, PO₄), bicarbonate, glucose", "Daily: fluid balance (input/output + weight), BP, HR, SpO₂", "Twice weekly: albumin, LFT, FBC, CRP", "Weekly: Kt/V urea (dialysis adequacy)", "Monthly: iron studies (TSAT, ferritin), PTH, Vit D, lipids, Hb/haematocrit", "Access site: daily inspection (infection, position, patency)"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">PD-Specific</p>
                  {["Effluent: inspect for turbidity at each exchange (peritonitis screen)", "Peritoneal equilibration test (PET): at 4–8 weeks (type transport membrane)", "Exit-site inspection: daily at dressing change", "Protein losses: PD removes ~0.25 g protein/L effluent — adjust nutrition", "Annual: echocardiogram, EEG (children), growth chart, bone age"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <p className="font-bold text-indigo-900">HD-Specific</p>
                  {["Pre/post HD: weight, BP (lying + sitting), access patency, needle sites", "Intradialytic BP: every 30 min", "Monthly: access flow rates (AVF surveillance — Doppler Q-flow)", "Intradialytic complications: hypotension → reduce UF rate; cramps → saline bolus", "Kt/V monthly; URR each session (post-dialysis BUN)"].map((c, i) => <p key={i} className="text-indigo-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <p className="font-bold text-red-900">CRRT-Specific</p>
                  {["Hourly: blood flow, effluent rate, UF rate, filter pressure (TMP, access pressure)", "Filter life monitoring: normal 24–72h; replace if TMP rising, clotting", "Citrate monitoring: ionised Ca every 4–6h (post-filter + systemic)", "Total:ionised Ca ratio >2.5 = citrate accumulation (especially in liver failure)", "Electrolytes every 6h (phosphate, Mg, K — rapid correction with CRRT)"].map((c, i) => <p key={i} className="text-red-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="font-bold text-amber-900">Drug Dosing on RRT</p>
                  {["Antibiotics: adjust for modality (vancomycin by level; aminoglycosides — avoid if possible)", "Antifungals: fluconazole requires dose reduction; echinocandins — no adjustment needed", "Antiepileptics: levetiracetam cleared by HD; give after session or supplement dose", "Immunosuppressants: tacrolimus/CsA not significantly removed by RRT; monitor levels", "Use renal drug dosing reference (KDIGO 2012 / BNF for Children / Micromedex for RRT dosing)"].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
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
      <div className="rounded-xl bg-gradient-to-r from-indigo-700 to-blue-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Renal Replacement Therapy (RRT) Engine</h3>
            <p className="text-xs text-indigo-200">KDIGO AKI 2012 · ISPD 2022 · KDOQI HD Adequacy · Evidence-based paediatric protocols</p>
          </div>
        </div>
      </div>
      {history.length > 0 && <Badge variant="outline" className="text-xs">Step {history.length + 1}</Badge>}
      <Card><CardContent className="p-4">{renderStep()}</CardContent></Card>
      <div className="text-xs text-slate-400 text-center">KDIGO AKI 2012 · ISPD 2022 · KDOQI Adequacy Guidelines · Paediatric RRT consensus</div>
    </div>
  );
}