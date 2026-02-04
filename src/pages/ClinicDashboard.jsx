import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Users, Calendar, Settings, Plus, Search, Building2, ArrowRight,
  Clock, Activity, TrendingUp, FileText, TestTube, Home, Pill
} from 'lucide-react';
import WorkspaceWizard from '../components/clinic/WorkspaceWizard';
import PatientOnboarding from '../components/clinic/PatientOnboarding';
import AppointmentCalendar from '../components/clinic/AppointmentCalendar';

export default function ClinicDashboard() {
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false);
  const [showPatientOnboarding, setShowPatientOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

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
    queryKey: ['patients', selectedWorkspace?.id],
    queryFn: () => base44.entities.Patient.list(),
    enabled: !!selectedWorkspace
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', selectedWorkspace?.id],
    queryFn: () => base44.entities.Appointment.list('-appointment_date'),
    enabled: !!selectedWorkspace
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['prescriptions', selectedWorkspace?.id],
    queryFn: () => base44.entities.Prescription.list('-prescription_date'),
    enabled: !!selectedWorkspace
  });

  // Auto-select first workspace
  React.useEffect(() => {
    if (!selectedWorkspace && workspaces.length > 0) {
      setSelectedWorkspace(workspaces[0]);
    }
  }, [workspaces, selectedWorkspace]);

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date).toDateString();
    const today = new Date().toDateString();
    return aptDate === today;
  });

  const filteredPatients = patients.filter(p => 
    p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.cr_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Workspace Selection View
  if (!selectedWorkspace && workspaces.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Workspaces</h1>
            <p className="text-slate-600">Select a workspace to start your clinic session</p>
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
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{workspace.description || 'No description'}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{workspace.type || 'OPD'}</Badge>
                    <Badge variant="outline">{workspace.specialty || 'General'}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card 
              className="hover:shadow-xl transition-all cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-500"
              onClick={() => setShowWorkspaceWizard(true)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                  <Plus className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-700">Create Workspace</h3>
                <p className="text-xs text-slate-500 mt-1">Start a new clinic</p>
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

  // No Workspaces View
  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Welcome to Clinic Mode</h2>
            <p className="text-slate-600 mb-8">Create your first workspace to manage patients, appointments, and clinical records</p>
            <Button onClick={() => setShowWorkspaceWizard(true)} size="lg" className="bg-blue-600 text-lg px-8">
              <Plus className="w-5 h-5 mr-2" />
              Create Workspace
            </Button>
          </CardContent>
        </Card>

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

  // Main Dashboard View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedWorkspace(null)}
              >
                <Building2 className="w-4 h-4 mr-2" />
                {selectedWorkspace.name}
              </Button>
              <Badge className="bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3 mr-1" />
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Link to={createPageUrl("Hub")}>
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Calculator Mode
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="patients">Patients ({patients.length})</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Today's Appointments</p>
                      <p className="text-3xl font-bold text-blue-600">{todayAppointments.length}</p>
                    </div>
                    <Calendar className="w-10 h-10 text-blue-600 opacity-30" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Patients</p>
                      <p className="text-3xl font-bold text-green-600">{patients.length}</p>
                    </div>
                    <Users className="w-10 h-10 text-green-600 opacity-30" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Active Cases</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {patients.filter(p => p.status === 'Active').length}
                      </p>
                    </div>
                    <Activity className="w-10 h-10 text-purple-600 opacity-30" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Prescriptions</p>
                      <p className="text-3xl font-bold text-orange-600">{prescriptions.length}</p>
                    </div>
                    <Pill className="w-10 h-10 text-orange-600 opacity-30" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Quick Actions</h2>
                    <p className="text-blue-100">Start your clinical workflow</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-blue-50"
                      onClick={() => setShowPatientOnboarding(true)}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Enroll Patient (OCR)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No appointments scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map(apt => (
                      <div key={apt.id} className="border rounded-lg p-4 hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{apt.patient_name || 'Patient'}</p>
                            <p className="text-sm text-slate-600">{apt.appointment_type}</p>
                          </div>
                          <Button size="sm" onClick={() => {
                            // Navigate to encounter
                            const patient = patients.find(p => p.id === apt.patient_id);
                            if (patient) {
                              navigate(createPageUrl('ClinicalEncounterView'), {
                                state: { patient, workspace: selectedWorkspace }
                              });
                            }
                          }}>
                            Start Consultation
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Patient Registry</CardTitle>
                  <div className="flex items-center gap-3">
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
              <CardContent className="p-0">
                {filteredPatients.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-lg text-slate-600 mb-2">No patients found</p>
                    <p className="text-sm text-slate-500 mb-6">Start by enrolling your first patient</p>
                    <Button onClick={() => setShowPatientOnboarding(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Enroll First Patient
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredPatients.map(patient => (
                      <div 
                        key={patient.id}
                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => navigate(createPageUrl('ClinicalEncounterView'), {
                          state: { patient, workspace: selectedWorkspace }
                        })}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{patient.patient_name}</h3>
                              <p className="text-sm text-slate-600">
                                CR# {patient.cr_number} • {patient.age_years}y • {patient.gender}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{patient.diagnosis || 'No diagnosis'}</Badge>
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

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <AppointmentCalendar workspaceId={selectedWorkspace.id} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Reports and analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Patient Onboarding Modal */}
      <Dialog open={showPatientOnboarding} onOpenChange={setShowPatientOnboarding}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <PatientOnboarding 
            workspaceId={selectedWorkspace.id}
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