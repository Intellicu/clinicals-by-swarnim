import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft, Bot, Microscope, Dna, Zap, Brain, Beaker,
  FlaskConical, TestTube, Activity, BookOpen, Loader2, Info,
  Wind, Baby, AlertCircle, Heart, ExternalLink, Layers
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

// ── Built-in AI Analyser definitions ──────────────────────────────────────────
const BUILTIN_ANALYSERS = [
  { id: "lab", name: "Lab Report Analyzer", icon: Microscope, color: "bg-rose-600", group: "Clinical AI",
    desc: "Upload or paste lab results for AI interpretation — CBC, metabolic panel, renal function, LFTs, TDM levels.", page: "ClinicalAIHub", tab: "labs" },
  { id: "biopsy", name: "Renal Biopsy AI", icon: Layers, color: "bg-violet-700", group: "Clinical AI",
    desc: "AI pattern recognition for LM/IF/EM findings. Differentials for nephrotic, nephritic, RPGN patterns.", page: "ClinicalAIHub", tab: "biopsy" },
  { id: "case", name: "Case Analyzer", icon: BookOpen, color: "bg-emerald-700", group: "Clinical AI",
    desc: "Comprehensive AI clinical case analysis — history, investigations, assessment, management plan.", page: "ClinicalAIHub", tab: "case" },
  { id: "differential", name: "Differential Diagnosis", icon: Brain, color: "bg-indigo-600", group: "Clinical AI",
    desc: "Presenting complaint + findings → ranked differentials with supporting/against features.", page: "DifferentialEngine" },
  { id: "radiology", name: "Radiology AI", icon: Activity, color: "bg-sky-700", group: "Clinical AI",
    desc: "USS renal tract, MCU/VCUG, DMSA scan, MAG3 renogram AI interpretation.", page: "ClinicalAIHub", tab: "radiology" },
  { id: "uds", name: "Urine & UDS Analyzer", icon: TestTube, color: "bg-teal-600", group: "Nephrology AI",
    desc: "Urine dipstick, microscopy, and urodynamic study (UDS) AI interpretation for voiding dysfunction.", page: "ClinicalAIHub", tab: "uds" },
  { id: "uroflow", name: "Uroflow AI", icon: Activity, color: "bg-teal-700", group: "Nephrology AI",
    desc: "Uroflowmetry trace analysis — flow pattern, Qmax, voiding time, residual estimation.", page: "UrologyNephrologyHub", tab: "uroflow" },
  { id: "genetic", name: "Genetic Report Analyzer", icon: Dna, color: "bg-violet-600", group: "Nephrology AI",
    desc: "Upload genetic report → AI extracts variant classification, ACMG grading, inheritance, counselling points.", page: "GeneticReportAnalyzer" },
  { id: "rare-lab", name: "Rare Disease Lab AI", icon: FlaskConical, color: "bg-purple-700", group: "Nephrology AI",
    desc: "Enzyme assays, metabolic panels, lysosomal markers for Fabry, cystinosis, Alport, PH1.", page: "RareDiseaseModule" },
  { id: "prescriber", name: "AI Prescriber", icon: Zap, color: "bg-indigo-700", group: "Nephrology AI",
    desc: "Smart prescription builder — patient context + diagnosis → dose-calculated prescription with safety checks.", page: "AIPrescriber" },
  { id: "abg", name: "ABG Interpreter", icon: Wind, color: "bg-rose-600", group: "Pediatrics AI",
    desc: "Arterial blood gas analysis — primary disorder, compensation, anion gap, delta-delta.", page: "ABGInterpreter" },
  { id: "growth", name: "Growth Analyzer", icon: Baby, color: "bg-green-600", group: "Pediatrics AI",
    desc: "WHO Z-score growth analysis, stunting/wasting classification, steroid impact on growth.", page: "GeneralPediatricsHub" },
  { id: "sepsis", name: "Sepsis & Febrile AI", icon: AlertCircle, color: "bg-red-600", group: "Pediatrics AI",
    desc: "Febrile neutropenia, pediatric sepsis screening, PEWS score, empiric antibiotic guidance.", page: "ClinicalAIHub" },
  { id: "htn", name: "Hypertension Engine", icon: Heart, color: "bg-pink-700", group: "Pediatrics AI",
    desc: "BP percentile calculation, stage classification (AAP 2017), secondary HTN workup, treatment algorithm.", page: "ClinicalSupport" },
];

const GROUPS = ["Clinical AI", "Nephrology AI", "Pediatrics AI", "Custom Tools"];

const ICON_MAP = {
  microscope: Microscope, bot: Bot, dna: Dna, zap: Zap,
  brain: Brain, beaker: Beaker, "flask-conical": FlaskConical,
  "test-tube": TestTube, activity: Activity, "book-open": BookOpen,
};
function resolveIcon(name) { return ICON_MAP[name?.toLowerCase()] || Bot; }
const ICON_COLORS = ["bg-blue-600", "bg-violet-600", "bg-cyan-600", "bg-rose-600", "bg-amber-600", "bg-teal-600", "bg-indigo-600"];

