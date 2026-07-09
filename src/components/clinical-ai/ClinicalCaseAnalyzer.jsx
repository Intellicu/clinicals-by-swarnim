import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Stethoscope, Brain, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { invokeCaseAnalyzer } from '@/lib/LLMService';

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

  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await invokeCaseAnalyzer({ caseDetails });
      if (!result.success) {
        toast.error('Analysis failed — please try again');
        return;
      }
      setAnalysis(result.data);
      toast.success('Case analysis complete!');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={handleAnalyze}
            disabled={!caseDetails.age || !caseDetails.presentation || loading}
            className="w-full bg-indigo-600"
          >
            {loading ? (
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

            {analysis.traceability_links?.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <h5 className="text-xs font-semibold text-slate-600">Evidence Traceability (CIEE)</h5>
                </div>
                <div className="space-y-1.5">
                  {analysis.traceability_links.slice(0, 5).map((link, idx) => (
                    <div key={idx} className="bg-white rounded p-2 border border-slate-100">
                      <p className="text-[11px] text-slate-700 font-medium">{link.recommendation}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {link.evidence_grade && <Badge variant="outline" className="text-[9px] py-0">Grade {link.evidence_grade}</Badge>}
                        {link.recommendation_strength && <Badge variant="outline" className="text-[9px] py-0">{link.recommendation_strength}</Badge>}
                        {link.guideline && <span className="text-[9px] text-slate-400 self-center">{link.guideline} {link.section && `· ${link.section}`}</span>}
                      </div>
                    </div>
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