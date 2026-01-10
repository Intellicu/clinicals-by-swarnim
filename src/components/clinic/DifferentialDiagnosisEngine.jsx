import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Loader2, CheckCircle, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DifferentialDiagnosisEngine({ visitData, patientData, onDiagnosisSelect }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [differentials, setDifferentials] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedDifferential, setEditedDifferential] = useState(null);

  const generateDifferentials = async () => {
    setIsGenerating(true);
    try {
      const contextData = `
PATIENT DATA:
Age: ${patientData.age_years} years
Gender: ${patientData.gender}
Past History: ${patientData.diagnosis || 'None'}
Comorbidities: ${patientData.comorbidities?.join(', ') || 'None'}

CURRENT VISIT:
Chief Complaint: ${visitData.chiefComplaint}
History: ${visitData.presentingComplaints}
Vitals: Temp ${visitData.temperature}°C, BP ${visitData.bp_systolic}/${visitData.bp_diastolic}, HR ${visitData.heartRate}
Anthropometry: Wt ${visitData.weight}kg, Ht ${visitData.height}cm
Examination: ${visitData.general || ''} ${visitData.cardiovascular || ''} ${visitData.respiratory || ''} ${visitData.abdomen || ''}
Labs: ${JSON.stringify(visitData.lab_results || {})}
      `.trim();

      const prompt = `Based on this pediatric nephrology case, generate a ranked differential diagnosis list:

${contextData}

Provide 3-5 most likely diagnoses ranked by probability. For each diagnosis:
1. Calculate probability percentage (0-100%)
2. Provide specific clinical reasoning based on the entered data
3. List supporting features from the case
4. List features that argue against this diagnosis
5. Suggest next diagnostic steps

Return structured JSON with differential diagnoses.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            differentials: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  diagnosis: { type: 'string' },
                  probability: { type: 'number' },
                  reasoning: { type: 'string' },
                  supporting_features: { type: 'array', items: { type: 'string' } },
                  against_features: { type: 'array', items: { type: 'string' } },
                  next_steps: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

      setDifferentials(response.differentials || []);
      toast.success('Differential diagnoses generated!');
    } catch (error) {
      console.error('Differential generation error:', error);
      toast.error('Failed to generate differentials');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    onDiagnosisSelect?.(diagnosis);
    toast.success(`Selected: ${diagnosis.diagnosis}`);
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditedDifferential({ ...differentials[index] });
  };

  const saveEdit = () => {
    const updated = [...differentials];
    updated[editingIndex] = editedDifferential;
    setDifferentials(updated);
    setEditingIndex(null);
    toast.success('Differential updated');
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 70) return 'from-green-500 to-emerald-600';
    if (prob >= 40) return 'from-amber-500 to-orange-600';
    return 'from-slate-400 to-slate-600';
  };

  const getProbabilityBadge = (prob) => {
    if (prob >= 70) return 'bg-green-500 text-white';
    if (prob >= 40) return 'bg-amber-500 text-white';
    return 'bg-slate-500 text-white';
  };

  return (
    <Card className="bg-white shadow-lg border-2 border-indigo-200">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Differential Diagnosis Engine
          </CardTitle>
          <Button
            onClick={generateDifferentials}
            disabled={isGenerating || !visitData.chiefComplaint}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Differentials
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {differentials.length === 0 && !isGenerating && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              Enter chief complaint, history, vitals, and examination findings to generate differential diagnoses
            </AlertDescription>
          </Alert>
        )}

        {differentials.length > 0 && (
          <div className="space-y-4">
            <Alert className="bg-indigo-50 border-indigo-200">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <AlertDescription className="text-indigo-900 text-sm">
                <strong>Top {differentials.length} Differential Diagnoses</strong> - Click to select for treatment plan
              </AlertDescription>
            </Alert>

            {differentials.map((diff, idx) => {
              const isEditing = editingIndex === idx;
              const displayDiff = isEditing ? editedDifferential : diff;
              
              return (
              <Card
                key={idx}
                className={`border-2 transition-all ${
                  selectedDiagnosis?.diagnosis === diff.diagnosis
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <CardHeader className="bg-slate-50 border-b pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-14 h-14 bg-gradient-to-br ${getProbabilityColor(displayDiff.probability)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <Input
                            value={editedDifferential.diagnosis}
                            onChange={(e) => setEditedDifferential({...editedDifferential, diagnosis: e.target.value})}
                            className="mb-2"
                          />
                        ) : (
                          <h3 className="font-bold text-lg text-slate-900 mb-1">{displayDiff.diagnosis}</h3>
                        )}
                        <Badge className={`${getProbabilityBadge(displayDiff.probability)} text-sm px-3 py-1`}>
                          {displayDiff.probability}% Probability
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={saveEdit} className="bg-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(idx);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(diff);
                            }}
                          >
                            Select
                          </Button>
                        </>
                      )}
                      {selectedDiagnosis?.diagnosis === diff.diagnosis && (
                        <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      Clinical Reasoning
                    </h4>
                    <p className="text-sm text-slate-700 bg-indigo-50 p-3 rounded">{diff.reasoning}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Supporting Features
                      </h4>
                      <ul className="space-y-1">
                        {diff.supporting_features?.map((feature, fidx) => (
                          <li key={fidx} className="flex items-start gap-2 text-xs bg-green-50 p-2 rounded">
                            <span className="text-green-600 font-bold">✓</span>
                            <span className="text-slate-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {diff.against_features?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Features Against
                        </h4>
                        <ul className="space-y-1">
                          {diff.against_features.map((feature, fidx) => (
                            <li key={fidx} className="flex items-start gap-2 text-xs bg-amber-50 p-2 rounded">
                              <span className="text-amber-600 font-bold">!</span>
                              <span className="text-slate-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {diff.next_steps?.length > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-sm text-purple-900 mb-2 flex items-center gap-2">
                        <ChevronRight className="w-4 h-4" />
                        Next Diagnostic Steps
                      </h4>
                      <ul className="space-y-1">
                        {diff.next_steps.map((step, sidx) => (
                          <li key={sidx} className="text-xs text-purple-800 flex items-start gap-2">
                            <span className="font-bold">{sidx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}