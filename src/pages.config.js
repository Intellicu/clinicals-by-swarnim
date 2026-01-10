import Hub from './pages/Hub';
import DoseCalculator from './pages/DoseCalculator';
import AuditLogs from './pages/AuditLogs';
import ComingSoon from './pages/ComingSoon';
import SchwartzGFR from './pages/SchwartzGFR';
import Anthropometry from './pages/Anthropometry';
import BPPercentiles from './pages/BPPercentiles';
import StoneRisk from './pages/StoneRisk';
import SodiumCalculator from './pages/SodiumCalculator';
import FluidCalculator from './pages/FluidCalculator';
import Proteinuria from './pages/Proteinuria';
import RRTAssistant from './pages/RRTAssistant';
import CKiDGFR from './pages/CKiDGFR';
import AKIStager from './pages/AKIStager';
import CKDStager from './pages/CKDStager';
import AnionGap from './pages/AnionGap';
import ABGInterpreter from './pages/ABGInterpreter';
import RTAClassifier from './pages/RTAClassifier';
import PotassiumCalculator from './pages/PotassiumCalculator';
import Guidelines from './pages/Guidelines';
import GuidelineDetail from './pages/GuidelineDetail';
import KtVCalculator from './pages/KtVCalculator';
import AIAssistant from './pages/AIAssistant';
import FENaCalculator from './pages/FENaCalculator';
import FEUreaCalculator from './pages/FEUreaCalculator';
import TTKGCalculator from './pages/TTKGCalculator';
import OsmolarGap from './pages/OsmolarGap';
import ClinicalAlgorithms from './pages/ClinicalAlgorithms';
import ReferenceRanges from './pages/ReferenceRanges';
import DietChartGenerator from './pages/DietChartGenerator';
import PatientEducation from './pages/PatientEducation';
import DrugDosing from './pages/DrugDosing';
import PredictionTools from './pages/PredictionTools';
import SpecialtySelector from './pages/SpecialtySelector';
import CustomToolBuilder from './pages/CustomToolBuilder';
import AIToolBuilder from './pages/AIToolBuilder';
import DiagnosticQuestionnaire from './pages/DiagnosticQuestionnaire';
import ClinicalSupport from './pages/ClinicalSupport';
import DrugCalculator from './pages/DrugCalculator';
import TRPCalculator from './pages/TRPCalculator';
import FEMgCalculator from './pages/FEMgCalculator';
import FEUACalculator from './pages/FEUACalculator';
import TeachingHub from './pages/TeachingHub';
import ModuleView from './pages/ModuleView';
import MonitoringHub from './pages/MonitoringHub';
import VoiceAgent from './pages/VoiceAgent';
import ParentalGuidance from './pages/ParentalGuidance';
import RRTTemplates from './pages/RRTTemplates';
import ClinicManagement from './pages/ClinicManagement';
import UserContentManager from './pages/UserContentManager';
import PatientHistory from './pages/PatientHistory';
import ClinicalToolsHub from './pages/ClinicalToolsHub';
import HypertensiveEmergency from './pages/HypertensiveEmergency';
import VideoTeachingAgent from './pages/VideoTeachingAgent';
import ResearchHub from './pages/ResearchHub';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Hub": Hub,
    "DoseCalculator": DoseCalculator,
    "AuditLogs": AuditLogs,
    "ComingSoon": ComingSoon,
    "SchwartzGFR": SchwartzGFR,
    "Anthropometry": Anthropometry,
    "BPPercentiles": BPPercentiles,
    "StoneRisk": StoneRisk,
    "SodiumCalculator": SodiumCalculator,
    "FluidCalculator": FluidCalculator,
    "Proteinuria": Proteinuria,
    "RRTAssistant": RRTAssistant,
    "CKiDGFR": CKiDGFR,
    "AKIStager": AKIStager,
    "CKDStager": CKDStager,
    "AnionGap": AnionGap,
    "ABGInterpreter": ABGInterpreter,
    "RTAClassifier": RTAClassifier,
    "PotassiumCalculator": PotassiumCalculator,
    "Guidelines": Guidelines,
    "GuidelineDetail": GuidelineDetail,
    "KtVCalculator": KtVCalculator,
    "AIAssistant": AIAssistant,
    "FENaCalculator": FENaCalculator,
    "FEUreaCalculator": FEUreaCalculator,
    "TTKGCalculator": TTKGCalculator,
    "OsmolarGap": OsmolarGap,
    "ClinicalAlgorithms": ClinicalAlgorithms,
    "ReferenceRanges": ReferenceRanges,
    "DietChartGenerator": DietChartGenerator,
    "PatientEducation": PatientEducation,
    "DrugDosing": DrugDosing,
    "PredictionTools": PredictionTools,
    "SpecialtySelector": SpecialtySelector,
    "CustomToolBuilder": CustomToolBuilder,
    "AIToolBuilder": AIToolBuilder,
    "DiagnosticQuestionnaire": DiagnosticQuestionnaire,
    "ClinicalSupport": ClinicalSupport,
    "DrugCalculator": DrugCalculator,
    "TRPCalculator": TRPCalculator,
    "FEMgCalculator": FEMgCalculator,
    "FEUACalculator": FEUACalculator,
    "TeachingHub": TeachingHub,
    "ModuleView": ModuleView,
    "MonitoringHub": MonitoringHub,
    "VoiceAgent": VoiceAgent,
    "ParentalGuidance": ParentalGuidance,
    "RRTTemplates": RRTTemplates,
    "ClinicManagement": ClinicManagement,
    "UserContentManager": UserContentManager,
    "PatientHistory": PatientHistory,
    "ClinicalToolsHub": ClinicalToolsHub,
    "HypertensiveEmergency": HypertensiveEmergency,
    "VideoTeachingAgent": VideoTeachingAgent,
    "ResearchHub": ResearchHub,
}

export const pagesConfig = {
    mainPage: "Hub",
    Pages: PAGES,
    Layout: __Layout,
};