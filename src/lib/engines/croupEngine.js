/**
 * Croup (Laryngotracheobronchitis) Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Croup (§4.40). Indian
 * Academy of Pediatrics. Severity-driven (Westley-type: mild / moderate /
 * severe).
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const CROUP_GUIDELINE = {
  id: 'GS-IAP-STG-2022-CRP',
  guideline_name: 'IAP STG 2022 — Croup',
  guideline_section: 'Severity grading · Dexamethasone · Nebulised adrenaline · Observation & disposition',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1B',
  recommendation_strength: 'Recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022 §4.40 (Croup).',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Croup',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const CROUP_SOURCES = {
  'GS-IAP-STG-2022-CRP-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022 §4.40'),
  'GS-IAP-STG-2022-CRP-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 §4.40'),
};

const B = 'GS-IAP-STG-2022-CRP-1B';
const PP = 'GS-IAP-STG-2022-CRP-PP';

export const CROUP_PATHWAY = {
  entry: 'CRP-DN-01',
  nodes: {
    'CRP-DN-01': {
      id: 'CRP-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Croup severity (Westley-type)?',
      detail: 'Barking cough + inspiratory stridor + hoarseness, usually 6 months–3 years. Keep the child calm (agitation worsens obstruction). Grade by stridor, retractions, air entry, colour and mental state.',
      points: [
        'Mild: barking cough, stridor only when upset, no/mild retractions, normal air entry',
        'Moderate: stridor at rest, retractions, some agitation, still good air entry',
        'Severe: stridor at rest with marked retractions, decreased air entry, agitation/lethargy, hypoxia',
      ],
      options: [
        { label: 'Mild', set: { severity: 'mild' }, next: 'CRP-DN-02-MILD' },
        { label: 'Moderate', set: { severity: 'moderate' }, next: 'CRP-DN-02-MOD' },
        { label: 'Severe', set: { severity: 'severe' }, next: 'CRP-DN-02-SEV', tone: 'danger' },
      ],
    },
    'CRP-DN-02-MILD': {
      id: 'CRP-DN-02-MILD', type: 'ACTION', source: B, prescribes: 'dexamethasone',
      action: 'Mild croup — single-dose oral dexamethasone and discharge home with safety-net advice.',
      rx: { drug: 'Dexamethasone', dose: '0.15 mg/kg orally, single dose (max 16 mg)', route: 'Oral', duration: 'Single dose' },
      points: [
        'Discharge home; keep the child calm, encourage fluids',
        'Safety-net: return if stridor at rest, retractions, drooling, cyanosis or poor feeding',
      ],
      next: 'TERM-HOME',
    },
    'CRP-DN-02-MOD': {
      id: 'CRP-DN-02-MOD', type: 'ACTION', critical: true, source: B, prescribes: 'dexamethasone',
      action: 'Moderate croup — give dexamethasone and observe ≥3–4 h; add nebulised adrenaline if not settling.',
      rx: { drug: 'Dexamethasone', dose: '0.15 mg/kg (up to 0.6 mg/kg) orally/IM, single dose (max 16 mg)', route: 'Oral / IM', duration: 'Single dose' },
      points: [
        'Observe at least 3–4 hours',
        'If not settling → nebulised adrenaline 0.5 mL/kg of 1:1000 (max 5 mL)',
        'Minimal handling; provide O₂ only if hypoxic',
      ],
      next: 'CRP-DN-03',
    },
    'CRP-DN-02-SEV': {
      id: 'CRP-DN-02-SEV', type: 'ACTION', critical: true, source: B, prescribes: 'adrenaline',
      action: 'Severe croup — give nebulised adrenaline + dexamethasone + oxygen; call for senior/anaesthetic help and prepare airway support.',
      rx: { drug: 'Nebulised adrenaline (1:1000)', dose: '0.5 mL/kg of 1:1000 (max 5 mL), nebulised; may repeat', route: 'Nebulised', duration: 'Repeat per response' },
      points: [
        'Also give dexamethasone 0.15–0.6 mg/kg (max 16 mg) orally/IM/IV',
        'High-flow O₂; minimal handling; keep the child with the parent, calm',
        'Call senior/anaesthesia/ENT; prepare for a difficult airway — do not examine the throat',
      ],
      safety: [
        { title: 'Airway', detail: 'Severe croup can obstruct rapidly. Do not agitate the child or instrument the airway except by an experienced provider prepared for intubation.' },
      ],
      next: 'CRP-DN-03',
    },
    'CRP-DN-03': {
      id: 'CRP-DN-03', type: 'QUESTION', critical: true, source: B,
      question: 'Response after nebulised adrenaline (effect wears off in ~2 h — watch for rebound)?',
      options: [
        { label: 'Sustained improvement, observed ≥3–4 h', next: 'TERM-HOME' },
        { label: 'Persisting / rebound after adrenaline', next: 'CRP-DN-04', tone: 'danger' },
      ],
    },
    'CRP-DN-04': {
      id: 'CRP-DN-04', type: 'MONITORING', source: PP,
      action: 'Admit — persistent or rebound stridor. Reconsider an alternative diagnosis if atypical or toxic.',
      points: [
        'Consider foreign body, bacterial tracheitis, epiglottitis, retropharyngeal abscess if toxic/atypical/drooling/no barking cough',
        'Repeat nebulised adrenaline as needed; continue steroids; O₂ to keep SpO₂ ≥92%',
        'Escalate to PICU / secure airway if deteriorating',
      ],
      monitoring: [
        { parameter: 'Stridor, retractions, SpO₂, mental state', frequency: 'Continuous while symptomatic', target: 'Improving obstruction, SpO₂ ≥92%', alert: 'Rising effort, falling SpO₂, exhaustion/lethargy', alert_action: 'Senior/anaesthesia; prepare to secure the airway; PICU' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-HOME': { id: 'TERM-HOME', type: 'TERMINAL', source: B, action: 'Discharge home — steroid given, sustained improvement. Safety-net: return for stridor at rest, retractions, drooling, cyanosis or poor feeding.' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: PP, action: 'Croup management plan generated — severity-based steroid ± nebulised adrenaline, observation and disposition recorded.' },
  },
};

export const CROUP_ENGINE = {
  id: 'croup-engine',
  label: 'Croup Engine',
  desc: 'IAP STG 2022 §4.40 — croup by severity: mild → single-dose oral dexamethasone home · moderate → dexamethasone + observe ≥3–4 h, add nebulised adrenaline if not settling · severe → nebulised adrenaline + dexamethasone + O₂ + airway support; response check with rebound watch (~2 h) → discharge vs admit / alternative diagnosis',
  group: 'Respiratory',
  builtin: true,
  guideline_source: CROUP_GUIDELINE,
  ciee_sources: CROUP_SOURCES,
  ciee_pathway: CROUP_PATHWAY,
};
