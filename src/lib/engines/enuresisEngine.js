/**
 * Enuresis Intelligence Engine — CIEE built-in.
 * Source: International Children's Continence Society (ICCS) 2023.
 * Reference: Vande Walle J, et al. Consensus on Definitions and Characteristics
 * of Nocturnal Enuresis. Pediatr Nephrol 2023.
 *
 * Decision pathway:
 *  - Age screen (≥5 y for diagnosis)
 *  - Red-flag exclusion (polyuria/polydipsia, neuro signs, daytime wetting, UTI)
 *  - Monosymptomatic (MNE) vs non-monosymptomatic (NMNE)
 *  - MNE: primary vs secondary · severity · alarm first-line · desmopressin
 *    second-line · combination for resistant · relapse management
 *  - NMNE: treat daytime LUTS first (OAB/BBD/dysfunctional voiding) then enuresis
 *  - Desmopressin safety (fluid restriction, SIADH risk)
 *  - Referral criteria
 */

export const ENURESIS_GUIDELINE = {
  id: 'GS-ICCS-2023-ENURESIS',
  guideline_name: 'ICCS 2023 — Nocturnal Enuresis',
  guideline_section: 'Definition · Classification · Evaluation · Treatment',
  issuing_body: 'International Children\'s Continence Society',
  year: 2023,
  evidence_grade: 'A–D',
  recommendation_strength: 'GRADE',
  doi: null,
  pmid: null,
  reference: 'Vande Walle J, et al. Pediatr Nephrol. 2023 — ICCS Consensus.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'ICCS 2023 — Nocturnal Enuresis',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'International Children\'s Continence Society',
  year: 2023, doi: null, pmid: null,
});

export const ENURESIS_SOURCES = {
  'GS-ICCS-2023-A': mk('A', 'Strong recommendation', 'Strong (grade A)'),
  'GS-ICCS-2023-B': mk('B', 'Moderate recommendation', 'Moderate (grade B)'),
  'GS-ICCS-2023-C': mk('C', 'Weak recommendation', 'Low quality (grade C)'),
  'GS-ICCS-2023-X': mk('X', 'Practice point (ungraded)', 'Practice point (grade X)'),
};

const A = 'GS-ICCS-2023-A';
const B = 'GS-ICCS-2023-B';
const C = 'GS-ICCS-2023-C';
const X = 'GS-ICCS-2023-X';

