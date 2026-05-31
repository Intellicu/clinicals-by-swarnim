import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, ChevronDown, ChevronUp, ArrowRight, ExternalLink, Pencil, AlertTriangle, Zap, Plus, Trash2, X, Check, GitBranch } from "lucide-react";
import AdminPathwayGenerator from "@/components/admin/AdminPathwayGenerator";

const PATHWAYS = [
  // ── New Deep Diagnostic Engines ───────────────────────────────────────────
  { name: "Fabry Disease Engine", tag: "Engine", color: "bg-violet-100 text-violet-900", emergency: false,
    summary: "Complete recognition → diagnosis → genetics → ERT/migalastat → family screening engine for Fabry disease.",
    keys: ["Alpha-Gal A enzyme (males) or GLA sequencing (females)", "Lyso-Gb3 biomarker", "ERT: Agalsidase alfa/beta; Migalastat for amenable variants", "Family cascade screening — X-linked inheritance"],
    scenario: "fabry-engine" },
  { name: "Voiding Dysfunction Engine", tag: "Engine", color: "bg-teal-100 text-teal-900", emergency: false,
    summary: "ICCS 2016 — OAB → dysfunctional voiding → underactive bladder → neurogenic → BBD → MNE.",
    keys: ["Continence assessment → daytime vs nocturnal", "BBD questionnaire scoring", "Uroflow pattern recognition: Bell / Tower / Plateau / Staccato / Interrupted", "Management: urotherapy → medications → biofeedback → CIC"],
    scenario: "voiding-engine" },
  { name: "Cystic Kidney Disease Engine", tag: "Engine", color: "bg-blue-100 text-blue-900", emergency: false,
    summary: "Age → bilateral/unilateral → family history → extra-renal features → ADPKD / ARPKD / NPHP / BBS / HNF1B / MCDK.",
    keys: ["ADPKD: PKD1/PKD2 — tolvaptan in adults, TKV monitoring", "ARPKD: PKHD1 — hepatic fibrosis, portal HTN", "NPHP: Small corticomedullary cysts, ESKD by 13y", "BBS: Setmelanotide for obesity; retinal dystrophy"],
    scenario: "cystic-kidney-engine" },
  { name: "CAKUT Diagnostic Engine", tag: "Engine", color: "bg-teal-100 text-teal-800", emergency: false,
    summary: "6 sub-engines: Antenatal HN · UPJ · Megaureter · MCDK · Solitary kidney · Duplex/ureterocele.",
    keys: ["UTD classification for antenatal hydronephrosis", "MAG3 criteria for pyeloplasty (UPJ: DRF <40% or t½ >20 min)", "MCDK monitoring: Involution + contralateral VUR", "Duplex: Upper pole obstructs / lower pole refluxes"],
    scenario: "cakut-engine" },
  { name: "PUV Intelligence Engine", tag: "Engine", color: "bg-red-100 text-red-900", emergency: true,
    summary: "Posterior urethral valves — prenatal keyhole sign → postnatal decompression → MCU → ESKD risk.",
    keys: ["Keyhole sign + oligohydramnios = PUV until proven otherwise", "Immediate: catheterise + ablate valves", "Creatinine nadir >1 mg/dL = 50% ESKD by 30y", "Valve bladder syndrome: CIC + anticholinergics"],
    scenario: "puv-engine" },
  { name: "Recurrent UTI / VUR Engine", tag: "Engine", color: "bg-cyan-100 text-cyan-800", emergency: false,
    summary: "Risk stratification → imaging algorithm → VUR grading I–V → CAP / STING / surgery.",
    keys: ["High risk: male <2y, febrile UTI, abnormal USG → VCUG", "VUR grades I–V management per NICE/AAP", "STING (Deflux): Grades III–IV, 75% success", "DMSA 4–6 months post-pyelonephritis for scarring"],
    scenario: "vur-uti-engine" },
  { name: "HNF1B + Alport Engine", tag: "Engine", color: "bg-green-100 text-green-800", emergency: false,
    summary: "Two most-missed hereditary nephropathies: HNF1B (17q12) and Alport syndrome (COL4A3/4/5).",
    keys: ["HNF1B: cysts + hypomagnesemia + MODY5 → MLPA deletion test", "Alport: hematuria + deafness + lenticonus → COL4 panel", "X-linked Alport: ACEi early (age 5) is renoprotective", "TBMD vs Alport: EM for GBM lamellation"],
    scenario: "hnf1b-alport-engine" },
  { name: "Primary Hyperoxaluria Engine", tag: "Engine", color: "bg-orange-100 text-orange-900", emergency: false,
    summary: "PH1 (AGXT) / PH2 (GRHPR) / PH3 (HOGA1) — urine oxalate → genetics → lumasiran / transplant.",
    keys: ["Urine oxalate >0.5 mmol/1.73m²/day = elevated", "PH1: Lumasiran (approved RNAi) + pyridoxine trial 5 mg/kg/day", "Combined liver-kidney transplant for PH1 with ESKD", "Hydration >3L/1.73m²/day for all PH types"],
    scenario: "hyperoxaluria-engine" },
  { name: "Cystinosis Engine", tag: "Engine", color: "bg-blue-100 text-blue-800", emergency: false,
    summary: "Polyuria → Fanconi syndrome → corneal crystals → leukocyte cystine → cysteamine therapy.",
    keys: ["Most common Fanconi syndrome in children (CTNS gene)", "Leukocyte cystine >2.0 nmol ½ cystine/mg protein = diagnostic", "Cysteamine bitartrate: Start early — delays ESKD by 10–15 years", "Continue cysteamine post-transplant for extrarenal disease"],
    scenario: "cystinosis-engine" },
  { name: "Pediatric Hypertension Engine", tag: "Engine", color: "bg-pink-100 text-pink-900", emergency: false,
    summary: "AAP 2017 classification → symptoms → secondary HTN causes → drug selection by indication.",
    keys: ["85% pediatric HTN is secondary — must investigate", "Stage 2 + symptoms = hypertensive emergency: IV labetalol", "Drug selection: ACEi/ARB for CKD; CCB without proteinuria", "ABPM for white coat HTN; PRES MRI if encephalopathy"],
    scenario: "htn-engine" },
  { name: "Tubular Disorders Engine", tag: "Engine", color: "bg-amber-100 text-amber-800", emergency: false,
    summary: "Fanconi syndrome approach · Hypophosphatemic rickets (XLH/FGF23) · Nephrogenic DI.",
    keys: ["Fanconi: glucosuria + aminoaciduria + phosphaturia → cystinosis first", "XLH: Burosumab (anti-FGF23) now approved; vs Vit D deficiency", "NDI: HCTZ + amiloride + indomethacin triple therapy", "Distinguish VitD deficiency from FGF23-mediated rickets"],
    scenario: "tubular-engine" },
  { name: "Kidney Stone Engine", tag: "Engine", color: "bg-yellow-100 text-yellow-900", emergency: false,
    summary: "Stone type → metabolic workup → causes → specific treatment + genetics trigger.",
    keys: ["Always send stone for analysis; 24h urine metabolic workup", "Cystinuria: SLC3A1/SLC7A9 → tiopronin + alkalinization to pH 7", "PH1: Lumasiran + lumasiran/transplant", "Uric acid stones: DISSOLVE with potassium citrate (pH 6.5–7)"],
    scenario: "stone-engine" },
  // ── Deep Intelligence Engines (existing) ──────────────────────────────────
  { name: "Nephrotic Syndrome Intelligence Engine", tag: "Engine", color: "bg-violet-100 text-violet-900", emergency: false,
    summary: "Full LEILA engine: First episode → Relapse → FRNS → SDNS → SRNS → Congenital NS. Age-based branching, genetic triggers, ISKDC protocol.",
    keys: ["First episode: ISKDC prednisolone 60 mg/m²/day × 4–6 weeks", "Atypical features trigger biopsy + genetic workup", "FRNS/SDNS: Rituximab / MMF / Levamisole decision tree", "SRNS: biopsy + genetic panel mandatory before CNI"],
    scenario: "ns-engine" },
  { name: "Hyponatremia Intelligence Engine", tag: "Engine", color: "bg-cyan-100 text-cyan-900", emergency: true,
    summary: "Full LEILA engine: Na → osmolality → volume → urine Na/Osm → SIADH / CSW / hypovolaemia. Hypertonic saline calculator. Correction rate enforced.",
    keys: ["Serum osmolality: hypotonic / isotonic / hypertonic branching", "Volume status: hypovolaemic / euvolaemic / hypervolaemic", "Urine Na + urine osmolality → SIADH / CSW / NS / CHF", "Symptomatic: 3% NaCl 2 mL/kg IV — max correction 10 mEq/L/24h"],
    scenario: "hyponatremia-engine" },
  { name: "RPGN / Crescentic GN Engine", tag: "Engine", color: "bg-red-100 text-red-900", emergency: true,
    summary: "Full LEILA engine: AKI + haematuria → ANCA / anti-GBM / ANA / C3 → Biopsy IF pattern → Disease-specific treatment. PLEX criteria built-in.",
    keys: ["Immunoprofile: ANCA / anti-GBM / ANA / C3 → separate treatment branch per diagnosis", "PLEX criteria: anti-GBM always; ANCA if Cr >500 or DAH", "AAV: RTX (GPA/PR3) vs IV CYC (MPA/MPO) — RAVE trial-based", "Lupus / C3G / pauci-immune: individual protocols"],
    scenario: "rpgn-deep-engine" },
  { name: "AKI Diagnostic Engine", tag: "Engine", color: "bg-red-100 text-red-900", emergency: true,
    summary: "Full LEILA engine: KDIGO staging + pRIFLE → Pre/Intrinsic/Post-renal → ATN / GN / TMA / AIN / Rhabdo. Dose calculators. RRT AEIOU criteria.",
    keys: ["KDIGO 1–3 + pRIFLE staging with creatinine ratio calculator", "Pre-renal: fluid challenge protocol; post-renal: obstruction decompression", "Intrinsic: active sediment (GN) / granular casts (ATN) / TMA branching", "AEIOU criteria for RRT: Acidosis / Electrolytes / Intoxication / Overload / Uraemia"],
    scenario: "aki-engine" },
  { name: "Hyperkalaemia Emergency Engine (Full)", tag: "Engine", color: "bg-orange-100 text-orange-900", emergency: true,
    summary: "Full LEILA engine: K+ value → ECG changes → Cause analysis → Weight-based dose calculator (Ca gluconate, insulin, salbutamol, NaHCO3) → Dialysis decision.",
    keys: ["Weight-based dose calculator: Ca gluconate / insulin-dextrose / salbutamol / NaHCO3", "ECG stratification: peaked T → wide QRS → sine wave → arrest protocol", "Cause identification: AKI / drugs / acidosis / adrenal / cellular release", "RRT modality selection: HD vs CRRT vs PD by age + haemodynamics"],
    scenario: "hyperkalemia-deep-engine" },
  // ── Glomerular Diseases ───────────────────────────────────────────────────
  { name: "Nephrotic Syndrome (Childhood SSNS)", tag: "GN", color: "bg-purple-100 text-purple-800", emergency: false,
    summary: "Edema + proteinuria + hypoalbuminaemia. ISPN/IPNA first-line steroid protocol.",
    keys: ["ISKDC: prednisolone 60 mg/m²/day × 4 wks, then 40 mg/m² alternate day × 4 wks", "Relapse: dipstick ≥3+ × 3 consecutive days", "Frequent relapse (≥2/6m): MMF / levamisole / RTX", "SRNS: CNI (tacrolimus) + genetic testing — see SRNS pathway"],
    scenario: "childhood-nephrotic" },
  { name: "Steroid-Resistant NS / FSGS (SRNS)", tag: "GN", color: "bg-purple-100 text-purple-800", emergency: false,
    summary: "No remission after 4 weeks. Includes FSGS. Genetic workup mandatory before CNI.",
    keys: ["Genetic panel: NPHS1/2, PLCE1, WT1, LAMB2, COQ genes", "Renal biopsy (MCD vs FSGS vs DMS) before CNI initiation", "Tacrolimus: trough 5–10 ng/mL × 6 months; assess response", "Rituximab: 375 mg/m² × 2 doses for FRNS/SDNS (steroid-dependent relapsing)"],
    scenario: "steroid-resistant-ns" },
  { name: "IgA Nephropathy + IgA Vasculitis (IgAV/HSP)", tag: "GN", color: "bg-blue-100 text-blue-800", emergency: false,
    summary: "Most common primary GN. MEST-C scoring + HSP nephritis management combined.",
    keys: ["IgAN: haematuria ± proteinuria post-URTI; MEST-C biopsy classification", "IgAN treatment: ACEi/ARB if UPCR >0.5; steroids if GFR declining + UPCR >1", "IgAV: purpura + arthritis + abdominal pain + nephritis (non-thrombocytopenic)", "IgAV nephritis: biopsy if nephrotic/nephritic range; ACEi/ARB; steroids for severe"],
    scenario: "iga-nephropathy" },
  { name: "Lupus Nephritis (LN)", tag: "GN", color: "bg-rose-100 text-rose-800", emergency: false,
    summary: "Class III/IV most common in children. ACR/EULAR 2019. Biopsy mandatory.",
    keys: ["ISN/RPS classes I–VI; biopsy guides induction", "Induction: pulse methylprednisolone + MMF (preferred) or IV CYC (severe)", "Maintenance: MMF + hydroxychloroquine + low-dose prednisolone", "Target: UPCR <500 mg/mg, normal C3/C4, anti-dsDNA declining"],
    scenario: "lupus-nephritis" },
  { name: "ANCA Vasculitis + RPGN Engine", tag: "GN", color: "bg-red-100 text-red-800", emergency: true,
    summary: "RPGN + pulmonary haemorrhage. Decision algorithm: biopsy → induction → PLEX criteria.",
    keys: ["c-ANCA/PR3 = GPA; p-ANCA/MPO = MPA", "Biopsy urgently — % crescents determines treatment intensity", "Induction: RTX (GPA/PR3) or IV CYC (severe/DAH) + high-dose steroids", "PLEX if: Cr >500 μmol/L, dialysis-dependent, or diffuse alveolar haemorrhage"],
    scenario: "anca-vasculitis" },
  { name: "C3 Glomerulopathy (C3G / MPGN)", tag: "GN", color: "bg-cyan-100 text-cyan-800", emergency: false,
    summary: "Complement alternative pathway. Low C3 + C3-dominant IF. Biopsy + genetic panel.",
    keys: ["Low C3, normal C4 = alternative pathway (AP) activation", "IF: C3 dominant with minimal Ig — C3GN vs DDD (EM)", "AP genetics: CFH, CFI, MCP, C3, CFB, CFHR1/3/5 — overlap with aHUS", "Treatment: MMF ± steroids; eculizumab for CFH/C3 mutation with rapid progression"],
    scenario: "c3g-engine" },
  { name: "Post-Streptococcal GN (PSGN)", tag: "GN", color: "bg-sky-100 text-sky-800", emergency: false,
    summary: "Acute nephritis 1–3 weeks post strep. Low C3, high ASO. Usually self-limited.",
    keys: ["Haematuria + oedema + HTN + oliguria post-URTI/skin infection", "Low C3 (returns to normal in 6–8 weeks), normal C4, elevated ASO/anti-DNase B", "'Humps' on EM: subepithelial deposits", "Supportive: fluid restriction, diuretics, antihypertensives; penicillin course"],
    scenario: "post-strep-gn" },
  { name: "Membranous Nephropathy", tag: "GN", color: "bg-violet-100 text-violet-800", emergency: false,
    summary: "Subepithelial deposits. PLA2R secondary in adults. Secondary causes in children.",
    keys: ["PLA2R antibody (adults); in children: exclude SLE, HBV, drugs", "Subepithelial 'spikes' on silver stain; 'spike-and-dome' on EM", "Low-risk: RAAS blockade + watchful waiting × 6 months", "High-risk (declining GFR, heavy proteinuria): CsA + steroids or Rituximab"],
    scenario: "membranous-nephropathy" },
  // ── AKI ──────────────────────────────────────────────────────────────────
  { name: "AKI — Staging & Management", tag: "AKI", color: "bg-red-100 text-red-800", emergency: true,
    summary: "KDIGO staging. Identify cause. RRT triggers: AEIOU.",
    keys: ["KDIGO stages 1–3 by SCr rise or urine output (<0.5 mL/kg/h × 6h)", "Prerenal vs intrinsic (ATN, GN, interstitial) vs postrenal — USG urgently", "Stop nephrotoxins; optimise haemodynamics; daily weights", "RRT triggers (AEIOU): Acidosis, Electrolytes, Ingestion, Overload, Uraemia"],
    scenario: "aki-prifle" },
  { name: "HUS / TMA Decision Engine", tag: "AKI", color: "bg-red-100 text-red-800", emergency: true,
    summary: "STEC-HUS vs aHUS vs TTP. Algorithmic TMA differentiation. Includes aHUS PLEX + Eculizumab.",
    keys: ["TMA triad: MAHA + thrombocytopenia + organ injury", "STEC-HUS: Shiga-toxin positive → supportive only, NO antibiotics, NO eculizumab", "aHUS: complement genetic panel, do NOT delay eculizumab", "TTP: ADAMTS13 <10% → urgent PEX + steroids ± caplacizumab"],
    scenario: "hemolytic-uremic" },
  // ── CKD ──────────────────────────────────────────────────────────────────
  { name: "CKD Staging & Progression Engine", tag: "CKD", color: "bg-blue-100 text-blue-800", emergency: false,
    summary: "KDIGO G1–G5 + albuminuria risk matrix. Monitoring interval calculator.",
    keys: ["KDIGO G1–G5 by eGFR + A1–A3 albuminuria risk matrix", "Schwartz/CKiD formula for eGFR in children", "ACEi/ARB: UPCR >500 mg/g; target BP <50th percentile in CKD", "Progression Engine: eGFR + UPCR + BP → risk score → monitoring interval"],
    scenario: "ckd-staging" },
  { name: "CKD-MBD & Anaemia", tag: "CKD", color: "bg-blue-100 text-blue-800", emergency: false,
    summary: "Mineral metabolism + anaemia. KDIGO targets by CKD stage.",
    keys: ["PTH target: 2–9× ULN per stage; active Vit D for secondary HPT", "Phosphate binders: calcium-based (mild CKD), sevelamer/lanthanum (CKD 4–5)", "Anaemia: IV iron first (TSAT <30%), then ESA (darbepoetin) if Hb <10", "Target Hb 10–12 g/dL; avoid >13 (thrombosis risk)"],
    scenario: "ckd-mbd" },
  // ── Electrolytes ──────────────────────────────────────────────────────────
  { name: "Hyperkalaemia Engine", tag: "Electrolyte", color: "bg-orange-100 text-orange-800", emergency: true,
    summary: "K+ → ECG → Membrane stabilisation → Shift → Remove. Dialysis if refractory.",
    keys: ["K >6 or ECG changes: Ca gluconate 10% 0.5–1 mL/kg IV immediately", "Shift: Insulin-dextrose (0.1 U/kg + D25 2 mL/kg) + Salbutamol nebulisation", "Remove: resonium/patiromer oral; furosemide if UO adequate", "Dialysis if K >7, anuric, or no response to above"],
    scenario: "hyperkalemia-engine" },
  { name: "Hyponatraemia", tag: "Electrolyte", color: "bg-cyan-100 text-cyan-800", emergency: true,
    summary: "Na <135 mEq/L. Correct ≤10 mEq/L/24h. Serum osmolality first.",
    keys: ["Assess: serum osmolality + urine Na + urine osmolality + volume status", "SIADH: urine Na>20, urine osm>300, euvolaemic", "Symptomatic + seizures: 3% NaCl 2 mL/kg bolus IV", "Max correction: 10 mEq/L per 24h (chronic) — osmotic demyelination risk"],
    scenario: "hyponatremia" },
  { name: "Metabolic Acidosis Engine", tag: "Tubular", color: "bg-amber-100 text-amber-800", emergency: false,
    summary: "AG calculation → UAG → RTA classification. Integrated calculator.",
    keys: ["AG = Na − (Cl + HCO3). Normal <12. High AG = MUDPILES", "Non-AG: UAG = Na + K − Cl. Positive UAG = dRTA. Negative = GI loss.", "dRTA: urine pH >5.5 + nephrocalcinosis. K citrate + thiazide.", "pRTA/Fanconi: glucosuria + aminoaciduria + phosphaturia + low urate"],
    scenario: "metabolic-acidosis-engine" },
  { name: "Hypokalemia Engine", tag: "Tubular", color: "bg-amber-100 text-amber-800", emergency: false,
    summary: "BP + acid-base → Bartter / Gitelman / Liddle / AME. Decision algorithm.",
    keys: ["HTN + low K: check renin/aldosterone (primary aldosteronism), Cushing, AME, Liddle", "Low BP + alkalosis + high UCl: Bartter or Gitelman (Gitelman: low Mg, low Ca:Cr)", "Low BP + acidosis: RTA type II / Fanconi syndrome", "Genetic panel triggered by pattern + family history"],
    scenario: "hypokalemia-engine" },
  { name: "Polyuria Engine", tag: "Tubular", color: "bg-blue-100 text-blue-800", emergency: false,
    summary: "Urine osmolality → water deprivation → DDAVP → Central DI vs Nephrogenic DI.",
    keys: ["Random urine osm <300: DI vs psychogenic polydipsia", "Water deprivation: urine still dilute after 4-6h = DI confirmed", "DDAVP response: >50% rise = Central DI; <10% = Nephrogenic DI", "NDI genetics: AVPR2 (X-linked), AQP2; treatment: low-solute diet + thiazide + amiloride"],
    scenario: "polyuria-engine" },
  { name: "Hypocalcaemia", tag: "Electrolyte", color: "bg-amber-100 text-amber-800", emergency: true,
    summary: "Corrected Ca <8.5. Tetany/seizures at Ca <7 mg/dL.",
    keys: ["Correct for albumin: Ca + 0.8 × (4 − albumin)", "Symptomatic: IV Ca gluconate 10% 1–2 mL/kg slowly over 10 min", "Check Mg, PTH, Vit D — hypomagnesaemia causes refractory hypocalcaemia", "Chronic: oral calcium + active Vit D (calcitriol)"],
    scenario: "hypocalcemia" },
  { name: "Proteinuria Workup", tag: "Diagnostic", color: "bg-teal-100 text-teal-800", emergency: false,
    summary: "UPCR >0.2 mg/mg significant. Nephrotic vs subnephrotic. Orthostatic screening.",
    keys: ["UPCR: >0.2 = significant; >2 = nephrotic range (in children)", "Orthostatic: early morning UPCR (supine) vs midday — >50% orthostatic = benign", "Nephrotic range + symptoms in atypical age: biopsy", "Microalbuminuria (30–300 mg/g): screen annually in CKD, DM, HTN"],
    scenario: "proteinuria-approach" },
  { name: "Haematuria Evaluation Engine", tag: "Diagnostic", color: "bg-rose-100 text-rose-800", emergency: false,
    summary: "Glomerular vs urological. Stepwise: proteinuria → C3 → family Hx → Alport → Stone.",
    keys: ["Phase contrast: dysmorphic RBCs / acanthocytes >5% = glomerular", "Proteinuria + low C3 → C3G/PSGN; post-URTI → IgAN", "Family history + hearing loss → Alport (COL4A3/A4/A5 panel)", "Urine Ca:Cr >0.2 → hypercalciuria/stone workup"],
    scenario: "hematuria-engine" },
  // ── Dialysis & RRT ────────────────────────────────────────────────────────
  { name: "Peritoneal Dialysis", tag: "Dialysis", color: "bg-indigo-100 text-indigo-800", emergency: false,
    summary: "First-choice RRT in children <20 kg. ISPD 2022.",
    keys: ["CAPD vs APD — APD preferred (automated, overnight)", "Peritonitis: cloudy effluent + WBC >100/mm³ → empirical vancomycin + ceftazidime IP", "Adequacy: weekly Kt/V ≥1.7; measure at 4 weeks of stable PD", "Catheter exit site: daily cleaning; tunnel infection → consider catheter change"],
    scenario: "peritoneal-dialysis" },
  { name: "Haemodialysis", tag: "Dialysis", color: "bg-indigo-100 text-indigo-800", emergency: false,
    summary: "Older children/adolescents. Kt/V ≥1.2 per session.",
    keys: ["Access: AVF preferred long-term; CVC/Permcath for acute/temporary", "Adequacy: Kt/V ≥1.2 per session × 3/week minimum", "Intradialytic hypotension: commonest complication — cool dialysate, sodium profiling", "CRRT for ICU AKI: dose 20–25 mL/kg/h; citrate anticoagulation preferred"],
    scenario: "hemodialysis" },
  // ── Transplant ────────────────────────────────────────────────────────────
  { name: "Renal Transplant — Immunosuppression", tag: "Transplant", color: "bg-green-100 text-green-800", emergency: false,
    summary: "Standard: Tacrolimus + MMF + prednisolone. Surveillance biopsy at 1 year.",
    keys: ["Tacrolimus: 8–12 ng/mL (first 3 months) → 5–8 ng/mL (maintenance)", "MMF: 1200 mg/m²/day in 2 divided doses", "Annual: eGFR, UPCR, DSA (donor-specific antibodies), BK PCR, tacrolimus trough", "VACCINES: MMR/Varicella before transplant (live vaccines contraindicated post-Tx)"],
    scenario: "kidney-transplant" },
  { name: "Transplant Rejection Engine", tag: "Transplant", color: "bg-green-100 text-green-800", emergency: true,
    summary: "Rising creatinine. Banff criteria. TCMR vs AMR vs BK nephropathy.",
    keys: ["Urgent biopsy: Banff classification — TCMR (cellular) vs AMR (antibody-mediated)", "TCMR: pulse methylprednisolone 10 mg/kg × 3; severe: ATG", "AMR: IVIG + PEX + Rituximab ± bortezomib", "BK nephropathy: reduce IS (stop MMF first, reduce tacrolimus to 3–5 ng/mL)"],
    scenario: "transplant-rejection" },
  // ── Hypertension ─────────────────────────────────────────────────────────
  { name: "Paediatric Hypertension Workup", tag: "HTN", color: "bg-pink-100 text-pink-800", emergency: false,
    summary: "AAP 2017 classification. Secondary workup algorithm.",
    keys: ["Stages by age/sex/height percentiles for <13y; fixed thresholds ≥13y", "Secondary (>85% paediatric): renal, renovascular, endocrine", "Workup: USG kidneys, DMSA, renal artery Doppler, plasma metanephrines", "1st line: ACEi/ARB (CKD/proteinuria) or CCB (no proteinuria/CKD)"],
    scenario: "htn-diagnosis" },
  { name: "HTN Emergency + PRES", tag: "HTN", color: "bg-red-100 text-red-800", emergency: true,
    summary: "BP + end-organ damage. MAP ≤25% reduction in first hour. PRES protocol.",
    keys: ["IV labetalol (preferred) or nicardipine infusion", "Goal: ≤25% MAP reduction in first hour — too fast risks watershed infarction", "PRES: MRI FLAIR posterior changes → BP control + levetiracetam", "Avoid sublingual nifedipine (uncontrolled BP drop)"],
    scenario: "htn-emergency" },
  // ── Genetic / Metabolic ──────────────────────────────────────────────────
  { name: "Genetic Testing Trigger Engine", tag: "Genetic", color: "bg-violet-100 text-violet-800", emergency: false,
    summary: "SRNS · Alport · CAKUT · Tubulopathies · aHUS. Indication → panel → urgency.",
    keys: ["SRNS: genetic panel before CNI (NPHS1/2, WT1, PLCE1, COQ genes)", "Alport: COL4A3/4/5 + audiometry + slit-lamp", "Ciliopathies/NPHP: NPHP1 deletion first; ciliopathy panel if negative", "aHUS: complement genetics URGENT (do not delay eculizumab)"],
    scenario: "genetic-engine" },
  { name: "Biopsy Trigger Engine", tag: "Diagnostic", color: "bg-amber-100 text-amber-800", emergency: false,
    summary: "When to biopsy vs observe. Indication by disease pattern.",
    keys: ["NS: biopsy if age <1y or >12y, atypical, steroid-resistant/dependent", "IgAN/Lupus/C3G: biopsy for classification + guides intensity of IS", "RPGN: urgent biopsy within 24–48h — IF pattern determines treatment", "Alport: EM required (GBM thinning/lamellation); skin biopsy for X-linked"],
    scenario: "biopsy-engine" },
  // ── Stones & Tubular ─────────────────────────────────────────────────────
  { name: "Renal Stone & Nephrocalcinosis", tag: "Urological", color: "bg-yellow-100 text-yellow-800", emergency: false,
    summary: "24h urine metabolic workup. Identify hypercalciuria, hyperoxaluria, hypocitraturia.",
    keys: ["24h urine: Ca, oxalate, citrate, urate, cystine, volume", "Hypercalciuria: thiazide + low-Na diet + hydration", "PH1: lumasiran (RNAi) + combined liver-kidney Tx for ESRD; pyridoxine trial", "Nephrocalcinosis: dRTA, HPT, hypercalcaemia, Bartter, FHHNC"],
    scenario: "nephrocalcinosis" },
];

