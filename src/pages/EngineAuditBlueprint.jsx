/**
 * Nephrology Engine Audit & Rebuild Blueprint
 * Comprehensive audit of all clinical decision engines with rebuild specifications.
 * LEILA-style architecture requirements for each engine.
 */
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ChevronDown, CheckCircle2, AlertTriangle, XCircle, Wrench, Zap, Brain, Activity, FlaskConical } from "lucide-react";

// ── Audit Data ─────────────────────────────────────────────────────────────────

const ENGINES = [
  // ─── FULLY LEILA-COMPLIANT ────────────────────────────────────────────────
  {
    id: "aki",
    name: "AKI Diagnostic Engine",
    file: "components/engines/AKIEngine.jsx",
    status: "LEILA_COMPLIANT",
    category: "Nephrology",
    priority: 1,
    summary: "Full LEILA implementation: Cr/UO input → KDIGO/pRIFLE staging → Pre/Intrinsic/Post-renal branching → Sub-type differential (GN, ATN, TMA, AIN, Rhabdo) → Investigation panels → Treatment protocols → Monitoring plans → RRT decision.",
    strengths: [
      "Quantitative staging: KDIGO + pRIFLE computed from entered Cr/UO",
      "3-category branching with explicit clinical reasoning cues",
      "Emergency RRT (AEIOU) criteria embedded at step 0",
      "5 intrinsic sub-categories with differentials + evidence-based treatment",
      "PathwayTrail visible reasoning chain throughout",
    ],
    gaps: [
      "TMA branch exits to HUS engine but does not embed TMADecisionEngine inline — minor cross-link gap",
      "No paediatric AKI-specific cause weighting for neonatal AKI (aminoglycosides, asphyxia, congenital)",
      "Missing: neonatal AKI branch (SCr reference range differs; non-oliguric AKI common)",
    ],
    rebuild_needed: false,
    rebuild_blueprint: null,
  },
  {
    id: "ns",
    name: "Nephrotic Syndrome Engine",
    file: "components/engines/NephroticSyndromeEngine.jsx",
    status: "LEILA_COMPLIANT",
    category: "Nephrology",
    priority: 1,
    summary: "Full LEILA: Diagnostic criteria check → Age-at-onset branching → Atypical screening → Episode type → FRNS/SDNS/SRNS/Congenital branches → IS decision algorithms → Genetic workup triggers → Biopsy indications → Monitoring protocols.",
    strengths: [
      "Congenital NS branch with genetic differentials + Wilms risk logic",
      "Atypical feature screening with hard branching (any ONE = biopsy required)",
      "4 relapse patterns with distinct IS protocols",
      "ReasoningPanel explains WHY at SRNS branch",
      "IPNA 2021 + PRISM trial evidence embedded",
    ],
    gaps: [
      "SRNS: missing INF2/TRPC6 mutations in the genetic panel list (now added to IPNA 2022 update)",
      "No 'Minimal Change Disease vs FSGS differentiation' reasoning at first biopsy",
      "Missing: SSNS in adolescent differentiation (FSGS more common > 12yr)",
    ],
    rebuild_needed: false,
    rebuild_blueprint: null,
  },
  {
    id: "hyperkalemia",
    name: "Hyperkalemia Emergency Engine",
    file: "components/engines/HyperkalemiaEngine.jsx",
    status: "LEILA_COMPLIANT",
    category: "Electrolytes",
    priority: 1,
    summary: "Full LEILA: K+ value → CRITICAL/SEVERE/MODERATE grading → ECG assessment → Cause identification → Weight-based dose calculator → 3-step protocol (Stabilise/Shift/Remove) → Dialysis decision logic → Monitoring.",
    strengths: [
      "Real-time K+ severity grading with colour-coded urgency",
      "Cardiac arrest branch with CPR-concurrent treatment",
      "Live weight-based dose calculator for all emergency drugs",
      "Cause-specific treatment modifications (acidosis → bicarb; TLS → rasburicase; adrenal → fludrocortisone)",
      "Pseudohyperkalaemia exclusion prominently displayed",
    ],
    gaps: [
      "Gordon syndrome / pseudohypoaldosteronism type II not triggered early enough for recurrent cases",
      "No paediatric-specific RTA type IV recognition (most common cause of mild chronic hyperkalaemia)",
    ],
    rebuild_needed: false,
    rebuild_blueprint: null,
  },
  {
    id: "hyponatremia",
    name: "Hyponatremia Engine",
    file: "components/engines/HyponatremiaEngine.jsx",
    status: "LEILA_COMPLIANT",
    category: "Electrolytes",
    priority: 1,
    summary: "Full LEILA: Na input → Translocational correction → Symptom severity → Emergency 3%NaCl protocol → Osmolality branching → Volume status → Urine Na/Osm → SIADH/CSW/Adrenal/Thyroid diagnosis.",
    strengths: [
      "Translocational correction formula (Katz) with real-time output",
      "Immediate symptomatic branch with ODS risk warnings",
      "Isotonic (pseudohyponatremia) + Hypertonic branches",
      "SIADH diagnostic criteria explicitly listed with exclusion logic",
      "CSW vs SIADH differentiation via volume status reasoning",
    ],
    gaps: [
      "AVPR2 gain-of-function (Nephrogenic SIADH) not branched — this is a rare but critical tubular cause",
      "Hyponatremia in CKD (common in paediatric nephrology) lacks dedicated branch",
      "CSW treatment (fludrocortisone) needs more detail",
    ],
    rebuild_needed: false,
    rebuild_blueprint: null,
  },
  // ─── NEEDS REBUILD — HIGH PRIORITY ──────────────────────────────────────
  {
    id: "hus_tma",
    name: "HUS / TMA Pathway",
    file: "components/pathways/HUSPathway.jsx",
    status: "NEEDS_REBUILD",
    category: "Nephrology",
    priority: 1,
    summary: "Currently a static tabbed page (4 tabs: TMA Engine, STEC-HUS Protocol, aHUS+PLEX, Eculizumab). Embeds TMADecisionEngine from DecisionEngines (which may have some branching), but the outer shell is non-interactive and clinical reasoning is linear.",
    strengths: [
      "DO NOT list: critical safety instructions for STEC-HUS are correct",
      "aHUS complement panel and anti-CFH Ab protocol is detailed",
      "Eculizumab engine exists (EculizumabEngine from DecisionEngines)",
      "India-specific guidance (AIIMS/Medgenome testing references)",
    ],
    gaps: [
      "NO entry branching: no question 'Does patient have TMA triad?' as first gate",
      "ADAMTS13 result does not branch to TTP-specific PEX protocol",
      "Stool Shiga-toxin result does not gate eculizumab use with hard stop",
      "No differential for TMA mimics: DIC, TTP, aHUS, drug-induced TMA, HELLP, HSCT-TMA",
      "No investigation recommendation sequencing (ADAMTS13 BEFORE any PEX is critical but not enforced)",
      "No management timeline with urgency flags",
      "Missing: secondary aHUS causes workup (SLE, cobalamin C defect, DGKE mutation — all present in paediatric aHUS)",
    ],
    rebuild_needed: true,
    rebuild_blueprint: {
      architecture: "LEILA-style branching decision engine",
      entry_point: "TMA Suspected: MAHA + Thrombocytopenia + AKI/organ injury",
      step_1: {
        question: "Is TMA triad complete?",
        branches: [
          "MAHA confirmed (peripheral smear: schistocytes ≥2%): Yes → proceed",
          "Platelets <150,000/µL: Yes → proceed",
          "Organ injury (AKI / neurological / cardiac): Yes → proceed",
          "Incomplete triad → exit with differential (DIC vs TTP vs MAHA alone)",
        ],
      },
      step_2: {
        question: "ADAMTS13 activity result",
        branches: [
          "<10% → TTP pathway: IMMEDIATE PEX + rituximab, stop eculizumab consideration",
          "≥10% → Continue to STEC/aHUS discrimination",
        ],
        critical_instruction: "SEND ADAMTS13 BEFORE any PEX — PEX will falsely normalise ADAMTS13",
      },
      step_3: {
        question: "Stool Shiga-toxin / diarrhoeal prodrome",
        branches: [
          "Stx PCR/ELISA POSITIVE + diarrhoeal prodrome → STEC-HUS protocol (NO antibiotics, NO eculizumab routine)",
          "Stx NEGATIVE + non-diarrhoeal → aHUS algorithm",
          "Stx result pending → supportive care only; hold eculizumab until result",
        ],
      },
      step_4: {
        question: "aHUS — Secondary causes exclusion",
        branches: [
          "SLE (ANA/anti-dsDNA elevated) → SLE-TMA protocol",
          "Cobalamin C defect (methylmalonic aciduria + homocystinuria) → screen in young infants",
          "Drug-induced (calcineurin inhibitors, sirolimus, gemcitabine) → drug withdrawal first",
          "HSCT-associated TMA → specialist protocol",
          "Primary aHUS (complement mediated) → eculizumab decision",
        ],
      },
      step_5: {
        title: "aHUS — Eculizumab Decision",
        logic: [
          "Confirm: Stx negative + ADAMTS13 >10% + no secondary cause",
          "Complement panel: C3 low, AH50 low, CFH level + anti-CFH antibody",
          "Meningococcal vaccination status → prophylactic penicillin V if not vaccinated",
          "Eculizumab dosing by weight (Alexion table)",
          "Duration: acute phase × 6 months, then reassess with complement genetics",
        ],
      },
      investigations: {
        must: [
          "Peripheral blood smear + schistocyte count STAT",
          "ADAMTS13 activity + inhibitor assay (citrate plasma, FROZEN, before PEX)",
          "Stool PCR stx1/stx2 + Shiga-toxin ELISA + E. coli O157:H7 culture",
          "Complement: C3, C4, CH50, AH50, CFH level, anti-CFH antibody",
          "LDH, haptoglobin, reticulocyte count (MAHA markers)",
          "Urinalysis + creatinine + eGFR",
        ],
        should: [
          "Anti-CFH antibody titre quantitative (ELISA)",
          "Genetic panel: CFH, CFI, MCP/CD46, C3, CFB, THBD, CFHR1/3 — sent simultaneously",
          "ANA/anti-dsDNA (secondary SLE-TMA exclusion)",
          "Plasma amino acids + urine organic acids (Cobalamin C if infant)",
          "Drug history: tacrolimus, sirolimus, anti-VEGF, gemcitabine",
        ],
      },
      monitoring: [
        "Daily: CBC, reticulocytes, LDH, haptoglobin, Cr, K+, fluid balance",
        "Weekly: complement panel (C3, CH50, AH50) during eculizumab",
        "Anti-CFH Ab titres: pre-treatment, weekly × 4, then monthly",
        "Renal function: eGFR monthly for 6 months, then 3-monthly × 2 years",
        "Post-eculizumab: complement genetics to guide duration",
      ],
      guidelines: "KDIGO 2022 GN Chapter · Legendre C, NEJM 2013 (eculizumab aHUS) · Loirat C KI Supplements 2016 · ECUSTEC trial 2019 · Indian ISPN aHUS Registry",
    },
  },
  {
    id: "ndi_tubular",
    name: "Tubular Disorder Engine (NDI, Fanconi, Dent)",
    file: "components/engines/TubularDisorderEngine.jsx",
    status: "NEEDS_REBUILD",
    category: "Tubular",
    priority: 1,
    summary: "Currently a 3-section static menu (Fanconi, Hypophosphatemic Rickets, NDI/SIADH). Each section is a static card list with no branching, no differential generation, no investigation sequencing, no severity grading.",
    strengths: [
      "Fanconi syndrome: cause algorithm lists cystinosis, Lowe, Dent, mitochondrial, galactosaemia",
      "XLH treatment: burosumab correctly identified as first-line",
      "NDI vs SIADH vs Central DI differentiation table present",
    ],
    gaps: [
      "NO clinical entry point — no question 'Child with polyuria: what next?'",
      "NDI section conflates nephrogenic SIADH (gain-of-function AVPR2) with NDI (loss-of-function) — mechanistically opposite",
      "Dent disease not given its own branch — only mentioned in Fanconi section",
      "No water deprivation test protocol with interpretation logic",
      "No urinary biomarker investigation panel (low-MW proteinuria MUST precede genetic testing in Dent)",
      "Bartter vs Gitelman no branching — these are missed in Fanconi sub-section",
      "No monitoring plan for any tubular condition",
    ],
    rebuild_needed: true,
    rebuild_blueprint: {
      architecture: "3-branch entry → nested LEILA engines",
      entry_point: "Select presenting syndrome: Polyuria / Rickets / Tubulopathy panel",
      branch_A: {
        name: "NDI Engine — Nephrogenic Diabetes Insipidus",
        steps: [
          "Entry: Polyuria + hypernatraemia + dilute urine (Osm <300 mOsm/kg)",
          "Step 1: Is it DI or primary polydipsia? → water deprivation test protocol with expected Osm changes",
          "Step 2: DDAVP test → urine Osm increase <50% = Nephrogenic DI (vs >50% = Central DI)",
          "Step 3: Is it X-linked or autosomal? → AVPR2 (males, severe) vs AQP2 (both, milder)",
          "Step 4: Age-appropriate — congenital vs acquired (lithium, cisplatin, hypercalcaemia, hypokalemia)",
          "Differential: Central DI / Primary polydipsia / Nephrogenic SIADH (gain-of-function AVPR2)",
          "Investigations: Paired serum/urine osmolality, plasma AVP or copeptin, AVPR2/AQP2 sequencing",
          "Management: Low-solute diet + HCTZ 1–2 mg/kg/day + amiloride 0.3 mg/kg/day ± indomethacin",
          "Monitoring: Serum Na, urine Osm, growth velocity, renal USG (dilated collecting system)",
        ],
      },
      branch_B: {
        name: "Dent Disease Engine",
        steps: [
          "Entry: Male child + low-MW proteinuria (beta-2 microglobulin / alpha-1 microglobulin) + hypercalciuria",
          "Step 1: Low-MW proteinuria confirmed? (urine protein electrophoresis) → Tubular protein pattern?",
          "Step 2: Is there nephrocalcinosis or nephrolithiasis on USG?",
          "Step 3: Other Fanconi features? (glucosuria, aminoaciduria, phosphaturia) → Dent-1 vs Dent-2",
          "Dent-1: CLCN5 (X-linked) — Chloride channel CLC-5 → endosomal acidification defect",
          "Dent-2: OCRL1 (X-linked) — overlaps with Lowe syndrome; may have mild intellectual features",
          "Differential: Lowe syndrome (full Fanconi + eyes + intellect), cystinosis (corneal crystals), XLH",
          "Investigations: Urine beta-2 microglobulin, UPCR, Ca/Cr ratio, TRP, 24h Ca, renal USG, CLCN5/OCRL1 sequencing",
          "Management: High fluid intake + thiazide (reduce calciuria) + citrate. NO curative treatment. ACEi/ARB if proteinuria.",
          "Monitoring: eGFR every 6 months, Ca/Cr, urine protein, renal USG for stones/nephrocalcinosis",
          "Prognosis: 30–80% reach ESKD by age 30–50. Plan transplant discussion early.",
        ],
      },
      branch_C: {
        name: "Generalised Tubular (Fanconi) Engine — Cause Identification",
        steps: [
          "Entry: Confirm full Fanconi pattern (glucosuria + aminoaciduria + phosphaturia + bicarbonaturia)",
          "Step 1: Age at onset?",
          "  < 2 years: Cystinosis (most common), galactosaemia (neonatal), tyrosinaemia type 1",
          "  > 2 years: Cystinosis, Lowe, Dent, mitochondrial, drugs (tenofovir, ifosfamide)",
          "Step 2: Extrarenal features?",
          "  Photophobia + FTT → cystinosis (leukocyte cystine)",
          "  Cataracts + hypotonia + intellectual disability → Lowe (OCRL1)",
          "  Lactic acidosis + multiorgan → mitochondrial panel",
          "Step 3: Genetic confirmation → CTNS (cystinosis), OCRL1 (Lowe), CLCN5 (Dent), FAH (tyrosinaemia)",
          "Treatment: Cause-specific. Phosphate + calcitriol for rickets component.",
        ],
      },
      investigations: {
        must: ["Urine glucose (Clinitest — normoglycaemic glucosuria)", "Urine amino acids (HPLC)", "TRP calculation (phosphate reabsorption)", "Urine Ca/Cr ratio", "Urine beta-2 microglobulin (low-MW proteinuria)", "Leukocyte cystine (gold standard cystinosis)"],
        should: ["Slit-lamp exam (cystine crystals)", "Renal USG (nephrocalcinosis)", "Genetic panel based on clinical constellation"],
      },
      guidelines: "IPNA 2021 Tubular Disorders · ERKNet Dent Disease pathway · Devuyst O, Fanconi syndrome review KI 2017 · NDI: Bichet DG, NEJM 2019",
    },
  },
  {
    id: "cakut",
    name: "CAKUT Engine",
    file: "components/engines/CAKUTEngine.jsx",
    status: "PARTIAL_LEILA",
    category: "Congenital/Urology",
    priority: 2,
    summary: "6-sub-engine menu (Antenatal HN, UPJ, Megaureter, MCDK, SFK, Duplex). Each sub-engine has 2–3 structured sections with clinical criteria and management. Better than static pages but lacks entry-point branching, differential generation, and severity-driven investigation sequencing.",
    strengths: [
      "UTD classification for antenatal hydronephrosis is correct",
      "Pyeloplasty indications with MAG3 criteria are accurate",
      "SFK monitoring protocol correctly emphasises UPCR and eGFR trajectory",
      "Duplex anatomy with Weigert-Meyer rule included",
    ],
    gaps: [
      "No clinical entry: 'Child found to have antenatal hydronephrosis — what next?' type question flow",
      "No PUV detection branch — PUV is the most dangerous CAKUT (bilateral obstruction, renal dysplasia) and not prominent",
      "No genetic cause association (HNF1B mutations → renal cysts + diabetes syndrome, missing from SFK section)",
      "No antenatal counselling / prognosis content for bilateral disease",
      "Investigation sequencing: VCUG vs MAG3 vs MRI urography decision not branched by scenario",
      "Missing: VUR engine (RIVUR trial evidence for CAP vs surgery; reflux grading → management)",
    ],
    rebuild_needed: true,
    rebuild_blueprint: {
      architecture: "Entry branching → sub-engine with severity assessment",
      new_entry: "Entry: How was CAKUT detected? → Antenatal / Postnatal incidental / Symptomatic (UTI, haematuria, hypertension)",
      priority_additions: [
        "PUV Detection Branch: Male infant + bilateral HN + distended bladder + poor urine stream → immediate VCUG → valve ablation",
        "VUR Classification Engine: Grade I–V → CAP vs endoscopic treatment vs ureteric reimplantation decision",
        "HNF1B / Genetic CAKUT Screen: Renal cysts + extrarenal (MODY5, genital) → HNF1B testing",
        "Bilateral Renal Agenesis / Severe Oligohydramnios: Prognosis, lethal vs survivable — EXIT procedure",
        "Long-term CKD trajectory branch: Any CAKUT with reduced renal mass → ACEi, UPCR, eGFR monitoring protocol",
      ],
      vur_engine: {
        entry: "Diagnosed VUR — Grade + Bilateral + Renal scarring?",
        grade_I_II: "Observation + good voiding habits, treat BBD, 12-monthly USG",
        grade_III_IV: "CAP (prophylactic antibiotics) + annual DMSA; consider STING if breakthrough UTIs",
        grade_V: "Early ureteric reimplantation (open Politano-Leadbetter or laparoscopic); manage renal dysplasia",
        rivur_principle: "RIVUR trial: CAP reduces febrile UTI risk by 50% in VUR grades I–IV with BBD",
      },
      guidelines: "EAU Paediatric Urology 2023 · RIVUR trial NEJM 2014 · AAP UTD classification 2014 · ISPN CAKUT guidelines",
    },
  },
  {
    id: "voiding",
    name: "Voiding Dysfunction Engine",
    file: "components/engines/VoidingDysfunctionEngine.jsx",
    status: "PARTIAL_LEILA",
    category: "Urology",
    priority: 2,
    summary: "Has multi-step structure: symptom entry → continence check → daytime vs nocturnal → BBD questionnaire → uroflow pattern → PVR → diagnosis. Reasonably functional but diagnosis output is static (no investigation recommendations per diagnosis, no monitoring plan, no specialist referral criteria).",
    strengths: [
      "ICCS 2016 terminology correctly applied",
      "BBD questionnaire (6 items) with scoring threshold",
      "Uroflow pattern classification (bell/tower/plateau/interrupted/staccato)",
      "Neurogenic bladder recognition branch",
    ],
    gaps: [
      "No investigation panel per diagnosis (uroflow without PVR → incomplete for OAB)",
      "No monitoring protocol for any diagnosis",
      "No specialist referral criteria (when to refer urology vs paediatric nephrology)",
      "Neurogenic bladder: management says 'UDS essential' but no UDS interpretation guidance",
      "Missing: Dysfunctional Elimination Syndrome differentiation from pure OAB",
      "No follow-up frequency or response assessment (when is treatment working?)",
      "No inclusion of DVSS (Dysfunctional Voiding Symptom Score) quantitative scoring",
    ],
    rebuild_needed: true,
    rebuild_blueprint: {
      architecture: "Keep existing step flow; ADD investigation + monitoring + referral panels to each diagnosis output",
      additions_per_diagnosis: {
        OAB: {
          must_investigate: ["Urinalysis + MSU culture", "Renal + bladder USG (pre/post-void, wall thickness)", "Bladder diary × 3 days (voiding frequency + volumes)", "BBD questionnaire score"],
          should_investigate: ["Uroflow + PVR (if not already done)", "Spine XR (if any neurological features)"],
          monitoring: ["4-weekly review for first 3 months", "DVSS score at baseline and follow-up", "Refer if no improvement after 6 months urotherapy + oxybutynin"],
        },
        neurogenic: {
          must_investigate: ["Urodynamic study (UDS) with cystometrogram + EMG", "MRI spine (tethered cord, sacral agenesis)", "Renal USG (upper tract protection)", "VCUG (assess vesicoureteric reflux + DSD)"],
          monitoring: ["6-monthly renal USG + eGFR in any neurogenic bladder", "Annual urodynamics if high-risk features", "Multidisciplinary: nephrology + urology + neurology + physiotherapy"],
        },
        BBD: {
          must_investigate: ["Constipation assessment (Bristol stool chart, abdominal XR if needed)", "Bladder diary", "MSU culture"],
          key_principle: "TREAT CONSTIPATION FIRST — OAB/incontinence often resolves with laxatives alone",
          monitoring: ["Monthly until symptom resolution", "ACE-I/UPCR if recurrent UTIs causing renal scarring"],
        },
        MNE: {
          first_line: "Enuresis alarm — 70-80% success; 3-month minimum trial",
          second_line: "Desmopressin 120–240 mcg sublingual at bedtime; avoid if polydipsia",
          monitoring: ["3-monthly response assessment (dry nights per week)", "Reassess for daytime symptoms → reclassify if present"],
        },
      },
      referral_criteria: [
        "Any child with neurological signs → immediate urology + neurology",
        "Upper tract dilation on USG → urology",
        "Recurrent febrile UTIs on CAP → uroflow + VCUG + urology",
        "Failed 12 months urotherapy + medication → specialist centre",
        "Hinman syndrome (non-neurogenic neurogenic bladder) → tertiary urology",
      ],
      guidelines: "ICCS 2016 standardisation · Nevéus T, JPU 2020 · DVSS: Farhat W, JPU 2000 · NICE CG111 Bedwetting in children",
    },
  },
  {
    id: "pediatric_htn",
    name: "Pediatric Hypertension Engine",
    file: "components/engines/PediatricHypertensionEngine.jsx",
    status: "PARTIAL_LEILA",
    category: "Hypertension",
    priority: 2,
    summary: "4-step sequential page: symptoms → BP classification → secondary causes list → drug guide. Has symptom-triggered emergency alert. But BP classification requires manual lookup (no built-in BP percentile calculator), secondary causes are a flat list, and there is no causal branching.",
    strengths: [
      "Emergency detection: seizure/encephalopathy → immediate protocol",
      "AAP 2017 classification framework",
      "Secondary causes list with relevant investigations",
      "Drug table with indications and doses",
    ],
    gaps: [
      "No BP percentile calculator embedded — clinician must look up tables externally",
      "Secondary causes are flat list, not branched (age of patient dictates probability)",
      "Age-specific cause probability not weighted (neonates: RAS/coarctation; adolescents: essential)",
      "No 'white coat HTN' decision branch (ABPM indication criteria)",
      "Drug selection not linked to cause (e.g. renovascular → NO ACEi; pheochromocytoma → alpha block first)",
      "No end-organ damage assessment (LVH on echo, retinopathy, proteinuria) in the engine",
      "Missing: hypertensive emergency rate-of-correction logic calculator (25% MAP reduction target)",
    ],
    rebuild_needed: true,
    rebuild_blueprint: {
      architecture: "Embed BP percentile calculator → cause-branched workup → drug logic",
      step_1: "Embed automated BP percentile calculator: age/sex/height → AAP 2017 table → stage classification",
      step_2_branching: {
        question: "Age group + risk factors",
        neonatal: "→ RAS (umbilical artery catheter), coarctation (4-limb BP), renal vein thrombosis",
        infant_under2: "→ RAS, CAKUT/CKD, coarctation, Wilms tumour",
        child_2to12: "→ CKD/reflux nephropathy, RAS, primary aldosteronism, pheochromocytoma",
        adolescent: "→ Essential HTN (obesity-linked), CKD, renovascular, white coat",
      },
      drug_cause_linkage: {
        CKD_proteinuria: "ACEi/ARB first (ESCAPE trial)",
        renovascular: "Amlodipine first — ACEi/ARB caution in bilateral RAS (precipitate AKI)",
        pheochromocytoma: "Alpha-blocker FIRST (phenoxybenzamine), then beta-blocker — NEVER beta-blocker alone",
        primary_aldosteronism: "Spironolactone/eplerenone; surgery if unilateral adenoma",
        coarctation: "Surgical/interventional first, antihypertensives as bridge",
        white_coat: "ABPM confirms → lifestyle only, no drugs",
      },
      emergency_calculator: "MAP = (2×diastolic + systolic) / 3 → Target: reduce MAP by ≤25% in first hour → show target MAP range",
      guidelines: "AAP Clinical Practice Guideline 2017 · ESCAPE trial (losartan in CKD) · NIH BP tables 2017 · ABPM paediatric interpretation",
    },
  },
  // ─── NEEDS REBUILD — MEDIUM PRIORITY ────────────────────────────────────
  {
    id: "acid_base",
    name: "Acid-Base Hub Engine",
    file: "components/engines/AcidBaseHubEngine.jsx",
    status: "PARTIAL_LEILA",
    category: "Acid-Base",
    priority: 2,
    summary: "Has ABG auto-classifier (pH + PCO2 + HCO3 → primary disorder) + 4 sub-engines. Metabolic acidosis uses MetabolicAcidosisEngine from DecisionEngines (has anion gap branching). Metabolic alkalosis has good Cl-responsive/resistant branching. Respiratory engines are static info panels.",
    strengths: [
      "ABG auto-classifier with Winter's formula for respiratory compensation check",
      "Chloride-responsive vs resistant metabolic alkalosis branching is correct",
      "Bartter/Gitelman/Liddle/GRA distinctions are detailed",
      "Metabolic acidosis sub-engine handles AG calculation and RTA",
    ],
    gaps: [
      "Mixed disorder detection: Winter's formula flags mismatch but engine doesn't branch further",
      "No delta-delta gap calculation (AG > HCO3 rise = unmask underlying metabolic alkalosis)",
      "No 'simultaneous disorder' recognition interface",
      "Respiratory acidosis/alkalosis engines are purely informational (static InfoBox) — no branching",
      "RTA classification engine needs a full branching rebuild (urine AG, urine pH, FEHCO3, TTKG)",
    ],
    rebuild_needed: true,
    rebuild_blueprint: {
      architecture: "Enhanced ABG parser → mixed disorder detection → deeper sub-engines",
      enhanced_abg_parser: [
        "Compute: Expected compensation for each primary disorder",
        "Compare expected vs measured: if discordant → flag mixed disorder with explanation",
        "Delta-delta gap: (AG – 12) / (24 – HCO3) → <0.4: pure AG-MA; 0.4–0.8: mixed; >2: mixed AG-MA + metabolic alkalosis",
        "Urine AG: Na + K – Cl → positive = RTA type 1/4; negative = GI loss (diarrhoea)",
      ],
      rta_engine: {
        entry: "Metabolic acidosis + hyperchloraemia + normal anion gap",
        urine_ph: "pH >5.3 despite systemic acidosis → distal RTA (type 1) or RTA type 4",
        urine_ag: "Urine AG = Na + K – Cl",
        positive_uag: "Impaired NH4+ excretion → Distal RTA (type 1) or Type 4 (hypoaldosteronism)",
        negative_uag: "Normal NH4+ excretion → GI bicarbonate loss (diarrhoea, ileostomy) or proximal RTA (type 2)",
        fehicO3: "FEHCo3 >15% → Proximal RTA (type 2); Fanconi syndrome workup",
        ttkg: "TTKG <4 in hyperkalaemia + normal AG acidosis → Type 4 RTA (hypoaldosteronism)",
        causes_type1: "Primary (idiopathic), SLE, Sjögren's, CAKUT/obstruction, hypercalciuria, amphotericin, lithium",
        causes_type2: "Fanconi syndrome (cystinosis, Lowe, Dent, acetazolamide, tenofovir)",
        causes_type4: "RTA type IV: AKI/CKD (most common in paediatric nephrology), hypoaldosteronism, ACEi/ARB, Gordon syndrome",
      },
      guidelines: "Rose BD Acid-Base textbook · Soriano JR, JASN RTA review 2002 · KDIGO 2020 CKD acid-base",
    },
  },
  {
    id: "electrolytes_hub",
    name: "Electrolytes Hub Engine",
    file: "components/engines/ElectrolytesHubEngine.jsx",
    status: "NEEDS_AUDIT",
    category: "Electrolytes",
    priority: 2,
    summary: "Need to read file — audit pending.",
    strengths: [],
    gaps: ["Full audit required — file not yet read"],
    rebuild_needed: null,
    rebuild_blueprint: null,
  },
  {
    id: "hypokalemia",
    name: "Hypokalemia Engine",
    file: "components/engines/HypokalemiaEngine.jsx",
    status: "NEEDS_AUDIT",
    category: "Electrolytes",
    priority: 2,
    summary: "Need to read file — audit pending. Given the pattern of other engines, likely needs expansion of tubular causes (Bartter, Gitelman, Fanconi) and TTKG branching.",
    strengths: [],
    gaps: ["Full audit required — file not yet read"],
    rebuild_needed: null,
    rebuild_blueprint: null,
  },
  // ─── AUDIT SUMMARY — TUBULAR DISORDERS ──────────────────────────────────
  {
    id: "tubular_disorders",
    name: "Tubular Disorders Engine",
    file: "components/engines/TubularDisordersEngine.jsx",
    status: "NEEDS_AUDIT",
    category: "Tubular",
    priority: 2,
    summary: "Separate from TubularDisorderEngine (singular). Likely covers RTA, Bartter, Gitelman. Audit pending.",
    strengths: [],
    gaps: ["Full audit required — file not yet read"],
    rebuild_needed: null,
    rebuild_blueprint: null,
  },
];

