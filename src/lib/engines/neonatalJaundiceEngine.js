/**
 * Neonatal Jaundice Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Neonatal Hyperbilirubinaemia
 * / Jaundice (1.1). Indian Academy of Pediatrics.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner). Treatment
 * thresholds are read off an HOUR-SPECIFIC bilirubin nomogram (age in hours +
 * gestation + risk factors) — this engine flags the decision, it does not
 * replace the chart.
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Content
 * reflects the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const NNJ_GUIDELINE = {
  id: 'GS-IAP-STG-2022-NNJ',
  guideline_name: 'IAP STG 2022 — Neonatal Jaundice',
  guideline_section: 'Red-flag screen · Hour-specific nomogram · Phototherapy · Exchange transfusion',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1B',
  recommendation_strength: 'Recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022, 1.1 (Neonatal Jaundice). Companion: AAP hour-specific nomogram.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Neonatal Jaundice',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const NNJ_SOURCES = {
  'GS-IAP-STG-2022-NNJ-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022, 1.1'),
  'GS-IAP-STG-2022-NNJ-PP': mk('Practice point', 'Practice point', 'IAP STG 2022, 1.1'),
};

const B = 'GS-IAP-STG-2022-NNJ-1B';
const PP = 'GS-IAP-STG-2022-NNJ-PP';

export const NNJ_PATHWAY = {
  entry: 'NNJ-DN-01',
  nodes: {
    'NNJ-DN-01': {
      id: 'NNJ-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Any red flag for pathological jaundice?',
      detail: 'Always confirm with a serum/transcutaneous bilirubin — clinical (Kramer) estimation is unreliable. Screen for features that mandate urgent work-up rather than routine nomogram management.',
      points: [
        'Onset <24 hours of age (always pathological)',
        'Sick/unwell neonate (lethargy, poor feeding, temperature instability, sepsis)',
        'Preterm <35 weeks; rapid rise (>0.2 mg/dL/h or >5 mg/dL/day)',
        'Prolonged jaundice >2 weeks (term) / >3 weeks, or ANY conjugated (direct) hyperbilirubinaemia / pale stools + dark urine (→ biliary atresia)',
      ],
      options: [
        { label: 'Red flag present', set: { red_flag: true }, next: 'NNJ-DN-02', tone: 'danger' },
        { label: 'No red flag — physiological pattern', set: { red_flag: false }, next: 'NNJ-DN-03' },
      ],
    },
    'NNJ-DN-02': {
      id: 'NNJ-DN-02', type: 'ACTION', critical: true, source: B,
      action: 'Red flag — urgent work-up for a haemolytic or hepatobiliary cause (and start phototherapy while investigating if the level is high).',
      investigations: [
        { test: 'Total + direct (conjugated) bilirubin', detail: 'Direct >1 mg/dL (or >20% of total) = conjugated jaundice → urgent biliary-atresia/hepatitis work-up (do NOT phototherapy conjugated jaundice as the answer).' },
        { test: 'Blood group + DCT, CBC, retic, peripheral smear', detail: 'Mother & baby blood group/Rh; direct Coombs; G6PD; sepsis screen if unwell.' },
      ],
      points: [
        'Onset <24 h → treat as haemolytic until proven otherwise (Rh/ABO, G6PD)',
        'Conjugated hyperbilirubinaemia / pale stools → urgent hepatology/surgery referral for biliary atresia (time-critical Kasai window)',
      ],
      next: 'NNJ-DN-03',
    },
    'NNJ-DN-03': {
      id: 'NNJ-DN-03', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Plot TSB on the hour-specific nomogram — where does it fall?',
      detail: 'Use total serum bilirubin against age IN HOURS, adjusted for gestation and risk factors (haemolysis, sepsis, acidosis, low albumin), to read the phototherapy and exchange thresholds.',
      options: [
        { label: 'Below phototherapy line', next: 'NNJ-DN-04' },
        { label: 'At/above phototherapy line', next: 'NNJ-DN-05', tone: 'danger' },
        { label: 'Approaching/above exchange line, or encephalopathy signs', next: 'NNJ-DN-06', tone: 'danger' },
      ],
    },
    'NNJ-DN-04': {
      id: 'NNJ-DN-04', type: 'MONITORING', source: B,
      action: 'Below treatment threshold — support feeding, ensure adequate hydration, and recheck bilirubin per risk.',
      points: [
        'Promote effective feeding (breastfeeding support); ensure adequate output',
        'Recheck TSB per the nomogram risk zone and rate of rise; give discharge follow-up',
      ],
      monitoring: [
        { parameter: 'TSB trend + feeding/hydration', frequency: 'Per nomogram risk zone', target: 'Falling/plateauing below the phototherapy line', alert: 'Rising toward the phototherapy line', alert_action: 'Start phototherapy' },
      ],
      next: 'TERM-DONE',
    },
    'NNJ-DN-05': {
      id: 'NNJ-DN-05', type: 'ACTION', critical: true, source: B,
      action: 'At/above the phototherapy line — start intensive phototherapy and recheck the bilirubin in 4–6 hours.',
      points: [
        'Intensive phototherapy; continue feeding and maintain hydration (do not routinely stop breastfeeding)',
        'Treat the underlying cause (e.g. haemolysis); ensure eye protection and thermoregulation',
      ],
      monitoring: [
        { parameter: 'TSB on phototherapy', frequency: 'Recheck in 4–6 hours', target: 'Falling below the phototherapy line', alert: 'Still rising / approaching exchange line', alert_action: 'Escalate — prepare exchange transfusion; recheck sooner' },
      ],
      next: 'NNJ-DN-07',
    },
    'NNJ-DN-06': {
      id: 'NNJ-DN-06', type: 'ACTION', critical: true, source: B,
      action: 'Approaching/above the exchange line, or signs of acute bilirubin encephalopathy — this is an emergency: maximal phototherapy and prepare double-volume exchange transfusion.',
      points: [
        'Give intensive (multiple) phototherapy immediately while preparing exchange',
        'Prepare double-volume exchange transfusion; consider IVIG for isoimmune haemolysis',
        'Encephalopathy signs (lethargy → hypertonia/retrocollis-opisthotonos, high-pitched cry) → do NOT wait — exchange urgently',
      ],
      safety: [
        { title: 'Kernicterus is preventable', detail: 'Acute bilirubin encephalopathy is a medical emergency — escalate to exchange transfusion without delay; involve neonatology.' },
      ],
      next: 'NNJ-DN-07',
    },
    'NNJ-DN-07': {
      id: 'NNJ-DN-07', type: 'MONITORING', source: PP,
      action: 'Ongoing care & follow-up — monitor response, stop phototherapy per threshold, and arrange follow-up.',
      monitoring: [
        { parameter: 'TSB, hydration, cause-directed treatment', frequency: 'Serial until below threshold', target: 'TSB safely below the phototherapy line, feeding well', alert: 'Rebound rise after stopping phototherapy', alert_action: 'Recheck TSB; restart phototherapy if indicated' },
      ],
      points: [
        'Arrange hearing screen and follow-up (especially after high bilirubin/exchange)',
        'Counsel on feeding and when to return (poor feeding, deepening jaundice, lethargy)',
      ],
      next: 'TERM-DONE',
    },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Neonatal jaundice plan generated — red-flag screen, hour-specific nomogram decision, phototherapy with 4–6 h recheck, exchange-transfusion escalation, and follow-up recorded.' },
  },
};

export const NNJ_ENGINE = {
  id: 'neonatal-jaundice-engine',
  label: 'Neonatal Jaundice Engine',
  desc: 'IAP STG 2022, 1.1 — neonatal jaundice: red-flag screen (<24 h onset, unwell, <35 wk, rapid rise, prolonged >2 wk / conjugated) → urgent haemolytic/biliary-atresia work-up · else plot TSB on the hour-specific nomogram → phototherapy if above line (recheck 4–6 h) → prepare exchange transfusion if approaching exchange line or encephalopathy',
  group: 'Neonatology',
  builtin: true,
  guideline_source: NNJ_GUIDELINE,
  ciee_sources: NNJ_SOURCES,
  ciee_pathway: NNJ_PATHWAY,
};
