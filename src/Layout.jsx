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
  Building2,
  Trash2,
  Bell
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { base44 } from "@/api/base44Client";
import { PatientProvider } from "./components/PatientContext";
import FloatingAIAssistant from "./components/FloatingAIAssistant";
import IOSCompatibility from "./components/iOSCompatibility";
import DataChatbot from "./components/DataChatbot";
import OfflineSync from "./components/OfflineSync";
import OfflineManager from "./components/OfflineManager";
import PullToRefresh from "./components/PullToRefresh";
import NotificationEngine from "./components/notifications/NotificationEngine";
import { useQueryClient } from "@tanstack/react-query";

const mainNavigation = [
  {
    title: "Hub",
    url: createPageUrl("Hub"),
    icon: Home,
  },
  {
    title: "AI Assistant",
    url: createPageUrl("AIAssistant"),
    icon: Sparkles,
  },
  {
    title: "Voice Agent",
    url: createPageUrl("VoiceAgent"),
    icon: Mic,
  },
  {
    title: "Video Companion",
    url: createPageUrl("VideoTeachingAgent"),
    icon: Activity,
  }
];

const toolsNavigation = [
  {
    title: "Clinical Tools Hub",
    url: createPageUrl("ClinicalToolsHub"),
    icon: Calculator,
  },
  {
    title: "Clinical Pathways",
    url: createPageUrl("ClinicalSupport"),
    icon: GitBranch,
  },
  {
    title: "Guidelines Library",
    url: createPageUrl("Guidelines"),
    icon: BookOpen,
  },
  {
    title: "Drug Database",
    url: createPageUrl("DrugCalculator"),
    icon: Pill,
  }
];

