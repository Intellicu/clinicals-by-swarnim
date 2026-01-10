import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, GitBranch, Trash2, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PathwayGenerator({ selectedGuidelines = [], onRemoveGuideline }) {
  const [generating, setGenerating] = useState(false);
  const [pathway, setPathway] = useState(null);

  const generatePathway = async () => {
    if (selectedGuidelines.length === 0) {
      toast.error('Add at least one guideline to generate pathway');
      return;
    }

    setGenerating(true);
    try {
      const guidelinesContext = selectedGuidelines.map(g => 
        `${g.title} (${g.source} ${g.year}): ${g.scope_and_population || g.summary}`
      ).join('\n\n');

      const prompt = `Create a comprehensive clinical pathway from these guidelines:

${guidelinesContext}

Generate a patient journey pathway with:
1. Initial Presentation & Assessment
2. Diagnostic Decision Points (with criteria)
3. Management Branches (based on severity/findings)
4. Intervention Options (specific treatments)
5. Monitoring & Follow-up
6. Expected Outcomes & Timelines

Format as visual pathway with nodes and decision branches. Include specific thresholds and criteria at each decision point.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            pathway_title: { type: 'string' },
            patient_population: { type: 'string' },
            nodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  criteria: { type: 'array', items: { type: 'string' } },
                  branches: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        condition: { type: 'string' },
                        next_node: { type: 'string' }
                      }
                    }
                  }
                }
              }
            },
            expected_outcomes: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setPathway(response);
      toast.success('Pathway generated!');
    } catch (error) {
      console.error('Pathway generation error:', error);
      toast.error('Failed to generate pathway');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-purple-50 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-600" />
          AI Pathway Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50/50 min-h-[150px]">
          <p className="text-sm text-purple-700 mb-3">
            📌 Drag guidelines here or select from list ({selectedGuidelines.length} selected)
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedGuidelines.map((g) => (
              <Badge key={g.id} className="bg-purple-600 text-white flex items-center gap-1">
                {g.title.substring(0, 30)}...
                <button onClick={() => onRemoveGuideline(g.id)}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={generatePathway}
          disabled={generating || selectedGuidelines.length === 0}
          className="w-full bg-purple-600"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Pathway...</>
          ) : (
            <><GitBranch className="w-4 h-4 mr-2" />Generate Clinical Pathway</>
          )}
        </Button>

        {pathway && (
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-green-900 text-lg mb-1">{pathway.pathway_title}</h3>
                <p className="text-sm text-green-700">{pathway.patient_population}</p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pathway.nodes.map((node, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border-2 border-green-200">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge className={
                        node.type === 'assessment' ? 'bg-blue-500' :
                        node.type === 'decision' ? 'bg-amber-500' :
                        node.type === 'intervention' ? 'bg-green-500' :
                        'bg-slate-500'
                      }>
                        {node.type}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{node.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{node.description}</p>
                      </div>
                    </div>
                    
                    {node.criteria?.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-slate-300">
                        {node.criteria.map((c, cidx) => (
                          <p key={cidx} className="text-xs text-slate-700">• {c}</p>
                        ))}
                      </div>
                    )}

                    {node.branches?.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {node.branches.map((branch, bidx) => (
                          <Badge key={bidx} variant="outline" className="text-xs">
                            → {branch.condition}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button size="sm" variant="outline" className="w-full">
                <Download className="w-3 h-3 mr-2" />
                Export Pathway
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}