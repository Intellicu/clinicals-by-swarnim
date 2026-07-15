/**
 * CORE GUIDELINES — AKI, CKD, Nephrotic Syndrome, Hypertension, HUS
 * Reference-quality content: all 11 standardized sections per guideline.
 */

export const CORE_GUIDELINES = [

// ═══════════════════════════════════════════════════════════════════════════
// 1. AKI
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-aki",
  references: [
    {
      id: "aki-ref1",
      citation: "KDIGO AKI Work Group. KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1–138.",
      authors: "KDIGO AKI Work Group",
      journal: "Kidney International Supplements",
      year: 2012,
      volume: "2(1)",
      pages: "1–138",
      doi: "10.1038/kisup.2012.1",
      pmid: "25018919",
      evidence_grade: "A",
      guideline_body: "KDIGO",
      type: "Clinical Practice Guideline",
      key_recommendation: "Defines AKI staging (Stage 1–3) and evidence-based management algorithm"
    },
    {
      id: "aki-ref2",
      citation: "Goldstein SL, Chawla LS. Renal angina. Clin J Am Soc Nephrol. 2010;5(5):943–949.",
      authors: "Goldstein SL, Chawla LS",
      journal: "Clinical Journal of the American Society of Nephrology",
      year: 2010,
      volume: "5(5)",
      pages: "943–949",
      doi: "10.2215/CJN.07201009",
      pmid: "20413442",
      evidence_grade: "B",
      type: "Original Article",
      key_recommendation: "Renal angina index for early AKI risk stratification in critically ill children"
    },
    {
      id: "aki-ref3",
      citation: "Jetton JG, Askenazi DJ. Acute kidney injury in the neonate. Clin Perinatol. 2014;41(3):487–502.",
      authors: "Jetton JG, Askenazi DJ",
      journal: "Clinics in Perinatology",
      year: 2014,
      volume: "41(3)",
      pages: "487–502",
      doi: "10.1016/j.clp.2014.05.001",
      pmid: "25155722",
      evidence_grade: "B",
      type: "Review",
      key_recommendation: "Neonatal AKI definition, epidemiology and management"
    },
    {
      id: "aki-ref4",
      citation: "Srisawat N, Kellum JA. Prevention of acute kidney injury: which measures are most effective? Contrib Nephrol. 2011;174:1–10.",
      authors: "Srisawat N, Kellum JA",
      journal: "Contributions to Nephrology",
      year: 2011,
      volume: "174",
      pages: "1–10",
      doi: "10.1159/000329230",
      pmid: "21921619",
      evidence_grade: "B",
      type: "Review",
      key_recommendation: "Nephroprotective strategies and nephrotoxin avoidance in AKI"
    },
    {
      id: "aki-ref5",
      citation: "Zappitelli M, Parikh CR, Akcan-Arikan A, et al. Ascertainment and epidemiology of acute kidney injury varies with definition interpretation. Clin J Am Soc Nephrol. 2008;3(4):948–954.",
      authors: "Zappitelli M et al",
      journal: "Clinical Journal of the American Society of Nephrology",
      year: 2008,
      volume: "3(4)",
      pages: "948–954",
      doi: "10.2215/CJN.05431207",
      pmid: "18417739",
      evidence_grade: "B",
      type: "Original Article",
      key_recommendation: "Paediatric AKI epidemiology with KDIGO-aligned definitions"
    },
    {
      id: "aki-ref6",
      citation: "Basu RK, Wheeler DS. Kidney-protective strategies in the critically ill: the role of extracorporeal kidney support. Pediatr Nephrol. 2013;28(9):1545–1557.",
      authors: "Basu RK, Wheeler DS",
      journal: "Pediatric Nephrology",
      year: 2013,
      volume: "28(9)",
      pages: "1545–1557",
      doi: "10.1007/s00467-012-2383-0",
      pmid: "23151850",
      evidence_grade: "B",
      type: "Review",
      key_recommendation: "CRRT, PICU AKI management and RRT modality selection in children"
    }
  ],
  title: "Acute Kidney Injury (AKI) in Children",
  category: "AKI",
  source: "KDIGO / PRNT",
  year: 2024,
  evidence_level: "High Quality Evidence",
  tags: ["AKI", "oliguria", "KDIGO", "RRT", "furosemide", "hyperkalemia"],
  summary: "KDIGO AKI staging and management for children. Early recognition, nephroprotection, complication treatment, and timely RRT are the pillars.",
  sections: {
    quick_summary: {
      definition: "Rise in SCr ≥0.3 mg/dL within 48h OR ≥1.5× baseline within 7 days OR UO <0.5 mL/kg/h for ≥6h (KDIGO 2012).",
      epidemiology: "AKI occurs in 3–5% of all hospitalised children; 20–30% of PICU admissions. Sepsis and nephrotoxins are top causes.",
      pathophysiology: "Pre-renal (60%): reduced perfusion → GFR drop reversible with fluids. Intrinsic (30%): ATN (ischaemia/toxin), GN, HUS. Post-renal (10%): obstruction. ATN: tubular epithelial injury → cast obstruction + back-leak + reduced GFR.",
      age_specific: "Neonates: define AKI by SCr rise ≥0.3 mg/dL within 48h (baseline SCr reflects maternal value in first 72h). Infants: non-oliguric AKI common in preterm. Adolescents: drug-induced AKI and rhabdomyolysis increasingly seen.",
      emergency_recognition: [
        "Anuria (UO=0) or severe oliguria (<0.3 mL/kg/h) unresponsive to 2× fluid bolus",
        "K⁺ >6.5 mmol/L OR ECG changes: peaked T, wide QRS, sine wave pattern",
        "Metabolic acidosis pH <7.1 OR HCO₃⁻ <10 mmol/L",
        "Fluid overload ≥15% bodyweight with respiratory distress or SpO₂ <95%",
        "Altered consciousness, seizures — uremic encephalopathy",
        "Severe hypertension >99th percentile + headache/vomiting"
      ],
      immediate_management: [
        "IV access + weight + BP + UO via catheter within 30 min",
        "Stat: K⁺, Na⁺, HCO₃⁻, Ca²⁺, PO₄, Cr, BUN, ABG, LDH, blood film",
        "ECG if K⁺ >6 — treat hyperkalemia emergently if ECG changes present",
        "Pre-renal: NS 10–20 mL/kg over 30–60 min; reassess UO + weight after",
        "Stop all nephrotoxins: NSAIDs, aminoglycosides, ACE-I, radio-contrast",
        "Furosemide 1–2 mg/kg IV if volume-replete and oliguric (converts, does NOT cure)",
        "Restrict fluids to insensible (400 mL/m²/day) + UO if intrinsic AKI",
        "Renal USS within 24h to exclude obstruction"
      ]
    },
    staging: {
      kdigo: [
        { stage: "1", scr: "1.5–1.9× baseline OR +0.3 mg/dL in 48h", uo: "<0.5 mL/kg/h × 6–12h", action: "Identify cause, stop nephrotoxins, optimise fluids" },
        { stage: "2", scr: "2.0–2.9× baseline", uo: "<0.5 mL/kg/h × ≥12h", action: "Nephrology consult, daily weight, electrolyte monitoring q6h" },
        { stage: "3", scr: "≥3× OR ≥4 mg/dL OR RRT initiated", uo: "<0.3 mL/kg/h × ≥24h OR anuria ≥12h", action: "ICU admission, RRT initiation usually required" }
      ]
    },
    management: {
      fluid_management: [
        "Pre-renal AKI: NS 10–20 mL/kg bolus; reassess after each bolus — repeat max 3× if responsive",
        "Volume-replete + oliguric: furosemide 1–4 mg/kg IV; escalate to infusion 0.1–0.5 mg/kg/h",
        "Intrinsic AKI: restrict to insensible + UO; avoid over-hydration (fluid overload = independent mortality predictor)",
        "Fluid overload >10%: furosemide aggressively; >20% not responding = RRT indication",
        "Weigh every 6–8h; strict I/O chart; serum electrolytes every 6h in Stage 2–3"
      ],
      hyperkalemia_management: [
        "K⁺ >6.5 or ECG changes: Calcium gluconate 10% 0.5–1 mL/kg IV over 5 min (cardiac stabilisation)",
        "Simultaneously: salbutamol nebulised 2.5–5 mg (shifts K⁺ in; onset 30 min)",
        "NaHCO₃ 1–2 mEq/kg IV if acidotic (onset 15–30 min; avoid if hypernatraemic)",
        "Insulin 0.1 U/kg + dextrose 0.5 g/kg IV (onset 15–30 min; check glucose q30 min)",
        "Furosemide 2 mg/kg IV if not anuric (promotes renal K⁺ loss)",
        "Calcium resonium 1 g/kg PO/PR (GI removal; slow — 4–6h)",
        "Dialysis if K⁺ uncontrolled or ECG worsening despite above — do not delay"
      ],
      rrt_indications: [
        "Fluid overload ≥20% refractory to max diuresis",
        "K⁺ >6.5 or ECG changes not responding to medical therapy",
        "pH <7.1 or HCO₃⁻ <10 not responding to bicarbonate",
        "BUN >100 mg/dL with uremic symptoms (vomiting, encephalopathy, pericarditis)",
        "Anuria >12–24h without reversible cause",
        "Uncontrolled hypertensive crisis"
      ],
      rrt_modality: [
        "CRRT: haemodynamically unstable, fluid overloaded, PICU — CVVHDF preferred",
        "Acute PD: weight <20 kg, haemodynamically stable, no peritoneal pathology — simple bedside setup",
        "IHD: older children, stable, need rapid solute clearance (post-cardiac surgery, severe uraemia)"
      ],
      nephrotoxin_avoidance: [
        "Aminoglycosides: once-daily dosing if unavoidable; trough <1 mg/L; duration ≤5 days",
        "NSAIDs: absolute contraindication in AKI; switch to paracetamol",
        "ACE-I/ARB: hold until Cr stable — avoid in bilateral RAS, volume depletion",
        "Radiocontrast: pre-hydrate with NS 1 mL/kg/h for 6h pre and 6h post; use iso-osmolar contrast",
        "Vancomycin: AUC/MIC-guided dosing (target AUC 400–600); avoid trough >15 mg/L"
      ]
    },
    drugs: [
      {
        name: "Furosemide",
        dose: "1–4 mg/kg/dose IV; infusion 0.1–0.5 mg/kg/h",
        max: "6 mg/kg/day; 200 mg/dose",
        purpose: "Fluid overload conversion oliguric→non-oliguric (does NOT prevent AKI progression)",
        monitoring: "UO hourly, K⁺ and Mg²⁺ daily, BP 4-hourly; ototoxicity risk with prolonged high doses",
        renal_adjust: "No dose reduction needed; titrate to response",
        notes: "Push over 2–4 min IV. Continuous infusion more effective than bolus for volume overload. Combine with metolazone if resistant (sequential nephron blockade)."
      },
      {
        name: "Calcium gluconate 10%",
        dose: "0.5–1 mL/kg IV over 5–10 min",
        max: "20 mL/dose; repeat q30–60 min if ECG changes persist",
        purpose: "Cardiac membrane stabilisation in hyperkalaemia (does NOT lower serum K⁺)",
        monitoring: "Continuous ECG during infusion; IV site (extravasation → tissue necrosis)",
        notes: "Central line preferred. Do NOT mix with NaHCO₃ in same line (precipitates). Onset 1–3 min; duration 30–60 min."
      },
      {
        name: "Sodium bicarbonate 8.4%",
        dose: "1–2 mEq/kg IV over 10–20 min",
        max: "50 mEq/dose",
        purpose: "Metabolic acidosis; K⁺ shift in hyperkalaemia",
        monitoring: "pH, pCO₂, ionised Ca²⁺ (NaHCO₃ lowers iCa²⁺), serum Na⁺",
        notes: "Avoid if hypernatraemic or fluid-overloaded. Each 50 mL of 8.4% = 50 mEq Na⁺. Incompatible with calcium in same line."
      },
      {
        name: "Insulin regular + dextrose",
        dose: "Insulin 0.1 U/kg IV + dextrose 0.5 g/kg as 10% dextrose co-infusion",
        max: "10 U insulin/dose",
        purpose: "Hyperkalaemia — β-cell stimulated intracellular K⁺ shift",
        monitoring: "Blood glucose every 30 min for 2h; K⁺ at 1h",
        notes: "Onset 15–30 min; duration 2–4h. Always give dextrose simultaneously to prevent hypoglycaemia."
      },
      {
        name: "Salbutamol nebulised",
        dose: "2.5 mg (<25 kg); 5 mg (≥25 kg)",
        max: "5 mg/dose; repeat q2–4h",
        purpose: "Hyperkalaemia — β₂ adrenergic K⁺ shift into cells",
        monitoring: "HR (tachycardia), glucose (can cause hyperglycaemia)",
        notes: "Onset 30 min; duration 2h. IV salbutamol more potent but more cardiac side effects. Use together with other K⁺-lowering measures."
      },
      {
        name: "Calcium resonium",
        dose: "1 g/kg PO or PR q6–8h",
        max: "15 g/dose (adult dose)",
        purpose: "GI K⁺ removal (slow — 4–6h onset)",
        monitoring: "Bowel movements, serum Ca²⁺, K⁺",
        notes: "Avoid in gut dysmotility, NEC, or post-bowel surgery. Rectal: retain 30–60 min. Slower than other measures — use alongside rapid-acting agents."
      }
    ],
    monitoring: {
      frequency: "AKI Stage 1: q8–12h electrolytes. Stage 2–3: q4–6h electrolytes + UO hourly. Post-discharge: 1w, 1m, 3m, 1y.",
      parameters: [
        "Serum Cr, BUN, Na⁺, K⁺, Cl⁻, HCO₃⁻, Ca²⁺, PO₄, Mg²⁺",
        "Urine output hourly (catheter during acute phase)",
        "Weight every 6–8h in oliguric AKI",
        "Strict fluid balance chart 4-hourly",
        "BP every 4–6h",
        "Renal USS within 24h (obstruction, vasculature)",
        "Blood film + LDH + haptoglobin (exclude TMA/HUS)",
        "Urine microscopy: casts = intrinsic AKI; RBC casts = GN",
        "ANCA, anti-GBM, C3/C4 if nephritis suspected"
      ],
      follow_up: "All hospitalised AKI: follow at 1 week (Cr, BP, UA), 3 months (eGFR, UA, BP), 12 months (eGFR, UPCR, BP). AKI Stage 3: nephrology follow-up mandatory — 8× increased CKD risk."
    },
    nutrition: [
      "Start enteral nutrition within 24–48h — AKI is hypercatabolic; malnutrition worsens outcomes",
      "Protein: 1.5–2.0 g/kg/day in non-dialysed AKI; 2.5–3.0 g/kg/day on CRRT (effluent losses)",
      "Energy: 25–35 kcal/kg/day; avoid overfeeding (↑ CO₂ production in ventilated patients)",
      "K⁺ restriction <2 mEq/kg/day if hyperkalaemic; PO₄ restriction if hyperphosphataemic",
      "Fluid: insensible (400 mL/m²/day) + UO in oliguric AKI — strict balance",
      "Na⁺ 1–2 mEq/kg/day if fluid-overloaded or hypertensive",
      "Enteral route preferred; parenteral only if gut not functional"
    ],
    vaccination: [
      "Defer non-urgent vaccines during acute AKI (immune response impaired; live vaccines risky on steroids)",
      "Post-AKI recovery: ensure pneumococcal, influenza, hepatitis B status current",
      "If AKI progresses to CKD: full CKD vaccination protocol (see CKD guideline)",
      "If on steroids >20 mg/day prednisolone: defer live vaccines (MMR, varicella, rotavirus)"
    ],
    red_flags: [
      "Anuria >8h despite IV fluids + furosemide → USS + nephrology same day",
      "K⁺ >6.5 or peaked T on ECG → calcium gluconate STAT",
      "pH <7.1 or HCO₃⁻ <10 → bicarbonate ± urgent dialysis",
      "Fluid overload ≥15% + respiratory distress → PICU + RRT",
      "Schistocytes + thrombocytopenia + AKI → HUS/TMA — ADAMTS13 + complement panel",
      "Haematuria + proteinuria + hypertension → GN — C3/C4, ANCA, anti-GBM urgently",
      "AKI not responding to 48h of appropriate management → reassess diagnosis"
    ],
    pearls: [
      "FENa <1% unreliable with diuretics, contrast nephropathy, myoglobinuria — use FEUrea <35% instead",
      "Furosemide converts oliguric → non-oliguric AKI (easier fluid management) but does NOT change prognosis or prevent RRT",
      "Renal USS can miss bilateral ureteric obstruction — hydronephrosis absent if acutely obstructed or dehydrated",
      "Even AKI Stage 1 carries 8× increased lifetime CKD risk — ALL admitted AKI requires outpatient nephrology follow-up",
      "Pseudo-hyperkalaemia: extreme leukocytosis/thrombocytosis or haemolysed sample — recheck before treating ECG-negative high K⁺",
      "Ca gluconate and NaHCO₃ in same IV line → calcium carbonate precipitate → occlusion; use separate lines",
      "CRRT delivered dose ≠ prescribed dose — account for downtime (filter changes, priming); actual delivery typically 15–20% lower"
    ]
  }
},

