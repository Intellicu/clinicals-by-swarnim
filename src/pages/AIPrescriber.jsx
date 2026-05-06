import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Brain, ArrowLeft, Loader2, AlertTriangle, CheckCircle, ChevronRight,
  Sparkles, ClipboardList, Pill, FileText, Activity, Zap, RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { usePatient } from "../components/PatientContext";
import PatientInputForm from "../components/ai-prescriber/PatientInputForm";
import TemplatePrescriberOutput from "../components/ai-prescriber/TemplatePrescriberOutput";
import PrescriptionPreview from "../components/ai-prescriber/PrescriptionPreview";
import { PATHWAY_TEMPLATES, matchPathway } from "../components/ai-prescriber/PathwayTemplates";
import { calcBSA, calcSchwartzEgfr } from "../components/ai-prescriber/DoseEngine";

const STEPS = [
  { id: "input", label: "Patient Input", icon: Activity },
  { id: "ai", label: "AI Analysis", icon: Brain },
  { id: "template", label: "Drug Plan", icon: Pill },
  { id: "prescription", label: "Prescription", icon: FileText },
];

const RENAL_WARNINGS = [
  "Tacrolimus/Cyclosporine — TDM mandatory; nephrotoxic at high levels",
  "NSAIDs — Absolutely contraindicated in all renal disease",
  "Aminoglycosides (Gentamicin) — Dose interval by eGFR; trough <1 mcg/mL",
  "Methotrexate — Reduce dose if eGFR <50; folinic acid supplementation",
  "Contrast agents — Hydrate; avoid eGFR <30; hold metformin 48h",
  "Cyclophosphamide IV — Hydration ≥2L/m² + MESNA if dose >500mg/m²",
];

