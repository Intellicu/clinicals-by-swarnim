import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bot, Microscope, Brain, Zap, TestTube, Activity, Dna, Stethoscope,
  FlaskConical, Beaker, Wind, Baby, UtensilsCrossed, Heart, ChevronRight,
  Layers, AlertCircle, Search, FileText, Sparkles, MessageSquare, Camera
} from "lucide-react";

// ─── ALL Clinical AI Agents in one place ─────────────────────────────────────
const ALL_AI_AGENTS = [
  // Nephrology AI
  {
    id: "biopsy",
    name: "Renal Biopsy AI Analyzer",
    desc: "Interpret biopsy slides: FSGS, MCD, MPGN, IgAN, lupus nephritis patterns",
    icon: Microscope,
    color: "bg-violet-700",
    badge: "Nephrology",
    badgeColor: "bg-violet-100 text-violet-800",
    page: "ClinicalAIHub",
    tab: "biopsy",
    tags: ["biopsy", "histology", "nephrology"],
  },
  {
    id: "lab-nephro",
    name: "Nephrology Lab Analyzer",
    desc: "Structured interpretation of renal function, urinalysis, complement, ANA, ANCA panels",
    icon: FlaskConical,
    color: "bg-blue-700",
    badge: "Nephrology",
    badgeColor: "bg-blue-100 text-blue-800",
    page: "ClinicalAIHub",
    tab: "labs",
    tags: ["labs", "nephrology", "urine"],
  },
  {
    id: "radiology",
    name: "Radiology AI Analyzer",
    desc: "Renal ultrasound, DMSA scan, VCUG, chest X-ray, CT interpretation with structured output",
    icon: Activity,
    color: "bg-indigo-700",
    badge: "Radiology",
    badgeColor: "bg-indigo-100 text-indigo-800",
    page: "ClinicalAIHub",
    tab: "radiology",
    tags: ["radiology", "ultrasound", "imaging"],
  },
  {
    id: "uds",
    name: "Urine & UDS AI Analyzer",
    desc: "Urodynamic study interpretation, urine dipstick, microscopy, spot protein:creatinine",
    icon: TestTube,
    color: "bg-teal-700",
    badge: "Urology",
    badgeColor: "bg-teal-100 text-teal-800",
    page: "ClinicalAIHub",
    tab: "uds",
    tags: ["uds", "urine", "urodynamics"],
  },
  {
    id: "uroflow",
    name: "Uroflow AI Analyzer",
    desc: "Uroflowmetry curve analysis — bell-shaped, plateau, staccato, interrupted patterns",
    icon: Activity,
    color: "bg-cyan-700",
    badge: "Urology",
    badgeColor: "bg-cyan-100 text-cyan-800",
    page: "UrologyNephrologyHub",
    tab: "uroflow",
    tags: ["uroflow", "bladder", "urology"],
  },
  {
    id: "case",
    name: "Clinical Case AI Analyzer",
    desc: "Full case analysis with differential diagnosis, management plan, and evidence-based reasoning",
    icon: Stethoscope,
    color: "bg-emerald-700",
    badge: "Clinical",
    badgeColor: "bg-emerald-100 text-emerald-800",
    page: "ClinicalAIHub",
    tab: "case",
    tags: ["case", "differential", "diagnosis"],
  },
  // Genetics & Rare
  {
    id: "genetic",
    name: "Genetic Report Analyzer",
    desc: "Interpret WES/WGS/gene panel reports — pathogenic variants, VUS classification, counseling",
    icon: Dna,
    color: "bg-violet-600",
    badge: "Genetics",
    badgeColor: "bg-violet-100 text-violet-800",
    page: "GeneticReportAnalyzer",
    tags: ["genetics", "WES", "variant"],
  },
  // General Pediatrics AI
  {
    id: "cbc-analyzer",
    name: "CBC Analyzer (Pediatric)",
    desc: "Complete blood count interpretation: anaemia types, leukocytosis patterns, thrombocytopenia",
    icon: Microscope,
    color: "bg-rose-600",
    badge: "General Peds",
    badgeColor: "bg-rose-100 text-rose-800",
    page: "ClinicalAIHub",
    tab: "labs",
    tags: ["CBC", "anaemia", "blood"],
  },
  {
    id: "abg-ai",
    name: "ABG Interpreter AI",
    desc: "Systematic blood gas analysis: primary disorder, compensation, anion gap, MUDPILES",
    icon: Wind,
    color: "bg-red-600",
    badge: "Critical Care",
    badgeColor: "bg-red-100 text-red-800",
    page: "ABGInterpreter",
    tags: ["ABG", "acid-base", "ICU"],
  },
  {
    id: "sepsis-ai",
    name: "Sepsis Risk Analyzer",
    desc: "SIRS/Sepsis/Septic Shock scoring, Phoenix Sepsis Score, antibiotic guidance",
    icon: AlertCircle,
    color: "bg-orange-700",
    badge: "Emergency",
    badgeColor: "bg-orange-100 text-orange-800",
    page: "ClinicalAIHub",
    tags: ["sepsis", "Phoenix", "ICU"],
  },
  {
    id: "growth-ai",
    name: "Growth Failure Analyzer",
    desc: "Z-score interpretation, FTT approach, SAM/MAM classification, IAP growth charts",
    icon: Baby,
    color: "bg-green-600",
    badge: "Nutrition",
    badgeColor: "bg-green-100 text-green-800",
    page: "ClinicalAIHub",
    tags: ["growth", "FTT", "malnutrition"],
  },
  {
    id: "nutrition-ai",
    name: "Nutrition Analyzer",
    desc: "Nutritional requirements, deficit calculation, enteral/parenteral prescription, MUAC",
    icon: UtensilsCrossed,
    color: "bg-amber-600",
    badge: "Nutrition",
    badgeColor: "bg-amber-100 text-amber-800",
    page: "NutritionHub",
    tags: ["nutrition", "TPN", "enteral"],
  },
  {
    id: "dka-ai",
    name: "DKA Analyzer",
    desc: "DKA severity, fluid calculation, insulin protocol, electrolyte replacement, cerebral oedema risk",
    icon: Zap,
    color: "bg-yellow-700",
    badge: "Endocrine",
    badgeColor: "bg-yellow-100 text-yellow-800",
    page: "ClinicalAIHub",
    tags: ["DKA", "diabetes", "insulin"],
  },
  {
    id: "dehydration-ai",
    name: "Dehydration Analyzer",
    desc: "Dehydration scoring (WHO/IMCI), ORS plan A/B/C, IV fluid calculation, monitoring",
    icon: Beaker,
    color: "bg-sky-600",
    badge: "General Peds",
    badgeColor: "bg-sky-100 text-sky-800",
    page: "ClinicalAIHub",
    tags: ["dehydration", "ORS", "fluids"],
  },
  // AI Prescriber & Decision
  {
    id: "ai-prescriber",
    name: "AI Prescriber",
    desc: "Smart prescription builder with drug dosing, interactions, renal adjustment, and PDF output",
    icon: Sparkles,
    color: "bg-indigo-600",
    badge: "Prescriber",
    badgeColor: "bg-indigo-100 text-indigo-800",
    page: "AIPrescriber",
    tags: ["prescriber", "drug", "dose"],
  },
  {
    id: "differential",
    name: "Differential Diagnosis Engine",
    desc: "AI-powered differential with clinical reasoning, red flags, and pathway links",
    icon: Brain,
    color: "bg-purple-600",
    badge: "Diagnosis",
    badgeColor: "bg-purple-100 text-purple-800",
    page: "DifferentialEngine",
    tags: ["differential", "diagnosis", "AI"],
  },
  {
    id: "ai-pathway",
    name: "AI Clinical Pathway Builder",
    desc: "Generate custom clinical pathways from guidelines or web search",
    icon: Layers,
    color: "bg-slate-700",
    badge: "Builder",
    badgeColor: "bg-slate-100 text-slate-700",
    page: "AIClinicalPathway",
    tags: ["pathway", "builder", "AI"],
  },
];

