import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, Search, AlertCircle, TrendingUp, FileText, ArrowLeft,
  CheckCircle2, Activity, Calendar, Download
} from 'lucide-react';
import MonitoringTrendsChart from '../components/monitoring/MonitoringTrendsChart';
import MonitoringAlerts from '../components/monitoring/MonitoringAlerts';
import { toast } from 'sonner';

export default function ClinicalDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-list'],
    queryFn: () => base44.entities.Patient.list('-updated_date')
  });

  const { data: monitoringPlans = [] } = useQuery({
    queryKey: ['monitoring-plans'],
    queryFn: () => base44.entities.MonitoringPlan.filter({ active: true })
  });

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ['daily-logs', selectedPatient?.id],
    queryFn: () => base44.entities.PatientDailyLog.filter({ 
      patient_id: selectedPatient?.id 
    }).then(logs => logs.sort((a, b) => new Date(b.log_date) - new Date(a.log_date))),
    enabled: !!selectedPatient
  });

  const getPlanForPatient = (patientId) => {
    return monitoringPlans.find(p => p.patient_id === patientId && p.active);
  };

  const getLatestProteinResult = (patientId) => {
    const proteinLogs = dailyLogs.filter(log => 
      log.patient_id === patientId && log.module_type === 'Urine_Protein'
    );
    return proteinLogs[0]?.protein_result || 'N/A';
  };

  const getComplianceStatus = (patientId) => {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = dailyLogs.filter(log => 
      log.patient_id === patientId && 
      new Date(log.log_date) >= last7Days &&
      log.completion_status === 'Complete'
    );
    const compliance = (recentLogs.length / 7) * 100;
    return compliance >= 80 ? 'Good' : compliance >= 50 ? 'Moderate' : 'Poor';
  };

  const proteinColorMap = {
    'Negative': 'bg-green-100 text-green-800',
    'Trace': 'bg-green-100 text-green-800',
    '1+': 'bg-yellow-100 text-yellow-800',
    '2+': 'bg-red-100 text-red-800',
    '3+': 'bg-red-100 text-red-800',
    '4+': 'bg-red-100 text-red-800'
  };

  const filteredPatients = patients.filter(p => 
    p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.cr_number?.includes(searchQuery)
  );

  if (selectedPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => setSelectedPatient(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patient List
          </Button>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {selectedPatient.patient_name}
                  </h2>
                  <div className="flex gap-3 flex-wrap">
                    <Badge variant="outline">{selectedPatient.age_years} years • {selectedPatient.gender}</Badge>
                    <Badge>{selectedPatient.diagnosis}</Badge>
                    <Badge className="bg-green-100 text-green-800">
                      {getComplianceStatus(selectedPatient.id)} Compliance
                    </Badge>
                  </div>
                </div>
                <Button className="bg-blue-600">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="diary">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="diary">Nephrotic Diary</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="records">Health Records</TabsTrigger>
              <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="diary">
              <div className="space-y-4 mb-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Monitoring Status</div>
                        <Badge className="bg-blue-600">Active Plan: {getPlanForPatient(selectedPatient.id)?.diagnosis}</Badge>
                      </div>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const plan = getPlanForPatient(selectedPatient.id);
                          if (!plan) return;
                          
                          const unreviewed = dailyLogs.filter(log => !log.clinician_reviewed);
                          for (const log of unreviewed) {
                            await base44.entities.PatientDailyLog.update(log.id, {
                              clinician_reviewed: true,
                              clinician_notes: `Reviewed on ${new Date().toLocaleDateString()}`
                            });
                          }
                          queryClient.invalidateQueries({ queryKey: ['daily-logs'] });
                          toast.success('All logs marked as reviewed');
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Mark All Reviewed
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <MonitoringAlerts logs={dailyLogs} monitoringPlan={getPlanForPatient(selectedPatient.id)} />
              </div>

              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Patient-Reported Data
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Non-editable after submission
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Urine Protein</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Prednisolone (mg)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Remarks</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyLogs
                          .filter(log => log.module_type === 'Urine_Protein' || log.module_type === 'Medications')
                          .slice(0, 30)
                          .map((log, idx) => (
                            <tr key={idx} className="border-b hover:bg-slate-50">
                              <td className="px-4 py-3 text-sm">
                                {new Date(log.log_date).toLocaleDateString('en-GB')}
                              </td>
                              <td className="px-4 py-3">
                                {log.protein_result && (
                                  <Badge className={proteinColorMap[log.protein_result]}>
                                    {log.protein_result}
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">
                                {log.prednisolone_dose || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {log.remarks || '-'}
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant="outline" className={
                                  log.clinician_reviewed ? 'bg-green-50 text-green-700' : ''
                                }>
                                  {log.clinician_reviewed ? 'Reviewed' : 'Pending'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <div className="space-y-4">
                <MonitoringTrendsChart logs={dailyLogs} parameterType="Urine_Protein" />
                <MonitoringTrendsChart logs={dailyLogs} parameterType="Weight" />
                <MonitoringTrendsChart logs={dailyLogs} parameterType="Blood_Pressure" />
                <MonitoringTrendsChart logs={dailyLogs} parameterType="Medications" />
              </div>
            </TabsContent>

            <TabsContent value="records">
              <Card>
                <CardHeader>
                  <CardTitle>All Health Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dailyLogs.slice(0, 20).map((log, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{log.module_type.replace('_', ' ')}</Badge>
                          <span className="text-sm text-slate-500">
                            {new Date(log.log_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700">
                          {JSON.stringify(log.value || {}, null, 2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Add and view clinical notes here...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Users className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Clinicals Dashboard</h1>
              <p className="text-blue-100">Patient monitoring & nephrotic diary management</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Patient List
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Link to={createPageUrl("MonitoringPlanBuilder")}>
                  <Button className="bg-blue-600">Create Monitoring Plan</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Age</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Diagnosis</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Last Protein</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Last Entry</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Compliance</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Alerts</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(patient => {
                    const plan = getPlanForPatient(patient.id);
                    const compliance = getComplianceStatus(patient.id);
                    
                    return (
                      <tr 
                        key={patient.id}
                        className="border-b hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-semibold text-slate-900">{patient.patient_name}</div>
                            <div className="text-xs text-slate-500">{patient.cr_number}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{patient.age_years}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{plan?.diagnosis || patient.diagnosis}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={proteinColorMap[getLatestProteinResult(patient.id)] || ''}>
                            {getLatestProteinResult(patient.id)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {patient.updated_date ? new Date(patient.updated_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={
                            compliance === 'Good' ? 'bg-green-100 text-green-800' :
                            compliance === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {compliance}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">None</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}