/**
 * Steroid-Sensitive Nephrotic Syndrome (SSNS) Intelligence Engine — CIEE built-in.
 * Source: IPNA Clinical Practice Recommendations for the diagnosis and management
 * of children with steroid-sensitive nephrotic syndrome (Trautmann et al.,
 * Pediatr Nephrol 2023; 38:877–919). DOI 10.1007/s00467-022-05739-3.
 *
 * Run by the shared PathwayExecutionEngine (CIEEEngineRunner). Branch entry
 * points (DN-06 first episode, DN-11 infrequent relapse, DN-12 FRNS/SDNS
 * steroid-sparing) are reused by the Nephrotic Syndrome engine.
 */

export const SSNS_GUIDELINE = {
  id: 'GS-IPNA-2022-SSNS',
  guideline_name: 'IPNA 2022 — Steroid-Sensitive Nephrotic Syndrome',
  guideline_section: 'Diagnosis · Initial PDN · Relapse · FRNS/SDNS · Monitoring',
  issuing_body: 'International Pediatric Nephrology Association',
  year: 2022,
  evidence_grade: 'A–X',
  recommendation_strength: 'GRADE',
  doi: '10.1007/s00467-022-05739-3',
  pmid: '36269406',
  reference: 'Trautmann A, et al. Pediatr Nephrol. 2023;38:877–919.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IPNA 2022 — SSNS',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'International Pediatric Nephrology Association',
  year: 2022,
  doi: '10.1007/s00467-022-05739-3',
  pmid: '36269406',
});

export const SSNS_SOURCES = {
  'GS-IPNA-2022-SSNS-A': mk('A', 'Strong recommendation', 'Strong (grade A)'),
  'GS-IPNA-2022-SSNS-B': mk('B', 'Moderate recommendation', 'Moderate (grade B)'),
  'GS-IPNA-2022-SSNS-C': mk('C', 'Weak recommendation', 'Low quality (grade C)'),
  'GS-IPNA-2022-SSNS-X': mk('X', 'Practice point (ungraded)', 'Practice point (grade X)'),
};

const A = 'GS-IPNA-2022-SSNS-A';
const B = 'GS-IPNA-2022-SSNS-B';
const C = 'GS-IPNA-2022-SSNS-C';
const X = 'GS-IPNA-2022-SSNS-X';

