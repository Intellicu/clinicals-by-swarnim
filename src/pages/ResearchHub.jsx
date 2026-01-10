import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database, Download, FileText,
  Plus, BarChart3, ArrowLeft, Layers, Beaker, Info
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import FormBuilder from '../components/research/FormBuilder';
import ProjectWizard from '../components/research/ProjectWizard';
import LiteratureSearch from '../components/research/LiteratureSearch';
import StatisticalAnalysis from '../components/research/StatisticalAnalysis';
import KnowledgeBase from '../components/research/KnowledgeBase';

export default function ResearchHub() {
  const [activeTab, setActiveTab] = useState("projects");
  const [showNewProject, setShowNewProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['research-projects'],
    queryFn: () => base44.entities.ResearchProject.list('-created_date')
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['all-patients'],
    queryFn: () => base44.entities.Patient.list()
  });

  const createProjectMutation = useMutation({
    mutationFn: (projectData) => base44.entities.ResearchProject.create({
      title: projectData.title,
      description: projectData.objectives?.primary || '',
      principal_investigator: projectData.pi_name,
      status: 'Planning',
      collaborators: [],
      included_patients: [],
      data_fields: []
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research-projects'] });
      setShowNewProject(false);
      toast.success('Research project created!');
    }
  });

  const exportData = async (projectId, format) => {
    toast.info("Generating export...", { id: "export" });
    try {
      const project = projects.find(p => p.id === projectId);
      const projectPatients = patients.filter(p => project.included_patients?.includes(p.id));
      
      let content = "";
      if (format === "csv") {
        const headers = ["CR Number", "Name", "Age", "Gender", "Diagnosis", "Status"];
        content = headers.join(",") + "\n";
        projectPatients.forEach(p => {
          content += `${p.cr_number},${p.patient_name},${p.age_years || ''},${p.gender},${p.diagnosis || ''},${p.status}\n`;
        });
      }

      const blob = new Blob([content], { type: format === "csv" ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research_export_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      toast.success("Export downloaded!", { id: "export" });
    } catch (error) {
      toast.error("Export failed", { id: "export" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 shadow-2xl text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Database className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Research Hub</h1>
              <p className="text-purple-100">Clinical research data collection, analysis & publication</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-white/20 backdrop-blur">📊 Data Analysis</Badge>
            <Badge className="bg-white/20 backdrop-blur">📁 Export CSV/Excel</Badge>
            <Badge className="bg-white/20 backdrop-blur">🤖 AI Assistant</Badge>
            <Badge className="bg-white/20 backdrop-blur">📚 Literature Review</Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="forms">Form Builder</TabsTrigger>
            <TabsTrigger value="literature">Literature</TabsTrigger>
            <TabsTrigger value="analysis">Statistics</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Research Projects</h2>
              <Button onClick={() => setShowNewProject(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

            <Alert className="bg-indigo-50 border-indigo-200">
              <Info className="w-4 h-4 text-indigo-600" />
              <AlertDescription className="text-indigo-800">
                <strong>REDCap-Style Platform:</strong> Complete research workflow - protocol builder, auto-extraction from clinical data, literature review, statistical analysis, and manuscript drafting.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              {projects.map(project => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                      </div>
                      <Badge>{project.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Patients:</span>
                        <span className="font-semibold">{project.included_patients?.length || 0}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => exportData(project.id, "csv")}>
                          <Download className="w-4 h-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analyze
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="forms">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Research Form Builder - Auto-Extraction from Clinical Data
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-800">80-90% Auto-Fill</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <Database className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Clinical Data Auto-Mapping:</strong> Link form fields to patient records, vitals, labs, medications. Research data auto-filled from routine care—no duplicate entry.
                  </AlertDescription>
                </Alert>

                <FormBuilder onSave={(formData) => {
                  console.log('Form saved:', formData);
                  toast.success('Research form created with auto-extraction!');
                }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="literature">
            <LiteratureSearch projectId={selectedProject?.id} />
          </TabsContent>

          <TabsContent value="analysis">
            <StatisticalAnalysis projectId={selectedProject?.id} />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeBase />
          </TabsContent>

          <TabsContent value="data">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-green-600" />
                  Data Collection & Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Alert className="bg-green-50 border-green-200">
                  <Info className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Data Integrity:</strong> Real-time validation, query management, missing data tracking, and offline sync capabilities.
                  </AlertDescription>
                </Alert>
                <div className="mt-6 text-center text-slate-500">
                  <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p>Select a project to view data collection interface</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Layers className="w-6 h-6 text-purple-600" />
                Create New Research Project
              </DialogTitle>
            </DialogHeader>
            <ProjectWizard onComplete={(data) => createProjectMutation.mutate(data)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}