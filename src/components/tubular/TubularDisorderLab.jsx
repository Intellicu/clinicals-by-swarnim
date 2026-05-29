import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TestTube, ChevronDown, ChevronUp, ArrowRight, Brain, Loader2, AlertTriangle, Zap, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

// ─── Rich condition data ────────────────────────────────────────────────────
const TUBULAR_CONDITIONS = [
  // ── RTA ──────────────────────────────────────────────────────────────────
  {
    name: "Distal RTA (Type 1 dRTA)", tag: "RTA", color: "bg-blue-100 text-blue-800", emergency: false,
    summary: "Failure to acidify urine below pH 5.5 despite systemic acidosis. Hallmark: urine pH >5.5 + positive UAG + hypokalemia + nephrocalcinosis.",
    sections: [
      { heading: "Diagnostic Criteria", points: [
        "Serum HCO₃ <22 mEq/L (NAGMA) + urine pH >5.5 during spontaneous acidosis",
        "Urine anion gap (UAG = uNa + uK − uCl) = POSITIVE (NH₄⁺ excretion impaired)",
        "Urine−blood PCO₂ gradient <20 mmHg (distal acidification failure)",
        "Fractional HCO₃ excretion NORMAL (<5%)",
        "Hypokalemia (urine K wasting from distal H⁺/K⁺ exchanger dysfunction)",
        "Nephrocalcinosis on renal USS (calcium deposits in medulla)",
      ]},
      { heading: "Genetic Forms", points: [
        "ATP6V1B1 (AR): dRTA + sensorineural hearing loss — ATPase proton pump subunit",
        "ATP6V0A4 (AR): dRTA ± late-onset hearing loss",
        "SLC4A1 (AD or AR): band 3 anion exchanger — AD more common in Southeast Asia",
        "FOXI1 (AR): rare, severe early-onset with deafness",
        "CAII (AR): combined proximal + distal RTA + osteopetrosis + cerebral calcification",
      ]},
      { heading: "Secondary Causes", points: [
        "Autoimmune: Sjögren syndrome (most common in adults), SLE, thyroiditis",
        "Drugs: amphotericin B (most important), lithium, ifosfamide, toluene",
        "Obstructive uropathy, sickle cell nephropathy, medullary sponge kidney",
        "Hypercalciuria/nephrocalcinosis itself (can cause dRTA)",
        "Chronic pyelonephritis, renal transplant rejection",
      ]},
      { heading: "Treatment Protocol", points: [
        "Sodium bicarbonate: 1–3 mEq/kg/day in 3–4 divided doses (titrate to normal bicarb)",
        "Children may need higher doses (1–5 mEq/kg/day) due to ongoing growth demands",
        "Potassium supplementation: K citrate preferred (also treats hypocitraturia)",
        "Potassium citrate 1–4 mEq/kg/day corrects BOTH hypokalemia AND acidosis",
        "Monitor: serum electrolytes, urine calcium, citrate, renal USS annually",
        "Vitamin D & calcium if nephrocalcinosis-related secondary HPT",
        "Goal: normalize HCO₃, prevent nephrocalcinosis progression, protect GFR",
      ]},
      { heading: "Complications if Untreated", points: [
        "Progressive nephrocalcinosis → CKD",
        "Recurrent nephrolithiasis (calcium phosphate stones — alkaline urine favors them)",
        "Growth failure (chronic acidosis inhibits GH axis and bone mineralization)",
        "Osteomalacia/rickets from bone buffering of chronic acidosis",
        "Hypokalemic paralysis in severe cases",
      ]},
    ],
  },
  {
    name: "Proximal RTA (Type 2 pRTA)", tag: "RTA", color: "bg-cyan-100 text-cyan-800", emergency: false,
    summary: "Defective HCO₃ reabsorption in proximal tubule. HCO₃ threshold lowered. Associated with Fanconi syndrome.",
    sections: [
      { heading: "Diagnostic Features", points: [
        "NAGMA + urine pH VARIABLE (acidic once filtered load drops below threshold)",
        "Fractional excretion of HCO₃ >15% (key differentiator from dRTA)",
        "Urine can acidify normally when serum HCO₃ is very low (<14–15 mEq/L)",
        "UAG can be negative (NH₄⁺ excretion preserved when serum HCO₃ is very low)",
        "Hypokalemia (worsens with bicarbonate treatment — drives K into cells)",
        "Often part of Fanconi syndrome: glycosuria, phosphaturia, aminoaciduria, uricosuria",
      ]},
      { heading: "Causes", points: [
        "Primary (rare): isolated pRTA or with Fanconi",
        "Cystinosis — most common cause of Fanconi syndrome + pRTA in children",
        "Lowe syndrome (OCRL1 gene): pRTA + cataracts + intellectual disability",
        "Wilson disease: copper deposition in proximal tubule",
        "Galactosemia, fructosemia, tyrosinemia type 1: metabolic causes",
        "Ifosfamide nephrotoxicity (most common iatrogenic in pediatrics)",
        "Heavy metals: lead, cadmium, mercury poisoning",
        "Carbonic anhydrase inhibitors (acetazolamide)",
        "Multiple myeloma (light chains — adult cause)",
      ]},
      { heading: "Fanconi Syndrome Features", points: [
        "Glucosuria with normal blood glucose (proximal tubule glucose reabsorption failure)",
        "Phosphaturia → hypophosphatemia → rickets/osteomalacia",
        "Aminoaciduria (generalized) — multiple amino acids",
        "Uricosuria → hypouricemia (serum uric acid LOW — useful clue)",
        "Proteinuria (low molecular weight) — β2-microglobulin, RBP",
        "Polyuria, polydipsia (loss of concentrating ability)",
        "Growth failure, rickets — prominent in cystinosis",
      ]},
      { heading: "Treatment", points: [
        "HIGH-dose bicarbonate required: 10–25 mEq/kg/day (much more than dRTA)",
        "Paradox: treatment worsens hypokalemia — always co-supplement potassium",
        "Thiazide diuretics: reduce urine volume and paradoxically improve HCO₃ handling",
        "Phosphate supplements + active Vit D for hypophosphatemic rickets component",
        "Treat underlying cause (e.g., cysteamine for cystinosis, chelation for Wilson)",
        "Ifosfamide-induced: supportive, may partially recover",
      ]},
    ],
  },
  {
    name: "Type 4 RTA (Hyperkalemic RTA)", tag: "RTA", color: "bg-amber-100 text-amber-800", emergency: false,
    summary: "Hypoaldosteronism or aldosterone resistance → hyperkalemia + mild NAGMA. Urine CAN be acidified (<5.5). Most common RTA type in adults.",
    sections: [
      { heading: "Key Features", points: [
        "NAGMA + HYPERKALEMIA (unique — all other RTAs cause hypokalemia)",
        "Urine pH <5.5 (distal acidification intact — distinguishes from dRTA)",
        "Urine anion gap may be positive (NH₄⁺ reduced due to low aldosterone, not defective pump)",
        "Mild acidosis (HCO₃ rarely <18 mEq/L)",
        "Hyperkalemia suppresses NH₃ synthesis → reduced ammoniagenesis",
      ]},
      { heading: "Causes", points: [
        "Hypoaldosteronism: Addison disease, bilateral adrenalectomy, CAH (21-hydroxylase)",
        "Hyporeninemic hypoaldosteronism: diabetic nephropathy (most common in adults), CKD",
        "Drugs causing functional hypoaldosteronism: ACEi, ARBs, NSAIDs, heparin, calcineurin inhibitors",
        "Aldosterone resistance (pseudohypoaldosteronism type 1): MR or ENaC mutations",
        "Gordon syndrome (PHA type 2): WNK1/WNK4/CUL3/KLHL3 mutations → hyperkalemia + HTN",
        "Obstructive uropathy (in children — common cause)",
        "Sickle cell disease, amyloidosis, lupus",
      ]},
      { heading: "PHA Type 1 (Pseudohypoaldosteronism)", points: [
        "Aldosterone resistance despite HIGH aldosterone levels",
        "Renal form (MR mutation — NR3C2): salt wasting without systemic features, often remits",
        "Systemic form (ENaC mutation — SCNN1A/B/G): affects lung, sweat, colon; does NOT remit",
        "Neonatal presentation: salt wasting, hyperkalemia, low sodium, high aldosterone",
        "Respiratory symptoms in systemic form (cf. cystic fibrosis — different mechanism)",
      ]},
      { heading: "Treatment", points: [
        "Treat underlying cause (stop offending drug, treat Addison with hydrocortisone + fludrocortisone)",
        "Dietary potassium restriction + loop diuretics (furosemide) to excrete K",
        "Fludrocortisone for hypoaldosteronism (0.1–0.2 mg/day, titrate by BP/electrolytes)",
        "Sodium bicarbonate mild supplementation if significant acidosis",
        "PHA type 1 renal: sodium supplements in infancy, usually resolves by age 2–3",
        "PHA type 1 systemic: lifelong high-sodium diet, no aldosterone response",
        "Gordon syndrome: thiazide diuretics (correct the NCC overactivation)",
      ]},
    ],
  },

  // ── Fanconi & Cystinosis ──────────────────────────────────────────────────
  {
    name: "Cystinosis", tag: "Fanconi/Genetic", color: "bg-violet-100 text-violet-800", emergency: false,
    summary: "Most common inherited Fanconi syndrome. CTNS gene — lysosomal cystine transporter defect → cystine crystal accumulation in all tissues.",
    sections: [
      { heading: "Clinical Presentation (Nephropathic — Infantile)", points: [
        "Presentation age 6–18 months: polyuria, polydipsia, failure to thrive, rickets",
        "Fanconi syndrome: glucosuria, phosphaturia, aminoaciduria, pRTA, hypokalemia",
        "Photophobia (corneal cystine crystals) — slit lamp essential from diagnosis",
        "Fair skin, blond hair in affected children (pigment reduced)",
        "Progressive renal impairment → ESRD by age 10 without treatment",
        "Without cysteamine: median ESRD age ~12 years; with: extended to 30+ years",
      ]},
      { heading: "Extra-renal Complications (Long-term)", points: [
        "Hypothyroidism (50%): cystine crystals in thyroid — T4 monitoring annual",
        "Myopathy: distal muscle weakness, swallowing difficulty (2nd–3rd decade)",
        "Retinopathy: progressive, can cause blindness",
        "Male hypogonadism: primary testicular failure",
        "CNS involvement: cognitive issues, cerebral atrophy in adult cystinosis",
        "Pulmonary involvement: progressive fibrosis in some adults",
        "Diabetes mellitus: pancreatic involvement",
      ]},
      { heading: "Diagnosis", points: [
        "Leukocyte cystine level: >2 nmol half-cystine/mg protein (diagnostic)",
        "CTNS gene sequencing (57-kb deletion most common in European ancestry)",
        "Slit lamp exam: corneal crystal grading (Gahl grade 0–3)",
        "Renal tubular function panel: FE-glucose, FE-phosphate, amino acid screen, urine β2-MG",
        "Renal biopsy: crystals in interstitial cells (cleft-like spaces after formalin fixation)",
      ]},
      { heading: "Treatment — Cysteamine", points: [
        "Cysteamine (Cystagon/Procysbi): immediate-release vs delayed-release",
        "Target leukocyte cystine <1 nmol half-cystine/mg protein",
        "Dose: 1.3–1.95 g/m²/day in 4 doses (immediate-release) or 2 doses (delayed-release)",
        "Start ASAP after diagnosis — irreversible damage already present at diagnosis",
        "Side effects: halitosis (fishy odor — compliance issue), GI upset, skin rash",
        "Cysteamine eye drops: 0.55% (Cystadrops) — reduces corneal crystals, 4–6x/day",
        "Renal Fanconi: phosphate + Vit D, K supplements, alkali",
        "Post-transplant: continue cysteamine (protects extra-renal organs)",
      ]},
    ],
  },
  {
    name: "Lowe Syndrome (OCRL Deficiency)", tag: "Fanconi/Genetic", color: "bg-indigo-100 text-indigo-800", emergency: false,
    summary: "X-linked oculocerebrorenal syndrome. OCRL1 gene (inositol polyphosphate 5-phosphatase). Triad: cataracts + intellectual disability + Fanconi syndrome.",
    sections: [
      { heading: "Features", points: [
        "X-linked recessive — affects males; carrier females have lens opacities",
        "Cataracts: congenital, dense — often presenting feature at birth",
        "Intellectual disability: mild to profound; seizures in ~50%",
        "Fanconi syndrome: pRTA, aminoaciduria, phosphaturia, glucosuria",
        "Hypotonia: neonatal, proximal muscle weakness",
        "Renal: progressive CKD, proteinuria (tubular pattern)",
        "Behavioral: autism-like features, stereotypies",
      ]},
      { heading: "Management", points: [
        "Symptomatic: no disease-modifying therapy yet",
        "Alkali supplements for pRTA/Fanconi",
        "Phosphate + active Vit D for rickets",
        "Early cataract surgery + amblyopia treatment",
        "Seizure management, developmental support",
        "Genetic counseling for carrier females",
      ]},
    ],
  },

  // ── Bartter / Gitelman / Channelopathies ──────────────────────────────────
  {
    name: "Bartter Syndrome", tag: "Channelopathy", color: "bg-blue-100 text-blue-800", emergency: false,
    summary: "Autosomal recessive. Salt-wasting tubulopathy with hypokalemic metabolic alkalosis, hyperreninemia, hyperaldosteronism, normal/low BP. NKCC2 transporter defect (TAL).",
    sections: [
      { heading: "Classification & Genes", points: [
        "Type 1 (Antenatal/Neonatal Bartter): SLC12A1 (NKCC2) — most severe, polyhydramnios, premature birth",
        "Type 2 (Antenatal): KCNJ1 (ROMK) — neonatal presentation, early hyperkalemia then hypokalemia",
        "Type 3 (Classic Bartter): CLCNKB (ClCKb) — broad phenotype, onset in infancy/childhood",
        "Type 4a (Bartter + sensorineural deafness): BSND (barttin) — deaf + severe",
        "Type 4b: CLCNKA + CLCNKB — severe antenatal + deafness",
        "Type 5: CASR gain-of-function — autosomal dominant, with hypocalcemia",
      ]},
      { heading: "Diagnostic Features", points: [
        "Hypokalemic metabolic alkalosis (K <3.0 mEq/L common, alkalosis severe)",
        "Urine Cl >20 mEq/L (chloride-resistant — unlike vomiting/diuretic abuse stopped)",
        "HIGH plasma renin + aldosterone (secondary hyperaldosteronism from volume loss)",
        "Normal or LOW blood pressure (despite high aldosterone — distinguishes from Liddle/AME)",
        "High urine prostaglandin E2 (esp. antenatal Bartter — explains fetal polyuria/polyhydramnios)",
        "Nephrocalcinosis in Type 1 (hypercalciuria from NKCC2 dysfunction, similar to furosemide effect)",
        "Antenatal: maternal polyhydramnios, premature delivery, severe neonatal electrolyte disturbance",
      ]},
      { heading: "Treatment", points: [
        "Indomethacin: key therapy — reduces prostaglandin-mediated tubular sodium loss",
          "Dose: 1–3 mg/kg/day divided TID; start after fluid resuscitation",
          "Avoid <32 weeks gestation and in neonates with PDA; monitor renal function closely",
        "Potassium: aggressive replacement — KCl oral + IV; target K >3.5 mEq/L",
        "Aldosterone antagonist: spironolactone 2–5 mg/kg/day or amiloride to limit K loss",
        "Salt (NaCl) supplements to replace obligate losses",
        "Monitor: electrolytes, renal function, BP, growth, urine prostaglandins",
        "Type 3: milder, indomethacin ± spironolactone often sufficient",
        "Genetic sequencing: guides prognosis and surveillance (deafness screen in Types 4a/4b)",
      ]},
    ],
  },
  {
    name: "Gitelman Syndrome", tag: "Channelopathy", color: "bg-teal-100 text-teal-800", emergency: false,
    summary: "Most common inherited tubular disorder (prevalence 1:40,000). SLC12A3 (NCC, thiazide-sensitive cotransporter in DCT). Milder than Bartter. Onset adolescence/adults.",
    sections: [
      { heading: "Key Features", points: [
        "Hypokalemic metabolic alkalosis + HYPOMAGNESEMIA (distinguishes from Bartter)",
        "Hypocalciuria (low urine calcium — opposite to Bartter Type 1)",
        "Normal or low blood pressure",
        "High urine Cl (chloride-resistant alkalosis)",
        "Mild to moderate hypokalemia (often K 2.5–3.5 mEq/L) — many asymptomatic",
        "Salt craving, fatigue, muscle cramps, tetany, palpitations (QTc prolongation risk)",
        "Chondrocalcinosis in adults (calcium pyrophosphate deposition — from hypomagnesemia)",
        "Generally benign long-term prognosis; GFR preserved; life expectancy normal",
      ]},
      { heading: "Diagnosis", points: [
        "Hypokalemia + alkalosis + low Mg + low urine Ca + normal/low BP",
        "Rule out: diuretic abuse (urine diuretic screen), vomiting (low urine Cl if ongoing)",
        "SLC12A3 gene sequencing (AR, >400 variants described — compound heterozygous common)",
        "Differentiate from Bartter Type 3: Gitelman has lower urine Ca, lower Mg, less severe",
        "Chloride-to-creatinine ratio in urine can support diagnosis",
      ]},
      { heading: "Treatment", points: [
        "Magnesium supplementation: ESSENTIAL — Mg-glycerophosphate or Mg-oxide 300–600 mg/day",
        "IV Mg if severe (<0.5 mmol/L) or symptomatic",
        "Potassium: KCl oral supplements; target K >3.0–3.5 mEq/L",
        "Spironolactone/amiloride: useful for K retention, reduce dose if BP falls",
        "NSAIDs (indomethacin): sometimes used but less effective than in Bartter",
        "High-sodium, high-potassium diet",
        "Avoid: thiazide diuretics (worsen by same mechanism), hypokalemia-inducing drugs",
        "QTc monitoring: ECG periodically; avoid drugs prolonging QT (quinolones, macrolides)",
        "Pregnancy: closer monitoring required — hypokalemia worsens",
      ]},
    ],
  },
  {
    name: "Liddle Syndrome", tag: "Channelopathy", color: "bg-orange-100 text-orange-800", emergency: false,
    summary: "Autosomal dominant gain-of-function mutation of ENaC (epithelial sodium channel) β or γ subunit. EARLY-ONSET severe hypertension + hypokalemia. Mimics hyperaldosteronism but aldosterone is LOW.",
    sections: [
      { heading: "Pathophysiology & Features", points: [
        "SCNN1B or SCNN1G (ENaC β/γ subunit) gain-of-function — prevents channel internalisation",
        "Constitutively open ENaC → excessive Na reabsorption → volume expansion → severe HTN",
        "Hypokalemic metabolic alkalosis + HYPERTENSION",
        "Plasma renin: LOW (suppressed by volume expansion)",
        "Plasma aldosterone: LOW (suppressed — key to differentiation from primary hyperaldosteronism)",
        "Urine Cl: LOW (chloride-sensitive — Na/volume retention)",
        "Presentation: childhood/adolescent severe HTN, sometimes with stroke/LVH at young age",
      ]},
      { heading: "Differential Diagnosis", points: [
        "Primary hyperaldosteronism (Conn): HIGH aldosterone, HIGH renin often normal",
        "AME (Apparent Mineralocorticoid Excess): low aldosterone, low renin, responds to spironolactone",
        "Glucocorticoid-remediable aldosteronism (GRA/FH type 1): high aldosterone, suppressed by dexamethasone",
        "CAH (11β-hydroxylase or 17α-hydroxylase deficiency): steroid precursor screen",
        "Renovascular HTN: high renin, secondary aldosteronism",
      ]},
      { heading: "Treatment", points: [
        "Amiloride (ENaC blocker): 5–20 mg/day — FIRST-LINE and specific treatment",
        "Triamterene: alternative ENaC blocker",
        "Low sodium diet reinforces treatment",
        "AVOID spironolactone — it is an aldosterone antagonist (aldosterone is already low — won't work)",
        "Prognosis: excellent if diagnosed and treated early; HTN-related end-organ damage if missed",
        "Family screening: AD inheritance, screen siblings/parents with BP + electrolytes",
      ]},
    ],
  },
  {
    name: "Apparent Mineralocorticoid Excess (AME)", tag: "Channelopathy", color: "bg-rose-100 text-rose-800", emergency: false,
    summary: "HSD11B2 gene (11β-HSD2) deficiency → cortisol acts as mineralocorticoid (MR non-selective). Severe early childhood hypertension + hypokalemia + low renin + LOW aldosterone.",
    sections: [
      { heading: "Pathophysiology", points: [
        "11β-HSD2 normally inactivates cortisol to cortisone in distal nephron",
        "Without this enzyme, cortisol (high affinity for MR) activates aldosterone receptor → Na retention",
        "Low cortisol:cortisone ratio in urine — diagnostic marker",
        "Acquired: liquorice ingestion (glycyrrhizic acid inhibits 11β-HSD2) — reversible",
        "Genetic: HSD11B2 mutations (AR) — severe, childhood onset",
      ]},
      { heading: "Features", points: [
        "Severe hypertension in childhood (severe end-organ damage if missed)",
        "Hypokalemia + metabolic alkalosis",
        "LOW plasma renin + LOW aldosterone (distinguishes from primary hyperaldosteronism)",
        "Urine free cortisol:cortisone ratio >1 (normally <0.5)",
        "THF+alloTHF/THE ratio elevated",
        "Growth failure, LVH, early stroke risk",
      ]},
      { heading: "Treatment", points: [
        "Spironolactone (MR antagonist): blocks cortisol's mineralocorticoid action — works (unlike Liddle)",
        "Amiloride: adjunct ENaC blocker",
        "Dexamethasone: suppresses ACTH → reduces cortisol → less MR stimulation",
        "Low-sodium diet + K supplementation",
        "Avoid liquorice in any form",
        "Genetic AME: lifelong treatment; screen for hypertensive complications",
      ]},
    ],
  },
  {
    name: "EAST/SeSAME Syndrome", tag: "Channelopathy", color: "bg-pink-100 text-pink-800", emergency: false,
    summary: "KCNJ10 (Kir4.1 K⁺ channel) mutation. Triad: Epilepsy + Ataxia + Sensorineural deafness + Tubulopathy (Gitelman-like electrolyte losses).",
    sections: [
      { heading: "Features", points: [
        "KCNJ10 (Kir4.1) mutation — basolateral K channel of DCT and brain",
        "Renal: Gitelman-like (hypokalemia, low Mg, metabolic alkalosis, hypocalciuria)",
        "Neurological: epilepsy, cerebellar ataxia, intellectual disability",
        "Sensorineural hearing loss",
        "Presentation: infancy/childhood seizures + electrolyte disturbance together",
        "Distinguishes from Gitelman (no neurological features in Gitelman)",
      ]},
      { heading: "Management", points: [
        "Same electrolyte replacement as Gitelman: K + Mg supplementation",
        "Seizure management: valproate, levetiracetam",
        "Hearing aids/cochlear implant for deafness",
        "Supportive: physiotherapy for ataxia",
        "No disease-modifying therapy; genetic counseling",
      ]},
    ],
  },
  {
    name: "Nephrogenic Diabetes Insipidus (NDI)", tag: "Concentration Defect", color: "bg-sky-100 text-sky-800", emergency: false,
    summary: "Inability of collecting duct to respond to ADH/AVP. Massive polyuria + isotonic/dilute urine despite high plasma osmolality. Congenital or acquired.",
    sections: [
      { heading: "Genetic Forms", points: [
        "X-linked NDI (80%): AVPR2 (V2 receptor) loss-of-function — males severely affected",
        "Autosomal NDI (20%): AQP2 (aquaporin-2 water channel) mutations — AR or AD",
        "Females with AVPR2 heterozygous: variable phenotype (lyonization)",
        "Onset: neonatal — severe hypernatremia, fever, recurrent dehydration if not recognized",
        "Hypernatremia + failure to thrive + intellectual impairment (from recurrent brain dehydration)",
      ]},
      { heading: "Acquired Causes", points: [
        "Lithium therapy (most common acquired NDI): downregulates AQP2",
        "Hypercalcemia (hypercalciuria desensitizes V2 receptor)",
        "Hypokalemia (chronic): impairs concentrating ability",
        "Obstruction (obstructive uropathy): post-obstructive diuresis",
        "Sickle cell disease: sickling in medullary vasculature destroys countercurrent",
        "Sjögren syndrome, amyloidosis, sarcoidosis",
      ]},
      { heading: "Diagnosis — Water Deprivation Test", points: [
        "Urine osmolality fails to rise above 300 mOsm/kg after water deprivation",
        "Plasma osmolality rises above 295 mOsm/kg",
        "Desmopressin (DDAVP) challenge: partial response in partial NDI; NO response in complete NDI",
        "Full response to DDAVP = central DI (AVP deficiency) — NOT NDI",
        "Copeptin-stimulated test: more modern and safer alternative to water deprivation",
        "Genetic testing for AVPR2/AQP2 in neonatal/infant cases",
      ]},
      { heading: "Treatment", points: [
        "HYDRATION: cornerstone — free water access, avoid dehydration",
        "Low-solute diet: reduce urinary solute load → reduces obligate urine volume",
        "Thiazide diuretics (hydrochlorothiazide 1–2 mg/kg/day): paradoxical antidiuretic effect via proximal Na reabsorption, reducing distal delivery",
        "Amiloride: adds to thiazide AND protects against lithium-NDI (blocks ENaC entry)",
        "NSAIDs (indomethacin): reduce urine volume by reducing prostaglandin-mediated inhibition of ADH",
        "Sildenafil/tolvaptan: investigational for X-linked NDI (V2 receptor trafficking chaperones)",
        "Monitor: growth, plasma Na, cranial MRI (if hypernatremic episodes in infancy)",
      ]},
    ],
  },
  {
    name: "Renal Glucosuria (Familial)", tag: "Isolated Tubular Defect", color: "bg-green-100 text-green-800", emergency: false,
    summary: "Isolated glucosuria with normal blood glucose. SLC5A2 (SGLT2) mutations. Benign — distinguish from diabetes mellitus and Fanconi.",
    sections: [
      { heading: "Features & Types", points: [
        "Type A: low renal threshold (Tm) + low tubular maximum — most common",
        "Type B: normal Tm but increased 'splay' (heterogeneous nephron function)",
        "Type O (severe): nearly all filtered glucose spilled — loss up to 100 g/day",
        "SLC5A2 (SGLT2, proximal tubule) — autosomal dominant or recessive",
        "Blood glucose NORMAL (critical — distinguishes from diabetes)",
        "No other Fanconi features (phosphate, amino acids, HCO₃ all normal)",
        "Rarely significant: caloric loss, mild osmotic polyuria",
      ]},
      { heading: "Management", points: [
        "Reassurance: benign condition",
        "No treatment required in most cases",
        "Adequate hydration especially in hot weather (mild osmotic diuresis)",
        "Note: SGLT2 inhibitors (gliflozins) cause pharmacological glucosuria by same mechanism",
        "Useful in CKD/diabetes — interesting pharmacological parallel",
        "No long-term renal complications from glucosuria alone",
      ]},
    ],
  },
  {
    name: "Hypophosphatemic Rickets (XLH & Others)", tag: "Phosphate Wasting", color: "bg-yellow-100 text-yellow-800", emergency: false,
    summary: "Renal phosphate wasting → rickets/osteomalacia. PHEX mutation (XLH most common) → excess FGF23. Others: ADHR, ARHR, tumor-induced osteomalacia.",
    sections: [
      { heading: "X-linked Hypophosphatemia (XLH)", points: [
        "PHEX (phosphate-regulating endopeptidase) mutation → unregulated FGF23 → phosphaturia",
        "Most common hereditary rickets (1:20,000)",
        "Hypophosphatemia + rickets + low/normal 1,25(OH)₂D (paradox — normally low PO₄ raises 1,25D)",
        "Short stature, bowing of legs, dental abscesses (hypomineralized dentin)",
        "Enthesopathy in adults: calcification of tendons and ligaments",
        "Normal serum calcium, PTH; LOW serum phosphate, LOW TMP/GFR",
      ]},
      { heading: "Other Forms", points: [
        "ADHR (Autosomal Dominant Hypophosphatemic Rickets): FGF23 mutation resistant to cleavage — variable penetrance",
        "ARHR Type 1: DMP1 mutation → excess FGF23",
        "ARHR Type 2: ENPP1 mutation",
        "Tumor-Induced Osteomalacia (TIO): FGF23-secreting mesenchymal tumor — acquired, adults",
        "HHRH (Hereditary Hypophosphatemic Rickets with Hypercalciuria): SLC34A3 (NaPi-IIc) — LOW FGF23, HIGH 1,25D, HIGH urine Ca — treat differently!",
      ]},
      { heading: "Treatment", points: [
        "Conventional: oral phosphate + active Vit D (calcitriol)",
          "Phosphate: Na/K-phosphate 20–60 mg/kg/day elemental phosphorus in 4–5 doses",
          "Calcitriol: 20–40 ng/kg/day (prevent secondary HPT from phosphate)",
          "Risk: secondary HPT, nephrocalcinosis with conventional therapy",
        "Burosumab (anti-FGF23 monoclonal antibody): now FIRST-LINE in XLH (EMA/FDA approved)",
          "Dose: 0.4–2 mg/kg SC Q2W; titrate by serum phosphate",
          "Dramatically improves phosphate, growth, rickets healing",
          "Not for HHRH (low FGF23 there — would worsen)",
        "HHRH: Vit D (1,25D) supplementation only — phosphate supplements not needed",
      ]},
    ],
  },

  // ── Stones & Nephrocalcinosis ─────────────────────────────────────────────
  {
    name: "Primary Hyperoxaluria (PH1/PH2/PH3)", tag: "Oxalate Disorder", color: "bg-orange-100 text-orange-800", emergency: false,
    summary: "Rare autosomal recessive disorders of glyoxylate metabolism → massive oxalate overproduction → oxalate nephrocalcinosis, urolithiasis, systemic oxalosis.",
    sections: [
      { heading: "Classification", points: [
        "PH1 (AGXT — alanine-glyoxylate aminotransferase): most common & most severe; mislocalized to mitochondria",
        "PH2 (GRHPR — glyoxylate/hydroxypyruvate reductase): moderate; oxalate + L-glycerate crystals",
        "PH3 (HOGA1 — 4-hydroxy-2-oxoglutarate aldolase): milder, may not progress to ESRD",
        "PH1: up to 50% present with ESRD in childhood if undiagnosed; systemic oxalosis (bone, heart, retina, CNS)",
      ]},
      { heading: "Presentation & Diagnosis", points: [
        "Recurrent calcium oxalate stones from infancy/early childhood",
        "Nephrocalcinosis (medullary): progressive, bilateral",
        "Urine oxalate: >1.0 mmol/1.73m²/day (normal <0.5)",
        "Liver biopsy: AGXT enzyme activity (less done now — genetics preferred)",
        "Genetic panel: AGXT/GRHPR/HOGA1 (blood or saliva)",
        "Urine oxalate: also check glycolate (elevated in PH1 only), L-glycerate (PH2)",
        "Plasma oxalate: critically important at GFR <30 — systemic oxalosis risk",
      ]},
      { heading: "Treatment", points: [
        "Hydration: >3 L/m²/day — dilutes urinary oxalate",
        "Pyridoxine (B6): 5–10 mg/kg/day in PH1 — 10–30% are responders (AGXT cofactor)",
        "Lumasiran (RNAi — Oxlumo): FIRST-LINE in PH1 for all stages",
          "SC injection monthly × 3 loading doses then Q3 months",
          "Reduces hepatic glyoxylate by inhibiting HAAO-glycolate oxidase",
          "Approved for all ages including infants",
        "Nedosiran (RNAi): for PH1/2/3 (targets LDHA)",
        "Kidney-alone transplant: only in B6-responsive PH1; otherwise recurrence in graft",
        "Combined liver-kidney transplant (PH1): liver provides corrected AGXT — curative; requires careful timing",
        "Dialysis: inadequate to clear oxalate — use as bridge only; intensify if CKD5",
        "Citrate supplementation: reduces stone formation",
      ]},
    ],
  },
  {
    name: "Cystinuria", tag: "Amino Acid Defect", color: "bg-purple-100 text-purple-800", emergency: false,
    summary: "Defective transport of cystine, ornithine, lysine, arginine (COLA) in proximal tubule and gut. SLC3A1/SLC7A9. Recurrent cystine stones — can be staghorn.",
    sections: [
      { heading: "Classification", points: [
        "Type A: SLC3A1 (rBAT) — AR — both alleles affected",
        "Type B: SLC7A9 (b0,+AT) — AD with incomplete penetrance",
        "Cystine solubility poor in normal urine (250 mg/L at pH 7.0) → crystals form readily",
        "Stones: radiopaque but less than calcium (faintly opaque), hexagonal crystals on urine microscopy",
        "Presentation: first stone typically age 10–30 years; recurrent lifelong",
      ]},
      { heading: "Diagnosis", points: [
        "24-hour urine cystine: >250 mg/g creatinine (or >0.8 mmol/day)",
        "Urine microscopy: hexagonal crystals (flat hexagonal plates — pathognomonic)",
        "Cyanide-nitroprusside test (qualitative screening): positive in cystinuria",
        "Genetic testing: SLC3A1/SLC7A9 panel",
        "Stone analysis: FTIR or Raman spectroscopy → 100% cystine",
      ]},
      { heading: "Treatment", points: [
        "HYDRATION: cornerstone — urine volume >3 L/m²/day (or >3 L/day in adults); target urine specific gravity <1.010",
        "Alkalinize urine: pH target >7.0 (cystine more soluble at alkaline pH)",
          "K citrate 3–4 mEq/kg/day; avoid Na-citrate (Na increases cystine excretion)",
          "Acetazolamide at night (maintain overnight alkalinization)",
        "D-Penicillamine: forms cysteine-penicillamine disulfide (more soluble); effective but side effects (proteinuria, rash, thrombocytopenia, elastosis perforans) — reserve for recurrent/refractory",
        "Tiopronin (α-mercaptopropionylglycine): similar mechanism, better tolerated than D-penicillamine — preferred second-line",
        "Captopril: mild cystine-binding effect; only as add-on in mild disease",
        "Urological: ESWL, URS, PCNL — cystine stones poorly responsive to ESWL (hard stones)",
        "Monitor: 24h urine cystine every 6 months; renal USS, renal function",
      ]},
    ],
  },
  {
    name: "FHHNC (Familial Hypomagnesemia with Hypercalciuria & Nephrocalcinosis)", tag: "Magnesium Disorder", color: "bg-teal-100 text-teal-800", emergency: false,
    summary: "CLDN16 (claudin-16) or CLDN19 (claudin-19) mutations. Tight junction defect in TAL → Mg²⁺ and Ca²⁺ wasting → severe hypomagnesemia + hypercalciuria + nephrocalcinosis → progressive CKD.",
    sections: [
      { heading: "Features", points: [
        "Presentation: childhood recurrent UTIs, nephrolithiasis, nephrocalcinosis, polyuria",
        "Hypomagnesemia (severe — often <0.4 mmol/L) + hypercalciuria (urine Ca >4 mg/kg/day)",
        "Hypermagnesuria (high FE-Mg)",
        "Hypocalcemia may occur (secondary to hypomagnesemia — PTH secretion impaired by low Mg)",
        "CLDN19 mutations: additional ocular involvement — macular colobomata, myopia, nystagmus",
        "Progressive CKD: nearly all develop CKD3 by early adulthood; ~30% reach ESRD",
      ]},
      { heading: "Treatment", points: [
        "Magnesium supplementation: oral Mg preparations; limited effect (GI side effects, poor absorption)",
        "Low-dose thiazide diuretics: reduce hypercalciuria somewhat",
        "Citrate: reduce stone formation, slow nephrocalcinosis progression",
        "ACEi/ARBs: nephroprotection once proteinuria develops",
        "No therapy reverses the tubulopathy — early diagnosis and CKD care are key",
        "Genetic diagnosis critical for family counseling (AR)",
      ]},
    ],
  },

  // ── Metabolic / Acid-Base summary cards ──────────────────────────────────
  {
    name: "Metabolic Acidosis — Diagnostic Approach", tag: "Acid-Base", color: "bg-slate-100 text-slate-800", emergency: false,
    summary: "Systematic approach to NAGMA vs HAGMA. Urine anion gap separates RTA from GI losses. Critical for fellowship-level acid-base interpretation.",
    sections: [
      { heading: "Step-by-Step Approach", points: [
        "Step 1: Calculate Anion Gap (AG) = Na − (Cl + HCO₃). Normal: 8–12 mEq/L",
        "Step 2: NAGMA (normal AG): → calculate UAG = uNa + uK − uCl",
          "Positive UAG (>0): NH₄⁺ excretion impaired → RENAL cause (dRTA, Type 4 RTA)",
          "Negative UAG (<0): NH₄⁺ excretion intact → GI/extra-renal cause (diarrhea, ileostomy)",
          "UAG near zero in pRTA (variable)",
        "Step 3: HAGMA (high AG): MUDPILES mnemonic",
          "M: Methanol; U: Uraemia; D: DKA/Alcoholic KA; P: Propylene glycol; I: Infection/Isoniazid; L: Lactic acidosis; E: Ethylene glycol; S: Salicylates",
        "Step 4: Urine pH assessment",
          "<5.5 in acidosis: distal acidification intact (GI cause or Type 4 RTA)",
          ">5.5 in acidosis: distal acidification failure → dRTA",
        "Step 5: Serum potassium",
          "Hypokalemia: dRTA or pRTA (Type 1, 2)",
          "Hyperkalemia: Type 4 RTA or GI (lower GI losses can cause either)",
        "Step 6: Delta-delta ratio (HAGMA only) = (AG−12)/(24−HCO₃)",
          "<0.4: pure NAGMA; 0.4–0.8: mixed; 1–2: pure HAGMA; >2: HAGMA + concurrent metabolic alkalosis",
      ]},
      { heading: "RTA Quick Reference Table", points: [
        "dRTA (Type 1): NAGMA | urine pH >5.5 | UAG +ve | K LOW | Nephrocalcinosis",
        "pRTA (Type 2): NAGMA | urine pH variable | FE-HCO₃ >15% | K LOW | Fanconi features",
        "Type 4: NAGMA | urine pH <5.5 | K HIGH | Low aldosterone/resistance",
        "GI Loss: NAGMA | urine pH <5.5 | UAG −ve | K LOW or normal",
      ]},
    ],
  },
  {
    name: "Metabolic Alkalosis — Chloride-Based Approach", tag: "Acid-Base", color: "bg-amber-100 text-amber-800", emergency: false,
    summary: "Excess HCO₃. Classify by urine Cl to determine chloride-responsive (volume contraction) vs chloride-resistant (mineralocorticoid excess). BP helps further.",
    sections: [
      { heading: "Classification Framework", points: [
        "Urine Cl <20 mEq/L (Chloride-RESPONSIVE) — corrected by normal saline",
          "Vomiting / NG suction (loss of HCl)",
          "Diuretics (after stopping — ongoing K depletion maintains alkalosis)",
          "Post-hypercapnia alkalosis",
          "Cystic fibrosis (chloride sweat loss)",
        "Urine Cl >20 mEq/L (Chloride-RESISTANT) — NOT corrected by saline",
          "With HIGH BP: Liddle syndrome, Primary hyperaldosteronism (Conn), AME, CAH (11β-OH or 17α-OH), Cushing",
          "With NORMAL/LOW BP: Bartter syndrome, Gitelman syndrome, EAST syndrome",
          "Active diuretic use: urine Cl elevated during diuretic action",
        "Potassium: always low in sustained metabolic alkalosis (K out of cells to maintain electroneutrality, renal K wasting)",
      ]},
    ],
  },
];

