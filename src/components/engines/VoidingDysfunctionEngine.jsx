import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, Activity, Droplet, AlertCircle } from "lucide-react";

const ENTRY_SYMPTOMS = [
  { id: "urgency", label: "Urgency" },
  { id: "daytime_wetting", label: "Daytime wetting / incontinence" },
  { id: "recurrent_uti", label: "Recurrent UTIs (≥2 febrile or ≥3 any)" },
  { id: "holding_maneuvers", label: "Holding maneuvers (curtsey, leg crossing)" },
  { id: "constipation", label: "Constipation / encopresis" },
  { id: "enuresis", label: "Nocturnal enuresis" },
  { id: "frequency", label: "Increased urinary frequency (>8 voids/day)" },
  { id: "straining", label: "Straining to void / weak stream" },
];

const BBD_QUESTIONS = [
  { id: "bbdq_urgency", label: "Urgency (sudden need to void that is hard to defer)" },
  { id: "bbdq_frequency", label: "Voiding frequency <4 or >7 times per day" },
  { id: "bbdq_withholding", label: "Withholding postures (curtsey sign, heel sitting)" },
  { id: "bbdq_constipation", label: "Constipation (hard stool, <3x/week)" },
  { id: "bbdq_encopresis", label: "Encopresis / soiling" },
  { id: "bbdq_uti", label: "Recurrent UTIs" },
];

const UROFLOW_PATTERNS = [
  { id: "bell", label: "Bell (normal, smooth bell curve)", dx: "Normal voiding" },
  { id: "tower", label: "Tower (rapid, high peak, short duration)", dx: "Overactive bladder / urgency" },
  { id: "plateau", label: "Plateau (flat, prolonged, low peak)", dx: "Infravesical obstruction / underactive detrusor" },
  { id: "interrupted", label: "Interrupted (multiple peaks, stops)", dx: "Dysfunctional voiding / Hinman syndrome" },
  { id: "staccato", label: "Staccato (irregular fluctuating curve)", dx: "Detrusor-sphincter dyssynergia / BBD" },
];

const DIAGNOSES = {
  oab: { label: "Overactive Bladder (OAB)", color: "bg-amber-50 border-amber-300", mgmt: ["Bladder training (timed voiding schedule)", "Anticholinergics: Oxybutynin 0.1–0.2 mg/kg TDS; or Solifenacin", "Treat constipation — vital for OAB resolution", "Avoid caffeine, carbonated drinks", "Biofeedback for urgency suppression"] },
  dv: { label: "Dysfunctional Voiding", color: "bg-red-50 border-red-300", mgmt: ["Urotherapy (education, voiding schedule)", "Pelvic floor relaxation training", "Biofeedback (perineal EMG-guided)", "Treat underlying constipation", "CIC if significant PVR or staccato pattern persists"] },
  underactive: { label: "Underactive Bladder", color: "bg-blue-50 border-blue-300", mgmt: ["Timed voiding every 2–3 hours (alarm reminders)", "Double voiding technique", "CIC if PVR >30% bladder capacity", "Parasympathomimetics (bethanechol) — limited evidence", "Refer urology if CIC required long-term"] },
  neurogenic: { label: "Neurogenic Bladder", color: "bg-red-50 border-red-300", mgmt: ["Urodynamics (UDS) ESSENTIAL for classification", "CIC ± anticholinergics (if detrusor overactivity + compliance)", "Baclofen/Botox for detrusor hyperreflexia", "Annual upper tract monitoring (USG ± VCUG)", "Multidisciplinary: nephrology + urology + neurology"] },
  bbd: { label: "Bladder Bowel Dysfunction (BBD)", color: "bg-orange-50 border-orange-300", mgmt: ["Treat CONSTIPATION FIRST — most important step", "Timed voiding schedule + fluid optimization", "Biofeedback for dysfunctional voiding component", "Anticholinergics only after constipation resolved", "Monitor: UPCR, USG, post-void residual"] },
  mne: { label: "Monosymptomatic Nocturnal Enuresis (MNE)", color: "bg-green-50 border-green-300", mgmt: ["First line: Enuresis alarm (70–80% success, 3 months)", "Second line: Desmopressin 0.1–0.4 mg oral (bedtime)", "Combination: alarm + desmopressin for fast responders", "Restrict fluids 1–2h before sleep", "Motivational therapy, reward charts"] },
};

