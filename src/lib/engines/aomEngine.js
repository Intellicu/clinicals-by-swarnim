/**
 * Acute Otitis Media (AOM) Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Acute Otitis Media (§2.19).
 * Indian Academy of Pediatrics.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const AOM_GUIDELINE = {
  id: 'GS-IAP-STG-2022-AOM',
  guideline_name: 'IAP STG 2022 — Acute Otitis Media',
  guideline_section: 'Immediate-antibiotic criteria vs watchful waiting · First-line & step-up · Mastoiditis watch',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1B',
  recommendation_strength: 'Recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022 §2.19 (Acute Otitis Media).',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Acute Otitis Media',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const AOM_SOURCES = {
  'GS-IAP-STG-2022-AOM-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022 §2.19'),
  'GS-IAP-STG-2022-AOM-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 §2.19'),
};

const B = 'GS-IAP-STG-2022-AOM-1B';
const PP = 'GS-IAP-STG-2022-AOM-PP';

export const AOM_PATHWAY = {
  entry: 'AOM-DN-01',
  nodes: {
    'AOM-DN-01': {
      id: 'AOM-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Any immediate-antibiotic criterion present?',
      detail: 'Diagnose AOM from a bulging tympanic membrane / acute otorrhoea with acute onset and middle-ear effusion. Then decide antibiotics now vs watchful waiting.',
      points: [
        'Treat NOW if: age <6 months; <2 years with bilateral AOM; otorrhoea (perforation/discharge); severe pain or high fever (≥39 °C); or the child looks unwell/toxic',
        'Otherwise, an observation option is reasonable in a well child with reliable follow-up',
      ],
      options: [
        { label: 'Immediate-antibiotic criterion present', set: { treat_now: true }, next: 'AOM-DN-02' },
        { label: 'None — well child, reliable follow-up', set: { treat_now: false }, next: 'AOM-DN-03' },
      ],
    },
    'AOM-DN-02': {
      id: 'AOM-DN-02', type: 'ACTION', critical: true, source: B, prescribes: 'amoxicillin',
      action: 'Treat now — first-line high-dose amoxicillin + adequate analgesia.',
      rx: { drug: 'Amoxicillin (high dose)', dose: '80–90 mg/kg/day in 2 divided doses (max 3 g/day) ×5–10 days (10 days if <2 y or severe/perforated)', route: 'Oral', duration: '5–10 days' },
      points: [
        'Analgesia: paracetamol 15 mg/kg/dose (± ibuprofen) — pain relief matters regardless of antibiotics',
        'Recent amoxicillin, conjunctivitis-otitis, or treatment failure → step up to co-amoxiclav',
      ],
      next: 'AOM-DN-04',
    },
    'AOM-DN-03': {
      id: 'AOM-DN-03', type: 'ACTION', source: B,
      action: 'Watchful waiting — analgesia now, with a 48–72 h delayed (safety-net) antibiotic prescription.',
      points: [
        'Give analgesia (paracetamol 15 mg/kg/dose ± ibuprofen); no immediate antibiotic',
        'Provide a delayed prescription: start the antibiotic if not improving or worsening at 48–72 h',
        'Return sooner for worsening pain, high fever, discharge, or an unwell child',
      ],
      monitoring: [
        { parameter: 'Symptom course', frequency: '48–72 h', target: 'Improving without antibiotics', alert: 'Not improving / worsening at 48–72 h', alert_action: 'Start high-dose amoxicillin (fill delayed prescription)' },
      ],
      next: 'AOM-DN-04',
    },
    'AOM-DN-04': {
      id: 'AOM-DN-04', type: 'QUESTION', critical: true, source: B,
      question: 'Response at 48–72 hours?',
      options: [
        { label: 'Improving — complete care', next: 'AOM-DN-06' },
        { label: 'Treatment failure (no improvement on amoxicillin)', next: 'AOM-DN-05', tone: 'danger' },
      ],
    },
    'AOM-DN-05': {
      id: 'AOM-DN-05', type: 'ACTION', critical: true, source: B, prescribes: 'amoxicillin-clavulanate',
      action: 'Treatment failure — step up to co-amoxiclav (better beta-lactamase/resistant-pneumococcus cover).',
      rx: { drug: 'Amoxicillin-Clavulanate (Co-amoxiclav)', dose: '80–90 mg/kg/day (amoxicillin component) in 2 divided doses ×10 days', route: 'Oral', duration: '10 days' },
      points: [
        'If still failing / penicillin allergy → ceftriaxone or an ENT referral',
      ],
      next: 'AOM-DN-06',
    },
    'AOM-DN-06': {
      id: 'AOM-DN-06', type: 'MONITORING', source: PP,
      action: 'Follow-up & complication watch — watch for mastoiditis and other complications.',
      points: [
        'Mastoiditis red flags: post-auricular swelling/redness/tenderness, protruding pinna, persistent high fever → urgent ENT referral + IV antibiotics',
        'Recurrent AOM → ENT review (consider grommets); check hearing if effusion persists',
      ],
      monitoring: [
        { parameter: 'Post-auricular signs, fever, hearing', frequency: 'Follow-up', target: 'Resolution', alert: 'Mastoiditis signs / persistent effusion', alert_action: 'Urgent ENT referral; hearing assessment' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'AOM plan generated — immediate-antibiotic vs watchful-waiting decision, high-dose amoxicillin first line, step-up to co-amoxiclav on failure, analgesia, and mastoiditis watch recorded.' },
  },
};

export const AOM_ENGINE = {
  id: 'aom-engine',
  label: 'Acute Otitis Media Engine',
  desc: 'IAP STG 2022 §2.19 — AOM: treat now if <6 mo / <2 y bilateral / otorrhoea / severe pain or high fever / unwell — else watchful waiting with analgesia + 48–72 h delayed prescription → first-line high-dose amoxicillin, step up to co-amoxiclav on failure → mastoiditis watch',
  group: 'General Pediatrics',
  builtin: true,
  guideline_source: AOM_GUIDELINE,
  ciee_sources: AOM_SOURCES,
  ciee_pathway: AOM_PATHWAY,
};
