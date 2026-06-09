import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertTriangle, ArrowRight, Info, Activity, Pill, Shield, BookOpen } from "lucide-react";

// ─── ONCOLOGY DATA ────────────────────────────────────────────────────────────

const CONDITIONS = [
  { id: "all", label: "Select a condition…", group: null },
  // Haematological
  { id: "all-aml", label: "AML – Acute Myeloid Leukaemia", group: "Haematological" },
  { id: "all-all", label: "ALL – Acute Lymphoblastic Leukaemia", group: "Haematological" },
  { id: "cml", label: "CML – Chronic Myeloid Leukaemia", group: "Haematological" },
  { id: "nhl", label: "NHL – Non-Hodgkin Lymphoma", group: "Haematological" },
  { id: "hl", label: "Hodgkin Lymphoma", group: "Haematological" },
  // Solid Tumours
  { id: "wilms", label: "Wilms Tumour (Nephroblastoma)", group: "Solid Tumours" },
  { id: "neuroblastoma", label: "Neuroblastoma", group: "Solid Tumours" },
  { id: "medulloblastoma", label: "Medulloblastoma / Brain Tumour", group: "Solid Tumours" },
  { id: "rhabdomyosarcoma", label: "Rhabdomyosarcoma (RMS)", group: "Solid Tumours" },
  { id: "osteosarcoma", label: "Osteosarcoma / Ewing Sarcoma", group: "Solid Tumours" },
  { id: "retinoblastoma", label: "Retinoblastoma", group: "Solid Tumours" },
  { id: "hepatoblastoma", label: "Hepatoblastoma / Liver Tumour", group: "Solid Tumours" },
  // Supportive
  { id: "tls", label: "Tumour Lysis Syndrome (TLS)", group: "Supportive Oncology" },
  { id: "febrile_neutropenia", label: "Febrile Neutropenia", group: "Supportive Oncology" },
  { id: "chemotox", label: "Chemotherapy Toxicity & Monitoring", group: "Supportive Oncology" },
  { id: "antiemesis", label: "Anti-emesis in Oncology", group: "Supportive Oncology" },
];

