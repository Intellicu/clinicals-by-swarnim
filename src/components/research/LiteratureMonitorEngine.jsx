import React, { useState, useEffect } from "react";
import { base44 } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  BookOpen, Search, RefreshCw, Sparkles, Loader2,
  TrendingUp, FileText, AlertCircle, CheckCircle2,
  Calendar, ExternalLink, Brain, Filter, Plus, X
} from "lucide-react";

const NEPHROLOGY_QUERIES = [
  "pediatric nephrotic syndrome relapse steroid",
  "childhood AKI outcomes KDIGO",
  "CKD progression children dialysis",
  "pediatric hypertension management",
  "IPNA guidelines pediatric nephrology",
  "focal segmental glomerulosclerosis FSGS children",
  "peritoneal dialysis outcomes pediatric ESRD",
  "levamisole mycophenolate nephrotic children RCT",
];

export default function LiteratureMonitorEngine({ project }) {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [activeTab, setActiveTab] = useState("updates");

  // Auto-populate keywords from project
  React.useEffect(() => {
    if (project && keywords.length === 0) {
      const auto = [];
      if (project.title) auto.push(project.title.substring(0, 50));
      if (project.study_type) auto.push(`pediatric nephrology ${project.study_type}`);
      if (project.pico?.outcome) auto.push(project.pico.outcome.substring(0, 40));
      setKeywords(auto.filter(Boolean).slice(0, 3));
    }
  }, [project]);

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords(prev => [...prev, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const runMonitor = async () => {
    if (!project && keywords.length === 0) { toast.error("Add keywords or select a project first"); return; }
    setLoading(true);
    try {
      const searchTerms = keywords.length > 0 ? keywords : NEPHROLOGY_QUERIES.slice(0, 3);
      const result = await base44.integrations.Core.InvokeLLM({
        model: "claude_sonnet_4_6",
        add_context_from_internet: true,
        prompt: `You are a systematic literature monitor for a pediatric nephrology research project.

Project: "${project?.title || "Pediatric Nephrology Research"}"
Study type: ${project?.study_type || "clinical research"}
Search terms: ${searchTerms.join(", ")}
Population: ${project?.pico?.population || "children with kidney disease"}
Outcome of interest: ${project?.pico?.outcome || "clinical outcomes"}

Perform a comprehensive literature surveillance and return:

1. RECENT HIGH-IMPACT PAPERS (last 1–2 years): Find 5–8 relevant recent publications on PubMed/journals
2. GUIDELINE UPDATES: Any recent updates to KDIGO, IPNA, ISN, IAP, ESPN guidelines relevant to this topic
3. TRENDING STUDIES: What research directions are currently prominent in this area
4. NEW EVIDENCE: Key recent findings that may impact the current project's methodology or interpretation
5. EVIDENCE GAPS: What this project addresses that recent literature has not

For each paper: provide title, authors (first author + et al), journal, year, key finding, and relevance to this project.`,
        response_json_schema: {
          type: "object",
          properties: {
            recent_papers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  authors: { type: "string" },
                  journal: { type: "string" },
                  year: { type: "number" },
                  key_finding: { type: "string" },
                  relevance: { type: "string" },
                  impact: { type: "string", enum: ["High", "Moderate", "Low"] }
                }
              }
            },
            guideline_updates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  guideline: { type: "string" },
                  update: { type: "string" },
                  implications: { type: "string" }
                }
              }
            },
            trending_topics: { type: "array", items: { type: "string" } },
            new_evidence_summary: { type: "string" },
            evidence_gaps: { type: "array", items: { type: "string" } },
            methodology_suggestions: { type: "array", items: { type: "string" } },
          }
        }
      });
      setResults(result);
      setLastSync(new Date().toISOString());
      toast.success("Literature surveillance complete");
    } catch (e) { toast.error("Sync failed: " + e.message); }
    finally { setLoading(false); }
  };

  const IMPACT_COLORS = {
    High: "bg-red-100 text-red-700 border-red-200",
    Moderate: "bg-amber-100 text-amber-700 border-amber-200",
    Low: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const tabs = [
    { id: "updates", label: "New Evidence", icon: TrendingUp },
    { id: "papers", label: "Recent Papers", icon: BookOpen },
    { id: "guidelines", label: "Guideline Updates", icon: FileText },
    { id: "gaps", label: "Evidence Gaps", icon: Brain },
  ];

  return (
    <div className="space-y-4">
      {/* Search Configuration */}
      <Card className="border-2 border-teal-100">
        <CardHeader className="py-3 px-4 bg-teal-50 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="w-4 h-4 text-teal-600" />Literature Surveillance Configuration
            {lastSync && (
              <span className="ml-auto text-xs font-normal text-teal-600">
                Last sync: {new Date(lastSync).toLocaleTimeString()}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {keywords.map(kw => (
              <Badge key={kw} variant="outline" className="gap-1 pr-1">
                {kw}
                <button onClick={() => setKeywords(prev => prev.filter(k => k !== kw))} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newKeyword} onChange={e => setNewKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addKeyword()}
              placeholder="Add search keyword..." className="text-sm h-8 flex-1" />
            <Button size="sm" variant="outline" onClick={addKeyword} className="h-8 gap-1 text-xs">
              <Plus className="w-3 h-3" />Add
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {NEPHROLOGY_QUERIES.slice(0, 4).map(q => (
              <button key={q} onClick={() => !keywords.includes(q) && setKeywords(prev => [...prev, q])}
                className="text-xs px-2 py-1 bg-slate-100 hover:bg-teal-100 rounded-full text-slate-600 transition-colors">
                + {q}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={runMonitor} disabled={loading} className="bg-teal-600 hover:bg-teal-700 gap-2 h-9">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? "Scanning Literature..." : "Run Literature Scan"}
            </Button>
            <span className="text-xs text-slate-400">Uses AI + web search · ~20–30 seconds</span>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-3">
          {/* Tab navigation */}
          <div className="overflow-x-auto border-b" style={{ scrollbarWidth: "none" }}>
            <div className="flex gap-1 min-w-max">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === t.id ? "border-teal-500 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                  <t.icon className="w-3.5 h-3.5" />{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* New Evidence */}
          {activeTab === "updates" && (
            <div className="space-y-3">
              {results.new_evidence_summary && (
                <Card className="border border-teal-200 bg-teal-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-teal-800 text-sm mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />New Evidence Summary
                    </h4>
                    <p className="text-sm text-teal-900 leading-relaxed">{results.new_evidence_summary}</p>
                  </CardContent>
                </Card>
              )}
              {results.trending_topics?.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-slate-700 text-sm mb-3">Trending Research Directions</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.trending_topics.map((t, i) => (
                        <Badge key={i} className="bg-indigo-100 text-indigo-700">{t}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {results.methodology_suggestions?.length > 0 && (
                <Card className="border border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-amber-800 text-sm mb-2">💡 Methodology Suggestions from Literature</h4>
                    <ul className="space-y-1.5">
                      {results.methodology_suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-amber-900 flex gap-2"><span>•</span>{s}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Recent Papers */}
          {activeTab === "papers" && (
            <div className="space-y-3">
              {results.recent_papers?.map((p, i) => (
                <Card key={i} className={`border ${IMPACT_COLORS[p.impact]?.split(" ")[0] === "bg-red-100" ? "border-red-200" : p.impact === "Moderate" ? "border-amber-200" : "border-slate-200"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={IMPACT_COLORS[p.impact] || "bg-slate-100 text-slate-600"}>{p.impact} Impact</Badge>
                          <span className="text-xs text-slate-500">{p.year} · {p.journal}</span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-1">{p.title}</h4>
                        <p className="text-xs text-slate-600 mb-2">{p.authors}</p>
                        <p className="text-xs text-slate-700 bg-slate-50 rounded p-2 mb-2"><strong>Key finding:</strong> {p.key_finding}</p>
                        <p className="text-xs text-teal-700"><strong>Relevance to your project:</strong> {p.relevance}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Guidelines */}
          {activeTab === "guidelines" && (
            <div className="space-y-3">
              {results.guideline_updates?.length > 0 ? results.guideline_updates.map((g, i) => (
                <Card key={i} className="border border-indigo-200 bg-indigo-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span className="font-semibold text-indigo-800 text-sm">{g.guideline}</span>
                    </div>
                    <p className="text-sm text-indigo-900 mb-2">{g.update}</p>
                    <p className="text-xs text-indigo-700 bg-white/60 rounded p-2">
                      <strong>Implications for your study:</strong> {g.implications}
                    </p>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-300" />
                  <p className="text-sm">No major guideline updates detected for this topic area</p>
                </div>
              )}
            </div>
          )}

          {/* Evidence Gaps */}
          {activeTab === "gaps" && (
            <div className="space-y-3">
              <Card className="border border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-purple-800 text-sm mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />Evidence Gaps — Your Research Contribution
                  </h4>
                  <ul className="space-y-2">
                    {results.evidence_gaps?.map((gap, i) => (
                      <li key={i} className="flex gap-2 text-sm text-purple-900">
                        <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <div className="text-xs text-slate-400 italic">
                AI-identified gaps based on literature search. Use these in your grant Background / Rationale section.
              </div>
            </div>
          )}

          <div className="text-xs text-slate-400 border-t pt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Literature surveillance via AI + web search. Verify abstracts on PubMed before citing.
          </div>
        </div>
      )}

      {!results && !loading && (
        <div className="text-center py-12 text-slate-400">
          <BookOpen className="w-14 h-14 mx-auto mb-3 text-teal-200" />
          <p className="text-sm font-medium text-slate-500">Configure keywords above and run a literature scan</p>
          <p className="text-xs mt-1">Monitors PubMed + Google Scholar + recent nephrology journals</p>
        </div>
      )}
    </div>
  );
}