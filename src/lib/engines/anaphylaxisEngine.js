/**
 * Anaphylaxis Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Anaphylaxis (§3.35),
 * Indian Academy of Pediatrics. Aligned with WAO/EAACI anaphylaxis guidance.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner). The critical
 * branch is ANA-DN-02: IM adrenaline is a hard-stop action — the engine must
 * not allow skipping to supportive care first.
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect standard published paediatric values but must be verified before this
 * engine is exposed as clinically validated.
 */

export const ANAPHYLAXIS_GUIDELINE = {
  id: 'GS-IAP-STG-2022-ANA',
  guideline_name: 'IAP STG 2022 — Anaphylaxis',
  guideline_section: 'Recognition · IM adrenaline · Refractory management · Observation & discharge',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: 'Practice point',
  recommendation_strength: 'Practice point',
  reference: 'IAP Standard Treatment Guidelines 2022, §3.35 (Anaphylaxis). Companion: WAO Anaphylaxis Guidance 2020.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Anaphylaxis',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const ANAPHYLAXIS_SOURCES = {
  'GS-IAP-STG-2022-ANA-PP': mk('Practice point', 'Practice point', 'Practice point (§3.35)'),
  'GS-IAP-STG-2022-ANA-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'Recommendation (§3.35)'),
};

const PP = 'GS-IAP-STG-2022-ANA-PP';
const B = 'GS-IAP-STG-2022-ANA-1B';

export const ANAPHYLAXIS_PATHWAY = {
  entry: 'ANA-DN-01',
  nodes: {
    // ── Assessment ─────────────────────────────────────────────────────────
    'ANA-DN-01': {
      id: 'ANA-DN-01', type: 'ASSESSMENT', critical: true, source: PP,
      question: 'Does the child meet anaphylaxis criteria?',
      detail: 'Acute onset (minutes–hours) after a likely allergen with airway, breathing or circulation compromise — usually, but NOT always, with skin/mucosal signs. Up to 20% of anaphylaxis has no cutaneous findings; do not require skin signs and do not "wait and watch".',
      points: [
        'Airway — stridor, hoarseness, tongue/throat swelling',
        'Breathing — wheeze, bronchospasm, hypoxia, respiratory distress',
        'Circulation — hypotension, poor perfusion, collapse, floppy/drowsy infant',
      ],
      options: [
        { label: 'Yes — anaphylaxis criteria met', next: 'ANA-DN-02', tone: 'danger' },
        { label: 'No — mild allergic reaction only, no ABC compromise', next: 'TERM-MILD', tone: 'muted' },
      ],
    },

    // ── Critical action — IM adrenaline (hard stop) ────────────────────────
    'ANA-DN-02': {
      id: 'ANA-DN-02', type: 'ACTION', critical: true, source: B, prescribes: 'adrenaline',
      action: 'Give IM adrenaline IMMEDIATELY into the anterolateral thigh. This is a hard-stop action node — do not move to antihistamines/steroids/supportive care before adrenaline.',
      rx: { drug: 'Adrenaline (1:1000)', dose: '0.01 mg/kg of 1:1000 (max 0.5 mg)', route: 'IM — anterolateral thigh', duration: 'May repeat every 5–15 min as needed' },
      monitoring: [
        { parameter: 'Reassess ABC + perfusion', frequency: 'Every 5 min until stable', target: 'Improving airway/breathing/circulation', alert: 'No improvement at 5 min', alert_action: 'Repeat IM adrenaline (ANA-DN-04)' },
      ],
      safety: [
        { title: 'Route', detail: 'IM anterolateral thigh only. Do NOT give IV push of 1:1000 adrenaline — reserve IV adrenaline (dilute) for refractory shock under monitoring.' },
      ],
      next: 'ANA-DN-03',
    },

    // ── Response check ─────────────────────────────────────────────────────
    'ANA-DN-03': {
      id: 'ANA-DN-03', type: 'QUESTION', critical: true, source: PP,
      question: 'Improved within 5 minutes of adrenaline?',
      options: [
        { label: 'No — not improving / deteriorating', next: 'ANA-DN-04', tone: 'danger' },
        { label: 'Yes — responding', next: 'ANA-DN-05' },
      ],
    },

    // ── Refractory loop ────────────────────────────────────────────────────
    'ANA-DN-04': {
      id: 'ANA-DN-04', type: 'ACTION', critical: true, source: B, prescribes: 'adrenaline',
      action: 'Repeat IM adrenaline (same dose) and add adjuncts: position supine with legs raised (or sitting if breathing is hard, left-lateral if vomiting/pregnant), high-flow oxygen, IV isotonic bolus 10–20 mL/kg if hypotensive, and nebulised salbutamol for bronchospasm.',
      rx: { drug: 'Adrenaline (1:1000)', dose: '0.01 mg/kg of 1:1000 (max 0.5 mg) — repeat', route: 'IM — anterolateral thigh', duration: 'Repeat q5–15 min' },
      safety: [
        { title: 'Escalate refractory anaphylaxis', detail: 'After 2–3 IM doses without response, escalate to a monitored IV adrenaline infusion and PICU/senior support; repeat dosing needs senior awareness.' },
      ],
      monitoring: [
        { parameter: 'Continuous ABC, SpO₂, BP', frequency: 'Continuous', target: 'Restored perfusion/oxygenation', alert: 'No response after 2–3 doses', alert_action: 'IV adrenaline infusion + PICU transfer' },
      ],
      next: 'ANA-DN-03',
    },

    // ── Second-line adjuncts (only after adrenaline) ───────────────────────
    'ANA-DN-05': {
      id: 'ANA-DN-05', type: 'ACTION', source: PP,
      action: 'Second-line adjuncts ONLY after adrenaline — antihistamine (for urticaria/itch) and corticosteroid. These are explicitly never a substitute for adrenaline and must not delay it.',
      safety: [
        { title: 'Adjuncts are not first-line', detail: 'Antihistamines and steroids do not treat airway/circulatory compromise and have slow onset — adrenaline remains the only first-line drug.' },
      ],
      next: 'ANA-DN-06',
    },

    // ── Disposition ────────────────────────────────────────────────────────
    'ANA-DN-06': {
      id: 'ANA-DN-06', type: 'MONITORING', source: PP,
      action: 'Observe ≥4–6 hours (longer — up to 12–24h — if severe, reactive airway disease, or biphasic-reaction risk). At discharge: prescribe an adrenaline auto-injector, provide a written anaphylaxis action plan, counsel on allergen avoidance, and refer to allergy/immunology.',
      monitoring: [
        { parameter: 'Observation for biphasic reaction', frequency: '≥4–6 h (extend if severe)', target: 'No recurrence of ABC compromise', alert: 'Recurrence of symptoms', alert_action: 'Re-treat as anaphylaxis; extend observation/admit' },
      ],
      next: 'TERM-DONE',
    },

    // ── Terminals ──────────────────────────────────────────────────────────
    'TERM-MILD': { id: 'TERM-MILD', type: 'TERMINAL', source: PP, action: 'Mild allergic reaction without ABC compromise — manage with an oral antihistamine and observe. Safety-net: return immediately if airway, breathing or circulation symptoms develop.' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: PP, action: 'Anaphylaxis management plan generated — adrenaline given, observation completed, auto-injector prescribed, action plan and allergy referral recorded.' },
  },
};

export const ANAPHYLAXIS_ENGINE = {
  id: 'anaphylaxis-engine',
  label: 'Anaphylaxis Engine',
  desc: 'IAP STG 2022 — recognition (skin signs not required), immediate IM adrenaline (hard stop), refractory loop with repeat dosing + fluids + PICU escalation, second-line adjuncts, and biphasic-reaction observation with auto-injector discharge',
  group: 'Emergency & Critical Care',
  builtin: true,
  guideline_source: ANAPHYLAXIS_GUIDELINE,
  ciee_sources: ANAPHYLAXIS_SOURCES,
  ciee_pathway: ANAPHYLAXIS_PATHWAY,
};
