/**
 * Neurogenic Bladder Engine
 * Classification → Investigations → Urodynamics → Management by type
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Activity, ExternalLink } from "lucide-react";

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

const Q = ({ question, note, options }) => (
  <div className="space-y-2">
    <p className="font-semibold text-sm text-slate-800">{question}</p>
    {note && <p className="text-xs text-slate-500 italic">{note}</p>}
    {options.map(opt => (
      <button key={opt.label} onClick={opt.onSelect}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50 transition-all text-left">
        <span className="text-sm font-medium text-slate-700">{opt.label}</span>
        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
      </button>
    ))}
  </div>
);

const STEPS = {
  START: "start",
  AETIOLOGY: "aetiology",
  CLASSIFICATION: "classification",
  INVESTIGATIONS: "investigations",
  OVERACTIVE: "overactive",
  UNDERACTIVE: "underactive",
  DSD: "dsd",
  SPINAL_DYSGRAPHISM: "spinal_dysgraphism",
  CIC_PROTOCOL: "cic_protocol",
  PHARMACOLOGY: "pharmacology",
  MONITORING: "monitoring",
  SURGICAL: "surgical",
};

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
          <Q question="What do you need help with?" options={[
            { label: "Aetiology — causes of neurogenic bladder in children", onSelect: () => go(STEPS.AETIOLOGY) },
            { label: "Classification — Overactive/Underactive bladder + DSD", onSelect: () => go(STEPS.CLASSIFICATION) },
            { label: "Investigations — UDS, imaging, urodynamics selection", onSelect: () => go(STEPS.INVESTIGATIONS) },
            { label: "Management — Overactive neurogenic bladder", onSelect: () => go(STEPS.OVERACTIVE) },
            { label: "Management — Underactive/Acontractile bladder (CIC)", onSelect: () => go(STEPS.UNDERACTIVE) },
            { label: "Detrusor-Sphincter Dyssynergia (DSD)", onSelect: () => go(STEPS.DSD) },
            { label: "Spinal Dysraphism (myelomeningocele, tethered cord)", onSelect: () => go(STEPS.SPINAL_DYSGRAPHISM) },
            { label: "CIC Protocol — technique + catheter selection", onSelect: () => go(STEPS.CIC_PROTOCOL) },
            { label: "Pharmacotherapy — anticholinergics, alpha-blockers, botox", onSelect: () => go(STEPS.PHARMACOLOGY) },
            { label: "Surgical Options — augmentation, Mitrofanoff, bladder neck", onSelect: () => go(STEPS.SURGICAL) },
            { label: "Monitoring Plan", onSelect: () => go(STEPS.MONITORING) },
          ]} />
        );

      case STEPS.AETIOLOGY:
        return (
          <div className="space-y-3">
            <InfoBox title="Causes of Neurogenic Bladder in Children" color="teal">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "Congenital (most common)", c: "bg-teal-50", items: ["Myelomeningocele (MMC) / Spina bifida — most common cause; bowel & bladder neurogenic", "Lipomyelomeningocele / spinal lipoma (occult dysraphism)", "Sacral agenesis / caudal regression syndrome — often associated with maternal diabetes", "Anorectal malformations (imperforate anus) — Currarino triad (SC lipoma + anorectal + sacral); 20–30% have neurogenic bladder", "Bladder exstrophy-epispadias complex (structural, not truly neurogenic but managed similarly)"] },
                  { t: "Acquired — Spinal", c: "bg-amber-50", items: ["Spinal cord injury (trauma): MVA, diving, birth injury (cervical — neonates)", "Spinal cord tumour: ependymoma, astrocytoma, schwannoma (compression)", "Tethered spinal cord syndrome (post-MMC repair, post-meningitis scarring)", "Transverse myelitis (auto-immune — post-infectious; ADEM)", "Friedreich's ataxia, spinal muscular atrophy (SMA)"] },
                  { t: "Acquired — Brain", c: "bg-blue-50", items: ["Cerebral palsy (upper motor neuron — overactive bladder)", "Traumatic brain injury", "CNS tumour affecting pontine micturition centre", "Stroke in adolescent"] },
                  { t: "Infectious / Inflammatory", c: "bg-red-50", items: ["Spinal TB (Pott's disease)", "Viral myelitis (enterovirus, HSV, CMV)", "Schistosomiasis (bladder infiltration — especially S. haematobium)"] },
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

      case STEPS.CLASSIFICATION:
        return (
          <div className="space-y-3">
            <InfoBox title="Neurogenic Bladder Classification (EAU / ICCS Guidelines)" color="blue">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "Overactive Detrusor (OAB) — UMN (supra-sacral) lesion", c: "bg-blue-50", items: ["High detrusor pressure, small capacity, uninhibited contractions (IDC)", "Associated: cerebral palsy, spinal injury above S2, cervical myelopathy, tethered cord (partial)", "UDS findings: High DLPP (detrusor leak point pressure >40 cmH₂O = upper tract risk), reduced compliance, IDC", "Clinically: urgency, frequency, incontinence; risk of VUR and upper tract deterioration"] },
                  { t: "Underactive / Acontractile Detrusor — LMN (sacral/infrasacral) lesion", c: "bg-amber-50", items: ["Low or no detrusor pressure; large capacity bladder; overflow incontinence", "Associated: sacral agenesis, cauda equina injury, post-pelvic surgery, MMC at S3–S5", "UDS findings: Large capacity, flat detrusor trace, high PVR (post-void residual), low VLPP", "Clinically: dribbling, retention, recurrent UTIs; risk of back-pressure upper tract damage from overdistension"] },
                  { t: "Detrusor-Sphincter Dyssynergia (DSD)", c: "bg-red-50", items: ["Simultaneous detrusor contraction + sphincter contraction (failure of coordination)", "Associated: suprasacral SCI, MMC, tethered cord", "UDS: high pressure voiding, interrupted flow, high PVR, detrusor-sphincter EMG dyssynergia", "HIGH RISK: DSD + high pressure = most dangerous pattern for upper tract — immediate treatment", "Clinically: poor stream, straining, incomplete emptying, recurrent UTI"] },
                  { t: "Small, Poorly Compliant Bladder", c: "bg-violet-50", items: ["Reduced bladder wall compliance → high resting pressures even without detrusor contraction", "Associated: MMC, post-radiation, chronic outlet obstruction (PUV), long-standing NB", "UDS: DLPP reached at low volumes; poor compliance curve (steep slope)", "Critical threshold: DLPP >40 cmH₂O = unacceptable upper tract risk — needs urgent treatment"] },
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

      case STEPS.INVESTIGATIONS:
        return (
          <div className="space-y-3">
            <InfoBox title="Investigations for Neurogenic Bladder" color="slate">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "Baseline (All children with NB)", c: "bg-slate-50", items: ["Renal-bladder ultrasound (RBUS): hydronephrosis, bladder wall thickness, post-void residual", "Serum creatinine, eGFR, electrolytes", "Urine dipstick + culture (UTI baseline)", "Spine: MRI spine (full) — tethering, syrinx, cord position, lipoma"] },
                  { t: "Urodynamic Studies (UDS) — ESSENTIAL", c: "bg-blue-50", items: ["Cystometry: filling (detrusor compliance, DLPP, IDC) + voiding (detrusor pressure, EMG)", "EMG (sphincter): detects DSD (simultaneous sphincter + detrusor activation)", "Uroflowmetry + PVR: flow curve shape, volume, residual (non-invasive first step)", "Video-urodynamics: cystometry + fluoroscopy simultaneously — gold standard if VUR/reflux suspected", "DLPP >40 cmH₂O = HIGH RISK → immediate treatment (CIC, anticholinergics, botox)", "Frequency: At diagnosis; repeat 12-monthly in MMC first 5y; every 2–3y thereafter"] },
                  { t: "Upper Tract Imaging", c: "bg-green-50", items: ["VCUG: if hydroureteronephrosis or recurrent UTI (VUR detection in NB)", "MAG3 renogram: differential renal function + drainage; repeat if hydronephrosis", "DMSA: cortical scarring (yearly if recurrent UTI or VUR)", "MRI kidneys: structural detail if USS equivocal"] },
                  { t: "Electrophysiology", c: "bg-violet-50", items: ["Sphincter EMG (needle): pudendal nerve latency, motor unit characteristics", "Sensory testing (bladder sensation): may be absent in complete LMN lesions", "Pudendal SSEP: assess sacral reflex arc integrity"] },
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

      case STEPS.OVERACTIVE:
        return (
          <div className="space-y-3">
            <InfoBox title="Management — Overactive Neurogenic Bladder" color="blue">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "Anticholinergic Therapy (First-Line)", c: "bg-blue-50", items: ["Oxybutynin IR: 0.2 mg/kg TDS (max 5 mg TDS); start low, titrate up", "Oxybutynin ER: 5 mg OD (>5y); better tolerated (fewer side effects)", "Solifenacin: 5 mg OD (adolescents) — more bladder-selective, less dry mouth", "Tolterodine ER: 1–2 mg OD (>2y) — less CNS penetration vs oxybutynin", "Intravesical oxybutynin: 5 mg in 30 mL NS instilled via CIC catheter BD — avoids systemic side effects", "Side effects: dry mouth, constipation (opioid/anticholinergic — use macrogol), blurred vision, cognitive (oxybutynin)"] },
                  { t: "Botulinum Toxin A (BTX-A) — Onabotulinumtoxin", c: "bg-violet-50", items: ["Indication: OAB refractory to ≥2 anticholinergics, DLPP >40 cmH₂O, poor compliance", "Dose: 100–200 units (child ≤30 kg: 10 U/kg; adult dose max 200–300 U) divided over 20–30 injection sites in detrusor", "Under GA/sedation; repeat every 6–12 months", "Effect: reduces IDC, improves compliance, lowers DLPP; onset 2 weeks, peak 4–6 weeks", "Risk: complete urinary retention — must be willing to perform CIC post-BTX; UTI risk", "NICE guidance (2021): recommended for neurogenic detrusor overactivity refractory to conservative Rx"] },
                  { t: "CIC (Clean Intermittent Catheterisation) + Anticholinergic", c: "bg-green-50", items: ["CIC 4–6 times/day to ensure low-pressure emptying", "Prevents overdistension despite poor compliance", "Essential adjunct to BTX-A (may cause complete retention)"] },
                  { t: "Augmentation Cystoplasty (Surgical)", c: "bg-amber-50", items: ["Ileocystoplasty: most common — ileal patch increases bladder capacity; reduces pressure", "Indication: refractory high-pressure bladder despite medical + BTX-A; DLPP persistently >40", "Requires lifelong CIC post-augmentation (detrusor no longer contracts adequately)", "Risks: mucus production, metabolic acidosis, UTI, bowel complications, perforation (rare, serious)"] },
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

      case STEPS.UNDERACTIVE:
        return (
          <div className="space-y-3">
            <InfoBox title="Management — Underactive / Acontractile Bladder" color="amber">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "Clean Intermittent Catheterisation (CIC) — Mainstay", c: "bg-amber-50", items: ["Goal: regular bladder emptying 4–6× daily; prevent overdistension + reflux + UTI", "Target PVR: <20 mL in children <2y; <30 mL in older children after CIC", "Hydrophilic or standard PVC catheters — patient + family education essential", "Nocturnal: usually 1 CIC at bedtime (or DDAVP if nocturnal incontinence is the only issue)", "CAP (continuous antibiotic prophylaxis): consider if recurrent febrile UTIs on CIC — trimethoprim 2 mg/kg OD nocte"] },
                  { t: "Alpha-Adrenergic Antagonists (reduce outlet resistance)", c: "bg-blue-50", items: ["Terazosin 0.5–1 mg OD or tamsulosin 0.4 mg OD (adolescents)", "Reduces internal sphincter tone → facilitates emptying by abdominal straining + Credé manoeuvre", "Use if incomplete emptying despite CIC + high LPP (LMN pattern)"] },
                  { t: "Credé / Valsalva Voiding (selected cases)", c: "bg-slate-50", items: ["Suprapubic pressure to initiate voiding (Credé manoeuvre)", "Only safe if NO DSD and outlet resistance low (confirmed on UDS)", "Contraindicated if DSD present (increases intravesical pressure → reflux risk)"] },
                  { t: "Mitrofanoff Continent Stoma", c: "bg-green-50", items: ["Appendicovesicostomy — continent channel (appendix/Yang-Monti) from skin to bladder", "Allows CIC via small umbilical/RLIF stoma (avoids urethral catheterisation — especially in females, spinal dysraphism)", "Combined with augmentation if bladder small/non-compliant"] },
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

      case STEPS.DSD:
        return (
          <div className="space-y-3">
            <InfoBox title="Detrusor-Sphincter Dyssynergia (DSD)" color="red">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-red-50">
                  <p className="font-bold text-red-900 mb-1">⚡ HIGH RISK — Upper tract damage if untreated</p>
                  {["DSD: simultaneous contraction of detrusor AND external urethral sphincter during voiding", "Results in: high intravesical pressure (often >100 cmH₂O), functional obstruction, VUR, hydronephrosis, renal failure", "Detected on UDS: concurrent EMG activity during detrusor contraction on cystometry", "Video-UDS: pinching of urethra at EUS level during voiding attempt"].map((c, i) => <p key={i} className="text-red-800">• {c}</p>)}
                </div>
                {[
                  { t: "CIC + Anticholinergics (First-line combination)", c: "bg-amber-50", items: ["Abolishes dangerous voiding attempts — low-pressure storage + regular CIC emptying", "Anticholinergics suppress IDC + reduce maximum detrusor pressure", "Oxybutynin + CIC: most evidence; target DLPP <40 cmH₂O"] },
                  { t: "Alpha-Blockers (adjunct)", c: "bg-blue-50", items: ["Tamsulosin 0.4 mg OD: reduces sphincter tone → facilitates CIC emptying", "May allow lower CIC volumes; less effective than CIC for definitive management"] },
                  { t: "Botulinum Toxin — External Urethral Sphincter (EUS-BTX)", c: "bg-violet-50", items: ["Injection into EUS under cystoscopy (1–4 sites); onabotulinum 50–100 U", "Reduces EUS tone → breaks DSD cycle; allows voiding at lower pressures", "Duration: 3–6 months; can be repeated", "More commonly used in spinal cord injury adults; paediatric evidence growing"] },
                  { t: "Sacral Neuromodulation (SNM)", c: "bg-green-50", items: ["InterStim / tined lead at S3", "Better evidence for non-neurogenic OAB; limited data in NB", "Consider in selected patients with partial neurological lesion + incomplete DSD"] },
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

      case STEPS.SPINAL_DYSGRAPHISM:
        return (
          <div className="space-y-3">
            <InfoBox title="Neurogenic Bladder in Spinal Dysraphism (MMC)" color="violet">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "Myelomeningocele (MMC) — Key Points", c: "bg-violet-50", items: ["ALL MMC patients have neurogenic bladder; type depends on level + lesion completeness", "High (T-L): usually DSD + overactive bladder; HIGH RISK for upper tract damage", "Low (S2–S5): acontractile/underactive; CIC + alpha blocker", "Start CIC from birth or early infancy (even before UDS confirmation)", "Upper tract surveillance ESSENTIAL — RBUS every 6 months in first 2–3 years", "Urological follow-up every 6–12 months lifelong"] },
                  { t: "Tethered Cord Syndrome (TCS)", c: "bg-amber-50", items: ["Conus medullaris tethered below L1–L2 by fibrous band, lipoma, or diastematomyelia", "Insidious onset: progressive urological deterioration — new-onset incontinence, change in UDS pattern, back pain, worsening orthopedic status", "Diagnosis: MRI spine (low conus + tethering band)", "Treatment: neurosurgical untethering — urological function may stabilise or improve", "Post-untethering: UDS within 6–12 months; surveillance ongoing (re-tethering risk)"] },
                  { t: "Proactive Early Urological Management Protocol", c: "bg-green-50", items: ["Neonatal period: start CIC within days of MMC closure; RBUS at 4–6 weeks", "Age <2y: RBUS every 6 months; UDS at 3 months and 1 year", "Anticholinergics: start if UDS shows DLPP >40 cmH₂O, IDC, or poor compliance", "Age 2–5y: UDS annually; RBUS every 6–12 months", "Age >5y: UDS every 2–3 years; transition planning from age 14", "Kidney: DMSA annually if recurrent UTI or VUR on VCUG"] },
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

      case STEPS.CIC_PROTOCOL:
        return (
          <div className="space-y-3">
            <InfoBox title="CIC Technique & Catheter Selection" color="green">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "Catheter Size by Age/Weight", c: "bg-green-50", items: ["Neonates/infants: 6–8 Fr", "Toddlers (1–3y): 8 Fr", "Children (3–6y): 8–10 Fr", "Children (6–12y): 10–12 Fr", "Adolescents: 12–14 Fr (male); 10–12 Fr (female)", "Use smallest catheter that drains freely; re-assess annually"] },
                  { t: "Catheter Types", c: "bg-blue-50", items: ["Standard PVC (non-coated): requires lubricant; lowest cost; most common", "Hydrophilic-coated: pre-lubricated (water-activated); better for urethral tolerance; preferred if urethral trauma/discomfort", "Nelaton tip: standard; Tiemann tip (curved): for males with urethral resistance", "Single-use vs reusable: single-use preferred for infection prevention; reuse with strict cleaning if resource-limited"] },
                  { t: "Technique (ICSN / ERIC Standard)", c: "bg-slate-50", items: ["Wash hands thoroughly (soap + water or sanitiser)", "Position: supine (infants); sitting on toilet/commode (older children)", "Girls: spread labia, identify urethral meatus (above vaginal opening); insert 2–4 cm", "Boys: retract foreskin, clean meatus, hold penis perpendicular; insert 15–20 cm until urine flows; advance 1–2 cm further", "Drain completely; remove slowly; kink catheter tip before full withdrawal (prevents backflow)", "Frequency: 4–6× daily; maintain catheter volumes 200–400 mL (avoid overdistension)"] },
                  { t: "Frequency Targets", c: "bg-amber-50", items: ["Goal: PVR <20 mL (infants) or <30 mL (older children) after each CIC", "Adjust frequency based on 24h bladder diary + UDS findings", "Nocturnal: usually 1× at bedtime; skip overnight if DDAVP used for nocturnal enuresis"] },
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

      case STEPS.PHARMACOLOGY:
        return (
          <div className="space-y-3">
            <InfoBox title="Pharmacotherapy Summary" color="amber">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "Anticholinergics (Parasympathomimetic block)", c: "bg-amber-50", items: ["Oxybutynin IR 0.2 mg/kg TDS; ER 5–10 mg OD; IV instillation 5 mg in 30 mL BD", "Solifenacin 5 mg OD (>5y); Tolterodine ER 1–2 mg OD", "Mirabegron (beta-3 agonist): 25–50 mg OD — alternative if anticholinergic SE intolerable; less dry mouth/constipation; NOT licensed <18y (EAU 2023)"] },
                  { t: "Alpha-Adrenergic Antagonists (reduce outlet resistance)", c: "bg-blue-50", items: ["Tamsulosin 0.4 mg OD: smooth muscle relaxation at bladder neck + proximal urethra", "Terazosin 0.5–1 mg OD: alternative (more hypotension side effects)", "Used for: DSD adjunct, underactive bladder with high VLPP, LMN lesion with incomplete emptying"] },
                  { t: "Desmopressin (DDAVP)", c: "bg-blue-50", items: ["Reduces nocturnal urine production — adjunct for nocturia/nocturnal enuresis in NB", "Dose: 120 µg oral lyophilisate OD nocte (titrate to 240 µg)", "MUST restrict fluid after dosing; monitor serum Na (hyponatraemia risk)", "Do NOT use in: heart failure, hyponatraemia, polydipsia"] },
                  { t: "Onabotulinumtoxin A (Botox®)", c: "bg-violet-50", items: ["Intradetrusor 100–300 U; intra-EUS 50–100 U for DSD", "Under GA; repeat every 6–12 months; plan for complete retention post-BTX (CIC-capable patients only)", "NICE 2021: approved for adults with NB; off-label in children — increasing use at specialist NB centres"] },
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

      case STEPS.MONITORING:
        return (
          <div className="space-y-3">
            <InfoBox title="Long-term Monitoring Protocol (ICCS / EAU / NICE)" color="green">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "Upper Tract Surveillance", c: "bg-green-50", items: ["RBUS: every 6 months (age <3y); annually thereafter", "DMSA: annually if VUR or recurrent febrile UTI", "eGFR: every 6–12 months; CKiD formula in children", "VCUG: if new hydronephrosis or changing UDS pattern"] },
                  { t: "Urodynamics Schedule", c: "bg-blue-50", items: ["MMC: UDS at 3 months, 1y, then yearly until age 5; every 2–3y thereafter", "Post-untethering: UDS at 6–12 months", "If clinical change (new incontinence, UTI pattern change, growth spurt): repeat UDS", "Target: DLPP <40 cmH₂O; PVR <30 mL; no IDC"] },
                  { t: "Clinical Monitoring", c: "bg-amber-50", items: ["Bladder diary: 3-day diary twice yearly (volumes, frequency, leaks, PVR)", "UTI surveillance: urine culture if febrile or symptoms", "Bowel assessment: bowel diary, neurogenic bowel management (adjunct)", "Growth, BP, renal function (secondary to upper tract complications)", "Transition: begin transition planning from age 12; adult NB/urology handover by 18y"] },
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

      case STEPS.SURGICAL:
        return (
          <div className="space-y-3">
            <InfoBox title="Surgical Options in Neurogenic Bladder" color="violet">
              <div className="mt-2 space-y-2 text-xs">
                {[
                  { t: "Augmentation Cystoplasty", c: "bg-violet-50", items: ["Ileocystoplasty most common; sigmoid/gastric (rare)", "Indication: high-pressure/low-compliance bladder refractory to medical therapy", "Requires lifelong CIC; mucus management (daily irrigation)", "Risks: metabolic acidosis (ileal HCO₃ secretion), UTI, perforation, malignancy (long-term <1%)"] },
                  { t: "Mitrofanoff Continent Catheterisable Channel", c: "bg-blue-50", items: ["Appendix (or Yang-Monti ileal) channel to umbilicus or RLIF", "Enables CIC without urethral access — especially girls, males with urethral stricture", "Often combined with augmentation", "Bladder neck closure: if severe urethral incontinence + Mitrofanoff primary CIC route"] },
                  { t: "Bladder Neck Procedures", c: "bg-amber-50", items: ["Bladder neck sling: for incompetent bladder neck (outlet insufficiency) — increases resistance", "Bladder neck injection (bulking agents): Deflux, collagen — short-term outcomes only", "Artificial urinary sphincter (AUS): AMS 800 — for post-pubertal patients with refractory incontinence; requires manual dexterity"] },
                  { t: "Vesicostomy (cutaneous)", c: "bg-red-50", items: ["Temporary cutaneous diversion (Blocksom vesicostomy) in infants/neonates", "If CIC not feasible; high-pressure bladder; buys time for growth/further planning", "Planned reversal and reconstruction at 2–4 years"] },
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
      <div className="rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Neurogenic Bladder Engine</h3>
            <p className="text-xs text-teal-200">EAU Neuro-urology 2023 · ICCS · NICE · Paediatric NB Consensus</p>
          </div>
        </div>
      </div>
      {history.length > 0 && <Badge variant="outline" className="text-xs">Step {history.length + 1}</Badge>}
      <Card><CardContent className="p-4">{renderStep()}</CardContent></Card>
      <div className="text-xs text-slate-400 text-center">EAU Neuro-urology Guidelines 2023 · ICCS Standardisation · NICE NG123 · Paediatric Urology Consensus</div>
    </div>
  );
}