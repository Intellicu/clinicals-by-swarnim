import React, { useState } from "react";
import { base44 } from "@/api/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronDown, ChevronUp, AlertTriangle, GitBranch, FileText,
  BookOpen, RefreshCw, Loader2, CheckCircle, Edit2, Save, X,
  Zap, Activity, Pill, Shield
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { URGENCY_CONFIG, CATEGORY_COLORS } from "@/lib/rheumatology/RheumConditions";

// ── Flow chart components (mirrors GN architecture) ─────────────────────────
function FlowStep({ step, index, total, color = "blue" }) {
  const colors = {
    blue: "bg-blue-600 border-blue-700",
    red: "bg-red-600 border-red-700",
    green: "bg-green-600 border-green-700",
    amber: "bg-amber-500 border-amber-600",
    purple: "bg-purple-600 border-purple-700",
    slate: "bg-slate-600 border-slate-700",
  };
  return (
    <div className="flex flex-col items-center">
      <div className={`w-full rounded-lg px-3 py-2 text-white text-xs font-medium text-center border-b-2 ${colors[color] || colors.blue}`}>
        <span className="opacity-60 mr-1">{index}.</span>{step}
      </div>
      {index < total && <div className="w-0.5 h-4 bg-slate-300 my-1" />}
    </div>
  );
}

function DecisionNode({ question, yes, no }) {
  return (
    <div className="border-2 border-dashed border-amber-400 rounded-lg p-3 bg-amber-50 my-2">
      <p className="text-xs font-bold text-amber-900 text-center mb-2">❓ {question}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-100 border border-green-300 rounded p-2 text-xs text-center">
          <span className="font-bold text-green-700">YES →</span><br />{yes}
        </div>
        <div className="bg-red-100 border border-red-300 rounded p-2 text-xs text-center">
          <span className="font-bold text-red-700">NO →</span><br />{no}
        </div>
      </div>
    </div>
  );
}

