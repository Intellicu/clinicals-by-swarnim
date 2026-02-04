import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Users, Calendar, Settings, Plus, Search, Building2, Clock, 
  Activity, Pill, FileText, PlayCircle, ArrowRight, Home
} from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import WorkspaceWizard from '../components/clinic/WorkspaceWizard';
import PatientOnboarding from '../components/clinic/PatientOnboarding';

export default function ClinicDashboard() {
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false);
  const [showPatientOnboarding, setShowPatientOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');

  const navigate = useNavigate();
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
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
    enabled: !!selectedWorkspace
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const apts = await base44.entities.Appointment.list('-appointment_date', 50);
      const enriched = await Promise.all(apts.map(async (apt) => {
        if (apt.patient_id) {
          const pts = await base44.entities.Patient.filter({ id: apt.patient_id });
          return { ...apt, patient: pts[0] };
        }
        return apt;
      }));
      return enriched;
    },
    enabled: !!selectedWorkspace
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => base44.entities.Prescription.list('-prescription_date', 20),
    enabled: !!selectedWorkspace
  });

  React.useEffect(() => {
    if (!selectedWorkspace && workspaces.length > 0) {
      setSelectedWorkspace(workspaces[0]);
    }
  }, [workspaces, selectedWorkspace]);

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    return isSameDay(aptDate, today);
  });

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    return aptDate > today && apt.status === 'Scheduled';
  }).slice(0, 10);

  const filteredPatients = patients.filter(p => 
    p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.cr_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startConsultation = (appointment) => {
    const patient = appointment.patient;
    if (!patient) {
      toast.error('Patient data not found');
      return;
    }
    
    navigate(createPageUrl('ClinicalEncounterView'), {
      state: { 
        patient, 
        workspace: selectedWorkspace,
        appointment 
      }
    });
  };

  // Workspace Selection
  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Select Workspace</h1>
            <p className="text-slate-600">Choose your clinic to start</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map(workspace => (
              <Card 
                key={workspace.id}
                className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-500 group"
                onClick={() => setSelectedWorkspace(workspace)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{workspace.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{workspace.description || 'No description'}</p>
                  <Badge variant="outline">{workspace.type || 'OPD'}</Badge>
                </CardContent>
              </Card>
            ))}

            <Card 
              className="hover:shadow-xl transition-all cursor-pointer border-2 border-dashed hover:border-blue-500"
              onClick={() => setShowWorkspaceWizard(true)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[180px]">
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                  <Plus className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-700">Create Workspace</h3>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showWorkspaceWizard} onOpenChange={setShowWorkspaceWizard}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
            </DialogHeader>
            <WorkspaceWizard onComplete={(workspace) => {
              setShowWorkspaceWizard(false);
              setSelectedWorkspace(workspace);
            }} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedWorkspace(null)}>
                <Building2 className="w-4 h-4 mr-2" />
                {selectedWorkspace.name}
              </Button>
              <Badge className="bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3 mr-1" />
                {format(new Date(), 'EEE, MMM d')}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl('Hub'))}>
              <Home className="w-4 h-4 mr-2" />
              Calculator Mode
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Today's Appointments</p>
              <p className="text-3xl font-bold text-blue-600">{todayAppointments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Total Patients</p>
              <p className="text-3xl font-bold text-green-600">{patients.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Active Cases</p>
              <p className="text-3xl font-bold text-purple-600">
                {patients.filter(p => p.status === 'Active').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Prescriptions</p>
              <p className="text-3xl font-bold text-orange-600">{prescriptions.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6 mt-6">
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">Today's Schedule</h2>
                <p className="text-blue-100">{todayAppointments.length} appointments • {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
              </CardContent>
            </Card>

            {todayAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No appointments today</p>
                  <Button onClick={() => setShowPatientOnboarding(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Enroll Patient
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map(apt => (
                  <Card key={apt.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {format(parseISO(apt.appointment_date), 'HH:mm')}
                            </p>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {apt.duration_minutes}min
                            </Badge>
                          </div>
                          <div className="h-12 w-px bg-slate-200" />
                          <div>
                            <h3 className="font-bold text-lg">{apt.patient?.patient_name || apt.patient_name}</h3>
                            <p className="text-sm text-slate-600">
                              {apt.patient?.age_years}y • {apt.patient?.gender} • {apt.appointment_type}
                            </p>
                            {apt.chief_complaint && (
                              <p className="text-xs text-slate-500 mt-1">{apt.chief_complaint}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (apt.patient) {
                                navigate(createPageUrl('PatientMonitoringDashboard'), {
                                  state: { 
                                    patient: apt.patient,
                                    workspace: selectedWorkspace
                                  }
                                });
                              }
                            }}
                            variant="outline"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Records
                          </Button>
                          <Button
                            onClick={() => startConsultation(apt)}
                            className="bg-green-600"
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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
                          <p className="font-semibold">{apt.patient?.patient_name || apt.patient_name}</p>
                          <p className="text-sm text-slate-600">
                            {format(parseISO(apt.appointment_date), 'MMM d, HH:mm')} • {apt.appointment_type}
                          </p>
                        </div>
                        <Badge>{apt.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="patients" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Patient Registry</CardTitle>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search patients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-72"
                      />
                    </div>
                    <Button onClick={() => setShowPatientOnboarding(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Patient
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPatients.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-lg text-slate-600 mb-6">No patients enrolled</p>
                    <Button onClick={() => setShowPatientOnboarding(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Enroll First Patient
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPatients.map(patient => (
                      <div 
                        key={patient.id}
                        className="p-4 border rounded hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(createPageUrl('PatientMonitoringDashboard'), {
                          state: { patient, workspace: selectedWorkspace }
                        })}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{patient.patient_name}</h3>
                            <p className="text-sm text-slate-600">
                              CR# {patient.cr_number} • {patient.age_years}y • {patient.gender}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{patient.diagnosis}</Badge>
                            <Badge className="bg-green-100 text-green-800">{patient.status}</Badge>
                            <ArrowRight className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Prescriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {prescriptions.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">No prescriptions yet</p>
                ) : (
                  <div className="space-y-2">
                    {prescriptions.slice(0, 10).map(rx => (
                      <div key={rx.id} className="p-3 border rounded">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold">{rx.patient_id}</p>
                            <p className="text-sm text-slate-600">
                              {format(parseISO(rx.prescription_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Badge>{rx.medications?.length || 0} meds</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showPatientOnboarding} onOpenChange={setShowPatientOnboarding}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <PatientOnboarding 
            workspaceId={selectedWorkspace?.id}
            onComplete={(patient) => {
              setShowPatientOnboarding(false);
              queryClient.invalidateQueries({ queryKey: ['patients'] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}