import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, Loader2, AlertTriangle, CheckCircle, Brain,
  Pill, TestTube, TrendingUp, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { base44 } from '@/api/client';
import { toast } from 'sonner';

export default function CDSSSidebar({ patientData, visitData, diagnosis }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (diagnosis && visitData.chiefComplaint) {
      analyzePatient();
    }
  }, [diagnosis]);

  const analyzePatient = async () => {
    setAnalyzing(true);
    try {
      const prompt = `You are a pediatric nephrology CDSS analyzing patient data.

PATIENT: Age ${patientData.age_years}y, Gender ${patientData.gender}
DIAGNOSIS: ${diagnosis}
CHIEF COMPLAINT: ${visitData.chiefComplaint}
HISTORY: ${visitData.presentingComplaints || 'Not recorded'}
VITALS: BP ${visitData.bp_systolic}/${visitData.bp_diastolic}, Weight ${visitData.weight}kg
LABS: Cr ${visitData.serumCreatinine}

Provide evidence-based clinical decision support:
1. Treatment recommendations with rationale
2. Drug interaction warnings and contraindications
3. Suggested diagnostic tests with priority
4. Critical alerts (if any)
5. Protocol deviations (if any)

Be specific, cite guidelines, and prioritize safety.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            treatment_recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  recommendation: { type: 'string' },
                  rationale: { type: 'string' },
                  evidence_level: { type: 'string' },
                  guideline_source: { type: 'string' }
                }
              }
            },
            drug_alerts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  severity: { type: 'string' },
                  alert: { type: 'string' },
                  action: { type: 'string' }
                }
              }
            },
            suggested_tests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  test: { type: 'string' },
                  priority: { type: 'string' },
                  rationale: { type: 'string' }
                }
              }
            },
            critical_alerts: { type: 'array', items: { type: 'string' } },
            protocol_check: { type: 'string' }
          }
        },
        add_context_from_internet: true
      });

      setRecommendations(response);
    } catch (error) {
      console.error('CDSS error:', error);
      toast.error('CDSS analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!expanded) {
    return (
      <div className="fixed right-4 top-20 z-40">
        <Button
          onClick={() => setExpanded(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg"
        >
          <Shield className="w-5 h-5 mr-2" />
          CDSS
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-20 w-96 max-h-[80vh] overflow-y-auto z-40 shadow-2xl rounded-xl">
      <Card className="border-2 border-indigo-300">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Clinical Decision Support
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setExpanded(false)}>
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {!recommendations ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">Enter diagnosis to activate CDSS</p>
              <Button
                onClick={analyzePatient}
                disabled={!diagnosis || analyzing}
                className="mt-3 bg-indigo-600"
              >
                {analyzing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                ) : (
                  <><Brain className="w-4 h-4 mr-2" />Analyze Patient</>
                )}
              </Button>
            </div>
          ) : (
            <>
              {recommendations.critical_alerts?.length > 0 && (
                <Alert className="bg-red-50 border-red-300 border-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription>
                    <strong className="text-red-900 block mb-2">🚨 CRITICAL ALERTS</strong>
                    <ul className="space-y-1 text-xs text-red-800">
                      {recommendations.critical_alerts.map((alert, idx) => (
                        <li key={idx}>• {alert}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {recommendations.drug_alerts?.length > 0 && (
                <Card className="border-amber-300 bg-amber-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="w-4 h-4 text-amber-600" />
                      <strong className="text-sm text-amber-900">Drug Alerts</strong>
                    </div>
                    <div className="space-y-2">
                      {recommendations.drug_alerts.map((alert, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border text-xs">
                          <Badge className={
                            alert.severity === 'High' ? 'bg-red-500' :
                            alert.severity === 'Medium' ? 'bg-amber-500' :
                            'bg-slate-500'
                          }>
                            {alert.severity}
                          </Badge>
                          <p className="text-slate-900 mt-1">{alert.alert}</p>
                          <p className="text-green-700 mt-1">→ {alert.action}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-green-300 bg-green-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <strong className="text-sm text-green-900">Treatment Recommendations</strong>
                  </div>
                  <div className="space-y-2">
                    {recommendations.treatment_recommendations?.slice(0, 3).map((rec, idx) => (
                      <div key={idx} className="bg-white p-2 rounded border text-xs">
                        <p className="font-semibold text-slate-900">{rec.recommendation}</p>
                        <p className="text-slate-600 mt-1">{rec.rationale}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {rec.evidence_level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {rec.guideline_source}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-300 bg-blue-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TestTube className="w-4 h-4 text-blue-600" />
                    <strong className="text-sm text-blue-900">Suggested Tests</strong>
                  </div>
                  <div className="space-y-1">
                    {recommendations.suggested_tests?.slice(0, 5).map((test, idx) => (
                      <div key={idx} className="bg-white p-2 rounded border text-xs flex items-start gap-2">
                        <Badge className={
                          test.priority === 'Urgent' ? 'bg-red-500' :
                          test.priority === 'Routine' ? 'bg-blue-500' :
                          'bg-slate-500'
                        }>
                          {test.priority}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{test.test}</p>
                          <p className="text-slate-600">{test.rationale}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {recommendations.protocol_check && (
                <Alert className="bg-purple-50 border-purple-200">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <AlertDescription className="text-xs text-purple-900">
                    <strong>Protocol Check:</strong> {recommendations.protocol_check}
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={analyzePatient} size="sm" variant="outline" className="w-full">
                <Brain className="w-3 h-3 mr-2" />
                Re-analyze
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}