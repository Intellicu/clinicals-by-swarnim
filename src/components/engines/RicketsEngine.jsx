/**
 * Rickets Diagnostic & Management Engine
 * Based on: IAP STG 2022, Haffner et al Pediatric Nephrology 2022, Levine 2020 Frontiers Pediatrics
 * Algorithm: Suspected Rickets → ALP↑ → PTH+Ca+Pi → Calcipenic vs Phosphopenic → specific subtype
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Bone, AlertTriangle, CheckCircle, Info } from "lucide-react";

const InfoBox = ({ title, color = "blue", items, children }) => {
  const styles = {
    blue: "border-blue-300 bg-blue-50",
    green: "border-green-300 bg-green-50",
    amber: "border-amber-300 bg-amber-50",
    red: "border-red-300 bg-red-50",
    violet: "border-violet-300 bg-violet-50",
    orange: "border-orange-300 bg-orange-50",
    teal: "border-teal-300 bg-teal-50",
  };
  const titleColors = {
    blue: "text-blue-900", green: "text-green-900", amber: "text-amber-900",
    red: "text-red-900", violet: "text-violet-900", orange: "text-orange-900", teal: "text-teal-900"
  };
  return (
    <div className={`rounded-xl border-2 p-3 ${styles[color]}`}>
      {title && <p className={`font-bold text-sm mb-2 ${titleColors[color]}`}>{title}</p>}
      {items && <ul className="space-y-1">{items.map((it, i) => <li key={i} className="text-xs text-slate-700 flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">→</span><span>{it}</span></li>)}</ul>}
      {children}
    </div>
  );
};

const Q = ({ question, note, explanation, options, onSelect }) => (
  <div className="space-y-2">
    <p className="font-semibold text-sm text-slate-800">{question}</p>
    {explanation && <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-600 italic">{explanation}</div>}
    {note && <p className="text-xs text-slate-500 italic">{note}</p>}
    {options.map(opt => (
      <button key={opt.label} onClick={() => onSelect(opt.next)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 transition-all text-left">
        <div>
          <span className="text-sm font-medium text-slate-700">{opt.label}</span>
          {opt.reason && <p className="text-xs text-slate-500 mt-0.5">{opt.reason}</p>}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
      </button>
    ))}
  </div>
);

const STEPS = {
  START: "start",
  ALP_CHECK: "alp_check",
  HYPOPHOSPHATASIA: "hypophosphatasia",
  PTH_CA_PI: "pth_ca_pi",
  EXCLUDE_RENAL: "exclude_renal",
  RENAL_RICKETS: "renal_rickets",
  CALCIPENIC: "calcipenic",
  PHOSPHOPENIC: "phosphopenic",
  VITD_25OHD: "vitd_25ohd",
  VDDR_1A: "vddr_1a",
  VDDR_1B: "vddr_1b",
  VDDR_2: "vddr_2",
  NUTRITIONAL_VDD: "nutritional_vdd",
  CALCIUM_DEFICIENCY: "calcium_deficiency",
  URINE_PO4: "urine_po4",
  FGF23_CHECK: "fgf23_check",
  XLH_ADHR_ARHR: "xlh_adhr_arhr",
  HHRH_FANCONI: "hhrh_fanconi",
  DIETARY_PHOS: "dietary_phos",
  RTA_RICKETS: "rta_rickets",
  TREAT_NUTRITIONAL: "treat_nutritional",
};

export default function RicketsEngine() {
  const [step, setStep] = useState(STEPS.START);
  const [history, setHistory] = useState([]);

  const go = (next) => { setHistory(h => [...h, step]); setStep(next); };
  const back = () => {
    const prev = history[history.length - 1];
    if (prev) { setHistory(h => h.slice(0, -1)); setStep(prev); }
  };
  const reset = () => { setStep(STEPS.START); setHistory([]); };

  const NavBtns = () => (
    <div className="flex gap-2 pt-2">
      {history.length > 0 && <Button variant="outline" size="sm" className="flex-1" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>}
      <Button variant="outline" size="sm" className="flex-1" onClick={reset}>Restart</Button>
    </div>
  );

  const renderStep = () => {
    switch (step) {

      case STEPS.START:
        return (
          <div className="space-y-3">
            <InfoBox title="Rickets — Recognition & Suspicion" color="amber">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-amber-900">Suspect rickets when:</p>
                {[
                  "Elevated Alkaline Phosphatase (ALP) — osteoblast bone marker ↑ in ALL forms",
                  "Clinical signs: genu vara/valgum, rachitic rosary, wrist widening, frontal bossing, craniotabes, delayed fontanelle closure",
                  "Radiological signs: metaphyseal fraying, cupping, splaying + widening of growth plate on wrist/knee X-ray",
                  "Growth failure, muscle weakness, bone pain, hypocalcaemic seizures (infants)",
                  "NB: Diagnosis of rickets REQUIRES radiological confirmation",
                ].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
                <div className="mt-2 p-2 bg-amber-100 rounded-lg">
                  <p className="font-bold text-amber-900">ALP Interpretation:</p>
                  <p className="text-amber-800">• Very high (10-fold, &gt;2000 U): Calcipenic (nutritional) rickets</p>
                  <p className="text-amber-800">• Moderately high (1-3× = 400-800 U): Phosphopenic rickets</p>
                  <p className="text-amber-800">• Normal or LOW ALP: Consider Hypophosphatasia, Blount's disease, metaphyseal dysplasia</p>
                </div>
              </div>
            </InfoBox>
            <InfoBox color="blue" title="First Steps — Exclude Confounders">
              <div className="mt-1 text-xs space-y-1">
                {[
                  "Check serum bicarbonate + creatinine → exclude chronic kidney disease (CKD) and metabolic acidosis (RTA)",
                  "Check liver function (LFT) → elevated ALP may be hepatic, not bone",
                  "Confirm radiological rickets (X-ray wrist or knee) before extensive workup",
                ].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
              </div>
            </InfoBox>
            <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white" onClick={() => go(STEPS.ALP_CHECK)}>Start Diagnostic Algorithm →</Button>
          </div>
        );

      case STEPS.ALP_CHECK:
        return (
          <div className="space-y-3">
            <Q question="Is Alkaline Phosphatase (ALP) LOW or normal, despite clinical/radiological rickets?"
              explanation="Low ALP with rickets-like picture is paradoxical — this points to Hypophosphatasia (ALPL gene mutation — deficiency of tissue non-specific ALP prevents bone mineralisation). This is NOT true rickets."
              onSelect={go}
              options={[
                { label: "YES — ALP is low or normal", next: STEPS.HYPOPHOSPHATASIA, reason: "Suggests Hypophosphatasia or differential diagnosis" },
                { label: "NO — ALP is elevated (as expected in rickets)", next: STEPS.EXCLUDE_RENAL, reason: "Proceed with rickets algorithm" },
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.HYPOPHOSPHATASIA:
        return (
          <div className="space-y-3">
            <InfoBox title="⚠ Low ALP — Consider Hypophosphatasia or Differential" color="red">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-red-900">Hypophosphatasia (HPP):</p>
                {[
                  "ALPL gene mutation → deficiency of tissue-nonspecific alkaline phosphatase",
                  "Results in impaired bone mineralisation DESPITE low/normal ALP",
                  "Biochemical: ↓ALP, ↑serum PLP (pyridoxal 5'-phosphate), ↑urine phosphoethanolamine",
                  "Premature loss of deciduous teeth (before age 5, without trauma — pathognomonic)",
                  "Treatment: Asfotase alfa (enzyme replacement) — specialist referral essential",
                ].map((c, i) => <p key={i} className="text-red-800">• {c}</p>)}
                <p className="font-bold text-red-900 mt-2">Other differentials with low ALP + bone deformity:</p>
                {["Blount's disease (tibia vara — mechanical, not metabolic)", "Metaphyseal dysplasia (skeletal dysplasia — no biochemical rickets)", "Osteogenesis imperfecta (multiple fractures ± blue sclera)"].map((c, i) => <p key={i} className="text-red-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.EXCLUDE_RENAL:
        return (
          <div className="space-y-3">
            <Q question="Is serum creatinine elevated (eGFR reduced) or is there metabolic acidosis (low bicarbonate)?"
              explanation="CKD causes renal osteodystrophy — a distinct entity from nutritional rickets. Metabolic acidosis without elevated creatinine suggests Renal Tubular Acidosis (RTA) which causes calcipenic + phosphopenic rickets."
              onSelect={go}
              options={[
                { label: "YES — Elevated creatinine (reduced eGFR)", next: STEPS.RENAL_RICKETS, reason: "CKD-related renal osteodystrophy" },
                { label: "YES — Metabolic acidosis with NORMAL creatinine", next: STEPS.RTA_RICKETS, reason: "Suspect RTA (distal or proximal)" },
                { label: "NO — Normal creatinine, normal bicarbonate", next: STEPS.PTH_CA_PI, reason: "Proceed to classify rickets type" },
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.RENAL_RICKETS:
        return (
          <div className="space-y-3">
            <InfoBox title="Renal Rickets — CKD-related Osteodystrophy" color="violet">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-violet-900">Pathophysiology:</p>
                {[
                  "Reduced 1α-hydroxylation of 25(OH)D → low calcitriol → impaired calcium absorption",
                  "Secondary hyperparathyroidism: PTH↑↑ → renal phosphate wasting + bone resorption",
                  "Biochemistry: Ca↓/N, Pi↑ (reduced excretion), ALP↑, PTH↑↑, 25(OH)D variable, 1,25(OH)₂D↓",
                ].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
                <p className="font-bold text-violet-900 mt-2">Management (KDIGO CKD-MBD):</p>
                {[
                  "Calcitriol (1,25-OH-VitD3) 0.01–0.05 µg/kg/day — required (1α-hydroxylation is impaired)",
                  "Calcium supplements + phosphate binders (if phosphate elevated)",
                  "Target: Ca low-normal, Pi normal, PTH within CKD-stage-specific targets",
                  "Monitor: Ca, Pi, PTH, ALP every 3 months (CKD G4-G5)",
                  "Avoid hypercalcaemia → calcification risk",
                ].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.RTA_RICKETS:
        return (
          <div className="space-y-3">
            <InfoBox title="Renal Tubular Acidosis (RTA) — Causing Rickets" color="orange">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-orange-900">Why does RTA cause rickets?</p>
                {[
                  "Chronic metabolic acidosis → calcium released from bone (buffers H⁺) → bone demineralisation",
                  "Acidosis also impairs 1α-hydroxylase activity → less calcitriol",
                  "Distal RTA (Type 1): urine pH always >5.5 even in acidosis, nephrocalcinosis, hypokalaemia",
                  "Proximal RTA (Type 2): Fanconi syndrome — generalised tubular wasting (glucosuria, aminoaciduria, phosphaturia)",
                ].map((c, i) => <p key={i} className="text-orange-800">• {c}</p>)}
                <p className="font-bold text-orange-900 mt-2">Key Investigations:</p>
                {[
                  "Urine pH (spot + during acidosis), ABG, urine anion gap, urine PCO₂",
                  "Urine glucose, amino acids, β₂-microglobulin (Fanconi markers)",
                  "Urine Ca/Cr ratio, renal ultrasound (nephrocalcinosis in dRTA)",
                  "Genetic panel: SLC4A1 (dRTA type 4), ATP6V1B1, ATP6V0A4, WDR72",
                ].map((c, i) => <p key={i} className="text-orange-800">• {c}</p>)}
                <p className="font-bold text-orange-900 mt-2">Treatment:</p>
                {[
                  "Alkali supplementation: sodium/potassium citrate 2–4 mEq/kg/day (correct acidosis first!)",
                  "Rickets heals with acid correction — do NOT give high-dose Vit D alone",
                  "Proximal RTA/Fanconi: treat underlying cause (cystinosis → cysteamine)",
                  "Monitor urine Ca/Cr (hypercalciuria worsens with alkali if nephrocalcinosis)",
                ].map((c, i) => <p key={i} className="text-orange-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.PTH_CA_PI:
        return (
          <div className="space-y-3">
            <InfoBox color="blue" title="Step 1: Measure Serum PTH, Calcium (Ca), and Phosphate (Pi)">
              <div className="mt-1 text-xs space-y-1">
                <p className="font-bold text-blue-900">Why PTH first?</p>
                <p className="text-blue-800">• PTH drives the classification — HIGH PTH = calcipenic (calcium problem), NORMAL/LOW PTH = phosphopenic (phosphate problem)</p>
                <p className="text-blue-800">• Reason: Low Ca → parathyroid glands sense → PTH secreted → PTH raises Ca by bone resorption + renal Ca retention + phosphate excretion</p>
                <p className="text-blue-800">• In phosphopenic rickets, Ca is maintained NORMAL by compensatory mechanisms → PTH is NOT stimulated</p>
              </div>
            </InfoBox>
            <Q question="What is the PTH result?"
              onSelect={go}
              options={[
                { label: "PTH HIGH + Ca low/normal + Pi low/normal", next: STEPS.CALCIPENIC, reason: "→ Calcipenic (hypocalcaemic) rickets" },
                { label: "PTH NORMAL or mildly elevated + Pi LOW + Ca normal", next: STEPS.PHOSPHOPENIC, reason: "→ Phosphopenic (hypophosphataemic) rickets" },
                { label: "PTH NORMAL + Pi normal + Ca normal — all normal", next: STEPS.DIETARY_PHOS, reason: "→ Early/healing stage, dietary phosphate deficiency, or consider primary bone disorder" },
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.CALCIPENIC:
        return (
          <div className="space-y-3">
            <InfoBox color="blue" title="Calcipenic Rickets Confirmed — PTH↑, Ca↓/N, Pi↓">
              <div className="mt-1 text-xs">
                <p className="text-blue-800">Calcipenic rickets = impaired CALCIUM availability → secondary PTH elevation → phosphaturia → low Pi</p>
                <p className="text-blue-800 mt-1">Key feature distinguishing subtypes: <strong>Serum 25(OH)D level</strong></p>
              </div>
            </InfoBox>
            <InfoBox color="amber" title="Clinical Clues — Calcipenic vs Phosphopenic">
              <div className="mt-1 text-xs space-y-0.5">
                {[
                  "Calcipenic: muscle weakness +, all extremities, tetany ±, enamel hypoplasia ±, osteopenia, ALP very high",
                  "Phosphopenic: predominantly LOWER limbs, dental abscess (XLH), NO muscle weakness, NO tetany",
                  "Alopecia → strongly suggests VDDR type 2A (VDR gene mutation)",
                ].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
              </div>
            </InfoBox>
            <Q question="What is the serum 25(OH)D (25-hydroxy Vitamin D) level?"
              explanation="25(OH)D reflects body vitamin D stores. In nutritional VDD it is LOW. In VDDR where the defect is in activation/action (not stores), 25(OH)D may be normal."
              onSelect={go}
              options={[
                { label: "25(OH)D LOW (<12 ng/mL or <30 nmol/L)", next: STEPS.NUTRITIONAL_VDD, reason: "→ Nutritional Vitamin D deficiency (most common) or dietary Ca deficiency" },
                { label: "25(OH)D VERY LOW/undetectable + 1,25(OH)₂D also LOW", next: STEPS.VDDR_1B, reason: "→ VDDR type 1B (CYP2R1 — hepatic 25-hydroxylase defect)" },
                { label: "25(OH)D Normal/High + 1,25(OH)₂D LOW", next: STEPS.VDDR_1A, reason: "→ VDDR type 1A (CYP27B1 — renal 1α-hydroxylase defect)" },
                { label: "25(OH)D Normal + 1,25(OH)₂D VERY HIGH (↑↑↑)", next: STEPS.VDDR_2, reason: "→ VDDR type 2A or 2B (VDR/receptor resistance)" },
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.NUTRITIONAL_VDD:
        return (
          <div className="space-y-3">
            <InfoBox title="Nutritional Vitamin D Deficiency / Dietary Calcium Deficiency" color="green">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-green-900">Most common cause of rickets globally (85-90%)</p>
                <p className="font-bold text-green-900">Pathophysiology:</p>
                {[
                  "Low VitD → ↓1,25(OH)₂D → ↓intestinal Ca absorption → ↓serum Ca → secondary PTH↑ → phosphaturia → Pi↓",
                  "Low dietary Ca also directly → ↓serum Ca → secondary PTH↑ (same pathway)",
                  "Both ultimately cause low phosphate at growth plate → impaired mineralisation",
                ].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                <p className="font-bold text-green-900 mt-2">25(OH)D Interpretation (IAP 2021):</p>
                <p className="text-green-800">• Deficiency: &lt;12 ng/mL (treat); Insufficiency: 12-20 ng/mL; Sufficiency: &gt;20 ng/mL</p>
                <p className="text-green-800">• Toxicity: &gt;100 ng/mL with hypercalcaemia/hypercalciuria</p>
                <p className="font-bold text-green-900 mt-2">Treatment (IAP/WHO 2022):</p>
                {[
                  "&lt;6 months: VitD3 2000 IU/day × 12 weeks + Ca 50-75 mg/kg/day (max 500 mg/day)",
                  "6-12 months: VitD3 2000 IU/day OR 60,000 IU monthly × 3 + Ca as above",
                  "&gt;12 months: VitD3 3000 IU/day OR 60,000 IU fortnightly × 5 doses + Ca as above",
                  "Maintenance after treatment: 400-600 IU/day (infants); dietary sources + sunlight (older)",
                  "Do NOT use calcitriol/alfacalcidol for nutritional rickets — 1α-hydroxylation is intact",
                  "Repeat X-ray at 4 and 12 weeks to assess healing",
                  "Dietary Ca deficiency: ensure Ca intake 50-75 mg/kg/day before Vit D therapy",
                ].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                <div className="mt-2 p-2 bg-green-100 rounded-lg">
                  <p className="font-bold text-green-900">Refractory — no healing at 3 months?</p>
                  <p className="text-green-800">Consider non-nutritional causes. Check compliance, malabsorption (coeliac disease, IBD). Check VDDR subtypes.</p>
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.VDDR_1A:
        return (
          <div className="space-y-3">
            <InfoBox title="VDDR Type 1A — CYP27B1 Mutation (1α-hydroxylase deficiency)" color="violet">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-violet-900">Why: The kidney cannot convert 25(OH)D → 1,25(OH)₂D (active calcitriol)</p>
                {[
                  "Gene: CYP27B1 (chromosome 12q13.3); autosomal recessive",
                  "25(OH)D: Normal or elevated (stores intact — hepatic hydroxylation works)",
                  "1,25(OH)₂D: LOW or undetectable (renal activation step blocked)",
                  "PTH: very high; Ca low; Pi low; ALP very high",
                  "Onset: 2-24 months — normal at birth",
                  "Clinical: hypotonia, irritability, tetany, seizures, then skeletal rickets + growth failure",
                ].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
                <p className="font-bold text-violet-900 mt-2">Treatment:</p>
                {[
                  "Calcitriol (1,25-OH-VitD3) 0.3-2 µg/day OR alfacalcidol 0.5-3 µg/day — lifelong",
                  "Ca supplementation: 30-75 mg/kg/day elemental Ca",
                  "Regular monitoring: Ca, Pi, PTH, urine Ca/Cr (hypercalciuria risk)",
                  "Plain Vitamin D is NOT effective (1α-hydroxylation step is defective)",
                ].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.VDDR_1B:
        return (
          <div className="space-y-3">
            <InfoBox title="VDDR Type 1B — CYP2R1 Mutation (hepatic 25-hydroxylase deficiency)" color="violet">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-violet-900">Why: The liver cannot convert Vitamin D → 25(OH)D properly</p>
                {[
                  "Gene: CYP2R1 (chromosome 11p15.2); autosomal recessive",
                  "25(OH)D: Very LOW or undetectable (hepatic hydroxylation step blocked)",
                  "1,25(OH)₂D: also low (because substrate 25(OH)D is depleted)",
                  "Phenotype may improve with age — sex hormones at puberty can induce vitamin D-independent Ca absorption",
                  "Differentiated from nutritional VDD: fails to respond to standard vitamin D doses; 25(OH)D remains low despite supplementation",
                ].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
                <p className="font-bold text-violet-900 mt-2">Treatment:</p>
                {[
                  "Calcifediol (25-OH-Vit D3) 20-50 µg/day OR very high dose cholecalciferol 100-200 µg/day",
                  "Calcitriol can also be used (0.3-2 µg/day) with Ca supplementation",
                  "Genetic confirmation recommended",
                ].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.VDDR_2:
        return (
          <div className="space-y-3">
            <InfoBox title="VDDR Type 2A/2B — VDR Resistance (Receptor-level defect)" color="red">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-red-900">Why: 1,25(OH)₂D is produced but cannot act — VDR (Vitamin D Receptor) is defective</p>
                <p className="font-bold text-red-900 mt-1">VDDR 2A (VDR gene mutation):</p>
                {[
                  "Gene: VDR (chromosome 12q13.11); autosomal recessive",
                  "1,25(OH)₂D: VERY HIGH (50-1000 pg/mL — compensatory oversecretion because receptors don't respond)",
                  "25(OH)D: normal or elevated",
                  "ALOPECIA in ~50% — pathognomonic of VDDR 2A (due to unliganded VDR actions in hair follicle cycling)",
                  "Alopecia predicts severity and treatment resistance",
                ].map((c, i) => <p key={i} className="text-red-800">• {c}</p>)}
                <p className="font-bold text-red-900 mt-1">VDDR 2B (HNRNPC — nuclear protein interference):</p>
                {["Similar biochemistry to 2A but VDR gene is normal", "Molecular defect: overexpression of nuclear ribonucleoprotein interfering with VDR-DNA interaction"].map((c, i) => <p key={i} className="text-red-800">• {c}</p>)}
                <p className="font-bold text-red-900 mt-2">Treatment (very challenging):</p>
                {[
                  "Without alopecia (milder): high-dose calcitriol 5-60 µg/day + Ca 30-75 mg/kg/day",
                  "With alopecia: often resistant to all calciferols — IV calcium infusions (long-term, hospital-based)",
                  "Specialist centre referral essential",
                  "Monitor 1,25(OH)₂D, Ca, PTH regularly",
                ].map((c, i) => <p key={i} className="text-red-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.PHOSPHOPENIC:
        return (
          <div className="space-y-3">
            <InfoBox color="teal" title="Phosphopenic Rickets Confirmed — PTH N/↑, Pi↓, Ca NORMAL">
              <div className="mt-1 text-xs">
                <p className="text-teal-800">Phosphopenic rickets = renal phosphate WASTING or dietary phosphate deficiency → Pi unavailable for growth plate mineralisation</p>
                <p className="text-teal-800 mt-1">Because Ca is NORMAL, PTH is not strongly stimulated (key distinguishing feature from calcipenic)</p>
                <p className="text-teal-800 mt-1">Next step: measure urine phosphate (TRP or FePO₄) to distinguish renal wasting from dietary/absorptive deficiency</p>
              </div>
            </InfoBox>
            <Q question="Is there renal phosphate WASTING? (Check TRP/TmP-GFR or urine phosphate)"
              explanation="TRP (Tubular Reabsorption of Phosphate) = 1 − (UPO₄×SCr)/(SPO₄×UCr) × 100. Normal: 85-95%. If TRP < 85% in setting of hypophosphataemia = renal phosphate wasting. TmP/GFR normal paediatric range 1.15-2.44 mmol/L (2-15 years)."
              onSelect={go}
              options={[
                { label: "YES — TRP <85% / high urine phosphate despite low serum Pi", next: STEPS.FGF23_CHECK, reason: "→ Renal phosphate wasting — classify by FGF23" },
                { label: "NO — Urine phosphate LOW (appropriately retained)", next: STEPS.DIETARY_PHOS, reason: "→ Dietary/absorptive phosphate deficiency" },
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.FGF23_CHECK:
        return (
          <div className="space-y-3">
            <InfoBox color="teal" title="Renal Phosphate Wasting — Now Check FGF23">
              <div className="mt-1 text-xs">
                <p className="text-teal-800">FGF23 (Fibroblast Growth Factor 23) is a phosphaturic hormone produced by bone (osteocytes). It inhibits renal phosphate reabsorption (NaPi2a/2c) and also inhibits 1α-hydroxylase → lower calcitriol.</p>
                <p className="text-teal-800 mt-1">FGF23 HIGH + renal phosphate wasting = genetic or acquired FGF23-driven disorder</p>
                <p className="text-teal-800 mt-1">FGF23 LOW/normal + renal phosphate wasting = primary tubular defect (HHRH, Fanconi)</p>
              </div>
            </InfoBox>
            <Q question="What is the FGF23 level?"
              onSelect={go}
              options={[
                { label: "FGF23 HIGH (elevated)", next: STEPS.XLH_ADHR_ARHR, reason: "→ XLH, ADHR, ARHR, TIO (FGF23-mediated phosphate wasting)" },
                { label: "FGF23 LOW or normal", next: STEPS.HHRH_FANCONI, reason: "→ HHRH or Fanconi syndrome (FGF23-independent tubular wasting)" },
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.XLH_ADHR_ARHR:
        return (
          <div className="space-y-3">
            <InfoBox title="FGF23-Mediated Hypophosphataemic Rickets — XLH / ADHR / ARHR" color="teal">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-teal-900">XLH (X-linked Hypophosphataemia) — MOST COMMON (~80% of hereditary cases)</p>
                {[
                  "Gene: PHEX (Xp22.11); X-linked dominant — affects both males and females",
                  "PHEX normally suppresses FGF23; when PHEX is mutated → FGF23 accumulates → phosphaturia",
                  "Biochemistry: Ca NORMAL, Pi LOW, ALP elevated, PTH normal/mildly ↑, 25(OH)D normal, 1,25(OH)₂D low/normal",
                  "Clinical onset at age of walking — short stature, genu vara/valgum, waddling gait",
                  "DENTAL ABSCESSES (without caries) — pathognomonic of XLH/ARHR (poor dentine mineralisation)",
                  "Disproportionate short stature: short lower limbs, preserved trunk",
                ].map((c, i) => <p key={i} className="text-teal-800">• {c}</p>)}
                <p className="font-bold text-teal-900 mt-2">ADHR: FGF23 gene mutation (activating) — FGF23 resistant to proteolysis; iron deficiency triggers</p>
                <p className="font-bold text-teal-900 mt-1">ARHR1/2: DMP1 or ENPP1 gene mutations; ENPP1 → GACI (vascular calcification of infancy) then rickets</p>
                <p className="font-bold text-teal-900 mt-2">Treatment:</p>
                {[
                  "BUROSUMAB (anti-FGF23 monoclonal antibody) — FIRST LINE for XLH:",
                  "  Dose: 0.8 mg/kg SC every 2 weeks, titrated to 2 mg/kg; target low-to-mid normal Pi",
                  "  CI: moderate-severe CKD; NOT indicated if FGF23 is low",
                  "  Advantages: once/fortnightly vs multiple daily doses; fewer metabolic side effects",
                  "Alternative (if Burosumab unavailable): Oral phosphate 20-60 mg/kg/day (3-5 divided doses) + Calcitriol 20-30 ng/kg/day",
                  "For FGF23-independent causes (HHRH): oral phosphate ONLY — do NOT add calcitriol (1,25(OH)₂D already elevated)",
                  "Monitor: Pi, Ca, PTH, urine Ca/Cr, renal USS (nephrocalcinosis) regularly",
                ].map((c, i) => <p key={i} className="text-teal-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.HHRH_FANCONI:
        return (
          <div className="space-y-3">
            <InfoBox title="FGF23-Independent Tubular Phosphate Wasting — HHRH / Fanconi" color="orange">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-orange-900">HHRH (Hereditary Hypophosphataemic Rickets with Hypercalciuria):</p>
                {[
                  "Gene: SLC34A3 (NaPi2c cotransporter); autosomal recessive",
                  "Impaired renal phosphate reabsorption → Pi↓ → suppressed FGF23 → 1,25(OH)₂D↑ → hypercalciuria",
                  "Biochemistry: Ca normal, Pi LOW, PTH low/normal, FGF23 LOW, 1,25(OH)₂D HIGH, urine Ca HIGH",
                  "Treatment: ORAL PHOSPHATE ONLY (25-65 mg/kg/day) — do NOT add calcitriol (already high — worsens hypercalciuria)",
                  "Monitor calcitriol levels + urinary calcium excretion",
                ].map((c, i) => <p key={i} className="text-orange-800">• {c}</p>)}
                <p className="font-bold text-orange-900 mt-2">Fanconi Syndrome (Generalised Tubular Wasting):</p>
                {[
                  "Generalised PCT dysfunction → glucosuria + aminoaciduria + phosphaturia + bicarbonaturia",
                  "FGF23 normal/low; PTH normal; Ca normal",
                  "Causes: Cystinosis (CTNS), Lowe syndrome (OCRL), Dent disease (CLCN5), tyrosinemia, galactosemia",
                  "Treatment: treat UNDERLYING cause (cysteamine for cystinosis); phosphate supplementation; alkali if acidosis",
                ].map((c, i) => <p key={i} className="text-orange-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.DIETARY_PHOS:
        return (
          <div className="space-y-3">
            <InfoBox title="Dietary / Absorptive Phosphate Deficiency" color="green">
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-green-900">When to suspect:</p>
                {[
                  "Preterm / very low birthweight infants — especially breastfed without phosphate supplementation",
                  "Gastrointestinal surgery / short bowel syndrome — impaired phosphate absorption",
                  "Excessive use of phosphate binders (e.g. antacids) restricting dietary phosphate",
                  "Formula-fed infants with CKD where phosphate is restricted too aggressively",
                ].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                <p className="font-bold text-green-900 mt-2">Biochemistry:</p>
                <p className="text-green-800">• Ca normal, Pi low, PTH normal, FGF23 normal/low, 1,25(OH)₂D normal/↑ (appropriate response to low Pi), urine Pi LOW (renal conservation intact)</p>
                <p className="font-bold text-green-900 mt-2">Treatment:</p>
                {[
                  "Oral phosphate supplementation 25-50 mg/kg/day",
                  "Preterm: ensure adequate phosphate in feeds (breast milk alone is insufficient)",
                  "Identify and correct source of restriction",
                ].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      default:
        return <Button onClick={reset}>Restart</Button>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-amber-700 to-orange-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Bone className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Rickets Diagnostic Engine</h3>
            <p className="text-xs text-amber-200">IAP 2022 · Haffner Pediatric Nephrology 2022 · Levine Front.Pediatr.2020 · Nat Rev Nephrol 2019</p>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Step {history.length + 1}</Badge>
          <div className="flex gap-1 flex-wrap">
            {["Rickets", "ALP", "Renal", "PTH/Ca/Pi", "Calcipenic/Phosphopenic", "Subtype", "Treatment"]
              .slice(0, Math.min(history.length + 1, 7))
              .map((s, i) => <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${i === Math.min(history.length, 6) ? "bg-amber-100 text-amber-800 font-semibold" : "text-slate-400"}`}>{s}</span>)}
          </div>
        </div>
      )}

      <Card><CardContent className="p-4">{renderStep()}</CardContent></Card>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 space-y-1">
        <p className="font-bold">Quick Biochemical Summary (IAP STG 2022):</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-amber-100">{["Disorder","Ca","Pi","ALP","PTH","25(OH)D","1,25D"].map(h => <th key={h} className="border border-amber-200 px-1.5 py-1 text-left font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {[
                ["Nutritional VDD","↓/N","↓","↑↑","↑","↓","↓/N/↑"],
                ["Dietary Ca def","↓/N","↓","↑","↑","N/↓","↑"],
                ["VDDR type 1","↓/N","↓","↑↑","↑","N","↓↓"],
                ["VDDR type 2","↓/N","↓","↑↑","↑","N","↑↑↑"],
                ["XLH/ADHR","N","↓","↑","N","N","↓/N"],
                ["HHRH","N","↓","↑","N","N","N/↑"],
                ["Fanconi","N","↓","↑","N","N","N/↑"],
                ["CKD rickets","↓/N","↑","↑","↑↑","N","↓"],
              ].map((row, i) => <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-amber-50"}>{row.map((cell, j) => <td key={j} className="border border-amber-200 px-1.5 py-1">{cell}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}