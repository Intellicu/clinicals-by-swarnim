import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Sparkles, Save, Edit, FileText, Download, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EnhancedProtocolBuilder() {
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [protocolData, setProtocolData] = useState({
    studyTitle: '',
    researchQuestion: '',
    population: '',
    intervention: '',
    comparator: '',
    outcome: '',
    // ICMR-specific fields
    rationale: '',
    hypothesis: '',
    study_design: '',
    study_duration: '',
    inclusion_criteria: [],
    exclusion_criteria: [],
    sample_size_calculation: {
      effect_size: '',
      power: '80%',
      alpha: '0.05',
      expected_dropout: '10%',
      calculation_method: '',
      final_sample_size: ''
    },
    primary_outcomes: [],
    secondary_outcomes: [],
    methodology: {
      recruitment_strategy: '',
      randomization: '',
      blinding: '',
      data_collection: ''
    },
    statistical_analysis: {
      primary_analysis: '',
      secondary_analysis: '',
      software: ''
    },
    ethical_considerations: {
      informed_consent: '',
      risks_benefits: '',
      data_privacy: '',
      ethics_committee: ''
    },
    budget: {
      personnel: '',
      equipment: '',
      consumables: '',
      miscellaneous: '',
      total: ''
    },
    timeline: [],
    references: []
  });

  const queryClient = useQueryClient();

  const { data: savedProtocols = [] } = useQuery({
    queryKey: ['saved-protocols'],
    queryFn: async () => {
      const protocols = await base44.entities.ResearchKnowledgeBase.filter({
        type: 'Study_Protocol'
      });
      return protocols;
    }
  });

  const saveProtocolMutation = useMutation({
    mutationFn: async (data) => {
      if (editingProtocol) {
        return base44.entities.ResearchKnowledgeBase.update(editingProtocol.id, {
          title: data.studyTitle,
          content: data,
          category: 'Research Protocol',
          tags: ['protocol', data.study_design || 'observational']
        });
      } else {
        return base44.entities.ResearchKnowledgeBase.create({
          title: data.studyTitle,
          type: 'Study_Protocol',
          content: data,
          category: 'Research Protocol',
          tags: ['protocol', data.study_design || 'observational'],
          created_by: (await base44.auth.me()).email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-protocols'] });
      toast.success(editingProtocol ? 'Protocol updated!' : 'Protocol saved!');
      setEditingProtocol(null);
    }
  });

  const generateWithAIMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert clinical researcher familiar with ICMR grant protocols. Generate a comprehensive research protocol following ICMR standards.
        
        Study Title: ${protocolData.studyTitle}
        Research Question: ${protocolData.researchQuestion}
        Population: ${protocolData.population}
        Intervention: ${protocolData.intervention}
        Comparator: ${protocolData.comparator}
        Outcome: ${protocolData.outcome}
        
        Generate exhaustive details for:
        1. Scientific rationale and hypothesis
        2. Study design justification
        3. Detailed sample size calculation (with formula, effect size, power, alpha)
        4. Comprehensive inclusion/exclusion criteria
        5. Primary and secondary outcomes (with measurement tools)
        6. Detailed methodology (recruitment, randomization, blinding, data collection)
        7. Statistical analysis plan (primary and secondary analyses)
        8. Ethical considerations (informed consent, risk-benefit, privacy)
        9. Budget breakdown
        10. Realistic timeline with milestones`,
        response_json_schema: {
          type: "object",
          properties: {
            rationale: { type: "string" },
            hypothesis: { type: "string" },
            study_design: { type: "string" },
            inclusion_criteria: { type: "array", items: { type: "string" } },
            exclusion_criteria: { type: "array", items: { type: "string" } },
            sample_size_calculation: {
              type: "object",
              properties: {
                effect_size: { type: "string" },
                calculation_method: { type: "string" },
                final_sample_size: { type: "string" }
              }
            },
            primary_outcomes: { type: "array", items: { type: "string" } },
            secondary_outcomes: { type: "array", items: { type: "string" } },
            methodology: {
              type: "object",
              properties: {
                recruitment_strategy: { type: "string" },
                randomization: { type: "string" },
                blinding: { type: "string" },
                data_collection: { type: "string" }
              }
            },
            statistical_analysis: {
              type: "object",
              properties: {
                primary_analysis: { type: "string" },
                secondary_analysis: { type: "string" }
              }
            },
            timeline: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setProtocolData({
        ...protocolData,
        ...data
      });
      toast.success('Protocol details generated!');
    }
  });

  const loadProtocol = (protocol) => {
    setEditingProtocol(protocol);
    setProtocolData(protocol.content || {});
  };

  return (
    <div className="space-y-6">
      {/* Saved Protocols */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Saved Protocols
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              setEditingProtocol(null);
              setProtocolData({
                studyTitle: '',
                researchQuestion: '',
                population: '',
                intervention: '',
                comparator: '',
                outcome: '',
                sample_size_calculation: { power: '80%', alpha: '0.05', expected_dropout: '10%' }
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Protocol
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {savedProtocols.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-4">No saved protocols yet</p>
          ) : (
            <div className="space-y-2">
              {savedProtocols.map(protocol => (
                <div key={protocol.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                  <div>
                    <h4 className="font-semibold">{protocol.title}</h4>
                    <p className="text-xs text-slate-600">{protocol.content?.study_design || 'No design'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => loadProtocol(protocol)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Protocol Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            {editingProtocol ? 'Edit Protocol' : 'ICMR-Standard Protocol Builder'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic">
            <TabsList className="flex w-full h-auto overflow-x-auto p-1">
              <TabsTrigger value="basic" className="flex-shrink-0">Basic Info</TabsTrigger>
              <TabsTrigger value="design" className="flex-shrink-0">Design</TabsTrigger>
              <TabsTrigger value="sample" className="flex-shrink-0">Sample Size</TabsTrigger>
              <TabsTrigger value="outcomes" className="flex-shrink-0">Outcomes</TabsTrigger>
              <TabsTrigger value="methodology" className="flex-shrink-0">Methodology</TabsTrigger>
              <TabsTrigger value="ethics" className="flex-shrink-0">Ethics & Budget</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <Input
                placeholder="Study Title"
                value={protocolData.studyTitle}
                onChange={(e) => setProtocolData({...protocolData, studyTitle: e.target.value})}
              />
              <Textarea
                placeholder="Research Question"
                value={protocolData.researchQuestion}
                onChange={(e) => setProtocolData({...protocolData, researchQuestion: e.target.value})}
                rows={2}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Population" value={protocolData.population} onChange={(e) => setProtocolData({...protocolData, population: e.target.value})} />
                <Input placeholder="Intervention" value={protocolData.intervention} onChange={(e) => setProtocolData({...protocolData, intervention: e.target.value})} />
                <Input placeholder="Comparator" value={protocolData.comparator} onChange={(e) => setProtocolData({...protocolData, comparator: e.target.value})} />
                <Input placeholder="Primary Outcome" value={protocolData.outcome} onChange={(e) => setProtocolData({...protocolData, outcome: e.target.value})} />
              </div>
              <Textarea placeholder="Scientific Rationale" value={protocolData.rationale} onChange={(e) => setProtocolData({...protocolData, rationale: e.target.value})} rows={4} />
              <Textarea placeholder="Study Hypothesis" value={protocolData.hypothesis} onChange={(e) => setProtocolData({...protocolData, hypothesis: e.target.value})} rows={2} />
            </TabsContent>

            <TabsContent value="design" className="space-y-4 mt-4">
              <Input placeholder="Study Design (e.g., RCT, Cohort)" value={protocolData.study_design} onChange={(e) => setProtocolData({...protocolData, study_design: e.target.value})} />
              <Input placeholder="Study Duration" value={protocolData.study_duration} onChange={(e) => setProtocolData({...protocolData, study_duration: e.target.value})} />
            </TabsContent>

            <TabsContent value="sample" className="space-y-4 mt-4">
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-bold mb-2">Sample Size Calculation</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Expected Effect Size" value={protocolData.sample_size_calculation?.effect_size} onChange={(e) => setProtocolData({...protocolData, sample_size_calculation: {...protocolData.sample_size_calculation, effect_size: e.target.value}})} />
                  <Input placeholder="Statistical Power" value={protocolData.sample_size_calculation?.power} onChange={(e) => setProtocolData({...protocolData, sample_size_calculation: {...protocolData.sample_size_calculation, power: e.target.value}})} />
                  <Input placeholder="Alpha Level" value={protocolData.sample_size_calculation?.alpha} onChange={(e) => setProtocolData({...protocolData, sample_size_calculation: {...protocolData.sample_size_calculation, alpha: e.target.value}})} />
                  <Input placeholder="Expected Dropout" value={protocolData.sample_size_calculation?.expected_dropout} onChange={(e) => setProtocolData({...protocolData, sample_size_calculation: {...protocolData.sample_size_calculation, expected_dropout: e.target.value}})} />
                </div>
                <Textarea className="mt-3" placeholder="Calculation Method & Formula" value={protocolData.sample_size_calculation?.calculation_method} onChange={(e) => setProtocolData({...protocolData, sample_size_calculation: {...protocolData.sample_size_calculation, calculation_method: e.target.value}})} rows={3} />
                <Input className="mt-3" placeholder="Final Sample Size" value={protocolData.sample_size_calculation?.final_sample_size} onChange={(e) => setProtocolData({...protocolData, sample_size_calculation: {...protocolData.sample_size_calculation, final_sample_size: e.target.value}})} />
              </div>
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-4 mt-4">
              <div>
                <label className="font-semibold mb-2 block">Primary Outcomes</label>
                <Textarea placeholder="List primary outcomes with measurement tools" rows={3} />
              </div>
              <div>
                <label className="font-semibold mb-2 block">Secondary Outcomes</label>
                <Textarea placeholder="List secondary outcomes" rows={3} />
              </div>
            </TabsContent>

            <TabsContent value="methodology" className="space-y-4 mt-4">
              <Textarea placeholder="Recruitment Strategy" value={protocolData.methodology?.recruitment_strategy} onChange={(e) => setProtocolData({...protocolData, methodology: {...protocolData.methodology, recruitment_strategy: e.target.value}})} rows={2} />
              <Textarea placeholder="Randomization Method" value={protocolData.methodology?.randomization} onChange={(e) => setProtocolData({...protocolData, methodology: {...protocolData.methodology, randomization: e.target.value}})} rows={2} />
              <Textarea placeholder="Blinding Procedures" value={protocolData.methodology?.blinding} onChange={(e) => setProtocolData({...protocolData, methodology: {...protocolData.methodology, blinding: e.target.value}})} rows={2} />
              <Textarea placeholder="Data Collection Procedures" value={protocolData.methodology?.data_collection} onChange={(e) => setProtocolData({...protocolData, methodology: {...protocolData.methodology, data_collection: e.target.value}})} rows={3} />
            </TabsContent>

            <TabsContent value="ethics" className="space-y-4 mt-4">
              <div>
                <h4 className="font-bold mb-2">Ethical Considerations</h4>
                <Textarea placeholder="Informed Consent Process" rows={2} />
                <Textarea className="mt-2" placeholder="Risk-Benefit Analysis" rows={2} />
                <Textarea className="mt-2" placeholder="Data Privacy & Confidentiality" rows={2} />
              </div>
              <div>
                <h4 className="font-bold mb-2">Budget (INR)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Personnel" />
                  <Input placeholder="Equipment" />
                  <Input placeholder="Consumables" />
                  <Input placeholder="Miscellaneous" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-6">
            <Button onClick={() => generateWithAIMutation.mutate()} disabled={!protocolData.studyTitle || generateWithAIMutation.isPending} className="flex-1 bg-purple-600">
              {generateWithAIMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              AI Generate Details
            </Button>
            <Button onClick={() => saveProtocolMutation.mutate(protocolData)} disabled={!protocolData.studyTitle} variant="outline" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {editingProtocol ? 'Update' : 'Save'} Protocol
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}