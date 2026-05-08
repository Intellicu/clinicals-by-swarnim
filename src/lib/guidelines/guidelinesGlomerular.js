/**
 * GLOMERULAR DISEASE GUIDELINES — IgAN, LN, FSGS, C3G, PSGN, MPGN, Vasculitis
 */

export const GLOMERULAR_GUIDELINES = [

// ═══════════════════════════════════════════════════════════════════════════
// 1. IgA NEPHROPATHY
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-igan",
  title: "IgA Nephropathy & IgA Vasculitis Nephritis (HSP) in Children",
  category: "Glomerular Diseases",
  source: "KDIGO 2021 / IPNA / ESPN",
  year: 2024,
  evidence_level: "Moderate Quality Evidence",
  tags: ["IgAN", "IgA nephropathy", "HSP", "Henoch-Schonlein", "MEST-C", "proteinuria", "ACE-I", "Oxford classification"],
  summary: "IgAN diagnosis, Oxford-MEST-C histological classification, risk stratification, and treatment escalation from supportive care to immunosuppression.",
  sections: {
    quick_summary: {
      definition: "IgAN: mesangial IgA deposits (biopsy-proven) + haematuria ± proteinuria. IgAVN (HSP nephritis): same histology with purpuric rash, arthritis, abdominal pain (systemic IgA vasculitis).",
      epidemiology: "Most common primary GN worldwide; 30% progress to ESRD by 20–30 years. In children, often presents post-URTI. HSP nephritis occurs in 30–50% of Henoch-Schonlein purpura.",
      pathophysiology: "Galactose-deficient IgA1 → IgG anti-IgA1 autoantibodies → immune complex mesangial deposition → complement activation → glomerular inflammation → mesangial proliferation + sclerosis.",
      age_specific: "Children tend to have more favourable prognosis than adults. HSP nephritis peaks age 5–10y. Oxford MEST-C score valid in children.",
      emergency_recognition: [
        "AKI + rapidly rising Cr + crescents on biopsy → aggressive immunosuppression urgently",
        "Nephrotic-range proteinuria (UPCR >2000) + hypertension → high-risk IgAN"
      ],
      immediate_management: [
        "Confirm diagnosis: biopsy with immunofluorescence (IgA mesangial deposits)",
        "Oxford MEST-C classification: M (mesangial), E (endocapillary), S (segmental sclerosis), T (tubular atrophy), C (crescents)",
        "Start ACE-I (enalapril 0.1–0.5 mg/kg/day) if UPCR >200 mg/mmol regardless of BP",
        "Target UPCR <100 mg/mmol with ACE-I optimisation before considering immunosuppression"
      ]
    },
    management: {
      risk_stratification: [
        "Low risk: isolated haematuria + UPCR <200 + normal GFR + M0E0S0T0 — supportive care only",
        "Moderate risk: UPCR 200–2000 + normal/mildly reduced GFR — ACE-I/ARB + KDIGO guidance",
        "High risk: UPCR >2000 OR crescents OR GFR falling — immunosuppression indication"
      ],
      supportive: [
        "ACE-I or ARB: all patients with UPCR >200 mg/mmol — titrate to maximum tolerated dose",
        "Target UPCR <100 mg/mmol within 6 months",
        "BP target <75th percentile for age/height/sex",
        "Omega-3 fish oil (EPA/DHA): 1–3 g/day — modest antiproteinuric effect in low-risk IgAN",
        "Tonsillectomy: reduces proteinuria episodes in tonsillar IgAN (level 3 evidence)"
      ],
      immunosuppression: [
        "Indication: UPCR still >200 mg/mmol after 3 months optimal ACE-I/ARB AND eGFR >30",
        "Prednisolone 0.5–1 mg/kg/day × 2 months, then taper over 4–6 months (TESTING-T trial evidence in adults)",
        "Crescentic IgAN (C1 or C2): IV methylprednisolone pulse 10–30 mg/kg/day × 3 days, then prednisolone",
        "MESTAG score ≥2 + GFR declining: consider cyclophosphamide + prednisolone (high-risk protocol)",
        "Sparsentan (dual endothelin-RAS blockade): Phase III PROTECT trial — emerging option in adults",
        "Rituximab: insufficient evidence for IgAN; may be used in research protocols"
      ],
      hsp_nephritis: [
        "Mild HSP nephritis (haematuria alone, UPCR <200): supportive; NSAIDs for pain (short course)",
        "Moderate HSP nephritis (UPCR 200–2000): ACE-I; consider prednisolone if nephrotic range",
        "Severe HSP nephritis (UPCR >2000 or crescents or AKI): biopsy; aggressive immunosuppression same as IgAN crescentic",
        "Duration of nephritis monitoring: 6 months post-rash resolution minimum"
      ]
    },
    drugs: [
      {
        name: "Enalapril / Losartan",
        dose: "Enalapril 0.1–0.5 mg/kg/day; losartan 0.7–1.4 mg/kg/day",
        max: "Enalapril 40 mg/day; losartan 100 mg/day",
        purpose: "First-line antiproteinuric + antihypertensive in IgAN",
        monitoring: "K⁺, Cr at 2 weeks; UPCR monthly until stable",
        notes: "Titrate to maximum tolerated dose for antiproteinuric effect. UPCR response at 3 months determines immunosuppression need."
      },
      {
        name: "Prednisolone (IgAN immunosuppression)",
        dose: "0.5–1 mg/kg/day (max 60 mg) × 2 months, then taper × 4 months",
        max: "60 mg/day",
        purpose: "Moderate-high risk IgAN with persistent proteinuria after ACE-I optimisation",
        monitoring: "UPCR monthly, Cr, BP; steroid toxicity monitoring",
        notes: "TESTING-T trial (low-dose) and STOP-IgAN: immunosuppression reduces proteinuria but TESTING-T also showed serious infection risk at higher doses."
      }
    ],
    monitoring: {
      frequency: "Monthly UPCR + eGFR + BP for first 6 months; then 3-monthly if stable.",
      parameters: [
        "UPCR (spot morning urine — most important marker)",
        "eGFR (Cr-based)",
        "BP",
        "Urinalysis (haematuria grade)",
        "Annual biopsy only if UPCR rising or GFR declining"
      ],
      follow_up: "Lifelong nephrology. Annual BP + UPCR + eGFR. Risk of hypertension and CKD in adulthood. Transition to adult nephrology essential."
    },
    nutrition: [
      "Low-Na⁺ diet if hypertensive",
      "Avoid excessive red meat (protein load worsens proteinuria)",
      "Fish oil supplement: EPA/DHA 1–3 g/day — modest benefit in low-risk IgAN"
    ],
    vaccination: [
      "Standard schedule — no live vaccine contraindication unless on significant immunosuppression",
      "On prednisolone >20 mg/day: defer live vaccines"
    ],
    red_flags: [
      "eGFR falling >5 mL/min/y or UPCR rising on ACE-I → biopsy repeat (new crescents?) or immunosuppression",
      "AKI + gross haematuria during URTI → IgAN mesangioproliferative flare → check Cr recovery"
    ],
    pearls: [
      "Oxford MEST-C score: T (tubular atrophy/interstitial fibrosis) = strongest predictor of ESRD — cannot be reversed",
      "Optimise ACE-I/ARB for ≥3 months BEFORE adding immunosuppression — most patients respond to supportive care",
      "HSP nephritis: can develop up to 6 months after rash resolves — urine monitoring for full 6 months mandatory",
      "Fish oil is evidence-based in low-risk IgAN — cheap, safe, anti-inflammatory (EPA/DHA inhibit eicosanoid pathway)"
    ]
  }
},