// ── Status Config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  LEILA_COMPLIANT: { label: "LEILA Compliant ✓", color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CheckCircle2, dot: "bg-emerald-500" },
  PARTIAL_LEILA: { label: "Partial LEILA — Rebuild", color: "bg-amber-100 text-amber-800 border-amber-300", icon: Wrench, dot: "bg-amber-500" },
  NEEDS_REBUILD: { label: "Needs Rebuild 🔧", color: "bg-red-100 text-red-800 border-red-300", icon: XCircle, dot: "bg-red-500" },
  NEEDS_AUDIT: { label: "Needs Audit", color: "bg-slate-100 text-slate-700 border-slate-300", icon: FlaskConical, dot: "bg-slate-400" },
};

const PRIORITY_CONFIG = {
  1: { label: "P1 — Critical", color: "bg-red-600 text-white" },
  2: { label: "P2 — High", color: "bg-orange-500 text-white" },
  3: { label: "P3 — Medium", color: "bg-blue-500 text-white" },
};

// ── LEILA Standards Reference ─────────────────────────────────────────────────
const LEILA_STANDARDS = [
  { id: 1, label: "Branching decision questions (not flat lists)", icon: "🌿" },
  { id: 2, label: "Quantitative inputs with real-time computed interpretation", icon: "🔢" },
  { id: 3, label: "Differential diagnosis table with probability weighting", icon: "📊" },
  { id: 4, label: "Investigation panel (Must / Should / Advanced tiers)", icon: "🧪" },
  { id: 5, label: "Evidence-based treatment protocol", icon: "💊" },
  { id: 6, label: "Monitoring plan with specific intervals", icon: "📅" },
  { id: 7, label: "Visible reasoning chain (PathwayTrail)", icon: "🔗" },
  { id: 8, label: "Emergency detection with urgent branches", icon: "⚡" },
  { id: 9, label: "Guideline source attribution", icon: "📖" },
];

