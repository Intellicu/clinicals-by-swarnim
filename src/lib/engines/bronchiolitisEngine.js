/**
 * Bronchiolitis Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Bronchiolitis. Indian
 * Academy of Pediatrics. Management is SUPPORTIVE; routine bronchodilators,
 * steroids, antibiotics and chest physiotherapy are NOT recommended.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Content
 * reflects the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const BRONCH_GUIDELINE = {
  id: 'GS-IAP-STG-2022-BRONCH',
  guideline_name: 'IAP STG 2022 — Bronchiolitis',
  guideline_section: 'Diagnosis · Severity · Supportive care · What to avoid · Admission & escalation',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1A',
  recommendation_strength: 'Strong recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022 (Bronchiolitis). Companion: AAP Bronchiolitis Guideline.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Bronchiolitis',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const BRONCH_SOURCES = {
  'GS-IAP-STG-2022-BRONCH-1A': mk('1A', 'Strong recommendation, high-quality evidence', 'IAP STG 2022 Bronchiolitis'),
  'GS-IAP-STG-2022-BRONCH-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 Bronchiolitis'),
};

const A = 'GS-IAP-STG-2022-BRONCH-1A';
const PP = 'GS-IAP-STG-2022-BRONCH-PP';

export const BRONCH_PATHWAY = {
  entry: 'BRONCH-DN-01',
  nodes: {
    'BRONCH-DN-01': {
      id: 'BRONCH-DN-01', type: 'ASSESSMENT', critical: true, source: A,
      question: 'Is this clinical bronchiolitis?',
      detail: 'Typically an infant <2 years (peak <12 months) with a viral (usually RSV) coryzal prodrome followed by cough, tachypnoea, fine crackles ± wheeze and feeding difficulty. It is a CLINICAL diagnosis — routine chest X-ray and virology are not required.',
      points: [
        'First episode of wheeze/crackles in an infant with a viral prodrome',
        'Consider alternatives if atypical: recurrent wheeze (early asthma), focal signs/high fever (pneumonia), cardiac failure, or foreign body',
      ],
      options: [
        { label: 'Yes — bronchiolitis', next: 'BRONCH-DN-02' },
        { label: 'Atypical — consider an alternative diagnosis', next: 'TERM-ALT', tone: 'muted' },
      ],
      safety: [
        { title: 'Avoid routine drugs & tests', detail: 'Do NOT routinely give salbutamol, nebulised adrenaline, corticosteroids, antibiotics, or chest physiotherapy, and do not routinely order a chest X-ray — the evidence does not support them in bronchiolitis.' },
      ],
    },
    'BRONCH-DN-02': {
      id: 'BRONCH-DN-02', type: 'ASSESSMENT', critical: true, source: A,
      question: 'Severity?',
      detail: 'Grade by feeding, work of breathing, oxygenation, apnoea and alertness.',
      points: [
        'Mild: feeding well (>50–75%), mild/no distress, SpO₂ ≥92%, alert',
        'Moderate: reduced feeding, moderate distress (nasal flaring, retractions), SpO₂ 90–92%',
        'Severe: poor feeding (<50%), marked distress/grunting, SpO₂ <90%, apnoea, lethargy/exhaustion',
      ],
      options: [
        { label: 'Mild', set: { severity: 'mild' }, next: 'BRONCH-DN-03' },
        { label: 'Moderate', set: { severity: 'moderate' }, next: 'BRONCH-DN-04' },
        { label: 'Severe', set: { severity: 'severe' }, next: 'BRONCH-DN-05', tone: 'danger' },
      ],
    },
    'BRONCH-DN-03': {
      id: 'BRONCH-DN-03', type: 'ACTION', source: A,
      action: 'Mild — home supportive care with safety-net advice.',
      points: [
        'Small, frequent feeds; keep well hydrated; nasal saline drops + gentle suction before feeds',
        'Antipyretics for fever/discomfort; avoid cigarette-smoke exposure',
        'Safety-net: return for poor feeding (<50%), fast/laboured breathing, apnoea/colour change, or a drowsy/less-responsive baby',
      ],
      next: 'TERM-HOME',
    },
    'BRONCH-DN-04': {
      id: 'BRONCH-DN-04', type: 'ACTION', critical: true, source: A,
      action: 'Moderate — admit/observe with supportive care.',
      points: [
        'Oxygen to keep SpO₂ ≥90–92% (nasal prongs)',
        'Nasal suction; support hydration — small frequent feeds, or NG/IV fluids if feeding <50% or tachypnoeic/at aspiration risk',
        'Minimal handling; monitor for apnoea (especially if <2 months or ex-preterm)',
      ],
      next: 'BRONCH-DN-06',
    },
    'BRONCH-DN-05': {
      id: 'BRONCH-DN-05', type: 'ACTION', critical: true, source: A,
      action: 'Severe — admit and escalate respiratory support; involve PICU early.',
      points: [
        'High-flow nasal cannula (HFNC) oxygen; consider CPAP for impending failure',
        'NG/IV fluids; continuous SpO₂ and apnoea monitoring',
        'Escalate to PICU for recurrent apnoea, exhaustion, rising CO₂ or failure of HFNC/CPAP',
      ],
      safety: [
        { title: 'Apnoea risk', detail: 'Young (<2 months), ex-preterm infants are at high risk of apnoea — admit and monitor closely even if oxygenation looks adequate.' },
      ],
      next: 'BRONCH-DN-06',
    },
    'BRONCH-DN-06': {
      id: 'BRONCH-DN-06', type: 'MONITORING', source: PP,
      action: 'Inpatient monitoring, admission criteria and prevention.',
      points: [
        'Admission criteria: age <3 months, apnoea, SpO₂ <92%, poor feeding/dehydration, severe distress, or significant comorbidity (prematurity, congenital heart/lung disease, immunodeficiency)',
        'Prevention: hand hygiene, avoid smoke exposure, promote breastfeeding; palivizumab for selected high-risk infants where available',
        'A time-limited trial of nebulised bronchodilator is optional only if there is diagnostic doubt about early asthma — stop if no objective response',
      ],
      monitoring: [
        { parameter: 'SpO₂, work of breathing, feeding, apnoea', frequency: 'Continuous / regular while admitted', target: 'SpO₂ ≥92%, feeding recovering, no apnoea', alert: 'Apnoea, SpO₂ <90%, exhaustion, poor feeding', alert_action: 'Escalate respiratory support (HFNC/CPAP); PICU review' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-ALT': { id: 'TERM-ALT', type: 'TERMINAL', source: PP, action: 'Atypical features — reconsider the diagnosis (early asthma if recurrent, pneumonia if focal/high fever, cardiac failure, foreign body) and manage accordingly.' },
    'TERM-HOME': { id: 'TERM-HOME', type: 'TERMINAL', source: A, action: 'Mild bronchiolitis — home supportive care with clear safety-net advice. No routine bronchodilators, steroids or antibiotics.' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: A, action: 'Bronchiolitis plan generated — clinical diagnosis, severity-based supportive care, admission/escalation criteria and prevention recorded; routine drug therapy explicitly avoided.' },
  },
};

export const BRONCH_ENGINE = {
  id: 'bronchiolitis-engine',
  label: 'Bronchiolitis Engine',
  desc: 'IAP STG 2022 — bronchiolitis (infant <2 y, viral): clinical diagnosis → severity → SUPPORTIVE care (O₂ for SpO₂ <90–92%, nasal suction, hydration; HFNC/CPAP + PICU for severe) → admission criteria & prevention; routine bronchodilators/steroids/antibiotics/physio explicitly NOT recommended',
  group: 'Respiratory',
  builtin: true,
  guideline_source: BRONCH_GUIDELINE,
  ciee_sources: BRONCH_SOURCES,
  ciee_pathway: BRONCH_PATHWAY,
};
