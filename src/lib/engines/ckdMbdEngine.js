/**
 * CKD-MBD Intelligence Engine — CIEE built-in.
 * Source: KDIGO 2017 Clinical Practice Guideline Update for the Diagnosis,
 * Evaluation, Prevention, and Treatment of Chronic Kidney Disease–Mineral
 * and Bone Disorder (CKD-MBD). KDOQI 2020 commentary.
 *
 * Decision pathway:
 *  - CKD stage screen (G3a–G5D)
 *  - Baseline labs: Ca, Ph, iPTH, 25-OH-D, ALP
 *  - Hyperphosphatemia management (diet → binders)
 *  - Hypocalcemia correction
 *  - Vitamin D deficiency treatment
 *  - Secondary hyperparathyroidism (SHPT) escalation
 *  - Calcimimetics vs vitamin D sterols
 *  - Parathyroidectomy refractory
 *  - Vascular calcification assessment
 *  - Monitoring schedule
 */

export const CKDMBD_GUIDELINE = {
  id: 'GS-KDIGO-2017-CKDMBD',
  guideline_name: 'KDIGO 2017 — CKD-MBD',
  guideline_section: 'Diagnosis · Evaluation · Treatment',
  issuing_body: 'Kidney Disease: Improving Global Outcomes',
  year: 2017,
  evidence_grade: '1A–2D',
  recommendation_strength: 'GRADE',
  doi: null,
  pmid: null,
  reference: 'KDIGO 2017 Clinical Practice Guideline Update for CKD-MBD. Kidney Int Suppl 2017;7:1–59.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'KDIGO 2017 — CKD-MBD',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Kidney Disease: Improving Global Outcomes',
  year: 2017, doi: null, pmid: null,
});

export const CKDMBD_SOURCES = {
  'GS-KDIGO-2017-1A': mk('1A', 'Strong recommendation', 'High quality (grade 1A)'),
  'GS-KDIGO-2017-1B': mk('1B', 'Strong recommendation', 'Moderate quality (grade 1B)'),
  'GS-KDIGO-2017-1C': mk('1C', 'Strong recommendation', 'Low quality (grade 1C)'),
  'GS-KDIGO-2017-2C': mk('2C', 'Weak recommendation', 'Low quality (grade 2C)'),
  'GS-KDIGO-2017-2D': mk('2D', 'Weak recommendation', 'Very low quality (grade 2D)'),
  'GS-KDIGO-2017-PP': mk('PP', 'Practice point (ungraded)', 'Practice point'),
};

const A = 'GS-KDIGO-2017-1A';
const B = 'GS-KDIGO-2017-1B';
const C = 'GS-KDIGO-2017-1C';
const W2C = 'GS-KDIGO-2017-2C';
const W2D = 'GS-KDIGO-2017-2D';
const PP = 'GS-KDIGO-2017-PP';

