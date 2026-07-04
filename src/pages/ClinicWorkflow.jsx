import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, Users, Calendar, Stethoscope, FileText, 
  Plus, ArrowRight, CheckCircle, Play, Home, Clock, ChevronRight, ArrowLeft, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import WorkspaceWizard from '../components/clinic/WorkspaceWizard';
import PatientOnboarding from '../components/clinic/PatientOnboarding';
import AppointmentScheduler from '../components/clinic/AppointmentScheduler';
import EnhancedClinicalEncounter from '../components/clinic/EnhancedClinicalEncounter';
import StartAppointmentWorkspace from '../components/clinic/StartAppointmentWorkspace';
import DataChatbot from '../components/DataChatbot';

export default function ClinicWorkflow() {
  const [currentStep, setCurrentStep] = useState('workspace');
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false);
  const [showPatientOnboarding, setShowPatientOnboarding] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [sosPatient, setSosPatient] = useState(null);
  const [showSOSPicker, setShowSOSPicker] = useState(false);

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
    // Only show workspace selection — never auto-force a workspace
    if (workspaces.length === 0) {
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

  // Breadcrumb helper
  const breadcrumbs = [
    { label: 'Hub', onClick: () => navigate(createPageUrl('Hub')) },
    { label: 'Clinic', onClick: () => { setCurrentStep('workspace'); setSelectedWorkspace(null); } },
    ...(selectedWorkspace ? [{ label: selectedWorkspace.name, onClick: () => setCurrentStep('dashboard') }] : []),
    ...(currentStep === 'consult' ? [{ label: 'Consultation' }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                  {crumb.onClick ? (
                    <button onClick={crumb.onClick} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                      {i === 0 ? <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" />{crumb.label}</span> : crumb.label}
                    </button>
                  ) : (
                    <span className="text-slate-700 font-semibold">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              {selectedWorkspace && currentStep !== 'workspace' && (
                <Button variant="outline" size="sm" className="text-purple-700 border-purple-300 hidden sm:flex" onClick={() => { setCurrentStep('workspace'); setSelectedWorkspace(null); }}>
                  <Building2 className="w-3.5 h-3.5 mr-1" />
                  Switch Workspace
                </Button>
              )}
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {format(new Date(), 'MMM d, yyyy')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Back + Title row */}
        <div className="flex items-center gap-3 mb-6">
          {currentStep === 'dashboard' && selectedWorkspace && (
            <Button variant="outline" size="sm" onClick={() => { setCurrentStep('workspace'); setSelectedWorkspace(null); }}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Workspaces
            </Button>
          )}
          {currentStep === 'consult' && (
            <Button variant="outline" size="sm" onClick={() => setCurrentStep('dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {currentStep === 'workspace' ? 'Select Workspace' : currentStep === 'consult' ? 'Consultation' : selectedWorkspace?.name || 'Clinic Workflow'}
            </h1>
            <p className="text-sm text-slate-500">
              {currentStep === 'workspace' ? 'Choose a workspace to continue, or create a new one' : 'Seamless patient care from enrollment to prescription'}
            </p>
          </div>
        </div>

        <WorkflowSteps />

        {/* Workspace Selection / Creation */}
        {(!selectedWorkspace || currentStep === 'workspace') && (
          <div className="mb-6">
            {workspaces.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow border-2 border-dashed border-purple-200">
                <Building2 className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Workspaces Yet</h3>
                <p className="text-slate-500 mb-6">Create your first clinic workspace (e.g. "Pediatric Nephrology OPD") to get started</p>
                <Button onClick={() => setShowWorkspaceWizard(true)} className="bg-purple-600 hover:bg-purple-700 text-base px-6 py-3 h-auto">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Workspace
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {workspaces.map(ws => (
                  <Card
                    key={ws.id}
                    className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-purple-400 group"
                    onClick={() => { setSelectedWorkspace(ws); setCurrentStep('dashboard'); }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <Building2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
                      </div>
                      <h3 className="font-bold text-slate-900 mt-3 mb-1">{ws.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{ws.description || 'Click to open workspace'}</p>
                    </CardContent>
                  </Card>
                ))}
                {/* Prominent Add Workspace card */}
                <Card
                  className="cursor-pointer hover:shadow-xl border-2 border-dashed border-purple-300 hover:border-purple-500 transition-all bg-purple-50 hover:bg-purple-100 group"
                  onClick={() => setShowWorkspaceWizard(true)}
                >
                  <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[120px] gap-2">
                    <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center group-hover:bg-purple-300 transition-colors">
                      <Plus className="w-6 h-6 text-purple-700" />
                    </div>
                    <p className="text-sm font-bold text-purple-700">Add New Workspace</p>
                    <p className="text-xs text-purple-500 text-center">e.g. Pediatric Nephrology, NICU, OPD</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
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

              <Card className="bg-gradient-to-br from-red-500 to-orange-500 text-white cursor-pointer hover:shadow-xl transition-shadow col-span-full md:col-span-1" onClick={() => setShowSOSPicker(true)}>
                <CardContent className="p-6 flex items-center gap-4 md:block">
                  <Play className="w-12 h-12 md:mb-3" />
                  <div>
                    <h3 className="text-xl font-bold mb-1">Start SOS Appointment</h3>
                    <p className="text-red-100 text-sm">Walk-in / unscheduled visit</p>
                  </div>
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

        {/* Comprehensive Appointment Workspace */}
        {currentStep === 'consult' && (selectedAppointment || sosPatient) && (
          <StartAppointmentWorkspace
            appointment={selectedAppointment || { appointment_type: "Emergency", chief_complaint: "SOS Visit" }}
            patient={sosPatient || patients.find(p => p.id === selectedAppointment?.patient_id)}
            workspace={selectedWorkspace}
            onComplete={() => {
              toast.success('Consultation completed & records saved!');
              setCurrentStep('dashboard');
              setSosPatient(null);
              queryClient.invalidateQueries({ queryKey: ['appointments'] });
            }}
            onBack={() => { setCurrentStep('dashboard'); setSosPatient(null); }}
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

      {/* SOS Patient Picker */}
      <Dialog open={showSOSPicker} onOpenChange={setShowSOSPicker}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Play className="w-5 h-5" /> Start SOS / Walk-in Appointment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Select the patient for this unscheduled visit:</p>
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {patients.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSosPatient(p); setShowSOSPicker(false); setCurrentStep('consult'); }}
                  className="w-full text-left flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-red-400 hover:bg-red-50 transition-all"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{p.patient_name}</p>
                    <p className="text-xs text-slate-500">{p.cr_number} · {p.age_years}y · {p.diagnosis}</p>
                  </div>
                  <Play className="w-4 h-4 text-red-500" />
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={() => { setShowSOSPicker(false); setShowPatientOnboarding(true); }} className="w-full gap-2">
              <Plus className="w-4 h-4" /> Register New Patient First
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Monitor chatbot — Clinic mode only */}
      <DataChatbot />

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