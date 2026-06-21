/**
 * Approach to Tubulopathy in Children — CIEE built-in (Engine 4).
 *
 * Sources:
 *  - Approach to Renal Tubular Acidosis in Children, Karnataka Paediatric
 *    Journal 2020.
 *  - Kermond R, Mallett A, McCarthy H. A clinical approach to tubulopathies in
 *    children and young adults. Pediatr Nephrol 2022. DOI 10.1007/s00467-022-05606-1.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner). Stratifies by
 * biochemical phenotype (acid–base, potassium, blood pressure), localises the
 * tubular segment, triggers targeted genetic testing where indicated, and
 * generates supplementation / disease-specific prescriptions with monitoring
 * and suppressor (safety) rules.
 */

export const TUBULOPATHY_GUIDELINE = {
  id: 'GS-TUBULOPATHY',
  guideline_name: 'Approach to Tubulopathy in Children (RTA · Fanconi · Bartter · Gitelman · NDI)',
  guideline_section: 'Phenotype → segment localisation → genetics → targeted therapy',
  issuing_body: 'Karnataka Paediatric Journal 2020 / Kermond et al., Pediatr Nephrol 2022',
  year: 2022,
  evidence_grade: 'B–X',
  recommendation_strength: 'Review / practice',
  doi: '10.1007/s00467-022-05606-1',
  pmid: null,
  reference: 'Karnataka Paediatric Journal 2020 (RTA); Kermond R, Mallett A, McCarthy H. Pediatr Nephrol 2022.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'Approach to Tubulopathy in Children',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'KPJ 2020 / Kermond Pediatr Nephrol 2022',
  year: 2022,
  doi: '10.1007/s00467-022-05606-1',
  pmid: null,
});

export const TUBULOPATHY_SOURCES = {
  'GS-TUB-B': mk('B', 'Review recommendation', 'Tubulopathy review (Kermond 2022)'),
  'GS-TUB-C': mk('C', 'Practice recommendation', 'RTA approach (KPJ 2020)'),
  'GS-TUB-X': mk('X', 'Practice point (ungraded)', 'Practice point'),
};

const B = 'GS-TUB-B';
const C = 'GS-TUB-C';
const X = 'GS-TUB-X';

