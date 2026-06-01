import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Shield, ChevronRight, RotateCcw, AlertTriangle, CheckCircle2, BookOpen, ExternalLink, Zap, FlaskConical } from "lucide-react";

const CONDITIONS = [
  { id: "jia", label: "JIA — Juvenile Idiopathic Arthritis", color: "blue", desc: "Classification · Subtypes · DMARDs · Biologics" },
  { id: "sle", label: "SLE — Systemic Lupus Erythematosus", color: "violet", desc: "ACR/EULAR criteria · SLEDAI · Organ involvement · Treatment" },
  { id: "anca", label: "ANCA-Associated Vasculitis (GPA/MPA/EGPA)", color: "red", desc: "Classification · Induction · Rituximab vs CYC · Renal involvement" },
  { id: "periodic", label: "Periodic Fever Syndromes (Autoinflammatory)", color: "orange", desc: "FMF · PFAPA · CAPS · TRAPS · MKD — fever pattern diagnosis" },
  { id: "kawasaki", label: "Kawasaki Disease", color: "rose", desc: "Diagnosis criteria · IVIG · Coronary artery risk stratification" },
  { id: "hsv", label: "IgA Vasculitis (HSP)", color: "amber", desc: "Skin/joints/gut/kidney triad · Nephritis management" },
  { id: "jdm", label: "Juvenile Dermatomyositis (JDM)", color: "teal", desc: "Gottron · Heliotrope · CK · Myositis-specific Ab · Treatment" },
  { id: "mctd", label: "Mixed CTD / Overlap Syndromes", color: "purple", desc: "Undifferentiated CTD · MCTD · SSc overlap · Anti-U1RNP" },
  { id: "septic-arthritis", label: "Septic vs Inflammatory Arthritis", color: "red", desc: "Emergency differentiation · Kocher criteria · Drainage" },
];

const COLOR_MAP = {
  blue: "from-blue-700 to-indigo-700",
  violet: "from-violet-700 to-purple-700",
  red: "from-red-700 to-rose-700",
  orange: "from-orange-600 to-amber-600",
  rose: "from-rose-600 to-pink-600",
  amber: "from-amber-600 to-orange-600",
  teal: "from-teal-700 to-cyan-700",
  purple: "from-purple-700 to-violet-700",
};

