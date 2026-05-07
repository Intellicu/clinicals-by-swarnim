import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Plus, Search, FlaskConical, Calendar, Users, BarChart3,
  ChevronRight, Trash2, Archive, BookOpen, Loader2, Edit3
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS = {
  Draft: "bg-slate-100 text-slate-600",
  Active: "bg-blue-100 text-blue-700",
  Analysis: "bg-purple-100 text-purple-700",
  Writing: "bg-amber-100 text-amber-700",
  Submitted: "bg-orange-100 text-orange-700",
  Published: "bg-green-100 text-green-700",
  Archived: "bg-slate-100 text-slate-400",
};

export default function ProjectsTab({ projects, user, onRefresh, onOpenBuilder, onOpenAnalysis, onOpenManuscript }) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", study_type: "", institution: "" });

  const filtered = projects.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.study_type?.toLowerCase().includes(search.toLowerCase())
  );

  const createProject = async () => {
    if (!newProject.title.trim()) { toast.error("Title required"); return; }
    setCreating(true);
    try {
      await base44.entities.ResearchProject.create({
        ...newProject,
        owner_email: user.email,
        status: "Draft",
        current_step: 0,
        completed_steps: [],
        total_enrolled: 0,
      });
      toast.success("Project created!");
      setShowCreate(false);
      setNewProject({ title: "", study_type: "", institution: "" });
      onRefresh();
    } catch {
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    await base44.entities.ResearchProject.delete(id);
    toast.success("Deleted");
    onRefresh();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.ResearchProject.update(id, { status });
    onRefresh();
  };

  const getCompletionPercent = (p) => {
    const completed = (p.completed_steps || []).length;
    return Math.round((completed / 10) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="pl-9" />
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-1 shrink-0">
          <Plus className="w-4 h-4" />New Project
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: projects.length, color: "text-slate-700" },
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

      {/* Projects list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No projects yet</p>
          <p className="text-sm">Create your first research project to get started</p>
          <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" />New Project</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{p.title}</h3>
                      <Badge className={STATUS_COLORS[p.status] || "bg-slate-100 text-slate-600"}>{p.status}</Badge>
                      {p.study_type && <Badge variant="outline" className="text-xs">{p.study_type}</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      {p.institution && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.institution}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDistanceToNow(new Date(p.created_date), { addSuffix: true })}</span>
                      <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{p.total_enrolled || 0} enrolled</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Study Build Progress</span>
                        <span className="text-indigo-600 font-semibold">{getCompletionPercent(p)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${getCompletionPercent(p)}%` }} />
                      </div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1 text-xs h-7"
                      onClick={() => onOpenBuilder(p)}>
                      <Edit3 className="w-3 h-3" />Build
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs h-7"
                      onClick={() => onOpenAnalysis(p)}>
                      <BarChart3 className="w-3 h-3" />Analyze
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs h-7"
                      onClick={() => onOpenManuscript(p)}>
                      <BookOpen className="w-3 h-3" />Write
                    </Button>
                    <Select onValueChange={val => updateStatus(p.id, val)} value={p.status}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteProject(p.id)}>
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-600" />New Research Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Project Title *</label>
              <Input value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Efficacy of Levamisole in FRNS — A RCT" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Study Design (optional)</label>
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
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}