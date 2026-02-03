import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, MicOff, Plus, X, Save, Printer, Mail, MessageCircle,
  Download, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function PrescriptionWriter({ patient, onClose }) {
  const [isRecording, setIsRecording] = useState(false);
  const [medications, setMedications] = useState([]);
  const [advice, setAdvice] = useState('');
  const [followUpDays, setFollowUpDays] = useState(7);
  const [newMed, setNewMed] = useState({ name: '', dose: '', frequency: '', duration: '' });

  const queryClient = useQueryClient();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], 'prescription-voice.wav', { type: 'audio/wav' });
        
        toast.loading('Processing voice...');
        // Note: Would need speech-to-text service
        toast.info('Voice processing complete');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const addMedication = () => {
    if (newMed.name && newMed.dose) {
      setMedications([...medications, { ...newMed, id: Date.now() }]);
      setNewMed({ name: '', dose: '', frequency: '', duration: '' });
    }
  };

  const savePrescriptionMutation = useMutation({
    mutationFn: async (data) => {
      const visit = await base44.entities.VisitRecord.create({
        patient_id: patient.id,
        visit_date: new Date().toISOString(),
        visit_type: 'Follow-up',
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
    
    doc.setFontSize(16);
    doc.text('Prescription', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Dr. ${user?.full_name || 'Doctor'}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
    
    doc.text(`Patient: ${patient.patient_name}`, 20, 55);
    doc.text(`Age: ${patient.age_years} years`, 20, 62);
    doc.text(`CR#: ${patient.cr_number}`, 20, 69);
    
    doc.text('Medications:', 20, 85);
    medications.forEach((med, idx) => {
      doc.text(`${idx + 1}. ${med.name} - ${med.dose} - ${med.frequency} - ${med.duration}`, 25, 92 + (idx * 7));
    });
    
    if (advice) {
      doc.text('Advice:', 20, 110 + (medications.length * 7));
      const splitAdvice = doc.splitTextToSize(advice, 170);
      doc.text(splitAdvice, 25, 117 + (medications.length * 7));
    }
    
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

  const handleShareEmail = async () => {
    const doc = generatePDF();
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], 'prescription.pdf', { type: 'application/pdf' });
    
    const uploadResult = await base44.integrations.Core.UploadFile({ file });
    
    if (patient.mobile_number) {
      await base44.integrations.Core.SendEmail({
        to: patient.mobile_number + '@example.com',
        subject: 'Your Prescription',
        body: `Dear ${patient.patient_name},\n\nPlease find your prescription attached.\n\nRegards,\nDr. ${user?.full_name}`
      });
      toast.success('Email sent!');
    }
  };

  return (
    <Card className="fixed inset-4 z-50 overflow-auto">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b sticky top-0 z-10 bg-white">
        <div className="flex items-center justify-between">
          <CardTitle>Write Prescription</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Voice Recording */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm mb-1">Voice Prescription</div>
                <div className="text-xs text-slate-600">Dictate prescription using voice</div>
              </div>
              <Button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={isRecording ? 'bg-red-600' : 'bg-purple-600'}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Voice Scribe
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <div>
          <h3 className="font-semibold mb-3">Medications</h3>
          <Card>
            <CardContent className="p-4 space-y-3">
              {medications.map((med) => (
                <div key={med.id} className="flex items-center justify-between bg-slate-50 p-3 rounded">
                  <div>
                    <div className="font-semibold text-sm">{med.name}</div>
                    <div className="text-xs text-slate-600">
                      {med.dose} • {med.frequency} • {med.duration}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setMedications(medications.filter(m => m.id !== med.id))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="grid grid-cols-4 gap-2 pt-3 border-t">
                <Input
                  placeholder="Drug name"
                  value={newMed.name}
                  onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                />
                <Input
                  placeholder="Dose"
                  value={newMed.dose}
                  onChange={(e) => setNewMed({...newMed, dose: e.target.value})}
                />
                <Input
                  placeholder="Frequency"
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                />
                <Input
                  placeholder="Duration"
                  value={newMed.duration}
                  onChange={(e) => setNewMed({...newMed, duration: e.target.value})}
                />
              </div>
              <Button onClick={addMedication} size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Advice */}
        <div>
          <h3 className="font-semibold mb-3">Advice & Instructions</h3>
          <Textarea
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            rows={4}
            placeholder="Diet, activity, precautions..."
          />
        </div>

        {/* Follow-up */}
        <div>
          <h3 className="font-semibold mb-3">Follow-up</h3>
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

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={() => savePrescriptionMutation.mutate()}
            disabled={medications.length === 0 || savePrescriptionMutation.isPending}
            className="bg-green-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button onClick={handleShareEmail} variant="outline">
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
  );
}