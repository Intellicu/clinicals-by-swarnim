import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  User, Calendar, FileText, Activity, Stethoscope, 
  ChevronRight, ChevronLeft, Upload, Loader2, CheckCircle 
} from "lucide-react";
import { toast } from "sonner";

export default function AppointmentWorkflow({ appointment, patient, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowData, setWorkflowData] = useState({
    // Demographics
    demographics: {
      name: patient?.patient_name || "",
      age: patient?.age_years || "",
      gender: patient?.gender || "",
      dob: patient?.date_of_birth || "",
      mobile: patient?.mobile_number || "",
      address: patient?.address || ""
    },
    // Chief Complaints
    chiefComplaints: appointment?.chief_complaint || "",
    // Anthropometry
    anthropometry: {
      weight: "",
      height: "",
      bmi: null,
      bsa: null,
      head_circumference: "",
      muac: ""
    },
    // Vitals
    vitals: {
      bp_systolic: "",
      bp_diastolic: "",
      bp_percentile: null,
      heart_rate: "",
      respiratory_rate: "",
      temperature: "",
      spo2: ""
    },
    // History
    history: {
      presenting_illness: "",
      past_medical: patient?.notes || "",
      medications: patient?.current_medications || [],
      allergies: patient?.allergies || [],
      family_history: ""
    },
    // Uploaded Documents
    documents: []
  });

  const { data: bpReference } = useQuery({
    queryKey: ['bp-reference'],
    queryFn: async () => {
      // Simplified BP percentile data
      return { loaded: true };
    }
  });

  // Auto-calculate BMI and BSA
  useEffect(() => {
    const { weight, height } = workflowData.anthropometry;
    if (weight && height) {
      const weightKg = parseFloat(weight);
      const heightM = parseFloat(height) / 100;
      const bmi = (weightKg / (heightM * heightM)).toFixed(1);
      const bsa = (Math.sqrt((weightKg * parseFloat(height)) / 3600)).toFixed(2);
      
      setWorkflowData(prev => ({
        ...prev,
        anthropometry: { ...prev.anthropometry, bmi, bsa }
      }));
    }
  }, [workflowData.anthropometry.weight, workflowData.anthropometry.height]);

  // Auto-calculate BP percentile
  useEffect(() => {
    const { bp_systolic, bp_diastolic } = workflowData.vitals;
    const { height } = workflowData.anthropometry;
    const { age, gender } = workflowData.demographics;

    if (bp_systolic && bp_diastolic && height && age && gender) {
      // Simplified calculation - in real app would use detailed tables
      const systolic = parseFloat(bp_systolic);
      const age_num = parseFloat(age);
      
      let percentile = "Normal";
      if (gender === "Male") {
        if (systolic > 120 + age_num * 2) percentile = ">95th (HTN)";
        else if (systolic > 110 + age_num * 2) percentile = "90-95th (Pre-HTN)";
      } else {
        if (systolic > 118 + age_num * 2) percentile = ">95th (HTN)";
        else if (systolic > 108 + age_num * 2) percentile = "90-95th (Pre-HTN)";
      }

      setWorkflowData(prev => ({
        ...prev,
        vitals: { ...prev.vitals, bp_percentile: percentile }
      }));
    }
  }, [workflowData.vitals.bp_systolic, workflowData.vitals.bp_diastolic, workflowData.anthropometry.height, workflowData.demographics.age, workflowData.demographics.gender]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }

    toast.info("Uploading document...", { id: "doc-upload" });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      let extractedText = null;
      if (file.type.includes('image') || file.type === 'application/pdf') {
        try {
          extractedText = await base44.integrations.Core.InvokeLLM({
            prompt: "Extract all medical information from this document including patient details, diagnoses, medications, and lab values.",
            file_urls: [file_url]
          });
        } catch (error) {
          console.warn("OCR failed:", error);
        }
      }

      setWorkflowData(prev => ({
        ...prev,
        documents: [...prev.documents, { 
          file_url, 
          file_name: file.name, 
          file_type: file.type,
          extracted_text: extractedText 
        }]
      }));
      
      toast.success("Document uploaded!", { id: "doc-upload" });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed - check connection", { id: "doc-upload" });
    }
  };

  const handleComplete = async () => {
    try {
      toast.info("Creating visit record...", { id: "visit-create" });
      
      const visitData = {
        patient_id: patient.id,
        visit_date: appointment.appointment_date,
        visit_type: appointment.appointment_type,
        chief_complaint: workflowData.chiefComplaints,
        history: workflowData.history.presenting_illness,
        physical_examination: {
          ...workflowData.anthropometry,
          ...workflowData.vitals
        },
        scanned_documents: workflowData.documents
      };

      await base44.entities.VisitRecord.create(visitData);
      await base44.entities.Appointment.update(appointment.id, { status: "Completed" });
      
      toast.success("Visit started!", { id: "visit-create" });
      onComplete(workflowData);
    } catch {
      toast.error("Failed to start visit", { id: "visit-create" });
    }
  };

  const steps = [
    { number: 1, title: "Demographics", icon: User },
    { number: 2, title: "Chief Complaints", icon: FileText },
    { number: 3, title: "Anthropometry", icon: Activity },
    { number: 4, title: "Vitals", icon: Stethoscope },
    { number: 5, title: "History & Documents", icon: FileText }
  ];

  const progress = (currentStep / steps.length) * 100;

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Patient Check-in Workflow</CardTitle>
          <Badge className="bg-blue-600">{appointment.appointment_type}</Badge>
        </div>
        <div className="flex items-center gap-2 mb-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                </div>
                {step.number < steps.length && (
                  <div className={`flex-1 h-1 mx-1 ${currentStep > step.number ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent className="p-6">
        {/* Step 1: Demographics */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">Patient Demographics</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Patient Name *</Label>
                <Input
                  value={workflowData.demographics.name}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev, 
                    demographics: { ...prev.demographics, name: e.target.value }
                  }))}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label>Age (years)</Label>
                <Input
                  type="number"
                  value={workflowData.demographics.age}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev, 
                    demographics: { ...prev.demographics, age: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select 
                  value={workflowData.demographics.gender} 
                  onValueChange={(val) => setWorkflowData(prev => ({
                    ...prev, 
                    demographics: { ...prev.demographics, gender: val }
                  }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mobile Number</Label>
                <Input
                  value={workflowData.demographics.mobile}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev, 
                    demographics: { ...prev.demographics, mobile: e.target.value }
                  }))}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Chief Complaints */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">Chief Complaints</h3>
            <div>
              <Label>What are the main problems today?</Label>
              <Textarea
                value={workflowData.chiefComplaints}
                onChange={(e) => setWorkflowData(prev => ({ ...prev, chiefComplaints: e.target.value }))}
                placeholder="Describe the patient's main complaints..."
                className="h-32"
              />
            </div>
          </div>
        )}

        {/* Step 3: Anthropometry */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">Anthropometry</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Weight (kg) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={workflowData.anthropometry.weight}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    anthropometry: { ...prev.anthropometry, weight: e.target.value }
                  }))}
                  placeholder="Enter weight"
                />
              </div>
              <div>
                <Label>Height (cm) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={workflowData.anthropometry.height}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    anthropometry: { ...prev.anthropometry, height: e.target.value }
                  }))}
                  placeholder="Enter height"
                />
              </div>
              <div>
                <Label>BMI</Label>
                <Input
                  value={workflowData.anthropometry.bmi || "Calculated automatically..."}
                  disabled
                  className="bg-blue-50"
                />
              </div>
              <div>
                <Label>Body Surface Area (m²)</Label>
                <Input
                  value={workflowData.anthropometry.bsa || "Calculated automatically..."}
                  disabled
                  className="bg-blue-50"
                />
              </div>
              <div>
                <Label>Head Circumference (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={workflowData.anthropometry.head_circumference}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    anthropometry: { ...prev.anthropometry, head_circumference: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>MUAC (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={workflowData.anthropometry.muac}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    anthropometry: { ...prev.anthropometry, muac: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Vitals */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">Vital Signs</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>BP Systolic (mmHg)</Label>
                <Input
                  type="number"
                  value={workflowData.vitals.bp_systolic}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    vitals: { ...prev.vitals, bp_systolic: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>BP Diastolic (mmHg)</Label>
                <Input
                  type="number"
                  value={workflowData.vitals.bp_diastolic}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    vitals: { ...prev.vitals, bp_diastolic: e.target.value }
                  }))}
                />
              </div>
              {workflowData.vitals.bp_percentile && (
                <div className="md:col-span-2">
                  <Badge className={`text-sm ${
                    workflowData.vitals.bp_percentile.includes('HTN') ? 'bg-red-600' :
                    workflowData.vitals.bp_percentile.includes('Pre-HTN') ? 'bg-amber-600' :
                    'bg-green-600'
                  }`}>
                    BP Percentile: {workflowData.vitals.bp_percentile}
                  </Badge>
                </div>
              )}
              <div>
                <Label>Heart Rate (bpm)</Label>
                <Input
                  type="number"
                  value={workflowData.vitals.heart_rate}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    vitals: { ...prev.vitals, heart_rate: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Respiratory Rate</Label>
                <Input
                  type="number"
                  value={workflowData.vitals.respiratory_rate}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    vitals: { ...prev.vitals, respiratory_rate: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Temperature (°F)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={workflowData.vitals.temperature}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    vitals: { ...prev.vitals, temperature: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>SpO2 (%)</Label>
                <Input
                  type="number"
                  value={workflowData.vitals.spo2}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    vitals: { ...prev.vitals, spo2: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: History & Documents */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">History & Documents</h3>
            <div>
              <Label>History of Presenting Illness</Label>
              <Textarea
                value={workflowData.history.presenting_illness}
                onChange={(e) => setWorkflowData(prev => ({
                  ...prev,
                  history: { ...prev.history, presenting_illness: e.target.value }
                }))}
                className="h-24"
                placeholder="Describe the current illness..."
              />
            </div>
            
            <div>
              <Label>Upload Past Records (PDF, Images)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-600">Click to upload documents</p>
                </label>
              </div>
              {workflowData.documents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {workflowData.documents.map((doc, idx) => (
                    <div key={idx} className="text-xs bg-green-50 p-2 rounded">
                      ✓ {doc.file_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Start Visit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}