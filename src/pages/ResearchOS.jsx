import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, BookOpen, Layers, Sparkles, ArrowLeft } from "lucide-react";
import ProjectsTab from "../components/ros/ProjectsTab";
import StudyBuilder from "../components/ros/StudyBuilder";
import AnalysisEngine from "../components/ros/AnalysisEngine";
import ManuscriptWriter from "../components/ros/ManuscriptWriter";
import KnowledgeHub from "../components/ros/KnowledgeHub";

const TABS = [
  { id: "projects", label: "Projects", icon: FlaskConical },
  { id: "knowledge", label: "Knowledge & Tools", icon: BookOpen },
];

export default function ResearchOS() {
  const [activeTab, setActiveTab] = useState("projects");
  const [activeView, setActiveView] = useState(null); // null | "builder" | "analysis" | "manuscript"
  const [selectedProject, setSelectedProject] = useState(null);

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const { data: projects = [], refetch: refetchProjects } = useQuery({
    queryKey: ["research_projects"],
    queryFn: () => base44.entities.ResearchProject.list("-created_date", 50),
    enabled: !!user
  });

  const { data: studyData = [] } = useQuery({
    queryKey: ["study_data", selectedProject?.id],
    queryFn: () => base44.entities.StudyData.filter({ project_id: selectedProject.id }),
    enabled: !!selectedProject?.id
  });

  const handleOpenBuilder = (project) => {
    setSelectedProject(project);
    setActiveView("builder");
  };

  const handleOpenAnalysis = (project) => {
    setSelectedProject(project);
    setActiveView("analysis");
  };

  const handleOpenManuscript = (project) => {
    setSelectedProject(project);
    setActiveView("manuscript");
  };

  const handleBack = () => {
    setActiveView(null);
    setSelectedProject(null);
    refetchProjects();
  };

  const handleProjectUpdate = (updated) => {
    setSelectedProject(updated);
    refetchProjects();
  };

  // Full-page views (Study Builder is full-screen)
  if (activeView === "builder" && selectedProject) {
    return (
      <StudyBuilder
        project={selectedProject}
        onUpdate={handleProjectUpdate}
        onClose={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 px-4 md:px-6 py-6 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Research OS</h1>
              <p className="text-indigo-200 text-sm">AI-assisted clinical research workflow</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 ml-auto">Beta</Badge>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Projects", value: projects.length },
              { label: "Active", value: projects.filter(p => p.status === "Active").length },
              { label: "Published", value: projects.filter(p => p.status === "Published").length },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-indigo-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 flex gap-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setActiveView(null); setSelectedProject(null); }}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "projects" && !activeView && user && (
          <ProjectsTab
            projects={projects}
            user={user}
            onRefresh={refetchProjects}
            onOpenBuilder={handleOpenBuilder}
            onOpenAnalysis={handleOpenAnalysis}
            onOpenManuscript={handleOpenManuscript}
          />
        )}

        {activeTab === "projects" && activeView === "analysis" && selectedProject && (
          <div>
            <AnalysisEngine
              project={selectedProject}
              studyData={studyData}
              onBack={handleBack}
            />
          </div>
        )}

        {activeTab === "projects" && activeView === "manuscript" && selectedProject && (
          <div>
            <ManuscriptWriter
              project={selectedProject}
              analysisResults={[]}
              onBack={handleBack}
            />
          </div>
        )}

        {activeTab === "knowledge" && (
          <KnowledgeHub />
        )}
      </div>
    </div>
  );
}