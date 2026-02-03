import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, Users, Microscope } from 'lucide-react';

export default function WorkspaceSelector({ onSelect }) {
  const [showCreate, setShowCreate] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const myWorkspaces = await base44.entities.Workspace.filter({ owner_email: user?.email });
      const sharedWorkspaces = await base44.entities.Workspace.list();
      const shared = sharedWorkspaces.filter(w => 
        w.members?.some(m => m.email === user?.email)
      );
      return [...myWorkspaces, ...shared];
    },
    enabled: !!user
  });

  const workspaceTypes = [
    { value: 'OPD', icon: Users, label: 'OPD', description: 'Outpatient Department - For patients visiting without admission' },
    { value: 'IPD', icon: Building2, label: 'IPD', description: 'Inpatient Department - For admitted patients requiring care' },
    { value: 'Research', icon: Microscope, label: 'Research', description: 'Research workspace for clinical studies and medical research' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Select a Workspace</h1>
          <p className="text-slate-600">Choose a workspace to continue or create a new one</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {workspaces.map(workspace => (
            <Card 
              key={workspace.id}
              className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-500"
              onClick={() => onSelect(workspace)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{workspace.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{workspace.description}</p>
                <Badge variant="outline" className="text-xs">
                  {workspace.members?.length || 1} member{workspace.members?.length !== 1 ? 's' : ''}
                </Badge>
              </CardContent>
            </Card>
          ))}

          <Card 
            className="hover:shadow-xl transition-all cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50"
            onClick={() => setShowCreate(true)}
          >
            <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
              <Plus className="w-12 h-12 text-blue-600 mb-3" />
              <h3 className="font-bold text-blue-900">Add New Workspace</h3>
              <p className="text-xs text-blue-700 mt-1">Create a new workspace</p>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Personal Workspace</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Workspace Type
                </h3>
                <p className="text-sm text-slate-600 mb-4">Select the type of workspace you want to create</p>
                <div className="grid md:grid-cols-3 gap-3">
                  {workspaceTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <Card 
                        key={type.value}
                        className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-500 group"
                      >
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-slate-900 mb-1">{type.label}</h4>
                          <p className="text-xs text-slate-600">{type.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}