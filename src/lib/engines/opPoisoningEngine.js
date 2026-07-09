/**
 * Organophosphate (OP) Poisoning Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Organophosphate Poisoning
 * (5.52). Indian Academy of Pediatrics.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner). Atropine is
 * titrated by DOUBLING every 5 minutes until atropinised — an explicit,
 * time-linked escalation.
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const OPP_GUIDELINE = {
  id: 'GS-IAP-STG-2022-OPP',
  guideline_name: 'IAP STG 2022 — Organophosphate Poisoning',
  guideline_section: 'Recognition · Decontamination · Atropinisation · Pralidoxime · Intermediate-syndrome surveillance',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: 'Practice point',
  recommendation_strength: 'Practice point',
  reference: 'IAP Standard Treatment Guidelines 2022, 5.52 (Organophosphate Poisoning).',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — OP Poisoning',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const OPP_SOURCES = {
  'GS-IAP-STG-2022-OPP-PP': mk('Practice point', 'Practice point', 'IAP STG 2022, 5.52'),
  'GS-IAP-STG-2022-OPP-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022, 5.52'),
};

const PP = 'GS-IAP-STG-2022-OPP-PP';
const B = 'GS-IAP-STG-2022-OPP-1B';

export const OPP_PATHWAY = {
  entry: 'OPP-DN-01',
  nodes: {
    'OPP-DN-01': {
      id: 'OPP-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Cholinergic toxidrome after pesticide contact?',
      detail: 'Recognise the muscarinic + nicotinic + CNS picture with a history of organophosphate/carbamate exposure.',
      points: [
        'Muscarinic (DUMBELS): Diarrhoea, Urination, Miosis, Bradycardia/Bronchorrhoea/Bronchospasm, Emesis, Lacrimation, Salivation',
        'Nicotinic: fasciculations, muscle weakness, tachycardia, hypertension',
        'CNS: agitation, seizures, coma; garlic-like odour',
      ],
      options: [
        { label: 'Yes — cholinergic toxidrome', next: 'OPP-DN-02', tone: 'danger' },
        { label: 'No — alternative diagnosis', next: 'TERM-ALT', tone: 'muted' },
      ],
    },
    'OPP-DN-02': {
      id: 'OPP-DN-02', type: 'ACTION', critical: true, source: PP,
      action: 'ABC and decontamination — staff wear PPE (avoid secondary contamination).',
      points: [
        'Secure airway (copious secretions), give O₂, support ventilation; suction secretions',
        'Remove all clothing; wash skin, hair and eyes with soap and water',
        'Staff: gloves/gown/eye protection — the patient and vomit/secretions are contaminated',
        'IV access; cardiac monitor; check glucose',
      ],
      next: 'OPP-DN-03',
    },
    'OPP-DN-03': {
      id: 'OPP-DN-03', type: 'ACTION', critical: true, source: B, prescribes: 'atropine',
      action: 'Atropinisation — give atropine and DOUBLE the dose every 5 minutes until atropinised, then start an infusion.',
      rx: { drug: 'Atropine', dose: '0.02 mg/kg IV (min 0.1 mg); DOUBLE every 5 min until atropinised, then infusion ~10–20% of the total atropinising dose per hour', route: 'IV', duration: 'Titrate to atropinisation endpoints; continue infusion' },
      points: [
        'Atropinisation endpoints: clear chest on auscultation (no bronchorrhoea), dry axillae, heart rate >80–90/min, systolic BP adequate, pupils no longer pinpoint',
        'Do NOT titrate to pupils alone; the target is secretions + chest + haemodynamics',
      ],
      safety: [
        { title: 'Titrate to secretions, not tachycardia', detail: 'Continue doubling until the chest is clear and secretions dry — tachycardia alone is not a reason to withhold atropine.' },
      ],
      next: 'OPP-DN-04',
    },
    'OPP-DN-04': {
      id: 'OPP-DN-04', type: 'QUESTION', critical: true, source: B,
      question: 'Organophosphate (not a pure carbamate)?',
      detail: 'Pralidoxime reactivates acetylcholinesterase in OP poisoning; it is not needed for pure carbamate poisoning (self-limiting).',
      options: [
        { label: 'Organophosphate (or unknown) — add pralidoxime', next: 'OPP-DN-05', tone: 'danger' },
        { label: 'Pure carbamate — atropine alone', next: 'OPP-DN-06' },
      ],
    },
    'OPP-DN-05': {
      id: 'OPP-DN-05', type: 'ACTION', critical: true, source: B, prescribes: 'pralidoxime',
      action: 'Add pralidoxime EARLY, alongside (not instead of) atropine.',
      rx: { drug: 'Pralidoxime (2-PAM)', dose: '25–50 mg/kg (max 2 g) IV over 30 min, then infusion 10–20 mg/kg/h (or repeat 25–50 mg/kg q6–8h)', route: 'IV', duration: 'Continue per response / cholinesterase recovery' },
      safety: [
        { title: 'Give early, with atropine', detail: 'Pralidoxime is most effective before the enzyme–OP bond "ages" — start early and always alongside atropine, never as monotherapy.' },
      ],
      next: 'OPP-DN-06',
    },
    'OPP-DN-06': {
      id: 'OPP-DN-06', type: 'MONITORING', source: B,
      action: 'Ongoing care & surveillance — watch for the intermediate syndrome and avoid contraindicated drugs; address intent and mental health.',
      points: [
        'Intermediate syndrome (24–96 h): proximal muscle & respiratory weakness — may need ventilation; keep monitoring after initial recovery',
        'AVOID morphine, succinylcholine and aminophylline',
        'Address intent (deliberate vs accidental), safe-storage counselling, and mental-health referral where relevant',
      ],
      monitoring: [
        { parameter: 'Respiratory strength & secretions', frequency: 'Continuous → then serial for 24–96 h', target: 'Adequate ventilation, dry chest', alert: 'Rising secretions or new proximal/respiratory weakness', alert_action: 'Re-atropinise / ventilate; suspect intermediate syndrome' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-ALT': { id: 'TERM-ALT', type: 'TERMINAL', source: PP, action: 'Cholinergic toxidrome not supported — reconsider the differential (other poisoning, CNS/metabolic cause) and treat accordingly.' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'OP poisoning management plan generated — decontamination, atropinisation, pralidoxime and intermediate-syndrome surveillance recorded.' },
  },
};

export const OPP_ENGINE = {
  id: 'op-poisoning-engine',
  label: 'Organophosphate Poisoning Engine',
  desc: 'IAP STG 2022, 5.52 — OP poisoning: recognise cholinergic toxidrome (DUMBELS) → ABC + decontamination (PPE) → atropine DOUBLED q5min to atropinisation then infusion → add pralidoxime early if organophosphate (not pure carbamate) → intermediate-syndrome surveillance, avoid morphine/succinylcholine/aminophylline',
  group: 'Emergency & Critical Care',
  builtin: true,
  guideline_source: OPP_GUIDELINE,
  ciee_sources: OPP_SOURCES,
  ciee_pathway: OPP_PATHWAY,
};
