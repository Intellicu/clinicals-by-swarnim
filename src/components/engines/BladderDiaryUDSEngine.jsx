/**
 * Bladder Diary / Uroflowmetry / UDS / Imaging Selection Engine
 * ICCS · EAU Paediatric · NICE NG112
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, BarChart2, ExternalLink } from "lucide-react";

const STEPS = { START: "start", DIARY: "diary", UROFLOW: "uroflow", UDS: "uds", IMAGING: "imaging" };

function InfoBox({ title, color = "blue", items, children }) {
  const s = { blue: "border-blue-200 bg-blue-50", green: "border-green-200 bg-green-50", amber: "border-amber-200 bg-amber-50", red: "border-red-200 bg-red-50", violet: "border-violet-200 bg-violet-50", teal: "border-teal-200 bg-teal-50", slate: "border-slate-200 bg-slate-50", orange: "border-orange-200 bg-orange-50" };
  const t = { blue: "text-blue-900", green: "text-green-900", amber: "text-amber-900", red: "text-red-900", violet: "text-violet-900", teal: "text-teal-900", slate: "text-slate-800", orange: "text-orange-900" };
  return (
    <div className={`rounded-xl border-2 p-3 ${s[color]}`}>
      <p className={`font-bold text-sm mb-2 ${t[color]}`}>{title}</p>
      {items && <ul className="space-y-1">{items.map((it, i) => <li key={i} className="text-xs text-slate-700 flex gap-1.5"><span className="text-slate-400 flex-shrink-0 mt-0.5">→</span><span>{it}</span></li>)}</ul>}
      {children}
    </div>
  );
}

export default function BladderDiaryUDSEngine() {
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
          <div className="space-y-3">
            <p className="font-semibold text-sm text-slate-800">Bladder Assessment Tools — What do you need?</p>
            {[
              { label: "Bladder Diary — Analysis & Interpretation", next: STEPS.DIARY },
              { label: "Uroflowmetry — Pattern Recognition & Interpretation", next: STEPS.UROFLOW },
              { label: "Urodynamics (UDS) — When to do & What to measure", next: STEPS.UDS },
              { label: "Radiological Investigations — Which scan in which scenario?", next: STEPS.IMAGING },
            ].map((o, i) => (
              <button key={i} onClick={() => go(o.next)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50 transition-all text-left">
                <span className="text-sm font-medium text-slate-700">{o.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        );

      case STEPS.DIARY:
        return (
          <div className="space-y-3">
            <InfoBox title="Bladder Diary — Analysis Guide (ICCS 3-Day Diary)" color="teal">
              <div className="mt-2 space-y-1.5">
                {[
                  { t: "What to Record", items: ["Time of each void (or CIC), volume voided, urgency (0–3 scale), leaks, fluid intake (type + volume)", "Record for minimum 3 days (2 weekdays + 1 weekend)", "Also: bowel diary (frequency, Bristol scale) — always co-assess"] },
                  { t: "Key Parameters to Calculate", items: ["Maximum voided volume (MVV): largest single void — use as surrogate for bladder capacity", "Average voided volume (AVV) = total volume / number of voids", "Expected bladder capacity (EBC) = [age(y)/2 + 6] × 30 mL (ICCS 2014 formula)", "Daytime frequency: <3 = hypofrequent; >8 = overfrequent (polyuria if MVV also large)"] },
                  { t: "Interpretation", items: [
                    "Small MVV (<65% EBC) + high frequency + urgency → Overactive Bladder (OAB)",
                    "Large MVV (>150% EBC) + low frequency (<3/day) → Underactive bladder",
                    "Large volumes all void + nocturia → rule out polyuria (DI, diabetes), not OAB",
                    "Normal MVV + leaks during physical activity → stress incontinence",
                    "No pattern: reassess technique; repeat diary",
                  ] },
                  { t: "Nocturnal Enuresis Assessment", items: ["Nocturnal bladder capacity = largest morning void after enuresis episode", "If NBC < EBC: reduced nocturnal capacity (treat with desmopressin)", "If urine output >130% of EBC at night: nocturnal polyuria (low ADH)", "Link: Desmopressin 120 mcg (DDAVP melt) for nocturnal polyuria type enuresis"] },
                ].map((s, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-teal-100">
                    <p className="text-xs font-bold text-teal-900">{s.t}</p>
                    {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
                  </div>
                ))}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.UROFLOW:
        return (
          <div className="space-y-3">
            <InfoBox title="Uroflowmetry — Pattern Recognition" color="blue">
              <div className="mt-2 space-y-1.5">
                {[
                  { t: "Basics", items: ["Non-invasive: child voids on a flowmeter seat; EMG pads on perineum", "Valid study: voided volume ≥50 mL (or ≥50% EBC for young children)", "Always measure post-void residual (PVR) by bladder scan immediately after", "Perform ≥2 flows on separate occasions for reliability"] },
                  { t: "Normal Values (ICCS)", items: ["Maximum flow rate (Qmax): >15 mL/s (adjusted for voided volume; use Liverpool nomogram)", "Voiding time: <30 seconds for normal bladder capacity voids", "Post-void residual: <20 mL or <20% EBC = normal"] },
                  { t: "Flow Curve Patterns", items: [
                    "BELL-SHAPED (normal): smooth, single peak — adequate detrusor contraction",
                    "STACCATO: interrupted but not stopping — dyssynergic voiding (DSD) or constipation; also seen in overactive bladder",
                    "INTERRUPTED (stop-start): detrusor underactivity + straining to void — check PVR",
                    "PLATEAU / FLAT: low flat flow — bladder outlet obstruction (PUV, urethral stricture, meatal stenosis)",
                    "TOWER PATTERN: very rapid high peak — detrusor overactivity, small capacity bladder",
                  ] },
                  { t: "Link to UDS", items: ["Staccato + PVR >20% → proceed to UDS", "Plateau + male → VCUG to exclude PUV/stricture", "All neurogenic patients → UDS regardless of flow pattern"] },
                ].map((s, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-blue-100">
                    <p className="text-xs font-bold text-blue-900">{s.t}</p>
                    {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
                  </div>
                ))}
              </div>
            </InfoBox>
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-2 text-xs text-blue-900">
              💡 Use the <strong>Uroflow AI Analyser</strong> tool to upload and interpret your uroflowmetry trace with AI assistance.
            </div>
            <NavBtns />
          </div>
        );

      case STEPS.UDS:
        return (
          <div className="space-y-3">
            <InfoBox title="Urodynamic Studies — When & What" color="violet">
              <div className="mt-2 space-y-1.5">
                {[
                  { t: "When to Perform UDS", items: ["All children with confirmed or suspected neurogenic bladder (spina bifida, cord injury, caudal regression)", "Recurrent UTI + upper tract dilation not explained by VUR", "OAB / incontinence not responding to standard treatment (2nd line evaluation)", "Before bladder augmentation or anti-reflux surgery", "After intravesical botox to assess treatment response", "Unexplained hydronephrosis in neurological child"] },
                  { t: "UDS Components", items: ["Filling cystometry: detrusor pressure (Pdet) vs volume — compliance, overactivity, DLPP", "Voiding: pressure-flow study (PFS) — voiding efficiency, DSD", "EMG (sphincter): surface electrode or needle — confirms DSD", "Urethral pressure profile (UPP): for incompetent outlet / stress incontinence", "Video-urodynamics (VUDS): UDS + simultaneous fluoroscopy — gold standard in NB"] },
                  { t: "Key Safety Thresholds (ICCS / EAU)", items: ["DLPP >40 cmH₂O: renal damage threshold — start CIC + anticholinergics URGENTLY", "Bladder compliance <10 mL/cmH₂O: high risk — treat aggressively", "End-fill detrusor pressure >40 cmH₂O: even without leak = upper tract at risk"] },
                  { t: "Preparation for UDS", items: ["Urine culture negative (treat UTI before UDS)", "Diary + uroflow done first", "Stop anticholinergics 5 days before (to assess true function)", "Sedation for young/anxious children — discuss with team"] },
                ].map((s, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-violet-100">
                    <p className="text-xs font-bold text-violet-900">{s.t}</p>
                    {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
                  </div>
                ))}
              </div>
            </InfoBox>
            <div className="rounded-xl bg-violet-50 border border-violet-200 p-2 text-xs text-violet-900">
              💡 Use the <strong>UDS Interpreter AI tool</strong> for assisted analysis of urodynamic reports.
            </div>
            <NavBtns />
          </div>
        );

      case STEPS.IMAGING:
        return (
          <div className="space-y-3">
            <InfoBox title="Radiological Investigation Selection" color="amber">
              <div className="mt-2 space-y-1.5">
                {[
                  { t: "Renal-Bladder Ultrasound (USS)", when: "1st line for all", items: ["Use for: all LUTD, recurrent UTI, suspected VUR, NB follow-up", "Assess: kidneys (size, echogenicity, HN), bladder (wall thickness, diverticula, post-void residual)", "Bladder wall thickness >3.5 mm at filling = abnormal (overactive/obstructed)", "USS cannot diagnose VUR — do VCUG for that"] },
                  { t: "VCUG / MCU (Voiding Cystourethrogram)", when: "Selected cases", items: ["Indications: febrile UTI with abnormal USS, abnormal urethra (PUV suspicion), neurogenic bladder surveillance (to detect secondary VUR)", "Shows: VUR grade, urethral anatomy (PUV — 'keyhole' sign), bladder shape (trabeculation, diverticula)", "PUV in males: do VCUG URGENTLY; if positive → cystoscopy + ablation"] },
                  { t: "DMSA Scan (Static Renal Scan)", when: "Scarring assessment", items: ["Best scan for renal cortical scar detection", "Time: 4–6 months after acute pyelonephritis (active inflammation confounds early scan)", "Indicates: differential renal function (compare left vs right)", "Abnormal DMSA: consider long-term UPCR + BP monitoring"] },
                  { t: "MAG3 Diuretic Renogram (Dynamic)", when: "Obstruction assessment", items: ["Indications: significant hydronephrosis, post-pyeloplasty surveillance, suspected UPJ/UVJ obstruction", "Shows: differential function + drainage (T1/2 after furosemide)", "T1/2 >20 min = obstructed pattern; 10–20 min = equivocal; <10 min = non-obstructed"] },
                  { t: "MRI Spine (Low back / sacral)", when: "Neurogenic etiology", items: ["Tethered cord screening: lipomeningocele, occult dysraphism, sacral agenesis", "Sacral agenesis: count sacral segments on MRI (or lateral X-ray)", "Indications: neurogenic bladder without obvious cause, progressive bladder deterioration, skin dimple/tuft of hair/hemangioma in lumbosacral region"] },
                  { t: "CT KUB / CT IVU", when: "Stone / complex anatomy", items: ["CT without contrast: stone detection (most sensitive)", "CT IVU: complex pelvicalyceal anatomy, duplex kidney, ureterocele", "Avoid radiation in children if USS/MRI adequate"] },
                ].map((s, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-amber-100">
                    <p className="text-xs font-bold text-amber-900">{s.t} <span className="text-amber-500 font-normal">[{s.when}]</span></p>
                    {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
                  </div>
                ))}
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
      <div className="rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 p-4 text-white">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Bladder Diary / Uroflow / UDS / Imaging Engine</h3>
            <p className="text-xs text-teal-100">ICCS 2014 · EAU Paediatric 2023 · NICE NG112 · Evidence-based analysis guide</p>
          </div>
        </div>
      </div>
      {history.length > 0 && <Badge variant="outline" className="text-xs">Step {history.length + 1}</Badge>}
      <Card><CardContent className="p-4">{renderStep()}</CardContent></Card>
      <div className="text-xs text-slate-400 text-center">ICCS Standardisation 2014 · EAU Guidelines 2023 · NICE NG112</div>
    </div>
  );
}