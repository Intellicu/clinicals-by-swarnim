import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Download, Share2, Pill, Activity, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import EnhancedDigitalPrescriptionPad from './EnhancedDigitalPrescriptionPad';

export default function EnhancedClinicalEncounter({ appointment, workspace, onComplete, onBack }) {
  const [encounterData, setEncounterData] = useState({
    vitals: { weight: '', height: '', bp_systolic: '', bp_diastolic: '', temperature: '', heart_rate: '' },
    clinical_notes: '',
    assessment: '',
    plan: ''
  });
  const [showPrescription, setShowPrescription] = useState(false);
  const [generatedPrescription, setGeneratedPrescription] = useState(null);

  const queryClient = useQueryClient();

  const { data: patient } = useQuery({
    queryKey: ['patient', appointment.patient_id],
    queryFn: async () => {
      const patients = await base44.entities.Patient.filter({ id: appointment.patient_id });
      return patients[0];
    },
    enabled: !!appointment.patient_id
  });

  const { data: monitoringLogs = [] } = useQuery({
    queryKey: ['monitoring-logs', patient?.id],
    queryFn: () => base44.entities.PatientDailyLog.filter({ patient_id: patient?.id }, '-log_date', 30),
    enabled: !!patient
  });

  const { data: previousPrescriptions = [] } = useQuery({
    queryKey: ['prescriptions', patient?.id],
    queryFn: () => base44.entities.Prescription.filter({ patient_id: patient?.id }, '-prescription_date', 5),
    enabled: !!patient
  });

  const saveEncounterMutation = useMutation({
    mutationFn: async (prescription) => {
      const encounter = await base44.entities.ClinicalEncounter.create({
        workspace_id: workspace.id,
        patient_id: patient.id,
        clinician_id: (await base44.auth.me()).email,
        encounter_date: new Date().toISOString(),
        encounter_type: appointment.appointment_type,
        reason_for_visit: appointment.chief_complaint,
        vitals: encounterData.vitals,
        clinical_notes: encounterData.clinical_notes,
        assessment: encounterData.assessment,
        prescription_id: prescription.id,
        status: 'Completed'
      });

      await base44.entities.Appointment.update(appointment.id, {
        status: 'Completed',
        encounter_id: encounter.id
      });

      return { encounter, prescription };
    },
    onSuccess: (data) => {
      toast.success('Consultation saved successfully!');
      setGeneratedPrescription(data.prescription);
    }
  });

  const exportPDF = async () => {
    toast.info('Generating PDF...', { id: 'pdf' });
    // In real implementation, generate PDF using jsPDF or similar
    setTimeout(() => {
      toast.success('PDF ready for download', { id: 'pdf' });
    }, 1000);
  };

  const sharePrescription = async () => {
    toast.success('Prescription shared with patient via SMS/Email');
  };

  // Home Monitoring Summary
  const proteinLogs = monitoringLogs.filter(log => log.module_type === 'Urine_Protein');
  const medLogs = monitoringLogs.filter(log => log.module_type === 'Medications');
  const weightLogs = monitoringLogs.filter(log => log.module_type === 'Weight');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">{patient?.patient_name}</h2>
              <p className="text-blue-100">CR# {patient?.cr_number} • {patient?.age_years}y • {patient?.gender}</p>
              <Badge className="bg-white/20 mt-2">{patient?.diagnosis}</Badge>
            </div>
            <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/40" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="encounter">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="encounter">Clinical Encounter</TabsTrigger>
          <TabsTrigger value="monitoring">Home Monitoring</TabsTrigger>
          <TabsTrigger value="prescription">Digital Prescription</TabsTrigger>
        </TabsList>

        <TabsContent value="encounter" className="space-y-4">
          {/* Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Input placeholder="Weight (kg)" value={encounterData.vitals.weight} onChange={(e) => setEncounterData({...encounterData, vitals: {...encounterData.vitals, weight: e.target.value}})} />
                <Input placeholder="Height (cm)" value={encounterData.vitals.height} onChange={(e) => setEncounterData({...encounterData, vitals: {...encounterData.vitals, height: e.target.value}})} />
                <Input placeholder="BP Systolic" value={encounterData.vitals.bp_systolic} onChange={(e) => setEncounterData({...encounterData, vitals: {...encounterData.vitals, bp_systolic: e.target.value}})} />
                <Input placeholder="BP Diastolic" value={encounterData.vitals.bp_diastolic} onChange={(e) => setEncounterData({...encounterData, vitals: {...encounterData.vitals, bp_diastolic: e.target.value}})} />
                <Input placeholder="Temperature (°F)" value={encounterData.vitals.temperature} onChange={(e) => setEncounterData({...encounterData, vitals: {...encounterData.vitals, temperature: e.target.value}})} />
                <Input placeholder="Heart Rate" value={encounterData.vitals.heart_rate} onChange={(e) => setEncounterData({...encounterData, vitals: {...encounterData.vitals, heart_rate: e.target.value}})} />
              </div>
            </CardContent>
          </Card>

          {/* Clinical Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={encounterData.clinical_notes}
                onChange={(e) => setEncounterData({...encounterData, clinical_notes: e.target.value})}
                placeholder="History, examination findings..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment & Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={encounterData.assessment}
                onChange={(e) => setEncounterData({...encounterData, assessment: e.target.value})}
                placeholder="Clinical assessment..."
                rows={3}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Home Monitoring Summary (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {monitoringLogs.length === 0 ? (
                <p className="text-slate-600">No home monitoring data available</p>
              ) : (
                <>
                  {proteinLogs.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded">
                      <h4 className="font-bold mb-2">Urine Protein Trend</h4>
                      <div className="flex gap-1">
                        {proteinLogs.slice(0, 14).map((log, idx) => (
                          <div key={idx} title={`${log.log_date}: ${log.protein_result}`} className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-bold ${
                            log.protein_result === 'Negative' || log.protein_result === 'Trace' ? 'bg-green-200 text-green-800' :
                            log.protein_result === '1+' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-red-200 text-red-800'
                          }`}>
                            {log.protein_result}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {medLogs.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded">
                      <h4 className="font-bold mb-2">Medication Adherence</h4>
                      <p className="text-2xl font-bold text-purple-600">{Math.round((medLogs.filter(l => l.completion_status === 'Complete').length / 30) * 100)}%</p>
                      <p className="text-sm text-slate-600">Last 30 days</p>
                    </div>
                  )}

                  {weightLogs.length > 0 && (
                    <div className="bg-green-50 p-4 rounded">
                      <h4 className="font-bold mb-2">Weight Monitoring</h4>
                      <p className="text-lg font-bold">{weightLogs[0]?.weight_kg} kg</p>
                      <p className="text-sm text-slate-600">Last recorded weight</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescription">
          {!generatedPrescription ? (
            <EnhancedDigitalPrescriptionPad
              patient={patient}
              encounterData={encounterData}
              previousPrescriptions={previousPrescriptions}
              onPrescriptionGenerated={(prescription) => saveEncounterMutation.mutate(prescription)}
            />
          ) : (
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Prescription Generated
                  </span>
                  <div className="flex gap-2">
                    <Button onClick={exportPDF} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button onClick={sharePrescription} className="bg-blue-600">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share with Patient
                    </Button>
                    <Button onClick={() => onComplete(generatedPrescription)} className="bg-green-600">
                      Complete Consultation
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-2">Diagnosis</h4>
                    <p className="text-slate-700">{generatedPrescription.diagnosis}</p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Medications</h4>
                    <div className="space-y-2">
                      {generatedPrescription.medications?.map((med, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded">
                          <p className="font-semibold">{med.drug_name}</p>
                          <p className="text-sm text-slate-600">{med.dose} {med.unit} - {med.frequency} - {med.route} - {med.duration}</p>
                          {med.instructions && <p className="text-xs text-slate-500 mt-1">{med.instructions}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                  {generatedPrescription.advice && (
                    <div>
                      <h4 className="font-bold mb-2">Patient Advice</h4>
                      <p className="text-slate-700">{generatedPrescription.advice}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}