import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertTriangle, ArrowRight, Info, Activity, Pill, Shield, BookOpen, ChevronRight } from "lucide-react";

// ─── ONCOLOGY DATA ────────────────────────────────────────────────────────────

const CONDITIONS = [
  { id: "all", label: "Select a condition…", group: null },
  // Leukaemia
  { id: "all-all", label: "ALL – Acute Lymphoblastic Leukaemia (BCP-ALL / T-ALL)", group: "Leukaemia" },
  { id: "all-aml", label: "AML – Acute Myeloid Leukaemia", group: "Leukaemia" },
  { id: "cml", label: "CML – Chronic Myeloid Leukaemia", group: "Leukaemia" },
  // Lymphoma
  { id: "alcl", label: "ALCL – Anaplastic Large Cell Lymphoma (advanced)", group: "Lymphoma" },
  { id: "b-nhl", label: "Burkitt / DLBCL / B-NHL (mature B-cell NHL)", group: "Lymphoma" },
  { id: "hl", label: "Hodgkin Lymphoma", group: "Lymphoma" },
  // Solid Tumours
  { id: "neuroblastoma-hr", label: "Neuroblastoma — High Risk (HR-NBL-1/SIOPEN)", group: "Solid Tumours" },
  { id: "neuroblastoma-lr", label: "Neuroblastoma — Low/Intermediate Risk (LINES)", group: "Solid Tumours" },
  { id: "wilms", label: "Wilms Tumour / Renal Tumours (SIOP-RTSG UMBRELLA 2016)", group: "Solid Tumours" },
  { id: "rms-sts", label: "RMS & Soft Tissue Sarcoma (CWS/EpSSG)", group: "Solid Tumours" },
  { id: "medulloblastoma", label: "Medulloblastoma (SIOP-E/ESCP)", group: "Solid Tumours" },
  { id: "cns-gct", label: "CNS Germ Cell Tumours — Germinoma / NGGCT (SIOP GCT II)", group: "Solid Tumours" },
  { id: "osteosarcoma", label: "Osteosarcoma / Bone Sarcoma ⚠ Protocol pending", group: "Solid Tumours" },
  { id: "hepatoblastoma", label: "Hepatoblastoma ⚠ Protocol pending", group: "Solid Tumours" },
  { id: "lch", label: "Langerhans Cell Histiocytosis (LCH) ⚠ Protocol pending", group: "Solid Tumours" },
  // Supportive
  { id: "tls", label: "Tumour Lysis Syndrome (TLS)", group: "Supportive Oncology" },
  { id: "febrile_neutropenia", label: "Febrile Neutropenia", group: "Supportive Oncology" },
  { id: "chemotox", label: "Chemotherapy Toxicity & Monitoring", group: "Supportive Oncology" },
];

