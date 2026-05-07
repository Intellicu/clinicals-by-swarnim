import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import {
  Activity,
  Home,
  FileText,
  LogOut,
  BookOpen,
  ArrowLeft,
  Calculator,
  GraduationCap,
  Heart,
  Droplet,
  Pill,
  LineChart,
  TestTube,
  Baby,
  GitBranch,
  ClipboardList,
  UtensilsCrossed,
  Sparkles,
  Mic,
  Users,
  Layers,
  Trash2,
  Bell,
  Stethoscope,
  FlaskConical,
  X,
  ChevronRight,
  AlertTriangle,
  Brain
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { base44 } from "@/api/base44Client";
import { PatientProvider } from "./components/PatientContext";
import FloatingAIAssistant from "./components/FloatingAIAssistant";
import IOSCompatibility from "./components/iOSCompatibility";
import PullToRefresh from "./components/PullToRefresh";
import NotificationEngine from "./components/notifications/NotificationEngine";
import FloatingHubButton from "./components/FloatingHubButton";
import { useQueryClient } from "@tanstack/react-query";

// Tab root URLs — re-tapping the active tab resets to these
const TAB_ROOTS = {
  Hub: createPageUrl("Hub"),
  AI: createPageUrl("AIAssistant"),
  Clinic: createPageUrl("ClinicWorkflow"),
  Research: createPageUrl("ResearchHub"),
};

const TAB_DETECTION = {
  Hub: [createPageUrl("Hub"), createPageUrl("ClinicalToolsHub"), createPageUrl("ClinicalSupport"), createPageUrl("Guidelines"), createPageUrl("DrugCalculator")],
  AI: [createPageUrl("AIAssistant"), createPageUrl("VoiceAgent"), createPageUrl("VideoTeachingAgent")],
  Clinic: [createPageUrl("ClinicWorkflow"), createPageUrl("ClinicDashboard"), createPageUrl("ClinicManagement"), createPageUrl("ClinicWorkspace")],
  Research: [createPageUrl("ResearchHub")],
};

const mainNavigation = [
  { title: "Hub", url: createPageUrl("Hub"), icon: Home },
  { title: "AI Assistant", url: createPageUrl("AIAssistant"), icon: Sparkles },
  { title: "Voice Agent", url: createPageUrl("VoiceAgent"), icon: Mic },
  { title: "Video Companion", url: createPageUrl("VideoTeachingAgent"), icon: Activity },
];

const toolsNavigation = [
  { title: "Clinical Tools Hub", url: createPageUrl("ClinicalToolsHub"), icon: Calculator },
  { title: "Clinical Pathways", url: createPageUrl("ClinicalSupport"), icon: GitBranch },
  { title: "Guidelines Library", url: createPageUrl("Guidelines"), icon: BookOpen },
  { title: "AI Prescriber", url: createPageUrl("AIPrescriber"), icon: Sparkles },
  { title: "Drugs & Dosing", url: createPageUrl("DrugsDosing"), icon: Pill },
  { title: "Clinical Approaches", url: createPageUrl("ClinicalApproaches"), icon: Stethoscope },
  { title: "Lab Pathways", url: createPageUrl("LabPathways"), icon: FlaskConical },
  { title: "Emergency Hub", url: createPageUrl("EmergencyHub"), icon: AlertTriangle },
  { title: "Differential Dx Engine", url: createPageUrl("DifferentialEngine"), icon: Brain },
  { title: "Admission Orders", url: createPageUrl("AdmissionOrders"), icon: ClipboardList },
  { title: "Case Library", url: createPageUrl("CaseLibrary"), icon: BookOpen },
  { title: "Discharge Summary", url: createPageUrl("DischargeSummary"), icon: FileText },
];

const resourcesNavigation = [
  { title: "Clinic Dashboard", url: createPageUrl("ClinicDashboard"), icon: Users },
  { title: "Content Manager", url: createPageUrl("UserContentManager"), icon: FileText },
  { title: "Teaching Hub", url: createPageUrl("TeachingHub"), icon: GraduationCap },
  { title: "Parental Guidance", url: createPageUrl("ParentalGuidance"), icon: Heart },
  { title: "Prediction Tools", url: createPageUrl("PredictionTools"), icon: LineChart },
  { title: "Monitoring Hub", url: createPageUrl("MonitoringHub"), icon: ClipboardList },
  { title: "Diet Generator", url: createPageUrl("DietChartGenerator"), icon: UtensilsCrossed },
  { title: "Reference Ranges", url: createPageUrl("ReferenceRanges"), icon: TestTube },
  { title: "Audit Logs", url: createPageUrl("AuditLogs"), icon: FileText },
  { title: "Research Hub", url: createPageUrl("ResearchHub"), icon: Layers },
  { title: "Notification Center", url: createPageUrl("NotificationDashboard"), icon: Bell },
  { title: "Genetic Analyzer", url: createPageUrl("GeneticReportAnalyzer"), icon: Activity },
  { title: "Patient Education", url: createPageUrl("PatientEducationHub"), icon: GraduationCap },
  { title: "Billing", url: createPageUrl("BillingDashboard"), icon: FileText },
  { title: "Referral Portal", url: createPageUrl("ReferralPortal"), icon: Activity },
  { title: "Lab Results", url: createPageUrl("LabResults"), icon: TestTube },
  { title: "Telemedicine", url: createPageUrl("Telemedicine"), icon: Activity },
];

function NavItem({ item, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === item.url;
  return (
    <Link
      to={item.url}
      onClick={onClick}
      aria-label={item.title}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md"
          : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <span className="truncate">{item.title}</span>
      {!isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-30" aria-hidden="true" />}
    </Link>
  );
}

function SidebarContent({ user, onClose, onLogout }) {
  return (
    <>
      {/* Header */}
      <div className="border-b-2 border-slate-200 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl">
            <Activity className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">CliniCals</h2>
            <p className="text-xs text-slate-500">by Swarnim</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="lg:hidden p-2 rounded-lg hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="w-5 h-5 text-slate-600" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4" aria-label="Main navigation">
        <section>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Main</p>
          <div className="space-y-0.5">
            {mainNavigation.map((item) => (
              <NavItem key={item.title} item={item} onClick={onClose} />
            ))}
          </div>
        </section>
        <Separator />
        <section>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Clinical Tools</p>
          <div className="space-y-0.5">
            {toolsNavigation.map((item) => (
              <NavItem key={item.title} item={item} onClick={onClose} />
            ))}
          </div>
        </section>
        <Separator />
        <section>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Resources</p>
          <div className="space-y-0.5">
            {resourcesNavigation.map((item) => (
              <NavItem key={item.title} item={item} onClick={onClose} />
            ))}
          </div>
        </section>
      </nav>

      {/* User footer */}
      <div className="border-t-2 border-slate-200 p-4 bg-slate-50 space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
            aria-hidden="true"
          >
            {user?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">{user?.full_name || "Loading..."}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role || ""}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          aria-label="Sign out of CliniCals"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
              toast.error("Account deletion initiated. Contact support to complete.");
            }
          }}
          aria-label="Delete your account"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          <span>Delete Account</span>
        </button>
      </div>
    </>
  );
}

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState("Hub");

  React.useEffect(() => {
    let retryCount = 0;
    const loadUser = async () => {
      try {
        setUser(await base44.auth.me());
      } catch {
        if (retryCount < 3) { retryCount++; setTimeout(loadUser, 1000 * retryCount); }
      }
    };
    loadUser();
  }, []);

  // Detect active tab from pathname
  React.useEffect(() => {
    for (const [tab, urls] of Object.entries(TAB_DETECTION)) {
      if (urls.some((url) => location.pathname.startsWith(url))) {
        setCurrentTab(tab);
        return;
      }
    }
  }, [location.pathname]);

  // Close sidebar on navigation
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleTabPress = (tab) => {
    const root = TAB_ROOTS[tab];
    if (currentTab === tab) {
      // Re-selecting active tab → reset to root
      navigate(root, { replace: true });
    } else {
      setCurrentTab(tab);
      navigate(root);
    }
  };

  const handleBack = () => navigate(-1);
  const handleLogout = () => base44.auth.logout();

  const showBackButton = currentPageName !== "Hub" && location.pathname !== createPageUrl("Hub");

  return (
    <PatientProvider>
      <IOSCompatibility />
      <style>{`
        :root {
          --safe-top: env(safe-area-inset-top, 0px);
          --safe-bottom: env(safe-area-inset-bottom, 0px);
          --safe-left: env(safe-area-inset-left, 0px);
          --safe-right: env(safe-area-inset-right, 0px);
          --tab-bar-height: calc(64px + var(--safe-bottom));
          --clinical-blue: #0066CC;
          --bg-gradient-start: #F8FAFC;
          --bg-gradient-end: #EFF6FF;
          --text-primary: #0F172A;
          --text-secondary: #64748B;
          --border-color: #E2E8F0;
          --sidebar-bg: rgba(255,255,255,0.97);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg-gradient-start: #1E293B;
            --bg-gradient-end: #334155;
            --text-primary: #F1F5F9;
            --text-secondary: #94A3B8;
            --border-color: #334155;
            --sidebar-bg: rgba(15,23,42,0.97);
          }
        }
        *, *::before, *::after { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        html, body {
          width: 100%; height: 100%;
          overflow: auto; overscroll-behavior: none;
          -webkit-text-size-adjust: 100%;
          -webkit-font-smoothing: antialiased;
        }
        .overflow-y-auto, .overflow-auto { -webkit-overflow-scrolling: touch; }
        button, a { touch-action: manipulation; }
        input, select, textarea { font-size: 16px !important; }
        .safe-pb { padding-bottom: var(--safe-bottom); }
        .safe-pt { padding-top: var(--safe-top); }
        .safe-pl { padding-left: var(--safe-left); }
        .safe-pr { padding-right: var(--safe-right); }
        /* Tab bar respects safe area */
        .tab-bar-inner { height: 56px; }
        .tab-bar-outer { padding-bottom: var(--safe-bottom); }
        /* Focus rings */
        :focus-visible { outline: 2px solid #3B82F6; outline-offset: 2px; }
      `}</style>

      <div
        className="min-h-screen flex w-full"
        style={{ background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))` }}
      >
        {/* ── Desktop Sidebar ── */}
        <aside
          className="hidden lg:flex flex-col fixed left-6 top-6 bottom-6 w-72 rounded-3xl shadow-2xl border-2 z-50 overflow-hidden"
          style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--border-color)" }}
          aria-label="Desktop sidebar navigation"
        >
          <SidebarContent user={user} onLogout={handleLogout} />
        </aside>

        {/* ── Mobile Drawer ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
              <motion.aside
                key="drawer"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className="lg:hidden flex flex-col fixed left-0 top-0 bottom-0 z-50 shadow-2xl overflow-hidden"
                style={{
                  width: "min(80vw, 320px)",
                  backgroundColor: "var(--sidebar-bg)",
                  paddingTop: "var(--safe-top)",
                  paddingBottom: "var(--safe-bottom)",
                }}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
              >
                <SidebarContent user={user} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <main
          className="flex-1 flex flex-col lg:ml-80"
          style={{ paddingBottom: "var(--tab-bar-height)" }}
          aria-label="Main content"
        >
          {/* Header */}
          <header
            className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-3 md:px-6 sticky top-0 z-30 shadow-sm"
            style={{ paddingTop: "var(--safe-top)" }}
            role="banner"
          >
            <div className="flex items-center justify-between gap-2 h-14">
              <div className="flex items-center gap-1.5">
                <button
                  className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open navigation menu"
                  aria-expanded={sidebarOpen}
                  aria-controls="mobile-drawer"
                >
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {showBackButton && (
                  <button
                    onClick={handleBack}
                    aria-label="Go back"
                    className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                )}

                <h1 className="text-sm md:text-base font-bold text-slate-900 leading-tight truncate">
                  CliniCals <span className="text-slate-400 font-normal hidden sm:inline">by Swarnim</span>
                </h1>
              </div>

              <Link to={createPageUrl("ClinicManagement")} aria-label="Open Clinic Mode">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-purple-50 border-purple-300 hover:bg-purple-100 text-purple-700 font-semibold text-xs h-9 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline ml-1">Clinic Mode</span>
                  <span className="sm:hidden ml-1">Clinic</span>
                </Button>
              </Link>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-auto">
            <PullToRefresh
              onRefresh={async () => {
                await queryClient.invalidateQueries();
                toast.success("Refreshed");
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </PullToRefresh>
          </div>

          {/* Desktop footer */}
          <footer className="hidden lg:block bg-white border-t border-slate-200 px-6 py-3 text-center text-xs text-slate-400">
            CliniCals by Swarnim — For informational purposes only. Not a substitute for clinical judgment.
          </footer>
        </main>

        <FloatingAIAssistant />
        <NotificationEngine />
        <FloatingHubButton />

        {/* ── Mobile Bottom Tab Bar ── */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 tab-bar-outer"
          style={{
            backgroundColor: "var(--sidebar-bg)",
            borderTop: "1px solid var(--border-color)",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          }}
          aria-label="Bottom tab navigation"
        >
          <div className="tab-bar-inner grid grid-cols-4">
            {[
              { id: "Hub", label: "Hub", Icon: Home },
              { id: "AI", label: "AI", Icon: Sparkles },
              { id: "Clinic", label: "Clinic", Icon: Users },
              { id: "Research", label: "Research", Icon: Layers },
            ].map(({ id, label, Icon }) => {
              const isActive = currentTab === id;
              return (
                <button
                  key={id}
                  onClick={() => handleTabPress(id)}
                  aria-label={`${label} tab${isActive ? ", currently selected" : ""}`}
                  aria-current={isActive ? "true" : undefined}
                  className="flex flex-col items-center justify-center gap-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 relative"
                  style={{ color: isActive ? "#3B82F6" : "var(--text-secondary)" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full"
                    />
                  )}
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </PatientProvider>
  );
}