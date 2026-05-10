import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, Pill, AlertTriangle, Activity } from "lucide-react";

export const GN_DRUG_LIBRARY = [
  {
    id: "prednisolone",
    name: "Prednisolone / Prednisone",
    class: "Corticosteroid",
    mechanism: "Glucocorticoid receptor agonist — broad anti-inflammatory; inhibits NF-κB, reduces cytokines, lymphocyte apoptosis",
    indications: ["MCD (first-line)", "FSGS (primary)", "IgAN (high-risk)", "LN Class III/IV", "ANCA vasculitis", "Anti-GBM", "JDM", "sJIA"],
    pediatric_dose: "NS induction: 60 mg/m²/day or 2 mg/kg/day (max 60 mg) × 4–6 weeks. Relapse: 2 mg/kg/day until remission then taper. Pulse: IV methylprednisolone 30 mg/kg (max 1g) × 3 days.",
    bsa_support: "Yes — 60 mg/m²/day for NS (preferred in children)",
    renal_adjustment: "No dose adjustment required",
    dialysis: "Not renally cleared; continue normal dosing in dialysis",
    monitoring: ["BP, weight, growth velocity every visit", "Fasting glucose (steroid diabetes)", "Bone profile + DEXA if >3 months", "Ophthalmology (cataracts/glaucoma) annually", "Cushingoid features — document"],
    toxicity: ["Growth suppression", "Hypertension", "Weight gain/cushingoid", "Osteoporosis", "Cataracts/glaucoma", "Glucose intolerance", "Adrenal suppression on withdrawal", "Avascular necrosis (high dose/prolonged)"],
    infection_prophylaxis: ["PJP (TMP-SMX) if on high-dose + second immunosuppressant", "Varicella/VZV: check immunity before starting", "Antifungal if prolonged + oral steroids"],
    vaccination: "Live vaccines CONTRAINDICATED at high dose. Inactivated vaccines: give ≥2 weeks before or after. Influenza annually.",
    fertility: "Reversible — no direct gonadal toxicity at standard doses. High-dose prolonged: menstrual irregularity.",
    evidence_grade: "Strong (1A) for MCD/NS",
    last_updated: "2024-12",
    refs: ["KDIGO 2021 GD", "IPNA NS 2019"],
    crossLinks: ["mcd", "fsgs", "lupus"],
  },
  {
    id: "mmf",
    name: "Mycophenolate Mofetil (MMF)",
    class: "Immunosuppressant (Antiproliferative)",
    mechanism: "Selective IMPDH inhibitor — blocks de novo purine synthesis in lymphocytes only (selective effect)",
    indications: ["LN Class III/IV (induction + maintenance)", "FSGS (steroid-dependent/resistant)", "IgAN (progressive)", "ANCA vasculitis (maintenance)", "C3GN", "JDM", "SLE", "Anti-CFH Ab nephropathy"],
    pediatric_dose: "600 mg/m² PO BID (max 2–3 g/day induction, 1–2 g/day maintenance). BSA-based preferred.",
    bsa_support: "Yes — 600 mg/m²/dose BID",
    renal_adjustment: "No dose adjustment needed in CKD (not renally cleared). Avoid if eGFR <25 + haematologic toxicity.",
    dialysis: "Not dialysed — continue at maintenance dose. Monitor CBC carefully.",
    monitoring: ["CBC + LFT q4–8 weeks initially, then q3 months", "WBC >3k, ANC >1.5k target", "Avoid grapefruit (increases MMF levels)"],
    toxicity: ["GI (diarrhoea, nausea — most common; switch to EC-MPS/myfortic if significant)", "Myelosuppression", "Opportunistic infections", "Teratogenicity (REMS program — female patients)"],
    infection_prophylaxis: ["TMP-SMX DS 3× weekly (PJP prophylaxis)", "CMV monitoring in high-risk transplant patients"],
    vaccination: "All live vaccines: AVOID. Influenza, pneumococcal, meningococcal: give before starting or ≥2 weeks before.",
    fertility: "TERATOGENIC — stop 6 weeks before planned conception. Use effective contraception.",
    evidence_grade: "Strong (1B) for LN; Moderate for others",
    last_updated: "2025-01",
    refs: ["ACR/EULAR LN 2019", "KDIGO 2021 GD", "EULAR pSLE 2023"],
    crossLinks: ["lupus", "anca", "c3gn"],
  },
  {
    id: "tacrolimus",
    name: "Tacrolimus (CNI)",
    class: "Calcineurin Inhibitor (CNI)",
    mechanism: "Binds FKBP12 → inhibits calcineurin → blocks IL-2 transcription → T-cell suppression. Also direct podocyte stabilisation effect.",
    indications: ["FSGS (steroid-resistant)", "MCD (frequently relapsing/steroid-dependent)", "LN (Class III/IV — voclosporin approved; tacrolimus as alternative)", "SRNS", "MN (alternative to MMF)"],
    pediatric_dose: "0.1–0.2 mg/kg/day PO in 2 divided doses (12h apart). Adjust to trough level.",
    bsa_support: "Weight-based; titrate to trough",
    renal_adjustment: "No renal dose adjustment, but nephrotoxic — monitor creatinine closely. Reduce dose if rising creatinine.",
    dialysis: "Highly protein bound — not removed by dialysis. Continue monitoring trough levels.",
    monitoring: ["Tacrolimus trough (C0): 4–8 ng/mL for NS; 4–6 ng/mL for maintenance", "Monthly creatinine, CBC", "Blood pressure q visit", "Glucose (diabetogenic)", "LFTs q3 months"],
    toxicity: ["Nephrotoxicity (acute — vasoconstrictive; chronic — tubular vacuolation)", "New-onset diabetes after transplant (NODAT)", "Neurotoxicity (tremor, headache, seizures)", "Hypertension", "Hyperkalaemia", "Hypomagnesaemia"],
    infection_prophylaxis: ["TMP-SMX for PJP if on combination IS", "CMV prophylaxis post-transplant (valganciclovir)"],
    vaccination: "Live vaccines: AVOID. Inactivated: safe.",
    fertility: "Reversible; limited data on long-term fertility. Menstrual irregularity common.",
    evidence_grade: "Strong for SRNS/FSGS; Moderate for LN",
    last_updated: "2025-01",
    refs: ["KDIGO 2021 GD", "IPNA SRNS 2020"],
    crossLinks: ["fsgs", "mcd", "lupus"],
    tdmNote: "Trough target 4–8 ng/mL (NS). Reduce or hold if creatinine rises >25% above baseline.",
  },
  {
    id: "cyclosporin",
    name: "Cyclosporin A (CSA)",
    class: "Calcineurin Inhibitor (CNI)",
    mechanism: "Binds cyclophilin → inhibits calcineurin → blocks IL-2 transcription → T-cell suppression",
    indications: ["MCD (alternative to tacrolimus)", "FSGS (SRNS — older agent)", "MAS/HLH (sJIA-MAS)", "Membranous GN", "SRNS"],
    pediatric_dose: "3–5 mg/kg/day PO in 2 divided doses. Titrate to C0 100–200 ng/mL (NS). Higher in transplant (200–300 ng/mL).",
    bsa_support: "Weight-based; titrate to trough",
    renal_adjustment: "Nephrotoxic — reduce dose if creatinine rises >25–30% above baseline. Avoid in severe CKD.",
    dialysis: "Not significantly removed by HD or PD. Continue monitoring.",
    monitoring: ["CSA trough (C0): 100–200 ng/mL (NS)", "Monthly creatinine, CBC, LFT, K+, Mg2+", "BP + lipids"],
    toxicity: ["Nephrotoxicity (more than tacrolimus)", "Hypertension", "Gingival hyperplasia", "Hypertrichosis", "Dyslipidaemia", "Hepatotoxicity"],
    infection_prophylaxis: ["TMP-SMX PJP prophylaxis if combined IS"],
    vaccination: "Live vaccines: AVOID.",
    fertility: "Reversible; fewer fertility concerns than CYC.",
    evidence_grade: "Moderate for NS; Strong for MAS",
    last_updated: "2024-10",
    refs: ["KDIGO 2021 GD", "IPNA NS 2019"],
    crossLinks: ["mcd", "fsgs"],
    tdmNote: "CSA trough 100–200 ng/mL (NS). Higher variability than tacrolimus. Monitor gingival and hair changes.",
  },
  {
    id: "rituximab",
    name: "Rituximab (RTX)",
    class: "Anti-CD20 B-cell depleting biologic",
    mechanism: "Chimeric anti-CD20 monoclonal antibody — B-cell depletion via ADCC, CDC, apoptosis",
    indications: ["MN (first-line per KDIGO 2021)", "FSGS (frequently relapsing/steroid-dependent)", "LN refractory", "ANCA vasculitis (induction + maintenance)", "IgG4-RKD", "Anti-CFH nephropathy", "MCD refractory", "SRNS"],
    pediatric_dose: "375 mg/m² IV weekly × 4 (induction) OR 1g × 2 doses (2 weeks apart). Maintenance ANCA: 375 mg/m² q6 months.",
    bsa_support: "BSA-based dosing: 375 mg/m²",
    renal_adjustment: "No renal dose adjustment. Infusion in CKD: slower rate, extra monitoring.",
    dialysis: "Not removed by dialysis. Continue standard dosing.",
    monitoring: ["CD19/CD20 B-cell count (confirm depletion)", "IgG every 3–6 months (hypogammaglobulinaemia risk)", "CBC, LFT q3 months", "HBV reactivation — monitor anti-HBsAg"],
    toxicity: ["Infusion reactions (first dose commonest — pre-medicate)", "Hypogammaglobulinaemia (IVIG if IgG <4 g/L + infections)", "Progressive multifocal leukoencephalopathy (PML — rare)", "Late-onset neutropenia", "HBV reactivation"],
    infection_prophylaxis: ["HBsAg + anti-HBc MANDATORY before RTX — entecavir prophylaxis if positive", "TMP-SMX PJP prophylaxis", "TST/IGRA for TB before starting"],
    vaccination: "All live vaccines: AVOID. Timing: vaccines ≥4 weeks before RTX. No live vaccines ≤6 months after RTX.",
    fertility: "Neonatal B-cell depletion if given in pregnancy — avoid.",
    evidence_grade: "Strong for MN + ANCA; Moderate for FSGS + LN",
    last_updated: "2025-02",
    refs: ["KDIGO 2021 GD", "ACR/EULAR AAV 2022", "MENTOR Trial (MN)"],
    crossLinks: ["membranous", "anca", "lupus", "fsgs"],
    premedication: "IV methylprednisolone 100 mg + diphenhydramine + paracetamol 30 min before each infusion.",
  },
  {
    id: "cyclophosphamide",
    name: "Cyclophosphamide (CYC)",
    class: "Alkylating Agent / Immunosuppressant",
    mechanism: "DNA cross-linking alkylating agent — depletes rapidly dividing B and T lymphocytes",
    indications: ["ANCA vasculitis induction (severe)", "Anti-GBM disease", "LN Class III/IV (Euro-lupus or NIH protocol)", "IgAV severe nephritis", "MCD frequently relapsing (induces sustained remission)"],
    pediatric_dose: {
      iv_pulse: "Euro-lupus: 500 mg IV q2 weeks × 6 doses. NIH: 500–1000 mg/m² IV q3–4 weeks × 6. ANCA: 15 mg/kg IV q3 weeks × 6.",
      oral: "2 mg/kg/day PO (MCD FR: 8–12 weeks max)",
    },
    bsa_support: "mg/m² dosing: 500–1000 mg/m² per pulse",
    renal_adjustment: "Reduce dose 25–50% if GFR <50. Avoid if GFR <10.",
    dialysis: "Partially removed by HD — dose AFTER dialysis session. PD: supplement dose.",
    monitoring: ["CBC d10 post-pulse (nadir WBC)", "Urinalysis monthly (haemorrhagic cystitis)", "LFT, creatinine", "Cumulative dose tracking"],
    toxicity: ["Myelosuppression", "Haemorrhagic cystitis (mesna + hyperhydration mandatory)", "Gonadal toxicity (cumulative dose-dependent — CRITICAL)", "Secondary malignancy (lymphoma — long-term)", "Nausea/vomiting (antiemetics)"],
    infection_prophylaxis: ["TMP-SMX PJP prophylaxis mandatory", "Antifungal if neutropaenic"],
    vaccination: "Live vaccines: ABSOLUTE AVOIDANCE during and ≥6 months after CYC.",
    fertility: "PERMANENT GONADAL TOXICITY at high cumulative doses. MANDATORY: oocyte/sperm cryopreservation discussion before starting in all adolescents.",
    evidence_grade: "Strong (1A) for ANCA + Anti-GBM + LN",
    last_updated: "2024-12",
    refs: ["KDIGO 2021 GD", "ACR/EULAR AAV 2022", "KDIGO LN 2019"],
    crossLinks: ["anca", "antigbm", "lupus"],
    bladder_protection: "IV mesna 60–100% of CYC dose (split before + 4h + 8h after). Hyperhydration 2–3L/m²/day.",
  },
  {
    id: "acei",
    name: "ACE Inhibitors (Ramipril, Enalapril, Lisinopril)",
    class: "RAAS blockade / Antiproteinuric",
    mechanism: "Blocks angiotensin converting enzyme → reduces Ang II → vasodilation, reduced efferent arteriolar tone, reduced proteinuria, reduced TGF-β (anti-fibrotic)",
    indications: ["Proteinuria in ANY GN (first-line antiproteinuric)", "Alport syndrome (early ACEi slows progression)", "Diabetic nephropathy", "IgAN", "FSGS", "Hypertension in CKD"],
    pediatric_dose: "Ramipril: 0.05–0.3 mg/kg/day OD. Enalapril: 0.1–0.5 mg/kg/day OD-BID. Lisinopril: 0.1–0.6 mg/kg/day OD. Titrate to BP and proteinuria.",
    bsa_support: "Weight-based dosing. Titrate to target PCR <0.5.",
    renal_adjustment: "Start at 50% dose if eGFR <30. Avoid if K+ >5.5 or eGFR <15. Monitor creatinine + K+ within 1–2 weeks of starting.",
    dialysis: "Removed by HD — dose after dialysis. Use with caution in dialysis patients.",
    monitoring: ["K+, creatinine within 2 weeks of starting/dose change", "BP each visit", "Urine PCR q3 months", "Tolerated rise in creatinine up to 30% acceptable"],
    toxicity: ["Dry cough (class effect — switch to ARB)", "Hyperkalaemia", "Hypotension (first dose)", "Acute kidney injury (bilateral RAS — absolute contraindication)", "Angioedema (rare but serious)"],
    infection_prophylaxis: "Not immunosuppressive — no prophylaxis required.",
    vaccination: "No restrictions.",
    fertility: "CONTRAINDICATED in pregnancy (fetotoxic — renal dysgenesis). Stop before conception.",
    evidence_grade: "Strong (1A) for CKD proteinuria",
    last_updated: "2025-01",
    refs: ["KDIGO CKD 2024", "KDIGO 2024 Alport"],
    crossLinks: ["alport", "igan", "fsgs", "diabetic_nephropathy"],
  },
  {
    id: "arb",
    name: "ARBs (Losartan, Irbesartan, Olmesartan)",
    class: "RAAS blockade / Antiproteinuric",
    mechanism: "AT1 receptor blocker → reduces Ang II effects → vasodilation, reduced proteinuria, anti-fibrotic. No cough (unlike ACEi).",
    indications: ["ACEi-intolerant patients (cough)", "Proteinuria in CKD/GN", "Hypertension", "DKD", "Alport syndrome"],
    pediatric_dose: "Losartan: 0.7–1.4 mg/kg/day OD (max 100 mg). Irbesartan: 75–150 mg OD (>6y, weight-based). Olmesartan: 0.1–0.3 mg/kg/day.",
    bsa_support: "Weight-based; titrate to BP + PCR",
    renal_adjustment: "Same cautions as ACEi. Losartan: no adjustment needed down to eGFR 15. Monitor K+.",
    dialysis: "Hypotension risk. Use with caution.",
    monitoring: ["Same as ACEi: K+, creatinine, BP, PCR"],
    toxicity: ["Hyperkalaemia (class effect)", "Hypotension", "AKI with bilateral RAS", "Angioedema (rare, less than ACEi)"],
    infection_prophylaxis: "None required.",
    vaccination: "No restrictions.",
    fertility: "CONTRAINDICATED in pregnancy — same as ACEi.",
    evidence_grade: "Strong (1A) equivalent to ACEi",
    last_updated: "2025-01",
    refs: ["KDIGO CKD 2024", "KDIGO 2022 DM-CKD"],
    crossLinks: ["alport", "igan", "diabetic_nephropathy"],
    note: "Do NOT combine ACEi + ARB — increased AKI/hyperkalaemia without added benefit (ONTARGET trial).",
  },
  {
    id: "sglt2i",
    name: "SGLT2 Inhibitors (Dapagliflozin, Empagliflozin)",
    class: "SGLT2 Inhibitor / Cardiorenal agent",
    mechanism: "Blocks SGLT2 in proximal tubule → glucosuria + reduced intraglomerular pressure (tubuloglomerular feedback) → renoprotective, anti-inflammatory, cardioprotective",
    indications: ["DKD (first-line KDIGO 2022)", "CKD with proteinuria (PCR >200 mg/g) — KDIGO 2024", "IgAN (KDIGO 2024)", "FSGS (emerging evidence)", "Heart failure with CKD"],
    pediatric_dose: "Dapagliflozin 10 mg OD (approved from 18y in CKD indication). Off-label in children: 0.1–0.3 mg/kg OD. NOT routinely used <12y.",
    bsa_support: "Fixed dose in adults; weight-based if off-label in children",
    renal_adjustment: "Not recommended if eGFR <20 for CKD benefit. Safe to use down to eGFR 25 for CKD-P indication. STOP if eGFR <20.",
    dialysis: "Not indicated in dialysis patients.",
    monitoring: ["eGFR, K+, BP q3 months", "Urogenital infections (DKA risk in T1DM)", "Watch for DKA in fasting/surgery — hold 3 days before surgery"],
    toxicity: ["Genital mycotic infections (commonest)", "UTI", "Euglycaemic DKA (especially T1DM)", "Acute volume depletion (rare — adjust diuretic)", "Bone fractures (not significant at standard doses)"],
    infection_prophylaxis: "Genital hygiene counselling. No specific prophylaxis.",
    vaccination: "No restrictions.",
    fertility: "Limited data. Discontinue before conception.",
    evidence_grade: "Strong (1A) for DKD; Strong (1B) for CKD general — DAPA-CKD, EMPA-KIDNEY trials",
    last_updated: "2025-02",
    refs: ["KDIGO 2022 DM-CKD", "KDIGO CKD 2024", "DAPA-CKD Trial", "EMPA-KIDNEY Trial"],
    crossLinks: ["igan", "diabetic_nephropathy", "alport"],
    trialHighlight: "DAPA-CKD: 39% reduction in eGFR decline/ESKD. EMPA-KIDNEY: 28% reduction across all CKD subtypes.",
  },
  {
    id: "eculizumab",
    name: "Eculizumab (Complement C5 Inhibitor)",
    class: "Complement inhibitor (anti-C5 monoclonal antibody)",
    mechanism: "Humanised anti-C5 monoclonal antibody — blocks C5 cleavage → prevents MAC (C5b-9) formation → stops complement-mediated TMA",
    indications: ["aHUS (first-line — complement-mediated TMA)", "C3GN/DDD (selected cases)", "Anti-CFH Ab nephropathy + TMA", "PNH"],
    pediatric_dose: "<5 kg: 300 mg q1w × 1, then 300 mg q3w. 5–10 kg: 600 mg q1w × 1, then 300 mg q2w. Adolescent (≥40 kg): 900 mg q1w × 4, then 1200 mg q2w.",
    bsa_support: "Weight-banded dosing (see SmPC weight bands)",
    renal_adjustment: "No renal dose adjustment.",
    dialysis: "Not removed by dialysis. Supplement dose post-PLEX (PLEX removes eculizumab).",
    monitoring: ["Platelet count, LDH, haptoglobin, creatinine — weekly during induction", "Complement panel: CH50 (should be suppressed to 0)", "After PLEX: supplement eculizumab dose within 60 min"],
    toxicity: ["Meningococcal infection (LIFE-THREATENING — Neisseria meningitidis septicaemia)", "Headache, nasopharyngitis", "Hypertension", "Rare: severe infusion reactions"],
    infection_prophylaxis: ["Meningococcal vaccination MANDATORY: MenB + MenACWY — 2 weeks before or at start", "If urgent: start eculizumab + penicillin V 250 mg BD prophylaxis simultaneously", "Continue penicillin V throughout + 3 months after stopping"],
    vaccination: "Meningococcal B (Bexsero) + ACWY mandatory. Pneumococcal + Hib also recommended.",
    fertility: "Limited data — consult specialist.",
    evidence_grade: "Strong for aHUS",
    last_updated: "2025-01",
    refs: ["KDIGO 2021 GD", "International aHUS Registry", "FDA aHUS label"],
    crossLinks: ["aahu", "c3gn"],
    clinicalNote: "Check meningococcal vaccination status BEFORE first dose. If emergency — start penicillin V SAME DAY as eculizumab.",
  },
  {
    id: "ravulizumab",
    name: "Ravulizumab (Long-acting Anti-C5)",
    class: "Complement inhibitor (long-acting anti-C5 monoclonal antibody)",
    mechanism: "Humanised long-acting anti-C5 monoclonal antibody — blocks C5 → sustained complement suppression q8 weeks",
    indications: ["aHUS (preferred over eculizumab — q8 week dosing)", "PNH"],
    pediatric_dose: "Weight-banded: <20 kg: 600 mg IV × 1, then 300 mg q4w. 20–<30 kg: 900 mg × 1, then 2100 mg q8w. 30–<40 kg: 1200 mg × 1, then 2700 mg q8w. ≥40 kg: 2400 mg × 1, then 3000 mg q8w.",
    bsa_support: "Weight-banded (not BSA)",
    renal_adjustment: "No renal dose adjustment.",
    dialysis: "Same as eculizumab — supplement after PLEX.",
    monitoring: ["Same as eculizumab", "q8 week infusion monitoring", "CH50 suppression confirmed"],
    toxicity: ["Same meningococcal risk as eculizumab", "Upper respiratory infections", "Headache"],
    infection_prophylaxis: ["Identical to eculizumab: MenB + MenACWY + penicillin V prophylaxis"],
    vaccination: "Meningococcal: same mandatory requirements as eculizumab.",
    fertility: "Limited data.",
    evidence_grade: "Strong — non-inferior to eculizumab with q8w dosing",
    last_updated: "2025-02",
    refs: ["ALXN1210-aHUS-311 Trial", "FDA approval 2019 (aHUS)"],
    crossLinks: ["aahu"],
    clinicalNote: "Preferred over eculizumab for aHUS due to q8w maintenance (improved adherence, fewer infusion visits).",
  },
  {
    id: "sparsentan",
    name: "Sparsentan",
    class: "Dual endothelin-angiotensin receptor antagonist (DEARA)",
    mechanism: "Simultaneous blockade of AT1 (angiotensin II) and ET-A (endothelin-A) receptors → synergistic antiproteinuric + anti-inflammatory + anti-fibrotic effect",
    indications: ["FSGS (FDA approved 2023 — primary FSGS, adults)", "IgAN (PROTECT trial 2023 — FDA approved for IgAN, adults)", "Alport syndrome (ReSolve trial — ongoing)"],
    pediatric_dose: "NOT approved in children. Adult dose: 200 mg OD titrating to 400 mg OD (FSGS). IgAN: 200 mg OD titrating to 400 mg OD. Off-label use in adolescents: specialist centres only.",
    bsa_support: "Fixed adult dose only. Paediatric data awaited.",
    renal_adjustment: "Not studied in severe CKD. Avoid if eGFR <20.",
    dialysis: "Not indicated.",
    monitoring: ["Urine PCR monthly initially", "BP weekly initially", "LFT (endothelin receptor antagonist class — hepatotoxicity risk)", "Haemoglobin (fluid retention)"],
    toxicity: ["Hepatotoxicity (ET receptor antagonist class effect — monthly LFT monitoring mandatory)", "Fluid retention/oedema", "Hypotension", "Teratogenicity (REMS required)"],
    infection_prophylaxis: "None required.",
    vaccination: "No restrictions.",
    fertility: "TERATOGENIC — mandatory negative pregnancy test before starting. REMS program enrolment required.",
    evidence_grade: "Strong for FSGS + IgAN (adults); Limited for paediatric",
    last_updated: "2025-03",
    refs: ["PROTECT Trial (IgAN 2023)", "DUPLEX Trial (FSGS 2023)", "FDA FSGS approval 2023"],
    crossLinks: ["fsgs", "igan", "alport"],
    trialHighlight: "PROTECT: 49% reduction in proteinuria vs irbesartan. DUPLEX: proteinuria reduction + eGFR preservation vs irbesartan at 108 weeks.",
  },
  {
    id: "furosemide",
    name: "Furosemide (Loop Diuretic)",
    class: "Loop Diuretic",
    mechanism: "Inhibits Na+/K+/2Cl- cotransporter (NKCC2) in thick ascending limb → natriuresis + diuresis",
    indications: ["Oedema in NS", "Acute pulmonary oedema", "AKI volume overload", "Hypertension (CKD)", "Hypercalcaemia"],
    pediatric_dose: "PO: 1–2 mg/kg/dose OD-BID (max 6 mg/kg/day). IV: 0.5–1 mg/kg/dose q6–12h. Infusion: 0.1–1 mg/kg/h.",
    bsa_support: "Weight-based",
    renal_adjustment: "Increase dose in CKD (reduced renal response). Dose up to 10 mg/kg in severe CKD for effect.",
    dialysis: "Often combined with dialysis for refractory overload. PD: may still have residual diuretic effect.",
    monitoring: ["K+, Na+, creatinine q48–72h during intensive diuresis", "Urine output, daily weight", "Signs of hypovolaemia: HR, BP, mucous membranes"],
    toxicity: ["Hypokalaemia (give K+ supplementation if PO tolerated)", "Hyponatraemia", "Dehydration/pre-renal AKI", "Ototoxicity (high-dose IV)", "Metabolic alkalosis"],
    infection_prophylaxis: "None.",
    vaccination: "No restrictions.",
    fertility: "No specific concerns.",
    evidence_grade: "Strong for oedema/fluid management",
    last_updated: "2024-09",
    refs: ["KDIGO AKI 2012", "IPNA NS 2019"],
    crossLinks: ["mcd", "fsgs"],
    clinicalNote: "Hypoalbuminaemia reduces furosemide delivery — co-administration with albumin infusion enhances effect in severe NS.",
  },
  {
    id: "bicarb",
    name: "Sodium Bicarbonate",
    class: "Alkalinising agent / Buffer",
    mechanism: "Provides exogenous bicarbonate → corrects metabolic acidosis. Also slows CKD progression (BICARBONATE trial).",
    indications: ["Metabolic acidosis (RTA, CKD)", "Proximal RTA (large doses)", "Fanconi syndrome", "CKD acidosis (serum bicarb <22 mEq/L — KDIGO)", "Urine alkalinisation (uric acid stones, drug toxicity)"],
    pediatric_dose: "RTA/CKD: 1–3 mEq/kg/day PO (split doses). IV acute acidosis: 1–2 mEq/kg slow IV over 30–60 min.",
    bsa_support: "Weight-based",
    renal_adjustment: "No renal dose adjustment. Monitor response via blood gas/serum bicarb.",
    dialysis: "Dialysis bath provides bicarbonate in HD/CRRT. Oral supplementation continued between sessions.",
    monitoring: ["Serum bicarbonate target ≥22 mEq/L", "Avoid overcorrection (alkalosis)", "Na+ (hypernatraemia from sodium load)", "K+ (alkalosis shifts K+ intracellularly — check)"],
    toxicity: ["Hypernatraemia (sodium load)", "Alkalosis (overcorrection)", "Hypokalaemia", "CO2 generation during rapid IV correction (cardiac/lung risk)"],
    infection_prophylaxis: "None.",
    vaccination: "No restrictions.",
    fertility: "No concerns.",
    evidence_grade: "Strong for RTA; Moderate for CKD progression slowing",
    last_updated: "2024-11",
    refs: ["KDIGO CKD 2024", "BICARBONATE Trial 2018"],
    crossLinks: [],
  },
  {
    id: "esa",
    name: "ESA Therapy (Erythropoiesis-Stimulating Agents)",
    class: "Erythropoiesis-stimulating agent",
    mechanism: "Recombinant erythropoietin → stimulates erythroid progenitors → increases RBC production",
    indications: ["Anaemia of CKD (eGFR <45 + Hb <10 g/dL)", "Predialysis CKD anaemia", "Dialysis-associated anaemia"],
    pediatric_dose: "Epoetin alfa: 50–150 U/kg SC/IV 3× weekly. Darbepoetin alfa: 0.45 mcg/kg SC weekly. Titrate to Hb target.",
    bsa_support: "Weight-based",
    renal_adjustment: "CKD is the primary indication — dose titrated by Hb response.",
    dialysis: "IV administration preferred in HD patients (post-dialysis). SC for PD/predialysis.",
    monitoring: ["Hb q4 weeks during titration, then q1–3 months", "Iron status: ferritin >200, TSAT >20% before and during ESA", "BP (ESA can raise BP)", "Target Hb 10–11.5 g/dL (avoid >12 — increased cardiovascular risk)"],
    toxicity: ["Hypertension (most common — adjust antihypertensives)", "Thrombosis/vascular access clotting", "Pure red cell aplasia (rare — anti-EPO antibodies)", "Seizures (rare)"],
    infection_prophylaxis: "None.",
    vaccination: "No restrictions.",
    fertility: "No direct concerns; CKD anaemia correction may improve fertility.",
    evidence_grade: "Strong for CKD anaemia (1A)",
    last_updated: "2025-01",
    refs: ["KDIGO CKD Anaemia 2012", "KDIGO CKD 2024"],
    crossLinks: [],
    ironNote: "Always correct iron deficiency first: IV ferric carboxymaltose 15 mg/kg (max 1g) preferred over PO in dialysis/non-absorbing CKD.",
  },
  {
    id: "phosphate_binders",
    name: "Phosphate Binders (CKD-MBD)",
    class: "Phosphate binders / CKD-MBD management",
    mechanism: "Bind dietary phosphate in GI tract → reduce phosphate absorption → treat hyperphosphataemia + prevent vascular calcification",
    indications: ["Hyperphosphataemia in CKD ≥Stage 3b", "CKD-MBD: elevated PTH + phosphate", "Dialysis patients (mandatory)"],
    agents: {
      "Calcium carbonate": "25–50 mg/kg/day with meals (elemental Ca). Cheapest. Limit in vascular calcification.",
      "Sevelamer carbonate": "200 mg TID with meals (children 25–75 mg/kg/day). No calcium — preferred if hypercalcaemia.",
      "Lanthanum carbonate": "Chewable 250–500 mg TID. Children >12y.",
      "Sucroferric oxyhydroxide": "500 mg TID (adults). Excellent phosphate binding, low pill burden.",
    },
    pediatric_dose: "Calcium carbonate: 25–50 mg/kg/day of elemental calcium with meals. Sevelamer: 25–75 mg/kg/day divided TID with meals.",
    bsa_support: "Weight-based",
    renal_adjustment: "CKD is the indication — no dose adjustment for renal function.",
    dialysis: "Essential in HD/PD patients. Give with each meal.",
    monitoring: ["Phosphate: target 1.1–1.5 mmol/L (children)", "Calcium: avoid hypercalcaemia (limit Ca-based binders)", "PTH: target 2–9× ULN in dialysis", "Vitamin D levels (25-OH and 1,25-OH)"],
    toxicity: ["Calcium carbonate: hypercalcaemia, constipation, vascular calcification (limit if Ca >2.6)", "Sevelamer: GI upset, metabolic acidosis (carbonate form avoids this)", "Lanthanum: GI upset"],
    infection_prophylaxis: "None.",
    vaccination: "No restrictions.",
    fertility: "No specific concerns.",
    evidence_grade: "Strong for hyperphosphataemia management",
    last_updated: "2024-10",
    refs: ["KDIGO CKD-MBD 2017", "KDIGO CKD 2024"],
    crossLinks: [],
  },
];

