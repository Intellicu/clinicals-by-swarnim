/**
 * Convulsive Status Epilepticus Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Status Epilepticus (§5.49),
 * Indian Academy of Pediatrics. Time-driven, staged (0–5 / 5–15 / >15–20 min).
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner). Treatment is
 * time-driven — the timeline is staged by minutes-since-onset.
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect standard published paediatric values but must be verified before this
 * engine is exposed as clinically validated.
 */

export const SE_GUIDELINE = {
  id: 'GS-IAP-STG-2022-SE',
  guideline_name: 'IAP STG 2022 — Status Epilepticus',
  guideline_section: 'Recognition · Stabilisation · Benzodiazepine · Second-line AED · Refractory · Cause',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1B',
  recommendation_strength: 'Recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022, §5.49 (Status Epilepticus). Companion: NCS/ILAE status epilepticus guidelines.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Status Epilepticus',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const SE_SOURCES = {
  'GS-IAP-STG-2022-SE-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'Recommendation (§5.49)'),
  'GS-IAP-STG-2022-SE-PP': mk('Practice point', 'Practice point', 'Practice point (§5.49)'),
};

const B = 'GS-IAP-STG-2022-SE-1B';
const PP = 'GS-IAP-STG-2022-SE-PP';

export const SE_PATHWAY = {
  entry: 'SE-DN-01',
  nodes: {
    // ── Recognition ────────────────────────────────────────────────────────
    'SE-DN-01': {
      id: 'SE-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Convulsive status epilepticus — seizure >5 min, or clustered seizures without recovery of consciousness?',
      detail: 'Start a seizure timer now — treatment is time-driven and staged by minutes since onset. Note the onset time; it also feeds monitoring and audit.',
      options: [
        { label: 'Yes — ongoing/recurrent seizure ≥5 min', next: 'SE-DN-02', tone: 'danger' },
        { label: 'No — seizure stopped, patient recovering', next: 'TERM-STOPPED', tone: 'muted' },
      ],
    },

    // ── Stabilisation (0 min) ──────────────────────────────────────────────
    'SE-DN-02': {
      id: 'SE-DN-02', type: 'ACTION', source: PP,
      action: 'Stabilise (0 min): airway–breathing–circulation, recovery position, high-flow oxygen, capillary blood glucose, and obtain IV/IO access. Attach monitoring.',
      investigations: [
        { test: 'Capillary blood glucose', detail: 'Immediately — hypoglycaemia is a rapidly reversible cause.' },
        { test: 'IV/IO access + bloods', detail: 'Electrolytes (Na, Ca, Mg), venous gas, and AED levels if on treatment.' },
      ],
      next: 'SE-DN-03',
    },
    'SE-DN-03': {
      id: 'SE-DN-03', type: 'QUESTION', source: B,
      question: 'Hypoglycaemia on capillary glucose?',
      detail: 'Treat a reversible cause before escalating anticonvulsants.',
      options: [
        { label: 'Yes — low glucose', next: 'SE-DN-03B', tone: 'danger' },
        { label: 'No — glucose normal', next: 'SE-DN-04' },
      ],
    },
    'SE-DN-03B': {
      id: 'SE-DN-03B', type: 'ACTION', source: B, prescribes: 'dextrose',
      action: 'Correct hypoglycaemia, then continue the time-based algorithm.',
      rx: { drug: 'Dextrose 10%', dose: '2 mL/kg of 10% dextrose IV bolus', route: 'IV/IO', duration: 'Recheck glucose after bolus' },
      next: 'SE-DN-04',
    },

    // ── First-line benzodiazepine (0–5 min) ────────────────────────────────
    'SE-DN-04': {
      id: 'SE-DN-04', type: 'ACTION', critical: true, source: B, prescribes: 'lorazepam',
      action: 'First-line benzodiazepine (time window 0–5 min). IV/IO lorazepam OR diazepam. If no IV access: buccal or intranasal midazolam. May repeat once at 5 minutes.',
      rx: { drug: 'Lorazepam (or Diazepam / Midazolam)', dose: 'Lorazepam 0.1 mg/kg IV (max 4 mg) · Diazepam 0.3 mg/kg IV/IO (max 10 mg) · No access → Midazolam 0.3 mg/kg buccal / 0.2 mg/kg intranasal (max 10 mg)', route: 'IV / IO / buccal / intranasal', duration: 'May repeat once at 5 min' },
      safety: [
        { title: 'Respiratory depression', detail: 'Have airway/ventilation support ready — benzodiazepines can cause apnoea, especially after a repeat dose.' },
      ],
      next: 'SE-DN-05',
    },
    'SE-DN-05': {
      id: 'SE-DN-05', type: 'QUESTION', critical: true, source: B,
      question: 'Still seizing at 5–15 minutes (after up to 2 benzodiazepine doses)?',
      options: [
        { label: 'Yes — ongoing seizure', next: 'SE-DN-06', tone: 'danger' },
        { label: 'No — seizure terminated', next: 'SE-DN-08' },
      ],
    },

    // ── Second-line AED (5–15 min) ─────────────────────────────────────────
    'SE-DN-06': {
      id: 'SE-DN-06', type: 'ACTION', critical: true, source: B, prescribes: 'levetiracetam',
      action: 'Second-line AED (time window 5–15 min). Levetiracetam OR phenytoin/fosphenytoin OR valproate as an IV loading dose. Prepare airway support.',
      rx: { drug: 'Levetiracetam (or Phenytoin/Fosphenytoin / Valproate)', dose: 'Levetiracetam 40–60 mg/kg IV (max 4.5 g) · Phenytoin/Fosphenytoin 20 mg/kg IV · Valproate 40 mg/kg IV', route: 'IV', duration: 'Single loading dose' },
      safety: [
        { title: 'Phenytoin infusion', detail: 'Infuse phenytoin no faster than 1 mg/kg/min with cardiac monitoring (hypotension/arrhythmia). Avoid valproate where a metabolic/mitochondrial disorder or hepatic dysfunction is suspected.' },
      ],
      next: 'SE-DN-07',
    },
    'SE-DN-07': {
      id: 'SE-DN-07', type: 'QUESTION', critical: true, source: B,
      question: 'Still seizing beyond 15–20 minutes (refractory status epilepticus)?',
      options: [
        { label: 'Yes — refractory', next: 'SE-DN-07B', tone: 'danger' },
        { label: 'No — seizure terminated', next: 'SE-DN-08' },
      ],
    },
    'SE-DN-07B': {
      id: 'SE-DN-07B', type: 'ACTION', critical: true, source: PP, prescribes: 'midazolam',
      action: 'Refractory SE: give a second second-line agent (from SE-DN-06 not yet used), then start an anaesthetic infusion (midazolam or thiopentone) with intubation and ventilation. Transfer to PICU with continuous EEG where available.',
      rx: { drug: 'Midazolam infusion (or Thiopentone)', dose: 'Midazolam 0.1–0.2 mg/kg IV load then 0.05–0.4 mg/kg/h infusion, titrated', route: 'IV — intubated/ventilated', duration: 'Titrate to seizure control on cEEG' },
      safety: [
        { title: 'Airway', detail: 'Anaesthetic infusions require intubation, ventilation and continuous haemodynamic monitoring — do not start without airway control.' },
      ],
      next: 'SE-DN-08',
    },

    // ── Cause & ongoing care ───────────────────────────────────────────────
    'SE-DN-08': {
      id: 'SE-DN-08', type: 'MONITORING', source: B,
      action: 'Find and treat the cause. Correct sodium, calcium and glucose. If CNS infection is possible, start empirical ceftriaxone + acyclovir without delay. Arrange neuroimaging and EEG per indication.',
      monitoring: [
        { parameter: 'Seizure recurrence within 24 h', frequency: 'Continuous / first 24 h', target: 'No recurrence', alert: 'Any recurrence within 24 h', alert_action: 'Reassess AED loading adequacy; consider maintenance AED and cEEG' },
        { parameter: 'Electrolytes + glucose', frequency: 'On admission then per cause', target: 'Normalised Na/Ca/glucose', alert: 'Persistent abnormality', alert_action: 'Correct and re-check' },
      ],
      next: 'TERM-DONE',
    },

    // ── Terminals ──────────────────────────────────────────────────────────
    'TERM-STOPPED': { id: 'TERM-STOPPED', type: 'TERMINAL', source: PP, action: 'Seizure self-terminated (<5 min) with recovery — this is not status epilepticus. Investigate the seizure cause, observe, and treat the underlying trigger (fever, electrolytes, known epilepsy).' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Status epilepticus management plan generated — staged termination, cause work-up and 24-hour monitoring recorded.' },
  },
};

export const STATUS_EPILEPTICUS_ENGINE = {
  id: 'status-epilepticus-engine',
  label: 'Status Epilepticus Engine',
  desc: 'IAP STG 2022 — time-driven convulsive SE: stabilise + glucose (0 min), benzodiazepine (0–5 min), second-line AED (5–15 min), refractory anaesthetic infusion + PICU (>15–20 min), and cause work-up with 24-hour recurrence monitoring',
  group: 'Emergency & Critical Care',
  builtin: true,
  guideline_source: SE_GUIDELINE,
  ciee_sources: SE_SOURCES,
  ciee_pathway: SE_PATHWAY,
};
