import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import GeneticReportAnalyzer from './pages/GeneticReportAnalyzer';
import ResearchMethodsHub from './pages/ResearchMethodsHub';
import AIClinicalPathway from './pages/AIClinicalPathway';
import PrescriptionWorkflow from './pages/PrescriptionWorkflow';
import DrugsDosing from './pages/DrugsDosing';
import AIPrescriber from './pages/AIPrescriber';
import ClinicalApproaches from './pages/ClinicalApproaches';
import LabPathways from './pages/LabPathways';
import EmergencyHub from './pages/EmergencyHub';
import AdmissionOrders from './pages/AdmissionOrders';
import DifferentialEngine from './pages/DifferentialEngine';
import CaseLibrary from './pages/CaseLibrary';
import DischargeSummary from './pages/DischargeSummary';
import ResearchOS from './pages/ResearchOS';
import NutritionHub from './pages/NutritionHub';
import ClinicalOS from './pages/ClinicalOS';
import ClinicOPDCockpit from './pages/ClinicOPDCockpit';
import PatientCockpit from './pages/PatientCockpit';
import PediatricRheumatology from './pages/PediatricRheumatology';
import CalculatorsHub from './pages/CalculatorsHub';
import UrologyNephrologyHub from './pages/UrologyNephrologyHub';
import RareDiseaseModule from './pages/RareDiseaseModule';
import About from './pages/About';
import Contact from './pages/Contact';
import GuidelinesLibrary from './pages/GuidelinesLibrary';
import ClinicalWorkspace from './pages/ClinicalWorkspace';
import GeneralPediatricsHub from './pages/GeneralPediatricsHub';
import ImagingViewer from './pages/ImagingViewer';
import PathwayBuilder from './pages/PathwayBuilder';
import PediatricEndocrinology from './pages/PediatricEndocrinology';
import TubularDisordersHub from './pages/TubularDisordersHub';
import AIAgentsHub from './pages/AIAgentsHub';
import ProcedureHub from './pages/ProcedureHub';
import SubspecialtiesHub from './pages/SubspecialtiesHub';
import PathwayApprovalDashboard from './pages/PathwayApprovalDashboard';
import ClinicalReferenceLibrary from './pages/ClinicalReferenceLibrary';
import MonitoringTasksDashboard from './pages/MonitoringTasksDashboard';
import KidneyCarealertInbox from './pages/KidneyCarealertInbox';
import EngineGenerator from './pages/EngineGenerator';
import DailySummary from './pages/DailySummary';
import OncologyHub from './pages/OncologyHub';
import OncologyAdmin from './pages/OncologyAdmin';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* All app routes — gated by ProtectedRoute */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/" element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="/GeneticReportAnalyzer" element={<LayoutWrapper currentPageName="GeneticReportAnalyzer"><GeneticReportAnalyzer /></LayoutWrapper>} />
        <Route path="/ResearchMethodsHub" element={<LayoutWrapper currentPageName="ResearchMethodsHub"><ResearchMethodsHub /></LayoutWrapper>} />
        <Route path="/AIClinicalPathway" element={<LayoutWrapper currentPageName="AIClinicalPathway"><AIClinicalPathway /></LayoutWrapper>} />
        <Route path="/PrescriptionWorkflow" element={<LayoutWrapper currentPageName="PrescriptionWorkflow"><PrescriptionWorkflow /></LayoutWrapper>} />
        <Route path="/DrugsDosing" element={<LayoutWrapper currentPageName="DrugsDosing"><DrugsDosing /></LayoutWrapper>} />
        <Route path="/AIPrescriber" element={<LayoutWrapper currentPageName="AIPrescriber"><AIPrescriber /></LayoutWrapper>} />
        <Route path="/ClinicalApproaches" element={<LayoutWrapper currentPageName="ClinicalApproaches"><ClinicalApproaches /></LayoutWrapper>} />
        <Route path="/LabPathways" element={<LayoutWrapper currentPageName="LabPathways"><LabPathways /></LayoutWrapper>} />
        <Route path="/EmergencyHub" element={<LayoutWrapper currentPageName="EmergencyHub"><EmergencyHub /></LayoutWrapper>} />
        <Route path="/AdmissionOrders" element={<LayoutWrapper currentPageName="AdmissionOrders"><AdmissionOrders /></LayoutWrapper>} />
        <Route path="/DifferentialEngine" element={<LayoutWrapper currentPageName="DifferentialEngine"><DifferentialEngine /></LayoutWrapper>} />
        <Route path="/CaseLibrary" element={<LayoutWrapper currentPageName="CaseLibrary"><CaseLibrary /></LayoutWrapper>} />
        <Route path="/DischargeSummary" element={<LayoutWrapper currentPageName="DischargeSummary"><DischargeSummary /></LayoutWrapper>} />
        <Route path="/ResearchOS" element={<LayoutWrapper currentPageName="ResearchOS"><ResearchOS /></LayoutWrapper>} />
        <Route path="/NutritionHub" element={<LayoutWrapper currentPageName="NutritionHub"><NutritionHub /></LayoutWrapper>} />
        <Route path="/ClinicalOS" element={<LayoutWrapper currentPageName="ClinicalOS"><ClinicalOS /></LayoutWrapper>} />
        <Route path="/ClinicOPDCockpit" element={<LayoutWrapper currentPageName="ClinicOPDCockpit"><ClinicOPDCockpit /></LayoutWrapper>} />
        <Route path="/PatientCockpit" element={<LayoutWrapper currentPageName="PatientCockpit"><PatientCockpit /></LayoutWrapper>} />
        <Route path="/PediatricRheumatology" element={<LayoutWrapper currentPageName="PediatricRheumatology"><PediatricRheumatology /></LayoutWrapper>} />
        <Route path="/CalculatorsHub" element={<LayoutWrapper currentPageName="CalculatorsHub"><CalculatorsHub /></LayoutWrapper>} />
        <Route path="/UrologyNephrologyHub" element={<LayoutWrapper currentPageName="UrologyNephrologyHub"><UrologyNephrologyHub /></LayoutWrapper>} />
        <Route path="/RareDiseaseModule" element={<LayoutWrapper currentPageName="RareDiseaseModule"><RareDiseaseModule /></LayoutWrapper>} />
        <Route path="/About" element={<LayoutWrapper currentPageName="About"><About /></LayoutWrapper>} />
        <Route path="/Contact" element={<LayoutWrapper currentPageName="Contact"><Contact /></LayoutWrapper>} />
        <Route path="/GuidelinesLibrary" element={<LayoutWrapper currentPageName="GuidelinesLibrary"><GuidelinesLibrary /></LayoutWrapper>} />
        <Route path="/ClinicalWorkspace" element={<LayoutWrapper currentPageName="ClinicalWorkspace"><ClinicalWorkspace /></LayoutWrapper>} />
        <Route path="/GeneralPediatricsHub" element={<LayoutWrapper currentPageName="GeneralPediatricsHub"><GeneralPediatricsHub /></LayoutWrapper>} />
        <Route path="/ImagingViewer" element={<LayoutWrapper currentPageName="ImagingViewer"><ImagingViewer /></LayoutWrapper>} />
        <Route path="/PathwayBuilder" element={<LayoutWrapper currentPageName="PathwayBuilder"><PathwayBuilder /></LayoutWrapper>} />
        <Route path="/PediatricEndocrinology" element={<LayoutWrapper currentPageName="PediatricEndocrinology"><PediatricEndocrinology /></LayoutWrapper>} />
        <Route path="/TubularDisordersHub" element={<LayoutWrapper currentPageName="TubularDisordersHub"><TubularDisordersHub /></LayoutWrapper>} />
        <Route path="/AIAgentsHub" element={<LayoutWrapper currentPageName="AIAgentsHub"><AIAgentsHub /></LayoutWrapper>} />
        <Route path="/ProcedureHub" element={<LayoutWrapper currentPageName="ProcedureHub"><ProcedureHub /></LayoutWrapper>} />
        <Route path="/SubspecialtiesHub" element={<LayoutWrapper currentPageName="SubspecialtiesHub"><SubspecialtiesHub /></LayoutWrapper>} />
        <Route path="/PathwayApprovalDashboard" element={<LayoutWrapper currentPageName="PathwayApprovalDashboard"><PathwayApprovalDashboard /></LayoutWrapper>} />
        <Route path="/ClinicalReferenceLibrary" element={<LayoutWrapper currentPageName="ClinicalReferenceLibrary"><ClinicalReferenceLibrary /></LayoutWrapper>} />
        <Route path="/MonitoringTasksDashboard" element={<LayoutWrapper currentPageName="MonitoringTasksDashboard"><MonitoringTasksDashboard /></LayoutWrapper>} />
        <Route path="/KidneyCarealertInbox" element={<LayoutWrapper currentPageName="KidneyCarealertInbox"><KidneyCarealertInbox /></LayoutWrapper>} />
        <Route path="/EngineGenerator" element={<LayoutWrapper currentPageName="EngineGenerator"><EngineGenerator /></LayoutWrapper>} />
        <Route path="/DailySummary" element={<LayoutWrapper currentPageName="DailySummary"><DailySummary /></LayoutWrapper>} />
        <Route path="/OncologyHub" element={<LayoutWrapper currentPageName="OncologyHub"><OncologyHub /></LayoutWrapper>} />
        <Route path="/OncologyAdmin" element={<LayoutWrapper currentPageName="OncologyAdmin"><OncologyAdmin /></LayoutWrapper>} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App