// ═══════════════════════════════════════════════════════════════════════════
// 2. CKD
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-ckd",
  references: [
    {
      id: "ckd-ref1",
      citation: "KDIGO 2012 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int Suppl. 2013;3(1):1–150.",
      authors: "Kidney Disease: Improving Global Outcomes (KDIGO) CKD Work Group",
      journal: "Kidney International Supplements",
      year: 2013,
      volume: "3(1)",
      pages: "1–150",
      doi: "10.1038/kisup.2012.73",
      pmid: "25018022",
      evidence_grade: "A",
      guideline_body: "KDIGO",
      type: "Clinical Practice Guideline",
      key_recommendation: "CKD staging (G1–G5), albuminuria categories, and management framework"
    },
    {
      id: "ckd-ref2",
      citation: "Wühl E, Trivelli A, Picca S, et al. Strict blood-pressure control and progression of renal failure in children. N Engl J Med. 2009;361(17):1639–1650.",
      authors: "Wühl E, Trivelli A, Picca S, et al (ESCAPE Trial Group)",
      journal: "New England Journal of Medicine",
      year: 2009,
      volume: "361(17)",
      pages: "1639–1650",
      doi: "10.1056/NEJMoa0902066",
      pmid: "19846849",
      evidence_grade: "A",
      type: "Randomized Controlled Trial",
      key_recommendation: "ESCAPE trial: intensive BP target <50th percentile halved CKD progression vs conventional target in children"
    },
    {
      id: "ckd-ref3",
      citation: "Warady BA, Abraham AG, Schwartz GJ, et al. Predictors of Rapid Progression of Glomerular and Nonglomerular Kidney Disease in Children and Adolescents: The Chronic Kidney Disease in Children (CKiD) Cohort. Am J Kidney Dis. 2015;65(6):878–888.",
      authors: "Warady BA, Abraham AG, Schwartz GJ et al",
      journal: "American Journal of Kidney Diseases",
      year: 2015,
      volume: "65(6)",
      pages: "878–888",
      doi: "10.1053/j.ajkd.2015.01.008",
      pmid: "25726948",
      evidence_grade: "B",
      type: "Prospective Cohort Study",
      key_recommendation: "CKiD cohort: predictors of rapid GFR decline in paediatric CKD; proteinuria and lower eGFR are key"
    },
    {
      id: "ckd-ref4",
      citation: "Mahan JD, Warady BA, Consensus Committee. Assessment and treatment of short stature in pediatric patients with chronic kidney disease: a consensus statement. Pediatr Nephrol. 2006;21(7):917–930.",
      authors: "Mahan JD, Warady BA, Consensus Committee",
      journal: "Pediatric Nephrology",
      year: 2006,
      volume: "21(7)",
      pages: "917–930",
      doi: "10.1007/s00467-006-0020-y",
      pmid: "16791614",
      evidence_grade: "B",
      type: "Consensus Statement",
      key_recommendation: "Growth assessment and rhGH therapy indications in paediatric CKD"
    },
    {
      id: "ckd-ref5",
      citation: "KDIGO 2017 Clinical Practice Guideline Update for the Diagnosis, Evaluation, Prevention, and Treatment of Chronic Kidney Disease–Mineral and Bone Disorder (CKD-MBD). Kidney Int Suppl. 2017;7(1):1–59.",
      authors: "KDIGO CKD-MBD Update Work Group",
      journal: "Kidney International Supplements",
      year: 2017,
      volume: "7(1)",
      pages: "1–59",
      doi: "10.1016/j.kisu.2017.04.001",
      pmid: "30675373",
      evidence_grade: "A",
      guideline_body: "KDIGO",
      type: "Clinical Practice Guideline",
      key_recommendation: "CKD-MBD management: PTH targets, phosphate binders, active vitamin D, calcimimetics"
    },
    {
      id: "ckd-ref6",
      citation: "KDIGO 2012 Clinical Practice Guideline for Anemia in Chronic Kidney Disease. Kidney Int Suppl. 2012;2(4):279–335.",
      authors: "KDIGO Anemia Work Group",
      journal: "Kidney International Supplements",
      year: 2012,
      volume: "2(4)",
      pages: "279–335",
      doi: "10.1038/kisup.2012.37",
      pmid: "25018998",
      evidence_grade: "A",
      guideline_body: "KDIGO",
      type: "Clinical Practice Guideline",
      key_recommendation: "ESA therapy, Hb targets (10–12 g/dL), iron optimisation before ESA"
    }
  ],
  title: "Chronic Kidney Disease (CKD) in Children",
  category: "CKD",
  source: "KDIGO / PRNT / CKiD Study",
  year: 2024,
  evidence_level: "High Quality Evidence",
  tags: ["CKD", "eGFR", "Schwartz", "anaemia", "CKD-MBD", "growth", "ESRD", "dialysis planning"],
  summary: "CKD staging, complication management (anaemia, MBD, acidosis, hypertension, growth), nutrition, RRT planning, and transplant referral for children 1–18y.",
  sections: {
    quick_summary: {
      definition: "eGFR <60 mL/min/1.73m² for ≥3 months OR kidney damage markers (proteinuria, haematuria, structural abnormality) persisting ≥3 months regardless of GFR.",
      epidemiology: "Prevalence 15–74 per million children. CAKUT (congenital anomalies) ~50%; GN ~25%; hereditary ~15%. CKD is a major cause of childhood hypertension, growth failure and cardiovascular risk.",
      pathophysiology: "Nephron loss → compensatory hypertrophy → hyperfiltration → glomerulosclerosis → progressive loss. Proteinuria itself drives tubulointersitial fibrosis. Each CKD stage ≥ G3b doubles CVD risk.",
      age_specific: "Infants: CAKUT dominates; oligoanhydramnios → lung hypoplasia. Under-5y: growth and neurodevelopment critical. Adolescents: adherence, transition planning, psychosocial issues.",
      emergency_recognition: [
        "Uremic symptoms: persistent vomiting, drowsiness, pruritus, pericardial rub — urgent dialysis",
        "Hypertensive emergency: BP >99th percentile + headache/vomiting/visual changes",
        "K⁺ >6.5 or pH <7.1 — electrolyte emergency",
        "Pulmonary oedema — urgent fluid removal",
        "Rapid GFR decline >25% in 3 months — investigate reversible cause"
      ],
      immediate_management: [
        "Stage-guided management (see staging table)",
        "First-line BP: ACE-I (enalapril 0.1–0.5 mg/kg/day) if proteinuric — targets BP AND proteinuria",
        "Target BP <50th percentile on ABPM (ESCAPE trial evidence)",
        "Correct acidosis: NaHCO₃ to target HCO₃⁻ ≥22 mmol/L",
        "Correct anaemia before considering rhGH",
        "Plot growth on EVERY visit — height velocity is a vital sign"
      ]
    },
    staging: {
      ckd: [
        { stage: "G1", gfr: "≥90", description: "Normal/High eGFR", action: "Diagnose aetiology, treat cause, BP/proteinuria control, lifestyle" },
        { stage: "G2", gfr: "60–89", description: "Mildly decreased", action: "Monitor q6–12m, ACE-I if proteinuric, optimise BP" },
        { stage: "G3a", gfr: "45–59", description: "Mild–moderate", action: "Anaemia screen, bone profile q6m, dietitian referral" },
        { stage: "G3b", gfr: "30–44", description: "Moderate–severe", action: "ESA if Hb <10, phosphate binder, calcitriol, MBD monitoring" },
        { stage: "G4", gfr: "15–29", description: "Severely decreased", action: "RRT planning, transplant workup, vascular access planning, GH assessment" },
        { stage: "G5", gfr: "<15", description: "Kidney failure", action: "Initiate RRT or pre-emptive transplant; conservative management if appropriate" }
      ]
    },
    management: {
      hypertension: [
        "Target BP <50th percentile for age/height/sex on ABPM — stronger target than standard paediatric <95th percentile",
        "ACE-I first-line if proteinuric: enalapril 0.1–0.5 mg/kg/day OD–BD (antiproteinuric + antihypertensive)",
        "ARB (losartan 0.7–1.4 mg/kg/day OD) if ACE-I-induced cough (typically non-productive dry cough in 10–20%)",
        "DO NOT combine ACE-I + ARB (ALTITUDE, ONTARGET — increased K⁺ and AKI risk)",
        "Add amlodipine 0.1–0.2 mg/kg/day if dual target BP not reached on ACE-I alone",
        "Check K⁺ and Cr 1–2 weeks after ACE-I start; acceptable Cr rise ≤25–30%"
      ],
      anaemia: [
        "Screen Hb, ferritin, TSAT at every visit from G3 onward",
        "Target Hb 10–12 g/dL (KDIGO; do NOT target >13 — TREAT/CREATE trials — CVD risk)",
        "Iron first: correct to ferritin >100 ng/mL + TSAT >20% before starting ESA",
        "IV iron (ferric carboxymaltose 15 mg/kg) preferred in CKD G4–5 and dialysis (PO poorly absorbed)",
        "ESA: erythropoietin alfa 50–200 IU/kg SC 3×/week; darbepoetin alfa 0.45 mcg/kg weekly",
        "ESA hyporesponsiveness: check iron, inflammation (CRP), hyperPTH, aluminium toxicity, haemolysis"
      ],
      ckd_mbd: [
        "PO₄ restriction: avoid high-phosphate foods (dairy, cola, processed foods, legumes) in G3b+",
        "Calcium carbonate 25–50 mg/kg/day elemental Ca with meals as PO₄ binder in G3b–4",
        "Sevelamer if Ca×PO₄ product >55 mg²/dL² — prevents vascular calcification",
        "Calcitriol 0.01–0.05 mcg/kg/day — target PTH 2–9× ULN for CKD stage (not suppressed!)",
        "Aluminium-containing antacids CONTRAINDICATED in CKD — aluminium toxicity",
        "Bone age XR annually from G3b; DEXA if fragility fractures or on prolonged steroids"
      ],
      growth: [
        "Plot height/weight at every visit; calculate height velocity annually",
        "Correct all reversible factors FIRST: acidosis (HCO₃⁻ ≥22), anaemia (Hb ≥10), MBD (PTH in range), nutrition (100% EAR)",
        "rhGH indication: height SDS <−1.88 (below 3rd centile) after 6 months of CKD optimisation",
        "rhGH dose: 0.05 mg/kg/day SC; monitor IGF-1, glucose, bone age 6-monthly",
        "Growth plates close at puberty — start rhGH before epiphyseal fusion",
        "If GH-axis suppressed by steroids: reduce steroid dose if possible"
      ],
      acidosis: [
        "Target serum HCO₃⁻ ≥22 mmol/L — acidosis accelerates CKD progression AND stunts growth",
        "Sodium bicarbonate 1–3 mEq/kg/day PO in 2–3 divided doses, titrated to HCO₃⁻ ≥22",
        "Sodium citrate solution (Shohl's solution) better-tasting alternative — equivalent bicarbonate delivery",
        "Caution: each mEq NaHCO₃ delivers 1 mEq Na⁺ — monitor BP and oedema"
      ]
    },
    drugs: [
      {
        name: "Enalapril",
        dose: "0.1–0.5 mg/kg/day OD or BD",
        max: "40 mg/day",
        purpose: "Hypertension + antiproteinuric (ACE inhibitor, first-line in CKD)",
        monitoring: "K⁺, Cr at 1–2 weeks after start/dose change; BP each visit; cough",
        renal_adjust: "Reduce 50% if GFR <30; hold if K⁺ >6.0 or Cr rises >30% from baseline",
        notes: "Best taken in morning. If non-productive cough → switch to ARB (losartan). Teratogenic — counsel adolescent girls."
      },
      {
        name: "Losartan",
        dose: "0.7–1.4 mg/kg/day OD",
        max: "100 mg/day",
        purpose: "ARB — alternative to ACE-I if cough; antiproteinuric + antihypertensive",
        monitoring: "K⁺, Cr, BP",
        renal_adjust: "No dose adjustment required in CKD but increased K⁺ risk in advanced CKD",
        notes: "Do NOT combine with ACE-I. Teratogenic — counsel adolescent girls."
      },
      {
        name: "Calcitriol (1,25-dihydroxyvitamin D)",
        dose: "0.01–0.05 mcg/kg/day OD (typical dose range 0.25–2 mcg/day)",
        max: "2 mcg/day",
        purpose: "Secondary hyperparathyroidism, CKD-MBD",
        monitoring: "iCa²⁺, PO₄, PTH every 3 months; hypercalcaemia = dose reduction",
        notes: "Give at bedtime. If hypercalcaemia: reduce dose, don't stop abruptly. If PO₄ >5.5 mg/dL: control phosphate before calcitriol."
      },
      {
        name: "Erythropoietin alfa (Eprex/Wepox)",
        dose: "50–200 IU/kg SC 3×/week (titrate to Hb response)",
        max: "Do NOT target Hb >13 g/dL",
        purpose: "Renal anaemia CKD G3b+",
        monitoring: "Hb q2–4 weeks until stable, then monthly; iron stores; BP (EPO raises BP)",
        notes: "Never start if Hb >12 or iron-deficient. SC route preferred (less EPO needed than IV). Pure red cell aplasia: rare but serious — check anti-EPO antibodies if sudden anaemia on ESA."
      },
      {
        name: "Sodium bicarbonate",
        dose: "1–3 mEq/kg/day PO in 2–3 divided doses",
        max: "Titrate to HCO₃⁻ target",
        purpose: "Metabolic acidosis in CKD (slows progression + supports growth)",
        monitoring: "HCO₃⁻ at every visit, Na⁺, BP (Na load)",
        notes: "Sodium citrate mixture more palatable. Can cause GI bloating — take with food."
      },
      {
        name: "rhGH (somatropin)",
        dose: "0.05 mg/kg/day SC injection (evening)",
        max: "Per height response and IGF-1 levels",
        purpose: "CKD growth failure (height SDS <−1.88)",
        monitoring: "Height velocity 6-monthly, IGF-1, fasting glucose, bone age annually, BP",
        notes: "Optimise acidosis and nutrition FIRST — GH will not work in uncontrolled acidosis. Continue until final height or transplant. Notify endocrinology."
      },
      {
        name: "Ferric carboxymaltose IV",
        dose: "15 mg/kg IV over 15 min (undiluted)",
        max: "1000 mg/dose (adult); 15 mg/kg in paediatrics",
        purpose: "Iron deficiency in CKD G4–5 and dialysis (PO iron absorption poor)",
        monitoring: "Ferritin, TSAT at 4 weeks post; BP during infusion (hypophosphataemia risk)",
        notes: "Preferred over oral iron in dialysis and advanced CKD. Can cause hypophosphataemia especially in pre-dialysis — check PO₄ at 4 weeks."
      }
    ],
    monitoring: {
      frequency: "G1–2: annually. G3a: 6-monthly. G3b: 3-monthly. G4: 3-monthly. G5/dialysis: monthly.",
      parameters: [
        "eGFR (Schwartz formula 0.413×Ht/Cr; CKiD formula if available)",
        "UPCR morning spot urine",
        "Hb, ferritin, TSAT (anaemia screen from G3 onward)",
        "Na⁺, K⁺, HCO₃⁻, Ca²⁺, PO₄, Mg²⁺",
        "PTH, alk phosphatase, bone age XR annually (G3b+)",
        "Lipids, albumin, uric acid (6-monthly)",
        "BP at every visit (4-limb first visit to exclude coarctation)",
        "Height, weight, head circumference; calculate height velocity annually",
        "ABPM annually or when discrepant readings",
        "ECHO for LVH annually from G3b"
      ],
      follow_up: "Ophthalmology for hypertensive retinopathy. Neurodevelopment assessment 6-monthly in infants with CKD. Psychosocial support — quality of life assessment. Transition planning from age 14y."
    },
    nutrition: [
      "Do NOT restrict protein in CKD G1–3 — adequate protein essential for growth; target 100% EAR",
      "Modest protein restriction CKD G4–5: 0.8–1.0 g/kg/day (avoid severe restriction — worsens malnutrition)",
      "Calories: 100% EAR for age — CKD reduces appetite; enteral feeds (NGT/PEG) if oral intake <80% EAR",
      "Na⁺ restriction 1–2 mEq/kg/day if hypertensive or oedematous (not blanket restriction)",
      "K⁺ restriction only if confirmed hyperkalaemia — avoid blanket restriction which causes metabolic alkalosis",
      "PO₄ restriction with dietitian in G4–5: avoid processed foods, dark colas, dairy excesses",
      "Calcium: supplement only if deficient — excess calcium worsens vascular calcification",
      "Vitamin D: ergocalciferol/cholecalciferol if nutritional deficiency; calcitriol for 1α-hydroxylase deficiency of CKD"
    ],
    vaccination: [
      "Vaccinate as early as possible — immune response better at higher GFR",
      "Annual influenza (inactivated) — child and all household contacts",
      "Pneumococcal: PCV13 series + PPSV23 at ≥2y; revaccinate PPSV23 every 5y",
      "Hepatitis B: double-dose (40 mcg) in CKD G4–5 — check anti-HBs titre 4–8 weeks after last dose; revaccinate if <10 mIU/mL",
      "Meningococcal ACWY + B — before anticipated immunosuppression or dialysis",
      "Varicella: if naive — give BEFORE starting immunosuppression (≥1 month gap)",
      "MMR: live vaccine — defer if on significant immunosuppression; give in clinical remission",
      "HPV: 2–3 dose schedule — renal patients at elevated HPV-associated cancer risk"
    ],
    red_flags: [
      "eGFR decline >5 mL/min/1.73m² per year — investigate: drug toxicity, obstruction, dehydration, new GN flare",
      "UPCR >2000 mg/g or doubling — consider immunosuppression; biopsy if cause unclear",
      "K⁺ >6.0 or HCO₃⁻ <15 — urgent management",
      "Growth velocity < −2 SD per year despite CKD optimisation — rhGH indication",
      "Hb <7 g/dL acutely — transfuse if symptomatic; investigate ESA hyporesponsiveness",
      "PTH >9× ULN or Ca×PO₄ >55 — vascular calcification risk — intensify MBD management",
      "Rapid BP deterioration on 2 agents — investigate secondary cause, check ACE-I compliance"
    ],
    pearls: [
      "Bedside Schwartz (0.413×Ht/Cr) adequate for staging; full CKiD formula (with CysC) more accurate at GFR <30 — use when available",
      "ACE-I/ARB: antiproteinuric benefit is independent of BP effect — use even in normotensive CKD with UPCR >200 mg/mmol",
      "Growth is the most sensitive clinical indicator of CKD control — poor linear growth despite adequate nutrition means undertreated acidosis or MBD",
      "Correct metabolic acidosis BEFORE starting rhGH — GH resistance in acidosis means expensive therapy will fail",
      "Pre-emptive transplant at GFR 10–15 = best long-term outcome — avoids all dialysis complications",
      "PD is preferred first-line dialysis for children — home-based, better growth outcomes, continuous dialysis closer to physiological",
      "Never restrict protein in CKD <G4 — growth failure from protein restriction is more harmful than any theoretical GFR benefit"
    ]
  }
},