const TAGS = ["All", "Engine", "GN", "AKI", "CKD", "Electrolyte", "Tubular", "Dialysis", "Transplant", "HTN", "Diagnostic", "Urological", "Genetic"];
const EMPTY_PATHWAY = { name: "", tag: "GN", color: "bg-blue-100 text-blue-800", emergency: false, summary: "", keys: [""], scenario: "" };

export default function HubNephrologyPathways() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState("");
  const [customPathways, setCustomPathways] = useState(() => {
    try { return JSON.parse(localStorage.getItem("custom_pathways") || "[]"); } catch { return []; }
  });
  const [editModal, setEditModal] = useState(null); // null | { mode: "add"|"edit", idx, pathway, isCustom }

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 60000,
  });
  const isAdmin = user?.role === "admin";

  const saveCustom = (updated) => {
    setCustomPathways(updated);
    localStorage.setItem("custom_pathways", JSON.stringify(updated));
  };

  const openAdd = () => setEditModal({ mode: "add", pathway: { ...EMPTY_PATHWAY }, isCustom: true });
  const openEdit = (pathway, idx, isCustom) => setEditModal({ mode: "edit", idx, pathway: { ...pathway, keys: [...pathway.keys] }, isCustom });

  const handleSave = () => {
    const p = editModal.pathway;
    if (!p.name.trim()) return;
    if (editModal.mode === "add") {
      saveCustom([...customPathways, { ...p, _isCustom: true }]);
    } else if (editModal.isCustom && editModal.idx >= 0) {
      const updated = [...customPathways];
      updated[editModal.idx] = p;
      saveCustom(updated);
    } else if (!editModal.isCustom) {
      // Store built-in edit override in localStorage
      const overrides = JSON.parse(localStorage.getItem("builtin_pathway_overrides") || "{}");
      overrides[p.name] = p;
      localStorage.setItem("builtin_pathway_overrides", JSON.stringify(overrides));
      // Force re-render
      setHiddenBuiltinIndices(h => [...h]); // trigger re-render
    }
    setEditModal(null);
  };

  // Load built-in overrides from localStorage
  const [builtinOverrides] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("builtin_pathway_overrides") || "{}"); } catch { return {}; }
  });

  // Tracks built-in pathways hidden by admin
  const [hiddenBuiltinIndices, setHiddenBuiltinIndices] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hidden_builtin_pathways") || "[]"); } catch { return []; }
  });

  const hideBuiltin = (pathwayName) => {
    const updated = [...hiddenBuiltinIndices, pathwayName];
    setHiddenBuiltinIndices(updated);
    localStorage.setItem("hidden_builtin_pathways", JSON.stringify(updated));
    setOpen(null);
  };

  const handleDelete = (pathway, idx, isCustom) => {
    if (isCustom) {
      const updated = customPathways.filter((_, i) => i !== idx);
      saveCustom(updated);
    } else {
      if (!confirm(`Hide "${pathway.name}" from the list? (Admin only, reversible via browser storage)`)) return;
      hideBuiltin(pathway.name);
    }
    setOpen(null);
  };

  const allPathways = [
    ...PATHWAYS.filter(p => !hiddenBuiltinIndices.includes(p.name))
      .map(p => builtinOverrides[p.name] ? { ...p, ...builtinOverrides[p.name] } : p),
    ...customPathways.map(p => ({ ...p, _isCustom: true }))
  ];

  const filtered = allPathways.filter(p => {
    const matchTag = filter === "All" || p.tag === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q) || p.summary?.toLowerCase().includes(q);
    return matchTag && matchSearch;
  });

  const engineList = filtered.filter(p => p.tag === "Engine");
  const emergencyList = filtered.filter(p => p.emergency && p.tag !== "Engine");
  const otherList = filtered.filter(p => !p.emergency && p.tag !== "Engine");

  const goToPathway = (scenario) => {
    navigate(`/ClinicalSupport?tab=pathways&scenario=${scenario}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-800 to-indigo-700 p-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            <div>
              <h2 className="text-base font-bold">Nephrology Clinical Pathways</h2>
              <p className="text-blue-100 text-xs">KDIGO · ISPN · IPNA · AAP · ISKDC — {allPathways?.length || PATHWAYS.length} pathways + Decision Engines</p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <button onClick={openAdd}
                className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-full border border-white/30 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
              <AdminPathwayGenerator specialty="Nephrology" onCreated={() => {}} />
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search pathways…"
        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      {/* Tag filter */}
      <div className="flex flex-wrap gap-1.5">
        {TAGS.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filter === t ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Intelligence Engines strip */}
      {engineList.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <GitBranch className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Intelligence Engines</span>
            <span className="text-xs bg-violet-600 text-white px-1.5 py-0.5 rounded-full font-bold">{engineList.length}</span>
          </div>
          <div className="space-y-1.5">
            {engineList.map((pathway, i) => {
              const custIdx = pathway._isCustom ? customPathways.findIndex(p => p.name === pathway.name) : -1;
              return <PathwayCard key={`eng-${i}`} pathway={pathway} idx={`eng-${i}`} open={open} setOpen={setOpen} goToPathway={goToPathway} isAdmin={isAdmin} onEdit={() => openEdit(pathway, custIdx, !!pathway._isCustom)} onDelete={() => handleDelete(pathway, custIdx, !!pathway._isCustom)} />;
            })}
          </div>
        </div>
      )}

      {/* Emergency strip */}
      {emergencyList.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Emergency Pathways</span>
          </div>
          <div className="space-y-1.5">
            {emergencyList.map((pathway, i) => {
              const custIdx = pathway._isCustom ? customPathways.findIndex(p => p.name === pathway.name) : -1;
              return <PathwayCard key={`e-${i}`} pathway={pathway} idx={`e-${i}`} open={open} setOpen={setOpen} goToPathway={goToPathway} isAdmin={isAdmin} onEdit={() => openEdit(pathway, custIdx, !!pathway._isCustom)} onDelete={() => handleDelete(pathway, custIdx, !!pathway._isCustom)} />;
            })}
          </div>
        </div>
      )}

      {/* Regular pathways */}
      {otherList.length > 0 && (
        <div className="space-y-1.5">
                {emergencyList.length > 0 && (
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">All Pathways</p>
          )}
          {otherList.map((pathway, i) => {
            const custIdx = pathway._isCustom ? customPathways.findIndex(p => p.name === pathway.name) : -1;
            return <PathwayCard key={`p-${i}`} pathway={pathway} idx={`p-${i}`} open={open} setOpen={setOpen} goToPathway={goToPathway} isAdmin={isAdmin} onEdit={() => openEdit(pathway, custIdx, !!pathway._isCustom)} onDelete={() => handleDelete(pathway, custIdx, !!pathway._isCustom)} />;
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No pathways match your search</p>
        </div>
      )}

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-3">
          <p className="text-xs font-bold text-slate-500 mb-1">References</p>
          <p className="text-xs text-slate-600">KDIGO 2021–2024 · ISPN Guidelines · IPNA Clinical Practice Recommendations · AAP 2017 BP · ISKDC Protocol · EULAR/ACR 2019 · KDOQI · ISPD 2022</p>
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-3 pb-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">{editModal.mode === "add" ? "Add New Pathway" : "Edit Pathway"}</h3>
              <button onClick={() => setEditModal(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Pathway Name *</label>
                <input value={editModal.pathway.name} onChange={e => setEditModal(m => ({ ...m, pathway: { ...m.pathway, name: e.target.value } }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="e.g. IgA Nephropathy" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tag</label>
                  <select value={editModal.pathway.tag} onChange={e => setEditModal(m => ({ ...m, pathway: { ...m.pathway, tag: e.target.value } }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
                    {["GN","AKI","CKD","Electrolyte","Tubular","Dialysis","Transplant","HTN","Diagnostic","Urological"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="emerg" checked={editModal.pathway.emergency} onChange={e => setEditModal(m => ({ ...m, pathway: { ...m.pathway, emergency: e.target.checked } }))} className="w-4 h-4" />
                  <label htmlFor="emerg" className="text-sm text-slate-600 font-medium">Emergency</label>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Summary</label>
                <textarea value={editModal.pathway.summary} onChange={e => setEditModal(m => ({ ...m, pathway: { ...m.pathway, summary: e.target.value } }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 h-16 resize-none" placeholder="Brief description" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Key Points (one per line)</label>
                <textarea value={editModal.pathway.keys.join("\n")} onChange={e => setEditModal(m => ({ ...m, pathway: { ...m.pathway, keys: e.target.value.split("\n") } }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 h-28 resize-none" placeholder="Key point 1&#10;Key point 2&#10;Key point 3" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
                  <Check className="w-3.5 h-3.5 mr-1" /> Save Pathway
                </Button>
                <Button onClick={() => setEditModal(null)} size="sm" variant="outline">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PathwayCard({ pathway, idx, open, setOpen, goToPathway, isAdmin, onEdit, onDelete }) {
  return (
    <Card className={`border-slate-200 shadow-sm ${pathway.tag === "Engine" ? "border-l-4 border-l-violet-500 bg-violet-50/30" : pathway.emergency ? "border-l-4 border-l-red-500" : ""} ${pathway._isCustom ? "border-l-4 border-l-amber-400" : ""}`}>
      <CardContent className="p-0">
        <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(open === idx ? null : idx)}>
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            {pathway.tag === "Engine" ? <GitBranch className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" /> : pathway.emergency ? <Zap className="w-3.5 h-3.5 text-red-500 flex-shrink-0" /> : null}
            <span className="font-semibold text-sm text-slate-800">{pathway.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pathway.color}`}>{pathway.tag}</span>
            {pathway.tag === "Engine" && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold border border-violet-300">AI Engine</span>}
            {pathway._isCustom && <span className="text-xs text-amber-600 font-medium">Custom</span>}
          </div>
          {open === idx ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />}
        </button>
        {open === idx && (
          <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-2">
            {pathway.summary && (
              <p className="text-xs text-slate-500 italic leading-relaxed">{pathway.summary}</p>
            )}
            <div className="space-y-1">
              {pathway.keys.filter(k => k.trim()).map((k, j) => (
                <div key={j} className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700">{k}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {pathway.scenario && (
                <Button size="sm" variant="outline"
                  className={`text-xs h-7 ${pathway.tag === "Engine" ? "border-violet-300 text-violet-700 hover:bg-violet-50 font-semibold" : "border-blue-200 text-blue-700 hover:bg-blue-50"}`}
                  onClick={() => goToPathway(pathway.scenario)}>
                  {pathway.tag === "Engine" ? <GitBranch className="w-3 h-3 mr-1" /> : <ExternalLink className="w-3 h-3 mr-1" />}
                  {pathway.tag === "Engine" ? "Launch Engine" : "Full Pathway"}
                </Button>
              )}
              {isAdmin && (
                <>
                  <Button size="sm" variant="outline"
                    className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50 h-7"
                    onClick={onEdit}>
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline"
                    className="text-xs border-red-200 text-red-600 hover:bg-red-50 h-7"
                    onClick={onDelete}>
                    <Trash2 className="w-3 h-3 mr-1" /> {pathway._isCustom ? "Delete" : "Hide"}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}