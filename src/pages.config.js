/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   const HomePage = lazy(() => import('./pages/HomePage'));
 *   const Dashboard = lazy(() => import('./pages/Dashboard'));
 *   const Settings = lazy(() => import('./pages/Settings'));
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   const Home = lazy(() => import('./pages/Home'));
 *   const Settings = lazy(() => import('./pages/Settings'));
 *   import { lazy } from 'react';
import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
const ABGInterpreter = lazy(() => import('./pages/ABGInterpreter'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const AIToolBuilder = lazy(() => import('./pages/AIToolBuilder'));
const AKIStager = lazy(() => import('./pages/AKIStager'));
const AnionGap = lazy(() => import('./pages/AnionGap'));
const Anthropometry = lazy(() => import('./pages/Anthropometry'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const BPPercentiles = lazy(() => import('./pages/BPPercentiles'));
const BillingDashboard = lazy(() => import('./pages/BillingDashboard'));
const CKDStager = lazy(() => import('./pages/CKDStager'));
const CKiDGFR = lazy(() => import('./pages/CKiDGFR'));
const ClinicAnalyticsDashboard = lazy(() => import('./pages/ClinicAnalyticsDashboard'));
const ClinicDashboard = lazy(() => import('./pages/ClinicDashboard'));
const ClinicHome = lazy(() => import('./pages/ClinicHome'));
const ClinicManagement = lazy(() => import('./pages/ClinicManagement'));
const ClinicWorkflow = lazy(() => import('./pages/ClinicWorkflow'));
const ClinicWorkspace = lazy(() => import('./pages/ClinicWorkspace'));
const ClinicalAIHub = lazy(() => import('./pages/ClinicalAIHub'));
const ClinicalAlgorithms = lazy(() => import('./pages/ClinicalAlgorithms'));
const ClinicalDashboard = lazy(() => import('./pages/ClinicalDashboard'));
const ClinicalSupport = lazy(() => import('./pages/ClinicalSupport'));
const ClinicalToolsHub = lazy(() => import('./pages/ClinicalToolsHub'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const ConsultationView = lazy(() => import('./pages/ConsultationView'));
const CustomToolBuilder = lazy(() => import('./pages/CustomToolBuilder'));
const DiagnosticQuestionnaire = lazy(() => import('./pages/DiagnosticQuestionnaire'));
const DietChartGenerator = lazy(() => import('./pages/DietChartGenerator'));
const DietGenerator = lazy(() => import('./pages/DietGenerator'));
const DoseCalculator = lazy(() => import('./pages/DoseCalculator'));
const DrugCalculator = lazy(() => import('./pages/DrugCalculator'));
const DrugDosing = lazy(() => import('./pages/DrugDosing'));
const FEMgCalculator = lazy(() => import('./pages/FEMgCalculator'));
const FENaCalculator = lazy(() => import('./pages/FENaCalculator'));
const FEUACalculator = lazy(() => import('./pages/FEUACalculator'));
const FEUreaCalculator = lazy(() => import('./pages/FEUreaCalculator'));
const FluidCalculator = lazy(() => import('./pages/FluidCalculator'));
const GuidelineDetail = lazy(() => import('./pages/GuidelineDetail'));
const Guidelines = lazy(() => import('./pages/Guidelines'));
const Hub = lazy(() => import('./pages/Hub'));
const HypertensiveEmergency = lazy(() => import('./pages/HypertensiveEmergency'));
const KtVCalculator = lazy(() => import('./pages/KtVCalculator'));
const LabResults = lazy(() => import('./pages/LabResults'));
const ModuleView = lazy(() => import('./pages/ModuleView'));
const MonitoringHub = lazy(() => import('./pages/MonitoringHub'));
const MonitoringPlanBuilder = lazy(() => import('./pages/MonitoringPlanBuilder'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter'));
const OfflineSettings = lazy(() => import('./pages/OfflineSettings'));
const OsmolarGap = lazy(() => import('./pages/OsmolarGap'));
const ParentalGuidance = lazy(() => import('./pages/ParentalGuidance'));
const PatientEducation = lazy(() => import('./pages/PatientEducation'));
const PatientEducationHub = lazy(() => import('./pages/PatientEducationHub'));
const PatientHistory = lazy(() => import('./pages/PatientHistory'));
const PatientManager = lazy(() => import('./pages/PatientManager'));
const PatientMonitoringDashboard = lazy(() => import('./pages/PatientMonitoringDashboard'));
const PediatricsHub = lazy(() => import('./pages/PediatricsHub'));
const PotassiumCalculator = lazy(() => import('./pages/PotassiumCalculator'));
const PredictionTools = lazy(() => import('./pages/PredictionTools'));
const Proteinuria = lazy(() => import('./pages/Proteinuria'));
const RRTAssistant = lazy(() => import('./pages/RRTAssistant'));
const RRTTemplates = lazy(() => import('./pages/RRTTemplates'));
const RTAClassifier = lazy(() => import('./pages/RTAClassifier'));
const ReferenceRanges = lazy(() => import('./pages/ReferenceRanges'));
const ReferralPortal = lazy(() => import('./pages/ReferralPortal'));
const ResearchHub = lazy(() => import('./pages/ResearchHub'));
const SchwartzGFR = lazy(() => import('./pages/SchwartzGFR'));
const SodiumCalculator = lazy(() => import('./pages/SodiumCalculator'));
const SpecialtySelector = lazy(() => import('./pages/SpecialtySelector'));
const StoneRisk = lazy(() => import('./pages/StoneRisk'));
const TRPCalculator = lazy(() => import('./pages/TRPCalculator'));
const TTKGCalculator = lazy(() => import('./pages/TTKGCalculator'));
const TeachingHub = lazy(() => import('./pages/TeachingHub'));
const Telemedicine = lazy(() => import('./pages/Telemedicine'));
const UserContentManager = lazy(() => import('./pages/UserContentManager'));
const VideoTeachingAgent = lazy(() => import('./pages/VideoTeachingAgent'));
const VoiceAgent = lazy(() => import('./pages/VoiceAgent'));
const NotificationDashboard = lazy(() => import('./pages/NotificationDashboard'));
const GeneticReportAnalyzer = lazy(() => import('./pages/GeneticReportAnalyzer'));
const GlomerularDiseases = lazy(() => import('./pages/GlomerularDiseases'));
const EnhancedDietGenerator = lazy(() => import('./pages/EnhancedDietGenerator'));
import { lazy } from 'react';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ABGInterpreter": ABGInterpreter,
    "AIAssistant": AIAssistant,
    "AIToolBuilder": AIToolBuilder,
    "AKIStager": AKIStager,
    "AnionGap": AnionGap,
    "Anthropometry": Anthropometry,
    "AuditLogs": AuditLogs,
    "BPPercentiles": BPPercentiles,
    "BillingDashboard": BillingDashboard,
    "CKDStager": CKDStager,
    "CKiDGFR": CKiDGFR,
    "ClinicAnalyticsDashboard": ClinicAnalyticsDashboard,
    "ClinicDashboard": ClinicDashboard,
    "ClinicHome": ClinicHome,
    "ClinicManagement": ClinicManagement,
    "ClinicWorkflow": ClinicWorkflow,
    "ClinicWorkspace": ClinicWorkspace,
    "ClinicalAIHub": ClinicalAIHub,
    "ClinicalAlgorithms": ClinicalAlgorithms,
    "ClinicalDashboard": ClinicalDashboard,
    "ClinicalSupport": ClinicalSupport,
    "ClinicalToolsHub": ClinicalToolsHub,
    "ComingSoon": ComingSoon,
    "ConsultationView": ConsultationView,
    "CustomToolBuilder": CustomToolBuilder,
    "DiagnosticQuestionnaire": DiagnosticQuestionnaire,
    "DietChartGenerator": DietChartGenerator,
    "DietGenerator": DietGenerator,
    "DoseCalculator": DoseCalculator,
    "DrugCalculator": DrugCalculator,
    "DrugDosing": DrugDosing,
    "FEMgCalculator": FEMgCalculator,
    "FENaCalculator": FENaCalculator,
    "FEUACalculator": FEUACalculator,
    "FEUreaCalculator": FEUreaCalculator,
    "FluidCalculator": FluidCalculator,
    "GuidelineDetail": GuidelineDetail,
    "Guidelines": Guidelines,
    "Hub": Hub,
    "HypertensiveEmergency": HypertensiveEmergency,
    "KtVCalculator": KtVCalculator,
    "LabResults": LabResults,
    "ModuleView": ModuleView,
    "MonitoringHub": MonitoringHub,
    "MonitoringPlanBuilder": MonitoringPlanBuilder,
    "NotificationCenter": NotificationCenter,
    "OfflineSettings": OfflineSettings,
    "OsmolarGap": OsmolarGap,
    "ParentalGuidance": ParentalGuidance,
    "PatientEducation": PatientEducation,
    "PatientEducationHub": PatientEducationHub,
    "PatientHistory": PatientHistory,
    "PatientManager": PatientManager,
    "PatientMonitoringDashboard": PatientMonitoringDashboard,
    "PediatricsHub": PediatricsHub,
    "PotassiumCalculator": PotassiumCalculator,
    "PredictionTools": PredictionTools,
    "Proteinuria": Proteinuria,
    "RRTAssistant": RRTAssistant,
    "RRTTemplates": RRTTemplates,
    "RTAClassifier": RTAClassifier,
    "ReferenceRanges": ReferenceRanges,
    "ReferralPortal": ReferralPortal,
    "ResearchHub": ResearchHub,
    "SchwartzGFR": SchwartzGFR,
    "SodiumCalculator": SodiumCalculator,
    "SpecialtySelector": SpecialtySelector,
    "StoneRisk": StoneRisk,
    "TRPCalculator": TRPCalculator,
    "TTKGCalculator": TTKGCalculator,
    "TeachingHub": TeachingHub,
    "Telemedicine": Telemedicine,
    "UserContentManager": UserContentManager,
    "VideoTeachingAgent": VideoTeachingAgent,
    "VoiceAgent": VoiceAgent,
    "NotificationDashboard": NotificationDashboard,
    "GeneticReportAnalyzer": GeneticReportAnalyzer,
    "GlomerularDiseases": GlomerularDiseases,
    "EnhancedDietGenerator": EnhancedDietGenerator,
}

export const pagesConfig = {
    mainPage: "Hub",
    Pages: PAGES,
    Layout: __Layout,
};