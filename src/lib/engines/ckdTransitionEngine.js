/**
 * Adolescent Transition in CKD Intelligence Engine — CIEE built-in.
 * Source: AAP 2011/2018 (Supporting the Health Care Transition from
 * Adolescence to Adulthood) · KDIGO 2012 · ISN Transition Toolkit ·
 * Got Transition (Six Core Elements 3.0).
 *
 * Decision pathway:
 *  - Age-based transition readiness assessment
 *  - Self-management skills inventory
 *  - Knowledge assessment (disease, medications, insurance)
 *  - Transition plan development (age 14 → 18 → 21)
 *  - Adult care identification & warm handoff
 *  - Medical records transfer
 *  - Insurance/financial planning
 *  - Psychosocial readiness (adherence, substance use, reproductive)
 *  - Post-transfer follow-up
 */

export const CKT_GUIDELINE = {
  id: 'GS-AAP-2018-CKT',
  guideline_name: 'AAP 2018 — Transition in CKD/Adolescent',
  guideline_section: 'Transition Readiness · Self-Management · Transfer',
  issuing_body: 'American Academy of Pediatrics · Got Transition · KDIGO',
  year: 2018,
  evidence_grade: 'B–D',
  recommendation_strength: 'GRADE',
  doi: null,
  pmid: null,
  reference: 'White PH, et al. Supporting the Health Care Transition from Adolescence to Adulthood. Pediatrics 2018;142(5):e20182587.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'AAP 2018 — Transition in CKD/Adolescent',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'American Academy of Pediatrics · Got Transition · KDIGO',
  year: 2018, doi: null, pmid: null,
});

export const CKT_SOURCES = {
  'GS-AAP-2018-B': mk('B', 'Strong recommendation', 'Moderate quality (grade B)'),
  'GS-AAP-2018-C': mk('C', 'Strong recommendation', 'Low quality (grade C)'),
  'GS-AAP-2018-D': mk('D', 'Weak recommendation', 'Very low quality (grade D)'),
  'GS-AAP-2018-X': mk('X', 'Practice point (ungraded)', 'Practice point (grade X)'),
};

const B = 'GS-AAP-2018-B';
const C = 'GS-AAP-2018-C';
const D = 'GS-AAP-2018-D';
const X = 'GS-AAP-2018-X';

