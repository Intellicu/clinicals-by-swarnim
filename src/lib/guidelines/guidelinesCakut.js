/**
 * CAKUT, UROLOGY & BLADDER GUIDELINES
 */

export const CAKUT_GUIDELINES = [

// ═══════════════════════════════════════════════════════════════════════════
// 1. VUR & UTI
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-vur-uti",
  references: [
    {
      id: "uti-ref1",
      citation: "Subcommittee on Urinary Tract Infection; Steering Committee on Quality Improvement and Management. Urinary tract infection: clinical practice guideline for the diagnosis and management of the initial UTI in febrile infants and children 2 to 24 months. Pediatrics. 2011;128(3):595–610.",
      authors: "AAP Subcommittee on Urinary Tract Infection",
      journal: "Pediatrics",
      year: 2011,
      volume: "128(3)",
      pages: "595–610",
      doi: "10.1542/peds.2011-1330",
      pmid: "21873693",
      evidence_grade: "A",
      guideline_body: "AAP",
      type: "Clinical Practice Guideline",
      key_recommendation: "Diagnosis criteria (culture + dipstick + symptoms), imaging pathway, antibiotic choice for febrile UTI"
    },
    {
      id: "uti-ref2",
      citation: "NICE Clinical Guideline CG54. Urinary tract infection in under 16s: diagnosis and management. National Institute for Health and Care Excellence. 2007 (updated 2017).",
      authors: "National Institute for Health and Care Excellence (NICE)",
      journal: "NICE Clinical Guidelines",
      year: 2017,
      pages: "CG54",
      doi: "https://www.nice.org.uk/guidance/cg54",
      evidence_grade: "A",
      guideline_body: "NICE",
      type: "Clinical Practice Guideline",
      key_recommendation: "UK UTI management in children: imaging criteria (USS, DMSA, MCUG), antibiotic choice, prophylaxis thresholds"
    },
    {
      id: "uti-ref3",
      citation: "Hoberman A, Greenfield SP, Mattoo TK, et al. Antimicrobial prophylaxis for children with vesicoureteral reflux. N Engl J Med. 2014;370(25):2367–2376.",
      authors: "Hoberman A, Greenfield SP, Mattoo TK et al (RIVUR Trial Investigators)",
      journal: "New England Journal of Medicine",
      year: 2014,
      volume: "370(25)",
      pages: "2367–2376",
      doi: "10.1056/NEJMoa1401811",
      pmid: "24795142",
      evidence_grade: "A",
      type: "Randomized Controlled Trial",
      key_recommendation: "RIVUR trial: prophylactic trimethoprim-sulfamethoxazole halves recurrent UTI in VUR but does not prevent renal scarring"
    },
    {
      id: "uti-ref4",
      citation: "Tekgül S, Riedmiller H, Hoebeke P, et al. EAU guidelines on vesicoureteral reflux in children. Eur Urol. 2012;62(3):534–542.",
      authors: "Tekgül S, Riedmiller H, Hoebeke P et al (European Association of Urology)",
      journal: "European Urology",
      year: 2012,
      volume: "62(3)",
      pages: "534–542",
      doi: "10.1016/j.eururo.2012.05.059",
      pmid: "22699015",
      evidence_grade: "A",
      guideline_body: "EAU",
      type: "Clinical Practice Guideline",
      key_recommendation: "VUR grading, conservative vs interventional management (STING vs ureteral reimplantation), prophylaxis decision"
    }
  ],
  title: "UTI, Vesicoureteric Reflux & Reflux Nephropathy in Children",
  category: "Infection",
  source: "AAP / NICE / EAU",
  year: 2023,
  evidence_level: "High Quality Evidence",
  tags: ["UTI", "VUR", "pyelonephritis", "DMSA", "reflux nephropathy", "prophylaxis", "MCUG"],
  summary: "UTI diagnosis, imaging pathway, VUR grading and management, antibiotic prophylaxis decision, and renal scar surveillance.",
  sections: {
    quick_summary: {
      definition: "UTI: ≥10⁵ CFU/mL single organism in clean-catch midstream urine WITH pyuria (>5 WBC/HPF) AND symptoms. Bag urine NOT acceptable for culture (80% false-positive rate).",
      epidemiology: "UTI occurs in 7–8% of girls and 2% of boys by age 7y. VUR present in 30–40% of children with febrile UTI. Risk of renal scarring increases with each episode of pyelonephritis.",
      pathophysiology: "Ascending infection (E. coli 80%): periurethral colonisation → bladder → VUR → renal parenchyma → acute pyelonephritis → inflammatory scarring. BBD (bladder-bowel dysfunction) impairs ureteral peristalsis and increases VUR persistence.",
      age_specific: "Neonates/infants: may present with sepsis, poor feeding, jaundice — difficult to diagnose clinically. Age >2y: classic dysuria, frequency, fever. Male infants: uncircumcised 10× higher risk.",
      emergency_recognition: [
        "Urosepsis: fever + rigors + hypotension + high CRP in young infant — IV antibiotics + fluid urgently",
        "Hydronephrosis + infection (obstructive uropathy): fever + loin pain + non-response to antibiotics → emergency drainage",
        "Renal abscess: persistent fever >72h on appropriate antibiotics + USS shows fluid collection"
      ],
      immediate_management: [
        "Send MSU or catheter urine for C&S BEFORE antibiotics (do not delay antibiotics for culture result if septic)",
        "Dipstick: nitrites + leucocyte esterase — high PPV; both negative = UTI very unlikely",
        "Febrile UTI <3 months: IV cefotaxime 50 mg/kg/dose TDS or gentamicin 7.5 mg/kg OD",
        "Febrile UTI ≥3 months and not systemically unwell: oral cefixime 8 mg/kg/day BD × 7–10 days",
        "Urine culture result at 48h: de-escalate to narrow-spectrum based on sensitivity"
      ]
    },
    classification: [
      { type: "Grade I VUR", definition: "Reflux into ureter only (not pelvis)", management: "Observation; no prophylaxis unless recurrent UTI + BBD" },
      { type: "Grade II VUR", definition: "Reflux to renal pelvis, no dilatation", management: "Observation; treat BBD; prophylaxis if recurrent febrile UTI" },
      { type: "Grade III VUR", definition: "Mild calyceal dilatation", management: "Prophylaxis if recurrent UTI; treat BBD aggressively" },
      { type: "Grade IV VUR", definition: "Moderate dilatation + blunted calyces", management: "Prophylaxis + BBD treatment; consider STING if breakthrough UTI" },
      { type: "Grade V VUR", definition: "Gross dilatation + tortuous ureter", management: "Surgery (ureteral reimplantation) OR STING; prophylaxis until surgical correction" }
    ],
    management: {
      imaging_pathway: [
        "Age <2y, first febrile UTI: renal USS within 6 weeks",
        "Age <2y + USS abnormal OR recurrent febrile UTI: MCUG (micturating cystourethrogram) + DMSA 4–6 months post-UTI",
        "Age ≥2y, first febrile UTI: USS only; MCUG + DMSA if recurrent or atypical",
        "DMSA: gold standard for renal scarring — do at 4–6 months post-UTI (NOT during acute — false positive)",
        "Annual USS if scarring present (monitor hydronephrosis + growth)"
      ],
      vur_management: [
        "Grade I–II, no scarring, no BBD: observation only — 70–80% resolve by age 5y",
        "Grade I–II with scarring or recurrent febrile UTI: trimethoprim prophylaxis 2 mg/kg nocte",
        "Grade III–V: prophylaxis; treat BBD aggressively; STING if breakthrough UTI on prophylaxis",
        "STING (subureteral STING injection): dextranomer/hyaluronic acid copolymer — minimally invasive; 70–85% success",
        "Ureteral reimplantation: Cohen/Politano-Leadbetter procedures — definitive but open surgery",
        "BBD treatment: timed voiding every 2–3h; bowel regimen (avoid constipation); oxybutynin for overactive bladder"
      ],
      antibiotic_choice: [
        "E. coli 80–90%; local resistance patterns must guide empiric choice (Bangalore differs from Delhi)",
        "Oral: cefixime 8 mg/kg/day BD (1st choice, low GI side effects); co-amoxiclav 40 mg/kg/day TDS",
        "IV: cefotaxime 50 mg/kg/dose TDS; gentamicin 7.5 mg/kg OD (once-daily — as effective, less nephrotoxic)",
        "Switch to oral at 48h if afebrile and culture sensitivities known",
        "Total duration: pyelonephritis 10 days; lower UTI 3–5 days; <3 months 10–14 days IV"
      ]
    },
    drugs: [
      {
        name: "Trimethoprim (prophylaxis)",
        dose: "2 mg/kg nocte (single bedtime dose)",
        max: "100 mg/night",
        purpose: "UTI prophylaxis in VUR Grade III+ or recurrent febrile UTI",
        monitoring: "Annual urine C&S (watch for emerging resistance); CBC if >6 months",
        notes: "Avoid <6 weeks of age (bilirubin displacement). Nitrofurantoin alternative (avoid GFR <30 — peripheral neuropathy). Resistance emerging — check local antibiogram annually."
      },
      {
        name: "Cefixime oral",
        dose: "8 mg/kg/day in 1–2 doses",
        max: "400 mg/day",
        purpose: "Febrile UTI/pyelonephritis — first-line oral treatment",
        monitoring: "Culture sensitivity at 48h; clinical response at 72h",
        notes: "If E. coli resistance >15% locally: use co-amoxiclav or nitrofurantoin (lower UTI only)."
      },
      {
        name: "Gentamicin IV",
        dose: "7.5 mg/kg OD (once-daily dosing)",
        max: "360 mg/day",
        purpose: "IV treatment for severe pyelonephritis/urosepsis",
        monitoring: "Trough <1 mg/L (drawn before 4th dose in once-daily dosing); Cr; UO; audiometry if >10 days",
        notes: "Once-daily as effective as TDS; less nephrotoxic. Extended interval (q48h) in CKD."
      },
      {
        name: "Oxybutynin",
        dose: "0.2 mg/kg/dose TDS (max 5 mg TDS)",
        max: "5 mg TDS",
        purpose: "Overactive bladder in BBD — reduces uninhibited detrusor contractions",
        monitoring: "UO, PVR ultrasound (urinary retention risk); constipation; anticholinergic side effects",
        notes: "Extended-release oxybutynin once daily: better tolerance. First ensure no anatomical obstruction before starting."
      }
    ],
    monitoring: {
      frequency: "Post-UTI: 1–2 months (urine C&S); then annually on prophylaxis; DMSA at 4–6 months.",
      parameters: [
        "Urine C&S post-treatment (2–4 weeks); annually on prophylaxis",
        "Renal USS: growth, hydronephrosis annually if scarring",
        "BP annually (reflux nephropathy → HTN)",
        "UPCR annually (scarring → proteinuria)",
        "eGFR annually if scarring present",
        "DMSA 4–6 months post-febrile UTI (scarring detection)"
      ],
      follow_up: "Reflux nephropathy: lifelong BP + renal function monitoring. HTN and CKD can manifest in adulthood. Women: elevated UTI, pyelonephritis and pre-eclampsia risk in pregnancy."
    },
    nutrition: [
      "Adequate fluid intake: 1–1.5× maintenance — promotes urinary flushing",
      "Constipation is major risk factor — high-fibre diet, adequate fluid, regular bowel habits (BBD prevention)",
      "Cranberry products: modest urinary acidification — limited paediatric evidence; safe adjunct",
      "Probiotics (Lactobacillus): emerging evidence for UTI prevention — not yet standard of care"
    ],
    vaccination: [
      "Standard immunisation schedule",
      "Annual influenza (respiratory infections increase BBD and UTI risk in some children)"
    ],
    red_flags: [
      "Non-response to 48h appropriate antibiotics → USS to exclude abscess or obstructive pyelonephritis",
      "Recurrent febrile UTI → MCUG + DMSA urgently — do NOT wait for third episode",
      "HTN in child with known UTI history → reflux nephropathy with CKD — full renal workup",
      "Breakthrough febrile UTI on prophylaxis → USS + MCUG review; consider STING or surgery"
    ],
    pearls: [
      "Bag urine: 80% false-positive for culture — ONLY use for dipstick; NEVER for culture",
      "E. coli causes 80–90% of UTI — know your local antibiogram; empiric therapy must match local resistance",
      "DMSA: do at 4–6 months post-UTI (NOT acute phase — acute inflammation mimics permanent scars)",
      "BBD is the #1 modifiable risk factor for recurrent UTI and VUR persistence — treat aggressively",
      "VUR Grade I–II resolves spontaneously in 70–80% by age 5 — conservative management is standard",
      "Prophylaxis reduces frequency of recurrent febrile UTI but does NOT prevent renal scarring — early diagnosis and prompt treatment matter more"
    ]
  }
},

