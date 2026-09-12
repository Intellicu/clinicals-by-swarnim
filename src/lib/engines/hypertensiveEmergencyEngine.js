/**
 * Hypertensive Emergency Intelligence Engine — CIEE built-in.
 * Source: AAP 2017 Clinical Practice Guideline for Screening and Management
 * of High Blood Pressure in Children and Adolescents. ESH 2016 ESC/ESH
 * Guidelines for management of arterial hypertension. KDIGO BP in CKD.
 *
 * Decision pathway:
 *  - Confirm true hypertensive emergency (BP + end-organ damage)
 *  - Classify: hypertensive urgency vs emergency
 *  - End-organ damage assessment (CNS, cardiac, renal, retinal)
 *  - IV antihypertensive selection (nicardipine, labetalol, sodium nitroprusside, hydralazine)
 *  - BP reduction target (no more than 25% in first 8 hours)
 *  - Transition to oral therapy
 *  - Underlying cause workup (secondary HTN)
 *  - Monitoring & follow-up
 */

export const HTE_GUIDELINE = {
  id: 'GS-AAP-2017-HTE',
  guideline_name: 'AAP 2017 — Hypertensive Emergency in Children',
  guideline_section: 'Emergency BP Management · IV Therapy · Targets',
  issuing_body: 'American Academy of Pediatrics · ESH · KDIGO',
  year: 2017,
  evidence_grade: 'B–D',
  recommendation_strength: 'GRADE',
  doi: null,
  pmid: null,
  reference: 'Flynn JT, et al. AAP Clinical Practice Guideline for Screening and Management of High BP in Children. Pediatrics 2017;140(3):e20171904.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'AAP 2017 — Hypertensive Emergency in Children',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'American Academy of Pediatrics · ESH · KDIGO',
  year: 2017, doi: null, pmid: null,
});

export const HTE_SOURCES = {
  'GS-AAP-2017-B': mk('B', 'Strong recommendation', 'Moderate quality (grade B)'),
  'GS-AAP-2017-C': mk('C', 'Strong recommendation', 'Low quality (grade C)'),
  'GS-AAP-2017-D': mk('D', 'Weak recommendation', 'Very low quality (grade D)'),
  'GS-AAP-2017-X': mk('X', 'Practice point (ungraded)', 'Practice point (grade X)'),
};

const B = 'GS-AAP-2017-B';
const C = 'GS-AAP-2017-C';
const D = 'GS-AAP-2017-D';
const X = 'GS-AAP-2017-X';

