/**
 * UTI & Primary VUR Intelligence Engine — CIEE built-in.
 * Source: Revised ISPN 2023 Guidelines (Meena J, Bagga A, Hari P — Management of
 * Urinary Tract Infections and Vesicoureteric Reflux: Key Updates from Revised
 * Indian Society of Pediatric Nephrology Guidelines 2023).
 *
 * Encodes the conservative imaging strategy:
 *  - Ultrasound KUB in ALL children after a UTI
 *  - MCU only if: non-E. coli UTI <2y, abnormal ultrasound, or recurrent UTI
 *  - AVOID acute-phase DMSA
 *  - Late-phase DMSA (4–6 months) restricted to recurrent UTI or high-grade VUR
 *  - Prophylaxis limited to high-grade VUR (and recurrent UTI with BBD)
 *  - Surgery only for breakthrough febrile UTI despite prophylaxis + BBD care
 */

export const UTI_VUR_GUIDELINE = {
  id: 'GS-ISPN-2023-UTI',
  guideline_name: 'ISPN 2023 — UTI & Primary VUR (Revised Guidelines)',
  guideline_section: 'Diagnosis · Treatment · Imaging · Prevention',
  issuing_body: 'Indian Society of Pediatric Nephrology',
  year: 2023,
  evidence_grade: '2',
  recommendation_strength: 'GRADE',
  doi: null,
  pmid: null,
  reference: 'Meena J, Bagga A, Hari P. Indian Pediatr. 2024 (Revised ISPN UTI/VUR Guidelines 2023).',
};

// Per-recommendation evidence sources (GRADE strength used in the guideline)
export const UTI_VUR_SOURCES = {
  'GS-ISPN-2023-UTI-CPP': {
    guideline_name: 'ISPN 2023 — UTI & Primary VUR',
    guideline_section: 'Clinical Practice Point',
    evidence_grade: 'CPP',
    recommendation_strength: 'Practice Point',
    issuing_body: 'Indian Society of Pediatric Nephrology',
    year: 2023, doi: null, pmid: null,
  },
  'GS-ISPN-2023-UTI-R2': {
    guideline_name: 'ISPN 2023 — UTI & Primary VUR',
    guideline_section: 'Recommendation (GRADE 2)',
    evidence_grade: '2',
    recommendation_strength: 'Weak recommendation',
    issuing_body: 'Indian Society of Pediatric Nephrology',
    year: 2023, doi: null, pmid: null,
  },
  'GS-ISPN-2023-UTI-R1': {
    guideline_name: 'ISPN 2023 — UTI & Primary VUR',
    guideline_section: 'Recommendation (GRADE 1)',
    evidence_grade: '1',
    recommendation_strength: 'Strong recommendation',
    issuing_body: 'Indian Society of Pediatric Nephrology',
    year: 2023, doi: null, pmid: null,
  },
};

const CPP = 'GS-ISPN-2023-UTI-CPP';
const R2 = 'GS-ISPN-2023-UTI-R2';
const R1 = 'GS-ISPN-2023-UTI-R1';

