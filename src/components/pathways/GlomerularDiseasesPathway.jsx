import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, ExternalLink, Loader2, CheckCircle, BookOpen, Edit2, Save, X, Plus, Trash2, GitBranch, FileText, Dna, Zap } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useQuery } from "@tanstack/react-query";
import GlomerularDecisionEngine from "../nephrology/GlomerularDecisionEngine";
import LabTrendIntelligence from "../nephrology/LabTrendIntelligence";
import DialysisDecisionSupport from "../nephrology/DialysisDecisionSupport";

// ── Flowchart component (pure CSS/div based) ─────────────────────────────────
const FlowStep = ({ step, index, total, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-600 border-blue-700",
    red: "bg-red-600 border-red-700",
    green: "bg-green-600 border-green-700",
    amber: "bg-amber-500 border-amber-600",
    purple: "bg-purple-600 border-purple-700",
    slate: "bg-slate-600 border-slate-700"
  };
  return (
    <div className="flex flex-col items-center">
      <div className={`w-full rounded-lg px-3 py-2 text-white text-xs font-medium text-center border-b-2 ${colors[color]}`}>
        <span className="opacity-60 mr-1">{index}.</span>{step}
      </div>
      {index < total && <div className="w-0.5 h-4 bg-slate-300 my-1" />}
    </div>);

};

const DecisionNode = ({ question, yes, no }) =>
<div className="border-2 border-dashed border-amber-400 rounded-lg p-3 bg-amber-50 my-2">
    <p className="text-xs font-bold text-amber-900 text-center mb-2">❓ {question}</p>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-green-100 border border-green-300 rounded p-2 text-xs text-center">
        <span className="font-bold text-green-700">YES →</span><br />{yes}
      </div>
      <div className="bg-red-100 border border-red-300 rounded p-2 text-xs text-center">
        <span className="font-bold text-red-700">NO →</span><br />{no}
      </div>
    </div>
  </div>;


