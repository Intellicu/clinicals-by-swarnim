/**
 * Enteric (Typhoid) Fever Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Enteric Fever (6.58).
 * Indian Academy of Pediatrics.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const ENTERIC_GUIDELINE = {
  id: 'GS-IAP-STG-2022-ENT',
  guideline_name: 'IAP STG 2022 — Enteric Fever',
  guideline_section: 'Severity triage · Oral therapy · IV therapy for complicated disease · Prevention & relapse',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1B',
  recommendation_strength: 'Recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022, 6.58 (Enteric Fever).',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Enteric Fever',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const ENTERIC_SOURCES = {
  'GS-IAP-STG-2022-ENT-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022, 6.58'),
  'GS-IAP-STG-2022-ENT-PP': mk('Practice point', 'Practice point', 'IAP STG 2022, 6.58'),
};

const B = 'GS-IAP-STG-2022-ENT-1B';
const PP = 'GS-IAP-STG-2022-ENT-PP';

export const ENTERIC_PATHWAY = {
  entry: 'ENT-DN-01',
  nodes: {
    'ENT-DN-01': {
      id: 'ENT-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Complicated / toxic enteric fever?',
      detail: 'Sustained fever ± relative bradycardia, abdominal symptoms, hepatosplenomegaly; confirm with blood culture (Widal alone is unreliable). Decide setting by complications.',
      points: [
        'Complications: GI bleeding or perforation, encephalopathy/altered sensorium, shock, myocarditis, unable to take orals, severe toxaemia',
        'Uncomplicated: fever without the above, tolerating orals',
      ],
      options: [
        { label: 'Uncomplicated — tolerating orals', set: { complicated: false }, next: 'ENT-DN-02' },
        { label: 'Complicated / toxic', set: { complicated: true }, next: 'ENT-DN-03', tone: 'danger' },
      ],
    },
    'ENT-DN-02': {
      id: 'ENT-DN-02', type: 'ACTION', source: B, prescribes: 'cefixime',
      action: 'Uncomplicated enteric fever — oral antibiotic per local resistance; review at 48–72 h.',
      rx: { drug: 'Cefixime (or Azithromycin)', dose: 'Cefixime 20 mg/kg/day in 2 divided doses ×7–14 days · OR Azithromycin 10–20 mg/kg/day (max 1 g) once daily ×7 days', route: 'Oral', duration: '7–14 days (cefixime) / 7 days (azithromycin)' },
      monitoring: [
        { parameter: 'Clinical response (fever, feeding)', frequency: 'Review at 48–72 h', target: 'Defervescence usually by day 5–7', alert: 'No response / deterioration by 48–72 h', alert_action: 'Reassess for complications / resistance → admit + IV therapy' },
      ],
      points: [
        'Fever may take 5–7 days to settle even on an effective drug — do not switch prematurely',
        'Antipyretics and hydration; avoid unnecessary antidiarrhoeals',
      ],
      next: 'ENT-DN-04',
    },
    'ENT-DN-03': {
      id: 'ENT-DN-03', type: 'ACTION', critical: true, source: B, prescribes: 'ceftriaxone',
      action: 'Complicated / toxic enteric fever — admit and give IV ceftriaxone; add dexamethasone for severe toxicity/shock; surgery for perforation; consider a carbapenem if XDR is suspected.',
      rx: { drug: 'Ceftriaxone', dose: '75–100 mg/kg/day IV (max 4 g/day), once or twice daily ×10–14 days', route: 'IV', duration: '10–14 days' },
      points: [
        'Severe toxaemia / encephalopathy / shock → dexamethasone (high-dose) per protocol',
        'Suspected/known XDR typhoid → carbapenem (e.g. meropenem) ± azithromycin, per sensitivity',
        'GI perforation → resuscitate + urgent surgical management',
      ],
      monitoring: [
        { parameter: 'Vitals, abdomen, sensorium, GI bleeding', frequency: 'Serial', target: 'Improving toxaemia, no surgical complication', alert: 'Peritonism / GI bleed / worsening sensorium', alert_action: 'Surgical review; escalate care; reassess antibiotic per culture' },
      ],
      next: 'ENT-DN-04',
    },
    'ENT-DN-04': {
      id: 'ENT-DN-04', type: 'MONITORING', source: PP,
      action: 'Prevention & follow-up — counsel and watch for relapse.',
      points: [
        'Prevention: safe water and food, hand hygiene, typhoid conjugate vaccine (TCV)',
        'Watch for relapse ~1–2 weeks after completing treatment (fever recurs) — re-culture and re-treat',
      ],
      monitoring: [
        { parameter: 'Recurrence of fever after recovery', frequency: '1–2 weeks post-treatment', target: 'No relapse', alert: 'Fever recurs', alert_action: 'Blood culture; re-treat relapse' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Enteric fever management plan generated — severity triage, oral vs IV therapy, complication management, prevention and relapse surveillance recorded.' },
  },
};

export const ENTERIC_ENGINE = {
  id: 'enteric-fever-engine',
  label: 'Enteric Fever Engine',
  desc: 'IAP STG 2022, 6.58 — enteric fever: severity triage → uncomplicated (oral cefixime 7–14 d or azithromycin 7 d, review 48–72 h) vs complicated/toxic (admit, IV ceftriaxone 10–14 d, dexamethasone for severe toxicity/shock, surgery for perforation, carbapenem if XDR) → prevention (TCV) + relapse watch',
  group: 'Infectious Disease',
  builtin: true,
  guideline_source: ENTERIC_GUIDELINE,
  ciee_sources: ENTERIC_SOURCES,
  ciee_pathway: ENTERIC_PATHWAY,
};
