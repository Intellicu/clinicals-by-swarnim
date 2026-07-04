import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload, Loader2, CheckCircle2, User, FileText, Pencil, Calendar, ChevronRight, X, Image } from 'lucide-react';

const TYPE_ICONS = { ocr: Camera, doc: FileText, manual: Pencil };
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

const STEPS = ['Upload Docs', 'Patient Details', 'Book Appointment'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={step}>
            <div className={`flex items-center gap-1.5 ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2
                ${active ? 'border-blue-600 bg-blue-50' : done ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-white'}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              <span className="text-xs font-medium hidden sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-200" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function PatientOnboarding({ workspaceId, onComplete }) {
  const [step, setStep] = useState(1);
  const [uploadMode, setUploadMode] = useState(null); // 'ocr' | 'doc' | 'manual'
  const [scanFile, setScanFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [createdPatient, setCreatedPatient] = useState(null);
  const [patientData, setPatientData] = useState({
    patient_name: '', mobile_number: '', age_years: '', gender: 'Male',
    address: '', diagnosis: '', notes: ''
  });
  const [apptData, setApptData] = useState({
    appointment_date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    appointment_time: '09:00',
    appointment_type: 'First Visit',
    doctor_name: '',
    chief_complaint: '',
    lab_report_url: '',
    vitals: { weight: '', height: '', bp_systolic: '', bp_diastolic: '', heart_rate: '' }
  });
  const [labFile, setLabFile] = useState(null);
  const [uploadingLab, setUploadingLab] = useState(false);

  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const handleDocExtract = async () => {
    if (!scanFile) return;
    setIsExtracting(true);
    const uploadResult = await base44.integrations.Core.UploadFile({ file: scanFile });
    const extracted = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract patient information from this medical record/document. Return: patient name, age (in years as number), gender (Male/Female/Other), mobile number, address, diagnosis, medical notes.`,
      file_urls: [uploadResult.file_url],
      response_json_schema: {
        type: "object",
        properties: {
          patient_name: { type: "string" }, age_years: { type: "number" },
          gender: { type: "string" }, mobile_number: { type: "string" },
          address: { type: "string" }, diagnosis: { type: "string" }, notes: { type: "string" }
        }
      }
    });
    setIsExtracting(false);
    setExtractedData(extracted);
    setPatientData(prev => ({ ...prev, ...extracted }));
    setStep(2);
    toast.success('Data extracted! Please review.');
  };

  const handleLabUpload = async (file) => {
    setUploadingLab(true);
    const res = await base44.integrations.Core.UploadFile({ file });
    setApptData(prev => ({ ...prev, lab_report_url: res.file_url }));
    setUploadingLab(false);
    toast.success('Lab report uploaded!');
  };

  const createPatientMutation = useMutation({
    mutationFn: async (data) => {
      const crNumber = `CR${Date.now().toString().slice(-6)}`;
      return base44.entities.Patient.create({ ...data, cr_number: crNumber, status: 'Active' });
    },
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient enrolled!');
      setCreatedPatient(patient);
      setStep(3);
    }
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: async () => {
      const dateTime = `${apptData.appointment_date}T${apptData.appointment_time}:00`;
      return base44.entities.Appointment.create({
        workspace_id: workspaceId,
        patient_id: createdPatient.id,
        patient_name: createdPatient.patient_name,
        appointment_date: dateTime,
        appointment_type: apptData.appointment_type,
        doctor_name: apptData.doctor_name,
        chief_complaint: apptData.chief_complaint,
        status: 'Scheduled',
        notes: JSON.stringify({
          lab_report_url: apptData.lab_report_url,
          vitals: apptData.vitals
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment booked!');
      onComplete?.(createdPatient);
    }
  });

  const set = (key, val) => setPatientData(prev => ({ ...prev, [key]: val }));
  const setVital = (key, val) => setApptData(prev => ({ ...prev, vitals: { ...prev.vitals, [key]: val } }));

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <StepIndicator current={step} />

      {/* STEP 1: Upload */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" /> How would you like to add the patient?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!uploadMode ? (
              <div className="grid gap-3">
                {[
                  { key: 'ocr', icon: Camera, label: 'Scan Photo (OCR)', desc: 'Take a photo of prescription/ID card', color: 'text-blue-600' },
                  { key: 'doc', icon: FileText, label: 'Upload Document / PDF', desc: 'Upload an existing PDF, image or document', color: 'text-purple-600' },
                  { key: 'manual', icon: Pencil, label: 'Enter Manually', desc: 'Type in patient details directly', color: 'text-green-600' },
                ].map(({ key, icon: IconComp, label, desc, color }) => (
                  <button key={key} onClick={() => { setUploadMode(key); if (key === 'manual') setStep(2); }}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-all">
                    <div className={`w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center ${color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={() => setUploadMode(null)} className="text-xs text-slate-500 flex items-center gap-1 hover:underline">
                  <X className="w-3 h-3" /> Change method
                </button>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                  <input type="file"
                    accept={uploadMode === 'ocr' ? 'image/*' : '*/*'}
                    capture={uploadMode === 'ocr' ? 'environment' : undefined}
                    id="doc-upload" className="hidden"
                    onChange={(e) => setScanFile(e.target.files[0])}
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer space-y-2 block">
                    <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-sm text-slate-600">{scanFile ? scanFile.name : uploadMode === 'ocr' ? 'Take photo or upload image' : 'Upload PDF, image, or document'}</p>
                    <Button variant="outline" type="button" size="sm">Select File</Button>
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleDocExtract} disabled={!scanFile || isExtracting} className="flex-1 bg-blue-600">
                    {isExtracting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Extracting...</> : <><CheckCircle2 className="w-4 h-4 mr-2" />Extract & Continue</>}
                  </Button>
                  <Button variant="outline" onClick={() => setStep(2)}>Skip →</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Patient Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Patient Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {extractedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-semibold">✓ Data extracted — review below</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Patient Name *</Label>
                <Input value={patientData.patient_name} onChange={e => set('patient_name', e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <Label className="text-xs">Mobile</Label>
                <Input value={patientData.mobile_number} onChange={e => set('mobile_number', e.target.value)} placeholder="Mobile" />
              </div>
              <div>
                <Label className="text-xs">Age (years)</Label>
                <Input type="number" value={patientData.age_years} onChange={e => set('age_years', Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Gender</Label>
                <Select value={patientData.gender} onValueChange={v => set('gender', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Address</Label>
                <Input value={patientData.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Primary Diagnosis</Label>
                <Input value={patientData.diagnosis} onChange={e => set('diagnosis', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Notes / History</Label>
                <Textarea value={patientData.notes} onChange={e => set('notes', e.target.value)} rows={2} />
              </div>
            </div>
            <div className="flex gap-3 pt-2 border-t">
              <Button onClick={() => setStep(1)} variant="outline" size="sm">Back</Button>
              <Button onClick={() => createPatientMutation.mutate(patientData)}
                disabled={!patientData.patient_name || createPatientMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700">
                {createPatientMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enroll Patient →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Book Appointment (optional) */}
      {step === 3 && createdPatient && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Book First Appointment
              <Badge className="bg-green-100 text-green-700 ml-auto text-xs">Optional</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              Patient <strong>{createdPatient.patient_name}</strong> enrolled. Book an appointment now (or skip).
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Date *</Label>
                <Input type="date" value={apptData.appointment_date}
                  onChange={e => setApptData(p => ({ ...p, appointment_date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Time *</Label>
                <Input type="time" value={apptData.appointment_time}
                  onChange={e => setApptData(p => ({ ...p, appointment_time: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={apptData.appointment_type} onValueChange={v => setApptData(p => ({ ...p, appointment_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['First Visit', 'Follow-up', 'Consultation', 'Procedure', 'Lab Review'].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Doctor</Label>
                <Input value={apptData.doctor_name} onChange={e => setApptData(p => ({ ...p, doctor_name: e.target.value }))} placeholder="Dr. Name" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Chief Complaint</Label>
                <Input value={apptData.chief_complaint} onChange={e => setApptData(p => ({ ...p, chief_complaint: e.target.value }))} />
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Pre-visit Vitals & Anthropometry</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { k: 'weight', label: 'Weight (kg)' }, { k: 'height', label: 'Height (cm)' },
                  { k: 'bp_systolic', label: 'BP Systolic' }, { k: 'bp_diastolic', label: 'BP Diastolic' },
                  { k: 'heart_rate', label: 'Heart Rate' }
                ].map(({ k, label }) => (
                  <div key={k}>
                    <Label className="text-xs">{label}</Label>
                    <Input type="number" placeholder="-" value={apptData.vitals[k]}
                      onChange={e => setVital(k, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3">
              <Label className="text-xs">Attach Lab Report</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="file" id="lab-file" className="hidden"
                  onChange={e => { setLabFile(e.target.files[0]); handleLabUpload(e.target.files[0]); }} />
                <label htmlFor="lab-file">
                  <Button variant="outline" size="sm" type="button" asChild>
                    <span>{uploadingLab ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
                      {labFile ? labFile.name : 'Upload Lab Report'}
                    </span>
                  </Button>
                </label>
                {apptData.lab_report_url && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => onComplete?.(createdPatient)} className="flex-1">
                Skip — Done
              </Button>
              <Button onClick={() => bookAppointmentMutation.mutate()}
                disabled={bookAppointmentMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700">
                {bookAppointmentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-1" />}
                Book Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}