export const CKDMBD_PATHWAY = {
  entry: 'MB-01',
  nodes: {
    // ── Phase 1 — CKD stage screen ────────────────────────────────────────
    'MB-01': {
      id: 'MB-01', type: 'QUESTION', critical: true, source: A,
      question: 'What is the CKD stage (eGFR or dialysis status)?',
      detail: 'CKD-MBD monitoring begins from G3a (eGFR <60). The frequency of lab monitoring and treatment thresholds escalate with declining eGFR. Dialysis patients (G5D) have the most aggressive targets.',
      options: [
        { label: 'G3a–G3b (eGFR 30–59)', set: { stage: 'g3' }, next: 'MB-02' },
        { label: 'G4 (eGFR 15–29)', set: { stage: 'g4' }, next: 'MB-02' },
        { label: 'G5 / G5D (eGFR <15 or dialysis)', set: { stage: 'g5' }, next: 'MB-02' },
      ],
    },

    // ── Phase 2 — Baseline labs ────────────────────────────────────────────
    'MB-02': {
      id: 'MB-02', type: 'ACTION', source: B,
      action: 'Baseline CKD-MBD panel: serum calcium (corrected for albumin), phosphate, intact PTH (iPTH), total alkaline phosphatase (ALP), 25-OH vitamin D. Also check bicarbonate (acidosis worsens bone disease). In G3: every 6–12 months. G4: every 3–6 months. G5/G5D: every 1–3 months. 25-OH-D: at least yearly.',
      monitoring: [
        { parameter: 'Serum calcium (albumin-corrected)', frequency: 'G3 q6–12mo · G4 q3–6mo · G5 q1–3mo', target: 'Age-appropriate normal range', alert: 'Ca <8.4 or >10.2 mg/dL', alert_action: 'Adjust binder/calcium supplement; check ECG for QT' },
        { parameter: 'Serum phosphate', frequency: 'G3 q6–12mo · G4 q3–6mo · G5 q1–3mo', target: 'Normal range (toward normal for age)', alert: 'Ph >5.5 mg/dL (adults) or above age ULN', alert_action: 'Dietary phosphate restriction + phosphate binder' },
        { parameter: 'Intact PTH (iPTH)', frequency: 'G3 q6–12mo · G4 q3–6mo · G5 q1–3mo', target: 'G3:35–70 · G4:70–110 · G5:2–9× ULN (pg/mL)', alert: 'iPTH outside target range', alert_action: 'Escalate to SHPT pathway' },
        { parameter: '25-OH vitamin D', frequency: 'Yearly', target: '>30 ng/mL (>75 nmol/L)', alert: '<30 ng/mL', alert_action: 'Cholecalciferol/ergocalciferol supplementation' },
      ],
      next: 'MB-03',
    },

    // ── Phase 3 — Vitamin D deficiency ────────────────────────────────────
    'MB-03': {
      id: 'MB-03', type: 'QUESTION', source: B,
      question: 'Is 25-OH vitamin D < 30 ng/mL?',
      detail: 'Vitamin D deficiency is common in CKD and contributes to SHPT, osteomalacia, and muscle weakness. KDIGO recommends measuring 25-OH-D (not 1,25-OH-D) and treating deficiency with native vitamin D (cholecalciferol or ergocalciferol), NOT active vitamin D sterols.',
      options: [
        { label: 'Yes — deficient (<30 ng/mL)', set: { vitd_def: true }, next: 'MB-04' },
        { label: 'No — sufficient (≥30 ng/mL)', set: { vitd_def: false }, next: 'MB-05' },
      ],
    },
    'MB-04': {
      id: 'MB-04', type: 'ACTION', source: B, prescribes: 'cholecalciferol',
      action: 'Treat vitamin D deficiency: cholecalciferol (vitamin D3) 1000–2000 IU/day OR 50,000 IU monthly ×3 months then maintenance 800–1000 IU/day. Ergocalciferol (D2) is an alternative. Recheck 25-OH-D after 3 months. Do NOT use calcitriol or paricalcitol for vitamin D deficiency — those are for SHPT.',
      monitoring: [
        { parameter: '25-OH vitamin D', frequency: 'At 3 months', target: '>30 ng/mL', alert: 'Persistent deficiency', alert_action: 'Check adherence, malabsorption, consider higher dose' },
      ],
      next: 'MB-05',
    },

    // ── Phase 4 — Hyperphosphatemia ──────────────────────────────────────
    'MB-05': {
      id: 'MB-05', type: 'QUESTION', critical: true, source: B,
      question: 'Is serum phosphate elevated?',
      detail: 'Hyperphosphatemia drives vascular calcification, secondary hyperparathyroidism, and is associated with mortality in CKD. Target: toward normal range for age. Treatment is sequential: dietary restriction → phosphate binders → dialysis optimization.',
      options: [
        { label: 'Yes — elevated', set: { hyperphos: true }, next: 'MB-06' },
        { label: 'No — normal', set: { hyperphos: false }, next: 'MB-07' },
      ],
    },
    'MB-06': {
      id: 'MB-06', type: 'ACTION', source: B,
      action: 'Hyperphosphatemia management — sequential approach: (1) Dietary phosphate restriction to 800–1000 mg/day (educate on hidden phosphate in processed foods, colas, phosphate additives). (2) If diet insufficient after 2–4 weeks, add phosphate binder. Choice based on calcium: if Ca normal/low → calcium acetate or calcium carbonate (elemental Ca 1500 mg/day max). If Ca elevated or vascular calcification → non-calcium binder (sevelamer carbonate, lanthanum carbonate, ferric citrate, sucroferric oxyhydroxide). (3) Ensure adequate dialysis clearance (Kt/V) in G5D.',
      monitoring: [
        { parameter: 'Serum phosphate', frequency: 'G3 q6–12mo · G4 q3–6mo · G5 q1–3mo', target: 'Toward normal for age', alert: 'Persistent Ph >5.5 despite binder', alert_action: 'Check adherence, escalate binder dose, review dialysis adequacy' },
        { parameter: 'Serum calcium', frequency: 'With each phosphate check', target: 'Normal range', alert: 'Hypercalcemia with calcium-based binder', alert_action: 'Switch to non-calcium binder' },
      ],
      next: 'MB-07',
    },

    // ── Phase 5 — Hypocalcemia ────────────────────────────────────────────
    'MB-07': {
      id: 'MB-07', type: 'QUESTION', source: C,
      question: 'Is serum calcium low (corrected Ca < 8.4 mg/dL)?',
      detail: 'Hypocalcemia in CKD is usually from vitamin D deficiency, low calcium intake, or over-suppression of PTH. It worsens osteomalacia and can cause QT prolongation. Correct cautiously — rapid correction can precipitate vascular calcification.',
      options: [
        { label: 'Yes — hypocalcemia', set: { hypocalc: true }, next: 'MB-08' },
        { label: 'No — calcium normal', set: { hypocalc: false }, next: 'MB-09' },
      ],
    },
    'MB-08': {
      id: 'MB-08', type: 'ACTION', source: C,
      action: 'Correct hypocalcemia: (1) If 25-OH-D low — treat with cholecalciferol first (see MB-04). (2) Oral elemental calcium 500–1000 mg/day between meals (absorbs better on empty stomach) — use calcium carbonate or calcium acetate. (3) If symptomatic (tetany, seizures, QT prolongation) — IV calcium gluconate 10–20 mg/kg over 10 min with cardiac monitoring. (4) If on calcimimetic — reduce dose or hold (cinacalcet lowers Ca further). Recheck Ca in 1–2 weeks.',
      monitoring: [
        { parameter: 'Serum calcium', frequency: 'At 1–2 weeks', target: 'Corrected Ca ≥8.4 mg/dL', alert: 'Persistent hypocalcemia', alert_action: 'Check magnesium, PTH, consider active vitamin D sterol' },
      ],
      next: 'MB-09',
    },

    // ── Phase 6 — Secondary hyperparathyroidism (SHPT) ────────────────────
    'MB-09': {
      id: 'MB-09', type: 'QUESTION', critical: true, source: B,
      question: 'Is iPTH above the KDIGO target range for the CKD stage?',
      detail: 'KDIGO iPTH targets: G3: 35–70 pg/mL · G4: 70–110 pg/mL · G5/G5D: 2–9× upper limit of normal (~130–585 pg/mL). Rising or persistently elevated iPTH despite corrected Ca/Ph/vitD warrants active treatment.',
      options: [
        { label: 'Yes — iPTH above target', set: { shpt: true }, next: 'MB-10' },
        { label: 'No — iPTH within target', set: { shpt: false }, next: 'MB-14' },
      ],
    },
    'MB-10': {
      id: 'MB-10', type: 'ACTION', source: C,
      action: 'Before starting SHPT therapy, ensure reversible causes addressed: (1) Vitamin D deficiency treated. (2) Hyperphosphatemia controlled. (3) Hypocalcemia corrected. (4) Acidosis corrected (bicarbonate to 22–26 mmol/L). If iPTH remains elevated after 2–3 months of optimization, proceed to drug therapy.',
      next: 'MB-11',
    },
    'MB-11': {
      id: 'MB-11', type: 'QUESTION', critical: true, source: C,
      question: 'Which SHPT drug therapy is most appropriate?',
      detail: 'Calcitriol/paricalcitol (active vitamin D sterols): suppress PTH, raise Ca and Ph — avoid if Ca or Ph already high. Cinacalcet (calcimimetic): suppresses PTH without raising Ca/Ph — ideal if Ca/Ph elevated, but lowers Ca (monitor for hypocalcemia). Etelcalcetide (IV calcimimetic for dialysis patients): alternative to cinacalcet in G5D.',
      options: [
        { label: 'Calcium/Phosphate normal → active vitamin D sterol (calcitriol/paricalcitol)', set: { shpt_drug: 'vitd_sterol' }, next: 'MB-12' },
        { label: 'Calcium or Phosphate elevated → cinacalcet (calcimimetic)', set: { shpt_drug: 'cinacalcet' }, next: 'MB-13' },
      ],
    },
    'MB-12': {
      id: 'MB-12', type: 'ACTION', source: C, prescribes: 'calcitriol',
      action: 'Active vitamin D sterol: calcitriol 0.25 mcg orally daily OR paricalcitol 1 mcg orally daily (paricalcitol has less hypercalcemia/hyperphosphatemia). Start low, titrate every 2–4 weeks based on iPTH response. Target: iPTH within stage-specific range. Hold if Ca >10.2 or Ph >5.5. In G5D: IV paricalcitol 1 mcg per dialysis session is an alternative.',
      monitoring: [
        { parameter: 'iPTH', frequency: 'Every 1–3 months', target: 'Stage-specific KDIGO range', alert: 'iPTH rising or >9× ULN', alert_action: 'Escalate dose or add/switch to calcimimetic' },
        { parameter: 'Serum calcium', frequency: 'Every 2–4 weeks during titration', target: '<10.2 mg/dL', alert: 'Hypercalcemia', alert_action: 'Hold vitamin D sterol, reduce dose' },
        { parameter: 'Serum phosphate', frequency: 'Every 2–4 weeks during titration', target: '<5.5 mg/dL', alert: 'Hyperphosphatemia', alert_action: 'Intensify binder, hold vitamin D sterol' },
      ],
      next: 'MB-14',
    },
    'MB-13': {
      id: 'MB-13', type: 'ACTION', source: C, prescribes: 'cinacalcet',
      action: 'Cinacalcet: start 0.2–0.4 mg/kg orally once daily (with food). Titrate every 2–4 weeks to max 1.8 mg/kg/day (adult max 180 mg/day). Monitor calcium closely — cinacalcet lowers Ca. Hold if Ca <7.8 mg/dL or symptomatic hypocalcemia. In G5D: etelcalcetide 0.05 mg/kg IV per dialysis session is an alternative. Target: iPTH within KDIGO range without hypocalcemia.',
      monitoring: [
        { parameter: 'iPTH', frequency: 'Every 1–3 months', target: 'Stage-specific KDIGO range', alert: 'iPTH rising despite max cinacalcet', alert_action: 'Add vitamin D sterol or refer for parathyroidectomy' },
        { parameter: 'Serum calcium', frequency: 'Every 1–2 weeks during titration', target: '≥8.4 mg/dL', alert: 'Ca <7.8 or symptomatic', alert_action: 'Hold cinacalcet, give calcium supplement, reduce dose on restart' },
      ],
      next: 'MB-14',
    },

    // ── Phase 7 — Refractory SHPT / parathyroidectomy ─────────────────────
    'MB-14': {
      id: 'MB-14', type: 'QUESTION', source: W2C,
      question: 'Is SHPT refractory to medical therapy (iPTH >800 pg/mL despite max therapy for >3 months)?',
      detail: 'Refractory SHPT = persistently elevated iPTH despite optimized phosphate binders, vitamin D sterols at max dose, and calcimimetics. Indicates parathyroid gland hyperplasia/autonomy. Parathyroidectomy (subtotal or total with autotransplantation) is indicated.',
      options: [
        { label: 'Yes — refractory', set: { refractory: true }, next: 'MB-15' },
        { label: 'No — responding or not yet SHPT', set: { refractory: false }, next: 'MB-16' },
      ],
    },
    'MB-15': {
      id: 'MB-15', type: 'ACTION', source: W2C,
      action: 'Refractory SHPT — refer for parathyroidectomy. Indications: iPTH >800 pg/mL refractory to medical therapy, hypercalcemia refractory, severe bone pain, extraskeletal calcification, or biopsy-proven osteitis fibrosa cystica. Pre-op: localise adenoma with USG/sestamibi. Options: subtotal parathyroidectomy or total with forearm autotransplantation. Post-op: watch for hungry bone syndrome (profound hypocalcemia) — aggressive IV + oral calcium, calcitriol.',
      monitoring: [
        { parameter: 'Post-op serum calcium', frequency: 'Every 6 hours ×48h, then daily', target: '≥8.0 mg/dL', alert: 'Hungry bone syndrome — Ca <7.0', alert_action: 'IV calcium gluconate continuous infusion + high-dose calcitriol' },
        { parameter: 'Post-op iPTH', frequency: 'At 1 week, 1 month, then quarterly', target: '<150 pg/mL', alert: 'iPTH rising post-op', alert_action: 'Check for supernumerary gland or autograft hyperfunction' },
      ],
      next: 'TERM-PTX',
    },

    // ── Phase 8 — Vascular calcification ──────────────────────────────────
    'MB-16': {
      id: 'MB-16', type: 'QUESTION', source: W2C,
      question: 'Has vascular calcification been assessed (lateral abdominal X-ray or echocardiogram)?',
      detail: 'KDIGO practice point: assess vascular calcification in G3–G5D patients with risk factors. Adynamic bone disease and high calcium load promote calcification. If calcification present, avoid calcium-based phosphate binders.',
      options: [
        { label: 'Yes — calcification present', set: { vasc_calc: true }, next: 'MB-17' },
        { label: 'No / not assessed', set: { vasc_calc: false }, next: 'TERM-MONITOR' },
      ],
    },
    'MB-17': {
      id: 'MB-17', type: 'ACTION', source: W2C,
      action: 'Vascular calcification present — avoid calcium-based phosphate binders (calcium acetate/carbonate). Use non-calcium binders exclusively (sevelamer, lanthanum, ferric citrate, sucroferric oxyhydroxide). Avoid hypercalcemia. Keep Ca in lower-normal range. Consider lower iPTH target (avoid over-suppression → adynamic bone disease). Optimize dialysate calcium (2.25–2.5 mmol/L).',
      next: 'TERM-MONITOR',
    },

    // ── Terminals ──────────────────────────────────────────────────────────
    'TERM-PTX': {
      id: 'TERM-PTX', type: 'TERMINAL', source: W2C,
      action: 'Parathyroidectomy completed — long-term monitoring: iPTH every 3 months, Ca/Ph every 1–3 months. Watch for recurrent SHPT (autograft hyperplasia) or persistent hypocalcemia (hungry bone syndrome may last weeks–months). Continue calcitriol + calcium supplements as needed.',
    },
    'TERM-MONITOR': {
      id: 'TERM-MONITOR', type: 'TERMINAL', source: A,
      action: 'CKD-MBD management plan established — continue stage-appropriate monitoring (Ca/Ph/iPTH per KDIGO schedule). Reassess at each visit. Address acidosis (bicarbonate 22–26), nutrition, and growth. Refer to renal dietitian for phosphate education.',
    },
  },
};

// Hub-ready engine record
export const CKDMBD_ENGINE = {
  id: 'ckd-mbd-engine',
  label: 'CKD-MBD Engine',
  desc: 'KDIGO 2017 — Ca/Ph/iPTH targets · vitamin D deficiency · phosphate binders · SHPT escalation (calcitriol vs cinacalcet) · parathyroidectomy · vascular calcification',
  group: 'CKD & Genetics',
  builtin: true,
  guideline_source: CKDMBD_GUIDELINE,
  ciee_sources: CKDMBD_SOURCES,
  ciee_pathway: CKDMBD_PATHWAY,
};