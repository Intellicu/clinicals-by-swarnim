import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Users, Plus, Search, Pencil, Trash2, Eye,
  Baby, Syringe, UtensilsCrossed, Activity, Calculator, Brain,
  Phone, MapPin, Calendar, AlertTriangle, FileText, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const EMPTY_PATIENT = {
  patient_name: "", cr_number: "", mobile_number: "", date_of_birth: "",
  age_years: "", gender: "", guardian_name: "", address: "", diagnosis: "",
  comorbidities: [], allergies: [], current_medications: [], status: "Active", notes: ""
};

function PatientForm({ patient, onSave, onCancel }) {
  const [form, setForm] = useState(patient || EMPTY_PATIENT);
  const [comorbInput, setComorbInput] = useState((patient?.comorbidities || []).join(", "));
  const [allergyInput, setAllergyInput] = useState((patient?.allergies || []).join(", "));
  const [medInput, setMedInput] = useState((patient?.current_medications || []).join(", "));

  const handleSave = () => {
    if (!form.patient_name || !form.cr_number) { toast.error("Name and CR number are required"); return; }
    onSave({
      ...form,
      comorbidities: comorbInput.split(",").map(s => s.trim()).filter(Boolean),
      allergies: allergyInput.split(",").map(s => s.trim()).filter(Boolean),
      current_medications: medInput.split(",").map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold">Patient Name *</Label>
          <Input value={form.patient_name} onChange={e => setForm({...form, patient_name: e.target.value})} placeholder="Full name" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold">CR Number *</Label>
          <Input value={form.cr_number} onChange={e => setForm({...form, cr_number: e.target.value})} placeholder="e.g. CR-001" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold">Date of Birth</Label>
          <Input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold">Age (years)</Label>
          <Input type="number" value={form.age_years} onChange={e => setForm({...form, age_years: e.target.value})} placeholder="e.g. 7" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold">Gender</Label>
          <Select value={form.gender} onValueChange={v => setForm({...form, gender: v})}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-semibold">Status</Label>
          <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Follow-up">Follow-up</SelectItem>
              <SelectItem value="Discharged">Discharged</SelectItem>
              <SelectItem value="Referred">Referred</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-semibold">Mobile Number</Label>
          <Input value={form.mobile_number} onChange={e => setForm({...form, mobile_number: e.target.value})} placeholder="+91 XXXXXXXXXX" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-semibold">Guardian Name</Label>
          <Input value={form.guardian_name} onChange={e => setForm({...form, guardian_name: e.target.value})} placeholder="Parent/guardian" className="mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold">Address</Label>
        <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Residential address" className="mt-1" />
      </div>
      <div>
        <Label className="text-xs font-semibold">Primary Diagnosis</Label>
        <Input value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} placeholder="e.g. Nephrotic Syndrome, CKD Stage 3" className="mt-1" />
      </div>
      <div>
        <Label className="text-xs font-semibold">Comorbidities (comma-separated)</Label>
        <Input value={comorbInput} onChange={e => setComorbInput(e.target.value)} placeholder="e.g. Hypertension, Anemia" className="mt-1" />
      </div>
      <div>
        <Label className="text-xs font-semibold">Allergies (comma-separated)</Label>
        <Input value={allergyInput} onChange={e => setAllergyInput(e.target.value)} placeholder="e.g. Penicillin, Sulfa" className="mt-1" />
      </div>
      <div>
        <Label className="text-xs font-semibold">Current Medications (comma-separated)</Label>
        <Input value={medInput} onChange={e => setMedInput(e.target.value)} placeholder="e.g. Prednisolone 30mg, Enalapril 2.5mg" className="mt-1" />
      </div>
      <div>
        <Label className="text-xs font-semibold">Clinical Notes</Label>
        <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="General notes..." className="mt-1" rows={3} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 flex-1">Save Patient</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function PatientDetailPanel({ patient, onEdit, onClose }) {
  const statusColors = { Active: "bg-green-100 text-green-800", "Follow-up": "bg-blue-100 text-blue-800", Discharged: "bg-slate-100 text-slate-800", Referred: "bg-amber-100 text-amber-800" };

  const clinicalTools = [
    { label: "Growth Assessment", icon: Activity, page: "PediatricsHub", param: "growth" },
    { label: "Vaccination Tracker", icon: Syringe, page: "PediatricsHub", param: "vaccination" },
    { label: "Diet Plan", icon: UtensilsCrossed, page: "DietGenerator", param: null },
    { label: "Dose Calculator", icon: Calculator, page: "DoseCalculator", param: null },
    { label: "BP Percentiles", icon: Activity, page: "BPPercentiles", param: null },
    { label: "Clinical Notes", icon: Brain, page: "ClinicDashboard", param: null },
  ];

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{patient.patient_name}</h2>
          <p className="text-sm text-slate-500">CR: {patient.cr_number}</p>
        </div>
        <Badge className={statusColors[patient.status] || "bg-slate-100 text-slate-700"}>{patient.status}</Badge>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {patient.age_years && <div className="flex items-center gap-1.5 text-slate-600"><Baby className="w-4 h-4" />{patient.age_years} years, {patient.gender}</div>}
        {patient.mobile_number && <div className="flex items-center gap-1.5 text-slate-600"><Phone className="w-4 h-4" />{patient.mobile_number}</div>}
        {patient.guardian_name && <div className="flex items-center gap-1.5 text-slate-600"><Users className="w-4 h-4" />{patient.guardian_name}</div>}
        {patient.address && <div className="flex items-center gap-1.5 text-slate-600 col-span-2"><MapPin className="w-4 h-4" />{patient.address}</div>}
        {patient.date_of_birth && <div className="flex items-center gap-1.5 text-slate-600"><Calendar className="w-4 h-4" />DOB: {patient.date_of_birth}</div>}
      </div>

      {/* Medical Info */}
      {patient.diagnosis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-blue-700 mb-1">Primary Diagnosis</div>
          <div className="text-sm text-blue-900 font-medium">{patient.diagnosis}</div>
        </div>
      )}

      {patient.comorbidities?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-600 mb-1">Comorbidities</div>
          <div className="flex flex-wrap gap-1">{patient.comorbidities.map((c, i) => <Badge key={i} variant="outline" className="text-xs">{c}</Badge>)}</div>
        </div>
      )}

      {patient.allergies?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" />Allergies</div>
          <div className="flex flex-wrap gap-1">{patient.allergies.map((a, i) => <Badge key={i} className="bg-red-100 text-red-800 text-xs">{a}</Badge>)}</div>
        </div>
      )}

      {patient.current_medications?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-600 mb-1">Current Medications</div>
          <div className="space-y-0.5">{patient.current_medications.map((m, i) => <div key={i} className="text-xs bg-slate-50 border rounded px-2 py-1 text-slate-700">{m}</div>)}</div>
        </div>
      )}

      {patient.notes && (
        <div>
          <div className="text-xs font-semibold text-slate-600 mb-1">Notes</div>
          <div className="text-sm text-slate-700 bg-slate-50 rounded p-2 border">{patient.notes}</div>
        </div>
      )}

      {/* Associated Clinical Tools */}
      <div>
        <div className="text-xs font-semibold text-slate-600 mb-2">Clinical Tools for this Patient</div>
        <div className="grid grid-cols-2 gap-2">
          {clinicalTools.map(tool => {
            const Icon = tool.icon;
            return (
              <Link key={tool.label} to={createPageUrl(tool.page)}>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-1.5 h-auto py-2">
                  <Icon className="w-3.5 h-3.5 text-blue-600" />{tool.label}
                  <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <Button onClick={onEdit} variant="outline" size="sm" className="flex-1"><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
        <Button onClick={onClose} size="sm" className="flex-1">Close</Button>
      </div>
    </div>
  );
}

export default function PatientManager() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients-manager"],
    queryFn: () => base44.entities.Patient.list("-created_date", 500),
  });

  const createMutation = useMutation({
    mutationFn: data => base44.entities.Patient.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patients-manager"] }); setShowForm(false); toast.success("Patient created"); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Patient.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patients-manager"] }); setEditingPatient(null); toast.success("Patient updated"); },
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.Patient.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patients-manager"] }); toast.success("Patient deleted"); },
  });

  const handleSave = (data) => {
    if (editingPatient) updateMutation.mutate({ id: editingPatient.id, data });
    else createMutation.mutate(data);
  };

  const handleDelete = (patient) => {
    if (confirm(`Delete ${patient.patient_name}? This cannot be undone.`)) {
      deleteMutation.mutate(patient.id);
      if (viewingPatient?.id === patient.id) setViewingPatient(null);
    }
  };

  const filtered = patients.filter(p => {
    const matchSearch = !search || p.patient_name?.toLowerCase().includes(search.toLowerCase()) || p.cr_number?.toLowerCase().includes(search.toLowerCase()) || p.diagnosis?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColors = { Active: "bg-green-100 text-green-800", "Follow-up": "bg-blue-100 text-blue-800", Discharged: "bg-slate-100 text-slate-600", Referred: "bg-amber-100 text-amber-800" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Hub</Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />Patient Manager
            </h1>
            <p className="text-sm text-slate-500">Create, view, update, and manage patient profiles</p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl("ClinicAnalyticsDashboard")}>
              <Button variant="outline" size="sm"><Activity className="w-4 h-4 mr-1" />Analytics</Button>
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { setEditingPatient(null); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />New Patient
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, CR, diagnosis…" className="pl-9" />
          </div>
          <div className="flex gap-1">
            {["all", "Active", "Follow-up", "Discharged", "Referred"].map(s => (
              <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className="text-xs capitalize">
                {s === "all" ? "All" : s}
              </Button>
            ))}
          </div>
          <Badge variant="outline" className="text-xs px-3 py-1.5">{filtered.length} patients</Badge>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Patient List */}
          <div className="lg:col-span-2 space-y-3">
            {isLoading ? (
              <div className="text-center py-16 text-slate-400">Loading patients…</div>
            ) : filtered.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No patients found</p>
                  <p className="text-slate-400 text-sm mt-1">{search ? "Try a different search term" : "Click 'New Patient' to add your first patient"}</p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => { setEditingPatient(null); setShowForm(true); }}>
                    <Plus className="w-4 h-4 mr-2" />Add Patient
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filtered.map(patient => (
                <Card key={patient.id} className={`bg-white border-2 cursor-pointer transition-all hover:shadow-md ${viewingPatient?.id === patient.id ? "border-blue-400" : "border-transparent hover:border-slate-200"}`}
                  onClick={() => setViewingPatient(patient)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{patient.patient_name}</span>
                          <Badge className={`${statusColors[patient.status] || "bg-slate-100 text-slate-700"} text-xs`}>{patient.status}</Badge>
                          <span className="text-xs text-slate-400">CR: {patient.cr_number}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                          {patient.age_years && <span>{patient.age_years}y {patient.gender}</span>}
                          {patient.guardian_name && <span>👤 {patient.guardian_name}</span>}
                          {patient.mobile_number && <span>📱 {patient.mobile_number}</span>}
                        </div>
                        {patient.diagnosis && <p className="text-xs text-blue-700 mt-1 font-medium truncate">{patient.diagnosis}</p>}
                        {patient.comorbidities?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patient.comorbidities.slice(0, 3).map((c, i) => <Badge key={i} variant="outline" className="text-xs py-0">{c}</Badge>)}
                            {patient.comorbidities.length > 3 && <Badge variant="outline" className="text-xs py-0">+{patient.comorbidities.length - 3}</Badge>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="icon" variant="ghost" className="w-7 h-7" onClick={e => { e.stopPropagation(); setViewingPatient(patient); }}>
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-7 h-7" onClick={e => { e.stopPropagation(); setEditingPatient(patient); setShowForm(true); }}>
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-7 h-7" onClick={e => { e.stopPropagation(); handleDelete(patient); }}>
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {viewingPatient ? (
              <Card className="bg-white shadow-md border-2 border-blue-200 sticky top-4">
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="text-sm font-semibold text-blue-900">Patient Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <PatientDetailPanel
                    patient={viewingPatient}
                    onEdit={() => { setEditingPatient(viewingPatient); setShowForm(true); }}
                    onClose={() => setViewingPatient(null)}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border border-dashed border-slate-300 sticky top-4">
                <CardContent className="p-12 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Select a patient to view their full profile and associated clinical tools</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={open => { if (!open) { setShowForm(false); setEditingPatient(null); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Edit Patient" : "New Patient Profile"}</DialogTitle>
          </DialogHeader>
          <PatientForm
            patient={editingPatient}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingPatient(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}