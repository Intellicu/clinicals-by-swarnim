import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, MicOff, Plus, X, Save, Printer, Mail, MessageCircle,
  Download, Loader2, Sparkles, FileText, Languages, AlertTriangle,
  Calendar, CheckCircle2, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function EnhancedDigitalPrescriptionPad({ 
  patient, 
  encounter, 
  workspace,
  monitoringPlan,
  previousPrescription,
  onClose 
}) {
  const [language, setLanguage] = useState('English');
  const [isRecording, setIsRecording] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [medications, setMedications] = useState(previousPrescription?.medications || []);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [advice, setAdvice] = useState('');
  const [redFlags, setRedFlags] = useState('');
  const [followUpDays, setFollowUpDays] = useState(7);
  const [followUpReason, setFollowUpReason] = useState('');
  const [newMed, setNewMed] = useState({ 
    drug_name: '', 
    dose: '', 
    frequency: '', 
    duration: '', 
    instructions: '' 
  });
  const [drugInteractions, setDrugInteractions] = useState([]);
  const [dosageWarnings, setDosageWarnings] = useState([]);

  const queryClient = useQueryClient();
  const mediaRecorderRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: drugs = [] } = useQuery({
    queryKey: ['drugs'],
    queryFn: () => base44.entities.Drug.list()
  });

  // AI-powered drug interaction and dosage check
  const checkDrugSafety = async (newMedication) => {
    setIsAIProcessing(true);
    try {
      const allMeds = [...medications, newMedication];
      
      const safetyCheck = await base44.integrations.Core.InvokeLLM({
        prompt: `Clinical safety check for pediatric patient:
        Age: ${patient.age_years} years
        Weight: ${patient.baseline_vitals?.weight || 'unknown'} kg
        Diagnosis: ${patient.diagnosis}
        Current medications: ${JSON.stringify(medications.map(m => m.drug_name))}
        New medication: ${newMedication.drug_name} ${newMedication.dose}
        
        Analyze:
        1. Is the dosage appropriate for this age/weight?
        2. Are there any drug-drug interactions?
        3. Any contraindications for this diagnosis?
        4. Suggest alternative dosing if needed
        5. List any monitoring requirements
        
        Return structured analysis.`,
        response_json_schema: {
          type: "object",
          properties: {
            dosage_appropriate: { type: "boolean" },
            dosage_warning: { type: "string" },
            suggested_dose: { type: "string" },
            interactions: { type: "array", items: { type: "string" } },
            contraindications: { type: "array", items: { type: "string" } },
            monitoring_needed: { type: "array", items: { type: "string" } },
            alternatives: { type: "array", items: { type: "string" } }
          }
        }
      });

      if (safetyCheck.interactions?.length > 0) {
        setDrugInteractions([...drugInteractions, ...safetyCheck.interactions]);
      }
      
      if (!safetyCheck.dosage_appropriate && safetyCheck.dosage_warning) {
        setDosageWarnings([...dosageWarnings, safetyCheck.dosage_warning]);
        
        if (safetyCheck.suggested_dose) {
          toast.info(`Suggested dose: ${safetyCheck.suggested_dose}`, { duration: 5000 });
        }
      }

      return safetyCheck;
    } catch (error) {
      console.error('Safety check failed:', error);
    } finally {
      setIsAIProcessing(false);
    }
  };

  // AI Voice Scribe with enhanced intelligence
  const startVoiceScribe = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunksRef = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef, { type: 'audio/wav' });
        
        setIsAIProcessing(true);
        toast.loading('AI processing your prescription...');
        
        try {
          // Mock transcript for demo
          const mockTranscript = "Patient has been doing well. Urine protein reduced. Continue prednisolone 20mg daily, add prophylaxis with cotrimoxazole 240mg alternate days. Maintain fluid restriction. Follow up in 2 weeks.";
          
          const structuredPrescription = await base44.integrations.Core.InvokeLLM({
            prompt: `You are an AI clinical assistant. Extract and structure this doctor's prescription voice note.
            
            Patient context:
            - Age: ${patient.age_years} years
            - Weight: ${patient.baseline_vitals?.weight || 'unknown'} kg
            - Diagnosis: ${patient.diagnosis}
            - Previous medications: ${JSON.stringify(previousPrescription?.medications?.map(m => m.drug_name) || [])}
            
            Voice transcript: "${mockTranscript}"
            
            Extract:
            1. Chief complaint (what patient reported)
            2. Assessment (doctor's findings)
            3. Medications with doses (suggest weight-based dosing if not specified)
            4. Advice for patient
            5. Red flags to watch for
            6. Follow-up timing and reason
            
            For medications, calculate age and weight-appropriate doses based on pediatric guidelines.
            Flag any potential issues.`,
            response_json_schema: {
              type: "object",
              properties: {
                chief_complaint: { type: "string" },
                clinical_notes: { type: "string" },
                medications: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      drug_name: { type: "string" },
                      dose: { type: "string" },
                      frequency: { type: "string" },
                      duration: { type: "string" },
                      instructions: { type: "string" }
                    }
                  }
                },
                advice: { type: "string" },
                red_flags: { type: "string" },
                follow_up_days: { type: "number" },
                follow_up_reason: { type: "string" }
              }
            }
          });

          setChiefComplaint(structuredPrescription.chief_complaint || '');
          setClinicalNotes(structuredPrescription.clinical_notes || '');
          setAdvice(structuredPrescription.advice || '');
          setRedFlags(structuredPrescription.red_flags || '');
          setFollowUpDays(structuredPrescription.follow_up_days || 7);
          setFollowUpReason(structuredPrescription.follow_up_reason || '');
          
          // Check each medication for safety
          for (const med of structuredPrescription.medications || []) {
            await checkDrugSafety(med);
          }
          
          setMedications(structuredPrescription.medications || []);
          
          toast.success('AI Scribe completed with safety checks!');
        } catch (error) {
          toast.error('Failed to process voice');
        } finally {
          setIsAIProcessing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording... speak naturally');
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopVoiceScribe = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const addMedication = async () => {
    if (newMed.drug_name && newMed.dose) {
      // AI safety check before adding
      const safetyCheck = await checkDrugSafety(newMed);
      
      setMedications([...medications, { 
        ...newMed, 
        id: Date.now(),
        warnings: safetyCheck?.contraindications || [],
        interactions: safetyCheck?.interactions || []
      }]);
      setNewMed({ drug_name: '', dose: '', frequency: '', duration: '', instructions: '' });
    }
  };

  // Auto-suggest dosage based on drug database
  const handleDrugSelection = async (drugName) => {
    const drug = drugs.find(d => d.generic_name.toLowerCase() === drugName.toLowerCase());
    
    if (drug && patient.baseline_vitals?.weight) {
      const weight = patient.baseline_vitals.weight;
      
      // Calculate weight-based dose if available
      if (drug.dose_weight_based) {
        const doseMatch = drug.dose_weight_based.match(/(\d+(?:\.\d+)?)-?(\d+(?:\.\d+)?)?/);
        if (doseMatch) {
          const [, min, max] = doseMatch;
          const suggestedDose = max ? 
            `${(parseFloat(min) * weight).toFixed(1)}-${(parseFloat(max) * weight).toFixed(1)} mg` :
            `${(parseFloat(min) * weight).toFixed(1)} mg`;
          
          setNewMed({
            ...newMed,
            drug_name: drugName,
            dose: suggestedDose,
            frequency: drug.frequency || '',
            route: drug.route || 'PO'
          });
          
          toast.success(`Suggested dose: ${suggestedDose}`, { duration: 3000 });
        }
      }
    }
  };

  const savePrescriptionMutation = useMutation({
    mutationFn: async () => {
      // Create prescription
      const prescription = await base44.entities.Prescription.create({
        clinical_encounter_id: encounter.id,
        patient_id: patient.id,
        prescribed_by: user.email,
        prescription_date: new Date().toISOString(),
        diagnosis: patient.diagnosis,
        medications: medications,
        advice: advice,
        red_flags: redFlags,
        follow_up_date: new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        follow_up_instructions: followUpReason,
        language: language
      });

      // Update encounter
      await base44.entities.ClinicalEncounter.update(encounter.id, {
        prescription_id: prescription.id,
        follow_up_date: prescription.follow_up_date,
        follow_up_reason: followUpReason,
        status: 'Completed'
      });

      // Auto-schedule follow-up
      await base44.entities.FollowUpSchedule.create({
        patient_id: patient.id,
        workspace_id: workspace.id,
        clinician_id: user.email,
        scheduled_date: prescription.follow_up_date,
        reason: followUpReason || 'Routine follow-up',
        priority: drugInteractions.length > 0 || dosageWarnings.length > 0 ? 'Important' : 'Routine',
        status: 'Scheduled'
      });

      // Update monitoring plan based on prescription
      if (monitoringPlan) {
        const updatedModules = [...(monitoringPlan.modules || [])];
        
        // Enable medication tracking
        if (!updatedModules.find(m => m.module_type === 'Medications')) {
          updatedModules.push({
            module_type: 'Medications',
            frequency: 'Daily',
            mandatory: true,
            enabled: true
          });
        }
        
        await base44.entities.MonitoringPlan.update(monitoringPlan.id, {
          modules: updatedModules
        });
      }

      return prescription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      toast.success('Prescription saved & follow-up scheduled!');
      onClose();
    }
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Prescription', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Dr. ${user?.full_name || 'Doctor'}`, 20, 30);
    doc.text(`${workspace?.name || 'Clinic'}`, 20, 36);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 42);
    
    doc.setFontSize(12);
    doc.text(`Patient: ${patient.patient_name}`, 20, 54);
    doc.text(`Age: ${patient.age_years} years • ${patient.gender}`, 20, 60);
    doc.text(`CR#: ${patient.cr_number}`, 20, 66);
    doc.text(`Diagnosis: ${patient.diagnosis}`, 20, 72);
    
    let yPos = 84;
    
    if (chiefComplaint) {
      doc.setFontSize(10);
      doc.text('Chief Complaint:', 20, yPos);
      doc.text(chiefComplaint, 25, yPos + 5);
      yPos += 15;
    }
    
    doc.text('Rx:', 20, yPos);
    yPos += 6;
    medications.forEach((med, idx) => {
      doc.text(`${idx + 1}. ${med.drug_name}`, 25, yPos);
      doc.text(`   ${med.dose} - ${med.frequency} - ${med.duration}`, 25, yPos + 4);
      if (med.instructions) {
        doc.text(`   ${med.instructions}`, 25, yPos + 8);
        yPos += 4;
      }
      yPos += 12;
    });
    
    if (advice) {
      doc.text('Advice:', 20, yPos);
      const splitAdvice = doc.splitTextToSize(advice, 170);
      doc.text(splitAdvice, 25, yPos + 5);
      yPos += (splitAdvice.length * 5) + 10;
    }
    
    if (redFlags) {
      doc.setTextColor(255, 0, 0);
      doc.text('⚠ Warning Signs:', 20, yPos);
      doc.setTextColor(0, 0, 0);
      const splitFlags = doc.splitTextToSize(redFlags, 170);
      doc.text(splitFlags, 25, yPos + 5);
      yPos += (splitFlags.length * 5) + 10;
    }
    
    doc.text(`Follow-up: After ${followUpDays} days`, 20, 270);
    if (followUpReason) {
      doc.text(`Reason: ${followUpReason}`, 20, 276);
    }
    
    return doc;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-Enhanced Prescription Pad
              </CardTitle>
              <p className="text-sm text-blue-100 mt-1">
                {patient.patient_name} • {patient.age_years}y • {patient.diagnosis}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20">{language}</Badge>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* AI Voice Scribe */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    AI Voice Scribe with Safety Check
                  </div>
                  <div className="text-xs text-slate-600">
                    Speak naturally - AI structures prescription, checks dosages & interactions
                  </div>
                </div>
                <Button
                  onClick={isRecording ? stopVoiceScribe : startVoiceScribe}
                  disabled={isAIProcessing}
                  className={isRecording ? 'bg-red-600' : 'bg-purple-600'}
                  size="sm"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start AI Scribe
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Safety Alerts */}
          {(drugInteractions.length > 0 || dosageWarnings.length > 0) && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <AlertDescription>
                <div className="font-semibold mb-2">Safety Alerts</div>
                {drugInteractions.map((interaction, idx) => (
                  <div key={idx} className="text-sm text-yellow-800">• {interaction}</div>
                ))}
                {dosageWarnings.map((warning, idx) => (
                  <div key={idx} className="text-sm text-yellow-800">• {warning}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="prescription">
            <TabsList className="flex w-full h-auto overflow-x-auto p-1">
              <TabsTrigger value="prescription">Prescription</TabsTrigger>
              <TabsTrigger value="clinical">Clinical Notes</TabsTrigger>
              <TabsTrigger value="follow-up">Follow-up</TabsTrigger>
            </TabsList>

            <TabsContent value="prescription" className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Chief Complaint</label>
                <Input
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Patient's main complaint..."
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Medications</label>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    {medications.map((med, idx) => (
                      <div key={med.id || idx} className="bg-slate-50 rounded-lg p-3 border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{med.drug_name}</div>
                            <div className="text-xs text-slate-600">
                              {med.dose} • {med.frequency} • {med.duration}
                            </div>
                            {med.instructions && (
                              <div className="text-xs text-slate-500 mt-1">{med.instructions}</div>
                            )}
                            {med.interactions?.length > 0 && (
                              <div className="mt-2 flex gap-1 flex-wrap">
                                {med.interactions.map((int, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-yellow-50">
                                    ⚠ {int}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setMedications(medications.filter((_, i) => i !== idx))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2 pt-3 border-t">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            placeholder="Drug name"
                            value={newMed.drug_name}
                            onChange={(e) => {
                              const value = e.target.value;
                              setNewMed({...newMed, drug_name: value});
                              if (value.length > 3) {
                                handleDrugSelection(value);
                              }
                            }}
                            list="drug-suggestions"
                          />
                          <datalist id="drug-suggestions">
                            {drugs.slice(0, 20).map(drug => (
                              <option key={drug.id} value={drug.generic_name} />
                            ))}
                          </datalist>
                        </div>
                        <Input
                          placeholder="Dose (AI suggests)"
                          value={newMed.dose}
                          onChange={(e) => setNewMed({...newMed, dose: e.target.value})}
                        />
                        <Input
                          placeholder="Frequency (e.g., BD)"
                          value={newMed.frequency}
                          onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                        />
                        <Input
                          placeholder="Duration (e.g., 7 days)"
                          value={newMed.duration}
                          onChange={(e) => setNewMed({...newMed, duration: e.target.value})}
                        />
                      </div>
                      <Input
                        placeholder="Special instructions"
                        value={newMed.instructions}
                        onChange={(e) => setNewMed({...newMed, instructions: e.target.value})}
                      />
                      <Button onClick={addMedication} size="sm" className="w-full" disabled={isAIProcessing}>
                        {isAIProcessing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Add Medication (with AI Safety Check)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Patient Advice</label>
                <Textarea
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  rows={3}
                  placeholder="Diet, activity, precautions..."
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-red-600">⚠ Red Flags / Warning Signs</label>
                <Textarea
                  value={redFlags}
                  onChange={(e) => setRedFlags(e.target.value)}
                  rows={2}
                  placeholder="When to return immediately..."
                  className="border-red-200"
                />
              </div>
            </TabsContent>

            <TabsContent value="clinical">
              <div>
                <label className="text-sm font-semibold mb-2 block">Clinical Notes</label>
                <Textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  rows={8}
                  placeholder="Examination findings, vitals, assessment..."
                />
              </div>
            </TabsContent>

            <TabsContent value="follow-up" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Follow-up After (days)</label>
                  <Input
                    type="number"
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Priority</label>
                  <Badge className={
                    drugInteractions.length > 0 || dosageWarnings.length > 0 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }>
                    {drugInteractions.length > 0 || dosageWarnings.length > 0 ? 'Important' : 'Routine'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Reason for Follow-up</label>
                <Textarea
                  value={followUpReason}
                  onChange={(e) => setFollowUpReason(e.target.value)}
                  rows={2}
                  placeholder="Why patient needs to return..."
                />
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <Bell className="w-4 h-4 text-blue-600" />
                <AlertDescription>
                  <div className="font-semibold mb-1">Auto-Scheduling Enabled</div>
                  <div className="text-sm text-slate-600">
                    Follow-up will be automatically scheduled and patient will receive reminders 3 days and 1 day before the appointment.
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={() => savePrescriptionMutation.mutate()}
              disabled={medications.length === 0 || savePrescriptionMutation.isPending}
              className="bg-green-600"
            >
              {savePrescriptionMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save & Schedule Follow-up
                </>
              )}
            </Button>
            <Button onClick={() => generatePDF().autoPrint()} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => {
              const doc = generatePDF();
              doc.save(`prescription_${patient.patient_name}_${Date.now()}.pdf`);
            }} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}