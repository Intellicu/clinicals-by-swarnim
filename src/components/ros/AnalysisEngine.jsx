import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/client";
import { toast } from "sonner";
import { Sparkles, BarChart3, Table, Loader2, ChevronLeft, Download, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalysisEngine({ project, studyData, onBack }) {
  const [results, setResults] = useState(null);
  const [aiInterpretation, setAiInterpretation] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("descriptive");

  const variables = project.variables || [];
  const numericVars = variables.filter(v => v.type === "Continuous");
  const catVars = variables.filter(v => v.type === "Categorical" || v.type === "Binary");

  // Compute descriptive stats from study data
  const computeDescriptive = () => {
    const records = studyData.map(d => d.data || {});
    const stats = {};

    numericVars.forEach(v => {
      const vals = records.map(r => parseFloat(r[v.name])).filter(x => !isNaN(x));
      if (vals.length === 0) return;
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const sorted = [...vals].sort((a, b) => a - b);
      const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];
      const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / (vals.length - 1);
      const sd = Math.sqrt(variance);
      stats[v.name] = { n: vals.length, mean: mean.toFixed(2), median: median.toFixed(2), sd: sd.toFixed(2), min: Math.min(...vals).toFixed(2), max: Math.max(...vals).toFixed(2) };
    });

    catVars.forEach(v => {
      const vals = records.map(r => r[v.name]).filter(Boolean);
      const freq = {};
      vals.forEach(val => { freq[val] = (freq[val] || 0) + 1; });
      stats[v.name] = { n: vals.length, frequencies: freq, percentages: Object.fromEntries(Object.entries(freq).map(([k, c]) => [k, ((c / vals.length) * 100).toFixed(1)])) };
    });

    return stats;
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const stats = computeDescriptive();
      setResults(stats);

      const prompt = `Interpret the following research data analysis for a ${project.study_type} study titled "${project.title}":

Research Question: ${project.pico?.structured_question || project.pico?.outcome}
Sample size: ${studyData.length} participants

Descriptive Statistics:
${Object.entries(stats).map(([varName, s]) =>
  s.frequencies
    ? `${varName}: n=${s.n}, distribution: ${Object.entries(s.frequencies).map(([k, v]) => `${k}=${v}(${s.percentages[k]}%)`).join(', ')}`
    : `${varName}: n=${s.n}, mean=${s.mean}±${s.sd}, median=${s.median}, range=${s.min}-${s.max}`
).join('\n')}

Provide: 1) Baseline characteristics summary (Table 1 narrative), 2) Key findings interpretation, 3) Statistical significance comments where applicable, 4) Clinical significance of findings, 5) Limitations based on data, 6) Suggested follow-up analyses.`;

      const interp = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });
      setAiInterpretation(interp);
      toast.success("Analysis complete!");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const buildChartData = (varName, stats) => {
    if (!stats[varName]) return [];
    if (stats[varName].frequencies) {
      return Object.entries(stats[varName].frequencies).map(([name, value]) => ({ name, value }));
    }
    return [{ name: varName, mean: parseFloat(stats[varName].mean), sd: parseFloat(stats[varName].sd) }];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ChevronLeft className="w-4 h-4" />Back</Button>
        <div>
          <h2 className="font-bold text-slate-900">{project.title}</h2>
          <p className="text-xs text-slate-500">Analysis Engine — {studyData.length} records</p>
        </div>
      </div>

      {studyData.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No data collected yet. Add data through the Data Collection forms.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {["descriptive", "charts", "ai_interpretation"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === tab ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}>
                {tab === "descriptive" ? "Descriptive Stats" : tab === "charts" ? "Charts" : "AI Interpretation"}
              </button>
            ))}
          </div>

          {activeTab === "descriptive" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-slate-700">Table 1 — Baseline Characteristics</p>
                <Button size="sm" onClick={runAnalysis} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 gap-1">
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calculator className="w-3 h-3" />}
                  {loading ? "Analyzing..." : "Run Analysis"}
                </Button>
              </div>

              {results && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-indigo-50">
                        <th className="p-2 text-left border border-indigo-200 font-semibold">Variable</th>
                        <th className="p-2 border border-indigo-200 font-semibold">N</th>
                        <th className="p-2 border border-indigo-200 font-semibold">Value</th>
                        <th className="p-2 border border-indigo-200 font-semibold">Range / Distribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(results).map(([varName, s], i) => (
                        <tr key={varName} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="p-2 border font-medium text-slate-800">{varName}</td>
                          <td className="p-2 border text-center text-slate-600">{s.n}</td>
                          <td className="p-2 border text-slate-700">
                            {s.frequencies
                              ? Object.entries(s.frequencies).map(([k, v]) => `${k}: ${v} (${s.percentages[k]}%)`).join(", ")
                              : `Mean: ${s.mean} ± ${s.sd}`
                            }
                          </td>
                          <td className="p-2 border text-slate-500">
                            {s.frequencies ? `n=${s.n} total` : `Median: ${s.median}, Range: ${s.min}–${s.max}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!results && <p className="text-sm text-slate-400 text-center py-8">Click "Run Analysis" to compute statistics</p>}
            </div>
          )}

          {activeTab === "charts" && results && (
            <div className="space-y-4">
              {Object.entries(results).map(([varName, s]) => (
                <Card key={varName}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{varName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {s.frequencies ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={buildChartData(varName, results)} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {buildChartData(varName, results).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-2xl font-bold text-indigo-600">{s.mean}</p>
                        <p className="text-sm text-slate-500">± {s.sd} (SD)</p>
                        <p className="text-xs text-slate-400">Median: {s.median} | Range: {s.min}–{s.max}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "ai_interpretation" && (
            <div className="space-y-3">
              {!aiInterpretation ? (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-indigo-300" />
                  <p className="text-slate-500 mb-4">Run analysis first to generate AI interpretation</p>
                  <Button onClick={runAnalysis} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 gap-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {loading ? "Analyzing..." : "Run Analysis & Interpret"}
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-slate-800 whitespace-pre-wrap">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-indigo-700">AI Statistical Interpretation</span>
                    <Badge className="bg-amber-100 text-amber-700 text-xs">claude-sonnet</Badge>
                  </div>
                  {aiInterpretation}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}