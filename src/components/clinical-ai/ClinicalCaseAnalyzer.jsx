import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Stethoscope, Brain } from 'lucide-react';
import { toast } from 'sonner';

export default function ClinicalCaseAnalyzer() {
  const [caseDetails, setCaseDetails] = useState({
    age: '',
    gender: '',
    presentation: '',
    history: '',
    examination: '',
    investigations: ''
  });
  const [analysis, setAnalysis] = useState(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert pediatric nephrologist. Analyze this clinical case comprehensively.
        
        Patient: ${caseDetails.age} years old ${caseDetails.gender}
        
        Presenting Complaint: ${caseDetails.presentation}
        
        History: ${caseDetails.history}
        
        Examination: ${caseDetails.examination}
        
        Investigations: ${caseDetails.investigations}
        
        Provide comprehensive clinical analysis:
        1. Case summary
        2. Problem list
        3. Differential diagnoses (ranked by probability with reasoning)
        4. Most likely diagnosis with confidence level
        5. Pathophysiology explanation
        6. Additional investigations needed
        7. Management plan (immediate, short-term, long-term)
        8. Prognosis
        9. Red flags and complications to watch for
        10. Patient/family counseling points
        11. Follow-up plan
        12. Evidence-based guidelines applied
        
        Consider pediatric nephrology protocols, KDIGO guidelines, and best practices.`,
        response_json_schema: {
          type: "object",
          properties: {
            case_summary: { type: "string" },
            problem_list: { type: "array", items: { type: "string" } },
            differential_diagnoses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  diagnosis: { type: "string" },
                  probability: { type: "string" },
                  reasoning: { type: "string" }
                }
              }
            },
            most_likely_diagnosis: { type: "string" },
            confidence_level: { type: "string" },
            pathophysiology: { type: "string" },
            additional_investigations: { type: "array", items: { type: "string" } },
            management_plan: {
              type: "object",
              properties: {
                immediate: { type: "array", items: { type: "string" } },
                short_term: { type: "array", items: { type: "string" } },
                long_term: { type: "array", items: { type: "string" } }
              }
            },
            prognosis: { type: "string" },
            red_flags: { type: "array", items: { type: "string" } },
            counseling_points: { type: "array", items: { type: "string" } },
            follow_up_plan: { type: "string" },
            guidelines_applied: { type: "array", items: { type: "string" } }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('Case analysis complete!');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-indigo-600" />
            Clinical Case AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Age (years)</label>
              <Input
                type="number"
                value={caseDetails.age}
                onChange={(e) => setCaseDetails({...caseDetails, age: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Gender</label>
              <select
                value={caseDetails.gender}
                onChange={(e) => setCaseDetails({...caseDetails, gender: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Presenting Complaint</label>
            <Textarea
              value={caseDetails.presentation}
              onChange={(e) => setCaseDetails({...caseDetails, presentation: e.target.value})}
              rows={2}
              placeholder="Chief complaint and duration..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">History</label>
            <Textarea
              value={caseDetails.history}
              onChange={(e) => setCaseDetails({...caseDetails, history: e.target.value})}
              rows={4}
              placeholder="Present illness, past medical history, family history, medications..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Examination Findings</label>
            <Textarea
              value={caseDetails.examination}
              onChange={(e) => setCaseDetails({...caseDetails, examination: e.target.value})}
              rows={3}
              placeholder="Vitals, general examination, systemic examination..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Investigations</label>
            <Textarea
              value={caseDetails.investigations}
              onChange={(e) => setCaseDetails({...caseDetails, investigations: e.target.value})}
              rows={4}
              placeholder="Lab results, imaging findings, other test results..."
            />
          </div>

          <Button 
            onClick={() => analyzeMutation.mutate()}
            disabled={!caseDetails.age || !caseDetails.presentation || analyzeMutation.isPending}
            className="w-full bg-indigo-600"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Case...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Clinical Case
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Clinical Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold mb-2">Case Summary</h4>
              <p className="text-sm text-slate-700">{analysis.case_summary}</p>
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-lg">Most Likely Diagnosis</h4>
                <Badge className="bg-indigo-600">{analysis.confidence_level}</Badge>
              </div>
              <p className="text-indigo-900 font-semibold text-xl mb-3">{analysis.most_likely_diagnosis}</p>
              <div className="pt-3 border-t">
                <h5 className="font-semibold text-sm mb-2">Pathophysiology</h5>
                <p className="text-sm text-slate-700">{analysis.pathophysiology}</p>
              </div>
            </div>

            {analysis.differential_diagnoses?.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-3">Differential Diagnoses</h4>
                <div className="space-y-3">
                  {analysis.differential_diagnoses.map((dx, idx) => (
                    <div key={idx} className="bg-slate-50 rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{dx.diagnosis}</span>
                        <Badge variant="outline">{dx.probability}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">{dx.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.problem_list?.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Problem List</h4>
                <ul className="space-y-1">
                  {analysis.problem_list.map((problem, idx) => (
                    <li key={idx} className="text-sm text-slate-700">• {problem}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.management_plan && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold mb-3 text-green-900">Management Plan</h4>
                {analysis.management_plan.immediate?.length > 0 && (
                  <div className="mb-3">
                    <Badge className="mb-2 bg-red-600">Immediate</Badge>
                    <ul className="space-y-1">
                      {analysis.management_plan.immediate.map((item, idx) => (
                        <li key={idx} className="text-sm text-green-800">✓ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.management_plan.short_term?.length > 0 && (
                  <div className="mb-3">
                    <Badge className="mb-2 bg-orange-600">Short-term</Badge>
                    <ul className="space-y-1">
                      {analysis.management_plan.short_term.map((item, idx) => (
                        <li key={idx} className="text-sm text-green-800">→ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.management_plan.long_term?.length > 0 && (
                  <div>
                    <Badge className="mb-2 bg-blue-600">Long-term</Badge>
                    <ul className="space-y-1">
                      {analysis.management_plan.long_term.map((item, idx) => (
                        <li key={idx} className="text-sm text-green-800">⇒ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {analysis.additional_investigations?.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-900">Additional Investigations</h4>
                <ul className="space-y-1">
                  {analysis.additional_investigations.map((test, idx) => (
                    <li key={idx} className="text-sm text-blue-800">🔬 {test}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.red_flags?.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-semibold mb-2 text-red-900">⚠ Red Flags</h4>
                <ul className="space-y-1">
                  {analysis.red_flags.map((flag, idx) => (
                    <li key={idx} className="text-sm text-red-800">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold mb-2">Prognosis</h4>
              <p className="text-sm text-slate-700">{analysis.prognosis}</p>
            </div>

            {analysis.counseling_points?.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold mb-2 text-purple-900">Patient/Family Counseling</h4>
                <ul className="space-y-1">
                  {analysis.counseling_points.map((point, idx) => (
                    <li key={idx} className="text-sm text-purple-800">💬 {point}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold mb-2">Follow-up Plan</h4>
              <p className="text-sm text-slate-700">{analysis.follow_up_plan}</p>
            </div>

            {analysis.guidelines_applied?.length > 0 && (
              <div className="bg-slate-100 rounded-lg p-3">
                <h5 className="text-xs font-semibold text-slate-600 mb-2">Guidelines Applied</h5>
                <div className="flex flex-wrap gap-1">
                  {analysis.guidelines_applied.map((guideline, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{guideline}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}