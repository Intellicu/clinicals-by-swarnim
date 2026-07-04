import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dna, AlertTriangle, FlaskConical, Search, BookOpen, Network, Activity, Brain, Database, Users } from "lucide-react";
import RapidScreening from "../components/rare-disease/RapidScreening";
import DiseaseClusters from "../components/rare-disease/DiseaseClusters";
import SymptomBasedApproach from "../components/rare-disease/SymptomBasedApproach";
import RareDiseasePathways from "../components/rare-disease/RareDiseasePathways";
import GeneticTestingDBS from "../components/rare-disease/GeneticTestingDBS";
import NPRDNetwork from "../components/rare-disease/NPRDNetwork";
import MonitoringSurveillance from "../components/rare-disease/MonitoringSurveillance";
import AILabRareAnalyzers from "../components/rare-disease/AILabRareAnalyzers";
import RegistryResearch from "../components/rare-disease/RegistryResearch";
import FamilyEducation from "../components/rare-disease/FamilyEducation";
import OtherDiseaseScreeningTools from "../components/rare-disease/OtherDiseaseScreeningTools";
import RareDiagnosticChecklist from "../components/rare-disease/RareDiagnosticChecklist";

const TABS = [
  { value: "screening",   label: "Rapid Screening",       icon: Search,       short: "Screen" },
  { value: "checklist",   label: "Diagnostic Checklist",  icon: FlaskConical, short: "Checklist" },
  { value: "disease_screens", label: "Disease Screens",   icon: FlaskConical, short: "Screens" },
  { value: "clusters",    label: "Disease Clusters",       icon: Dna,          short: "Clusters" },
  { value: "symptoms",    label: "Symptom Approach",       icon: AlertTriangle, short: "Symptoms" },
  { value: "pathways",    label: "Pathways",               icon: BookOpen,     short: "Pathways" },
  { value: "genetics",    label: "Genetics & DBS",         icon: FlaskConical, short: "Genetics" },
  { value: "nprd",        label: "NPRD & CoE",             icon: Network,      short: "NPRD" },
  { value: "monitoring",  label: "Monitoring",             icon: Activity,     short: "Monitor" },
  { value: "analyzers",   label: "AI Lab Analyzers",       icon: Brain,        short: "AI Labs" },
  { value: "registry",    label: "Registry & Research",    icon: Database,     short: "Registry" },
  { value: "education",   label: "Family Education",       icon: Users,        short: "Education" },
];

export default function RareDiseaseModule() {
  const [activeTab, setActiveTab] = useState("screening");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-3 md:p-6">

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 p-5 md:p-8 shadow-xl mb-5">
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Dna className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Rare Disease Module</h1>
                    <p className="text-violet-200 text-sm">Rare Disease Module by Swarnim · Pediatric Rare Kidney & Genetic Disorders</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-white/20 text-xs">aHUS · Cystinosis · Fabry · ARPKD</Badge>
                  <Badge className="bg-white/20 text-xs">Alport · NPHP · PH1 · Genetic NS</Badge>
                  <Badge className="bg-green-400/80 text-xs">NPRD Guidelines 2024</Badge>
                  <Badge className="bg-white/20 text-xs">⚠️ Learning Tool · Clinician Discretion Advised</Badge>
                  {isAdmin && <Badge className="bg-amber-400/80 text-xs">Admin Mode</Badge>}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Mobile: 2-row scrollable */}
          <div className="overflow-x-auto pb-1 mb-4">
            <TabsList className="inline-flex h-auto gap-1 bg-white border border-violet-200 rounded-xl p-1 shadow-sm min-w-full md:grid md:grid-cols-12">
              {TABS.map(t => {
                const Icon = t.icon;
                return (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="flex flex-col items-center gap-0.5 px-2 py-2 text-xs rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white min-w-[60px]"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline leading-tight text-center">{t.short}</span>
                    <span className="md:hidden leading-tight text-center">{t.short}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="screening"><RapidScreening isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="checklist"><RareDiagnosticChecklist /></TabsContent>
          <TabsContent value="disease_screens"><OtherDiseaseScreeningTools isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="clusters"><DiseaseClusters isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="symptoms"><SymptomBasedApproach isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="pathways"><RareDiseasePathways isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="genetics"><GeneticTestingDBS isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="nprd"><NPRDNetwork isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="monitoring"><MonitoringSurveillance isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="analyzers"><AILabRareAnalyzers isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="registry"><RegistryResearch isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="education"><FamilyEducation isAdmin={isAdmin} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}