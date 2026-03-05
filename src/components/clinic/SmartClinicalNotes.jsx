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
  Copy, ChevronRight, AlertCircle, CheckCircle2, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

// ─── Visit History Summary ───────────────────────────────────────────────────
function VisitSummarizer({ patient }) {
  const [summary, setSummary] = useState("");

  const { data: visits = [] } = useQuery({
    queryKey: ["patient-visits", patient?.id],
    queryFn: () => base44.entities.VisitRecord.filter({ patient_id: patient.id }, "-visit_date", 10),
    enabled: !!patient?.id,
  });

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const visitData = visits.map((v) => ({
        date: v.visit_date?.split("T")[0],
        type: v.visit_type,
        complaint: v.chief_complaint,
        diagnosis: v.diagnosis,
        treatment: v.treatment_plan,
        prescriptions: v.prescriptions?.map((p) => `${p.drug_name} ${p.dose} ${p.frequency}`).join(", "),
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a clinical AI assistant. Summarize the following patient visit history for a clinician preparing for a consultation.

Patient: ${patient.patient_name}, Age: ${patient.age_years || "?"}yr, Diagnosis: ${patient.diagnosis || "?"}

Visit History (most recent first):
${JSON.stringify(visitData, null, 2)}

Provide:
1. CLINICAL TRAJECTORY: Brief summary of disease course
2. KEY EVENTS: Important milestones, relapses, hospitalizations
3. MEDICATION HISTORY: Key drug changes and responses
4. CURRENT STATUS: Based on most recent visit
5. WATCH POINTS: What to focus on in next consultation

Keep it concise and clinically useful.`,
      });
      return result;
    },
    onSuccess: (data) => setSummary(data),
    onError: () => toast.error("Failed to generate summary"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{visits.length} visits in history</p>
        <Button
          onClick={() => summarizeMutation.mutate()}
          disabled={summarizeMutation.isPending || visits.length === 0}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          {summarizeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Summary
        </Button>
      </div>

      {summary ? (
        <div className="relative">
          <Textarea value={summary} readOnly rows={12} className="text-sm font-mono bg-slate-50 resize-none" />
          <Button size="sm" variant="outline" className="absolute top-2 right-2 h-7 gap-1"
            onClick={() => { navigator.clipboard.writeText(summary); toast.success("Copied!"); }}>
            <Copy className="w-3 h-3" /> Copy
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Click "Generate Summary" to create an AI-powered visit history summary</p>
        </div>
      )}
    </div>
  );
}

// ─── Differential Diagnosis ──────────────────────────────────────────────────
function DifferentialDx({ patient }) {
  const [symptoms, setSymptoms] = useState("");
  const [results, setResults] = useState(null);

  const ddxMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Pediatric Nephrology expert. Generate a differential diagnosis.

Patient: ${patient.patient_name}, Age: ${patient.age_years || "?"}yr, Gender: ${patient.gender || "?"}
Known Diagnosis: ${patient.diagnosis || "None"}
Presenting Symptoms: ${symptoms}

Provide a differential diagnosis list with:
- Top 5 diagnoses ranked by likelihood
- For each: key supporting features, distinguishing tests needed, urgency level (Routine/Urgent/Emergency)

Format as JSON with this structure: { "differentials": [{ "diagnosis": string, "likelihood": "High|Medium|Low", "urgency": "Routine|Urgent|Emergency", "supporting_features": string[], "key_tests": string[] }], "clinical_pearl": string }`,
        response_json_schema: {
          type: "object",
          properties: {
            differentials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  diagnosis: { type: "string" },
                  likelihood: { type: "string" },
                  urgency: { type: "string" },
                  supporting_features: { type: "array", items: { type: "string" } },
                  key_tests: { type: "array", items: { type: "string" } },
                },
              },
            },
            clinical_pearl: { type: "string" },
          },
        },
      });
      return result;
    },
    onSuccess: (data) => setResults(data),
    onError: () => toast.error("Failed to generate differential"),
  });

  const URGENCY_STYLES = { Emergency: "bg-red-100 text-red-700", Urgent: "bg-amber-100 text-amber-700", Routine: "bg-green-100 text-green-700" };
  const LIKELIHOOD_STYLES = { High: "bg-blue-100 text-blue-700", Medium: "bg-slate-100 text-slate-600", Low: "bg-slate-50 text-slate-500" };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Enter presenting symptoms, e.g.: 3-year-old with facial puffiness for 1 week, reduced urine output, no fever, trace proteinuria on dipstick..."
          rows={3}
          className="text-sm"
        />
        <Button onClick={() => ddxMutation.mutate()} disabled={!symptoms || ddxMutation.isPending} className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
          {ddxMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
          Generate Differential Diagnosis
        </Button>
      </div>

      {results && (
        <div className="space-y-3">
          {results.differentials?.map((d, i) => (
            <Card key={i} className={`border-l-4 ${d.urgency === "Emergency" ? "border-l-red-400" : d.urgency === "Urgent" ? "border-l-amber-400" : "border-l-green-400"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{i + 1}</span>
                    <span className="font-semibold text-sm">{d.diagnosis}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Badge className={`${LIKELIHOOD_STYLES[d.likelihood]} text-xs`}>{d.likelihood}</Badge>
                    <Badge className={`${URGENCY_STYLES[d.urgency]} text-xs`}>{d.urgency}</Badge>
                  </div>
                </div>
                {d.supporting_features?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-slate-500 mb-1">Supporting Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {d.supporting_features.map((f, j) => <span key={j} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{f}</span>)}
                    </div>
                  </div>
                )}
                {d.key_tests?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Key Tests:</p>
                    <div className="flex flex-wrap gap-1">
                      {d.key_tests.map((t, j) => <span key={j} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{t}</span>)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {results.clinical_pearl && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
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

  const medMutation = useMutation({
    mutationFn: async () => {
      const weight = patient?.baseline_vitals?.weight;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Pediatric Pharmacology expert. Provide complete prescribing details for:

Drug: ${drugName}
Patient: ${patient.patient_name}, Age: ${patient.age_years || "?"}yr, Weight: ${weight || "?"}kg
Diagnosis: ${patient.diagnosis || "?"}

Provide complete medication details formatted as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            generic_name: { type: "string" },
            brand_names: { type: "array", items: { type: "string" } },
            dose: { type: "string" },
            calculated_dose: { type: "string" },
            frequency: { type: "string" },
            route: { type: "string" },
            duration: { type: "string" },
            formulations: { type: "array", items: { type: "string" } },
            monitoring: { type: "array", items: { type: "string" } },
            key_warnings: { type: "array", items: { type: "string" } },
            instructions: { type: "string" },
          },
        },
      });
      return result;
    },
    onSuccess: (data) => setDetails(data),
    onError: () => toast.error("Failed to fetch medication details"),
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={drugName}
          onChange={(e) => setDrugName(e.target.value)}
          placeholder="Enter drug name (e.g., Prednisolone, Amlodipine)"
          className="flex-1 text-sm"
          onKeyDown={(e) => e.key === "Enter" && drugName && medMutation.mutate()}
        />
        <Button onClick={() => medMutation.mutate()} disabled={!drugName || medMutation.isPending} className="gap-2 bg-green-600 hover:bg-green-700 shrink-0">
          {medMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pill className="w-4 h-4" />}
        </Button>
      </div>

      {details && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{details.generic_name}</CardTitle>
              <Button size="sm" variant="outline" className="h-7 gap-1"
                onClick={() => {
                  const text = `${details.generic_name} - ${details.dose} - ${details.frequency} - ${details.route} - ${details.duration}`;
                  navigator.clipboard.writeText(text);
                  toast.success("Copied to clipboard!");
                }}>
                <Copy className="w-3 h-3" /> Copy Rx
              </Button>
            </div>
            {details.brand_names?.length > 0 && (
              <p className="text-xs text-slate-500">Brands: {details.brand_names.join(", ")}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Standard Dose</p>
                <p className="font-semibold text-sm text-blue-800">{details.dose}</p>
              </div>
              {details.calculated_dose && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">For This Patient</p>
                  <p className="font-semibold text-sm text-green-800">{details.calculated_dose}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><p className="text-xs text-slate-500">Frequency</p><p className="font-medium">{details.frequency}</p></div>
              <div><p className="text-xs text-slate-500">Route</p><p className="font-medium">{details.route}</p></div>
              <div><p className="text-xs text-slate-500">Duration</p><p className="font-medium">{details.duration}</p></div>
            </div>

            {details.formulations?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Available Forms:</p>
                <div className="flex flex-wrap gap-1">{details.formulations.map((f, i) => <Badge key={i} variant="outline" className="text-xs">{f}</Badge>)}</div>
              </div>
            )}

            {details.monitoring?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Monitoring:</p>
                <div className="space-y-1">{details.monitoring.map((m, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs"><CheckCircle2 className="w-3 h-3 text-green-500" />{m}</div>
                ))}</div>
              </div>
            )}

            {details.key_warnings?.length > 0 && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Warnings</p>
                <div className="space-y-1">{details.key_warnings.map((w, i) => <p key={i} className="text-xs text-red-700">{w}</p>)}</div>
              </div>
            )}

            {details.instructions && <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded italic">{details.instructions}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
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
        <Sparkles className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-semibold text-slate-700">AI Clinical Assistant</span>
        <Badge className="bg-blue-100 text-blue-700 text-xs">{patient.patient_name}</Badge>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="w-full">
          <TabsTrigger value="summary" className="flex-1 text-xs gap-1">
            <FileText className="w-3 h-3" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="ddx" className="flex-1 text-xs gap-1">
            <Stethoscope className="w-3 h-3" />
            Diff. Dx
          </TabsTrigger>
          <TabsTrigger value="meds" className="flex-1 text-xs gap-1">
            <Pill className="w-3 h-3" />
            Medications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <VisitSummarizer patient={patient} />
        </TabsContent>
        <TabsContent value="ddx" className="mt-4">
          <DifferentialDx patient={patient} />
        </TabsContent>
        <TabsContent value="meds" className="mt-4">
          <MedAutoComplete patient={patient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}