// ── Inline Tool Runner (custom DB tools only) ──────────────────────────────────
function ToolRunner({ tool, onClose }) {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    const required = (tool.input_fields || []).filter(f => f.required);
    for (const f of required) {
      if (!inputs[f.name]?.trim()) { toast.error(`Please fill in: ${f.label}`); return; }
    }
    setLoading(true); setResult(null);
    try {
      const inputSummary = (tool.input_fields || []).map(f => `${f.label}: ${inputs[f.name] || "(not provided)"}`).join("\n");
      const prompt = `You are a concise clinical decision-support AI for paediatric nephrology. Answer directly and clinically. Use bullet points.\n\nTOOL: ${tool.name}\n${tool.calculation_logic || tool.description}\n\nPATIENT INPUT:\n${inputSummary}\n\nRespond: 1) Assessment 2) Plan 3) Monitoring`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: { output: { type: "string" } } } });
      setResult(res?.output || JSON.stringify(res, null, 2));
    } catch { toast.error("AI call failed"); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onClose} className="gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</Button>
        <div><h2 className="text-base font-bold text-slate-900">{tool.name}</h2><p className="text-xs text-slate-500">{tool.description}</p></div>
      </div>
      <div className="space-y-3">
        {(tool.input_fields || []).map(field => (
          <div key={field.name}>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            {field.type === "textarea" ? (
              <textarea value={inputs[field.name] || ""} onChange={e => setInputs(p => ({ ...p, [field.name]: e.target.value }))} rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y" placeholder={field.label} />
            ) : (
              <input type={field.type === "number" ? "number" : "text"} value={inputs[field.name] || ""}
                onChange={e => setInputs(p => ({ ...p, [field.name]: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder={field.unit ? `${field.label} (${field.unit})` : field.label} />
            )}
          </div>
        ))}
      </div>
      <Button onClick={handleRun} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analysing…</> : <><Zap className="w-4 h-4 mr-2" />Run AI Analysis</>}
      </Button>
      {loading && <div className="text-center py-8"><Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" /><p className="text-sm text-slate-500">Analysing — may take 15–30 s…</p></div>}
      {result && (
        <Card className="bg-white border border-slate-200"><CardContent className="p-4">
          <p className="text-xs text-indigo-600 mb-3 font-semibold uppercase flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> AI Clinical Output</p>
          <div className="prose prose-sm prose-slate max-w-none text-sm [&>*:first-child]:mt-0"><ReactMarkdown>{result}</ReactMarkdown></div>
        </CardContent></Card>
      )}
      <Alert className="bg-amber-50 border-amber-200">
        <Info className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-xs">AI output is for decision support only. Always exercise independent clinical judgment.</AlertDescription>
      </Alert>
    </div>
  );
}

export default function AIAgentsHub() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState(null);
  const [activeGroup, setActiveGroup] = useState("Clinical AI");

  const { data: customTools = [], isLoading } = useQuery({
    queryKey: ["custom-tools-hub"],
    queryFn: () => base44.entities.CustomTool.list("name", 200),
    staleTime: 60000,
  });

  if (activeTool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 max-w-3xl mx-auto">
        <ToolRunner tool={activeTool} onClose={() => setActiveTool(null)} />
      </div>
    );
  }

  const builtinInGroup = BUILTIN_ANALYSERS.filter(t => t.group === activeGroup);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-5">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Clinical AI Agents Hub</h1>
            <p className="text-blue-200 text-xs">AI-powered diagnostic analysis & clinical decision support · {BUILTIN_ANALYSERS.length} built-in + {customTools.length} custom agents</p>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {GROUPS.map(g => (
            <button key={g} onClick={() => setActiveGroup(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeGroup === g ? "bg-white text-indigo-700" : "bg-white/20 text-white/80 hover:bg-white/30"}`}>
              {g} <span className="opacity-70">({g === "Custom Tools" ? customTools.length : BUILTIN_ANALYSERS.filter(t => t.group === g).length})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto">
        {activeGroup !== "Custom Tools" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {builtinInGroup.map(tool => {
              const Icon = tool.icon;
              const href = createPageUrl(tool.page) + (tool.tab ? `?tab=${tool.tab}` : "");
              return (
                <Card key={tool.id} className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 ${tool.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-snug">{tool.name}</p>
                        <Badge variant="outline" className="text-xs mt-0.5">{tool.group}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1 mb-3">{tool.desc}</p>
                    <Link to={href}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Open Analyser
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-44 animate-pulse border border-slate-200" />)}
              </div>
            ) : customTools.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No custom tools yet. Admins can create tools via the AI Tool Builder.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {customTools.map((tool, idx) => {
                  const Icon = resolveIcon(tool.icon);
                  return (
                    <Card key={tool.id} className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 ${ICON_COLORS[idx % ICON_COLORS.length]} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 leading-snug">{tool.name}</p>
                            <Badge variant="outline" className="text-xs mt-0.5">{tool.category || "Custom"}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1 mb-3">{tool.description}</p>
                        <Button onClick={() => setActiveTool(tool)} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                          <Zap className="w-3.5 h-3.5 mr-1" /> Launch
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}