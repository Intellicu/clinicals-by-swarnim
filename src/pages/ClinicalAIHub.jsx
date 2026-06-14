import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BiopsyAnalyzer from '../components/clinical-ai/BiopsyAnalyzer';
import RadiologyAnalyzer from '../components/clinical-ai/RadiologyAnalyzer';
import LabReportAnalyzer from '../components/clinical-ai/LabReportAnalyzer';
import ClinicalCaseAnalyzer from '../components/clinical-ai/ClinicalCaseAnalyzer';
import UDSAnalyzer from '../components/clinical-ai/UDSAnalyzer';
import UroflowAnalyzer from '../components/clinical-ai/UroflowAnalyzer';
import ECGAnalyzer from '../components/clinical-ai/ECGAnalyzer';
import GeneticReportAnalyzerInline from '../components/clinical-ai/GeneticReportAnalyzerInline';
import { CLINICAL_AI_ANALYZERS } from '@/lib/aiAnalyzers';

// Tab value → component map — single source of truth
const TAB_COMPONENTS = {
  uds: <UDSAnalyzer />,
  uroflow: <UroflowAnalyzer />,
  biopsy: <BiopsyAnalyzer />,
  radiology: <RadiologyAnalyzer />,
  labs: <LabReportAnalyzer />,
  case: <ClinicalCaseAnalyzer />,
  ecg: <ECGAnalyzer />,
  genetics: <GeneticReportAnalyzerInline />,
};

export default function ClinicalAIHub() {
  const urlParams = new URLSearchParams(window.location.search);
  const defaultTab = urlParams.get('tab') || 'uds';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-4 py-5 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">Clinical AI Center</h1>
          <p className="text-purple-200 text-xs mt-0.5">AI-powered diagnostic analysis · Evidence-based · Pediatric-focused</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {['Advanced LLM', 'Image Recognition', 'Evidence-Based', 'Educational Mode'].map(tag => (
              <span key={tag} className="bg-white/20 text-white text-[11px] px-2.5 py-1 rounded-lg font-medium">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Global disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-3 flex items-start gap-2">
          <span className="text-amber-600 text-base flex-shrink-0">⚠️</span>
          <p className="text-xs text-amber-800">
            <strong>Clinical Decision Support Only.</strong> All AI analyzers use advanced LLM models (Claude Sonnet).
            Results are for educational and decision-support purposes — always correlate with clinical findings and seek specialist review.
            Not a substitute for professional clinical judgment.
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          {/* Tab bar — uses CLINICAL_AI_ANALYZERS as single source of truth */}
          <TabsList className="flex w-full h-auto overflow-x-auto bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
            {CLINICAL_AI_ANALYZERS.filter(a => a.tab && a.page === 'ClinicalAIHub').map(tool => {
              const Icon = tool.icon;
              const shortName = tool.name
                .replace(' Analyzer', '').replace(' AI', '').replace('Renal Biopsy', 'Biopsy')
                .replace('Case Discussion', 'Case').replace('Urine / UDS', 'Urine').replace('Uroflowmetry', 'Uroflow');
              return (
                <TabsTrigger
                  key={tool.id}
                  value={tool.tab}
                  className="flex flex-col items-center gap-1 py-2 px-2.5 flex-shrink-0 rounded-lg text-slate-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 min-w-[60px]"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-semibold leading-tight text-center">{shortName}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab content */}
          <div className="mt-4">
            {CLINICAL_AI_ANALYZERS.filter(a => a.tab && a.page === 'ClinicalAIHub').map(tool => (
              <TabsContent key={tool.id} value={tool.tab}>
                {TAB_COMPONENTS[tool.tab] || (
                  <div className="text-center py-16 text-slate-400 text-sm">Coming soon</div>
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}