export const ENURESIS_PATHWAY = {
  entry: 'DN-01',
  nodes: {
    // ── Phase 1 — Age screen ──────────────────────────────────────────────
    'DN-01': {
      id: 'DN-01', type: 'QUESTION', critical: true, source: X,
      question: 'Is the child ≥ 5 years old?',
      detail: 'Enuresis is defined as intermittent incontinence during sleep in a child aged ≥5 years, occurring ≥1 time per month for ≥3 months. Below 5 years, bedwetting is considered a normal developmental variant.',
      options: [
        { label: 'Yes — ≥ 5 years', next: 'DN-02' },
        { label: 'No — < 5 years', next: 'TERM-YOUNG', tone: 'muted' },
      ],
    },

    // ── Phase 2 — Red-flag screen ─────────────────────────────────────────
    'DN-02': {
      id: 'DN-02', type: 'QUESTION', critical: true, source: X,
      question: 'Are any RED FLAGS present?',
      detail: 'Red flags requiring investigation BEFORE enuresis treatment: (a) polyuria/polydipsia (DM, DI), (b) daytime wetting/urgency/frequency (NMNE), (c) neurological signs (spinal dimple, foot deformity, gait abnormality), (d) recurrent UTI, (e) secondary enuresis (new onset after ≥6 months dry) — suggests organic/psychological trigger, (f) daytime frequency >8x or <4x.',
      options: [
        { label: 'Yes — red flags present', next: 'DN-03', tone: 'danger' },
        { label: 'No red flags — typical MNE', next: 'DN-05' },
      ],
    },

    // ── Red-flag workup ────────────────────────────────────────────────────
    'DN-03': {
      id: 'DN-03', type: 'ACTION', source: B,
      action: 'Perform red-flag workup BEFORE enuresis treatment: urinalysis + specific gravity (exclude DM, UTI); renal + bladder USG (structural anomaly, post-void residual); bladder diary ×3 days (voiding frequency, volumes, fluid intake); spine examination (sacral dimple, hair tuft → MRI if neurogenic suspected).',
      monitoring: [
        { parameter: 'Urinalysis (glucose, SG, culture)', frequency: 'At initial visit', target: 'No glycosuria, no UTI', alert: 'Glucosuria → check blood glucose; pyuria → culture', alert_action: 'Investigate DM or UTI before enuresis treatment' },
      ],
      next: 'DN-04',
    },
    'DN-04': {
      id: 'DN-04', type: 'QUESTION', source: X,
      question: 'Red-flag workup — any abnormality found?',
      detail: 'If structural, neurological, metabolic or infectious cause identified, treat that condition first. Enuresis treatment may proceed once the underlying condition is addressed.',
      options: [
        { label: 'Abnormality found — treat underlying cause first', next: 'TERM-REDFLAG', tone: 'danger' },
        { label: 'No abnormality — proceed with enuresis pathway', next: 'DN-05' },
      ],
    },

    // ── Phase 3 — MNE vs NMNE classification ───────────────────────────────
    'DN-05': {
      id: 'DN-05', type: 'QUESTION', critical: true, source: A,
      question: 'Are there any daytime lower urinary tract symptoms (LUTS)?',
      detail: 'Daytime LUTS = urgency, frequency, daytime incontinence, holding manoeuvres, weak stream, posturing. Presence of ANY daytime symptom → non-monosymptomatic enuresis (NMNE). Absence of all daytime symptoms → monosymptomatic nocturnal enuresis (MNE).',
      options: [
        { label: 'No daytime symptoms — Monosymptomatic (MNE)', set: { type: 'mne' }, next: 'DN-06' },
        { label: 'Daytime symptoms present — Non-monosymptomatic (NMNE)', set: { type: 'nmne' }, next: 'DN-15' },
      ],
    },

    // ── Phase 4 — MNE: Primary vs Secondary ───────────────────────────────
    'DN-06': {
      id: 'DN-06', type: 'QUESTION', source: X,
      question: 'Primary or secondary enuresis?',
      detail: 'Primary = never achieved ≥6 consecutive months of dryness. Secondary = relapse after ≥6 months of being dry — often triggered by psychological stress, UTI, constipation, or OSA. Secondary enuresis warrants evaluation for trigger.',
      options: [
        { label: 'Primary (never dry ≥6 months)', set: { subtype: 'primary' }, next: 'DN-07' },
        { label: 'Secondary (relapse after ≥6 months dry)', set: { subtype: 'secondary' }, next: 'DN-07' },
      ],
    },

    // ── Phase 5 — MNE: Severity ───────────────────────────────────────────
    'DN-07': {
      id: 'DN-07', type: 'QUESTION', source: B,
      question: 'Enuresis severity — how many wet nights per week?',
      detail: 'Severity guides treatment urgency and predicts response. ≥4 wet nights/week = severe enuresis (higher desmopressin response, lower alarm response in very severe cases).',
      options: [
        { label: 'Mild — 1–3 wet nights/week', set: { severity: 'mild' }, next: 'DN-08' },
        { label: 'Severe — ≥4 wet nights/week', set: { severity: 'severe' }, next: 'DN-08' },
      ],
    },

    // ── Phase 6 — MNE: Baseline investigations ─────────────────────────────
    'DN-08': {
      id: 'DN-08', type: 'ACTION', source: B,
      action: 'Baseline assessment for MNE: (1) Urinalysis + specific gravity (exclude UTI/DM — mandatory). (2) Bladder diary ×3 nights: measure nocturnal urine volume (NUV) vs estimated bladder capacity (EBC = [age+2]×30 mL). NUV >130% EBC = nocturnal polyuria; NUV <EBC = reduced bladder capacity. (3) Fluid intake diary. (4) Constipation screen (Bristol stool chart).',
      next: 'DN-09',
    },

    // ── Phase 7 — MNE: First-line treatment selection ─────────────────────
    'DN-09': {
      id: 'DN-09', type: 'QUESTION', critical: true, source: A,
      question: 'Which first-line treatment is most appropriate?',
      detail: 'Enuresis alarm: first-line for motivated families, 70–80% success, sustained remission in ~50%, requires 6–8 week minimum trial. Desmopressin: first-line when rapid effect needed (sleepovers), alarm not feasible/acceptable, or nocturnal polyuria confirmed. Alarm has higher long-term cure rate; desmopressin has faster onset but higher relapse.',
      options: [
        { label: 'Enuresis alarm — first-line (preferred long-term)', set: { first_line: 'alarm' }, next: 'DN-10' },
        { label: 'Desmopressin — first-line (rapid effect / alarm not feasible)', set: { first_line: 'desmopressin' }, next: 'DN-12' },
      ],
    },

    // ── Alarm pathway ─────────────────────────────────────────────────────
    'DN-10': {
      id: 'DN-10', type: 'ACTION', source: A, prescribes: 'enuresis-alarm',
      action: 'Enuresis alarm therapy: body-worn or bed-mat alarm that sounds on urine detection. Child must wake and go to toilet when alarm sounds. Parental involvement is critical. Minimum trial: 6–8 weeks (do not abandon early). Continue until 14 consecutive dry nights, then stop. Expected response: 70–80% achieve ≥90% dry nights; ~50% sustain remission after stopping.',
      monitoring: [
        { parameter: 'Dry nights per week', frequency: 'Every 2 weeks', target: '≥14 consecutive dry nights → stop', alert: 'No response after 6–8 weeks', alert_action: 'Add desmopressin (combination therapy) or switch to desmopressin' },
        { parameter: 'Alarm adherence (nights used)', frequency: 'Weekly', target: 'Used every night', alert: 'Poor adherence / family fatigue', alert_action: 'Counsel, simplify alarm, or switch to desmopressin' },
      ],
      next: 'DN-11',
    },
    'DN-11': {
      id: 'DN-11', type: 'QUESTION', critical: true, source: A,
      question: 'Alarm therapy response after 6–8 weeks?',
      detail: 'Full response = ≥90% dry nights. Partial response = 50–89% dry nights. No response = <50% dry nights.',
      options: [
        { label: 'Full response (≥90% dry nights) — continue to 14 dry, then stop', next: 'TERM-ALARM-SUCCESS' },
        { label: 'Partial or no response — add desmopressin (combination)', next: 'DN-13' },
      ],
    },

    // ── Desmopressin pathway ──────────────────────────────────────────────
    'DN-12': {
      id: 'DN-12', type: 'ACTION', source: A, prescribes: 'desmopressin',
      action: 'Desmopressin (DDAVP): 120–240 mcg sublingual (oral lyophilisate) OR 200–400 mcg oral tablet at bedtime. Start at lowest dose, titrate up after 1–2 weeks if no response. Restrict fluids to 200 mL max in the 1 hour before dose and NOTHING after the dose until morning. Review at 2 weeks for response. Continue for 3–6 months then attempt structured withdrawal.',
      monitoring: [
        { parameter: 'Wet nights per week', frequency: 'At 2 weeks', target: '≥50% reduction = responder', alert: 'No response at maximal dose after 4 weeks', alert_action: 'Add alarm (combination) or reassess for NMNE' },
        { parameter: 'Fluid intake before bedtime', frequency: 'Ongoing', target: '<200 mL in hour before dose, none after dose', alert: 'Excess fluid intake', alert_action: 'Counsel — risk of hyponatraemia/SIADH' },
        { parameter: 'Symptoms of hyponatraemia', frequency: 'Ongoing', target: 'None (headache, nausea, vomiting)', alert: 'Headache/vomiting/confusion', alert_action: 'STOP desmopressin, check serum Na, fluid restrict only if Na normal' },
      ],
      next: 'DN-13',
    },

    // ── Combination / resistant pathway ───────────────────────────────────
    'DN-13': {
      id: 'DN-13', type: 'QUESTION', source: B,
      question: 'Is combination therapy (alarm + desmopressin) needed?',
      detail: 'Combination is indicated for: (a) partial response to alarm alone, (b) partial response to desmopressin alone, (c) severe enuresis (≥4 nights/week), (d) rapid effect needed with long-term cure goal. Combination achieves ~75–80% response.',
      options: [
        { label: 'Yes — combine alarm + desmopressin', next: 'DN-14' },
        { label: 'No — monotherapy sufficient', next: 'TERM-RESPONDER' },
      ],
    },
    'DN-14': {
      id: 'DN-14', type: 'ACTION', source: B, prescribes: 'desmopressin',
      action: 'Combination therapy: enuresis alarm + desmopressin 120–240 mcg at bedtime. Run alarm nightly and give desmopressin. Continue for 3 months. Once 14 consecutive dry nights achieved, stop desmopressin first, then stop alarm after 2 more dry weeks. Structured withdrawal reduces relapse.',
      monitoring: [
        { parameter: 'Dry nights per week', frequency: 'Every 2 weeks', target: '14 consecutive dry nights', alert: 'No response after 3 months combination', alert_action: 'Refer to paediatric continence / urology specialist' },
      ],
      next: 'TERM-COMBINATION',
    },

    // ── Phase 8 — NMNE pathway ────────────────────────────────────────────
    'DN-15': {
      id: 'DN-15', type: 'ACTION', source: A,
      action: 'NMNE management — treat daytime LUTS FIRST, then address nocturnal enuresis. Step 1: Screen for and treat bladder-bowel dysfunction (BBD) — constipation is present in ~40% of NMNE. Start macrogol (PEG) if constipation. Step 2: Classify daytime LUTS: overactive bladder (urgency ± incontinence) → anticholinergic (oxybutynin); dysfunctional voiding → urotherapy + biofeedback; underactive bladder → timed voiding ± CIC. Step 3: Once daytime symptoms controlled for 1 month, reassess nocturnal enuresis and proceed to MNE pathway (DN-06) if enuresis persists.',
      monitoring: [
        { parameter: 'Daytime symptoms (urgency, frequency, incontinence)', frequency: 'Monthly', target: 'Resolution before enuresis treatment', alert: 'Persistent daytime symptoms despite 3 months therapy', alert_action: 'Refer to urology / paediatric continence service' },
        { parameter: 'Bowel function (Bristol stool, frequency)', frequency: 'At 2 weeks, then monthly', target: 'Soft formed stool ≥1/day', alert: 'Persistent constipation', alert_action: 'Escalate macrogol dose; consider enema if impaction' },
      ],
      next: 'DN-16',
    },
    'DN-16': {
      id: 'DN-16', type: 'QUESTION', source: A,
      question: 'Have daytime symptoms resolved after treatment?',
      detail: 'Once daytime LUTS are controlled for ≥1 month, reassess nocturnal enuresis. If enuresis persists and daytime symptoms are resolved, reclassify as MNE and proceed with alarm/desmopressin.',
      options: [
        { label: 'Yes — daytime symptoms resolved, enuresis persists → reclassify as MNE', next: 'DN-06' },
        { label: 'No — daytime symptoms persist despite 3 months therapy', next: 'TERM-REFER-NMNE', tone: 'danger' },
      ],
    },

    // ── Relapse management ─────────────────────────────────────────────────
    'DN-17': {
      id: 'DN-17', type: 'ACTION', source: B,
      action: 'Relapse management: relapse = ≥2 wet nights/week after achieving dryness. Step 1: Restart alarm (if alarm was the successful treatment) — 70% respond to alarm restart. Step 2: If desmopressin was successful, restart at previous effective dose for 2 weeks, then structured withdrawal (reduce by 1 dose/week). Step 3: If relapse after combination, restart combination for 1 month then withdraw. Step 4: Address triggers (constipation, UTI, psychological stress, OSA).',
      next: 'TERM-RELAPSE',
    },

    // ── Terminals ──────────────────────────────────────────────────────────
    'TERM-YOUNG': {
      id: 'TERM-YOUNG', type: 'TERMINAL', source: X,
      action: 'Child < 5 years — bedwetting is a normal developmental variant. Reassure parents. No treatment needed unless associated distress or daytime symptoms. Reassess at age 5 if still wetting.',
    },
    'TERM-REDFLAG': {
      id: 'TERM-REDFLAG', type: 'TERMINAL', source: X,
      action: 'Underlying condition identified — treat the primary condition (DM, UTI, neurogenic bladder, structural anomaly, OSA, psychological trigger) before enuresis-specific therapy. Reassess enuresis after the underlying condition is managed.',
    },
    'TERM-ALARM-SUCCESS': {
      id: 'TERM-ALARM-SUCCESS', type: 'TERMINAL', source: A,
      action: 'Alarm therapy successful — continue until 14 consecutive dry nights, then stop alarm. ~50% sustain remission. If relapse occurs (≥2 wet nights/week), restart alarm (70% respond). Schedule follow-up at 1 month post-cessation to check for relapse.',
    },
    'TERM-RESPONDER': {
      id: 'TERM-RESPONDER', type: 'TERMINAL', source: A,
      action: 'Desmopressin responder — continue for 3–6 months, then attempt structured withdrawal (reduce by 1 dose per week). If relapse during withdrawal, restart at effective dose for 2 weeks and retry withdrawal. If relapse after stopping, restart desmopressin or switch to alarm.',
    },
    'TERM-COMBINATION': {
      id: 'TERM-COMBINATION', type: 'TERMINAL', source: B,
      action: 'Combination therapy completed — stop desmopressin first, then stop alarm after 2 more dry weeks. Follow-up at 1 month. If relapse, restart alarm (preferred) or combination. Address any triggers (constipation, UTI, stress).',
    },
    'TERM-RELAPSE': {
      id: 'TERM-RELAPSE', type: 'TERMINAL', source: B,
      action: 'Relapse management completed — monitor for sustained dryness. If ≥2 relapses despite adequate treatment, refer to paediatric continence specialist for urodynamics and advanced management.',
    },
    'TERM-REFER-NMNE': {
      id: 'TERM-REFER-NMNE', type: 'TERMINAL', source: A,
      action: 'Refer to paediatric urology / continence service for urodynamics, advanced urotherapy, and specialist management of refractory NMNE. Consider spinal MRI if neurological signs develop.',
    },
  },
};

// Hub-ready engine record
export const ENURESIS_ENGINE = {
  id: 'enuresis-engine',
  label: 'Enuresis Engine',
  desc: 'ICCS 2023 — MNE vs NMNE · red-flag screen · alarm first-line · desmopressin · combination · relapse · desmopressin safety',
  group: 'CAKUT & Urology',
  builtin: true,
  guideline_source: ENURESIS_GUIDELINE,
  ciee_sources: ENURESIS_SOURCES,
  ciee_pathway: ENURESIS_PATHWAY,
};