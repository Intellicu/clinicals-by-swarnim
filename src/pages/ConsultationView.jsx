import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, FileText, Activity, TrendingUp, Pill, ArrowLeft,
  Menu, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import DigitalPrescriptionPad from '../components/clinic/DigitalPrescriptionPad';
import ClinicalToolsSidebar from '../components/clinic/ClinicalToolsSidebar';
import MonitoringTrendsChart from '../components/monitoring/MonitoringTrendsChart';

export default function ConsultationView() {
  const location = useLocation();
  const patient = location.state?.patient;
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);

  const { data: visits = [] } = useQuery({
    queryKey: ['patient-visits', patient?.id],
    queryFn: () => base44.entities.VisitRecord.filter({ patient_id: patient?.id }),
    enabled: !!patient
  });

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ['patient-logs', patient?.id],
    queryFn: () => base44.entities.PatientDailyLog.filter({ patient_id: patient?.id }),
    enabled: !!patient
  });

  const { data: monitoringPlan } = useQuery({
    queryKey: ['monitoring-plan', patient?.id],
    queryFn: async () => {
      const plans = await base44.entities.MonitoringPlan.filter({ 
        patient_id: patient?.id, 
        active: true 
      });
      return plans[0];
    },
    enabled: !!patient
  });

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Patient Selected</h2>
            <p className="text-slate-600 mb-4">Please select a patient to start consultation</p>
            <Link to={createPageUrl("ClinicHome")}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Clinic
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to={createPageUrl("ClinicHome")}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{patient.patient_name}</h1>
                  <p className="text-sm text-slate-600">
                    CR# {patient.cr_number} • {patient.age_years}y • {patient.gender}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setShowSidebar(!showSidebar)}
                  variant="outline"
                  className="lg:hidden"
                >
                  <Menu className="w-4 h-4" />
                </Button>
                <Button onClick={() => setShowPrescription(true)} className="bg-blue-600">
                  <Pill className="w-4 h-4 mr-2" />
                  Write Prescription
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Info Card */}
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Primary Diagnosis</p>
                  <p className="font-semibold">{patient.diagnosis || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Mobile</p>
                  <p className="font-semibold">{patient.mobile_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Status</p>
                  <Badge className="bg-white/20">{patient.status}</Badge>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total Visits</p>
                  <p className="font-semibold">{visits.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="history">Visit History</TabsTrigger>
              <TabsTrigger value="monitoring">Home Monitoring</TabsTrigger>
              <TabsTrigger value="labs">Lab Reports</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Previous Visits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {visits.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No previous visits recorded</p>
                  ) : (
                    <div className="space-y-3">
                      {visits.map(visit => (
                        <div key={visit.id} className="bg-slate-50 rounded-lg p-4 border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold">{visit.visit_type}</div>
                              <div className="text-xs text-slate-500">
                                {new Date(visit.visit_date).toLocaleDateString('en-IN')}
                              </div>
                            </div>
                            <Badge variant="outline">{visit.diagnosis}</Badge>
                          </div>
                          {visit.chief_complaint && (
                            <p className="text-sm text-slate-700 mb-2">
                              <strong>Complaint:</strong> {visit.chief_complaint}
                            </p>
                          )}
                          {visit.treatment_plan && (
                            <p className="text-sm text-slate-600">
                              <strong>Plan:</strong> {visit.treatment_plan}
                            </p>
                          )}
                          {visit.prescriptions && visit.prescriptions.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs font-semibold text-slate-700 mb-1">Medications:</p>
                              <div className="flex flex-wrap gap-1">
                                {visit.prescriptions.map((rx, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {rx.drug_name || rx.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring">
              <div className="space-y-4">
                {monitoringPlan ? (
                  <>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-green-900">Active Monitoring Plan</div>
                            <div className="text-sm text-green-700">{monitoringPlan.diagnosis}</div>
                          </div>
                          <Badge className="bg-green-600">{dailyLogs.length} logs</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <MonitoringTrendsChart logs={dailyLogs} parameterType="Urine_Protein" />
                    <MonitoringTrendsChart logs={dailyLogs} parameterType="Weight" />
                    <MonitoringTrendsChart logs={dailyLogs} parameterType="Blood_Pressure" />
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No active monitoring plan</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="labs">
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Lab reports will appear here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions">
              <Card>
                <CardHeader>
                  <CardTitle>Past Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {visits.filter(v => v.prescriptions?.length > 0).map(visit => (
                      <div key={visit.id} className="bg-slate-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-sm text-slate-600">
                            {new Date(visit.visit_date).toLocaleDateString('en-IN')}
                          </div>
                          <Button size="sm" variant="outline">View Full</Button>
                        </div>
                        <div className="space-y-2">
                          {visit.prescriptions.map((rx, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-semibold">{rx.drug_name || rx.name}</span>
                              {' - '}{rx.dose} - {rx.frequency} - {rx.duration}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Clinical Tools Sidebar */}
      <ClinicalToolsSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* Prescription Modal */}
      {showPrescription && (
        <DigitalPrescriptionPad
          patient={patient}
          onClose={() => setShowPrescription(false)}
        />
      )}
    </div>
  );
}