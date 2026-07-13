/**
 * Neonatal Sepsis Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 / NNF guidelines — Neonatal
 * Sepsis. Indian Academy of Pediatrics. Empirical antibiotics depend on onset
 * (early <72 h vs late ≥72 h) and the local antibiogram.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * are standard neonatal values but vary by gestation/postnatal age and local
 * protocol — verify against your unit's regimen before clinical use.
 */

export const NNS_GUIDELINE = {
  id: 'GS-IAP-STG-2022-NNS',
  guideline_name: 'IAP STG 2022 — Neonatal Sepsis',
  guideline_section: 'Recognition · Onset · Sepsis screen & culture · Empirical antibiotics · Supportive care · Duration',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1B',
  recommendation_strength: 'Recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022 / NNF (Neonatal Sepsis).',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Neonatal Sepsis',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const NNS_SOURCES = {
  'GS-IAP-STG-2022-NNS-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022 Neonatal Sepsis'),
  'GS-IAP-STG-2022-NNS-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 Neonatal Sepsis'),
};

const B = 'GS-IAP-STG-2022-NNS-1B';
const PP = 'GS-IAP-STG-2022-NNS-PP';

export const NNS_PATHWAY = {
  entry: 'NNS-DN-01',
  nodes: {
    'NNS-DN-01': {
      id: 'NNS-DN-01', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Suspect neonatal sepsis?',
      detail: 'Signs are non-specific — a high index of suspicion is essential. Combine risk factors with clinical signs.',
      points: [
        'Risk factors: maternal fever/chorioamnionitis, PROM >18 h, foul liquor, prematurity, unclean delivery, resuscitation at birth',
        'Signs: poor feeding, lethargy/irritability, temperature instability (fever or hypothermia), respiratory distress/apnoea, poor perfusion, abdominal distension, seizures, jaundice',
      ],
      options: [
        { label: 'Yes — suspected sepsis', next: 'NNS-DN-02', tone: 'danger' },
        { label: 'No — well neonate', next: 'TERM-WELL', tone: 'muted' },
      ],
    },
    'NNS-DN-02': {
      id: 'NNS-DN-02', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Onset?',
      detail: 'Onset guides the likely organisms and the empirical regimen.',
      points: [
        'Early-onset (<72 h): usually maternally/vertically acquired (GBS, E. coli, Klebsiella, Listeria)',
        'Late-onset (≥72 h): usually hospital/community acquired (Staphylococci, Klebsiella, Pseudomonas, Candida)',
      ],
      options: [
        { label: 'Early-onset (<72 h)', set: { onset: 'early' }, next: 'NNS-DN-03' },
        { label: 'Late-onset (≥72 h)', set: { onset: 'late' }, next: 'NNS-DN-03' },
      ],
    },
    'NNS-DN-03': {
      id: 'NNS-DN-03', type: 'ACTION', critical: true, source: B,
      action: 'Sepsis screen and cultures — take a blood culture BEFORE antibiotics (if it does not delay them). Do a lumbar puncture where meningitis is suspected, in late-onset sepsis, or with a positive blood culture.',
      investigations: [
        { test: 'Blood culture + sepsis screen', detail: 'CBC with differential, micro-ESR/CRP, band:total ratio; blood culture is the gold standard.' },
        { test: 'Lumbar puncture (CSF)', detail: 'If meningitis is suspected, in late-onset sepsis, or a positive/strongly suspected bacteraemia — unless clinically unstable.' },
        { test: 'Glucose ± other work-up', detail: 'Check glucose; chest X-ray/urine culture as indicated (urine especially in late-onset).' },
      ],
      next: 'NNS-DN-04',
    },
    'NNS-DN-04': {
      id: 'NNS-DN-04', type: 'ACTION', critical: true, source: B, prescribes: 'ampicillin',
      action: 'Start empirical IV antibiotics WITHIN 1 HOUR — choose by onset and the LOCAL antibiogram. Avoid ceftriaxone in neonates.',
      rx: { drug: 'Ampicillin + Gentamicin (early-onset first-line)', dose: 'Ampicillin 50 mg/kg/dose IV (100 mg/kg/dose if meningitis) + Gentamicin 4–5 mg/kg/dose once daily. Dosing interval varies with gestation/postnatal age — follow unit protocol.', route: 'IV', duration: 'Reassess at 48–72 h with culture' },
      points: [
        'Early-onset: ampicillin + gentamicin (add cefotaxime if meningitis) per unit protocol',
        'Late-onset / hospital-acquired: cover resistant Gram-negatives per antibiogram — e.g. piperacillin-tazobactam or cefotaxime + amikacin (add vancomycin if MRSA/CoNS likely, antifungal if Candida suspected)',
        'Ceftriaxone is contraindicated in neonates (bilirubin displacement; calcium co-administration) — use cefotaxime instead',
      ],
      safety: [
        { title: 'No ceftriaxone in neonates', detail: 'Use cefotaxime (not ceftriaxone) in the neonatal period. Monitor gentamicin/amikacin levels and renal function for prolonged aminoglycoside courses.' },
      ],
      next: 'NNS-DN-05',
    },
    'NNS-DN-05': {
      id: 'NNS-DN-05', type: 'ACTION', source: B,
      action: 'Supportive care — treat the neonate as a whole while antibiotics take effect.',
      points: [
        'Maintain a thermoneutral environment; monitor and correct blood glucose',
        'Respiratory support (O₂/CPAP/ventilation) and circulatory support (fluids/inotropes) as needed — see the Shock engine for fluid-refractory shock',
        'Maintain nutrition (IV fluids / cautious enteral feeds); correct electrolytes; treat seizures and jaundice',
      ],
      next: 'NNS-DN-06',
    },
    'NNS-DN-06': {
      id: 'NNS-DN-06', type: 'MONITORING', source: B,
      action: 'Review at 48–72 h and set the duration — de-escalate to a narrow agent per culture/sensitivity; stop if the screen is negative and the baby is well.',
      points: [
        'Culture-negative but clinically septic: typically 7–10 days',
        'Blood culture-positive (bacteraemia): ~7–10 days; complete per organism/response',
        'Meningitis: 14 days (Gram-positive) to 21 days (Gram-negative) — confirm CSF sterilisation',
      ],
      monitoring: [
        { parameter: 'Clinical course + culture/sensitivity', frequency: '48–72 h review and daily', target: 'Improving; appropriate narrow-spectrum cover', alert: 'Deterioration / resistant organism / positive CSF', alert_action: 'Broaden or tailor antibiotics; repeat cultures/LP; escalate care' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-WELL': { id: 'TERM-WELL', type: 'TERMINAL', source: PP, action: 'No features of sepsis — if risk factors are present, observe with serial clinical review (and a sepsis screen per protocol); re-enter this pathway if any sign develops.' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Neonatal sepsis plan generated — recognition, onset-based empirical antibiotics (ceftriaxone avoided), cultures/LP, supportive care and duration/de-escalation recorded.' },
  },
};

export const NNS_ENGINE = {
  id: 'neonatal-sepsis-engine',
  label: 'Neonatal Sepsis Engine',
  desc: 'IAP STG 2022 / NNF — neonatal sepsis: recognise (non-specific signs + risk factors) → onset (early <72 h vs late) → blood culture + screen ± LP → empirical IV antibiotics within 1 h (early: ampicillin + gentamicin; late: per antibiogram; ceftriaxone avoided) → supportive care → 48–72 h review, de-escalate, set duration',
  group: 'Neonatology',
  builtin: true,
  guideline_source: NNS_GUIDELINE,
  ciee_sources: NNS_SOURCES,
  ciee_pathway: NNS_PATHWAY,
};
