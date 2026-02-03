import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, Loader2, CheckCircle2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientOnboarding({ workspaceId, onComplete }) {
  const [step, setStep] = useState(1);
  const [scanFile, setScanFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [patientData, setPatientData] = useState({
    patient_name: '',
    mobile_number: '',
    age_years: '',
    gender: 'Male',
    address: '',
    diagnosis: '',
    medical_history: ''
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const handleOCRScan = async () => {
    if (!scanFile) return;
    
    setIsExtracting(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file: scanFile });
      
      const extractedText = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract patient information from this medical record. Extract: patient name, age, gender, mobile number, address, diagnosis, past medical history. Return structured data.`,
        file_urls: [uploadResult.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            patient_name: { type: "string" },
            age_years: { type: "number" },
            gender: { type: "string" },
            mobile_number: { type: "string" },
            address: { type: "string" },
            diagnosis: { type: "string" },
            medical_history: { type: "string" }
          }
        }
      });

      setExtractedData(extractedText);
      setPatientData({ ...patientData, ...extractedText });
      setStep(2);
      toast.success('Data extracted successfully!');
    } catch (error) {
      toast.error('Failed to extract data');
    } finally {
      setIsExtracting(false);
    }
  };

  const createPatientMutation = useMutation({
    mutationFn: async (data) => {
      const crNumber = `CR${Date.now().toString().slice(-6)}`;
      return base44.entities.Patient.create({
        ...data,
        cr_number: crNumber,
        status: 'Active'
      });
    },
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient enrolled successfully!');
      onComplete?.(patient);
    }
  });

  return (
    <div className="space-y-6">
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Scan Patient Record (OCR)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                id="ocr-scan"
                className="hidden"
                onChange={(e) => setScanFile(e.target.files[0])}
              />
              <label htmlFor="ocr-scan" className="cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-2">
                  {scanFile ? scanFile.name : 'Take photo or upload patient record'}
                </p>
                <Button variant="outline" type="button">
                  Select File
                </Button>
              </label>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleOCRScan} 
                disabled={!scanFile || isExtracting}
                className="flex-1 bg-blue-600"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting Data...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Extract & Continue
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setStep(2)}>
                Skip OCR
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Patient Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {extractedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800 font-semibold mb-1">Data extracted from document</p>
                <p className="text-xs text-green-700">Review and edit the information below</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Patient Name *</Label>
                <Input
                  value={patientData.patient_name}
                  onChange={(e) => setPatientData({...patientData, patient_name: e.target.value})}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label>Mobile Number</Label>
                <Input
                  value={patientData.mobile_number}
                  onChange={(e) => setPatientData({...patientData, mobile_number: e.target.value})}
                  placeholder="10-digit mobile"
                />
              </div>
              <div>
                <Label>Age (years)</Label>
                <Input
                  type="number"
                  value={patientData.age_years}
                  onChange={(e) => setPatientData({...patientData, age_years: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  value={patientData.gender}
                  onChange={(e) => setPatientData({...patientData, gender: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={patientData.address}
                onChange={(e) => setPatientData({...patientData, address: e.target.value})}
              />
            </div>

            <div>
              <Label>Primary Diagnosis</Label>
              <Input
                value={patientData.diagnosis}
                onChange={(e) => setPatientData({...patientData, diagnosis: e.target.value})}
              />
            </div>

            <div>
              <Label>Medical History</Label>
              <Textarea
                value={patientData.medical_history}
                onChange={(e) => setPatientData({...patientData, medical_history: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={() => setStep(1)} variant="outline">
                Back
              </Button>
              <Button 
                onClick={() => createPatientMutation.mutate(patientData)}
                disabled={!patientData.patient_name || createPatientMutation.isPending}
                className="flex-1 bg-green-600"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {createPatientMutation.isPending ? 'Enrolling...' : 'Enroll Patient'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}