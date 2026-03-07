import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Plus, Search, Trash2, Edit, Eye, Calculator, Brain, Syringe, UtensilsCrossed, Activity } from "lucide-react";
import { toast } from "sonner";
import PatientProfileForm from "../components/patientmanager/PatientProfileForm";
import PatientDetailPanel from "../components/patientmanager/PatientDetailPanel";

export default function PatientManager() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list"); // list | create | detail
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["pm-patients"],
    queryFn: () => base44.entities.Patient.list("-created_date", 200),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Patient.delete(id),
    onSuccess: () => { qc.invalidateQueries(["pm-patients"]); toast.success("Patient deleted"); },
  });

  const filtered = patients.filter(p =>
    [p.patient_name, p.cr_number, p.diagnosis, p.mobile_number]
      .filter(Boolean).some(f => f.toLowerCase().includes(search.toLowerCase()))
  );

  const statusColors = { Active: "bg-green-100 text-green-800", "Follow-up": "bg-blue-100 text-blue-800", Discharged: "bg-slate-100 text-slate-800", Referred: "bg-amber-100 text-amber-800" };

  if (view === "create" || (view === "detail" && editMode)) {
    return (
      <PatientProfileForm
        patient={editMode ? selectedPatient : null}
        onBack={() => { setView(selectedPatient && editMode ? "detail" : "list"); setEditMode(false); }}
        onSave={(p) => { setSelectedPatient(p); setView("detail"); setEditMode(false); qc.invalidateQueries(["pm-patients"]); }}
      />
    );
  }

  if (view === "detail" && selectedPatient) {
    return (
      <PatientDetailPanel
        patient={selectedPatient}
        onBack={() => setView("list")}
        onEdit={() => setEditMode(true)}
        onDelete={() => { deleteMutation.mutate(selectedPatient.id); setView("list"); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link to={createPageUrl("Hub")}><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Hub</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />Patient Manager
            </h1>
            <p className="text-sm text-slate-500">{patients.length} patients · Create, view, update & delete profiles</p>
          </div>
          <div className="ml-auto flex gap-2 flex-wrap">
            <Link to={createPageUrl("ClinicAnalyticsDashboard")}>
              <Button variant="outline"><Activity className="w-4 h-4 mr-2" />Analytics</Button>
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setView("create")}>
              <Plus className="w-4 h-4 mr-2" />New Patient
            </Button>
          </div>
        </div>

        {/* Clinical Tools Bar */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 mr-1">Clinical Tools:</span>
              {[
                { label: "Dose Calculator", page: "DoseCalculator", icon: Calculator, color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
                { label: "GFR / Schwartz", page: "SchwartzGFR", icon: Activity, color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
                { label: "BP Percentiles", page: "BPPercentiles", icon: Activity, color: "bg-red-100 text-red-700 hover:bg-red-200" },
                { label: "Clinical Pathways", page: "ClinicalSupport", icon: Brain, color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
                { label: "Diet Generator", page: "DietGenerator", icon: UtensilsCrossed, color: "bg-green-100 text-green-700 hover:bg-green-200" },
                { label: "Vaccination Tracker", page: "PediatricsHub", icon: Syringe, color: "bg-teal-100 text-teal-700 hover:bg-teal-200" },
                { label: "Drug Database", page: "DrugCalculator", icon: Calculator, color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <Link key={t.label} to={createPageUrl(t.page)}>
                    <Button size="sm" variant="ghost" className={`text-xs ${t.color}`}>
                      <Icon className="w-3 h-3 mr-1" />{t.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, CR number, diagnosis, or mobile…" className="pl-9 bg-white" />
        </div>

        {/* Patient List */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">Loading patients…</div>
        ) : filtered.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="py-16 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{search ? "No patients found" : "No patients yet"}</p>
              {!search && <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setView("create")}><Plus className="w-4 h-4 mr-2" />Add First Patient</Button>}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <Card key={p.id} className="bg-white shadow-sm hover:shadow-md transition-shadow border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
                      {(p.patient_name || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{p.patient_name}</h3>
                        <Badge variant="outline" className="text-xs">CR: {p.cr_number}</Badge>
                        <Badge className={`text-xs ${statusColors[p.status] || "bg-slate-100 text-slate-700"}`}>{p.status || "Active"}</Badge>
                        {p.gender && <Badge variant="outline" className="text-xs">{p.gender}</Badge>}
                        {p.age_years && <Badge variant="outline" className="text-xs">{p.age_years}y</Badge>}
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-slate-500 flex-wrap">
                        {p.diagnosis && <span><strong>Dx:</strong> {p.diagnosis}</span>}
                        {p.mobile_number && <span>📞 {p.mobile_number}</span>}
                        {p.guardian_name && <span>Guardian: {p.guardian_name}</span>}
                      </div>
                      {p.comorbidities?.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {p.comorbidities.slice(0, 3).map((c, i) => <Badge key={i} variant="outline" className="text-xs bg-slate-50">{c}</Badge>)}
                          {p.comorbidities.length > 3 && <Badge variant="outline" className="text-xs">+{p.comorbidities.length - 3}</Badge>}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedPatient(p); setView("detail"); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedPatient(p); setEditMode(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => {
                        if (confirm(`Delete ${p.patient_name}?`)) deleteMutation.mutate(p.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}