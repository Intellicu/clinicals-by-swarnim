import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Content pools for deterministic daily rotation (seeded by date)
const CONTENT_POOLS = {
  pearls: [
    { topic: "Nephrotic Syndrome", pearl: "A urine protein:creatinine ratio >2 mg/mg (or >200 mg/mmol) is in the nephrotic range. Confirm with early morning specimen.", url: "/ClinicalSupport" },
    { topic: "Hyponatremia", pearl: "In SIADH, urine sodium >20 mEq/L with urine osmolality >100 mOsm/kg distinguishes it from hypovolemic hyponatremia.", url: "/ClinicalSupport" },
    { topic: "AKI", pearl: "KDIGO AKI: ≥0.3 mg/dL rise in creatinine within 48h OR ≥1.5× baseline within 7 days OR urine output <0.5 mL/kg/h for 6h.", url: "/ClinicalSupport" },
    { topic: "Hypertension", pearl: "BP ≥95th percentile on 3 separate occasions = Stage 1 HTN in children. Always use appropriate cuff size — too small gives falsely high readings.", url: "/ClinicalSupport" },
    { topic: "Renal Tubular Acidosis", pearl: "Normal anion gap metabolic acidosis + hypokalemia + high urine pH (>5.5) = distal RTA until proven otherwise.", url: "/ClinicalSupport" },
    { topic: "CKD Progression", pearl: "eGFR decline >5 mL/min/1.73m²/year or >25% from baseline warrants urgent investigation for a superimposed reversible cause.", url: "/ClinicalSupport" },
    { topic: "Hyperkalemia", pearl: "ECG changes in hyperkalemia: peaked T-waves → PR prolongation → wide QRS → sine wave → VF. Calcium gluconate stabilises membrane — give first.", url: "/EmergencyHub" },
    { topic: "Gitelman Syndrome", pearl: "Persistent hypokalemia + metabolic alkalosis + low urinary calcium suggests Gitelman syndrome. Check magnesium — hypomagnesemia is almost universal.", url: "/TubularDisordersHub" },
    { topic: "Steroid Resistance", pearl: "Children with steroid-resistant NS who are <1 year or have atypical features (microhematuria, low C3, family history) should be genetically tested before escalating immunosuppression.", url: "/ClinicalSupport" },
    { topic: "Hyperglycemia & Sodium", pearl: "Corrected Na = Measured Na + 1.6 × [(glucose mg/dL – 100)/100]. Always calculate corrected sodium in hyperglycemia before labeling as hyponatremia.", url: "/CalculatorsHub" },
    { topic: "Proteinuria", pearl: "First morning urine PCR is the most reliable. PCR >0.2 mg/mg is abnormal in children >2 years; >0.5 mg/mg is significant proteinuria.", url: "/ClinicalSupport" },
    { topic: "Transplant", pearl: "Tacrolimus target trough: 8–12 ng/mL in first 3 months, then 5–8 ng/mL. Higher targets increase nephrotoxicity; lower targets risk rejection.", url: "/DrugsDosing" },
    { topic: "Hypercalciuria", pearl: "Urine calcium/creatinine ratio >0.2 after age 2 years suggests hypercalciuria. Collect spot first morning urine — avoid high-calcium foods the prior day.", url: "/CalculatorsHub" },
    { topic: "FSGS", pearl: "In FSGS, tip lesion responds best to steroids. Collapsing variant carries worst prognosis. Genetic testing is strongly recommended in all pediatric FSGS.", url: "/ClinicalSupport" },
    { topic: "Dialysis Adequacy", pearl: "Kt/V ≥1.2 per session (HD) or ≥1.7/week (PD) is the minimum target. Always calculate — clinical symptoms alone underestimate inadequacy.", url: "/CalculatorsHub" },
  ],
  guidelines: [
    { org: "KDIGO 2024", condition: "AKI", text: "Volume resuscitation in AKI: use isotonic crystalloids as first-line. Avoid starches. Target MAP ≥65 mmHg (adults) or age-appropriate in children." },
    { org: "IPNA 2023", condition: "Nephrotic Syndrome", text: "First episode NS: prednisolone 60 mg/m²/day (max 60 mg) × 4 weeks, then 40 mg/m² alternate day × 4 weeks. Response defines steroid sensitivity." },
    { org: "KDIGO 2021", condition: "CKD", text: "BP target in children with CKD: <50th percentile or <130/80 mmHg. ACEi/ARB are first-line regardless of proteinuria status." },
    { org: "ESPN/ERKNet 2022", condition: "ADPKD", text: "Children with ADPKD should have annual BP measurement, urine ACR, and renal ultrasound from diagnosis. Tolvaptan is not approved <18 years." },
    { org: "AAP 2017", condition: "Hypertension", text: "Stage 1 HTN in children (BP 95th–99th+5 percentile): lifestyle modifications for 6 months before pharmacotherapy if asymptomatic and no end-organ damage." },
    { org: "ISPD 2022", condition: "Peritoneal Dialysis", text: "Peritonitis in PD: start empirical antibiotics covering both gram-positive (vancomycin) and gram-negative organisms. Culture-directed therapy within 48–72h." },
    { org: "KDIGO 2022", condition: "Glomerulonephritis", text: "IgA nephropathy with proteinuria >1 g/day despite 3 months optimised RAS blockade: consider immunosuppression. Tonsillectomy not routinely recommended." },
    { org: "PRINTO/PRES 2023", condition: "Lupus Nephritis", text: "Induction for ISN Class III/IV LN: low-dose IV cyclophosphamide (Euro-Lupus) is as effective as high-dose and preferred in children. Always add hydroxychloroquine." },
    { org: "SHARE 2020", condition: "Vasculitis", text: "ANCA vasculitis remission induction: rituximab is non-inferior to cyclophosphamide and preferred in young patients due to lower gonadotoxicity." },
    { org: "ESPGHAN 2022", condition: "Nutrition in CKD", text: "Children with CKD stage 3b+ should have dietary assessment every 3–6 months. Protein restriction is NOT recommended in children — prioritise adequate energy intake." },
    { org: "KDIGO 2017", condition: "Transplant", text: "Pre-transplant: avoid unnecessary sensitisation. DSA titres >3000 MFI with complement-activating ability correlate with higher rejection risk." },
    { org: "IPNA 2021", condition: "CAKUT", text: "VUR grades I–II in children with no febrile UTIs: antibiotic prophylaxis not routinely required. Grades III–V with febrile UTIs: prophylaxis indicated." },
    { org: "AAP 2021", condition: "UTI", text: "First febrile UTI in child >2 months: renal ultrasound. VCUG only if ultrasound abnormal or recurrent febrile UTIs. No prophylaxis after first episode." },
    { org: "KDIGO 2023", condition: "SRNS", text: "Children with steroid-resistant NS: genetic testing recommended before prolonged immunosuppression. Calcineurin inhibitors (tacrolimus) are first-line in non-genetic SRNS." },
    { org: "ESPN 2021", condition: "Alport Syndrome", text: "Alport syndrome: ACEi/ARB started early (when microalbuminuria detected) slows CKD progression even in males with X-linked disease. Genetic counselling mandatory." },
  ],
  challenges: [
    { vignette: "8-year-old girl, periorbital puffiness for 3 days, urine dipstick: protein 4+, blood nil. Serum albumin 18 g/L. No hematuria. C3 normal.", options: ["A. Minimal change disease", "B. Membranous nephropathy", "C. IgA nephropathy"], answer: 0, explanation: "Classic childhood NS with no hematuria, normal C3 = MCD until proven otherwise. Responds well to steroids.", link: "/ClinicalSupport" },
    { vignette: "10-year-old boy, gross hematuria 2 weeks after sore throat, BP 148/92, edema, low C3. Urine: RBC casts, protein 2+.", options: ["A. IgA nephropathy", "B. PSGN", "C. Alport syndrome"], answer: 1, explanation: "Post-streptococcal GN: latent period 2–3 weeks, low C3, RBC casts. IgA nephropathy presents <5 days after URTI.", link: "/ClinicalSupport" },
    { vignette: "6-year-old with polyuria, polydipsia, rickets on X-ray, serum phosphate 0.6 mmol/L, glycosuria with normal glucose, aminoaciduria.", options: ["A. Diabetes insipidus", "B. Fanconi syndrome", "C. Primary hyperaldosteronism"], answer: 1, explanation: "Generalised tubular dysfunction (phosphate, glucose, amino acids) = Fanconi syndrome. Check for Lowe, cystinosis, Wilson disease.", link: "/TubularDisordersHub" },
    { vignette: "12-year-old boy with sensorineural hearing loss, microhematuria, family history of CKD in males. Urine: dysmorphic RBCs, no proteinuria.", options: ["A. Thin basement membrane disease", "B. Alport syndrome", "C. IgA nephropathy"], answer: 1, explanation: "X-linked Alport: hematuria + SNHL + positive family history in males. COL4A5 mutation. Genetic testing + early ACEi.", link: "/RareDiseaseModule" },
    { vignette: "3-year-old girl, 2nd relapse NS, prednisolone 2 mg/kg/day × 4 weeks — no remission. Urine PCR 4.5 mg/mg. Family history: mother on dialysis at age 30.", options: ["A. Steroid-dependent NS", "B. Steroid-resistant NS — genetic testing", "C. FSGS — start cyclophosphamide"], answer: 1, explanation: "SRNS with family history: genetic testing first (NPHS1, NPHS2, WT1). Avoid prolonged IS without genetic diagnosis.", link: "/ClinicalSupport" },
    { vignette: "8y boy, serum K+ 2.8 mEq/L, metabolic alkalosis, BP 100/65, urine K+ 30 mEq/L, urine Ca 0.05 mg/mg (low). No medications.", options: ["A. Bartter syndrome", "B. Gitelman syndrome", "C. Primary aldosteronism"], answer: 1, explanation: "Gitelman: hypokalemia + alkalosis + LOW urinary calcium + hypomagnesemia. Bartter has hypercalciuria.", link: "/TubularDisordersHub" },
    { vignette: "5-year-old, 3 days oliguria after diarrhea, Hb 6.2 g/dL, platelets 28,000, creatinine 320 µmol/L, blood film: schistocytes.", options: ["A. ITP", "B. Hemolytic uremic syndrome", "C. TTP"], answer: 1, explanation: "Diarrhea-associated HUS (STEC): microangiopathic hemolytic anemia + thrombocytopenia + AKI. Avoid antibiotics.", link: "/EmergencyHub" },
  ],
  emergencies: [
    { scenario: "Severe Hyperkalemia (K+ >7 mEq/L + ECG changes)", steps: "① Calcium gluconate 10% — 0.5 mL/kg IV over 5–10 min (membrane stabilisation). ② Salbutamol nebulisation 2.5–5 mg. ③ Insulin 0.1 U/kg + dextrose 2 mL/kg 25%. ④ Sodium bicarbonate 1–2 mEq/kg if acidosis. ⑤ Consider dialysis if refractory.", url: "/EmergencyHub" },
    { scenario: "Severe Symptomatic Hyponatremia (Na <125 + seizures)", steps: "① 3% NaCl 2–3 mL/kg IV bolus over 10–15 min. Repeat once if seizures persist. ② Target: raise Na by 4–6 mEq/L acutely (not >10 mEq/L in 24h). ③ Identify underlying cause. ④ SIADH: fluid restrict.", url: "/EmergencyHub" },
    { scenario: "Hypertensive Emergency (BP >99th +12 mmHg + symptoms)", steps: "① IV labetalol 0.2 mg/kg bolus (max 40 mg) OR nicardipine infusion 0.5–3 µg/kg/min. ② Target: reduce MAP by max 25% in first hour. ③ Avoid rapid drops — risk of stroke/blindness.", url: "/HypertensiveEmergency" },
    { scenario: "Severe Hypocalcemia (Ca <1.75 mmol/L + tetany/seizures)", steps: "① Calcium gluconate 10% — 0.5 mL/kg slow IV over 10 min with cardiac monitoring. ② Repeat in 10 min if symptoms persist. ③ Start oral/IV calcium supplementation + calcitriol.", url: "/EmergencyHub" },
    { scenario: "Tumor Lysis Syndrome (post-chemotherapy)", steps: "① Aggressive IV hydration 3L/m²/day (no potassium). ② Allopurinol OR rasburicase (preferred if high uric acid). ③ Avoid phosphate binders containing calcium. ④ Monitor electrolytes every 4–6h. ⑤ Early nephrology consult.", url: "/EmergencyHub" },
    { scenario: "Peritoneal Dialysis Peritonitis", steps: "① Cloudy PD effluent = peritonitis until proven otherwise. ② Cell count: WBC >100 cells/µL (>50% neutrophils). ③ Add intraperitoneal vancomycin + gentamicin empirically. ④ Culture PD fluid. ⑤ Catheter removal if fungi or refractory.", url: "/EmergencyHub" },
    { scenario: "Flash Pulmonary Edema in CKD/ESRD", steps: "① Sit up, high-flow O2. ② IV furosemide 2–4 mg/kg if some residual function. ③ GTN sublingual/IV. ④ Urgent dialysis/ultrafiltration if anuric. ⑤ Avoid morphine in CKD.", url: "/EmergencyHub" },
  ],
  drugSpotlights: [
    { drug: "Tacrolimus", pearl: "CNI — inhibits calcineurin → IL-2 ↓. Target trough: 8–12 ng/mL (early transplant), 5–8 ng/mL (stable). Monitor levels weekly until stable. Main toxicities: nephrotoxicity, PTLD, new-onset diabetes.", link: "/DrugsDosing?drug=Tacrolimus" },
    { drug: "Prednisolone", pearl: "Synthetic glucocorticoid. IPNA NS protocol: 60 mg/m²/day × 4 weeks → 40 mg/m² alternate days × 4 weeks. Steroid side effects: hypertension, Cushingoid features, growth impairment, cataract — monitor all.", link: "/DrugsDosing?drug=Prednisolone" },
    { drug: "Furosemide", pearl: "Loop diuretic — inhibits NKCC2. Dose: 1–4 mg/kg/day PO or 0.5–1 mg/kg IV. Loses efficacy in GFR <15. Monitor electrolytes: hypokalemia, hyponatremia, ototoxicity (high-dose IV).", link: "/DrugsDosing?drug=Furosemide" },
    { drug: "Mycophenolate Mofetil", pearl: "Antimetabolite — inhibits IMPDH → purine synthesis ↓. Dose in SRNS/transplant: 600 mg/m²/dose BD (max 1g BD). Main SE: GI upset, leukopenia — check CBC monthly. Teratogenic — counsel female patients.", link: "/DrugsDosing?drug=Mycophenolate" },
    { drug: "Cyclophosphamide", pearl: "Alkylating agent. NS dose: 2 mg/kg/day × 8–12 weeks (max cumulative 168 mg/kg). Transplant induction: IV 500–750 mg/m²/pulse. Risk: hemorrhagic cystitis (ensure hydration), gonadotoxicity, leukopenia.", link: "/DrugsDosing?drug=Cyclophosphamide" },
    { drug: "Enalapril", pearl: "ACE inhibitor — first-line in CKD with proteinuria. Dose: 0.1–0.6 mg/kg/day OD (max 40 mg). Reduces proteinuria by 30–50%. Monitor K+ and creatinine at 2–4 weeks. Avoid in bilateral RAS.", link: "/DrugsDosing?drug=Enalapril" },
    { drug: "Amlodipine", pearl: "Dihydropyridine CCB — preferred pediatric antihypertensive. Dose: 0.1–0.3 mg/kg/day OD (max 10 mg). Safe in CKD, no dose adjustment needed. Side effects: peripheral edema, gingival hyperplasia.", link: "/DrugsDosing?drug=Amlodipine" },
    { drug: "Rituximab", pearl: "Anti-CD20 monoclonal antibody. Dose in SDNS/SRNS: 375 mg/m²/dose × 1–4 doses. Depletes B-cells for 6–9 months. Screen for Hepatitis B before starting. Risk: PML (rare), infusion reactions.", link: "/DrugsDosing?drug=Rituximab" },
    { drug: "Rasburicase", pearl: "Recombinant uricase — converts uric acid to allantoin. Dose: 0.2 mg/kg/day × 1–5 days for TLS prophylaxis/treatment. Works within hours. CONTRAINDICATED in G6PD deficiency — causes hemolysis.", link: "/DrugsDosing?drug=Rasburicase" },
    { drug: "Levamisole", pearl: "Immunomodulator used in FRNS. Dose: 2.5 mg/kg alternate days (max 150 mg). Main risk: agranulocytosis — check CBC monthly. Often used alongside low-dose prednisolone to maintain remission.", link: "/DrugsDosing?drug=Levamisole" },
    { drug: "Sodium Bicarbonate", pearl: "CKD metabolic acidosis: target serum bicarb ≥22 mEq/L. Oral dose: 1–3 mEq/kg/day in divided doses. IV: 1–2 mEq/kg slow infusion. High sodium load — monitor BP in HTN patients.", link: "/DrugsDosing" },
    { drug: "Calcitriol", pearl: "Active vitamin D (1,25-OH₂D₃). CKD-MBD dose: 0.01–0.05 µg/kg/day OD (max 0.25–0.5 µg/day). Monitor calcium weekly initially — risk of hypercalcemia. Target iPTH 2–9× upper normal for CKD stage.", link: "/DrugsDosing" },
  ],
  rareDiseases: [
    { disease: "Cystinosis", points: "• Fanconi syndrome in first year of life — glucosuria, aminoaciduria, phosphaturia, RTA\n• Diagnosis: leukocyte cystine levels >0.2 nmol/mg protein\n• Treatment: cysteamine slows progression dramatically — start early\n• Corneal crystals visible on slit-lamp — pathognomonic after age 2" },
    { disease: "Dent Disease", points: "• X-linked — CLCN5 or OCRL1 mutation\n• Low-molecular-weight proteinuria + hypercalciuria + nephrocalcinosis\n• Normal anion gap, no acidosis (unlike Fanconi)\n• No specific treatment — thiazide diuretics reduce urinary calcium" },
    { disease: "Fabry Disease", points: "• X-linked lysosomal storage — GLA mutation\n• Boys: angiokeratomas, acroparesthesia, corneal whorl, hypohidrosis by age 10\n• Girls: variable (may be as severe as boys)\n• Enzyme replacement: agalsidase alfa or beta — start early\n• Urine Gb3 and lyso-Gb3 are screening markers" },
    { disease: "Alport Syndrome", points: "• Defects in COL4A3/A4 (AR) or COL4A5 (X-linked)\n• Hematuria from birth, progressive CKD, SNHL, anterior lenticonus\n• X-linked males reach ESRD in 20s–30s without treatment\n• ACEi/ARB early (microalbuminuria stage) significantly slows progression\n• Genetic testing essential for family counselling" },
    { disease: "Lowe Syndrome (OCRL)", points: "• X-linked — OCRL1 mutation (shared with Dent type 2)\n• Triad: cataracts + intellectual disability + Fanconi syndrome\n• All males affected; carrier females have lens opacities\n• Renal progression to CKD by teenage years\n• No specific treatment; supportive Fanconi management" },
    { disease: "Bardet-Biedl Syndrome", points: "• Ciliopathy — multiple genes (BBS1–21+)\n• Rod-cone dystrophy, obesity, polydactyly, cognitive impairment, hypogonadism\n• Renal: structural anomalies, nephronophthisis pattern CKD\n• Regular renal imaging and function monitoring from diagnosis\n• Genetic counselling — autosomal recessive (with triallelic exceptions)" },
    { disease: "HNF1B Nephropathy", points: "• De novo deletion (17q12) most common\n• Renal cysts + MODY5 diabetes + hypomagnesemia + liver/pancreas abnormalities\n• MCDK or oligomeganephronia on prenatal ultrasound — check HNF1B\n• Magnesium supplementation; diabetes management\n• No specific renal treatment — monitor GFR closely" },
    { disease: "Nephronophthisis", points: "• Most common genetic cause of ESRD in children (NPHP1 most frequent)\n• Triad: polyuria, growth retardation, anemia disproportionate to CKD stage\n• Ultrasound: normal-sized/small kidneys, corticomedullary cysts (late)\n• Senior-Loken syndrome: NPHP + retinal degeneration\n• No specific treatment — CKD management, early transplant planning" },
  ],
  labPearls: [
    "Positive urine anion gap (Na+K−Cl) = impaired NH4+ excretion (distal RTA). Negative = extra-renal bicarbonate loss (diarrhea).",
    "Urine Ca/Cr ratio >0.2 mg/mg after age 2 = hypercalciuria. >0.8 in infants <7 months is normal.",
    "FENa <1% in oliguric AKI suggests prerenal cause. FENa >2% = intrinsic renal injury. Unreliable after diuretics — use FEurea instead.",
    "Serum bicarbonate <18 mEq/L in a CKD patient = metabolic acidosis requiring treatment. Target ≥22 mEq/L.",
    "Urine osmolality <100 mOsm/kg in polyuria = diabetes insipidus or primary polydipsia. >800 = concentrated — not DI.",
    "Complement C3 low + C4 normal: alternative pathway activation (MPGN type II, PSGN, aHUS). C3+C4 both low: classical pathway (SLE, SBE).",
    "TTKG >10 in hypokalemia = renal potassium wasting (hyperaldosteronism, Bartter/Gitelman). TTKG <3 = GI losses or inadequate intake.",
    "Serum cystatin C is a better GFR marker than creatinine in children — less influenced by muscle mass. Use CKiD2 equation.",
    "Urinary beta-2-microglobulin elevation = proximal tubular dysfunction. Use as marker of tubular disease in Fanconi syndrome monitoring.",
    "Fractional excretion of uric acid <5% with hyperuricemia suggests renal urate retention (ADTKD-UMOD, familial gout nephropathy).",
  ],
};

