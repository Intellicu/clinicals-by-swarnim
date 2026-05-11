import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity, Calculator, FileText, Heart, Droplet, Pill, BookOpen,
  Stethoscope, TestTube, Baby, Zap, Sparkles, Brain, AlertCircle,
  UtensilsCrossed, GraduationCap, Layers, FlaskConical, ClipboardList,
  Beaker, Wind, Waves, Microscope, GitBranch, Users, Dna, ChevronRight,
  RefreshCw, Shield, Info, BarChart2, Search, Star, Clock,
  Database, TrendingUp, LineChart
} from "lucide-react";
import QuickPatientEntry from "../components/QuickPatientEntry";
import QuickCalculations from "../components/QuickCalculations";
import { useOnlineStatus } from "../components/OfflineDataManager";
import GlobalSearch from "../components/GlobalSearch";
import { Input } from "@/components/ui/input";

// ── Quick-access sections (reference-first, no clinic/EMR/queue content) ──
const QUICK_TOOLS = [
  { name: "Schwartz GFR", icon: Activity, color: "bg-blue-600", page: "SchwartzGFR" },
  { name: "BP Percentiles", icon: Heart, color: "bg-red-600", page: "BPPercentiles" },
  { name: "Anthropometry", icon: Baby, color: "bg-green-600", page: "Anthropometry" },
  { name: "Guidelines", icon: BookOpen, color: "bg-blue-700", page: "Guidelines" },
  { name: "Emergency Hub", icon: AlertCircle, color: "bg-red-700", page: "EmergencyHub" },
  { name: "Drugs & Dosing", icon: Pill, color: "bg-purple-600", page: "DrugsDosing" },
  { name: "RRT Assistant", icon: Droplet, color: "bg-cyan-600", page: "RRTAssistant" },
  { name: "Clinical Support", icon: Brain, color: "bg-indigo-600", page: "ClinicalSupport" },
  { name: "Diet Generator", icon: UtensilsCrossed, color: "bg-green-600", page: "DietGenerator" },
  { name: "General Pediatrics", icon: Baby, color: "bg-teal-600", page: "PediatricsHub" },
  { name: "AI Lab Analyzer", icon: Microscope, color: "bg-rose-600", page: "ClinicalAIHub" },
  { name: "Genetic Agent", icon: Dna, color: "bg-violet-600", page: "GeneticReportAnalyzer" },
  { name: "Research Methods", icon: Layers, color: "bg-rose-700", page: "ResearchMethodsHub" },
  { name: "Clinical Approaches", icon: Stethoscope, color: "bg-cyan-700", page: "ClinicalApproaches" },
  { name: "Lab Pathways", icon: FlaskConical, color: "bg-amber-700", page: "LabPathways" },
  { name: "Admit Orders", icon: ClipboardList, color: "bg-indigo-700", page: "AdmissionOrders" },
  { name: "Differential Dx", icon: Brain, color: "bg-violet-700", page: "DifferentialEngine" },
  { name: "Case Library", icon: BookOpen, color: "bg-emerald-700", page: "CaseLibrary" },
  { name: "Discharge Summary", icon: FileText, color: "bg-slate-700", page: "DischargeSummary" },
  { name: "Research OS", icon: Layers, color: "bg-indigo-700", page: "ResearchOS" },
  { name: "Nutrition Hub", icon: UtensilsCrossed, color: "bg-teal-700", page: "NutritionHub" },
  { name: "Rheumatology", icon: Stethoscope, color: "bg-violet-600", page: "PediatricRheumatology" },
];

