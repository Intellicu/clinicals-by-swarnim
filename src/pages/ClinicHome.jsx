import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Users, Calendar, Building2, ArrowRight, Search,
  Clock, Activity, TrendingUp, Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import WorkspaceWizard from '../components/clinic/WorkspaceWizard';
import PatientOnboarding from '../components/clinic/PatientOnboarding';

export default function ClinicHome() {
  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false);
  const [showPatientOnboarding, setShowPatientOnboarding] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => base44.entities.Workspace.filter({ owner_email: user?.email }),
    enabled: !!user
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', selectedWorkspace?.id],
    queryFn: () => base44.entities.Patient.list(),
    enabled: !!selectedWorkspace
  });

  const { data: todayAppointments = [] } = useQuery({
    queryKey: ['today-appointments', selectedWorkspace?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return base44.entities.Appointment.filter({ 
        appointment_date: today 
      });
    },
    enabled: !!selectedWorkspace
  });

  const filteredPatients = patients.filter(p => 
    p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.cr_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedWorkspace && workspaces.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Workspaces</h1>
            <p className="text-slate-600">Select a workspace to start your clinic session</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {workspaces.map(workspace => (
              <Card 
                key={workspace.id}
                className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-400"
                onClick={() => setSelectedWorkspace(workspace)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{workspace.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{workspace.description}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">OPD</Badge>
                    <Badge variant="outline" className="text-xs">{workspace.specialty || 'General'}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card 
              className="hover:shadow-xl transition-all cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-400"
              onClick={() => setShowWorkspaceWizard(true)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-700">Create Workspace</h3>
                <p className="text-xs text-slate-500 mt-1">Start a new clinic</p>
              </CardContent>
            </Card>
          </div>

          {showWorkspaceWizard && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                <WorkspaceWizard onComplete={() => {
                  setShowWorkspaceWizard(false);
                  queryClient.invalidateQueries({ queryKey: ['workspaces'] });
                }} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Welcome to Clinic Mode</h2>
            <p className="text-slate-600 mb-6">Create your first workspace to get started</p>
            <Button onClick={() => setShowWorkspaceWizard(true)} className="bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Workspace
            </Button>
          </CardContent>
        </Card>

        {showWorkspaceWizard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <WorkspaceWizard onComplete={() => {
                setShowWorkspaceWizard(false);
                queryClient.invalidateQueries({ queryKey: ['workspaces'] });
              }} />
            </div>
          </div>
        )}
      </div>
    );
  }

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
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Switch Workspace
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{selectedWorkspace.name}</h1>
                <p className="text-sm text-slate-600">{selectedWorkspace.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3 mr-1" />
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Dashboard */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Today's Patients</p>
                  <p className="text-2xl font-bold text-blue-600">{todayAppointments.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Total Patients</p>
                  <p className="text-2xl font-bold text-green-600">{patients.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Active Cases</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {patients.filter(p => p.status === 'Active').length}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Follow-ups Due</p>
                  <p className="text-2xl font-bold text-orange-600">0</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">Ready to Start?</h2>
                <p className="text-blue-100 text-sm">Enroll a new patient or start consultation</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => setShowPatientOnboarding(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Enroll Patient (OCR)
                </Button>
                <Link to={createPageUrl("ConsultationView")}>
                  <Button className="bg-white/20 hover:bg-white/30 text-white">
                    Start Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient List */}
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
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredPatients.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">No patients enrolled yet</p>
                <Button onClick={() => setShowPatientOnboarding(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Enroll First Patient
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {filteredPatients.map(patient => (
                  <Link 
                    key={patient.id}
                    to={createPageUrl("ClinicalEncounterView")}
                    state={{ patient, workspace: selectedWorkspace }}
                  >
                    <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
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
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showPatientOnboarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <PatientOnboarding 
              workspaceId={selectedWorkspace.id}
              onComplete={(patient) => {
                setShowPatientOnboarding(false);
                queryClient.invalidateQueries({ queryKey: ['patients'] });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}