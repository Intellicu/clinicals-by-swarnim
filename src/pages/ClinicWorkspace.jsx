import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users, Calendar, Settings, Inbox, BarChart3, Calculator, Layers,
  Plus, Search, ChevronDown, Building2, UserPlus, ClipboardList
} from 'lucide-react';
import WorkspaceSelector from '../components/clinic/WorkspaceSelector';
import WorkspaceWizard from '../components/clinic/WorkspaceWizard';
import PatientList from '../components/clinic/PatientList';
import AppointmentCalendar from '../components/clinic/AppointmentCalendar';

export default function ClinicWorkspace() {
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const myWorkspaces = await base44.entities.Workspace.filter({ owner_email: user?.email });
      return myWorkspaces;
    },
    enabled: !!user
  });

  if (!selectedWorkspace && workspaces.length === 0) {
    return <WorkspaceSelector onSelect={setSelectedWorkspace} />;
  }

  if (!selectedWorkspace && workspaces.length > 0) {
    setSelectedWorkspace(workspaces[0]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Navigation Tabs */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex gap-2">
            <Link to={createPageUrl("Hub")}>
              <Button variant="outline" className="hover:bg-blue-50">
                <Calculator className="w-4 h-4 mr-2" />
                Calc View
              </Button>
            </Link>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Users className="w-4 h-4 mr-2" />
              Clinic Mode
            </Button>
            <Link to={createPageUrl("ResearchHub")}>
              <Button variant="outline" className="hover:bg-indigo-50">
                <Layers className="w-4 h-4 mr-2" />
                Research Mode
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r-2 border-slate-200 min-h-screen p-4">
          <div className="mb-6">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => setSelectedWorkspace(null)}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold text-sm">{selectedWorkspace?.name}</div>
                  <div className="text-xs text-slate-500">{workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          <nav className="space-y-1">
            <Button
              variant={activeView === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('dashboard')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeView === 'patients' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('patients')}
            >
              <Users className="w-4 h-4 mr-2" />
              Patients
            </Button>
            <Button
              variant={activeView === 'calendar' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('calendar')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Manage Slots
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <Inbox className="w-4 h-4 mr-2" />
              Inbox
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Services
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </Button>
          </nav>

          <div className="mt-6 pt-6 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowWorkspaceWizard(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Members
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                <h1 className="text-3xl font-bold mb-2">{selectedWorkspace?.name}</h1>
                <p className="text-purple-100">{selectedWorkspace?.description}</p>
                <div className="flex gap-2 mt-4">
                  <Badge className="bg-white/20 backdrop-blur">{selectedWorkspace?.type}</Badge>
                  <Badge className="bg-white/20 backdrop-blur">{selectedWorkspace?.specialty || 'General'}</Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                    <div className="text-sm text-slate-600">Patients Today</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">0</div>
                    <div className="text-sm text-slate-600">Appointments</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                    <div className="text-sm text-slate-600">Follow-ups Due</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Button 
                      className="w-full bg-blue-600"
                      onClick={() => {
                        const PatientOnboarding = require('../components/clinic/PatientOnboarding').default;
                        // Trigger onboarding modal
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Enroll New Patient (OCR)
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === 'patients' && (
            <PatientList workspaceId={selectedWorkspace?.id} />
          )}

          {activeView === 'calendar' && (
            <AppointmentCalendar workspaceId={selectedWorkspace?.id} />
          )}
        </main>
      </div>

      <Dialog open={showWorkspaceWizard} onOpenChange={setShowWorkspaceWizard}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <WorkspaceWizard onComplete={(workspace) => {
            setSelectedWorkspace(workspace);
            setShowWorkspaceWizard(false);
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}