import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, FileText, ClipboardList, BookOpen, Activity, Heart, Droplet } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';

export default function PatientToolsPanel({ patient }) {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const { data: attachedTemplates = [] } = useQuery({
    queryKey: ['patient-templates', patient.id],
    queryFn: async () => {
      // Fetch attached monitoring templates for this patient
      const p = await base44.entities.Patient.filter({ id: patient.id });
      return p[0]?.attached_monitoring_templates || [];
    }
  });

  const { data: guidelines = [] } = useQuery({
    queryKey: ['guidelines-for-diagnosis'],
    queryFn: async () => {
      if (!patient.diagnosis) return [];
      const allGuidelines = await base44.entities.Guideline.list('-year', 10);
      return allGuidelines.filter(g => 
        g.title?.toLowerCase().includes(patient.diagnosis?.toLowerCase()) ||
        g.keywords?.some(k => patient.diagnosis?.toLowerCase().includes(k.toLowerCase()))
      );
    }
  });

  const quickCalculators = [
    { name: 'GFR', icon: Activity, page: 'SchwartzGFR', color: 'bg-blue-600' },
    { name: 'BP', icon: Heart, page: 'BPPercentiles', color: 'bg-red-600' },
    { name: 'Dose', icon: Calculator, page: 'DoseCalculator', color: 'bg-purple-600' },
    { name: 'Fluid', icon: Droplet, page: 'FluidCalculator', color: 'bg-cyan-600' }
  ];

  const attachTemplate = async (templateId) => {
    try {
      const current = await base44.entities.Patient.filter({ id: patient.id });
      const templates = current[0]?.attached_monitoring_templates || [];
      await base44.entities.Patient.update(patient.id, {
        attached_monitoring_templates: [...templates, templateId]
      });
      queryClient.invalidateQueries({ queryKey: ['patient-templates', patient.id] });
      toast.success('Template attached!');
    } catch (error) {
      toast.error('Failed to attach template');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="w-5 h-5 text-blue-600" />
            Quick Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {quickCalculators.map((calc) => (
              <Link key={calc.name} to={createPageUrl(calc.page)}>
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 border-2 hover:border-blue-400">
                  <div className={`w-10 h-10 ${calc.color} rounded-lg flex items-center justify-center`}>
                    <calc.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold">{calc.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="w-5 h-5 text-green-600" />
            Monitoring Templates ({attachedTemplates.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Attach Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Monitoring Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {['Nephrotic Syndrome', 'Hemodialysis', 'BP Monitoring', 'Growth Chart'].map((template, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => attachTemplate(template)}
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {attachedTemplates.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachedTemplates.map((template, idx) => (
                <Badge key={idx} variant="outline" className="mr-2">{template}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {guidelines.length > 0 && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Relevant Guidelines ({guidelines.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {guidelines.map((guideline) => (
              <Link key={guideline.id} to={createPageUrl('GuidelineDetail') + '?id=' + guideline.id}>
                <Button variant="outline" className="w-full justify-start text-left text-sm h-auto py-3">
                  <div>
                    <div className="font-semibold">{guideline.title}</div>
                    <div className="text-xs text-slate-500">{guideline.source} - {guideline.year}</div>
                  </div>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}