const KNOWLEDGE_SECTIONS = [
  {
    title: "Pediatric Nephrology",
    icon: Droplet,
    color: "border-blue-200 bg-blue-50",
    iconColor: "text-blue-600",
    items: [
      { name: "GN & Glomerular Diseases", page: "GlomerularDiseases", icon: Microscope },
      { name: "Nephrology Pathways (50+)", page: "ClinicalSupport", icon: GitBranch },
      { name: "AKI & Dialysis", page: "RRTAssistant", icon: Activity },
      { name: "CKD Management", page: "CKDStager", icon: TrendingUp },
      { name: "Tubular Disorders", page: "ClinicalApproaches", icon: TestTube },
      { name: "Hypertension", page: "BPPercentiles", icon: Heart },
    ]
  },
  {
    title: "Pediatric Rheumatology",
    icon: Heart,
    color: "border-rose-200 bg-rose-50",
    iconColor: "text-rose-600",
    items: [
      { name: "Rheumatology Hub", page: "PediatricRheumatology", icon: Stethoscope },
      { name: "JIA, SLE, Vasculitis", page: "PediatricRheumatology", icon: Shield },
      { name: "Immunology Labs", page: "LabPathways", icon: FlaskConical },
      { name: "Scoring Tools (JADAS, SLEDAI)", page: "CalculatorsHub", icon: BarChart2 },
    ]
  },
  {
    title: "Emergency Protocols",
    icon: AlertCircle,
    color: "border-red-200 bg-red-50",
    iconColor: "text-red-600",
    items: [
      { name: "Hyperkalemia", page: "EmergencyHub", icon: Zap },
      { name: "Hypertensive Emergency", page: "EmergencyHub", icon: Heart },
      { name: "MAS / TLS", page: "EmergencyHub", icon: AlertCircle },
      { name: "Differential Engine", page: "DifferentialEngine", icon: Brain },
    ]
  },
  {
    title: "Calculators Engine",
    icon: Calculator,
    color: "border-cyan-200 bg-cyan-50",
    iconColor: "text-cyan-600",
    items: [
      { name: "Schwartz GFR", page: "SchwartzGFR", icon: Activity },
      { name: "BP Percentiles", page: "BPPercentiles", icon: Heart },
      { name: "ABG Interpreter", page: "ABGInterpreter", icon: Wind },
      { name: "All Calculators →", page: "CalculatorsHub", icon: Calculator },
    ]
  },
  {
    title: "Drugs & Biologics",
    icon: Pill,
    color: "border-purple-200 bg-purple-50",
    iconColor: "text-purple-600",
    items: [
      { name: "Drug Database & Dosing", page: "DrugsDosing", icon: Pill },
      { name: "AI Prescriber", page: "AIPrescriber", icon: Sparkles },
      { name: "Drug Calculator", page: "DrugCalculator", icon: Calculator },
      { name: "Prediction Tools", page: "PredictionTools", icon: LineChart },
    ]
  },
  {
    title: "Evidence & Education",
    icon: BookOpen,
    color: "border-green-200 bg-green-50",
    iconColor: "text-green-600",
    items: [
      { name: "Guidelines Library", page: "Guidelines", icon: BookOpen },
      { name: "Clinical OS", page: "ClinicalOS", icon: Brain },
      { name: "Teaching Hub", page: "TeachingHub", icon: GraduationCap },
      { name: "Case Library", page: "CaseLibrary", icon: Database },
    ]
  },
  {
    title: "Research Platform",
    icon: Layers,
    color: "border-teal-200 bg-teal-50",
    iconColor: "text-teal-600",
    items: [
      { name: "Research Hub", page: "ResearchHub", icon: Layers },
      { name: "Research OS", page: "ResearchOS", icon: Database },
      { name: "Research Methods", page: "ResearchMethodsHub", icon: FileText },
      { name: "Nutrition Hub", page: "NutritionHub", icon: UtensilsCrossed },
    ]
  },
  {
    title: "General Pediatrics",
    icon: Baby,
    color: "border-amber-200 bg-amber-50",
    iconColor: "text-amber-600",
    items: [
      { name: "Pediatrics Hub", page: "PediatricsHub", icon: Baby },
      { name: "Growth & Anthropometry", page: "Anthropometry", icon: BarChart2 },
      { name: "Vaccination", page: "PediatricsHub", icon: Shield },
      { name: "Genetic Analyzer", page: "GeneticReportAnalyzer", icon: Dna },
    ]
  },
];

export default function Hub() {
  const isOnline = useOnlineStatus();
  const [search, setSearch] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === "admin";

  // Filter sections by search
  const filteredSections = search.trim()
    ? KNOWLEDGE_SECTIONS.map(s => ({
        ...s,
        items: s.items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
      })).filter(s => s.items.length > 0)
    : KNOWLEDGE_SECTIONS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-x-hidden">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 md:p-8 shadow-xl">
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">CliniCals Hub</h1>
                <p className="text-blue-100 text-sm md:text-base">Pediatric Nephrology & Rheumatology Intelligence Platform</p>
                <p className="text-blue-200 text-xs mt-1">by Swarnim</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${isOnline ? "bg-green-400/20 text-green-100" : "bg-amber-400/20 text-amber-100"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-300" : "bg-amber-300"}`} />
                  {isOnline ? "Online" : "Offline"}
                </span>
                {isAdmin && (
                  <Link to={createPageUrl("ClinicDashboard")}>
                    <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 border text-xs h-7">
                      <Users className="w-3 h-3 mr-1" />
                      Clinic Mode
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            className="pl-9 bg-white shadow-sm border-slate-200 text-sm"
            placeholder="Search pathways, drugs, calculators, guidelines…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ── Quick Patient Entry ── */}
        {!search && <QuickPatientEntry />}

        {/* ── Quick Calculations ── */}
        {!search && <QuickCalculations />}

        {/* ── Quick Access Tools ── */}
        {!search && (
          <Card className="bg-white shadow-xl border-2 border-blue-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 px-6 py-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              <h2 className="font-bold text-lg text-slate-900">Quick Access Tools</h2>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {QUICK_TOOLS.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.name} to={createPageUrl(tool.page)}>
                      <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-400 hover:scale-105 group">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                          <div className={`w-14 h-14 ${tool.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{tool.name}</span>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Knowledge Base Sections ── */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {search ? `Search results for "${search}"` : "Knowledge Base"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredSections.map(section => {
              const SectionIcon = section.icon;
              return (
                <Card key={section.title} className={`border-2 ${section.color} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <SectionIcon className={`w-4 h-4 ${section.iconColor}`} />
                      <h3 className={`font-bold text-sm text-slate-800`}>{section.title}</h3>
                    </div>
                    <div className="space-y-1">
                      {section.items.map(item => {
                        const ItemIcon = item.icon;
                        return (
                          <Link key={item.name} to={createPageUrl(item.page)}>
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                              <ItemIcon className={`w-3.5 h-3.5 ${section.iconColor} flex-shrink-0`} />
                              <span className="text-xs text-slate-600 group-hover:text-slate-900 flex-1">{item.name}</span>
                              <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-xs">
            <strong>CliniCals by Swarnim</strong> — Evidence-based pediatric clinical decision support. Integrates KDIGO, IPNA, ISPD, IAP, ESPN guidelines. For educational & informational purposes. Always exercise independent clinical judgment.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}