/**
 * Renal Biopsy Findings Engine
 * Key histopathology, LM/IF/EM findings, clinical correlation, AI Analyser link
 * KDIGO · ISN · Banff Classification
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Microscope, ExternalLink } from "lucide-react";

const CONDITIONS = [
  { id: "minimal_change", label: "Minimal Change Disease (MCD)", color: "bg-blue-50 border-blue-300 text-blue-900" },
  { id: "fsgs", label: "Focal Segmental Glomerulosclerosis (FSGS)", color: "bg-purple-50 border-purple-300 text-purple-900" },
  { id: "membranous", label: "Membranous Nephropathy (MN)", color: "bg-amber-50 border-amber-300 text-amber-900" },
  { id: "igan", label: "IgA Nephropathy (IgAN)", color: "bg-orange-50 border-orange-300 text-orange-900" },
  { id: "lupus", label: "Lupus Nephritis (LN) — ISN/RPS", color: "bg-red-50 border-red-300 text-red-900" },
  { id: "c3g", label: "C3 Glomerulopathy (C3GN / DDD)", color: "bg-teal-50 border-teal-300 text-teal-900" },
  { id: "anca", label: "ANCA Vasculitis / RPGN", color: "bg-rose-50 border-rose-300 text-rose-900" },
  { id: "alport", label: "Alport Syndrome", color: "bg-green-50 border-green-300 text-green-900" },
  { id: "tin", label: "Tubulointerstitial Nephritis (TIN)", color: "bg-cyan-50 border-cyan-300 text-cyan-900" },
  { id: "transplant", label: "Transplant Rejection (Banff)", color: "bg-slate-100 border-slate-300 text-slate-900" },
  { id: "thrombotic", label: "Thrombotic Microangiopathy (TMA/HUS)", color: "bg-pink-50 border-pink-300 text-pink-900" },
  { id: "diabetic", label: "Diabetic Nephropathy", color: "bg-yellow-50 border-yellow-300 text-yellow-900" },
];

const BIOPSY_DATA = {
  minimal_change: {
    headline: "Minimal Change Disease (MCD)",
    lm: ["Light Microscopy: NORMAL (or minimal mesangial hypercellularity) — 'minimal change' by definition", "No glomerulosclerosis, no mesangial deposits, no crescents"],
    if_: ["Immunofluorescence: NEGATIVE — no immunoglobulin or complement deposits", "May have trace IgM (non-specific mesangial 'traffic jam')"],
    em: ["Electron Microscopy: Diffuse podocyte foot process EFFACEMENT (100%) — the key diagnostic finding", "No immune complex deposits", "GBM normal thickness"],
    clinical: ["Commonest cause of nephrotic syndrome in children 1–8y (>80% steroid-sensitive)", "Normalises completely with steroid treatment", "If EM shows no deposits + full FPE → MCD (even if not biopsied in typical cases)"],
    tx: "High-dose prednisolone 60 mg/m²/day × 4 weeks → 40 mg/m² alternate days × 4 weeks",
    ref: "IPNA 2021 · KDIGO NS 2021 · ISKDC",
  },
  fsgs: {
    headline: "Focal Segmental Glomerulosclerosis (FSGS)",
    lm: ["Focal (not all glomeruli) + Segmental (part of tuft) sclerosis and collapse", "Columbia Classification: NOS, Tip, Cellular, Collapsing (worst prognosis), Perihilar", "Collapsing FSGS: wrinkling + collapse of capillary tuft; podocyte hypertrophy/hyperplasia", "Tip variant: sclerosis at tubular pole; best prognosis"],
    if_: ["IgM + C3 trapped in sclerotic lesions (non-specific, NOT immune complex deposition)", "Negative for IgG, IgA unless secondary"],
    em: ["Diffuse podocyte foot process effacement (like MCD)", "Focal capillary collapse, mesangial expansion, occasional deposits"],
    clinical: ["Steroid-resistant nephrotic syndrome (SRNS) in 20–30% of NS in children", "Genetic FSGS: NPHS1, NPHS2 (most common), WT1, TRPC6, ACTN4", "HIV-associated FSGS: collapsing variant", "Secondary FSGS: solitary kidney, obesity, reflux nephropathy, hyperfiltration"],
    tx: "Calcineurin inhibitors (tacrolimus 0.1 mg/kg/day or cyclosporine 3–5 mg/kg/day) + prednisolone; RAAS blockade",
    ref: "KDIGO SRNS 2021 · IPNA 2021",
  },
  membranous: {
    headline: "Membranous Nephropathy (MN)",
    lm: ["Glomerular basement membrane thickening (silver stain: 'spikes' on epithelial side)", "Stage 1: subepithelial deposits without spike formation → Stage 4: incorporation of deposits into GBM", "Ehrenreich-Churg staging: I–IV"],
    if_: ["Granular IgG + C3 along capillary loops (subepithelial) — 'full house' pattern sometimes", "PLA2R staining (anti-PLA2R): positive in 70% primary MN", "THSD7A: 3–5% primary MN"],
    em: ["Subepithelial electron-dense deposits", "Foot process effacement, GBM thickening with projections (spikes)"],
    clinical: ["Primary (PLA2R +ve) vs Secondary (SLE, Hep B — in children most MN is secondary)", "Hep B–associated MN: IgM + IgG subepithelial; IgA in mesangium", "Check PLA2R, HBsAg, ANA, complement"],
    tx: "RAAS blockade first; Rituximab (anti-CD20) for high-risk primary MN; cytotoxics for secondary causes",
    ref: "KDIGO GN 2021 · EULAR · IPNA",
  },
  igan: {
    headline: "IgA Nephropathy (IgAN) — Oxford MEST-C Score",
    lm: ["Mesangial hypercellularity (M: >50% of glomeruli)", "Endocapillary proliferation (E)", "Segmental sclerosis (S)", "Tubular atrophy/interstitial fibrosis (T: 0 <25%; 1 = 25–50%; 2 >50%)", "Crescents (C: 0 absent; 1 <25%; 2 ≥25%) — added in Oxford 2016 update"],
    if_: ["IgA dominant (or co-dominant) mesangial deposits — DIAGNOSTIC", "C3 often present; IgG/IgM variable"],
    em: ["Electron-dense mesangial deposits (sometimes subendothelial/subepithelial in acute phase)"],
    clinical: ["Most common GN globally; episodic macroscopic haematuria after URTI (synpharyngitic haematuria)", "MEST-C score guides prognosis: T1/T2 = significant fibrosis = worse outcome", "IgAV (Henoch-Schönlein) — same lesion but systemic vasculitis context"],
    tx: "RAAS blockade (KDIGO 2021 — cornerstone); corticosteroids for high-risk IgAN (proteinuria >1g + GFR declining); Sparsentan/Budesonide (investigational)",
    ref: "KDIGO GN 2021 · Oxford Classification (MEST-C) · IgAN Prognosis Tool: https://qxmd.com/calculate/calculator_308/",
  },
  lupus: {
    headline: "Lupus Nephritis — ISN/RPS Classification",
    lm: ["Class I: Minimal mesangial LN (normal LM, mesangial deposits on IF/EM)", "Class II: Mesangial proliferative LN (mesangial hypercellularity only)", "Class III: Focal LN (<50% glomeruli involved)", "Class IV: Diffuse LN (≥50% glomeruli; segmental IV-S or global IV-G) — MOST SEVERE", "Class V: Membranous LN (may overlap with III or IV)", "Class VI: Advanced sclerosing (≥90% sclerosed)"],
    if_: ["Full house pattern: IgG + IgM + IgA + C3 + C1q (C1q = HALLMARK of lupus nephritis)", "Wire loop lesions on LM = massive subendothelial deposits"],
    em: ["Subendothelial, mesangial, and subepithelial deposits", "Tubuloreticular inclusions (viral-like; interferon signature) in Class IV"],
    clinical: ["Most common in adolescent girls; ANA + anti-dsDNA + low complement", "SLEDAI score for activity", "Class III/IV requires aggressive immunosuppression; Class V = membranous treatment"],
    tx: "Class III/IV: Induction with MMF (2–3g/day) or IV cyclophosphamide + methylprednisolone pulses; Maintenance: MMF + hydroxychloroquine; Belimumab (approved >5y)",
    ref: "EULAR/ERA-EDTA 2019 · ACR 2019 · ISN/RPS Classification 2018",
  },
  c3g: {
    headline: "C3 Glomerulopathy (C3GN / Dense Deposit Disease)",
    lm: ["MPGN (membranoproliferative) pattern: mesangial proliferation + thickened GBM", "DDD: homogeneous thickening of GBM ('ribbon-like')", "C3GN: lobular proliferation without the DDD thick deposits"],
    if_: ["C3 dominant deposits (>2 orders of magnitude above any Ig) — DIAGNOSTIC", "Minimal or absent IgG, IgM, IgA", "DDD: bright C3 linear/granular in GBM; C3GN: mesangial + subendothelial granular C3"],
    em: ["DDD: osmiophilic dense continuous deposits WITHIN GBM ('sausage' — pathognomonic)", "C3GN: mesangial ± subendothelial ± subepithelial deposits, NOT dense"],
    clinical: ["Low C3, normal C4 (alternative pathway); C3NeF often positive", "Genetic panel: CFH/CFI/MCP/CFB/CFHR genes", "Recurrence after transplant: 50–80%"],
    tx: "RAAS blockade; MMF 600 mg/m²/dose BD for progressive disease; Eculizumab for complement-driven refractory; Avacopan (investigational)",
    ref: "KDIGO GN 2021 · ERKNet Consensus 2023 · IPNA",
  },
  anca: {
    headline: "ANCA-associated Vasculitis / Pauci-immune RPGN",
    lm: ["Crescentic GN — circumferential cellular crescents in Bowman's space", "Fibrinoid necrosis of glomerular tufts", "No or minimal immune complex deposits on IF ('pauci-immune')", "Interstitial granulomas: suggest GPA (Wegener's)"],
    if_: ["PAUCI-IMMUNE — negative/trace IgG, C3 (this distinguishes ANCA from immune-complex RPGN)", "Fibrin within crescents"],
    em: ["Rare deposits; GBM disruption + fibrin in Bowman's space"],
    clinical: ["PR3-ANCA (c-ANCA) → GPA (Wegener's): ENT, lung, kidney", "MPO-ANCA (p-ANCA) → MPA (microscopic polyangiitis): kidney + lung", "Haematuria + RBC casts + rapidly rising creatinine → RPGN emergency"],
    tx: "Induction: IV methylprednisolone pulses + Rituximab (preferred over CYC — equally effective, less gonadotoxic); PLEX for DAH or dialysis-dependent; Maintenance: Rituximab 500 mg q6m × 2y",
    ref: "EULAR/ERA 2022 · KDIGO ANCA Vasculitis 2021 · IPNA",
  },
  alport: {
    headline: "Alport Syndrome (COL4A3/4/5 Mutations)",
    lm: ["Light Microscopy: initially NORMAL or mild mesangial hypercellularity", "Late stage: focal global glomerulosclerosis, FSGS-like lesion, interstitial fibrosis"],
    if_: ["Normal IgG, C3 (no immune deposits)", "Collagen IV staining: COL4A5 (X-linked) — absent/mosaic on GBM in males; mosaic in carrier females", "COL4A3/A4 — both sexes affected"],
    em: ["PATHOGNOMONIC: irregular GBM thickening with multilamellation (splitting/basket-weave pattern of lamina densa)", "GBM thinning in early disease (can mimic thin basement membrane disease)", "Foot process effacement proportional to proteinuria"],
    clinical: ["X-linked (COL4A5) = 80%: males severe; females variable; hearing loss + ocular changes (lenticonus)", "Autosomal recessive (COL4A3/4) = 15%: severe, like XLMT males", "Autosomal dominant (COL4A3/4 heterozygous) = 5%: milder, late ESRD", "ESRD by 25y (XLMT males); 60y (AR dominant)"],
    tx: "RAAS blockade as soon as proteinuria/microalbuminuria detected; trial: SGLT2 inhibitor + sparsentan; Gene therapy trials ongoing",
    ref: "KDIGO GN 2021 · IPNA Alport 2020 · Gross et al. JASN 2018",
  },
  tin: {
    headline: "Tubulointerstitial Nephritis (TIN)",
    lm: ["Interstitial oedema + mononuclear cell infiltrate (lymphocytes, plasma cells, eosinophils)", "Tubulitis (lymphocytes infiltrating tubular epithelium — Banff criterion)", "Tubular injury: flattened epithelium, brush border loss, vacuolation", "Non-caseating granulomas: TINU syndrome, sarcoidosis, drug reaction"],
    if_: ["Negative (no immune deposits)", "Linear IgG along TBM: anti-TBM disease (rare, drug-induced)"],
    em: ["No immune deposits; tubular injury; interstitial oedema"],
    clinical: ["Drug-induced (most common): NSAIDs, antibiotics (especially methicillin, rifampicin, penicillins), PPIs", "Infection: Leptospirosis, EBV, CMV, BK virus (transplant)", "TINU syndrome: TIN + uveitis (anterior); elevated β2-microglobulin in urine; treat with steroids + ophthalmology"], 
    tx: "STOP causative drug; prednisolone 1 mg/kg/day × 4–8 weeks then taper; monitor eGFR; renal recovery incomplete if fibrosis present",
    ref: "KDIGO GN 2021 · IPNA",
  },
  transplant: {
    headline: "Transplant Rejection — Banff Classification",
    lm: ["Acute T-cell mediated rejection (TCMR): tubulitis (Banff t score) + interstitial inflammation (i score)", "Acute antibody-mediated rejection (ABMR): microvascular inflammation — glomerulitis (g) + peritubular capillaritis (ptc)", "Chronic active ABMR: double contour GBM (transplant glomerulopathy = cg score)", "Borderline change: some tubulitis + inflammation but not meeting full TCMR criteria"],
    if_: ["C4d in peritubular capillaries: POSITIVE in ABMR (C4d+ ABMR); can be C4d- in non-classical ABMR"],
    em: ["ABMR: multilayered peritubular capillary BM (PTCBM) >6 layers = chronic microvascular injury (cg pattern)"],
    clinical: ["Rising creatinine + proteinuria + DSA (donor-specific antibodies) → ABMR workup", "Banff scores: guide treatment intensity", "BK nephropathy (BKVN): intranuclear inclusions, SV40+ on IHC — mimics rejection"],
    tx: "TCMR: pulse methylprednisolone ± thymoglobulin; ABMR: IVIG + rituximab + plasmapheresis + IVIG; Chronic ABMR: optimize CNI/MMF, belimumab trial",
    ref: "Banff 2022 · KDIGO Transplant 2020",
  },
  thrombotic: {
    headline: "Thrombotic Microangiopathy (TMA/HUS)",
    lm: ["Glomerular microthrombi (capillary lumina occluded by platelet-fibrin thrombi)", "Double contour GBM ('train-track') = chronic TMA", "Arteriolar onion-skin lesion (hypertensive/chronic TMA)", "Mesangiolysis (expansion of mesangial matrix, capillary collapse)"],
    if_: ["Fibrin in capillary thrombi; minimal Ig/complement deposits", "Negative for IgA, IgG — helps distinguish from immune-complex GN"],
    em: ["Subendothelial widening (fibrin + electron-lucent material between endothelium and GBM)", "Mesangiolysis"],
    clinical: ["STEC-HUS (Shiga toxin): diarrhoea prodrome, children; Stx O157:H7; supportive treatment only", "aHUS (CFH mutation): no prodrome; 50% ESRD; treat with ECULIZUMAB", "TTP (ADAMTS13 deficiency): neurological + TMA; PLEX first-line"],
    tx: "STEC-HUS: supportive (no antibiotics, no antidiarrhoeals, no antiplatelets); aHUS: Eculizumab (C5 inhibitor) URGENTLY; TTP: plasma exchange + steroids",
    ref: "KDIGO AKI 2012 · SHARE aHUS Guidelines 2022 · IPNA",
  },
  diabetic: {
    headline: "Diabetic Nephropathy",
    lm: ["Kimmelstiel-Wilson nodular lesion (nodular glomerulosclerosis) — PATHOGNOMONIC: PAS+ acellular nodules in periphery of glomerulus", "Diffuse glomerulosclerosis (more common; mesangial matrix expansion)", "Capsular drop lesion (hyaline deposition at urinary pole)", "GBM thickening; arteriolar hyalinosis (afferent > efferent)"],
    if_: ["Linear IgG + albumin along GBM (non-immune; trapping)", "No complement"],
    em: ["GBM thickening (>430 nm female; >395 nm male)", "Mesangial matrix expansion; podocyte foot process effacement"],
    clinical: ["Usually biopsied when: atypical course (rapid GFR decline, active sediment, no retinopathy in diabetes)", "Progression correlates with mesangial fraction, GFR at biopsy, BP control"],
    tx: "SGLT2 inhibitors (dapagliflozin/canagliflozin) — evidence for slowing progression; RAAS blockade; BP <130/80; HbA1c <7%",
    ref: "KDIGO Diabetes 2020 · EMPA-REG · CREDENCE trial",
  },
};

export default function RenalBiopsyEngine() {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("lm");

  if (selected && BIOPSY_DATA[selected]) {
    const d = BIOPSY_DATA[selected];
    const tabs = [
      { id: "lm", label: "Light Microscopy", items: d.lm, color: "blue" },
      { id: "if", label: "Immunofluorescence", items: d.if_, color: "green" },
      { id: "em", label: "Electron Microscopy", items: d.em, color: "violet" },
      { id: "clinical", label: "Clinical", items: d.clinical, color: "amber" },
      { id: "tx", label: "Treatment", items: [d.tx], color: "red" },
    ];
    const activeTab = tabs.find(t => t.id === tab);
    const tc = { blue: "border-blue-200 bg-blue-50", green: "border-green-200 bg-green-50", violet: "border-violet-200 bg-violet-50", amber: "border-amber-200 bg-amber-50", red: "border-red-200 bg-red-50" };
    const tt = { blue: "text-blue-900", green: "text-green-900", violet: "text-violet-900", amber: "text-amber-900", red: "text-red-900" };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-slate-700 text-white text-xs px-2">{d.headline}</Badge>
          <button onClick={() => { setSelected(null); setTab("lm"); }} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" />Back</button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${tab === t.id ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab && (
          <div className={`rounded-xl border-2 p-3 ${tc[activeTab.color]}`}>
            <p className={`font-bold text-sm mb-2 ${tt[activeTab.color]}`}>{activeTab.label}</p>
            {activeTab.items.map((it, i) => (
              <div key={i} className="text-xs text-slate-700 flex gap-1.5 mb-1">
                <span className="text-slate-400 flex-shrink-0 mt-0.5">→</span>
                <span>{it}</span>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 text-xs text-slate-700">
          <span className="font-bold">Reference: </span>{d.ref}
        </div>

        <div className="rounded-xl bg-blue-50 border border-blue-200 p-2 text-xs text-blue-900 flex items-center gap-2">
          <Microscope className="w-4 h-4 flex-shrink-0" />
          <span>Link to <strong>Biopsy AI Analyser</strong> → upload your biopsy report for AI-assisted correlation</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-zinc-700 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Microscope className="w-5 h-5" />
          <h3 className="text-sm font-bold">Renal Biopsy Findings Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">{CONDITIONS.length} Conditions</Badge>
        </div>
        <p className="text-xs text-slate-300">LM → IF → EM → Clinical Correlation → Treatment · KDIGO · ISN · Banff</p>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-2 text-xs text-amber-900">
        💡 Select a condition to see Light Microscopy, Immunofluorescence, Electron Microscopy findings, clinical correlation, and treatment.
      </div>

      <div className="space-y-2">
        {CONDITIONS.map(c => (
          <button key={c.id} onClick={() => { setSelected(c.id); setTab("lm"); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${c.color} hover:shadow-sm`}>
            <div className="flex items-center gap-2">
              <Microscope className="w-4 h-4 flex-shrink-0 opacity-60" />
              <span className="font-semibold text-sm">{c.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2 opacity-60" />
          </button>
        ))}
      </div>

      <div className="text-xs text-slate-400 text-center">KDIGO GN 2021 · ISN/RPS Lupus · Banff 2022 · Oxford MEST-C · IPNA</div>
    </div>
  );
}