const CATEGORIES = [
  { id: "all", label: "All AI Tools" },
  { id: "nephrology", label: "Nephrology" },
  { id: "general", label: "General Peds" },
  { id: "emergency", label: "Emergency / ICU" },
  { id: "prescriber", label: "Prescriber" },
  { id: "radiology", label: "Imaging & Lab" },
];

const CATEGORY_TAGS = {
  nephrology: ["biopsy", "histology", "nephrology", "urine", "urodynamics", "uds", "uroflow", "bladder", "urology", "labs"],
  general: ["CBC", "anaemia", "blood", "growth", "FTT", "malnutrition", "nutrition", "TPN", "dehydration", "ORS"],
  emergency: ["ABG", "acid-base", "ICU", "sepsis", "Phoenix", "DKA", "diabetes", "insulin", "fluids"],
  prescriber: ["prescriber", "drug", "dose", "differential", "diagnosis", "pathway", "builder"],
  radiology: ["radiology", "ultrasound", "imaging", "labs", "nephrology", "urine", "genetics", "WES", "variant", "case"],
};

export default function ConsolidatedAIHub() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = ALL_AI_AGENTS.filter(agent => {
    const matchesSearch = !search || agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.desc.toLowerCase().includes(search.toLowerCase()) ||
      agent.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === "all" || (CATEGORY_TAGS[category] || []).some(t => agent.tags.includes(t));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-violet-600 rounded-xl shadow text-white">
        <Bot className="w-6 h-6 flex-shrink-0" />
        <div>
          <h2 className="font-bold text-sm">Clinical AI Agents Hub</h2>
          <p className="text-violet-200 text-xs">{ALL_AI_AGENTS.length} AI tools — Nephrology · General Peds · Genetics · Emergency · Prescriber</p>
        </div>
        <Badge className="ml-auto bg-yellow-400 text-yellow-900 text-xs border-0">All in One</Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search AI tools (e.g. biopsy, CBC, DKA, ABG…)"
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${category === cat.id ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}>
            {cat.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">{filtered.length} tools</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(agent => {
          const Icon = agent.icon;
          const href = createPageUrl(agent.page) + (agent.tab ? `?tab=${agent.tab}` : "");
          return (
            <Link key={agent.id} to={href}>
              <Card className="border border-violet-100 hover:border-violet-400 hover:shadow-md transition-all active:scale-[0.98] h-full">
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={`w-11 h-11 ${agent.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-bold text-sm text-slate-900 leading-snug">{agent.name}</p>
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    </div>
                    <Badge className={`${agent.badgeColor} text-xs border-0 mt-0.5 mb-1`}>{agent.badge}</Badge>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{agent.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No AI tools match your search</p>
        </div>
      )}
    </div>
  );
}