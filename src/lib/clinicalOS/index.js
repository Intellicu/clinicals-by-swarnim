/**
 * PEDIATRIC NEPHROLOGY CLINICAL OS
 * Central export point for all OS engines
 */

export { CLINICAL_FACTS, getFact, getFactsForModule, getEmergencyFacts, getComparableFacts, getFactsBySource, validateAgainstFact } from "./ClinicalFactsRegistry";
export { resolveDose, applyRenalAdjustment, STANDARD_DOSE_TEMPLATES } from "./DoseEngine";
export { checkInteractions, checkElectrolytes, getNephrotoxins, getImmunosuppressantMonitoring } from "./SafetyEngine";
export { executePathway, detectApplicablePathways, getDifferentialDiagnosis, PATHWAY_REGISTRY } from "./PathwayEngine";
export {
  calculateEgfrSlope, analyzeProteinuriaTrend, analyzeBPTrend, analyzeGrowthVelocity,
  analyzeTacrolumusTrend, analyzeCRRTAdequacy, ckdProgressionRisk
} from "./LongitudinalEngine";
export { calculateBPPercentile, classifyHypertensiveEmergency, getCKDBPTarget } from "./BPEngine";
export {
  GUIDELINE_HIERARCHY, MULTI_ORG_DEFINITIONS, PATHWAY_ATTRIBUTION, REVIEW_STATUS,
  getMultiOrgDefinition, compareDefinitions, getPrimaryGuideline, getComparisonTopics
} from "./EvidenceGovernance";