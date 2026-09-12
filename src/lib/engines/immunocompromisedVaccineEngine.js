/**
 * Immunization in Immunocompromised Children Intelligence Engine — CIEE built-in.
 * Source: IAP 2023 Immunization Guidelines · KDIGO 2009 (transplant) ·
 * AST IDCOP 2013 (immunosuppression) · CDC Yellow Book 2024.
 *
 * Decision pathway:
 *  - Classify immunosuppression level (none / low / moderate / severe)
 *  - Identify current immunosuppressive agents
 *  - Live vaccine screen (contraindication check)
 *  - Inactivated vaccine schedule (all safe, check seroconversion)
 *  - Steroid dose threshold for live vaccine hold
 *  - Post-transplant vaccine timing
 *  - Dialysis-specific vaccines (HBV, pneumococcal)
 *  - Seroconversion checking & boosters
 *  - Household contact vaccination
 */

export const ICV_GUIDELINE = {
  id: 'GS-IAP-2023-ICV',
  guideline_name: 'IAP 2023 — Immunization in Immunocompromised Children',
  guideline_section: 'Immunosuppression Classification · Live vs Inactivated · Timing',
  issuing_body: 'Indian Academy of Pediatrics · KDIGO · AST IDCOP',
  year: 2023,
  evidence_grade: 'A–D',
  recommendation_strength: 'GRADE',
  doi: null,
  pmid: null,
  reference: 'IAP ACVIP 2023 Immunization Guidelines for Immunocompromised Children. Indian Pediatr 2023.',
};

const mk = (grade, strength, section) => ({
  guideline_name: 'IAP 2023 — Immunization in Immunocompromised Children',
  guideline_section: section,
  evidence_grade: grade,
  recommendation_strength: strength,
  issuing_body: 'Indian Academy of Pediatrics · KDIGO · AST IDCOP',
  year: 2023, doi: null, pmid: null,
});

export const ICV_SOURCES = {
  'GS-IAP-2023-A': mk('A', 'Strong recommendation', 'Strong (grade A)'),
  'GS-IAP-2023-B': mk('B', 'Moderate recommendation', 'Moderate (grade B)'),
  'GS-IAP-2023-C': mk('C', 'Weak recommendation', 'Low quality (grade C)'),
  'GS-IAP-2023-X': mk('X', 'Practice point (ungraded)', 'Practice point (grade X)'),
};

const A = 'GS-IAP-2023-A';
const B = 'GS-IAP-2023-B';
const C = 'GS-IAP-2023-C';
const X = 'GS-IAP-2023-X';

