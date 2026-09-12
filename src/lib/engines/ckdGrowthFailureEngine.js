/**
 * Growth Failure in CKD Intelligence Engine — CIEE built-in.
 * Source: KDIGO 2008 (Nutrition in CKD) · KDOQI 2020 (Pediatric Nutrition) ·
 * GH Consensus Guidelines 2009 (rhGH in CKD) · ISPN 2023.
 *
 * Decision pathway:
 *  - Growth assessment (height velocity, Z-score)
 *  - Nutritional evaluation (energy, protein, micronutrients)
 *  - Correct reversible causes (acidosis, electrolyte imbalance, anemia)
 *  - rhGH candidacy assessment
 *  - rhGH initiation & monitoring
 *  - Dialysis-specific growth optimization
 *  - Transplant & catch-up growth
 *  - Monitoring schedule
 */

export const CGF_GUIDELINE = {
  id: 'GS-KDOQI-2020-CGF',
  guideline_name: 'KDOQI 2020 — Growth Failure in CKD',
  guideline_section: 'Nutrition · rhGH · Monitoring',
  issuing_body: 'KDOQI · KDIGO · ISPN',
  year: 2020,
  evidence_grade: '1A–2D',
  recommendation_strength: 'GRADE',
  doi: null,
  pmid: null,
  reference: 'KDOQI Clinical Practice Guideline for Nutrition in CKD: 2020 Update. Am J Kidney Dis 2020;76(3):S1–S107.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'KDOQI 2020 — Growth Failure in CKD',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'KDOQI · KDIGO · ISPN',
  year: 2020, doi: null, pmid: null,
});

export const CGF_SOURCES = {
  'GS-KDOQI-2020-1A': mk('1A', 'Strong recommendation', 'High quality (grade 1A)'),
  'GS-KDOQI-2020-1B': mk('1B', 'Strong recommendation', 'Moderate quality (grade 1B)'),
  'GS-KDOQI-2020-1C': mk('1C', 'Strong recommendation', 'Low quality (grade 1C)'),
  'GS-KDOQI-2020-2C': mk('2C', 'Weak recommendation', 'Low quality (grade 2C)'),
  'GS-KDOQI-2020-2D': mk('2D', 'Weak recommendation', 'Very low quality (grade 2D)'),
  'GS-KDOQI-2020-PP': mk('PP', 'Practice point (ungraded)', 'Practice point'),
};

const A = 'GS-KDOQI-2020-1A';
const B = 'GS-KDOQI-2020-1B';
const C = 'GS-KDOQI-2020-1C';
const W2C = 'GS-KDOQI-2020-2C';
const W2D = 'GS-KDOQI-2020-2D';
const PP = 'GS-KDOQI-2020-PP';

