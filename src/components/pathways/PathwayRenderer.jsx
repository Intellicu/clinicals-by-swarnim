/**
 * PathwayRenderer — renders the correct pathway component for a given scenario ID.
 * Extracted from ClinicalSupport to keep that file manageable.
 */
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import HSPNPathway from "./HSPNPathway";
import EnhancedNephroticPathway from "./EnhancedNephroticPathway";
import AKIPathway from "./AKIPathway";
import HypertensiveEmergencyPathway from "./HypertensiveEmergencyPathway";
import HyperkalemiaPathway from "./HyperkalemiaPathway";
import UTIPathway from "./UTIPathway";
import HUSPathway from "./HUSPathway";
import TumorLysisPathway from "./TumorLysisPathway";
import LupusNephritisPathway from "./LupusNephritisPathway";
import PSGNPathway from "./PSGNPathway";
import HyponatremiaPathway from "./HyponatremiaPathway";
import HypercalcemiaPathway from "./HypercalcemiaPathway";
import TransplantRejectionPathway from "./TransplantRejectionPathway";
import DialysisCatheterInfectionPathway from "./DialysisCatheterInfectionPathway";
import CKDMBDPathway from "./CKDMBDPathway";
import RenalStonePathway from "./RenalStonePathway";
import BladderDysfunctionPathway from "./BladderDysfunctionPathway";
import RTAPathway from "./RTAPathway";
import TubularFunctionPathway from "./TubularFunctionPathway";
import HypokalemiaPathway from "./HypokalemiaPathway";
import SevereEdemaPathway from "./SevereEdemaPathway";
import SBPPathway from "./SBPPathway";
import MetabolicAcidosisPathway from "./MetabolicAcidosisPathway";
import SteroidResistantNSPathway from "./SteroidResistantNSPathway";
import ChronicKidneyDiseasePathway from "./ChronicKidneyDiseasePathway";
import HypocalcemiaPathway from "./HypocalcemiaPathway";
import ContrastNephropathyPathway from "./ContrastNephropathyPathway";
import FluidElectrolytePathway from "./FluidElectrolytePathway";
import AcidBasePathway from "./AcidBasePathway";
import HypertensionDiagnosisPathway from "./HypertensionDiagnosisPathway";
import HypertensionTreatmentPathway from "./HypertensionTreatmentPathway";
import VURPathway from "./VURPathway";
import HydronephrosisPathway from "./HydronephrosisPathway";
import NephroticSyndromeChildhoodPathway from "./NephroticSyndromeChildhoodPathway";
import CongenitalNephroticPathway from "./CongenitalNephroticPathway";
import IgAVasculitisPathway from "./IgAVasculitisPathway";
import ANCAbVasculitisPathway from "./ANCAbVasculitisPathway";
import MembranousNephropathyPathway from "./MembranousNephropathyPathway";
import PeritonealDialysisPathway from "./PeritonealDialysisPathway";
import HemodialysisPathway from "./HemodialysisPathway";
import CKDStagingPathway from "./CKDStagingPathway";
import CKDAnemiaMBDPathway from "./CKDAnemiaMBDPathway";
import KidneyTransplantPathway from "./KidneyTransplantPathway";
import HematuriaPathway from "./HematuriaPathway";
import ProteinuriaPathway from "./ProteinuriaPathway";
import CysticKidneyPathway from "./CysticKidneyPathway";
import MetabolicGeneticPathways from "./MetabolicGeneticPathways";
import TubularDisorderPathways from "./TubularDisorderPathways";
import HypertensionPathways from "./HypertensionPathways";
import NephrocalcinosisNephrolithiasisPathway from "./NephrocalcinosisNephrolithiasisPathway";
import {
  TMADecisionEngine, GeneticTestingEngine, CKDProgressionEngine,
  BiopsyTriggerEngine, EculizumabEngine, HypokalemiaEngine, MetabolicAcidosisEngine,
  HyperkalemiaEngine
} from "./DecisionEngines";
import HematuriaEngine from "../engines/HematuriaEngine";
import ProteinuriaEngine from "../engines/ProteinuriaEngine";
import NephrocalcinosisStoneEngine from "../engines/NephrocalcinosisStoneEngine";
import GlomerulonephritisEngine from "../engines/GlomerulonephritisEngine";
import NephroticSyndromeEngine from "../engines/NephroticSyndromeEngine";
import HyponatremiaEngine from "../engines/HyponatremiaEngine";
import RPGNEngine from "../engines/RPGNEngine";
import AKIEngine from "../engines/AKIEngine";
import HyperkalemiaDeepEngine from "../engines/HyperkalemiaDeepEngine";
import FabryEngine from "../engines/FabryEngine";
import VoidingDysfunctionEngine from "../engines/VoidingDysfunctionEngine";
import CysticKidneyEngine from "../engines/CysticKidneyEngine";
import CAKUTEngine from "../engines/CAKUTEngine";
import PUVEngine from "../engines/PUVEngine";
import VURRecurrentUTIEngine from "../engines/VURRecurrentUTIEngine";
import HNF1BAlportEngine from "../engines/HNF1BAlportEngine";
import PrimaryHyperoxaluriaEngine from "../engines/PrimaryHyperoxaluriaEngine";
import CystinosisEngine from "../engines/CystinosisEngine";
import PediatricHypertensionEngine from "../engines/PediatricHypertensionEngine";
import TubularDisordersEngine from "../engines/TubularDisordersEngine";
import KidneyStoneEngine from "../engines/KidneyStoneEngine";
import RRTEngine from "../engines/RRTEngine";
import CKDEngine from "../engines/CKDEngine";
import PolyuriaFullEngine from "../engines/PolyuriaEngine";
import ElectrolytesHubEngine from "../engines/ElectrolytesHubEngine";
import AcidBaseHubEngine from "../engines/AcidBaseHubEngine";
import NeurogenicBladderEngine from "../engines/NeurogenicBladderEngine";
import BladderDiaryEngine from "../engines/BladderDiaryEngine";
import RenalBiopsyEngine from "../engines/RenalBiopsyEngine";
import RenalDietEngine from "../engines/RenalDietEngine";
import RheumatologyEngine from "../engines/RheumatologyEngine";
import RicketsEngine from "../engines/RicketsEngine";
// IDs that have their own full pathway component
const HANDLED_IDS = new Set([
  "nephrotic-syndrome","iga-nephropathy","hspn","aki-prifle","htn-emergency","hyperkalemia",
  "uti-febrile","hemolytic-uremic","tumor-lysis","lupus-nephritis","post-strep-gn",
  "hyponatremia","hypercalcemia","transplant-rejection","dialysis-catheter-infection",
  "ckd-mbd","renal-stone","bladder-dysfunction","rta-diagnosis","tubular-function",
  "hypokalemia","severe-edema-ns","sbp","metabolic-acidosis","contrast-nephropathy",
  "fluid-electrolyte","acid-base","htn-diagnosis","htn-treatment","vur","hydronephrosis",
  "childhood-nephrotic","congenital-nephrotic","iga-vasculitis","anca-vasculitis",
  "membranous-nephropathy","peritoneal-dialysis","hemodialysis","ckd-staging",
  "ckd-anemia-mbd","kidney-transplant","hematuria-approach","proteinuria-approach",
  "cystic-kidney","steroid-resistant-ns","ckd-comprehensive","hypocalcemia",
  "cystinosis","fabry","primary-hyperoxaluria","arpkd-adpkd","nephronophthisis",
  "genetic-nephrotic","distal-rta","proximal-rta","bartter","gitelman","ndi",
  "bp-classification","htn-pres","secondary-htn","neonatal-htn","nephrocalcinosis",
  "tma-engine","hematuria-engine","genetic-engine","ckd-progression-engine",
  "biopsy-engine","eculizumab-engine","hypokalemia-engine","metabolic-acidosis-engine",
  "polyuria-engine","hyperkalemia-engine","c3g-engine","rpgn-engine",
  "ns-engine","hyponatremia-engine","rpgn-deep-engine","aki-engine","hyperkalemia-deep-engine",
  "fabry-engine","voiding-engine","cystic-kidney-engine","cakut-engine","puv-engine",
  "vur-uti-engine","hnf1b-alport-engine","hyperoxaluria-engine","cystinosis-engine",
  "htn-engine","tubular-engine","stone-engine",
  "alport-hnf1b-engine","stone-ph-engine","tubular-disorder-engine",
  "proteinuria-engine","nephrocalcinosis-stone-engine","gn-engine",
  "rrt-engine","ckd-engine","polyuria-full-engine",
  "electrolytes-hub","acid-base-hub","neurogenic-bladder-engine",
  "bladder-diary-engine","renal-biopsy-engine",
  "diet-engine","rheumatology-engine","rickets-engine",
]);

