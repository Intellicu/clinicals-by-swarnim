/**
 * DIALYSIS, ELECTROLYTE & TUBULOPATHY GUIDELINES
 */

export const DIALYSIS_GUIDELINES = [

// ═══════════════════════════════════════════════════════════════════════════
// 1. PERITONEAL DIALYSIS
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-pd",
  title: "Peritoneal Dialysis in Children — ISPD Paediatric Guidelines",
  category: "Dialysis",
  source: "ISPD / PRNT",
  year: 2023,
  evidence_level: "Moderate Quality Evidence",
  tags: ["PD", "peritonitis", "CAPD", "APD", "catheter", "adequacy", "Kt/V", "PET"],
  summary: "Paediatric PD modality selection, prescription (CAPD vs APD), adequacy targets, catheter care, and complication management including peritonitis.",
  sections: {
    quick_summary: {
      definition: "PD uses peritoneal membrane as dialysis membrane. First-line RRT for ESRD in children <20 kg; preferred across all ages in paediatrics for home-based, continuous physiological dialysis.",
      epidemiology: "55–70% of paediatric ESRD on PD globally. APD (automated, overnight) increasingly preferred over CAPD. Best growth outcomes of all dialysis modalities.",
      pathophysiology: "Peritoneal membrane (mesothelial cells + submesothelial vessels) — solutes diffuse down concentration gradient; water removed by osmotic UF using glucose (or icodextrin). Peritoneal transport type (PET) guides prescription.",
      age_specific: "Neonates/infants: acute PD with manual exchanges, Tenckhoff catheter. School-age: APD preferred — school attendance maintained. Adolescents: adherence critical; psychosocial support.",
      emergency_recognition: [
        "Cloudy effluent + abdominal pain ± fever → peritonitis until proven otherwise",
        "Exit-site erythema + purulent discharge → exit-site infection (can seed peritonitis)",
        "Inability to drain (blocked catheter/omentum wrapping) — medical emergency if anuric",
        "Persistent effluent turbidity despite antibiotics >96h → catheter removal consideration"
      ],
      immediate_management: [
        "Peritonitis: send effluent WBC + Gram stain + C&S BEFORE any antibiotics",
        "Empiric IP vancomycin 25 mg/L + IP ceftazidime 125 mg/L per bag immediately",
        "Heparin 500 U/L in every bag to prevent fibrin clot formation during peritonitis",
        "Rapid exchanges (1h dwells) for first 24h to clear turbid effluent",
        "Catheter flush with heparinised saline for catheter malfunction — do NOT push forcefully"
      ]
    },
    management: {
      pd_prescription: [
        "Fill volume: start 600–800 mL/m²; increase to 900–1100 mL/m² as tolerated over 1–2 weeks",
        "Exchange frequency: CAPD: 4–5 exchanges/day; APD: 8–12 automated overnight exchanges",
        "Dwell time: CAPD 4–6h/exchange; APD 1–2h/exchange (short dwell — high glucose gradient maintained)",
        "Glucose: 1.36% (136 mmol/L) standard; 2.27% for moderate UF; 3.86% for aggressive UF",
        "Icodextrin (7.5%) for long dwell (14h daytime dwell in APD) — prevents glucose absorption, sustained UF",
        "Target daily UF: >750 mL/day in anuric patient; adjust based on weight/fluid balance",
        "Low-GDP biocompatible solutions (Balance, BicaVera): preserve peritoneal membrane and residual renal function — use when available"
      ],
      adequacy: [
        "Weekly Kt/V target ≥1.8 (ISPD paediatric recommendation)",
        "Total creatinine clearance (CCr) ≥45 L/week/1.73m²",
        "Check Kt/V every 6 months (or after significant change in residual renal function)",
        "Include residual renal function (RRF) in Kt/V calculation — RRF is valuable, protect it",
        "If Kt/V <1.8: increase fill volume, increase exchange frequency, assess membrane type (PET)"
      ],
      peritonitis_treatment: [
        "Effluent WBC >100 cells/mm³ + >50% neutrophils = peritonitis (diagnostic)",
        "IP vancomycin 25 mg/L loading dose in one bag, then 25 mg/L per bag (gram-positive MRSA cover)",
        "IP ceftazidime 125 mg/L per bag (gram-negative cover including Pseudomonas)",
        "Duration: 2 weeks minimum; 4 weeks for S. aureus; 6 weeks for fungal (+ catheter removal)",
        "Culture-guided de-escalation at 48–72h",
        "Failure to improve at 96h → suspect fungal, resistant organism, abdominal pathology → catheter removal",
        "Fungal peritonitis: REMOVE catheter immediately + antifungal (fluconazole or micafungin)"
      ],
      catheter_care: [
        "Exit-site: clean with chlorhexidine or povidone-iodine daily; mupirocin 2% to exit site daily (prophylaxis — reduces S. aureus peritonitis 40%)",
        "Nasal S. aureus screen: treat with nasal mupirocin if carrier",
        "No submersion in bath/swimming pool unless exit site fully healed (>4 weeks post-insertion)",
        "Constipation: laxatives essential — bowel fullness compresses catheter → outflow failure",
        "Catheter malfunction: flush with heparinised saline; check for kinking; laxatives; abdominal XR"
      ]
    },
    drugs: [
      {
        name: "Vancomycin IP",
        dose: "25 mg/L in one exchange bag (loading); 25 mg/L per bag (maintenance) — adjust to serum trough",
        max: "Serum trough target 10–15 mg/L",
        purpose: "Empiric gram-positive peritonitis (MRSA cover)",
        monitoring: "Serum vancomycin trough (before next IP dose); effluent WBC count every 48–72h; hearing (prolonged use)",
        notes: "Continue minimum 14 days after effluent clears. For MRSA confirmed: vancomycin alone × 3 weeks."
      },
      {
        name: "Ceftazidime IP",
        dose: "125 mg/L per bag (continuous dosing in each exchange)",
        max: "Adjust to gram-negative culture sensitivity",
        purpose: "Empiric gram-negative peritonitis coverage",
        monitoring: "Culture sensitivity at 48–72h; change to targeted antibiotic",
        notes: "If Pseudomonas: two antipseudomonal agents + consider catheter removal if persistent >5 days."
      },
      {
        name: "Heparin (in PD bags)",
        dose: "500–1000 U/L in dialysate (during peritonitis or turbid effluent)",
        max: "Not systemically absorbed significantly",
        purpose: "Prevent fibrin clot formation in catheter during peritonitis",
        monitoring: "Effluent clarity; catheter patency",
        notes: "Not used routinely in clear effluent — only during peritonitis or bloody effluent."
      },
      {
        name: "Icodextrin 7.5% (Extraneal)",
        dose: "One bag per day for long dwell (14h)",
        max: "One long-dwell exchange per day",
        purpose: "Sustained UF in long dwell without hyperglycaemia",
        monitoring: "Plasma maltose levels (false glucose readings with some glucometers — use glucose oxidase strips)",
        notes: "Contraindicated in iodine allergy. Use glucose-specific glucometer strips — icodextrin metabolites cross-react with some glucometer types giving false high glucose."
      }
    ],
    monitoring: {
      frequency: "Monthly clinic: stable patients. Weekly: peritonitis, catheter issues. PET + Kt/V: every 6 months or after clinical change.",
      parameters: [
        "Kt/V and CCr (PD adequacy) every 6 months",
        "PET (peritoneal equilibration test) at 4–8 weeks post-PD start, then annually",
        "Residual urine volume (24h collection) monthly — protect RRF",
        "BP at every visit/session",
        "Daily weight by patient/family",
        "Hb, iron stores, PTH, Ca²⁺, PO₄, albumin, lipids monthly",
        "Exit-site assessment every clinic visit",
        "Growth: height, weight monthly in children",
        "Annual ECHO for LVH, pericardial effusion"
      ],
      follow_up: "Growth and nutrition monthly. Cognitive development annually. Pre-transplant workup when GFR <20 (or sooner if donor available). Psychosocial support at every visit."
    },
    nutrition: [
      "Protein: 1.5–2.5 g/kg/day — HIGH protein requirement due to dialysate protein losses (8–10 g/day in stable PD)",
      "Calories: 100% EAR including glucose calories absorbed from PD solution (up to 200–400 kcal/day from dialysate glucose)",
      "K⁺: less restriction than HD (continuous K⁺ removal) — restrict only if serum K⁺ >5.5",
      "PO₄: calcium carbonate with meals as binder; restrict high-phosphate foods",
      "Fluid: less strict than HD (daily UF removes fluid continuously); target euvolaemia",
      "Na⁺: 1–2 mEq/kg/day if hypertensive; avoid high-sodium foods",
      "Water-soluble vitamins lost in dialysate — supplement B-complex, folate, Vit C daily"
    ],
    vaccination: [
      "Hepatitis B: double-dose (40 mcg) schedule; check anti-HBs titre after; revaccinate if <10 mIU/mL",
      "Annual influenza (inactivated) — SC or IM (not intranasal live in immunosuppressed)",
      "Pneumococcal: PCV13 + PPSV23 every 5 years",
      "Meningococcal ACWY + B before transplant listing",
      "Varicella if naive — 1 month before planned transplant",
      "Live vaccines can be given to stable non-immunosuppressed PD patients"
    ],
    red_flags: [
      "Effluent WBC >100/mm³ → peritonitis — start IP antibiotics SAME day, do NOT wait for culture",
      "Exit-site infection tracking along tunnel → tunnel infection — aggressive treatment or elective catheter removal before peritonitis",
      "Kt/V <1.8 despite optimised prescription → reassess membrane transport; consider HD switch",
      "Residual urine <100 mL/day → increase dialysis dose; restrict fluid more strictly",
      "Persistent abdominal pain + cloudy effluent despite 96h antibiotics → catheter removal"
    ],
    pearls: [
      "PD is preferred modality for children — home-based, school attendance maintained, continuous dialysis closest to physiological",
      "Biocompatible low-GDP solutions (neutral pH) preserve peritoneal membrane and residual renal function — use when cost permits",
      "Peritonitis is #1 cause of PD failure — meticulous exit-site care, hand hygiene and connection technique education is paramount",
      "Constipation = #1 cause of catheter outflow failure — prescribe laxatives prophylactically for all PD patients",
      "Icodextrin glucometer: icodextrin metabolites give falsely HIGH readings on non-glucose-specific strips — always use glucose oxidase test strips",
      "Mupirocin nasal and exit-site prophylaxis reduces S. aureus peritonitis risk by 40% — prescribe for all PD patients"
    ]
  }
},

