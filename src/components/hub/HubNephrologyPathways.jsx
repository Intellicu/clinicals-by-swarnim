import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, ChevronDown, ChevronUp, ArrowRight, ExternalLink, Pencil, AlertTriangle, Zap, Plus, Trash2, X, Check } from "lucide-react";
import AdminPathwayGenerator from "@/components/admin/AdminPathwayGenerator";

const PATHWAYS = [
  // ── Glomerular Diseases (GN) ──────────────────────────────────────────
  { name: "Nephrotic Syndrome (Childhood SSNS)", tag: "GN", color: "bg-purple-100 text-purple-800",
    emergency: false,
    summary: "Edema + proteinuria + hypoalbuminaemia. ISPN/IPNA first-line steroid protocol.",
    keys: ["ISKDC: prednisolone 60 mg/m²/day × 4 wks, then 40 mg/m² alternate day × 4 wks", "Relapse: dipstick ≥3+ × 3 consecutive days", "Frequent relapse (≥2/6m): MMF / levamisole", "SRNS: CNI (tacrolimus/CsA) + genetic testing"], scenario: "childhood-nephrotic" },
  { name: "Steroid-Resistant NS (SRNS)", tag: "GN", color: "bg-purple-100 text-purple-800",
    emergency: false,
    summary: "No remission after 4 weeks full-dose steroid. Genetic workup mandatory.",
    keys: ["Complete genetic panel: NPHS1/2, PLCE1, WT1, etc.", "Biopsy before CNI initiation", "Tacrolimus target trough 5–10 ng/mL", "Rituximab: 375 mg/m² × 2–4 doses for FRNS/SDNS"], scenario: "steroid-resistant-ns" },
  { name: "IgA Nephropathy (IgAN)", tag: "GN", color: "bg-blue-100 text-blue-800",
    emergency: false,
    summary: "Most common primary GN. MEST-C scoring. KDIGO 2021.",
    keys: ["IgA + mesangial deposits on biopsy", "Haematuria ± proteinuria post-URTI", "MEST-C Oxford classification", "RAAS blockade (ACEi/ARB) if proteinuria >0.5 g/day", "Steroids if GFR declining + proteinuria >1 g/day"], scenario: "iga-nephropathy" },
  { name: "IgA Vasculitis Nephritis (IgAV/HSP)", tag: "GN", color: "bg-blue-100 text-blue-800",
    emergency: false,
    summary: "Purpura + arthritis + abdominal pain + nephritis. KDIGO/EULAR criteria.",
    keys: ["Purpuric rash (non-thrombocytopenic) + IgA deposits", "Urine microscopy at every visit", "Nephrotic/nephritic range: biopsy + IS", "ACEi/ARB for proteinuria, steroids for severe nephritis"], scenario: "iga-vasculitis" },
  { name: "Lupus Nephritis", tag: "GN", color: "bg-rose-100 text-rose-800",
    emergency: false,
    summary: "Class III/IV most common in children. ACR/EULAR 2019.",
    keys: ["ISN/RPS 2003 classes I–VI", "Induction: pulse methylprednisolone + MMF or cyclophosphamide", "Maintenance: MMF + hydroxychloroquine", "Target: urine protein <500 mg/day, normal C3/C4, anti-dsDNA falling"], scenario: "lupus-nephritis" },
  { name: "ANCA Vasculitis (GPA/MPA)", tag: "GN", color: "bg-red-100 text-red-800",
    emergency: true,
    summary: "RPGN + pulmonary haemorrhage emergency. Rituximab or CYC induction.",
    keys: ["PR3-ANCA (GPA) vs MPO-ANCA (MPA)", "Induction: RTX or IV CYC + high-dose steroids", "Plasma exchange if Cr >500 or dialysis-dependent", "Maintenance: RTX 500 mg Q6 monthly × 2 years"], scenario: "anca-vasculitis" },
  { name: "Anti-GBM / Goodpasture", tag: "GN", color: "bg-red-100 text-red-800",
    emergency: true,
    summary: "Linear IgG anti-GBM. RPGN + pulmonary haemorrhage. Urgent plasma exchange.",
    keys: ["Anti-GBM antibody titre", "Linear IgG on immunofluorescence", "Plasma exchange daily × 14 days", "CYC 2–3 mg/kg/day + pulse steroids"], scenario: "thrombotic-microangiopathy" },
  { name: "RPGN / Crescentic GN", tag: "GN", color: "bg-red-100 text-red-800",
    emergency: true,
    summary: "Rapid GFR loss + crescents on biopsy. Divide by IF pattern for treatment.",
    keys: ["Biopsy urgently: linear (anti-GBM) vs granular (immune) vs pauci-immune (ANCA)", "Pulse methylprednisolone 500–1000 mg/day × 3", "Plasma exchange for anti-GBM or severe ANCA", "Risk of dialysis dependence if >50% crescents"], scenario: "aki-prifle" },
  { name: "PSGL / Post-Streptococcal GN", tag: "GN", color: "bg-sky-100 text-sky-800",
    emergency: false,
    summary: "Acute nephritis 1–3 wks post strep. Usually self-limited.",
    keys: ["Haematuria + oedema + HTN + oliguria", "Low C3, normal C4, elevated ASO/Anti-DNase B", "'Humps' on EM: subepithelial deposits", "Supportive: diuretics, antihypertensives. Penicillin course."], scenario: "post-strep-gn" },
  { name: "Membranous Nephropathy", tag: "GN", color: "bg-violet-100 text-violet-800",
    emergency: false,
    summary: "PLA2R-positive in adults. Secondary causes common in children.",
    keys: ["PLA2R antibody (adults), secondary causes in children", "Subepithelial 'spikes' on silver stain", "Low-risk: RAAS blockade + watch", "High-risk: CsA or RTX + steroids"], scenario: "membranous-nephropathy" },
  { name: "Focal Segmental Glomerulosclerosis (FSGS)", tag: "GN", color: "bg-purple-100 text-purple-800",
    emergency: false,
    summary: "Most common cause of SRNS. Genetic and secondary forms.",
    keys: ["Podocin/NPHS2 mutations most common genetic cause", "Secondary: obesity, reflux, sickle cell, heroin", "CNI (tacrolimus) ± steroids for primary FSGS", "Rituximab for RTX-sensitive minimal change-like FSGS"], scenario: "steroid-resistant-ns" },
  { name: "C3 Glomerulopathy (C3G/MPGN)", tag: "GN", color: "bg-cyan-100 text-cyan-800",
    emergency: false,
    summary: "Complement-mediated. Low C3. Dense deposits or C3GN on IF.",
    keys: ["Low C3, normal C4 = alternative pathway activation", "IF: C3 dominant without Ig", "aHUS overlap: check CFH/CFI/MCP/C3 mutations", "Eculizumab for progressive C3G with complement mutations"], scenario: "thrombotic-microangiopathy" },
  // ── AKI ──────────────────────────────────────────────────────────────────
  { name: "AKI — Acute Kidney Injury", tag: "AKI", color: "bg-red-100 text-red-800",
    emergency: true,
    summary: "KDIGO staging by SCr rise/UO criteria. Identify cause and RRT triggers.",
    keys: ["KDIGO staging 1–3 by SCr rise or urine output", "Prerenal (volume, sepsis) vs intrinsic vs postrenal", "Stop nephrotoxins, optimise haemodynamics", "RRT: AEIOU — Acidosis, Electrolytes, Ingestion, Overload, Uraemia"], scenario: "aki-prifle" },
  { name: "HUS / STEC-HUS", tag: "AKI", color: "bg-red-100 text-red-800",
    emergency: true,
    summary: "Diarrhoea + microangiopathic haemolytic anaemia + AKI. No antibiotics.",
    keys: ["Shiga-toxin E. coli O157 (STEC) most common", "Avoid antibiotics (increase toxin release)", "Supportive: fluid management, transfuse if Hb <7", "Dialysis often required. Eculizumab: only atypical HUS (aHUS)"], scenario: "hemolytic-uremic" },
  { name: "aHUS / Complement-mediated TMA", tag: "AKI", color: "bg-red-100 text-red-800",
    emergency: true,
    summary: "Non-diarrhoeal TMA. Complement dysregulation. Eculizumab life-saving.",
    keys: ["Rule out STEC-HUS, ADAMTS13 deficiency (TTP)", "Genetic panel: CFH, CFI, MCP, C3, CFB, THBD", "Eculizumab: 900 mg IV weekly × 4, then 1200 mg Q2W", "Do not delay eculizumab pending genetics"], scenario: "thrombotic-microangiopathy" },
  // ── CKD ──────────────────────────────────────────────────────────────────
  { name: "CKD Staging & Management", tag: "CKD", color: "bg-blue-100 text-blue-800",
    emergency: false,
    summary: "KDIGO G1–G5 + albuminuria A1–A3. Nephroprotection strategy.",
    keys: ["KDIGO G1–G5 by eGFR, A1–A3 by albuminuria", "Schwartz/CKiD GFR estimation in children", "ACEi/ARB for proteinuric CKD >500 mg/day", "CKD-MBD: Ca, PO₄, PTH targets by stage"], scenario: "ckd-staging" },
  { name: "CKD-MBD (Bone & Mineral)", tag: "CKD", color: "bg-blue-100 text-blue-800",
    emergency: false,
    summary: "Mineral metabolism abnormalities in CKD. Renal osteodystrophy prevention.",
    keys: ["Monitor Ca, PO4, PTH, ALP, 25-OH Vit D", "Target PTH: 2–9× ULN for stage (KDIGO)", "Dietary phosphate restriction; binders if needed", "Active Vit D (calcitriol/alfacalcidol) for secondary HPT"], scenario: "ckd-mbd" },
  { name: "Anaemia of CKD", tag: "CKD", color: "bg-blue-100 text-blue-800",
    emergency: false,
    summary: "ESA therapy + IV iron. Hb target 10–12 g/dL.",
    keys: ["Evaluate iron stores first (TSAT >20%, ferritin >100)", "IV iron preferred (oral poorly absorbed in CKD)", "ESA (darbepoetin/EPO): start if Hb <10 after iron repletion", "Target Hb 10–12 g/dL; avoid >13 (risk thrombosis)"], scenario: "ckd-anemia-mbd" },
  // ── Electrolytes ──────────────────────────────────────────────────────────
  { name: "Hyperkalaemia (K+ >5.5)", tag: "Electrolyte", color: "bg-orange-100 text-orange-800",
    emergency: true,
    summary: "Cardiac arrest risk at K+ >6.5. Treat ECG changes immediately.",
    keys: ["K+ >6 or ECG changes: IV calcium gluconate 10% 0.5–1 mL/kg", "Shift K+: insulin-dextrose (0.1 U/kg + D25 2 mL/kg)", "Salbutamol nebulisation (binds K+ into cells)", "Remove K+: resonium / patiromer; dialysis if refractory"], scenario: "hyperkalemia" },
  { name: "Hyponatraemia", tag: "Electrolyte", color: "bg-cyan-100 text-cyan-800",
    emergency: true,
    summary: "Serum Na <135 mEq/L. Correct ≤10 mEq/L/24h to avoid ODS.",
    keys: ["Assess serum osmolality + urine Na + urine osmolality", "SIADH (urine Na>20, urine osm>300, euvolaemic)", "Symptomatic (<125 + seizures): 3% NaCl 2 mL/kg bolus", "Max correction rate: 10 mEq/L/24h"], scenario: "hyponatremia" },
  { name: "Hypernatraemia", tag: "Electrolyte", color: "bg-cyan-100 text-cyan-800",
    emergency: true,
    summary: "Na >145 mEq/L. Usually water deficit. Slow correction to avoid cerebral oedema.",
    keys: ["Calculate free water deficit", "Correct ≤10–12 mEq/L/24h (chronic >48h)", "DI: DDAVP for central DI", "Hyperaldosteronism: fludrocortisone trial"], scenario: "fluid-electrolyte" },
  { name: "Metabolic Acidosis / RTA", tag: "Tubular", color: "bg-amber-100 text-amber-800",
    emergency: false,
    summary: "Non-AG acidosis with normal anion gap. Urine anion gap distinguishes dRTA from GI loss.",
    keys: ["Anion gap = Na − (Cl + HCO3). Normal <12", "Non-AG: urine anion gap (UAG) = Na + K − Cl", "Positive UAG = dRTA (Type 1). Negative = GI loss", "Type 2 pRTA: Fanconi; Type 4: hyperkalaemia + low renin/aldo"], scenario: "rta-diagnosis" },
  { name: "Hypocalcaemia", tag: "Electrolyte", color: "bg-amber-100 text-amber-800",
    emergency: true,
    summary: "Corrected Ca <8.5 mg/dL. Tetany/seizures at <7 mg/dL.",
    keys: ["Correct for albumin: Ca + 0.8 × (4 − albumin)", "Symptomatic: IV calcium gluconate 10% 1–2 mL/kg slowly", "Check Mg, PTH, Vit D", "Chronic: oral calcium + active Vit D supplements"], scenario: "hypocalcemia" },
  { name: "Proteinuria Workup", tag: "Diagnostic", color: "bg-teal-100 text-teal-800",
    emergency: false,
    summary: "UPCR >0.2 mg/mg significant in children. Distinguishes nephrotic vs subnephrotic.",
    keys: ["UPCR: >0.2 mg/mg = significant; >2 = nephrotic range", "Orthostatic vs persistent (early morning specimen)", "Nephrotic range + symptoms: biopsy if atypical", "Microalbuminuria: screen in DM, HTN, CKD"], scenario: "proteinuria-approach" },
  { name: "Haematuria Pathway", tag: "Diagnostic", color: "bg-rose-100 text-rose-800",
    emergency: false,
    summary: "Glomerular vs non-glomerular differentiation. Dysmorphic RBCs and RBC casts = glomerular.",
    keys: ["Phase contrast: dysmorphic RBCs = glomerular", "Acanthocytes (G1 cells) >5% = glomerular", "IgAN: episodic macrohaematuria post-URTI", "Full panel: ASO, ANA, ANCA, C3, C4, anti-dsDNA"], scenario: "hematuria-approach" },
  // ── Dialysis & RRT ────────────────────────────────────────────────────────
  { name: "Peritoneal Dialysis", tag: "Dialysis", color: "bg-indigo-100 text-indigo-800",
    emergency: false,
    summary: "First-choice RRT in children <20 kg. ISPD evidence-based.",
    keys: ["CAPD vs APD; ISPD guidelines for prescriptions", "Peritonitis: cloudy effluent + WBC>100/mm³", "Empirical: vancomycin + ceftazidime IP", "Adequacy: weekly Kt/V ≥1.7"], scenario: "peritoneal-dialysis" },
  { name: "Haemodialysis in Children", tag: "Dialysis", color: "bg-indigo-100 text-indigo-800",
    emergency: false,
    summary: "Preferred for older children/adolescents. Kt/V ≥1.2 per session.",
    keys: ["Access: AVF preferred (long-term); CVC for acute", "Target Kt/V ≥1.2 per session", "Anticoagulation: UFH (LMWH in neonates)", "Intradialytic hypotension: fluid management"], scenario: "hemodialysis" },
  { name: "CRRT / SLED", tag: "Dialysis", color: "bg-indigo-100 text-indigo-800",
    emergency: true,
    summary: "ICU AKI management. Dose 20–25 mL/kg/h. Regional citrate anticoagulation preferred.",
    keys: ["Dose: 20–25 mL/kg/h (prescribed 25–30 to account for down-time)", "Regional citrate anticoagulation preferred in bleeding risk", "Monitor: ionised Ca every 6h when on citrate", "Filter life: typically 24–72h; change if clotted"], scenario: "crrt" },
  // ── Transplant ────────────────────────────────────────────────────────────
  { name: "Renal Transplant", tag: "Transplant", color: "bg-green-100 text-green-800",
    emergency: false,
    summary: "Standard IS: Tacrolimus + MMF + prednisolone. Annual surveillance.",
    keys: ["Tacrolimus target: 8–12 ng/mL (early), 5–8 ng/mL (maintenance)", "MMF: 1200 mg/m²/day in 2 divided doses", "Acute rejection: pulse methylprednisolone 10 mg/kg × 3", "Annual: eGFR, proteinuria, DSA, BK PCR"], scenario: "kidney-transplant" },
  { name: "Transplant Rejection", tag: "Transplant", color: "bg-green-100 text-green-800",
    emergency: true,
    summary: "Rising creatinine post-Tx. Banff criteria. Treat TCMR vs AMR differently.",
    keys: ["Rising Cr + graft tenderness = urgent biopsy", "TCMR: pulse steroids; severe: anti-thymocyte globulin", "AMR: IVIG + plasma exchange + rituximab", "BK nephropathy: reduce IS (stop MMF first)"], scenario: "transplant-rejection" },
  // ── Hypertension ─────────────────────────────────────────────────────────
  { name: "Paediatric Hypertension", tag: "HTN", color: "bg-pink-100 text-pink-800",
    emergency: false,
    summary: "AAP 2017 definitions by age/sex/height percentiles.",
    keys: ["Normal <90th percentile", "Elevated: 90–95th; Stage 1: 95–99th+5mmHg; Stage 2: >99th+5mmHg", "Secondary workup: renal USS, DMSA, renal artery Doppler", "First-line drug: ACEi/ARB (proteinuria) or CCB (no proteinuria)"], scenario: "htn-diagnosis" },
  { name: "HTN Emergency", tag: "HTN", color: "bg-red-100 text-red-800",
    emergency: true,
    summary: "Severe HTN + end-organ damage. MAP reduction ≤25% in first hour is UPPER LIMIT not target.",
    keys: ["IV access + continuous BP monitoring", "IV labetalol or nicardipine infusion first-line", "MAP reduction: ≤25% in first hour (upper limit — not target!)", "Avoid nifedipine sublingual (unpredictable drop)"], scenario: "htn-emergency" },
  // ── Stones & Tubular ─────────────────────────────────────────────────────
  { name: "Renal Stone Disease", tag: "Urological", color: "bg-yellow-100 text-yellow-800",
    emergency: false,
    summary: "24h urine analysis essential. Identify metabolic risk factors.",
    keys: ["24h urine: Ca, oxalate, citrate, urate, volume", "Hypercalciuria: thiazide diuretics", "Hyperoxaluria: Vit B6, hydration; PH1: lumasiran/liver-Tx", "Cystinuria: D-penicillamine/tiopronin + alkalinisation"], scenario: "renal-stone" },
  { name: "Nephrocalcinosis / Nephrolithiasis", tag: "Tubular", color: "bg-amber-100 text-amber-800",
    emergency: false,
    summary: "Calcium deposits in renal parenchyma. Associated with dRTA, HPT, hypercalcaemia.",
    keys: ["Medullary (cortical rare) — check Ca, PO4, PTH, Vit D", "dRTA: hypercalciuria + alkaline urine + distal gradient failure", "Primary HPT: elevated PTH + Ca; parathyroidectomy", "Rare: Bartter, FHHNC (CLDN16/CLDN19)"], scenario: "nephrocalcinosis" },
];

