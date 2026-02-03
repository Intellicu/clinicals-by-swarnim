import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, FileText, Activity, History, TrendingUp, 
  Pill, Download, Share2, Printer
} from 'lucide-react';
import PrescriptionWriter from './PrescriptionWriter';
import MonitoringTrendsChart from '../monitoring/MonitoringTrendsChart';

export default function AppointmentView({ patient, onClose }) {
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

  if (!patient) return null;

  const latestVisit = visits[0];
  const recentLogs = dailyLogs.slice(0, 7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Patient Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{patient.patient_name}</h1>
                    <p className="text-blue-100">CR# {patient.cr_number}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>{patient.age_years} years • {patient.gender}</span>
                  <span>📱 {patient.mobile_number}</span>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-white/20 text-white mb-2">{patient.diagnosis}</Badge>
                <div className="text-sm text-blue-100">Status: {patient.status}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Column - Patient Info */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="history">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                <TabsTrigger value="labs">Lab Reports</TabsTrigger>
                <TabsTrigger value="records">Records</TabsTrigger>
              </TabsList>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5 text-purple-600" />
                      Visit History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {visits.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">No previous visits</p>
                    ) : (
                      <div className="space-y-3">
                        {visits.slice(0, 5).map(visit => (
                          <div key={visit.id} className="bg-slate-50 rounded-lg p-4 border">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-semibold text-sm">{visit.visit_type}</div>
                                <div className="text-xs text-slate-500">
                                  {new Date(visit.visit_date).toLocaleDateString()}
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
                              <p className="text-xs text-slate-600">
                                <strong>Plan:</strong> {visit.treatment_plan}
                              </p>
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
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm text-green-900">Active Monitoring</div>
                              <div className="text-xs text-green-700">{monitoringPlan.diagnosis}</div>
                            </div>
                            <Badge className="bg-green-600">{recentLogs.length} logs (7d)</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      <MonitoringTrendsChart logs={dailyLogs} parameterType="Urine_Protein" />
                      <MonitoringTrendsChart logs={dailyLogs} parameterType="Weight" />
                    </>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No active monitoring plan</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="labs">
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Lab reports will appear here</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="records">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.scanned_files?.length > 0 ? (
                      <div className="space-y-2">
                        {patient.scanned_files.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">{file.file_type}</span>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-8">No records uploaded</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full bg-blue-600"
                  onClick={() => setShowPrescription(true)}
                >
                  <Pill className="w-4 h-4 mr-2" />
                  Write Prescription
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Add Visit Note
                </Button>
                <Button variant="outline" className="w-full">
                  <Activity className="w-4 h-4 mr-2" />
                  View Vitals
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Visits</span>
                  <Badge variant="outline">{visits.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Monitoring Logs</span>
                  <Badge variant="outline">{dailyLogs.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Last Visit</span>
                  <span className="text-xs text-slate-500">
                    {latestVisit ? new Date(latestVisit.visit_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {showPrescription && (
          <PrescriptionWriter 
            patient={patient}
            onClose={() => setShowPrescription(false)}
          />
        )}
      </div>
    </div>
  );
}