// ═══════════════════════════════════════════════════════════════════════════
// 2. LUPUS NEPHRITIS
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-lupus-nephritis",
  title: "Lupus Nephritis in Children — ACR/EULAR/KDIGO",
  category: "Glomerular Diseases",
  source: "ACR / EULAR / KDIGO",
  year: 2024,
  evidence_level: "High Quality Evidence",
  tags: ["lupus", "LN", "SLE", "Class III", "Class IV", "MMF", "cyclophosphamide", "belimumab", "voclosporin"],
  summary: "LN classification (ISN/RPS 2018), induction and maintenance therapy, monitoring for renal flare, and management of complications in paediatric SLE.",
  sections: {
    quick_summary: {
      definition: "Glomerulonephritis in systemic lupus erythematosus — immune complex deposition in glomeruli. LN occurs in 50–70% of childhood SLE; often more severe and earlier than adult-onset.",
      epidemiology: "Childhood SLE: 15–20% of all SLE; predominantly female; peak adolescence. Higher prevalence in Asian and African-American children. Class III/IV most common in children.",
      pathophysiology: "Anti-dsDNA and other autoantibodies → immune complex deposition → complement activation → glomerular inflammation → proteinuria and GFR loss. Class IV (diffuse proliferative) = most aggressive.",
      age_specific: "Children present more acutely and severely than adults. Renal flares more frequent in adolescence (hormonal influence). Adherence is a major challenge in teenage girls.",
      emergency_recognition: [
        "Rapidly rising Cr + haematuria + hypertension + low C3/C4 → active class IV LN → urgent biopsy + induction",
        "Nephrotic syndrome + class V LN → risk of thrombosis",
        "Pulmonary haemorrhage + renal failure → pulmonary-renal syndrome"
      ],
      immediate_management: [
        "Confirm diagnosis: biopsy with immunofluorescence + electron microscopy",
        "Check: anti-dsDNA, complement C3/C4, CBC (pancytopenia), urine UPCR, Cr, BP",
        "Class III/IV: induction with MMF (first-line) OR cyclophosphamide (NIH or Euro-Lupus)",
        "Hydroxychloroquine 5 mg/kg/day (max 400 mg): all SLE patients — anti-flare, steroid-sparing"
      ]
    },
    classification: [
      { type: "Class I", definition: "Minimal mesangial LN — normal light microscopy", management: "Hydroxychloroquine; treat systemic SLE" },
      { type: "Class II", definition: "Mesangial proliferative LN", management: "Hydroxychloroquine; low-dose prednisolone if symptomatic" },
      { type: "Class III", definition: "Focal proliferative LN (<50% glomeruli)", management: "Induction: MMF + prednisolone; Maintenance: MMF" },
      { type: "Class IV", definition: "Diffuse proliferative LN (≥50% glomeruli) — most severe", management: "Induction: MMF (or IV cyclophosphamide); Maintenance: MMF; consider belimumab adjunct" },
      { type: "Class V", definition: "Membranous LN — nephrotic syndrome", management: "ACE-I + hydroxychloroquine; add MMF if UPCR >2000 or GFR declining" },
      { type: "Class VI", definition: "Advanced sclerosis >90% — ESRD", management: "RRT planning; conservative management; transplant when disease quiescent" }
    ],
    management: {
      induction_class_III_IV: [
        "MMF (preferred in children): 600 mg/m²/dose BD (target 2 g/m²/day); European evidence (ALMS trial) equivalent to NIH cyclophosphamide",
        "IV methylprednisolone pulse 10–30 mg/kg/day × 3 days for severe flare, then oral prednisolone 0.5–1 mg/kg/day",
        "Euro-Lupus IV cyclophosphamide: 500 mg IV × 6 fortnightly doses (less gonadotoxic than NIH high-dose)",
        "NIH cyclophosphamide: 0.5–1 g/m² IV monthly × 6 months (severe, biopsy-proven Class IV with crescents)",
        "Hydroxychloroquine 5 mg/kg/day (max 400 mg): MUST be added to all LN treatment — reduces flares and mortality",
        "Response assessment at 3 months: UPCR should fall >50%; Cr stable"
      ],
      maintenance: [
        "MMF 600 mg/m²/dose BD × minimum 3 years (preferred over azathioprine in children — MAINTAIN trial)",
        "OR azathioprine 1.5–2 mg/kg/day if MMF not tolerated",
        "Prednisolone taper: aim ≤5 mg/day by 6 months of maintenance",
        "Hydroxychloroquine continued indefinitely — reduces flare rate 50%",
        "Belimumab (anti-BLyS): add-on in inadequately controlled LN — monthly IV or weekly SC",
        "Voclosporin: add-on CNI; AURORA trial data supports use with MMF in Class III–V"
      ],
      renal_flare: [
        "Renal flare: doubling of UPCR OR rising Cr OR new haematuria — check anti-dsDNA + C3/C4",
        "Mild flare: increase MMF dose + short-course prednisolone",
        "Severe flare: rebiopsy if needed; repeat induction (IV methylprednisolone + MMF escalation)"
      ]
    },
    drugs: [
      {
        name: "MMF (mycophenolate mofetil)",
        dose: "600 mg/m²/dose BD (= up to 1.5 g BD in adults)",
        max: "2 g/day (higher in refractory — 3 g/day in adults)",
        purpose: "Induction and maintenance of Class III/IV/V LN",
        monitoring: "CBC monthly (cytopenia), LFT; UPCR monthly; MPA levels not routinely needed",
        notes: "EC-MPS (Myfortic) for GI intolerance. Teratogenic — mandatory contraception in adolescent girls. Infective risk — PCP prophylaxis during induction (TMP-SMX BD 3 days/week)."
      },
      {
        name: "Hydroxychloroquine (Plaquenil)",
        dose: "5 mg/kg/day OD (max 400 mg/day)",
        max: "400 mg/day; ≤5 mg/kg IDEAL body weight",
        purpose: "All SLE patients — disease modifier, anti-flare, steroid-sparing",
        monitoring: "Annual retinal screening from 5 years of use (retinal toxicity — maculopathy)",
        notes: "Safest SLE drug in pregnancy. Takes 3 months for full effect. Never stop abruptly — withdrawal triggers flare."
      },
      {
        name: "Cyclophosphamide IV (Euro-Lupus)",
        dose: "500 mg IV q2 weeks × 6 doses",
        max: "500 mg/dose (Euro-Lupus; lower gonadotoxicity than NIH)",
        purpose: "Severe Class III/IV LN induction if MMF unavailable or failed",
        monitoring: "CBC 2 weeks post each dose; urinalysis (haemorrhagic cystitis); cumulative dose (LIFETIME <168 mg/kg)",
        notes: "Mesna 20% cyclophosphamide dose IV pre + 4h + 8h after: uroprotection (haemorrhagic cystitis). Hyperhydration 1.5× maintenance. GnRH agonist for ovarian preservation if female."
      },
      {
        name: "Belimumab",
        dose: "10 mg/kg IV monthly OR 200 mg SC weekly",
        max: "Per protocol",
        purpose: "Inadequately controlled active LN as add-on to MMF + steroids",
        monitoring: "UPCR, Cr monthly; infusion reactions; immunoglobulins",
        notes: "Approved in paediatrics (≥5y) for SLE. BLISS-LN trial: 43% renal response vs 32% placebo. Not monotherapy — always with background MMF."
      }
    ],
    monitoring: {
      frequency: "Monthly during induction; 3-monthly maintenance; anti-dsDNA + C3/C4 every visit",
      parameters: [
        "UPCR (most important activity marker in LN)",
        "Serum Cr, eGFR",
        "Anti-dsDNA titre (rises with flare)",
        "C3 and C4 (falls with active LN)",
        "CBC (pancytopenia — disease activity + drug toxicity)",
        "BP every visit",
        "Urinalysis + microscopy (RBC casts = active nephritis)",
        "Hydroxychloroquine level (adherence + therapeutic)",
        "Annual ECHO (pericarditis, Libman-Sacks endocarditis)"
      ],
      follow_up: "Lifelong nephrology + rheumatology. Annual ophthalmology (HCQ). Bone density (steroid osteopenia). Cardiovascular risk from age 16y. Transition planning."
    },
    nutrition: [
      "Low Na⁺ diet if hypertensive or oedematous",
      "Vitamin D + calcium supplementation during steroid therapy",
      "Avoid high-phenylalanine foods if on phenobarbital (seizure risk in CNS lupus)",
      "Sun protection — UV exposure triggers lupus flare; dietary changes secondary"
    ],
    vaccination: [
      "Pneumococcal PCV13 + PPSV23 (increased infection risk in SLE)",
      "Annual influenza (inactivated only — not live)",
      "Hepatitis B if non-immune",
      "HPV vaccination — cervical cancer risk elevated in SLE + immunosuppression",
      "MMR/Varicella: live vaccines — defer while on significant immunosuppression; give in remission"
    ],
    red_flags: [
      "Rising anti-dsDNA + falling C3 + rising UPCR → renal flare → increase immunosuppression",
      "AKI + crescents on biopsy → emergency IV methylprednisolone pulse + aggressive induction",
      "Haematological emergency: Hb <7 or platelets <20 → IVIG or pulse steroids",
      "CNS lupus (psychosis, seizures) → hospitalise; IV methylprednisolone + cyclophosphamide"
    ],
    pearls: [
      "Class IV LN = diffuse proliferative = MUST treat aggressively — best chance to preserve renal function is induction within weeks",
      "Hydroxychloroquine is the most important drug in SLE — reduces flares, steroid dose, damage accrual, and mortality; never omit",
      "Anti-dsDNA + C3/C4 trend: rising dsDNA + falling complement = imminent flare — treat BEFORE UPCR worsens",
      "Adherence in adolescents: hydroxychloroquine levels can be checked — undetectable level = non-adherence, not treatment failure"
    ]
  }
},