export default function AIPrescriber() {
  const { patientData } = usePatient();

  const [step, setStep] = useState("input");
  const [patientState, setPatientState] = useState({
    age: patientData.age ? String(patientData.age) : "",
    weight: patientData.weight ? String(patientData.weight) : "",
    height: patientData.height ? String(patientData.height) : "",
    egfr: "", creatinine: "", bp: "", symptoms: "", labs: "", diagnosis: "",
  });
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState(null);
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [autoMatchResult, setAutoMatchResult] = useState(null);
  const [activeDrugs, setActiveDrugs] = useState([]);

  const { age, weight, height, egfr, creatinine, symptoms, labs, diagnosis } = patientState;

  const bsa = useMemo(() => calcBSA(parseFloat(weight), parseFloat(height)), [weight, height]);
  const autoEgfr = useMemo(() => calcSchwartzEgfr(parseFloat(creatinine), parseFloat(height), parseFloat(age)), [creatinine, height, age]);
  const effectiveEgfr = egfr || autoEgfr;

  // Step 1: AI Analysis
  const runAIAnalysis = async () => {
    if (!weight || !symptoms) {
      toast.error("Enter weight and symptoms to continue");
      return;
    }
    setLoading(true);
    setStep("ai");

    // Auto-match pathway immediately (fast, local)
    const matched = matchPathway(symptoms, diagnosis, labs);
    setAutoMatchResult(matched);
    if (matched && !selectedPathway) setSelectedPathway(matched.key);

    try {
      const prompt = `You are a Pediatric Nephrology Clinical Co-pilot. Based on KDIGO 2024, IPNA 2023, ISKDC guidelines.

PATIENT:
- Age: ${age || "?"} years | Weight: ${weight} kg | Height: ${height || "?"} cm
- BSA: ${bsa ? bsa + " m²" : "N/A"} | eGFR: ${effectiveEgfr || "not provided"} mL/min/1.73m²
- BP: ${patientState.bp || "not provided"} | Diagnosis: ${diagnosis || "not specified"}
- Symptoms/Examination: ${symptoms}
- Lab results: ${labs || "not provided"}

Generate a structured, concise clinical assessment in this exact format:

## 🩺 Clinical Diagnosis
[State the most likely diagnosis and subtype. Confidence level: High/Moderate/Low. What additional workup confirms this?]

## 📋 Urgency & Immediate Actions
[Numbered list. Star any that are emergency-level. Max 6 items.]

## 💊 Drug Therapy Plan
[Each drug: **Name** | Dose (calculated for ${weight}kg) | Frequency | Route | Duration | Key monitoring. Evidence level.]

## ⚠️ Safety Alerts
[Drug contraindications, max dose warnings, renal adjustments for eGFR ${effectiveEgfr || "unknown"}, nephrotoxic combinations]

## 📊 Monitoring Plan
[Parameters, frequency, target values]

## 🥗 Diet & Supportive Care
[Brief, actionable items]

## 🔁 Follow-up
[Timing and escalation triggers]

Be concise and practical for Indian pediatric nephrology. Prioritise ISKDC/IPNA first-line protocols.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });
      setAiOutput(result);
      toast.success("AI analysis complete");
    } catch (e) {
      toast.error("AI analysis failed — using template-based pathway");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("input");
    setAiOutput(null);
    setSelectedPathway(null);
    setAutoMatchResult(null);
    setActiveDrugs([]);
  };

  const canProceed = {
    input: !!weight && !!symptoms,
    ai: !!selectedPathway,
    template: activeDrugs.length > 0,
  };

  const stepIdx = STEPS.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <Link to={createPageUrl("Hub")}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Hub</Button>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AI Prescriber</h1>
              <p className="text-xs text-slate-500">Input → AI Analysis → Template → Prescription</p>
            </div>
          </div>
          <Button onClick={reset} variant="ghost" size="sm" className="text-slate-500">
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < stepIdx;
            const active = s.id === step;
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => done && setStep(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                    ${active ? "bg-indigo-600 text-white shadow-md" : done ? "bg-indigo-100 text-indigo-700 cursor-pointer hover:bg-indigo-200" : "bg-slate-100 text-slate-400 cursor-default"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {s.label}
                  {done && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${done ? "text-indigo-400" : "text-slate-300"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── STEP 1: INPUT ── */}
        {step === "input" && (
          <div className="space-y-4">
            <PatientInputForm state={patientState} setState={setPatientState} />
            <Button onClick={runAIAnalysis} disabled={!canProceed.input}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 text-sm shadow-lg">
              <Brain className="w-5 h-5 mr-2" /> Run AI Analysis & Match Pathway
            </Button>
          </div>
        )}

        {/* ── STEP 2: AI OUTPUT ── */}
        {step === "ai" && (
          <div className="space-y-4">
            {loading && (
              <Card className="bg-white shadow-md">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">AI analysing patient data...</p>
                  <p className="text-xs text-slate-400 mt-1">Using Claude Sonnet for clinical reasoning (KDIGO/IPNA/ISKDC)</p>
                </CardContent>
              </Card>
            )}

            {!loading && (
              <>
                {/* Auto-match result */}
                {autoMatchResult && (
                  <Alert className="bg-emerald-50 border-emerald-300">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-800 text-sm">
                      <strong>Auto-matched pathway:</strong> {PATHWAY_TEMPLATES[autoMatchResult.key]?.label}
                      <Badge className="ml-2 bg-emerald-200 text-emerald-800 text-xs">{autoMatchResult.confidence}% confidence</Badge>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Pathway selector */}
                <Card className="bg-white border border-indigo-200 shadow-sm">
                  <CardHeader className="bg-indigo-50 border-b py-3 px-5">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-indigo-600" /> Select Clinical Pathway / Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Select value={selectedPathway || ""} onValueChange={setSelectedPathway}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select pathway..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PATHWAY_TEMPLATES).map(([key, t]) => (
                          <SelectItem key={key} value={key}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* AI Output */}
                {aiOutput && (
                  <Card className="bg-white shadow-lg border-2 border-indigo-100">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b py-3 px-5">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Brain className="w-4 h-4 text-indigo-600" /> AI Clinical Assessment
                        <Badge className="ml-auto bg-indigo-100 text-indigo-700 text-xs">KDIGO/IPNA/ISKDC</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 flex gap-4 text-xs mb-4 flex-wrap">
                        <span><strong>Age:</strong> {age || "?"} y</span>
                        <span><strong>Weight:</strong> {weight} kg</span>
                        {bsa && <span><strong>BSA:</strong> {bsa} m²</span>}
                        {effectiveEgfr && <span><strong>eGFR:</strong> {effectiveEgfr}</span>}
                        {diagnosis && <span><strong>Dx:</strong> {diagnosis}</span>}
                      </div>
                      <ReactMarkdown className="prose prose-sm max-w-none text-slate-800 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-indigo-800 [&>h2]:mt-3 [&>p]:text-sm [&>ul]:text-sm [&>ol]:text-sm">
                        {aiOutput}
                      </ReactMarkdown>
                    </CardContent>
                  </Card>
                )}

                {!aiOutput && !loading && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 text-sm">AI analysis unavailable. Select a pathway manually above to proceed with template-based prescribing.</AlertDescription>
                  </Alert>
                )}

                {/* Renal safety strip */}
                {effectiveEgfr && parseFloat(effectiveEgfr) < 60 && (
                  <Card className="bg-amber-50 border-2 border-amber-300">
                    <CardHeader className="py-2 px-4 border-b border-amber-200">
                      <CardTitle className="text-xs text-amber-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Renal Impairment Detected — eGFR {effectiveEgfr} mL/min
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <ul className="space-y-1">
                        {RENAL_WARNINGS.map((w, i) => (
                          <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                            <span className="flex-shrink-0 mt-0.5">⚠️</span> {w}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Button onClick={() => setStep("template")} disabled={!selectedPathway}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3">
                  <Pill className="w-5 h-5 mr-2" /> Load Drug Template & Calculate Doses
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        )}

        {/* ── STEP 3: TEMPLATE + DOSES ── */}
        {step === "template" && selectedPathway && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200 py-2">
              <AlertDescription className="text-blue-800 text-xs">
                ✓ Check/uncheck drugs to include in prescription. Doses auto-calculated for <strong>{weight} kg</strong>{bsa ? `, BSA ${bsa} m²` : ""}.
              </AlertDescription>
            </Alert>

            <TemplatePrescriberOutput
              pathwayKey={selectedPathway}
              weight={weight}
              height={height}
              bsa={bsa}
              egfr={effectiveEgfr}
              age={age}
              onDrugsChange={(names, drugs) => setActiveDrugs(drugs)}
            />

            <Button onClick={() => setStep("prescription")} disabled={activeDrugs.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3">
              <FileText className="w-5 h-5 mr-2" /> Generate Prescription
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* ── STEP 4: PRESCRIPTION ── */}
        {step === "prescription" && (
          <div className="space-y-4">
            <Alert className="bg-emerald-50 border-emerald-200 py-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800 text-xs">
                Prescription generated — {activeDrugs.length} drug(s). Review carefully before printing/sharing.
              </AlertDescription>
            </Alert>

            <PrescriptionPreview
              patientState={{ ...patientState, egfr: effectiveEgfr }}
              pathwayKey={selectedPathway}
              activeDrugs={activeDrugs}
            />

            <div className="flex gap-3">
              <Button onClick={() => setStep("template")} variant="outline" className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-1" /> Edit Drugs
              </Button>
              <Link to={createPageUrl("DrugsDosing")} className="flex-1">
                <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                  <Pill className="w-4 h-4 mr-1" /> Open Drug Calculator
                </Button>
              </Link>
            </div>

            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-xs text-amber-800">
                AI-generated prescription. Verify all doses independently. Not a substitute for clinical judgment. Always confirm with current guidelines.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}