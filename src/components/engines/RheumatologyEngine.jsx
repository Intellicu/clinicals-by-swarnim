/**
 * Pediatric Rheumatology Diagnostic & Management Engine
 * JIA, SLE, Vasculitis, ANCA-AAV, Periodic Fevers, Myositis, Overlap syndromes
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Shield, ChevronRight, ArrowRight, CheckCircle2, AlertTriangle, BookOpen, ExternalLink, Activity } from "lucide-react";

const CONDITIONS = [
  { id: "jia", label: "JIA — Juvenile Idiopathic Arthritis", color: "blue", desc: "JIA subtypes, ACR criteria, DMARD approach" },
  { id: "sle", label: "SLE / Lupus Nephritis", color: "violet", desc: "EULAR/ACR 2019 criteria, organ involvement, SLE-specific treatment" },
  { id: "anca", label: "ANCA-Associated Vasculitis", color: "red", desc: "GPA · MPA · EGPA — induction and maintenance" },
  { id: "igav", label: "IgA Vasculitis (HSP)", color: "orange", desc: "Henoch-Schönlein Purpura — diagnosis and nephritis monitoring" },
  { id: "pf", label: "Periodic Fever Syndromes", color: "amber", desc: "FMF, TRAPS, CAPS, MKD, PFAPA — autoinflammatory" },
  { id: "jdm", label: "Juvenile Dermatomyositis", color: "pink", desc: "Myositis — muscle, skin, MSA panels, treatment" },
  { id: "poly", label: "Overlap / CTD (MCTD, SSc)", color: "teal", desc: "Mixed CTD, scleroderma, anti-centromere, anti-Scl-70" },
  { id: "kd", label: "Kawasaki Disease", color: "rose", desc: "Classic + incomplete KD, coronary artery aneurysm, IVIG" },
  { id: "macro", label: "Macrophage Activation Syndrome", color: "crimson", desc: "MAS / HLH — 2016 criteria, triggers, cyclosporin" },
];

const RHEUM_DATA = {
  jia: {
    title: "Juvenile Idiopathic Arthritis (JIA)",
    guideline: "ACR JIA 2019 · ILAR 2001 Classification · EULAR 2018",
    links: [
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
      { label: "Drug Database", to: "/DrugsDosing" },
      { label: "Uveitis Screening", to: "/PediatricRheumatology" },
    ],
    diagnosis: [
      "Arthritis in ≥1 joint × ≥6 weeks in child <16 years, with exclusion of other causes",
      "ILAR subtypes: (1) Oligoarticular (<5 joints, 6 months), (2) Polyarticular RF−, (3) Polyarticular RF+, (4) Systemic JIA (sJIA), (5) Psoriatic, (6) Enthesitis-related (ERA), (7) Undifferentiated",
      "sJIA: quotidian fever ≥2 weeks + arthritis + ≥1 of: rash, lymphadenopathy, serositis, hepatosplenomegaly — exclude infections/malignancy",
      "ERA: older males, HLA-B27+, sacroiliac tenderness, enthesitis — precursor to AS",
    ],
    workup: [
      "ANA (positive in 65% oligoarticular JIA — uveitis risk marker)",
      "RF (IgM) + anti-CCP (polyarticular RF+ worst prognosis)",
      "ESR, CRP, CBC, LFTs, ferritin",
      "Ferritin >10,000 ng/mL → MAS screen (fibrinogen, triglycerides, NK cell function)",
      "HLA-B27 (ERA subtype)",
      "X-ray involved joints (baseline); MRI if sacroiliitis suspected",
      "Slit-lamp exam: ANA+ oligoJIA → uveitis every 3–6 months",
    ],
    management: [
      "NSAIDs: first-line all subtypes — naproxen 10–15 mg/kg/day BD or ibuprofen 30–40 mg/kg/day",
      "Intraarticular corticosteroids: triamcinolone hexacetonide — oligoJIA most effective",
      "Methotrexate (MTX): 10–15 mg/m² weekly (po or SC) — mainstay DMARD for polyarticular, ANA+ oligo",
      "Leflunomide: alternative to MTX if intolerant",
      "TNF inhibitors: etanercept (25 mg SC weekly) or adalimumab — MTX-refractory polyarticular/ERA",
      "IL-6 inhibitor (tocilizumab): sJIA with polyarthritis + poor response",
      "IL-1 inhibitor (anakinra/canakinumab): sJIA especially — rapid fever control",
      "JAK inhibitors (baricitinib/tofacitinib): RF+ polyJIA, ERA refractory",
      "Abatacept (CTLA4-Ig): RF+ polyJIA failing biologics",
      "Uveitis: topical steroids → MTX → adalimumab (most evidence for uveitis)",
    ],
    monitoring: [
      "JADAS-27 or JADAS-71 score at each visit (joint count + ESR + physician/patient global)",
      "LFTs every 3 months on MTX; folate supplementation",
      "Drug holiday in remission (usually ≥6 months inactive disease on medication)",
      "MAS: ferritin, CBC, fibrinogen, triglycerides, LDH weekly if sJIA active",
    ],
    color: "blue"
  },
  sle: {
    title: "Systemic Lupus Erythematosus (SLE / LN)",
    guideline: "EULAR/ACR SLE 2019 · ACR LN 2021 · KDIGO LN 2021",
    links: [
      { label: "Lupus Nephritis Pathway", to: "/Hub", scenario: "lupus-nephritis" },
      { label: "GN Engine", to: "/Hub", scenario: "gn-engine" },
      { label: "RPGN Engine", to: "/Hub", scenario: "rpgn-deep-engine" },
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
    ],
    diagnosis: [
      "EULAR/ACR 2019: ≥10 points = SLE (ANA ≥1:80 mandatory entry criterion)",
      "Domains: constitutional (2), haematology (0–4), neuropsychiatric (2–4), mucocutaneous (2–6), serosal (1–6), musculoskeletal (0–6), renal (4–10), antiphospholipid Abs (2), complement proteins (3), highly specific antibodies — anti-dsDNA/anti-Sm (6 each)",
      "Renal involvement: proteinuria >500 mg/24h OR UPCR >0.5 OR active urinary sediment (RBC casts, granular casts)",
      "Biopsy ALL children with LN for ISN/RPS class — critical for induction choice",
    ],
    workup: [
      "ANA (≥1:80 mandatory), anti-dsDNA, anti-Sm, anti-SSA/Ro, anti-SSB/La, anti-ribosomal P, anti-phospholipid panel",
      "C3, C4, CH50 (low = active disease); ANCA (overlap)",
      "CBC (lymphopenia, thrombocytopenia, anaemia), Coombs",
      "Urinalysis + UPCR, 24h urine protein if UPCR equivocal",
      "Renal biopsy: ISN/RPS class I–VI — class III/IV/V + renal biopsy mandatory",
      "Echocardiogram (Libman-Sacks endocarditis, pericarditis), CT chest if pleuritis",
      "Ophthalmology (retinal vasculitis)",
      "SLEDAI-2K at each visit (activity score)",
    ],
    management: [
      "Hydroxychloroquine (HCQ): ALL SLE patients — 5 mg/kg/day (max 400 mg/day); anti-flare, reduces mortality",
      "Prednisolone: 1 mg/kg/day (max 60 mg) initial induction; taper over 3–6 months",
      "Class III/IV LN (proliferative): EUROLUPUS low-dose CYC (500 mg IV × 6 doses) or high-dose CYC (NIH protocol) THEN MMF maintenance",
      "Class V LN (membranous): MMF 1.5–3 g/day + steroids; add voclosporin if proteinuria persists",
      "MMF maintenance: 600 mg/m²/dose BD (1–3 g/day) × 3 years minimum",
      "Azathioprine: alternative maintenance, especially if pregnancy planned",
      "Belimumab (anti-BLyS): SLEDAI >8, serologically active — approved ≥5 years in paediatric SLE",
      "Anifrolumab (anti-IFNaR1): new, approved for adult SLE — paediatric trials ongoing",
      "Rituximab: refractory LN, refractory cytopenias, CNS lupus",
      "APS: hydroxychloroquine + aspirin ± anticoagulation if thrombosis",
      "Nephritis: RAAS blockade (ACEi/ARB) mandatory + BP target <75th percentile",
    ],
    monitoring: [
      "SLEDAI-2K at every visit; BILAG for organ-specific activity",
      "Anti-dsDNA, C3, C4 every 3 months (flare marker)",
      "UPCR monthly during induction, 3-monthly in remission",
      "HCQ eye screening: annual from 5 years of use",
      "Bone density (DXA): steroid-treated patients — annual",
      "Vaccinations: influenza annually, pneumococcal, HPV, avoid live vaccines during immunosuppression",
    ],
    color: "violet"
  },
  anca: {
    title: "ANCA-Associated Vasculitis (GPA · MPA · EGPA)",
    guideline: "ACR/EULAR ANCA Vasculitis 2022 · KDIGO GN 2021",
    links: [
      { label: "ANCA Vasculitis Pathway", to: "/Hub", scenario: "anca-vasculitis" },
      { label: "RPGN Engine", to: "/Hub", scenario: "rpgn-deep-engine" },
      { label: "GN Engine", to: "/Hub", scenario: "gn-engine" },
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
    ],
    diagnosis: [
      "GPA (Wegener): C-ANCA/PR3-ANCA+ — upper/lower respiratory + renal; saddle nose, nasal septal perforation",
      "MPA: P-ANCA/MPO-ANCA+ — predominantly renal ± pulmonary haemorrhage, without upper respiratory",
      "EGPA (Churg-Strauss): MPO-ANCA 40% — asthma + eosinophilia + vasculitis (rare in children)",
      "Paediatric GPA/MPA: renal RPGN + haematuria + proteinuria is most common presentation",
      "Biopsy: pauci-immune crescentic GN on IF (no Ig deposits) — hallmark",
      "BVAS (Birmingham Vasculitis Activity Score) for disease activity",
    ],
    workup: [
      "ANCA (IIF), PR3-ANCA (ELISA), MPO-ANCA (ELISA) — PR3 = GPA, MPO = MPA/EGPA",
      "CBC (eosinophilia in EGPA), CRP, ESR, creatinine",
      "Urinalysis with microscopy (RBC casts, granular casts), UPCR",
      "Chest XR/HRCT (nodules, cavities in GPA; ground glass in DAH)",
      "Sinuses CT (GPA — sinusitis, nasal destruction)",
      "BAL (bronchoalveolar lavage) if DAH suspected: haemosiderin-laden macrophages",
      "Renal biopsy (% crescents = prognostic; pauci-immune IF pattern)",
      "Anti-GBM Ab (double-positive ANCA + anti-GBM = worse outcome)",
    ],
    management: [
      "INDUCTION: Rituximab (RTX) 375 mg/m²/dose weekly × 4 weeks — now FIRST-LINE (equal to CYC, less gonadotoxic)",
      "Alternative induction: IV cyclophosphamide (CYC) 500 mg/m² q2W × 3–6 doses (Euro-Lupus modified)",
      "High-dose steroids: pulse methylprednisolone 500 mg/m² × 3 days THEN prednisolone 1 mg/kg/day",
      "PLEX (plasma exchange): Cr >500 µmol/L OR dialysis-dependent OR DAH — PLEX × 7 sessions (ADVOCATE trial did NOT support routine PLEX — use for DAH/anti-GBM double positive)",
      "MAINTENANCE: RTX 500 mg every 6 months × 2 years (RITAZAREM trial) OR azathioprine 2 mg/kg/day",
      "Avacopan (C5a receptor blocker): steroid-sparing — approved adults, paediatric trials ongoing",
      "Trimethoprim-sulfamethoxazole (TMP-SMX): long-term PJP prophylaxis + reduces GPA relapse risk",
      "Monitor ANCA titres (PR3-ANCA rise = relapse predictor — but not 100%)",
    ],
    monitoring: [
      "BVAS or PVAS (Paediatric Vasculitis Activity Score) every visit",
      "UPCR, eGFR monthly during induction, quarterly thereafter",
      "PR3/MPO-ANCA every 3 months",
      "Immunoglobulins before RTX doses (IgG >5 g/L required)",
      "Annual influenza; pneumococcal vaccination",
      "Bone density, PJP prophylaxis on immunosuppression",
    ],
    color: "red"
  },
  igav: {
    title: "IgA Vasculitis (Henoch-Schönlein Purpura)",
    guideline: "EULAR/PReS 2012 · SHARE 2019",
    links: [
      { label: "HSP/HSPN Pathway", to: "/Hub", scenario: "hspn" },
      { label: "IgA Vasculitis Pathway", to: "/Hub", scenario: "iga-vasculitis" },
      { label: "GN Engine", to: "/Hub", scenario: "gn-engine" },
    ],
    diagnosis: [
      "Mandatory: purpura/petechiae (predominantly lower limbs) OR petechial rash + ≥1 of:",
      "(1) Diffuse abdominal pain; (2) Arthritis/arthralgia; (3) Renal involvement (haematuria/proteinuria); (4) Histopathology: IgA deposits on skin biopsy",
      "Must exclude thrombocytopenic purpura (platelet count normal in IgAV)",
      "Nephritis (HSPN): occurs in 30–50%, usually within 6–8 weeks of onset",
      "HSPN grades: I (haematuria), II (proteinuria <500 mg/day), III (500 mg–nephrotic range), IV (nephrotic), V (nephrotic+nephritic), VI (RPGN pattern)",
    ],
    workup: [
      "CBC (normal platelets, exclude thrombocytopenia), CRP, ESR",
      "Urinalysis weekly for 6 months (catch HSPN)",
      "UPCR if proteinuria detected",
      "IgA level (elevated in ~50%); C3/C4 (usually normal)",
      "ANA, ANCA, anti-GBM (to exclude ANCA vasculitis / lupus)",
      "Skin biopsy (if atypical): IgA dominant perivascular deposits",
      "Renal biopsy: if UPCR >500 mg/g, nephrotic syndrome, RPGN, or declining eGFR",
      "Biopsy — Oxford MEST-C score: M (mesangial), E (endocapillary), S (segmental sclerosis), T (tubular atrophy), C (crescents)",
    ],
    management: [
      "Mild uncomplicated IgAV: supportive — analgesia, hydration, ambulatory care",
      "NSAIDs for arthralgia (avoid if renal involvement or GI bleeding)",
      "Prednisolone: abdominal pain, severe arthritis, orchitis — 1 mg/kg/day × 2 weeks then taper (does NOT prevent HSPN)",
      "HSPN Grade III–V (proteinuria, nephrotic): prednisolone + RAAS blockade (ACEi/ARB)",
      "HSPN Grade IV–VI (nephrotic/RPGN): ACEi + prednisolone + cyclophosphamide or MMF (per crescentic biopsy score)",
      "Pulse steroids for RPGN pattern: methylprednisolone 500 mg/m² × 3 days",
      "PLEX: severe crescentic HSPN with rapidly rising creatinine — adjunct",
    ],
    monitoring: [
      "Urinalysis + BP WEEKLY × 6–8 weeks post-rash (HSPN window)",
      "If proteinuria resolves: monthly × 6 months, then annual for 2 years (delayed nephritis can occur)",
      "Recheck UPCR/eGFR at every clinic visit if HSPN present",
    ],
    color: "orange"
  },
  pf: {
    title: "Periodic Fever Syndromes (Autoinflammatory)",
    guideline: "PRINTO Eurofever 2019 · EULAR Autoinflammatory 2022",
    links: [
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
      { label: "Rare Disease Module", to: "/RareDiseaseModule" },
    ],
    diagnosis: [
      "Key: recurrent episodes of fever + specific pattern — rule out infection, malignancy, JIA/SLE first",
      "FMF (Familial Mediterranean Fever): AR MEFV; 6–96h fever + serositis (peritonitis, pleuritis, arthritis, erysipelas-like rash); Mediterranean origin; responds dramatically to colchicine",
      "TRAPS (TNF receptor-associated periodic syndrome): AD TNFRSF1A; 1–3 week fever episodes, migratory rash (centrifugal), conjunctivitis, myalgia, serositis",
      "CAPS (Cryopyrin-associated periodic syndromes): AD NLRP3; (mild→severe): FCAS → MWS → NOMID/CINCA — cold-induced urticaria, SNHL, papilledema, arthropathy",
      "MKD (Mevalonate Kinase Deficiency/HIDS): AR MVK; 3–7 day episodes with lymphadenopathy, abdominal pain, aphthous ulcers, high IgD",
      "PFAPA (Periodic Fever Aphthous Pharyngitis Adenitis): most common; regular 3–6 week cycle; NOT genetic; responds to single-dose prednisolone during episode; may spontaneously remit",
    ],
    workup: [
      "Fever diary (document: duration, interval, triggers, associated symptoms)",
      "ESR, CRP, SAA during attack AND between attacks (elevated during attack, normalise between = supports periodic fever syndrome)",
      "CBC, ferritin, LFTs, LDH (during attack)",
      "Serum IgD (elevated in MKD >100 IU/mL)",
      "Urine mevalonic acid (elevated in MKD attack)",
      "Genetic panel: MEFV (FMF), TNFRSF1A (TRAPS), NLRP3 (CAPS), MVK (MKD) — Eurofever registry criteria first",
      "Intravenous immunoglobulin trial if PFAPA suspected",
    ],
    management: [
      "FMF: colchicine 0.5–1.5 mg/day (lifelong) — prevents attacks AND AA amyloidosis; IL-1 blocker (anakinra/canakinumab) if refractory",
      "TRAPS: NSAIDs for episodes; etanercept reduces frequency; anakinra for acute attacks; IL-1 blockade for TRAPS with systemic amyloidosis",
      "CAPS: canakinumab (anti-IL-1β) or anakinra — all CAPS subtypes; dramatic response expected within 24–48h",
      "MKD: simvastatin (modest); IL-1 blockade (anakinra/canakinumab) for severe; geranylgeraniol supplements experimental",
      "PFAPA: prednisolone 1 mg/kg single dose at fever onset (aborts episode); tonsillectomy curative in many; colchicine prophylaxis reduces episodes",
    ],
    monitoring: [
      "Amyloidosis screening: urinary albumin annually (FMF, TRAPS, MKD — AA amyloid risk)",
      "Ophthalmology (CAPS: papilledema, retinal changes)",
      "Audiometry (CAPS: SNHL — arrange annually)",
      "ESR/SAA normalisation between attacks (treatment goal — eliminate subclinical inflammation)",
    ],
    color: "amber"
  },
  jdm: {
    title: "Juvenile Dermatomyositis (JDM)",
    guideline: "CARRA JDM Guidelines 2020 · EULAR/PReS 2018",
    links: [
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
      { label: "Drug Database", to: "/DrugsDosing" },
    ],
    diagnosis: [
      "Gottron's papules (pathognomonic): purple papules over MCPJs, PIPs, knees, elbows",
      "Heliotrope rash: periorbital violaceous erythema + oedema",
      "Proximal muscle weakness: difficulty climbing stairs, raising arms, Gowers' sign",
      "EMG: myopathic pattern; MRI: muscle oedema (T2/STIR hyperintensity) — most sensitive",
      "Muscle enzymes: CK, LDH, AST, ALT, aldolase — elevated (CK normal in 20%!)",
      "Myositis-specific autoantibodies (MSA): TIF1γ (cancer risk in adults, chronic course in children), NXP2 (calcinosis risk), MDA5 (anti-MDA5 — rapidly progressive ILD in Asian JDM), Mi-2 (classic dermatomyositis, steroid responsive), SAE, SRP (necrotising myopathy)",
      "Calcinosis: occurs in 30–70% of JDM — calcium deposits in muscles/skin",
    ],
    workup: [
      "CK, LDH, AST, ALT, aldolase",
      "MSA panel (myositis-specific Ab): TIF1γ, NXP2, MDA5, Mi-2, Jo-1, SAE, SRP, HMGCR",
      "ANA, anti-SSA/SSB (overlap)",
      "MRI thigh/shoulder (whole-body STIR for muscle oedema pattern)",
      "EMG (may be omitted if clinical + MRI + serology diagnostic)",
      "Muscle biopsy: only if diagnosis uncertain after MSA + MRI",
      "Echo + PFTs (overlap syndromes, MDA5 — ILD, cardiac involvement)",
      "Swallow assessment (pharyngeal muscle weakness → aspiration risk)",
      "Nailfold capillaroscopy: dilated/bushy capillaries, avascular areas",
    ],
    management: [
      "Pulse methylprednisolone 30 mg/kg (max 1g) × 3 days THEN prednisolone 2 mg/kg/day (max 60 mg)",
      "Methotrexate 10–15 mg/m²/week SC — first-line steroid-sparing agent",
      "IVIG 2 g/kg monthly: rapid improvement, skin, weakness — adjunct or steroid-sparing",
      "Hydroxychloroquine: skin-predominant JDM, steroid reduction",
      "Cyclosporin A: refractory disease, calcinosis",
      "MMF: skin, mild muscle; overlap with ILD",
      "Rituximab: refractory JDM, anti-MDA5 (ILD), anti-SRP (necrotising myopathy)",
      "Calcinosis: diltiazem, probenecid, IVIG + rituximab (limited evidence); surgical excision for limited large deposits",
      "Physiotherapy: crucial from diagnosis — graded exercise as tolerated",
    ],
    monitoring: [
      "CK, LDH, AST every 4–8 weeks during induction",
      "CMAS (Childhood Myositis Assessment Scale) at each visit",
      "MRI for inactive disease confirmation before steroid taper",
      "PFTs annually if MSA+ or any respiratory symptoms (MDA5 — high ILD risk)",
      "Bone density (DXA) — high-dose prolonged steroids",
      "Ophthamology for HCQ (annual after 5 years) and calcinosis (periorbital)",
    ],
    color: "pink"
  },
  poly: {
    title: "Overlap CTD — MCTD · Scleroderma",
    guideline: "EULAR SSc 2017 · ACR MCTD · PReS Scleroderma",
    links: [
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
    ],
    diagnosis: [
      "MCTD (Mixed CTD): high-titre anti-U1-RNP + features of SLE + PM/DM + SSc; Raynaud's phenomenon universal",
      "Juvenile SSc (Scleroderma): skin thickening (sclerodactyly/puffy fingers) ± internal organ involvement",
      "Limited SSc (lcSSc): skin limited to hands/face; anti-centromere Ab; CREST features (Calcinosis, Raynaud, Esophageal dysmotility, Sclerodactyly, Telangiectasia)",
      "Diffuse SSc (dcSSc): truncal skin involvement; anti-Scl-70/anti-topoisomerase-I; ILD + PAH + renal crisis risk",
      "Scleroderma renal crisis (SRC): abrupt HTN + AKI — ACEi is treatment of choice (NOT contraindicated)",
    ],
    workup: [
      "ANA (high titre), anti-U1-RNP (MCTD), anti-Scl-70/anti-topoisomerase-I (dcSSc ILD), anti-centromere (lcSSc)",
      "Anti-RNA polymerase III (renal crisis risk in SSc — scleroderma renal crisis)",
      "CBC, creatinine, UPCR (renal crisis monitoring)",
      "PFTs + HRCT chest (ILD detection — ground glass → fibrosis)",
      "Echo (PAH screening: RVSP >40 mmHg → RHC for confirmation)",
      "Echocardiogram every 2 years in SSc",
      "Nailfold capillaroscopy (SSc pattern: loss of capillaries, giant loops, haemorrhages)",
      "Modified Rodnan Skin Score (mRSS) at each visit",
    ],
    management: [
      "Raynaud: CCB (nifedipine XL 0.25–0.5 mg/kg/day) first-line; IV iloprost for severe digital ischaemia",
      "ILD: mycophenolate mofetil (MMF) first-line (SENSCIS trial); nintedanib (antifibrotic, approved ≥18y); cyclophosphamide alternative",
      "PAH: endothelin antagonist (bosentan/macitentan) + PDE5i (sildenafil) if PAH confirmed",
      "GI dysmotility: proton pump inhibitor (esophageal disease), prokinetics (gastric emptying), octreotide (diarrhoea from SIBO)",
      "Scleroderma renal crisis: ACEi URGENTLY (captopril, enalapril — do not avoid) ± dialysis if renal failure",
      "MCTD: hydroxychloroquine for SLE features; MTX or MMF for overlap myositis; steroids cautiously (SSc renal crisis trigger at high doses)",
      "Calcinosis: as per JDM section",
    ],
    monitoring: [
      "PFTs every 6–12 months (ILD surveillance)",
      "Echo annually (PAH screening)",
      "Creatinine + BP monthly (SSc renal crisis vigilance — especially RNA Pol III+)",
      "mRSS every visit (disease progression skin score)",
      "Nailfold capillaroscopy annually",
    ],
    color: "teal"
  },
  kd: {
    title: "Kawasaki Disease",
    guideline: "AHA KD 2017 · JCS 2020 · AAP 2021",
    links: [
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
      { label: "Drug Database", to: "/DrugsDosing" },
    ],
    diagnosis: [
      "Classic KD: fever ≥5 days + ≥4 of 5: (1) bilateral non-exudative conjunctival injection; (2) oral changes (strawberry tongue, red cracked lips, pharyngeal erythema); (3) rash (polymorphous, mainly trunk); (4) extremity changes (erythema/oedema hands-feet → periungual desquamation); (5) cervical lymphadenopathy (≥1.5 cm, unilateral)",
      "Incomplete KD: fever ≥5 days + 2–3 features + echo showing coronary artery Z-score ≥2.5 OR CRP ≥3 + ALT elevated + platelets ≥450,000 + anaemia + albumin <3 g/dL + urine ≥10 WBC/hpf",
      "Coronary artery aneurysm (CAA): Z-score ≥2.5 = dilated; ≥10 mm = giant aneurysm — worst prognosis",
      "KD shock syndrome (KDSS): systolic hypotension requiring fluid/vasopressors — consider IVIG resistance",
    ],
    workup: [
      "CBC (thrombocytosis after day 7 — diagnostic but late), CRP, ESR, ferritin, ALT, albumin",
      "Urinalysis (sterile pyuria typical)",
      "Echo at diagnosis, 2 weeks, 6 weeks (coronary artery Z-scores)",
      "BNP/NT-proBNP (myocarditis)",
      "Blood culture (exclude bacterial mimics)",
      "Coronary CT angiography: giant aneurysms, stenosis assessment in older children",
    ],
    management: [
      "IVIG 2 g/kg single infusion over 10–12 hours — within 10 days of fever onset (reduces CAA from 25% to <5%)",
      "Aspirin 30–50 mg/kg/day (anti-inflammatory dose) UNTIL AFEBRILE × 48h THEN 3–5 mg/kg/day (antiplatelet) for 6–8 weeks",
      "IVIG resistance (fever persists/recurs >36h after IVIG): 2nd IVIG dose (2 g/kg) OR infliximab (5 mg/kg single dose)",
      "Methylprednisolone (30 mg/kg × 3 days): for IVIG resistance, KDSS, predicted IVIG non-response",
      "Giant aneurysms (Z>10): low-molecular-weight heparin + warfarin (INR 2–2.5) + aspirin — anticoagulation to prevent thrombosis",
      "Anakinra: IVIG-refractory cases, especially with MAS features",
    ],
    monitoring: [
      "Echo: diagnosis → 2 weeks → 6 weeks; if CAA: every 3–6 months long-term",
      "Aspirin: until echo confirms no CAA at 6 weeks (if no CAA — stop aspirin); giant CAA → lifelong anticoagulation",
      "Exercise restriction: Z-score ≥4 — avoid contact sports until cardiologist review",
      "Varicella + influenza vaccination: avoid live vaccines within 11 months of IVIG",
    ],
    color: "rose"
  },
  macro: {
    title: "Macrophage Activation Syndrome (MAS / sHLH)",
    guideline: "ACR/EULAR MAS 2016 · HLH-2004 · CARRA",
    links: [
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
      { label: "Drug Database", to: "/DrugsDosing" },
    ],
    diagnosis: [
      "2016 MAS-in-sJIA criteria: fever + ferritin >684 ng/mL + ≥2 of: platelets <181×10⁹/L, AST >48 IU/L, triglycerides >156 mg/dL, fibrinogen <360 mg/dL",
      "HLH 2004 diagnostic criteria (5/8): fever, splenomegaly, cytopenia ≥2 lineages, hypertriglyceridaemia/hypofibrinogenaemia, haemophagocytosis on BM/LN/spleen, low/absent NK cell activity, ferritin ≥500 µg/L, elevated soluble CD25 (sIL-2R)",
      "Triggers: viral infection (EBV most common), malignancy, drugs, rheumatic disease flare",
      "Distinguish primary HLH (genetic: PRF1, UNC13D, STX11, STXBP2 mutations — early-onset) from reactive sHLH/MAS",
    ],
    workup: [
      "CBC (pancytopenia — falling counts hallmark), CRP, ESR, ferritin (>10,000 ng/mL = high specificity for MAS)",
      "LFTs, triglycerides, fibrinogen (low), LDH, coagulation screen",
      "Soluble CD25 (sIL-2R): >2400 U/mL supports HLH",
      "NK cell activity (functional assay)",
      "Bone marrow aspirate: haemophagocytosis (not always present early)",
      "EBV, CMV, HSV, parvovirus B19 PCR (triggers)",
      "Genetic panel (primary HLH): PRF1, UNC13D, STX11, STXBP2",
      "Echocardiogram (myocardial depression)",
    ],
    management: [
      "TREAT URGENTLY: escalate to ICU if organ failure, coagulopathy, encephalopathy",
      "Treat underlying rheumatic trigger: IV methylprednisolone 30 mg/kg/day × 3 days",
      "Cyclosporin A 3–5 mg/kg/day IV (MAS/sJIA first-line after steroids)",
      "IL-1 blockade: anakinra 2–10 mg/kg/day SC — for sJIA-MAS — often dramatic response",
      "Emapalumab (anti-IFNγ): approved for primary/refractory HLH in USA — reduces hyperinflammatory cytokine storm",
      "Etoposide (HLH-2004 protocol): primary HLH, refractory sHLH — 150 mg/m² IV × 2/week",
      "IVIG: adjunct, empirical for viral trigger",
      "Dexamethasone (0.1–0.6 mg/kg/day) for CNS HLH penetration",
      "Haematopoietic stem cell transplant (HSCT): primary HLH or refractory MAS after control",
    ],
    monitoring: [
      "Ferritin daily/every 2 days (treatment response — falling ferritin = responding)",
      "CBC, coagulation, LFTs, triglycerides every 2–3 days during acute phase",
      "CNS: daily neuro assessment; MRI brain if encephalopathy",
      "Cyclosporin levels (target 150–200 ng/mL)",
    ],
    color: "crimson"
  }
};

const COLOR_MAP = {
  blue: { header: "from-blue-700 to-indigo-700", border: "border-blue-300 bg-blue-50", badge: "bg-blue-600", text: "text-blue-900" },
  violet: { header: "from-violet-700 to-purple-700", border: "border-violet-300 bg-violet-50", badge: "bg-violet-600", text: "text-violet-900" },
  red: { header: "from-red-700 to-rose-700", border: "border-red-300 bg-red-50", badge: "bg-red-600", text: "text-red-900" },
  orange: { header: "from-orange-600 to-amber-600", border: "border-orange-300 bg-orange-50", badge: "bg-orange-500", text: "text-orange-900" },
  amber: { header: "from-amber-600 to-yellow-600", border: "border-amber-300 bg-amber-50", badge: "bg-amber-600", text: "text-amber-900" },
  pink: { header: "from-pink-600 to-rose-600", border: "border-pink-300 bg-pink-50", badge: "bg-pink-600", text: "text-pink-900" },
  teal: { header: "from-teal-700 to-cyan-600", border: "border-teal-300 bg-teal-50", badge: "bg-teal-600", text: "text-teal-900" },
  rose: { header: "from-rose-600 to-pink-600", border: "border-rose-300 bg-rose-50", badge: "bg-rose-500", text: "text-rose-900" },
  crimson: { header: "from-red-800 to-rose-800", border: "border-red-300 bg-red-50", badge: "bg-red-800", text: "text-red-900" },
  green: { header: "from-green-700 to-teal-600", border: "border-green-300 bg-green-50", badge: "bg-green-600", text: "text-green-900" },
};

function InfoSection({ title, items, icon: Icon, colorClass }) {
  return (
    <div className={`rounded-xl border-2 p-3 ${colorClass}`}>
      <p className="text-xs font-bold mb-2 text-slate-800">{title}</p>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-800">
            <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-500" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RheumatologyEngine() {
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("diagnosis");
  const data = selected ? RHEUM_DATA[selected] : null;
  const cond = selected ? CONDITIONS.find(c => c.id === selected) : null;
  const colors = cond ? (COLOR_MAP[cond.color] || COLOR_MAP.blue) : COLOR_MAP.blue;

  const TABS = ["diagnosis", "workup", "management", "monitoring"];
  const TAB_LABEL = { diagnosis: "🔍 Diagnosis", workup: "🔬 Workup", management: "💊 Management", monitoring: "📊 Monitoring" };

  const tabData = data ? {
    diagnosis: data.diagnosis,
    workup: data.workup,
    management: data.management,
    monitoring: data.monitoring,
  } : {};

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-violet-700 to-indigo-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Pediatric Rheumatology Diagnostic Engine</h3>
            <p className="text-xs text-violet-200">JIA · SLE · AAV · HSP · Autoinflammatory · JDM · KD · MAS</p>
          </div>
        </div>
      </div>

      {/* Condition selector */}
      {!selected && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">Select Condition:</p>
          {CONDITIONS.map(c => {
            const col = COLOR_MAP[c.color] || COLOR_MAP.blue;
            return (
              <button key={c.id} onClick={() => { setSelected(c.id); setActiveTab("diagnosis"); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-violet-400 hover:bg-violet-50 text-left transition-all">
                <div>
                  <Badge className={`text-xs ${col.badge} text-white`}>{c.label}</Badge>
                  <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {/* Detail view */}
      {selected && data && (
        <div className="space-y-3">
          {/* Title bar */}
          <div className={`rounded-xl bg-gradient-to-r ${colors.header} p-3 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">{data.title}</p>
                <p className="text-xs opacity-80">{data.guideline}</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg">
                ← Back
              </button>
            </div>
          </div>

          {/* Linked resources */}
          {data.links?.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Linked Pathways, Engines & Guidelines</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.links.map((l, i) => (
                  <Link key={i} to={l.to || "/Hub"}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                    <ExternalLink className="w-3 h-3 text-violet-500" />
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${activeTab === tab ? "bg-violet-700 text-white border-violet-700" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}>
                {TAB_LABEL[tab]}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tabData[activeTab] && (
            <InfoSection
              title={TAB_LABEL[activeTab]}
              items={tabData[activeTab]}
              colorClass={
                activeTab === "diagnosis" ? "border-blue-200 bg-blue-50" :
                activeTab === "workup" ? "border-violet-200 bg-violet-50" :
                activeTab === "management" ? "border-green-200 bg-green-50" :
                "border-amber-200 bg-amber-50"
              }
            />
          )}

          {/* Drug calculator link */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-xs font-bold text-slate-700 mb-2">🔗 Quick Links</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/DrugsDosing" className="text-xs text-violet-700 underline">Drug Database</Link>
              <Link to="/PediatricRheumatology" className="text-xs text-violet-700 underline">Rheumatology Hub</Link>
              <Link to="/GuidelinesLibrary" className="text-xs text-violet-700 underline">Guidelines Library</Link>
              <Link to="/DifferentialEngine" className="text-xs text-violet-700 underline">Differential Engine</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}