export const SSNS_PATHWAY = {
  entry: 'DN-01',
  nodes: {
    // ── Phase 1 — Presentation & diagnosis ────────────────────────────────
    'DN-01': {
      id: 'DN-01', type: 'QUESTION', critical: true, source: A,
      question: 'Is nephrotic syndrome confirmed?',
      detail: 'Nephrotic-range proteinuria (UPCR ≥2 mg/mg OR dipstick ≥3+ on 3 consecutive days) AND serum albumin <30 g/L or oedema.',
      options: [
        { label: 'Yes — NS confirmed', next: 'DN-02' },
        { label: 'No', next: 'TERM-NOT-NS', tone: 'muted' },
      ],
    },
    'DN-02': {
      id: 'DN-02', type: 'QUESTION', critical: true, source: A,
      question: 'Any atypical features?',
      detail: 'Macroscopic haematuria · low C3 · AKI · sustained hypertension · arthritis/rash/extra-renal features.',
      options: [
        { label: 'Yes — atypical', next: 'TERM-ATYPICAL', tone: 'danger' },
        { label: 'No — typical', next: 'DN-03' },
      ],
    },
    'DN-03': {
      id: 'DN-03', type: 'ASSESSMENT', source: A,
      question: 'Age at onset?',
      options: [
        { label: '< 3 months (congenital NS)', next: 'TERM-CONGENITAL', tone: 'danger' },
        { label: '3–12 months (infantile NS)', set: { age_band: 'infantile' }, next: 'DN-04' },
        { label: '> 12 months', set: { age_band: 'child' }, next: 'DN-05' },
      ],
    },
    'DN-04': {
      id: 'DN-04', type: 'ACTION', source: B,
      action: 'Infantile NS (3–12 months): consider primary genetic testing and/or kidney biopsy; if MCD/FSGS or genetics negative, proceed with a standard prednisolone trial. DMS → genetic testing.',
      next: 'DN-05',
    },
    'DN-05': {
      id: 'DN-05', type: 'ACTION', source: B,
      action: 'Before immunosuppression: ensure vaccinations are up to date — pneumococcal, meningococcal, Hep B, varicella, influenza, SARS-CoV-2. Give live vaccines BEFORE starting steroids where possible.',
      safety: [
        { title: 'Live vaccines', detail: 'Live vaccines are contraindicated during daily prednisolone / immunosuppression — complete them beforehand or defer and schedule post-treatment.' },
      ],
      next: 'DN-06',
    },

    // ── Phase 2 — Initial prednisolone course ─────────────────────────────
    'DN-06': {
      id: 'DN-06', type: 'ACTION', source: A, prescribes: 'prednisolone',
      action: 'Start the initial prednisolone course (calculate on estimated dry weight). Single morning dose; NO taper during the alternate-day phase.',
      rx: { drug: 'Prednisolone', dose: '60 mg/m²/day (or 2 mg/kg/day, max 60 mg/day) ×4–6 weeks → 40 mg/m² (or 1.5 mg/kg, max 40 mg) alternate days ×4–6 weeks', route: 'Oral', duration: '8–12 weeks total' },
      monitoring: [
        { parameter: 'Home urine dipstick', frequency: 'Daily', target: 'Neg/Trace by ~day 7–14', alert: 'No response by 4 weeks', alert_action: 'Confirmation period ± IV methylprednisolone' },
        { parameter: 'BP, height, weight, glucose (steroid toxicity)', frequency: 'Each visit', target: 'No toxicity', alert: 'BP ≥90th pct / growth failure / Cushingoid', alert_action: 'Flag steroid toxicity; prioritise steroid-sparing' },
      ],
      safety: [
        { title: 'Live vaccines', detail: 'Suppress live vaccines during daily prednisolone — inactivated influenza/COVID-19 are permitted.' },
      ],
      next: 'DN-07',
    },
    'DN-07': {
      id: 'DN-07', type: 'QUESTION', critical: true, source: A,
      question: 'Response at 4 weeks?',
      detail: 'Complete remission = UPCR ≤0.2 mg/mg OR dipstick Neg/Trace on 3 consecutive days.',
      options: [
        { label: 'Complete remission — SSNS confirmed', next: 'DN-09' },
        { label: 'Partial at 4 weeks — confirmation period', next: 'DN-08' },
        { label: 'No remission at 6 weeks', next: 'TERM-SRNS', tone: 'danger' },
      ],
    },
    'DN-08': {
      id: 'DN-08', type: 'ACTION', source: B,
      action: 'Confirmation period (4–6 weeks): continue prednisolone ± IV methylprednisolone pulses ± RAAS blockade; reassess. Remission → SSNS (late responder); no remission at 6 weeks → SRNS.',
      next: 'DN-09',
    },

    // ── Phase 3 — Relapse detection & classification ──────────────────────
    'DN-09': {
      id: 'DN-09', type: 'QUESTION', critical: true, source: A,
      question: 'Relapse detected?',
      detail: 'Relapse = dipstick ≥3+ on 3 consecutive days OR UPCR ≥2 mg/mg in a previously remitted child.',
      options: [
        { label: 'Yes — relapse', next: 'DN-10' },
        { label: 'No — sustained remission', next: 'DN-20' },
      ],
    },
    'DN-10': {
      id: 'DN-10', type: 'ASSESSMENT', critical: true, source: A,
      question: 'Relapse pattern?',
      options: [
        { label: 'Infrequent relapse', set: { relapse_type: 'infrequent' }, next: 'DN-11' },
        { label: 'Frequent relapse (≥2 in 6 mo or ≥4 in 12 mo)', set: { relapse_type: 'FRNS' }, next: 'DN-12' },
        { label: 'Steroid-dependent (relapse on taper or ≤14 days after stopping)', set: { relapse_type: 'SDNS' }, tone: 'danger', next: 'DN-12' },
      ],
    },
    'DN-11': {
      id: 'DN-11', type: 'ACTION', source: A, prescribes: 'prednisolone',
      action: 'Infrequent relapse: treat with prednisolone until remission, then a short alternate-day course. No steroid-sparing agent required.',
      rx: { drug: 'Prednisolone', dose: '60 mg/m²/day (max 60 mg) until UPCR ≤0.2 ×3 days → 40 mg/m² alternate days ×4 weeks', route: 'Oral', duration: '~5–6 weeks' },
      monitoring: [
        { parameter: 'Home dipstick + clinic UPCR', frequency: 'Dipstick daily during relapse; UPCR monthly ×3', target: 'Remission UPCR ≤0.2', alert: 'Frequent relapses emerging', alert_action: 'Reclassify FRNS/SDNS' },
      ],
      next: 'DN-20',
    },

    // ── Phase 4/5 — FRNS / SDNS steroid-sparing selection ─────────────────
    'DN-12': {
      id: 'DN-12', type: 'QUESTION', critical: true, source: A,
      question: 'Steroid-sparing agent selection (FRNS / SDNS)',
      detail: 'Treat the current relapse with prednisolone to remission, then start a steroid-sparing agent. For SDNS, aim for the lowest alternate-day prednisolone dose that prevents relapse and minimise steroid toxicity. Choose by risk–benefit and family preference.',
      options: [
        { label: 'Levamisole (1st-line, low toxicity)', set: { ssa: 'LEV' }, next: 'DN-AGENT-LEV' },
        { label: 'Cyclophosphamide (1st-line, finite course)', set: { ssa: 'CYC' }, next: 'DN-AGENT-CYC' },
        { label: 'Calcineurin inhibitor — Tacrolimus / Cyclosporine (2nd-line)', set: { ssa: 'CNI' }, next: 'DN-AGENT-CNI' },
        { label: 'MMF / MPS (2nd-line)', set: { ssa: 'MMF' }, next: 'DN-AGENT-MMF' },
        { label: 'Rituximab (complicated FRNS/SDNS)', set: { ssa: 'RTX' }, next: 'DN-AGENT-RTX' },
      ],
    },
    'DN-AGENT-LEV': {
      id: 'DN-AGENT-LEV', type: 'ACTION', source: B, prescribes: 'levamisole',
      action: 'Levamisole — steroid-sparing, low toxicity; suitable first choice in young children.',
      rx: { drug: 'Levamisole', dose: '2.5 mg/kg on alternate days (max 150 mg)', route: 'Oral', duration: '12–24 months' },
      monitoring: [
        { parameter: 'CBC (neutrophils)', frequency: 'Every 4 weeks', target: 'ANC ≥1.0 ×10⁹/L', alert: 'ANC <1.0 (neutropenia)', alert_action: 'Hold levamisole; repeat CBC in 2 weeks' },
        { parameter: 'LFT', frequency: 'Periodic', target: 'Normal', alert: 'Transaminitis', alert_action: 'Review/withhold' },
      ],
      next: 'DN-14',
    },
    'DN-AGENT-CYC': {
      id: 'DN-AGENT-CYC', type: 'ACTION', source: B, prescribes: 'cyclophosphamide',
      action: 'Cyclophosphamide — a finite course giving durable remission in some children; cumulative-dose limited.',
      rx: { drug: 'Cyclophosphamide', dose: '2 mg/kg/day ×8–12 weeks (max cumulative 168 mg/kg; ≤2 lifetime courses)', route: 'Oral', duration: '8–12 weeks' },
      monitoring: [
        { parameter: 'CBC + urinalysis', frequency: 'Every 14 days', target: 'Normal WBC; no haematuria', alert: 'Leukopenia / haematuria', alert_action: 'Hold; check for haemorrhagic cystitis' },
      ],
      safety: [
        { title: 'Cyclophosphamide — fertility', detail: 'Fertility/gonadotoxicity counselling required before prescribing.', gate: true, ack: 'Fertility/teratogen counselling documented (cyclophosphamide)' },
        { title: 'Cumulative dose', detail: 'Do not exceed 168 mg/kg cumulative or 2 courses — switch agent if reached.' },
      ],
      next: 'DN-14',
    },
    'DN-AGENT-CNI': {
      id: 'DN-AGENT-CNI', type: 'ACTION', source: B, prescribes: 'tacrolimus',
      action: 'Calcineurin inhibitor (tacrolimus preferred for cosmetic profile, or cyclosporine). Effective but relapses common on withdrawal; nephrotoxicity with prolonged use.',
      rx: { drug: 'Tacrolimus (or Cyclosporine)', dose: 'Tacrolimus 0.1–0.2 mg/kg/day in 2 doses (C0 3–7 ng/mL) · Cyclosporine 4–5 mg/kg/day in 2 doses (C0 80–120 ng/mL)', route: 'Oral', duration: '12–24 months, then taper' },
      monitoring: [
        { parameter: 'CNI trough (C0)', frequency: 'Every 3 months & after dose change', target: 'Tac 3–7 / CsA 80–120 ng/mL', alert: 'Out of range', alert_action: 'Dose adjust; check interactions' },
        { parameter: 'Creatinine / eGFR + BP', frequency: 'Quarterly', target: 'Stable eGFR; BP <90th pct', alert: 'eGFR decline >25%', alert_action: 'Hold escalation; consider biopsy if CNI >2 years' },
      ],
      safety: [
        { title: 'CNI nephrotoxicity', detail: 'If eGFR falls >25% from baseline, do not escalate — reduce dose and seek nephrology review.' },
      ],
      next: 'DN-14',
    },
    'DN-AGENT-MMF': {
      id: 'DN-AGENT-MMF', type: 'ACTION', source: B, prescribes: 'mycophenolate',
      action: 'Mycophenolate mofetil / sodium (steroid-sparing; non-nephrotoxic alternative to CNI).',
      rx: { drug: 'Mycophenolate mofetil (MMF) / MPS', dose: 'MMF 1200 mg/m²/day in 2 doses (max 2 g/day); MPS 720–1440 mg/m²/day', route: 'Oral', duration: '12–24 months' },
      monitoring: [
        { parameter: 'CBC + LFT', frequency: 'Monthly ×3 then quarterly', target: 'Normal', alert: 'Leukopenia / transaminitis', alert_action: 'Dose reduce; consider MPS' },
      ],
      safety: [
        { title: 'MMF — pregnancy / teratogenicity', detail: 'Teratogenic. Document contraception counselling in fertile patients before prescribing.', gate: true, ack: 'Contraception counselling documented (MMF teratogenicity)' },
      ],
      next: 'DN-14',
    },
    'DN-AGENT-RTX': {
      id: 'DN-AGENT-RTX', type: 'ACTION', source: B, prescribes: 'rituximab',
      action: 'Rituximab — for complicated FRNS/SDNS or steroid-sparing-agent failure/toxicity.',
      rx: { drug: 'Rituximab', dose: '375 mg/m²/dose IV (max 500 mg) × 1–4 doses', route: 'IV', duration: 'Per protocol; re-dose on B-cell reconstitution' },
      monitoring: [
        { parameter: 'CD19 B-cells + immunoglobulins', frequency: 'Before each dose; IgG every 6 months', target: 'CD19 >1% before re-dosing', alert: 'IgG <4 g/L; active infection', alert_action: 'Delay dose; IVIG if hypogammaglobulinaemia' },
      ],
      safety: [
        { title: 'Infection / hypogammaglobulinaemia', detail: 'Do not infuse during active serious infection or if IgG <4 g/L — treat infection first; consider IVIG.' },
        { title: 'Live vaccines', detail: 'Live vaccines contraindicated during B-cell depletion.' },
      ],
      next: 'DN-14',
    },
    'DN-14': {
      id: 'DN-14', type: 'QUESTION', critical: true, source: B,
      question: 'Response to the steroid-sparing agent at 6 months?',
      options: [
        { label: 'Controlled (infrequent/no relapses, no significant toxicity)', next: 'DN-15' },
        { label: 'Not controlled or drug toxicity — switch agent', next: 'DN-12' },
        { label: 'No remission with standard PDN in a later relapse (secondary steroid resistance)', next: 'TERM-SRNS', tone: 'danger' },
      ],
    },
    'DN-15': {
      id: 'DN-15', type: 'QUESTION', critical: true, source: C,
      question: 'Sustained remission ≥12 months on therapy?',
      options: [
        { label: 'Yes — plan withdrawal', next: 'DN-16' },
        { label: 'No — continue, re-evaluate at 6 months', next: 'DN-20' },
      ],
    },
    'DN-16': {
      id: 'DN-16', type: 'ACTION', source: C,
      action: 'Progressive withdrawal of immunosuppression with continued home dipstick monitoring; many children remit post-puberty — observe ≥12 months in remission before discharge.',
      next: 'DN-20',
    },

    // ── Phase 6 — Monitoring & supportive care ────────────────────────────
    'DN-20': {
      id: 'DN-20', type: 'MONITORING', source: X,
      action: 'Long-term monitoring: home dipstick daily during illness & at least weekly; clinic UPCR + BP + anthropometry every 3 months on treatment, every 6 months in remission. Supportive care: salt restriction during oedema, calcium/vitamin D with prolonged steroids, IV albumin 1 g/kg only if albumin <15 g/L with symptomatic hypovolaemia. Annual inactivated influenza & COVID-19 vaccines.',
      next: 'TERM-SSNS',
    },

    // ── Terminals ─────────────────────────────────────────────────────────
    'TERM-NOT-NS': { id: 'TERM-NOT-NS', type: 'TERMINAL', source: X, action: 'Criteria for nephrotic syndrome not met — pursue the differential and refer as needed.' },
    'TERM-ATYPICAL': { id: 'TERM-ATYPICAL', type: 'TERMINAL', source: A, action: 'Atypical features — arrange kidney biopsy + genetic testing; use the SRNS engine for steroid-resistant management.' },
    'TERM-CONGENITAL': { id: 'TERM-CONGENITAL', type: 'TERMINAL', source: X, action: 'Congenital NS (<3 months) — outside this engine; manage via the congenital/genetic NS pathway.' },
    'TERM-SRNS': { id: 'TERM-SRNS', type: 'TERMINAL', source: A, action: 'Steroid resistance — switch to the SRNS engine (biopsy + genetic panel before CNI).' },
    'TERM-SSNS': { id: 'TERM-SSNS', type: 'TERMINAL', source: X, action: 'SSNS management plan generated — treatment, monitoring schedule and safety constraints recorded.' },
  },
};

export const SSNS_ENGINE = {
  id: 'ssns-engine',
  label: 'SSNS Management Engine',
  desc: 'IPNA 2022 — steroid-sensitive NS: initial prednisolone, relapse classification, FRNS/SDNS steroid-sparing selection (levamisole · CYC · CNI · MMF · rituximab) with dosing, monitoring & safety gates',
  group: 'Glomerular Disease',
  builtin: true,
  guideline_source: SSNS_GUIDELINE,
  ciee_sources: SSNS_SOURCES,
  ciee_pathway: SSNS_PATHWAY,
};