// ═══════════════════════════════════════════════════════════════════════════
// 3. NEPHROTIC SYNDROME (SSNS + FRNS/SDNS + SRNS comprehensive)
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-nephrotic",
  references: [
    {
      id: "ns-ref1",
      citation: "Kidney Disease: Improving Global Outcomes (KDIGO) Glomerulonephritis Work Group. KDIGO Clinical Practice Guideline for Glomerulonephritis. Kidney Int Suppl. 2012;2:139–274.",
      authors: "KDIGO GN Work Group",
      journal: "Kidney International Supplements",
      year: 2012,
      volume: "2",
      pages: "139–274",
      doi: "10.1038/kisup.2012.9",
      pmid: "25018935",
      evidence_grade: "A",
      guideline_body: "KDIGO",
      type: "Clinical Practice Guideline",
      key_recommendation: "Chapter 3: Minimal change disease; steroid protocol, FRNS/SDNS management"
    },
    {
      id: "ns-ref2",
      citation: "Teeninga N, Kist-van Holthe JE, van Rijswijk N, et al. Extending prednisolone treatment does not reduce relapses in childhood nephrotic syndrome. J Am Soc Nephrol. 2013;24(1):149–159.",
      authors: "Teeninga N, Kist-van Holthe JE, van Rijswijk N et al (PREDNOS study)",
      journal: "Journal of the American Society of Nephrology",
      year: 2013,
      volume: "24(1)",
      pages: "149–159",
      doi: "10.1681/ASN.2012070693",
      pmid: "23274430",
      evidence_grade: "A",
      type: "Randomized Controlled Trial",
      key_recommendation: "PREDNOS trial: extended steroid taper vs standard 8-week protocol in first-episode INS"
    },
    {
      id: "ns-ref3",
      citation: "Larkins NG, Liu ID, Willis NS, Craig JC, Hodson EM. Non-corticosteroid immunosuppressive medications for steroid-sensitive nephrotic syndrome in children. Cochrane Database Syst Rev. 2020;4:CD002290.",
      authors: "Larkins NG, Liu ID, Willis NS, Craig JC, Hodson EM",
      journal: "Cochrane Database of Systematic Reviews",
      year: 2020,
      volume: "4",
      pages: "CD002290",
      doi: "10.1002/14651858.CD002290.pub5",
      pmid: "32311079",
      evidence_grade: "A",
      type: "Systematic Review / Meta-analysis",
      key_recommendation: "Levamisole, MMF, tacrolimus, cyclophosphamide comparative effectiveness for FRNS/SDNS"
    },
    {
      id: "ns-ref4",
      citation: "Basu B, Bhatt MD, Sarkar PD. Evaluation of efficacy and safety of rituximab in pediatric patients with steroid-resistant nephrotic syndrome. Indian Pediatr. 2019;56(4):299–303.",
      authors: "Basu B, Bhatt MD, Sarkar PD",
      journal: "Indian Pediatrics",
      year: 2019,
      volume: "56(4)",
      pages: "299–303",
      pmid: "31031262",
      evidence_grade: "B",
      type: "Original Article",
      key_recommendation: "Rituximab efficacy and safety in paediatric SRNS — Indian cohort data"
    },
    {
      id: "ns-ref5",
      citation: "Trautmann A, Vivarelli M, Samuel S, et al. IPNA clinical practice recommendations for the diagnosis and management of children with steroid-resistant nephrotic syndrome. Pediatr Nephrol. 2020;35(8):1529–1561.",
      authors: "Trautmann A, Vivarelli M, Samuel S et al (IPNA Working Group)",
      journal: "Pediatric Nephrology",
      year: 2020,
      volume: "35(8)",
      pages: "1529–1561",
      doi: "10.1007/s00467-020-04519-1",
      pmid: "32382828",
      evidence_grade: "A",
      guideline_body: "IPNA",
      type: "Clinical Practice Recommendation",
      key_recommendation: "IPNA SRNS guideline: genetic testing panel, CNI therapy, rituximab indications, biopsy criteria"
    },
    {
      id: "ns-ref6",
      citation: "Hahn D, Hodson EM, Willis NS, Craig JC. Corticosteroid therapy for nephrotic syndrome in children. Cochrane Database Syst Rev. 2015;(3):CD001533.",
      authors: "Hahn D, Hodson EM, Willis NS, Craig JC",
      journal: "Cochrane Database of Systematic Reviews",
      year: 2015,
      volume: "3",
      pages: "CD001533",
      doi: "10.1002/14651858.CD001533.pub5",
      pmid: "25785660",
      evidence_grade: "A",
      type: "Systematic Review / Meta-analysis",
      key_recommendation: "Corticosteroid dosing and duration for first-episode nephrotic syndrome in children"
    }
  ],
  title: "Idiopathic Nephrotic Syndrome in Children — SSNS, FRNS, SDNS & SRNS",
  category: "Nephrotic Syndrome",
  source: "IPNA / ISKDC / PREDNOS2",
  year: 2023,
  evidence_level: "High Quality Evidence",
  tags: ["nephrotic", "SSNS", "FRNS", "SDNS", "SRNS", "prednisolone", "tacrolimus", "rituximab", "FSGS", "biopsy"],
  summary: "Complete NS management: first episode, relapse characterisation, steroid-sparing strategies (levamisole, MMF, tacrolimus), SRNS workup with genetic testing, and complication management.",
  sections: {
    quick_summary: {
      definition: "Triad: UPCR >2000 mg/g (or dipstick 3+) + serum albumin <2.5 g/dL + oedema. All 3 required. Idiopathic NS = no secondary cause (autoimmune, metabolic, genetic) found.",
      epidemiology: "2–7/100,000 children/year. Peak age 2–6y. Male:female 2:1 in young children; equal in adolescents. 80% are MCD on biopsy in typical first episode.",
      pathophysiology: "T-cell dysfunction → circulating permeability factor → podocyte injury → slit diaphragm disruption → massive proteinuria → hypoalbuminaemia → oedema. Genetic SRNS: podocin (NPHS2), nephrin (NPHS1), WT1, PLCE1 mutations — structural podocyte defects.",
      age_specific: "Age <1y: congenital NS — Finnish type (NPHS1), diffuse mesangial sclerosis (WT1). Age 1–10y: idiopathic MCD most likely — presume steroid-sensitive. Age >10y: higher SRNS rate, biopsy more often needed.",
      emergency_recognition: [
        "SBP: fever >38.5°C + diffuse abdominal pain + tenderness in oedematous child → S. pneumoniae peritonitis",
        "DVT/PE: limb pain + swelling + warmth, pleuritic chest pain, haemoptysis — hypercoagulable state",
        "Cerebral vein thrombosis: severe headache + papilloedema + vomiting — CT/MRI venogram urgently",
        "Hypovolaemic shock: tachycardia + cold peripheries + low albumin <1.0 g/dL — albumin + fluid",
        "Severe scrotal/labial oedema with skin breakdown — risk of cellulitis + SBP"
      ],
      immediate_management: [
        "Confirm diagnosis: UPCR >2000 + albumin <2.5 + oedema",
        "Exclude secondary causes: ANA, complement C3/C4, HBsAg, anti-HIV, ANCA (if haematuria + HTN + adult)",
        "Do NOT biopsy first episode age 1–16y without atypical features",
        "Prednisolone 60 mg/m²/day (max 60 mg) × 4 weeks, then 40 mg/m² alternate-day × 4 weeks — PREDNOS2 protocol",
        "Urine dipstick daily at home — teach parents target: 3+ = relapse",
        "Salt restrict 1–2 mEq/kg/day Na⁺; prophylactic penicillin V 250 mg BD while oedematous"
      ]
    },
    classification: [
      { type: "SSNS", definition: "Remission (urine protein negative/trace) within 4 weeks of full prednisolone", management: "IPNA standard protocol; parent-initiated relapse treatment" },
      { type: "FRNS", definition: "≥2 relapses in 6 months OR ≥4 in 12 months", management: "Levamisole or MMF as steroid-sparing first line" },
      { type: "SDNS", definition: "Relapse on alternate-day prednisolone ≤0.5 mg/kg/dose", management: "Tacrolimus (preferred) or cyclophosphamide; low-dose maintenance prednisolone" },
      { type: "SRNS", definition: "No remission after 8 weeks of full prednisolone (4 weeks full + 4 weeks alternate)", management: "Biopsy + genetic panel + tacrolimus/CNI ± MMF; rituximab if CNI fails" }
    ],
    management: {
      first_episode_protocol: [
        "Prednisolone 60 mg/m²/day (max 60 mg) × 4 weeks FULL DOSE — DO NOT reduce early even if rapid remission",
        "Then 40 mg/m² on alternate days × 4 weeks",
        "Taper by 10 mg/m² every 4 weeks over following 3–4 months (PREDNOS2: extended taper reduces 2y relapse rate by 20%)",
        "Urine dipstick daily at home: parent records in diary; 2+ for 3 consecutive days = relapse — start prednisolone immediately",
        "No biopsy for typical first episode (age 1–16y, no haematuria, normal BP, normal complement, no family history)",
        "Indications for early biopsy: age <1y, haematuria, HTN, low C3, family history NS, clinical features suggesting secondary cause"
      ],
      relapse_management: [
        "Restart prednisolone 60 mg/m²/day until 3 consecutive days of trace/nil dipstick",
        "Then 40 mg/m² alternate-day × minimum 4 weeks, then taper",
        "Identify and TREAT trigger: URTI, UTI, skin infection — treat infection first",
        "Count relapses per 6 months and per 12 months to classify FRNS/SDNS"
      ],
      frns_treatment: [
        "Levamisole 2.5 mg/kg alternate-day × 12–24 months — PREDNOS trial: 40% reduction in relapses, very cost-effective",
        "MMF 600 mg/m²/dose BD × 12–24 months — well-tolerated alternative; equivalent to levamisole in PREDNOS2 sub-analysis",
        "Both used alongside tapering prednisolone — allow steroid dose reduction to ≤0.5 mg/kg alternate-day",
        "PREDNOS trial showed levamisole superior to azathioprine; mycophenolate mofetil non-inferior"
      ],
      sdns_treatment: [
        "Tacrolimus 0.1–0.2 mg/kg/day in 2 doses (12h apart) — preferred for SDNS",
        "Target trough 4–8 ng/mL; collect 12h post last dose, BEFORE morning dose",
        "Combine with low-dose alternate-day prednisolone ≤0.5 mg/kg for first 6 months",
        "MMF 600 mg/m²/dose BD — alternative if tacrolimus not tolerated or nephrotoxicity",
        "Cyclophosphamide 2 mg/kg/day × 8 weeks — cumulative LIFETIME limit 168 mg/kg; use ONCE only; avoid if future fertility concern"
      ],
      srns_workup_treatment: [
        "Renal biopsy: FSGS (most common), MCD, MN, other — histology guides prognosis and treatment",
        "Genetic panel MANDATORY in SRNS (especially <5y, family history, consanguinity): NPHS1, NPHS2, WT1, PLCE1, TRPC6, INF2, CD2AP",
        "Genetic SRNS: often CNI-resistant — RAS blockade + supportive; transplant planning",
        "Tacrolimus + low-dose prednisolone: first-line SRNS — trough 5–10 ng/mL × 6 months; partial remission target UPCR <200",
        "ACE-I + ARB combination: antiproteinuric (dual RAS block allowed in NS for proteinuria control — different from CKD guidance)",
        "Rituximab 375 mg/m²/dose IV × 1–4 doses if CNI failure — check CD19 count + immunoglobulins pre-treatment",
        "Belimumab, abatacept: emerging therapies for FSGS-associated SRNS — research protocols"
      ],
      oedema_management: [
        "Salt restrict 1–2 mEq/kg/day Na⁺ during active oedema",
        "Furosemide 1–2 mg/kg PO/IV if albumin >1.5 g/dL",
        "Albumin <1.5 g/dL: IV albumin 1 g/kg over 4h + furosemide 1 mg/kg IV at midpoint and end",
        "IV albumin indications ONLY: shock, respiratory distress, severe scrotal/labial breakdown, severe ascites — NOT routine",
        "Spironolactone 2–3 mg/kg/day for chronic ascites/oedema"
      ],
      complications: [
        "SBP prophylaxis: penicillin V 250 mg BD while oedematous; IV cefotaxime 50 mg/kg/dose TDS if febrile + abdominal pain",
        "Thrombosis: prophylactic anticoagulation if albumin <2.0 g/dL + prolonged bedrest or dehydration",
        "Hypercholesterolaemia: reactive in active NS — resolves with remission; statins NOT needed",
        "Steroid toxicity monitoring: BP weekly, glucose weekly on induction, annual cataracts, bone density if >12 months cumulative steroids",
        "Varicella exposure on immunosuppression: VZIG within 72–96h; IV acyclovir if infection develops"
      ]
    },
    drugs: [
      {
        name: "Prednisolone",
        dose: "60 mg/m²/day (max 60 mg) × 4w → 40 mg/m² alt-day × 4w → taper",
        max: "60 mg/day on full-dose phase",
        purpose: "First-line NS induction and relapse treatment",
        monitoring: "BP weekly on induction, glucose, weight, Cushingoid features, cataracts annually, bone density if >12 months",
        notes: "With food (GI protection). Morning dosing mimics cortisol rhythm. Never stop abruptly — taper mandatory. Sunscreen for photosensitivity. Teach parents 'sick day rules'."
      },
      {
        name: "Tacrolimus",
        dose: "0.1–0.2 mg/kg/day in 2 doses (12h apart), trough-guided",
        max: "SDNS trough 4–8 ng/mL; SRNS trough 5–10 ng/mL",
        purpose: "SDNS first-line; SRNS combined with prednisolone",
        monitoring: "Trough level 12h post-dose BEFORE morning dose; Cr, K⁺, glucose, BP, lipids q2–4 weeks initially",
        notes: "Empty stomach or 1h before meals. Avoid grapefruit (CYP3A4 inhibition). Acceptable Cr rise <30%. Nephrotoxic. Trough day = take blood BEFORE morning dose."
      },
      {
        name: "MMF (mycophenolate mofetil)",
        dose: "600 mg/m²/dose BD (max 1 g BD = 2 g/day)",
        max: "2 g/day",
        purpose: "FRNS/SDNS steroid-sparing; alternative to tacrolimus",
        monitoring: "CBC monthly × 6 months (cytopenia), LFT; GI symptoms (diarrhoea, nausea)",
        notes: "EC-MPS (Myfortic) better GI tolerance. MPA trough levels not routinely needed in NS. Teratogenic — contraception counselling."
      },
      {
        name: "Levamisole",
        dose: "2.5 mg/kg alternate days (max 150 mg/dose)",
        max: "150 mg/dose",
        purpose: "FRNS — immunomodulator (PREDNOS trial evidence)",
        monitoring: "CBC monthly — STOP if ANC <1000/mm³ (rare agranulocytosis)",
        notes: "Inexpensive, widely used in South Asia. Not always available in Western countries. Mechanism: enhances regulatory T-cell function."
      },
      {
        name: "Rituximab",
        dose: "375 mg/m²/dose IV × 1–4 doses (q1–2 weeks)",
        max: "1000 mg/dose",
        purpose: "Refractory SDNS/SRNS — B-cell depletion",
        monitoring: "CD19+ B-cell count (target <5/mm³); IgG, IgM; infection monitoring; pre-infusion: paracetamol + chlorpheniramine + methylprednisolone",
        notes: "Screen hepatitis B before use (reactivation risk). PCP prophylaxis during and 6 months after. Omit vaccinations within 3 months of rituximab."
      },
      {
        name: "Albumin 20% IV",
        dose: "1 g/kg over 4h (furosemide 1 mg/kg IV at midpoint and end)",
        max: "1 g/kg/infusion",
        purpose: "Severe oedema with albumin <1.5 or haemodynamic compromise",
        monitoring: "BP, respiratory rate, SpO₂, UO during infusion; weight next day",
        notes: "NOT for routine oedema — transient effect as protein lost in urine within hours. Use minimum effective dose. Do NOT give if lung congested — risk flash pulmonary oedema."
      }
    ],
    monitoring: {
      frequency: "Daily dipstick at home (parent diary). Clinic: monthly active disease; 3-monthly remission; weekly on induction.",
      parameters: [
        "Urine dipstick morning first-void — parent-recorded diary",
        "Weight daily at home; at every clinic visit",
        "BP at every clinic visit",
        "Serum albumin, total protein, cholesterol — monthly during active disease",
        "UPCR at every visit",
        "Electrolytes if on diuretics or prolonged oedema",
        "Drug-specific monitoring (see drug cards)",
        "Growth: height, weight, BMI at every visit",
        "Steroid toxicity: annual eye exam (cataracts), DEXA if cumulative prednisolone >12 months"
      ],
      follow_up: "Post-first episode: monthly × 6 months, then 3-monthly in remission. On immunosuppression: monthly clinic + phone review. Long-term SRNS/CKD: 3-monthly nephrology."
    },
    nutrition: [
      "Do NOT restrict protein in NS — high proteinuria is NOT reduced by protein restriction; protein losses must be replaced",
      "Salt restriction 1–2 mEq/kg/day Na⁺ during relapse/active oedema — key to oedema management",
      "Hypercholesterolaemia in active NS is reactive — resolves with remission; no statin needed during NS episode",
      "On prednisolone: avoid caloric excess (Cushingoid weight gain); maintain adequate protein for growth",
      "On tacrolimus: consistent meal timing; avoid grapefruit; 1h gap from meals for consistent absorption",
      "Calcium 500–1000 mg/day + Vitamin D 400–800 IU/day during prolonged steroid therapy"
    ],
    vaccination: [
      "Pneumococcal (PCV13 + PPSV23) at diagnosis — BEFORE steroids if possible; revaccinate PPSV23 every 5y",
      "Annual influenza (inactivated) — even on prednisolone (safe); give regardless of relapse status",
      "Varicella: give if naive AT LEAST 1 month before starting steroids; defer if on immunosuppression",
      "Varicella exposure on immunosuppression: VZIG within 72–96h; IV acyclovir if develops chickenpox",
      "MMR: live vaccine — defer while on prednisolone >20 mg/day or significant immunosuppression",
      "Hepatitis B: check status at diagnosis; vaccinate if non-immune; double-dose may be needed",
      "Household contacts: annual influenza vaccination"
    ],
    red_flags: [
      "Fever + abdominal pain in oedematous child → SBP — IV cefotaxime + IV albumin SAME DAY",
      "Limb pain/swelling + warmth → DVT — USS Doppler; anticoagulate if confirmed",
      "Dipstick 3+ for >3 weeks on full prednisolone → SRNS — biopsy + genetic testing",
      "ANC <1000 on levamisole → STOP immediately, CBC urgently",
      "Cr rising on tacrolimus → trough level check; reduce dose; may indicate nephrotoxicity",
      "Severe hypoalbuminaemia (<1.0) + tachycardia + cold peripheries → hypovolaemic shock — IV albumin + small fluid bolus"
    ],
    pearls: [
      "Never biopsy a typical first episode (age 1–16y, no haematuria, normal C3, normal BP, no family history) — treat empirically first",
      "Periorbital oedema is FIRST sign of relapse — parent education on morning checks is critical",
      "Varicella in a child on >20 mg prednisolone = medical emergency — IV acyclovir 10 mg/kg q8h + reduce prednisolone by 50% immediately",
      "Tacrolimus trough: collect BEFORE morning dose (12h post last dose) — post-dose sample gives falsely high level",
      "Cyclophosphamide LIFETIME limit 168 mg/kg — exceeding causes gonadal toxicity and malignancy; ONE course only",
      "Hypercholesterolaemia in active NS is reactive, not atherogenic — do NOT start statins during nephrotic episode",
      "MMF vs cyclophosphamide: equivalent relapse prevention; MMF better long-term safety profile; prefer MMF"
    ]
  }
},

