import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Calculator,
  FileText,
  Heart,
  Droplet,
  Pill,
  LineChart,
  BookOpen,
  Stethoscope,
  TestTube,
  Baby,
  Zap,
  Sparkles,
  Brain,
  AlertCircle,
  Settings,
  BookOpenCheck,
  UtensilsCrossed,
  GraduationCap,
  TrendingUp,
  Layers,
  FlaskConical,
  FileQuestion,
  ClipboardList,
  Shield,
  Beaker,
  Waves,
  Wind,
  Microscope,
  Info,
  GitBranch,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePatient } from "../components/PatientContext";
import QuickCalculations from "../components/QuickCalculations";
import QuickPatientEntry from "../components/QuickPatientEntry";
import OfflineDataManager from "../components/OfflineDataManager";
import { ChevronDown } from "lucide-react";

export default function Hub() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userPreferences } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_email: user.email });
      return prefs[0] || null;
    },
    enabled: !!user
  });

  const { data: selectedSpecialty } = useQuery({
    queryKey: ['selectedSpecialty', userPreferences?.selected_specialty_id],
    queryFn: async () => {
      if (!userPreferences?.selected_specialty_id) return null;
      const specialty = await base44.entities.Specialty.filter({ id: userPreferences.selected_specialty_id });
      return specialty[0] || null;
    },
    enabled: !!userPreferences?.selected_specialty_id
  });

  const quickAccessTools = [
    { name: "Schwartz GFR", icon: Activity, color: "bg-blue-600", page: "SchwartzGFR" },
    { name: "BP Percentiles", icon: Heart, color: "bg-red-600", page: "BPPercentiles" },
    { name: "Anthropometry", icon: Baby, color: "bg-green-600", page: "Anthropometry" },
    { name: "Dose Calculator", icon: Calculator, color: "bg-purple-600", page: "DoseCalculator" },
    { name: "RRT Assistant", icon: Droplet, color: "bg-cyan-600", page: "RRTAssistant" },
    { name: "Clinical Support", icon: Brain, color: "bg-indigo-600", page: "ClinicalSupport" },
    { name: "Diet Generator", icon: UtensilsCrossed, color: "bg-green-600", page: "DietGenerator" },
    { name: "Pediatrics Hub", icon: Baby, color: "bg-teal-600", page: "PediatricsHub" }
  ];

  const toolsNavigation = [
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
      title: "GFR Calculator",
      url: createPageUrl("SchwartzGFR"),
      icon: Activity,
    },
    {
      title: "BP Percentiles",
      url: createPageUrl("BPPercentiles"),
      icon: Heart,
    },
    {
      title: "Dose Calculator",
      url: createPageUrl("DoseCalculator"),
      icon: Pill,
    },
    {
      title: "RRT Assistant",
      url: createPageUrl("RRTAssistant"),
      icon: Droplet,
    },
    {
      title: "RRT Templates",
      url: createPageUrl("RRTTemplates"),
      icon: Layers,
    },
    {
      title: "Drug Database",
      url: createPageUrl("DrugCalculator"),
      icon: Pill,
    },
    {
      title: "Fluid Calculator",
      url: createPageUrl("FluidCalculator"),
      icon: Droplet,
    },
    {
      title: "Anthropometry",
      url: createPageUrl("Anthropometry"),
      icon: Baby,
    }
  ];

  const calculatorSections = {
    title: "Clinical Calculators",
    icon: Calculator,
    subsections: [
      {
        name: "Kidney Function & Assessment",
        icon: Activity,
        tools: [
          { name: "Schwartz GFR", icon: Activity, page: "SchwartzGFR", description: "Estimate GFR using height and creatinine" },
          { name: "CKiD GFR", icon: Calculator, page: "CKiDGFR", description: "More accurate GFR estimation" },
          { name: "AKI Staging", icon: AlertCircle, page: "AKIStager", description: "KDIGO AKI classification" },
          { name: "CKD Staging", icon: TrendingUp, page: "CKDStager", description: "Classify chronic kidney disease" },
          { name: "TRP & TmP/GFR", icon: TestTube, page: "TRPCalculator", description: "Tubular phosphate reabsorption" },
          { name: "FENa Calculator", icon: TestTube, page: "FENaCalculator", description: "Fractional excretion of sodium" },
          { name: "FEUrea Calculator", icon: Microscope, page: "FEUreaCalculator", description: "Fractional excretion of urea" },
          { name: "FEMg Calculator", icon: Beaker, page: "FEMgCalculator", description: "Fractional excretion of magnesium" },
          { name: "FEUA Calculator", icon: FlaskConical, page: "FEUACalculator", description: "Fractional excretion of uric acid" }
        ]
      },
      {
        name: "Fluid & Electrolytes",
        icon: Droplet,
        tools: [
          { name: "Sodium Calculator", icon: Droplet, page: "SodiumCalculator", description: "Dysnatremia management" },
          { name: "Potassium Calculator", icon: Zap, page: "PotassiumCalculator", description: "K+ disorder management" },
          { name: "Fluid Calculator", icon: Waves, page: "FluidCalculator", description: "IV fluid prescriptions" },
          { name: "Anion Gap", icon: Calculator, page: "AnionGap", description: "Acid-base analysis" },
          { name: "ABG Interpreter", icon: Wind, page: "ABGInterpreter", description: "Blood gas analysis" },
          { name: "Osmolar Gap", icon: Beaker, page: "OsmolarGap", description: "Toxicology screening" }
        ]
      },
      {
        name: "Clinical Assessment",
        icon: Stethoscope,
        tools: [
          { name: "BP Percentiles", icon: Heart, page: "BPPercentiles", description: "Pediatric BP charts" },
          { name: "Anthropometry", icon: Baby, page: "Anthropometry", description: "Growth & nutrition" },
          { name: "Proteinuria", icon: TestTube, page: "Proteinuria", description: "Protein assessment" },
          { name: "Stone Risk", icon: Shield, page: "StoneRisk", description: "Kidney stone evaluation" },
          { name: "RTA Classifier", icon: FlaskConical, page: "RTAClassifier", description: "Renal tubular acidosis" }
        ]
      },
      {
        name: "Dialysis & RRT",
        icon: Layers,
        tools: [
          { name: "RRT Assistant", icon: Droplet, page: "RRTAssistant", description: "HD & PD prescriptions" },
          { name: "Kt/V Calculator", icon: Calculator, page: "KtVCalculator", description: "Dialysis adequacy" },
          { name: "TTKG Calculator", icon: Beaker, page: "TTKGCalculator", description: "Transtubular K gradient" }
        ]
      },
      {
        name: "Drug Dosing & Risk Prediction",
        icon: Pill,
        tools: [
          { name: "Dose Calculator", icon: Calculator, page: "DoseCalculator", description: "Pediatric drug dosing with renal adjustments" },
          { name: "Drug Database", icon: Pill, page: "DrugCalculator", description: "50+ drugs with Indian formulations" },
          { name: "Prediction Tools", icon: LineChart, page: "PredictionTools", description: "IgAN, CKiD ESRD, SRNS risk scores" }
        ]
      }
    ]
  };

  const clinicalSupportSection = {
    title: "Clinical Decision Support",
    icon: Brain,
    description: "Evidence-based protocols with AI-powered pathways - 25+ scenarios",
    tools: [
      { name: "AI Diagnostic Assistant", icon: Brain, page: "ClinicalSupport", description: "Guided symptom entry with differential diagnosis" },
      { name: "Clinical Pathways", icon: GitBranch, page: "ClinicalSupport", description: "25+ evidence-based management protocols" },
      { name: "Clinical Guidelines", icon: BookOpen, page: "Guidelines", description: "KDIGO, IPNA, IAP, ISPD guidelines library" },
      { name: "Prediction Tools", icon: LineChart, page: "PredictionTools", description: "IgAN, CKiD, SRNS, transplant risk scores" }
    ]
  };

  const educationSection = {
    title: "Education & Learning",
    icon: GraduationCap,
    description: "Interactive learning modules and patient education",
    tools: [
      { name: "Teaching Hub", icon: GraduationCap, page: "TeachingHub", description: "Interactive learning modules with AI teacher" },
      { name: "AI Assistant", icon: Sparkles, page: "AIAssistant", description: "AI clinical decision support" },
      { name: "Patient Education", icon: BookOpenCheck, page: "PatientEducation", description: "Patient resources" },
      { name: "Diagnostic Questionnaire", icon: FileQuestion, page: "DiagnosticQuestionnaire", description: "Interactive diagnostic reasoning" }
    ]
  };

  const modesSection = [
    { name: "Clinic Mode", icon: Users, page: "ClinicManagement", description: "Patient records, visits & clinical workflow", color: "bg-purple-600" },
    { name: "Research Mode", icon: Layers, page: "ResearchHub", description: "REDCap-style research platform with AI analysis", color: "bg-indigo-600" }
  ];

  const resourcesSection = {
    title: "Clinical Resources & Tools",
    icon: FileText,
    description: "Templates, monitoring, drug reference, and custom tools",
    tools: [
      { name: "Patient History", icon: FileText, page: "PatientHistory", description: "Search all patient records" },
      { name: "Content Manager", icon: FileText, page: "UserContentManager", description: "Upload guidelines, create templates & scenarios" },
      { name: "Drug Database", icon: Pill, page: "DrugCalculator", description: "50+ drugs with Indian formulations" },
      { name: "Monitoring Templates", icon: ClipboardList, page: "MonitoringHub", description: "8+ clinical monitoring charts" },
      { name: "Diet Generator (CKD/NS/IAP)", icon: UtensilsCrossed, page: "DietGenerator", description: "IPNA/KDIGO/IAP diet plans for nephrotic, CKD & healthy children" },
      { name: "Pediatrics Hub (IAP)", icon: Baby, page: "PediatricsHub", description: "Growth monitoring, IAP vaccination schedule, ICMR nutrition guidelines" },
      { name: "Reference Ranges", icon: FileText, page: "ReferenceRanges", description: "Lab normal values" },
      { name: "Audit Logs", icon: FileText, page: "AuditLogs", description: "Calculation history & tracking" }
    ]
  };

  const [openSections, setOpenSections] = React.useState({});

  const toggleSection = (sectionName) => {
    setOpenSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Navigation Tabs */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex gap-2">
            <Link to={createPageUrl("Hub")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Calculator className="w-4 h-4 mr-2" />
                Calc View
              </Button>
            </Link>
            <Link to={createPageUrl("ClinicDashboard")}>
              <Button variant="outline" className="hover:bg-purple-50">
                <Users className="w-4 h-4 mr-2" />
                Clinic Mode
              </Button>
            </Link>
            <Link to={createPageUrl("ResearchHub")}>
              <Button variant="outline" className="hover:bg-indigo-50">
                <Layers className="w-4 h-4 mr-2" />
                Research Mode
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Header with Branding */}
        <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">CliniCals Hub</h1>
                <p className="text-blue-100 text-lg">by Swarnim - Pediatric Nephrology Clinical Decision Support</p>
              </div>
              {selectedSpecialty && (
                <Badge className="bg-white/20 backdrop-blur text-white text-sm px-4 py-2 border border-white/30">
                  {selectedSpecialty.name}
                </Badge>
              )}
            </div>
            <div className="h-1 w-32 bg-white/40 rounded-full"></div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Offline Status */}
        <OfflineDataManager />

        {/* Quick Patient Entry */}
        <QuickPatientEntry />
        
        {/* Quick Calculations */}
        <QuickCalculations />

        {/* Separator with gradient */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Clinical Tools
            </span>
          </div>
        </div>

        {/* Quick Access Tools */}
        <Card className="bg-white shadow-xl border-2 border-blue-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              Quick Access Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickAccessTools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Link key={tool.name} to={createPageUrl(tool.page)}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-400 hover:scale-105 group">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className={`w-14 h-14 ${tool.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                          <IconComponent className="w-7 h-7 text-white" />
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

        {/* Separator */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-slate-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Comprehensive Calculators
            </span>
          </div>
        </div>

        {/* Calculator Section with Collapsible Subsections */}
        <Card className="bg-white shadow-lg border-2 border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl mb-1">
                  <Calculator className="w-6 h-6 text-blue-600" />
                  {calculatorSections.title}
                </CardTitle>
                <p className="text-sm text-slate-600">Comprehensive pediatric nephrology calculation tools</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 text-sm">
                {calculatorSections.subsections.reduce((sum, sub) => sum + sub.tools.length, 0)} Tools
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {calculatorSections.subsections.map((subsection) => {
              const SubsectionIcon = subsection.icon;
              const isOpen = openSections[subsection.name];
              
              return (
                <Collapsible key={subsection.name} open={isOpen} onOpenChange={() => toggleSection(subsection.name)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between hover:bg-blue-50 p-4 h-auto"
                    >
                      <div className="flex items-center gap-3">
                        <SubsectionIcon className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-slate-900">{subsection.name}</span>
                        <Badge variant="outline" className="text-xs">{subsection.tools.length}</Badge>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                      {subsection.tools.map((tool) => {
                        const ToolIcon = tool.icon;
                        return (
                          <Link key={tool.name} to={createPageUrl(tool.page)}>
                            <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-blue-400 group">
                              <CardContent className="p-3">
                                <div className="flex items-start gap-2">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                                    <ToolIcon className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm text-slate-900 mb-0.5">{tool.name}</h3>
                                    <p className="text-xs text-slate-600 line-clamp-2">{tool.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>

        {/* Separator before Clinical Support */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-slate-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Decision Support & Education
            </span>
          </div>
        </div>

        {/* Clinical Decision Support Section - Collapsible */}
        <Card className="bg-white shadow-lg border-2 border-slate-200">
          <Collapsible open={openSections['clinical-support']} onOpenChange={() => toggleSection('clinical-support')}>
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b p-0">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between hover:bg-blue-50 p-4 h-auto rounded-none">
                  <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <div className="font-semibold text-lg">{clinicalSupportSection.title}</div>
                      <p className="text-xs text-slate-600">{clinicalSupportSection.description}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 text-xs ml-auto mr-2">
                      {clinicalSupportSection.tools.length}
                    </Badge>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections['clinical-support'] ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {clinicalSupportSection.tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <Link key={tool.name} to={createPageUrl(tool.page)}>
                        <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-blue-400 group">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                                <ToolIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-slate-900 mb-0.5">{tool.name}</h3>
                                <p className="text-xs text-slate-600 line-clamp-2">{tool.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Education Section - Collapsible */}
        <Card className="bg-white shadow-lg border-2 border-slate-200">
          <Collapsible open={openSections['education']} onOpenChange={() => toggleSection('education')}>
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b p-0">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between hover:bg-blue-50 p-4 h-auto rounded-none">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <div className="font-semibold text-lg">{educationSection.title}</div>
                      <p className="text-xs text-slate-600">{educationSection.description}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 text-xs ml-auto mr-2">
                      {educationSection.tools.length}
                    </Badge>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections['education'] ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {educationSection.tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <Link key={tool.name} to={createPageUrl(tool.page)}>
                        <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-blue-400 group">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                                <ToolIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-slate-900 mb-0.5">{tool.name}</h3>
                                <p className="text-xs text-slate-600 line-clamp-2">{tool.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Resources Section - Collapsible */}
        <Card className="bg-white shadow-lg border-2 border-slate-200">
          <Collapsible open={openSections['resources']} onOpenChange={() => toggleSection('resources')}>
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b p-0">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between hover:bg-blue-50 p-4 h-auto rounded-none">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <div className="font-semibold text-lg">{resourcesSection.title}</div>
                      <p className="text-xs text-slate-600">{resourcesSection.description}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 text-xs ml-auto mr-2">
                      {resourcesSection.tools.length}
                    </Badge>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections['resources'] ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {resourcesSection.tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <Link key={tool.name} to={createPageUrl(tool.page)}>
                        <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-blue-400 group">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                                <ToolIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-slate-900 mb-0.5">{tool.name}</h3>
                                <p className="text-xs text-slate-600 line-clamp-2">{tool.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6">
          <Info className="w-6 h-6 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong className="text-lg block mb-2">CliniCals by Swarnim - Evidence-Based Clinical Practice</strong>
            <p className="leading-relaxed">Comprehensive pediatric nephrology clinical decision support system integrating KDIGO, IPNA, ISPD, IAP, ESPN, ISKDC, and WHO guidelines. AI-powered extraction, structured summaries, sequential algorithms, and bedside pearls for rapid clinical decision-making.</p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}