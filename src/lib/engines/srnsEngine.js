/**
 * Steroid-Resistant Nephrotic Syndrome (SRNS) Intelligence Engine — CIEE built-in.
 *
 * Source: ISPN Consensus Guidelines on Management of Steroid-Resistant Nephrotic
 * Syndrome (Vasudevan A, Thergaonkar R, Mantan M, et al. On behalf of the Expert
 * Group of the Indian Society of Pediatric Nephrology). Indian Pediatrics, 2021.
 * International companion: IPNA Clinical Practice Recommendations for SRNS
 * (Trautmann A, et al. Pediatr Nephrol. 2020;35:1529–61).
 *
 * SRNS definition (ISPN 2021, Box I): NO remission after 6 weeks of daily
 * prednisolone at 60 mg/m²/day. IV methylprednisolone is NOT required before
 * labelling SRNS.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner). Phases:
 *   1 Diagnosis · 2 Initial evaluation · 3 Genetic testing decision ·
 *   4 First-line CNI (non-genetic) · 5 6-month response · 6 CNI-resistant ·
 *   7 Supportive care (all) · 8 Monitoring · 9 Transplantation · 10 Special pops.
 */

export const SRNS_GUIDELINE = {
  id: 'GS-ISPN-2021-SRNS',
  guideline_name: 'ISPN 2021 — Steroid-Resistant Nephrotic Syndrome (Consensus)',
  guideline_section: 'Diagnosis · Evaluation · Genetics · CNI · Alternate IS · Supportive care · Transplant',
  issuing_body: 'Indian Society of Pediatric Nephrology',
  year: 2021,
  evidence_grade: '1A–X',
  recommendation_strength: 'GRADE',
  doi: '10.1007/s00467-020-04519-1',
  pmid: '32382828',
  reference: 'Vasudevan A, Thergaonkar R, Mantan M, et al. Consensus Guidelines on Management of SRNS. Indian Pediatrics 2021. Companion: Trautmann A, et al. Pediatr Nephrol 2020;35:1529–61.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'ISPN 2021 — SRNS',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Society of Pediatric Nephrology',
  year: 2021,
  doi: '10.1007/s00467-020-04519-1',
  pmid: '32382828',
});

export const SRNS_SOURCES = {
  'GS-ISPN-2021-SRNS-1A': mk('1A', 'Strong recommendation, high-quality evidence', 'Recommendation (1A)'),
  'GS-ISPN-2021-SRNS-1B': mk('1B', 'Strong recommendation, moderate-quality evidence', 'Recommendation (1B)'),
  'GS-ISPN-2021-SRNS-1D': mk('1D', 'Strong recommendation, very low-quality evidence', 'Recommendation (1D)'),
  'GS-ISPN-2021-SRNS-2A': mk('2A', 'Suggestion, high-quality evidence', 'Suggestion (2A)'),
  'GS-ISPN-2021-SRNS-2B': mk('2B', 'Suggestion, moderate-quality evidence', 'Suggestion (2B)'),
  'GS-ISPN-2021-SRNS-2C': mk('2C', 'Suggestion, low-quality evidence', 'Suggestion (2C)'),
  'GS-ISPN-2021-SRNS-1C': mk('1C', 'Strong recommendation, low-quality evidence', 'Recommendation (1C)'),
  'GS-ISPN-2021-SRNS-X': mk('X', 'Practice point (ungraded)', 'Practice point (X)'),
};

const G1A = 'GS-ISPN-2021-SRNS-1A';
const G1B = 'GS-ISPN-2021-SRNS-1B';
const G1C = 'GS-ISPN-2021-SRNS-1C';
const G1D = 'GS-ISPN-2021-SRNS-1D';
const G2A = 'GS-ISPN-2021-SRNS-2A';
const G2B = 'GS-ISPN-2021-SRNS-2B';
const G2C = 'GS-ISPN-2021-SRNS-2C';
const GX = 'GS-ISPN-2021-SRNS-X';

