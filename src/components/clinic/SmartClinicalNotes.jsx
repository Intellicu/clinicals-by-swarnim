import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles, FileText, Stethoscope, Pill, Loader2,
  Copy, AlertCircle, CheckCircle2, RefreshCw, Utensils, Bell, Calendar, ClipboardList
} from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  return (
    <Button size="sm" variant="outline" className="h-7 gap-1 ml-auto"
      onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied!"); }}>
      <Copy className="w-3 h-3" />Copy
    </Button>
  );
}

function ResultBox({ text, onCopy }) {
  return text ? (
    <div className="relative">
      <Textarea value={text} readOnly rows={10} className="text-sm font-mono bg-slate-50 resize-none pr-16" />
      <CopyButton text={text} />
    </div>
  ) : (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
      <p className="text-sm">Click the generate button above</p>
    </div>
  );
}

// ─── Visit Summary ────────────────────────────────────────────────────────────
function VisitSummarizer({ patient }) {
  const [summary, setSummary] = useState("");
  const { data: visits = [] } = useQuery({
    queryKey: ["patient-visits", patient?.id],
    queryFn: () => base44.entities.VisitRecord.filter({ patient_id: patient.id }, "-visit_date", 10),
    enabled: !!patient?.id,
  });

  const mut = useMutation({
    mutationFn: async () => {
      const visitData = visits.map(v => ({
        date: v.visit_date?.split("T")[0], type: v.visit_type,
        complaint: v.chief_complaint, diagnosis: v.diagnosis,
        treatment: v.treatment_plan,
        meds: v.prescriptions?.map(p => `${p.drug_name} ${p.dose} ${p.frequency}`).join(", "),
      }));
      return base44.integrations.Core.InvokeLLM({
        prompt: `Summarize the clinical history for a pediatric nephrologist preparing for a consultation.

Patient: ${patient.patient_name}, Age: ${patient.age_years || '?'}yr, Gender: ${patient.gender}
Diagnosis: ${patient.diagnosis || 'Unknown'}
Comorbidities: ${patient.comorbidities?.join(', ') || 'None'}
Allergies: ${patient.allergies?.join(', ') || 'None'}
Current Medications: ${patient.current_medications?.join(', ') || 'Unknown'}

Visit History (${visits.length} visits):
${JSON.stringify(visitData, null, 2)}

Provide a structured summary:
1. CLINICAL TRAJECTORY
2. KEY EVENTS & MILESTONES  
3. MEDICATION HISTORY & RESPONSE
4. CURRENT STATUS
5. WATCH POINTS for next visit

Be concise, clinically focused.`,
      });
    },
    onSuccess: setSummary,
    onError: () => toast.error("Failed to generate summary"),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{visits.length} visits in history</p>
        <Button onClick={() => mut.mutate()} disabled={mut.isPending || visits.length === 0}
          className="gap-2 bg-blue-600 hover:bg-blue-700" size="sm">
          {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Summary
        </Button>
      </div>
      <ResultBox text={summary} />
    </div>
  );
}

// ─── AI Suggestions from Dx + Labs ───────────────────────────────────────────
function AISuggestions({ patient }) {
  const [result, setResult] = useState(null);

  const { data: labResults = [] } = useQuery({
    queryKey: ["lab-results", patient?.id],
    queryFn: () => base44.entities.LabResult.filter({ patient_id: patient.id }, "-test_date", 3),
    enabled: !!patient?.id,
  });

  const mut = useMutation({
    mutationFn: async () => {
      const recentLabs = labResults[0]?.parameters?.map(p => `${p.name}: ${p.value} (${p.status})`).join(", ") || "Not available";
      return base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior pediatric nephrologist. Based on this patient's data, provide comprehensive clinical suggestions.

Patient: ${patient.patient_name}, Age: ${patient.age_years}yr, Gender: ${patient.gender}
Diagnosis: ${patient.diagnosis || 'Unknown'}
Comorbidities: ${patient.comorbidities?.join(', ') || 'None'}
Current Medications: ${patient.current_medications?.join(', ') || 'None'}
Recent Lab Results: ${recentLabs}
Baseline Vitals: Weight ${patient.baseline_vitals?.weight || '?'}kg, Height ${patient.baseline_vitals?.height || '?'}cm

Provide structured suggestions:

1. DIAGNOSIS-BASED MANAGEMENT SUGGESTIONS
   - Current stage / disease activity assessment
   - Medication adjustments to consider
   - Red flags to watch

2. LAB-BASED ACTIONABLE SUGGESTIONS  
   - Abnormal results requiring action
   - Additional investigations needed
   - Trend analysis

3. DIETARY ADVICE
   - Specific dietary restrictions/recommendations
   - Fluid intake guidance
   - Nutritional supplements

4. MONITORING PLAN
   - Frequency of vitals/dipstick
   - Lab monitoring schedule
   - Parameters to track at home

5. FOLLOW-UP PLAN
   - Recommended follow-up interval
   - What to assess at next visit
   - Criteria for earlier review (red flags for parents)

6. PATIENT & FAMILY ADVICE
   - Lifestyle modifications
   - Activity restrictions/allowances
   - When to seek emergency care

Base recommendations on KDIGO/IPNA/IAP guidelines. Be specific with doses and timelines.`,
        response_json_schema: {
          type: "object",
          properties: {
            management: { type: "string" },
            lab_actions: { type: "string" },
            dietary_advice: { type: "string" },
            monitoring_plan: { type: "string" },
            follow_up_plan: { type: "string" },
            patient_advice: { type: "string" },
          }
        }
      });
    },
    onSuccess: setResult,
    onError: () => toast.error("Failed to generate suggestions"),
  });

  const sections = result ? [
    { key: 'management', label: 'Management', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50' },
    { key: 'lab_actions', label: 'Lab Actions', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { key: 'dietary_advice', label: 'Dietary Advice', icon: Utensils, color: 'text-green-600', bg: 'bg-green-50' },
    { key: 'monitoring_plan', label: 'Monitoring Plan', icon: Bell, color: 'text-purple-600', bg: 'bg-purple-50' },
    { key: 'follow_up_plan', label: 'Follow-Up Plan', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { key: 'patient_advice', label: 'Patient & Family Advice', icon: ClipboardList, color: 'text-teal-600', bg: 'bg-teal-50' },
  ] : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Based on diagnosis + latest lab results</p>
          {labResults.length > 0 && <p className="text-xs text-green-600">✓ {labResults[0]?.parameters?.length} lab values loaded</p>}
        </div>
        <Button onClick={() => mut.mutate()} disabled={mut.isPending}
          className="gap-2 bg-purple-600 hover:bg-purple-700" size="sm">
          {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate All Suggestions
        </Button>
      </div>

      {mut.isPending && (
        <div className="text-center py-8 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-500" />
          <p className="text-sm">Analyzing diagnosis and labs...</p>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          {sections.map(({ key, label, icon: Icon, color, bg }) => result[key] ? (
            <Card key={key} className={`border-l-4 ${bg}`} style={{ borderLeftColor: '' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex items-center gap-2 font-semibold text-sm ${color}`}>
                    <Icon className="w-4 h-4" />{label}
                  </div>
                  <CopyButton text={result[key]} />
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{result[key]}</p>
              </CardContent>
            </Card>
          ) : null)}
        </div>
      )}
    </div>
  );
}