const CLASS_COLORS = {
  "Corticosteroid": "bg-amber-100 text-amber-800",
  "Immunosuppressant (Antiproliferative)": "bg-purple-100 text-purple-800",
  "Calcineurin Inhibitor (CNI)": "bg-indigo-100 text-indigo-800",
  "Alkylating Agent / Immunosuppressant": "bg-red-100 text-red-800",
  "Anti-CD20 B-cell depleting biologic": "bg-blue-100 text-blue-800",
  "RAAS blockade / Antiproteinuric": "bg-green-100 text-green-800",
  "SGLT2 Inhibitor / Cardiorenal agent": "bg-teal-100 text-teal-800",
  "Complement inhibitor (anti-C5 monoclonal antibody)": "bg-rose-100 text-rose-800",
  "Complement inhibitor (long-acting anti-C5 monoclonal antibody)": "bg-rose-100 text-rose-800",
  "Dual endothelin-angiotensin receptor antagonist (DEARA)": "bg-cyan-100 text-cyan-800",
  "Loop Diuretic": "bg-sky-100 text-sky-800",
  "Alkalinising agent / Buffer": "bg-emerald-100 text-emerald-800",
  "Erythropoiesis-stimulating agent": "bg-orange-100 text-orange-800",
  "Phosphate binders / CKD-MBD management": "bg-slate-100 text-slate-800",
};

