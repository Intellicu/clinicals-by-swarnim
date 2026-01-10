import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InteractivePathway from "../components/InteractivePathway";
import { 
  ArrowLeft, 
  Brain, 
  Sparkles, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  FileQuestion
} from "lucide-react";
import { toast } from "sonner";

export default function DiagnosticQuestionnaire() {
  const [clinicalScenario, setClinicalScenario] = useState("");
  const [pathwayData, setPathwayData] = useState(null);

  const generatePathwayMutation = useMutation({
    mutationFn: async (scenario) => {
      const prompt = `You are a clinical reasoning expert. Create an interactive diagnostic questionnaire/clinical pathway for this scenario:

"${scenario}"

Generate a step-by-step diagnostic approach with decision points. Return as JSON:

{
  "title": "Diagnostic Approach to...",
  "description": "Systematic evaluation of...",
  "steps": [
    {
      "type": "assessment|decision|information",
      "question": "What is the main presenting symptom?",
      "context": "Brief explanation of why this matters",
      "reasoning": "Clinical reasoning: This helps differentiate between X and Y because...",
      "options": [
        {
          "value": "option1",
          "label": "Acute presentation (<48h)",
          "description": "Sudden onset with rapid progression",
          "nextStep": 1
        },
        {
          "value": "option2",
          "label": "Chronic presentation (>2 weeks)",
          "description": "Gradual onset, progressive symptoms",
          "nextStep": 2
        }
      ]
    },
    {
      "type": "result",
      "question": "Final Assessment",
      "result": {
        "diagnosis": "Most likely diagnosis based on path",
        "recommendations": [
          "Investigation 1",
          "Investigation 2",
          "Treatment approach"
        ],
        "nextSteps": [
          "Follow-up in X days",
          "Monitor for Y",
          "Consider referral if Z"
        ]
      }
    }
  ]
}

Create 5-8 steps with clear clinical reasoning for each decision point.`;

      const pathway = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  question: { type: "string" },
                  context: { type: "string" },
                  reasoning: { type: "string" },
                  options: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        value: { type: "string" },
                        label: { type: "string" },
                        description: { type: "string" },
                        nextStep: { type: "number" }
                      }
                    }
                  },
                  result: {
                    type: "object",
                    properties: {
                      diagnosis: { type: "string" },
                      recommendations: {
                        type: "array",
                        items: { type: "string" }
                      },
                      nextSteps: {
                        type: "array",
                        items: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      return pathway;
    },
    onSuccess: (pathway) => {
      setPathwayData(pathway);
      toast.success("Interactive pathway generated!");
    }
  });

  const handleGenerate = () => {
    if (!clinicalScenario.trim()) {
      toast.error("Please describe a clinical scenario");
      return;
    }
    generatePathwayMutation.mutate(clinicalScenario);
  };

  // Pre-defined examples
  const examples = [
    {
      title: "Proteinuria Evaluation",
      scenario: "8-year-old with proteinuria detected on routine urinalysis"
    },
    {
      title: "Acute Kidney Injury",
      scenario: "5-year-old with decreased urine output and elevated creatinine"
    },
    {
      title: "Hematuria Workup",
      scenario: "10-year-old with gross hematuria and no trauma"
    },
    {
      title: "Hypertension Approach",
      scenario: "12-year-old with elevated blood pressure on three separate occasions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Diagnostic Questionnaire Generator</h1>
              <p className="text-slate-600">AI-powered clinical reasoning pathway with explanations</p>
            </div>
          </div>
        </div>

        {!pathwayData ? (
          <>
            {/* Input Section */}
            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg text-purple-900">Describe Clinical Scenario</CardTitle>
                <p className="text-sm text-purple-700 mt-1">
                  Enter a clinical presentation and AI will create an interactive diagnostic pathway with reasoning
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={clinicalScenario}
                  onChange={(e) => setClinicalScenario(e.target.value)}
                  placeholder="Example: 7-year-old boy presents with periorbital edema for 3 days, foamy urine, and decreased urine output. No fever, no hematuria."
                  className="min-h-[120px]"
                />
                
                <Button
                  onClick={handleGenerate}
                  disabled={generatePathwayMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6"
                >
                  {generatePathwayMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating Interactive Pathway...</>
                  ) : (
                    <><Sparkles className="w-5 h-5 mr-2" />Generate Diagnostic Questionnaire</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Examples */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base">Quick Start Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {examples.map((example, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="h-auto p-4 text-left justify-start"
                      onClick={() => {
                        setClinicalScenario(example.scenario);
                        generatePathwayMutation.mutate(example.scenario);
                      }}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{example.title}</div>
                        <div className="text-xs text-slate-600 mt-1">{example.scenario}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Information */}
            <Alert className="mt-6 bg-blue-50 border-blue-200">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>How it works:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>Describe a clinical scenario or symptom complex</li>
                  <li>AI generates a step-by-step diagnostic approach</li>
                  <li>Each step includes clinical reasoning explanation</li>
                  <li>Interactive decision points guide you to diagnosis</li>
                  <li>Get evidence-based recommendations at the end</li>
                </ol>
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <>
            {/* Interactive Pathway */}
            <InteractivePathway pathwayData={pathwayData} />

            <Button
              onClick={() => {
                setPathwayData(null);
                setClinicalScenario("");
              }}
              variant="outline"
              className="mt-6"
            >
              Generate New Pathway
            </Button>
          </>
        )}
      </div>
    </div>
  );
}