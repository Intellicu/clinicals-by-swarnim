import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, ScanLine } from 'lucide-react';
import { toast } from 'sonner';

export default function RadiologyAnalyzer() {
  const [radiologyImage, setRadiologyImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [modalityType, setModalityType] = useState('Ultrasound');
  const [analysis, setAnalysis] = useState(null);

  const handleImageSelect = (file) => {
    setRadiologyImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const uploadResult = await base44.integrations.Core.UploadFile({ file: radiologyImage });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert radiologist specializing in pediatric nephrology and urology imaging.
        
        Analyze this ${modalityType} image for renal and urological pathology.
        
        Provide detailed analysis:
        1. Image quality assessment
        2. Normal anatomical structures identified
        3. Abnormal findings with locations
        4. Kidney size, echogenicity, cortical thickness
        5. Hydronephrosis grading (if present)
        6. Stones/calculi (location, size)
        7. Masses or cysts
        8. Vascular findings
        9. Bladder findings
        10. Impression and differential diagnosis
        11. Recommendations for further imaging
        12. BIRADS/severity grading if applicable
        
        Be specific with measurements and anatomical descriptions.`,
        file_urls: [uploadResult.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            image_quality: { type: "string" },
            kidney_findings: {
              type: "object",
              properties: {
                right_kidney: { type: "string" },
                left_kidney: { type: "string" },
                sizes: { type: "string" },
                echogenicity: { type: "string" }
              }
            },
            abnormal_findings: { type: "array", items: { type: "string" } },
            hydronephrosis: { type: "string" },
            stones_calculi: { type: "array", items: { type: "string" } },
            masses_cysts: { type: "array", items: { type: "string" } },
            vascular_findings: { type: "string" },
            bladder_findings: { type: "string" },
            impression: { type: "string" },
            differential_diagnosis: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            severity_grade: { type: "string" }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('Radiology analysis complete!');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-blue-600" />
            Radiology AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Imaging Modality</label>
            <div className="flex gap-2">
              {['Ultrasound', 'CT', 'MRI', 'X-Ray', 'VCUG'].map(modality => (
                <Button
                  key={modality}
                  variant={modalityType === modality ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModalityType(modality)}
                >
                  {modality}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Upload Image</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e.target.files[0])}
                className="hidden"
                id="radiology-upload"
              />
              <label htmlFor="radiology-upload" className="cursor-pointer">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click to upload {modalityType} image</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <Button 
            onClick={() => analyzeMutation.mutate()}
            disabled={!radiologyImage || analyzeMutation.isPending}
            className="w-full bg-blue-600"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Image...
              </>
            ) : (
              <>
                <ScanLine className="w-4 h-4 mr-2" />
                Analyze {modalityType}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="text-lg">Radiology Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold mb-2">Image Quality</h4>
              <p className="text-sm text-slate-700">{analysis.image_quality}</p>
            </div>

            {analysis.kidney_findings && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-3">Kidney Findings</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Badge className="mb-2 bg-blue-600">Right Kidney</Badge>
                    <p className="text-sm text-slate-700">{analysis.kidney_findings.right_kidney}</p>
                  </div>
                  <div>
                    <Badge className="mb-2 bg-blue-600">Left Kidney</Badge>
                    <p className="text-sm text-slate-700">{analysis.kidney_findings.left_kidney}</p>
                  </div>
                </div>
                {analysis.kidney_findings.sizes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm"><strong>Sizes:</strong> {analysis.kidney_findings.sizes}</p>
                    <p className="text-sm"><strong>Echogenicity:</strong> {analysis.kidney_findings.echogenicity}</p>
                  </div>
                )}
              </div>
            )}

            {analysis.abnormal_findings?.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-semibold mb-2 text-red-900">Abnormal Findings</h4>
                <ul className="space-y-1">
                  {analysis.abnormal_findings.map((finding, idx) => (
                    <li key={idx} className="text-sm text-red-800">⚠ {finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.hydronephrosis && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Hydronephrosis</h4>
                <p className="text-sm text-slate-700">{analysis.hydronephrosis}</p>
              </div>
            )}

            {analysis.stones_calculi?.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Stones/Calculi</h4>
                <ul className="space-y-1">
                  {analysis.stones_calculi.map((stone, idx) => (
                    <li key={idx} className="text-sm text-slate-700">• {stone}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold mb-2">Impression</h4>
              <p className="text-sm text-slate-700 mb-3">{analysis.impression}</p>
              {analysis.severity_grade && (
                <Badge className="bg-orange-600">{analysis.severity_grade}</Badge>
              )}
            </div>

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

            {analysis.recommendations?.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-900">Recommendations</h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-blue-800">→ {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}