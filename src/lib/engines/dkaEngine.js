/**
 * Diabetic Ketoacidosis (DKA) Intelligence Engine — CIEE built-in.
 *
 * Source: ISPAD Clinical Practice Consensus Guidelines 2022 (DKA and
 * hyperglycaemic hyperosmolar state) — endorsed by IAP/ISPAE. Emphasis on the
 * safety rules that reduce cerebral-oedema mortality: cautious fluids, NO
 * insulin bolus, insulin started 1–2 h AFTER fluids, and active cerebral-oedema
 * surveillance.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses/
 * fluid rules reflect the ISPAD 2022 algorithm but must be verified before this
 * engine is exposed as clinically validated.
 */

export const DKA_GUIDELINE = {
  id: 'GS-ISPAD-2022-DKA',
  guideline_name: 'ISPAD 2022 — Diabetic Ketoacidosis',
  guideline_section: 'Diagnosis & severity · Resuscitation · Fluids · Insulin · Potassium · Dextrose · Cerebral-oedema surveillance · Resolution',
  issuing_body: 'International Society for Pediatric and Adolescent Diabetes',
  year: 2022,
  evidence_grade: 'Consensus',
  recommendation_strength: 'Consensus guideline',
  reference: 'ISPAD Clinical Practice Consensus Guidelines 2022 — DKA. Endorsed by IAP/ISPAE.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'ISPAD 2022 — DKA',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'International Society for Pediatric and Adolescent Diabetes',
  year: 2022,
});

export const DKA_SOURCES = {
  'GS-ISPAD-2022-DKA-C': mk('Consensus', 'Consensus recommendation', 'ISPAD 2022 DKA'),
  'GS-ISPAD-2022-DKA-A': mk('A', 'Strong recommendation', 'ISPAD 2022 DKA'),
};

const C = 'GS-ISPAD-2022-DKA-C';
const A = 'GS-ISPAD-2022-DKA-A';

