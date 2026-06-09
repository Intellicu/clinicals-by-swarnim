import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, ArrowRight, Pill, BookOpen, FileText, GraduationCap, Microscope, Layers, Mic, MicOff } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// STATIC KNOWLEDGE INDEX (pages / pathways / calculators)
// ─────────────────────────────────────────────────────────────────────────────
const SEARCH_INDEX = [
  { title: "Minimal Change Disease (MCD)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["MCD", "minimal change", "nephrotic", "prednisolone", "SSNS", "FRNS", "SDNS", "steroid sensitive", "foot process", "podocyte"] },
  { title: "FSGS – Focal Segmental Glomerulosclerosis", category: "GN Pathway", page: "GlomerularDiseases", tags: ["FSGS", "focal segmental", "podocin", "NPHS2", "tacrolimus", "cyclosporin", "sparsentan", "steroid resistant", "CNI"] },
  { title: "Membranous Nephropathy (MN)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["membranous", "MN", "PLA2R", "THSD7A", "rituximab", "spontaneous remission", "anticoagulation", "cyclophosphamide", "Ponticelli", "nephrotic"] },
  { title: "IgA Nephropathy (IgAN)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["IgAN", "IgA nephropathy", "Oxford MEST", "MEST-C", "SGLT2", "dapagliflozin", "budesonide", "nefecon", "sparsentan", "haematuria", "atrasentan"] },
  { title: "IgA Vasculitis Nephritis (HSP Nephritis)", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=igav-hsp-engine", tags: ["IgAV", "HSP", "Henoch Schonlein", "purpura", "IgA vasculitis", "ISKDC", "proteinuria", "HSP nephritis", "SHARE", "EULAR PRES", "crescentic", "immunosuppression HSP"] },
  { title: "Post-Streptococcal GN (PSGN)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["PSGN", "post-streptococcal", "streptococcal", "ASO", "anti-DNase", "low C3", "complement", "self-limiting", "haematuria"] },
  { title: "MPGN – Membranoproliferative GN", category: "GN Pathway", page: "GlomerularDiseases", tags: ["MPGN", "membranoproliferative", "tram-track", "complement", "cryoglobulin", "hepatitis C", "immune complex"] },
  { title: "C3 Glomerulopathy (C3GN / DDD)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["C3G", "C3 glomerulopathy", "C3GN", "DDD", "dense deposit", "complement", "CFH", "factor H", "eculizumab", "iptacopan", "C3NeF", "alternative pathway"] },
  { title: "Lupus Nephritis (LN)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["lupus nephritis", "LN", "SLE", "ISN RPS", "class III", "class IV", "class V", "MMF", "belimumab", "voclosporin", "hydroxychloroquine", "CYC", "wire loop"] },
  { title: "ANCA Vasculitis GN (GPA/MPA)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["ANCA", "vasculitis", "GPA", "MPA", "PR3", "MPO", "crescentic", "rituximab", "avacopan", "cyclophosphamide", "pauci-immune", "rapidly progressive"] },
  { title: "Anti-GBM Disease / Goodpasture", category: "GN Pathway", page: "GlomerularDiseases", tags: ["anti-GBM", "Goodpasture", "plasma exchange", "pulmonary haemorrhage", "linear IgG", "COL4A3", "crescentic", "RPGN"] },
  { title: "aHUS – Atypical HUS / TMA", category: "GN Pathway", page: "GlomerularDiseases", tags: ["aHUS", "TMA", "thrombotic microangiopathy", "eculizumab", "ravulizumab", "complement", "CFH", "STEC-HUS", "ADAMTS13", "TTP", "microangiopathic"] },
  { title: "Diabetic Nephropathy / DKD", category: "GN Pathway", page: "GlomerularDiseases", tags: ["DKD", "diabetic nephropathy", "SGLT2", "finerenone", "GLP-1", "empagliflozin", "Kimmelstiel-Wilson", "KDIGO 2022 diabetes"] },
  { title: "Alport Syndrome / COL4 Nephropathy", category: "GN Pathway", page: "GlomerularDiseases", tags: ["Alport", "COL4A3", "COL4A4", "COL4A5", "hearing loss", "lenticonus", "basket weave", "ADAS", "XLAS", "ACEi Alport"] },
  { title: "Congenital Nephrotic Syndrome (CNS)", category: "GN Pathway", page: "GlomerularDiseases", tags: ["congenital nephrotic", "CNS", "NPHS1", "nephrin", "Finnish type", "DMS", "LAMB2", "Pierson", "WT1", "bilateral nephrectomy"] },
  { title: "Nephrotic Syndrome – ISKDC Protocol", category: "Pathway", page: "ClinicalSupport", tags: ["nephrotic", "ISKDC", "prednisolone", "remission", "relapse", "SSNS", "FRNS", "SDNS", "SRNS", "proteinuria"] },
  { title: "Steroid-Resistant NS (SRNS)", category: "Pathway", page: "GlomerularDiseases", tags: ["SRNS", "steroid resistant", "tacrolimus", "cyclosporin", "CNI", "rituximab", "NPHS2", "genetic nephrotic"] },
  { title: "Frequently Relapsing NS (FRNS / SDNS)", category: "Pathway", page: "GlomerularDiseases", tags: ["FRNS", "SDNS", "steroid dependent", "frequently relapsing", "MMF", "levamisole", "rituximab", "cyclophosphamide"] },
  { title: "AKI – KDIGO Staging & Management", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-prifle", tags: ["AKI", "acute kidney injury", "KDIGO", "creatinine", "oliguria", "staging", "pRIFLE"] },
  { title: "AKI – Steroids / AIN", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-prifle", tags: ["AKI steroids", "steroid AKI", "interstitial nephritis AIN", "methylprednisolone AKI", "ANCA AKI", "rapidly progressive"] },
  { title: "Nephrotoxin / Contrast AKI Prevention", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=contrast-nephropathy", tags: ["nephrotoxin", "aminoglycoside", "vancomycin", "NSAID", "contrast", "amphotericin", "nephrotoxic"] },
  { title: "AKI Stager – KDIGO/pRIFLE", category: "Calculator", page: "AKIStager", tags: ["AKI staging", "pRIFLE", "KDIGO AKI", "creatinine ratio", "urine output"] },
  { title: "AKI – Dialysis Indications (AEIOU)", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-dialysis-timing", tags: ["dialysis AKI", "AKI dialysis timing", "AEIOU", "RRT indications"] },
  { title: "Tumor Lysis Syndrome (TLS)", category: "Emergency", page: "EmergencyHub", tags: ["TLS", "tumor lysis", "uric acid", "rasburicase", "hyperkalemia", "hyperphosphatemia"] },
  { title: "CKD Staging (KDIGO G1-G5)", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-staging", tags: ["CKD", "chronic kidney disease", "KDIGO", "eGFR", "staging", "G1 G2 G3 G4 G5"] },
  { title: "CKD-MBD – Mineral Bone Disease", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-mbd", tags: ["CKD-MBD", "mineral bone", "PTH", "phosphorus", "calcium", "vitamin D", "cinacalcet", "calcification"] },
  { title: "Anemia of CKD – EPO & Iron", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-anemia-mbd", tags: ["anemia CKD", "EPO", "erythropoietin", "iron deficiency", "ferritin", "transferrin saturation", "darbepoetin"] },
  { title: "CKD Comprehensive Management", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-comprehensive", tags: ["CKD management", "CKD nutrition", "CKD hypertension", "RRT planning", "dialysis preparation", "transplant referral"] },
  { title: "CKD Nutrition & Growth", category: "Pathway", page: "NutritionHub", tags: ["CKD nutrition", "renal diet", "growth CKD", "protein restriction", "phosphorus diet"] },
  { title: "CKD Calculator (Schwartz GFR)", category: "Calculator", page: "SchwartzGFR", tags: ["Schwartz", "GFR", "eGFR", "creatinine", "height", "CKiD", "CKD-EPI"] },
  { title: "Hemodialysis (HD) Protocol", category: "Dialysis", page: "RRTAssistant", tags: ["hemodialysis", "HD", "Kt/V", "URR", "blood flow", "dialysate", "AVF", "CVC", "intradialytic hypotension"] },
  { title: "Peritoneal Dialysis (PD) Protocol", category: "Dialysis", page: "RRTAssistant", tags: ["peritoneal dialysis", "PD", "CCPD", "CAPD", "APD", "PET", "peritonitis", "exit site", "dwell"] },
  { title: "CRRT – Continuous Renal Replacement", category: "Dialysis", page: "RRTAssistant", tags: ["CRRT", "CVVHDF", "CVVH", "continuous RRT", "citrate anticoagulation", "PICU dialysis", "filter life", "effluent dose"] },
  { title: "Kidney Transplant – Immunosuppression", category: "Transplant", page: "UrologyNephrologyHub", tags: ["transplant", "immunosuppression", "tacrolimus", "MMF", "prednisolone", "basiliximab", "induction"] },
  { title: "Transplant Rejection – TCMR / ABMR", category: "Transplant", page: "UrologyNephrologyHub", tags: ["rejection", "TCMR", "ABMR", "antibody mediated", "DSA", "Banff", "biopsy", "pulse steroids"] },
  { title: "Pediatric Hypertension Classification (2017 AAP)", category: "Pathway", page: "BPPercentiles", tags: ["hypertension", "HTN", "blood pressure", "AAP 2017", "stage 1 HTN", "stage 2", "percentile", "elevated BP"] },
  { title: "Hypertensive Emergency", category: "Emergency", page: "EmergencyHub", tags: ["hypertensive emergency", "hypertensive crisis", "nicardipine", "labetalol", "esmolol", "MAP reduction", "encephalopathy"] },
  { title: "BP Percentile Calculator", category: "Calculator", page: "BPPercentiles", tags: ["blood pressure", "BP percentile", "hypertension", "height", "age", "sex", "2017 AAP"] },
  { title: "Hyperkalemia Management", category: "Emergency", page: "EmergencyHub", tags: ["hyperkalemia", "high potassium", "calcium gluconate", "salbutamol", "insulin glucose", "kayexalate", "dialysis potassium", "ECG changes"] },
  { title: "Hyponatremia", category: "Pathway", page: "ClinicalSupport", tags: ["hyponatremia", "low sodium", "SIADH", "sodium correction", "3% NaCl", "Furst formula", "osmolality"] },
  { title: "Hypocalcemia", category: "Pathway", page: "ClinicalSupport", tags: ["hypocalcemia", "low calcium", "tetany", "calcium gluconate IV", "vitamin D", "PTH", "hypoparathyroidism"] },
  { title: "Hypercalcemia", category: "Pathway", page: "ClinicalSupport", tags: ["hypercalcemia", "high calcium", "hypervitaminosis D", "hyperparathyroidism", "sarcoidosis", "bisphosphonate"] },
  { title: "Metabolic Acidosis / Anion Gap", category: "Calculator", page: "ABGInterpreter", tags: ["metabolic acidosis", "anion gap", "HAGMA", "NAGMA", "bicarbonate", "pH", "delta delta"] },
  { title: "Sodium Calculator", category: "Calculator", page: "SodiumCalculator", tags: ["sodium", "hyponatremia correction", "3% saline", "free water deficit", "osmolality"] },
  { title: "Potassium Calculator", category: "Calculator", page: "PotassiumCalculator", tags: ["potassium", "hyperkalemia", "hypokalaemia", "K+ replacement"] },
  { title: "Anion Gap Calculator", category: "Calculator", page: "AnionGap", tags: ["anion gap", "AG", "metabolic acidosis", "Na K Cl HCO3"] },
  { title: "Renal Tubular Acidosis (RTA)", category: "Pathway", page: "ClinicalApproaches", tags: ["RTA", "renal tubular acidosis", "type 1", "type 2", "type 4", "distal RTA", "proximal RTA", "TTKG", "urine anion gap"] },
  { title: "Fanconi Syndrome", category: "Pathway", page: "ClinicalApproaches", tags: ["Fanconi", "tubular dysfunction", "glucosuria", "phosphaturia", "bicarbonate wasting", "cystinosis", "Wilson"] },
  { title: "Nephrolithiasis / Kidney Stones", category: "Pathway", page: "ClinicalApproaches", tags: ["kidney stones", "nephrolithiasis", "hypercalciuria", "hyperoxaluria", "urate stones", "calcium oxalate", "stone risk"] },
  { title: "FENa Calculator", category: "Calculator", page: "FENaCalculator", tags: ["FENa", "fractional excretion sodium", "prerenal AKI", "intrinsic AKI"] },
  { title: "TTKG Calculator", category: "Calculator", page: "TTKGCalculator", tags: ["TTKG", "transtubular potassium gradient", "hyperkalemia", "hypokalemia RTA"] },
  { title: "CAKUT – Congenital Anomalies Kidney & Urinary Tract", category: "Urology", page: "UrologyNephrologyHub", tags: ["CAKUT", "congenital anomalies", "hydronephrosis", "VUR", "PUJ", "VUJ", "renal agenesis", "horseshoe kidney", "duplex"] },
  { title: "VUR – Vesicoureteral Reflux", category: "Urology", page: "UrologyNephrologyHub", tags: ["VUR", "vesicoureteral reflux", "VCUG", "reflux grading", "DMSA scar", "prophylaxis", "ureteric reimplantation"] },
  { title: "Neurogenic Bladder (NGB)", category: "Urology", page: "UrologyNephrologyHub", tags: ["neurogenic bladder", "NGB", "spina bifida", "myelomeningocele", "CIC", "clean intermittent catheterisation", "oxybutynin", "UDS", "upper tract protection"] },
  { title: "BBD – Bladder Bowel Dysfunction", category: "Urology", page: "UrologyNephrologyHub", tags: ["BBD", "bladder bowel dysfunction", "OAB", "overactive bladder", "constipation", "enuresis", "voiding dysfunction", "urotherapy", "ICCS"] },
  { title: "UTI – Pediatric Management", category: "Pathway", page: "UrologyNephrologyHub", tags: ["UTI", "urinary tract infection", "cystitis", "pyelonephritis", "febrile UTI", "ISPN", "NICE UTI"] },
  { title: "Proteinuria – Investigation & Management", category: "Pathway", page: "Proteinuria", tags: ["proteinuria", "UPCR", "ACR", "24h urine", "nephrotic range", "nephrotic syndrome", "microalbuminuria"] },
  { title: "Haematuria – Approach", category: "Pathway", page: "ClinicalApproaches", tags: ["haematuria", "blood urine", "microscopic haematuria", "macroscopic haematuria", "RBC casts", "hypercalciuria", "IgA nephropathy", "thin GBM"] },
  { title: "Sample Size Calculation", category: "Research", page: "ResearchMethodsHub", tags: ["sample size", "power calculation", "alpha error", "beta error", "type I II", "effect size", "n calculation", "statistical power"] },
  { title: "Study Design – RCT / Cohort / Case-Control", category: "Research", page: "ResearchMethodsHub", tags: ["RCT", "randomized controlled trial", "cohort", "case-control", "cross-sectional", "prospective", "retrospective", "study design"] },
  { title: "PRISMA – Systematic Review & Meta-analysis", category: "Research", page: "ResearchMethodsHub", tags: ["PRISMA", "meta-analysis", "systematic review", "forest plot", "funnel plot", "GRADE", "heterogeneity"] },
  { title: "Biostatistics – Tests & P-values", category: "Research", page: "ResearchMethodsHub", tags: ["biostatistics", "p-value", "confidence interval", "chi-square", "Mann-Whitney", "t-test", "Fisher", "ANOVA", "Kaplan-Meier", "survival analysis"] },
  { title: "Rituximab – Dosing & Monitoring", category: "Drug", page: "DrugsDosing", tags: ["rituximab", "anti-CD20", "B-cell depletion", "FRNS", "SDNS", "MN rituximab", "ANCA", "375 mg/m2"] },
  { title: "Tacrolimus (FK506) – Pediatric Dosing", category: "Drug", page: "DrugsDosing", tags: ["tacrolimus", "FK506", "CNI", "calcineurin inhibitor", "trough level", "nephrotoxicity", "SRNS", "transplant"] },
  { title: "Mycophenolate Mofetil (MMF)", category: "Drug", page: "DrugsDosing", tags: ["MMF", "mycophenolate", "CellCept", "mofetil", "FRNS", "lupus", "transplant"] },
  { title: "Prednisolone / Steroid Protocol", category: "Drug", page: "DrugsDosing", tags: ["prednisolone", "prednisone", "methylprednisolone", "steroid", "alternate day", "taper", "side effects"] },
  { title: "Eculizumab / Ravulizumab – Anti-C5", category: "Drug", page: "DrugsDosing", tags: ["eculizumab", "ravulizumab", "anti-C5", "complement inhibitor", "aHUS", "C3G", "meningococcal vaccine"] },
  { title: "SGLT2 Inhibitors – Renoprotection", category: "Drug", page: "DrugsDosing", tags: ["SGLT2i", "dapagliflozin", "empagliflozin", "canagliflozin", "SGLT2", "renoprotection", "DKD", "IgAN", "CKD"] },
  { title: "AI Prescriber – Auto Drug Protocol", category: "AI Tool", page: "AIPrescriber", tags: ["AI prescriber", "auto prescription", "drug plan", "AI dosing", "prescription AI"] },
  { title: "Drug Database & Dosing Calculator", category: "Drug Tool", page: "DrugsDosing", tags: ["drug database", "dosing", "renal dose", "weight based", "Indian formulary"] },
  { title: "Schwartz GFR Formula (Pediatric)", category: "Calculator", page: "SchwartzGFR", tags: ["Schwartz", "GFR", "CKiD", "height creatinine", "pediatric GFR"] },
  { title: "Anthropometry – Weight, Height, BMI, BSA", category: "Calculator", page: "Anthropometry", tags: ["anthropometry", "BSA", "BMI", "weight", "height", "z-score", "body surface area"] },
  { title: "Fluid Calculator – Maintenance IV", category: "Calculator", page: "FluidCalculator", tags: ["fluid", "Holliday-Segar", "maintenance", "IV fluid", "dehydration correction"] },
  { title: "ABG / VBG Interpreter", category: "Calculator", page: "ABGInterpreter", tags: ["ABG", "VBG", "blood gas", "pH", "pCO2", "HCO3", "acid-base", "metabolic", "respiratory"] },
  { title: "Calculators Hub – All Tools", category: "Calculator", page: "CalculatorsHub", tags: ["calculators", "all tools", "medical calculator", "clinical tools"] },
  { title: "JIA – Juvenile Idiopathic Arthritis", category: "Rheumatology", page: "PediatricRheumatology", tags: ["JIA", "juvenile idiopathic arthritis", "polyarticular", "oligoarticular", "systemic JIA", "JADAS", "methotrexate", "biologics"] },
  { title: "Systemic Lupus Erythematosus (SLE/pSLE)", category: "Rheumatology", page: "PediatricRheumatology", tags: ["SLE", "pediatric SLE", "pSLE", "ANA", "anti-dsDNA", "SLEDAI", "lupus criteria", "ACR EULAR 2019"] },
  { title: "Kawasaki Disease", category: "Rheumatology", page: "PediatricRheumatology", tags: ["Kawasaki", "IVIG", "aspirin", "coronary artery", "fever", "rash", "MIS-C", "mucocutaneous"] },
  { title: "Guidelines Library (KDIGO, ISPN, IAP)", category: "Guidelines", page: "Guidelines", tags: ["guidelines", "KDIGO", "ISPN", "IAP", "IPNA", "ESPN", "AAP", "KDOQI", "evidence"] },
  { title: "Teaching Hub – Clinical Modules", category: "Education", page: "TeachingHub", tags: ["teaching", "education", "modules", "DM", "nephrology teaching"] },
  { title: "Case Library – Clinical Cases", category: "Education", page: "CaseLibrary", tags: ["case library", "clinical case", "case study", "presentation", "diagnosis case"] },
  { title: "Genetic Report Analyzer (ACMG)", category: "AI Tool", page: "GeneticReportAnalyzer", tags: ["genetic", "variant", "ACMG", "pathogenic", "VUS", "NGS", "exome", "OMIM"] },
  { title: "ARPKD / ADPKD – Polycystic Kidney", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=cystic-kidney", tags: ["ARPKD", "ADPKD", "polycystic kidney", "PKD1 PKD2", "tolvaptan", "cysts"] },
  { title: "Genetic Nephrotic Syndrome (SRNS)", category: "Pathway", page: "ClinicalSupport", params: "?tab=pathways&scenario=steroid-resistant-ns", tags: ["genetic nephrotic", "SRNS genetic", "NPHS1 NPHS2 WT1", "podocyte gene"] },
  { title: "Emergency Hub – All Protocols", category: "Emergency", page: "EmergencyHub", tags: ["emergency", "protocols", "critical", "acute", "ICU nephrology"] },
  { title: "Severe Oedema / Anasarca", category: "Emergency", page: "EmergencyHub", tags: ["severe oedema", "anasarca", "albumin infusion", "furosemide", "refractory oedema", "NS oedema"] },
  { title: "Admission Orders – Kidney", category: "Tool", page: "AdmissionOrders", tags: ["admission", "orders", "admit", "hospital orders", "AKI admit", "NS admit"] },
  { title: "Differential Diagnosis Engine", category: "AI Tool", page: "DifferentialEngine", tags: ["differential diagnosis", "DDx", "AI differential", "diagnosis", "symptoms"] },
  { title: "Renal Diet Generator", category: "Nutrition", page: "DietGenerator", tags: ["renal diet", "CKD diet", "dialysis diet", "low phosphorus", "low potassium", "fluid restriction", "protein"] },
  { title: "Nutrition Hub – Pediatric", category: "Nutrition", page: "NutritionHub", tags: ["nutrition", "pediatric nutrition", "renal nutrition", "dietitian", "growth failure CKD"] },
  { title: "Clinical Support – 50+ Pathways", category: "Pathway", page: "ClinicalSupport", tags: ["clinical pathways", "50 pathways", "nephrology pathways", "ClinicalSupport hub"] },
  { title: "Clinical Approaches – Approach-Based", category: "Pathway", page: "ClinicalApproaches", tags: ["clinical approaches", "approach haematuria", "approach proteinuria", "approach hypertension", "approach AKI"] },
  { title: "AI Clinical Pathway Generator", category: "AI Tool", page: "AIClinicalPathway", tags: ["AI pathway", "pathway generator", "clinical decision AI", "differential AI"] },
  { title: "Discharge Summary Generator", category: "Tool", page: "DischargeSummary", tags: ["discharge summary", "discharge letter", "hospital discharge", "summary AI"] },
  // ── Intelligence Engines ──
  { title: "Nephrotic Syndrome Engine (NS Engine)", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=ns-engine", tags: ["NS engine", "nephrotic syndrome engine", "SSNS", "FRNS", "SDNS", "SRNS", "ISKDC", "relapse", "prednisolone", "rituximab"] },
  { title: "AKI Diagnostic Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=aki-engine", tags: ["AKI engine", "acute kidney injury engine", "pRIFLE", "KDIGO AKI", "ATN", "oliguria", "RRT triggers"] },
  { title: "Hyperkalemia Deep Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=hyperkalemia-deep-engine", tags: ["hyperkalemia engine", "K+ emergency", "calcium gluconate", "insulin dextrose", "salbutamol", "ECG potassium", "dialysis K"] },
  { title: "Hyponatremia Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=hyponatremia-engine", tags: ["hyponatremia engine", "SIADH", "3% saline", "sodium correction", "CSW", "osmolality engine"] },
  { title: "RPGN / Crescentic GN Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=rpgn-deep-engine", tags: ["RPGN engine", "crescentic GN", "ANCA", "anti-GBM", "pauci-immune", "plasma exchange RPGN"] },
  { title: "GN / Glomerulonephritis Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=gn-engine", tags: ["GN engine", "glomerulonephritis engine", "FSGS", "IgA", "PSGN", "lupus nephritis", "C3G", "biopsy patterns"] },
  { title: "Haematuria Workup Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=hematuria-engine", tags: ["haematuria engine", "blood in urine engine", "glomerular haematuria", "dysmorphic RBC", "Alport haematuria", "stone haematuria"] },
  { title: "Proteinuria Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=proteinuria-engine", tags: ["proteinuria engine", "UPCR engine", "nephrotic proteinuria", "orthostatic proteinuria"] },
  { title: "CKD Intelligence Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-engine", tags: ["CKD engine", "chronic kidney disease engine", "KDIGO staging engine", "MBD", "anaemia CKD engine", "eGFR engine"] },
  { title: "RRT / Dialysis Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=rrt-engine", tags: ["RRT engine", "dialysis engine", "CRRT", "peritoneal dialysis engine", "HD engine", "RRT prescription"] },
  { title: "Electrolytes Hub Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=electrolytes-hub", tags: ["electrolytes hub", "electrolyte engine", "hyperkalemia hypokalemia", "hyponatremia hypernatremia", "hypocalcemia", "calcium engine"] },
  { title: "Acid-Base Hub Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=acid-base-hub", tags: ["acid base engine", "ABG engine", "metabolic acidosis engine", "metabolic alkalosis", "respiratory acidosis", "Winter formula engine"] },
  { title: "Pediatric HTN Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=htn-engine", tags: ["HTN engine", "hypertension engine", "BP classification engine", "AAP 2017 engine", "secondary HTN", "labetalol nicardipine"] },
  { title: "Fabry Disease Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=fabry-engine", tags: ["Fabry engine", "alpha-galactosidase", "lyso-Gb3", "ERT agalsidase", "migalastat", "GLA gene"] },
  { title: "Cystinosis Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=cystinosis-engine", tags: ["cystinosis engine", "cysteamine", "CTNS gene", "Fanconi cystinosis", "leukocyte cystine"] },
  { title: "Primary Hyperoxaluria Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=hyperoxaluria-engine", tags: ["hyperoxaluria engine", "PH1 PH2 PH3", "lumasiran", "AGXT", "oxalate engine", "liver kidney transplant PH"] },
  { title: "CAKUT Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=cakut-engine", tags: ["CAKUT engine", "hydronephrosis engine", "UPJ engine", "antenatal hydronephrosis", "pyeloplasty", "MAG3 UPJ", "duplex kidney"] },
  { title: "PUV Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=puv-engine", tags: ["PUV engine", "posterior urethral valves", "keyhole sign", "valve ablation", "ESKD PUV", "valve bladder"] },
  { title: "VUR / Recurrent UTI Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=vur-uti-engine", tags: ["VUR engine", "UTI engine", "recurrent UTI", "reflux grading", "DMSA scarring", "STING Deflux", "CAP prophylaxis"] },
  { title: "Cystic Kidney Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=cystic-kidney-engine", tags: ["cystic kidney engine", "ADPKD engine", "ARPKD engine", "NPHP nephronophthisis", "tolvaptan", "BBS"] },
  { title: "Voiding Dysfunction Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=voiding-engine", tags: ["voiding engine", "OAB engine", "dysfunctional voiding", "bladder engine", "BBD engine", "nocturnal enuresis engine"] },
  { title: "Neurogenic Bladder Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=neurogenic-bladder-engine", tags: ["neurogenic bladder engine", "CIC engine", "DLPP", "DSD engine", "oxybutynin", "BTX neurogenic"] },
  { title: "Bladder Diary / UDS Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=bladder-diary-engine", tags: ["bladder diary engine", "UDS engine", "uroflowmetry engine", "VCUG engine", "urodynamics engine"] },
  { title: "Renal Biopsy Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=renal-biopsy-engine", tags: ["biopsy engine", "renal biopsy", "histology engine", "LM IF EM", "FSGS biopsy", "IgA biopsy", "lupus biopsy"] },
  { title: "Renal Diet Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=diet-engine", tags: ["diet engine", "renal diet engine", "CKD diet engine", "nephrotic diet", "stone diet engine", "dialysis diet", "phosphorus potassium diet"] },
  { title: "Rheumatology Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=rheumatology-engine", tags: ["rheumatology engine", "JIA engine", "SLE engine", "lupus engine", "vasculitis engine", "Kawasaki engine", "periodic fever engine", "MAS engine"] },
  { title: "Tubular Disorders Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=tubular-engine", tags: ["tubular engine", "Fanconi engine", "XLH engine", "burosumab", "NDI engine", "tubular disorder"] },
  { title: "Kidney Stone Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=stone-engine", tags: ["stone engine", "kidney stone engine", "cystinuria engine", "calcium oxalate engine", "uric acid stone engine", "stone metabolic"] },
  { title: "Polyuria / DI Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=polyuria-full-engine", tags: ["polyuria engine", "diabetes insipidus engine", "DDAVP engine", "NDI engine", "water deprivation engine"] },
  { title: "Nephrocalcinosis Stone Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=nephrocalcinosis-stone-engine", tags: ["nephrocalcinosis engine", "stone engine nephrocalcinosis", "hypercalciuria engine"] },
  { title: "HNF1B / Alport Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=hnf1b-alport-engine", tags: ["HNF1B engine", "Alport engine", "COL4A5", "17q12", "hereditary nephropathy engine", "TBMD engine"] },
  { title: "Polyuria Engine (Basic)", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=polyuria-engine", tags: ["DI engine", "polyuria basic", "water deprivation"] },
  { title: "Metabolic Acidosis Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=metabolic-acidosis-engine", tags: ["metabolic acidosis engine", "anion gap engine", "MUDPILES", "RTA engine", "UAG"] },
  { title: "Hypokalemia Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=hypokalemia-engine", tags: ["hypokalemia engine", "Bartter engine", "Gitelman engine", "Liddle", "renin aldosterone low K"] },
  { title: "CKD Progression Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=ckd-progression-engine", tags: ["CKD progression engine", "risk stratification CKD", "eGFR decline", "monitoring interval"] },
  { title: "All Intelligence Engines", category: "Engine", page: "ClinicalSupport", params: "?tab=engines", tags: ["engines", "intelligence engines", "clinical engines", "diagnostic engines", "all engines"] },
  { title: "Wilms Tumor Engine (Nephroblastoma)", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=wilms-tumor-engine", tags: ["Wilms tumor", "nephroblastoma", "NWTS", "SIOP", "COG", "actinomycin vincristine", "WAGR", "BWS", "Denys-Drash", "WT1", "bilateral Wilms", "nephron sparing", "DD4A", "flank RT", "pediatric oncology nephrology"] },
  { title: "IgA Vasculitis (HSP) Intelligence Engine", category: "Engine", page: "ClinicalSupport", params: "?tab=pathways&scenario=igav-hsp-engine", tags: ["IgAV engine", "HSP nephritis engine", "Henoch Schonlein", "purpura nephritis", "ISKDC classification", "SHARE guidelines", "EULAR PRES", "crescentic IgAV", "MMF HSP", "cyclophosphamide HSP", "rituximab HSP", "HSP management"] },
  { title: "Daily Clinical Summary", category: "Tool", page: "DailySummary", tags: ["daily summary", "clinical briefing", "vignette", "learning pearl", "morning report"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function includes(haystack, needle) {
  if (!haystack || !needle) return false;
  return String(haystack).toLowerCase().includes(needle.toLowerCase());
}

function snippet(text, query, maxLen = 90) {
  if (!text) return "";
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, maxLen) + (text.length > maxLen ? "…" : "");
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + query.length + 60);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

// Score: title/name match = 2, body match = 1
function scoreStaticItem(item, q) {
  const titleMatch = item.title.toLowerCase().includes(q) ? 2 : 0;
  const tagMatch = item.tags.some(t => t.toLowerCase().includes(q)) ? 1 : 0;
  return titleMatch + tagMatch;
}

function scoreEntityItem(primaryText, bodyText, q) {
  const primaryMatch = String(primaryText || "").toLowerCase().includes(q) ? 2 : 0;
  const bodyMatch = String(bodyText || "").toLowerCase().includes(q) ? 1 : 0;
  return primaryMatch + bodyMatch;
}

const CATEGORY_COLORS = {
  "Pathway": "bg-blue-100 text-blue-700",
  "GN Pathway": "bg-pink-100 text-pink-700",
  "Calculator": "bg-green-100 text-green-700",
  "Drug": "bg-violet-100 text-violet-700",
  "Drug Tool": "bg-pink-100 text-pink-700",
  "AI Tool": "bg-violet-100 text-violet-700",
  "Research": "bg-purple-100 text-purple-700",
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
  "Engine": "bg-violet-100 text-violet-700",
};

const ENTITY_GROUP_META = {
  drugs:      { label: "Drugs",               icon: Pill,          color: "text-violet-600" },
  guidelines: { label: "Guidelines",           icon: BookOpen,      color: "text-amber-600" },
  protocols:  { label: "Treatment Protocols",  icon: FileText,      color: "text-blue-600" },
  teaching:   { label: "Teaching Modules",     icon: GraduationCap, color: "text-teal-600" },
  biopsy:     { label: "Biopsy Patterns",      icon: Microscope,    color: "text-rose-600" },
  static:     { label: "Pathways & Tools",     icon: Layers,        color: "text-slate-600" },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function GlobalSearch({ placeholder = "Search drugs, guidelines, pathways...", className = "" }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef();
  const flatResults = useRef([]);
  const recognitionRef = useRef(null);

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice search not supported in this browser"); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => { setQuery(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [isListening]);

  // ── Debounce ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // ── Run search when debounced query changes ────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery) {
      setGroups({});
      setOpen(false);
      flatResults.current = [];
      return;
    }
    runSearch(debouncedQuery);
  }, [debouncedQuery]);

  const runSearch = useCallback(async (q) => {
    setLoading(true);
    const ql = q.toLowerCase();

    // 1. Static index (pathways / calculators)
    const staticMatches = SEARCH_INDEX
      .map(item => ({ ...item, _score: scoreStaticItem(item, ql) }))
      .filter(item => item._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 8)
      .map(item => ({
        _type: "static",
        title: item.title,
        snippet: item.tags.filter(t => t.toLowerCase().includes(ql)).slice(0, 4).join(" · ") || item.tags.slice(0, 4).join(" · "),
        category: item.category,
        _score: item._score,
        navigate: () => {
          const base = createPageUrl(item.page);
          return item.params ? `${base}${item.params}` : base;
        },
      }));

    // 2. Entity searches (parallel)
    const [drugs, guidelines, protocols, teaching, biopsy] = await Promise.allSettled([
      searchDrugs(q, ql),
      searchGuidelines(q, ql),
      searchProtocols(q, ql),
      searchTeaching(q, ql),
      searchBiopsy(q, ql),
    ]);

    const newGroups = {};
    if (drugs.status === "fulfilled" && drugs.value.length) newGroups.drugs = drugs.value;
    if (guidelines.status === "fulfilled" && guidelines.value.length) newGroups.guidelines = guidelines.value;
    if (protocols.status === "fulfilled" && protocols.value.length) newGroups.protocols = protocols.value;
    if (teaching.status === "fulfilled" && teaching.value.length) newGroups.teaching = teaching.value;
    if (biopsy.status === "fulfilled" && biopsy.value.length) newGroups.biopsy = biopsy.value;
    if (staticMatches.length) newGroups.static = staticMatches;

    // Build flat list for keyboard nav
    flatResults.current = Object.values(newGroups).flat();

    setGroups(newGroups);
    setOpen(Object.keys(newGroups).length > 0 || true); // always open to show "no results"
    setFocused(0);
    setLoading(false);
  }, []);

  // ── Entity search functions ────────────────────────────────────────────────
  async function searchDrugs(q, ql) {
    const all = await base44.entities.Drug.list("-updated_date", 200);
    return all
      .filter(d =>
        includes(d.generic_name, ql) ||
        includes(d.description, ql) ||
        includes(d.brands_indian, ql) ||
        includes(d.category, ql) ||
        includes(d.therapeutic_class, ql) ||
        includes(d.indications, ql) ||
        includes(d.clinical_pearls, ql)
      )
      .map(d => ({
        _type: "entity",
        title: d.generic_name,
        snippet: snippet(d.description || d.indications || d.clinical_pearls || d.category, q),
        badgeText: d.category || "Drug",
        badgeClass: "bg-violet-100 text-violet-700",
        _score: scoreEntityItem(d.generic_name + " " + (d.brands_indian || ""), d.description + " " + (d.indications || ""), ql),
        navigate: () => createPageUrl("DrugsDosing") + `?search=${encodeURIComponent(d.generic_name)}`,
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);
  }

  async function searchGuidelines(q, ql) {
    const all = await base44.entities.Guideline.list("-updated_date", 200);
    return all
      .filter(g =>
        includes(g.title, ql) ||
        includes(g.summary, ql) ||
        includes(g.source, ql) ||
        includes(g.category, ql) ||
        (Array.isArray(g.keywords) && g.keywords.some(k => includes(k, ql))) ||
        (Array.isArray(g.key_recommendations) && g.key_recommendations.some(r => includes(r, ql)))
      )
      .map(g => ({
        _type: "entity",
        title: g.title,
        snippet: snippet(g.summary || (g.key_recommendations || []).join(". "), q),
        badgeText: `${g.source || "Guideline"} ${g.year || ""}`.trim(),
        badgeClass: "bg-amber-100 text-amber-700",
        _score: scoreEntityItem(g.title, g.summary, ql),
        navigate: () => createPageUrl("GuidelinesLibrary") + `?search=${encodeURIComponent(g.title)}&id=${g.id}`,
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);
  }

  async function searchProtocols(q, ql) {
    const all = await base44.entities.TreatmentTemplate.list("-updated_date", 200);
    return all
      .filter(t =>
        includes(t.name, ql) ||
        includes(t.diagnosis, ql) ||
        includes(t.description, ql) ||
        includes(t.specialty, ql)
      )
      .map(t => ({
        _type: "entity",
        title: t.name,
        snippet: snippet(t.description || t.diagnosis, q),
        badgeText: t.specialty || "Protocol",
        badgeClass: "bg-blue-100 text-blue-700",
        _score: scoreEntityItem(t.name + " " + (t.diagnosis || ""), t.description, ql),
        navigate: () => createPageUrl("ClinicalSupport") + `?tab=pathways&search=${encodeURIComponent(t.name)}`,
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 4);
  }

  async function searchTeaching(q, ql) {
    const all = await base44.entities.TeachingModule.list("-updated_date", 200);
    return all
      .filter(m =>
        includes(m.title, ql) ||
        includes(m.category, ql) ||
        includes(m.content?.overview, ql)
      )
      .map(m => ({
        _type: "entity",
        title: m.title,
        snippet: snippet(m.content?.overview || m.category, q),
        badgeText: m.category || "Module",
        badgeClass: "bg-teal-100 text-teal-700",
        _score: scoreEntityItem(m.title, m.content?.overview, ql),
        navigate: () => createPageUrl("TeachingHub") + `?search=${encodeURIComponent(m.title)}&id=${m.id}`,
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 4);
  }

  async function searchBiopsy(q, ql) {
    const all = await base44.entities.BiopsyPattern.list("-updated_date", 200);
    return all
      .filter(b =>
        includes(b.name, ql) ||
        includes(b.also_called, ql) ||
        includes(b.clinical_presentation, ql) ||
        includes(b.pattern_code, ql)
      )
      .map(b => ({
        _type: "entity",
        title: b.name,
        snippet: snippet(b.clinical_presentation || b.also_called, q),
        badgeText: b.pattern_code || "Biopsy",
        badgeClass: "bg-rose-100 text-rose-700",
        _score: scoreEntityItem(b.name + " " + (b.also_called || ""), b.clinical_presentation, ql),
        navigate: () => createPageUrl("GlomerularDiseases") + `?search=${encodeURIComponent(b.name)}`,
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 4);
  }

  // ── Click outside ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (!containerRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Keyboard nav ──────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (!open) return;
    const flat = flatResults.current;
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused(f => Math.min(f + 1, flat.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)); }
    if (e.key === "Enter" && flat[focused]) { goTo(flat[focused]); }
    if (e.key === "Escape")    setOpen(false);
  };

  const goTo = (item) => {
    navigate(item.navigate());
    setQuery("");
    setOpen(false);
    flatResults.current = [];
    setGroups({});
  };

  const hasResults = Object.values(groups).some(g => g.length > 0);
  const totalResults = Object.values(groups).reduce((s, g) => s + g.length, 0);

  // Compute flat index offset per group for keyboard highlighting
  let runningIdx = 0;
  const groupOffsets = {};
  for (const key of Object.keys(groups)) {
    groupOffsets[key] = runningIdx;
    runningIdx += groups[key].length;
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => debouncedQuery && setOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-16 text-sm h-9"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button onClick={() => { setQuery(""); setOpen(false); setGroups({}); flatResults.current = []; }}
              className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={startVoiceSearch}
            className={`p-1 rounded-full transition-colors ${isListening ? "text-red-500 bg-red-50 animate-pulse" : "text-slate-400 hover:text-blue-500"}`}
            title="Voice search">
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && debouncedQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[480px] overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              Searching…
            </div>
          )}

          {!loading && !hasResults && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-slate-600">No results for "{debouncedQuery}"</p>
              <p className="text-xs text-slate-400 mt-1">Try a different term, drug name, or diagnosis keyword.</p>
            </div>
          )}

          {!loading && hasResults && Object.entries(groups).map(([key, items]) => {
            if (!items.length) return null;
            const meta = ENTITY_GROUP_META[key] || ENTITY_GROUP_META.static;
            const Icon = meta.icon;
            const offset = groupOffsets[key];

            return (
              <div key={key}>
                {/* Section header */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border-b border-slate-100 sticky top-0`}>
                  <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wide ${meta.color}`}>{meta.label}</span>
                  <span className="ml-auto text-xs text-slate-400">{items.length}</span>
                </div>

                {items.map((item, i) => {
                  const flatIdx = offset + i;
                  const isFocused = focused === flatIdx;
                  return (
                    <button
                      key={i}
                      onClick={() => goTo(item)}
                      className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors border-b border-slate-100 last:border-0 ${isFocused ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800 truncate">{item.title}</span>
                          {item.badgeText ? (
                            <Badge className={`text-xs shrink-0 ${item.badgeClass || "bg-slate-100 text-slate-700"}`}>
                              {item.badgeText}
                            </Badge>
                          ) : item.category ? (
                            <Badge className={`text-xs shrink-0 ${CATEGORY_COLORS[item.category] || "bg-slate-100 text-slate-700"}`}>
                              {item.category}
                            </Badge>
                          ) : null}
                        </div>
                        {item.snippet && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.snippet}</p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    </button>
                  );
                })}
              </div>
            );
          })}

          {!loading && hasResults && (
            <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400 text-center">
              {totalResults} result{totalResults !== 1 ? "s" : ""} for "{debouncedQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}