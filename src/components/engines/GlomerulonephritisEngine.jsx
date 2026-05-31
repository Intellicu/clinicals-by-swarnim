import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, ChevronRight, Microscope } from "lucide-react";
import { Button } from "@/components/ui/button";

// References: KDIGO GN 2021, IPNA 2020 (Lupus), ISKDC, EULAR/ERA-EDTA

const CONDITIONS = [
  { id: "iga", label: "IgA Nephropathy", badge: "IgA", color: "blue" },
  { id: "lupus", label: "Lupus Nephritis", badge: "LN", color: "violet" },
  { id: "membranous", label: "Membranous GN", badge: "MN", color: "amber" },
  { id: "fsgs", label: "FSGS", badge: "FSGS", color: "red" },
  { id: "psgn", label: "Post-Infectious GN (PSGN)", badge: "PSGN", color: "green" },
  { id: "anca", label: "ANCA Vasculitis / RPGN", badge: "ANCA", color: "red" },
  { id: "alport", label: "Alport Syndrome", badge: "Alport", color: "violet" },
  { id: "mpgn_c3g", label: "MPGN / C3 Glomerulopathy", badge: "C3G", color: "blue" },
  { id: "iganv", label: "IgA Vasculitis Nephritis (HSP)", badge: "IgAVN", color: "amber" },
];

const BADGE_COLORS = {
  blue: "bg-blue-600", violet: "bg-violet-600", amber: "bg-amber-600", red: "bg-red-600", green: "bg-green-600"
};