export const CKT_PATHWAY = {
  entry: 'TR-01',
  nodes: {
    // ── Phase 1 — Age-based transition phase ──────────────────────────────
    'TR-01': {
      id: 'TR-01', type: 'QUESTION', critical: true, source: B,
      question: 'How old is the adolescent with CKD?',
      detail: 'Transition planning follows the Got Transition Six Core Elements framework. Phase 1 (age 12–14): introduce transition concept, begin self-management education. Phase 2 (age 15–17): develop transition plan, assess readiness, identify adult provider. Phase 3 (age 18–21): transfer to adult care, warm handoff, ensure first adult appointment. Phase 4 (age 22+): post-transfer support, confirm engagement with adult care.',
      options: [
        { label: '12–14 years (Phase 1 — Introduce)', set: { phase: 1 }, next: 'TR-02' },
        { label: '15–17 years (Phase 2 — Prepare)', set: { phase: 2 }, next: 'TR-02' },
        { label: '18–21 years (Phase 3 — Transfer)', set: { phase: 3 }, next: 'TR-02' },
        { label: '22+ years (Phase 4 — Post-transfer)', set: { phase: 4 }, next: 'TR-09' },
      ],
    },

    // ── Phase 2 — Transition readiness assessment ─────────────────────────
    'TR-02': {
      id: 'TR-02', type: 'ACTION', source: B,
      action: 'Administer transition readiness assessment: TRAQ (Transition Readiness Assessment Questionnaire, 20 items, score 1–5 per item). Also assess: (1) Does the teen know their kidney diagnosis? (2) Can they list their medications and doses? (3) Do they know their last creatinine/eGFR? (4) Can they make their own appointments? (5) Do they know their insurance status? (6) Can they describe their dietary restrictions? (7) Do they know emergency warning signs? Score interpretation: mean score ≥4 = ready for transition; 3–4 = preparing; <3 = needs significant support.',
      monitoring: [
        { parameter: 'TRAQ score', frequency: 'Annually from age 14', target: 'Mean ≥4.0 before transfer', alert: 'TRAQ <3.0 at age 17', alert_action: 'Intensive self-management education, delay transfer if needed' },
      ],
      next: 'TR-03',
    },

    // ── Phase 3 — Self-management skills ──────────────────────────────────
    'TR-03': {
      id: 'TR-03', type: 'QUESTION', critical: true, source: B,
      question: 'Can the adolescent independently manage their CKD care?',
      detail: 'Self-management domains: (1) Medication adherence — does the teen take meds independently or does the parent manage? (2) Appointment attendance — does the teen schedule and attend? (3) Symptom monitoring — BP, weight, urine output if relevant. (4) Communication with healthcare team — does the teen speak directly to the doctor? (5) Emergency recognition — does the teen know when to seek help?',
      options: [
        { label: 'Yes — independently manages most/all', set: { self_mgmt: 'independent' }, next: 'TR-04' },
        { label: 'Partially — needs parental support', set: { self_mgmt: 'partial' }, next: 'TR-03A' },
        { label: 'No — parent manages all care', set: { self_mgmt: 'dependent' }, next: 'TR-03A' },
      ],
    },
    'TR-03A': {
      id: 'TR-03A', type: 'ACTION', source: C,
      action: 'Self-management skill building: (1) Gradually shift medication responsibility to the teen — start with one medication, add more over 6–12 months. (2) Have the teen speak first during clinic visits (describe symptoms, ask questions). (3) Teach the teen to: check their own BP, recognize warning signs (edema, decreased urine, high BP), know their medication list and doses. (4) Provide a written medical summary card (diagnosis, medications, allergies, emergency contacts). (5) Use pill organizers, phone alarms, and medication apps. (6) Encourage the teen to attend appointments alone for part of the visit (parent waits outside). Reassess in 6 months.',
      next: 'TR-04',
    },

    // ── Phase 4 — Knowledge assessment ────────────────────────────────────
    'TR-04': {
      id: 'TR-04', type: 'ACTION', source: B,
      action: 'CKD knowledge assessment — ensure the adolescent knows: (1) Their specific kidney diagnosis and what it means. (2) Their current CKD stage and eGFR. (3) Their medication list, doses, and why each is needed (especially immunosuppressants if transplant). (4) Dietary restrictions (potassium, phosphate, sodium, fluid). (5) Warning signs: edema, decreased urine output, high BP, fever in immunosuppressed, graft tenderness/pain (transplant). (6) Their dialysis modality and schedule (if on dialysis). (7) Reproductive health: contraception, pregnancy risks in CKD, teratogenic medications (ACEi, MMF, mycophenolate). (8) Substance use risks: alcohol, smoking, recreational drugs — especially with CKD/immunosuppression.',
      next: 'TR-05',
    },

    // ── Phase 5 — Psychosocial readiness ──────────────────────────────────
    'TR-05': {
      id: 'TR-05', type: 'QUESTION', critical: true, source: C,
      question: 'Are there psychosocial barriers to transition?',
      detail: 'Psychosocial barriers: (1) Depression/anxiety (common in CKD — screen with PHQ-9, GAD-7). (2) Medication non-adherence (especially immunosuppressants post-transplant — leading cause of graft loss in young adults). (3) Substance use (alcohol, smoking, recreational drugs — worsens CKD, interacts with immunosuppressants). (4) Family dynamics (overprotective parents, teen resistance). (5) Financial barriers (insurance, medication costs). (6) Educational/vocational disruption.',
      options: [
        { label: 'No barriers — psychosocially ready', set: { psych_ready: true }, next: 'TR-06' },
        { label: 'Yes — barriers present', set: { psych_ready: false }, next: 'TR-05A' },
      ],
    },
    'TR-05A': {
      id: 'TR-05A', type: 'ACTION', source: C,
      action: 'Address psychosocial barriers: (1) Depression/anxiety → psychology referral, CBT, SSRI if moderate–severe. (2) Non-adherence → identify root cause (forgetfulness, side effects, cost, denial), use adherence aids (pill boxes, apps, DOT), consider once-daily formulations, involve pharmacist. (3) Substance use → motivational interviewing, harm reduction, substance use counselling. (4) Family dynamics → family therapy, gradual autonomy building. (5) Financial → social work referral, insurance navigation, patient assistance programs. (6) Educational/vocational → school accommodations, vocational rehabilitation. Do NOT transfer until psychosocial barriers are at least partially addressed.',
      next: 'TR-06',
    },

    // ── Phase 6 — Transition plan & adult care ────────────────────────────
    'TR-06': {
      id: 'TR-06', type: 'ACTION', source: B,
      action: 'Develop transition plan and identify adult nephrologist: (1) Create a written transition plan with the teen and family — include target transfer date, adult nephrologist, medical summary, and ongoing needs. (2) Identify an adult nephrologist with interest/experience in young adult CKD/transplant. (3) Consider joint clinic (pediatric + adult nephrologist) for 1–2 visits before transfer. (4) Provide the teen with a portable medical record (diagnosis, medications, surgeries, immunizations, last labs, imaging, biopsy results, dialysis history). (5) Discuss modality options if approaching ESRD (HD, PD, pre-emptive transplant) — involve the teen in decision-making. (6) If transplant: discuss graft survival expectations, adherence importance, and pregnancy planning.',
      next: 'TR-07',
    },

    // ── Phase 7 — Insurance & financial planning ───────────────────────────
    'TR-07': {
      id: 'TR-07', type: 'ACTION', source: C,
      action: 'Insurance and financial planning: (1) In India: discuss Ayushman Bharat PMJAY coverage (up to ₹5 lakh/year for CKD/dialysis), state-specific schemes, and private insurance options. (2) Check if current insurance covers adult care and medications (especially immunosuppressants post-transplant). (3) Apply for disability certificate if eligible (provides benefits). (4) Social work referral for financial counselling. (5) Discuss long-term medication costs: immunosuppressants (₹5000–15000/month), EPO, phosphate binders. (6) If on dialysis: understand dialysis facility options and costs. (7) Employment rights and workplace accommodations. (8) Ensure the teen knows how to refill prescriptions independently.',
      next: 'TR-08',
    },

    // ── Phase 8 — Medical records & warm handoff ──────────────────────────
    'TR-08': {
      id: 'TR-08', type: 'ACTION', source: B,
      action: 'Medical records transfer and warm handoff: (1) Prepare comprehensive medical summary: diagnosis, CKD stage, eGFR trend, current medications, allergies, immunization record, surgical history (dialysis access, transplant), biopsy results, imaging, dialysis prescription, psychosocial assessment, transition readiness score. (2) Send records directly to the adult nephrologist (not just to the patient). (3) Schedule a warm handoff: the pediatric nephrologist personally contacts the adult nephrologist, and the teen has their first adult appointment scheduled before the last pediatric visit. (4) Provide the teen with a copy of their medical summary. (5) Confirm the first adult appointment date and provide contact information. (6) Pediatric team remains available for 3–6 months post-transfer for questions.',
      next: 'TR-09',
    },

    // ── Phase 9 — Post-transfer follow-up ─────────────────────────────────
    'TR-09': {
      id: 'TR-09', type: 'QUESTION', source: C,
      question: 'Has the adolescent successfully transferred to adult care?',
      detail: 'Successful transfer = the adolescent has attended at least one adult nephrology appointment. Post-transfer loss to follow-up is the biggest risk — up to 35% of young adults are lost to follow-up after transfer, leading to graft loss, disease progression, and avoidable complications.',
      options: [
        { label: 'Yes — attended first adult appointment', set: { transferred: true }, next: 'TR-10' },
        { label: 'No — missed first appointment or lost to follow-up', set: { transferred: false }, next: 'TR-10A', tone: 'danger' },
      ],
    },
    'TR-10': {
      id: 'TR-10', type: 'ACTION', source: C,
      action: 'Post-transfer support: (1) Confirm the adult nephrologist has received all records and the teen attended. (2) Pediatric team contacts the teen at 1 month and 3 months post-transfer to check on transition experience. (3) Address any barriers (transportation, cost, communication with adult team). (4) Monitor for graft loss or disease progression (especially in transplant — non-adherence is the #1 cause of graft loss in 18–25 year age group). (5) Encourage the teen to maintain their medical summary and keep appointments. (6) Transition is complete when the teen is stably engaged in adult care — typically 6–12 months post-transfer.',
      monitoring: [
        { parameter: 'Adult care appointment attendance', frequency: 'At 1, 3, 6, 12 months post-transfer', target: 'All appointments kept', alert: 'Missed appointment', alert_action: 'Contact teen, identify barrier, reconnect with adult team' },
        { parameter: 'Graft function (if transplant)', frequency: 'Per adult nephrologist schedule', target: 'Stable', alert: 'Rising creatinine', alert_action: 'Assess adherence urgently, adult nephrologist to evaluate' },
      ],
      next: 'TERM-COMPLETE',
    },
    'TR-10A': {
      id: 'TR-10A', type: 'ACTION', source: C,
      action: 'Lost to follow-up — urgent re-engagement: (1) Contact the adolescent directly (phone, text, email — use their preferred method). (2) Identify the barrier: transportation, cost, denial, fear, substance use, mental health, lost insurance. (3) Address the barrier: help with scheduling, financial assistance, mental health referral, social work. (4) If transplant: URGENT — non-adherence to immunosuppressants leads to acute rejection within days–weeks. Contact the adult transplant center and arrange urgent review. (5) If dialysis: missed sessions lead to fluid overload, hyperkalemia — arrange urgent dialysis. (6) Family involvement if the teen consents. (7) Do NOT close the pediatric file until the teen is confirmed in adult care.',
      next: 'TR-09',
    },

    // ── Terminals ──────────────────────────────────────────────────────────
    'TERM-COMPLETE': {
      id: 'TERM-COMPLETE', type: 'TERMINAL', source: B,
      action: 'Transition to adult care completed — the adolescent is now engaged in adult nephrology care. Key principles for ongoing success: (1) Adherence to medications and appointments is the single most important factor for long-term outcomes. (2) Annual transition check-in for 1–2 years post-transfer. (3) Address emerging adult issues: reproductive health, pregnancy planning, employment, independent living. (4) The pediatric team can close the file once the young adult is stably engaged in adult care for 12 months.',
    },
  },
};

// Hub-ready engine record
export const CKD_TRANSITION_ENGINE = {
  id: 'ckd-transition-engine',
  label: 'CKD Transition Engine',
  desc: 'AAP 2018 / Got Transition — age-based readiness · TRAQ assessment · self-management skills · psychosocial barriers · adult care handoff · insurance · post-transfer support',
  group: 'CKD & Genetics',
  builtin: true,
  guideline_source: CKT_GUIDELINE,
  ciee_sources: CKT_SOURCES,
  ciee_pathway: CKT_PATHWAY,
};