export const DKA_PATHWAY = {
  entry: 'DKA-DN-01',
  nodes: {
    'DKA-DN-01': {
      id: 'DKA-DN-01', type: 'ASSESSMENT', critical: true, source: A,
      question: 'Is DKA confirmed (all three biochemical criteria)?',
      detail: 'Confirm the diagnosis before starting the protocol; weigh the child and calculate on actual weight.',
      points: [
        'Hyperglycaemia: blood glucose >11 mmol/L (>200 mg/dL)',
        'Acidosis: venous pH <7.3 or bicarbonate <15 mmol/L',
        'Ketosis: blood ketones (β-hydroxybutyrate) ≥3 mmol/L, or moderate–large ketonuria',
      ],
      options: [
        { label: 'Yes — DKA confirmed', next: 'DKA-DN-02', tone: 'danger' },
        { label: 'No — hyperglycaemia without acidosis/ketosis', next: 'TERM-NOT-DKA', tone: 'muted' },
      ],
    },
    'DKA-DN-02': {
      id: 'DKA-DN-02', type: 'ASSESSMENT', critical: true, source: A,
      question: 'Severity (by venous pH / bicarbonate)?',
      detail: 'Severity guides the assumed fluid deficit and the level of monitoring.',
      points: [
        'Mild: pH 7.2–7.3 or bicarbonate 10–15 mmol/L (assume ~5% deficit)',
        'Moderate: pH 7.1–7.2 or bicarbonate 5–10 mmol/L (assume ~5–7% deficit)',
        'Severe: pH <7.1 or bicarbonate <5 mmol/L (assume ~7–10% deficit)',
      ],
      options: [
        { label: 'Mild', set: { severity: 'mild' }, next: 'DKA-DN-03' },
        { label: 'Moderate', set: { severity: 'moderate' }, next: 'DKA-DN-03' },
        { label: 'Severe', set: { severity: 'severe' }, next: 'DKA-DN-03', tone: 'danger' },
      ],
    },
    'DKA-DN-03': {
      id: 'DKA-DN-03', type: 'QUESTION', critical: true, source: A,
      question: 'Shock / haemodynamic compromise?',
      detail: 'Most children with DKA are 5–10% dehydrated but NOT in shock — true shock is uncommon. Do not over-resuscitate.',
      options: [
        { label: 'Yes — shock / poor perfusion', next: 'DKA-DN-04', tone: 'danger' },
        { label: 'No — dehydrated but perfusing', next: 'DKA-DN-05' },
      ],
    },
    'DKA-DN-04': {
      id: 'DKA-DN-04', type: 'ACTION', critical: true, source: A,
      action: 'Shock — give a cautious isotonic bolus and reassess; repeat only if perfusion remains inadequate.',
      rx: { drug: 'Sodium chloride 0.9% (bolus)', dose: '10 mL/kg over 30–60 min, reassess; repeat cautiously if still shocked', route: 'IV', duration: 'Reassess after each bolus' },
      safety: [
        { title: 'Avoid rapid/large fluids', detail: 'Rapid or excessive fluid boluses are associated with cerebral oedema — use 10 mL/kg over 30–60 min and reassess; avoid repeated rapid boluses.' },
      ],
      next: 'DKA-DN-05',
    },
    'DKA-DN-05': {
      id: 'DKA-DN-05', type: 'ACTION', critical: true, source: A,
      action: 'Fluid therapy — replace the deficit evenly over 24–48 h PLUS maintenance, using 0.9% saline initially. Subtract any resuscitation boluses. Do not exceed ~1.5–2× maintenance.',
      points: [
        'Total fluid = (estimated deficit by severity) + maintenance, given evenly over 24–48 h',
        'Start with 0.9% saline (with potassium added — see next step); switch to include dextrose when glucose falls',
        'Account for oral intake; recalculate if the child improves faster than expected',
      ],
      safety: [
        { title: 'Cerebral-oedema caution', detail: 'Do not exceed ~1.5–2× maintenance and avoid rapid changes in osmolality — over-rapid rehydration is a cerebral-oedema risk.' },
      ],
      next: 'DKA-DN-06',
    },
    'DKA-DN-06': {
      id: 'DKA-DN-06', type: 'ACTION', critical: true, source: A, prescribes: 'insulin',
      action: 'Start an IV insulin infusion 1–2 HOURS AFTER beginning fluids. Do NOT give an insulin bolus.',
      rx: { drug: 'Regular (soluble) insulin — IV infusion', dose: '0.05–0.1 units/kg/hour IV infusion (NO bolus)', route: 'IV infusion', duration: 'Continue until ketoacidosis resolves; overlap with SC insulin at transition' },
      safety: [
        { title: 'No insulin bolus', detail: 'Do NOT give an initial IV insulin bolus in children — it increases cerebral-oedema risk and does not speed recovery.' },
        { title: 'Start after fluids', detail: 'Begin insulin 1–2 h after starting fluids, once the child is rehydrating and potassium is being replaced.' },
      ],
      next: 'DKA-DN-07',
    },
    'DKA-DN-07': {
      id: 'DKA-DN-07', type: 'ACTION', critical: true, source: A, prescribes: 'potassium chloride',
      action: 'Potassium — total-body potassium is depleted. Add potassium to the fluids once potassium is known and urine output is confirmed.',
      rx: { drug: 'Potassium chloride (in maintenance fluids)', dose: '40 mmol/L in the fluid (20–40 mmol/L), adjusted to serum potassium', route: 'IV (in fluids)', duration: 'Throughout, guided by serum K⁺' },
      points: [
        'If hypokalaemic (K⁺ <3.5): start potassium BEFORE insulin and correct before/with fluids',
        'If normal: add potassium to the fluids at the start of insulin',
        'If hyperkalaemic (K⁺ >5.5) or no urine output: defer potassium until K⁺ falls / urine passed',
      ],
      safety: [
        { title: 'ECG / K⁺ monitoring', detail: 'Insulin drives potassium intracellularly — monitor serum K⁺ (and ECG for peaked/flat T waves) closely; never give IV potassium as a bolus.' },
      ],
      next: 'DKA-DN-08',
    },
    'DKA-DN-08': {
      id: 'DKA-DN-08', type: 'ACTION', source: A, prescribes: 'dextrose',
      action: 'Add dextrose to the fluids once blood glucose falls to ~14–17 mmol/L (250–300 mg/dL) — continue insulin to clear ketones; do NOT stop the insulin infusion.',
      rx: { drug: 'Dextrose (added to fluids)', dose: 'Add 5% (up to 10%) dextrose to the IV fluids when glucose ~250–300 mg/dL', route: 'IV (in fluids)', duration: 'Until acidosis/ketosis resolves' },
      points: [
        'Aim for a glucose fall of ~2–5 mmol/L/h (~50–90 mg/dL/h) — a faster fall risks cerebral oedema',
        'If glucose falls too fast or below target, INCREASE dextrose rather than reducing insulin below 0.05 U/kg/h (ketones still need clearing)',
      ],
      next: 'DKA-DN-09',
    },
    'DKA-DN-09': {
      id: 'DKA-DN-09', type: 'ACTION', critical: true, source: A, prescribes: 'mannitol',
      action: 'Cerebral-oedema surveillance — the leading cause of DKA death. If warning signs appear, treat IMMEDIATELY (do not wait for imaging).',
      rx: { drug: 'Mannitol (or hypertonic saline) — for cerebral oedema', dose: 'Mannitol 0.5–1 g/kg IV over 10–15 min · OR 3% saline 2.5–5 mL/kg over 10–15 min', route: 'IV', duration: 'Give at the first sign of cerebral oedema; may repeat' },
      points: [
        'Warning signs: headache, recurrence/worsening of vomiting, bradycardia + rising BP, falling GCS/behaviour change, cranial-nerve palsies, abnormal breathing',
        'Immediate actions: reduce the fluid rate, give mannitol or hypertonic saline, elevate the head of the bed, and call PICU/senior',
      ],
      safety: [
        { title: 'Treat before imaging', detail: 'Cerebral oedema is a clinical diagnosis — give hyperosmolar therapy at the first suspicion; do NOT delay for a CT scan.' },
      ],
      next: 'DKA-DN-10',
    },
    'DKA-DN-10': {
      id: 'DKA-DN-10', type: 'MONITORING', source: A,
      action: 'Monitoring & resolution — transition to subcutaneous insulin once DKA has resolved.',
      points: [
        'Resolution = pH >7.3 AND bicarbonate >15 mmol/L (and/or ketones <1 mmol/L), child alert and tolerating orally',
        'Give the first SC (rapid/short-acting) insulin dose and stop the infusion 15–30 min later (overlap to avoid rebound)',
        'Bicarbonate is NOT recommended routinely (consider only in life-threatening hyperkalaemia or extreme acidosis under specialist advice)',
      ],
      monitoring: [
        { parameter: 'Glucose + neuro/vital observations', frequency: 'Hourly', target: 'Glucose fall ~50–90 mg/dL/h; stable GCS', alert: 'Headache, bradycardia+hypertension, falling GCS (cerebral oedema)', alert_action: 'Treat cerebral oedema immediately (mannitol / 3% saline); reduce fluids; PICU' },
        { parameter: 'Electrolytes, pH/bicarbonate, ketones', frequency: 'Every 2–4 hours', target: 'Correcting acidosis, normalising K⁺', alert: 'Falling K⁺ / persistent acidosis', alert_action: 'Adjust potassium/insulin; look for sepsis or an insulin-delivery problem' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-NOT-DKA': { id: 'TERM-NOT-DKA', type: 'TERMINAL', source: C, action: 'Not DKA (no acidosis/ketosis) — manage hyperglycaemia per diabetes pathway; if hyperosmolar features without ketoacidosis, consider hyperglycaemic hyperosmolar state (different fluid/insulin approach).' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: A, action: 'DKA management plan generated — diagnosis & severity, cautious fluids, delayed insulin infusion (no bolus), potassium and dextrose rules, cerebral-oedema surveillance, and resolution/transition recorded.' },
  },
};

export const DKA_ENGINE = {
  id: 'dka-engine',
  label: 'Diabetic Ketoacidosis Engine',
  desc: 'ISPAD 2022 — paediatric DKA: confirm (hyperglycaemia + pH <7.3/HCO₃ <15 + ketosis) → severity → cautious 10 mL/kg bolus only if shocked → deficit + maintenance over 24–48 h → insulin infusion 0.05–0.1 U/kg/h started 1–2 h after fluids (NO bolus) → potassium & dextrose rules → cerebral-oedema surveillance (mannitol / 3% saline) → SC transition on resolution',
  group: 'Endocrine & Metabolic',
  builtin: true,
  guideline_source: DKA_GUIDELINE,
  ciee_sources: DKA_SOURCES,
  ciee_pathway: DKA_PATHWAY,
};
