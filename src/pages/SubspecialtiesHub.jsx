import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Heart, Wind, Baby, Droplet, Layers, AlertCircle, ChevronDown, ChevronUp, CheckCircle, Activity } from "lucide-react";

const SUBSPECIALTIES = [
  {
    id: "neurology",
    title: "Pediatric Neurology",
    icon: Brain,
    color: "from-purple-600 to-indigo-700",
    badge: "IAP / ILAE / AAN",
    sections: [
      {
        heading: "Seizures & Epilepsy",
        content: [
          { label: "Febrile Seizures", detail: "Simple: <15min, generalised, once in 24h. Complex: >15min, focal, >1 in 24h. Rx: Rectal/buccal diazepam 0.3–0.5 mg/kg for prolonged (>5 min). EEG not routinely needed for simple. LP if meningitis suspected." },
          { label: "Status Epilepticus Protocol", detail: "0–5 min: Midazolam 0.2 mg/kg buccal/IN (max 10 mg). 5–10 min: Lorazepam 0.1 mg/kg IV. 10–20 min: Fosphenytoin 20 mgPE/kg IV OR Valproate 20–40 mg/kg IV. 20–40 min: Phenobarbital 20 mg/kg OR Lacosamide 10 mg/kg. Refractory (>40 min): Thiopentone / Midazolam infusion — ICU needed." },
          { label: "Childhood Absence Epilepsy", detail: "Ethosuximide 15–40 mg/kg/day (preferred) or Valproate. EEG: 3 Hz spike-wave on hyperventilation. MRI usually normal." },
          { label: "Juvenile Myoclonic Epilepsy", detail: "Valproate first-line (avoid in females of childbearing age), Levetiracetam, Lamotrigine. Lifelong risk of relapse." },
          { label: "West Syndrome (Infantile Spasms)", detail: "EEG: hypsarrhythmia. Rx: ACTH 150 IU/m²/day × 2w OR Vigabatrin (especially tuberous sclerosis). Urgent — delays worsen prognosis. Refer for metabolic/genetic workup." },
        ]
      },
      {
        heading: "Movement Disorders & CNS Infections",
        content: [
          { label: "Sydenham Chorea", detail: "Post-streptococcal autoimmune. Rx: Benzathine penicillin prophylaxis + Valproate/Haloperidol for chorea. Anti-NMDAR antibodies may co-exist." },
          { label: "Tic Disorders / Tourette", detail: "PANDAS vs primary tic. Rx: Reassurance, clonidine, guanfacine, risperidone. Avoid antipsychotics unless severe." },
          { label: "Bacterial Meningitis", detail: "Empiric: Ceftriaxone 100 mg/kg/day + Dexamethasone 0.6 mg/kg/day × 4 days (started 15 min before antibiotics). Do not delay ABx for LP if raised ICP suspected. CSF analysis + culture essential." },
          { label: "Viral Encephalitis", detail: "Empiric Aciclovir 500 mg/m²/dose q8h IV (cover HSE). MRI brain + EEG. CSF PCR panel. Autoimmune encephalitis: anti-NMDAR — Methylprednisolone + IVIG + Rituximab if refractory." },
        ]
      },
      {
        heading: "Neuromuscular & Developmental",
        content: [
          { label: "Guillain-Barré Syndrome (GBS)", detail: "IVIG 2 g/kg over 2 days OR Plasmapheresis (5 sessions). Respiratory monitoring: FVC q4–6h; if FVC <20 mL/kg → ICU and ventilatory support. NG feeding if bulbar involvement." },
          { label: "Spinal Muscular Atrophy (SMA)", detail: "Nusinersen (intrathecal), Onasemnogene abeparvovec-xioi (gene therapy), Risdiplam (oral). Newborn screening now available in India (NNNS)." },
          { label: "ADHD", detail: "Methylphenidate 0.3–1 mg/kg/day OD or BID. Second-line: Atomoxetine, Clonidine. Monitor BP, growth, appetite. Behavioural therapy first-line <6y." },
          { label: "Autism Spectrum Disorder", detail: "Diagnosis: DSM-5 criteria. Tools: M-CHAT (18–24m), CARS, ADOS. No cure; early intensive behavioural therapy (ABA). Co-morbidities: epilepsy (30%), ADHD, anxiety. Risperidone for severe aggression only." },
        ]
      },
    ]
  },
  {
    id: "cardiology",
    title: "Pediatric Cardiology",
    icon: Heart,
    color: "from-rose-600 to-red-700",
    badge: "AHA / IAP",
    sections: [
      {
        heading: "Common Congenital Heart Defects",
        content: [
          { label: "VSD (Ventricular Septal Defect)", detail: "Holosystolic murmur LSE. Small (<3 mm): close spontaneously. Moderate-large: medical management of CCF (furosemide, captopril) then surgical closure / transcatheter device. Pulmonary HTN assessment pre-closure (Qp:Qs >2:1 → close)." },
          { label: "ASD (Atrial Septal Defect)", detail: "Fixed split S2, ejection systolic murmur. Most close <5y if small (<5 mm). Large ASD (>10 mm): transcatheter closure at 2–4y. Secundum ASD amenable to device closure; primum → surgical." },
          { label: "PDA (Patent Ductus Arteriosus)", detail: "Continuous 'machinery' murmur. Preterm: Indomethacin 0.1–0.3 mg/kg IV q12–24h × 3 doses (monitor renal function). Term/older: Ibuprofen, surgical ligation, or device closure." },
          { label: "Tetralogy of Fallot", detail: "4 components: VSD + pulmonary stenosis + overriding aorta + RVH. Hypercyanotic spell: knee-chest position + O2 + IV morphine + propranolol + IV fluids. Surgical correction at 3–6m." },
          { label: "Kawasaki Disease", detail: "Fever >5d + 4/5: conjunctivitis, rash, oral changes, hands/feet induration, cervical lymphadenopathy. Rx: IVIG 2 g/kg single dose + Aspirin 80–100 mg/kg/day → taper once afebrile → 3–5 mg/kg/day × 6–8 weeks. Echo: coronary arteries at diagnosis, 2w, 6–8w." },
        ]
      },
      {
        heading: "Arrhythmias & Heart Failure",
        content: [
          { label: "SVT (Supraventricular Tachycardia)", detail: "Vagal manoeuvres (ice bag to face <1y). Adenosine 0.1–0.3 mg/kg rapid IV push. Verapamil contraindicated <1y. Prophylaxis: propranolol or flecainide. WPW: avoid digoxin + verapamil." },
          { label: "Long QT Syndrome", detail: "QTc >460 ms (girls) / >440 ms (boys). Risk of Torsades de Pointes. Avoid QT-prolonging drugs (see CredibleMeds list). Beta-blockers (nadolol). ICD if high-risk (symptomatic, LQTS3)." },
          { label: "Paediatric Heart Failure", detail: "ROSS score (infant) / NYHA (child). Rx: Furosemide (1–2 mg/kg), Captopril (0.1–0.5 mg/kg), Carvedilol. Digoxin: serum level monitoring (target 0.5–2 ng/mL). Refer for transplant evaluation if refractory." },
        ]
      },
    ]
  },
  {
    id: "pulmonology",
    title: "Pediatric Pulmonology",
    icon: Wind,
    color: "from-cyan-600 to-blue-700",
    badge: "GINA / BTS / IAP",
    sections: [
      {
        heading: "Asthma Management",
        content: [
          { label: "Asthma Diagnosis", detail: "History of wheeze, cough, dyspnoea + spirometry (FEV1/FVC <70%); bronchodilator reversibility ≥12%. Skin prick tests / specific IgE for allergens. Peak flow variability >20%." },
          { label: "Step-wise Treatment (GINA 2024)", detail: "Step 1: SABA PRN. Step 2: Low-dose ICS (beclomethasone 100 mcg BD). Step 3: Low ICS + LABA (Formoterol). Step 4: Medium ICS + LABA. Step 5: High ICS + LABA ± Tiotropium ± biologics (Omalizumab if allergic)." },
          { label: "Acute Severe Asthma", detail: "O2 target SpO2 ≥94%. Salbutamol neb q20 min × 3 then q1h. Ipratropium 0.25–0.5 mg neb q4–6h. IV Magnesium sulphate 40 mg/kg (max 2 g) over 20 min. IV Aminophylline if refractory. NIV / intubation if deteriorating." },
        ]
      },
      {
        heading: "Other Respiratory Conditions",
        content: [
          { label: "Bronchiolitis (RSV)", detail: "Mild-moderate: supportive (O2 if SpO2 <90%, suction secretions, adequate hydration). NG feeds if respiratory rate >60 breaths/min. HFNC for moderate-severe. No evidence for bronchodilators, steroids, antibiotics routinely. Palivizumab prophylaxis for high-risk infants." },
          { label: "Community-acquired Pneumonia", detail: "Outpatient (mild): Amoxicillin 40–90 mg/kg/day × 5–7 days. Atypical (school age): Azithromycin 10 mg/kg Day 1, then 5 mg/kg × 4 days. Severe/hospital: IV Ampicillin or Ceftriaxone. CXR for diagnosis; repeat only if clinical deterioration." },
          { label: "Cystic Fibrosis", detail: "Diagnosis: sweat chloride >60 mmol/L + CFTR gene mutation. Management: airway clearance physiotherapy, DNase (Dornase alfa), CFTR modulators (Ivacaftor for G551D, Elexacaftor/Tezacaftor/Ivacaftor for F508del). Annual PFTs, sputum culture, HbA1c." },
          { label: "Obstructive Sleep Apnoea", detail: "OSA screening: snoring, witnessed apnoea, enuresis, morning headache. Overnight polysomnography (gold standard). Mild: weight loss, positional therapy. Moderate-severe: adenotonsillectomy (first-line in children). CPAP if surgical failure or medically unfit." },
        ]
      },
    ]
  },
  {
    id: "neonatology",
    title: "Neonatology",
    icon: Baby,
    color: "from-green-600 to-teal-700",
    badge: "NNF / AAP / WHO",
    sections: [
      {
        heading: "Newborn Resuscitation & Vitals",
        content: [
          { label: "NRP Algorithm (NNF 2022)", detail: "Initial steps (30 sec): warmth, dry, stimulate, position. Assess: respirations + HR. HR <100 or apnoea: PPV with 21% O2 (term) / 21–30% (preterm). HR <60 after 30 sec PPV: chest compressions 3:1 ratio. HR <60 after 60 sec CPR: Epinephrine 0.01–0.03 mg/kg IV/IO." },
          { label: "Preterm Vital Parameter Targets", detail: "SpO2: 85–95% (initial 5 min); target 91–95% beyond. HR: >100 bpm. Axillary temp: 36.5–37.5°C. Avoid hyperoxia (<28w: strict SpO2 limits)." },
        ]
      },
      {
        heading: "Neonatal Jaundice",
        content: [
          { label: "Physiological vs Pathological", detail: "Physiological: appears day 2–3, peaks day 4–5, resolves by 2 weeks (term) / 3 weeks (preterm). Pathological: onset <24h, rise >5 mg/dL/day, direct bili >2 mg/dL, persists >2w." },
          { label: "Phototherapy Thresholds (Bhutani Nomogram)", detail: "Use AAP 2022 / Bhutani hour-specific nomogram for phototherapy and exchange transfusion thresholds. Direct/conjugated bilirubin: phototherapy ineffective; workup for cholestasis." },
          { label: "Exchange Transfusion Indication", detail: "Total serum bilirubin at exchange threshold on nomogram, OR neuro symptoms (kernicterus signs: lethargy, arching, high-pitched cry). Use double-volume exchange (160 mL/kg). Monitor glucose, calcium, electrolytes during procedure." },
        ]
      },
      {
        heading: "Neonatal Sepsis & Infections",
        content: [
          { label: "Early-onset Sepsis (EOS <72h)", detail: "Risk factors: GBS+ mother, PROM >18h, maternal fever, preterm. Empiric: Ampicillin 50–100 mg/kg/dose q12h + Gentamicin 5 mg/kg/dose q36h (term)/q48h (<30w). Stop at 36–48h if cultures negative + baby well." },
          { label: "Late-onset Sepsis (LOS >72h)", detail: "Empiric: Cloxacillin/Vancomycin + Gentamicin/Cefotaxime. Add Antifungal (Fluconazole) if high-risk (VLBW, prolonged TPN, broad-spectrum ABx). Blood culture mandatory before ABx." },
          { label: "Neonatal Meningitis", detail: "Cefotaxime 50 mg/kg/dose q6–8h × 14–21 days (Gram-negative: 21 days). Consider Aciclovir if HSV risk. Dexamethasone not recommended (insufficient evidence in neonates)." },
        ]
      },
      {
        heading: "Common NICU Conditions",
        content: [
          { label: "RDS (Respiratory Distress Syndrome)", detail: "Prophylactic or rescue surfactant (Poractant alfa / Beractant): <28w prophylaxis; 28–32w if FiO2 >0.30; give as soon as diagnosis confirmed. CPAP 5–7 cmH2O first-line. Avoid intubation if CPAP adequate. Surfactant via LISA/MIST technique." },
          { label: "NEC (Necrotising Enterocolitis)", detail: "Bell's criteria Stage I–III. Medical: NPO, IV antibiotics (Ampicillin + Metronidazole + Gentamicin), NG decompression. Surgical: pneumoperitoneum, clinical deterioration, or failed medical management. Avoid formula feeds in VLBW — exclusive breast milk reduces risk." },
          { label: "Hypoglycaemia in Neonate", detail: "Target glucose ≥2.6 mmol/L (term) / ≥2.8 mmol/L (VLBW). D10W 2 mL/kg IV bolus if symptomatic or <1.5 mmol/L. GIR: start 4–6 mg/kg/min and titrate. Persistent hypoglycaemia: check insulin, cortisol, GH — consider hyperinsulinism." },
        ]
      },
    ]
  },
  {
    id: "urology",
    title: "Pediatric Urology",
    icon: Droplet,
    color: "from-blue-600 to-cyan-700",
    badge: "EAU / AAP Paeds",
    sections: [
      {
        heading: "Congenital Urological Conditions",
        content: [
          { label: "Hypospadias", detail: "Glans / distal shaft / mid-shaft / perineal. Repair: typically 6–18 months. Avoid circumcision (preserve foreskin for repair). Complications: fistula, stricture, residual chordee." },
          { label: "Cryptorchidism (Undescended Testis)", detail: "Palpable: surgical orchidopexy at 6–12 months (do not wait beyond 18m). Non-palpable: diagnostic laparoscopy to locate. HCG / GnRH hormonal therapy limited role. Risks if untreated: infertility, malignancy." },
          { label: "Hydrocele", detail: "Communicating: persists >12 months or fluctuates → surgical repair. Non-communicating: most resolve by 12–18 months. Reactive (secondary to torsion/epididymo-orchitis): treat underlying cause." },
          { label: "Posterior Urethral Valve (PUV)", detail: "In utero: bilateral hydronephrosis + thick bladder on antenatal US. Postnatal: catheter drainage → VCUG → cystoscopic valve ablation. Monitor renal function, bladder function long-term. High risk of CKD — 30–40% reach ESRD by adolescence." },
        ]
      },
      {
        heading: "Urinary Tract Conditions",
        content: [
          { label: "VUR Grading & Management", detail: "Grade I–II: antibiotic prophylaxis + surveillance USS. Grade III–IV: prophylaxis; consider endoscopic STING procedure or open reimplantation if breakthrough UTIs or renal scarring. Grade V: surgery recommended. DMSA for renal scar detection." },
          { label: "UTI in Children", detail: "<3 months: parenteral ABx (Ceftriaxone). 3m–2y: oral ABx (3rd gen cephalosporin) if tolerating. >2y: oral 5–7 days. All first febrile UTIs: USS ± DMSA ± MCUG as per NICE/AAP pathway. Prophylaxis for recurrent UTIs: Cotrimoxazole / Nitrofurantoin." },
          { label: "Neurogenic Bladder (Myelomeningocele)", detail: "Clean intermittent catheterisation (CIC) q3–4h from birth. Urodynamics baseline at 3–6 months. Anticholinergics (Oxybutynin 0.1–0.2 mg/kg TID) if overactive detrusor. Monitor upper tracts annually (USS + DMSA). Botox injection if refractory detrusor overactivity." },
        ]
      },
    ]
  },
  {
    id: "dermatology",
    title: "Pediatric Dermatology",
    icon: Layers,
    color: "from-amber-500 to-orange-600",
    badge: "AAD / IAP",
    sections: [
      {
        heading: "Inflammatory Skin Conditions",
        content: [
          { label: "Atopic Dermatitis (Eczema)", detail: "SCORAD / EASI scoring. Step 1: Emollients hourly (apply before topical steroids). Step 2: Topical corticosteroids (hydrocortisone 1% face; betamethasone valerate 0.1% body). Step 3: Tacrolimus / Pimecrolimus (TCI). Step 4: Dupilumab (≥6m label); Cyclosporine short-term. Wet wrap therapy for severe flares." },
          { label: "Psoriasis in Children", detail: "Guttate (post-streptococcal) most common in children. Topical: calcipotriol + betamethasone ointment. Phototherapy (PUVA/NB-UVB). Biologics for severe: Etanercept (≥6y), Secukinumab (≥6y), Ixekizumab." },
          { label: "Urticaria & Angioedema", detail: "Acute (<6w): 2nd gen antihistamines (Cetirizine, Loratadine) regularly. Add short course prednisolone 1 mg/kg if severe. Chronic (>6w): ASST test, autoimmune workup. Hereditary angioedema: C4 levels (low between attacks), C1-INH levels — Icatibant / FFP for acute attacks." },
        ]
      },
      {
        heading: "Infections & Neonatal Skin",
        content: [
          { label: "Impetigo", detail: "Localised: Mupirocin 2% ointment TID × 5 days. Extensive/bullous: Oral Cephalexin 25–50 mg/kg/day × 7 days or Cloxacillin. MRSA: Cotrimoxazole or Clindamycin." },
          { label: "Scabies", detail: "Permethrin 5% cream — apply neck to toe, leave 8–12h, wash off. Repeat after 1 week. Treat ALL household contacts simultaneously. Ivermectin 200 mcg/kg (>15 kg) for crusted scabies. Wash clothing and bedding in hot water." },
          { label: "Neonatal Rashes", detail: "Erythema toxicum: benign, flea-bite lesions, self-limiting. Milia: tiny white papules — resolve spontaneously. Salmon patch: V-shaped midline; fades by 2y. Port-wine stain: referral for laser ± Sturge-Weber screening. Mongolian spots: document to avoid confusion with bruising." },
          { label: "Vascular Anomalies", detail: "Infantile haemangioma: rapid growth 1–3m, involutes by 5–7y. Propranolol (2–3 mg/kg/day) for problematic lesions (periorbital, airway, large). Capillary malformations: laser. Venous/lymphatic malformations: referral to vascular anomaly centre." },
        ]
      },
    ]
  },
];

