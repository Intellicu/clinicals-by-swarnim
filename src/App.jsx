import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const FeedbackInbox = lazy(() => import('@/pages/FeedbackInbox'));
const GeneticReportAnalyzer = lazy(() => import('./pages/GeneticReportAnalyzer'));
const ResearchMethodsHub = lazy(() => import('./pages/ResearchMethodsHub'));
const AIClinicalPathway = lazy(() => import('./pages/AIClinicalPathway'));
const PrescriptionWorkflow = lazy(() => import('./pages/PrescriptionWorkflow'));
const DrugsDosing = lazy(() => import('./pages/DrugsDosing'));
const AIPrescriber = lazy(() => import('./pages/AIPrescriber'));
const ClinicalApproaches = lazy(() => import('./pages/ClinicalApproaches'));
const LabPathways = lazy(() => import('./pages/LabPathways'));
const EmergencyHub = lazy(() => import('./pages/EmergencyHub'));
const AdmissionOrders = lazy(() => import('./pages/AdmissionOrders'));
const DifferentialEngine = lazy(() => import('./pages/DifferentialEngine'));
const CaseLibrary = lazy(() => import('./pages/CaseLibrary'));
const DischargeSummary = lazy(() => import('./pages/DischargeSummary'));
const ResearchOS = lazy(() => import('./pages/ResearchOS'));
const NutritionHub = lazy(() => import('./pages/NutritionHub'));
const ClinicalOS = lazy(() => import('./pages/ClinicalOS'));
const ClinicOPDCockpit = lazy(() => import('./pages/ClinicOPDCockpit'));
const PatientCockpit = lazy(() => import('./pages/PatientCockpit'));
const PediatricRheumatology = lazy(() => import('./pages/PediatricRheumatology'));
const CalculatorsHub = lazy(() => import('./pages/CalculatorsHub'));
const UrologyNephrologyHub = lazy(() => import('./pages/UrologyNephrologyHub'));
const RareDiseaseModule = lazy(() => import('./pages/RareDiseaseModule'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const GuidelinesLibrary = lazy(() => import('./pages/GuidelinesLibrary'));
const ClinicalWorkspace = lazy(() => import('./pages/ClinicalWorkspace'));
const GeneralPediatricsHub = lazy(() => import('./pages/GeneralPediatricsHub'));
const ImagingViewer = lazy(() => import('./pages/ImagingViewer'));
const PathwayBuilder = lazy(() => import('./pages/PathwayBuilder'));
const PediatricEndocrinology = lazy(() => import('./pages/PediatricEndocrinology'));
const TubularDisordersHub = lazy(() => import('./pages/TubularDisordersHub'));
const AIAgentsHub = lazy(() => import('./pages/AIAgentsHub'));
const ProcedureHub = lazy(() => import('./pages/ProcedureHub'));
const SubspecialtiesHub = lazy(() => import('./pages/SubspecialtiesHub'));
const PathwayApprovalDashboard = lazy(() => import('./pages/PathwayApprovalDashboard'));
const ClinicalReferenceLibrary = lazy(() => import('./pages/ClinicalReferenceLibrary'));
const MonitoringTasksDashboard = lazy(() => import('./pages/MonitoringTasksDashboard'));
const KidneyCarealertInbox = lazy(() => import('./pages/KidneyCarealertInbox'));
const EngineGenerator = lazy(() => import('./pages/EngineGenerator'));
const CIEEEngines = lazy(() => import('./pages/CIEEEngines'));
const DailySummary = lazy(() => import('./pages/DailySummary'));
const OncologyHub = lazy(() => import('./pages/OncologyHub'));
const OncologyAdmin = lazy(() => import('./pages/OncologyAdmin'));
const OncologyPathway = lazy(() => import('./pages/OncologyPathway'));
const EngineAuditBlueprint = lazy(() => import('./pages/EngineAuditBlueprint'));
const TDMTrendDashboard = lazy(() => import('./pages/TDMTrendDashboard'));

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
  </div>
);

const AuthenticatedApp = () => {
  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route path="/CIEEEngines" element={<LayoutWrapper currentPageName="CIEEEngines"><CIEEEngines /></LayoutWrapper>} />
        <Route path="/DailySummary" element={<LayoutWrapper currentPageName="DailySummary"><DailySummary /></LayoutWrapper>} />
        <Route path="/OncologyHub" element={<LayoutWrapper currentPageName="OncologyHub"><OncologyHub /></LayoutWrapper>} />
        <Route path="/OncologyAdmin" element={<LayoutWrapper currentPageName="OncologyAdmin"><OncologyAdmin /></LayoutWrapper>} />
        <Route path="/OncologyPathway" element={<LayoutWrapper currentPageName="OncologyPathway"><OncologyPathway /></LayoutWrapper>} />
        <Route path="/FeedbackInbox" element={<LayoutWrapper currentPageName="FeedbackInbox"><FeedbackInbox /></LayoutWrapper>} />
        <Route path="/EngineAuditBlueprint" element={<LayoutWrapper currentPageName="EngineAuditBlueprint"><EngineAuditBlueprint /></LayoutWrapper>} />
        <Route path="/TDMTrendDashboard" element={<LayoutWrapper currentPageName="TDMTrendDashboard"><TDMTrendDashboard /></LayoutWrapper>} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
    </Suspense>
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