// ═══════════════════════════════════════════════════════════════════════════
// 4. HYPERTENSION
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-hypertension",
  references: [
    {
      id: "htn-ref1",
      citation: "Flynn JT, Kaelber DC, Baker-Smith CM, et al. Clinical Practice Guideline for Screening and Management of High Blood Pressure in Children and Adolescents. Pediatrics. 2017;140(3):e20171904.",
      authors: "Flynn JT, Kaelber DC, Baker-Smith CM et al (AAP Subcommittee on Screening and Management of High Blood Pressure in Children)",
      journal: "Pediatrics",
      year: 2017,
      volume: "140(3)",
      pages: "e20171904",
      doi: "10.1542/peds.2017-1904",
      pmid: "28827377",
      evidence_grade: "A",
      guideline_body: "AAP",
      type: "Clinical Practice Guideline",
      key_recommendation: "AAP 2017 BP classification tables, ABPM criteria, management algorithm for children and adolescents"
    },
    {
      id: "htn-ref2",
      citation: "Wühl E, Trivelli A, Picca S, et al. Strict blood-pressure control and progression of renal failure in children. N Engl J Med. 2009;361(17):1639–1650.",
      authors: "Wühl E, Trivelli A, Picca S et al (ESCAPE Trial Group)",
      journal: "New England Journal of Medicine",
      year: 2009,
      volume: "361(17)",
      pages: "1639–1650",
      doi: "10.1056/NEJMoa0902066",
      pmid: "19846849",
      evidence_grade: "A",
      type: "Randomized Controlled Trial",
      key_recommendation: "Target BP <50th percentile halves CKD progression rate in children with proteinuric CKD"
    },
    {
      id: "htn-ref3",
      citation: "Lurbe E, Agabiti-Rosei E, Cruickshank JK, et al. 2016 European Society of Hypertension guidelines for the management of high blood pressure in children and adolescents. J Hypertens. 2016;34(10):1887–1920.",
      authors: "Lurbe E, Agabiti-Rosei E, Cruickshank JK et al (ESH Hypertension Guideline Committee)",
      journal: "Journal of Hypertension",
      year: 2016,
      volume: "34(10)",
      pages: "1887–1920",
      doi: "10.1097/HJH.0000000000001039",
      pmid: "27487535",
      evidence_grade: "A",
      guideline_body: "ESH",
      type: "Clinical Practice Guideline",
      key_recommendation: "ESH 2016 paediatric hypertension guidelines including ABPM interpretation and pharmacotherapy"
    },
    {
      id: "htn-ref4",
      citation: "Litwin M, Niemirska A, Śladowska J, et al. Left ventricular hypertrophy and arterial wall stiffening in children with essential hypertension. Pediatr Nephrol. 2006;21(6):811–819.",
      authors: "Litwin M, Niemirska A, Śladowska J et al",
      journal: "Pediatric Nephrology",
      year: 2006,
      volume: "21(6)",
      pages: "811–819",
      doi: "10.1007/s00467-006-0068-8",
      pmid: "16518612",
      evidence_grade: "B",
      type: "Observational Study",
      key_recommendation: "Target organ damage (LVH) as indicator of treatment intensification in paediatric HTN"
    }
  ],
  title: "Hypertension in Children & Adolescents",
  category: "Hypertension",
  source: "AAP 2017 / ESCAPE Trial / ESH",
  year: 2023,
  evidence_level: "High Quality Evidence",
  tags: ["hypertension", "BP", "AAP 2017", "ESCAPE", "LVH", "ABPM", "coarctation", "RAS"],
  summary: "Diagnosis using AAP 2017 tables, secondary cause workup, pharmacological management, ABPM, and target organ damage assessment in children.",
  sections: {
    quick_summary: {
      definition: "BP ≥95th percentile for age/height/sex on ≥3 occasions (age 1–12y); BP ≥130/80 in adolescents ≥13y (AAP 2017). Hypertensive emergency: severe HTN + end-organ damage.",
      epidemiology: "3–5% prevalence in children. Secondary HTN predominates in young children (<10y) — renal parenchymal disease (80% of secondary causes). Essential HTN increases in obese adolescents.",
      pathophysiology: "Renal: reduced GFR → Na⁺ retention → volume overload. RAS: renin-angiotensin hyperactivation. Essential: obesity → insulin resistance → sympathetic activation. Coarctation: mechanical obstruction → Windkessel effect loss.",
      age_specific: "Neonates: renal artery thrombosis post-UAC, congenital RAS. Infants: CAKUT, coarctation. School-age: parenchymal renal disease. Adolescents: essential HTN from obesity, white-coat HTN common.",
      emergency_recognition: [
        "Hypertensive encephalopathy: BP >99th%ile + severe headache + altered sensorium + vomiting",
        "Hypertensive crisis with seizures — immediate IV BP control",
        "Papilloedema + visual changes + severe HTN — malignant hypertension",
        "Chest pain + severe HTN — rare aortic dissection"
      ],
      immediate_management: [
        "Hypertensive EMERGENCY: reduce MAP by 25% over 6–8h ONLY — NOT rapid normalisation (cerebral autoregulation risk)",
        "IV labetolol 0.25–1 mg/kg bolus q15 min OR IV nicardipine 1–3 mcg/kg/min infusion",
        "DO NOT use sublingual nifedipine — precipitous drop → cerebral ischaemia",
        "For non-emergency: start oral antihypertensive + investigate secondary cause"
      ]
    },
    classification: [
      { stage: "Normal", bp: "<90th percentile", action: "Lifestyle, recheck annually" },
      { stage: "Elevated", bp: "90th–<95th percentile", action: "Lifestyle modification × 6 months, then reassess" },
      { stage: "Stage 1 HTN", bp: "≥95th–<95th percentile + 12 mmHg (or 130/80–139/89 mmHg)", action: "3–6m lifestyle trial; drug if secondary, DM, CKD, or LVH" },
      { stage: "Stage 2 HTN", bp: "≥95th percentile + 12 mmHg (or ≥140/90 mmHg)", action: "Same-day evaluation, start medication, urgent secondary cause workup" }
    ],
    management: {
      workup: [
        "All 4 limbs BP at first visit — coarctation: arm BP high + low/absent femoral pulses + radio-femoral delay",
        "Renal USS with Doppler: first-line imaging — excludes CAKUT, parenchymal disease, RAS",
        "Urine: UPCR, microscopy, culture — proteinuria + haematuria = GN",
        "Blood: Cr, BUN, K⁺, glucose, CBC, lipids",
        "ECHO at diagnosis — LVH = target organ damage; changes treatment target",
        "ABPM: gold standard for white-coat vs sustained vs masked HTN; nocturnal dipping",
        "If RAS suspected: MRA kidneys (avoid CT angiography radiation in children); DTPA scan"
      ],
      lifestyle: [
        "DASH diet: Na⁺ <2.4 g/day, high potassium (fruits, vegetables), low-fat dairy, whole grains",
        "Weight reduction if BMI >95th percentile — 5 kg weight loss can normalise BP in obese adolescent HTN",
        "Aerobic exercise ≥60 min/day (avoid heavy resistance training in Stage 2 HTN until controlled)",
        "No secondary smoking exposure — independent hypertensive risk factor",
        "Screen for obstructive sleep apnoea in obese adolescents — significant contributor"
      ],
      drug_strategy: [
        "CKD + proteinuria → ACE-I (enalapril) or ARB (losartan) FIRST — renoprotective + antihypertensive",
        "Essential/obesity HTN → amlodipine (CCB) first-line or ACE-I",
        "Hypertensive emergency → IV labetolol or IV nicardipine",
        "Coarctation → surgical/catheter intervention; perioperative ACE-I",
        "Post-transplant HTN → amlodipine (avoid ACE-I in early months)",
        "In CKD: target BP <50th percentile (ESCAPE trial — significantly slows CKD progression vs standard target)"
      ]
    },
    drugs: [
      {
        name: "Amlodipine",
        dose: "0.1–0.2 mg/kg/day OD (start 0.05–0.1 mg/kg/day)",
        max: "5 mg/day age <6y; 10 mg/day ≥6y",
        purpose: "First-line oral antihypertensive — dihydropyridine CCB",
        monitoring: "BP each visit; ankle oedema; gingival hyperplasia (rare)",
        renal_adjust: "No dose adjustment in CKD",
        notes: "Once-daily OD — improves adherence. Safe in asthma. Ankle oedema common at higher doses — not fluid overload."
      },
      {
        name: "Enalapril",
        dose: "0.1–0.5 mg/kg/day OD or BD",
        max: "40 mg/day",
        purpose: "Renal HTN + antiproteinuric (ACE inhibitor)",
        monitoring: "K⁺, Cr 1–2 weeks after start; BP, cough",
        renal_adjust: "Reduce 50% if GFR <30 mL/min; hold if K⁺ >6 or Cr rises >30%",
        notes: "Dry cough 10–20% — switch to ARB. Teratogenic — counsel adolescent girls. Not with dual RAS block."
      },
      {
        name: "Labetolol IV",
        dose: "0.25–1 mg/kg/dose bolus q15 min; OR infusion 0.25–3 mg/kg/h",
        max: "40 mg/dose bolus; 3 mg/kg/h infusion",
        purpose: "Hypertensive emergency — alpha+beta blocker",
        monitoring: "HR (bradycardia), BP continuously, wheeze",
        notes: "AVOID in asthma, AV block, decompensated heart failure. Onset 5–10 min IV. Titrate infusion to BP response."
      },
      {
        name: "Nicardipine IV",
        dose: "1–3 mcg/kg/min IV infusion (titrate)",
        max: "Titrate to BP response",
        purpose: "Hypertensive emergency — rapidly titratable IV CCB (preferred agent)",
        monitoring: "Continuous arterial BP + HR (arterial line preferred for emergencies)",
        notes: "Preferred over labetolol in asthma, bradycardia. Predictable smooth BP reduction. Onset 5–10 min."
      },
      {
        name: "Hydralazine IV",
        dose: "0.1–0.5 mg/kg/dose IV q4–6h",
        max: "10 mg/dose initially",
        purpose: "Hypertensive emergency if labetolol/nicardipine unavailable",
        monitoring: "BP 15-min intervals after each dose, HR (reflex tachycardia)",
        notes: "Less predictable than nicardipine. Causes reflex tachycardia — combine with beta-blocker if tachycardia problematic."
      }
    ],
    monitoring: {
      frequency: "Monthly until BP controlled on medication; then 3-monthly if stable; ABPM annually",
      parameters: [
        "BP all 4 limbs at first visit; right arm standard subsequently",
        "ECHO: LVH at diagnosis and annually (LVH = indicates intensified target)",
        "UPCR, Cr annually or 3-monthly on ACE-I/ARB",
        "ABPM: annually or when white-coat vs sustained unclear",
        "Lipids, glucose (metabolic syndrome screen if obese)",
        "Retinal fundoscopy if severe HTN",
        "Renal USS annually if anatomical abnormality"
      ],
      follow_up: "Ophthalmology for hypertensive retinopathy. Neurodevelopmental follow-up in young children with severe HTN. Annual ABPM to assess nocturnal dipping pattern (non-dipping = higher CKD progression risk)."
    },
    nutrition: [
      "DASH diet: Na⁺ <2.4 g/day; high K⁺ (fruits, vegetables), Ca²⁺ (low-fat dairy), fibre (whole grains)",
      "Avoid processed foods, pickles, papads, chips — highest Na⁺ in Indian diet",
      "Weight management: caloric restriction + daily aerobic exercise in overweight/obese",
      "Avoid licorice (glycyrrhizinic acid → pseudoaldosteronism), energy drinks (caffeine), anabolic supplements",
      "Omega-3 fish oil: mild antihypertensive in adolescents — not first-line but reasonable adjunct"
    ],
    vaccination: [
      "Standard immunisation schedule maintained — no specific contraindications with antihypertensives",
      "Annual influenza vaccine",
      "If underlying CKD: full CKD vaccination protocol (see CKD guideline)"
    ],
    red_flags: [
      "BP >99th percentile at ANY age → urgent secondary cause investigation",
      "No femoral pulses or radio-femoral delay → coarctation — ECHO + MRA urgently",
      "Abdominal bruit + severe HTN in young child → renal artery stenosis (NF1, FMD, TA)",
      "LVH on ECHO → intensify treatment regardless of BP reading",
      "Severe HTN + haematuria + proteinuria + low C3 → PSGN or lupus nephritis",
      "Headache + papilloedema + severe HTN → hypertensive emergency"
    ],
    pearls: [
      "25% of paediatric HTN is white-coat — always confirm with ABPM before starting medication",
      "Feel femoral pulses in EVERY hypertensive child — coarctation is surgically correctable cause",
      "ESCAPE trial: target BP <50th percentile in CKD (not just <95th) — halved rate of GFR decline vs standard target",
      "LVH on ECHO = target organ damage → must intensify treatment regardless of BP classification",
      "ACE-I/ARB reduce proteinuria 30–50% independent of BP effect — use even in normotensive CKD with UPCR >200",
      "Non-dipping pattern on ABPM (nocturnal BP decline <10%) associated with CKD progression and LVH"
    ]
  }
},

