import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import {
  Home, BookOpen, Calculator, GitBranch, Stethoscope, AlertTriangle, Pill,
  Activity, TestTube, Baby, Droplet, Layers, FlaskConical, Brain, Heart,
  Users, FileText, LineChart, GraduationCap, Sparkles, Mic, Bell,
  ClipboardList, UtensilsCrossed, Dna, X, ChevronRight, ChevronDown,
  Settings, Shield, LogOut, Trash2, Microscope, Zap, BarChart2,
  BookMarked, Clock, Star, RefreshCw, Beaker, Wind,
  Syringe, Radio, FileSearch, Edit3, Database
} from "lucide-react";
import { toast } from "sonner";

// ── Workspace definitions ─────────────────────────────────────────────────
const WORKSPACES = {
  hub: {
    id: "hub",
    label: "Clinicals Hub",
    color: "from-blue-600 to-indigo-600",
    icon: Home,
    description: "Reference & Intelligence"
  },
  clinic: {
    id: "clinic",
    label: "Clinic Mode",
    color: "from-purple-600 to-violet-700",
    icon: Users,
    description: "Workflow Engine",
    restricted: true
  },
  admin: {
    id: "admin",
    label: "Admin",
    color: "from-slate-700 to-slate-900",
    icon: Settings,
    description: "Governance",
    adminOnly: true
  }
};

// ── Hub sidebar nav ───────────────────────────────────────────────────────
const HUB_NAV = [
  {
    label: "Home",
    icon: Home,
    items: [
      { title: "Dashboard", url: createPageUrl("Hub"), icon: Home },
      { title: "AI Assistant", url: createPageUrl("AIAssistant"), icon: Sparkles },
    ]
  },
  {
    label: "Knowledge Base",
    icon: BookMarked,
    items: [
      {
        title: "Pediatric Nephrology & Urology",
        icon: Droplet,
        children: [
          { title: "Nephrology & Urology Hub", url: createPageUrl("UrologyNephrologyHub"), icon: Droplet },
          { title: "Clinical Pathways", url: createPageUrl("ClinicalSupport"), icon: GitBranch },
          { title: "Glomerular Diseases", url: createPageUrl("GlomerularDiseases"), icon: Microscope },
          { title: "Dialysis & RRT", url: createPageUrl("RRTAssistant"), icon: Activity },
          { title: "Clinical Approaches", url: createPageUrl("ClinicalApproaches"), icon: TestTube },
        ]
      },
      {
        title: "Pediatric Rheumatology",
        icon: Heart,
        children: [
          { title: "Rheumatology Hub", url: createPageUrl("PediatricRheumatology"), icon: Stethoscope },
          { title: "Lab Immunology", url: createPageUrl("LabPathways"), icon: FlaskConical },
        ]
      },
      {
        title: "Emergency Hub",
        icon: AlertTriangle,
        children: [
          { title: "Emergency Protocols", url: createPageUrl("EmergencyHub"), icon: AlertTriangle },
          { title: "Differential Engine", url: createPageUrl("DifferentialEngine"), icon: Brain },
        ]
      },
      {
        title: "Drugs & Biologics",
        icon: Pill,
        children: [
          { title: "Drug Database & Dosing", url: createPageUrl("DrugsDosing"), icon: Pill },
          { title: "AI Prescriber", url: createPageUrl("AIPrescriber"), icon: Sparkles },
        ]
      },
      {
        title: "Monitoring & Scores",
        icon: BarChart2,
        children: [
          { title: "Monitoring Hub", url: createPageUrl("MonitoringHub"), icon: BarChart2 },
        ]
      },
      {
        title: "Evidence Updates",
        icon: RefreshCw,
        children: [
          { title: "Guidelines Library", url: createPageUrl("Guidelines"), icon: BookOpen },
          { title: "Clinical OS", url: createPageUrl("ClinicalOS"), icon: Brain },
          { title: "Case Library", url: createPageUrl("CaseLibrary"), icon: BookOpen },
        ]
      },
    ]
  },
  {
    label: "Calculators Engine",
    icon: Calculator,
    items: [
      { title: "All Calculators", url: createPageUrl("CalculatorsHub"), icon: Calculator },
      { title: "Schwartz GFR", url: createPageUrl("SchwartzGFR"), icon: Activity },
      { title: "BP Percentiles", url: createPageUrl("BPPercentiles"), icon: Heart },
      { title: "ABG Interpreter", url: createPageUrl("ABGInterpreter"), icon: Wind },
      { title: "AKI Stager", url: createPageUrl("AKIStager"), icon: AlertTriangle },
    ]
  },
  {
    label: "Research",
    icon: Layers,
    items: [
      { title: "Research Hub", url: createPageUrl("ResearchHub"), icon: Layers },
      { title: "Research OS", url: createPageUrl("ResearchOS"), icon: Database },
      { title: "Research Methods", url: createPageUrl("ResearchMethodsHub"), icon: FileSearch },
      { title: "Teaching Hub", url: createPageUrl("TeachingHub"), icon: GraduationCap },
    ]
  },
];

