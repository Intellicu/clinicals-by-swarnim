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
  X
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { base44 } from "@/api/base44Client";
import { PatientProvider } from "./components/PatientContext";
import FloatingAIAssistant from "./components/FloatingAIAssistant";
import IOSCompatibility from "./components/iOSCompatibility";
import DataChatbot from "./components/DataChatbot";
import PullToRefresh from "./components/PullToRefresh";
import NotificationEngine from "./components/notifications/NotificationEngine";
import FloatingHubButton from "./components/FloatingHubButton";
import { useQueryClient } from "@tanstack/react-query";

// Tab root URLs — re-selecting the active tab navigates here
const TAB_ROOTS = {
  Hub: createPageUrl("Hub"),
  AI: createPageUrl("AIAssistant"),
  Clinic: createPageUrl("ClinicWorkflow"),
  Research: createPageUrl("ResearchHub"),
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
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md"
          : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100"
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <span>{item.title}</span>
    </Link>
  );
}

function SidebarContent({ user, onClose, onLogout }) {
  return (
    <>
      {/* Brand header */}
      <div className="border-b border-slate-200 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg" aria-hidden="true">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg leading-none">CliniCals</p>
            <p className="text-xs text-slate-500">by Swarnim</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4" aria-label="Main navigation">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">Main</p>
          <div className="space-y-0.5">
            {mainNavigation.map((item) => (
              <NavItem key={item.title} item={item} onClick={onClose} />
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">Clinical Tools</p>
          <div className="space-y-0.5">
            {toolsNavigation.map((item) => (
              <NavItem key={item.title} item={item} onClick={onClose} />
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">Resources</p>
          <div className="space-y-0.5">
            {resourcesNavigation.map((item) => (
              <NavItem key={item.title} item={item} onClick={onClose} />
            ))}
          </div>
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-2">
        <div className="flex items-center gap-3" aria-label="Signed in user">
          <div
            className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
            aria-hidden="true"
          >
            {user?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">{user?.full_name || "Loading..."}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role || ""}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          aria-label="Sign out of CliniCals"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[44px]"
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
          aria-label="Delete account"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 min-h-[44px]"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          <span>Delete Account</span>
        </button>
      </div>
    </>
  );
}

const BOTTOM_TABS = [
  { key: "Hub", label: "Hub", icon: Home, root: TAB_ROOTS.Hub },
  { key: "AI", label: "AI", icon: Sparkles, root: TAB_ROOTS.AI },
  { key: "Clinic", label: "Clinic", icon: Users, root: TAB_ROOTS.Clinic },
  { key: "Research", label: "Research", icon: Layers, root: TAB_ROOTS.Research },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState("Hub");

  // Tab navigation stacks for back-navigation within a tab
  const [tabStacks, setTabStacks] = React.useState({
    Hub: [TAB_ROOTS.Hub],
    AI: [TAB_ROOTS.AI],
    Clinic: [TAB_ROOTS.Clinic],
    Research: [TAB_ROOTS.Research],
  });

  React.useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(loadUser, 1000 * retryCount);
        }
      }
    };
    loadUser();
  }, []);

  // Determine active tab from location
  React.useEffect(() => {
    const hubUrls = [createPageUrl("Hub"), createPageUrl("ClinicalToolsHub"), createPageUrl("ClinicalSupport"), createPageUrl("Guidelines"), createPageUrl("DrugCalculator")];
    const aiUrls = [createPageUrl("AIAssistant"), createPageUrl("VoiceAgent"), createPageUrl("VideoTeachingAgent")];
    const clinicUrls = [createPageUrl("ClinicWorkflow"), createPageUrl("ClinicDashboard"), createPageUrl("ClinicManagement"), createPageUrl("ClinicWorkspace")];
    const researchUrls = [createPageUrl("ResearchHub")];

    if (hubUrls.some((u) => location.pathname.startsWith(u))) setCurrentTab("Hub");
    else if (aiUrls.some((u) => location.pathname.startsWith(u))) setCurrentTab("AI");
    else if (clinicUrls.some((u) => location.pathname.startsWith(u))) setCurrentTab("Clinic");
    else if (researchUrls.some((u) => location.pathname.startsWith(u))) setCurrentTab("Research");
  }, [location.pathname]);

  // Push to tab stack on navigation
  React.useEffect(() => {
    setTabStacks((prev) => {
      const stack = prev[currentTab] || [];
      if (!stack.includes(location.pathname)) {
        return { ...prev, [currentTab]: [...stack, location.pathname] };
      }
      return prev;
    });
  }, [location.pathname, currentTab]);

  const handleBack = () => {
    const stack = tabStacks[currentTab];
    if (stack && stack.length > 1) {
      const newStack = stack.slice(0, -1);
      setTabStacks((prev) => ({ ...prev, [currentTab]: newStack }));
      navigate(newStack[newStack.length - 1]);
    } else {
      navigate(-1);
    }
  };

  const handleTabPress = (tab) => {
    if (tab.key === currentTab) {
      // Re-selecting active tab → reset to root
      setTabStacks((prev) => ({ ...prev, [tab.key]: [tab.root] }));
      navigate(tab.root);
    } else {
      // Restore last position in that tab
      const stack = tabStacks[tab.key];
      navigate(stack[stack.length - 1]);
    }
  };

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

          --clinical-blue: #0066CC;
          --bg-primary: #FFFFFF;
          --bg-secondary: #F8FAFC;
          --bg-gradient-start: #F8FAFC;
          --bg-gradient-end: #EFF6FF;
          --text-primary: #0F172A;
          --text-secondary: #64748B;
          --border-color: #E2E8F0;
          --sidebar-bg: rgba(255, 255, 255, 0.97);
          --tab-bar-height: calc(64px + var(--safe-bottom));
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg-primary: #0F172A;
            --bg-secondary: #1E293B;
            --bg-gradient-start: #1E293B;
            --bg-gradient-end: #334155;
            --text-primary: #F1F5F9;
            --text-secondary: #94A3B8;
            --border-color: #334155;
            --sidebar-bg: rgba(15, 23, 42, 0.97);
          }
        }

        * { -webkit-tap-highlight-color: transparent; }
        button, a, [role="button"] {
          user-select: none; -webkit-user-select: none;
          touch-action: manipulation;
        }
        html, body {
          width: 100%; height: 100%;
          overflow: auto; overscroll-behavior: none;
          -webkit-text-size-adjust: 100%;
          -webkit-font-smoothing: antialiased;
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }
        .overflow-y-auto, .overflow-auto { -webkit-overflow-scrolling: touch; }

        /* Minimum 44px touch targets */
        button, a { min-height: 44px; }

        /* Prevent zoom on input focus (iOS) */
        input, select, textarea { font-size: 16px !important; }

        /* Bottom tab bar safe area */
        .bottom-tab-bar {
          padding-bottom: var(--safe-bottom);
        }
        /* Main content padding for tab bar on mobile */
        .main-content-mobile {
          padding-bottom: var(--tab-bar-height);
        }
        /* Header safe area on notched devices */
        .header-safe {
          padding-top: max(12px, var(--safe-top));
          padding-left: max(12px, var(--safe-left));
          padding-right: max(12px, var(--safe-right));
        }
      `}</style>

      <div
        className="min-h-screen flex w-full"
        style={{ background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))` }}
      >
        {/* ── Desktop Sidebar ── */}
        <aside
          className="hidden lg:flex flex-col fixed left-6 top-6 bottom-6 w-72 rounded-3xl shadow-2xl border z-50 overflow-hidden"
          style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--border-color)" }}
          aria-label="Desktop navigation"
        >
          <SidebarContent user={user} onClose={null} onLogout={handleLogout} />
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
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="lg:hidden flex flex-col fixed left-0 top-0 bottom-0 z-50 shadow-2xl overflow-hidden"
                style={{
                  width: "min(320px, 85vw)",
                  backgroundColor: "var(--sidebar-bg)",
                  paddingTop: "var(--safe-top)",
                  paddingLeft: "var(--safe-left)",
                }}
                aria-label="Mobile navigation drawer"
                role="dialog"
                aria-modal="true"
              >
                <SidebarContent user={user} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main ── */}
        <main
          className="flex-1 flex flex-col lg:ml-80 main-content-mobile lg:pb-0"
          id="main-content"
        >
          {/* Header */}
          <header
            className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-30 shadow-sm header-safe"
            style={{ borderColor: "var(--border-color)" }}
            role="banner"
          >
            <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open navigation menu"
                  aria-expanded={sidebarOpen}
                  aria-controls="mobile-drawer"
                  className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                {showBackButton && (
                  <button
                    onClick={handleBack}
                    aria-label="Go back"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-blue-700 hover:bg-blue-50 active:bg-blue-100 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[44px]"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                )}
                <h1 className="text-sm md:text-lg font-bold text-slate-900 leading-tight">CliniCals</h1>
              </div>
              <Link
                to={createPageUrl("ClinicManagement")}
                aria-label="Open Clinic Mode"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-100 active:bg-purple-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 min-h-[44px]"
              >
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Clinic Mode</span>
                <span className="sm:hidden">Clinic</span>
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
                  transition={{ duration: 0.15 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </PullToRefresh>
          </div>

          {/* Desktop footer */}
          <footer className="hidden lg:block bg-white border-t px-6 py-3 text-center text-xs text-slate-400" style={{ borderColor: "var(--border-color)" }}>
            CliniCals by Swarnim — For informational purposes. Verify all calculations. Not a substitute for clinical judgment.
          </footer>
        </main>

        {/* Floating helpers */}
        <FloatingAIAssistant />
        <DataChatbot />
        <NotificationEngine />
        <FloatingHubButton />

        {/* ── Mobile Bottom Tab Bar ── */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bottom-tab-bar"
          style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--border-color)" }}
          aria-label="Primary navigation"
          role="tablist"
        >
          <div className="grid grid-cols-4 h-16">
            {BOTTOM_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.key;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${tab.label}${isActive ? ", current tab" : ""}`}
                  onClick={() => handleTabPress(tab)}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 active:bg-blue-50/50 ${
                    isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <div className={`relative flex items-center justify-center w-7 h-7 rounded-full transition-all duration-150 ${isActive ? "bg-blue-100" : ""}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className={`text-xs font-semibold tracking-tight ${isActive ? "text-blue-600" : "text-slate-400"}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </PatientProvider>
  );
}