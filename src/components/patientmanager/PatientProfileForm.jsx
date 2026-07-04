import React, { useState } from "react";
import { base44 } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plus, X, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function PatientProfileForm({ patient, onBack, onSave }) {
  const isEdit = !!patient;
  const [form, setForm] = useState({
    patient_name: patient?.patient_name || "",
    cr_number: patient?.cr_number || "",
    mobile_number: patient?.mobile_number || "",
    date_of_birth: patient?.date_of_birth || "",
    age_years: patient?.age_years || "",
    gender: patient?.gender || "",
    guardian_name: patient?.guardian_name || "",
    address: patient?.address || "",
    diagnosis: patient?.diagnosis || "",
    status: patient?.status || "Active",
    notes: patient?.notes || "",
    comorbidities: patient?.comorbidities || [],
    allergies: patient?.allergies || [],
    current_medications: patient?.current_medications || [],
    baseline_vitals: patient?.baseline_vitals || { height: "", weight: "", bmi: "", blood_group: "" },
  });

  const [newComorbidity, setNewComorbidity] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [newMed, setNewMed] = useState("");

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? base44.entities.Patient.update(patient.id, data) : base44.entities.Patient.create(data),
    onSuccess: (result) => {
      toast.success(isEdit ? "Patient updated" : "Patient created");
      onSave(result);
    },
  });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setVital = (field, val) => setForm(f => ({ ...f, baseline_vitals: { ...f.baseline_vitals, [field]: val } }));

  const addTag = (field, val, setter) => {
    if (!val.trim()) return;
    setForm(f => ({ ...f, [field]: [...f[field], val.trim()] }));
    setter("");
  };
  const removeTag = (field, idx) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patient_name || !form.cr_number) { toast.error("Name and CR Number are required"); return; }
    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />{isEdit ? "Edit Patient" : "New Patient Profile"}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Demographics */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3 bg-blue-50 border-b">
              <CardTitle className="text-sm font-semibold text-blue-800">Demographics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="col-span-2 md:col-span-1">
                <Label className="text-xs font-semibold">Patient Name *</Label>
                <Input value={form.patient_name} onChange={e => set("patient_name", e.target.value)} placeholder="Full name" className="mt-1" required />
              </div>
              <div>
                <Label className="text-xs font-semibold">CR Number *</Label>
                <Input value={form.cr_number} onChange={e => set("cr_number", e.target.value)} placeholder="CR-001" className="mt-1" required />
              </div>
              <div>
                <Label className="text-xs font-semibold">Mobile</Label>
                <Input value={form.mobile_number} onChange={e => set("mobile_number", e.target.value)} placeholder="10-digit" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Date of Birth</Label>
                <Input type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Age (years)</Label>
                <Input type="number" value={form.age_years} onChange={e => set("age_years", e.target.value)} placeholder="e.g. 8" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Gender</Label>
                <Select value={form.gender} onValueChange={v => set("gender", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Guardian Name</Label>
                <Input value={form.guardian_name} onChange={e => set("guardian_name", e.target.value)} placeholder="Parent/guardian" className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-semibold">Address</Label>
                <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Residential address" className="mt-1" />
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3 bg-purple-50 border-b">
              <CardTitle className="text-sm font-semibold text-purple-800">Medical History</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Primary Diagnosis</Label>
                  <Input value={form.diagnosis} onChange={e => set("diagnosis", e.target.value)} placeholder="e.g. Nephrotic Syndrome" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Status</Label>
                  <Select value={form.status} onValueChange={v => set("status", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Discharged">Discharged</SelectItem>
                      <SelectItem value="Referred">Referred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Comorbidities */}
              <div>
                <Label className="text-xs font-semibold">Comorbidities</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={newComorbidity} onChange={e => setNewComorbidity(e.target.value)} placeholder="Add comorbidity" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag("comorbidities", newComorbidity, setNewComorbidity))} />
                  <Button type="button" size="sm" variant="outline" onClick={() => addTag("comorbidities", newComorbidity, setNewComorbidity)}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.comorbidities.map((c, i) => (
                    <Badge key={i} variant="outline" className="gap-1">{c}<button type="button" onClick={() => removeTag("comorbidities", i)}><X className="w-3 h-3" /></button></Badge>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <Label className="text-xs font-semibold">Allergies</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={newAllergy} onChange={e => setNewAllergy(e.target.value)} placeholder="Add allergy" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag("allergies", newAllergy, setNewAllergy))} />
                  <Button type="button" size="sm" variant="outline" onClick={() => addTag("allergies", newAllergy, setNewAllergy)}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.allergies.map((a, i) => (
                    <Badge key={i} className="bg-red-100 text-red-800 gap-1">{a}<button type="button" onClick={() => removeTag("allergies", i)}><X className="w-3 h-3" /></button></Badge>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <Label className="text-xs font-semibold">Current Medications</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={newMed} onChange={e => setNewMed(e.target.value)} placeholder="Drug name + dose" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag("current_medications", newMed, setNewMed))} />
                  <Button type="button" size="sm" variant="outline" onClick={() => addTag("current_medications", newMed, setNewMed)}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.current_medications.map((m, i) => (
                    <Badge key={i} className="bg-blue-100 text-blue-800 gap-1">{m}<button type="button" onClick={() => removeTag("current_medications", i)}><X className="w-3 h-3" /></button></Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Clinical Notes</Label>
                <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="General notes…" className="mt-1 h-20" />
              </div>
            </CardContent>
          </Card>

          {/* Baseline Vitals */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3 bg-green-50 border-b">
              <CardTitle className="text-sm font-semibold text-green-800">Baseline Vitals</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Height (cm)", field: "height", placeholder: "e.g. 120" },
                { label: "Weight (kg)", field: "weight", placeholder: "e.g. 25" },
                { label: "BMI", field: "bmi", placeholder: "Auto or manual" },
                { label: "Blood Group", field: "blood_group", placeholder: "e.g. O+" },
              ].map(v => (
                <div key={v.field}>
                  <Label className="text-xs font-semibold">{v.label}</Label>
                  <Input type={v.field === "blood_group" ? "text" : "number"} value={form.baseline_vitals[v.field]} onChange={e => setVital(v.field, e.target.value)} placeholder={v.placeholder} className="mt-1" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={mutation.isPending}>
              <Save className="w-4 h-4 mr-2" />{mutation.isPending ? "Saving…" : (isEdit ? "Update Patient" : "Create Patient")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}