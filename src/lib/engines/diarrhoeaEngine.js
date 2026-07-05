/**
 * Acute Watery Diarrhoea (AWD) Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Acute Watery Diarrhoea
 * (§8.90) with WHO dehydration plans A/B/C. Indian Academy of Pediatrics.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses/
 * fluid volumes reflect the IAP STG 2022 / WHO algorithm but must be verified
 * before this engine is exposed as clinically validated.
 */

export const AWD_GUIDELINE = {
  id: 'GS-IAP-STG-2022-AWD',
  guideline_name: 'IAP STG 2022 — Acute Watery Diarrhoea',
  guideline_section: 'Dehydration assessment · Plan A/B/C · Zinc & feeding · Danger signs',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1A',
  recommendation_strength: 'Strong recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022 §8.90 (Acute Watery Diarrhoea). Companion: WHO/IMNCI.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Acute Watery Diarrhoea',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const AWD_SOURCES = {
  'GS-IAP-STG-2022-AWD-1A': mk('1A', 'Strong recommendation, high-quality evidence', 'IAP STG 2022 §8.90'),
  'GS-IAP-STG-2022-AWD-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 §8.90'),
};

const A = 'GS-IAP-STG-2022-AWD-1A';
const PP = 'GS-IAP-STG-2022-AWD-PP';

export const AWD_PATHWAY = {
  entry: 'AWD-DN-01',
  nodes: {
    'AWD-DN-01': {
      id: 'AWD-DN-01', type: 'ASSESSMENT', critical: true, source: A,
      question: 'Dehydration status (WHO/IMNCI)?',
      detail: 'Assess general condition, eyes, thirst and skin pinch. Classify to select the rehydration plan.',
      points: [
        'No dehydration: well/alert, drinks normally, skin pinch retracts immediately',
        'Some dehydration: restless/irritable, sunken eyes, drinks eagerly/thirsty, skin pinch slow',
        'Severe dehydration: lethargic/unconscious, sunken eyes, unable to drink/drinks poorly, skin pinch very slow (≥2 s)',
      ],
      options: [
        { label: 'No dehydration → Plan A', set: { dehydration: 'none' }, next: 'AWD-DN-02A' },
        { label: 'Some dehydration → Plan B', set: { dehydration: 'some' }, next: 'AWD-DN-02B' },
        { label: 'Severe dehydration → Plan C', set: { dehydration: 'severe' }, next: 'AWD-DN-02C', tone: 'danger' },
      ],
    },
    'AWD-DN-02A': {
      id: 'AWD-DN-02A', type: 'ACTION', source: A,
      action: 'Plan A — home management. Give extra fluids and ORS after each loose stool.',
      rx: { drug: 'Low-osmolarity ORS (after each stool)', dose: '<2 years: 50–100 mL after each loose stool · ≥2 years: 100–200 mL after each loose stool', route: 'Oral', duration: 'Until diarrhoea stops' },
      points: [
        'Continue breastfeeding/feeding; give extra home fluids',
        'Teach the mother the 3 rules of home treatment and danger signs',
      ],
      next: 'AWD-DN-03',
    },
    'AWD-DN-02B': {
      id: 'AWD-DN-02B', type: 'ACTION', critical: true, source: A,
      action: 'Plan B — supervised ORS over 4 hours, then reassess.',
      rx: { drug: 'Low-osmolarity ORS', dose: '75 mL/kg over 4 hours (give by spoon/cup; if vomiting, wait 10 min then give more slowly)', route: 'Oral (NG if unable)', duration: 'Reassess at 4 hours' },
      points: [
        'Reassess hydration after 4 hours and reclassify (Plan A / continue B / move to C)',
        'Continue breastfeeding; offer plain water in addition to ORS',
      ],
      monitoring: [
        { parameter: 'Hydration reassessment', frequency: 'At 4 hours', target: 'Rehydrated → Plan A', alert: 'Still dehydrated / worsening', alert_action: 'Repeat/continue Plan B, or escalate to Plan C' },
      ],
      next: 'AWD-DN-03',
    },
    'AWD-DN-02C': {
      id: 'AWD-DN-02C', type: 'ACTION', critical: true, source: A,
      action: 'Plan C — severe dehydration: give IV fluids urgently, and ORS once the child can drink.',
      rx: { drug: 'Ringer lactate / normal saline (IV)', dose: '100 mL/kg total. <12 months: 30 mL/kg over 1 h then 70 mL/kg over 5 h. ≥12 months: 30 mL/kg over 30 min then 70 mL/kg over 2.5 h. Add ORS 5 mL/kg/h once able to drink.', route: 'IV/IO', duration: 'Reassess every 15–30 min; repeat 30 mL/kg if pulse still weak' },
      points: [
        'Reassess frequently; repeat the first bolus if the radial pulse is still weak/absent',
        'Start ORS 5 mL/kg/h once the child can drink; admit',
      ],
      monitoring: [
        { parameter: 'Pulse, perfusion, hydration', frequency: 'Every 15–30 min', target: 'Strong pulse, rehydrated', alert: 'Persistent weak pulse / shock', alert_action: 'Repeat 30 mL/kg; treat as shock; escalate' },
      ],
      next: 'AWD-DN-03',
    },
    'AWD-DN-03': {
      id: 'AWD-DN-03', type: 'ACTION', source: A, prescribes: 'zinc',
      action: 'Give zinc for 14 days and continue feeding — for ALL children with diarrhoea regardless of dehydration.',
      rx: { drug: 'Zinc', dose: '<6 months: 10 mg once daily ×14 days · ≥6 months: 20 mg once daily ×14 days', route: 'Oral', duration: '14 days' },
      points: [
        'Continue age-appropriate feeding and breastfeeding throughout',
        'No routine antibiotics for watery diarrhoea; no antidiarrhoeals/antiemetics as a rule',
      ],
      next: 'AWD-DN-04',
    },
    'AWD-DN-04': {
      id: 'AWD-DN-04', type: 'MONITORING', source: PP,
      action: 'Danger-sign safety-net & follow-up — refer if any danger sign develops.',
      points: [
        'Refer/return for: blood in stool, high fever, persistent vomiting, poor drinking, no improvement in 3 days, or severe acute malnutrition (SAM)',
        'SAM changes fluid management — rehydrate cautiously (ReSoMal) and refer',
      ],
      monitoring: [
        { parameter: 'Danger signs & hydration', frequency: 'Ongoing / daily at home', target: 'Improving, feeding well', alert: 'Blood in stool / persistent vomiting / no improvement / SAM', alert_action: 'Refer — consider dysentery, complications, or SAM protocol' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: A, action: 'Acute watery diarrhoea plan generated — dehydration classification, Plan A/B/C rehydration, zinc ×14 days + continued feeding, and danger-sign safety-net recorded.' },
  },
};

export const AWD_ENGINE = {
  id: 'diarrhoea-engine',
  label: 'Acute Watery Diarrhoea Engine',
  desc: 'IAP STG 2022 §8.90 — classify dehydration (none/some/severe) → Plan A (home ORS after each stool) / Plan B (75 mL/kg ORS over 4 h, reassess) / Plan C (IV 100 mL/kg age-specific split + ORS 5 mL/kg/h) → zinc ×14 days + continue feeding for all → danger-sign safety-net (blood, high fever, persistent vomiting, no improvement, SAM)',
  group: 'General Pediatrics',
  builtin: true,
  guideline_source: AWD_GUIDELINE,
  ciee_sources: AWD_SOURCES,
  ciee_pathway: AWD_PATHWAY,
};
