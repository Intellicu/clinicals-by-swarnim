import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Loader2, Tag, FileText, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIHistoryAnalyzer({ chiefComplaint, historyText, onAnalysisComplete, onAddQuestion }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeHistory = async () => {
    if (!chiefComplaint && !historyText) {
      toast.error('Please enter chief complaint or history first');
      return;
    }

    setAnalyzing(true);
    try {
      const prompt = `You are a pediatric nephrologist analyzing patient history.

CHIEF COMPLAINT: ${chiefComplaint || 'Not specified'}

HISTORY: ${historyText || 'Not specified'}

Analyze and provide:
1. Symptom tags (clinical keywords for search/categorization)
2. Top 3 differential diagnoses based on this history
3. Red flags or urgent concerns
4. Recommended immediate workup
5. Clinical category (AKI, CKD, Nephrotic Syndrome, UTI, Electrolytes, etc.)

Be specific and clinically focused.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            symptom_tags: { type: 'array', items: { type: 'string' } },
            differential_diagnoses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  diagnosis: { type: 'string' },
                  likelihood: { type: 'string' },
                  key_features: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            red_flags: { type: 'array', items: { type: 'string' } },
            recommended_workup: { type: 'array', items: { type: 'string' } },
            clinical_category: { type: 'string' },
            follow_up_questions: {
              type: 'array',
              items: { type: 'string' },
              description: '5-7 specific follow-up questions for the doctor to ask'
            }
          }
        }
      });

      setAnalysis(response);
      onAnalysisComplete?.(response);
      toast.success('History analyzed!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader className="bg-indigo-50 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-600" />
          AI History Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <Button
          onClick={analyzeHistory}
          disabled={analyzing || (!chiefComplaint && !historyText)}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Analyze & Tag
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-3">
            <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <strong className="text-sm text-indigo-900">Tags:</strong>
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.symptom_tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-indigo-500 text-white text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {analysis.red_flags?.length > 0 && (
              <div className="bg-red-50 p-3 rounded border-2 border-red-300">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <strong className="text-sm text-red-900">Red Flags:</strong>
                </div>
                <ul className="text-xs text-red-800 space-y-1">
                  {analysis.red_flags.map((flag, idx) => (
                    <li key={idx}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-green-50 p-3 rounded border border-green-200">
              <strong className="text-sm text-green-900 mb-2 block">Top Differentials:</strong>
              <div className="space-y-2">
                {analysis.differential_diagnoses.slice(0, 3).map((dx, idx) => (
                  <div key={idx} className="bg-white p-2 rounded border text-xs">
                    <div className="font-semibold text-slate-900">{idx + 1}. {dx.diagnosis}</div>
                    <Badge className="bg-green-500 text-white text-xs mt-1">{dx.likelihood}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <strong className="text-sm text-blue-900 mb-2 block">Recommended Workup:</strong>
              <ul className="text-xs text-blue-800 space-y-1">
                {analysis.recommended_workup.slice(0, 5).map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>

            {analysis.follow_up_questions?.length > 0 && (
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <strong className="text-sm text-purple-900 mb-2 block">📋 Suggested Follow-up Questions:</strong>
                <div className="space-y-1">
                  {analysis.follow_up_questions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => onAddQuestion?.(question)}
                      className="w-full text-left text-xs bg-white p-2 rounded border hover:bg-purple-100 hover:border-purple-400 transition-colors flex items-start gap-2"
                    >
                      <span className="font-bold text-purple-600">{idx + 1}.</span>
                      <span className="flex-1 text-purple-900">{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}