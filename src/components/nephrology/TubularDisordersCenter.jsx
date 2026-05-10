import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, FlaskConical, Dna, AlertTriangle } from "lucide-react";

const TUBULAR_CONDITIONS = [
  {
    id: "bartter",
    name: "Bartter Syndrome",
    types: ["Type I (NKCC2)", "Type II (ROMK)", "Type III (ClCKb)", "Type IV (Barttin)", "Type V (CaSR)"],
    physiology: "Defective Na-K-2Cl cotransporter (NKCC2) in thick ascending limb → Na/Cl wasting → secondary aldosteronism → hypokalemia + metabolic alkalosis. Prostaglandin E2 overproduction drives polyuria.",
    electrolyte_pattern: "Hypokalemia (often severe, <2.5), metabolic alkalosis (HCO3 >30), hypochloremia, normal/low BP (despite high renin+aldosterone), hypomagnesemia (Type III), hypercalciuria→nephrocalcinosis",
    diagnostic_clues: ["Polyuria + polydipsia from infancy/childhood", "Short stature + failure to thrive", "Salt craving", "Normal/low BP despite high renin/aldosterone (key differentiator from primary aldosteronism)", "Antenatal polyhydramnios (Type I/II/IV — severe neonatal form)", "Nephrocalcinosis (Type I/II — hypercalciuria)"],
    investigations: ["Serum K+, Na+, Cl, bicarb, Mg2+, Ca2+", "Urine K/Cr ratio, Cl, Ca/Cr ratio", "Plasma renin activity + aldosterone (both elevated)", "TTKG >10 (renal K wasting)", "Renal USS (nephrocalcinosis)", "Genetic panel: KCNJ1, SLC12A1, CLCNKB, BSND, CASR"],
    urine_interpretation: ["Urine Cl >20 mEq/L (renal Cl wasting — unlike GI loss)", "Urine K elevated (renal K wasting)", "Urine Ca/Cr elevated (hypercalciuria in Type I/II)", "FECl >0.5% (renal chloride wasting)"],
    management: ["KCl supplementation 2–4 mEq/kg/day (titrate to K+)", "Spironolactone/amiloride (K-sparing + anti-aldosterone)", "Indomethacin 1–3 mg/kg/day (reduces PGE2) — effective in most types", "Mg supplementation if hypomagnesaemia (Type III)", "Close monitoring for nephrocalcinosis"],
    monitoring: ["K+, Mg2+, bicarb q1–3 months", "Renal USS annually (nephrocalcinosis)", "Growth velocity + bone age", "Urine Ca/Cr q6 months"],
    genetics: "KCNJ1 (Type II), SLC12A1 (Type I), CLCNKB (Type III), BSND (Type IV), CASR activating (Type V). AR inheritance except Type V (AD).",
    refs: ["KDIGO CKD 2024", "ESPN Tubular Disorders", "Kleta & Bockenhauer 2018 Nat Rev Nephrol"],
  },
  {
    id: "gitelman",
    name: "Gitelman Syndrome",
    types: ["Classic Gitelman (SLC12A3)", "Gitelman-like (CLCNKB)"],
    physiology: "Defective NaCl cotransporter (NCC) in distal convoluted tubule → NaCl wasting → secondary aldosteronism → hypokalemia + metabolic alkalosis + hypomagnesaemia + hypocalciuria (DCT reabsorbs Ca2+ well).",
    electrolyte_pattern: "Hypokalemia, metabolic alkalosis, hypomagnesaemia (hallmark — DCT Mg handling impaired), hypocalciuria (distinguishes from Bartter), normal-low BP",
    diagnostic_clues: ["Usually presents in adolescence/adulthood (milder than Bartter)", "Muscle cramps, fatigue, palpitations, constipation", "Chondrocalcinosis (Mg-pyrophosphate crystals in joints)", "No nephrocalcinosis", "Urine Ca very LOW (hypocalciuria — key differentiator from Bartter)"],
    investigations: ["Serum K+, Mg2+, bicarb, Ca2+", "Urine Ca/Cr ratio (LOW — <0.15)", "Plasma renin + aldosterone (elevated)", "24h urine K excretion", "Genetic: SLC12A3 (NCCT gene)"],
    urine_interpretation: ["Urine Ca/Cr <0.15 (hypocalciuria — diagnostic)", "Urine Mg elevated (renal Mg wasting)", "Urine K elevated (renal K wasting)", "TTKG >7 (renal K loss)"],
    management: ["KCl supplementation (may need large amounts — 80–100 mEq/day)", "Oral Mg oxide/citrate 10–15 mg/kg/day (difficult to tolerate)", "Spironolactone / amiloride (K-sparing)", "Indomethacin: less effective than in Bartter; avoid if possible", "ACEi/ARB: reduce aldosterone-driven K loss"],
    monitoring: ["K+, Mg2+ monthly initially then q3 months", "Avoid prolonged QT interval (Mg-QT interaction)", "ECG if symptomatic (palpitations)"],
    genetics: "SLC12A3 (NCC gene) — AR inheritance. Often compound heterozygous.",
    refs: ["KDIGO 2024", "Blanchard 2017 Kidney Int Suppl"],
  },
  {
    id: "drta",
    name: "Distal RTA (Type 1)",
    types: ["Primary (genetic)", "Secondary (SLE, Sjögren's, medullary sponge, drugs)"],
    physiology: "Failure of alpha-intercalated cells in collecting duct to excrete H+ → urine cannot acidify below pH 5.5 despite severe systemic acidosis. Result: NAGMA + hypokalemia + nephrocalcinosis.",
    electrolyte_pattern: "Normal anion gap metabolic acidosis (NAGMA), hypokalemia (worsens with acidosis), hypercalciuria (Ca mobilised from bone to buffer acid), nephrocalcinosis, nephrolithiasis",
    diagnostic_clues: ["Urine pH >5.5 despite systemic acidosis (serum pH <7.35, bicarb <20)", "Nephrocalcinosis on USS (medullary) — calcium phosphate stones", "Growth retardation in children", "Rickets / osteomalacia", "Family history (AR or AD forms)"],
    investigations: ["Serum HCO3, K+, Ca2+, phosphate", "Urine pH (>5.5 = dRTA)", "Urine anion gap (positive = impaired NH4+ excretion)", "Urine Ca/Cr (elevated)", "Renal USS (nephrocalcinosis)", "ANA, anti-Ro/La (if secondary SLE/Sjögren's)", "Genetic: ATP6V1B1, ATP6V0A4, SLC4A1"],
    urine_interpretation: ["Urine pH consistently >5.5 (cannot acidify)", "Urine anion gap strongly positive (+ve)", "Elevated urine Ca (hypercalciuria)", "Urine citrate LOW (no organic anion to chelate Ca → stones)"],
    management: ["Sodium bicarbonate or potassium citrate 1–3 mEq/kg/day (correct bicarb to >22)", "Potassium citrate: provides K+ + alkali + citrate (anti-stone)", "Treat underlying cause if secondary", "Thiazide diuretic: reduces hypercalciuria"],
    monitoring: ["Serum K+, bicarb q3 months", "Renal USS annually", "Urine Ca/Cr q6 months", "Growth + bone density"],
    genetics: "ATP6V1B1 (with sensorineural deafness), ATP6V0A4 (without deafness), SLC4A1 (AE1 — mild form, AD); AR mutations severe, AD mutations mild.",
    refs: ["KDIGO CKD 2024", "Walsh 2018 Pediatr Nephrol"],
  },
  {
    id: "prta",
    name: "Proximal RTA (Type 2)",
    types: ["Isolated (SLC4A4 mutations)", "Fanconi syndrome (generalised PTD)", "Carbonic anhydrase II deficiency"],
    physiology: "Failure of proximal tubule to reabsorb HCO3 → bicarb wasting when serum HCO3 normal, but CAN acidify urine once plasma HCO3 falls below renal threshold (~15 mEq/L). Coexists with Fanconi if generalised proximal tubule dysfunction.",
    electrolyte_pattern: "NAGMA, hypokalemia, hypophosphatemia (if Fanconi), aminoaciduria, glycosuria, uricosuria (Fanconi). HCO3 threshold set LOW (~15 mEq/L).",
    diagnostic_clues: ["Urine pH <5.5 when serum HCO3 is low (tubule CAN acidify — differentiates from Type 1)", "Large bicarb supplements needed (bicarbonate wasting)", "If Fanconi: glycosuria (normal blood glucose), aminoaciduria, phosphaturia", "Rickets (phosphate wasting)", "Ocular anomalies (CA-II deficiency: osteopetrosis + cerebral calcification)"],
    investigations: ["Serum HCO3, K+, PO4, Ca2+, glucose", "Urine glucose (glycosuria + normal blood glucose)", "Urine amino acids (aminoaciduria)", "TmP/GFR (renal phosphate threshold — low in Fanconi)", "Genetic: SLC4A4, CA2"],
    urine_interpretation: ["Urine pH <5.5 at low serum HCO3 (can acidify — key differentiator)", "Glycosuria + normal serum glucose (proximal tubule failure)", "Phosphaturia: TRP <85%, TmP/GFR <0.65", "FEBicarb >15% (massive bicarb wasting at normal serum levels)"],
    management: ["Sodium bicarbonate 5–15 mEq/kg/day (high doses needed — bicarb wasting)", "Potassium citrate preferred (provides K+ + alkali)", "Phosphate replacement (Joulie solution): 1–3 mmol/kg/day if Fanconi", "Vitamin D: Calcitriol 0.05 mcg/kg/day (activation impaired)", "Treat underlying cause (cystinosis: cysteamine; Wilson's: penicillamine; galactosaemia: diet)"],
    monitoring: ["Bicarb, K+, PO4 q1–3 months", "Urine glucose + protein q3 months", "TmP/GFR q6 months", "Growth + bone X-ray (rickets)"],
    genetics: "SLC4A4 (NBCe1) — AR, severe; Fanconi causes: CTNS (cystinosis), ATP7B (Wilson), GALT (galactosaemia), OCRL (Lowe syndrome), mitochondrial.",
    refs: ["KDIGO CKD 2024", "Kleta 2018"],
  },
  {
    id: "fanconi",
    name: "Fanconi Syndrome",
    types: ["Cystinosis (commonest genetic)", "Wilson disease", "Galactosaemia", "Tyrosinaemia", "Lowe syndrome", "Ifosfamide toxicity"],
    physiology: "Generalised proximal tubule dysfunction → failure to reabsorb glucose, amino acids, phosphate, uric acid, HCO3, K+ → all lost in urine despite normal serum levels.",
    electrolyte_pattern: "Glycosuria (normal glucose), aminoaciduria, phosphaturia (TRP <85%), HCO3 wasting (low bicarb threshold), hypokalemia, hypouricaemia (uric acid wasting), all simultaneously",
    diagnostic_clues: ["Rickets + short stature (phosphate wasting + Vitamin D activation failure)", "Polyuria + polydipsia", "Glucose in urine with normal blood glucose (pathognomonic combination)", "Cystinosis: photophobia (corneal crystals), hypothyroidism, neuromuscular", "Lowe: cataracts, glaucoma, intellectual disability"],
    investigations: ["Urine spot: glucose, amino acids, phosphate, uric acid, K+ (all elevated)", "TRP, TmP/GFR (low)", "Serum: K+, PO4, bicarb, uric acid (all low)", "Slit lamp exam (cystinosis corneal crystals)", "White cell cystine (cystinosis diagnosis)", "Genetic: CTNS, ATP7B, GALT, OCRL, CLCN5"],
    urine_interpretation: ["Renal glycosuria (urine glucose+ with blood glucose <7 mmol/L)", "Aminoaciduria: multiple amino acids in urine", "FEPhos >20% or TRP <85% (phosphaturia)", "FEUrate >12% (urate wasting)", "FEBicarb >15% (bicarb wasting)"],
    management: ["Treat underlying cause (cystinosis: cysteamine; Wilson: chelation)", "K+ supplementation", "Phosphate: Joulie's solution 1–3 mmol/kg/day in divided doses", "Calcitriol 0.25–0.5 mcg/day (activated Vit D — tubule cannot activate 25-OH)", "Sodium bicarbonate/citrate for acidosis"],
    monitoring: ["Serum K+, PO4, bicarb, uric acid q1–3 months", "Urine glucose + protein monthly", "Bone X-ray (rickets) + DEXA annually", "Growth velocity q3 months"],
    genetics: "CTNS (cystinosis — AR, commonest genetic cause). OCRL (Lowe — XL). CLCN5 (Dent 1 — XL). ATP7B (Wilson — AR). GALT (galactosaemia — AR).",
    refs: ["IPNA Tubular Disorders", "Nesterova 2017 Pediatr Nephrol"],
  },
  {
    id: "ndi",
    name: "Nephrogenic DI (NDI)",
    types: ["X-linked (AVPR2 — V2R)", "Autosomal (AQP2)", "Acquired (lithium, hypercalcaemia, hypokalemia)"],
    physiology: "Collecting duct fails to respond to ADH/vasopressin → inability to concentrate urine → massive water diuresis + hypernatraemia risk. V2R pathway: AVPR2→Gs→cAMP→PKA→AQP2 insertion (all steps can be blocked).",
    electrolyte_pattern: "Dilute urine (Uosm <200), hypernatraemia (if free water not replaced), normal serum ADH (elevated — compensatory), no response to DDAVP",
    diagnostic_clues: ["Polyuria >5–10 mL/kg/hr from infancy", "Hypernatraemia episodes (failure to provide adequate free water)", "Failure to thrive", "Hydronephrosis/megabladder (massive urine volume)", "Family history: X-linked (male affected, female carrier)"],
    investigations: ["Urine osmolality (<200 mOsm/kg before and after DDAVP)", "Serum ADH (elevated)", "DDAVP test: no response (Uosm does not rise >50%)", "Water deprivation test: urine does NOT concentrate", "Renal USS (hydroureteronephrosis from high urine flow)", "Genetic: AVPR2, AQP2"],
    urine_interpretation: ["Urine Uosm persistently <200 mOsm/kg", "No response to DDAVP (Uosm fails to rise significantly)", "Urine Na low (dilute urine)", "Large volumes of dilute urine"],
    management: ["Free water supplementation (key to prevent hypernatraemia)", "Low-osmolar, low-sodium diet (reduce obligate solute load → reduces urine volume)", "Hydrochlorothiazide 1–2 mg/kg/day (paradoxical reduction in urine volume via volume contraction → enhanced proximal tubule reabsorption)", "Amiloride: add for lithium-induced NDI (blocks Li+ entry via ENaC)", "Indomethacin: reduces urine volume (reduces GFR + prostaglandin-mediated diuresis)"],
    monitoring: ["Serum Na+, Uosm q3 months", "Renal USS (dilatation) q6–12 months", "Growth (significant impact)"],
    genetics: "AVPR2 (V2R gene — X-linked, males severely affected); AQP2 (AR or AD). Acquired: check medications (lithium, demeclocycline, amphotericin).",
    refs: ["Bockenhauer 2015 Pediatr Nephrol", "Bichet 2023 Nat Rev Nephrol"],
  },
  {
    id: "cystinuria",
    name: "Cystinuria",
    types: ["Type A (SLC3A1)", "Type B (SLC7A9)", "Type AB (compound)"],
    physiology: "Defective dibasic amino acid transporter (rBAT/BAT1 — cystine, ornithine, arginine, lysine) in proximal tubule and GI tract → cystinuria → cystine stone formation (poorly soluble in acid urine).",
    electrolyte_pattern: "Normal electrolytes. Isolated cystinuria — no metabolic acidosis, no other tubular defect. Urine: cystinuria + dibasic aminoaciduria.",
    diagnostic_clues: ["Recurrent kidney stones from childhood", "Hexagonal (honeycomb) crystals on microscopy (PATHOGNOMONIC)", "Family history of stones", "Positive cyanide-nitroprusside test (qualitative urine cystine)", "Staghorn calculi (can cause CKD)"],
    investigations: ["Spot urine cystine (>250 mg/g Cr = significant)", "24h urine cystine (>250 mg/day = high risk)", "Urine microscopy: hexagonal crystals", "Renal USS / CT (stones)", "Genetic: SLC3A1, SLC7A9"],
    urine_interpretation: ["Cystinuria >250 mg/g Cr (quantitative cystine)", "Hexagonal flat crystals on microscopy", "Dibasic aminoaciduria (lysine, arginine, ornithine also elevated)", "Urine pH usually acidic (worsens cystine solubility)"],
    management: ["High fluid intake (>3L/m²/day or urine volume >2L/m²/day)", "Urine alkalinisation: K+ citrate target pH 7.0–7.5 (cystine dissolves better)", "Tiopronin (preferred — fewer side effects) or D-penicillamine: chelate cystine", "Low methionine diet (reduces cystine precursor)", "Urological intervention for obstructing stones (lithotripsy, PCNL)"],
    monitoring: ["24h urine cystine q6–12 months", "Renal USS + KUB q6 months", "Renal function (CKD risk from recurrent stones/obstruction)"],
    genetics: "SLC3A1 (rBAT heavy chain — Type A, AR); SLC7A9 (BAT1 light chain — Type B, AR/AD).",
    refs: ["Assimos 2022 AUA Guidelines", "Chillarón 2010 Physiol Rev"],
  },
  {
    id: "hyperoxaluria",
    name: "Primary Hyperoxaluria (PH)",
    types: ["PH1 (AGXT — Liver alanine:glyoxylate aminotransferase)", "PH2 (GRHPR)", "PH3 (HOGA1)"],
    physiology: "Defective hepatic glyoxylate metabolism → massive oxalate overproduction → calcium oxalate (CaOx) crystal deposition in kidneys + systemic organs (oxalosis). PH1 is most severe — liver transplant curative.",
    electrolyte_pattern: "Normal electrolytes. Urine: massive oxaluria (>1 mmol/1.73m²/day), CaOx crystals. Serum oxalate elevated when eGFR falls → systemic oxalosis.",
    diagnostic_clues: ["Recurrent CaOx kidney stones or nephrocalcinosis in childhood", "CaOx in bone, heart, eyes, skin (oxalosis — late sign)", "Progressive CKD from childhood", "AKI from CaOx crystal deposits (dense bilateral nephrocalcinosis)"],
    investigations: ["24h urine oxalate (>1 mmol/1.73m²/day)", "Urine glycolate (PH1), L-glycerate (PH2), 2-oxoglutarate (PH3)", "Plasma oxalate (elevated in CKD with PH)", "Kidney biopsy: CaOx crystals (birefringent under polarised light)", "Liver biopsy: AGXT enzyme activity (PH1)", "Genetic: AGXT, GRHPR, HOGA1 — essential before treatment"],
    urine_interpretation: ["Urine oxalate >1 mmol/1.73m²/day (normal <0.5)", "Urine glycolate elevated (PH1)", "Urine Ca + oxalate both high (CaOx supersaturation)"],
    management: ["PH1: Lumasiran (RNA-i, AGXT-targeted) — FDA approved 2020 — reduces urinary oxalate >80%; game-changer", "High fluid intake >3L/m²/day", "Potassium citrate (urine alkalinisation + citrate complexes Ca)", "Pyridoxine (vitamin B6): in AGXT-pyridoxine responsive variant (25–50% of PH1)", "Intensive HD + liver transplant for end-stage PH1 (liver first or combined liver-kidney)", "PH2/PH3: milder, no curative transplant; manage supportively"],
    monitoring: ["Plasma oxalate, 24h urine oxalate q3 months", "eGFR monthly in declining disease", "Renal USS + bone survey (oxalosis)", "After lumasiran: 24h urine oxalate to monitor response"],
    genetics: "AGXT (AR), GRHPR (AR), HOGA1 (AR). Genetic testing before any treatment essential — determines lumasiran eligibility.",
    refs: ["EAU PH Guidelines 2023", "PDOSS Trial (Lumasiran 2021)", "IPNA PH Position 2022"],
  },
  {
    id: "dent",
    name: "Dent Disease",
    types: ["Dent 1 (CLCN5 — XL)", "Dent 2 (OCRL — XL, Lowe spectrum)"],
    physiology: "Loss-of-function of ClC-5 chloride channel (endosomal) in proximal tubule → defective receptor-mediated endocytosis → LMW proteinuria + hypercalciuria + Fanconi features → progressive CKD.",
    electrolyte_pattern: "Low-molecular-weight proteinuria (β2-microglobulin, retinol binding protein), hypercalciuria, hypophosphatemia, aminoaciduria, nephrocalcinosis/stones. Serum electrolytes often normal.",
    diagnostic_clues: ["Low-molecular-weight proteinuria (unusual type of protein — β2-MG)", "Hypercalciuria without hypercalcaemia", "Males primarily affected (X-linked)", "Nephrocalcinosis/nephrolithiasis", "Progressive CKD (to ESKD in 30–50% by 30–50y)"],
    investigations: ["Urine β2-microglobulin (elevated — LMW proteinuria)", "Urine Ca/Cr (elevated)", "Urine PCR (proteinuria — LMW)", "Serum PO4, K+", "Renal USS (nephrocalcinosis/stones)", "Genetic: CLCN5 (Dent 1), OCRL (Dent 2)"],
    urine_interpretation: ["LMW proteinuria: β2-MG/retinol-binding protein dominant (not albumin)", "Urine Ca/Cr >0.6 (hypercalciuria)", "Variable: glycosuria, aminoaciduria, phosphaturia"],
    management: ["No specific disease-modifying therapy", "ACEi/ARB: reduce proteinuria", "Thiazide diuretics: reduce hypercalciuria", "Potassium citrate: prevent CaOx stones + alkalinise urine", "Restrict dietary Ca within normal limits (high Ca supplements worsen hypercalciuria)", "Monitor for CKD progression — ESKD referral"],
    monitoring: ["Urine β2-MG, Ca/Cr q6 months", "Renal function q6–12 months", "Renal USS (nephrocalcinosis) annually"],
    genetics: "CLCN5 (ClC-5 gene — X-linked, males severely affected, females occasionally). OCRL (Dent 2 — also causes Lowe syndrome when OCRL completely absent).",
    refs: ["Bhatt 2020 Pediatr Nephrol", "KDIGO CKD 2024"],
  },
  {
    id: "liddle",
    name: "Liddle Syndrome",
    types: ["SCNN1B/G (ENaC beta/gamma subunit)"],
    physiology: "Gain-of-function mutation in ENaC (epithelial sodium channel, beta or gamma subunit) → constitutive Na+ retention in collecting duct → hypertension + hypokalemia + suppressed renin AND aldosterone (pseudo-hyperaldosteronism).",
    electrolyte_pattern: "Hypertension (early onset, severe), hypokalemia, metabolic alkalosis, SUPPRESSED renin AND aldosterone (unlike primary hyperaldosteronism where aldosterone is high)",
    diagnostic_clues: ["Early-onset severe hypertension in child/adolescent", "Hypokalemia + metabolic alkalosis", "Low plasma renin + low aldosterone (key: aldosterone NOT high — distinguishes from primary aldosteronism)", "Family history of early hypertension, stroke, MI", "No response to spironolactone (aldosterone receptor not involved)"],
    investigations: ["Serum K+, bicarb", "Plasma renin + aldosterone (both LOW)", "Aldosterone:renin ratio (low)", "Trial of amiloride vs spironolactone (amiloride works, spiro does NOT)", "Genetic: SCNN1B, SCNN1G (PY-motif deletion)"],
    urine_interpretation: ["Urine Na low (avid Na retention)", "Urine K elevated (renal K wasting from ENaC-driven K secretion in CD)"],
    management: ["Amiloride 5–10 mg/day (direct ENaC blocker — highly effective) OR Triamterene", "Low sodium diet", "NOT spironolactone (does not block ENaC — ineffective in Liddle)"],
    monitoring: ["BP monthly initially, then q3 months", "Serum K+ q3 months", "Renal function annually"],
    genetics: "SCNN1B or SCNN1G (ENaC beta/gamma subunit) — AD inheritance (dominant gain-of-function mutation).",
    refs: ["Liddle original 1963", "Rossier 2015 J Am Soc Nephrol"],
  },
  {
    id: "pha",
    name: "Pseudohypoaldosteronism (PHA)",
    types: ["PHA Type 1A (renal — NR3C2/MLR)", "PHA Type 1B (systemic — SCNN1A/B/G loss-of-function)", "PHA Type 2 (Gordon — WNK1/WNK4/KLHL3/CUL3)"],
    physiology: "PHA1: Aldosterone resistance (normal/high aldosterone, no effect). PHA2 (Gordon): WNK kinase gain-of-function → excessive NaCl reabsorption + impaired K+ secretion → hyperkalemia + hypertension (opposite to Gitelman).",
    electrolyte_pattern: "PHA1: Hyponatraemia + HYPERKALEMIA + metabolic acidosis + elevated aldosterone. PHA2: Hypertension + Hyperkalemia + metabolic acidosis + SUPPRESSED renin/aldosterone.",
    diagnostic_clues: ["PHA1A (renal): urinary salt wasting + hyperkalemia in neonate, normal after age 2–3", "PHA1B (systemic): severe multisystem; persists lifelong; salt crisis; sweat/saliva Na elevated", "PHA2 (Gordon): resistant hypertension + hyperkalemia in adolescent/adult"],
    investigations: ["Serum Na+, K+, bicarb", "Plasma renin + aldosterone (PHA1: both high; PHA2: both low)", "Urine Na (high in PHA1 — salt wasting)", "Genetic: NR3C2, SCNN1A/B/G (PHA1); WNK1, WNK4, KLHL3, CUL3 (PHA2)"],
    urine_interpretation: ["PHA1: Urine Na high (can't respond to aldosterone → salt wasting)", "PHA2: Urine Na low (NCC over-active → avid reabsorption)"],
    management: ["PHA1A: NaCl supplementation (5–10 mEq/kg/day) + correct K+ — usually self-limited by age 2–3", "PHA1B: Lifelong high-dose NaCl + K-binding resin (patiromer/SZC) for hyperkalemia", "PHA2: Thiazide diuretics (inhibit WNK-driven NCC activation) — highly effective"],
    monitoring: ["Serum K+, Na+ weekly in neonates, q3 months once stable", "Growth and development (PHA1B)"],
    genetics: "NR3C2 (mineralocorticoid receptor — AD, renal form); SCNN1A/B/G (ENaC — AR, systemic form); WNK1/WNK4/KLHL3/CUL3 (PHA2 — AD).",
    refs: ["Scheinman 1999", "Wilson 2001 Nat Genet (WNK)"],
  },
];