export const UTI_VUR_PATHWAY = {
  entry: 'DN-01',
  nodes: {
    'DN-01': {
      id: 'DN-01', type: 'QUESTION', critical: true, source: CPP,
      question: 'Does the child meet criteria for suspected UTI?',
      detail: 'Fever >48 h without focus in children <24 months, or specific urinary symptoms in older children.',
      options: [
        { label: 'Yes — suspected UTI', next: 'DN-02' },
        { label: 'No', next: 'TERM-NO', tone: 'muted' },
      ],
    },
    'DN-02': {
      id: 'DN-02', type: 'ASSESSMENT', source: CPP,
      question: 'Urine collection method?',
      detail: 'Clean-catch is preferred in toilet-trained/stable children. Sick young infants need catheterization or suprapubic aspiration (SPA) to avoid delay.',
      options: [
        { label: 'Toilet-trained / stable — clean catch', next: 'DN-03' },
        { label: 'Sick young infant — catheter / SPA', next: 'DN-03' },
      ],
    },
    'DN-03': {
      id: 'DN-03', type: 'ACTION', source: R2,
      action: 'Screen with urine dipstick (nitrite + leukocyte esterase) or microscopy, and send urine culture BEFORE starting antibiotics.',
      next: 'DN-04',
    },
    'DN-04': {
      id: 'DN-04', type: 'QUESTION', critical: true, source: CPP,
      question: 'Is the urine culture significant for UTI?',
      detail: 'Significant single-uropathogen growth: SPA ≥10³, catheter ≥10⁴, clean-catch ≥10⁴–10⁵ CFU/mL. Leukocyturia is not required.',
      options: [
        { label: 'Yes — significant growth', next: 'DN-05' },
        { label: 'No / asymptomatic bacteriuria', next: 'TERM-NO', tone: 'muted' },
      ],
    },
    'DN-05': {
      id: 'DN-05', type: 'QUESTION', source: CPP,
      question: 'Febrile UTI (pyelonephritis) or cystitis?',
      options: [
        { label: 'Febrile UTI / pyelonephritis', next: 'DN-06' },
        { label: 'Cystitis (older child / adolescent)', next: 'DN-07' },
      ],
    },
    'DN-06': {
      id: 'DN-06', type: 'ACTION', source: R2, prescribes: 'cefixime',
      action: 'Start antibiotics within 48–72 h of fever onset: 3rd-generation cephalosporin or amoxicillin-clavulanate for 7–10 days. Oral preferred EXCEPT infants <2 months, severely ill, or unable to tolerate oral (use IV).',
      monitoring: [
        { parameter: 'Clinical response (fever, symptoms)', frequency: 'At 48–72 h', target: 'Defervescence and symptom resolution', alert: 'No clinical response at 48–72 h', alert_action: 'Ultrasound KUB + review culture sensitivity; consider changing antibiotic' },
      ],
      next: 'DN-08',
    },
    'DN-07': {
      id: 'DN-07', type: 'ACTION', source: R2, prescribes: 'cephalexin',
      action: 'Cystitis: 1st/2nd-generation cephalosporin or amoxicillin-clavulanate for 3–7 days (oral).',
      monitoring: [
        { parameter: 'Symptom resolution', frequency: 'End of 3–7 day course', target: 'Resolution of dysuria/frequency/urgency', alert: 'Persistent symptoms', alert_action: 'Reassess; repeat urine culture' },
      ],
      next: 'DN-08',
    },
    'DN-08': {
      id: 'DN-08', type: 'ACTION', source: CPP,
      action: 'Perform an ultrasound scan of the kidneys, ureters and bladder (KUB) in ALL children after a UTI — detects congenital anomalies of the urinary tract and clues to bladder-bowel dysfunction.',
      next: 'DN-09',
    },
    'DN-09': {
      id: 'DN-09', type: 'QUESTION', critical: true, source: CPP,
      question: 'Is any MCU (micturating cystourethrography) indication present?',
      detail: 'Perform MCU (after the UTI is treated, generally 2–3 weeks) if ANY: (a) UTI by a non-E. coli uropathogen in a child <2 years, (b) abnormal ultrasound, or (c) recurrent UTI. Limiting MCU to these increases yield and avoids unnecessary radiation.',
      options: [
        { label: 'Yes — ≥1 indication present', set: { mcu_indicated: true }, next: 'DN-10' },
        { label: 'No indication', set: { mcu_indicated: false }, next: 'DN-12' },
      ],
    },
    'DN-10': {
      id: 'DN-10', type: 'ACTION', source: CPP,
      action: 'Perform MCU any time after the UTI has been treated (generally 2–3 weeks, per patient/physician convenience) to grade VUR.',
      next: 'DN-11',
    },
    'DN-11': {
      id: 'DN-11', type: 'QUESTION', critical: true, source: CPP,
      question: 'MCU result — VUR grade?',
      detail: 'Low-grade = I–II; High-grade = III–V.',
      options: [
        { label: 'High-grade VUR (III–V)', set: { vur: 'high' }, tone: 'danger', next: 'DN-13' },
        { label: 'Low-grade VUR (I–II)', set: { vur: 'low' }, next: 'DN-12' },
        { label: 'No VUR', set: { vur: 'none' }, next: 'DN-12' },
      ],
    },
    'DN-12': {
      id: 'DN-12', type: 'QUESTION', critical: true, source: R2,
      question: 'Late-phase DMSA — is there recurrent UTI or high-grade VUR?',
      detail: 'AVOID acute-phase DMSA (low specificity; cannot distinguish acute pyelonephritis from permanent scar). Restrict late-phase DMSA (4–6 months post-UTI) to recurrent UTI or high-grade VUR.',
      options: [
        { label: 'Yes — recurrent UTI or high-grade VUR', next: 'DN-19' },
        { label: 'No', next: 'DN-20' },
      ],
    },
    'DN-19': {
      id: 'DN-19', type: 'ACTION', source: CPP,
      action: 'Perform a late-phase DMSA scan 4–6 months after the UTI to detect permanent kidney scars.',
      next: 'DN-22',
    },
    'DN-20': {
      id: 'DN-20', type: 'ACTION', source: R2,
      action: 'No DMSA indicated. Do NOT perform an acute-phase DMSA scan.',
      next: 'DN-22',
    },
    'DN-13': {
      id: 'DN-13', type: 'ACTION', source: R2, prescribes: 'cotrimoxazole',
      action: 'High-grade VUR (III–V): start antibiotic prophylaxis (cotrimoxazole or nitrofurantoin if >3 months; cephalexin in young infants). Evaluate for bladder-bowel dysfunction (BBD) and manage with urotherapy.',
      monitoring: [
        { parameter: 'Breakthrough febrile UTI', frequency: 'Ongoing / each visit', target: 'No breakthrough febrile UTI', alert: 'Breakthrough febrile UTI on prophylaxis', alert_action: 'Reassess adherence & BBD; consider surgical referral' },
        { parameter: 'Growth, BP, proteinuria, kidney function', frequency: 'Each clinic visit', target: 'Normal for age', alert: 'Hypertension / proteinuria / declining function', alert_action: 'Manage reflux nephropathy; nephrology follow-up' },
      ],
      next: 'DN-14',
    },
    'DN-14': {
      id: 'DN-14', type: 'QUESTION', critical: true, source: R2,
      question: 'Recurrent breakthrough febrile UTI despite prophylaxis AND optimal BBD management?',
      options: [
        { label: 'Yes', tone: 'danger', next: 'DN-15' },
        { label: 'No', next: 'DN-16' },
      ],
    },
    'DN-15': {
      id: 'DN-15', type: 'ACTION', source: R2,
      action: 'Consider surgical ureteric reimplantation. Endoscopic injection of a bulking agent is a minimally invasive alternative but has a lower success rate — discuss with caregivers.',
      next: 'DN-26',
    },
    'DN-16': {
      id: 'DN-16', type: 'ACTION', source: CPP,
      action: 'Continue prophylaxis. Periodic follow-up: growth, blood pressure, proteinuria and kidney function each visit; ultrasound to monitor kidney growth.',
      next: 'DN-26',
    },
    'DN-26': {
      id: 'DN-26', type: 'ACTION', source: CPP,
      action: 'Perform a late-phase DMSA 4–6 months after UTI to detect kidney scars (high-grade VUR qualifies). Repeat DMSA later only with recurrence of febrile UTI.',
      next: 'TERM-VUR',
    },
    'DN-22': {
      id: 'DN-22', type: 'QUESTION', critical: true, source: R2,
      question: 'Prevention — risk profile?',
      detail: 'All toilet-trained children with a UTI should be evaluated for bladder-bowel dysfunction (BBD).',
      options: [
        { label: 'Normal urinary tract, no BBD', next: 'DN-23' },
        { label: 'Recurrent febrile UTI with BBD (± VUR)', next: 'DN-24' },
      ],
    },
    'DN-23': {
      id: 'DN-23', type: 'ACTION', source: R2,
      action: 'No antibiotic prophylaxis (normal tract, no BBD). Give safety-net advice for prompt assessment of future febrile illness. Cranberry products may be used in recurrent UTI with a normal tract; circumcision may be considered in at-risk boys. Do NOT give prophylaxis for antenatally detected hydronephrosis while awaiting evaluation.',
      next: 'TERM-STD',
    },
    'DN-24': {
      id: 'DN-24', type: 'ACTION', source: R1, prescribes: 'cotrimoxazole',
      action: 'Manage BBD with urotherapy (± laxatives) — strong recommendation. Antibiotic prophylaxis (cotrimoxazole/nitrofurantoin) may be preferred over surveillance in recurrent febrile UTI with BBD, irrespective of VUR.',
      monitoring: [
        { parameter: 'Breakthrough febrile UTI & bowel/bladder habits', frequency: 'Ongoing / each visit', target: 'No recurrence; resolution of BBD', alert: 'Breakthrough UTI', alert_action: 'Reassess adherence/BBD; reconsider strategy' },
      ],
      next: 'TERM-STD',
    },
    'TERM-STD': {
      id: 'TERM-STD', type: 'TERMINAL', source: CPP,
      action: 'Pathway complete — UTI managed; imaging and prevention per ISPN 2023.',
    },
    'TERM-VUR': {
      id: 'TERM-VUR', type: 'TERMINAL', source: CPP,
      action: 'Pathway complete — primary VUR management plan generated; long-term reflux-nephropathy surveillance advised.',
    },
    'TERM-NO': {
      id: 'TERM-NO', type: 'TERMINAL', source: CPP,
      action: 'UTI not confirmed — do not treat asymptomatic bacteriuria; reassess if symptoms develop.',
    },
  },
};

// Hub-ready engine record (same shape the Intelligence Engines hub renders)
export const UTI_VUR_ENGINE = {
  id: 'uti-vur-ispn-2023',
  label: 'UTI & Primary VUR Engine',
  desc: 'Diagnosis → treatment → conservative imaging (US all; MCU restricted; avoid acute DMSA; late DMSA for recurrent UTI/high-grade VUR) → prophylaxis & VUR management',
  group: 'CAKUT & Urology',
  builtin: true,
  guideline_source: UTI_VUR_GUIDELINE,
  ciee_sources: UTI_VUR_SOURCES,
  ciee_pathway: UTI_VUR_PATHWAY,
};
