import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home, Search, Calculator, AlertTriangle, LayoutGrid,
  Users, Stethoscope, Pill, Clock, Star,
  BarChart2, FileText, Droplet
} from "lucide-react";
import { motion } from "framer-motion";

// Detect which workspace context we're in from the URL
function useWorkspaceContext() {
  const location = useLocation();
  const p = location.pathname;
  const clinicPages = ["/ClinicDashboard", "/ClinicOPDCockpit", "/PatientCockpit", "/ClinicWorkflow", "/PatientManager", "/PrescriptionWorkflow", "/ClinicManagement"];
  const calcPages = ["/CalculatorsHub", "/SchwartzGFR", "/BPPercentiles", "/ABGInterpreter", "/AKIStager", "/FluidCalculator", "/AnionGap", "/KtVCalculator", "/TTKGCalculator", "/FENaCalculator", "/FEUreaCalculator", "/SodiumCalculator", "/PotassiumCalculator", "/Anthropometry"];
  if (clinicPages.some(pg => p.includes(pg))) return "clinic";
  if (calcPages.some(pg => p.includes(pg))) return "calc";
  return "hub";
}

function TabBtn({ icon: Icon, label, to, isActive, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 relative focus:outline-none transition-colors ${
        isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="bottom-indicator"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full"
        />
      )}
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium leading-none">{label}</span>
    </Link>
  );
}

export default function ContextualBottomBar() {
  const location = useLocation();
  const context = useWorkspaceContext();
  const p = location.pathname;

  const hubTabs = [
    { icon: Home, label: "Home", to: createPageUrl("Hub") },
    { icon: Search, label: "Search", to: createPageUrl("Guidelines") },
    { icon: Calculator, label: "Calc", to: createPageUrl("CalculatorsHub") },
    { icon: AlertTriangle, label: "Emergency", to: createPageUrl("EmergencyHub") },
    { icon: Droplet, label: "Urology", to: createPageUrl("UrologyNephrologyHub") },
  ];

  const calcTabs = [
    { icon: Home, label: "Home", to: createPageUrl("Hub") },
    { icon: Search, label: "Search", to: createPageUrl("CalculatorsHub") },
    { icon: Clock, label: "Recent", to: createPageUrl("CalculatorsHub") },
    { icon: Star, label: "Favorites", to: createPageUrl("CalculatorsHub") },
    { icon: LayoutGrid, label: "Modes", to: createPageUrl("Hub") },
  ];

  const clinicTabs = [
    { icon: BarChart2, label: "Dashboard", to: createPageUrl("ClinicDashboard") },
    { icon: Users, label: "Patients", to: createPageUrl("PatientManager") },
    { icon: FileText, label: "Quick Rx", to: createPageUrl("PrescriptionWorkflow") },
    { icon: Calculator, label: "Calc", to: createPageUrl("CalculatorsHub") },
    { icon: LayoutGrid, label: "Modes", to: createPageUrl("Hub") },
  ];

  const tabs = context === "clinic" ? clinicTabs
    : context === "calc" ? calcTabs
    : hubTabs;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "rgba(255,255,255,0.97)",
        borderTop: "1px solid #E2E8F0",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)"
      }}
      aria-label="Bottom navigation"
    >
      <div className="flex h-14">
        {tabs.map((tab) => (
          <TabBtn
            key={tab.label}
            icon={tab.icon}
            label={tab.label}
            to={tab.to}
            isActive={p === tab.to || (tab.label === "Home" && p === "/Hub")}
          />
        ))}
      </div>
    </nav>
  );
}