// Day-of-week topic themes
const DOW_THEMES = ["Nephrology Pearl", "Critical Care", "Electrolytes", "Rare Disease", "Pharmacology", "Diagnostic Challenge", "Guideline Update"];

// Seeded index picker — gives deterministic rotation based on date
function pickIndex(pool, seed) {
  return Math.abs(seed) % pool.length;
}

// Numeric seed from date string YYYY-MM-DD
function dateSeed(dateStr) {
  return parseInt(dateStr.replace(/-/g, ""), 10);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user?.role === 'admin') isAuthorized = true;
    } catch {
      isAuthorized = true; // scheduled call
    }

    if (!isAuthorized) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const today = new Date().toISOString().slice(0, 10);
    const seed = dateSeed(today);

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

    // ── Day-of-week rotation ──────────────────────────────────────────────────
    const dow = new Date(today).getDay(); // 0=Sun
    const todayTheme = DOW_THEMES[dow];

    // ── Deterministic content selection (rotates daily, ~30-day cycle) ────────
    const pearlIdx = pickIndex(CONTENT_POOLS.pearls, seed);
    const guidelineIdx = pickIndex(CONTENT_POOLS.guidelines, seed + 1);
    const challengeIdx = pickIndex(CONTENT_POOLS.challenges, seed + 2);
    const emergencyIdx = pickIndex(CONTENT_POOLS.emergencies, seed + 3);
    const drugIdx = pickIndex(CONTENT_POOLS.drugSpotlights, seed + 4);
    const rareIdx = pickIndex(CONTENT_POOLS.rareDiseases, seed + 5);
    const labPearlIdx = pickIndex(CONTENT_POOLS.labPearls, seed + 6);

    const pearl = CONTENT_POOLS.pearls[pearlIdx];
    const guideline = CONTENT_POOLS.guidelines[guidelineIdx];
    const challenge = CONTENT_POOLS.challenges[challengeIdx];
    const emergency = CONTENT_POOLS.emergencies[emergencyIdx];
    const drug = CONTENT_POOLS.drugSpotlights[drugIdx];
    const rareDisease = CONTENT_POOLS.rareDiseases[rareIdx];
    const labPearl = CONTENT_POOLS.labPearls[labPearlIdx];

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
      subject_line: `🩺 CliniCals Daily | ${todayTheme} — ${pearl.topic} Pearl • ${emergency.scenario.split("(")[0].trim()}`,
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

    // ── Email all subscribed users ────────────────────────────────────────────
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

      const correctAnswer = challenge.options[challenge.answer];

      const emailBody = `Dear Dr. ${u.full_name || 'Colleague'},

${summaryData.subject_line}
Today's Theme: ${todayTheme}
${today}

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

▶ Answer: ${correctAnswer}
${challenge.explanation}

━━━━━━━━━━━━━━━━━━━━━━━━
⚡ EMERGENCY MINUTE
━━━━━━━━━━━━━━━━━━━━━━━━
${emergency.scenario}
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