export const ICV_PATHWAY = {
  entry: 'IC-01',
  nodes: {
    // ── Phase 1 — Immunosuppression classification ────────────────────────
    'IC-01': {
      id: 'IC-01', type: 'QUESTION', critical: true, source: A,
      question: 'What is the child\'s current immunosuppression status?',
      detail: 'Immunosuppression level determines live vaccine eligibility. None = no immunosuppression. Low = prednisolone <1 mg/kg/day (or <20 mg/day if >10 kg) OR monotherapy tacrolimus/cyclosporine at therapeutic levels. Moderate = prednisolone 1–2 mg/kg/day OR dual therapy (CNI + MMF/azathioprine). Severe = prednisolone ≥2 mg/kg/day for >14 days OR rituximab within 6 months OR triple therapy OR recent transplant (<6 months) OR on chemotherapy.',
      options: [
        { label: 'No immunosuppression (baseline)', set: { imm_level: 'none' }, next: 'IC-02' },
        { label: 'Low (pred <1 mg/kg/day or single CNI)', set: { imm_level: 'low' }, next: 'IC-03' },
        { label: 'Moderate (pred 1–2 mg/kg/day or dual therapy)', set: { imm_level: 'moderate' }, next: 'IC-03' },
        { label: 'Severe (pred ≥2 mg/kg, rituximab <6m, triple therapy, <6m post-transplant, chemo)', set: { imm_level: 'severe' }, next: 'IC-03' },
      ],
    },

    // ── Phase 2 — Baseline serology ───────────────────────────────────────
    'IC-02': {
      id: 'IC-02', type: 'ACTION', source: B,
      action: 'Before starting immunosuppression (if possible), check baseline serology: HBsAg, anti-HBs, anti-HCV, VZV IgG, MMR IgG, CMV IgG. This determines which vaccines are needed and which live vaccines can be given pre-immunosuppression. If already immunosuppressed, check serology to guide catch-up.',
      next: 'IC-03',
    },

    // ── Phase 3 — Live vaccine screen ─────────────────────────────────────
    'IC-03': {
      id: 'IC-03', type: 'QUESTION', critical: true, source: A,
      question: 'Are any LIVE vaccines due or needed?',
      detail: 'Live vaccines: BCG, OPV, MMR, varicella (VZV), yellow fever, live-attenuated influenza (LAIV — nasal), rotavirus. These are CONTRAINDICATED in moderate–severe immunosuppression. In low immunosuppression, may be given with specialist input. In severe immunosuppression, ALL live vaccines are contraindicated until immunosuppression is reduced.',
      options: [
        { label: 'Yes — live vaccine(s) due', next: 'IC-04' },
        { label: 'No — only inactivated vaccines due', next: 'IC-06' },
      ],
    },

    // ── Phase 4 — Live vaccine eligibility ────────────────────────────────
    'IC-04': {
      id: 'IC-04', type: 'QUESTION', critical: true, source: A,
      question: 'Is the immunosuppression level low enough to give live vaccines?',
      detail: 'Live vaccines are SAFE if: no immunosuppression, OR low-dose prednisolone (<1 mg/kg/day or <20 mg/day total) for <14 days, OR monotherapy CNI at therapeutic levels. Live vaccines are CONTRAINDICATED if: prednisolone ≥2 mg/kg/day (or ≥20 mg/day if >10 kg) for >14 days, rituximab within 6 months, MMF/azathioprine combined with steroids, recent transplant (<6 months), chemotherapy, or primary immunodeficiency.',
      options: [
        { label: 'Yes — safe to give (none or low immunosuppression)', next: 'IC-05' },
        { label: 'No — CONTRAINDICATED (moderate/severe immunosuppression)', next: 'IC-DEFER', tone: 'danger' },
      ],
    },
    'IC-05': {
      id: 'IC-05', type: 'ACTION', source: A,
      action: 'Administer live vaccines: MMR (0.5 mL SC at 9 months, 15 months, 4–6 years), varicella (0.5 mL SC at 15 months and 4–6 years). If VZV IgG negative and exposed to immunosuppression risk, give VZV vaccine ≥4 weeks BEFORE starting immunosuppression. Rotavirus: give in infancy before immunosuppression. BCG: give at birth (contraindicated if known immunodeficiency). OPV: use IPV instead in immunosuppressed household contacts.',
      monitoring: [
        { parameter: 'Post-vaccine reaction (fever, rash)', frequency: 'At 7–14 days', target: 'Mild reaction only', alert: 'Severe reaction or disseminated vaccine strain', alert_action: 'Report AEFI, seek specialist advice, consider IVIG/acyclovir for VZV/MMR' },
      ],
      next: 'IC-06',
    },
    'IC-DEFER': {
      id: 'IC-DEFER', type: 'TERMINAL', source: A,
      action: 'Live vaccines CONTRAINDICATED — DEFER until immunosuppression is reduced. For MMR/VZV: wait until prednisolone <1 mg/kg/day for ≥4 weeks AND no rituximab in last 6 months AND transplant >6 months stable. If urgent VZV protection needed and vaccine contraindicated: give VZIG after exposure. If urgent measles protection: give IVIG after exposure. Inactivated vaccines CAN be given during immunosuppression (see next step).',
      next: 'IC-06',
    },

    // ── Phase 5 — Inactivated vaccine schedule ────────────────────────────
    'IC-06': {
      id: 'IC-06', type: 'ACTION', source: A,
      action: 'Administer ALL inactivated vaccines on schedule — they are SAFE in immunosuppression. Priority vaccines: (1) Pneumococcal: PCV15/PCV20 (primary series + booster). If CKD/dialysis: also PPSV23 at age ≥2 years (≥8 weeks after PCV). (2) Influenza: annual IIV (inactivated, NOT LAIV nasal). Give early in season. (3) Hepatitis B: high-dose schedule (40 mcg at 0,1,2,6 months for dialysis; check anti-HBs ≥10 IU/L post-series). (4) Hib, DTaP/IPV, Hepatitis A, Tdap: all on schedule. (5) HPV: 9-valent at age 9–14 (2 doses) or 15–26 (3 doses). (6) Meningococcal: MenACWY + MenB if asplenia/complement deficiency/eculizumab.',
      monitoring: [
        { parameter: 'Anti-HBs titre (HBV)', frequency: '1–2 months after series completion', target: '≥10 IU/L (≥100 ideal in dialysis)', alert: 'Anti-HBs <10 IU/L', alert_action: 'Repeat series (double dose), recheck; consider HBIG if exposed' },
        { parameter: 'Pneumococcal serology / clinical response', frequency: 'Clinical', target: 'No invasive pneumococcal disease', alert: 'Breakthrough pneumococcal infection', alert_action: 'Check antibody titres, consider booster' },
      ],
      next: 'IC-07',
    },

    // ── Phase 6 — Post-transplant timing ──────────────────────────────────
    'IC-07': {
      id: 'IC-07', type: 'QUESTION', source: B,
      question: 'Is the child post-kidney transplant?',
      detail: 'Post-transplant vaccine timing is critical. No vaccines in first 6 months post-transplant (except influenza during outbreak and rabies/HBV post-exposure). Live vaccines are permanently CONTRAINDICATED post-transplant. Inactivated vaccines resume at 6 months if stable graft function.',
      options: [
        { label: 'Yes — post-transplant', set: { post_tx: true }, next: 'IC-08' },
        { label: 'No — not transplanted', set: { post_tx: false }, next: 'IC-09' },
      ],
    },
    'IC-08': {
      id: 'IC-08', type: 'ACTION', source: B,
      action: 'Post-transplant immunization schedule: (1) Months 0–6 post-Tx: NO routine vaccines (except influenza IIV during outbreak, HBV/rabies post-exposure). (2) At 6 months: resume inactivated vaccines (DTaP/IPV, Hib, HepA, HBV, pneumococcal, HPV, meningococcal, Tdap). (3) Live vaccines: PERMANENTLY CONTRAINDICATED post-transplant (MMR, VZV, BCG, OPV, rotavirus, yellow fever). (4) If VZV IgG negative pre-transplant: vaccinate BEFORE transplant (≥4 weeks before). (5) Annual influenza IIV is mandatory (household contacts too). (6) Check anti-HBs yearly; revaccinate if <10 IU/L.',
      monitoring: [
        { parameter: 'Anti-HBs titre', frequency: 'Yearly post-transplant', target: '≥10 IU/L', alert: 'Anti-HBs <10 IU/L', alert_action: 'Booster dose, recheck' },
        { parameter: 'Graft function (creatinine)', frequency: 'With each vaccine visit', target: 'Stable', alert: 'Rising creatinine after vaccine', alert_action: 'Evaluate rejection vs vaccine reaction' },
      ],
      next: 'IC-09',
    },

    // ── Phase 7 — Dialysis-specific ────────────────────────────────────────
    'IC-09': {
      id: 'IC-09', type: 'QUESTION', source: B,
      question: 'Is the child on dialysis (HD or PD)?',
      detail: 'Dialysis patients have reduced vaccine seroconversion. HBV requires high-dose schedule and anti-HBs monitoring. Pneumococcal needs both PCV and PPSV23. Influenza is annual mandatory.',
      options: [
        { label: 'Yes — on dialysis', set: { dialysis: true }, next: 'IC-10' },
        { label: 'No — not on dialysis', set: { dialysis: false }, next: 'IC-11' },
      ],
    },
    'IC-10': {
      id: 'IC-10', type: 'ACTION', source: B, prescribes: 'hepatitis-b-vaccine',
      action: 'Dialysis-specific immunization: (1) Hepatitis B: high-dose 40 mcg (double dose) at 0, 1, 2, 6 months. Check anti-HBs 1–2 months post-series; if <10 IU/L, repeat series. Annual anti-HBs check; booster if <10. (2) Pneumococcal: PCV15/PCV20 primary + PPSV23 at ≥2 years (≥8 weeks after last PCV). PCV booster 5 years after PPSV23. (3) Influenza: annual IIV (mandatory, give at start of season). (4) All other inactivated vaccines on schedule. (5) HBV vaccine should be given EARLY in CKD course (before dialysis if possible) for better seroconversion.',
      monitoring: [
        { parameter: 'Anti-HBs titre', frequency: 'After series, then yearly', target: '≥10 IU/L (≥100 ideal)', alert: 'Anti-HBs <10 IU/L', alert_action: 'Repeat double-dose series, check for HBsAg (chronic infection)' },
      ],
      next: 'IC-11',
    },

    // ── Phase 8 — Household contacts ───────────────────────────────────────
    'IC-11': {
      id: 'IC-11', type: 'ACTION', source: A,
      action: 'Vaccinate ALL household and close contacts: this provides indirect (cocoon) protection. Contacts should receive ALL vaccines including live (MMR, VZV, rotavirus, OPV if in OPV-only country — but IPV preferred if household has immunosuppressed child). Influenza annual IIV for all household members ≥6 months. If household contact receives live vaccine (especially VZV/MMR): if the immunosuppressed child develops rash after contact exposure, isolate and give VZIG/acyclovir. Avoid OPV in household — use IPV to prevent vaccine-derived polio transmission.',
      next: 'IC-12',
    },

    // ── Phase 9 — Seroconversion & boosters ────────────────────────────────
    'IC-12': {
      id: 'IC-12', type: 'ACTION', source: B,
      action: 'Seroconversion monitoring in immunosuppressed children: (1) HBV: anti-HBs 1–2 months post-series (≥10 IU/L). (2) Pneumococcal: consider pneumococcal antibody panel if recurrent infections. (3) MMR/VZV: check IgG before immunosuppression if possible; if negative and live vaccine contraindicated, document for IVIG post-exposure. (4) Tetanus: check tetanus IgG if on long-term immunosuppression. (5) Annual influenza: no serology needed, give annually. (6) Post-rituximab: seroconversion is impaired for 6+ months; check IgG levels and consider IVIG if hypogammaglobulinemia + recurrent infections.',
      monitoring: [
        { parameter: 'Serum IgG (if rituximab)', frequency: 'Every 3–6 months post-rituximab', target: '>600 mg/dL', alert: 'Hypogammaglobulinemia + recurrent infections', alert_action: 'IVIG replacement therapy' },
        { parameter: 'Vaccine-specific IgG (HBV, MMR, VZV)', frequency: 'Post-series and annually', target: 'Seroprotective levels', alert: 'Non-seroconversion', alert_action: 'Revaccinate when immunosuppression reduced; consider IVIG post-exposure' },
      ],
      next: 'TERM-ICV',
    },

    // ── Terminals ──────────────────────────────────────────────────────────
    'TERM-ICV': {
      id: 'TERM-ICV', type: 'TERMINAL', source: A,
      action: 'Immunization plan completed — document all vaccines given, serology results, and next-due dates. Key principles: (1) All inactivated vaccines are SAFE in immunosuppression. (2) Live vaccines are contraindicated in moderate–severe immunosuppression — defer until reduced. (3) Check seroconversion for HBV, pneumococcal. (4) Vaccinate household contacts. (5) Annual influenza is mandatory. (6) Post-transplant: no vaccines for 6 months, then resume inactivated; live vaccines permanently contraindicated.',
    },
  },
};

// Hub-ready engine record
export const IMMUNOCOMPROMISED_VACCINE_ENGINE = {
  id: 'immunocompromised-vaccine-engine',
  label: 'Immunocompromised Vaccine Engine',
  desc: 'IAP 2023 — live vs inactivated · steroid threshold · post-transplant timing · dialysis HBV high-dose · seroconversion · household cocoon',
  group: 'CKD & Genetics',
  builtin: true,
  guideline_source: ICV_GUIDELINE,
  ciee_sources: ICV_SOURCES,
  ciee_pathway: ICV_PATHWAY,
};