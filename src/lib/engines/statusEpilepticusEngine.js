/**
 * Status Epilepticus Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Evaluation and Management of
 * Status Epilepticus in Children (CIEE Engine 7, 26 decision nodes). Indian
 * Academy of Pediatrics. Management proceeds in parallel with diagnosis and is
 * strictly TIME-STAGED against ILAE thresholds: prehospital → arrival 0–5 min →
 * first-line benzodiazepine → 5–20 min second-line loading (+ repeat / alternative)
 * → 30–60 min maintenance & work-up → 1–24 h refractory anaesthesia → >24 h
 * super-refractory → discharge.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const SE_GUIDELINE = {
  id: 'GS-IAP-STG-2022-SE',
  guideline_name: 'IAP STG 2022 — Status Epilepticus',
  guideline_section: 'Recognition · Prehospital · Arrival 0–5 min · Benzodiazepine · Second-line · Refractory · Super-refractory · Discharge',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1B',
  recommendation_strength: 'Recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022 — Status Epilepticus in Children. CIEE Engine 7.',
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
  'GS-IAP-STG-2022-SE-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022 §Status Epilepticus'),
  'GS-IAP-STG-2022-SE-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 §Status Epilepticus'),
};

const B = 'GS-IAP-STG-2022-SE-1B';
const PP = 'GS-IAP-STG-2022-SE-PP';

export const SE_PATHWAY = {
  entry: 'SE-DN-01',
  nodes: {
    // ── PHASE 1 — RECOGNITION (DN-01–03) ─────────────────────────────────────
    'SE-DN-01': {
      id: 'SE-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Convulsing now, or recurrent seizures without recovery of consciousness?',
      detail: 'If yes, clinically treat as status epilepticus and begin management immediately — do not wait for investigations.',
      options: [
        { label: 'Yes — ongoing / recurrent seizure', next: 'SE-DN-02', tone: 'danger' },
        { label: 'No — seizure stopped, recovering', next: 'TERM-STOPPED', tone: 'muted' },
      ],
    },
    'SE-DN-02': {
      id: 'SE-DN-02', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Time threshold (t1) reached?',
      detail: 'Generalised convulsive SE at 5 min; focal impaired-consciousness SE at 10 min — t1 triggers the active SE pathway.',
      options: [
        { label: 'Generalised convulsive ≥5 min', set: { se_type: 'generalised' }, next: 'SE-DN-03', tone: 'danger' },
        { label: 'Focal impaired-consciousness ≥10 min', set: { se_type: 'focal' }, next: 'SE-DN-03', tone: 'danger' },
      ],
    },
    'SE-DN-03': {
      id: 'SE-DN-03', type: 'ASSESSMENT', source: PP,
      question: 'Aetiology category?',
      detail: 'Classify to prioritise the work-up.',
      options: [
        { label: 'Known symptomatic (acute cause)', set: { etiology: 'symptomatic' }, next: 'SE-DN-SETTING' },
        { label: 'Known epilepsy with breakthrough', set: { etiology: 'epilepsy' }, next: 'SE-DN-SETTING' },
        { label: 'Unknown / NORSE-FIRES', set: { etiology: 'unknown' }, next: 'SE-DN-SETTING' },
      ],
    },
    'SE-DN-SETTING': {
      id: 'SE-DN-SETTING', type: 'QUESTION', source: PP,
      question: 'Where is the child now?',
      options: [
        { label: 'Home / clinic / ambulance — no IV access', next: 'SE-DN-05' },
        { label: 'In hospital / IV access available', next: 'SE-DN-07' },
      ],
    },

    // ── PHASE 2 — PREHOSPITAL (DN-04–06) ─────────────────────────────────────
    'SE-DN-05': {
      id: 'SE-DN-05', type: 'ACTION', critical: true, source: B, prescribes: 'midazolam',
      action: 'Prehospital rescue benzodiazepine (no IV) — plus recovery position, airway support and a glucose check.',
      rx: { drug: 'Midazolam (buccal/nasal) — or lorazepam / diazepam', dose: 'Midazolam buccal/nasal 0.1–0.2 mg/kg/dose · Lorazepam IM/intranasal 0.1–0.2 mg/kg · Diazepam IM/rectal 0.5 mg/kg', route: 'Buccal / intranasal / IM / rectal', duration: 'Single rescue dose; transfer to hospital' },
      points: [
        'Recovery position, airway support',
        'Check capillary glucose; treat if low',
      ],
      next: 'SE-DN-06',
    },
    'SE-DN-06': {
      id: 'SE-DN-06', type: 'ACTION', source: PP,
      action: 'Transfer to hospital, preferably with oxygen; maintain airway–breathing–circulation during transfer.',
      next: 'SE-DN-07',
    },

    // ── PHASE 3 — ARRIVAL 0–5 MIN (DN-07–10) ─────────────────────────────────
    'SE-DN-07': {
      id: 'SE-DN-07', type: 'ACTION', source: PP,
      action: 'Arrival (0–5 min) — secure airway, breathing and circulation; give oxygen and ventilation as needed; establish IV access. Take a quick history and examine for aetiology.',
      next: 'SE-DN-08',
    },
    'SE-DN-08': {
      id: 'SE-DN-08', type: 'ACTION', source: PP,
      action: 'Draw investigations in parallel with treatment.',
      investigations: [
        { test: 'Capillary & lab glucose', detail: 'Immediate — reversible cause.' },
        { test: 'CBC, calcium, magnesium, sodium, potassium', detail: 'Correct electrolyte causes.' },
        { test: 'ABG/VBG; blood culture if fever', detail: 'Metabolic assessment; sepsis screen.' },
      ],
      next: 'SE-DN-09',
    },
    'SE-DN-09': {
      id: 'SE-DN-09', type: 'QUESTION', source: B,
      question: 'Hypoglycaemia or a metabolic abnormality present?',
      detail: 'Treat immediately if abnormal before moving to the next line.',
      options: [
        { label: 'Yes — abnormal', next: 'SE-DN-09B', tone: 'danger' },
        { label: 'No — normal', next: 'SE-DN-10' },
      ],
    },
    'SE-DN-09B': {
      id: 'SE-DN-09B', type: 'ACTION', source: B, prescribes: 'dextrose',
      action: 'Correct hypoglycaemia (and other metabolic abnormalities) immediately.',
      rx: { drug: 'Dextrose 10%', dose: '5 mL/kg of 10% dextrose (or 2 mL/kg of 25%)', route: 'IV/IO', duration: 'Recheck glucose' },
      next: 'SE-DN-10',
    },
    'SE-DN-10': {
      id: 'SE-DN-10', type: 'ACTION', critical: true, source: B, prescribes: 'lorazepam',
      action: 'First-line IV benzodiazepine. If no IV access, use IM / intranasal / buccal / rectal routes. May repeat ONCE after 5 min.',
      rx: { drug: 'Lorazepam (or diazepam / midazolam)', dose: 'Lorazepam 0.1 mg/kg IV (max 4 mg) · Diazepam 0.2–0.3 mg/kg IV (max 10 mg) · Midazolam 0.15–0.2 mg/kg (max 5 mg)', route: 'IV (or IM/IN/buccal/rectal)', duration: 'May repeat once at 5 min' },
      safety: [
        { title: 'Respiratory depression', detail: 'Have airway/ventilation support ready — benzodiazepines can cause apnoea, especially after a repeat dose. Do not give more than two benzodiazepine doses.' },
      ],
      next: 'SE-DN-11',
    },

    // ── PHASE 4 — 5–20 MIN SECOND-LINE (DN-11–14) ────────────────────────────
    'SE-DN-11': {
      id: 'SE-DN-11', type: 'QUESTION', critical: true, source: B,
      question: 'Seizures persist after first-line benzodiazepine (up to 2 doses)?',
      options: [
        { label: 'Yes — persists', next: 'SE-DN-12', tone: 'danger' },
        { label: 'No — seizure terminated', next: 'SE-DN-15' },
      ],
    },
    'SE-DN-12': {
      id: 'SE-DN-12', type: 'ACTION', critical: true, source: B, prescribes: 'phenytoin',
      action: 'Second-line loading (5–20 min) — phenytoin or fosphenytoin, with cardiac (HR) monitoring.',
      rx: { drug: 'Phenytoin (or Fosphenytoin)', dose: 'Phenytoin 20 mg/kg in NS at 1 mg/kg/min · Fosphenytoin 20 mg PE/kg at 3 mg/kg/min', route: 'IV (in normal saline)', duration: 'Single loading dose; monitor HR/BP' },
      safety: [
        { title: 'Cardiac monitoring', detail: 'Infuse phenytoin no faster than 1 mg/kg/min with continuous ECG (hypotension/arrhythmia). Do NOT mix phenytoin in dextrose.' },
      ],
      next: 'SE-DN-13',
    },
    'SE-DN-13': {
      id: 'SE-DN-13', type: 'QUESTION', critical: true, source: B,
      question: 'Response after second-line loading?',
      detail: 'If seizures persist, a repeat load may be given: phenytoin 10 mg/kg or fosphenytoin 10 mg PE/kg.',
      options: [
        { label: 'Seizure terminated', next: 'SE-DN-15' },
        { label: 'Persists — repeat load given, still seizing', next: 'SE-DN-14', tone: 'danger' },
      ],
    },
    'SE-DN-14': {
      id: 'SE-DN-14', type: 'ACTION', critical: true, source: B, prescribes: 'levetiracetam',
      action: 'Second-line alternative — if still seizing after phenytoin/fosphenytoin, use valproate, phenobarbitone or levetiracetam.',
      rx: { drug: 'Levetiracetam (or Valproate / Phenobarbitone)', dose: 'Levetiracetam 20–60 mg/kg at 5 mg/kg/min · Valproate 20–40 mg/kg · Phenobarbitone 20 mg/kg in NS at 2 mg/kg/min', route: 'IV', duration: 'Single loading dose' },
      safety: [
        { title: 'Agent choice', detail: 'Avoid valproate where a mitochondrial/metabolic disorder or hepatic dysfunction is suspected. Phenobarbitone adds sedation/respiratory depression — prepare airway support.' },
      ],
      next: 'SE-DN-14Q',
    },
    'SE-DN-14Q': {
      id: 'SE-DN-14Q', type: 'QUESTION', critical: true, source: B,
      question: 'Response after the alternative second-line agent?',
      options: [
        { label: 'Seizure terminated', next: 'SE-DN-15' },
        { label: 'Still seizing (refractory SE)', next: 'SE-DN-18', tone: 'danger' },
      ],
    },

    // ── PHASE 5 — 30–60 MIN MAINTENANCE & WORK-UP (DN-15–17) ─────────────────
    'SE-DN-15': {
      id: 'SE-DN-15', type: 'ACTION', source: B,
      action: 'Seizure controlled (30–60 min) — start maintenance, assess for PICU/raised ICP, and escalate the aetiology work-up.',
      points: [
        'Start a maintenance dose of the chosen AED after 8–12 hours',
        'Shift to PICU if unstable or raised ICP; treat raised ICP with mannitol / 3% NaCl as indicated',
        'Aetiology work-up: MRI brain ± contrast (CT if unstable), CSF for neuroinfection, autoimmune / metabolic / genetic studies as indicated',
      ],
      next: 'SE-DN-DISCHARGE',
    },

    // ── PHASE 6 — 1–24 H REFRACTORY (DN-18–21) ───────────────────────────────
    'SE-DN-18': {
      id: 'SE-DN-18', type: 'ACTION', critical: true, source: B, prescribes: 'midazolam',
      action: 'Refractory SE (1–24 h) — enter the anaesthetic-infusion pathway; use bedside EEG to titrate when available.',
      rx: { drug: 'Midazolam infusion (or thiopentone / propofol / high-dose phenobarbitone)', dose: 'Midazolam 0.1–0.2 mg/kg IV load then 0.05–0.4 mg/kg/h infusion, titrate to burst suppression', route: 'IV — intubated & ventilated', duration: 'Titrate on cEEG; add enteral topiramate; consider ketamine while tapering' },
      safety: [
        { title: 'Airway & organ surveillance', detail: 'Anaesthetic infusions require intubation, ventilation and continuous haemodynamic monitoring. Watch for raised ICP, rhabdomyolysis, arrhythmia, sepsis and AED hypersensitivity.' },
      ],
      next: 'SE-DN-19Q',
    },
    'SE-DN-19Q': {
      id: 'SE-DN-19Q', type: 'QUESTION', critical: true, source: B,
      question: 'Seizures controlled on anaesthetic infusion within 24 hours?',
      options: [
        { label: 'Controlled — begin taper', next: 'SE-DN-15' },
        { label: 'Continues beyond 24 h (super-refractory)', next: 'SE-DN-22', tone: 'danger' },
      ],
    },

    // ── PHASE 7 — >24 H SUPER-REFRACTORY (DN-22–23) ──────────────────────────
    'SE-DN-22': {
      id: 'SE-DN-22', type: 'ACTION', critical: true, source: PP,
      action: 'Super-refractory SE (>24 h despite anaesthesia) — escalate to multidisciplinary PICU-based therapies.',
      points: [
        'Consider ketogenic diet, immunotherapy, VNS, therapeutic hypothermia, and epilepsy surgery in selected cases',
        'Family counselling: discuss mortality/morbidity risk explicitly and document goals of care',
      ],
      next: 'SE-DN-15',
    },

    // ── PHASE 8 — DISCHARGE / RECOVERY (DN-24–26) ────────────────────────────
    'SE-DN-DISCHARGE': {
      id: 'SE-DN-DISCHARGE', type: 'MONITORING', source: B,
      action: 'Discharge & recovery planning.',
      points: [
        'Caregiver education: first aid, recovery position, and rescue-medication use for all caregivers',
        'Known-epilepsy breakthrough rule: if on low maintenance doses give half the maintenance dose; if on larger doses avoid re-loading and continue the maintenance dose',
        'Plan neurology follow-up, a seizure action plan and recurrence prevention',
      ],
      monitoring: [
        { parameter: 'Seizure recurrence', frequency: 'First 24 h then per plan', target: 'No recurrence', alert: 'Any recurrence', alert_action: 'Reassess AED loading adequacy; consider maintenance AED and cEEG' },
      ],
      next: 'TERM-DONE',
    },

    // ── Terminals ────────────────────────────────────────────────────────────
    'TERM-STOPPED': { id: 'TERM-STOPPED', type: 'TERMINAL', source: PP, action: 'Seizure self-terminated with recovery — not status epilepticus. Investigate the cause, observe, and treat the trigger (fever, electrolytes, known epilepsy).' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Status epilepticus management plan generated — time-staged termination, maintenance, aetiology work-up, refractory/super-refractory escalation and discharge education recorded.' },
  },
};

export const STATUS_EPILEPTICUS_ENGINE = {
  id: 'status-epilepticus-engine',
  label: 'Status Epilepticus Engine',
  desc: 'IAP STG 2022 — time-staged convulsive/focal SE: recognition + ILAE t1 → prehospital rescue benzodiazepine → arrival 0–5 min ABC + glucose/metabolic → first-line IV benzodiazepine → 5–20 min phenytoin/fosphenytoin (+ repeat load, then valproate/phenobarbitone/levetiracetam) → 30–60 min maintenance + MRI/CSF work-up → 1–24 h EEG-guided anaesthetic infusion → >24 h super-refractory (ketogenic/immunotherapy) → discharge education',
  group: 'Emergency & Critical Care',
  builtin: true,
  guideline_source: SE_GUIDELINE,
  ciee_sources: SE_SOURCES,
  ciee_pathway: SE_PATHWAY,
};
