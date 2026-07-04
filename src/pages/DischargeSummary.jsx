import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/client";
import {
  FileText, Sparkles, Loader2, Printer, Copy,
  CheckCircle, AlertTriangle, Pill, Calendar, User
} from "lucide-react";
import { toast } from "sonner";

const TEMPLATES = [
  { id: "ns", label: "Nephrotic Syndrome Relapse", diagnosis: "Nephrotic Syndrome — Relapse" },
  { id: "aki", label: "Acute Kidney Injury", diagnosis: "Acute Kidney Injury" },
  { id: "uti", label: "Febrile UTI / Pyelonephritis", diagnosis: "Febrile UTI / Pyelonephritis" },
  { id: "hus", label: "HUS", diagnosis: "Hemolytic Uremic Syndrome" },
  { id: "ckd", label: "CKD Admission", diagnosis: "Chronic Kidney Disease" },
  { id: "custom", label: "Custom / Other", diagnosis: "" },
];

export default function DischargeSummary() {
  const [form, setForm] = useState({
    template: "ns",
    patient_name: "",
    age: "",
    cr_number: "",
    admission_date: "",
    discharge_date: "",
    diagnosis: "Nephrotic Syndrome — Relapse",
    attending: "",
    hospital_course: "",
    discharge_condition: "Stable",
    medications: "",
    followup_date: "",
    followup_with: "",
    red_flags: "",
    special_instructions: "",
    language: "English",
  });

  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const selectTemplate = (t) => {
    update("template", t.id);
    if (t.diagnosis) update("diagnosis", t.diagnosis);
  };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive hospital discharge summary for a pediatric nephrology patient.

PATIENT DETAILS:
- Name: ${form.patient_name || "[Patient Name]"}, Age: ${form.age || "[Age]"} years
- CR Number: ${form.cr_number || "[CR No]"}
- Admission Date: ${form.admission_date || "[Date]"} | Discharge Date: ${form.discharge_date || "[Date]"}
- Diagnosis: ${form.diagnosis}
- Attending Doctor: ${form.attending || "[Doctor Name]"}

CLINICAL COURSE PROVIDED:
${form.hospital_course || "Standard admission for " + form.diagnosis}

DISCHARGE CONDITION: ${form.discharge_condition}

MEDICATIONS AT DISCHARGE:
${form.medications || "As per standard " + form.diagnosis + " protocol"}

FOLLOW-UP:
Date: ${form.followup_date || "2 weeks"} with ${form.followup_with || "Pediatric Nephrology"}

RED FLAGS / WARNING SIGNS: ${form.red_flags || "Standard red flags for " + form.diagnosis}

SPECIAL INSTRUCTIONS: ${form.special_instructions || ""}

LANGUAGE FOR PARENT INSTRUCTIONS: ${form.language}

Generate a complete discharge summary with:
1. FORMAL MEDICAL SECTION (for medical records): diagnosis, hospital course, investigations summary, procedures, discharge medications with doses
2. PARENT-FRIENDLY INSTRUCTIONS SECTION: What the condition means in simple language, medication instructions (in ${form.language}), warning signs to return immediately, dietary instructions, activity restrictions, follow-up plan

Make parent instructions clear, simple, and action-oriented. Include emergency contact advice.`,
      });
      setGenerated(res);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generated || "");
    toast.success("Copied to clipboard");
  };

  const print = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-slate-700 via-blue-700 to-indigo-700 p-6 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <FileText className="w-9 h-9" />
            <div>
              <h1 className="text-3xl font-bold">Discharge Summary Generator</h1>
              <p className="text-blue-100 text-sm">AI-powered discharge summaries with parent-friendly instructions in multiple languages</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-5">
            {/* Template selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Select Diagnosis Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => selectTemplate(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${form.template === t.id ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 hover:border-blue-400 text-slate-700"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Patient details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" /> Patient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Patient Name</Label>
                    <Input className="mt-1 h-9 text-sm" placeholder="Full name" value={form.patient_name} onChange={e => update("patient_name", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Age (years)</Label>
                    <Input className="mt-1 h-9 text-sm" placeholder="e.g. 7" value={form.age} onChange={e => update("age", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">CR Number</Label>
                    <Input className="mt-1 h-9 text-sm" placeholder="CR/IP number" value={form.cr_number} onChange={e => update("cr_number", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Attending Doctor</Label>
                    <Input className="mt-1 h-9 text-sm" placeholder="Dr. Name" value={form.attending} onChange={e => update("attending", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Admission Date</Label>
                    <Input type="date" className="mt-1 h-9 text-sm" value={form.admission_date} onChange={e => update("admission_date", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Discharge Date</Label>
                    <Input type="date" className="mt-1 h-9 text-sm" value={form.discharge_date} onChange={e => update("discharge_date", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Diagnosis</Label>
                  <Input className="mt-1 h-9 text-sm" value={form.diagnosis} onChange={e => update("diagnosis", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Clinical content */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Clinical Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Hospital Course Summary</Label>
                  <Textarea className="mt-1 text-sm h-24" placeholder="Brief clinical course, key investigations, procedures, response to treatment..." value={form.hospital_course} onChange={e => update("hospital_course", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Medications at Discharge (one per line)</Label>
                  <Textarea className="mt-1 text-sm h-24" placeholder="Tab Prednisolone 30mg OD for 4 weeks&#10;Tab Omeprazole 10mg OD&#10;Syp Calcium 5mL BD" value={form.medications} onChange={e => update("medications", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Red Flags / Warning Signs</Label>
                  <Textarea className="mt-1 text-sm h-16" placeholder="Fever, severe swelling, decreased urine, vomiting..." value={form.red_flags} onChange={e => update("red_flags", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Follow-up Date</Label>
                    <Input type="date" className="mt-1 h-9 text-sm" value={form.followup_date} onChange={e => update("followup_date", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Follow-up Clinic</Label>
                    <Input className="mt-1 h-9 text-sm" placeholder="Nephrology OPD" value={form.followup_with} onChange={e => update("followup_with", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Language for Parent Instructions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["English", "Hindi", "Maithili", "Bhojpuri"].map(lang => (
                      <button
                        key={lang}
                        onClick={() => update("language", lang)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${form.language === lang ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-slate-200 text-slate-700 hover:border-indigo-400"}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={generate}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold"
            >
              {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating Summary...</> : <><Sparkles className="w-5 h-5 mr-2" />Generate Discharge Summary</>}
            </Button>
          </div>

          {/* Output */}
          <div>
            {!generated && !loading && (
              <Card className="flex items-center justify-center h-96 border-2 border-dashed border-slate-200">
                <div className="text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Fill in the details and generate</p>
                  <p className="text-sm">AI will create a complete discharge summary</p>
                </div>
              </Card>
            )}
            {loading && (
              <Card className="flex items-center justify-center h-96">
                <div className="text-center text-slate-500">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                  <p className="font-medium">Generating discharge summary...</p>
                </div>
              </Card>
            )}
            {generated && !loading && (
              <Card className="h-full">
                <CardHeader className="border-b bg-blue-50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" /> Generated Discharge Summary
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-1 text-xs h-8">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={print} className="gap-1 text-xs h-8">
                        <Printer className="w-3.5 h-3.5" /> Print
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 overflow-auto max-h-[70vh]">
                  <pre className="whitespace-pre-wrap text-sm text-slate-800 font-sans leading-relaxed">{generated}</pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}