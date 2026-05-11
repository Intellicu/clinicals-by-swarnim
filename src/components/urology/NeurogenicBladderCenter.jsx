import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertTriangle, ChevronDown, ChevronUp, Zap, Activity, Brain } from "lucide-react";

const UDS_PATTERNS = [
  {
    id: "do_so",
    name: "DO/SO",
    full: "Detrusor Overactivity + Sphincter Overactivity (DSD)",
    risk: "HIGH",
    color: "bg-red-50 border-red-300",
    badge: "bg-red-100 text-red-700",
    physiology: "Uninhibited detrusor contractions against a tight sphincter. Causes high intravesical pressure. Upper tract risk.",
    pressure: "High Pdet (often >40 cmH₂O)",
    renal_risk: "Very High — reflux, hydronephrosis, VUR",
    management: "CIC + oxybutynin urgently. Consider Botox if refractory. Close UDS monitoring.",
    signs: ["High pressure leakage", "Hydronephrosis", "Recurrent febrile UTI", "Vesicoureteral reflux"],
  },
  {
    id: "do_su",
    name: "DO/SU",
    full: "Detrusor Overactivity + Sphincter Underactivity",
    risk: "MEDIUM",
    color: "bg-amber-50 border-amber-300",
    badge: "bg-amber-100 text-amber-700",
    physiology: "Overactive detrusor with incompetent sphincter. Leads to urge incontinence. Lower upper tract risk.",
    pressure: "Variable — usually moderate",
    renal_risk: "Medium — depends on pressure",
    management: "Oxybutynin for overactivity. Timed voiding. Alpha agonists if outlet incompetence significant.",
    signs: ["Urge incontinence", "Urgency", "Frequency", "Wetting"],
  },
  {
    id: "du_so",
    name: "DU/SO",
    full: "Detrusor Underactivity + Sphincter Overactivity",
    risk: "HIGH — retention",
    color: "bg-orange-50 border-orange-300",
    badge: "bg-orange-100 text-orange-700",
    physiology: "Poor detrusor contractility with high outlet resistance. Chronic retention. High residual. CKD risk.",
    pressure: "Low Pdet, high residual",
    renal_risk: "High — hydronephrosis from retention, infection",
    management: "CIC mandatory. Alpha blockers to reduce outlet resistance. Treat UTI promptly.",
    signs: ["High PVR", "UTI", "Overflow incontinence", "Hydronephrosis"],
  },
  {
    id: "du_su",
    name: "DU/SU",
    full: "Detrusor Underactivity + Sphincter Underactivity",
    risk: "LOW-MEDIUM",
    color: "bg-green-50 border-green-300",
    badge: "bg-green-100 text-green-700",
    physiology: "Both detrusor and sphincter have reduced tone. Continuous dribbling incontinence. Lower pressure tract.",
    pressure: "Low Pdet",
    renal_risk: "Low — but infection risk high",
    management: "CIC if significant retention. Manage UTI. Protective garments. Skin care.",
    signs: ["Continuous dribbling", "Low PVR", "Frequent UTI"],
  },
  {
    id: "dsd",
    name: "DSD",
    full: "Detrusor-Sphincter Dyssynergia",
    risk: "VERY HIGH",
    color: "bg-red-100 border-red-400",
    badge: "bg-red-200 text-red-800",
    physiology: "Simultaneous detrusor contraction AND sphincter contraction. Massive pressure spike. Most dangerous pattern.",
    pressure: "Very high Pdet spikes (>40 cmH₂O regularly)",
    renal_risk: "Extremely High — reflux, scarring, CKD",
    management: "Urgent CIC + oxybutynin. Botox into sphincter or detrusor. Close 3-monthly UDS. Consider augmentation.",
    signs: ["Massive pressure spikes", "VUR", "Hydronephrosis", "Recurrent pyelonephritis", "Rapid CKD"],
  },
];

