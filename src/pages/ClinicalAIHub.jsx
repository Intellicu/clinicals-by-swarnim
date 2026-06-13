import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeartPulse, Dna } from 'lucide-react';
import BiopsyAnalyzer from '../components/clinical-ai/BiopsyAnalyzer';
import RadiologyAnalyzer from '../components/clinical-ai/RadiologyAnalyzer';
import LabReportAnalyzer from '../components/clinical-ai/LabReportAnalyzer';
import ClinicalCaseAnalyzer from '../components/clinical-ai/ClinicalCaseAnalyzer';
import UDSAnalyzer from '../components/clinical-ai/UDSAnalyzer';
import { CLINICAL_AI_ANALYZERS } from '@/lib/aiAnalyzers';

// ECG placeholder (no standalone component yet)
function ECGAnalyzerPlaceholder() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
      <HeartPulse className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-slate-800 mb-2">ECG Analyzer</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto">
        Pediatric ECG interpretation including electrolyte effects, arrhythmia screening, and QTc calculation. Coming soon — use Differential Dx for now.
      </p>
    </div>
  );
}

// Genetics placeholder — redirects to GeneticReportAnalyzer
function GeneticsRedirect() {
  const navigate = useNavigate();
  React.useEffect(() => { navigate('/GeneticReportAnalyzer', { replace: true }); }, [navigate]);
  return <div className="p-8 text-center text-slate-400 text-sm">Redirecting to Genetics AI…</div>;
}

// Tab value → component map
const TAB_COMPONENTS = {
  uds: <UDSAnalyzer />,
  biopsy: <BiopsyAnalyzer />,
  radiology: <RadiologyAnalyzer />,
  labs: <LabReportAnalyzer />,
  case: <ClinicalCaseAnalyzer />,
  ecg: <ECGAnalyzerPlaceholder />,
  genetics: <GeneticsRedirect />,
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
            {['Advanced LLM', 'Image Recognition', 'Evidence-Based'].map(tag => (
              <span key={tag} className="bg-white/20 text-white text-[11px] px-2.5 py-1 rounded-lg font-medium">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <Tabs defaultValue={defaultTab} className="w-full">
          {/* Tab bar — scrollable, uses CLINICAL_AI_ANALYZERS as source of truth */}
          <TabsList className="flex w-full h-auto overflow-x-auto bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
            {CLINICAL_AI_ANALYZERS.filter(a => a.tab).map(tool => {
              const Icon = tool.icon;
              return (
                <TabsTrigger
                  key={tool.id}
                  value={tool.tab}
                  className="flex flex-col items-center gap-1 py-2 px-2.5 flex-shrink-0 rounded-lg text-slate-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-indigo-50 min-w-[64px]"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-semibold leading-tight text-center">
                    {tool.name.replace(' Analyzer', '').replace(' AI', '').replace('Renal Biopsy', 'Biopsy').replace('Case Discussion', 'Case').replace('Differential Diagnosis', 'DDx').replace('Urine / UDS', 'Urine')}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab content */}
          <div className="mt-4">
            {CLINICAL_AI_ANALYZERS.filter(a => a.tab).map(tool => (
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