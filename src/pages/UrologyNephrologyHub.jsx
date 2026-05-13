import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope, Droplet, Brain, Activity, TestTube, BookOpen,
  Microscope, Shield, Camera, Syringe, FlaskConical,
  ClipboardList, Users, BarChart2, Heart
} from "lucide-react";

// Hub section components
import HubSectionNav from "../components/hub/HubSectionNav";
import HubNephrologyPathways from "../components/hub/HubNephrologyPathways";
import HubAILabAnalyzer from "../components/hub/HubAILabAnalyzer";
import HubMonitoringTemplates from "../components/hub/HubMonitoringTemplates";
import HubPatientEducation from "../components/hub/HubPatientEducation";

// Clinical modules
import CAKUTMasterCenter from "../components/cakut/CAKUTMasterCenter";
import NeurogenicBladderCenter from "../components/urology/NeurogenicBladderCenter";
import BBDICCSModule from "../components/urology/BBDICCSModule";
import TubularDisorderLab from "../components/tubular/TubularDisorderLab";

// Inline panels (kept lean)
import HubUTIModule from "../components/hub/HubUTIModule";
import HubGlomerularPanel from "../components/hub/HubGlomerularPanel";
import HubDialysisPanel from "../components/hub/HubDialysisPanel";
import HubTransplantPanel from "../components/hub/HubTransplantPanel";
import HubHypertensionPanel from "../components/hub/HubHypertensionPanel";
import HubImagingPanel from "../components/hub/HubImagingPanel";

const SECTIONS = [
  { id: "nephrology", label: "Nephrology Pathways", icon: Stethoscope, badge: "Umbrella" },
  { id: "cakut", label: "CAKUT & Urology", icon: Droplet, badge: "8+" },
  { id: "neuro_bbd", label: "NGB & BBD", icon: Brain, badge: "ICCS" },
  { id: "uti", label: "UTI & Antimicrobial", icon: Microscope, badge: "ISPN" },
  { id: "tubular", label: "Tubular & Electrolytes", icon: TestTube, badge: "RTA" },
  { id: "dialysis", label: "Dialysis & ICU", icon: Activity, badge: "HD·PD·CRRT" },
  { id: "transplant", label: "Transplant", icon: Syringe, badge: "IS" },
  { id: "htn", label: "Hypertension", icon: Shield, badge: "AAP" },
  { id: "imaging", label: "Imaging & Dx", icon: Camera, badge: "RBUS" },
  { id: "ai_lab", label: "AI Lab Analyzer", icon: FlaskConical, badge: "AI" },
  { id: "monitoring", label: "Monitoring", icon: ClipboardList },
  { id: "education", label: "Patient Education", icon: Users },
];

export default function UrologyNephrologyHub() {
  const [activeSection, setActiveSection] = useState("nephrology");
  const [sectionHistory, setSectionHistory] = useState([]);

  const renderContent = () => {
    switch (activeSection) {
      case "nephrology": return <HubNephrologyPathways />;
      case "cakut": return <CAKUTMasterCenter />;
      case "neuro_bbd": return <NeuroBBDTab />;
      case "uti": return <HubUTIModule />;
      case "tubular": return <TubularDisorderLab />;
      case "dialysis": return <HubDialysisPanel />;
      case "transplant": return <HubTransplantPanel />;
      case "htn": return <HubHypertensionPanel />;
      case "imaging": return <HubImagingPanel />;
      case "ai_lab": return <HubAILabAnalyzer />;
      case "monitoring": return <HubMonitoringTemplates />;
      case "education": return <HubPatientEducation />;
      default: return <HubNephrologyPathways />;
    }
  };

  const currentSection = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-800 via-indigo-700 to-violet-700 p-5 text-white shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Pediatric Nephrology & Urology Hub</h1>
              <p className="text-blue-100 text-sm mt-1">
                Nephrology · CAKUT · NGB/BBD · UTI · Tubular · Dialysis · Transplant · Hypertension · Imaging · AI Lab · Education
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["KDIGO 2021", "ISPN", "ICCS 2016", "Fellowship-grade", "12 Domains"].map(t => (
                  <span key={t} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 border text-xs flex-shrink-0">v5.0</Badge>
          </div>
        </div>

        {/* Breadcrumb + Back */}
        <div className="flex items-center gap-2">
          {sectionHistory.length > 0 ? (
            <button
              onClick={() => {
                const prev = [...sectionHistory];
                const last = prev.pop();
                setSectionHistory(prev);
                setActiveSection(last);
              }}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              ← Back to {SECTIONS.find(s => s.id === sectionHistory[sectionHistory.length - 1])?.label || "Previous"}
            </button>
          ) : (
            <Link to="/" className="text-xs text-slate-500 hover:text-blue-600 px-2 py-1">← Hub</Link>
          )}
          <span className="text-slate-400 text-xs">›</span>
          <span className="text-xs text-slate-700 font-semibold">{currentSection.label}</span>
        </div>

        {/* Sticky Section Navigator */}
        <HubSectionNav
          sections={SECTIONS}
          activeId={activeSection}
          onSelect={(id) => {
            if (id !== activeSection) {
              setSectionHistory(prev => [...prev, activeSection]);
            }
            setActiveSection(id);
          }}
        />

        {/* Content */}
        <div className="mt-2">{renderContent()}</div>
      </div>
    </div>
  );
}

// ── Neuro/BBD combined tab ──────────────────────────────────────────────────
function NeuroBBDTab() {
  const [sub, setSub] = useState("neuro");
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Brain className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Neurogenic Bladder & BBD</h2>
            <p className="text-violet-100 text-sm">NGB · BBD · ICCS · CIC · Urotherapy · UDS · Uroflowmetry · Constipation</p>
          </div>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap bg-slate-100 p-1 rounded-xl">
        {[
          { id: "neuro", label: "Neurogenic Bladder" },
          { id: "bbd", label: "BBD / ICCS" },
        ].map(t => (
          <button key={t.id} onClick={() => setSub(t.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${sub === t.id ? "bg-violet-600 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-200"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {sub === "neuro" && <NeurogenicBladderCenter />}
      {sub === "bbd" && <BBDICCSModule />}
    </div>
  );
}