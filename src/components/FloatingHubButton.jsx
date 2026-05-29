import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Bot, X, Microscope, Dna, Zap, Brain, TestTube, Layers,
  FlaskConical, BookOpen, Activity, Sparkles, Wind, Droplet,
  Baby, AlertCircle, UtensilsCrossed, ChevronRight
} from "lucide-react";

const AI_ANALYSER_TOOLS = [
  // Clinical AI
  { name: "Lab Analyzer", icon: Microscope, color: "bg-rose-600", page: "ClinicalAIHub", tab: "labs", group: "Clinical AI" },
  { name: "Biopsy AI", icon: Layers, color: "bg-violet-700", page: "ClinicalAIHub", tab: "biopsy", group: "Clinical AI" },
  { name: "Case Analyzer", icon: BookOpen, color: "bg-emerald-700", page: "ClinicalAIHub", tab: "case", group: "Clinical AI" },
  { name: "Differential Dx", icon: Brain, color: "bg-indigo-600", page: "DifferentialEngine", group: "Clinical AI" },
  { name: "Urine/UDS AI", icon: TestTube, color: "bg-teal-600", page: "ClinicalAIHub", tab: "uds", group: "Clinical AI" },
  { name: "Radiology AI", icon: Activity, color: "bg-sky-700", page: "ClinicalAIHub", tab: "radiology", group: "Clinical AI" },
  // Nephro
  { name: "Genetic Agent", icon: Dna, color: "bg-violet-600", page: "GeneticReportAnalyzer", group: "Nephrology" },
  { name: "Uroflow AI", icon: Activity, color: "bg-teal-700", page: "UrologyNephrologyHub", tab: "uroflow", group: "Nephrology" },
  { name: "Rare Lab AI", icon: FlaskConical, color: "bg-purple-700", page: "RareDiseaseModule", group: "Nephrology" },
  { name: "AI Prescriber", icon: Sparkles, color: "bg-indigo-700", page: "AIPrescriber", group: "Nephrology" },
  // Pediatrics
  { name: "CBC Analyzer", icon: Microscope, color: "bg-blue-600", page: "ClinicalAIHub", tab: "labs", group: "Pediatrics" },
  { name: "ABG Analyzer", icon: Wind, color: "bg-rose-600", page: "ABGInterpreter", group: "Pediatrics" },
  { name: "Growth Analyzer", icon: Baby, color: "bg-green-600", page: "GeneralPediatricsHub", group: "Pediatrics" },
  { name: "Nutrition AI", icon: UtensilsCrossed, color: "bg-orange-600", page: "NutritionHub", group: "Pediatrics" },
  { name: "Sepsis AI", icon: AlertCircle, color: "bg-red-600", page: "ClinicalAIHub", group: "Pediatrics" },
  { name: "Dehydration AI", icon: Droplet, color: "bg-cyan-600", page: "ClinicalAIHub", group: "Pediatrics" },
];

const GROUPS = ["Clinical AI", "Nephrology", "Pediatrics"];

export default function FloatingHubButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState("Clinical AI");

  if (location.pathname === "/AIAgentsHub") return null;

  const groupTools = AI_ANALYSER_TOOLS.filter(t => t.group === activeGroup);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 lg:bottom-14 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-700 to-violet-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-white" />
              <div>
                <p className="text-white font-bold text-sm">AI Clinical Analysers</p>
                <p className="text-indigo-200 text-xs">Tap any tool to launch</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Group tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50">
            {GROUPS.map(g => (
              <button key={g} onClick={() => setActiveGroup(g)}
                className={`flex-1 py-2 text-xs font-semibold transition-all ${activeGroup === g ? "bg-white text-indigo-700 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"}`}>
                {g}
              </button>
            ))}
          </div>

          {/* Tools grid */}
          <div className="p-3 grid grid-cols-3 gap-2">
            {groupTools.map(tool => {
              const Icon = tool.icon;
              const href = createPageUrl(tool.page) + (tool.tab ? `?tab=${tool.tab}` : "");
              return (
                <Link key={tool.name} to={href} onClick={() => setOpen(false)}>
                  <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all active:scale-95 cursor-pointer">
                    <div className={`w-10 h-10 ${tool.color} rounded-xl flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 text-center leading-tight line-clamp-2">{tool.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer link */}
          <Link to="/AIAgentsHub" onClick={() => setOpen(false)}>
            <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-slate-100 bg-slate-50 hover:bg-indigo-50 transition-colors">
              <span className="text-xs font-semibold text-indigo-600">View All AI Agents</span>
              <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
            </div>
          </Link>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`fixed bottom-20 lg:bottom-6 right-4 z-50 flex items-center gap-2 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${open ? "bg-slate-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
        title="AI Analysers"
      >
        {open ? <X className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        <span className="hidden sm:inline">{open ? "Close" : "AI Tools"}</span>
      </button>
    </>
  );
}