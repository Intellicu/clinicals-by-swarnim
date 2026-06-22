import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Activity, Pill, FileText, Brain, TrendingUp,
  CheckCircle, AlertTriangle, Save, Loader2, Stethoscope,
  Zap, GitBranch, History, FlaskConical,
  Heart, Shield, ChevronDown, ChevronUp,
  Calendar, User, Star, ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import PatientContextBar from "@/components/clinic/PatientContextBar";
import PatientAlertsStrip from "@/components/clinic/PatientAlertsStrip";
import QuickVitalsCapture from "@/components/clinic/QuickVitalsCapture";
import ContextualClinicalIntelligence from "@/components/clinic/ContextualClinicalIntelligence";
import EnhancedDigitalPrescriptionPad from "@/components/clinic/EnhancedDigitalPrescriptionPad";
import HomeMonitoringTab from "@/components/kidneycare/HomeMonitoringTab";

const TABS = [
  { id: "summary", label: "Summary", icon: Activity },
  { id: "monitoring", label: "घर निगरानी", icon: Heart },
  { id: "vitals", label: "Vitals", icon: Stethoscope },
  { id: "disease", label: "Disease Activity", icon: TrendingUp },
  { id: "medications", label: "Medications", icon: Pill },
  { id: "labs", label: "Labs", icon: FlaskConical },
  { id: "kidney", label: "Kidney", icon: Shield },
  { id: "prescription", label: "Rx", icon: FileText },
  { id: "intelligence", label: "Clinical AI", icon: Brain },
  { id: "history", label: "History", icon: History },
];

function AccordionSection({ title, icon: Icon, children, defaultOpen = false, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border border-slate-200 overflow-hidden">
      <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(o => !o)}>
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {Icon && <Icon className="w-4 h-4 text-blue-600" />}
          {title}
          {badge !== undefined && <Badge variant="outline" className="text-xs">{badge}</Badge>}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="border-t border-slate-100"><CardContent className="p-3">{children}</CardContent></div>}
    </Card>
  );
}