export const TUBULOPATHY_PATHWAY = {
  entry: 'DN-01',
  nodes: {
    // ── Phase 1 — Presentation & baseline phenotype ───────────────────────
    'DN-01': {
      id: 'DN-01', type: 'QUESTION', critical: true, source: X,
      question: 'Does the child have features suggesting a tubulopathy?',
      detail: 'Screen for any of the following — a single positive feature triggers baseline biochemical evaluation:',
      points: [
        'Failure to thrive / growth failure / short stature',
        'Polyuria, polydipsia, recurrent dehydration without diarrhoea; salt craving',
        'Acidotic breathing or unexplained metabolic acidosis',
        'Rickets / bony deformity / unexplained hypophosphataemia',
        'Nephrocalcinosis or nephrolithiasis on imaging',
        'Hypokalaemia symptoms (weakness, hypotonia, abdominal distension, arrhythmia)',
        'Sensorineural hearing loss; ocular findings (corneal crystals, cataract, band keratopathy)',
        'Hypertension or hypotension disproportionate to clinical status',
      ],
      options: [
        { label: '≥1 feature present — evaluate', next: 'DN-02' },
        { label: 'No features — tubulopathy not suspected', next: 'TERM-NOSUSPECT', tone: 'muted' },
      ],
    },
    'DN-02': {
      id: 'DN-02', type: 'ASSESSMENT', critical: true, source: C,
      question: 'What is the baseline biochemical phenotype?',
      detail: 'Order the baseline panel below, then branch on the acid–base / potassium / sodium pattern.',
      investigations: [
        { test: 'Venous blood gas', detail: 'pH, HCO₃, pCO₂ — confirm and grade acid–base disturbance.' },
        { test: 'Electrolytes (Na, K, Cl) + anion gap', detail: 'Primary branch: hypoK acidosis vs hyperK acidosis vs alkalosis; AG = Na − (Cl + HCO₃).' },
        { test: 'Urea, creatinine + Schwartz eGFR', detail: 'Confirm normal GFR (RTA definition); stage CKD.' },
        { test: 'Calcium, magnesium, phosphate, uric acid, glucose, LFT', detail: 'Proximal tubulopathy / Fanconi screen; renin & aldosterone if hypoK or BP anomaly.' },
        { test: 'Urine dipstick (glucose, protein, pH) + Ca:Cr + PCR', detail: 'Freshly voided; paired urine & serum osmolality if a concentrating defect is suspected.' },
        { test: 'Kidney ultrasound', detail: 'Nephrocalcinosis, nephrolithiasis, hydronephrosis, CAKUT.' },
      ],
      options: [
        { label: 'Normal-AG (hyperchloraemic) metabolic acidosis', set: { phenotype: 'nagma' }, next: 'DN-03' },
        { label: 'Hypokalaemic metabolic alkalosis', set: { phenotype: 'alkalosis' }, next: 'DN-13' },
        { label: 'Hyperkalaemic metabolic acidosis', set: { phenotype: 'hyperk_acidosis' }, next: 'DN-12' },
        { label: 'Hypernatraemia + polyuria (concentrating defect)', set: { phenotype: 'concentrating' }, next: 'DN-17' },
        { label: 'Hyponatraemia (inappropriately concentrated urine)', set: { phenotype: 'hyponatraemia' }, next: 'DN-18' },
        { label: 'Isolated hypomagnesaemia', set: { phenotype: 'hypomag' }, next: 'DN-19' },
      ],
    },

    // ── Phase 2 — RTA evaluation ──────────────────────────────────────────
    'DN-03': {
      id: 'DN-03', type: 'ASSESSMENT', source: C,
      question: 'Confirm normal-anion-gap metabolic acidosis?',
      detail: 'Corrected AG = AG + 2.5 × (4.0 − albumin g/dL).',
      options: [
        { label: 'AG 8–12, high Cl, normal eGFR — NAGMA (RTA or diarrhoea)', next: 'DN-04' },
        { label: 'AG >12 — high-AG acidosis (NOT RTA)', next: 'TERM-NOT-RTA', tone: 'muted' },
        { label: 'eGFR <60 with acidosis — CKD-related', next: 'TERM-CKD-ACIDOSIS', tone: 'muted' },
      ],
    },
    'DN-04': {
      id: 'DN-04', type: 'ASSESSMENT', source: C,
      question: 'Urine anion gap — is renal acidification impaired?',
      detail: 'Urine AG = (Urine Na + Urine K) − Urine Cl. If urine pH >6.5, use the urine osmolal gap instead (urinary NH₄⁺ ≈ osmolal gap ÷ 2; >100 mOsm/kg = adequate excretion).',
      points: [
        'Negative urine AG = NH₄⁺ excreted with Cl⁻ = normal kidney response → non-renal cause (diarrhoea)',
        'Positive urine AG = NH₄⁺ not excreted = renal acidification defect → RTA',
      ],
      options: [
        { label: 'Negative urine AG — non-renal (diarrhoea)', next: 'TERM-DIARRHOEA', tone: 'muted' },
        { label: 'Positive urine AG — RTA confirmed', set: { rta: true }, next: 'DN-05' },
      ],
    },
    'DN-05': {
      id: 'DN-05', type: 'ASSESSMENT', critical: true, source: C,
      question: 'Differentiate the RTA type',
      detail: 'Primary branch point — Type I (distal) vs II (proximal/Fanconi) vs IV (hyperK) vs III (mixed, CA II):',
      points: [
        'Type I (distal): urine pH >5.5 (cannot acidify), low K, very low HCO₃, FE-HCO₃ <5%, ± nephrocalcinosis',
        'Type II (proximal/Fanconi): urine pH <5.5, low/normal K, HCO₃ 14–18, FE-HCO₃ >15%, ± glucosuria/aminoaciduria/phosphaturia',
        'Type IV (hyperK): HIGH potassium, urine pH usually <5.5 — aldosterone deficiency/resistance',
        'Type III (mixed): combined distal + proximal from carbonic anhydrase II deficiency',
      ],
      options: [
        { label: 'Type I — distal RTA', set: { rta_type: 'I' }, next: 'DN-06' },
        { label: 'Type II — proximal RTA / Fanconi', set: { rta_type: 'II' }, next: 'DN-07' },
        { label: 'Type IV — hyperkalaemic RTA', set: { rta_type: 'IV' }, next: 'DN-12', tone: 'danger' },
        { label: 'Type III — mixed (CA II deficiency)', set: { rta_type: 'III' }, next: 'DN-11' },
      ],
    },
    'DN-06': {
      id: 'DN-06', type: 'ACTION', source: C, prescribes: 'potassium citrate',
      action: 'Type I (distal) RTA — confirm, treat and screen for complications.',
      investigations: [
        { test: 'Confirmatory tests', detail: 'Urine pH >5.5 during systemic acidosis (hallmark); NH₄Cl loading 0.1 g/kg [contraindicated if HCO₃ <17]; or furosemide–fludrocortisone test; urine–blood pCO₂ <20 mmHg post-bicarbonate.' },
        { test: 'Urine calcium & citrate', detail: 'Hypercalciuria (spot Ca:Cr >0.2 in >2 y, or >4 mg/kg/day) and hypocitraturia (<2 mg/kg/day).' },
        { test: 'Renal ultrasound + audiogram', detail: 'Medullary nephrocalcinosis; sensorineural deafness (ATP6V1B1, ATP6V0A4, FOXI1).' },
      ],
      rx: { drug: 'Potassium citrate', dose: '4–6 mEq/kg/day (infants) or 2–4 mEq/kg/day (children) in divided doses — corrects acidosis, hypokalaemia and citraturia; sodium bicarbonate 2–4 mEq/kg/day if K-citrate unavailable', route: 'Oral', duration: 'Long-term' },
      monitoring: [
        { parameter: 'VBG + electrolytes', frequency: '1–3 months (active), then 3–6 months', target: 'HCO₃ ≥18, K ≥3.0 mEq/L', alert: 'HCO₃ <18 / K <3.0', alert_action: 'Escalate alkali / K dose' },
        { parameter: 'Urine Ca:Cr + renal US', frequency: 'Ca:Cr 3–6-monthly; US annually', target: 'Ca:Cr <0.2; no new calcification', alert: 'Hypercalciuria / nephrocalcinosis', alert_action: 'Increase fluids + citrate' },
      ],
      safety: [
        { title: 'Irreversible complications', detail: 'Nephrocalcinosis and sensorineural hearing loss are NOT reversed by alkali — screen annually. Citrate reduces new stones but does not dissolve existing deposits.' },
      ],
      next: 'DN-21',
    },
    'DN-07': {
      id: 'DN-07', type: 'ASSESSMENT', source: C,
      question: 'Type II RTA — isolated proximal RTA or full Fanconi syndrome?',
      detail: 'Proximal defect: HCO₃ threshold 14–18, FE-HCO₃ >15%, urine pH <5.5 (intact distal), urine–blood pCO₂ >20 mmHg.',
      points: [
        'Fanconi = generalised proximal wasting: glucosuria (normal glucose), aminoaciduria, LMW proteinuria (β2-microglobulin), phosphaturia (low TmP/GFR), hypouricaemia, salt wasting',
        'Isolated proximal RTA (rare, SLC4A4): bicarbonate wasting only ± ocular anomalies; no nephrocalcinosis',
      ],
      options: [
        { label: 'Isolated proximal RTA', set: { fanconi: false }, next: 'DN-08' },
        { label: 'Full Fanconi syndrome', set: { fanconi: true }, next: 'DN-09' },
      ],
    },
    'DN-08': {
      id: 'DN-08', type: 'ACTION', source: C, prescribes: 'sodium bicarbonate',
      action: 'Type II RTA / Fanconi — high-dose alkali + proximal solute replacement (bicarbonate is continuously wasted, so doses are far higher than in distal RTA).',
      rx: { drug: 'Bicarbonate (oral) + supplements', dose: 'Bicarbonate 10–15 mEq/kg/day in 3–4 doses; potassium citrate 1–5 mEq/kg/day; phosphate 20–40 mg/kg/day; calcitriol 20–40 ng/kg/day; sodium 3–5 mEq/kg/day and magnesium 25–50 mg/kg/day if wasting present', route: 'Oral', duration: 'Long-term' },
      monitoring: [
        { parameter: 'VBG + electrolytes + phosphate', frequency: 'Every 1–3 months until stable', target: 'HCO₃ ≥18; phosphate age-normal', alert: 'Phosphate <1.0 mmol/L / persistent acidosis', alert_action: 'Escalate phosphate / alkali dose' },
        { parameter: 'Urine calcium + renal US', frequency: '3–6 months; US annually', target: 'No nephrocalcinosis', alert: 'Hypercalciuria on calcitriol', alert_action: 'Adjust calcitriol; increase fluids' },
      ],
      safety: [
        { title: 'Proximal RTA needs high-dose alkali', detail: 'Standard distal-RTA doses (2–4 mEq/kg/day) are inadequate for proximal RTA — ongoing bicarbonate wasting requires 10–15 mEq/kg/day (SUP-05).' },
      ],
      next: 'DN-09',
    },
    'DN-09': {
      id: 'DN-09', type: 'ASSESSMENT', source: B,
      question: 'Identify the specific cause of Fanconi syndrome',
      detail: 'Hereditary and acquired causes — choose to surface targeted therapy:',
      points: [
        'Cystinosis (CTNS): infantile, corneal crystals by 18 mo, hypothyroid, ESRD by ~age 10 → cysteamine',
        'Dent 1 (CLCN5) / Dent 2 & Lowe (OCRL): X-linked, LMW proteinuria, hypercalciuria; Lowe → cataract/glaucoma/ID',
        'Wilson (ATP7B) → penicillamine/trientine + zinc; Tyrosinaemia I (FAH) → nitisinone; Galactosaemia (GALT) → diet',
        'Mitochondrial cytopathy → supportive + CoQ10; medication/toxin (tenofovir, valproate, ifosfamide, heavy metals) → remove agent',
      ],
      options: [
        { label: 'Cystinosis (corneal crystals / infantile / consanguinity)', set: { fanconi_cause: 'cystinosis' }, next: 'DN-09CYST' },
        { label: 'Other hereditary cause (Dent/Lowe/Wilson/tyrosinaemia/mito)', set: { fanconi_cause: 'hereditary' }, next: 'DN-21' },
        { label: 'Medication / toxin-induced', set: { fanconi_cause: 'drug' }, next: 'DN-21', tone: 'muted' },
      ],
    },
    'DN-09CYST': {
      id: 'DN-09CYST', type: 'ACTION', source: B, prescribes: 'cysteamine',
      action: 'Infantile nephropathic cystinosis (CTNS) — start cystine-depleting therapy immediately; it delays but does not prevent ESRD.',
      rx: { drug: 'Cysteamine (oral) + cysteamine eye drops', dose: 'Oral cysteamine titrated to target WBC cystine <1 nmol ½-cystine/mg protein; topical cysteamine eye drops for corneal crystals (mandatory, separate from oral)', route: 'Oral + topical', duration: 'Lifelong' },
      monitoring: [
        { parameter: 'WBC cystine level', frequency: 'Every 3 months on therapy', target: '<1 nmol ½-cystine/mg protein', alert: 'Above target', alert_action: 'Increase cysteamine dose' },
        { parameter: 'Thyroid function + ophthalmology', frequency: 'TFT from age 2; eyes every 12 months', target: 'Euthyroid; crystals controlled', alert: 'Hypothyroidism / progressive crystals', alert_action: 'Levothyroxine; intensify eye drops' },
      ],
      safety: [
        { title: 'Transplant planning', detail: 'ESRD is often reached by the end of the first decade — begin transplant counselling early (age 6–7).' },
      ],
      next: 'DN-08',
    },
    'DN-11': {
      id: 'DN-11', type: 'ACTION', source: C, prescribes: 'sodium bicarbonate',
      action: 'Type III RTA — carbonic anhydrase II (CA2) deficiency, a combined proximal + distal picture.',
      points: [
        'Classic triad: mixed RTA + osteopetrosis + cerebral calcification (autosomal recessive)',
        'Manage as proximal RTA (high-dose alkali) with monitoring for nephrocalcinosis and bony complications',
      ],
      rx: { drug: 'Bicarbonate + phosphate (as proximal RTA)', dose: 'Bicarbonate 10–15 mEq/kg/day in divided doses; phosphate 20–40 mg/kg/day if wasting', route: 'Oral', duration: 'Long-term' },
      next: 'DN-21',
    },
    'DN-12': {
      id: 'DN-12', type: 'ACTION', critical: true, source: C, prescribes: 'calcium polystyrene sulphonate',
      action: 'Type IV (hyperkalaemic) RTA — hyperkalaemia + acidosis + urine pH <5.5 from aldosterone deficiency/resistance.',
      points: [
        'Hereditary: congenital hypoaldosteronism; PHA1 (SCNN1B/G/D — severe; NR3C2 — mild); PHA2/Gordon (WNK1/4, KLHL3, CUL3 → hyperK + hypertension)',
        'Acquired (commonest in children): obstructive uropathy / reflux nephropathy / pyelonephritis (reversible pseudohypoaldosteronism)',
        'Drug-induced: trimethoprim, NSAIDs, CNIs, ACE-I, amiloride, spironolactone',
      ],
      rx: { drug: 'Potassium-lowering + alkali (± fludrocortisone)', dose: 'Stop K-containing meds/fluids; dietary K restriction; calcium polystyrene sulphonate 1 g/kg/day in 2–3 doses; sodium bicarbonate to correct acidosis; fludrocortisone 0.05–0.2 mg/day for congenital hypoaldosteronism', route: 'Oral', duration: 'Per cause' },
      monitoring: [
        { parameter: 'Serum potassium + VBG', frequency: '1–3 months (more often if unstable)', target: 'K <5.5 mEq/L; HCO₃ ≥18', alert: 'Hyperkalaemia', alert_action: 'Intensify K-lowering; ECG if K >6.5' },
      ],
      safety: [
        { title: 'No potassium-sparing diuretics', detail: 'Amiloride, spironolactone and triamterene are contraindicated in Type IV RTA — they worsen hyperkalaemia and risk arrhythmia (SUP-03).' },
      ],
      next: 'DN-21',
    },

    // ── Phase 3 — Hypokalaemic metabolic alkalosis ────────────────────────
    'DN-13': {
      id: 'DN-13', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Blood pressure direction in hypokalaemic alkalosis?',
      detail: 'Hypokalaemic metabolic alkalosis splits by blood pressure:',
      points: [
        'Low / normal BP → salt-losing tubular defect (Bartter or Gitelman)',
        'High BP → mineralocorticoid excess (Liddle / AME / familial hyperaldosteronism)',
      ],
      options: [
        { label: 'Hypo/normotension — salt wasting', set: { bp: 'low' }, next: 'DN-14' },
        { label: 'Hypertension — mineralocorticoid excess', set: { bp: 'high' }, next: 'DN-16', tone: 'danger' },
      ],
    },
    'DN-14': {
      id: 'DN-14', type: 'ASSESSMENT', source: B,
      question: 'Bartter vs Gitelman?',
      detail: 'Both show secondary hyperaldosteronism with low/normal BP:',
      points: [
        'Bartter: antenatal–infantile onset, urine calcium HIGH, Mg normal/mildly low, nephrocalcinosis common, TAL defect (SLC12A1/KCNJ1/CLCNKB/BSND/MAGED2)',
        'Gitelman: late childhood–adolescence, urine calcium LOW (hypocalciuria, hallmark), Mg SIGNIFICANTLY low, no nephrocalcinosis, DCT defect (SLC12A3)',
      ],
      options: [
        { label: 'Bartter syndrome', set: { dx: 'bartter' }, next: 'DN-15' },
        { label: 'Gitelman syndrome', set: { dx: 'gitelman' }, next: 'DN-15B' },
      ],
    },
    'DN-15': {
      id: 'DN-15', type: 'ACTION', source: B, prescribes: 'indomethacin',
      action: 'Bartter syndrome — electrolyte replacement + prostaglandin inhibition (subtype guides prognosis; e.g. BS-IVa/b with deafness, BS-V transient).',
      rx: { drug: 'Indomethacin (+ electrolytes)', dose: 'Indomethacin 1–3 mg/kg/day (or celecoxib); potassium supplements (high dose); sodium chloride 2–5 mEq/kg/day; magnesium if low; amiloride as K-sparing adjunct', route: 'Oral', duration: 'Long-term' },
      monitoring: [
        { parameter: 'Electrolytes + growth', frequency: 'K/Mg every 3 months; growth every 3–6 months', target: 'Symptom control & growth (normal K may be unachievable)', alert: 'Growth failure / severe hypokalaemia', alert_action: 'Dietetics ± gastrostomy; escalate replacement' },
      ],
      safety: [
        { title: 'NSAID cautions', detail: 'Prostaglandin inhibitors risk GI ulceration and CKD progression with long-term use — give GI protection and monitor renal function.' },
      ],
      next: 'DN-21',
    },
    'DN-15B': {
      id: 'DN-15B', type: 'ACTION', source: B, prescribes: 'magnesium',
      action: 'Gitelman syndrome — magnesium and potassium replacement with liberal salt; amiloride as a potassium/magnesium-sparing adjunct.',
      rx: { drug: 'Magnesium + potassium + amiloride', dose: 'MgO/MgCl₂ 10–20 mg/kg/day elemental Mg in divided doses (titrate to Mg >0.7 mEq/L); slow-release KCl; liberal salt; amiloride (or spironolactone) to reduce renal K/Mg wasting', route: 'Oral', duration: 'Long-term' },
      monitoring: [
        { parameter: 'Serum K + Mg', frequency: 'Every 3 months', target: 'K >3.0; Mg >0.7 mEq/L', alert: 'Tetany / arrhythmia / symptomatic hypoMg', alert_action: 'IV magnesium; escalate oral dose' },
        { parameter: 'Blood pressure', frequency: 'Every visit (into adult life)', target: 'Age-appropriate', alert: 'Secondary hypertension in adulthood', alert_action: 'Reassess; treat' },
      ],
      next: 'DN-21',
    },
    'DN-16': {
      id: 'DN-16', type: 'ASSESSMENT', source: B,
      question: 'Mineralocorticoid excess — Liddle vs AME vs familial hyperaldosteronism?',
      detail: 'All present with hypokalaemia + alkalosis + hypertension:',
      points: [
        'Liddle (SCNN1A/B, ENaC gain-of-function): aldosterone & renin LOW → amiloride/triamterene (NOT spironolactone)',
        'AME (HSD11B2): low aldo & renin; licorice history → dexamethasone + amiloride',
        'Familial hyperaldosteronism I/GRA (CYP11B1/B2 chimera): aldo HIGH, renin low → low-dose dexamethasone; FH-2 → spironolactone/adrenalectomy',
      ],
      options: [
        { label: 'Liddle syndrome', set: { dx: 'liddle' }, next: 'DN-16L' },
        { label: 'Apparent mineralocorticoid excess (AME)', set: { dx: 'ame' }, next: 'DN-16AME' },
        { label: 'Familial hyperaldosteronism (GRA)', set: { dx: 'gra' }, next: 'DN-16FH' },
      ],
    },
    'DN-16L': {
      id: 'DN-16L', type: 'ACTION', source: B, prescribes: 'amiloride',
      action: 'Liddle syndrome — directly close the overactive ENaC channel.',
      rx: { drug: 'Amiloride (or triamterene)', dose: 'Amiloride titrated to BP and potassium', route: 'Oral', duration: 'Long-term' },
      safety: [
        { title: 'Spironolactone ineffective', detail: 'Liddle syndrome is aldosterone-independent ENaC activation — spironolactone has no effect; only amiloride/triamterene work (SUP-04).' },
      ],
      next: 'DN-21',
    },
    'DN-16AME': {
      id: 'DN-16AME', type: 'ACTION', source: B, prescribes: 'dexamethasone',
      action: 'Apparent mineralocorticoid excess — suppress cortisol-driven MR activation.',
      rx: { drug: 'Dexamethasone + amiloride', dose: 'Low-dose dexamethasone with amiloride; avoid licorice', route: 'Oral', duration: 'Long-term' },
      next: 'DN-21',
    },
    'DN-16FH': {
      id: 'DN-16FH', type: 'ACTION', source: B, prescribes: 'dexamethasone',
      action: 'Familial hyperaldosteronism type 1 (glucocorticoid-remediable aldosteronism).',
      rx: { drug: 'Low-dose dexamethasone', dose: 'Lowest dose controlling BP and potassium', route: 'Oral', duration: 'Long-term' },
      next: 'DN-21',
    },

    // ── Phase 4 — Sodium & water handling ─────────────────────────────────
    'DN-17': {
      id: 'DN-17', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Hypernatraemia + polyuria — NDI vs central DI?',
      detail: 'Serum hyperosmolar (>295) + urine hypo-osmolar (<300) = failure to concentrate. A DDAVP trial MUST be done before labelling NDI.',
      points: [
        'NDI: NO response to DDAVP (ADH-resistant); AVPR2 (X-linked, ~90%) or AQP2',
        'Central DI: responds to DDAVP (pituitary AVP deficiency)',
      ],
      options: [
        { label: 'No DDAVP response — nephrogenic DI', set: { dx: 'ndi' }, next: 'DN-17NDI' },
        { label: 'DDAVP response — central DI', set: { dx: 'cdi' }, next: 'DN-17CDI' },
      ],
    },
    'DN-17NDI': {
      id: 'DN-17NDI', type: 'ACTION', source: B, prescribes: 'hydrochlorothiazide',
      action: 'Nephrogenic diabetes insipidus — ensure free water, reduce solute load, and lower urine volume pharmacologically.',
      rx: { drug: 'Hydrochlorothiazide (± indomethacin)', dose: 'Hydrochlorothiazide 1–2 mg/kg/day (paradoxically reduces urine output ~50%); add indomethacin for further reduction (with GI caution); unrestricted free-water access; low-solute diet', route: 'Oral', duration: 'Long-term' },
      monitoring: [
        { parameter: 'Serum Na + osmolality', frequency: 'Every 1–3 months', target: 'Normonatraemia', alert: 'Hypernatraemic dehydration', alert_action: 'Ensure fluid access; school/care plan' },
      ],
      safety: [
        { title: 'DDAVP is ineffective in NDI', detail: 'NDI is ADH-resistant — do NOT prescribe DDAVP; it has no effect and may delay correct management (SUP-06).' },
      ],
      next: 'DN-21',
    },
    'DN-17CDI': {
      id: 'DN-17CDI', type: 'ACTION', source: B, prescribes: 'desmopressin',
      action: 'Central diabetes insipidus — replace ADH.',
      rx: { drug: 'Desmopressin (DDAVP)', dose: 'Intranasal or oral DDAVP titrated to urine output and serum sodium', route: 'Intranasal / Oral', duration: 'Per cause' },
      next: 'DN-21',
    },
    'DN-18': {
      id: 'DN-18', type: 'ASSESSMENT', source: B,
      question: 'Hyponatraemia with inappropriately concentrated urine — SIADH vs NSIAD?',
      detail: 'Serum hypo-osmolar (<280) + urine >100 mOsm/kg:',
      points: [
        'SIADH (acquired): ADH elevated; CNS/respiratory illness, post-operative, inflammatory → fluid restriction, treat cause',
        'NSIAD (genetic): AVPR2 gain-of-function (X-linked), ADH-independent → fluid restriction; urea or vaptans (limited paediatric data)',
      ],
      options: [
        { label: 'SIADH (acquired)', set: { dx: 'siadh' }, next: 'DN-20' },
        { label: 'NSIAD (genetic)', set: { dx: 'nsiad' }, next: 'DN-21' },
      ],
    },

    // ── Phase 5 — Isolated hypomagnesaemia ────────────────────────────────
    'DN-19': {
      id: 'DN-19', type: 'ASSESSMENT', source: B, prescribes: 'magnesium',
      action: 'Isolated hypomagnesaemia — classify by urinary calcium.',
      points: [
        'High urine Ca (hypercalciuria + nephrocalcinosis) → FHHNC (CLDN16/CLDN19): Mg supplements + thiazide + citrate',
        'Normal urine Ca → TRPM6 (familial hypomagnesaemia with hypocalcaemia): high-dose Mg, IV if acute',
        'Low urine Ca (hypocalciuria) → Gitelman / EAST spectrum: treat as Gitelman (Mg + K)',
      ],
      rx: { drug: 'Magnesium replacement', dose: 'Oral Mg (MgO/MgCl₂) titrated to serum Mg; IV magnesium if tetany/arrhythmia', route: 'Oral / IV', duration: 'Long-term' },
      next: 'DN-21',
    },

    // ── Phase 8 — Genetic testing (conditional) ───────────────────────────
    'DN-21': {
      id: 'DN-21', type: 'QUESTION', critical: true, source: B,
      question: 'Is genetic testing indicated?',
      detail: 'Diagnostic yield in paediatric tubulopathies is high — but test selectively. Favour testing when:',
      points: [
        'Age at onset <2 years',
        'Positive family history / consanguinity',
        'Extrarenal features (eyes, hearing, CNS, liver)',
        'X-linked pattern (males ± maternal-line relatives) — Dent, Lowe, NDI (AVPR2), NSIAD',
        'Non-response to standard treatment (reconsider diagnosis)',
      ],
      options: [
        { label: 'Yes — meets an indication', next: 'DN-22' },
        { label: 'No indication now — proceed to monitoring', next: 'DN-20', tone: 'muted' },
      ],
    },
    'DN-22': {
      id: 'DN-22', type: 'ACTION', source: B,
      action: 'Genetic testing method selection.',
      points: [
        'Targeted NGS renal-tubulopathy panel — first choice (>50 genes; high yield; cost-effective)',
        'Clinical exome / Mendeliome if the panel is non-diagnostic',
        'Whole exome sequencing for novel gene discovery; Sanger to confirm a variant / parental segregation',
        'Mitochondrial DNA sequencing if a mitochondrial cytopathy is suspected',
      ],
      safety: [
        { title: 'Pre-test requirements', detail: 'Informed consent and genetic counselling (family planning, insurance implications); document ethnic background (population-specific variants).' },
      ],
      next: 'DN-23',
    },
    'DN-23': {
      id: 'DN-23', type: 'ASSESSMENT', source: B,
      question: 'Post-genetic-result action',
      options: [
        { label: 'Pathogenic / likely pathogenic — confirm & activate targeted therapy + cascade testing', next: 'DN-20' },
        { label: 'VUS — treat per phenotype; reclassify at 12–24 months', next: 'DN-20', tone: 'muted' },
        { label: 'Negative — treat clinically; re-test with updated panel in 2–3 years', next: 'DN-20', tone: 'muted' },
      ],
    },

    // ── Phase 6 — Long-term monitoring ────────────────────────────────────
    'DN-20': {
      id: 'DN-20', type: 'MONITORING', source: C,
      action: 'Structured long-term monitoring schedule.',
      monitoring: [
        { parameter: 'Electrolytes, HCO₃, pH (VBG)', frequency: '1–3 months (active), 3–6 months (stable)', target: 'HCO₃ ≥18; K ≥3.0 mEq/L', alert: 'HCO₃ <18 / K <3.0', alert_action: 'Escalate alkali / potassium dose' },
        { parameter: 'Creatinine / eGFR (Schwartz)', frequency: 'Every 3–6 months', target: 'Stable eGFR', alert: 'eGFR fall >20% or <60', alert_action: 'Review nephrotoxins; nephrology' },
        { parameter: 'Calcium, phosphate, ALP', frequency: 'Every 3–6 months', target: 'Age-normal', alert: 'Phosphate <1.0 mmol/L; high ALP (rickets)', alert_action: 'Escalate phosphate / calcitriol' },
        { parameter: 'Urine Ca:Cr + renal ultrasound', frequency: 'Ca:Cr 3–6-monthly; US annually', target: 'Ca:Cr <0.2; no new calcification', alert: 'Hypercalciuria / nephrocalcinosis', alert_action: 'Increase fluids + citrate' },
        { parameter: 'Growth (height, weight, velocity, BMI)', frequency: 'Every 3–6 months', target: 'Height velocity ≥ age norm', alert: 'Velocity <2 cm/year', alert_action: 'Dietetics; review acidosis control' },
        { parameter: 'Serum magnesium', frequency: 'Every 3 months (GS, BS III/IVa, FHHNC)', target: 'Mg >0.7 mEq/L', alert: 'Mg <0.6 / tetany', alert_action: 'IV Mg; escalate oral dose' },
        { parameter: 'Hearing (audiogram/BERA)', frequency: 'Baseline + annual (ATP6V1B1/ATP6V0A4/FOXI1; BS IVa/IVb)', target: 'Stable hearing', alert: 'Deterioration', alert_action: 'ENT; cochlear implant assessment' },
        { parameter: 'WBC cystine (cystinosis only)', frequency: 'Every 3 months on cysteamine', target: '<1 nmol ½-cystine/mg protein', alert: 'Above target', alert_action: 'Increase cysteamine' },
        { parameter: 'Blood pressure', frequency: 'Every visit', target: 'Age-appropriate', alert: 'Hypertension / hypotension', alert_action: 'Investigate MR excess / check salt replacement' },
      ],
      next: 'DN-24',
    },

    // ── Phase 9 — Supportive care (all patients) ──────────────────────────
    'DN-24': {
      id: 'DN-24', type: 'ACTION', source: X,
      action: 'Multidisciplinary supportive care (all tubulopathy patients).',
      care: [
        { category: 'Nutrition', detail: 'Early dietitian; high caloric-density diet (polyuria/polydipsia limit intake); potassium-rich foods (GS/BS), phosphorus-rich foods (Fanconi); gastrostomy if growth failure persists.' },
        { category: 'Growth & bone', detail: 'Height/weight/velocity each visit; endocrinology if velocity <2 cm/year with good control; calcitriol 20–40 ng/kg/day + phosphate for Fanconi rickets.' },
        { category: 'Stone prevention', detail: 'High fluid intake (2–3 L/m²/day in dRTA, FHHNC, Dent); potassium/sodium citrate; avoid dehydration; school fluid-access plan.' },
        { category: 'Immunisation', detail: 'Review annually; avoid live vaccines during immunosuppression where relevant.' },
        { category: 'Surveillance & transition', detail: 'eGFR annually from age 5 (or diagnosis); early transplant planning in cystinosis; written transition plan from age 16 to adult nephrology.' },
        { category: 'Psychosocial', detail: 'Rare-disease support; psychology for complex cases; patient registries / support groups.' },
      ],
      next: 'TERM-DONE',
    },

    // ── Terminals ─────────────────────────────────────────────────────────
    'TERM-NOSUSPECT': { id: 'TERM-NOSUSPECT', type: 'TERMINAL', source: X, action: 'Tubulopathy not suspected at this time — reassess if features develop.' },
    'TERM-NOT-RTA': { id: 'TERM-NOT-RTA', type: 'TERMINAL', source: C, action: 'High-anion-gap metabolic acidosis — not RTA. Evaluate for inborn errors of metabolism, lactic acidosis, toxins.' },
    'TERM-CKD-ACIDOSIS': { id: 'TERM-CKD-ACIDOSIS', type: 'TERMINAL', source: C, action: 'CKD-related acidosis (eGFR <60) — not primary RTA. Treat with bicarbonate supplementation and manage CKD.' },
    'TERM-DIARRHOEA': { id: 'TERM-DIARRHOEA', type: 'TERMINAL', source: C, action: 'Negative urine anion gap — non-renal cause (diarrhoea most likely). Treat the gastrointestinal losses.' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: X, action: 'Tubulopathy management plan generated — diagnosis, targeted therapy, monitoring schedule and supportive care recorded.' },
  },
};

export const TUBULOPATHY_ENGINE = {
  id: 'tubulopathy-engine',
  label: 'Approach to Tubulopathy Engine',
  desc: 'Paediatric tubulopathy — phenotype-driven approach: RTA types I–IV, Fanconi syndrome (cystinosis, Dent/Lowe, Wilson, tyrosinaemia), Bartter & Gitelman, mineralocorticoid excess (Liddle/AME/GRA), nephrogenic DI, SIADH/NSIAD and isolated hypomagnesaemia — with targeted genetics, supplementation/disease-specific dosing, monitoring & suppressor safety rules',
  group: 'Tubular & Metabolic',
  builtin: true,
  guideline_source: TUBULOPATHY_GUIDELINE,
  ciee_sources: TUBULOPATHY_SOURCES,
  ciee_pathway: TUBULOPATHY_PATHWAY,
};
