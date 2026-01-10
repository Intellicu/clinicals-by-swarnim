import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, Heart, Droplet, Pill, TestTube, Calculator, Brain, Sparkles,
  AlertCircle, TrendingUp, Shield, Beaker, Microscope, Baby, Search, ArrowLeft, Layers, FlaskConical, Wind, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClinicalToolsHub() {
  const [searchQuery, setSearchQuery] = useState("");

  const toolCategories = {
    diagnostic: {
      title: "🧠 Diagnostic Decision Tools",
      icon: Brain,
      color: "bg-blue-50 border-blue-200",
      tools: [
        { name: "AKI Staging Tool", page: "AKIStager", icon: AlertCircle, description: "KDIGO 2023 staging based on Cr & UO", tags: ["AKI", "Critical"] },
        { name: "CKD Staging (G-A Grid)", page: "CKDStager", icon: TrendingUp, description: "eGFR + Albuminuria classification", tags: ["CKD", "Essential"] },
        { name: "Schwartz eGFR", page: "SchwartzGFR", icon: Activity, description: "Bedside eGFR calculator", tags: ["GFR", "Essential"] },
        { name: "CKiD GFR", page: "CKiDGFR", icon: Calculator, description: "Enhanced eGFR (age 1-25y)", tags: ["GFR", "Advanced"] },
        { name: "RTA Classifier", page: "RTAClassifier", icon: FlaskConical, description: "Type I, II, or IV RTA", tags: ["RTA", "Electrolytes"] },
        { name: "Anion Gap Calculator", page: "AnionGap", icon: Calculator, description: "AG, Delta Gap, mixed disorders", tags: ["Acid-Base", "Essential"] },
        { name: "ABG Interpreter", page: "ABGInterpreter", icon: Wind, description: "Blood gas analysis", tags: ["Acid-Base"] },
        { name: "Proteinuria Quantifier", page: "Proteinuria", icon: TestTube, description: "ACR/UPCR interpretation", tags: ["Proteinuria", "Essential"] },
        { name: "Stone Risk Index", page: "StoneRisk", icon: Shield, description: "Urinary metabolic evaluation", tags: ["Stones"] }
      ]
    },
    kidneyFunction: {
      title: "🧪 Kidney Function Tests",
      icon: TestTube,
      color: "bg-green-50 border-green-200",
      tools: [
        { name: "FENa Calculator", page: "FENaCalculator", icon: Beaker, description: "Fractional excretion of sodium", tags: ["AKI", "Essential"] },
        { name: "FEUrea Calculator", page: "FEUreaCalculator", icon: Microscope, description: "Fractional excretion of urea", tags: ["AKI"] },
        { name: "FEMg Calculator", page: "FEMgCalculator", icon: Beaker, description: "Fractional excretion of magnesium", tags: ["Tubulopathy"] },
        { name: "FEUA Calculator", page: "FEUACalculator", icon: FlaskConical, description: "Fractional excretion of uric acid", tags: ["Tubulopathy"] },
        { name: "TRP & TmP/GFR", page: "TRPCalculator", icon: TestTube, description: "Tubular phosphate reabsorption", tags: ["Tubulopathy", "Rickets"] },
        { name: "TTKG Calculator", page: "TTKGCalculator", icon: Calculator, description: "Transtubular K gradient", tags: ["K+"] }
      ]
    },
    cardiovascular: {
      title: "❤️ Cardiovascular & BP",
      icon: Heart,
      color: "bg-red-50 border-red-200",
      tools: [
        { name: "BP Percentiles", page: "BPPercentiles", icon: Heart, description: "Age-sex-height adjusted BP", tags: ["HTN", "Essential"] },
        { name: "Hypertensive Emergency", page: "HypertensiveEmergency", icon: AlertCircle, description: "IV antihypertensive dosing", tags: ["HTN", "Emergency"] }
      ]
    },
    fluidElectrolytes: {
      title: "💧 Fluid & Electrolyte Management",
      icon: Droplet,
      color: "bg-cyan-50 border-cyan-200",
      tools: [
        { name: "Fluid Calculator", page: "FluidCalculator", icon: Droplet, description: "Maintenance & deficit fluids", tags: ["Fluids", "Essential"] },
        { name: "Sodium Calculator", page: "SodiumCalculator", icon: Zap, description: "Hypo/hypernatremia management", tags: ["Na+", "Essential"] },
        { name: "Potassium Calculator", page: "PotassiumCalculator", icon: Zap, description: "K+ replacement & hyperK protocol", tags: ["K+", "Essential"] },
        { name: "Osmolar Gap", page: "OsmolarGap", icon: Calculator, description: "Toxin screening tool", tags: ["Toxicology"] }
      ]
    },
    drugDosing: {
      title: "💊 Drug Dosing & Safety",
      icon: Pill,
      color: "bg-purple-50 border-purple-200",
      tools: [
        { name: "Drug Database", page: "DrugCalculator", icon: Pill, description: "100+ drugs with renal dosing", tags: ["Drugs", "Essential"] },
        { name: "Dose Calculator", page: "DoseCalculator", icon: Calculator, description: "Weight & BSA-based dosing", tags: ["Drugs", "Essential"] }
      ]
    },
    dialysis: {
      title: "🔄 Dialysis & RRT",
      icon: Layers,
      color: "bg-indigo-50 border-indigo-200",
      tools: [
        { name: "RRT Assistant", page: "RRTAssistant", icon: Droplet, description: "HD & PD prescriptions", tags: ["Dialysis", "Essential"] },
        { name: "RRT Templates", page: "RRTTemplates", icon: Layers, description: "Saved dialysis protocols", tags: ["Dialysis"] },
        { name: "Kt/V Calculator", page: "KtVCalculator", icon: Calculator, description: "Dialysis adequacy", tags: ["Dialysis"] }
      ]
    },
    growth: {
      title: "👶 Growth & Anthropometry",
      icon: Baby,
      color: "bg-pink-50 border-pink-200",
      tools: [
        { name: "Anthropometry", page: "Anthropometry", icon: Baby, description: "Growth charts & nutrition", tags: ["Growth", "Essential"] }
      ]
    },
    prediction: {
      title: "📈 Risk Prediction & Prognosis",
      icon: TrendingUp,
      color: "bg-amber-50 border-amber-200",
      tools: [
        { name: "Prediction Tools", page: "PredictionTools", icon: TrendingUp, description: "IgAN, CKiD ESRD, SRNS scores", tags: ["Prognosis"] }
      ]
    }
  };

  const allTools = Object.values(toolCategories).flatMap(cat => 
    cat.tools.map(tool => ({ ...tool, category: cat.title }))
  );

  const filteredTools = searchQuery
    ? allTools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Calculator className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Clinical Decision Tools</h1>
                <p className="text-blue-100 text-lg">Comprehensive Pediatric Nephrology Calculators & Protocols</p>
              </div>
            </div>
            <Badge className="bg-white/20 backdrop-blur text-white border-white/30">
              Evidence-Based • KDIGO • IPNA • ISPN • AAP • IAP Guidelines
            </Badge>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <Card className="bg-white shadow-lg border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools by name, description, or tags (e.g., 'AKI', 'GFR', 'HTN', 'K+')..."
                className="pl-12 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {filteredTools ? (
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle>Search Results ({filteredTools.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.name} to={createPageUrl(tool.page)}>
                      <Card className="h-full hover:shadow-xl transition-all duration-200 cursor-pointer border-2 hover:border-blue-400 group">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <Icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 mb-1">{tool.name}</h3>
                              <p className="text-xs text-slate-500">{tool.category}</p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{tool.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {tool.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="diagnostic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
              <TabsTrigger value="kidney">Kidney Fx</TabsTrigger>
              <TabsTrigger value="cardio">BP/Cardio</TabsTrigger>
              <TabsTrigger value="fluids">Fluids/Lytes</TabsTrigger>
              <TabsTrigger value="drugs">Drugs</TabsTrigger>
              <TabsTrigger value="dialysis">Dialysis</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
              <TabsTrigger value="prediction">Risk/Pred</TabsTrigger>
            </TabsList>

            {Object.entries(toolCategories).map(([key, category]) => (
              <TabsContent key={key} value={key}>
                <Card className={`shadow-lg border-2 ${category.color}`}>
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <category.icon className="w-6 h-6" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <Link key={tool.name} to={createPageUrl(tool.page)}>
                            <Card className="h-full hover:shadow-xl transition-all duration-200 cursor-pointer border-2 hover:border-blue-400 group">
                              <CardContent className="p-5">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <Icon className="w-6 h-6 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1">{tool.name}</h3>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-600 mb-3">{tool.description}</p>
                                <div className="flex flex-wrap gap-1">
                                  {tool.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Evidence-Based Clinical Practice</h3>
                <p className="text-sm text-slate-700 leading-relaxed mb-2">
                  All calculators and decision tools are based on the latest international guidelines including:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-600">KDIGO 2023-2025</Badge>
                  <Badge className="bg-indigo-600">IPNA 2022-2023</Badge>
                  <Badge className="bg-purple-600">ISPN 2023</Badge>
                  <Badge className="bg-pink-600">AAP 2017-2024</Badge>
                  <Badge className="bg-red-600">IAP 2024</Badge>
                  <Badge className="bg-amber-600">ESPN 2023-2024</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-3 italic">
                  ⚠️ These tools are for clinical decision support. Always exercise independent clinical judgment and verify calculations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}