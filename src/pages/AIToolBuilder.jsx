import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Sparkles, 
  Loader2,
  Save,
  Trash2,
  Calculator,
  FileText,
  Plus
} from "lucide-react";
import { toast } from "sonner";

export default function AIToolBuilder() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [toolDescription, setToolDescription] = useState("");
  const [generatedTool, setGeneratedTool] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userPreferences } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_email: user.email });
      return prefs[0] || null;
    },
    enabled: !!user
  });

  const { data: myTools = [] } = useQuery({
    queryKey: ['myCustomTools', userPreferences?.selected_specialty_id],
    queryFn: () => base44.entities.CustomTool.filter({ 
      specialty_id: userPreferences.selected_specialty_id 
    }),
    enabled: !!userPreferences?.selected_specialty_id
  });

  const generateToolMutation = useMutation({
    mutationFn: async (description) => {
      const prompt = `You are a medical tool designer. Create a clinical calculator/tool based on this description:

"${description}"

Generate a structured tool definition with:
1. Tool name
2. Category (Calculators/Guidelines/Reference/Scoring)
3. Input fields needed (name, label, type, unit, reference range)
4. Calculation logic or clinical algorithm
5. Output interpretation
6. References

Return as JSON:
{
  "name": "Tool Name",
  "description": "Brief description",
  "category": "Calculators",
  "input_fields": [
    {
      "name": "field1",
      "label": "Field Label",
      "type": "number",
      "unit": "kg",
      "reference_range": "Normal: 10-50",
      "required": true
    }
  ],
  "calculation_logic": "Detailed calculation or algorithm",
  "interpretation": "How to interpret results",
  "references": [
    {"title": "Reference 1", "url": "https://..."}
  ]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            input_fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  label: { type: "string" },
                  type: { type: "string" },
                  unit: { type: "string" },
                  reference_range: { type: "string" },
                  required: { type: "boolean" }
                }
              }
            },
            calculation_logic: { type: "string" },
            interpretation: { type: "string" },
            references: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  url: { type: "string" }
                }
              }
            }
          }
        }
      });

      return result;
    },
    onSuccess: (result) => {
      setGeneratedTool(result);
      toast.success("Tool generated successfully! Review and save.");
    }
  });

  const saveToolMutation = useMutation({
    mutationFn: async (toolData) => {
      return await base44.entities.CustomTool.create({
        ...toolData,
        specialty_id: userPreferences.selected_specialty_id,
        icon: "Calculator",
        is_public: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCustomTools'] });
      setShowBuilder(false);
      setToolDescription("");
      setGeneratedTool(null);
      toast.success("Tool saved to your collection!");
    }
  });

  const deleteToolMutation = useMutation({
    mutationFn: (toolId) => base44.entities.CustomTool.delete(toolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCustomTools'] });
      toast.success("Tool deleted");
    }
  });

  const handleGenerate = () => {
    if (!toolDescription.trim()) {
      toast.error("Please describe the tool you want to create");
      return;
    }
    generateToolMutation.mutate(toolDescription);
  };

  const handleSave = () => {
    if (!generatedTool) return;
    saveToolMutation.mutate(generatedTool);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                AI Tool Builder
              </h1>
              <p className="text-slate-600">Describe any clinical tool and AI will create it for you</p>
            </div>
          </div>
        </div>

        {/* AI Builder Card */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg text-purple-900">Describe Your Tool</CardTitle>
            <p className="text-sm text-purple-700">
              Tell AI what clinical tool you need. For example: "A calculator for corrected QT interval in children" or "A scoring system for appendicitis risk"
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={toolDescription}
              onChange={(e) => setToolDescription(e.target.value)}
              placeholder="Example: Create a tool to calculate the PEWS score (Pediatric Early Warning Score) with parameters for behavior, cardiovascular, and respiratory systems..."
              className="min-h-[120px]"
            />
            
            <Button
              onClick={handleGenerate}
              disabled={generateToolMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {generateToolMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Tool with AI...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Generate Tool</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Tool Preview */}
        {generatedTool && (
          <Card className="mb-6 bg-white shadow-lg">
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="flex items-center justify-between">
                <span>Generated Tool: {generatedTool.name}</span>
                <Button onClick={handleSave} disabled={saveToolMutation.isPending} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save to My Tools
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label className="font-semibold text-slate-700">Description</Label>
                <p className="text-slate-600 mt-1">{generatedTool.description}</p>
              </div>

              <div>
                <Label className="font-semibold text-slate-700">Category</Label>
                <Badge className="mt-1">{generatedTool.category}</Badge>
              </div>

              <div>
                <Label className="font-semibold text-slate-700">Input Fields</Label>
                <div className="space-y-2 mt-2">
                  {generatedTool.input_fields?.map((field, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded border">
                      <div>
                        <span className="font-medium">{field.label}</span>
                        <span className="text-xs text-slate-600 ml-2">({field.type})</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        {field.unit && `Unit: ${field.unit}`}
                        {field.reference_range && ` • ${field.reference_range}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-semibold text-slate-700">Calculation Logic</Label>
                <Textarea
                  value={generatedTool.calculation_logic}
                  onChange={(e) => setGeneratedTool({...generatedTool, calculation_logic: e.target.value})}
                  className="mt-1 font-mono text-sm"
                  rows={6}
                />
                <p className="text-xs text-slate-500 mt-1">You can edit the logic before saving</p>
              </div>

              <div>
                <Label className="font-semibold text-slate-700">Interpretation</Label>
                <p className="text-slate-600 mt-1 whitespace-pre-line">{generatedTool.interpretation}</p>
              </div>

              {generatedTool.references && generatedTool.references.length > 0 && (
                <div>
                  <Label className="font-semibold text-slate-700">References</Label>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {generatedTool.references.map((ref, idx) => (
                      <li key={idx} className="text-sm text-slate-600">
                        {ref.url ? (
                          <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {ref.title}
                          </a>
                        ) : ref.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* My Custom Tools */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">My Custom Tools</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {myTools.map((tool) => (
              <Card key={tool.id} className="bg-white border-2 border-slate-200 hover:border-purple-400 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                      <Badge className="mt-1 text-xs">{tool.category}</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Delete this tool?")) {
                          deleteToolMutation.mutate(tool.id);
                        }
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{tool.description}</p>
                  <div className="text-xs text-slate-500 mt-2">
                    {tool.input_fields?.length || 0} fields • {tool.is_public ? 'Public' : 'Private'}
                  </div>
                </CardContent>
              </Card>
            ))}

            {myTools.length === 0 && !generatedTool && (
              <Card className="col-span-full bg-slate-50 border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <Calculator className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No Custom Tools Yet</h3>
                  <p className="text-slate-600">Use the AI builder above to create your first tool</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}