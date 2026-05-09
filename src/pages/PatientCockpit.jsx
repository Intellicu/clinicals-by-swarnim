import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Activity, Pill, FileText, Brain, TrendingUp,
  CheckCircle, AlertTriangle, Save, Loader2, ChevronRight,
  Stethoscope, Zap, MessageCircle, GitBranch, Shield, History
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import PatientContextBar from "@/components/clinic/PatientContextBar";
import QuickVitalsCapture from "@/components/clinic/QuickVitalsCapture";
import ContextualClinicalIntelligence from "@/components/clinic/ContextualClinicalIntelligence";
import EnhancedDigitalPrescriptionPad from "@/components/clinic/EnhancedDigitalPrescriptionPad";

export default function PatientCockpit() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const patient = location.state?.patient;
  const workspace = location.state?.workspace;
  const appointment = location.state?.appointment;
  const initialMode = location.state?.mode || "overview";

  const [activeTab, setActiveTab] = useState(initialMode === "consult" ? "vitals" : "overview");
  const [vitals, setVitals] = useState({});
  const [bpStage, setBpStage] = useState(null);
  const [notes, setNotes] = useState("");
  const [assessment, setAssessment] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [encounterSaved, setEncounterSaved] = useState(false);

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ["patient-logs", patient?.id],
    queryFn: () => base44.entities.PatientDailyLog.filter({ patient_id: patient?.id }, "-log_date", 30),
    enabled: !!patient,
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ["prescriptions", patient?.id],
    queryFn: () => base44.entities.Prescription.filter({ patient_id: patient?.id }, "-prescription_date", 5),
    enabled: !!patient,
  });

  const { data: encounters = [] } = useQuery({
    queryKey: ["encounters", patient?.id],
    queryFn: () => base44.entities.ClinicalEncounter.filter({ patient_id: patient?.id }, "-encounter_date", 10),
    enabled: !!patient,
  });

  const saveEncounterMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const enc = await base44.entities.ClinicalEncounter.create({
        workspace_id: workspace?.id,
        patient_id: patient.id,
        clinician_id: user.email,
        encounter_date: new Date().toISOString(),
        encounter_type: appointment?.appointment_type || "Follow-up",
        reason_for_visit: appointment?.chief_complaint || "",
        vitals: vitals,
        clinical_notes: notes,
        assessment,
        status: "Completed",
      });
      if (appointment?.id) {
        await base44.entities.Appointment.update(appointment.id, { status: "Completed" });
      }
      return enc;
    },
    onSuccess: () => {
      toast.success("Encounter saved!");
      setEncounterSaved(true);
      queryClient.invalidateQueries({ queryKey: ["encounters", patient?.id] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const getAIInsight = async () => {
    if (!patient) return;
    setAiLoading(true);
    setAiInsight(null);
    const recentLogs = dailyLogs.slice(0, 7);
    const insight = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a pediatric nephrologist providing a concise clinical summary for a patient.

Patient: ${patient.patient_name}, Age ${patient.age_years}y, ${patient.gender}
Diagnosis: ${patient.diagnosis || "Not specified"}
CKD Stage: ${patient.ckd_stage || "Unknown"}
Current medications: ${prescriptions[0]?.medications?.map(m => m.drug_name).join(", ") || "None on record"}
Recent logs (last 7 days): ${JSON.stringify(recentLogs.slice(0, 3))}
Current vitals (today): ${JSON.stringify(vitals)}
Assessment today: ${assessment || "Not entered yet"}

Provide:
1. Clinical summary (2-3 sentences)
2. Key concerns or trends to address today
3. One specific management suggestion based on diagnosis and guidelines (ISPN/IPNA/KDIGO)
4. Follow-up recommendation

Keep response concise and cite the specific guideline source.`,
    });
    setAiInsight(insight);
    setAiLoading(false);
  };

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500">No patient selected</p>
          <Button className="mt-3" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Summary computations
  const proteinLogs = dailyLogs.filter(l => l.module_type === "Urine_Protein").slice(0, 7);
  const highProtein = proteinLogs.filter(l => ["2+", "3+", "4+"].includes(l.protein_result));
  const lastPrescription = prescriptions[0];
  const lastEncounter = encounters[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg flex-shrink-0">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">{patient.patient_name}</p>
              <p className="text-xs text-slate-500">CR# {patient.cr_number} · {patient.age_years}y · {patient.gender}</p>
            </div>
            {appointment && (
              <Badge className="bg-green-100 text-green-800 text-xs border-0 flex-shrink-0">OPD Visit</Badge>
            )}
          </div>
          {/* Context bar */}
          <div className="mt-2">
            <PatientContextBar patient={patient} vitals={vitals} bpStage={bpStage} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-slate-100 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "vitals", label: "Vitals", icon: Stethoscope },
            { id: "intelligence", label: "Clinical OS", icon: Brain },
            { id: "prescription", label: "Prescription", icon: Pill },
            { id: "history", label: "History", icon: History },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${activeTab === t.id ? "border-blue-600 text-blue-700 bg-blue-50" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 py-3 space-y-3 pb-24">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            {/* Alerts */}
            {highProtein.length >= 2 && (
              <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                Protein ≥2+ on {highProtein.length} of last 7 days — consider NS relapse assessment
              </div>
            )}

            {/* Quick action grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Vitals", icon: Activity, color: "bg-green-50 border-green-200 text-green-700", tab: "vitals" },
                { label: "Prescription", icon: Pill, color: "bg-blue-50 border-blue-200 text-blue-700", tab: "prescription" },
                { label: "Clinical OS", icon: Brain, color: "bg-purple-50 border-purple-200 text-purple-700", tab: "intelligence" },
                { label: "AI Discuss", icon: MessageCircle, color: "bg-indigo-50 border-indigo-200 text-indigo-700", action: getAIInsight },
                { label: "Pathways", icon: GitBranch, color: "bg-teal-50 border-teal-200 text-teal-700", path: "ClinicalSupport" },
                { label: "Emergency", icon: Zap, color: "bg-red-50 border-red-200 text-red-700", path: "EmergencyHub" },
              ].map((a, i) => (
                <button key={i}
                  onClick={() => a.tab ? setActiveTab(a.tab) : a.path ? navigate(createPageUrl(a.path)) : a.action?.()}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 hover:shadow-sm transition-all ${a.color}`}>
                  <a.icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{a.label}</span>
                </button>
              ))}
            </div>

            {/* Compact ContextualClinicalIntelligence strip */}
            <ContextualClinicalIntelligence patient={patient} vitals={vitals} compact />

            {/* Recent protein trend */}
            {proteinLogs.length > 0 && (
              <Card className="border border-purple-200">
                <CardContent className="p-3">
                  <p className="text-xs font-bold text-slate-600 mb-2">Urine Protein — Last 7 Days</p>
                  <div className="flex gap-1">
                    {proteinLogs.map((log, idx) => (
                      <div key={idx} title={`${log.log_date}: ${log.protein_result}`}
                        className={`flex-1 h-7 rounded flex items-center justify-center text-xs font-bold ${
                          log.protein_result === "Negative" || log.protein_result === "Trace" ? "bg-green-200 text-green-800" :
                          log.protein_result === "1+" ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"
                        }`}>
                        {log.protein_result?.replace("Negative", "Neg")}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current meds */}
            {lastPrescription?.medications?.length > 0 && (
              <Card className="border border-blue-200">
                <CardContent className="p-3">
                  <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-blue-600" />Current Medications
                  </p>
                  <div className="space-y-1.5">
                    {lastPrescription.medications.slice(0, 4).map((med, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="font-semibold text-slate-800">{med.drug_name}</span>
                        <span className="text-slate-500">{med.dose} {med.frequency}</span>
                      </div>
                    ))}
                    {lastPrescription.medications.length > 4 && (
                      <p className="text-xs text-slate-400">+{lastPrescription.medications.length - 4} more</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insight */}
            {(aiLoading || aiInsight) && (
              <Card className="border border-indigo-200 bg-indigo-50">
                <CardContent className="p-3">
                  <p className="text-xs font-bold text-indigo-700 mb-2 flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5" />AI Clinical Insight
                  </p>
                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-xs text-indigo-600">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />Analyzing patient context…
                    </div>
                  ) : (
                    <p className="text-xs text-indigo-900 leading-relaxed whitespace-pre-wrap">{aiInsight}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* VITALS TAB */}
        {activeTab === "vitals" && (
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-600" />Vitals Entry — {format(new Date(), "dd MMM yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <QuickVitalsCapture patient={patient} onSave={(v) => {
                  setVitals(v);
                  toast.success("Vitals recorded");
                  setActiveTab("overview");
                }} />
              </CardContent>
            </Card>

            {/* Clinical notes */}
            <Card>
              <CardContent className="p-3 space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1.5">Clinical Notes</p>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="History, examination findings, impression…" rows={3}
                    className="text-sm" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1.5">Assessment & Plan</p>
                  <Textarea value={assessment} onChange={e => setAssessment(e.target.value)}
                    placeholder="Clinical assessment, diagnosis, management plan…" rows={3}
                    className="text-sm" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => saveEncounterMutation.mutate()}
                    disabled={saveEncounterMutation.isPending || encounterSaved}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-sm">
                    {saveEncounterMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    {encounterSaved ? "Saved ✓" : "Save Encounter"}
                  </Button>
                  <Button onClick={getAIInsight} disabled={aiLoading} variant="outline" className="text-indigo-600 border-indigo-300">
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CLINICAL OS / INTELLIGENCE TAB */}
        {activeTab === "intelligence" && (
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />Contextual Clinical Intelligence
                  <Badge className="ml-auto bg-purple-600 text-white text-xs border-0">Clinical OS</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <ContextualClinicalIntelligence patient={patient} vitals={vitals} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* PRESCRIPTION TAB */}
        {activeTab === "prescription" && (
          <EnhancedDigitalPrescriptionPad
            patient={patient}
            encounterData={{ vitals, clinical_notes: notes, assessment }}
            previousPrescriptions={prescriptions}
            onPrescriptionGenerated={async (prescription) => {
              toast.success("Prescription saved!");
              queryClient.invalidateQueries({ queryKey: ["prescriptions", patient.id] });
              setActiveTab("overview");
            }}
          />
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Past Encounters ({encounters.length})</p>
            {encounters.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
                No past encounters on record
              </div>
            ) : (
              encounters.map(enc => (
                <Card key={enc.id} className="border border-slate-200">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-800">
                        {format(new Date(enc.encounter_date), "d MMM yyyy")}
                      </p>
                      <Badge className="text-xs bg-slate-100 text-slate-700 border-0">{enc.encounter_type}</Badge>
                    </div>
                    {enc.reason_for_visit && <p className="text-xs text-slate-500 mb-1">Reason: {enc.reason_for_visit}</p>}
                    {enc.assessment && <p className="text-xs text-slate-700 line-clamp-2">{enc.assessment}</p>}
                    {enc.vitals && (
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        {enc.vitals.weight && <span className="text-xs bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">Wt: {enc.vitals.weight}kg</span>}
                        {enc.vitals.bp_systolic && <span className="text-xs bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">BP: {enc.vitals.bp_systolic}/{enc.vitals.bp_diastolic}</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}

            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-4">Prescriptions ({prescriptions.length})</p>
            {prescriptions.map(rx => (
              <Card key={rx.id} className="border border-blue-100">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-blue-800">{format(new Date(rx.prescription_date), "d MMM yyyy")}</p>
                    <Badge className="text-xs bg-blue-100 text-blue-800 border-0">{rx.medications?.length || 0} meds</Badge>
                  </div>
                  {rx.diagnosis && <p className="text-xs text-slate-500 mb-1">{rx.diagnosis}</p>}
                  <div className="space-y-0.5">
                    {rx.medications?.slice(0, 3).map((m, i) => (
                      <p key={i} className="text-xs text-slate-700">
                        <span className="font-semibold">{m.drug_name}</span> — {m.dose} {m.frequency}
                      </p>
                    ))}
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