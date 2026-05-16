import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TestTube, Activity, BarChart2, Microscope, Brain, Dna, Beaker, Layers } from "lucide-react";
import LabReportAnalyzer from "../clinical-ai/LabReportAnalyzer";
import UDSAnalyzer from "../clinical-ai/UDSAnalyzer";
import UroflowAIAnalyzer from "../urology/UroflowAIAnalyzer";
import UDSInterpreter from "../urology/UDSInterpreter";
import BiopsyAnalyzer from "../clinical-ai/BiopsyAnalyzer";
import ClinicalCaseAnalyzer from "../clinical-ai/ClinicalCaseAnalyzer";

const TABS = [
  { value: "lab", label: "Lab Report", icon: TestTube },
  { value: "urine", label: "Urine / UDS", icon: Microscope },
  { value: "uroflow", label: "Uroflow", icon: Activity },
  { value: "urodynamics", label: "Urodynamics", icon: BarChart2 },
  { value: "biopsy", label: "Biopsy AI", icon: Layers },
  { value: "case", label: "Case AI", icon: Brain },
];

export default function HubAILabAnalyzer() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-green-700 to-emerald-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6" />
          <div>
            <h2 className="text-base font-bold">AI Analysers</h2>
            <p className="text-green-100 text-xs">Lab · Urine · Uroflow · Urodynamics · Biopsy · Clinical Case — AI-powered</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="lab">
        <TabsList className="flex w-full h-auto bg-white border p-1 overflow-x-auto gap-0.5" style={{ scrollbarWidth: "none" }}>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <TabsTrigger key={t.value} value={t.value} className="text-xs flex-shrink-0 gap-1 px-2.5 py-1.5">
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="lab" className="mt-3"><LabReportAnalyzer /></TabsContent>
        <TabsContent value="urine" className="mt-3"><UDSAnalyzer /></TabsContent>
        <TabsContent value="uroflow" className="mt-3"><UroflowAIAnalyzer /></TabsContent>
        <TabsContent value="urodynamics" className="mt-3"><UDSInterpreter /></TabsContent>
        <TabsContent value="biopsy" className="mt-3"><BiopsyAnalyzer /></TabsContent>
        <TabsContent value="case" className="mt-3"><ClinicalCaseAnalyzer /></TabsContent>
      </Tabs>
    </div>
  );
}