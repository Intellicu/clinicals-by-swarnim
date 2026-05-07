import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  ChevronRight, ChevronLeft, Sparkles, CheckCircle2, Circle,
  Calculator, FileText, Users, FlaskConical, BarChart3, Shield,
  BookOpen, Target, Lightbulb, SkipForward, Loader2, Plus, Trash2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STEPS = [
  { id: 0, label: "Research Question", icon: Target, desc: "PICO framework + AI structuring" },
  { id: 1, label: "Study Design", icon: BookOpen, desc: "Select & understand your design" },
  { id: 2, label: "Objectives", icon: Lightbulb, desc: "Primary & secondary objectives" },
  { id: 3, label: "Sample Size", icon: Calculator, desc: "Calculate with formulas" },
  { id: 4, label: "Eligibility", icon: Users, desc: "Inclusion/exclusion criteria" },
  { id: 5, label: "Variables", icon: FlaskConical, desc: "Define study variables" },
  { id: 6, label: "Data Collection", icon: FileText, desc: "Plan + CRF builder" },
  { id: 7, label: "Statistical Plan", icon: BarChart3, desc: "Tests & analysis strategy" },
  { id: 8, label: "Ethics", icon: Shield, desc: "IEC + consent generator" },
  { id: 9, label: "Protocol", icon: BookOpen, desc: "Publication-grade output" },
];

const STUDY_DESIGNS = [
  { value: "RCT", label: "Randomized Controlled Trial", description: "Gold standard — randomly assigns participants to intervention/control. Best for causality.", level: "Advanced" },
  { value: "Cohort", label: "Cohort Study", description: "Follows a group over time. Prospective or retrospective. Good for incidence & risk factors.", level: "Intermediate" },
  { value: "CaseControl", label: "Case-Control Study", description: "Compares cases with disease to controls without. Efficient for rare diseases.", level: "Intermediate" },
  { value: "CrossSectional", label: "Cross-Sectional Study", description: "Snapshot at a point in time. Good for prevalence estimates and correlations.", level: "Beginner" },
  { value: "CaseSeries", label: "Case Series / Report", description: "Describes cases without a control group. Hypothesis generating.", level: "Beginner" },
  { value: "Diagnostic", label: "Diagnostic Accuracy Study", description: "Evaluates sensitivity, specificity of a test against gold standard.", level: "Intermediate" },
  { value: "Systematic", label: "Systematic Review / Meta-analysis", description: "Synthesizes multiple studies. Highest level of evidence.", level: "Advanced" },
];

const STAT_TESTS = [
  { test: "Independent t-test", use: "Compare means of 2 independent groups (normal data)", variables: "Continuous vs Categorical(2)" },
  { test: "Paired t-test", use: "Compare means before/after in same group", variables: "Continuous (paired)" },
  { test: "ANOVA", use: "Compare means of ≥3 groups", variables: "Continuous vs Categorical(≥3)" },
  { test: "Mann-Whitney U", use: "Compare medians of 2 groups (non-normal)", variables: "Ordinal or non-normal continuous" },
  { test: "Chi-Square", use: "Compare proportions/frequencies between groups", variables: "Categorical vs Categorical" },
  { test: "Fisher's Exact", use: "Chi-square for small samples (<5 per cell)", variables: "Categorical vs Categorical (small n)" },
  { test: "Pearson's r", use: "Correlation between 2 continuous normal variables", variables: "Continuous vs Continuous" },
  { test: "Spearman's ρ", use: "Correlation for ordinal or non-normal data", variables: "Ordinal/Non-normal vs Ordinal" },
  { test: "Logistic Regression", use: "Predict binary outcome from multiple predictors", variables: "Binary outcome" },
  { test: "Linear Regression", use: "Predict continuous outcome from predictors", variables: "Continuous outcome" },
  { test: "Kaplan-Meier", use: "Survival analysis, time-to-event data", variables: "Time-to-event + status" },
  { test: "McNemar's test", use: "Paired categorical data (before/after proportions)", variables: "Categorical (paired)" },
];

