import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Microscope, ScanLine, TestTube, Stethoscope, Brain, Sparkles, Droplet
} from 'lucide-react';
import BiopsyAnalyzer from '../components/clinical-ai/BiopsyAnalyzer';
import RadiologyAnalyzer from '../components/clinical-ai/RadiologyAnalyzer';
import LabReportAnalyzer from '../components/clinical-ai/LabReportAnalyzer';
import ClinicalCaseAnalyzer from '../components/clinical-ai/ClinicalCaseAnalyzer';
import UDSAnalyzer from '../components/clinical-ai/UDSAnalyzer';

export default function ClinicalAIHub() {
  const urlParams = new URLSearchParams(window.location.search);
  const defaultTab = urlParams.get('tab') || 'uds';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Clinical AI Agents Hub</h1>
              <p className="text-purple-100 mt-1">AI-powered diagnostic analysis and clinical decision support</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-1 text-sm">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Advanced LLM Analysis
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-1 text-sm">
              Image Recognition
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-1 text-sm">
              Evidence-Based
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="flex w-full h-auto overflow-x-auto">
            <TabsTrigger value="uds" className="flex flex-col items-center gap-1 py-3 flex-shrink-0">
              <Droplet className="w-5 h-5" />
              <span className="text-xs">Urine Analyzer</span>
            </TabsTrigger>
            <TabsTrigger value="biopsy" className="flex flex-col items-center gap-1 py-3 flex-shrink-0">
              <Microscope className="w-5 h-5" />
              <span className="text-xs">Renal Biopsy</span>
            </TabsTrigger>
            <TabsTrigger value="radiology" className="flex flex-col items-center gap-1 py-3 flex-shrink-0">
              <ScanLine className="w-5 h-5" />
              <span className="text-xs">Radiology</span>
            </TabsTrigger>
            <TabsTrigger value="labs" className="flex flex-col items-center gap-1 py-3 flex-shrink-0">
              <TestTube className="w-5 h-5" />
              <span className="text-xs">Lab Reports</span>
            </TabsTrigger>
            <TabsTrigger value="case" className="flex flex-col items-center gap-1 py-3 flex-shrink-0">
              <Stethoscope className="w-5 h-5" />
              <span className="text-xs">Case Analysis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uds" className="mt-6">
            <UDSAnalyzer />
          </TabsContent>

          <TabsContent value="biopsy" className="mt-6">
            <BiopsyAnalyzer />
          </TabsContent>

          <TabsContent value="radiology" className="mt-6">
            <RadiologyAnalyzer />
          </TabsContent>

          <TabsContent value="labs" className="mt-6">
            <LabReportAnalyzer />
          </TabsContent>

          <TabsContent value="case" className="mt-6">
            <ClinicalCaseAnalyzer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}