/**
 * Neurogenic Bladder Engine
 * Approach to diagnosis, classification, investigation, and management
 * ICCS · ISNO · EAU Paediatric Urology · NICE
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Activity } from "lucide-react";

const STEPS = { START: "start", ETIOLOGY: "etiology", CLASSIFICATION: "classification", INVESTIGATIONS: "investigations", URODYNAMICS: "urodynamics", MANAGEMENT: "management", SURVEILLANCE: "surveillance" };

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

function Q({ question, note, options, onSelect }) {
  return (
    <div className="space-y-2">
      <p className="font-semibold text-sm text-slate-800">{question}</p>
      {note && <p className="text-xs text-slate-500 italic">{note}</p>}
      {options.map(opt => (
        <button key={opt.label} onClick={() => onSelect(opt.next)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50 transition-all text-left">
          <span className="text-sm font-medium text-slate-700">{opt.label}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
        </button>
      ))}
    </div>
  );
}

export default function NeurogenicBladderEngine() {
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
          <Q question="Neurogenic Bladder Engine — What do you need?" onSelect={go} options={[
            { label: "Aetiology & Risk Factors — causes of neurogenic bladder", next: STEPS.ETIOLOGY },
            { label: "Classification (ICCS) — overactive vs underactive detrusor", next: STEPS.CLASSIFICATION },
            { label: "Investigations — imaging, UDS indications", next: STEPS.INVESTIGATIONS },
            { label: "Urodynamics Interpretation — guide to UDS parameters", next: STEPS.URODYNAMICS },
            { label: "Management — CIC, anticholinergics, botox, surgery", next: STEPS.MANAGEMENT },
            { label: "Surveillance Plan — LUTD monitoring schedule", next: STEPS.SURVEILLANCE },
          ]} />
        );

      case STEPS.ETIOLOGY:
        return (
          <div className="space-y-3">
            <InfoBox title="Aetiology of Neurogenic Bladder in Children" color="teal">
              <div className="mt-2 space-y-2">
                {[
                  { t: "Congenital (most common in paediatrics)", items: ["Myelomeningocele / Spina Bifida (MMC) — most common cause in children; lesion level determines function", "Sacral agenesis / caudal regression syndrome", "Anorectal malformations (ARM/VATER/VACTERL)", "Tethered cord syndrome — progressive neurological deterioration", "Occult spinal dysraphism (lipomeningocele, diastematomyelia, dermal sinus)"] },
                  { t: "Acquired", items: ["Spinal cord injury (trauma, tumour, transverse myelitis)", "Spinal tumours (ependymoma, astrocytoma)", "Iatrogenic: post-surgery for sacral tumours, extended pelvic resections", "Demyelinating: Guillain-Barré, multiple sclerosis (rare in children)", "Cerebral palsy: cortical/subcortical — detrusor overactivity pattern"] },
                  { t: "Functional (Neuropathic pattern without lesion)", items: ["Behavioural neurogenic bladder / non-neurogenic neurogenic bladder (Hinman syndrome)", "Fowler syndrome (urinary retention, young females)", "Dysfunctional voiding (learned detrusor-sphincter dyssynergia)"] },
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

      case STEPS.CLASSIFICATION:
        return (
          <div className="space-y-3">
            <InfoBox title="ICCS Classification of Neurogenic LUTD" color="violet">
              <div className="mt-2 space-y-2">
                <p className="text-xs text-slate-600 italic">Two dimensions: Detrusor (storage function) + Outlet (sphincter/urethral function)</p>
                {[
                  { t: "Detrusor Overactivity (Spastic Bladder)", color: "bg-red-50 border-red-100", items: ["Uninhibited contractions during filling → incontinence, urgency, high pressures", "High detrusor leak point pressure (DLPP >40 cmH₂O) → renal damage risk", "Typical: suprasacral lesions (cervical, thoracic cord); cerebral palsy", "Urodynamics: phasic contractions, reduced bladder capacity, poor compliance"] },
                  { t: "Detrusor Underactivity (Flaccid Bladder)", color: "bg-blue-50 border-blue-100", items: ["Acontractile detrusor → overflow incontinence, large residual volume", "Low pressures but chronic overdistension → upper tract risk", "Typical: sacral lesions (spina bifida sacral level), cauda equina", "Urodynamics: no contractions, large capacity, low pressure throughout filling"] },
                  { t: "Outlet Classification", color: "bg-green-50 border-green-100", items: ["Competent (normal resistance): adequate continence", "Overactive (DSD — detrusor-sphincter dyssynergia): simultaneous contraction of detrusor + EUS → high pressure voiding", "Incompetent (low resistance): stress incontinence, continuous dribbling"] },
                  { t: "Combined Patterns — Clinical Risk", color: "bg-amber-50 border-amber-100", items: ["HIGH RISK: Overactive detrusor + DSD (dyssynergic) — DLPP >40 cmH₂O → renal damage assured without treatment", "Intermediate: Flaccid bladder + high residual → recurrent UTI, upper tract dilation", "Lower risk: Underactive detrusor + incompetent outlet → CIC responsive"] },
                ].map((s, i) => (
                  <div key={i} className={`p-2 rounded-lg border ${s.color}`}>
                    <p className="text-xs font-bold text-slate-800">{s.t}</p>
                    {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
                  </div>
                ))}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.INVESTIGATIONS:
        return (
          <div className="space-y-3">
            <InfoBox title="Investigations: Neurogenic Bladder" color="blue">
              <div className="mt-2 space-y-2">
                {[
                  { t: "Baseline (All patients)", items: ["Urine: dipstick, MCS (rule out UTI before UDS)", "Renal function: eGFR, electrolytes, creatinine", "Ultrasound KUB: assess upper tracts, hydronephrosis, bladder wall thickness, residual volume (post-void)", "Bladder diary: 3-day diary (voiding frequency, episodes, volumes, leaks)"] },
                  { t: "Urodynamic Studies (UDS) — Indications", items: ["ALL children with spina bifida / MMC — at birth and regular follow-up", "Any suspected DSD or high pressure bladder", "Recurrent UTI with neurological background", "Unexplained hydronephrosis + neurological condition", "Before starting treatment and assessing treatment response", "Pre-operatively for bladder augmentation / Mitrofanoff planning"] },
                  { t: "Imaging", items: ["VCUG / MCU: assess VUR (secondary VUR common in high-pressure NB)", "MAG3 diuretic renogram: differential function + drainage", "MRI spine: assess cord tethering, lipoma, diastematomyelia", "DMSA: renal scarring assessment"] },
                  { t: "Neurophysiology (selected cases)", items: ["Electromyography (EMG): EUS activity during voiding (confirm DSD)", "Sacral reflex: S2–S4 arc assessment", "Pudendal nerve terminal motor latency (PNTML)"] },
                ].map((s, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-blue-100">
                    <p className="text-xs font-bold text-blue-900">{s.t}</p>
                    {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
                  </div>
                ))}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.URODYNAMICS:
        return (
          <div className="space-y-3">
            <InfoBox title="Urodynamics (UDS) — Key Parameters" color="amber">
              <div className="mt-2 space-y-2">
                {[
                  { t: "Key UDS Parameters to Measure", items: ["Cystometric capacity (age-expected: [age+2] × 30 mL or EBC = [age(y)/2 + 6] × 30 mL)", "Detrusor compliance (normal: >20 mL/cmH₂O; <10 = poor — upper tract risk)", "Detrusor Leak Point Pressure (DLPP): >40 cmH₂O = renal risk threshold (KDIGO)", "Abdominal Leak Point Pressure (ALPP): for stress incontinence assessment", "Post-void residual (PVR): >20% expected bladder capacity is abnormal"] },
                  { t: "Bladder Compliance — Critical Concept", items: ["Low compliance = small volume change per unit pressure rise", "Causes: neurogenic fibrosis, chronic overdistension, previous surgery, infection", "Low compliance + DSD = the MOST dangerous combination (DLPP rises rapidly)", "Target: compliance >20 mL/cmH₂O with treatment"] },
                  { t: "Pressure-Flow Study (PFS)", items: ["Assess voiding efficiency: detrusor pressure during voiding + flow rate", "DSD pattern: high detrusor pressure + interrupted/low flow (EMG burst = DSD confirmed)", "Underactive detrusor: low detrusor pressure + normal/low flow"] },
                  { t: "Interpreting EMG (EUS activity)", items: ["Normal: EMG quiet during voiding (sphincter relaxes)", "DSD: EMG activity INCREASES during detrusor contraction = dyssynergia", "Denervated: silent EMG (sacral lesion)"] },
                ].map((s, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-amber-100">
                    <p className="text-xs font-bold text-amber-900">{s.t}</p>
                    {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
                  </div>
                ))}
              </div>
            </InfoBox>
            <div className="rounded-xl bg-teal-50 border border-teal-200 p-2 text-xs text-teal-900">
              💡 Link to <strong>UDS Analyser tool</strong> for AI-assisted interpretation of your UDS trace
            </div>
            <NavBtns />
          </div>
        );

      case STEPS.MANAGEMENT:
        return (
          <div className="space-y-3">
            <InfoBox title="Management of Neurogenic Bladder" color="green">
              <div className="mt-2 space-y-2">
                {[
                  { t: "1. Clean Intermittent Catheterisation (CIC) — Cornerstone", items: ["Indication: ANY incomplete bladder emptying (PVR >20%) or high-pressure detrusor + overflow", "Frequency: every 3–4h in young children; 4–5× daily in older children/adolescents", "Catheter: Nelaton / hydrophilic (ADHD patients — single-use preferred)", "Volume per catheterisation: should not exceed expected bladder capacity", "Technique: sterile in hospital; clean at home (CLEAN technique is equivalent in outcomes)"] },
                  { t: "2. Anticholinergic / Muscarinic Antagonists (Overactive Detrusor)", items: ["Oxybutynin: 0.2 mg/kg TID or 5 mg TID (>5y); also intravesical oxybutynin 0.3 mg/kg/day in 3 doses (if systemic side effects)", "Tolterodine: 1–2 mg BD (>5y) — fewer CNS side effects", "Solifenacin (>6y): 5 mg OD — once daily, better adherence", "Trospium chloride: less CNS penetration — useful in cognitive impairment"] },
                  { t: "3. Beta-3 Agonist (Mirabegron) — Overactive Detrusor", items: ["Mirabegron 25–50 mg OD (older children/adolescents)", "Used if anticholinergics failed or poorly tolerated", "Check BP before starting; contraindicated in severe uncontrolled HTN"] },
                  { t: "4. Botulinum Toxin A (Intravesical Botox)", items: ["Indication: refractory detrusor overactivity / high DLPP despite oral therapy", "Dose: 10 U/kg or 50–100 U per injection (max 200 U); multiple sites (10–20 injections)", "Duration: 6–12 months; repeat under GA/sedation", "Monitor: urinary retention (may need to start CIC), UTI, haematuria"] },
                  { t: "5. Surgical Options", items: ["Bladder augmentation (ileocystoplasty): for small, non-compliant, high-pressure bladder refractory to botox/CIC", "Mitrofanoff procedure: continent catheterisable channel (appendix/ileum → umbilicus or RIF)", "Bladder neck procedure: for incompetent outlet (fascial sling, AUS, bladder neck injection)", "Urinary diversion: last resort (ileal conduit) for failed augmentation or severe upper tract damage"] },
                  { t: "6. Bowel Management (always co-manage)", items: ["Neurogenic bowel co-exists in spina bifida / cord injury", "Polyethylene glycol (macrogol) for constipation — constipation worsens bladder function", "Bowel irrigation programs: MACE (Malone antegrade continence enema)"] },
                ].map((s, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-green-100">
                    <p className="text-xs font-bold text-green-900">{s.t}</p>
                    {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
                  </div>
                ))}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.SURVEILLANCE:
        return (
          <div className="space-y-3">
            <InfoBox title="Surveillance Plan — Neurogenic Bladder" color="slate"
              items={["Goal: prevent upper tract damage (renal scarring, hydronephrosis, CKD) while achieving social continence"]}>
              <div className="mt-2 space-y-1.5">
                {[
                  { t: "Spina Bifida / MMC — Standard Protocol", items: ["Neonatal period: baseline UDS at 6–8 weeks; renal/bladder USS at birth and 3 months", "Annual: UDS + USS + eGFR + UPCR + urine culture", "DMSA: if recurrent UTI or rising creatinine; at 5y baseline", "VCUG: if dilating upper tracts or suspected VUR", "Ophthalmology + neurosurgery: annual review (shunt function, tethered cord)"] },
                  { t: "Indicators Requiring Urgent Re-assessment", items: ["New hydronephrosis or worsening on USS", "DLPP rising >40 cmH₂O on UDS", "Recurrent febrile UTI (especially if undertreated)", "Declining eGFR", "New neurological symptoms (tethered cord release needed)", "Social continent at 5y but develops new wetting"] },
                ].map((s, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{s.t}</p>
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
      <div className="rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Neurogenic Bladder Intelligence Engine</h3>
            <p className="text-xs text-teal-200">ICCS · ISNO · EAU Paediatric Urology · NICE · Paediatric Spina Bifida Guidelines</p>
          </div>
        </div>
      </div>
      {history.length > 0 && <Badge variant="outline" className="text-xs">Step {history.length + 1}</Badge>}
      <Card><CardContent className="p-4">{renderStep()}</CardContent></Card>
      <div className="text-xs text-slate-400 text-center">ICCS Standardisation · EAU Paediatric Urology 2023 · NICE NG112 · ISNO Consensus</div>
    </div>
  );
}