import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Seeded RNG — ensures each day gets unique, well-distributed picks ─────────
// Uses a simple mulberry32 PRNG seeded from the date ordinal (days since epoch)
function makeRng(dateStr) {
  // Convert YYYY-MM-DD → days since 2000-01-01 for a compact, day-sensitive seed
  const d = new Date(dateStr + "T00:00:00Z");
  const base = new Date("2000-01-01T00:00:00Z");
  const dayOrdinal = Math.floor((d - base) / 86400000);
  let s = dayOrdinal + 1;
  return function() {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Pick n unique indices from a pool, using the seeded RNG
function pickUnique(pool, n, rng) {
  const indices = Array.from({ length: pool.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, n).map(i => pool[i]);
}

function pick(pool, rng) {
  return pool[Math.floor(rng() * pool.length)];
}

// ── Content Pools ──────────────────────────────────────────────────────────────
const PEARLS = [
  { topic: "Nephrotic Syndrome", pearl: "A urine protein:creatinine ratio >2 mg/mg (>200 mg/mmol) is in the nephrotic range. Confirm with an early morning specimen for accuracy.", url: "/ClinicalSupport" },
  { topic: "Hyponatremia", pearl: "In SIADH, urine Na >20 mEq/L with urine osmolality >100 mOsm/kg distinguishes it from hypovolemic hyponatremia. Fluid restriction is the key management.", url: "/ClinicalSupport" },
  { topic: "AKI", pearl: "KDIGO AKI: ≥0.3 mg/dL rise in creatinine within 48 h OR ≥1.5× baseline within 7 days OR urine output <0.5 mL/kg/h for 6 h — any one criterion suffices.", url: "/ClinicalSupport" },
  { topic: "Hypertension", pearl: "BP ≥95th percentile on 3 separate occasions = Stage 1 HTN in children. Always use an age-appropriate cuff — a cuff too small gives falsely elevated readings.", url: "/ClinicalSupport" },
  { topic: "Renal Tubular Acidosis", pearl: "Normal anion gap metabolic acidosis + hypokalemia + urine pH >5.5 = distal RTA until proven otherwise. Urine anion gap is positive (>0) in dRTA.", url: "/TubularDisordersHub" },
  { topic: "CKD Progression", pearl: "eGFR decline >5 mL/min/1.73m²/year or >25% from baseline warrants urgent workup for a superimposed reversible cause — obstruction, drugs, dehydration.", url: "/ClinicalSupport" },
  { topic: "Hyperkalemia", pearl: "ECG sequence in hyperkalemia: peaked T-waves → PR prolongation → wide QRS → sine wave → VF. Calcium gluconate stabilises the membrane — always give first, before any other measure.", url: "/EmergencyHub" },
  { topic: "Gitelman Syndrome", pearl: "Persistent hypokalemia + metabolic alkalosis + LOW urinary calcium = Gitelman syndrome. Check serum magnesium — hypomagnesemia is almost universal and under-treated.", url: "/TubularDisordersHub" },
  { topic: "Steroid Resistance", pearl: "Children with SRNS who are <1 year or have atypical features (microhematuria, low C3, family history of CKD) should have genetic testing before escalating immunosuppression.", url: "/ClinicalSupport" },
  { topic: "Corrected Sodium", pearl: "Corrected Na = Measured Na + 1.6 × [(glucose mg/dL – 100)/100]. Always calculate corrected sodium in hyperglycemia before labelling hyponatremia.", url: "/CalculatorsHub" },
  { topic: "Proteinuria Screening", pearl: "First morning urine PCR is most reliable. PCR >0.2 mg/mg is abnormal in children >2 years; >0.5 mg/mg is significant; >2 mg/mg is nephrotic-range.", url: "/ClinicalSupport" },
  { topic: "Tacrolimus Monitoring", pearl: "Tacrolimus trough: 8–12 ng/mL in first 3 months post-transplant, then 5–8 ng/mL stable. Higher targets increase nephrotoxicity; lower targets risk acute rejection.", url: "/DrugsDosing" },
  { topic: "Hypercalciuria", pearl: "Urine calcium/creatinine ratio >0.2 mg/mg after age 2 years suggests hypercalciuria. Collect spot first morning urine — avoid high-calcium foods the prior day.", url: "/CalculatorsHub" },
  { topic: "FSGS Histology", pearl: "FSGS tip lesion responds best to steroids. Collapsing variant carries worst prognosis and requires urgent genetic testing. Perihilar lesion is often secondary (obesity, solitary kidney).", url: "/ClinicalSupport" },
  { topic: "Dialysis Adequacy", pearl: "Kt/V ≥1.2 per session (HD) or ≥1.7/week (PD) is the minimum target. Always calculate — clinical symptoms alone consistently underestimate inadequacy.", url: "/CalculatorsHub" },
  { topic: "Complement Pattern", pearl: "Low C3 + normal C4 = alternative pathway activation (MPGN type II, PSGN, aHUS, C3G). Low C3 + low C4 = classical pathway (SLE, SBE). Both normal excludes most complement-mediated disease.", url: "/ClinicalSupport" },
  { topic: "Bartter vs Gitelman", pearl: "Bartter: hypokalemia + alkalosis + HYPERCALCIURIA. Gitelman: hypokalemia + alkalosis + HYPOCALCIURIA + hypomagnesemia. This single difference distinguishes them clinically.", url: "/TubularDisordersHub" },
  { topic: "HUS Management", pearl: "In STEC-HUS: do NOT give antibiotics (increases toxin release). Avoid antidiarrheal agents. Supportive care — dialysis if needed. Platelet transfusion only for active bleeding.", url: "/EmergencyHub" },
  { topic: "Cystatin C", pearl: "Serum cystatin C is a better GFR marker than creatinine in children — less influenced by muscle mass, tubular secretion, and steroid use. Use the CKiD2 equation for paediatric eGFR.", url: "/CalculatorsHub" },
  { topic: "PD Peritonitis", pearl: "Cloudy PD effluent = peritonitis until proven otherwise. Threshold: cell count >100 cells/µL with >50% neutrophils. Send culture immediately; start empirical IP antibiotics within 2 hours.", url: "/EmergencyHub" },
  { topic: "Vasopressin & ADH", pearl: "Nephrogenic DI: urine osmolality <300 mOsm/kg after water deprivation, does not concentrate with desmopressin. Aquaporin-2 deficiency (AQP2) or V2R mutation most common inherited forms.", url: "/TubularDisordersHub" },
  { topic: "Rickets & Phosphate", pearl: "Hypophosphatemic rickets: low serum phosphate + elevated ALP + LOW urinary calcium (vs nutritional rickets where calcium is also low). FGF23-mediated (XLH) vs Fanconi pattern.", url: "/TubularDisordersHub" },
  { topic: "IgA Nephropathy", pearl: "IgA nephropathy: haematuria within 24–48 h of URTI (synpharyngitic), vs PSGN which has a 2–3 week latent period. IgA has normal C3; PSGN has low C3.", url: "/ClinicalSupport" },
];

const GUIDELINES = [
  { org: "KDIGO 2024", condition: "AKI", text: "Volume resuscitation in AKI: use isotonic crystalloids as first-line. Avoid starches. Target MAP ≥65 mmHg (adults) or age-appropriate in children. Avoid nephrotoxins." },
  { org: "IPNA 2023", condition: "Nephrotic Syndrome", text: "First episode NS: prednisolone 60 mg/m²/day (max 60 mg) × 4 weeks, then 40 mg/m² alternate day × 4 weeks. Response at 4 weeks defines steroid sensitivity." },
  { org: "KDIGO 2021", condition: "CKD", text: "BP target in children with CKD: <50th percentile. ACEi or ARB are first-line antihypertensives regardless of proteinuria status. Monitor K+ and creatinine at 1–2 weeks after initiation." },
  { org: "ESPN/ERKNet 2022", condition: "ADPKD", text: "Children with ADPKD: annual BP, urine ACR, and renal ultrasound from diagnosis. Total kidney volume (TKV) is the best prognostic marker. Tolvaptan is not approved <18 years." },
  { org: "AAP 2017", condition: "Hypertension", text: "Stage 1 HTN in children (BP 95th–99th+5): lifestyle modifications for 6 months before pharmacotherapy if asymptomatic with no end-organ damage. Confirm on 3 separate visits." },
  { org: "ISPD 2022", condition: "PD Peritonitis", text: "Peritonitis in PD: start empirical IP antibiotics covering gram-positive (vancomycin) and gram-negative organisms (ceftazidime or aminoglycoside) within 2 hours of diagnosis." },
  { org: "KDIGO 2022", condition: "IgA Nephropathy", text: "IgA nephropathy with proteinuria >1 g/day despite 3 months optimised RAS blockade: consider immunosuppression. Tonsillectomy not routinely recommended. SGLT2 inhibitors emerging." },
  { org: "PRINTO/PRES 2023", condition: "Lupus Nephritis", text: "Induction for Class III/IV LN: low-dose IV cyclophosphamide (Euro-Lupus: 500 mg × 6 fortnightly doses) is as effective as high-dose and preferred in children. Always add hydroxychloroquine." },
  { org: "SHARE 2020", condition: "ANCA Vasculitis", text: "ANCA vasculitis remission induction: rituximab is non-inferior to cyclophosphamide and preferred in young patients due to lower gonadotoxicity. PCP prophylaxis mandatory during induction." },
  { org: "ESPGHAN 2022", condition: "Nutrition in CKD", text: "Children with CKD stage 3b+ should have dietary assessment every 3–6 months. Protein restriction is NOT recommended in children — prioritise adequate energy intake to preserve growth." },
  { org: "KDIGO 2017", condition: "Transplant DSA", text: "Pre-transplant: avoid unnecessary sensitisation (transfusions, pregnancies). DSA titres >3000 MFI with complement-activating ability correlate with higher rejection risk and graft loss." },
  { org: "IPNA 2021", condition: "VUR/UTI", text: "VUR grades I–II in children with no febrile UTIs: antibiotic prophylaxis not routinely required. Grades III–V with recurrent febrile UTIs: prophylaxis or surgical correction indicated." },
  { org: "AAP 2021", condition: "First Febrile UTI", text: "First febrile UTI in child >2 months: renal-bladder ultrasound recommended. VCUG only if ultrasound abnormal or recurrent febrile UTIs. No prophylaxis after a single uncomplicated episode." },
  { org: "KDIGO 2023", condition: "SRNS", text: "SRNS: genetic testing recommended before prolonged immunosuppression. Calcineurin inhibitors (tacrolimus preferred over ciclosporin) are first-line pharmacotherapy in non-genetic SRNS." },
  { org: "ESPN 2021", condition: "Alport Syndrome", text: "Alport syndrome: ACEi/ARB started at microalbuminuria stage slows CKD progression even in males with X-linked disease. Genetic counselling mandatory — lifelong follow-up needed." },
  { org: "KDIGO 2023", condition: "Glomerulonephritis", text: "C3 glomerulopathy: screen for complement pathway mutations (CFH, CFI, C3, CFB) and autoantibodies (C3NeF, anti-CFH). Complement inhibitors (eculizumab) only for aggressive disease." },
  { org: "ISPN 2022", condition: "CAKUT", text: "Antenatally diagnosed CAKUT: postnatal renal ultrasound within 48 h for bilateral hydronephrosis or suspected obstruction. Unilateral mild pelvic dilatation: repeat at 4–6 weeks." },
  { org: "PRINTO 2021", condition: "JIA-Uveitis", text: "Children with JIA should have regular slit-lamp screening for asymptomatic uveitis: every 3 months if ANA positive and age <7 years, regardless of joint disease activity." },
  { org: "ESPGHAN 2020", condition: "Paediatric IBD", text: "Paediatric IBD: exclusive enteral nutrition (EEN) is first-line induction therapy for luminal Crohn disease. Steroid-free approach preferred to preserve growth and bone density." },
  { org: "AAP 2022", condition: "Bronchiolitis", text: "Bronchiolitis: do NOT use bronchodilators, steroids, or antibiotics routinely. Supportive care (hydration, oxygen) is the cornerstone. High-flow nasal cannula for moderate-severe cases." },
];

const CHALLENGES = [
  { vignette: "8-year-old girl, periorbital puffiness × 3 days, protein 4+ on dipstick, no haematuria, serum albumin 18 g/L, C3 normal. What is the most likely diagnosis?", options: ["A. Minimal change disease", "B. Membranous nephropathy", "C. IgA nephropathy", "D. PSGN"], answer: 0, explanation: "Classic childhood NS without haematuria, normal C3, normal BP → MCD in >90% cases. Excellent response to prednisolone expected. Biopsy not required for first episode in typical childhood NS.", link: "/ClinicalSupport" },
  { vignette: "10-year-old boy, gross haematuria 2 weeks after sore throat. BP 148/92, periorbital oedema, C3 low (0.42 g/L), RBC casts on urine microscopy. Most likely diagnosis?", options: ["A. IgA nephropathy", "B. Post-streptococcal GN", "C. Alport syndrome", "D. LN"], answer: 1, explanation: "PSGN: 2–3 week latent period post-URTI, low C3, RBC casts, hypertension. IgA nephropathy presents within 24–48 h of URTI (synpharyngitic) and C3 is normal.", link: "/ClinicalSupport" },
  { vignette: "6-year-old, polyuria, rickets on X-ray, phosphate 0.6 mmol/L, glucosuria with normal blood glucose, aminoaciduria, bicarb 14 mEq/L. What syndrome is this?", options: ["A. Diabetes insipidus", "B. Fanconi syndrome", "C. Gitelman syndrome", "D. Bartter syndrome"], answer: 1, explanation: "Generalised proximal tubular dysfunction (phosphate, glucose, amino acids, bicarb, uric acid) = Fanconi syndrome. In children, consider cystinosis, Lowe syndrome, Wilson disease, galactosaemia.", link: "/TubularDisordersHub" },
  { vignette: "12-year-old boy, sensorineural hearing loss, persistent microhaematuria, family history of CKD in males dying in 20s–30s. What is the diagnosis?", options: ["A. Thin basement membrane disease", "B. X-linked Alport syndrome", "C. IgA nephropathy", "D. Autosomal recessive FSGS"], answer: 1, explanation: "X-linked Alport: COL4A5 mutation. Haematuria + SNHL + positive family history in males. Electron microscopy: irregular thinning and thickening, basket-weave pattern. Early ACEi slows progression.", link: "/RareDiseaseModule" },
  { vignette: "3-year-old girl, 2nd NS relapse, prednisolone 60 mg/m²/day × 4 weeks — no response. Urine PCR 4.5 mg/mg. Mother on haemodialysis since age 32. What is the next step?", options: ["A. Start mycophenolate immediately", "B. Genetic testing before further IS", "C. Renal biopsy + cyclophosphamide", "D. Tacrolimus empirically"], answer: 1, explanation: "SRNS with family history → genetic testing first (NPHS1, NPHS2, WT1, LAMB2). Many genetic SRNS do not respond to any immunosuppression. Avoiding prolonged IS without diagnosis is critical.", link: "/ClinicalSupport" },
  { vignette: "8-year-old, K+ 2.7 mEq/L, metabolic alkalosis, BP 100/60, urine K+ 32 mEq/L, urine calcium very low (0.04 mg/mg). No medications. Most likely diagnosis?", options: ["A. Bartter syndrome type III", "B. Gitelman syndrome", "C. Primary hyperaldosteronism", "D. Pseudo-hypoaldosteronism"], answer: 1, explanation: "Gitelman: SLC12A3 mutation (NCCT). Hypokalemia + alkalosis + LOW urinary calcium + hypomagnesemia. Bartter = high urinary calcium. Distinguished by urinary calcium.", link: "/TubularDisordersHub" },
  { vignette: "5-year-old, 3 days of oliguria after bloody diarrhoea. Hb 6.2 g/dL, platelets 24,000, creatinine 340 µmol/L, schistocytes on blood film. What should be avoided?", options: ["A. Red cell transfusion", "B. IV fluids", "C. Antibiotics for E. coli O157", "D. Nephrology referral"], answer: 2, explanation: "STEC-HUS: antibiotics increase Shiga toxin release and worsen outcome — strongly contraindicated. Antidiarrheal agents also avoided. Platelet transfusion only for active haemorrhage.", link: "/EmergencyHub" },
  { vignette: "14-year-old girl, new-onset hypertension, serum K+ 2.9 mEq/L, metabolic alkalosis. BP difficult to control. Renin low, aldosterone high. CT: right adrenal mass. Diagnosis?", options: ["A. Conn syndrome (primary aldosteronism)", "B. Pheochromocytoma", "C. Renovascular hypertension", "D. Cushing syndrome"], answer: 0, explanation: "Primary hyperaldosteronism (Conn): low renin + high aldosterone + hypokalaemia + difficult-to-control HTN. Adrenal adenoma on CT confirms. Adrenal vein sampling if bilateral disease suspected.", link: "/ClinicalSupport" },
  { vignette: "4-year-old boy, persistent nephrotic syndrome, poor response to steroids, microcephaly, cataracts since birth, intellectual disability. What condition links these features?", options: ["A. Cystinosis", "B. Lowe syndrome (OCRL)", "C. Dent disease", "D. HNF1B nephropathy"], answer: 1, explanation: "Lowe syndrome: OCRL1 mutation. Triad = cataracts + intellectual disability + Fanconi syndrome/NS. X-linked — all males affected. Carrier females have lens opacities. No curative treatment.", link: "/RareDiseaseModule" },
];

const EMERGENCIES = [
  { scenario: "Severe Hyperkalemia (K+ >7 mEq/L with ECG changes)", steps: "① Calcium gluconate 10% — 0.5 mL/kg IV over 5–10 min (stabilise membrane). ② Salbutamol nebulisation 2.5–5 mg (onset 15–30 min). ③ Insulin 0.1 U/kg IV + dextrose 2 mL/kg 25% (onset 15–30 min). ④ Sodium bicarbonate 1–2 mEq/kg if acidosis. ⑤ Loop diuretic if renal function present. ⑥ Urgent dialysis if refractory or anuric.", url: "/EmergencyHub" },
  { scenario: "Severe Symptomatic Hyponatremia (Na <125 + seizures/encephalopathy)", steps: "① 3% NaCl 2–3 mL/kg IV bolus over 10–15 min. Repeat once if seizures persist. ② Target: raise Na by 4–6 mEq/L acutely (not >10 mEq/L in 24 h — risk ODS). ③ Identify underlying cause (SIADH vs hypovolaemic). ④ SIADH: fluid restrict + hypertonic saline for symptoms.", url: "/EmergencyHub" },
  { scenario: "Hypertensive Emergency (BP >99th+12 mmHg + symptoms)", steps: "① IV labetalol 0.2–1 mg/kg bolus (max 40 mg) OR nicardipine infusion 0.5–3 µg/kg/min. ② Target: reduce MAP by max 25% in first hour — avoid rapid drops. ③ Risk of posterior reversible encephalopathy (PRES): look for headache + visual changes + seizure. ④ MRI if neurological symptoms.", url: "/HypertensiveEmergency" },
  { scenario: "Severe Hypocalcaemia (Ca <1.75 mmol/L + tetany or seizures)", steps: "① Calcium gluconate 10% — 0.5 mL/kg slow IV over 10 min with cardiac monitoring. ② Repeat in 10 min if symptoms persist. ③ Start IV calcium infusion + check Mg (hypomagnesaemia causes refractory hypocalcaemia). ④ Start calcitriol + oral calcium supplementation.", url: "/EmergencyHub" },
  { scenario: "Tumour Lysis Syndrome (post-chemotherapy)", steps: "① Aggressive IV hydration 3L/m²/day (no potassium in fluids). ② Rasburicase (0.2 mg/kg/day) for uric acid — first choice. Allopurinol if rasburicase unavailable/G6PD deficiency. ③ Avoid calcium-containing phosphate binders. ④ Monitor electrolytes every 4–6 h. ⑤ Early nephrology for dialysis decision.", url: "/EmergencyHub" },
  { scenario: "PD Peritonitis (cloudy effluent)", steps: "① Cell count >100 cells/µL with >50% neutrophils = peritonitis. ② Culture PD effluent immediately. ③ IP vancomycin + IP ceftazidime or aminoglycoside empirically. ④ Reassess at 48–72 h — if no improvement, consider catheter removal. ⑤ Fungal peritonitis → remove catheter immediately.", url: "/EmergencyHub" },
  { scenario: "Flash Pulmonary Oedema in ESRD (anuric)", steps: "① Sit upright, high-flow O₂ (target SpO₂ ≥95%). ② IV furosemide 2–4 mg/kg if any residual function. ③ GTN sublingual or IV if BP allows. ④ Urgent ultrafiltration/dialysis if anuric — most effective intervention. ⑤ Avoid morphine in CKD patients.", url: "/EmergencyHub" },
  { scenario: "Anaphylaxis (drug/contrast/biologic infusion)", steps: "① IM adrenaline 0.01 mg/kg (max 0.5 mg) in anterolateral thigh — FIRST. ② Lay flat + elevate legs. ③ IV/IO access + fluid bolus 10 mL/kg. ④ Nebulised salbutamol for bronchospasm. ⑤ Chlorpheniramine + hydrocortisone (second-line, do not delay adrenaline). ⑥ Observe 4–6 h for biphasic reaction.", url: "/EmergencyHub" },
  { scenario: "Acute Urinary Retention in Child", steps: "① Bladder scan to confirm (volume >3 mL/kg). ② Urethral catheterisation — Nelaton size appropriate for age. ③ Send urine for MC&S + dipstick. ④ If fails: suprapubic catheter by experienced clinician. ⑤ Evaluate for neurogenic bladder, posterior urethral valves, constipation.", url: "/EmergencyHub" },
];

const DRUG_SPOTLIGHTS = [
  { drug: "Tacrolimus", pearl: "CNI — inhibits calcineurin → IL-2 ↓ → T-cell suppression. Target trough: 8–12 ng/mL (early transplant), 5–8 ng/mL (stable). Monitor levels weekly until stable. Toxicities: nephrotoxicity, PTLD, new-onset diabetes, neurotoxicity.", link: "/DrugsDosing" },
  { drug: "Prednisolone", pearl: "IPNA NS protocol: 60 mg/m²/day × 4 weeks → 40 mg/m² alternate day × 4 weeks. Side effects to monitor: hypertension, Cushingoid features, growth impairment, cataract, osteoporosis, adrenal suppression. Never stop abruptly after >2 weeks.", link: "/DrugsDosing" },
  { drug: "Furosemide", pearl: "Loop diuretic — inhibits NKCC2 in thick ascending loop. Dose: 1–4 mg/kg/day PO or 0.5–1 mg/kg IV. Efficacy drops below GFR 15. Monitor: hypokalemia, hyponatremia, metabolic alkalosis, ototoxicity (high-dose IV).", link: "/DrugsDosing" },
  { drug: "Mycophenolate Mofetil", pearl: "Antimetabolite — inhibits IMPDH → purine synthesis blockade in lymphocytes. Dose in SRNS/transplant: 600 mg/m²/dose BD (max 1 g BD). Main SE: GI (take with food), leukopenia — CBC monthly. Teratogenic — mandatory contraception in females.", link: "/DrugsDosing" },
  { drug: "Cyclophosphamide", pearl: "Alkylating agent. NS oral dose: 2 mg/kg/day × 8–12 weeks (max cumulative 168 mg/kg). IV LN dose: 500–750 mg/m²/pulse monthly × 6 (Euro-Lupus). Risks: haemorrhagic cystitis (hydrate well), gonadotoxicity, leukaemia (late), leukopenia.", link: "/DrugsDosing" },
  { drug: "Enalapril", pearl: "ACE inhibitor — first-line antiproteinuric agent. Dose: 0.1–0.6 mg/kg/day OD (max 40 mg). Reduces proteinuria by 30–50% independent of BP effect. Monitor K+ and creatinine at 2–4 weeks. Avoid in bilateral RAS, pregnancy, and hyperkalemia.", link: "/DrugsDosing" },
  { drug: "Amlodipine", pearl: "Dihydropyridine CCB — safest pediatric antihypertensive. Dose: 0.1–0.3 mg/kg/day OD (max 10 mg). Safe in CKD — no dose adjustment. Does NOT increase proteinuria. Side effects: ankle oedema, gingival hyperplasia (especially with ciclosporin).", link: "/DrugsDosing" },
  { drug: "Rituximab", pearl: "Anti-CD20 — depletes B-cells for 6–9 months. SDNS/SRNS dose: 375 mg/m²/dose × 1–4 doses. Screen for Hepatitis B (risk of reactivation) and CMV before starting. Risks: PML (rare), infusion reactions, hypogammaglobulinemia with repeated courses.", link: "/DrugsDosing" },
  { drug: "Rasburicase", pearl: "Recombinant uricase — converts uric acid to allantoin (soluble). Dose: 0.2 mg/kg/day × 1–5 days for TLS. Works within hours. CONTRAINDICATED in G6PD deficiency — causes severe haemolytic anaemia. Store at 2–8°C.", link: "/DrugsDosing" },
  { drug: "Levamisole", pearl: "Immunomodulator for FRNS. Dose: 2.5 mg/kg alternate days (max 150 mg). Main risk: agranulocytosis — CBC monthly is mandatory. Often used alongside low-dose alternate-day prednisolone to maintain remission and reduce steroid dose.", link: "/DrugsDosing" },
  { drug: "Calcitriol", pearl: "Active vitamin D (1,25-OH₂D₃). CKD-MBD: 0.01–0.05 µg/kg/day OD (max 0.25–0.5 µg/day). Monitor calcium weekly initially — risk of hypercalcaemia and adynamic bone disease. Target iPTH = 2–9× upper normal for CKD stage.", link: "/DrugsDosing" },
  { drug: "Sodium Bicarbonate", pearl: "CKD metabolic acidosis: target serum bicarb ≥22 mEq/L. Oral dose: 1–3 mEq/kg/day divided. IV: 1–2 mEq/kg slow infusion for acute correction. High sodium load — monitor BP in hypertensive patients. Tabs: 500 mg (= 6 mEq).", link: "/DrugsDosing" },
  { drug: "Cotrimoxazole", pearl: "PCP prophylaxis in transplant/immunosuppression: TMP 2.5–5 mg/kg/day OD or 3×/week. UTI prophylaxis: TMP 2 mg/kg once nightly. Renal: monitor K+ (can cause hyperkalaemia via ENaC blockade, especially with calcineurin inhibitors).", link: "/DrugsDosing" },
  { drug: "Cysteamine", pearl: "Cystine-depleting agent for cystinosis. Dose: 1.3 g/m²/day in 4 divided doses (oral bitartrate) or 2×/day (delayed-release). Target leukocyte cystine <1 nmol/mg protein. Cysteamine eye drops for corneal crystals. Starts from diagnosis — slows CKD progression dramatically.", link: "/DrugsDosing" },
  { drug: "Eculizumab", pearl: "Anti-C5 complement inhibitor for aHUS/C3G. Dose: weight-based (CHMP label). Mandatory meningococcal vaccination ≥2 weeks before starting (or prophylactic penicillin). Monitor CBC, LDH, haptoglobin for breakthrough haemolysis.", link: "/DrugsDosing" },
];

const RARE_DISEASES = [
  { disease: "Cystinosis", points: "• Fanconi syndrome typically appears in first year of life (glucosuria, aminoaciduria, phosphaturia, RTA type II)\n• Diagnosis: leukocyte cystine levels >0.2 nmol/mg protein (gold standard)\n• Corneal crystals visible on slit-lamp — pathognomonic after age 2 years\n• Cysteamine slows CKD progression dramatically — start early, even before symptoms\n• Extra-renal: hypothyroidism, diabetes, myopathy, retinopathy (long-term)" },
  { disease: "Dent Disease", points: "• X-linked — CLCN5 (type 1) or OCRL1 (type 2) mutation\n• Hallmark: low-molecular-weight proteinuria (LMW) + hypercalciuria + nephrocalcinosis\n• Unlike Fanconi — no systemic acidosis or aminoaciduria in type 1\n• No specific treatment; thiazide diuretics reduce urinary calcium and stone risk\n• Slow progression to CKD — ESRD in 30s–50s in males" },
  { disease: "Fabry Disease", points: "• X-linked lysosomal storage — GLA mutation → α-galactosidase A deficiency\n• Boys: angiokeratomas, acroparesthesia, corneal whorl (verticillata), hypohidrosis by age 10\n• Girls: variable penetrance — may be as severe as affected males\n• Enzyme replacement: agalsidase alfa (Replagal) or agalsidase beta (Fabrazyme)\n• Screening: urine lyso-Gb3; confirmed by enzyme activity + genetics" },
  { disease: "Alport Syndrome", points: "• Defects in type IV collagen: COL4A5 (X-linked, 80%), COL4A3/4 (AR, 20%)\n• Features: persistent haematuria from birth, progressive CKD, SNHL, anterior lenticonus\n• X-linked males: ESRD in 20s–30s without treatment\n• ACEi/ARB early (microalbuminuria stage) significantly slows progression in X-linked males\n• Genetic testing essential — same gene, different variants, vastly different prognosis" },
  { disease: "Lowe Syndrome (OCRL)", points: "• X-linked — OCRL1 mutation (same gene as Dent type 2, but different phenotype)\n• Classic triad: congenital cataracts + intellectual disability + renal Fanconi syndrome\n• All affected males; carrier females have characteristic posterior lens opacities\n• Renal: Fanconi syndrome → CKD progression by teenage years\n• No specific renal treatment; supportive Fanconi management + multidisciplinary care" },
  { disease: "Bardet-Biedl Syndrome", points: "• Ciliopathy — multiple genes (BBS1–21+), most commonly BBS1 and BBS10\n• Major features: rod-cone dystrophy, central obesity, polydactyly, cognitive impairment, hypogonadism\n• Renal: structural anomalies (calyceal clubbing, MCDK), nephronophthisis-pattern CKD\n• Regular renal imaging and GFR monitoring from diagnosis\n• Genetic counselling: autosomal recessive with triallelic inheritance possible" },
  { disease: "HNF1B Nephropathy", points: "• De novo 17q12 deletion most common (50%); intragenic mutations remainder\n• Renal cysts + MODY5 diabetes (usually after age 10) + hypomagnesaemia + pancreas/liver anomalies\n• MCDK or oligomeganephronia on prenatal scan → HNF1B is diagnosis until proven otherwise\n• Treatment: magnesium supplementation; diabetes management; ACEi if proteinuria\n• GFR monitoring essential — 30% reach ESRD in adulthood" },
  { disease: "Nephronophthisis", points: "• Most common genetic cause of paediatric ESRD (NPHP1 deletion most frequent)\n• Triad: polyuria/polydipsia (concentrating defect), growth retardation, anaemia disproportionate to CKD\n• Ultrasound: normal-sized or small kidneys, corticomedullary cysts (appear late)\n• Senior-Loken syndrome: NPHP + retinal degeneration (key association)\n• No specific treatment — CKD management, early transplant planning preferred" },
  { disease: "ADTKD-UMOD (Medullary Cystic Kidney Disease type 2)", points: "• Autosomal dominant — UMOD mutation → uromodulin (Tamm-Horsfall protein) misfolding\n• Features: hyperuricaemia in childhood, gout in young adults, slowly progressive CKD\n• FEurate very low (<5%) — pathognomonic\n• Medullary cysts visible on MRI (may be absent on ultrasound)\n• Allopurinol reduces gout attacks but does not affect CKD progression" },
  { disease: "Primary Hyperoxaluria Type 1", points: "• AGXT mutation → hepatic glyoxylate → oxalate overproduction → calcium oxalate stones/nephrocalcinosis\n• Presents with recurrent urinary stones from infancy, nephrocalcinosis, progressive CKD\n• 24-h urine oxalate markedly elevated (>0.5 mmol/kg/day)\n• High fluid intake + pyridoxine (for responsive mutations) + potassium citrate\n• Lumasiran (RNAi) approved; combined liver-kidney transplant for end-stage disease" },
];

const LAB_PEARLS = [
  "Positive urine anion gap (Na+K−Cl) = impaired NH4⁺ excretion → distal RTA. Negative urine anion gap = extra-renal bicarbonate loss (diarrhea). Only interpret in setting of normal anion gap metabolic acidosis.",
  "Urine Ca/Cr ratio >0.2 mg/mg after age 2 years = hypercalciuria. Normal in infants <7 months is up to 0.8. Always confirm with 24-h urine calcium if spot ratio is elevated.",
  "FENa <1% in oliguria = prerenal AKI (tubules intact). FENa >2% = intrinsic injury. Both unreliable after diuretics — use FEurea instead (<35% prerenal, >50% intrinsic).",
  "Serum bicarbonate <18 mEq/L in a CKD patient requires treatment. Target ≥22 mEq/L. Oral bicarbonate supplementation slows CKD progression (KDIGO 2021).",
  "Urine osmolality <100 mOsm/kg in polyuria = DI or primary polydipsia. >800 mOsm/kg = concentrated (excludes DI). After water deprivation: central DI concentrates with desmopressin; nephrogenic DI does not.",
  "Complement: low C3 + normal C4 = alternative pathway (MPGN type II, PSGN, aHUS, C3G). Low C3 + low C4 = classical pathway (SLE, SBE, cryoglobulinemia). Both normal excludes complement-mediated GN.",
  "TTKG >10 in hypokalemia = renal K⁺ wasting (hyperaldosteronism, Bartter/Gitelman). TTKG <3 = GI losses or inadequate intake. Note: TTKG is only valid when urine osmolality > plasma osmolality.",
  "Serum cystatin C is a better GFR marker than creatinine in children — less influenced by muscle mass, tubular secretion, and steroid use. Use CKiD2 equation for paediatric eGFR.",
  "Urinary beta-2-microglobulin elevation = proximal tubular dysfunction. Use as marker of tubular disease (Fanconi, Lowe, Dent, cystinosis, drug toxicity). Must correct for urine creatinine.",
  "Fractional excretion of uric acid <5% with hyperuricaemia suggests renal urate retention — think ADTKD-UMOD (medullary cystic kidney disease type 2) in young patients with gout.",
  "Urine anion gap negative + metabolic acidosis + diarrhea history = GI bicarbonate loss (diarrhea). Stool osmotic gap >50 mOsm/kg distinguishes osmotic from secretory diarrhea.",
  "Urine protein electrophoresis: albumin-predominant = glomerular proteinuria. Low-MW protein predominant (alpha-1 microglobulin, beta-2 microglobulin) = tubular proteinuria. Monoclonal band = paraprotein.",
  "Elevated TTKG + hyponatraemia + high urine Na = SIADH or adrenal insufficiency. ACTH stimulation test if cortisol level is equivocal. Aldosterone deficiency causes hyperkalemia + hyponatremia (salt-wasting).",
];

const TRENDING_TOPICS = [
  { topic: "Approach to Hyponatremia", desc: "Most viewed pathway this week — 4-step approach: assess tonicity → volume status → urine Na → cause.", link: "/ClinicalSupport" },
  { topic: "Nephrotic Syndrome Management", desc: "Top search this week — from first episode to steroid-resistant NS, full pathway with IPNA 2023 protocol.", link: "/ClinicalSupport" },
  { topic: "AKI Staging & Management", desc: "Trending: KDIGO AKI stages, fluid management, and when to start RRT in children.", link: "/ClinicalSupport" },
  { topic: "Pediatric Hypertension", desc: "Most searched: BP percentiles, ABPM interpretation, and antihypertensive drug selection by age.", link: "/CalculatorsHub" },
  { topic: "Tubular Disorders", desc: "Trending: Bartter vs Gitelman vs RTA — the diagnostic triad approach using urine calcium, anion gap, and pH.", link: "/TubularDisordersHub" },
  { topic: "Renal Biopsy Patterns", desc: "Most viewed: FSGS variants and their response to treatment — tip, perihilar, NOS, cellular, collapsing.", link: "/ClinicalSupport" },
  { topic: "CKD Progression & MBD", desc: "High usage: CKD staging in children, bone mineral disease, calcium-phosphate targets, paricalcitol dosing.", link: "/ClinicalSupport" },
  { topic: "Genetic Testing in Nephrology", desc: "Rising trend: when to order panel vs WES, ACMG classification, and counselling for COL4A3/A5 variants.", link: "/RareDiseaseModule" },
  { topic: "Electrolyte Calculators", desc: "Most used tools this week: Schwartz GFR, FENa, anion gap corrected, urine anion gap, TTKG calculator.", link: "/CalculatorsHub" },
  { topic: "Drug Dosing in CKD", desc: "Top formulary searches: amlodipine, tacrolimus, furosemide, cotrimoxazole — all with eGFR-based adjustments.", link: "/DrugsDosing" },
];

const DOW_THEMES = ["Guideline Update", "Nephrology Pearl", "Critical Care", "Electrolytes", "Pharmacology", "Diagnostic Challenge", "Rare Disease"];

// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user?.role === 'admin') isAuthorized = true;
    } catch {
      isAuthorized = true; // scheduled call — no user token
    }

    if (!isAuthorized) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const today = new Date().toISOString().slice(0, 10);
    const rng = makeRng(today);

    // Handle unsubscribe
    const url = new URL(req.url);
    const unsubToken = url.searchParams.get('unsubscribe');
    if (unsubToken) {
      const allPrefs = await base44.asServiceRole.entities.NotificationPreference.list('-created_date', 500);
      const match = allPrefs.find(p => p.id === unsubToken || p.user_email === unsubToken);
      if (match) {
        await base44.asServiceRole.entities.NotificationPreference.update(match.id, { daily_clinical_summary: false });
        return new Response('<html><body style="font-family:sans-serif;max-width:400px;margin:60px auto;text-align:center"><h2>Unsubscribed ✓</h2><p>You have been unsubscribed from Daily Clinical Summaries. Re-enable anytime in Notification Preferences.</p></body></html>', { headers: { 'Content-Type': 'text/html' } });
      }
      return Response.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Day-of-week theme
    const dow = new Date(today + "T12:00:00Z").getDay();
    const todayTheme = DOW_THEMES[dow];

    // Pick content — each pick advances the RNG state so picks are independent
    const pearl = pick(PEARLS, rng);
    const guideline = pick(GUIDELINES, rng);
    const challenge = pick(CHALLENGES, rng);
    const emergency = pick(EMERGENCIES, rng);
    const drug = pick(DRUG_SPOTLIGHTS, rng);
    const rareDisease = pick(RARE_DISEASES, rng);
    const labPearl = pick(LAB_PEARLS, rng);
    const trendingTopic = pick(TRENDING_TOPICS, rng);

    const summaryData = {
      date: today,
      theme: todayTheme,
      clinical_pearl: pearl.pearl,
      pearl_topic: pearl.topic,
      pearl_pathway_url: pearl.url,
      guideline_org: guideline.org,
      guideline_condition: guideline.condition,
      guideline_reminder: guideline.text,
      challenge_case: challenge.vignette,
      challenge_options: challenge.options,
      challenge_answer: challenge.answer,
      challenge_explanation: challenge.explanation,
      challenge_link_url: challenge.link,
      emergency_scenario: emergency.scenario,
      emergency_steps: emergency.steps,
      emergency_url: emergency.url,
      drug_name: drug.drug,
      drug_pearl: drug.pearl,
      drug_link: drug.link,
      rare_disease_name: rareDisease.disease,
      rare_disease_spotlight: rareDisease.points,
      lab_pearl: labPearl,
      trending_topic: trendingTopic.topic,
      trending_desc: trendingTopic.desc,
      trending_link: trendingTopic.link,
      subject_line: `🩺 CliniCals Daily | ${todayTheme} — ${pearl.topic} Pearl`,
      generated_at: new Date().toISOString(),
    };

    // Store/update
    const existing = await base44.asServiceRole.entities.CustomSection.filter({
      section_type: 'general',
      generation_topic: 'daily_summary',
      title: `Daily Summary ${today}`,
    });

    if (existing.length > 0) {
      await base44.asServiceRole.entities.CustomSection.update(existing[0].id, { content: summaryData, status: 'published' });
    } else {
      await base44.asServiceRole.entities.CustomSection.create({
        title: `Daily Summary ${today}`,
        section_type: 'general',
        generation_topic: 'daily_summary',
        created_by_admin: true,
        status: 'published',
        content: summaryData,
      });
    }

    // Email all subscribed users
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 200);
    const allPrefs = await base44.asServiceRole.entities.NotificationPreference.list('-created_date', 500);
    const prefsByEmail = {};
    for (const p of allPrefs) { if (p.user_email) prefsByEmail[p.user_email] = p; }

    let emailsSent = 0;
    for (const u of allUsers.slice(0, 50)) {
      if (!u.email) continue;
      const pref = prefsByEmail[u.email];
      if (pref && pref.daily_clinical_summary === false) continue;

      const appId = Deno.env.get("BASE44_APP_ID") || "APP_ID";
      const unsubUrl = `https://api.base44.com/api/apps/${appId}/functions/dailyClinicalSummary?unsubscribe=${pref?.id || u.email}`;

      const emailBody = `Dear Dr. ${u.full_name || 'Colleague'},

${summaryData.subject_line}
Today's Theme: ${todayTheme} | ${today}

━━━━━━━━━━━━━━━━━━━━━━━━
💡 CLINICAL PEARL — ${pearl.topic}
━━━━━━━━━━━━━━━━━━━━━━━━
${pearl.pearl}

━━━━━━━━━━━━━━━━━━━━━━━━
📚 GUIDELINE REMINDER — ${guideline.org}
━━━━━━━━━━━━━━━━━━━━━━━━
Topic: ${guideline.condition}
${guideline.text}

━━━━━━━━━━━━━━━━━━━━━━━━
🔍 DIAGNOSTIC CHALLENGE
━━━━━━━━━━━━━━━━━━━━━━━━
${challenge.vignette}

${challenge.options.join("  |  ")}

Answer: ${challenge.options[challenge.answer]}
${challenge.explanation}

━━━━━━━━━━━━━━━━━━━━━━━━
⚡ EMERGENCY MINUTE — ${emergency.scenario.split("(")[0].trim()}
━━━━━━━━━━━━━━━━━━━━━━━━
${emergency.steps}

━━━━━━━━━━━━━━━━━━━━━━━━
💊 DRUG SPOTLIGHT — ${drug.drug}
━━━━━━━━━━━━━━━━━━━━━━━━
${drug.pearl}

━━━━━━━━━━━━━━━━━━━━━━━━
🧬 RARE DISEASE — ${rareDisease.disease}
━━━━━━━━━━━━━━━━━━━━━━━━
${rareDisease.points}

━━━━━━━━━━━━━━━━━━━━━━━━
🧪 LAB INTERPRETATION PEARL
━━━━━━━━━━━━━━━━━━━━━━━━
${labPearl}

━━━━━━━━━━━━━━━━━━━━━━━━
📈 TRENDING TODAY
━━━━━━━━━━━━━━━━━━━━━━━━
${trendingTopic.topic}: ${trendingTopic.desc}

━━━━━━━━━━━━━━━━━━━━━━━━
Open full interactive summary → https://app.base44.com/DailySummary

CliniCals Hub by Swarnim — Pediatric Clinical Intelligence
Educational support only. Verify all clinical decisions independently.

Unsubscribe: ${unsubUrl}`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          subject: summaryData.subject_line,
          body: emailBody,
        });
        emailsSent++;
      } catch (emailErr) {
        console.warn('Email failed for', u.email, emailErr.message);
      }
    }

    return Response.json({ success: true, date: today, theme: todayTheme, summary: summaryData, emails_sent: emailsSent });
  } catch (error) {
    console.error('dailyClinicalSummary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});