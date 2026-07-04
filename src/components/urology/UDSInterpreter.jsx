import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { base44 } from "@/api/client";
import {
  Brain, Loader2, AlertTriangle, Upload, Activity,
  ChevronDown, ChevronUp, CheckCircle, BookOpen, Info
} from "lucide-react";

const UDS_PATTERNS = [
  {
    name: "Detrusor Overactivity (DO)",
    color: "border-red-300 bg-red-50",
    badge: "bg-red-100 text-red-800",
    pdet: ">40 cmH₂O involuntary",
    compliance: "May be reduced",
    iccs: "DO = involuntary detrusor contraction during filling",
    renal_risk: "High if persistent with poor compliance",
    management: "Anticholinergics/mirabegron, bladder training, CIC if needed",
  },
  {
    name: "Poor Compliance",
    color: "border-orange-300 bg-orange-50",
    badge: "bg-orange-100 text-orange-800",
    pdet: "Gradual rise >20 cmH₂O during filling",
    compliance: "<10 mL/cmH₂O",
    iccs: "ICCS: Compliance = ΔV / ΔPdet",
    renal_risk: "Very High — direct upper tract risk",
    management: "Urgent anticholinergics, CIC, botox, augmentation cystoplasty",
  },
  {
    name: "Detrusor Sphincter Dyssynergia (DSD)",
    color: "border-purple-300 bg-purple-50",
    badge: "bg-purple-100 text-purple-800",
    pdet: "High Pdet + high EMGEMI simultaneously",
    compliance: "Often poor",
    iccs: "DSD = simultaneous EUS activation with detrusor contraction",
    renal_risk: "Very High — valve bladder risk",
    management: "CIC mandatory, anticholinergics, alpha-blockers, botox into sphincter",
  },
  {
    name: "Underactive Detrusor",
    color: "border-teal-300 bg-teal-50",
    badge: "bg-teal-100 text-teal-800",
    pdet: "<20 cmH₂O during voiding",
    compliance: "Normal/high",
    iccs: "DUA = low Pdet with poor flow during voiding phase",
    renal_risk: "Medium-High — high PVR",
    management: "CIC, double voiding, Credé maneuver (avoid if high outlet resistance)",
  },
  {
    name: "Unsafe Bladder",
    color: "border-red-400 bg-red-100",
    badge: "bg-red-200 text-red-900",
    pdet: "Leak point pressure >40 cmH₂O",
    compliance: "<10 mL/cmH₂O",
    iccs: "LPP >40 cmH₂O = risk of upper tract damage",
    renal_risk: "VERY HIGH — CKD progression inevitable without treatment",
    management: "Emergency CIC, anticholinergics, immediate referral for augmentation",
  },
  {
    name: "Outlet Obstruction",
    color: "border-amber-300 bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
    pdet: "High Pdet + low Qmax",
    compliance: "Secondary poor compliance may develop",
    iccs: "BOO = high Pdet voiding with poor flow (Abrams-Griffiths nomogram)",
    renal_risk: "High — PUV, stricture, meatal stenosis",
    management: "VCUG to rule PUV, cystoscopy, urethral dilation/VUE",
  },
  {
    name: "Valve Bladder Physiology",
    color: "border-rose-300 bg-rose-50",
    badge: "bg-rose-100 text-rose-800",
    pdet: "High filling pressure + poor compliance",
    compliance: "<10 mL/cmH₂O, large capacity",
    iccs: "Post-PUV: persistent dysfunction despite valve ablation",
    renal_risk: "VERY HIGH — major cause of CKD progression in boys",
    management: "CIC, anticholinergics, bladder cycling, augmentation, renal transplant planning",
  },
];

const BLADDER_HOSTILITY = [
  { grade: 1, label: "Safe", color: "bg-green-100 text-green-800", desc: "Good compliance, normal capacity, no DO, LPP < 40", management: "Watchful waiting, routine f/u" },
  { grade: 2, label: "Mildly Hostile", color: "bg-yellow-100 text-yellow-800", desc: "Mild DO, compliance 10-20, LPP 40-60", management: "Anticholinergics, bladder training, 6-monthly imaging" },
  { grade: 3, label: "Moderately Hostile", color: "bg-orange-100 text-orange-800", desc: "DO + compliance 5-10, LPP 60-80, high PVR", management: "CIC + anticholinergics, 3-monthly USS renal, botox consideration" },
  { grade: 4, label: "Highly Hostile", color: "bg-red-100 text-red-800", desc: "Poor compliance <5, LPP >80, hydronephrosis, DSD", management: "Urgent CIC, botox, augmentation referral, renal protection priority" },
  { grade: 5, label: "Unsafe Bladder", color: "bg-red-200 text-red-900", desc: "All above + VUR + renal scarring or rising creatinine", management: "Emergency intervention — augmentation cystoplasty, urinary diversion, transplant planning" },
];

