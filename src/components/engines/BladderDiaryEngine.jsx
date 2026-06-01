/**
 * Bladder Diary / Uroflowmetry / UDS / Radiology Selection Engine
 * Helps analyze bladder diary, uroflow curves, UDS findings, and select appropriate imaging
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Activity, BarChart3, ExternalLink } from "lucide-react";

const InfoBox = ({ title, color = "blue", items, children }) => {
  const styles = { blue: "border-blue-300 bg-blue-50", green: "border-green-300 bg-green-50", amber: "border-amber-300 bg-amber-50", red: "border-red-300 bg-red-50", violet: "border-violet-300 bg-violet-50", slate: "border-slate-200 bg-slate-50", teal: "border-teal-300 bg-teal-50" };
  const titleC = { blue: "text-blue-900", green: "text-green-900", amber: "text-amber-900", red: "text-red-900", violet: "text-violet-900", slate: "text-slate-800", teal: "text-teal-900" };
  return (
    <div className={`rounded-xl border-2 p-3 ${styles[color]}`}>
      <p className={`font-bold text-sm mb-2 ${titleC[color]}`}>{title}</p>
      {items && <ul className="space-y-1">{items.map((it, i) => <li key={i} className="text-xs text-slate-700 flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">→</span><span>{it}</span></li>)}</ul>}
      {children}
    </div>
  );
};

const STEPS = {
  START: "start",
  BLADDER_DIARY: "bladder_diary",
  UROFLOW: "uroflow",
  UDS: "uds",
  RADIOLOGY: "radiology",
  SCENARIO_VUR: "scenario_vur",
  SCENARIO_NB: "scenario_nb",
  SCENARIO_OAB: "scenario_oab",
  SCENARIO_OBSTRUCTION: "scenario_obstruction",
};

export default function BladderDiaryEngine() {
  const [step, setStep] = useState(STEPS.START);
  const [history, setHistory] = useState([]);
  const [flowPattern, setFlowPattern] = useState("");
  const [pvr, setPvr] = useState("");

  const go = (next) => { setHistory(h => [...h, step]); setStep(next); };
  const back = () => { const prev = history[history.length - 1]; if (prev) { setHistory(h => h.slice(0, -1)); setStep(prev); } };
  const reset = () => { setStep(STEPS.START); setHistory([]); setFlowPattern(""); setPvr(""); };

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
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-800">What do you need help with?</p>
            {[
              { label: "Analyse Bladder Diary — frequency, volumes, patterns", onSelect: () => go(STEPS.BLADDER_DIARY) },
              { label: "Interpret Uroflowmetry — curve shapes + Qmax + PVR", onSelect: () => go(STEPS.UROFLOW) },
              { label: "Urodynamic Studies (UDS) — cystometry, EMG, interpretation", onSelect: () => go(STEPS.UDS) },
              { label: "Select Radiological Investigations — by clinical scenario", onSelect: () => go(STEPS.RADIOLOGY) },
            ].map(opt => (
              <button key={opt.label} onClick={opt.onSelect} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50 transition-all text-left">
                <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        );

      case STEPS.BLADDER_DIARY:
        return (
          <div className="space-y-3">
            <InfoBox title="Bladder Diary Analysis (ICCS Guidelines)" color="blue">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">How to Record (ICCS 2014 Standard)</p>
                  {["Minimum 2–3 consecutive days (ideally 3 school days + 2 weekend days for children)", "Record: time of each void, volume voided, fluid intake (time + volume + type), any incontinence episodes, urgency score", "First morning void: most concentrated — important for capacity assessment", "Nocturnal: record nocturia episodes + first void after waking"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-800">Normal Values by Age (ICCS)</p>
                  <table className="w-full mt-1 text-xs">
                    <thead><tr><th className="text-left py-0.5">Age</th><th className="text-left py-0.5">Expected BC</th><th className="text-left py-0.5">Daytime freq</th></tr></thead>
                    <tbody>
                      {[["2–3y", "50–100 mL", "8–12×/day"], ["4–5y", "100–150 mL", "6–8×/day"], ["6–8y", "150–200 mL", "5–7×/day"], ["9–12y", "200–300 mL", "5–6×/day"], [">12y", "250–400 mL", "4–6×/day"]].map((r, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : ""}><td className="py-0.5">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-1 text-slate-600">Expected Bladder Capacity (EBC) = (Age + 1) × 30 mL (Koff formula). Maximum voided volume (MVV) {">"} 65% EBC = adequate capacity.</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="font-bold text-amber-900">Interpretation Patterns</p>
                  {["Overactive Bladder (OAB): high frequency (>7/day) + small volumes (<65% EBC) + urgency + nocturia", "Underactive Bladder: infrequent voiding (<3/day) + large volumes (>130% EBC) + poor stream + high PVR", "Nocturnal polyuria: nocturnal urine output >33% of 24h output (normal: <20% in children)", "Dysfunctional Voiding: normal frequency but staccato flow, abdominal straining, high PVR", "Primary nocturnal enuresis (PNE): nocturnal polyuria + normal daytime diary"].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <p className="font-bold text-red-900">Red Flags in Bladder Diary</p>
                  {["Continuous incontinence: suspected ectopic ureter or fistula", "No dry periods (24h): complete incontinence — urgent UDS + MRI/MCU", "Haematuria on diary: urgent RBUS + urine culture", "New-onset day + night wetting: consider tethered cord, DM, DI"].map((c, i) => <p key={i} className="text-red-800">• {c}</p>)}
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.UROFLOW:
        return (
          <div className="space-y-3">
            <InfoBox title="Uroflowmetry Interpretation (ICCS 2014)" color="teal">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <p className="font-bold text-teal-900">Technical Requirements</p>
                  {["Void at least 50% of expected capacity (minimum 50 mL) for valid result", "Patient should have comfortable urge to void — not urgent or suppressed", "Measure: Q-max (peak flow), Q-avg, voided volume, time to Q-max, flow curve shape, PVR by USS", "Normal Q-max: ≥15 mL/s (adults); in children: Q-max ≥12 mL/s (age-adjusted)", "Repeat 3 times for reliability (single flow not reliable alone)"].map((c, i) => <p key={i} className="text-teal-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Flow Curve Patterns — DIAGNOSIS</p>
                  {["BELL-SHAPED (normal): smooth symmetrical curve; Q-max early; good relaxation", "PLATEAU (low-amplitude): BOO (bladder outlet obstruction), PUV, meatal stenosis, urethral stricture — investigate with VCUG/MCU", "STACCATO (interrupted): dysfunctional voiding, non-relaxing sphincter, overactive EUS during voiding", "INTERMITTENT / FRACTIONATED: neurogenic UB (acontractile), abdominal straining, Valsalva voider", "SUPER-NORMAL (very high Qmax + large volume): overflow incontinence; chronically overdistended bladder", "TOWER (very high narrow peak): stress incontinence or urgency-provoked release"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">Post-Void Residual (PVR) Interpretation</p>
                  {["Normal: PVR <20 mL (young children) or <30 mL (older)", "Elevated PVR (>30 mL): incomplete emptying — proceed to UDS + RBUS", "PVR >50% voided volume: significant retention", "Always check PVR at same time as uroflow (bedside USS — immediate, non-invasive)", "High PVR + low Q-max + plateau curve → BOO vs neurogenic underactive → UDS differentiates"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                </div>
              </div>
            </InfoBox>
            <a href="/uroflow-analyzer" className="flex items-center gap-2 p-3 bg-teal-700 text-white rounded-xl text-xs font-semibold hover:bg-teal-800 transition-colors">
              <BarChart3 className="w-4 h-4" /><span>Open AI Uroflow Analyser — upload uroflow image for AI interpretation</span><ExternalLink className="w-3.5 h-3.5 ml-auto" />
            </a>
            <NavBtns />
          </div>
        );

      case STEPS.UDS:
        return (
          <div className="space-y-3">
            <InfoBox title="Urodynamic Studies (UDS) — Interpretation Guide" color="violet">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-violet-50 rounded-lg">
                  <p className="font-bold text-violet-900">Components of UDS</p>
                  {["Cystometry (CMG): measures intravesical pressure (Pves), abdominal pressure (Pabd), detrusor pressure (Pdet = Pves - Pabd) during filling and voiding", "Sphincter EMG: surface or needle — records external urethral sphincter (EUS) activity", "Uroflowmetry (video-UDS): simultaneous flow + fluoroscopy — gold standard for VUR/NB", "Urethral pressure profile (UPP): measures resting urethral closure pressure (rarely used in children)"].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Key UDS Measurements</p>
                  {["Bladder Compliance: ΔV/ΔPdet (mL/cmH₂O) — Normal: >20 mL/cmH₂O; Low (<10): stiff bladder, poor prognosis", "Detrusor Leak Point Pressure (DLPP): Pdet at first urine leak — >40 cmH₂O = HIGH RISK for upper tract", "Cystometric Capacity: volume at strong desire to void or leak — compare to EBC", "IDC (Involuntary Detrusor Contractions): rise in Pdet ≥5 cmH₂O during filling = OAB/NDO", "DSD (Detrusor-Sphincter Dyssynergia): EMG burst during detrusor contraction (simultaneous)"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <p className="font-bold text-red-900">UDS Findings → Clinical Action</p>
                  {["DLPP >40 cmH₂O: IMMEDIATE treatment — CIC + anticholinergics (prevent upper tract damage)", "Compliance <10 mL/cmH₂O + DLPP >40: augmentation cystoplasty likely needed", "DSD on EMG: CIC + anticholinergics; BTX-EUS or alpha-blocker", "IDC: anticholinergics (oxybutynin/solifenacin); refractory → BTX-A intradetrusor", "No detrusor activity (acontractile): CIC programme; alpha-blocker to facilitate CIC drainage"].map((c, i) => <p key={i} className="text-red-800">• {c}</p>)}
                </div>
              </div>
            </InfoBox>
            <a href="/uds-interpreter" className="flex items-center gap-2 p-3 bg-violet-700 text-white rounded-xl text-xs font-semibold hover:bg-violet-800 transition-colors">
              <Activity className="w-4 h-4" /><span>Open AI UDS Interpreter — upload UDS tracing for AI analysis</span><ExternalLink className="w-3.5 h-3.5 ml-auto" />
            </a>
            <NavBtns />
          </div>
        );

      case STEPS.RADIOLOGY:
        return (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800">Select clinical scenario:</p>
            {[
              { label: "Suspected VUR / Recurrent UTI — What imaging?", onSelect: () => go(STEPS.SCENARIO_VUR) },
              { label: "Neurogenic Bladder (MMC/SCI) — What imaging?", onSelect: () => go(STEPS.SCENARIO_NB) },
              { label: "OAB / Dysfunctional Voiding — What imaging?", onSelect: () => go(STEPS.SCENARIO_OAB) },
              { label: "Suspected Obstruction (PUV, UPJ, Stricture)", onSelect: () => go(STEPS.SCENARIO_OBSTRUCTION) },
            ].map(opt => (
              <button key={opt.label} onClick={opt.onSelect} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50 text-left text-sm">
                {opt.label} <ChevronRight className="w-4 h-4 text-slate-400 ml-2" />
              </button>
            ))}
            <NavBtns />
          </div>
        );

      case STEPS.SCENARIO_VUR:
        return (
          <div className="space-y-3">
            <InfoBox title="Imaging in Suspected VUR / Recurrent UTI" color="teal">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "1st Line: Renal-Bladder USS (RBUS)", c: "bg-teal-50", items: ["ALL children with first febrile UTI; assess: hydronephrosis, echogenicity, bladder wall, PVR", "Timing: within 24–48h (acute) or 4–6 weeks (follow-up)", "What to look for: SFU hydronephrosis grade, renal size, cortical thinning, bladder wall thickening (>3 mm empty = abnormal)"] },
                  { t: "2nd Line: MCUG / VCUG (Micturating Cystourethrogram)", c: "bg-blue-50", items: ["Indications: ISPN 2021 — abnormal RBUS, recurrent febrile UTI ≥2, males, bilateral HN, family history VUR", "Timing: 2–4 weeks after UTI resolves (infection must be clear — culture negative)", "What to assess: VUR grade (I–V), bladder trabeculation, bladder capacity, PUV (males — posterior urethral dilation)", "Alternative: Indirect isotope cystography (nuclear cystogram): less radiation, no anatomical detail, use for follow-up only"] },
                  { t: "3rd Line: DMSA Scintigraphy", c: "bg-violet-50", items: ["Timing: 4–6 MONTHS post-acute pyelonephritis (acute defects resolve; permanent scars remain)", "Indication: febrile UTI + abnormal RBUS or ≥2 febrile UTIs", "What to assess: split renal function, cortical scars, pyelonephritic changes", "Acute-phase DMSA (within 5 days): only if diagnosis uncertain (atypical presentation)"] },
                  { t: "4th Line: MAG3 Diuretic Renogram", c: "bg-amber-50", items: ["Indication: hydronephrosis present on RBUS — rule out obstruction (UPJ/UVJ)", "Provides: differential renal function + drainage pattern (T½ washout)", "Grade 3–4 HN + poor drainage: consult paediatric urology for UPJ repair"] },
                ].map((s, i) => (
                  <div key={i} className={`p-2 rounded-lg ${s.c}`}>
                    <p className="font-bold text-slate-800 mb-1">{s.t}</p>
                    {s.items.map((it, j) => <p key={j} className="text-slate-700">• {it}</p>)}
                  </div>
                ))}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.SCENARIO_NB:
        return (
          <div className="space-y-3">
            <InfoBox title="Imaging in Neurogenic Bladder (MMC / SCI)" color="violet">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "MRI Spine (ALWAYS first in suspected NB)", c: "bg-violet-50", items: ["Full spine MRI with gadolinium if inflammation/tumour suspected", "Assess: conus level, tethering, lipoma, syrinx, disc disease, tumour", "Repeat post-untethering if new urological deterioration"] },
                  { t: "RBUS (Renal-Bladder USS) — Surveillance", c: "bg-blue-50", items: ["Every 6 months in first 2–3y (MMC, high-risk NB)", "Annually thereafter", "Assess: HN grade, bladder wall thickness, PVR, bladder diverticula"] },
                  { t: "VCUG — for New/Changing HN", c: "bg-teal-50", items: ["Perform when new or worsening HN on surveillance USS", "Assess: VUR (high-grade VUR common in DSD pattern), bladder capacity, trabeculation", "Video-UDS: simultaneous VCUG + cystometry — gold standard in complex NB"] },
                  { t: "DMSA Scintigraphy — Annual if UTI/VUR", c: "bg-amber-50", items: ["Annual in NB patients with recurrent UTI or known VUR", "Tracks cortical scarring over time", "Split function: guides decisions about nephrectomy vs transplant in ESKD from NB"] },
                  { t: "MRI Kidneys / Abdomen (selected)", c: "bg-slate-50", items: ["If USS inadequate (obesity, bowel gas)", "Pre-augmentation planning: assess bladder anatomy, ureter anatomy", "Post-augmentation: if complications suspected (perforation, obstruction)"] },
                ].map((s, i) => (
                  <div key={i} className={`p-2 rounded-lg ${s.c}`}>
                    <p className="font-bold text-slate-800 mb-1">{s.t}</p>
                    {s.items.map((it, j) => <p key={j} className="text-slate-700">• {it}</p>)}
                  </div>
                ))}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.SCENARIO_OAB:
        return (
          <div className="space-y-3">
            <InfoBox title="Imaging in OAB / Dysfunctional Voiding" color="amber">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "RBUS (First-line always)", c: "bg-amber-50", items: ["Post-void residual (PVR) — key measurement in OAB + voiding dysfunction", "Bladder wall thickness: thickened (>3 mm at 50% capacity) = hypertrophied detrusor from OAB", "Kidney size: compensatory hypertrophy if solitary or contralateral small; cortical thinning if chronic vesicoureteral back-pressure"] },
                  { t: "Uroflowmetry + PVR — Non-invasive Initial Test", c: "bg-blue-50", items: ["Free uroflow curve shape: staccato = dysfunctional voiding; plateau = BOO", "Perform first before invasive UDS", "3 voids over 2 sessions for reliability"] },
                  { t: "VCUG — If Recurrent UTI or Abnormal USS", c: "bg-teal-50", items: ["Not needed in isolated OAB without UTI or HN", "Perform if RBUS abnormal, recurrent UTI, or poor UDS response to treatment"] },
                  { t: "Spinal MRI — If Refractory or Neurological Signs", c: "bg-violet-50", items: ["Rule out tethered cord, sacral agenesis, spinal tumour", "Particularly: new-onset wetting after being dry, back pain, gait change + voiding symptoms", "Sacral X-ray: if MRI not available — bony defects of S2–S4"] },
                ].map((s, i) => (
                  <div key={i} className={`p-2 rounded-lg ${s.c}`}>
                    <p className="font-bold text-slate-800 mb-1">{s.t}</p>
                    {s.items.map((it, j) => <p key={j} className="text-slate-700">• {it}</p>)}
                  </div>
                ))}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.SCENARIO_OBSTRUCTION:
        return (
          <div className="space-y-3">
            <InfoBox title="Imaging in Suspected Obstruction (PUV / UPJ / Stricture)" color="red">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "RBUS — First Line", c: "bg-blue-50", items: ["Bilateral HN + thick-walled bladder in male infant → PUV until proven otherwise (emergency VCUG)", "Unilateral HN: UPJ vs UVJ obstruction — MAG3 to determine drainage", "Measure: SFU grade, AP diameter of pelvis, ureteral dilation, bladder wall"] },
                  { t: "MCUG / VCUG — Mandatory for Male HN or PUV Suspicion", c: "bg-red-50", items: ["PUV: posterior urethral dilation + thick bladder wall + bilateral HN on USS = emergency VCUG", "VCUG shows: filling defect at level of verumontanum (Type 1 PUV most common)", "VUR evaluation simultaneously — often present with PUV"] },
                  { t: "MAG3 Diuretic Renogram — Functional Assessment", c: "bg-amber-50", items: ["Perform when UPJ/UVJ obstruction suspected (unilateral HN + dilated pelvis)", "T½ washout >20 min = obstructed; 10–20 = equivocal; <10 = unobstructed", "Split function: if affected kidney <35% → consult for pyeloplasty"] },
                  { t: "CT Urography / MRI Urography — Complex Cases", c: "bg-violet-50", items: ["When USS + VCUG + MAG3 insufficient for surgical planning", "Ureterocele, duplex system anatomy, complex CAKUT", "MR urography: avoids radiation; better soft tissue detail; preferred in children when possible"] },
                ].map((s, i) => (
                  <div key={i} className={`p-2 rounded-lg ${s.c}`}>
                    <p className="font-bold text-slate-800 mb-1">{s.t}</p>
                    {s.items.map((it, j) => <p key={j} className="text-slate-700">• {it}</p>)}
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
      <div className="rounded-xl bg-gradient-to-r from-teal-700 to-cyan-600 p-4 text-white">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Bladder Diary · Uroflow · UDS · Radiology Engine</h3>
            <p className="text-xs text-teal-200">ICCS 2014 · EAU Neuro-urology 2023 · ISPN 2021</p>
          </div>
        </div>
      </div>
      {history.length > 0 && <Badge variant="outline" className="text-xs">Step {history.length + 1}</Badge>}
      <Card><CardContent className="p-4">{renderStep()}</CardContent></Card>
      <div className="text-xs text-slate-400 text-center">ICCS 2014 Standardisation · EAU Neuro-urology · ISPN UTI/VUR 2021 · Paediatric Urology Consensus</div>
    </div>
  );
}