function SpecialtyCard({ spec }) {
  const [openSection, setOpenSection] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const Icon = spec.icon;

  return (
    <Card className="overflow-hidden">
      <div className={`bg-gradient-to-r ${spec.color} p-4 text-white`}>
        <div className="flex items-center gap-3">
          <Icon className="w-7 h-7 opacity-90" />
          <div>
            <h3 className="font-bold text-base">{spec.title}</h3>
            <Badge className="bg-white/20 text-white text-xs mt-1">{spec.badge}</Badge>
          </div>
        </div>
      </div>
      <CardContent className="p-0 divide-y divide-slate-100">
        {spec.sections.map((section, sIdx) => (
          <div key={sIdx}>
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
              onClick={() => setOpenSection(openSection === sIdx ? null : sIdx)}
            >
              <span className="text-sm font-semibold text-slate-800">{section.heading}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{section.content.length} topics</span>
                {openSection === sIdx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>
            {openSection === sIdx && (
              <div className="px-4 pb-4 space-y-2">
                {section.content.map((item, iIdx) => {
                  const key = `${sIdx}-${iIdx}`;
                  const isExpanded = expandedItem === key;
                  return (
                    <div key={iIdx} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-3 py-2.5 text-left bg-slate-50 hover:bg-slate-100 transition-colors"
                        onClick={() => setExpandedItem(isExpanded ? null : key)}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                      </button>
                      {isExpanded && (
                        <div className="px-3 py-2.5 bg-white text-xs text-slate-700 leading-relaxed border-t border-slate-100">
                          {item.detail}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function SubspecialtiesHub() {
  const [activeSpec, setActiveSpec] = useState(SUBSPECIALTIES[0].id);
  const currentSpec = SUBSPECIALTIES.find(s => s.id === activeSpec);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-3xl mx-auto px-3 py-4 space-y-4">
        {/* Header */}
        <Card className="bg-gradient-to-r from-slate-700 to-slate-900 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 opacity-90" />
              <div>
                <h1 className="font-bold text-lg">Pediatric Subspecialties Hub</h1>
                <p className="text-slate-300 text-xs">Neurology · Cardiology · Pulmonology · Neonatology · Urology · Dermatology</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-800">
            Content based on IAP, AAP, GINA, NNF, EAU guidelines. For educational use only — verify with current institutional protocols.
          </AlertDescription>
        </Alert>

        {/* Spec selector */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {SUBSPECIALTIES.map(s => {
            const SIcon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSpec(s.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${activeSpec === s.id ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
              >
                <SIcon className="w-3.5 h-3.5" />
                {s.title.replace("Pediatric ", "")}
              </button>
            );
          })}
        </div>

        {currentSpec && <SpecialtyCard spec={currentSpec} />}
      </div>
    </div>
  );
}