const DATA = {
  jia: {
    title: "Juvenile Idiopathic Arthritis (JIA)",
    subtitle: "ILAR Classification 2001 · ACR Peds 2022",
    intro: "JIA: arthritis ≥1 joint for ≥6 weeks in child <16 years with no identifiable cause. Umbrella of 7 subtypes with distinct genetics, serology, and treatment.",
    tabs: [
      {
        label: "Subtypes",
        content: [
          { h: "Oligoarticular JIA (≤4 joints, ANA+)", b: "Most common. F > M. ANA+ → uveitis risk (slit-lamp every 3 months!). Rarely progresses to systemic disease. Target: NSAID → intraarticular steroid → MTX if extended." },
          { h: "Polyarticular RF+ JIA (≥5 joints, RF+)", b: "Mimics adult RA. Erosive, destructive. F > M, adolescents. RF+ twice 3 months apart. Target: MTX early + consider biologics if inadequate response." },
          { h: "Polyarticular RF− JIA (≥5 joints, RF−)", b: "Heterogeneous group. Often ANA+. Some overlap with systemic features. Treatment: NSAIDs → MTX → TNFi (etanercept, adalimumab)." },
          { h: "Systemic JIA (sJIA) — Still's Disease", b: "Quotidian fever (daily spike ≥39°C), salmon-coloured rash during fever, arthritis, lymphadenopathy, serositis. IL-1/IL-6 driven. Check ferritin (>10,000 → MAS risk). Treatment: IL-1 blocker (anakinra/canakinumab) or IL-6 blocker (tocilizumab). Steroids bridge." },
          { h: "Psoriatic JIA", b: "Arthritis + psoriasis (or ≥2: dactylitis, nail pitting, first-degree relative with psoriasis). Often asymmetric. Dactylitis hallmark. NSAIDs + MTX + TNFi for refractory." },
          { h: "Enthesitis-Related JIA (ERA)", b: "M > F, HLA-B27+. Peripheral arthritis + enthesitis. Axial disease develops later (juvenile SpA). Sacroiliac involvement. NSAIDs → TNFi (risk of anterior uveitis — HLA-B27 associated)." },
          { h: "Undifferentiated JIA", b: "Does not fit any category OR fits ≥2 categories. Requires careful monitoring and individualised treatment." },
        ]
      },
      {
        label: "Diagnosis",
        content: [
          { h: "Key Diagnostic Criteria", b: "Age <16y · Arthritis (swelling OR 2 of: warmth, limited ROM, tenderness, pain on movement) · Duration ≥6 weeks · Exclude other causes." },
          { h: "Investigations", b: "CBC, ESR, CRP (may be normal in oligo); RF (×2, 3 months apart); ANA (uveitis risk); HLA-B27 (ERA); Ferritin (sJIA/MAS); Echo (sJIA); Slit-lamp (all JIA, especially ANA+)." },
          { h: "Differentials to Exclude", b: "Reactive arthritis (post-strep, post-viral) · Septic arthritis (emergency — fever + acute single joint) · Leukaemia (night pain, bone pain, low WBC) · Lyme arthritis · IBD arthropathy · SLE · viral arthritis (Parvovirus, Chikungunya)" },
          { h: "MAS (Macrophage Activation Syndrome)", b: "EMERGENCY complication of sJIA. Sustained fever + falling ESR (unusual) + rising ferritin (>500 rapidly, >10,000 diagnostic) + cytopenias + elevated LFT + coagulopathy. Treat: high-dose IV steroids + cyclosporin + anakinra." },
        ]
      },
      {
        label: "Treatment",
        content: [
          { h: "Step 1: NSAIDs", b: "Naproxen 10–15 mg/kg/day BD or Ibuprofen 30–40 mg/kg/day TID. Use for 4–6 weeks as monotherapy for mild oligo." },
          { h: "Step 2: Intraarticular Steroids", b: "Triamcinolone acetonide: large joints 1 mg/kg (max 40 mg); small joints 0.5 mg/kg (max 20 mg). Effect: 3–24 months. Preferred in oligoarthritis." },
          { h: "Step 3: DMARDs", b: "Methotrexate (MTX): 10–15 mg/m²/week oral or SC. Add folic acid. Hydroxychloroquine: 5–6.5 mg/kg/day (max 400 mg). Sulfasalazine (ERA, psoriatic). Monitor LFT." },
          { h: "Step 4: Biologics", b: "TNFi: Etanercept (0.8 mg/kg/week SC, max 50 mg) · Adalimumab (20–40 mg Q2W SC). IL-1: Anakinra (1–2 mg/kg/day SC) · Canakinumab (4 mg/kg Q4W SC) — for sJIA. IL-6: Tocilizumab (8–12 mg/kg IV Q2W) — sJIA and polyJIA." },
          { h: "Uveitis Management", b: "Slit-lamp every 3 months (ANA+ oligo) · Topical steroids + mydriatics · Oral MTX for chronic uveitis · Adalimumab for MTX-refractory uveitis." },
        ]
      },
    ],
    links: [
      { label: "IgA Vasculitis (HSP) Pathway", to: "/ClinicalSupport?scenario=iga-vasculitis" },
      { label: "ANCA Vasculitis Pathway", to: "/ClinicalSupport?scenario=anca-vasculitis" },
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
      { label: "Guidelines Library", to: "/GuidelinesLibrary" },
    ],
  },

  sle: {
    title: "Systemic Lupus Erythematosus (SLE)",
    subtitle: "EULAR/ACR 2019 Classification · SLEDAI-2K · SLICC",
    intro: "Multisystem autoimmune disease. Diagnosis: ≥1 clinical domain + ANA ≥1:80 + cumulative score ≥10 (EULAR/ACR 2019). Renal involvement in 50–80% pSLE.",
    tabs: [
      {
        label: "Diagnosis",
        content: [
          { h: "EULAR/ACR 2019 Entry Criterion", b: "ANA ≥1:80 (HEp-2 or equivalent) — if negative, SLE diagnosis very unlikely. Then score clinical + immunological domains." },
          { h: "Clinical Domains (selected key)", b: "Constitutional (fever ≠ infection: +2) · Haematological (AIHA, leucopenia <4000, lymphopenia <1000, thrombocytopenia <100k) · Neuropsychiatric (seizures, psychosis, mononeuritis multiplex) · Mucocutaneous (acute cutaneous lupus/malar rash +6, discoid +4, oral ulcers, non-scarring alopecia) · Serosal (pleuritis, pericarditis) · Musculoskeletal (synovitis ≥2 joints) · Renal (proteinuria >0.5g/g UPCR, biopsy-proven LN)." },
          { h: "Immunological Domains", b: "Anti-dsDNA ≥2× lab normal (+6) · Anti-Sm (+6) · Anti-phospholipid Ab (anti-cardiolipin, anti-β2GP1, lupus anticoagulant) · Low C3 or C4 (+3 each) · Direct Coombs." },
          { h: "Lupus Nephritis — ISN/RPS Class", b: "Class I/II: Mesangial — mild; treat underlying SLE only. Class III/IV: Focal/Diffuse proliferative — HIGH risk; induction required (MMF + steroids). Class V: Membranous — proteinuria ± combined III/IV. Class VI: Sclerosing — ESRD pathway." },
          { h: "SLEDAI-2K", b: "Disease activity score. Mild: 1–4, Moderate: 5–12, Severe: >12. Monitor monthly during active disease, 3-monthly in remission." },
        ]
      },
      {
        label: "Management",
        content: [
          { h: "ALL SLE: Hydroxychloroquine (HCQ)", b: "5 mg/kg/day (max 400 mg). Reduces flares, damage accrual, mortality. Continue even in remission. Monitor annual slit-lamp (retinal toxicity, rare)." },
          { h: "Mild SLE", b: "NSAIDs (short-term for joint/serositis) + HCQ. Low-dose prednisolone if needed." },
          { h: "Moderate SLE", b: "HCQ + prednisolone 0.5 mg/kg/day + add DMARD: Azathioprine (1–3 mg/kg/day) or MMF (600 mg/m²/dose BD)." },
          { h: "Severe / Renal LN (Class III/IV)", b: "Induction: Pulse MP (30 mg/kg, max 1g × 3 days) → Prednisolone 1–2 mg/kg/day + MMF (600 mg/m²/dose BD) OR NIH-CYC (750 mg/m² IV monthly × 6). Maintenance: MMF + low-dose steroid + HCQ." },
          { h: "Refractory / Severe SLE", b: "Belimumab (BLyS inhibitor) · Rituximab (anti-CD20: 375 mg/m² × 4 doses or 2 × 1000 mg) for refractory LN or haematological SLE. Calcineurin inhibitors (tacrolimus/cyclosporin) for membranous LN." },
          { h: "Monitoring", b: "CBC, renal panel, urine UPCR monthly (active) → 3-monthly (stable). Anti-dsDNA + C3/C4 every 3 months. BP (HCQ + steroid). Bone health (Vit D + Ca with steroids). Eye exam annually." },
        ]
      },
      {
        label: "Emergency",
        content: [
          { h: "Lupus Crisis / Severe Flare", b: "IV methylprednisolone 500–1000 mg (30 mg/kg, max 1g) × 3 days. Assess for infection before steroids. Sepsis mimics lupus flare." },
          { h: "Antiphospholipid Syndrome (APS)", b: "Thrombosis + positive APLA (×2, 12 weeks apart). Arterial/venous thrombosis → anticoagulation (warfarin, INR 2–3). Catastrophic APS: PLEX + heparin + steroids." },
          { h: "Macrophage Activation Syndrome (MAS)", b: "Sustained fever + ferritin >500 (rapidly rising) + cytopenias + coagulopathy. Treat with high-dose steroids + cyclosporin. Overlap with HLH." },
          { h: "CNS Lupus", b: "Seizures, psychosis, transverse myelitis, stroke. Pulse steroids. Rule out APLA (need anticoagulation). EEG, MRI brain." },
        ]
      },
    ],
    links: [
      { label: "Lupus Nephritis Pathway", to: "/ClinicalSupport?scenario=lupus-nephritis" },
      { label: "ANCA Vasculitis Pathway", to: "/ClinicalSupport?scenario=anca-vasculitis" },
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
      { label: "Plasmapheresis Module", to: "/ProcedureHub" },
      { label: "Guidelines Library", to: "/GuidelinesLibrary" },
    ],
  },

  anca: {
    title: "ANCA-Associated Vasculitis (AAV)",
    subtitle: "GPA · MPA · EGPA · EULAR 2022 · ACR/EULAR 2022",
    intro: "Small-vessel vasculitis affecting kidneys, lungs, ENT, nerves. GPA: granulomatous (upper + lower airway + kidney). MPA: microscopic (kidney + lung). EGPA: eosinophilic + asthma.",
    tabs: [
      {
        label: "Diagnosis",
        content: [
          { h: "ANCA Serology", b: "cANCA (anti-PR3): mainly GPA. pANCA (anti-MPO): mainly MPA and EGPA. ANCA-negative AAV: 10–20% (biopsy essential)." },
          { h: "GPA Features", b: "Saddle-nose deformity, chronic sinusitis, otitis, subglottic stenosis (ENT). Haemoptysis, nodules, cavities (lung). Pauci-immune GN (kidney). Scleritis." },
          { h: "MPA Features", b: "Rapidly progressive GN (most common cause of RPGN + ANCA). Pulmonary haemorrhage (DAH). No granulomas. No significant ENT disease." },
          { h: "EGPA Features", b: "Asthma (precedes vasculitis by years) + eosinophilia (>1.5 × 10⁹/L) + small-vessel vasculitis. Cardiac involvement (major cause of death). pANCA/MPO+." },
          { h: "Key Investigations", b: "ANCA (cANCA/pANCA + anti-PR3/MPO by ELISA). Renal biopsy: pauci-immune RPGN (no/scant immune deposits). Urinalysis (haematuria + RBC casts). CXR/HRCT (nodules, cavities, infiltrates). ENT evaluation (GPA). Nerve conduction (mononeuritis multiplex)." },
          { h: "BVAS (Birmingham Vasculitis Activity Score)", b: "Quantifies disease activity across 9 organ systems. Used to guide treatment intensity." },
        ]
      },
      {
        label: "Treatment",
        content: [
          { h: "Induction — Severe (organ-threatening / RPGN / DAH)", b: "IV Methylprednisolone 500–1000 mg × 3 days → Prednisolone 1 mg/kg/day (max 80 mg). PLUS: Rituximab 375 mg/m² × 4 weekly (PREFERRED) OR CYC IV 15 mg/kg Q2–3W × 6 pulses. PLEX: if Cr >500 µmol/L or DAH." },
          { h: "Induction — Non-Severe", b: "Prednisolone + Rituximab (preferred over CYC for children to reduce gonadotoxicity). Or CYC oral 2 mg/kg/day × 3–6 months for non-severe." },
          { h: "Maintenance", b: "Rituximab 500 mg Q6 monthly (preferred) OR Azathioprine 2 mg/kg/day + low-dose prednisolone. Duration: 24 months minimum (GPA prone to relapse). Monitor PR3/MPO titre to predict relapse." },
          { h: "EGPA-Specific", b: "Mepolizumab (anti-IL-5): reduces eosinophil burden + steroid-sparing (cardiac monitoring). Steroids are mainstay. Rituximab if refractory." },
          { h: "Renal Monitoring in AAV", b: "eGFR + UPCR every 1–3 months (active), 3-monthly (remission). ANCA titre (rising PR3/MPO often precedes relapse). Repeat biopsy if rapid deterioration." },
        ]
      },
      {
        label: "Emergency",
        content: [
          { h: "DAH (Diffuse Alveolar Haemorrhage)", b: "Haemoptysis + bilateral infiltrates + dropping Hb. EMERGENCY: IV MP + PLEX (if Cr >500 or severe hypoxia) + RTX/CYC. ICU support." },
          { h: "RPGN in ANCA Vasculitis", b: "Rising Cr + haematuria + RBC casts. Urgent biopsy. PLEX if Cr >500 µmol/L or dialysis-dependent. Do not delay treatment for biopsy." },
          { h: "Monitoring Rituximab", b: "CD19/CD20 B-cell count post-RTX. Check immunoglobulins (IVIG if IgG <4 g/L + recurrent infections). PCP prophylaxis (cotrimoxazole) during induction." },
        ]
      },
    ],
    links: [
      { label: "ANCA Vasculitis Pathway", to: "/ClinicalSupport?scenario=anca-vasculitis" },
      { label: "RPGN Engine", to: "/ClinicalSupport?scenario=rpgn-deep-engine" },
      { label: "Plasmapheresis Module", to: "/ProcedureHub" },
      { label: "Lupus Nephritis Pathway", to: "/ClinicalSupport?scenario=lupus-nephritis" },
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
    ],
  },

  periodic: {
    title: "Periodic Fever Syndromes (Autoinflammatory)",
    subtitle: "Eurofever / PRINTO 2019 Classification Criteria",
    intro: "Monogenic autoinflammatory disorders with periodic fever episodes without infection or autoimmunity. Pattern recognition is key — fever duration, interval, associated features.",
    tabs: [
      {
        label: "Diagnosis",
        content: [
          { h: "PFAPA (Periodic Fever, Aphthous Ulcers, Pharyngitis, Adenitis)", b: "Most common. Onset <5 years. Episodes every 3–8 weeks. Duration 3–6 days. Clockwork regularity. Normal between episodes. No genetic mutation. Treatment: single dose prednisolone 1–2 mg/kg (aborts episode in hours). Tonsillectomy curative in 60–90%." },
          { h: "FMF (Familial Mediterranean Fever) — MEFV gene", b: "Autosomal recessive. Commonest in Middle East, Turkey, Armenia. Attacks: 12–72h. Fever + peritonitis (abdomen) ± pleuritis ± arthritis. AA amyloidosis (most feared complication). Treatment: COLCHICINE 0.5–1 mg/day (lifelong) — prevents attacks and amyloid. Add anakinra if resistant." },
          { h: "TRAPS (TNF Receptor-Associated Periodic Syndrome) — TNFRSF1A gene", b: "Autosomal dominant. Longer attacks (days–weeks). Migratory myalgia with overlying erythema. Periorbital oedema. High SAA/CRP. Treatment: IL-1 blockers (anakinra/canakinumab — first-line); etanercept (partial). NSAIDs for mild." },
          { h: "CAPS (Cryopyrin-Associated Periodic Syndromes) — NLRP3 gene", b: "Spectrum: FCAS (cold-triggered urticaria) → MWS (urticaria, sensorineural deafness) → NOMID (most severe: neonatal onset, CNS, destructive arthropathy). Continuous IL-1β excess. Treatment: IL-1 blockers (canakinumab 2–4 mg/kg Q8W — highly effective in CAPS)." },
          { h: "MKD/HIDS (Mevalonate Kinase Deficiency) — MVK gene", b: "Autosomal recessive. Attacks 3–7 days every 4–8 weeks. High IgD. Lymphadenopathy, abdominal pain, aphthous ulcers. Mevalonic aciduria in crisis. Treatment: IL-1 blockers (canakinumab); IL-6 (tocilizumab). NSAIDs. Steroids bridge." },
        ]
      },
      {
        label: "Approach",
        content: [
          { h: "Fever Pattern — Clinical Clues", b: "Episode frequency and duration (PFAPA: 3–8W, FMF: 1–4W, TRAPS: every few months). Attack triggers (cold → FCAS/CAPS). Regularity (PFAPA: clockwork). Age of onset (NOMID: neonatal; PFAPA: preschool)." },
          { h: "Which Test to Order?", b: "All: CBC, ESR, CRP, SAA (serum amyloid A — elevated in attacks). During attack: blood culture to exclude infection. Genetic panel: MEFV, TNFRSF1A, NLRP3, MVK — Eurofever Panel. Urine mevalonic acid (MVK during attack). IgD level (HIDS — often elevated, not specific)." },
          { h: "Red Flags — Consider Alternatives", b: "Continuous symptoms (consider infection, IBD, malignancy). Night sweats + weight loss (lymphoma). ANA/ANCA positive (autoimmunity, not autoinflammation). Very high WBC (leukaemia)." },
          { h: "Scoring Tools", b: "Eurofever/PRINTO classification criteria: validated criteria for FMF, TRAPS, CAPS, MKD, PFAPA. Available online. MAS risk: ferritin >10,000, cytopenias, coagulopathy." },
        ]
      },
      {
        label: "Treatment",
        content: [
          { h: "PFAPA", b: "Attack: prednisolone 1–2 mg/kg (single dose) — aborts attack within hours. Prevention: cimetidine (limited evidence). Definitive: tonsillectomy (60–90% cure rate)." },
          { h: "FMF", b: "Colchicine: 0.5 mg/day (<5y), 1 mg/day (5–10y), 1.5 mg/day (>10y). Max 2 mg/day. Take daily (not just during attacks). If inadequate: add anakinra 1–2 mg/kg/day SC." },
          { h: "CAPS Spectrum", b: "Canakinumab 2–4 mg/kg Q8W (most effective for CAPS). Anakinra 1–2 mg/kg/day SC (effective but daily injection). Rilonacept (IL-1 trap) — available in some regions." },
          { h: "TRAPS", b: "Canakinumab: preferred for frequent/severe attacks. Anakinra: breakthrough attacks. Etanercept: partial effect. Avoid infliximab/adalimumab (may worsen TRAPS)." },
          { h: "MKD/HIDS", b: "Canakinumab: most evidence. Tocilizumab: alternative. Simvastatin (theoretical — incomplete mevalonate pathway): limited benefit. Gene therapy/enzyme replacement: investigational." },
        ]
      },
    ],
    links: [
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
      { label: "Rare Disease Module", to: "/RareDiseaseModule" },
      { label: "Guidelines Library", to: "/GuidelinesLibrary" },
    ],
  },

  kawasaki: {
    title: "Kawasaki Disease",
    subtitle: "AHA 2017 Scientific Statement",
    intro: "Acute febrile vasculitis of medium vessels. Most common cause of acquired heart disease in children in developed countries. Coronary artery aneurysm (CAA) is the main complication.",
    tabs: [
      {
        label: "Diagnosis",
        content: [
          { h: "Classic Criteria (≥5 days fever + 4 of 5)", b: "1) Conjunctival injection (bilateral, non-purulent, limbic sparing). 2) Oral changes (cracked lips, strawberry tongue, diffuse erythema). 3) Rash (polymorphous, non-vesicular, truncal). 4) Extremity changes (erythema palms/soles, periungual desquamation in sub-acute). 5) Cervical lymphadenopathy (≥1 node >1.5 cm, usually unilateral)." },
          { h: "Incomplete Kawasaki", b: "Fever ≥5 days + 2–3 clinical features + elevated CRP (≥30) or ESR (≥40) → Echo: if ≥3 echocardiographic criteria OR z-score ≥2.5 in any coronary → treat as KD. Algorithm: AHA 2017 incomplete KD flowchart." },
          { h: "Infants <6 months: EXTRA vigilance", b: "Classic features often absent. Highest risk for CAA. Echo at diagnosis regardless of criteria met. Low threshold to treat." },
          { h: "Lab Findings", b: "Elevated: CRP, ESR, WBC (left shift), platelets (thrombocytosis in sub-acute phase — risk of thrombosis). Elevated ALT/GGT (hepatic involvement). Low albumin, low sodium (poor prognosis markers). UA: sterile pyuria." },
          { h: "Differentials", b: "PFAPA, viral exanthem (measles, adenovirus — viral serology), toxic shock syndrome (blood culture), scarlet fever (ASOT), reactive arthritis, SJS, drug reaction, adult Still's/MAS." },
        ]
      },
      {
        label: "Treatment",
        content: [
          { h: "URGENT: IVIG + Aspirin", b: "IVIG 2 g/kg over 10–12 hours (single dose) — must give within 10 days of fever onset (ideally day 5–9). Aspirin 80–100 mg/kg/day in 4 doses during febrile phase → 3–5 mg/kg/day once afebrile (anti-platelet effect)." },
          { h: "IVIG-Resistant KD (fever persists 36h after IVIG)", b: "Second IVIG 2 g/kg OR Infliximab 5 mg/kg IV (TNFi — equivalent to 2nd IVIG, faster response). OR Prednisolone 2 mg/kg/day (Kobayashi-predicted high-risk: Japanese scoring)." },
          { h: "Refractory KD / Giant CAA", b: "IV Methylprednisolone 30 mg/kg × 3 + IVIG. Anakinra (IL-1 blocker) for refractory. Low-molecular-weight heparin if z-score ≥10 (giant aneurysm — thrombosis risk)." },
          { h: "Aspirin Duration", b: "No CAA: stop aspirin 4–6 weeks post-KD. CAA z-score 2.5–5: aspirin for ≥1 year. z-score >5: long-term aspirin + consider anticoagulation (warfarin)." },
        ]
      },
      {
        label: "Coronary Monitoring",
        content: [
          { h: "Echo Schedule", b: "At diagnosis · 2 weeks · 6 weeks · 3 months (if CAA). Then annually if persistent CAA." },
          { h: "CAA Classification (z-score)", b: "Normal: <2.5. Dilation: 2.5–4.9. Small aneurysm: 5–6.9. Medium: 7–9.9. Giant (highest risk): ≥10." },
          { h: "Long-term Risk", b: "Most small-medium aneurysms regress in 1–2 years. Giant aneurysm: lifelong cardiac follow-up, anticoagulation, possible intervention." },
        ]
      },
    ],
    links: [
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
      { label: "Guidelines Library", to: "/GuidelinesLibrary" },
    ],
  },

  hsv: {
    title: "IgA Vasculitis (Henoch-Schönlein Purpura)",
    subtitle: "EULAR/PRINTO/PRES 2010 Criteria · ISPN Nephritis Guidelines",
    intro: "Most common systemic vasculitis in children. IgA-dominant immune deposits in small vessels. Tetrad: palpable purpura, arthritis, abdominal pain, renal involvement (IgAV-N).",
    tabs: [
      {
        label: "Diagnosis",
        content: [
          { h: "EULAR/PRINTO Criteria", b: "Mandatory: Palpable purpura (or petechiae), predominantly on legs, not thrombocytopenic. Plus ≥1: abdominal pain, histopathology (IgA deposits), arthritis/arthralgia, renal involvement (proteinuria/haematuria)." },
          { h: "Renal Involvement (IgAV-N)", b: "Occurs in 20–50% within 4–6 weeks. Microscopic haematuria (most common). Proteinuria (UPCR >0.2 = concerning). Nephrotic range (>2 g/day). Biopsy indication: UPCR >0.5, declining eGFR, hypertension, nephrotic syndrome — shows mesangial IgA deposits (same as IgAN)." },
          { h: "Severity Grading", b: "Mild: purpura only. Moderate: arthritis + abdominal pain. Severe: gut ischaemia (urgent) + nephrotic/nephritic renal disease + scrotal oedema." },
          { h: "Investigations", b: "CBC, CRP. IgA level (elevated in 50% — not diagnostic). Renal panel, UPCR (every 2 weeks for 6 months). US abdomen (if severe pain — intussusception?). Skin biopsy (IgA IF) if atypical." },
        ]
      },
      {
        label: "Management",
        content: [
          { h: "Mild IgAV (skin + joints)", b: "Supportive: NSAIDs for arthralgia (short course). No steroids needed for uncomplicated skin + joints. Monitor urine weekly × 4–6 weeks." },
          { h: "GI involvement", b: "Prednisolone 1–2 mg/kg/day for severe abdominal pain (reduces duration). IV hydration. Nil by mouth if intussusception risk. Surgical consultation for bowel ischaemia." },
          { h: "IgAV Nephritis — Mild (UPCR 0.2–0.5, normal eGFR)", b: "ACEi/ARB if persistent proteinuria. Monitor UPCR every 1–3 months for 1 year." },
          { h: "IgAV Nephritis — Moderate/Severe (UPCR >0.5 / nephrotic / declining eGFR)", b: "Biopsy if UPCR >0.5. Prednisolone 1–2 mg/kg/day + MMF (600 mg/m²/dose BD) for ISKDC grade III/IV. Pulse steroids for crescentic nephritis. PLEX rarely needed." },
          { h: "Monitoring", b: "Urine dip weekly × 4 weeks → monthly × 6 months. BP. If renal involved: monitor for 1 year (late-onset renal involvement can occur). Adolescent girls: follow-up in pregnancy planning (HTN/proteinuria risk)." },
        ]
      },
    ],
    links: [
      { label: "IgA Vasculitis Pathway", to: "/ClinicalSupport?scenario=iga-vasculitis" },
      { label: "HSPN Pathway", to: "/ClinicalSupport?scenario=hspn" },
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
    ],
  },

  jdm: {
    title: "Juvenile Dermatomyositis (JDM)",
    subtitle: "CARRA 2017 · Bohan & Peter Criteria · Myositis-Specific Ab",
    intro: "Inflammatory myopathy with characteristic skin findings. Childhood onset. Calcinosis is a major morbidity. Interstitial lung disease in some subtypes. No malignancy association in children (unlike adult DM).",
    tabs: [
      {
        label: "Diagnosis",
        content: [
          { h: "Pathognomonic Skin Findings", b: "Gottron's papules (over knuckles MCP/PIP): scaly erythematous papules — virtually diagnostic. Heliotrope rash: periorbital oedema + violaceous discolouration. Shawl sign, V-sign, holster sign." },
          { h: "Muscle Involvement", b: "Proximal muscle weakness: Gowers' sign (rising from floor), difficulty climbing stairs, raising arms. Neck flexor weakness. Normal distal strength." },
          { h: "Myositis-Specific Antibodies (MSA)", b: "Anti-Jo-1 (anti-ARS): ILD risk. Anti-MDA5: rapidly progressive ILD, amyopathic DM. Anti-NXP2: calcinosis risk. Anti-TIF1-γ: photosensitivity. Anti-Mi-2: good steroid response. Test full myositis panel." },
          { h: "Investigations", b: "CK (may be normal in JDM — unlike adult PM). LDH, aldolase. MRI muscle (STIR: oedema — more sensitive than EMG in children). EMG (abnormal if active myositis). Muscle biopsy (if diagnosis uncertain). Echo (myocarditis). PFTs (ILD screen). Nailfold capillaroscopy (dilated capillary loops = active vasculopathy)." },
          { h: "Calcinosis", b: "Deposits of calcium in skin, muscle, fascia. Occurs in 20–40% of JDM. Risk: delayed diagnosis, prolonged active disease. Prevention: early aggressive treatment. Treatment: limited — diltiazem, bisphosphonates (uncertain benefit)." },
        ]
      },
      {
        label: "Treatment",
        content: [
          { h: "First-line: Steroids + MTX", b: "IV Methylprednisolone 30 mg/kg/day (max 1g) × 3 days → Prednisolone 1–2 mg/kg/day + Methotrexate 15 mg/m²/week (oral or SC). Hydroxychloroquine 5 mg/kg/day (skin-predominant). Sunscreen + sun avoidance." },
          { h: "Refractory / Rapid-onset ILD", b: "IVIG 2 g/kg monthly (effective for skin + muscle). Rituximab 375 mg/m² × 4 (for refractory or anti-Jo1/MDA5). Cyclosporin (calcineurin inhibitor — helpful for ILD in MDA5+). Tacrolimus." },
          { h: "ILD (Anti-MDA5)", b: "Rapidly progressive — can be fatal. Early aggressive: high-dose steroids + tacrolimus + CYC. Monitor PFTs + HRCT." },
          { h: "Calcinosis Management", b: "Aggressive early treatment prevents calcinosis. Established: diltiazem 5 mg/kg/day. Probenecid. Infliximab (selected refractory). Surgical excision for large/painful deposits." },
          { h: "Monitoring", b: "CK + LDH monthly. MRI muscle (disease activity). Manual muscle testing score (MMT8). Skin activity score (CMAS). HRCT + PFT annually if MSA+. Ophthalmology (HCQ)." },
        ]
      },
    ],
    links: [
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
      { label: "Guidelines Library", to: "/GuidelinesLibrary" },
    ],
  },

  mctd: {
    title: "Mixed CTD / Undifferentiated CTD / Overlap",
    subtitle: "Sharp Criteria 1987 · EULAR Undifferentiated CTD",
    intro: "Overlap of features from SLE, SSc, PM/DM, and RA. Key serological marker: anti-U1RNP. Many children have 'undifferentiated CTD' initially that evolve into defined disease.",
    tabs: [
      {
        label: "Diagnosis",
        content: [
          { h: "MCTD — Sharp Criteria", b: "High titre anti-U1RNP + 3 of: swollen hands, synovitis, myositis, Raynaud's, acrosclerosis. Absence of: anti-dsDNA (SLE), anti-Sm (SLE), anti-centromere (limited SSc)." },
          { h: "Features Overlapping", b: "SLE features: malar rash, serositis, cytopenias. SSc features: Raynaud's (most common), sclerodactyly, puffy hands, oesophageal dysmotility, ILD. PM/DM features: proximal weakness, elevated CK. RA features: symmetric synovitis." },
          { h: "Undifferentiated CTD (UCTD)", b: "Features of CTD but does not meet criteria for any specific disease. ANA positive. Monitor: 20–30% evolve into SLE, SSc, or other defined CTD over years. HCQ for all while undifferentiated." },
          { h: "Investigations", b: "ANA (high titre), anti-U1RNP (high titre → MCTD), anti-dsDNA (SLE?), anti-Sm, anti-Scl70, anti-centromere, anti-Jo1, anti-MDA5. Complement C3/C4. CBC, renal, urine." },
        ]
      },
      {
        label: "Management",
        content: [
          { h: "HCQ — All Patients", b: "5 mg/kg/day. Foundation of MCTD management. Reduces flares and damage." },
          { h: "Raynaud's Phenomenon", b: "Calcium channel blockers: nifedipine 0.5 mg/kg/day. Amlodipine. Sildenafil for digital ulcers (SSc-overlap). Keep warm, avoid cold exposure." },
          { h: "Inflammatory Features (synovitis, serositis)", b: "NSAIDs short-term. Prednisolone for significant flares. MTX or AZA for persistent arthritis." },
          { h: "ILD", b: "Mycophenolate mofetil (preferred over CYC now). Nintedanib (investigational in children). Monitor: annual PFTs + HRCT." },
          { h: "Pulmonary Arterial Hypertension (PAH)", b: "Echo annually. If PAH: endothelin receptor antagonists (bosentan), PDE5 inhibitors (sildenafil), prostacyclins. Refer to PAH centre." },
        ]
      },
    ],
    links: [
      { label: "SLE Engine", to: null },
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
      { label: "Guidelines Library", to: "/GuidelinesLibrary" },
    ],
  },

  "septic-arthritis": {
    title: "Septic vs Inflammatory Arthritis",
    subtitle: "Emergency Differentiation · Kocher Criteria",
    intro: "Septic arthritis is a joint emergency — delay causes permanent damage. Must be distinguished rapidly from JIA, reactive arthritis, transient synovitis.",
    tabs: [
      {
        label: "Diagnosis",
        content: [
          { h: "Kocher Criteria (Hip)", b: "1) Fever >38.5°C. 2) Non-weight-bearing. 3) ESR >40 mm/hr. 4) WBC >12,000. Score: 0→ 0.2%, 1→ 3%, 2→ 40%, 3→ 93%, 4→ 99.6% probability of septic arthritis." },
          { h: "Modified Kocher (adds CRP >2 mg/dL)", b: "Adding CRP improves sensitivity: 3/4 Kocher criteria + CRP >2 → >95% probability." },
          { h: "Joint Aspiration — MANDATORY for diagnosis", b: "WBC >50,000/µL (> 50×10⁹/L) with >90% neutrophils = septic. Culture + sensitivity. Gram stain (low sensitivity). Glucose (low), protein (high). Send simultaneously: blood culture." },
          { h: "Imaging", b: "Plain XR (soft tissue swelling, effusion — late changes). USS: effusion (helps aspiration — not diagnostic). MRI: gold standard for osteomyelitis extension, AVN, early changes. Bone scan: if multifocal." },
          { h: "Differentials — Septic vs Others", b: "Transient synovitis: afebrile, normal CRP, settles in 7–10 days. Reactive arthritis: post-infection (URTI, GI), migratory, culture negative. JIA: subacute, bilateral, systemic features. Leukaemia: bone pain at night, blast cells. Parvovirus: symmetric small joints." },
        ]
      },
      {
        label: "Treatment",
        content: [
          { h: "URGENT: Surgical Washout", b: "Hip: ALWAYS surgical washout (blood supply from femoral head at risk → AVN). Other large joints: arthroscopic washout or aspiration-irrigation if urgent." },
          { h: "Empirical Antibiotics (before cultures)", b: "Neonate (<3 months): Flucloxacillin + Gentamicin (Staph + Gram-neg). Children: Flucloxacillin 50 mg/kg Q6H IV (Staph aureus). If MRSA risk: Vancomycin 15 mg/kg Q6H. If salmonella risk (sickle cell): Ceftriaxone. Immunocompromised: broader spectrum." },
          { h: "Duration", b: "IV antibiotics until afebrile + CRP falling + improved ROM: 3–5 days. Then step down to oral: flucloxacillin or co-amoxiclav × 3–4 weeks total. Osteomyelitis: extend total to 4–6 weeks." },
          { h: "Monitor for Complications", b: "AVN (avascular necrosis): hip — serial XR at 6 weeks, 3 months, 1 year. Growth disturbance (physis damage). Chronic osteomyelitis. Functional assessment of range of motion at discharge and follow-up." },
        ]
      },
    ],
    links: [
      { label: "Rheumatology Hub", to: "/PediatricRheumatology" },
      { label: "Guidelines Library", to: "/GuidelinesLibrary" },
    ],
  },
};