// ── Components ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NEEDS_AUDIT;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function EngineCard({ engine, expanded, onToggle }) {
  const cfg = STATUS_CONFIG[engine.status] || STATUS_CONFIG.NEEDS_AUDIT;
  const pCfg = PRIORITY_CONFIG[engine.priority] || PRIORITY_CONFIG[3];
  const bp = engine.rebuild_blueprint;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${engine.status === "NEEDS_REBUILD" ? "border-red-300" : engine.status === "PARTIAL_LEILA" ? "border-amber-300" : engine.status === "LEILA_COMPLIANT" ? "border-emerald-300" : "border-slate-200"}`}>
      <button
        className="w-full flex items-start gap-3 p-4 text-left bg-white hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-sm text-slate-900">{engine.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{engine.file}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pCfg.color}`}>{pCfg.label}</span>
              <StatusBadge status={engine.status} />
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{engine.summary}</p>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-4">
          {/* Summary */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Audit Summary</p>
            <p className="text-xs text-slate-600">{engine.summary}</p>
          </div>

          {/* Strengths */}
          {engine.strengths.length > 0 && (
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1.5">✅ Strengths</p>
              <div className="space-y-1">
                {engine.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />{s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gaps */}
          {engine.gaps.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1.5">⚠️ Gaps / Deficiencies</p>
              <div className="space-y-1">
                {engine.gaps.map((g, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                    <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />{g}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rebuild Blueprint */}
          {bp && (
            <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-700" />
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Rebuild Blueprint — LEILA Architecture</p>
              </div>
              <div className="space-y-2">
                {bp.architecture && (
                  <div>
                    <p className="text-xs font-semibold text-blue-800">Architecture:</p>
                    <p className="text-xs text-blue-700">{bp.architecture}</p>
                  </div>
                )}
                {bp.entry_point && (
                  <div className="bg-blue-100 rounded-lg px-2.5 py-1.5">
                    <p className="text-xs font-bold text-blue-900">Entry Point:</p>
                    <p className="text-xs text-blue-800">{bp.entry_point}</p>
                  </div>
                )}
                {Object.entries(bp).map(([key, val]) => {
                  if (["architecture", "entry_point", "guidelines"].includes(key)) return null;
                  if (typeof val === "object" && !Array.isArray(val)) {
                    return (
                      <div key={key} className="bg-white rounded-lg px-2.5 py-1.5 border border-blue-200">
                        <p className="text-xs font-bold text-blue-900 mb-1">{key.replace(/_/g, " ").toUpperCase()}:</p>
                        {Object.entries(val).map(([k, v]) => (
                          <div key={k} className="text-xs text-slate-700 mb-0.5">
                            <span className="font-semibold text-blue-700">{k.replace(/_/g, " ")}: </span>
                            {Array.isArray(v) ? v.join(" · ") : String(v)}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  if (Array.isArray(val)) {
                    return (
                      <div key={key} className="bg-white rounded-lg px-2.5 py-1.5 border border-blue-200">
                        <p className="text-xs font-bold text-blue-900 mb-1">{key.replace(/_/g, " ").toUpperCase()}:</p>
                        {val.map((item, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 mb-0.5">
                            <ChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />{item}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })}
                {bp.guidelines && (
                  <div className="bg-slate-100 rounded-lg px-2.5 py-1.5">
                    <p className="text-xs font-semibold text-slate-700">📖 Guidelines:</p>
                    <p className="text-xs text-slate-600">{bp.guidelines}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Summary Stats ─────────────────────────────────────────────────────────────

function AuditSummary() {
  const compliant = ENGINES.filter(e => e.status === "LEILA_COMPLIANT").length;
  const partial = ENGINES.filter(e => e.status === "PARTIAL_LEILA").length;
  const rebuild = ENGINES.filter(e => e.status === "NEEDS_REBUILD").length;
  const audit = ENGINES.filter(e => e.status === "NEEDS_AUDIT").length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: "LEILA Compliant", count: compliant, color: "bg-emerald-50 border-emerald-300 text-emerald-900" },
        { label: "Partial — Enhance", count: partial, color: "bg-amber-50 border-amber-300 text-amber-900" },
        { label: "Needs Rebuild", count: rebuild, color: "bg-red-50 border-red-300 text-red-900" },
        { label: "Needs Audit", count: audit, color: "bg-slate-100 border-slate-300 text-slate-700" },
      ].map(s => (
        <div key={s.label} className={`rounded-2xl border-2 p-4 text-center ${s.color}`}>
          <p className="text-3xl font-black">{s.count}</p>
          <p className="text-xs font-semibold mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EngineAuditBlueprint() {
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState("ALL");
  const [expandAll, setExpandAll] = useState(false);

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const FILTERS = ["ALL", "NEEDS_REBUILD", "PARTIAL_LEILA", "LEILA_COMPLIANT", "NEEDS_AUDIT"];

  const filtered = ENGINES.filter(e => filter === "ALL" || e.status === filter);

  const handleExpandAll = () => {
    const next = !expandAll;
    setExpandAll(next);
    const map = {};
    filtered.forEach(e => { map[e.id] = next; });
    setExpanded(map);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-6 h-6 text-blue-400" />
          <h1 className="text-lg font-black">Nephrology Engine Audit & Rebuild Blueprint</h1>
          <Badge className="bg-blue-600 text-white text-xs">Admin Only</Badge>
        </div>
        <p className="text-sm text-slate-300">Systematic audit of all clinical decision engines against LEILA-style architecture standards. Includes rebuild blueprints for engines requiring upgrade.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["AKI", "NS", "HUS/TMA", "NDI/Dent", "CAKUT", "Voiding", "HTN", "Acid-Base", "Electrolytes"].map(t => (
            <span key={t} className="text-xs bg-white/10 border border-white/20 text-slate-200 px-2.5 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      {/* LEILA Standards Reference */}
      <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-blue-700" />
          <p className="text-sm font-bold text-blue-900">LEILA-Style Architecture Standards (9 Requirements)</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {LEILA_STANDARDS.map(s => (
            <div key={s.id} className="flex items-start gap-2 text-xs text-blue-800 bg-white rounded-lg px-2.5 py-1.5 border border-blue-200">
              <span>{s.icon}</span><span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <AuditSummary />

      {/* Filters + Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === f ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"}`}>
            {f === "ALL" ? `All (${ENGINES.length})` : `${STATUS_CONFIG[f]?.label || f} (${ENGINES.filter(e => e.status === f).length})`}
          </button>
        ))}
        <button onClick={handleExpandAll} className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-300 bg-white text-slate-600 hover:bg-slate-100">
          {expandAll ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* Engine Cards */}
      <div className="space-y-3">
        {filtered.map(engine => (
          <EngineCard
            key={engine.id}
            engine={engine}
            expanded={!!expanded[engine.id]}
            onToggle={() => toggle(engine.id)}
          />
        ))}
      </div>

      {/* Rebuild Priority Queue */}
      <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-red-700" />
          <p className="text-sm font-bold text-red-900">Rebuild Priority Queue</p>
        </div>
        <div className="space-y-2">
          {[
            { rank: 1, engine: "HUS/TMA Pathway", reason: "Most dangerous — wrong diagnosis (STEC vs aHUS vs TTP) = wrong treatment = death. Must have hard branching gates on ADAMTS13 and Stx results." },
            { rank: 2, engine: "NDI + Dent Disease (Tubular Engine)", reason: "Critical rare diagnoses. Static info is insufficient. NDI needs water deprivation test logic; Dent needs low-MW proteinuria entry point + monitoring until ESKD planning." },
            { rank: 3, engine: "CAKUT Engine — PUV + VUR branches", reason: "PUV is the leading structural cause of CKD in children. Missing PUV detection branch is a major gap." },
            { rank: 4, engine: "Acid-Base Hub — RTA Engine", reason: "RTA classification requires 4-step algorithmic logic (urine AG → urine pH → FEHCO3 → TTKG). Currently not implemented as true branch engine." },
            { rank: 5, engine: "Pediatric HTN Engine — BP percentile + cause-drug link", reason: "Pheochromocytoma management requires alpha-block BEFORE beta-block — not enforced by current linear flow." },
          ].map(item => (
            <div key={item.rank} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-red-200">
              <span className="w-7 h-7 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">{item.rank}</span>
              <div>
                <p className="text-sm font-bold text-red-900">{item.engine}</p>
                <p className="text-xs text-red-700 mt-0.5">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preservation Note */}
      <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-700" />
          <p className="text-sm font-bold text-green-900">Content Preservation Policy</p>
        </div>
        <p className="text-xs text-green-800">
          No existing clinical content shall be deleted during rebuilds. All current knowledge panels, drug references, and protocols will be preserved as static reference tabs within the rebuilt engines. New LEILA-style branching will be added as the primary interactive layer on top of existing content — not replacing it. Rebuilds add reasoning architecture; they do not remove clinical knowledge.
        </p>
      </div>
    </div>
  );
}