// ═══════════════════════════════════════════════════════════════════════════
// 5. HUS
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-hus",
  references: [
    {
      id: "hus-ref1",
      citation: "Loirat C, Fakhouri F, Ariceta G, et al. An international consensus approach to the management of atypical hemolytic uremic syndrome in children. Pediatr Nephrol. 2016;31(1):15–39.",
      authors: "Loirat C, Fakhouri F, Ariceta G et al (HUS International)",
      journal: "Pediatric Nephrology",
      year: 2016,
      volume: "31(1)",
      pages: "15–39",
      doi: "10.1007/s00467-015-3076-8",
      pmid: "25859752",
      evidence_grade: "A",
      guideline_body: "HUS International / ERKNet",
      type: "International Consensus",
      key_recommendation: "aHUS management: eculizumab dosing, complement panel, genetic testing, plasma exchange bridging"
    },
    {
      id: "hus-ref2",
      citation: "Tarr PI, Gordon CA, Chandler WL. Shiga-toxin-producing Escherichia coli and haemolytic uraemic syndrome. Lancet. 2005;365(9464):1073–1086.",
      authors: "Tarr PI, Gordon CA, Chandler WL",
      journal: "The Lancet",
      year: 2005,
      volume: "365(9464)",
      pages: "1073–1086",
      doi: "10.1016/S0140-6736(05)71144-2",
      pmid: "15781103",
      evidence_grade: "A",
      type: "Review",
      key_recommendation: "STEC-HUS pathophysiology, management, antibiotic avoidance evidence"
    },
    {
      id: "hus-ref3",
      citation: "Fakhouri F, Zuber J, Frémeaux-Bacchi V, Loirat C. Haemolytic uraemic syndrome. Lancet. 2017;390(10095):681–696.",
      authors: "Fakhouri F, Zuber J, Frémeaux-Bacchi V, Loirat C",
      journal: "The Lancet",
      year: 2017,
      volume: "390(10095)",
      pages: "681–696",
      doi: "10.1016/S0140-6736(17)30062-4",
      pmid: "28242109",
      evidence_grade: "A",
      type: "Seminar",
      key_recommendation: "Comprehensive HUS/TMA classification, differential diagnosis, management update"
    },
    {
      id: "hus-ref4",
      citation: "Campistol JM, Arias M, Ariceta G, et al. An update for atypical haemolytic uraemic syndrome: diagnosis and treatment. A consensus document. Nefrologia. 2015;35(5):421–447.",
      authors: "Campistol JM, Arias M, Ariceta G et al",
      journal: "Nefrologia",
      year: 2015,
      volume: "35(5)",
      pages: "421–447",
      doi: "10.1016/j.nefro.2015.07.005",
      pmid: "26282166",
      evidence_grade: "B",
      type: "Consensus Document",
      key_recommendation: "aHUS diagnostic workup, genetic panel, eculizumab duration, transplant planning"
    }
  ],
  title: "Hemolytic Uremic Syndrome — STEC-HUS, aHUS & TTP",
  category: "AKI",
  source: "IPNA / ERKNet",
  year: 2022,
  evidence_level: "Moderate Quality Evidence",
  tags: ["HUS", "TMA", "STEC", "E.coli", "O157", "eculizumab", "complement", "aHUS", "ADAMTS13", "TTP"],
  summary: "TMA triad management in children — distinguishing STEC-HUS from aHUS and TTP. Critical differentiation drives treatment: supportive vs eculizumab vs plasma exchange.",
  sections: {
    quick_summary: {
      definition: "Triad: Microangiopathic haemolytic anaemia (MAHA) + Thrombocytopenia + AKI. TMA (thrombotic microangiopathy) is the underlying pathology in endothelial-microvasculature.",
      epidemiology: "STEC-HUS: 2–3/100,000 children/year; peaks summer (O157:H7 via contaminated food/water). aHUS: 2 per million; no seasonal variation; familial in 70%. TTP: rare in children; ADAMTS13 mutations.",
      pathophysiology: "STEC-HUS: Shiga toxin (Stx2 > Stx1) → GB3 receptor on glomerular endothelium + podocytes → endothelial injury → TMA. aHUS: complement C3 convertase dysregulation (CFH, CFI, CD46 mutations) → uncontrolled C5 activation → MAC formation → TMA. TTP: ADAMTS13 deficiency (congenital or acquired antibody) → large vWF multimers → platelet thrombi.",
      age_specific: "Age <5y: STEC-HUS most common; O157:H7 from undercooked beef, contaminated water. Age <2y: aHUS more common cause of non-diarrhoeal TMA. All ages: TTP if ADAMTS13 <10%.",
      emergency_recognition: [
        "Anuria + rapidly rising Cr → immediate RRT assessment",
        "Neurological signs: seizures, altered consciousness → CNS-TMA (worst prognosis); consider eculizumab",
        "Hb <7 g/dL actively falling → urgent transfusion decision",
        "Platelet <20,000 + active bleeding → critical"
      ],
      immediate_management: [
        "Blood film for schistocytes IMMEDIATELY if TMA suspected — do NOT wait for formal haematology report",
        "ADAMTS13 activity BEFORE plasma exchange or FFP — critical for TTP diagnosis",
        "Stool STEC PCR + Shiga toxin assay (O157:H7 and non-O157)",
        "Complement panel: C3, C4, CH50, factor H, factor I, CD46",
        "IV fluids 10–20 mL/kg if pre-renal component; catheter for UO monitoring",
        "Do NOT give antibiotics in STEC-HUS (increases Shiga toxin release — quinolones especially harmful)",
        "Do NOT give platelet transfusions unless life-threatening bleeding (fuels TMA)"
      ]
    },
    classification: [
      { type: "STEC-HUS (Typical)", definition: "Shiga toxin-producing E. coli; bloody diarrhoea prodrome; summer peaks", management: "Supportive + dialysis if needed. NO antibiotics. NO platelets. NO antiperistaltics." },
      { type: "aHUS (Atypical)", definition: "Complement dysregulation; no diarrhoea; recurrent; family history 70%", management: "Eculizumab urgently. Plasma exchange as bridge while awaiting." },
      { type: "Sp-HUS", definition: "Streptococcus pneumoniae after pneumonia/meningitis; Coombs positive", management: "Antibiotics for pneumococcal infection. Washed pRBC if transfusing (NOT FFP — worsens)." },
      { type: "TTP", definition: "ADAMTS13 activity <10%; CNS involvement; minimal renal disease", management: "Plasma exchange SPECIFIC treatment; NOT eculizumab. Caplacizumab in adults — emerging in children." }
    ],
    management: {
      stec_hus: [
        "Supportive: IV fluids for pre-renal; strict I/O thereafter; daily weight",
        "Early HD/CRRT: oliguria + fluid overload + hyperkalaemia + uraemia",
        "pRBC transfusion: Hb <7 g/dL; give slowly over 4h; dialyse if fluid-overloaded first",
        "BP control: amlodipine or IV labetolol for hypertension",
        "Recovery: 70–80% recover renal function in 2–4 weeks; 3–5% ESRD; 3–5% CNS sequelae",
        "AVOID: antibiotics (especially quinolones, TMP-SMX), antiperistaltics, NSAIDs, platelet transfusions"
      ],
      ahus_treatment: [
        "Eculizumab (anti-C5): drug of choice — start within 24h of TMA diagnosis if aHUS suspected",
        "Paediatric dosing (weight-based): <10 kg: 300 mg weekly ×1, then 300 mg q3w; 10–20 kg: 600 mg weekly ×1, then 300 mg q2w; 20–30 kg: 600 mg weekly ×2, then 600 mg q2w; 30–40 kg: 600 mg weekly ×3, then 900 mg q2w; ≥40 kg: adult schedule (900 mg weekly ×4, then 1200 mg q2w)",
        "MUST vaccinate against N. meningitidis (ACWY + B), S. pneumoniae, H. influenzae B BEFORE eculizumab — cannot wait if emergency",
        "Emergency: give prophylactic ciprofloxacin 500 mg BD (or penicillin) until vaccinated",
        "Plasma exchange as bridge: 1.5× plasma volume daily with FFP until eculizumab available",
        "Anti-CFH antibodies: plasma exchange + MMF + prednisolone (different mechanism — CFH replacement + immunosuppression)",
        "Genetic panel: CFH, CFI, CD46, C3, CFB, THBD, CFHR1–5 — guides duration of eculizumab"
      ],
      ttp_treatment: [
        "Plasma exchange is SPECIFIC treatment for TTP — start immediately (1.5× plasma volume with FFP)",
        "Corticosteroids: prednisolone 1 mg/kg/day adjunct",
        "Rituximab for acquired TTP (anti-ADAMTS13 antibody) — 375 mg/m² weekly × 4",
        "Caplacizumab (anti-vWF nanobody) — approved adults; emerging paediatric data",
        "Eculizumab NOT effective for TTP"
      ]
    },
    drugs: [
      {
        name: "Eculizumab (Soliris)",
        dose: "Weight-based paediatric protocol (see above in management)",
        max: "C5 blockade guided — trough monitoring available",
        purpose: "aHUS — anti-C5 complement inhibition",
        monitoring: "CBC, Cr, LDH, haptoglobin, platelet count weekly initially; C3, C4, CH50; meningococcal prophylaxis status",
        notes: "Most expensive drug in the world. Access via rare disease programs. Duration: genetic SRNS → indefinite; anti-CFH antibody → may discontinue after 12 months. Monitor for meningococcal infection throughout."
      },
      {
        name: "pRBC transfusion",
        dose: "10–15 mL/kg over 4h (or during dialysis if fluid-overloaded)",
        max: "Per haemoglobin response",
        purpose: "Symptomatic anaemia (Hb <7 g/dL or haemodynamic compromise)",
        monitoring: "Hb post-transfusion, fluid balance, BP, temperature during transfusion",
        notes: "Sp-HUS: WASHED red cells mandatory (TF-antigen exposed — unwashed cells cause agglutination). STEC-HUS: standard packed cells. Give during dialysis if fluid-overloaded to avoid volume overload."
      }
    ],
    monitoring: {
      frequency: "Acute phase: daily CBC, Cr, LDH, haptoglobin, platelets, BP, UO. Stable: weekly. Post-discharge: 1m, 6m, 12m, annually.",
      parameters: [
        "CBC with manual differential (schistocyte count — >1% diagnostic of TMA)",
        "LDH, haptoglobin (markers of haemolysis)",
        "Serum Cr, BUN, electrolytes",
        "Platelet count trend",
        "BP (HTN in 50% of HUS)",
        "Urine output hourly via catheter (acute phase)",
        "Stool STEC PCR if not yet sent",
        "ADAMTS13 activity (TTP differentiation)"
      ],
      follow_up: "Post-STEC-HUS: BP, Cr, UPCR, UA at 1m, 6m, 12m, then annually × 10y. 20–30% develop CKD or HTN at 5–10y follow-up. aHUS: lifelong nephrology — recurrence risk in transplant."
    },
    nutrition: [
      "Acute AKI phase: standard AKI nutrition protocol (see AKI guideline)",
      "CRRT: 2.5–3 g/kg/day protein (high effluent amino acid losses)",
      "Restrict K⁺ and PO₄ during oliguria",
      "Post-recovery: no specific restriction unless residual CKD"
    ],
    vaccination: [
      "aHUS on eculizumab: N. meningitidis (ACWY + B — BOTH required), S. pneumoniae (PCV13 + PPSV23), H. influenzae type b — BEFORE first dose",
      "Emergency eculizumab: prophylactic ciprofloxacin until vaccines completed",
      "Annual meningococcal and influenza boosters on eculizumab",
      "Standard schedule otherwise"
    ],
    red_flags: [
      "Neurological involvement (seizures, stroke) in HUS → CNS-TMA — worst prognosis; consider early eculizumab even if STEC-HUS",
      "ADAMTS13 <10% → TTP NOT HUS — plasma exchange specific treatment urgently; eculizumab NOT effective",
      "Coombs positive + HUS after pneumococcal illness → Sp-HUS — washed red cells ONLY; FFP worsens",
      "Recurrent HUS without diarrhoea prodrome → aHUS — genetic testing + eculizumab",
      "aHUS recurrence post-transplant → prophylactic eculizumab pre-transplant not planned = preventable disaster"
    ],
    pearls: [
      "ADAMTS13 <10% = TTP — plasma exchange is the treatment; eculizumab fails in TTP",
      "NEVER give antibiotics in STEC-HUS — quinolones and TMP-SMX massively increase Shiga toxin release (bacterial lysis)",
      "Coombs positive in HUS = Sp-HUS (Thomsen-Friedenreich antigen) — FFP contains anti-TF antibodies and worsens",
      "Normal platelets do NOT exclude TMA — schistocytes on blood film are the key diagnostic finding",
      "aHUS: even AFTER recovery, indefinite eculizumab often needed (genetic C5 inhibitor defect persists)",
      "Transplant in aHUS: discuss eculizumab prophylaxis strategy — de novo aHUS in transplant kidney is preventable"
    ]
  }
}
];