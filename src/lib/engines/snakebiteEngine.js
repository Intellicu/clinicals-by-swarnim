/**
 * Snakebite Envenomation Intelligence Engine — CIEE built-in.
 *
 * Source: IAP Standard Treatment Guidelines 2022 — Snakebite (§5.54). Indian
 * Academy of Pediatrics. Aligned with WHO/National Snakebite Management
 * Protocol (India).
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner).
 *
 * DRAFT / UNREVIEWED — pending expert clinical sign-off (Dr. Swarnim). Doses
 * reflect the IAP STG 2022 algorithm but must be verified before this engine is
 * exposed as clinically validated. NOTE: ASV dose is NOT weight-based — it is
 * the same for children and adults.
 */

export const SNAKEBITE_GUIDELINE = {
  id: 'GS-IAP-STG-2022-SNK',
  guideline_name: 'IAP STG 2022 — Snakebite Envenomation',
  guideline_section: 'First aid · Envenomation assessment · Polyvalent ASV · Neurotoxic / haemotoxic management · Supportive care',
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
  evidence_grade: 'Practice point',
  recommendation_strength: 'Practice point',
  reference: 'IAP Standard Treatment Guidelines 2022 §5.54 (Snakebite). Companion: National Snakebite Management Protocol / WHO SEARO.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP STG 2022 — Snakebite',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics',
  year: 2022,
});

export const SNAKEBITE_SOURCES = {
  'GS-IAP-STG-2022-SNK-PP': mk('Practice point', 'Practice point', 'IAP STG 2022 §5.54'),
  'GS-IAP-STG-2022-SNK-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'IAP STG 2022 §5.54'),
};

const PP = 'GS-IAP-STG-2022-SNK-PP';
const B = 'GS-IAP-STG-2022-SNK-1B';