const InputRow = ({ label, value, onChange, unit, hint }) => (
  <div>
    <label className="text-xs font-semibold text-slate-600">{label}</label>
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
    <div className="flex gap-1 mt-1">
      <input
        className="flex-1 px-3 py-1.5 text-sm border-2 border-slate-200 rounded-lg bg-white outline-none focus:border-blue-400"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="—"
      />
      {unit && <span className="text-xs bg-slate-100 px-2 rounded-lg border text-slate-500 flex items-center">{unit}</span>}
    </div>
  </div>
);

const SelectRow = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-xs font-semibold text-slate-600">{label}</label>
    <select
      className="mt-1 w-full px-3 py-1.5 text-sm border-2 border-slate-200 rounded-lg bg-white"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

function PatternCard({ p, expanded, onToggle }) {
  return (
    <Card className={`border-2 cursor-pointer transition-all ${p.color}`}>
      <CardContent className="p-0">
        <button className="w-full flex items-center justify-between p-3" onClick={onToggle}>
          <Badge className={`text-xs ${p.badge}`}>{p.name}</Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        {expanded && (
          <div className="px-3 pb-3 space-y-2 text-xs">
            <p><span className="font-semibold">Pdet characteristic:</span> {p.pdet}</p>
            <p><span className="font-semibold">Compliance:</span> {p.compliance}</p>
            <p className="text-blue-700 italic">{p.iccs}</p>
            <p className="text-red-700 font-medium">⚠ Renal Risk: {p.renal_risk}</p>
            <div className="bg-white rounded-lg p-2 border border-slate-100">
              <span className="font-semibold text-green-700">Management: </span>
              <span className="text-slate-600">{p.management}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function UDSInterpreter() {
  const [expandedPattern, setExpandedPattern] = useState(null);
  const [inputs, setInputs] = useState({
    age: "", sex: "male", weight: "",
    pdetMax: "", pdetFilling: "", pdetVoiding: "",
    compliance: "", capacity: "", expectedCapacity: "",
    lpp: "", pvr: "", qmax: "",
    emgPattern: "", cystometryFindings: "", uroflowPattern: "",
    vcugFindings: "", clinicalContext: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const update = (k, v) => setInputs(prev => ({ ...prev, [k]: v }));

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      let fileUrl = null;
      if (file) {
        const up = await base44.integrations.Core.UploadFile({ file });
        fileUrl = up.file_url;
      }

      const prompt = `You are a expert pediatric urodynamicist. Interpret this complete urodynamic study (UDS) for a pediatric patient.

Patient: ${inputs.age}yr ${inputs.sex}, Weight: ${inputs.weight}kg
FILLING CYSTOMETRY:
- Max Pdet during filling: ${inputs.pdetFilling || "not provided"} cmH₂O
- Bladder compliance: ${inputs.compliance || "not provided"} mL/cmH₂O
- Cystometric capacity: ${inputs.capacity || "not provided"} mL
- Expected capacity (30+age×30): ${inputs.age ? (30 + parseInt(inputs.age || 0) * 30) + " mL" : "not calculated"}
- Leak Point Pressure: ${inputs.lpp || "not provided"} cmH₂O
- Cystometry findings: ${inputs.cystometryFindings || "none"}

VOIDING PHASE:
- Max voiding Pdet: ${inputs.pdetVoiding || "not provided"} cmH₂O
- Max Pdet overall: ${inputs.pdetMax || "not provided"} cmH₂O
- Qmax on uroflow: ${inputs.qmax || "not provided"} mL/s
- PVR: ${inputs.pvr || "not provided"} mL
- Uroflow pattern: ${inputs.uroflowPattern || "not specified"}

EMG: ${inputs.emgPattern || "not described"}
VCUG: ${inputs.vcugFindings || "not done"}
Clinical context: ${inputs.clinicalContext || "none"}

${file ? "Analyze the uploaded UDS trace as well." : ""}

Provide a comprehensive structured pediatric UDS interpretation as JSON:
{
  "primary_diagnosis": "main urodynamic diagnosis (ICCS terminology)",
  "pattern_classification": ["pattern 1", "pattern 2 if multiple"],
  "bladder_hostility_grade": "1-5",
  "bladder_hostility_justification": "why this grade",
  "detrusor_overactivity": "present/absent/equivocal + explanation",
  "compliance_assessment": "normal/reduced/severely reduced + cmH2O value",
  "dsd_present": "yes/no/cannot assess + explanation",
  "unsafe_bladder": "yes/no — criteria met or not",
  "renal_risk": "low/medium/high/very_high + explanation",
  "ckd_progression_risk": "assessment and contributing factors",
  "cic_recommendation": "yes/no + frequency + catheter size guidance",
  "anticholinergic_recommendation": "yes/no + suggested agent + dose guidance",
  "botox_consideration": "yes/no/threshold not met + criteria",
  "augmentation_triggers": "yes/no + criteria met",
  "followup_intervals": {
    "uss_kidneys": "frequency",
    "repeat_uds": "when",
    "renal_function": "frequency",
    "clinic_review": "when"
  },
  "structured_impression": "3-4 sentence formal urodynamic impression",
  "management_steps": ["step 1", "step 2", "step 3", "step 4"],
  "red_flags": ["any urgent findings"],
  "teaching_pearls": ["pearl 1", "pearl 2"],
  "guideline_references": ["ICCS ...", "ISPN ..."]
}`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: fileUrl ? [fileUrl] : undefined,
        response_json_schema: {
          type: "object",
          properties: {
            primary_diagnosis: { type: "string" },
            pattern_classification: { type: "array", items: { type: "string" } },
            bladder_hostility_grade: { type: "string" },
            bladder_hostility_justification: { type: "string" },
            detrusor_overactivity: { type: "string" },
            compliance_assessment: { type: "string" },
            dsd_present: { type: "string" },
            unsafe_bladder: { type: "string" },
            renal_risk: { type: "string" },
            ckd_progression_risk: { type: "string" },
            cic_recommendation: { type: "string" },
            anticholinergic_recommendation: { type: "string" },
            botox_consideration: { type: "string" },
            augmentation_triggers: { type: "string" },
            followup_intervals: { type: "object", additionalProperties: true },
            structured_impression: { type: "string" },
            management_steps: { type: "array", items: { type: "string" } },
            red_flags: { type: "array", items: { type: "string" } },
            teaching_pearls: { type: "array", items: { type: "string" } },
            guideline_references: { type: "array", items: { type: "string" } },
          }
        }
      });
      setResult(res);
    } catch (e) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  const hostilityGrade = result?.bladder_hostility_grade ? BLADDER_HOSTILITY.find(h => h.grade === parseInt(result.bladder_hostility_grade)) : null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-violet-700 to-purple-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <Activity className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Pediatric UDS Interpreter</h2>
            <p className="text-violet-100 text-sm">ICCS-based · Bladder hostility grading · Renal risk · Full management outputs</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="patterns">
        <TabsList className="flex w-full h-auto bg-white border overflow-x-auto p-1">
          <TabsTrigger value="patterns" className="text-xs flex-shrink-0">Pattern Library</TabsTrigger>
          <TabsTrigger value="hostility" className="text-xs flex-shrink-0">Hostility Grades</TabsTrigger>
          <TabsTrigger value="input" className="text-xs flex-shrink-0">Enter UDS Data</TabsTrigger>
          {result && <TabsTrigger value="result" className="text-xs flex-shrink-0 text-green-700 font-bold">AI Report ✓</TabsTrigger>}
        </TabsList>

        <TabsContent value="patterns" className="mt-3 space-y-2">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">ICCS Urodynamic Pattern Library</p>
          {UDS_PATTERNS.map((p, i) => (
            <PatternCard
              key={p.name}
              p={p}
              expanded={expandedPattern === i}
              onToggle={() => setExpandedPattern(expandedPattern === i ? null : i)}
            />
          ))}
        </TabsContent>

        <TabsContent value="hostility" className="mt-3 space-y-2">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Bladder Hostility Grading System</p>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <p className="text-xs text-blue-800">
                <span className="font-bold">Bladder Hostility</span> = risk the bladder poses to the upper urinary tract (kidneys). Grade is determined by compliance, LPP, DO, and VUR presence. Higher grade = higher CKD risk.
              </p>
            </CardContent>
          </Card>
          {BLADDER_HOSTILITY.map(h => (
            <Card key={h.grade} className="border-slate-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${h.color} text-sm font-bold`}>Grade {h.grade}: {h.label}</Badge>
                </div>
                <p className="text-xs text-slate-600 mb-1">{h.desc}</p>
                <div className="bg-white rounded-lg p-2 border border-slate-100 text-xs">
                  <span className="font-semibold text-green-700">Action: </span>
                  <span className="text-slate-600">{h.management}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="input" className="mt-3">
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <InputRow label="Age" value={inputs.age} onChange={v => update("age", v)} unit="years" />
                <SelectRow label="Sex" value={inputs.sex} onChange={v => update("sex", v)} options={["male", "female"]} />
                <InputRow label="Weight" value={inputs.weight} onChange={v => update("weight", v)} unit="kg" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider border-t pt-2">Filling Phase</p>
              <div className="grid grid-cols-2 gap-3">
                <InputRow label="Max Pdet (filling)" value={inputs.pdetFilling} onChange={v => update("pdetFilling", v)} unit="cmH₂O" hint="Involuntary rises" />
                <InputRow label="Bladder Compliance" value={inputs.compliance} onChange={v => update("compliance", v)} unit="mL/cmH₂O" hint="Normal >20" />
                <InputRow label="Cystometric Capacity" value={inputs.capacity} onChange={v => update("capacity", v)} unit="mL" />
                <InputRow label="Leak Point Pressure" value={inputs.lpp} onChange={v => update("lpp", v)} unit="cmH₂O" hint=">40 = unsafe" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider border-t pt-2">Voiding Phase</p>
              <div className="grid grid-cols-2 gap-3">
                <InputRow label="Max Pdet (voiding)" value={inputs.pdetVoiding} onChange={v => update("pdetVoiding", v)} unit="cmH₂O" />
                <InputRow label="Max Pdet (overall)" value={inputs.pdetMax} onChange={v => update("pdetMax", v)} unit="cmH₂O" />
                <InputRow label="Qmax (uroflow)" value={inputs.qmax} onChange={v => update("qmax", v)} unit="mL/s" />
                <InputRow label="Post-void Residual" value={inputs.pvr} onChange={v => update("pvr", v)} unit="mL" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider border-t pt-2">Additional Findings</p>
              <SelectRow
                label="EMG Pattern"
                value={inputs.emgPattern}
                onChange={v => update("emgPattern", v)}
                options={["Normal (relaxation during voiding)", "Increased (DSD — simultaneous contraction)", "Absent (denervation)", "Staccato (pelvic floor overactivity)"]}
              />
              <SelectRow
                label="Uroflow Pattern"
                value={inputs.uroflowPattern}
                onChange={v => update("uroflowPattern", v)}
                options={["Bell-shaped (normal)", "Plateau (obstruction)", "Staccato (pelvic floor overactivity)", "Interrupted (underactive/abdominal)", "Tower (urgency/DO)", "Fractionated"]}
              />
              <div>
                <label className="text-xs font-semibold text-slate-600">Cystometry Findings</label>
                <textarea
                  className="mt-1 w-full px-3 py-2 text-xs border-2 border-slate-200 rounded-lg bg-white outline-none focus:border-blue-400 resize-none"
                  rows={2}
                  placeholder="Describe any DO waves, instability, sensation abnormalities..."
                  value={inputs.cystometryFindings}
                  onChange={e => update("cystometryFindings", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">VCUG Findings</label>
                <textarea
                  className="mt-1 w-full px-3 py-2 text-xs border-2 border-slate-200 rounded-lg bg-white outline-none focus:border-blue-400 resize-none"
                  rows={2}
                  placeholder="VUR grade, PUV, trabeculated bladder, diverticula..."
                  value={inputs.vcugFindings}
                  onChange={e => update("vcugFindings", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Clinical Context</label>
                <textarea
                  className="mt-1 w-full px-3 py-2 text-xs border-2 border-slate-200 rounded-lg bg-white outline-none focus:border-blue-400 resize-none"
                  rows={2}
                  placeholder="Diagnosis (PUV, MMC, spina bifida), current medications, renal function..."
                  value={inputs.clinicalContext}
                  onChange={e => update("clinicalContext", e.target.value)}
                />
              </div>
              <div className="border-2 border-dashed border-violet-200 rounded-xl p-3 text-center bg-violet-50">
                <Upload className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                <p className="text-xs text-violet-700 font-medium">Upload UDS trace (optional)</p>
                <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0])} className="hidden" id="uds-file" />
                <label htmlFor="uds-file" className="cursor-pointer inline-block mt-1 bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-violet-700">
                  Choose File
                </label>
                {file && <p className="text-xs text-violet-700 mt-1 font-medium">✓ {file.name}</p>}
              </div>
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Interpreting UDS...</> : <><Brain className="w-4 h-4 mr-2" />AI Interpret UDS</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {result && (
          <TabsContent value="result" className="mt-3 space-y-3">
            {result.error ? (
              <Card className="border-red-200 bg-red-50"><CardContent className="p-4"><p className="text-red-700 text-sm">{result.error}</p></CardContent></Card>
            ) : (
              <>
                {/* Structured Impression */}
                <Card className="border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-purple-50">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500 mb-1">Primary Diagnosis (ICCS)</p>
                    <p className="text-lg font-bold text-violet-800">{result.primary_diagnosis}</p>
                    {result.pattern_classification?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.pattern_classification.map((p, i) => (
                          <Badge key={i} className="bg-violet-100 text-violet-800 text-xs">{p}</Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-slate-700 mt-3 leading-relaxed">{result.structured_impression}</p>
                  </CardContent>
                </Card>

                {/* Bladder Hostility Grade */}
                {hostilityGrade && (
                  <Card className={`border-2 ${hostilityGrade.grade >= 4 ? "border-red-400" : "border-orange-300"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${hostilityGrade.color}`}>
                          {hostilityGrade.grade}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Bladder Hostility: {hostilityGrade.label}</p>
                          <p className="text-xs text-slate-500">{result.bladder_hostility_justification}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Red flags */}
                {result.red_flags?.length > 0 && (
                  <Card className="border-2 border-red-400 bg-red-50">
                    <CardContent className="p-3">
                      <p className="font-bold text-red-800 text-sm flex items-center gap-1 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Red Flags
                      </p>
                      {result.red_flags.map((f, i) => (
                        <p key={i} className="text-xs text-red-700 flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />{f}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Key parameters */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Renal Risk", value: result.renal_risk, color: "bg-red-50 border-red-200" },
                    { label: "Unsafe Bladder", value: result.unsafe_bladder, color: "bg-orange-50 border-orange-200" },
                    { label: "DO Assessment", value: result.detrusor_overactivity, color: "bg-purple-50 border-purple-200" },
                    { label: "DSD Present", value: result.dsd_present, color: "bg-blue-50 border-blue-200" },
                    { label: "CIC Needed", value: result.cic_recommendation, color: "bg-teal-50 border-teal-200" },
                    { label: "Anticholinergic", value: result.anticholinergic_recommendation, color: "bg-indigo-50 border-indigo-200" },
                    { label: "Botox", value: result.botox_consideration, color: "bg-amber-50 border-amber-200" },
                    { label: "Augmentation", value: result.augmentation_triggers, color: "bg-rose-50 border-rose-200" },
                  ].map(item => (
                    <Card key={item.label} className={`border ${item.color}`}>
                      <CardContent className="p-2.5">
                        <p className="text-xs font-bold text-slate-500 mb-1">{item.label}</p>
                        <p className="text-xs text-slate-700">{item.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Management steps */}
                {result.management_steps?.length > 0 && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <p className="text-xs font-bold text-blue-700 mb-2 uppercase">Management Plan</p>
                      {result.management_steps.map((m, i) => (
                        <div key={i} className="flex items-start gap-2 mb-2">
                          <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                          <p className="text-xs text-slate-700">{m}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Follow-up intervals */}
                {result.followup_intervals && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-3">
                      <p className="text-xs font-bold text-green-700 mb-2">Follow-up Schedule</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(result.followup_intervals).map(([k, v]) => (
                          <div key={k} className="bg-white rounded-lg p-2 border border-green-100">
                            <p className="text-xs font-semibold text-slate-500 capitalize">{k.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-slate-700 font-medium">{v}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Teaching pearls */}
                {result.teaching_pearls?.length > 0 && (
                  <Card className="border-indigo-200 bg-indigo-50">
                    <CardContent className="p-3">
                      <p className="text-xs font-bold text-indigo-700 mb-2 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> Teaching Pearls
                      </p>
                      {result.teaching_pearls.map((p, i) => (
                        <p key={i} className="text-xs text-slate-700 mb-1">💡 {p}</p>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* References */}
                {result.guideline_references?.length > 0 && (
                  <Card className="border-slate-200">
                    <CardContent className="p-3">
                      <p className="text-xs font-bold text-slate-500 mb-2">Guideline References</p>
                      {result.guideline_references.map((r, i) => (
                        <p key={i} className="text-xs text-slate-600">📖 {r}</p>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}