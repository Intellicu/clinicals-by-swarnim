import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Loader2, 
  Save, 
  Copy, 
  Pill, 
  TestTube, 
  AlertTriangle,
  Calendar,
  Calculator,
  Edit,
  Check
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function EnhancedTreatmentPlanGenerator({ 
  selectedDiagnosis, 
  patientData, 
  visitData,
  onPlanGenerated 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const queryClient = useQueryClient();

  const saveTemplateMutation = useMutation({
    mutationFn: (template) => base44.entities.TreatmentTemplate.create(template),
    onSuccess: () => {
      queryClient.invalidateQueries(['treatment-templates']);
      toast.success('Template saved!');
      setTemplateName('');
    }
  });

  const generatePlan = async () => {
    if (!selectedDiagnosis) {
      toast.error('Please select a diagnosis first');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate a comprehensive treatment plan for:

DIAGNOSIS: ${selectedDiagnosis.diagnosis} (${selectedDiagnosis.probability}% probability)

PATIENT:
Age: ${patientData.age_years} years
Weight: ${visitData.weight} kg
Gender: ${patientData.gender}
Past History: ${patientData.diagnosis || 'None'}

CLINICAL CONTEXT:
${selectedDiagnosis.reasoning}

Generate a structured treatment plan including:
1. Specific therapy (medications with exact weight-based doses, protocols)
2. Supportive therapy (fluids, diet, activity)
3. Investigations needed (priority order)
4. Red flag warnings for complications
5. Follow-up schedule
6. Patient/parent education points

Use pediatric nephrology guidelines (KDIGO, IPNA, IAP). Include Indian formulations.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            diagnosis_summary: { type: 'string' },
            specific_therapy: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  drug: { type: 'string' },
                  dose: { type: 'string' },
                  route: { type: 'string' },
                  frequency: { type: 'string' },
                  duration: { type: 'string' },
                  indication: { type: 'string' }
                }
              }
            },
            supportive_therapy: { type: 'array', items: { type: 'string' } },
            investigations: {
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
            red_flags: { type: 'array', items: { type: 'string' } },
            follow_up: {
              type: 'object',
              properties: {
                timing: { type: 'string' },
                parameters_to_monitor: { type: 'array', items: { type: 'string' } }
              }
            },
            patient_education: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setPlan(response);
      onPlanGenerated?.(response);
      toast.success('Treatment plan generated!');
    } catch (error) {
      console.error('Plan generation error:', error);
      toast.error('Failed to generate treatment plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAsTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Enter template name');
      return;
    }

    saveTemplateMutation.mutate({
      name: templateName,
      diagnosis: selectedDiagnosis.diagnosis,
      plan_data: plan,
      age_range: `${patientData.age_years} years`,
      specialty: 'Pediatric Nephrology'
    });
  };

  const copyPlan = () => {
    const text = `
DIAGNOSIS: ${plan.diagnosis_summary}

SPECIFIC THERAPY:
${plan.specific_therapy?.map(m => `• ${m.drug} - ${m.dose}, ${m.route}, ${m.frequency} for ${m.duration}\n  Indication: ${m.indication}`).join('\n')}

SUPPORTIVE THERAPY:
${plan.supportive_therapy?.map(s => `• ${s}`).join('\n')}

INVESTIGATIONS:
${plan.investigations?.map(i => `• ${i.test} (${i.priority}) - ${i.rationale}`).join('\n')}

RED FLAGS:
${plan.red_flags?.map(r => `⚠️ ${r}`).join('\n')}

FOLLOW-UP: ${plan.follow_up?.timing}
Monitor: ${plan.follow_up?.parameters_to_monitor?.join(', ')}

PATIENT EDUCATION:
${plan.patient_education?.map(e => `• ${e}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('Treatment plan copied!');
  };

  return (
    <Card className="bg-white shadow-lg border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Treatment Plan Generator
          </CardTitle>
          <div className="flex gap-2">
            {plan && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {isEditing ? 'Preview' : 'Edit'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyPlan}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {!selectedDiagnosis && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-900 text-sm">
              Select a differential diagnosis first to generate treatment plan
            </AlertDescription>
          </Alert>
        )}

        {selectedDiagnosis && !plan && (
          <div>
            <Alert className="bg-purple-50 border-purple-200 mb-4">
              <FileText className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-purple-900 text-sm">
                <strong>Selected Diagnosis:</strong> {selectedDiagnosis.diagnosis} ({selectedDiagnosis.probability}%)
              </AlertDescription>
            </Alert>

            <Button
              onClick={generatePlan}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Evidence-Based Plan...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Generate Treatment Plan
                </>
              )}
            </Button>
          </div>
        )}

        {plan && !isEditing && (
          <div className="space-y-4">
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <h3 className="font-bold text-purple-900 mb-2">Diagnosis Summary</h3>
                <p className="text-sm text-purple-800">{plan.diagnosis_summary}</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader className="bg-green-50 border-b pb-3">
                <h3 className="font-bold text-green-900 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Specific Therapy
                </h3>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {plan.specific_therapy?.map((med, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{med.drug}</h4>
                        <Badge className="bg-green-500 text-white text-xs">{med.route}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 mb-2">
                        <div><strong>Dose:</strong> {med.dose}</div>
                        <div><strong>Frequency:</strong> {med.frequency}</div>
                        <div className="col-span-2"><strong>Duration:</strong> {med.duration}</div>
                      </div>
                      <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
                        <strong>Indication:</strong> {med.indication}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50 border-b pb-3">
                <h3 className="font-bold text-blue-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Supportive Therapy
                </h3>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {plan.supportive_therapy?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-cyan-200">
              <CardHeader className="bg-cyan-50 border-b pb-3">
                <h3 className="font-bold text-cyan-900 flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Investigations
                </h3>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {plan.investigations?.map((inv, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-cyan-200">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-sm text-slate-900">{inv.test}</h4>
                        <Badge className={inv.priority === 'Urgent' ? 'bg-red-500' : 'bg-cyan-500'} variant="default">
                          {inv.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{inv.rationale}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Alert className="bg-red-50 border-red-300 border-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertDescription>
                <strong className="text-red-900 block mb-2">⚠️ Red Flag Warnings</strong>
                <ul className="space-y-1">
                  {plan.red_flags?.map((flag, idx) => (
                    <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>

            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50 border-b pb-3">
                <h3 className="font-bold text-purple-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Follow-Up Plan
                </h3>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="text-sm">
                  <strong className="text-slate-900">Timing:</strong> {plan.follow_up?.timing}
                </div>
                <div>
                  <strong className="text-sm text-slate-900 block mb-1">Monitor:</strong>
                  <div className="flex flex-wrap gap-2">
                    {plan.follow_up?.parameters_to_monitor?.map((param, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {param}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200">
              <CardHeader className="bg-amber-50 border-b pb-3">
                <h3 className="font-bold text-amber-900">Patient/Parent Education</h3>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {plan.patient_education?.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-amber-600 font-bold">{idx + 1}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter template name to save..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <Button
                onClick={saveAsTemplate}
                disabled={saveTemplateMutation.isPending || !templateName.trim()}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        )}

        {plan && isEditing && (
          <div className="space-y-4">
            <Textarea
              value={JSON.stringify(plan, null, 2)}
              onChange={(e) => {
                try {
                  setPlan(JSON.parse(e.target.value));
                } catch (err) {
                  // Invalid JSON, ignore
                }
              }}
              className="font-mono text-xs h-96"
            />
            <Button onClick={() => setIsEditing(false)} className="w-full">
              <Check className="w-4 h-4 mr-2" />
              Done Editing
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}