export default function PatientCockpit() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const patient = location.state?.patient;
  const workspace = location.state?.workspace;
  const appointment = location.state?.appointment;
  const initialMode = location.state?.mode || "overview";

  const [activeTab, setActiveTab] = useState(
    location.state?.tab === "monitoring" ? "monitoring" : initialMode === "consult" ? "vitals" : "summary"
  );
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
    queryFn: () => base44.entities.Prescription.filter({ patient_id: patient?.id }, "-prescription_date", 10),
    enabled: !!patient,
  });

  const { data: encounters = [] } = useQuery({
    queryKey: ["encounters", patient?.id],
    queryFn: () => base44.entities.ClinicalEncounter.filter({ patient_id: patient?.id }, "-encounter_date", 20),
    enabled: !!patient,
  });

  const { data: labResults = [] } = useQuery({
    queryKey: ["labs", patient?.id],
    queryFn: () => base44.entities.LabResult.filter({ patient_id: patient?.id }, "-created_date", 20),
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
        vitals,
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
    const insight = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a pediatric specialist (nephrology + rheumatology) providing a concise clinical summary.

Patient: ${patient.patient_name}, Age ${patient.age_years}y, ${patient.gender}
Diagnosis: ${patient.diagnosis || "Not specified"}
CKD Stage: ${patient.ckd_stage || "N/A"}
Current medications: ${prescriptions[0]?.medications?.map(m => m.drug_name).join(", ") || "None on record"}
Today's vitals: ${JSON.stringify(vitals)}
Assessment today: ${assessment || "Not entered yet"}
Recent encounters: ${encounters.length}

Provide:
1. Clinical summary (2–3 sentences)
2. Key concerns to address today
3. One specific guideline-based management suggestion (cite ISPN/IPNA/KDIGO/ACR/EULAR)
4. Monitoring gaps or missing investigations
5. Follow-up recommendation

Be concise. Show source guideline.`,
    });
    setAiInsight(insight);
    setAiLoading(false);
  };

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-6">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-3">No patient selected</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const proteinLogs = dailyLogs.filter(l => l.module_type === "Urine_Protein").slice(0, 7);
  const highProtein = proteinLogs.filter(l => ["2+", "3+", "4+"].includes(l.protein_result));
  const lastPrescription = prescriptions[0];
  const lastEncounter = encounters[0];
  const activeMeds = lastPrescription?.medications?.filter(m => m.active !== false) || [];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky Patient Header ── */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="px-3 pt-2.5 pb-0">
          {/* Top row */}
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg flex-shrink-0">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-slate-900 text-sm truncate">{patient.patient_name}</p>
                {appointment && <Badge className="bg-green-100 text-green-800 text-xs border-0 flex-shrink-0">OPD</Badge>}
                {patient.ckd_stage && <Badge className="bg-red-100 text-red-800 text-xs border-0 flex-shrink-0">CKD {patient.ckd_stage}</Badge>}
                {patient.diagnosis?.includes("JIA") && <Badge className="bg-blue-100 text-blue-800 text-xs border-0 flex-shrink-0">JIA</Badge>}
                {patient.diagnosis?.includes("SLE") && <Badge className="bg-purple-100 text-purple-800 text-xs border-0 flex-shrink-0">SLE</Badge>}
              </div>
              <p className="text-xs text-slate-500">CR# {patient.cr_number || "—"} · {patient.age_years}y · {patient.gender}</p>
            </div>
            <button onClick={getAIInsight} disabled={aiLoading}
              className="flex-shrink-0 p-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors">
              {aiLoading ? <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" /> : <Brain className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>

          {/* Context bar */}
          <PatientContextBar patient={patient} vitals={vitals} bpStage={bpStage} />

          {/* Alerts strip */}
          <PatientAlertsStrip
            vitals={vitals}
            labs={labResults[0] ? {
              creatinine: labResults[0].creatinine,
              egfr: labResults[0].egfr,
              potassium: labResults[0].potassium,
              proteinuria: labResults[0].proteinuria,
            } : {}}
            onTabChange={(tabId) => setActiveTab(tabId)}
            maxVisible={5}
          />

          {/* Tab bar */}
          <div className="flex border-t border-slate-100 mt-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${activeTab === t.id ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                <t.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 py-3 space-y-3 pb-28 max-w-2xl mx-auto">

        {/* ── HOME MONITORING TAB ── */}
        {activeTab === "monitoring" && (
          <HomeMonitoringTab patient={patient} />
        )}

        {/* ── SUMMARY TAB ── */}
        {activeTab === "summary" && (
          <div className="space-y-3">
            {/* Alerts */}
            {highProtein.length >= 2 && (
              <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 border-2 border-red-200 rounded-xl px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                Protein ≥2+ on {highProtein.length}/7 days — consider NS relapse
              </div>
            )}

            {/* Quick action grid */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Vitals", icon: Activity, color: "bg-green-50 border-green-200 text-green-700", tab: "vitals" },
                { label: "Rx", icon: Pill, color: "bg-blue-50 border-blue-200 text-blue-700", tab: "prescription" },
                { label: "Clinical AI", icon: Brain, color: "bg-purple-50 border-purple-200 text-purple-700", tab: "intelligence" },
                { label: "Labs", icon: FlaskConical, color: "bg-teal-50 border-teal-200 text-teal-700", tab: "labs" },
              ].map((a, i) => (
                <button key={i} onClick={() => setActiveTab(a.tab)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 hover:shadow-sm transition-all ${a.color}`}>
                  <a.icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{a.label}</span>
                </button>
              ))}
            </div>

            {/* Patient info summary */}
            <AccordionSection title="Patient Overview" icon={User} defaultOpen>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Name", patient.patient_name],
                  ["CR #", patient.cr_number || "—"],
                  ["Age", `${patient.age_years}y ${patient.age_months || 0}m`],
                  ["Gender", patient.gender],
                  ["Diagnosis", patient.diagnosis || "—"],
                  ["CKD Stage", patient.ckd_stage || "—"],
                  ["Last Visit", lastEncounter ? format(new Date(lastEncounter.encounter_date), "dd MMM yyyy") : "—"],
                  ["Total Visits", encounters.length],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-slate-400 font-medium">{label}</p>
                    <p className="font-semibold text-slate-800 truncate">{val}</p>
                  </div>
                ))}
              </div>
            </AccordionSection>

            {/* Protein trend */}
            {proteinLogs.length > 0 && (
              <AccordionSection title="Urine Protein Trend" icon={FlaskConical} defaultOpen badge={`${proteinLogs.length}d`}>
                <div className="flex gap-1 mt-1">
                  {proteinLogs.map((log, idx) => (
                    <div key={idx} title={`${log.log_date}: ${log.protein_result}`}
                      className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-bold ${
                        log.protein_result === "Negative" || log.protein_result === "Trace" ? "bg-green-200 text-green-800" :
                        log.protein_result === "1+" ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"
                      }`}>
                      {log.protein_result?.replace("Negative", "Neg")}
                    </div>
                  ))}
                </div>
              </AccordionSection>
            )}

            {/* Active medications summary */}
            {activeMeds.length > 0 && (
              <AccordionSection title="Active Medications" icon={Pill} defaultOpen badge={activeMeds.length}>
                <div className="space-y-1.5">
                  {activeMeds.slice(0, 6).map((med, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="font-semibold text-slate-800">{med.drug_name}</span>
                      <span className="text-slate-500">{med.dose} {med.frequency}</span>
                    </div>
                  ))}
                  {activeMeds.length > 6 && <p className="text-xs text-slate-400">+{activeMeds.length - 6} more → Medications tab</p>}
                </div>
              </AccordionSection>
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
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />Analysing patient context…
                    </div>
                  ) : (
                    <p className="text-xs text-indigo-900 leading-relaxed whitespace-pre-wrap">{aiInsight}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick links to pathways */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Pathways", icon: GitBranch, color: "bg-teal-50 border-teal-200 text-teal-700", path: "ClinicalSupport" },
                { label: "Emergency", icon: Zap, color: "bg-red-50 border-red-200 text-red-700", path: "EmergencyHub" },
                { label: "Rheumatology", icon: Heart, color: "bg-purple-50 border-purple-200 text-purple-700", path: "PediatricRheumatology" },
                { label: "Guidelines", icon: FileText, color: "bg-blue-50 border-blue-200 text-blue-700", path: "Guidelines" },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(createPageUrl(a.path))}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 hover:shadow-sm transition-all ${a.color}`}>
                  <a.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-semibold">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── VITALS TAB ── */}
        {activeTab === "vitals" && (
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-600" />Vitals — {format(new Date(), "dd MMM yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <QuickVitalsCapture patient={patient} onSave={(v) => {
                  setVitals(v);
                  toast.success("Vitals recorded");
                  setActiveTab("summary");
                }} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1.5">Clinical Notes</p>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="History, examination findings, impression…" rows={3} className="text-sm" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1.5">Assessment & Plan</p>
                  <Textarea value={assessment} onChange={e => setAssessment(e.target.value)}
                    placeholder="Clinical assessment, diagnosis, management plan…" rows={3} className="text-sm" />
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

        {/* ── DISEASE ACTIVITY TAB ── */}
        {activeTab === "disease" && (
          <div className="space-y-3">
            <Card className="border border-purple-200">
              <CardContent className="p-3">
                <p className="text-sm font-bold text-purple-900 mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />Disease Activity Monitoring
                </p>
                <p className="text-xs text-slate-500 mb-3">Track disease activity scores over time</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "JADAS-27 (JIA)", desc: "Joint disease", color: "bg-blue-50 border-blue-200", path: "PediatricRheumatology" },
                    { label: "SLEDAI-2K (SLE)", desc: "Lupus activity", color: "bg-purple-50 border-purple-200", path: "PediatricRheumatology" },
                    { label: "BVAS (Vasculitis)", desc: "Vasculitis scoring", color: "bg-red-50 border-red-200", path: "PediatricRheumatology" },
                    { label: "CMAS (JDM)", desc: "Myositis strength", color: "bg-orange-50 border-orange-200", path: "PediatricRheumatology" },
                  ].map(c => (
                    <button key={c.label}
                      onClick={() => navigate(createPageUrl(c.path), { state: { tab: "calculators" } })}
                      className={`p-3 rounded-xl border-2 text-left hover:shadow-md transition-all ${c.color}`}>
                      <p className="text-xs font-bold text-slate-800">{c.label}</p>
                      <p className="text-xs text-slate-500">{c.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <AccordionSection title="Recent Encounters — Disease Trends" icon={TrendingUp} defaultOpen badge={encounters.length}>
              {encounters.length === 0 ? (
                <p className="text-xs text-slate-400 py-2 text-center">No encounters on record</p>
              ) : (
                <div className="space-y-2 mt-1">
                  {encounters.slice(0, 5).map((enc, i) => (
                    <div key={enc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-slate-700">{format(new Date(enc.encounter_date), "dd MMM yyyy")}</p>
                        <Badge variant="outline" className="text-xs">{enc.encounter_type}</Badge>
                      </div>
                      {enc.assessment && <p className="text-xs text-slate-600 line-clamp-2">{enc.assessment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </AccordionSection>
          </div>
        )}

        {/* ── MEDICATIONS TAB ── */}
        {activeTab === "medications" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">Active Medications</p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs" onClick={() => setActiveTab("prescription")}>
                + New Rx
              </Button>
            </div>

            {prescriptions.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
                No prescriptions on record
              </div>
            ) : (
              prescriptions.map((rx, i) => (
                <AccordionSection key={rx.id}
                  title={`${format(new Date(rx.prescription_date), "dd MMM yyyy")} — ${rx.medications?.length || 0} medications`}
                  icon={Pill}
                  defaultOpen={i === 0}
                  badge={i === 0 ? "Latest" : undefined}>
                  {rx.diagnosis && <p className="text-xs text-slate-500 mb-2 font-medium">{rx.diagnosis}</p>}
                  <div className="space-y-1.5">
                    {rx.medications?.map((med, j) => (
                      <div key={j} className={`flex items-start gap-2 p-2 rounded-lg ${med.active === false ? "opacity-50 bg-slate-50" : "bg-blue-50 border border-blue-100"}`}>
                        <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${med.active === false ? "bg-slate-400" : "bg-blue-500"}`} />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-800">{med.drug_name}</p>
                          <p className="text-xs text-slate-500">{med.dose} · {med.frequency} · {med.duration}</p>
                          {med.instructions && <p className="text-xs text-slate-400 mt-0.5">{med.instructions}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionSection>
              ))
            )}
          </div>
        )}

        {/* ── LABS TAB ── */}
        {activeTab === "labs" && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700">Laboratory Results</p>

            {labResults.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
                No lab results on record
              </div>
            ) : (
              labResults.map((lab, i) => (
                <Card key={lab.id} className="border border-slate-200">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-slate-800">
                        {lab.created_date ? format(new Date(lab.created_date), "dd MMM yyyy") : "—"}
                      </p>
                      <Badge variant="outline" className="text-xs">{lab.test_type || "Lab"}</Badge>
                    </div>
                    {lab.results && (
                      <div className="grid grid-cols-2 gap-1">
                        {Object.entries(lab.results).slice(0, 6).map(([key, val]) => (
                          <div key={key} className="text-xs">
                            <span className="text-slate-400">{key}: </span>
                            <span className="font-semibold text-slate-800">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}

            {/* Nephrology-relevant monitoring */}
            <AccordionSection title="Nephrology Monitoring Checklist" icon={Shield} defaultOpen>
              <div className="space-y-1.5 mt-1">
                {[
                  "Urine PCR (target <0.5 on maintenance therapy)",
                  "eGFR / Serum creatinine (Schwartz formula)",
                  "C3, C4 (SLE activity)",
                  "Anti-dsDNA titre (SLE flare marker)",
                  "ANCA titre (vasculitis activity)",
                  "Urinalysis with microscopy (haematuria, casts)",
                  "Blood pressure (BP percentile for age/height)",
                  "24h urine protein or spot PCR",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </AccordionSection>
          </div>
        )}

        {/* ── KIDNEY OVERLAP TAB ── */}
        {activeTab === "kidney" && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-3">
              <p className="text-sm font-bold text-purple-900 mb-1 flex items-center gap-2">
                <Shield className="w-4 h-4" />Rheumatology–Nephrology Interface
              </p>
              <p className="text-xs text-slate-600">Renal manifestations of rheumatic diseases and joint management protocols</p>
            </div>

            {[
              {
                title: "Lupus Nephritis",
                relevant: patient.diagnosis?.toLowerCase().includes("sle") || patient.diagnosis?.toLowerCase().includes("lupus"),
                content: [
                  "Renal biopsy classification (ISN/RPS) — Class III/IV require aggressive IST",
                  "Target: urine PCR <0.5 on maintenance",
                  "MMF + HCQ maintenance (ACR/EULAR 2019)",
                  "Monitor C3/C4, anti-dsDNA, BP control <130/80",
                  "Belimumab add-on for refractory",
                ],
                color: "border-purple-200 bg-purple-50",
                badge: "Lupus",
                badgeColor: "bg-purple-100 text-purple-800",
              },
              {
                title: "IgAV Nephritis (HSP)",
                relevant: patient.diagnosis?.toLowerCase().includes("igav") || patient.diagnosis?.toLowerCase().includes("hsp"),
                content: [
                  "Affects 40–60% of IgAV patients",
                  "ACE inhibitor for persistent proteinuria",
                  "Steroids + azathioprine for nephritic/nephrotic pattern",
                  "Cyclophosphamide for severe/crescentic nephritis",
                  "Long-term follow-up for CKD risk",
                ],
                color: "border-red-200 bg-red-50",
                badge: "IgAV",
                badgeColor: "bg-red-100 text-red-800",
              },
              {
                title: "ANCA Vasculitis — RPGN",
                relevant: patient.diagnosis?.toLowerCase().includes("anca") || patient.diagnosis?.toLowerCase().includes("gpa") || patient.diagnosis?.toLowerCase().includes("mpa"),
                content: [
                  "Urgent renal biopsy for crescentic GN",
                  "Rituximab or cyclophosphamide induction",
                  "Plasmapheresis for Cr >500 μmol/L or DAH",
                  "Maintain ANCA titre, BVAS score",
                  "Dialysis may be required acutely",
                ],
                color: "border-orange-200 bg-orange-50",
                badge: "ANCA",
                badgeColor: "bg-orange-100 text-orange-800",
              },
              {
                title: "Renal Amyloidosis (FMF/TRAPS)",
                relevant: patient.diagnosis?.toLowerCase().includes("fmf") || patient.diagnosis?.toLowerCase().includes("traps"),
                content: [
                  "AA amyloidosis from uncontrolled inflammation",
                  "Monitor urine PCR annually",
                  "Colchicine prevents amyloid in FMF",
                  "SAA level target <10 mg/L",
                  "Renal biopsy if nephrotic syndrome develops",
                ],
                color: "border-amber-200 bg-amber-50",
                badge: "Amyloid",
                badgeColor: "bg-amber-100 text-amber-800",
              },
              {
                title: "AKI in MAS / MIS-C",
                relevant: patient.diagnosis?.toLowerCase().includes("mas") || patient.diagnosis?.toLowerCase().includes("mis-c"),
                content: [
                  "AKI in up to 30% of MIS-C (shock/cytokine storm)",
                  "Monitor urine output hourly in acute phase",
                  "Avoid nephrotoxics (NSAIDs, contrast)",
                  "RRT may be required for severe AKI",
                  "Creatinine + electrolytes twice daily in ICU",
                ],
                color: "border-red-200 bg-red-50",
                badge: "MAS/MIS-C",
                badgeColor: "bg-red-100 text-red-800",
              },
            ].map((section, i) => (
              <AccordionSection
                key={i}
                title={<span className="flex items-center gap-2">{section.title}{section.relevant && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}</span>}
                defaultOpen={section.relevant}>
                <div className={`rounded-xl border p-3 ${section.color}`}>
                  <div className="space-y-1.5">
                    {section.content.map((c, j) => (
                      <div key={j} className="flex items-start gap-2 text-xs">
                        <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionSection>
            ))}
          </div>
        )}

        {/* ── PRESCRIPTION TAB ── */}
        {activeTab === "prescription" && (
          <EnhancedDigitalPrescriptionPad
            patient={patient}
            encounterData={{ vitals, clinical_notes: notes, assessment }}
            previousPrescriptions={prescriptions}
            onPrescriptionGenerated={async () => {
              toast.success("Prescription saved!");
              queryClient.invalidateQueries({ queryKey: ["prescriptions", patient.id] });
              setActiveTab("summary");
            }}
          />
        )}

        {/* ── CLINICAL AI TAB ── */}
        {activeTab === "intelligence" && (
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />Contextual Clinical Intelligence
                  <Badge className="ml-auto bg-purple-600 text-white text-xs border-0">AI-Assisted</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <ContextualClinicalIntelligence patient={patient} vitals={vitals} />
              </CardContent>
            </Card>

            {aiInsight && (
              <Card className="border border-indigo-200 bg-indigo-50">
                <CardContent className="p-3">
                  <p className="text-xs font-bold text-indigo-700 mb-2 flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5" />AI Clinical Summary
                  </p>
                  <p className="text-xs text-indigo-900 leading-relaxed whitespace-pre-wrap">{aiInsight}</p>
                </CardContent>
              </Card>
            )}

            {!aiInsight && (
              <Button onClick={getAIInsight} disabled={aiLoading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
                Generate AI Clinical Insight
              </Button>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div className="space-y-3">
            <AccordionSection title={`Past Encounters`} icon={Calendar} defaultOpen badge={encounters.length}>
              {encounters.length === 0 ? (
                <p className="text-center py-4 text-slate-400 text-sm">No past encounters</p>
              ) : (
                <div className="space-y-2 mt-1">
                  {encounters.map(enc => (
                    <div key={enc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{format(new Date(enc.encounter_date), "d MMM yyyy")}</p>
                          <p className="text-xs text-slate-500">{enc.reason_for_visit}</p>
                        </div>
                        <Badge className="text-xs bg-slate-100 text-slate-700 border-0 flex-shrink-0">{enc.encounter_type}</Badge>
                      </div>
                      {enc.assessment && <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">{enc.assessment}</p>}
                      {enc.vitals && (
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          {enc.vitals.weight && <span className="text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5">Wt: {enc.vitals.weight}kg</span>}
                          {enc.vitals.bp_systolic && <span className="text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5">BP: {enc.vitals.bp_systolic}/{enc.vitals.bp_diastolic}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </AccordionSection>

            <AccordionSection title="Prescription History" icon={Pill} badge={prescriptions.length}>
              <div className="space-y-2 mt-1">
                {prescriptions.map(rx => (
                  <div key={rx.id} className="border border-blue-100 rounded-xl p-2.5 bg-blue-50/30">
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
                      {(rx.medications?.length || 0) > 3 && (
                        <p className="text-xs text-slate-400">+{rx.medications.length - 3} more</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionSection>
          </div>
        )}
      </div>
    </div>
  );
}