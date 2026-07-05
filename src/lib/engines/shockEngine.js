/**
 * Shock (undifferentiated, office/ward) Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Shock in Office Practice
 * (§5.48), Indian Academy of Pediatrics. Aligned with paediatric sepsis/shock
 * resuscitation principles.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner). Emphasis:
 * hypotension is a LATE sign, boluses are reassessed every time, and fluids are
 * given cautiously in malnutrition / cardiac disease / DKA.
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect standard published paediatric values but must be verified before this
 * engine is exposed as clinically validated.
 */

export const SHOCK_GUIDELINE = {
  id: 'GS-IAP-STG-2022-SHK',
  guideline_name: 'IAP STG 2022 — Shock in Office Practice',
  guideline_section: 'Recognition · Access & bloods · Fluid resuscitation · Reassessment · Inotropes · Cause',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: 'Practice point',
  recommendation_strength: 'Practice point',
  reference: 'IAP Standard Treatment Guidelines 2022, §5.48 (Shock in Office Practice). Companion: Surviving Sepsis paediatric guidance.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Shock',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const SHOCK_SOURCES = {
  'GS-IAP-STG-2022-SHK-PP': mk('Practice point', 'Practice point', 'Practice point (§5.48)'),
  'GS-IAP-STG-2022-SHK-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'Recommendation (§5.48)'),
};

const PP = 'GS-IAP-STG-2022-SHK-PP';
const B = 'GS-IAP-STG-2022-SHK-1B';

export const SHOCK_PATHWAY = {
  entry: 'SHK-DN-01',
  nodes: {
    // ── Recognition ────────────────────────────────────────────────────────
    'SHK-DN-01': {
      id: 'SHK-DN-01', type: 'ASSESSMENT', critical: true, source: PP,
      question: 'Are signs of shock present?',
      detail: 'Hypotension is a LATE sign — do not wait for it. Recognise shock from perfusion and mentation.',
      points: [
        'Tachycardia for age',
        'Capillary refill time >3 s (cold shock) or flash refill (warm shock)',
        'Weak/thready peripheral pulses, cool mottled extremities (or warm, bounding in warm shock)',
        'Altered mentation — irritable, drowsy, floppy',
        'Reduced urine output',
      ],
      options: [
        { label: 'Yes — shock present', next: 'SHK-DN-02', tone: 'danger' },
        { label: 'No — no features of shock', next: 'TERM-NO-SHOCK', tone: 'muted' },
      ],
    },

    // ── Access & bloods ────────────────────────────────────────────────────
    'SHK-DN-02': {
      id: 'SHK-DN-02', type: 'ACTION', source: PP,
      action: 'Start the clock. High-flow oxygen, two IV/IO lines, and send bloods.',
      investigations: [
        { test: 'Bedside glucose', detail: 'Treat hypoglycaemia immediately.' },
        { test: 'Lactate + venous gas', detail: 'Marker of perfusion; trend with resuscitation.' },
        { test: 'Blood culture', detail: 'Before antibiotics if septic shock is suspected — but do not delay antibiotics.' },
      ],
      next: 'SHK-DN-03',
    },

    // ── Fluid resuscitation (critical) ─────────────────────────────────────
    'SHK-DN-03': {
      id: 'SHK-DN-03', type: 'ACTION', critical: true, source: B,
      action: 'Give an isotonic fluid bolus and reassess. Use SMALLER (10 mL/kg) and slower boluses in severe malnutrition, known cardiac disease, or DKA.',
      rx: { drug: 'Isotonic crystalloid (0.9% saline / balanced)', dose: '10–20 mL/kg per bolus (10 mL/kg in malnutrition / cardiac disease / DKA)', route: 'IV/IO', duration: 'Over 5–20 min, then reassess' },
      safety: [
        { title: 'Caution groups', detail: 'Severe acute malnutrition, cardiac disease and DKA: use 10 mL/kg over a longer time and reassess after every bolus for fluid overload.' },
      ],
      monitoring: [
        { parameter: 'Reassess after EACH bolus', frequency: 'After every bolus', target: 'Improving HR, CRT, mentation, urine output', alert: 'Crepitations / new hepatomegaly / worsening work of breathing', alert_action: 'Stop fluids; suspect fluid overload / cardiogenic cause; start inotrope' },
      ],
      next: 'SHK-DN-04',
    },
    'SHK-DN-04': {
      id: 'SHK-DN-04', type: 'QUESTION', critical: true, source: B,
      question: 'Response after fluid boluses (reassess every time)?',
      detail: 'Watch continuously for fluid-overload signs: new crepitations, hepatomegaly, worsening respiratory distress.',
      options: [
        { label: 'Responding — perfusion improving', next: 'SHK-DN-05' },
        { label: 'Still shocked after 40–60 mL/kg (or overload signs)', next: 'SHK-DN-06', tone: 'danger' },
      ],
    },

    // ── Responder → treat cause ────────────────────────────────────────────
    'SHK-DN-05': {
      id: 'SHK-DN-05', type: 'MONITORING', source: B,
      action: 'Fluid-responsive shock — treat the underlying cause. For septic shock, give appropriate antibiotics within 1 hour (e.g. ceftriaxone) after cultures. Continue to monitor urine output, perfusion and lactate.',
      monitoring: [
        { parameter: 'Urine output', frequency: 'Hourly', target: '≥1 mL/kg/h', alert: '<1 mL/kg/h', alert_action: 'Reassess volume status/perfusion' },
        { parameter: 'Perfusion + lactate clearance', frequency: 'Serial', target: 'Normalising CRT, falling lactate', alert: 'Rising lactate / recurrent hypoperfusion', alert_action: 'Re-escalate — repeat bolus vs inotrope' },
      ],
      next: 'TERM-DONE',
    },

    // ── Fluid-refractory → inotrope ────────────────────────────────────────
    'SHK-DN-06': {
      id: 'SHK-DN-06', type: 'ACTION', critical: true, source: B, prescribes: 'adrenaline',
      action: 'Fluid-refractory shock — start an inotrope/vasoactive infusion (adrenaline or noradrenaline). A peripheral or IO line is acceptable initially. Reassess for a cardiogenic cause and arrange transfer to higher-level / PICU care.',
      rx: { drug: 'Adrenaline (or Noradrenaline) infusion', dose: 'Adrenaline 0.05–0.3 mcg/kg/min, titrated · Noradrenaline 0.05–0.3 mcg/kg/min', route: 'IV/IO infusion (peripheral/IO acceptable initially)', duration: 'Titrate to perfusion; central access when available' },
      safety: [
        { title: 'Cardiogenic shock', detail: 'If overload signs appeared with fluids, suspect a cardiogenic cause — do not continue aggressive boluses; prioritise inotrope + echo/senior review.' },
      ],
      next: 'SHK-DN-05',
    },

    // ── Terminals ──────────────────────────────────────────────────────────
    'TERM-NO-SHOCK': { id: 'TERM-NO-SHOCK', type: 'TERMINAL', source: PP, action: 'No features of shock — reassess if the child deteriorates. Continue to monitor perfusion, heart rate, mentation and urine output; treat the presenting illness.' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Shock management plan generated — recognition, staged fluid resuscitation with reassessment, inotrope escalation and cause-directed treatment recorded.' },
  },
};

export const SHOCK_ENGINE = {
  id: 'shock-engine',
  label: 'Shock Engine',
  desc: 'IAP STG 2022 — undifferentiated paediatric shock: perfusion-based recognition (hypotension is late), access & bloods, cautious isotonic boluses with reassessment after each (10 mL/kg in malnutrition/cardiac/DKA), inotrope escalation for fluid-refractory shock, and cause-directed care',
  group: 'Emergency & Critical Care',
  builtin: true,
  guideline_source: SHOCK_GUIDELINE,
  ciee_sources: SHOCK_SOURCES,
  ciee_pathway: SHOCK_PATHWAY,
};
