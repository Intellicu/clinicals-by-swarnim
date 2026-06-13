import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, TestTube, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function LabReportAnalyzer() {
  const [labType, setLabType] = useState('VBG');
  const [labFile, setLabFile] = useState(null);
  const [labText, setLabText] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      let fileUrl = null;
      
      if (labFile) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: labFile });
        fileUrl = uploadResult.file_url;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        model: "claude_sonnet_4_6",
        prompt: `You are an expert pediatric nephrologist analyzing laboratory results.
        
        Lab Type: ${labType}
        Patient Age: ${patientAge} years
        ${labText ? `Lab Values:\n${labText}` : ''}
        
        For ${labType === 'VBG' ? 'Venous Blood Gas' : labType}, provide comprehensive analysis:
        
        ${labType === 'VBG' ? `
        1. pH interpretation (acidemia/alkalemia)
        2. Primary acid-base disorder
        3. Compensation assessment
        4. Anion gap calculation and interpretation
        5. Electrolyte abnormalities
        6. Differential diagnosis for acid-base disorder
        7. Severity assessment
        8. Treatment recommendations
        9. Additional tests needed
        ` : `
        1. Values interpretation (normal/abnormal)
        2. Critical values identification
        3. Pattern recognition
        4. Clinical significance
        5. Differential diagnosis
        6. Severity/stage assessment
        7. Treatment implications
        8. Follow-up recommendations
        `}
        
        Consider pediatric reference ranges. Be specific with calculations and cite guidelines.`,
        file_urls: fileUrl ? [fileUrl] : undefined,
        response_json_schema: {
          type: "object",
          properties: {
            primary_interpretation: { type: "string" },
            critical_values: { type: "array", items: { type: "string" } },
            abnormal_findings: { type: "array", items: { type: "string" } },
            calculations: {
              type: "object",
              properties: {
                anion_gap: { type: "string" },
                corrected_values: { type: "array", items: { type: "string" } }
              }
            },
            acid_base_disorder: { type: "string" },
            compensation_status: { type: "string" },
            severity: { type: "string" },
            differential_diagnosis: { type: "array", items: { type: "string" } },
            treatment_recommendations: { type: "array", items: { type: "string" } },
            additional_tests: { type: "array", items: { type: "string" } },
            clinical_pearls: { type: "array", items: { type: "string" } }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('Lab analysis complete!');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-green-600" />
            Lab Report AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Lab Test Type</label>
            <div className="flex flex-wrap gap-2">
              {['VBG', 'ABG', 'RFT', 'Electrolytes', 'Urine Analysis', 'Complete Blood Count'].map(type => (
                <Button
                  key={type}
                  variant={labType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLabType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Patient Age (years)</label>
              <Input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="For pediatric reference ranges"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Upload Lab Report</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setLabFile(e.target.files[0])}
                className="hidden"
                id="lab-upload"
              />
              <label htmlFor="lab-upload" className="cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-600">
                  {labFile ? labFile.name : 'Upload lab report image/PDF'}
                </p>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Or Enter Lab Values</label>
            <Textarea
              value={labText}
              onChange={(e) => setLabText(e.target.value)}
              rows={6}
              placeholder={labType === 'VBG' ? 
                "pH: 7.32\npCO2: 45 mmHg\nHCO3: 22 mEq/L\nNa: 138 mEq/L\nK: 4.2 mEq/L\nCl: 108 mEq/L" :
                "Enter lab values (one per line)"}
            />
          </div>

          <Button 
            onClick={() => analyzeMutation.mutate()}
            disabled={(!labFile && !labText) || analyzeMutation.isPending}
            className="w-full bg-green-600"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Analyze {labType}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg">{labType} Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border-2 border-green-200">
              <h4 className="font-bold mb-2">Primary Interpretation</h4>
              <p className="text-green-900 font-semibold">{analysis.primary_interpretation}</p>
              {analysis.severity && (
                <Badge className="mt-2 bg-orange-600">{analysis.severity}</Badge>
              )}
            </div>

            {analysis.critical_values?.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-semibold mb-2 text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Critical Values
                </h4>
                <ul className="space-y-1">
                  {analysis.critical_values.map((value, idx) => (
                    <li key={idx} className="text-sm text-red-800">⚠ {value}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.calculations && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Calculations</h4>
                {analysis.calculations.anion_gap && (
                  <p className="text-sm mb-2"><strong>Anion Gap:</strong> {analysis.calculations.anion_gap}</p>
                )}
                {analysis.calculations.corrected_values?.map((calc, idx) => (
                  <p key={idx} className="text-sm text-slate-700">{calc}</p>
                ))}
              </div>
            )}

            {analysis.acid_base_disorder && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Acid-Base Status</h4>
                <p className="text-sm text-slate-700 mb-2">
                  <strong>Primary Disorder:</strong> {analysis.acid_base_disorder}
                </p>
                {analysis.compensation_status && (
                  <p className="text-sm text-slate-700">
                    <strong>Compensation:</strong> {analysis.compensation_status}
                  </p>
                )}
              </div>
            )}

            {analysis.abnormal_findings?.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Abnormal Findings</h4>
                <ul className="space-y-1">
                  {analysis.abnormal_findings.map((finding, idx) => (
                    <li key={idx} className="text-sm text-slate-700">• {finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.differential_diagnosis?.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Differential Diagnosis</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.differential_diagnosis.map((dx, idx) => (
                    <Badge key={idx} variant="outline">{dx}</Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.treatment_recommendations?.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold mb-2 text-green-900">Treatment Recommendations</h4>
                <ul className="space-y-1">
                  {analysis.treatment_recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-green-800">✓ {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.additional_tests?.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-900">Additional Tests Recommended</h4>
                <ul className="space-y-1">
                  {analysis.additional_tests.map((test, idx) => (
                    <li key={idx} className="text-sm text-blue-800">→ {test}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.clinical_pearls?.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold mb-2 text-purple-900">Clinical Pearls</h4>
                <ul className="space-y-1">
                  {analysis.clinical_pearls.map((pearl, idx) => (
                    <li key={idx} className="text-sm text-purple-800">💡 {pearl}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800"><strong>⚠️ Disclaimer:</strong> AI lab interpretation is for clinical decision support only. Uses advanced LLM (Claude Sonnet). Always correlate with clinical context and repeat labs as needed. Not a substitute for clinical laboratory specialist review.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}