// ═══════════════════════════════════════════════════════════════════════════
// 3. PSGN — POST-STREPTOCOCCAL GN
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-psgn",
  title: "Post-Streptococcal Glomerulonephritis (PSGN)",
  category: "Glomerular Diseases",
  source: "PRNT / AHA",
  year: 2022,
  evidence_level: "Moderate Quality Evidence",
  tags: ["PSGN", "APSGN", "streptococcal", "glomerulonephritis", "haematuria", "hypertension", "complement"],
  summary: "PSGN — acute GN following streptococcal infection. Usually self-limiting but hypertension, AKI and volume overload require specific management.",
  sections: {
    quick_summary: {
      definition: "Immune complex GN following Group A streptococcal pharyngitis (1–3 weeks) or skin infection/impetigo (3–6 weeks). Clinical triad: haematuria + hypertension + oedema.",
      epidemiology: "Most common acute GN in children; peak 5–12 years; developing countries more common. Pharyngitis strains M1, M12; skin strains M47, M49, M57.",
      pathophysiology: "Streptococcal antigens (SpeB, GAPDH, NAPlr) → antibody-antigen immune complex → subepithelial 'humps' on biopsy → complement C3 activation → inflammatory infiltrate → GFR reduction + haematuria.",
      age_specific: "Peak school age 5–12y. Infants rare. Subclinical infection: family members often affected (gross haematuria in index, microscopic in siblings).",
      emergency_recognition: [
        "Hypertensive emergency: BP >99th percentile + headache + vomiting + altered consciousness",
        "Pulmonary oedema: respiratory distress + bilateral crepitations + hypertension",
        "AKI with oliguria + rising Cr — crescentic GN (rare, <5%)"
      ],
      immediate_management: [
        "Penicillin V 250 mg QDS × 10 days (eradicate streptococcal infection — does NOT affect renal outcome)",
        "Salt restriction + fluid restriction to insensible + UO if oliguric",
        "Furosemide 1–2 mg/kg IV for oedema and hypertension",
        "Antihypertensives for Stage 2 HTN (amlodipine 0.1 mg/kg/day or labetolol IV if emergency)"
      ]
    },
    management: {
      diagnosis: [
        "ASO titre: rises 1–3 weeks after pharyngitis; may be negative in impetigo (skin infection)",
        "Anti-DNAse B: more reliable marker — rises in both pharyngitis and impetigo",
        "C3 low (consumption) + C4 normal (alternate pathway activation) — returns to normal by 6–8 weeks",
        "Renal biopsy: NOT needed for typical PSGN; biopsy if C3 low >8 weeks, AKI persisting >3 weeks, or nephrotic syndrome",
        "Throat/skin culture: often negative at time of presentation (2–3 weeks post-infection)"
      ],
      supportive: [
        "Salt restrict: 1–2 mEq/kg/day Na⁺; fluid restrict to insensible + UO if oliguric",
        "Furosemide 1–2 mg/kg IV BD for oedema + hypertension (first-line antihypertensive in volume overloaded PSGN)",
        "ACE-I: NOT first-line in acute PSGN (risk of hyperkalaemia + AKI in acute setting); use amlodipine if BP not controlled by furosemide alone",
        "Dialysis: <5% of cases — severe AKI + fluid overload + uraemia"
      ],
      prognosis_monitoring: [
        "Macrohaematuria resolves within 2–3 weeks in most",
        "Microhaematuria may persist 12–18 months",
        "Proteinuria resolves within 3–6 months",
        "C3 returns to normal by 6–8 weeks — if still low → consider MPGN, C3G, SLE",
        "Long-term: 95% complete recovery; 1–5% develop CKD (elderly, severe presentation)"
      ]
    },
    drugs: [
      {
        name: "Penicillin V",
        dose: "250 mg QDS × 10 days",
        max: "500 mg QDS",
        purpose: "Eradication of streptococcal infection (does NOT change renal outcome — important counselling point)",
        monitoring: "Throat culture to confirm eradication if needed; compliance",
        notes: "Amoxicillin 50 mg/kg/day TDS × 10 days alternative if penicillin allergy; use clindamycin for penicillin allergy."
      },
      {
        name: "Furosemide",
        dose: "1–2 mg/kg IV BD",
        max: "6 mg/kg/day",
        purpose: "First-line for oedema and hypertension in PSGN (volume-mediated HTN)",
        monitoring: "UO, K⁺, weight, BP",
        notes: "Volume overload is key driver of HTN in PSGN — furosemide often normalises BP within 24–48h without requiring additional antihypertensives."
      }
    ],
    monitoring: {
      frequency: "Weekly during acute phase; monthly × 6 months; then 6-monthly until microhaematuria/proteinuria resolve.",
      parameters: [
        "BP (can remain elevated weeks)",
        "UPCR (should resolve <3–6 months)",
        "Urinalysis (haematuria resolution)",
        "Serum Cr (should return to baseline within 2–4 weeks)",
        "C3 (confirm return to normal by 8 weeks — if not, reconsider diagnosis)"
      ],
      follow_up: "Discharge when BP normal + no oedema + Cr stable. Clinic at 1 month, 3 months, 6 months. Annual BP check for 5 years (late hypertension risk)."
    },
    nutrition: [
      "Salt restriction during acute phase: 1–2 mEq/kg/day Na⁺",
      "Fluid restriction if oliguric: insensible + UO replacement",
      "K⁺ restriction if hyperkalaemia or oliguric",
      "Resume normal diet once oedema resolves and UO normalises"
    ],
    vaccination: [
      "Standard schedule maintained",
      "No specific vaccine contraindications",
      "Streptococcal vaccine: not currently available for GAS prevention"
    ],
    red_flags: [
      "C3 still low at 8 weeks → biopsy — consider C3G, MPGN, SLE, endocarditis",
      "AKI persisting >3 weeks → crescentic GN — biopsy + immunosuppression",
      "Recurrent PSGN → check for C3G, MPGN, complement dysregulation"
    ],
    pearls: [
      "C3 low + C4 normal = classic PSGN (alternate pathway). C3 + C4 both low → SLE or endocarditis-GN (classic pathway)",
      "ASO titre negative in impetigo-related PSGN — use anti-DNAse B instead (more reliable for skin infection strains)",
      "Penicillin eradicates infection but does NOT change renal outcome — important message for parents",
      "C3 must return to normal by 6–8 weeks — if persistently low, rebiopsy: C3 glomerulopathy or MPGN"
    ]
  }
},