export const HTE_PATHWAY = {
  entry: 'HE-01',
  nodes: {
    // ── Phase 1 — Confirm true emergency ──────────────────────────────────
    'HE-01': {
      id: 'HE-01', type: 'QUESTION', critical: true, source: B,
      question: 'Is the BP ≥ Stage 2 HTN threshold (≥95th + 5 mmHg or ≥140/90, whichever higher)?',
      detail: 'Stage 2 HTN = BP ≥95th percentile + 5 mmHg (for <13 years) OR ≥140/90 mmHg (for ≥13 years). Measure BP with appropriate cuff size, after 5 min rest, in right arm, seated. If BP is ≥Stage 2, assess for end-organ damage immediately. If BP is <Stage 2, this is not a hypertensive emergency.',
      options: [
        { label: 'Yes — BP ≥ Stage 2', next: 'HE-02' },
        { label: 'No — BP below Stage 2', next: 'TERM-NOT-EMERGENCY' },
      ],
    },

    // ── Phase 2 — Classify urgency vs emergency ────────────────────────────
    'HE-02': {
      id: 'HE-02', type: 'QUESTION', critical: true, source: B,
      question: 'Is there evidence of end-organ damage (hypertensive emergency) or is this asymptomatic severe HTN (urgency)?',
      detail: 'HYPERTENSIVE EMERGENCY = severe HTN + acute end-organ damage: (1) CNS — headache, vomiting, altered mental status, seizures, stroke, encephalopathy, visual disturbance. (2) Cardiac — acute heart failure, pulmonary oedema, chest pain (dissection), acute MI. (3) Renal — acute kidney injury, rapidly rising creatinine, haematuria. (4) Retinal — papilloedema, retinal haemorrhages. HYPERTENSIVE URGENCY = severe HTN (≥Stage 2) WITHOUT acute end-organ damage.',
      options: [
        { label: 'End-organ damage present — HYPERTENSIVE EMERGENCY', next: 'HE-03', tone: 'danger' },
        { label: 'No end-organ damage — HYPERTENSIVE URGENCY', next: 'HE-10' },
      ],
    },

    // ── Phase 3 — Emergency workup ────────────────────────────────────────
    'HE-03': {
      id: 'HE-03', type: 'ACTION', source: B,
      action: 'Immediate emergency workup: (1) IV access ×2, cardiac monitoring, pulse oximetry. (2) Investigations STAT: CBC, electrolytes, BUN, creatinine, glucose, urinalysis (RBC, protein), ECG (LVH, strain, ischaemia), chest X-ray (cardiomegaly, pulmonary oedema), head CT if any CNS sign (haemorrhage, oedema, stroke). (3) Fundoscopy — papilloedema, retinal haemorrhages. (4) Echocardiogram — LVH, LV mass, function. (5) Send secondary cause workup: renin, aldosterone, cortisol, metanephrines, renal Doppler USG, thyroid function.',
      monitoring: [
        { parameter: 'BP', frequency: 'Every 2–5 min during initial treatment', target: 'Reduce by ≤25% in first 8h', alert: 'BP dropping too fast', alert_action: 'Reduce infusion rate; watch for neurological deterioration' },
        { parameter: 'Mental status (GCS)', frequency: 'Continuous', target: 'Stable or improving', alert: 'Deteriorating GCS', alert_action: 'Urgent CT brain, consider hypertensive encephalopathy vs stroke' },
        { parameter: 'Urine output', frequency: 'Hourly', target: '>1 mL/kg/h', alert: 'Oliguria', alert_action: 'Assess for AKI, adjust fluid balance' },
      ],
      next: 'HE-04',
    },

    // ── Phase 4 — IV antihypertensive selection ────────────────────────────
    'HE-04': {
      id: 'HE-04', type: 'QUESTION', critical: true, source: C,
      question: 'Which IV antihypertensive is most appropriate?',
      detail: 'Drug choice depends on end-organ involvement and comorbidities. NICARDIPINE (CCB): most versatile, titratable, safe in renal/hepatic — first-line for most. LABETALOL (α+β blocker): good for aortic dissection, post-transplant, renal — avoid in asthma, heart block, bradycardia. SODIUM NITROPRUSSIDE (vasodilator): potent, instant, but cyanide toxicity if >48h or renal failure — reserve for resistant cases. HYDRALAZINE: safe in pregnancy, slower onset, reflex tachycardia. CLEVIDIPINE: ultra-short CCB, safe, but lipid emulsion.',
      options: [
        { label: 'Nicardipine IV infusion (first-line, most versatile)', set: { iv_drug: 'nicardipine' }, next: 'HE-05' },
        { label: 'Labetalol IV (asthma absent, bradycardia absent, dissection)', set: { iv_drug: 'labetalol' }, next: 'HE-06' },
        { label: 'Sodium nitroprusside (resistant, ICU only)', set: { iv_drug: 'snps' }, next: 'HE-07' },
        { label: 'Hydralazine IV (pregnancy, slower onset)', set: { iv_drug: 'hydralazine' }, next: 'HE-08' },
      ],
    },

    // ── Nicardipine ────────────────────────────────────────────────────────
    'HE-05': {
      id: 'HE-05', type: 'ACTION', source: C, prescribes: 'nicardipine',
      action: 'Nicardipine IV infusion: start 0.5–1 mcg/kg/min, titrate every 5 min by 0.5–1 mcg/kg/min to max 5 mcg/kg/min (adult max 15 mg/h). Onset 5–15 min. Continuous arterial or NIBP monitoring every 2–5 min. Target: reduce BP by no more than 25% in first 8 hours, then gradually to <95th + 5 mmHg over 24–48 hours. Avoid rapid correction — risk of cerebral/retinal ischaemia due to autoregulation shift.',
      monitoring: [
        { parameter: 'BP', frequency: 'Every 2–5 min during titration', target: '≤25% reduction in first 8h', alert: 'BP >25% drop or <90th percentile', alert_action: 'Reduce infusion, consider holding' },
        { parameter: 'Heart rate', frequency: 'Continuous', target: 'Reflex tachycardia may occur', alert: 'HR >160 or arrhythmia', alert_action: 'Reduce dose, add β-blocker if needed' },
      ],
      next: 'HE-09',
    },

    // ── Labetalol ──────────────────────────────────────────────────────────
    'HE-06': {
      id: 'HE-06', type: 'ACTION', source: C, prescribes: 'labetalol',
      action: 'Labetalol IV: bolus 0.2–1 mg/kg/dose (max 20 mg) over 2 min, repeat q10 min PRN, OR infusion 0.25–3 mg/kg/h. Onset 2–5 min. AVOID in asthma, heart block (2nd/3rd degree), bradycardia (HR <60), severe heart failure. Monitor HR closely. Labetalol is ideal for aortic dissection (controls both pressure and shear stress) and post-transplant hypertension.',
      monitoring: [
        { parameter: 'BP', frequency: 'Every 2–5 min', target: '≤25% reduction in first 8h', alert: 'Excessive BP drop', alert_action: 'Stop bolus, reduce infusion, IV fluids' },
        { parameter: 'Heart rate', frequency: 'Continuous', target: 'HR >60', alert: 'Bradycardia <60', alert_action: 'Reduce dose, atropine if symptomatic' },
      ],
      next: 'HE-09',
    },

    // ── Sodium nitroprusside ────────────────────────────────────────────────
    'HE-07': {
      id: 'HE-07', type: 'ACTION', source: D, prescribes: 'sodium-nitroprusside',
      action: 'Sodium nitroprusside IV: 0.3–0.5 mcg/kg/min, titrate by 0.3 mcg/kg/min q5 min to max 10 mcg/kg/min. Onset seconds. ICU/PICU only. CAUTION: cyanide toxicity if used >48h or in renal failure — check thiocyanate levels if >72h. Avoid in renal failure if possible. Use only for resistant cases not responding to nicardipine/labetalol. Transition to safer agent ASAP.',
      monitoring: [
        { parameter: 'BP', frequency: 'Every 1–2 min (arterial line)', target: '≤25% reduction in first 8h', alert: 'Excessive BP drop', alert_action: 'Reduce/stop infusion, IV fluids' },
        { parameter: 'Serum lactate (cyanide toxicity)', frequency: 'If >24h use', target: 'Normal', alert: 'Rising lactate, metabolic acidosis', alert_action: 'STOP SNP, give sodium thiosulfate, hydroxocobalamin' },
      ],
      next: 'HE-09',
    },

    // ── Hydralazine ────────────────────────────────────────────────────────
    'HE-08': {
      id: 'HE-08', type: 'ACTION', source: C, prescribes: 'hydralazine',
      action: 'Hydralazine IV: 0.1–0.2 mg/kg/dose (max 20 mg) over 2–4 min, repeat q4–6h PRN. Onset 10–20 min (slower than other IV agents). Safe in pregnancy. Causes reflex tachycardia — consider adding β-blocker. Less titratable than nicardipine — not ideal for tight BP control in emergency.',
      monitoring: [
        { parameter: 'BP', frequency: 'Every 5–10 min', target: '≤25% reduction in first 8h', alert: 'Excessive BP drop', alert_action: 'IV fluids, position' },
        { parameter: 'Heart rate', frequency: 'Continuous', target: 'Monitor reflex tachycardia', alert: 'Tachycardia >160', alert_action: 'Add β-blocker (esmolol/labetalol)' },
      ],
      next: 'HE-09',
    },

    // ── Phase 5 — BP target & monitoring ──────────────────────────────────
    'HE-09': {
      id: 'HE-09', type: 'ACTION', source: B,
      action: 'BP reduction target: reduce MAP by no more than 25% in the first 8 hours. Then gradually lower BP to <95th percentile + 5 mmHg over the next 24–48 hours. Too-rapid correction can cause cerebral, retinal, cardiac, and renal ischaemia due to shifted autoregulation. Continue IV infusion until stable, then transition to oral. Monitor urine output, mental status, and signs of end-organ recovery.',
      monitoring: [
        { parameter: 'BP', frequency: 'Every 15–30 min once stable', target: '<95th + 5 mmHg over 24–48h', alert: 'BP rebound or overshoot', alert_action: 'Adjust infusion, prepare oral transition' },
        { parameter: 'Neurological status', frequency: 'Hourly ×24h', target: 'Improving', alert: 'New neurological deficit', alert_action: 'Urgent CT brain, neurology consult' },
        { parameter: 'Renal function (creatinine, urine output)', frequency: 'Every 6–12h', target: 'Stable or improving', alert: 'Worsening AKI', alert_action: 'Nephrology consult, adjust fluids' },
      ],
      next: 'HE-12',
    },

    // ── Phase 6 — Hypertensive urgency (oral) ───────────────────────────────
    'HE-10': {
      id: 'HE-10', type: 'ACTION', source: B,
      action: 'Hypertensive urgency — NO end-organ damage. Lower BP over 24–48 hours with ORAL antihypertensives. Do NOT use IV rapid-acting agents. Options: (1) Amlodipine 0.1–0.3 mg/kg/day (max 10 mg) — first-line, safe. (2) Labetalol 1–3 mg/kg/dose BID (max 10 mg/kg/day). (3) Clonidine 5–10 mcg/kg/day (caution: rebound HTN). (4) Hydralazine 0.75–3 mg/kg/day divided QID. (5) ISMN/ACEi if appropriate. Recheck BP in 2–4 hours, then 12–24 hours. Admit if BP uncontrolled or symptoms develop.',
      monitoring: [
        { parameter: 'BP', frequency: 'Every 2–4h initially, then 12–24h', target: '<95th + 5 mmHg over 24–48h', alert: 'BP rising or symptoms develop', alert_action: 'Escalate to IV therapy, reassess for end-organ damage' },
      ],
      next: 'HE-11',
    },

    // ── Phase 7 — Transition to oral ────────────────────────────────────────
    'HE-11': {
      id: 'HE-11', type: 'QUESTION', source: C,
      question: 'Is BP controlled on IV therapy and ready for oral transition?',
      detail: 'Once BP is stable on IV infusion for 6–12 hours, start oral antihypertensives and wean IV. Oral agents take 30–60 min to work; overlap with IV to avoid rebound.',
      options: [
        { label: 'Yes — stable, begin oral transition', next: 'HE-12' },
        { label: 'No — still unstable on IV', next: 'HE-09' },
      ],
    },

    // ── Phase 8 — Oral transition & secondary workup ───────────────────────
    'HE-12': {
      id: 'HE-12', type: 'ACTION', source: B,
      action: 'Oral transition: start oral agent while weaning IV. Common oral regimen: (1) Amlodipine 0.1–0.3 mg/kg/day OD. (2) Add ACEi (enalapril 0.05–0.1 mg/kg/day) if renal HTN or high renin — check creatinine in 3–5 days. (3) Add β-blocker (propranolol 1–2 mg/kg/day) if sympathetic drive. (4) Diuretic (HCTZ or furosemide) if volume overload. Wean IV over 6–12 hours as oral takes effect. Underlying cause workup: renal Doppler USG, renin/aldosterone, urinary metanephrines, cortisol, thyroid, DMSA (renal scars), echocardiogram (coarctation/structural).',
      monitoring: [
        { parameter: 'BP', frequency: 'Every 1–2h during transition, then 4–6h', target: '<95th + 5 mmHg', alert: 'BP rebound after IV stopped', alert_action: 'Increase oral dose, restart IV if severe' },
        { parameter: 'Creatinine (if ACEi started)', frequency: 'At 3–5 days', target: 'Stable', alert: 'Rising creatinine >30%', alert_action: 'Hold ACEi, evaluate for renal artery stenosis' },
      ],
      next: 'HE-13',
    },

    // ── Phase 9 — Underlying cause ────────────────────────────────────────
    'HE-13': {
      id: 'HE-13', type: 'QUESTION', source: B,
      question: 'Has a secondary cause of hypertension been identified?',
      detail: 'In children, ~85% of severe HTN is secondary. Common causes: renal (parenchymal — CKD, GN, reflux nephropathy; vascular — RAS, coarctation), endocrine (pheochromocytoma, hyperaldosteronism, Cushing, thyroid), medications (steroids, calcineurin inhibitors, EPO, stimulants), sleep apnea. If no cause found, consider rare: monogenic HTN (Liddle, Gordon, AME).',
      options: [
        { label: 'Yes — secondary cause identified', set: { secondary: true }, next: 'HE-14' },
        { label: 'No — cause unclear, continue workup', set: { secondary: false }, next: 'TERM-FOLLOWUP' },
      ],
    },
    'HE-14': {
      id: 'HE-14', type: 'ACTION', source: B,
      action: 'Treat the underlying cause: (1) Renal artery stenosis → angioplasty/stent, nephrology. (2) Coarctation of aorta → surgical/cardiology repair. (3) Pheochromocytoma → α-blockade then β-blockade, surgical resection. (4) Hyperaldosteronism → spironolactone/eplerenone, surgery if adenoma. (5) CKD-related → ACEi/ARB, volume control, renal management. (6) Drug-induced → adjust immunosuppression if possible. Continue antihypertensives until cause addressed.',
      next: 'TERM-FOLLOWUP',
    },

    // ── Terminals ──────────────────────────────────────────────────────────
    'TERM-NOT-EMERGENCY': {
      id: 'TERM-NOT-EMERGENCY', type: 'TERMINAL', source: X,
      action: 'BP is below Stage 2 threshold — this is not a hypertensive emergency. Recheck BP with proper technique (appropriate cuff, 5 min rest, right arm, seated). If confirmed elevated, refer to HTN Engine for classification and management. If BP normal, no further action needed.',
    },
    'TERM-FOLLOWUP': {
      id: 'TERM-FOLLOWUP', type: 'TERMINAL', source: B,
      action: 'Hypertensive emergency managed — plan follow-up: (1) Continue oral antihypertensives. (2) BP check in 1 week, then 2–4 weeks. (3) Complete secondary cause workup. (4) Echocardiogram at 1–3 months to assess LVH regression. (5) Renal function and electrolytes with each visit. (6) Lifestyle: salt restriction, weight management, exercise (once controlled). (7) If secondary cause identified, disease-specific follow-up.',
    },
  },
};

// Hub-ready engine record
export const HYPERTENSIVE_EMERGENCY_ENGINE = {
  id: 'hypertensive-emergency-engine',
  label: 'Hypertensive Emergency Engine',
  desc: 'AAP 2017 — urgency vs emergency · end-organ assessment · IV nicardipine/labetalol/SNP/hydralazine · ≤25% BP reduction in 8h · oral transition · secondary cause workup',
  group: 'Hypertension',
  builtin: true,
  guideline_source: HTE_GUIDELINE,
  ciee_sources: HTE_SOURCES,
  ciee_pathway: HTE_PATHWAY,
};