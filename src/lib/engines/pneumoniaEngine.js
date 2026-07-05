/**
 * Community-Acquired Pneumonia (CAP) Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Pneumonia (§2.21) with
 * WHO/IMNCI fast-breathing thresholds. Indian Academy of Pediatrics.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const CAP_GUIDELINE = {
  id: 'GS-IAP-STG-2022-CAP',
  guideline_name: 'IAP STG 2022 — Community-Acquired Pneumonia',
  guideline_section: 'Severity by danger signs & fast breathing · Severe (admit, O₂, IV) · Non-severe (oral amoxicillin) · No pneumonia',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1A',
  recommendation_strength: 'Strong recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022 §2.21 (Pneumonia). Companion: WHO/IMNCI.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Pneumonia',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const CAP_SOURCES = {
  'GS-IAP-STG-2022-CAP-1A': mk('1A', 'Strong recommendation, high-quality evidence', 'IAP STG 2022 §2.21'),
  'GS-IAP-STG-2022-CAP-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 §2.21'),
};

const A = 'GS-IAP-STG-2022-CAP-1A';
const PP = 'GS-IAP-STG-2022-CAP-PP';

export const CAP_PATHWAY = {
  entry: 'CAP-DN-01',
  nodes: {
    'CAP-DN-01': {
      id: 'CAP-DN-01', type: 'ASSESSMENT', critical: true, source: A,
      question: 'Any general danger sign or sign of severe pneumonia?',
      detail: 'Count the respiratory rate over a full minute in a calm child and look for chest indrawing and danger signs.',
      points: [
        'Danger signs: unable to drink/feed, persistent vomiting, convulsions, lethargy/unconsciousness, central cyanosis, severe respiratory distress/grunting, SpO₂ <90%',
        'Lower chest wall indrawing = at least severe in WHO classification when with fast breathing',
      ],
      options: [
        { label: 'Danger sign / severe pneumonia', set: { severity: 'severe' }, next: 'CAP-DN-02', tone: 'danger' },
        { label: 'No danger sign — assess breathing', next: 'CAP-DN-03' },
      ],
    },
    'CAP-DN-02': {
      id: 'CAP-DN-02', type: 'ACTION', critical: true, source: A, prescribes: 'ceftriaxone',
      action: 'Severe pneumonia — admit, give oxygen and IV antibiotics.',
      rx: { drug: 'IV antibiotic (e.g. Ampicillin + Gentamicin, or Ceftriaxone)', dose: 'Ceftriaxone 50–75 mg/kg/day IV · OR Ampicillin 50 mg/kg/dose q6h + Gentamicin 7.5 mg/kg/day; add cloxacillin/vancomycin if staphylococcal', route: 'IV', duration: 'Per response; step down to oral when improving' },
      points: [
        'Oxygen to keep SpO₂ ≥90% (≥92% if available); nurse comfortably, support feeding',
        'Chest X-ray if diagnostic doubt/complications; consider effusion/empyema if not improving',
      ],
      monitoring: [
        { parameter: 'SpO₂, work of breathing, feeding', frequency: 'Continuous/serial', target: 'SpO₂ ≥90%, improving distress', alert: 'Rising distress, falling SpO₂, effusion', alert_action: 'Escalate O₂/ventilation; image for complications; PICU' },
      ],
      next: 'CAP-DN-05',
    },
    'CAP-DN-03': {
      id: 'CAP-DN-03', type: 'ASSESSMENT', critical: true, source: A,
      question: 'Fast breathing for age (± chest indrawing), no danger sign?',
      detail: 'Age-specific respiratory-rate thresholds define pneumonia when danger signs are absent.',
      points: [
        '<2 months: ≥60/min · 2–11 months: ≥50/min · 12–59 months: ≥40/min',
        'Any chest indrawing (without danger signs) is treated as pneumonia needing oral antibiotics',
      ],
      options: [
        { label: 'Fast breathing ± indrawing (pneumonia)', set: { severity: 'nonsevere' }, next: 'CAP-DN-04' },
        { label: 'Normal RR, no indrawing (no pneumonia)', set: { severity: 'none' }, next: 'CAP-DN-06' },
      ],
    },
    'CAP-DN-04': {
      id: 'CAP-DN-04', type: 'ACTION', source: A, prescribes: 'amoxicillin',
      action: 'Non-severe pneumonia — oral high-dose amoxicillin, home, with a 48-hour review.',
      rx: { drug: 'Amoxicillin (high dose)', dose: '80–90 mg/kg/day in 2 divided doses ×5 days (max 3 g/day)', route: 'Oral', duration: '5 days' },
      points: [
        'Manage fever, hydration and feeding at home',
        'Review in 48 hours; return sooner for any danger sign',
      ],
      monitoring: [
        { parameter: 'Response at 48 h (RR, feeding, fever)', frequency: 'Review at 48 h', target: 'Improving', alert: 'Not improving / new danger sign', alert_action: 'Reassess for severe pneumonia/complication → admit + IV' },
      ],
      next: 'CAP-DN-05',
    },
    'CAP-DN-06': {
      id: 'CAP-DN-06', type: 'MONITORING', source: A,
      action: 'No pneumonia — no antibiotic. Treat the cough/cold symptomatically and safety-net.',
      points: [
        'No antibiotic indicated; treat fever and keep hydrated; soothe cough with home remedies',
        'Return if fast breathing, difficulty breathing, unable to drink, or the child becomes sicker',
      ],
      monitoring: [
        { parameter: 'Breathing & feeding', frequency: 'Home / safety-net', target: 'Resolving cold', alert: 'Fast breathing / danger sign', alert_action: 'Re-evaluate for pneumonia' },
      ],
      next: 'TERM-DONE',
    },
    'CAP-DN-05': {
      id: 'CAP-DN-05', type: 'MONITORING', source: PP,
      action: 'Ongoing review — reassess response and complete the course; step down IV to oral when improving.',
      monitoring: [
        { parameter: 'Clinical course', frequency: 'Daily / at review', target: 'Recovery, course completed', alert: 'Deterioration / non-response', alert_action: 'Image for effusion/empyema; broaden/adjust antibiotics; escalate' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: A, action: 'Pneumonia plan generated — severity by danger signs/fast breathing, admission + O₂ + IV for severe, oral amoxicillin for non-severe, and no-antibiotic safety-net for no pneumonia recorded.' },
  },
};

export const CAP_ENGINE = {
  id: 'pneumonia-engine',
  label: 'Community-Acquired Pneumonia Engine',
  desc: 'IAP STG 2022 §2.21 — CAP: danger signs → severe (admit, O₂ to SpO₂ ≥90%, IV antibiotics) · fast breathing for age (±indrawing), no danger → oral high-dose amoxicillin 80–90 mg/kg/day ×5 d, review 48 h · normal RR, no indrawing → no antibiotic, safety-net',
  group: 'Respiratory',
  builtin: true,
  guideline_source: CAP_GUIDELINE,
  ciee_sources: CAP_SOURCES,
  ciee_pathway: CAP_PATHWAY,
};
