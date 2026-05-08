import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  FlaskConical, Plus, Edit3, BarChart3, BookOpen, Users, Trash2,
  Search, Calendar, Loader2, ChevronRight, CheckCircle2, XCircle,
  UserCheck, Target, Shield, Database, FileText, Sparkles, ArrowLeft,
  Crown
} from "lucide-react";

import StudyBuilder from "../ros/StudyBuilder";
import EligibilityEngine from "./EligibilityEngine";
import StatisticalAnalysis from "./StatisticalAnalysis";
import ManuscriptStudio from "./ManuscriptStudio";
import DataExtractor from "./DataExtractor";
import EHRExtractor from "./EHRExtractor";
import FormBuilder from "./FormBuilder";
import LiteratureSearch from "./LiteratureSearch";
import ResearchAIAssistant from "./ResearchAIAssistant";
import StudyTypeDetector from "./StudyTypeDetector";
import ReportingGuidelineTracker from "./ReportingGuidelineTracker";
import ResearchContinuationWorkspace from "./ResearchContinuationWorkspace";
import GrantWritingStudio from "./GrantWritingStudio";
import LiteratureMonitorEngine from "./LiteratureMonitorEngine";
import PremiumFeatureGate from "./PremiumFeatureGate";
import { classifyStudyType, STUDY_TYPES, suggestNextSteps } from "@/lib/AdaptiveMethodologyEngine";
import { usePremiumGate, FEATURE_GATES } from "@/lib/usePremiumGate";

const STATUS_COLORS = {
  Draft: "bg-slate-100 text-slate-600",
  Active: "bg-blue-100 text-blue-700",
  Analysis: "bg-purple-100 text-purple-700",
  Writing: "bg-amber-100 text-amber-700",
  Submitted: "bg-orange-100 text-orange-700",
  Published: "bg-green-100 text-green-700",
  Archived: "bg-slate-100 text-slate-400",
};

const OS_SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "builder", label: "Protocol Builder", icon: Target },
  { id: "import", label: "Import & Continue", icon: Database },
  { id: "literature", label: "Literature Workspace", icon: Search },
  { id: "lit_monitor", label: "Literature Monitor", icon: BookOpen, premium: true },
  { id: "crf", label: "CRF Builder", icon: FileText },
  { id: "eligibility", label: "Patient Matching", icon: UserCheck },
  { id: "data", label: "Data Collection", icon: Database },
  { id: "ocr", label: "OCR Import", icon: Database },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "manuscript", label: "Manuscript Studio", icon: BookOpen },
  { id: "grant", label: "Grant Writing Studio", icon: FileText, premium: true },
  { id: "reporting", label: "Submission Toolkit", icon: Shield },
];