// ── Disease Data ─────────────────────────────────────────────────────────────
const DEFAULT_CONDITIONS = [
{
  id: "mcd",
  name: "Minimal Change Disease (MCD)",
  variants: ["Idiopathic MCD", "Secondary MCD (NSAID, malignancy)"],
  guideline: "KDIGO 2021 Glomerular Diseases",
  urgency: "high",
  tags: ["KDIGO", "Steroid-Sensitive", "Nephrotic"],
  category: "Nephrotic",
  pathology: "Light microscopy normal; EM shows diffuse podocyte foot process effacement (>75%)",
  genetics: "Usually not genetic; rare: PODXL, CD2AP variants",
  flowchart: [
  "Confirm Nephrotic Syndrome: edema + proteinuria >3.5g/day + albumin <3g/dL",
  "Rule out secondary causes: NSAID, lithium, lymphoma (Hodgkin's especially)",
  "Biopsy: usually not required in children (first episode) — empirical steroids",
  "Prednisone 60 mg/m² or 2 mg/kg/day (max 60 mg) × 4-6 weeks → taper",
  "Complete remission in >90% children within 4-6 weeks"],

  decisionNodes: [
  { q: "Steroid-sensitive (remission <4wks)?", yes: "Taper steroids, monitor for relapse", no: "Biopsy + consider CNI (Tacrolimus/CSA)" },
  { q: "Frequently relapsing (≥2 relapses/6mo)?", yes: "Steroid-sparing: MMF, Levamisole, CNI, Rituximab", no: "Treat each relapse with steroids" }],

  keyPoints: [
  "Children: empirical steroids without biopsy (first episode)",
  "Adults: biopsy recommended before treatment",
  "Standard steroids: Prednisolone 60 mg/m² for 4-6 weeks, then taper over 4-6 weeks",
  "Steroid-sensitive NS responds in >90% children — excellent prognosis",
  "Frequently relapsing: cyclophosphamide (2 mg/kg × 8-12 wks) induces sustained remission",
  "Rituximab: highly effective for steroid-dependent/frequently relapsing (anti-B-cell)",
  "MMF: useful steroid-sparing agent for mild frequently-relapsing",
  "Levamisole 2.5 mg/kg alternate days: cheap, effective immunomodulator (IAP endorsed)",
  "Vaccinations: pneumococcal, varicella BEFORE immunosuppression"],

  refs: [{ title: "KDIGO 2021 Glomerular Disease Guideline", url: "https://kdigo.org/guidelines/gd/" }]
},
{
  id: "fsgs",
  name: "FSGS (Focal Segmental Glomerulosclerosis)",
  variants: ["Primary FSGS", "Secondary FSGS (adaptive/viral)", "Genetic FSGS"],
  guideline: "KDIGO 2021 Glomerular Diseases",
  urgency: "high",
  tags: ["KDIGO", "Nephrotic", "Genetic Testing"],
  category: "Nephrotic",
  pathology: "Segmental glomerulosclerosis in some (focal) glomeruli; Tip, cellular, perihilar, NOS, collapsing variants",
  genetics: "NPHS1 (nephrin), NPHS2 (podocin), WT1, ACTN4, TRPC6, CD2AP — genetic testing mandatory",
  flowchart: [
  "Kidney biopsy with electron microscopy — foot process effacement + segmental sclerosis",
  "Genetic testing: podocyte gene panel (NPHS1, NPHS2, WT1, INF2, ACTN4, TRPC6)",
  "Classify: Primary (T-cell mediated) vs Secondary vs Genetic",
  "Primary FSGS: Prednisone 1 mg/kg/day × 4-16 weeks (max 80 mg)",
  "If steroid-resistant: CNI (Tacrolimus 0.1 mg/kg/day or Cyclosporin 3-5 mg/kg/day)"],

  decisionNodes: [
  { q: "Genetic FSGS (podocyte gene mutation)?", yes: "Avoid immunosuppression — ACEi/ARB + supportive", no: "Treat as primary FSGS with steroids" },
  { q: "Steroid-resistant (no remission at 16 wks)?", yes: "CNI + ACEi/ARB; consider biopsy for classification", no: "Taper steroids, monitor for relapse" }],

  keyPoints: [
  "Biopsy with electron microscopy and genetic testing essential",
  "Initial: Prednisone 1 mg/kg/day (max 80 mg) for up to 16 weeks for primary FSGS",
  "CNI (Tacrolimus/Cyclosporin) for steroid-resistant or steroid-dependent FSGS",
  "Rituximab for frequently relapsing/steroid-dependent after CNI failure",
  "ACE inhibitor/ARB mandatory for ALL FSGS patients with proteinuria",
  "Genetic FSGS: avoid immunosuppression, focus on supportive care",
  "Sparsentan (dual endothelin-angiotensin antagonist) FDA approved 2023 for FSGS",
  "Post-transplant recurrence risk 20-40% for primary FSGS — counsel pre-transplant",
  "Secondary FSGS (obesity, reflux, single kidney): treat underlying cause + ACEi"],

  refs: [{ title: "KDIGO 2021 Glomerular Disease Guideline", url: "https://kdigo.org/guidelines/gd/" }]
},
{
  id: "membranous",
  name: "Membranous Nephropathy (MN)",
  variants: ["Primary (PLA2R+/THSD7A+)", "Secondary MN (lupus, malignancy, Hep B)"],
  guideline: "KDIGO 2021 Glomerular Diseases",
  urgency: "high",
  tags: ["PLA2R", "Rituximab", "KDIGO"],
  category: "Nephrotic",
  pathology: "Subepithelial immune deposits; GBM 'spike' formation on silver stain; EM: subepithelial deposits",
  genetics: "HLA-DQA1 association; anti-PLA2R autoantibody in 70% primary MN",
  flowchart: [
  "Check PLA2R antibody, THSD7A antibody — titre correlates with activity",
  "Rule out secondary: ANA/dsDNA (lupus), HBsAg (Hep B), malignancy screen (>50y)",
  "Stratify risk: Low (<3.5g), Medium (3.5-8g stable), High (>8g or rising/falling GFR)",
  "Low risk: supportive (ACEi/ARB) ± watchful waiting (30% spontaneous remission)",
  "High risk: Rituximab preferred (KDIGO 2021) — 375 mg/m² × 4 or 1g × 2 doses"],

  decisionNodes: [
  { q: "High risk criteria (eGFR falling, proteinuria >8g, severe symptoms)?", yes: "Start Rituximab (first-line per KDIGO 2021)", no: "Watchful waiting 6 months + ACEi/ARB" },
  { q: "PLA2R titre falling after Rituximab?", yes: "Monitor — complete immunologic remission expected", no: "Repeat Rituximab or switch to Cyclophosphamide regimen" }],

  keyPoints: [
  "PLA2R antibody — key diagnostic and monitoring biomarker",
  "Spontaneous remission in 30-40% — watchful waiting acceptable in low risk",
  "First-line: Rituximab (preferred per KDIGO 2021) — 375 mg/m² × 4 doses OR 1 g × 2 doses",
  "Alternative: Cyclophosphamide + corticosteroid (Ponticelli regimen — 6 months alternating)",
  "Monitor PLA2R titres every 3 months to guide treatment response",
  "Anticoagulation: consider if albumin <2.5 g/dL (VTE risk high in membranous)",
  "Dual endothelin receptor antagonists (Sparsentan) — emerging evidence",
  "Childhood MN: usually secondary to Hep B, lupus — treat underlying cause"],

  refs: [{ title: "KDIGO 2021 Glomerular Disease Guideline", url: "https://kdigo.org/guidelines/gd/" }]
},
{
  id: "igan",
  name: "IgA Nephropathy (IgAN)",
  variants: ["Primary IgAN", "IgAV Nephritis (Henoch-Schönlein)", "Secondary IgAN"],
  guideline: "KDIGO 2021 + KDIGO 2024 IgAN Supplement",
  urgency: "medium",
  tags: ["KDIGO", "Oxford MEST-C", "SGLT2i", "Budesonide"],
  category: "Haematuria/Mixed",
  pathology: "Mesangial IgA deposits on IF; mesangial proliferation on LM; Oxford MEST-C score for prognosis",
  genetics: "Polygenic — galactose-deficient IgA1 (Gd-IgA1) as pathogenic antibody; no single causative gene",
  flowchart: [
  "Biopsy: IgA dominant/codominant on immunofluorescence → Oxford MEST-C scoring",
  "Baseline: eGFR, 24h proteinuria (or PCR), BP — assess 3-6 months on supportive care",
  "Supportive care (ALL): BP <125/75, ACEi/ARB titrated to max dose",
  "SGLT2i (Dapagliflozin 10 mg): KDIGO 2024 strongly recommended for all eligible",
  "Reassess proteinuria at 3-6 months on optimised supportive care"],

  decisionNodes: [
  { q: "Proteinuria >1g/day despite 3-6mo supportive care + eGFR >30?", yes: "Add: Targeted-release Budesonide (Nefecon 16 mg/day × 9mo)", no: "Continue supportive care + close monitoring" },
  { q: "Rapidly progressive IgAN (crescentic)?", yes: "Pulse steroids + consider cyclophosphamide", no: "Standard Oxford protocol-based management" }],

  keyPoints: [
  "Oxford MEST-C score guides histological risk stratification",
  "Supportive care FIRST: optimise BP (<125/75), ACEi/ARB for all with proteinuria",
  "SGLT2 inhibitors (Dapagliflozin 10 mg/day) — strongly recommended by KDIGO 2024",
  "Sparsentan (dual endothelin-angiotensin receptor antagonist) — FDA approved 2023",
  "Targeted-release budesonide (Nefecon/Tarpeyo): 16 mg/day for 9 months — approved for high-risk",
  "Systemic steroids: 6-month course if persistent proteinuria >1 g/day + eGFR >30",
  "IgAV nephritis in children: close monitoring, most recover without immunosuppression",
  "Atrasentan (endothelin-A receptor antagonist): ALIGN trial positive 2024 — emerging"],

  refs: [
  { title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" },
  { title: "KDIGO 2024 IgAN Update", url: "https://kdigo.org/guidelines/gd/" }]

},
{
  id: "psgn",
  name: "Post-Streptococcal GN (PSGN)",
  variants: ["Post-pharyngitis", "Post-impetigo", "Non-streptococcal infection-related GN"],
  guideline: "IPNA / KDIGO 2021",
  urgency: "medium",
  tags: ["PSGN", "Self-limiting", "Complement", "Infection"],
  category: "Haematuria/Mixed",
  pathology: "Diffuse endocapillary proliferation; 'humps' (subepithelial deposits) on EM; C3 dominant IF",
  genetics: "No genetic cause; HLA associations described",
  flowchart: [
  "Clinical diagnosis: haematuria/oedema 1-3 weeks after Group A Strep infection",
  "Confirm: ASOT titre, anti-DNAse B, low C3 (returns normal by 6-8 weeks)",
  "Throat/skin swab for culture; treat any active streptococcal infection",
  "Supportive care: salt/fluid restriction, antihypertensives (amlodipine, nifedipine)",
  "Monitor: urine protein/blood, C3, BP, kidney function weekly"],

  decisionNodes: [
  { q: "C3 remains low at 8 weeks?", yes: "Consider biopsy — rule out C3GN, MPGN, lupus", no: "Reassuring — PSGN resolves spontaneously" },
  { q: "Rapidly progressive renal failure (crescents suspected)?", yes: "Urgent biopsy + consider pulse steroids", no: "Continue supportive care — prognosis excellent" }],

  keyPoints: [
  "Self-limiting condition — excellent prognosis in children",
  "Occurs 1-3 weeks post-pharyngitis or 3-6 weeks post-impetigo",
  "C3 complement LOW (C4 normal — alternate pathway activation)",
  "ASOT elevated post-pharyngitis; anti-DNAse B elevated post-impetigo",
  "No specific immunosuppressive treatment needed in typical cases",
  "Treat active strep: penicillin V 10 days (does NOT prevent GN but clears infection)",
  "Antihypertensives: diuretics (furosemide) + calcium channel blockers as needed",
  "Red flags: anuria, severe hypertension, C3 low beyond 8 weeks, rising creatinine → biopsy",
  "Long-term outcome excellent; rare progression to CKD (<5%)"],

  refs: [{ title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" }]
},
{
  id: "mpgn",
  name: "MPGN (Membranoproliferative GN)",
  variants: ["Immune-complex MPGN", "Complement-mediated MPGN (C3G)"],
  guideline: "KDIGO 2021 + IPNA C3G Guidance",
  urgency: "high",
  tags: ["Complement", "Infection", "MPGN", "C3GN"],
  category: "Mixed",
  pathology: "Mesangial and endocapillary proliferation + GBM duplication ('tram-track'). IF pattern guides further classification.",
  genetics: "Complement gene variants (CFH, CFI, CD46, CFB, C3) in complement-mediated MPGN",
  flowchart: [
  "Biopsy: MPGN pattern identified — proceed to immunofluorescence (IF)",
  "IF: IgG/IgM/C3 deposits → Immune-complex MPGN; C3 dominant → C3 Glomerulopathy",
  "Work-up: C3, C4, CH50, AH50, ANCA, ANA, cryoglobulins, hepatitis B/C, M-protein",
  "Immune-complex MPGN: treat underlying cause (infection, autoimmune, paraprotein)",
  "C3 glomerulopathy: complement work-up + genetic panel"],

  decisionNodes: [
  { q: "IF: C3 dominant (C3GN or DDD)?", yes: "See C3 Glomerulopathy pathway below", no: "Immune-complex MPGN — identify and treat trigger" },
  { q: "Underlying infection identified (HCV, HBV)?", yes: "Treat infection — GN often resolves with viral clearance", no: "Rule out paraprotein/autoimmune — consider IST" }],

  keyPoints: [
  "MPGN is a pattern, not a diagnosis — identify underlying cause",
  "Immune-complex MPGN: most common cause is Hepatitis C, HBV, SBE, cryoglobulinemia",
  "Complement-mediated MPGN (C3G): abnormal complement regulation — genetic work-up",
  "HCV-associated: treat with DAA (Direct-Acting Antivirals) — GN improves with viral clearance",
  "Autoimmune MPGN: rituximab or immunosuppression for systemic disease",
  "Monoclonal immunoglobulin-associated: treat haematological disorder",
  "ACEi/ARB for all — proteinuria reduction"],

  refs: [{ title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" }]
},
{
  id: "c3gn",
  name: "C3 Glomerulopathy (C3GN / DDD)",
  variants: ["C3 Glomerulonephritis", "Dense Deposit Disease (DDD)"],
  guideline: "KDIGO 2021 + IPNA C3G Guidance",
  urgency: "high",
  tags: ["Complement", "C3", "Iptacopan", "Eculizumab"],
  category: "Mixed",
  pathology: "C3 dominant on IF; EM: C3GN = mesangial/subendothelial discrete deposits; DDD = dense transformation of GBM lamina densa",
  genetics: "CFH, CFI, CD46 (MCP), CFB, C3 pathogenic variants; C3 nephritic factor (C3NeF) antibody",
  flowchart: [
  "IF: C3 dominant or codominant — EM to distinguish C3GN vs DDD",
  "Complement panel: C3, C4, CH50, AH50, Factor H, Factor I, Factor B",
  "Antibodies: anti-Factor H IgG, C3 nephritic factor (C3NeF), anti-C4NeF",
  "Genetic panel: CFH, CFI, CD46, CFB, C3, CFHR1-5",
  "Assess disease activity: proteinuria, GFR trend, histology"],

  decisionNodes: [
  { q: "Anti-Factor H antibodies positive?", yes: "Plasma exchange + steroids/rituximab + eculizumab", no: "MMF ± low-dose steroids if progressive" },
  { q: "Rapidly progressive or severe?", yes: "Eculizumab (anti-C5) or Iptacopan (Factor B inhibitor)", no: "MMF + supportive care + monitor" }],

  keyPoints: [
  "Comprehensive complement work-up before treatment",
  "Kidney biopsy: EM distinguishes C3GN (mesangial deposits) vs DDD (dense GBM transformation)",
  "Anti-Factor H antibodies positive: plasma exchange + immunosuppression",
  "Mycophenolate mofetil ± low-dose steroids for progressive C3GN",
  "Eculizumab (anti-C5): consider for severe/rapidly progressive — evidence limited",
  "Iptacopan (Factor B inhibitor): APPEAR-C3G trial positive 2023 — now approved in USA",
  "C3NeF-positive: may respond to rituximab",
  "Post-transplant recurrence: 50-80% DDD, 30-60% C3GN — counsel families",
  "Monitor C3 levels as disease activity marker"],

  refs: [{ title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" }]
},
{
  id: "lupus",
  name: "Lupus Nephritis (LN)",
  variants: ["Class III/IV (Proliferative)", "Class V (Membranous LN)", "Mixed III+V or IV+V"],
  guideline: "ACR/EULAR 2019 + KDIGO 2021",
  urgency: "critical",
  tags: ["ACR", "EULAR", "KDIGO", "HCQ", "Voclosporin"],
  category: "Autoimmune",
  pathology: "ISN/RPS 2003 classification Class I-VI; wire-loop lesions, full-house IF (IgG+IgM+IgA+C3+C1q), 'fingerprint' deposits EM",
  genetics: "HLA-DR3, C1q deficiency, DNase1L3 variants; TREX1, IFIH1 in familial SLE",
  flowchart: [
  "Confirm SLE: ACR/EULAR criteria — ANA, dsDNA, complement, urine analysis",
  "Kidney biopsy mandatory — ISN/RPS classification guides ALL treatment decisions",
  "ALL patients: Hydroxychloroquine 5 mg/kg/day (max 400 mg) — start immediately",
  "Class I/II: supportive care ± HCQ",
  "Class III/IV: MMF induction (1.5-3 g/day) OR low-dose CYC + pulse steroids"],

  decisionNodes: [
  { q: "Class III/IV LN — suitable for Voclosporin triple therapy?", yes: "Voclosporin + MMF + steroids (FDA approved 2021, superior CR)", no: "Standard MMF/CYC + steroids" },
  { q: "Incomplete response at 6 months?", yes: "Switch induction agent OR add Belimumab (anti-BLyS)", no: "Progress to maintenance: MMF 1-2 g/day" }],

  keyPoints: [
  "Kidney biopsy mandatory — ISN/RPS 2003 classification drives all treatment",
  "ALL patients: Hydroxychloroquine 5 mg/kg/day — reduces flares, protects kidney long-term",
  "Class III/IV: MMF (low-dose regimen 1.5-3 g/day preferred) OR NIH CYC regimen",
  "Voclosporin (Lupkynis) + MMF + steroids — FDA approved 2021, superior CR rates",
  "Belimumab (anti-BLyS): add-on therapy for Class III/IV — BLISS-LN trial, approved 2020",
  "Class V: ACEi/ARB ± CNI if proteinuria >3 g; MMF if not responding",
  "Target: proteinuria <0.5-0.7 g/g at 12 months, stable eGFR",
  "Maintenance: MMF 1-2 g/day preferred over azathioprine for most",
  "Pediatric LN: higher disease burden, more aggressive IST often needed"],

  refs: [
  { title: "ACR/EULAR LN Guidelines 2019", url: "https://www.rheumatology.org/Practice-Quality/Clinical-Support/Clinical-Practice-Guidelines/Lupus-Nephritis" },
  { title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" }]

},
{
  id: "antigbm",
  name: "Anti-GBM Disease (Goodpasture Syndrome)",
  variants: ["Pulmonary-Renal Syndrome", "Renal-limited Anti-GBM", "ANCA + Anti-GBM (double positive)"],
  guideline: "KDIGO 2021 Glomerular Diseases",
  urgency: "critical",
  tags: ["Anti-GBM", "Emergency", "Plasma Exchange", "COL4A3"],
  category: "Autoimmune",
  pathology: "Pauci-immune or immune-complex crescentic GN; linear IgG along GBM on IF; anti-GBM antibodies against NC1 domain of COL4A3",
  genetics: "HLA-DRB1*15:01 strongly associated; anti-COL4A3 NC1 antibody is pathogenic",
  flowchart: [
  "EMERGENCY: anti-GBM antibody positive — check ANCA simultaneously (dual positive ~30%)",
  "CXR/CT: pulmonary haemorrhage (Goodpasture) — may need ventilatory support",
  "Urgent kidney biopsy if possible: crescentic GN, linear IgG",
  "Plasma exchange: 4L daily × 14 days or until antibody undetectable (mandatory)",
  "Prednisolone 1 mg/kg/day + Cyclophosphamide 2-3 mg/kg/day"],

  decisionNodes: [
  { q: "Oliguria/dialysis-dependent at presentation (creatinine >600 umol/L)?", yes: "Very poor renal prognosis — dialysis likely permanent; treat for lung disease", no: "Aggressive treatment — realistic chance of renal recovery" },
  { q: "Pulmonary haemorrhage present?", yes: "ICU + plasma exchange + steroids — treat urgently", no: "Standard regimen; avoid immunosuppression excess" }],

  keyPoints: [
  "MEDICAL EMERGENCY — start plasma exchange immediately",
  "Anti-GBM antibodies against NC1 domain of COL4A3 (alpha-3 chain of type IV collagen)",
  "Plasma exchange 4 litres daily × 14 days — removes circulating pathogenic antibodies",
  "Cyclophosphamide 2 mg/kg/day + high-dose prednisolone",
  "Monitor antibody titres: treatment until undetectable",
  "Renal prognosis depends on creatinine at presentation — <500 μmol/L = better outcome",
  "Once dialysis-dependent with >50% crescents at presentation — unlikely to recover function",
  "Avoid transplant until antibody negative for >12 months",
  "ANCA double-positive: treat both — better prognosis than classic anti-GBM alone"],

  refs: [{ title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" }]
},
{
  id: "aahu",
  name: "aHUS (Atypical HUS) / TMA",
  variants: ["Complement-mediated TMA", "STEC-HUS (typical)", "DGKE TMA", "Secondary TMA"],
  guideline: "KDIGO 2021 + International aHUS Registry",
  urgency: "critical",
  tags: ["Eculizumab", "Ravulizumab", "TMA", "Complement"],
  category: "TMA",
  pathology: "Thrombotic microangiopathy: platelet thrombi in small vessels; MAHA, thrombocytopenia, AKI triad",
  genetics: "CFH, CFI, CD46, CFB, C3, THBD, DGKE, CFH/CFHR1-5 deletions; anti-CFH antibodies",
  flowchart: [
  "EMERGENCY: confirm TMA (MAHA + thrombocytopenia + AKI). Check ADAMTS13 to exclude TTP",
  "STEC-HUS (D+): stool culture + Shiga toxin PCR. SUPPORTIVE CARE ONLY",
  "aHUS: start Eculizumab IMMEDIATELY — do not wait for genetic results",
  "Complement panel BEFORE eculizumab: C3, C4, CFH, CFI, anti-CFH Ab",
  "Meningococcal vaccine (B + ACWY) + penicillin V prophylaxis"],

  decisionNodes: [
  { q: "STEC-HUS (D+ with bloody diarrhoea + positive culture)?", yes: "Supportive ONLY — NO antibiotics, NO antiplatelets, NO eculizumab", no: "aHUS pathway — start eculizumab immediately" },
  { q: "Anti-CFH antibodies positive?", yes: "Plasma exchange + steroids/rituximab + eculizumab", no: "Eculizumab alone — duration depends on genetic variant" }],

  keyPoints: [
  "EMERGENCY — aggressive supportive care: fluid management, dialysis if needed",
  "STEC-HUS (D+): supportive care ONLY. Avoid antibiotics, antidiarrhoeals, antiplatelets",
  "Complement panel BEFORE treatment: C3, C4, CH50, AH50, CFH, CFI, anti-CFH Ab",
  "Genetic testing: CFH, CFI, CD46, CFB, C3, THBD, DGKE — guides prognosis and duration",
  "Eculizumab (anti-C5): START IMMEDIATELY if aHUS suspected",
  "Ravulizumab (long-acting anti-C5): every 8 weeks, now preferred over eculizumab",
  "Meningococcal vaccination BEFORE or at start of eculizumab (B + ACWY)",
  "Prophylactic penicillin V 250 mg BD during eculizumab treatment",
  "Duration: gene-specific (CFH = often lifelong; CD46 = can attempt stopping after remission)"],

  refs: [{ title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" }]
},
{
  id: "anca",
  name: "ANCA-Associated GN (Vasculitis)",
  variants: ["MPA (MPO-ANCA)", "GPA (PR3-ANCA)", "Pauci-immune crescentic GN"],
  guideline: "ACR/EULAR 2022 + KDIGO 2021",
  urgency: "critical",
  tags: ["ANCA", "Rituximab", "Avacopan", "Crescentic"],
  category: "Autoimmune",
  pathology: "Pauci-immune necrotizing crescentic GN; few/no immune deposits on IF; ANCA positive serology",
  genetics: "HLA-DP associations; no single gene; PR3-ANCA vs MPO-ANCA have distinct genetic backgrounds",
  flowchart: [
  "EMERGENCY: acute GN + ANCA positive — urgent biopsy + start treatment",
  "Check: PR3-ANCA, MPO-ANCA, ANCA ELISA + IIF, anti-GBM (dual positive)",
  "Induction: Rituximab 375 mg/m² × 4 OR pulse CYC + pulse steroids (methylprednisolone)",
  "Avacopan (C5a receptor inhibitor) — steroid-sparing, approved 2021",
  "Plasma exchange: serum creatinine >500 μmol/L or diffuse alveolar haemorrhage"],

  decisionNodes: [
  { q: "Severe (Cr >500 μmol/L or pulmonary haemorrhage)?", yes: "Plasma exchange + Rituximab/CYC + high-dose steroids", no: "Rituximab OR CYC induction + Avacopan (steroid-sparing)" },
  { q: "PR3-ANCA (GPA)?", yes: "Rituximab preferred — lower relapse rate", no: "MPO-ANCA: Rituximab or CYC equally effective" }],

  keyPoints: [
  "Urgent kidney biopsy — pauci-immune necrotizing crescentic GN",
  "Induction (severe): Rituximab 375 mg/m² × 4 OR pulse Cyclophosphamide + pulse steroids",
  "Avacopan (C5a receptor inhibitor) approved 2021 — steroid-sparing induction",
  "Plasma exchange: consider if serum creatinine >500 μmol/L or DAH",
  "Maintenance: Rituximab 500 mg every 6 months for 2 years (preferred) OR Azathioprine",
  "PR3-ANCA more prone to relapse than MPO-ANCA",
  "Trimethoprim-sulfamethoxazole prophylaxis during immunosuppression",
  "Monitor ANCA titres during maintenance — rise may predict relapse"],

  refs: [
  { title: "ACR/EULAR ANCA Vasculitis Guidelines 2022", url: "https://www.rheumatology.org/Practice-Quality/Clinical-Support/Clinical-Practice-Guidelines/Vasculitis" },
  { title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" }]

},
{
  id: "diabetic_nephropathy",
  name: "Diabetic Nephropathy / DKD",
  variants: ["Type 1 DM-related", "Type 2 DM-related", "Non-diabetic GN in DM"],
  guideline: "KDIGO 2022 Diabetes + CKD Guideline",
  urgency: "high",
  tags: ["SGLT2i", "Finerenone", "GLP-1", "KDIGO 2022"],
  category: "Mixed",
  pathology: "Mesangial expansion, glomerular basement membrane thickening, nodular sclerosis (Kimmelstiel-Wilson lesions), arteriolar hyalinosis. Class I-IV (Tervaert classification).",
  genetics: "Polygenic risk. APOL1 variants increase DKD progression in African ancestry. ACE I/D, eNOS polymorphisms associated.",
  flowchart: [
  "Screen annually: urine ACR, eGFR, BP from DM diagnosis (T1DM: 5y after onset; T2DM: at diagnosis)",
  "Optimise glycaemic control: HbA1c target <7% (individualised) — SGLT2i preferred over sulfonylurea",
  "BP target <130/80 mmHg: ACEi or ARB mandatory if uACR >30 mg/g",
  "SGLT2i (Empagliflozin/Dapagliflozin): KDIGO 2022 first-line for all CKD + DM (eGFR ≥20)",
  "Finerenone (non-steroidal MRA): add if persistent albuminuria despite ACEi/SGLT2i"],

  decisionNodes: [
  { q: "eGFR >20 and tolerated?", yes: "SGLT2i (Empagliflozin 10mg or Dapagliflozin 10mg) — first-line", no: "SGLT2i contraindicated; optimise ACEi/ARB + Finerenone" },
  { q: "ACR >300 mg/g despite ACEi/SGLT2i?", yes: "Add Finerenone (FIDELITY programme, 20mg od) — reduces CKD progression + CV events", no: "Continue current regimen; monitor ACR 3-6 monthly" }],

  keyPoints: [
  "SGLT2i (Empagliflozin/Dapagliflozin 10mg) — first-line for DKD regardless of HbA1c",
  "ACEi/ARB mandatory for albuminuria >30 mg/g — do NOT combine both",
  "Finerenone (non-steroidal MRA) — FIDELIO-DKD + FIGARO-DKD trials show 25% CKD progression reduction",
  "GLP-1 RA (Semaglutide) — cardiovascular and renal benefit, especially with obesity",
  "BP target <130/80 mmHg",
  "Avoid nephrotoxins: NSAIDs, gadolinium, contrast (prehydration protocol if unavoidable)",
  "Biopsy if: atypical features, rapid decline, no retinopathy in T1DM, haematuria",
  "Referral: eGFR <30 or rapid decline, ACR >300 mg/g, uncontrolled hypertension"],

  refs: [{ title: "KDIGO 2022 Diabetes + CKD Guideline", url: "https://kdigo.org/guidelines/diabetes-ckd/" }]
},
{
  id: "thin_gbm",
  name: "Thin GBM Disease / Benign Familial Haematuria",
  variants: ["Isolated thin GBM", "COL4A3/4 heterozygous (Alport carrier)", "CFHR5 nephropathy"],
  guideline: "KDIGO 2021 + KDIGO 2024 Alport",
  urgency: "medium",
  tags: ["COL4A3/4", "Haematuria", "Genetic Testing"],
  category: "Haematuria/Mixed",
  pathology: "EM: diffuse uniform thinning of GBM (<150nm in adults, <180nm in children). LM: normal. IF: normal. Overlap with heterozygous Alport.",
  genetics: "COL4A3 or COL4A4 heterozygous variants in up to 40% of cases — these patients are NOT simple 'carriers'; some progress to CKD.",
  flowchart: [
  "Persistent microscopic haematuria with normal/thin GBM on biopsy",
  "Genetic testing: COL4A3, COL4A4 (AR Alport carriers), COL4A5",
  "Family history: haematuria across multiple generations suggests thin GBM / Alport carrier",
  "Annual monitoring: eGFR, proteinuria, BP — most have benign course",
  "If proteinuria develops: treat as early Alport — ACEi/ARB"],

  decisionNodes: [
  { q: "COL4A3/4 heterozygous variant found?", yes: "Reclassify as ADAS (Autosomal Dominant Alport) — 20-30% progress to CKD; treat as Alport", no: "True thin GBM — reassure, monitor annually, excellent prognosis" },
  { q: "Proteinuria >0.5g/day at any point?", yes: "Start ACEi — may delay progression as in Alport", no: "Annual review only — no treatment needed" }],

  keyPoints: [
  "Most patients have excellent long-term prognosis — reassure",
  "Up to 40% harbour COL4A3/4 heterozygous variants — genetic testing important",
  "COL4A3/4 het = Autosomal Dominant Alport Syndrome (ADAS) — NOT benign carrier",
  "ADAS: 20-30% reach ESKD by mid-life — treat as Alport with early ACEi",
  "Annual monitoring: eGFR, urine PCR, BP — lifelong",
  "Cascade family testing recommended if COL4A3/4 found",
  "No specific treatment for true thin GBM; ACEi when proteinuria develops"],

  refs: [{ title: "KDIGO 2024 Alport/COL4 Spectrum", url: "https://kdigo.org/guidelines/alport-syndrome/" }]
},
{
  id: "igg4_related",
  name: "IgG4-Related Kidney Disease (IgG4-RKD)",
  variants: ["Tubulointerstitial nephritis (IgG4-TIN)", "Membranous-like GN with IgG4", "Mass-forming lesion"],
  guideline: "ACR 2019 IgG4-RD Classification + KDIGO 2021",
  urgency: "medium",
  tags: ["IgG4", "Steroids", "Rituximab", "TIN"],
  category: "Autoimmune",
  pathology: "Dense lymphoplasmacytic infiltrate rich in IgG4+ plasma cells (>10/HPF); storiform fibrosis; obliterative phlebitis. IF: IgG4 subclass dominant deposits.",
  genetics: "HLA-DRB1*04:05 association; no single causative gene; autoimmune predisposition.",
  flowchart: [
  "Elevated serum IgG4 (>135 mg/dL) + kidney dysfunction / renal mass on imaging",
  "Kidney biopsy: IgG4+ plasma cells >10/HPF + storiform fibrosis",
  "Check: serum IgG4, IgG subclasses, complement (often low), ANA, ANCA",
  "Exclude: lymphoma, plasma cell dyscrasia, other autoimmune conditions",
  "Prednisone 0.6 mg/kg/day × 4 weeks, then taper — response often dramatic"],

  decisionNodes: [
  { q: "Steroid response (significant improvement in 4 weeks)?", yes: "Taper to maintenance 5-10 mg/day × 6-12 months", no: "Add Rituximab (first-line steroid-sparing); re-biopsy if uncertain" },
  { q: "Relapse during/after taper?", yes: "Rituximab 1g × 2 doses — superior relapse prevention to steroids alone", no: "Continue maintenance steroids 12 months then cautious discontinuation" }],

  keyPoints: [
  "Dramatic response to corticosteroids — if no response, reconsider diagnosis",
  "Serum IgG4 elevated in ~60-70% — NOT diagnostic alone (false positives in pancreatic cancer, infections)",
  "Pathological classification: ACR 2019 criteria require IgG4+/IgG+ cells >40% ratio + >10 IgG4+/HPF",
  "Extra-renal involvement: pancreas (AIP), bile ducts (PSC-like), orbit, salivary glands — check whole body",
  "Rituximab 1g × 2 doses: superior for maintenance, especially relapsing disease",
  "Risk of renal fibrosis with delayed treatment — act promptly",
  "Serum IgG4 as disease activity marker during treatment"],

  refs: [{ title: "ACR/EULAR IgG4-RD Classification Criteria 2019", url: "https://www.rheumatology.org/" }]
},
{
  id: "congenital_nephrotic",
  name: "Congenital Nephrotic Syndrome (CNS)",
  variants: ["Finnish Type (NPHS1)", "Diffuse Mesangial Sclerosis (NPHS2/WT1)", "Pierson Syndrome (LAMB2)", "Other genetic CNS"],
  guideline: "IPNA Clinical Guidelines + ESPN CNS Guideline 2021",
  urgency: "critical",
  tags: ["NPHS1", "NPHS2", "Genetic", "No Steroids", "Transplant"],
  category: "Nephrotic",
  pathology: "Finnish type: microcystic dilation of proximal tubules on LM; massive proteinuria from birth. DMS: mesangial sclerosis, podocyte hypertrophy. LAMB2: laminin beta2 deficiency + ocular abnormalities.",
  genetics: "NPHS1 (nephrin — Finnish type), NPHS2 (podocin — SRNS), WT1 (DMS + Wilms/gonadal), LAMB2 (Pierson), PLCE1, PODXL, PTPRO. Genetic testing mandatory.",
  flowchart: [
  "Nephrotic syndrome at birth to 3 months: massive proteinuria, oedema, low albumin",
  "Genetic panel: NPHS1, NPHS2, WT1, LAMB2, PLCE1 — guides ALL management",
  "DO NOT give steroids — genetic CNS does not respond",
  "Supportive: albumin infusions, nutrition (NG/nasogastric), anticoagulation (VTE risk)",
  "Bilateral nephrectomy + dialysis bridge to transplant (usually age 1-2y, weight >8kg)"],

  decisionNodes: [
  { q: "WT1 mutation identified?", yes: "Wilms tumour surveillance (renal USS q3mo till age 8) + gonadal dysgenesis assessment", no: "If NPHS1/2: nephrectomy + transplant — excellent outcomes, no recurrence" },
  { q: "Post-transplant proteinuria (NPHS1)?", yes: "Circulating anti-nephrin antibodies — treat as recurrent focal nephropathy; plasmapheresis/rituximab", no: "Monitor — long-term transplant outcomes excellent for NPHS1/2" }],

  keyPoints: [
  "DO NOT give immunosuppression — genetic CNS does NOT respond to steroids",
  "Genetic testing MANDATORY before any treatment decision",
  "Supportive care: albumin infusions 20-25% q12-24h, high-protein feeds via NG",
  "Anticoagulation: prophylactic heparin/LMWH for VTE risk (albumin <20 g/L)",
  "Bilateral nephrectomy when medical management no longer sustainable",
  "Kidney transplant: excellent outcomes for NPHS1 and NPHS2 — near-zero recurrence",
  "WT1 (DMS): Wilms tumour surveillance + gonadal assessment — DSD management",
  "LAMB2 (Pierson): microcoria + severe lens abnormalities — ophthalmology from birth",
  "Indian context: NPHS2 p.Arg229Gln common but low penetrance alone — check for compound het"],

  refs: [
  { title: "IPNA Clinical Practice Recommendations on CNS 2021", url: "https://www.ipna.info/" },
  { title: "ESPN CNS Working Group Guideline", url: "https://www.espn.eu/" }]

},
{
  id: "fibrillary_gn",
  name: "Fibrillary GN / Immunotactoid GN",
  variants: ["Fibrillary GN (random fibrils 10-30nm)", "Immunotactoid GN (organised microtubules >30nm)", "DNAJB9-associated Fibrillary GN"],
  guideline: "KDIGO 2021 Glomerular Diseases",
  urgency: "high",
  tags: ["DNAJB9", "Fibrils", "Rare", "Rituximab"],
  category: "Mixed",
  pathology: "EM: randomly arranged fibrils (10-30nm diameter) in fibrillary GN vs organised microtubular deposits (>30nm) in immunotactoid. LM: mesangial/endocapillary proliferation or membranous pattern. IF: polyclonal IgG (fibrillary) vs monoclonal (immunotactoid).",
  genetics: "DNAJB9 — a heat-shock protein family chaperone — highly specific marker for fibrillary GN on IHC (near 100% sensitivity).",
  flowchart: [
  "Biopsy shows non-amyloid fibrillary deposits — EM measurement critical (10-30nm vs >30nm)",
  "Congo red negative (distinguishes from amyloid)",
  "DNAJB9 IHC staining: positive confirms fibrillary GN (high sensitivity/specificity)",
  "Immunotactoid: serum protein electrophoresis, bone marrow biopsy — exclude monoclonal gammopathy",
  "No standard treatment: Rituximab used most commonly; immunosuppression guided by proteinuria/GFR trajectory"],

  decisionNodes: [
  { q: "Monoclonal protein identified (Immunotactoid GN)?", yes: "Treat haematological disorder — chemotherapy/autologous SCT as appropriate", no: "Fibrillary GN: Rituximab if proteinuria >3.5g/day or declining eGFR" },
  { q: "Rapidly progressive clinical course?", yes: "Rituximab + steroids; consider plasma exchange if crescents", no: "ACEi/ARB + close monitoring; Rituximab if progressive" }],

  keyPoints: [
  "Congo red NEGATIVE — critical to distinguish from amyloid",
  "DNAJB9 IHC: novel highly specific marker for fibrillary GN — request routinely",
  "EM essential: fibrils 10-30nm (fibrillary) vs microtubules >30nm (immunotactoid)",
  "Immunotactoid: almost always associated with monoclonal gammopathy — MGUS, CLL, myeloma",
  "No FDA-approved treatment; Rituximab most commonly used for fibrillary GN",
  "30-50% progress to ESKD within 10 years",
  "Recurrence post-transplant: possible in fibrillary GN"],

  refs: [{ title: "KDIGO 2021 GN Guideline", url: "https://kdigo.org/guidelines/gd/" }]
},
{
  id: "alport",
  name: "Alport Syndrome / COL4 Nephropathy",
  variants: ["X-linked Alport (XLAS)", "Autosomal Recessive (ARAS)", "Autosomal Dominant (ADAS)"],
  guideline: "KDIGO 2024 Alport Syndrome Guideline",
  urgency: "medium",
  tags: ["COL4A3/4/5", "Genetic", "ACEi", "Hearing Loss"],
  category: "Genetic",
  pathology: "EM: irregular thinning/thickening/lamellation of GBM ('basket-weave'); no immune deposits; COL4A3/4/5 absent on IF (anti-Alport staining)",
  genetics: "COL4A3, COL4A4 (AR/AD ARAS/ADAS); COL4A5 (X-linked XLAS); GBM type IV collagen",
  flowchart: [
  "Haematuria + family history of kidney disease/hearing loss — suspect Alport",
  "Genetic testing: COL4A3, COL4A4 (AR/AD), COL4A5 (X-linked) — diagnostic",
  "Kidney biopsy: EM shows irregular GBM; anti-Alport IF (COL4A3/4/5 absent)",
  "Start ACEi when proteinuria >0.5 g/day (slows progression — KDIGO 2024)",
  "Annual monitoring: BP, creatinine, proteinuria, audiometry, ophthalmology"],

  decisionNodes: [
  { q: "X-linked female (heterozygous COL4A5)?", yes: "Do NOT dismiss as 'carrier' — 15-30% reach ESKD; treat like affected", no: "Hemizygous male XLAS: aggressive ACEi + SGLT2i" },
  { q: "Proteinuria >1g/day despite ACEi?", yes: "Add SGLT2i (KDIGO 2024 supports) + consider Sparsentan (ReSolve trial)", no: "Continue ACEi, annual review, cascade family testing" }],

  keyPoints: [
  "Genetic testing: COL4A3, COL4A4, COL4A5 — diagnostic; biopsy for confirmation",
  "Early ACEi (Ramipril/Enalapril) shown to slow progression — start when proteinuria >0.5 g/day",
  "SGLT2 inhibitors: emerging evidence for renoprotection — KDIGO 2024 supports early use",
  "Hearing testing: annual audiometry (sensorineural hearing loss — high frequency)",
  "Ophthalmology: lenticonus (pathognomonic), macular fleck retinopathy screening",
  "Cascade genetic testing of ALL first-degree relatives",
  "Females with XLAS: significant kidney risk — do not undertreat as 'carriers'",
  "Transplant: excellent outcomes; anti-GBM disease rare post-transplant",
  "Sparsentan (ReSolve trial) ongoing for Alport syndrome"],

  refs: [{ title: "KDIGO 2024 Alport Syndrome Guideline", url: "https://kdigo.org/guidelines/alport-syndrome/" }]
}];


const urgencyColors = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-amber-100 text-amber-800 border-amber-300",
  medium: "bg-blue-100 text-blue-800 border-blue-300"
};

const urgencyLabel = { critical: "🔴 Critical Emergency", high: "🟠 High Priority", medium: "🔵 Standard" };

const categoryColors = {
  Nephrotic: "bg-indigo-100 text-indigo-700",
  "Haematuria/Mixed": "bg-pink-100 text-pink-700",
  Autoimmune: "bg-orange-100 text-orange-700",
  TMA: "bg-red-100 text-red-700",
  Mixed: "bg-purple-100 text-purple-700",
  Genetic: "bg-teal-100 text-teal-700"
};

export default function GlomerularDiseasesPathway() {
  const [expanded, setExpanded] = useState({});
  const [activeTab, setActiveTab] = useState({});
  const [aiUpdates, setAiUpdates] = useState({});
  const [loadingUpdate, setLoadingUpdate] = useState({});
  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState({});
  const [customConditions, setCustomConditions] = useState(() => {
    try {return JSON.parse(localStorage.getItem("glom_custom") || "[]");} catch {return [];}
  });
  const [filterCategory, setFilterCategory] = useState("All");
  const [mainTab, setMainTab] = useState("diseases");

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const isAdmin = user?.role === "admin";

  const allConditions = [...DEFAULT_CONDITIONS, ...customConditions];
  const categories = ["All", "Nephrotic", "Haematuria/Mixed", "Autoimmune", "TMA", "Mixed", "Genetic", "Rare/Other"];
  const filtered = filterCategory === "All" ? allConditions : allConditions.filter((c) => c.category === filterCategory);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const setTab = (id, tab) => setActiveTab((prev) => ({ ...prev, [id]: tab }));

  const fetchUpdate = async (condition) => {
    setLoadingUpdate((prev) => ({ ...prev, [condition.id]: true }));
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a clinical nephrologist. Provide the LATEST 2024-2025 updates and evidence for managing ${condition.name}. Focus on: new drug approvals (cite trial names), updated guidelines, emerging biomarkers, key changes from previous guidelines, pediatric-specific considerations. Use bullet points. Be concise but comprehensive.`,
        add_context_from_internet: true,
        model: "gemini_3_flash"
      });
      setAiUpdates((prev) => ({ ...prev, [condition.id]: result }));
    } catch {
      toast.error("Update fetch failed");
    } finally {
      setLoadingUpdate((prev) => ({ ...prev, [condition.id]: false }));
    }
  };

  const startEdit = (condition) => {
    setEditData({ ...condition, keyPointsText: condition.keyPoints.join("\n") });
    setEditMode(condition.id);
  };

  const saveEdit = () => {
    const updated = { ...editData, keyPoints: editData.keyPointsText.split("\n").filter(Boolean) };
    delete updated.keyPointsText;
    setCustomConditions((prev) => {
      const existing = prev.find((c) => c.id === editData.id);
      let next;
      if (existing) {
        next = prev.map((c) => c.id === editData.id ? updated : c);
      } else {
        next = [...prev, updated];
      }
      localStorage.setItem("glom_custom", JSON.stringify(next));
      return next;
    });
    setEditMode(null);
    toast.success("Changes saved");
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <BookOpen className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-900">
          <strong>Glomerular Disease Clinical Pathways</strong> — KDIGO 2021/2024, ACR/EULAR, IPNA guidelines. Includes decision engine, lab trends, dialysis support, and live evidence updates.
          {isAdmin && <span className="ml-2 text-purple-700 font-semibold">Admin: edit any pathway using the ✏️ button.</span>}
        </AlertDescription>
      </Alert>

      {/* Main Tabs */}
      <div className="flex gap-1.5 flex-wrap bg-slate-100 p-1 rounded-xl">
        {[
        { id: "diseases", label: "📋 Disease Pathways" },
        { id: "decision", label: "🧠 Decision Engine" },
        { id: "labs", label: "📈 Lab Trends" },
        { id: "dialysis", label: "💧 Dialysis Support" }].
        map((t) =>
        <button key={t.id} onClick={() => setMainTab(t.id)} className="bg-blue-600 text-white px-3 py-2 text-xs font-semibold rounded-[20px] transition-all shadow">
          
            {t.label}
          </button>
        )}
      </div>

      {mainTab === "decision" && <GlomerularDecisionEngine />}
      {mainTab === "labs" && <LabTrendIntelligence />}
      {mainTab === "dialysis" && <DialysisDecisionSupport />}

      {/* Disease Pathways tab content */}
      {mainTab === "diseases" && <>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) =>
          <Button key={cat} size="sm" variant={filterCategory === cat ? "default" : "outline"}
          onClick={() => setFilterCategory(cat)}
          className={`text-xs h-7 ${filterCategory === cat ? "bg-blue-600" : ""}`}>
            {cat}
          </Button>
          )}
      </div>

      {filtered.map((condition) => {
          const tab = activeTab[condition.id] || "overview";
          return (
            <Card key={condition.id} className={`bg-white shadow-sm border-2 ${condition.urgency === "critical" ? "border-red-200" : condition.urgency === "high" ? "border-amber-200" : "border-slate-200"}`}>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggle(condition.id)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-sm font-bold text-slate-900">{condition.name}</CardTitle>
                    <Badge className={`text-xs border ${urgencyColors[condition.urgency]}`}>{urgencyLabel[condition.urgency]}</Badge>
                    {condition.category && <Badge className={`text-xs ${categoryColors[condition.category] || "bg-slate-100 text-slate-600"}`}>{condition.category}</Badge>}
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {condition.tags?.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">📚 {condition.guideline}</p>
                </div>
                <div className="flex items-center gap-1">
                  {isAdmin &&
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => {e.stopPropagation();startEdit(condition);}}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    }
                  {expanded[condition.id] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
            </CardHeader>

            {expanded[condition.id] && editMode === condition.id ?
              <CardContent className="pt-0 px-4 pb-4 space-y-3 border-t border-dashed border-purple-300 bg-purple-50">
                <p className="text-xs font-bold text-purple-800">✏️ Admin Edit Mode</p>
                <div>
                  <label className="text-xs font-semibold">Name</label>
                  <Input value={editData.name || ""} onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))} className="text-xs mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold">Key Points (one per line)</label>
                  <Textarea value={editData.keyPointsText || ""} onChange={(e) => setEditData((p) => ({ ...p, keyPointsText: e.target.value }))} className="text-xs mt-1 min-h-[120px]" />
                </div>
                <div>
                  <label className="text-xs font-semibold">Guideline Reference</label>
                  <Input value={editData.guideline || ""} onChange={(e) => setEditData((p) => ({ ...p, guideline: e.target.value }))} className="text-xs mt-1" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 text-xs" onClick={saveEdit}><Save className="w-3 h-3 mr-1" />Save</Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => setEditMode(null)}><X className="w-3 h-3 mr-1" />Cancel</Button>
                </div>
              </CardContent> :
              expanded[condition.id] &&
              <CardContent className="pt-0 px-4 pb-4 space-y-3">
                {/* Tabs */}
                <div className="flex gap-1 border-b pb-2 flex-wrap">
                  {["overview", "flowchart", "pathology", "refs"].map((t) =>
                  <Button key={t} size="sm" variant={tab === t ? "default" : "ghost"}
                  onClick={() => setTab(condition.id, t)}
                  className={`text-xs h-7 capitalize ${tab === t ? "bg-blue-600" : ""}`}>
                      {t === "flowchart" ? <><GitBranch className="w-3 h-3 mr-1" />Algorithm</> : t === "pathology" ? <><FileText className="w-3 h-3 mr-1" />Histology/Genetics</> : t === "refs" ? "📚 Refs" : "📋 Overview"}
                    </Button>
                  )}
                </div>

                {/* Overview Tab */}
                {tab === "overview" &&
                <div className="space-y-3">
                    <div className="flex gap-1 flex-wrap">
                      {condition.variants?.map((v) => <Badge key={v} className="bg-purple-100 text-purple-800 text-xs">{v}</Badge>)}
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Management Protocol</p>
                      {condition.keyPoints?.map((point, i) =>
                    <div key={i} className="flex items-start gap-2 text-xs p-2 bg-slate-50 rounded border">
                          <span className="font-bold text-blue-600 flex-shrink-0">{i + 1}.</span>
                          <span className="text-slate-800">{point}</span>
                        </div>
                    )}
                    </div>
                  </div>
                }

                {/* Flowchart Tab */}
                {tab === "flowchart" &&
                <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700 uppercase">Clinical Algorithm</p>
                    <div className="max-w-md mx-auto">
                      {condition.flowchart?.map((step, i) =>
                    <FlowStep key={i} step={step} index={i + 1} total={condition.flowchart.length}
                    color={i === 0 ? "slate" : i === condition.flowchart.length - 1 ? "green" : condition.urgency === "critical" ? "red" : "blue"} />
                    )}
                    </div>
                    {condition.decisionNodes?.map((dn, i) =>
                  <DecisionNode key={i} question={dn.q} yes={dn.yes} no={dn.no} />
                  )}
                  </div>
                }

                {/* Pathology Tab */}
                {tab === "pathology" &&
                <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-amber-900 mb-1">🔬 Histopathology / EM</p>
                      <p className="text-xs text-amber-800">{condition.pathology}</p>
                    </div>
                    {condition.genetics &&
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs font-bold text-purple-900 mb-1"><span className="mr-1">🧬</span>Genetics & Biomarkers</p>
                        <p className="text-xs text-purple-800">{condition.genetics}</p>
                      </div>
                  }
                  </div>
                }

                {/* References Tab */}
                {tab === "refs" &&
                <div className="space-y-2">
                    {condition.refs?.map((ref, i) =>
                  <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-600 hover:underline p-2 bg-blue-50 rounded border border-blue-200">
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />{ref.title}
                      </a>
                  )}
                  </div>
                }

                {/* AI Live Update */}
                <div className="border-t pt-3">
                  <Button size="sm" variant="outline" onClick={() => fetchUpdate(condition)} disabled={loadingUpdate[condition.id]}
                  className="w-full text-xs border-green-300 text-green-700 hover:bg-green-50">
                    {loadingUpdate[condition.id] ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Fetching Latest Evidence...</> : <><RefreshCw className="w-3 h-3 mr-1" />🌐 Get Latest 2024-25 Updates</>}
                  </Button>
                  {aiUpdates[condition.id] &&
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-bold text-green-900">Latest Evidence (AI-Fetched · uses web search)</span>
                      </div>
                      <ReactMarkdown className="text-xs prose prose-sm prose-green max-w-none [&>*:first-child]:mt-0">
                        {aiUpdates[condition.id]}
                      </ReactMarkdown>
                    </div>
                  }
                </div>
              </CardContent>
              }
          </Card>);

        })}
      </> /* end diseases tab */}
    </div>);

}