import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, Loader2, FileText, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/client';
import { toast } from 'sonner';

export default function PrescriptionScanner({ onScanComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    toast.info('Scanning prescription...');

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const prompt = `Extract ALL information from this prescription image:

1. Chief Complaint/Presenting Complaints
2. History of Presenting Illness
3. Past Medical History
4. Family History
5. Vital Signs (Temperature, BP, HR, RR, SpO2)
6. Weight, Height, BMI
7. Physical Examination findings
8. Lab values mentioned
9. Diagnosis
10. Medications (drug name, dose, frequency, duration, route)
11. Investigations ordered
12. Follow-up instructions
13. Any additional advice

Format as structured data for digital prescription pad.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            chiefComplaint: { type: 'string' },
            presentingComplaints: { type: 'string' },
            pastHistory: { type: 'string' },
            familyHistory: { type: 'string' },
            drugHistory: { type: 'string' },
            temperature: { type: 'string' },
            heartRate: { type: 'string' },
            respiratoryRate: { type: 'string' },
            spo2: { type: 'string' },
            bp_systolic: { type: 'string' },
            bp_diastolic: { type: 'string' },
            weight: { type: 'string' },
            height: { type: 'string' },
            bmi: { type: 'string' },
            general: { type: 'string' },
            cardiovascular: { type: 'string' },
            respiratory: { type: 'string' },
            abdomen: { type: 'string' },
            nervous: { type: 'string' },
            diagnosis: { type: 'string' },
            plan: { type: 'string' },
            medications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  drug: { type: 'string' },
                  dose: { type: 'string' },
                  frequency: { type: 'string' },
                  duration: { type: 'string' },
                  route: { type: 'string' }
                }
              }
            },
            investigations: { type: 'string' },
            followUp: { type: 'string' },
            additionalAdvice: { type: 'string' }
          }
        }
      });

      setScannedData(response);
      onScanComplete?.(response);
      toast.success('Prescription scanned successfully!');
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan prescription. Please try again.');
    } finally {
      setIsProcessing(false);
      e.target.value = null;
    }
  };

  return (
    <Card className="bg-white shadow-lg border-2 border-cyan-200">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-cyan-600" />
          Prescription Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Alert className="bg-cyan-50 border-cyan-200">
          <FileText className="w-4 h-4 text-cyan-600" />
          <AlertDescription className="text-cyan-900 text-sm">
            Upload a prescription image to auto-populate the digital pad
          </AlertDescription>
        </Alert>

        <div className="border-2 border-dashed border-cyan-300 rounded-lg p-8 bg-cyan-50">
          <div className="flex flex-col items-center text-center">
            <Upload className="w-12 h-12 text-cyan-600 mb-3" />
            <h3 className="font-semibold text-cyan-900 mb-2">Upload Prescription</h3>
            <p className="text-sm text-cyan-700 mb-4">
              JPG, PNG, PDF - AI will extract all information
            </p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 file:cursor-pointer"
            />
          </div>
        </div>

        {isProcessing && (
          <Alert className="bg-blue-50 border-blue-300">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-900">
              Scanning prescription and extracting data...
            </AlertDescription>
          </Alert>
        )}

        {scannedData && (
          <Alert className="bg-green-50 border-green-300">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>Scan Complete!</strong> Data extracted and ready to populate digital pad.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}