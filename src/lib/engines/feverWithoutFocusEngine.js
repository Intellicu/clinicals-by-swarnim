/**
 * Fever Without Focus (FWF) Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Fever Without Focus (§6.57).
 * Indian Academy of Pediatrics. Age-banded (<3 months / 3–36 months).
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const FWF_GUIDELINE = {
  id: 'GS-IAP-STG-2022-FWF',
  guideline_name: 'IAP STG 2022 — Fever Without Focus',
  guideline_section: 'Age banding · Young infant sepsis screen · 3–36 months risk stratification · Targeted work-up',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1B',
  recommendation_strength: 'Recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022 §6.57 (Fever Without Focus).',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Fever Without Focus',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const FWF_SOURCES = {
  'GS-IAP-STG-2022-FWF-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022 §6.57'),
  'GS-IAP-STG-2022-FWF-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 §6.57'),
};

const B = 'GS-IAP-STG-2022-FWF-1B';
const PP = 'GS-IAP-STG-2022-FWF-PP';

export const FWF_PATHWAY = {
  entry: 'FWF-DN-01',
  nodes: {
    'FWF-DN-01': {
      id: 'FWF-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Age of the child?',
      detail: 'Fever ≥38 °C without a localising focus after history and examination. Age drives the risk of serious bacterial infection (SBI) and the work-up.',
      options: [
        { label: '< 3 months (young infant)', set: { age_band: 'young_infant' }, next: 'FWF-DN-02', tone: 'danger' },
        { label: '3–36 months', set: { age_band: 'toddler' }, next: 'FWF-DN-03' },
        { label: '> 36 months', set: { age_band: 'older' }, next: 'FWF-DN-06' },
      ],
    },
    'FWF-DN-02': {
      id: 'FWF-DN-02', type: 'ACTION', critical: true, source: B,
      action: 'Young infant (<3 months) — treat as high risk. Full septic screen and admit for empirical IV antibiotics; NO outpatient management.',
      investigations: [
        { test: 'Full septic screen', detail: 'CBC, blood culture, CRP/procalcitonin, urine (catheter/SPA) culture, and LP (CSF) unless contraindicated; chest X-ray if respiratory signs.' },
      ],
      points: [
        'Admit — do not manage a febrile young infant as an outpatient',
        'Empirical IV antibiotics after cultures (e.g. cefotaxime + ampicillin; add aciclovir if HSV features)',
        'Neonates (<1 month) especially: low threshold, always full screen incl. LP',
      ],
      safety: [
        { title: 'No ceftriaxone in the neonate', detail: 'In neonates use cefotaxime (+ ampicillin); avoid ceftriaxone (bilirubin/calcium interaction).' },
      ],
      next: 'FWF-DN-05',
    },
    'FWF-DN-03': {
      id: 'FWF-DN-03', type: 'ASSESSMENT', critical: true, source: B,
      question: '3–36 months — toxic or any red-flag feature?',
      detail: 'Assess appearance and red flags (the single best predictor of SBI is a toxic/ill appearance).',
      points: [
        'Toxic: lethargy, poor perfusion, hypo/hyperventilation, cyanosis, inconsolable/weak cry',
        'Red flags: petechial/purpuric rash, high fever with poor feeding, focal neuro signs, dehydration/shock',
      ],
      options: [
        { label: 'Toxic / red flag present', set: { toxic: true }, next: 'FWF-DN-04', tone: 'danger' },
        { label: 'Well-appearing, no red flag', set: { toxic: false }, next: 'FWF-DN-06' },
      ],
    },
    'FWF-DN-04': {
      id: 'FWF-DN-04', type: 'ACTION', critical: true, source: B,
      action: 'Treat as a serious bacterial infection — investigate and give empirical antibiotics; treat shock if present.',
      investigations: [
        { test: 'CBC, blood culture, CRP/procalcitonin, urine culture', detail: 'Plus LP and CXR as indicated by features.' },
      ],
      points: [
        'Empirical IV antibiotics after cultures (e.g. ceftriaxone 75–100 mg/kg/day)',
        'Treat shock (see Shock engine) and seizures; admit',
      ],
      next: 'FWF-DN-05',
    },
    'FWF-DN-06': {
      id: 'FWF-DN-06', type: 'ACTION', source: B,
      action: 'Well-appearing child — targeted work-up guided by local epidemiology, antipyretics, and a safety-net review.',
      rx: { drug: 'Paracetamol', dose: '15 mg/kg/dose 4–6 hourly (max 60 mg/kg/day)', route: 'Oral', duration: 'For fever/discomfort' },
      investigations: [
        { test: 'Urinalysis + urine culture', detail: 'UTI is the commonest occult SBI in this age — test especially in girls, uncircumcised boys, or fever >48 h.' },
        { test: 'Targeted tests by epidemiology', detail: 'Malaria smear/RDT, dengue NS1/serology, or typhoid work-up where prevalent.' },
      ],
      points: [
        'Antipyretics and hydration; treat any identified focus',
        'Safety-net review at 24–48 h; return sooner for red flags',
      ],
      monitoring: [
        { parameter: 'Persistence/evolution of fever + new focus', frequency: 'Review at 24–48 h', target: 'Defervescence / focus identified', alert: 'Persistent fever >48–72 h or new red flag', alert_action: 'Re-examine, extend work-up, consider admission' },
      ],
      next: 'FWF-DN-05',
    },
    'FWF-DN-05': {
      id: 'FWF-DN-05', type: 'MONITORING', source: PP,
      action: 'Ongoing review — reassess appearance, hydration and any evolving focus; de-escalate or escalate on culture results.',
      monitoring: [
        { parameter: 'Culture results + clinical course', frequency: 'As results return / daily', target: 'Source identified & treated', alert: 'Positive culture / deterioration', alert_action: 'Tailor antibiotics; escalate care' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Fever-without-focus plan generated — age-banded risk stratification, young-infant full screen + admission, toxic-child empirical treatment, and well-child targeted work-up with safety-net recorded.' },
  },
};

export const FWF_ENGINE = {
  id: 'fever-without-focus-engine',
  label: 'Fever Without Focus Engine',
  desc: 'IAP STG 2022 §6.57 — fever without focus by age: <3 months → full septic screen + admit + empirical IV antibiotics (no outpatient) · 3–36 months toxic/red-flag → treat as SBI (investigate + antibiotics, treat shock) · well-appearing → targeted work-up (urine ± malaria/dengue/typhoid), antipyretics, 24–48 h safety-net',
  group: 'General Pediatrics',
  builtin: true,
  guideline_source: FWF_GUIDELINE,
  ciee_sources: FWF_SOURCES,
  ciee_pathway: FWF_PATHWAY,
};
