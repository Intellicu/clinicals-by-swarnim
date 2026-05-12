import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, ArrowRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE KNOWLEDGE INDEX
// Each entry: { title, category, page, tags[] }
// Tags should include all synonyms, abbreviations, drug names, disease terms
// ─────────────────────────────────────────────────────────────────────────────
const SEARCH_INDEX = [

  // ── GLOMERULAR DISEASES ──────────────────────────────────────────────────
  { title: "Minimal Change Disease (MCD)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["MCD", "minimal change", "nephrotic", "prednisolone", "SSNS", "FRNS", "SDNS", "steroid sensitive", "foot process", "podocyte"] },
  { title: "FSGS – Focal Segmental Glomerulosclerosis", category: "GN Pathway", page: "GlomerularDiseases", tags: ["FSGS", "focal segmental", "podocin", "NPHS2", "tacrolimus", "cyclosporin", "sparsentan", "steroid resistant", "CNI"] },
  { title: "Membranous Nephropathy (MN)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["membranous", "MN", "PLA2R", "THSD7A", "rituximab", "spontaneous remission", "anticoagulation", "cyclophosphamide", "Ponticelli", "nephrotic"] },
  { title: "IgA Nephropathy (IgAN)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["IgAN", "IgA nephropathy", "Oxford MEST", "MEST-C", "SGLT2", "dapagliflozin", "budesonide", "nefecon", "sparsentan", "haematuria", "atrasentan"] },
  { title: "IgA Vasculitis Nephritis (HSP)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["IgAV", "HSP", "Henoch Schonlein", "purpura", "IgA vasculitis", "ISKDC", "proteinuria"] },
  { title: "Post-Streptococcal GN (PSGN)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["PSGN", "post-streptococcal", "streptococcal", "ASO", "anti-DNase", "low C3", "complement", "self-limiting", "haematuria"] },
  { title: "MPGN – Membranoproliferative GN", category: "GN Pathway", page: "GlomerularDiseases", tags: ["MPGN", "membranoproliferative", "tram-track", "complement", "cryoglobulin", "hepatitis C", "immune complex"] },
  { title: "C3 Glomerulopathy (C3GN / DDD)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["C3G", "C3 glomerulopathy", "C3GN", "DDD", "dense deposit", "complement", "CFH", "factor H", "eculizumab", "iptacopan", "C3NeF", "alternative pathway"] },
  { title: "Lupus Nephritis (LN)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["lupus nephritis", "LN", "SLE", "ISN RPS", "class III", "class IV", "class V", "MMF", "belimumab", "voclosporin", "hydroxychloroquine", "CYC", "wire loop"] },
  { title: "ANCA Vasculitis GN (GPA/MPA)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["ANCA", "vasculitis", "GPA", "MPA", "PR3", "MPO", "crescentic", "rituximab", "avacopan", "cyclophosphamide", "pauci-immune", "rapidly progressive"] },
  { title: "Anti-GBM Disease / Goodpasture", category: "GN Pathway", page: "GlomerularDiseases", tags: ["anti-GBM", "Goodpasture", "plasma exchange", "pulmonary haemorrhage", "linear IgG", "COL4A3", "crescentic", "RPGN"] },
  { title: "aHUS – Atypical HUS / TMA", category: "GN Pathway", page: "GlomerularDiseases", tags: ["aHUS", "TMA", "thrombotic microangiopathy", "eculizumab", "ravulizumab", "complement", "CFH", "STEC-HUS", "ADAMTS13", "TTP", "microangiopathic"] },
  { title: "C3 Glomerulopathy – Treatment", category: "GN Pathway", page: "GlomerularDiseases", tags: ["C3G treatment", "iptacopan", "APPEAR-C3G", "factor B inhibitor", "MMF C3", "C3 low complement"] },
  { title: "Diabetic Nephropathy / DKD", category: "GN Pathway", page: "GlomerularDiseases", tags: ["DKD", "diabetic nephropathy", "SGLT2", "finerenone", "GLP-1", "empagliflozin", "Kimmelstiel-Wilson", "KDIGO 2022 diabetes"] },
  { title: "Alport Syndrome / COL4 Nephropathy", category: "GN Pathway", page: "GlomerularDiseases", tags: ["Alport", "COL4A3", "COL4A4", "COL4A5", "hearing loss", "lenticonus", "basket weave", "ADAS", "XLAS", "ACEi Alport"] },
  { title: "Thin GBM Disease / Benign Familial Haematuria", category: "GN Pathway", page: "GlomerularDiseases", tags: ["thin GBM", "benign familial haematuria", "COL4A3", "ADAS", "microscopic haematuria"] },
  { title: "IgG4-Related Kidney Disease", category: "GN Pathway", page: "GlomerularDiseases", tags: ["IgG4", "IgG4-RKD", "storiform fibrosis", "tubulointerstitial nephritis", "IgG4 plasma cells", "autoimmune pancreatitis"] },
  { title: "Congenital Nephrotic Syndrome (CNS)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["congenital nephrotic", "CNS", "NPHS1", "nephrin", "Finnish type", "DMS", "LAMB2", "Pierson", "WT1", "bilateral nephrectomy"] },
  { title: "Fibrillary GN / DNAJB9", category: "GN Pathway", page: "GlomerularDiseases", tags: ["fibrillary GN", "immunotactoid", "DNAJB9", "Congo red", "fibrils", "microtubules", "rituximab fibrillary"] },

  // ── NEPHROTIC SYNDROME PROTOCOLS ──────────────────────────────────────────
  { title: "Nephrotic Syndrome – ISKDC Protocol", category: "Pathway", page: "ClinicalSupport", tags: ["nephrotic", "ISKDC", "prednisolone", "remission", "relapse", "SSNS", "FRNS", "SDNS", "SRNS", "proteinuria"] },
  { title: "Steroid-Resistant NS (SRNS)", category: "Pathway", page: "GlomerularDiseases", tags: ["SRNS", "steroid resistant", "tacrolimus", "cyclosporin", "CNI", "rituximab", "NPHS2", "genetic nephrotic"] },
  { title: "Frequently Relapsing NS (FRNS / SDNS)", category: "Pathway", page: "GlomerularDiseases", tags: ["FRNS", "SDNS", "steroid dependent", "frequently relapsing", "MMF", "levamisole", "rituximab", "cyclophosphamide"] },
  { title: "NS Steroid Protocol – Prednisolone", category: "Pathway", page: "ClinicalSupport", tags: ["prednisolone", "steroid protocol", "60 mg/m2", "NS steroids", "taper", "alternate day"] },

  // ── AKI ───────────────────────────────────────────────────────────────────
  { title: "AKI – KDIGO Staging & Management", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-prifle", tags: ["AKI", "acute kidney injury", "KDIGO", "creatinine", "oliguria", "staging", "pRIFLE"] },
  { title: "AKI – Steroids / AIN", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-prifle", tags: ["AKI steroids", "steroid AKI", "interstitial nephritis AIN", "methylprednisolone AKI", "ANCA AKI", "rapidly progressive"] },
  { title: "AKI in Neonates", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-prifle", tags: ["neonatal AKI", "neonate AKI", "neonatal kidney injury", "perinatal asphyxia"] },
  { title: "AKI-to-CKD Transition", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-comprehensive", tags: ["AKI CKD", "post-AKI", "transition", "chronic kidney", "recovery"] },
  { title: "Nephrotoxin / Contrast AKI Prevention", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=contrast-nephropathy", tags: ["nephrotoxin", "aminoglycoside", "vancomycin", "NSAID", "contrast", "amphotericin", "nephrotoxic"] },
  { title: "AKI Stager – KDIGO/pRIFLE", category: "Calculator", page: "AKIStager", tags: ["AKI staging", "pRIFLE", "KDIGO AKI", "creatinine ratio", "urine output"] },
  { title: "AKI – Dialysis Indications (AEIOU)", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-dialysis-timing", tags: ["dialysis AKI", "AKI dialysis timing", "AEIOU", "RRT indications"] },
  { title: "Fluid Management in AKI", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=fluid-electrolyte", tags: ["fluid AKI", "fluid management", "overload", "Holliday-Segar", "maintenance fluid"] },
  { title: "Tumor Lysis Syndrome (TLS)", category: "Emergency", page: "EmergencyHub", tags: ["TLS", "tumor lysis", "uric acid", "rasburicase", "hyperkalemia", "hyperphosphatemia"] },

  // ── CKD ───────────────────────────────────────────────────────────────────
  { title: "CKD Staging (KDIGO G1-G5)", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-staging", tags: ["CKD", "chronic kidney disease", "KDIGO", "eGFR", "staging", "G1 G2 G3 G4 G5"] },
  { title: "CKD-MBD – Mineral Bone Disease", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-mbd", tags: ["CKD-MBD", "mineral bone", "PTH", "phosphorus", "calcium", "vitamin D", "cinacalcet", "calcification"] },
  { title: "Anemia of CKD – EPO & Iron", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-anemia-mbd", tags: ["anemia CKD", "EPO", "erythropoietin", "iron deficiency", "ferritin", "transferrin saturation", "darbepoetin"] },
  { title: "CKD Comprehensive Management", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-comprehensive", tags: ["CKD management", "CKD nutrition", "CKD hypertension", "RRT planning", "dialysis preparation", "transplant referral"] },
  { title: "CKD Nutrition & Growth", category: "Pathway", page: "NutritionHub", tags: ["CKD nutrition", "renal diet", "growth CKD", "protein restriction", "phosphorus diet"] },
  { title: "CKD Calculator (Schwartz GFR)", category: "Calculator", page: "SchwartzGFR", tags: ["Schwartz", "GFR", "eGFR", "creatinine", "height", "CKiD", "CKD-EPI"] },

  // ── DIALYSIS & RRT ────────────────────────────────────────────────────────
  { title: "Hemodialysis (HD) Protocol", category: "Dialysis", page: "RRTAssistant", tags: ["hemodialysis", "HD", "Kt/V", "URR", "blood flow", "dialysate", "AVF", "CVC", "intradialytic hypotension"] },
  { title: "Peritoneal Dialysis (PD) Protocol", category: "Dialysis", page: "RRTAssistant", tags: ["peritoneal dialysis", "PD", "CCPD", "CAPD", "APD", "PET", "peritonitis", "exit site", "dwell"] },
  { title: "CRRT – Continuous Renal Replacement", category: "Dialysis", page: "RRTAssistant", tags: ["CRRT", "CVVHDF", "CVVH", "continuous RRT", "citrate anticoagulation", "PICU dialysis", "filter life", "effluent dose"] },
  { title: "Plasma Exchange (PLEX)", category: "Dialysis", page: "RRTAssistant", tags: ["plasma exchange", "PLEX", "plasmapheresis", "aHUS", "TTP", "ANCA", "anti-GBM", "FFP", "albumin replacement"] },
  { title: "Dialysis Adequacy – Kt/V", category: "Calculator", page: "KtVCalculator", tags: ["Kt/V", "URR", "adequacy", "hemodialysis", "dialysis dose"] },
  { title: "Acute PD – Pediatric Protocol", category: "Dialysis", page: "RRTAssistant", tags: ["acute PD", "acute peritoneal dialysis", "fill volume", "dwell time", "AKI dialysis"] },

  // ── TRANSPLANT ────────────────────────────────────────────────────────────
  { title: "Kidney Transplant – Immunosuppression", category: "Transplant", page: "UrologyNephrologyHub", tags: ["transplant", "immunosuppression", "tacrolimus", "MMF", "prednisolone", "basiliximab", "induction"] },
  { title: "Transplant Rejection – TCMR / ABMR", category: "Transplant", page: "UrologyNephrologyHub", tags: ["rejection", "TCMR", "ABMR", "antibody mediated", "DSA", "Banff", "biopsy", "pulse steroids"] },
  { title: "BK Virus Nephropathy", category: "Transplant", page: "UrologyNephrologyHub", tags: ["BK virus", "BKV", "polyomavirus", "SV40", "viremia", "leflunomide", "cidofovir", "immunosuppression reduction"] },
  { title: "CMV Disease Post-Transplant", category: "Transplant", page: "UrologyNephrologyHub", tags: ["CMV", "cytomegalovirus", "valganciclovir", "ganciclovir", "D+R-", "prophylaxis", "maribavir"] },
  { title: "PTLD – Post-Transplant Lymphoproliferative", category: "Transplant", page: "UrologyNephrologyHub", tags: ["PTLD", "post-transplant lymphoma", "EBV", "rituximab", "CHOP", "lymphoproliferative"] },
  { title: "Transplant Monitoring Protocol", category: "Transplant", page: "UrologyNephrologyHub", tags: ["transplant monitoring", "tacrolimus trough", "DSA monitoring", "BK PCR", "CMV PCR", "renal function post-transplant"] },

  // ── HYPERTENSION ─────────────────────────────────────────────────────────
  { title: "Pediatric Hypertension Classification (2017 AAP)", category: "Pathway", page: "BPPercentiles", tags: ["hypertension", "HTN", "blood pressure", "AAP 2017", "stage 1 HTN", "stage 2", "percentile", "elevated BP"] },
  { title: "Neonatal Hypertension", category: "Pathway", page: "UrologyNephrologyHub", tags: ["neonatal hypertension", "newborn BP", "amlodipine neonate", "renovascular", "renal artery thrombosis"] },
  { title: "ABPM – Ambulatory Blood Pressure Monitoring", category: "Pathway", page: "UrologyNephrologyHub", tags: ["ABPM", "ambulatory BP", "24h monitoring", "white coat hypertension", "masked hypertension", "non-dipping"] },
  { title: "Monogenic Hypertension (GRA, Liddle, AME)", category: "Pathway", page: "UrologyNephrologyHub", tags: ["monogenic hypertension", "GRA", "glucocorticoid remediable aldosteronism", "Liddle syndrome", "AME", "Gordon", "WNK kinase", "low renin hypertension"] },
  { title: "Hypertensive Emergency", category: "Emergency", page: "EmergencyHub", tags: ["hypertensive emergency", "hypertensive crisis", "nicardipine", "labetalol", "esmolol", "MAP reduction", "encephalopathy"] },
  { title: "BP Percentile Calculator", category: "Calculator", page: "BPPercentiles", tags: ["blood pressure", "BP percentile", "hypertension", "height", "age", "sex", "2017 AAP"] },

  // ── ELECTROLYTES ─────────────────────────────────────────────────────────
  { title: "Hyperkalemia Management", category: "Emergency", page: "EmergencyHub", tags: ["hyperkalemia", "high potassium", "calcium gluconate", "salbutamol", "insulin glucose", "kayexalate", "dialysis potassium", "ECG changes"] },
  { title: "Hyponatremia", category: "Pathway", page: "ClinicalSupport", tags: ["hyponatremia", "low sodium", "SIADH", "sodium correction", "3% NaCl", "Furst formula", "osmolality"] },
  { title: "Hypernatremia", category: "Pathway", page: "ClinicalSupport", tags: ["hypernatremia", "high sodium", "diabetes insipidus", "free water deficit", "dehydration"] },
  { title: "Hypocalcemia", category: "Pathway", page: "ClinicalSupport", tags: ["hypocalcemia", "low calcium", "tetany", "calcium gluconate IV", "vitamin D", "PTH", "hypoparathyroidism"] },
  { title: "Hypercalcemia", category: "Pathway", page: "ClinicalSupport", tags: ["hypercalcemia", "high calcium", "hypervitaminosis D", "hyperparathyroidism", "sarcoidosis", "bisphosphonate"] },
  { title: "Hypokalemia", category: "Pathway", page: "ClinicalSupport", tags: ["hypokalemia", "low potassium", "potassium replacement", "Bartter", "Gitelman", "RTA type 1"] },
  { title: "Metabolic Acidosis / Anion Gap", category: "Calculator", page: "ABGInterpreter", tags: ["metabolic acidosis", "anion gap", "HAGMA", "NAGMA", "bicarbonate", "pH", "delta delta"] },
  { title: "Metabolic Alkalosis", category: "Pathway", page: "ClinicalSupport", tags: ["metabolic alkalosis", "alkalosis", "chloride responsive", "vomiting", "diuretic", "Bartter"] },
  { title: "Sodium Calculator", category: "Calculator", page: "SodiumCalculator", tags: ["sodium", "hyponatremia correction", "3% saline", "free water deficit", "osmolality"] },
  { title: "Potassium Calculator", category: "Calculator", page: "PotassiumCalculator", tags: ["potassium", "hyperkalemia", "hypokalaemia", "K+ replacement"] },
  { title: "Anion Gap Calculator", category: "Calculator", page: "AnionGap", tags: ["anion gap", "AG", "metabolic acidosis", "Na K Cl HCO3"] },

  // ── TUBULAR DISORDERS ─────────────────────────────────────────────────────
  { title: "Renal Tubular Acidosis (RTA)", category: "Pathway", page: "ClinicalApproaches", tags: ["RTA", "renal tubular acidosis", "type 1", "type 2", "type 4", "distal RTA", "proximal RTA", "TTKG", "urine anion gap"] },
  { title: "RTA Classifier", category: "Calculator", page: "RTAClassifier", tags: ["RTA classifier", "RTA type", "distal proximal", "urine pH", "TTKG", "renal tubular acidosis"] },
  { title: "Fanconi Syndrome", category: "Pathway", page: "ClinicalApproaches", tags: ["Fanconi", "tubular dysfunction", "glucosuria", "phosphaturia", "bicarbonate wasting", "cystinosis", "Wilson"] },
  { title: "Bartter Syndrome", category: "Pathway", page: "ClinicalApproaches", tags: ["Bartter", "hypokalemia", "metabolic alkalosis", "salt wasting", "polyuria"] },
  { title: "Gitelman Syndrome", category: "Pathway", page: "ClinicalApproaches", tags: ["Gitelman", "hypokalemia", "hypomagnesemia", "metabolic alkalosis", "NCCT mutation"] },
  { title: "Nephrolithiasis / Kidney Stones", category: "Pathway", page: "ClinicalApproaches", tags: ["kidney stones", "nephrolithiasis", "hypercalciuria", "hyperoxaluria", "urate stones", "calcium oxalate", "stone risk"] },
  { title: "FENa Calculator", category: "Calculator", page: "FENaCalculator", tags: ["FENa", "fractional excretion sodium", "prerenal AKI", "intrinsic AKI"] },
  { title: "TTKG Calculator", category: "Calculator", page: "TTKGCalculator", tags: ["TTKG", "transtubular potassium gradient", "hyperkalemia", "hypokalemia RTA"] },
  { title: "TRP Calculator", category: "Calculator", page: "TRPCalculator", tags: ["TRP", "tubular reabsorption phosphorus", "Fanconi", "phosphaturia"] },
  { title: "FEMg Calculator", category: "Calculator", page: "FEMgCalculator", tags: ["FEMg", "fractional excretion magnesium", "hypomagnesemia", "Gitelman", "tubular"] },
  { title: "FEUrea Calculator", category: "Calculator", page: "FEUreaCalculator", tags: ["FEUrea", "fractional excretion urea", "AKI", "prerenal"] },
  { title: "Stone Risk Assessment", category: "Pathway", page: "StoneRisk", tags: ["stone risk", "metabolic evaluation", "24h urine", "oxalate", "citrate", "uric acid", "Tiselius"] },
  { title: "Osmolar Gap", category: "Calculator", page: "OsmolarGap", tags: ["osmolar gap", "osmol gap", "toxic alcohol", "methanol", "ethylene glycol"] },

  // ── CAKUT & UROLOGY ───────────────────────────────────────────────────────
  { title: "CAKUT – Congenital Anomalies Kidney & Urinary Tract", category: "Urology", page: "UrologyNephrologyHub", tags: ["CAKUT", "congenital anomalies", "hydronephrosis", "VUR", "PUJ", "VUJ", "renal agenesis", "horseshoe kidney", "duplex"] },
  { title: "VUR – Vesicoureteral Reflux", category: "Urology", page: "UrologyNephrologyHub", tags: ["VUR", "vesicoureteral reflux", "VCUG", "reflux grading", "DMSA scar", "prophylaxis", "ureteric reimplantation"] },
  { title: "Antenatal Hydronephrosis (ANH)", category: "Urology", page: "UrologyNephrologyHub", tags: ["antenatal hydronephrosis", "ANH", "APRPD", "SFU grade", "RBUS postnatal", "UPJO", "posterior urethral valves"] },
  { title: "Posterior Urethral Valves (PUV)", category: "Urology", page: "UrologyNephrologyHub", tags: ["posterior urethral valves", "PUV", "valve bladder", "VCUG", "ablation", "bladder dysfunction"] },
  { title: "Neurogenic Bladder (NGB)", category: "Urology", page: "UrologyNephrologyHub", tags: ["neurogenic bladder", "NGB", "spina bifida", "myelomeningocele", "CIC", "clean intermittent catheterisation", "oxybutynin", "UDS", "upper tract protection"] },
  { title: "BBD – Bladder Bowel Dysfunction", category: "Urology", page: "UrologyNephrologyHub", tags: ["BBD", "bladder bowel dysfunction", "OAB", "overactive bladder", "constipation", "enuresis", "voiding dysfunction", "urotherapy", "ICCS"] },
  { title: "Clean Intermittent Catheterization (CIC)", category: "Urology", page: "UrologyNephrologyHub", tags: ["CIC", "clean intermittent catheterisation", "catheter", "bladder emptying", "hydrophilic", "neurogenic bladder"] },
  { title: "Enuresis – Nocturnal Bedwetting", category: "Urology", page: "UrologyNephrologyHub", tags: ["enuresis", "bedwetting", "nocturnal enuresis", "desmopressin", "alarm therapy", "ICCS classification"] },
  { title: "UDS – Urodynamic Study Interpretation", category: "Urology", page: "UrologyNephrologyHub", tags: ["UDS", "urodynamics", "cystometry", "detrusor overactivity", "DO", "sphincter dyssynergia", "DSD", "bladder compliance", "Pdet", "storage dysfunction"] },
  { title: "Uroflowmetry AI Analyzer", category: "AI Tool", page: "UrologyNephrologyHub", tags: ["uroflow", "uroflowmetry", "flow rate", "Qmax", "bell curve", "staccato", "intermittent flow", "tower pattern"] },
  { title: "VCUG – Voiding Cystourethrogram", category: "Imaging", page: "UrologyNephrologyHub", tags: ["VCUG", "voiding cystourethrogram", "VUR grade", "cystogram", "contrast", "fluoroscopy"] },
  { title: "DMSA Scan – Renal Cortical Imaging", category: "Imaging", page: "UrologyNephrologyHub", tags: ["DMSA", "renal scan", "cortical scintigraphy", "scar", "split function", "pyelonephritis"] },
  { title: "MAG3 Scan + Diuresis Renogram", category: "Imaging", page: "UrologyNephrologyHub", tags: ["MAG3", "renogram", "diuresis", "UPJO", "obstruction", "T1/2", "drainage", "differential function"] },
  { title: "Renal Ultrasound (RBUS)", category: "Imaging", page: "UrologyNephrologyHub", tags: ["RBUS", "renal ultrasound", "kidney size", "echogenicity", "hydronephrosis", "corticomedullary", "bladder wall"] },

  // ── UTI ───────────────────────────────────────────────────────────────────
  { title: "UTI – Pediatric Management", category: "Pathway", page: "UrologyNephrologyHub", tags: ["UTI", "urinary tract infection", "cystitis", "pyelonephritis", "febrile UTI", "ISPN", "NICE UTI"] },
  { title: "UTI – Neonatal (< 28 days)", category: "Pathway", page: "UrologyNephrologyHub", tags: ["neonatal UTI", "newborn UTI", "ampicillin gentamicin", "sepsis", "SPA", "catheter specimen"] },
  { title: "MDR UTI / ESBL Organisms", category: "Pathway", page: "UrologyNephrologyHub", tags: ["MDR UTI", "ESBL", "multi-drug resistant", "meropenem", "ertapenem", "fosfomycin", "carbapenem"] },
  { title: "UTI Prophylaxis (CAP)", category: "Pathway", page: "UrologyNephrologyHub", tags: ["CAP", "continuous antibiotic prophylaxis", "nitrofurantoin", "cotrimoxazole", "TMP-SMX", "VUR prophylaxis"] },
  { title: "Urotherapy – Behavioral Bladder Training", category: "Urology", page: "UrologyNephrologyHub", tags: ["urotherapy", "bladder training", "timed voiding", "double voiding", "pelvic floor", "biofeedback"] },

  // ── PROTEINURIA & HAEMATURIA ──────────────────────────────────────────────
  { title: "Proteinuria – Investigation & Management", category: "Pathway", page: "Proteinuria", tags: ["proteinuria", "UPCR", "ACR", "24h urine", "nephrotic range", "nephrotic syndrome", "microalbuminuria"] },
  { title: "Haematuria – Approach", category: "Pathway", page: "ClinicalApproaches", tags: ["haematuria", "blood urine", "microscopic haematuria", "macroscopic haematuria", "RBC casts", "hypercalciuria", "IgA nephropathy", "thin GBM"] },

  // ── RESEARCH METHODS ─────────────────────────────────────────────────────
  { title: "Sample Size Calculation", category: "Research", page: "ResearchMethodsHub", tags: ["sample size", "power calculation", "alpha error", "beta error", "type I II", "effect size", "n calculation", "statistical power"] },
  { title: "Study Design – RCT / Cohort / Case-Control", category: "Research", page: "ResearchMethodsHub", tags: ["RCT", "randomized controlled trial", "cohort", "case-control", "cross-sectional", "prospective", "retrospective", "study design"] },
  { title: "CONSORT Reporting Checklist", category: "Research", page: "ResearchMethodsHub", tags: ["CONSORT", "RCT reporting", "flow diagram", "allocation concealment", "blinding"] },
  { title: "STROBE Checklist (Observational Studies)", category: "Research", page: "ResearchMethodsHub", tags: ["STROBE", "cohort", "case-control", "cross-sectional", "observational study", "reporting"] },
  { title: "PRISMA – Systematic Review & Meta-analysis", category: "Research", page: "ResearchMethodsHub", tags: ["PRISMA", "meta-analysis", "systematic review", "forest plot", "funnel plot", "GRADE", "heterogeneity"] },
  { title: "Biostatistics – Tests & P-values", category: "Research", page: "ResearchMethodsHub", tags: ["biostatistics", "p-value", "confidence interval", "chi-square", "Mann-Whitney", "t-test", "Fisher", "ANOVA", "Kaplan-Meier", "survival analysis"] },
  { title: "Research OS – Project Workspace", category: "Research", page: "ResearchOS", tags: ["research OS", "CRF", "case report form", "study data", "REDCap", "data entry", "project"] },
  { title: "Literature Search & AI Assistant", category: "Research", page: "ResearchHub", tags: ["literature search", "PubMed", "citation", "AI research assistant", "PICO", "systematic review"] },
  { title: "Prediction Tools (IgAN, SRNS Risk)", category: "Research", page: "PredictionTools", tags: ["prediction tool", "risk score", "IgAN prediction", "SRNS predictor", "outcome", "progression risk"] },

  // ── IMMUNOSUPPRESSANTS / BIOLOGICS ────────────────────────────────────────
  { title: "Rituximab – Dosing & Monitoring", category: "Drug", page: "DrugsDosing", tags: ["rituximab", "anti-CD20", "B-cell depletion", "FRNS", "SDNS", "MN rituximab", "ANCA", "375 mg/m2"] },
  { title: "Tacrolimus (FK506) – Pediatric Dosing", category: "Drug", page: "DrugsDosing", tags: ["tacrolimus", "FK506", "CNI", "calcineurin inhibitor", "trough level", "nephrotoxicity", "SRNS", "transplant"] },
  { title: "Cyclosporin / Cyclosporine", category: "Drug", page: "DrugsDosing", tags: ["cyclosporin", "cyclosporine", "CSA", "calcineurin inhibitor", "trough", "nephrotoxicity", "FSGS", "SRNS"] },
  { title: "Mycophenolate Mofetil (MMF)", category: "Drug", page: "DrugsDosing", tags: ["MMF", "mycophenolate", "CellCept", "mofetil", "FRNS", "lupus", "transplant"] },
  { title: "Prednisolone / Steroid Protocol", category: "Drug", page: "DrugsDosing", tags: ["prednisolone", "prednisone", "methylprednisolone", "steroid", "alternate day", "taper", "side effects"] },
  { title: "Eculizumab / Ravulizumab – Anti-C5", category: "Drug", page: "DrugsDosing", tags: ["eculizumab", "ravulizumab", "anti-C5", "complement inhibitor", "aHUS", "C3G", "meningococcal vaccine"] },
  { title: "Cyclophosphamide (CYC)", category: "Drug", page: "DrugsDosing", tags: ["cyclophosphamide", "CYC", "alkylating agent", "NS", "GPA", "lupus", "ANCA", "hemorrhagic cystitis", "MESNA"] },
  { title: "Levamisole", category: "Drug", page: "DrugsDosing", tags: ["levamisole", "immunomodulator", "FRNS", "IAP", "alternate day", "cheap", "neutropenia"] },
  { title: "ACE Inhibitor / ARB – Renoprotection", category: "Drug", page: "DrugsDosing", tags: ["ACEi", "ARB", "enalapril", "ramipril", "losartan", "renoprotection", "proteinuria", "hypertension CKD"] },
  { title: "SGLT2 Inhibitors – Renoprotection", category: "Drug", page: "DrugsDosing", tags: ["SGLT2i", "dapagliflozin", "empagliflozin", "canagliflozin", "SGLT2", "renoprotection", "DKD", "IgAN", "CKD"] },
  { title: "Finerenone (Non-steroidal MRA)", category: "Drug", page: "DrugsDosing", tags: ["finerenone", "MRA", "mineralocorticoid antagonist", "DKD", "FIDELIO", "albuminuria", "CKD diabetes"] },
  { title: "AI Prescriber – Auto Drug Protocol", category: "AI Tool", page: "AIPrescriber", tags: ["AI prescriber", "auto prescription", "drug plan", "AI dosing", "prescription AI"] },
  { title: "Drug Database & Dosing Calculator", category: "Drug Tool", page: "DrugsDosing", tags: ["drug database", "dosing", "renal dose", "weight based", "Indian formulary"] },

  // ── CALCULATORS ───────────────────────────────────────────────────────────
  { title: "Schwartz GFR Formula (Pediatric)", category: "Calculator", page: "SchwartzGFR", tags: ["Schwartz", "GFR", "CKiD", "height creatinine", "pediatric GFR"] },
  { title: "Anthropometry – Weight, Height, BMI, BSA", category: "Calculator", page: "Anthropometry", tags: ["anthropometry", "BSA", "BMI", "weight", "height", "z-score", "body surface area"] },
  { title: "Fluid Calculator – Maintenance IV", category: "Calculator", page: "FluidCalculator", tags: ["fluid", "Holliday-Segar", "maintenance", "IV fluid", "dehydration correction"] },
  { title: "ABG / VBG Interpreter", category: "Calculator", page: "ABGInterpreter", tags: ["ABG", "VBG", "blood gas", "pH", "pCO2", "HCO3", "acid-base", "metabolic", "respiratory"] },
  { title: "CKiD GFR Calculator", category: "Calculator", page: "CKiDGFR", tags: ["CKiD", "GFR", "pediatric", "renal function", "cystatin C", "BUN"] },
  { title: "Steroid Equivalent Calculator", category: "Calculator", page: "CalculatorsHub", tags: ["steroid equivalent", "prednisolone", "dexamethasone", "hydrocortisone", "methylprednisolone", "conversion"] },
  { title: "Calculators Hub – All Tools", category: "Calculator", page: "CalculatorsHub", tags: ["calculators", "all tools", "medical calculator", "clinical tools"] },
  { title: "Dose Calculator", category: "Calculator", page: "DoseCalculator", tags: ["dose calculator", "mg/kg", "drug dose", "weight based", "renal adjustment"] },

  // ── RHEUMATOLOGY ─────────────────────────────────────────────────────────
  { title: "JIA – Juvenile Idiopathic Arthritis", category: "Rheumatology", page: "PediatricRheumatology", tags: ["JIA", "juvenile idiopathic arthritis", "polyarticular", "oligoarticular", "systemic JIA", "JADAS", "methotrexate", "biologics"] },
  { title: "Systemic Lupus Erythematosus (SLE/pSLE)", category: "Rheumatology", page: "PediatricRheumatology", tags: ["SLE", "pediatric SLE", "pSLE", "ANA", "anti-dsDNA", "SLEDAI", "lupus criteria", "ACR EULAR 2019"] },
  { title: "Kawasaki Disease", category: "Rheumatology", page: "PediatricRheumatology", tags: ["Kawasaki", "IVIG", "aspirin", "coronary artery", "fever", "rash", "MIS-C", "mucocutaneous"] },
  { title: "MAS – Macrophage Activation Syndrome", category: "Emergency", page: "EmergencyHub", tags: ["MAS", "macrophage activation", "HLH", "hemophagocytic", "ferritin", "cyclosporin", "anakinra"] },
  { title: "ANCA Vasculitis – Rheumatology", category: "Rheumatology", page: "PediatricRheumatology", tags: ["ANCA", "vasculitis", "GPA", "MPA", "granulomatosis", "polyarteritis"] },
  { title: "JADAS Score Calculator", category: "Calculator", page: "CalculatorsHub", tags: ["JADAS", "JIA activity", "disease activity score", "joint count"] },
  { title: "SLEDAI Score", category: "Calculator", page: "CalculatorsHub", tags: ["SLEDAI", "SLE activity", "lupus score", "disease activity"] },

  // ── IMMUNOLOGY LABS ───────────────────────────────────────────────────────
  { title: "Immunology Lab Pathways", category: "Lab", page: "LabPathways", tags: ["immunology labs", "ANA", "anti-dsDNA", "C3 C4", "ANCA", "anti-GBM", "complement", "immunofluorescence"] },
  { title: "Complement Pathway – C3, C4, CH50, AH50", category: "Lab", page: "LabPathways", tags: ["complement", "C3", "C4", "CH50", "AH50", "alternative pathway", "classical pathway", "factor H", "factor I"] },
  { title: "Urine Analysis & Microscopy", category: "AI Tool", page: "UrologyNephrologyHub", tags: ["urine analysis", "urine dipstick", "microscopy", "RBC casts", "protein", "UDS analyzer", "nephrotic", "nephritic", "pyuria"] },
  { title: "Lab Report AI Analyzer", category: "AI Tool", page: "UrologyNephrologyHub", tags: ["lab analyzer", "VBG", "ABG", "electrolytes", "renal function", "CBC", "AI interpretation"] },

  // ── EMERGENCY PROTOCOLS ───────────────────────────────────────────────────
  { title: "Emergency Hub – All Protocols", category: "Emergency", page: "EmergencyHub", tags: ["emergency", "protocols", "critical", "acute", "ICU nephrology"] },
  { title: "Severe Oedema / Anasarca", category: "Emergency", page: "EmergencyHub", tags: ["severe oedema", "anasarca", "albumin infusion", "furosemide", "refractory oedema", "NS oedema"] },
  { title: "SBP – Spontaneous Bacterial Peritonitis", category: "Emergency", page: "EmergencyHub", tags: ["SBP", "spontaneous bacterial peritonitis", "ascites", "PD peritonitis", "cefotaxime"] },
  { title: "Hyponatremia Emergency", category: "Emergency", page: "EmergencyHub", tags: ["severe hyponatremia", "seizure hyponatremia", "3% saline", "emergency sodium", "brain herniation"] },
  { title: "Admission Orders – Kidney", category: "Tool", page: "AdmissionOrders", tags: ["admission", "orders", "admit", "hospital orders", "AKI admit", "NS admit"] },
  { title: "Differential Diagnosis Engine", category: "AI Tool", page: "DifferentialEngine", tags: ["differential diagnosis", "DDx", "AI differential", "diagnosis", "symptoms"] },

  // ── NUTRITION ─────────────────────────────────────────────────────────────
  { title: "Renal Diet Generator", category: "Nutrition", page: "DietGenerator", tags: ["renal diet", "CKD diet", "dialysis diet", "low phosphorus", "low potassium", "fluid restriction", "protein"] },
  { title: "Nutrition Hub – Pediatric", category: "Nutrition", page: "NutritionHub", tags: ["nutrition", "pediatric nutrition", "renal nutrition", "dietitian", "growth failure CKD"] },
  { title: "NS Diet – Nephrotic Syndrome", category: "Nutrition", page: "DietGenerator", tags: ["NS diet", "nephrotic syndrome diet", "low salt", "low fat", "protein nephrotic"] },
  { title: "HD Dialysis Diet", category: "Nutrition", page: "DietGenerator", tags: ["hemodialysis diet", "HD diet", "phosphorus", "potassium", "fluid restriction HD", "protein HD"] },

  // ── EDUCATION & GUIDELINES ────────────────────────────────────────────────
  { title: "Guidelines Library (KDIGO, ISPN, IAP)", category: "Guidelines", page: "Guidelines", tags: ["guidelines", "KDIGO", "ISPN", "IAP", "IPNA", "ESPN", "AAP", "KDOQI", "evidence"] },
  { title: "Teaching Hub – Clinical Modules", category: "Education", page: "TeachingHub", tags: ["teaching", "education", "modules", "DM", "nephrology teaching"] },
  { title: "Case Library – Clinical Cases", category: "Education", page: "CaseLibrary", tags: ["case library", "clinical case", "case study", "presentation", "diagnosis case"] },
  { title: "Clinical OS – Evidence-Based Support", category: "Tool", page: "ClinicalOS", tags: ["clinical OS", "clinical decision support", "evidence based", "pathway", "OS"] },
  { title: "Video Teaching Agent", category: "Education", page: "VideoTeachingAgent", tags: ["video teaching", "video", "lecture", "teaching agent", "AI teaching"] },
  { title: "KDIGO 2021 – Glomerular Diseases", category: "Guidelines", page: "GlomerularDiseases", tags: ["KDIGO 2021", "glomerular", "GN guideline", "evidence"] },
  { title: "KDIGO 2024 – Alport Syndrome", category: "Guidelines", page: "GlomerularDiseases", tags: ["KDIGO 2024", "Alport", "COL4", "guideline 2024"] },
  { title: "KDIGO 2024 – IgAN Update", category: "Guidelines", page: "GlomerularDiseases", tags: ["KDIGO 2024", "IgAN", "IgA nephropathy update", "SGLT2i IgAN", "budesonide"] },

  // ── GENETICS ─────────────────────────────────────────────────────────────
  { title: "Genetic Report Analyzer (ACMG)", category: "AI Tool", page: "GeneticReportAnalyzer", tags: ["genetic", "variant", "ACMG", "pathogenic", "VUS", "NGS", "exome", "OMIM"] },
  { title: "Cystinosis – Diagnosis & Management", category: "Pathway", page: "ClinicalApproaches", tags: ["cystinosis", "cysteamine", "Fanconi", "cystine", "corneal crystals"] },
  { title: "Primary Hyperoxaluria (PH1/2/3)", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=cystic-kidney", tags: ["hyperoxaluria", "primary hyperoxaluria", "AGXT", "oxalate", "lumasiran", "liver transplant", "stones genetic"] },
  { title: "ARPKD / ADPKD – Polycystic Kidney", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=cystic-kidney", tags: ["ARPKD", "ADPKD", "polycystic kidney", "PKD1 PKD2", "tolvaptan", "cysts"] },
  { title: "Nephronophthisis / Ciliopathies", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=cystic-kidney", tags: ["NPHP", "nephronophthisis", "ciliopathy", "Bardet-Biedl", "Joubert", "Senior-Loken"] },
  { title: "Genetic Nephrotic Syndrome (SRNS)", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=steroid-resistant-ns", tags: ["genetic nephrotic", "SRNS genetic", "NPHS1 NPHS2 WT1", "podocyte gene"] },

  // ── MONITORING TEMPLATES ──────────────────────────────────────────────────
  { title: "CKD Monitoring Template", category: "Monitoring", page: "UrologyNephrologyHub", tags: ["CKD monitoring", "monitoring template", "eGFR schedule", "PTH", "CBC monitoring"] },
  { title: "NS Relapse Tracker", category: "Monitoring", page: "UrologyNephrologyHub", tags: ["NS relapse", "dipstick diary", "steroid dose tracker", "relapse monitor", "urine protein diary"] },
  { title: "Transplant Follow-up Template", category: "Monitoring", page: "UrologyNephrologyHub", tags: ["transplant follow-up", "tacrolimus trough schedule", "DSA", "BK CMV surveillance"] },
  { title: "Bladder Diary / Voiding Diary", category: "Monitoring", page: "UrologyNephrologyHub", tags: ["bladder diary", "voiding diary", "fluid intake", "urgency", "incontinence episodes"] },
  { title: "Bowel Diary – Bristol Stool", category: "Monitoring", page: "UrologyNephrologyHub", tags: ["bowel diary", "Bristol stool", "constipation diary", "soiling", "laxative"] },
  { title: "Growth Monitoring Template", category: "Monitoring", page: "UrologyNephrologyHub", tags: ["growth monitoring", "height weight", "BMI centile", "Tanner stage", "growth velocity"] },
  { title: "CIC Adherence Tracker", category: "Monitoring", page: "UrologyNephrologyHub", tags: ["CIC adherence", "catheter log", "bladder drainage", "catheterisation record"] },
  { title: "AKI Recovery Monitoring", category: "Monitoring", page: "UrologyNephrologyHub", tags: ["AKI recovery", "creatinine monitoring", "post-AKI", "follow-up schedule"] },
  { title: "BP Home Monitoring Protocol", category: "Monitoring", page: "UrologyNephrologyHub", tags: ["home BP", "blood pressure monitoring", "BP diary", "ABPM indications"] },
  { title: "Dialysis Session Monitoring", category: "Monitoring", page: "RRTAssistant", tags: ["dialysis monitoring", "UF goal", "dry weight", "intradialytic BP", "exit site"] },

  // ── PATIENT EDUCATION ─────────────────────────────────────────────────────
  { title: "Patient Education – CIC Training", category: "Education", page: "UrologyNephrologyHub", tags: ["CIC training", "catheter family", "how to CIC", "self-catheterisation"] },
  { title: "Patient Education – NS Relapse Signs", category: "Education", page: "UrologyNephrologyHub", tags: ["NS family education", "relapse signs", "dipstick home", "oedema watch"] },
  { title: "Patient Education – Warning Signs", category: "Education", page: "UrologyNephrologyHub", tags: ["warning signs kidney", "when to come ER", "emergency signs", "family education"] },
  { title: "Patient Education – Constipation", category: "Education", page: "UrologyNephrologyHub", tags: ["constipation education", "laxative PEG", "family constipation", "bowel training"] },
  { title: "Patient Education – Dialysis", category: "Education", page: "UrologyNephrologyHub", tags: ["dialysis education", "PD family", "HD family", "peritoneal dialysis home"] },
  { title: "Patient Education – Transplant", category: "Education", page: "UrologyNephrologyHub", tags: ["transplant family education", "immunosuppression family", "rejection signs", "PTLD warning"] },

  // ── GENERAL PEDIATRICS ────────────────────────────────────────────────────
  { title: "Pediatrics Hub – General", category: "Pediatrics", page: "PediatricsHub", tags: ["pediatrics", "general pediatrics", "vaccination", "growth", "nutrition child"] },
  { title: "Vaccination Schedule – IAP / WHO", category: "Pediatrics", page: "PediatricsHub", tags: ["vaccination", "immunization", "IAP", "WHO schedule", "EPI", "BCG", "MMR", "IPV"] },
  { title: "Growth Chart (WHO / IAP)", category: "Calculator", page: "Anthropometry", tags: ["growth chart", "WHO z-score", "IAP growth", "weight for age", "height for age", "WAZ HAZ", "stunting wasting"] },

  // ── CLINICAL PATHWAYS HUB ─────────────────────────────────────────────────
  { title: "Clinical Support – 50+ Pathways", category: "Pathway", page: "ClinicalSupport", tags: ["clinical pathways", "50 pathways", "nephrology pathways", "ClinicalSupport hub"] },
  { title: "Clinical Approaches – Approach-Based", category: "Pathway", page: "ClinicalApproaches", tags: ["clinical approaches", "approach haematuria", "approach proteinuria", "approach hypertension", "approach AKI"] },
  { title: "AI Clinical Pathway Generator", category: "AI Tool", page: "AIClinicalPathway", tags: ["AI pathway", "pathway generator", "clinical decision AI", "differential AI"] },
  { title: "Discharge Summary Generator", category: "Tool", page: "DischargeSummary", tags: ["discharge summary", "discharge letter", "hospital discharge", "summary AI"] },
];

// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  "Pathway": "bg-blue-100 text-blue-700",
  "GN Pathway": "bg-pink-100 text-pink-700",
  "Calculator": "bg-green-100 text-green-700",
  "Drug": "bg-violet-100 text-violet-700",
  "Drug Tool": "bg-pink-100 text-pink-700",
  "AI Tool": "bg-violet-100 text-violet-700",
  "Research": "bg-purple-100 text-purple-700",
  "Clinic": "bg-orange-100 text-orange-700",
  "Dialysis": "bg-cyan-100 text-cyan-700",
  "Transplant": "bg-indigo-100 text-indigo-700",
  "Guidelines": "bg-amber-100 text-amber-700",
  "Education": "bg-teal-100 text-teal-700",
  "Monitoring": "bg-emerald-100 text-emerald-700",
  "Tool": "bg-slate-100 text-slate-700",
  "Emergency": "bg-red-100 text-red-700",
  "Urology": "bg-blue-100 text-blue-700",
  "Imaging": "bg-teal-100 text-teal-700",
  "Lab": "bg-lime-100 text-lime-700",
  "Nutrition": "bg-orange-100 text-orange-700",
  "Rheumatology": "bg-rose-100 text-rose-700",
  "Pediatrics": "bg-yellow-100 text-yellow-700",
};

export default function GlobalSearch({ placeholder = "Search pathways, drugs, calculators...", className = "" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef();

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const q = query.toLowerCase();
    const matches = SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    ).slice(0, 10);
    setResults(matches);
    setOpen(matches.length > 0);
    setFocused(0);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigate_to = (item) => {
    // Support deep-link params appended to page URL
    const base = createPageUrl(item.page);
    const url = item.params ? `${base}${item.params}` : base;
    navigate(url);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused(f => Math.min(f + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)); }
    if (e.key === "Enter" && results[focused]) navigate_to(results[focused]);
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length && setOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-8 text-sm h-9"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
          {results.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate_to(item)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${focused === i ? "bg-indigo-50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800 truncate">{item.title}</span>
                  <Badge className={`text-xs shrink-0 ${CATEGORY_COLORS[item.category] || "bg-slate-100 text-slate-700"}`}>
                    {item.category}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 truncate">{item.tags.slice(0, 5).join(" · ")}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}