const MEDICATIONS = [
  {
    name: "Oxybutynin",
    class: "Anticholinergic",
    color: "bg-blue-50 border-blue-200",
    dose: "0.1–0.2 mg/kg/dose TID (max 5mg TID)",
    formulations: "Ditropan 5mg tab (India), syrup 5mg/5mL available",
    withFood: "Can take with or without food",
    crush: "Yes — can crush tablet",
    refrigeration: "Syrup: store at room temperature",
    monitoring: "Dry mouth, constipation, urinary retention, cognitive effects",
    pearls: "Start low, titrate. Most studied drug. ER formulation reduces side effects. Intravesical route available.",
  },
  {
    name: "Tolterodine",
    class: "Anticholinergic (M3 selective)",
    color: "bg-cyan-50 border-cyan-200",
    dose: "0.02 mg/kg/dose BID (>5 years)",
    formulations: "Detrol 1mg/2mg tab (India). ER capsule not available widely.",
    withFood: "Take with food to reduce GI effects",
    crush: "Standard tablets can be crushed; ER capsules cannot",
    refrigeration: "Room temperature",
    monitoring: "Dry mouth, constipation, blurred vision",
    pearls: "Better tolerated than oxybutynin in adults. Less CNS penetration. Limited pediatric data.",
  },
  {
    name: "Solifenacin",
    class: "Anticholinergic (M3 selective)",
    color: "bg-teal-50 border-teal-200",
    dose: "Pediatric data limited: 0.05–0.1 mg/kg/day OD (>5 years)",
    formulations: "Vesitab 5mg/10mg (India). Oral suspension not widely available.",
    withFood: "Any time",
    crush: "Not recommended — slow release formulation",
    refrigeration: "Room temperature",
    monitoring: "Dry mouth, constipation, QT prolongation at high dose",
    pearls: "Once daily — better compliance. EMA approved for pediatric neurogenic bladder. IMAB study data.",
  },
  {
    name: "Mirabegron",
    class: "Beta-3 Agonist",
    color: "bg-violet-50 border-violet-200",
    dose: "Pediatric: 25–50mg OD (>5 years, limited data)",
    formulations: "Betmiga 25/50mg ER tab (India). Granules for suspension in some countries.",
    withFood: "Take with food",
    crush: "ER tablet — DO NOT crush",
    refrigeration: "Room temperature",
    monitoring: "BP (can raise BP), tachycardia, UTI risk",
    pearls: "No anticholinergic side effects. Alternative in constipation-prone children. Combination with anticholinergic sometimes used.",
  },
  {
    name: "Trospium",
    class: "Anticholinergic (quaternary)",
    color: "bg-indigo-50 border-indigo-200",
    dose: "Pediatric: 0.2 mg/kg/dose BID",
    formulations: "Uribag 20mg (India). Limited availability.",
    withFood: "Empty stomach preferred",
    crush: "Standard: yes. ER: no",
    refrigeration: "Room temperature",
    monitoring: "Dry mouth, GI effects. Minimal CNS as quaternary compound.",
    pearls: "Lowest CNS side effects — good for cognitively impaired children. Renally excreted — dose-adjust in CKD.",
  },
  {
    name: "Alpha Blockers (Tamsulosin)",
    class: "Alpha-1 Blocker",
    color: "bg-orange-50 border-orange-200",
    dose: "0.1–0.2 mg/day OD (>5 years)",
    formulations: "Flomax 0.4mg (India, adult formulation — split if needed)",
    withFood: "After same meal daily",
    crush: "ER capsule — do not crush. May open and sprinkle carefully.",
    refrigeration: "Room temperature",
    monitoring: "Postural hypotension, retrograde ejaculation (adolescents)",
    pearls: "Used in DU/SO pattern. Reduces outlet resistance. Helps CIC in high-resistance bladder. Off-label pediatric use.",
  },
];

