/**
 * Acute Bacterial Meningitis Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Acute Bacterial Meningitis
 * (§7.79). Indian Academy of Pediatrics.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner). Time-critical —
 * antibiotics must NEVER be delayed for the lumbar puncture.
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated.
 */

export const MENINGITIS_GUIDELINE = {
  id: 'GS-IAP-STG-2022-MEN',
  guideline_name: 'IAP STG 2022 — Acute Bacterial Meningitis',
  guideline_section: 'Recognition · Stabilise + culture · Empirical antibiotics + dexamethasone · Encephalitis cover & ICP · Follow-up & prophylaxis',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1A',
  recommendation_strength: 'Strong recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022 §7.79 (Acute Bacterial Meningitis).',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Acute Bacterial Meningitis',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const MENINGITIS_SOURCES = {
  'GS-IAP-STG-2022-MEN-1A': mk('1A', 'Strong recommendation, high-quality evidence', 'IAP STG 2022 §7.79'),
  'GS-IAP-STG-2022-MEN-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022 §7.79'),
  'GS-IAP-STG-2022-MEN-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 §7.79'),
};

const A = 'GS-IAP-STG-2022-MEN-1A';
const B = 'GS-IAP-STG-2022-MEN-1B';
const PP = 'GS-IAP-STG-2022-MEN-PP';