// ═══════════════════════════════════════════════════════════════════════════
// 2. ELECTROLYTE — HYPONATREMIA & HYPERNATREMIA
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-dysnatremia",
  title: "Dysnatraemia — Hyponatraemia & Hypernatraemia in Children",
  category: "Electrolytes",
  source: "PRNT / ESPNIC",
  year: 2023,
  evidence_level: "Moderate Quality Evidence",
  tags: ["hyponatraemia", "hypernatraemia", "SIADH", "CSW", "osmolality", "sodium", "3% NaCl"],
  summary: "Diagnosis and safe correction of hyponatraemia and hypernatraemia in children. Speed of correction is as important as the correction itself — osmotic demyelination is a preventable catastrophe.",
  sections: {
    quick_summary: {
      definition: "Hyponatraemia: Na⁺ <135 mmol/L (mild 130–134; moderate 125–129; severe <125). Hypernatraemia: Na⁺ >145 mmol/L (mild 146–149; moderate 150–154; severe ≥155).",
      epidemiology: "Hyponatraemia: commonest electrolyte disorder in hospitalised children; iatrogenic from hypotonic IV fluids major cause. Hypernatraemia: dehydration (diarrhoea, fever, diabetes insipidus) and inadequate free water intake.",
      pathophysiology: "Hyponatraemia: excess water (dilutional) OR Na⁺ loss. Brain adaptation: extrudes organic osmolytes → cerebral oedema initially then adaptation. Rapid correction → osmotic demyelination (central pontine myelinolysis). Hypernatraemia: free water deficit → hypertonicity → brain cell shrinkage → venous rupture → cerebral haemorrhage. Rapid correction → cerebral oedema.",
      age_specific: "Neonates: Na⁺ 130–145 (slightly lower normal). Infants: at risk of dilutional hyponatraemia from excess dilute formula. Older children: SIADH from CNS/pulmonary/post-surgical causes.",
      emergency_recognition: [
        "Hyponatraemia with seizures + altered GCS < 14 → symptomatic (neurological emergency)",
        "Hypernatraemia Na⁺ >160 + irritability/high-pitched cry/doughy skin → severe hypernatraemia"
      ],
      immediate_management: [
        "Symptomatic hyponatraemia (seizure): 3% NaCl 2–3 mL/kg IV over 20–30 min — STOPS seizures",
        "Target: raise Na⁺ by 3–5 mmol/L in 30 min (not to normal — just to stop seizures)",
        "Then SLOW correction: maximum 10–12 mmol/L rise per 24h (chronic), 10 mmol/L in 24h (acute)",
        "Hypernatraemia correction: 0.9% NaCl or Hartmann's; lower Na⁺ by ≤10–12 mmol/L per 24h"
      ]
    },
    classification: [
      { type: "Hypo-osmolar hyponatraemia", definition: "Serum osmolality <280 (true hyponatraemia)", management: "Assess volume status → guides treatment" },
      { type: "SIADH", definition: "Euvolaemic, urine Na⁺ >20, urine Osm > serum Osm, no oedema", management: "Fluid restriction 50–60% maintenance; treat cause" },
      { type: "Cerebral salt wasting", definition: "Hypovolaemic, urine Na⁺ >40, high urine volume — post-neurosurgery", management: "Liberal Na⁺ + fludrocortisone 0.1 mg/day" },
      { type: "Hypervolaemic hyponatraemia", definition: "Oedema (NS, CHF, cirrhosis) + low Na⁺", management: "Treat underlying cause; fluid restrict; diuretics" }
    ],
    management: {
      symptomatic_hyponatraemia: [
        "3% NaCl 2–3 mL/kg IV over 20–30 min → expected Na⁺ rise 3–5 mmol/L",
        "Repeat once if seizures continue; reassess after each bolus",
        "Then transition to very slow correction: Na⁺ rise ≤10 mmol/L per 24h total",
        "Calculate: Na deficit = 0.6 × weight × (target Na⁺ – current Na⁺)",
        "Monitor Na⁺ every 2h during active correction; slow/stop if rising faster than target"
      ],
      asymptomatic_hyponatraemia: [
        "SIADH: fluid restrict to 50–60% maintenance (typically 500–600 mL/m²/day); treat cause (pneumonia, meningitis, drugs)",
        "Cerebral salt wasting: 0.9% NaCl boluses; fludrocortisone 0.1 mg OD (mineralocorticoid effect); liberal Na⁺ intake",
        "Hypervolaemic (NS, oedema): treat underlying condition; avoid further hypotonic fluids",
        "Do NOT use oral sodium chloride tablets in hyponatraemia — risk of gastric ulceration and inconsistent absorption"
      ],
      hypernatraemia_correction: [
        "Calculate free water deficit: deficit (L) = 0.6 × weight × [(current Na/desired Na) – 1]",
        "Replace over 48–72h (for chronic hypernatraemia >48h duration)",
        "Target: lower Na⁺ by ≤10–12 mmol/L per 24h",
        "Use 0.9% NaCl initially if haemodynamically compromised; switch to 0.45% NaCl or free water once stable",
        "Diabetes insipidus: desmopressin (DDAVP) — see DI guideline",
        "Monitor Na⁺ every 4–6h during correction; adjust fluid rate accordingly"
      ]
    },
    drugs: [
      {
        name: "3% NaCl (hypertonic saline)",
        dose: "2–3 mL/kg IV over 20–30 min (symptomatic hyponatraemia)",
        max: "100 mL per bolus; maximum 3 boluses before reassessment",
        purpose: "Emergency treatment of symptomatic hyponatraemia with seizures or GCS impairment",
        monitoring: "Na⁺ every 2h; neurological status; BP, fluid balance; stop if Na⁺ rising >10 mmol/L/24h",
        notes: "NEVER correct Na⁺ >10–12 mmol/L in 24h — osmotic demyelination risk. Use ONLY for symptom control, not normalisation."
      },
      {
        name: "Fludrocortisone",
        dose: "0.05–0.2 mg/day OD (typically 0.1 mg/day)",
        max: "0.2 mg/day",
        purpose: "Cerebral salt wasting — mineralocorticoid to reduce renal Na⁺ wasting",
        monitoring: "BP (hypertension risk), K⁺, Na⁺, fluid balance",
        notes: "Distinguished from SIADH by volume depletion — key: CSW is hypovolaemic, SIADH is euvolaemic."
      }
    ],
    monitoring: {
      frequency: "Symptomatic: Na⁺ every 2h during active correction. Stable: every 6–12h. Chronic: daily.",
      parameters: [
        "Serum Na⁺, K⁺, Cl⁻, HCO₃⁻, glucose, osmolality",
        "Urine Na⁺ and osmolality (SIADH diagnosis)",
        "Urine output (hourly if symptomatic)",
        "Fluid balance 4-hourly",
        "Neurological status (GCS, seizures)",
        "Weight daily"
      ],
      follow_up: "Post-SIADH: identify and treat cause. Post-DI: long-term endocrinology. Post-hypernatraemic dehydration: developmental follow-up (cerebral injury risk)."
    },
    nutrition: [
      "SIADH: fluid restrict to 50–60% maintenance — do NOT restrict Na⁺ (body Na⁺ is normal or low)",
      "Cerebral salt wasting: liberal Na⁺ and fluid intake — high-Na⁺ oral/NG feeds",
      "Hypernatraemic dehydration: oral rehydration (sodium 60–75 mmol/L ORS); breast milk continued",
      "Avoid hypotonic IV fluids in hospitalised children — use isotonic saline (0.9% NaCl) for maintenance to prevent hospital-acquired hyponatraemia"
    ],
    vaccination: [
      "No specific vaccination implications for acute electrolyte disorders",
      "If underlying cause is CNS (meningitis, encephalitis): meningococcal and pneumococcal vaccination review after recovery"
    ],
    red_flags: [
      "Seizure + Na⁺ <125 → 3% NaCl IMMEDIATELY; do not wait for investigations",
      "Na⁺ correction >12 mmol/L in 24h → STOP correction (risk osmotic demyelination — even if asymptomatic)",
      "Hypernatraemia Na⁺ >165 + neurological signs → cerebral haemorrhage risk — correct very slowly",
      "SIADH vs CSW misdiagnosis: SIADH = fluid restrict; CSW = give Na⁺ and fluid — wrong treatment = worse outcome"
    ],
    pearls: [
      "Chronic hyponatraemia (>48h): brain adapts; rapid correction causes myelinolysis. SLOW correction ≤10 mmol/L/24h is MANDATORY.",
      "SIADH vs cerebral salt wasting: BOTH have low Na⁺ + high urine Na⁺ (>40 mEq/L). KEY difference: SIADH = euvolaemic; CSW = hypovolaemic. Treat OPPOSITE ways.",
      "Hospital-acquired hyponatraemia: caused by hypotonic (0.45% NaCl) IV fluids — use 0.9% NaCl for maintenance in acutely ill children",
      "3% NaCl: goal is symptom control (stop seizures by raising Na⁺ 3–5 mmol/L), NOT normalisation — distinguish from overcorrection risk"
    ]
  }
},

