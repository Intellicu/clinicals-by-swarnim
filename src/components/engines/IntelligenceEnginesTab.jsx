import React, { useState, useMemo } from "react";
import { Cpu, ChevronRight, ChevronDown, Search, X, BookOpen, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/client";
import { useQuery } from "@tanstack/react-query";

// Engines marked adminOnly: true are hidden from non-admins until approved
// To make an engine visible to all users, set adminOnly: false (default)

export const ENGINES = [
  // ── Emergency / Electrolyte ──
  { label: "AKI Engine", desc: "KDIGO + RRT triggers", scenario: "aki-engine", tags: ["AKI", "renal failure", "emergency", "creatinine"], group: "Emergency & Electrolytes" },
  { label: "Hyperkalaemia", desc: "K+ emergency full engine", scenario: "hyperkalemia-deep-engine", tags: ["hyperkalemia", "potassium", "arrhythmia", "emergency"], group: "Emergency & Electrolytes" },
  { label: "Hyponatraemia", desc: "Na correction engine", scenario: "hyponatremia-engine", tags: ["hyponatremia", "sodium", "SIADH", "fluid"], group: "Emergency & Electrolytes" },
  { label: "Hypokalemia", desc: "K+ deficiency pathway", scenario: "hypokalemia-engine", tags: ["hypokalemia", "potassium", "weakness"], group: "Emergency & Electrolytes" },
  { label: "Met. Acidosis", desc: "AG / RTA Engine", scenario: "metabolic-acidosis-engine", tags: ["acidosis", "anion gap", "RTA", "bicarbonate"], group: "Emergency & Electrolytes" },
  // ── Glomerular ──
  { label: "GN Engine", desc: "IgAN · LN · MN · FSGS · PSGN · ANCA · Alport · C3G · IgAVN", scenario: "gn-engine", tags: ["glomerulonephritis", "IgA", "lupus nephritis", "membranous", "FSGS", "PSGN", "ANCA", "Alport", "C3G", "HSP"], group: "Glomerular Disease" },
  { label: "NS Engine", desc: "Nephrotic Syndrome umbrella — first episode · relapse · FRNS/SDNS (SSNS, IPNA 2022) · steroid-resistant (SRNS, ISPN 2021) · congenital", scenario: "ns-engine", tags: ["nephrotic syndrome", "edema", "proteinuria", "steroid", "SSNS", "SRNS", "steroid sensitive", "steroid resistant", "FRNS", "SDNS", "relapse", "FSGS", "congenital", "genetic", "tacrolimus", "rituximab", "MMF", "cyclophosphamide", "levamisole", "IPNA", "ISPN"], group: "Glomerular Disease", ciee: true },
  { label: "NS Complications & Supportive Care Engine", desc: "Complications of NS — hypovolaemia · severe oedema/anasarca · infection (SBP/cellulitis/sepsis) · thromboembolism · AKI · dyslipidaemia · endocrine/metabolic · steroid toxicity — plus diet, fluids & vaccination", scenario: "ns-complications-engine", tags: ["nephrotic syndrome", "complications", "hypovolemia", "edema", "anasarca", "albumin", "furosemide", "infection", "peritonitis", "SBP", "cellulitis", "sepsis", "thrombosis", "VTE", "renal vein thrombosis", "enoxaparin", "AKI", "dyslipidemia", "hypothyroidism", "vitamin D", "steroid toxicity", "supportive care", "vaccination"], group: "Glomerular Disease", ciee: true },
  { label: "IgA Nephropathy / IgA Vasculitis Engine", desc: "IPNA 2024 — IgAN & IgA vasculitis nephritis · biopsy indications · RASB · selective steroids · RPGN", scenario: "iga-ipna-engine", tags: ["IgA nephropathy", "IgAN", "IgA vasculitis", "IgAVN", "HSP", "HSPN", "Oxford MEST-C", "crescentic", "RPGN", "IPNA", "RASB", "hematuria"], group: "Glomerular Disease", ciee: true },
  { label: "RPGN Engine", desc: "Crescentic GN + PLEX", scenario: "rpgn-deep-engine", tags: ["RPGN", "crescentic GN", "plasmapheresis", "ANCA", "anti-GBM"], group: "Glomerular Disease" },
  { label: "TMA Engine", desc: "HUS / aHUS / TTP", scenario: "tma-engine", tags: ["HUS", "aHUS", "TTP", "TMA", "thrombocytopenia"], group: "Glomerular Disease" },
  { label: "Hematuria Engine", desc: "6-step algorithm: glomerular vs urological", scenario: "hematuria-engine", tags: ["hematuria", "blood urine", "RBC", "glomerular", "dysmorphic", "alport", "IgA"], group: "Glomerular Disease" },
  { label: "Proteinuria Engine", desc: "Dipstick → UPCR → biopsy indications", scenario: "proteinuria-engine", tags: ["proteinuria", "urine protein", "UPCR", "nephrotic", "tubular", "orthostatic"], group: "Glomerular Disease" },
  { label: "Biopsy Engine", desc: "When to biopsy", scenario: "biopsy-engine", tags: ["biopsy", "kidney biopsy", "histology", "indication"], group: "Glomerular Disease" },
  { label: "C3G Engine", desc: "C3 Glomerulopathy", scenario: "c3g-engine", tags: ["C3G", "MPGN", "complement", "dense deposit"], group: "Glomerular Disease" },
  { label: "Eculizumab", desc: "Eligibility + dosing", scenario: "eculizumab-engine", tags: ["eculizumab", "aHUS", "complement", "eligibility"], group: "Glomerular Disease" },

  // ── CKD & Genetics ──
  { label: "CKD Engine", desc: "Classify · Etiology · Treatment · MBD · Anaemia · Monitoring · ESRD prep", scenario: "ckd-engine", tags: ["CKD", "chronic kidney disease", "staging", "eGFR", "albuminuria", "MBD", "anaemia", "ESRD"], group: "CKD & Genetics" },
  { label: "CKD Progression", desc: "Risk stratification", scenario: "ckd-progression-engine", tags: ["CKD", "progression", "eGFR", "fibrosis", "risk"], group: "CKD & Genetics" },
  { label: "Genetic Engine", desc: "When to test + which panel", scenario: "genetic-engine", tags: ["genetics", "gene panel", "WES", "SRNS", "Alport", "COL4"], group: "CKD & Genetics" },
  { label: "Alport/HNF1B", desc: "COL4 + most missed diagnosis", scenario: "alport-hnf1b-engine", tags: ["Alport", "HNF1B", "hereditary", "COL4A5", "deafness"], group: "CKD & Genetics" },
  { label: "Fabry Engine", desc: "Alpha-Gal A deficiency → ERT", scenario: "fabry-engine", tags: ["Fabry", "GLA", "lysosomal", "ERT", "migalastat", "angiokeratoma"], group: "CKD & Genetics" },
  { label: "Cystic Kidney", desc: "ADPKD/ARPKD/NPHP/BBS", scenario: "cystic-kidney-engine", tags: ["ADPKD", "ARPKD", "nephronophthisis", "cystic", "BBS", "PKD1"], group: "CKD & Genetics" },
  { label: "Hyperoxaluria", desc: "PH1/PH2/PH3 + lumasiran", scenario: "hyperoxaluria-engine", tags: ["hyperoxaluria", "PH1", "oxalate", "lumasiran", "stones"], group: "CKD & Genetics" },
  { label: "Cystinosis", desc: "Fanconi + cysteamine", scenario: "cystinosis-engine", tags: ["cystinosis", "Fanconi", "cysteamine", "leukocyte cystine"], group: "CKD & Genetics" },

  // ── CAKUT & Urology ──
  { label: "CAKUT Engine", desc: "Antenatal HN, UPJ, Duplex, MCDK", scenario: "cakut-engine", tags: ["CAKUT", "hydronephrosis", "UPJ", "duplex", "MCDK", "antenatal"], group: "CAKUT & Urology" },
  { label: "PUV Engine", desc: "Posterior urethral valves", scenario: "puv-engine", tags: ["PUV", "posterior urethral valve", "bladder", "MCU", "ESRD risk"], group: "CAKUT & Urology" },
  { label: "Febrile UTI — Evaluation & Imaging", desc: "Post-UTI workup · ultrasound (all) · MCU indications · DMSA timing · antibiotics · prophylaxis (ISPN 2023)", scenario: "uti-febrile", tags: ["UTI", "febrile UTI", "VUR", "reflux", "DMSA", "MCU", "VCUG", "ultrasound", "recurrent UTI", "ISPN", "prophylaxis"], group: "CAKUT & Urology", ciee: true },
  { label: "Voiding Dx", desc: "BBD + Uroflow + OAB", scenario: "voiding-engine", tags: ["voiding dysfunction", "BBD", "uroflow", "OAB", "enuresis", "incontinence"], group: "CAKUT & Urology" },

  // ── Tubular & Metabolic ──
  { label: "Approach to Tubulopathy Engine", desc: "Phenotype-driven tubulopathy — RTA I–IV · Fanconi (cystinosis/Dent/Lowe/Wilson) · Bartter & Gitelman · mineralocorticoid excess · nephrogenic DI · SIADH/NSIAD · hypomagnesaemia — with targeted genetics, dosing, monitoring & suppressor safety", scenario: "tubulopathy-engine", tags: ["tubulopathy", "RTA", "renal tubular acidosis", "distal RTA", "proximal RTA", "Fanconi", "cystinosis", "Dent", "Lowe", "Bartter", "Gitelman", "Liddle", "nephrogenic diabetes insipidus", "NDI", "SIADH", "hypomagnesaemia", "hypokalemia", "alkalosis", "cysteamine", "indomethacin"], group: "Tubular & Metabolic", ciee: true },
  { label: "Rickets Engine", desc: "Calcipenic vs Phosphopenic — VDDR 1A/1B/2 · XLH · HHRH · Fanconi · Burosumab", scenario: "rickets-engine", tags: ["rickets", "XLH", "VDDR", "phosphopenic", "calcipenic", "FGF23", "burosumab", "phosphate", "hypophosphatemia", "vitamin D"], group: "Tubular & Metabolic" },
  { label: "Tubular Engine", desc: "Fanconi / XLH / NDI", scenario: "tubular-engine", tags: ["Fanconi", "rickets", "XLH", "NDI", "tubular", "phosphate"], group: "Tubular & Metabolic" },
  { label: "Stone Engine", desc: "Renal stones full workup", scenario: "stone-engine", tags: ["stones", "urolithiasis", "calcium oxalate", "cystinuria", "uric acid"], group: "Tubular & Metabolic" },
  { label: "Nephrocalcinosis", desc: "Grading + metabolic workup + management", scenario: "nephrocalcinosis-stone-engine", tags: ["nephrocalcinosis", "stones", "hypercalciuria", "oxaluria", "dRTA", "Bartter", "cystinuria"], group: "Tubular & Metabolic" },

  // ── RRT ──
  { label: "RRT Engine", desc: "Indications · PD/HD/CRRT/SLED prescriptions · Access · Monitoring", scenario: "rrt-engine", tags: ["RRT", "dialysis", "CRRT", "peritoneal dialysis", "haemodialysis", "SLED", "access", "catheter"], group: "RRT & Dialysis" },

  // ── Electrolytes Hub ──
  { label: "Electrolytes Hub", desc: "Hyperkalemia · Hypokalemia · Hypernatremia · Hyponatremia · Hypercalcemia · Hypocalcemia · Met. Alkalosis — all in one", scenario: "electrolytes-hub", tags: ["electrolytes", "sodium", "potassium", "calcium", "hypokalemia", "hypernatremia", "hypocalcemia", "hypercalcemia", "alkalosis"], group: "Emergency & Electrolytes" },

  // ── Acid-Base Hub ──
  { label: "Acid-Base Hub", desc: "pH classifier → Met. Acidosis · Met. Alkalosis · Resp. Acidosis · Resp. Alkalosis", scenario: "acid-base-hub", tags: ["acid-base", "metabolic acidosis", "alkalosis", "pH", "bicarbonate", "PCO2", "ABG", "respiratory acidosis"], group: "Emergency & Electrolytes" },

  // ── Hypertension ──
  { label: "HTN Engine", desc: "AAP 2017 + secondary workup", scenario: "htn-engine", tags: ["hypertension", "BP", "AAP 2017", "secondary HTN", "stage 2"], group: "Hypertension" },

  // ── CAKUT & Urology (new) ──
  { label: "Neurogenic Bladder", desc: "Classification · CIC · Anticholinergics · BTX · MMC · DSD · Surgical", scenario: "neurogenic-bladder-engine", tags: ["neurogenic bladder", "NB", "CIC", "DSD", "MMC", "myelomeningocele", "OAB", "CIC", "oxybutynin", "botox"], group: "CAKUT & Urology" },
  { label: "Bladder Diary / UDS Engine", desc: "Analyse bladder diary · Uroflow curves · UDS interpretation · Radiology by scenario", scenario: "bladder-diary-engine", tags: ["bladder diary", "uroflowmetry", "UDS", "uroflow", "RBUS", "VCUG", "DMSA", "MAG3", "urodynamics"], group: "CAKUT & Urology" },

  // ── Biopsy ──
  { label: "Renal Biopsy Engine", desc: "LM · IF · EM · Patterns for MCD/FSGS · IgAN · LN · MN · ANCA · Alport · C3G — linked to AI Analyser", scenario: "renal-biopsy-engine", tags: ["biopsy", "histology", "LM", "IF", "EM", "FSGS", "IgA", "lupus", "ANCA", "anti-GBM", "Alport", "C3G", "membranous", "PSGN"], group: "Glomerular Disease" },

  // ── Nutrition ──
  { label: "Renal Diet Engine", desc: "CKD · NS · Stones · Nephrocalcinosis · HD · PD · Transplant · Hyperoxaluria — what to eat, what to avoid", scenario: "diet-engine", tags: ["diet", "nutrition", "CKD diet", "renal diet", "potassium", "phosphorus", "oxalate", "nephrotic diet", "stone diet", "HD diet", "PD diet", "transplant diet"], group: "Nutrition & Diet" },

  // ── Rheumatology ──
  { label: "Rheumatology Engine", desc: "JIA · SLE/LN · ANCA Vasculitis · HSP · Periodic Fevers · JDM · KD · MAS — diagnosis + management", scenario: "rheumatology-engine", tags: ["JIA", "SLE", "lupus", "vasculitis", "ANCA", "GPA", "MPA", "HSP", "IgA vasculitis", "periodic fever", "FMF", "CAPS", "JDM", "Kawasaki", "MAS", "HLH", "arthritis", "rheumatology"], group: "Rheumatology" },

  // ── Oncology ──
  { label: "Pediatric Oncology Hub", desc: "ALL · AML · Wilms · Neuroblastoma · NHL · TLS · Febrile Neutropenia · Drug toxicity · Pathway Engine — SIOP/COG/BFM/UKALL", scenario: "oncology-hub", _customLink: "/OncologyHub", tags: ["oncology", "ALL", "AML", "leukaemia", "Wilms tumour", "neuroblastoma", "lymphoma", "TLS", "febrile neutropenia", "chemotherapy", "vincristine", "6-MP", "asparaginase", "BFM", "SIOP", "COG", "UKALL", "paediatric cancer", "actinomycin", "doxorubicin", "cisplatin", "carboplatin", "etoposide", "antifungal", "MIBG"], group: "Oncology", adminOnly: false },

  // ── Emergency & Critical Care (IAP STG 2022) ──
  // DRAFT / UNREVIEWED — adminOnly:true keeps these hidden from non-admin users
  // until Dr. Swarnim's expert clinical sign-off. Do NOT set adminOnly:false or
  // present as validated without explicit review.
  { label: "Anaphylaxis Engine", desc: "IAP STG 2022, 3.35 — recognition (skin signs not required) → immediate IM adrenaline (hard stop) → refractory loop + fluids + PICU → biphasic observation & auto-injector discharge", scenario: "anaphylaxis-engine", tags: ["anaphylaxis", "adrenaline", "epinephrine", "allergy", "allergic reaction", "auto-injector", "IAP STG", "emergency", "angioedema", "biphasic"], group: "Emergency & Critical Care", ciee: true, adminOnly: true },
  { label: "Status Epilepticus Engine", desc: "IAP STG 2022, 5.49 — time-driven convulsive SE: stabilise + glucose → benzodiazepine (0–5 min) → second-line AED (5–15 min) → refractory anaesthetic infusion + PICU → cause work-up", scenario: "status-epilepticus-engine", tags: ["status epilepticus", "seizure", "convulsion", "lorazepam", "diazepam", "midazolam", "levetiracetam", "phenytoin", "fosphenytoin", "valproate", "AED", "IAP STG", "emergency", "refractory"], group: "Emergency & Critical Care", ciee: true, adminOnly: true },
  { label: "Shock Engine", desc: "IAP STG 2022, 5.48 — undifferentiated paediatric shock: perfusion-based recognition (hypotension is late) → access & bloods → cautious isotonic boluses with reassessment → inotrope escalation → cause-directed care", scenario: "shock-engine", tags: ["shock", "septic shock", "hypovolemia", "fluid bolus", "inotrope", "adrenaline", "noradrenaline", "perfusion", "sepsis", "IAP STG", "emergency", "resuscitation"], group: "Emergency & Critical Care", ciee: true, adminOnly: true },
  { label: "Snakebite Engine", desc: "IAP STG 2022, 5.54 — snakebite: first aid → envenomation assessment (20-WBCT + neuro) → polyvalent ASV (not weight-based) → neurotoxic (neostigmine+atropine) vs haemotoxic (repeat WBCT, ASV, blood products) → renal/compartment watch", scenario: "snakebite-engine", tags: ["snakebite", "envenomation", "ASV", "antivenom", "20-WBCT", "neurotoxic", "haemotoxic", "neostigmine", "cobra", "krait", "viper", "IAP STG", "emergency"], group: "Emergency & Critical Care", ciee: true, adminOnly: true },
  { label: "Organophosphate Poisoning Engine", desc: "IAP STG 2022, 5.52 — OP poisoning: cholinergic toxidrome (DUMBELS) → decontamination (PPE) → atropine DOUBLED q5min to atropinisation then infusion → pralidoxime if organophosphate → intermediate-syndrome watch", scenario: "op-poisoning-engine", tags: ["organophosphate", "OP poisoning", "poisoning", "atropine", "pralidoxime", "2-PAM", "cholinergic", "DUMBELS", "pesticide", "insecticide", "IAP STG", "emergency"], group: "Emergency & Critical Care", ciee: true, adminOnly: true },
  { label: "Acute Bacterial Meningitis Engine", desc: "IAP STG 2022, 7.79 — meningitis: recognise (infants non-specific) → stabilise + culture, LP only if safe but NEVER delay antibiotics → ceftriaxone ± vancomycin + dexamethasone (neonates age-specific) → aciclovir if encephalitis, ICP/SIADH → follow-up + prophylaxis", scenario: "meningitis-engine", tags: ["meningitis", "bacterial meningitis", "ceftriaxone", "vancomycin", "dexamethasone", "aciclovir", "LP", "lumbar puncture", "CSF", "meningococcus", "Hib", "IAP STG", "emergency"], group: "Emergency & Critical Care", ciee: true, adminOnly: true },
  { label: "Croup Engine", desc: "IAP STG 2022, 4.40 — croup by severity: mild → oral dexamethasone home · moderate → dexamethasone + observe, add nebulised adrenaline if not settling · severe → nebulised adrenaline + dexamethasone + O₂ + airway support; rebound watch", scenario: "croup-engine", tags: ["croup", "laryngotracheobronchitis", "stridor", "barking cough", "dexamethasone", "nebulised adrenaline", "racemic epinephrine", "IAP STG", "respiratory"], group: "Respiratory", ciee: true, adminOnly: true },
  { label: "Community-Acquired Pneumonia Engine", desc: "IAP STG 2022, 2.21 — CAP: danger signs → severe (admit, O₂, IV antibiotics) · fast breathing for age ± indrawing → oral high-dose amoxicillin ×5 d, review 48 h · normal RR → no antibiotic, safety-net", scenario: "pneumonia-engine", tags: ["pneumonia", "CAP", "fast breathing", "chest indrawing", "amoxicillin", "ceftriaxone", "oxygen", "WHO", "IMNCI", "IAP STG", "respiratory"], group: "Respiratory", ciee: true, adminOnly: true },
  { label: "Acute Asthma Engine", desc: "IAP STG 2022, 2.26–27 — acute asthma by severity: salbutamol ± ipratropium + steroid scaled to severity; life-threatening → IV MgSO₄, consider IV salbutamol/aminophylline, PICU → reassess at 1 h → discharge with inhaler technique + action plan", scenario: "asthma-engine", tags: ["asthma", "wheeze", "bronchodilator", "salbutamol", "ipratropium", "prednisolone", "magnesium sulfate", "MgSO4", "exacerbation", "IAP STG", "respiratory"], group: "Respiratory", ciee: true, adminOnly: true },
  { label: "Dengue Engine", desc: "IAP STG 2022, 6.70 — WHO-classified dengue: Group A home care (paracetamol only) · Group B warning signs (admit, controlled isotonic fluids titrated to HCT) · Group C severe (bolus ± colloid, PICU) + convalescent overload watch", scenario: "dengue-engine", tags: ["dengue", "DHF", "DSS", "warning signs", "HCT", "hematocrit", "plasma leak", "fluid", "paracetamol", "IAP STG", "infection"], group: "Infectious Disease", ciee: true, adminOnly: true },
  { label: "Enteric Fever Engine", desc: "IAP STG 2022, 6.58 — enteric fever: severity triage → uncomplicated (oral cefixime/azithromycin, review 48–72 h) vs complicated/toxic (admit, IV ceftriaxone, dexamethasone for shock, surgery for perforation, carbapenem if XDR) → TCV + relapse watch", scenario: "enteric-fever-engine", tags: ["enteric fever", "typhoid", "salmonella", "cefixime", "azithromycin", "ceftriaxone", "XDR typhoid", "TCV", "IAP STG", "infection"], group: "Infectious Disease", ciee: true, adminOnly: true },
  { label: "Malaria Engine", desc: "IAP STG 2022, 6.72 — malaria: confirm RDT/microscopy + species → severe → IV artesunate + supportive care, then oral ACT · uncomplicated → ACT + single-dose primaquine (falciparum) / chloroquine + 14-day primaquine (vivax), G6PD screen first", scenario: "malaria-engine", tags: ["malaria", "falciparum", "vivax", "artesunate", "artemether-lumefantrine", "ACT", "chloroquine", "primaquine", "G6PD", "RDT", "IAP STG", "infection"], group: "Infectious Disease", ciee: true, adminOnly: true },
  { label: "Fever Without Focus Engine", desc: "IAP STG 2022, 6.57 — fever without focus by age: <3 mo → full septic screen + admit + IV antibiotics · 3–36 mo toxic/red-flag → treat as SBI · well-appearing → targeted work-up (urine ± malaria/dengue/typhoid), antipyretics, 24–48 h safety-net", scenario: "fever-without-focus-engine", tags: ["fever", "fever without focus", "FWF", "young infant", "sepsis", "serious bacterial infection", "SBI", "urine culture", "antipyretic", "IAP STG"], group: "General Pediatrics", ciee: true, adminOnly: true },
  { label: "Acute Watery Diarrhoea Engine", desc: "IAP STG 2022, 8.90 — classify dehydration → Plan A (home ORS) / Plan B (75 mL/kg ORS over 4 h) / Plan C (IV 100 mL/kg age-specific) → zinc ×14 d + continue feeding → danger-sign safety-net", scenario: "diarrhoea-engine", tags: ["diarrhoea", "diarrhea", "dehydration", "ORS", "Plan A", "Plan B", "Plan C", "zinc", "rehydration", "WHO", "IMNCI", "IAP STG"], group: "General Pediatrics", ciee: true, adminOnly: true },
  { label: "Acute Dysentery Engine", desc: "IAP STG 2022, 8.91 — dysentery (bloody stool): rehydrate + zinc → antibiotics ARE indicated (ciprofloxacin/azithromycin ×3 d) → review 48 h → non-response: amoebiasis (metronidazole) or HUS (→ nephrology engines)", scenario: "dysentery-engine", tags: ["dysentery", "bloody diarrhoea", "shigella", "ciprofloxacin", "azithromycin", "amoebiasis", "metronidazole", "HUS", "zinc", "IAP STG"], group: "General Pediatrics", ciee: true, adminOnly: true },
  { label: "Acute Otitis Media Engine", desc: "IAP STG 2022, 2.19 — AOM: treat now if <6 mo / <2 y bilateral / otorrhoea / severe → high-dose amoxicillin; else watchful waiting + analgesia + 48–72 h delayed prescription; step up to co-amoxiclav on failure; mastoiditis watch", scenario: "aom-engine", tags: ["otitis media", "AOM", "ear infection", "amoxicillin", "co-amoxiclav", "watchful waiting", "mastoiditis", "ear pain", "IAP STG"], group: "General Pediatrics", ciee: true, adminOnly: true },
  { label: "Febrile Seizure Engine", desc: "IAP STG 2022, 7.78 — febrile seizure: still seizing → treat as status epilepticus · simple → no routine EEG/imaging/LP unless meningitis suspected, reassure · complex/atypical → investigate + senior review; exclude meningitis in all", scenario: "febrile-seizure-engine", tags: ["febrile seizure", "febrile convulsion", "seizure", "fever", "simple", "complex", "meningitis", "EEG", "LP", "IAP STG", "neurology"], group: "Neurology", ciee: true, adminOnly: true },
  { label: "Neonatal Jaundice Engine", desc: "IAP STG 2022, 1.1 — neonatal jaundice: red-flag screen (<24 h, unwell, <35 wk, rapid rise, prolonged/conjugated) → urgent work-up · else plot TSB on hour-specific nomogram → phototherapy (recheck 4–6 h) → exchange transfusion if above exchange line/encephalopathy", scenario: "neonatal-jaundice-engine", tags: ["neonatal jaundice", "hyperbilirubinemia", "bilirubin", "phototherapy", "exchange transfusion", "nomogram", "kernicterus", "biliary atresia", "G6PD", "IAP STG", "neonatology"], group: "Neonatology", ciee: true, adminOnly: true },
  { label: "Iron Deficiency Anaemia Engine", desc: "IAP STG 2022, 10.100 — IDA: severe/decompensated → cautious slow transfusion + investigate · stable → oral elemental iron 3–6 mg/kg/day ×8–12 wk → reassess Hb/retic 2–4 wk → non-response → reinvestigate (smear, ferritin, Hb electrophoresis, coeliac)", scenario: "iron-deficiency-anaemia-engine", tags: ["iron deficiency", "anaemia", "anemia", "microcytic", "ferritin", "oral iron", "transfusion", "thalassaemia", "IAP STG", "haematology"], group: "Haematology", ciee: true, adminOnly: true },
  { label: "Diabetic Ketoacidosis Engine", desc: "ISPAD 2022 — paediatric DKA: confirm (hyperglycaemia + pH <7.3/HCO₃ <15 + ketosis) → severity → cautious 10 mL/kg bolus only if shocked → deficit + maintenance over 24–48 h → insulin 0.05–0.1 U/kg/h started 1–2 h after fluids (NO bolus) → potassium & dextrose rules → cerebral-oedema surveillance (mannitol / 3% saline) → SC transition on resolution", scenario: "dka-engine", tags: ["DKA", "diabetic ketoacidosis", "diabetes", "insulin", "ketones", "acidosis", "cerebral oedema", "potassium", "ISPAD", "endocrine", "emergency"], group: "Endocrine & Metabolic", ciee: true, adminOnly: true },
  { label: "Bronchiolitis Engine", desc: "IAP STG 2022 — bronchiolitis (infant <2 y, viral): clinical diagnosis → severity → SUPPORTIVE care (O₂ for SpO₂ <90–92%, nasal suction, hydration; HFNC/CPAP + PICU for severe) → admission criteria & prevention; routine bronchodilators/steroids/antibiotics/physio NOT recommended", scenario: "bronchiolitis-engine", tags: ["bronchiolitis", "RSV", "wheeze", "infant", "respiratory distress", "HFNC", "supportive", "apnoea", "IAP STG", "respiratory"], group: "Respiratory", ciee: true, adminOnly: true },
  { label: "Neonatal Sepsis Engine", desc: "IAP STG 2022 / NNF — neonatal sepsis: recognise (non-specific signs + risk factors) → onset (early <72 h vs late) → blood culture + screen ± LP → empirical IV antibiotics within 1 h (early: ampicillin + gentamicin; late: per antibiogram; ceftriaxone avoided) → supportive care → 48–72 h review, de-escalate, set duration", scenario: "neonatal-sepsis-engine", tags: ["neonatal sepsis", "newborn", "EOS", "LOS", "ampicillin", "gentamicin", "cefotaxime", "blood culture", "meningitis", "NNF", "IAP STG", "neonatology"], group: "Neonatology", ciee: true, adminOnly: true },

];

const GROUP_STYLE = {
  "Emergency & Electrolytes": "bg-red-50 border-red-200 text-red-900",
  "Glomerular Disease": "bg-blue-50 border-blue-200 text-blue-900",
  "CKD & Genetics": "bg-violet-50 border-violet-200 text-violet-900",
  "CAKUT & Urology": "bg-teal-50 border-teal-200 text-teal-900",
  "Tubular & Metabolic": "bg-amber-50 border-amber-200 text-amber-900",
  "Hypertension": "bg-rose-50 border-rose-200 text-rose-900",
  "RRT & Dialysis": "bg-indigo-50 border-indigo-200 text-indigo-900",
  "Nutrition & Diet": "bg-green-50 border-green-200 text-green-900",
  "Rheumatology": "bg-violet-50 border-violet-200 text-violet-900",
  "Oncology": "bg-red-50 border-red-200 text-red-900",
  "Emergency & Critical Care": "bg-red-50 border-red-200 text-red-900",
  "Infectious Disease": "bg-orange-50 border-orange-200 text-orange-900",
  "Respiratory": "bg-sky-50 border-sky-200 text-sky-900",
  "General Pediatrics": "bg-emerald-50 border-emerald-200 text-emerald-900",
  "Neurology": "bg-purple-50 border-purple-200 text-purple-900",
  "Neonatology": "bg-pink-50 border-pink-200 text-pink-900",
  "Haematology": "bg-rose-50 border-rose-200 text-rose-900",
  "Endocrine & Metabolic": "bg-amber-50 border-amber-200 text-amber-900",
};

const GROUP_BADGE = {
  "Emergency & Electrolytes": "bg-red-600",
  "Glomerular Disease": "bg-blue-600",
  "CKD & Genetics": "bg-violet-600",
  "CAKUT & Urology": "bg-teal-600",
  "Tubular & Metabolic": "bg-amber-600",
  "Hypertension": "bg-rose-600",
  "RRT & Dialysis": "bg-indigo-600",
  "Nutrition & Diet": "bg-green-600",
  "Rheumatology": "bg-violet-700",
  "Oncology": "bg-red-700",
  "Emergency & Critical Care": "bg-red-600",
  "Infectious Disease": "bg-orange-600",
  "Respiratory": "bg-sky-600",
  "General Pediatrics": "bg-emerald-600",
  "Neurology": "bg-purple-600",
  "Neonatology": "bg-pink-600",
  "Haematology": "bg-rose-600",
  "Endocrine & Metabolic": "bg-amber-600",
};

// Explicit group display order — Emergency & Electrolytes is shown AFTER
// Tubular & Metabolic (per clinical-pathways layout preference).
const GROUP_ORDER = [
  "Emergency & Critical Care",
  "Infectious Disease",
  "Respiratory",
  "General Pediatrics",
  "Neurology",
  "Neonatology",
  "Haematology",
  "Endocrine & Metabolic",
  "Glomerular Disease",
  "CKD & Genetics",
  "CAKUT & Urology",
  "Tubular & Metabolic",
  "Emergency & Electrolytes",
  "Hypertension",
  "RRT & Dialysis",
  "Nutrition & Diet",
  "Rheumatology",
  "Oncology",
];
const orderGroups = (groups) => {
  const known = GROUP_ORDER.filter(g => groups.includes(g));
  const rest = groups.filter(g => !GROUP_ORDER.includes(g));
  return [...known, ...rest];
};
const GROUPS = orderGroups([...new Set(ENGINES.map(e => e.group))]);

// Keyword → guideline title fragments for matching from DB
const ENGINE_GUIDELINE_KEYS = {
  "aki-engine": ["AKI", "Acute Kidney"],
  "ns-engine": ["Nephrotic", "SSNS", "SRNS", "ISKDC", "IPNA", "ISPN", "Steroid"],
  "hyperkalemia-deep-engine": ["Hyperkalemia", "Hyperkalaemia", "Potassium"],
  "hyponatremia-engine": ["Hyponatremia", "Hyponatraemia", "Sodium"],
  "hematuria-engine": ["Hematuria", "Haematuria"],
  "htn-engine": ["Hypertension", "AAP 2017", "Blood Pressure"],
  "ckd-engine": ["CKD", "Chronic Kidney Disease", "KDIGO CKD", "MBD", "Anaemia"],
  "rrt-engine": ["Dialysis", "Peritoneal Dialysis", "Haemodialysis", "CRRT", "RRT", "KDIGO AKI"],
  "polyuria-full-engine": ["Polyuria", "Diabetes Insipidus", "NDI"],
  "gn-engine": ["Glomerulonephritis", "IgA Nephropathy", "Lupus Nephritis", "FSGS", "PSGN", "Membranous"],
  "iga-ipna-engine": ["IgA Nephropathy", "IgA Vasculitis", "IgAVN", "HSP", "IPNA"],
  "ns-complications-engine": ["Nephrotic", "Complications", "Thrombosis", "Infection", "Peritonitis", "Supportive"],
  "tubulopathy-engine": ["Tubulopathy", "Renal Tubular Acidosis", "RTA", "Fanconi", "Bartter", "Gitelman", "Cystinosis", "Tubular"],
  "proteinuria-engine": ["Proteinuria", "Nephrotic"],
  "nephrocalcinosis-stone-engine": ["Nephrocalcinosis", "Stone", "Urolithiasis", "Hypercalciuria"],
  "fabry-engine": ["Fabry"],
  "cystic-kidney-engine": ["ADPKD", "ARPKD", "Cystic Kidney", "Nephronophthisis"],
  "cakut-engine": ["CAKUT", "Hydronephrosis"],
  "uti-febrile": ["UTI", "VUR", "Vesicoureteral", "ISPN", "Urinary Tract"],
  "voiding-engine": ["Voiding", "Bladder"],
  "neurogenic-bladder-engine": ["Neurogenic", "Bladder", "CIC", "Spina Bifida"],
  "bladder-diary-engine": ["Voiding", "Bladder", "Uroflow", "Urodynamics"],
  "renal-biopsy-engine": ["Glomerulonephritis", "FSGS", "IgA Nephropathy", "Lupus Nephritis", "Biopsy"],
  "diet-engine": ["CKD", "Nutrition", "Nephrotic Syndrome", "Stone", "Dialysis", "Transplant"],
  "rheumatology-engine": ["SLE", "Lupus", "Vasculitis", "JIA", "Arthritis", "HSP", "ANCA", "Kawasaki"],
  "electrolytes-hub": ["Electrolyte", "Potassium", "Sodium", "Calcium"],
  "acid-base-hub": ["Acid-Base", "Metabolic Acidosis", "Alkalosis", "ABG"],
  "hyperoxaluria-engine": ["Hyperoxaluria", "Primary Hyperoxaluria"],
  "cystinosis-engine": ["Cystinosis"],
  "stone-engine": ["Stone", "Urolithiasis", "Nephrolithiasis"],
  "tubular-engine": ["Tubular", "Fanconi", "RTA"],
  "rpgn-deep-engine": ["RPGN", "Crescentic"],
  "ckd-progression-engine": ["CKD", "Chronic Kidney"],
  "genetic-engine": ["Genetic", "Gene"],
};

function GuidelineSidebar({ scenario, guidelines, loading }) {
  const keys = ENGINE_GUIDELINE_KEYS[scenario] || [];
  const matched = (guidelines || []).filter(g =>
    keys.some(k => g.title?.toLowerCase().includes(k.toLowerCase()) || g.category?.toLowerCase().includes(k.toLowerCase()))
  ).slice(0, 6);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs font-bold text-slate-600">Evidence Base</span>
      </div>
      {loading && <p className="text-xs text-slate-400">Loading guidelines…</p>}
      {!loading && matched.length === 0 && (
        <p className="text-xs text-slate-400 italic">No linked guidelines found</p>
      )}
      {matched.map((g, i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-lg p-2 space-y-0.5">
          <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">{g.title}</p>
          <div className="flex items-center gap-1 flex-wrap">
            {g.source && <Badge variant="outline" className="text-xs py-0 px-1.5">{g.source}</Badge>}
            {g.year && <span className="text-xs text-slate-400">{g.year}</span>}
          </div>
          {g.external_link && (
            <a href={g.external_link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-xs text-blue-600 hover:underline">
              <ExternalLink className="w-3 h-3" /> View
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default function IntelligenceEnginesTab({ onSelectEngine, onBack }) {
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const [activeEngine, setActiveEngine] = useState(null);
  // Collapsible groups — default collapsed so only headings show ("clean" view).
  // A search query or a specific group filter forces the relevant groups open.
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());
  const toggleGroup = (g) => setExpandedGroups(prev => {
    const next = new Set(prev);
    next.has(g) ? next.delete(g) : next.add(g);
    return next;
  });
  const isGroupOpen = (g) => !!search.trim() || activeGroup !== "All" || expandedGroups.has(g);

  // Fetch current user role for admin-only engine visibility
  const { data: currentUser } = useQuery({
    queryKey: ["current-user-engines"],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const isAdmin = currentUser?.role === "admin";

  // Fetch guidelines from DB — cached in localStorage for offline use
  const { data: guidelines = [], isLoading: guidelinesLoading } = useQuery({
    queryKey: ["guidelines-for-engines"],
    queryFn: async () => {
      const data = await base44.entities.Guideline.list("-year", 200);
      try { localStorage.setItem("cached_guidelines_for_engines", JSON.stringify(data)); } catch {}
      return data;
    },
    initialData: () => {
      try {
        const cached = localStorage.getItem("cached_guidelines_for_engines");
        return cached ? JSON.parse(cached) : undefined;
      } catch { return undefined; }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 24 * 60 * 60 * 1000, // keep in memory 24h
    retry: false,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ENGINES.filter(e => {
      if (e.adminOnly && !isAdmin) return false; // hide admin-only engines from regular users
      const matchGroup = activeGroup === "All" || e.group === activeGroup;
      const matchSearch = !q || e.label.toLowerCase().includes(q) ||
        e.desc.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q));
      return matchGroup && matchSearch;
    });
  }, [search, activeGroup, isAdmin]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(e => {
      if (!g[e.group]) g[e.group] = [];
      g[e.group].push(e);
    });
    return g;
  }, [filtered]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="w-5 h-5 text-slate-700" />
          <h2 className="font-bold text-base text-slate-900">Intelligence Engines</h2>
          <Badge variant="outline" className="text-xs font-bold">{ENGINES.length}</Badge>
        </div>
        <p className="text-xs text-slate-500">Advanced diagnostic decision engines — fully offline capable</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by disease, symptom, age group…"
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Group filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {["All", ...GROUPS].map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
              ${activeGroup === g
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
            {g}
          </button>
        ))}
      </div>

      {/* Expand / collapse all — only meaningful in the default (unfiltered) view */}
      {Object.keys(grouped).length > 0 && !search.trim() && activeGroup === "All" && (
        <div className="flex justify-end -mb-1">
          <button
            onClick={() => {
              const all = orderGroups(Object.keys(grouped));
              setExpandedGroups(all.every(g => expandedGroups.has(g)) ? new Set() : new Set(all));
            }}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            {orderGroups(Object.keys(grouped)).every(g => expandedGroups.has(g)) ? "Collapse all" : "Expand all"}
          </button>
        </div>
      )}

      {/* Engine list grouped */}
      {Object.keys(grouped).length === 0 && (
        <p className="text-center text-slate-400 py-8 text-sm">No engines match your search</p>
      )}

      {orderGroups(Object.keys(grouped)).map((group) => {
        const engines = grouped[group];
        const open = isGroupOpen(group);
        return (
        <div key={group} className="space-y-2">
          <button
            onClick={() => toggleGroup(group)}
            aria-expanded={open}
            className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors
              ${open ? "bg-slate-50 border-slate-300" : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 min-w-0">
                <Badge className={`text-xs flex-shrink-0 ${GROUP_BADGE[group] || "bg-slate-600"}`}>{group}</Badge>
                <span className="text-xs text-slate-400 flex-shrink-0">{engines.length} engine{engines.length === 1 ? "" : "s"}</span>
                {engines.some(e => e.ciee) && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded flex-shrink-0">
                    <Cpu className="w-2.5 h-2.5" /> CIEE
                  </span>
                )}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? "" : "-rotate-90"}`} />
            </span>
            {!open && (
              <span className="block text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                {engines.map(e => e.label).join(" · ")}
              </span>
            )}
          </button>

          {open && (
          <div className="space-y-1.5">
            {engines.map(eng => (
              <div key={eng.scenario}>
                <button
                  onClick={() => {
                    setActiveEngine(activeEngine === eng.scenario ? null : eng.scenario);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left
                    ${activeEngine === eng.scenario
                      ? "border-indigo-400 bg-indigo-50"
                      : eng.ciee
                        ? "border-indigo-200 bg-indigo-50/40 hover:border-indigo-400 hover:bg-indigo-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-slate-900">{eng.label}</p>
                        {eng.ciee && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                            <Cpu className="w-2.5 h-2.5" /> CIEE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{eng.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {eng._customLink ? (
                      <Link to={eng._customLink}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                        onClick={e => e.stopPropagation()}>
                        Open <ChevronRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); onSelectEngine(eng.scenario); }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors">
                        Open <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </button>

                {/* Expanded guideline sidebar */}
                {activeEngine === eng.scenario && (
                  <div className="mt-1.5 ml-2 pl-3 border-l-2 border-slate-200">
                    <GuidelineSidebar scenario={eng.scenario} guidelines={guidelines} loading={guidelinesLoading} />
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
        );
      })}

      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="w-full py-2.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-1">
          ← Back to Pathways
        </button>
      )}
    </div>
  );
}