export default function VoidingDysfunctionEngine() {
  const [step, setStep] = useState(0);
  const [symptoms, setSymptoms] = useState({});
  const [continenceAchieved, setContinenceAchieved] = useState(null);
  const [hasDaytime, setHasDaytime] = useState(null);
  const [bbd, setBBD] = useState({});
  const [uroflow, setUroflow] = useState("");
  const [pvr, setPVR] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const toggleSym = (id) => setSymptoms(s => ({ ...s, [id]: !s[id] }));
  const toggleBBD = (id) => setBBD(b => ({ ...b, [id]: !b[id] }));

  const calcDiagnosis = () => {
    if (!hasDaytime) return "mne";
    const bbdScore = Object.values(bbd).filter(Boolean).length;
    if (bbdScore >= 3) return "bbd";
    if (uroflow === "tower") return "oab";
    if (uroflow === "staccato" || uroflow === "interrupted") return "dv";
    if (uroflow === "plateau") return "underactive";
    if (pvr === "abnormal") return "dv";
    return "oab";
  };

  const renderEntry = () => (
    <div className="space-y-3">
      <Alert className="bg-teal-50 border-teal-200">
        <Activity className="w-4 h-4 text-teal-600" />
        <AlertDescription className="text-teal-800 text-sm">
          <strong>Voiding Dysfunction Engine:</strong> ICCS 2016 terminology. Check presenting symptoms to begin structured assessment.
        </AlertDescription>
      </Alert>
      <p className="text-sm font-semibold text-slate-700">Select ALL symptoms present:</p>
      <div className="space-y-1.5">
        {ENTRY_SYMPTOMS.map(s => (
          <button key={s.id} onClick={() => toggleSym(s.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${symptoms[s.id] ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-white border-slate-200 text-slate-700"}`}>
            {symptoms[s.id] ? <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
            {s.label}
          </button>
        ))}
      </div>
      <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => setStep(1)}>
        Begin Assessment <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );

  const renderContinence = () => (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-800">Step 1: Age-appropriate continence achieved?</p>
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
        <p><strong>Expected milestones:</strong></p>
        <p>• Daytime dryness: 2–3 years | Nighttime: 4–5 years</p>
        <p>• Primary enuresis = never achieved; Secondary = relapse after 6 months dry</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {["Yes (normal development)", "No (never fully dry / regression)"].map((opt, i) => (
          <button key={opt} onClick={() => setContinenceAchieved(i === 0)}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${continenceAchieved === (i === 0) && continenceAchieved !== null ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-700"}`}>
            {opt}
          </button>
        ))}
      </div>
      {continenceAchieved === false && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-xs">Primary non-achievement: Consider urodynamics to rule out structural/neurogenic cause. Check spine (sacral agenesis, tethered cord).</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(0)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Button className="flex-1 bg-teal-600 hover:bg-teal-700" disabled={continenceAchieved === null} onClick={() => setStep(2)}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );

  const renderDaytime = () => (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-800">Step 2: Daytime symptoms present?</p>
      <div className="grid grid-cols-2 gap-2">
        {["Yes — daytime symptoms", "No — only nighttime (enuresis)"].map((opt, i) => (
          <button key={opt} onClick={() => setHasDaytime(i === 0)}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${hasDaytime === (i === 0) && hasDaytime !== null ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-700"}`}>
            {opt}
          </button>
        ))}
      </div>
      {hasDaytime === false && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-800">
          <p className="font-bold mb-1">→ Monosymptomatic Nocturnal Enuresis (MNE)</p>
          <p>No daytime symptoms. Pathophysiology: nocturnal polyuria + high arousal threshold + bladder overactivity.</p>
        </div>
      )}
      {hasDaytime === true && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          <p className="font-bold">→ Non-monosymptomatic enuresis / Voiding dysfunction</p>
          <p>Proceed to full BBD assessment, bladder diary, uroflow.</p>
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Button className="flex-1 bg-teal-600 hover:bg-teal-700" disabled={hasDaytime === null} onClick={() => hasDaytime ? setStep(3) : (setDiagnosis("mne"), setStep(6))}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );

  const renderBBD = () => {
    const score = Object.values(bbd).filter(Boolean).length;
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-800">Step 3: BBD Questionnaire (ICCS)</p>
        {BBD_QUESTIONS.map(q => (
          <button key={q.id} onClick={() => toggleBBD(q.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${bbd[q.id] ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-white border-slate-200 text-slate-700"}`}>
            {bbd[q.id] ? <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
            {q.label}
          </button>
        ))}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 text-center text-sm">
          <span className="font-bold text-teal-700">{score}/6 features</span>
          <span className="text-slate-500 ml-2">{score >= 3 ? "→ BBD likely" : "→ Low BBD probability"}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep(2)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => setStep(4)}>Uroflow Assessment <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </div>
    );
  };

  const renderUroflow = () => (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-800">Step 4–5: Uroflow Pattern + PVR</p>
      <p className="text-xs text-slate-500">Select the uroflow pattern observed:</p>
      <div className="space-y-1.5">
        {UROFLOW_PATTERNS.map(p => (
          <button key={p.id} onClick={() => setUroflow(p.id)}
            className={`w-full flex items-start gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${uroflow === p.id ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${uroflow === p.id ? "text-teal-800" : "text-slate-700"}`}>{p.label}</p>
              <p className="text-xs text-slate-500">→ {p.dx}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs font-semibold text-slate-700 mt-2">Post-Void Residual (PVR):</p>
      <div className="grid grid-cols-2 gap-2">
        {[["normal", "Normal (<10% of bladder capacity)"], ["abnormal", "Elevated (>30% bladder capacity)"]].map(([v, l]) => (
          <button key={v} onClick={() => setPVR(v)}
            className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${pvr === v ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-700"}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(3)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Button className="flex-1 bg-teal-600 hover:bg-teal-700" disabled={!uroflow} onClick={() => { setDiagnosis(calcDiagnosis()); setStep(6); }}>Generate Diagnosis <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );

  const renderDiagnosisOutput = () => {
    const dx = DIAGNOSES[diagnosis];
    if (!dx) return null;
    return (
      <div className="space-y-3">
        <div className={`rounded-xl border-2 p-4 ${dx.color}`}>
          <p className="text-base font-bold text-slate-900">Diagnosis: {dx.label}</p>
        </div>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="py-2 px-3 border-b border-green-200">
            <CardTitle className="text-xs font-bold text-green-900 uppercase tracking-wide">Management Protocol</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-1">
            {dx.mgmt.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-green-800">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-600" />{m}
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1 text-xs text-slate-700">
          <p className="font-bold text-slate-800">Investigations Required:</p>
          {[
            "Must: Urinalysis + urine culture, USG kidneys/bladder (pre/post-void), bladder diary × 48h",
            "Should: Uroflow + PVR, BBD questionnaire score",
            "If complex/neurogenic: Urodynamic study (UDS), spine MRI, VCUG",
          ].map((i, j) => <p key={j}>{i}</p>)}
        </div>
        <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => { setStep(0); setSymptoms({}); setContinenceAchieved(null); setHasDaytime(null); setBBD({}); setUroflow(""); setPVR(""); setDiagnosis(""); }}>
          New Patient
        </Button>
      </div>
    );
  };

  const stepRenderers = [renderEntry, renderContinence, renderDaytime, renderBBD, renderUroflow, null, renderDiagnosisOutput];
  const STEP_LABELS = ["Symptoms", "Continence", "Daytime?", "BBD Qx", "Uroflow/PVR", null, "Diagnosis"];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-teal-700 to-emerald-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Droplet className="w-5 h-5" />
          <h3 className="text-sm font-bold">Voiding Dysfunction Intelligence Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">ICCS 2016</Badge>
        </div>
        <p className="text-xs text-teal-100">Entry → Continence → BBD → Uroflow → Diagnosis → Management</p>
        <div className="flex gap-1 mt-2 flex-wrap">
          {STEP_LABELS.filter(Boolean).map((s, i) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${i === step ? "bg-white text-teal-700 font-semibold" : i < step ? "bg-teal-500 text-white" : "bg-white/10 text-teal-200"}`}>{i + 1}. {s}</span>
          ))}
        </div>
      </div>
      {stepRenderers[step] && stepRenderers[step]()}
    </div>
  );
}