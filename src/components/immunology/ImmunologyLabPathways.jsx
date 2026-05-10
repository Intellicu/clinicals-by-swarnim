import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, FlaskConical, AlertTriangle, BookOpen, Link } from "lucide-react";

const IMMUNOLOGY_TESTS = [
  {
    id: "ana",
    name: "ANA (Antinuclear Antibody)",
    category: "Autoimmune Screen",
    what_it_tests: "Detects autoantibodies against nuclear antigens. Screening test for SLE and other systemic autoimmune diseases. Titre and pattern both matter.",
    when_to_order: ["Suspected SLE (malar rash, serositis, arthritis, nephritis)", "Unexplained haematuria + proteinuria", "Multi-system inflammatory disease", "Unexplained thrombocytopenia or haemolytic anaemia"],
    interpretation: ["Positive ≥1:80 (HEp-2 cells): clinically significant", "Titre 1:80–1:160: low positive — often non-specific; interpret with clinical context", "Titre >1:320: high positive — strong association with systemic autoimmune disease", "PATTERN: Homogeneous → dsDNA/histones (SLE); Speckled → ENA (MCTD/Sjögren/SSc); Nucleolar → SSc; Centromere → limited SSc"],
    false_positives: ["5–10% healthy population (low titre ≥1:40)", "Infections (EBV, hepatitis)", "Medications (hydralazine, procainamide → drug-induced lupus)", "Elderly population", "Chronic liver disease"],
    pediatric_caveats: ["ANA positivity increases with age in healthy children — interpret carefully in <5y", "Juvenile dermatomyositis: ANA positive in 30–50% (not diagnostic)", "pSLE: ANA almost universally positive — titre >1:320 supports diagnosis"],
    disease_associations: ["SLE (99% sensitive — not specific)", "Drug-induced lupus", "MCTD", "Sjögren syndrome", "Systemic sclerosis", "Polymyositis/dermatomyositis", "JIA (specific subtypes — oligoarticular ANA+ → uveitis risk)"],
    linked: ["lupus", "ana_panel", "ena_panel"],
    refs: ["ACR/EULAR SLE 2019", "Tan EM 1988 Arthritis Rheum"],
    next_step: "If ANA positive: proceed to anti-dsDNA + ENA panel + complement C3/C4",
  },
  {
    id: "dsdna",
    name: "Anti-dsDNA Antibody",
    category: "SLE Specific",
    what_it_tests: "Antibody against double-stranded DNA. Highly specific for SLE. Titre correlates with disease activity (especially nephritis).",
    when_to_order: ["ANA positive with high titre", "Suspected lupus nephritis (urine PCR + haematuria)", "Monitoring SLE activity — rising titre predicts flare", "Unexplained complement consumption (low C3/C4)"],
    interpretation: ["Positive: >10 IU/mL (varies by laboratory)", "Highly specific for SLE (>95% specificity)", "Rising titre + falling C3/C4 = disease activity / impending nephritis flare", "Can be negative in quiescent SLE or Class V LN"],
    false_positives: ["Hepatitis B, drug-induced lupus (less common than ANA)", "Some Sjögren patients", "Rarely: other connective tissue diseases"],
    pediatric_caveats: ["pSLE: anti-dsDNA often very high at presentation", "Titre correlates with nephritis activity in children", "Titres may fall with treatment — track as biomarker"],
    disease_associations: ["SLE (specific — included in ACR/EULAR classification criteria)", "Lupus nephritis (active nephritis = high titre)"],
    linked: ["lupus", "ana"],
    refs: ["ACR/EULAR SLE 2019", "KDIGO LN 2021"],
    next_step: "If elevated + nephritis: biopsy + ACR/EULAR classification. Monitor q3 months with C3/C4.",
  },
  {
    id: "ena",
    name: "ENA Panel (Extractable Nuclear Antigens)",
    category: "Autoimmune Screen",
    what_it_tests: "Panel of antibodies against specific nuclear proteins: anti-Sm, anti-Ro(SSA), anti-La(SSB), anti-Scl70, anti-Jo1, anti-RNP, anti-centromere.",
    when_to_order: ["ANA positive — to characterise specificity", "Suspected MCTD, Sjögren, SSc, myositis", "SLE workup (Sm highly specific)", "Neonatal lupus suspected (Ro/La)"],
    interpretation: {
      "Anti-Sm": "Highly specific for SLE (30% sensitive); ACR/EULAR criterion",
      "Anti-Ro (SSA)": "Sjögren syndrome (70%) + subacute cutaneous lupus + neonatal lupus (fetal heart block risk)",
      "Anti-La (SSB)": "Sjögren syndrome (partner antibody to Ro); neonatal lupus",
      "Anti-RNP": "MCTD (>95% — diagnostic hallmark); also SLE",
      "Anti-Scl70 (topoisomerase I)": "Diffuse cutaneous SSc (30–40%) — ILD risk",
      "Anti-centromere": "Limited SSc (CREST) — pulmonary hypertension risk",
      "Anti-Jo1": "Anti-synthetase syndrome: myositis + ILD + arthritis + mechanic's hands",
    },
    false_positives: ["Anti-Ro: some healthy adults (especially elderly women); hepatitis"],
    pediatric_caveats: ["Neonatal lupus: maternal Ro/La → neonatal complete heart block (fetal monitoring)", "pSSc in children: anti-Scl70 more common than in adults"],
    disease_associations: ["SLE, Sjögren, MCTD, SSc, Myositis"],
    linked: ["lupus", "ana"],
    refs: ["ACR/EULAR SLE 2019", "EULAR Sjögren 2020"],
    next_step: "Interpret in context with ANA titre + clinical picture.",
  },
  {
    id: "anca",
    name: "ANCA (Anti-Neutrophil Cytoplasmic Antibody)",
    category: "Vasculitis",
    what_it_tests: "Antibody against cytoplasmic antigens of neutrophils. PR3-ANCA (c-ANCA pattern) and MPO-ANCA (p-ANCA pattern). Diagnostic for AAV.",
    when_to_order: ["Rapidly progressive GN (haematuria + rising creatinine)", "Pulmonary-renal syndrome", "Unexplained glomerulonephritis", "Pauci-immune crescentic GN on biopsy", "Sinusitis + renal disease (GPA)"],
    interpretation: ["PR3-ANCA (c-ANCA): GPA (Wegener's) — 90% sensitive; active disease", "MPO-ANCA (p-ANCA): MPA — 70–80% sensitive", "Titre correlates with disease activity in some patients", "Dual test: ANCA IIF + ELISA (both needed for maximum sensitivity/specificity)"],
    false_positives: ["Cocaine use (levamisole-contaminated → p-ANCA positive)", "IBD, RA, infection (low titre p-ANCA)", "SBE, hepatitis C"],
    pediatric_caveats: ["ANCA vasculitis rare in children but when present — same management as adults", "Paediatric AAV: MPA > GPA in children under 10", "PR3-ANCA in child with RPGN → aggressive early treatment"],
    disease_associations: ["GPA (Wegener's — PR3-ANCA)", "MPA (MPO-ANCA)", "Eosinophilic GPA (Churg-Strauss — MPO-ANCA)", "Pauci-immune crescentic GN"],
    linked: ["anca", "antigbm"],
    refs: ["ACR/EULAR AAV 2022", "KDIGO 2021 GD"],
    next_step: "ANCA positive + RPGN → same-day renal biopsy + start treatment empirically. Check anti-GBM simultaneously.",
  },
  {
    id: "anti_gbm",
    name: "Anti-GBM Antibody (Goodpasture Antibody)",
    category: "Vasculitis / RPGN",
    what_it_tests: "Antibody against NC1 domain of alpha-3 chain of type IV collagen (COL4A3) in GBM. Pathogenic — causes rapidly progressive GN ± pulmonary haemorrhage.",
    when_to_order: ["RPGN with haematuria + rising creatinine", "Pulmonary haemorrhage (Goodpasture syndrome)", "Linear IgG on renal biopsy", "Simultaneous ANCA testing (dual positive ~30%)"],
    interpretation: ["Positive: >20 U/mL (varies by assay)", "Titre correlates with severity and treatment response", "Falling titre = treatment response (goal: undetectable)", "High titre + oliguria at presentation = poor renal prognosis"],
    false_positives: ["Rarely false positive — highly specific when confirmed by ELISA"],
    pediatric_caveats: ["Very rare in children but documented", "Presentation often dramatic with both renal + pulmonary involvement"],
    disease_associations: ["Anti-GBM disease (Goodpasture syndrome)", "Can coexist with ANCA (dual positive — different prognosis)"],
    linked: ["antigbm", "anca"],
    refs: ["KDIGO 2021 GD"],
    next_step: "EMERGENCY — start plasma exchange same day. Do NOT wait for titre result if clinical suspicion high.",
  },
  {
    id: "apla",
    name: "Antiphospholipid Antibodies (aPL)",
    category: "Thrombotic / Autoimmune",
    what_it_tests: "Panel: lupus anticoagulant (LAC), anti-cardiolipin (aCL IgG/IgM), anti-β2-glycoprotein-I (aβ2GPI IgG/IgM). Thrombogenic antibodies — APS diagnosis requires clinical + lab criteria.",
    when_to_order: ["Unexplained arterial/venous thrombosis in young person", "Recurrent pregnancy loss (obstetric APS)", "SLE with thrombocytopenia or livedo reticularis", "Unexplained stroke in child/adolescent", "Prolonged APTT not correcting with mixing study"],
    interpretation: ["LAC: most thrombogenic; interferes with phospholipid-dependent clotting in vitro → prolonged APTT", "aCL IgG >40 GPL or IgM >40 MPL: significant positive", "aβ2GPI IgG >99th percentile: significant positive", "Triple positive (LAC + aCL + aβ2GPI): highest thrombotic risk"],
    false_positives: ["Infection (syphilis — classic BFP VDRL + aCL)", "Medications", "Transient — must confirm positivity at 12 weeks"],
    pediatric_caveats: ["Paediatric APS: less common but arterial stroke commonest presentation (vs DVT in adults)", "Must confirm positive test at 12 weeks (transient aPL common in children post-infection)", "Catastrophic APS: rare but life-threatening — multi-organ thrombosis"],
    disease_associations: ["Primary APS", "SLE-associated APS", "Drug-induced APS"],
    linked: ["lupus", "thrombosis"],
    refs: ["ISTH APS Criteria 2023", "ACR/EULAR APS 2023"],
    next_step: "Positive aPL → confirm at 12 weeks. APS diagnosis: positive lab + thrombosis/obstetric morbidity. Anticoagulation discussion.",
  },
  {
    id: "rf_ccp",
    name: "Rheumatoid Factor (RF) + Anti-CCP",
    category: "Arthritis",
    what_it_tests: "RF: IgM antibody against Fc portion of IgG. Anti-CCP: antibody against citrullinated proteins. Both associated with RA; anti-CCP more specific.",
    when_to_order: ["Suspected RA or juvenile idiopathic arthritis (RF+ JIA)", "Polyarthritis workup", "Sjögren syndrome (RF commonly positive)", "Unexplained hypergammaglobulinaemia"],
    interpretation: ["RF positive >20 IU/mL: significant", "Anti-CCP: 95% specific for RA (more specific than RF)", "Anti-CCP negative RA exists (seronegative RA)", "Both positive: more aggressive disease + joint damage risk"],
    false_positives: ["RF: Sjögren, infections (HCV, SBE), hypergammaglobulinaemia, elderly", "Anti-CCP: very few false positives (high specificity)"],
    pediatric_caveats: ["RF+ JIA: 5–10% of JIA; more like adult RA; aggressive course", "Anti-CCP in children: positive in RF+ JIA; helps predict erosive disease"],
    disease_associations: ["RA", "RF+ polyarticular JIA", "Sjögren syndrome", "Felty syndrome"],
    linked: [],
    refs: ["ACR/EULAR RA 2010 Classification"],
    next_step: "Anti-CCP positive + symmetric synovitis → RA pathway. Refer rheumatology.",
  },
  {
    id: "complement",
    name: "Complement: C3, C4, CH50, AH50",
    category: "Complement / Nephrology",
    what_it_tests: "C3/C4: individual complement proteins. CH50: classical pathway haemolytic activity (screening test). AH50: alternative pathway. Low levels = activation or deficiency.",
    when_to_order: ["SLE workup + monitoring (C3/C4 track disease activity)", "MPGN / C3GN (complement-mediated GN)", "PSGN (low C3, normal C4)", "aHUS workup (complement-mediated TMA)", "Recurrent infections (complement deficiency screening)"],
    interpretation: {
      "Low C3 + Low C4": "Classical pathway activation: SLE, immune complex disease",
      "Low C3 + Normal C4": "Alternative pathway activation: PSGN, C3GN, DDD, aHUS",
      "Normal C3/C4 + Low CH50": "Classical pathway component deficiency (C1q, C2, C4 — screen for complement deficiency + SLE risk)",
      "Low AH50 only": "Alternative pathway component deficiency (Factor D, properdin)",
      "All normal": "Complement deficiency unlikely; complement not activated",
    },
    false_positives: ["C3/C4 are acute phase reactants — may be normal despite activation in acute infection (elevated baseline masks consumption)"],
    pediatric_caveats: ["PSGN: C3 low, C4 normal — returns to normal 6–8 weeks (if still low → biopsy)", "C3GN: persistently low C3 (chronic alternative pathway activation)", "SLE: C3/C4 low + anti-dsDNA high = active nephritis"],
    disease_associations: ["SLE (C3/C4 monitor)", "PSGN (C3 low)", "C3GN/DDD (C3 chronically low)", "aHUS (complement pathway dysfunction)", "Recurrent infections (complement deficiency)"],
    linked: ["lupus", "c3gn", "aahu", "psgn"],
    refs: ["KDIGO 2021 GD", "KDIGO LN 2021"],
    next_step: "Low C3 + normal C4 + haematuria → C3GN/MPGN/aHUS pathway. Low C3+C4 → SLE pathway.",
  },
  {
    id: "factor_h_i",
    name: "Complement Factor H / Factor I / CFH Antibodies",
    category: "Complement",
    what_it_tests: "Factor H (CFH): major regulator of alternative complement pathway on cell surfaces. Factor I (CFI): serine protease that cleaves C3b. Anti-CFH antibodies: pathogenic autoantibodies (especially CFHR1 deletion).",
    when_to_order: ["aHUS workup (mandatory)", "C3GN / DDD (complement-mediated)", "Unexplained low C3 + haematuria", "Recurrent TMA"],
    interpretation: ["Factor H <70% or low: CFH deficiency or consumption", "Factor I low: CFI deficiency (rare)", "Anti-CFH IgG positive: autoimmune aHUS (CFHR1 deletion — responds to plasma exchange + rituximab)", "Genetic panel: CFH, CFI, CD46 variants — guides eculizumab duration"],
    false_positives: ["Low levels can be from consumption (active TMA) vs genetic deficiency — genetic testing distinguishes"],
    pediatric_caveats: ["Anti-CFH aHUS: peak incidence 5–15 years; CFHR1-5 deletion", "Genetic testing in all children with aHUS — guides lifelong vs time-limited eculizumab"],
    disease_associations: ["aHUS (complement-mediated)", "C3GN / DDD", "MPGN"],
    linked: ["aahu", "c3gn"],
    refs: ["KDIGO 2021 GD", "International aHUS Registry"],
    next_step: "Anti-CFH positive + aHUS → plasma exchange + eculizumab. Test CFHR1-5 deletion.",
  },
  {
    id: "ige_eosinophil",
    name: "IgE + Eosinophil Panel",
    category: "Allergy / Immunology",
    what_it_tests: "Total IgE: allergic disease screen. Specific IgE (RAST/ImmunoCAP): allergen-specific sensitisation. Eosinophil count: allergy, parasites, EGPA, drug reactions.",
    when_to_order: ["Suspected allergic disease (urticaria, angioedema, asthma, food allergy)", "Nephrotic syndrome workup (allergic trigger in MCD)", "Eosinophilia on CBC (>0.5×10⁹/L)", "Drug allergy workup (AIN, drug-induced nephritis)", "Suspected EGPA (Churg-Strauss)"],
    interpretation: ["Total IgE >100 kU/L: significant elevation; consider allergy", "Total IgE >1000 kU/L: Hyper-IgE syndrome (STAT3 LOF, DOCK8) or severe atopy", "Specific IgE: Class 0 = <0.35 kU/L (negative); Class 3+ = >3.5 kU/L (significant sensitisation)", "Eosinophilia: mild 0.5–1.5; moderate 1.5–5; severe >5 (hypereosinophilic syndrome, EGPA, parasites)"],
    false_positives: ["Parasitic infections → very high IgE + eosinophilia (not allergy)"],
    pediatric_caveats: ["Total IgE low in young infants — use age-adjusted normal ranges", "MCD trigger: some food allergens/infections trigger MCD relapse — high IgE noted", "EGPA: very rare in children but eosinophilia + asthma + ANCA (p-ANCA) — consider"],
    disease_associations: ["Allergic diseases", "Atopic dermatitis", "MCD (allergic trigger)", "EGPA (Churg-Strauss)", "Drug-induced AIN", "Parasitic infections"],
    linked: ["mcd"],
    refs: ["AAAAI Practice Parameters 2020"],
    next_step: "IgE >1000 + recurrent infections + eczema → Hyper-IgE syndrome screen (STAT3, DOCK8).",
  },
  {
    id: "immunoglobulins",
    name: "Immunoglobulin Panels (IgG, IgA, IgM, IgE subclasses)",
    category: "Immunodeficiency",
    what_it_tests: "Quantitative immunoglobulin levels. Low levels = immunodeficiency (CVID, XLA, rituximab effect). Elevated levels = infection, autoimmunity, malignancy (IgG4 disease, Waldenström's).",
    when_to_order: ["Recurrent sinopulmonary infections", "Post-rituximab monitoring (hypogammaglobulinaemia)", "Suspected CVID or XLA", "IgG4-RKD (IgG4 subclass)", "Nephrotic syndrome (protein losses lower IgG)", "Myeloma/lymphoma workup"],
    interpretation: ["Low IgG (<600): CVID, XLA, rituximab, nephrotic syndrome protein loss", "Low all: combined immunodeficiency, severe malnutrition", "High IgG4 (>135 mg/dL): IgG4-related disease (not diagnostic alone — 30% sensitivity)", "IgA deficiency (<70 mg/dL): most common PID — recurrent respiratory + GI infections; risk of anaphylaxis with blood products"],
    false_positives: ["IgG4 elevated in: pancreatic cancer, cholangiocarcinoma, allergy, parasites — NOT diagnostic of IgG4-RD alone"],
    pediatric_caveats: ["Physiological nadir 3–6 months (maternal IgG waning) — not CVID", "Age-adjusted ranges essential", "NS: IgG lost in urine (low IgG increases infection risk)"],
    disease_associations: ["CVID, XLA (low IgG)", "IgG4-RKD (high IgG4)", "Rituximab hypogammaglobulinaemia", "Nephrotic syndrome (IgG depletion)"],
    linked: ["igg4_related", "rituximab"],
    refs: ["ESID Registry CVID Criteria 2019"],
    next_step: "IgG <400 + recurrent infections → CVID workup (B-cell function, vaccine responses). IVIG if IgG <4 g/L.",
  },
  {
    id: "lymphocyte_subsets",
    name: "Lymphocyte Subsets (CD4, CD8, CD19, NK)",
    category: "Immunodeficiency",
    what_it_tests: "Flow cytometry quantification of T-cell, B-cell, NK cell populations. Evaluates cellular immunodeficiency, B-cell depletion post-rituximab, viral lymphopaenia, drug effect.",
    when_to_order: ["Post-rituximab B-cell monitoring (CD19/CD20)", "Suspected T-cell immunodeficiency", "HIV monitoring (CD4 count)", "SCID workup (absent T+B+NK)", "Drug-induced lymphopaenia monitoring"],
    interpretation: ["CD19/CD20 B-cells: depleted <5 cells/μL after rituximab (confirm depletion)", "CD4 count: <200 = severe immunodeficiency (AIDS-defining)", "CD4:CD8 ratio: inverted (<1) in HIV, CMV, drug effect", "NK cells absent: NK cell deficiency (recurrent herpesvirus)"],
    false_positives: ["Steroid use reduces lymphocyte counts (not true deficiency)"],
    pediatric_caveats: ["Age-adjusted ranges critical — infants have high CD4/lymphocyte counts normally", "SCID: absent T+B+NK at birth — screen in NBS programs"],
    disease_associations: ["SCID", "HIV", "Rituximab monitoring", "Chronic mucocutaneous candidiasis"],
    linked: ["rituximab"],
    refs: ["ESID 2019", "WHO 2007 Primary Immunodeficiencies"],
    next_step: "Absent T+B+NK in neonate → SCID — emergency HSCT referral.",
  },
];