function TabView({ data, color }) {
  const [activeTab, setActiveTab] = useState(0);
  const grad = COLOR_MAP[color] || "from-slate-700 to-slate-600";

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {data.tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
              ${activeTab === i ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {data.tabs[activeTab].content.map((item, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-bold text-slate-800 mb-1">{item.h}</p>
            <p className="text-xs text-slate-700 leading-relaxed">{item.b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RheumatologyEngine() {
  const [selected, setSelected] = useState(null);

  const cond = selected ? CONDITIONS.find(c => c.id === selected) : null;
  const data = selected ? DATA[selected] : null;
  const grad = cond ? (COLOR_MAP[cond.color] || "from-slate-700 to-slate-600") : "";

  if (selected && data) {
    return (
      <div className="space-y-4">
        <div className={`rounded-xl bg-gradient-to-r ${grad} p-4 text-white`}>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm">{data.title}</h3>
              <p className="text-xs opacity-80">{data.subtitle}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">{data.intro}</p>

        <TabView data={data} color={cond.color} />

        {/* Links */}
        {data.links?.filter(l => l.to).length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <p className="text-xs font-bold text-slate-700">Related Pathways, Engines & Hubs</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.links.filter(l => l.to).map((lnk, i) => (
                <Link key={i} to={lnk.to}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors">
                  {lnk.label} <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              ))}
              <Link to="/GuidelinesLibrary"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-400 transition-colors">
                <BookOpen className="w-3 h-3" /> Guidelines Library
              </Link>
            </div>
          </div>
        )}

        <button onClick={() => setSelected(null)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50">
          <RotateCcw className="w-3.5 h-3.5" /> Choose Another Condition
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-rose-700 to-pink-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Paediatric Rheumatology Engine</h3>
            <p className="text-xs text-rose-200">Diagnosis · Management · Emergency · Connected to Pathways</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-600">Select a rheumatological condition to access evidence-based diagnostic criteria, management protocols, and emergency guidance — all connected to relevant clinical pathways.</p>
      <div className="space-y-2">
        {CONDITIONS.map(c => (
          <button key={c.id} onClick={() => setSelected(c.id)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-rose-400 hover:bg-rose-50 text-left transition-all">
            <div>
              <p className="font-semibold text-sm text-slate-900">{c.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}