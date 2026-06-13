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
  ArrowLeft, Bot, Zap, Beaker, Loader2, Info, ExternalLink
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { CLINICAL_AI_ANALYZERS } from "@/lib/aiAnalyzers";

const GROUPS = ["Clinical AI Center", "Custom Tools"];



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
  const [activeGroup, setActiveGroup] = useState("Clinical AI Center");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-5">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Clinical AI Center</h1>
            <p className="text-blue-200 text-xs">Single source · {CLINICAL_AI_ANALYZERS.length} AI analyzers + {customTools.length} custom tools</p>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {GROUPS.map(g => (
            <button key={g} onClick={() => setActiveGroup(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeGroup === g ? "bg-white text-indigo-700" : "bg-white/20 text-white/80 hover:bg-white/30"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto">
        {activeGroup === "Clinical AI Center" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {CLINICAL_AI_ANALYZERS.map(tool => {
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
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1 mb-3">{tool.desc}</p>
                    <Link to={href}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Open
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <>{isLoading ? (
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
                  const ICON_COLORS = ["bg-blue-600", "bg-violet-600", "bg-cyan-600", "bg-rose-600", "bg-amber-600", "bg-teal-600", "bg-indigo-600"];
                  return (
                    <Card key={tool.id} className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 ${ICON_COLORS[idx % ICON_COLORS.length]} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <Bot className="w-5 h-5 text-white" />
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