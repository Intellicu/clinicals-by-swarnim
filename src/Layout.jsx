import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Users, // Added Users icon
  Layers // Added Layers icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { base44 } from "@/api/base44Client";
import { PatientProvider } from "./components/PatientContext";
import FloatingAIAssistant from "./components/FloatingAIAssistant";
import IOSCompatibility from "./components/iOSCompatibility";
import DataChatbot from "./components/DataChatbot";
import OfflineSync from "./components/OfflineSync";

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
    title: "Clinic Management",
    url: createPageUrl("ClinicManagement"),
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
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

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

  const handleBack = () => {
    navigate(-1);
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
        }

        /* iOS Compatibility Enhancements */
        * {
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        }

        html, body {
          width: 100%;
          height: 100%;
          overflow: auto;
          -webkit-text-size-adjust: 100%;
          -webkit-font-smoothing: antialiased;
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col fixed left-6 top-6 bottom-6 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-slate-200 z-50 overflow-hidden`}>
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

        <main className="flex-1 flex flex-col lg:ml-80">
          <header className="bg-white/90 backdrop-blur-md border-b-2 border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                )}
                <h1 className="text-xl font-bold text-slate-900">CliniCals by Swarnim</h1>
              </div>

              <Link to={createPageUrl("ClinicManagement")}>
                <Button variant="outline" className="bg-purple-50 border-purple-300 hover:bg-purple-100 text-purple-700 font-semibold">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Clinic Mode</span>
                </Button>
              </Link>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>

          <footer className="bg-white border-t-2 border-slate-200 px-6 py-4 text-center text-xs text-slate-500">
            <p>CliniCals by Swarnim - Clinical tools for informational purposes. Verify all calculations. Not a substitute for clinical judgment.</p>
          </footer>
        </main>

        <FloatingAIAssistant />
        <DataChatbot />
        <OfflineSync />
        </div>
        </PatientProvider>
        );
}