// ── Clinic Mode sidebar nav ───────────────────────────────────────────────
const CLINIC_NAV = [
  {
    label: "Clinic Workflow",
    icon: Users,
    items: [
      { title: "Clinic Dashboard", url: createPageUrl("ClinicDashboard"), icon: Home },
      { title: "Appointments", url: createPageUrl("ClinicWorkflow"), icon: Clock },
      { title: "Patient Charts", url: createPageUrl("PatientCockpit"), icon: Stethoscope },
      { title: "Patient Manager", url: createPageUrl("PatientManager"), icon: Users },
      { title: "OPD Cockpit", url: createPageUrl("ClinicOPDCockpit"), icon: BarChart2 },
    ]
  },
  {
    label: "Clinical Tools",
    icon: Stethoscope,
    items: [
      { title: "Prescriptions", url: createPageUrl("PrescriptionWorkflow"), icon: FileText },
      { title: "Monitoring", url: createPageUrl("MonitoringHub"), icon: BarChart2 },
      { title: "OCR Uploads", url: createPageUrl("AIPrescriber"), icon: FileSearch },
      { title: "Clinical AI", url: createPageUrl("AIClinicalPathway"), icon: Brain },
      { title: "Lab Results", url: createPageUrl("LabResults"), icon: TestTube },
    ]
  },
  {
    label: "Emergency Workflows",
    icon: AlertTriangle,
    items: [
      { title: "Emergency Hub", url: createPageUrl("EmergencyHub"), icon: AlertTriangle },
      { title: "Admission Orders", url: createPageUrl("AdmissionOrders"), icon: ClipboardList },
    ]
  },
];

// ── Admin sidebar nav ─────────────────────────────────────────────────────
const ADMIN_NAV = [
  {
    label: "Editorial Review",
    icon: Edit3,
    items: [
      { title: "Content Manager", url: createPageUrl("UserContentManager"), icon: Edit3 },
      { title: "Clinical OS", url: createPageUrl("ClinicalOS"), icon: Brain },
      { title: "Audit Logs", url: createPageUrl("AuditLogs"), icon: FileSearch },
    ]
  },
  {
    label: "Governance",
    icon: Shield,
    items: [
      { title: "Prediction Tools", url: createPageUrl("PredictionTools"), icon: LineChart },
      { title: "Reference Ranges", url: createPageUrl("ReferenceRanges"), icon: TestTube },
      { title: "Publishing Queue", url: createPageUrl("NotificationDashboard"), icon: Bell },
    ]
  },
];

// ── NavItem ───────────────────────────────────────────────────────────────
function NavItem({ item, onClick, depth = 0 }) {
  const location = useLocation();
  const isActive = location.pathname === item.url;
  return (
    <Link
      to={item.url}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        depth > 0 ? "px-3 py-2 ml-3" : "px-4 py-2.5"
      } ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <item.icon className={`flex-shrink-0 ${depth > 0 ? "w-3.5 h-3.5" : "w-4 h-4"}`} aria-hidden="true" />
      <span className="truncate text-sm">{item.title}</span>
      {!isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-20" aria-hidden="true" />}
    </Link>
  );
}

