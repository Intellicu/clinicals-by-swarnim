import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const MODULE_TEMPLATES = {
  'Nephrotic Syndrome': [
    { module_type: 'Urine_Protein', frequency: 'Daily', mandatory: true, display_order: 1, enabled: true },
    { module_type: 'Medications', frequency: 'Daily', mandatory: true, display_order: 2, enabled: true },
    { module_type: 'Weight', frequency: 'Weekly', mandatory: false, display_order: 3, enabled: true },
    { module_type: 'Edema', frequency: 'Daily', mandatory: false, display_order: 4, enabled: true },
    { module_type: 'Symptoms', frequency: 'Conditional', mandatory: false, display_order: 5, enabled: true }
  ],
  'CKD': [
    { module_type: 'Blood_Pressure', frequency: 'Daily', mandatory: true, display_order: 1, enabled: true },
    { module_type: 'Weight', frequency: 'Weekly', mandatory: true, display_order: 2, enabled: true },
    { module_type: 'Medications', frequency: 'Daily', mandatory: true, display_order: 3, enabled: true },
    { module_type: 'Lab_Reports', frequency: 'Monthly', mandatory: false, display_order: 4, enabled: true },
    { module_type: 'Symptoms', frequency: 'Conditional', mandatory: false, display_order: 5, enabled: true }
  ],
  'Transplant': [
    { module_type: 'Medications', frequency: 'Daily', mandatory: true, display_order: 1, enabled: true },
    { module_type: 'Blood_Pressure', frequency: 'Daily', mandatory: true, display_order: 2, enabled: true },
    { module_type: 'Weight', frequency: 'Daily', mandatory: true, display_order: 3, enabled: true },
    { module_type: 'Urine_Output', frequency: 'Daily', mandatory: true, display_order: 4, enabled: true },
    { module_type: 'Lab_Reports', frequency: 'Weekly', mandatory: false, display_order: 5, enabled: true },
    { module_type: 'Symptoms', frequency: 'Conditional', mandatory: false, display_order: 6, enabled: true }
  ]
};

export default function MonitoringPlanBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [modules, setModules] = useState([]);
  const [notes, setNotes] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list()
  });

  const createPlanMutation = useMutation({
    mutationFn: (planData) => base44.entities.MonitoringPlan.create(planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-plans'] });
      toast.success('Monitoring plan created successfully!');
      navigate(createPageUrl('ClinicalDashboard'));
    }
  });

  const handleDiagnosisChange = (value) => {
    setDiagnosis(value);
    setModules(MODULE_TEMPLATES[value] || []);
  };

  const updateModule = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  const handleSubmit = () => {
    if (!selectedPatient || !diagnosis || modules.length === 0) {
      toast.error('Please complete all required fields');
      return;
    }

    createPlanMutation.mutate({
      patient_id: selectedPatient,
      diagnosis,
      created_by: user?.email,
      active: true,
      modules,
      notes
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to={createPageUrl("ClinicalDashboard")}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Create Monitoring Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label>Select Patient *</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.patient_name} ({patient.cr_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Primary Diagnosis *</Label>
              <Select value={diagnosis} onValueChange={handleDiagnosisChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select diagnosis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nephrotic Syndrome">Nephrotic Syndrome</SelectItem>
                  <SelectItem value="CKD">CKD</SelectItem>
                  <SelectItem value="Transplant">Transplant</SelectItem>
                  <SelectItem value="AKI">AKI</SelectItem>
                  <SelectItem value="Hypertension">Hypertension</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {modules.length > 0 && (
              <div>
                <Label className="mb-3 block">Configure Monitoring Modules</Label>
                <div className="space-y-3">
                  {modules.map((module, idx) => (
                    <Card key={idx} className="bg-slate-50 border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={module.enabled}
                            onCheckedChange={(checked) => updateModule(idx, 'enabled', checked)}
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 mb-1">
                              {module.module_type.replace('_', ' ')}
                            </div>
                            <div className="flex gap-2 items-center">
                              <Select
                                value={module.frequency}
                                onValueChange={(val) => updateModule(idx, 'frequency', val)}
                              >
                                <SelectTrigger className="w-32 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Daily">Daily</SelectItem>
                                  <SelectItem value="Weekly">Weekly</SelectItem>
                                  <SelectItem value="Monthly">Monthly</SelectItem>
                                  <SelectItem value="Conditional">Conditional</SelectItem>
                                  <SelectItem value="As_Needed">As Needed</SelectItem>
                                </SelectContent>
                              </Select>
                              <Checkbox
                                checked={module.mandatory}
                                onCheckedChange={(checked) => updateModule(idx, 'mandatory', checked)}
                              />
                              <Label className="text-xs">Mandatory</Label>
                            </div>
                          </div>
                          <Badge variant="outline">{module.display_order}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Clinical Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or notes about this monitoring plan..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={!selectedPatient || !diagnosis || createPlanMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {createPlanMutation.isPending ? 'Creating...' : 'Create Monitoring Plan'}
              </Button>
              <Button variant="outline" onClick={() => navigate(createPageUrl('ClinicalDashboard'))}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}