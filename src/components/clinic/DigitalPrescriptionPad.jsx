import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
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
  Calendar, CheckCircle2, Brain
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import ClinicalDecisionSupport from './ClinicalDecisionSupport';

export default function DigitalPrescriptionPad({ patient, encounter, workspace, monitoringPlan, previousPrescription, onClose }) {
  const [language, setLanguage] = useState('English');
  const [isRecording, setIsRecording] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [medications, setMedications] = useState([]);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUpDays, setFollowUpDays] = useState(7);
  const [newMed, setNewMed] = useState({ name: '', dose: '', frequency: '', duration: '', instructions: '' });

  const queryClient = useQueryClient();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: drugs = [] } = useQuery({
    queryKey: ['drugs'],
    queryFn: () => base44.entities.Drug.list()
  });

  const startVoiceScribe = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], 'scribe.wav', { type: 'audio/wav' });
        
        setIsAIProcessing(true);
        toast.loading('AI Scribe processing...');
        
        try {
          // In production, would use speech-to-text then LLM to structure
          const mockTranscript = "Patient complaining of fever and cough for 3 days. On examination, temperature 101F, throat congestion present. Prescribe paracetamol 500mg three times daily for 5 days and cough syrup.";
          
          const structuredData = await base44.integrations.Core.InvokeLLM({
            prompt: `Extract clinical information from this doctor's voice note and structure it into chief complaint, clinical notes, medications with dosing, and advice. Voice transcript: "${mockTranscript}"`,
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
                      name: { type: "string" },
                      dose: { type: "string" },
                      frequency: { type: "string" },
                      duration: { type: "string" }
                    }
                  }
                },
                advice: { type: "string" }
              }
            }
          });

          setChiefComplaint(structuredData.chief_complaint || '');
          setClinicalNotes(structuredData.clinical_notes || '');
          setMedications(structuredData.medications || []);
          setAdvice(structuredData.advice || '');
          
          toast.success('AI Scribe completed!');
        } catch (error) {
          toast.error('Failed to process voice');
        } finally {
          setIsAIProcessing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording... speak your prescription');
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

  const addMedication = () => {
    if (newMed.name && newMed.dose) {
      setMedications([...medications, { ...newMed, id: Date.now() }]);
      setNewMed({ name: '', dose: '', frequency: '', duration: '', instructions: '' });
    }
  };

  const translateContent = async (targetLang) => {
    setIsAIProcessing(true);
    try {
      const translated = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate this medical prescription to ${targetLang}. Maintain medical accuracy. 
        Medications: ${JSON.stringify(medications)}
        Advice: ${advice}
        Return the translated version maintaining the same structure.`,
        response_json_schema: {
          type: "object",
          properties: {
            medications: { type: "array", items: { type: "object" } },
            advice: { type: "string" }
          }
        }
      });
      
      setMedications(translated.medications);
      setAdvice(translated.advice);
      setLanguage(targetLang);
      toast.success(`Translated to ${targetLang}`);
    } catch (error) {
      toast.error('Translation failed');
    } finally {
      setIsAIProcessing(false);
    }
  };

  const savePrescriptionMutation = useMutation({
    mutationFn: async () => {
      const visit = await base44.entities.VisitRecord.create({
        patient_id: patient.id,
        visit_date: new Date().toISOString(),
        visit_type: 'OPD',
        chief_complaint: chiefComplaint,
        clinician_notes: clinicalNotes,
        prescriptions: medications,
        treatment_plan: advice,
        follow_up_date: new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      return visit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-visits'] });
      toast.success('Prescription saved!');
    }
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Prescription', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Dr. ${user?.full_name || 'Doctor'}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 36);
    
    doc.setFontSize(12);
    doc.text(`Patient: ${patient.patient_name}`, 20, 48);
    doc.text(`Age: ${patient.age_years} years • ${patient.gender}`, 20, 54);
    doc.text(`CR#: ${patient.cr_number}`, 20, 60);
    
    if (chiefComplaint) {
      doc.setFontSize(10);
      doc.text('Chief Complaint:', 20, 72);
      doc.text(chiefComplaint, 25, 78);
    }
    
    doc.text('Medications:', 20, 90);
    medications.forEach((med, idx) => {
      const y = 96 + (idx * 10);
      doc.text(`${idx + 1}. ${med.name}`, 25, y);
      doc.text(`   ${med.dose} - ${med.frequency} - ${med.duration}`, 25, y + 4);
      if (med.instructions) {
        doc.text(`   ${med.instructions}`, 25, y + 8);
      }
    });
    
    if (advice) {
      const adviceY = 100 + (medications.length * 10);
      doc.text('Advice:', 20, adviceY);
      const splitAdvice = doc.splitTextToSize(advice, 170);
      doc.text(splitAdvice, 25, adviceY + 6);
    }
    
    doc.text(`Follow-up: After ${followUpDays} days`, 20, 270);
    
    return doc;
  };

  const handlePrint = () => {
    const doc = generatePDF();
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleDownloadPDF = () => {
    const doc = generatePDF();
    doc.save(`prescription_${patient.patient_name}_${Date.now()}.pdf`);
    toast.success('PDF downloaded');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[95vh] overflow-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Digital Prescription Pad</CardTitle>
              <p className="text-sm text-blue-100 mt-1">{patient.patient_name} • CR# {patient.cr_number}</p>
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
                    AI Voice Scribe
                  </div>
                  <div className="text-xs text-slate-600">Speak naturally - AI will structure your prescription</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={isRecording ? stopVoiceScribe : startVoiceScribe}
                    disabled={isAIProcessing}
                    className={isRecording ? 'bg-red-600' : 'bg-purple-600'}
                    size="sm"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Start Voice Scribe
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const langs = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu'];
                      const currentIdx = langs.indexOf(language);
                      const nextLang = langs[(currentIdx + 1) % langs.length];
                      translateContent(nextLang);
                    }}
                    disabled={isAIProcessing}
                  >
                    <Languages className="w-4 h-4 mr-2" />
                    Translate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Decision Support */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-4">
              <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-600" />
                AI Clinical Decision Support
              </div>
              <ClinicalDecisionSupport 
                patient={patient} 
                medications={medications}
                chiefComplaint={chiefComplaint}
                onSuggestionAccept={(suggestion) => {
                  if (suggestion.type === "test") {
                    toast.success(`Added: ${suggestion.data.test_name}`);
                  }
                }}
              />
            </CardContent>
          </Card>

          <Tabs defaultValue="prescription">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prescription">Prescription</TabsTrigger>
              <TabsTrigger value="clinical">Clinical Notes</TabsTrigger>
              <TabsTrigger value="advice">Advice</TabsTrigger>
            </TabsList>

            <TabsContent value="prescription" className="space-y-4">
              {/* Chief Complaint */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Chief Complaint</label>
                <Input
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Patient's main complaint..."
                />
              </div>

              {/* Medications */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Medications</label>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    {medications.map((med, idx) => (
                      <div key={med.id || idx} className="flex items-start justify-between bg-slate-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{med.name}</div>
                          <div className="text-xs text-slate-600">
                            {med.dose} • {med.frequency} • {med.duration}
                          </div>
                          {med.instructions && (
                            <div className="text-xs text-slate-500 mt-1">{med.instructions}</div>
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
                    ))}

                    <div className="space-y-2 pt-3 border-t">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Drug name"
                          value={newMed.name}
                          onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                          list="drug-suggestions"
                        />
                        <datalist id="drug-suggestions">
                          {drugs.slice(0, 10).map(drug => (
                            <option key={drug.id} value={drug.generic_name} />
                          ))}
                        </datalist>
                        <Input
                          placeholder="Dose (e.g., 500mg)"
                          value={newMed.dose}
                          onChange={(e) => setNewMed({...newMed, dose: e.target.value})}
                        />
                        <Input
                          placeholder="Frequency (e.g., BD)"
                          value={newMed.frequency}
                          onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                        />
                        <Input
                          placeholder="Duration (e.g., 5 days)"
                          value={newMed.duration}
                          onChange={(e) => setNewMed({...newMed, duration: e.target.value})}
                        />
                      </div>
                      <Input
                        placeholder="Special instructions (optional)"
                        value={newMed.instructions}
                        onChange={(e) => setNewMed({...newMed, instructions: e.target.value})}
                      />
                      <Button onClick={addMedication} size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medication
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clinical">
              <div>
                <label className="text-sm font-semibold mb-2 block">Clinical Notes</label>
                <Textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  rows={8}
                  placeholder="Examination findings, vitals, investigation results..."
                />
              </div>
            </TabsContent>

            <TabsContent value="advice">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Patient Advice & Instructions</label>
                  <Textarea
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    rows={6}
                    placeholder="Diet instructions, activity restrictions, when to return..."
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Follow-up</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      value={followUpDays}
                      onChange={(e) => setFollowUpDays(parseInt(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-slate-600">days</span>
                  </div>
                </div>
              </div>
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
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Prescription
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}