const DRUG_CLASSES = ["All", "Corticosteroid", "Immunosuppressant", "CNI", "Biologic", "RAAS", "SGLT2i", "Complement", "Diuretic", "Other"];

const classFilterMap = {
  "Immunosuppressant": ["Immunosuppressant (Antiproliferative)", "Alkylating Agent / Immunosuppressant"],
  "CNI": ["Calcineurin Inhibitor (CNI)"],
  "Biologic": ["Anti-CD20 B-cell depleting biologic"],
  "RAAS": ["RAAS blockade / Antiproteinuric"],
  "SGLT2i": ["SGLT2 Inhibitor / Cardiorenal agent"],
  "Complement": ["Complement inhibitor (anti-C5 monoclonal antibody)", "Complement inhibitor (long-acting anti-C5 monoclonal antibody)", "Dual endothelin-angiotensin receptor antagonist (DEARA)"],
  "Diuretic": ["Loop Diuretic"],
  "Other": ["Alkalinising agent / Buffer", "Erythropoiesis-stimulating agent", "Phosphate binders / CKD-MBD management"],
};

function DrugCard({ drug }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("dose");

  const sections = [
    { id: "dose", label: "💊 Dosing" },
    { id: "monitoring", label: "📈 Monitoring" },
    { id: "toxicity", label: "⚠️ Toxicity" },
    { id: "special", label: "🔬 Special" },
    { id: "refs", label: "📚 Evidence" },
  ];

  return (
    <Card className="bg-white border-2 border-slate-200 hover:border-blue-300 transition-colors">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Pill className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold text-sm text-slate-900">{drug.name}</span>
              <Badge className={`text-xs border-0 ${CLASS_COLORS[drug.class] || "bg-slate-100 text-slate-700"}`}>{drug.class}</Badge>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">{drug.mechanism?.slice(0, 80)}...</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs bg-blue-50 p-2 rounded border text-blue-900">{drug.mechanism}</p>

          {/* Tabs */}
          <div className="flex gap-1 flex-wrap border-b pb-2">
            {sections.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${section === s.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {s.label}
              </button>
            ))}
          </div>

          {section === "dose" && (
            <div className="space-y-2">
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className="text-xs font-bold text-green-800 mb-1">Pediatric Dose</p>
                {typeof drug.pediatric_dose === "string" ? (
                  <p className="text-xs text-green-900">{drug.pediatric_dose}</p>
                ) : (
                  Object.entries(drug.pediatric_dose).map(([k, v]) => (
                    <p key={k} className="text-xs text-green-900"><strong>{k}:</strong> {v}</p>
                  ))
                )}
                {drug.bsa_support && <p className="text-xs text-green-700 mt-1">BSA support: {drug.bsa_support}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-amber-50 border border-amber-200 rounded p-2">
                  <p className="text-xs font-bold text-amber-800">Renal Adjustment</p>
                  <p className="text-xs text-amber-900">{drug.renal_adjustment}</p>
                </div>
                <div className="bg-cyan-50 border border-cyan-200 rounded p-2">
                  <p className="text-xs font-bold text-cyan-800">Dialysis</p>
                  <p className="text-xs text-cyan-900">{drug.dialysis}</p>
                </div>
              </div>
              {drug.tdmNote && (
                <div className="bg-indigo-50 border border-indigo-200 rounded p-2">
                  <p className="text-xs font-bold text-indigo-800">TDM Note</p>
                  <p className="text-xs text-indigo-900">{drug.tdmNote}</p>
                </div>
              )}
            </div>
          )}

          {section === "monitoring" && (
            <div className="space-y-1.5">
              {drug.monitoring?.map((m, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 bg-teal-50 border border-teal-100 rounded">
                  <Activity className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" />{m}
                </div>
              ))}
            </div>
          )}

          {section === "toxicity" && (
            <div className="space-y-1.5">
              {drug.toxicity?.map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 bg-red-50 border border-red-100 rounded">
                  <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />{t}
                </div>
              ))}
            </div>
          )}

          {section === "special" && (
            <div className="space-y-2">
              {drug.infection_prophylaxis && (
                <div className="bg-orange-50 border border-orange-200 rounded p-2">
                  <p className="text-xs font-bold text-orange-800 mb-1">Infection Prophylaxis</p>
                  {Array.isArray(drug.infection_prophylaxis) ? drug.infection_prophylaxis.map((p, i) => (
                    <p key={i} className="text-xs text-orange-900">• {p}</p>
                  )) : <p className="text-xs text-orange-900">{drug.infection_prophylaxis}</p>}
                </div>
              )}
              {drug.vaccination && (
                <div className="bg-teal-50 border border-teal-200 rounded p-2">
                  <p className="text-xs font-bold text-teal-800 mb-1">Vaccination Guidance</p>
                  <p className="text-xs text-teal-900">{drug.vaccination}</p>
                </div>
              )}
              {drug.fertility && (
                <div className="bg-pink-50 border border-pink-200 rounded p-2">
                  <p className="text-xs font-bold text-pink-800 mb-1">Fertility Counselling</p>
                  <p className="text-xs text-pink-900">{drug.fertility}</p>
                </div>
              )}
              {drug.clinicalNote && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-xs font-bold text-blue-800 mb-1">Clinical Note</p>
                  <p className="text-xs text-blue-900">{drug.clinicalNote}</p>
                </div>
              )}
              {drug.bladder_protection && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <p className="text-xs font-bold text-yellow-800 mb-1">Bladder Protection (CYC)</p>
                  <p className="text-xs text-yellow-900">{drug.bladder_protection}</p>
                </div>
              )}
              {drug.premedication && (
                <div className="bg-purple-50 border border-purple-200 rounded p-2">
                  <p className="text-xs font-bold text-purple-800 mb-1">Premedication</p>
                  <p className="text-xs text-purple-900">{drug.premedication}</p>
                </div>
              )}
              {drug.trialHighlight && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                  <p className="text-xs font-bold text-emerald-800 mb-1">Trial Highlights</p>
                  <p className="text-xs text-emerald-900">{drug.trialHighlight}</p>
                </div>
              )}
            </div>
          )}

          {section === "refs" && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 text-xs">{drug.evidence_grade}</Badge>
                <span className="text-xs text-slate-400">Updated: {drug.last_updated}</span>
              </div>
              {drug.refs?.map((r, i) => (
                <div key={i} className="text-xs p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">📚 {r}</div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function GNDrugs() {
  const [classFilter, setClassFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = GN_DRUG_LIBRARY.filter(d => {
    const matchClass = classFilter === "All" || (classFilterMap[classFilter] ? classFilterMap[classFilter].includes(d.class) : d.class.includes(classFilter));
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.indications?.join(" ").toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  });

  return (
    <div className="space-y-3">
      <Alert className="bg-purple-50 border-purple-200">
        <Pill className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-xs text-purple-900">
          <strong>GN Drug Centre:</strong> {GN_DRUG_LIBRARY.length} drugs — mechanism, pediatric dosing, BSA/weight support, renal adjustment, dialysis, monitoring, toxicity, infection prophylaxis, vaccination, fertility counselling.
        </AlertDescription>
      </Alert>

      <div className="relative">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drugs or indications..."
          className="w-full text-xs border rounded-xl px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-purple-400" />
        <Pill className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-400" />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {DRUG_CLASSES.map(c => (
          <button key={c} onClick={() => setClassFilter(c)}
            className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${classFilter === c ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-600 border-slate-200 hover:border-purple-300"}`}>
            {c}
          </button>
        ))}
        <span className="text-xs text-slate-400 self-center">{filtered.length} drugs</span>
      </div>

      {filtered.map(d => <DrugCard key={d.id} drug={d} />)}
    </div>
  );
}