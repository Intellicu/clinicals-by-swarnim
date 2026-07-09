/**
 * Febrile Seizure Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Febrile Seizure (7.78).
 * Indian Academy of Pediatrics.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner). An actively
 * seizing child is managed via the Status Epilepticus engine first.
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Content
 * reflects the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const FS_GUIDELINE = {
  id: 'GS-IAP-STG-2022-FS',
  guideline_name: 'IAP STG 2022 — Febrile Seizure',
  guideline_section: 'Active seizure → SE · Simple vs complex · Investigation thresholds · Reassurance & fever advice',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1B',
  recommendation_strength: 'Recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022, 7.78 (Febrile Seizure).',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Febrile Seizure',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const FS_SOURCES = {
  'GS-IAP-STG-2022-FS-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022, 7.78'),
  'GS-IAP-STG-2022-FS-PP': mk('Practice point', 'Practice point', 'IAP STG 2022, 7.78'),
};

const B = 'GS-IAP-STG-2022-FS-1B';
const PP = 'GS-IAP-STG-2022-FS-PP';

export const FS_PATHWAY = {
  entry: 'FS-DN-01',
  nodes: {
    'FS-DN-01': {
      id: 'FS-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Is the child still seizing now?',
      detail: 'Febrile seizure = a seizure with fever in a child 6 months–5 years without CNS infection or a metabolic cause.',
      options: [
        { label: 'Yes — still seizing', next: 'FS-DN-02', tone: 'danger' },
        { label: 'No — seizure has stopped', next: 'FS-DN-03' },
      ],
    },
    'FS-DN-02': {
      id: 'FS-DN-02', type: 'ACTION', critical: true, source: B,
      action: 'A seizure lasting ≥5 minutes is managed as status epilepticus — use the Status Epilepticus engine (benzodiazepine first) and check glucose.',
      points: [
        'Give a benzodiazepine if the seizure lasts ≥5 min (see Status Epilepticus engine)',
        'Airway, oxygen, position; check capillary glucose',
        'Once stopped, return to this pathway for classification and disposition',
      ],
      next: 'FS-DN-03',
    },
    'FS-DN-03': {
      id: 'FS-DN-03', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Simple or complex febrile seizure?',
      detail: 'Also actively exclude meningitis/encephalitis in every case — clinically (and by LP if suspected).',
      points: [
        'Simple: generalised, <15 minutes, once in 24 hours, full recovery, no focal features',
        'Complex/atypical: focal, >15 minutes, or recurring within 24 hours, or incomplete recovery',
      ],
      options: [
        { label: 'Simple febrile seizure', set: { fs_type: 'simple' }, next: 'FS-DN-04' },
        { label: 'Complex / atypical', set: { fs_type: 'complex' }, next: 'FS-DN-05', tone: 'danger' },
      ],
    },
    'FS-DN-04': {
      id: 'FS-DN-04', type: 'ACTION', source: B,
      action: 'Simple febrile seizure — no routine EEG, neuroimaging or LP unless meningitis is suspected. Reassure, and treat the source of the fever.',
      points: [
        'No routine EEG / CT-MRI / LP for a typical simple febrile seizure in a well child',
        'Do an LP if meningitis is suspected (especially <12 months, incomplete immunisation, or prior antibiotics that could mask signs)',
        'Identify and treat the fever source; give antipyretics for comfort',
      ],
      safety: [
        { title: 'Antipyretics do not prevent recurrence', detail: 'Counsel parents that regular antipyretics do not prevent febrile-seizure recurrence — they are for comfort only.' },
      ],
      next: 'FS-DN-06',
    },
    'FS-DN-05': {
      id: 'FS-DN-05', type: 'ACTION', critical: true, source: B,
      action: 'Complex / atypical febrile seizure — investigate and obtain senior review; admit if there is diagnostic doubt.',
      investigations: [
        { test: 'Targeted work-up', detail: 'Consider LP (exclude CNS infection), neuroimaging for focal/prolonged seizures, EEG per neurology; glucose/electrolytes/calcium as indicated.' },
      ],
      points: [
        'Senior/neurology review; admit if diagnostic doubt or incomplete recovery',
        'Lower threshold for LP and imaging than for a simple febrile seizure',
      ],
      next: 'FS-DN-06',
    },
    'FS-DN-06': {
      id: 'FS-DN-06', type: 'MONITORING', source: PP,
      action: 'Counselling & follow-up — reassure about the benign prognosis of simple febrile seizures and give fever/first-aid advice.',
      points: [
        'Explain the good prognosis and recurrence risk; teach seizure first aid (recovery position, do not restrain, time the seizure, when to seek help)',
        'No routine daily anticonvulsant prophylaxis for simple febrile seizures',
        'Ensure immunisations are up to date; treat the underlying illness',
      ],
      next: 'TERM-DONE',
    },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Febrile-seizure plan generated — active-seizure management via SE, simple vs complex classification with appropriate investigation thresholds, meningitis exclusion, and parent counselling recorded.' },
  },
};

export const FS_ENGINE = {
  id: 'febrile-seizure-engine',
  label: 'Febrile Seizure Engine',
  desc: 'IAP STG 2022, 7.78 — febrile seizure: still seizing → treat as status epilepticus first · simple (generalised, <15 min, once/24 h, full recovery) → no routine EEG/imaging/LP unless meningitis suspected, reassure + treat fever source · complex/atypical → investigate + senior review, admit if doubt; exclude meningitis in all',
  group: 'Neurology',
  builtin: true,
  guideline_source: FS_GUIDELINE,
  ciee_sources: FS_SOURCES,
  ciee_pathway: FS_PATHWAY,
};
