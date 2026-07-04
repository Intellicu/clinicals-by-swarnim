import React, { useState } from 'react';
import { base44 } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Pill, FileText, AlertTriangle, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function ManagementPlanGenerator({ 
  diagnosis, 
  patientAge, 
  patientWeight,
  labResults,
  visitData,
  onPlanGenerated
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState(null);

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate comprehensive management plan for pediatric nephrology patient.

PATIENT: ${patientAge}y, ${patientWeight}kg
DIAGNOSIS: ${diagnosis}
LAB RESULTS: ${JSON.stringify(labResults)}
VISIT DATA: ${JSON.stringify(visitData)}

Provide:
1. MEDICATIONS: 
   - Generic name
   - Exact dose calculation (show mg/kg or fixed dose)
   - Top 3 Indian brands with common formulations
   - Frequency, duration, route
   - Clinical rationale for each drug
   
2. DRUG INTERACTIONS: 
   - Major interactions between prescribed drugs
   - Interactions with common nephrology medications
   - Severity rating (CRITICAL/MODERATE/MINOR)
   
3. SIDE EFFECTS & MONITORING:
   - Common side effects (>10% incidence)
   - Serious adverse effects to watch
   - Specific monitoring parameters for each drug
   - Baseline labs needed before starting
   - Frequency of monitoring (weekly/monthly/quarterly)
   
4. REFERENCE RANGES (age-specific for ${patientAge}y):
   - Key labs to monitor with normal ranges
   - When to adjust doses based on lab values
   
5. RED FLAGS: 
   - Warning signs requiring immediate ED visit
   - When to stop medications
   - Emergency contacts
   
6. FOLLOW-UP PLAN:
   - When to schedule next visit
   - What to monitor at home
   - When to call doctor
   
7. PATIENT/FAMILY EDUCATION:
   - How to take medications
   - Dietary modifications
   - Activity restrictions
   - What to expect

Use KDIGO, IPNA, IAP, WHO guidelines. Prioritize Indian-available formulations.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            medications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  drug: { type: 'string' },
                  dose: { type: 'string' },
                  frequency: { type: 'string' },
                  duration: { type: 'string' },
                  route: { type: 'string' },
                  indian_brands: { type: 'array', items: { type: 'string' } },
                  rationale: { type: 'string' }
                }
              }
            },
            drug_interactions: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  interaction: { type: 'string' },
                  severity: { type: 'string' },
                  management: { type: 'string' }
                }
              } 
            },
            monitoring: {
              type: 'object',
              properties: {
                baseline_labs: { type: 'array', items: { type: 'string' } },
                ongoing_monitoring: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      parameter: { type: 'string' },
                      frequency: { type: 'string' },
                      reference_range: { type: 'string' },
                      action_if_abnormal: { type: 'string' }
                    }
                  }
                }
              }
            },
            side_effects: { type: 'array', items: { type: 'string' } },
            red_flags: { type: 'array', items: { type: 'string' } },
            follow_up: { type: 'string' },
            patient_education: { type: 'array', items: { type: 'string' } },
            additional_info: { type: 'string' }
          }
        }
      });

      setPlan(response);
      onPlanGenerated?.(response);
      toast.success('Management plan generated!');
    } catch (error) {
      console.error('Plan generation error:', error);
      toast.error('Failed to generate plan. Check internet connection.');
      setPlan(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPlan = () => {
    const text = `MANAGEMENT PLAN - ${diagnosis}\n\n${JSON.stringify(plan, null, 2)}`;
    navigator.clipboard.writeText(text);
    toast.success('Plan copied!');
  };

  return (
    <div className="space-y-4">
      {!plan ? (
        <Button
          onClick={generatePlan}
          disabled={isGenerating || !diagnosis}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-6"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating AI Management Plan...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5 mr-2" />
              Generate Management Plan with Medications
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={copyPlan} variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy Plan
            </Button>
          </div>

          {plan.red_flags && plan.red_flags.length > 0 && (
            <Alert className="bg-red-50 border-red-300 border-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertDescription>
                <strong className="text-red-900 block mb-2">RED FLAGS - Immediate Attention:</strong>
                <ul className="space-y-1">
                  {plan.red_flags.map((flag, idx) => (
                    <li key={idx} className="text-red-800 text-sm">• {flag}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-green-600" />
                Medication Prescription
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {plan.medications?.map((med, idx) => (
                <Card key={idx} className="bg-gradient-to-r from-white to-green-50 border-2 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-lg text-slate-900">{med.drug}</h4>
                      <Badge className="bg-green-600 text-white">{med.route}</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div><strong>Dose:</strong> {med.dose}</div>
                      <div><strong>Frequency:</strong> {med.frequency}</div>
                      <div><strong>Duration:</strong> {med.duration}</div>
                    </div>
                    <div className="mt-3">
                      <strong className="text-xs text-slate-600">Indian Brands:</strong>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {med.indian_brands?.map((brand, bidx) => (
                          <Badge key={bidx} variant="outline" className="text-xs">{brand}</Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 italic">{med.rationale}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {plan.drug_interactions && plan.drug_interactions.length > 0 && (
            <Card>
              <CardHeader className="bg-amber-50 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Drug Interactions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {plan.drug_interactions.map((interaction, idx) => (
                  <Alert key={idx} className={
                    interaction.severity === 'CRITICAL' ? 'bg-red-50 border-red-300' :
                    interaction.severity === 'MODERATE' ? 'bg-amber-50 border-amber-300' :
                    'bg-blue-50 border-blue-300'
                  }>
                    <AlertDescription>
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-semibold text-sm">{interaction.interaction}</span>
                        <Badge className={
                          interaction.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                          interaction.severity === 'MODERATE' ? 'bg-amber-500 text-white' :
                          'bg-blue-500 text-white'
                        }>
                          {interaction.severity}
                        </Badge>
                      </div>
                      <p className="text-xs">{interaction.management}</p>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="text-base">Monitoring Protocol</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {plan.monitoring?.baseline_labs && (
                <div>
                  <strong className="text-sm text-purple-900">Baseline Labs (Before Starting):</strong>
                  <div className="text-sm text-slate-700 mt-2 space-y-1">
                    {plan.monitoring.baseline_labs.map((lab, idx) => (
                      <div key={idx} className="bg-purple-50 p-2 rounded">• {lab}</div>
                    ))}
                  </div>
                </div>
              )}

              {plan.monitoring?.ongoing_monitoring && (
                <div>
                  <strong className="text-sm text-purple-900">Ongoing Monitoring:</strong>
                  <div className="space-y-2 mt-2">
                    {plan.monitoring.ongoing_monitoring.map((item, idx) => (
                      <Card key={idx} className="bg-slate-50">
                        <CardContent className="p-3">
                          <div className="grid md:grid-cols-3 gap-2 text-xs">
                            <div>
                              <strong>Parameter:</strong>
                              <div>{item.parameter}</div>
                            </div>
                            <div>
                              <strong>Normal Range:</strong>
                              <div className="text-green-700">{item.reference_range}</div>
                            </div>
                            <div>
                              <strong>Frequency:</strong>
                              <div>{item.frequency}</div>
                            </div>
                            <div className="md:col-span-3">
                              <strong>If Abnormal:</strong>
                              <div className="text-amber-700">{item.action_if_abnormal}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base">Follow-up</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-blue-900">{plan.follow_up}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}