export default function StudyBuilder({ project, onUpdate, onClose }) {
  const [step, setStep] = useState(project.current_step || 0);
  const [data, setData] = useState({
    pico: project.pico || { population: "", intervention: "", comparison: "", outcome: "", structured_question: "" },
    study_type: project.study_type || "",
    objectives: project.objectives || [""],
    hypothesis: project.hypothesis || "",
    sample_size: project.sample_size || { method: "proportions", p1: "", p2: "", alpha: "0.05", power: "0.80", calculated: null, justification: "" },
    eligibility: project.eligibility || { inclusion: [""], exclusion: [""] },
    variables: project.variables || [{ name: "", type: "Continuous", role: "Primary Outcome", unit: "" }],
    statistical_plan: project.statistical_plan || "",
    statistical_tests: project.statistical_tests || [],
    ethics_status: project.ethics_status || "Not Started",
    iec_number: project.iec_number || "",
    protocol_text: ""
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [saving, setSaving] = useState(false);

  const progress = ((step) / (STEPS.length - 1)) * 100;

  const setField = (path, value) => {
    setData(prev => {
      const parts = path.split(".");
      const copy = { ...prev };
      let obj = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] };
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const aiAssist = async (prompt) => {
    setAiLoading(true);
    setAiOutput("");
    try {
      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setAiOutput(result);
    } catch {
      toast.error("AI assist failed");
    } finally {
      setAiLoading(false);
    }
  };

  const saveAndNext = async () => {
    setSaving(true);
    try {
      const completed = [...new Set([...(project.completed_steps || []), step])];
      const updates = {
        pico: data.pico, study_type: data.study_type, objectives: data.objectives,
        hypothesis: data.hypothesis, sample_size: data.sample_size,
        eligibility: data.eligibility, variables: data.variables,
        statistical_plan: data.statistical_plan, statistical_tests: data.statistical_tests,
        ethics_status: data.ethics_status, iec_number: data.iec_number,
        current_step: Math.min(step + 1, STEPS.length - 1),
        completed_steps: completed
      };
      await base44.entities.ResearchProject.update(project.id, updates);
      onUpdate({ ...project, ...updates });
      if (step < STEPS.length - 1) setStep(s => s + 1);
      toast.success("Saved!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const calcSampleSize = () => {
    const ss = data.sample_size;
    let n = null;
    if (ss.method === "proportions" && ss.p1 && ss.p2) {
      const alpha = parseFloat(ss.alpha) || 0.05;
      const power = parseFloat(ss.power) || 0.80;
      const p1 = parseFloat(ss.p1), p2 = parseFloat(ss.p2);
      const za = alpha === 0.05 ? 1.96 : alpha === 0.01 ? 2.576 : 1.645;
      const zb = power === 0.80 ? 0.84 : power === 0.90 ? 1.28 : 1.645;
      const pbar = (p1 + p2) / 2;
      n = Math.ceil(((za * Math.sqrt(2 * pbar * (1 - pbar)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2) / ((p1 - p2) ** 2));
    } else if (ss.method === "means" && ss.mean_diff && ss.sd) {
      const alpha = parseFloat(ss.alpha) || 0.05;
      const power = parseFloat(ss.power) || 0.80;
      const za = alpha === 0.05 ? 1.96 : 2.576;
      const zb = power === 0.80 ? 0.84 : 1.28;
      const diff = parseFloat(ss.mean_diff), sd = parseFloat(ss.sd);
      n = Math.ceil((2 * ((za + zb) * sd / diff) ** 2));
    }
    if (n) {
      setField("sample_size.calculated", n);
      setField("sample_size.justification", `n = ${n} per group (add 10-20% for dropout → final n ≈ ${Math.ceil(n * 1.15)} per group)`);
    }
  };

  const AIOutput = () => aiOutput ? (
    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-900 whitespace-pre-wrap">
      <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-indigo-600"><Sparkles className="w-3 h-3" />AI Suggestion</div>
      {aiOutput}
    </div>
  ) : null;

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Build your research question using the PICO framework — a structured approach used in evidence-based medicine.</p>
          {[["population", "P — Population / Problem", "e.g., Children aged 1-16 years with nephrotic syndrome"],
            ["intervention", "I — Intervention / Exposure", "e.g., Levamisole as steroid-sparing agent"],
            ["comparison", "C — Comparison", "e.g., Placebo / standard prednisolone alone"],
            ["outcome", "O — Outcome", "e.g., Relapse-free survival at 12 months"]
          ].map(([key, label, ph]) => (
            <div key={key}>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">{label}</label>
              <Input value={data.pico[key]} onChange={e => setField(`pico.${key}`, e.target.value)} placeholder={ph} />
            </div>
          ))}
          <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 gap-1"
            onClick={() => aiAssist(`Structure a formal research question (PICO) and background rationale for a clinical study:
Population: ${data.pico.population}
Intervention: ${data.pico.intervention}
Comparison: ${data.pico.comparison}
Outcome: ${data.pico.outcome}
Generate: 1) A formal structured research question, 2) PECO rationale, 3) Research gap & clinical significance (3-4 sentences), 4) Suggested study design.`)}
            disabled={aiLoading}>
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            AI — Structure My Question
          </Button>
          <AIOutput />
          {data.pico.structured_question && (
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Structured Research Question</label>
              <Textarea value={data.pico.structured_question} onChange={e => setField("pico.structured_question", e.target.value)} rows={2} />
            </div>
          )}
        </div>
      );

      case 1: return (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Select the most appropriate study design. Each design has different strengths, limitations, and evidence hierarchy.</p>
          <div className="grid gap-3">
            {STUDY_DESIGNS.map(d => (
              <div key={d.value}
                onClick={() => setField("study_type", d.value)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${data.study_type === d.value ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{d.label}</span>
                  <Badge className={d.level === "Beginner" ? "bg-green-100 text-green-700" : d.level === "Intermediate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>{d.level}</Badge>
                </div>
                <p className="text-xs text-slate-600">{d.description}</p>
              </div>
            ))}
          </div>
          {data.study_type && (
            <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 gap-1"
              onClick={() => aiAssist(`Explain the ${data.study_type} study design for a medical researcher. Include: 1) Key features and structure, 2) Strengths and limitations, 3) When to use, 4) Key biases to control, 5) Example in pediatric nephrology context. Be educational and clear.`)}
              disabled={aiLoading}>
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Explain {data.study_type} Design
            </Button>
          )}
          <AIOutput />
        </div>
      );

      case 2: return (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Define clear, measurable objectives. Start with one primary objective; secondary objectives are additional.</p>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Objectives (SMART format)</label>
            {data.objectives.map((obj, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Badge className={i === 0 ? "bg-indigo-100 text-indigo-700 shrink-0 self-center" : "bg-slate-100 text-slate-700 shrink-0 self-center"}>{i === 0 ? "Primary" : `2°${i}`}</Badge>
                <Input value={obj} onChange={e => { const arr = [...data.objectives]; arr[i] = e.target.value; setField("objectives", arr); }} placeholder="To determine the prevalence of..." />
                {i > 0 && <Button size="icon" variant="ghost" onClick={() => { const arr = data.objectives.filter((_, j) => j !== i); setField("objectives", arr); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
              </div>
            ))}
            <Button size="sm" variant="outline" className="gap-1 mt-1" onClick={() => setField("objectives", [...data.objectives, ""])}><Plus className="w-3 h-3" />Add Secondary Objective</Button>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Hypothesis (if applicable)</label>
            <Textarea value={data.hypothesis} onChange={e => setField("hypothesis", e.target.value)} placeholder="H0: There is no significant difference... | H1: There is a significant difference..." rows={2} />
          </div>
          <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 gap-1"
            onClick={() => aiAssist(`Refine these research objectives for a ${data.study_type} study about: "${data.pico.structured_question || data.pico.outcome}".
Current objectives: ${data.objectives.join("; ")}
Provide: 1) SMART-formatted primary objective, 2) 2-3 secondary objectives, 3) Null and alternative hypothesis, 4) Measurable outcomes. Use clinical research language.`)}
            disabled={aiLoading}>
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Refine with AI
          </Button>
          <AIOutput />
        </div>
      );

      case 3: return (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Calculate the minimum sample size needed to detect your expected effect with adequate power.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Method</label>
              <Select value={data.sample_size.method} onValueChange={v => setField("sample_size.method", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="proportions">Two Proportions</SelectItem>
                  <SelectItem value="means">Two Means</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Alpha (α)</label>
              <Select value={data.sample_size.alpha} onValueChange={v => setField("sample_size.alpha", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.05">0.05 (95% CI)</SelectItem>
                  <SelectItem value="0.01">0.01 (99% CI)</SelectItem>
                  <SelectItem value="0.10">0.10 (90% CI)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Power (1-β)</label>
              <Select value={data.sample_size.power} onValueChange={v => setField("sample_size.power", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.80">80%</SelectItem>
                  <SelectItem value="0.90">90%</SelectItem>
                  <SelectItem value="0.95">95%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {data.sample_size.method === "proportions" ? (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-slate-700 mb-1 block">P1 (Group 1, 0-1)</label><Input type="number" step="0.01" min="0" max="1" value={data.sample_size.p1} onChange={e => setField("sample_size.p1", e.target.value)} placeholder="e.g. 0.60" /></div>
              <div><label className="text-xs font-semibold text-slate-700 mb-1 block">P2 (Group 2, 0-1)</label><Input type="number" step="0.01" min="0" max="1" value={data.sample_size.p2} onChange={e => setField("sample_size.p2", e.target.value)} placeholder="e.g. 0.35" /></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-slate-700 mb-1 block">Expected Mean Difference</label><Input type="number" value={data.sample_size.mean_diff} onChange={e => setField("sample_size.mean_diff", e.target.value)} /></div>
              <div><label className="text-xs font-semibold text-slate-700 mb-1 block">SD (pooled)</label><Input type="number" value={data.sample_size.sd} onChange={e => setField("sample_size.sd", e.target.value)} /></div>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={calcSampleSize} className="bg-indigo-600 hover:bg-indigo-700 gap-1"><Calculator className="w-4 h-4" />Calculate</Button>
            <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 gap-1"
              onClick={() => aiAssist(`Explain sample size calculation for a ${data.study_type} study with:
Method: ${data.sample_size.method}
Alpha: ${data.sample_size.alpha}, Power: ${data.sample_size.power}
${data.sample_size.method === "proportions" ? `P1: ${data.sample_size.p1}, P2: ${data.sample_size.p2}` : `Mean difference: ${data.sample_size.mean_diff}, SD: ${data.sample_size.sd}`}
Calculated n: ${data.sample_size.calculated}
Provide: 1) Step-by-step formula with values plugged in, 2) Clinical justification for parameters, 3) Dropout adjustment (15-20%), 4) Reference formula. Format as a Methods section paragraph.`)}
              disabled={aiLoading}>
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Explain Calculation
            </Button>
          </div>
          {data.sample_size.calculated && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-xl">
              <p className="text-2xl font-bold text-green-700">{data.sample_size.calculated} <span className="text-base font-normal text-green-600">per group</span></p>
              <p className="text-sm text-green-700 mt-1">{data.sample_size.justification}</p>
              <Textarea className="mt-2 text-xs" rows={2} value={data.sample_size.justification} onChange={e => setField("sample_size.justification", e.target.value)} />
            </div>
          )}
          <AIOutput />
        </div>
      );

      case 4: return (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Define who can and cannot participate. Clear criteria prevent bias and ensure reproducibility.</p>
          <div>
            <label className="text-xs font-semibold text-green-700 mb-2 block">✓ Inclusion Criteria</label>
            {data.eligibility.inclusion.map((c, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input value={c} onChange={e => { const arr = [...data.eligibility.inclusion]; arr[i] = e.target.value; setField("eligibility.inclusion", arr); }} placeholder={`Inclusion criterion ${i + 1}`} />
                <Button size="icon" variant="ghost" onClick={() => { const arr = data.eligibility.inclusion.filter((_, j) => j !== i); setField("eligibility.inclusion", arr); }}><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            ))}
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setField("eligibility.inclusion", [...data.eligibility.inclusion, ""])}><Plus className="w-3 h-3" />Add</Button>
          </div>
          <div>
            <label className="text-xs font-semibold text-red-700 mb-2 block">✗ Exclusion Criteria</label>
            {data.eligibility.exclusion.map((c, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input value={c} onChange={e => { const arr = [...data.eligibility.exclusion]; arr[i] = e.target.value; setField("eligibility.exclusion", arr); }} placeholder={`Exclusion criterion ${i + 1}`} />
                <Button size="icon" variant="ghost" onClick={() => { const arr = data.eligibility.exclusion.filter((_, j) => j !== i); setField("eligibility.exclusion", arr); }}><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            ))}
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setField("eligibility.exclusion", [...data.eligibility.exclusion, ""])}><Plus className="w-3 h-3" />Add</Button>
          </div>
          <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 gap-1"
            onClick={() => aiAssist(`Suggest evidence-based inclusion and exclusion criteria for a ${data.study_type} study:
Research question: ${data.pico.structured_question || data.pico.outcome}
Population: ${data.pico.population}
Provide: Numbered inclusion criteria (5-7), numbered exclusion criteria (5-7). Consider age limits, comorbidities, consent ability, organ function, medications. Format clearly.`)}
            disabled={aiLoading}>
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            AI-Suggest Criteria
          </Button>
          <AIOutput />
        </div>
      );

      case 5: return (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">List all variables you will measure. Classify each by type and role.</p>
          <div className="space-y-3">
            {data.variables.map((v, i) => (
              <div key={i} className="p-3 border rounded-xl bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={v.role === "Primary Outcome" ? "bg-blue-100 text-blue-700" : v.role === "Exposure" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}>{v.role}</Badge>
                  {i > 0 && <Button size="icon" variant="ghost" onClick={() => setField("variables", data.variables.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-400" /></Button>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={v.name} onChange={e => { const arr = [...data.variables]; arr[i] = { ...arr[i], name: e.target.value }; setField("variables", arr); }} placeholder="Variable name" />
                  <Input value={v.unit} onChange={e => { const arr = [...data.variables]; arr[i] = { ...arr[i], unit: e.target.value }; setField("variables", arr); }} placeholder="Unit (mg/dL, kg...)" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={v.type} onValueChange={val => { const arr = [...data.variables]; arr[i] = { ...arr[i], type: val }; setField("variables", arr); }}>
                    <SelectTrigger><SelectValue placeholder="Data type" /></SelectTrigger>
                    <SelectContent>
                      {["Continuous", "Categorical", "Ordinal", "Binary", "Time-to-event"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={v.role} onValueChange={val => { const arr = [...data.variables]; arr[i] = { ...arr[i], role: val }; setField("variables", arr); }}>
                    <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                    <SelectContent>
                      {["Primary Outcome", "Secondary Outcome", "Exposure", "Confounder", "Effect Modifier", "Covariate"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setField("variables", [...data.variables, { name: "", type: "Continuous", role: "Covariate", unit: "" }])}><Plus className="w-3 h-3" />Add Variable</Button>
          <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 gap-1"
            onClick={() => aiAssist(`Suggest a variable list for a ${data.study_type} study on: "${data.pico.structured_question || data.pico.outcome}".
Provide: 1) Primary outcome variable with measurement method, 2) 3-4 secondary outcome variables, 3) Key exposure/intervention variables, 4) 5-6 confounders to measure, 5) Sociodemographic variables. For each: name, type (continuous/categorical/binary), measurement method, unit.`)}
            disabled={aiLoading}>
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Suggest Variables
          </Button>
          <AIOutput />
        </div>
      );

      case 6: return (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Plan how and when data will be collected. A CRF will be created automatically from your variables.</p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-semibold text-blue-800 mb-2">Auto-generated CRF fields from your variables:</p>
            {data.variables.filter(v => v.name).map((v, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-blue-100 last:border-0">
                <span className="text-sm text-blue-900">{v.name}</span>
                <div className="flex gap-1">
                  <Badge className="bg-blue-100 text-blue-700 text-xs">{v.type}</Badge>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">{v.unit}</Badge>
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Data Collection Plan (narrative)</label>
            <Textarea value={data.statistical_plan} onChange={e => setField("statistical_plan", e.target.value)} placeholder="Describe: when data is collected (baseline, 3 months, 6 months...), who collects it, data source (clinical records, lab reports, direct measurement)..." rows={4} />
          </div>
          <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 gap-1"
            onClick={() => aiAssist(`Write a data collection plan for a ${data.study_type} study. Variables: ${data.variables.map(v => v.name).join(", ")}. Study duration: estimated. Include: 1) Timeline with visits/timepoints, 2) Data source for each variable, 3) Who collects data, 4) Quality control measures, 5) Missing data management strategy. Format as a Methods section paragraph.`)}
            disabled={aiLoading}>
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            AI — Write Collection Plan
          </Button>
          <AIOutput />
        </div>
      );

      case 7: return (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Select appropriate statistical tests based on your outcome type and comparison groups.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left border">Test</th>
                  <th className="p-2 text-left border">When to Use</th>
                  <th className="p-2 text-left border">Variable Types</th>
                  <th className="p-2 border">Select</th>
                </tr>
              </thead>
              <tbody>
                {STAT_TESTS.map(t => (
                  <tr key={t.test} className={`border-b hover:bg-slate-50 ${data.statistical_tests.includes(t.test) ? "bg-indigo-50" : ""}`}>
                    <td className="p-2 border font-semibold text-indigo-700">{t.test}</td>
                    <td className="p-2 border text-slate-600">{t.use}</td>
                    <td className="p-2 border text-slate-500">{t.variables}</td>
                    <td className="p-2 border text-center">
                      <input type="checkbox" checked={data.statistical_tests.includes(t.test)}
                        onChange={e => {
                          const arr = e.target.checked ? [...data.statistical_tests, t.test] : data.statistical_tests.filter(x => x !== t.test);
                          setField("statistical_tests", arr);
                        }} className="w-4 h-4 accent-indigo-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.statistical_tests.length > 0 && (
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-xs font-semibold text-indigo-700 mb-1">Selected: {data.statistical_tests.join(", ")}</p>
            </div>
          )}
          <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 gap-1"
            onClick={() => aiAssist(`Write a statistical analysis plan for a ${data.study_type} study. Outcome: ${data.pico.outcome}. Variables: ${data.variables.map(v => `${v.name} (${v.type})`).join(", ")}. Tests: ${data.statistical_tests.join(", ")}. Include: 1) Descriptive statistics approach, 2) Primary analysis with test justification, 3) Secondary analyses, 4) Subgroup analyses if applicable, 5) Software (SPSS/R/Stata), 6) Significance level. Write as a formal Methods paragraph.`)}
            disabled={aiLoading}>
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Write Statistical Plan
          </Button>
          <AIOutput />
        </div>
      );

      case 8: return (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Ethics clearance is mandatory for all human research. Generate consent forms and IEC submissions.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Ethics Status</label>
              <Select value={data.ethics_status} onValueChange={v => setField("ethics_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Not Started", "Pending", "Approved", "Waived"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">IEC/IRB Number (if approved)</label>
              <Input value={data.iec_number} onChange={e => setField("iec_number", e.target.value)} placeholder="IEC/2024/XXX" />
            </div>
          </div>
          <div className="grid gap-2">
            <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 gap-1 justify-start"
              onClick={() => aiAssist(`Generate an informed consent form for a ${data.study_type} clinical study titled: "${data.pico.structured_question || 'study on ' + data.pico.outcome}". Include: 1) Study purpose (plain language), 2) What participation involves, 3) Risks and benefits, 4) Confidentiality, 5) Voluntariness and right to withdraw, 6) Contact information section, 7) Signature block (participant, guardian, witness, PI). Use simple language at Grade 8 level.`)}
              disabled={aiLoading}>
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Generate Consent Form
            </Button>
            <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 gap-1 justify-start"
              onClick={() => aiAssist(`Write an IEC (Institutional Ethics Committee) application covering: Study title: "${data.pico.structured_question}", Design: ${data.study_type}, Sample size: ${data.sample_size.calculated || 'TBD'} with justification, Ethical considerations: risk-benefit, vulnerable populations, informed consent process, data confidentiality, compensation. Follow ICMR guidelines format.`)}
              disabled={aiLoading}>
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Draft IEC Submission
            </Button>
          </div>
          <AIOutput />
        </div>
      );

      case 9: return (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-semibold">⭐ Pro Feature — Protocol generation uses advanced AI. Preview available for all users.</p>
          </div>
          <p className="text-sm text-slate-600">Generate a publication-grade research protocol from all your inputs.</p>
          <div className="p-4 bg-slate-50 border rounded-xl space-y-2 text-xs text-slate-700">
            <p><strong>Title:</strong> {project.title}</p>
            <p><strong>Design:</strong> {data.study_type}</p>
            <p><strong>Research Question:</strong> {data.pico.structured_question || data.pico.outcome}</p>
            <p><strong>Sample Size:</strong> {data.sample_size.calculated ? `n=${data.sample_size.calculated}` : "Not calculated"}</p>
            <p><strong>Statistics:</strong> {data.statistical_tests.join(", ") || "Not selected"}</p>
            <p><strong>Ethics:</strong> {data.ethics_status} {data.iec_number}</p>
          </div>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
            onClick={() => aiAssist(`Generate a complete research protocol document for:
Title: ${project.title}
Design: ${data.study_type}
PICO: P=${data.pico.population} | I=${data.pico.intervention} | C=${data.pico.comparison} | O=${data.pico.outcome}
Objectives: ${data.objectives.join("; ")}
Sample size: ${data.sample_size.calculated || 'TBD'} (${data.sample_size.justification})
Eligibility: Inclusion: ${data.eligibility.inclusion.join(", ")} | Exclusion: ${data.eligibility.exclusion.join(", ")}
Variables: ${data.variables.map(v => `${v.name} (${v.type}, ${v.role})`).join(", ")}
Statistical tests: ${data.statistical_tests.join(", ")}
Ethics: ${data.ethics_status}, IEC: ${data.iec_number}

Produce a full protocol with sections: 1. Title page, 2. Background & Rationale, 3. Objectives & Hypothesis, 4. Methodology (design, setting, participants, intervention, outcomes, data collection), 5. Sample Size, 6. Statistical Analysis, 7. Ethical Considerations, 8. Timeline, 9. Budget outline, 10. References (cite KDIGO/IPNA/standard guidelines).`)}
            disabled={aiLoading}>
            {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating Protocol...</> : <><Sparkles className="w-4 h-4" />Generate Full Protocol</>}
          </Button>
          {aiOutput && (
            <div className="p-4 bg-white border border-indigo-200 rounded-xl text-sm whitespace-pre-wrap max-h-96 overflow-y-auto font-mono text-slate-800">
              <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-indigo-600"><Sparkles className="w-3 h-3" />Generated Protocol</div>
              {aiOutput}
            </div>
          )}
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Study Builder</p>
          <h2 className="font-bold text-slate-900 truncate max-w-xs">{project.title}</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>✕ Close</Button>
      </div>

      {/* Progress */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">Step {step + 1} of {STEPS.length}: <strong>{STEPS[step].label}</strong></span>
          <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(i)}
              className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${i === step ? "bg-indigo-600 text-white" : (project.completed_steps || []).includes(i) ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              {(project.completed_steps || []).includes(i) && i !== step ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto p-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {React.createElement(STEPS[step].icon, { className: "w-5 h-5 text-indigo-600" })}
              {STEPS[step].label}
            </CardTitle>
            <p className="text-sm text-slate-500">{STEPS[step].desc}</p>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="gap-1">
            <ChevronLeft className="w-4 h-4" />Back
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400 gap-1" onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}>
              <SkipForward className="w-3 h-3" />Skip
            </Button>
            <Button onClick={saveAndNext} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 gap-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {step === STEPS.length - 1 ? "Finish" : "Save & Next"}
              {step < STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}