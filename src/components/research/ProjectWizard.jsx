import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Rocket, CheckCircle2 } from 'lucide-react';

const STUDY_TEMPLATES = {
  'aki': { name: 'Acute Kidney Injury Registry', fields: ['creatinine', 'urine_output', 'aki_stage', 'etiology', 'dialysis_needed'] },
  'ns': { name: 'Nephrotic Syndrome Cohort', fields: ['protein_urine', 'albumin', 'edema_grade', 'steroid_response', 'relapse_count'] },
  'ckd': { name: 'CKD Progression Study', fields: ['egfr', 'ckd_stage', 'proteinuria', 'bp', 'hemoglobin', 'pth'] },
  'dialysis': { name: 'Dialysis Outcomes Registry', fields: ['modality', 'ktv', 'urea_reduction', 'complications', 'adequacy'] },
  'transplant': { name: 'Transplant Follow-up', fields: ['graft_function', 'rejection_episodes', 'tacrolimus_level', 'infections'] }
};

export default function ProjectWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    title: '',
    study_id: '',
    study_type: 'observational',
    design: 'cross-sectional',
    centers: 'single',
    timeline: 'prospective',
    template: null,
    pi_name: '',
    ethics_approval: '',
    start_date: '',
    end_date: '',
    sample_size: '',
    objectives: { primary: '', secondary: [] },
    inclusion_criteria: [],
    exclusion_criteria: []
  });

  const updateData = (field, value) => {
    setProjectData({ ...projectData, [field]: value });
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Study Title *</Label>
              <Input
                value={projectData.title}
                onChange={(e) => updateData('title', e.target.value)}
                placeholder="e.g., Pediatric Nephrotic Syndrome Outcomes in South India"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Study Type *</Label>
                <Select value={projectData.study_type} onValueChange={(val) => updateData('study_type', val)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="observational">Observational</SelectItem>
                    <SelectItem value="rct">Randomized Controlled Trial</SelectItem>
                    <SelectItem value="registry">Registry</SelectItem>
                    <SelectItem value="audit">Clinical Audit</SelectItem>
                    <SelectItem value="qi">Quality Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Study Design *</Label>
                <Select value={projectData.design} onValueChange={(val) => updateData('design', val)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cross-sectional">Cross-Sectional</SelectItem>
                    <SelectItem value="cohort">Cohort</SelectItem>
                    <SelectItem value="case-control">Case-Control</SelectItem>
                    <SelectItem value="interventional">Interventional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Centers</Label>
                <Select value={projectData.centers} onValueChange={(val) => updateData('centers', val)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Center</SelectItem>
                    <SelectItem value="multi">Multi-Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Timeline</Label>
                <Select value={projectData.timeline} onValueChange={(val) => updateData('timeline', val)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospective">Prospective</SelectItem>
                    <SelectItem value="retrospective">Retrospective</SelectItem>
                    <SelectItem value="ambispective">Ambispective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Use Pediatric Template (Optional)</Label>
              <Select value={projectData.template} onValueChange={(val) => updateData('template', val)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STUDY_TEMPLATES).map(([key, template]) => (
                    <SelectItem key={key} value={key}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Principal Investigator *</Label>
              <Input
                value={projectData.pi_name}
                onChange={(e) => updateData('pi_name', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Ethics Approval Reference</Label>
              <Input
                value={projectData.ethics_approval}
                onChange={(e) => updateData('ethics_approval', e.target.value)}
                placeholder="IEC/2024/123"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={projectData.start_date}
                  onChange={(e) => updateData('start_date', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Expected End Date</Label>
                <Input
                  type="date"
                  value={projectData.end_date}
                  onChange={(e) => updateData('end_date', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Target Sample Size</Label>
              <Input
                type="number"
                value={projectData.sample_size}
                onChange={(e) => updateData('sample_size', e.target.value)}
                placeholder="e.g., 100"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Primary Objective *</Label>
              <Textarea
                value={projectData.objectives.primary}
                onChange={(e) => updateData('objectives', { ...projectData.objectives, primary: e.target.value })}
                placeholder="e.g., To evaluate the frequency of steroid resistance in children with nephrotic syndrome"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Secondary Objectives</Label>
              <Textarea
                value={projectData.objectives.secondary.join('\n')}
                onChange={(e) => updateData('objectives', { 
                  ...projectData.objectives, 
                  secondary: e.target.value.split('\n').filter(s => s.trim()) 
                })}
                placeholder="Enter one objective per line"
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Project Setup Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-lg mb-2">{projectData.title}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">Type:</span>
                    <Badge className="ml-2">{projectData.study_type}</Badge>
                  </div>
                  <div>
                    <span className="text-slate-600">Design:</span>
                    <Badge className="ml-2">{projectData.design}</Badge>
                  </div>
                  <div>
                    <span className="text-slate-600">PI:</span>
                    <span className="ml-2 font-medium">{projectData.pi_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Sample Size:</span>
                    <span className="ml-2 font-medium">{projectData.sample_size || 'TBD'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge className="bg-blue-100 text-blue-800">✓ Research Form Ready</Badge>
                <Badge className="bg-purple-100 text-purple-800">✓ Auto-Extraction Enabled</Badge>
                <Badge className="bg-green-100 text-green-800">✓ Ethics Tracking</Badge>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                s < step ? 'bg-green-500 text-white' :
                s === step ? 'bg-blue-600 text-white' :
                'bg-slate-200 text-slate-600'
              }`}>
                {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 4 && <div className="w-12 h-1 bg-slate-200" />}
            </div>
          ))}
        </div>
        <Badge>{['Basic Info', 'Team & Ethics', 'Objectives', 'Review'][step - 1]}</Badge>
      </div>

      <Card>
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            if (step < 4) {
              setStep(step + 1);
            } else {
              onComplete(projectData);
            }
          }}
          className="bg-blue-600"
          disabled={step === 1 && !projectData.title}
        >
          {step === 4 ? (
            <><Rocket className="w-4 h-4 mr-2" /> Create Project</>
          ) : (
            'Next'
          )}
        </Button>
      </div>
    </div>
  );
}