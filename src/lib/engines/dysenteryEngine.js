/**
 * Acute Dysentery Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Acute Dysentery (8.91).
 * Indian Academy of Pediatrics. Unlike watery diarrhoea, antibiotics ARE
 * indicated.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const DYS_GUIDELINE = {
  id: 'GS-IAP-STG-2022-DYS',
  guideline_name: 'IAP STG 2022 — Acute Dysentery',
  guideline_section: 'Rehydration & zinc · Antibiotics · 48 h review · Non-response (amoebiasis / HUS)',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1B',
  recommendation_strength: 'Recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022, 8.91 (Acute Dysentery).',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Acute Dysentery',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const DYS_SOURCES = {
  'GS-IAP-STG-2022-DYS-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022, 8.91'),
  'GS-IAP-STG-2022-DYS-PP': mk('Practice point', 'Practice point', 'IAP STG 2022, 8.91'),
};

const B = 'GS-IAP-STG-2022-DYS-1B';
const PP = 'GS-IAP-STG-2022-DYS-PP';

export const DYS_PATHWAY = {
  entry: 'DYS-DN-01',
  nodes: {
    'DYS-DN-01': {
      id: 'DYS-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Dysentery confirmed (visible blood in loose stool)?',
      detail: 'Dysentery = diarrhoea with visible blood (± mucus), commonly Shigella. Assess and correct dehydration first (as for watery diarrhoea) and give zinc.',
      options: [
        { label: 'Yes — blood in stool (dysentery)', next: 'DYS-DN-02' },
        { label: 'No blood — watery diarrhoea', next: 'TERM-AWD', tone: 'muted' },
      ],
    },
    'DYS-DN-02': {
      id: 'DYS-DN-02', type: 'ACTION', source: B, prescribes: 'zinc',
      action: 'Rehydrate (assess dehydration and use Plan A/B/C as for watery diarrhoea) and give zinc for 14 days; continue feeding.',
      rx: { drug: 'Zinc', dose: '<6 months: 10 mg once daily ×14 days · ≥6 months: 20 mg once daily ×14 days', route: 'Oral', duration: '14 days' },
      points: [
        'Assess/correct dehydration first (see Acute Watery Diarrhoea engine for Plan A/B/C volumes)',
        'Continue age-appropriate feeding and breastfeeding',
      ],
      next: 'DYS-DN-03',
    },
    'DYS-DN-03': {
      id: 'DYS-DN-03', type: 'ACTION', critical: true, source: B, prescribes: 'ciprofloxacin',
      action: 'Give antibiotics — UNLIKE watery diarrhoea, dysentery IS an indication for antibiotics (empirical Shigella cover).',
      rx: { drug: 'Ciprofloxacin (or Azithromycin)', dose: 'Ciprofloxacin 15 mg/kg/dose twice daily (max 750 mg/dose) ×3 days · OR Azithromycin 10 mg/kg once daily ×3 days', route: 'Oral', duration: '3 days' },
      points: [
        'Choose per local Shigella sensitivity; azithromycin is a common first line where fluoroquinolone resistance is high',
        'Avoid antimotility agents (loperamide) in dysentery',
      ],
      next: 'DYS-DN-04',
    },
    'DYS-DN-04': {
      id: 'DYS-DN-04', type: 'QUESTION', critical: true, source: B,
      question: 'Review at 48 hours — responding?',
      options: [
        { label: 'Improving — complete the course', next: 'TERM-DONE' },
        { label: 'Not responding at 48 h', next: 'DYS-DN-05', tone: 'danger' },
      ],
    },
    'DYS-DN-05': {
      id: 'DYS-DN-05', type: 'ACTION', critical: true, source: B, prescribes: 'metronidazole',
      action: 'Non-response at 48 h — reconsider the diagnosis: amoebic dysentery (add metronidazole) or a complication such as HUS.',
      rx: { drug: 'Metronidazole (if amoebiasis suspected)', dose: '30–50 mg/kg/day in 3 divided doses ×7–10 days (max 2.25 g/day)', route: 'Oral', duration: '7–10 days' },
      points: [
        'Amoebiasis (E. histolytica): add metronidazole; consider stool microscopy',
        'HUS red flags — pallor, oliguria/anuria, falling platelets, oedema/hypertension after (often Shiga-toxin) dysentery → cross-link to the nephrology HUS/TMA engine; avoid antimotility agents',
        'Switch antibiotic per culture/sensitivity if Shigella confirmed but not responding',
      ],
      safety: [
        { title: 'HUS surveillance', detail: 'A child with dysentery who becomes pale, oliguric or has falling platelets may be developing haemolytic uraemic syndrome — check CBC, film, renal function and refer.' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-AWD': { id: 'TERM-AWD', type: 'TERMINAL', source: PP, action: 'No visible blood — this is acute watery diarrhoea, not dysentery: use the Acute Watery Diarrhoea engine (rehydration + zinc, no routine antibiotics).' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Dysentery management plan generated — rehydration + zinc, empirical antibiotics, 48 h review, and non-response work-up (amoebiasis / HUS) recorded.' },
  },
};

export const DYS_ENGINE = {
  id: 'dysentery-engine',
  label: 'Acute Dysentery Engine',
  desc: 'IAP STG 2022, 8.91 — dysentery (bloody diarrhoea): rehydrate (Plan A/B/C) + zinc ×14 days → antibiotics ARE indicated (ciprofloxacin or azithromycin ×3 d) → review 48 h → non-response: consider amoebiasis (add metronidazole) or HUS (pallor/oliguria/low platelets → nephrology engines)',
  group: 'General Pediatrics',
  builtin: true,
  guideline_source: DYS_GUIDELINE,
  ciee_sources: DYS_SOURCES,
  ciee_pathway: DYS_PATHWAY,
};
