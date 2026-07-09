/**
 * Anaphylaxis Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Anaphylaxis (CIEE Engine 5,
 * 14 decision nodes). Indian Academy of Pediatrics. The IAP algorithm is
 * strictly TIME-STAGED — First 1 min → 1–5 min → 5–10 min → 10–20 min →
 * refractory — with a fixed escalation of adrenaline (1st IM → 2nd IM → 3rd IM
 * → IV adrenaline infusion → noradrenaline / glucagon). Each stage ends in a
 * timed reassessment (review); there is NO open-ended repeat loop.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const ANAPHYLAXIS_GUIDELINE = {
  id: 'GS-IAP-STG-2022-ANA',
  guideline_name: 'IAP STG 2022 — Anaphylaxis',
  guideline_section: 'Recognition · First-minute actions · Timed escalation (1–5 / 5–10 / 10–20 min) · Refractory · Observation',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: 'Practice point',
  recommendation_strength: 'Practice point',
  reference: 'IAP Standard Treatment Guidelines 2022 — Anaphylaxis (time-staged algorithm). CIEE Engine 5.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Anaphylaxis',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const ANAPHYLAXIS_SOURCES = {
  'GS-IAP-STG-2022-ANA-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 Anaphylaxis'),
  'GS-IAP-STG-2022-ANA-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022 Anaphylaxis'),
};

const PP = 'GS-IAP-STG-2022-ANA-PP';
const B = 'GS-IAP-STG-2022-ANA-1B';

export const ANAPHYLAXIS_PATHWAY = {
  entry: 'ANA-DN-01',
  nodes: {
    // ── PHASE 1 — DIAGNOSIS (DN-01–05) ───────────────────────────────────────
    'ANA-DN-01': {
      id: 'ANA-DN-01', type: 'ASSESSMENT', critical: true, source: PP,
      question: 'Clinical suspicion — does the child meet anaphylaxis criteria?',
      detail: 'Anaphylaxis is a CLINICAL diagnosis after a likely trigger (food, drug, insect, latex, vaccine, exercise). Skin signs are NOT required — up to 20% have none. Do not wait for labs or IV access.',
      points: [
        'Criteria 1 — acute skin/mucosal involvement (hives, flush, lip/tongue swelling) PLUS respiratory or circulatory compromise',
        'Criteria 2 — two or more systems involved (skin, respiratory, circulatory, GI) after a likely allergen',
        'Criteria 3 — known allergen + reduced BP for age (or >30% fall in SBP)',
      ],
      options: [
        { label: 'Yes — any criterion met (treat as anaphylaxis)', set: { anaphylaxis: true }, next: 'ANA-DN-06', tone: 'danger' },
        { label: 'Vasovagal pattern (pallor, bradycardia, no wheeze, improves supine)', next: 'TERM-VASOVAGAL', tone: 'muted' },
        { label: 'Mild allergic reaction only — no ABC compromise', next: 'TERM-MILD', tone: 'muted' },
      ],
    },

    // ── PHASE 2 — FIRST MINUTE ACTIONS (DN-06, DN-07, DN-08) ─────────────────
    'ANA-DN-06': {
      id: 'ANA-DN-06', type: 'ACTION', critical: true, source: PP,
      action: 'Initial management (FIRST 1 MINUTE) — position, ABC, oxygen and remove the trigger, then give adrenaline without delay.',
      points: [
        'Keep supine (sitting if respiratory distress / nausea / vomiting; left-lateral if pregnant)',
        'Assess airway, breathing, circulation, heart rate, BP, SpO₂',
        'Provide O₂ 10–15 L/min via non-rebreather mask if respiratory distress or shock',
        'Identify and remove the allergic trigger if possible (e.g. stop drug, remove insect sting)',
      ],
      safety: [
        { title: 'Do not delay adrenaline', detail: 'IM adrenaline must be given immediately — never wait for IV access, labs or tryptase (SUP-01, SUP-03).' },
      ],
      next: 'ANA-DN-08',
    },
    'ANA-DN-08': {
      id: 'ANA-DN-08', type: 'ACTION', critical: true, source: B, prescribes: 'adrenaline',
      action: '1st dose IM adrenaline into the anterolateral thigh (First 1 minute).',
      rx: { drug: 'Adrenaline (1:1000) — 1st IM dose', dose: '0.01 mg/kg of 1:1000 (1 mg/mL), max 0.5 mg', route: 'IM — anterolateral thigh', duration: 'Reassess at 5 min; repeat q5–10 min as needed' },
      monitoring: [
        { parameter: 'BP, SpO₂, wheeze/stridor', frequency: 'Every few minutes in the first 30 min', target: 'Improving airway/breathing/circulation', alert: 'No improvement at ~5 min', alert_action: 'Add stage 1–5 min supportive care and prepare 2nd IM dose' },
      ],
      next: 'ANA-DN-09',
    },

    // ── 1–5 MIN — supportive care (DN-09 respiratory, DN-10 hypotension) ─────
    'ANA-DN-09': {
      id: 'ANA-DN-09', type: 'ACTION', source: B,
      action: '1 to 5 minutes — add supportive care by the dominant compromise (respiratory and/or circulatory), while the 1st adrenaline dose takes effect.',
      points: [
        'RESPIRATORY DISTRESS: sitting position; high-flow O₂ via HFNC and plan for intubation',
        'Stridor → 1st nebulised adrenaline 0.5 mL/kg of 1:1000 (max 5 mL)',
        'Wheeze → 1st nebulised salbutamol 0.15 mg/kg',
        'HYPOTENSION / POOR PERFUSION / LOSS OF CONSCIOUSNESS: supine position; establish IV/IO access',
        '1st bolus normal saline 20 mL/kg by IV/IO rapid-push technique',
      ],
      next: 'ANA-Q1',
    },
    'ANA-Q1': {
      id: 'ANA-Q1', type: 'QUESTION', critical: true, source: B,
      question: 'Reassess at ~5 minutes — has the child improved?',
      detail: 'Timed review after the 1st IM adrenaline dose + 1–5 min supportive care.',
      options: [
        { label: 'Improved — airway/breathing/circulation recovering', next: 'ANA-DN-OBS' },
        { label: 'No improvement (≥5 min) — escalate', next: 'ANA-DN-10', tone: 'danger' },
      ],
    },

    // ── 5–10 MIN — 2nd IM adrenaline + escalation (DN-11 prep) ───────────────
    'ANA-DN-10': {
      id: 'ANA-DN-10', type: 'ACTION', critical: true, source: B, prescribes: 'adrenaline',
      action: '5 to 10 minutes — if no improvement, give the 2nd dose of IM adrenaline and escalate supportive care.',
      rx: { drug: 'Adrenaline (1:1000) — 2nd IM dose', dose: '0.01 mg/kg of 1:1000 (1 mg/mL), max 0.5 mg', route: 'IM — anterolateral thigh', duration: 'Reassess at ~10 min' },
      points: [
        'Establish IV/IO access if not already done; prepare for difficult intubation',
        'Stridor → 2nd nebulised adrenaline 0.5 mL/kg; Wheeze → 2nd nebulised salbutamol 0.15 mg/kg',
        'Hypotension → 2nd bolus normal saline 20 mL/kg by IV/IO rapid push',
        'Prepare for IV adrenaline; ALERT Paediatric ICU / tertiary care centre',
      ],
      next: 'ANA-Q2',
    },
    'ANA-Q2': {
      id: 'ANA-Q2', type: 'QUESTION', critical: true, source: B,
      question: 'Reassess at ~10 minutes — has the child improved?',
      options: [
        { label: 'Improved', next: 'ANA-DN-OBS' },
        { label: 'No improvement (≥10 min) — escalate', next: 'ANA-DN-12', tone: 'danger' },
      ],
    },

    // ── 10–20 MIN — 3rd IM adrenaline + IV adrenaline infusion (DN-12) ───────
    'ANA-DN-12': {
      id: 'ANA-DN-12', type: 'ACTION', critical: true, source: B, prescribes: 'adrenaline',
      action: '10 to 20 minutes — if no improvement, give the 3rd dose of IM adrenaline and START an IV adrenaline infusion; proceed to intubation and transfer to PICU.',
      rx: { drug: 'Adrenaline — 3rd IM dose, then IV infusion', dose: '3rd IM: 0.01 mg/kg of 1:1000 (max 0.5 mg) · then IV adrenaline infusion 0.05 mcg/kg/min, titrate by 0.02 mcg/kg/min to effect', route: 'IM then IV infusion', duration: 'Titrate infusion to response' },
      points: [
        'RESPIRATORY: 3rd nebulised adrenaline 0.5 mL/kg (stridor) / 3rd nebulised salbutamol 0.15 mg/kg (wheeze); proceed to intubation',
        'HYPOTENSION / poor perfusion / LOC: start IV adrenaline infusion 0.05 mcg/kg/min, titrate up by 0.02 mcg/kg/min to effect',
        'Transfer to Paediatric ICU / tertiary care centre',
      ],
      next: 'ANA-Q3',
    },
    'ANA-Q3': {
      id: 'ANA-Q3', type: 'QUESTION', critical: true, source: B,
      question: 'Reassess — responding to the 3rd dose / IV adrenaline infusion?',
      options: [
        { label: 'Improved', next: 'ANA-DN-OBS' },
        { label: 'Still no improvement — suspect refractory anaphylaxis', next: 'ANA-DN-REFRACTORY', tone: 'danger' },
      ],
    },

    // ── REFRACTORY ANAPHYLAXIS (DN-11, DN-12) ────────────────────────────────
    'ANA-DN-REFRACTORY': {
      id: 'ANA-DN-REFRACTORY', type: 'ACTION', critical: true, source: B, prescribes: 'norepinephrine',
      action: 'Refractory anaphylaxis — add a second vasoactive agent and manage per Paediatric ICU protocols.',
      rx: { drug: 'Noradrenaline (norepinephrine) infusion', dose: 'Persistent hypotension: 0.05 mcg/kg/min, titrate by 0.02 mcg/kg/min to effect (max 2 mcg/kg/min)', route: 'IV infusion', duration: 'Titrate to perfusion; central access ASAP' },
      points: [
        'IV glucagon (persistent anaphylaxis or patient on beta-blockers): 20–30 mcg/kg/dose (max 1 mg) over 5 min, then 5–15 mcg/min titrated to clinical effect',
        'Continue IV adrenaline; add noradrenaline for persistent hypotension',
        'Manage as per Paediatric ICU protocols',
      ],
      safety: [
        { title: 'Beta-blocker use', detail: 'If the child is on a beta-blocker and remains refractory to adrenaline, give IV glucagon (bolus then infusion).' },
      ],
      next: 'ANA-DN-OBS',
    },

    // ── PHASE 4 — OBSERVATION & DISPOSITION (DN-13, DN-14) ───────────────────
    'ANA-DN-OBS': {
      id: 'ANA-DN-OBS', type: 'MONITORING', source: PP,
      action: 'Observation & disposition — observe for a biphasic reaction, then plan admission or discharge.',
      points: [
        'Observe at least 4 hours after the LAST IM adrenaline dose (minimum 3 days if severe/hospitalised)',
        'Biphasic reactions may occur 1–72 h after improvement; protracted reactions may persist 24–36 h',
        'Admit if: hypotension/tachycardia, SpO₂ <95% room air, severe/protracted reaction, asthma/arrhythmia/mastocytosis, or late-evening/remote presentation',
        'Discharge (once stable): prescribe an adrenaline auto-injector, a written anaphylaxis action plan, trigger-avoidance counselling and the emergency number; refer to allergy/immunology',
      ],
      monitoring: [
        { parameter: 'BP, SpO₂, wheeze/stridor', frequency: 'Every few minutes for the first 30 min → hourly ×24 h → 2-hourly ×48 h', target: 'Sustained stability, no recurrence', alert: 'Recurrence of ABC compromise (biphasic)', alert_action: 'Re-treat as anaphylaxis; extend observation / admit' },
      ],
      next: 'TERM-DONE',
    },

    // ── Terminals ────────────────────────────────────────────────────────────
    'TERM-VASOVAGAL': { id: 'TERM-VASOVAGAL', type: 'TERMINAL', source: PP, action: 'Vasovagal reaction, not anaphylaxis (pallor, bradycardia, no wheeze, improves supine) — lay flat, elevate legs, observe. Adrenaline is not indicated. Reassess and re-enter this engine if anaphylaxis features develop.' },
    'TERM-MILD': { id: 'TERM-MILD', type: 'TERMINAL', source: PP, action: 'Mild allergic reaction without ABC compromise — oral antihistamine and observation. Safety-net: return immediately if any airway, breathing or circulation symptom develops.' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: PP, action: 'Anaphylaxis management complete — timed adrenaline escalation, supportive care, observation for biphasic reaction, and auto-injector + action-plan discharge recorded.' },
  },
};

export const ANAPHYLAXIS_ENGINE = {
  id: 'anaphylaxis-engine',
  label: 'Anaphylaxis Engine',
  desc: 'IAP STG 2022 — time-staged anaphylaxis: clinical recognition → first-minute position/O₂/trigger + 1st IM adrenaline → 1–5 min supportive care → timed reassessment → 2nd IM (5–10 min) → 3rd IM + IV adrenaline infusion (10–20 min) → refractory (noradrenaline / glucagon, PICU) → biphasic observation & auto-injector discharge',
  group: 'Emergency & Critical Care',
  builtin: true,
  guideline_source: ANAPHYLAXIS_GUIDELINE,
  ciee_sources: ANAPHYLAXIS_SOURCES,
  ciee_pathway: ANAPHYLAXIS_PATHWAY,
};
