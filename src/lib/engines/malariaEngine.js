/**
 * Malaria Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Malaria (6.72) with WHO /
 * NVBDCP treatment principles. Indian Academy of Pediatrics.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 / WHO algorithm but must be verified before this
 * engine is exposed as clinically validated.
 */

export const MALARIA_GUIDELINE = {
  id: 'GS-IAP-STG-2022-MAL',
  guideline_name: 'IAP STG 2022 — Malaria',
  guideline_section: 'Confirmation & species · Severity triage · Severe (IV artesunate) · Uncomplicated (ACT / chloroquine + primaquine) · Prevention',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: '1A',
  recommendation_strength: 'Strong recommendation',
  reference: 'IAP Standard Treatment Guidelines 2022, 6.72 (Malaria). Companion: WHO / NVBDCP.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Malaria',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const MALARIA_SOURCES = {
  'GS-IAP-STG-2022-MAL-1A': mk('1A', 'Strong recommendation, high-quality evidence', 'IAP STG 2022, 6.72'),
  'GS-IAP-STG-2022-MAL-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022, 6.72'),
  'GS-IAP-STG-2022-MAL-PP': mk('Practice point', 'Practice point', 'IAP STG 2022, 6.72'),
};

const A = 'GS-IAP-STG-2022-MAL-1A';
const B = 'GS-IAP-STG-2022-MAL-1B';
const PP = 'GS-IAP-STG-2022-MAL-PP';

export const MALARIA_PATHWAY = {
  entry: 'MAL-DN-01',
  nodes: {
    'MAL-DN-01': {
      id: 'MAL-DN-01', type: 'ACTION', critical: true, source: A,
      action: 'Confirm malaria by RDT and/or microscopy BEFORE treating, and identify the species. Never treat on clinical suspicion alone where testing is available.',
      investigations: [
        { test: 'RDT + peripheral smear (thick & thin)', detail: 'Confirm diagnosis and species; smear gives parasite density.' },
        { test: 'Glucose, haemoglobin, renal/hepatic function', detail: 'Baseline; identify severe-disease markers.' },
      ],
      next: 'MAL-DN-02',
    },
    'MAL-DN-02': {
      id: 'MAL-DN-02', type: 'ASSESSMENT', critical: true, source: A,
      question: 'Any feature of SEVERE malaria?',
      detail: 'Any one severe feature → treat as severe malaria regardless of species.',
      points: [
        'Impaired consciousness/coma, seizures, prostration',
        'Respiratory distress/acidosis, shock, severe anaemia (Hb <5 g/dL)',
        'Jaundice, hypoglycaemia, haemoglobinuria, abnormal bleeding, hyperparasitaemia',
      ],
      options: [
        { label: 'Yes — severe malaria', set: { severe: true }, next: 'MAL-DN-03', tone: 'danger' },
        { label: 'No — uncomplicated', set: { severe: false }, next: 'MAL-DN-04' },
      ],
    },
    'MAL-DN-03': {
      id: 'MAL-DN-03', type: 'ACTION', critical: true, source: A, prescribes: 'artesunate',
      action: 'Severe malaria — IV artesunate + supportive care; switch to a full oral ACT course once able; PICU/refer.',
      rx: { drug: 'Artesunate (IV)', dose: '3 mg/kg/dose (<20 kg) or 2.4 mg/kg/dose (≥20 kg) IV at 0, 12 and 24 h, then once daily until able to take orals', route: 'IV (or IM)', duration: 'Then complete a full oral ACT course' },
      points: [
        'Supportive care: treat hypoglycaemia (dextrose), seizures, cautious transfusion for severe anaemia, careful fluid balance (avoid overload)',
        'Once conscious and tolerating orals → complete a full 3-day ACT course',
        'PICU / referral for organ support',
      ],
      monitoring: [
        { parameter: 'Glucose, conscious level, Hb, urine output, parasitaemia', frequency: '4–12 hourly', target: 'Improving, falling parasitaemia', alert: 'Hypoglycaemia / deepening coma / haemoglobinuria', alert_action: 'Correct glucose; manage AKI/anaemia; continue artesunate; watch delayed haemolysis after artesunate' },
      ],
      next: 'MAL-DN-05',
    },
    'MAL-DN-04': {
      id: 'MAL-DN-04', type: 'ACTION', critical: true, source: A, prescribes: 'artemether-lumefantrine',
      action: 'Uncomplicated malaria — treat by species. Screen G6PD before primaquine.',
      rx: { drug: 'Artemether-Lumefantrine (ACT) — for P. falciparum / mixed', dose: 'Weight-band ACT tablets twice daily ×3 days + single-dose primaquine 0.25 mg/kg (gametocidal, after G6PD screen)', route: 'Oral', duration: '3 days (ACT)' },
      points: [
        'P. falciparum / mixed: ACT (artemether-lumefantrine by weight band) BD ×3 days + single-dose primaquine 0.25 mg/kg (G6PD screen first)',
        'P. vivax / ovale: chloroquine 25 mg base/kg over 3 days (10, 10, 5 mg/kg) — or ACT if chloroquine resistance — PLUS primaquine 0.25–0.5 mg/kg/day ×14 days for radical cure (G6PD screen first)',
        'Ensure the child can tolerate and retain oral therapy; give with fatty food (lumefantrine absorption)',
      ],
      safety: [
        { title: 'G6PD before primaquine', detail: 'Screen for G6PD deficiency before primaquine — it can cause severe haemolysis. Primaquine is contraindicated in G6PD deficiency and in infants <6 months / pregnancy.' },
      ],
      next: 'MAL-DN-05',
    },
    'MAL-DN-05': {
      id: 'MAL-DN-05', type: 'MONITORING', source: PP,
      action: 'Follow-up & prevention — adherence check, vector control counselling, and programme reporting.',
      points: [
        'Confirm adherence and completion of the full course; recheck smear if fever persists',
        'Insecticide-treated bed nets, vector-control counselling',
        'Notify per national malaria programme',
      ],
      next: 'TERM-DONE',
    },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: A, action: 'Malaria management plan generated — confirmation & species, severity triage, IV artesunate for severe vs species-specific ACT/chloroquine + primaquine (G6PD-screened) for uncomplicated, plus prevention.' },
  },
};

export const MALARIA_ENGINE = {
  id: 'malaria-engine',
  label: 'Malaria Engine',
  desc: 'IAP STG 2022, 6.72 — malaria: confirm by RDT/microscopy + species → severe features? → severe: IV artesunate (3 mg/kg <20 kg / 2.4 mg/kg ≥20 kg at 0/12/24 h then daily) + supportive care, then oral ACT · uncomplicated: falciparum/mixed → ACT + single-dose primaquine; vivax/ovale → chloroquine + 14-day primaquine (G6PD screen first) → adherence, bed nets, reporting',
  group: 'Infectious Disease',
  builtin: true,
  guideline_source: MALARIA_GUIDELINE,
  ciee_sources: MALARIA_SOURCES,
  ciee_pathway: MALARIA_PATHWAY,
};