const DATA = {
  "all-all": {
    title: "ALL – Acute Lymphoblastic Leukaemia (BCP-ALL / T-ALL)",
    subtitle: "Primary protocol: ICiCLe ALL-14 / InPOG-ALL-15-01 (v1.1, Sep 2024) | Applies to all newly diagnosed children",
    color: "bg-blue-700",
    protocols: [
      {
        name: "ICiCLe ALL-14 / InPOG-ALL-15-01 (v1.1, Sep 2024) — Primary Indian Protocol",
        steps: [
          "Applies to: All newly diagnosed children with BCP-ALL (Standard / Intermediate / High Risk) and T-ALL. Risk defined by cytogenetics (KMT2A rearrangement, TCF3::HLF, iAMP21, etc.), marrow response at Day 35, and phenotype.",
          "Induction (5 weeks): Prednisolone 40 mg/m²/day PO d1–28 → Dexamethasone d29–35 taper + Vincristine 1.5 mg/m² IV d8,15,22,29 + L-asparaginase (PEG-ASNase preferred: 2500 IU/m² IM d12,26 OR E.coli: 6000 IU/m² IM × 9 doses) + DNR 30 mg/m² d8,15 (IR/HR only) + IT MTX (age-dosed) d1,8,15,22",
          "Consolidation (8 weeks): 6-MP 60 mg/m²/day PO + MTX 15 mg/m² IV/IM weekly × 8 + IT MTX × 4 (SR/IR); HR adds HD-MTX 5 g/m² × 2 courses",
          "Delayed Intensification (DI): Dexamethasone 10 mg/m²/day d1–7, d15–21 + VCR d1,8,15 + Mitoxantrone 10 mg/m² IV d1,2 (preferred over doxorubicin per v1.1) + CPM 1000 mg/m² d29 + Cytarabine 75 mg/m²/day × 4d d29–32,36–39 + 6-TG d29–42 + IT MTX × 2",
          "Maintenance (girls 2y / boys 3y from CR): 6-MP 75 mg/m²/day PO + MTX 20 mg/m²/wk PO + monthly VCR/Dexa pulses + IT MTX q3mo",
          "CNS prophylaxis: IT MTX throughout (no cranial RT except CNS3 refractory at Day 35 in HR); T-ALL and HR-BCP: additional IT cytarabine",
          "MRD-guided risk adaptation: Day 35 BM MRD (flow, <0.01% = good; ≥0.01% = escalate); Day 79 MRD confirms HR assignment",
        ]
      },
      {
        name: "BFM-95 / AIEOP-BFM (alternative at some centres)",
        steps: [
          "Protocol I (Phase A): PRED + VCR + DNR + ASNase + IT MTX — 33 days",
          "Protocol I (Phase B): CPM + Cytarabine + 6-MP + IT MTX — 4 weeks",
          "M-Protocol (HR): High-dose MTX 5 g/m² × 3 courses with leucovorin rescue",
          "Protocol II (Delayed Intensification): Dexamethasone + VCR + Doxorubicin + CPM + Cytarabine + Thioguanine",
          "Maintenance: 6-MP + MTX ± VCR/Dexa pulses",
        ]
      },
    ],
    risk_stratification: [
      "Standard Risk (SR): Age 1–9.99y + WBC <50,000 + BCP-ALL + no adverse cytogenetics + Day 8 PB blasts <1000 + Day 35 BM CR + MRD <0.01%",
      "Intermediate Risk (IR): Not SR or HR — includes slow early responders, WBC 50–100k, certain cytogenetics",
      "High Risk (HR): Age <1y or ≥10y OR WBC ≥100,000 OR T-ALL OR KMT2A-r OR TCF3::HLF OR iAMP21 OR hypodiploidy (<44 chr) OR Day 35 MRD ≥0.01% OR CNS3",
      "MRD Day 35 (BM flow): <0.01% = favourable; ≥0.01% = adverse; ≥1% at Day 79 = very high risk → consider SCT",
      "T-ALL: Treated as HR regardless of other features in ICiCLe protocol",
    ],
    drugs: [
      { name: "Vincristine", dose: "1.5 mg/m² IV (max 2 mg)", freq: "Weekly × 4–5 in induction", toxicity: "Peripheral neuropathy, ileus, SIADH, jaw pain. Avoid with azoles (increased neurotoxicity via CYP3A4)." },
      { name: "PEG-Asparaginase (preferred)", dose: "2500 IU/m² IM (max 3750 IU)", freq: "Day 12 and Day 26 of induction (ICiCLe)", toxicity: "Silent inactivation (monitor anti-ASNase antibodies if available), pancreatitis, coagulopathy (↓fibrinogen), hyperglycaemia, thrombosis. Monitor fibrinogen before each dose — target >100 mg/dL." },
      { name: "Mitoxantrone (DI — v1.1 preferred)", dose: "10 mg/m²/day IV days 1–2 of DI", freq: "Delayed Intensification phase", toxicity: "Cardiotoxicity (less than doxorubicin but monitor echo), blue-green urine (warn family — normal), myelosuppression. Preferred over doxorubicin in ICiCLe v1.1." },
      { name: "Methotrexate (IT)", dose: "Age-based: <1y 6mg; 1–2y 8mg; 2–3y 10mg; ≥3y 12mg", freq: "Multiple IT doses throughout", toxicity: "Chemical meningitis, myelopathy, leukoencephalopathy (late, especially with cranial RT)." },
      { name: "HD-MTX (HR consolidation)", dose: "5 g/m² IV over 24h (1/10 as 1h loading, 9/10 over 23h)", freq: "× 2 courses in HR (ICiCLe)", toxicity: "Mucositis, nephrotoxicity. Leucovorin rescue mandatory (start 42h from start, guided by MTX levels). Alkalinise urine pH >7. Avoid NSAIDs, PPIs." },
      { name: "6-Mercaptopurine (6-MP)", dose: "75 mg/m²/day PO on empty stomach", freq: "Daily in maintenance", toxicity: "Myelosuppression, hepatotoxicity. NUDT15 R139C polymorphism (common South/East Asian) causes severe toxicity — dose reduce 50% if heterozygous, 10% if homozygous. Check genotype before maintenance." },
    ],
    monitoring: [
      "CBC + differential: Weekly in induction, fortnightly consolidation, monthly maintenance",
      "LFT (AST/ALT): Monthly during 6-MP maintenance",
      "Amylase/lipase + fibrinogen/PT/D-dimer: Before each ASNase dose",
      "MRD by flow cytometry: Day 8 PB, Day 35 BM, Day 79 BM (critical for risk assignment)",
      "Cardiac echo: Baseline + after mitoxantrone courses + end of therapy + 1yr, 5yr",
      "MTX levels (HD-MTX): 24h, 48h, 72h — leucovorin dose adjusted per level",
      "NUDT15 genotype: Before maintenance initiation (if available)",
      "Glucose: Daily during steroid phases; LP cytology: Each IT procedure",
    ],
    pearls: [
      "ICiCLe v1.1 (Sep 2024): Mitoxantrone replaces doxorubicin in DI — lower cardiotoxicity, maintained efficacy",
      "TCF3::HLF fusion: Extremely poor prognosis — consider early SCT, flag for clinical trial",
      "KMT2A rearrangement: Routes to HR; specific rearrangement (e.g. KMT2A::AFF1) impacts prognosis",
      "NUDT15 R139C: Test before starting 6-MP — common in Indian/Asian patients; may need 50–80% dose reduction",
      "PEG-ASNase vs E.coli ASNase: PEG preferred (fewer doses, equivalent efficacy); silent hypersensitivity common — monitor anti-ASNase antibody levels if available",
      "Down syndrome ALL: Reduce MTX + ASNase doses; avoid HD-MTX; very sensitive to mucositis",
      "T-ALL: ICiCLe treats as HR; augmented Berlin-Frankfurt-Münster (aBFM) at AIIMS/Tata Memorial",
    ],
    india_notes: "ICiCLe ALL-14 / InPOG-ALL-15-01 is the primary collaborative Indian protocol — adopted at AIIMS Delhi, Tata Memorial Mumbai, CMC Vellore, PGIMER, RCC Thiruvananthapuram, and most major paediatric oncology centres. PEG-ASNase available (Oncaspar, Pegcyte). MRD by flow cytometry available at major InPOG centres. NUDT15 testing available at AIIMS Genetics. For centres not on ICiCLe, BFM-95 or modified UKALL 2003 remain acceptable alternatives.",
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

  "alcl": {
    title: "ALCL – Anaplastic Large Cell Lymphoma (Advanced Stage)",
    subtitle: "Protocol: COG ANHL0131 (2007) | T-cell anaplastic lymphoma, advanced stage",
    color: "bg-pink-700",
    protocols: [
      {
        name: "COG ANHL0131 (2007) — Reference protocol [research-purposes-only source; verify before institutional use]",
        steps: [
          "Applies to: Children with advanced-stage ALCL (T-cell, anaplastic; CD30+, ALK+/ALK−). Confirmed by CD30, ALK (FISH or IHC), and T-cell markers.",
          "Induction (5 weeks): APO backbone — Doxorubicin 75 mg/m² IV d1 + Prednisone 40 mg/m²/day PO d1–5 + Vincristine 1.5 mg/m² IV d1 + Methotrexate 3 g/m² IV over 3h with leucovorin rescue d15 + IT cytarabine d1",
          "Consolidation: 15 × 3-weekly cycles — APO (Doxo 25 mg/m² d1 + Pred 40 mg/m²/day d1–5 + VCR 1.5 mg/m² d1)",
          "CNS prophylaxis: IT cytarabine with each induction cycle; no cranial RT for CNS-negative disease",
          "CNS+ disease: Augment IT therapy per protocol; consider cranial RT for refractory CNS",
          "ALK-inhibitor (Crizotinib): Available for ALK+ relapsed/refractory ALCL — not part of standard front-line ANHL0131",
        ]
      },
    ],
    risk_stratification: [
      "Advanced stage: Stage III/IV, or Stage II with bulk disease",
      "ALK+ ALCL: 5-year OS ~70–80% with chemotherapy",
      "ALK− ALCL: Worse prognosis, ~40–50% OS — consider intensified therapy",
      "CNS involvement: ~15% at diagnosis — augmented IT therapy required",
      "Relapse: BV (brentuximab vedotin) ± chemotherapy; vinblastine monotherapy for slower relapses (ALK+ only)",
    ],
    drugs: [
      { name: "Doxorubicin", dose: "75 mg/m² IV (induction d1); 25 mg/m² (consolidation)", freq: "Each APO cycle", toxicity: "Cardiotoxicity — cumulative limit 300–400 mg/m² doxo-equivalents. Echo required. Vesicant." },
      { name: "Prednisone", dose: "40 mg/m²/day PO × 5 days", freq: "Each APO cycle", toxicity: "Hyperglycaemia, hypertension, mood changes, infection risk, adrenal suppression." },
      { name: "Vincristine", dose: "1.5 mg/m² IV (max 2 mg)", freq: "Each APO cycle", toxicity: "Peripheral neuropathy, constipation, SIADH. Avoid azoles." },
      { name: "Methotrexate (induction)", dose: "3 g/m² IV over 3h with leucovorin rescue", freq: "Day 15 of induction", toxicity: "Mucositis, nephrotoxicity. Leucovorin rescue: 15 mg/m²/6h starting 24h post-MTX. Alkalinise urine pH >7." },
    ],
    monitoring: [
      "CT chest/abdomen/pelvis: Baseline, after induction, after 8 cycles, end of therapy",
      "PET-CT if available: Pre-therapy staging and end-of-induction response assessment",
      "CBC weekly during induction, before each consolidation cycle",
      "Cardiac echo: Baseline, cumulative doxorubicin ≥200 mg/m², end of therapy, 1yr, 5yr",
      "MTX levels 24h/48h (induction cycle with HD-MTX): Leucovorin dose guided by level",
      "ALK status (IHC/FISH): Confirm at diagnosis — prognostic and therapeutic implications",
    ],
    pearls: [
      "COG ANHL0131 source is marked research-purposes-only — present as reference; verify current institutional protocol before use",
      "ALK+ ALCL: Excellent prognosis in children — OS ~80%; ALK− worse (~40%)",
      "Brentuximab vedotin (BV, anti-CD30): Highly active in relapsed ALK+ and ALK− ALCL — available in India via compassionate use/import",
      "Crizotinib: For ALK+ relapsed/refractory ALCL — ALK inhibitor, very active (ORR ~90% in case series)",
      "Vinblastine monotherapy: For isolated nodal relapses in ALK+ ALCL — low-intensity option",
      "Distinguishing ALCL from PTCL-NOS: Mandatory — ALCL has CD30+ and ALK+/− with anaplastic morphology; PTCL-NOS treated differently",
    ],
    india_notes: "ANHL0131 used at Tata Memorial, AIIMS, CMC Vellore as reference protocol. ALK testing (IHC for ALK1) widely available. Crizotinib for relapsed ALK+ ALCL: available via compassionate use. Brentuximab vedotin: importable but expensive.",
  },

  "b-nhl": {
    title: "Burkitt Lymphoma / DLBCL / B-NHL NOS (Mature B-Cell NHL)",
    subtitle: "Protocol: CCLG B-NHL / FAB-LMB96 + Rituximab (March 2020) | All mature B-cell NHL <18y",
    color: "bg-indigo-700",
    protocols: [
      {
        name: "CCLG B-NHL / FAB-LMB96 + Rituximab (March 2020)",
        steps: [
          "Applies to: All mature B-cell NHL in children <18y — Burkitt lymphoma (BL), DLBCL, B-NHL NOS. Stratified by group.",
          "Group A (low risk — completely resected, Stage I/II, LDH normal): COPAD × 2 (CPM + VCR + Pred + Doxo) — no IT therapy if CNS negative",
          "Group B (intermediate — Stage I/II unresected, Stage III, no CNS): COP pre-phase → COPADM × 2 (CPM + VCR + Pred + Doxo + MTX 3g/m²) → CYM × 2 (Cytarabine + MTX) → COPADM → Maintenance. Rituximab × 6 doses added if LDH >2× ULN.",
          "Group C (high risk — CNS+, Stage IV with BM/CNS, BM blasts ≥70%): CYVE pre-phase (HD-cytarabine + etoposide) → COPADM/1 → COPADM/2 → CYM × 2 → Maintenance. Rituximab × 6 doses added for all Group C.",
          "IT therapy (Group B/C): IT MTX + Ara-C + hydrocortisone — schedule per group stratification",
          "HD-Methotrexate with folinic acid rescue: Backbone of consolidation in all Group B and C — 3 g/m² (Group B) or 8 g/m² (Group C) with 42h leucovorin rescue",
          "CNS radiotherapy: Not routinely used; reserved for CNS refractory disease at specialist centres",
        ]
      },
    ],
    risk_stratification: [
      "Group A (Low Risk): Completely resected Stage I or Stage II abdominal (Murphy/St. Jude staging) — ~10% of cases",
      "Group B (Intermediate): Stage I/II not resected, Stage III, any LDH; OR Group A with LDH >2× ULN — rituximab added if LDH >2× ULN",
      "Group C (High Risk): CNS involvement (CNS3), BM blasts ≥70% (leukaemic phase), Stage IV — rituximab added for all Group C",
      "Histology: Burkitt (cMyc rearrangement MYC-BCL2/BCL6 co-rearrangement = worse prognosis), DLBCL, FL, MZL — LMB stratification applies to all mature B-cell",
    ],
    drugs: [
      { name: "Rituximab (anti-CD20)", dose: "375 mg/m² IV over 4–6h", freq: "× 6 doses (Day 1 of COPADM cycles + CYM cycles per schedule)", toxicity: "First-infusion reaction (pre-medicate: paracetamol + diphenhydramine + methylprednisolone). Hepatitis B reactivation (screen HBsAg/HBcAb before). Progressive multifocal leukoencephalopathy (rare). Hypogammaglobulinaemia post-therapy." },
      { name: "HD-Methotrexate (3–8 g/m²)", dose: "3 g/m² (Group B) or 8 g/m² (Group C) IV over 3h (Group B) or 4h (Group C)", freq: "Per COPADM/CYVE schedule", toxicity: "Mucositis, nephrotoxicity, myelosuppression. Leucovorin rescue: start 42h from MTX start. Monitor MTX levels 24h, 48h, 72h. Urine pH >7 before and during infusion." },
      { name: "Cyclophosphamide", dose: "250 mg/m²/dose × 5 (COP) or 500 mg/m²/dose × 5 (COPADM)", freq: "Per cycle days", toxicity: "Haemorrhagic cystitis (mesna + hyperhydration), myelosuppression, gonadotoxicity." },
      { name: "HD-Cytarabine (CYVE / Group C)", dose: "3 g/m²/12h × 4 doses (high-dose AraC in CYVE)", freq: "Pre-phase for Group C", toxicity: "Cerebellar toxicity (check coordination before each dose), conjunctivitis (prednisolone 0.5% eye drops prophylaxis), mucositis, myelosuppression." },
      { name: "Doxorubicin", dose: "60 mg/m² IV (COPADM d2)", freq: "Per COPADM cycle", toxicity: "Cardiotoxicity. Echo before initiation and at end of therapy. Vesicant — central line preferred." },
    ],
    monitoring: [
      "Staging: CT chest/abdomen/pelvis + BM aspirate/trephine + CSF cytology at diagnosis",
      "PET-CT: Baseline and end-of-induction (Group B/C) — assesses metabolic response",
      "CBC before each cycle; electrolytes + uric acid + LDH + creatinine before each cycle (TLS risk)",
      "MTX levels: 24h, 48h, 72h post-infusion — leucovorin dose adjustment per nomogram",
      "Ophthalmology check + cerebellar function: Before each HD-AraC (Group C/CYVE)",
      "Hepatitis B serology (HBsAg, HBcAb): Before rituximab — prophylactic entecavir if HBcAb+",
      "Echocardiogram: Baseline, after 300 mg/m² cumulative doxorubicin",
      "Tumour response: CT/PET at end of induction to confirm Group A/B→complete remission",
    ],
    pearls: [
      "Group A completely resected: Excellent prognosis (>95% OS) with only 2 cycles COPAD — avoid over-treatment",
      "LDH >2× ULN in Group B: Adds rituximab — significantly improves event-free survival",
      "Double/triple hit lymphoma (MYC + BCL2 + BCL6 rearrangements): In children rare; adult-type DLBCL protocols may be needed",
      "TLS risk is high in Burkitt/Group C — prophylactic hyperhydration + allopurinol before first cycle; rasburicase if uric acid rising",
      "LMB96 IT cytarabine: Triple IT (MTX + AraC + hydrocortisone) in Group C — do NOT use single IT MTX alone in Group C",
      "Post-rituximab hypogammaglobulinaemia: Monitor Ig levels at 6 months; IVIg if recurrent infections",
    ],
    india_notes: "LMB/FAB-LMB96 protocol used at Tata Memorial, AIIMS, CMC Vellore. Rituximab (Ristova, Maball, generic biosimilar) available at lower cost in India. MYC FISH testing available at AIIMS, Tata Memorial, CMC. HD-MTX with leucovorin rescue: ensure 24h pharmacy and lab services available for MTX level monitoring.",
  },

  "wilms": {
    title: "Wilms Tumour / Renal Tumours (SIOP-RTSG 2016 UMBRELLA)",
    subtitle: "Protocol: SIOP-RTSG 2016 UMBRELLA | All paediatric renal tumours — primary and relapsed",
    color: "bg-teal-700",
    protocols: [
      {
        name: "SIOP-RTSG 2016 UMBRELLA — Primary Disease",
        steps: [
          "Applies to: All paediatric renal tumours — Wilms (nephroblastoma), CCSK, MRTK, RCC. For primary unilateral Wilms ≥6 months age.",
          "Pre-operative chemotherapy (4 weeks): Actinomycin-D 45 mcg/kg IV d1 + Vincristine 1.5 mg/m² IV weekly × 4 weeks",
          "Surgery (Week 5): Radical nephrectomy with en-bloc lymph node sampling (mandatory — lymph node status is required for staging)",
          "Post-operative — risk/stage stratified: Stage I Low/Standard Risk → AV × 4 weeks; Stage I/II Blastemal-type or Stage III Standard → AV × 27 weeks; Stage III High risk (blastemal) → AVD + flank RT; Stage IV → AVD ± whole-lung RT",
          "Bilateral Wilms (Stage V): Pre-op chemo ×6 weeks → bilateral nephron-sparing surgery (NSS) → post-op stage/histology-guided chemo. Aim to preserve maximum renal parenchyma.",
          "Histology classification (post-op): Regressive / Epithelial / Stromal / Mixed (standard) vs Blastemal type (high risk, requires intensification)",
        ]
      },
      {
        name: "SIOP-RTSG UMBRELLA — Relapsed Disease (Relapse Risk Groups)",
        steps: [
          "Relapse Risk Group AA (standard relapse — previous AV only, no prior Doxo): CyD (cyclophosphamide + doxorubicin) alternating with Carbo/E (carboplatin + etoposide) × 8 courses. Carboplatin dosed by GFR — HOLD if GFR <30 mL/min/1.73m².",
          "Relapse Risk Group BB (prior doxorubicin exposure, or blastemal relapse): ICE induction (ifosfamide + carboplatin + etoposide) alternating with CyCE → HD-melphalan + ASCR (autologous stem cell rescue) as consolidation",
          "Relapse Risk Group CC (very high risk — >2 relapses, or prior HD therapy): Novel agent clinical trials; discuss at specialist centre",
          "Carboplatin dosing in relapse: Strictly GFR-banded — use Cockcroft-Gault/Calvert formula; HOLD if GFR <30",
          "Non-Wilms renal tumours: CCSK → doxorubicin-based (UMBRELLA CCSK arm); MRTK → experimental (rhabdoid tumour protocols); RCC → surgical ± targeted therapy per adult protocols",
        ]
      },
    ],
    risk_stratification: [
      "SIOP Histological risk post-op: Low risk (regressive/epithelial), Standard risk (mixed/stromal), High risk (blastemal type — worst outcome)",
      "Stage I (confined to kidney, complete excision): ~85–90% OS with AV alone",
      "Stage III (incomplete excision, positive nodes, rupture): Requires flank RT (15 Gy) in blastemal/high-risk",
      "Stage IV (distant mets — lung, liver): Whole-lung RT 12 Gy if no complete remission on chemo; liver mets — RT ±surgery",
      "Bilateral Wilms (Stage V, ~5–8%): 3-year EFS ~60–70% — nephron sparing is primary goal to preserve renal function",
      "CCSK (Clear Cell Sarcoma of Kidney): Stage I–IV — doxorubicin backbone, late relapse common (10yr follow-up)",
    ],
    drugs: [
      { name: "Actinomycin-D (Dactinomycin)", dose: "45 mcg/kg IV (max 2.3 mg/dose)", freq: "Day 1 of each 3-weekly course (pre-op and post-op AV)", toxicity: "SOS/VOD especially with RT overlap — monitor LFT closely. Radiation recall. Vesicant — central line preferred." },
      { name: "Vincristine", dose: "1.5 mg/m² IV (max 2 mg)", freq: "Weekly pre-op; d1,8,15 of post-op courses", toxicity: "Peripheral neuropathy, constipation, SIADH, jaw pain." },
      { name: "Doxorubicin", dose: "45 mg/m² IV q3w (AVD regimen)", freq: "Stage III high risk / Stage IV", toxicity: "Cardiomyopathy — cumulative limit 300 mg/m² doxo-equivalent. Echo required. Vesicant." },
      { name: "Carboplatin (relapse)", dose: "Calvert formula AUC 5 IV — STRICTLY GFR-banded; HOLD if GFR <30", freq: "Alternating cycles in relapse", toxicity: "Myelosuppression (esp. thrombocytopenia), ototoxicity, nephrotoxicity. GFR-based dosing mandatory." },
      { name: "Ifosfamide (relapse ICE)", dose: "1.8 g/m²/day × 5 IV", freq: "ICE cycles in relapse Group BB", toxicity: "Haemorrhagic cystitis (mesna mandatory), Fanconi syndrome (monitor phosphate, glucose, bicarb), encephalopathy. Mesna dose = ifosfamide dose." },
    ],
    monitoring: [
      "Ultrasound abdomen: Pre-chemo (diagnosis), pre-surgery (week 4), then monthly year 1, 3-monthly year 2, 6-monthly year 3–5",
      "CT chest: Baseline, pre-surgery, end of therapy (pulmonary mets assessment)",
      "CBC + LFT + creatinine: Before each chemo course",
      "GFR (DTPA/Cr-EDTA clearance): Baseline, after nephrectomy, annually — especially in bilateral Wilms/relapse",
      "Cardiac echo: Before doxorubicin, cumulative 150 mg/m², end of therapy, 1yr, 5yr",
      "Blood pressure: Each clinic visit — hypertension common with single kidney",
      "Carboplatin dosing check: Recalculate GFR before each carboplatin dose in relapse",
    ],
    pearls: [
      "Never biopsy before nephrectomy (SIOP) — tumour rupture upstages to Stage III and mandates RT",
      "Lymph node sampling is mandatory at surgery — no nodes sampled = cannot stage accurately = treat as Stage III",
      "Blastemal type post-nephrectomy: High-risk histology requiring intensified chemotherapy (± RT) even if Stage I",
      "Bilateral Wilms: Do NOT resect upfront — pre-op chemo × 6 weeks, reassess, aim for NSS; contralateral kidney function is the priority",
      "Carboplatin in relapse: GFR-banded dosing is critical — Calvert formula; if GFR <30 mL/min/1.73m², hold carboplatin",
      "CCSK: Late relapse occurs — follow-up minimum 10 years; doxorubicin backbone essential",
      "WT1 mutation (constitutional): Bilateral predisposition + risk of gonadoblastoma/Wilms — screen with regular ultrasound",
    ],
    india_notes: "SIOP-RTSG 2016 UMBRELLA adopted at AIIMS, Tata Memorial, CMC Vellore, Kidwai Memorial, PGIMER. Actinomycin-D (Cosmegen/generic dactinomycin) available. GFR measurement: DTPA renogram available at nuclear medicine centres; use Schwartz GFR + 24h CrCl as alternatives. AutoSCT for relapse Group BB: Tata Memorial, AIIMS, CMC Vellore.",
  },

  "neuroblastoma-hr": {
    title: "Neuroblastoma — High Risk",
    subtitle: "Protocol: HR-NBL-1 / SIOPEN (UK v13.0b, 2016) | INSS Stage 2/3/4/4s with MYCN amplification; Stage 4 ≥12m",
    color: "bg-orange-700",
    protocols: [
      {
        name: "HR-NBL-1 / SIOPEN (UK v13.0b, 2016)",
        steps: [
          "Applies to: INSS stages 2, 3, 4 or 4s with MYCN amplification (any age); OR INSS stage 4 without MYCN amplification aged ≥12 months.",
          "Induction: Rapid COJEC — Course A: VCR 1.5 mg/m² d1 + Carbo AUC4.1 d1–2 + Etop 160 mg/m²/day d1–3; Course B: VCR + Cisplatin 50 mg/m²/day d1–4; Course C: VCR + Carbo + Etop (alternating A/B/C every 10 days × 10 weeks regardless of counts). Alternatively: modified N7 (COG protocol).",
          "TVD rescue: For inadequate response after COJEC — topotecan + vincristine + doxorubicin",
          "Surgery: After induction — maximal safe resection",
          "High-dose consolidation: BuMel (busulfan 4 × 3.75 mg/kg/day PO × 4d + melphalan 140 mg/m² IV d–1) → autologous PBSCR (stem cell rescue). Most toxic phase — mortality risk ~5–10%.",
          "Post-SCT: Radiotherapy to primary site (21 Gy); MIBG-avid residual sites ± boost",
          "Maintenance: Isotretinoin 160 mg/m²/day × 14d, every 28d × 6 cycles",
          "Immunotherapy: Anti-GD2 (dinutuximab beta / ch14.18) — standard of care post-RT; not universally available in India",
        ]
      },
    ],
    risk_stratification: [
      "High Risk entry criteria: MYCN amplification (any INSS stage) OR INSS Stage 4 aged ≥12 months (with or without MYCN)",
      "INSS Stage 4s with MYCN amp: Routes to HR-NBL despite 4s biology",
      "ALK mutation: Additional adverse marker — ALK inhibitor (lorlatinib) available in clinical trials",
      "Post-induction MIBG response (SIOPEN score): Guides BuMel eligibility and outcome prediction",
    ],
    drugs: [
      { name: "Carboplatin (COJEC)", dose: "AUC 4.1 IV (Calvert using EDTA GFR preferred)", freq: "Courses A and C of COJEC", toxicity: "Myelosuppression, ototoxicity, thrombocytopenia. BAER audiogram before each cisplatin course." },
      { name: "Cisplatin (COJEC-B)", dose: "50 mg/m²/day × 4 days IV over 6h", freq: "Course B of COJEC", toxicity: "Nephrotoxicity (mandatory hyperhydration 3L/m²/day + Mg supplementation), ototoxicity (BAER required), peripheral neuropathy." },
      { name: "Etoposide (VP-16)", dose: "160 mg/m²/day × 3 IV", freq: "Courses A and C of COJEC", toxicity: "Myelosuppression, secondary AML (rare), mucositis, hypotension with rapid infusion." },
      { name: "Busulfan (BuMel)", dose: "3.75 mg/kg PO × 4 doses/day × 4 days (total 60 mg/kg)", freq: "Once — conditioning for AutoSCT", toxicity: "SOS/VOD (most feared — use prophylactic ursodeoxycholic acid + defibrotide if available), mucositis, seizures (prophylactic phenytoin/levetiracetam during Bu), engraftment failure." },
      { name: "Isotretinoin", dose: "160 mg/m²/day PO in 2 divided doses × 14d", freq: "Every 28 days × 6 cycles", toxicity: "Cheilitis, dry skin, hypertriglyceridaemia, teratogenic, hepatotoxicity. Monitor lipids + LFT." },
    ],
    monitoring: [
      "MIBG scan (I-123 preferred, I-131 if unavailable): Baseline, after 5 COJEC courses, pre-BuMel, end of therapy, annually × 3 years",
      "FDG-PET + CT: Alternative where MIBG unavailable (India — limited I-123 MIBG availability)",
      "Urine VMA/HVA (catecholamines): Baseline, post-induction, end of therapy",
      "BAER (hearing): Before each cisplatin course (Course B COJEC) — hearing loss is cumulative",
      "GFR (CrEDTA or Schwartz): Before each carboplatin — recalculate Calvert dose",
      "LFT + coagulation: Daily during BuMel/AutoSCT — monitor for SOS/VOD",
      "ALK mutation: FISH or NGS at diagnosis — actionable target for relapse therapy",
    ],
    pearls: [
      "COJEC proceeds on a 10-day schedule regardless of counts (myelosuppression expected and tolerated) — do NOT delay for low counts",
      "BuMel conditioning: SOS/VOD risk is high — prophylactic ursodeoxycholic acid (Ursofalk) mandatory; defibrotide if VOD develops",
      "Seizure prophylaxis during busulfan: Phenytoin or levetiracetam — continue until 24h after last busulfan dose",
      "Anti-GD2 immunotherapy (dinutuximab beta): Standard of care in Europe/USA; import via compassionate use in India — significantly improves OS in HR-NBL",
      "Lorlatinib (ALK inhibitor): Active in ALK-mutated relapsed NB — enrol in InPOG or international trial if available",
      "Escalation rule: Any MYCN-amplified disease regardless of stage → HR-NBL protocol",
    ],
    india_notes: "HR-NBL-1/SIOPEN used at Tata Memorial, CMC Vellore, AIIMS, PGIMER. AutoSCT (BuMel): available at Tata Memorial, CMC Vellore, AIIMS, Mazumdar Shaw (Bangalore). I-123 MIBG: limited to AIIMS Delhi, Tata Memorial, SGPGI Lucknow — FDG-PET as substitute. Isotretinoin: Accutane/Tretinex available. Anti-GD2: not routinely available — seek InPOG support for compassionate use.",
  },

  "neuroblastoma-lr": {
    title: "Neuroblastoma — Low/Intermediate Risk",
    subtitle: "Protocol: CCLG / SIOPEN LINES (Jan 2015) | INRG L1, L2, M (infants), Ms — MYCN non-amplified",
    color: "bg-amber-600",
    protocols: [
      {
        name: "CCLG / SIOPEN LINES (Jan 2015)",
        steps: [
          "Applies to: INRG stages L1, L2, M (in infants <12–18m), and Ms — where MYCN is non-amplified and risk factors are favourable.",
          "Stage L1 (MYCN non-amplified, no IDRF): Surgery or observation only — NO chemotherapy. Most spontaneously regress in infants.",
          "Stage L2 ≤12–18m (MYCN non-amplified, NCA, no life-threatening symptoms): Observation first — surgery if progresses. Chemo only if symptomatic progression: VP/Carbo × 2 cycles first.",
          "Stage L2 with IDRFs or life-threatening symptoms: VP/Carbo (carboplatin 750 mg/m² d1 + etoposide 150 mg/m²/day d1–3) × 2–6 cycles ± surgery",
          "Stage Ms (metastatic <18m, skin/liver/BM, MYCN neg): Observation if asymptomatic. Hepatomegaly causing respiratory compromise → low-dose chemo (single agent TEM or VP/Carbo × 2–4 cycles)",
          "Intermediate Risk (CADO — cyclophosphamide + doxorubicin + vincristine ± etoposide): Reserved for L2/M stage with unfavourable local features or inadequate VP/Carbo response",
          "Escalation rule: MYCN amplification at any stage → immediately escalate to HR-NBL-1/SIOPEN",
        ]
      },
    ],
    risk_stratification: [
      "INRG L1: Localised, no image-defined risk factors (IDRFs), no MYCN amp — surgery/observation only",
      "INRG L2: Localised with IDRFs (e.g. encasing vessels, invading adjacent structures) but no MYCN amp — chemo ± surgery",
      "INRG M in infants <12–18m: MYCN neg — VP/Carbo ± CADO",
      "INRG Ms (special): <18m, mets to skin/liver/BM only, MYCN neg — high spontaneous regression rate",
      "Escalation: MYCN amplification (any stage) or M-stage disease >12–18 months → HR-NBL-1 protocol",
    ],
    drugs: [
      { name: "Carboplatin (VP/Carbo)", dose: "750 mg/m² IV d1 (or AUC 5–7 if GFR available)", freq: "Per cycle (q21–28d)", toxicity: "Myelosuppression, ototoxicity (BAER if multiple cycles), thrombocytopenia." },
      { name: "Etoposide (VP/Carbo)", dose: "150 mg/m²/day × 3 IV", freq: "Days 1–3 per cycle", toxicity: "Myelosuppression, secondary AML (small risk), mucositis." },
      { name: "CADO (Cyclophosphamide + Doxorubicin + VCR)", dose: "CPM 150 mg/m²/day PO d1–7 + Doxo 35 mg/m² IV d1 + VCR 1.5 mg/m² IV d1", freq: "Per cycle for intermediate risk", toxicity: "Cardiac (doxo), haemorrhagic cystitis (mesna/hydration), neuropathy (VCR)." },
    ],
    monitoring: [
      "USS abdomen: Monthly during watch-and-wait in L1/Ms (infants); pre/post each chemo cycle",
      "MIBG or FDG-PET: Baseline staging (MIBG if available); response after 2 cycles if on chemo",
      "Urine VMA/HVA: Baseline and 3-monthly during observation",
      "CBC: Before each chemo cycle; weekly during induction if CADO used",
      "BAER: Before each carboplatin cycle if multiple courses planned",
      "Liver size (clinical): In Ms — respiratory compromise from hepatomegaly requires urgent chemo",
    ],
    pearls: [
      "LINES philosophy: Most low-risk neuroblastoma in infants regresses spontaneously — avoid over-treatment",
      "Stage Ms (disseminated infantile NB): Despite apparent Stage 4, most regress — chemo only for symptomatic hepatomegaly or respiratory compromise",
      "MYCN amplification changes everything: Even L1/Ms with MYCN amp → immediately route to HR-NBL protocol",
      "IDRFs (image-defined risk factors): Vessel encasement, intraspinal extension, invasion of adjacent structures — define surgical resectability pre-operatively",
      "OMS (opsoclonus-myoclonus syndrome): Often Stage 1–2, MYCN neg, good tumour prognosis — BUT OMS neurological sequelae are severe; treat with ACTH/IVIG regardless of chemo decision",
    ],
    india_notes: "LINES protocol guidance used at Tata Memorial, CMC Vellore, AIIMS. Observation-only for truly low-risk L1 is safe and avoids toxicity — requires experienced multidisciplinary team. VP/Carbo components widely available. CADO: CPM, doxorubicin, VCR all generic/available.",
  },

  "rms-sts": {
    title: "Rhabdomyosarcoma (RMS) & Soft Tissue Sarcoma (STS)",
    subtitle: "Protocol: CWS-guidance / EpSSG (v1.5, 2009) | <21 years — RMS + Non-RMS STS (synovial, Ewing/pPNET, undifferentiated)",
    color: "bg-rose-700",
    protocols: [
      {
        name: "CWS-guidance / EpSSG (v1.5, 2009) [Confidential/institutional reference — verify before use]",
        steps: [
          "Applies to: Patients <21 years with RMS (embryonal, alveolar, pleomorphic) and RMS-like / Non-RMS STS (synovial sarcoma, undifferentiated sarcoma, Ewing/pPNET, epithelioid sarcoma). 8 subgroups (A–H) → 4 risk groups.",
          "Subgroup A — Low Risk (localised, completely resected, embryonal): VA × 4 cycles (vincristine 1.5 mg/m² + actinomycin-D 1.5 mg/m² [max 2 mg] q3w × 4)",
          "Subgroups B–E — Standard Risk (localised, incomplete or node-positive, embryonal): IVA ± VA combinations — Ifosfamide 3 g/m²/day × 3 (with mesna) + VCR + Actino-D + ± Doxorubicin per subgroup",
          "Subgroups F–G — High Risk (metastatic embryonal, localised alveolar): 9 × IVA (ifosfamide + vincristine + actinomycin-D)",
          "Subgroup H — Very High Risk (alveolar with nodal involvement, metastatic alveolar): VAIA III — IFO + VCR + Actino + Idarubicin (alternating with IFO + VCR + Actino × 9 cycles)",
          "Surgery: Aimed at R0 resection at all risk tiers; delayed primary excision (DPE) after 3 cycles neoadjuvant if initially unresectable",
          "Radiotherapy: For all Stage II–III and local residual disease at primary surgery; site/dose dependent (45–50.4 Gy)",
          "Non-RMS STS: Ewing/pPNET → VAIA or VIDE induction; synovial sarcoma → IFO/doxo-based; discuss at specialist sarcoma MDT",
        ]
      },
    ],
    risk_stratification: [
      "Subgroup A (Low Risk): Localised, completely resected (R0), embryonal RMS — VA × 4 only",
      "Subgroups B–D (Standard Risk): Localised, R1/R2, N0; or R0 alveolar — IVA combinations",
      "Subgroup E (Standard Risk +RT): N1 disease, localised, any histology",
      "Subgroups F–G (High Risk): Alveolar + metastatic embryonal — IVA × 9",
      "Subgroup H (Very High Risk): Alveolar histology + regional node involvement or distant mets — VAIA III",
      "Histology: Embryonal (better) vs Alveolar (worse — FOXO1 fusion-positive alveolar especially poor)",
      "FOXO1 fusion (PAX3/PAX7::FOXO1): Alveolar RMS marker — test all RMS at diagnosis; fusion-positive = worse prognosis",
    ],
    drugs: [
      { name: "Vincristine", dose: "1.5 mg/m² IV (max 2 mg)", freq: "Day 1 of each cycle", toxicity: "Peripheral neuropathy, constipation, SIADH." },
      { name: "Actinomycin-D", dose: "1.5 mg/m² IV (max 2 mg/dose)", freq: "Day 1 each cycle (VA/IVA)", toxicity: "Hepatotoxicity, SOS/VOD (with RT overlap), radiation recall, myelosuppression. Vesicant." },
      { name: "Ifosfamide", dose: "3 g/m²/day × 3 IV (with mesna 100% of IFO dose)", freq: "Per IVA cycle", toxicity: "Haemorrhagic cystitis (mesna mandatory), Fanconi syndrome, encephalopathy (methylene blue for IFO encephalopathy), myelosuppression." },
      { name: "Idarubicin (VAIA)", dose: "10 mg/m²/day × 2 IV", freq: "Very High Risk (Subgroup H) cycles", toxicity: "Cardiotoxicity, myelosuppression. Echo required. Vesicant." },
      { name: "Doxorubicin (some STS regimens)", dose: "30–60 mg/m² IV", freq: "Per cycle for non-RMS STS / Ewing", toxicity: "Cardiotoxicity (cumulative limit 300 mg/m²), vesicant." },
    ],
    monitoring: [
      "MRI primary site: Baseline, after 3 cycles (response assessment), pre-surgery, post-surgery, end of therapy",
      "CT chest + bone scan/PET: Staging at diagnosis; response at 3 cycles",
      "CBC before each cycle; LFT + renal function for ifosfamide cycles",
      "Urine dipstick/microscopy: Before each ifosfamide dose — haematuria = reduce or hold; Fanconi screen (phosphate, glucose, bicarb) during IFO-heavy regimens",
      "FOXO1 FISH: At diagnosis on all RMS — subgroup stratification and prognostic marker",
      "Cardiac echo: Baseline + cumulative anthracycline ≥200 mg/m²; end of therapy; 1yr, 5yr",
    ],
    pearls: [
      "CWS/EpSSG source is marked confidential/internal-use — present as institutional reference only; verify current protocol at specialist centre",
      "Alveolar RMS + FOXO1 fusion: Especially poor prognosis — consider intensified protocol or clinical trial",
      "Ifosfamide encephalopathy: Confusion + agitation during/after IFO infusion — stop IFO, give methylene blue 50 mg IV; if recurs, switch to alternative alkylator",
      "Mesna is mandatory with all ifosfamide: Dose = 100% of ifosfamide dose (divided 0, 4, 8h); without mesna → severe haemorrhagic cystitis",
      "Ewing sarcoma/pPNET: Partial overlap with CWS-STS — primarily bone sarcoma protocol (EURO-EWING 99/2012); no dedicated bone protocol yet in this library",
      "Orbital/parameningeal RMS: Radiation starts early (week 9) regardless of response — meningeal invasion risk",
    ],
    india_notes: "CWS/EpSSG protocol used at Tata Memorial, CMC Vellore, AIIMS. FOXO1 FISH: available at Tata Memorial Molecular Pathology, AIIMS. Ifosfamide + mesna widely available. Idarubicin at major centres. RT for primary: requires specialised paediatric sarcoma radiation oncology — refer to tertiary centre.",
  },

  "medulloblastoma": {
    title: "Medulloblastoma",
    subtitle: "Protocol: ESCP / SIOP-E Brain Tumour Group Medulloblastoma | All children; stratified by residual disease, M-stage, molecular subgroup",
    color: "bg-slate-700",
    protocols: [
      {
        name: "ESCP / SIOP-E Medulloblastoma — Standard Risk (SR)",
        steps: [
          "Standard Risk: Residual disease ≤1.5 cm² post-surgery, M0 (no CSF/extraneural mets), age ≥3–4 years",
          "Surgery: Maximal safe resection — aim for gross total resection; posterior fossa (cerebellum/4th ventricle) approach",
          "Craniospinal irradiation (CSI): 23.4 Gy whole-neuraxis + tumour-bed boost to ~54 Gy total; weekly vincristine 1.5 mg/m² IV during RT as radiosensitiser",
          "Maintenance chemotherapy (Regimen A — alternating): Cycle A: Cisplatin 75 mg/m² d1 + CCNU (lomustine) 75 mg/m²/day PO d1 + VCR 1.5 mg/m² d1,8,15; alternating with Cycle B: Cyclophosphamide 1000 mg/m²/day × 2 + VCR 1.5 mg/m² d1,8 — × 4 cycles each (total 8 cycles over 1 year)",
          "Molecular subgroups inform prognosis: WNT (best — consider de-escalation trials), SHH (intermediate/good), non-WNT-non-SHH (Group 3/4 — variable; Group 3 worst)",
        ]
      },
      {
        name: "ESCP / SIOP-E Medulloblastoma — High Risk (HR)",
        steps: [
          "High Risk: Residual disease >1.5 cm² OR M1–M4 (metastatic) OR undifferentiated / large-cell anaplastic (LC/A) histology",
          "CSI: 36 Gy (M1–M3) with tumour-bed boost to 54–55.8 Gy",
          "Intensified maintenance: HD-chemotherapy ± stem cell rescue used at specialist centres",
          "Infant medulloblastoma (<3–4y): Avoid CSI — chemotherapy-only strategy (HIT-SKK, UKCCSG/COG infant protocols); RT deferred or omitted",
        ]
      },
    ],
    risk_stratification: [
      "Standard Risk: Residual ≤1.5 cm², M0, age ≥3–4y — 5yr OS ~85%",
      "High Risk: Residual >1.5 cm², M+ stage, or LC/A histology — 5yr OS ~50–65%",
      "WNT subgroup: ~10% of cases, best prognosis (5yr OS >95%) — de-escalation trials ongoing",
      "SHH subgroup: ~30%, TP53 mutated = poor; PTCH1/SUFU mutated = better; vismodegib trials for relapsed SHH",
      "Group 3 (non-WNT/non-SHH): MYC amplification = very poor; 5yr OS ~50%",
      "Group 4: Largest subgroup; intermediate prognosis; isochromosome 17q common",
    ],
    drugs: [
      { name: "Cisplatin (maintenance)", dose: "75 mg/m² IV d1 over 6h", freq: "Cycle A × 4 alternating cycles", toxicity: "Ototoxicity (BAER before each dose — cumulative irreversible hearing loss), nephrotoxicity (3L/m²/day hyperhydration), neuropathy, Mg wasting." },
      { name: "CCNU / Lomustine", dose: "75 mg/m²/day PO d1", freq: "Cycle A", toxicity: "Delayed myelosuppression (nadir 4–6 weeks after dose — monitor CBC at 4wk and 6wk), hepatotoxicity, pulmonary fibrosis (late), secondary leukaemia." },
      { name: "Cyclophosphamide (Cycle B)", dose: "1000 mg/m²/day × 2 IV", freq: "Cycle B", toxicity: "Haemorrhagic cystitis (mesna), myelosuppression. Mesna mandatory." },
      { name: "Vincristine (RT radiosensitiser + maintenance)", dose: "1.5 mg/m² IV (max 2 mg)", freq: "Weekly during RT; d1,8,15 of each maintenance cycle", toxicity: "Peripheral neuropathy (cumulative — common after RT + chemo); constipation." },
    ],
    monitoring: [
      "MRI brain + spine (whole neuraxis): Baseline (within 24–48h post-surgery for residual assessment), pre-RT, mid-maintenance, end of therapy, then 3-monthly year 1–2, 6-monthly year 3–5",
      "CSF cytology: Baseline (lumbar puncture 2 weeks post-surgery), staging",
      "BAER audiogram: Baseline + before each cisplatin cycle — cumulative ototoxicity can be severe",
      "CBC + LFT: Before each cycle; CCNU — repeat CBC at 4 weeks and 6 weeks (delayed nadir)",
      "Renal (creatinine + Mg): Before each cisplatin cycle",
      "Endocrine evaluation (GH, thyroid, cortisol, FSH/LH): At 1yr post-RT, then annually — CSI causes GH deficiency, hypothyroidism, gonadal dysfunction",
      "Neuropsychological assessment: At 1yr, 3yr, 5yr post-RT — white matter injury and cognitive sequelae",
    ],
    pearls: [
      "WNT medulloblastoma: Best prognosis — de-escalation trials (reduced CSI + chemotherapy) — do NOT over-treat; refer to clinical trial if possible",
      "CCNU delayed nadir: CBC at 4 weeks and 6 weeks post-CCNU (not just pre-cycle) — delayed myelosuppression",
      "Cisplatin ototoxicity: Cumulative — BAER before every cycle; significant hearing loss → switch to carboplatin",
      "Infants (<3–4y): CSI causes devastating neurocognitive sequelae — chemotherapy-only delay strategies used (HIT-SKK); specialist centre essential",
      "GH deficiency after CSI: Universal — growth hormone replacement from 1 year post-RT (once off active treatment) significantly improves outcomes",
      "SHH + TP53 mutation: Very poor prognosis — consider early escalation / clinical trial enrolment",
    ],
    india_notes: "SIOP-E/ESCP medulloblastoma protocol used at Tata Memorial, CMC Vellore, AIIMS, NIMHANS Bangalore. CSI requires linear accelerator (LINAC) — refer to tertiary RT centre. Lomustine (CCNU): available as Lomustine capsules (Cecenu). Cisplatin available generically. Molecular subgrouping (WNT, SHH, Group 3/4): Available at Tata Memorial Molecular Pathology; IHC surrogates (β-catenin, YAP1, SFRP1, KCNMB3) can be used where FISH/gene expression unavailable.",
  },

  "cns-gct": {
    title: "CNS Germ Cell Tumours — Germinoma / NGGCT / Teratoma",
    subtitle: "Protocol: ESCP / SIOP CNS GCT II — comprehensive (2021) | Intracranial GCTs in children",
    color: "bg-emerald-700",
    protocols: [
      {
        name: "SIOP CNS GCT II (2021) — Germinoma",
        steps: [
          "Applies to: Pure germinoma (AFP normal/mildly elevated, β-hCG <200 IU/L) — pineal, suprasellar, bifocal.",
          "Neoadjuvant chemotherapy (PEB or CE): Carboplatin AUC5 + etoposide 100 mg/m²/day × 3 → 2–4 cycles; or ifosfamide 1.8 g/m²/day × 5 + etoposide (IE) × 2 alternating cycles",
          "Radiotherapy (after chemo): Whole ventricular irradiation (WVI) 24 Gy + local tumour-bed boost 16 Gy (total 40 Gy focal); CSI 30 Gy + boost only for metastatic (M+) disease",
          "CSI is NOT standard for non-metastatic germinoma — WVI alone + chemo (combined modality reduces RT dose and toxicity)",
          "5-year OS: ~95% for non-metastatic germinoma with combined modality",
        ]
      },
      {
        name: "SIOP CNS GCT II (2021) — NGGCT (Non-Germinomatous GCT)",
        steps: [
          "Applies to: Elevated AFP (>25 ng/mL or age-adjusted) and/or β-hCG >200 IU/L — yolk sac tumour, embryonal carcinoma, choriocarcinoma, mixed GCT.",
          "Induction: PEI — Cisplatin 20 mg/m²/day × 5 + Etoposide 100 mg/m²/day × 5 + Ifosfamide 1.8 g/m²/day × 5 (with mesna) × 4 courses",
          "High-risk NGGCT (AFP >1000 ng/mL at diagnosis OR age <6y): HD-PEI induction × 3 courses → HD-carboplatin + etoposide + melphalan conditioning → stem cell transplant (AutoSCR) + risk-adapted RT",
          "Standard-risk NGGCT: PEI × 4 → RT (WVI 24 Gy if localised; CSI 30 Gy if M+) + local boost 40–54 Gy",
          "Second-look surgery: After chemotherapy, for residual radiological mass — resect if >1.5 cm² to assess tumour viability; mature teratoma does NOT respond to chemo/RT (surgical resection only)",
        ]
      },
      {
        name: "SIOP CNS GCT II — Teratoma and Relapsed Disease",
        steps: [
          "Mature/immature teratoma: Surgical resection is primary treatment — chemotherapy and RT have minimal effect",
          "Growing teratoma syndrome: Radiologically enlarging mass despite normalising tumour markers — surgery, not more chemo",
          "Relapsed germinoma: Salvage chemo (HD-CE or ICE) → RT if not previously irradiated",
          "Relapsed NGGCT: Discuss with national GCT expert team — salvage options include HD-chemo + AutoSCT, targeted therapy trials",
          "Note: A legacy thin NGGCT-only record exists (archive in admin panel) — the comprehensive SIOP GCT II record above is the current reference",
        ]
      },
    ],
    risk_stratification: [
      "Germinoma (AFP normal/borderline, β-hCG <200): Best prognosis, ~95% OS — de-intensified RT (WVI not CSI)",
      "NGGCT Standard Risk (AFP 25–1000, age ≥6y): PEI × 4 + RT — ~70–80% OS",
      "NGGCT High Risk (AFP >1000 ng/mL OR age <6y): HD-PEI + AutoSCT + RT — ~50–65% OS",
      "M+ disease (CSF+, spinal mets): CSI required regardless of histology; worse prognosis",
      "AFP trajectory: Rising AFP on treatment = progression; normalising AFP after 2 cycles = good response",
    ],
    drugs: [
      { name: "Carboplatin (CE / PEB)", dose: "AUC 5 IV (Calvert formula)", freq: "Per induction cycle", toxicity: "Myelosuppression, ototoxicity (less than cisplatin), thrombocytopenia." },
      { name: "Cisplatin (PEI)", dose: "20 mg/m²/day × 5 IV over 2h", freq: "Days 1–5, per PEI cycle", toxicity: "Nephrotoxicity (3L/m²/day hyperhydration + MgSO4 replacement), ototoxicity (BAER each cycle), neuropathy, hypomagnesaemia." },
      { name: "Etoposide", dose: "100 mg/m²/day × 5 IV", freq: "Days 1–5, per cycle", toxicity: "Myelosuppression, secondary AML, hypotension with rapid infusion, mucositis." },
      { name: "Ifosfamide", dose: "1.8 g/m²/day × 5 IV (with mesna 100%)", freq: "Days 1–5, per PEI cycle", toxicity: "Haemorrhagic cystitis (mesna), Fanconi syndrome, encephalopathy. Fanconi screen (PO4, glucose, bicarb) during therapy." },
    ],
    monitoring: [
      "MRI brain + spine: Baseline, after 2 PEI cycles, after completion of chemo, pre-RT, post-RT, 3-monthly year 1–2",
      "AFP + β-hCG: Before each cycle — trajectory guides response; normalisation is key endpoint",
      "CSF cytology + AFP/hCG (CSF): Baseline LP staging",
      "BAER audiogram: Before each cisplatin cycle",
      "Renal function + Mg: Before each cisplatin/ifosfamide cycle; Fanconi screen during ifosfamide",
      "Endocrine (pituitary axis): Baseline + annually post-RT — hypothalamic/pituitary GCTs cause DI, panhypopituitarism",
      "Ophthalmology: If suprasellar tumour — visual fields, acuity at baseline and after RT",
    ],
    pearls: [
      "β-hCG in pure germinoma: Mildly elevated (<200 IU/L) is acceptable — markedly elevated (>200) raises concern for mixed GCT/choriocarcinoma component",
      "AFP elevation must be age-adjusted: Normal AFP is very high in neonates/infants — use age-specific norms (Abelev table)",
      "Growing teratoma syndrome: Enlarging mass + normalising AFP — this is NOT progression; surgery required, not more chemo",
      "Second-look surgery for residual NGGCT: Residual mass >1.5 cm² after chemo — resect to confirm mature teratoma vs viable tumour",
      "Relapsed NGGCT: Refer to national GCT expert team (Tata Memorial GCT MDT) — salvage HD-chemo + AutoSCT",
      "Legacy NGGCT record (ID 6a29241ceab6b6ffa86fe177): Archive in admin panel — use comprehensive SIOP GCT II record",
    ],
    india_notes: "SIOP CNS GCT II protocol used at Tata Memorial, CMC Vellore, AIIMS JPNA Hospital, NIMHANS. AFP measurement: widely available. Age-adjusted AFP norms essential — printed reference available from GCT II protocol. WVI RT: requires LINAC + immobilisation for paediatric RT. AutoSCT for HR-NGGCT: Tata Memorial BMT unit, CMC Vellore.",
  },

  "osteosarcoma": {
    title: "Osteosarcoma / Bone Sarcoma",
    subtitle: "⚠ Dedicated protocol not yet in library | Ewing sarcoma has partial coverage via CWS/EpSSG STS record",
    color: "bg-stone-600",
    protocols: [
      {
        name: "⚠ Protocol Pending — Interim Reference Notes",
        steps: [
          "Osteosarcoma: No dedicated paediatric bone sarcoma protocol yet in this library. Standard international regimen: MAP (methotrexate + doxorubicin + cisplatin) — COSS/EURAMOS-1 backbone.",
          "Ewing sarcoma / pPNET: Partial overlap via CWS/EpSSG STS record — primary bone protocol is EURO-EWING 99/EE2012 (VIDE induction × 6 → VAC/VAI consolidation ± stem cell rescue for HR).",
          "Refer to AIIMS Orthopaedic Oncology / Tata Memorial Bone Tumour Sarcoma Service for current institutional protocol.",
          "This condition is flagged as a gap in the current protocol library — a dedicated bone sarcoma entry is planned.",
        ]
      },
    ],
    risk_stratification: ["Osteosarcoma: localised vs metastatic; histological response at resection (>90% necrosis = good response)"],
    drugs: [],
    monitoring: ["MRI primary site + CT chest for pulmonary mets; alkaline phosphatase, LDH at baseline"],
    pearls: ["MAP protocol requires HD-MTX 12 g/m² with leucovorin rescue and MTX level monitoring — only at centres with 24h pharmacy and nephrology support"],
    india_notes: "Protocol pending. Contact Tata Memorial Bone Tumour Clinic or AIIMS Orthopaedic Oncology for current protocol.",
  },

  "hepatoblastoma": {
    title: "Hepatoblastoma",
    subtitle: "⚠ Dedicated protocol not yet in library | SIOPEL / PHITT framework as interim reference",
    color: "bg-yellow-700",
    protocols: [
      {
        name: "⚠ Protocol Pending — Interim Reference Notes",
        steps: [
          "Standard framework: SIOPEL-6 / PHITT (Paediatric Hepatic International Tumour Trial) — pre-operative cisplatin-based chemotherapy → liver resection or transplant → post-op chemo.",
          "Standard Risk (PRETEXT I/II, no V/P): SIOPEL-6 standard arm — cisplatin 80 mg/m²/day d1 + doxorubicin 60 mg/m² d2–3 × 4 pre-op cycles.",
          "High Risk (PRETEXT III/IV, V+, P+, M+): SIOPEL-6 high-risk arm — cisplatin + carboplatin + doxorubicin. Liver transplantation for unresectable tumours.",
          "This condition is flagged as a gap in the current protocol library — a dedicated entry is planned.",
          "Refer to Tata Memorial Paediatric Hepatology-Oncology team or AIIMS for institutional protocol.",
        ]
      },
    ],
    risk_stratification: ["PRETEXT (I–IV) + V/P/M/E modifiers determine risk group and resectability"],
    drugs: [],
    monitoring: ["AFP trajectory is primary response marker — rising AFP on treatment = progression; serial MRI liver"],
    pearls: ["AFP must be interpreted with age-adjusted norms in infants; near-normal AFP at diagnosis suggests non-hepatoblastoma diagnosis"],
    india_notes: "Protocol pending. Contact Tata Memorial Paediatric Oncology or AIIMS Paediatric Surgery/Oncology.",
  },

  "lch": {
    title: "Langerhans Cell Histiocytosis (LCH)",
    subtitle: "⚠ Dedicated protocol not yet in library | LCH-IV / Histiocyte Society framework as interim reference",
    color: "bg-lime-700",
    protocols: [
      {
        name: "⚠ Protocol Pending — Interim Reference Notes",
        steps: [
          "LCH-IV (Histiocyte Society 2012): Risk-stratified by extent of disease and 'risk organ' involvement (RO+ = liver, spleen, haematopoietic system).",
          "Single system LCH, non-RO: Curettage ± intralesional steroids (bone); topical steroids/PUVA (skin); surgery ± RT for isolated lymph node.",
          "Multisystem LCH, RO−: First-line — vinblastine 6 mg/m²/wk IV × 7 weeks + prednisolone 40 mg/m²/day d1–5 × 7 weeks; then continuation therapy 12 months.",
          "Multisystem LCH, RO+ (high risk): First-line VBL + Pred × 12 weeks; if poor response → 2nd-line cladribine + cytarabine.",
          "BRAF V600E mutation (present in ~60% LCH): Vemurafenib/dabrafenib for refractory/CNS-risk LCH — available via compassionate use.",
          "This condition is flagged as a gap — a full dedicated LCH protocol entry is planned.",
        ]
      },
    ],
    risk_stratification: ["RO+ (risk organs: liver, spleen, haematopoietic) = High risk; RO− = Low risk; CNS-risk lesions (craniofacial) = intermediate"],
    drugs: [],
    monitoring: ["Serial imaging (PET-CT preferred), CBC, LFT, DI screen (urine osmolality, serum Na) — DI complicates ~25% of CNS-risk LCH"],
    pearls: ["BRAF V600E mutation testing is essential — targeted therapy option for refractory/CNS-NS LCH; test at diagnosis on all LCH"],
    india_notes: "Protocol pending. BRAF testing available at AIIMS, Tata Memorial. Vemurafenib/dabrafenib via compassionate use for refractory BRAF-mutated LCH.",
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

function DrugCard({ drug, index }) {
  const [open, setOpen] = useState(false);

  // Parse toxicity into structured warnings
  const toxicityPoints = drug.toxicity
    ? drug.toxicity.split(/[.;]/).map(s => s.trim()).filter(Boolean)
    : [];

  // Identify high-priority warnings
  const isVesicant = drug.toxicity?.toLowerCase().includes("vesicant");
  const needsEcho = drug.toxicity?.toLowerCase().includes("echo") || drug.toxicity?.toLowerCase().includes("cardio");
  const needsMesna = drug.toxicity?.toLowerCase().includes("mesna");
  const needsHydration = drug.toxicity?.toLowerCase().includes("hydration") || drug.toxicity?.toLowerCase().includes("hyperhydration");
  const needsLeucovo = drug.toxicity?.toLowerCase().includes("leucovorin");

  return (
    <div className="border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Drug header — always visible */}
      <button
        className="w-full flex items-start justify-between px-4 py-3 bg-white text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="w-6 h-6 bg-slate-700 text-white rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">{index + 1}</span>
            <span className="font-bold text-slate-900 text-sm">{drug.name}</span>
            {isVesicant && <Badge className="bg-red-600 text-white text-xs px-1.5 py-0">VESICANT</Badge>}
            {needsEcho && <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0">Echo required</Badge>}
            {needsMesna && <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0">Mesna mandatory</Badge>}
          </div>
          {/* Inline dose summary */}
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 ml-8">
            <span className="text-xs text-blue-700 font-semibold">{drug.dose}</span>
            <span className="text-xs text-slate-500">{drug.freq}</span>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="border-t-2 border-slate-100">
          {/* Ward-style protocol table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-2 font-bold text-slate-500 uppercase tracking-wide bg-slate-50 w-28 align-top">Drug</td>
                  <td className="px-3 py-2 font-bold text-slate-900 align-top">{drug.name}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-2 font-bold text-slate-500 uppercase tracking-wide bg-slate-50 align-top">Dose</td>
                  <td className="px-3 py-2 text-blue-800 font-semibold align-top">{drug.dose}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-2 font-bold text-slate-500 uppercase tracking-wide bg-slate-50 align-top">Schedule</td>
                  <td className="px-3 py-2 text-slate-700 align-top">{drug.freq}</td>
                </tr>
                {/* Mandatory precautions row */}
                {(isVesicant || needsMesna || needsHydration || needsLeucovo) && (
                  <tr className="border-b border-slate-100 bg-red-50">
                    <td className="px-3 py-2 font-bold text-red-700 uppercase tracking-wide align-top">⚠ Precautions</td>
                    <td className="px-3 py-2 align-top">
                      <div className="space-y-1">
                        {isVesicant && <p className="text-red-700 font-semibold">VESICANT — Central venous access preferred. Confirm patency before administration. Extravasation protocol must be available.</p>}
                        {needsMesna && <p className="text-blue-800 font-semibold">MESNA mandatory — dose = 80–100% of ifosfamide/cyclophosphamide dose. Give at 0h, 4h, 8h post-infusion.</p>}
                        {needsHydration && <p className="text-cyan-800 font-semibold">HYPERHYDRATION required — 3000 mL/m²/day. Monitor urine output ≥3 mL/kg/h. Alkalinise urine if MTX-based.</p>}
                        {needsLeucovo && <p className="text-green-800 font-semibold">LEUCOVORIN rescue required — begin 42h from start of MTX infusion. Guided by MTX serum levels at 24h, 48h, 72h.</p>}
                      </div>
                    </td>
                  </tr>
                )}
                {/* Toxicity breakdown */}
                <tr>
                  <td className="px-3 py-2 font-bold text-slate-500 uppercase tracking-wide bg-slate-50 align-top">Toxicities</td>
                  <td className="px-3 py-2 align-top">
                    <ul className="space-y-1">
                      {toxicityPoints.map((t, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-slate-700">
                          <span className="text-orange-500 mt-0.5 flex-shrink-0">▸</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OncologyEngine({ scenario }) {
  const [condition, setCondition] = useState(scenario && scenario !== "all" ? scenario : "");
  const [openSection, setOpenSection] = useState("protocols");

  const data = DATA[condition];

  const groups = [...new Set(CONDITIONS.filter(c => c.group).map(c => c.group))];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-red-300" />
          <h2 className="font-bold text-base">Paediatric Oncology — Learning Pathways</h2>
          <Badge className="bg-red-600 text-white text-xs">BETA</Badge>
        </div>
        <p className="text-xs text-slate-300">Protocols used in Indian hospitals — SIOP · COG · BFM · UKALL · IAP-Oncology</p>
        <p className="text-xs text-slate-400 mt-1">Select a condition to explore protocols, risk stratification, and treatment pathways</p>
      </div>

      {/* Medicolegal disclaimer */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Learning Reference Only:</strong> Protocols shown are for educational purposes. Always verify with institutional protocol and supervising oncologist before clinical use.
          </p>
        </div>
      </div>

      {/* Condition selector — no patient identifiers */}
      {!condition ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Select a condition to explore:</p>
          {groups.map(g => (
            <div key={g}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{g}</p>
              <div className="space-y-1.5">
                {CONDITIONS.filter(c => c.group === g).map(c => (
                  <button key={c.id} onClick={() => { setCondition(c.id); setOpenSection("protocols"); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all text-left text-sm font-medium text-slate-800">
                    {c.label}
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={() => setCondition("")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100">
            <ChevronRight className="w-3 h-3 rotate-180" /> All Conditions
          </button>
          <span className="text-xs text-slate-500">/</span>
          <span className="text-xs font-semibold text-slate-700 truncate">{CONDITIONS.find(c => c.id === condition)?.label}</span>
        </div>
      )}

      {data && condition && (
        <div className="space-y-3">
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
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Pill className="w-4 h-4 text-violet-600" />
                <p className="text-xs font-bold text-slate-700">Drug &amp; Dosing Schedule</p>
                <span className="text-xs text-slate-400 italic">— tap each drug to expand ward-style detail</span>
                <button
                  onClick={() => {
                    const win = window.open('', '_blank');
                    const rows = data.drugs.map((d, i) => `
                      <tr style="page-break-inside:avoid">
                        <td style="padding:6px 10px;border:1px solid #ccc;font-weight:bold;vertical-align:top">${i+1}. ${d.name}</td>
                        <td style="padding:6px 10px;border:1px solid #ccc;font-weight:bold;color:#1a4fa8;vertical-align:top">${d.dose}</td>
                        <td style="padding:6px 10px;border:1px solid #ccc;vertical-align:top">${d.freq}</td>
                        <td style="padding:6px 10px;border:1px solid #ccc;font-size:11px;vertical-align:top">${d.toxicity || '—'}</td>
                      </tr>`).join('');
                    win.document.write(`<!DOCTYPE html><html><head><title>${data.title} — Drug Schedule</title>
                      <style>body{font-family:Arial,sans-serif;font-size:12px;padding:20px;color:#111}
                      h2{font-size:16px;margin-bottom:2px}p.sub{font-size:11px;color:#555;margin:0 0 16px}
                      table{width:100%;border-collapse:collapse}th{background:#1e293b;color:#fff;padding:7px 10px;text-align:left;font-size:12px}
                      tr:nth-child(even){background:#f8f8f8}
                      .disclaimer{margin-top:20px;padding:8px;background:#fffbeb;border:1px solid #f59e0b;font-size:10px;color:#92400e}
                      @media print{button{display:none}}</style></head><body>
                      <h2>${data.title}</h2><p class="sub">${data.subtitle || ''}</p>
                      <table><thead><tr><th>Drug</th><th>Dose</th><th>Schedule / Frequency</th><th>Key Toxicities & Precautions</th></tr></thead>
                      <tbody>${rows}</tbody></table>
                      <div class="disclaimer">⚠ CLINICAL REFERENCE ONLY — All doses must be verified against the active institutional protocol by a paediatric oncologist and pharmacist before prescribing. Not for direct clinical use without specialist supervision.</div>
                      <p style="font-size:10px;color:#999;margin-top:8px">Printed from CliniCals Hub — ${new Date().toLocaleDateString()}</p>
                      <script>window.print()</script></body></html>`);
                    win.document.close();
                  }}
                  className="ml-auto flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                >
                  🖨 Print Protocol Sheet
                </button>
              </div>
              {data.drugs.map((d, i) => <DrugCard key={i} drug={d} index={i} />)}
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
        </div>
      )}
    </div>
  );
}