export default function PathwayRenderer({ scenarioId, scenario, onAIPrompt, isAdmin }) {
  const id = scenarioId;

  if (id === "nephrotic-syndrome") return <EnhancedNephroticPathway onAIPrompt={onAIPrompt} />;
  if (id === "hspn") return <HSPNPathway />;
  if (id === "aki-prifle") return <AKIPathway />;
  if (id === "htn-emergency") return <HypertensiveEmergencyPathway />;
  if (id === "hyperkalemia") return <HyperkalemiaPathway />;
  if (id === "uti-febrile") return <UTIPathway />;
  if (id === "hemolytic-uremic") return <HUSPathway />;
  if (id === "tumor-lysis") return <TumorLysisPathway />;
  if (id === "lupus-nephritis") return <LupusNephritisPathway />;
  if (id === "post-strep-gn") return <PSGNPathway />;
  if (id === "hyponatremia") return <HyponatremiaPathway />;
  if (id === "hypercalcemia") return <HypercalcemiaPathway />;
  if (id === "transplant-rejection") return <TransplantRejectionPathway />;
  if (id === "dialysis-catheter-infection") return <DialysisCatheterInfectionPathway />;
  if (id === "ckd-mbd") return <CKDMBDPathway />;
  if (id === "renal-stone") return <RenalStonePathway />;
  if (id === "bladder-dysfunction") return <BladderDysfunctionPathway />;
  if (id === "rta-diagnosis") return <RTAPathway />;
  if (id === "tubular-function") return <TubularFunctionPathway />;
  if (id === "hypokalemia") return <HypokalemiaPathway />;
  if (id === "severe-edema-ns") return <SevereEdemaPathway />;
  if (id === "sbp") return <SBPPathway />;
  if (id === "metabolic-acidosis") return <MetabolicAcidosisPathway />;
  if (id === "contrast-nephropathy") return <ContrastNephropathyPathway />;
  if (id === "fluid-electrolyte") return <FluidElectrolytePathway />;
  if (id === "acid-base") return <AcidBasePathway />;
  if (id === "htn-diagnosis") return <HypertensionDiagnosisPathway />;
  if (id === "htn-treatment") return <HypertensionTreatmentPathway />;
  if (id === "vur") return <VURPathway />;
  if (id === "hydronephrosis") return <HydronephrosisPathway />;
  if (id === "childhood-nephrotic") return <NephroticSyndromeChildhoodPathway />;
  if (id === "congenital-nephrotic") return <CongenitalNephroticPathway />;
  if (id === "iga-vasculitis") return <IgAVasculitisPathway />;
  if (id === "anca-vasculitis") return <ANCAbVasculitisPathway />;
  if (id === "membranous-nephropathy") return <MembranousNephropathyPathway />;
  if (id === "peritoneal-dialysis") return <PeritonealDialysisPathway />;
  if (id === "hemodialysis") return <HemodialysisPathway />;
  if (id === "ckd-staging") return <CKDStagingPathway />;
  if (id === "ckd-anemia-mbd") return <CKDAnemiaMBDPathway />;
  if (id === "kidney-transplant") return <KidneyTransplantPathway />;
  if (id === "hematuria-approach") return <HematuriaPathway />;
  if (id === "proteinuria-approach") return <ProteinuriaPathway />;
  if (id === "cystic-kidney") return <CysticKidneyPathway />;
  if (id === "steroid-resistant-ns") return <SteroidResistantNSPathway />;
  if (id === "ckd-comprehensive") return <ChronicKidneyDiseasePathway />;
  if (id === "hypocalcemia") return <HypocalcemiaPathway />;
  // Metabolic & Genetic
  if (id === "cystinosis") return <MetabolicGeneticPathways condition="cystinosis" />;
  if (id === "fabry") return <MetabolicGeneticPathways condition="fabry" />;
  if (id === "primary-hyperoxaluria") return <MetabolicGeneticPathways condition="hyperoxaluria" />;
  if (id === "arpkd-adpkd") return <MetabolicGeneticPathways condition="arpkd_adpkd" />;
  if (id === "nephronophthisis") return <MetabolicGeneticPathways condition="nephronophthisis" />;
  if (id === "genetic-nephrotic") return <MetabolicGeneticPathways condition="genetic_nephrotic" />;
  // Tubular
  if (id === "distal-rta") return <TubularDisorderPathways condition="distal_rta" />;
  if (id === "proximal-rta") return <TubularDisorderPathways condition="proximal_rta" />;
  if (id === "bartter") return <TubularDisorderPathways condition="bartter" />;
  if (id === "gitelman") return <TubularDisorderPathways condition="gitelman" />;
  if (id === "ndi") return <TubularDisorderPathways condition="ndi" />;
  // Nephrocalcinosis
  if (id === "nephrocalcinosis") return <NephrocalcinosisNephrolithiasisPathway isAdmin={isAdmin} />;
  // Hypertension
  if (id === "bp-classification") return <HypertensionPathways condition="bp_classification" />;
  if (id === "htn-pres") return <HypertensionPathways condition="htn_emergency" />;
  if (id === "secondary-htn") return <HypertensionPathways condition="secondary_htn" />;
  if (id === "neonatal-htn") return <HypertensionPathways condition="neonatal_htn" />;
  // Shared Decision Engines
  if (id === "tma-engine") return <TMADecisionEngine />;
  if (id === "hematuria-engine") return <HematuriaEngine />;
  if (id === "proteinuria-engine") return <ProteinuriaEngine />;
  if (id === "nephrocalcinosis-stone-engine") return <NephrocalcinosisStoneEngine />;
  if (id === "gn-engine") return <GlomerulonephritisEngine />;
  if (id === "alport-hnf1b-engine") return <HNF1BAlportEngine />;
  if (id === "stone-ph-engine") return <KidneyStoneEngine />;
  if (id === "tubular-disorder-engine") return <TubularDisordersEngine />;
  if (id === "genetic-engine") return <GeneticTestingEngine />;
  if (id === "ckd-progression-engine") return <CKDProgressionEngine />;
  if (id === "biopsy-engine") return <BiopsyTriggerEngine />;
  if (id === "eculizumab-engine") return <EculizumabEngine />;
  if (id === "hypokalemia-engine") return <HypokalemiaEngine />;
  if (id === "metabolic-acidosis-engine") return <MetabolicAcidosisEngine />;
  if (id === "polyuria-engine") return <PolyuriaFullEngine />;
  if (id === "hyperkalemia-engine") return <HyperkalemiaEngine />;
  // ── Deep LEILA Engines ────────────────────────────────────────────────────
  if (id === "ns-engine") return <NephroticSyndromeEngine />;
  if (id === "hyponatremia-engine") return <HyponatremiaEngine />;
  if (id === "rpgn-deep-engine") return <RPGNEngine />;
  if (id === "aki-engine") return <AKIEngine />;
  if (id === "hyperkalemia-deep-engine") return <HyperkalemiaDeepEngine />;
  // ── New Intelligence Engines ──────────────────────────────────────────────
  if (id === "fabry-engine") return <FabryEngine />;
  if (id === "voiding-engine") return <VoidingDysfunctionEngine />;
  if (id === "cystic-kidney-engine") return <CysticKidneyEngine />;
  if (id === "cakut-engine") return <CAKUTEngine />;
  if (id === "puv-engine") return <PUVEngine />;
  if (id === "vur-uti-engine") return <VURRecurrentUTIEngine />;
  if (id === "hnf1b-alport-engine") return <HNF1BAlportEngine />;
  if (id === "hyperoxaluria-engine") return <PrimaryHyperoxaluriaEngine />;
  if (id === "cystinosis-engine") return <CystinosisEngine />;
  if (id === "htn-engine") return <PediatricHypertensionEngine />;
  if (id === "tubular-engine") return <TubularDisordersEngine />;
  if (id === "stone-engine") return <KidneyStoneEngine />;
  if (id === "rrt-engine") return <RRTEngine />;
  if (id === "ckd-engine") return <CKDEngine />;
  if (id === "polyuria-full-engine") return <PolyuriaFullEngine />;
  if (id === "electrolytes-hub") return <ElectrolytesHubEngine />;
  if (id === "acid-base-hub") return <AcidBaseHubEngine />;
  if (id === "neurogenic-bladder-engine") return <NeurogenicBladderEngine />;
  if (id === "bladder-diary-engine") return <BladderDiaryEngine />;
  if (id === "renal-biopsy-engine") return <RenalBiopsyEngine />;
  if (id === "renal-diet-engine" || id === "diet-engine") return <RenalDietEngine />;
  if (id === "rheumatology-engine") return <RheumatologyEngine />;
  if (id === "rickets-engine") return <RicketsEngine />;
  if (id === "rpgn-engine") return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gradient-to-r from-red-800 to-rose-700 p-4 text-white">
        <h3 className="text-sm font-bold">RPGN Emergency Engine</h3>
        <p className="text-xs text-red-100">Rapid GFR loss + crescents · AKI + haematuria · Urgent biopsy + IF-guided treatment</p>
      </div>
      {[
        { title: "RPGN Definition & Urgency", color: "bg-red-50 border-red-300", items: [
          "eGFR decline >50% in ≤3 months + haematuria ± RBC casts",
          "Urgent biopsy 24–48h — IF pattern determines treatment completely",
          "Pulse methylprednisolone 500–1000 mg (30 mg/kg, max 1g) × 3 IMMEDIATELY",
          "RPGN panel STAT: ANCA + anti-GBM + ANA + C3/C4 + anti-dsDNA",
        ]},
        { title: "Biopsy → IF Pattern → Treatment", color: "bg-blue-50 border-blue-200", items: [
          "LINEAR IgG (anti-GBM / Goodpasture): → PLEX daily × 14 days + CYC + steroids",
          "GRANULAR Ig+C3 (immune-complex): → Lupus/IgAN/PSGN/C3G — treat underlying",
          "PAUCI-IMMUNE (no deposits): → ANCA vasculitis (GPA/MPA) — RTX or CYC + steroids",
          "% Crescents (prognostic): <50% → better renal survival; >70% + anuric → PLEX urgently",
        ]},
        { title: "PLEX Indications (any ONE = initiate)", color: "bg-orange-50 border-orange-200", items: [
          "Anti-GBM antibody positive (always — daily PLEX × 14 days)",
          "Cr >500 µmol/L OR dialysis-dependent at presentation",
          "Diffuse alveolar haemorrhage (ANCA + DAH)",
          "ANCA + anti-GBM double positive: aggressive PLEX",
        ]},
      ].map((s, i) => (
        <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
          <p className="text-xs font-bold text-slate-800 mb-2">{s.title}</p>
          {s.items.map((item, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-800 mb-1"><span className="text-red-500 font-bold flex-shrink-0">→</span>{item}</div>)}
        </div>
      ))}
    </div>
  );
  if (id === "c3g-engine") return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-cyan-700 to-teal-700 p-4 text-white">
        <h3 className="text-sm font-bold">C3 Glomerulopathy (C3GN / DDD / Immune-complex MPGN)</h3>
        <p className="text-xs text-cyan-100">Complement alternative pathway · KDIGO · ERKNet 2023</p>
      </div>
      {[
        { title: "Algorithm: Low C3 → C3G Diagnosis", color: "bg-blue-50 border-blue-200", items: [
          "Persistent low C3 (>8 weeks) + normal C4 → alternative pathway activation",
          "Renal biopsy with IF: C3 dominant (>2 orders of magnitude above any Ig) = C3G",
          "EM: DDD (Dense Deposit Disease) — intramembranous osmiophilic deposits",
          "EM: C3GN — mesangial/subendothelial/subepithelial deposits",
          "Exclude: PSGN (C3 normalises in 6–8 weeks), infection-related GN",
        ]},
        { title: "Complement Panel + Genetic Testing", color: "bg-violet-50 border-violet-200", items: [
          "C3, C4, CH50 (AP), AH50 (AP) — AP dysregulation pattern",
          "Factor H level + anti-CFH Ab (ELISA) — CFH autoantibody-mediated C3G",
          "Genetic panel: CFH, CFI, MCP/CD46, C3, CFB, CFHR1/2/3/5, THBD",
          "C3 nephritic factor (C3 NeF) — stabilises C3bBb convertase → persistent AP activation",
          "Store serum pre-treatment for future WES/complement proteomics",
        ]},
        { title: "Treatment", color: "bg-green-50 border-green-200", items: [
          "RAAS blockade (ACEi/ARB): all patients with proteinuria >500 mg/day",
          "MMF (mycophenolate mofetil) 600 mg/m²/dose BD: for progressive C3G (declining eGFR + active sediment)",
          "Low-dose prednisolone: adjunct to MMF for moderate-severe disease",
          "Eculizumab: consider for CFH/C3 mutation-positive with rapid progression or refractory disease",
          "Avacopan (C5a receptor blocker): investigational — early trial data",
          "Plasmapheresis: for anti-CFH Ab–mediated C3G + autoantibody titre >150",
        ]},
        { title: "Monitoring", color: "bg-amber-50 border-amber-200", items: [
          "eGFR + UPCR every 3 months", "C3 every 3–6 months (normalisation = disease control)",
          "Anti-CFH Ab titre if autoantibody-mediated (every 3 months on treatment)",
          "Repeat biopsy at 2 years if initial biopsy or if rapid decline",
          "Transplant: high recurrence rate (50–70% in C3G) — discuss with family pre-transplant",
        ]},
      ].map((s, i) => (
        <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
          <p className="text-xs font-bold text-slate-800 mb-2">{s.title}</p>
          {s.items.map((item, j) => (
            <div key={j} className="flex items-start gap-1.5 text-xs text-slate-800 mb-1">
              <span className="text-blue-500 font-bold flex-shrink-0">→</span>{item}
            </div>
          ))}
        </div>
      ))}
      <BiopsyTriggerEngine />
    </div>
  );

  // IgA Nephropathy is handled inline in ClinicalSupport (MEST-C widget)
  if (id === "iga-nephropathy") return null; // signal to parent to use its own renderer

  // Fallback for scenarios with pathway flag but no dedicated component
  if (scenario?.hasFullPathway && !HANDLED_IDS.has(id)) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>{scenario.title} Pathway:</strong> Detailed clinical pathway available in Guidelines section. Check related protocols and use AI Assistant for management guidance.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

export { HANDLED_IDS };