const DATA = {
  "all-all": {
    title: "ALL – Acute Lymphoblastic Leukaemia",
    subtitle: "Most common childhood cancer (75% of leukaemia) | ICMR/UKALL/COG protocols used in India",
    color: "bg-blue-700",
    protocols: [
      {
        name: "MRC UKALL 2003 / Modified (India — most common)",
        steps: [
          "Induction (4 weeks): Prednisolone 40 mg/m²/day PO × 28d + Vincristine 1.5 mg/m² IV weekly × 4 + L-asparaginase 6000 IU/m² IM × 9 doses + IT MTX day 8,15,22,29",
          "Consolidation: MTX + 6MP cycles (Standard risk) OR additional intensification blocks (High risk)",
          "Interim Maintenance: Oral 6-MP 75 mg/m²/day + MTX 20 mg/m² IM weekly",
          "Delayed Intensification (HR/MR): Dexamethasone + VCR + Doxorubicin + CPM + Cytarabine + ASNase",
          "Maintenance (2 years from CR): 6-MP 75 mg/m²/day + MTX 20 mg/m² PO weekly + monthly VCR + dexamethasone pulses",
          "CNS prophylaxis: IT MTX × 12–16 doses total (cranial RT only for CNS3 at diagnosis in HR)",
        ]
      },
      {
        name: "BFM-95 / AIEOP-BFM (some centres)",
        steps: [
          "Protocol I (Phase A): PRED + VCR + DNR + ASNase + IT MTX — 33 days",
          "Protocol I (Phase B): CPM + Cytarabine + 6-MP + IT MTX — 4 weeks",
          "M-Protocol (HR): High-dose MTX 5 g/m² × 3 courses with leucovorin rescue",
          "Protocol II: Dexamethasone + VCR + Doxo + CPM + Cytarabine + Thioguanine",
        ]
      },
    ],
    risk_stratification: [
      "Standard Risk: Age 1–9.99y + WBC <50,000 + no CNS disease + no T-cell",
      "High Risk: Age <1y or ≥10y OR WBC ≥50,000 OR T-ALL OR CNS3 OR testicular",
      "MRD Day 29: Key driver — MRD positive = escalate; MRD neg = de-escalate",
    ],
    drugs: [
      { name: "Vincristine", dose: "1.5 mg/m² IV (max 2 mg)", freq: "Weekly × 4 in induction", toxicity: "Peripheral neuropathy, ileus, SIADH. Avoid with azoles (increased toxicity)." },
      { name: "L-Asparaginase (ASNase)", dose: "E. coli: 6000 IU/m² IM; Erwinia: 25000 IU/m²", freq: "Days 5,8,11,15,18,22 (varies by protocol)", toxicity: "Pancreatitis, coagulopathy (↓fibrinogen, ↑PT), hyperglycaemia, thrombosis, allergic reactions. Monitor fibrinogen, PT, amylase." },
      { name: "Doxorubicin (HR/DI)", dose: "25–30 mg/m² IV", freq: "Per protocol blocks", toxicity: "Cardiomyopathy (cumulative dose limit 300–400 mg/m²). Echo before/during/after. Vesicant." },
      { name: "Methotrexate (IT)", dose: "6–12 mg IT (age-based: <2y: 8mg; 2–3y: 10mg; ≥3y: 12mg)", freq: "Multiple intrathecal doses", toxicity: "Chemical meningitis, myelopathy, leukoencephalopathy (late)" },
      { name: "HD-MTX (HR)", dose: "5 g/m² IV over 24h", freq: "Monthly × 3 in HR blocks", toxicity: "Mucositis, nephrotoxicity, myelosuppression. Leucovorin rescue mandatory. Avoid NSAIDs, PPI (delays excretion)." },
      { name: "6-Mercaptopurine (6-MP)", dose: "75 mg/m²/day PO on empty stomach", freq: "Daily maintenance", toxicity: "Myelosuppression, hepatotoxicity, thiopurine toxicity (TPMT/NUDT15 polymorphism — Asian patients at high risk). Check NUDT15 R139C genotype before starting." },
    ],
    monitoring: [
      "CBC with differential: Weekly during induction, fortnightly during consolidation, monthly during maintenance",
      "LFT (AST/ALT/bilirubin): Monthly — 6-MP hepatotoxicity monitoring",
      "Amylase/lipase: Before each ASNase dose",
      "Fibrinogen/PT: Baseline and during ASNase therapy (target fibrinogen >100 mg/dL)",
      "Cardiac echo: Baseline, after cumulative doxorubicin 200 mg/m², and at end of therapy",
      "MRD by flow cytometry: Day 8 (PB), Day 29 (BM), Day 79 (if applicable) — critical for risk stratification",
      "LP for IT MTX: Each CNS prophylaxis visit — note cell count, cytology",
      "Glucose: Daily during steroid phases (hyperglycaemia)",
    ],
    pearls: [
      "NUDT15 R139C variant (common in Indian/Asian patients): causes severe myelosuppression with thiopurines — genotype before maintenance if available",
      "Down syndrome ALL: Omit asparaginase (increased toxicity), reduce MTX doses, monitor closely for mucositis",
      "6-MP on empty stomach improves bioavailability; avoid milk",
      "Early VCR neuropathy: reduce dose 25%, do not give with fluconazole/voriconazole",
      "LMB protocol used for B-NHL (not ALL); BFM-NHL for T-NHL",
      "T-ALL: Nelarabine-based protocols in relapsed/refractory (limited availability India)",
    ],
    india_notes: "Generic L-asparaginase (Elspar, Kidrolase, LEUGINASE) available. Erwinia (crisantaspase) not reliably available — use PEG-ASNase if allergic. MRD available at major centres (AIIMS, CMC Vellore, Tata Memorial, PGIMER). NUDT15 testing available at some centres.",
  },

  "all-aml": {
    title: "AML – Acute Myeloid Leukaemia",
    subtitle: "20% of childhood leukaemia | BFM/MRC AML-like protocols in India",
    color: "bg-rose-700",
    protocols: [
      {
        name: "AML-BFM 2004 / Modified (India standard)",
        steps: [
          "Induction I (AIE): Cytarabine 100 mg/m²/day CI × 10d + Idarubicin 12 mg/m² IV days 3,5 + Etoposide 150 mg/m² days 6,7,8 + IT AraC",
          "Induction II (HAM — HR only): High-dose AraC 3 g/m²/12h × 3d + Mitoxantrone 10 mg/m² × 2d",
          "Consolidation (HD-AraC): Cytarabine 3 g/m² q12h × 3d + Etoposide/Mitoxantrone",
          "ALLO-SCT: Indicated in HR (adverse cytogenetics: FLT3-ITD high allelic ratio, monosomy 7, -5q, TP53, RUNX1, t(6;9))",
        ]
      },
      {
        name: "COG AAML1031 (some centres)",
        steps: [
          "Induction 1: Cytarabine + Daunorubicin + Etoposide (ADE) × 10 days",
          "Induction 2: ADE repeated based on response",
          "Intensification 1 & 2: HD-AraC based",
          "Gemtuzumab ozogamicin (GO): Added in some centers for CD33+ AML",
        ]
      },
    ],
    risk_stratification: [
      "Low Risk (CBF-AML): t(8;21) RUNX1-RUNX1T1 or inv(16)/t(16;16) — chemo only",
      "Standard Risk: Normal cytogenetics, NPM1+, CEBPA biallellic",
      "High Risk: FLT3-ITD HAR, monosomy 7, -5/5q, KMT2A-r (non-CBF), t(6;9), TP53 — consider SCT",
      "MRD by flow (Day 22 BM): <0.1% = good; ≥0.1% = adverse prognosis",
    ],
    drugs: [
      { name: "Cytarabine (AraC)", dose: "Standard: 100–200 mg/m²/day; High dose: 3 g/m²/12h", freq: "Continuous infusion (CI) in induction; intermittent in consolidation", toxicity: "Myelosuppression, mucositis, cerebellar toxicity (HD — check HEENT, nystagmus, ataxia before each HD dose), conjunctivitis with HD-AraC (use prednisolone eye drops). Ara-C syndrome: fever, myalgias, rash (treat with corticosteroids)." },
      { name: "Idarubicin", dose: "12 mg/m² IV", freq: "Days 3, 5 of Induction", toxicity: "Cardiotoxicity — LVEF monitoring required. Cumulative anthracycline limit. Vesicant." },
      { name: "Daunorubicin", dose: "60 mg/m²/day × 3", freq: "Per protocol", toxicity: "Cardiotoxicity (cumulative limit ~400 mg/m²). Echo baseline + post-therapy." },
      { name: "Etoposide (VP-16)", dose: "150 mg/m²/day", freq: "Days 6,7,8 of induction", toxicity: "Hypotension with rapid infusion (>60 min infusion), secondary leukaemia (MLL rearrangement — rare), mucositis." },
      { name: "Mitoxantrone", dose: "10 mg/m²/day × 2", freq: "HAM consolidation", toxicity: "Cardiotoxicity, blue-green urine/sclera (normal — warn family), myelosuppression." },
    ],
    monitoring: [
      "CBC daily during aplasia (ANC <500)", "Creatinine + electrolytes before HD-AraC", "Cardiac echo before each anthracycline-containing course",
      "Cerebellar function check (finger-nose, tandem gait) before each HD-AraC dose",
      "BM aspirate Day 22 Induction I + after each course for MRD and morphology",
      "Ophthalmology: Prednisolone eye drops prophylaxis during HD-AraC",
      "Fungal surveillance: HRCT chest for pulmonary aspergillosis if febrile neutropenia persists",
    ],
    pearls: [
      "APL (AML-M3, t(15;17) PML-RARA): ATRA 45 mg/m²/day + ATO 0.15 mg/kg/day — do NOT give anthracyclines initially (APL differentiation syndrome risk, ATRA syndrome)",
      "APL differentiation syndrome: ATRA syndrome — fever, wt gain, pleural/pericardial effusion, renal failure — STOP ATRA, give dexamethasone 10 mg/m² q12h",
      "Down syndrome AML: Very chemo-sensitive — lower doses, avoid HD-AraC if possible (high toxicity DS AML)",
      "AraC conjunctivitis during HD cycles — prophylactic prednisolone 0.5% eye drops 4x/day during and 2 days post-AraC",
    ],
    india_notes: "AraC, daunorubicin, etoposide — generic widely available. Idarubicin available major centres. ATRA (tretinoin oral) available generically. ATO (arsenic trioxide) — gov supply via AIIMS/Tata Memorial; otherwise expensive. FLT3 inhibitors (midostaurin/quizartinib) not yet routinely available in India.",
  },

  "wilms": {
    title: "Wilms Tumour (Nephroblastoma)",
    subtitle: "Most common renal tumour in children | SIOP vs COG approach — both used in India",
    color: "bg-teal-700",
    protocols: [
      {
        name: "SIOP-2016 (Pre-operative chemo — preferred in India for unilateral)",
        steps: [
          "Pre-op chemo (4 weeks): Actinomycin-D 45 mcg/kg IV day 1 + Vincristine 1.5 mg/m² IV weekly × 4",
          "Nephrectomy: Week 5 (lymph node sampling mandatory)",
          "Histology-guided post-op: Low risk → AVD × 4 weeks; Standard risk → AVD × 27 weeks; High risk (blastemal type) → VP/carboplatin/etoposide/Doxo",
          "Stage IV (pulmonary mets): Add lung RT (12 Gy) if no complete remission with chemo",
        ]
      },
      {
        name: "COG/NWTS (Upfront nephrectomy — used when diagnosis uncertain or age <6m)",
        steps: [
          "Upfront nephrectomy with nodal sampling",
          "Stage I FH: Actinomycin-D + VCR × 18 weeks (EE-4A)", 
          "Stage II–III FH: AVD (Actinomycin-D + VCR + Doxorubicin) × 24 weeks + RT",
          "Stage IV: Regimen DD-4A (AVD) + whole lung RT",
          "Anaplastic (UH): Regimen M — CPM/Carbo/Etoposide/Doxo + RT",
        ]
      },
    ],
    risk_stratification: [
      "SIOP post-op histology: Blastemal type (worst) > Mixed > Epithelial (best) > Stromal/Regressive",
      "Stage I–II Favourable histology: ≥90% OS with AVD",
      "Bilateral Wilms (5–8%): Pre-op chemo × 6 weeks + bilateral nephron-sparing surgery (NSS) if feasible",
      "Genetic risk: WT1 mutation, DROSHA/DGCR8 (miRNAPP), WT2/IGF2 — bilateral/predisposition syndromes",
    ],
    drugs: [
      { name: "Actinomycin-D (Dactinomycin)", dose: "45 mcg/kg IV (max 2.3 mg/dose)", freq: "Day 1 of 3-weekly courses", toxicity: "Veno-occlusive disease (SOS/VOD) — esp. with RT overlap. Hepatotoxicity (↑LFT). Radiation recall. Vesicant (central line preferred)." },
      { name: "Vincristine", dose: "1.5 mg/m² IV (max 2 mg)", freq: "Weekly in pre-op; weekly in post-op", toxicity: "Peripheral neuropathy, constipation, SIADH, jaw pain, foot drop (late)." },
      { name: "Doxorubicin", dose: "45 mg/m² IV q3w (in AVD)", freq: "Every 3 weeks (Stage III+)", toxicity: "Cardiomyopathy — cumulative limit 300 mg/m². Echo required. Vesicant." },
    ],
    monitoring: [
      "Ultrasound abdomen: Monthly for first year, 3-monthly year 2, 6-monthly year 3–5",
      "CT chest: Pre-op, after chemo (for pulmonary metastases — SIOP), and as indicated",
      "CBC, LFT, creatinine: Before each chemo course",
      "Cardiac echo: Before Doxorubicin initiation, mid-therapy (cumulative 150 mg/m²), end of therapy, 1yr and 5yr post",
      "Blood pressure: Each visit (hypertension from remaining renal tissue, renal artery injury)",
      "eGFR/creatinine: Long-term monitoring — solitary kidney after nephrectomy",
    ],
    pearls: [
      "Never biopsy before nephrectomy (SIOP) — risk of tumour rupture, upstages to Stage III, mandates RT",
      "Bilateral Wilms: Do NOT resect upfront — pre-op chemo 6 weeks then reassess; aim for NSS (nephron sparing surgery)",
      "Pulmonary nodules ≥3 mm on CT = pulmonary mets — add whole lung RT 12 Gy in COG; SIOP: complete remission with chemo = no RT",
      "Late effects to counsel: Infertility (pelvic RT), cardiomyopathy (doxo + RT), scoliosis (flank RT), secondary malignancy",
      "Post-treatment follow-up minimum 5 years for Wilms (late relapse possible)",
    ],
    india_notes: "SIOP protocol preferred at AIIMS, Tata Memorial, CMC Vellore. COG used where SIOP experience lacking. Actinomycin-D available generically (Cosmegen/generic). Doxorubicin available. RT facilities required — refer to a centre with paediatric radiation oncology.",
  },

  "neuroblastoma": {
    title: "Neuroblastoma",
    subtitle: "Most common extracranial solid tumour in children <5 years | SIOPEN/COG risk-stratified approach",
    color: "bg-orange-700",
    protocols: [
      {
        name: "SIOPEN High Risk (most common at Indian centres)",
        steps: [
          "Induction (6 courses alternating): COJEC (Carbo+Etoposide+Vincristine+Cisplatin+Cyclo) OR CEM (Carbo+Etoposide+Melphalan) OR RAPID-COJEC at SIOPEN centres",
          "Surgery: After 4–6 cycles when resectable",
          "High-dose therapy + AutoSCT: Busulfan + Melphalan (BuMel) consolidation",
          "Maintenance: Isotretinoin 160 mg/m² × 6 cycles (6 months)",
          "Immunotherapy (if available): Dinutuximab beta (anti-GD2) — limited India availability",
        ]
      },
      {
        name: "Low Risk (Observation or Surgery only)",
        steps: [
          "Stage L1 (<18m): Observation if MYCN negative — majority spontaneously regress",
          "Stage L2 (<18m, non-MYCN): Surgery ± limited chemo (CARBOVP × 2–4 cycles)",
        ]
      },
    ],
    risk_stratification: [
      "Low Risk: Localised, no MYCN amplification, age <18m, favourable histology",
      "Intermediate Risk: Stage L2 or M (age <18m) without MYCN amplification",
      "High Risk: MYCN amplification (any stage/age) OR Stage M (age ≥18m) OR Stage M + unfavourable biology",
      "Key biomarkers: MYCN (FISH), ALK, PHOX2B (constitutional), serum NSE, LDH, ferritin",
    ],
    drugs: [
      { name: "Carboplatin", dose: "AUC 6–7 IV (Calvert formula using Cockcroft-Gault)", freq: "Every 21 days", toxicity: "Myelosuppression, ototoxicity (less than cisplatin), nephrotoxicity, thrombocytopenia (dose-limiting)." },
      { name: "Cisplatin", dose: "90 mg/m² IV over 6h", freq: "Alternating with carbo cycles", toxicity: "Nephrotoxicity (hyper-hydration mandatory: 3L/m²/day), ototoxicity (BAER before each course), peripheral neuropathy, hypomagnesaemia." },
      { name: "Etoposide (VP-16)", dose: "160 mg/m²/day × 3 or 100 mg/m²/day × 5", freq: "Per COJEC cycle", toxicity: "Secondary AML, mucositis, hypotension with rapid infusion." },
      { name: "Cyclophosphamide", dose: "140–200 mg/kg (COJEC)", freq: "High-dose in consolidation", toxicity: "Haemorrhagic cystitis — mesna mandatory for doses >500 mg/kg total. Bladder irrigation. Infertility." },
      { name: "Isotretinoin (cis-retinoic acid)", dose: "160 mg/m²/day PO in 2 divided doses × 14 days", freq: "Every 28 days × 6 cycles (maintenance)", toxicity: "Dry skin/lips (cheilitis), triglycerides ↑, teratogenic (counsel family), hepatotoxicity. Monitor lipids, LFT." },
    ],
    monitoring: [
      "MIBG scan (I-123 or I-131): Baseline, after 4 cycles induction, pre-AutoSCT, end of therapy, and annually × 3 years",
      "MIBG unavailable in India → FDG-PET + CT as alternative",
      "Urine catecholamines (VMA/HVA): Baseline, after induction, follow-up",
      "BAER (hearing): Before each cisplatin-containing cycle",
      "Renal: Creatinine + GFR before each cycle (cisplatin), 24h creatinine clearance periodically",
      "Neurological: Horner syndrome, OMS (opsoclonus-myoclonus-ataxia) — may persist or worsen with treatment",
    ],
    pearls: [
      "OMS (opsoclonus-myoclonus syndrome) with neuroblastoma: Often Stage 1–2, good prognosis — BUT neurological sequelae severe; treat with ACTH + IVIG",
      "MIBG scan is gold standard staging — not CT/MRI alone",
      "AutoSCT: Busulfan-Melphalan conditioning — highly toxic mucositis, VOD, engraftment failure",
      "Dinutuximab (anti-GD2): Approved by FDA — not widely available in India; can be imported via compassionate use",
      "ALTS (ALK inhibitors — crizotinib/lorlatinib): For ALK-mutated refractory NB — investigational",
    ],
    india_notes: "COJEC/RAPID-COJEC widely used. AutoSCT available at Tata Memorial, CMC Vellore, AIIMS, PGIMER, Bangalore. I-123 MIBG scan: limited to select centres — contact nuclear medicine. Isotretinoin available as Accutane/Tretinex. Anti-GD2 not routinely available.",
  },

  "tls": {
    title: "Tumour Lysis Syndrome (TLS)",
    subtitle: "Oncological emergency — prevention > treatment | Cairo-Bishop criteria",
    color: "bg-red-700",
    protocols: [
      {
        name: "TLS Prevention & Treatment",
        steps: [
          "Risk stratification BEFORE chemo: High risk = Burkitt/ALL WBC>100k/AML-M5 — start allopurinol + IV hyperhydration 24–48h before chemo",
          "Hyperhydration: 3000 mL/m²/day of 0.9% NS or D5+0.45NS — NO potassium in fluid initially",
          "Allopurinol: 100 mg/m² PO TDS (max 300 mg/day for young children; 600 mg/day adult) — start 24h before chemo",
          "Rasburicase: 0.2 mg/kg IV over 30 min OD (ONLY if uric acid ≥ 8 mg/dL or rising rapidly) — DO NOT give if G6PD deficiency (haemolytic anaemia)",
          "Urine output target: ≥3 mL/kg/h — give furosemide if not adequate despite fluids",
          "Electrolyte correction: K+ <6 before starting chemo; K+ >6 — hold chemo, treat hyperK; Phos >6 phosphate binders; Ca²⁺ — correct only if symptomatic tetany",
          "Dialysis indications: K+ >7 unresponsive, uric acid >10 + rising, creatinine >3x upper limit, severe oliguria/anuria",
        ]
      },
    ],
    risk_stratification: [
      "High Risk: Burkitt lymphoma, ALL WBC>100,000, AML-M5 blast count high, bulky tumour",
      "Intermediate Risk: ALL WBC 50–100k, AML, NHL (non-Burkitt), neuroblastoma",
      "Low Risk: Solid tumours, Hodgkin, ALL WBC<50k — oral hydration + allopurinol only",
    ],
    drugs: [
      { name: "Allopurinol", dose: "100 mg/m² TDS PO (max 300–600 mg/day)", freq: "Start 24–48h before chemo", toxicity: "Rash (hypersensitivity), increases 6-MP toxicity (reduce 6-MP 50–75% if coadministered). Not effective for existing hyperuricaemia." },
      { name: "Rasburicase (Urate oxidase)", dose: "0.2 mg/kg IV single dose (repeat if uric acid not normalised in 24h)", freq: "Up to 5 doses in 5 days", toxicity: "Anaphylaxis (pre-medicate), methaemoglobinaemia, haemolysis in G6PD deficiency (CONTRAINDICATED). Must collect sample in pre-chilled tube immediately." },
      { name: "Sodium bicarbonate", dose: "Previously used for urine alkalinisation — NO LONGER RECOMMENDED", freq: "Avoid", toxicity: "Worsens calcium phosphate precipitation in tubules — avoid urinary alkalinisation." },
    ],
    monitoring: [
      "Electrolytes (K, Na, Ca, PO4): 4–6 hourly during high-risk period",
      "Uric acid, creatinine, LDH: 6–8 hourly",
      "Urine output strictly: Hourly catheter monitoring for critically unwell",
      "ECG: If K+ >6 mEq/L",
      "G6PD screen BEFORE rasburicase in high-risk ethnic groups (South Asian, African)",
    ],
    pearls: [
      "TLS can occur SPONTANEOUSLY before chemo in high-burden tumours — screen at admission",
      "Rasburicase degrades uric acid in sample if left at room temp — collect in pre-chilled tube, immediate lab processing",
      "Hyperphosphataemia drives hypocalcaemia — do NOT correct calcium aggressively unless symptomatic (precipitates CaPO4 in kidneys)",
      "Allopurinol + 6-MP: 6-MP dose must be reduced 50–75% (allopurinol inhibits xanthine oxidase — increased 6-MP toxicity and myelosuppression)",
    ],
    india_notes: "Rasburicase (Fasturtec/ELITEK) — expensive, not universally available; use allopurinol + aggressive hydration in resource-limited settings. Ensure G6PD screen before rasburicase.",
  },

  "febrile_neutropenia": {
    title: "Febrile Neutropenia (FN)",
    subtitle: "Oncological emergency — ANC <500 + fever ≥38.3°C | Empirical antibiotics within 1 hour",
    color: "bg-red-800",
    protocols: [
      {
        name: "FN Management Protocol",
        steps: [
          "Assessment: ANC, CXR, blood culture (peripheral + CVC if present), urine culture, throat/skin swabs if lesions",
          "Low risk (MASCC ≥21): Oral ciprofloxacin + amoxicillin-clavulanate (if no allergy) — outpatient if compliant",
          "High risk (MASCC <21 / ALL on therapy / AML / post-SCT / sepsis): IV Piperacillin-Tazobactam 100 mg/kg/8h IV (Pip-Taz) as first-line",
          "Day 3–5 no response / hemodynamically unstable: Add Vancomycin 15 mg/kg/6h IV + Metronidazole if abdominal source",
          "Persistent fever >5 days: ADD antifungal (Amphotericin B liposomal 3 mg/kg/day IV OR Voriconazole 9 mg/kg/12h × 2 loading then 8 mg/kg/12h if >2 yrs)",
          "Gram-negative sepsis: Pip-Taz + Amikacin 15 mg/kg OD IV (or Meropenem 40 mg/kg/8h if resistant)",
        ]
      },
    ],
    drugs: [
      { name: "Piperacillin-Tazobactam (Pip-Taz)", dose: "100 mg/kg/dose q8h IV (max 4.5g/dose)", freq: "Every 8 hours", toxicity: "Hypokalemia, rash, seizures at high doses. ↑creatinine. Drug fever if prolonged use." },
      { name: "Meropenem", dose: "40 mg/kg/dose q8h IV (max 2g)", freq: "Every 8 hours", toxicity: "Seizures (high doses), C. diff colitis, elevated LFT." },
      { name: "Vancomycin", dose: "15 mg/kg/dose q6h IV (AUC-guided dosing preferred)", freq: "Every 6 hours", toxicity: "Nephrotoxicity, ototoxicity — monitor trough (15–20 mcg/mL) or AUC/MIC." },
      { name: "Liposomal Amphotericin B (L-AmB)", dose: "3 mg/kg/day IV over 2h", freq: "Daily", toxicity: "Nephrotoxicity (less than conventional AmB), hypokalemia, hypomagnesia, infusion reactions (premedicate paracetamol + diphenhydramine), rigors." },
      { name: "G-CSF (Filgrastim/Lenograstim)", dose: "5 mcg/kg/day SC", freq: "Daily until ANC >1000", toxicity: "Bone pain (treat with paracetamol), splenic enlargement (avoid high-dose in SCT). May reduce FN duration." },
    ],
    monitoring: [
      "CBC daily until ANC recovery", "Blood cultures: Repeat if fever recurs after initial clearance",
      "Procalcitonin + CRP: Baseline and every 48h", "Fungal markers (β-D-glucan, galactomannan): If persistent fever >5 days",
      "Vancomycin levels: Trough before 4th dose or AUC/MIC if available",
      "Renal function: Daily with aminoglycoside/glycopeptide/AmB",
    ],
    pearls: [
      "Start antibiotics within 60 minutes of FN diagnosis — every hour delay increases mortality",
      "MASCC score ≥21 = low risk: age <60, no hypotension, no COPD, solid tumour/lymphoma, no dehydration, outpatient status, good performance",
      "Mucositis FN: Add metronidazole to cover anaerobes + α-streptococcal coverage",
      "Perineal lesion/typhlitis: Metronidazole mandatory + consider imaging (CT abdomen)",
      "G-CSF does NOT reduce mortality in established FN but reduces duration — use selectively",
      "CMV reactivation post-SCT: Weekly surveillance CMV PCR — preemptive ganciclovir",
    ],
    india_notes: "Pip-Taz widely available. Meropenem required if ESBL colonised (common in India — check prior microbiology). L-AmB available (Phosome/AmBisome/Liposomal-B) but expensive — generic L-AmB available. Caspofungin alternative for Candida but not Aspergillus.",
  },

  "chemotox": {
    title: "Chemotherapy Toxicity & Monitoring",
    subtitle: "Organ-specific toxicity monitoring for paediatric oncology",
    color: "bg-slate-700",
    protocols: [],
    drugs: [],
    monitoring: [],
    pearls: [],
    india_notes: "",
    table: [
      { drug: "Anthracyclines (Doxo/Dauno/Idarubicin)", organ: "Heart", monitor: "Echo baseline, q150 mg/m², end, 1y, 5y", limit: "Cumulative ≤300–400 mg/m² (doxo equivalent)", action: "Cardiology review if EF drops >10% or <53%" },
      { drug: "Cisplatin", organ: "Kidney + Ear", monitor: "Cr + GFR before each course; BAER audiogram per cycle", limit: "Cr >1.5x baseline = dose modify/hold", action: "Hyper-hydration 3L/m²; MgSO4 replacement (cisplatin depletes Mg)" },
      { drug: "Methotrexate (HD)", organ: "Kidney + Liver + Mucosa", monitor: "MTX levels 24h/48h/72h; LFT, Cr; mucositis grade", limit: "MTX level >1 µmol/L at 48h = toxic", action: "Leucovorin rescue — increase dose/frequency per level. Alkalinise urine pH >7. Avoid NSAIDs." },
      { drug: "Bleomycin", organ: "Lung", monitor: "PFT baseline + after 50 IU/kg total; DLCO", limit: "Cumulative >400 IU/kg = high risk", action: "Stop if DLCO drops >25%. Avoid supplemental O2 (bleomycin lung toxicity exacerbated)" },
      { drug: "Ifosfamide", organ: "Kidney (Fanconi) + Bladder + CNS", monitor: "Creatinine, glucose, phosphate, bicarbonate (Fanconi screen); UA for haematuria", limit: "Dose ≥12 g/m² cumulative = high renal risk", action: "Mesna 80–100% of ifosfamide dose for haemorrhagic cystitis. Fanconi: alkalinisation + phosphate + vit D." },
      { drug: "Vincristine", organ: "PNS + Autonomic", monitor: "DTRs, grip strength, foot drop screen; constipation diary", limit: "Grade 3 neuropathy = 25% dose reduction", action: "Laxatives prophylactically. Avoid azole antifungals (↑VCR toxicity). Jaw pain = normal, reassure." },
      { drug: "Cyclophosphamide (HD)", organ: "Bladder", monitor: "Urine dipstick before each dose", limit: "Any haematuria = hold", action: "Mesna mandatory. Hyperhydration 3L/m². Bladder irrigation if severe haematuria." },
      { drug: "L-Asparaginase", organ: "Pancreas + Liver + Coagulation", monitor: "Amylase/lipase, fibrinogen/PT before each dose; glucose", limit: "Lipase >3x ULN = hold; fibrinogen <50 = hold", action: "Replace FFP if fibrinogen <100 + bleeding. Insulin if hyperglycaemia. Switch to Erwinia if allergic." },
      { drug: "Corticosteroids (Pred/Dexa)", organ: "Bone + Glucose + Immune", monitor: "BP, weight, glucose, HbA1c; DEXA if >3 months", limit: "Hyperglycaemia = insulin; AVN = stop if severe", action: "Calcium + Vit D supplementation. PCP prophylaxis (trimethoprim-sulfa) on therapy. Screen for TB before starting." },
    ],
  },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

function DrugCard({ drug }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between px-3 py-2.5 bg-white text-left" onClick={() => setOpen(!open)}>
        <div>
          <span className="text-sm font-bold text-slate-900">{drug.name}</span>
          <span className="text-xs text-slate-500 ml-2">{drug.dose}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1.5">
          <div className="flex items-start gap-1.5">
            <Badge className="bg-blue-100 text-blue-700 text-xs flex-shrink-0">Dose</Badge>
            <p className="text-xs text-slate-700">{drug.dose}</p>
          </div>
          <div className="flex items-start gap-1.5">
            <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0">Freq</Badge>
            <p className="text-xs text-slate-700">{drug.freq}</p>
          </div>
          <div className="flex items-start gap-1.5">
            <Badge className="bg-red-100 text-red-700 text-xs flex-shrink-0">Toxicity</Badge>
            <p className="text-xs text-slate-700">{drug.toxicity}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OncologyEngine({ scenario }) {
  const [condition, setCondition] = useState(scenario || "all");
  const [openSection, setOpenSection] = useState("protocols");

  const data = DATA[condition];

  const groups = [...new Set(CONDITIONS.filter(c => c.group).map(c => c.group))];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-red-300" />
          <h2 className="font-bold text-base">Paediatric Oncology Engine</h2>
          <Badge className="bg-red-600 text-white text-xs">BETA</Badge>
        </div>
        <p className="text-xs text-slate-300">Protocols used in Indian hospitals — SIOP · COG · BFM · UKALL · IAP-Oncology</p>
      </div>

      {/* Medicolegal disclaimer */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Clinical Reference Only:</strong> Doses/protocols shown are standard references. Always verify with institutional protocol, NIMS/Tata Memorial/IAP-Oncology guidelines and supervising oncologist before prescribing. Paediatric oncology must be managed by a specialist team.
          </p>
        </div>
      </div>

      {/* Condition selector */}
      <div>
        <label className="text-xs font-bold text-slate-600 block mb-1.5">Select Condition / Protocol</label>
        <select
          value={condition}
          onChange={e => { setCondition(e.target.value); setOpenSection("protocols"); }}
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white font-medium"
        >
          <option value="all">— Select a condition —</option>
          {groups.map(g => (
            <optgroup key={g} label={g}>
              {CONDITIONS.filter(c => c.group === g).map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {condition === "all" && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">Select a condition above to view protocols</p>
          <p className="text-xs text-slate-400 mt-1">ALL · AML · Wilms · Neuroblastoma · Lymphoma · TLS · Febrile Neutropenia</p>
        </div>
      )}

      {data && condition !== "all" && (
        <>
          {/* Title */}
          <div className={`${data.color} text-white rounded-xl px-4 py-3`}>
            <h3 className="font-bold text-sm">{data.title}</h3>
            <p className="text-xs opacity-80 mt-0.5">{data.subtitle}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {[
              { id: "protocols", label: "Protocols", show: data.protocols?.length > 0 },
              { id: "risk", label: "Risk Strat.", show: data.risk_stratification?.length > 0 },
              { id: "drugs", label: "Drugs & Doses", show: data.drugs?.length > 0 },
              { id: "table", label: "Toxicity Table", show: !!data.table },
              { id: "monitoring", label: "Monitoring", show: data.monitoring?.length > 0 },
              { id: "pearls", label: "Clinical Pearls", show: data.pearls?.length > 0 },
              { id: "india", label: "India Notes", show: !!data.india_notes },
            ].filter(t => t.show).map(t => (
              <button key={t.id} onClick={() => setOpenSection(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${openSection === t.id ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Protocols */}
          {openSection === "protocols" && data.protocols?.map((p, pi) => (
            <div key={pi} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-3 py-2.5 border-b border-slate-200">
                <p className="text-xs font-bold text-slate-800">{p.name}</p>
              </div>
              <div className="p-3 space-y-1.5">
                {p.steps.map((s, si) => (
                  <div key={si} className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-slate-700 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">{si + 1}</span>
                    <p className="text-xs text-slate-700 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Risk Stratification */}
          {openSection === "risk" && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-violet-800 mb-1">Risk Stratification</p>
              {data.risk_stratification.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-violet-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-violet-800">{r}</p>
                </div>
              ))}
            </div>
          )}

          {/* Drugs */}
          {openSection === "drugs" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Pill className="w-4 h-4 text-violet-600" />
                <p className="text-xs font-bold text-slate-700">Drug Reference — tap to expand dose/toxicity</p>
              </div>
              {data.drugs.map((d, i) => <DrugCard key={i} drug={d} />)}
            </div>
          )}

          {/* Toxicity Table */}
          {openSection === "table" && data.table && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-2 py-2 text-left font-semibold">Drug</th>
                    <th className="px-2 py-2 text-left font-semibold">Organ</th>
                    <th className="px-2 py-2 text-left font-semibold">Monitor</th>
                    <th className="px-2 py-2 text-left font-semibold">Limit / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.table.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-2 py-2 font-semibold text-slate-800 border-b border-slate-100">{row.drug}</td>
                      <td className="px-2 py-2 text-red-700 font-medium border-b border-slate-100">{row.organ}</td>
                      <td className="px-2 py-2 text-slate-600 border-b border-slate-100">{row.monitor}</td>
                      <td className="px-2 py-2 text-slate-700 border-b border-slate-100">{row.limit || ""} {row.action || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Monitoring */}
          {openSection === "monitoring" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-bold text-blue-800">Monitoring Requirements</p>
              </div>
              {data.monitoring.map((m, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-800">{m}</p>
                </div>
              ))}
            </div>
          )}

          {/* Pearls */}
          {openSection === "pearls" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Info className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-bold text-amber-800">Clinical Pearls</p>
              </div>
              {data.pearls.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold text-xs flex-shrink-0">★</span>
                  <p className="text-xs text-amber-900">{p}</p>
                </div>
              ))}
            </div>
          )}

          {/* India Notes */}
          {openSection === "india" && data.india_notes && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">🇮🇳</span>
                <p className="text-xs font-bold text-orange-800">India-Specific Notes</p>
              </div>
              <p className="text-xs text-orange-900 leading-relaxed">{data.india_notes}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}