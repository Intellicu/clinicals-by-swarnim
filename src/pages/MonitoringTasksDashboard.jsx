import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Search, Download, Filter, AlertTriangle, CheckCircle, Clock, User, Loader2, Brain } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS = {
  Active: "bg-blue-100 text-blue-800",
  Relapse: "bg-red-100 text-red-800",
  Remission: "bg-green-100 text-green-800",
  "Steroid Resistant": "bg-purple-100 text-purple-800",
  CKD: "bg-amber-100 text-amber-800",
  Transplant: "bg-teal-100 text-teal-800",
};

const URGENCY_COLORS = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Routine: "bg-slate-100 text-slate-700",
};

function getUrgencyFromPatient(patient) {
  const diag = (patient.diagnosis || "").toLowerCase();
  if (diag.includes("srns") || diag.includes("ahus") || diag.includes("rpgn") || diag.includes("resistant")) return "Critical";
  if (diag.includes("relapse") || diag.includes("frns") || diag.includes("ckd stage 4") || diag.includes("ckd stage 5")) return "High";
  return "Routine";
}

function getMonitoringTasks(patient) {
  const tasks = [];
  const diag = (patient.diagnosis || "").toLowerCase();
  if (diag.includes("nephrotic") || diag.includes("ns")) {
    tasks.push("Daily urine dipstick monitoring");
    tasks.push("Weekly weight + BP check");
    if (diag.includes("steroid") || diag.includes("prednisolone")) tasks.push("Fasting glucose (steroid DM screen)");
  }
  if (diag.includes("ckd")) {
    tasks.push("Monthly serum creatinine + eGFR");
    tasks.push("BP monitoring every visit");
    tasks.push("Anaemia screen: Hb, ferritin");
  }
  if (diag.includes("dialysis") || diag.includes("hd") || diag.includes("pd")) {
    tasks.push("Pre/post dialysis weight + BP");
    tasks.push("Monthly Kt/V or URR");
    tasks.push("Vascular access inspection each session");
  }
  if (diag.includes("transplant")) {
    tasks.push("Tacrolimus trough level");
    tasks.push("CMV PCR monthly × 3 months");
    tasks.push("BK virus PCR monthly × 6 months");
  }
  if (tasks.length === 0) tasks.push("Routine clinical review");
  return tasks;
}

function exportToCSV(patients) {
  const rows = [["Name", "Age", "Diagnosis", "Status", "Urgency", "Monitoring Tasks", "Last Updated"]];
  patients.forEach(p => {
    const tasks = getMonitoringTasks(p).join("; ");
    rows.push([
      p.full_name || p.name || "Unknown",
      p.date_of_birth ? `${Math.floor((Date.now() - new Date(p.date_of_birth)) / 31557600000)}y` : p.age || "?",
      p.diagnosis || "Not specified",
      p.ns_status || p.status || "Active",
      getUrgencyFromPatient(p),
      tasks,
      new Date(p.updated_date).toLocaleDateString(),
    ]);
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `monitoring_tasks_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Monitoring tasks exported to CSV");
}

export default function MonitoringTasksDashboard() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["monitoring-patients"],
    queryFn: () => base44.entities.Patient.list("-updated_date", 200),
  });

  const filtered = patients.filter(p => {
    const matchSearch = !search || (p.full_name || p.name || "").toLowerCase().includes(search.toLowerCase()) || (p.diagnosis || "").toLowerCase().includes(search.toLowerCase());
    const status = p.ns_status || p.status || "Active";
    const urgency = getUrgencyFromPatient(p);
    const matchStatus = filterStatus === "all" || status === filterStatus;
    const matchUrgency = filterUrgency === "all" || urgency === filterUrgency;
    return matchSearch && matchStatus && matchUrgency;
  });

  const counts = {
    Critical: filtered.filter(p => getUrgencyFromPatient(p) === "Critical").length,
    High: filtered.filter(p => getUrgencyFromPatient(p) === "High").length,
    Routine: filtered.filter(p => getUrgencyFromPatient(p) === "Routine").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">Active Patient Monitoring Tasks</h1>
            <p className="text-sm text-slate-500">All patients with active monitoring requirements — filter by status or urgency</p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => exportToCSV(filtered)}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Critical", count: counts.Critical, color: "bg-red-600", icon: AlertTriangle },
            { label: "High Priority", count: counts.High, color: "bg-orange-500", icon: Clock },
            { label: "Routine", count: counts.Routine, color: "bg-slate-600", icon: CheckCircle },
          ].map(c => {
            const Icon = c.icon;
            return (
              <Card key={c.label} className="border-2 border-slate-200">
                <CardContent className="p-4 text-center">
                  <div className={`w-9 h-9 ${c.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{c.count}</p>
                  <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9 bg-white" placeholder="Search patients or diagnosis…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterUrgency} onValueChange={setFilterUrgency}>
            <SelectTrigger className="w-36 bg-white"><SelectValue placeholder="Urgency" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Routine">Routine</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Patient List */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading patients...
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No patients found</p>
            <p className="text-sm mt-1">Add patients in the Clinic module to see monitoring tasks here</p>
          </div>
        )}
        <div className="space-y-3">
          {filtered.map(patient => {
            const urgency = getUrgencyFromPatient(patient);
            const tasks = getMonitoringTasks(patient);
            const status = patient.ns_status || patient.status || "Active";
            return (
              <Card key={patient.id} className={`border-2 ${urgency === "Critical" ? "border-red-200 bg-red-50" : urgency === "High" ? "border-orange-200 bg-orange-50" : "border-slate-200"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${urgency === "Critical" ? "bg-red-600" : urgency === "High" ? "bg-orange-500" : "bg-slate-500"}`}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{patient.full_name || patient.name || "Unknown Patient"}</h3>
                        <Badge className={`text-xs ${URGENCY_COLORS[urgency]}`}>{urgency}</Badge>
                        <Badge className={`text-xs ${STATUS_COLORS[status] || "bg-slate-100 text-slate-700"}`}>{status}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{patient.diagnosis || "Diagnosis not specified"}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tasks.map((task, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                            <Activity className="w-2.5 h-2.5 text-blue-500" /> {task}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{new Date(patient.updated_date).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}