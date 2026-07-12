import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ChevronRight, AlertCircle, Activity, RotateCcw } from "lucide-react";

/**
 * Neonatal AKI Engine — KDIGO-modified neonatal criteria (KDIGO Neonatal AKI
 * Workgroup / Jetton & Askenazi). Pure frontend, offline-capable (PRD 4.2).
 */
const RISK = [
  { id: "asphyxia", label: "Perinatal asphyxia / HIE (± therapeutic hypothermia)" },
  { id: "sepsis", label: "Sepsis / NEC" },
  { id: "prematurity", label: "Prematurity / VLBW" },
  { id: "nephrotoxins", label: "Nephrotoxins (aminoglycosides, vancomycin, NSAIDs/indomethacin, amphotericin, contrast)" },
  { id: "cardiac", label: "Congenital heart disease / cardiac surgery" },
  { id: "umbilical", label: "Umbilical arterial catheter / thrombosis" },
  { id: "maternal", label: "Maternal NSAIDs / ACEi, oligohydramnios" },
];

export default function NeonatalAKIEngine() {
  const [risk, setRisk] = useState({});
  const [stage, setStage] = useState(0);
  const [scrBase, setScrBase] = useState("");
  const [scrCurr, setScrCurr] = useState("");
  const [uop, setUop] = useState("");

  const toggle = (id) => setRisk((r) => ({ ...r, [id]: !r[id] }));

  const base = parseFloat(scrBase);
  const curr = parseFloat(scrCurr);
  const uopN = parseFloat(uop);
  let scrStage = null; // 0-3
  if (base > 0 && curr > 0) {
    const rise = curr - base;
    const ratio = curr / base;
    if (ratio >= 3 || curr >= 2.5) scrStage = 3;
    else if (ratio >= 2) scrStage = 2;
    else if (rise >= 0.3 || ratio >= 1.5) scrStage = 1;
    else scrStage = 0;
  }
  let uopStage = null;
  if (!isNaN(uopN)) {
    if (uopN < 0.3) uopStage = 3;
    else if (uopN < 0.5) uopStage = 2; // ≥24h in KDIGO neonatal; simplified prompt
    else uopStage = 0;
  }
  const akiStage = (scrStage === null && uopStage === null) ? null : Math.max(scrStage || 0, uopStage || 0);
  const reset = () => { setRisk({}); setStage(0); setScrBase(""); setScrCurr(""); setUop(""); };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-sky-700 to-blue-800 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5" />
          <h3 className="text-sm font-bold">Neonatal AKI Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">KDIGO Neonatal (modified)</Badge>
        </div>
        <p className="text-xs text-sky-100">Risk → neonatal KDIGO staging (SCr rise or low UOP) → management</p>
      </div>

      {stage === 0 && (
        <div className="space-y-3">
          <Alert className="bg-sky-50 border-sky-200">
            <AlertCircle className="w-4 h-4 text-sky-600" />
            <AlertDescription className="text-sky-800 text-xs">
              Neonatal AKI uses <strong>modified KDIGO</strong>: SCr does not fall normally after birth, or rises by
              ≥0.3 mg/dL within 48h / ≥1.5× the previous lowest value; and/or urine output &lt;1 mL/kg/h. Serum
              creatinine in the first days reflects <strong>maternal</strong> values — track the trend, not one value.
            </AlertDescription>
          </Alert>
          <p className="text-sm font-semibold text-slate-700">Risk factors present:</p>
          {RISK.map((q) => (
            <button key={q.id} onClick={() => toggle(q.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${risk[q.id] ? "bg-sky-50 border-sky-300 text-sky-800" : "bg-white border-slate-200 text-slate-700"}`}>
              {risk[q.id] ? <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              {q.label}
            </button>
          ))}
          <Button className="w-full bg-sky-600 hover:bg-sky-700" onClick={() => setStage(1)}>Stage the AKI <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}

      {stage === 1 && (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-slate-200 p-3 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase">Neonatal KDIGO staging</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-600">Lowest prior SCr (mg/dL)</label>
                <Input value={scrBase} onChange={(e) => setScrBase(e.target.value)} placeholder="e.g. 0.4" className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Current SCr (mg/dL)</label>
                <Input value={scrCurr} onChange={(e) => setScrCurr(e.target.value)} placeholder="e.g. 0.8" className="mt-1 h-8 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Urine output (mL/kg/h, over 24h)</label>
              <Input value={uop} onChange={(e) => setUop(e.target.value)} placeholder="e.g. 0.4" className="mt-1 h-8 text-sm" />
            </div>
            {akiStage !== null && (
              <div className={`rounded-lg p-3 text-sm font-semibold ${akiStage === 0 ? "bg-green-50 text-green-800 border border-green-200" : akiStage === 3 ? "bg-red-50 text-red-800 border border-red-300" : "bg-amber-50 text-amber-800 border border-amber-300"}`}>
                {akiStage === 0 ? "No AKI by current values — continue surveillance in at-risk neonate." : `Neonatal AKI Stage ${akiStage}`}
                <div className="text-[11px] font-normal mt-1 text-slate-600">
                  SCr criterion: {scrStage === null ? "—" : `Stage ${scrStage}`} · UOP criterion: {uopStage === null ? "—" : `Stage ${uopStage}`} (worst stage applies)
                </div>
              </div>
            )}
            <p className="text-[10px] text-slate-500">Stage 1: SCr ↑≥0.3 mg/dL in 48h or 1.5–1.9× baseline, or UOP &lt;0.5. Stage 2: 2–2.9× or UOP &lt;0.5 (prolonged). Stage 3: ≥3× or SCr ≥2.5 mg/dL or dialysis or UOP &lt;0.3.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStage(0)}>Back</Button>
            <Button className="flex-1 bg-sky-600 hover:bg-sky-700" onClick={() => setStage(2)}>Management <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {stage === 2 && (
        <div className="space-y-3">
          {[
            { title: "Immediate", color: "bg-blue-50 border-blue-200", items: [
              "Stop/adjust nephrotoxins; review every drug for renal dosing (gentamicin/vancomycin levels)",
              "Optimise perfusion & volume: treat hypovolaemia; avoid fluid overload (a mortality driver in neonatal AKI)",
              "Accurate weight-based intake/output; daily (or 12-hourly) weights; strict fluid balance chart",
            ]},
            { title: "Fluid & electrolytes", color: "bg-teal-50 border-teal-200", items: [
              "If overloaded: restrict to insensible losses (~40–60 mL/kg/day) + replace measured output",
              "Cautious diuretic trial (furosemide) only if volume-replete and oliguric — not a treatment for AKI itself",
              "Manage hyperkalaemia, hyponatraemia, metabolic acidosis, hyperphosphataemia, hypocalcaemia",
            ]},
            { title: "Escalation / RRT", color: "bg-red-50 border-red-300", items: [
              "Indications: refractory fluid overload, hyperkalaemia, severe acidosis, uraemia, inborn errors with hyperammonaemia",
              "Peritoneal dialysis is first-line RRT in neonates in most settings (see Acute PD Prescription engine)",
              "CRRT/haemodialysis where PD is contraindicated and expertise/equipment exist",
            ]},
            { title: "Follow-up", color: "bg-green-50 border-green-200", items: [
              "Neonatal AKI predicts later CKD/HTN — arrange nephrology follow-up with BP, growth, SCr, urinalysis",
            ]},
          ].map((sec, i) => (
            <div key={i} className={`rounded-xl border-2 ${sec.color} p-3`}>
              <p className="text-xs font-bold text-slate-800 mb-1.5">{sec.title}</p>
              <ul className="space-y-1">{sec.items.map((it, j) => <li key={j} className="text-xs text-slate-700 flex gap-1.5"><span>•</span><span>{it}</span></li>)}</ul>
            </div>
          ))}
          <Alert className="bg-slate-50 border-slate-200"><AlertDescription className="text-[11px] text-slate-500">Sources: KDIGO Neonatal AKI Workgroup; Jetton JG, Askenazi DJ (AWAKEN). Verify against local protocol and specialist input.</AlertDescription></Alert>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStage(1)}>Back</Button>
            <Button variant="outline" className="flex-1 gap-1" onClick={reset}><RotateCcw className="w-3.5 h-3.5" /> Restart</Button>
          </div>
        </div>
      )}
    </div>
  );
}