const CATEGORY_COLORS = {
  "Autoimmune Screen": "bg-purple-100 text-purple-800",
  "SLE Specific": "bg-indigo-100 text-indigo-800",
  "Vasculitis": "bg-red-100 text-red-800",
  "Vasculitis / RPGN": "bg-rose-100 text-rose-800",
  "Thrombotic / Autoimmune": "bg-pink-100 text-pink-800",
  "Arthritis": "bg-orange-100 text-orange-800",
  "Complement / Nephrology": "bg-blue-100 text-blue-800",
  "Complement": "bg-sky-100 text-sky-800",
  "Allergy / Immunology": "bg-amber-100 text-amber-800",
  "Immunodeficiency": "bg-teal-100 text-teal-800",
};

const IMM_TABS = [
  { id: "what", label: "🔬 What it tests" },
  { id: "when", label: "📋 When to order" },
  { id: "interpret", label: "📊 Interpretation" },
  { id: "caveats", label: "👶 Caveats" },
  { id: "links", label: "🔗 Links" },
];

function ImmunoTestCard({ test }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("what");

  return (
    <Card className="bg-white border-2 border-purple-100 hover:border-purple-300 transition-colors">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-bold text-sm text-slate-900">{test.name}</span>
              <Badge className={`text-xs border-0 ${CATEGORY_COLORS[test.category] || "bg-slate-100 text-slate-700"}`}>{test.category}</Badge>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">{test.what_it_tests?.slice(0, 80)}...</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-3">
          <div className="flex gap-1 flex-wrap border-b pb-2">
            {IMM_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${tab === t.id ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "what" && (
            <div className="space-y-2">
              <p className="text-xs text-slate-700 bg-purple-50 border border-purple-200 rounded p-2">{test.what_it_tests}</p>
              {test.next_step && (
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <p className="text-xs font-bold text-green-800 mb-0.5">Next Step</p>
                  <p className="text-xs text-green-900">{test.next_step}</p>
                </div>
              )}
            </div>
          )}

          {tab === "when" && (
            <div className="space-y-1.5">
              {test.when_to_order?.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 bg-blue-50 border border-blue-100 rounded">
                  <span className="font-bold text-blue-600 flex-shrink-0">{i + 1}.</span>{w}
                </div>
              ))}
            </div>
          )}

          {tab === "interpret" && (
            <div className="space-y-1.5">
              {typeof test.interpretation === "object" && !Array.isArray(test.interpretation) ? (
                Object.entries(test.interpretation).map(([k, v]) => (
                  <div key={k} className="text-xs p-2 bg-indigo-50 border border-indigo-100 rounded">
                    <span className="font-bold text-indigo-800">{k}: </span>
                    <span className="text-indigo-900">{v}</span>
                  </div>
                ))
              ) : (
                test.interpretation?.map((interp, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs p-2 bg-indigo-50 border border-indigo-100 rounded">
                    <span className="font-bold text-indigo-600 flex-shrink-0">{i + 1}.</span>{interp}
                  </div>
                ))
              )}
              <div className="bg-amber-50 border border-amber-200 rounded p-2">
                <p className="text-xs font-bold text-amber-800 mb-1">⚠️ False Positives</p>
                {Array.isArray(test.false_positives) ? test.false_positives.map((f, i) => (
                  <p key={i} className="text-xs text-amber-900">• {f}</p>
                )) : <p className="text-xs text-amber-900">{test.false_positives}</p>}
              </div>
            </div>
          )}

          {tab === "caveats" && (
            <div className="space-y-2">
              <div className="bg-cyan-50 border border-cyan-200 rounded p-2">
                <p className="text-xs font-bold text-cyan-800 mb-1">👶 Pediatric Caveats</p>
                {test.pediatric_caveats?.map((c, i) => <p key={i} className="text-xs text-cyan-900">• {c}</p>)}
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded p-2">
                <p className="text-xs font-bold text-slate-700 mb-1">Disease Associations</p>
                <div className="flex flex-wrap gap-1">
                  {test.disease_associations?.map(d => (
                    <Badge key={d} className="text-xs bg-slate-200 text-slate-700 border-0">{d}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "links" && (
            <div className="space-y-2">
              {test.linked?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold self-center">Linked pathways:</span>
                  {test.linked.map(l => (
                    <Badge key={l} variant="outline" className="text-xs text-blue-600 cursor-pointer hover:bg-blue-50">{l.toUpperCase()}</Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400">📚 {test.refs?.join(" · ")}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

const ALL_CATEGORIES = ["All", "Autoimmune Screen", "SLE Specific", "Vasculitis", "Complement / Nephrology", "Complement", "Allergy / Immunology", "Immunodeficiency", "Arthritis", "Thrombotic / Autoimmune"];

export default function ImmunologyLabPathways() {
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = IMMUNOLOGY_TESTS.filter(t => {
    const matchCat = catFilter === "All" || t.category === catFilter;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.what_it_tests.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-3">
      <Alert className="bg-purple-50 border-purple-200">
        <FlaskConical className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-xs text-purple-900">
          <strong>Immunology Lab Pathways:</strong> {IMMUNOLOGY_TESTS.length} immunological tests — what to order, interpretation, false positives, pediatric caveats, cross-links to disease pathways.
        </AlertDescription>
      </Alert>

      <div className="relative">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests (ANA, ANCA, complement...)..."
          className="w-full text-xs border-2 rounded-xl px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-purple-400" />
        <FlaskConical className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-400" />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {ALL_CATEGORIES.slice(0, 6).map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`text-xs px-2.5 py-1.5 rounded-full border font-semibold transition-all ${catFilter === c ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-600 border-slate-200 hover:border-purple-300"}`}>
            {c}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400">{filtered.length} tests</p>
      {filtered.map(t => <ImmunoTestCard key={t.id} test={t} />)}
    </div>
  );
}