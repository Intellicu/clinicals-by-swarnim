import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Building2, Users, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkspaceWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [workspaceData, setWorkspaceData] = useState({
    name: '',
    description: '',
    type: 'OPD',
    specialty: 'Pediatric Nephrology',
    settings: {
      default_view: 'calendar',
      appointment_duration: 15,
      allow_online_booking: false
    }
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: (data) => base44.entities.Workspace.create({
      ...data,
      owner_email: user?.email,
      members: [],
      active: true
    }),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace created successfully!');
      onComplete(workspace);
    }
  });

  const handleNext = () => {
    if (step === 3) {
      createWorkspaceMutation.mutate(workspaceData);
    } else {
      setStep(step + 1);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Workspace Name *</Label>
              <Input
                value={workspaceData.name}
                onChange={(e) => setWorkspaceData({...workspaceData, name: e.target.value})}
                placeholder="e.g., Pediatric Nephrology"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={workspaceData.description}
                onChange={(e) => setWorkspaceData({...workspaceData, description: e.target.value})}
                placeholder="Pediatric Nephrology clinic, AIIMS, Patna"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Workspace Type *</Label>
              <Select value={workspaceData.type} onValueChange={(val) => setWorkspaceData({...workspaceData, type: val})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPD">OPD - Outpatient Department</SelectItem>
                  <SelectItem value="IPD">IPD - Inpatient Department</SelectItem>
                  <SelectItem value="Research">Research Workspace</SelectItem>
                  <SelectItem value="Solo">Solo Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Primary Specialty</Label>
              <Input
                value={workspaceData.specialty}
                onChange={(e) => setWorkspaceData({...workspaceData, specialty: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Review Workspace</h3>
              <div className="bg-white p-4 rounded-lg text-left space-y-2 mb-4">
                <div><strong>Name:</strong> {workspaceData.name}</div>
                <div><strong>Type:</strong> {workspaceData.type}</div>
                <div><strong>Specialty:</strong> {workspaceData.specialty}</div>
              </div>
              <p className="text-sm text-slate-600">Click Create to set up your workspace</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              s < step ? 'bg-green-500 text-white' :
              s === step ? 'bg-blue-600 text-white' :
              'bg-slate-200 text-slate-600'
            }`}>
              {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            {s < 3 && <div className="w-12 h-1 bg-slate-200" />}
          </div>
        ))}
      </div>

      {renderStep()}

      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={step === 1 && !workspaceData.name}
          className="bg-blue-600"
        >
          {step === 3 ? 'Create Workspace' : 'Next'}
        </Button>
      </div>
    </div>
  );
}