// ═══════════════════════════════════════════════════════════════════════════
// 4. ANCA-ASSOCIATED VASCULITIS NEPHRITIS
// ═══════════════════════════════════════════════════════════════════════════
{
  id: "gl-anca-vasculitis",
  title: "ANCA-Associated Vasculitis — GPA, MPA & EGPA in Children",
  category: "Glomerular Diseases",
  source: "SHARE / ACR / EULAR",
  year: 2023,
  evidence_level: "Moderate Quality Evidence",
  tags: ["ANCA", "GPA", "MPA", "EGPA", "Wegener", "c-ANCA", "p-ANCA", "rituximab", "cyclophosphamide", "pulmonary-renal"],
  summary: "ANCA vasculitis in children: induction with rituximab or cyclophosphamide, maintenance, and management of pulmonary-renal syndrome.",
  sections: {
    quick_summary: {
      definition: "Systemic small-vessel vasculitis defined by ANCA positivity (c-ANCA/anti-PR3 = GPA; p-ANCA/anti-MPO = MPA) and pauci-immune necrotising GN ± extra-renal manifestations (lungs, sinuses, skin).",
      epidemiology: "Rare in children (<20% of adult incidence); peak adolescence. GPA most common paediatric AAV. Pulmonary-renal syndrome occurs in 10–25% — high mortality risk.",
      pathophysiology: "ANCA (anti-PR3 or anti-MPO) activates primed neutrophils → neutrophil degranulation → endothelial damage → necrotising vasculitis → fibrinoid necrosis → crescentic GN (pauci-immune on biopsy).",
      age_specific: "ENT involvement (sinusitis, epistaxis, saddle-nose deformity) common in adolescent GPA. Pulmonary haemorrhage: rare but life-threatening in young patients.",
      emergency_recognition: [
        "Haemoptysis + haematuria + rapid GFR decline → pulmonary-renal syndrome — life-threatening",
        "Rapidly rising Cr + crescents on biopsy → end-stage kidneys within weeks if untreated",
        "Pulmonary infiltrates + ANCA positive → pulmonary vasculitis"
      ],
      immediate_management: [
        "ANCA serology: c-ANCA/anti-PR3 + p-ANCA/anti-MPO — send URGENTLY",
        "Renal biopsy: pauci-immune necrotising GN + crescents — confirm before full immunosuppression",
        "IV methylprednisolone pulse 10–30 mg/kg × 3 days (severe/pulmonary-renal)",
        "Rituximab 375 mg/m²/dose × 4 weekly doses (preferred over cyclophosphamide in children — RAVE trial equivalent efficacy, less gonadotoxicity)"
      ]
    },
    management: {
      induction: [
        "Rituximab 375 mg/m²/dose IV × 4 weekly doses + high-dose prednisolone (0.5–1 mg/kg/day) — preferred in children",
        "OR cyclophosphamide (Euro-Lupus 500 mg IV q2w × 6, or NIH monthly × 6) if rituximab unavailable or severe renal failure",
        "Plasma exchange (plasmapheresis): pulmonary-renal syndrome; Cr >500 mcmol/L or dialysis-dependent; MEPEX trial supports (now challenged by PEXIVAS — selective use)",
        "IV methylprednisolone pulse if rapidly progressive GN or pulmonary haemorrhage"
      ],
      maintenance: [
        "Rituximab 375 mg/m²/dose IV every 6 months × 2–4 years (CD19 count guided)",
        "OR azathioprine 2 mg/kg/day + low-dose prednisolone if rituximab not available",
        "Target: ANCA negativity + UPCR <50 + stable eGFR",
        "Prednisolone: taper to ≤5 mg/day by 6 months of maintenance"
      ]
    },
    drugs: [
      {
        name: "Rituximab",
        dose: "375 mg/m²/dose IV weekly × 4 (induction); then 375 mg/m²/dose every 6 months (maintenance)",
        max: "1000 mg/dose",
        purpose: "AAV induction and maintenance — B-cell depletion depletes ANCA-producing plasma cells",
        monitoring: "CD19+ B-cells (target <5/mm³); IgG, IgM (hypogammaglobulinaemia risk); ANCA titre; infection markers",
        notes: "Premedicate: paracetamol + chlorpheniramine + IV methylprednisolone. Screen HBV. PCP prophylaxis. Pneumococcal vaccination BEFORE rituximab."
      },
      {
        name: "Cyclophosphamide (Euro-Lupus IV)",
        dose: "500 mg IV q2 weeks × 6 doses",
        max: "500 mg/dose (Euro-Lupus low-dose)",
        purpose: "AAV induction if rituximab unavailable or severe renal failure",
        monitoring: "CBC 2 weeks post; urinalysis (haemorrhagic cystitis); cumulative dose",
        notes: "Mesna uroprotection. Hyperhydration. GnRH agonist for fertility preservation (adolescent females)."
      }
    ],
    monitoring: {
      frequency: "Monthly during induction; 3-monthly maintenance; ANCA titre + Cr + UPCR every visit",
      parameters: [
        "ANCA titre (c-ANCA anti-PR3, p-ANCA anti-MPO)",
        "Serum Cr, eGFR, UPCR",
        "CBC (cyclophosphamide leucopenia; rituximab hypogammaglobulinaemia)",
        "IgG level (rituximab — replace if IgG <4 g/L + recurrent infections)",
        "Pulmonary function tests annually",
        "ENT assessment (sinuses, ears) 6-monthly",
        "BP, urinalysis every visit"
      ],
      follow_up: "Lifelong nephrology + paediatric rheumatology. Fertility counselling post-cyclophosphamide. Transitional care planning from 14y."
    },
    nutrition: [
      "Low Na⁺ diet if hypertensive",
      "Calcium + Vitamin D during steroid therapy",
      "High-protein diet during active vasculitis (catabolism)"
    ],
    vaccination: [
      "Pneumococcal + meningococcal + Hep B BEFORE rituximab",
      "Annual influenza (inactivated only)",
      "MMR/varicella: live vaccines — defer during active immunosuppression",
      "Check immunoglobulin levels on rituximab — if IgG <4 + recurrent infections → IVIG prophylaxis"
    ],
    red_flags: [
      "Haemoptysis in any ANCA patient → pulmonary-renal syndrome — ICU, plasma exchange consideration",
      "Rising ANCA + falling Cr → imminent flare — do NOT wait for symptoms",
      "IgG <4 g/L on rituximab + recurrent infections → IVIG replacement therapy"
    ],
    pearls: [
      "c-ANCA/PR3 = GPA (granulomatosis with polyangiitis = Wegener); p-ANCA/MPO = MPA — histology is pauci-immune in BOTH",
      "Rituximab equivalent to cyclophosphamide for induction (RAVE trial) but less gonadotoxic — preferred in paediatrics",
      "Saddle-nose deformity is a late manifestation of untreated GPA nasal involvement — ENT referral early",
      "ANCA negativity = remission but NOT safe to stop immunosuppression — flare rate 50% within 2y of stopping"
    ]
  }
}
];