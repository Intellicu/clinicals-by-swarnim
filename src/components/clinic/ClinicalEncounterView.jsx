import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, Activity, AlertTriangle, TrendingUp, FileText, 
  Pill, ArrowLeft, Calendar, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EnhancedDigitalPrescriptionPad from './EnhancedDigitalPrescriptionPad';
import ClinicalToolsSidebar from './ClinicalToolsSidebar';

export default function ClinicalEncounterView() {
  const location = useLocation();
  const patient = location.state?.patient;
  const workspace = location.state?.workspace;
  const [showPrescription, setShowPrescription] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [encounter, setEncounter] = useState(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Create encounter on load
  useEffect(() => {
    if (patient && workspace && user && !encounter) {
      createEncounterMutation.mutate();
    }
  }, [patient, workspace, user]);

  const createEncounterMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.ClinicalEncounter.create({
        workspace_id: workspace?.id,
        patient_id: patient.id,
        clinician_id: user.email,
        encounter_date: new Date().toISOString(),
        encounter_type: 'Follow-up',
        status: 'Active'
      });
    },
    onSuccess: (data) => setEncounter(data)
  });

  // Get monitoring summary
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

  const { data: previousPrescriptions = [] } = useQuery({
    queryKey: ['prescriptions', patient?.id],
    queryFn: () => base44.entities.Prescription.filter({ patient_id: patient?.id }),
    enabled: !!patient
  });

  // Calculate monitoring summary
  const last7DaysLogs = dailyLogs.slice(0, 7);
  const adherencePercentage = last7DaysLogs.length > 0 
    ? (last7DaysLogs.filter(log => log.completion_status === 'Complete').length / 7) * 100 
    : 0;
  const missedDays = 7 - last7DaysLogs.filter(log => log.completion_status === 'Complete').length;

  // Detect alerts
  const alerts = [];
  const proteinLogs = last7DaysLogs.filter(log => log.module_type === 'Urine_Protein');
  const highProteinDays = proteinLogs.filter(log => 
    ['2+', '3+', '4+'].includes(log.protein_result)
  ).length;
  
  if (highProteinDays >= 2) {
    alerts.push({
      severity: 'high',
      message: `Protein ≥2+ for ${highProteinDays} days in last week`,
      action: 'Consider relapse'
    });
  }

  if (missedDays >= 3) {
    alerts.push({
      severity: 'medium',
      message: `${missedDays} days of logs missing`,
      action: 'Check adherence'
    });
  }

  const latestPrescription = previousPrescriptions[0];

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Patient Selected</h2>
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
        {/* Sticky Header */}
        <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-30 shadow-sm">
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
                    CR# {patient.cr_number} • {patient.age_years}y • {patient.gender} • {patient.diagnosis}
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowPrescription(true)} className="bg-blue-600">
                <Pill className="w-4 h-4 mr-2" />
                Write Prescription
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Alerts Panel */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((alert, idx) => (
                <Alert key={idx} className={alert.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}>
                  <AlertTriangle className={`w-4 h-4 ${alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                  <AlertDescription className="ml-2">
                    <span className="font-semibold">{alert.message}</span>
                    <span className="text-sm text-slate-600"> • {alert.action}</span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Home Monitoring Snapshot */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-green-600" />
                Home Monitoring Snapshot (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-slate-600 mb-1">Adherence</p>
                  <p className="text-2xl font-bold text-green-600">{adherencePercentage.toFixed(0)}%</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-slate-600 mb-1">Logs Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{last7DaysLogs.length}/7</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-slate-600 mb-1">Missed Days</p>
                  <p className="text-2xl font-bold text-orange-600">{missedDays}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-slate-600 mb-1">Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{alerts.length}</p>
                </div>
              </div>

              {/* Protein Trend Visual */}
              {proteinLogs.length > 0 && (
                <div className="mt-4 bg-white rounded-lg p-4 border">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Urine Protein (Last 7 Days)</p>
                  <div className="flex gap-1">
                    {proteinLogs.map((log, idx) => (
                      <div 
                        key={idx}
                        className={`flex-1 h-12 rounded flex items-center justify-center text-xs font-bold ${
                          log.protein_result === 'Negative' || log.protein_result === 'Trace' ? 'bg-green-200 text-green-800' :
                          log.protein_result === '1+' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                        }`}
                      >
                        {log.protein_result}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Last Prescription */}
          {latestPrescription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Current Medications
                  <Badge variant="outline" className="ml-auto">
                    {new Date(latestPrescription.prescription_date).toLocaleDateString('en-IN')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-2">
                  {latestPrescription.medications?.map((med, idx) => (
                    <div key={idx} className="bg-slate-50 rounded p-3 border">
                      <div className="font-semibold text-sm">{med.drug_name}</div>
                      <div className="text-xs text-slate-600">{med.dose} • {med.frequency} • {med.duration}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">View Full Trends</h3>
                  <p className="text-xs text-slate-600">Detailed monitoring charts</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Export Records</h3>
                  <p className="text-xs text-slate-600">Download patient summary</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Clinical Tools Sidebar */}
      <ClinicalToolsSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* Enhanced Prescription Modal */}
      {showPrescription && encounter && (
        <EnhancedDigitalPrescriptionPad
          patient={patient}
          encounter={encounter}
          workspace={workspace}
          monitoringPlan={monitoringPlan}
          previousPrescription={latestPrescription}
          onClose={() => {
            setShowPrescription(false);
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
          }}
        />
      )}
    </div>
  );
}