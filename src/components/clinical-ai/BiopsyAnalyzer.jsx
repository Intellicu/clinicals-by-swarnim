import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, Microscope, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BiopsyAnalyzer() {
  const [biopsyImage, setBiopsyImage] = useState(null);
  const [biopsyText, setBiopsyText] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = null;
      
      if (biopsyImage) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: biopsyImage });
        imageUrl = uploadResult.file_url;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert nephropathologist. Analyze this renal biopsy report.
        
        ${biopsyText ? `Report text: ${biopsyText}` : ''}
        
        Provide comprehensive analysis including:
        1. Primary diagnosis with confidence level
        2. Key histopathological features
        3. Glomerular findings (if applicable)
        4. Tubular findings
        5. Interstitial findings
        6. Vascular findings
        7. Immunofluorescence interpretation
        8. Electron microscopy interpretation (if available)
        9. Severity grading
        10. Prognostic implications
        11. Treatment recommendations
        12. Differential diagnoses to consider
        13. Follow-up biopsy indications
        
        Be specific with nephrology terminology and reference KDIGO guidelines where applicable.`,
        file_urls: imageUrl ? [imageUrl] : undefined,
        response_json_schema: {
          type: "object",
          properties: {
            primary_diagnosis: { type: "string" },
            confidence_level: { type: "string" },
            glomerular_findings: { type: "array", items: { type: "string" } },
            tubular_findings: { type: "array", items: { type: "string" } },
            interstitial_findings: { type: "array", items: { type: "string" } },
            vascular_findings: { type: "array", items: { type: "string" } },
            immunofluorescence: { type: "string" },
            electron_microscopy: { type: "string" },
            severity_grade: { type: "string" },
            prognosis: { type: "string" },
            treatment_recommendations: { type: "array", items: { type: "string" } },
            differential_diagnoses: { type: "array", items: { type: "string" } },
            follow_up_needed: { type: "boolean" },
            key_references: { type: "array", items: { type: "string" } }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('Biopsy analysis complete!');
    },
    onError: () => {
      toast.error('Analysis failed');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="w-5 h-5 text-purple-600" />
            Renal Biopsy AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Upload Biopsy Images/Report</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setBiopsyImage(e.target.files[0])}
                className="hidden"
                id="biopsy-upload"
              />
              <label htmlFor="biopsy-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">
                  {biopsyImage ? biopsyImage.name : 'Click to upload biopsy images or PDF report'}
                </p>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Or Paste Biopsy Report Text</label>
            <Textarea
              value={biopsyText}
              onChange={(e) => setBiopsyText(e.target.value)}
              rows={8}
              placeholder="Paste histopathology report, immunofluorescence findings, electron microscopy details..."
            />
          </div>

          <Button 
            onClick={() => analyzeMutation.mutate()}
            disabled={(!biopsyImage && !biopsyText) || analyzeMutation.isPending}
            className="w-full bg-purple-600"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Biopsy...
              </>
            ) : (
              <>
                <Microscope className="w-4 h-4 mr-2" />
                Analyze Biopsy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Primary Diagnosis</h3>
                <Badge className="bg-purple-600">{analysis.confidence_level}</Badge>
              </div>
              <p className="text-purple-900 font-semibold text-xl">{analysis.primary_diagnosis}</p>
            </div>

            {analysis.glomerular_findings?.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Glomerular Findings</h4>
                <ul className="space-y-1">
                  {analysis.glomerular_findings.map((finding, idx) => (
                    <li key={idx} className="text-sm text-slate-700">• {finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.tubular_findings?.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Tubular & Interstitial Findings</h4>
                <ul className="space-y-1">
                  {analysis.tubular_findings.map((finding, idx) => (
                    <li key={idx} className="text-sm text-slate-700">• {finding}</li>
                  ))}
                  {analysis.interstitial_findings?.map((finding, idx) => (
                    <li key={idx} className="text-sm text-slate-700">• {finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.immunofluorescence && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Immunofluorescence</h4>
                <p className="text-sm text-slate-700">{analysis.immunofluorescence}</p>
              </div>
            )}

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold mb-2">Severity & Prognosis</h4>
              <Badge className="mb-2">{analysis.severity_grade}</Badge>
              <p className="text-sm text-slate-700">{analysis.prognosis}</p>
            </div>

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

            {analysis.differential_diagnoses?.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Differential Diagnoses</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.differential_diagnoses.map((dx, idx) => (
                    <Badge key={idx} variant="outline">{dx}</Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.follow_up_needed && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600 inline mr-2" />
                <span className="text-sm text-yellow-800 font-semibold">
                  Follow-up biopsy may be indicated
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}