// ── CollapsibleGroup ──────────────────────────────────────────────────────
function CollapsibleGroup({ item, onClick }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const anyChildActive = item.children?.some(c => location.pathname === c.url);

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm focus:outline-none ${
          anyChildActive ? "text-blue-700 font-semibold bg-blue-50" : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        <item.icon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate flex-1 text-left">{item.title}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 py-1">
              {item.children.map(child => (
                <NavItem key={child.title} item={child} onClick={onClick} depth={1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── NavGroup ──────────────────────────────────────────────────────────────
function NavGroup({ group, onClick }) {
  const [open, setOpen] = useState(true);
  const GroupIcon = group.icon;
  return (
    <section>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 focus:outline-none"
      >
        <GroupIcon className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 mt-1">
              {group.items.map(item => (
                item.children
                  ? <CollapsibleGroup key={item.title} item={item} onClick={onClick} />
                  : <NavItem key={item.title} item={item} onClick={onClick} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ── WorkspaceSwitcher ─────────────────────────────────────────────────────
function WorkspaceSwitcher({ activeWorkspace, onSwitch, user }) {
  const isAdmin = user?.role === "admin";
  const canAccessClinic = isAdmin;

  const buttons = [
    { id: "hub", label: "Hub", icon: Home, show: true },
    { id: "clinic", label: "Clinic", icon: Users, show: canAccessClinic },
    { id: "admin", label: "Admin", icon: Settings, show: isAdmin },
  ].filter(b => b.show);

  return (
    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
      {buttons.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSwitch(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all focus:outline-none ${
            activeWorkspace === id
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────
export default function WorkspaceSidebar({ user, onClose, onLogout }) {
  const [workspace, setWorkspace] = useState(() => {
    try { return localStorage.getItem("clinicals_workspace") || "hub"; } catch { return "hub"; }
  });

  const handleSwitch = (ws) => {
    setWorkspace(ws);
    try { localStorage.setItem("clinicals_workspace", ws); } catch {}
  };

  const isAdmin = user?.role === "admin";
  const isClinicMode = user?.role === "admin"; // Extend later for premium roles

  const nav = workspace === "clinic" ? CLINIC_NAV
    : workspace === "admin" ? ADMIN_NAV
    : HUB_NAV;

  const ws = WORKSPACES[workspace];

  return (
    <>
      {/* Header */}
      <div className={`border-b border-slate-200 p-4 bg-gradient-to-r ${ws.color} bg-opacity-10`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 bg-gradient-to-br ${ws.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <ws.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm leading-tight">CliniCals Hub</h2>
              <p className="text-xs text-slate-500">{ws.label}</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
              <X className="w-4 h-4 text-slate-600" />
            </button>
          )}
        </div>

        {/* Workspace switcher */}
        <WorkspaceSwitcher
          activeWorkspace={workspace}
          onSwitch={handleSwitch}
          user={user}
        />
      </div>

      {/* Clinic Mode restricted notice */}
      {workspace === "clinic" && !isClinicMode && (
        <div className="m-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          <strong>Premium / Admin only.</strong> Upgrade to access Clinic Mode workflows.
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-3" aria-label="Workspace navigation">
        {(workspace === "clinic" && !isClinicMode)
          ? null
          : nav.map((group, gi) => (
            <React.Fragment key={group.label}>
              {gi > 0 && <Separator className="my-1" />}
              <NavGroup group={group} onClick={onClose} />
            </React.Fragment>
          ))
        }
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-200 p-3 bg-slate-50 space-y-1.5">
        <div className="flex items-center gap-2.5 px-1 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow">
            {user?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-xs truncate">{user?.full_name || "Loading…"}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role || ""}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-all font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
        <button
          onClick={() => {
            if (window.confirm("Delete your account? This cannot be undone.")) {
              toast.error("Contact support to complete account deletion.");
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-all font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Account
        </button>
      </div>
    </>
  );
}