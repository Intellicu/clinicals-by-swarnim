import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TestTube, Activity, BarChart2, Microscope } from "lucide-react";
import LabReportAnalyzer from "../clinical-ai/LabReportAnalyzer";
import UDSAnalyzer from "../clinical-ai/UDSAnalyzer";
import UroflowAIAnalyzer from "../urology/UroflowAIAnalyzer";
import UDSInterpreter from "../urology/UDSInterpreter";

export default function HubAILabAnalyzer() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-green-700 to-emerald-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <TestTube className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">AI Lab Analyzer</h2>
            <p className="text-green-100 text-sm">Lab Reports · Urine Analysis · Uroflowmetry · Urodynamics — AI-powered interpretation</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="lab">
        <TabsList className="flex w-full h-auto bg-white border overflow-x-auto p-1">
          <TabsTrigger value="lab" className="text-xs flex-shrink-0 gap-1">
            <TestTube className="w-3.5 h-3.5" /> Lab Report
          </TabsTrigger>
          <TabsTrigger value="urine" className="text-xs flex-shrink-0 gap-1">
            <Microscope className="w-3.5 h-3.5" /> Urine / UDS
          </TabsTrigger>
          <TabsTrigger value="uroflow" className="text-xs flex-shrink-0 gap-1">
            <Activity className="w-3.5 h-3.5" /> Uroflowmetry
          </TabsTrigger>
          <TabsTrigger value="urodynamics" className="text-xs flex-shrink-0 gap-1">
            <BarChart2 className="w-3.5 h-3.5" /> Urodynamics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lab" className="mt-3">
          <LabReportAnalyzer />
        </TabsContent>
        <TabsContent value="urine" className="mt-3">
          <UDSAnalyzer />
        </TabsContent>
        <TabsContent value="uroflow" className="mt-3">
          <UroflowAIAnalyzer />
        </TabsContent>
        <TabsContent value="urodynamics" className="mt-3">
          <UDSInterpreter />
        </TabsContent>
      </Tabs>
    </div>
  );
}