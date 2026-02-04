import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database, FileBarChart, Download, Brain, FileText, ArrowLeft,
  Plus, Users, TrendingUp, Sparkles, BookOpen, BarChart3, Layers,
  Rocket, Share2, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import ProjectWizard from '../components/research/ProjectWizard';
import FormBuilder from '../components/research/FormBuilder';
import DataExtractor from '../components/research/DataExtractor';
import LiteratureSearch from '../components/research/LiteratureSearch';
import StatisticalAnalysis from '../components/research/StatisticalAnalysis';
import KnowledgeBase from '../components/research/KnowledgeBase';
import ProtocolBuilder from '../components/research/ProtocolBuilder';
import EnhancedProtocolBuilder from '../components/research/EnhancedProtocolBuilder';

export default function ResearchHub() {
  const [activeTab, setActiveTab] = useState("projects");
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

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
      ...projectData,
      principal_investigator: user?.email,
      status: 'Planning',
      included_patients: [],
      collaborators: []
    }),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['research-projects'] });
      setShowProjectWizard(false);
      setSelectedProject(newProject);
      setActiveTab('forms');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Top Navigation Tabs */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex gap-2">
            <Link to={createPageUrl("Hub")}>
              <Button variant="outline" className="hover:bg-blue-50">
                <BarChart3 className="w-4 h-4 mr-2" />
                Calc View
              </Button>
            </Link>
            <Link to={createPageUrl("ClinicManagement")}>
              <Button variant="outline" className="hover:bg-purple-50">
                <Users className="w-4 h-4 mr-2" />
                Clinic Mode
              </Button>
            </Link>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Layers className="w-4 h-4 mr-2" />
              Research Mode
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 p-6">

        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 shadow-2xl text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Database className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Research Hub</h1>
              <p className="text-purple-100">REDCap-equivalent with AI-powered clinical data auto-extraction</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-white/20 backdrop-blur">80-90% Auto-Fill from Clinical Data</Badge>
            <Badge className="bg-white/20 backdrop-blur">📊 AI Statistical Analysis</Badge>
            <Badge className="bg-white/20 backdrop-blur">📚 Literature Search</Badge>
            <Badge className="bg-white/20 backdrop-blur">🤖 Study Design Assistant</Badge>
            <Badge className="bg-white/20 backdrop-blur">📈 Publication Ready</Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="protocol">Protocol</TabsTrigger>
            <TabsTrigger value="forms">Form Builder</TabsTrigger>
            <TabsTrigger value="data">Data Collection</TabsTrigger>
            <TabsTrigger value="literature">Literature</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>

          <TabsContent value="protocol">
            <EnhancedProtocolBuilder />
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Research Projects</h2>
              <Dialog open={showProjectWizard} onOpenChange={setShowProjectWizard}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-purple-600" />
                      Create Research Project
                    </DialogTitle>
                  </DialogHeader>
                  <ProjectWizard onComplete={(data) => createProjectMutation.mutate(data)} />
                </DialogContent>
              </Dialog>
            </div>

            {projects.length === 0 ? (
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200">
                <CardContent className="p-12 text-center">
                  <Database className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Research Projects Yet</h3>
                  <p className="text-slate-600 mb-6">Start your first research study with AI-powered tools and automatic clinical data extraction</p>
                  <Button onClick={() => setShowProjectWizard(true)} className="bg-purple-600">
                    <Rocket className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {projects.map(project => (
                  <Card key={project.id} className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => {
                    setSelectedProject(project);
                    setActiveTab('data');
                  }}>
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{project.title}</CardTitle>
                          <p className="text-sm text-slate-600">{project.description}</p>
                        </div>
                        <Badge className={
                          project.status === 'Active' ? 'bg-green-100 text-green-800' :
                          project.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'Analysis' ? 'bg-purple-100 text-purple-800' :
                          'bg-slate-100 text-slate-800'
                        }>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">PI:</span>
                          <span className="font-semibold">{project.principal_investigator}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Patients Enrolled:</span>
                          <span className="font-semibold">{project.included_patients?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Study Type:</span>
                          <Badge variant="outline">{project.study_type || 'observational'}</Badge>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button size="sm" variant="outline" className="flex-1" onClick={(e) => {
                            e.stopPropagation();
                            exportData(project.id, "csv");
                          }}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setActiveTab('analysis');
                          }}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analyze
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="forms">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Research Form Builder - Clinical Data Auto-Extraction
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

          <TabsContent value="data">
            {selectedProject ? (
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      {selectedProject.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 items-center">
                      <Badge>{selectedProject.status}</Badge>
                      <Badge variant="outline">{selectedProject.included_patients?.length || 0} patients enrolled</Badge>
                    </div>
                  </CardContent>
                </Card>

                <DataExtractor 
                  patientId={patients[0]?.id}
                  researchForm={{ sections: selectedProject.data_fields || [] }}
                  onDataExtracted={(data) => {
                    console.log('Data extracted:', data);
                    toast.success('Clinical data extracted!');
                  }}
                />
              </div>
            ) : (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Please select a project from the Projects tab to begin data collection.
                </AlertDescription>
              </Alert>
            )}
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
        </Tabs>
      </div>
    </div>
  );
}