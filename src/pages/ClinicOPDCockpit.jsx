import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Users, Calendar, Search, Plus, Building2, Play, Clock,
  ChevronRight, Home, Zap, AlertTriangle, CheckCircle,
  Activity, Pill, FileText, RefreshCw,
  ArrowLeft, UserPlus, Stethoscope
} from "lucide-react";
import { format, isSameDay, parseISO, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import WorkspaceWizard from "@/components/clinic/WorkspaceWizard";
import PatientOnboarding from "@/components/clinic/PatientOnboarding";
import QuickAppointmentBar from "@/components/clinic/QuickAppointmentBar";

const EMERGENCY_PROTOCOLS = [
  { label: "Hyperkalemia", color: "bg-red-600", path: "EmergencyHub" },
  { label: "HTN Emergency", color: "bg-orange-600", path: "EmergencyHub" },
  { label: "Pulmonary Edema", color: "bg-red-700", path: "EmergencyHub" },
  { label: "NS Relapse", color: "bg-purple-600", path: "ClinicalSupport" },
  { label: "AKI Protocol", color: "bg-amber-600", path: "AKIStager" },
];

function diagnosisBadge(d = "") {
  const dl = d.toLowerCase();
  if (dl.includes("srns") || dl.includes("resistant")) return "bg-red-100 text-red-800";
  if (dl.includes("frns") || dl.includes("relapse")) return "bg-orange-100 text-orange-800";
  if (dl.includes("transplant")) return "bg-teal-100 text-teal-800";
  if (dl.includes("ckd")) return "bg-blue-100 text-blue-800";
  if (dl.includes("aki")) return "bg-amber-100 text-amber-800";
  if (dl.includes("dialysis") || dl.includes("hd") || dl.includes("pd")) return "bg-cyan-100 text-cyan-800";
  if (dl.includes("nephrotic") || dl.includes("ns")) return "bg-purple-100 text-purple-800";
  return "bg-slate-100 text-slate-700";
}

function statusColor(status = "") {
  if (status === "Completed") return "bg-green-100 text-green-800";
  if (status === "In Progress") return "bg-blue-100 text-blue-800";
  if (status === "Cancelled") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-700";
}

export default function ClinicOPDCockpit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [view, setView] = useState("queue"); // queue | patients | search
  const [search, setSearch] = useState("");
  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: workspaces = [] } = useQuery({
    queryKey: ["workspaces", user?.email],
    queryFn: () => base44.entities.Workspace.filter({ owner_email: user?.email }),
    enabled: !!user,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => base44.entities.Patient.list("-updated_date", 100),
    enabled: !!selectedWorkspace,
  });

  const { data: appointments = [], isLoading: loadingApts } = useQuery({
    queryKey: ["appointments", selectedWorkspace?.id],
    queryFn: () => base44.entities.Appointment.list("-appointment_date", 60),
    enabled: !!selectedWorkspace,
    refetchInterval: 60000,
  });

  const updateAptMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  // Auto-select first workspace
  useEffect(() => {
    if (!selectedWorkspace && workspaces.length > 0) setSelectedWorkspace(workspaces[0]);
  }, [workspaces, selectedWorkspace]);

  const todayApts = useMemo(() =>
    appointments.filter(a => {
      const d = new Date(a.appointment_date);
      return isSameDay(d, new Date());
    }).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)),
    [appointments]
  );

  const filteredPatients = useMemo(() =>
    patients.filter(p =>
      p.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.cr_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(search.toLowerCase())
    ),
    [patients, search]
  );

  const stats = useMemo(() => ({
    total: todayApts.length,
    scheduled: todayApts.filter(a => a.status === "Scheduled").length,
    completed: todayApts.filter(a => a.status === "Completed").length,
    inProgress: todayApts.filter(a => a.status === "In Progress").length,
  }), [todayApts]);

  const openPatient = (patient) => {
    navigate(createPageUrl("PatientCockpit"), { state: { patient, workspace: selectedWorkspace } });
  };

  const startConsult = (apt) => {
    updateAptMutation.mutate({ id: apt.id, data: { status: "In Progress" } });
    const patient = patients.find(p => p.id === apt.patient_id);
    if (patient) {
      navigate(createPageUrl("PatientCockpit"), {
        state: { patient, workspace: selectedWorkspace, appointment: apt, mode: "consult" }
      });
    } else {
      toast.error("Patient not found");
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["patients"] });
  };

  // ── Workspace selection ─────────────────────────────────────────────────
  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Clinic OPD</h1>
              <p className="text-sm text-slate-500">Select workspace to begin</p>
            </div>
          </div>

          {workspaces.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-blue-200">
              <Building2 className="w-12 h-12 text-blue-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 mb-2">No workspaces yet</h3>
              <p className="text-sm text-slate-500 mb-4">Create your first clinic workspace to start</p>
              <Button onClick={() => setShowWorkspaceWizard(true)} className="bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />Create Workspace
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {workspaces.map(ws => (
                <button key={ws.id} onClick={() => setSelectedWorkspace(ws)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{ws.name}</p>
                    <p className="text-sm text-slate-500 truncate">{ws.description || "Pediatric Nephrology Clinic"}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </button>
              ))}
              <button onClick={() => setShowWorkspaceWizard(true)}
                className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-300 transition-all text-left">
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Plus className="w-6 h-6 text-slate-500" />
                </div>
                <p className="font-semibold text-slate-600">Add New Workspace</p>
              </button>
            </div>
          )}
        </div>
        <Dialog open={showWorkspaceWizard} onOpenChange={setShowWorkspaceWizard}>
          <DialogContent className="max-w-2xl">
            <WorkspaceWizard onComplete={(ws) => { setShowWorkspaceWizard(false); setSelectedWorkspace(ws); }} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Main OPD Cockpit ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(createPageUrl("Hub"))} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <Home className="w-4 h-4 text-slate-500" />
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <button onClick={() => setSelectedWorkspace(null)} className="text-sm font-semibold text-slate-700 hover:text-blue-600 truncate max-w-[120px]">
              {selectedWorkspace.name}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 text-xs border-0">
                <Clock className="w-3 h-3 mr-1" />{format(new Date(), "EEE d MMM")}
              </Badge>
              <button onClick={handleRefresh} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 border-t border-slate-100">
          {[
            { label: "Total", val: stats.total, color: "text-slate-700" },
            { label: "Pending", val: stats.scheduled, color: "text-blue-600" },
            { label: "Active", val: stats.inProgress, color: "text-green-600" },
            { label: "Done", val: stats.completed, color: "text-slate-500" },
          ].map(s => (
            <div key={s.label} className="text-center py-1.5 border-r last:border-r-0 border-slate-100">
              <p className={`text-lg font-bold leading-none ${s.color}`}>{s.val}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="flex border-t border-slate-100">
          {[
            { id: "queue", label: "Today's Queue", icon: Calendar },
            { id: "patients", label: "Patients", icon: Users },
            { id: "search", label: "Search", icon: Search },
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border-b-2 transition-colors ${view === t.id ? "border-blue-600 text-blue-700 bg-blue-50" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 py-3 space-y-3 pb-24">

        {/* Quick actions toolbar */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setShowEnroll(true)} size="sm"
            className="bg-blue-600 hover:bg-blue-700 h-9 gap-1.5 text-xs">
            <UserPlus className="w-3.5 h-3.5" />Enroll Patient
          </Button>
          <QuickAppointmentBar workspaceId={selectedWorkspace.id} patients={patients} />
        </div>

        {/* Emergency one-tap strip */}
        <div className="bg-white rounded-xl border border-red-100 p-2">
          <p className="text-xs font-bold text-red-600 mb-1.5 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />Emergency Access
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {EMERGENCY_PROTOCOLS.map(ep => (
              <button key={ep.label} onClick={() => navigate(createPageUrl(ep.path))}
                className={`px-2.5 py-1 rounded-full text-xs font-bold text-white border-0 ${ep.color} hover:opacity-90 transition-opacity`}>
                {ep.label}
              </button>
            ))}
          </div>
        </div>

        {/* TODAY'S QUEUE */}
        {view === "queue" && (
          <div className="space-y-2">
            {loadingApts ? (
              <div className="text-center py-10 text-slate-400 text-sm">Loading queue…</div>
            ) : todayApts.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No appointments today</p>
                <Button className="mt-3 bg-blue-600" size="sm" onClick={() => setShowEnroll(true)}>
                  <Plus className="w-4 h-4 mr-1" />Enroll & Book Patient
                </Button>
              </div>
            ) : (
              todayApts.map((apt, idx) => {
                const pt = patients.find(p => p.id === apt.patient_id);
                const isActive = apt.status === "In Progress";
                const isDone = apt.status === "Completed";
                return (
                  <div key={apt.id}
                    className={`bg-white rounded-2xl border-2 transition-all ${isActive ? "border-green-400 shadow-md" : isDone ? "border-slate-100 opacity-70" : "border-slate-200 hover:border-blue-300"}`}>
                    <div className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Token number */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${isActive ? "bg-green-600 text-white" : isDone ? "bg-slate-200 text-slate-600" : "bg-blue-100 text-blue-700"}`}>
                          {idx + 1}
                        </div>
                        {/* Time */}
                        <div className="flex-shrink-0 text-center min-w-[40px]">
                          <p className="text-xs font-bold text-blue-600 leading-none">{format(new Date(apt.appointment_date), "HH:mm")}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Token {idx + 1}</p>
                        </div>
                        {/* Patient info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-slate-900 text-sm">{apt.patient_name || pt?.patient_name}</p>
                            <Badge className={`text-xs border-0 ${statusColor(apt.status)}`}>{apt.status}</Badge>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {pt?.diagnosis && (
                              <Badge className={`text-xs border-0 ${diagnosisBadge(pt.diagnosis)}`}>{pt.diagnosis}</Badge>
                            )}
                            {pt?.age_years && <span className="text-xs text-slate-500">{pt.age_years}y</span>}
                            {apt.chief_complaint && <span className="text-xs text-slate-500 truncate">· {apt.chief_complaint}</span>}
                          </div>
                        </div>
                        {/* Action */}
                        {!isDone && (
                          <Button size="sm" onClick={() => startConsult(apt)}
                            className={`flex-shrink-0 h-9 text-xs ${isActive ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                            <Play className="w-3.5 h-3.5 mr-1" />
                            {isActive ? "Resume" : "Start"}
                          </Button>
                        )}
                        {isDone && (
                          <Button size="sm" variant="outline" onClick={() => openPatient(pt)}
                            className="flex-shrink-0 h-9 text-xs">
                            <FileText className="w-3.5 h-3.5 mr-1" />View
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PATIENTS TAB */}
        {view === "patients" && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search patients…" value={search}
                onChange={e => setSearch(e.target.value)} className="pl-9 h-10" />
            </div>
            {patients.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm mb-3">No patients enrolled</p>
                <Button size="sm" className="bg-blue-600" onClick={() => setShowEnroll(true)}>
                  <Plus className="w-4 h-4 mr-1" />Enroll First Patient
                </Button>
              </div>
            ) : (
              (search ? filteredPatients : patients).map(p => (
                <button key={p.id} onClick={() => openPatient(p)}
                  className="w-full bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all p-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {p.patient_name?.[0]?.toUpperCase() || "P"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm">{p.patient_name}</p>
                      <p className="text-xs text-slate-500">CR# {p.cr_number} · {p.age_years ? `${p.age_years}y` : ""} · {p.gender || ""}</p>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {p.diagnosis && <Badge className={`text-xs border-0 ${diagnosisBadge(p.diagnosis)}`}>{p.diagnosis}</Badge>}
                        {p.updated_date && <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(p.updated_date), { addSuffix: true })}</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* SEARCH TAB */}
        {view === "search" && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Patient name, CR number, diagnosis…" value={search}
                onChange={e => setSearch(e.target.value)} className="pl-9 h-10" autoFocus />
            </div>
            {search && filteredPatients.map(p => (
              <button key={p.id} onClick={() => openPatient(p)}
                className="w-full bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 p-3 text-left transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {p.patient_name?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{p.patient_name}</p>
                    <p className="text-xs text-slate-500">CR# {p.cr_number} · {p.age_years}y · {p.gender}</p>
                    {p.diagnosis && <Badge className={`text-xs border-0 mt-0.5 ${diagnosisBadge(p.diagnosis)}`}>{p.diagnosis}</Badge>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              </button>
            ))}
            {search && filteredPatients.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">No patients found for "{search}"</div>
            )}
            {!search && (
              <div className="text-center py-8 text-slate-400">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Type to search patients</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={showEnroll} onOpenChange={setShowEnroll}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-auto">
          <PatientOnboarding workspaceId={selectedWorkspace.id} onComplete={(p) => {
            setShowEnroll(false);
            queryClient.invalidateQueries({ queryKey: ["patients"] });
            toast.success(`${p?.patient_name} enrolled!`);
          }} />
        </DialogContent>
      </Dialog>

      <Dialog open={showWorkspaceWizard} onOpenChange={setShowWorkspaceWizard}>
        <DialogContent className="max-w-2xl">
          <WorkspaceWizard onComplete={(ws) => {
            setShowWorkspaceWizard(false);
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            setSelectedWorkspace(ws);
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}