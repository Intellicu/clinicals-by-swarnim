/**
 * Dengue Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Dengue (§6.70) with WHO
 * classification (no warning signs / warning signs / severe). Indian Academy of
 * Pediatrics.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses/
 * fluid rates reflect the IAP STG 2022 / WHO algorithm but must be verified
 * before this engine is exposed as clinically validated.
 */

export const DENGUE_GUIDELINE = {
  id: 'GS-IAP-STG-2022-DEN',
  guideline_name: 'IAP STG 2022 — Dengue',
  guideline_section: 'WHO classification · Home care · Warning-signs fluids · Severe dengue resuscitation',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1B',
  recommendation_strength: 'Recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022 §6.70 (Dengue). Companion: WHO Dengue Guidelines.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Dengue',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const DENGUE_SOURCES = {
  'GS-IAP-STG-2022-DEN-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022 §6.70'),
  'GS-IAP-STG-2022-DEN-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 §6.70'),
};

const B = 'GS-IAP-STG-2022-DEN-1B';
const PP = 'GS-IAP-STG-2022-DEN-PP';

export const DENGUE_PATHWAY = {
  entry: 'DEN-DN-01',
  nodes: {
    'DEN-DN-01': {
      id: 'DEN-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'WHO classification — which group?',
      detail: 'Febrile child in an endemic area/season with a compatible illness. Classify to decide setting and fluids. Watch the critical (defervescence) phase around days 3–7.',
      points: [
        'No warning signs: fever + 2 of (nausea/vomiting, rash, aches, positive tourniquet, leukopenia)',
        'Warning signs: abdominal pain/tenderness, persistent vomiting, clinical fluid accumulation, mucosal bleeding, lethargy/restlessness, liver >2 cm, rising HCT with rapidly falling platelets',
        'Severe: shock (DSS), respiratory distress from fluid accumulation, severe bleeding, or severe organ impairment',
      ],
      options: [
        { label: 'Group A — no warning signs', set: { group: 'A' }, next: 'DEN-DN-02' },
        { label: 'Group B — warning signs', set: { group: 'B' }, next: 'DEN-DN-03', tone: 'danger' },
        { label: 'Group C — severe dengue', set: { group: 'C' }, next: 'DEN-DN-04', tone: 'danger' },
      ],
    },
    'DEN-DN-02': {
      id: 'DEN-DN-02', type: 'MONITORING', source: B,
      action: 'Group A — home care. Encourage oral fluids, paracetamol for fever, and daily review with CBC/HCT.',
      rx: { drug: 'Paracetamol', dose: '15 mg/kg/dose 4–6 hourly (max 60 mg/kg/day)', route: 'Oral', duration: 'For fever/pain only' },
      safety: [
        { title: 'No NSAIDs/aspirin', detail: 'Use paracetamol ONLY — avoid ibuprofen, aspirin and IM injections (bleeding risk).' },
      ],
      monitoring: [
        { parameter: 'Daily CBC/HCT + warning signs review', frequency: 'Daily (during the critical phase days 3–7)', target: 'Stable HCT, platelets, no warning signs', alert: 'Any warning sign, rising HCT, or falling platelets', alert_action: 'Reclassify to Group B and admit' },
      ],
      points: [
        'Maintain oral fluids and urine output; tepid sponging for fever',
        'Return immediately for: abdominal pain, persistent vomiting, bleeding, lethargy, cold clammy extremities, no urine 4–6 h',
      ],
      next: 'TERM-DONE',
    },
    'DEN-DN-03': {
      id: 'DEN-DN-03', type: 'ACTION', critical: true, source: B,
      action: 'Group B (warning signs) — admit and give controlled isotonic IV fluids, titrated to HCT and clinical response. Avoid over-hydration.',
      rx: { drug: 'Isotonic crystalloid (0.9% saline / RL)', dose: 'Start 5–7 mL/kg/h ×1–2 h → reduce to 3–5 mL/kg/h ×2–4 h → 2–3 mL/kg/h, titrated to HCT & clinical response', route: 'IV', duration: 'Taper over 24–48 h as the critical phase resolves' },
      points: [
        'Reassess HCT, urine output, vitals frequently; step the rate DOWN as the child improves',
        'A rising HCT with worsening vitals = give more fluid; a falling HCT with stable vitals + good urine = reduce fluid',
      ],
      monitoring: [
        { parameter: 'HCT, vitals, urine output', frequency: '1–4 hourly', target: 'UO 0.5–1 mL/kg/h, stable HCT', alert: 'Rising HCT + narrowing pulse pressure / shock', alert_action: 'Treat as severe dengue (Group C)' },
      ],
      safety: [
        { title: 'Avoid over-hydration', detail: 'Fluid overload (respiratory distress, effusions/ascites) is a major cause of harm — titrate to the minimum needed and reduce as HCT falls with clinical improvement.' },
      ],
      next: 'DEN-DN-05',
    },
    'DEN-DN-04': {
      id: 'DEN-DN-04', type: 'ACTION', critical: true, source: B,
      action: 'Group C (severe dengue) — resuscitate. Compensated shock: isotonic bolus and reassess HCT; hypotensive shock: rapid bolus ± colloid; transfer to PICU.',
      rx: { drug: 'Isotonic crystalloid bolus (± colloid)', dose: 'Compensated shock: 10–20 mL/kg over 15–30 min, reassess HCT. Hypotensive shock: 20 mL/kg rapid over 10–15 min, then reduce; add colloid if persistent', route: 'IV/IO', duration: 'Step down rapidly once perfusion restored' },
      points: [
        'Reassess after every bolus; check HCT before and after (rising HCT + shock → repeat crystalloid/colloid; falling HCT + shock → occult haemorrhage → transfuse)',
        'Manage severe bleeding with blood products; treat organ impairment (hepatic, CNS, myocarditis)',
        'Transfer to PICU',
      ],
      monitoring: [
        { parameter: 'HCT, perfusion, urine output, lactate', frequency: 'Continuous', target: 'CRT <2 s, UO ≥1 mL/kg/h, normalising HCT', alert: 'Ongoing shock or falling HCT with shock', alert_action: 'Repeat bolus/colloid vs transfuse; PICU-level support' },
      ],
      next: 'DEN-DN-05',
    },
    'DEN-DN-05': {
      id: 'DEN-DN-05', type: 'MONITORING', source: PP,
      action: 'Convalescence — watch for the fluid-reabsorption phase (~24–48 h after the critical phase): reduce/stop IV fluids to avoid overload; expect a rising platelet count and diuresis.',
      monitoring: [
        { parameter: 'Fluid balance, respiratory status, platelets', frequency: 'Serial during recovery', target: 'Diuresis, rising platelets, no overload', alert: 'Respiratory distress / effusions (reabsorption overload)', alert_action: 'Stop IV fluids; consider a diuretic; monitor closely' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Dengue management plan generated — WHO classification, group-specific fluids (paracetamol-only antipyresis), severe-dengue resuscitation and convalescence monitoring recorded.' },
  },
};

export const DENGUE_ENGINE = {
  id: 'dengue-engine',
  label: 'Dengue Engine',
  desc: 'IAP STG 2022 §6.70 — WHO-classified dengue: Group A home care (oral fluids, paracetamol ONLY, daily CBC/HCT) · Group B warning signs (admit, controlled isotonic fluids 5–7→3–5→2–3 mL/kg/h titrated to HCT, avoid overload) · Group C severe (compensated 10–20 mL/kg bolus / hypotensive rapid bolus ± colloid, PICU) + convalescent overload watch',
  group: 'Infectious Disease',
  builtin: true,
  guideline_source: DENGUE_GUIDELINE,
  ciee_sources: DENGUE_SOURCES,
  ciee_pathway: DENGUE_PATHWAY,
};
