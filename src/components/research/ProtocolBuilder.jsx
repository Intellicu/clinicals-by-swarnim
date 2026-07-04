import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ProtocolBuilder() {
  const [protocolData, setProtocolData] = useState({
    studyTitle: '',
    researchQuestion: '',
    population: '',
    intervention: '',
    comparator: '',
    outcome: ''
  });
  const [generatedProtocol, setGeneratedProtocol] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert clinical researcher. Generate a comprehensive research protocol based on this PICO framework.
        
        Study Title: ${protocolData.studyTitle}
        Research Question: ${protocolData.researchQuestion}
        Population: ${protocolData.population}
        Intervention: ${protocolData.intervention}
        Comparator: ${protocolData.comparator}
        Outcome: ${protocolData.outcome}
        
        Generate a structured research protocol with:
        1. Background and Rationale
        2. Study Objectives (Primary and Secondary)
        3. Study Design and Methodology
        4. Inclusion/Exclusion Criteria
        5. Sample Size Calculation
        6. Data Collection Plan
        7. Statistical Analysis Plan
        8. Timeline and Milestones
        9. Ethical Considerations
        10. References to relevant guidelines`,
        response_json_schema: {
          type: "object",
          properties: {
            background: { type: "string" },
            objectives: {
              type: "object",
              properties: {
                primary: { type: "string" },
                secondary: { type: "array", items: { type: "string" } }
              }
            },
            study_design: { type: "string" },
            inclusion_criteria: { type: "array", items: { type: "string" } },
            exclusion_criteria: { type: "array", items: { type: "string" } },
            sample_size: { type: "string" },
            data_collection: { type: "array", items: { type: "string" } },
            statistical_plan: { type: "string" },
            timeline: { type: "array", items: { type: "string" } },
            ethical_considerations: { type: "array", items: { type: "string" } }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setGeneratedProtocol(data);
      toast.success('Protocol generated!');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Protocol Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Study Title</label>
            <Input
              value={protocolData.studyTitle}
              onChange={(e) => setProtocolData({...protocolData, studyTitle: e.target.value})}
              placeholder="Enter study title..."
            />
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Research Question</label>
            <Textarea
              value={protocolData.researchQuestion}
              onChange={(e) => setProtocolData({...protocolData, researchQuestion: e.target.value})}
              placeholder="What is the main research question?"
              rows={2}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Population</label>
              <Input
                value={protocolData.population}
                onChange={(e) => setProtocolData({...protocolData, population: e.target.value})}
                placeholder="e.g., Children with CKD stage 3-4"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Intervention</label>
              <Input
                value={protocolData.intervention}
                onChange={(e) => setProtocolData({...protocolData, intervention: e.target.value})}
                placeholder="e.g., Dietary protein restriction"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Comparator</label>
              <Input
                value={protocolData.comparator}
                onChange={(e) => setProtocolData({...protocolData, comparator: e.target.value})}
                placeholder="e.g., Standard diet"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Outcome</label>
              <Input
                value={protocolData.outcome}
                onChange={(e) => setProtocolData({...protocolData, outcome: e.target.value})}
                placeholder="e.g., eGFR decline rate"
              />
            </div>
          </div>

          <Button 
            onClick={() => generateMutation.mutate()}
            disabled={!protocolData.studyTitle || generateMutation.isPending}
            className="w-full bg-purple-600"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Protocol...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Research Protocol
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedProtocol && (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Protocol</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold mb-2">Background</h4>
              <p className="text-sm text-slate-700">{generatedProtocol.background}</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold mb-2">Objectives</h4>
              <p className="text-sm mb-2"><strong>Primary:</strong> {generatedProtocol.objectives?.primary}</p>
              {Array.isArray(generatedProtocol.objectives?.secondary) && generatedProtocol.objectives.secondary.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-1">Secondary:</p>
                  <ul className="space-y-1">
                    {generatedProtocol.objectives.secondary.map((obj, idx) => (
                      <li key={idx} className="text-sm text-slate-700">• {obj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold mb-2">Study Design</h4>
              <p className="text-sm text-slate-700">{generatedProtocol.study_design}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold mb-2">Inclusion Criteria</h4>
                <ul className="space-y-1">
                  {Array.isArray(generatedProtocol.inclusion_criteria) && generatedProtocol.inclusion_criteria.map((criteria, idx) => (
                    <li key={idx} className="text-sm text-slate-700">✓ {criteria}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold mb-2">Exclusion Criteria</h4>
                <ul className="space-y-1">
                  {Array.isArray(generatedProtocol.exclusion_criteria) && generatedProtocol.exclusion_criteria.map((criteria, idx) => (
                    <li key={idx} className="text-sm text-slate-700">✗ {criteria}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold mb-2">Sample Size</h4>
              <p className="text-sm text-slate-700">{generatedProtocol.sample_size}</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold mb-2">Statistical Analysis</h4>
              <p className="text-sm text-slate-700">{generatedProtocol.statistical_plan}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}