import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, TestTube, Camera, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LabAnalyzer({ patientAge, patientGender, onAnalysisComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const processLabReport = async (file) => {
    setIsProcessing(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);

      const prompt = `Analyze this lab report for a ${patientAge || 'pediatric'} year old ${patientGender || 'child'}.

Extract and interpret:
1. ALL lab values with units
2. Flag abnormal values (HIGH/LOW/CRITICAL) based on pediatric reference ranges
3. Provide AGE-SPECIFIC reference ranges for each parameter
4. Clinical interpretation with differential diagnosis
5. Suggested follow-up tests and monitoring plan
6. Red flags requiring immediate attention
7. Drug monitoring implications if on medications

PEDIATRIC REFERENCE RANGES (Age ${patientAge}y):
- Hemoglobin: 11.5-15.5 g/dL
- WBC: 5-15 × 10³/µL
- Platelets: 150-450 × 10³/µL
- Na: 135-145 mEq/L
- K: 3.5-5.0 mEq/L
- Cl: 98-107 mEq/L
- HCO3: 22-28 mEq/L
- BUN: 5-20 mg/dL
- Creatinine: 0.3-0.7 mg/dL (age-dependent)
- Calcium: 8.8-10.8 mg/dL
- Phosphate: 4.0-7.0 mg/dL (higher in children)
- Albumin: 3.5-5.0 g/dL
- Total Protein: 6.0-8.0 g/dL

Return comprehensive analysis with monitoring suggestions.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            extracted_values: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  parameter: { type: 'string' },
                  value: { type: 'string' },
                  unit: { type: 'string' },
                  status: { type: 'string' },
                  reference_range: { type: 'string' }
                }
              }
            },
            critical_findings: { type: 'array', items: { type: 'string' } },
            clinical_interpretation: { type: 'string' },
            suggested_followup: { type: 'array', items: { type: 'string' } },
            monitoring_plan: { type: 'string' }
          }
        }
      });

      setAnalysis({ ...result, file_url });
      onAnalysisComplete?.(result);
      toast.success('Lab report analyzed!');
    } catch (error) {
      console.error('Lab analysis error:', error);
      toast.error('Failed to analyze report. Please check your internet connection and try again.');
      setAnalysis(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    processLabReport(file);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Button
          onClick={() => cameraInputRef.current?.click()}
          disabled={isProcessing}
          className="h-24 bg-gradient-to-br from-green-600 to-emerald-600 flex flex-col gap-2"
        >
          <Camera className="w-6 h-6" />
          <span>Scan Lab Report</span>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </Button>

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          variant="outline"
          className="h-24 border-2 border-green-300 hover:bg-green-50 flex flex-col gap-2"
        >
          <Upload className="w-6 h-6" />
          <span>Upload PDF/Image</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </Button>
      </div>

      {isProcessing && (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <AlertDescription>Analyzing lab report with AI...</AlertDescription>
        </Alert>
      )}

      {preview && (
        <Card>
          <CardContent className="p-4">
            <img src={preview} alt="Lab Report" className="w-full rounded border" />
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="space-y-4">
          {analysis.critical_findings && analysis.critical_findings.length > 0 && (
            <Alert className="bg-red-50 border-red-300 border-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertDescription>
                <strong className="text-red-900 block mb-2">CRITICAL FINDINGS:</strong>
                <ul className="space-y-1">
                  {analysis.critical_findings.map((finding, idx) => (
                    <li key={idx} className="text-red-800">• {finding}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-green-600" />
                Lab Values Extracted
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                {analysis.extracted_values?.map((val, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div>
                      <span className="font-semibold text-sm">{val.parameter}</span>
                      <div className="text-xs text-slate-500">Ref: {val.reference_range}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{val.value} {val.unit}</span>
                      <Badge className={
                        val.status === 'CRITICAL' ? 'bg-red-500 text-white' :
                        val.status === 'HIGH' || val.status === 'LOW' ? 'bg-amber-500 text-white' :
                        'bg-green-500 text-white'
                      }>
                        {val.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="bg-blue-100 border-b">
              <CardTitle className="text-base">Clinical Interpretation</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-blue-900 whitespace-pre-line">{analysis.clinical_interpretation}</p>
            </CardContent>
          </Card>

          {analysis.suggested_followup && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Suggested Follow-up</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-1">
                  {analysis.suggested_followup.map((item, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}