export const MENINGITIS_PATHWAY = {
  entry: 'MEN-DN-01',
  nodes: {
    'MEN-DN-01': {
      id: 'MEN-DN-01', type: 'ASSESSMENT', critical: true, source: A,
      question: 'Clinical suspicion of bacterial meningitis?',
      detail: 'Older children: fever + headache + neck stiffness/photophobia. Infants are often non-specific — a bulging fontanelle, poor feeding, lethargy/irritability, or seizures.',
      points: [
        'Fever with neck stiffness, bulging fontanelle, altered sensorium, seizures, photophobia',
        'Non-blanching (petechial/purpuric) rash → meningococcaemia — a red flag',
        'Infants: non-specific — poor feeding, lethargy, irritability, apnoea, temperature instability',
      ],
      options: [
        { label: 'Yes — suspected meningitis', next: 'MEN-DN-02', tone: 'danger' },
        { label: 'No — pursue alternative diagnosis', next: 'TERM-ALT', tone: 'muted' },
      ],
    },
    'MEN-DN-02': {
      id: 'MEN-DN-02', type: 'ACTION', critical: true, source: A,
      action: 'Stabilise and obtain cultures — ABC, treat shock and seizures, take blood culture + glucose. Do the lumbar puncture only if no contraindication — but NEVER delay antibiotics for the LP.',
      points: [
        'ABC; treat shock (fluid bolus/inotrope) and seizures; give O₂',
        'Blood culture + blood glucose (paired with CSF glucose) before antibiotics if it does not delay them',
        'LP contraindications: cardiorespiratory instability, raised ICP/focal signs, coagulopathy, local infection — defer LP, still give antibiotics now',
      ],
      safety: [
        { title: 'Do not delay antibiotics for LP', detail: 'If LP cannot be done immediately/safely, give empirical antibiotics FIRST and perform LP when safe (CSF may still be informative for several hours).' },
      ],
      next: 'MEN-DN-03',
    },
    'MEN-DN-03': {
      id: 'MEN-DN-03', type: 'ACTION', critical: true, source: A, prescribes: 'ceftriaxone',
      action: 'Empirical antibiotics (meningitis dose) + dexamethasone with or just before the first antibiotic dose. Use an age-specific regimen in neonates.',
      rx: { drug: 'Ceftriaxone (meningitis dose) ± Vancomycin', dose: 'Ceftriaxone 100 mg/kg/day IV (max 4 g/day) in 1–2 doses. Add vancomycin 15 mg/kg/dose q6h (max 4 g/day) if resistant pneumococcus is a concern.', route: 'IV', duration: 'Typically 7–14 days per organism' },
      points: [
        'Dexamethasone 0.15 mg/kg/dose IV q6h ×2–4 days, given WITH or JUST BEFORE the first antibiotic dose (reduces hearing loss, esp. Hib)',
        'Neonates (<1 month): use an age-specific regimen (e.g. cefotaxime + ampicillin) — do NOT use ceftriaxone in neonates with jaundice/calcium-containing fluids',
        'Beyond the neonatal period: ceftriaxone ± vancomycin per local pneumococcal resistance',
      ],
      safety: [
        { title: 'Dexamethasone timing', detail: 'Give the first steroid dose with or just before the first antibiotic — starting it late (after antibiotics) is not beneficial.' },
      ],
      next: 'MEN-DN-04',
    },
    'MEN-DN-04': {
      id: 'MEN-DN-04', type: 'ACTION', critical: true, source: B, prescribes: 'acyclovir',
      action: 'Add cover and manage complications — if encephalitis features are present, add aciclovir. Manage raised ICP, fluids/SIADH, and seizures.',
      rx: { drug: 'Aciclovir (if encephalitis features)', dose: '10–20 mg/kg/dose IV q8h', route: 'IV', duration: 'Until HSV excluded / per confirmation' },
      points: [
        'Encephalitis features (altered behaviour, focal deficit, refractory seizures) → add aciclovir empirically',
        'Manage raised ICP (positioning, treat seizures, consider hyperosmolar therapy); nurse head midline, 30°',
        'Careful fluids — watch for SIADH (hyponatraemia); treat seizures',
      ],
      monitoring: [
        { parameter: 'Sensorium, seizures, sodium, ICP signs', frequency: 'Serial', target: 'Improving GCS, controlled seizures, normal Na', alert: 'Falling GCS, refractory seizures, hyponatraemia', alert_action: 'Manage raised ICP/SIADH; PICU; repeat imaging as indicated' },
      ],
      next: 'MEN-DN-05',
    },
    'MEN-DN-05': {
      id: 'MEN-DN-05', type: 'MONITORING', source: B,
      action: 'Admit, monitor and plan follow-up & contact prophylaxis.',
      points: [
        'Hearing assessment (before or soon after discharge) and developmental follow-up',
        'Chemoprophylaxis for close contacts of meningococcal (and Hib) disease (e.g. rifampicin/ciprofloxacin/ceftriaxone per protocol)',
        'Notify per public-health requirements',
      ],
      monitoring: [
        { parameter: 'Neurological recovery, hearing, development', frequency: 'Inpatient + follow-up', target: 'Recovery without sequelae', alert: 'Focal deficit, hearing loss, developmental concern', alert_action: 'Audiology + neurology/developmental follow-up' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-ALT': { id: 'TERM-ALT', type: 'TERMINAL', source: PP, action: 'Meningitis not suspected — evaluate the febrile child per the appropriate pathway (e.g. Fever Without Focus) and reassess if meningism develops.' },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: A, action: 'Bacterial meningitis management plan generated — stabilisation + cultures, timely empirical antibiotics + dexamethasone, encephalitis cover/ICP management, and follow-up + contact prophylaxis recorded.' },
  },
};

export const MENINGITIS_ENGINE = {
  id: 'meningitis-engine',
  label: 'Acute Bacterial Meningitis Engine',
  desc: 'IAP STG 2022 §7.79 — bacterial meningitis: recognise (infants non-specific; non-blanching rash) → stabilise + blood culture/glucose, LP only if safe but NEVER delay antibiotics → empirical ceftriaxone 100 mg/kg/day ± vancomycin + dexamethasone with/just before first dose (neonates age-specific) → add aciclovir if encephalitis, manage ICP/SIADH/seizures → hearing/developmental follow-up + contact prophylaxis',
  group: 'Emergency & Critical Care',
  builtin: true,
  guideline_source: MENINGITIS_GUIDELINE,
  ciee_sources: MENINGITIS_SOURCES,
  ciee_pathway: MENINGITIS_PATHWAY,
};
