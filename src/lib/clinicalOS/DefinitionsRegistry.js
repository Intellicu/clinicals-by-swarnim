// ── Central Definitions Registry ──────────────────────────────────────────
// Single source of truth for cross-specialty clinical definitions.
// Covers nephrology + rheumatology. Admin updates propagate everywhere.

export const DEFINITIONS_REGISTRY = {
  // ── Nephrology ────────────────────────────────────────────────────────────
  AKI: {
    term: "AKI",
    full: "Acute Kidney Injury",
    specialty: ["Nephrology", "Rheumatology"],
    definition: "Increase in sCr by ≥0.3 mg/dL within 48h, OR ≥1.5× baseline within 7 days, OR UO <0.5 mL/kg/h for ≥6h.",
    staging: [
      "Stage 1: sCr ×1.5–1.9 or +0.3 mg/dL; UO <0.5 mL/kg/h for 6–12h",
      "Stage 2: sCr ×2.0–2.9; UO <0.5 mL/kg/h for ≥12h",
      "Stage 3: sCr ×3.0 or ≥4.0 mg/dL or RRT; UO <0.3 mL/kg/h for ≥24h or anuria ≥12h",
    ],
    source: "KDIGO AKI 2012",
    last_updated: "2024-01",
    review_status: "EXPERT_REVIEWED",
  },
  SRNS: {
    term: "SRNS",
    full: "Steroid-Resistant Nephrotic Syndrome",
    specialty: ["Nephrology"],
    definition: "Failure to achieve complete remission after 8 weeks of prednisolone 60 mg/m²/day (or 2 mg/kg/day, max 60 mg) in a child with nephrotic syndrome.",
    org_notes: {
      ISKDC: "No remission after 4 weeks full-dose + 4 weeks alternate-day steroids",
      IPNA: "No remission after 6–8 weeks daily prednisolone 60 mg/m²/day",
    },
    source: "IPNA 2021 Clinical Practice Recommendations",
    last_updated: "2024-02",
    review_status: "EXPERT_REVIEWED",
  },
  NS_REMISSION: {
    term: "NS Remission",
    full: "Nephrotic Syndrome Remission",
    specialty: ["Nephrology"],
    definition: "Urine protein: creatinine ratio (PCR) <200 mg/g (or <0.2 mg/mg), or urine dipstick negative/trace, on 3 consecutive early-morning samples.",
    source: "IPNA 2021",
    last_updated: "2024-02",
    review_status: "EXPERT_REVIEWED",
  },
  NS_RELAPSE: {
    term: "NS Relapse",
    full: "Nephrotic Syndrome Relapse",
    specialty: ["Nephrology"],
    definition: "PCR ≥2000 mg/g (or ≥2 mg/mg), or urine protein 3+ or 4+ on 3 consecutive early-morning urine samples, after a period of remission.",
    source: "IPNA 2021",
    last_updated: "2024-02",
    review_status: "EXPERT_REVIEWED",
  },
  CKD_STAGING: {
    term: "CKD Stages",
    full: "Chronic Kidney Disease Staging",
    specialty: ["Nephrology", "Rheumatology"],
    definition: "Kidney damage for ≥3 months, defined by structural or functional abnormalities. Staged by eGFR (G1–G5) and albuminuria (A1–A3).",
    staging: [
      "G1: eGFR ≥90 (normal/high)", "G2: 60–89 (mildly decreased)",
      "G3a: 45–59 (mild-moderately decreased)", "G3b: 30–44 (moderately-severely decreased)",
      "G4: 15–29 (severely decreased)", "G5: <15 (kidney failure)",
    ],
    source: "KDIGO CKD 2012",
    last_updated: "2024-01",
    review_status: "EXPERT_REVIEWED",
  },
  BP_STAGES: {
    term: "BP Stages (Pediatric)",
    full: "Blood Pressure Classification (AAP 2017)",
    specialty: ["Nephrology", "Rheumatology", "General Pediatrics"],
    definition: "Pediatric BP classified by age, sex, and height percentiles using 2017 AAP normative data.",
    staging: [
      "Normal: <90th percentile",
      "Elevated: 90th–<95th percentile OR ≥120/80 in ≥13y",
      "Stage 1 HTN: 95th–<95th+12 mmHg OR 130–139/80–89 in ≥13y",
      "Stage 2 HTN: ≥95th+12 mmHg OR ≥140/90 in ≥13y",
    ],
    source: "AAP 2017 Clinical Practice Guideline",
    last_updated: "2024-01",
    review_status: "EXPERT_REVIEWED",
  },

  // ── Rheumatology ─────────────────────────────────────────────────────────
  MAS: {
    term: "MAS",
    full: "Macrophage Activation Syndrome",
    specialty: ["Rheumatology", "Nephrology"],
    definition: "Life-threatening hyperinflammatory syndrome (reactive HLH) occurring in the context of systemic inflammatory diseases, predominantly sJIA and SLE.",
    diagnostic_criteria: {
      sJIA_2016: "Known/suspected sJIA + ferritin >684 ng/mL + ≥2 of: plt ≤181×10⁹/L, AST >48 U/L, TG >156 mg/dL, fibrinogen ≤360 mg/dL",
      HLH_2004: "≥5 of 8 criteria: fever, splenomegaly, cytopenias ×2, hypertriglyceridaemia/hypofibrinogenaemia, haemophagocytosis, low/absent NK activity, ferritin >500 ng/mL, soluble CD25 >2400 U/mL",
    },
    alarm_sign: "Falling ESR despite active fever = MAS alarm (paradox sign)",
    source: "Ravelli et al. 2016 + HLH-2004",
    last_updated: "2024-03",
    review_status: "EXPERT_REVIEWED",
  },
  JADAS: {
    term: "JADAS",
    full: "Juvenile Arthritis Disease Activity Score",
    specialty: ["Rheumatology"],
    definition: "Composite disease activity index for JIA = Physician Global (0–10) + Parent/Patient Global (0–10) + ESR normalised (0–10) + Active Joint Count (0–27 for JADAS-27).",
    formula: "ESR normalisation: (ESR mm/h − 20) / 10, capped at 0–10",
    cutoffs: {
      oligoarticular: "Inactive: ≤1 | Low: >1–2 | Moderate: >2–4.2 | High: >4.2",
      polyarticular: "Inactive: ≤1 | Low: >1–3.8 | Moderate: >3.8–8.5 | High: >8.5",
    },
    source: "Consolaro et al. 2009; validated PRINTO/ACR",
    last_updated: "2024-01",
    review_status: "EXPERT_REVIEWED",
  },
  SLEDAI: {
    term: "SLEDAI-2K",
    full: "SLE Disease Activity Index 2000",
    specialty: ["Rheumatology"],
    definition: "24-item weighted disease activity index for SLE. Score 0–105. Captures activity in last 10 days.",
    cutoffs: "0 = no activity | 1–6 = mild | 7–12 = moderate | 13–19 = high | ≥20 = very high",
    source: "Gladman et al. 2002",
    last_updated: "2024-01",
    review_status: "EXPERT_REVIEWED",
  },
  BVAS: {
    term: "BVAS",
    full: "Birmingham Vasculitis Activity Score v3",
    specialty: ["Rheumatology"],
    definition: "Disease activity score for ANCA-associated vasculitis and other vasculitides. Weighted organ-specific items. Score range 0–63.",
    cutoffs: "0 = remission | 1–15 = mild-moderate | 16–29 = moderate-high | ≥30 = very high",
    source: "Mukhtyar et al. 2008",
    last_updated: "2024-01",
    review_status: "EXPERT_REVIEWED",
  },
  CMAS: {
    term: "CMAS",
    full: "Childhood Myositis Assessment Scale",
    specialty: ["Rheumatology"],
    definition: "Validated functional assessment for JDM/myositis. 14-item scale assessing specific muscle function tasks. Max score 52.",
    source: "Lovell et al. 1999",
    last_updated: "2024-01",
    review_status: "EXPERT_REVIEWED",
  },
  RPGN: {
    term: "RPGN",
    full: "Rapidly Progressive Glomerulonephritis",
    specialty: ["Nephrology", "Rheumatology"],
    definition: "Rapid decline in GFR (50% loss within 3 months) with crescent formation on kidney biopsy. Three types: immune-complex (SLE, IgAV), pauci-immune (ANCA), anti-GBM.",
    source: "KDIGO 2021 GN Guideline",
    last_updated: "2024-01",
    review_status: "EXPERT_REVIEWED",
  },
};

export function getDefinition(term) {
  return DEFINITIONS_REGISTRY[term] || null;
}

export function getDefinitionsBySpecialty(specialty) {
  return Object.values(DEFINITIONS_REGISTRY).filter(d =>
    d.specialty?.includes(specialty)
  );
}

export function getCrossSpecialtyDefinitions() {
  return Object.values(DEFINITIONS_REGISTRY).filter(d =>
    d.specialty?.length > 1
  );
}