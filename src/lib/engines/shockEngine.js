/**
 * Shock Management (Office/Ward) Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Shock in Office Practice
 * (CIEE Engine 6, 28 decision nodes). Indian Academy of Pediatrics.
 * Time- and dose-linked pathway for hypovolemic, septic/distributive,
 * anaphylactic, cardiogenic and obstructive shock: recognition → first 5 min →
 * fluid resuscitation by type → adjuncts → vasoactive escalation (cold/warm)
 * → endpoints → refractory escalation → PICU transfer.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const SHOCK_GUIDELINE = {
  id: 'GS-IAP-STG-2022-SHK',
  guideline_name: 'IAP STG 2022 — Shock in Office Practice',
  guideline_section: 'Recognition · First 5 min · Fluid by type · Adjuncts · Vasoactive escalation · Endpoints · Refractory · Transfer',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: 'Practice point',
  recommendation_strength: 'Practice point',
  reference: 'IAP Standard Treatment Guidelines 2022 — Shock in Office Practice. CIEE Engine 6.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Shock',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const SHOCK_SOURCES = {
  'GS-IAP-STG-2022-SHK-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 §Shock'),
  'GS-IAP-STG-2022-SHK-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022 §Shock'),
};

const PP = 'GS-IAP-STG-2022-SHK-PP';
const B = 'GS-IAP-STG-2022-SHK-1B';

export const SHOCK_PATHWAY = {
  entry: 'SHK-DN-01',
  nodes: {
    // ── PHASE 1 — RECOGNITION (DN-01–03) ─────────────────────────────────────
    'SHK-DN-01': {
      id: 'SHK-DN-01', type: 'ASSESSMENT', critical: true, source: PP,
      question: 'Is shock suspected?',
      detail: 'Recognise shock from perfusion — hypotension is a LATE sign, do not wait for it.',
      points: [
        'Tachycardia, poor/weak pulses, CRT >2 s, cold extremities (or warm/flash in warm shock)',
        'Reduced urine output, altered mentation, tachypnoea',
        'Hypotension is a late/decompensated sign',
      ],
      options: [
        { label: 'Yes — perfusion abnormal (shock)', next: 'SHK-DN-02', tone: 'danger' },
        { label: 'No — perfusion normal', next: 'TERM-NO-SHOCK', tone: 'muted' },
      ],
    },
    'SHK-DN-02': {
      id: 'SHK-DN-02', type: 'ASSESSMENT', source: PP,
      question: 'Shock stage?',
      detail: 'Treat BEFORE hypotension develops if possible.',
      options: [
        { label: 'Compensated (normal BP, abnormal perfusion)', set: { stage: 'compensated' }, next: 'SHK-DN-03' },
        { label: 'Hypotensive (decompensated)', set: { stage: 'hypotensive' }, next: 'SHK-DN-03', tone: 'danger' },
      ],
    },
    'SHK-DN-03': {
      id: 'SHK-DN-03', type: 'ASSESSMENT', critical: true, source: PP,
      question: 'Likely shock type?',
      detail: 'Identify the type from history & exam. If anaphylaxis is suspected, leave this pathway and use the Anaphylaxis engine immediately (DN-07 override).',
      options: [
        { label: 'Hypovolemic / dehydration', set: { type: 'hypovolemic' }, next: 'SHK-DN-05' },
        { label: 'Septic / distributive', set: { type: 'septic' }, next: 'SHK-DN-05' },
        { label: 'Cardiogenic', set: { type: 'cardiogenic' }, next: 'SHK-DN-05', tone: 'danger' },
        { label: 'Obstructive', set: { type: 'obstructive' }, next: 'SHK-DN-05' },
        { label: 'Anaphylactic — leave pathway (use Anaphylaxis engine)', next: 'TERM-ANAPHYLAXIS', tone: 'danger' },
      ],
    },

    // ── PHASE 2 — FIRST 5 MINUTES (DN-04–06) ─────────────────────────────────
    'SHK-DN-05': {
      id: 'SHK-DN-05', type: 'ACTION', critical: true, source: PP,
      action: 'First 5 minutes — recognise and intervene immediately. ABC, positioning and oxygen.',
      points: [
        'Supine or most comfortable responsive position; support oxygenation and ventilation',
        'High-concentration O₂ via non-rebreather mask',
        'Start the clock — this is the primary response window',
      ],
      next: 'SHK-DN-06',
    },
    'SHK-DN-06': {
      id: 'SHK-DN-06', type: 'ACTION', source: PP,
      action: 'Obtain access and send bloods; correct glucose and calcium.',
      points: [
        'Two large-bore IV lines preferred; IO if IV impossible; central line desirable but not mandatory',
        'Hypoglycaemia (glucose ≤60 mg/dL): dextrose 10% 5 mL/kg (or 25% 2 mL/kg / 5% 10 mL/kg)',
        'Correct ionised hypocalcaemia — it impairs cardiac performance',
      ],
      investigations: [
        { test: 'Bedside glucose & ionised calcium', detail: 'Correct immediately if abnormal before escalating.' },
        { test: 'Lactate + venous/arterial gas', detail: 'Perfusion marker; trend with resuscitation.' },
        { test: 'Blood culture (if fever/sepsis)', detail: 'Before antibiotics — but never delay antibiotics.' },
      ],
      safety: [
        { title: 'Bicarbonate rule', detail: 'Do NOT use bicarbonate solely to improve haemodynamics or reduce vasopressor need when pH ≥ 7.15 (SUP — bicarbonate misuse).' },
      ],
      next: 'SHK-DN-FLUID',
    },

    // ── PHASE 3 — FLUID RESUSCITATION BY TYPE (DN-08, 09, 12, 13) ────────────
    'SHK-DN-FLUID': {
      id: 'SHK-DN-FLUID', type: 'QUESTION', critical: true, source: B,
      question: 'Fluid resuscitation — select the strategy for the identified shock type.',
      options: [
        { label: 'Septic / distributive', next: 'SHK-DN-09' },
        { label: 'Hypovolemic / dehydration', next: 'SHK-DN-08' },
        { label: 'Cardiogenic', next: 'SHK-DN-12', tone: 'danger' },
        { label: 'Obstructive', next: 'SHK-DN-13' },
      ],
    },
    'SHK-DN-08': {
      id: 'SHK-DN-08', type: 'ACTION', source: PP,
      action: 'Dehydration/hypovolemic shock — use the WHO acute-gastroenteritis pathway; replace ongoing losses.',
      rx: { drug: 'Isotonic crystalloid (0.9% saline / RL)', dose: '20 mL/kg over 10–15 min, reassess and repeat as needed', route: 'IV/IO', duration: 'Titrate to perfusion' },
      monitoring: [
        { parameter: 'Sodium, potassium, calcium, glucose, urine output', frequency: 'Serial', target: 'Correcting electrolytes; UO ≥1 mL/kg/h', alert: 'Persistent deficit / poor UO', alert_action: 'Continue replacement; reassess' },
      ],
      next: 'SHK-DN-10',
    },
    'SHK-DN-09': {
      id: 'SHK-DN-09', type: 'ACTION', critical: true, source: B,
      action: 'Septic shock — begin isotonic crystalloid within the first 5 minutes.',
      rx: { drug: 'Isotonic crystalloid (0.9% saline / balanced)', dose: '10–20 mL/kg over 10–15 min', route: 'IV/IO', duration: 'Reassess after each bolus' },
      points: [
        'Up to 40 mL/kg in the first hour in hypotensive septic shock, WHILE starting maintenance fluids',
        'Reassess after every bolus — repeat only if perfusion/BP still inadequate',
      ],
      next: 'SHK-DN-10',
    },
    'SHK-DN-12': {
      id: 'SHK-DN-12', type: 'ACTION', critical: true, source: B,
      action: 'Cardiogenic shock — give only a small, cautious fluid bolus and reassess carefully.',
      rx: { drug: 'Isotonic crystalloid (cautious)', dose: '5–10 mL/kg over 10–20 min', route: 'IV/IO', duration: 'Reassess carefully — avoid excess fluid' },
      safety: [
        { title: 'Avoid fluid overload', detail: 'Hepatomegaly, gallop, respiratory distress → suspect cardiogenic shock. Do not give large boluses; move early to PICU.' },
      ],
      next: 'SHK-DN-10',
    },
    'SHK-DN-13': {
      id: 'SHK-DN-13', type: 'ACTION', source: PP,
      action: 'Obstructive shock — treat the cause urgently (e.g. needle decompression for tension pneumothorax, pericardiocentesis for tamponade). Give fluid only as clinically indicated while definitive relief is arranged.',
      next: 'SHK-DN-10',
    },

    // ── PHASE 4/5 — REASSESS & VASOACTIVE ESCALATION (DN-10, 17–22) ──────────
    'SHK-DN-10': {
      id: 'SHK-DN-10', type: 'QUESTION', critical: true, source: B,
      question: 'Post-bolus reassessment — perfusion/BP still inadequate?',
      detail: 'Reassess after EVERY bolus. Watch for fluid overload (crepitations, new hepatomegaly, worsening work of breathing).',
      options: [
        { label: 'Responding — perfusion improving', next: 'SHK-DN-23' },
        { label: 'Still inadequate after fluids — start vasoactive', next: 'SHK-DN-17', tone: 'danger' },
      ],
    },
    'SHK-DN-17': {
      id: 'SHK-DN-17', type: 'ACTION', critical: true, source: B,
      action: 'No response to fluids — start a vasoactive infusion promptly (do not delay escalation).',
      safety: [
        { title: 'Peripheral vasoactive window', detail: 'Peripheral vasoactive use is allowed in an emergency — dilute more and restrict to <6 hours; shift to a central line as soon as possible.' },
      ],
      next: 'SHK-DN-VASO',
    },
    'SHK-DN-VASO': {
      id: 'SHK-DN-VASO', type: 'QUESTION', critical: true, source: B,
      question: 'Vasoactive selection — cold or warm shock?',
      detail: 'Cold shock: vasoconstricted, cold peripheries, narrow pulse pressure, prolonged CRT. Warm shock: vasodilated, warm peripheries, bounding pulses, wide pulse pressure.',
      options: [
        { label: 'Cold shock → adrenaline (epinephrine)', set: { vaso: 'cold' }, next: 'SHK-DN-18' },
        { label: 'Warm shock → noradrenaline', set: { vaso: 'warm' }, next: 'SHK-DN-19' },
        { label: 'Alternative → dopamine', set: { vaso: 'dopamine' }, next: 'SHK-DN-20' },
      ],
    },
    'SHK-DN-18': {
      id: 'SHK-DN-18', type: 'ACTION', critical: true, source: B, prescribes: 'adrenaline',
      action: 'Cold shock — start an adrenaline (epinephrine) infusion.',
      rx: { drug: 'Adrenaline (epinephrine) infusion', dose: '0.05–0.3 mcg/kg/min, titrate to perfusion (usual max 1 mcg/kg/min)', route: 'IV/IO infusion (peripheral/IO acceptable, dilute, <6 h)', duration: 'Titrate; central access ASAP' },
      next: 'SHK-DN-22',
    },
    'SHK-DN-19': {
      id: 'SHK-DN-19', type: 'ACTION', critical: true, source: B, prescribes: 'norepinephrine',
      action: 'Warm shock — start a noradrenaline (norepinephrine) infusion.',
      rx: { drug: 'Noradrenaline (norepinephrine) infusion', dose: '0.05–0.3 mcg/kg/min, titrate to perfusion (max 2 mcg/kg/min)', route: 'IV/IO infusion (peripheral/IO acceptable, dilute, <6 h)', duration: 'Titrate; central access ASAP' },
      next: 'SHK-DN-22',
    },
    'SHK-DN-20': {
      id: 'SHK-DN-20', type: 'ACTION', source: B, prescribes: 'dopamine',
      action: 'Alternative vasoactive — dopamine infusion.',
      rx: { drug: 'Dopamine infusion', dose: '5–10 mcg/kg/min, titrate (up to 20 mcg/kg/min)', route: 'IV/IO infusion', duration: 'Titrate to perfusion' },
      next: 'SHK-DN-22',
    },
    'SHK-DN-22': {
      id: 'SHK-DN-22', type: 'ACTION', critical: true, source: B, prescribes: 'ceftriaxone',
      action: 'Septic shock — obtain a blood culture if possible and give the FIRST broad-spectrum antibiotic dose within the first hour.',
      rx: { drug: 'Ceftriaxone (broad-spectrum, per local protocol)', dose: '100 mg/kg (max 4 g), then per regimen', route: 'IV', duration: 'Within 1 hour of recognition' },
      next: 'SHK-DN-23',
    },

    // ── PHASE 6/7 — ENDPOINTS, REFRACTORY, TRANSFER (DN-23–28) ───────────────
    'SHK-DN-23': {
      id: 'SHK-DN-23', type: 'QUESTION', critical: true, source: B,
      question: 'Therapeutic endpoints achieved?',
      detail: 'Normal/improving HR, CRT <2 s, warm extremities, normal mental status, normal BP, urine >1 mL/kg/h, improving lactate/acidosis.',
      options: [
        { label: 'Yes — endpoints achieved', next: 'SHK-DN-24' },
        { label: 'No — shock persists despite fluids + vasoactives', next: 'SHK-DN-28', tone: 'danger' },
      ],
    },
    'SHK-DN-28': {
      id: 'SHK-DN-28', type: 'ACTION', critical: true, source: B,
      action: 'Refractory shock — escalate beyond a single agent to critical-care support, source control and organ support.',
      points: [
        'Add a SECOND vasoactive agent (e.g. adrenaline + noradrenaline; add vasopressin for catecholamine-resistant vasodilatory shock)',
        'Consider hydrocortisone for catecholamine-resistant / suspected adrenal-insufficiency shock',
        'Source control (drain/relieve the cause); broad-spectrum antibiotics if not already given',
        'Respiratory failure → mechanical ventilation + continuous SpO₂; VBG and lactate to guide',
        'Blood loss (visible or occult) → transfuse blood products',
        'Severe anaemia / high fever → caution with fluid loading (pulmonary oedema risk)',
        'Consider inodilator (milrinone) for low-output cold shock with adequate BP; escalate to advanced organ support/ECMO as available',
      ],
      next: 'SHK-DN-24',
    },
    'SHK-DN-24': {
      id: 'SHK-DN-24', type: 'MONITORING', source: B,
      action: 'PICU transfer — after office/ER stabilisation, transfer to PICU for haemodynamic monitoring and titration EVEN IF endpoints are achieved.',
      monitoring: [
        { parameter: 'HR, CRT, BP, mentation, urine output, lactate', frequency: 'Continuous during transfer & in PICU', target: 'CRT <2 s, UO >1 mL/kg/h, normalising lactate/BP', alert: 'Deterioration / rising lactate', alert_action: 'Re-escalate: repeat assessment, add/adjust vasoactive, source control' },
      ],
      next: 'TERM-DONE',
    },

    // ── Terminals ────────────────────────────────────────────────────────────
    'TERM-NO-SHOCK': { id: 'TERM-NO-SHOCK', type: 'TERMINAL', source: PP, action: 'No features of shock — treat the presenting illness and reassess if the child deteriorates (perfusion, HR, mentation, urine output).' },
    'TERM-ANAPHYLAXIS': { id: 'TERM-ANAPHYLAXIS', type: 'TERMINAL', source: PP, action: 'Anaphylactic shock suspected — leave this pathway and manage with the Anaphylaxis engine immediately (IM adrenaline first). Return here only if anaphylaxis is excluded.' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Shock management plan generated — recognition, first-5-minute stabilisation, type-specific fluids with reassessment, vasoactive escalation (cold/warm), antibiotics, refractory escalation and PICU transfer recorded.' },
  },
};

export const SHOCK_ENGINE = {
  id: 'shock-engine',
  label: 'Shock Engine',
  desc: 'IAP STG 2022 — paediatric shock: perfusion recognition → stage & type (anaphylaxis override) → first 5 min ABC/access + glucose/calcium → type-specific fluids (septic 10–20 up to 40 mL/kg/h · cardiogenic 5–10 mL/kg) with reassessment → vasoactive by phenotype (cold→adrenaline / warm→noradrenaline / dopamine) → antibiotics ≤1 h → endpoints → refractory escalation (second agent, hydrocortisone, source & organ support) → PICU transfer',
  group: 'Emergency & Critical Care',
  builtin: true,
  guideline_source: SHOCK_GUIDELINE,
  ciee_sources: SHOCK_SOURCES,
  ciee_pathway: SHOCK_PATHWAY,
};