// ═══════════════════════════════════════════════════════════════════════════
// 2. NEUROGENIC BLADDER & BBD
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-neurogenic-bladder",
  references: [
    {
      id: "nb-ref1",
      citation: "Bauer SB, Austin PF, Rawashdeh YF, et al. International Children's Continence Society's recommendations for initial diagnostic evaluation and follow-up in congenital neuropathic bladder and bowel dysfunction in children. Neurourol Urodyn. 2012;31(5):610–614.",
      authors: "Bauer SB, Austin PF, Rawashdeh YF et al (International Children's Continence Society)",
      journal: "Neurourology and Urodynamics",
      year: 2012,
      volume: "31(5)",
      pages: "610–614",
      doi: "10.1002/nau.22229",
      pmid: "22532462",
      evidence_grade: "A",
      guideline_body: "ICCS",
      type: "Consensus Recommendation",
      key_recommendation: "ICCS: initial urodynamics in neuropathic bladder, CIC protocol, leak point pressure threshold (40 cmH₂O)"
    },
    {
      id: "nb-ref2",
      citation: "Nevéus T, von Gontard A, Hoebeke P, et al. The standardization of terminology of lower urinary tract function in children and adolescents: report from the Standardisation Committee of the International Children's Continence Society. J Urol. 2006;176(1):314–324.",
      authors: "Nevéus T, von Gontard A, Hoebeke P et al (ICCS Standardisation Committee)",
      journal: "Journal of Urology",
      year: 2006,
      volume: "176(1)",
      pages: "314–324",
      doi: "10.1016/S0022-5347(06)00305-3",
      pmid: "16753432",
      evidence_grade: "A",
      guideline_body: "ICCS",
      type: "Standardization Document",
      key_recommendation: "ICCS standardized terminology for BBD, neurogenic bladder, overactive bladder, urodynamic parameters"
    }
  ],
  title: "Neurogenic Bladder & Bladder-Bowel Dysfunction in Children",
  category: "Tubular Disorders",
  source: "EAU / ICCS",
  year: 2023,
  evidence_level: "Moderate Quality Evidence",
  tags: ["neurogenic bladder", "BBD", "spina bifida", "myelomeningocele", "CIC", "oxybutynin", "urodynamics", "VUR", "hydronephrosis"],
  summary: "Management of neurogenic bladder (spina bifida, sacral agenesis) and functional BBD including urodynamics, clean intermittent catheterisation, and pharmacotherapy.",
  sections: {
    quick_summary: {
      definition: "Neurogenic bladder: bladder dysfunction from neurological disease (myelomeningocele, sacral agenesis, spinal cord injury). BBD: functional (non-neurogenic) bladder-bowel dysfunction — overactive bladder + constipation.",
      epidemiology: "Myelomeningocele: 0.3–1/1000 births; neurogenic bladder in >90%. BBD: 20–30% of children with recurrent UTI; often missed diagnosis.",
      pathophysiology: "Myelomeningocele: lesion at L4–S2 → detrusor overactivity + detrusor-sphincter dyssynergia → high bladder pressures → upper tract damage (hydronephrosis, VUR, CKD). BBD: incomplete bladder emptying + constipation → bacteria colonisation → recurrent UTI.",
      age_specific: "Neonates with myelomeningocele: urodynamics within first weeks of life (establish baseline). Infants: high-pressure bladder can cause silent renal damage before UTI. Toilet-training age: functional BBD emerges.",
      emergency_recognition: [
        "Febrile UTI in neurogenic bladder patient → high risk of urosepsis + ascending pyelonephritis",
        "New hydronephrosis on USS in MMC patient → bladder pressure change — urodynamics urgently",
        "Autonomic dysreflexia (high spinal injury): severe hypertension + headache + bradycardia → empty bladder immediately"
      ],
      immediate_management: [
        "Neurogenic: start CIC (clean intermittent catheterisation) within first weeks of life — reduces upper tract damage",
        "Urodynamics baseline at 1–2 months for MMC — identifies high-risk bladder pattern",
        "Oxybutynin 0.2 mg/kg TDS — reduces detrusor pressure; improves CIC compliance",
        "BBD: timed voiding schedule q2–3h + bowel regimen (constipation treatment is essential)"
      ]
    },
    management: {
      neurogenic_bladder: [
        "CIC q3–4h with catheter size appropriate to age (8–12Fr neonates; 10–14Fr older children)",
        "CIC immediately post-void in children who can void (incomplete emptying); or sole emptying if complete retention",
        "Oxybutynin 0.2 mg/kg TDS if urodynamics shows overactive bladder with high pressure (leak point pressure >40 cmH₂O = renal damage threshold)",
        "Intravesical oxybutynin (instilled via catheter): fewer systemic anticholinergic side effects",
        "Botulinum toxin A intravesical injection (100–200 units in 20–30 injection sites): sustained benefit 6–12 months",
        "Vesicostomy: temporary urinary diversion in young infants with high-pressure bladder unsuitable for CIC",
        "Augmentation cystoplasty: bladder augmentation with bowel segment for refractory high-pressure bladder at age >5y"
      ],
      bbd_management: [
        "Timed voiding every 2–3h regardless of urge — re-trains bladder",
        "Bowel: polyethylene glycol (PEG/Movicol) 0.5–1 g/kg/day OD until regular soft daily stools — bowel regurgitates constipation",
        "Double-voiding: encourage second void attempt 5 min after first (reduces residual volume)",
        "Oxybutynin 0.2 mg/kg TDS for overactive bladder component",
        "Biofeedback: pelvic floor training for dysfunctional voiding (EMG-guided)",
        "AVOID anticholinergics if high post-void residual (PVR >20 mL) — worsen retention"
      ]
    },
    drugs: [
      {
        name: "Oxybutynin",
        dose: "0.2 mg/kg/dose TDS (typical total 0.2–0.5 mg/kg/day)",
        max: "5 mg TDS",
        purpose: "Overactive bladder / detrusor overactivity — anticholinergic (bladder selective)",
        monitoring: "PVR (urinary retention), UO, constipation; anticholinergic: dry mouth, flushing, cognitive effects",
        notes: "Extended-release once daily: better tolerated. Intravesical route (via CIC): fewer systemic effects. Avoid in high PVR without CIC."
      },
      {
        name: "Macrogol / PEG (Movicol)",
        dose: "0.5–1 g/kg/day OD, titrate to regular soft daily stools",
        max: "Per clinical response",
        purpose: "Constipation in BBD (bowel treatment is core to BBD management)",
        monitoring: "Stool frequency and consistency; abdominal USS if clinical doubt",
        notes: "Continue for minimum 3–6 months even after symptoms resolve — constipation recurrence drives BBD relapse."
      },
      {
        name: "Botulinum toxin A (intravesical)",
        dose: "100–200 U in 20–30 intravesical injection sites under GA/sedation",
        max: "200 U/session",
        purpose: "Refractory neurogenic overactive bladder with high intravesical pressure",
        monitoring: "Urodynamics 6 weeks post-injection (pressure reduction); PVR (ensures adequate CIC coverage); effect lasts 6–12 months",
        notes: "Requires GA for injection. Repeat injections as effect wanes. International Children's Continence Society endorsed."
      }
    ],
    monitoring: {
      frequency: "MMC: renal USS + urodynamics every 6–12 months in infancy; annually when stable. BBD: clinical review 3-monthly until resolved.",
      parameters: [
        "Renal USS: hydronephrosis, renal growth (annually)",
        "Urodynamics: bladder capacity, compliance, leak point pressure (6–12 monthly for MMC)",
        "Post-void residual (PVR): bladder USS or catheter",
        "BP annually (hydronephrosis → renal scarring → HTN)",
        "UPCR annually (renal scarring)",
        "Urine C&S 3-monthly in neurogenic bladder (asymptomatic bacteriuria — do NOT treat unless symptomatic)"
      ],
      follow_up: "Multidisciplinary: nephrology, urology, physiotherapy, continence nurse. Transition planning from 14y. Adult neurogenic bladder services referral."
    },
    nutrition: [
      "High-fibre diet: bowel regularity is essential component of BBD treatment",
      "Adequate fluid intake: prevents concentrated urine which worsens BBD symptoms",
      "Avoid constipating foods: refined carbohydrates, excessive dairy",
      "Regular meal timing supports bowel habit regularisation"
    ],
    vaccination: [
      "Standard schedule — no contraindications",
      "Annual influenza recommended (UTI risk with respiratory illness)",
      "If CKD from neurogenic bladder: full CKD vaccination protocol"
    ],
    red_flags: [
      "New hydronephrosis in MMC child → urodynamics urgently — bladder pressure increased",
      "Febrile UTI in neurogenic bladder → treat aggressively — high pyelonephritis risk",
      "Autonomic dysreflexia (high-level spinal): BP crisis + headache + bradycardia → empty bladder IMMEDIATELY",
      "Worsening continence in known BBD → exclude new/worsening VUR or renal scarring"
    ],
    pearls: [
      "Asymptomatic bacteriuria in neurogenic bladder should NOT be treated — treat only symptomatic UTI (fever, new incontinence, dysautonomia)",
      "Leak point pressure >40 cmH₂O on urodynamics = upper tract damage threshold — must start oxybutynin + CIC",
      "Constipation drives 80% of BBD — treat bowel BEFORE bladder; bowel treatment alone resolves many BBD cases",
      "CIC started early (within first weeks of life in MMC) dramatically reduces upper tract damage and CKD by adulthood"
    ]
  }
}
];