export const SNAKEBITE_PATHWAY = {
  entry: 'SNK-DN-01',
  nodes: {
    'SNK-DN-01': {
      id: 'SNK-DN-01', type: 'ACTION', critical: true, source: PP,
      action: 'First aid — reassure, immobilise the bitten limb (splint) at heart level, and transport urgently. Do the "do-nots".',
      points: [
        'Do NOT incise, suck, cauterise, apply a tight tourniquet, or apply ice/chemicals',
        'Remove rings/bangles/tight clothing (swelling will progress)',
        'Keep the child still; move the limb as little as possible',
        'Note the time of bite and any snake description; do not chase/catch the snake',
      ],
      next: 'SNK-DN-02',
    },
    'SNK-DN-02': {
      id: 'SNK-DN-02', type: 'ASSESSMENT', critical: true, source: B,
      question: 'Signs of envenomation present?',
      detail: 'Assess for local, neurotoxic and haemotoxic features. The 20-minute whole-blood clotting test (20-WBCT) is the key bedside coagulation screen.',
      points: [
        'Local: progressive swelling, pain, blistering, regional lymphadenopathy, bleeding from bite',
        'Neurotoxic: ptosis, diplopia, ophthalmoplegia, bulbar & respiratory muscle weakness (elapids — cobra/krait)',
        'Haemotoxic: bleeding gums/haematuria/ecchymoses, incoagulable blood (20-WBCT positive) (vipers)',
      ],
      options: [
        { label: 'No signs yet — dry bite / early', next: 'SNK-DN-03' },
        { label: 'Yes — envenomation signs present', next: 'SNK-DN-04', tone: 'danger' },
      ],
    },
    'SNK-DN-03': {
      id: 'SNK-DN-03', type: 'MONITORING', source: B,
      action: 'Observe for at least 24 hours with serial monitoring — envenomation can be delayed (especially krait/Russell viper).',
      monitoring: [
        { parameter: '20-WBCT + bleeding check', frequency: 'Every 6 hours (and if any bleeding)', target: 'Blood clots in 20 min', alert: 'Non-clotting (20-WBCT positive)', alert_action: 'Envenomated → give ASV (SNK-DN-04)' },
        { parameter: 'Neurological check (ptosis, single-breath count, power)', frequency: 'Every 1–2 hours', target: 'No neuro deficit', alert: 'Ptosis / bulbar / respiratory weakness', alert_action: 'Envenomated → give ASV + airway support (SNK-DN-04)' },
      ],
      safety: [
        { title: 'Do not discharge early', detail: 'Discharge only after ≥24 h with no local progression, normal serial 20-WBCT and no neurotoxicity.' },
      ],
      next: 'SNK-DN-02',
    },
    'SNK-DN-04': {
      id: 'SNK-DN-04', type: 'ACTION', critical: true, source: B, prescribes: 'snake antivenom',
      action: 'Give polyvalent Anti-Snake Venom (ASV) IV once envenomation is confirmed. Keep adrenaline drawn up at the bedside — ASV can cause anaphylaxis.',
      rx: { drug: 'Polyvalent Anti-Snake Venom (ASV)', dose: 'Initial 8–10 vials, reconstituted/diluted in isotonic fluid, IV over ~1 hour. DOSE IS NOT WEIGHT-BASED — same for children and adults.', route: 'IV infusion over ~1 h', duration: 'Repeat per response (see neurotoxic/haemotoxic branch)' },
      safety: [
        { title: 'ASV anaphylaxis', detail: 'Keep adrenaline (0.01 mg/kg IM 1:1000) drawn up. Watch closely during infusion; treat reactions with adrenaline, stop/slow infusion, then resume.' },
        { title: 'Not weight-based', detail: 'Children receive the SAME number of vials as adults — the venom load is independent of body size.' },
      ],
      next: 'SNK-DN-05',
    },
    'SNK-DN-05': {
      id: 'SNK-DN-05', type: 'QUESTION', critical: true, source: B,
      question: 'Predominant envenomation syndrome — neurotoxic or haemotoxic?',
      options: [
        { label: 'Neurotoxic (ptosis, bulbar/respiratory weakness)', set: { syndrome: 'neurotoxic' }, next: 'SNK-DN-06', tone: 'danger' },
        { label: 'Haemotoxic (bleeding, non-clotting blood)', set: { syndrome: 'haemotoxic' }, next: 'SNK-DN-07', tone: 'danger' },
      ],
    },
    'SNK-DN-06': {
      id: 'SNK-DN-06', type: 'ACTION', critical: true, source: B, prescribes: 'neostigmine',
      action: 'Neurotoxic envenomation — protect the airway and give a neostigmine trial (with atropine cover). Intubate/ventilate if respiratory failure.',
      rx: { drug: 'Neostigmine (+ atropine cover)', dose: 'Atropine 0.05 mg/kg IV first, then neostigmine 0.04 mg/kg IV (max 2.5 mg); reassess ptosis/power, repeat per response', route: 'IV', duration: 'Neostigmine may be repeated; benefits post-synaptic (cobra) — often ineffective for krait' },
      points: [
        'Continuous airway watch: single-breath count, SpO₂; low threshold to intubate & ventilate',
        'Neostigmine helps post-synaptic (cobra) envenomation; pre-synaptic (krait/Russell) often does not respond — ventilate and wait',
        'Further ASV if neurotoxicity progresses',
      ],
      next: 'SNK-DN-08',
    },
    'SNK-DN-07': {
      id: 'SNK-DN-07', type: 'ACTION', critical: true, source: B,
      action: 'Haemotoxic envenomation — repeat 20-WBCT 6-hourly and give further ASV while blood remains non-clotting. Blood products only if bleeding continues despite ASV.',
      points: [
        'Repeat 20-WBCT every 6 hours; give a further ASV dose if blood is still non-clotting',
        'Blood products (FFP/platelets/PRBC) only if active bleeding + persistent coagulopathy AFTER adequate ASV',
        'Monitor renal function and urine output (AKI risk); watch for compartment syndrome',
      ],
      next: 'SNK-DN-08',
    },
    'SNK-DN-08': {
      id: 'SNK-DN-08', type: 'MONITORING', source: PP,
      action: 'Supportive & wound care — tetanus prophylaxis, analgesia, wound care; monitor for AKI and compartment syndrome; rehabilitation.',
      monitoring: [
        { parameter: 'Renal function + urine output', frequency: 'Daily (more often if haemotoxic)', target: 'UO ≥1 mL/kg/h, stable creatinine', alert: 'Oliguria / rising creatinine / haemoglobinuria', alert_action: 'Manage AKI; consider dialysis' },
        { parameter: 'Limb — compartment pressure/perfusion', frequency: 'Serial', target: 'Soft compartment, intact perfusion', alert: 'Tense/painful swelling, neurovascular deficit', alert_action: 'Surgical review for compartment syndrome (only after coagulopathy corrected)' },
      ],
      next: 'TERM-DONE',
    },
    'TERM-DONE': { id: 'TERM-DONE', type: 'TERMINAL', source: B, action: 'Snakebite management plan generated — first aid, envenomation assessment, ASV, syndrome-specific treatment and supportive/wound care recorded.' },
  },
};

export const SNAKEBITE_ENGINE = {
  id: 'snakebite-engine',
  label: 'Snakebite Engine',
  desc: 'IAP STG 2022 §5.54 — snakebite: first aid (immobilise, no cut/suck/tourniquet) → envenomation assessment (20-WBCT + neuro) → observe ≥24 h vs polyvalent ASV (NOT weight-based, adrenaline ready) → neurotoxic (neostigmine + atropine, airway) vs haemotoxic (repeat 20-WBCT, further ASV, blood products) → renal/compartment monitoring',
  group: 'Emergency & Critical Care',
  builtin: true,
  guideline_source: SNAKEBITE_GUIDELINE,
  ciee_sources: SNAKEBITE_SOURCES,
  ciee_pathway: SNAKEBITE_PATHWAY,
};
