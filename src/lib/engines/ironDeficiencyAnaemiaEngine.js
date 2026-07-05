/**
 * Iron Deficiency Anaemia (IDA) Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Iron Deficiency Anaemia
 * (§10.100). Indian Academy of Pediatrics.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const IDA_GUIDELINE = {
  id: 'GS-IAP-STG-2022-IDA',
  guideline_name: 'IAP STG 2022 — Iron Deficiency Anaemia',
  guideline_section: 'Severity triage · Transfusion for decompensation · Oral iron · Response check · Non-response work-up',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1B',
  recommendation_strength: 'Recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022 §10.100 (Iron Deficiency Anaemia).',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Iron Deficiency Anaemia',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const IDA_SOURCES = {
  'GS-IAP-STG-2022-IDA-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022 §10.100'),
  'GS-IAP-STG-2022-IDA-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 §10.100'),
};

const B = 'GS-IAP-STG-2022-IDA-1B';
const PP = 'GS-IAP-STG-2022-IDA-PP';

export const IDA_PATHWAY = {
  entry: 'IDA-DN-01',
  nodes: {
    'IDA-DN-01': {
      id: 'IDA-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Severe / decompensated anaemia?',
      detail: 'Microcytic hypochromic anaemia with low ferritin. Decide first whether the child needs transfusion or can start oral iron.',
      points: [
        'Decompensated: heart failure/haemodynamic instability, severe symptomatic anaemia, or very low Hb (e.g. <4 g/dL) with cardiorespiratory compromise',
        'Stable: no cardiorespiratory compromise, tolerating orally',
      ],
      options: [
        { label: 'Severe / decompensated', set: { severity: 'severe' }, next: 'IDA-DN-02', tone: 'danger' },
        { label: 'Stable', set: { severity: 'stable' }, next: 'IDA-DN-03' },
      ],
    },
    'IDA-DN-02': {
      id: 'IDA-DN-02', type: 'ACTION', critical: true, source: B,
      action: 'Decompensated — cautious, slow packed-cell transfusion and investigate the cause. Then start iron once stable.',
      points: [
        'Transfuse SLOWLY in small aliquots (e.g. 5 mL/kg over 3–4 h; consider furosemide cover) to avoid precipitating heart failure in chronic severe anaemia',
        'Investigate cause in parallel (see non-response work-up)',
        'Start oral iron once haemodynamically stable',
      ],
      safety: [
        { title: 'Slow transfusion in chronic severe anaemia', detail: 'Rapid transfusion can precipitate fluid overload / heart failure — give small volumes slowly and monitor.' },
      ],
      next: 'IDA-DN-03',
    },
    'IDA-DN-03': {
      id: 'IDA-DN-03', type: 'ACTION', source: B, prescribes: 'iron',
      action: 'Start oral elemental iron and dietary counselling.',
      rx: { drug: 'Elemental iron (oral)', dose: '3–6 mg/kg/day of elemental iron in 1–2 divided doses ×8–12 weeks (continue ~3 months after Hb normalises to refill stores)', route: 'Oral', duration: '8–12 weeks, then ~3 months after normalisation' },
      points: [
        'Give between meals / with vitamin C for absorption; avoid with milk/tea/calcium',
        'Counsel on iron-rich diet; treat contributing causes (worm infestation, poor intake, cow-milk excess)',
      ],
      next: 'IDA-DN-04',
    },
    'IDA-DN-04': {
      id: 'IDA-DN-04', type: 'QUESTION', critical: true, source: B,
      question: 'Reassess Hb / reticulocytes at 2–4 weeks — responding?',
      detail: 'An adequate response is a reticulocytosis within ~1 week and a Hb rise of ~1 g/dL over 2–4 weeks.',
      options: [
        { label: 'Responding — continue the course', next: 'IDA-DN-06' },
        { label: 'Not responding', next: 'IDA-DN-05', tone: 'danger' },
      ],
    },
    'IDA-DN-05': {
      id: 'IDA-DN-05', type: 'ACTION', critical: true, source: B,
      action: 'Non-response — reinvestigate before escalating.',
      investigations: [
        { test: 'Reassess the basics', detail: 'Adherence and correct dose/preparation, ongoing blood loss, malabsorption, and diagnosis.' },
        { test: 'Peripheral smear, ferritin, Hb electrophoresis, coeliac screen', detail: 'Reconsider thalassaemia trait, anaemia of chronic disease, coeliac disease, and other causes.' },
      ],
      points: [
        'Confirm adherence/dose first — non-adherence is the commonest cause of "non-response"',
        'Consider IV iron if genuine intolerance/malabsorption; refer if a non-iron cause is found',
      ],
      next: 'IDA-DN-06',
    },
    'IDA-DN-06': {
      id: 'IDA-DN-06', type: 'MONITORING', source: PP,
      action: 'Complete the course and prevent recurrence.',
      points: [
        'Continue iron ~3 months after Hb normalises to replenish stores',
        'Dietary counselling, deworming per programme, and address the underlying cause',
      ],
      monitoring: [
        { parameter: 'Hb / ferritin', frequency: 'At the end of the course and per follow-up', target: 'Normal Hb + replete stores', alert: 'Recurrent anaemia', alert_action: 'Re-evaluate cause; consider referral' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Iron-deficiency anaemia plan generated — severity triage, cautious transfusion for decompensation, oral iron 3–6 mg/kg/day, 2–4 week response check, and non-response work-up recorded.' },
  },
};

export const IDA_ENGINE = {
  id: 'iron-deficiency-anaemia-engine',
  label: 'Iron Deficiency Anaemia Engine',
  desc: 'IAP STG 2022 §10.100 — IDA: severe/decompensated → cautious slow transfusion + investigate · stable → oral elemental iron 3–6 mg/kg/day ×8–12 wk (continue ~3 mo after normalisation) → reassess Hb/retic at 2–4 wk → non-response → reinvestigate (adherence, smear, ferritin, Hb electrophoresis, coeliac screen)',
  group: 'Haematology',
  builtin: true,
  guideline_source: IDA_GUIDELINE,
  ciee_sources: IDA_SOURCES,
  ciee_pathway: IDA_PATHWAY,
};
