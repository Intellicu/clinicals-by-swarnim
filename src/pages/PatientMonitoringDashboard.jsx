import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, Activity, AlertTriangle, CheckCircle2, Pill, 
  TrendingUp, Scale, Droplet, Clock, FileText, MessageCircle
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function PatientMonitoringDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient;
  const workspace = location.state?.workspace;

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ['patient-logs', patient?.id],
    queryFn: () => base44.entities.PatientDailyLog.filter({ patient_id: patient?.id }, '-log_date'),
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

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['prescriptions', patient?.id],
    queryFn: () => base44.entities.Prescription.filter({ patient_id: patient?.id }, '-prescription_date'),
    enabled: !!patient
  });

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No patient selected</p>
      </div>
    );
  }

  // Calculate monitoring summary
  const last7Days = dailyLogs.slice(0, 7);
  const last30Days = dailyLogs.slice(0, 30);
  
  const adherence = last7Days.length > 0 
    ? Math.round((last7Days.filter(log => log.completion_status === 'Complete').length / 7) * 100)
    : 0;
  
  const missedDays = 7 - last7Days.filter(log => log.completion_status === 'Complete').length;

  // Protein logs
  const proteinLogs = last7Days.filter(log => log.module_type === 'Urine_Protein');
  const highProteinDays = proteinLogs.filter(log => 
    ['2+', '3+', '4+'].includes(log.protein_result)
  ).length;

  // Medication adherence
  const medLogs = last30Days.filter(log => log.module_type === 'Medications');
  const medAdherence = medLogs.length > 0 
    ? Math.round((medLogs.filter(log => log.completion_status === 'Complete').length / 30) * 100)
    : 0;

  // Weight trend
  const weightLogs = last7Days.filter(log => log.module_type === 'Weight' && log.weight_kg);
  const weightChange = weightLogs.length >= 2 
    ? (weightLogs[0].weight_kg - weightLogs[weightLogs.length - 1].weight_kg).toFixed(1)
    : 0;

  // Generate alerts
  const alerts = [];
  if (highProteinDays >= 2) {
    alerts.push({
      severity: 'high',
      message: `Protein ≥2+ for ${highProteinDays} days`,
      action: 'Consider relapse - review treatment'
    });
  }
  if (missedDays >= 3) {
    alerts.push({
      severity: 'medium',
      message: `${missedDays} days missing logs`,
      action: 'Check patient compliance'
    });
  }
  if (Math.abs(weightChange) > 1.5) {
    alerts.push({
      severity: 'high',
      message: `Weight ${weightChange > 0 ? 'gain' : 'loss'}: ${Math.abs(weightChange)} kg in 7 days`,
      action: 'Assess fluid status'
    });
  }

  const complianceColor = adherence >= 80 ? 'green' : adherence >= 50 ? 'yellow' : 'red';

  const latestPrescription = prescriptions[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sticky Header */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{patient.patient_name}</h1>
                <p className="text-sm text-slate-600">
                  CR# {patient.cr_number} • {patient.age_years}y • {patient.gender} • {patient.diagnosis}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-500">Last Sync</p>
                <p className="text-sm font-semibold">Today, {format(new Date(), 'HH:mm')}</p>
              </div>
              <Badge className={`bg-${complianceColor}-100 text-${complianceColor}-800`}>
                {adherence}% Compliance
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <Alert key={idx} className={alert.severity === 'high' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-200'}>
                <AlertTriangle className={`w-5 h-5 ${alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                <AlertDescription>
                  <span className="font-bold">{alert.message}</span>
                  <span className="text-sm text-slate-600"> • {alert.action}</span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* At-a-Glance Summary */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              At-a-Glance Summary (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Protein Trend */}
              {proteinLogs.length > 0 && (
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Urine Protein</p>
                  <div className="flex gap-1 mb-2">
                    {proteinLogs.map((log, idx) => (
                      <div 
                        key={idx}
                        title={`${format(new Date(log.log_date), 'MMM d')}: ${log.protein_result}`}
                        className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-bold ${
                          log.protein_result === 'Negative' || log.protein_result === 'Trace' ? 'bg-green-200 text-green-800' :
                          log.protein_result === '1+' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                        }`}
                      >
                        {log.protein_result}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600">
                    {highProteinDays > 0 ? `${highProteinDays} high days` : 'All normal'}
                  </p>
                </div>
              )}

              {/* Medication Adherence */}
              {medLogs.length > 0 && (
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Medication Adherence</p>
                  <p className="text-3xl font-bold text-blue-600">{medAdherence}%</p>
                  <p className="text-xs text-slate-600">Last 30 days</p>
                </div>
              )}

              {/* Weight Change */}
              {weightLogs.length > 0 && (
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Weight Trend</p>
                  <div className="flex items-center gap-2">
                    {weightChange > 0 ? (
                      <TrendingUp className="w-6 h-6 text-red-600" />
                    ) : (
                      <TrendingUp className="w-6 h-6 text-green-600 rotate-180" />
                    )}
                    <p className="text-2xl font-bold">
                      {weightChange > 0 ? '+' : ''}{weightChange} kg
                    </p>
                  </div>
                  <p className="text-xs text-slate-600">Last 7 days</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Module Panels */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Urine Protein Module */}
          {proteinLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Droplet className="w-5 h-5 text-blue-600" />
                  Urine Protein Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Last Result:</span>
                    <Badge className={
                      proteinLogs[0].protein_result === 'Negative' || proteinLogs[0].protein_result === 'Trace' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }>
                      {proteinLogs[0].protein_result}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Tests Done (7d):</span>
                    <span className="font-semibold">{proteinLogs.length}/7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Medications */}
          {latestPrescription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Pill className="w-5 h-5 text-purple-600" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {latestPrescription.medications?.slice(0, 3).map((med, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-semibold">{med.drug_name}</span>
                      <span className="text-slate-600"> - {med.dose} {med.frequency}</span>
                    </div>
                  ))}
                  {latestPrescription.medications?.length > 3 && (
                    <p className="text-xs text-slate-500">+{latestPrescription.medications.length - 3} more</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky bottom-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold">Quick Actions</p>
              <div className="flex gap-2">
                <Button 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => navigate(createPageUrl('ClinicalEncounterView'), {
                    state: { patient, workspace }
                  })}
                >
                  <Pill className="w-4 h-4 mr-2" />
                  Write Prescription
                </Button>
                <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/40">
                  <FileText className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/40">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}