export default function ResearchOSWorkspace() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [newProject, setNewProject] = useState({ title: "", study_type: "", institution: "" });
  const [showStudyBuilder, setShowStudyBuilder] = useState(false);

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const gate = usePremiumGate(user);
  const { data: patients = [] } = useQuery({ queryKey: ["all-patients"], queryFn: () => base44.entities.Patient.list("-created_date", 200) });

  const { data: projects = [], refetch } = useQuery({
    queryKey: ["ros-projects"],
    queryFn: () => base44.entities.ResearchProject.list("-created_date", 50),
    enabled: !!user
  });

  const filtered = projects.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.study_type?.toLowerCase().includes(search.toLowerCase())
  );

  const createProject = async () => {
    if (!newProject.title.trim()) { toast.error("Title required"); return; }
    setCreating(true);
    try {
      const proj = await base44.entities.ResearchProject.create({
        ...newProject, owner_email: user.email, status: "Draft",
        current_step: 0, completed_steps: [], total_enrolled: 0,
        included_patients: []
      });
      toast.success("Project created!");
      setShowCreate(false);
      setNewProject({ title: "", study_type: "", institution: "" });
      setSelectedProject(proj);
      setActiveSection("builder");
      refetch();
    } catch { toast.error("Failed"); }
    finally { setCreating(false); }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await base44.entities.ResearchProject.delete(id);
    toast.success("Deleted");
    if (selectedProject?.id === id) setSelectedProject(null);
    refetch();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.ResearchProject.update(id, { status });
    if (selectedProject?.id === id) setSelectedProject(p => ({ ...p, status }));
    refetch();
  };

  const getProgress = (p) => Math.min(100, Math.round(((p.completed_steps || []).length / 10) * 100));

  // Full-screen Study Builder
  if (showStudyBuilder && selectedProject) {
    return (
      <StudyBuilder
        project={selectedProject}
        onUpdate={(updated) => { setSelectedProject(updated); refetch(); }}
        onClose={() => setShowStudyBuilder(false)}
      />
    );
  }

  return (
    <div className="flex min-h-[700px] gap-0">
      {/* Left Sidebar */}
      <div className="w-52 shrink-0 border-r bg-slate-50 flex flex-col">
        {/* Project picker */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projects</span>
            <button onClick={() => setShowCreate(true)} className="text-indigo-600 hover:bg-indigo-100 rounded p-0.5">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="w-full pl-6 pr-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300" />
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filtered.map(p => (
              <button key={p.id} onClick={() => { setSelectedProject(p); setActiveSection("dashboard"); }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${selectedProject?.id === p.id ? "bg-indigo-600 text-white" : "hover:bg-slate-200 text-slate-700"}`}>
                <div className="font-medium truncate">{p.title}</div>
                <div className={`text-xs mt-0.5 ${selectedProject?.id === p.id ? "text-indigo-200" : "text-slate-400"}`}>{p.status} · {p.total_enrolled || 0} enrolled</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-xs text-slate-400 text-center py-4">
                No projects.
                <button className="block mx-auto mt-1 text-indigo-600 underline" onClick={() => setShowCreate(true)}>Create one</button>
              </div>
            )}
          </div>
        </div>

        {/* Section Nav */}
        {selectedProject && (
          <div className="flex-1 p-3 overflow-y-auto">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workflow</span>
            <div className="space-y-0.5 mt-2">
              {OS_SECTIONS.map(s => {
                const Icon = s.icon;
                const isPremiumLocked = s.premium && !gate.isAdmin;
                return (
                  <button key={s.id} onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors ${activeSection === s.id ? "bg-indigo-600 text-white" : isPremiumLocked ? "text-slate-400 hover:bg-slate-100" : "text-slate-600 hover:bg-slate-200"}`}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate flex-1">{s.label}</span>
                    {isPremiumLocked && (
                      <span className="text-amber-500 text-xs">★</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedProject ? (
          <div className="p-6 space-y-4">
            <div className="text-center py-12">
              <FlaskConical className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Select or Create a Project</h3>
              <p className="text-slate-500 mb-4">Choose a project from the sidebar or start a new one</p>
              <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Plus className="w-4 h-4" />New Research Project
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Projects", value: projects.length, color: "text-slate-700" },
                { label: "Active", value: projects.filter(p => p.status === "Active").length, color: "text-blue-600" },
                { label: "Writing", value: projects.filter(p => p.status === "Writing").length, color: "text-amber-600" },
                { label: "Published", value: projects.filter(p => p.status === "Published").length, color: "text-green-600" },
              ].map(s => (
                <Card key={s.label} className="text-center py-3">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </Card>
              ))}
            </div>

            {/* Project Cards */}
            <div className="space-y-3">
              {projects.map(p => (
                <Card key={p.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">{p.title}</h3>
                          <Badge className={STATUS_COLORS[p.status]}>{p.status}</Badge>
                          {p.study_type && <Badge variant="outline" className="text-xs">{p.study_type}</Badge>}
                        </div>
                        <div className="flex gap-4 text-xs text-slate-500 flex-wrap mb-2">
                          {p.institution && <span><Users className="w-3 h-3 inline mr-1" />{p.institution}</span>}
                          <span><Calendar className="w-3 h-3 inline mr-1" />{formatDistanceToNow(new Date(p.created_date), { addSuffix: true })}</span>
                          <span><UserCheck className="w-3 h-3 inline mr-1" />{p.total_enrolled || 0} enrolled</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={getProgress(p)} className="flex-1 h-1.5" />
                          <span className="text-xs text-indigo-600 font-semibold w-8">{getProgress(p)}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs gap-1 h-7"
                          onClick={() => { setSelectedProject(p); setActiveSection("dashboard"); }}>
                          <ChevronRight className="w-3 h-3" />Open
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteProject(p.id)}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5">
            {/* Project Header */}
            <div className="flex items-start gap-3 mb-4 pb-4 border-b">
              <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-700 mt-1">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-900 truncate">{selectedProject.title}</h2>
                <div className="flex gap-2 items-center mt-0.5 flex-wrap">
                  <Badge className={STATUS_COLORS[selectedProject.status]}>{selectedProject.status}</Badge>
                  <span className="text-xs text-slate-400">{selectedProject.total_enrolled || 0} enrolled · {getProgress(selectedProject)}% complete</span>
                </div>
                {/* Adaptive Methodology Engine — Study Type Badge */}
                <div className="mt-2">
                  <StudyTypeDetector
                    title={selectedProject.title}
                    currentStudyType={selectedProject.study_type}
                    compact={true}
                    onSelectType={async (typeId) => {
                      await base44.entities.ResearchProject.update(selectedProject.id, { study_type: typeId });
                      setSelectedProject(p => ({ ...p, study_type: typeId }));
                      refetch();
                    }}
                  />
                </div>
              </div>
              <Select value={selectedProject.status} onValueChange={v => updateStatus(selectedProject.id, v)}>
                <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Section Content */}
            {activeSection === "dashboard" && (
              <div className="space-y-4">
                {/* Quick stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Study Progress", value: `${getProgress(selectedProject)}%`, sub: `${(selectedProject.completed_steps || []).length}/10 steps` },
                    { label: "Enrolled", value: selectedProject.total_enrolled || 0, sub: `of ${selectedProject.sample_size?.calculated || "?"} target` },
                    { label: "Ethics", value: selectedProject.ethics_status || "Pending", sub: selectedProject.iec_number || "No IEC" },
                    { label: "Design", value: selectedProject.study_type || "Not set", sub: selectedProject.institution || "—" },
                  ].map(s => (
                    <Card key={s.label} className="text-center p-4">
                      <p className="text-lg font-bold text-indigo-700">{s.value}</p>
                      <p className="text-xs font-medium text-slate-600">{s.label}</p>
                      <p className="text-xs text-slate-400">{s.sub}</p>
                    </Card>
                  ))}
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { label: "Protocol Builder", icon: Target, action: () => setShowStudyBuilder(true), color: "bg-indigo-600" },
                        { label: "Patient Matching", icon: UserCheck, action: () => setActiveSection("eligibility"), color: "bg-green-600" },
                        { label: "Analytics", icon: BarChart3, action: () => setActiveSection("analytics"), color: "bg-purple-600" },
                        { label: "Manuscript Studio", icon: BookOpen, action: () => setActiveSection("manuscript"), color: "bg-amber-600" },
                        { label: "Grant Studio", icon: FileText, action: () => setActiveSection("grant"), color: gate.isAdmin ? "bg-rose-600" : "bg-slate-400" },
                        { label: "Lit Monitor", icon: Search, action: () => setActiveSection("lit_monitor"), color: gate.isAdmin ? "bg-teal-600" : "bg-slate-400" },
                        { label: "CRF Builder", icon: Database, action: () => setActiveSection("crf"), color: "bg-cyan-600" },
                        { label: "Import & Continue", icon: Shield, action: () => setActiveSection("import"), color: "bg-slate-600" },
                      ].map(a => (
                        <button key={a.label} onClick={a.action}
                          className={`${a.color} text-white rounded-xl p-3 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity`}>
                          <a.icon className="w-5 h-5" />
                          <span className="text-xs font-semibold text-center">{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* PICO summary */}
                {selectedProject.pico?.population && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Research Question (PICO)</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 text-xs">
                      {[["Population", selectedProject.pico?.population], ["Intervention", selectedProject.pico?.intervention], ["Comparison", selectedProject.pico?.comparison], ["Outcome", selectedProject.pico?.outcome]].map(([k, v]) => (
                        <div key={k} className="p-2 bg-slate-50 rounded-lg">
                          <span className="font-semibold text-indigo-700">{k}:</span>
                          <span className="text-slate-700 ml-1">{v || "—"}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Enrolled patients */}
                {selectedProject.included_patients?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Enrolled Patients ({selectedProject.included_patients.length})</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {patients.filter(p => selectedProject.included_patients?.includes(p.id)).map(p => (
                          <Badge key={p.id} variant="outline" className="text-xs">
                            {p.patient_name || p.name} · {p.age_years || p.age}y
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeSection === "import" && (
              <ResearchContinuationWorkspace
                project={selectedProject}
                onProjectUpdate={(updated) => { setSelectedProject(updated); refetch(); }}
              />
            )}

            {activeSection === "builder" && (
              <div className="space-y-3">
                {/* Study Type Detector — full mode in builder */}
                <StudyTypeDetector
                  title={selectedProject.title}
                  currentStudyType={selectedProject.study_type}
                  onDetected={(detected) => {
                    if (!selectedProject.study_type) {
                      // Auto-suggest but don't force
                    }
                  }}
                  onSelectType={async (typeId) => {
                    await base44.entities.ResearchProject.update(selectedProject.id, { study_type: typeId });
                    setSelectedProject(p => ({ ...p, study_type: typeId }));
                    refetch();
                  }}
                />
                <Alert className="border-indigo-200 bg-indigo-50">
                  <AlertDescription className="text-sm flex items-center justify-between">
                    <span>Full step-by-step study builder with adaptive AI assistance</span>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 ml-4" onClick={() => setShowStudyBuilder(true)}>
                      Open Study Builder <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {activeSection === "reporting" && (
              <ReportingGuidelineTracker
                studyTypeId={selectedProject.study_type || classifyStudyType(selectedProject.title)?.detected?.id}
                projectChecklist={selectedProject.checklist_strobe || selectedProject.checklist_consort}
                onChecklistUpdate={async (updated) => {
                  const field = selectedProject.study_type === "rct" ? "checklist_consort" : "checklist_strobe";
                  await base44.entities.ResearchProject.update(selectedProject.id, { [field]: updated });
                }}
              />
            )}

            {activeSection === "eligibility" && (
              <EligibilityEngine project={selectedProject} onEnroll={() => { refetch(); }} />
            )}

            {activeSection === "crf" && (
              <FormBuilder onSave={(formData) => toast.success("CRF saved!")} />
            )}

            {activeSection === "ocr" && (
              <Card>
                <CardContent className="p-4">
                  <EHRExtractor />
                </CardContent>
              </Card>
            )}

            {activeSection === "data" && (
              <DataExtractor
                patientId={patients[0]?.id}
                researchForm={{ sections: selectedProject.data_fields || [] }}
                onDataExtracted={(data) => toast.success("Clinical data extracted!")}
              />
            )}

            {activeSection === "analytics" && (
              <StatisticalAnalysis projectId={selectedProject.id} />
            )}

            {activeSection === "manuscript" && (
              <ManuscriptStudio project={selectedProject} />
            )}

            {activeSection === "literature" && (
              <LiteratureSearch projectId={selectedProject.id} />
            )}

            {activeSection === "lit_monitor" && (
              <PremiumFeatureGate
                hasAccess={gate.canAccess(FEATURE_GATES.LITERATURE_MONITOR)}
                featureName="Literature Monitoring Engine"
                description="Automated PubMed + Google Scholar surveillance with AI-powered abstract summarization, evidence gap analysis, and real-time guideline updates for your specific study topic."
                icon={BookOpen}
              >
                <LiteratureMonitorEngine project={selectedProject} />
              </PremiumFeatureGate>
            )}

            {activeSection === "grant" && (
              <PremiumFeatureGate
                hasAccess={gate.canAccess(FEATURE_GATES.GRANT_WRITING_STUDIO)}
                featureName="Grant Writing Studio"
                description="AI-assisted grant generation for ICMR, ANRF, DBT, DST, AIIMS Intramural and more. Includes smart budget engine, section-by-section AI writing, and AI reviewer simulation."
                icon={FileText}
              >
                <GrantWritingStudio project={selectedProject} />
              </PremiumFeatureGate>
            )}
          </div>
        )}
      </div>

      {/* Floating AI Assistant */}
      {selectedProject && (
        <ResearchAIAssistant
          project={selectedProject}
          currentSection={OS_SECTIONS.find(s => s.id === activeSection)?.label}
        />
      )}

      {/* Create Project Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-600" />New Research Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Project Title *</label>
              <Input value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Efficacy of Levamisole in FRNS — A Pediatric RCT" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Study Design</label>
              <Select value={newProject.study_type} onValueChange={v => setNewProject(p => ({ ...p, study_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select design..." /></SelectTrigger>
                <SelectContent>
                  {["RCT", "Cohort", "CaseControl", "CrossSectional", "CaseSeries", "Diagnostic", "Systematic"].map(d =>
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Institution</label>
              <Input value={newProject.institution} onChange={e => setNewProject(p => ({ ...p, institution: e.target.value }))}
                placeholder="e.g., AIIMS Patna" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={createProject} disabled={creating} className="bg-indigo-600 hover:bg-indigo-700">
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Create & Open Builder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}