export const CGF_PATHWAY = {
  entry: 'GF-01',
  nodes: {
    // ── Phase 1 — Growth assessment ──────────────────────────────────────
    'GF-01': {
      id: 'GF-01', type: 'ACTION', source: A,
      action: 'Growth assessment in CKD: (1) Accurate height (stadiometer ×3, average) and weight. (2) Plot on WHO/IAP growth chart for age and sex. (3) Calculate height Z-score (SDS). (4) Measure height velocity over ≥6 months (ideally 12 months). (5) Calculate mid-parental height and target range. (6) Bone age (left hand X-ray) if short stature. (7) Head circumference in <3 years. Growth failure = height <3rd percentile OR height velocity <25th percentile for age OR height Z-score declining.',
      monitoring: [
        { parameter: 'Height', frequency: 'Every 3 months', target: 'Height Z-score stable or improving', alert: 'Height Z-score declining by ≥0.5', alert_action: 'Escalate to nutritional + rhGH evaluation' },
        { parameter: 'Height velocity', frequency: 'Annually (over 6–12 mo)', target: '>25th percentile for age', alert: 'Height velocity <25th percentile', alert_action: 'Investigate and treat growth failure' },
      ],
      next: 'GF-02',
    },

    // ── Phase 2 — Severity of growth failure ──────────────────────────────
    'GF-02': {
      id: 'GF-02', type: 'QUESTION', critical: true, source: A,
      question: 'What is the severity of growth failure?',
      detail: 'Mild = height Z-score between -2 and -3 (3rd to 0.1st percentile). Moderate = height Z-score between -3 and -4. Severe = height Z-score < -4 or height velocity <10th percentile despite nutritional optimization. Severe growth failure warrants urgent rhGH evaluation.',
      options: [
        { label: 'Mild (Z-score -2 to -3)', set: { severity: 'mild' }, next: 'GF-03' },
        { label: 'Moderate (Z-score -3 to -4)', set: { severity: 'moderate' }, next: 'GF-03' },
        { label: 'Severe (Z-score < -4 or velocity <10th %ile)', set: { severity: 'severe' }, next: 'GF-03' },
      ],
    },

    // ── Phase 3 — Nutritional evaluation ─────────────────────────────────
    'GF-03': {
      id: 'GF-03', type: 'ACTION', source: A,
      action: 'Nutritional evaluation (FIRST-LINE before rhGH): (1) 3-day food diary — calculate energy (kcal/kg/day) and protein (g/kg/day) intake against RDA for age. (2) Assess for anorexia, vomiting, reflux (CKD-related). (3) Check albumin, prealbumin, transferrin (nutritional markers). (4) Calculate BMI Z-score. (5) Dialysis patients: assess residual renal function, dialysis adequacy (Kt/V), and protein losses (PD loses 5–15 g protein/day). (6) Oral intake targets: energy 100% RDA for height-age; protein 100–140% RDA (higher in dialysis). If intake <80% RDA → nutritional intervention.',
      monitoring: [
        { parameter: 'Energy intake (kcal/kg/day)', frequency: 'At each visit', target: '≥100% RDA for height-age', alert: '<80% RDA', alert_action: 'Dietitian referral, oral supplements, tube feeding if needed' },
        { parameter: 'Protein intake (g/kg/day)', frequency: 'At each visit', target: 'CKD:100% · PD:140% · HD:120% RDA', alert: 'Below target', alert_action: 'Protein supplementation, adjust dialysis' },
      ],
      next: 'GF-04',
    },

    // ── Phase 4 — Reversible causes ───────────────────────────────────────
    'GF-04': {
      id: 'GF-04', type: 'QUESTION', critical: true, source: B,
      question: 'Are reversible causes of growth failure addressed?',
      detail: 'Before considering rhGH, correct ALL reversible factors: (1) Metabolic acidosis (bicarbonate <22) — give sodium bicarbonate to target 22–26. (2) Anaemia (Hb <11) — iron + ESA. (3) CKD-MBD (high/low Ca, high Ph, high/low PTH) — per CKD-MBD engine. (4) Fluid overload/electrolyte imbalance. (5) Inadequate dialysis (Kt/V <1.2 in HD, <1.7 in PD). (6) Infection/inflammation. (7) Steroid therapy (minimize dose/frequency).',
      options: [
        { label: 'Yes — all reversible causes corrected', set: { corrected: true }, next: 'GF-05' },
        { label: 'No — reversible causes still present', set: { corrected: false }, next: 'GF-04A' },
      ],
    },
    'GF-04A': {
      id: 'GF-04A', type: 'ACTION', source: B,
      action: 'Correct reversible causes: (1) Acidosis → sodium bicarbonate 1–3 mEq/kg/day to target bicarbonate 22–26. (2) Anaemia → iron (IV iron in dialysis) + ESA to target Hb 10–11.5. (3) CKD-MBD → optimize Ca, Ph, iPTH per CKD-MBD engine. (4) Dialysis adequacy → increase Kt/V (HD ≥1.2, PD ≥1.7). (5) Minimize steroids — steroid-sparing immunosuppression in transplant/nephrotic syndrome. (6) Treat infection. Reassess growth after 3–6 months of correction.',
      next: 'GF-05',
    },

    // ── Phase 5 — rhGH candidacy ──────────────────────────────────────────
    'GF-05': {
      id: 'GF-05', type: 'QUESTION', critical: true, source: B,
      question: 'Does the child meet criteria for recombinant human growth hormone (rhGH) therapy?',
      detail: 'rhGH criteria in CKD: (1) Age ≥6 months (or younger if severe). (2) Height <3rd percentile OR height velocity <25th percentile. (3) CKD stage G2–G5 (including dialysis). (4) Nutritional optimization attempted for 3–6 months. (5) All reversible causes corrected. (6) No active malignancy. (7) No uncontrolled diabetes. (8) No severe skeletal dysplasia. (9) Transplant patients: off steroids or on minimal dose.',
      options: [
        { label: 'Yes — meets rhGH criteria', set: { rhgh_candidate: true }, next: 'GF-06' },
        { label: 'No — does not meet criteria yet', set: { rhgh_candidate: false }, next: 'TERM-NUTRITION' },
      ],
    },

    // ── Phase 6 — rhGH pre-treatment workup ────────────────────────────────
    'GF-06': {
      id: 'GF-06', type: 'ACTION', source: B,
      action: 'rhGH pre-treatment workup: (1) Confirm growth failure persists after 3–6 months of nutritional optimization. (2) Baseline: IGF-1, IGFBP-3, thyroid function (TSH, free T4 — hypothyroidism impairs GH response), bone age (left hand X-ray), pituitary MRI (exclude tumour), fasting glucose/insulin. (3) Exclude GH deficiency (stimulation test) if short stature disproportionate to CKD. (4) Echocardiogram (baseline LV mass). (5) Hip X-ray (SCFE risk — GH can precipitate). (6) Counsel family: daily SC injections, cost, expected response (4–8 cm/year in first year), long-term commitment.',
      monitoring: [
        { parameter: 'Thyroid function (TSH, fT4)', frequency: 'Before rhGH, then 6-monthly', target: 'Normal', alert: 'Hypothyroidism', alert_action: 'Treat before rhGH (levothyroxine)' },
        { parameter: 'Fasting glucose / HbA1c', frequency: 'Before rhGH, then 6-monthly', target: 'Normal', alert: 'Hyperglycemia / impaired glucose tolerance', alert_action: 'Endocrine consult, consider metformin' },
      ],
      next: 'GF-07',
    },

    // ── Phase 7 — rhGH initiation ──────────────────────────────────────────
    'GF-07': {
      id: 'GF-07', type: 'ACTION', source: B, prescribes: 'somatropin',
      action: 'rhGH (somatropin) initiation: dose 28 IU/m²/week (0.05 mg/kg/day) SC daily at bedtime. Higher dose may be needed in dialysis (0.06–0.07 mg/kg/day) due to GH resistance. Use pen device for accurate dosing. Expected response: 4–8 cm in first year (best in younger children and pre-pubertal). Continue until final height achieved or transplant. If transplant: stop rhGH at transplant, reassess after 3 months (catch-up growth may occur without rhGH).',
      monitoring: [
        { parameter: 'Height velocity', frequency: 'Every 3 months', target: 'Increase by ≥2 cm/year above baseline', alert: 'No response after 6 months', alert_action: 'Check adherence, IGF-1, consider dose increase, re-evaluate' },
        { parameter: 'IGF-1', frequency: 'Every 6 months', target: 'Rising (indicates compliance + response)', alert: 'IGF-1 not rising', alert_action: 'Check adherence, consider dose increase' },
        { parameter: 'Glucose / HbA1c', frequency: 'Every 6 months', target: 'Normal', alert: 'Hyperglycemia', alert_action: 'Endocrine consult, consider dose reduction' },
        { parameter: 'Hip (SCFE screen)', frequency: 'Clinical at each visit, X-ray if symptomatic', target: 'No hip/knee pain', alert: 'Hip or knee pain', alert_action: 'Stop rhGH, orthopaedic evaluation, X-ray' },
        { parameter: 'Intracranial pressure (headache, papilloedema)', frequency: 'Clinical at each visit', target: 'No symptoms', alert: 'Headache, vomiting, papilloedema', alert_action: 'Stop rhGH, urgent neuroimaging' },
      ],
      next: 'GF-08',
    },

    // ── Phase 8 — Dialysis-specific growth ─────────────────────────────────
    'GF-08': {
      id: 'GF-08', type: 'QUESTION', source: W2C,
      question: 'Is the child on dialysis?',
      detail: 'Dialysis patients have the worst growth outcomes. rhGH resistance is common. Additional strategies: optimize dialysis dose, minimize inflammation, ensure adequate protein (PD loses 5–15 g/day), treat acidosis, use biocompatible dialysate, and consider incremental dialysis to preserve residual renal function.',
      options: [
        { label: 'Yes — on dialysis', set: { dialysis: true }, next: 'GF-09' },
        { label: 'No — pre-dialysis CKD', set: { dialysis: false }, next: 'GF-10' },
      ],
    },
    'GF-09': {
      id: 'GF-09', type: 'ACTION', source: W2C,
      action: 'Dialysis-specific growth optimization: (1) Increase rhGH dose to 0.06–0.07 mg/kg/day (GH resistance in dialysis). (2) Ensure dialysis adequacy: HD Kt/V ≥1.2, PD Kt/V ≥1.7. (3) Protein intake: PD 1.2–1.5 g/kg/day, HD 1.1–1.3 g/kg/day. (4) Supplement water-soluble vitamins (dialysis losses). (5) Treat acidosis (bicarbonate 22–26). (6) Minimize inflammation (biocompatible membranes, pure water). (7) Consider overnight PD for better growth than daytime-only. (8) Transplant is the best growth intervention — refer for transplant evaluation.',
      next: 'GF-10',
    },

    // ── Phase 9 — Transplant & catch-up growth ────────────────────────────
    'GF-10': {
      id: 'GF-10', type: 'QUESTION', source: W2C,
      question: 'Is the child post-kidney transplant?',
      detail: 'Post-transplant growth: (1) Steroid-sparing protocols improve growth (avoid daily prednisolone; use alternate-day or steroid-free). (2) Catch-up growth may occur in first 1–2 years post-transplant. (3) rhGH can be used post-transplant if growth failure persists after 3 months, but monitor graft function closely (theoretical rejection risk). (4) Graft function is the main determinant of growth — optimize eGFR.',
      options: [
        { label: 'Yes — post-transplant', set: { post_tx: true }, next: 'GF-11' },
        { label: 'No — not transplanted', set: { post_tx: false }, next: 'TERM-MONITOR' },
      ],
    },
    'GF-11': {
      id: 'GF-11', type: 'ACTION', source: W2C,
      action: 'Post-transplant growth: (1) Use steroid-sparing/minimizing protocol (tacrolimus + MMF ± alternate-day steroid or steroid-free). (2) Monitor graft function (creatinine, eGFR) — declining graft function impairs growth. (3) If growth failure persists after 3 months post-transplant with stable graft: consider rhGH (start 0.05 mg/kg/day). (4) Monitor for rejection (rhGH may theoretically increase rejection risk — evidence is reassuring but monitor closely). (5) Catch-up growth usually occurs in first 1–2 years if graft function is good and steroids minimized.',
      monitoring: [
        { parameter: 'Graft function (creatinine, eGFR)', frequency: 'Every 1–3 months', target: 'Stable or improving', alert: 'Rising creatinine', alert_action: 'Evaluate rejection, hold rhGH if rejection suspected' },
        { parameter: 'Height velocity', frequency: 'Every 3 months', target: 'Catch-up growth (height Z-score improving)', alert: 'No catch-up after 12 months', alert_action: 'Evaluate graft function, consider rhGH' },
      ],
      next: 'TERM-MONITOR',
    },

    // ── Terminals ──────────────────────────────────────────────────────────
    'TERM-NUTRITION': {
      id: 'TERM-NUTRITION', type: 'TERMINAL', source: A,
      action: 'Growth failure managed with nutritional optimization — reassess in 3–6 months. If growth does not improve despite adequate nutrition and corrected reversible causes, re-evaluate for rhGH candidacy. Continue routine growth monitoring every 3 months. Refer to renal dietitian for ongoing support.',
    },
    'TERM-MONITOR': {
      id: 'TERM-MONITOR', type: 'TERMINAL', source: B,
      action: 'Growth failure management plan established — continue monitoring: (1) Height/weight every 3 months. (2) If on rhGH: height velocity, IGF-1, glucose, thyroid, hip (SCFE), ICP symptoms every 3–6 months. (3) Optimize nutrition, dialysis adequacy, and metabolic control. (4) Refer for transplant evaluation if on dialysis (best growth intervention). (5) Coordinate with endocrinology for rhGH management.',
    },
  },
};

// Hub-ready engine record
export const CKD_GROWTH_FAILURE_ENGINE = {
  id: 'ckd-growth-failure-engine',
  label: 'CKD Growth Failure Engine',
  desc: 'KDOQI 2020 — growth Z-score · nutritional optimization · reversible causes (acidosis/anemia/MBD) · rhGH candidacy & monitoring · dialysis-specific · post-transplant catch-up',
  group: 'CKD & Genetics',
  builtin: true,
  guideline_source: CGF_GUIDELINE,
  ciee_sources: CGF_SOURCES,
  ciee_pathway: CGF_PATHWAY,
};