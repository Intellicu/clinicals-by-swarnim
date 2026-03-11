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
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
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
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
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
import ABGInterpreter from './pages/ABGInterpreter';
import AIAssistant from './pages/AIAssistant';
import AIToolBuilder from './pages/AIToolBuilder';
import AKIStager from './pages/AKIStager';
import AnionGap from './pages/AnionGap';
import Anthropometry from './pages/Anthropometry';
import AuditLogs from './pages/AuditLogs';
import BPPercentiles from './pages/BPPercentiles';
import BillingDashboard from './pages/BillingDashboard';
import CKDStager from './pages/CKDStager';
import CKiDGFR from './pages/CKiDGFR';
import ClinicAnalyticsDashboard from './pages/ClinicAnalyticsDashboard';
import ClinicDashboard from './pages/ClinicDashboard';
import ClinicHome from './pages/ClinicHome';
import ClinicManagement from './pages/ClinicManagement';
import ClinicWorkflow from './pages/ClinicWorkflow';
import ClinicWorkspace from './pages/ClinicWorkspace';
import ClinicalAIHub from './pages/ClinicalAIHub';
import ClinicalAlgorithms from './pages/ClinicalAlgorithms';
import ClinicalDashboard from './pages/ClinicalDashboard';
import ClinicalSupport from './pages/ClinicalSupport';
import ClinicalToolsHub from './pages/ClinicalToolsHub';
import ComingSoon from './pages/ComingSoon';
import ConsultationView from './pages/ConsultationView';
import CustomToolBuilder from './pages/CustomToolBuilder';
import DiagnosticQuestionnaire from './pages/DiagnosticQuestionnaire';
import DietChartGenerator from './pages/DietChartGenerator';
import DietGenerator from './pages/DietGenerator';
import DoseCalculator from './pages/DoseCalculator';
import DrugCalculator from './pages/DrugCalculator';
import DrugDosing from './pages/DrugDosing';
import FEMgCalculator from './pages/FEMgCalculator';
import FENaCalculator from './pages/FENaCalculator';
import FEUACalculator from './pages/FEUACalculator';
import FEUreaCalculator from './pages/FEUreaCalculator';
import FluidCalculator from './pages/FluidCalculator';
import GuidelineDetail from './pages/GuidelineDetail';
import Guidelines from './pages/Guidelines';
import Hub from './pages/Hub';
import HypertensiveEmergency from './pages/HypertensiveEmergency';
import KtVCalculator from './pages/KtVCalculator';
import LabResults from './pages/LabResults';
import ModuleView from './pages/ModuleView';
import MonitoringHub from './pages/MonitoringHub';
import MonitoringPlanBuilder from './pages/MonitoringPlanBuilder';
import NotificationCenter from './pages/NotificationCenter';
import OfflineSettings from './pages/OfflineSettings';
import OsmolarGap from './pages/OsmolarGap';
import ParentalGuidance from './pages/ParentalGuidance';
import PatientEducation from './pages/PatientEducation';
import PatientEducationHub from './pages/PatientEducationHub';
import PatientHistory from './pages/PatientHistory';
import PatientManager from './pages/PatientManager';
import PatientMonitoringDashboard from './pages/PatientMonitoringDashboard';
import PediatricsHub from './pages/PediatricsHub';
import PotassiumCalculator from './pages/PotassiumCalculator';
import PredictionTools from './pages/PredictionTools';
import Proteinuria from './pages/Proteinuria';
import RRTAssistant from './pages/RRTAssistant';
import RRTTemplates from './pages/RRTTemplates';
import RTAClassifier from './pages/RTAClassifier';
import ReferenceRanges from './pages/ReferenceRanges';
import ReferralPortal from './pages/ReferralPortal';
import ResearchHub from './pages/ResearchHub';
import SchwartzGFR from './pages/SchwartzGFR';
import SodiumCalculator from './pages/SodiumCalculator';
import SpecialtySelector from './pages/SpecialtySelector';
import StoneRisk from './pages/StoneRisk';
import TRPCalculator from './pages/TRPCalculator';
import TTKGCalculator from './pages/TTKGCalculator';
import TeachingHub from './pages/TeachingHub';
import Telemedicine from './pages/Telemedicine';
import UserContentManager from './pages/UserContentManager';
import VideoTeachingAgent from './pages/VideoTeachingAgent';
import VoiceAgent from './pages/VoiceAgent';
import NotificationDashboard from './pages/NotificationDashboard';
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
}

export const pagesConfig = {
    mainPage: "Hub",
    Pages: PAGES,
    Layout: __Layout,
};