export const SRNS_PATHWAY = {
  entry: 'DN-01',
  nodes: {
    // ── Phase 1 — Diagnosis of SRNS ───────────────────────────────────────
    'DN-01': {
      id: 'DN-01', type: 'ASSESSMENT', critical: true, source: G1B,
      question: 'Has the child failed to achieve complete remission despite 6 weeks of daily prednisolone at 60 mg/m²/day?',
      detail: 'Definition of complete remission:',
      points: [
        'Urine protein nil–trace by dipstick for 3 consecutive days',
        'OR spot Up/Uc <0.2',
        'OR 24-h urine protein <100 mg/m²/day',
        'IV methylprednisolone is NOT required before labelling SRNS (ISPN 2021)',
      ],
      options: [
        { label: 'Yes — no remission after 6 weeks (SRNS)', set: { steroid_resistant: true }, next: 'DN-02' },
        { label: 'Partial response with steroid toxicity', set: { steroid_resistant: true, partial: true }, next: 'DN-02', tone: 'muted' },
        { label: 'No — remission achieved (not SRNS)', set: { steroid_resistant: false }, next: 'TERM-NOT-SRNS', tone: 'muted' },
      ],
    },
    'DN-02': {
      id: 'DN-02', type: 'ASSESSMENT', source: GX,
      question: 'Is this initial (primary) or late (secondary) steroid resistance?',
      detail: 'Initial = no remission at the first episode (higher monogenic yield). Late = previously steroid-sensitive, resistant in a later relapse (lower monogenic risk; pathogenic mutations not found in late resistance). Congenital onset <3 months is managed via the special-population pathway.',
      options: [
        { label: 'Initial resistance (first episode)', set: { resistance_type: 'initial' }, next: 'DN-03' },
        { label: 'Late (secondary) resistance', set: { resistance_type: 'late' }, next: 'DN-03' },
        { label: 'Congenital NS (onset <3 months)', set: { resistance_type: 'congenital' }, next: 'DN-21', tone: 'danger' },
      ],
    },

    // ── Phase 2 — Initial evaluation ──────────────────────────────────────
    'DN-03': {
      id: 'DN-03', type: 'ACTION', source: G1A,
      action: 'Evaluation of SRNS — baseline investigations.',
      investigations: [
        { test: 'Quantitation of proteinuria', detail: 'Spot urine protein:creatinine ratio (preferred) or 24-h urine protein.' },
        { test: 'Serum creatinine', detail: 'Baseline kidney function.' },
        { test: 'Estimated GFR (eGFR)', detail: 'Schwartz: 0.413 × height(cm) / creatinine(mg/dL).' },
        { test: 'Kidney biopsy', detail: 'Light microscopy + immunofluorescence + electron microscopy (see deferral exceptions).' },
        { test: 'Baseline panel', detail: 'Urinalysis + microscopy, CBC, albumin, electrolytes, fasting glucose, HbA1c, lipid profile, calcium/phosphate/ALP, HBsAg/anti-HCV/HIV, renal ultrasonography.' },
        { test: 'Selective tests', detail: 'C3/C4 and ANA if a secondary cause is suspected. Genetic testing only if an indication is met (next step).' },
      ],
      next: 'DN-04',
    },
    'DN-04': {
      id: 'DN-04', type: 'ASSESSMENT', source: G1B,
      question: 'Are there features suggesting a genetic or secondary cause?',
      detail: 'These features inform the genetic-testing decision in the next step. Genetic clues: onset <1 year, deafness/developmental delay/seizures, family history of SRNS or consanguinity, extrarenal anomalies (genitourinary, microcoria, dystrophic nails, microcephaly), syndromic features. Secondary clues: joint pain, weight loss, alopecia, jaundice, rash, palpable purpura, positive viral serology.',
      options: [
        { label: 'Genetic features present', set: { genetic_features: true }, next: 'DN-07' },
        { label: 'Secondary-cause features present', set: { secondary_features: true }, next: 'DN-07' },
        { label: 'No extrarenal features', next: 'DN-07' },
      ],
    },
    'DN-05': {
      id: 'DN-05', type: 'ASSESSMENT', source: G1A,
      question: 'Is a kidney biopsy required, or can it be deferred/avoided?',
      detail: 'Biopsy REQUIRED: all non-genetic (presumed) SRNS; before CNI; to assess CNI toxicity beyond 30–36 months; non-recovery from AKI; change in course. May be DEFERRED: confirmed monogenic SRNS, familial SRNS with known mutation, congenital NS.',
      options: [
        { label: 'Biopsy required and not yet done — order now', next: 'DN-06' },
        { label: 'Biopsy already done — record result', next: 'DN-06' },
        { label: 'Deferred — confirmed genetic / congenital', set: { biopsy_deferred: true }, next: 'DN-09C', tone: 'muted' },
      ],
    },
    'DN-06': {
      id: 'DN-06', type: 'ASSESSMENT', source: G1A,
      question: 'What is the biopsy histology?',
      detail: 'FSGS 40–50% (CKD progression risk) · MCD 25–40% (better CNI response) · MesPGN 5–8% · Membranous/IgA/proliferative 10–15% (extra workup) · Collapsing FSGS → check HIV & parvovirus · C3 glomerulopathy → complement workup (may be outside SRNS pathway).',
      options: [
        { label: 'FSGS', set: { biopsy_histology: 'FSGS' }, next: 'DN-09C' },
        { label: 'MCD', set: { biopsy_histology: 'MCD' }, next: 'DN-09C' },
        { label: 'MesPGN', set: { biopsy_histology: 'MesPGN' }, next: 'DN-09C' },
        { label: 'Membranous / IgA / proliferative / collapsing', set: { biopsy_histology: 'other' }, next: 'DN-09C', tone: 'muted' },
      ],
    },

    // ── Phase 3 — Genetic testing decision ────────────────────────────────
    'DN-07': {
      id: 'DN-07', type: 'QUESTION', critical: true, source: G1B,
      question: 'Does the patient meet criteria for genetic testing?',
      detail: 'Genetic studies are NOT recommended in all cases — offer them only for these indications:',
      points: [
        'Congenital nephrotic syndrome (onset <3 months)',
        'Initial resistance during infancy (onset <1 year)',
        'Nephrotic syndrome with extrarenal features',
        'Familial steroid-resistance or consanguinity',
        'Non-response to therapy with a CNI (after 6 months)',
        'Prior to transplantation',
        'Monogenic yield by onset: 0–3 mo 69% · 4–12 mo 50% · 1–6 y 25% · 7–12 y 18% · 13–18 y 11%. Late (secondary) resistance: genetic testing NOT indicated.',
      ],
      options: [
        { label: 'Yes — meets an indication (perform genetic testing)', next: 'DN-08' },
        { label: 'No indication — proceed to biopsy', set: { genetic_test_status: 'not_indicated' }, next: 'DN-05' },
        { label: 'Defer genetics — proceed to biopsy now', set: { genetic_test_status: 'deferred' }, next: 'DN-05', tone: 'muted' },
      ],
    },
    'DN-08': {
      id: 'DN-08', type: 'ACTION', source: G1B,
      action: 'Select genetic testing method and refer. NGS multi-gene panel = first choice (higher yield, cheaper than WES) → clinical exome (Mendeliome) if non-diagnostic → WES if still non-diagnostic; Sanger to confirm variants / parental segregation. Top genes (Indian patients, ~50–60% of monogenic SRNS): NPHS1, NPHS2, WT1, COQ2, PLCE1, LAMB2. Refer to an ACMG-compliant laboratory; arrange genetic counselling and document consent (insurance implications).',
      next: 'DN-09A',
    },
    'DN-09A': {
      id: 'DN-09A', type: 'QUESTION', critical: true, source: G1B,
      question: 'Is there a pathogenic / likely pathogenic variant (monogenic disease)?',
      detail: 'PRIMARY PATHWAY DIVERGENCE. A confirmed monogenic cause means CNI and immunosuppression are generally NOT recommended — this drives the highest-priority safety flag before any CNI prescription.',
      options: [
        { label: 'Pathogenic / likely pathogenic — monogenic SRNS', set: { genetic_variant_status: 'PATHOGENIC', acmg_class: 'Pathogenic' }, next: 'DN-09B', tone: 'danger' },
        { label: 'Negative / not done — presumed non-genetic', set: { genetic_variant_status: 'NEGATIVE' }, next: 'DN-05' },
        { label: 'VUS — treat as non-genetic, counsel uncertainty', set: { genetic_variant_status: 'VUS' }, next: 'DN-05', tone: 'muted' },
        { label: 'Targetable mutation identified', set: { genetic_variant_status: 'TARGETABLE' }, next: 'DN-09D' },
      ],
    },
    'DN-09B': {
      id: 'DN-09B', type: 'ACTION', critical: true, source: G1B, tone: 'danger',
      action: 'Confirmed monogenic SRNS — do NOT prescribe CNI or other immunosuppression (does not respond). Exception: some WT1 variants may show partial CNI response — only after documented shared decision-making weighing benefit (oedema relief, higher albumin) vs risk (toxicity, infection, cost). Start ACE-I/ARB (all SRNS, DN-16) + supportive care; eGFR surveillance every 3–6 months; plan transplant evaluation as eGFR declines.',
      safety: [
        { title: 'PrescriptionSuppressor — CNI contraindicated', detail: 'Monogenic SRNS does not respond to CNI (ISPN 2021, Guideline 7, 1B). Any override requires a documented rationale and shared-decision note.', gate: true, ack: 'Monogenic pathway acknowledged — CNI suppressed; supportive care + RAAS blockade selected' },
      ],
      next: 'DN-16',
    },
    'DN-09D': {
      id: 'DN-09D', type: 'ACTION', source: G2C,
      action: 'Targeted therapy by genotype: CoQ pathway defects (COQ2/COQ6/ADCK4) → Coenzyme Q10 supplementation; ARHGDIA → eplerenone; Rho/Rac/Cdc42-network variants → corticosteroids may be effective. Combine with ACE-I/ARB (DN-16) and supportive care (DN-17).',
      next: 'DN-16',
    },

    // ── Phase 4 — First-line treatment (non-genetic SRNS) ─────────────────
    'DN-09C': {
      id: 'DN-09C', type: 'ASSESSMENT', critical: true, source: G2C,
      question: 'Is eGFR adequate to initiate a CNI safely?',
      detail: 'Schwartz eGFR = 0.413 × height(cm) / creatinine(mg/dL).',
      options: [
        { label: 'eGFR ≥60 mL/min/1.73m² — safe to start CNI', set: { egfr_adequate: true }, next: 'DN-10' },
        { label: 'eGFR persistently <60 — avoid CNI, use alternative therapy', set: { egfr_adequate: false }, next: 'DN-09E', tone: 'muted' },
        { label: 'AKI stage 2–3 present — withhold until resolved', next: 'TERM-AKI-HOLD', tone: 'danger' },
      ],
    },
    'DN-09E': {
      id: 'DN-09E', type: 'ACTION', source: G2C,
      action: 'Persistent eGFR <60 mL/min/1.73m² — a CNI is relatively contraindicated (nephrotoxicity). Use a non-nephrotoxic alternative immunosuppressive agent (e.g. IV rituximab) rather than a CNI, alongside mandatory RAAS blockade and supportive care.',
      next: 'DN-15',
    },
    'DN-10': {
      id: 'DN-10', type: 'ACTION', source: G1A, prescribes: 'tacrolimus',
      action: 'Initiate a calcineurin inhibitor — first-line for initial AND late SRNS (highest evidence). Tacrolimus preferred; use cyclosporine if unable to swallow tablets, or where tremor/diabetes risk is a concern (avoid tacrolimus if diabetes risk; avoid both relative to seizure-prone). Co-prescribe alternate-day prednisolone and start ACE-I/ARB concurrently (DN-16).',
      rx: { drug: 'Tacrolimus (or Cyclosporine)', dose: 'Tacrolimus 0.1–0.2 mg/kg/day in 2 doses (max initial 4 mg/day), target trough 4–8 ng/mL · Cyclosporine 3–5 mg/kg/day in 2 doses (max initial 200 mg/day), target trough 80–120 ng/mL. Plus prednisolone 1–1.5 mg/kg alternate days ×4–6 weeks → taper over 6–9 months.', route: 'Oral', duration: 'Minimum 24 months if responsive' },
      monitoring: [
        { parameter: 'CNI trough (C0)', frequency: '2 weeks after initiation, then per indication', target: 'Tac 4–8 / CsA 80–120 ng/mL', alert: 'Out of target range', alert_action: 'Adjust dose; recheck in 1–2 weeks' },
      ],
      safety: [
        { title: 'CNI choice', detail: 'Avoid tacrolimus where diabetes risk is high; cyclosporine causes gingival hyperplasia / hypertrichosis.' },
      ],
      next: 'DN-11',
    },
    'DN-11': {
      id: 'DN-11', type: 'MONITORING', source: G1B,
      action: 'CNI monitoring protocol — begin from Day 1 of therapy. Schedule:',
      monitoring: [
        { parameter: 'CNI trough level (C0)', frequency: 'Week 2 after start; then if toxicity / interaction / relapse', target: 'Tacrolimus 4–8 / cyclosporine 80–120 ng/mL', alert: 'Out of target range', alert_action: 'Adjust dose; recheck in 1–2 weeks' },
        { parameter: 'Creatinine / eGFR + potassium', frequency: '2–4 weeks, then every 3–6 months', target: '<20% rise from pre-CNI baseline', alert: 'Creatinine rise >20%', alert_action: 'Reduce CNI; assess nephrotoxicity' },
        { parameter: 'LFT, uric acid, magnesium, lipids', frequency: 'Every 3–6 months', target: 'Within normal range', alert: 'Abnormal results', alert_action: 'Review CNI dose / interactions' },
        { parameter: 'Blood glucose', frequency: 'Every 3–6 months (especially tacrolimus)', target: 'Normoglycaemia', alert: 'Hyperglycaemia / new diabetes', alert_action: 'Consider switching to cyclosporine' },
        { parameter: 'Blood pressure', frequency: 'Every visit', target: '<90th–95th percentile', alert: 'Sustained hypertension', alert_action: 'Optimise antihypertensives (Table III)' },
        { parameter: 'Cosmetic effects', frequency: 'Every visit', target: 'Tolerable', alert: 'Gingival hyperplasia / hypertrichosis (CsA); tremor / diarrhoea (Tac)', alert_action: 'Consider switching CNI' },
        { parameter: 'Eye examination (cataract / glaucoma)', frequency: 'Every 12 months on long-term steroids', target: 'Normal', alert: 'Cataract / glaucoma', alert_action: 'Ophthalmology referral' },
      ],
      safety: [
        { title: 'CNI drug interactions (Table IV)', detail: 'DECREASE CNI (risk of non-response): phenytoin, carbamazepine, phenobarbitone, rifampicin. INCREASE CNI (nephrotoxicity): erythromycin/clarithromycin, fluconazole/ketoconazole/voriconazole, diltiazem/verapamil. Additive nephrotoxicity: aminoglycosides, amphotericin B, NSAIDs.' },
      ],
      next: 'DN-12',
    },

    // ── Phase 5 — Response assessment at 6 months ─────────────────────────
    'DN-12': {
      id: 'DN-12', type: 'ASSESSMENT', critical: true, source: G2C,
      question: 'What is the CNI response at 6 months?',
      detail: 'Response definitions (Box I, ISPN 2021):',
      points: [
        'Complete remission — urine protein nil–trace ×3 days, Up/Uc <0.2, or 24-h <100 mg/m²/day',
        'Partial remission — urine protein 1+/2+, Up/Uc 0.2–2, albumin ≥3.0 g/dL, no oedema',
        'Non-response — urine protein 3+/4+, Up/Uc >2, albumin <3.0 g/dL or oedema (requires 6 months of adequate dose confirmed by trough levels)',
        'Prognosis (PodoNet, 10-yr renal survival): complete 94% · partial 72% · non-response 43%',
      ],
      options: [
        { label: 'Complete remission', set: { cni_response: 'complete' }, next: 'DN-13' },
        { label: 'Partial remission', set: { cni_response: 'partial' }, next: 'DN-13' },
        { label: 'Non-response (CNI-resistant)', set: { cni_response: 'none' }, next: 'DN-14', tone: 'danger' },
      ],
    },
    'DN-13': {
      id: 'DN-13', type: 'ACTION', source: G2C,
      action: 'Continue CNI for a minimum of 24 months in complete OR partial remission (tacrolimus twice as effective as MMF at maintaining remission at 6 months: 90% vs 45%). At 24 months: sustained complete remission → consider stopping; partial/frequent relapses → continue or switch to rituximab/MMF if CNI–steroid toxicity; beyond 30–36 months → biopsy for nephrotoxicity. Steroid-sensitive relapses (~60%): prednisolone 2 mg/kg/day until remission → alternate-day taper. AKI 2–3 → withhold CNI; eGFR persistently <60 → discontinue and revert to the pre-CNI algorithm.',
      monitoring: [
        { parameter: '24-month CNI review + nephrotoxicity biopsy flag', frequency: '24 months (biopsy flag at 30–36 months)', target: 'Sustained remission, stable eGFR', alert: 'CNI ≥30 months', alert_action: 'Schedule biopsy to assess nephrotoxicity' },
      ],
      next: 'DN-16',
    },

    // ── Phase 6 — CNI-resistant SRNS (non-genetic) ────────────────────────
    'DN-14': {
      id: 'DN-14', type: 'ASSESSMENT', critical: true, source: G2C,
      question: 'CNI non-responder — has genetic testing been performed?',
      detail: 'CNI-resistant disease = non-response to cyclosporin OR tacrolimus in adequate doses titrated to blood levels for 6 months (Box I).',
      options: [
        { label: 'Not yet performed — send genetics & start alternative therapy', next: 'DN-15' },
        { label: 'Performed — negative / VUS', set: { genetic_variant_status: 'NEGATIVE' }, next: 'DN-15' },
        { label: 'Performed — pathogenic (monogenic)', set: { genetic_variant_status: 'PATHOGENIC', acmg_class: 'Pathogenic' }, next: 'DN-09B', tone: 'danger' },
      ],
    },
    'DN-15': {
      id: 'DN-15', type: 'QUESTION', critical: true, source: G2C,
      question: 'Choose alternate therapy for CNI-resistant, non-genetic SRNS',
      detail: 'Suggest IV rituximab OR oral MMF (Guideline 6, 2C). Experimental / trial-only (do NOT prescribe outside trials): adalimumab, abatacept, ofatumumab, ACTH, oral galactose, LDL apheresis.',
      options: [
        { label: 'IV Rituximab', set: { alt_agent: 'RTX' }, next: 'DN-15RTX' },
        { label: 'Oral MMF (± combine with CNI)', set: { alt_agent: 'MMF' }, next: 'DN-15MMF' },
        { label: 'IV Cyclophosphamide (only if CNI unavailable)', set: { alt_agent: 'CYC' }, next: 'DN-15B', tone: 'muted' },
      ],
    },
    'DN-15RTX': {
      id: 'DN-15RTX', type: 'ACTION', source: G2C, prescribes: 'rituximab',
      action: 'IV Rituximab. Complete/partial remission in ~46.4% (MCD better than FSGS; late > initial resistance). Pre-rituximab checklist (mandatory): haemogram, transaminases, HBV/HCV/HIV serology, IgG level, baseline CD19. Auto-prescribe PCP prophylaxis.',
      rx: { drug: 'Rituximab', dose: '375 mg/m²/dose IV, 2 doses at weekly intervals; if CD19 ≥5/µL (or ≥1% lymphocytes) give 1–2 more weekly doses (max 4 total). Re-dose after B-cell reconstitution (~6–9 months) if remission achieved.', route: 'IV', duration: 'Per protocol' },
      monitoring: [
        { parameter: 'CD19 count + haemogram + IgG', frequency: 'Baseline, then per protocol; IgG periodically', target: 'CD19 <5/µL or <1% after dosing', alert: 'Neutropenia / IgG low / infection', alert_action: 'Delay dose; treat infection; consider IVIG' },
        { parameter: 'PCP prophylaxis (co-trimoxazole)', frequency: '5 mg/kg trimethoprim on alternate days for 3–6 months', target: 'Adherence', alert: 'Cytopenia', alert_action: 'Review prophylaxis' },
      ],
      safety: [
        { title: 'Serious adverse effects', detail: 'Infusion reactions (chills, fever, serum sickness, bronchospasm); neutropenia; P. jirovecii pneumonia; hepatitis B reactivation; JC virus; acute lung injury; hypogammaglobulinaemia; rarely PML.' },
      ],
      next: 'DN-16',
    },
    'DN-15MMF': {
      id: 'DN-15MMF', type: 'ACTION', source: G2C, prescribes: 'mycophenolate',
      action: 'Oral MMF. Monotherapy is 83% ineffective (PodoNet); combined CNI + MMF gives some benefit in CNI-resistant disease (3 case series, n=168: complete remission 12–48%, partial 9–38%).',
      rx: { drug: 'Mycophenolate mofetil (MMF)', dose: '600–1200 mg/m²/day in 2 divided doses', route: 'Oral', duration: 'Per response' },
      monitoring: [
        { parameter: 'Haemogram + liver function', frequency: 'Every 3–6 months', target: 'Normal', alert: 'Leukopenia / transaminitis', alert_action: 'Dose reduce; consider MPS' },
      ],
      safety: [
        { title: 'MMF — teratogenicity', detail: 'Teratogenic. Document contraception counselling in fertile patients before prescribing.', gate: true, ack: 'Contraception counselling documented (MMF teratogenicity)' },
      ],
      next: 'DN-16',
    },
    'DN-15B': {
      id: 'DN-15B', type: 'ACTION', source: G2B, prescribes: 'cyclophosphamide',
      action: 'IV Cyclophosphamide — ONLY if a CNI is unavailable (cost or adverse effects). Suggest IV CYC (Guideline 5.1, 2B); do NOT use oral CYC (Guideline 5.2, 2A). Complete/partial remission 10–50%; inferior to CNI.',
      rx: { drug: 'Cyclophosphamide (IV)', dose: '500–750 mg/m² IV every month for 6 doses', route: 'IV', duration: '6 monthly pulses' },
      monitoring: [
        { parameter: 'Blood count (pre-infusion) + hydration', frequency: 'Each pulse', target: 'WBC ≥4000/mm³', alert: 'WBC <4000/mm³', alert_action: 'Hold pulse; defer until recovered' },
      ],
      safety: [
        { title: 'CNI-unavailability required', detail: 'Document the reason a CNI is unavailable before generating an IV CYC prescription; give anti-emetics and mesna (haemorrhagic cystitis). Oral cyclophosphamide is blocked for SRNS.', gate: true, ack: 'CNI-unavailability rationale + mesna/anti-emetic plan documented' },
      ],
      next: 'DN-16',
    },

    // ── Phase 7 — Supportive care (ALL patients) ──────────────────────────
    'DN-16': {
      id: 'DN-16', type: 'ACTION', source: G1B, prescribes: 'enalapril',
      action: 'ACE inhibitor (or ARB if intolerant) — mandatory for ALL patients with SRNS, regardless of genetic status. ACE-I first line; do NOT use dual ACE-I + ARB blockade.',
      rx: { drug: 'Enalapril (ACE-I; ARB alternative)', dose: 'Enalapril 0.08 → max 0.6 mg/kg/day (1–2 doses) · Lisinopril 0.07 → 0.6 mg/kg/day OD · Ramipril 1.6 → 6 mg/m²/day OD. ARB: Losartan 0.7 → 1.4 mg/kg OD · Valsartan 1.3 → 2.7 mg/kg OD.', route: 'Oral', duration: 'Long-term' },
      monitoring: [
        { parameter: 'eGFR + potassium', frequency: 'After initiation and dose changes', target: 'Stable eGFR; K⁺ normal', alert: 'Hyperkalaemia / eGFR fall', alert_action: 'Reduce/hold; recheck' },
      ],
      safety: [
        { title: 'Hold criteria', detail: 'Avoid ACE-I/ARB if eGFR <25 mL/min/1.73m². Withhold temporarily during vomiting, diarrhoea or reduced oral intake. Dual ACE-I + ARB blockade NOT recommended.' },
      ],
      next: 'DN-17',
    },
    'DN-17': {
      id: 'DN-17', type: 'ACTION', source: G1B,
      action: 'Comprehensive supportive care (all SRNS patients).',
      care: [
        { category: 'Blood pressure', detail: 'Target 50–75th centile; ACE-I/ARB first line, add CCB / β-blocker / α-blocker if needed. Reduced-salt diet.' },
        { category: 'Dyslipidaemia', detail: 'Fasting lipids; CHILD-1 → CHILD-2 diet. Statin (atorvastatin 10–20 mg/day) if age ≥8 y and LDL >160 mg/dL (or >130 with a CV risk factor).' },
        { category: 'Thrombosis (1C)', detail: 'No routine prophylactic anticoagulation. Encourage mobilisation, hydration, compression stockings; avoid central lines / arterial punctures. Established thrombosis: enoxaparin 1 mg/kg SC q12h (>2 months) → warfarin INR 2–3 for 3 months or until remission.' },
        { category: 'Cardiovascular risk', detail: 'BMI <85th centile; BP each visit; ABPM every 1–2 years; echocardiogram annually if hypertensive.' },
        { category: 'Adrenal / stress steroids (1D)', detail: 'If oral steroids >2 weeks within the past year: hydrocortisone 100 mg/m² IV pre-op then 25 mg/m² q6h; milder stress 30–50 mg/m²/day.' },
        { category: 'Bone health', detail: 'Vitamin D 400–800 IU/day; calcium 250–750 mg/day.' },
        { category: 'Immunisation', detail: 'Review every 12 months. Avoid live vaccines during immunosuppression — complete beforehand or defer.' },
      ],
      safety: [
        { title: 'Statin gate', detail: 'Do not prescribe statins if age <8 years or LDL below threshold.' },
        { title: 'Live vaccines', detail: 'Contraindicated during immunosuppression — complete beforehand or defer.' },
      ],
      next: 'DN-18',
    },

    // ── Phase 8 — Monitoring schedule ─────────────────────────────────────
    'DN-18': {
      id: 'DN-18', type: 'MONITORING', source: G1B,
      action: 'Structured long-term monitoring (Table V) — auto-generated as a dated task list from the date of CNI initiation, with overdue alerts.',
      monitoring: [
        { parameter: 'Home urine dipstick', frequency: 'Daily ×1–2 wk; 2–3×/wk until remission; weekly thereafter', target: 'Nil–trace', alert: '≥3+ ×3 days', alert_action: 'Flag relapse' },
        { parameter: 'Spot Up/Uc', frequency: 'Baseline; 2–4 wk; then 6–12-monthly', target: '<0.2', alert: '>2', alert_action: 'Reassess response' },
        { parameter: 'Creatinine, electrolytes, albumin, eGFR', frequency: 'Baseline; 2–4 wk; then 3–6-monthly', target: 'Stable', alert: 'eGFR decline', alert_action: 'Adjust CNI; escalate' },
        { parameter: 'BP / ABPM / echo', frequency: 'BP each visit; ABPM 1–2-yearly; echo annually if hypertensive', target: '<90th–95th pct', alert: 'Hypertension', alert_action: 'Optimise therapy' },
        { parameter: 'CNI trough', frequency: '2 weeks post-initiation, then per DN-11', target: 'Tac 4–8 / CsA 80–120 ng/mL', alert: 'Out of range', alert_action: 'Dose adjust' },
        { parameter: 'Repeat renal biopsy', frequency: 'At 30–36 months of CNI; non-recovery from AKI; change in course', target: 'No chronic CNI toxicity', alert: 'Toxicity', alert_action: 'Switch agent' },
      ],
      next: 'DN-19',
    },

    // ── Phase 9 — Transplantation pathway ─────────────────────────────────
    'DN-19': {
      id: 'DN-19', type: 'ASSESSMENT', critical: true, source: G1B,
      question: 'Has the patient reached CKD stage 5 (end-stage kidney disease)?',
      options: [
        { label: 'CKD 5 (eGFR <15) — refer for transplant', set: { ckd_stage: 5 }, next: 'DN-20', tone: 'danger' },
        { label: 'CKD 3–4 — intensify monitoring; plan ahead', set: { ckd_stage: '3-4' }, next: 'TERM-MONITOR' },
        { label: 'CKD 1–2 or in remission — continue management', next: 'TERM-MONITOR' },
      ],
    },
    'DN-20': {
      id: 'DN-20', type: 'ACTION', source: G1B,
      action: 'Pre-transplant evaluation & risk stratification. Genetic testing if not already done (guides donor selection and recurrence risk); recipient + donor evaluation (live-related preferred). Post-transplant FSGS recurrence risk: confirmed genetic <5% (LOW — live donor safe); initial SRNS no genetic ~50% (HIGH); late SRNS no genetic ~80% (VERY HIGH); prior allograft recurrence ~80%. Donor exclusions: heterozygous COL4A3/COL4A4, female hemizygous COL4A5 carriers NOT acceptable; for AR disease heterozygous carrier parent generally acceptable EXCEPT APOL1 risk variant or heterozygous R229Q in NPHS2. Allograft recurrence (2B): plasma exchange 1.5× volume alternate days ×2 wk then weekly ×4–6 wk; IV methylprednisolone 250 mg/m²/day ×3; raise CNI trough (Tac 8–12, CsA 150–200 ng/mL); rituximab 375 mg/m² ×2 (1 week apart); consider oral cyclophosphamide ×3 months in place of MMF; add ACE-I once allograft function stable.',
      monitoring: [
        { parameter: 'Up/Uc (post-transplant)', frequency: 'Daily ×1 wk; weekly ×4 wk; monthly ×1 yr; then 3–6-monthly', target: 'No recurrence', alert: 'Up/Uc ≥1 if pre-transplant anuric, or rise of ≥1 if proteinuric at transplant', alert_action: 'Treat allograft recurrence' },
      ],
      next: 'TERM-TRANSPLANT',
    },

    // ── Phase 10 — Special populations ────────────────────────────────────
    'DN-21': {
      id: 'DN-21', type: 'ACTION', source: G1B, tone: 'danger',
      action: 'Congenital Nephrotic Syndrome (onset <3 months). Diagnosis: large placenta, prematurity, massive proteinuria, hypoalbuminaemia, anasarca; antenatal hyperechoic kidneys, high AFP. Genetic in 70–80% (NPHS1, NPHS2, WT1, LAMB2, PLCE1 ≈90%). Investigations: exome sequencing with extended SRNS panel; TORCH/syphilis/HBV/HCV/HIV; karyotype if ambiguous genitalia/extrarenal features. Management: high-energy diet 110–120 cal/kg/day + protein 3–3.5 g/kg/day (oral/gastrostomy); thyroxine, vitamin D, calcium; albumin infusions 0.5–1.0 g/kg for hypovolaemia/anasarca with IV furosemide 0.5–2 mg/kg at end (unless hypovolaemic); after 4 weeks of life ACE-I ± indomethacin/celecoxib to reduce proteinuria (withhold during hypovolaemia); full primary immunisation + prompt treatment of bacterial infections; WT1 → USS every 3–6 months for Wilms; bilateral nephrectomy only if refractory oedema/repeated hypovolaemia/thrombosis/malnutrition (or pre-transplant in WT1 / persistent nephrotic-range proteinuria); kidney transplantation is the definitive treatment.',
      safety: [
        { title: 'CNI not indicated', detail: 'Congenital NS is genetic — immunosuppression is not effective; manage supportively and plan transplantation.' },
      ],
      next: 'TERM-CONGENITAL',
    },

    // ── Terminals ─────────────────────────────────────────────────────────
    'TERM-NOT-SRNS': { id: 'TERM-NOT-SRNS', type: 'TERMINAL', source: GX, action: 'Remission achieved — not SRNS. Manage as steroid-sensitive NS and reassess if a later relapse fails to remit at 6 weeks.' },
    'TERM-AKI-HOLD': { id: 'TERM-AKI-HOLD', type: 'TERMINAL', source: G2C, action: 'AKI stage 2–3 — withhold the CNI until the AKI resolves. Optimise volume status, stop nephrotoxins (NSAIDs, aminoglycosides, contrast) and treat the precipitant; recheck eGFR and re-enter the pathway once kidney function has recovered.' },
    'TERM-MONITOR': { id: 'TERM-MONITOR', type: 'TERMINAL', source: G1B, action: 'Continue current management with structured monitoring (DN-18) and plan ahead for CKD progression. Re-enter the transplant pathway when eGFR falls.' },
    'TERM-TRANSPLANT': { id: 'TERM-TRANSPLANT', type: 'TERMINAL', source: G1B, action: 'Transplant pathway plan generated — recurrence-risk stratification, donor considerations, post-transplant surveillance and recurrence-management protocol recorded.' },
    'TERM-CONGENITAL': { id: 'TERM-CONGENITAL', type: 'TERMINAL', source: G1B, action: 'Congenital NS management plan generated — genetic workup, nutrition/albumin support, anti-proteinuric therapy, surveillance and transplant planning recorded.' },
  },
};

export const SRNS_ENGINE = {
  id: 'srns-engine',
  label: 'SRNS Management Engine',
  desc: 'ISPN 2021 — steroid-resistant NS: diagnosis (no remission after 6 weeks), baseline evaluation, genetic-testing decision, monogenic vs non-genetic divergence, first-line CNI with TDM, 6-month response, CNI-resistant alternates (rituximab · MMF · IV cyclophosphamide), mandatory RAAS blockade + supportive care, long-term monitoring, transplantation and congenital NS — with dosing, monitoring & safety gates',
  group: 'Glomerular Disease',
  builtin: true,
  guideline_source: SRNS_GUIDELINE,
  ciee_sources: SRNS_SOURCES,
  ciee_pathway: SRNS_PATHWAY,
};
