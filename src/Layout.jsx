import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Home, ArrowLeft, Users, Sparkles, Layers } from "lucide-react";
import ContextualBottomBar from "./components/nav/ContextualBottomBar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/client";
import { PatientProvider } from "./components/PatientContext";

import FeedbackReportButton from "./components/FeedbackReportButton";
import BetaDisclaimer from "./components/BetaDisclaimer";
import OnboardingConsent from "./components/OnboardingConsent";
import IOSCompatibility from "./components/iOSCompatibility";
import PullToRefresh from "./components/PullToRefresh";
import NotificationEngine from "./components/notifications/NotificationEngine";
import FloatingHubButton from "./components/FloatingHubButton";
import { useQueryClient } from "@tanstack/react-query";
import WorkspaceSidebar from "./components/nav/WorkspaceSidebar";
import TopQuickAccessBar from "./components/nav/TopQuickAccessBar";
import OfflineSync from "./components/OfflineSync";

// Tab root URLs — re-tapping the active tab resets to these
const TAB_ROOTS = {
  Hub: createPageUrl("Hub"),
  AI: createPageUrl("AIAssistant"),
  Clinic: createPageUrl("ClinicWorkflow"),
  Research: createPageUrl("ResearchHub"),
};

const TAB_DETECTION = {
  Hub: [createPageUrl("Hub"), createPageUrl("ClinicalSupport"), createPageUrl("Guidelines"), createPageUrl("CalculatorsHub")],
  AI: [createPageUrl("AIAssistant"), createPageUrl("VoiceAgent"), createPageUrl("VideoTeachingAgent")],
  Clinic: [createPageUrl("ClinicWorkflow"), createPageUrl("ClinicDashboard"), createPageUrl("ClinicManagement"), createPageUrl("ClinicOPDCockpit"), createPageUrl("PatientCockpit")],
  Research: [createPageUrl("ResearchHub"), createPageUrl("ResearchOS"), createPageUrl("ResearchMethodsHub")],
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState("Hub");
  const [showConsent, setShowConsent] = React.useState(false);

  React.useEffect(() => {
    let retryCount = 0;
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u && !u.beta_consent_given) {
          setShowConsent(true);
        }
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
          overflow-x: hidden;
          overflow-y: auto;
          max-width: 100vw;
          overscroll-behavior: none;
          -webkit-text-size-adjust: 100%;
          -webkit-font-smoothing: antialiased;
        }
        button, a, nav, [role="navigation"] {
          -webkit-user-select: none;
          user-select: none;
        }
        p, span, h1, h2, h3, h4, h5, li, td, th, .prose, .clinical-content {
          -webkit-user-select: text;
          user-select: text;
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
        style={{ background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))`, overflowX: "hidden", maxWidth: "100vw" }}
      >
        {/* ── Desktop Sidebar ── */}
        <aside
          className="hidden lg:flex flex-col fixed left-6 top-6 bottom-6 w-72 rounded-3xl shadow-2xl border-2 z-50 overflow-hidden"
          style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--border-color)" }}
          aria-label="Desktop sidebar navigation"
        >
          <WorkspaceSidebar user={user} onLogout={handleLogout} />
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
                <WorkspaceSidebar user={user} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <main
          className="flex-1 flex flex-col lg:ml-80 min-w-0"
          style={{ paddingBottom: "calc(var(--tab-bar-height, 64px) + env(safe-area-inset-bottom, 0px) + 16px)", overflowX: "hidden" }}
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
                  CliniCals Hub <span className="text-slate-400 font-normal hidden sm:inline">by Swarnim</span>
                </h1>
              </div>

              {user?.role === "admin" ? (
                <Link to={createPageUrl("ClinicWorkflow")} aria-label="Open Clinic Mode">
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
              ) : (
                <a
                  href="mailto:admin@clinicalshub.com?subject=Clinic Mode Access Request&body=I would like to request access to Clinic Mode. My account email is: "
                  aria-label="Request Clinic Mode Access"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-500 font-semibold text-xs h-9 focus:outline-none"
                    title="View-only — contact admin to unlock Clinic Mode"
                  >
                    <Users className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline ml-1">Request Access</span>
                    <span className="sm:hidden ml-1">Clinic</span>
                  </Button>
                </a>
              )}
            </div>
          </header>

          {/* Beta disclaimer */}
          <BetaDisclaimer />

          {/* Quick Access Bar */}
          <TopQuickAccessBar />

          {/* Page content */}
          <div className="flex-1 overflow-auto w-full">
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
                  <OfflineSync />
                  {children}
                </motion.div>
              </AnimatePresence>
            </PullToRefresh>
          </div>

          {/* Desktop footer */}
          <footer className="hidden lg:block bg-white border-t border-slate-200 px-6 py-3 text-center text-xs text-slate-400">
            <span>CliniCals Hub by Swarnim — Pediatric Clinical Intelligence. For informational purposes only.</span>
            <span className="mx-2">·</span>
            <Link to="/About" className="hover:text-slate-600 underline-offset-2 hover:underline">About</Link>
            <span className="mx-2">·</span>
            <Link to="/Contact" className="hover:text-slate-600 underline-offset-2 hover:underline">Contact</Link>
          </footer>
        </main>

        <NotificationEngine />
        {/* Feedback/Report button — bottom-left, clear of nav bar */}
        <div
          className="fixed z-40"
          style={{
            bottom: "calc(var(--tab-bar-height, 64px) + 8px)",
            left: "max(16px, env(safe-area-inset-left, 16px))",
          }}
        >
          <FeedbackReportButton pageName={currentPageName || window.location.pathname} />
        </div>
        {/* AI Hub FAB — bottom-right */}
        <FloatingHubButton />
        {showConsent && (
          <OnboardingConsent onComplete={() => setShowConsent(false)} />
        )}

        {/* ── Contextual Bottom Navigation ── */}
        <ContextualBottomBar />
      </div>
    </PatientProvider>
  );
}