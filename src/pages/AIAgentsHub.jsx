import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft, Bot, Microscope, Dna, Zap, Brain, Beaker,
  FlaskConical, TestTube, Search, BookOpen, Loader2, Info
} from "lucide-react";
import { toast } from "sonner";

const ICON_MAP = {
  microscope: Microscope, bot: Bot, dna: Dna, zap: Zap,
  brain: Brain, beaker: Beaker, "flask-conical": FlaskConical,
  "test-tube": TestTube, search: Search, "book-open": BookOpen,
};
function resolveIcon(name) { return ICON_MAP[name?.toLowerCase()] || Bot; }

const ICON_COLORS = [
  "bg-blue-600", "bg-violet-600", "bg-cyan-600", "bg-rose-600",
  "bg-amber-600", "bg-teal-600", "bg-indigo-600",
];

// ── Inline Tool Runner ─────────────────────────────────────────
function ToolRunner({ tool, onClose }) {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    const required = (tool.input_fields || []).filter(f => f.required);
    for (const f of required) {
      if (!inputs[f.name]?.trim()) {
        toast.error(`Please fill in: ${f.label}`);
        return;
      }
    }
    setLoading(true);
    setResult(null);
    try {
      const inputSummary = (tool.input_fields || [])
        .map(f => `${f.label}: ${inputs[f.name] || "(not provided)"}`)
        .join("\n");

      const prompt = `${tool.calculation_logic || tool.description}\n\n---\nPATIENT INPUT:\n${inputSummary}\n\nProvide a structured clinical response with clear sections and recommendations.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "claude_sonnet_4_6",
        response_json_schema: {
          type: "object",
          properties: {
            output: { type: "string" }
          }
        }
      });
      setResult(res?.output || JSON.stringify(res, null, 2));
    } catch (e) {
      toast.error("AI call failed: " + (e.message || "Unknown error"));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onClose} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Button>
        <div>
          <h2 className="text-base font-bold text-slate-900">{tool.name}</h2>
          <p className="text-xs text-slate-500">{tool.description}</p>
        </div>
      </div>

      <div className="space-y-3">
        {(tool.input_fields || []).map(field => (
          <div key={field.name}>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                value={inputs[field.name] || ""}
                onChange={e => setInputs(p => ({ ...p, [field.name]: e.target.value }))}
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
                placeholder={field.label}
              />
            ) : field.type === "select" ? (
              <select
                value={inputs[field.name] || ""}
                onChange={e => setInputs(p => ({ ...p, [field.name]: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              >
                <option value="">Select…</option>
                {["Red Flag Screening", "Disease Workup", "Treatment Checklist", "India Access"].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === "number" ? "number" : "text"}
                value={inputs[field.name] || ""}
                onChange={e => setInputs(p => ({ ...p, [field.name]: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder={field.unit ? `${field.label} (${field.unit})` : field.label}
              />
            )}
          </div>
        ))}
      </div>

      <Button onClick={handleRun} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analysing with AI…</> : <><Zap className="w-4 h-4 mr-2" />Run AI Analysis</>}
      </Button>

      {loading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">AI is analysing — this may take 15-30 seconds…</p>
        </div>
      )}

      {result && (
        <Card className="bg-slate-900 border-0">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">AI Clinical Output</p>
            <pre className="text-sm text-green-300 font-mono whitespace-pre-wrap leading-relaxed">{result}</pre>
          </CardContent>
        </Card>
      )}

      <Alert className="bg-amber-50 border-amber-200">
        <Info className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-xs">
          AI output is for clinical decision support only. Always exercise independent clinical judgment and verify with current guidelines.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function AIAgentsHub() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState(null);

  const { data: tools = [], isLoading } = useQuery({
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-5">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Clinical AI Agents</h1>
            <p className="text-blue-200 text-xs">Specialist AI tools for paediatric nephrology clinical decision support</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-44 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No AI tools found</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mt-2 mb-3">{tools.length} AI agent{tools.length !== 1 ? "s" : ""} available</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tools.map((tool, idx) => {
                const Icon = resolveIcon(tool.icon);
                const colorClass = ICON_COLORS[idx % ICON_COLORS.length];
                return (
                  <Card key={tool.id}
                    className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 ${colorClass} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 leading-snug">{tool.name}</p>
                          <Badge variant="outline" className="text-xs mt-0.5">{tool.category || "AI Agent"}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1 mb-3">
                        {tool.description}
                      </p>
                      <Button
                        onClick={() => setActiveTool(tool)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                      >
                        <Zap className="w-3.5 h-3.5 mr-1" /> Launch
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}