// ═══════════════════════════════════════════════════════════════════════════
// 3. RENAL TUBULAR ACIDOSIS
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-rta",
  title: "Renal Tubular Acidosis (RTA) — Types I, II, IV",
  category: "Tubular Disorders",
  source: "PRNT / ESPN",
  year: 2023,
  evidence_level: "Moderate Quality Evidence",
  tags: ["RTA", "renal tubular acidosis", "type 1", "type 2", "type 4", "Fanconi", "hypokalaemia", "rickets"],
  summary: "RTA classification, diagnostic approach, and long-term management in children. Missed or undertreated RTA causes severe growth failure, nephrocalcinosis, and metabolic bone disease.",
  sections: {
    quick_summary: {
      definition: "Normal anion gap metabolic acidosis caused by tubular dysfunction in H⁺ secretion (dRTA Type I), HCO₃⁻ reabsorption (pRTA Type II), or aldosterone deficiency/resistance (Type IV). eGFR usually preserved.",
      epidemiology: "dRTA most common hereditary RTA in children (SLC4A1, ATP6V1B1, ATP6V0A4 mutations). Fanconi syndrome: multiple proximal tubular defects (Type II RTA + phosphaturia + glucosuria + aminoaciduria).",
      pathophysiology: "Type I (distal): failure to secrete H⁺ in collecting duct → urine pH cannot be lowered below 5.5 → HCO₃⁻ wasted → metabolic acidosis + hypokalaemia + nephrocalcinosis. Type II (proximal): failure to reabsorb HCO₃⁻ in PCT → acidosis + hypokalaemia (bicarbonaturia worsens when HCO₃⁻ replaces). Type IV: aldosterone deficiency/resistance → failure to secrete K⁺ and H⁺ → hyperkalemia + mild acidosis.",
      age_specific: "Type I hereditary: infancy; failure to thrive + vomiting + dehydration + hypokalaemia. Fanconi: rickets + polyuria + polydipsia + growth failure. Type IV: usually acquired (CKD, diabetic nephropathy, drugs).",
      emergency_recognition: [
        "Severe hypokalaemia K⁺ <2.5 in Type I RTA → weakness, arrhythmia, respiratory failure",
        "Hypokalaemic paralysis: acute flaccid paralysis — K⁺ <2.0 mmol/L",
        "Severe metabolic acidosis pH <7.2 from Type II RTA decompensation"
      ],
      immediate_management: [
        "Identify type: send simultaneous serum and urine electrolytes, ABG, urine pH",
        "Type I (dRTA): urine pH >5.5 even in acidosis — hallmark",
        "Type II (pRTA): urine pH <5.5 at baseline (can acidify); rises when HCO₃⁻ given",
        "Potassium citrate/bicarbonate: primary treatment for all types"
      ]
    },
    classification: [
      { type: "Type I (dRTA)", definition: "Distal — H⁺ secretion failure; urine pH >5.5; hypokalaemia; nephrocalcinosis", management: "Citrate/bicarbonate 2–4 mEq/kg/day; K⁺ citrate preferred (K⁺ supplement + alkaliniser)" },
      { type: "Type II (pRTA)", definition: "Proximal — HCO₃⁻ reabsorption failure; urine pH <5.5 at baseline; Fanconi if multiple defects", management: "High-dose bicarbonate 5–15 mEq/kg/day (large losses); thiazide diuretic adjunct; treat underlying cause" },
      { type: "Type IV (hyperkalemic)", definition: "Aldosterone deficiency/resistance; hyperkalemia + mild acidosis; urine pH <5.5", management: "Treat underlying CKD; fludrocortisone if true hypoaldosteronism; K⁺ restriction" },
      { type: "Fanconi syndrome", definition: "Full PCT failure: RTA II + phosphaturia + glucosuria + aminoaciduria + uricosuria", management: "Treat cause; phosphate supplementation; vitamin D; bicarbonate; remove nephrotoxin" }
    ],
    management: {
      type_1_drta: [
        "Potassium citrate solution 1–3 mEq/kg/day in 3–4 divided doses — preferred (provides K⁺ + alkalinisation)",
        "Alternatively: potassium bicarbonate + sodium bicarbonate combination",
        "Target: HCO₃⁻ ≥22 mmol/L; urine citrate >320 mg/g Cr (citrate reduces nephrocalcinosis risk)",
        "Nephrocalcinosis monitoring: renal USS every 6–12 months",
        "Growth: correct acidosis completely — growth velocity normalises with adequate treatment",
        "Lifelong treatment necessary (genetic causes do not resolve)"
      ],
      type_2_prta: [
        "Sodium bicarbonate 5–15 mEq/kg/day in 4–6 divided doses (very high HCO₃⁻ losses)",
        "Thiazide diuretic (hydrochlorothiazide 1–2 mg/kg/day) — reduces bicarbonaturia via volume contraction",
        "Treat underlying cause: Lowe syndrome, cystinosis (cysteamine), galactosaemia (galactose-free diet), Wilson disease (copper chelation)",
        "Cystinosis: cysteamine arrests progression of Fanconi and prevents systemic cystine accumulation",
        "Phosphate supplementation + calcitriol if rickets present (Fanconi-associated phosphaturia)"
      ],
      fanconi_management: [
        "Identify and treat cause: cystinosis (most common genetic cause), galactosaemia, tyrosinaemia, Wilson, glycogen storage, Dent disease, heavy metal toxicity",
        "Phosphate: neutral phosphate 20–40 mg/kg/day elemental phosphorus in 4–5 divided doses",
        "Vitamin D: calcitriol 0.01–0.05 mcg/kg/day (defective 1α-hydroxylation in PCT)",
        "Bicarbonate: high doses as above (Type II component)",
        "K⁺ and Na⁺ supplementation based on urinary losses",
        "Monitor for progressive CKD in Dent disease (CLCN5 mutations) and heavy proteinuria"
      ]
    },
    drugs: [
      {
        name: "Potassium citrate solution",
        dose: "1–3 mEq/kg/day in 3–4 divided doses (Type I dRTA)",
        max: "Titrate to HCO₃⁻ ≥22 mmol/L",
        purpose: "Type I RTA — provides K⁺ replacement + alkalinisation + urinary citrate (anti-nephrocalcinosis)",
        monitoring: "K⁺, HCO₃⁻ monthly; urine citrate (target >320 mg/g Cr); renal USS 6-monthly",
        notes: "Liquid preparation better tolerated in young children. Avoid sodium bicarbonate alone in dRTA — worsens hypokalaemia. Urinary citrate normalisation = proof of adequate treatment."
      },
      {
        name: "Sodium bicarbonate",
        dose: "5–15 mEq/kg/day in 4–6 divided doses (Type II pRTA)",
        max: "Titrate to serum HCO₃⁻ (difficult to maintain >20 in pRTA — bicarbonate wasted)",
        purpose: "Type II RTA alkalinisation (very high doses needed due to bicarbonaturia)",
        monitoring: "HCO₃⁻, K⁺, Na⁺; growth velocity",
        notes: "GI side effects (bloating, diarrhoea) limit compliance at high doses. Citrate solutions better tolerated. Type II: bicarbonaturia worsens with dosing — accept partial correction (HCO₃⁻ 18–20) with thiazide adjunct."
      },
      {
        name: "Cysteamine (Procysbi)",
        dose: "1.3 g/m²/day in 4 doses (immediate release); 1.95 g/m²/day BD (delayed release)",
        max: "1.95 g/m²/day",
        purpose: "Cystinosis — depletes intralysosomal cystine; preserves renal function",
        monitoring: "WBC cystine level (target <1 nmol 1/2 cystine/mg protein); LFT, skin (hyperpensity), bone density",
        notes: "Start early — before renal damage. Foul odour/taste — affects compliance. Delayed release (Procysbi) allows BD dosing and improves compliance significantly."
      }
    ],
    monitoring: {
      frequency: "Monthly until stable, then 3-monthly. Renal USS every 6–12 months (nephrocalcinosis).",
      parameters: [
        "Serum HCO₃⁻, K⁺, Na⁺, Cl⁻ — target HCO₃⁻ ≥22",
        "ABG if clinically acidotic",
        "Urine: pH, Na⁺, K⁺, Cl⁻, Ca²⁺, PO₄, citrate, creatinine, glucose, amino acids (Fanconi screen)",
        "Renal USS every 6–12 months (nephrocalcinosis in Type I)",
        "Growth: height velocity (corrects with adequate treatment — sensitive marker of control)",
        "Bone XR/DEXA annually if rickets risk (Fanconi)",
        "Hearing if ATP6V1B1 mutation (sensorineural hearing loss in hereditary dRTA)"
      ],
      follow_up: "Lifelong nephrology for hereditary RTA. Audiological review in hereditary dRTA (SNHL). Ophthalmology in Lowe syndrome. Cystinosis: multi-organ follow-up (eyes, CNS, thyroid, gonads)."
    },
    nutrition: [
      "Potassium-rich foods: Type I and II RTA (hypokalaemia) — fruit, vegetables, dairy",
      "Calcium: adequate dietary intake; avoid excessive calcium supplementation (worsens nephrocalcinosis risk in Type I)",
      "Phosphate-rich foods: important in Fanconi/Type II with phosphaturia → phosphate-rich diet + supplementation",
      "Citrus foods: natural source of citrate — supports urinary citrate in Type I",
      "Low-oxalate diet: in Type I with high urine oxalate (nephrocalcinosis risk)"
    ],
    vaccination: [
      "Standard schedule maintained",
      "If underlying cystinosis or Lowe syndrome: ensure all routine vaccinations up to date",
      "No specific vaccine contraindications for RTA"
    ],
    red_flags: [
      "K⁺ <2.5 in RTA → IV KCl replacement urgently; continuous cardiac monitoring",
      "Growth velocity falling despite treatment → check compliance, HCO₃⁻ levels",
      "New nephrocalcinosis on USS in treated Type I → sub-therapeutic alkalinisation or inadequate citrate",
      "Progressive CKD in Type II → underlying cause (cystinosis, Dent) not adequately treated"
    ],
    pearls: [
      "dRTA hallmark: urine pH >5.5 during systemic acidosis — the kidney CANNOT acidify urine despite low blood pH",
      "Growth normalises completely with adequate alkali replacement — height velocity is the clinical marker of treatment adequacy",
      "pRTA: increasing bicarbonate dose → more bicarbonaturia (Tm exceeded) → aciduria paradoxically → do NOT simply increase dose",
      "Fanconi: phosphaturia causes rickets — phosphate supplementation + calcitriol is critical (NOT just alkalinisation)",
      "Hearing loss in hereditary dRTA (ATP6V1B1 mutations) — screen audiologically and refer early"
    ]
  }
}
];