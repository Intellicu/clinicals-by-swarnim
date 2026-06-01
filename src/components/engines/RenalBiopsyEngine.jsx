/**
 * Renal Biopsy Findings Engine
 * Interactive guide to key biopsy findings in common renal conditions
 * Links to AI Biopsy Analyzer
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Microscope, ExternalLink, Link } from "lucide-react";

const CONDITIONS = [
  { id: "SSNS_SRNS", label: "Minimal Change Disease / FSGS", badge: "bg-blue-600", tags: ["nephrotic", "SSNS", "SRNS", "FSGS", "MCD"] },
  { id: "IgAN", label: "IgA Nephropathy", badge: "bg-indigo-600", tags: ["IgA", "haematuria", "proteinuria", "MEST-C"] },
  { id: "LN", label: "Lupus Nephritis", badge: "bg-violet-600", tags: ["lupus", "SLE", "LN class", "proliferative"] },
  { id: "MN", label: "Membranous Nephropathy", badge: "bg-cyan-600", tags: ["membranous", "PLA2R", "spike", "nephrotic"] },
  { id: "C3G", label: "C3 Glomerulopathy / MPGN", badge: "bg-teal-600", tags: ["C3G", "DDD", "MPGN", "complement", "C3"] },
  { id: "PSGN", label: "Post-infectious GN (PSGN)", badge: "bg-green-600", tags: ["PSGN", "streptococcal", "post-infectious", "hump"] },
  { id: "ANCA", label: "ANCA Vasculitis (GPA/MPA)", badge: "bg-red-600", tags: ["ANCA", "pauci-immune", "crescentic", "RPGN"] },
  { id: "ANTI_GBM", label: "Anti-GBM / Goodpasture", badge: "bg-rose-600", tags: ["anti-GBM", "linear IgG", "Goodpasture", "crescentic"] },
  { id: "NPHP", label: "Nephronophthisis / TIN", badge: "bg-amber-600", tags: ["NPHP", "tubulointerstitial", "fibrous", "corticomedullary"] },
  { id: "ALPORT", label: "Alport Syndrome", badge: "bg-orange-600", tags: ["Alport", "COL4A", "GBM thinning", "basket weave"] },
  { id: "DM_NEPHRO", label: "Diabetic Nephropathy", badge: "bg-yellow-600", tags: ["diabetic", "Kimmelstiel-Wilson", "nodular", "mesangial"] },
  { id: "TIN", label: "Acute Tubulointerstitial Nephritis", badge: "bg-lime-600", tags: ["TIN", "drug-induced", "interstitial", "eosinophils"] },
];

const BIOPSY_DATA = {
  SSNS_SRNS: {
    title: "Minimal Change Disease (MCD) / FSGS",
    lm: "MCD: Normal light microscopy (hence 'minimal change'). FSGS: Segmental sclerosis in some glomeruli — podocyte injury pattern. Secondary FSGS: look for tubular atrophy, glomerulomegaly (adaptive), viral injury.",
    if: "MCD: Negative immunofluorescence (no deposits). FSGS: Variable — IgM + C3 in sclerotic segments (non-specific, trapped). Primary FSGS: negative Ig; secondary FSGS (lupus, virus): may show Ig deposits.",
    em: "MCD: Diffuse foot process effacement (podocyte spreading) — no deposits. FSGS: Focal foot process effacement + sclerosis. Podocytopenia (reduced podocyte number) on morphometry.",
    key_pearl: "Foot process effacement is present in BOTH MCD and FSGS — EM alone cannot distinguish. The degree of sclerosis on LM separates them. Biopsy indications: steroid resistance, atypical features, suspected genetic cause.",
    patterns: ["MCD: Normal LM + diffuse FPE on EM + negative IF = MCD diagnosis", "Primary FSGS (tip lesion, NOS, collapsing, cellular, perihilar)", "Collapsing variant: HIV, pamidronate, COVID — worst prognosis; COL4A3/APOL1 variants", "Genetic podocytopathies: NPHS1, NPHS2, WT1 — routine genetic testing in SRNS", "FSGS NOS: most common variant; ~50% reach ESKD in 10y if SRNS"],
    stains: ["PAS: best for GBM and mesangium", "Masson trichrome: sclerosis (blue) vs normal (red)", "Silver methenamine: GBM detail; FSGS sclerosis", "CD68 (macrophages): collapsing FSGS infiltration"],
    grades: "ISKDC classification (NS response): primary guide; FSGS Columbia classification: NOS / tip / perihilar / collapsing / cellular",
    refs: "KDIGO 2021 Glomerular Diseases · Columbia FSGS classification (D'Agati et al. JASN 2004) · IPNA SRNS 2020",
    analyserLink: "/imaging-viewer",
  },
  IgAN: {
    title: "IgA Nephropathy — Oxford MEST-C Classification",
    lm: "Mesangial hypercellularity (M), endocapillary hypercellularity (E), segmental glomerulosclerosis (S), tubular atrophy/interstitial fibrosis (T), crescents (C). Variable from mild mesangial to severe crescentic.",
    if: "Dominant or co-dominant IgA deposits in mesangium (characteristic). IgG and IgM often co-deposit (less intense). C3 in mesangium/capillary wall. IgA1-dominant (galactose-deficient IgA1 pathogenic).",
    em: "Electron-dense deposits in mesangium. ± paramesangial extension. Foot process effacement in proportion to proteinuria.",
    key_pearl: "Oxford MEST-C score each lesion separately: M0/M1 (mesangial cellularity), E0/E1, S0/S1, T0/T1/T2, C0/C1/C2. S and T lesions most predictive of poor outcome. Higher MEST-C total = worse prognosis.",
    patterns: ["M1 (>half glomeruli mesangial hypercellular): active inflammation", "E1 (endocapillary): may respond to immunosuppression", "S1 (segmental sclerosis): podocyte loss — poor prognosis", "T1/T2 (>25%/>50% tubular atrophy): irreversible fibrosis", "C1/C2 (crescents): RPGN-like; aggressive treatment warranted"],
    stains: ["IgA immunofluorescence: dominant staining (hallmark)", "PAS, silver for mesangial matrix", "Trichrome for fibrosis quantification"],
    grades: "Oxford MEST-C (Cattran et al. Kidney Int 2009; updated 2017). International IgAN Prognosis Tool: https://www.qxmd.com/calculate/calculator_408",
    refs: "Oxford Classification IgAN 2017 · KDIGO 2021 · IPNA IgAN/IgAVN 2021",
    analyserLink: "/imaging-viewer",
  },
  LN: {
    title: "Lupus Nephritis — ISN/RPS Classification",
    lm: "Class I: Normal. Class II: Mesangial. Class III: Focal (<50% glomeruli). Class IV: Diffuse (>50%). Class V: Membranous. Class VI: Advanced sclerosis (>90%). Wire-loop lesions: class III/IV hallmark (subendothelial deposits). Hyaline thrombi, 'full-house' deposits.",
    if: "'Full house' immunofluorescence: IgG + IgM + IgA + C3 + C1q — PATHOGNOMONIC of LN (rarely seen in other GN). C1q deposition indicates immune-complex activation. Class V: granular subepithelial + mesangial.",
    em: "Subendothelial deposits (class III/IV); subepithelial (class V); mesangial (all). Tubuloreticular inclusions (TRI — 'interferon fingerprints'): specific to LN in endothelial cells. Endothelial swelling.",
    key_pearl: "Class IV (diffuse proliferative) is most common and most severe — high risk ESKD. Class V+IV: combined pattern — treat both. Repeat biopsy if flare or worsening despite treatment (transformation between classes).",
    patterns: ["Class III: focal (<50%) proliferative — risk of transformation to Class IV", "Class IV: diffuse — most severe; pulse steroids + MMF/CYC (EULAR/ERA 2023)", "Class V: membranous LN — nephrotic range proteinuria; lower risk of RPGN", "Active + Chronic lesions scored separately (AI = activity index, CI = chronicity)", "High CI (fibrosis) = worse prognosis independent of class"],
    stains: ["H&E + PAS + Silver + Trichrome (standard quadruple stain)", "C1q IF: pathognomonic for LN", "IgG subclass: IgG1/IgG3 dominant in LN"],
    grades: "ISN/RPS 2003 Classification · EULAR/ERA-EDTA Revised 2018",
    refs: "KDIGO 2021 LN · EULAR/ERA 2023 LN recommendations · Bajema IM et al. Kidney Int 2018",
    analyserLink: "/imaging-viewer",
  },
  MN: {
    title: "Membranous Nephropathy (MN)",
    lm: "Thickened GBM with 'spike' formation on silver stain (methenamine silver). Subepithelial deposits outlined by basement membrane reaction. Stages I–IV (Ehrenreich-Churg). No endocapillary cellularity (unlike MPGN/C3G).",
    if: "Fine granular subepithelial IgG deposits (dominant IgG4 in primary/PLA2R-mediated MN). C3 (variable). C4d positive: immune-complex mediated. Negative for PLA2R = secondary MN more likely.",
    em: "Subepithelial deposits (Stage I: small/rare; Stage II: medium; Stage III: GBM between deposits — spikes; Stage IV: deposits incorporated into GBM). Podocyte foot process effacement.",
    key_pearl: "PLA2R1 antibody (anti-phospholipase A2 receptor): 70–80% of primary MN. THSD7A: 5–10% of primary MN. Anti-PLA2R correlates with disease activity — falling titre = remission. Negative anti-PLA2R = secondary MN (malignancy, SLE, hepatitis B/C, drugs, lupus).",
    patterns: ["Primary MN: anti-PLA2R dominant IgG4 staining in GBM", "Secondary MN (LN class V): 'full house' IF; IgG1 dominant; C1q positive", "Malignancy-associated: PLA2R-negative; IgG1/IgG2 dominant; workup for occult malignancy", "Drug-induced (NSAID, gold, penicillamine): usually PLA2R-negative"],
    stains: ["Silver stain: spikes pathognomonic", "PLA2R IF (if available): confirms primary MN", "IgG subclass IF: IgG4 dominant = primary"],
    grades: "Ehrenreich-Churg Stage I–IV (historical). KDIGO 2021: clinical risk-based management (not stage-based).",
    refs: "KDIGO 2021 MN · Beck LH Jr, NEJM 2009 (PLA2R discovery) · Ronco P, Debiec H, Kidney Int 2022",
    analyserLink: "/imaging-viewer",
  },
  C3G: {
    title: "C3 Glomerulopathy (C3G) / Dense Deposit Disease (DDD) / MPGN",
    lm: "MPGN (membranoproliferative) pattern: mesangial expansion + endocapillary hypercellularity + GBM 'double contour' (tram-tracking). DDD: variable — may also show MPGN pattern. Lobular accentuation of glomeruli.",
    if: "C3 dominant staining (≥2 orders of magnitude above any Ig): pathognomonic of C3G. Absent or trace Ig — distinguishes from immune-complex MPGN. DDD: same IF as C3GN (C3 dominant). MPGN type 2 = DDD.",
    em: "DDD: Intramembranous osmiophilic (electron-dense) ribbon-like deposits — PATHOGNOMONIC. C3GN: Mesangial, subendothelial, subepithelial deposits without dense ribbon pattern.",
    key_pearl: "IF is the key discriminator: C3 dominant = C3G. Abundant Ig = immune-complex MPGN (treat underlying — SLE, hepatitis B/C, cryoglobulinaemia). DDD and C3GN both have C3 dominant but differ only on EM (ribbon vs non-ribbon deposits).",
    patterns: ["C3GN: mesangial/subendothelial/subepithelial deposits; heterogeneous morphology", "DDD: intramembranous ribbon deposits (sausage-shaped); high recurrence post-transplant (85%)", "C3 NeF (C3 nephritic factor): stabilises C3bBb convertase → persistent complement activation", "Genetic: CFH, CFI, MCP, C3, CFB mutations — test all C3G"],
    stains: ["C3 IF: positive (dominant)", "IgG, IgM, IgA IF: negative or trace", "Complement panel: CH50, AH50, Factor H, C3, C4"],
    grades: "No formal histological scoring system; C3G consensus paper (Sethi et al., KI 2012); activity + chronicity assessment",
    refs: "KDIGO 2021 C3G · Sethi S et al. KI 2012 (C3G definition) · ERKNet/ESPN C3G Network 2022",
    analyserLink: "/imaging-viewer",
  },
  PSGN: {
    title: "Post-infectious GN (PSGN / Post-Streptococcal GN)",
    lm: "Diffuse endocapillary proliferative GN: endocapillary (mesangial + endothelial) hypercellularity. Neutrophil infiltration in acute phase. No crescents in typical cases. Exudative GN appearance.",
    if: "Granular IgG + C3 in mesangium and capillary walls. 'Starry sky' or 'garland' pattern (large subepithelial deposits along GBM). C4d absent (alternative pathway activation). IgA minor.",
    em: "Subepithelial 'humps' (large dome-shaped electron-dense deposits on epithelial side of GBM) — PATHOGNOMONIC of PSGN. Present in acute phase; resolve in 8–12 weeks. Mesangial deposits also present.",
    key_pearl: "'Humps' (subepithelial deposits on EM) are pathognomonic but only present for 6–8 weeks — early biopsy maximises detection. By 6–8 weeks, C3 normalises (prolonged low C3 = C3G). ASO titre elevated 2–4 weeks post-throat infection; anti-DNase B more sensitive for skin infection.",
    patterns: ["Acute PSGN: humps + endocapillary proliferation + C3 low (recovers by 6–8 weeks)", "Atypical: persistent low C3 >8 weeks → consider C3G/MPGN + complement workup", "IgA-dominant post-infectious GN: older patients; diabetes; alcohol — different treatment"],
    stains: ["C3 IF: positive (mesangial + capillary)", "IgG IF: granular 'starry sky' pattern", "EM: subepithelial humps"],
    grades: "No formal grading — clinical context (post-strep, low C3, recovery) guides; biopsy rarely needed if classic presentation",
    refs: "KDIGO 2021 PSGN · Couser WG review, Kidney Int 2012 · Pediatr Nephrol 2015",
    analyserLink: "/imaging-viewer",
  },
  ANCA: {
    title: "ANCA-Associated Vasculitis (Pauci-immune RPGN)",
    lm: "Crescentic GN — cellular (acute) or fibrous (chronic) crescents in Bowman's space. Fibrinoid necrosis: coagulative necrosis of glomerular capillary tufts. Pauci-immune: minimal deposits on IF. Interstitial infiltrate (T cells, macrophages).",
    if: "PAUCI-IMMUNE: absent or trace Ig and complement on IF. This is the KEY feature — negative/trace IF in a patient with RPGN on LM points to ANCA vasculitis. (Distinguish from anti-GBM: linear IgG; immune-complex MPGN: granular Ig).",
    em: "Foot process effacement (in proportion to proteinuria). No immune-complex deposits (pauci-immune). Rupture of GBM at necrotic sites. Fibrin within crescents.",
    key_pearl: "Pauci-immune crescentic GN = ANCA vasculitis until proven otherwise. Test ANCA (PR3-ANCA / GPA; MPO-ANCA / MPA), anti-GBM antibody simultaneously. ANCA + anti-GBM double positive = worst prognosis (plasmapheresis required).",
    patterns: ["Focal (<25% crescents): best prognosis", "Crescentic (>50%): risk of ESKD", "Sclerotic pattern: late disease, irreversible — poor response to immunosuppression", "Mixed pattern (focal + sclerotic): intermediate", "Berden ANCA classification predicts outcome by crescent %, fibrosis"],
    stains: ["H&E: crescents, fibrinoid necrosis", "Fibrin special stain: confirms fibrinoid necrosis", "CD68: macrophage infiltration in crescents", "PAS silver: GBM rupture"],
    grades: "Berden ANCA Classification: Focal / Crescentic / Mixed / Sclerotic (Berden et al. JASN 2010)",
    refs: "KDIGO 2021 ANCA · ACR/EULAR 2019 classification criteria · Berden JASN 2010 · EULAR/ERA 2022",
    analyserLink: "/imaging-viewer",
  },
  ANTI_GBM: {
    title: "Anti-GBM Disease (Goodpasture Syndrome)",
    lm: "Severe crescentic GN (often >80% crescents) + fibrinoid necrosis. Rapidly progressive course. Identical to ANCA crescentic GN on LM alone.",
    if: "LINEAR IgG along GBM — PATHOGNOMONIC. (Thin, bright, continuous ribbon of IgG along all capillary walls). IgG4 subclass dominant. C3 linear also possible. Tubular basement membrane staining in some patients (lung affected).",
    em: "No immune-complex deposits (unlike PSGN or LN). GBM ruptures. Fibrin within crescents.",
    key_pearl: "Linear IgG IF = anti-GBM disease. This is the single most important IF pattern to know. Alport syndrome patients post-transplant can develop anti-GBM (de novo anti-GBM) — transplanted normal COL4A3/A4 collagen triggers an immune response in Alport patients who lack it.",
    patterns: ["Classical Goodpasture: anti-GBM + DAH (diffuse alveolar haemorrhage)", "Renal-limited anti-GBM (no lung involvement): 30%", "Double-positive (anti-GBM + ANCA): worst prognosis; PLEX + CYC + steroids urgently", "Post-transplant Alport: de novo anti-GBM antibody"],
    stains: ["IgG IF: linear pattern along GBM", "IgG subclass: IgG4 dominant in anti-GBM (vs IgG4 in MN — subepithelial not linear)", "C3: may be linear"],
    grades: "No formal grading; clinical: % crescents + serum creatinine at presentation predicts dialysis-free survival (>600 µmol/L at presentation → poor renal outcome despite PLEX)",
    refs: "KDIGO 2021 · Hellmark T & Segelmark M, CJASN 2014 · Pedchenko V, NEJM 2010",
    analyserLink: "/imaging-viewer",
  },
  NPHP: {
    title: "Nephronophthisis / Chronic Tubulointerstitial Nephritis",
    lm: "Tubular atrophy (small atrophic tubules); interstitial fibrosis (collagen deposition replacing tubules); corticomedullary cysts; tubular basement membrane thickening + irregularity (lamellation). Normal glomeruli until late.",
    if: "Negative IF (no immune-complex deposits). May see non-specific IgM in sclerotic areas.",
    em: "Tubular basement membrane thickening + lamellation/splitting. Normal GBM (early). No deposits.",
    key_pearl: "Tubular atrophy + interstitial fibrosis OUT OF PROPORTION to glomerular changes = NPHP/TIN pattern. Ciliopathy gene panel (NPHP1–20+) if clinical features match. Distinguish from reflux nephropathy (unilateral or bilateral? VUR?). NPHP: bilateral, no obstructive features.",
    patterns: ["NPHP biopsy: TBM changes + IF + corticomedullary cysts (if present on USS)", "Drug-induced TIN (NSAIDs, antibiotics, PPIs): eosinophilic infiltrate + no TBM changes", "Sarcoid TIN: non-caseating granulomas + eosinophils + elevated ACE", "IgG4-related TIN: storiform fibrosis + IgG4+ plasma cell infiltration"],
    stains: ["PAS: TBM thickening; tubular atrophy", "Masson trichrome: interstitial fibrosis (blue)", "CD68 + CD3: mononuclear infiltrate characterisation"],
    grades: "No formal NPHP grading; Banff criteria for TIN (semi-quantitative).",
    refs: "NPHP/Ciliopathy Consortium · Hildebrandt F, KI 2009 · Wolf MT, JASN 2013",
    analyserLink: "/imaging-viewer",
  },
  ALPORT: {
    title: "Alport Syndrome — GBM Biopsy Findings",
    lm: "Early: Normal or minimal mesangial expansion. Late: FSGS pattern (podocyte dropout → segmental sclerosis). Tubular atrophy in proportion to GBM damage. Foam cells (lipid-laden tubular cells) — non-specific.",
    if: "KEY: ABSENT or mosaic staining for COL4A3/4/5 antibodies on GBM — diagnostic. Normal kidneys stain uniformly for COL4A3 (Goodpasture antigen). X-linked Alport (COLA4A5): absent in males; mosaic/interrupted in carrier females. AR Alport (COL4A3/A4): absent in affected, mosaic in parents.",
    em: "BASKET-WEAVE GBM (irregular GBM with multilamellated splitting of lamina densa) — PATHOGNOMONIC of Alport syndrome. May show thinning first (thin GBM disease in carriers). Foot process effacement proportional to proteinuria.",
    key_pearl: "Thin GBM disease: thin uniform GBM without basket-weave pattern — carrier state or TBMN (HIVAN vs Alport spectrum). COL4A IF can be diagnostic: if negative for COL4A5 on kidney biopsy → X-linked Alport confirmed without genetic testing in males.",
    patterns: ["X-linked Alport (COL4A5): most common (85%); males affected; females carriers", "AR Alport (COL4A3/A4): both sexes equally affected; 15%", "Digenic Alport: COL4A3 + COL4A4 heterozygous double mutation", "Thin GBM disease: heterozygous COL4A3/4 → 10% progress to CKD", "Progressive: hearing loss + proteinuria + haematuria → ESKD 2nd–3rd decade in X-linked males"],
    stains: ["COL4A3 IF antibody: absent/mosaic (Alport) vs uniform (normal)", "COL4A5 IF antibody: absent in X-linked males (diagnostic)", "PAS: FSGS lesions in advanced disease", "Silver: GBM irregularity"],
    grades: "No formal histological grading. Molecular genetics + COL4A IF classification guides prognosis.",
    refs: "KDIGO 2021 Alport · Savige J, JASN 2013 · Rheault MN, Pediatr Nephrol 2012",
    analyserLink: "/imaging-viewer",
  },
  DM_NEPHRO: {
    title: "Diabetic Nephropathy",
    lm: "Early: Glomerular hypertrophy + GBM thickening + mesangial expansion. Advanced: Kimmelstiel-Wilson (KW) nodules (nodular glomerulosclerosis) — PATHOGNOMONIC. Diffuse mesangial sclerosis. Hyalinosis (Armanni-Ebstein). Arteriolar hyalinosis (afferent + efferent).",
    if: "Linear IgG + albumin in GBM (non-specific, due to trapping). No immune-complex deposits. Sometimes IgG4.",
    em: "GBM thickening + mesangial matrix expansion. No immune complex deposits. Foot process effacement if nephrotic-range proteinuria.",
    key_pearl: "Biopsy is NOT routinely done for diabetic nephropathy. Biopsy when: atypical features (haematuria, rapid decline, other autoimmune features, young onset without diabetes duration correlating with severity). Kimmelstiel-Wilson nodules may be seen in light-chain deposition disease (LCDD) — check for monoclonal light chains.",
    patterns: ["Diffuse glomerulosclerosis: most common", "Nodular glomerulosclerosis (KW): pathognomonic; associated with ≥10y diabetes duration", "Exudative lesions: hyalinosis caps, microaneurysms", "Arteriolar hyalinosis: both afferent + efferent (vs HT: afferent only)"],
    stains: ["PAS: mesangial expansion, KW nodules", "Silver: GBM thickening, mesangial matrix", "Masson trichrome: fibrosis"],
    grades: "Tervaert Classification: Class I–IV (Tervaert TW, JASN 2010). Clinical staging (albuminuria + eGFR decline) more commonly used.",
    refs: "Tervaert TW JASN 2010 (DN classification) · KDIGO 2022 Diabetes CKD · ADA 2023 microvascular complications",
    analyserLink: "/imaging-viewer",
  },
  TIN: {
    title: "Acute Tubulointerstitial Nephritis (TIN)",
    lm: "Oedematous interstitium; mononuclear infiltrate (lymphocytes + monocytes + plasma cells). Tubulitis (lymphocytes within tubular epithelium). Eosinophils prominent in drug-induced TIN (NSAIDs, beta-lactams, PPIs, sulphonamides). No glomerular changes (unless TINU syndrome).",
    if: "Non-specific or negative. IgG4-related TIN: IgG4+ plasma cells (>10/HPF + IgG4:IgG ratio >40%). Linear IgM or C3 in TBM (non-specific in some cases).",
    em: "No deposits. Interstitial oedema. Lymphocytic tubulitis. TBM normal (vs NPHP where TBM thickened/split).",
    key_pearl: "TINU syndrome (tubulointerstitial nephritis + uveitis): young girls; AKI + anterior uveitis; urinary beta-2-microglobulin elevated; responds well to steroids. Drug-induced TIN: stop offending drug → spontaneous resolution in 2–4 weeks. Steroids (prednisolone 1 mg/kg/day × 2–4 weeks) if no improvement.",
    patterns: ["Drug-induced (most common): PPIs, NSAIDs, penicillins, cephalosporins, sulphonamides, allopurinol", "Infectious TIN: CMV, EBV, hantavirus (viral); leptospirosis (bacterial)", "TINU: bilateral uveitis + TIN; elevated urinary beta-2-microglobulin", "IgG4-TIN: storiform fibrosis + IgG4 plasma cells + elevated serum IgG4", "Sarcoid TIN: non-caseating granulomas + elevated ACE + hypercalcaemia"],
    stains: ["H&E: infiltrate characterisation", "Eosinophil stain (Giemsa/eosinophil-specific): drug-induced TIN", "IgG4 IHC: IgG4-related TIN", "AFB + GMS: if TB or fungal TIN suspected"],
    grades: "No formal grading; activity (eosinophils, neutrophils, necrosis) vs chronicity (fibrosis, TBM changes) assessment",
    refs: "KDIGO 2021 TIN · Praga M, Semin Nephrol 2010 · Dumas K, JASN 2023",
    analyserLink: "/imaging-viewer",
  },
};

export default function RenalBiopsyEngine() {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("lm");
  const [search, setSearch] = useState("");

  const filtered = CONDITIONS.filter(c =>
    !search || c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const TABS = [
    { id: "lm", label: "Light Microscopy" },
    { id: "if", label: "Immunofluorescence" },
    { id: "em", label: "Electron Microscopy" },
    { id: "patterns", label: "Patterns" },
    { id: "stains", label: "Stains" },
    { id: "grades", label: "Grading" },
  ];

  if (selected) {
    const data = BIOPSY_DATA[selected];
    const cond = CONDITIONS.find(c => c.id === selected);
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Microscope className="w-5 h-5" />
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wide">Biopsy Engine →</p>
                <h3 className="font-bold text-sm">{data.title}</h3>
              </div>
            </div>
            <button onClick={() => { setSelected(null); setTab("lm"); }} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full border border-white/20 flex-shrink-0">← All Conditions</button>
          </div>
        </div>

        {/* Key Pearl */}
        <div className="rounded-xl bg-amber-50 border-2 border-amber-300 p-3">
          <p className="text-xs font-bold text-amber-900 mb-1">🔑 Key Clinical Pearl</p>
          <p className="text-xs text-amber-800">{data.key_pearl}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${tab === t.id ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <Card className="border-slate-200"><CardContent className="p-3">
          {tab === "lm" && <><p className="text-xs font-bold text-slate-700 mb-2">Light Microscopy Findings</p><p className="text-xs text-slate-700 leading-relaxed">{data.lm}</p></>}
          {tab === "if" && <><p className="text-xs font-bold text-slate-700 mb-2">Immunofluorescence Findings</p><p className="text-xs text-slate-700 leading-relaxed">{data.if}</p></>}
          {tab === "em" && <><p className="text-xs font-bold text-slate-700 mb-2">Electron Microscopy Findings</p><p className="text-xs text-slate-700 leading-relaxed">{data.em}</p></>}
          {tab === "patterns" && <><p className="text-xs font-bold text-slate-700 mb-2">Key Patterns & Variants</p>{data.patterns.map((p, i) => <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1"><ChevronRight className="w-3.5 h-3.5 mt-0.5 text-slate-500 flex-shrink-0" />{p}</div>)}</>}
          {tab === "stains" && <><p className="text-xs font-bold text-slate-700 mb-2">Special Stains & Techniques</p>{data.stains.map((s, i) => <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1"><ChevronRight className="w-3.5 h-3.5 mt-0.5 text-blue-500 flex-shrink-0" />{s}</div>)}</>}
          {tab === "grades" && <><p className="text-xs font-bold text-slate-700 mb-2">Classification / Grading</p><p className="text-xs text-slate-700">{data.grades}</p><div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg"><p className="text-xs font-bold text-blue-800">References</p><p className="text-xs text-blue-700">{data.refs}</p></div></>}
        </CardContent></Card>

        {/* AI Analyser Link */}
        <a href={data.analyserLink}
          className="flex items-center gap-2 p-3 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors">
          <Microscope className="w-4 h-4 flex-shrink-0" />
          <span>Open AI Biopsy Analyser — analyse biopsy images with AI</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
        </a>

        <Button variant="outline" className="w-full" onClick={() => { setSelected(null); setTab("lm"); }}><ArrowLeft className="w-4 h-4 mr-2" />Back to All Conditions</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Microscope className="w-5 h-5" />
          <h3 className="text-sm font-bold">Renal Biopsy Findings Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">{CONDITIONS.length} conditions</Badge>
        </div>
        <p className="text-xs text-slate-300">LM · IF · EM · Patterns · Grading — linked to AI Biopsy Analyser</p>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search: IgA, FSGS, lupus, ANCA, GBM…"
        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300"
      />

      <div className="space-y-2">
        {filtered.map(c => (
          <button key={c.id} onClick={() => { setSelected(c.id); setTab("lm"); }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all text-left">
            <div className="flex items-center gap-3">
              <span className={`w-9 h-9 rounded-lg ${c.badge} text-white flex items-center justify-center flex-shrink-0`}>
                <Microscope className="w-4 h-4" />
              </span>
              <div>
                <p className="font-semibold text-sm text-slate-900">{c.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.tags.slice(0, 3).join(" · ")}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>
        ))}
      </div>

      <a href="/imaging-viewer"
        className="flex items-center gap-2 p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
        <Microscope className="w-4 h-4" />
        <span>Open AI Biopsy Analyser — upload biopsy images for AI analysis</span>
        <ExternalLink className="w-3.5 h-3.5 ml-auto" />
      </a>
    </div>
  );
}