const resourcesNavigation = [
  {
    title: "Clinic Dashboard",
    url: createPageUrl("ClinicDashboard"),
    icon: Users,
  },
  {
    title: "Content Manager",
    url: createPageUrl("UserContentManager"),
    icon: FileText,
  },
  {
    title: "Teaching Hub",
    url: createPageUrl("TeachingHub"),
    icon: GraduationCap,
  },
  {
    title: "Parental Guidance",
    url: createPageUrl("ParentalGuidance"),
    icon: Heart,
  },
  {
    title: "Prediction Tools",
    url: createPageUrl("PredictionTools"),
    icon: LineChart,
  },
  {
    title: "Monitoring Hub",
    url: createPageUrl("MonitoringHub"),
    icon: ClipboardList,
  },
  {
    title: "Diet Generator",
    url: createPageUrl("DietChartGenerator"),
    icon: UtensilsCrossed,
  },
  {
    title: "Reference Ranges",
    url: createPageUrl("ReferenceRanges"),
    icon: TestTube,
  },
  {
    title: "Audit Logs",
    url: createPageUrl("AuditLogs"),
    icon: FileText,
  },
  {
    title: "Research Hub",
    url: createPageUrl("ResearchHub"),
    icon: Layers,
  },
  {
    title: "Notification Center",
    url: createPageUrl("NotificationDashboard"),
    icon: Bell,
  },
  {
    title: "Genetic Analyzer",
    url: createPageUrl("GeneticReportAnalyzer"),
    icon: Activity,
  },
  {
    title: "Patient Education",
    url: createPageUrl("PatientEducationHub"),
    icon: GraduationCap,
  },
  {
    title: "Billing",
    url: createPageUrl("BillingDashboard"),
    icon: FileText,
  },
  {
    title: "Referral Portal",
    url: createPageUrl("ReferralPortal"),
    icon: Activity,
  },
  {
    title: "Lab Results",
    url: createPageUrl("LabResults"),
    icon: TestTube,
  },
  {
    title: "Telemedicine",
    url: createPageUrl("Telemedicine"),
    icon: Activity,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Tab navigation stacks
  const [tabStacks, setTabStacks] = React.useState({
    Hub: [createPageUrl("Hub")],
    AI: [createPageUrl("AIAssistant")],
    Clinic: [createPageUrl("ClinicWorkflow")],
    Research: [createPageUrl("ResearchHub")]
  });
  const [currentTab, setCurrentTab] = React.useState("Hub");

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

  const handleLogout = () => {
    base44.auth.logout();
  };

  // Determine current tab based on location
  React.useEffect(() => {
    const hubUrls = [createPageUrl("Hub"), createPageUrl("ClinicalToolsHub"), createPageUrl("ClinicalSupport"), createPageUrl("Guidelines"), createPageUrl("DrugCalculator")];
    const aiUrls = [createPageUrl("AIAssistant"), createPageUrl("VoiceAgent"), createPageUrl("VideoTeachingAgent")];
    const clinicUrls = [createPageUrl("ClinicWorkflow"), createPageUrl("ClinicDashboard"), createPageUrl("ClinicManagement"), createPageUrl("ClinicWorkspace")];
    const researchUrls = [createPageUrl("ResearchHub")];
    
    if (hubUrls.some(url => location.pathname.startsWith(url))) {
      setCurrentTab("Hub");
    } else if (aiUrls.some(url => location.pathname.startsWith(url))) {
      setCurrentTab("AI");
    } else if (clinicUrls.some(url => location.pathname.startsWith(url))) {
      setCurrentTab("Clinic");
    } else if (researchUrls.some(url => location.pathname.startsWith(url))) {
      setCurrentTab("Research");
    }
  }, [location.pathname]);

  // Update tab stack on navigation
  React.useEffect(() => {
    setTabStacks(prev => {
      const newStacks = { ...prev };
      const stack = newStacks[currentTab];
      
      if (stack && !stack.includes(location.pathname)) {
        newStacks[currentTab] = [...stack, location.pathname];
      }
      
      return newStacks;
    });
  }, [location.pathname, currentTab]);

  const handleBack = () => {
    const stack = tabStacks[currentTab];
    if (stack && stack.length > 1) {
      const newStack = stack.slice(0, -1);
      setTabStacks(prev => ({ ...prev, [currentTab]: newStack }));
      navigate(newStack[newStack.length - 1]);
    } else {
      navigate(-1);
    }
  };

  const showBackButton = currentPageName !== "Hub" && location.pathname !== createPageUrl("Hub");

  const NavItem = ({ item, onClick }) => {
    const isActive = location.pathname === item.url;
    return (
      <Link 
        to={item.url} 
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md' 
            : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
        }`}
      >
        <item.icon className="w-5 h-5" />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <PatientProvider>
      <IOSCompatibility />
      <style>{`
        :root {
          --clinical-blue: #0066CC;
          --clinical-blue-light: #3399FF;
          --clinical-blue-dark: #004C99;
          --safety-red: #DC2626;
          --safety-amber: #F59E0B;
          --safety-green: #10B981;
          --clinical-gray: #64748B;
          --clinical-gray-light: #F1F5F9;

          /* Light Mode Colors */
          --bg-primary: #FFFFFF;
          --bg-secondary: #F8FAFC;
          --bg-gradient-start: #F8FAFC;
          --bg-gradient-end: #EFF6FF;
          --text-primary: #0F172A;
          --text-secondary: #64748B;
          --border-color: #E2E8F0;
          --card-bg: #FFFFFF;
          --sidebar-bg: rgba(255, 255, 255, 0.95);
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
            --card-bg: #1E293B;
            --sidebar-bg: rgba(30, 41, 59, 0.95);
          }
        }

        /* iOS Compatibility Enhancements */
        * {
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        }

        button, a, [role="button"], .nav-item {
          user-select: none;
          -webkit-user-select: none;
        }

        html, body {
          width: 100%;
          height: 100%;
          overflow: auto;
          overscroll-behavior: none;
          -webkit-text-size-adjust: 100%;
          -webkit-font-smoothing: antialiased;
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }

        /* Smooth scrolling for iOS */
        .overflow-y-auto, .overflow-auto {
          -webkit-overflow-scrolling: touch;
        }

        /* Touch-friendly sizing */
        button, a {
          min-height: 44px;
          touch-action: manipulation;
        }

        /* Prevent zoom on input focus (iOS) */
        input, select, textarea {
          font-size: 16px;
        }

        /* Safe area padding */
        @supports (padding: env(safe-area-inset-bottom)) {
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
      <div className="min-h-screen flex w-full" style={{ background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))` }}>
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col fixed left-6 top-6 bottom-6 w-72 rounded-3xl shadow-2xl border-2 z-50 overflow-hidden`} style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}>
          <div className="border-b-2 border-slate-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-xl">CliniCals</h2>
                <p className="text-xs text-slate-500">by Swarnim</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1 mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Main</p>
              {mainNavigation.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </div>

            <Separator className="my-3" />

            <div className="space-y-1 mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Clinical Tools</p>
              {toolsNavigation.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </div>

            <Separator className="my-3" />

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Resources</p>
              {resourcesNavigation.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </div>
          </div>

          <div className="border-t-2 p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.full_name || 'Loading...'}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user?.role || ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  toast.error('Account deletion initiated. Contact support to complete.');
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <>
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="lg:hidden flex flex-col fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl">
              <div className="border-b-2 border-slate-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-xl">CliniCals</h2>
                    <p className="text-xs text-slate-500">by Swarnim</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-1 mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Main</p>
                  {mainNavigation.map((item) => (
                    <NavItem key={item.title} item={item} onClick={() => setSidebarOpen(false)} />
                  ))}
                </div>

                <Separator className="my-3" />

                <div className="space-y-1 mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Clinical Tools</p>
                  {toolsNavigation.map((item) => (
                    <NavItem key={item.title} item={item} onClick={() => setSidebarOpen(false)} />
                  ))}
                </div>

                <Separator className="my-3" />

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Resources</p>
                  {resourcesNavigation.map((item) => (
                    <NavItem key={item.title} item={item} onClick={() => setSidebarOpen(false)} />
                  ))}
                </div>
              </div>

              <div className="border-t-2 border-slate-200 p-4 bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {user?.full_name || 'Loading...'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user?.role || ''}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </aside>
          </>
        )}

        <main className="flex-1 flex flex-col lg:ml-80 pb-16 lg:pb-0">
          <header className="bg-white/90 backdrop-blur-md border-b-2 border-slate-200 px-3 md:px-6 py-3 md:py-4 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
                {showBackButton && (
                  <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-1 hover:bg-blue-50 hover:text-blue-700 h-8">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">Back</span>
                  </Button>
                )}
                <h1 className="text-sm md:text-xl font-bold text-slate-900 leading-tight">CliniCals by Swarnim</h1>
              </div>
              <Link to={createPageUrl("ClinicManagement")}>
                <Button variant="outline" size="sm" className="bg-purple-50 border-purple-300 hover:bg-purple-100 text-purple-700 font-semibold text-xs h-8">
                  <Users className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Clinic Mode</span><span className="sm:hidden">Clinic</span>
                </Button>
              </Link>
            </div>
          </header>

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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </PullToRefresh>
          </div>

          <footer className="bg-white border-t-2 border-slate-200 px-6 py-4 text-center text-xs text-slate-500">
            <p>CliniCals by Swarnim - Clinical tools for informational purposes. Verify all calculations. Not a substitute for clinical judgment.</p>
          </footer>
        </main>

        <FloatingAIAssistant />
        <DataChatbot />
        <NotificationEngine />

        {/* Mobile Bottom Tab Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t-2 shadow-2xl pb-safe" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}>
          <div className="grid grid-cols-4 h-16">
            <button 
              onClick={() => {
                const stack = tabStacks.Hub;
                navigate(stack[stack.length - 1]);
              }}
              className="flex flex-col items-center justify-center gap-1 transition-colors" 
              style={{ color: currentTab === "Hub" ? '#3B82F6' : 'var(--text-secondary)' }}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-semibold">Hub</span>
            </button>
            <button 
              onClick={() => {
                const stack = tabStacks.AI;
                navigate(stack[stack.length - 1]);
              }}
              className="flex flex-col items-center justify-center gap-1 transition-colors" 
              style={{ color: currentTab === "AI" ? '#3B82F6' : 'var(--text-secondary)' }}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-semibold">AI</span>
            </button>
            <button 
              onClick={() => {
                const stack = tabStacks.Clinic;
                navigate(stack[stack.length - 1]);
              }}
              className="flex flex-col items-center justify-center gap-1 transition-colors" 
              style={{ color: currentTab === "Clinic" ? '#3B82F6' : 'var(--text-secondary)' }}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs font-semibold">Clinic</span>
            </button>
            <button 
              onClick={() => {
                const stack = tabStacks.Research;
                navigate(stack[stack.length - 1]);
              }}
              className="flex flex-col items-center justify-center gap-1 transition-colors" 
              style={{ color: currentTab === "Research" ? '#3B82F6' : 'var(--text-secondary)' }}
            >
              <Layers className="w-5 h-5" />
              <span className="text-xs font-semibold">Research</span>
            </button>
          </div>
        </nav>
        </div>
        </PatientProvider>
        );
}