const TAGS = ["All", "GN", "AKI", "CKD", "Electrolyte", "Tubular", "Dialysis", "Transplant", "HTN", "Diagnostic", "Urological"];
const EMPTY_PATHWAY = { name: "", tag: "GN", color: "bg-blue-100 text-blue-800", emergency: false, summary: "", keys: [""], scenario: "" };

export default function HubNephrologyPathways() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState("");
  const [customPathways, setCustomPathways] = useState(() => {
    try { return JSON.parse(localStorage.getItem("custom_pathways") || "[]"); } catch { return []; }
  });
  const [editModal, setEditModal] = useState(null); // null | { mode: "add"|"edit", idx, pathway, isCustom }

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 60000,
  });
  const isAdmin = user?.role === "admin";

  const saveCustom = (updated) => {
    setCustomPathways(updated);
    localStorage.setItem("custom_pathways", JSON.stringify(updated));
  };

  const openAdd = () => setEditModal({ mode: "add", pathway: { ...EMPTY_PATHWAY }, isCustom: true });
  const openEdit = (pathway, idx, isCustom) => setEditModal({ mode: "edit", idx, pathway: { ...pathway, keys: [...pathway.keys] }, isCustom });

  const handleSave = () => {
    const p = editModal.pathway;
    if (!p.name.trim()) return;
    if (editModal.mode === "add") {
      saveCustom([...customPathways, p]);
    } else if (editModal.isCustom) {
      const updated = [...customPathways];
      updated[editModal.idx] = p;
      saveCustom(updated);
    }
    setEditModal(null);
  };

  // Tracks built-in pathways hidden by admin
  const [hiddenBuiltinIndices, setHiddenBuiltinIndices] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hidden_builtin_pathways") || "[]"); } catch { return []; }
  });

  const hideBuiltin = (pathwayName) => {
    const updated = [...hiddenBuiltinIndices, pathwayName];
    setHiddenBuiltinIndices(updated);
    localStorage.setItem("hidden_builtin_pathways", JSON.stringify(updated));
    setOpen(null);
  };

  const handleDelete = (pathway, idx, isCustom) => {
    if (isCustom) {
      const updated = customPathways.filter((_, i) => i !== idx);
      saveCustom(updated);
    } else {
      if (!confirm(`Hide "${pathway.name}" from the list? (Admin only, reversible via browser storage)`)) return;
      hideBuiltin(pathway.name);
    }
    setOpen(null);
  };

  const allPathways = [
    ...PATHWAYS.filter(p => !hiddenBuiltinIndices.includes(p.name)),
    ...customPathways.map(p => ({ ...p, _isCustom: true }))
  ];

  const filtered = allPathways.filter(p => {
    const matchTag = filter === "All" || p.tag === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q) || p.summary?.toLowerCase().includes(q);
    return matchTag && matchSearch;
  });

  const emergencyList = filtered.filter(p => p.emergency);
  const otherList = filtered.filter(p => !p.emergency);

  const goToPathway = (scenario) => {
    navigate(`/ClinicalSupport?tab=pathways&scenario=${scenario}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-800 to-indigo-700 p-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            <div>
              <h2 className="text-base font-bold">Nephrology Clinical Pathways</h2>
              <p className="text-blue-100 text-xs">KDIGO · ISPN · IPNA · AAP · ISKDC — {PATHWAYS.length} pathways</p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <button onClick={openAdd}
                className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-full border border-white/30 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
              <AdminPathwayGenerator specialty="Nephrology" onCreated={() => {}} />
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search pathways…"
        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      {/* Tag filter */}
      <div className="flex flex-wrap gap-1.5">
        {TAGS.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filter === t ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Emergency strip */}
      {emergencyList.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Emergency Pathways</span>
          </div>
          <div className="space-y-1.5">
            {emergencyList.map((pathway, i) => (
              <PathwayCard key={`e-${i}`} pathway={pathway} idx={`e-${i}`} open={open} setOpen={setOpen} goToPathway={goToPathway} isAdmin={isAdmin} onEdit={() => openEdit(pathway, customPathways.indexOf(pathway), pathway._isCustom)} onDelete={() => handleDelete(pathway, customPathways.indexOf(pathway), pathway._isCustom)} />
            ))}
          </div>
        </div>
      )}

      {/* Regular pathways */}
      {otherList.length > 0 && (
        <div className="space-y-1.5">
          {emergencyList.length > 0 && (
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">All Pathways</p>
          )}
          {otherList.map((pathway, i) => (
            <PathwayCard key={`p-${i}`} pathway={pathway} idx={`p-${i}`} open={open} setOpen={setOpen} goToPathway={goToPathway} isAdmin={isAdmin} onEdit={() => openEdit(pathway, customPathways.indexOf(pathway), pathway._isCustom)} onDelete={() => handleDelete(pathway, customPathways.indexOf(pathway), pathway._isCustom)} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No pathways match your search</p>
        </div>
      )}

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-3">
          <p className="text-xs font-bold text-slate-500 mb-1">References</p>
          <p className="text-xs text-slate-600">KDIGO 2021–2024 · ISPN Guidelines · IPNA Clinical Practice Recommendations · AAP 2017 BP · ISKDC Protocol · EULAR/ACR 2019 · KDOQI · ISPD 2022</p>
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-3 pb-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">{editModal.mode === "add" ? "Add New Pathway" : "Edit Pathway"}</h3>
              <button onClick={() => setEditModal(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Pathway Name *</label>
                <input value={editModal.pathway.name} onChange={e => setEditModal(m => ({ ...m, pathway: { ...m.pathway, name: e.target.value } }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="e.g. IgA Nephropathy" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tag</label>
                  <select value={editModal.pathway.tag} onChange={e => setEditModal(m => ({ ...m, pathway: { ...m.pathway, tag: e.target.value } }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
                    {["GN","AKI","CKD","Electrolyte","Tubular","Dialysis","Transplant","HTN","Diagnostic","Urological"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="emerg" checked={editModal.pathway.emergency} onChange={e => setEditModal(m => ({ ...m, pathway: { ...m.pathway, emergency: e.target.checked } }))} className="w-4 h-4" />
                  <label htmlFor="emerg" className="text-sm text-slate-600 font-medium">Emergency</label>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Summary</label>
                <textarea value={editModal.pathway.summary} onChange={e => setEditModal(m => ({ ...m, pathway: { ...m.pathway, summary: e.target.value } }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 h-16 resize-none" placeholder="Brief description" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Key Points (one per line)</label>
                <textarea value={editModal.pathway.keys.join("\n")} onChange={e => setEditModal(m => ({ ...m, pathway: { ...m.pathway, keys: e.target.value.split("\n") } }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 h-28 resize-none" placeholder="Key point 1&#10;Key point 2&#10;Key point 3" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
                  <Check className="w-3.5 h-3.5 mr-1" /> Save Pathway
                </Button>
                <Button onClick={() => setEditModal(null)} size="sm" variant="outline">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PathwayCard({ pathway, idx, open, setOpen, goToPathway, isAdmin, onEdit, onDelete }) {
  return (
    <Card className={`border-slate-200 shadow-sm ${pathway.emergency ? "border-l-4 border-l-red-500" : ""} ${pathway._isCustom ? "border-l-4 border-l-amber-400" : ""}`}>
      <CardContent className="p-0">
        <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(open === idx ? null : idx)}>
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            {pathway.emergency && <Zap className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
            <span className="font-semibold text-sm text-slate-800">{pathway.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pathway.color}`}>{pathway.tag}</span>
            {pathway._isCustom && <span className="text-xs text-amber-600 font-medium">Custom</span>}
          </div>
          {open === idx ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />}
        </button>
        {open === idx && (
          <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-2">
            {pathway.summary && (
              <p className="text-xs text-slate-500 italic leading-relaxed">{pathway.summary}</p>
            )}
            <div className="space-y-1">
              {pathway.keys.filter(k => k.trim()).map((k, j) => (
                <div key={j} className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700">{k}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {pathway.scenario && (
                <Button size="sm" variant="outline"
                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50 h-7"
                  onClick={() => goToPathway(pathway.scenario)}>
                  <ExternalLink className="w-3 h-3 mr-1" /> Full Pathway
                </Button>
              )}
              {isAdmin && (
                <>
                  <Button size="sm" variant="outline"
                    className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50 h-7"
                    onClick={onEdit}>
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline"
                    className="text-xs border-red-200 text-red-600 hover:bg-red-50 h-7"
                    onClick={onDelete}>
                    <Trash2 className="w-3 h-3 mr-1" /> {pathway._isCustom ? "Delete" : "Hide"}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}