// ─── Differential Diagnosis ──────────────────────────────────────────────────
function DifferentialDx({ patient }) {
  const [symptoms, setSymptoms] = useState("");
  const [results, setResults] = useState(null);

  const mut = useMutation({
    mutationFn: async () => base44.integrations.Core.InvokeLLM({
      prompt: `Pediatric Nephrology DDx. Patient: ${patient.patient_name}, ${patient.age_years}yr, ${patient.gender}. Known Dx: ${patient.diagnosis || 'None'}. Symptoms: ${symptoms}. 

List top 5 differential diagnoses with likelihood, urgency, supporting features, and key tests.`,
      response_json_schema: {
        type: "object",
        properties: {
          differentials: { type: "array", items: { type: "object", properties: { diagnosis: { type: "string" }, likelihood: { type: "string" }, urgency: { type: "string" }, supporting_features: { type: "array", items: { type: "string" } }, key_tests: { type: "array", items: { type: "string" } } } } },
          clinical_pearl: { type: "string" }
        }
      }
    }),
    onSuccess: setResults,
    onError: () => toast.error("Failed"),
  });

  const URGENCY = { Emergency: 'border-l-red-500 bg-red-50', Urgent: 'border-l-amber-500 bg-amber-50', Routine: 'border-l-green-500 bg-green-50' };

  return (
    <div className="space-y-3">
      <Textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
        placeholder="Presenting symptoms, e.g.: facial puffiness for 1 week, reduced urine output, trace proteinuria..."
        rows={3} className="text-sm" />
      <Button onClick={() => mut.mutate()} disabled={!symptoms || mut.isPending}
        className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
        {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
        Generate Differential Diagnosis
      </Button>

      {results && (
        <div className="space-y-2">
          {results.differentials?.map((d, i) => (
            <Card key={i} className={`border-l-4 ${URGENCY[d.urgency] || 'border-l-slate-300'}`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span className="font-semibold text-sm">{d.diagnosis}</span>
                  <Badge className={d.likelihood === 'High' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}>{d.likelihood}</Badge>
                  <Badge className={d.urgency === 'Emergency' ? 'bg-red-100 text-red-700' : d.urgency === 'Urgent' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>{d.urgency}</Badge>
                </div>
                {d.supporting_features?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">{d.supporting_features.map((f, j) => <span key={j} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{f}</span>)}</div>
                )}
                {d.key_tests?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">{d.key_tests.map((t, j) => <span key={j} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{t}</span>)}</div>
                )}
              </CardContent>
            </Card>
          ))}
          {results.clinical_pearl && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-3">
                <p className="text-xs font-bold text-amber-700 mb-1">💡 Clinical Pearl</p>
                <p className="text-sm text-amber-800">{results.clinical_pearl}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Medication Auto-complete ────────────────────────────────────────────────
function MedAutoComplete({ patient }) {
  const [drugName, setDrugName] = useState("");
  const [details, setDetails] = useState(null);

  const mut = useMutation({
    mutationFn: async () => base44.integrations.Core.InvokeLLM({
      prompt: `Pediatric pharmacology. Drug: ${drugName}. Patient: ${patient.age_years}yr, ${patient.baseline_vitals?.weight || '?'}kg, ${patient.diagnosis || '?'}. Provide complete prescribing details.`,
      response_json_schema: {
        type: "object",
        properties: {
          generic_name: { type: "string" }, brand_names: { type: "array", items: { type: "string" } },
          dose: { type: "string" }, calculated_dose: { type: "string" }, frequency: { type: "string" },
          route: { type: "string" }, duration: { type: "string" }, formulations: { type: "array", items: { type: "string" } },
          monitoring: { type: "array", items: { type: "string" } }, key_warnings: { type: "array", items: { type: "string" } },
          instructions: { type: "string" },
        }
      }
    }),
    onSuccess: setDetails,
    onError: () => toast.error("Failed"),
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={drugName} onChange={e => setDrugName(e.target.value)}
          placeholder="Drug name (e.g., Prednisolone, Amlodipine)"
          onKeyDown={e => e.key === 'Enter' && drugName && mut.mutate()} />
        <Button onClick={() => mut.mutate()} disabled={!drugName || mut.isPending}
          className="gap-2 bg-green-600 hover:bg-green-700 shrink-0">
          {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pill className="w-4 h-4" />}
        </Button>
      </div>

      {details && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{details.generic_name}</CardTitle>
              <Button size="sm" variant="outline" className="h-7 gap-1"
                onClick={() => { navigator.clipboard.writeText(`${details.generic_name} — ${details.dose} — ${details.frequency} — ${details.route} — ${details.duration}`); toast.success('Copied!'); }}>
                <Copy className="w-3 h-3" />Copy Rx
              </Button>
            </div>
            {details.brand_names?.length > 0 && <p className="text-xs text-slate-500">Brands: {details.brand_names.join(", ")}</p>}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-slate-500">Standard Dose</p><p className="font-semibold text-sm text-blue-800">{details.dose}</p></div>
              {details.calculated_dose && <div className="bg-green-50 p-3 rounded-lg"><p className="text-xs text-slate-500">For This Patient</p><p className="font-semibold text-sm text-green-800">{details.calculated_dose}</p></div>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><p className="text-xs text-slate-500">Frequency</p><p className="font-medium">{details.frequency}</p></div>
              <div><p className="text-xs text-slate-500">Route</p><p className="font-medium">{details.route}</p></div>
              <div><p className="text-xs text-slate-500">Duration</p><p className="font-medium">{details.duration}</p></div>
            </div>
            {details.monitoring?.length > 0 && <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Monitoring:</p>
              {details.monitoring.map((m, i) => <div key={i} className="flex items-center gap-1 text-xs"><CheckCircle2 className="w-3 h-3 text-green-500" />{m}</div>)}
            </div>}
            {details.key_warnings?.length > 0 && <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Warnings</p>
              {details.key_warnings.map((w, i) => <p key={i} className="text-xs text-red-700">{w}</p>)}
            </div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SmartClinicalNotes({ patient }) {
  if (!patient) return (
    <div className="text-center py-8 text-slate-400">
      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
      <p className="text-sm">Select a patient to use AI Clinical Notes</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="text-sm font-semibold text-slate-700">AI Clinical Assistant</span>
        <Badge className="bg-purple-100 text-purple-700 text-xs">{patient.patient_name}</Badge>
      </div>

      <Tabs defaultValue="suggestions">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="suggestions" className="text-xs gap-1"><Sparkles className="w-3 h-3" />Suggestions</TabsTrigger>
          <TabsTrigger value="summary" className="text-xs gap-1"><FileText className="w-3 h-3" />Summary</TabsTrigger>
          <TabsTrigger value="ddx" className="text-xs gap-1"><Stethoscope className="w-3 h-3" />DDx</TabsTrigger>
          <TabsTrigger value="meds" className="text-xs gap-1"><Pill className="w-3 h-3" />Meds</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="mt-4"><AISuggestions patient={patient} /></TabsContent>
        <TabsContent value="summary" className="mt-4"><VisitSummarizer patient={patient} /></TabsContent>
        <TabsContent value="ddx" className="mt-4"><DifferentialDx patient={patient} /></TabsContent>
        <TabsContent value="meds" className="mt-4"><MedAutoComplete patient={patient} /></TabsContent>
      </Tabs>
    </div>
  );
}