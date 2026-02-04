import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, Users, Calendar, Stethoscope, FileText, 
  Plus, ArrowRight, CheckCircle, Play, Home, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import WorkspaceWizard from '../components/clinic/WorkspaceWizard';
import PatientOnboarding from '../components/clinic/PatientOnboarding';
import AppointmentScheduler from '../components/clinic/AppointmentScheduler';
import EnhancedClinicalEncounter from '../components/clinic/EnhancedClinicalEncounter';

export default function ClinicWorkflow() {
  const [currentStep, setCurrentStep] = useState('workspace');
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false);
  const [showPatientOnboarding, setShowPatientOnboarding] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces', user?.email],
    queryFn: () => base44.entities.Workspace.filter({ owner_email: user?.email }),
    enabled: !!user
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', selectedWorkspace?.id],
    queryFn: () => base44.entities.Patient.list(),
    enabled: !!selectedWorkspace
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', selectedWorkspace?.id],
    queryFn: async () => {
      const apts = await base44.entities.Appointment.list('-appointment_date', 100);
      return apts;
    },
    enabled: !!selectedWorkspace
  });

  useEffect(() => {
    if (location.state?.workspace) setSelectedWorkspace(location.state.workspace);
    if (location.state?.patient) setSelectedPatient(location.state.patient);
    if (location.state?.appointment) setSelectedAppointment(location.state.appointment);
  }, [location.state]);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0]);
      setCurrentStep('dashboard');
    } else if (workspaces.length === 0) {
      setCurrentStep('workspace');
    }
  }, [workspaces]);

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
    return aptDate === today && apt.status === 'Scheduled';
  });

  const upcomingAppointments = appointments.filter(apt => {
    const today = new Date();
    const aptDate = new Date(apt.appointment_date);
    return aptDate > today && apt.status === 'Scheduled';
  }).slice(0, 5);

  // Workflow Steps Component
  const WorkflowSteps = () => (
    <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200">
      <StepIndicator number={1} label="Workspace" active={currentStep === 'workspace'} completed={!!selectedWorkspace} />
      <ArrowRight className="w-6 h-6 text-slate-300" />
      <StepIndicator number={2} label="Patients" active={currentStep === 'patients'} completed={patients.length > 0} />
      <ArrowRight className="w-6 h-6 text-slate-300" />
      <StepIndicator number={3} label="Schedule" active={currentStep === 'schedule'} completed={appointments.length > 0} />
      <ArrowRight className="w-6 h-6 text-slate-300" />
      <StepIndicator number={4} label="Consult" active={currentStep === 'consult'} completed={false} />
      <ArrowRight className="w-6 h-6 text-slate-300" />
      <StepIndicator number={5} label="Prescription" active={currentStep === 'prescription'} completed={false} />
    </div>
  );

  const StepIndicator = ({ number, label, active, completed }) => (
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 ${
        completed ? 'bg-green-600 text-white' :
        active ? 'bg-blue-600 text-white' :
        'bg-slate-200 text-slate-500'
      }`}>
        {completed ? <CheckCircle className="w-6 h-6" /> : number}
      </div>
      <span className={`text-sm font-semibold ${active ? 'text-blue-600' : 'text-slate-600'}`}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl('Hub'))}>
                <Home className="w-4 h-4 mr-2" />
                Calculator Mode
              </Button>
              {selectedWorkspace && (
                <Badge className="bg-purple-100 text-purple-800 text-sm px-3 py-1">
                  <Building2 className="w-3 h-3 mr-1" />
                  {selectedWorkspace.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3 mr-1" />
                {format(new Date(), 'MMM d, yyyy')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Clinic Workflow</h1>
          <p className="text-slate-600">Seamless patient care from enrollment to prescription</p>
        </div>

        <WorkflowSteps />

        {/* Workspace Selection / Creation */}
        {(!selectedWorkspace || currentStep === 'workspace') && (
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-purple-600" />
                Your Workspaces
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {workspaces.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No Workspace Yet</h3>
                  <p className="text-slate-600 mb-6">Create your first clinic workspace to get started</p>
                  <Button onClick={() => setShowWorkspaceWizard(true)} className="bg-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workspace
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {workspaces.map(ws => (
                    <Card key={ws.id} className={`cursor-pointer hover:shadow-lg transition-shadow ${selectedWorkspace?.id === ws.id ? 'border-2 border-blue-500' : ''}`} onClick={() => { setSelectedWorkspace(ws); setCurrentStep('dashboard'); }}>
                      <CardContent className="p-4">
                        <h3 className="font-bold mb-1">{ws.name}</h3>
                        <p className="text-sm text-slate-600">{ws.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                  <Card className="cursor-pointer hover:shadow-lg border-2 border-dashed" onClick={() => setShowWorkspaceWizard(true)}>
                    <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                      <Plus className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm font-semibold">Add Workspace</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dashboard View */}
        {selectedWorkspace && currentStep === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setShowPatientOnboarding(true)}>
                <CardContent className="p-6">
                  <Users className="w-12 h-12 mb-3" />
                  <h3 className="text-xl font-bold mb-1">Enroll Patient</h3>
                  <p className="text-blue-100 text-sm">Add new patient with OCR</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-emerald-600 text-white cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setShowScheduler(true)}>
                <CardContent className="p-6">
                  <Calendar className="w-12 h-12 mb-3" />
                  <h3 className="text-xl font-bold mb-1">Schedule Appointment</h3>
                  <p className="text-green-100 text-sm">Book patient visit</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigate(createPageUrl('PatientMonitoringDashboard'))}>
                <CardContent className="p-6">
                  <FileText className="w-12 h-12 mb-3" />
                  <h3 className="text-xl font-bold mb-1">Patient Records</h3>
                  <p className="text-purple-100 text-sm">View monitoring data</p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Appointments */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Stethoscope className="w-6 h-6 text-green-600" />
                    Today's Appointments ({todayAppointments.length})
                  </span>
                  <Badge className="bg-green-600 text-white">{format(new Date(), 'EEEE')}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {todayAppointments.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">No appointments scheduled for today</p>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map(apt => (
                      <Card key={apt.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{format(new Date(apt.appointment_date), 'HH:mm')}</p>
                                <Badge className="bg-blue-100 text-blue-800 text-xs">{apt.duration_minutes}min</Badge>
                              </div>
                              <div className="h-12 w-px bg-slate-200" />
                              <div>
                                <h3 className="font-bold text-lg">{apt.patient_name}</h3>
                                <p className="text-sm text-slate-600">{apt.appointment_type} • {apt.chief_complaint}</p>
                              </div>
                            </div>
                            <Button className="bg-green-600" onClick={() => {
                              setSelectedAppointment(apt);
                              setCurrentStep('consult');
                            }}>
                              <Play className="w-4 h-4 mr-2" />
                              Start Consultation
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {upcomingAppointments.map(apt => (
                      <div key={apt.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                        <div>
                          <p className="font-semibold">{apt.patient_name}</p>
                          <p className="text-sm text-slate-600">{format(new Date(apt.appointment_date), 'MMM d, HH:mm')} • {apt.appointment_type}</p>
                        </div>
                        <Badge>{apt.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Clinical Encounter View */}
        {currentStep === 'consult' && selectedAppointment && (
          <EnhancedClinicalEncounter
            appointment={selectedAppointment}
            workspace={selectedWorkspace}
            onComplete={(prescription) => {
              toast.success('Consultation completed!');
              setCurrentStep('dashboard');
              queryClient.invalidateQueries({ queryKey: ['appointments'] });
            }}
            onBack={() => setCurrentStep('dashboard')}
          />
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={showWorkspaceWizard} onOpenChange={setShowWorkspaceWizard}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <WorkspaceWizard onComplete={(ws) => {
            setShowWorkspaceWizard(false);
            setSelectedWorkspace(ws);
            setCurrentStep('dashboard');
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
          }} />
        </DialogContent>
      </Dialog>

      <Dialog open={showPatientOnboarding} onOpenChange={setShowPatientOnboarding}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Enroll New Patient</DialogTitle>
          </DialogHeader>
          <PatientOnboarding
            workspaceId={selectedWorkspace?.id}
            onComplete={(patient) => {
              setShowPatientOnboarding(false);
              queryClient.invalidateQueries({ queryKey: ['patients'] });
              toast.success('Patient enrolled successfully!');
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentScheduler
            workspaceId={selectedWorkspace?.id}
            patients={patients}
            onScheduled={() => {
              setShowScheduler(false);
              queryClient.invalidateQueries({ queryKey: ['appointments'] });
              toast.success('Appointment scheduled!');
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}