const TAGS = ["All", "RTA", "Fanconi/Genetic", "Channelopathy", "Concentration Defect", "Phosphate Wasting", "Oxalate Disorder", "Amino Acid Defect", "Magnesium Disorder", "Acid-Base", "Isolated Tubular Defect"];

// ─── AI Acid-Base Engine ─────────────────────────────────────────────────────
function AIAcidBaseEngine() {
  const [inputs, setInputs] = useState({ na: "", cl: "", hco3: "", k: "", urineNa: "", urineK: "", urineCl: "", urinePH: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const upd = (k, v) => setInputs(p => ({ ...p, [k]: v }));

  const ag = inputs.na && inputs.cl && inputs.hco3
    ? (parseFloat(inputs.na) - parseFloat(inputs.cl) - parseFloat(inputs.hco3)).toFixed(1) : null;
  const uag = inputs.urineNa && inputs.urineK && inputs.urineCl
    ? (parseFloat(inputs.urineNa) + parseFloat(inputs.urineK) - parseFloat(inputs.urineCl)).toFixed(1) : null;

  const analyze = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Expert pediatric nephrologist. Interpret this acid-base workup in detail.
Na: ${inputs.na}, Cl: ${inputs.cl}, HCO3: ${inputs.hco3}, K: ${inputs.k || "?"} mEq/L
AG: ${ag || "?"} mEq/L (normal 8-12). UAG: ${uag || "?"} mEq/L. Urine pH: ${inputs.urinePH || "?"}

Classify, differentiate RTA types, give management. Include teaching pearls.
JSON: { ag_classification, uag_interpretation, primary_diagnosis, differential: [], key_clues: [], management: [], teaching_pearl, further_workup: [] }`,
      response_json_schema: { type: "object", properties: { ag_classification: { type: "string" }, uag_interpretation: { type: "string" }, primary_diagnosis: { type: "string" }, differential: { type: "array", items: { type: "string" } }, key_clues: { type: "array", items: { type: "string" } }, management: { type: "array", items: { type: "string" } }, teaching_pearl: { type: "string" }, further_workup: { type: "array", items: { type: "string" } } } }
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><Brain className="w-4 h-4" />AI Acid-Base Interpreter</h3>
          <div className="grid grid-cols-2 gap-2">
            {[["na","Serum Na","mEq/L"],["cl","Serum Cl","mEq/L"],["hco3","Serum HCO₃","mEq/L"],["k","Serum K","mEq/L"],["urineNa","Urine Na","mEq/L"],["urineK","Urine K","mEq/L"],["urineCl","Urine Cl","mEq/L"],["urinePH","Urine pH",""]].map(([key, label, unit]) => (
              <div key={key}>
                <label className="text-xs font-semibold text-slate-600">{label}</label>
                <div className="flex gap-1 mt-0.5">
                  <input className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-400" value={inputs[key]} onChange={e => upd(key, e.target.value)} placeholder="–" />
                  {unit && <span className="text-xs bg-slate-100 px-1.5 py-1.5 rounded-lg border text-slate-500 flex-shrink-0">{unit}</span>}
                </div>
              </div>
            ))}
          </div>
          {(ag !== null || uag !== null) && (
            <div className="flex flex-wrap gap-4 mt-3 p-2 bg-white rounded-lg border border-slate-200">
              {ag !== null && <span className="text-sm font-bold">AG: <span className={parseFloat(ag) > 12 ? "text-red-600" : "text-green-600"}>{ag} mEq/L {parseFloat(ag) > 12 ? "(↑ HIGH)" : "(Normal)"}</span></span>}
              {uag !== null && <span className="text-sm font-bold">UAG: <span className={parseFloat(uag) > 0 ? "text-red-600" : "text-green-600"}>{uag} mEq/L {parseFloat(uag) > 0 ? "(+ve → RTA)" : "(−ve → GI loss)"}</span></span>}
            </div>
          )}
          <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700" onClick={analyze} disabled={loading || !inputs.na}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Interpreting…</> : <><Brain className="w-4 h-4 mr-1" />AI Interpret</>}
          </Button>
        </CardContent>
      </Card>
      {result && !result.error && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <Badge className="bg-blue-100 text-blue-700 text-sm mb-1">{result.primary_diagnosis}</Badge>
            <p className="text-xs text-slate-600"><span className="font-semibold">AG: </span>{result.ag_classification}</p>
            <p className="text-xs text-slate-600"><span className="font-semibold">UAG: </span>{result.uag_interpretation}</p>
            {result.key_clues?.length > 0 && <div><p className="text-xs font-bold text-slate-500 mt-1">Key Clues</p>{result.key_clues.map((c,i) => <p key={i} className="text-xs text-slate-600">• {c}</p>)}</div>}
            {result.management?.length > 0 && <div><p className="text-xs font-bold text-slate-500 mt-1">Management</p>{result.management.map((m,i) => <p key={i} className="text-xs text-slate-600">{i+1}. {m}</p>)}</div>}
            {result.further_workup?.length > 0 && <div><p className="text-xs font-bold text-slate-500 mt-1">Further Workup</p>{result.further_workup.map((w,i) => <p key={i} className="text-xs text-slate-600">• {w}</p>)}</div>}
            {result.teaching_pearl && <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 mt-1"><p className="text-xs font-bold text-indigo-700">Teaching Pearl</p><p className="text-xs text-slate-700">{result.teaching_pearl}</p></div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Condition Card ──────────────────────────────────────────────────────────
function ConditionCard({ cond, isOpen, onToggle, isAdmin, onEdit, onDelete, isCustom }) {
  return (
    <Card className={`border-slate-200 shadow-sm ${cond.emergency ? "border-l-4 border-l-red-500" : ""} ${isCustom ? "border-l-4 border-l-amber-400" : ""}`}>
      <CardContent className="p-0">
        <button className="w-full flex items-center justify-between p-3 text-left" onClick={onToggle}>
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            {cond.emergency && <Zap className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
            <span className="font-semibold text-sm text-slate-800">{cond.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cond.color}`}>{cond.tag}</span>
            {isCustom && <span className="text-xs text-amber-600 font-medium">Custom</span>}
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />}
        </button>
        {isOpen && (
          <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-3">
            {cond.summary && <p className="text-xs text-slate-500 italic leading-relaxed">{cond.summary}</p>}
            {cond.sections?.map((sec, si) => (
              <div key={si}>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{sec.heading}</p>
                <div className="space-y-0.5 pl-1">
                  {sec.points.map((pt, pi) => {
                    const indent = pt.startsWith("  ");
                    return (
                      <div key={pi} className={`flex items-start gap-1.5 ${indent ? "pl-4" : ""}`}>
                        <ArrowRight className={`w-3 h-3 flex-shrink-0 mt-0.5 ${indent ? "text-slate-300" : "text-teal-500"}`} />
                        <p className="text-xs text-slate-700 leading-relaxed">{pt.trim()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {isAdmin && (
              <div className="flex gap-2 pt-1 flex-wrap">
                <Button size="sm" variant="outline" className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50 h-7" onClick={e => { e.stopPropagation(); onEdit(); }}>
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                {isCustom && (
                  <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50 h-7" onClick={e => { e.stopPropagation(); onDelete(); }}>
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const EMPTY_CONDITION = {
  name: "", tag: "RTA", color: "bg-blue-100 text-blue-800", emergency: false, summary: "",
  sections: [{ heading: "Key Points", points: [""] }]
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TubularDisorderLab() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [openIdx, setOpenIdx] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [customConditions, setCustomConditions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("custom_tubular") || "[]"); } catch { return []; }
  });
  const [editModal, setEditModal] = useState(null);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me(), staleTime: 60000 });
  const isAdmin = user?.role === "admin";

  const saveCustom = (updated) => {
    setCustomConditions(updated);
    localStorage.setItem("custom_tubular", JSON.stringify(updated));
  };

  const openAdd = () => setEditModal({ mode: "add", cond: { ...EMPTY_CONDITION, sections: [{ heading: "Key Points", points: [""] }] }, isCustom: true });
  const openEdit = (cond, isCustom, customIdx) => setEditModal({ mode: "edit", cond: { ...cond, sections: cond.sections ? [...cond.sections.map(s => ({ ...s, points: [...s.points] }))] : [] }, isCustom, customIdx });

  const handleSave = () => {
    const c = editModal.cond;
    if (!c.name.trim()) return;
    if (editModal.mode === "add") {
      saveCustom([...customConditions, c]);
    } else if (editModal.isCustom && editModal.customIdx !== undefined) {
      const updated = [...customConditions];
      updated[editModal.customIdx] = c;
      saveCustom(updated);
    }
    setEditModal(null);
  };

  const handleDelete = (customIdx) => {
    saveCustom(customConditions.filter((_, i) => i !== customIdx));
    setOpenIdx(null);
  };

  const allConditions = [
    ...TUBULAR_CONDITIONS.map(c => ({ ...c, _isCustom: false })),
    ...customConditions.map(c => ({ ...c, _isCustom: true }))
  ];

  const filtered = allConditions.filter(c => {
    const matchTag = filter === "All" || c.tag === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q) || c.summary?.toLowerCase().includes(q);
    return matchTag && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-teal-700 to-cyan-600 p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TestTube className="w-7 h-7" />
            <div>
              <h2 className="text-xl font-bold">Tubular Disorders & Electrolytes</h2>
              <p className="text-teal-100 text-sm">RTA · Fanconi · Channelopathies · NDI · Oxalate · Cystine · Phosphate Wasting · Acid-Base</p>
            </div>
          </div>
          {isAdmin && (
            <button onClick={openAdd} className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1.5 rounded-full border border-white/30 transition-colors flex-shrink-0">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {["KDIGO 2022","dRTA·pRTA·Type4","Bartter·Gitelman","Cystinosis","XLH·Burosumab","PH1·Lumasiran","Fellowship-grade"].map(t => (
            <span key={t} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      {/* AI Engine toggle */}
      <Button
        variant={showAI ? "default" : "outline"}
        onClick={() => setShowAI(v => !v)}
        className={showAI ? "bg-blue-600 hover:bg-blue-700" : "border-blue-200 text-blue-700 hover:bg-blue-50"}
        size="sm"
      >
        <Brain className="w-4 h-4 mr-1.5" />
        {showAI ? "Hide AI Interpreter" : "AI Acid-Base Interpreter"}
      </Button>
      {showAI && <AIAcidBaseEngine />}

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search conditions, genes, symptoms…"
        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
      />

      {/* Tag filter */}
      <div className="flex flex-wrap gap-1.5">
        {TAGS.map(t => (
          <button key={t} onClick={() => { setFilter(t); setOpenIdx(null); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filter === t ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-slate-400">{filtered.length} condition{filtered.length !== 1 ? "s" : ""} shown</p>

      {/* Cards */}
      <div className="space-y-2">
        {filtered.map((cond, i) => {
          const customIdx = cond._isCustom ? customConditions.findIndex(c => c.name === cond.name) : undefined;
          return (
            <ConditionCard
              key={cond.name + i}
              cond={cond}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              isAdmin={isAdmin}
              isCustom={cond._isCustom}
              onEdit={() => openEdit(cond, cond._isCustom, customIdx)}
              onDelete={() => handleDelete(customIdx)}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <TestTube className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No conditions match your search</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-3 pb-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">{editModal.mode === "add" ? "Add New Condition" : "Edit Condition"}</h3>
              <button onClick={() => setEditModal(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Condition Name *</label>
                <input value={editModal.cond.name} onChange={e => setEditModal(m => ({ ...m, cond: { ...m.cond, name: e.target.value } }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" placeholder="e.g. Distal RTA (Type 1)" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tag</label>
                  <select value={editModal.cond.tag} onChange={e => setEditModal(m => ({ ...m, cond: { ...m.cond, tag: e.target.value } }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
                    {["RTA","Fanconi/Genetic","Channelopathy","Concentration Defect","Phosphate Wasting","Oxalate Disorder","Amino Acid Defect","Magnesium Disorder","Acid-Base","Isolated Tubular Defect"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="emerg2" checked={!!editModal.cond.emergency} onChange={e => setEditModal(m => ({ ...m, cond: { ...m.cond, emergency: e.target.checked } }))} className="w-4 h-4" />
                  <label htmlFor="emerg2" className="text-sm text-slate-600 font-medium">Emergency</label>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Summary</label>
                <textarea value={editModal.cond.summary} onChange={e => setEditModal(m => ({ ...m, cond: { ...m.cond, summary: e.target.value } }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 h-16 resize-none" placeholder="Brief description" />
              </div>
              {editModal.cond.sections?.map((sec, si) => (
                <div key={si} className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <input value={sec.heading} onChange={e => {
                    const s = [...editModal.cond.sections]; s[si] = { ...s[si], heading: e.target.value };
                    setEditModal(m => ({ ...m, cond: { ...m.cond, sections: s } }));
                  }} className="w-full px-2 py-1 text-xs font-bold border border-slate-200 rounded focus:outline-none" placeholder="Section heading" />
                  <textarea value={sec.points.join("\n")} onChange={e => {
                    const s = [...editModal.cond.sections]; s[si] = { ...s[si], points: e.target.value.split("\n") };
                    setEditModal(m => ({ ...m, cond: { ...m.cond, sections: s } }));
                  }} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none h-24 resize-none" placeholder="One point per line" />
                </div>
              ))}
              <button onClick={() => setEditModal(m => ({ ...m, cond: { ...m.cond, sections: [...(m.cond.sections || []), { heading: "New Section", points: [""] }] } }))}
                className="text-xs text-teal-600 hover:text-teal-800 font-medium">+ Add Section</button>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} size="sm" className="bg-teal-600 hover:bg-teal-700 flex-1">
                  <Check className="w-3.5 h-3.5 mr-1" /> Save
                </Button>
                <Button onClick={() => setEditModal(null)} size="sm" variant="outline">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-3">
          <p className="text-xs font-bold text-slate-500 mb-1">References & Guidelines</p>
          <p className="text-xs text-slate-600">
            KDIGO 2022 Acid-Base · Sayer (dRTA review, NEJM 2023) · Kleta & Bockenhauer (Channelopathies, NEJM 2018) · 
            Niaudet (Cystinosis, Pediatric Nephrology 2022) · Bacchetta (XLH/Burosumab) · Cochat (PH1, Lumasiran ERA 2022) · 
            Simeoni et al. (Bartter/Gitelman) · IPNA Clinical Practice Recommendations · Emma et al. (Tubular Disorders in Children)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}