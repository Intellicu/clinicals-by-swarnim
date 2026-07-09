/**
 * Acute Asthma (Exacerbation) Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Acute Asthma (2.26–27).
 * Indian Academy of Pediatrics. Severity-driven with a 1-hour reassessment.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const ASTHMA_GUIDELINE = {
  id: 'GS-IAP-STG-2022-AST',
  guideline_name: 'IAP STG 2022 — Acute Asthma',
  guideline_section: 'Severity · Bronchodilators + steroid · Life-threatening (MgSO₄, IV, PICU) · 1-hour reassessment · Discharge plan',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1A',
  recommendation_strength: 'Strong recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022, 2.26–27 (Acute Asthma).',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Acute Asthma',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const ASTHMA_SOURCES = {
  'GS-IAP-STG-2022-AST-1A': mk('1A', 'Strong recommendation, high-quality evidence', 'IAP STG 2022, 2.26–27'),
  'GS-IAP-STG-2022-AST-PP': mk('Practice point', 'Practice point', 'IAP STG 2022, 2.26–27'),
};

const A = 'GS-IAP-STG-2022-AST-1A';
const PP = 'GS-IAP-STG-2022-AST-PP';

export const ASTHMA_PATHWAY = {
  entry: 'AST-DN-01',
  nodes: {
    'AST-DN-01': {
      id: 'AST-DN-01', type: 'ASSESSMENT', critical: true, source: A,
      question: 'Exacerbation severity?',
      detail: 'Grade by speech, work of breathing, air entry, SpO₂ and mental state.',
      points: [
        'Mild–moderate: speaks in phrases/sentences, mild–moderate distress, SpO₂ ≥92%, good air entry',
        'Severe: speaks in words, marked distress/accessory muscles, SpO₂ <92%, poor air entry, agitation',
        'Life-threatening: silent chest, cyanosis, exhaustion, poor respiratory effort, drowsy/confused, SpO₂ <90%',
      ],
      options: [
        { label: 'Mild–moderate', set: { severity: 'mildmod' }, next: 'AST-DN-02' },
        { label: 'Severe', set: { severity: 'severe' }, next: 'AST-DN-03', tone: 'danger' },
        { label: 'Life-threatening', set: { severity: 'life' }, next: 'AST-DN-04', tone: 'danger' },
      ],
    },
    'AST-DN-02': {
      id: 'AST-DN-02', type: 'ACTION', source: A, prescribes: 'salbutamol',
      action: 'Mild–moderate — inhaled salbutamol + oral steroid; give O₂ if hypoxic.',
      rx: { drug: 'Salbutamol (neb or MDI+spacer)', dose: 'Neb 0.15 mg/kg (min 2.5 mg, max 5 mg) — or MDI 4–10 puffs via spacer — repeat every 20 min ×3 in the first hour as needed', route: 'Nebulised / MDI+spacer', duration: 'Then space out per response' },
      points: [
        'Add oral prednisolone 1–2 mg/kg (max 40 mg) once daily',
        'O₂ to keep SpO₂ ≥94%',
      ],
      next: 'AST-DN-05',
    },
    'AST-DN-03': {
      id: 'AST-DN-03', type: 'ACTION', critical: true, source: A, prescribes: 'salbutamol',
      action: 'Severe — O₂ + back-to-back salbutamol WITH ipratropium + systemic steroid.',
      rx: { drug: 'Salbutamol + Ipratropium (neb)', dose: 'Salbutamol 0.15 mg/kg (min 2.5, max 5 mg) + Ipratropium 250 mcg (<6 y) / 500 mcg (≥6 y), nebulised, every 20 min ×3 (or continuous salbutamol)', route: 'Nebulised (O₂-driven)', duration: 'Reassess at 1 hour' },
      points: [
        'Systemic steroid: oral prednisolone 1–2 mg/kg (max 40 mg) or IV methylprednisolone/hydrocortisone if not tolerating orals',
        'O₂ to keep SpO₂ ≥94%; do not discharge from this level without observation',
      ],
      next: 'AST-DN-05',
    },
    'AST-DN-04': {
      id: 'AST-DN-04', type: 'ACTION', critical: true, source: A, prescribes: 'magnesium sulfate',
      action: 'Life-threatening — maximal therapy: continuous salbutamol + ipratropium + IV steroid + IV magnesium sulfate; consider IV salbutamol/aminophylline; call PICU.',
      rx: { drug: 'Magnesium sulfate (IV)', dose: '50 mg/kg IV over 20 min (max 2 g)', route: 'IV', duration: 'Single dose; monitor BP' },
      points: [
        'Continuous nebulised salbutamol + ipratropium; IV hydrocortisone/methylprednisolone',
        'Consider IV salbutamol or IV aminophylline in an HDU/PICU setting with monitoring',
        'High-flow O₂; prepare for ventilatory support; transfer to PICU',
      ],
      safety: [
        { title: 'Monitored setting', detail: 'IV MgSO₄/salbutamol/aminophylline require cardiorespiratory monitoring (BP, ECG, K⁺) — PICU/HDU.' },
      ],
      next: 'AST-DN-05',
    },
    'AST-DN-05': {
      id: 'AST-DN-05', type: 'QUESTION', critical: true, source: A,
      question: 'Reassess at 1 hour — response?',
      detail: 'Timed review after the first hour of bronchodilator therapy.',
      options: [
        { label: 'Good response — improving, SpO₂ ≥94%', next: 'AST-DN-06' },
        { label: 'Poor/incomplete response', next: 'AST-DN-07', tone: 'danger' },
      ],
    },
    'AST-DN-06': {
      id: 'AST-DN-06', type: 'MONITORING', source: A,
      action: 'Good response — observe, then plan discharge with a written action plan.',
      points: [
        'Space out salbutamol; continue a steroid course (3–5 days); observe before discharge',
        'Discharge: check/teach inhaler + spacer technique, provide a written asthma action plan, arrange review, review preventer therapy and triggers',
      ],
      next: 'TERM-DONE',
    },
    'AST-DN-07': {
      id: 'AST-DN-07', type: 'ACTION', critical: true, source: A,
      action: 'Poor response — escalate: admit; step up to the next severity band (add ipratropium/IV MgSO₄/IV bronchodilators as not yet given) and involve PICU if deteriorating.',
      points: [
        'Continue frequent/continuous bronchodilators + systemic steroid',
        'Add IV magnesium sulfate 50 mg/kg (max 2 g) if not already given; consider IV salbutamol/aminophylline in PICU/HDU',
        'Reassess for pneumothorax/complications; escalate to ventilatory support if exhausting',
      ],
      monitoring: [
        { parameter: 'Work of breathing, SpO₂, air entry, mental state', frequency: 'Continuous', target: 'Improving; SpO₂ ≥94%', alert: 'Silent chest, rising CO₂, exhaustion', alert_action: 'PICU; prepare for ventilation' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: A, action: 'Acute asthma plan generated — severity-scaled bronchodilators + steroid, life-threatening escalation (IV MgSO₄/PICU), 1-hour reassessment, and discharge with inhaler technique + written action plan recorded.' },
  },
};

export const ASTHMA_ENGINE = {
  id: 'asthma-engine',
  label: 'Acute Asthma Engine',
  desc: 'IAP STG 2022, 2.26–27 — acute asthma by severity: mild–mod → salbutamol + oral steroid · severe → salbutamol + ipratropium + systemic steroid + O₂ · life-threatening → IV MgSO₄, consider IV salbutamol/aminophylline, PICU → reassess at 1 h → discharge with inhaler technique + written action plan',
  group: 'Respiratory',
  builtin: true,
  guideline_source: ASTHMA_GUIDELINE,
  ciee_sources: ASTHMA_SOURCES,
  ciee_pathway: ASTHMA_PATHWAY,
};
