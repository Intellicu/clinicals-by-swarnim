import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, AlertTriangle, CheckCircle, Loader2,
  Activity, Clock, Target
} from 'lucide-react';
import { base44 } from '@/api/client';
import { toast } from 'sonner';

export default function RiskStratification({ patient, visits = [] }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [riskProfile, setRiskProfile] = useState(null);

  useEffect(() => {
    if (patient && visits.length > 0) {
      analyzeRisk();
    }
  }, [patient?.id]);

  const analyzeRisk = async () => {
    setAnalyzing(true);
    try {
      const recentVisits = visits.slice(0, 5).map(v => ({
        date: v.visit_date,
        diagnosis: v.diagnosis,
        vitals: v.physical_examination,
        labs: v.lab_results
      }));

      const prompt = `Analyze patient risk for readmission and complications.

PATIENT: ${patient.patient_name}, Age ${patient.age_years}y
PRIMARY DIAGNOSIS: ${patient.diagnosis}
COMORBIDITIES: ${patient.comorbidities?.join(', ') || 'None'}
RECENT VISITS: ${JSON.stringify(recentVisits)}

Provide comprehensive risk stratification:
1. Overall readmission risk (Low/Medium/High)
2. Specific complication risks with probabilities
3. Contributing risk factors
4. Protective factors
5. Actionable interventions to reduce risk
6. Recommended follow-up frequency

Use validated pediatric nephrology risk models where applicable.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            readmission_risk: { type: 'string' },
            risk_score: { type: 'number' },
            complication_risks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  complication: { type: 'string' },
                  probability: { type: 'string' },
                  severity: { type: 'string' }
                }
              }
            },
            risk_factors: { type: 'array', items: { type: 'string' } },
            protective_factors: { type: 'array', items: { type: 'string' } },
            interventions: { type: 'array', items: { type: 'string' } },
            follow_up_recommendation: { type: 'string' },
            alerts: { type: 'array', items: { type: 'string' } }
          }
        },
        add_context_from_internet: true
      });

      setRiskProfile(response);
    } catch (error) {
      console.error('Risk analysis error:', error);
      toast.error('Risk analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!patient) return null;

  return (
    <Card className="border-2 border-amber-300">
      <CardHeader className="bg-amber-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          AI Risk Stratification
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {analyzing ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Analyzing risk factors...</p>
          </div>
        ) : riskProfile ? (
          <>
            <Alert className={`border-2 ${
              riskProfile.readmission_risk === 'High' ? 'bg-red-50 border-red-300' :
              riskProfile.readmission_risk === 'Medium' ? 'bg-amber-50 border-amber-300' :
              'bg-green-50 border-green-300'
            }`}>
              <AlertTriangle className={`w-4 h-4 ${
                riskProfile.readmission_risk === 'High' ? 'text-red-600' :
                riskProfile.readmission_risk === 'Medium' ? 'text-amber-600' :
                'text-green-600'
              }`} />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <strong className="text-lg">
                    {riskProfile.readmission_risk} Risk
                  </strong>
                  <Badge className={
                    riskProfile.readmission_risk === 'High' ? 'bg-red-600' :
                    riskProfile.readmission_risk === 'Medium' ? 'bg-amber-600' :
                    'bg-green-600'
                  }>
                    Score: {riskProfile.risk_score}%
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>

            {riskProfile.alerts?.length > 0 && (
              <Alert className="bg-red-50 border-red-300 border-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription>
                  <strong className="text-red-900 block mb-1">🚨 Priority Alerts:</strong>
                  <ul className="text-xs text-red-800 space-y-1">
                    {riskProfile.alerts.map((alert, idx) => (
                      <li key={idx}>• {alert}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <strong className="text-sm text-orange-900">Complication Risks</strong>
                </div>
                <div className="space-y-2">
                  {riskProfile.complication_risks?.slice(0, 3).map((risk, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">{risk.complication}</span>
                        <Badge className={
                          risk.severity === 'High' ? 'bg-red-500' :
                          risk.severity === 'Medium' ? 'bg-amber-500' :
                          'bg-slate-500'
                        }>
                          {risk.probability}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <strong className="text-sm text-blue-900">Recommended Interventions</strong>
                </div>
                <ul className="text-xs text-blue-800 space-y-1">
                  {riskProfile.interventions?.slice(0, 4).map((intervention, idx) => (
                    <li key={idx}>✓ {intervention}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <strong className="text-sm text-green-900">Follow-up Plan</strong>
                </div>
                <p className="text-xs text-green-800">{riskProfile.follow_up_recommendation}</p>
              </CardContent>
            </Card>

            <Button onClick={analyzeRisk} size="sm" variant="outline" className="w-full">
              <Activity className="w-3 h-3 mr-2" />
              Re-analyze Risk
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <Button onClick={analyzeRisk} className="bg-amber-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analyze Patient Risk
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}