const SECTION_COLORS = {
  physiology: "bg-blue-50 border-blue-200 text-blue-900",
  electrolyte_pattern: "bg-amber-50 border-amber-200 text-amber-900",
  diagnostic_clues: "bg-indigo-50 border-indigo-200 text-indigo-900",
  investigations: "bg-teal-50 border-teal-200 text-teal-900",
  urine_interpretation: "bg-cyan-50 border-cyan-200 text-cyan-900",
  management: "bg-green-50 border-green-200 text-green-900",
  monitoring: "bg-purple-50 border-purple-200 text-purple-900",
  genetics: "bg-rose-50 border-rose-200 text-rose-900",
};

const TABS = [
  { id: "overview", label: "📋 Overview" },
  { id: "electrolytes", label: "⚗️ Electrolytes" },
  { id: "investigations", label: "🔬 Investigations" },
  { id: "management", label: "💊 Management" },
  { id: "genetics", label: "🧬 Genetics" },
];

function TubularCard({ condition }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("overview");

  return (
    <Card className="bg-white border-2 border-cyan-100 hover:border-cyan-300 transition-colors">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <FlaskConical className="w-4 h-4 text-cyan-600" />
              <span className="font-bold text-sm text-slate-900">{condition.name}</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {condition.types?.slice(0, 2).map(t => (
                <Badge key={t} className="text-xs bg-cyan-100 text-cyan-800 border-0">{t}</Badge>
              ))}
            </div>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-3">
          <div className="flex gap-1 flex-wrap border-b pb-2">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${tab === t.id ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-2">
              <div className={`rounded-lg p-2.5 border ${SECTION_COLORS.physiology}`}>
                <p className="text-xs font-bold mb-1">Nephron Physiology</p>
                <p className="text-xs">{condition.physiology}</p>
              </div>
              {condition.diagnostic_clues?.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 bg-indigo-50 border border-indigo-100 rounded">
                  <span className="font-bold text-indigo-600 flex-shrink-0">{i + 1}.</span>{c}
                </div>
              ))}
            </div>
          )}

          {tab === "electrolytes" && (
            <div className="space-y-2">
              <div className={`rounded-lg p-2.5 border ${SECTION_COLORS.electrolyte_pattern}`}>
                <p className="text-xs font-bold mb-1">Electrolyte Pattern</p>
                <p className="text-xs">{condition.electrolyte_pattern}</p>
              </div>
              <div className={`rounded-lg p-2.5 border ${SECTION_COLORS.urine_interpretation}`}>
                <p className="text-xs font-bold mb-1">Urine Electrolyte Interpretation</p>
                {condition.urine_interpretation?.map((u, i) => (
                  <p key={i} className="text-xs">• {u}</p>
                ))}
              </div>
            </div>
          )}

          {tab === "investigations" && (
            <div className="space-y-1.5">
              {condition.investigations?.map((inv, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 bg-teal-50 border border-teal-100 rounded">
                  <span className="font-bold text-teal-600 flex-shrink-0">{i + 1}.</span>{inv}
                </div>
              ))}
            </div>
          )}

          {tab === "management" && (
            <div className="space-y-2">
              {condition.management?.map((m, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 bg-green-50 border border-green-100 rounded">
                  <span className="font-bold text-green-600 flex-shrink-0">{i + 1}.</span>{m}
                </div>
              ))}
              <div className={`rounded-lg p-2.5 border ${SECTION_COLORS.monitoring}`}>
                <p className="text-xs font-bold mb-1">Monitoring</p>
                {condition.monitoring?.map((m, i) => <p key={i} className="text-xs">• {m}</p>)}
              </div>
            </div>
          )}

          {tab === "genetics" && (
            <div className="space-y-2">
              <div className={`rounded-lg p-2.5 border ${SECTION_COLORS.genetics}`}>
                <p className="text-xs font-bold mb-1 flex items-center gap-1"><Dna className="w-3 h-3" />Genetics</p>
                <p className="text-xs">{condition.genetics}</p>
              </div>
              <p className="text-xs text-slate-400">📚 {condition.refs?.join(" · ")}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function TubularDisordersCenter() {
  const [search, setSearch] = useState("");
  const filtered = TUBULAR_CONDITIONS.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.electrolyte_pattern?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <Alert className="bg-cyan-50 border-cyan-200">
        <FlaskConical className="w-4 h-4 text-cyan-600" />
        <AlertDescription className="text-xs text-cyan-900">
          <strong>Tubular Disorders Centre:</strong> {TUBULAR_CONDITIONS.length} conditions — nephron physiology, electrolyte patterns, urine electrolyte interpretation, genetic testing, management.
        </AlertDescription>
      </Alert>
      <div className="relative">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tubular disorders..."
          className="w-full text-xs border-2 rounded-xl px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
        <FlaskConical className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-400" />
      </div>
      <p className="text-xs text-slate-400">{filtered.length} conditions</p>
      {filtered.map(c => <TubularCard key={c.id} condition={c} />)}
    </div>
  );
}