// ── Main card component ──────────────────────────────────────────────────────
export default function RheumPathwayCard({ condition, isAdmin, savedUpdates, onSaveUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [aiUpdate, setAiUpdate] = useState(savedUpdates?.[condition.id] || null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  const urgency = URGENCY_CONFIG[condition.urgency] || URGENCY_CONFIG.medium;
  const catColor = CATEGORY_COLORS[condition.category] || "bg-slate-100 text-slate-700";

  const fetchUpdate = async () => {
    setLoadingUpdate(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a pediatric rheumatologist. Provide LATEST 2024–2025 evidence updates for: ${condition.name}. Focus on: new drug approvals (cite trial names), updated ACR/EULAR guidelines, emerging therapies, pediatric-specific updates, key changes from previous recommendations. Use bullet points. Be concise.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
      });
      setAiUpdate(result);
      if (onSaveUpdate) onSaveUpdate(condition.id, result);
      toast.success("Evidence updated");
    } catch {
      toast.error("Update failed — check connection");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const saveAdminNote = () => {
    if (onSaveUpdate) {
      onSaveUpdate(condition.id + "_note", editNotes);
      toast.success("Admin note saved");
    }
    setEditMode(false);
  };

  const tabs = [
    { id: "overview", label: "📋 Overview" },
    { id: "flowchart", label: "🔀 Algorithm" },
    { id: "criteria", label: "📊 Criteria" },
    { id: "drugs", label: "💊 Drugs" },
    { id: "monitoring", label: "📈 Monitoring" },
    { id: "refs", label: "📚 Refs" },
  ];

  return (
    <Card className={`bg-white shadow-sm border-2 ${
      condition.urgency === "critical" ? "border-red-200" :
      condition.urgency === "high" ? "border-amber-200" : "border-slate-200"
    }`}>
      {/* ── Header (always visible) ── */}
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-sm text-slate-900">{condition.name}</span>
              <Badge className={`text-xs border ${urgency.color}`}>{urgency.label}</Badge>
              <Badge className={`text-xs ${catColor}`}>{condition.category}</Badge>
            </div>
            <div className="flex gap-1 flex-wrap">
              {condition.tags?.slice(0, 5).map(t => (
                <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">📚 {condition.guideline}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isAdmin && (
              <Button size="icon" variant="ghost" className="h-7 w-7"
                onClick={e => { e.stopPropagation(); setEditMode(true); setExpanded(true); }}>
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </CardHeader>

      {/* ── Expanded content ── */}
      {expanded && (
        <CardContent className="pt-0 px-4 pb-4 space-y-3">
          {/* Admin edit mode */}
          {editMode && isAdmin && (
            <div className="bg-purple-50 border border-dashed border-purple-300 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-purple-800">✏️ Admin Note / Annotation</p>
              <Textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Add curated update, guideline change note, or version annotation…"
                className="text-xs min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-600 text-xs" onClick={saveAdminNote}>
                  <Save className="w-3 h-3 mr-1" />Save Note
                </Button>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => setEditMode(false)}>
                  <X className="w-3 h-3 mr-1" />Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Tab nav */}
          <div className="flex gap-1 border-b pb-2 flex-wrap">
            {tabs.map(t => (
              <Button key={t.id} size="sm"
                variant={activeTab === t.id ? "default" : "ghost"}
                onClick={() => setActiveTab(t.id)}
                className={`text-xs h-7 ${activeTab === t.id ? "bg-purple-600" : ""}`}>
                {t.label}
              </Button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-3 border">
                <p className="text-xs text-slate-700 leading-relaxed">{condition.overview}</p>
              </div>
              {condition.variants && (
                <div className="flex gap-1 flex-wrap">
                  {condition.variants.map(v => (
                    <Badge key={v} className="bg-indigo-100 text-indigo-800 text-xs">{v}</Badge>
                  ))}
                </div>
              )}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Key Management Points</p>
                {condition.key_points?.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs p-2 bg-slate-50 rounded border">
                    <span className="font-bold text-purple-600 flex-shrink-0">{i + 1}.</span>
                    <span className="text-slate-800">{pt}</span>
                  </div>
                ))}
              </div>
              {condition.emergency_flags?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />Emergency Red Flags
                  </p>
                  {condition.emergency_flags.map((f, i) => (
                    <p key={i} className="text-xs text-red-800 font-medium">• {f}</p>
                  ))}
                </div>
              )}
              {condition.prognosis && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-green-800 mb-1">📊 Prognosis</p>
                  <p className="text-xs text-green-700">{condition.prognosis}</p>
                </div>
              )}
            </div>
          )}

          {/* ── FLOWCHART/ALGORITHM ── */}
          {activeTab === "flowchart" && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase">Clinical Algorithm</p>
              <div className="max-w-md mx-auto">
                {condition.flowchart?.map((step, i) => (
                  <FlowStep key={i} step={step} index={i + 1} total={condition.flowchart.length}
                    color={
                      i === 0 ? "slate" :
                      i === condition.flowchart.length - 1 ? "green" :
                      condition.urgency === "critical" ? "red" : "purple"
                    }
                  />
                ))}
              </div>
              {condition.decision_nodes?.map((dn, i) => (
                <DecisionNode key={i} question={dn.q} yes={dn.yes} no={dn.no} />
              ))}
            </div>
          )}

          {/* ── CRITERIA ── */}
          {activeTab === "criteria" && (
            <div className="space-y-3">
              {condition.classification && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-blue-900 mb-1">🏷️ Classification</p>
                  <p className="text-xs text-blue-800">{condition.classification}</p>
                </div>
              )}
              {condition.diagnostic_criteria?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-2">Diagnostic Criteria</p>
                  {condition.diagnostic_criteria.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs p-1.5 rounded bg-slate-50 border mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DRUGS ── */}
          {activeTab === "drugs" && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Therapeutic Agents</p>
              {condition.drugs?.map((drug, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs">
                  <Pill className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="text-blue-900 font-medium">{drug}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── MONITORING ── */}
          {activeTab === "monitoring" && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Monitoring Protocol</p>
              {condition.monitoring?.map((m, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-teal-50 border border-teal-100 rounded-lg text-xs">
                  <Activity className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-teal-900">{m}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── REFERENCES ── */}
          {activeTab === "refs" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-800 text-xs border-0">Evidence: {condition.evidence_grade}</Badge>
                {condition.last_updated && (
                  <Badge variant="outline" className="text-xs">Updated: {condition.last_updated}</Badge>
                )}
                {condition.review_status === "EXPERT_REVIEWED" && (
                  <Badge className="bg-green-100 text-green-800 text-xs border-0">✓ Expert Reviewed</Badge>
                )}
              </div>
              {condition.refs?.map((ref, i) => (
                <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-600 hover:underline p-2 bg-blue-50 rounded border border-blue-200">
                  <BookOpen className="w-3 h-3 flex-shrink-0" />{ref.title}
                </a>
              ))}
            </div>
          )}

          {/* ── Evidence update section ── */}
          <div className="border-t pt-3">
            <Button size="sm" variant="outline" onClick={fetchUpdate} disabled={loadingUpdate}
              className="w-full text-xs border-green-300 text-green-700 hover:bg-green-50">
              {loadingUpdate
                ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Fetching latest evidence…</>
                : <><RefreshCw className="w-3 h-3 mr-1" />🌐 Get Latest 2024–25 Updates</>
              }
            </Button>
            {aiUpdate && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-bold text-green-900">Latest Evidence (AI + Web Search)</span>
                  <Badge className="text-xs bg-green-200 text-green-800 ml-auto border-0">Live</Badge>
                </div>
                <ReactMarkdown className="text-xs prose prose-sm prose-green max-w-none [&>*:first-child]:mt-0">
                  {aiUpdate}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}