const FamilyAccordion = ({ section }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card className={`border-2 ${section.color}`}>
      <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(!open)}>
        <span className="font-semibold text-sm text-slate-800">{section.title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1.5">
          {section.content.map((line, j) => (
            <p key={j} className="text-xs text-slate-700 flex items-start gap-2">
              <span className="text-emerald-500 font-bold flex-shrink-0">•</span>{line}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
};

const AccordionItem = ({ title, children, color = "border-slate-200" }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card className={`border-2 ${color} mb-2`}>
      <button
        className="w-full flex items-center justify-between p-3 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-sm text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <CardContent className="pt-0 pb-3 px-3">{children}</CardContent>}
    </Card>
  );
};

const UDSPatternCard = ({ pattern }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className={`border-2 ${pattern.color} cursor-pointer`} onClick={() => setExpanded(!expanded)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-800">{pattern.name}</span>
              <Badge className={`text-xs ${pattern.badge}`}>{pattern.risk}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{pattern.full}</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
        {expanded && (
          <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
            <p className="text-xs text-slate-600"><span className="font-semibold">Physiology:</span> {pattern.physiology}</p>
            <p className="text-xs text-slate-600"><span className="font-semibold">Pressure:</span> {pattern.pressure}</p>
            <p className="text-xs"><span className="font-semibold text-red-600">Renal Risk:</span> {pattern.renal_risk}</p>
            <p className="text-xs text-slate-600"><span className="font-semibold">Management:</span> {pattern.management}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {pattern.signs.map(s => (
                <span key={s} className="text-xs bg-white text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MedCard = ({ med }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card className={`border-2 ${med.color}`}>
      <button className="w-full p-3 text-left flex items-center justify-between" onClick={() => setOpen(!open)}>
        <div>
          <p className="font-bold text-sm text-slate-800">{med.name}</p>
          <p className="text-xs text-slate-500">{med.class} · {med.dose.split("(")[0].trim()}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <CardContent className="pt-0 pb-3 px-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded-lg p-2 border border-slate-100">
              <p className="font-semibold text-slate-500 mb-0.5">Dose</p>
              <p className="text-slate-700">{med.dose}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-100">
              <p className="font-semibold text-slate-500 mb-0.5">Indian Brands</p>
              <p className="text-slate-700">{med.formulations}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-100">
              <p className="font-semibold text-slate-500 mb-0.5">With Food?</p>
              <p className="text-slate-700">{med.withFood}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-100">
              <p className="font-semibold text-slate-500 mb-0.5">Can Crush?</p>
              <p className="text-slate-700">{med.crush}</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs">
            <p className="font-semibold text-amber-700 mb-0.5">Monitoring</p>
            <p className="text-slate-600">{med.monitoring}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs">
            <p className="font-semibold text-blue-700 mb-0.5">Clinical Pearls</p>
            <p className="text-slate-600">{med.pearls}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default function NeurogenicBladderCenter() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Brain className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Neurogenic Bladder — Advanced Center</h2>
            <p className="text-purple-100 text-sm">UDS patterns · CIC protocols · Drug cards · Surgical escalation</p>
          </div>
        </div>
      </div>

      {/* High-risk warning */}
      <Card className="border-red-300 bg-red-50">
        <CardContent className="p-3">
          <p className="text-sm font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Critical Upper Tract Risk Threshold
          </p>
          <p className="text-xs text-red-600 mt-1">
            Detrusor Leak Point Pressure (DLPP) &gt;40 cmH₂O = significant upper tract risk.
            Requires urgent CIC + anticholinergic + close UDS monitoring. Refer if not improving within 4 weeks.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="uds">
        <TabsList className="flex w-full h-auto bg-white border shadow-sm overflow-x-auto">
          <TabsTrigger value="uds" className="text-xs flex-shrink-0">UDS Patterns</TabsTrigger>
          <TabsTrigger value="cic" className="text-xs flex-shrink-0">CIC Protocol</TabsTrigger>
          <TabsTrigger value="meds" className="text-xs flex-shrink-0">Drug Cards</TabsTrigger>
          <TabsTrigger value="escalation" className="text-xs flex-shrink-0">Surgical Escalation</TabsTrigger>
          <TabsTrigger value="teaching" className="text-xs flex-shrink-0">Teaching</TabsTrigger>
          <TabsTrigger value="family" className="text-xs flex-shrink-0">Family Education</TabsTrigger>
        </TabsList>

        <TabsContent value="uds" className="mt-3 space-y-3">
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-3">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">UDS Classification System</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div><span className="font-bold">DO</span> = Detrusor Overactivity</div>
                <div><span className="font-bold">DU</span> = Detrusor Underactivity</div>
                <div><span className="font-bold">SO</span> = Sphincter Overactivity</div>
                <div><span className="font-bold">SU</span> = Sphincter Underactivity</div>
                <div><span className="font-bold">DSD</span> = Detrusor-Sphincter Dyssynergia</div>
                <div><span className="font-bold">DLPP</span> = Detrusor Leak Point Pressure</div>
              </div>
            </CardContent>
          </Card>
          {UDS_PATTERNS.map(p => <UDSPatternCard key={p.id} pattern={p} />)}
        </TabsContent>

        <TabsContent value="cic" className="mt-3 space-y-3">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-bold text-blue-800 mb-3">CIC — Clean Intermittent Catheterization Protocol</h3>
              <div className="space-y-3">
                {[
                  { step: "Indication", detail: "DLPP >40 cmH₂O, high PVR (>30% bladder capacity), retention, upper tract change" },
                  { step: "Frequency", detail: "Every 4–6 hours. Nighttime: every 6h or overnight drainage if compliance is low." },
                  { step: "Catheter size", detail: "Neonate: 5–6 Fr. Child: 6–10 Fr. Adolescent: 10–14 Fr." },
                  { step: "Technique", detail: "Clean technique (not sterile). Hand wash. Lubricated catheter. Urethral/stomal route." },
                  { step: "Volume guidance", detail: "Target bladder volume ≤ expected capacity (oz × age + 2). Stop when urine flow stops." },
                  { step: "Caregiver teaching", detail: "Hands-on training. Role-play. Written instructions in local language. School letter provided." },
                  { step: "Overnight drainage", detail: "Consider overnight Foley/stomal drainage if DLPP very high or compliance low." },
                  { step: "School integration", detail: "Letter for school nurse. Private bathroom access. Spare catheters at school." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.step}</p>
                      <p className="text-xs text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meds" className="mt-3 space-y-2">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Bladder Medication Cards — Pediatric Indian Formulary</p>
          {MEDICATIONS.map(m => <MedCard key={m.name} med={m} />)}
        </TabsContent>

        <TabsContent value="escalation" className="mt-3 space-y-3">
          {[
            {
              title: "Botox (OnabotulinumtoxinA) — Detrusor Injection",
              color: "border-orange-200 bg-orange-50",
              points: [
                "Indication: Failed oxybutynin + CIC for 3–6 months, persistent high pressure",
                "Dose: 10–12 units/kg (max 200–300 units). Inject into 20–30 detrusor sites.",
                "Effect: 6–12 months. Repeat every 6–12 months.",
                "Monitoring: Post-procedure PVR — ensure CIC can manage increased retention.",
                "Evidence: NICE approved. Studies show 80% reduction in DLPP.",
              ]
            },
            {
              title: "Augmentation Cystoplasty (Ileocystoplasty)",
              color: "border-red-200 bg-red-50",
              points: [
                "Indication: Low compliance + failed Botox + CIC. Persistent hydronephrosis.",
                "Procedure: Detubularized ileal segment anastomosed to bivalved bladder.",
                "Outcome: 3–4x increase in capacity. Compliance improvement.",
                "Risk: Mucus, UTI, metabolic acidosis, bladder perforation (rare), malignancy (long-term).",
                "Post-op: CIC mandatory lifelong. Annual surveillance cystoscopy after 10 years.",
              ]
            },
            {
              title: "Mitrofanoff Procedure (Appendicovesicostomy)",
              color: "border-purple-200 bg-purple-50",
              points: [
                "Indication: CIC difficult via urethra (hand function, obesity, urethral complications).",
                "Procedure: Appendix or Monti channel — continent catheterizable stoma (umbilical or RIF).",
                "Benefits: Independent CIC. Better cosmesis. Easier for wheelchair users.",
                "Combined: Often done with augmentation.",
              ]
            },
            {
              title: "Sacral Neuromodulation",
              color: "border-teal-200 bg-teal-50",
              points: [
                "Indication: Refractory overactivity. Incomplete spinal injury. Non-neurogenic in some.",
                "Procedure: Lead implanted at S3 foramen. Trial → permanent if >50% improvement.",
                "Pediatric: Limited data. Used in older children >5 years in selected centers.",
              ]
            },
          ].map((item, i) => (
            <Card key={i} className={`border-2 ${item.color}`}>
              <CardContent className="p-4">
                <h4 className="font-bold text-sm text-slate-800 mb-2">{item.title}</h4>
                <ul className="space-y-1">
                  {item.points.map((p, j) => (
                    <li key={j} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>{p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="teaching" className="mt-3 space-y-3">
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-4">
              <h4 className="font-bold text-indigo-800 mb-3">Viva Questions — Neurogenic Bladder</h4>
              {[
                "What DLPP threshold necessitates upper tract surveillance?",
                "Describe the functional classification of neurogenic bladder.",
                "What is the mechanism of detrusor-sphincter dyssynergia?",
                "How does neurogenic bladder contribute to CKD progression?",
                "When would you escalate from oxybutynin to Botox?",
                "What are the indications for augmentation cystoplasty in a child?",
              ].map((q, i) => (
                <div key={i} className="border-b border-indigo-100 pb-2 mb-2 last:border-0">
                  <p className="text-xs text-slate-700">Q{i + 1}: {q}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <h4 className="font-bold text-slate-700 mb-3">Key Physiology — Sympathetic vs Parasympathetic</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="font-bold text-blue-700 mb-1">Filling Phase</p>
                  <p className="text-slate-600">Sympathetic (T10-L2). Beta-3: detrusor relaxation. Alpha-1: sphincter contraction. = STORAGE</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="font-bold text-green-700 mb-1">Voiding Phase</p>
                  <p className="text-slate-600">Parasympathetic (S2-S4). M3: detrusor contraction. Pudendal inhibition: sphincter relaxation. = VOID</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="family" className="mt-3 space-y-3">
          <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
            <h3 className="font-bold text-lg">Family & Parent Education</h3>
            <p className="text-emerald-100 text-sm">CIC teaching · Urotherapy · Hydration · Warning signs · FAQs</p>
          </div>

          {[
            {
              title: "Understanding Clean Intermittent Catheterization (CIC)",
              color: "border-blue-200 bg-blue-50",
              content: [
                "CIC is a safe, clean (not sterile) procedure done at home to empty the bladder completely.",
                "It prevents bladder overflow, high pressure, infections, and protects the kidneys.",
                "Frequency: Usually every 4–6 hours during the day. Your doctor will set the schedule.",
                "Equipment: Catheter (reusable or single-use), lubricant, clean basin, soap and water.",
                "For girls: clean the urethral opening from front to back. Gentle insertion with lubricant.",
                "For boys: retract foreskin if not circumcised, clean tip, insert catheter until urine flows.",
                "Always wash hands thoroughly before and after.",
              ]
            },
            {
              title: "Urotherapy — Bladder Retraining Tips",
              color: "border-green-200 bg-green-50",
              content: [
                "Timed voiding: visit the toilet every 2–3 hours even if your child does not feel the urge.",
                "Double voiding: after urinating, wait 2 minutes and try again to empty the bladder fully.",
                "Relaxed voiding posture: feet flat on footstool, knees slightly apart, lean forward.",
                "Never rush — allow complete emptying. No straining or pushing.",
                "Bladder diary: record voiding times, volumes, leaks, and any accidents. Bring to every visit.",
              ]
            },
            {
              title: "Constipation Management (Critical for Bladder Health)",
              color: "border-amber-200 bg-amber-50",
              content: [
                "Constipation worsens bladder overactivity and increases UTI risk significantly.",
                "High fibre foods: fruits, vegetables, whole grains, legumes every meal.",
                "Water intake: 30–40 mL/kg/day (spread throughout the day, not just with meals).",
                "Regular toilet sitting after meals: use the gastrocolic reflex — 10 minutes after breakfast.",
                "Laxatives: if dietary measures fail, ask your doctor about Polyethylene Glycol (PEG/Movicol).",
                "Target: soft, formed stools daily or every 1–2 days.",
              ]
            },
            {
              title: "Hydration Advice",
              color: "border-cyan-200 bg-cyan-50",
              content: [
                "Children with neurogenic bladder need to drink enough — not too much, not too little.",
                "Recommended: 1–1.5 L/day for young children; 1.5–2 L/day for older children.",
                "Drink regularly throughout the day — small sips, not large amounts at once.",
                "Avoid caffeine and carbonated drinks — they irritate the bladder.",
                "Evening restriction: reduce fluids 2 hours before bed if nighttime leakage is a problem.",
              ]
            },
            {
              title: "Warning Signs — When to Seek Help Immediately",
              color: "border-red-200 bg-red-50",
              content: [
                "Fever >38°C with no other cause — may indicate kidney or bladder infection.",
                "Foul-smelling or cloudy urine with symptoms — possible UTI.",
                "Blood in urine (not just minor traces after catheterization).",
                "Child appears unwell, lethargic, or refuses feeds/fluids.",
                "Sudden increase in incontinence or wetting more than usual.",
                "Difficulty passing catheter or increased resistance — do not force.",
                "Swelling of the kidney area or abdominal pain.",
              ]
            },
            {
              title: "FAQs — Common Parent Questions",
              color: "border-purple-200 bg-purple-50",
              content: [
                "Q: Can my child go to school with CIC? → Yes. Provide a letter for the school nurse. Plan toilet breaks every 4 hours. Carry spare catheters.",
                "Q: How long will CIC be needed? → Usually lifelong for neurogenic bladder. Some conditions improve with treatment.",
                "Q: Is CIC painful? → With practice, it is usually not painful. Lubricant and correct technique minimize discomfort.",
                "Q: Can my child swim? → Yes, with appropriate protection. Discuss with your doctor.",
                "Q: What if we miss a catheterization? → Do it as soon as remembered. Never skip two in a row.",
                "Q: Will the bladder medicine cause any problems? → Common side effects of oxybutynin: dry mouth, constipation, flushing. Tell the doctor if severe.",
              ]
            },
          ].map((section, i) => (
            <FamilyAccordion key={i} section={section} />
          ))}

          <Card className="border-slate-200 bg-slate-50">
            <div className="p-3 text-center">
              <p className="text-xs text-slate-500 mb-2 font-medium">Printable handouts available at your clinic visit</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["CIC Step-by-Step Guide", "Bladder Diary Template", "Constipation Action Plan", "Warning Signs Card"].map(h => (
                  <span key={h} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{h}</span>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}