const InfoBox = ({ title, color = "blue", items, children, referral }) => {
  const styles = { blue: "border-blue-300 bg-blue-50", green: "border-green-300 bg-green-50", amber: "border-amber-300 bg-amber-50", red: "border-red-300 bg-red-50", violet: "border-violet-300 bg-violet-50", slate: "border-slate-200 bg-slate-50" };
  const titleC = { blue: "text-blue-900", green: "text-green-900", amber: "text-amber-900", red: "text-red-900", violet: "text-violet-900", slate: "text-slate-800" };
  return (
    <Card className={`border-2 ${styles[color]}`}>
      <CardContent className="p-4 space-y-2">
        <p className={`font-bold text-sm ${titleC[color]}`}>{title}</p>
        {items && <ul className="space-y-1.5">{items.map((it, i) => <li key={i} className="flex items-start gap-2 text-xs text-slate-700"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" /><span>{it}</span></li>)}</ul>}
        {children}
        {referral && <div className="mt-2 p-2 bg-violet-50 border border-violet-200 rounded-lg text-xs text-violet-800 font-medium">📋 {referral}</div>}
      </CardContent>
    </Card>
  );
};

const GNSection = ({ title, color, items }) => (
  <div className={`p-3 rounded-xl border-2 ${
    color === "blue" ? "bg-blue-50 border-blue-200" :
    color === "green" ? "bg-green-50 border-green-200" :
    color === "amber" ? "bg-amber-50 border-amber-200" :
    color === "red" ? "bg-red-50 border-red-200" :
    color === "violet" ? "bg-violet-50 border-violet-200" : "bg-slate-50 border-slate-200"
  }`}>
    <p className={`text-xs font-bold mb-2 ${
      color === "blue" ? "text-blue-900" : color === "green" ? "text-green-900" :
      color === "amber" ? "text-amber-900" : color === "red" ? "text-red-900" :
      color === "violet" ? "text-violet-900" : "text-slate-800"
    }`}>{title}</p>
    <ul className="space-y-1">{items.map((it, i) => <li key={i} className="text-xs text-slate-700">• {it}</li>)}</ul>
  </div>
);

const CONDITIONS_DATA = {
  iga: {
    title: "IgA Nephropathy",
    color: "blue",
    diagnosis: [
      "Macroscopic haematuria 24–72h after URTI (synpharyngitic) — hallmark",
      "Persistent microscopic haematuria ± proteinuria between episodes",
      "Elevated serum IgA in ~50% (not sensitive, not required for diagnosis)",
      "Complement: C3/C4 usually normal",
      "Definitive diagnosis: RENAL BIOPSY — mesangial IgA deposits on IF",
      "MEST-C score (Oxford): M, E, S, T, C lesions — prognostic",
    ],
    treatment: [
      "Low risk (no proteinuria, normal eGFR): RAAS blockade alone (ACEi/ARB)",
      "Proteinuria >0.5 g/1.73m²/day despite 3 months RAAS: consider immunosuppression",
      "High-risk (proteinuria >1g, declining eGFR, active histology): Steroids (prednisolone 0.5–1 mg/kg/day × 6 months — TESTING trial)",
      "Systemic steroid therapy: KDIGO 2021 — methylprednisolone IV × 3 days then oral prednisolone",
      "Sparsentan (dual endothelin-AT1 antagonist): approved in adults — Trial NephIgA (2024)",
      "Supportive: BP control target <130/80 mmHg, fish oil (omega-3) — limited evidence",
    ],
    monitoring: [
      "UPCR every 3 months", "eGFR + serum creatinine every 3–6 months",
      "BP control — critical prognostic factor",
      "Repeat biopsy if rapid progression despite treatment",
    ],
    prognosis: "25–30% reach ESRD by 20–25 years; poor prognostic factors: persistent proteinuria >1g/day, hypertension, elevated Cr at diagnosis, T1 or T2 on MEST-C",
    ref: "KDIGO GN Guideline 2021 · TESTING Trial 2022 · Oxford Classification (MEST-C) 2016",
  },

  lupus: {
    title: "Lupus Nephritis",
    color: "violet",
    diagnosis: [
      "Urinalysis: haematuria, pyuria, cellular casts, proteinuria",
      "ACR/EULAR 2019 SLE classification criteria (≥10 points)",
      "Serology: ANA (high sensitivity), anti-dsDNA (high specificity), anti-Sm",
      "Complement: low C3 and C4 (disease activity marker)",
      "Renal biopsy: mandatory for classification (ISN/RPS 2018 classes I–VI)",
      "Anti-phospholipid antibodies (APLA): if thrombosis or pregnancy loss",
    ],
    treatment: [
      "ALL patients: Hydroxychloroquine 5 mg/kg/day (max 400 mg/day) — reduces flares, improves survival",
      "Class I–II: RAAS blockade; steroids only if extrarenal activity",
      "Class III/IV (Proliferative — most common in children):",
      "— Induction: IV cyclophosphamide (Euro-Lupus) + high-dose steroids OR MMF 600 mg/m²/dose BD + steroids",
      "— Maintenance: MMF 600 mg/m²/dose BD (preferred) or azathioprine 1.5–2 mg/kg/day",
      "— Belimumab (anti-BAFF) + standard therapy: BLISS-LN trial — add-on in refractory",
      "Class V (Membranous LN): RAAS + MMF if significant proteinuria",
      "Class VI (Sclerosis >90%): Supportive — RRT if ESRD",
      "Voclosporin (calcineurin inhibitor): AURORA trial — induction in LN (not yet paediatric approved)",
    ],
    monitoring: [
      "Anti-dsDNA + C3/C4 every 3 months (disease activity)", "UPCR every 1–3 months",
      "eGFR quarterly", "CBC (MMF/AZA myelosuppression)", "Hydroxychloroquine: annual eye review",
      "SLEDAI-2K / BILAG score for disease activity assessment",
    ],
    prognosis: "Children have more severe disease than adults; 10% reach ESRD. Proliferative LN (III/IV) worst prognosis. Anti-dsDNA normalisation = good response.",
    ref: "IPNA Clinical Practice Recommendations 2020 · KDIGO GN 2021 · BLISS-LN Trial · ISN/RPS Classification 2018",
  },

  membranous: {
    title: "Membranous GN (MN)",
    color: "amber",
    diagnosis: [
      "Presentation: nephrotic syndrome in school-age / adolescent; insidious onset",
      "Primary MN: PLA2R antibody positive (70–80% adults; less common in children)",
      "Secondary MN: hepatitis B (most common in children), SLE, drugs (penicillamine), autoimmune",
      "Serology: PLA2R Ab, THSD7A Ab, anti-dsDNA (SLE), HBsAg, HBe Ag, anti-HCV",
      "Biopsy: subepithelial immune deposits (LM: thickened GBM; IF: granular IgG + C3; EM: subepithelial deposits, spikes)",
      "Stage by EM: I (tiny deposits) → IV (fully incorporated into GBM)",
    ],
    treatment: [
      "Secondary MN: treat underlying cause (HBV: tenofovir/entecavir; SLE: as above)",
      "Primary MN — conservative first (spontaneous remission in ~30%):",
      "— RAAS blockade, salt restriction, statins if hyperlipidaemia",
      "— Anticoagulation: if albumin <25 g/L (very high thrombosis risk)",
      "Immunosuppression (if progressive: declining eGFR, severe NS, persistent >6 months):",
      "— Modified Ponticelli protocol: alternating IV methylprednisolone + chlorambucil × 6 months",
      "— RTX (rituximab) 375 mg/m²: first-line in adults (MENTOR trial) — increasing use in children",
      "— CNI (tacrolimus/cyclosporin): effective but high relapse on discontinuation",
      "Monitor PLA2R Ab titre — correlates with disease activity",
    ],
    monitoring: ["UPCR monthly during treatment", "eGFR quarterly", "Serum albumin, cholesterol", "PLA2R Ab titre (primary MN)", "Monitor for thrombosis (DVT, RVT)", "HBV DNA monitoring if HBV-MN"],
    prognosis: "Rule of thirds: 1/3 spontaneous remission, 1/3 stable, 1/3 progressive to CKD. PLA2R+ predicts better response to RTX.",
    ref: "KDIGO GN Guideline 2021 · MENTOR Trial (Fervenza 2019) · Beck LH Jr. (2009) NEJM — PLA2R",
  },

  fsgs: {
    title: "FSGS (Focal Segmental Glomerulosclerosis)",
    color: "red",
    diagnosis: [
      "Presentation: nephrotic syndrome (most common); steroid-resistant NS in children",
      "Biopsy: MANDATORY — focal (<50% glomeruli) and segmental sclerosis; podocyte injury",
      "Columbia variants: NOS, tip, perihilar, cellular, collapsing — different prognosis",
      "Collapsing FSGS: worst prognosis — HIV, COVID-19, APOL1 mutation",
      "Genetic testing: NPHS1, NPHS2, WT1, LAMB2, TRPC6, ACTN4, INF2, CD2AP panels",
      "Secondary FSGS: obesity, hyperfiltration, sickle cell, reflux nephropathy, analgesic nephropathy",
    ],
    treatment: [
      "Primary FSGS (NS) — induction:",
      "— Prednisolone 60 mg/m²/day (max 80 mg) × 4–6 weeks → taper",
      "— Steroid-resistant (no remission in 4–6 weeks): CALCINEURIN INHIBITORS",
      "— Tacrolimus 0.1–0.2 mg/kg/day (trough 5–10 ng/mL) × 12–24 months",
      "— OR Cyclosporin 4–6 mg/kg/day (trough 100–150 ng/mL)",
      "— Add MMF 600 mg/m²/dose BD + low-dose steroids",
      "— Genetic FSGS (NPHS2/NPHS1): poor response to steroids/CNI — supportive only, plan transplant",
      "Sparsentan, abatacept (CD80 pathway): investigational",
      "Supportive: ACEi/ARB (antiproteinuric), statins, salt/fluid restriction",
    ],
    monitoring: ["UPCR monthly", "CNI levels (Tac trough 5–10)", "Renal function monthly on CNI", "Watch for CNI nephrotoxicity (gradual rise in Cr)", "Lipid panel quarterly", "Growth and BP"],
    prognosis: "Tip variant: best prognosis. Collapsing: worst. Genetic FSGS: poor response to steroids, good transplant outcomes (no recurrence with podocin mutations). Idiopathic FSGS: 30–40% recurrence post-transplant.",
    ref: "KDIGO GN 2021 · IPNA SRNS Recommendations 2020 · Hinkes B NEJM 2007 · FONT Trial",
  },

  psgn: {
    title: "Post-Infectious GN (PSGN)",
    color: "green",
    diagnosis: [
      "Acute nephritic syndrome 1–3 weeks after pharyngitis / 3–6 weeks after impetigo",
      "Cola/tea-coloured urine + haematuria + hypertension + oedema + oliguria",
      "Low C3 (normalises 6–8 weeks) — normal C4 (alternative pathway activation)",
      "High ASO titre (pharyngitis); high anti-DNase B (impetigo/skin infection)",
      "Urine: RBC casts + dysmorphic RBCs + proteinuria",
      "Biopsy usually NOT required for typical PSGN — diagnosis clinical + serological",
      "Biopsy indications: atypical age (<3y), C3 low >8 weeks, no strep evidence, rapid crescentic course",
    ],
    treatment: [
      "Supportive — most recover fully without immunosuppression",
      "Salt restriction + fluid restriction",
      "Antihypertensives: amlodipine / nifedipine for hypertension; IV labetalol for emergency",
      "Diuretics: furosemide 1–2 mg/kg/dose for fluid overload",
      "Penicillin V / amoxicillin × 10 days (eradicate organism if active infection)",
      "Dialysis: if ESRD features — usually temporary",
      "Steroids: consider only if crescentic PSGN with rapidly declining GFR",
    ],
    monitoring: ["BP + urinalysis weekly × 4 weeks", "C3 — should normalise by 6–8 weeks; if still low at 8 weeks: re-evaluate (C3G?)", "eGFR at 6 months", "Reassure parents — PSGN complete recovery in >95% children"],
    prognosis: "Excellent — >95% full recovery in children. Adults have worse outcome. Complete resolution of haematuria expected by 6 months. Microscopic haematuria may persist up to 18 months.",
    ref: "KDIGO GN 2021 · Rodriguez-Iturbe B (2008) NEJM · Wen YK Pediatr Nephrol",
  },

  anca: {
    title: "ANCA-Associated Vasculitis / RPGN",
    color: "red",
    diagnosis: [
      "RPGN triad: rapidly progressive renal failure + haematuria + proteinuria (± oliguria)",
      "GPA (Granulomatosis with Polyangiitis): cANCA/PR3 + sinusitis, pulmonary nodules",
      "MPA (Microscopic Polyangiitis): pANCA/MPO + pulmonary haemorrhage common",
      "BIOPSY URGENTLY: pauci-immune crescentic GN on IF (no deposits) — diagnostic",
      "% Crescents: <50% better outcome; >70% + anuric → highest urgency",
      "Anti-GBM Ab — check if pulmonary haemorrhage (can co-exist with ANCA)",
      "ANCA panel: MPO-ANCA + PR3-ANCA; ANCA-negative vasculitis possible",
    ],
    treatment: [
      "INDUCTION (life/organ threatening):",
      "— Pulse IV methylprednisolone 500–1000 mg (30 mg/kg, max 1g) × 3 days IMMEDIATELY",
      "— Rituximab 375 mg/m² × 4 weekly (non-inferior to CYC in RITUXVAS, RAVE trials)",
      "— IV cyclophosphamide 15 mg/kg/dose × 3 (Euro-lupus dosing) if RTX unavailable",
      "MAINTENANCE:",
      "— Rituximab 250–500 mg every 6 months × 18–24 months (MAINRITSAN trial)",
      "— OR Azathioprine 2 mg/kg/day for 18–24 months",
      "PLASMAPHERESIS (PLEX): Indicated if anti-GBM positive, Cr >500 µmol/L, dialysis-dependent, or DAH",
      "— PLEX × 7 daily sessions over 2 weeks (standard) — MEPEX trial",
      "Avoid future relapses: co-trimoxazole prophylaxis (reduces GPA relapses — Stegeman 1996)",
    ],
    monitoring: ["ANCA titres quarterly (PR3-ANCA more predictive of relapse)", "eGFR + urinalysis monthly × 6 months", "HRCT chest if pulmonary involvement", "ENT + ophthalmology review (GPA)", "Repeat biopsy if relapse with new renal activity"],
    prognosis: "With aggressive immunosuppression: 75–80% achieve remission. 30% relapse within 18 months. Renal survival 70–80% at 5 years. GPA relapses more than MPA.",
    ref: "KDIGO GN 2021 · RAVE Trial 2010 · RITUXVAS 2010 · MAINRITSAN 2014 · MEPEX Trial 2007",
  },

  alport: {
    title: "Alport Syndrome",
    color: "violet",
    diagnosis: [
      "Persistent haematuria from infancy + progressive CKD + sensorineural hearing loss",
      "Anterior lenticonus (pathognomonic) + sub-capsular cataracts + retinal changes",
      "Family history: X-linked (males more severe), AR, AD (variable penetrance)",
      "GENOTYPE: COL4A5 (X-linked) / COL4A3 or COL4A4 biallelic (AR) / heterozygous (AD/TBMN)",
      "Skin biopsy: α5(IV) collagen absent in X-linked males on immunostaining",
      "Renal biopsy EM: GBM thinning + lamellation (basket-weave pattern)",
      "Audiometry: high-frequency sensorineural hearing loss (not conductive)",
    ],
    treatment: [
      "RAAS blockade: ACEi EARLY (even before proteinuria in high-risk) — delays ESRD",
      "— Enalapril 0.1–0.5 mg/kg/day; Ramipril in adults",
      "— Initiate if: proteinuria develops OR familial haematuria + high-risk genotype",
      "Losartan (ARB) if ACEi intolerant",
      "Cyclosporin: NOT recommended (nephrotoxic in Alport) — historical only",
      "Bardoxolone methyl (Nrf2 activator): CARDINAL trial — adults; paediatric data limited",
      "Transplant: excellent outcomes — X-linked females need Alport counselling; anti-GBM nephritis post-transplant rare (~3%)",
      "Genetic counselling: entire family; prenatal testing available",
    ],
    monitoring: ["Annual urine PCR — start RAAS at first proteinuria", "Annual audiometry", "Slit-lamp every 2 years", "eGFR 6-monthly once CKD established", "BP annually"],
    prognosis: "X-linked males: ESRD by median 25–30 years without treatment; with early ACEi may delay by 10+ years. AR: ESRD by 20–25y. Females (X-linked heterozygous): ~15% ESRD by 60y.",
    ref: "KDIGO GN 2021 · ESCAPE Trial · Storey H Pediatr Nephrol 2018 · European Alport Registry 2020",
  },

  mpgn_c3g: {
    title: "MPGN / C3 Glomerulopathy (C3GN / DDD)",
    color: "blue",
    diagnosis: [
      "Low C3 (persistent >8 weeks) + normal C4 → alternative pathway dysregulation",
      "MPGN pattern on LM: hypercellularity + GBM double contours (tram-track)",
      "IF: C3 dominant (>2 orders above Ig) = C3G; Ig dominant = immune complex MPGN",
      "EM: DDD — intramembranous osmiophilic deposits; C3GN — various locations",
      "Complement panel: C3, C4, CH50, AH50, Factor H, Factor I, Factor B, MCP/CD46",
      "Anti-CFH Ab (ELISA): autoantibody-mediated C3G",
      "C3 nephritic factor (C3 NeF): stabilises C3bBb convertase → AP over-activation",
      "Genetic panel: CFH, CFI, MCP, C3, CFB, CFHR1-5 mutations",
    ],
    treatment: [
      "RAAS blockade: all patients with proteinuria >500 mg/day",
      "MMF 600 mg/m²/dose BD + low-dose prednisolone: progressive C3G (declining eGFR + active sediment) — KDIGO 2021",
      "Eculizumab (anti-C5): consider CFH mutation-positive with rapid progression — MPGN C3G specific",
      "Plasmapheresis: anti-CFH Ab–mediated C3G (titre >150 U/mL) + plasma infusion",
      "Avacopan (oral C5aR blocker): investigational",
      "Treat underlying: monoclonal gammopathy (MGUS-associated MPGN — adult), infection (HCV)",
    ],
    monitoring: ["C3 every 3–6 months (normalisation = control)", "Anti-CFH Ab titre (autoantibody type) every 3 months", "UPCR + eGFR quarterly", "Repeat biopsy at 2 years or if rapid decline", "Transplant: 50–70% recurrence — discuss pre-transplant"],
    prognosis: "Variable; DDD worse than C3GN. 50% ESRD within 10 years. High recurrence post-transplant.",
    ref: "KDIGO GN 2021 · Pickering MC (2013) — C3G classification · Servais A JASN 2012",
  },

  iganv: {
    title: "IgA Vasculitis Nephritis (HSP Nephritis)",
    color: "amber",
    diagnosis: [
      "IgA vasculitis: palpable purpura + arthritis + abdominal pain + nephritis",
      "Nephritis in 30–50% of IgAV — usually within 6 months of onset",
      "Urinalysis: haematuria ± proteinuria; dipstick every 2 weeks × 6 months",
      "Biopsy if: UPCR >0.02 g/mmol or haematuria + proteinuria + HTN",
      "Biopsy: mesangial IgA deposits (identical to IgAN) — ISKDC grading I–VI",
      "Severe nephritis: crescentic GN (ISKDC grade IV–VI) — urgent",
    ],
    treatment: [
      "Grade I–II (mild proteinuria): RAAS blockade; close monitoring",
      "Grade III (mesangial + <50% crescents) without NS: prednisolone 1–2 mg/kg/day × 4–8 weeks → taper",
      "Grade IV–V (50–75%, >75% crescents — RPGN pattern):",
      "— IV methylprednisolone 500 mg × 3 + oral prednisolone",
      "— Add IV cyclophosphamide 15 mg/kg/dose (Euro-lupus protocol) OR MMF",
      "— Azathioprine maintenance 1.5–2 mg/kg/day × 18–24 months",
      "Grade VI (sclerotic): supportive — plan RRT",
      "All grades: BP control, RAAS blockade if proteinuria, fish oil (limited evidence)",
    ],
    monitoring: ["Urinalysis + UPCR every 2 weeks × 6 months (especially from purpura onset)", "BP monthly", "eGFR 3-monthly for 1 year, then 6-monthly", "Long-term follow-up: annual UPCR + BP even after apparent remission (late CKD risk)"],
    prognosis: "Most mild IgAVN resolves. Crescentic/nephrotic IgAVN: 30–50% progress to CKD. Late CKD 10–15 years post onset. Pregnancy: increased risk of hypertension/CKD.",
    ref: "ISKDC Classification · KDIGO GN 2021 · EULAR/ERA-EDTA IgAV Guidelines 2020",
  },
};

export default function GlomerulonephritisEngine() {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("diagnosis");

  const cond = selected ? CONDITIONS_DATA[selected] : null;

  const tabs = [
    { key: "diagnosis", label: "Diagnosis" },
    { key: "treatment", label: "Treatment" },
    { key: "monitoring", label: "Monitoring" },
    { key: "prognosis", label: "Prognosis" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Microscope className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Glomerulonephritis Engine</h3>
            <p className="text-xs text-slate-300">KDIGO GN 2021 · IPNA · ISKDC · Diagnosis & Management</p>
          </div>
        </div>
      </div>

      {!selected ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Select a GN condition:</p>
          <div className="grid grid-cols-1 gap-2">
            {CONDITIONS.map(c => (
              <button key={c.id} onClick={() => { setSelected(c.id); setTab("diagnosis"); }}
                className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all text-left">
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${BADGE_COLORS[c.color]}`}>{c.badge}</Badge>
                  <span className="text-sm font-medium text-slate-800">{c.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to conditions
          </button>

          <div className={`p-3 rounded-xl border-2 ${
            cond.color === "blue" ? "bg-blue-50 border-blue-300" :
            cond.color === "violet" ? "bg-violet-50 border-violet-300" :
            cond.color === "amber" ? "bg-amber-50 border-amber-300" :
            cond.color === "red" ? "bg-red-50 border-red-300" : "bg-green-50 border-green-300"
          }`}>
            <h3 className={`font-bold text-base ${
              cond.color === "blue" ? "text-blue-900" : cond.color === "violet" ? "text-violet-900" :
              cond.color === "amber" ? "text-amber-900" : cond.color === "red" ? "text-red-900" : "text-green-900"
            }`}>{cond.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{cond.ref}</p>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${tab === t.key ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "diagnosis" && (
            <GNSection title="Diagnostic Approach" color={cond.color} items={cond.diagnosis} />
          )}
          {tab === "treatment" && (
            <GNSection title="Treatment Protocol" color={cond.color} items={cond.treatment} />
          )}
          {tab === "monitoring" && (
            <GNSection title="Monitoring" color={cond.color} items={cond.monitoring} />
          )}
          {tab === "prognosis" && (
            <div className={`p-3 rounded-xl border-2 ${
              cond.color === "blue" ? "bg-blue-50 border-blue-200" :
              cond.color === "violet" ? "bg-violet-50 border-violet-200" :
              cond.color === "amber" ? "bg-amber-50 border-amber-200" :
              cond.color === "red" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
            }`}>
              <p className="text-xs font-bold text-slate-800 mb-2">Prognosis</p>
              <p className="text-xs text-slate-700 leading-relaxed">{cond.prognosis}</p>
              <div className="mt-3 p-2 bg-white rounded-lg">
                <p className="text-xs font-bold text-slate-700">References:</p>
                <p className="text-xs text-slate-500 italic">{cond.ref}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-slate-400 text-center">Ref: KDIGO GN Guideline 2021 · IPNA · ISKDC · EULAR/ERA-EDTA</div>
    </div>
  );
}