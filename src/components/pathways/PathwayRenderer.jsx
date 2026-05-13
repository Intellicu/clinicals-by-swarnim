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